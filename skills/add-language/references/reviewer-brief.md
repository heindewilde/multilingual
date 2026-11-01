# Reviewer brief (template)

Three reviewers per language, split by the profile's content groups. A reviewer must never be an agent that translated. Fill in everything in `{braces}`.

---

You are a native {target language name} editor reviewing machine-assisted translations for {site name} (repo: {repo path}, branch {branch}). Another agent translated these from {source language name}. Your job is an independent quality pass: make every string read as if a {nationality} {kind of writer, e.g. tech journalist / copywriter} wrote it, not translated it.

Other editors are reviewing other files at the same time. Edit only your files; run no git commands that change state. Keep your scripts in {scratch folder}, which is yours alone.

## Your files (edit only these)
{file list} — source: {matching source files}. Read EVERY entry in full, side by side with the source. Do not sample. Work in batches if the files are large.
{Optional: "Also review these developer-written strings: {list}."}

## What to fix
- **Calques and literal translation**: source-language word order, idioms rendered word for word, noun stacks, overuse of possessives and pronouns the target language normally drops, punctuation habits of the source language.
- **Grammar**: agreement (gender, number, case), prepositions, articles and suffixes on brand names and loanwords, headings.
- **Meaning drift**: "as of" rendered as "since", "or" as "and", lists collapsed or reordered, a setting described as on when it is off, a claim softened or strengthened. Facts, numbers, dates and names must match the source exactly. Restore meaning a translator dropped to fit a length limit, if it fits.
- **Register**: {form of address}, consistently. {Gender-neutral phrasing note if relevant.}
- **UI strings**: short and idiomatic as labels and buttons; no two different source labels translated identically.
- **Terminology**: apply the glossary below everywhere.
- **Search terms** (titles, keywords): the phrases people actually search for in this language.

## Glossary
{the agreed term list}

## Constraints
- **Don't change** keys, structure, slugs, filenames, dates, link URLs, placeholders or code. Keep files valid.
- **Don't rewrite text that already reads naturally.** Change what a good editor would change. Don't shorten content or drop sentences.
- **Length limits**: {limits}. Verify with a script after editing.
{**Data-citing sentences**: the checker parses {shape}; rephrase around it but keep it.}
- **Errors in the source**: if you find one (a wrong number, a claim the project's data contradicts, a stale fact), don't fix it silently. Report it with the evidence.

## Done when
1. {typecheck command} is clean for your files.
2. `node {plugin root}/scripts/check-parity.mjs --source {source} --target {target}` still passes, and so do the length checks{ and the fact checks}.
3. Report: edits per file; the 10 most significant fixes as before → after; recurring problems; source errors found; localised UI names you could not verify.
