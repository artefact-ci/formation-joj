import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RegisterVolunteerInput } from '@joj/shared';
import type { Registration } from '../../domain/registration';
import { slotNotFound } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

export interface RegisteredVolunteer {
  registration: Registration;
  remainingPlaces: number;
}

@Injectable()
export class RegisterVolunteer {
  constructor(private readonly slots: SlotRepository) {}

  async execute(slotId: string, input: RegisterVolunteerInput): Promise<RegisteredVolunteer> {
    const slot = await this.slots.findById(slotId);
    if (!slot) throw slotNotFound(slotId);
    // Refus clair dans le cas courant ; le repository recompte sous verrou pour deux inscriptions simultanées.
    const registration = slot.register({ id: randomUUID(), ...input, now: new Date() });
    await this.slots.addRegistration(registration);
    return { registration, remainingPlaces: slot.remainingPlaces };
  }
}
