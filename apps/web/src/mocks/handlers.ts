import {
  calendarQuerySchema,
  dayResultsQuerySchema,
  medalsQuerySchema,
  nationAthletesQuerySchema,
  nationStandingsQuerySchema,
  normalizeSearchText,
  type ProblemDetails,
  searchQuerySchema,
  type SportEventResponse,
  type SportSlug,
} from '@joj/shared';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import type { z } from 'zod';
import { mockControl } from './control';
import { fixture } from './fixture';

/**
 * La fausse API des tests du front : le même contrat que apps/api (mêmes schémas zod, mêmes
 * codes d'erreur, même format RFC 9457), sur les données de `fixture.ts`. Une nouvelle route
 * de l'API s'ajoute ici (un `http.get`, `http.post`… par route), avec son test dans `handlers.test.ts`.
 */

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export function problem(
  status: number,
  code: string,
  detail: string,
  extra: Pick<ProblemDetails, 'errors' | 'details'> = {},
) {
  return HttpResponse.json(
    {
      type: `urn:problem-type:${code.toLowerCase().replaceAll('_', '-')}`,
      title: TITLES[status] ?? 'Error',
      status,
      code,
      detail,
      ...extra,
    } satisfies ProblemDetails,
    { status, headers: { 'content-type': 'application/problem+json' } },
  );
}

/** Latence, puis panne armée par `mockControl` : renvoie la réponse d'erreur, ou `null`. */
export async function gate(method: string, path: string): Promise<Response | null> {
  if (mockControl.latency > 0) await delay(mockControl.latency);
  const status = mockControl.takeFailure(`${method} ${path}`);
  return status === null ? null : problem(status, 'INTERNAL_ERROR', 'Mocked failure.');
}

export function validationFailed(error: z.ZodError) {
  return problem(400, 'VALIDATION_FAILED', 'The request is invalid.', {
    errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}

/** Les épreuves d'un jour, éventuellement d'un seul sport, triées par sport puis par heure. */
function eventsOfDay(date: string, sport?: SportSlug): SportEventResponse[] {
  return fixture.sportEvents
    .filter((event) => event.startsAt.startsWith(date))
    .filter((event) => sport === undefined || event.sport === sport)
    .toSorted((a, b) => a.sport.localeCompare(b.sport) || a.startsAt.localeCompare(b.startsAt));
}

export const handlers: RequestHandler[] = [
  http.get('*/api/results', async ({ request }) => {
    const failure = await gate('GET', '/api/results');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = dayResultsQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { date, sport, nation } = parsed.data;
    return HttpResponse.json(
      eventsOfDay(date, sport).filter(
        (event) =>
          nation === undefined ||
          fixture.participants.some(
            (participant) => participant.eventId === event.id && participant.nationCode === nation,
          ),
      ),
    );
  }),

  http.get('*/api/results/source', async () => {
    const failure = await gate('GET', '/api/results/source');
    if (failure) return failure;
    return HttpResponse.json(fixture.dataSource);
  }),

  http.get('*/api/results/undated', async () => {
    const failure = await gate('GET', '/api/results/undated');
    if (failure) return failure;
    return HttpResponse.json(fixture.undatedEvents);
  }),

  http.get('*/api/medals/gaps', async () => {
    const failure = await gate('GET', '/api/medals/gaps');
    if (failure) return failure;
    return HttpResponse.json(fixture.medalGaps);
  }),

  http.get('*/api/results/latest', async () => {
    const failure = await gate('GET', '/api/results/latest');
    if (failure) return failure;
    return HttpResponse.json(
      fixture.sportEvents
        .filter((event) => event.status === 'finished')
        .toSorted((a, b) => b.startsAt.localeCompare(a.startsAt))
        .slice(0, 3),
    );
  }),

  http.get('*/api/results/live', async () => {
    const failure = await gate('GET', '/api/results/live');
    if (failure) return failure;
    return HttpResponse.json(
      fixture.sportEvents
        .filter((event) => event.status === 'in-progress')
        .toSorted((a, b) => a.startsAt.localeCompare(b.startsAt)),
    );
  }),

  http.get('*/api/search', async ({ request }) => {
    const failure = await gate('GET', '/api/search');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = searchQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const wanted = normalizeSearchText(parsed.data.q);
    return HttpResponse.json(
      fixture.searchHits.filter((hit) => normalizeSearchText(hit.label).includes(wanted)),
    );
  }),

  http.get('*/api/results/calendar', async ({ request }) => {
    const failure = await gate('GET', '/api/results/calendar');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = calendarQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { date, sport } = parsed.data;
    return HttpResponse.json(
      eventsOfDay(date, sport).filter((event) => event.status === 'scheduled'),
    );
  }),

  http.get('*/api/results/athletes', async ({ request }) => {
    const failure = await gate('GET', '/api/results/athletes');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = nationAthletesQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { date, nation } = parsed.data;
    return HttpResponse.json(
      eventsOfDay(date)
        .flatMap((event) =>
          fixture.participants
            .filter(({ eventId, nationCode }) => eventId === event.id && nationCode === nation)
            .map(({ competitor }) => ({
              competitor,
              eventId: event.id,
              eventName: event.name,
              sport: event.sport,
              startsAt: event.startsAt,
              hasStartTime: event.hasStartTime,
              status: event.status,
            })),
        )
        .toSorted(
          (a, b) =>
            a.startsAt.localeCompare(b.startsAt) || a.competitor.localeCompare(b.competitor, 'fr'),
        ),
    );
  }),

  http.get('*/api/medals/standings', async ({ request }) => {
    const failure = await gate('GET', '/api/medals/standings');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = nationStandingsQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { continent } = parsed.data;
    return HttpResponse.json(
      fixture.nationStandings.filter(
        (standing) => continent === undefined || standing.continent === continent,
      ),
    );
  }),

  http.get('*/api/medals', async ({ request }) => {
    const failure = await gate('GET', '/api/medals');
    if (failure) return failure;
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = medalsQuerySchema.safeParse(query);
    if (!parsed.success) return validationFailed(parsed.error);
    const { sport, type } = parsed.data;
    return HttpResponse.json(
      fixture.medals
        .filter((medal) => sport === undefined || medal.sport === sport)
        .filter((medal) => type === undefined || medal.type === type),
    );
  }),
];
