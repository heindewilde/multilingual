# Multilingual SEO for Next.js

Every page in every locale must have, in the served HTML: `<html lang>`, a self-referencing canonical, `hreflang` alternates for every locale that has the page plus `x-default`, a localised title and description, and `og:locale`. The sitemap lists every locale's URL with the same alternates. Verify with `scripts/check-seo.mjs`.

Put hreflang in the HTML head and the sitemap, and turn off next-intl's HTTP `Link` header (`alternateLinks: false` in `routing.ts`): one consistent set is easier to keep right than two, and some crawlers and audit tools read only the HTML.

## App Router: one helper, used by every `generateMetadata`

```ts
// src/i18n/metadata.ts
import type {Metadata} from 'next';
import {routing} from './routing';
import {getPathname} from './navigation';

const OG_LOCALE: Record<string, string> = {en: 'en_US', es: 'es_ES'}; // from .claude/multilingual/locales/*.md

/** Canonical, hreflang alternates (incl. x-default) and og:locale for one internal path. */
export function localeAlternates(locale: string, href: string): Pick<Metadata, 'alternates' | 'openGraph'> {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, getPathname({locale: l, href})]));
  return {
    alternates: {
      canonical: getPathname({locale, href}),
      languages: {...languages, 'x-default': getPathname({locale: routing.defaultLocale, href})}
    },
    openGraph: {locale: OG_LOCALE[locale]}
  };
}
```
Then in each page: `return {title: t('title'), description: t('description'), ...localeAlternates(locale, '/pricing')}`. Merge `openGraph` with any existing Open Graph fields rather than replacing them. Relative URLs resolve against `metadataBase`, which the root layout must set (e.g. `new URL('https://example.com')`). If a page exists only in some locales (content not yet translated), list only those in `languages`.

## Sitemap
`app/sitemap.ts` stays outside `[locale]` and emits one entry per locale per page, each with the full alternates set:
```ts
import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getPathname} from '@/i18n/navigation';

const host = 'https://example.com';
const pages = ['/', '/pricing', '/about']; // plus dynamic routes per locale

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: host + getPathname({locale, href}),
      alternates: {languages: Object.fromEntries(routing.locales.map((l) => [l, host + getPathname({locale: l, href})]))}
    }))
  );
}
```
If the site already had a sitemap, keep its other fields (`lastModified`, `priority`) and its page list; only add locales and alternates.

## Pages Router
One `<SeoHead>` component used by every page, built from `useRouter()` (`locale`, `locales`, `defaultLocale`, `asPath`): canonical for the current locale, one `<link rel="alternate" hrefLang>` per locale plus `x-default`, `og:locale`, and the translated title and description. Generate the sitemap with alternates the same way (a `pages/sitemap.xml.ts` with `getServerSideProps`, or the existing generator).

## Language switcher
- Link to the **same page** in the other language — the same URL its hreflang alternate gives — not to the other language's homepage.
- Real `<a href>` links, so crawlers can follow them. **App Router:** build each `href` with `getPathname({locale, href})` from `@/i18n/navigation`, the same function the hreflang alternates use. `<Link locale="en">` renders `/en/…` for the source locale, which then 307-redirects under `localePrefix: 'as-needed'`, so the switcher would disagree with hreflang. **Pages Router:** `<Link href={router.asPath} locale="…">`.
- Label each language in its own language ("Deutsch", "Español"), with `lang` and `hrefLang` attributes on the link.
- No flags for languages (a language is not a country).

## Don'ts
- Don't canonicalise translated pages to the source page: each locale's page is canonical to itself.
- Don't `noindex` translated pages, and don't block locale paths in `robots`.
- Don't redirect visitors by browser language on the root URL; it hides versions from crawlers.
