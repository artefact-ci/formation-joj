import { SPORT_LABELS, SPORT_SLUGS } from '@joj/shared';
import { useId } from 'react';

export function AllDisciplines() {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <h2 id={titleId} className="mb-4 text-lg font-bold">
        Toutes les disciplines
      </h2>
      <ul className="flex flex-wrap gap-2">
        {SPORT_SLUGS.map((slug) => (
          <li key={slug} className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium">
            {SPORT_LABELS[slug]}
          </li>
        ))}
      </ul>
    </section>
  );
}
