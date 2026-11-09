import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { nations } from '../../medals/infra/medals.schema';
import { sportEventEntries, sportEvents } from '../../results/infra/results.schema';
import { DrizzleSearchRepository } from './drizzle-search.repository';

const sprintId = randomUUID();

describe('DrizzleSearchRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSearchRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSearchRepository(connection.db);

    await connection.db
      .insert(nations)
      .values({ code: 'sn', name: 'Sénégal', continent: 'afrique' });
    await connection.db.insert(sportEvents).values({
      id: sprintId,
      sport: 'athletisme',
      name: '100 m hommes, finale',
      status: 'scheduled',
      startsAt: new Date('2026-11-08T18:32:00.000Z'),
    });
    await connection.db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: sprintId,
      nationCode: 'ke',
      nationName: 'Kenya',
      competitor: 'Gift Bright',
    });
  });

  afterAll(() => connection?.close());

  it('004-AS4: loads the nations, the events and their participants', async () => {
    expect(await repository.loadCatalog()).toEqual({
      nations: [{ code: 'sn', name: 'Sénégal' }],
      events: [
        {
          sport: 'athletisme',
          name: '100 m hommes, finale',
          startsAt: new Date('2026-11-08T18:32:00.000Z'),
          participants: [{ competitor: 'Gift Bright', nationCode: 'ke' }],
        },
      ],
    });
  });
});
