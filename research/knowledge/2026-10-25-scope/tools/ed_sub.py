#!/usr/bin/env python3
"""ed_sub.py: exact, single-occurrence replacements in a file (editor, settling pass 2026-10-26).

  python3 ed_sub.py SUBS.json     SUBS = [{"file": "<path>", "old": "...", "new": "..."}, ...]
Every `old` must occur exactly once in its file, or nothing is written for that file.
"""
import json, sys

subs = json.load(open(sys.argv[1], encoding="utf8"))
by_file = {}
for s in subs:
    by_file.setdefault(s["file"], []).append(s)
for path, items in by_file.items():
    text = open(path, encoding="utf8").read()
    ok = True
    for s in items:
        n = text.count(s["old"])
        if n != 1:
            print("SKIP %s: %d occurrences of %r" % (path, n, s["old"][:80]))
            ok = False
            break
        text = text.replace(s["old"], s["new"])
    if ok:
        open(path, "w", encoding="utf8").write(text)
        print("wrote %s (%d edits)" % (path, len(items)))
