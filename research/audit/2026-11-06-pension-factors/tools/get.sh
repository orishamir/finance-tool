#!/usr/bin/env bash
# Download one URL with curl into work/dl/<dir>/<file>; write layout text for a PDF; report status, type, size and any bot-check page.
# usage: tools/get.sh <dir> <file> <url>
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
dir="$here/work/dl/$1"; mkdir -p "$dir"; out="$dir/$2"
curl -g -sS -L --max-time 240 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -H 'Accept-Language: he-IL,he;q=0.9,en;q=0.8' -o "$out" -w "$2: %{http_code} %{content_type} %{size_download}\n" "$3"
if head -c 5 "$out" | grep -q '%PDF'; then pdftotext -layout "$out" "$out.txt" 2>/dev/null; echo "  $(pdfinfo "$out" 2>/dev/null | grep -E '^Pages' | tr -s ' ')"; fi
grep -a -i -l -E 'just a moment|attention required|captcha|radware|verify you are human|incapsula|access denied' "$out" >/dev/null 2>&1 && echo "  BOT CHECK OR BLOCK in $out"
exit 0
