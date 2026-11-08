# Lists every shekel figure of 1,000 or more printed with ".00" on the built guide pages, outside table cells (which keep two decimals).
#   python3 research/audit/2026-11-08-kgl-guide/agorot-sweep.py site/build/client/guide
import re, html, sys, pathlib
root = pathlib.Path(sys.argv[1])
for f in sorted(root.glob("*/index.html")):
    s = f.read_text()
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S)
    s = re.sub(r"<table.*?</table>", "", s, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", s))
    hits = sorted(set(re.findall(r"\d{1,3}(?:,\d{3})+\.00\s?₪", t)))
    if hits: print(f.parent.name, hits)
