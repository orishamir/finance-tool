#!/usr/bin/env python3
"""compare.py: the editor's '- Scope:' lines against the reviewer's review.json (run only after review.json is written).

  python3 research/knowledge/2026-10-25-scope/tools/compare.py

Reads every '- Scope:' line under a '### ID' heading in .claude/skills/il-finance/references/*.md, normalises the kind
and the institutions (company groups: 'Meitav Trade' = Meitav, 'Altshuler Shaham Trade' = Altshuler Shaham, ...), and
lists every record where the two readings differ in kind or in the institutions named, plus the records with no Scope
line. Writes work/compare.json and prints a summary.
"""
import glob, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
GROUPS = {
    "mor": "Mor Investment House", "mor investment house": "Mor Investment House",
    "meitav trade": "Meitav", "meitav (meitav trade)": "Meitav", "meitav": "Meitav",
    "altshuler shaham trade": "Altshuler Shaham", "altshuler shaham": "Altshuler Shaham",
    "yelin lapidot": "Yalin Lapidot", "yalin lapidot": "Yalin Lapidot",
    "migdal mutual funds": "Migdal", "migdal": "Migdal",
    "interactive brokers ireland": "Interactive Brokers", "interactive brokers": "Interactive Brokers",
    "blackrock": "iShares", "ishares": "iShares", "phoenix": "The Phoenix", "the phoenix": "The Phoenix",
    "tase": "Tel Aviv Stock Exchange", "tel aviv stock exchange": "Tel Aviv Stock Exchange",
    "menora": "Menora Mivtachim", "menora mivtachim": "Menora Mivtachim", "leumi": "Bank Leumi",
    "mizrahi tefahot": "Mizrahi Tefahot Bank", "fibi": "First International Bank", "first international": "First International Bank",
    "hapoalim": "Bank Hapoalim", "yahav": "Bank Yahav",
}


def norm_name(n):
    n = re.sub(r"\s+", " ", n.strip().strip(".;")).strip()
    n = re.sub(r"\s*\(.*?\)\s*$", "", n) if n.lower() not in GROUPS else n
    return GROUPS.get(n.lower(), n)


def parse_scope(text):
    t = text.strip()
    m = re.match(r"(general|institution|unsettled)\b\s*:?\s*(.*)$", t, re.S | re.I)
    if not m:
        return {"kind": "unparsed", "names": set(), "raw": t}
    kind, rest = m.group(1).lower(), m.group(2)
    names = set()
    if kind == "institution":
        names = {norm_name(x) for x in re.split(r",|;| and ", rest) if x.strip()}
    elif kind == "unsettled":
        sm = re.search(r"seen at:\s*(.*)$", rest, re.I)
        if sm:
            names = {norm_name(x) for x in re.split(r",|;| and ", sm.group(1)) if x.strip()}
    return {"kind": kind, "names": names, "raw": t}


editor, dup = {}, []
for f in sorted(glob.glob(os.path.join(REPO, ".claude/skills/il-finance/references/*.md"))):
    cur = None
    for line in open(f, encoding="utf8").read().split("\n"):
        h = re.match(r"^###\s+([A-Z0-9]+-[A-Z]?\d+[A-Za-z]?)\b", line)
        if h:
            cur = h.group(1)
            continue
        if line.startswith("## "):
            cur = None
        m = re.match(r"^\s*-\s*Scope:\s*(.*)$", line)
        if m and cur:
            if cur in editor:
                dup.append(cur)
            editor[cur] = parse_scope(m.group(1))

review = {v["id"]: v for v in json.load(open(os.path.join(HERE, "..", "review.json")))}


def rnames(v):
    return {norm_name(i["name"] if isinstance(i, dict) else i) for i in v.get("institutions") or []}


rows, no_line = [], []
for i, v in review.items():
    e = editor.get(i)
    if not e:
        no_line.append(i)
        continue
    r_kind, r_names = v["scope"], rnames(v)
    if e["kind"] != r_kind:
        diff = "kind"
    elif r_kind == "institution" and e["names"] != r_names:
        diff = "institutions"
    elif r_kind == "unsettled" and e["names"] and r_names and e["names"] != r_names:
        diff = "seen-at"
    else:
        continue
    rows.append({"id": i, "diff": diff, "editor": e["raw"], "editor_names": sorted(e["names"]),
                 "reviewer": r_kind, "reviewer_names": sorted(r_names), "reviewed_by": v.get("reviewed_by")})
same = sum(1 for i in review if i in editor) - len(rows)
out = {"editor_lines": len(editor), "duplicates": dup, "agree": same, "disagree": rows, "no_scope_line": no_line,
       "editor_ids_not_in_review": sorted(set(editor) - set(review))}
json.dump(out, open(os.path.join(HERE, "work", "compare.json"), "w"), ensure_ascii=False, indent=1)
print(f"editor Scope lines under a rule: {len(editor)} (duplicates: {dup or 'none'}); not in review: {out['editor_ids_not_in_review'] or 'none'}")
print(f"agree: {same}; disagree: {len(rows)} (kind {sum(r['diff']=='kind' for r in rows)}, institutions {sum(r['diff']=='institutions' for r in rows)}, seen-at {sum(r['diff']=='seen-at' for r in rows)}); no Scope line: {len(no_line)}")
for r in rows:
    print(f"  {r['id']:8} {r['diff']:12} editor: {r['editor'][:110]!s}\n  {'':8} {'':12} reviewer: {r['reviewer']} {r['reviewer_names']} ({r['reviewed_by']})")
