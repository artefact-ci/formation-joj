/**
 * Un audit axe-core de chaque état de l'accueil, du direct et de la recherche.
 * Un état qui n'est jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

// Un audit axe-core d'une grande page prend plusieurs secondes quand les tests tournent en parallèle.
vi.setConfig({ testTimeout: 15_000 });

describe('home, live and search accessibility', () => {
  it('004-AS1: the home page is clean', async () => {
    await renderRoute({ initialEntries: ['/'] });
    await screen.findByRole('table', { name: 'Classement des nations' });
    await screen.findAllByText('Gift Bright');

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('004-AS4: the search hits are clean', async () => {
    await renderRoute({ initialEntries: ['/recherche?q=senegal'] });
    await screen.findByRole('list', { name: 'Éléments trouvés' });

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('004-AS6: the live page is clean', async () => {
    await renderRoute({ initialEntries: ['/direct'] });
    await screen.findByRole('article', { name: 'Saut en longueur femmes, finale' });

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('004-AS6: the live page without any event is clean', async () => {
    fixture.sportEvents = [];
    await renderRoute({ initialEntries: ['/direct'] });
    await screen.findByText('Aucune épreuve en cours pour le moment');

    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
