import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const frozen = 'b8d686cd8d25cbbaaf48f84d16ed4248e1ac57bf';
const git = spawnSync('git', ['diff', '--exit-code', frozen, '--', 'toss', 'index.html'], { cwd: root, encoding: 'utf8' });
assert.equal(git.status, 0, 'The frozen Toss snapshot or blank root changed.');
assert.match(read('index.html'), /<body>\s*<\/body>/, 'Root must remain blank.');
const baseline = read('toss/index.html');
const tags = html => [...html.matchAll(/<([a-z][a-z0-9-]*)\b([^<>]*)>/gi)].map(m => {
  const attrs = Object.fromEntries([...m[2].matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(a => [a[1], a[3]]));
  return { tag: m[1], attrs };
});
const dialogs = html => new Map([...html.matchAll(/<dialog\b[\s\S]*?<\/dialog>/g)].filter(m => /class="case-modal\b/.test(m[0])).map(m => [m[0].match(/\bid="([^"]+)"/)[1], m[0]]));
const baselineCases = dialogs(baseline);
assert.equal(baselineCases.size, 6, 'Expected all six existing case studies.');
const withoutCaseNumber = html => html.replace(/(<p class="case-modal-kicker">[^<]*Solved issue )\d+(<\/p>)/, '$1[display-order]$2');
const tree = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? tree(resolve(dir, entry.name)) : [resolve(dir, entry.name)]);
const result = [];
for (const slug of ['modoodoc', 'daangn']) {
  const html = read(`${slug}/index.html`);
  const nodes = tags(html);
  const ids = nodes.flatMap(n => n.attrs.id ? [n.attrs.id] : []);
  assert.equal(new Set(ids).size, ids.length, `${slug}: duplicate element IDs`);
  const idSet = new Set(ids);
  let dependencies = 0;
  for (const { attrs } of nodes) {
    for (const name of ['src', 'href', 'data-lightbox']) {
      const value = attrs[name];
      if (!value || /^(?:[a-z]+:|\/\/)/i.test(value)) continue;
      if (value.startsWith('#')) {
        assert(idSet.has(value.slice(1)), `${slug}: broken fragment ${value}`);
      } else {
        const path = value.split(/[?#]/)[0];
        assert(existsSync(resolve(root, slug, path)), `${slug}: missing ${path}`);
        dependencies++;
      }
    }
    for (const name of ['data-sheet-open', 'data-case-open', 'data-ama-target', 'aria-controls', 'aria-labelledby', 'aria-describedby']) {
      for (const id of (attrs[name] ?? '').split(/\s+/).filter(Boolean)) assert(idSet.has(id), `${slug}: missing target ${name}=${id}`);
    }
  }
  assert(!html.includes('{{'), `${slug}: unresolved template placeholder`);
  assert(html.includes(`https://tkd992006.github.io/resume/${slug}/`), `${slug}: missing destination metadata`);
  assert.equal(read(`${slug}/styles.css`), read('toss/styles.css'), `${slug}: design CSS changed`);
  for (const file of tree(resolve(root, 'toss/assets'))) {
    const suffix = relative(resolve(root, 'toss'), file);
    assert(readFileSync(file).equals(readFileSync(resolve(root, slug, suffix))), `${slug}: changed image ${suffix}`);
  }
  const cases = dialogs(html);
  for (const [id, content] of baselineCases) assert.equal(withoutCaseNumber(cases.get(id)), withoutCaseNumber(content), `${slug}: case study body ${id} changed beyond its displayed order number`);
  const check = spawnSync(process.execPath, ['--check', resolve(root, slug, 'script.js')], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr);
  result.push({ slug, ids: ids.length, localDependencies: dependencies, unchangedCaseStudies: cases.size, identicalStylesAndAssets: true });
}
console.log(JSON.stringify({ frozenTossAndRoot: true, pages: result }, null, 2));
