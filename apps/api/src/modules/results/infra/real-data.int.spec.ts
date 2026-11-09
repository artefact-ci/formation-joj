import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { ListMedalGaps } from '../../medals/application/use-cases/list-medal-gaps';
import { ListNationStandings } from '../../medals/application/use-cases/list-nation-standings';
import { DrizzleMedalRepository } from '../../medals/infra/drizzle-medal.repository';
import { nations } from '../../medals/infra/medals.schema';
import { DrizzleSportEventRepository } from './drizzle-sport-event.repository';
import { dataExtractions, sportEventEntries, sportEvents } from './results.schema';

interface EventFile {
  id: string;
  sport: string;
  name: string;
  status: string;
  awards_medals: boolean;
  starts_at: string | null;
  has_start_time: boolean;
}

interface EntryFile {
  id: string;
  event_id: string;
  nation_code: string;
  nation_name: string;
  competitor: string;
  rank: number;
  performance: string | null;
}

interface NationFile {
  code: string;
  name: string;
  continent: string;
  announced_gold: number;
  announced_silver: number;
  announced_bronze: number;
}

interface ExtractionFile {
  extracted_on: string;
  source_name: string;
  source_url: string;
  license: string;
}

function readData<T>(fileName: string): T[] {
  const url = new URL(`../../../../data/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as T[];
}

/** Les vrais fichiers de données, chargés dans une base neuve : ils respectent les contraintes. */
describe('real data loaded in a database', () => {
  const entries = readData<EntryFile>('02-sport_event_entries.json');
  let connection: DatabaseConnection;
  let medalRepository: DrizzleMedalRepository;
  let eventRepository: DrizzleSportEventRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    medalRepository = new DrizzleMedalRepository(connection.db);
    eventRepository = new DrizzleSportEventRepository(connection.db);

    await connection.db.insert(sportEvents).values(
      readData<EventFile>('01-sport_events.json').map((event) => ({
        id: event.id,
        sport: event.sport,
        name: event.name,
        status: event.status,
        awardsMedals: event.awards_medals,
        startsAt: event.starts_at === null ? null : new Date(event.starts_at),
        hasStartTime: event.has_start_time,
      })),
    );
    await connection.db.insert(sportEventEntries).values(
      entries.map((entry) => ({
        id: entry.id,
        eventId: entry.event_id,
        nationCode: entry.nation_code,
        nationName: entry.nation_name,
        competitor: entry.competitor,
        rank: entry.rank,
        performance: entry.performance,
      })),
    );
    await connection.db.insert(nations).values(
      readData<NationFile>('03-nations.json').map((nation) => ({
        code: nation.code,
        name: nation.name,
        continent: nation.continent,
        announcedGold: nation.announced_gold,
        announcedSilver: nation.announced_silver,
        announcedBronze: nation.announced_bronze,
      })),
    );
    await connection.db.insert(dataExtractions).values(
      readData<ExtractionFile>('04-data_extractions.json').map((extraction) => ({
        extractedOn: extraction.extracted_on,
        sourceName: extraction.source_name,
        sourceUrl: extraction.source_url,
        license: extraction.license,
      })),
    );
  });

  afterAll(() => connection?.close());

  it('005-AS4: ranks the 205 delegations, and counts every medal of the imported podiums', async () => {
    const standings = await new ListNationStandings(medalRepository).execute({});

    expect(standings).toHaveLength(205);
    const counted = standings.reduce((sum, standing) => sum + standing.total, 0);
    const mixed = entries.filter((entry) => entry.nation_code === 'xx').length;
    expect(counted + mixed).toBe(entries.length);
    expect(standings.find((standing) => standing.nationName === 'Nigeria')?.gold).toBeGreaterThan(
      0,
    );
  });

  it('005-AS5: reports only a small number of gaps with the table of the source', async () => {
    const gaps = await new ListMedalGaps(medalRepository).execute();

    expect(gaps.length).toBeLessThan(15);
  });

  it('005-AS2: reads the source of the extraction', async () => {
    expect(await eventRepository.findDataSource()).toMatchObject({
      name: 'Wikipédia',
      license: 'CC BY-SA',
    });
  });

  it('005-AS3: reads the events without a date, and the latest finished ones with a date', async () => {
    const latest = await eventRepository.listLatestFinished(3);

    expect(latest).toHaveLength(3);
    expect((await eventRepository.listUndated()).length).toBeGreaterThan(0);
  });
});
