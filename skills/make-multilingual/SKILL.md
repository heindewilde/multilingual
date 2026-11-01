---
name: make-multilingual
description: Turn a single-language Next.js website (App Router or Pages Router) into a multilingual one: set up next-intl with localised subdirectory URLs, extract hard-coded strings, localise Markdown/MDX content, add hreflang/sitemap SEO and a language switcher, then ship the first extra language with full-parity translation and an independent native-editor review. Use when the user wants to translate, localise or internationalise (i18n) a site that currently has one language, or asks to "make the site multilingual" or "add a Spanish version" to a monolingual site.
argument-hint: "[first target language, e.g. Spanish]"
---

# Make a site multilingual

You are turning a website that currently serves one language into a multilingual one, and shipping its first extra language. The result is one pull request: the site's source-language pages look and read exactly as before, every page also exists in the new language at `/<code>/…`, search engines can see every language version, and the translation has been reviewed by independent editors.

Read these first; they are part of this skill:
- `${CLAUDE_PLUGIN_ROOT}/shared/quality-core.md` — the non-negotiables. Follow every one.
- `${CLAUDE_PLUGIN_ROOT}/shared/pitfalls.md` — lessons from real runs.
- `${CLAUDE_PLUGIN_ROOT}/shared/profile-spec.md` — the profile you will write at the end.

**Scope (v1):** Next.js, App Router or Pages Router, with next-intl. Content in code and in repository files (JSON/YAML/TS data, Markdown, MDX). Not in scope: content in a headless CMS or a database, other frameworks. If the project is outside this scope, say so plainly and stop — don't improvise a half-supported setup.

## 1. Preflight

Find out, don't assume:
- **Framework and router**: `next` version in `package.json`; `app/` or `src/app/` (App Router), `pages/` or `src/pages/` (Pages Router), or both. Both: handle each router per its reference; App Router pages and Pages Router pages each get their own locale handling.
- **Output mode**: `output: 'export'` in `next.config.*` changes what is possible — see the router reference before going on.
- **Existing i18n**: `next-intl`, `next-i18next`, `react-i18next`, `i18n` in `next.config`, `[locale]`/`[lang]` segments, `messages/` or `locales/` directories. If the site already serves two or more languages, stop and use the `add-language` skill. If i18n is half set up with one locale, tell the user what you found and ask whether to build on it or replace it.
- **Package manager** (lockfile), **scripts** (build, start, lint, typecheck), **deploy target** if visible (`vercel.json`, Dockerfile).
- **Content**: where hard-coded copy lives (components, pages, layouts, metadata), where content files live (`content/`, `posts/`, `data/`), how they are loaded (fs, `import`, `@next/mdx`, Contentlayer/Velite, a CMS client — the last is out of scope).

Then:
1. Require a clean git tree. Create branch `feat/i18n-<code>`.
2. Run the build. It must pass before any change; if it doesn't, stop and report.
3. **Record the baseline.** Start the production server (`next start`, or `node ${CLAUDE_PLUGIN_ROOT}/scripts/serve-static.mjs out` for a static export) and run `node ${CLAUDE_PLUGIN_ROOT}/scripts/snapshot.mjs record --base <url> --out .multilingual-baseline.json` (add `--sitemap /sitemap.xml` if the site has one). Check the page count is plausible and that dynamic routes (blog posts, products) are included; add `--paths` for any the crawl missed. Add two or three known-missing paths (e.g. `--paths /,/pricing,/this-page-does-not-exist`) so the gate also proves 404s stay 404s. Keep the baseline file out of git (add it to `.gitignore`).

## 2. Interview

If you cannot ask questions (a non-interactive run, or AskUserQuestion is unavailable), don't stop: take the recommended default for every decision, write it to the locale file marked "(default, not confirmed)", and list every such assumption at the top of the PR body.

Use AskUserQuestion. Confirm what preflight detected, and ask, recommending a default each time:
- **Source language** (detected from `<html lang>` and the copy) and the **first target language**.
- **URL scheme**: subdirectories with the source language unprefixed (`/pricing` stays, `/es/pricing` is new) — recommended, keeps every existing URL and ranking. Localised pathnames (`/es/precios`) only on request.
- **Locale redirect**: recommend no automatic redirect by browser language (search engines must reach every version; people use the switcher).
- **Content scope**: confirm which content gets translated (all UI strings always; which content directories and data files).
- Then run `${CLAUDE_PLUGIN_ROOT}/shared/locale-interview.md` for the target language (variant, form of address, glossary, slugs, script issues).

Write the per-locale answers to `.multilingual/locales/<code>.md` now; the profile follows in step 7.

## 3. Plumbing — no visible change

Follow `references/nextjs-app-router.md` and/or `references/nextjs-pages-router.md` exactly, configured with **only the source locale**. Check every API against the docs for the installed next-intl and Next.js versions (next-intl.dev, nextjs.org) as you go — file names and APIs changed between Next 15 and 16 and between next-intl 3 and 4.

Then the **regression gate**: build, start, `node ${CLAUDE_PLUGIN_ROOT}/scripts/snapshot.mjs compare --base <url> --baseline .multilingual-baseline.json`. Zero differences. Typecheck and lint must be no worse than before. Commit ("Set up next-intl with the source locale only").

## 4. Extract strings

Follow `references/string-extraction.md`. Move every hard-coded user-visible string into `messages/<source>.json`, in namespaces that follow the component tree. Split the work by directory across parallel agents, each with its own scratch folder and a disjoint set of files, and one owner for merging into the messages file (or one namespace file per agent, merged at the end).

Regression gate again — zero differences — then commit ("Extract UI strings into messages/<source>.json").

## 5. Localise content files

Move content files into a per-locale layout and teach the loaders about the locale, per the router reference (e.g. `content/blog/post.mdx` → `content/en/blog/post.mdx`, loader takes `locale`). Data files with user-visible text (TS/JSON/YAML) get the same treatment: split translatable fields from data that must not be duplicated (prices, IDs, URLs), so a translation can never change a price.

Regression gate, commit ("Load content per locale").

## 6. SEO and language switcher

Follow `references/seo.md`: `<html lang>` per locale, self-referencing canonical, `hreflang` alternates with `x-default` in the HTML head, sitemap alternates, `og:locale`, localised metadata. Add a language switcher that links to the **same page** in the other language (not the other language's homepage), rendered as real `<a href>` links so crawlers can follow them.

With only the source locale configured, run `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-seo.mjs --base <url> --sitemap /sitemap.xml --site-url <production origin> --single-locale` and the regression gate. The switcher's labels are the one intended text change: from here on, pass them to the gate as `--ignore-text "<exact switcher text>"` (as it appears in the baseline diff), and nothing else. Commit ("Add multilingual SEO and a language switcher").

## 7. Write the profile

Write `.multilingual/profile.md` per `profile-spec.md`, from what you actually built: the exact touchpoints a new locale needs (by now you know every one — `routing.ts`, the messages file, content directories, switcher labels, any per-locale config), the content groups for translators and reviewers, the commands, the modules (seo on for public sites; hydration on; ui-names and fact-checks if the copy warrants), and a first Lessons line. Commit it.

## 8. Add the first language

Now run the `add-language` process for the target language, from its step 2 (the interview is done), following `${CLAUDE_PLUGIN_ROOT}/skills/add-language/SKILL.md` in full: translators per content group, touchpoints, commit before review, terminology survey, three independent reviewers, source errors, UI-name verification if on, and the complete verification — including `check-seo.mjs` without `--single-locale`, hydration in a browser, and `snapshot.mjs compare` one final time to prove the source language is still unchanged.

## 9. Pull request

One PR, commits in order: plumbing → extraction → content → SEO → profile → translations → review edits → fixes. The PR body explains, for a reader who wasn't there:
- what changed for visitors (new `/<code>/` URLs, the switcher, nothing else) and the regression-gate result proving the source language is unchanged
- the locale decisions
- the editing pass, source errors found, UI names verified
- every verification result, and the bundle-size change
- what the team does next time: run `/multilingual:add-language`, which reads `.multilingual/profile.md`
- unchecked items for anything not verified, at minimum "Native-speaker read"

Don't merge unless the user asks.
