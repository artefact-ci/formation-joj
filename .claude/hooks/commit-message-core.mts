/**
 * Hook PreToolUse sur Bash : un `git commit` dont le message ne suit pas Conventional Commits est
 * refusé, avec l'explication. Logique pure ; la lecture de l'entrée est dans commit-message.mts.
 */
import type { Decision, PreToolUseInput } from './hook-io.mts';

export const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const;

const SUBJECT = new RegExp(`^(${COMMIT_TYPES.join('|')})(\\([a-z0-9._/-]+\\))?!?: \\S`);
const MAX_SUBJECT_LENGTH = 100;

export function checkCommitCommand(input: PreToolUseInput): Decision {
  const command = input.tool_input?.command;
  if (input.tool_name !== 'Bash' || !command || !isGitCommit(command)) return { allow: true };

  const message = commitMessage(command);
  // Message écrit dans l'éditeur, lu dans un fichier (-F) ou repris (--amend --no-edit) :
  // rien à vérifier ici.
  if (message === undefined) return { allow: true };

  const subject = message.split('\n', 1)[0]?.trim() ?? '';
  const problem = subjectProblem(subject);
  return problem ? { allow: false, reason: explain(subject, problem) } : { allow: true };
}

function isGitCommit(command: string): boolean {
  return /(^|[\s;&|(])git(\s+-[cC]\s+\S+)*\s+commit\b/.test(command);
}

/** Premier message passé en ligne : heredoc, -m "…", -m '…', --message=…, -m mot. */
export function commitMessage(command: string): string | undefined {
  const heredoc = /<<-?\s*(['"]?)(\w+)\1[^\n]*\n([\s\S]*?)\n\s*\2\b/.exec(command);
  if (heredoc && /(-m|--message)(\s+|=)["']?\$\(cat\s*<</.test(command)) return heredoc[3];

  const quoted = /(?:\s-m|\s--message)(?:\s+|=)(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/.exec(command);
  if (quoted) return (quoted[1] ?? quoted[2] ?? '').replace(/\\(["\\$`])/g, '$1');

  const bare = /(?:\s-m|\s--message)(?:\s+|=)([^\s"'-][^\s]*)/.exec(command);
  return bare?.[1];
}

function subjectProblem(subject: string): string | undefined {
  if (!subject) return 'le message est vide';
  if (!SUBJECT.test(subject))
    return 'la première ligne ne commence pas par « type(portée): description »';
  if (subject.length > MAX_SUBJECT_LENGTH) {
    return `la première ligne fait ${subject.length} caractères (${MAX_SUBJECT_LENGTH} au plus)`;
  }
  return undefined;
}

function explain(subject: string, problem: string): string {
  return [
    `Commit refusé : ${problem}.`,
    `Message reçu : « ${subject} »`,
    'Ce dépôt suit Conventional Commits (https://www.conventionalcommits.org/fr/) : ' +
      '`type(portée optionnelle): description`, en minuscules, une ligne de 100 caractères au plus.',
    `Types acceptés : ${COMMIT_TYPES.join(', ')}.`,
    'Exemples : `feat(api): add disciplines endpoint`, `fix(web): show conflict error`, `test: cover AS4`.',
    'Réécris le message et relance la commande.',
  ].join('\n');
}
