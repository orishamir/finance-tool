"""List the documents the Knesset OData holds for one Israeli law (KNS_DocumentIsraelLaw) and its binding laws.

usage: python3 -I tools/knesset_docs.py <IsraelLawID>
"""
import json
import sys
import urllib.request

BASE = "https://knesset.gov.il/Odata/ParliamentInfo.svc/"


def get(path):
    req = urllib.request.Request(BASE + path, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))


lid = sys.argv[1]
law = get(f"KNS_IsraelLaw({lid})?$format=json")
print("LAW", law.get("IsraelLawID"), law.get("Name"), law.get("PublicationDate"), law.get("LastUpdatedDate"))
for d in get(f"KNS_DocumentIsraelLaw?$filter=IsraelLawID%20eq%20{lid}&$format=json").get("value", []):
    print("  DOC", d.get("GroupTypeDesc"), d.get("ApplicationDesc"), d.get("FilePath"), d.get("LastUpdatedDate"))
