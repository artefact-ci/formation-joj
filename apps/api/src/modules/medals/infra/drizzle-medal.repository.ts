import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, lte } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { sportEventEntries, sportEvents } from '../../results/infra/results.schema';
import { MedalRepository } from '../application/medal.repository';
import type { Medal } from '../domain/medal';
import type { AnnouncedMedals } from '../domain/medal-gaps';
import type { Nation } from '../domain/nation-standings';
import { toMedal, toNation } from './medal.mapper';
import { nations } from './medals.schema';

const LAST_MEDAL_RANK = 3;

@Injectable()
export class DrizzleMedalRepository extends MedalRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  /** Une médaille est un rang de 1 à 3 dans une épreuve terminée qui en attribue : les résultats sont la seule source. */
  async listMedals(): Promise<Medal[]> {
    const rows = await this.db
      .select({ entry: sportEventEntries, event: sportEvents })
      .from(sportEventEntries)
      .innerJoin(sportEvents, eq(sportEventEntries.eventId, sportEvents.id))
      .where(
        and(
          eq(sportEvents.status, 'finished'),
          eq(sportEvents.awardsMedals, true),
          lte(sportEventEntries.rank, LAST_MEDAL_RANK),
        ),
      )
      .orderBy(
        asc(sportEvents.sport),
        asc(sportEvents.startsAt),
        asc(sportEvents.id),
        asc(sportEventEntries.rank),
        asc(sportEventEntries.competitor),
      );
    return rows.map(({ entry, event }) => toMedal(entry, event));
  }

  async listNations(): Promise<Nation[]> {
    return (await this.db.select().from(nations)).map(toNation);
  }

  async listAnnouncedMedals(): Promise<AnnouncedMedals[]> {
    const rows = await this.db.select().from(nations);
    return rows.map((row) => ({
      nationCode: row.code,
      gold: row.announcedGold,
      silver: row.announcedSilver,
      bronze: row.announcedBronze,
    }));
  }
}
