import {
  type MedalGapResponse,
  medalGapListSchema,
  type MedalResponse,
  medalListSchema,
  type MedalsQuery,
  type NationStandingResponse,
  nationStandingListSchema,
  type NationStandingsQuery,
} from '@joj/shared';
import { api } from '@/lib/api';

/**
 * Les appels HTTP de la fonctionnalité, sans React ni cache : un appel par route de l'API,
 * réponse validée par le schéma partagé. Le cache et les hooks sont dans `medals.queries.ts`.
 */
export const medalsApi = {
  listGaps: (signal?: AbortSignal) =>
    api.request<MedalGapResponse[]>('/medals/gaps', { schema: medalGapListSchema, signal }),
  listStandings: ({ continent }: NationStandingsQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (continent !== undefined) params.set('continent', continent);
    return api.request<NationStandingResponse[]>(`/medals/standings?${params.toString()}`, {
      schema: nationStandingListSchema,
      signal,
    });
  },
  listMedals: ({ sport, type }: MedalsQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (sport !== undefined) params.set('sport', sport);
    if (type !== undefined) params.set('type', type);
    return api.request<MedalResponse[]>(`/medals?${params.toString()}`, {
      schema: medalListSchema,
      signal,
    });
  },
};
