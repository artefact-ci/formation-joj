import type { SearchCatalog } from '../../domain/search-hit';
import { SearchRepository } from '../search.repository';

/** Fake fidèle au contrat du port, pour tester l'application sans base. */
export class InMemorySearchRepository extends SearchRepository {
  constructor(private readonly catalog: SearchCatalog) {
    super();
  }

  async loadCatalog(): Promise<SearchCatalog> {
    return this.catalog;
  }
}
