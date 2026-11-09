import { GAMES_FIRST_DAY, GAMES_LAST_DAY } from '@joj/shared';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const SHORT_DAY = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

function gamesDays(): string[] {
  const days: string[] = [];
  const last = new Date(GAMES_LAST_DAY).getTime();
  for (let time = new Date(GAMES_FIRST_DAY).getTime(); time <= last; time += ONE_DAY_IN_MS) {
    days.push(new Date(time).toISOString().slice(0, 10));
  }
  return days;
}

interface DaySelectorProps {
  to: '/resultats' | '/calendrier';
  selectedDay: string;
}

/**
 * Les jours des Jeux en pastilles, comme le bloc « Derniers résultats » de la maquette.
 * Changer de jour conserve les autres filtres de l'adresse.
 */
export function DaySelector({ to, selectedDay }: DaySelectorProps) {
  return (
    <nav aria-label="Jours des Jeux" className="-mx-1 overflow-x-auto px-1 py-1">
      <ul className="flex w-max gap-2">
        {gamesDays().map((day) => (
          <li key={day}>
            <Link
              from={to}
              search={(previous) => ({ ...previous, date: day })}
              aria-current={day === selectedDay ? 'date' : undefined}
              className={cn(
                'block rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                day === selectedDay
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent',
              )}
            >
              {SHORT_DAY.format(new Date(day))}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
