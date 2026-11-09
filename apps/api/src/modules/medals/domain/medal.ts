import type { MedalType, SportSlug } from '@joj/shared';

export interface MedalProps {
  id: string;
  type: MedalType;
  sport: SportSlug;
  eventId: string;
  eventName: string;
  competitor: string;
  nationCode: string;
  nationName: string;
}

/** Le rang 1 donne l'or, le 2 l'argent, le 3 le bronze ; aucun autre rang ne donne de médaille. */
export function medalTypeForRank(rank: number): MedalType | null {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return null;
}

/** Une médaille, en lecture seule : un rang de 1 à 3 dans une épreuve terminée qui en attribue. */
export class Medal {
  private constructor(private readonly props: MedalProps) {}

  static restore(props: MedalProps): Medal {
    return new Medal({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get type(): MedalType {
    return this.props.type;
  }

  get sport(): SportSlug {
    return this.props.sport;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get eventName(): string {
    return this.props.eventName;
  }

  get competitor(): string {
    return this.props.competitor;
  }

  get nationCode(): string {
    return this.props.nationCode;
  }

  get nationName(): string {
    return this.props.nationName;
  }
}
