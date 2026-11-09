import { GAMES_FIRST_DAY, GAMES_LAST_DAY } from '@joj/shared';

/** Le jour affiché à l'ouverture : aujourd'hui à Dakar (UTC) pendant les Jeux, sinon le premier. */
export function defaultDay(now: Date): string {
  const today = now.toISOString().slice(0, 10);
  return today >= GAMES_FIRST_DAY && today <= GAMES_LAST_DAY ? today : GAMES_FIRST_DAY;
}
