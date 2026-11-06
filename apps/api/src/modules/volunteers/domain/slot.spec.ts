import { describe, expect, it } from 'vitest';
import { Slot } from './slot';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const STARTS_AT = new Date('2026-11-02T09:00:00.000Z');
const ENDS_AT = new Date('2026-11-02T12:00:00.000Z');
const DISCIPLINE_ID = '0199f5c2-0000-7000-8000-000000000001';

const openSlot = (overrides: { startsAt?: Date; endsAt?: Date; capacity?: number } = {}) =>
  Slot.create({
    id: '0199f5c2-0000-7000-8000-000000000010',
    disciplineId: DISCIPLINE_ID,
    startsAt: STARTS_AT,
    endsAt: ENDS_AT,
    capacity: 2,
    now: NOW,
    ...overrides,
  });

const volunteer = (name: string, n: number) => ({
  id: `0199f5c2-0000-7000-8000-00000000010${n}`,
  name,
  email: `${name.toLowerCase()}@joj.sn`,
  now: NOW,
});

describe('Slot', () => {
  it('001-AS1: opens a slot with all its places remaining', () => {
    expect(openSlot()).toMatchObject({
      disciplineId: DISCIPLINE_ID,
      startsAt: STARTS_AT,
      endsAt: ENDS_AT,
      capacity: 2,
      remainingPlaces: 2,
      createdAt: NOW,
    });
  });

  it.each([0, -1, 1.5])('001-AS2: rejects a capacity of %d', (capacity) => {
    expect(() => openSlot({ capacity })).toThrow(
      expect.objectContaining({ code: 'SLOT_CAPACITY_INVALID', kind: 'VALIDATION' }),
    );
  });

  it('001-AS2: accepts a capacity of 1', () => {
    expect(openSlot({ capacity: 1 }).remainingPlaces).toBe(1);
  });

  it.each([
    ['equal to', STARTS_AT],
    ['before', new Date('2026-11-02T08:00:00.000Z')],
  ])('001-AS2: rejects an end %s the start', (_label, endsAt) => {
    expect(() => openSlot({ endsAt })).toThrow(
      expect.objectContaining({ code: 'SLOT_TIME_RANGE_INVALID', kind: 'VALIDATION' }),
    );
  });

  it('001-AS4: registers a volunteer and leaves one place', () => {
    const slot = openSlot();
    const registration = slot.register(volunteer('Awa', 1));

    expect(registration).toMatchObject({ slotId: slot.id, name: 'Awa', email: 'awa@joj.sn' });
    expect(slot.remainingPlaces).toBe(1);
  });

  it('001-AS5: accepts the last place and leaves none', () => {
    const slot = openSlot();
    slot.register(volunteer('Awa', 1));
    slot.register(volunteer('Moussa', 2));

    expect(slot.remainingPlaces).toBe(0);
  });

  it('001-AS6: refuses a volunteer on a full slot', () => {
    const slot = openSlot();
    slot.register(volunteer('Awa', 1));
    slot.register(volunteer('Moussa', 2));

    expect(() => slot.register(volunteer('Fatou', 3))).toThrow(
      expect.objectContaining({ code: 'SLOT_FULL', kind: 'CONFLICT' }),
    );
    expect(slot.registeredCount).toBe(2);
  });

  it('001-AS6: refuses a volunteer on a slot restored full', () => {
    const slot = Slot.restore({ ...openSlot().toProps(), registeredCount: 2 });
    expect(() => slot.register(volunteer('Fatou', 3))).toThrow(
      expect.objectContaining({ code: 'SLOT_FULL' }),
    );
  });
});
