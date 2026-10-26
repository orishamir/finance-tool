"""Print a page text file with the bidi control marks removed, cut to a width. usage: python3 -I show.py <file> [first_line] [n_lines] [width]"""
import sys, re
f = sys.argv[1]; a = int(sys.argv[2]) if len(sys.argv) > 2 else 1; n = int(sys.argv[3]) if len(sys.argv) > 3 else 80
w = int(sys.argv[4]) if len(sys.argv) > 4 else 230
lines = open(f, encoding="utf-8").read().split("\n")
for l in lines[a - 1:a - 1 + n]:
    print(re.sub("[‪-‮‎‏]", "", l)[:w])
