import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { DataSourceNotice } from '@/features/results/components/data-source-notice';
import { SearchForm } from '@/features/search/components/search-form';
import { ThemeSwitch } from '@/features/theme/components/theme-switch';

const MENU_LINK = 'rounded-full px-4 py-2 text-sm font-semibold';
const MENU_LINK_ACTIVE = 'bg-primary text-primary-foreground';

function SiteHeader() {
  return (
    <header className="bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-2 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/ayo.png" alt="" className="h-16 w-auto" />
          <span className="flex flex-col leading-none font-extrabold text-foreground">
            <span className="text-2xl">DAKAR 2026</span>
            <span className="mt-1 text-xs font-semibold tracking-wide">Youth Olympic Games</span>
          </span>
        </Link>
        <nav aria-label="Menu principal" className="flex flex-wrap items-center gap-1">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={MENU_LINK}
            activeProps={{ className: MENU_LINK_ACTIVE }}
          >
            Accueil
          </Link>
          <Link to="/resultats" className={MENU_LINK} activeProps={{ className: MENU_LINK_ACTIVE }}>
            Résultats
          </Link>
          <Link to="/medailles" className={MENU_LINK} activeProps={{ className: MENU_LINK_ACTIVE }}>
            Médailles
          </Link>
          <Link
            to="/calendrier"
            className={MENU_LINK}
            activeProps={{ className: MENU_LINK_ACTIVE }}
          >
            Calendrier
          </Link>
          <Link to="/direct" className={MENU_LINK} activeProps={{ className: MENU_LINK_ACTIVE }}>
            Direct
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <SearchForm />
          <ThemeSwitch />
        </div>
      </div>
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-joj-green" />
        <span className="flex-1 bg-joj-yellow" />
        <span className="flex-1 bg-joj-red" />
      </div>
      <DataSourceNotice />
    </header>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link to="/" className={buttonVariants()}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
