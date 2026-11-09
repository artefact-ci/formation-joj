import { describe, expect, it } from 'vitest';
import {
  buildDataFiles,
  type EventReference,
  formatPerformance,
  type NationReference,
  parseAnnouncedMedals,
  parseMedalistEvents,
  readEventDay,
  readFinalDays,
  statusFor,
} from './extract-core.mts';

const ATHLETICS = `==Medal summary==
===Men's events===
{| {{MedalistTable|columns=2}}
|-
| 100 m<br />{{DetailsLink|Athletics at the 2026 Summer Youth Olympics – Men's 100 metres}}
| {{flagIOCmedalist|[[Gift Bright]]|NGR|2026 Summer Youth}}|| 10.28 {{AthAbbr|PB}}
| {{flagIOCmedalist|[[Zhang Hangyu]]|CHN|2026 Summer Youth}} || 10.57
| {{flagIOCmedalist|[[Szymon Dołęga]]|POL|2026 Summer Youth}} || 10.61
|-
| 200 m<br />{{DetailsLink|Athletics at the 2026 Summer Youth Olympics – Men's 200 metres}}
| ||
| ||
| ||
|}
`;

const JUDO = `===Medallists===
====Men's events====
{| {{MedalistTable|type=Event}}
|-
| rowspan=2| 66&nbsp;kg
| rowspan=2| {{flagIOCmedalist|Khazar Heydarov|UKR|2026 Summer Youth}}
| rowspan=2| {{flagIOCmedalist|[[Anes Mati (judoka)|Anes Mati]]|CAN|2026 Summer Youth}}
| {{flagIOCmedalist|Thiago Carvallo|ARG|2026 Summer Youth}}
|-
| {{flagIOCmedalist|Matar Diop|SEN|2026 Summer Youth}}
|}
`;

const RUGBY = `===Medalists===
{| {{MedalistTable|type=Event}}
|-
|Men<br>{{DetailsLink|Rugby sevens at the 2026 Summer Youth Olympics – Men's tournament}}
|{{flagIOC|FRA|2026 Summer Youth}}<br />[[Noah Champet]]<br />[[Roman Delample]]
|{{flagIOC|RSA|2026 Summer Youth}}<br />[[Joueur Un]]
|{{flagIOCmedalist|Équipe Asie|MIX|2026 Summer Youth}}
|}
`;

const NATIONS: Record<string, NationReference> = {
  NGR: { code: 'ng', name: 'Nigeria', continent: 'afrique' },
  CHN: { code: 'cn', name: 'Chine', continent: 'asie' },
  POL: { code: 'pl', name: 'Pologne', continent: 'europe' },
  SEN: { code: 'sn', name: 'Sénégal', continent: 'afrique' },
};

const EVENTS: Record<string, EventReference> = {
  "Athletics|Men's events|100 m": { name: '100 m hommes', sport: 'athletisme' },
  "Athletics|Men's events|200 m": { name: '200 m hommes', sport: 'athletisme' },
};

const MAIN = `{{flagIOC|NGR|2026 Summer Youth|12}}
{{flagIOC|CHN|2026 Summer Youth|40}}
{{flagIOC|POL|2026 Summer Youth|30}}
{{flagIOC|SEN|2026 Summer Youth|80}}
==Medal table==
 | gold_CHN = 11| silver_CHN = 4 | bronze_CHN = 2
 | gold_NGR = 2 | silver_NGR = 0 | bronze_NGR = 0
`;

const input = (overrides = {}) => ({
  main: MAIN,
  sportPages: { Athletics: ATHLETICS },
  eventPages: {
    "Athletics at the 2026 Summer Youth Olympics – Men's 100 metres":
      "| dates = 8 November\n| bgcolor=\"lemonchiffon\" | '''17:32'''\n| bgcolor=\"lemonchiffon\" | '''Final'''\n",
  },
  today: '2026-11-09',
  nations: NATIONS,
  events: EVENTS,
  ...overrides,
});

describe('reading the medalist tables', () => {
  it('005-AS1: reads a podium with its medalists, nations and performances', () => {
    const [sprint] = parseMedalistEvents('Athletics', ATHLETICS);

    expect(sprint?.key).toBe("Athletics|Men's events|100 m");
    expect(sprint?.link).toBe("Athletics at the 2026 Summer Youth Olympics – Men's 100 metres");
    expect(sprint?.medals).toEqual([
      { rank: 1, noc: 'NGR', competitor: 'Gift Bright', isTeam: false, performance: '10.28' },
      { rank: 2, noc: 'CHN', competitor: 'Zhang Hangyu', isTeam: false, performance: '10.57' },
      { rank: 3, noc: 'POL', competitor: 'Szymon Dołęga', isTeam: false, performance: '10.61' },
    ]);
  });

  it('005-AS1: gives the third rank to both bronze medalists', () => {
    const [judo] = parseMedalistEvents('Judo', JUDO);

    expect(judo?.key).toBe("Judo|Men's events|66 kg");
    expect(judo?.medals.map(({ rank, noc, competitor }) => [rank, noc, competitor])).toEqual([
      [1, 'UKR', 'Khazar Heydarov'],
      [2, 'CAN', 'Anes Mati'],
      [3, 'ARG', 'Thiago Carvallo'],
      [3, 'SEN', 'Matar Diop'],
    ]);
  });

  it('005-AS1: gives gold to both swimmers of a tie, and no silver', () => {
    const [tie] = parseMedalistEvents(
      'Swimming',
      `===Men's events===
{| {{MedalistTable|columns=2}}
|-
| rowspan=2|50 m backstroke<br>{{DetailsLink|Swimming – Men's 50 metre backstroke}}
| {{flagIOCmedalist|[[Nikolaos Papatheodorou]]|GRE|2026 Summer Youth}} || rowspan=2|25.69
| colspan=2 rowspan=2|''Not awarded''
| rowspan=2|{{flagIOCmedalist|[[Alexander Van Hoey Billiet]]|BEL|2026 Summer Youth}} || rowspan=2|25.91
|-
| {{flagIOCmedalist|[[Miguel Reis Oliveira]]|POR|2026 Summer Youth}}
|}
`,
    );

    expect(tie?.medals.map(({ rank, noc, performance }) => [rank, noc, performance])).toEqual([
      [1, 'GRE', '25.69'],
      [3, 'BEL', '25.91'],
      [1, 'POR', '25.69'],
    ]);
  });

  it('005-AS1: reads a team as a single medal, without its players', () => {
    const [rugby] = parseMedalistEvents('Rugby_sevens', RUGBY);

    expect(rugby?.medals[0]).toEqual({
      rank: 1,
      noc: 'FRA',
      competitor: null,
      isTeam: true,
      performance: null,
    });
  });

  it('005-AS1: writes a performance the French way', () => {
    expect(formatPerformance('10.28', 'athletisme', '100 m')).toBe('10,28 s');
    expect(formatPerformance('1:47.78', 'natation', '200 m freestyle')).toBe('1:47,78');
    expect(formatPerformance('24.31', 'natation', '50 m freestyle')).toBe('24,31 s');
    expect(formatPerformance('7.85', 'athletisme', 'Long jump')).toBe('7,85');
    expect(formatPerformance('', 'judo', '66 kg')).toBeNull();
  });
});

describe('reading the days', () => {
  it('005-AS3: reads the day and the time of a final on the page of the event', () => {
    expect(
      readEventDay(
        "| dates = 8 November\n| bgcolor=\"lemonchiffon\" | '''17:32'''\n| bgcolor=\"lemonchiffon\" | '''Final'''\n",
      ),
    ).toEqual({ day: '2026-11-08', time: '17:32' });
  });

  it('005-AS3: takes the last day of a date range, which is the day of the final', () => {
    expect(readEventDay('| dates = 8–10 November\n')).toEqual({ day: '2026-11-10', time: null });
  });

  it('005-AS3: does not guess a day that the page does not give', () => {
    expect(readEventDay('')).toEqual({ day: null, time: null });
    expect(readEventDay('Tournoi prévu en 2026, sans autre précision.')).toEqual({
      day: null,
      time: null,
    });
  });

  it('005-AS1: ignores a day outside the Games and reads the schedule of the sport instead', () => {
    expect(readEventDay('| date = 8 October 2026\n')).toEqual({ day: null, time: null });

    const files = buildDataFiles(
      input({
        sportPages: {
          Athletics: `${ATHLETICS}
==Schedule==
{| class="wikitable"
! Event ↓ / Date → || colspan=2| Sun 8 || colspan=2| Mon 9
|- align="center"
| align="left"| Men's 100 m || bgcolor="#D9FFB2"|SF || bgcolor="#FFDF80" |F || colspan=2|
|}
`,
        },
        eventPages: {
          "Athletics at the 2026 Summer Youth Olympics – Men's 100 metres":
            "| date = 8 October 2026\n| bgcolor=\"lemonchiffon\" | '''17:32'''\n| bgcolor=\"lemonchiffon\" | '''Final'''\n",
        },
      }),
    );

    expect(files['01-sport_events.json'][0]).toMatchObject({
      name: '100 m hommes',
      starts_at: '2026-11-08T00:00:00.000Z',
      has_start_time: false,
    });
  });

  it('005-AS3: prefers the day of the final in the schedule of the sport to the header of the event', () => {
    const schedule = `
==Schedule==
{| class="wikitable"
! Event ↓ / Date → || colspan=2| Sun 8 || colspan=2| Mon 9
|- align="center"
| align="left"| Men's 100 m || bgcolor="#D9FFB2"|SF || colspan=2| || bgcolor="#FFDF80" |F
|}
`;
    const header = (time: string) =>
      `| date = 8 November\n| bgcolor="lemonchiffon" | '''${time}'''\n| bgcolor="lemonchiffon" | '''Final'''\n`;
    const sprintPage = "Athletics at the 2026 Summer Youth Olympics – Men's 100 metres";

    const files = buildDataFiles(
      input({
        sportPages: { Athletics: `${ATHLETICS}${schedule}` },
        eventPages: { [sprintPage]: header('17:32') },
      }),
    );

    expect(files['01-sport_events.json'][0]).toMatchObject({
      name: '100 m hommes',
      starts_at: '2026-11-09T00:00:00.000Z',
      has_start_time: false,
    });
  });

  it('005-AS3: keeps the time of the header when the schedule gives the same day', () => {
    const files = buildDataFiles(
      input({
        sportPages: {
          Athletics: `${ATHLETICS}
==Schedule==
{| class="wikitable"
! Event ↓ / Date → || colspan=2| Sun 8 || colspan=2| Mon 9
|- align="center"
| align="left"| Men's 100 m || bgcolor="#D9FFB2"|SF || bgcolor="#FFDF80" |F || colspan=2|
|}
`,
        },
      }),
    );

    expect(files['01-sport_events.json'][0]).toMatchObject({
      starts_at: '2026-11-08T17:32:00.000Z',
      has_start_time: true,
    });
  });

  it('005-AS3: reads the day of a final in the schedule of a sport', () => {
    const page = `==Schedule==
{| class="wikitable"
! Event ↓ / Date → || width="20px" colspan=2| Sun 8 || width="40px" colspan=2| Mon 9 || width="40px" colspan=2| Tue 10
|- align="center"
| align="left"| Men's 100 m || bgcolor="#D9FFB2"|SF || bgcolor="#FFDF80" |F || colspan=2| || colspan=2|
|- align="center"
| align="left"| Men's 200 m || colspan=2| || colspan=2| || bgcolor="#D9FFB2"|SF || bgcolor="#FFDF80" |F
|}
`;

    expect(readFinalDays(page)).toEqual({
      "Men's 100 m": '2026-11-08',
      "Men's 200 m": '2026-11-10',
    });
  });

  it('005-AS3: decides the status from the podium and the day', () => {
    expect(statusFor(true, '2026-11-08', '2026-11-09')).toBe('finished');
    expect(statusFor(true, null, '2026-11-09')).toBe('finished');
    expect(statusFor(false, '2026-11-07', '2026-11-09')).toBe('unpublished');
    expect(statusFor(false, null, '2026-11-09')).toBe('unpublished');
    expect(statusFor(false, '2026-11-09', '2026-11-09')).toBe('scheduled');
    expect(statusFor(false, '2026-11-12', '2026-11-09')).toBe('scheduled');
  });
});

describe('building the data files', () => {
  it('005-AS1: builds the events and the medalists, in French, with the source', () => {
    const files = buildDataFiles(input());

    const events = files['01-sport_events.json'];
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      sport: 'athletisme',
      name: '100 m hommes',
      status: 'finished',
      awards_medals: true,
      starts_at: '2026-11-08T17:32:00.000Z',
      has_start_time: true,
    });
    expect(files['02-sport_event_entries.json'][0]).toMatchObject({
      nation_code: 'ng',
      nation_name: 'Nigeria',
      competitor: 'Gift Bright',
      rank: 1,
      performance: '10,28 s',
    });
    expect(files['04-data_extractions.json']).toEqual([
      {
        extracted_on: '2026-11-09',
        source_name: 'Wikipédia',
        source_url: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
        license: 'CC BY-SA',
      },
    ]);
  });

  it('005-AS3: keeps an event without a podium or a day, with no date and no result', () => {
    const files = buildDataFiles(input());

    expect(files['01-sport_events.json'][1]).toMatchObject({
      name: '200 m hommes',
      status: 'unpublished',
      starts_at: null,
      has_start_time: false,
    });
    expect(files['02-sport_event_entries.json']).toHaveLength(3);
  });

  it('005-AS4: lists every delegation, with the table announced by the source', () => {
    const files = buildDataFiles(input());

    expect(files['03-nations.json'].map((nation) => nation.code)).toEqual(['cn', 'ng', 'pl', 'sn']);
    expect(files['03-nations.json'][0]).toEqual({
      code: 'cn',
      name: 'Chine',
      continent: 'asie',
      announced_gold: 11,
      announced_silver: 4,
      announced_bronze: 2,
    });
    expect(parseAnnouncedMedals(MAIN)).toEqual({
      CHN: { gold: 11, silver: 4, bronze: 2 },
      NGR: { gold: 2, silver: 0, bronze: 0 },
    });
  });

  it('005-AS6: gives the code of no nation to a team of several nations', () => {
    const files = buildDataFiles(
      input({
        sportPages: { Rugby_sevens: RUGBY },
        events: { 'Rugby_sevens|Medalists|Men': { name: 'Tournoi hommes', sport: 'rugby-a-7' } },
        nations: {
          ...NATIONS,
          FRA: { code: 'fr', name: 'France', continent: 'europe' },
          RSA: { code: 'za', name: 'Afrique du Sud', continent: 'afrique' },
        },
        main: `${MAIN}\n{{flagIOC|FRA|2026 Summer Youth|1}}\n{{flagIOC|RSA|2026 Summer Youth|1}}`,
      }),
    );

    const entries = files['02-sport_event_entries.json'];
    expect(entries[0]).toMatchObject({ nation_code: 'fr', competitor: 'Équipe : France' });
    expect(entries[2]).toMatchObject({
      nation_code: 'xx',
      nation_name: 'Équipe mixte',
      competitor: 'Équipe Asie',
    });
    expect(files['03-nations.json'].map((nation) => nation.code)).not.toContain('xx');
  });

  it('005-AS7: fails on an unknown event, naming it, instead of keeping a partial result', () => {
    expect(() => buildDataFiles(input({ events: {} }))).toThrow(/Athletics\|Men's events\|100 m/);
  });

  it('005-AS7: fails on an unknown nation, naming its code', () => {
    const { POL: _unused, ...withoutPoland } = NATIONS;

    expect(() => buildDataFiles(input({ nations: withoutPoland }))).toThrow(/POL/);
  });

  it('005-AS7: fails when the source gives no event at all', () => {
    expect(() => buildDataFiles(input({ sportPages: { Athletics: 'page vide' } }))).toThrow(
      /aucune épreuve/,
    );
  });
});
