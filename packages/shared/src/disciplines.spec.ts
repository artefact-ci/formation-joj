import { describe, expect, it } from 'vitest';
import { createDisciplineSchema } from './disciplines.ts';

describe('createDisciplineSchema', () => {
  it('AS1: accepts a name and a listed category, and trims the name', () => {
    expect(
      createDisciplineSchema.parse({ name: '  Lutte ', category: 'sports-de-combat' }),
    ).toEqual({ name: 'Lutte', category: 'sports-de-combat' });
  });

  it.each(['', '   '])('AS2: rejects a discipline without a name (%j)', (name) => {
    expect(createDisciplineSchema.safeParse({ name, category: 'athletisme' }).success).toBe(false);
  });

  it('AS3: rejects a category outside the list', () => {
    expect(createDisciplineSchema.safeParse({ name: 'Échecs', category: 'jeux' }).success).toBe(
      false,
    );
  });
});
