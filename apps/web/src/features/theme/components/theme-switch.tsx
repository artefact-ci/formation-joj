import { useState } from 'react';
import { chooseTheme, readStoredTheme } from '../theme';

/** Le bouton de l'en-tête : il propose l'autre thème que celui qui est appliqué. */
export function ThemeSwitch() {
  const [theme, setTheme] = useState(readStoredTheme);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => {
        chooseTheme(next);
        setTheme(next);
      }}
      className="rounded-full bg-muted px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground hover:bg-accent"
    >
      {next === 'dark' ? 'Thème sombre' : 'Thème clair'}
    </button>
  );
}
