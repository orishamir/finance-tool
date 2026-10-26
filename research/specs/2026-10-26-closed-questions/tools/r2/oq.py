"""Print open-question items from the references by id ("BRK OQ11")."""
import re, sys
R = "/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/.claude/skills/il-finance/references/"
readme = open(R + "README.md").read()
pref = {m.group(2): m.group(1) for m in re.finditer(r"^\| `([a-z0-9-]+\.md)` \| ([A-Z0-9]+) \|", readme, re.M)}
for want in sys.argv[1:]:
    p, n = want.split(" OQ")
    t = open(R + pref[p]).read()
    sec = t[t.index("## Open questions"):]
    sec = re.split(r"^## (?!Open questions)", sec, flags=re.M)[0]
    m = re.search(rf"^{n}\. (.*)$", sec, re.M)
    print(f"=== {want} ({pref[p]})\n{m.group(1) if m else 'NOT FOUND'}\n")
