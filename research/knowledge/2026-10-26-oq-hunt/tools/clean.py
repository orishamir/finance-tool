"""Print lines a..b of a text file with bidi marks removed and blank lines dropped: python3 -I tools/clean.py <file> <a> <b>"""
import re, sys
L = open(sys.argv[1], encoding="utf-8").read().splitlines()
a, b = int(sys.argv[2]), int(sys.argv[3])
for i in range(a - 1, min(b, len(L))):
    l = re.sub("[‪-‮⁦-⁩‎‏]", "", L[i])
    if l.strip():
        print(i + 1, " ".join(l.split()))
