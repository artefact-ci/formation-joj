import type { RankingMention, SportEventStatus } from '@joj/shared';

export { SPORT_LABELS } from '@joj/shared';

export const STATUS_LABELS: Record<SportEventStatus, string> = {
  scheduled: 'Programmé',
  'in-progress': 'En cours',
  finished: 'Terminé',
  unpublished: 'Résultat non publié',
};

export const MENTION_LABELS: Record<RankingMention, string> = {
  disqualified: 'Disqualifié',
  'did-not-finish': "N'a pas terminé",
};
