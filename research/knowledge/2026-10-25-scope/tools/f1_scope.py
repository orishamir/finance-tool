#!/usr/bin/env python3
"""f1_scope.py MAP.json: add a `- Scope:` line after the Source line of each record that has none (F1, 2026-10-26).
MAP = {"ID": "general" | "institution: A, B" | "unsettled: ...; seen at: ..."}. Records that already have a Scope line are reported, not changed."""
import json, os, re, sys, rb
REFS = rb.REFS
m = json.load(open(sys.argv[1], encoding="utf8"))
b = rb.blocks()
byfile = {}
for rid, sc in m.items():
    byfile.setdefault(b[rid]["file"], []).append((rid, sc))
for f, items in byfile.items():
    path = os.path.join(REFS, f)
    text = open(path, encoding="utf8").read()
    for rid, sc in items:
        mm = re.search(r"^### %s\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)" % re.escape(rid), text, re.M)
        blk = mm.group(0)
        if re.search(r"^- Scope:", blk, re.M):
            print("has scope already:", rid); continue
        lines = blk.split("\n")
        i = next(k for k, l in enumerate(lines) if re.match(r"- Sources?:", l.strip()))
        j = i + 1
        while j < len(lines) and lines[j].strip() and not lines[j].lstrip().startswith("- "):
            j += 1
        lines.insert(j, "- Scope: " + sc)
        new = "\n".join(lines)
        text = text[:mm.start()] + new + text[mm.end():]
        print("scope", rid, "->", sc)
    open(path, "w", encoding="utf8").write(text)
