import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import {
  dataSourceSchema,
  nationAthleteListSchema,
  sportEventListSchema,
  undatedEventListSchema,
} from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import {
  dataExtractions,
  sportEventEntries,
  sportEvents,
} from '../src/modules/results/infra/results.schema';
import { createTestApp } from './create-test-app';

const finalId = randomUUID();
const scheduledId = randomUUID();
const judoId = randomUUID();
const liveId = randomUUID();

describe('/api/results (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    const db = app.get<Database>(DATABASE);
    await db.insert(sportEvents).values([
      {
        id: finalId,
        sport: 'athletisme',
        name: '100 m hommes, finale',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T18:32:00.000Z'),
      },
      {
        id: scheduledId,
        sport: 'futsal',
        name: 'Demi-finale',
        status: 'scheduled',
        startsAt: new Date('2026-11-08T20:00:00.000Z'),
      },
      {
        id: judoId,
        sport: 'judo',
        name: '-60 kg hommes, finale',
        status: 'finished',
        awardsMedals: true,
        startsAt: new Date('2026-11-08T10:00:00.000Z'),
      },
      {
        id: liveId,
        sport: 'natation',
        name: '100 m nage libre, finale',
        status: 'in-progress',
        startsAt: new Date('2026-11-09T10:00:00.000Z'),
      },
    ]);
    await db.insert(sportEventEntries).values([
      {
        id: randomUUID(),
        eventId: scheduledId,
        nationCode: 'sn',
        nationName: 'Sénégal',
        competitor: 'Équipe du Sénégal',
      },
      {
        id: randomUUID(),
        eventId: judoId,
        nationCode: 'sn',
        nationName: 'Sénégal',
        competitor: 'Judoka Sénégal',
        rank: 2,
        performance: 'Ippon',
      },
      {
        id: randomUUID(),
        eventId: judoId,
        nationCode: 'jp',
        nationName: 'Japon',
        competitor: 'Judoka Japon',
        rank: 1,
        performance: 'Ippon',
      },
    ]);
    await db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: finalId,
      nationCode: 'ke',
      nationName: 'Kenya',
      competitor: 'Gift Bright',
      rank: 1,
      performance: '10,28 s',
    });
  });

  afterAll(() => app?.close());

  it.each(['0000-01-01', '9999-12-31', '2026-10-30', '2026-11-14'])(
    '001-AS1: rejects a day outside the Games (400, RFC 9457): %s',
    async (date) => {
      const response = await api().get('/api/results').query({ date }).expect(400);

      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    },
  );

  it.each(['2026-10-31', '2026-11-13'])(
    '001-AS1: accepts the first and last days of the Games: %s',
    async (date) => {
      const response = await api().get('/api/results').query({ date });

      expect(response.status).toBe(200);
    },
  );

  it('001-AS2: applies the sport filter', async () => {
    const response = await api()
      .get('/api/results')
      .query({ date: '2026-11-08', sport: 'futsal' })
      .expect(200);

    expect(sportEventListSchema.parse(response.body).map((event) => event.id)).toEqual([
      scheduledId,
    ]);
  });

  it('001-AS2: rejects an unknown sport (400, RFC 9457)', async () => {
    const response = await api()
      .get('/api/results')
      .query({ date: '2026-11-08', sport: 'quidditch' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('001-AS3: returns the rank, nation, competitor and performance of a finished event', async () => {
    const response = await api().get('/api/results').query({ date: '2026-11-08' }).expect(200);

    expect(sportEventListSchema.parse(response.body)[0]).toEqual({
      id: finalId,
      sport: 'athletisme',
      name: '100 m hommes, finale',
      startsAt: '2026-11-08T18:32:00.000Z',
      hasStartTime: false,
      status: 'finished',
      ranking: [
        {
          rank: 1,
          nationCode: 'ke',
          nationName: 'Kenya',
          competitor: 'Gift Bright',
          performance: '10,28 s',
          mention: null,
        },
      ],
    });
  });

  it('003-AS1: the calendar returns only the scheduled events of the day', async () => {
    const response = await api()
      .get('/api/results/calendar')
      .query({ date: '2026-11-08' })
      .expect(200);

    expect(sportEventListSchema.parse(response.body)).toEqual([
      expect.objectContaining({ id: scheduledId, status: 'scheduled', ranking: [] }),
    ]);
  });

  it('003-AS5: applies the nation filter and keeps the complete ranking', async () => {
    const response = await api()
      .get('/api/results')
      .query({ date: '2026-11-08', nation: 'sn' })
      .expect(200);

    const events = sportEventListSchema.parse(response.body);
    expect(events.map((event) => event.id)).toEqual([scheduledId, judoId]);
    expect(events[1]?.ranking.map((entry) => entry.nationCode)).toEqual(['jp', 'sn']);
  });

  it('003-AS6: returns the athletes of the nation for the day', async () => {
    const response = await api()
      .get('/api/results/athletes')
      .query({ date: '2026-11-08', nation: 'sn' })
      .expect(200);

    expect(nationAthleteListSchema.parse(response.body)).toEqual([
      {
        competitor: 'Judoka Sénégal',
        eventId: judoId,
        eventName: '-60 kg hommes, finale',
        sport: 'judo',
        startsAt: '2026-11-08T10:00:00.000Z',
        hasStartTime: false,
        status: 'finished',
      },
      {
        competitor: 'Équipe du Sénégal',
        eventId: scheduledId,
        eventName: 'Demi-finale',
        sport: 'futsal',
        startsAt: '2026-11-08T20:00:00.000Z',
        hasStartTime: false,
        status: 'scheduled',
      },
    ]);
  });

  it('003-AS6: rejects a badly written nation (400, RFC 9457)', async () => {
    const response = await api()
      .get('/api/results/athletes')
      .query({ date: '2026-11-08', nation: 'senegal' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('004-AS3: returns the latest finished events, with their ranking', async () => {
    const response = await api().get('/api/results/latest').expect(200);

    const events = sportEventListSchema.parse(response.body);
    expect(events.map((event) => event.id)).toEqual([finalId, judoId]);
    expect(events[1]?.ranking.map((entry) => entry.nationCode)).toEqual(['jp', 'sn']);
  });

  it('004-AS6: returns only the events in progress', async () => {
    const response = await api().get('/api/results/live').expect(200);

    expect(sportEventListSchema.parse(response.body)).toEqual([
      expect.objectContaining({ id: liveId, status: 'in-progress', ranking: [] }),
    ]);
  });

  it('005-AS2: refuses when no extraction is loaded, then returns the source', async () => {
    const missing = await api().get('/api/results/source').expect(404);
    expect(missing.body).toMatchObject({ status: 404, code: 'DATA_SOURCE_NOT_FOUND' });

    await app.get<Database>(DATABASE).insert(dataExtractions).values({
      extractedOn: '2026-11-08',
      sourceName: 'Wikipédia',
      sourceUrl: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
      license: 'CC BY-SA',
    });

    const response = await api().get('/api/results/source').expect(200);
    expect(dataSourceSchema.parse(response.body)).toEqual({
      name: 'Wikipédia',
      license: 'CC BY-SA',
      url: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
      extractedOn: '2026-11-08',
    });
  });

  it('005-AS3: returns the events whose day is unknown', async () => {
    const db = app.get<Database>(DATABASE);
    await db.insert(sportEvents).values({
      id: randomUUID(),
      sport: 'boxe',
      name: '-51 kg hommes',
      status: 'unpublished',
    });

    const response = await api().get('/api/results/undated').expect(200);

    expect(undatedEventListSchema.parse(response.body)).toEqual([
      expect.objectContaining({
        sport: 'boxe',
        name: '-51 kg hommes',
        status: 'unpublished',
        ranking: [],
      }),
    ]);
  });
});
