import { Injectable } from '@nestjs/common';
import { type DataSource, DataSourceNotFoundError } from '../../domain/data-source';
import { SportEventRepository } from '../sport-event.repository';

@Injectable()
export class GetDataSource {
  constructor(private readonly sportEvents: SportEventRepository) {}

  async execute(): Promise<DataSource> {
    const source = await this.sportEvents.findDataSource();
    if (source === null) throw new DataSourceNotFoundError();
    return source;
  }
}
