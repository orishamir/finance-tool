#!/usr/bin/env python3
"""f1_sub.py PATCH.py: apply exact, unique replacements to one rule-base file (F1, settling pass 2026-10-26).
PATCH.py defines FILE (basename under the references folder) and SUBS = [(old, new), ...]; each old must occur once."""
import os, runpy, sys
REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"
p = runpy.run_path(sys.argv[1])
path = os.path.join(REFS, p["FILE"])
text = open(path, encoding="utf8").read()
for i, (old, new) in enumerate(p["SUBS"]):
    n = text.count(old)
    if n != 1:
        sys.exit("sub %d: %d occurrences of %r" % (i, n, old[:120]))
    text = text.replace(old, new)
open(path, "w", encoding="utf8").write(text)
print("applied", len(p["SUBS"]), "to", p["FILE"])
