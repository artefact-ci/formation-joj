/** Logique pure de `pnpm data:extract` (testée) ; le réseau et les fichiers sont dans extract.mts. */
import { createHash } from 'node:crypto';
import { GAMES_FIRST_DAY, GAMES_LAST_DAY } from '@joj/shared';

export interface NationReference {
  code: string;
  name: string;
  continent: string;
}

export interface EventReference {
  name: string;
  sport: string;
}

export interface RawMedal {
  rank: number;
  noc: string;
  competitor: string | null;
  isTeam: boolean;
  performance: string | null;
}

export interface RawEvent {
  key: string;
  link: string | null;
  medals: RawMedal[];
}

export interface ExtractionInput {
  main: string;
  sportPages: Record<string, string>;
  eventPages: Record<string, string | null>;
  today: string;
  nations: Record<string, NationReference>;
  events: Record<string, EventReference>;
}

export interface NationRow {
  code: string;
  name: string;
  continent: string;
  announced_gold: number;
  announced_silver: number;
  announced_bronze: number;
}

export interface DataFiles {
  '01-sport_events.json': Record<string, unknown>[];
  '02-sport_event_entries.json': Record<string, unknown>[];
  '03-nations.json': NationRow[];
  '04-data_extractions.json': Record<string, unknown>[];
}

export const SOURCE_URL = 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics';

/** Le code d'une équipe réunissant plusieurs nations (voir MIXED_TEAM_CODE dans @joj/shared). */
const MIXED_TEAM_CODE = 'xx';
const MIXED_TEAM_NOC = 'MIX';

const MEDALIST = /\{\{flagIOCmedalist\|(.+?)\|([A-Z]{3})\|/;
const TEAM = /\{\{flagIOC\|([A-Z]{3})\|/;
const NOT_AWARDED = /not awarded/i;
const DAY = /(\d{1,2})\s+(October|November)/g;
const WEEKDAY = /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\b/;

/** `rowspan=2| texte` devient `texte` : les attributs d'une cellule ne sont pas son contenu. */
function withoutAttributes(cell: string): string {
  return cell.replace(/^\s*(?:(?:rowspan|colspan|style|bgcolor|align)=[^|]*\|)/, '').trim();
}

function cleanLabel(cell: string): string {
  return withoutAttributes(cell)
    .split(/<br/)[0]!
    .replace(/<ref[\s\S]*$/, '')
    .replace(/\{\{nowrap\|([^}]*)\}\}/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** `[[Page|Nom]]` et `[[Nom]]` deviennent `Nom`. */
function plainName(text: string): string {
  return text.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').trim();
}

function rowCells(row: string): string[] {
  return row
    .split('\n')
    .filter((line) => line.startsWith('|') && !line.startsWith('|}'))
    .flatMap((line) => line.slice(1).split('||'))
    .map((cell) => cell.trim());
}

interface ParsedCell {
  noc: string;
  competitor: string | null;
  isTeam: boolean;
}

function parseMedalCell(cell: string): ParsedCell | null {
  const medalist = cell.match(MEDALIST);
  if (medalist) {
    return { noc: medalist[2]!, competitor: plainName(medalist[1]!), isTeam: false };
  }
  const team = cell.match(TEAM);
  return team ? { noc: team[1]!, competitor: null, isTeam: true } : null;
}

/** Le texte d'une performance, sans gabarit ni référence. */
function rawPerformance(cell: string | undefined): string | null {
  if (cell === undefined || parseMedalCell(cell) !== null || NOT_AWARDED.test(cell)) return null;
  const text = withoutAttributes(cell)
    .replace(/<ref[\s\S]*?(?:<\/ref>|\/>)/g, '')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/'''?/g, '')
    .trim();
  return text === '' ? null : text;
}

/** Une ligne de podium : les médailles de la ligne, et le rang que prendrait une ligne suivante. */
function parseFirstRow(cells: string[]): { medals: RawMedal[]; continuationRank: number } {
  const medals: RawMedal[] = [];
  let rank = 1;
  let continuationRank = 3;
  const spannedRanks = new Set<number>();
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]!;
    if (NOT_AWARDED.test(cell)) {
      spannedRanks.add(rank);
      rank += 1;
      continue;
    }
    const medal = parseMedalCell(cell);
    if (medal === null) continue;
    if (/rowspan=/.test(cell)) spannedRanks.add(rank);
    medals.push({ rank, ...medal, performance: rawPerformance(cells[index + 1]) });
    rank += 1;
  }
  for (const candidate of [1, 2, 3]) {
    if (!spannedRanks.has(candidate)) {
      continuationRank = candidate;
      break;
    }
  }
  return { medals, continuationRank };
}

/** Les épreuves d'une page de sport, lues dans ses tableaux de médaillés. */
export function parseMedalistEvents(sport: string, page: string): RawEvent[] {
  const events: RawEvent[] = [];
  for (const part of page.split(/\n(?==+[^=\n]+=+\s*\n)/)) {
    const heading = part.match(/^=+\s*([^=\n]+?)\s*=+/)?.[1] ?? '';
    const tables = part.matchAll(/\{\|\s*\{\{\s*MedalistTable[\s\S]*?\n\|\}/gi);
    for (const [table] of tables) {
      let continuationRank = 3;
      for (const row of table.split(/\n\|-[^\n]*/).slice(1)) {
        const cells = rowCells(row);
        const first = cells[0];
        if (first === undefined) continue;
        const current = events.at(-1);
        if (parseMedalCell(first) !== null) {
          if (current === undefined) continue;
          for (const [index, cell] of cells.entries()) {
            const medal = parseMedalCell(cell);
            if (medal === null) continue;
            const shared = current.medals.find((m) => m.rank === continuationRank)?.performance;
            current.medals.push({
              rank: continuationRank,
              ...medal,
              performance: rawPerformance(cells[index + 1]) ?? shared ?? null,
            });
          }
          continue;
        }
        const label = cleanLabel(first);
        if (label === '') continue;
        const parsed = parseFirstRow(cells.slice(1));
        continuationRank = parsed.continuationRank;
        events.push({
          key: `${sport}|${heading}|${label}`,
          link: row.match(/\{\{\s*DetailsLink\|([^}|]+)/)?.[1]?.trim() ?? null,
          medals: parsed.medals,
        });
      }
    }
  }
  return events;
}

/** Une performance à la française : `10.28` devient `10,28 s` pour une épreuve chronométrée. */
export function formatPerformance(raw: string, sport: string, label: string): string | null {
  const text = plainName(raw).replace(/\./g, ',').trim();
  if (text === '') return null;
  const isTimed = sport === 'natation' || (sport === 'athletisme' && /\d m\b/.test(label));
  return isTimed && /^\d+,\d+$/.test(text) ? `${text} s` : text;
}

function isoDay(day: string, month: string): string {
  return `2026-${month === 'October' ? '10' : '11'}-${day.padStart(2, '0')}`;
}

/** Le jour de la finale d'après l'en-tête de la page d'épreuve : jamais deviné. */
export function readEventDay(page: string): { day: string | null; time: string | null } {
  const dates = page.match(/\|\s*dates?\s*=\s*([^\n]*)/i)?.[1] ?? '';
  const last = [...dates.matchAll(DAY)].at(-1);
  if (last === undefined) return { day: null, time: null };
  const day = isoDay(last[1]!, last[2]!);
  // La source contient des coquilles (« 8 October ») : un jour hors des Jeux n'est pas retenu.
  if (day < GAMES_FIRST_DAY || day > GAMES_LAST_DAY) return { day: null, time: null };
  const time = page.match(/'''(\d{1,2}:\d{2})'''\s*\n\|[^\n]*Final/)?.[1] ?? null;
  return { day, time };
}

function slotCount(cell: string): number {
  return Number(cell.match(/colspan="?(\d+)/)?.[1] ?? 1);
}

/** Les jours de finale lus dans le programme d'une page de sport, épreuve par épreuve. */
export function readFinalDays(page: string): Record<string, string> {
  const days: Record<string, string> = {};
  let slots: string[] = [];
  for (const row of page.split(/\n\|-[^\n]*/)) {
    const lines = row.split('\n').filter((line) => /^[!|]/.test(line) && !line.startsWith('|}'));
    const cells = lines.flatMap((line) => line.slice(1).split('||')).map((cell) => cell.trim());
    if (cells.filter((cell) => WEEKDAY.test(cell)).length > 0) {
      slots = cells.slice(cells.findIndex((cell) => WEEKDAY.test(cell))).flatMap((cell) => {
        const number = cell.match(WEEKDAY)?.[1];
        if (number === undefined) return [];
        const month = Number(number) >= 30 ? 'October' : 'November';
        return Array.from({ length: slotCount(cell) }, () => isoDay(number, month));
      });
      continue;
    }
    if (slots.length === 0 || cells.length < 2) continue;
    if (row.includes('Event ↓') || row.includes('Event↓')) continue;
    const name = plainName(cells[0]!.replace(/^.*?align="?left"?\s*\|\s*/, ''));
    let position = 0;
    for (const cell of cells.slice(1)) {
      if (/\|\s*F\s*$/.test(cell) || cell === 'F') {
        const day = slots[position];
        if (day !== undefined && name !== '') days[name] = day;
      }
      position += slotCount(cell);
    }
  }
  return days;
}

/** Un podium vaut « Terminé » ; sinon, seul un jour connu et à venir vaut « Programmé ». */
export function statusFor(hasPodium: boolean, day: string | null, today: string): string {
  if (hasPodium) return 'finished';
  return day !== null && day >= today ? 'scheduled' : 'unpublished';
}

/** Le tableau des médailles annoncé par la source, nation par nation. */
export function parseAnnouncedMedals(
  main: string,
): Record<string, { gold: number; silver: number; bronze: number }> {
  const table: Record<string, { gold: number; silver: number; bronze: number }> = {};
  const rows = main.matchAll(
    /gold_([A-Z]{3})\s*=\s*(\d+)\s*\|\s*silver_\1\s*=\s*(\d+)\s*\|\s*bronze_\1\s*=\s*(\d+)/g,
  );
  for (const [, noc, gold, silver, bronze] of rows) {
    table[noc!] = { gold: Number(gold), silver: Number(silver), bronze: Number(bronze) };
  }
  return table;
}

/** Un identifiant stable : relancer l'extraction ne change pas l'identité d'une épreuve. */
function stableId(key: string): string {
  const hash = createHash('sha1').update(key).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function requireNation(noc: string, nations: Record<string, NationReference>): NationReference {
  const nation = nations[noc];
  if (nation === undefined) {
    throw new Error(`Code de nation inconnu : ${noc}. Ajoute-le à scripts/reference/nations.json.`);
  }
  return nation;
}

function gridKey(key: string): string {
  const [, heading = '', label = ''] = key.split('|');
  const gender = heading.match(/^(Men's|Women's|Mixed)/)?.[1];
  if (gender === undefined || label.toLowerCase().startsWith(gender.toLowerCase())) {
    return label.toLowerCase();
  }
  return `${gender} ${label}`.toLowerCase();
}

/**
 * Le programme du sport donne le jour de la finale ; l'en-tête de la page d'épreuve peut ne donner
 * que celui des séries. Le programme l'emporte, et l'heure n'est gardée que si les deux concordent.
 */
function dayOf(event: RawEvent, input: ExtractionInput, grids: Map<string, string>) {
  const page = event.link === null ? null : (input.eventPages[event.link] ?? null);
  const read = page === null ? { day: null, time: null } : readEventDay(page);
  const sport = event.key.split('|')[0]!;
  const scheduled = grids.get(`${sport}|${gridKey(event.key)}`) ?? null;
  if (scheduled === null || scheduled === read.day) return read;
  return { day: scheduled, time: null };
}

/** Le contenu des fichiers de données. Toute incohérence arrête l'extraction en la nommant. */
export function buildDataFiles(input: ExtractionInput): DataFiles {
  const grids = new Map<string, string>();
  const raw: RawEvent[] = [];
  for (const [sport, page] of Object.entries(input.sportPages)) {
    raw.push(...parseMedalistEvents(sport, page));
    for (const [name, day] of Object.entries(readFinalDays(page))) {
      grids.set(`${sport}|${name.toLowerCase()}`, day);
    }
  }
  if (raw.length === 0) throw new Error("La source ne donne aucune épreuve : rien n'est écrit.");

  const events: Record<string, unknown>[] = [];
  const entries: Record<string, unknown>[] = [];
  for (const event of raw) {
    const reference = input.events[event.key];
    if (reference === undefined) {
      throw new Error(
        `Épreuve inconnue : ${event.key}. Ajoute-la à scripts/reference/events.json.`,
      );
    }
    const id = stableId(event.key);
    const { day, time } = dayOf(event, input, grids);
    const label = event.key.split('|')[2]!;
    events.push({
      id,
      sport: reference.sport,
      name: reference.name,
      status: statusFor(event.medals.length > 0, day, input.today),
      awards_medals: true,
      starts_at: day === null ? null : `${day}T${time?.padStart(5, '0') ?? '00:00'}:00.000Z`,
      has_start_time: day !== null && time !== null,
    });
    for (const medal of event.medals) {
      const isMixed = medal.noc === MIXED_TEAM_NOC;
      const nation = isMixed ? null : requireNation(medal.noc, input.nations);
      const nationName = nation?.name ?? 'Équipe mixte';
      const competitor = medal.competitor ?? (isMixed ? nationName : `Équipe : ${nationName}`);
      const performance =
        medal.performance === null
          ? null
          : formatPerformance(medal.performance, reference.sport, label);
      entries.push({
        id: stableId(`${event.key}|${medal.rank}|${competitor}`),
        event_id: id,
        nation_code: nation?.code ?? MIXED_TEAM_CODE,
        nation_name: nationName,
        competitor,
        rank: medal.rank,
        performance,
      });
    }
  }

  const announced = parseAnnouncedMedals(input.main);
  const nocs = new Set(
    [...input.main.matchAll(/\{\{flagIOC\|([A-Z]{3})\|2026 Summer Youth/g)].map((m) => m[1]!),
  );
  for (const noc of Object.keys(announced)) nocs.add(noc);
  const nations = [...nocs]
    .map((noc): NationRow => {
      const nation = requireNation(noc, input.nations);
      return {
        code: nation.code,
        name: nation.name,
        continent: nation.continent,
        announced_gold: announced[noc]?.gold ?? 0,
        announced_silver: announced[noc]?.silver ?? 0,
        announced_bronze: announced[noc]?.bronze ?? 0,
      };
    })
    .toSorted((a, b) => a.code.localeCompare(b.code));

  return {
    '01-sport_events.json': events,
    '02-sport_event_entries.json': entries,
    '03-nations.json': nations,
    '04-data_extractions.json': [
      {
        extracted_on: input.today,
        source_name: 'Wikipédia',
        source_url: SOURCE_URL,
        license: 'CC BY-SA',
      },
    ],
  };
}
