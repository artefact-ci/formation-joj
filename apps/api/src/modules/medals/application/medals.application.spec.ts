import { randomUUID } from 'node:crypto';
import type { Continent, MedalType, SportSlug } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { Medal } from '../domain/medal';
import type { Nation } from '../domain/nation-standings';
import { InMemoryMedalRepository } from './testing/in-memory-medal.repository';
import { ListMedalGaps } from './use-cases/list-medal-gaps';
import { ListMedals } from './use-cases/list-medals';
import { ListNationStandings } from './use-cases/list-nation-standings';

function nation(code: string, name: string, continent: Continent): Nation {
  return { code, name, continent };
}

function medal(nationCode: string, type: MedalType, sport: SportSlug = 'athletisme'): Medal {
  return Medal.restore({
    id: randomUUID(),
    type,
    sport,
    eventId: randomUUID(),
    eventName: 'Finale',
    competitor: `Athlète ${randomUUID()}`,
    nationCode,
    nationName: nationCode,
  });
}

function medals(nationCode: string, gold: number, silver: number, bronze: number): Medal[] {
  return [
    ...Array.from({ length: gold }, () => medal(nationCode, 'gold')),
    ...Array.from({ length: silver }, () => medal(nationCode, 'silver')),
    ...Array.from({ length: bronze }, () => medal(nationCode, 'bronze')),
  ];
}

describe('medals (application layer)', () => {
  it('002-AS3: keeps the overall rank of the nations of the chosen continent', async () => {
    const repository = new InMemoryMedalRepository(
      [
        ...medals('cn', 4, 0, 0),
        ...medals('ke', 3, 2, 0),
        ...medals('sn', 3, 1, 2),
        ...medals('ma', 3, 1, 1),
      ],
      [
        nation('cn', 'Chine', 'asie'),
        nation('ke', 'Kenya', 'afrique'),
        nation('sn', 'Sénégal', 'afrique'),
        nation('ma', 'Maroc', 'afrique'),
      ],
    );

    const standings = await new ListNationStandings(repository).execute({ continent: 'afrique' });

    expect(standings.map(({ rank, nationName }) => [rank, nationName])).toEqual([
      [2, 'Kenya'],
      [3, 'Sénégal'],
      [4, 'Maroc'],
    ]);
  });

  it('002-AS7: keeps only the medals of the chosen sport and type', async () => {
    const gold = medal('ke', 'gold', 'athletisme');
    const repository = new InMemoryMedalRepository(
      [gold, medal('cn', 'silver', 'athletisme'), medal('no', 'gold', 'judo')],
      [],
    );

    const found = await new ListMedals(repository).execute({ sport: 'athletisme', type: 'gold' });

    expect(found).toEqual([gold]);
  });

  it('002-AS7: returns no medal for a sport without medals', async () => {
    const repository = new InMemoryMedalRepository([medal('ke', 'gold', 'athletisme')], []);

    expect(await new ListMedals(repository).execute({ sport: 'voile' })).toEqual([]);
  });

  it('005-AS5: compares the computed standings with the table of the source', async () => {
    const repository = new InMemoryMedalRepository(
      [...medals('pt', 1, 1, 1), ...medals('ng', 2, 0, 0)],
      [nation('pt', 'Portugal', 'europe'), nation('ng', 'Nigeria', 'afrique')],
      [
        { nationCode: 'pt', gold: 2, silver: 1, bronze: 1 },
        { nationCode: 'ng', gold: 2, silver: 0, bronze: 0 },
      ],
    );

    const gaps = await new ListMedalGaps(repository).execute();

    expect(gaps).toEqual([
      {
        nationCode: 'pt',
        nationName: 'Portugal',
        gold: 1,
        silver: 1,
        bronze: 1,
        announcedGold: 2,
        announcedSilver: 1,
        announcedBronze: 1,
      },
    ]);
  });
});
