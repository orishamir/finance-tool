"""Find bills in the Knesset OData (KNS_Bill) by words in the name and list their documents (KNS_DocumentBill).

usage: python3 -I tools/knesset_bill.py "<word1>" ["<word2>" ...]
"""
import json
import sys
import urllib.parse
import urllib.request

BASE = "https://knesset.gov.il/Odata/ParliamentInfo.svc/"


def get(path):
    req = urllib.request.Request(BASE + path, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))


flt = " and ".join(f"substringof('{w}',Name)" for w in sys.argv[1:])
bills = get("KNS_Bill?$filter=" + urllib.parse.quote(flt) + "&$format=json").get("value", [])
for b in bills:
    print("BILL", b.get("BillID"), b.get("KnessetNum"), b.get("Name"), b.get("PublicationDate"))
    for d in get(f"KNS_DocumentBill?$filter=BillID%20eq%20{b.get('BillID')}&$format=json").get("value", []):
        print("   DOC", d.get("GroupTypeDesc"), d.get("FilePath"))
