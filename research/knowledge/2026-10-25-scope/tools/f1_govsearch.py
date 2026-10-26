#!/usr/bin/env python3
"""f1_govsearch.py QUERY: gov.il site search through govil-page.sh; prints result titles, dates and links (F1, 2026-10-26)."""
import html, re, subprocess, sys, urllib.parse
q = sys.argv[1]
url = "https://www.gov.il/he/search?query=" + urllib.parse.quote(q)
r = subprocess.run(["/home/ori/dev/finance-tool/research/audit/tools/govil-page.sh", url], capture_output=True, timeout=160)
t = r.stdout.decode("utf8", "replace")
print(r.stderr.decode()[-200:])
for m in re.finditer(r'href="([^"]+)"[^>]*>(.*?)</a>', t, re.S):
    href, txt = m.group(1), re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(2)))).strip()
    if txt and ("BlobFolder" in href or "dynamiccollectorresultitem" in href.lower() or "/departments/" in href.lower() or "/pages/" in href.lower()):
        print(txt[:150], "|", href[:200])
body = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", "", t, flags=re.S))))
i = body.find("תוצאות")
print(body[i:i + 3000])
