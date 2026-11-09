import type { MedalsQuery, NationStandingsQuery } from '@joj/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { medalsApi } from './medals.api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const medalKeys = {
  all: ['medals'] as const,
  gaps: () => [...medalKeys.all, 'gaps'] as const,
  standings: (query: NationStandingsQuery) => [...medalKeys.all, 'standings', query] as const,
  list: (query: MedalsQuery) => [...medalKeys.all, 'list', query] as const,
};

export const nationStandingsQueryOptions = (query: NationStandingsQuery) =>
  queryOptions({
    queryKey: medalKeys.standings(query),
    queryFn: ({ signal }) => medalsApi.listStandings(query, signal),
  });

export const medalsQueryOptions = (query: MedalsQuery) =>
  queryOptions({
    queryKey: medalKeys.list(query),
    queryFn: ({ signal }) => medalsApi.listMedals(query, signal),
  });

export const useMedalGaps = () =>
  useQuery(
    queryOptions({
      queryKey: medalKeys.gaps(),
      queryFn: ({ signal }) => medalsApi.listGaps(signal),
    }),
  );

export const useNationStandings = (query: NationStandingsQuery) =>
  useQuery(nationStandingsQueryOptions(query));

export const useMedals = (query: MedalsQuery) => useQuery(medalsQueryOptions(query));
