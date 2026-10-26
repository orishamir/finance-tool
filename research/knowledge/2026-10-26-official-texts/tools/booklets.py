"""Collect every Reshumot file-service link the repo already holds, keyed by gazette booklet number (קובץ התקנות / ק"ת N).

usage: python3 -I tools/booklets.py <repo-root> <out.json>
Reads data/sources/documents.json and the 2026-10-25 source-check maps (title + official_url pairs).
"""
import glob
import json
import re
import sys

root = sys.argv[1]
out = {}


def add(title, url, src):
    if not url or "free-justice" not in url:
        return
    for m in re.finditer(r'(?:קובץ התקנות|ק"ת|ק״ת)\s*(\d{4,5}א?)', title or ""):
        out.setdefault(m.group(1), {"url": url.split("#")[0], "title": title, "from": src})


for x in json.load(open(f"{root}/data/sources/documents.json", encoding="utf-8")):
    add(x.get("title_he", ""), x.get("official_url"), "documents.json")
for f in glob.glob(f"{root}/research/audit/2026-10-25-source-check/maps/*.json"):
    for e in json.load(open(f, encoding="utf-8")):
        for o in e.get("official", []):
            add(o.get("title_he", "") + " " + o.get("basis", ""), o.get("url"), f.split("/")[-1])
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "booklets")
