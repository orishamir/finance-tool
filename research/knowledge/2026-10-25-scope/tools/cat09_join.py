#!/usr/bin/env python3
"""cat09_join.py: does every Gemel-Net FUND_ID (one report period) appear as a track number in the CMA's transfer_bank
dataset, and how many are also a fund number there? Checks CAT-09's claim over every row, not one company's example."""
import json, subprocess, sys, urllib.parse

PERIOD = sys.argv[1] if len(sys.argv) > 1 else "202609"
GEMEL = "a30dcbea-a1d2-482c-ae29-8f781f5025fb"
TB = "b5223cbc-e1b2-4503-a499-97cdcd7190d2"


def search(res, filters, fields):
    # the SQL endpoint now answers with an HTML page, so page through datastore_search instead
    rows, off = [], 0
    while True:
        u = ("https://data.gov.il/api/3/action/datastore_search?resource_id=" + res + "&limit=1000&offset=%d" % off
             + "&filters=" + urllib.parse.quote(json.dumps(filters, ensure_ascii=False)) + "&fields=" + urllib.parse.quote(",".join(fields)))
        out = subprocess.run(["curl", "-sS", "--max-time", "120", u], capture_output=True).stdout
        recs = json.loads(out)["result"]["records"]
        rows += recs
        if len(recs) < 1000:
            return rows
        off += 1000


g = search(GEMEL, {"REPORT_PERIOD": int(PERIOD)}, ["FUND_ID", "FUND_CLASSIFICATION"])
t = search(TB, {"תחום": "גמל"}, ["מספר קופה -אישור מס הכנסה", "מספר מסלול השקעה"])
tracks = {int(r["מספר מסלול השקעה"]) for r in t if r["מספר מסלול השקעה"] not in (None, "")}
funds = {int(r["מספר קופה -אישור מס הכנסה"]) for r in t if r["מספר קופה -אישור מס הכנסה"] not in (None, "")}
ids = sorted({(int(r["FUND_ID"]), r["FUND_CLASSIFICATION"]) for r in g})
in_tracks = sum(1 for i, _ in ids if i in tracks)
in_funds_only = sum(1 for i, _ in ids if i in funds and i not in tracks)
both = sum(1 for i, _ in ids if i in funds and i in tracks)
neither = [(i, c) for i, c in ids if i not in funds and i not in tracks]
print(f"Gemel-Net {PERIOD}: {len(ids)} distinct FUND_IDs; transfer_bank (gemel): {len(funds)} fund numbers, {len(tracks)} track numbers")
print(f"FUND_ID found as a track number: {in_tracks}; as a fund number only: {in_funds_only}; as both: {both}; in neither: {len(neither)}")
print("in neither, by classification:", json.dumps({c: sum(1 for _, x in neither if x == c) for c in {x for _, x in neither}}, ensure_ascii=False))
