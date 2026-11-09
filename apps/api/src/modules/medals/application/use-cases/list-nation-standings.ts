import { Injectable } from '@nestjs/common';
import type { NationStandingsQuery } from '@joj/shared';
import { buildNationStandings, type NationStanding } from '../../domain/nation-standings';
import { MedalRepository } from '../medal.repository';

@Injectable()
export class ListNationStandings {
  constructor(private readonly medals: MedalRepository) {}

  /** Le classement porte sur toutes les nations : le filtre vient après, et garde le rang général. */
  async execute({ continent }: NationStandingsQuery): Promise<NationStanding[]> {
    const [nations, medals] = await Promise.all([
      this.medals.listNations(),
      this.medals.listMedals(),
    ]);
    return buildNationStandings(nations, medals).filter(
      (standing) => continent === undefined || standing.continent === continent,
    );
  }
}
