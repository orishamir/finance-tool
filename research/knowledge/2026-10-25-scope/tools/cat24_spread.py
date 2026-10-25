#!/usr/bin/env python3
"""cat24_spread.py: for one standard track name (SUB_SPECIALIZATION) in one Gemel-Net period, the stock and foreign
exposure share of every manager's track. Tests CAT-24's "the same standard name can differ widely between managers"
over every collected row, instead of one manager's page against another's."""
import json, subprocess, sys, urllib.parse

SUB = sys.argv[1] if len(sys.argv) > 1 else "משולב סחיר"
PERIOD = int(sys.argv[2]) if len(sys.argv) > 2 else 202609
filters = {"REPORT_PERIOD": PERIOD, "SUB_SPECIALIZATION": SUB}
u = ("https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=1000&filters="
     + urllib.parse.quote(json.dumps(filters, ensure_ascii=False)))
recs = json.loads(subprocess.run(["curl", "-sS", "--max-time", "120", u], capture_output=True).stdout)["result"]["records"]
print(f"{SUB}, {PERIOD}: {len(recs)} rows")
for r in sorted(recs, key=lambda r: (r["FUND_CLASSIFICATION"], r["MANAGING_CORPORATION"])):
    ta = r["TOTAL_ASSETS"] or 0
    st = 100 * (r["STOCK_MARKET_EXPOSURE"] or 0) / ta if ta else None
    fx = 100 * (r["FOREIGN_EXPOSURE"] or 0) / ta if ta else None
    print(f'{r["FUND_ID"]:>6} {r["FUND_CLASSIFICATION"][:18]:<18} {r["MANAGING_CORPORATION"][:28]:<28} stocks {st:6.1f}%  foreign {fx:6.1f}%' if ta else f'{r["FUND_ID"]} no assets')
