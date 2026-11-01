# Next.js App Router + next-intl

Target: next-intl with locale-prefixed subdirectories, the source locale unprefixed, no browser-language redirect, and every page rendered exactly as before. Confirm each API against next-intl.dev and nextjs.org for the installed versions as you go; the shapes below are next-intl 4 on Next.js 15/16.

## Static export first
If `next.config` has `output: 'export'`: there is no proxy/middleware in a static export, so next-intl can only serve locales with `localePrefix: 'always'`, which would move every source URL under `/<source>/`. That changes existing URLs. **Stop and ask the user**, offering: (a) drop the static export and deploy on a Node/edge host, or (b) keep the export, accept `/<source>/` URLs, and add permanent redirects from the old URLs at the host. Don't proceed until they choose.

## Files

1. **Install** `next-intl` with the project's package manager.
2. **`src/i18n/routing.ts`** (or `i18n/routing.ts` without `src/`):
   ```ts
   import {defineRouting} from 'next-intl/routing';

   export const routing = defineRouting({
     locales: ['en'],            // source only during setup; add the target locale in add-language
     defaultLocale: 'en',
     localePrefix: 'as-needed',  // /pricing stays /pricing; /es/pricing is new
     localeDetection: false,     // no redirect by Accept-Language or cookie
     alternateLinks: false       // hreflang lives in the HTML head and sitemap instead (references/seo.md)
   });
   ```
3. **Proxy / middleware**: `src/proxy.ts` on Next.js 16+, `src/middleware.ts` on Next.js 15 and earlier (same content). If the project already has one, compose: run the existing logic and return the intl middleware's response, rather than replacing it.
   ```ts
   import createMiddleware from 'next-intl/middleware';
   import {routing} from './i18n/routing';

   export default createMiddleware(routing);

   export const config = {
     // Everything except API routes, Next internals and files with an extension.
     matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
   };
   ```
   Paths that contain a dot but are pages (e.g. `/users/jane.doe`) need an extra matcher entry.
4. **`src/i18n/navigation.ts`**:
   ```ts
   import {createNavigation} from 'next-intl/navigation';
   import {routing} from './routing';

   export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
   ```
5. **`src/i18n/request.ts`**: load messages for the request's locale. Use the form documented for the installed version (next-intl documents a `next/root-params` form for Next.js 16.3+; the `requestLocale` form works across versions):
   ```ts
   import {getRequestConfig} from 'next-intl/server';
   import {hasLocale} from 'next-intl';
   import {routing} from './routing';

   export default getRequestConfig(async ({requestLocale}) => {
     const requested = await requestLocale;
     const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
     return {
       locale,
       timeZone: 'Europe/Amsterdam', // the site's own zone: avoids server/client formatting mismatches
       messages: (await import(`../../messages/${locale}.json`)).default
     };
   });
   ```
6. **`next.config.*`**: wrap the existing config.
   ```ts
   import createNextIntlPlugin from 'next-intl/plugin';
   const withNextIntl = createNextIntlPlugin(); // pass the path if request.ts is not in the default location
   export default withNextIntl(nextConfig);
   ```
7. **`messages/<source>.json`**: start with `{}` or the first namespace; filled in step 4 of the skill.

## Move the routes under `[locale]`

- Move every page, layout, `loading`, `error`, `not-found`, `template`, route group and parallel/intercepting route from `app/` into `app/[locale]/`, keeping structure. Use `git mv` so history follows.
- **Stay at `app/`**: `api/` route handlers, `sitemap.ts`, `robots.ts`, `manifest.ts`, favicons and `icon.*`/`apple-icon.*`, and any route handler that is not a page.
- **The root layout becomes `app/[locale]/layout.tsx`** and is the only one rendering `<html>`:
  ```tsx
  import {NextIntlClientProvider, hasLocale} from 'next-intl';
  import {setRequestLocale} from 'next-intl/server';
  import {notFound} from 'next/navigation';
  import {routing} from '@/i18n/routing';

  export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
  }

  export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale); // keeps pages statically rendered; call it in every layout/page that is static
    return (
      <html lang={locale}>  {/* keep every existing attribute, class and font variable */}
        <body>
          <NextIntlClientProvider messages={pick(messages, CLIENT_NAMESPACES)}>{children}</NextIntlClientProvider>
        </body>
      </html>
    );
  }
  ```
  Without a `messages` prop the provider sends the **whole** catalogue to the browser on every page. Pass only the namespaces client components use (`const messages = await getMessages()` plus a small `pick` helper over a `CLIENT_NAMESPACES` list), and record that list as a touchpoint in the profile: a new client component that calls `useTranslations` must add its namespace there.

  Keep everything the old root layout did (fonts, providers, analytics, `metadataBase`) in the same order, so `useId`-based IDs and hydration don't shift.
- **Dynamic segments** (`[slug]`): `generateStaticParams` now runs per locale and receives `{locale}` from the parent; return the slugs that exist for that locale.
- **404s**: preserve existing behaviour. Add `app/[locale]/[...rest]/page.tsx` that calls `notFound()` so unknown paths under a locale render the localised not-found page, and check a known-missing path still returns 404.

## Links and navigation
Replace internal `next/link` and `next/navigation` (`useRouter`, `usePathname`, `redirect`) imports with the ones from `@/i18n/navigation`, so links keep the current locale. With only the source locale and `as-needed`, the rendered `href`s stay identical — the regression gate proves it. External links and anchors stay as they are.

## Static rendering
Compare the build's route table before and after: every route that was static (`○`) or SSG (`●`) must still be. A route turning dynamic (`ƒ`) usually means `setRequestLocale` (or the root-params setup) is missing in a layout or page, or `headers()`/`cookies()` crept in.

## Metadata
`generateMetadata` receives `params` with `locale`; read titles and descriptions with `getTranslations({locale, namespace})`. Canonical, alternates and `og:locale` are covered in `references/seo.md`.
