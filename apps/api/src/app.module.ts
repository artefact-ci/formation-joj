import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { MedalsModule } from './modules/medals/medals.module';
import { ResultsModule } from './modules/results/results.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [CoreModule, ResultsModule, MedalsModule, SearchModule],
})
export class AppModule {}
