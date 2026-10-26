#!/usr/bin/env python3
"""f1_instsrc.py PREFIX...: general-scoped records whose Source line still carries an institution-strength source (F1 check)."""
import re, sys, rb
b = rb.blocks()
for i, r in b.items():
    if i.split("-")[0] not in sys.argv[1:]:
        continue
    sc = rb.scope_of(r["text"])
    if not sc or not sc.startswith("general"):
        continue
    m = re.search(r"^- Sources?:(.*(?:\n(?!- ).*)*)", r["text"], re.M)
    src = m.group(1) if m else ""
    hits = re.findall(r"\[([^\]]{0,80})\]\([^)]*\)[^\[]{0,300}?·\s*institution", src)
    if hits:
        print(i, "|", " || ".join(hits))
