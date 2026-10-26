"""Where a wrapper/exposure record cites rule ids, and which carry a dimension."""
import json, sys, glob
rec_id, dim = sys.argv[1], sys.argv[2]
path = (glob.glob(f"data/instruments/*/{rec_id}.json") or [None])[0]
d = json.load(open(path))
def walk(n, p=""):
    if isinstance(n, dict):
        for k, v in n.items():
            if k == "rule_ids" and isinstance(v, list): yield p, v
            else: yield from walk(v, f"{p}.{k}")
    elif isinstance(n, list):
        for i, v in enumerate(n): yield from walk(v, f"{p}[{i}]")
for p, ids in walk(d):
    for r in ids:
        try:
            dims = json.load(open(f"data/rules/{r.lower()}.json"))["dimensions"]
        except FileNotFoundError:
            dims = ["(no record)"]
        if dim in dims or dims == ["(no record)"]:
            print(p, r, dims)
print("mark:", d.get("dimensions", {}).get(dim))
