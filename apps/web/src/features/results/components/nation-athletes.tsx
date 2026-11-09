import { DAKAR_TIME_ZONE } from '@joj/shared';
import { useId } from 'react';
import { formatEventTime } from '@/features/calendar/components/event-time';
import { useNationAthletes } from '../api/results.queries';
import { SPORT_LABELS, STATUS_LABELS } from './result-labels';

/** Les athlètes du jour de la nation choisie, avec leur épreuve, leur heure et leur statut. */
export function NationAthletes({ day, nation }: { day: string; nation: string }) {
  const titleId = useId();
  const athletes = useNationAthletes({ date: day, nation });

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:p-6"
    >
      <h2 id={titleId} className="text-lg font-bold">
        Athlètes du jour
      </h2>
      {athletes.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {athletes.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les athlètes.
        </p>
      )}
      {athletes.isSuccess && athletes.data.length === 0 && (
        <p className="text-muted-foreground">Aucun athlète de cette nation ce jour</p>
      )}
      {athletes.isSuccess && athletes.data.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm">
          {athletes.data.map((athlete) => (
            <li
              key={`${athlete.eventId}-${athlete.competitor}`}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t pt-2 first:border-t-0 first:pt-0"
            >
              <span className="font-semibold">{athlete.competitor}</span>
              <span>
                {SPORT_LABELS[athlete.sport]}, {athlete.eventName}
              </span>
              {athlete.hasStartTime && (
                <span className="text-muted-foreground">
                  {formatEventTime(athlete.startsAt, DAKAR_TIME_ZONE)}
                </span>
              )}
              <span className="text-muted-foreground">{STATUS_LABELS[athlete.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
