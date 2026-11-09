import { Injectable } from '@nestjs/common';
import type { UndatedEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class ListUndatedEvents {
  constructor(private readonly sportEvents: SportEventRepository) {}

  execute(): Promise<UndatedEvent[]> {
    return this.sportEvents.listUndated();
  }
}
