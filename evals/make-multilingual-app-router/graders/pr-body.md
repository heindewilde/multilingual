---
type: llm
focus: { source: file, path: PR_BODY.md }
---
PASS if this pull request description (1) lists the decisions taken as defaults without confirmation, (2) reports a regression check showing the source-language pages are unchanged, (3) describes an editing or review pass on the translation by reviewers separate from the translators, and (4) lists at least one item as not verified or needing a native-speaker read.
FAIL if any of the four is missing.
