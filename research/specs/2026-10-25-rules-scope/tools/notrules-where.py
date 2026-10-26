# Where each not-general record of the not-rules list (and each exposure's own-provider record) stands today in a product context:
# wrappers and exposures (rule_ids keys), and the guide and exposure prose (quoted ids outside VariesByCompany).
import json, glob, os, re
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
src = open(root + "packages/schema/src/scope.ts").read()
block = src.split("export const notRules")[1].split("};")[0]
ids = re.findall(r'"([A-Z0-9]+-[A-Z0-9]+)"\s*:', block)
rules = {}
for f in glob.glob(root + "data/rules/*.json"):
    r = json.load(open(f)); rules[r["id"]] = r
def rule_ids(node):
    if isinstance(node, list):
        for n in node: yield from rule_ids(n)
    elif isinstance(node, dict):
        for k, v in node.items():
            if k == "rule_ids" and isinstance(v, list):
                for x in v:
                    if isinstance(x, str): yield x
            else: yield from rule_ids(v)
where = {}
for kind in ["wrappers", "exposures"]:
    for f in sorted(glob.glob(root + f"data/instruments/{kind}/**/*.json", recursive=True)):
        rec = json.load(open(f))
        for i in set(rule_ids(rec)):
            where.setdefault(i, set()).add(os.path.relpath(f, root))
for kind in ["guide", "exposure"]:
    for f in sorted(glob.glob(root + f"site/app/content/{kind}/*.tsx")):
        s = re.sub(r"<VariesByCompany\b[^>]*/>", "", open(f).read())
        for i in set(re.findall(r"[\"'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)[\"'`]", s)):
            where.setdefault(i, set()).add(os.path.relpath(f, root))
print("not rules (non-general):")
for i in ids:
    r = rules.get(i)
    if not r: print(" ", i, "no record"); continue
    if r["scope"] == "general": continue
    print(" ", i, r["scope"], sorted(where.get(i, [])))
print("non-general cited in exposures:")
for f in sorted(glob.glob(root + "data/instruments/exposures/**/*.json", recursive=True)):
    rec = json.load(open(f))
    for i in sorted(set(rule_ids(rec))):
        r = rules.get(i)
        if r and r["scope"] != "general": print(" ", rec["id"], i, [x["id"] for x in r.get("scope_institutions", [])])
for f in sorted(glob.glob(root + "site/app/content/exposure/*.tsx")):
    s = re.sub(r"<VariesByCompany\b[^>]*/>", "", open(f).read())
    for i in sorted(set(re.findall(r"[\"'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)[\"'`]", s))):
        r = rules.get(i)
        if r and r["scope"] != "general": print("  prose", os.path.basename(f), i, [x["id"] for x in r.get("scope_institutions", [])])
