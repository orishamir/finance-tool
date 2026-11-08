"""Rewrite the generated tables of docs/glossary.md from merged.json: dedupe, group, and render with sources.
Second of the three glossary generators, all run by `npm run gen:terms`. Takes another output file as its argument."""
import json, pathlib, sys

root = pathlib.Path(__file__).resolve().parents[3]
rows = json.loads((root / "research" / "glossary" / "merged.json").read_text())
out_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "docs" / "glossary.md"

CORE = ["tax-at-deposit", "tax-during", "tax-at-exit", "real-vs-nominal", "age-or-use-exemption",
        "switching-tax-event", "loss-offset", "foreign-withholding-domicile", "distribution-policy",
        "fee-management-balance", "fee-deposit", "fee-trade", "fee-custody", "fee-fx", "fee-exit",
        "fee-change-over-time", "liquidity-lockup", "deposit-ceiling", "protection", "currency", "minimum",
        "regulator", "reporting-obligation", "eligibility", "transfer-switch-process", "insurance-cover"]
# Checklist row names follow the spelling decisions in section 5, so a row and its glossary term match.
NAME_OVERRIDES = {"fee-management-balance": "דמי ניהול מחיסכון", "fee-custody": "דמי ניהול פיקדון ניירות ערך", "fee-fx": "עמלת חליפין"}
RATE_TABLE_ONLY = {"לא מוצעת ריבית על יתרת זכות בחשבון", "פיקדון שכיח", "טווח סכום להפקדה"}
RANK = {"primary": 0, "primary-mirror": 1, "institution": 2, "secondary": 3, None: 4}
STRENGTH_HE = {"primary": "מקור ראשי", "primary-mirror": "מקור ראשי (עותק)", "institution": "מקור מוסדי",
               "secondary": "מקור משני", None: "—"}
TIER2 = "מוצרים שהאתר עוד לא מכסה"
TOPICS = ["מזומן, פיקדונות, קרנות כספיות ואג״ח ממשלתיות", "ניירות ערך, קרנות סל וחשבון ניירות ערך",
          "קופת גמל להשקעה, קרן השתלמות, ניהול אישי וחיסכון לכל ילד", "פנסיה, מסלולים ומי מפקח", "מס"]


def esc(s):
    return (s or "").replace("|", "\\|").replace("\n", " ").strip()


def src_cell(r):
    s = r.get("source") or {}
    ids = ", ".join(r.get("rule_ids") or [])
    # the whole title (2026-11-07): /not-covered shows this cell's title, and a title cut with "…" read as a broken citation
    title = esc(s.get("title"))
    link = f"[{title}]({s['url']})" if s.get("url", "").startswith("http") else title or "—"
    parts = [p for p in [ids, link, s.get("checked"), STRENGTH_HE.get(s.get("strength"))] if p]
    return " · ".join(parts)


# Dedupe terms by Hebrew spelling, keeping the strongest source and merging the rest.
terms, dims = {}, []
for r in rows:
    if r.get("kind") == "dimension":
        dims.append(r)
        continue
    # The same word can mean different things in different products (a fund's fee vs a provident
    # fund's fees), so only rows with the same word AND the same topic are merged.
    k = (esc(r.get("term_he")), r.get("group"))
    if k not in terms:
        terms[k] = r
        continue
    a = terms[k]
    keep, other = (a, r) if RANK.get((a.get("source") or {}).get("strength"), 4) <= RANK.get((r.get("source") or {}).get("strength"), 4) else (r, a)
    if keep.get("explain_he") is None and other.get("explain_he"):
        keep, other = other, keep
    if keep.get("explain_he") and other.get("explain_he") and keep["explain_he"] != other["explain_he"]:
        terms[(k[0], k[1], "2")] = other  # two senses within one topic: keep both rows
        continue
    keep["variants_he"] = sorted(set((keep.get("variants_he") or []) + (other.get("variants_he") or [])) - {k[0]})
    keep["rule_ids"] = list(dict.fromkeys((keep.get("rule_ids") or []) + (other.get("rule_ids") or [])))
    keep["where"] = list(dict.fromkeys((keep.get("where") or []) + (other.get("where") or [])))
    terms[k] = keep

missing = [r for r in rows if r.get("kind") != "dimension" and r.get("explain_he") is None]
optional = [r for r in terms.values() if esc(r.get("term_he")) in RATE_TABLE_ONLY]
present = [r for r in terms.values() if r.get("explain_he") is not None and esc(r.get("term_he")) not in RATE_TABLE_ONLY]


def table(rs, with_where=False):
    lines = ["| מונח | הסבר | נקרא גם | מקור |", "|---|---|---|---|"]
    for r in sorted(rs, key=lambda x: esc(x.get("term_he"))):
        v = "، ".join(esc(x) for x in (r.get("variants_he") or []) if x) or ""
        v = v.replace("، ", " · ")
        lines.append(f"| **{esc(r.get('term_he'))}** | {esc(r.get('explain_he'))} | {v} | {src_cell(r)} |")
    return "\n".join(lines)


# The file keeps its hand-written parts: the introduction, section 4 (the generator's missing rows are printed below for the
# editor, who keeps that section by hand), section 5 and section 6. Only the tables of sections 1, 2 and 3 and of the two
# appendices are rewritten; the lines that lead each of those sections stay as they are in the file.
def checklist():
    out = ["| Row | Name | What it checks |", "|---|---|---|"]
    for cid in CORE:
        d = next((x for x in dims if x.get("id") == cid), None)
        if d:
            out.append(f"| `{cid}` | **{esc(NAME_OVERRIDES.get(cid, d['term_he']))}** | {esc(d['explain_he'])} |")
    return "\n".join(out)


def proposed():
    out = ["| Row | Name | What it checks |", "|---|---|---|"]
    for d in dims:
        if d.get("id") not in CORE:
            out.append(f"| `{d.get('id')}` | **{esc(d['term_he'])}** | {esc(d['explain_he'])} |")
    return "\n".join(out)


t2 = [r for r in present if r.get("group") == TIER2]
GENERATED = {
    "## 1.": lambda: "\n\n".join(f"### {t}\n\n{len([r for r in present if r.get('group') == t])} terms.\n\n" + table([r for r in present if r.get("group") == t]) for t in TOPICS),
    "## 2.": checklist,
    "## 3.": lambda: table(t2),
    "## Appendix A.": lambda: table(optional),
    "## Appendix B.": proposed,
}
text = out_path.read_text()
chunks, cur = [], []
for line in text.split("\n"):
    if line.startswith("## ") and cur:
        chunks.append(cur)
        cur = []
    cur.append(line)
chunks.append(cur)
L = []
done = set()
for ch in chunks:
    key = next((k for k in GENERATED if ch[0].startswith(k)), None)
    if not key:
        L.append("\n".join(ch))
        continue
    done.add(key)
    lead = []
    for line in ch:
        if line.startswith("|") or line.startswith("### "):
            break
        lead.append(line)
    tail = []
    for line in reversed(ch):
        if line.startswith("|"):
            break
        tail.insert(0, line)
    while lead and lead[-1] == "":
        lead.pop()
    L.append("\n".join(lead + [""] + GENERATED[key]().split("\n") + tail))
missing_sections = [k for k in GENERATED if k not in done]
if missing_sections:
    sys.exit(f"headings not found in {out_path}: {missing_sections}")

out_path.write_text("\n".join(L))
for r in sorted(missing, key=lambda x: esc(x.get("term_he"))):
    print(f"no explanation (keep in section 4 by hand): {esc(r.get('term_he'))}")
print(f"terms {len(present)} · checklist {len(CORE)} · tier-2 {len(t2)} · missing {len(missing)} · rate-table {len(optional)} · proposed rows {len([d for d in dims if d.get('id') not in CORE])}")
print("by topic:", {t: len([r for r in present if r.get('group') == t]) for t in TOPICS})
