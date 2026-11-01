# multilingual

A Claude Code plugin that turns a single-language Next.js website into a multilingual one, then adds more languages, without the usual shortcuts: every page translated, every translation edited by an independent reviewer, and every language checked for SEO before it ships.

```
/multilingual:make-multilingual Spanish     # one-time: set up i18n and ship the first extra language
/multilingual:add-language German           # every language after that
```

You can also just ask: "make this site available in Spanish", "add a German version".

## What it does

**`make-multilingual`** (a site that has one language today)

1. Checks the project: Next.js version, App or Pages Router, static export, existing i18n, how content is loaded. Out-of-scope setups are reported, not improvised.
2. Records a **baseline** of every page's rendered text.
3. Asks you the decisions that matter, each with a recommended default: source and target language, URL scheme (default: `/es/…`, with your current URLs unchanged), no auto-redirect by browser language, form of address, glossary, which content to translate.
4. Sets up [next-intl](https://next-intl.dev) with only your current language, moves routes under `[locale]`, extracts hard-coded strings into message files and loads content per locale. After **each** step it rebuilds and compares every page against the baseline: the site must say exactly the same, word for word, before anything is translated.
5. Adds multilingual SEO — `<html lang>`, self-canonicals, reciprocal `hreflang` with `x-default`, sitemap alternates, `og:locale` — and a language switcher that links to the same page in the other language.
6. Writes a **project profile** (`.claude/multilingual/`) recording what a new language touches in your codebase.
7. Adds the first language through the `add-language` process below, and prepares one pull request.

**`add-language`** (a site that is already multilingual)

1. Reads the profile (or builds one by finding everywhere the most recent language is wired in).
2. Interviews you on the language: regional variant, URL segments, form of address, glossary.
3. Translates every file in parallel — from your source language only, never from another translation — while wiring the locale into the code.
4. Commits, then has **three independent reviewer agents** — none of which translated — edit the copy for natural phrasing, grammar, meaning drift and terminology. They also report errors they find in your source content.
5. Checks localised names of other products' interfaces (settings paths, feature names) against the vendors' own localised sources, when your copy mentions them.
6. Verifies: typecheck, lint, build, translation parity, SEO on the served production build, hydration in a browser if one is available, the language switcher, bundle size.
7. Opens a pull request listing every decision, every check, and anything that could not be verified.

## Why the review pass is not optional

Automated checks can prove that every key, paragraph, link and number survived translation. They cannot tell you that a sentence is a word-for-word calque, that a product's private mode was translated as "private *diving*", or that a cookie table now says "disabled" in the sense of a person with a disability. In practice the editing pass changes hundreds of strings per language after every automated check has already passed. The plugin will not call a translation done before that pass.

## Install

```
/plugin marketplace add heindewilde/multilingual
/plugin install multilingual@multilingual
```

## Scope (v0.1)

- **Next.js** with the **App Router** or the **Pages Router**, using **next-intl**.
- Content in the repository: UI strings in code, Markdown/MDX, JSON/YAML/TS data files.
- Not yet: other frameworks, content in a headless CMS or a database. Contributions welcome — see below.
- Static exports (`output: 'export'`) can't keep your existing URLs unprefixed; the plugin explains the options and asks before going on.

## The project profile

`make-multilingual` writes `.claude/multilingual/profile.md` and one `locales/<code>.md` per language into your repo. They record the source language, the files a new locale must touch, how content is split between agents, your build and check commands, and decisions such as the form of address and the glossary. Commit them: the next `add-language` run follows them, and appends what it learned.

## Bundled scripts

Zero-dependency Node scripts in `scripts/`, usable on their own:

| Script | What it checks |
|---|---|
| `snapshot.mjs record\|compare` | Every page's status, title, description, `lang` and visible text against a baseline |
| `check-parity.mjs` | A translation against its source: message keys, ICU placeholders, Markdown headings, paragraphs, lists, links, code blocks and numbers (locale number formats tolerated) |
| `check-seo.mjs` | Served pages: `lang`, self-canonical, title and description lengths, `og:locale`, reciprocal `hreflang` + `x-default`, sitemap alternates |
| `serve-static.mjs` | Serves a static export the way production hosts do (exact file, then `.html`, then `index.html`) |

## Cost

A run uses several parallel agents for translation and review, so it uses noticeably more tokens than a normal session: expect a full `make-multilingual` run on a small site to take tens of minutes and a sizeable share of a session's usage, growing with the amount of content.

## Contributing

The process lives in `shared/` and is framework-neutral; framework knowledge lives in each skill's `references/`. To add a framework, add a reference for it (setup, routing, content loading, SEO), extend the preflight in `skills/make-multilingual/SKILL.md`, and add a fixture and eval case under `fixtures/` and `evals/`. Run the suite with:

```
NEXT_TELEMETRY_DISABLED=1 claude plugin eval . --scaffold --trust-plugin --ablation none --runs 1 \
  --allow-tools Write Edit Bash "WebFetch(domain:registry.npmjs.org)"
```

## License

MIT
