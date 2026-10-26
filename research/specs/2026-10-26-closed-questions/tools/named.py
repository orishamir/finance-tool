"""The open questions the site names after this branch: string literals in site/app (tests and comments left out), the guide records'
lists and marks, the rule records' Hebrew text, and the closures of the not-covered page. Prints each with its status and whether
it has a Hebrew title yet. Run from the worktree root; `--json` writes the list to tools/named.json."""
import glob
import json
import re
import sys

qs = {q["id"]: q for q in json.load(open("data/open-questions.json"))}
CODE = re.compile(r"\b([A-Z][A-Z0-9]*)[ -]OQ ?(\d+)\b")
TOKENS = re.compile(r'"(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\'|`(?:[^`\\]|\\.)*`|//[^\n]*|/\*[\s\S]*?\*/')
where = {}


def add(code, place):
    where.setdefault(code, set()).add(place)


for f in glob.glob("site/app/**/*.ts*", recursive=True):
    if ".test." in f:
        continue
    src = open(f, encoding="utf8").read()
    for t in TOKENS.finditer(src):
        tok = t.group(0)
        if tok.startswith("//") or tok.startswith("/*"):
            continue
        for m in CODE.finditer(tok):
            add(f"{m.group(1)} OQ{m.group(2)}", f[len("site/app/"):])

for f in glob.glob("data/instruments/*/*.json"):
    d = json.load(open(f))
    name = f.split("/")[-1][:-5]
    for c in d.get("open_questions") or []:
        add(c.replace("-OQ", " OQ"), f"record {name}")
    for c in (d.get("tax_at_exit") or {}).get("blocked_by") or []:
        add(c.replace("-OQ", " OQ"), f"exit blocker {name}")
    for dim, mark in (d.get("dimensions") or {}).items():
        if isinstance(mark, str) and mark.startswith("blocked:"):
            add(mark[8:].replace("-OQ", " OQ"), f"blocked {dim} {name}")

for f in glob.glob("data/rules/*.json"):
    d = json.load(open(f))
    for k in ("title_he", "text_he"):
        for m in CODE.finditer(d.get(k) or ""):
            add(f"{m.group(1)} OQ{m.group(2)}", f"rule text {d['id']}")

# the not-covered page: struck "open question(s) N" in the tier-2 files' Graduation status sections
SOURCES = {"savings-policies-and-executive-insurance.md": "INS", "fx-and-structured-deposits.md": "FXD", "corporate-bonds.md": "CORP",
           "managed-and-robo-portfolios.md": "MGD", "reits-and-gold-funds.md": "RG", "tax-insurance-and-amendment-190.md": "TXA"}
for file, prefix in SOURCES.items():
    text = open(f".claude/skills/il-finance/references/{file}", encoding="utf8").read()
    m = re.search(r"^## Graduation status[^\n]*\n([\s\S]*?)(?=^## )", text, re.M)
    for s in re.finditer(r"~~([^~]+)~~", m.group(1) if m else ""):
        q = re.search(r"(?:\b([A-Z]{2,4}\d?) )?open questions? (\d+(?:(?:,| and| to) \d+)*)", s.group(1), re.I)
        if q:
            for n in re.split(r",| and | to ", q.group(2)):
                add(f"{q.group(1) or prefix} OQ{n.strip()}", "not-covered closure")

rows = []
for code in sorted(where, key=lambda c: (c.split(" ")[0], int(c.split("OQ")[1]))):
    q = qs.get(code)
    rows.append({"id": code, "status": q["status"] if q else "MISSING", "title": bool(q and q.get("title_he")), "where": sorted(where[code])})
if "--json" in sys.argv:
    json.dump(rows, open("research/specs/2026-10-26-closed-questions/tools/named.json", "w"), ensure_ascii=False, indent=1)
for r in rows:
    print(f"{r['id']:10} {r['status']:9} {'T' if r['title'] else '-'}  {'; '.join(r['where'])[:150]}")
print(len(rows), "named;", sum(1 for r in rows if not r["title"]), "without a Hebrew title;", sum(1 for r in rows if r["status"] == "MISSING"), "not in the file")
