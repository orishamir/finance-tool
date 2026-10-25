#!/bin/bash
cd /home/ori/dev/finance-tool/.claude/worktrees/wt-idref
npm run build -w site > research/specs/2026-10-26-id-ref/tools/build.log 2>&1
echo finished >> research/specs/2026-10-26-id-ref/tools/build.log
