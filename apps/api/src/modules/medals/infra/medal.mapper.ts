import { continentSchema, sportSlugSchema } from '@joj/shared';
import type { SportEventEntryRow, SportEventRow } from '../../results/infra/results.schema';
import { Medal, medalTypeForRank } from '../domain/medal';
import type { Nation } from '../domain/nation-standings';
import type { NationRow } from './medals.schema';

/** Lignes des tables → domaine. Une valeur inconnue en base est un bug : on échoue tôt. */
export function toMedal(entry: SportEventEntryRow, event: SportEventRow): Medal {
  const type = entry.rank === null ? null : medalTypeForRank(entry.rank);
  if (type === null) {
    throw new RangeError(`La participation ${entry.id} (rang ${entry.rank}) n'a pas de médaille.`);
  }
  return Medal.restore({
    id: entry.id,
    type,
    sport: sportSlugSchema.parse(event.sport),
    eventId: event.id,
    eventName: event.name,
    competitor: entry.competitor,
    nationCode: entry.nationCode,
    nationName: entry.nationName,
  });
}

export function toNation(row: NationRow): Nation {
  return { code: row.code, name: row.name, continent: continentSchema.parse(row.continent) };
}
