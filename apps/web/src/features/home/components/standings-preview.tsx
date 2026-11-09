import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useNationStandings } from '@/features/medals/api/medals.queries';
import { NationStandingsTable } from '@/features/medals/components/nation-standings-table';

const PREVIEW_SIZE = 10;

/** Le début du classement : le classement complet reste sur la page des médailles. */
export function StandingsPreview() {
  const titleId = useId();
  const standings = useNationStandings({});
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:p-6"
    >
      <h2 id={titleId} className="text-lg font-bold">
        Classement des médailles
      </h2>
      {standings.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {standings.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger le classement.
        </p>
      )}
      {standings.isSuccess && (
        <NationStandingsTable standings={standings.data.slice(0, PREVIEW_SIZE)} />
      )}
      <Link to="/medailles" className="text-sm font-semibold underline">
        Voir tout le classement
      </Link>
    </section>
  );
}
