---
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite, AskUserQuestion]
---

Can you translate our recipe site into Spanish? It should stay in English too.

You are running unattended: wherever you would ask me a question, take the recommended default. Commit on a feature branch, but do not push or open a pull request; write the pull request body you would use to PR_BODY.md instead. When you are completely done, write eval-result.txt with exactly four lines, each set from the actual command you ran: "BUILD: OK" or "BUILD: FAIL" (production build), "BASELINE: OK" or "BASELINE: FAIL" (the source-language pages unchanged against the baseline, or "BASELINE: N/A" if there was no baseline step), "SEO: OK" or "SEO: FAIL" (check-seo on the served build), "PARITY: OK" or "PARITY: FAIL" (check-parity for every translated file and directory). If a check cannot run exactly as written because of this environment (for example, no local port can be bound) but you ran an equivalent that exercises the same production code, record its real result and say in PR_BODY.md how it ran.
