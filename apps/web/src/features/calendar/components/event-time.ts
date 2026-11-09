/** L'heure d'une épreuve dans un fuseau donné, au format français : « 20h30 ». */
export function formatEventTime(startsAt: string, timeZone: string): string {
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
  return time.format(new Date(startsAt)).replace(':', 'h');
}

/** Le fuseau de l'appareil du visiteur. */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
