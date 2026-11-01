---
type: llm
---
PASS if the reply explains that this Pages Router site uses a static export (output: 'export'), that Next.js built-in i18n routing does not work with static export, and offers the user a choice (for example dropping static export, or moving to the App Router with prefixed URLs) instead of making the change.
FAIL if it went ahead and set up i18n or translated anything, or doesn't mention the static export limitation.
