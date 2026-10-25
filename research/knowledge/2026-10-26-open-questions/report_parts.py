#!/usr/bin/env python3
"""Generate the table and closure sections of the open-questions report. Run from the repo root; writes OUT."""
import json, sys, re
D = "research/knowledge/2026-10-26-open-questions"
OUT = sys.argv[1]
r = json.load(open(f"{D}/merged.json"))
before = json.load(open(f"{D}/table-before.json"))
after = json.load(open(f"{D}/table-after.json"))
bi = {i["code"]: i for i in before["items"]}
ai = {i["code"]: i for i in after["items"]}
order = [i["code"] for i in before["items"]]

def esc(s):
    return (s or "").replace("|", "\\|").replace("\n", " ").strip()

def deplabel(code):
    a = ai[code]; d = a["deps"]; out = []
    if "OQ-tag" in d: out.append(f"guide prose ({len(d['OQ-tag'])})")
    if "G-24 blocker" in d:
        out.append("not-covered page (G-24)" if r[code]["class_after"] != "closed-marked" else "G-24 (removed today)")
    elif "G-24 blocker" in bi[code]["deps"]:
        out.append("G-24 (removed today)")
    if "method gap" in d: out.append("method " + ", ".join(d["method gap"]))
    if "instrument blocker" in d: out.append("blocks a guide dimension")
    elif "instrument record" in d: out.append("listed on guide pages")
    if "site code" in d: out.append("site code/copy")
    if "rule record" in d: out.append("rule text " + ", ".join(d["rule record"][:3]))
    if a["grad_mention"]: out.append("graduation status")
    return "; ".join(out) or "none"

CLS = {"closed-marked": "closed", "answered-not-marked": "answered, not marked", "narrowed": "narrowed", "open": "open"}
lines = []
lines.append("| File | No. | Question | Before | After | What on the site depends on it | What settles it, or the closure |")
lines.append("|---|---|---|---|---|---|---|")
for c in order:
    v = r[c]
    pre, n = c.split(" OQ")
    if v["class_after"] == "closed-marked":
        rule_ids = sorted(set(re.findall(r"\b[A-Z]{2,4}\d?-\d{2}\b", v.get("answer") or "")))
        how = {"already": "already struck", "phase-a": "struck today from the rule base", "phase-b": "settled today from a new source"}[v["closed_by"]]
        last = f"closed {v['closed_date']}, {how}" + (f" ({', '.join(rule_ids)})" if rule_ids else "")
    else:
        last = esc(v.get("settle") or v.get("remains"))
    lines.append(f"| {pre} | {n} | {esc(v['title'])} | {CLS[v['class_before']]} | {CLS[v['class_after']]} | {esc(deplabel(c))} | {last} |")
table = "\n".join(lines)

# closures
pa, pb, al = [], [], []
for c in order:
    v = r[c]
    if v["class_after"] != "closed-marked":
        continue
    if v["closed_by"] == "phase-a":
        pa.append(f"- **{c}** ({v['closed_date']}): {esc(v['answer'])}")
    elif v["closed_by"] == "phase-b":
        s = v.get("source") or {}
        pb.append(f"- **{c}** ({v['closed_date']}): {esc(v['answer'])}\n  - Source: [{esc(s.get('title'))}]({s.get('url')}), {esc(s.get('locator'))}: \"{esc(s.get('quote'))}\" · checked {s.get('checked')}")
    else:
        al.append(f"- **{c}** ({v['closed_date']})")
# blocked pages
bp = {}
for c in order:
    for u in r[c].get("blocked_pages") or []:
        bp.setdefault(u, []).append(c)
bpl = [f"- {u} (for {', '.join(cs)})" for u, cs in sorted(bp.items())]
# where the site still names a closed question
places = {"OQ-tag": [], "site code": [], "instrument record": [], "instrument blocker": [], "rule record": [], "method gap": []}
for c in order:
    if r[c]["class_after"] != "closed-marked":
        continue
    d = ai[c]["deps"]
    for k in places:
        if k in d:
            places[k].append(f"- {c} (closed {r[c]['closed_date']}): {', '.join(d[k])}")
notes = [f"- **{c}**: {esc(r[c]['notes'])}" for c in order if r[c].get("notes")]
open(OUT, "w", encoding="utf8").write(json.dumps({
    "table": table, "phase_a": "\n".join(pa), "phase_b": "\n".join(pb), "already": "\n".join(al),
    "blocked": "\n".join(bpl), "places": {k: "\n".join(v) for k, v in places.items()}, "notes": "\n".join(notes),
    "counts": {"phase_a": len(pa), "phase_b": len(pb), "already": len(al)},
}, ensure_ascii=False))
print({"phase_a": len(pa), "phase_b": len(pb), "already": len(al), "blocked": len(bpl), "notes": len(notes)})
