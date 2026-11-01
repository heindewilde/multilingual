# Pitfalls

Generic lessons from real runs. Read before starting; add to the project profile's Lessons section when a project hits a new one.

## Process
- **Give every agent its own scratch folder.** Agents that share one overwrite each other's helper scripts (`dump.ts`, `check.ts`) and silently report on the wrong data.
- **Commit before launching reviewers.** Afterwards the translator output can no longer be separated from the review edits.
- **Decide slugs and the glossary first**, and write the slug map before any agent starts; agents read it.
- **Agents report what they could not verify.** Ask for an "unsure" list in every brief, and carry it into the PR.
- **Translators compress to fit length limits.** Meta descriptions in longer languages (German, Turkish, Polish) get squeezed and lose a clause. Reviewers should restore dropped meaning where it fits.
- **Reviewers find errors in the source.** Expect a few per language: stale facts, a claim the project's own data contradicts, a typo. Fix in every language when the data settles it; otherwise ask.

## Regular expressions over translated text
- JavaScript `\b` treats letters outside ASCII as non-word characters. A pattern starting or ending with "é", "ą" or "ş" needs `(?:^|\s)` / `(?=\s|$)` instead of `\b`.
- The `i` flag does not fold Turkish "İ" to "i", and `\b` never matches before "İ". Write `[İi]` explicitly, outside any `\b(...)` group.
- Anchor a pattern to the phrase you mean. A word that names a topic ("customisation") also appears in explanations, and a checker that matches the bare word misreads them.
- Prove every new pattern can see the new language: plant one wrong value, confirm it is flagged, restore the file from a backup.

## Verification
- **Stop the previous production server before every gate.** A stale `next start` on the same port keeps serving the old build, and every comparison then passes. Kill it by port (`lsof -ti :3000 | xargs kill`) and confirm the new server is the one answering.
- **Console capture in Chrome starts on the first `read_console_messages` call.** Call it once before loading the first page, then log a probe error. A run that skipped this returned "no messages", probe included, which looked like a pass.
- **Serve the built output the way production does.** Many preview servers fall back to the homepage for every unknown path, so every page "hydrates" against the wrong HTML. Use `scripts/serve-static.mjs` (exact file first, then `<path>/index.html`) for static exports, or the framework's own production server.
- **A hydration mismatch silently discards server-rendered HTML.** Common causes: `Math.random()`/`Date.now()` in render, locale-dependent formatting that differs between server and client, providers nested differently on server and client.
- **Shell grep wrappers can choke on long multibyte context.** Use a small Python or Node script to inspect translated files.
