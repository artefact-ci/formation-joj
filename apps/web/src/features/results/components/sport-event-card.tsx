import 'flag-icons/css/flag-icons.min.css';
import type { RankingEntryResponse, SportEventResponse, SportEventStatus } from '@joj/shared';
import { useId } from 'react';
import { formatEventTime } from '@/features/calendar/components/event-time';
import { cn } from '@/lib/utils';
import { MENTION_LABELS, STATUS_LABELS } from './result-labels';

interface SportEventCardProps {
  event: SportEventResponse;
  timeZone: string;
}

const STATUS_STYLES: Record<SportEventStatus, string> = {
  scheduled: 'bg-muted text-foreground',
  'in-progress': 'bg-joj-pale-yellow text-foreground',
  finished: 'bg-accent text-primary',
  unpublished: 'bg-muted text-muted-foreground',
};

const MEDAL_STYLES: Record<number, string> = {
  1: 'bg-joj-yellow',
  2: 'bg-medal-silver',
  3: 'bg-medal-bronze',
};

export function SportEventCard({ event, timeZone }: SportEventCardProps) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="grid gap-3 border-t py-4 first:border-t-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-6"
    >
      <div className="flex flex-col items-start gap-1">
        <h3 id={titleId} className="font-semibold">
          {event.name}
        </h3>
        {event.hasStartTime && (
          <p className="text-sm text-muted-foreground">
            {formatEventTime(event.startsAt, timeZone)}
          </p>
        )}
        <p
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            STATUS_STYLES[event.status],
          )}
        >
          {STATUS_LABELS[event.status]}
        </p>
      </div>
      {event.status === 'finished' && <RankingTable name={event.name} ranking={event.ranking} />}
    </article>
  );
}

function RankingTable({ name, ranking }: { name: string; ranking: RankingEntryResponse[] }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Classement : {name}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Rang</th>
          <th scope="col">Nation</th>
          <th scope="col">Athlète ou équipe</th>
          <th scope="col">Performance</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map((entry) => (
          <RankingRow key={entry.competitor} entry={entry} />
        ))}
      </tbody>
    </table>
  );
}

function RankingRow({ entry }: { entry: RankingEntryResponse }) {
  return (
    <tr className="border-t first:border-t-0">
      <td className="w-8 py-1.5 pr-2 align-middle">
        {entry.rank !== null && <RankBadge rank={entry.rank} />}
      </td>
      <td className="py-1.5 pr-2 align-middle">
        <span aria-hidden="true" className={`fi fi-${entry.nationCode} mr-1.5 rounded-xs`} />
        {entry.nationName}
      </td>
      <td className="py-1.5 pr-2 align-middle font-semibold">{entry.competitor}</td>
      <td className="py-1.5 text-right align-middle font-semibold whitespace-nowrap">
        {entry.mention === null ? entry.performance : MENTION_LABELS[entry.mention]}
      </td>
    </tr>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold text-joj-night',
        MEDAL_STYLES[rank],
      )}
    >
      {rank}
    </span>
  );
}
