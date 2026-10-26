# For every non-general record: its companies, and each source's host, kind, strength, publisher.
import json, glob, os, sys
from urllib.parse import urlparse
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
reg = json.load(open(root + "data/sources/institutions.json"))
for f in sorted(glob.glob(root + "data/rules/*.json")):
    r = json.load(open(f))
    if r["scope"] == "general":
        continue
    cos = ",".join(i["id"] for i in r.get("scope_institutions", []))
    print(f"{r['id']} [{r['scope']}] {cos}")
    for s in r.get("sources", []):
        host = urlparse(s["url"]).hostname or ""
        host = host.removeprefix("www.")
        print(f"    {host} | {s['kind']} | {s['strength']} | {s.get('publisher_he', s['publisher'])}")
