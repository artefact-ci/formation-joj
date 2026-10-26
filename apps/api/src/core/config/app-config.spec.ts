import { describe, expect, it } from 'vitest';
import { AppConfig } from './app-config';

describe('AppConfig', () => {
  it('fonctionne sans aucune variable : PGlite sur le port 3000', () => {
    const config = AppConfig.fromEnv({});
    expect(config.get('PORT')).toBe(3000);
    expect(config.get('DATABASE_URL')).toBeUndefined();
    expect(config.get('PGLITE_DATA_DIR')).toBe('.data/pglite');
  });

  it('accepte une URL PostgreSQL', () => {
    const config = AppConfig.fromEnv({ DATABASE_URL: 'postgres://joj:joj@localhost:5432/joj' });
    expect(config.get('DATABASE_URL')).toBe('postgres://joj:joj@localhost:5432/joj');
  });

  it('refuse au démarrage une valeur invalide, en nommant la variable', () => {
    expect(() => AppConfig.fromEnv({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => AppConfig.fromEnv({ DATABASE_URL: 'mysql://localhost' })).toThrow(/DATABASE_URL/);
  });
});
