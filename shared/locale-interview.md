# Locale interview

Run this with AskUserQuestion before any agent starts. Agents working in parallel otherwise invent different URL slugs and translate the same term three different ways. Recommend a default for every question, based on the language's conventions and the existing locales. Record the answers in `.multilingual/locales/<code>.md` (see `profile-spec.md`); they go into every translator and reviewer brief.

Keep each question self-contained: the user may only see the question dialog.

1. **Language code and regional variant.** Use a bare code for routing and `hreflang` (`pt`, not `pt-BR`) unless the site will serve two variants of one language, plus a regional BCP-47 locale (`pt-BR`) and `og:locale` (`pt_BR`). Where variants differ a lot (pt-BR/pt-PT, es-ES/es-419, zh-Hans/zh-Hant, fr-FR/fr-CA), ask which audience to write for.
2. **URL segments.** Default: subdirectory `/<code>/`, source language unprefixed, source slugs kept. Only offer localised pathnames (e.g. `/de/preise` for `/pricing`) if the user wants them; they add a touchpoint for every route.
3. **Form of address.** Recommend the norm for that language's web and tech writing, not a literal mirror of the source. Examples: German "du" on most consumer sites, "Sie" for B2B and finance; French "vous"; Spanish "tú" (Spain) or "usted" in some LatAm contexts; Turkish "siz"; Japanese polite form (です・ます). Note gendered verb forms where the language has them (Polish past tense, Hebrew, Arabic) and ask the translators to prefer neutral phrasing.
4. **Glossary.** Propose translations for the site's recurring terms. Base them on what that language's own press and the relevant vendors' official UIs use, and say where they differ. Always include: product and brand names (default: never translated), the site's core nouns (e.g. plan, dashboard, workspace), and any term that has a loanword and a native option (e.g. "AI" vs "KI"/"IA"/"yapay zeka").
5. **Content slugs.** If articles or posts have slugs, ask whether to translate them. Translated slugs help search; they also need an explicit slug map so every language links the same pages.
6. **Script and layout.** Flag anything that grows the scope and plan it before starting:
   - right-to-left scripts (Arabic, Hebrew, Persian, Urdu): `dir="rtl"`, mirrored layout, logical CSS properties
   - CJK: no word spaces (line breaking, truncation, search), different title lengths, non-Latin slugs
   - casing rules: Turkish dotted/dotless i (`toUpperCase` and regex `i` flag behave differently), German ß
   - fonts that lack the script's glyphs

Also confirm, once per project (make-multilingual only): the source language, which content is in scope (UI strings, Markdown/MDX, data files), and whether visitors should be auto-redirected by browser language (recommend: no — let search engines index every language and offer a switcher).
