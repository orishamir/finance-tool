#!/usr/bin/env python3
"""ed_cited.py: where each non-general data/rules record is cited outside data/rules (editor, 2026-10-26).
Prints one line per record: id, scope, and the files under site/app, data/ (not data/rules), packages/ and docs/method.md that name it."""
import glob, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb

b = rb.blocks()
for i in rb.data_ids():
    sl = rb.scope_of(b[i]["text"])
    if rb.kind_of(sl) == "general":
        continue
    pat = r"(^|[^A-Z0-9-])%s([^0-9]|$)" % re.escape(i)
    r = subprocess.run(["grep", "-rlE", pat, "site/app", "data", "packages", "docs/method.md",
                        "--include=*.ts", "--include=*.tsx", "--include=*.json", "--include=*.md"],
                       capture_output=True, text=True, cwd=rb.REPO)
    files = [f for f in r.stdout.split() if not f.startswith("data/rules/") and "/test/" not in f and not f.endswith(".test.ts")]
    print("%s | %s | %s" % (i, sl, ", ".join(sorted(files)) or "-"))
