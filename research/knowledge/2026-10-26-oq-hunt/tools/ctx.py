"""Search a text layer (pdftotext output with form feeds, or any text) for a regex and print the file page and context.

usage: python3 -I tools/ctx.py <file.txt> "<regex>" [width]
Bidi control characters are removed and whitespace collapsed per page before matching.
"""
import re
import sys

path, pat = sys.argv[1], re.compile(sys.argv[2])
w = int(sys.argv[3]) if len(sys.argv) > 3 else 250
raw = open(path, encoding="utf-8", errors="replace").read()
pages = raw.split("\f")
for i, p in enumerate(pages, 1):
    t = " ".join(re.sub("[‪-‮⁦-⁩‎‏]", "", p).split())
    for m in pat.finditer(t):
        s, e = max(0, m.start() - w), min(len(t), m.end() + w)
        print(f"--- p.{i}: ...{t[s:e]}...")
