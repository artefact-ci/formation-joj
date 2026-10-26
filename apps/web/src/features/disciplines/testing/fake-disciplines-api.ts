import type { CreateDisciplineInput, DisciplineResponse, UpdateDisciplineInput } from '@joj/shared';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw-server';

export const lutte: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000003',
  name: 'Lutte',
  category: 'sports-de-combat',
  createdAt: '2026-10-01T08:00:00.000Z',
};

export const natation: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000004',
  name: 'Natation',
  category: 'sports-nautiques',
  createdAt: '2026-10-01T08:00:00.000Z',
};

export interface Problem {
  status: number;
  code: string;
}

const problem = ({ status, code }: Problem) =>
  HttpResponse.json(
    { type: 'urn:problem-type:x', title: 'Error', detail: 'Rejected', status, code },
    { status },
  );

/**
 * Une fausse API en mémoire : GET liste ou détail, POST ajoute, PATCH modifie, DELETE supprime, ou répond
 * l'erreur donnée pour cette méthode.
 */
export function fakeApi(
  initial: DisciplineResponse[],
  errors: { post?: Problem; patch?: Problem; delete?: Problem } = {},
) {
  const disciplines = [...initial];
  const posted: CreateDisciplineInput[] = [];
  const patched: { id: string; body: UpdateDisciplineInput }[] = [];
  const deleted: string[] = [];
  server.use(
    http.get('*/api/disciplines', () => HttpResponse.json(disciplines)),
    http.get('*/api/disciplines/:id', ({ params }) => {
      const found = disciplines.find((discipline) => discipline.id === params['id']);
      return found
        ? HttpResponse.json(found)
        : problem({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
    }),
    http.post('*/api/disciplines', async ({ request }) => {
      const body = (await request.json()) as CreateDisciplineInput;
      posted.push(body);
      if (errors.post) return problem(errors.post);
      const created = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      disciplines.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
    http.patch('*/api/disciplines/:id', async ({ request, params }) => {
      const id = String(params['id']);
      const body = (await request.json()) as UpdateDisciplineInput;
      patched.push({ id, body });
      if (errors.patch) return problem(errors.patch);
      const index = disciplines.findIndex((discipline) => discipline.id === id);
      const updated = { ...disciplines[index]!, ...body };
      disciplines[index] = updated;
      return HttpResponse.json(updated);
    }),
    http.delete('*/api/disciplines/:id', ({ params }) => {
      const id = String(params['id']);
      deleted.push(id);
      if (errors.delete) return problem(errors.delete);
      disciplines.splice(
        disciplines.findIndex((discipline) => discipline.id === id),
        1,
      );
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return { posted, patched, deleted };
}
