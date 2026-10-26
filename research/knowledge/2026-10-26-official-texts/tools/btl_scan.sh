#!/usr/bin/env bash
# Scan NII's legislation files btl.gov.il/Laws1/<prefix>_<NNNNNN>.pdf for a range of numbers; save each PDF under work/btl/ and print its first title line.
# usage: tools/btl_scan.sh <prefix like 00_0001> <from> <to>
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/work/btl"; mkdir -p "$out"
for n in $(seq "$2" "$3"); do
  id=$(printf "%06d" "$n")
  f="$out/$1_$id.pdf"
  if [ ! -s "$f" ]; then
    code=$(curl -s -o "$f" -w '%{http_code}' -A 'Mozilla/5.0' --max-time 60 "https://www.btl.gov.il/Laws1/$1_$id.pdf")
    if [ "$code" != "200" ] || ! head -c 5 "$f" | grep -q '%PDF'; then rm -f "$f"; continue; fi
    sleep 0.3
  fi
  t=$(pdftotext -l 1 "$f" - 2>/dev/null | tr -d '\r' | grep -v '^\s*$' | head -1)
  echo "$1_$id | $t"
done
