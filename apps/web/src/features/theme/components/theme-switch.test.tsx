/**
 * Le choix du thème, sur une vraie route : appliqué à la page, gardé d'une page à l'autre et
 * d'une visite à l'autre. `applyStoredTheme` est ce que `main.tsx` appelle à chaque visite.
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderRoute } from '@/test/utils';
import { applyStoredTheme, readStoredTheme } from '../theme';

const isDark = () => document.documentElement.classList.contains('dark');

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeSwitch', () => {
  it('004-AS5: keeps the dark theme across pages and visits, until the light one is chosen', async () => {
    const user = userEvent.setup();
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });
    expect(isDark()).toBe(false);

    await user.click(await screen.findByRole('button', { name: 'Thème sombre' }));
    expect(isDark()).toBe(true);

    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    await user.click(within(menu).getByRole('link', { name: 'Médailles' }));
    await screen.findByRole('heading', { level: 1, name: 'Médailles' });
    expect(isDark()).toBe(true);

    document.documentElement.classList.remove('dark');
    applyStoredTheme();
    expect(isDark()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Thème clair' }));
    expect(isDark()).toBe(false);
    applyStoredTheme();
    expect(isDark()).toBe(false);
  });

  it('004-AS5: starts with the light theme, even when the browser refuses the storage', () => {
    expect(readStoredTheme()).toBe('light');

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('refusé');
    });

    expect(readStoredTheme()).toBe('light');
  });
});
