import { Module } from '@nestjs/common';
import { SearchRepository } from './application/search.repository';
import { SearchSite } from './application/use-cases/search-site';
import { SearchController } from './http/search.controller';
import { DrizzleSearchRepository } from './infra/drizzle-search.repository';

@Module({
  controllers: [SearchController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: SearchRepository, useClass: DrizzleSearchRepository },
    SearchSite,
  ],
})
export class SearchModule {}
