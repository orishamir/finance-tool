#!/bin/sh
# Prints the Rule and Conditions lines of each rule-base block named on the command line.
for id in "$@"; do
  f=$(grep -l "^### $id " /home/ori/dev/finance-tool/.claude/worktrees/wt-scope/.claude/skills/il-finance/references/*.md | head -1)
  echo "=== $id ($(basename $f))"
  awk -v id="$id" '$0 ~ "^### "id" " {p=1; print; next} p && /^### / {p=0} p' "$f" | grep -E "^- (Rule|Conditions|Scope|Dimensions)" | sed 's/(https[^)]*)//g'
done
