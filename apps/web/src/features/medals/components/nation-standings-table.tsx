import 'flag-icons/css/flag-icons.min.css';
import { HOST_NATION, type NationStandingResponse } from '@joj/shared';
import { cn } from '@/lib/utils';

const MEDAL_COUNT_CELL = 'px-2 py-2 text-center align-middle';

/** Le classement des nations, sur le modèle du bloc « Classement des médailles » de la maquette. */
export function NationStandingsTable({ standings }: { standings: NationStandingResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Classement des nations</caption>
        <thead>
          <tr className="text-muted-foreground">
            <th scope="col" className="w-8 py-2 pr-2 text-left font-medium">
              Rang
            </th>
            <th scope="col" className="py-2 pr-2 text-left font-medium">
              Nation
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Or
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Argent
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Bronze
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <StandingRow key={standing.nationCode} standing={standing} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StandingRow({ standing }: { standing: NationStandingResponse }) {
  const isHost = standing.nationCode === HOST_NATION;
  return (
    <tr className={cn('border-t', isHost && 'bg-accent font-bold')}>
      <td className="py-2 pr-2 pl-1 align-middle font-semibold">{standing.rank}</td>
      <td className="py-2 pr-2 align-middle whitespace-nowrap">
        <span aria-hidden="true" className={`fi fi-${standing.nationCode} mr-1.5 rounded-xs`} />
        {standing.nationName}
        {isHost && <span className="sr-only">{' (pays hôte)'}</span>}
      </td>
      <td className={MEDAL_COUNT_CELL}>{standing.gold}</td>
      <td className={MEDAL_COUNT_CELL}>{standing.silver}</td>
      <td className={MEDAL_COUNT_CELL}>{standing.bronze}</td>
      <td className={cn(MEDAL_COUNT_CELL, 'font-bold')}>{standing.total}</td>
    </tr>
  );
}
