# Review 3: dimensions a record lacks that its rule-base block lists (non-general records, and every record for fee-account).
import json, glob, re
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
blocks = {}
for f in glob.glob(root + ".claude/skills/il-finance/references/*.md"):
    cur = None
    for line in open(f, encoding="utf-8"):
        m = re.match(r"^### ([A-Z0-9]+-[A-Z0-9]+)\b", line)
        if m: cur = m.group(1); continue
        if cur and line.startswith("- Dimensions:"):
            blocks[cur] = re.findall(r"`?([a-z][a-z0-9-]+)`?", line.split(":", 1)[1])
vocab = {json.load(open(f))["id"] for f in glob.glob(root + "data/dimensions/*.json")}
for f in sorted(glob.glob(root + "data/rules/*.json")):
    r = json.load(open(f))
    b = blocks.get(r["id"])
    if b is None: continue
    missing = [d for d in b if d not in r["dimensions"]]
    if not missing: continue
    if r["scope"] != "general" or "fee-account" in missing:
        print(r["id"], r["scope"], "missing", missing, "| in vocab:", [d for d in missing if d in vocab])
