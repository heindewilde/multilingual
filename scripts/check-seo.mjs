#!/usr/bin/env node
/**
 * Audits the multilingual SEO of a served production build: every page it is given must
 * return 200 with <html lang>, a self-referencing canonical, a localised title and
 * description within limits, og:locale, and a reciprocal hreflang set with x-default.
 * Every hreflang target is fetched too, and must point back.
 *
 *   node check-seo.mjs --base http://localhost:3000 --sitemap /sitemap.xml
 *   node check-seo.mjs --base http://localhost:4173 --urls urls.txt
 *   node check-seo.mjs --base http://localhost:3000 --paths /,/nl,/nl/pricing
 *
 * Options:
 *   --site-url https://example.com   the production origin used in canonical/hreflang URLs;
 *                                    rewritten to --base for fetching (default: taken from
 *                                    the first canonical found)
 *   --title-max 60 --desc-min 110 --desc-max 160   length limits (set 0 to skip)
 *   --no-og                           don't require og:locale
 *   --single-locale                   site has one locale so far: don't require hreflang
 *   --concurrency 8
 *
 * Exit code 1 on any failure.
 */

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(name);

const base = (option('--base') ?? '').replace(/\/$/, '');
if (!base) {
  console.error('usage: check-seo.mjs --base <url> (--sitemap <path> | --urls <file> | --paths <a,b,c>)');
  process.exit(2);
}
let siteUrl = option('--site-url')?.replace(/\/$/, '');
const TITLE_MAX = Number(option('--title-max', 60));
const DESC_MIN = Number(option('--desc-min', 110));
const DESC_MAX = Number(option('--desc-max', 160));
const requireOg = !flag('--no-og');
const singleLocale = flag('--single-locale');
const concurrency = Number(option('--concurrency', 8));

const failures = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);

// --- HTML parsing (attribute order and case vary between frameworks) --------------------

const NAMED = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return NAMED[e.toLowerCase()] ?? m;
  });
const parseAttrs = (tag) => {
  const attrs = {};
  for (const m of tag.matchAll(/([^\s=<>"'/]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attrs[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? '');
  }
  return attrs;
};
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => parseAttrs(m[0]));

const analyse = (html) => {
  const head = html.split(/<\/head>/i)[0];
  const htmlTag = tags(html, 'html')[0] ?? {};
  const links = tags(head, 'link');
  const metas = tags(head, 'meta');
  const meta = (key, value) => metas.find((m) => m[key]?.toLowerCase() === value)?.content;
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return {
    lang: htmlTag.lang,
    canonical: links.find((l) => l.rel?.toLowerCase() === 'canonical')?.href,
    alternates: links
      .filter((l) => l.rel?.toLowerCase() === 'alternate' && l.hreflang)
      .map((l) => ({ hreflang: l.hreflang, href: l.href })),
    title: title === undefined ? undefined : decode(title).trim(),
    description: meta('name', 'description'),
    ogLocale: meta('property', 'og:locale'),
  };
};

// --- URL helpers ------------------------------------------------------------------------

const normalise = (u) => {
  const url = new URL(u);
  url.hash = '';
  url.search = '';
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString().replace(/\/$/, '');
};
const toFetchUrl = (u) => (siteUrl && u.startsWith(siteUrl) ? base + u.slice(siteUrl.length) : u);
const toSiteUrl = (u) => (siteUrl && u.startsWith(base) ? siteUrl + u.slice(base.length) : u);

const cache = new Map();
const load = (url) => {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { redirect: 'manual' })
        .then(async (res) => ({ status: res.status, location: res.headers.get('location'), html: res.status === 200 ? await res.text() : '' }))
        .catch((e) => ({ status: 0, error: e.message, html: '' })),
    );
  }
  return cache.get(url);
};

// --- page list --------------------------------------------------------------------------

const pagesFromSitemap = async (path) => {
  const res = await load(base + path);
  if (res.status !== 200) {
    console.error(`sitemap ${path} returned ${res.status || res.error}`);
    process.exit(1);
  }
  const locs = [...res.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decode(m[1]));
  if (/<sitemapindex/i.test(res.html)) {
    const nested = await Promise.all(locs.map((l) => pagesFromSitemap(new URL(l).pathname)));
    return nested.flat();
  }
  // Remember sitemap alternates so they can be compared with each page's hreflang set.
  for (const block of res.html.split(/<\/url>/i)) {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    const alts = [...block.matchAll(/<xhtml:link\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
    if (alts.length) sitemapAlternates.set(normalise(decode(loc)), alts.map((a) => `${a.hreflang}=${normalise(a.href)}`).sort());
  }
  return locs;
};
const sitemapAlternates = new Map();

let pages;
if (option('--sitemap')) pages = await pagesFromSitemap(option('--sitemap'));
else if (option('--urls')) {
  const { readFileSync } = await import('node:fs');
  pages = readFileSync(option('--urls'), 'utf8').split(/\s+/).filter(Boolean);
} else if (option('--paths')) pages = option('--paths').split(',').map((p) => base + p.trim());
else {
  console.error('give --sitemap, --urls or --paths');
  process.exit(2);
}
if (!pages.length) {
  console.error('no pages to check');
  process.exit(1);
}

// Infer the production origin from the sitemap if not given.
if (!siteUrl) {
  const first = new URL(pages[0]);
  if (first.origin !== new URL(base).origin) siteUrl = first.origin;
}

// --- checks -----------------------------------------------------------------------------

const checkPage = async (pageUrl) => {
  const fetchUrl = toFetchUrl(pageUrl);
  const expected = normalise(toSiteUrl(fetchUrl));
  const label = new URL(fetchUrl).pathname;
  const res = await load(fetchUrl);
  if (res.status !== 200) {
    return fail(label, `returned ${res.status || res.error}${res.location ? ` → ${res.location}` : ''}`);
  }
  const p = analyse(res.html);

  if (!p.lang) fail(label, 'no <html lang>');
  if (!p.canonical) fail(label, 'no canonical');
  else if (normalise(new URL(p.canonical, expected).toString()) !== expected) {
    fail(label, `canonical is ${p.canonical}, expected ${expected}`);
  }
  if (!p.title) fail(label, 'no <title>');
  else if (TITLE_MAX && p.title.length > TITLE_MAX) fail(label, `title is ${p.title.length} chars (max ${TITLE_MAX}): ${p.title}`);
  if (!p.description) fail(label, 'no meta description');
  else {
    if (DESC_MAX && p.description.length > DESC_MAX) fail(label, `description is ${p.description.length} chars (max ${DESC_MAX})`);
    if (DESC_MIN && p.description.length < DESC_MIN) fail(label, `description is ${p.description.length} chars (min ${DESC_MIN})`);
    if (/(…|\.\.\.)$/.test(p.description)) fail(label, 'description ends in an ellipsis — shorten it at the source');
  }
  if (requireOg && !p.ogLocale) fail(label, 'no og:locale');

  if (!p.alternates.length) {
    if (!singleLocale) fail(label, 'no hreflang alternates');
    return;
  }
  const alts = p.alternates.map((a) => ({ ...a, href: normalise(new URL(a.href, expected).toString()) }));
  const self = alts.find((a) => a.href === expected && a.hreflang !== 'x-default');
  if (!self) fail(label, 'hreflang set has no self-reference');
  else if (p.lang && !p.lang.toLowerCase().startsWith(self.hreflang.toLowerCase().split('-')[0])) {
    fail(label, `html lang "${p.lang}" does not match its hreflang "${self.hreflang}"`);
  }
  if (!alts.some((a) => a.hreflang === 'x-default')) fail(label, 'hreflang set has no x-default');
  const seen = new Set();
  for (const a of alts) {
    if (seen.has(a.hreflang)) fail(label, `hreflang ${a.hreflang} listed twice`);
    seen.add(a.hreflang);
  }

  // Reciprocity: every target must exist and list this page under the same hreflang.
  for (const a of alts) {
    if (a.href === expected) continue;
    const other = await load(toFetchUrl(a.href));
    if (other.status !== 200) {
      fail(label, `hreflang ${a.hreflang} → ${a.href} returned ${other.status || other.error}`);
      continue;
    }
    const back = analyse(other.html).alternates.map((x) => ({ ...x, href: normalise(new URL(x.href, a.href).toString()) }));
    if (self && !back.some((x) => x.hreflang === self.hreflang && x.href === expected)) {
      fail(label, `hreflang ${a.hreflang} → ${a.href} does not link back with hreflang ${self.hreflang}`);
    }
  }

  const fromSitemap = sitemapAlternates.get(expected);
  if (fromSitemap) {
    const fromPage = alts.map((a) => `${a.hreflang}=${a.href}`).sort();
    if (fromSitemap.join(' ') !== fromPage.join(' ')) fail(label, 'sitemap alternates differ from the page hreflang set');
  }
};

const queue = [...new Set(pages)];
await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) await checkPage(queue.shift());
  }),
);

for (const f of failures) console.log(`  FAIL  ${f}`);
if (failures.length) {
  console.log(`✗ ${failures.length} SEO failure(s) across ${pages.length} page(s)`);
  process.exit(1);
}
console.log(`✓ SEO: ${pages.length} page(s) pass (lang, canonical, title, description${requireOg ? ', og:locale' : ''}${singleLocale ? '' : ', reciprocal hreflang + x-default'})`);
