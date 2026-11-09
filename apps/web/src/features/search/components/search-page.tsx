import {
  isSearchableText,
  SEARCH_MIN_LENGTH,
  type SearchHitKind,
  type SearchHitResponse,
} from '@joj/shared';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useSearchHits } from '../api/search.queries';

const routeApi = getRouteApi('/recherche');

const KIND_LABELS: Record<SearchHitKind, string> = {
  nation: 'Nation',
  sport: 'Sport',
  event: 'Épreuve',
  athlete: 'Athlète',
};

export function SearchPage() {
  const { q = '' } = routeApi.useSearch();
  const hits = useSearchHits({ q });
  const isTooShort = !isSearchableText(q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Recherche</h1>
      {isTooShort && (
        <p className="text-muted-foreground">Saisissez au moins {SEARCH_MIN_LENGTH} caractères</p>
      )}
      {!isTooShort && hits.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {!isTooShort && hits.isError && (
        <p role="alert" className="text-destructive">
          Impossible de lancer la recherche.
        </p>
      )}
      {!isTooShort && hits.isSuccess && <SearchHits hits={hits.data} />}
    </div>
  );
}

/** Sans date, une épreuve n'a pas de place dans la vue par jour : ses médailles sont sa page. */
function hitTarget(hit: SearchHitResponse) {
  if (hit.date === null && (hit.kind === 'event' || hit.kind === 'athlete')) {
    return { to: '/medailles', search: { sport: hit.sport ?? undefined } } as const;
  }
  return {
    to: '/resultats',
    search: {
      date: hit.date ?? undefined,
      sport: hit.sport ?? undefined,
      nation: hit.nation ?? undefined,
    },
  } as const;
}

function SearchHits({ hits }: { hits: SearchHitResponse[] }) {
  if (hits.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
        Aucun résultat pour cette recherche
      </p>
    );
  }
  return (
    <ul aria-label="Éléments trouvés" className="flex flex-col gap-2">
      {hits.map((hit) => (
        <li key={`${hit.kind}-${hit.label}-${hit.date ?? ''}-${hit.nation ?? ''}`}>
          <Link
            {...hitTarget(hit)}
            className="flex items-baseline gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm hover:bg-accent"
          >
            <span className="w-16 text-xs font-medium text-muted-foreground">
              {KIND_LABELS[hit.kind]}
            </span>
            <span className="font-semibold">{hit.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
