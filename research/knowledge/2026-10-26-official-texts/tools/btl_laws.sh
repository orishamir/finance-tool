#!/usr/bin/env bash
# Scan NII's legislation index for laws: btl.gov.il/Laws1/00_<NNNN>_000000.pdf for NNNN in a range; save under work/btl/ and print the title.
# usage: tools/btl_laws.sh <from> <to>
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/work/btl"; mkdir -p "$out"
for n in $(seq "$1" "$2"); do
  id=$(printf "%04d" "$n")
  f="$out/00_${id}_000000.pdf"
  if [ ! -s "$f" ]; then
    code=$(curl -s -o "$f" -w '%{http_code}' -A 'Mozilla/5.0' --max-time 60 "https://www.btl.gov.il/Laws1/00_${id}_000000.pdf")
    if [ "$code" != "200" ] || ! head -c 5 "$f" | grep -q '%PDF'; then rm -f "$f"; continue; fi
    sleep 0.2
  fi
  t=$(pdftotext -l 1 "$f" - 2>/dev/null | tr -d '\r' | grep -v '^\s*$' | head -1)
  echo "00_${id} | $t"
done
