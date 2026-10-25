#!/usr/bin/env python3
"""Read or set the hand-written `source` and `checked` of a figure value in data/rules/*.json (2026-10-25 source check).
Never touches value, unit, effective_*, tax_year, update_rule or notes. Takes the same lock as extract-locked.sh.

  python3 research/audit/tools/figsrc.py list TXH-09
  python3 research/audit/tools/figsrc.py set TXH-09 figures.lock_years --url URL --title TITLE --publisher PUB --strength primary --checked 2026-10-25
Run from the repo root."""
import argparse, fcntl, json, os, sys
LOCK = "/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/rules.lock"
def path_of(rule_id):
    p = f"data/rules/{rule_id.lower()}.json"
    if not os.path.exists(p): sys.exit(f"no record {p}")
    return p
def walk(node, path, out):
    if isinstance(node, dict):
        if "source" in node and isinstance(node["source"], dict) and "url" in node["source"]:
            out.append((path, node))
        for k, v in node.items():
            if k != "source": walk(v, f"{path}.{k}", out)
    elif isinstance(node, list):
        for i, v in enumerate(node): walk(v, f"{path}[{i}]", out)
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["list", "set"]); ap.add_argument("rule"); ap.add_argument("path", nargs="?")
    for k in ("url", "title", "publisher", "strength", "checked"): ap.add_argument("--" + k)
    a = ap.parse_args(); p = path_of(a.rule)
    os.makedirs(os.path.dirname(LOCK), exist_ok=True)
    with open(LOCK, "w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        text = open(p, encoding="utf8").read(); rec = json.loads(text)
        found = []; walk(rec.get("figures") or {}, "figures", found)
        if a.cmd == "list":
            for path, node in found:
                print(json.dumps({"path": path, "source": node["source"], "checked": node.get("checked")}, ensure_ascii=False))
            return
        if json.dumps(rec, ensure_ascii=False, indent=2) + "\n" != text: sys.exit(f"{p} does not round-trip; edit it by hand")
        hits = [n for path, n in found if path == a.path]
        if not hits: sys.exit(f"no figure source at {a.path}; run list")
        node = hits[0]; s = node["source"]
        for k in ("url", "title", "publisher", "strength"):
            v = getattr(a, k)
            if v is not None: s[k] = v
        if s.get("strength") not in ("primary", "primary-mirror", "institution", "secondary"): sys.exit("bad strength")
        if a.checked: node["checked"] = a.checked
        open(p, "w", encoding="utf8").write(json.dumps(rec, ensure_ascii=False, indent=2) + "\n")
        print("set", a.rule, a.path, json.dumps(s, ensure_ascii=False))
main()
