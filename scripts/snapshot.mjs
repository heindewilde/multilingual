#!/usr/bin/env node
/**
 * Regression gate for refactoring a site into i18n: records what every page says, then
 * proves a later build still says exactly the same. Installing an i18n library, moving
 * routes under [locale] and extracting strings must not change a single visible word in
 * the source language.
 *
 *   node snapshot.mjs record  --base http://localhost:3000 --out .multilingual-baseline.json
 *   node snapshot.mjs compare --base http://localhost:3000 --baseline .multilingual-baseline.json
 *
 * Pages come from --sitemap <path>, --paths </a,/b>, or a same-origin crawl from "/"
 * (default, up to --max 500 pages). For each page it stores the HTTP status, <title>,
 * meta description, <html lang>, and the visible body text (scripts, styles and tags
 * removed, whitespace collapsed). `compare` re-fetches the baseline's own page list, so
 * a route that disappeared is caught, and reports every page whose status or text changed.
 */
import fs from 'node:fs';

const [mode, ...rest] = process.argv.slice(2);
const option = (name, fallback) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : fallback;
};
const base = (option('--base') ?? '').replace(/\/$/, '');
if (!['record', 'compare'].includes(mode) || !base) {
  console.error('usage: snapshot.mjs record|compare --base <url> [--sitemap <path> | --paths a,b] [--out file | --baseline file]');
  process.exit(2);
}
const max = Number(option('--max', 500));

const NAMED = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return NAMED[e.toLowerCase()] ?? m;
  });
const text = (html) =>
  decode(
    html
      .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const fetchPage = async (path) => {
  try {
    const res = await fetch(base + path, { redirect: 'manual' });
    const html = res.status === 200 ? await res.text() : '';
    const head = html.split(/<\/head>/i)[0];
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
    return {
      html,
      snap: {
        status: res.status,
        location: res.headers.get('location') ?? undefined,
        lang: html.match(/<html\b[^>]*\blang=["']?([^"'\s>]+)/i)?.[1],
        title: decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim(),
        description: decode(
          head.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0].match(/content=["']([^"']*)/i)?.[1] ?? '',
        ),
        text: text(body),
      },
    };
  } catch (e) {
    return { html: '', snap: { status: 0, error: e.message } };
  }
};

const discover = async () => {
  if (option('--paths')) return option('--paths').split(',').map((p) => p.trim());
  if (option('--sitemap')) {
    const xml = await (await fetch(base + option('--sitemap'))).text();
    return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  }
  // Same-origin crawl from the homepage.
  const seen = new Set(['/']);
  const queue = ['/'];
  const origin = new URL(base).origin;
  while (queue.length && seen.size < max) {
    const { html } = await fetchPage(queue.shift());
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)/gi)) {
      let url;
      try {
        url = new URL(decode(m[1]), base + '/');
      } catch {
        continue;
      }
      if (url.origin !== origin || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) continue;
      const path = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : '/';
      if (!seen.has(path) && seen.size < max) {
        seen.add(path);
        queue.push(path);
      }
    }
  }
  return [...seen];
};

if (mode === 'record') {
  const paths = await discover();
  const pages = {};
  for (const path of paths.sort()) pages[path] = (await fetchPage(path)).snap;
  const out = option('--out', '.multilingual-baseline.json');
  fs.writeFileSync(out, JSON.stringify({ base, recorded: new Date().toISOString(), pages }, null, 2));
  const bad = Object.entries(pages).filter(([, p]) => p.status !== 200);
  console.log(`✓ recorded ${paths.length} page(s) to ${out}${bad.length ? ` (${bad.length} not 200: ${bad.map(([p]) => p).join(', ')})` : ''}`);
} else {
  const baseline = JSON.parse(fs.readFileSync(option('--baseline', '.multilingual-baseline.json'), 'utf8'));
  const diffs = [];
  for (const [path, before] of Object.entries(baseline.pages)) {
    const after = (await fetchPage(path)).snap;
    for (const key of ['status', 'lang', 'title', 'description']) {
      if ((before[key] ?? '') !== (after[key] ?? '')) diffs.push(`${path}: ${key} was ${JSON.stringify(before[key])}, now ${JSON.stringify(after[key])}`);
    }
    if (before.text !== after.text) {
      const a = before.text ?? '';
      const b = after.text ?? '';
      let i = 0;
      while (i < a.length && a[i] === b[i]) i++;
      diffs.push(`${path}: body text differs at char ${i}: was "…${a.slice(Math.max(0, i - 40), i + 60)}…", now "…${b.slice(Math.max(0, i - 40), i + 60)}…"`);
    }
  }
  for (const d of diffs) console.log(`  DIFF  ${d}`);
  const n = Object.keys(baseline.pages).length;
  if (diffs.length) {
    console.log(`✗ ${diffs.length} difference(s) across ${n} page(s) — the source-language site changed`);
    process.exit(1);
  }
  console.log(`✓ ${n} page(s) unchanged since the baseline`);
}
