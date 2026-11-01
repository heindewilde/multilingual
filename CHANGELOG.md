# Changelog

## 0.1.2
- Hydration check: a deliberately mismatched control page (`scripts/mismatch-proxy.mjs`) replaces the console probe as proof that the browser capture can see hydration errors; console messages are not reliably kept across navigations, uncaught exceptions are. Wait for hydration on each page and confirm React attached.
- All four tested paths were checked for hydration in Chrome against the production server (37 pages, every page type in each new language): no errors.

## 0.1.1
- The project profile moved from `.claude/multilingual/` to `.multilingual/`. Claude Code protects `.claude/`, so writing the profile there needed a permission prompt and failed in unattended runs. Move an existing profile with `git mv .claude/multilingual .multilingual`.
- `snapshot.mjs` treats React's `<!-- -->` text separators as nothing (they caused false "$ 9" vs "$9" differences) and takes `--ignore-text` for intended additions such as the language switcher.
- Guidance from end-to-end runs: build switcher links with `getPathname` (`<Link locale>` renders a redirecting `/en/…`); pass only client namespaces to `NextIntlClientProvider`; stop the previous server before every gate; run checks in-process when no port can be bound.

## 0.1.0
- First release: `make-multilingual` and `add-language` for Next.js (App and Pages Router) with next-intl, plus `snapshot`, `check-parity`, `check-seo` and `serve-static`.
