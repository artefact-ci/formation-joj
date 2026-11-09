/**
 * La page /resultats, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : choix
 * du jour et du sport, classement d'une épreuve terminée, et états sans classement.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';
import { defaultDay } from './default-day';

async function open(search = 'date=2026-11-08') {
  const user = userEvent.setup();
  await renderRoute({ initialEntries: [`/resultats?${search}`] });
  return user;
}

const eventCard = (name: string) => screen.findByRole('article', { name });

async function rankingRows(eventName: string) {
  const rows = within(await eventCard(eventName)).getAllByRole('row');
  return rows.slice(1).map((row) =>
    within(row)
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  );
}

describe('ResultsPage', () => {
  it('001-AS1: shows the events of the chosen day, grouped by sport', async () => {
    const user = await open('date=2026-11-07');
    await screen.findByRole('region', { name: 'Judo' });

    await user.click(screen.getByRole('link', { name: '8 nov.' }));

    const athletics = await screen.findByRole('region', { name: 'Athlétisme' });
    expect(screen.getByRole('region', { name: 'Futsal' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Judo' })).not.toBeInTheDocument();
    const final = within(athletics).getByRole('article', { name: '100 m hommes, finale' });
    expect(final).toHaveTextContent('18h32');
    expect(final).toHaveTextContent('Terminé');
    const semiFinal = within(screen.getByRole('region', { name: 'Futsal' })).getByRole('article', {
      name: 'Hommes, demi-finale',
    });
    expect(semiFinal).toHaveTextContent('20h30');
    expect(semiFinal).toHaveTextContent('Programmé');
  });

  it('001-AS1: opens on today during the Games, otherwise on the first day', () => {
    expect(defaultDay(new Date('2026-11-08T12:00:00.000Z'))).toBe('2026-11-08');
    expect(defaultDay(new Date('2026-10-01T12:00:00.000Z'))).toBe('2026-10-31');
    expect(defaultDay(new Date('2026-12-01T12:00:00.000Z'))).toBe('2026-10-31');
  });

  it('001-AS1: ignores a day outside the Games in the address', async () => {
    await open('date=9999-12-31');

    const title = await screen.findByRole('heading', { level: 1 });
    expect(title).toHaveTextContent(/2026/);
    expect(screen.queryByText('Impossible de charger les résultats.')).not.toBeInTheDocument();
  });

  it('001-AS2: choosing a sport keeps only that group', async () => {
    const user = await open();
    await screen.findByRole('region', { name: 'Futsal' });

    await user.selectOptions(screen.getByLabelText('Sport'), 'Athlétisme');

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Futsal' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('region', { name: 'Athlétisme' })).toBeInTheDocument();
  });

  it('001-AS3: a finished event shows its ranking from first to last', async () => {
    await open();

    const rows = await rankingRows('100 m hommes, finale');

    expect(rows[0]).toEqual(['1', 'Nigeria', 'Gift Bright', '10,28 s']);
    expect(rows[1]).toEqual(['2', 'Chine', 'Hangyu Zhang', '10,31 s']);
    expect(await eventCard('100 m hommes, finale')).toHaveTextContent('Terminé');
  });

  it('001-AS4: events not finished show their status, without ranking', async () => {
    await open();

    const inProgress = await eventCard('Saut en longueur femmes, finale');
    const scheduled = await eventCard('Hommes, demi-finale');

    expect(inProgress).toHaveTextContent('En cours');
    expect(scheduled).toHaveTextContent('Programmé');
    expect(within(inProgress).queryByRole('table')).not.toBeInTheDocument();
    expect(within(scheduled).queryByRole('table')).not.toBeInTheDocument();
  });

  it('001-AS5: a mention replaces the performance, without rank, after the ranked athletes', async () => {
    await open();

    const rows = await rankingRows('100 m hommes, finale');

    expect(rows[2]).toEqual(['', 'France', 'Athlète Disqualifié', 'Disqualifié']);
    expect(rows[3]).toEqual(['', 'Brésil', 'Athlète Abandon', "N'a pas terminé"]);
  });

  it('001-AS6: shows a message when the day and the sport have no event', async () => {
    await open('date=2026-11-08&sport=voile');

    expect(await screen.findByText('Aucune épreuve pour ce jour et ce sport')).toBeInTheDocument();
  });

  it('001-AS7: shows the source of the data', async () => {
    await open();

    expect(await screen.findByRole('link', { name: 'Wikipédia' })).toBeInTheDocument();
  });

  it('003-AS5: choosing a nation keeps its events, with their complete ranking', async () => {
    const user = await open('date=2026-11-10');
    await eventCard('Course en ligne femmes');
    await screen.findByRole('option', { name: 'Sénégal' });

    await user.selectOptions(screen.getByLabelText('Nation'), 'Sénégal');

    await waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Course en ligne femmes' }),
      ).not.toBeInTheDocument(),
    );
    const rows = await rankingRows('100 m hommes, finale');
    expect(rows.map((row) => row[1])).toEqual(['Nigeria', 'Sénégal']);
  });

  it('003-AS5: keeps the chosen nation when the day changes', async () => {
    const user = await open('date=2026-11-10&nation=sn');
    await screen.findByRole('option', { name: 'Sénégal' });
    expect(screen.getByLabelText('Nation')).toHaveValue('sn');

    await user.click(screen.getByRole('link', { name: '8 nov.' }));

    await screen.findByRole('heading', { level: 1, name: /8 novembre/ });
    expect(screen.getByLabelText('Nation')).toHaveValue('sn');
  });

  it('003-AS6: shows the athletes of the nation with their event, time and status', async () => {
    await open('date=2026-11-10&nation=sn');

    const athletes = await screen.findByRole('region', { name: 'Athlètes du jour' });
    const items = await within(athletes).findAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Awa Diop');
    expect(items[0]).toHaveTextContent('100 m hommes, finale');
    expect(items[0]).toHaveTextContent('09h00');
    expect(items[0]).toHaveTextContent('Terminé');
    expect(items[1]).toHaveTextContent('Équipe du Sénégal');
    expect(items[1]).toHaveTextContent('Hommes, finale');
    expect(items[1]).toHaveTextContent('20h30');
    expect(items[1]).toHaveTextContent('Programmé');
    expect(within(athletes).queryByText('Gift Bright')).not.toBeInTheDocument();
  });

  it('003-AS6: shows no athletes before a nation is chosen', async () => {
    await open('date=2026-11-10');
    await eventCard('Course en ligne femmes');

    expect(screen.queryByRole('region', { name: 'Athlètes du jour' })).not.toBeInTheDocument();
  });

  it('003-AS7: shows a message when the nation has no athlete that day', async () => {
    await open('date=2026-11-10&nation=tv');

    expect(await screen.findByText('Aucun athlète de cette nation ce jour')).toBeInTheDocument();
  });

  it('005-AS1: shows a real podium, and no time when the source does not give it', async () => {
    fixture.sportEvents = fixture.sportEvents.map((event) =>
      event.name === '100 m hommes, finale' && event.startsAt.startsWith('2026-11-08')
        ? { ...event, hasStartTime: false }
        : event,
    );
    await open();

    const rows = await rankingRows('100 m hommes, finale');

    expect(rows[0]).toEqual(['1', 'Nigeria', 'Gift Bright', '10,28 s']);
    expect(await eventCard('100 m hommes, finale')).not.toHaveTextContent('18h32');
  });

  it('005-AS3: an event without a published result invents none', async () => {
    fixture.sportEvents.push(
      {
        id: '0199f5c2-0000-7000-8000-000000000030',
        sport: 'boxe',
        name: '57 kg femmes',
        startsAt: '2026-11-07T00:00:00.000Z',
        hasStartTime: false,
        status: 'unpublished',
        ranking: [],
      },
      {
        id: '0199f5c2-0000-7000-8000-000000000031',
        sport: 'boxe',
        name: '60 kg femmes',
        startsAt: '2026-11-12T00:00:00.000Z',
        hasStartTime: false,
        status: 'scheduled',
        ranking: [],
      },
    );
    await open('date=2026-11-07');

    const past = await eventCard('57 kg femmes');
    expect(past).toHaveTextContent('Résultat non publié');
    expect(within(past).queryByRole('table')).not.toBeInTheDocument();
  });

  it('005-AS3: shows a future event as scheduled, without ranking or medal', async () => {
    fixture.sportEvents.push({
      id: '0199f5c2-0000-7000-8000-000000000035',
      sport: 'boxe',
      name: '60 kg femmes',
      startsAt: '2026-11-12T00:00:00.000Z',
      hasStartTime: false,
      status: 'scheduled',
      ranking: [],
    });
    await open('date=2026-11-12');

    const future = await eventCard('60 kg femmes');
    expect(future).toHaveTextContent('Programmé');
    expect(within(future).queryByRole('table')).not.toBeInTheDocument();
    expect(future).not.toHaveTextContent(/Or|Argent|Bronze/);
  });
});
