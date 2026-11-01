# Multilingual profile

## Project
- Framework: Next.js 16.4 (App Router)
- i18n library: next-intl 4.x
- Package manager: npm
- Source language: en (en-US)
- Locales: en, nl
- URL scheme: subdirectories, source unprefixed (localePrefix: "as-needed")
- Localised pathnames: no
- Locale detection/redirect: off (localeDetection: false); hreflang in HTML head and sitemap only (alternateLinks: false)

## Touchpoints
Every file a new locale must change. Each line: path — what to add.
- src/i18n/routing.ts — add the code to `locales`
- messages/<code>.json — new file, full copy of messages/en.json translated (types come from en.json via src/global.d.ts)
- src/content/<code>/blog/ — new directory, one .md per file in src/content/en/blog/, same filenames (slugs are not translated)
- src/i18n/metadata.ts — add the regional og:locale to OG_LOCALE (TypeScript fails until it is there)
- src/components/LanguageSwitcher.tsx — add the language's own name to LABELS (TypeScript fails until it is there)
- src/app/[locale]/layout.tsx — nothing per locale; but a new client component that calls useTranslations must add its namespace to `clientMessages`
- src/app/sitemap.ts — nothing; entries and alternates come from routing.locales and the posts that exist per locale
- src/content/plans.ts — nothing; prices and seats are shared, feature labels live in messages (PricingPage.features)

## Content groups
- ui — messages/en.json — short labels, page copy and meta titles/descriptions; ICU plurals in HomePage.articleCount and PricingPage.seats; prices are placeholders
- blog — src/content/en/blog/*.md — long-form; frontmatter title/description translated, `date` unchanged; keep code blocks untouched; internal links get the /<code> prefix

## Commands
- Install: npm ci
- Typecheck: npm run typecheck
- Lint: none configured
- Build: npm run build
- Serve built output: npm start
- Base URL when served: http://localhost:3000
- Production origin: https://tidynote.example

## Modules
- seo: on        # public marketing site; title ≤ 60, description 110–160
- hydration: on  # statically generated React
- ui-names: off  # copy does not describe third-party interfaces
- fact-checks: off  # prices are cited in PricingPage.metaDescription and Metadata.description; check-parity.mjs compares the numbers

## Fact checks
None yet. check-parity.mjs flags numbers that disappear from a translation.

## Lessons
- 2026-11-01 nl — kill the previous production server by port before each gate; a stale `next start` keeps serving the old build and every comparison passes
- 2026-11-01 nl — next-intl's `<Link locale="en">` renders /en/... (which 307-redirects); build switcher hrefs with getPathname so they equal the hreflang alternates
- 2026-11-01 nl — NextIntlClientProvider without a `messages` prop ships the whole catalogue to the client; pass only client namespaces
- 2026-11-01 nl — sitemap alternates must include x-default when the page head does; check-seo.mjs compares the two sets
- 2026-11-01 nl — Chrome extension unavailable: hydration was checked with headless Chrome over CDP (console + exceptions, probe first)
