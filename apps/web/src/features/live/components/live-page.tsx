import { DAKAR_TIME_ZONE } from '@joj/shared';
import { SportGroups } from '@/features/results/components/sport-groups';
import { useLiveEvents } from '../api/live.queries';

/** Les épreuves en cours. La page se relit seule, sans action du visiteur (`live.queries.ts`). */
export function LivePage() {
  const live = useLiveEvents();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Direct</h1>
      {live.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {live.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger le direct.
        </p>
      )}
      {live.isSuccess && (
        <SportGroups
          events={live.data}
          emptyMessage="Aucune épreuve en cours pour le moment"
          timeZone={DAKAR_TIME_ZONE}
        />
      )}
    </div>
  );
}
