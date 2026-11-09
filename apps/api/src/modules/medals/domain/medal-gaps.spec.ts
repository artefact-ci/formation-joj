import { describe, expect, it } from 'vitest';
import { type AnnouncedMedals, findMedalGaps } from './medal-gaps';
import type { NationStanding } from './nation-standings';

function standing(
  nationCode: string,
  nationName: string,
  [gold, silver, bronze]: [number, number, number],
): NationStanding {
  return {
    rank: 1,
    nationCode,
    nationName,
    continent: 'europe',
    gold,
    silver,
    bronze,
    total: gold + silver + bronze,
  };
}

function announced(
  nationCode: string,
  [gold, silver, bronze]: [number, number, number],
): AnnouncedMedals {
  return { nationCode, gold, silver, bronze };
}

describe('findMedalGaps', () => {
  it('005-AS5: reports a nation whose podiums differ from the table of the source', () => {
    const gaps = findMedalGaps(
      [standing('pt', 'Portugal', [1, 1, 1])],
      [announced('pt', [2, 1, 1])],
    );

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

  it('005-AS5: reports nothing for a nation that matches the table of the source', () => {
    const gaps = findMedalGaps(
      [standing('ng', 'Nigeria', [2, 0, 0])],
      [announced('ng', [2, 0, 0])],
    );

    expect(gaps).toEqual([]);
  });

  it('005-AS5: reports a nation that has medals but is missing from the table', () => {
    const gaps = findMedalGaps([standing('pl', 'Pologne', [0, 0, 1])], []);

    expect(gaps).toMatchObject([{ nationCode: 'pl', bronze: 1, announcedBronze: 0 }]);
  });
});
