#!/usr/bin/env python3
"""merge.py: merge the reviewer's and the five helpers' verdict files into ../review.json (one entry per record).

  python3 research/knowledge/2026-10-25-scope/tools/merge.py

Checks that every record in data/rules has exactly one verdict and that each verdict carries what its scope needs
(a quote for general, institutions for institution, settle for unsettled).
"""
import glob, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
GROUP = {}
merged = {}
for f in sorted(glob.glob(os.path.join(HERE, "work", "verdicts-G*.json"))):
    g = re.search(r"verdicts-(G\d)", f).group(1)
    for v in json.load(open(f)):
        assert v["id"] not in merged, "duplicate " + v["id"]
        merged[v["id"]] = v
        GROUP[v["id"]] = g
ids = sorted(json.load(open(p))["id"] for p in glob.glob(os.path.join(REPO, "data", "rules", "*.json")))
missing = [i for i in ids if i not in merged]
extra = [i for i in merged if i not in ids]
assert not missing and not extra, (missing, extra)

BY_EYE = {
    "KGL-01": "read by the reviewer on the rendered page (Knesset PDF p.2, gazette p.885); the text layer is interleaved",
    "PF-28": "read by the reviewer on the rendered page (Knesset PDF p.11, gazette p.23, para (7)); the text layer is interleaved",
    "PEN-03": "read by helper G2 on the rendered page (image scan, no text layer)",
    "SW-24": "read by helper G2 on the rendered page (text layer scrambled)",
}
NO_QUOTE = {"TXI-25", "TXS-24"}
ORDER = ["id", "scope", "institutions", "general_source", "settle", "split", "company_doc_needed", "note", "text_issue"]
out, problems = [], []


def key(i):
    p, n = i.split("-", 1)
    m = re.match(r"([A-Z]?)(\d+)", n)
    return (p, m.group(1), int(m.group(2)))


for i in sorted(ids, key=key):
    v = merged[i]
    e = {k: v[k] for k in ORDER if k in v and v[k] not in (None, "", [])}
    e["reviewed_by"] = "reviewer" if GROUP[i] == "G0" else "helper " + GROUP[i]
    if e["scope"] == "general":
        read = str((e.get("general_source") or {}).get("read", ""))
        if i in BY_EYE:
            e["quote_check"] = BY_EYE[i]
        elif "dataset" in read:
            e["quote_check"] = "dataset count by script (no sentence to quote)"
        elif read.startswith("fetched"):
            e["quote_check"] = "whole quote found in the fetched source by verify_quotes.py"
        elif i in NO_QUOTE:
            e["quote_check"] = "NO QUOTE: the source could not be read; general is not proven"
        else:
            e["quote_check"] = "recorded only: the source could not be fetched by script; quote taken from the record or read on a rendered page"
    if e["scope"] == "general" and not (e.get("general_source") or {}).get("quote"):
        problems.append(i + ": general without a quote")
    if e["scope"] == "institution" and not e.get("institutions"):
        problems.append(i + ": institution without names")
    if e["scope"] == "unsettled" and not e.get("settle"):
        problems.append(i + ": unsettled without settle")
    out.append(e)
dst = os.path.join(HERE, "..", "review.json")
json.dump(out, open(dst, "w"), ensure_ascii=False, indent=1)
print(len(out), "verdicts ->", os.path.relpath(dst, REPO))
print("problems:", problems or "none")
