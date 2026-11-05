#!/usr/bin/env bash
# Put the site as it was live at a commit in $BASE/site/<sha>/finance-tool/ :
# the CI's own build (artifact "finance-tool-site") when GitHub still keeps it, otherwise a local build.
# Usage: site-at.sh <sha7> [base]
set -euo pipefail
sha=$1; base=${2:-/home/ori/dev/bench-wt}; repo=/home/ori/dev/finance-tool
out=$base/site/$sha
if [ -f "$out/.ok" ]; then echo "$out"; exit 0; fi
mkdir -p "$out" "$base/art"
id=$(awk -F'\t' -v s="$sha" '$2=="finance-tool-site" && $3=="false" && index($5,s)==1 {print $1; exit}' "$repo/research/user-lab/bench/raw/ci-artifacts.tsv" || true)
if [ -n "${id:-}" ]; then
  gh api "repos/orishamir/finance-tool/actions/artifacts/$id/zip" > "$base/art/$sha.zip"
  ( cd "$base/art" && rm -rf "x$sha" && mkdir "x$sha" && unzip -q -o "$sha.zip" -d "x$sha" && tar -xzf "x$sha/finance-tool-site.tar.gz" -C "$out" && rm -rf "x$sha" "$sha.zip" )
  echo ci > "$out/.ok"
else
  client=$("$repo/research/user-lab/bench/tools/build-at.sh" "$sha" "$base")
  mkdir -p "$out/finance-tool" && cp -r "$client/." "$out/finance-tool/"
  echo local > "$out/.ok"
  git -C "$repo" worktree remove --force "$base/$sha" >/dev/null 2>&1 || true
fi
echo "$out"
