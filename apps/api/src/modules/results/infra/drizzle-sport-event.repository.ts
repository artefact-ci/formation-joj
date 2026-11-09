import { Inject, Injectable } from '@nestjs/common';
import type { SportSlug } from '@joj/shared';
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SportEventRepository } from '../application/sport-event.repository';
import type { DataSource } from '../domain/data-source';
import type { SportEvent, UndatedEvent } from '../domain/sport-event';
import {
  dataExtractions,
  sportEventEntries,
  type SportEventRow,
  sportEvents,
} from './results.schema';
import { toDomain, toUndatedEvent } from './sport-event.mapper';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DrizzleSportEventRepository extends SportEventRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async listByDay(day: string, sport?: SportSlug): Promise<SportEvent[]> {
    // Dakar est à UTC toute l'année : le jour de Dakar va de minuit à minuit UTC.
    const dayStart = new Date(`${day}T00:00:00.000Z`);
    const nextDayStart = new Date(dayStart.getTime() + ONE_DAY_IN_MS);
    const rows = await this.db
      .select()
      .from(sportEvents)
      .where(
        and(
          gte(sportEvents.startsAt, dayStart),
          lt(sportEvents.startsAt, nextDayStart),
          sport === undefined ? undefined : eq(sportEvents.sport, sport),
        ),
      )
      .orderBy(asc(sportEvents.sport), asc(sportEvents.startsAt));
    return this.withEntries(rows);
  }

  async listLatestFinished(limit: number): Promise<SportEvent[]> {
    const rows = await this.db
      .select()
      .from(sportEvents)
      .where(
        and(
          eq(sportEvents.status, 'finished'),
          eq(sportEvents.awardsMedals, true),
          // Sans date, on ne peut pas dire qu'une épreuve est récente.
          isNotNull(sportEvents.startsAt),
        ),
      )
      .orderBy(desc(sportEvents.startsAt))
      .limit(limit);
    return this.withEntries(rows);
  }

  async listInProgress(): Promise<SportEvent[]> {
    const rows = await this.db
      .select()
      .from(sportEvents)
      .where(and(eq(sportEvents.status, 'in-progress'), isNotNull(sportEvents.startsAt)))
      .orderBy(asc(sportEvents.startsAt), asc(sportEvents.sport));
    return this.withEntries(rows);
  }

  async listUndated(): Promise<UndatedEvent[]> {
    const rows = await this.db
      .select()
      .from(sportEvents)
      .where(isNull(sportEvents.startsAt))
      .orderBy(asc(sportEvents.sport), asc(sportEvents.name));
    if (rows.length === 0) return [];

    const entryRows = await this.entriesOf(rows);
    return rows.map((row) =>
      toUndatedEvent(
        row,
        entryRows.filter((entry) => entry.eventId === row.id),
      ),
    );
  }

  async findDataSource(): Promise<DataSource | null> {
    const [latest] = await this.db
      .select()
      .from(dataExtractions)
      .orderBy(desc(dataExtractions.extractedOn))
      .limit(1);
    if (latest === undefined) return null;
    return {
      name: latest.sourceName,
      license: latest.license,
      url: latest.sourceUrl,
      extractedOn: latest.extractedOn,
    };
  }

  private async withEntries(rows: SportEventRow[]): Promise<SportEvent[]> {
    if (rows.length === 0) return [];

    const entryRows = await this.entriesOf(rows);
    return rows.map((row) =>
      toDomain(
        row,
        entryRows.filter((entry) => entry.eventId === row.id),
      ),
    );
  }

  private entriesOf(rows: SportEventRow[]) {
    return this.db
      .select()
      .from(sportEventEntries)
      .where(
        inArray(
          sportEventEntries.eventId,
          rows.map((row) => row.id),
        ),
      );
  }
}
