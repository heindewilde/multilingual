#!/usr/bin/env node
/**
 * Checks that a translation carries everything its source does. It cannot tell whether
 * the copy reads well — that is the editing pass's job — but it catches what translators
 * drop: missing message keys, lost placeholders, skipped paragraphs and headings, links
 * and numbers that vanished, and code blocks that were "translated".
 *
 *   node check-parity.mjs --source messages/en.json --target messages/nl.json
 *   node check-parity.mjs --source content/en --target content/nl [--slug-map slugs.json]
 *
 * Files: .json (message catalogues) and .md/.mdx/.markdown (content). In directory mode
 * every source file must have a target at the same relative path; --slug-map is a JSON
 * object mapping source file basenames (without extension) to target basenames, for
 * sites that translate content slugs.
 *
 * Options: --min-ratio 0.6   warn when a target text is shorter than this share of the source
 * Exit code 1 on any error. Warnings never fail the run.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const source = option('--source');
const target = option('--target');
const minRatio = Number(option('--min-ratio', 0.6));
const slugMap = option('--slug-map') ? JSON.parse(fs.readFileSync(option('--slug-map'), 'utf8')) : {};

if (!source || !target) {
  console.error('usage: check-parity.mjs --source <file|dir> --target <file|dir> [--slug-map map.json]');
  process.exit(2);
}

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// --- shared helpers --------------------------------------------------------------------

/**
 * Digit groups, ignoring the separators locales disagree on: "13,000" (en) and "13.000"
 * (de/tr) both yield [13, 000]; "19.90" and "19,90" both yield [19, 90]; "40%" and "%40"
 * both yield [40]. Compared as multisets, so word order may change.
 */
const digitGroups = (text) => (text.match(/\d+/g) ?? []).map((d) => d.replace(/^0+(?=\d)/, ''));
const missingFrom = (src, tgt) => {
  const pool = new Map();
  for (const d of tgt) pool.set(d, (pool.get(d) ?? 0) + 1);
  const missing = [];
  for (const d of src) {
    if (pool.get(d)) pool.set(d, pool.get(d) - 1);
    else missing.push(d);
  }
  return missing;
};

// --- JSON message catalogues -------------------------------------------------------------

const flatten = (obj, prefix = '', out = new Map()) => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  } else {
    out.set(prefix, obj);
  }
  return out;
};

/** ICU arguments ({count}, {name, plural, …}) and rich-text tags (<b>, </link>). */
const placeholders = (s) => {
  const args = [...s.matchAll(/\{\s*([A-Za-z_][\w]*)\s*(?:[,}])/g)].map((m) => `{${m[1]}}`);
  const tags = [...s.matchAll(/<\/?([A-Za-z][\w-]*)\s*\/?>/g)].map((m) => `<${m[1]}>`);
  return [...new Set([...args, ...tags])].sort();
};

const checkJson = (srcFile, tgtFile) => {
  let src, tgt;
  try {
    src = flatten(JSON.parse(fs.readFileSync(srcFile, 'utf8')));
  } catch (e) {
    return err(srcFile, `invalid JSON: ${e.message}`);
  }
  try {
    tgt = flatten(JSON.parse(fs.readFileSync(tgtFile, 'utf8')));
  } catch (e) {
    return err(tgtFile, `invalid JSON: ${e.message}`);
  }
  for (const [key, value] of src) {
    if (!tgt.has(key)) {
      err(tgtFile, `missing key ${key}`);
      continue;
    }
    const t = tgt.get(key);
    if (typeof value !== typeof t) {
      err(tgtFile, `${key} is ${typeof t}, source is ${typeof value}`);
      continue;
    }
    if (typeof value !== 'string') continue;
    if (value.trim() && !t.trim()) err(tgtFile, `${key} is empty`);
    const ps = placeholders(value).join(' ');
    const pt = placeholders(t).join(' ');
    if (ps !== pt) err(tgtFile, `${key} placeholders differ: source [${ps}] target [${pt}]`);
    const lost = missingFrom(digitGroups(value), digitGroups(t));
    if (lost.length) err(tgtFile, `${key} drops number(s) ${lost.join(', ')}`);
  }
  for (const key of tgt.keys()) if (!src.has(key)) warn(tgtFile, `extra key ${key} (not in source)`);
};

// --- Markdown / MDX ---------------------------------------------------------------------

const splitFrontmatter = (text) => {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? { fm: m[1], body: text.slice(m[0].length) } : { fm: '', body: text };
};
const frontmatterKeys = (fm) => [...fm.matchAll(/^([A-Za-z_][\w-]*)\s*:/gm)].map((m) => m[1]);

const analyseMarkdown = (text) => {
  const { fm, body } = splitFrontmatter(text);
  const codeBlocks = [];
  const prose = body.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, (block) => {
    codeBlocks.push(block.replace(/\s+$/g, ''));
    return '\n\n';
  });
  const withoutInlineCode = prose.replace(/`[^`\n]*`/g, '');
  const linkTargets = [...withoutInlineCode.matchAll(/\]\(([^)\s]+)/g)].map((m) => m[1]);
  const textOnly = withoutInlineCode
    .replace(/\]\(([^)]+)\)/g, ']')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');
  return {
    fmKeys: frontmatterKeys(fm).sort(),
    headings: [1, 2, 3, 4, 5, 6].map((level) => (prose.match(new RegExp(`^#{${level}}\\s`, 'gm')) ?? []).length),
    paragraphs: prose.split(/\n\s*\n/).filter((p) => p.trim()).length,
    listItems: (prose.match(/^\s*(?:[-*+]|\d+[.)])\s+/gm) ?? []).length,
    images: (prose.match(/!\[[^\]]*\]\(/g) ?? []).length,
    links: linkTargets.length,
    codeBlocks,
    digits: digitGroups(`${fm}\n${textOnly}`.replace(/^(?:date\w*|slug|icon)\s*:.*$/gim, '')),
    length: textOnly.replace(/\s+/g, ' ').trim().length,
  };
};

const checkMarkdown = (srcFile, tgtFile) => {
  const s = analyseMarkdown(fs.readFileSync(srcFile, 'utf8'));
  const t = analyseMarkdown(fs.readFileSync(tgtFile, 'utf8'));
  const missingKeys = s.fmKeys.filter((k) => !t.fmKeys.includes(k));
  if (missingKeys.length) err(tgtFile, `frontmatter missing ${missingKeys.join(', ')}`);
  s.headings.forEach((n, i) => {
    if (n !== t.headings[i]) err(tgtFile, `${'#'.repeat(i + 1)} headings: ${t.headings[i]}, source has ${n}`);
  });
  if (s.paragraphs !== t.paragraphs) err(tgtFile, `${t.paragraphs} blocks, source has ${s.paragraphs}`);
  if (s.listItems !== t.listItems) err(tgtFile, `${t.listItems} list items, source has ${s.listItems}`);
  if (s.links !== t.links) err(tgtFile, `${t.links} links, source has ${s.links}`);
  if (s.images !== t.images) err(tgtFile, `${t.images} images, source has ${s.images}`);
  if (s.codeBlocks.length !== t.codeBlocks.length) {
    err(tgtFile, `${t.codeBlocks.length} code blocks, source has ${s.codeBlocks.length}`);
  } else {
    s.codeBlocks.forEach((block, i) => {
      if (block !== t.codeBlocks[i]) warn(tgtFile, `code block ${i + 1} differs from the source (code is usually left untranslated)`);
    });
  }
  const lost = missingFrom(s.digits, t.digits);
  if (lost.length) err(tgtFile, `drops number(s) ${[...new Set(lost)].join(', ')}`);
  if (s.length && t.length / s.length < minRatio) {
    warn(tgtFile, `text is ${Math.round((100 * t.length) / s.length)}% of the source length — check nothing was abridged`);
  }
};

// --- dispatch ---------------------------------------------------------------------------

const MD = new Set(['.md', '.mdx', '.markdown']);
const checkFile = (srcFile, tgtFile) => {
  const ext = path.extname(srcFile).toLowerCase();
  if (ext === '.json') return checkJson(srcFile, tgtFile);
  if (MD.has(ext)) return checkMarkdown(srcFile, tgtFile);
  warn(srcFile, `skipped: no parity rules for ${ext} files`);
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

let compared = 0;
if (!fs.existsSync(source)) {
  console.error(`source not found: ${source}`);
  process.exit(2);
}
if (fs.statSync(source).isDirectory()) {
  if (!fs.existsSync(target)) {
    console.error(`target directory not found: ${target}`);
    process.exit(1);
  }
  const expected = new Set();
  for (const srcFile of walk(source)) {
    const rel = path.relative(source, srcFile);
    const ext = path.extname(rel);
    const base = path.basename(rel, ext);
    const mapped = path.join(path.dirname(rel), `${slugMap[base] ?? base}${ext}`);
    const tgtFile = path.join(target, mapped);
    expected.add(path.normalize(tgtFile));
    if (!fs.existsSync(tgtFile)) {
      err(tgtFile, `missing (source: ${srcFile})`);
      continue;
    }
    checkFile(srcFile, tgtFile);
    compared++;
  }
  for (const tgtFile of walk(target)) {
    if (!expected.has(path.normalize(tgtFile))) warn(tgtFile, 'has no source file');
  }
} else {
  if (!fs.existsSync(target)) {
    console.error(`target not found: ${target}`);
    process.exit(1);
  }
  checkFile(source, target);
  compared = 1;
}

for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
if (errors.length) {
  console.log(`✗ ${errors.length} parity error(s) across ${compared} file(s)`);
  process.exit(1);
}
console.log(`✓ parity: ${compared} file(s) match the source${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
