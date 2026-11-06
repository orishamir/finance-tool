# Print, for each page in a range of a pdftotext -layout file (pages split by form feed), its first non-numeric lines.
# usage: python3 -I heads.py <file.txt> <first> <last> [max_lines]
import re, sys
t = open(sys.argv[1], encoding="utf-8").read().split("\f")
a, b = int(sys.argv[2]), int(sys.argv[3]); mx = int(sys.argv[4]) if len(sys.argv) > 4 else 4
for p in range(a, b + 1):
    out = []
    for l in t[p - 1].split("\n"):
        s = re.sub(r"\s+", " ", re.sub("[‪-‮]", "", l)).strip()
        if not s or re.match(r"^[\d.,%\s\-–:]+$", s): continue
        out.append(s[:150])
    print(f"p{p}: " + " | ".join(out[:mx]))
