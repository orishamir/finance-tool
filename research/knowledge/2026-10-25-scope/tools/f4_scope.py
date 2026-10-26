#!/usr/bin/env python3
"""f4_scope.py: add a `- Scope:` line after a record's Source line (fork F4, settling pass 2026-10-26).

  python3 f4_scope.py SCOPES.py    SCOPES.py defines SCOPES = {"ID": "general" | "institution: ..." | "unsettled: ...", ...}

A record that already has a Scope line is refused (edit it by hand). The line goes directly after `- Source:` and its
continuation lines (README "The Scope line").
"""
import os, re, runpy, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb  # noqa: E402

OWN = {"bank-current-account-deposits.md", "bank-product-names.md", "mutual-funds-and-money-market-funds.md",
       "regulators-and-protection.md", "government-bonds-and-makam.md", "tracks-catalogue-and-decoder.md",
       "managed-and-robo-portfolios.md"}

scopes = runpy.run_path(sys.argv[1])["SCOPES"]
blocks = rb.blocks()
by_file = {}
for rid, scope in scopes.items():
    blk = blocks[rid]
    if blk["file"] not in OWN:
        sys.exit("not an F4 file: %s %s" % (rid, blk["file"]))
    if rb.scope_of(blk["text"]):
        sys.exit("%s already has a Scope line" % rid)
    by_file.setdefault(blk["file"], []).append((rid, scope))
for f, items in by_file.items():
    p = os.path.join(rb.REFS, f)
    text = open(p, encoding="utf8").read()
    for rid, scope in items:
        m = re.search(r"^### %s\b[^\n]*\n" % re.escape(rid), text, re.M)
        start = m.end()
        end_m = re.search(r"^(### |## )", text[start:], re.M)
        end = start + end_m.start() if end_m else len(text)
        body = text[start:end]
        lines = body.split("\n")
        i = next(k for k, l in enumerate(lines) if re.match(r"^- Sources?:", l.strip()))
        j = i + 1
        while j < len(lines) and lines[j].strip() and not lines[j].strip().startswith("- "):
            j += 1
        lines.insert(j, "- Scope: " + scope)
        text = text[:start] + "\n".join(lines) + text[end:]
    open(p, "w", encoding="utf8").write(text)
    print("scoped", f, len(items))
