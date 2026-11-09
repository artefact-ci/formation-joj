import { Injectable } from '@nestjs/common';
import type { DayResultsQuery } from '@joj/shared';
import type { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListDayResults {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute({ date, sport, nation }: DayResultsQuery): Promise<SportEvent[]> {
    const events = await this.sportEvents.listByDay(date, sport);
    return nation === undefined
      ? events
      : events.filter((event) => event.hasParticipantFrom(nation));
  }
}
