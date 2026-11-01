# Module: ui-names

On when the copy describes other products' interfaces: settings paths ("Settings > Privacy > Cookies"), feature names, menu items, store names. Translators write these from memory and get a meaningful share wrong (in one real run: 3 of ~12 Polish names and 2 of ~13 Turkish names).

After the editing pass, collect every localised UI name the reviewers listed as unverified and check each against the vendor's own localised sources, in this order of preference: the vendor's localised help/support pages, the product's published UI string files (e.g. Chromium `*.xtb`, Mozilla l10n repositories, open-source app `values-<code>/strings.xml`), the vendor's localised marketing pages. Delegate this to one research agent and ask for a table: item | our text | official name | verdict | source URL.

Apply the corrections, keep the English name where no localised source exists, and list anything still unverified in the PR.
