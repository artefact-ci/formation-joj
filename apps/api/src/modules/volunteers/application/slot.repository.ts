import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSlotRepository (infra) et InMemorySlotRepository (tests).
 */
export abstract class SlotRepository {
  abstract disciplineExists(disciplineId: string): Promise<boolean>;
  abstract insert(slot: Slot): Promise<void>;
  /** Le créneau avec son nombre d'inscrits, ou null. */
  abstract findById(id: string): Promise<Slot | null>;
  /** Lève SLOT_FULL si le créneau s'est rempli entre-temps (inscriptions simultanées). */
  abstract addRegistration(registration: Registration): Promise<void>;
}
