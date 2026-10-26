import type { CreateDisciplineInput, DisciplineResponse } from '@joj/shared';
import { screen, within } from '@testing-library/react';
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

/** Une fausse API en mémoire : GET liste, POST ajoute (ou répond l'erreur donnée). */
function fakeApi(initial: DisciplineResponse[], postError?: { status: number; code: string }) {
  const disciplines = [...initial];
  const posted: CreateDisciplineInput[] = [];
  server.use(
    http.get('*/api/disciplines', () => HttpResponse.json(disciplines)),
    http.post('*/api/disciplines', async ({ request }) => {
      const body = (await request.json()) as CreateDisciplineInput;
      posted.push(body);
      if (postError) {
        return HttpResponse.json(
          {
            type: 'urn:problem-type:x',
            title: 'Error',
            detail: 'Rejected',
            ...postError,
          },
          { status: postError.status },
        );
      }
      const created = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      disciplines.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
  );
  return { posted };
}

async function fillForm(name: string, category: string) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText('Nom'), name);
  await user.selectOptions(screen.getByLabelText('Catégorie'), category);
  await user.click(screen.getByRole('button', { name: 'Ajouter' }));
}

describe('DisciplinesPage', () => {
  it('AS5: affiche les disciplines renvoyées par l’API, avec leur catégorie', async () => {
    fakeApi([lutte]);
    renderWithQuery(<DisciplinesPage />);

    const list = await screen.findByRole('list', { name: 'Disciplines' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Lutte');
    expect(items[0]).toHaveTextContent('Sports de combat');
  });

  it('AS5: indique quand il n’y a encore aucune discipline', async () => {
    fakeApi([]);
    renderWithQuery(<DisciplinesPage />);
    expect(await screen.findByText('Aucune discipline pour l’instant.')).toBeInTheDocument();
  });

  it('AS1: crée une discipline et l’affiche dans la liste', async () => {
    const { posted } = fakeApi([lutte]);
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Lutte');

    await fillForm('Natation', 'sports-nautiques');

    expect(await screen.findByText('Natation')).toBeInTheDocument();
    expect(posted).toEqual([{ name: 'Natation', category: 'sports-nautiques' }]);
    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('AS2: refuse une discipline sans nom, sans appeler l’API', async () => {
    const { posted } = fakeApi([]);
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Aucune discipline pour l’instant.');

    await fillForm('', 'athletisme');

    expect(await screen.findByText('Le nom est obligatoire.')).toBeInTheDocument();
    expect(posted).toEqual([]);
  });

  it('AS4: affiche l’erreur de l’API quand le nom est déjà pris', async () => {
    fakeApi([lutte], { status: 409, code: 'DISCIPLINE_NAME_TAKEN' });
    renderWithQuery(<DisciplinesPage />);
    await screen.findByText('Lutte');

    await fillForm('Lutte', 'sports-de-combat');

    expect(await screen.findByRole('alert')).toHaveTextContent('Une discipline porte déjà ce nom.');
  });
});
