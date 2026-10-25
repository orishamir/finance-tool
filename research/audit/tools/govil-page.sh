#!/usr/bin/env bash
# Reads one gov.il page through a local FlareSolverr and prints its HTML; the status line goes to stderr. gov.il's HTML
# pages sit behind Cloudflare's human check; the founder allowed FlareSolverr for gov.il pages only (2026-10-25), so the
# script refuses any other address. PDFs under /BlobFolder/ need none of this: fetch them with curl (see il-finance
# coverage.md item 2).
#
# Start the service once, bound to this machine only:
#   docker run -d --name flaresolverr -p 127.0.0.1:8191:8191 ghcr.io/flaresolverr/flaresolverr:latest
# after a reboot: docker start flaresolverr
#
#   research/audit/tools/govil-page.sh https://www.gov.il/he/pages/income-tax-guide-knowyourright > page.html
set -euo pipefail
url="${1:?usage: govil-page.sh https://www.gov.il/...}"
[[ "$url" =~ ^https://(www\.)?gov\.il/ ]] || { echo "govil-page.sh: only gov.il pages" >&2; exit 2; }
# gov.il pages fill in their content after loading; without the wait, some came back as the bare page frame.
payload=$(python3 -I -c 'import json, sys; print(json.dumps({"cmd": "request.get", "url": sys.argv[1], "maxTimeout": 60000, "waitInSeconds": 6}))' "$url")
curl -sS --max-time 90 -H 'Content-Type: application/json' -d "$payload" http://127.0.0.1:8191/v1 | python3 -I -c '
import json, sys
r = json.load(sys.stdin)
s = r.get("solution") or {}
print(r.get("status"), s.get("status"), s.get("url"), file=sys.stderr)
print(s.get("response", ""))
'
