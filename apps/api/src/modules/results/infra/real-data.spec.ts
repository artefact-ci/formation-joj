import { readFileSync } from 'node:fs';
import {
  continentSchema,
  GAMES_FIRST_DAY,
  GAMES_LAST_DAY,
  MIXED_TEAM_CODE,
  sportEventStatusSchema,
  sportSlugSchema,
} from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const eventsSchema = z.array(
  z.object({
    id: z.string(),
    sport: sportSlugSchema,
    name: z.string(),
    status: sportEventStatusSchema,
    starts_at: z.string().nullable(),
  }),
);
const entriesSchema = z.array(
  z.object({
    event_id: z.string(),
    nation_code: z.string(),
    nation_name: z.string(),
    competitor: z.string(),
    rank: z.number(),
    performance: z.string().nullable(),
  }),
);
const nationsSchema = z.array(z.object({ code: z.string(), continent: continentSchema }));

function readData(fileName: string): unknown {
  const url = new URL(`../../../../data/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

const events = () => eventsSchema.parse(readData('01-sport_events.json'));
const entries = () => entriesSchema.parse(readData('02-sport_event_entries.json'));
const nations = () => nationsSchema.parse(readData('03-nations.json'));

function podiumOf(name: string, sport: string) {
  const event = events().find((candidate) => candidate.name === name && candidate.sport === sport);
  return entries()
    .filter((entry) => entry.event_id === event?.id)
    .map(({ rank, nation_name, competitor, performance }) => [
      rank,
      nation_name,
      competitor,
      performance,
    ]);
}

describe('real data files', () => {
  it('005-AS1: contains the real podium of the men 100 m and no demonstration name', () => {
    expect(podiumOf('100 m hommes', 'athletisme')).toEqual([
      [1, 'Nigeria', 'Gift Bright', '10,28 s'],
      [2, 'Chine', 'Zhang Hangyu', '10,57 s'],
      [3, 'Pologne', 'Szymon Dołęga', '10,61 s'],
    ]);
    expect(events()).toHaveLength(151);
    expect(JSON.stringify(entries())).not.toMatch(/Démo/);
  });

  it('005-AS1: dates the men 100 m on 8 November', () => {
    const sprint = events().find(
      (event) => event.name === '100 m hommes' && event.sport === 'athletisme',
    );

    expect(sprint?.starts_at?.slice(0, 10)).toBe('2026-11-08');
  });

  it('005-AS3: dates the men 400 m on the day of its final', () => {
    const lap = events().find(
      (event) => event.name === '400 m hommes' && event.sport === 'athletisme',
    );

    expect(lap?.starts_at?.slice(0, 10)).toBe('2026-11-09');
  });

  it('005-AS1: dates every event within the Games, or not at all', () => {
    expect(
      events()
        .filter(
          ({ starts_at: day }) =>
            day !== null &&
            (day.slice(0, 10) < GAMES_FIRST_DAY || day.slice(0, 10) > GAMES_LAST_DAY),
        )
        .map((event) => event.name),
    ).toEqual([]);
  });

  it('005-AS3: gives no medalist to an event that is not finished', () => {
    const finished = new Set(
      events()
        .filter((event) => event.status === 'finished')
        .map((event) => event.id),
    );

    expect(entries().filter((entry) => !finished.has(entry.event_id))).toEqual([]);
  });

  it('005-AS4: lists the 205 delegations, and every medalist nation among them', () => {
    const known = new Set(nations().map((nation) => nation.code));

    expect(nations()).toHaveLength(205);
    expect(
      entries()
        .map((entry) => entry.nation_code)
        .filter((code) => code !== MIXED_TEAM_CODE && !known.has(code)),
    ).toEqual([]);
  });
});
