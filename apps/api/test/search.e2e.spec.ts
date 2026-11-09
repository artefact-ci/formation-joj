import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { searchHitListSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { nations } from '../src/modules/medals/infra/medals.schema';
import { sportEventEntries, sportEvents } from '../src/modules/results/infra/results.schema';
import { createTestApp } from './create-test-app';

const sprintId = randomUUID();

describe('/api/search (e2e)', () => {
  let app: INestApplication;
  const search = (q: string) => request(app.getHttpServer()).get('/api/search').query({ q });

  beforeAll(async () => {
    app = await createTestApp();
    const db = app.get<Database>(DATABASE);
    await db.insert(nations).values({ code: 'sn', name: 'Sénégal', continent: 'afrique' });
    await db.insert(sportEvents).values({
      id: sprintId,
      sport: 'athletisme',
      name: '100 m hommes, finale',
      status: 'finished',
      startsAt: new Date('2026-11-08T18:32:00.000Z'),
    });
    await db.insert(sportEventEntries).values({
      id: randomUUID(),
      eventId: sprintId,
      nationCode: 'ke',
      nationName: 'Kenya',
      competitor: 'Gift Bright',
      rank: 1,
      performance: '10,28 s',
    });
  });

  afterAll(() => app?.close());

  it('004-AS4: finds a nation, a sport, an event and an athlete', async () => {
    const found = async (q: string) => {
      const response = await search(q).expect(200);
      return searchHitListSchema.parse(response.body);
    };

    expect((await found('senegal'))[0]).toMatchObject({ kind: 'nation', nation: 'sn' });
    expect((await found('natation'))[0]).toMatchObject({ kind: 'sport', sport: 'natation' });
    expect((await found('100 m'))[0]).toMatchObject({ kind: 'event', date: '2026-11-08' });
    expect((await found('bright'))[0]).toMatchObject({ kind: 'athlete', nation: 'ke' });
  });

  it('004-AS4: returns an empty list when nothing matches', async () => {
    const response = await search('zzz').expect(200);

    expect(response.body).toEqual([]);
  });

  it.each([
    ['two combining accents', '́́'],
    ['a decomposed « é »', 'é'],
  ])(
    '004-AS4: rejects a text without enough searchable characters (400, RFC 9457): %s',
    async (_name, q) => {
      const response = await search(q).expect(400);

      expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    },
  );

  it('004-AS4: rejects a text that is too short (400, RFC 9457)', async () => {
    const response = await search('a').expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });
});
