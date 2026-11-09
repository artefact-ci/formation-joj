/**
 * Vérification de fin de tour de Claude Code (hook `Stop`) : format, lint et types des seuls
 * fichiers changés. Logique pure ; git et pnpm sont dans stop-check.mts.
 */

export interface StopCheckInput {
  /** L'agent continue déjà à cause de ce hook (`stop_hook_active`). */
  stopHookActive: boolean;
  /** `STOP_CHECK=off`. */
  disabled: boolean;
  /** Fichiers modifiés, supprimés ou nouveaux depuis la base (commits, index, arbre). */
  changedFiles: string[];
}

export type StopCheckPlan =
  | { run: false; reason: string }
  | { run: true; files: string[]; block: boolean };

export interface CheckCommand {
  label: string;
  command: string;
  args: string[];
}

export interface CheckFailure {
  label: string;
  output: string;
}

/** Un package du workspace : son dossier (`apps/api`) et son nom (`@joj/api`). */
export interface WorkspacePackage {
  dir: string;
  name: string;
}

const OUTPUT_TAIL_LINES = 40;
const LINTABLE = /\.(?:[cm]?[jt]sx?)$/;
const HOOKS_DIR = '.claude/hooks/';
/**
 * cmd.exe refuse une commande de plus de 8 191 caractères, et les scripts de pnpm et d'oxfmt la
 * rallongent : 7 000 caractères de chemins échouent encore sous Windows, d'où cette marge.
 */
const MAX_PATHS_LENGTH = 4000;

export function planStopCheck(input: StopCheckInput): StopCheckPlan {
  if (input.disabled) return { run: false, reason: 'STOP_CHECK=off' };
  const files = [...new Set(input.changedFiles)].sort();
  if (files.length === 0) return { run: false, reason: 'aucun fichier changé' };
  // Une seconde fin de tour après un blocage n'est qu'avertie : sinon un échec que l'agent ne
  // sait pas corriger le ferait tourner en boucle.
  return { run: true, files, block: !input.stopHookActive };
}

/**
 * `existing` : les fichiers de `files` encore présents. Une suppression ne se formate ni ne se
 * lint, mais elle peut casser les types de son package (un import vers un fichier supprimé).
 */
export function checkCommands(
  files: string[],
  existing: string[],
  packages: WorkspacePackage[],
): CheckCommand[] {
  const commands: CheckCommand[] = [];
  // Sans chemin, oxfmt et oxlint vérifieraient tout le dépôt.
  for (const batch of inBatches(existing)) {
    commands.push({
      label: 'format',
      command: 'pnpm',
      args: ['exec', 'oxfmt', '--check', '--no-error-on-unmatched-pattern', ...batch],
    });
  }
  const lintable = existing.filter((file) => LINTABLE.test(file));
  for (const batch of inBatches(lintable)) {
    commands.push({ label: 'lint', command: 'pnpm', args: ['exec', 'oxlint', ...batch] });
  }

  // `...@joj/shared` : le package et ceux qui en dépendent (un changement de shared peut casser
  // les types de l'API et du front).
  const touched = packages.filter(({ dir }) => files.some((file) => file.startsWith(`${dir}/`)));
  if (touched.length > 0) {
    commands.push({
      label: 'typecheck',
      command: 'pnpm',
      args: [...touched.flatMap(({ name }) => ['--filter', `...${name}`]), 'run', 'typecheck'],
    });
  }
  if (files.some((file) => file.startsWith(HOOKS_DIR))) {
    commands.push({
      label: 'typecheck (hooks)',
      command: 'pnpm',
      args: ['exec', 'tsc', '-p', HOOKS_DIR],
    });
  }
  return commands;
}

/** Découpe les chemins pour que chaque commande tienne dans la limite de Windows. */
function inBatches(files: string[]): string[][] {
  const batches: string[][] = [];
  let length = 0;
  for (const file of files) {
    const current = batches.at(-1);
    if (current === undefined || length + file.length + 1 > MAX_PATHS_LENGTH) {
      batches.push([file]);
      length = file.length + 1;
    } else {
      current.push(file);
      length += file.length + 1;
    }
  }
  return batches;
}

export function failureReport(failures: CheckFailure[]): string {
  const sections = failures.map(({ label, output }) => {
    const tail = output.trimEnd().split('\n').slice(-OUTPUT_TAIL_LINES).join('\n');
    return `### ${label}\n\n${tail}`;
  });
  return [
    `Vérification de fin de tour en échec (${failures.map((f) => f.label).join(' ; ')}).`,
    "Corrige avant de rendre la main : `pnpm format` règle le format ; pour le lint et les types, lis l'erreur ci-dessous.",
    "Si l'échec vient de fichiers qui ne sont pas les tiens, dis-le à l'utilisateur au lieu de les modifier.",
    ...sections,
  ].join('\n\n');
}
