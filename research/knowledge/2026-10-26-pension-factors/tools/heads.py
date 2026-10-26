"""Print, for each page in a range, its non-numeric text lines (titles, column headers, notes), bidi marks removed.
usage: python3 -I heads.py <pages_dir> <first> <last> [max_lines]"""
import re, sys, os
d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
mx = int(sys.argv[4]) if len(sys.argv) > 4 else 14
for p in range(a, b + 1):
    out = []
    for l in open(os.path.join(d, f"p{p:03d}.txt"), encoding="utf-8"):
        l = re.sub("[‪-‮]", "", l).rstrip()
        s = re.sub(r"\s+", " ", l).strip()
        if not s or re.match(r"^[\d.,%\s\-–]+$", s):
            continue
        out.append(s[:170])
    print(f"--- p{p}")
    for s in out[:mx]:
        print("   " + s)
