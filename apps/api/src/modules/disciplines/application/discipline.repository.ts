import type { Discipline } from '../domain/discipline';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleDisciplineRepository (infra) et InMemoryDisciplineRepository (tests).
 */
export abstract class DisciplineRepository {
  abstract findByName(name: string): Promise<Discipline | null>;
  /** Triées par nom. */
  abstract list(): Promise<Discipline[]>;
  /** Lève DISCIPLINE_NAME_TAKEN si le nom est déjà pris (contrainte d'unicité). */
  abstract insert(discipline: Discipline): Promise<void>;
}
