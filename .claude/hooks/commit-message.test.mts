import { describe, expect, it } from 'vitest';
import { checkCommitCommand, commitMessage } from './commit-message-core.mts';
import { decisionOf, runHook } from './run-hook.mts';

const bash = (command: string) => ({
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command, description: 'Commit' },
});

describe('hook commit-message (PreToolUse sur Bash)', () => {
  it('laisse passer un message Conventional Commits', () => {
    expect(checkCommitCommand(bash('git commit -m "feat(api): add disciplines"'))).toEqual({
      allow: true,
    });
    expect(checkCommitCommand(bash("git add -A && git commit -m 'fix!: drop old route'"))).toEqual({
      allow: true,
    });
  });

  it('refuse un message libre, en expliquant le format attendu', () => {
    const decision = checkCommitCommand(bash('git commit -m "ajout des disciplines"'));
    expect(decision.allow).toBe(false);
    expect(!decision.allow && decision.reason).toMatch(/Conventional Commits/);
    expect(!decision.allow && decision.reason).toMatch(/feat\(api\): add disciplines endpoint/);
  });

  it('refuse un type inconnu ou une description manquante', () => {
    expect(checkCommitCommand(bash('git commit -m "feature: x"')).allow).toBe(false);
    expect(checkCommitCommand(bash('git commit -m "feat:"')).allow).toBe(false);
    expect(checkCommitCommand(bash(`git commit -m "feat: ${'x'.repeat(100)}"`)).allow).toBe(false);
  });

  it('lit la première ligne d’un message en heredoc, comme les écrit Claude Code', () => {
    const command = `git commit -m "$(cat <<'EOF'\nfeat(web): add form\n\nCorps du message.\nEOF\n)"`;
    expect(commitMessage(command)).toBe('feat(web): add form\n\nCorps du message.');
    expect(checkCommitCommand(bash(command))).toEqual({ allow: true });
    expect(checkCommitCommand(bash(command.replace('feat(web): add form', 'WIP'))).allow).toBe(
      false,
    );
  });

  it('ignore les autres commandes, et les commits sans message en ligne', () => {
    expect(checkCommitCommand(bash('git status'))).toEqual({ allow: true });
    expect(checkCommitCommand(bash('git commit'))).toEqual({ allow: true });
    expect(checkCommitCommand(bash('git commit --amend --no-edit'))).toEqual({ allow: true });
    expect(checkCommitCommand({ tool_name: 'Write', tool_input: {} })).toEqual({ allow: true });
  });

  it('script : refuse un commit mal nommé à partir du JSON reçu de Claude Code', () => {
    const { status, stdout } = runHook('commit-message.mts', bash('git commit -m "wip"'));
    expect(status).toBe(0);
    expect(decisionOf(stdout)).toMatchObject({ permissionDecision: 'deny' });
  });

  it('script : ne dit rien pour un commit correct', () => {
    const { status, stdout } = runHook(
      'commit-message.mts',
      bash('git commit -m "test: cover AS4"'),
    );
    expect(status).toBe(0);
    expect(decisionOf(stdout)).toBeUndefined();
  });
});
