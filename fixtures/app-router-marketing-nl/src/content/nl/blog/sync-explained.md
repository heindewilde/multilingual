---
title: "Notities synchroniseren: zo werkt het in Tidynote"
description: "Tidynote synchroniseert elke wijziging binnen enkele seconden en werkt ook offline. Lees hoe we conflicten afhandelen en wat er op je apparaat blijft."
date: "2026-05-02"
---

Over synchronisatie krijgen we de meeste vragen, dus hier lees je hoe het werkt.

## Offline als uitgangspunt

Elke notitie wordt eerst op je apparaat opgeslagen. Zodra je weer verbinding hebt, worden je wijzigingen binnen 5 seconden geüpload.

## Conflicten

Bewerken twee apparaten dezelfde notitie, dan bewaart Tidynote beide versies en vraagt je welke je wilt houden.

```ts
// Notes are merged per paragraph, not per file.
const strategy = "paragraph";
```
