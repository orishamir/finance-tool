#!/usr/bin/env bash
# Scan NII's consolidated tax-regulation files btl.gov.il/Laws1/02_0103_<id>.pdf for a range of ids; save each PDF and print its first title line.
# usage: tools/btl_scan.sh <from> <to>
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/work/h2/btl"
for id in $(seq "$1" "$2"); do
  f="$out/$id.pdf"
  if [ ! -s "$f" ]; then
    code=$(curl -s -o "$f" -w '%{http_code}' -A 'Mozilla/5.0' --max-time 60 "https://www.btl.gov.il/Laws1/02_0103_$id.pdf")
    if [ "$code" != "200" ] || ! head -c 5 "$f" | grep -q '%PDF'; then rm -f "$f"; continue; fi
    sleep 0.3
  fi
  t=$(pdftotext -l 1 "$f" - 2>/dev/null | tr -d '\r' | grep -v '^\s*$' | head -3 | tr '\n' ' ')
  echo "$id | $t"
done
