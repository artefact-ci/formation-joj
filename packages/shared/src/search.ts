import { z } from 'zod';
import { nationCodeSchema, sportSlugSchema } from './results.ts';

/** En dessous de cette longueur, une recherche n'est pas envoyée. */
export const SEARCH_MIN_LENGTH = 2;

/** Sans accent, sans majuscule et sans espace autour : « Sénégal » devient « senegal ». */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** La longueur se mesure sur le texte normalisé : c'est lui que la recherche compare. */
export function isSearchableText(text: string): boolean {
  return normalizeSearchText(text).length >= SEARCH_MIN_LENGTH;
}

/** Paramètres de `GET /api/search`. */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .refine(isSearchableText, {
      error: `The text must contain at least ${SEARCH_MIN_LENGTH} searchable characters.`,
    }),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const SEARCH_HIT_KINDS = ['nation', 'sport', 'event', 'athlete'] as const;
export const searchHitKindSchema = z.enum(SEARCH_HIT_KINDS);
export type SearchHitKind = z.infer<typeof searchHitKindSchema>;

/** Un élément trouvé : son libellé et les filtres de la page qui le montre. */
export const searchHitSchema = z.object({
  kind: searchHitKindSchema,
  label: z.string(),
  date: z.iso.date().nullable(),
  sport: sportSlugSchema.nullable(),
  nation: nationCodeSchema.nullable(),
});
export type SearchHitResponse = z.infer<typeof searchHitSchema>;

export const searchHitListSchema = z.array(searchHitSchema);
