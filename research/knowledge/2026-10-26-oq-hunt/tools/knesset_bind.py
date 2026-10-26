"""List the bills/laws bound to an Israeli law in the Knesset OData, with their published documents.

usage: python3 -I tools/knesset_bind.py <IsraelLawID>
"""
import json
import sys
import urllib.request

BASE = "https://knesset.gov.il/Odata/ParliamentInfo.svc/"


def get(path):
    req = urllib.request.Request(BASE + path, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))


lid = sys.argv[1]
binds = get(f"KNS_IsraelLawBinding?$filter=IsraelLawID%20eq%20{lid}&$format=json").get("value", [])
seen = set()
for b in binds:
    law = b.get("LawID")
    if law in seen:
        continue
    seen.add(law)
    print("BIND", law, b.get("LawTypeID"), b.get("ParentLawID"), b.get("BindingType"), b.get("BindingTypeDesc"))
    for d in get(f"KNS_DocumentBill?$filter=BillID%20eq%20{law}&$format=json").get("value", []):
        if "רשומות" in (d.get("GroupTypeDesc") or "") or "חוק" in (d.get("GroupTypeDesc") or ""):
            print("   DOC", d.get("GroupTypeDesc"), d.get("FilePath"))
