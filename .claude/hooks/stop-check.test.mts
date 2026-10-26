import { describe, expect, it } from 'vitest';
import { runHook } from './run-hook.mts';
import { checkCommands, failureReport, planStopCheck } from './stop-check-core.mts';

const PACKAGES = [
  { dir: 'apps/api', name: '@joj/api' },
  { dir: 'apps/web', name: '@joj/web' },
  { dir: 'packages/shared', name: '@joj/shared' },
];

describe('hook stop-check (Stop)', () => {
  it('ne fait rien si STOP_CHECK=off ou si rien n’a changé', () => {
    expect(
      planStopCheck({ stopHookActive: false, disabled: true, changedFiles: ['a.ts'] }),
    ).toEqual({ run: false, reason: 'STOP_CHECK=off' });
    expect(
      planStopCheck({ stopHookActive: false, disabled: false, changedFiles: [] }),
    ).toMatchObject({ run: false });
  });

  it('bloque au premier échec, seulement averti si l’agent continue déjà à cause du hook', () => {
    const input = { disabled: false, changedFiles: ['b.ts', 'a.ts', 'a.ts'] };
    expect(planStopCheck({ ...input, stopHookActive: false })).toEqual({
      run: true,
      files: ['a.ts', 'b.ts'],
      block: true,
    });
    expect(planStopCheck({ ...input, stopHookActive: true })).toMatchObject({ block: false });
  });

  it('vérifie format, lint et types des seuls fichiers et packages touchés', () => {
    const files = ['apps/api/src/a.ts', 'README.md', 'packages/shared/src/gone.ts'];
    const existing = ['apps/api/src/a.ts', 'README.md'];
    expect(checkCommands(files, existing, PACKAGES)).toEqual([
      {
        label: 'format',
        command: 'pnpm',
        args: ['exec', 'oxfmt', '--check', '--no-error-on-unmatched-pattern', ...existing],
      },
      { label: 'lint', command: 'pnpm', args: ['exec', 'oxlint', 'apps/api/src/a.ts'] },
      {
        label: 'typecheck',
        command: 'pnpm',
        // Le fichier supprimé de shared compte : il peut casser les packages qui l'importent.
        args: ['--filter', '...@joj/api', '--filter', '...@joj/shared', 'run', 'typecheck'],
      },
    ]);
  });

  it('vérifie les types des hooks quand ils changent', () => {
    expect(
      checkCommands(['.claude/hooks/x.mts'], ['.claude/hooks/x.mts'], PACKAGES),
    ).toContainEqual({
      label: 'typecheck (hooks)',
      command: 'pnpm',
      args: ['exec', 'tsc', '-p', '.claude/hooks/'],
    });
  });

  it('résume chaque échec par la fin de sa sortie', () => {
    const output = Array.from({ length: 60 }, (_, i) => `ligne ${i}`).join('\n');
    const report = failureReport([{ label: 'lint', output }]);
    expect(report).toMatch(/en échec \(lint\)/);
    expect(report).toContain('ligne 59');
    expect(report).not.toContain('ligne 10\n');
  });

  it('script : STOP_CHECK=off coupe le hook, quelle que soit l’entrée', () => {
    const { status, stdout, stderr } = runHook(
      'stop-check.mts',
      { hook_event_name: 'Stop', stop_hook_active: false },
      { STOP_CHECK: 'off' },
    );
    expect({ status, stdout, stderr }).toEqual({ status: 0, stdout: '', stderr: '' });
  });
});
