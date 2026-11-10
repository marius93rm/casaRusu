import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const supportedExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
]);

function runGit(args) {
  const result = spawnSync('git', args, { cwd: projectRoot, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

function changedFiles() {
  const head = process.env.FORMAT_HEAD_SHA;

  if (head) {
    const base = process.env.FORMAT_BASE_SHA || runGit(['rev-parse', `${head}^`]);
    if (/^0+$/.test(base)) {
      return runGit(['diff-tree', '--root', '--no-commit-id', '--name-only', '--diff-filter=ACMR', '-r', head])
        .split('\n')
        .filter(Boolean);
    }
    return runGit(['diff', '--name-only', '--diff-filter=ACMR', base, head, '--']).split('\n').filter(Boolean);
  }

  const tracked = runGit(['diff', '--name-only', '--diff-filter=ACMR', 'HEAD', '--']);
  const staged = runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--']);
  const untracked = runGit(['ls-files', '--others', '--exclude-standard']);
  return [...new Set(`${tracked}\n${staged}\n${untracked}`.split('\n').filter(Boolean))];
}

const files = changedFiles().filter((file) => supportedExtensions.has(path.extname(file).toLowerCase()));

if (files.length === 0) {
  console.log('Controllo Prettier superato: nessun file testuale modificato da controllare.');
} else {
  const result = spawnSync('prettier', ['--check', ...files], { cwd: projectRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}
