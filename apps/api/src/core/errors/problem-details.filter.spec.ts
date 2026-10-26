import { NotFoundException } from '@nestjs/common';
import { createZodDto, ZodValidationException } from 'nestjs-zod';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from './app-error';
import { toProblem } from './problem-details.filter';

class SampleError extends AppError<'SAMPLE_TAKEN'> {
  constructor() {
    super('SAMPLE_TAKEN', 'CONFLICT', 'Sample already exists', { name: 'x' });
  }
}

describe('toProblem', () => {
  it('convertit une AppError selon sa catégorie, avec son code et ses détails', () => {
    expect(toProblem(new SampleError())).toEqual({
      type: 'urn:problem-type:sample-taken',
      title: 'Conflict',
      status: 409,
      code: 'SAMPLE_TAKEN',
      detail: 'Sample already exists',
      details: { name: 'x' },
    });
  });

  it('liste les champs invalides d’une erreur de validation zod', () => {
    class Dto extends createZodDto(z.object({ name: z.string() })) {}
    const result = Dto.schema.safeParse({});
    const problem = toProblem(new ZodValidationException(result.error));
    expect(problem).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(problem.errors).toEqual([{ path: 'name', message: expect.any(String) }]);
  });

  it('garde le statut des exceptions HTTP de Nest', () => {
    expect(toProblem(new NotFoundException())).toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });

  it('masque le détail d’une erreur inattendue', () => {
    expect(toProblem(new Error('secret interne'))).toEqual(
      expect.objectContaining({
        status: 500,
        code: 'INTERNAL_ERROR',
        detail: expect.not.stringContaining('secret'),
      }),
    );
  });
});
