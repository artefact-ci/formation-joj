import {
  CONTINENTS,
  type Continent,
  MEDAL_TYPES,
  type MedalType,
  medalTypeSchema,
  SPORT_SLUGS,
  type SportSlug,
  sportSlugSchema,
} from '@joj/shared';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { SPORT_LABELS } from '@/features/results/components/result-labels';
import { cn } from '@/lib/utils';
import { useMedals, useNationStandings } from '../api/medals.queries';
import { CONTINENT_LABELS, MEDAL_TYPE_LABELS } from './medal-labels';
import { MedalGaps } from './medal-gaps';
import { MedalList } from './medal-list';
import { NationStandingsTable } from './nation-standings-table';

const routeApi = getRouteApi('/medailles');

export function MedalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Médailles</h1>
      <StandingsSection />
      <MedalsSection />
    </div>
  );
}

function StandingsSection() {
  const { continent } = routeApi.useSearch();
  const standings = useNationStandings({ continent });
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-bold">Classement des nations</h2>
      <ContinentSelector selected={continent} />
      {standings.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {standings.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger le classement.
        </p>
      )}
      {standings.isSuccess && <NationStandingsTable standings={standings.data} />}
      <MedalGaps />
    </section>
  );
}

const PILL =
  'block rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors';
const PILL_SELECTED = 'bg-primary text-primary-foreground';
const PILL_IDLE = 'bg-muted text-foreground hover:bg-accent';

/** Les continents en pastilles, comme le bloc « Classement des médailles » de la maquette. */
function ContinentSelector({ selected }: { selected: Continent | undefined }) {
  const options: { continent: Continent | undefined; label: string }[] = [
    { continent: undefined, label: 'Tous les pays' },
    ...CONTINENTS.map((continent) => ({ continent, label: CONTINENT_LABELS[continent] })),
  ];
  return (
    <nav aria-label="Continents" className="-mx-1 overflow-x-auto px-1 py-1">
      <ul className="flex w-max gap-2">
        {options.map(({ continent, label }) => (
          <li key={label}>
            <Link
              to="/medailles"
              search={(previous) => ({ ...previous, continent })}
              aria-current={continent === selected ? 'true' : undefined}
              className={cn(PILL, continent === selected ? PILL_SELECTED : PILL_IDLE)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MedalsSection() {
  const { sport, type } = routeApi.useSearch();
  const medals = useMedals({ sport, type });
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Médailles par sport et par épreuve</h2>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row md:p-6">
        <SportFilter sport={sport} />
        <MedalTypeFilter type={type} />
      </div>
      {medals.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {medals.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les médailles.
        </p>
      )}
      {medals.isSuccess && <MedalList medals={medals.data} />}
    </section>
  );
}

function SportFilter({ sport }: { sport: SportSlug | undefined }) {
  const navigate = useNavigate({ from: '/medailles' });
  const selectId = useId();
  return (
    <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor={selectId}>Sport</Label>
      <NativeSelect
        id={selectId}
        value={sport ?? ''}
        onChange={(event) => {
          const parsed = sportSlugSchema.safeParse(event.target.value);
          void navigate({
            search: (previous) => ({
              ...previous,
              sport: parsed.success ? parsed.data : undefined,
            }),
          });
        }}
      >
        <option value="">Tous les sports</option>
        {SPORT_SLUGS.map((slug) => (
          <option key={slug} value={slug}>
            {SPORT_LABELS[slug]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function MedalTypeFilter({ type }: { type: MedalType | undefined }) {
  const navigate = useNavigate({ from: '/medailles' });
  const selectId = useId();
  return (
    <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor={selectId}>Type de médaille</Label>
      <NativeSelect
        id={selectId}
        value={type ?? ''}
        onChange={(event) => {
          const parsed = medalTypeSchema.safeParse(event.target.value);
          void navigate({
            search: (previous) => ({
              ...previous,
              type: parsed.success ? parsed.data : undefined,
            }),
          });
        }}
      >
        <option value="">Tous les types</option>
        {MEDAL_TYPES.map((medalType) => (
          <option key={medalType} value={medalType}>
            {MEDAL_TYPE_LABELS[medalType]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
