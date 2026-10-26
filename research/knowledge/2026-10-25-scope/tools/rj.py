#!/usr/bin/env python3
"""rj.py: read and patch data/rules records without touching the extraction's keys (settling pass, 2026-10-26).

  python3 rj.py show ID [ID ...]        print id, title, title_he, text_he, strength, checked
  python3 rj.py apply PATCH.json        PATCH = {"ID": {"title_he": "...", "text_he": "...", "checked": "2026-10-26", ...}, ...}

Only the fields in the patch change; key order and formatting stay (json, indent 2, UTF-8, trailing newline).
The extraction's own keys (sources, sources_missing_reason, derived_from) are refused: run the extraction instead.
"""
import json, os, sys

REPO = "/home/ori/dev/finance-tool"
OWN = {"sources", "sources_missing_reason", "derived_from", "id"}


def path_of(rid):
    return os.path.join(REPO, "data/rules", rid.lower() + ".json")


def main():
    cmd = sys.argv[1]
    if cmd == "show":
        for rid in sys.argv[2:]:
            p = path_of(rid)
            if not os.path.exists(p):
                print("== %s: no data/rules record" % rid)
                continue
            d = json.load(open(p, encoding="utf8"))
            print("== %s | strength %s | checked %s" % (d["id"], d.get("strength"), d.get("checked")))
            print("title:", d.get("title"))
            print("title_he:", d.get("title_he"))
            print("text_he:", d.get("text_he"))
            print()
    elif cmd == "apply":
        patch = json.load(open(sys.argv[2], encoding="utf8"))
        for rid, fields in patch.items():
            p = path_of(rid)
            if not os.path.exists(p):
                sys.exit("no data/rules record for %s" % rid)
            bad = OWN & set(fields)
            if bad:
                sys.exit("%s: refused keys %s" % (rid, sorted(bad)))
            d = json.load(open(p, encoding="utf8"))
            new = set(fields) - set(d)
            if new:
                sys.exit("%s: keys not in the record %s (a new key would land after the extraction's keys)" % (rid, sorted(new)))
            for k, v in fields.items():
                d[k] = v
            open(p, "w", encoding="utf8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
            print("patched", rid, sorted(fields))


if __name__ == "__main__":
    main()
