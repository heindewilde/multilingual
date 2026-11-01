# Translator brief (template)

One agent per content group. Fill in everything in `{braces}` from the profile and the locale file, and launch with `run_in_background: true`.

---

You are translating content for {site name} (repo: {repo path}, branch {branch}) from **{source language name}** into **{target language name} ({BCP-47})**. We are adding a new `{code}` locale, mirroring the existing `{reference locale}` locale for structure.

Edit ONLY the files listed under "Your files". Other agents are writing the other locale files and the plumbing at the same time; don't touch anything else, and don't run git commands that change state. Keep your helper scripts in {scratch folder}, which is yours alone.

## Your files (create them)
{each file: target path, what it mirrors, export names or structure, e.g.
- `messages/{code}.json`: same keys and nesting as `messages/{source}.json`
- `content/{code}/blog/*.mdx`: one file per file in `content/{source}/blog/`, same filenames (or the slug map)}
{Large files: "Write in chunks: create the file with the first batch, then append."}

## Source
**Translate from {source language name} only, never from another translation.** Use the `{reference locale}` files only to see structure. Source files: {list}.

**Full parity:** every entry, paragraph, heading, list item, FAQ question and data field. Same order, same count.

## Locale decisions (already made with the user)
- Form of address: {e.g. "du", "vous", "siz"}. {Neutral-phrasing note for gendered languages.}
- Variant/audience: {e.g. "Brazilian Portuguese: celular, tela, arquivo"}.
- URL paths and slugs: {prefix, localised segments, slug map location}.
- Glossary: {the agreed term list}.
- Product and brand names: {rule, e.g. never translated}.

## Rules
- **Natural copy.** It must read as if a native writer of that language wrote it, in the tone of the source: as direct, concrete and opinionated as the source is. Avoid calques and source-language word order. Idioms need idiomatic equivalents, not literal ones.
- **Facts must match the source exactly**: numbers, dates, prices, ratings, names, quotes. Write numbers as digits wherever the source does; local number formatting (decimal comma, % placement) is fine. Don't add or drop claims.
- **Product feature names**: keep the vendor's name. Where the vendor has an official localised UI name (settings paths, menu items), use your best knowledge and list it under "unsure".
- **Keep the markup**: Markdown headings, paragraph breaks, lists, links, components and code blocks. Never translate code, identifiers, URLs, placeholders (`{count}`, `<b>`) or ICU syntax keywords (`plural`, `one`, `other`); do translate the words inside ICU branches, and add the plural categories the target language needs (e.g. Polish one/few/many/other).
- **Internal links**: rewrite to the target locale's paths ({rules}). External links stay unchanged.
- **Length limits** (build-enforced): {e.g. titles ≤ 60 characters, descriptions 110–160, no trailing "…"}. Check every entry with a script.
{**Data-citing sentences** (fact-checks module): use one consistent, parseable shape, e.g. {shape}.}
- **Keep files valid**: JSON parses, TypeScript compiles, YAML frontmatter parses (quote values containing ": ").

## Done when
1. {typecheck command} shows no errors in your files (other agents' unfinished files may still error).
2. `node {plugin root}/scripts/check-parity.mjs --source {source path} --target {target path}` passes.
3. Your length script passes.
4. Report: files written, counts against the source, entries you shortened to fit limits, and everything you're unsure of — especially localised third-party UI names.
