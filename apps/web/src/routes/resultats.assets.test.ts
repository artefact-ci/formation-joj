import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** Un chemin relatif à ce fichier, indépendant du dossier d'où les tests sont lancés. */
const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url));

describe('design assets of the results page', () => {
  it('001-AS1: the design mock-up is not served with the site', () => {
    expect(existsSync(fromHere('../../public/favicon.svg'))).toBe(true);
    expect(existsSync(fromHere('../../public/design.png'))).toBe(false);
  });
});
