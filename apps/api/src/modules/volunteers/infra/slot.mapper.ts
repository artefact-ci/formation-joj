import type { Registration } from '../domain/registration';
import { Slot } from '../domain/slot';
import type { RegistrationRow, SlotRow } from './volunteers.schema';

/** Ligne de la table + nombre d'inscrits compté → entité. */
export function toDomain(row: SlotRow, registeredCount: number): Slot {
  return Slot.restore({
    id: row.id,
    disciplineId: row.disciplineId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    capacity: row.capacity,
    createdAt: row.createdAt,
    registeredCount,
  });
}

/** Entité → ligne de la table ; le nombre d'inscrits n'est pas stocké. */
export function toRow(slot: Slot): SlotRow {
  return {
    id: slot.id,
    disciplineId: slot.disciplineId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    capacity: slot.capacity,
    createdAt: slot.createdAt,
  };
}

export function toRegistrationRow(registration: Registration): RegistrationRow {
  return {
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    registeredAt: registration.registeredAt,
  };
}
