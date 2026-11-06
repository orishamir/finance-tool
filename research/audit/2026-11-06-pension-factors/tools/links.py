# Print the document links of a saved HTML page (pdf/xlsx/xls/docx), with link text, decoded, filtered by a regex on url+text.
# usage: python3 -I links.py <page.html> <base-url> [include-regex] [exclude-regex]
import re, sys, html, urllib.parse
s = open(sys.argv[1], encoding="utf-8", errors="replace").read()
base = sys.argv[2]; inc = sys.argv[3] if len(sys.argv) > 3 else "."; exc = sys.argv[4] if len(sys.argv) > 4 else None
seen = set()
for m in re.finditer(r'href="([^"]+)"[^>]*>(.*?)</a>', s, re.S):
    u = urllib.parse.urljoin(base, html.unescape(m.group(1))); t = re.sub(r"<[^>]+>|\s+", " ", m.group(2)).strip()
    ud = urllib.parse.unquote(u)
    if not re.search(r"\.(pdf|xlsx|xls|docx)(\?|$)", ud, re.I): continue
    if not re.search(inc, ud + " " + t, re.I): continue
    if exc and re.search(exc, ud + " " + t, re.I): continue
    if u in seen: continue
    seen.add(u); print(t[:70], "|", ud)
