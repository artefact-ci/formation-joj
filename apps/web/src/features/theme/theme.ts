export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'joj-theme';

/** Le thème mémorisé, ou le thème clair si rien n'est mémorisé ou si le navigateur le refuse. */
export function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Applique le thème à la page et le mémorise, si le navigateur l'accepte. */
export function chooseTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Le thème reste appliqué jusqu'à la fin de la visite.
  }
}

/** Appelé au démarrage, avant le premier affichage. */
export function applyStoredTheme(): void {
  applyTheme(readStoredTheme());
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
