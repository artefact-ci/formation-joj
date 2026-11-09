import type { NationStanding } from './nation-standings';

/** Les médailles qu'une nation a selon le tableau publié par la source. */
export interface AnnouncedMedals {
  nationCode: string;
  gold: number;
  silver: number;
  bronze: number;
}

export interface MedalGap {
  nationCode: string;
  nationName: string;
  gold: number;
  silver: number;
  bronze: number;
  announcedGold: number;
  announcedSilver: number;
  announcedBronze: number;
}

/** Les nations dont le compte calculé sur les podiums diffère du tableau annoncé par la source. */
export function findMedalGaps(
  standings: NationStanding[],
  announced: AnnouncedMedals[],
): MedalGap[] {
  return standings
    .map((standing): MedalGap => {
      const medals = announced.find(({ nationCode }) => nationCode === standing.nationCode);
      return {
        nationCode: standing.nationCode,
        nationName: standing.nationName,
        gold: standing.gold,
        silver: standing.silver,
        bronze: standing.bronze,
        announcedGold: medals?.gold ?? 0,
        announcedSilver: medals?.silver ?? 0,
        announcedBronze: medals?.bronze ?? 0,
      };
    })
    .filter(
      (gap) =>
        gap.gold !== gap.announcedGold ||
        gap.silver !== gap.announcedSilver ||
        gap.bronze !== gap.announcedBronze,
    );
}
