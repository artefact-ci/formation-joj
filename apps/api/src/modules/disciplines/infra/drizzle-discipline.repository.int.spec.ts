import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Discipline } from '../domain/discipline';
import { DrizzleDisciplineRepository } from './drizzle-discipline.repository';

const newDiscipline = (name: string, now = new Date()) =>
  Discipline.create({ id: randomUUID(), name, category: 'athletisme', now });

describe('DrizzleDisciplineRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleDisciplineRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleDisciplineRepository(connection.db);
  });

  afterAll(() => connection?.close());

  it('AS1: reads back exactly what it wrote', async () => {
    const discipline = newDiscipline('Aviron', new Date('2026-10-31T09:00:00.123Z'));
    await repository.insert(discipline);

    expect(await repository.findByName('Aviron')).toEqual(discipline);
    expect(await repository.findByName('Inconnue')).toBeNull();
  });

  it('AS4: turns the name unique constraint into a domain error', async () => {
    await repository.insert(newDiscipline('Escrime'));
    await expect(repository.insert(newDiscipline('Escrime'))).rejects.toMatchObject({
      code: 'DISCIPLINE_NAME_TAKEN',
    });
  });

  it('AS5: lists sorted by name', async () => {
    await repository.insert(newDiscipline('Zumba'));
    await repository.insert(newDiscipline('Badminton'));
    const names = (await repository.list()).map((discipline) => discipline.name);
    expect(names).toEqual([...names].sort());
    expect(names).toEqual(expect.arrayContaining(['Badminton', 'Zumba']));
  });
});
