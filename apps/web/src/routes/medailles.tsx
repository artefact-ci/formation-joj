import { continentSchema, medalTypeSchema, sportSlugSchema } from '@joj/shared';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { MedalsPage } from '@/features/medals/components/medals-page';

/** Les filtres vivent dans l'adresse ; une valeur invalide est simplement ignorée. */
const medalsSearchSchema = z.object({
  continent: continentSchema.optional().catch(undefined),
  sport: sportSlugSchema.optional().catch(undefined),
  type: medalTypeSchema.optional().catch(undefined),
});

export const Route = createFileRoute('/medailles')({
  validateSearch: medalsSearchSchema,
  component: MedalsPage,
});
