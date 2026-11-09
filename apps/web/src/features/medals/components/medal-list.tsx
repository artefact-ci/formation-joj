import 'flag-icons/css/flag-icons.min.css';
import {
  MIXED_TEAM_CODE,
  type MedalResponse,
  type MedalType,
  SPORT_SLUGS,
  type SportSlug,
} from '@joj/shared';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { SPORT_LABELS } from '@/features/results/components/result-labels';
import { MEDAL_TYPE_LABELS } from './medal-labels';

const MEDAL_STYLES: Record<MedalType, string> = {
  gold: 'bg-joj-yellow',
  silver: 'bg-medal-silver',
  bronze: 'bg-medal-bronze',
};

/** Les médailles groupées par sport, puis par épreuve, dans l'ordre donné par l'API. */
export function MedalList({ medals }: { medals: MedalResponse[] }) {
  if (medals.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
        Aucune médaille pour ce choix
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {SPORT_SLUGS.filter((slug) => medals.some((medal) => medal.sport === slug)).map((slug) => (
        <SportMedals
          key={slug}
          sport={slug}
          medals={medals.filter((medal) => medal.sport === slug)}
        />
      ))}
    </div>
  );
}

function SportMedals({ sport, medals }: { sport: SportSlug; medals: MedalResponse[] }) {
  const titleId = useId();
  const eventIds = [...new Set(medals.map((medal) => medal.eventId))];
  return (
    <section aria-labelledby={titleId} className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <h3 id={titleId} className="mb-2 text-lg font-bold">
        {SPORT_LABELS[sport]}
      </h3>
      {eventIds.map((eventId) => (
        <EventMedals key={eventId} medals={medals.filter((medal) => medal.eventId === eventId)} />
      ))}
    </section>
  );
}

function EventMedals({ medals }: { medals: MedalResponse[] }) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="grid gap-2 border-t py-4 first:border-t-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-6"
    >
      <h4 id={titleId} className="font-semibold">
        {medals[0]?.eventName}
      </h4>
      <ul className="flex flex-col gap-2 text-sm">
        {medals.map((medal) => (
          <MedalRow key={medal.id} medal={medal} />
        ))}
      </ul>
    </article>
  );
}

function MedalRow({ medal }: { medal: MedalResponse }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span
        className={cn(
          'w-16 rounded-full px-2 py-0.5 text-center text-xs font-bold text-joj-night',
          MEDAL_STYLES[medal.type],
        )}
      >
        {MEDAL_TYPE_LABELS[medal.type]}
      </span>
      <span className="font-semibold">{medal.competitor}</span>
      <span>
        {medal.nationCode !== MIXED_TEAM_CODE && (
          <span aria-hidden="true" className={`fi fi-${medal.nationCode} mr-1.5 rounded-xs`} />
        )}
        {medal.nationName}
      </span>
    </li>
  );
}
