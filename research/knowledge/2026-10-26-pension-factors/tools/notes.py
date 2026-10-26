"""Print the distinct note lines of a page range (lines that mention assumptions), from per-page layout text.
usage: python3 -I notes.py <pages_dir> <first> <last>"""
import re, sys, os
d, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
keys = ("חושב", "דמי ניהול", "הפרש", "הערה", "מייצג", "לבן הזוג", "לבת הזוג", "60%", "בפועל", "נולד", "ריבית", "תשואה", "התאמה")
seen = {}
for p in range(a, b + 1):
    f = os.path.join(d, f"p{p:03d}.txt")
    for l in open(f, encoding="utf-8"):
        l = re.sub("[‪-‮]", "", l).strip()
        l = re.sub(r"\s+", " ", l)
        if any(k in l for k in keys) and not re.match(r"^[\d.%\s-]+$", l):
            seen.setdefault(l, []).append(p)
for l, ps in seen.items():
    print(f"[{ps[0]}-{ps[-1]} x{len(ps)}] {l[:200]}")
