#!/usr/bin/env python3
"""cat39_pairs.py: in Pension-Net (one report period), does every track of one fund carry the same fee pair?
Groups every row by its fund (PARENT_COMPANY_ID) and counts the distinct (asset fee, deposit fee) pairs."""
import collections, json, subprocess, sys, urllib.parse

PERIOD = int(sys.argv[1]) if len(sys.argv) > 1 else 202609
u = ("https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=1000&filters="
     + urllib.parse.quote(json.dumps({"REPORT_PERIOD": PERIOD})))
recs = json.loads(subprocess.run(["curl", "-sS", "--max-time", "120", u], capture_output=True).stdout)["result"]["records"]
dep = "AVG_DEPOSIT_FEE" if recs and "AVG_DEPOSIT_FEE" in recs[0] else "AVG_FEE_ON_DEPOSITS"
groups = collections.defaultdict(set)
names = {}
for r in recs:
    groups[r.get("PARENT_COMPANY_ID")].add((r.get("AVG_ANNUAL_MANAGEMENT_FEE"), r.get(dep)))
    names[r.get("PARENT_COMPANY_ID")] = (r.get("MANAGING_CORPORATION"), r.get("FUND_CLASSIFICATION"))
multi = {k: v for k, v in groups.items() if len(v) > 1}
print(f"Pension-Net {PERIOD}: {len(recs)} track rows in {len(groups)} funds; funds with more than one fee pair: {len(multi)}")
for k, v in multi.items():
    print(" ", k, names[k], sorted(v, key=str))
