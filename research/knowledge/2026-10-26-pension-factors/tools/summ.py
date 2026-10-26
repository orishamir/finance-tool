"""Summarise an extracted tables JSON: per table the page, header labels, key range, row count, filled-cell count, and context lines.
usage: python3 -I summ.py <tables.json> [--ctx]"""
import json, sys
t = json.load(open(sys.argv[1], encoding="utf-8"))
for i, x in enumerate(t):
    keys = [r["key"] for r in x["rows"]]
    filled = sum(1 for r in x["rows"] for v in r["cells"].values() if v not in ("", "-"))
    print(f"#{i} p{x['page']} hdr={[h['label'] for h in x['header']]} key_x={x['key_x']} keys={keys[:1]}..{keys[-1:]} n={len(keys)} filled={filled}")
    if "--ctx" in sys.argv:
        for c in x["context_above"][-5:]:
            print("    ^ " + c[:150])
        for c in x["context_below"][:3]:
            print("    v " + c[:150])
