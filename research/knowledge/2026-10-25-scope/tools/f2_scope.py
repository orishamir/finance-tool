#!/usr/bin/env python3
"""f2_scope.py MAP.json: insert a `- Scope:` line directly after the `- Source:` line (and its continuation lines) of each
record that has none. MAP = {"ID": "general" | "institution: ..." | "unsettled: ...; seen at: ..."}. A record that already
has a Scope line is left alone and reported."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb

REFS = rb.REFS
m = json.load(open(sys.argv[1], encoding="utf8"))
blocks = rb.blocks()
by_file = {}
for rid, scope in m.items():
    by_file.setdefault(blocks[rid]["file"], []).append((rid, scope))
for f, items in by_file.items():
    path = os.path.join(REFS, f)
    text = open(path, encoding="utf8").read()
    for rid, scope in items:
        bm = re.search(r"^### %s\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)" % re.escape(rid), text, re.M)
        block = bm.group(0)
        if re.search(r"^- Scope:", block, re.M):
            print("skip (has Scope):", rid)
            continue
        lines = block.split("\n")
        i = next((k for k, l in enumerate(lines) if re.match(r"^- Sources?:", l)), None)
        if i is None:
            sys.exit("no Source line: " + rid)
        j = i + 1
        while j < len(lines) and lines[j].strip() and not lines[j].startswith("- ") and not lines[j].startswith("### ") and not lines[j].startswith("**["):
            j += 1
        lines.insert(j, "- Scope: " + scope)
        new_block = "\n".join(lines)
        text = text[:bm.start()] + new_block + text[bm.end():]
        print("scope", rid, "->", scope[:80])
    open(path, "w", encoding="utf8").write(text)
