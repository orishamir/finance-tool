# Review 2: for every record that is not general, the companies it names whose own document it cites, and where it is listed
# (none for a not-rule). Mirrors isOwnDocument / listedAt in packages/schema/src/scope.ts.
import json, glob, re
from urllib.parse import urlparse
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
reg = {r["id"]: r for r in json.load(open(root + "data/sources/institutions.json"))}
src = open(root + "packages/schema/src/scope.ts").read()
not_rules = set(re.findall(r'^  "([A-Z0-9]+-[A-Z0-9]+)": \{ why', src, re.M))
FILING = {"mayafiles.tase.co.il"}
def own(s, row):
    h = (urlparse(s["url"]).hostname or "").lower().removeprefix("www.")
    if h in FILING: return any(s["title"].startswith(n) or s.get("title_he", "").startswith(n) for n in row.get("filing_names", []))
    return any(h == x or h.endswith("." + x) for x in row["own_hosts"])
unlisted, partial = [], []
for f in sorted(glob.glob(root + "data/rules/*.json")):
    r = json.load(open(f))
    if r["scope"] == "general": continue
    names = [i["id"] for i in r.get("scope_institutions", [])]
    o = [n for n in names if any(own(s, reg[n]) for s in r.get("sources", []))]
    listed = [] if r["id"] in not_rules else o
    tag = "NOT-RULE" if r["id"] in not_rules else ""
    if not listed: unlisted.append((r["id"], names, o, tag))
    elif set(listed) != set(names): partial.append((r["id"], names, listed))
print("listed nowhere:")
for x in unlisted: print("  ", x)
print("listed at only some of the companies it names:")
for x in partial: print("  ", x)
