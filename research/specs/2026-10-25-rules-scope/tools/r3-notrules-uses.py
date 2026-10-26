# Review 3: every file that names a not-rule (the not-rules list in packages/schema/src/scope.ts): site code (quoted ids) and data
# files outside data/rules (ids under rule_ids, or anywhere as a quoted string), so the list of files is honest.
import json, glob, os, re
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
src = open(root + "packages/schema/src/scope.ts", encoding="utf-8").read()
ids = re.findall(r'^  "([A-Z0-9]+-[A-Z0-9]+)": \{ why', src, re.M)
scope = {}
for f in glob.glob(root + "data/rules/*.json"):
    r = json.load(open(f)); scope[r["id"]] = r["scope"]
hits = {i: set() for i in ids}
def code(s):
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    return re.sub(r"^\s*//.*$", "", s, flags=re.M)
for f in glob.glob(root + "site/app/**/*.ts*", recursive=True):
    if ".test." in f: continue
    s = code(open(f, encoding="utf-8").read())
    for m in re.findall(r"[\"'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)[\"'`]", s):
        if m in hits: hits[m].add(os.path.relpath(f, root))
for f in glob.glob(root + "data/**/*.json", recursive=True):
    rel = os.path.relpath(f, root)
    if rel.startswith("data/rules/"): continue
    s = open(f, encoding="utf-8").read()
    for m in re.findall(r'"([A-Z][A-Z0-9]*-[A-Z0-9]+)"', s):
        if m in hits: hits[m].add(rel)
for i in ids:
    print(i, scope.get(i, "no record"), sorted(hits[i]))
