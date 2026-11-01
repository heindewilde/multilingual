---
title: "How Tidynote sync works"
description: "Tidynote syncs every change within seconds and keeps working offline. This post explains how conflict handling works and what stays on your device."
date: "2026-05-02"
---

Sync is the feature people ask about most, so here is how it works.

## Offline first

Every note is saved on your device first. When you reconnect, changes upload within 5 seconds.

## Conflicts

If two devices edit the same note, Tidynote keeps both versions and asks you which one to keep.

```ts
// Notes are merged per paragraph, not per file.
const strategy = "paragraph";
```
