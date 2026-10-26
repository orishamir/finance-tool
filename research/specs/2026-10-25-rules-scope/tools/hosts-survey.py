# Hosts each company's own data uses: the fee snapshots' and deposit records' source urls, by registry id.
import json, glob, os, re
from collections import defaultdict
from urllib.parse import urlparse
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
reg = json.load(open(root + "data/sources/institutions.json"))
hosts = defaultdict(lambda: defaultdict(int))
def urls(node):
    if isinstance(node, list):
        for n in node: yield from urls(n)
    elif isinstance(node, dict):
        for k, v in node.items():
            if k == "url" and isinstance(v, str): yield v
            else: yield from urls(v)
by_fees = {r["fees_id"]: r["id"] for r in reg if r["fees_id"]}
by_bank = {r["deposit_bank_id"]: r["id"] for r in reg if r["deposit_bank_id"]}
for f in glob.glob(root + "data/fees/*.json"):
    d = json.load(open(f))
    rid = by_fees.get(d["id"])
    if not rid: continue
    for u in urls(d): hosts[rid][(urlparse(u).hostname or "").removeprefix("www.")] += 1
for f in glob.glob(root + "data/terms/deposits/**/*.json", recursive=True):
    d = json.load(open(f))
    rid = by_bank.get(d.get("bank"))
    if not rid: continue
    for u in urls(d): hosts[rid][(urlparse(u).hostname or "").removeprefix("www.")] += 1
for r in reg:
    print(r["id"], dict(hosts.get(r["id"], {})))
