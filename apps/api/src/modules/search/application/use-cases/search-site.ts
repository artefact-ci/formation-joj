import { Injectable } from '@nestjs/common';
import type { SearchHitResponse, SearchQuery } from '@joj/shared';
import { findSearchHits } from '../../domain/search-hit';
import { SearchRepository } from '../search.repository';

const MAX_HITS = 20;

@Injectable()
export class SearchSite {
  constructor(private readonly search: SearchRepository) {}

  async execute({ q }: SearchQuery): Promise<SearchHitResponse[]> {
    const catalog = await this.search.loadCatalog();
    return findSearchHits(q, catalog).slice(0, MAX_HITS);
  }
}
