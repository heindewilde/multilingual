# Discovery: building a profile for a site that is already multilingual

Use this when `add-language` runs on a site that serves two or more languages but has no `.multilingual/profile.md` — for example, a site localised by hand or by another tool. The goal is the profile described in `${CLAUDE_PLUGIN_ROOT}/shared/profile-spec.md`, above all an exact **touchpoint list**: every place a new locale must be added.

## Method: mirror the most recently added locale

The most reliable map of "what adding a language touches" is the last language someone added. Pick the newest non-source locale (git history: `git log --diff-filter=A --format='%ad %s' --date=short -- '**/<code>*'`, or ask the user) and find every reference to it.

1. **Search for the code in every form it takes.** For locale `it`: `"it"`, `'it'`, `/it/`, `/it"`, `it-IT`, `it_IT`, `IT_` (constants), `It` (identifiers like `getItArticle`), `labelIt`, `.it.json`, `content/it/`. Exclude the locale's own content directory from the listing but note its structure.
2. **Search for its URL segments**, which often don't contain the code: localised paths such as `/it/confronta` or `/it/chi-siamo`.
3. **Search for counts and lists of languages** in comments and docs ("six languages", "en, de, fr"); these go stale silently.
4. **Classify every hit** into: locale registry (types, config, routing), content files, content loaders, routes, metadata/SEO (hreflang, sitemap, og:locale, html lang), UI (language switcher, labels), build scripts, checks/tests, docs.
5. **Spot places that branch per language without naming the code** — a `switch` with a default, a map keyed by locale where the new key would be required by the type checker — by reading the files the search found.

Spend the effort here. A touchpoint missed now shows up later as a page that silently client-renders, a sitemap that skips the language, or a switcher that links to the wrong page.

## Then fill in the rest of the profile

- **Source language**: the language every other locale was translated from (usually the unprefixed one). Confirm with the user.
- **Content groups**: group content files by kind and size (UI messages, page copy, long-form articles, structured data) into three to five groups that agents can translate and review in parallel.
- **Commands**: read `package.json` scripts and CI config for install, typecheck, lint, build and serve. Run the build once to confirm it passes before any change.
- **Modules**: seo on if pages are public; hydration on for SSR/SSG React; ui-names on if the copy describes other products' interfaces; fact-checks on if copy cites structured data (prices, ratings, limits). Note existing checkers.
- **Per-locale files**: write `.multilingual/locales/<code>.md` for each existing locale from what the content shows (form of address, recurring terms). Mark anything inferred as "inferred".

Show the profile to the user, ask them to correct it, and commit it on its own before starting the language.
