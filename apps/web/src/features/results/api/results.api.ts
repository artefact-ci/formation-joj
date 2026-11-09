import {
  type DataSourceResponse,
  dataSourceSchema,
  type UndatedEventResponse,
  undatedEventListSchema,
  type DayResultsQuery,
  type NationAthleteResponse,
  nationAthleteListSchema,
  type NationAthletesQuery,
  type SportEventResponse,
  sportEventListSchema,
} from '@joj/shared';
import { api } from '@/lib/api';

/**
 * Les appels HTTP de la fonctionnalité, sans React ni cache : un appel par route de l'API,
 * réponse validée par le schéma partagé. Le cache et les hooks sont dans `results.queries.ts`.
 */
export const resultsApi = {
  listDay: ({ date, sport, nation }: DayResultsQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams({ date });
    if (sport !== undefined) params.set('sport', sport);
    if (nation !== undefined) params.set('nation', nation);
    return api.request<SportEventResponse[]>(`/results?${params.toString()}`, {
      schema: sportEventListSchema,
      signal,
    });
  },
  findSource: (signal?: AbortSignal) =>
    api.request<DataSourceResponse>('/results/source', { schema: dataSourceSchema, signal }),
  listUndated: (signal?: AbortSignal) =>
    api.request<UndatedEventResponse[]>('/results/undated', {
      schema: undatedEventListSchema,
      signal,
    }),
  listLatest: (signal?: AbortSignal) =>
    api.request<SportEventResponse[]>('/results/latest', {
      schema: sportEventListSchema,
      signal,
    }),
  listAthletes: ({ date, nation }: NationAthletesQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams({ date, nation });
    return api.request<NationAthleteResponse[]>(`/results/athletes?${params.toString()}`, {
      schema: nationAthleteListSchema,
      signal,
    });
  },
};
