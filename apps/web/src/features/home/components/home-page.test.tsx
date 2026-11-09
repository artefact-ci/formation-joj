/**
 * L'accueil, monté par sa vraie route sur la fausse API (`mocks/handlers.ts`) : chiffres clés,
 * début du classement, derniers résultats et toutes les disciplines.
 */
import { SPORT_LABELS, SPORT_SLUGS } from '@joj/shared';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

const openHome = () => renderRoute({ initialEntries: ['/'] });

describe('HomePage', () => {
  it('004-AS1: shows the key figures, all the disciplines and the source', async () => {
    await openHome();

    const figures = await screen.findByRole('region', { name: 'Chiffres clés' });
    expect(figures).toHaveTextContent('25 Disciplines');
    expect(figures).toHaveTextContent('205 Nations');
    expect(figures).toHaveTextContent('Plus de 4 000 Jeunes athlètes');

    const disciplines = screen.getByRole('region', { name: 'Toutes les disciplines' });
    expect(
      within(disciplines)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(SPORT_SLUGS.map((slug) => SPORT_LABELS[slug]));
    expect(await screen.findByRole('link', { name: 'Wikipédia' })).toBeInTheDocument();
  });

  it('004-AS1: leads to the live page', async () => {
    await openHome();

    expect(
      await screen.findByRole('link', { name: 'Voir les résultats en direct' }),
    ).toHaveAttribute('href', '/direct');
  });

  it('004-AS2: shows the first ten nations in order, Senegal highlighted, and a link', async () => {
    fixture.nationStandings.push(
      ...['fr', 'jp', 'no', 'gb', 'cz', 'nz'].map((nationCode, index) => ({
        rank: 7 + index,
        nationCode,
        nationName: `Nation ${7 + index}`,
        continent: 'europe' as const,
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
      })),
    );
    await openHome();

    const table = await screen.findByRole('table', { name: 'Classement des nations' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(10);
    expect(rows.map((row) => within(row).getAllByRole('cell')[0]?.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);
    expect(within(table).queryByText('Nation 11')).not.toBeInTheDocument();
    const highlighted = rows.filter((row) => row.classList.contains('bg-accent'));
    expect(highlighted.map((row) => row.textContent)).toEqual([expect.stringContaining('Sénégal')]);
    expect(screen.getByRole('link', { name: 'Voir tout le classement' })).toHaveAttribute(
      'href',
      '/medailles',
    );
  });

  it('004-AS3: shows the latest finished events with their medalists and their nation', async () => {
    await openHome();

    const latest = await screen.findByRole('region', { name: 'Derniers résultats' });
    const events = await within(latest).findAllByRole('article');
    expect(events.map((event) => within(event).getByRole('heading').textContent)).toEqual([
      'Course en ligne femmes',
      '100 m hommes, finale',
      '100 m hommes, finale',
    ]);
    expect(events[0]).toHaveTextContent('Cycliste Norvège');
    expect(events[0]).toHaveTextContent('Norvège');
    expect(events[2]).toHaveTextContent('Gift Bright');
    expect(events[2]).toHaveTextContent('Nigeria');
    expect(events[2]).not.toHaveTextContent('Athlète Disqualifié');
    expect(within(latest).queryByText('Saut en longueur femmes, finale')).not.toBeInTheDocument();
    expect(within(latest).getByRole('link', { name: 'Voir tous les résultats' })).toHaveAttribute(
      'href',
      '/resultats',
    );
  });
});
