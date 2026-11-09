import { queryOptions, useQuery } from '@tanstack/react-query';
import { liveApi } from './live.api';

/** L'intervalle de relecture du direct, assez court pour rester sous les 30 secondes promises. */
export const LIVE_REFRESH_MS = 15_000;

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const liveKeys = {
  all: ['live'] as const,
};

export const liveEventsQueryOptions = () =>
  queryOptions({
    queryKey: liveKeys.all,
    queryFn: ({ signal }) => liveApi.listEvents(signal),
    refetchInterval: LIVE_REFRESH_MS,
  });

export const useLiveEvents = () => useQuery(liveEventsQueryOptions());
