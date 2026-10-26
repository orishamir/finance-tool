#!/usr/bin/env bash
# Download one URL into work/<name> with curl -g, then write a text layer next to it if it is a PDF.
# usage: tools/get.sh <name> <url>
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; url="$2"
out="$here/work/$name"
curl -g -sS -L --max-time 120 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -o "$out" -w '%{http_code} %{content_type} %{size_download}\n' "$url"
if head -c 5 "$out" | grep -q '%PDF'; then
  pdftotext -layout "$out" "$out.txt" && echo "text: $out.txt ($(wc -l < "$out.txt") lines)"
  pdftotext -raw "$out" "$out.raw.txt"
fi
