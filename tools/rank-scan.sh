#!/bin/bash
# The ranking scan (about three minutes): the indices page computed over a grid of plans (tools/rank-scan.ts), then the flags
# (tools/rank-flags.mjs): results that deserve a look after a price list changes, such as an introducing broker cheaper than the
# broker that holds the account, two banks of one group apart, or a cost that falls as the money grows.
# Usage: npm run rank-scan -- <folder outside the repository>      (the grid is about 50 MB)
# To see what a change of the records did: scan into one folder before the change and into another after it, then
#   node tools/rank-diff.mjs <before>/grid.jsonl <after>/grid.jsonl
set -e
OUT=${1:?give a folder outside the repository for the grid and the flags}
mkdir -p "$OUT"
cd "$(dirname "$0")/.."
npx tsx tools/rank-scan.ts "$OUT/grid.jsonl" > "$OUT/scan.log"
node tools/rank-flags.mjs "$OUT/grid.jsonl" > "$OUT/flags.txt"
sed -n '1,22p' "$OUT/flags.txt" | cut -c1-240
echo "all flags: $OUT/flags.txt"
