---
name: add-language
description: Add another language to a website that is already multilingual, at full parity with the source language, with an independent native-editor review and a build/SEO verification gate. Use when the user asks to add, launch or translate the site into a new language or locale (e.g. "add German", "launch a Japanese version"). For a site that has only one language, use make-multilingual instead.
argument-hint: "[language, e.g. German or de]"
---

# Add a language

You are adding one language (occasionally two) to a website that already has i18n in place, at full content parity with the source language. The output is a pull request on branch `feat/<code>-localisation` that passes the build and every check, and whose copy has been read by an independent editor in that language.

Read these first; they are part of this skill:
- `${CLAUDE_PLUGIN_ROOT}/shared/quality-core.md` — the non-negotiables. Follow every one.
- `${CLAUDE_PLUGIN_ROOT}/shared/pitfalls.md` — lessons from real runs.
- `${CLAUDE_PLUGIN_ROOT}/shared/profile-spec.md` — the project profile format.

## 0. Load the project profile

Read `.multilingual/profile.md` and every `.multilingual/locales/*.md`.

- **No profile, but the site is multilingual** (it already serves at least two languages): build one with `references/discovery.md`, show it to the user, and commit it before continuing.
- **The site has only one language**: stop and use the `make-multilingual` skill; adding the first translation needs i18n setup this skill does not do.
- **The requested language already exists**: say so and stop.

The profile tells you the source language, the touchpoints, the content groups, the commands and which modules are on. Everything below refers to it.

## 1. Interview

If you cannot ask questions (a non-interactive run, or AskUserQuestion is unavailable), don't stop: take the recommended default for every decision, write it to the locale file marked "(default, not confirmed)", and list every such assumption at the top of the PR body.

Run `${CLAUDE_PLUGIN_ROOT}/shared/locale-interview.md` with AskUserQuestion. Recommend a default for each decision from the language's conventions and the existing locale files. Write the answers to `.multilingual/locales/<code>.md`.

If the target language reads right-to-left, uses a non-Latin script or has special casing rules, tell the user the scope grows and plan those changes before starting.

## 2. Branch, slugs and plan

1. Create `feat/<code>-localisation` from an up-to-date default branch. Confirm the working tree is clean and the profile's build command passes before changing anything.
2. If content slugs are translated, write the new slug map first. Translators read it.
3. Check that no existing route or slug starts with the new code if locale detection uses a path prefix match.

## 3. Translators first, plumbing while they run

Launch one translation agent per content group from the profile, in the background, all briefed from `references/translator-brief.md`. Give each agent its own scratch folder. Large files (over ~50 KB): tell the agent to write in chunks.

While they run, apply every touchpoint in the profile, top to bottom. Typecheck with the profile's command after each group of edits. Strings you write yourself (language switcher label, SEO templates, fallback text) go on a list for the editing pass.

**Fact checks** (module): when the relevant translator finishes, extend the project's checkers with patterns built from real sentences in the new corpus, per `${CLAUDE_PLUGIN_ROOT}/shared/modules/fact-checks.md`.

## 4. Editing pass

When every translator has finished:

1. **Commit the plumbing and translations now**, before any reviewer starts.
2. **Survey terminology** across every file of the new language with a small script that counts competing terms per file (the glossary terms and their likely alternatives). Settle every split before briefing reviewers.
3. **Launch three reviewer agents** from `references/reviewer-brief.md`, none of which translated. Split them by the profile's content groups: UI strings and short copy; the largest long-form group; everything else. Each gets its own scratch folder.
4. **Have the strings you wrote yourself reviewed** — include them in the first reviewer's scope.
5. **Source errors.** Reviewers find errors in the source. Fix them in the source and every language when the project's own data settles the question; otherwise collect them for the user. Never guess.
6. **UI names** (module): verify localised third-party UI names per `${CLAUDE_PLUGIN_ROOT}/shared/modules/ui-names.md`.

Commit the review edits as their own commit, and source fixes as another.

## 5. Verify

Every check must pass. Report failures as failures.

1. The profile's typecheck and lint commands: no new errors compared with the default branch.
2. Parity: `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-parity.mjs --source <source file or dir> --target <new file or dir>` for every message file and content directory (add `--slug-map` when slugs are translated). Zero errors; read every warning.
3. Fact checks (module): the project's checkers pass, and a planted wrong value in the new language is flagged, then restored from a backup.
4. The profile's build command passes, and the number of generated pages grows by exactly one language's worth if the build reports it.
5. Serve the production build (profile command, or `node ${CLAUDE_PLUGIN_ROOT}/scripts/serve-static.mjs <dir>` for static output) and run `${CLAUDE_PLUGIN_ROOT}/shared/modules/seo.md` (module): `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-seo.mjs --base <url> --sitemap /sitemap.xml --site-url <production origin>`.
6. Hydration (module): per `${CLAUDE_PLUGIN_ROOT}/shared/modules/hydration.md`.
7. The language switcher: for a sample of pages, its target for the new language equals the page's hreflang alternate.
8. Bundle size, if the project ships a client bundle: measure the main entry chunk against the default branch and report the difference.

## 6. Pull request

The PR body covers: the locale decisions; the page count change; the editing pass (edits per area and the most significant fixes as before → after); source errors found and how each was handled; UI names verified and corrected; verification results; the bundle delta; and an unchecked item for anything not verified, at minimum "Native-speaker read".

Then:
- Add the locale to the profile's locale list and append one line per new lesson to its Lessons section.
- Update the project's own docs that list languages, if any (README, CONTRIBUTING, CLAUDE.md).

Don't merge unless the user asks. They decide when it ships.
