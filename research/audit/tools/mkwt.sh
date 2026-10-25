#!/bin/bash
# A builder's worktree, on disk under .claude/worktrees/ (gitignored): /tmp is a RAM-backed tmpfs of 7.8 GB in this WSL and filled up
# on 2026-10-26 with worktrees and build copies. node_modules is a real directory of links into the main checkout, with
# @finance-tool/* pointing into the worktree itself (a plain symlink would resolve those packages to the main checkout).
# Usage: research/audit/tools/mkwt.sh <name> <branch>     Remove with: git worktree remove --force .claude/worktrees/<name>
set -e
MAIN=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
WT="$MAIN/.claude/worktrees/$1"
git -C "$MAIN" worktree add -b "$2" "$WT" main
mkdir -p "$WT/node_modules/@finance-tool"
for e in "$MAIN"/node_modules/* "$MAIN"/node_modules/.bin; do n=$(basename "$e"); [ "$n" = "@finance-tool" ] && continue; ln -s "$e" "$WT/node_modules/$n"; done
for p in engine schema pipeline; do ln -s ../../packages/$p "$WT/node_modules/@finance-tool/$p"; done
[ -e "$MAIN/site/node_modules" ] && ln -s "$MAIN/site/node_modules" "$WT/site/node_modules"
[ -e "$MAIN/packages/pipeline/node_modules" ] && ln -s "$MAIN/packages/pipeline/node_modules" "$WT/packages/pipeline/node_modules"
echo "$WT"
