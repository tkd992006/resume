import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT, verifyFrozen } from './build.mjs';
import { renderStandard, renderStandardCase, validateStandard } from './build-standard.mjs';
import { parseHtml, queryOne, textContent } from './html.mjs';

export const ORIGINAL_PROFILES = Object.freeze(['original']);
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const paragraph = value => `<p>${escape(value)}</p>`;
const heading = (eyebrow, title, id) => `<div class="section-heading"><p class="eyebrow">${eyebrow}</p><h2 id="${id}">${title}</h2></div>`;
const otherImages = {
  Gagageul: ['gagageul'], 'Local Jobs': ['local-jobs'], ChapterTwo: ['chaptertwo-1', 'chaptertwo-2'],
  'ClackClack Platform': ['clackclack-1', 'clackclack-2'], JoBonger: ['jobonger-1'],
  'Play AI SSO': ['playai-1'], 'SLOTHS ON THE RUN': ['sloths'], Hashmoss: ['hashmoss'],
};

export function renderOriginal() {
  const standard = renderStandard('simple');
  const { content, selectedCases } = standard;
  const common = JSON.parse(read('src/content/common.json')).fields;
  const assets = new Set(standard.assetPaths);
  const heroImages = ['onthemarket-app-1', 'syrs-1', 'gagageul', 'playai-1'];
  const imagePath = name => { const src = `assets/images/${name}.webp`; assets.add(src); return src; };
  const caseLink = id => `<a href="#${id}" data-solved-issue="${id}" aria-haspopup="dialog" aria-controls="${id}">${common[`caseSummaries.${id}.title`]} <span aria-hidden="true">↗</span></a>`;
  const ai = content.skills.find(skill => skill.items);
  const skills = content.skills.filter(skill => !skill.items);
  const education = content.experience.find(item => item.name === 'KAIST');
  const experience = content.experience.filter(item => item !== education);
  if (!ai || !education || skills.length !== 2) throw Error('Original layout expects the current two technical groups, AI experience and education');
  const projects = content.projects.map((project, index) => `<article class="project project-card${index === 0 ? ' feature-card' : ''}" id="project-${project.id}">
    <div class="project-header"><div><p class="project-kicker">${escape(project.period)} · ${escape(project.role)}</p><h3>${escape(project.name)}</h3><p class="project-subtitle">${escape(project.subtitle)}</p></div>${project.links?.length ? `<div class="project-links">${project.links.map(link => `<a href="${escape(link.href)}" target="_blank" rel="noreferrer">${escape(link.label)}</a>`).join('')}</div>` : ''}</div>
    <p>${escape(project.summary)}</p>
    <div class="project-grid current-project-grid"><div><h4>What I did</h4><ul>${project.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul></div><div class="project-aside"><div><h4>Result</h4>${paragraph(project.result)}</div>${project.stack ? `<div><h4>Tech Stack</h4><p class="current-stack">${escape(project.stack)}</p></div>` : ''}</div></div>
    <figure class="current-gallery"><div class="media-grid current-previews${project.images.length === 1 ? ' is-single' : ''}">${project.images.map((image, i) => `<button class="media-button contain-shot" type="button" data-lightbox="${escape(image.src)}" data-gallery="${project.id}"${i >= 2 ? ' hidden' : ''} aria-label="${escape(image.alt)} 확대"><img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"></button>`).join('')}</div><figcaption>${escape(project.caption)}</figcaption></figure>
    ${project.cases.length ? `<details class="project-details"><summary>개발 이야기 (${project.cases.length})</summary><div class="case-links">${project.cases.map(caseLink).join('')}</div></details>` : ''}
  </article>`).join('\n');
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(content.title)}</title><meta name="description" content="${escape(content.description)}"><meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="${escape(content.title)}"><meta property="og:description" content="${escape(content.description)}"><meta property="og:type" content="website"><meta property="og:url" content="https://tkd992006.github.io/resume/original/">
  <meta property="og:image" content="https://tkd992006.github.io/resume/original/assets/images/onthemarket-app-1.webp">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css">
</head>
<body class="original-portfolio">
  <a class="skip-link" href="#main">본문으로 바로 가기</a>
  <header class="site-header" aria-label="주요 메뉴"><a class="brand" href="#top">${escape(content.name)}</a><nav class="nav-links" aria-label="Portfolio sections"><a href="#ai-experience">AI</a><a href="#work">Experience</a><a href="#projects">Projects</a><a href="#skills">Skills</a><a href="#contact">Contact</a></nav></header>
  <main id="main" tabindex="-1"><div id="top"></div>
    <section class="hero" aria-labelledby="hero-title"><div class="hero-media" aria-hidden="true">${heroImages.map((name, i) => `<img class="hero-shot shot-${'abcd'[i]}" src="${imagePath(name)}" alt="" decoding="async">`).join('')}</div><div class="hero-scrim" aria-hidden="true"></div><div class="hero-content"><p class="eyebrow">${escape(content.role)}</p><h1 id="hero-title">${escape(content.name)}</h1><p class="hero-lead">${escape(content.lead)}</p><div class="hero-actions" aria-label="주요 링크"><a class="action primary" href="#projects">Selected work</a><a class="action" href="mailto:${escape(content.email)}">Email</a><a class="action" href="${escape(content.github)}" target="_blank" rel="noreferrer">GitHub</a></div></div></section>
    <section class="profile section" id="about" aria-labelledby="profile-title">${heading('Profile', '소개', 'profile-title')}<div class="profile-copy">${content.about.map(paragraph).join('')}</div></section>
    <section id="ai-experience" class="section ai-section" aria-labelledby="ai-title">${heading('AI Experience', escape(ai.title), 'ai-title')}<div class="ai-card"><div class="ai-timeline" aria-label="사용해본 AI 도구">${ai.tools.split(' · ').map(tool => `<span>${escape(tool)}</span>`).join('')}</div><div class="ai-copy">${ai.items.map(paragraph).join('')}</div></div></section>
    <section id="education" class="section education-section" aria-labelledby="education-title">${heading('Education &amp; Etc.', '학력과 기타 경험', 'education-title')}<div class="education-grid"><article><h3>${escape(education.name)}</h3>${paragraph(education.role)}${paragraph(education.period)}${education.description ? paragraph(education.description) : ''}</article><article><h3>Etc.</h3>${content.etc.map(paragraph).join('')}</article></div></section>
    <section id="work" class="section" aria-labelledby="work-title">${heading('Experience', '경력', 'work-title')}<div class="timeline">${experience.map(item => `<article class="timeline-item"><div class="timeline-date">${escape(item.period)}</div><div class="timeline-body"><h3>${escape(item.name)}</h3><p class="role">${escape(item.role)}</p>${paragraph(item.description)}</div></article>`).join('')}</div></section>
    <section id="projects" class="section projects" aria-labelledby="projects-title">${heading('Selected Work', '대표 프로젝트', 'projects-title')}${paragraph(content.projectsIntro)}${projects}</section>
    <section id="solved-problems" class="section section-tight" aria-label="문제 해결 사례 전체"><details class="all-cases"><summary>문제 해결 사례 전체 보기</summary><div class="case-links">${selectedCases.map(caseLink).join('')}</div></details></section>
    <section id="other-projects" class="section" aria-labelledby="other-title">${heading('More Work', '그 외 프로젝트', 'other-title')}<details class="other-projects"><summary>프로젝트 ${content.otherProjects.length}개 보기</summary><div class="mini-project-grid">${content.otherProjects.map(project => { const images = otherImages[project.name] ?? []; return `<article class="mini-project${images.length ? '' : ' text-only'}">${images.length ? `<div class="mini-media${images.length > 1 ? ' two-up' : ''}">${images.map(name => `<img src="${imagePath(name)}" alt="${escape(project.name)} 제품 화면" loading="lazy" decoding="async">`).join('')}</div>` : ''}<h3>${escape(project.name)}</h3><p class="project-subtitle">${escape(project.subtitle)} · ${escape(project.period)}</p>${paragraph(project.description)}${project.links?.length ? `<div class="project-links">${project.links.map(link => `<a href="${escape(link.href)}" target="_blank" rel="noreferrer">${escape(link.label)} ↗</a>`).join('')}</div>` : ''}</article>`; }).join('')}</div></details></section>
    <section id="skills" class="section skills-section" aria-labelledby="skills-title">${heading('Skills', '기술 역량', 'skills-title')}<div class="skills-grid">${skills.map(skill => `<article class="skill-group"><h3>${escape(skill.title)}</h3><p class="current-tools">${escape(skill.tools)}</p>${paragraph(skill.description)}</article>`).join('')}</div></section>
    <section id="contact" class="contact-section" aria-labelledby="contact-title"><p class="eyebrow">Contact</p><h2 id="contact-title">${escape(content.name)}</h2><div class="contact-links"><a href="mailto:${escape(content.email)}">${escape(content.email)}</a><a href="${escape(content.github)}" target="_blank" rel="noreferrer">${escape(content.github.replace('https://', ''))}</a></div></section>
  </main>
  <footer class="site-footer"><span>${escape(content.name)} · ${escape(content.role)}</span><a href="#top">Back to top</a></footer>
  ${selectedCases.map(renderStandardCase).join('\n')}
  <dialog class="lightbox" id="lightbox" aria-label="프로젝트 화면 확대"><button class="lightbox-close" type="button" data-lightbox-close aria-label="확대 화면 닫기">×</button><figure><img alt=""><figcaption id="gallery-caption"></figcaption></figure><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="이전 이미지">← 이전</button><span id="gallery-position" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" data-gallery-step="1" aria-label="다음 이미지">다음 →</button></div></dialog>
  <script src="script.js" defer></script>
</body></html>\n`;
  const modern = read('src/standard.css');
  const caseStart = modern.indexOf('/* Case studies:');
  const caseEnd = modern.indexOf('/* Section focus');
  if (caseStart < 0 || caseEnd < caseStart) throw Error('Shared case style boundaries changed');
  const css = read('src/original/june24.css') + '\n' + modern.slice(caseStart, caseEnd) + '\n' + read('src/original/adaptations.css');
  return { ...standard, slug: 'original', html: html.replace(/[ \t]+$/gm, ''), css, assetPaths: [...assets] };
}

export function validateOriginal(output) {
  validateStandard(output);
  const provenance = JSON.parse(read('src/original/provenance.json'));
  const digest = crypto.createHash('sha256').update(read('src/original/june24.css')).digest('hex');
  if (digest !== provenance.sha256) throw Error('June 24 reference styles changed');
  const doc = parseHtml(output.html);
  const bodyText = textContent(doc, queryOne(doc, 'body')).replace(/\s+/g, ' ');
  const required = [];
  const add = (...items) => required.push(...items.filter(Boolean));
  const c = output.content;
  add(c.name, c.role, c.lead, ...c.about, ...c.etc, c.projectsIntro);
  c.skills.forEach(skill => add(skill.title, ...(skill.items ? skill.tools.split(' · ') : [skill.tools]), skill.description, ...(skill.items ?? [])));
  c.experience.forEach(item => add(item.name, item.period, item.role, item.description));
  c.projects.forEach(project => add(project.name, project.subtitle, project.period, project.role, project.summary, ...project.points, project.result, project.stack, project.caption, ...(project.links ?? []).map(link => link.label)));
  c.otherProjects.forEach(project => add(project.name, project.period, project.subtitle, project.description, ...(project.links ?? []).map(link => link.label)));
  for (const text of required) if (!bodyText.includes(text.replace(/\s+/g, ' '))) throw Error(`Missing current content: ${text}`);
  if (doc.nodes.some(node => node.attrs.id === 'ama' || node.attrs.href === '#ama')) throw Error('Removed AMA must not return');
  return { currentContentFields: required.length, caseStudies: output.selectedCases.length, assets: output.assetPaths.length };
}

export function buildOriginal({ check = false, verify = false } = {}) {
  verifyFrozen();
  const output = renderOriginal();
  validateOriginal(output);
  const destination = path.join(ROOT, 'original');
  const files = [['index.html', output.html], ['styles.css', output.css], ['script.js', output.script]];
  const paths = [...files.map(([name]) => name), ...output.assetPaths];
  for (const relative of ['', ...paths]) {
    const target = path.join(destination, relative);
    if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) throw Error(`Refusing symlink output: ${target}`);
    for (let dir = path.dirname(target); dir.startsWith(destination); dir = path.dirname(dir)) if (fs.existsSync(dir) && fs.lstatSync(dir).isSymbolicLink()) throw Error(`Refusing symlink directory: ${dir}`);
  }
  if (verify) {
    for (const [name, text] of files) if (read(`original/${name}`) !== text) throw Error(`Stale original/${name}`);
    for (const asset of output.assetPaths) if (!fs.readFileSync(path.join(destination, asset)).equals(fs.readFileSync(path.join(ROOT, 'src', asset)))) throw Error(`Changed original asset: ${asset}`);
  }
  if (!check && !verify) {
    fs.mkdirSync(destination, { recursive: true });
    for (const [name, text] of files) fs.writeFileSync(path.join(destination, name), text);
    for (const asset of output.assetPaths) { const target = path.join(destination, asset); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(ROOT, 'src', asset), target); }
  }
  verifyFrozen();
  return [output];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check', '--verify'].includes(arg))) throw Error('Usage: build-original.mjs [--check | --verify]');
  const [output] = buildOriginal({ check: args.includes('--check'), verify: args.includes('--verify') });
  console.log(JSON.stringify({ route: '/original/', ...validateOriginal(output) }));
}
