/**
 * La recherche, du champ de l'en-tête jusqu'aux éléments trouvés, sur la fausse API.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

const hits = async () => {
  const list = await screen.findByRole('list', { name: 'Éléments trouvés' });
  return within(list).getAllByRole('link');
};

describe('SearchPage', () => {
  it('004-AS4: the field of the header leads to the hits, without accents or capitals', async () => {
    const user = userEvent.setup();
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });

    await user.type(await screen.findByRole('searchbox', { name: 'Rechercher' }), 'SENEGAL{Enter}');

    const [nation] = await hits();
    expect(nation).toHaveTextContent('Sénégal');
    expect(nation).toHaveAttribute('href', '/resultats?nation=sn');
  });

  it.each([
    ['natation', 'Natation', '/resultats?sport=natation'],
    ['100 m', '100 m hommes, finale', '/resultats?date=2026-11-08&sport=athletisme'],
    ['bright', 'Gift Bright', '/resultats?date=2026-11-08&sport=athletisme&nation=ng'],
  ])('004-AS4: finds « %s », with a link to its page', async (term, label, href) => {
    await renderRoute({ initialEntries: [`/recherche?q=${encodeURIComponent(term)}`] });

    const [hit] = await hits();
    expect(hit).toHaveTextContent(label);
    expect(hit).toHaveAttribute('href', href);
  });

  it('004-AS4: shows a message when nothing matches', async () => {
    await renderRoute({ initialEntries: ['/recherche?q=zzz'] });

    expect(await screen.findByText('Aucun résultat pour cette recherche')).toBeInTheDocument();
  });

  it('004-AS4: asks for at least two characters when only accents are typed', async () => {
    const q = encodeURIComponent('́́');
    await renderRoute({ initialEntries: [`/recherche?q=${q}`] });

    expect(await screen.findByText('Saisissez au moins 2 caractères')).toBeInTheDocument();
  });

  it('004-AS4: asks for at least two characters', async () => {
    await renderRoute({ initialEntries: ['/recherche?q=a'] });

    expect(await screen.findByText('Saisissez au moins 2 caractères')).toBeInTheDocument();
  });

  it('005-AS3: leads an event without a date to the medals of its sport', async () => {
    fixture.searchHits.push({
      kind: 'event',
      label: '-51 kg hommes',
      date: null,
      sport: 'boxe',
      nation: null,
    });
    await renderRoute({ initialEntries: ['/recherche?q=-51'] });

    const [hit] = await hits();
    expect(hit).toHaveAttribute('href', '/medailles?sport=boxe');
  });

  it('005-AS3: keeps a numeric text typed in the address as text', async () => {
    fixture.searchHits.push({
      kind: 'event',
      label: 'Épreuve 100',
      date: '2026-11-08',
      sport: 'boxe',
      nation: null,
    });
    await renderRoute({ initialEntries: ['/recherche?q=100'] });

    const labels = (await hits()).map((hit) => hit.textContent);
    expect(labels).toContain('ÉpreuveÉpreuve 100');
  });
});
