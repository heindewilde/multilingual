# Project profile

The profile is how this plugin remembers a project. `make-multilingual` writes it from what it built; `add-language` reads it, follows it and appends to it. It lives in the user's repo and is committed with the code:

```
.claude/multilingual/
├── profile.md          # the project: stack, touchpoints, content groups, commands, modules
└── locales/
    ├── de.md           # per-locale decisions and glossary
    └── nl.md
```

Write it as Markdown with the headings below, so a person can read and edit it. Keep it factual: file paths, commands, decisions. No narrative.

## profile.md

```markdown
# Multilingual profile

## Project
- Framework: Next.js 16.4 (App Router)            # or "Pages Router", or both
- i18n library: next-intl 4.x
- Package manager: pnpm
- Source language: en (en-US)
- Locales: en, nl, de                                # source first, then in the order they were added
- URL scheme: subdirectories, source unprefixed (localePrefix: "as-needed")
- Localised pathnames: no                            # or: yes, defined in src/i18n/routing.ts
- Locale detection/redirect: off

## Touchpoints
Every file a new locale must change. Each line: path — what to add.
- src/i18n/routing.ts — add the code to `locales`
- messages/<code>.json — new file, full copy of messages/en.json translated
- content/<code>/ — new directory, mirror of content/en/
- src/app/sitemap.ts — nothing; alternates are generated from routing.locales
- src/components/LanguageSwitcher.tsx — add the language's own name to LABELS

## Content groups
How translator and reviewer agents split the work. Each group: name — files — notes.
- ui — messages/en.json — short labels; watch duplicates and plural forms
- pages — content/en/pages/*.mdx — marketing copy
- blog — content/en/blog/*.mdx — long-form; keep code blocks untouched

## Commands
- Install: pnpm install
- Typecheck: pnpm tsc --noEmit
- Lint: pnpm lint
- Build: pnpm build
- Serve built output: pnpm start            # or: node ${CLAUDE_PLUGIN_ROOT}/scripts/serve-static.mjs out
- Base URL when served: http://localhost:3000

## Modules
- seo: on        # public, indexable pages
- hydration: on  # server-rendered or statically generated React
- ui-names: off  # copy does not describe third-party product interfaces
- fact-checks: off

## Fact checks
Commands that verify translated copy against the project's own data (only when the fact-checks module is on).
- node scripts/check-prices.mjs — every price in copy matches data/plans.json

## Lessons
Appended after each run, newest last. One line each: date, locale, what to do differently.
- 2026-11-02 nl — reviewers need their own scratch folders; two overwrote each other's scripts
```

## locales/<code>.md

```markdown
# nl — Dutch

- BCP-47: nl-NL; og:locale: nl_NL
- Variant/audience: Netherlands Dutch (not Flemish)
- URL prefix: /nl; localised segments: none
- Form of address: "je" (informal)
- Script notes: none

## Glossary
- dashboard → dashboard
- sign up → aanmelden
- pricing → prijzen

## Decisions
- Product names stay in English (Acme Sync, Acme Vault)
- Currency stays USD, formatted with a decimal comma (19,90 USD)
```
