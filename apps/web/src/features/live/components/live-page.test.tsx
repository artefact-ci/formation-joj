/**
 * Le direct, monté par sa vraie route sur la fausse API. Une horloge simulée fait passer le temps :
 * un test ne peut pas attendre 30 vraies secondes, et aucune action du visiteur n'est simulée.
 */
import { act, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fixture } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

const THIRTY_SECONDS = 30_000;

const openLive = () => renderRoute({ initialEntries: ['/direct'] });

describe('LivePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('004-AS6: shows only the events in progress, with their sport, name and time', async () => {
    await openLive();

    const athletics = await screen.findByRole('region', { name: 'Athlétisme' });
    const event = within(athletics).getByRole('article', {
      name: 'Saut en longueur femmes, finale',
    });
    expect(event).toHaveTextContent('19h00');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.queryByRole('region', { name: 'Futsal' })).not.toBeInTheDocument();
  });

  it('004-AS6: shows a message when no event is in progress', async () => {
    fixture.sportEvents = fixture.sportEvents.filter((event) => event.status !== 'in-progress');
    await openLive();

    expect(await screen.findByText('Aucune épreuve en cours pour le moment')).toBeInTheDocument();
  });

  it('004-AS7: an event that starts appears within 30 seconds, without any action', async () => {
    await openLive();
    await screen.findByRole('article', { name: 'Saut en longueur femmes, finale' });

    fixture.sportEvents = fixture.sportEvents.map((event) =>
      event.name === 'Hommes, demi-finale' ? { ...event, status: 'in-progress' } : event,
    );
    await act(() => vi.advanceTimersByTimeAsync(THIRTY_SECONDS));

    await waitFor(() =>
      expect(screen.getByRole('article', { name: 'Hommes, demi-finale' })).toBeInTheDocument(),
    );
  });

  it('004-AS7: an event that ends disappears within 30 seconds, without any action', async () => {
    await openLive();
    await screen.findByRole('article', { name: 'Saut en longueur femmes, finale' });

    fixture.sportEvents = fixture.sportEvents.map((event) =>
      event.status === 'in-progress' ? { ...event, status: 'finished' } : event,
    );
    await act(() => vi.advanceTimersByTimeAsync(THIRTY_SECONDS));

    await waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Saut en longueur femmes, finale' }),
      ).not.toBeInTheDocument(),
    );
  });
});
