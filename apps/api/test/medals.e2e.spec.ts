import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { medalGapListSchema, medalListSchema, nationStandingListSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { nations } from '../src/modules/medals/infra/medals.schema';
import { sportEventEntries, sportEvents } from '../src/modules/results/infra/results.schema';
import { createTestApp } from './create-test-app';

const sprintId = randomUUID();
const judoId = randomUUID();

function entry(eventId: string, nationCode: string, competitor: string, rank: number) {
  return {
    id: randomUUID(),
    eventId,
    nationCode,
    nationName: nationCode.toUpperCase(),
    competitor,
    rank,
    performance: `${rank}`,
  };
}

describe('/api/medals (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    const db = app.get<Database>(DATABASE);
    await db.insert(sportEvents).values([
      {
        id: sprintId,
        sport: 'athletisme',
        name: '100 m hommes',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T18:32:00.000Z'),
      },
      {
        id: judoId,
        sport: 'judo',
        name: '-60 kg hommes',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T10:00:00.000Z'),
      },
    ]);
    await db
      .insert(sportEventEntries)
      .values([
        entry(sprintId, 'ke', 'Gift Bright', 1),
        entry(sprintId, 'cn', 'Hangyu Zhang', 2),
        entry(judoId, 'cn', 'Judoka Chine', 1),
      ]);
    await db.insert(nations).values([
      { code: 'ke', name: 'Kenya', continent: 'afrique', announcedGold: 2 },
      { code: 'cn', name: 'Chine', continent: 'asie', announcedGold: 1, announcedSilver: 1 },
      { code: 'tv', name: 'Tuvalu', continent: 'oceanie' },
    ]);
  });

  afterAll(() => app?.close());

  it('002-AS1: returns the nations in order, with their medals and total', async () => {
    const response = await api().get('/api/medals/standings').expect(200);

    expect(nationStandingListSchema.parse(response.body)).toEqual([
      {
        rank: 1,
        nationCode: 'cn',
        nationName: 'Chine',
        continent: 'asie',
        gold: 1,
        silver: 1,
        bronze: 0,
        total: 2,
      },
      {
        rank: 2,
        nationCode: 'ke',
        nationName: 'Kenya',
        continent: 'afrique',
        gold: 1,
        silver: 0,
        bronze: 0,
        total: 1,
      },
      {
        rank: 3,
        nationCode: 'tv',
        nationName: 'Tuvalu',
        continent: 'oceanie',
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
      },
    ]);
  });

  it('002-AS3: applies the continent filter and keeps the overall rank', async () => {
    const response = await api()
      .get('/api/medals/standings')
      .query({ continent: 'afrique' })
      .expect(200);

    expect(
      nationStandingListSchema
        .parse(response.body)
        .map(({ rank, nationName }) => [rank, nationName]),
    ).toEqual([[2, 'Kenya']]);
  });

  it('002-AS3: rejects an unknown continent (400, RFC 9457)', async () => {
    const response = await api()
      .get('/api/medals/standings')
      .query({ continent: 'atlantide' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('002-AS7: applies the sport and type filters', async () => {
    const response = await api()
      .get('/api/medals')
      .query({ sport: 'athletisme', type: 'gold' })
      .expect(200);

    expect(medalListSchema.parse(response.body)).toEqual([
      expect.objectContaining({
        type: 'gold',
        sport: 'athletisme',
        eventId: sprintId,
        eventName: '100 m hommes',
        competitor: 'Gift Bright',
        nationCode: 'ke',
      }),
    ]);
  });

  it('002-AS7: returns an empty list for a sport without medals', async () => {
    const response = await api().get('/api/medals').query({ sport: 'voile' }).expect(200);

    expect(response.body).toEqual([]);
  });

  it('005-AS5: reports the gaps, and keeps the standings computed from the podiums', async () => {
    const gaps = await api().get('/api/medals/gaps').expect(200);
    expect(medalGapListSchema.parse(gaps.body)).toEqual([
      {
        nationCode: 'ke',
        nationName: 'Kenya',
        gold: 1,
        silver: 0,
        bronze: 0,
        announcedGold: 2,
        announcedSilver: 0,
        announcedBronze: 0,
      },
    ]);

    const standings = await api().get('/api/medals/standings').expect(200);
    expect(nationStandingListSchema.parse(standings.body)[1]).toMatchObject({
      nationCode: 'ke',
      gold: 1,
    });
  });
});
