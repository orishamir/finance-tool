#!/usr/bin/env bash
# Build the site as it was at a commit, in a throwaway worktree outside the repository.
# Usage: build-at.sh <sha> <worktrees-dir>   -> prints the path of the built client folder
set -euo pipefail
sha=$1; base=$2; repo=/home/ori/dev/finance-tool
wt=$base/$sha
if [ -f "$wt/.built" ]; then echo "$wt/site/build/client"; exit 0; fi
mkdir -p "$base"
if [ ! -d "$wt" ]; then git -C "$repo" worktree add --detach "$wt" "$sha" >/dev/null 2>&1; fi
# The lockfile has not changed since 2026-10-23, so the installed modules are the same; hard-link them in.
[ -e "$wt/node_modules" ] || cp -al "$repo/node_modules" "$wt/node_modules"
for d in site packages/engine packages/schema packages/pipeline; do
  if [ -d "$repo/$d/node_modules" ] && [ ! -e "$wt/$d/node_modules" ] && [ -d "$wt/$d" ]; then cp -al "$repo/$d/node_modules" "$wt/$d/node_modules"; fi
done
( cd "$wt" && npm run build >"$wt/.build.log" 2>&1 ) || { echo "BUILD FAILED $sha" >&2; tail -20 "$wt/.build.log" >&2; exit 1; }
touch "$wt/.built"
echo "$wt/site/build/client"
