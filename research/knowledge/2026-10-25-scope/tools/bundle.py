#!/usr/bin/env python3
"""bundle.py: one review bundle per rule record, for the independent scope review (2026-10-25).

  python3 research/knowledge/2026-10-25-scope/tools/bundle.py OUT_DIR

Reads data/rules/*.json and, for each record, the matching '### ID' block in
.claude/skills/il-finance/references/*.md with the editor's scope material removed
(every '- Scope:' line, and every inline note from a '2026-10-25 (scope' or
'2026-10-25 scope' marker to the end of its line), so the reviewer is not anchored.
Writes OUT_DIR/records.json (all records) and OUT_DIR/stats.tsv (source mix per record).
"""
import glob, json, os, re, sys

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
REF = ".claude/skills/il-finance/references/*.md"
MARK = re.compile(r"[\[(*]?\s*2026-10-25\s*\(?\s*scope", re.I)

blocks = {}
for f in sorted(glob.glob(REF)):
    cur = None
    for line in open(f, encoding="utf8").read().split("\n"):
        m = re.match(r"^###\s+([A-Z0-9]+-[A-Z]?\d+[A-Za-z]?)\b", line)
        if m:
            cur = m.group(1)
            blocks[cur] = {"file": os.path.basename(f), "lines": [line]}
            continue
        if line.startswith("## ") or line.startswith("### "):
            cur = None
            continue
        if cur is None:
            continue
        if re.match(r"^\s*-\s*Scope\s*:", line, re.I):
            continue
        mm = MARK.search(line)
        if mm:
            line = line[: mm.start()].rstrip() + " [editor scope note removed]"
        blocks[cur]["lines"].append(line)

GEN_KINDS = {"law", "regulation", "circular", "regulator_page", "official_pdf", "exchange_rules", "dataset", "form"}
recs, rows = [], []
for f in sorted(glob.glob("data/rules/*.json")):
    r = json.load(open(f))
    b = blocks.get(r["id"])
    srcs = r["sources"]
    def cls(s):
        if s["strength"] == "institution" or s["kind"] == "institution_doc":
            return "inst"
        if s["strength"] == "secondary" or s["kind"] == "article":
            return "sec"
        if s["kind"] in GEN_KINDS:
            return "gen"
        return "other"
    mix = [cls(s) for s in srcs]
    rec = {
        "id": r["id"], "title": r["title"], "title_he": r["title_he"], "text_he": r["text_he"],
        "strength": r["strength"], "il_finance_file": r["il_finance_file"],
        "sources": [{k: s.get(k) for k in ("url", "title_he", "publisher", "kind", "strength", "locator", "page")} for s in srcs],
        "mix": mix,
        "ref_block": "\n".join(b["lines"]).strip() if b else None,
    }
    recs.append(rec)
    rows.append([r["id"], r["strength"], str(len(srcs)), str(mix.count("gen")), str(mix.count("inst")),
                 str(mix.count("sec")), str(mix.count("other")), "first=" + (mix[0] if mix else "-"), "ref" if b else "noref"])

json.dump(recs, open(os.path.join(out, "records.json"), "w"), ensure_ascii=False, indent=1)
with open(os.path.join(out, "stats.tsv"), "w") as fh:
    fh.write("id\tstrength\tn\tgen\tinst\tsec\tother\tfirst\tref\n")
    for row in rows:
        fh.write("\t".join(row) + "\n")
print(len(recs), "records;", sum(1 for r in recs if r["ref_block"]), "with a references block")
