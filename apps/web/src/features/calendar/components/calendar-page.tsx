import { DAKAR_TIME_ZONE, SPORT_SLUGS, type SportSlug, sportSlugSchema } from '@joj/shared';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useId, useState } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { DaySelector } from '@/features/results/components/day-selector';
import { defaultDay } from '@/features/results/components/default-day';
import { SPORT_LABELS } from '@/features/results/components/result-labels';
import { SportGroups } from '@/features/results/components/sport-groups';
import { UndatedEvents } from '@/features/results/components/undated-events';
import { useDayCalendar } from '../api/calendar.queries';
import { localTimeZone } from './event-time';
import { TimeZoneSwitch } from './time-zone-switch';

const routeApi = getRouteApi('/calendrier');

const LONG_DAY = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

export function CalendarPage() {
  const search = routeApi.useSearch();
  // Le jour par défaut est fixé à l'ouverture de la page, pas à chaque rendu.
  const [openingDay] = useState(() => defaultDay(new Date()));
  const day = search.date ?? openingDay;
  const zone = search.zone ?? 'dakar';
  const calendar = useDayCalendar({ date: day, sport: search.sport });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Calendrier du {LONG_DAY.format(new Date(day))}</h1>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        <DaySelector to="/calendrier" selectedDay={day} />
        <SportFilter day={day} sport={search.sport} />
        <TimeZoneSwitch selected={zone} />
      </div>
      {calendar.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {calendar.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger le calendrier.
        </p>
      )}
      {calendar.isSuccess && (
        <SportGroups
          events={calendar.data}
          emptyMessage="Aucune épreuve à venir pour ce jour et ce sport"
          timeZone={zone === 'local' ? localTimeZone() : DAKAR_TIME_ZONE}
        />
      )}
      <UndatedEvents />
    </div>
  );
}

function SportFilter({ day, sport }: { day: string; sport: SportSlug | undefined }) {
  const navigate = useNavigate({ from: '/calendrier' });
  const selectId = useId();
  return (
    <div className="flex flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor={selectId}>Sport</Label>
      <NativeSelect
        id={selectId}
        value={sport ?? ''}
        onChange={(event) => {
          const parsed = sportSlugSchema.safeParse(event.target.value);
          void navigate({
            search: (previous) => ({
              ...previous,
              date: day,
              sport: parsed.success ? parsed.data : undefined,
            }),
          });
        }}
      >
        <option value="">Tous les sports</option>
        {SPORT_SLUGS.map((slug) => (
          <option key={slug} value={slug}>
            {SPORT_LABELS[slug]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
