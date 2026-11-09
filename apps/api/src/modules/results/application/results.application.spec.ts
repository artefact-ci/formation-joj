import { randomUUID } from 'node:crypto';
import type { SportEventStatus, SportSlug } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { SportEvent } from '../domain/sport-event';
import { InMemorySportEventRepository } from './testing/in-memory-sport-event.repository';
import { DataSourceNotFoundError } from '../domain/data-source';
import { GetDataSource } from './use-cases/get-data-source';
import { ListDayCalendar } from './use-cases/list-day-calendar';
import { ListDayResults } from './use-cases/list-day-results';
import { ListLatestResults } from './use-cases/list-latest-results';
import { ListLiveEvents } from './use-cases/list-live-events';
import { ListNationAthletes } from './use-cases/list-nation-athletes';
import { ListUndatedEvents } from './use-cases/list-undated-events';

function sportEvent(sport: SportSlug, name: string, startsAt: string): SportEvent {
  return SportEvent.restore({
    id: randomUUID(),
    sport,
    name,
    startsAt: new Date(startsAt),
    hasStartTime: true,
    status: 'scheduled',
    awardsMedals: true,
    entries: [],
  });
}

function eventWithStatus(
  sport: SportSlug,
  name: string,
  status: SportEventStatus,
  participants: [nationCode: string, competitor: string][] = [],
  startsAt = '2026-11-08T10:00:00.000Z',
  awardsMedals = true,
): SportEvent {
  return SportEvent.restore({
    id: randomUUID(),
    sport,
    name,
    startsAt: new Date(startsAt),
    hasStartTime: true,
    status,
    awardsMedals,
    entries: participants.map(([nationCode, competitor]) => ({
      rank: null,
      nationCode,
      nationName: nationCode,
      competitor,
      performance: null,
      mention: null,
    })),
  });
}

describe('results (application layer)', () => {
  it('001-AS1: lists only the events of the requested day, by sport then by time', async () => {
    const futsal = sportEvent('futsal', 'Demi-finale', '2026-11-08T09:00:00.000Z');
    const lateRace = sportEvent('athletisme', '100 m, finale', '2026-11-08T18:32:00.000Z');
    const earlyRace = sportEvent('athletisme', '3 000 m', '2026-11-08T10:00:00.000Z');
    const nextDay = sportEvent('athletisme', 'Relais', '2026-11-09T00:00:00.000Z');
    const repository = new InMemorySportEventRepository([futsal, lateRace, earlyRace, nextDay]);

    const events = await new ListDayResults(repository).execute({ date: '2026-11-08' });

    expect(events.map((event) => event.name)).toEqual(['3 000 m', '100 m, finale', 'Demi-finale']);
  });

  it('003-AS1: the calendar of a day keeps only the scheduled events', async () => {
    const repository = new InMemorySportEventRepository([
      eventWithStatus('futsal', 'Hommes, demi-finale', 'scheduled'),
      eventWithStatus('athletisme', '100 m hommes, finale', 'finished'),
      eventWithStatus('athletisme', 'Saut en longueur', 'in-progress'),
    ]);

    const events = await new ListDayCalendar(repository).execute({ date: '2026-11-08' });

    expect(events.map((event) => event.name)).toEqual(['Hommes, demi-finale']);
  });

  it('003-AS2: the calendar keeps only the chosen sport', async () => {
    const repository = new InMemorySportEventRepository([
      eventWithStatus('natation', '100 m nage libre', 'scheduled'),
      eventWithStatus('judo', '-73 kg', 'scheduled'),
    ]);

    const events = await new ListDayCalendar(repository).execute({
      date: '2026-11-08',
      sport: 'natation',
    });

    expect(events.map((event) => event.sport)).toEqual(['natation']);
  });

  it('003-AS5: the results of a day keep only the events of the chosen nation', async () => {
    const repository = new InMemorySportEventRepository([
      eventWithStatus('athletisme', '100 m hommes, finale', 'finished', [['sn', 'Awa Diop']]),
      eventWithStatus('cyclisme-sur-route', 'Course en ligne femmes', 'finished', [
        ['no', 'Cycliste'],
      ]),
    ]);

    const events = await new ListDayResults(repository).execute({
      date: '2026-11-08',
      nation: 'sn',
    });

    expect(events.map((event) => event.name)).toEqual(['100 m hommes, finale']);
  });

  it('003-AS6: lists the athletes of a nation for the day, by time then by name', async () => {
    const repository = new InMemorySportEventRepository([
      eventWithStatus(
        'futsal',
        'Hommes, demi-finale',
        'scheduled',
        [
          ['sn', 'Équipe du Sénégal'],
          ['br', 'Équipe du Brésil'],
        ],
        '2026-11-08T20:30:00.000Z',
      ),
      eventWithStatus(
        'athletisme',
        '100 m hommes, finale',
        'finished',
        [
          ['sn', 'Moussa Fall'],
          ['sn', 'Awa Diop'],
        ],
        '2026-11-08T09:00:00.000Z',
      ),
      eventWithStatus(
        'judo',
        'Lendemain',
        'scheduled',
        [['sn', 'Absent']],
        '2026-11-09T09:00:00.000Z',
      ),
    ]);

    const athletes = await new ListNationAthletes(repository).execute({
      date: '2026-11-08',
      nation: 'sn',
    });

    expect(
      athletes.map(({ competitor, eventName, status }) => [competitor, eventName, status]),
    ).toEqual([
      ['Awa Diop', '100 m hommes, finale', 'finished'],
      ['Moussa Fall', '100 m hommes, finale', 'finished'],
      ['Équipe du Sénégal', 'Hommes, demi-finale', 'scheduled'],
    ]);
  });

  it('004-AS3: gives the three latest finished events, from the latest to the oldest', async () => {
    const finished = (name: string, startsAt: string, awardsMedals = true) =>
      eventWithStatus('athletisme', name, 'finished', [], startsAt, awardsMedals);
    const repository = new InMemorySportEventRepository([
      finished('Ancienne', '2026-11-07T10:00:00.000Z'),
      finished('Troisième', '2026-11-08T09:00:00.000Z'),
      finished('Première', '2026-11-08T18:00:00.000Z'),
      finished('Deuxième', '2026-11-08T16:00:00.000Z'),
      finished('Manche récente', '2026-11-08T19:00:00.000Z', false),
      eventWithStatus('futsal', 'En cours', 'in-progress', [], '2026-11-08T20:00:00.000Z'),
    ]);

    const events = await new ListLatestResults(repository).execute();

    expect(events.map((event) => event.name)).toEqual(['Première', 'Deuxième', 'Troisième']);
  });

  it('004-AS6: the live page keeps only the events in progress, by time', async () => {
    const repository = new InMemorySportEventRepository([
      eventWithStatus('futsal', 'Plus tard', 'in-progress', [], '2026-11-08T20:00:00.000Z'),
      eventWithStatus('athletisme', 'Plus tôt', 'in-progress', [], '2026-11-08T09:00:00.000Z'),
      eventWithStatus('judo', 'Programmée', 'scheduled'),
      eventWithStatus('voile', 'Terminée', 'finished'),
    ]);

    const events = await new ListLiveEvents(repository).execute();

    expect(events.map((event) => event.name)).toEqual(['Plus tôt', 'Plus tard']);
  });

  it('005-AS2: gives the source of the data and the day of its extraction', async () => {
    const source = {
      name: 'Wikipédia',
      license: 'CC BY-SA',
      url: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
      extractedOn: '2026-11-08',
    };
    const repository = new InMemorySportEventRepository([], source);

    expect(await new GetDataSource(repository).execute()).toEqual(source);
  });

  it('005-AS2: refuses when no extraction has been loaded', async () => {
    const repository = new InMemorySportEventRepository();

    await expect(new GetDataSource(repository).execute()).rejects.toMatchObject({
      code: 'DATA_SOURCE_NOT_FOUND',
      kind: 'NOT_FOUND',
    });
    await expect(new GetDataSource(repository).execute()).rejects.toBeInstanceOf(
      DataSourceNotFoundError,
    );
  });

  it('005-AS3: lists the events whose day the source does not give', async () => {
    const undated = {
      id: randomUUID(),
      sport: 'boxe' as const,
      name: '-51 kg hommes',
      status: 'unpublished' as const,
      ranking: [],
    };
    const repository = new InMemorySportEventRepository([], null, [undated]);

    expect(await new ListUndatedEvents(repository).execute()).toEqual([undated]);
  });
});
