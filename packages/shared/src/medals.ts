import { z } from 'zod';
import { sportSlugSchema } from './results.ts';

/** Liste fermée des continents ; les libellés français sont côté front. */
/** `refugies` : l'équipe olympique des réfugiés ne représente aucun continent. */
export const CONTINENTS = [
  'afrique',
  'ameriques',
  'asie',
  'europe',
  'oceanie',
  'refugies',
] as const;
export const continentSchema = z.enum(CONTINENTS);
export type Continent = z.infer<typeof continentSchema>;

export const MEDAL_TYPES = ['gold', 'silver', 'bronze'] as const;
export const medalTypeSchema = z.enum(MEDAL_TYPES);
export type MedalType = z.infer<typeof medalTypeSchema>;

/** Le code du Sénégal, pays hôte, dont l'écran met la ligne en évidence. */
export const HOST_NATION = 'sn';

/** Paramètres de `GET /api/medals/standings`. */
export const nationStandingsQuerySchema = z.object({
  continent: continentSchema.optional(),
});
export type NationStandingsQuery = z.infer<typeof nationStandingsQuerySchema>;

/** Paramètres de `GET /api/medals`. */
export const medalsQuerySchema = z.object({
  sport: sportSlugSchema.optional(),
  type: medalTypeSchema.optional(),
});
export type MedalsQuery = z.infer<typeof medalsQuerySchema>;

/** Une ligne du classement des nations. */
export const nationStandingSchema = z.object({
  rank: z.number().int().positive(),
  nationCode: z.string(),
  nationName: z.string(),
  continent: continentSchema,
  gold: z.number().int().nonnegative(),
  silver: z.number().int().nonnegative(),
  bronze: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type NationStandingResponse = z.infer<typeof nationStandingSchema>;

export const nationStandingListSchema = z.array(nationStandingSchema);

/** Une médaille telle que l'API la renvoie. */
export const medalSchema = z.object({
  id: z.uuid(),
  type: medalTypeSchema,
  sport: sportSlugSchema,
  eventId: z.uuid(),
  eventName: z.string(),
  competitor: z.string(),
  nationCode: z.string(),
  nationName: z.string(),
});
export type MedalResponse = z.infer<typeof medalSchema>;

export const medalListSchema = z.array(medalSchema);

/** Une nation dont les podiums importés diffèrent du tableau annoncé par la source. */
export const medalGapSchema = z.object({
  nationCode: z.string(),
  nationName: z.string(),
  gold: z.number().int().nonnegative(),
  silver: z.number().int().nonnegative(),
  bronze: z.number().int().nonnegative(),
  announcedGold: z.number().int().nonnegative(),
  announcedSilver: z.number().int().nonnegative(),
  announcedBronze: z.number().int().nonnegative(),
});
export type MedalGapResponse = z.infer<typeof medalGapSchema>;

export const medalGapListSchema = z.array(medalGapSchema);
