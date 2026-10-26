"""Find a law in the Knesset's OData (KNS_IsraelLaw) by a word in its name and list its documents (KNS_DocumentIsraelLaw).

usage: python3 -I tools/knesset_law.py "<word in law name>"
"""
import json
import sys
import urllib.parse
import urllib.request

BASE = "https://knesset.gov.il/Odata/ParliamentInfo.svc/"
word = sys.argv[1]


def get(path):
    req = urllib.request.Request(BASE + path, headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))


q = "KNS_IsraelLaw?$filter=" + urllib.parse.quote(f"substringof('{word}',Name)") + "&$format=json"
laws = get(q).get("value", [])
for law in laws:
    print("LAW", law.get("IsraelLawID"), law.get("Name"), law.get("PublicationDate"))
    lid = law.get("IsraelLawID")
    docs = get(f"KNS_DocumentIsraelLaw?$filter=IsraelLawID%20eq%20{lid}&$format=json").get("value", [])
    for d in docs:
        print("   DOC", d.get("GroupTypeDesc"), d.get("ApplicationDesc"), d.get("FilePath"))
