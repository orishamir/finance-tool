"""List the rows of Discount's 447A money-market feed (work/discount-mmf.json).
Shekel table = the page's own filter: CurrencyCode ILS and ForexExpose 0.
usage: python3 -I tools/discount_mmf.py work/discount-mmf.json [shekel|fx|all] [sort-field]"""
import json
import sys

d = json.load(open(sys.argv[1], encoding="utf-8"))
which = sys.argv[2] if len(sys.argv) > 2 else "shekel"
sort = sys.argv[3] if len(sys.argv) > 3 else "AssetWorth"
rows = d["data"]
if which == "shekel":
    rows = [r for r in rows if r.get("CurrencyCode") == "ILS" and r.get("ForexExpose") == "0"]
elif which == "fx":
    rows = [r for r in rows if not (r.get("CurrencyCode") == "ILS" and r.get("ForexExpose") == "0")]


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return -1


rows.sort(key=lambda r: -num(r.get(sort)))
print("lastUpdatedAt", d.get("lastUpdatedAt"), "rows", len(rows))
for r in rows:
    print(
        r.get("-Key"), "|", r.get("HebName"), "|", r.get("ManagerName"), "| period", r.get("Name"), r.get("PeriodLengthInDays"),
        "| fee", r.get("YearlyManagmentFee"), "| expected", repr(r.get("Value")), "| AssetWorth", r.get("AssetWorth"),
        "| tax", r.get("TaxStatusAsMeta"), "| policy", r.get("InvestingPolicyAsMeta"), "| next", r.get("LastDealTimeAsFund"),
        "| renewal", r.get("Renewal"),
    )
