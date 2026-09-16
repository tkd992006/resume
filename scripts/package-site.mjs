import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, ACTIVE_PROFILES, build, verifyFrozen } from './build.mjs';
import { STANDARD_PROFILES, buildStandard } from './build-standard.mjs';
import { ORIGINAL_PROFILES, buildOriginal } from './build-original.mjs';

const destination = path.join(ROOT, '.pages-dist');
const pages = ['toss', ...ACTIVE_PROFILES, ...STANDARD_PROFILES, ...ORIGINAL_PROFILES];
const pageFiles = ['index.html', 'styles.css', 'script.js'];
const stat = filename => fs.lstatSync(filename, { throwIfNoEntry: false });
function inspect(directory) {
  const result = [];
  const visit = (filename, relative = '') => {
    const entry = stat(filename);
    if (!entry) return;
    if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw Error(`Unsafe package input: ${filename}`);
    if (relative) result.push({ relative, directory: entry.isDirectory() });
    if (entry.isDirectory()) for (const name of fs.readdirSync(filename).sort()) visit(path.join(filename, name), relative ? `${relative}/${name}` : name);
    else if (!relative) throw Error(`Expected directory: ${filename}`);
  };
  visit(directory);
  return result;
}
function requireFile(filename) {
  const entry = stat(filename);
  if (!entry?.isFile() || entry.isSymbolicLink()) throw Error(`Expected regular file: ${filename}`);
}

export function packageSite() {
  // Reject links before build() can write through an existing output directory.
  inspect(path.join(ROOT, 'src/assets'));
  for (const page of pages) inspect(path.join(ROOT, page));
  build();
  buildStandard();
  buildOriginal();
  const frozenCount = verifyFrozen();
  const allowed = new Set(['index.html', '.nojekyll']);
  for (const page of pages) {
    for (const name of pageFiles) allowed.add(`${page}/${name}`);
    for (const entry of inspect(path.join(ROOT, page))) {
      const asset = entry.relative === 'assets' || entry.relative.startsWith('assets/');
      if ((!asset && (entry.directory || !pageFiles.includes(entry.relative))) || /\.json$/i.test(entry.relative)) {
        throw Error(`Unexpected page content: ${page}/${entry.relative}`);
      }
      if (!entry.directory) allowed.add(`${page}/${entry.relative}`);
    }
  }
  const files = [...allowed].sort();
  for (const filename of files) requireFile(path.join(ROOT, filename));
  const directories = new Set(files.flatMap(filename => {
    const parts = filename.split('/');
    return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
  }));
  for (const entry of inspect(destination)) {
    if (!(entry.directory ? directories : allowed).has(entry.relative)) throw Error(`Refusing to remove unknown package content: ${entry.relative}`);
  }
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination);
  for (const filename of files) {
    const output = path.join(destination, filename);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(ROOT, filename), output);
  }
  const packaged = inspect(destination).filter(entry => !entry.directory).map(entry => entry.relative).sort();
  if (JSON.stringify(packaged) !== JSON.stringify(files)) throw Error('Packaged file set does not match source allowlist');
  for (const filename of files) {
    if (!fs.readFileSync(path.join(ROOT, filename)).equals(fs.readFileSync(path.join(destination, filename)))) throw Error(`Packaged bytes differ: ${filename}`);
  }
  verifyFrozen();
  return { directory: destination, files: files.length, pages, frozenCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) throw Error('Usage: node scripts/package-site.mjs');
  console.log(JSON.stringify(packageSite(), null, 2));
}
