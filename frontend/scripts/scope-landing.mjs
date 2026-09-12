// One-off port helper: copies the FlowStep design CSS from the vidiocut
// reference build into the frontend app, scoping every selector under `.vcs`
// (the VidioCut site wrapper) so it can coexist with the editor/admin styles
// defined in index.css & pro.css. Run from e:\project\frontend:
//   node scripts/scope-landing.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '../../vidiocut/src/index.css'), 'utf8');

// Everything from the nav section onward is ported verbatim (scoped);
// tokens/reset/ambient layers are hand-written in the landing.css header.
const marker = '/* ============ nav ============ */';
const start = src.indexOf(marker);
if (start < 0) throw new Error('nav marker not found in vidiocut/src/index.css');
const lines = src.slice(start).split(/\r?\n/);

const prefixSel = (sel) =>
  sel
    .split(',')
    .map((part) => {
      const p = part.trim();
      if (!p) return part;
      if (p.startsWith('.vcs')) return p; // already scoped
      if (/^(html|body|:root)\b/.test(p)) return '.vcs'; // root-level → wrapper
      return `.vcs ${p}`;
    })
    .join(', ');

const out = [];
let depth = 0;
const stack = []; // { type: 'kf' | 'media', depth }
let selBuf = []; // pending selector-list continuation lines (e.g. ".reveal,")

for (const raw of lines) {
  const t = raw.trim();
  const opens = (raw.match(/{/g) || []).length;
  const closes = (raw.match(/}/g) || []).length;

  if (/^@(keyframes|media)\b/.test(t)) {
    stack.push({ type: t.startsWith('@keyframes') ? 'kf' : 'media', depth: depth + opens - closes });
    selBuf = [];
    out.push(raw);
    depth += opens - closes;
    continue;
  }

  const top = stack[stack.length - 1];
  const inKf = top && top.type === 'kf' && depth >= top.depth;

  if (opens > 0) {
    const i = raw.indexOf('{');
    const sel = [...selBuf, raw.slice(0, i)].join(' ').trim();
    if (!inKf && !t.startsWith('@')) out.push(`${prefixSel(sel)} ${raw.slice(i)}`);
    else out.push(`${sel} ${raw.slice(i)}`);
    selBuf = [];
  } else if (closes > 0) {
    selBuf = [];
    out.push(raw);
  } else if (t && !inKf && t.startsWith('.')) {
    // multi-line selector list — buffer until the opening brace
    selBuf.push(t);
    continue;
  } else {
    out.push(raw);
  }
  depth += opens - closes;
  while (stack.length && depth < stack[stack.length - 1].depth) stack.pop();
}


const target = join(here, '../src/styles/landing.css');
writeFileSync(target, out.join('\n'), 'utf8');
console.log(`landing.css written: ${out.length} lines`);
