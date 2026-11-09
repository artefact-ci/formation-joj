import { useMedalGaps } from '../api/medals.queries';

/** Les nations dont les podiums importés diffèrent du tableau annoncé par la source. */
export function MedalGaps() {
  const gaps = useMedalGaps();
  if (!gaps.isSuccess || gaps.data.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
      {gaps.data.map((gap) => (
        <li key={gap.nationCode}>
          Écart avec la source : {gap.nationName}, {gap.announcedGold}-{gap.announcedSilver}-
          {gap.announcedBronze} annoncé
        </li>
      ))}
    </ul>
  );
}
