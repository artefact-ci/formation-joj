import { describe, expect, it } from 'vitest';
import { checkSecretWrite, findSecret } from './secret-guard-core.mts';
import { decisionOf, runHook } from './run-hook.mts';

// Les faux secrets sont assemblés à l'exécution : écrits en clair, ce fichier serait lui-même
// refusé par le hook qu'il teste.
const FAKE = {
  aws: `AKIA${'Q'.repeat(16)}`,
  anthropic: `sk-ant-${'a1b2'.repeat(10)}`,
  github: `ghp_${'A1b2'.repeat(10)}`,
  privateKey: `-----BEGIN RSA ${'PRIVATE'} KEY-----\nMIIE...`,
  password: `S3cr${'et!xyz42'}`,
};

const write = (content: string, file_path = 'apps/api/src/x.ts') => ({
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path, content },
});

const edit = (new_string: string) => ({
  tool_name: 'Edit',
  tool_input: { file_path: 'apps/api/.env.example', old_string: 'x', new_string },
});

describe('hook secret-guard (PreToolUse sur Edit|Write)', () => {
  it.each([
    ['clé AWS', `const key = '${FAKE.aws}';`],
    ['clé d’API Anthropic', `ANTHROPIC_KEY=${FAKE.anthropic}`],
    ['token GitHub', `token: ${FAKE.github}`],
    ['clé privée', FAKE.privateKey],
    ['secret en clair', `const config = { password: '${FAKE.password}' };`],
    ['secret en clair', `API_TOKEN=${FAKE.password}`],
    ['mot de passe dans une URL', `DATABASE_URL=postgres://admin:${FAKE.password}@db:5432/app`],
  ])('refuse un(e) %s', (label, content) => {
    expect(findSecret(content)).toMatchObject({ label });
  });

  it.each([
    "const password = process.env['DB_PASSWORD'];",
    'token: string;',
    "password: 'changeme'",
    'API_KEY=<ta-clé>',
    'DATABASE_URL=postgres://joj:joj@localhost:5432/joj',
    'const tokenizer = createTokenizer();',
    "secret: '${SECRET}'",
  ])('laisse passer du code ou une valeur factice : %s', (content) => {
    expect(findSecret(content)).toBeUndefined();
  });

  it('donne la ligne, sans recopier le secret', () => {
    const decision = checkSecretWrite(write(`// config\nconst key = '${FAKE.aws}';`));
    expect(decision.allow).toBe(false);
    if (decision.allow) return;
    expect(decision.reason).toMatch(/clé AWS probable, ligne 2 .*apps\/api\/src\/x\.ts/);
    expect(decision.reason).not.toContain(FAKE.aws);
    expect(decision.reason).toMatch(/apps\/api\/\.env/);
  });

  it('vérifie aussi le nouveau texte d’un Edit', () => {
    expect(checkSecretWrite(edit(`SECRET_KEY=${FAKE.password}`)).allow).toBe(false);
    expect(checkSecretWrite(edit('SECRET_KEY=changeme')).allow).toBe(true);
  });

  it('script : refuse l’écriture à partir du JSON reçu de Claude Code', () => {
    const { status, stdout } = runHook('secret-guard.mts', write(`const k = '${FAKE.aws}';`));
    expect(status).toBe(0);
    expect(decisionOf(stdout)).toMatchObject({ permissionDecision: 'deny' });
  });

  it('script : ne dit rien pour un fichier sans secret', () => {
    const { stdout } = runHook('secret-guard.mts', write('export const PORT = 3000;'));
    expect(decisionOf(stdout)).toBeUndefined();
  });
});
