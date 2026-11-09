import { Injectable } from '@nestjs/common';
import type { CalendarQuery } from '@joj/shared';
import type { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListDayCalendar {
  constructor(private readonly sportEvents: SportEventRepository) {}

  /** « À venir » se lit sur le statut de l'épreuve, sans comparer son heure à l'heure actuelle. */
  async execute({ date, sport }: CalendarQuery): Promise<SportEvent[]> {
    const events = await this.sportEvents.listByDay(date, sport);
    return events.filter((event) => event.status === 'scheduled');
  }
}
