import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { DrizzleSportEventRepository } from './drizzle-sport-event.repository';
import { dataExtractions, sportEventEntries, sportEvents } from './results.schema';

const finalId = randomUUID();
const scheduledId = randomUUID();

const events = [
  ['futsal', 'Demi-finale', '2026-11-08T09:00:00.000Z', scheduledId],
  ['athletisme', '100 m hommes, finale', '2026-11-08T18:32:00.000Z', finalId],
  ['athletisme', '3 000 m', '2026-11-08T00:00:00.000Z', randomUUID()],
  ['athletisme', 'Veille', '2026-11-07T23:59:59.999Z', randomUUID()],
  ['athletisme', 'Lendemain', '2026-11-09T00:00:00.000Z', randomUUID()],
] as const;

describe('DrizzleSportEventRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSportEventRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSportEventRepository(connection.db);

    await connection.db.insert(sportEvents).values(
      events.map(([sport, name, startsAt, id]) => ({
        id,
        sport,
        name,
        status: 'finished',
        startsAt: new Date(startsAt),
      })),
    );
    await connection.db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: finalId,
      nationCode: 'ke',
      nationName: 'Kenya',
      competitor: 'Gift Bright',
      rank: 1,
      performance: '10,28 s',
    });
  });

  afterAll(() => connection?.close());

  it('001-AS1: returns only the events of that day, by sport then by time, with their ranking', async () => {
    const found = await repository.listByDay('2026-11-08');

    expect(found.map((event) => event.name)).toEqual([
      '3 000 m',
      '100 m hommes, finale',
      'Demi-finale',
    ]);
    expect(found[1]?.ranking).toEqual([
      {
        rank: 1,
        nationCode: 'ke',
        nationName: 'Kenya',
        competitor: 'Gift Bright',
        performance: '10,28 s',
        mention: null,
      },
    ]);
  });

  it('001-AS2: keeps only the requested sport', async () => {
    const found = await repository.listByDay('2026-11-08', 'athletisme');

    expect(found.map((event) => event.sport)).toEqual(['athletisme', 'athletisme']);
  });

  it('003-AS6: saves and reads a participant registered without a result', async () => {
    await connection.db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: scheduledId,
      nationCode: 'sn',
      nationName: 'Sénégal',
      competitor: 'Équipe du Sénégal',
    });

    const found = await repository.listByDay('2026-11-08', 'futsal');

    expect(found[0]?.athletesOf('sn').map((athlete) => athlete.competitor)).toEqual([
      'Équipe du Sénégal',
    ]);
  });

  it('003-AS6: still refuses a performance without a rank', async () => {
    await expect(
      connection.db.insert(sportEventEntries).values({
        id: randomUUID(),
        eventId: scheduledId,
        nationCode: 'br',
        nationName: 'Brésil',
        competitor: 'Équipe du Brésil',
        performance: '10,28 s',
      }),
    ).rejects.toThrow('Failed query');
  });

  describe('latest results and live events', () => {
    const finalIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
    const event = (
      id: string,
      name: string,
      status: string,
      startsAt: string,
      awardsMedals: boolean,
    ) => ({ id, sport: 'judo', name, status, awardsMedals, startsAt: new Date(startsAt) });

    beforeAll(async () => {
      await connection.db
        .insert(sportEvents)
        .values([
          event(finalIds[0] ?? '', 'Finale 1', 'finished', '2026-11-10T09:00:00.000Z', true),
          event(finalIds[1] ?? '', 'Finale 2', 'finished', '2026-11-11T09:00:00.000Z', true),
          event(finalIds[2] ?? '', 'Finale 3', 'finished', '2026-11-12T09:00:00.000Z', true),
          event(finalIds[3] ?? '', 'Finale 4', 'finished', '2026-11-12T18:00:00.000Z', true),
          event(randomUUID(), 'Manche', 'finished', '2026-11-13T09:00:00.000Z', false),
          event(randomUUID(), 'En cours tard', 'in-progress', '2026-11-13T12:00:00.000Z', true),
          event(randomUUID(), 'En cours tôt', 'in-progress', '2026-11-13T10:00:00.000Z', false),
          event(randomUUID(), 'Programmée', 'scheduled', '2026-11-13T15:00:00.000Z', true),
        ]);
      await connection.db.insert(sportEventEntries).values({
        id: randomUUID(),
        eventId: finalIds[3] ?? '',
        nationCode: 'jp',
        nationName: 'Japon',
        competitor: 'Judoka Japon',
        rank: 1,
        performance: 'Ippon',
      });
    });

    it('004-AS3: reads the latest finished events that award medals, with their ranking', async () => {
      const found = await repository.listLatestFinished(3);

      expect(found.map((sportEvent) => sportEvent.name)).toEqual([
        'Finale 4',
        'Finale 3',
        'Finale 2',
      ]);
      expect(found[0]?.ranking.map((entry) => entry.competitor)).toEqual(['Judoka Japon']);
    });

    it('004-AS6: reads only the events in progress, by time', async () => {
      const found = await repository.listInProgress();

      expect(found.map((sportEvent) => sportEvent.name)).toEqual(['En cours tôt', 'En cours tard']);
    });
  });

  it('005-AS2: finds no data source before any extraction', async () => {
    expect(await repository.findDataSource()).toBeNull();
  });

  it('005-AS2: reads the source of the latest extraction', async () => {
    const extraction = {
      sourceName: 'Wikipédia',
      sourceUrl: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
      license: 'CC BY-SA',
    };
    await connection.db.insert(dataExtractions).values([
      { ...extraction, extractedOn: '2026-11-07' },
      { ...extraction, extractedOn: '2026-11-08' },
    ]);

    expect(await repository.findDataSource()).toEqual({
      name: 'Wikipédia',
      license: 'CC BY-SA',
      url: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
      extractedOn: '2026-11-08',
    });
  });

  it('005-AS1: reads whether the time of an event is known', async () => {
    await connection.db.insert(sportEvents).values([
      {
        id: randomUUID(),
        sport: 'voile',
        name: 'Heure connue',
        status: 'scheduled',
        hasStartTime: true,
        startsAt: new Date('2026-11-13T10:00:00.000Z'),
      },
      {
        id: randomUUID(),
        sport: 'voile',
        name: 'Heure inconnue',
        status: 'scheduled',
        startsAt: new Date('2026-11-13T00:00:00.000Z'),
      },
    ]);

    const found = await repository.listByDay('2026-11-13', 'voile');

    expect(found.map(({ name, hasStartTime }) => [name, hasStartTime])).toEqual([
      ['Heure inconnue', false],
      ['Heure connue', true],
    ]);
  });

  describe('events without a known day', () => {
    const undatedId = randomUUID();

    beforeAll(async () => {
      await connection.db.insert(sportEvents).values({
        id: undatedId,
        sport: 'boxe',
        name: '-51 kg hommes',
        status: 'finished',
        awardsMedals: true,
      });
      await connection.db.insert(sportEventEntries).values({
        id: randomUUID(),
        eventId: undatedId,
        nationCode: 'kz',
        nationName: 'Kazakhstan',
        competitor: 'Boxeur',
        rank: 1,
      });
    });

    it('005-AS3: lists an event without a day, with its ranking', async () => {
      const [event] = await repository.listUndated();

      expect(event).toMatchObject({ id: undatedId, name: '-51 kg hommes', status: 'finished' });
      expect(event?.ranking.map((entry) => entry.competitor)).toEqual(['Boxeur']);
    });

    it('005-AS3: keeps an event without a day out of the latest results', async () => {
      const latest = await repository.listLatestFinished(50);

      expect(latest.map((event) => event.id)).not.toContain(undatedId);
    });
  });
});
