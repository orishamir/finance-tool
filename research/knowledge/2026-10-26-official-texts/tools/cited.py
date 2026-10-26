"""Resolve each Wikisource citation's section numbers to the Wikisource page's own section ids.

usage: python3 -I tools/cited.py <citations-raw.json> <laws.json> <wiki-dir> <out.json>

"125C(a)" -> "125ג"; "9(16A)(a)" -> "9.16א" when the page has that paragraph, else "9*";
"64A3(a)(5א)" -> "64א3"; "3(ה5)" -> "3"; a bare "9" on a page with paragraphs 9.x -> "9*".
out.json: {law_key: {"title", "sections": {wiki_id: [contexts]}, "unresolved": [[context, token]], "no_section": [contexts]}}
"""
import json
import re
import sys
from collections import OrderedDict

LAT = dict(zip("ABCDEFGHIJ", "אבגדהוזחטי"))
LAT.update(dict(zip("abcdefghij", "אבגדהוזחטי")))

cites = json.load(open(sys.argv[1], encoding="utf-8"))["citations"]
laws = json.load(open(sys.argv[2], encoding="utf-8"))
wdir = sys.argv[3]
key_of = {l["wikisource_title"]: l["key"] for l in laws}

ids = {}
for l in laws:
    if l["key"] == "search":
        continue
    ids[l["key"]] = [s["id"] for s in json.load(open(f"{wdir}/{l['key']}.json", encoding="utf-8"))["sections"]]


def heb(x):
    return "".join(LAT.get(ch, ch) for ch in x)


def resolve(key, tok):
    have = ids[key]
    m = re.match(r"^(\d+)([A-Za-zא-ת]{0,2})(\d*)((?:\([^)]*\))*)", tok)
    if not m:
        return None
    base = m.group(1) + heb(m.group(2)) + m.group(3)
    parens = re.findall(r"\(([^)]*)\)", m.group(4))
    if parens:
        p = heb(parens[0])
        if re.match(r"^\d", p) and f"{base}.{p}" in have:
            return f"{base}.{p}"
    if base in have:
        if any(h.startswith(base + ".") for h in have):
            return base + "*"
        return base
    return None


out = OrderedDict()
for c in cites:
    key = key_of.get(c["title"])
    if not key or key == "search":
        continue
    e = out.setdefault(key, {"title": c["title"], "sections": OrderedDict(), "unresolved": [], "no_section": []})
    ctx = c["context"] or "?"
    if not c["sections"]:
        e["no_section"].append(ctx)
    for t in c["sections"]:
        r = resolve(key, t)
        if r:
            e["sections"].setdefault(r, [])
            if ctx not in e["sections"][r]:
                e["sections"][r].append(ctx)
        else:
            e["unresolved"].append([ctx, t])
json.dump(out, open(sys.argv[4], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, e in out.items():
    print(k, len(e["sections"]), "sections;", len(e["unresolved"]), "unresolved", e["unresolved"][:8])
