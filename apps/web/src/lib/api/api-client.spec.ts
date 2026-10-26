import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { server } from '@/test/msw-server';
import { createApiClient } from './api-client';
import { ApiError } from './api-error';

const api = createApiClient({ baseUrl: '/api' });

describe('createApiClient', () => {
  it('renvoie la réponse validée par son schéma', async () => {
    server.use(http.get('*/api/ping', () => HttpResponse.json({ pong: true })));
    await expect(
      api.request('/ping', { schema: z.object({ pong: z.boolean() }) }),
    ).resolves.toEqual({ pong: true });
  });

  it('lève INVALID_RESPONSE si la réponse ne suit pas le schéma', async () => {
    server.use(http.get('*/api/ping', () => HttpResponse.json({ pong: 'oui' })));
    await expect(
      api.request('/ping', { schema: z.object({ pong: z.boolean() }) }),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('convertit un problem+json en ApiError, avec son code et ses détails', async () => {
    server.use(
      http.post('*/api/things', () =>
        HttpResponse.json(
          {
            type: 'urn:problem-type:thing-taken',
            title: 'Conflict',
            status: 409,
            code: 'THING_TAKEN',
            detail: 'Already exists',
            details: { name: 'x' },
          },
          { status: 409, headers: { 'content-type': 'application/problem+json' } },
        ),
      ),
    );
    const error = await api.request('/things', { method: 'POST', body: {} }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: 'THING_TAKEN', details: { name: 'x' } });
  });

  it('se replie sur HTTP_ERROR quand le corps n’est pas un problem+json', async () => {
    server.use(http.get('*/api/ping', () => new HttpResponse('Bad gateway', { status: 502 })));
    await expect(api.request('/ping')).rejects.toMatchObject({ status: 502, code: 'HTTP_ERROR' });
  });

  it('lève NETWORK_ERROR si le serveur est injoignable', async () => {
    server.use(http.get('*/api/ping', () => HttpResponse.error()));
    await expect(api.request('/ping')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
