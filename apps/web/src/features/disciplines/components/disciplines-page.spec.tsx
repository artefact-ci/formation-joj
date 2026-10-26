import type { CreateDisciplineInput, DisciplineResponse, UpdateDisciplineInput } from '@joj/shared';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw-server';
import { renderWithQuery } from '@/test/render';
import { DisciplinesPage } from './disciplines-page';

const lutte: DisciplineResponse = {
  id: '0199f5c2-0000-7000-8000-000000000003',
  name: 'Lutte',
  category: 'sports-de-combat',
  createdAt: '2026-10-01T08:00:00.000Z',
};

interface Problem {
  status: number;
  code: string;
}

const problem = ({ status, code }: Problem) =>
  HttpResponse.json(
    { type: 'urn:problem-type:x', title: 'Error', detail: 'Rejected', status, code },
    { status },
  );

/**
 * Une fausse API en mémoire : GET liste, POST ajoute, PATCH modifie, DELETE supprime, ou répond
 * l'erreur donnée pour cette méthode.
 */
function fakeApi(
  initial: DisciplineResponse[],
  errors: { post?: Problem; patch?: Problem; delete?: Problem } = {},
) {
  const disciplines = [...initial];
  const posted: CreateDisciplineInput[] = [];
  const patched: { id: string; body: UpdateDisciplineInput }[] = [];
  const deleted: string[] = [];
  server.use(
    http.get('*/api/disciplines', () => HttpResponse.json(disciplines)),
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

async function fillForm(name: string, category: string) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText('Nom'), name);
  await user.selectOptions(screen.getByLabelText('Catégorie'), category);
  await user.click(screen.getByRole('button', { name: 'Ajouter' }));
}

describe('DisciplinesPage', () => {
  it('AS5: shows the disciplines returned by the API, with their category', async () => {
    fakeApi([lutte]);
    renderWithQuery(<DisciplinesPage />);

    const list = await screen.findByRole('list', { name: 'Disciplines' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Lutte');
    expect(items[0]).toHaveTextContent('Sports de combat');
  });

  it('AS5: says when there is no discipline yet', async () => {
    fakeApi([]);
    renderWithQuery(<DisciplinesPage />);
    expect(await screen.findByText('Aucune discipline pour l’instant.')).toBeInTheDocument();
  });

  it('AS1: creates a discipline and shows it in the list', async () => {
    const { posted } = fakeApi([lutte]);
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Lutte');

    await fillForm('Natation', 'sports-nautiques');

    expect(await screen.findByText('Natation')).toBeInTheDocument();
    expect(posted).toEqual([{ name: 'Natation', category: 'sports-nautiques' }]);
    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('AS2: rejects a discipline without a name, without calling the API', async () => {
    const { posted } = fakeApi([]);
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Aucune discipline pour l’instant.');

    await fillForm('', 'athletisme');

    expect(await screen.findByText('Le nom est obligatoire.')).toBeInTheDocument();
    expect(posted).toEqual([]);
  });

  it('AS4: shows the API error when the name is already taken', async () => {
    fakeApi([lutte], { post: { status: 409, code: 'DISCIPLINE_NAME_TAKEN' } });
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Lutte');

    await fillForm('Lutte', 'sports-de-combat');

    expect(await screen.findByRole('alert')).toHaveTextContent('Une discipline porte déjà ce nom.');
  });

  const natation: DisciplineResponse = {
    id: '0199f5c2-0000-7000-8000-000000000004',
    name: 'Natation',
    category: 'sports-nautiques',
    createdAt: '2026-10-01T08:00:00.000Z',
  };

  async function startEditing(name: string) {
    const user = userEvent.setup();
    renderWithQuery(<DisciplinesPage />);
    await user.click(await screen.findByRole('button', { name: `Modifier ${name}` }));
    return user;
  }

  it('AS7: edits the name and the category of a discipline in place', async () => {
    const { patched } = fakeApi([lutte, natation]);
    const user = await startEditing('Lutte');

    const name = screen.getByLabelText('Nouveau nom');
    expect(name).toHaveValue('Lutte');
    await user.clear(name);
    await user.type(name, 'Lutte sénégalaise');
    await user.selectOptions(screen.getByLabelText('Nouvelle catégorie'), 'athletisme');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    const item = await screen.findByRole('listitem', { name: 'Lutte sénégalaise' });
    expect(item).toHaveTextContent('Athlétisme');
    expect(screen.queryByLabelText('Nouveau nom')).not.toBeInTheDocument();
    expect(patched).toEqual([
      { id: lutte.id, body: { name: 'Lutte sénégalaise', category: 'athletisme' } },
    ]);
  });

  it('AS7: cancels an edit without calling the API', async () => {
    const { patched } = fakeApi([lutte]);
    const user = await startEditing('Lutte');

    await user.type(screen.getByLabelText('Nouveau nom'), ' modifiée');
    await user.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.getByRole('listitem', { name: 'Lutte' })).toBeInTheDocument();
    expect(patched).toEqual([]);
  });

  it('AS8: rejects an empty name in the edit form, without calling the API', async () => {
    const { patched } = fakeApi([lutte]);
    const user = await startEditing('Lutte');

    await user.clear(screen.getByLabelText('Nouveau nom'));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Le nom est obligatoire.')).toBeInTheDocument();
    expect(patched).toEqual([]);
  });

  it('AS9: shows the API error when the new name is taken by another discipline', async () => {
    fakeApi([lutte, natation], { patch: { status: 409, code: 'DISCIPLINE_NAME_TAKEN' } });
    const user = await startEditing('Lutte');

    await user.clear(screen.getByLabelText('Nouveau nom'));
    await user.type(screen.getByLabelText('Nouveau nom'), 'Natation');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Une discipline porte déjà ce nom.');
    expect(screen.getByLabelText('Nouveau nom')).toHaveValue('Natation');
  });

  it('AS10: deletes a discipline and removes it from the list', async () => {
    const { deleted } = fakeApi([lutte, natation]);
    const user = userEvent.setup();
    renderWithQuery(<DisciplinesPage />);

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));

    await waitFor(() =>
      expect(screen.queryByRole('listitem', { name: 'Lutte' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('listitem', { name: 'Natation' })).toBeInTheDocument();
    expect(deleted).toEqual([lutte.id]);
  });

  it('AS11: says when the discipline no longer exists', async () => {
    fakeApi([lutte], { delete: { status: 404, code: 'DISCIPLINE_NOT_FOUND' } });
    const user = userEvent.setup();
    renderWithQuery(<DisciplinesPage />);

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cette discipline n’existe plus.');
  });
});
