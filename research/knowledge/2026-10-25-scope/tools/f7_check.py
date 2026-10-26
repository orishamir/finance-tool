#!/usr/bin/env python3
"""f7_check.py: check every Hebrew/English quote of the securities-tax hunt rows against its fetched source (F7, 2026-10-26).
Quotes with elisions (… or ...) are split and each part of 12+ characters is searched separately with src.py find."""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROWS = "/home/ori/dev/finance-tool/research/knowledge/2026-10-26-oq-hunt/securities-tax.jsonl"
env = dict(os.environ, SRC_CACHE=os.path.join(HERE, "work", "srccache"))
only = sys.argv[1:]
for line in open(ROWS, encoding="utf8"):
    if not line.strip():
        continue
    r = json.loads(line)
    if only and r["code"] not in only:
        continue
    for k, s in enumerate(r["sources"]):
        q = s.get("quote_he") or ""
        if not q:
            print("%s [%d] no quote: %s" % (r["code"], k, s["url"][:90]))
            continue
        parts = [p.strip(" \"'[]:;,.") for p in re.split(r"…|\.\.\.|\[[^\]]*\]", q)]
        parts = [p for p in parts if len(p) >= 12]
        for p in parts:
            res = subprocess.run([sys.executable, os.path.join(HERE, "src.py"), "find", s["url"], p[:160]], capture_output=True, text=True, env=env, timeout=300)
            out = (res.stdout or res.stderr).strip().split("\n")[0]
            print("%s [%d] %s | %s" % (r["code"], k, out[:60], p[:70]))
