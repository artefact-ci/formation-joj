import type { CalendarQuery } from '@joj/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { calendarApi } from './calendar.api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const calendarKeys = {
  all: ['calendar'] as const,
  day: (query: CalendarQuery) => [...calendarKeys.all, 'day', query] as const,
};

export const dayCalendarQueryOptions = (query: CalendarQuery) =>
  queryOptions({
    queryKey: calendarKeys.day(query),
    queryFn: ({ signal }) => calendarApi.listDay(query, signal),
  });

export const useDayCalendar = (query: CalendarQuery) => useQuery(dayCalendarQueryOptions(query));
