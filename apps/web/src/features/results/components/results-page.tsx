import {
  DAKAR_TIME_ZONE,
  nationCodeSchema,
  SPORT_SLUGS,
  type SportSlug,
  sportSlugSchema,
} from '@joj/shared';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useId, useState } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useNationStandings } from '@/features/medals/api/medals.queries';
import { useDayResults } from '../api/results.queries';
import { DaySelector } from './day-selector';
import { defaultDay } from './default-day';
import { NationAthletes } from './nation-athletes';
import { SPORT_LABELS } from './result-labels';
import { SportGroups } from './sport-groups';

const routeApi = getRouteApi('/resultats');

const LONG_DAY = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

export function ResultsPage() {
  const search = routeApi.useSearch();
  // Le jour par défaut est fixé à l'ouverture de la page, pas à chaque rendu.
  const [openingDay] = useState(() => defaultDay(new Date()));
  const day = search.date ?? openingDay;
  const results = useDayResults({ date: day, sport: search.sport, nation: search.nation });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Résultats du {LONG_DAY.format(new Date(day))}</h1>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        <DaySelector to="/resultats" selectedDay={day} />
        <div className="flex flex-col gap-4 sm:flex-row">
          <SportFilter day={day} sport={search.sport} />
          <NationFilter day={day} nation={search.nation} />
        </div>
      </div>
      {search.nation !== undefined && <NationAthletes day={day} nation={search.nation} />}
      {results.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {results.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les résultats.
        </p>
      )}
      {results.isSuccess && (
        <SportGroups
          events={results.data}
          emptyMessage="Aucune épreuve pour ce jour et ce sport"
          timeZone={DAKAR_TIME_ZONE}
        />
      )}
    </div>
  );
}

function SportFilter({ day, sport }: { day: string; sport: SportSlug | undefined }) {
  const navigate = useNavigate({ from: '/resultats' });
  const selectId = useId();
  return (
    <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
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

function NationFilter({ day, nation }: { day: string; nation: string | undefined }) {
  const navigate = useNavigate({ from: '/resultats' });
  const selectId = useId();
  const standings = useNationStandings({});
  const nations = (standings.data ?? []).toSorted((a, b) =>
    a.nationName.localeCompare(b.nationName, 'fr'),
  );
  return (
    <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor={selectId}>Nation</Label>
      <NativeSelect
        id={selectId}
        value={nation ?? ''}
        onChange={(event) => {
          const parsed = nationCodeSchema.safeParse(event.target.value);
          void navigate({
            search: (previous) => ({
              ...previous,
              date: day,
              nation: parsed.success ? parsed.data : undefined,
            }),
          });
        }}
      >
        <option value="">Toutes les nations</option>
        {nations.map(({ nationCode, nationName }) => (
          <option key={nationCode} value={nationCode}>
            {nationName}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
