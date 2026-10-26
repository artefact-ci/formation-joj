import { Discipline } from '../../domain/discipline';
import { disciplineNameTaken } from '../../domain/disciplines.errors';
import { DisciplineRepository } from '../discipline.repository';

/** Fake fidèle au contrat du port (unicité du nom, tri), pour tester l'application sans base. */
export class InMemoryDisciplineRepository extends DisciplineRepository {
  private readonly rows = new Map<string, Discipline>();

  async findByName(name: string): Promise<Discipline | null> {
    const found = [...this.rows.values()].find((discipline) => discipline.name === name);
    return found ? clone(found) : null;
  }

  async list(): Promise<Discipline[]> {
    return [...this.rows.values()]
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .map(clone);
  }

  async insert(discipline: Discipline): Promise<void> {
    // Comme la contrainte d'unicité en base.
    if (await this.findByName(discipline.name)) {
      throw disciplineNameTaken(discipline.name);
    }
    this.rows.set(discipline.id, clone(discipline));
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function clone(discipline: Discipline): Discipline {
  return Discipline.restore({
    id: discipline.id,
    name: discipline.name,
    category: discipline.category,
    createdAt: discipline.createdAt,
  });
}
