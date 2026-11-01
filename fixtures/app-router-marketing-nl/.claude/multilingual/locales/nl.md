# nl — Dutch

All decisions below were taken as recommended defaults in an unattended run: (default, not confirmed).

- BCP-47: nl-NL; og:locale: nl_NL (default, not confirmed)
- Variant/audience: Netherlands Dutch, not Flemish (default, not confirmed)
- URL prefix: /nl; localised segments: none — /nl/pricing, /nl/about, /nl/blog (default, not confirmed)
- Blog slugs: not translated — /nl/blog/sync-explained (default, not confirmed)
- Form of address: "je/jij" (informal), as usual for Dutch consumer software sites (default, not confirmed)
- Script notes: none (Latin script, no casing pitfalls)

## Glossary
- Tidynote, Starter, Team, Business, Markdown, SSO → never translated
- note → notitie (pl. notities); note-taking app → notitie-app
- sync (verb) → synchroniseren; sync (noun, the feature) → synchronisatie
- offline → offline
- plan (pricing) → abonnement (not "plan")
- subscription → abonnement
- pricing → prijzen (the page and price lists); "pricing" as how prices are set up → prijsstructuur (editing pass)
- free trial → gratis proefperiode
- workspace → werkruimte
- device → apparaat
- support → ondersteuning
- email → e-mail
- audit log → auditlog
- export → exporteren
- folder → map
- blog → blog, with the article "de blog" (settled in the terminology survey)
- business day → werkdag

## Decisions
- Prices stay in USD, written as in the source ("$9 per maand"); the amounts come from src/content/plans.ts (default, not confirmed)
- Numbers use Dutch separators: 10.000 (default, not confirmed)
- Dates are formatted by next-intl for nl: "2 mei 2026"
- The language switcher label for Dutch is "Nederlands"
