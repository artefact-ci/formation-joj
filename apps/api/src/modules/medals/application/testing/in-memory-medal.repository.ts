import type { Medal } from '../../domain/medal';
import type { AnnouncedMedals } from '../../domain/medal-gaps';
import type { Nation } from '../../domain/nation-standings';
import { MedalRepository } from '../medal.repository';

/** Fake fidèle au contrat du port, pour tester l'application sans base. */
export class InMemoryMedalRepository extends MedalRepository {
  constructor(
    private readonly medals: Medal[] = [],
    private readonly nations: Nation[] = [],
    private readonly announced: AnnouncedMedals[] = [],
  ) {
    super();
  }

  async listMedals(): Promise<Medal[]> {
    return this.medals;
  }

  async listNations(): Promise<Nation[]> {
    return this.nations;
  }

  async listAnnouncedMedals(): Promise<AnnouncedMedals[]> {
    return this.announced;
  }
}
