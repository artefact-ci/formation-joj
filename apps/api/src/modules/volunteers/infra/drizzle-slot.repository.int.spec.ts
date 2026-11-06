import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Discipline } from '../../disciplines/domain/discipline';
import { DrizzleDisciplineRepository } from '../../disciplines/infra/drizzle-discipline.repository';
import { Slot } from '../domain/slot';
import { DrizzleSlotRepository } from './drizzle-slot.repository';

const NOW = new Date('2026-10-31T09:00:00.123Z');

describe('DrizzleSlotRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSlotRepository;
  let disciplineId: string;

  const openSlot = (capacity: number) =>
    Slot.create({
      id: randomUUID(),
      disciplineId,
      startsAt: new Date('2026-11-02T09:00:00.000Z'),
      endsAt: new Date('2026-11-02T12:00:00.000Z'),
      capacity,
      now: NOW,
    });
  const volunteer = (name: string) => ({
    id: randomUUID(),
    name,
    email: `${name.toLowerCase()}@joj.sn`,
    now: NOW,
  });

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSlotRepository(connection.db);
    const lutte = Discipline.create({
      id: randomUUID(),
      name: 'Lutte',
      category: 'sports-de-combat',
      now: NOW,
    });
    await new DrizzleDisciplineRepository(connection.db).insert(lutte);
    disciplineId = lutte.id;
  });

  afterAll(() => connection?.close());

  it('001-AS1: reads back exactly the slot it wrote', async () => {
    const slot = openSlot(2);
    await repository.insert(slot);

    expect(await repository.findById(slot.id)).toEqual(slot);
    expect(await repository.findById(randomUUID())).toBeNull();
  });

  it('001-AS3: knows which disciplines exist', async () => {
    expect(await repository.disciplineExists(disciplineId)).toBe(true);
    expect(await repository.disciplineExists(randomUUID())).toBe(false);
  });

  it('001-AS6: counts registrations and refuses one beyond the capacity', async () => {
    const slot = openSlot(2);
    await repository.insert(slot);
    await repository.addRegistration(slot.register(volunteer('Awa')));
    await repository.addRegistration(slot.register(volunteer('Moussa')));

    const stale = Slot.restore({ ...slot.toProps(), registeredCount: 0 });
    await expect(
      repository.addRegistration(stale.register(volunteer('Fatou'))),
    ).rejects.toMatchObject({ code: 'SLOT_FULL' });
    expect((await repository.findById(slot.id))?.registeredCount).toBe(2);
  });

  it('001-AS6: accepts only one of two simultaneous registrations on the last place', async () => {
    const slot = openSlot(1);
    await repository.insert(slot);
    const [first, second] = [slot, Slot.restore(slot.toProps())].map((copy, n) =>
      copy.register(volunteer(n === 0 ? 'Awa' : 'Moussa')),
    );

    const results = await Promise.allSettled([
      repository.addRegistration(first!),
      repository.addRegistration(second!),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')).toMatchObject({
      reason: { code: 'SLOT_FULL' },
    });
    expect((await repository.findById(slot.id))?.registeredCount).toBe(1);
  });
});
