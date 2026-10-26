#!/usr/bin/env python3
"""f4_edit.py: exact, single-occurrence replacements in the rule base (fork F4, settling pass 2026-10-26).

  python3 f4_edit.py EDITS.py     EDITS.py defines EDITS = [(file_basename, old, new), ...]

Every `old` must occur exactly once in its file, or nothing is written for that file and the script stops.
"""
import os, runpy, sys

REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"
OWN = {"bank-current-account-deposits.md", "bank-product-names.md", "mutual-funds-and-money-market-funds.md",
       "regulators-and-protection.md", "government-bonds-and-makam.md", "tracks-catalogue-and-decoder.md",
       "managed-and-robo-portfolios.md"}

edits = runpy.run_path(sys.argv[1])["EDITS"]
by_file = {}
for f, old, new in edits:
    if f not in OWN:
        sys.exit("not an F4 file: %s" % f)
    by_file.setdefault(f, []).append((old, new))
for f, pairs in by_file.items():
    p = os.path.join(REFS, f)
    text = open(p, encoding="utf8").read()
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            sys.exit("%s: expected 1 occurrence, found %d of:\n%s" % (f, n, old[:200]))
        text = text.replace(old, new)
    open(p, "w", encoding="utf8").write(text)
    print("edited", f, len(pairs))
