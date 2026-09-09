import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseHtml, hasClass, innerHtml, outerHtml } from './html.mjs';

export const BASE_COMMIT = '2a11ee8a7fc57d8664b732996bbd655fb9f031a2';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'reports/comparison');
const SLUGS = ['toss', 'modoodoc', 'daangn'];
const FILES = ['index.html', 'script.js', 'styles.css'];
const LABELS = { toss: '토스', modoodoc: '모두닥', daangn: '당근' };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const plain = value => String(value).replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replace(/\s+/g, ' ').trim();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const read = name => readFileSync(resolve(ROOT, name));
const put = (name, bytes) => { const filename = resolve(OUT, name); mkdirSync(dirname(filename), { recursive: true }); writeFileSync(filename, bytes); };
const git = args => {
  const result = spawnSync('git', args, { cwd: ROOT, maxBuffer: 30 * 1024 * 1024 });
  if (result.status !== 0) throw Error(`git ${args[0]} failed: ${result.stderr.toString()}`);
  return result.stdout;
};
const walk = dir => readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(entry => entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)]);
const ancestors = node => { const all = []; for (let p = node; p; p = p.parent) all.push(p); return all; };
const ownText = (doc, node) => {
  let start = node.openEnd;
  const segments = [];
  for (const child of node.children) { segments.push(doc.html.slice(start, child.start)); start = child.end; }
  segments.push(doc.html.slice(start, node.closeStart));
  return segments;
};

// IDs and project targets keep the comparison stable when cards move.
// Structural paths are used only where the source has no semantic identifier.
function inventory(html) {
  const doc = parseHtml(html);
  const keys = new Map([[doc.root, 'document']]);
  const nodes = new Map();
  const atoms = new Set();
  for (const node of doc.nodes) {
    let key;
    if (node.attrs.id) key = `#${node.attrs.id}`;
    else if (node.tag === 'meta' && (node.attrs.name || node.attrs.property)) key = `meta[${node.attrs.name ? 'name' : 'property'}="${node.attrs.name ?? node.attrs.property}"]`;
    else if (node.attrs['data-sheet-open']) key = `[data-sheet-open="${node.attrs['data-sheet-open']}"]`;
    else if (node.attrs['data-case-open']) key = `[data-case-open="${node.attrs['data-case-open']}"]`;
    else if (hasClass(node, 'skill')) key = `#skills .skill[heading="${plain(innerHtml(doc, node.children.find(child => child.tag === 'h3')))}"]`;
    else {
      const siblings = node.parent.children.filter(sibling => sibling.tag === node.tag);
      key = `${keys.get(node.parent)} > ${node.tag}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(node) + 1})` : ''}`;
    }
    if (nodes.has(key)) throw Error(`Ambiguous comparison key: ${key}`);
    keys.set(node, key);
    nodes.set(key, node);
    const inheritedAtom = ancestors(node.parent).some(parent => atoms.has(parent));
    const projectList = node.tag === 'ul' && ancestors(node).some(parent => hasClass(parent, 'project-grid'));
    const contentBlock = ['title', 'p', 'h1', 'h2', 'h3', 'h4'].includes(node.tag) || projectList;
    const question = node.tag === 'button' && (hasClass(node, 'ama-question') || hasClass(node, 'ama-followup-toggle'));
    const directCopy = ownText(doc, node).some(text => plain(text)) && ['span', 'strong', 'small', 'li', 'a', 'label', 'code', 'pre'].includes(node.tag);
    if (!inheritedAtom && (contentBlock || question || directCopy)) atoms.add(node);
  }
  return { doc, keys, nodes, atoms };
}

export function compareHtml(before, after) {
  if (before === after) return [];
  const left = inventory(before), right = inventory(after);
  const changes = [];
  const missingLeft = new Set([...left.nodes.keys()].filter(key => !right.nodes.has(key)));
  const missingRight = new Set([...right.nodes.keys()].filter(key => !left.nodes.has(key)));
  const inside = (state, node, keys) => ancestors(node).some(parent => keys.has(state.keys.get(parent)));
  const atomicChanges = new Set();
  const add = (kind, location, a, b, extra = {}) => {
    if (a === b) return;
    const beforeText = kind === 'text' || kind.endsWith('node') ? plain(a) : null;
    const afterText = kind === 'text' || kind.endsWith('node') ? plain(b) : null;
    changes.push({ kind, location, before: a, after: b, ...(beforeText !== null ? { beforeText, afterText } : {}), ...extra });
  };
  for (const [key, node] of left.nodes) {
    if (missingLeft.has(key) && !inside(left, node.parent, missingLeft)) add('removed-node', key, outerHtml(left.doc, node), '', { sourceOrder: node.start });
  }
  for (const [key, node] of right.nodes) {
    if (missingRight.has(key) && !inside(right, node.parent, missingRight)) add('added-node', key, '', outerHtml(right.doc, node), { sourceOrder: node.start });
  }
  for (const [key, a] of left.nodes) {
    const b = right.nodes.get(key);
    if (!b || inside(left, a, missingLeft) || inside(right, b, missingRight)) continue;
    if ((left.atoms.has(a) || right.atoms.has(b)) && innerHtml(left.doc, a) !== innerHtml(right.doc, b)) {
      add('text', key, innerHtml(left.doc, a), innerHtml(right.doc, b), { sourceOrder: a.start });
      atomicChanges.add(key);
    }
  }
  for (const [key, a] of left.nodes) {
    const b = right.nodes.get(key);
    if (!b || inside(left, a, missingLeft) || inside(right, b, missingRight)) continue;
    // Raw parent content already includes changes to its descendants.
    if (inside(left, a.parent, atomicChanges) || inside(right, b.parent, atomicChanges)) continue;
    const attributeKeys = [...new Set([...Object.keys(a.attrs), ...Object.keys(b.attrs)])].sort();
    for (const attribute of attributeKeys) if (a.attrs[attribute] !== b.attrs[attribute]) {
      add('attribute', key, a.attrs[attribute] ?? '', b.attrs[attribute] ?? '', { attribute, beforePresent: attribute in a.attrs, afterPresent: attribute in b.attrs, beforeTag: before.slice(a.start, a.openEnd), afterTag: after.slice(b.start, b.openEnd), sourceOrder: a.start });
    }
    const aOpen = before.slice(a.start, a.openEnd), bOpen = after.slice(b.start, b.openEnd);
    if (aOpen !== bOpen && same(a.attrs, b.attrs)) add('tag-format', key, aOpen, bOpen, { sourceOrder: a.start });
    if (!atomicChanges.has(key)) {
      const aChildren = a.children.map(node => left.keys.get(node));
      const bChildren = b.children.map(node => right.keys.get(node));
      if (!same(aChildren, bChildren)) add('structure', key, JSON.stringify(aChildren, null, 2), JSON.stringify(bChildren, null, 2), { sourceOrder: a.start });
      const aText = ownText(left.doc, a), bText = ownText(right.doc, b);
      if (!same(aText, bText)) add(aText.some(plain) || bText.some(plain) ? 'direct-text' : 'whitespace', key, JSON.stringify(aText, null, 2), JSON.stringify(bText, null, 2), { sourceOrder: a.start });
    }
  }
  return changes.sort((a, b) => a.sourceOrder - b.sourceOrder || a.kind.localeCompare(b.kind, 'en') || a.location.localeCompare(b.location, 'en')).map(({ sourceOrder, ...change }) => change);
}

function patchFor(beforePath, afterPath, beforeLabel, afterLabel) {
  const result = spawnSync('diff', ['-u', '--label', beforeLabel, '--label', afterLabel, resolve(OUT, beforePath), resolve(OUT, afterPath)], { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 });
  if (![0, 1].includes(result.status)) throw Error(`diff failed: ${result.stderr}`);
  return result.stdout;
}

const CSS = `:root{font-family:system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif;color:#1c2738;background:#f4f6f9;color-scheme:light}*{box-sizing:border-box}body{margin:0}main,header,nav{max-width:1320px;margin:auto;padding:24px 28px}h1{font-size:28px}h2{font-size:21px;margin:0 0 14px}h3{font-size:16px;overflow-wrap:anywhere}p{line-height:1.8}a{color:#164da8;text-underline-offset:3px}nav{position:sticky;top:0;background:#f4f6f9f5;display:flex;gap:22px;flex-wrap:wrap;z-index:2;padding-top:14px;padding-bottom:14px;border-bottom:1px solid #d7deea}.card,article{background:#fff;border:1px solid #d7deea;border-radius:8px;margin:18px 0;padding:22px;scroll-margin-top:90px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.columns>div{min-width:0;border:1px solid #e1e6ee;padding:14px;border-radius:5px}.columns>div:last-child{background:#f4f8ff}.label{font-size:12px;color:#627187;font-weight:600;margin:0 0 10px}.copy{font-size:14px;line-height:1.8;white-space:pre-wrap;margin:0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.65 ui-monospace,SFMono-Regular,monospace;margin:0;tab-size:2}code{font-family:ui-monospace,SFMono-Regular,monospace}summary{cursor:pointer;color:#244d88;padding:8px 0}.muted{font-size:13px;color:#627187}.tag{font-size:12px;padding:3px 8px;background:#e8eef8;border-radius:12px;margin-left:8px}.success{color:#286449}.empty{color:#778399;font-style:italic}.note{border-left:3px solid #2d65b8;padding-left:16px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #e2e6ed;vertical-align:top;overflow-wrap:anywhere}th{font-weight:600}td.hash{font:11px/1.8 ui-monospace,monospace;word-break:break-all}.toc{display:flex;gap:18px;flex-wrap:wrap}details+details{margin-top:12px}article[id],section[id]{scroll-margin-top:88px}footer{max-width:1320px;margin:auto;padding:28px;color:#627187;font-size:12px}@media(max-width:760px){main,header,nav{padding-left:16px;padding-right:16px}.columns{grid-template-columns:1fr}.card,article{padding:16px}h1{font-size:23px}}`;
const raw = value => `<pre><code>${escape(value)}</code></pre>`;
const view = (left, right, beforeLabel, afterLabel, rawOnly = false) => `<div class="columns"><div><p class="label">${escape(beforeLabel)}</p>${rawOnly ? raw(left) : `<p class="copy">${left === '' ? '<span class="empty">내용 없음</span>' : escape(left)}</p>`}</div><div><p class="label">${escape(afterLabel)}</p>${rawOnly ? raw(right) : `<p class="copy">${right === '' ? '<span class="empty">내용 없음</span>' : escape(right)}</p>`}</div></div>`;
const page = (title, intro, content, nav = '') => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>${CSS}</style></head><body><header><h1>${escape(title)}</h1>${intro}</header><nav><a href="../index.html">전체 검토 보고서</a><a href="index.html">비교 목록</a>${nav}<a href="manifest.json">원본·이미지 해시</a><a href="data.json">정확한 비교 JSON</a></nav><main>${content}</main><footer>변경 전 기준: ${BASE_COMMIT} · 원문은 공백·줄바꿈·태그를 포함합니다. 이 보고서와 스냅샷은 공개 사이트 배포 산출물에서 제외됩니다.</footer></body></html>`;
const KIND = { text: '문구·인라인 HTML', attribute: '속성', 'tag-format': '태그 서식', structure: '하위 요소 구조·순서', whitespace: '요소 사이 공백', 'direct-text': '직접 텍스트·공백', 'added-node': '추가된 영역', 'removed-node': '제거된 영역' };

function detailPage(comparison) {
  const { title, beforeLabel, afterLabel, records, files, assetSummary } = comparison;
  let content = `<section class="card"><h2>파일 전체 대조</h2><p><a href="${comparison.id}.patch">HTML·JS·CSS 전체 patch 다운로드</a> · <a href="${comparison.id}.json">이 비교의 정확한 항목 JSON</a></p><table><thead><tr><th>파일</th><th>상태</th><th>${escape(beforeLabel)}</th><th>${escape(afterLabel)}</th></tr></thead><tbody>${files.map(file => `<tr><td>${file.name}</td><td>${file.same ? '동일' : '변경'}</td><td><a href="${file.before.snapshot}">원본 전체</a><br>${file.before.bytes.toLocaleString('en')} bytes</td><td><a href="${file.after.snapshot}">원본 전체</a><br>${file.after.bytes.toLocaleString('en')} bytes</td></tr>`).join('')}</tbody></table><p class="muted">이미지·파비콘 ${assetSummary.total}개: 동일 ${assetSummary.same}개, 변경 ${assetSummary.changed}개, 추가 ${assetSummary.added}개, 삭제 ${assetSummary.removed}개. 모든 파일별 SHA-256은 해시 목록에 있습니다.</p></section>`;
  if (!records.length) content += '<section class="card"><h2 class="success">HTML의 문구·속성·구조 차이가 없습니다.</h2><p>위 파일 상태와 해시로 JavaScript·CSS·이미지의 일치 여부도 확인할 수 있습니다.</p></section>';
  let copyContent = '', technicalContent = '', technicalCount = 0;
  for (const item of records) {
    const presentable = item.beforeText !== undefined;
    const article = `<article id="${item.id}"><h3><a href="#${item.id}">${item.id}</a> ${escape(item.location)}${item.attribute ? ` [${escape(item.attribute)}]` : ''}<span class="tag">${KIND[item.kind]}</span></h3>${presentable ? view(item.beforeText, item.afterText, beforeLabel, afterLabel) : ''}<details${presentable ? '' : ' open'}><summary>정확한 ${item.kind === 'structure' ? '요소 순서' : item.kind === 'whitespace' || item.kind === 'direct-text' ? '텍스트 조각 JSON' : '원문'} · 공백과 줄바꿈 포함</summary>${view(item.before, item.after, beforeLabel, afterLabel, true)}</details>${item.beforeTag !== undefined ? `<details><summary>해당 시작 태그 전체</summary>${view(item.beforeTag, item.afterTag, beforeLabel, afterLabel, true)}</details>` : ''}</article>`;
    if (presentable) copyContent += article;
    else { technicalContent += article; technicalCount += 1; }
  }
  content += copyContent;
  if (technicalCount) content += `<details class="card"><summary>구조·속성·공백 상세 · ${technicalCount}개 항목</summary>${technicalContent}</details>`;
  const intro = `<p>${escape(beforeLabel)}와 ${escape(afterLabel)}를 비교합니다. 읽을 수 있는 문구와 정확한 HTML 원문을 함께 제공합니다.</p><p class="note">전체 파일의 모든 차이는 <strong>patch와 원본 스냅샷</strong>에 포함됩니다. 아래 ${records.length}개 항목은 같은 요소를 ID·프로젝트 ID로 연결한 대조입니다. 화면 문구의 연속 공백은 합쳐 보여주며, 원문과 JSON은 그대로 보존합니다.</p>`;
  return page(title, intro, content, `<a href="${comparison.id}.patch">전체 patch</a>`);
}

export function generateComparisons() {
  mkdirSync(OUT, { recursive: true });
  git(['cat-file', '-e', `${BASE_COMMIT}^{commit}`]);
  const snapshots = {};
  const manifest = { schemaVersion: 1, baselineCommit: BASE_COMMIT, files: [], assets: [] };
  for (const revision of ['before', 'current']) for (const slug of SLUGS) {
    const key = `${revision}/${slug}`;
    snapshots[key] = {};
    for (const name of FILES) {
      const sourcePath = `${slug}/${name}`;
      const bytes = revision === 'before' ? git(['show', `${BASE_COMMIT}:${sourcePath}`]) : read(sourcePath);
      const snapshot = `snapshots/${revision}/${sourcePath}.txt`;
      put(snapshot, bytes);
      const entry = { revision, slug, name, sourcePath, snapshot, bytes: bytes.length, sha256: sha(bytes) };
      manifest.files.push(entry);
      snapshots[key][name] = { ...entry, text: bytes.toString('utf8') };
    }
    const assetPaths = revision === 'before'
      ? git(['ls-tree', '-r', '--name-only', '-z', BASE_COMMIT, '--', `${slug}/assets`]).toString().split('\0').filter(Boolean).sort()
      : walk(resolve(ROOT, `${slug}/assets`)).map(filename => relative(ROOT, filename)).sort();
    for (const sourcePath of assetPaths) {
      const bytes = revision === 'before' ? git(['show', `${BASE_COMMIT}:${sourcePath}`]) : read(sourcePath);
      manifest.assets.push({ revision, slug, sourcePath, asset: sourcePath.slice(slug.length + 1), bytes: bytes.length, sha256: sha(bytes) });
    }
  }
  const specs = [
    ...SLUGS.map(slug => ({ id: `previous-${slug}`, prefix: `P${slug[0].toUpperCase()}`, type: 'previous', left: `before/${slug}`, right: `current/${slug}`, title: `${LABELS[slug]} · 이전 게시본과 이번 결과`, beforeLabel: `${LABELS[slug]} 이전 게시본`, afterLabel: `${LABELS[slug]} 이번 결과` })),
    ...[['toss', 'modoodoc'], ['toss', 'daangn'], ['modoodoc', 'daangn']].map(([a, b]) => ({ id: `${a}-vs-${b}`, prefix: `${a[0].toUpperCase()}${b[0].toUpperCase()}`, type: 'pairwise', left: `current/${a}`, right: `current/${b}`, title: `${LABELS[a]} ↔ ${LABELS[b]} · 지원본 전체 비교`, beforeLabel: LABELS[a], afterLabel: LABELS[b] })),
  ];
  const comparisons = specs.map(spec => {
    const left = snapshots[spec.left], right = snapshots[spec.right];
    const files = FILES.map(name => {
      const { text: aText, ...a } = left[name], { text: bText, ...b } = right[name];
      return { name, same: a.sha256 === b.sha256, before: a, after: b };
    });
    const patch = files.map(file => patchFor(file.before.snapshot, file.after.snapshot, `${spec.left}/${file.name}`, `${spec.right}/${file.name}`)).join('');
    put(`${spec.id}.patch`, patch);
    const aAssets = manifest.assets.filter(entry => `${entry.revision}/${entry.slug}` === spec.left);
    const bAssets = manifest.assets.filter(entry => `${entry.revision}/${entry.slug}` === spec.right);
    const assets = [...new Set([...aAssets, ...bAssets].map(entry => entry.asset))].sort().map(asset => {
      const a = aAssets.find(entry => entry.asset === asset), b = bAssets.find(entry => entry.asset === asset);
      return { asset, status: !a ? 'added' : !b ? 'removed' : a.sha256 === b.sha256 ? 'same' : 'changed', before: a ?? null, after: b ?? null };
    });
    const assetSummary = { total: assets.length, same: 0, changed: 0, added: 0, removed: 0 };
    for (const asset of assets) assetSummary[asset.status] += 1;
    const records = compareHtml(left['index.html'].text, right['index.html'].text).map((record, index) => ({ id: `${spec.prefix}-${String(index + 1).padStart(3, '0')}`, ...record }));
    const comparison = { ...spec, records, files, assets, assetSummary, patch: { file: `${spec.id}.patch`, bytes: Buffer.byteLength(patch), sha256: sha(patch) } };
    put(`${spec.id}.json`, JSON.stringify(comparison, null, 2) + '\n');
    put(`${spec.id}.html`, detailPage(comparison));
    return comparison;
  });
  const toss = comparisons.find(comparison => comparison.id === 'previous-toss');
  if (toss.files.some(file => !file.same) || toss.assets.some(asset => asset.status !== 'same')) throw Error('Toss snapshot changed; comparison generation stopped.');
  put('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  put('data.json', JSON.stringify({ schemaVersion: 1, baselineCommit: BASE_COMMIT, comparisons }, null, 2) + '\n');
  const summaries = type => comparisons.filter(comparison => comparison.type === type).map(comparison => `<div class="card"><h3><a href="${comparison.id}.html">${escape(comparison.title)}</a></h3><p>${comparison.records.length}개 HTML 대조 항목 · ${comparison.files.filter(file => !file.same).length}/3 파일 변경 · 이미지 ${comparison.assetSummary.same}/${comparison.assetSummary.total}개 동일</p><p><a href="${comparison.id}.html">읽기 쉬운 전후 대조</a> · <a href="${comparison.id}.patch">전체 patch</a> · <a href="${comparison.id}.json">정확한 항목 JSON</a></p></div>`).join('');
  put('index.html', page('토스·모두닥·당근 · 이번 변경과 지원본 전체 비교', `<p>이번 작업 전 <code>${BASE_COMMIT.slice(0, 7)}</code>의 게시 파일과 이번 결과, 그리고 세 지원본끼리의 차이를 모두 비교합니다. 각 비교는 HTML·JavaScript·CSS 전체 patch와 원본 파일 스냅샷을 제공합니다.</p><p class="note">토스의 HTML·JavaScript·CSS·이미지는 기준 커밋과 모두 같습니다. 문구의 조사·어미, 공백·줄바꿈, 인라인 태그, 속성과 순서도 정확한 원문으로 남겼습니다. 이 보고서의 파일은 공개 사이트 배포에 포함하지 않습니다.</p>`, `<section id="previous"><h2>이전 게시본 → 이번 결과</h2>${summaries('previous')}</section><section id="pairwise"><h2>현재 지원본끼리의 전체 차이</h2>${summaries('pairwise')}</section>`, '<a href="#previous">이번 변경</a><a href="#pairwise">회사별 비교</a>'));
  return comparisons.map(comparison => ({ id: comparison.id, records: comparison.records.length, changedFiles: comparison.files.filter(file => !file.same).length, assets: comparison.assetSummary }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(generateComparisons(), null, 2));
