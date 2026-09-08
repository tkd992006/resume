import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = 'b8d686cd8d25cbbaaf48f84d16ed4248e1ac57bf';
const run = (command, args, allowed = [0]) => {
  const result = spawnSync(command, args, { cwd: root, maxBuffer: 50 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (!allowed.includes(result.status)) throw Error(`${command}: ${result.stderr.toString()}`);
  return result.stdout;
};
const selected = path => path.startsWith('src/') || path.startsWith('scripts/') ||
  ['package.json', 'README.md', '.gitignore'].includes(path);
const walk = path => !existsSync(resolve(root, path)) ? [] :
  readdirSync(resolve(root, path), { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(`${path}/${entry.name}`) : entry.isFile() ? [`${path}/${entry.name}`] : []);
const tracked = new Set(run('git', ['ls-tree', '-r', '--name-only', '-z', baseline]).toString().split('\0').filter(Boolean));
const files = [...new Set([...tracked].filter(selected).concat(
  walk('src'), walk('scripts'), ['package.json', 'README.md', '.gitignore'].filter(path => existsSync(resolve(root, path)))
))].sort();
const temporary = mkdtempSync(resolve(tmpdir(), 'resume-implementation-diff-'));
const totals = { compared: 0, added: 0, modified: 0, deleted: 0, binaryAssetsExcluded: 0 };
const patches = [];
try {
  for (const path of files) {
    const before = tracked.has(path) ? run('git', ['show', `${baseline}:${path}`]) : null;
    const after = existsSync(resolve(root, path)) ? readFileSync(resolve(root, path)) : null;
    if (before?.includes(0) || after?.includes(0)) {
      if (!path.startsWith('src/assets/')) throw Error(`Unexpected binary source: ${path}`);
      totals.binaryAssetsExcluded++;
      continue;
    }
    totals.compared++;
    if (before && after && before.equals(after)) continue;
    const previous = before === null ? '/dev/null' : resolve(temporary, 'before');
    if (before !== null) writeFileSync(previous, before);
    const current = after === null ? '/dev/null' : resolve(root, path);
    patches.push(run('diff', ['-u', '--label', before === null ? '/dev/null' : `a/${path}`,
      '--label', after === null ? '/dev/null' : `b/${path}`, previous, current], [0, 1]));
    totals[before === null ? 'added' : after === null ? 'deleted' : 'modified']++;
  }
  mkdirSync(resolve(root, 'reports'), { recursive: true });
  writeFileSync(resolve(root, 'reports/implementation.patch'), Buffer.concat(patches));
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
console.log(JSON.stringify({ report: 'reports/implementation.patch', baseline,
  changed: totals.added + totals.modified + totals.deleted, ...totals }, null, 2));
