import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const DISCIPLINE_ERROR_KINDS = {
  /** Nom vide, ou fait seulement d'espaces. */
  DISCIPLINE_NAME_REQUIRED: 'VALIDATION',
  DISCIPLINE_NAME_TOO_LONG: 'VALIDATION',
  /** Catégorie absente de DISCIPLINE_CATEGORIES. */
  DISCIPLINE_CATEGORY_UNKNOWN: 'VALIDATION',
  /** Une discipline porte déjà ce nom. */
  DISCIPLINE_NAME_TAKEN: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type DisciplineErrorCode = keyof typeof DISCIPLINE_ERROR_KINDS;

export class DisciplineError extends AppError<DisciplineErrorCode> {
  constructor(code: DisciplineErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, DISCIPLINE_ERROR_KINDS[code], message, details);
  }
}

export function disciplineNameTaken(name: string): DisciplineError {
  return new DisciplineError('DISCIPLINE_NAME_TAKEN', `A discipline named ${name} already exists`, {
    name,
  });
}
