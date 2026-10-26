import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { fakeApi, lutte, natation } from '../testing/fake-disciplines-api';

async function fillForm(name: string, category: string) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText('Nom'), name);
  await user.selectOptions(screen.getByLabelText('Catégorie'), category);
  await user.click(screen.getByRole('button', { name: 'Ajouter' }));
}

describe('DisciplinesPage', () => {
  it('AS5: shows the disciplines returned by the API, with their category', async () => {
    fakeApi([lutte]);
    await renderApp('/disciplines');

    const list = await screen.findByRole('list', { name: 'Disciplines' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Lutte');
    expect(items[0]).toHaveTextContent('Sports de combat');
  });

  it('AS5: says when there is no discipline yet', async () => {
    fakeApi([]);
    await renderApp('/disciplines');
    expect(await screen.findByText('Aucune discipline pour l’instant.')).toBeInTheDocument();
  });

  it('AS1: creates a discipline and shows it in the list', async () => {
    const { posted } = fakeApi([lutte]);
    await renderApp('/disciplines');
    await screen.findByText('Lutte');

    await fillForm('Natation', 'sports-nautiques');

    expect(await screen.findByText('Natation')).toBeInTheDocument();
    expect(posted).toEqual([{ name: 'Natation', category: 'sports-nautiques' }]);
    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('AS2: rejects a discipline without a name, without calling the API', async () => {
    const { posted } = fakeApi([]);
    await renderApp('/disciplines');
    await screen.findByText('Aucune discipline pour l’instant.');

    await fillForm('', 'athletisme');

    expect(await screen.findByText('Le nom est obligatoire.')).toBeInTheDocument();
    expect(posted).toEqual([]);
  });

  it('AS4: shows the API error when the name is already taken', async () => {
    fakeApi([lutte], { post: { status: 409, code: 'DISCIPLINE_NAME_TAKEN' } });
    await renderApp('/disciplines');
    await screen.findByText('Lutte');

    await fillForm('Lutte', 'sports-de-combat');

    expect(await screen.findByRole('alert')).toHaveTextContent('Une discipline porte déjà ce nom.');
  });

  async function startEditing(name: string) {
    const user = userEvent.setup();
    await renderApp('/disciplines');
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

  it('AS6: opens the detail page of a discipline from the list', async () => {
    fakeApi([lutte, natation]);
    const user = userEvent.setup();
    await renderApp('/disciplines');

    await user.click(await screen.findByRole('link', { name: 'Lutte' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Lutte' })).toBeInTheDocument();
  });

  it('AS10: deletes a discipline after confirmation and removes it from the list', async () => {
    const { deleted } = fakeApi([lutte, natation]);
    const user = userEvent.setup();
    await renderApp('/disciplines');

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Supprimer « Lutte » ?' });
    expect(deleted).toEqual([]);
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() =>
      expect(screen.queryByRole('listitem', { name: 'Lutte' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('listitem', { name: 'Natation' })).toBeInTheDocument();
    expect(deleted).toEqual([lutte.id]);
  });

  it('AS10: keeps the discipline when the deletion is cancelled', async () => {
    const { deleted } = fakeApi([lutte]);
    const user = userEvent.setup();
    await renderApp('/disciplines');

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('listitem', { name: 'Lutte' })).toBeInTheDocument();
    expect(deleted).toEqual([]);
  });

  it('AS11: says when the discipline no longer exists', async () => {
    fakeApi([lutte], { delete: { status: 404, code: 'DISCIPLINE_NOT_FOUND' } });
    const user = userEvent.setup();
    await renderApp('/disciplines');

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cette discipline n’existe plus.');
  });
});
