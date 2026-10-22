"""Build docs/glossary.md from merged.json: dedupe, group, and render with sources."""
import json, pathlib, sys

here = pathlib.Path(__file__).parent
rows = json.loads((here / "merged.json").read_text())
out_path = pathlib.Path(sys.argv[1])

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
TOPICS = ["מזומן, פיקדונות, קרנות כספיות ואג״ח ממשלתיות", "ניירות ערך, קרנות סל וחשבון השקעות",
          "קופת גמל להשקעה, קרן השתלמות, ניהול אישי וחיסכון לכל ילד", "פנסיה, מסלולים ומי מפקח", "מס"]


def esc(s):
    return (s or "").replace("|", "\\|").replace("\n", " ").strip()


def src_cell(r):
    s = r.get("source") or {}
    ids = ", ".join(r.get("rule_ids") or [])
    title = esc(s.get("title"))
    if len(title) > 90:
        title = title[:87].rstrip() + "…"
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


L = []
L.append("""# Glossary

Written 2026-10-23 by the UX writer with six research passes over the il-finance rule base (`.claude/skills/il-finance/references/`). Status: **draft for founder review.** UI text is in `docs/copy.md`.

Every explanation below comes from the rule base, never from memory. Each row gives the official Hebrew term (the spelling of the most official source in the rule base), a plain one-line explanation, other spellings people meet in apps, ads and statements, and the source: the rule IDs, the document, the date it was checked and how strong it is. Explanations hold no figures; figures change and the site shows them as sourced numbers.

Where the rule base cannot explain a term, the term is listed in section 4 as missing and the site must not explain it until the rule base does.

The rows are generated from the research files in `research/glossary/terms/` by `research/glossary/merge_terms.py` then `gen_glossary.py docs/glossary.md`; regenerate rather than hand-edit when the rule base changes. When the guide pages are built, these rows move into `data/terms/` (`docs/data-schema.md` 3.11), with the same sources.

---

## 1. Terms by topic
""")
for t in TOPICS:
    rs = [r for r in present if r.get("group") == t]
    L.append(f"### {t}\n\n{len(rs)} terms.\n\n" + table(rs) + "\n")

L.append("---\n\n## 2. The checklist (\"מה לבדוק\")\n\nThe rows every guide page and track page shows. The name is what the row says; the explanation is what the row checks. Source: `docs/product.md` 3.3 and the dimension vocabulary in the rule base's README.\n")
L.append("| Row | Name | What it checks |\n|---|---|---|")
for cid in CORE:
    d = next((x for x in dims if x.get("id") == cid), None)
    if d:
        L.append(f"| `{cid}` | **{esc(NAME_OVERRIDES.get(cid, d['term_he']))}** | {esc(d['explain_he'])} |")
L.append("")

t2 = [r for r in present if r.get("group") == "מוצרים שהאתר עוד לא מכסה"]
L.append("---\n\n## 3. Not covered yet\n\nThe products on the \"מה האתר עוד לא מכסה\" page, and words a reader of that page meets.\n\n" + table(t2) + "\n")

L.append("---\n\n## 4. Missing from the rule base\n\nThe site must not explain these until the rule base does (CLAUDE.md: never fill in a rule or meaning from memory). Each needs a research pass.\n")
L.append("| Term | What is missing |\n|---|---|")
for r in sorted(missing, key=lambda x: esc(x.get("term_he"))):
    note = esc(r.get("notes")).replace("missing in il-finance:", "").replace("missing in il-finance", "").strip(" :;.-")
    L.append(f"| **{esc(r.get('term_he'))}** | {note[:260]} |")
L.append("")

L.append("""---

## 5. Spelling decisions

Where official sources disagree, the glossary uses the most official source's spelling and lists the others under "נקרא גם". The cases a reader is most likely to notice:

| Glossary uses | Also seen | Why |
|---|---|---|
| קרן חדשה מקיפה | קרן פנסיה מקיפה חדשה, קרן פנסיה חדשה מקיפה | the law and the regulations; statements and ads add "פנסיה" |
| קופת גמל לקצבה | קופת גמל לקיצבה | the Provident Funds Law; the Income Tax Ordinance writes קיצבה |
| מס נוסף | מס יסף | the law and the Tax Authority booklet heading |
| דמי ביטוח בריאות | מס בריאות | National Insurance and the law (the site does not compute it, D14) |
| ניכוי מס במקור | ניכוי במקור | Tax Authority documents |
| דמי ניהול פיקדון ניירות ערך | דמי משמורת, דמי משמרת | Bank of Israel; the tax regulations say דמי משמורת, brokers say דמי משמרת |
| עמלת חליפין | עמלת המרה | Bank of Israel tariff wording |
| קרן שאינה מחלקת | קרן צבירה, קרן צוברת | Israel Securities Authority |
| קרן חוץ | קרן זרה הרשומה למסחר בתל אביב | the law and the ISA's 2025 report |
| קרן מועדים קבועים | קרן כספית מתחדשת | the law; the ISA and ads say קרן כספית מתחדשת, which the site shows as the variant people know |
| מילווה קצר מועד (מק״מ) | מלווה קצר מועד, מק״ם | the law; directive 447A abbreviates |
| תחנת יציאה | נקודת יציאה | directive 447 and the withholding regulations |
| חיסכון ארוך טווח לילד | חיסכון לכל ילד, חסכון לכל ילד | the law; National Insurance's name is the one people know and is shown with it |
| העברת כספים בין קופות גמל | ניוד | the transfer regulations |
| מעסיק | מעביד | the Wage Protection Law and payslips; the Income Tax Ordinance writes מעביד |
| דמי ניהול מחיסכון | דמי ניהול מצבירה, דמי ניהול מהצבירה | the Capital Market Authority's uniform notice; funds and apps say מצבירה |
| דמי ניהול מהפקדה | דמי ניהול מההפקדה, מתוך התשלומים | the Capital Market Authority; the regulation's own wording is מתוך התשלומים |

Where the official name is not the one people use (the last column says so), the guide page shows both on first use: the everyday name, then the official one.

## 6. Conflicts inside the rule base

Found while writing the glossary; each is noted on its row and needs a decision in the rule base, not here.

- Whether a kupat gemel lehashkaa can be self-directed: IRA-01 and IRA-03 say no, TXK-16 lists it among IRA types.
- Child savings at a bank moving once to a provident fund: CS-12 says yes since January 2025, CS-25 (National Insurance's site) says no.
- Whether the pension return-guarantee target is CPI-linked: the pension file says the law text read does not say; REG-21 says it is.
- What a fund distribution is: tax law says profits the fund paid out; the ISA guide (MF-49) says Israeli fund distributions are not tied to profits made.
- "שכר קובע" means two different things in two pension sources, and "מסלול ברירת המחדל" is used for both the default insurance track and the default investment track.
""")

L.append("---\n\n## Appendix A. Rate-table words\n\nColumn names from a bank's rate table. Keep them only if a guide page explains how to read that table.\n\n" + table(optional) + "\n")
prop = [d for d in dims if d.get("id") not in CORE]
L.append("## Appendix B. Proposed checklist rows, not adopted\n\nRows proposed in the rule base's topic files (\"Proposed dimensions\"). They join the checklist only when the founder adopts them (`docs/data-schema.md` 2). Some overlap; the notes say which.\n")
L.append("| Row | Name | What it checks |\n|---|---|---|")
for d in prop:
    L.append(f"| `{d.get('id')}` | **{esc(d['term_he'])}** | {esc(d['explain_he'])} |")
L.append("")

out_path.write_text("\n".join(L))
print(f"terms {len(present)} · checklist {len(CORE)} · tier-2 {len(t2)} · missing {len(missing)} · rate-table {len(optional)} · proposed rows {len(prop)}")
print("by topic:", {t: len([r for r in present if r.get('group') == t]) for t in TOPICS})
