import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEER_ERROR_KINDS = {
  /** Capacité qui n'est pas un entier d'au moins 1. */
  SLOT_CAPACITY_INVALID: 'VALIDATION',
  /** Fin du créneau égale ou antérieure à son début. */
  SLOT_TIME_RANGE_INVALID: 'VALIDATION',
  /** Nom du bénévole vide, ou fait seulement d'espaces. */
  VOLUNTEER_NAME_REQUIRED: 'VALIDATION',
  VOLUNTEER_EMAIL_INVALID: 'VALIDATION',
  /** Aucune discipline n'a cet identifiant : on ne peut pas y ouvrir de créneau. */
  DISCIPLINE_NOT_FOUND: 'NOT_FOUND',
  /** Aucun créneau n'a cet identifiant. */
  SLOT_NOT_FOUND: 'NOT_FOUND',
  /** Le créneau a atteint sa capacité. */
  SLOT_FULL: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type VolunteerErrorCode = keyof typeof VOLUNTEER_ERROR_KINDS;

export class VolunteerError extends AppError<VolunteerErrorCode> {
  constructor(code: VolunteerErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEER_ERROR_KINDS[code], message, details);
  }
}

export function disciplineNotFound(disciplineId: string): VolunteerError {
  return new VolunteerError('DISCIPLINE_NOT_FOUND', `No discipline with id ${disciplineId}`, {
    disciplineId,
  });
}

export function slotNotFound(id: string): VolunteerError {
  return new VolunteerError('SLOT_NOT_FOUND', `No slot with id ${id}`, { id });
}

export function slotFull(id: string, capacity: number): VolunteerError {
  return new VolunteerError('SLOT_FULL', `The slot ${id} is full`, { id, capacity });
}
