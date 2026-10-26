import { describe, expect, it } from 'vitest';
import { seedStatements, tableNameFromFile } from './db-core.mts';

describe('tableNameFromFile', () => {
  it('prend le nom du fichier, sans préfixe d’ordre', () => {
    expect(tableNameFromFile('disciplines.json')).toBe('disciplines');
    expect(tableNameFromFile('02-athletes.json')).toBe('athletes');
  });
});

describe('seedStatements', () => {
  it('produit un INSERT paramétré, idempotent, par ligne', () => {
    expect(
      seedStatements('disciplines', [{ name: 'Lutte', category: 'sports-de-combat' }]),
    ).toEqual([
      {
        table: 'disciplines',
        sql: 'INSERT INTO "disciplines" ("name", "category") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        params: ['Lutte', 'sports-de-combat'],
      },
    ]);
  });

  it('refuse un fichier qui n’est pas un tableau d’objets', () => {
    expect(() => seedStatements('t', { name: 'x' })).toThrow(/tableau/);
    expect(() => seedStatements('t', ['x'])).toThrow(/ligne 0/);
  });
});
