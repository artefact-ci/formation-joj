import { describe, expect, it } from 'vitest';
import { InMemorySearchRepository } from './testing/in-memory-search.repository';
import { SearchSite } from './use-cases/search-site';

describe('search (application layer)', () => {
  it('004-AS4: searches in the catalog', async () => {
    const repository = new InMemorySearchRepository({
      nations: [
        { code: 'sn', name: 'Sénégal' },
        { code: 'ke', name: 'Kenya' },
      ],
      events: [],
    });

    const hits = await new SearchSite(repository).execute({ q: 'senegal' });

    expect(hits.map((hit) => hit.label)).toEqual(['Sénégal']);
  });

  it('004-AS4: returns at most 20 hits', async () => {
    const repository = new InMemorySearchRepository({
      nations: Array.from({ length: 25 }, (_, index) => ({
        code: 'xx',
        name: `Nation ${index}`,
      })),
      events: [],
    });

    const hits = await new SearchSite(repository).execute({ q: 'nation' });

    expect(hits).toHaveLength(20);
  });
});
