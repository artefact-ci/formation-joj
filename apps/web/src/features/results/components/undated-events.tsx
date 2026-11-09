import { useId } from 'react';
import { useUndatedEvents } from '../api/results.queries';
import { SPORT_LABELS, STATUS_LABELS } from './result-labels';

/** Les épreuves dont la source ne donne pas le jour : elles n'ont pas de place dans un jour. */
export function UndatedEvents() {
  const titleId = useId();
  const events = useUndatedEvents();
  if (!events.isSuccess || events.data.length === 0) return null;
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:p-6"
    >
      <h2 id={titleId} className="text-lg font-bold">
        Date non publiée
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm">
        {events.data.map((event) => (
          <li key={event.id}>
            {SPORT_LABELS[event.sport]}, {event.name}, {STATUS_LABELS[event.status]}
          </li>
        ))}
      </ul>
    </section>
  );
}
