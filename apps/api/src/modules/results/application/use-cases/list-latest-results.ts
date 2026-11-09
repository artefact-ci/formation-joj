import { Injectable } from '@nestjs/common';
import type { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

const LATEST_RESULTS_COUNT = 3;

@Injectable()
export class ListLatestResults {
  constructor(private readonly sportEvents: SportEventRepository) {}

  execute(): Promise<SportEvent[]> {
    return this.sportEvents.listLatestFinished(LATEST_RESULTS_COUNT);
  }
}
