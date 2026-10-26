import { z } from 'zod';

/** Liste fermée : une nouvelle catégorie s'ajoute ici, puis dans une migration. */
export const DISCIPLINE_CATEGORIES = [
  'athletisme',
  'sports-collectifs',
  'sports-de-combat',
  'sports-nautiques',
  'sports-de-precision',
] as const;

export const disciplineCategorySchema = z.enum(DISCIPLINE_CATEGORIES);
export type DisciplineCategory = z.infer<typeof disciplineCategorySchema>;

export const DISCIPLINE_NAME_MAX_LENGTH = 100;

/** Corps de `POST /api/disciplines`. */
export const createDisciplineSchema = z.object({
  name: z.string().trim().min(1).max(DISCIPLINE_NAME_MAX_LENGTH),
  category: disciplineCategorySchema,
});
export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;

/** Une discipline telle que l'API la renvoie. */
export const disciplineSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: disciplineCategorySchema,
  createdAt: z.iso.datetime(),
});
export type DisciplineResponse = z.infer<typeof disciplineSchema>;

export const disciplineListSchema = z.array(disciplineSchema);
