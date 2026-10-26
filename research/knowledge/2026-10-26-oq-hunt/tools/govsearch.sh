#!/usr/bin/env bash
# Run a gov.il site search through the project's FlareSolverr tool and print the result titles, snippets and links.
# usage: tools/govsearch.sh <name> "<query>" [skip]
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; q="$2"; skip="${3:-0}"
enc=$(python3 -I -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$q")
url="https://www.gov.il/he/search?query=${enc}&skip=${skip}"
bash "$here/../../audit/tools/govil-page.sh" "$url" > "$here/work/$name.html" 2>/dev/null
python3 -I "$here/tools/html2txt.py" "$here/work/$name.html" > "$here/work/$name.txt"
python3 -I - "$here/work/$name.txt" <<'EOF'
import sys
lines = open(sys.argv[1], encoding="utf-8").read().splitlines()
start = next((i for i, l in enumerate(lines) if l.startswith("תוצאות לערך")), 0)
end = next((i for i, l in enumerate(lines) if l.startswith("הצג ") and "תוצאות" in l), len(lines))
print("\n".join(lines[start:end + 1]))
links = lines[lines.index("--- links ---") + 1:]
seen = set()
for l in links:
    if "->" not in l:
        continue
    t, h = l.rsplit(" -> ", 1)
    if any(k in h for k in ("BlobFolder", "/pages/", "policies", "DynamicCollectors", "dynamiccollectors", "/service/", "/guides/", "Guides")) and h not in seen:
        seen.add(h)
        print("LINK", t[:120], "->", h)
EOF
