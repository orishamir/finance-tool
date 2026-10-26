"""Read the Ministry of Finance issuance file (data.gov.il goverment-domesticdebt, resource c92fdda2..., Windows-1255 CSV)
and print, for each bond type (BONDS), the rows of its latest auction date.
usage: python3 -I tools/mof_issuance.py work/mof-issuance.csv [--json]"""
import csv
import io
import json
import sys

text = open(sys.argv[1], "rb").read().decode("cp1255")
rows = list(csv.DictReader(io.StringIO(text)))
types = sorted({r["BONDS"] for r in rows})
out = []
for t in types:
    mine = [r for r in rows if r["BONDS"] == t]
    latest = max(r["ISSUANCEDATE"] for r in mine)
    count = len(mine)
    first = min(r["ISSUANCEDATE"] for r in mine)
    for r in mine:
        if r["ISSUANCEDATE"] == latest:
            out.append({"type_rows": count, "type_first": first, **r})
if "--json" in sys.argv:
    print(json.dumps(out, ensure_ascii=False, indent=1))
else:
    print("rows", len(rows), "types", types, "dates", min(r["ISSUANCEDATE"] for r in rows), max(r["ISSUANCEDATE"] for r in rows))
    for r in out:
        print(json.dumps(r, ensure_ascii=False))
