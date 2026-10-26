#!/usr/bin/env bash
# Download one URL with curl into work/<dir>/<name> (no bot-check workarounds); print status, type, size.
# usage: tools/get.sh <dir/name> <url>
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/work/$1"; mkdir -p "$(dirname "$out")"
curl -g -sS -L --max-time 120 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -o "$out" -w "$1 %{http_code} %{content_type} %{size_download}\n" "$2"
if head -c 5 "$out" | grep -q '%PDF'; then pdfinfo "$out" 2>/dev/null | grep -E "^(Pages|CreationDate|ModDate):" | tr '\n' ' '; echo; fi
