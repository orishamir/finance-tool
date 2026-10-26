#!/usr/bin/env bash
# Download one HTML page with curl into work/<dir>/<name>.html and write a text copy with links (no bot-check workarounds).
# usage: tools/page.sh <dir> <name> <url>
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
dir="$here/work/$1"; mkdir -p "$dir"
curl -g -sS -L --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -H 'Accept-Language: he-IL,he;q=0.9,en;q=0.8' -o "$dir/$2.html" -w '%{http_code} %{content_type} %{size_download} %{url_effective}\n' "$3"
python3 -I "$here/tools/html2txt.py" "$dir/$2.html" > "$dir/$2.txt"
wc -l "$dir/$2.txt"
