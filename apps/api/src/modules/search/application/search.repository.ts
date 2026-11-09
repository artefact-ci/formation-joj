import type { SearchCatalog } from '../domain/search-hit';

/**
 * Port de persistance : ce dont le cas d'usage a besoin, rien de plus.
 * Implémenté par DrizzleSearchRepository (infra) et InMemorySearchRepository (tests).
 */
export abstract class SearchRepository {
  /** Les nations, et les épreuves triées par heure avec leurs participants. */
  abstract loadCatalog(): Promise<SearchCatalog>;
}
