import type { Continent } from '@joj/shared';
import type { Medal } from './medal';

export interface Nation {
  code: string;
  name: string;
  continent: Continent;
}

export interface NationStanding {
  rank: number;
  nationCode: string;
  nationName: string;
  continent: Continent;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

type UnrankedStanding = Omit<NationStanding, 'rank'>;

/**
 * Le classement de toutes les nations : par or, puis argent, puis bronze. Des nations à égalité
 * parfaite partagent le même rang, s'affichent par ordre alphabétique, et la suivante saute les
 * places partagées (1, 1, 3).
 */
export function buildNationStandings(nations: Nation[], medals: Medal[]): NationStanding[] {
  const sorted = nations
    .map((nation) => countMedals(nation, medals))
    .toSorted((a, b) => compareMedals(a, b) || a.nationName.localeCompare(b.nationName, 'fr'));

  const standings: NationStanding[] = [];
  for (const [index, standing] of sorted.entries()) {
    const previous = standings.at(-1);
    const isTied = previous !== undefined && compareMedals(previous, standing) === 0;
    standings.push({ ...standing, rank: isTied ? previous.rank : index + 1 });
  }
  return standings;
}

function countMedals(nation: Nation, medals: Medal[]): UnrankedStanding {
  const won = medals.filter((medal) => medal.nationCode === nation.code);
  return {
    nationCode: nation.code,
    nationName: nation.name,
    continent: nation.continent,
    gold: won.filter((medal) => medal.type === 'gold').length,
    silver: won.filter((medal) => medal.type === 'silver').length,
    bronze: won.filter((medal) => medal.type === 'bronze').length,
    total: won.length,
  };
}

function compareMedals(a: UnrankedStanding, b: UnrankedStanding): number {
  return b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze;
}
