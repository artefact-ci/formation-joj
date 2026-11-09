import { Injectable } from '@nestjs/common';
import type { MedalsQuery } from '@joj/shared';
import type { Medal } from '../../domain/medal';
import { MedalRepository } from '../medal.repository';

@Injectable()
export class ListMedals {
  constructor(private readonly medals: MedalRepository) {}

  async execute({ sport, type }: MedalsQuery): Promise<Medal[]> {
    return (await this.medals.listMedals())
      .filter((medal) => sport === undefined || medal.sport === sport)
      .filter((medal) => type === undefined || medal.type === type);
  }
}
