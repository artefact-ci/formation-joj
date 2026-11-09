import { Inject, Injectable } from '@nestjs/common';
import { sportSlugSchema } from '@joj/shared';
import { asc } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { nations } from '../../medals/infra/medals.schema';
import { sportEventEntries, sportEvents } from '../../results/infra/results.schema';
import { SearchRepository } from '../application/search.repository';
import type { SearchCatalog } from '../domain/search-hit';

@Injectable()
export class DrizzleSearchRepository extends SearchRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async loadCatalog(): Promise<SearchCatalog> {
    const [nationRows, eventRows, entryRows] = await Promise.all([
      this.db.select().from(nations).orderBy(asc(nations.name)),
      this.db.select().from(sportEvents).orderBy(asc(sportEvents.startsAt)),
      this.db.select().from(sportEventEntries).orderBy(asc(sportEventEntries.competitor)),
    ]);
    return {
      nations: nationRows.map(({ code, name }) => ({ code, name })),
      events: eventRows.map((event) => ({
        // Une valeur inconnue en base est un bug : on échoue tôt.
        sport: sportSlugSchema.parse(event.sport),
        name: event.name,
        startsAt: event.startsAt,
        participants: entryRows
          .filter((entry) => entry.eventId === event.id)
          .map(({ competitor, nationCode }) => ({ competitor, nationCode })),
      })),
    };
  }
}
