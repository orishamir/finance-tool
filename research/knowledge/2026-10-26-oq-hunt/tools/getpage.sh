#!/usr/bin/env bash
# Download one non-gov.il-www HTML page with curl into work/<name>.html and write a text copy (no bot-check workarounds).
# usage: tools/getpage.sh <name> <url>
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; url="$2"
curl -g -sS -L --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -o "$here/work/$name.html" -w '%{http_code} %{content_type} %{size_download}\n' "$url"
python3 -I "$here/tools/html2txt.py" "$here/work/$name.html" > "$here/work/$name.txt"
wc -l "$here/work/$name.txt"
