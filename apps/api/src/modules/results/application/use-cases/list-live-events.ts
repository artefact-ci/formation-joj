import { Injectable } from '@nestjs/common';
import type { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListLiveEvents {
  constructor(private readonly sportEvents: SportEventRepository) {}

  execute(): Promise<SportEvent[]> {
    return this.sportEvents.listInProgress();
  }
}
