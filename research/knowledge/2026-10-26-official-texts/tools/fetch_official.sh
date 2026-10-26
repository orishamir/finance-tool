#!/usr/bin/env bash
# Download every file listed in tools/official.json to work/off/<law>/<name>.pdf (curl; skips files already there).
# usage: tools/fetch_official.sh [law-key ...]
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
python3 -I -c '
import json,sys
d=json.load(open(sys.argv[1],encoding="utf-8"))
keys=sys.argv[2:] or list(d)
for k in keys:
    for f in d[k]["files"]:
        print(k, f["name"], f["url"].split("#")[0])
' "$here/tools/official.json" "$@" | while read -r k name url; do
  out="$here/work/off/$k/$name.pdf"; mkdir -p "$(dirname "$out")"
  if [ -s "$out" ] && head -c 5 "$out" | grep -q '%PDF'; then continue; fi
  code=$(curl -g -s -L --max-time 180 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' -o "$out" -w '%{http_code}' "$url")
  if ! head -c 5 "$out" | grep -q '%PDF'; then echo "FAIL $k $name $code $url"; rm -f "$out"; else echo "ok $k $name $(stat -c %s "$out")"; fi
  sleep 0.3
done
