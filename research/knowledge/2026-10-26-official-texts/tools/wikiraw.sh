#!/usr/bin/env bash
# Fetch the raw wikitext of one Hebrew Wikisource page by title into work/wiki/<name>.wiki, plus its latest revision id and timestamp (curl, no bot workaround).
# usage: tools/wikiraw.sh <name> "<title>"
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; title="$2"; mkdir -p "$here/work/wiki"
enc=$(python3 -I -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1].replace(" ", "_")))' "$title")
ua='finance-tool-research/1.0 (personal, non-commercial; orishamir04 at gmail)'
curl -sS -L --max-time 60 -A "$ua" -o "$here/work/wiki/$name.wiki" -w "$name %{http_code} %{size_download}\n" "https://he.wikisource.org/w/index.php?title=${enc}&action=raw"
curl -sS -L --max-time 60 -A "$ua" -o "$here/work/wiki/$name.rev.json" "https://he.wikisource.org/w/api.php?action=query&prop=revisions&rvprop=ids%7Ctimestamp&format=json&titles=${enc}"
