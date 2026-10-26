import { Module } from '@nestjs/common';
import { DisciplineRepository } from './application/discipline.repository';
import { CreateDiscipline } from './application/use-cases/create-discipline';
import { ListDisciplines } from './application/use-cases/list-disciplines';
import { DisciplinesController } from './http/disciplines.controller';
import { DrizzleDisciplineRepository } from './infra/drizzle-discipline.repository';

@Module({
  controllers: [DisciplinesController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: DisciplineRepository, useClass: DrizzleDisciplineRepository },
    CreateDiscipline,
    ListDisciplines,
  ],
})
export class DisciplinesModule {}
