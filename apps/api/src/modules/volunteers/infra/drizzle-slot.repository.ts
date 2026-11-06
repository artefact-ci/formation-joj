import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { disciplines } from '../../disciplines/infra/disciplines.schema';
import { SlotRepository } from '../application/slot.repository';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';
import { slotFull } from '../domain/volunteers.errors';
import { toDomain, toRegistrationRow, toRow } from './slot.mapper';
import { registrations, slots } from './volunteers.schema';

@Injectable()
export class DrizzleSlotRepository extends SlotRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async disciplineExists(disciplineId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: disciplines.id })
      .from(disciplines)
      .where(eq(disciplines.id, disciplineId))
      .limit(1);
    return row !== undefined;
  }

  async insert(slot: Slot): Promise<void> {
    await this.db.insert(slots).values(toRow(slot));
  }

  async findById(id: string): Promise<Slot | null> {
    const [row] = await this.db.select().from(slots).where(eq(slots.id, id)).limit(1);
    return row ? toDomain(row, await this.registeredCount(this.db, id)) : null;
  }

  async addRegistration(registration: Registration): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Le verrou sur le créneau sérialise les inscriptions simultanées : le recomptage est sûr.
      const [slot] = await tx
        .select({ id: slots.id, capacity: slots.capacity })
        .from(slots)
        .where(eq(slots.id, registration.slotId))
        .for('update');
      if (!slot) return;
      if ((await this.registeredCount(tx, slot.id)) >= slot.capacity) {
        throw slotFull(slot.id, slot.capacity);
      }
      await tx.insert(registrations).values(toRegistrationRow(registration));
    });
  }

  private async registeredCount(db: Pick<Database, 'select'>, slotId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(registrations)
      .where(eq(registrations.slotId, slotId));
    return row?.value ?? 0;
  }
}
