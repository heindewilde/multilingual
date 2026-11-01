# Module: fact-checks

On when the copy cites the project's own structured data: prices, ratings, limits, version numbers, dates. Translation is where such citations drift: a number gets dropped to fit a length limit, or a sentence is restructured so the number attaches to the wrong item.

The profile's "Fact checks" section lists commands that compare copy against data. When adding a language:
1. Pull real sentences that cite data from the new translation (not invented examples) and extend the checker's patterns to recognise that language's phrasing.
2. Add the new sentences as self-test fixtures, positive and negative, if the checker has a self-test.
3. **Plant one wrong value** in a citing sentence of the new language, run the checker, confirm it is flagged, and restore the file from a backup. A checker that reports "clean" because it cannot parse the language is worse than none.

If the project has no checker yet but the copy clearly cites data, offer to write one; do not write it silently.
