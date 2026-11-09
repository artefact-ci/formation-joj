import { isSearchableText, type SearchQuery } from '@joj/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { searchApi } from './search.api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const searchKeys = {
  all: ['search'] as const,
  hits: (query: SearchQuery) => [...searchKeys.all, query] as const,
};

/** Un texte trop court n'est pas envoyé à l'API. */
export const searchHitsQueryOptions = (query: SearchQuery) =>
  queryOptions({
    queryKey: searchKeys.hits(query),
    queryFn: ({ signal }) => searchApi.search(query, signal),
    enabled: isSearchableText(query.q),
  });

export const useSearchHits = (query: SearchQuery) => useQuery(searchHitsQueryOptions(query));
