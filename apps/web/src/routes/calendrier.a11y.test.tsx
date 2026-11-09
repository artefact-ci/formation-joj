/**
 * Un audit axe-core de chaque état de la page du calendrier et du suivi d'une nation.
 * Un état qui n'est jamais audité peut régresser sans bruit.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('calendar accessibility', () => {
  it('003-AS1: the upcoming events are clean', async () => {
    await renderRoute({ initialEntries: ['/calendrier?date=2026-11-08'] });
    await screen.findByRole('article', { name: 'Hommes, demi-finale' });

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS4: a choice without upcoming events is clean', async () => {
    await renderRoute({ initialEntries: ['/calendrier?date=2026-11-08&sport=voile'] });
    await screen.findByText('Aucune épreuve à venir pour ce jour et ce sport');

    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS6: the athletes of a nation are clean', async () => {
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-10&nation=sn'] });
    await screen.findByText('Équipe du Sénégal');

    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
