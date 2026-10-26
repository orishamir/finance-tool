"""Word diff of one references block between two commits."""
import re, subprocess, sys, difflib
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
    print('=====', i)
    aw, bw = a.get(i,'').split(' '), b.get(i,'').split(' ')
    sm = difflib.SequenceMatcher(None, aw, bw, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != 'equal':
            print(f"  [{op}] -{' '.join(aw[i1:i2])[:600]!r}\n         +{' '.join(bw[j1:j2])[:900]!r}")
