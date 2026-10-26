#!/usr/bin/env bash
# Try the gov.il BlobFolder addresses of Income Tax circulars <n>/<year> (curl only, PDFs) and print each one's subject line.
# usage: tools/probe_circ.sh <year> <from> <to>
# Saves work/ins/circ/hoz<n>-<year>.pdf. Two address patterns are tried (one- and two-digit number).
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$here/work/ins/circ"; mkdir -p "$out"
y="$1"
for n in $(seq "$2" "$3"); do
  f="$out/hoz$n-$y.pdf"
  if [ ! -s "$f" ]; then
    nn=$(printf '%02d' "$n")
    for pat in "income-tax-professional-inst-$n-$y/he/Policy_IncomeTaxInst_hoz$n-$y.pdf" \
               "income-tax-professional-inst-$nn-$y/he/Policy_IncomeTaxInst_hoz$nn-$y.pdf" \
               "income-tax-professional-inst-$nn-$y/he/Policy_IncomeTaxInst_hoz$n-$y.pdf" \
               "income-tax-professional-inst-$n-$y/he/Policy_IncomeTaxInst_hoz$nn-$y.pdf"; do
      code=$(curl -g -s -o "$f" -w '%{http_code}' -A 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130 Safari/537.36' --max-time 60 "https://www.gov.il/BlobFolder/policy/$pat")
      if [ "$code" = "200" ] && head -c 5 "$f" | grep -q '%PDF'; then echo "$pat" > "$f.url"; break; fi
      rm -f "$f"
      sleep 0.3
    done
  fi
  if [ -s "$f" ]; then
    t=$(python3 -I "$here/tools/pdftitle.py" "$f")
    echo "$n/$y | $t"
  else
    echo "$n/$y | -"
  fi
done
