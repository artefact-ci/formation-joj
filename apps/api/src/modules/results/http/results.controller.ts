import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  calendarQuerySchema,
  type DataSourceResponse,
  dataSourceSchema,
  dayResultsQuerySchema,
  type NationAthleteResponse,
  nationAthleteSchema,
  nationAthletesQuerySchema,
  type SportEventResponse,
  sportEventSchema,
  type UndatedEventResponse,
  undatedEventSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { GetDataSource } from '../application/use-cases/get-data-source';
import { ListDayCalendar } from '../application/use-cases/list-day-calendar';
import { ListDayResults } from '../application/use-cases/list-day-results';
import { ListLatestResults } from '../application/use-cases/list-latest-results';
import { ListLiveEvents } from '../application/use-cases/list-live-events';
import { ListNationAthletes } from '../application/use-cases/list-nation-athletes';
import { ListUndatedEvents } from '../application/use-cases/list-undated-events';
import type { NationAthlete, SportEvent } from '../domain/sport-event';

class DayResultsQueryDto extends createZodDto(dayResultsQuerySchema) {}
class CalendarQueryDto extends createZodDto(calendarQuerySchema) {}
class NationAthletesQueryDto extends createZodDto(nationAthletesQuerySchema) {}
class SportEventDto extends createZodDto(sportEventSchema) {}
class NationAthleteDto extends createZodDto(nationAthleteSchema) {}
class DataSourceDto extends createZodDto(dataSourceSchema) {}
class UndatedEventDto extends createZodDto(undatedEventSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('results')
@Controller('results')
export class ResultsController {
  constructor(
    private readonly listDayResults: ListDayResults,
    private readonly listDayCalendar: ListDayCalendar,
    private readonly listNationAthletes: ListNationAthletes,
    private readonly listLatestResults: ListLatestResults,
    private readonly listLiveEvents: ListLiveEvents,
    private readonly getDataSource: GetDataSource,
    private readonly listUndatedEvents: ListUndatedEvents,
  ) {}

  @Get()
  @ZodSerializerDto([SportEventDto])
  async list(@Query() query: DayResultsQueryDto): Promise<SportEventResponse[]> {
    return (await this.listDayResults.execute(query)).map(toResponse);
  }

  @Get('source')
  @ZodSerializerDto(DataSourceDto)
  source(): Promise<DataSourceResponse> {
    return this.getDataSource.execute();
  }

  @Get('undated')
  @ZodSerializerDto([UndatedEventDto])
  undated(): Promise<UndatedEventResponse[]> {
    return this.listUndatedEvents.execute();
  }

  @Get('latest')
  @ZodSerializerDto([SportEventDto])
  async latest(): Promise<SportEventResponse[]> {
    return (await this.listLatestResults.execute()).map(toResponse);
  }

  @Get('live')
  @ZodSerializerDto([SportEventDto])
  async live(): Promise<SportEventResponse[]> {
    return (await this.listLiveEvents.execute()).map(toResponse);
  }

  @Get('calendar')
  @ZodSerializerDto([SportEventDto])
  async calendar(@Query() query: CalendarQueryDto): Promise<SportEventResponse[]> {
    return (await this.listDayCalendar.execute(query)).map(toResponse);
  }

  @Get('athletes')
  @ZodSerializerDto([NationAthleteDto])
  async athletes(@Query() query: NationAthletesQueryDto): Promise<NationAthleteResponse[]> {
    return (await this.listNationAthletes.execute(query)).map(toAthleteResponse);
  }
}

function toResponse(event: SportEvent): SportEventResponse {
  return {
    id: event.id,
    sport: event.sport,
    name: event.name,
    startsAt: event.startsAt.toISOString(),
    hasStartTime: event.hasStartTime,
    status: event.status,
    ranking: event.ranking,
  };
}

function toAthleteResponse(athlete: NationAthlete): NationAthleteResponse {
  return { ...athlete, startsAt: athlete.startsAt.toISOString() };
}
