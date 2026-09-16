import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, verifyFrozen } from './build.mjs';
import { parseHtml, queryOne, innerHtml } from './html.mjs';

export const STANDARD_PROFILES = Object.freeze(['simple']);
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const paragraph = value => `<p>${escape(value)}</p>`;

export function renderStandard(slug) {
  if (!STANDARD_PROFILES.includes(slug)) throw Error(`Unknown standard profile: ${slug}`);
  const content = JSON.parse(read(`src/content/${slug}.json`));
  if (content.schemaVersion !== 1 || content.slug !== slug) throw Error('Invalid standard profile');
  const common = JSON.parse(read('src/content/common.json'));
  if (common.schemaVersion !== 1) throw Error('Invalid common content schema');
  const issues = Object.entries(common.fields).flatMap(([key, title]) => {
    const match = /^caseSummaries\.([\w-]+)\.title$/.exec(key);
    return match ? [{ id: match[1], title }] : [];
  });
  const selectedCases = content.projects.flatMap(project => project.cases);
  if (new Set(selectedCases).size !== selectedCases.length || selectedCases.length !== issues.length) throw Error('Each solved issue must belong to exactly one project');
  function caseLink(id) {
    const issue = issues.find(item => item.id === id);
    if (!issue) throw Error(`Unknown solved issue: ${id}`);
    return `<a href="#${escape(id)}" data-solved-issue="${escape(id)}" aria-haspopup="dialog" aria-controls="${escape(id)}">${issue.title}<span aria-hidden="true"> ↗</span></a>`;
  }
  const assetPaths = new Set(['assets/favicon.svg']);
  const projects = content.projects.map(project => {
    const images = project.images.map((image, index) => {
      if (!/^assets\/images\/[a-z0-9-]+\.webp$/.test(image.src)) throw Error(`Invalid image source: ${image.src}`);
      assetPaths.add(image.src);
      return `<button type="button" data-lightbox="${escape(image.src)}" data-gallery="${escape(project.id)}"${index >= 2 ? ' hidden' : ''} aria-label="${escape(image.alt)} 확대"><img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"></button>`;
    }).join('\n');
    return `<article class="project" id="project-${escape(project.id)}">
  <div class="project-main">
    <div class="project-copy">
      <p class="project-meta">${escape(project.period)} · ${escape(project.role)}</p>
      <h3>${escape(project.name)}</h3>
      <p class="project-subtitle">${escape(project.subtitle)}</p>
      <p class="project-summary">${escape(project.summary)}</p>
      <ul class="project-points">${project.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>
      <p class="project-result">${escape(project.result)}</p>
      ${project.stack ? `<p class="project-stack">${escape(project.stack)}</p>` : ''}
      ${(project.links ?? []).length ? `<div class="project-links">${project.links.map(link => `<a href="${escape(link.href)}" target="_blank" rel="noreferrer">${escape(link.label)} ↗</a>`).join('')}</div>` : ''}
    </div>
    <figure class="project-visual${project.images.length > 1 ? ' has-pair' : ''}"><div class="project-images">${images}</div><figcaption>${escape(project.caption)}</figcaption></figure>
  </div>
  ${project.cases.length ? `<details class="project-details"><summary>기술적 문제 해결 <span class="case-count">(${project.cases.length})</span></summary><div class="case-links">${project.cases.map(caseLink).join('')}</div></details>` : ''}
</article>`;
  }).join('\n');
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(content.title)}</title>
  <meta name="description" content="${escape(content.description)}">
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="${escape(content.title)}">
  <meta property="og:description" content="${escape(content.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tkd992006.github.io/resume/${slug}/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="standard-portfolio">
<a class="skip-link" href="#main">본문으로 바로 가기</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="#about">${escape(content.name)}</a><nav aria-label="주요 메뉴"><a href="#about">소개</a><a href="#skills">기술</a><a href="#projects">프로젝트</a><a href="#experience">경력</a></nav></div></header>
<main class="container" id="main" tabindex="-1">
  <section class="hero" id="about" aria-labelledby="about-title">
    <p class="role">${escape(content.role)}</p>
    <h1 id="about-title">${escape(content.name)}</h1>
    <p class="lead">${escape(content.lead)}</p>
    <div class="hero-copy">${content.about.map(paragraph).join('')}</div>
    <div class="contact-links"><a href="mailto:${escape(content.email)}">${escape(content.email)}</a><a href="${escape(content.github)}" target="_blank" rel="noreferrer">GitHub ↗</a></div>
    <nav class="quick-links" aria-label="바로 가기"><a href="#skills">기술 역량</a><a href="#projects">대표 프로젝트</a><a href="#experience">경력과 학력</a></nav>
  </section>
  <section class="section" id="skills" aria-labelledby="skills-title"><h2 id="skills-title">기술 역량</h2><div class="skills-grid">${content.skills.map(skill => `<article class="skill-item"><h3>${escape(skill.title)}</h3><p class="skill-tools">${escape(skill.tools)}</p>${skill.description ? paragraph(skill.description) : ''}${skill.items?.length ? `<ul class="skill-experience">${skill.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}</article>`).join('')}</div><p class="collaboration">${escape(content.collaboration)}</p></section>
  <section class="section" id="projects" aria-labelledby="projects-title"><h2 id="projects-title">대표 프로젝트</h2><p class="section-intro">${escape(content.projectsIntro)}</p><div class="project-list">${projects}</div></section>
  <section class="section" id="experience" aria-labelledby="experience-title"><h2 id="experience-title">경력과 학력</h2><div class="experience-list">${content.experience.map(item => `<article class="experience-item"><h3>${escape(item.name)}</h3><p class="meta">${escape(item.period)} · ${escape(item.role)}</p>${item.description ? paragraph(item.description) : ''}</article>`).join('')}<article class="experience-item"><h3>Etc.</h3><ul class="etc-list">${(content.etc ?? []).map(item => `<li>${escape(item)}</li>`).join('')}</ul></article></div></section>
  <section class="section" id="solved-problems" aria-label="문제 해결 사례 전체"><details class="all-cases"><summary>문제 해결 사례 전체 보기</summary><p>각 프로젝트의 구현 과정과 판단을 조금 더 자세히 정리했습니다.</p><div class="case-links">${selectedCases.map(caseLink).join('')}</div></details></section>
  <section class="section" id="other-projects" aria-labelledby="other-projects-title"><h2 id="other-projects-title">그 외 프로젝트</h2><details class="other-projects"><summary>프로젝트 ${content.otherProjects.length}개 보기</summary><div class="other-project-list">${content.otherProjects.map(project => `<article><div class="other-project-heading"><h3>${escape(project.name)}</h3><span>${escape(project.period)}</span></div><p class="other-project-subtitle">${escape(project.subtitle)}</p>${paragraph(project.description)}</article>`).join('')}</div></details></section>
</main>
<footer class="site-footer"><div class="container"><p>${escape(content.name)} · ${escape(content.role)}</p><a href="mailto:${escape(content.email)}">${escape(content.email)}</a></div></footer>
${selectedCases.map(id => read(`src/cases/${id}.html`)).join('\n')}
<dialog class="lightbox" id="lightbox" aria-label="프로젝트 화면 확대"><button type="button" data-lightbox-close aria-label="확대 화면 닫기">×</button><figure><img alt=""><figcaption id="gallery-caption"></figcaption></figure><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="이전 이미지">← 이전</button><span id="gallery-position" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" data-gallery-step="1" aria-label="다음 이미지">다음 →</button></div></dialog>
<script src="script.js" defer></script>
</body>
</html>\n`;
  const normalizedHtml = html.replace(/[ \t]+$/gm, '');
  return { slug, content, html: normalizedHtml, css: read('src/standard.css'), script: read('src/standard.js'), assetPaths: [...assetPaths], selectedCases };
}

export function validateStandard(output) {
  const doc = parseHtml(output.html);
  const ids = doc.nodes.filter(node => node.attrs.id).map(node => node.attrs.id);
  if (new Set(ids).size !== ids.length) throw Error('Duplicate standard-page ID');
  for (const node of doc.nodes) {
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'data-solved-issue']) {
      for (const id of (node.attrs[attr] ?? '').split(/\s+/).filter(Boolean)) if (!ids.includes(id)) throw Error(`Broken ${attr}: ${id}`);
    }
    for (const attr of ['href', 'src', 'data-lightbox']) {
      const value = node.attrs[attr];
      if (!value || /^(?:[a-z]+:|\/\/)/i.test(value)) continue;
      if (value.startsWith('#')) { if (!ids.includes(value.slice(1))) throw Error(`Missing fragment: ${value}`); }
      else if (!['styles.css', 'script.js'].includes(value) && !fs.existsSync(path.join(ROOT, 'src', value))) throw Error(`Missing asset: ${value}`);
    }
  }
  for (const id of output.selectedCases) {
    const source = parseHtml(read(`src/cases/${id}.html`));
    if (innerHtml(doc, queryOne(doc, `#${id} .case-modal-content`)) !== innerHtml(source, queryOne(source, '.case-modal-content'))) throw Error(`Changed case body: ${id}`);
    const entryPoints = doc.nodes.filter(node => node.attrs['data-solved-issue'] === id);
    if (entryPoints.length !== 2) throw Error(`Expected two shared entry points: ${id}`);
  }
  if (/\{\{/.test(output.html)) throw Error('Unresolved standard template field');
}

export function buildStandard({ check = false, verify = false } = {}) {
  verifyFrozen();
  const outputs = STANDARD_PROFILES.map(renderStandard);
  outputs.forEach(validateStandard);
  for (const output of outputs) {
    const destination = path.join(ROOT, output.slug);
    if (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink()) throw Error('Refusing symlink output');
    const files = [['index.html', output.html], ['styles.css', output.css], ['script.js', output.script]];
    if (verify) {
      for (const [name, text] of files) if (read(`${output.slug}/${name}`) !== text) throw Error(`Stale generated file: ${output.slug}/${name}`);
      for (const asset of output.assetPaths) if (!fs.readFileSync(path.join(destination, asset)).equals(fs.readFileSync(path.join(ROOT, 'src', asset)))) throw Error(`Changed asset: ${asset}`);
    }
    if (!check && !verify) {
      fs.mkdirSync(destination, { recursive: true });
      for (const [name, text] of files) fs.writeFileSync(path.join(destination, name), text);
      for (const asset of output.assetPaths) {
        fs.mkdirSync(path.dirname(path.join(destination, asset)), { recursive: true });
        fs.copyFileSync(path.join(ROOT, 'src', asset), path.join(destination, asset));
      }
    }
  }
  verifyFrozen();
  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check', '--verify'].includes(arg))) throw Error('Usage: build-standard.mjs [--check | --verify]');
  const outputs = buildStandard({ check: args.includes('--check'), verify: args.includes('--verify') });
  console.log(`Validated ${outputs.map(output => output.slug).join(', ')}; shared case bodies and entry points preserved.`);
}
