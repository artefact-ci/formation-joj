import type { SportSlug } from '@joj/shared';
import type { DataSource } from '../../domain/data-source';
import type { SportEvent, UndatedEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

/** Fake fidèle au contrat du port (filtres et tri), pour tester l'application sans base. */
export class InMemorySportEventRepository extends SportEventRepository {
  constructor(
    private readonly events: SportEvent[] = [],
    private readonly dataSource: DataSource | null = null,
    private readonly undated: UndatedEvent[] = [],
  ) {
    super();
  }

  async listByDay(day: string, sport?: SportSlug): Promise<SportEvent[]> {
    return this.events
      .filter((event) => event.startsAt.toISOString().startsWith(day))
      .filter((event) => sport === undefined || event.sport === sport)
      .toSorted(
        (a, b) => a.sport.localeCompare(b.sport) || a.startsAt.getTime() - b.startsAt.getTime(),
      );
  }

  async listLatestFinished(limit: number): Promise<SportEvent[]> {
    return this.events
      .filter((event) => event.status === 'finished' && event.awardsMedals)
      .toSorted((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
      .slice(0, limit);
  }

  async listInProgress(): Promise<SportEvent[]> {
    return this.events
      .filter((event) => event.status === 'in-progress')
      .toSorted(
        (a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.sport.localeCompare(b.sport),
      );
  }

  async listUndated(): Promise<UndatedEvent[]> {
    return this.undated;
  }

  async findDataSource(): Promise<DataSource | null> {
    return this.dataSource;
  }
}
