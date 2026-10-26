"""Print Hapoalim's 447 deposit feed (work/hapoalim-dep.json: a JSON string holding JSON) one product per line.
usage: python3 -I tools/hapoalim_dep.py work/hapoalim-dep.json"""
import html
import json
import sys

raw = json.load(open(sys.argv[1], encoding="utf-8"))
d = json.loads(raw) if isinstance(raw, str) else raw
for k, v in d.items():
    if isinstance(v, list):
        print("=== table", k, len(v))
        for r in v:
            print(json.dumps({kk: html.unescape(vv) if isinstance(vv, str) else vv for kk, vv in r.items()}, ensure_ascii=False))
    else:
        print("=== field", k, json.dumps(v, ensure_ascii=False)[:500])
