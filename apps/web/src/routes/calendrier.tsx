import { gamesDaySchema, sportSlugSchema } from '@joj/shared';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { CalendarPage } from '@/features/calendar/components/calendar-page';

/** Le jour, le sport et le fuseau vivent dans l'adresse ; une valeur invalide est ignorée. */
const calendarSearchSchema = z.object({
  date: gamesDaySchema.optional().catch(undefined),
  sport: sportSlugSchema.optional().catch(undefined),
  zone: z.enum(['dakar', 'local']).optional().catch(undefined),
});

export const Route = createFileRoute('/calendrier')({
  validateSearch: calendarSearchSchema,
  component: CalendarPage,
});
