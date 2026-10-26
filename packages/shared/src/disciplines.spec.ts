import { describe, expect, it } from 'vitest';
import { createDisciplineSchema } from './disciplines.ts';

describe('createDisciplineSchema', () => {
  it('AS1: accepte un nom et une catégorie de la liste, nom nettoyé', () => {
    expect(
      createDisciplineSchema.parse({ name: '  Lutte ', category: 'sports-de-combat' }),
    ).toEqual({ name: 'Lutte', category: 'sports-de-combat' });
  });

  it.each(['', '   '])('AS2: refuse une discipline sans nom (%j)', (name) => {
    expect(createDisciplineSchema.safeParse({ name, category: 'athletisme' }).success).toBe(false);
  });

  it('AS3: refuse une catégorie hors liste', () => {
    expect(createDisciplineSchema.safeParse({ name: 'Échecs', category: 'jeux' }).success).toBe(
      false,
    );
  });
});
