import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';

@Module({
  imports: [CoreModule, DisciplinesModule],
})
export class AppModule {}
