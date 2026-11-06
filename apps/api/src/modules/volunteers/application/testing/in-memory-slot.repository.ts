import { Registration } from '../../domain/registration';
import { Slot } from '../../domain/slot';
import { slotFull } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

/** Fake fidèle au contrat du port (discipline existante, capacité), pour tester sans base. */
export class InMemorySlotRepository extends SlotRepository {
  private readonly disciplineIds: Set<string>;
  private readonly slots = new Map<string, Slot>();
  private readonly registrations: Registration[] = [];

  /** Les disciplines existantes : celles du module Disciplines, en base. */
  constructor(disciplineIds: string[] = []) {
    super();
    this.disciplineIds = new Set(disciplineIds);
  }

  /** Nombre de créneaux enregistrés, pour vérifier qu'un refus n'a rien écrit. */
  count(): number {
    return this.slots.size;
  }

  async disciplineExists(disciplineId: string): Promise<boolean> {
    return this.disciplineIds.has(disciplineId);
  }

  async insert(slot: Slot): Promise<void> {
    this.slots.set(slot.id, cloneSlot(slot, 0));
  }

  async findById(id: string): Promise<Slot | null> {
    const found = this.slots.get(id);
    return found ? cloneSlot(found, this.registeredCount(id)) : null;
  }

  async addRegistration(registration: Registration): Promise<void> {
    const slot = this.slots.get(registration.slotId);
    if (!slot) return;
    // Comme le recomptage sous verrou en base : la capacité tient même si le créneau a changé.
    if (this.registeredCount(slot.id) >= slot.capacity) throw slotFull(slot.id, slot.capacity);
    this.registrations.push(Registration.restore({ ...registration.toProps() }));
  }

  private registeredCount(slotId: string): number {
    return this.registrations.filter((registration) => registration.slotId === slotId).length;
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function cloneSlot(slot: Slot, registeredCount: number): Slot {
  return Slot.restore({ ...slot.toProps(), registeredCount });
}
