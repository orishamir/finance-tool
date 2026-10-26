#!/usr/bin/env bash
# Read one gov.il HTML page through the project's FlareSolverr tool and save HTML and a plain-text copy in work/.
# usage: tools/govil.sh <name> <https://www.gov.il/...>
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
name="$1"; url="$2"
bash "$here/../../audit/tools/govil-page.sh" "$url" > "$here/work/$name.html"
python3 -I "$here/tools/html2txt.py" "$here/work/$name.html" > "$here/work/$name.txt"
wc -c "$here/work/$name.html" "$here/work/$name.txt"
