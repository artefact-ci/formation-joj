import { describe, expect, it } from 'vitest';
import { Discipline } from './discipline';
import { DisciplineError } from './disciplines.errors';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000001';

describe('Discipline', () => {
  it('AS1: crée une discipline avec un nom nettoyé et une catégorie de la liste', () => {
    const discipline = Discipline.create({
      id: ID,
      name: '  Lutte  ',
      category: 'sports-de-combat',
      now: NOW,
    });
    expect(discipline).toMatchObject({
      id: ID,
      name: 'Lutte',
      category: 'sports-de-combat',
      createdAt: NOW,
    });
  });

  it.each(['', '   '])('AS2: refuse une discipline sans nom (%j)', (name) => {
    expect(() => Discipline.create({ id: ID, name, category: 'athletisme', now: NOW })).toThrow(
      expect.objectContaining({ code: 'DISCIPLINE_NAME_REQUIRED', kind: 'VALIDATION' }),
    );
  });

  it('AS2: refuse un nom trop long', () => {
    expect(() =>
      Discipline.create({ id: ID, name: 'x'.repeat(101), category: 'athletisme', now: NOW }),
    ).toThrow(expect.objectContaining({ code: 'DISCIPLINE_NAME_TOO_LONG' }));
  });

  it('AS3: refuse une catégorie hors liste', () => {
    expect(() => Discipline.create({ id: ID, name: 'Échecs', category: 'jeux', now: NOW })).toThrow(
      DisciplineError,
    );
    expect(() => Discipline.create({ id: ID, name: 'Échecs', category: 'jeux', now: NOW })).toThrow(
      expect.objectContaining({ code: 'DISCIPLINE_CATEGORY_UNKNOWN', kind: 'VALIDATION' }),
    );
  });
});
