import { Registration } from './registration';
import { slotFull, VolunteerError } from './volunteers.errors';

export interface SlotProps {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  createdAt: Date;
  /** Nombre d'inscriptions déjà enregistrées : compté en base, jamais stocké. */
  registeredCount: number;
}

export interface NewSlot {
  id: string;
  disciplineId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  now: Date;
}

export interface NewVolunteer {
  id: string;
  name: string;
  email: string;
  now: Date;
}

/** Un créneau de bénévolat d'une discipline : une plage horaire et une capacité d'au moins 1. */
export class Slot {
  private constructor(private props: SlotProps) {}

  static create({ id, disciplineId, startsAt, endsAt, capacity, now }: NewSlot): Slot {
    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new VolunteerError('SLOT_TIME_RANGE_INVALID', 'A slot must end after it starts', {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    }
    return new Slot({
      id,
      disciplineId,
      startsAt,
      endsAt,
      capacity: validCapacity(capacity),
      createdAt: now,
      registeredCount: 0,
    });
  }

  /** Reconstruit un créneau depuis la persistance, sans rejouer les règles de création. */
  static restore(props: SlotProps): Slot {
    return new Slot({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get disciplineId(): string {
    return this.props.disciplineId;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get endsAt(): Date {
    return this.props.endsAt;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get registeredCount(): number {
    return this.props.registeredCount;
  }

  get remainingPlaces(): number {
    return this.props.capacity - this.props.registeredCount;
  }

  /** Inscrit un bénévole ; jamais au-delà de la capacité. */
  register({ id, name, email, now }: NewVolunteer): Registration {
    if (this.remainingPlaces <= 0) throw slotFull(this.id, this.capacity);
    const registration = Registration.create({ id, slotId: this.id, name, email, now });
    this.props = { ...this.props, registeredCount: this.props.registeredCount + 1 };
    return registration;
  }

  toProps(): SlotProps {
    return { ...this.props };
  }
}

function validCapacity(capacity: number): number {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new VolunteerError(
      'SLOT_CAPACITY_INVALID',
      'A slot capacity is an integer of at least 1',
      {
        capacity,
      },
    );
  }
  return capacity;
}
