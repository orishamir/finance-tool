"""Print rule blocks (### ID) from the references, by id; and the data/rules record's he fields if it exists."""
import re, glob, sys, json, os
want = sys.argv[1:]
for f in sorted(glob.glob(".claude/skills/il-finance/references/*.md")):
    text = open(f, encoding="utf8").read()
    for m in re.finditer(r"^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)", text, re.M):
        if m.group(1) in want:
            print(f"==== {m.group(1)} ({os.path.basename(f)})")
            print(m.group(0)[:6000])
            p = f"data/rules/{m.group(1).lower()}.json"
            if os.path.exists(p):
                d = json.load(open(p))
                print("  [record]", json.dumps({k: d.get(k) for k in ("title_he", "text_he", "strength", "dimensions", "figures")}, ensure_ascii=False)[:2500])
            else:
                print("  [no data/rules record]")
