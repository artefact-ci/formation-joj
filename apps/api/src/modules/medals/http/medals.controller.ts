import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  type MedalGapResponse,
  medalGapSchema,
  type MedalResponse,
  medalSchema,
  medalsQuerySchema,
  type NationStandingResponse,
  nationStandingSchema,
  nationStandingsQuerySchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { ListMedalGaps } from '../application/use-cases/list-medal-gaps';
import { ListMedals } from '../application/use-cases/list-medals';
import { ListNationStandings } from '../application/use-cases/list-nation-standings';
import type { Medal } from '../domain/medal';

class MedalsQueryDto extends createZodDto(medalsQuerySchema) {}
class NationStandingsQueryDto extends createZodDto(nationStandingsQuerySchema) {}
class MedalDto extends createZodDto(medalSchema) {}
class MedalGapDto extends createZodDto(medalGapSchema) {}
class NationStandingDto extends createZodDto(nationStandingSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('medals')
@Controller('medals')
export class MedalsController {
  constructor(
    private readonly listMedals: ListMedals,
    private readonly listNationStandings: ListNationStandings,
    private readonly listMedalGaps: ListMedalGaps,
  ) {}

  @Get('gaps')
  @ZodSerializerDto([MedalGapDto])
  gaps(): Promise<MedalGapResponse[]> {
    return this.listMedalGaps.execute();
  }

  @Get('standings')
  @ZodSerializerDto([NationStandingDto])
  standings(@Query() query: NationStandingsQueryDto): Promise<NationStandingResponse[]> {
    return this.listNationStandings.execute(query);
  }

  @Get()
  @ZodSerializerDto([MedalDto])
  async list(@Query() query: MedalsQueryDto): Promise<MedalResponse[]> {
    return (await this.listMedals.execute(query)).map(toResponse);
  }
}

function toResponse(medal: Medal): MedalResponse {
  return {
    id: medal.id,
    type: medal.type,
    sport: medal.sport,
    eventId: medal.eventId,
    eventName: medal.eventName,
    competitor: medal.competitor,
    nationCode: medal.nationCode,
    nationName: medal.nationName,
  };
}
