import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export type TimeZoneChoice = 'dakar' | 'local';

const PILL =
  'block rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors';
const OPTIONS: { zone: TimeZoneChoice; label: string }[] = [
  { zone: 'dakar', label: 'Heure de Dakar' },
  { zone: 'local', label: 'Mon heure locale' },
];

/** Le choix du fuseau des horaires, et l'indication de celui qui est affiché. */
export function TimeZoneSwitch({ selected }: { selected: TimeZoneChoice }) {
  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Fuseau horaire">
        <ul className="flex flex-wrap gap-2">
          {OPTIONS.map(({ zone, label }) => (
            <li key={zone}>
              <Link
                from="/calendrier"
                search={(previous) => ({ ...previous, zone })}
                aria-current={zone === selected ? 'true' : undefined}
                className={cn(
                  PILL,
                  zone === selected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-accent',
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-sm text-muted-foreground">
        {selected === 'dakar' ? "Horaires à l'heure de Dakar" : 'Horaires à votre heure locale'}
      </p>
    </div>
  );
}
