#!/usr/bin/env python3
"""verify_quotes.py: the reviewer's own check of every quote behind a general verdict.

  python3 verify_quotes.py work/verdicts-G*.json

For each verdict whose scope is general and whose quote was marked "fetched", fetch (or reuse the cache of) the cited
URL with src.py and look for the whole quote: every run between '...' or '…' must appear, squashed to Hebrew letters,
Latin letters and digits, as is or reversed. Prints one line per failure and a summary. Nothing is changed.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "src.py")).read().rsplit("\nmain()", 1)[0]
ns = {"__name__": "src"}
exec(compile(src, "src.py", "exec"), ns)
fetch, pages_of, norm, squash_map = ns["fetch"], ns["pages_of"], ns["norm"], ns["squash_map"]

files = sorted(sum((glob.glob(a) for a in sys.argv[1:]), []))
tot = ok = skipped = 0
fails = []
for f in files:
    for v in json.load(open(f)):
        if v.get("scope") != "general":
            continue
        g = v.get("general_source") or {}
        read = str(g.get("read", ""))
        if not read.startswith("fetched") or "dataset" in read or not g.get("url"):
            skipped += 1
            continue
        url = g["url"].split(" ")[0]
        tot += 1
        try:
            path, info = fetch(url)
            pages = pages_of(path, info)
        except Exception as e:
            fails.append((v["id"], "fetch error " + str(e)[:80], url))
            continue
        S = [squash_map(norm(p))[0] for p in pages]
        pieces = [p for p in re.split(r"\.\.\.|…|\[\.\.\.\]", g.get("quote", "")) if len(squash_map(norm(p))[0]) >= 6]
        missing = []
        for p in pieces:
            q = squash_map(norm(p))[0]
            if not any(q in s or q[::-1] in s for s in S):
                missing.append(p.strip()[:60])
        if missing or not pieces:
            fails.append((v["id"], "not found: " + " | ".join(missing) if pieces else "no usable quote", url[:100]))
        else:
            ok += 1
print(f"general verdicts with a fetched quote: {tot}; whole quote found: {ok}; not found: {len(fails)}; not checked (recorded only or dataset check): {skipped}")
for i, why, url in fails:
    print(f"  {i}: {why}  <{url}>")
