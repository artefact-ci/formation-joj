import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';
import { fakeApi, lutte, natation } from '../testing/fake-disciplines-api';

const detailPath = (id: string) => `/disciplines/${id}`;

describe('DisciplineDetailPage', () => {
  it('AS6: shows the name, the category and the creation date of a discipline', async () => {
    fakeApi([lutte, natation]);
    await renderApp(detailPath(lutte.id));

    expect(await screen.findByRole('heading', { level: 1, name: 'Lutte' })).toBeInTheDocument();
    expect(screen.getByText('Sports de combat')).toBeInTheDocument();
    expect(screen.getByText('1 octobre 2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Toutes les disciplines' })).toHaveAttribute(
      'href',
      '/disciplines',
    );
  });

  it('AS7: edits the discipline from its detail page', async () => {
    const { patched } = fakeApi([lutte]);
    const user = userEvent.setup();
    await renderApp(detailPath(lutte.id));

    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    await user.clear(screen.getByLabelText('Nouveau nom'));
    await user.type(screen.getByLabelText('Nouveau nom'), 'Lutte sénégalaise');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lutte sénégalaise' }),
    ).toBeInTheDocument();
    expect(patched).toEqual([
      { id: lutte.id, body: { name: 'Lutte sénégalaise', category: 'sports-de-combat' } },
    ]);
  });

  it('AS10: deletes the discipline after confirmation and goes back to the list', async () => {
    const { deleted } = fakeApi([lutte, natation]);
    const user = userEvent.setup();
    const { router } = await renderApp(detailPath(lutte.id));

    await user.click(await screen.findByRole('button', { name: 'Supprimer Lutte' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Supprimer « Lutte » ?' });
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/disciplines'));
    expect(await screen.findByRole('listitem', { name: 'Natation' })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: 'Lutte' })).not.toBeInTheDocument();
    expect(deleted).toEqual([lutte.id]);
  });

  it('AS11: says when the discipline does not exist', async () => {
    fakeApi([lutte]);
    await renderApp(detailPath('0199f5c2-0000-7000-8000-00000000ffff'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cette discipline n’existe plus.');
    expect(screen.getByRole('link', { name: 'Toutes les disciplines' })).toBeInTheDocument();
  });
});
