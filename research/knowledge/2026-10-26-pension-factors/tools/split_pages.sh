#!/usr/bin/env bash
# Write one -layout text file per page of a PDF: work/<dir>/pages/p<NNN>.txt
# usage: tools/split_pages.sh <pdf>
set -euo pipefail
pdf="$1"; out="$(dirname "$pdf")/pages"; mkdir -p "$out"
n=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages:/{print $2}')
for p in $(seq 1 "$n"); do pdftotext -layout -f "$p" -l "$p" "$pdf" "$out/p$(printf %03d "$p").txt" 2>/dev/null; done
echo "$n pages -> $out"
