# Every company_terms entry of every wrapper: dimension, record, the form (bare string or {rule, companies}), and the companies
# the record names (scope_institutions) against the companies the entry shows.
import json, glob, os
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
rules = {json.load(open(f))["id"]: json.load(open(f)) for f in glob.glob(root + "data/rules/*.json")}
for f in sorted(glob.glob(root + "data/instruments/wrappers/*.json")):
    w = json.load(open(f))
    for dim, refs in (w.get("company_terms") or {}).items():
        for ref in refs:
            rid = ref if isinstance(ref, str) else ref["rule"]
            named = [i["id"] for i in rules[rid].get("scope_institutions", [])]
            shown = named if isinstance(ref, str) else ref["companies"]
            print(f"{os.path.basename(f):38} {dim:24} {rid:8} {'BARE ' if isinstance(ref, str) else 'EXPL '} named={named} shown={shown}")
