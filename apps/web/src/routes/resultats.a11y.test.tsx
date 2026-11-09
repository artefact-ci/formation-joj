/**
 * Un audit axe-core de chaque état de la page des résultats : épreuves et classements, puis
 * journée sans épreuve. Un état qui n'est jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('results accessibility', () => {
  it('001-AS3: the events and their rankings are clean', async () => {
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });
    await screen.findByRole('article', { name: '100 m hommes, finale' });

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('001-AS6: the empty day is clean', async () => {
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08&sport=voile'] });
    await screen.findByText('Aucune épreuve pour ce jour et ce sport');

    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
