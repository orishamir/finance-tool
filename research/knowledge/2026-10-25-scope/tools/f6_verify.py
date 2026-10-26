#!/usr/bin/env python3
"""f6_verify.py: check every quote of an oq-hunt jsonl file against its source with src.py find (F6, 2026-10-26).
  python3 f6_verify.py FILE.jsonl [CODE ...]
Quotes are split at '...' / '…' and at bracketed insertions; each segment of 12+ characters is searched."""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
env = dict(os.environ, SRC_CACHE=os.path.join(HERE, "work", "srccache"))
rows = [json.loads(l) for l in open(sys.argv[1], encoding="utf8") if l.strip()]
codes = set(sys.argv[2:])
for r in rows:
    if codes and r["code"] not in codes:
        continue
    print("=" * 30, r["code"], r["verdict"])
    for n, s in enumerate(r["sources"]):
        q = s.get("quote_he") or ""
        segs = [x.strip(" \"'״“”;:,.") for x in re.split(r"\.\.\.|…|\[[^\]]*\]", q)]
        segs = [x for x in segs if len(x) >= 12]
        for seg in segs:
            seg2 = seg[:160]
            out = subprocess.run(["python3", os.path.join(HERE, "src.py"), "find", s["url"], seg2], capture_output=True, text=True, env=env, timeout=300)
            first = (out.stdout.strip().split("\n") or [""])[0]
            status = "FOUND" if first.startswith("FOUND") else ("NO" if "NO MATCH" in first or "NOT FOUND" in first else first[:120])
            pg = re.search(r"page (\d+)", first)
            print("[%d] %s %s | %s | %s" % (n, status, ("p." + pg.group(1)) if pg else "", s["locator"][:60], seg2[:70]))
