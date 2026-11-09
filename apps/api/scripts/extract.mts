/**
 * `pnpm data:extract` : lit les pages Wikipédia des Jeux et réécrit les fichiers de `data/`.
 * Rien n'est écrit tant que toute l'extraction n'a pas réussi : un échec laisse les données
 * précédentes intactes. `pnpm db:reset` charge ensuite les nouveaux fichiers en base.
 */
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  buildDataFiles,
  type EventReference,
  type NationReference,
  parseMedalistEvents,
} from './extract-core.mts';

const GAMES_PAGE = '2026 Summer Youth Olympics';
const PAUSE_BETWEEN_PAGES_MS = 1000;
const DEFAULT_RETRY_SECONDS = 60;
const MAX_ATTEMPTS = 3;

/** Le nom de chaque sport dans les titres de Wikipédia, avec des `_` pour les espaces. */
const SPORTS = [
  '3x3_basketball',
  'Archery',
  'Artistic_gymnastics',
  'Athletics',
  'Badminton',
  'Baseball5',
  'Beach_handball',
  'Beach_volleyball',
  'Beach_wrestling',
  'Boxing',
  'Breaking',
  'Coastal_rowing',
  'Equestrian',
  'Fencing',
  'Futsal',
  'Judo',
  'Road_cycling',
  'Rugby_sevens',
  'Sailing',
  'Skateboarding',
  'Swimming',
  'Table_tennis',
  'Taekwondo',
  'Triathlon',
  'Wushu',
];

export interface ExtractionOptions {
  dataDir: string;
  today: string;
  sports: string[];
  nations: Record<string, NationReference>;
  events: Record<string, EventReference>;
  /** Rend le texte d'une page, `null` si elle n'existe pas, et échoue si la source ne répond pas. */
  fetchPage: (title: string) => Promise<string | null>;
}

async function requirePage(options: ExtractionOptions, title: string): Promise<string> {
  const page = await options.fetchPage(title);
  if (page === null) throw new Error(`La page « ${title} » est introuvable : rien n'est écrit.`);
  return page;
}

export async function runExtraction(options: ExtractionOptions): Promise<void> {
  const main = await requirePage(options, GAMES_PAGE);
  const sportPages: Record<string, string> = {};
  const eventPages: Record<string, string | null> = {};
  for (const sport of options.sports) {
    const title = `${sport.replaceAll('_', ' ')} at the 2026 Summer Youth Olympics`;
    const page = await requirePage(options, title);
    sportPages[sport] = page;
    for (const { link } of parseMedalistEvents(sport, page)) {
      // Une page d'épreuve peut ne pas encore exister : l'épreuve reste alors sans date.
      if (link !== null) eventPages[link] = await options.fetchPage(link);
    }
  }

  const files = buildDataFiles({
    main,
    sportPages,
    eventPages,
    today: options.today,
    nations: options.nations,
    events: options.events,
  });

  // On écrit d'abord à côté, puis on remplace : un incident ici ne laisse pas de fichier tronqué.
  const written = Object.entries(files).map(([name, rows]) => {
    const path = join(options.dataDir, name);
    writeFileSync(`${path}.tmp`, `${JSON.stringify(rows, null, 2)}\n`);
    return path;
  });
  for (const path of written) renameSync(`${path}.tmp`, path);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Une page à la fois, sans insister : la source limite le débit et le dit avec un code 429. */
async function fetchFromWikipedia(
  title: string,
  attemptsLeft = MAX_ATTEMPTS,
): Promise<string | null> {
  await wait(PAUSE_BETWEEN_PAGES_MS);
  const url = `https://en.wikipedia.org/w/index.php?action=raw&title=${encodeURIComponent(title)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'formation-joj-extract/1.0' } });
  if (response.status === 404) return null;
  if (response.status === 429 && attemptsLeft > 1) {
    const seconds = Number(response.headers.get('retry-after')) || DEFAULT_RETRY_SECONDS;
    await wait(seconds * 1000);
    return fetchFromWikipedia(title, attemptsLeft - 1);
  }
  if (!response.ok) throw new Error(`La source répond ${response.status} pour « ${title} ».`);
  return response.text();
}

function readReference<T>(name: string): Record<string, T> {
  const path = join(import.meta.dirname, 'reference', name);
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, T>;
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await runExtraction({
    dataDir: join(import.meta.dirname, '..', 'data'),
    today,
    sports: SPORTS,
    nations: readReference<NationReference>('nations.json'),
    events: readReference<EventReference>('events.json'),
    fetchPage: fetchFromWikipedia,
  });
  console.log(
    `Extraction réussie, données du ${today}. Arrête pnpm dev, puis lance pnpm db:reset.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(`Extraction en échec, les données précédentes sont gardées : ${String(error)}`);
    process.exit(1);
  });
}
