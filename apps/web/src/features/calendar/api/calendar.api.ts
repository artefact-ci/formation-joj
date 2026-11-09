import { type CalendarQuery, type SportEventResponse, sportEventListSchema } from '@joj/shared';
import { api } from '@/lib/api';

/**
 * L'appel HTTP de la fonctionnalité, sans React ni cache, réponse validée par le schéma partagé.
 * Le cache et les hooks sont dans `calendar.queries.ts`.
 */
export const calendarApi = {
  listDay: ({ date, sport }: CalendarQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams({ date });
    if (sport !== undefined) params.set('sport', sport);
    return api.request<SportEventResponse[]>(`/results/calendar?${params.toString()}`, {
      schema: sportEventListSchema,
      signal,
    });
  },
};
