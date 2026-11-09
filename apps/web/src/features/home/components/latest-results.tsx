import 'flag-icons/css/flag-icons.min.css';
import { SPORT_LABELS, type SportEventResponse } from '@joj/shared';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useLatestResults } from '@/features/results/api/results.queries';
import { cn } from '@/lib/utils';

const LAST_MEDAL_RANK = 3;

const MEDAL_STYLES: Record<number, string> = {
  1: 'bg-joj-yellow',
  2: 'bg-medal-silver',
  3: 'bg-medal-bronze',
};

/** Les derniers résultats, sur le modèle du bloc de la maquette : une épreuve et ses médaillés. */
export function LatestResults() {
  const titleId = useId();
  const latest = useLatestResults();
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:p-6"
    >
      <h2 id={titleId} className="text-lg font-bold">
        Derniers résultats
      </h2>
      {latest.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {latest.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les résultats.
        </p>
      )}
      {latest.isSuccess && latest.data.length === 0 && (
        <p className="text-muted-foreground">Aucun résultat pour le moment</p>
      )}
      {latest.isSuccess && latest.data.map((event) => <LatestEvent key={event.id} event={event} />)}
      <Link to="/resultats" className="text-sm font-semibold underline">
        Voir tous les résultats
      </Link>
    </section>
  );
}

function LatestEvent({ event }: { event: SportEventResponse }) {
  const titleId = useId();
  const medalists = event.ranking.filter(
    (entry) => entry.rank !== null && entry.rank <= LAST_MEDAL_RANK,
  );
  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-2 border-t pt-3 first:border-t-0"
    >
      <div>
        <p className="text-sm text-muted-foreground">{SPORT_LABELS[event.sport]}</p>
        <h3 id={titleId} className="font-semibold">
          {event.name}
        </h3>
      </div>
      <ul className="flex flex-col gap-1.5 text-sm">
        {medalists.map((entry) => (
          <li key={entry.competitor} className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold text-joj-night',
                MEDAL_STYLES[entry.rank ?? 0],
              )}
            >
              {entry.rank}
            </span>
            <span className="font-semibold">{entry.competitor}</span>
            <span>
              <span aria-hidden="true" className={`fi fi-${entry.nationCode} mr-1.5 rounded-xs`} />
              {entry.nationName}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
