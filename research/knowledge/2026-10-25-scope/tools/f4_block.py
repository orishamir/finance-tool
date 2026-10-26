#!/usr/bin/env python3
"""f4_block.py: replace whole record blocks (fork F4, settling pass 2026-10-26).

  python3 f4_block.py BLOCKS.py    BLOCKS.py defines BLOCKS = {"ID": "### ID ...\n- Rule: ...\n...\n", ...}

The block of ID (from its `### ID` heading to the next `### ` or `## ` heading) is replaced by the given text, which
may hold the record and new records placed after it (a split). The text must end with a blank line.
"""
import os, re, runpy, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb  # noqa: E402

OWN = {"bank-current-account-deposits.md", "bank-product-names.md", "mutual-funds-and-money-market-funds.md",
       "regulators-and-protection.md", "government-bonds-and-makam.md", "tracks-catalogue-and-decoder.md",
       "managed-and-robo-portfolios.md"}

new_blocks = runpy.run_path(sys.argv[1])["BLOCKS"]
blocks = rb.blocks()
for rid, new in new_blocks.items():
    f = blocks[rid]["file"]
    if f not in OWN:
        sys.exit("not an F4 file: %s" % f)
    if not new.startswith("### %s " % rid) or not new.endswith("\n\n"):
        sys.exit("%s: the new text must start with its heading and end with a blank line" % rid)
    for m in re.finditer(r"^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b", new, re.M):
        if m.group(1) != rid and m.group(1) in blocks:
            sys.exit("%s: new id %s already exists" % (rid, m.group(1)))
    p = os.path.join(rb.REFS, f)
    text = open(p, encoding="utf8").read()
    m = re.search(r"^### %s\b[^\n]*\n" % re.escape(rid), text, re.M)
    end_m = re.search(r"^(### |## )", text[m.end():], re.M)
    end = m.end() + end_m.start() if end_m else len(text)
    text = text[:m.start()] + new + text[end:]
    open(p, "w", encoding="utf8").write(text)
    print("replaced", rid, "in", f)
