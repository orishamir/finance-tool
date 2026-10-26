"""Print rule blocks (### ID) from the references markdown, by id."""
import re, glob, sys, os
want = sys.argv[1:]
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/.claude/skills/il-finance/references/"
for f in sorted(glob.glob(root + "*.md")):
    text = open(f, encoding="utf8").read()
    for m in re.finditer(r"^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)", text, re.M):
        if m.group(1) in want:
            print(f"==== {m.group(1)} ({os.path.basename(f)})")
            print(m.group(0))
