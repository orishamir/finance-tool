#!/usr/bin/env bash
# Download one URL with curl into work/<dir>/<file> (a new directory per source), then write text layers if it is a PDF.
# usage: tools/get.sh <dir> <file> <url>
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
dir="$here/work/$1"; mkdir -p "$dir"
out="$dir/$2"; url="$3"
curl -g -sS -L --max-time 180 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -H 'Accept-Language: he-IL,he;q=0.9,en;q=0.8' -o "$out" -w '%{http_code} %{content_type} %{size_download} %{url_effective}\n' "$url"
if head -c 5 "$out" | grep -q '%PDF'; then
  pdftotext -layout "$out" "$out.txt" 2>/dev/null && echo "text: $out.txt ($(wc -l < "$out.txt") lines, $(pdfinfo "$out" 2>/dev/null | grep Pages))"
  pdftotext -raw "$out" "$out.raw.txt" 2>/dev/null
fi
