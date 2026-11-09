import { Injectable } from '@nestjs/common';
import { findMedalGaps, type MedalGap } from '../../domain/medal-gaps';
import { buildNationStandings } from '../../domain/nation-standings';
import { MedalRepository } from '../medal.repository';

@Injectable()
export class ListMedalGaps {
  constructor(private readonly medals: MedalRepository) {}

  async execute(): Promise<MedalGap[]> {
    const [nations, medals, announced] = await Promise.all([
      this.medals.listNations(),
      this.medals.listMedals(),
      this.medals.listAnnouncedMedals(),
    ]);
    return findMedalGaps(buildNationStandings(nations, medals), announced);
  }
}
