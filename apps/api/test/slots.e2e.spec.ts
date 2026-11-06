import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, registrationSchema, slotSchema, type SlotResponse } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

describe('/api/creneaux (e2e)', () => {
  let app: INestApplication;
  let lutteId: string;
  const api = () => request(app.getHttpServer());
  const morning = () => ({
    disciplineId: lutteId,
    startsAt: '2026-11-02T09:00:00.000Z',
    endsAt: '2026-11-02T12:00:00.000Z',
    capacity: 2,
  });
  const openSlot = async (): Promise<SlotResponse> => {
    const response = await api().post('/api/creneaux').send(morning()).expect(201);
    return slotSchema.parse(response.body);
  };
  const register = (slotId: string, name: string) =>
    api()
      .post(`/api/creneaux/${slotId}/inscriptions`)
      .send({ name, email: `${name.toLowerCase()}@joj.sn` });

  beforeAll(async () => {
    app = await createTestApp();
    const response = await api()
      .post('/api/disciplines')
      .send({ name: 'Lutte', category: 'sports-de-combat' })
      .expect(201);
    lutteId = disciplineSchema.parse(response.body).id;
  });

  afterAll(() => app?.close());

  it('001-AS1: opens a slot (201) with all its places remaining', async () => {
    const slot = await openSlot();
    expect(slot).toMatchObject({ ...morning(), remainingPlaces: 2 });
  });

  it.each([
    { capacity: 0 },
    { capacity: -1 },
    { capacity: 1.5 },
    { endsAt: '2026-11-02T09:00:00.000Z' },
    { endsAt: '2026-11-02T08:00:00.000Z' },
  ])('001-AS2: rejects an invalid slot (400, %j)', async (overrides) => {
    const response = await api()
      .post('/api/creneaux')
      .send({ ...morning(), ...overrides })
      .expect(400);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('001-AS2: accepts a capacity of 1', async () => {
    const response = await api()
      .post('/api/creneaux')
      .send({ ...morning(), capacity: 1 })
      .expect(201);
    expect(response.body).toMatchObject({ capacity: 1, remainingPlaces: 1 });
  });

  it('001-AS3: rejects a slot for an unknown discipline (404)', async () => {
    const response = await api()
      .post('/api/creneaux')
      .send({ ...morning(), disciplineId: UNKNOWN_ID })
      .expect(404);
    expect(response.body).toMatchObject({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
  });

  it('001-AS4: registers a volunteer (201) and leaves one place', async () => {
    const slot = await openSlot();
    const response = await register(slot.id, 'Awa').expect(201);

    expect(registrationSchema.parse(response.body)).toMatchObject({
      slotId: slot.id,
      name: 'Awa',
      email: 'awa@joj.sn',
      remainingPlaces: 1,
    });
  });

  it('001-AS5: accepts the last place (201) and leaves none', async () => {
    const slot = await openSlot();
    await register(slot.id, 'Awa').expect(201);

    const response = await register(slot.id, 'Moussa').expect(201);
    expect(response.body).toMatchObject({ name: 'Moussa', remainingPlaces: 0 });
  });

  it('001-AS6: refuses a volunteer on a full slot (409 SLOT_FULL)', async () => {
    const slot = await openSlot();
    await register(slot.id, 'Awa').expect(201);
    await register(slot.id, 'Moussa').expect(201);

    const response = await register(slot.id, 'Fatou').expect(409);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 409, code: 'SLOT_FULL' });
  });

  it('001-AS7: answers 404 for an unknown slot', async () => {
    const response = await register(UNKNOWN_ID, 'Awa').expect(404);
    expect(response.body).toMatchObject({ status: 404, code: 'SLOT_NOT_FOUND' });
  });

  it.each([
    { name: '', email: 'awa@joj.sn' },
    { name: '   ', email: 'awa@joj.sn' },
    { name: 'Awa', email: 'awa' },
  ])('001-AS8: rejects an invalid volunteer (400, %j) and registers nobody', async (body) => {
    const slot = await openSlot();
    const response = await api()
      .post(`/api/creneaux/${slot.id}/inscriptions`)
      .send(body)
      .expect(400);
    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    // Personne n'est inscrit : les deux places restent libres.
    await register(slot.id, 'Awa').expect(201);
    const last = await register(slot.id, 'Moussa').expect(201);
    expect(last.body).toMatchObject({ remainingPlaces: 0 });
  });
});
