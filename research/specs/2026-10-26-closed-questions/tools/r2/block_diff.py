"""For each id, say whether its references block changed between two commits (git show)."""
import re, subprocess, sys
base, head, *ids = sys.argv[1:]
def blocks(rev):
    files = subprocess.run(['git','ls-tree','--name-only',rev,'.claude/skills/il-finance/references/'],capture_output=True,text=True).stdout.split()
    out = {}
    for f in files:
        t = subprocess.run(['git','show',f'{rev}:{f}'],capture_output=True,text=True).stdout
        for m in re.finditer(r"^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)", t, re.M):
            out[m.group(1)] = m.group(0)
    return out
a, b = blocks(base), blocks(head)
for i in ids:
    print(i, 'missing' if i not in b else ('same' if a.get(i) == b.get(i) else 'CHANGED'))
