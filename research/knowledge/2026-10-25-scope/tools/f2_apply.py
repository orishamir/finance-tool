#!/usr/bin/env python3
"""f2_apply.py PATCH.json: exact replacements in the rule base. PATCH = [{"file": "x.md", "old": "...", "new": "..."}, ...].
Each `old` must occur exactly once in its file; otherwise nothing is written for that file and the run stops."""
import json, os, sys
REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"
patch = json.load(open(sys.argv[1], encoding="utf8"))
by_file = {}
for p in patch:
    by_file.setdefault(p["file"], []).append(p)
for f, items in by_file.items():
    path = os.path.join(REFS, f)
    text = open(path, encoding="utf8").read()
    for it in items:
        n = text.count(it["old"])
        if n != 1:
            sys.exit("%s: old text found %d times: %r" % (f, n, it["old"][:120]))
        text = text.replace(it["old"], it["new"])
    open(path, "w", encoding="utf8").write(text)
    print("patched", f, len(items))
