import { Injectable } from '@nestjs/common';
import type { NationAthletesQuery } from '@joj/shared';
import type { NationAthlete } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListNationAthletes {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute({ date, nation }: NationAthletesQuery): Promise<NationAthlete[]> {
    const events = await this.sportEvents.listByDay(date);
    return events
      .flatMap((event) => event.athletesOf(nation))
      .toSorted(
        (a, b) =>
          a.startsAt.getTime() - b.startsAt.getTime() ||
          a.competitor.localeCompare(b.competitor, 'fr'),
      );
  }
}
