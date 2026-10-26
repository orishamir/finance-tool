#!/bin/bash
# Builds the site in this worktree; the log goes beside this script.
cd /home/ori/dev/finance-tool/.claude/worktrees/wt-scope
npm run build -w site > research/specs/2026-10-25-rules-scope/tools/build.log 2>&1
echo "finished $?" >> research/specs/2026-10-25-rules-scope/tools/build.log
