/**
 * La page /medailles, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) :
 * classement des nations, filtre par continent, médailles par sport et par épreuve, et filtres.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

async function open(search = '') {
  const user = userEvent.setup();
  await renderRoute({ initialEntries: [`/medailles${search}`] });
  return user;
}

const standingsTable = () => screen.findByRole('table', { name: 'Classement des nations' });

async function standingRows() {
  const rows = within(await standingsTable()).getAllByRole('row');
  return rows.slice(1).map((row) =>
    within(row)
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  );
}

async function rowOf(nationName: string) {
  const table = await standingsTable();
  const row = within(table).getByText(nationName).closest('tr');
  if (row === null) throw new Error(`Aucune ligne pour ${nationName}`);
  return row;
}

describe('MedalsPage', () => {
  it('002-AS1: shows the nations in order, with their medals, total and the source', async () => {
    await open();

    expect((await standingRows()).slice(0, 3)).toEqual([
      ['1', 'Chine', '4', '0', '0', '4'],
      ['2', 'Kenya', '3', '2', '0', '5'],
      ['3', 'Sénégal (pays hôte)', '3', '1', '2', '6'],
    ]);
    expect(await screen.findByRole('link', { name: 'Wikipédia' })).toBeInTheDocument();
  });

  it('002-AS1: is reachable from the main menu', async () => {
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });

    const menu = await screen.findByRole('navigation', { name: 'Menu principal' });
    expect(within(menu).getByRole('link', { name: 'Médailles' })).toHaveAttribute(
      'href',
      '/medailles',
    );
  });

  it('002-AS3: choosing a continent keeps only its nations, with their overall rank', async () => {
    const user = await open();
    await standingsTable();

    const continents = screen.getByRole('navigation', { name: 'Continents' });
    await user.click(within(continents).getByRole('link', { name: 'Afrique' }));

    await waitFor(async () => {
      expect((await standingRows()).map(([rank, nation]) => [rank, nation])).toEqual([
        ['2', 'Kenya'],
        ['3', 'Sénégal (pays hôte)'],
        ['4', 'Maroc'],
      ]);
    });
  });

  it('002-AS4: highlights only the row of Senegal, without changing its rank', async () => {
    await open();
    const senegal = await rowOf('Sénégal');

    expect(senegal).toHaveClass('bg-accent');
    expect(within(senegal).getAllByRole('cell')[0]).toHaveTextContent('3');
    const highlighted = within(await standingsTable())
      .getAllByRole('row')
      .filter((row) => row.classList.contains('bg-accent'));
    expect(highlighted).toEqual([senegal]);
  });

  it('002-AS5: shows the medals by sport and event, with their type, medalist and nation', async () => {
    await open();

    const athletics = await screen.findByRole('region', { name: 'Athlétisme' });
    const sprint = within(athletics).getByRole('article', { name: '100 m hommes' });
    expect(
      within(sprint)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['OrGift BrightNigeria', 'ArgentHangyu ZhangChine', 'BronzeSzymon DolegaPologne']);
  });

  it('002-AS6: shows a medalist team as one medal, counted once in the standings', async () => {
    await open();

    const handball = await screen.findByRole('region', { name: 'Beach handball' });
    expect(
      within(handball)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['OrÉquipe du BrésilBrésil']);
    const brazil = within(await rowOf('Brésil')).getAllByRole('cell');
    expect(brazil.map((cell) => cell.textContent).slice(2)).toEqual(['1', '0', '0', '1']);
  });

  it('002-AS7: filters the medals by sport and type, and says when none matches', async () => {
    const user = await open();
    await screen.findByRole('region', { name: 'Beach handball' });

    await user.selectOptions(screen.getByLabelText('Sport'), 'athletisme');
    await user.selectOptions(screen.getByLabelText('Type de médaille'), 'gold');

    await waitFor(() => {
      expect(screen.queryByText('Hangyu Zhang')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Gift Bright')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Beach handball' })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Sport'), 'voile');

    expect(await screen.findByText('Aucune médaille pour ce choix')).toBeInTheDocument();
  });

  it('002-AS7: the medal type filter leaves the standings unchanged', async () => {
    await open('?type=gold');

    expect((await standingRows())[1]).toEqual(['2', 'Kenya', '3', '2', '0', '5']);
  });

  it('005-AS5: reports a gap with the table of the source', async () => {
    fixture.medalGaps = [
      {
        nationCode: 'pt',
        nationName: 'Portugal',
        gold: 1,
        silver: 1,
        bronze: 1,
        announcedGold: 2,
        announcedSilver: 1,
        announcedBronze: 1,
      },
    ];
    await open();

    expect(
      await screen.findByText('Écart avec la source : Portugal, 2-1-1 annoncé'),
    ).toBeInTheDocument();
  });

  it('005-AS5: reports nothing when the podiums match the table of the source', async () => {
    await open();
    await standingsTable();

    expect(screen.queryByText(/Écart avec la source/)).not.toBeInTheDocument();
  });

  it('005-AS6: shows a mixed team on its medal, and on no nation of the standings', async () => {
    fixture.medals.push({
      id: '0199f5c2-0000-7000-8000-000000000032',
      type: 'gold',
      sport: 'sports-equestres',
      eventId: '0199f5c2-0000-7000-8000-000000000033',
      eventName: "Saut d'obstacles par équipes",
      competitor: 'Équipe Asie',
      nationCode: 'xx',
      nationName: 'Équipe mixte',
    });
    await open();

    const equestrian = await screen.findByRole('region', { name: 'Sports équestres' });
    expect(within(equestrian).getByRole('listitem')).toHaveTextContent('OrÉquipe AsieÉquipe mixte');
    expect(within(await standingsTable()).queryByText('Équipe mixte')).not.toBeInTheDocument();
  });
});
