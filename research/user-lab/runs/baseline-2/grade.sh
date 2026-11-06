#!/usr/bin/env bash
# Grade a run of the second baseline on every held-out case, four cases at a time, then print its summary.
# Usage (from the repository root): research/user-lab/runs/baseline-2/grade.sh <run-folder> [log]
set -uo pipefail
run=$1; log=${2:-/dev/null}
here=research/user-lab/runs/baseline-2
for f in $here/cases/*.json; do
  task=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).task)' "$f")
  echo "$f $task"
done | xargs -P 4 -L 1 sh -c 'node research/user-lab/tools/grade-flag.mjs "$0" "$2" --task "$3" >> "$1" 2>&1 || echo "FAILED $2" >> "$1"' "$run" "$log"
node research/user-lab/tools/flag-summary.mjs "$run" --json "$run/summary.json"
