# Next.js Pages Router + next-intl

Target: Next.js built-in i18n routing (source locale unprefixed by default), next-intl for messages and formatting, no browser-language redirect, and every page rendered exactly as before. Confirm each API against nextjs.org and next-intl.dev for the installed versions.

## Static export first
Next.js built-in i18n routing does not work with `output: 'export'`. **Stop and explain** to the user, offering: (a) drop the static export and deploy on a Node host, or (b) migrate to the App Router, whose static export supports locales with prefixed URLs (`/<source>/…`, which changes existing URLs and needs redirects). Don't proceed until they choose.

## Setup

1. **Install** `next-intl`.
2. **`next.config.*`**:
   ```js
   module.exports = {
     // …existing config
     i18n: {
       locales: ['en'],       // source only during setup
       defaultLocale: 'en',   // served without a prefix
       localeDetection: false // no redirect by Accept-Language
     }
   };
   ```
   Next.js then sets `<html lang>` to the current locale and exposes `locale`, `locales` and `defaultLocale` on the router and in data-fetching contexts.
3. **`pages/_app.tsx`**:
   ```tsx
   import {NextIntlClientProvider} from 'next-intl';
   import {useRouter} from 'next/router';

   export default function App({Component, pageProps}) {
     const router = useRouter();
     return (
       <NextIntlClientProvider locale={router.locale} timeZone="Europe/Amsterdam" messages={pageProps.messages}>
         <Component {...pageProps} />
       </NextIntlClientProvider>
     );
   }
   ```
   Set `timeZone` explicitly: without it, dates can format differently on server and client and break hydration.
4. **Messages per page**: every page that renders translated text loads its messages in `getStaticProps` (or `getServerSideProps` if it already uses that):
   ```ts
   export async function getStaticProps({locale}) {
     return {props: {messages: (await import(`../messages/${locale}.json`)).default}};
   }
   ```
   Merge into existing `props` rather than replacing them. A page with no data fetching gets a `getStaticProps` added; it stays statically generated. To keep page payloads small, pass only the namespaces the page uses.
5. **Dynamic routes**: `getStaticPaths` receives `locales`; return one entry per locale and slug (`{params: {slug}, locale}`) for the slugs that exist in that locale. Keep the existing `fallback` value.

## Links
`next/link` and `useRouter().push` keep the current locale automatically in the Pages Router; switch language with `<Link href={router.asPath} locale="es">`. No import changes are needed.

## Metadata
Titles, descriptions, canonical, hreflang and `og:locale` go in `next/head`, built in one shared component (see `references/seo.md`). `_document` needs no `lang` change: Next.js sets it from the locale.

## Static rendering
Compare the build output before and after: pages that were static or SSG must stay so. API routes (`pages/api`) are unaffected by i18n routing.
