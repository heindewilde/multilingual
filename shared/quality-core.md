# Quality core

These rules apply to every run of `make-multilingual` and `add-language`. They are not configurable. Each exists because skipping it shipped a real problem.

1. **Translate from the source language only.** The profile names it (`sourceLanguage`). Never translate from another translation: errors compound, and a wrong word in one language becomes the wrong word in the next.
2. **Full parity.** Every source string, page, article, FAQ entry and data field gets translated, with the same number of paragraphs, headings, list items and digits. A partial translation is how a site ends up with half its FAQ answered in one language. `scripts/check-parity.mjs` is the automated proof.
3. **An independent editing pass.** The agents that translate never review their own work. Automated checks cover keys, lengths, structure and numbers; they say nothing about whether the copy reads as if a native writer wrote it. In practice the review pass makes hundreds of edits after every automated check has passed: calques, wrong idioms, wrong grammatical gender, words that mean something else entirely.
4. **Commit before the review.** Reviewers edit the same files. The commit made before they start is the only point where the translator output can be captured on its own, so the review edits stay visible as their own diff.
5. **Never call a translation done before the editing pass.** Not in a summary, not in a PR title.
6. **No visible change before translation (make-multilingual).** Every refactoring step — installing the i18n library, moving routes, extracting strings, moving content files — must leave the source-language site rendering the same text at the same URLs. The regression gate compares against the baseline taken before the first edit.
7. **Facts stay facts.** Numbers, dates, prices, quotes and names must match the source exactly. If a reviewer finds an error in the source itself, fix it in the source and every translation only when the project's own data settles it; otherwise ask the user. Never guess.
8. **Report honestly.** If something was not verified — an official UI name, a claim, a page type — say so in the PR, as an unchecked item.
