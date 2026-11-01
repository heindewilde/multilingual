# Module: seo

On when the site has public, indexable pages. Off for apps behind a login.

For every locale and page type, the served HTML must have:
- `<html lang="<bcp47>">` for that locale
- a self-referencing canonical URL
- `<link rel="alternate" hreflang="…">` for every locale that has the page, plus `x-default` (normally the source-language URL); the set must be **reciprocal** — if A lists B, B lists A
- localised `<title>` and meta description within the project's limits (default: title ≤ 60 characters, description 110–160, no trailing "…")
- `og:locale` set to the regional locale (`nl_NL`), and `og:locale:alternate` optional
- sitemap entries for every locale, with `xhtml:link` alternates or one URL per locale

Verify with `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-seo.mjs --base <url> --sitemap /sitemap.xml` against the served production build. It fails on any of the above. Also check that the language switcher's target for each page equals that page's hreflang alternate for the target locale; a switcher that sends people somewhere other than the page search engines indexed is a common bug.
