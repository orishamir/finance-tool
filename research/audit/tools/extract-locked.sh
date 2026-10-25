#!/usr/bin/env bash
# Regenerates rule sources from the rule base and validates data/, under the same lock as figsrc.py (2026-10-25 source check).
# Run from the repo root: bash research/audit/tools/extract-locked.sh
set -e
LOCK=/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/rules.lock
mkdir -p "$(dirname "$LOCK")"
flock "$LOCK" npm run extract:sources -w @finance-tool/pipeline > /dev/null 2>"${TMPDIR:-/tmp}/extract-err.$$" || { cat "${TMPDIR:-/tmp}/extract-err.$$"; exit 1; }
sed -n '/## Headline/,/## Per rule/p' research/knowledge/2026-10-24-extraction-report.md | head -9
sed -n '/## Skipped inside a line/,/## Hosts missing/p' research/knowledge/2026-10-24-extraction-report.md | grep -c '^- ' | sed 's/^/skipped entries: /'
npm run validate 2>&1 | tail -6
