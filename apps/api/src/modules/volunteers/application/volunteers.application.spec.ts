import { describe, expect, it } from 'vitest';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { OpenSlot } from './use-cases/open-slot';
import { RegisterVolunteer } from './use-cases/register-volunteer';

const LUTTE_ID = '0199f5c2-0000-7000-8000-000000000001';
const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';
const MORNING = {
  disciplineId: LUTTE_ID,
  startsAt: '2026-11-02T09:00:00.000Z',
  endsAt: '2026-11-02T12:00:00.000Z',
  capacity: 2,
};

function setup() {
  const slots = new InMemorySlotRepository([LUTTE_ID]);
  return { slots, openSlot: new OpenSlot(slots), registerVolunteer: new RegisterVolunteer(slots) };
}

describe('volunteers (application layer)', () => {
  it('001-AS1: opens a slot for an existing discipline and stores it', async () => {
    const { slots, openSlot } = setup();
    const slot = await openSlot.execute(MORNING);

    expect(slot).toMatchObject({
      disciplineId: LUTTE_ID,
      startsAt: new Date(MORNING.startsAt),
      endsAt: new Date(MORNING.endsAt),
      capacity: 2,
      remainingPlaces: 2,
    });
    expect(await slots.findById(slot.id)).toEqual(slot);
  });

  it.each([{ capacity: 0 }, { endsAt: MORNING.startsAt }])(
    '001-AS2: rejects an invalid slot and stores nothing (%j)',
    async (overrides) => {
      const { slots, openSlot } = setup();
      await expect(openSlot.execute({ ...MORNING, ...overrides })).rejects.toMatchObject({
        kind: 'VALIDATION',
      });
      expect(slots.count()).toBe(0);
    },
  );

  it('001-AS3: rejects a slot for an unknown discipline and stores nothing', async () => {
    const { slots, openSlot } = setup();
    await expect(openSlot.execute({ ...MORNING, disciplineId: UNKNOWN_ID })).rejects.toMatchObject({
      code: 'DISCIPLINE_NOT_FOUND',
      kind: 'NOT_FOUND',
    });
    expect(slots.count()).toBe(0);
  });

  it('001-AS6: fills a slot of 2, then refuses the third volunteer', async () => {
    const { slots, openSlot, registerVolunteer } = setup();
    const { id } = await openSlot.execute(MORNING);

    const awa = await registerVolunteer.execute(id, { name: 'Awa', email: 'awa@joj.sn' });
    const moussa = await registerVolunteer.execute(id, { name: 'Moussa', email: 'moussa@joj.sn' });
    expect(awa).toMatchObject({ registration: { name: 'Awa' }, remainingPlaces: 1 });
    expect(moussa).toMatchObject({ registration: { name: 'Moussa' }, remainingPlaces: 0 });

    await expect(
      registerVolunteer.execute(id, { name: 'Fatou', email: 'fatou@joj.sn' }),
    ).rejects.toMatchObject({ code: 'SLOT_FULL', kind: 'CONFLICT' });
    expect((await slots.findById(id))?.registeredCount).toBe(2);
  });

  it('001-AS7: reports an unknown slot as not found', async () => {
    const { registerVolunteer } = setup();
    await expect(
      registerVolunteer.execute(UNKNOWN_ID, { name: 'Awa', email: 'awa@joj.sn' }),
    ).rejects.toMatchObject({ code: 'SLOT_NOT_FOUND', kind: 'NOT_FOUND' });
  });

  it('001-AS8: rejects an invalid volunteer and registers nobody', async () => {
    const { slots, openSlot, registerVolunteer } = setup();
    const { id } = await openSlot.execute(MORNING);

    await expect(
      registerVolunteer.execute(id, { name: ' ', email: 'awa@joj.sn' }),
    ).rejects.toMatchObject({ code: 'VOLUNTEER_NAME_REQUIRED' });
    expect((await slots.findById(id))?.registeredCount).toBe(0);
  });
});
