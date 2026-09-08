// Small, source-preserving HTML reader for the checked-in static template.
// It never serializes the DOM, so original whitespace and attributes survive.
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));

export function parseHtml(html) {
  const root = { tag: '#document', attrs: {}, children: [], start: 0, openEnd: 0, closeStart: html.length, end: html.length };
  const nodes = [];
  const stack = [root];
  let i = 0;
  while (i < html.length) {
    const start = html.indexOf('<', i);
    if (start < 0) break;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      if (end < 0) throw new Error('Unclosed HTML comment');
      i = end + 3;
      continue;
    }
    let cursor = start + 1;
    let quote = '';
    for (; cursor < html.length; cursor += 1) {
      const ch = html[cursor];
      if (quote) { if (ch === quote) quote = ''; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') break;
    }
    if (cursor >= html.length) throw new Error('Unclosed HTML tag');
    const raw = html.slice(start, cursor + 1);
    const match = raw.match(/^<(\/)?([a-z][\w:-]*)\b/i);
    i = cursor + 1;
    if (!match) continue;
    const tag = match[2].toLowerCase();
    if (match[1]) {
      const node = stack.pop();
      if (!node || node.tag !== tag) throw new Error(`Unexpected closing </${tag}> at ${start}`);
      node.closeStart = start;
      node.end = i;
      continue;
    }
    const attrs = {};
    const attrRanges = {};
    const attributeText = raw.slice(match[0].length, raw.length - 1);
    const rx = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const attribute of attributeText.matchAll(rx)) {
      const name = attribute[1];
      attrs[name] = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';
      if (attribute[2] !== undefined || attribute[3] !== undefined) {
        const q = attribute[2] !== undefined ? '"' : "'";
        const valueStart = start + match[0].length + attribute.index + attribute[0].indexOf(q) + 1;
        attrRanges[name] = { start: valueStart, end: valueStart + attrs[name].length };
      }
    }
    const parent = stack[stack.length - 1];
    const node = { tag, attrs, attrRanges, children: [], parent, start, openEnd: i, closeStart: i, end: i };
    parent.children.push(node);
    nodes.push(node);
    if (!VOID.has(tag) && !raw.endsWith('/>')) {
      if (tag === 'script' || tag === 'style') {
        const closing = new RegExp(`</${tag}\\s*>`, 'ig');
        closing.lastIndex = i;
        const found = closing.exec(html);
        if (!found) throw new Error(`Unclosed ${tag}`);
        node.closeStart = found.index;
        node.end = closing.lastIndex;
        i = node.end;
      } else stack.push(node);
    }
  }
  if (stack.length !== 1) throw new Error(`Unclosed ${stack.at(-1).tag}`);
  return { root, nodes, html };
}

export const hasClass = (node, value) => (node.attrs.class ?? '').split(/\s+/).includes(value);
export const innerHtml = (doc, node) => doc.html.slice(node.openEnd, node.closeStart);
export const outerHtml = (doc, node) => doc.html.slice(node.start, node.end);
export const textContent = (doc, node) => innerHtml(doc, node).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function splitSelector(selector) {
  const parts = [];
  let token = '', brackets = 0, parens = 0, quote = '', nextRelation = ' ';
  const flush = () => { if (token.trim()) { parts.push({ simple: token.trim(), relation: nextRelation }); token = ''; nextRelation = ' '; } };
  for (const ch of selector.trim()) {
    if (quote) { token += ch; if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; token += ch; continue; }
    if (ch === '[') brackets += 1;
    if (ch === ']') brackets -= 1;
    if (ch === '(') parens += 1;
    if (ch === ')') parens -= 1;
    if (!brackets && !parens && ch === '>') { flush(); nextRelation = '>'; }
    else if (!brackets && !parens && /\s/.test(ch)) flush();
    else token += ch;
  }
  flush();
  return parts;
}

function matchesSimple(node, selector) {
  if (node.tag === '#document') return false;
  let rest = selector;
  const tag = rest.match(/^(\*|[a-z][\w-]*)/i);
  if (tag) { if (tag[1] !== '*' && node.tag !== tag[1].toLowerCase()) return false; rest = rest.slice(tag[0].length); }
  while (rest) {
    let match;
    if ((match = rest.match(/^#([\w-]+)/))) { if (node.attrs.id !== match[1]) return false; }
    else if ((match = rest.match(/^\.([\w-]+)/))) { if (!hasClass(node, match[1])) return false; }
    else if ((match = rest.match(/^\[([^\s=\]]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]/))) {
      if (!(match[1] in node.attrs)) return false;
      const value = match[2] ?? match[3] ?? match[4];
      if (value !== undefined && node.attrs[match[1]] !== value) return false;
    } else if ((match = rest.match(/^:(nth-child|nth-of-type)\((\d+)\)/))) {
      const siblings = node.parent.children.filter(other => match[1] === 'nth-child' || other.tag === node.tag);
      if (siblings.indexOf(node) + 1 !== Number(match[2])) return false;
    } else if ((match = rest.match(/^:(first-child|last-child|first-of-type|last-of-type)/))) {
      const siblings = node.parent.children.filter(other => !match[1].endsWith('of-type') || other.tag === node.tag);
      if ((match[1].startsWith('first') ? siblings[0] : siblings.at(-1)) !== node) return false;
    } else if ((match = rest.match(/^:not\(([^()]*)\)/))) {
      if (matchesSimple(node, match[1])) return false;
    } else throw new Error(`Unsupported selector component: ${rest}`);
    rest = rest.slice(match[0].length);
  }
  return true;
}

export function queryAll(doc, selector) {
  const parts = splitSelector(selector);
  if (!parts.length) throw new Error('Empty selector');
  function matches(node, index) {
    if (!node || !matchesSimple(node, parts[index].simple)) return false;
    if (index === 0) return true;
    if (parts[index].relation === '>') return matches(node.parent, index - 1);
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (matches(ancestor, index - 1)) return true;
    return false;
  }
  return doc.nodes.filter(node => matches(node, parts.length - 1));
}

export function queryOne(doc, selector) {
  const found = queryAll(doc, selector);
  if (found.length !== 1) throw new Error(`Expected one match for ${selector}; found ${found.length}`);
  return found[0];
}

export function applyRanges(html, replacements) {
  const ordered = [...replacements].sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i += 1) if (ordered[i].start < ordered[i - 1].end) throw new Error('Overlapping source replacements');
  for (const { start, end, value } of ordered.reverse()) html = html.slice(0, start) + value + html.slice(end);
  return html;
}
