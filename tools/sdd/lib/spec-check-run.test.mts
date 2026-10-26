import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { PLAN, SPEC } from './fixtures.mts';
import { runSpecCheck } from './spec-check-run.mts';

/** Un dépôt factice : chemin relatif → contenu. */
function repo(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'sdd-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const CONSTITUTION = { 'specs/constitution.md': '# Constitution\n' };
const TESTS = [
  "it('001-AS1: registers a volunteer', () => {});",
  "it('001-AS2: rejects a full slot', () => {});",
].join('\n');

describe('runSpecCheck', () => {
  it('passes on a repository without any spec', () => {
    const result = runSpecCheck(repo(CONSTITUTION), []);
    assert.equal(result.ok, true);
    assert.match(result.output, /aucune spec/);
  });

  it('requires the constitution', () => {
    const result = runSpecCheck(repo({ 'README.md': '' }), []);
    assert.equal(result.ok, false);
    assert.match(result.output, /specs\/constitution\.md absent/);
  });

  it('checks the spec and the plan of every folder', () => {
    const root = repo({
      ...CONSTITUTION,
      'specs/001-benevoles/spec.md': SPEC,
      'specs/001-benevoles/plan.md': PLAN,
    });
    const result = runSpecCheck(root, []);
    assert.equal(result.ok, true, result.output);
    assert.match(result.output, /specs\/001-benevoles : spec et plan conformes/);
  });

  it('lists each problem with its file and line', () => {
    const root = repo({
      ...CONSTITUTION,
      'specs/001-benevoles/spec.md': SPEC.replace('### AS2 —', '### AS 2 —'),
      'specs/002-medailles/notes.md': '',
    });
    const result = runSpecCheck(root, []);
    assert.equal(result.ok, false);
    assert.match(result.output, /specs\/001-benevoles\/spec\.md:21 scénario mal formé/);
    assert.match(result.output, /specs\/002-medailles\/spec\.md:1 fichier absent/);
  });

  it('checks only the spec given by its folder or its number', () => {
    const root = repo({
      ...CONSTITUTION,
      'specs/001-benevoles/spec.md': SPEC,
      'specs/002-medailles/spec.md': 'cassée',
    });
    assert.equal(runSpecCheck(root, ['specs/001-benevoles']).ok, true);
    assert.equal(runSpecCheck(root, ['001']).ok, true);
    assert.equal(runSpecCheck(root, ['002']).ok, false);
    const unknown = runSpecCheck(root, ['specs/009']);
    assert.equal(unknown.ok, false);
    assert.match(unknown.output, /aucune spec ne correspond à « specs\/009 »/);
  });

  it('--trace prints the scenario → test matrix, outside node_modules', () => {
    const root = repo({
      ...CONSTITUTION,
      'specs/001-benevoles/spec.md': SPEC,
      'apps/api/src/benevoles/domain/inscription.spec.ts': TESTS,
      'apps/api/node_modules/x/y.spec.ts': "it('001-AS9: not ours', () => {});",
    });
    const result = runSpecCheck(root, ['001', '--trace']);
    assert.equal(result.ok, true, result.output);
    assert.match(
      result.output,
      /001-AS1 → apps\/api\/src\/benevoles\/domain\/inscription\.spec\.ts/,
    );
  });

  it('--trace fails on a scenario without a test', () => {
    const root = repo({
      ...CONSTITUTION,
      'specs/001-benevoles/spec.md': SPEC,
      'apps/web/src/x.test.tsx': "it('001-AS1: shows the volunteer', () => {});",
    });
    const result = runSpecCheck(root, ['--trace']);
    assert.equal(result.ok, false);
    assert.match(result.output, /001-AS2 → \(aucun test\)/);
    assert.match(result.output, /001-AS2 n'a aucun test/);
  });
});
