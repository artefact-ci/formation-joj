import type { SportSlug } from '@joj/shared';
import type { DataSource } from '../domain/data-source';
import type { SportEvent, UndatedEvent } from '../domain/sport-event';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSportEventRepository (infra) et InMemorySportEventRepository (tests).
 */
export abstract class SportEventRepository {
  /** Les épreuves d'un jour (AAAA-MM-JJ, heure de Dakar), triées par sport puis par heure. */
  abstract listByDay(day: string, sport?: SportSlug): Promise<SportEvent[]>;

  /** Les dernières épreuves terminées qui attribuent des médailles, de la plus récente à la plus ancienne. */
  abstract listLatestFinished(limit: number): Promise<SportEvent[]>;

  /** Les épreuves en cours, triées par heure puis par sport. */
  abstract listInProgress(): Promise<SportEvent[]>;

  /** Les épreuves dont la source ne donne pas le jour, triées par sport puis par nom. */
  abstract listUndated(): Promise<UndatedEvent[]>;

  /** La source de l'extraction la plus récente, ou `null` si aucune n'est chargée. */
  abstract findDataSource(): Promise<DataSource | null>;
}
