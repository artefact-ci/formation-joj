import { useId } from 'react';

/** Les chiffres de la source : 25 sports, 205 délégations dont les réfugiés, plus de 4 000 jeunes. */
const KEY_FIGURES = [
  { value: '25', label: 'Disciplines' },
  { value: '205', label: 'Nations' },
  { value: 'Plus de 4 000', label: 'Jeunes athlètes' },
];

export function KeyFigures() {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <h2 id={titleId} className="sr-only">
        Chiffres clés
      </h2>
      <ul className="grid gap-4 text-center sm:grid-cols-3">
        {KEY_FIGURES.map(({ value, label }) => (
          <li key={label}>
            <span className="block text-2xl font-extrabold">{value}</span>{' '}
            <span className="text-sm text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
