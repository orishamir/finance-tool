"""One batched MediaWiki API call (POST): latest revision id and timestamp for every Wikisource title in tools/laws.json.

usage: python3 -I tools/wikirevs.py <laws.json> <out.json>
"""
import json
import sys
import urllib.parse
import urllib.request

laws = [l for l in json.load(open(sys.argv[1], encoding="utf-8")) if l["key"] != "search"]
titles = [l["wikisource_title"] for l in laws]
q = urllib.parse.urlencode({"action": "query", "prop": "revisions", "rvprop": "ids|timestamp", "format": "json", "titles": "|".join(titles)})
req = urllib.request.Request("https://he.wikisource.org/w/api.php", data=q.encode(), headers={"User-Agent": "finance-tool-research/1.0 (personal, non-commercial)", "Content-Type": "application/x-www-form-urlencoded"})
d = json.loads(urllib.request.urlopen(req, timeout=60).read().decode("utf-8"))
norm = {n["from"]: n["to"] for n in d["query"].get("normalized", [])}
bytitle = {p["title"]: p for p in d["query"]["pages"].values()}
out = {}
for l in laws:
    t = norm.get(l["wikisource_title"], l["wikisource_title"])
    p = bytitle.get(t, {})
    r = (p.get("revisions") or [{}])[0]
    out[l["key"]] = {"title": t, "revid": r.get("revid"), "timestamp": r.get("timestamp"), "missing": "missing" in p}
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, v["revid"], v["timestamp"], "MISSING" if v["missing"] else "")
