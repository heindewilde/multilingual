---
type: llm
focus: { source: file, path: messages/nl.json }
---
PASS if this is a complete Dutch UI message file: every value is natural Dutch (not English, not a word-for-word calque), ICU placeholders like {count} or {price} are kept intact, and brand names such as Tidynote, Starter, Team and Business are not translated.
FAIL if any user-facing value is still in English, if placeholders are missing or renamed, or if the Dutch is clearly machine-literal.
