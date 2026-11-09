import { type SearchHitResponse, searchHitListSchema, type SearchQuery } from '@joj/shared';
import { api } from '@/lib/api';

/**
 * L'appel HTTP de la fonctionnalité, sans React ni cache, réponse validée par le schéma partagé.
 * Le cache et les hooks sont dans `search.queries.ts`.
 */
export const searchApi = {
  search: ({ q }: SearchQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams({ q });
    return api.request<SearchHitResponse[]>(`/search?${params.toString()}`, {
      schema: searchHitListSchema,
      signal,
    });
  },
};
