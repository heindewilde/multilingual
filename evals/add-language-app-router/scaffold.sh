#!/usr/bin/env bash
# Copies the fixture into the empty workspace and commits it, as a user's repo would be.
set -euo pipefail
src="$(cd "$(dirname "$0")/../../fixtures/app-router-marketing-nl" && pwd)"
cp -cR "$src"/. . 2>/dev/null || cp -R "$src"/. .

git init -q
git add -A
git -c user.email=eval@example.com -c user.name=eval commit -qm "Initial site"
