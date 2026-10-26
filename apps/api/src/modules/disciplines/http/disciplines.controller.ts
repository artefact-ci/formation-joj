import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createDisciplineSchema, type DisciplineResponse, disciplineSchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { CreateDiscipline } from '../application/use-cases/create-discipline';
import { ListDisciplines } from '../application/use-cases/list-disciplines';
import type { Discipline } from '../domain/discipline';

class CreateDisciplineDto extends createZodDto(createDisciplineSchema) {}
class DisciplineDto extends createZodDto(disciplineSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('disciplines')
@Controller('disciplines')
export class DisciplinesController {
  constructor(
    private readonly createDiscipline: CreateDiscipline,
    private readonly listDisciplines: ListDisciplines,
  ) {}

  @Get()
  @ZodSerializerDto([DisciplineDto])
  async list(): Promise<DisciplineResponse[]> {
    return (await this.listDisciplines.execute()).map(toResponse);
  }

  @Post()
  @ZodSerializerDto(DisciplineDto)
  async create(@Body() body: CreateDisciplineDto): Promise<DisciplineResponse> {
    return toResponse(await this.createDiscipline.execute(body));
  }
}

function toResponse(discipline: Discipline): DisciplineResponse {
  return {
    id: discipline.id,
    name: discipline.name,
    category: discipline.category,
    createdAt: discipline.createdAt.toISOString(),
  };
}
