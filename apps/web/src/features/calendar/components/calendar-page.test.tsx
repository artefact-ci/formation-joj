/**
 * La page /calendrier, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) : épreuves
 * à venir d'un jour, filtre par sport et choix du fuseau. Un test ne peut pas changer le fuseau de
 * l'appareil : seule `localTimeZone` est remplacée, pour simuler un visiteur à Paris.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

vi.mock('./event-time', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./event-time')>()),
  localTimeZone: () => 'Europe/Paris',
}));

async function open(search: string) {
  const user = userEvent.setup();
  await renderRoute({ initialEntries: [`/calendrier?${search}`] });
  return user;
}

describe('CalendarPage', () => {
  it('003-AS1: shows only the upcoming events of the day, grouped by sport', async () => {
    await open('date=2026-11-08');

    const futsal = await screen.findByRole('region', { name: 'Futsal' });
    const semiFinal = within(futsal).getByRole('article', { name: 'Hommes, demi-finale' });
    expect(semiFinal).toHaveTextContent('20h30');
    expect(semiFinal).toHaveTextContent('Programmé');
    expect(screen.queryByRole('article', { name: '100 m hommes, finale' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('article', { name: '+73 kg femmes, finale' }),
    ).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Wikipédia' })).toBeInTheDocument();
  });

  it('003-AS1: is reachable from the main menu', async () => {
    await open('date=2026-11-08');

    const menu = await screen.findByRole('navigation', { name: 'Menu principal' });
    expect(within(menu).getByRole('link', { name: 'Calendrier' })).toHaveAttribute(
      'href',
      '/calendrier',
    );
  });

  it('003-AS2: choosing a sport keeps only that group', async () => {
    const user = await open('date=2026-11-09');
    await screen.findByRole('region', { name: 'Judo' });

    await user.selectOptions(screen.getByLabelText('Sport'), 'Natation');

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Judo' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('region', { name: 'Natation' })).toBeInTheDocument();
  });

  it('003-AS3: shows Dakar time first, then the local time of the visitor', async () => {
    const user = await open('date=2026-11-08');

    const semiFinal = await screen.findByRole('article', { name: 'Hommes, demi-finale' });
    expect(semiFinal).toHaveTextContent('20h30');
    expect(screen.getByText("Horaires à l'heure de Dakar")).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Mon heure locale' }));

    await waitFor(() =>
      expect(screen.getByRole('article', { name: 'Hommes, demi-finale' })).toHaveTextContent(
        '21h30',
      ),
    );
    expect(screen.getByText('Horaires à votre heure locale')).toBeInTheDocument();
  });

  it('003-AS4: shows a message when the day and the sport have no upcoming event', async () => {
    await open('date=2026-11-08&sport=voile');

    expect(
      await screen.findByText('Aucune épreuve à venir pour ce jour et ce sport'),
    ).toBeInTheDocument();
  });

  it('005-AS3: lists the events without a published date', async () => {
    fixture.undatedEvents.push({
      id: '0199f5c2-0000-7000-8000-000000000034',
      sport: 'boxe',
      name: '-51 kg hommes',
      status: 'unpublished',
      ranking: [],
    });
    await open('date=2026-11-08');

    const undated = await screen.findByRole('region', { name: 'Date non publiée' });
    expect(await within(undated).findByRole('listitem')).toHaveTextContent(
      'Boxe, -51 kg hommes, Résultat non publié',
    );
  });
});
