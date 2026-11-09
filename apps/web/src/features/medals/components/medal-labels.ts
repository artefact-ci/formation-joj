import type { Continent, MedalType } from '@joj/shared';

export const CONTINENT_LABELS: Record<Continent, string> = {
  afrique: 'Afrique',
  ameriques: 'Amériques',
  asie: 'Asie',
  europe: 'Europe',
  oceanie: 'Océanie',
  refugies: 'Réfugiés',
};

export const MEDAL_TYPE_LABELS: Record<MedalType, string> = {
  gold: 'Or',
  silver: 'Argent',
  bronze: 'Bronze',
};
