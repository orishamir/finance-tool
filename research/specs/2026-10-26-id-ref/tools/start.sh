#!/bin/bash
cd /home/ori/dev/finance-tool/.claude/worktrees/wt-idref
node research/specs/2026-10-26-id-ref/tools/serve.mjs site/build/client 4233 > /dev/null 2>&1 &
echo $! > research/specs/2026-10-26-id-ref/tools/pid
