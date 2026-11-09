import { rankingMentionSchema, sportEventStatusSchema, sportSlugSchema } from '@joj/shared';
import { type RankingEntry, SportEvent, type UndatedEvent } from '../domain/sport-event';
import type { SportEventEntryRow, SportEventRow } from './results.schema';

/** Lignes des tables → entité. Une valeur inconnue en base est un bug : on échoue tôt. */
export function toDomain(row: SportEventRow, entryRows: SportEventEntryRow[]): SportEvent {
  if (row.startsAt === null) throw new RangeError(`L'épreuve ${row.id} n'a pas de date.`);
  return SportEvent.restore({
    id: row.id,
    sport: sportSlugSchema.parse(row.sport),
    name: row.name,
    startsAt: row.startsAt,
    hasStartTime: row.hasStartTime,
    status: sportEventStatusSchema.parse(row.status),
    awardsMedals: row.awardsMedals,
    entries: entryRows.map(toEntry),
  });
}

/** Une épreuve sans date : son classement suit la même règle que celui d'une épreuve datée. */
export function toUndatedEvent(row: SportEventRow, entryRows: SportEventEntryRow[]): UndatedEvent {
  const status = sportEventStatusSchema.parse(row.status);
  const ranking = SportEvent.restore({
    id: row.id,
    sport: sportSlugSchema.parse(row.sport),
    name: row.name,
    startsAt: new Date(0),
    hasStartTime: false,
    status,
    awardsMedals: row.awardsMedals,
    entries: entryRows.map(toEntry),
  }).ranking;
  return { id: row.id, sport: sportSlugSchema.parse(row.sport), name: row.name, status, ranking };
}

function toEntry(row: SportEventEntryRow): RankingEntry {
  return {
    rank: row.rank,
    nationCode: row.nationCode,
    nationName: row.nationName,
    competitor: row.competitor,
    performance: row.performance,
    mention: rankingMentionSchema.nullable().parse(row.mention),
  };
}
