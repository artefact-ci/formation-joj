import type { DisciplineResponse } from '@joj/shared';
import { CATEGORY_LABELS } from './category-labels';

export function DisciplineList({ disciplines }: { disciplines: DisciplineResponse[] }) {
  if (disciplines.length === 0) {
    return <p className="text-muted-foreground">Aucune discipline pour l’instant.</p>;
  }
  return (
    <ul aria-label="Disciplines" className="divide-y rounded-md border">
      {disciplines.map((discipline) => (
        <li key={discipline.id} className="flex items-center justify-between px-4 py-3">
          <span className="font-medium">{discipline.name}</span>
          <span className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[discipline.category]}
          </span>
        </li>
      ))}
    </ul>
  );
}
