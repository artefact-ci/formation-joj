import {
  DISCIPLINE_CATEGORIES,
  DISCIPLINE_NAME_MAX_LENGTH,
  type DisciplineCategory,
} from '@joj/shared';
import { DisciplineError } from './disciplines.errors';

export interface DisciplineProps {
  id: string;
  name: string;
  category: DisciplineCategory;
  createdAt: Date;
}

export interface NewDiscipline {
  id: string;
  name: string;
  /** Vérifiée ici : le domaine ne fait pas confiance à la validation HTTP. */
  category: string;
  now: Date;
}

/** Une discipline sportive des JOJ : un nom non vide, une catégorie de la liste fermée. */
export class Discipline {
  private constructor(private readonly props: DisciplineProps) {}

  static create({ id, name, category, now }: NewDiscipline): Discipline {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new DisciplineError('DISCIPLINE_NAME_REQUIRED', 'A discipline needs a name');
    }
    if (trimmed.length > DISCIPLINE_NAME_MAX_LENGTH) {
      throw new DisciplineError(
        'DISCIPLINE_NAME_TOO_LONG',
        `A discipline name has at most ${DISCIPLINE_NAME_MAX_LENGTH} characters`,
      );
    }
    if (!isCategory(category)) {
      throw new DisciplineError('DISCIPLINE_CATEGORY_UNKNOWN', `Unknown category ${category}`, {
        category,
        allowed: DISCIPLINE_CATEGORIES,
      });
    }
    return new Discipline({ id, name: trimmed, category, createdAt: now });
  }

  /** Reconstruit une discipline depuis la persistance, sans rejouer les règles de création. */
  static restore(props: DisciplineProps): Discipline {
    return new Discipline({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get category(): DisciplineCategory {
    return this.props.category;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

function isCategory(value: string): value is DisciplineCategory {
  return (DISCIPLINE_CATEGORIES as readonly string[]).includes(value);
}
