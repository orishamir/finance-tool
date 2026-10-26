#!/usr/bin/env bash
# Fetch the raw wikitext of one Hebrew Wikisource page by title into work/<name>.wiki (curl, no bot workaround).
# usage: tools/wikiraw.sh <name> "<title>"
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; title="$2"
enc=$(python3 -I -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1].replace(" ", "_")))' "$title")
curl -sS -L --max-time 60 -A 'finance-tool-research/1.0 (personal, non-commercial)' -o "$here/work/$name.wiki" -w '%{http_code} %{size_download}\n' "https://he.wikisource.org/w/index.php?title=${enc}&action=raw"
