#!/usr/bin/env python3
"""Build the master table of open questions with site dependencies. Run from the repo root."""
import json, re, glob, os, sys

REFS = ".claude/skills/il-finance/references"
OUT = sys.argv[1]

prefix_of = {}
for line in open(f"{REFS}/README.md", encoding="utf8"):
    m = re.match(r"\| `([a-z0-9-]+\.md)` \| ([A-Z0-9]+) \|", line)
    if m:
        prefix_of[m.group(1)] = m.group(2)

def norm_codes(text, dash_ok=True):
    """Every 'PFX OQn' (also 'PFX-OQn', 'PFX OQ3, OQ4') in text."""
    out = set()
    for m in re.finditer(r"\b([A-Z]{2,4}[0-9]?)[ -]OQ ?(\d+)((?:,? ?(?:and )?OQ ?\d+)*)", text):
        out.add(f"{m.group(1)} OQ{m.group(2)}")
        for n in re.findall(r"OQ ?(\d+)", m.group(3) or ""):
            out.add(f"{m.group(1)} OQ{n}")
    return out

deps = {}
def add(code, kind, where):
    deps.setdefault(code, {}).setdefault(kind, set()).add(where)

# 1. <OQ id> in site content
for f in glob.glob("site/app/content/**/*.tsx", recursive=True):
    for i, line in enumerate(open(f, encoding="utf8"), 1):
        for m in re.finditer(r'<(?:OQ|IdRef)[^>]*\bid="([A-Z0-9]+ OQ\d+)"', line):
            add(m.group(1), "OQ-tag", f"{f}:{i}")

# 2. G-24 blockers (tier2Table) and every method gap
for line in open("docs/method.md", encoding="utf8"):
    m = re.match(r"\| (G-\d+) \|", line)
    if not m:
        continue
    g = m.group(1)
    for c in norm_codes(line):
        add(c, "G-24 blocker" if g == "G-24" else "method gap", g)

# 3. graduation-status blockers: noted per file by hand later; collect the raw section text
grad = {}
for f in sorted(glob.glob(f"{REFS}/*.md")):
    lines = open(f, encoding="utf8").read().split("\n")
    s = next((i for i, l in enumerate(lines) if l.startswith("## Graduation status")), None)
    if s is None:
        continue
    e = next((i for i in range(s + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
    grad[os.path.basename(f)] = "\n".join(lines[s:e])

# 4. instrument records
for f in glob.glob("data/instruments/**/*.json", recursive=True):
    d = json.load(open(f, encoding="utf8"))
    base = os.path.basename(f)[:-5]
    for c in d.get("open_questions") or []:
        add(c.replace("-OQ", " OQ"), "instrument record", base)
    txt = json.dumps(d.get("dimensions", {}), ensure_ascii=False) + json.dumps(d.get("tax_at_exit", {}), ensure_ascii=False)
    for c in norm_codes(txt):
        add(c, "instrument blocker", base)

# 5. site code and copy (not content, not tests)
for f in glob.glob("site/app/**/*.ts*", recursive=True):
    if "/content/" in f or ".test." in f:
        continue
    for i, line in enumerate(open(f, encoding="utf8"), 1):
        for c in norm_codes(line):
            add(c, "site code", f"{os.path.relpath(f, 'site/app')}:{i}")

# 6. rule records and parameters
for f in glob.glob("data/rules/*.json") + glob.glob("data/parameters/*.json"):
    txt = open(f, encoding="utf8").read()
    for c in norm_codes(txt):
        add(c, "rule record" if "/rules/" in f else "parameter", os.path.basename(f)[:-5].upper())

# items
items = []
for f in sorted(glob.glob(f"{REFS}/*.md")):
    name = os.path.basename(f)
    if name in ("README.md", "coverage.md"):
        continue
    lines = open(f, encoding="utf8").read().split("\n")
    s = next(i for i, l in enumerate(lines) if l.startswith("## Open questions"))
    e = next((i for i in range(s + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
    cur = None
    for j in range(s + 1, e):
        l = lines[j]
        m = re.match(r"^(\d+)\. (.*)", l)
        if m:
            cur = {"file": name, "prefix": prefix_of[name], "n": int(m.group(1)), "line": j + 1, "text": m.group(2)}
            items.append(cur)
        elif cur is not None and l.strip():
            cur["text"] += "\n" + l
    # renumber check
for it in items:
    code = f"{it['prefix']} OQ{it['n']}"
    it["code"] = code
    t = it["text"]
    it["struck"] = t.lstrip().startswith("~~")
    md = re.search(r"~~[^~]+~~\s*\**\s*[Cc]losed[^\d]{0,12}(\d{4}-\d{2}-\d{2})", t)
    it["closed_date"] = md.group(1) if md else None
    it["mentions_answer"] = bool(re.search(r"\b([Aa]nswered|[Cc]losed|[Ss]ettled|[Rr]esolved)\b", t))
    it["mentions_narrow"] = bool(re.search(r"\b[Nn]arrowed\b", t))
    d = deps.get(code, {})
    it["deps"] = {k: sorted(v) for k, v in d.items()}
    # graduation-status mention in the same file
    g = grad.get(it["file"], "")
    pat = re.compile(rf"(?:{it['prefix']} )?open questions?[^.\n]*?\b{it['n']}\b", re.I)
    it["grad_mention"] = bool(g and re.search(rf"\b(?:{it['prefix']} )?(?:open question|OQ) ?{it['n']}\b", g))

json.dump({"items": items, "grad": grad, "deps": {k: {kk: sorted(vv) for kk, vv in v.items()} for k, v in deps.items()}}, open(OUT, "w"), ensure_ascii=False, indent=1)
print(len(items), "items;", sum(i["struck"] for i in items), "struck;", sum(1 for i in items if i["closed_date"]), "with closed date")
print("mention answer, not struck:", sum(1 for i in items if i["mentions_answer"] and not i["struck"]))
codes = {i["code"] for i in items}
print("dep codes not matching an item:", sorted(c for c in deps if c not in codes))
print("items with any site dep:", sum(1 for i in items if any(k != "rule record" for k in i["deps"])))
