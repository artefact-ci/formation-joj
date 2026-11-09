import { Link } from '@tanstack/react-router';
import { AllDisciplines } from './all-disciplines';
import { KeyFigures } from './key-figures';
import { LatestResults } from './latest-results';
import { StandingsPreview } from './standings-preview';

/** L'accueil de la maquette : une présentation des Jeux, puis l'essentiel de chaque page. */
export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-6 rounded-2xl bg-accent p-6 md:flex-row md:justify-between md:p-8">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-3xl font-extrabold md:text-4xl">JOJ Dakar 2026</h1>
          <p className="text-lg font-semibold">Plus qu'un jeu, un avenir pour la jeunesse !</p>
          <p className="text-sm">Du 31 octobre au 13 novembre 2026, à Dakar, Sénégal</p>
          <Link
            to="/direct"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Voir les résultats en direct
          </Link>
        </div>
        <img src="/ayo.png" alt="Ayo, la mascotte des Jeux" className="h-48 w-auto" />
      </section>
      <KeyFigures />
      <div className="grid gap-6 lg:grid-cols-2">
        <StandingsPreview />
        <LatestResults />
      </div>
      <AllDisciplines />
    </div>
  );
}
