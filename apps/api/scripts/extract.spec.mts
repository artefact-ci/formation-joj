import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runExtraction } from './extract.mts';

const MAIN = `{{flagIOC|NGR|2026 Summer Youth|12}}
 | gold_NGR = 1 | silver_NGR = 0 | bronze_NGR = 0
`;

const ATHLETICS = `===Men's events===
{| {{MedalistTable|columns=2}}
|-
| 100 m<br />{{DetailsLink|Men's 100 metres}}
| {{flagIOCmedalist|[[Gift Bright]]|NGR|2026 Summer Youth}}|| 10.28
|}
`;

const options = (dataDir: string, fetchPage: (title: string) => Promise<string | null>) => ({
  dataDir,
  today: '2026-11-09',
  sports: ['Athletics'],
  nations: { NGR: { code: 'ng', name: 'Nigeria', continent: 'afrique' } },
  events: { "Athletics|Men's events|100 m": { name: '100 m hommes', sport: 'athletisme' } },
  fetchPage,
});

const source = (pages: Record<string, string>) => async (title: string) => {
  const page = pages[title];
  return page === undefined ? null : page;
};

const PAGES = {
  '2026 Summer Youth Olympics': MAIN,
  'Athletics at the 2026 Summer Youth Olympics': ATHLETICS,
  "Men's 100 metres": '| dates = 8 November\n',
};

describe('runExtraction', () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), 'joj-extract-'));
    writeFileSync(join(dataDir, '01-sport_events.json'), '"ancien"');
  });

  afterEach(() => rmSync(dataDir, { recursive: true, force: true }));

  it('005-AS7: rewrites the data files with a new date when the extraction succeeds', async () => {
    await runExtraction(options(dataDir, source(PAGES)));

    const events = JSON.parse(readFileSync(join(dataDir, '01-sport_events.json'), 'utf8'));
    const extraction = JSON.parse(readFileSync(join(dataDir, '04-data_extractions.json'), 'utf8'));
    expect(events[0]).toMatchObject({ name: '100 m hommes', status: 'finished' });
    expect(extraction[0].extracted_on).toBe('2026-11-09');
  });

  it('005-AS7: fails and keeps the data files when the source does not respond', async () => {
    const failing = async () => {
      throw new Error('La source ne répond pas');
    };

    await expect(runExtraction(options(dataDir, failing))).rejects.toThrow(
      'La source ne répond pas',
    );

    expect(readFileSync(join(dataDir, '01-sport_events.json'), 'utf8')).toBe('"ancien"');
    expect(existsSync(join(dataDir, '04-data_extractions.json'))).toBe(false);
  });

  it('005-AS7: fails and keeps the data files when a page of a sport is missing', async () => {
    const { 'Athletics at the 2026 Summer Youth Olympics': _missing, ...others } = PAGES;

    await expect(runExtraction(options(dataDir, source(others)))).rejects.toThrow(/Athletics/);

    expect(readFileSync(join(dataDir, '01-sport_events.json'), 'utf8')).toBe('"ancien"');
  });

  it('005-AS3: keeps going when the page of an event does not exist yet', async () => {
    const { "Men's 100 metres": _missing, ...others } = PAGES;

    await runExtraction(options(dataDir, source(others)));

    const events = JSON.parse(readFileSync(join(dataDir, '01-sport_events.json'), 'utf8'));
    expect(events[0].starts_at).toBeNull();
  });

  it('005-AS7: shows a new and a corrected podium, then keeps them when the source stops responding', async () => {
    const pages = (silverFor100m: string) => ({
      ...PAGES,
      'Athletics at the 2026 Summer Youth Olympics': `===Men's events===
{| {{MedalistTable|columns=2}}
|-
| 100 m<br />{{DetailsLink|Men's 100 metres}}
| {{flagIOCmedalist|[[Gift Bright]]|NGR|2026 Summer Youth}}|| 10.28
| {{flagIOCmedalist|[[${silverFor100m}]]|NGR|2026 Summer Youth}}|| 10.57
|-
| 200 m<br />{{DetailsLink|Men's 200 metres}}
| ${silverFor100m === 'Corrigé' ? '{{flagIOCmedalist|[[Nouveau Podium]]|NGR|2026 Summer Youth}}|| 20.10' : '||'}
|}
`,
    });
    const events = {
      "Athletics|Men's events|100 m": { name: '100 m hommes', sport: 'athletisme' },
      "Athletics|Men's events|200 m": { name: '200 m hommes', sport: 'athletisme' },
    };
    const competitors = () =>
      (
        JSON.parse(readFileSync(join(dataDir, '02-sport_event_entries.json'), 'utf8')) as {
          competitor: string;
        }[]
      ).map((entry) => entry.competitor);
    const extractedOn = () =>
      (
        JSON.parse(readFileSync(join(dataDir, '04-data_extractions.json'), 'utf8')) as {
          extracted_on: string;
        }[]
      )[0]?.extracted_on;

    await runExtraction({
      ...options(dataDir, source(pages('Ancien'))),
      events,
      today: '2026-11-08',
    });
    expect(competitors()).toEqual(['Gift Bright', 'Ancien']);
    expect(extractedOn()).toBe('2026-11-08');

    await runExtraction({
      ...options(dataDir, source(pages('Corrigé'))),
      events,
      today: '2026-11-09',
    });
    expect(competitors()).toEqual(['Gift Bright', 'Corrigé', 'Nouveau Podium']);
    expect(extractedOn()).toBe('2026-11-09');

    const failing = async () => {
      throw new Error('La source ne répond pas');
    };
    await expect(
      runExtraction({ ...options(dataDir, failing), events, today: '2026-11-10' }),
    ).rejects.toThrow('La source ne répond pas');
    expect(competitors()).toEqual(['Gift Bright', 'Corrigé', 'Nouveau Podium']);
    expect(extractedOn()).toBe('2026-11-09');
  });
});
