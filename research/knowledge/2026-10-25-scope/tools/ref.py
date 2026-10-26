#!/usr/bin/env python3
"""ref.py: print review bundles (record JSON + its references block, editor scope notes removed).

  python3 ref.py ID [ID ...]        one or more records
  python3 ref.py --group G1         list the ids of a helper group, with their source mix
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
recs = {r["id"]: r for r in json.load(open(os.path.join(HERE, "work", "records.json")))}
GROUPS = {
    "G1": ["PF", "KGL", "KH", "CS"],
    "G2": ["PEN", "SW", "INS"],
    "G3": ["BRK", "ETF", "MKT"],
    "G4": ["BANK", "BPN", "MF", "REG", "GOV", "IRA"],
    "G5": ["TX2", "TXA", "TXF", "TXG", "TXH", "TXI", "TXK", "TXP", "TXS"],
    "G0": ["CAT"],
}
if sys.argv[1] == "--group":
    pre = GROUPS[sys.argv[2]]
    for i, r in recs.items():
        if i.split("-")[0] in pre:
            print(i, " ".join(r["mix"]))
    sys.exit()
for i in sys.argv[1:]:
    r = recs[i.upper()]
    print("=" * 100)
    print(r["id"], "|", r["title"], "| strength:", r["strength"], "| file:", r["il_finance_file"])
    print("title_he:", r["title_he"])
    print("text_he:", r["text_he"])
    print("sources:")
    for n, s in enumerate(r["sources"]):
        print("  [%d] %s/%s | %s | %s | locator=%s page=%s\n      %s" % (n, s["kind"], s["strength"], s["publisher"], s["title_he"], s["locator"], s["page"], s["url"]))
    print("--- references block (editor scope notes removed) ---")
    print(r["ref_block"])
