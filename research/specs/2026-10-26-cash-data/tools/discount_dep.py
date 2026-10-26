"""Print the 'accepted' (ProductFamily 1) and additional shekel rows of Discount's 447 feed, with the columns the page shows.
usage: python3 -I tools/discount_dep.py work/discount-dep.json [family...]"""
import json
import sys

d = json.load(open(sys.argv[1], encoding="utf-8"))
fams = set(sys.argv[2:]) or {"1"}
print("lastUpdatedAt", d.get("lastUpdatedAt"))
cols = ["ProductCode", "ProductName", "MaturityPeriodDesc", "InterestTypeDesc", "LinkageTypeDesc", "PlacementAmountRange", "ImmediateWithdrawalDesc",
        "Renewals", "MaxRenewals", "ExitPoints", "ExitPointsFreq", "OfferedInterest", "OfferedInterestSub", "NominalInterest", "NominalInterestSub",
        "CurrentPrimeRate", "PeriodLengthInDays", "AvailablePlacementChannelDesc", "ProductRemarks", "EffectiveInterestRate", "InterestTooltip"]
for r in d["data"]:
    if str(r.get("ProductFamily")) not in fams:
        continue
    print("FAM", r.get("ProductFamily"), " | ".join(f"{c}={r.get(c)!r}" for c in cols if r.get(c) not in (None, "")))
