import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { build, renderProfile } from './build.mjs';
import { generateComparisons } from './compare.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'reports');
build();
mkdirSync(out, { recursive: true });
const read = path => readFileSync(resolve(root, path), 'utf8');
const put = (name, text) => writeFileSync(resolve(out, name), text);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const plain = value => String(value).replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replace(/\s+/g, ' ').trim();
const code = value => `<pre><code>${escape(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}</code></pre>`;
const labels = { modoodoc: '모두닥', daangn: '당근' };
const baseline = read('toss/index.html');
const titles = Object.fromEntries([...baseline.matchAll(/<dialog\b[\s\S]*?<\/dialog>/g)].map(m => [m[0].match(/\bid="([^"]+)"/)?.[1], plain(m[0].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '')]));
const diff = (before, after, a, b) => {
  const result = spawnSync('diff', ['-u', '--label', a, '--label', b, before, after], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (![0, 1].includes(result.status)) throw Error(result.stderr);
  return result.stdout;
};
const orderText = values => values.map(v => titles[v] ? `${titles[v]} (${v})` : v).join('\n→ ');
const all = [];
let sections = '';
let markdown = '# 지원본 변경사항 전체 대조\n\n기준: 기존 toss/index.html 및 toss/script.js. 아래 원문 블록은 공백·줄바꿈·HTML 태그까지 보존하며 생략하지 않습니다. 화면에서 공백이 합쳐져 보이는 경우에도 HTML 원문과 JSON에는 그대로 남습니다.\n\n지원본은 별도 배포 산출물로 게시하며, 이 보고서는 배포 산출물에 포함하지 않습니다. 기업별 문구 변경과 순서 변경, 자동 파생된 제목·메타데이터, 전체 HTML·JS diff를 포함합니다. 기존 toss/와 빈 루트는 수정하지 않습니다.\n';
for (const slug of ['modoodoc', 'daangn']) {
  const data = renderProfile(slug);
  const prefix = slug === 'modoodoc' ? 'M' : 'D';
  const changes = data.resolvedChanges.map((c, i) => ({ id: `${prefix}${String(i + 1).padStart(2, '0')}`, ...c }));
  const entry = { slug, company: labels[slug], jobUrl: data.profile.jobUrl, changes, orderChanges: data.orderChanges, runtimeChanges: data.runtimeChanges };
  all.push(entry);
  const htmlDiff = diff(resolve(root, 'toss/index.html'), resolve(root, slug, 'index.html'), 'toss/index.html', `${slug}/index.html`);
  const jsDiff = diff(resolve(root, 'toss/script.js'), resolve(root, slug, 'script.js'), 'toss/script.js', `${slug}/script.js`);
  put(`${slug}-vs-toss.patch`, htmlDiff + jsDiff);
  markdown += `\n## ${labels[slug]}\n\n공고: ${data.profile.jobUrl}\n\n`;
  let cards = '';
  for (const c of changes) {
    const suffix = c.added ? ' · 신규 추가' : c.derived ? ' · 자동 파생' : '';
    markdown += `### ${c.id} · ${c.key}${suffix}\n\n위치: ${c.selector}${c.attribute ? ` [${c.attribute}]` : ''}\n\n이유: ${c.reason ?? ''}\n\n변경 전 원문:\n\n\`\`\`\`\`html\n${c.before}\n\`\`\`\`\`\n\n변경 후 원문:\n\n\`\`\`\`\`html\n${c.after}\n\`\`\`\`\`\n\n`;
    cards += `<article id="${c.id}"><h3><a href="#${c.id}">${c.id}</a> ${escape(c.key)}${suffix}</h3><p class="location">${escape(c.selector)}${c.attribute ? ` [${escape(c.attribute)}]` : ''}</p><p>${escape(c.reason ?? '')}</p><div class="comparison"><div><h4>변경 전</h4><p class="copy">${escape(plain(c.before))}</p></div><div><h4>변경 후</h4><p class="copy">${escape(plain(c.after))}</p></div></div><details><summary>HTML 원문 전체 · 공백과 줄바꿈 포함</summary><div class="comparison"><div><h4>변경 전 원문</h4>${code(c.before)}</div><div><h4>변경 후 원문</h4>${code(c.after)}</div></div></details></article>`;
  }
  for (const [i, o] of data.orderChanges.entries()) {
    const id = `${prefix}-O${String(i + 1).padStart(2, '0')}`;
    markdown += `### ${id} · ${o.kind} · ${o.container}\n\n변경 전:\n\n\`\`\`\n${orderText(o.before)}\n\`\`\`\n\n변경 후:\n\n\`\`\`\n${orderText(o.after)}\n\`\`\`\n\n`;
    cards += `<article id="${id}"><h3><a href="#${id}">${id}</a> ${escape(o.kind)}</h3><p class="location">${escape(o.container)}</p><div class="comparison"><div><h4>변경 전 순서</h4>${code(orderText(o.before))}</div><div><h4>변경 후 순서</h4>${code(orderText(o.after))}</div></div></article>`;
  }
  for (const [i, c] of data.runtimeChanges.entries()) {
    const id = `${prefix}-R${String(i + 1).padStart(2, '0')}`;
    markdown += `### ${id} · 실행 코드 ${c.key}\n\n${c.reason ?? ''}\n\n변경 전:\n\n\`\`\`\n${typeof c.before === 'string' ? c.before : JSON.stringify(c.before, null, 2)}\n\`\`\`\n\n변경 후:\n\n\`\`\`\n${typeof c.after === 'string' ? c.after : JSON.stringify(c.after, null, 2)}\n\`\`\`\n\n`;
    cards += `<article id="${id}"><h3><a href="#${id}">${id}</a> 실행 코드 ${escape(c.key)}</h3><p>${escape(c.reason ?? '')}</p><div class="comparison"><div><h4>변경 전</h4>${code(c.before)}</div><div><h4>변경 후</h4>${code(c.after)}</div></div></article>`;
  }
  sections += `<section id="${slug}"><h2>${labels[slug]} · ${changes.length}개 문구·메타 항목 / ${data.orderChanges.length}개 순서 변경</h2><p><a href="${escape(data.profile.jobUrl)}" target="_blank" rel="noreferrer">채용 공고</a> · <a href="../${slug}/" target="_blank">페이지 미리보기</a> · <a href="${slug}-vs-toss.patch">전체 HTML·JS diff</a></p>${cards}<details class="full-diff"><summary>${labels[slug]} 전체 HTML·JS 변경 원문</summary>${code(htmlDiff + jsDiff)}</details></section>`;
}

const walk = dir => readdirSync(dir, { withFileTypes: true }).filter(e => !['.git', 'reports', '.pages-dist'].includes(e.name)).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)]);
const manifest = walk(root).sort().map(file => {
  const bytes = readFileSync(file);
  return { path: relative(root, file), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
});
put('file-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
put('changes.json', JSON.stringify({ baselineCommit: 'b8d686cd8d25cbbaaf48f84d16ed4248e1ac57bf', profiles: all }, null, 2) + '\n');
put('changes.md', markdown);
const implementation = spawnSync(process.execPath, [resolve(root, 'scripts/implementation-diff.mjs')], { encoding: 'utf8' });
if (implementation.status !== 0) throw Error(implementation.stderr);
const document = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>지원본 변경사항 전체 대조</title><style>
:root{color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;color:#202733;background:#f4f5f7}*{box-sizing:border-box}body{margin:0}header,main,nav{max-width:1440px;margin:auto;padding:24px 32px}header p{max-width:920px;line-height:1.7}nav{position:sticky;top:0;background:#f4f5f7f5;border-bottom:1px solid #d6dce5;display:flex;gap:22px;flex-wrap:wrap;z-index:2;padding-top:14px;padding-bottom:14px}a{color:#164eba;text-decoration-thickness:1px;text-underline-offset:3px}h1{font-size:30px;margin:8px 0 18px}h2{margin-top:22px;font-size:24px}h3{font-size:17px;overflow-wrap:anywhere;margin:0 0 9px}h4{font-size:12px;letter-spacing:.05em;color:#526176;margin:0 0 12px}section,article{scroll-margin-top:90px}article{background:white;border:1px solid #d6dce5;border-radius:9px;padding:22px;margin:18px 0}.location{font:12px ui-monospace,monospace;color:#64748b;overflow-wrap:anywhere}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}.comparison>div{min-width:0;padding:16px;border:1px solid #e0e5ec;border-radius:5px}.comparison>div:last-child{background:#f4f8ff}.copy{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.85;font-size:15px;margin:0}details{margin-top:18px}summary{cursor:pointer;color:#244b84;font-size:14px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.65 ui-monospace,SFMono-Regular,monospace;margin:0;tab-size:2}.full-diff pre{padding:20px;background:white;border:1px solid #d6dce5;margin-top:12px}.note{background:#fff;border-left:4px solid #235aca;padding:15px 20px}footer{padding:36px;color:#526176;text-align:center}@media(max-width:760px){header,main,nav{padding-left:16px;padding-right:16px}.comparison{grid-template-columns:1fr;gap:12px}article{padding:16px}h1{font-size:24px}}@media print{nav{position:static}article{break-inside:avoid}details{display:block}}
</style></head><body><header><h1>지원본 변경사항 전체 대조</h1><p>기준은 기존 <strong>/toss/</strong>입니다. 모든 변경 전·후 문구를 생략 없이 수록했습니다. 화면 문구는 브라우저처럼 연속 공백을 합쳐 보여주며, 각 항목의 <strong>HTML 원문 전체</strong>에는 공백·줄바꿈·태그까지 그대로 보존했습니다.</p><p class="note">피드백은 <strong>M01, D03, D-O01</strong>처럼 항목 번호로 주시면 됩니다. 지원본은 별도 배포 산출물로 게시하며, 이 보고서는 웹사이트에 포함하지 않습니다. 기존 토스 제출본과 빈 루트는 유지했습니다. 코드·표를 포함한 상세 사례 6개 본문과 CSS·이미지는 동일합니다.</p></header><nav><a href="#modoodoc">모두닥</a><a href="#daangn">당근</a><a href="changes.md">전체 Markdown</a><a href="changes.json">정확한 변경 데이터 JSON</a><a href="file-manifest.json">전체 파일·해시 목록</a><a href="implementation.patch">구조 변경 전체 diff</a></nav><main>${sections}</main><footer>실제 콘텐츠 데이터와 생성된 HTML·JS에서 자동 생성한 대조표입니다.</footer></body></html>`;
const comparisonResults = generateComparisons();
put('index.html', document.replace('<nav>', '<nav><a href="comparison/index.html">이번 변경 · 세 지원본 전체 비교</a>'));
console.log(JSON.stringify(all.map(d => ({ slug: d.slug, changes: d.changes.length, orderChanges: d.orderChanges.length, runtimeChanges: d.runtimeChanges.length })), null, 2));
