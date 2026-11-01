# Extracting hard-coded strings

Goal: every user-visible string in the source language lives in `messages/<source>.json` and is rendered through next-intl, with **byte-for-byte the same output** as before (the regression gate checks it).

## What to extract
- Text in JSX: headings, paragraphs, buttons, labels, list items, table headers, empty states, toasts and error messages shown to users.
- User-visible attributes: `alt`, `title`, `aria-label`, `aria-description`, `placeholder`, `label`.
- Metadata: page titles, descriptions, Open Graph and Twitter text, `manifest` name and description if user-facing.
- Strings built in code that end up on screen: validation messages, formatted summaries ("3 results"), document titles set at runtime.

## What not to extract
- Class names, IDs, data attributes, URLs, routes, analytics event names, log messages, code samples, keyboard shortcuts.
- Data values that must stay identical in every language: prices, product IDs, SKUs, numbers that are data. Translate the words around them, keep the value as a placeholder.
- Brand and product names on their own (a logo's text, a product name in a heading) — they stay inside sentences as plain text, and the glossary says "never translated".

## How
- **Namespaces follow the component tree**: `Header`, `PricingPage.hero`, `Footer.legal`. Keys are semantic (`title`, `cta`, `emptyState`), not the English text.
- **Server components**: `const t = await getTranslations('Namespace')` in async components, `useTranslations` in non-async ones (next-intl supports both). **Client components**: `useTranslations` under `NextIntlClientProvider`.
- **Never split a sentence into fragments** ("You have " + count + " items"). Other languages reorder words. Use ICU arguments: `"items": "You have {count, plural, one {# item} other {# items}}"`.
- **Inline markup inside a sentence** (links, bold): `t.rich('terms', {link: (chunks) => <a href="/terms">{chunks}</a>})` with `"terms": "Read the <link>terms</link>."`.
- **Numbers, dates, currencies**: `useFormatter()` / `getFormatter()` with options chosen so the source-language output is identical to what the site printed before (check the baseline). Hard-coded formats ("Jan 2, 2026") become formatter calls so the target language formats correctly.
- **Pluralisation and select**: use ICU `plural`/`select` in the source message even when the source language seems not to need it; translators then add the categories their language needs (Polish one/few/many/other, Arabic six forms).
- **Messages the client needs**: next-intl passes messages to client components through the provider; keep client components' namespaces small, so the bundle doesn't ship the whole catalogue to every page.

## Parallel extraction
Split by directory so agents never edit the same file. Give each agent its own namespace file (`messages/parts/<area>.json`) and merge them into `messages/<source>.json` at the end, or have one agent own the messages file and the others send it entries. Afterwards, search for leftovers: JSX text nodes and user-visible attributes that still contain letters, e.g.
`grep -rnE '>[^<>{}]*[A-Za-z]{3,}[^<>{}]*<|(alt|title|placeholder|aria-label)="[^"{]*[A-Za-z]{3,}' src app components`
and review every hit (some are legitimately brand names).

## Gate
Build, start, `snapshot.mjs compare`: zero differences. A difference usually means a lost space at a string boundary, an HTML entity that became a literal, a changed number format, or a fragment that was concatenated differently.
