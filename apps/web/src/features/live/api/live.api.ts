import { type SportEventResponse, sportEventListSchema } from '@joj/shared';
import { api } from '@/lib/api';

/**
 * L'appel HTTP de la fonctionnalité, sans React ni cache, réponse validée par le schéma partagé.
 * Le cache et la relecture régulière sont dans `live.queries.ts`.
 */
export const liveApi = {
  listEvents: (signal?: AbortSignal) =>
    api.request<SportEventResponse[]>('/results/live', {
      schema: sportEventListSchema,
      signal,
    }),
};
