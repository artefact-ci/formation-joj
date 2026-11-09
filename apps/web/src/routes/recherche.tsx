import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SearchPage } from '@/features/search/components/search-page';

/** Le texte cherché vit dans l'adresse ; une valeur invalide est simplement ignorée. */
const searchPageSchema = z.object({
  // Le routeur lit `-51` dans une adresse comme un nombre : on le garde comme texte.
  q: z.coerce.string().optional().catch(undefined),
});

export const Route = createFileRoute('/recherche')({
  validateSearch: searchPageSchema,
  component: SearchPage,
});
