import { SPORT_SLUGS, type SportEventResponse, type SportSlug } from '@joj/shared';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { SPORT_LABELS } from './result-labels';
import { SportEventCard } from './sport-event-card';

/** Les couleurs des pastilles de sport, reprises des pictogrammes de la maquette. */
const BADGE_STYLES = ['bg-joj-pale-red', 'bg-accent', 'bg-joj-pale-yellow'];

interface SportGroupsProps {
  events: SportEventResponse[];
  emptyMessage: string;
  timeZone: string;
}

/** Les épreuves regroupées par sport, ou un message quand il n'y en a aucune. */
export function SportGroups({ events, emptyMessage, timeZone }: SportGroupsProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {SPORT_SLUGS.filter((slug) => events.some((event) => event.sport === slug)).map((slug) => (
        <SportGroup
          key={slug}
          sport={slug}
          events={events.filter((event) => event.sport === slug)}
          timeZone={timeZone}
        />
      ))}
    </div>
  );
}

interface SportGroupProps {
  sport: SportSlug;
  events: SportEventResponse[];
  timeZone: string;
}

function SportGroup({ sport, events, timeZone }: SportGroupProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-2 flex items-center gap-3">
        <SportBadge sport={sport} />
        <h2 id={titleId} className="text-lg font-bold">
          {SPORT_LABELS[sport]}
        </h2>
      </div>
      {events.map((event) => (
        <SportEventCard key={event.id} event={event} timeZone={timeZone} />
      ))}
    </section>
  );
}

function SportBadge({ sport }: { sport: SportSlug }) {
  const color = BADGE_STYLES[SPORT_SLUGS.indexOf(sport) % BADGE_STYLES.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        color,
      )}
    >
      {SPORT_LABELS[sport].slice(0, 2).toUpperCase()}
    </span>
  );
}
