import { Module } from '@nestjs/common';
import { SportEventRepository } from './application/sport-event.repository';
import { GetDataSource } from './application/use-cases/get-data-source';
import { ListDayCalendar } from './application/use-cases/list-day-calendar';
import { ListDayResults } from './application/use-cases/list-day-results';
import { ListLatestResults } from './application/use-cases/list-latest-results';
import { ListLiveEvents } from './application/use-cases/list-live-events';
import { ListNationAthletes } from './application/use-cases/list-nation-athletes';
import { ListUndatedEvents } from './application/use-cases/list-undated-events';
import { ResultsController } from './http/results.controller';
import { DrizzleSportEventRepository } from './infra/drizzle-sport-event.repository';

@Module({
  controllers: [ResultsController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: SportEventRepository, useClass: DrizzleSportEventRepository },
    ListDayResults,
    ListDayCalendar,
    ListNationAthletes,
    ListLatestResults,
    ListLiveEvents,
    GetDataSource,
    ListUndatedEvents,
  ],
})
export class ResultsModule {}
