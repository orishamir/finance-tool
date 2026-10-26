#!/usr/bin/env bash
# Download one URL into work/<name> with a plain curl request (browser User-Agent, no bot-check workaround).
# Writes a text layer next to it for a PDF (pdftotext) or an HTML page (html2txt.py).
# usage: tools/get.sh <name> <url> [extra curl args...]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
work="$here/../work"
mkdir -p "$work"
name="$1"; url="$2"; shift 2
out="$work/$name"
curl -g -sS -L --compressed --max-time 120 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' \
  -H 'Accept-Language: he-IL,he;q=0.9,en;q=0.8' \
  "$@" -o "$out" -w '%{http_code} %{content_type} %{size_download} %{url_effective}\n' "$url"
if head -c 5 "$out" | grep -q '%PDF'; then
  pdftotext -layout "$out" "$out.txt" && echo "text: $out.txt ($(wc -l < "$out.txt") lines)"
elif head -c 4000 "$out" | grep -qi '<html\|<!doctype html'; then
  python3 -I "$here/html2txt.py" "$out" > "$out.txt" && echo "text: $out.txt ($(wc -c < "$out.txt") bytes)"
fi
