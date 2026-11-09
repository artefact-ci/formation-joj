import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type SearchHitResponse, searchHitSchema, searchQuerySchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { SearchSite } from '../application/use-cases/search-site';

class SearchQueryDto extends createZodDto(searchQuerySchema) {}
class SearchHitDto extends createZodDto(searchHitSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchSite: SearchSite) {}

  @Get()
  @ZodSerializerDto([SearchHitDto])
  search(@Query() query: SearchQueryDto): Promise<SearchHitResponse[]> {
    return this.searchSite.execute(query);
  }
}
