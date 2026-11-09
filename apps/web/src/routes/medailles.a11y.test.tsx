/**
 * Un audit axe-core de chaque état de la page des médailles : classement et médailles, puis
 * choix sans médaille. Un état qui n'est jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

// Un audit axe-core d'une grande page prend plusieurs secondes quand les tests tournent en parallèle.
vi.setConfig({ testTimeout: 15_000 });

describe('medals accessibility', () => {
  it('002-AS5: the standings and the medals are clean', async () => {
    await renderRoute({ initialEntries: ['/medailles'] });
    await screen.findByRole('article', { name: '100 m hommes' });

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('002-AS7: a choice without medals is clean', async () => {
    await renderRoute({ initialEntries: ['/medailles?sport=voile'] });
    await screen.findByText('Aucune médaille pour ce choix');

    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
