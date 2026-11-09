import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { sportEventEntries, sportEvents } from '../../results/infra/results.schema';
import { DrizzleMedalRepository } from './drizzle-medal.repository';
import { nations } from './medals.schema';

const sprintId = randomUUID();
const longJumpId = randomUUID();
const handballId = randomUUID();
const unfinishedId = randomUUID();
const heatId = randomUUID();

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

describe('DrizzleMedalRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleMedalRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleMedalRepository(connection.db);

    await connection.db.insert(sportEvents).values([
      {
        id: longJumpId,
        sport: 'athletisme',
        name: 'Saut en longueur',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-09T10:00:00.000Z'),
      },
      {
        id: sprintId,
        sport: 'athletisme',
        name: '100 m hommes',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T18:32:00.000Z'),
      },
      {
        id: handballId,
        sport: 'beach-handball',
        name: 'Finale',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T09:00:00.000Z'),
      },
      {
        id: unfinishedId,
        sport: 'athletisme',
        name: 'Relais',
        status: 'in-progress',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T08:00:00.000Z'),
      },
      {
        id: heatId,
        sport: 'voile',
        name: 'Première manche',
        status: 'finished',
        awardsMedals: false,
        startsAt: new Date('2026-11-07T08:00:00.000Z'),
      },
    ]);
    await connection.db
      .insert(sportEventEntries)
      .values([
        entry(sprintId, 'pl', 'Szymon Dolega', 3),
        entry(sprintId, 'ke', 'Gift Bright', 1),
        entry(sprintId, 'cn', 'Hangyu Zhang', 2),
        entry(sprintId, 'fr', 'Quatrième', 4),
        entry(longJumpId, 'sn', 'Sauteur', 1),
        entry(handballId, 'br', 'Équipe du Brésil', 1),
        entry(unfinishedId, 'jp', 'Relayeur', 1),
        entry(heatId, 'fr', 'Véliplanchiste', 1),
      ]);
    await connection.db.insert(nations).values([
      {
        code: 'sn',
        name: 'Sénégal',
        continent: 'afrique',
        announcedGold: 3,
        announcedSilver: 0,
        announcedBronze: 2,
      },
      { code: 'tv', name: 'Tuvalu', continent: 'oceanie' },
    ]);
  });

  afterAll(() => connection?.close());

  it('002-AS5: reads a medal for the first three ranks of finished events, by sport, event then rank', async () => {
    const found = await repository.listMedals();

    expect(
      found.map(({ sport, eventName, type, competitor, nationCode }) => [
        sport,
        eventName,
        type,
        competitor,
        nationCode,
      ]),
    ).toEqual([
      ['athletisme', '100 m hommes', 'gold', 'Gift Bright', 'ke'],
      ['athletisme', '100 m hommes', 'silver', 'Hangyu Zhang', 'cn'],
      ['athletisme', '100 m hommes', 'bronze', 'Szymon Dolega', 'pl'],
      ['athletisme', 'Saut en longueur', 'gold', 'Sauteur', 'sn'],
      ['beach-handball', 'Finale', 'gold', 'Équipe du Brésil', 'br'],
    ]);
  });

  it('002-AS5: reads every nation, with or without a medal', async () => {
    expect(await repository.listNations()).toEqual(
      expect.arrayContaining([
        { code: 'sn', name: 'Sénégal', continent: 'afrique' },
        { code: 'tv', name: 'Tuvalu', continent: 'oceanie' },
      ]),
    );
  });

  it('002-AS5: gives no medal for a finished event that does not award medals', async () => {
    const found = await repository.listMedals();

    expect(found.filter((medal) => medal.eventId === heatId)).toEqual([]);
  });

  it('002-AS6: reads a single medal in the name of a medalist team', async () => {
    const found = await repository.listMedals();

    expect(found.filter((medal) => medal.nationCode === 'br')).toHaveLength(1);
    expect(found.find((medal) => medal.nationCode === 'br')?.competitor).toBe('Équipe du Brésil');
  });

  it('005-AS5: reads the medals announced by the source', async () => {
    expect(await repository.listAnnouncedMedals()).toEqual(
      expect.arrayContaining([
        { nationCode: 'sn', gold: 3, silver: 0, bronze: 2 },
        { nationCode: 'tv', gold: 0, silver: 0, bronze: 0 },
      ]),
    );
  });

  it('005-AS5: saves a medalist without a performance, as in judo', async () => {
    const judoId = randomUUID();
    await connection.db.insert(sportEvents).values({
      id: judoId,
      sport: 'judo',
      name: '-66 kg hommes',
      status: 'finished',
      awardsMedals: true,
      startsAt: new Date('2026-11-13T09:00:00.000Z'),
    });
    await connection.db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: judoId,
      nationCode: 'sn',
      nationName: 'Sénégal',
      competitor: 'Matar Diop',
      rank: 3,
    });

    const found = await repository.listMedals();

    expect(found.find((medal) => medal.eventId === judoId)?.type).toBe('bronze');
  });
});
