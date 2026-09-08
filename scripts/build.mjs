import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHtml, queryAll, queryOne, innerHtml, outerHtml, textContent, applyRanges } from './html.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ACTIVE_PROFILES = Object.freeze(['modoodoc', 'daangn']);
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');

export function loadSources() {
  const common = json('src/content/common.json');
  const locators = json('src/content/locators.json');
  if (common.schemaVersion !== 1 || locators.schemaVersion !== 1) throw new Error('Unsupported content schema');
  return { common, locators, template: read('src/template.html'), scriptTemplate: read('src/script.js'), runtimeFormat: json('src/content/runtime-format.json') };
}

function fillHtml(sources, fields) {
  const used = new Set();
  const html = sources.template.replace(/\{\{(field|case):([\w.-]+)\}\}/g, (_, kind, key) => {
    if (kind === 'case') {
      if (!sources.locators.cases.some(entry => entry.id === key)) throw new Error(`Unknown case: ${key}`);
      return read(`src/cases/${key}.html`);
    }
    if (!(key in fields)) throw new Error(`Missing common field: ${key}`);
    if (used.has(key)) throw new Error(`Duplicate field token: ${key}`);
    used.add(key);
    return fields[key];
  });
  for (const key of Object.keys(fields)) if (!used.has(key)) throw new Error(`Unused or unknown common field: ${key}`);
  if (/\{\{(?:field|case):/.test(html)) throw new Error('Unresolved template token');
  return html;
}

function fillScript(sources, runtime) {
  const used = new Set();
  const script = sources.scriptTemplate.replace(/\{\{runtime:(\w+)\}\}/g, (_, key) => {
    if (!(key in runtime) || !(key in sources.runtimeFormat)) throw new Error(`Missing runtime value: ${key}`);
    used.add(key);
    const format = sources.runtimeFormat[key];
    return equal(runtime[key], format.value) ? format.source : JSON.stringify(runtime[key], null, 2);
  });
  for (const key of Object.keys(runtime)) if (!used.has(key)) throw new Error(`Unknown runtime value: ${key}`);
  return script;
}

export function renderBaseline() {
  const sources = loadSources();
  return { html: fillHtml(sources, sources.common.fields), script: fillScript(sources, sources.common.runtime) };
}

function rangeFor(node, attribute) {
  if (!attribute) return { start: node.openEnd, end: node.closeStart };
  if (!node.attrRanges[attribute]) throw new Error(`Missing quoted attribute: ${attribute}`);
  return node.attrRanges[attribute];
}

function requirePermutation(after, before, label) {
  if (!Array.isArray(after) || after.length !== before.length || new Set(after).size !== before.length || after.some(id => !before.includes(id))) {
    throw new Error(`${label} must contain every known item exactly once: ${before.join(', ')}`);
  }
}

function orderSections(initialHtml, profile) {
  let html = initialHtml;
  const orderChanges = [];
  const derivedChanges = [];
  function reorder({ kind, container, selector, requested, keyOf, positionalClasses = false, caseLabels = false }) {
    if (requested === undefined) return;
    const doc = parseHtml(html);
    const parent = queryOne(doc, container);
    const nodes = queryAll(doc, selector);
    if (nodes.some(node => node.parent !== parent)) throw new Error(`Order items must be direct children of ${container}`);
    const before = nodes.map(node => keyOf(doc, node));
    requirePermutation(requested, before, kind);
    if (equal(requested, before)) return;
    orderChanges.push({ kind, container, before, after: [...requested] });
    const changes = [];
    requested.forEach((id, index) => {
      const node = nodes[before.indexOf(id)];
      let fragment = outerHtml(doc, node);
      const fragmentDoc = parseHtml(fragment);
      const moved = fragmentDoc.nodes[0];
      const localChanges = [];
      const stableSelector = node.attrs['data-case-open'] ? `[data-case-open="${id}"]` : `[data-sheet-open="${id}"]`;
      if (positionalClasses && moved.attrs.class !== nodes[index].attrs.class) {
        localChanges.push({ ...rangeFor(moved, 'class'), value: nodes[index].attrs.class });
        derivedChanges.push({ key: `order.${kind}.${id}.class`, fieldKey: null, selector: stableSelector, attribute: 'class', before: moved.attrs.class, after: nodes[index].attrs.class, reason: '순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.', derived: true });
      }
      if (caseLabels) {
        const label = queryOne(fragmentDoc, '.case-study-trigger-index');
        const beforeLabel = innerHtml(fragmentDoc, label);
        const afterLabel = `Solved issue ${String(index + 1).padStart(2, '0')}`;
        if (beforeLabel !== afterLabel) {
          localChanges.push({ ...rangeFor(label), value: afterLabel });
          derivedChanges.push({ key: `order.case.${id}.label`, fieldKey: null, selector: `${stableSelector} .case-study-trigger-index`, before: beforeLabel, after: afterLabel, reason: '변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.', derived: true });
        }
      }
      fragment = applyRanges(fragment, localChanges);
      changes.push({ start: nodes[index].start, end: nodes[index].end, value: fragment });
    });
    html = applyRanges(html, changes);
    if (caseLabels) {
      const orderedDoc = parseHtml(html);
      const modalChanges = [];
      requested.forEach((id, index) => {
        const label = queryOne(orderedDoc, `#${id} .case-modal-kicker`);
        const beforeLabel = innerHtml(orderedDoc, label);
        const afterLabel = beforeLabel.replace(/Solved issue \d+/, `Solved issue ${String(index + 1).padStart(2, '0')}`);
        if (beforeLabel !== afterLabel) {
          modalChanges.push({ ...rangeFor(label), value: afterLabel });
          derivedChanges.push({ key: `order.case.${id}.modalLabel`, fieldKey: null, selector: `#${id} .case-modal-kicker`, before: beforeLabel, after: afterLabel, reason: '사례 본문 번호를 카드 번호와 맞춥니다.', derived: true });
        }
      });
      html = applyRanges(html, modalChanges);
    }
  }
  reorder({ kind: 'projectOrder', container: '#selected-work .work-list', selector: '#selected-work .work-list > .work-item', requested: profile.projectOrder, keyOf: (_, node) => node.attrs['data-sheet-open'], positionalClasses: true });
  reorder({ kind: 'portfolioOrder', container: '#portfolio .folio-grid', selector: '#portfolio .folio-grid > .folio-card', requested: profile.portfolioOrder, keyOf: (_, node) => node.attrs['data-sheet-open'] });
  const projectIds = queryAll(parseHtml(html), '#selected-work .work-list > .work-item').map(node => node.attrs['data-sheet-open']);
  for (const [projectId, requested] of Object.entries(profile.caseOrder ?? {})) {
    if (!projectIds.includes(projectId)) throw new Error(`Unknown case-order project: ${projectId}`);
    reorder({ kind: 'caseOrder', container: `#${projectId} .case-study-list`, selector: `#${projectId} .case-study-list > .case-study-trigger`, requested, keyOf: (_, node) => node.attrs['data-case-open'], positionalClasses: true, caseLabels: true });
  }
  reorder({ kind: 'skillOrder', container: '#skills .skills', selector: '#skills .skills > .skill', requested: profile.skillOrder, keyOf: (doc, node) => textContent(doc, node.children.find(child => child.tag === 'h3')).trim() });
  return { html, orderChanges, derivedChanges };
}

export function resolveProfile(slug) {
  if (!ACTIVE_PROFILES.includes(slug)) throw new Error(`Refusing non-draft profile: ${slug}`);
  const profile = json(`src/content/${slug}.json`);
  if (profile.slug !== slug) throw new Error(`Profile slug mismatch: ${slug}`);
  const sources = loadSources();
  const baselineHtml = fillHtml(sources, sources.common.fields);
  const doc = parseHtml(baselineHtml);
  const fields = { ...sources.common.fields };
  const located = sources.locators.fields.map(locator => {
    const node = queryOne(doc, locator.selector);
    const range = rangeFor(node, locator.attribute);
    if (baselineHtml.slice(range.start, range.end) !== sources.common.fields[locator.key]) throw new Error(`Stale field locator: ${locator.key}`);
    return { ...locator, ...range };
  });
  const resolvedChanges = [];
  const patches = new Map();
  const addPatch = (field, range, after, record) => {
    if (typeof after !== 'string') throw new Error(`Copy must be a string: ${record.key}`);
    if (field.attribute && /["<>]/.test(after)) throw new Error(`Attribute copy must use HTML entities: ${record.key}`);
    if (!patches.has(field.key)) patches.set(field.key, []);
    patches.get(field.key).push({ start: range.start - field.start, end: range.end - field.start, value: after });
    if (record.before !== record.after) resolvedChanges.push({ ...record, fieldKey: field.key });
  };
  for (const [key, after] of Object.entries(profile.overrides ?? {})) {
    const field = located.find(locator => locator.key === key);
    if (!field) throw new Error(`Unknown override field: ${key}`);
    addPatch(field, field, after, { key, selector: field.selector, ...(field.attribute ? { attribute: field.attribute } : {}), before: fields[key], after, reason: profile.reasons?.[key] ?? '회사별 공통 필드 재정의' });
  }
  for (const change of profile.changes ?? []) {
    const fieldByKey = located.find(locator => locator.key === change.key);
    const selector = change.selector ?? fieldByKey?.selector;
    if (!selector) throw new Error(`Unknown change field: ${change.key}`);
    const attribute = change.attribute ?? (change.selector ? undefined : fieldByKey?.attribute);
    const node = queryOne(doc, selector);
    const range = rangeFor(node, attribute);
    const before = baselineHtml.slice(range.start, range.end);
    if (before !== change.before) throw new Error(`Before text does not match baseline: ${change.key} (${selector})`);
    const field = located.find(locator => locator.start <= range.start && locator.end >= range.end && (attribute ? locator.attribute === attribute : !locator.attribute));
    if (!field) throw new Error(`Selector is not backed by an extracted content field: ${selector}`);
    addPatch(field, range, change.after, { key: change.key ?? field.key, selector, ...(attribute ? { attribute } : {}), before, after: change.after, reason: change.reason ?? '회사별 문구 조정' });
  }
  for (const [key, changes] of patches) fields[key] = applyRanges(fields[key], changes);
  for (const key of ['meta.og.url', 'meta.og.image']) {
    const before = fields[key];
    if (typeof before !== 'string') throw new Error(`Missing required metadata: ${key}`);
    if (patches.has(key)) continue;
    const after = before.replace('/resume/toss/', `/resume/${slug}/`);
    if (after === before && !before.includes(`/resume/${slug}/`)) throw new Error(`Cannot derive profile URL from ${key}`);
    fields[key] = after;
    if (before !== after) {
      const field = located.find(locator => locator.key === key);
      resolvedChanges.push({ key, fieldKey: key, selector: field.selector, attribute: 'content', before, after, reason: '각 지원본의 주소와 공유 이미지를 해당 폴더로 맞춥니다.', derived: true });
    }
  }
  const titleDoc = parseHtml(`<title>${fields['meta.title']}</title>`);
  const runtime = { ...sources.common.runtime, BASE_TITLE: textContent(titleDoc, queryOne(titleDoc, 'title')) };
  const runtimeChanges = Object.keys(runtime).filter(key => !equal(runtime[key], sources.common.runtime[key])).map(key => ({ key, before: sources.common.runtime[key], after: runtime[key], reason: '문서 제목과 해시 이동 후 탭 제목을 일치시킵니다.' }));
  const ordered = orderSections(fillHtml(sources, fields), profile);
  return { slug, profile, fields, runtime, resolvedChanges: [...resolvedChanges, ...ordered.derivedChanges], orderChanges: ordered.orderChanges, runtimeChanges, html: ordered.html };
}

export function renderProfile(slugOrResolved) {
  const resolved = typeof slugOrResolved === 'string' ? resolveProfile(slugOrResolved) : slugOrResolved;
  return { ...resolved, script: fillScript(loadSources(), resolved.runtime) };
}

export function validateRendered(rendered) {
  const doc = parseHtml(rendered.html);
  const ids = new Set();
  for (const node of doc.nodes) if (node.attrs.id) {
    if (ids.has(node.attrs.id)) throw new Error(`Duplicate id: ${node.attrs.id}`);
    ids.add(node.attrs.id);
  }
  const missing = [];
  for (const node of doc.nodes) {
    for (const attribute of ['data-sheet-open', 'data-case-open', 'data-ama-target', 'aria-controls', 'aria-labelledby', 'aria-describedby']) {
      for (const target of (node.attrs[attribute] ?? '').split(/\s+/).filter(Boolean)) if (!ids.has(target)) missing.push(`${attribute}=${target}`);
    }
    for (const attribute of ['href', 'src', 'data-lightbox']) {
      const target = node.attrs[attribute];
      if (!target || /^(?:[a-z]+:|\/\/)/i.test(target)) continue;
      if (target.startsWith('#')) {
        if (!ids.has(target.slice(1))) missing.push(target);
        continue;
      }
      const rel = target.split(/[?#]/)[0];
      if (rel.startsWith('/') || rel.split('/').includes('..')) throw new Error(`Nonlocal page dependency: ${rel}`);
      if (!['styles.css', 'script.js'].includes(rel) && !fs.existsSync(path.join(ROOT, 'src', rel))) missing.push(rel);
    }
  }
  for (const track of rendered.runtime.CHRONO_TRACKS) for (const item of track.items) if (item.href?.startsWith('#') && !ids.has(item.href.slice(1))) missing.push(item.href);
  if (missing.length) throw new Error(`Missing page references: ${[...new Set(missing)].join(', ')}`);
  if (/\{\{(?:field|case|runtime):/.test(rendered.html + rendered.script)) throw new Error('Unresolved build token');
  return { ids: ids.size, files: walkFiles(path.join(ROOT, 'src/assets')).length + 3 };
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(filename) : [filename];
  });
}

export function verifyFrozen() {
  const manifest = json('src/frozen-manifest.json');
  for (const [rel, expected] of Object.entries(manifest)) if (sha256(fs.readFileSync(path.join(ROOT, rel))) !== expected) throw new Error(`Frozen file changed: ${rel}`);
  return Object.keys(manifest).length;
}

export function build({ check = false } = {}) {
  const frozenCount = verifyFrozen();
  const outputs = ACTIVE_PROFILES.map(slug => {
    const rendered = renderProfile(slug);
    return { ...rendered, validation: validateRendered(rendered) };
  });
  if (!check) for (const output of outputs) {
    const destination = path.join(ROOT, output.slug);
    const allowed = new Set(['index.html', 'script.js', 'styles.css', ...walkFiles(path.join(ROOT, 'src/assets')).map(file => path.relative(path.join(ROOT, 'src'), file))]);
    if (fs.existsSync(destination)) {
      if (fs.lstatSync(destination).isSymbolicLink()) throw new Error(`Refusing symlink output: ${output.slug}`);
      for (const file of walkFiles(destination)) if (!allowed.has(path.relative(destination, file))) throw new Error(`Unknown file in generated output: ${file}`);
    }
    fs.mkdirSync(destination, { recursive: true });
    fs.writeFileSync(path.join(destination, 'index.html'), output.html);
    fs.writeFileSync(path.join(destination, 'script.js'), output.script);
    fs.copyFileSync(path.join(ROOT, 'src/styles.css'), path.join(destination, 'styles.css'));
    fs.cpSync(path.join(ROOT, 'src/assets'), path.join(destination, 'assets'), { recursive: true });
  }
  verifyFrozen();
  return { frozenCount, outputs };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build.mjs [--check]');
  const result = build({ check: args.includes('--check') });
  console.log(`${args.includes('--check') ? 'Checked' : 'Built'} ${result.outputs.map(output => output.slug).join(', ')}; ${result.frozenCount} frozen files unchanged.`);
}
