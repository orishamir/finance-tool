#!/usr/bin/env python3
"""Compose research/knowledge/2026-10-26-open-questions.md from the audit's working files.

Run from the repo root:
    python3 research/knowledge/2026-10-26-open-questions/make_report.py            # writes the report
    python3 research/knowledge/2026-10-26-open-questions/make_report.py --stdout   # prints it instead
It reads merged.json (the helpers' JSONL plus lead-overrides.jsonl), table-before.json and table-after.json, all in
this folder; report_parts.py builds the table and the lists.
"""
import json, os, subprocess, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
D = "research/knowledge/2026-10-26-open-questions"
OUT = "research/knowledge/2026-10-26-open-questions.md"

parts_path = os.path.join(HERE, "parts.json")
subprocess.run([sys.executable, "-I", os.path.join(HERE, "report_parts.py"), parts_path], check=True, stdout=subprocess.DEVNULL)
P = json.load(open(parts_path, encoding="utf8"))
os.remove(parts_path)

r = json.load(open(f"{D}/merged.json", encoding="utf8"))
before = json.load(open(f"{D}/table-before.json", encoding="utf8"))
per = defaultdict(Counter)
for i in before["items"]:
    v = r[i["code"]]
    c = per[i["file"]]
    c["n"] += 1
    c["b_" + v["class_before"]] += 1
    c["a_" + v["class_after"]] += 1
pf = ["| File | Items | Closed before | Answered, not marked | Closed after | Narrowed after | Open after |", "|---|---|---|---|---|---|---|"]
for f in sorted(per):
    c = per[f]
    pf.append(f"| `{f}` | {c['n']} | {c['b_closed-marked']} | {c['b_answered-not-marked']} | {c['a_closed-marked']} | {c['a_narrowed']} | {c['a_open']} |")

TEMPLATE = r'''# Open questions of the rule base: audit, 2026-10-26

The founder asked: "look at all the so called 'open questions' and check if any are answered already and which ones remain." This report covers every numbered item in the "## Open questions" sections of the il-finance rule base (`.claude/skills/il-finance/references/`): 493 items in 29 files.

Method. Phase A classified every item from the rule base alone (the item's own dated notes, later passes, the file's rules, other files, `data/rules`, coverage.md), with no web. An item counts as answered only when the answer is in a source the rule base already cites; a company's document cannot close a question about a general rule (D30), so such an item is "narrowed". Answered items were struck in the format the site reads, `~~<question>~~ Closed <date>: <one line> (<rule ids>)`, dated by the note that answered them. Phase B made one focused attempt, on the web, to settle every item still open or narrowed that something on the site depends on, looking for the law, a regulation, a regulator's circular or Q&A, or a standard bylaw; every closure carries the exact quote, the URL, the page or section and checked 2026-10-26. Five helpers (Opus, xhigh) split the 29 files under one brief (`2026-10-26-open-questions/brief.md`); the lead reviewed their closures, spot-checked the sources of the ones the site depends on (ruling 6849/15, the Tax Authority guide's order of computation, circular 2/2013) and applied the three leads from the glossary research. Working files: `2026-10-26-open-questions/` (inputs, each helper's JSONL, `merged.json`, `table-before.json`, `table-after.json`, `lead-overrides.jsonl`, and the scripts that build this report).

What "the site depends on it" means here: guide prose names it in an open-question chip (`<IdRef id="… OQn">` in `site/app/content/`, which replaced `<OQ>` in commit 29b8362); it is a tier-2 blocker on the not-covered page (method G-24 and `tier2Table`); a method gap G-xx cites it; a wrapper or exposure record in `data/instruments/` lists it or blocks a dimension on it (shown on guide pages); site code or `copy.ts` names it; a rule record's text names it; or a tier-2 file's Graduation status names it.

## Counts

| Class | Before | After |
|---|---|---|
| Closed and struck | 4 | 101 |
| Answered, not marked | 64 | 0 |
| Narrowed | 120 | 135 |
| Open | 305 | 257 |
| **Total** | **493** | **493** |

- **Already answered: 68.** 4 were struck before today; 64 were answered in the rule base but not struck, and are struck now (Phase A).
- **Settled today from a new source: 33** (Phase B; 31 by the helpers, 2 by the lead: the CMA track list, and circular 2/2013 on the exempt commutation of a recognized annuity).
- **Remaining: 392** (135 narrowed, 257 open). Of these, **61 change something on the site** (an open-question chip in guide prose, a tier-2 blocker, a method gap, or a blocked guide dimension); the rest are named only in a rule record or a guide record's list, or nowhere.
- Six new rules were written where no rule fitted an answer: BANK-35, GOV-24, ETF-67, TXF-28, TXK-27, TXA-30 (none has a `data/rules` record yet).

Per file:

{PERFILE}

## What changed beyond the struck lines

- **Tier-2 blockers (method G-24, `site/app/lib/compare.server.ts` `tier2Table`, `packages/engine/test/golden/r2-compare.test.ts`):**
  - Managed portfolios: TX2 OQ12 (VAT on the fee) was answered on 2026-10-24 by TX2-17 and is struck; the blocker is MF-28 alone.
  - Foreign-currency deposits: TX2 OQ1 (a falling currency) was answered on 2026-10-22 by the Supreme Court ruling in TXI-25 and is struck; the blocker is TX2 OQ2 alone.
  - Amendment 190 deposits: TXA OQ9 and OQ10 (the age ceilings and the age-60 and payslip conditions) are settled by the Tax Authority's ruling 6849/15 (TXA-30), and TXA OQ11 (the exempt commutation together with the recognized annuity) by circular 2/2013 s.5.2.5. The blockers are now TXA OQ14 (National Insurance) and TXA OQ15 (surtax), the two the Graduation status still lists; both are narrowed.
- **Graduation status sections:** struck closures added for INS OQ7 (savings policy), TX2 OQ1 (FX deposits), RG OQ3 (REITs), and TXA OQ3 and OQ9 to 11 (TXA file); MGD and FXD got dated notes; RG's "per-distribution source split (OQ 5)" mislabel was corrected. The not-covered page now shows the INS OQ7, TX2 OQ1 and RG OQ3 closures. `graduation.server.ts` has no `sources` entry for Amendment 190 deposits, so closures for that instrument never show on the page.
- **coverage.md (references copy):** 28 lines updated to strike or narrow what closed, plus the count in its opening paragraph. `research/knowledge/coverage.md` is a stale copy from the scaffold commit (2026-10-22) and was not edited.
- **Re-sourced records from the glossary research's leads (lead):**
  - CAT-23 now rests on the CMA's list of investment tracks (2024-1471, 17.4.2024, gov.il) instead of Meitav's notices; Scope `general`; CAT OQ9 closed; CAT-15 updated.
  - PEN-14, PEN-20 and PEN-32 now cite the CMA standard pension bylaw (circular 2016-3-4 annex ב', January 2018 edition, prisha.co.il copy): ss.13, 34, 35, 39(א); ss.45, 111; s.1 "מוטב", s.50(ג), s.115. Mor stays cited only for what is Mor's own (the two qualifying-period exclusions, its 4.38% rate, its provident-fund small-balance rule).
  - MGD-21 now rests on the ISA's technological-means directive itself (December 2024 file); MGD OQ2 is narrowed (the needs-clarification directive is still unread). The secondary summary's "update every 12 months" is not in the current text (s.9 is cancelled from 7.8.2022).
- **Rule records:** `npm run extract:sources` rewrote the `sources` of 27 records in `data/rules/` (bank-07, bank-17, bank-21, cat-23, cs-13, cs-15, cs-16, gov-13, gov-14, gov-18, ira-03, kh-12, pen-18, sw-10, sw-26, txh-10, txh-11, txi-08, txi-13, txi-15, txi-17, txk-06, txp-11, txp-18, txs-06, txs-11, txs-23). `npm run validate` passes ("data/ is valid"; warnings only), and `npx vitest run site packages/engine` passes (63 files, 859 tests), as do the pipeline and schema tests.

## Where the site still names a question that is now closed

These need the lead: site content, copy and data records were not edited in this audit.

**Open-question chips in guide prose (`site/app/content/`):**

{PLACES_OQ}

**Site code and copy:**

{PLACES_CODE}

Also: the `copy.ts` flag for method gap G-11 now holds only for the recognized annuity (the lump sum is TXK-27); the playbook's SW OQ9 line is partly answered (SW-26 now gives the account and activity types; which banks are exempt and how the "sixth business day" counts remain).

**Guide records (`data/instruments/`) that block a dimension on a closed question:**

{PLACES_BLOCK}

`minimum: blocked:GOV-OQ7` in `makam.json` and `government-bond.json` could now rest on GOV-24 (the TASE minimum order), though GOV OQ7 itself stays open for the settlement cycle.

**Guide records that list a closed question in `open_questions`:**

{PLACES_INST}

**Rule records whose text names a closed question:**

{PLACES_RULE}

**Method gaps that cite a closed question (`docs/method.md`; only G-24 was edited):**

{PLACES_GAP}

Proposed: G-05 can close (Irish exit tax is not deducted on ETF units held in a clearing system or paid to a declared non-resident, TXF-28; F-20's 0 is now sourced). G-06 can close (the taxable base of a non-compliant withdrawal is the whole amount, at 35% or the ordinary tax if higher, TXP-18), which unblocks F-48. G-21's assumption is confirmed (banks withhold no surtax and the full rate whatever the age; settlement is through the return or form 0135, TXG-08, TXG-11, TXS-23). G-23 is answered: credit points come off the whole computed tax, special-rate income included (TXG-05, the Tax Authority guide's order of computation), so the method could apply them. G-11 is answered for the kupat gemel lehashkaa lump sum (TXK-27) and narrowed for the recognized annuity (TXA OQ14). F-44's note that the 60+ reduction is open (TXK OQ12) is out of date: the lower brackets apply. G-13 is narrowed (the 1980 regulations make the 2026 caps computable; the 16.5% rate is unconfirmed). G-20: reg. 8 of the 2002 withholding regulations lets a bank deduct fees at withholding where the Director approved it. G-27's text is partly stale (TXG-35 now holds employee NII rates).

## Hand-offs for the lead

1. **New rules without a `data/rules` record:** BANK-35 (2026 fee caps on payment-account management and immediate-debit cards; the track definitions end 1.7.2027), GOV-24 (TASE trading rules for government bonds and makam: unit, minimum order NIS 10,000, price steps), ETF-67 (TASE trading unit and minimum order for ETFs: NIS 500 equity market, NIS 2,000 bond market), TXF-28 (no Irish exit tax on clearing-system ETF units), TXK-27 (no NII or health on a kupat gemel lehashkaa lump sum's gains), TXA-30 (ruling 6849/15).
2. **Records whose Hebrew text is now behind their source:** `cat-23.json` (title_he and text_he still say "לפי הודעות התקנון של מיטב"; strength `institution` while its only source is primary, which the validator warns about), and the stale notes the helpers listed in `etf-33`, `txf-16`, `txf-21`, `txs-11`, `txs-23`, `gov-14` (its interest-period figure is from the 1999 type), `cs-15`, `pf-33`.
3. **Stale rule text in the markdown that the audit did not rewrite** (outside the items it closed): BRK-03, BRK-15, BRK-16, BRK-26, BRK-30, MF-28, MF-39, MF-08, TXS-12 and the TXS Summary (taxable money-market funds, which contradicts TXS-24), TXI-05 and the TXI Summary and worked-statement table (NII on interest, Gilon), the GOV Summary (the 0% floor holds only for the old גילון חדש) and the GOV-14 heading and terms ("former names"), GOV-13 (still cites Wikipedia for the name mapping), PEN-04, PEN-07, PEN-25, PEN-26, TXP-16, TXP-19, KGL-14, TXK-02, TXK-16, KH-23 and IRA-17 (fee-field units), TX2-09 (Amendment 285's new 70% "הכנסות חריגות" case).
4. **Scope calls for the scope review:**
   - TXA-30 is marked `general`: the ruling was made in agreement with one unnamed company, but the Tax Authority publishes its summaries as its position for similar cases, and every fund's 2026 table matches its factors. TXA-22, TXA-23 and TXA-24 now cite it beside the fund documents and may move to general.
   - KH-23 joins company terms (Altshuler Shaham, Harel, Meitav) with the general circular 2017-9-15; under D30 it should be split.
   - CAT-23 was moved to `general` here (the CMA list carries every text it quotes).
   - TXP OQ5 is closed on Income Tax circular 4/2019 read on Menora's site (mvs.co.il), labelled "primary (third-party host)" like the CMA circulars on prisha.co.il; no gov.il copy was found (four guessed BlobFolder names, one search).
5. **Judgement calls to look at:**
   - TX2 OQ1 is closed from the Supreme Court ruling on a foreign-currency-linked deposit (TXI-25), extended to a deposit held in foreign currency through the Ordinance's s.1 definitions ("הפרשי שער" on a deposit in foreign currency are linkage differentials), as TX2-01 already reads them.
   - CAT OQ12 and CAT OQ19 are closed as "not needed" under the founder's decision D17 (2026-10-23), not answered.
   - BANK OQ3 and TXI OQ18 rest on the Wikisource consolidated texts listing no later amendment (a mirror, and evidence of absence).
   - TXG OQ6 rests on the Tax Authority guide's order of computation (special-rate income goes into the computed tax, then credit points come off the computed tax), not on a sentence naming special-rate tax.
   - TXS OQ11: circular 7/2003 s.2.1.1 says a taxable fund pays an individual's rates; the circular's own figures are 2003 rates, today's come from the Ordinance.
   - TXA OQ11 is closed on circular 2/2013 s.5.2.5, whose PDF prints numbers through a broken digit font (5.2.5 shows as "21512", 15% as "12%"); the reading was checked against the neighbouring sections.
   - Left narrowed although a note says "Closed by": BANK OQ13 (BANK-30 is a Bank of Jerusalem article and cannot prove Leumi's usage), GOV OQ9 (GOV-22 covers makam only), BRK OQ7 (BRK-35 says the Irish scheme's own page was not reached), TXS OQ1 (TXS-24 counts open-end funds only).
   - Kept narrowed although the item reads answered: PF OQ16 (the gov.il copy of circular 2020-9-22 exists; whether the 2025-26 draft was adopted is open), IRA OQ12 (CAT-40 marks the meaning of an empty fee value as inferred).
6. **Contradictions found:** the non-bank fee snapshots (Altshuler Trade, Excellence, IBI, Psagot) apply custody to money-market units, which may conflict with MF-26 (under a distribution agreement a distributor charges no holding fee on them); TXG-17 says the 2,810,000 securities exemption also covers proceeds where an advance was paid, while the regulation's definition covers only exempt or fully withheld income; REG-21 gives 1.7.2022 for the pension return guarantee and PEN-18 gives 1.10.2022, citing the same law; no company named Psagot is among the ISA register's 129 portfolio managers (MGD-23).
7. **Leads across files:** TXG OQ7 and TXS OQ6 close with the same reg. 11; SW OQ10 and SW-52 are the same question as BRK OQ12, and a Bank of Israel position filed in court in 2021 (`boi.org.il/media/e4xji1rw/202207.pdf`) explains supervised prices.

## Blocked pages, for a person to open

{BLOCKED}

## Closures made today

### Settled from a new source (Phase B), with the source

{PHASE_B}

### Already answered in the rule base, struck today (Phase A)

{PHASE_A}

### Struck before today

{ALREADY}

## All 493 items

"Before" is the state of the rule base before today's audit; "After" is after it. For closed items the last column says when and by what; for the others, what would settle it.

{TABLE}

## Appendix: the helpers' notes per item

{NOTES}
'''

fill = {
    "{PERFILE}": "\n".join(pf),
    "{PLACES_OQ}": P["places"]["OQ-tag"],
    "{PLACES_CODE}": P["places"]["site code"],
    "{PLACES_BLOCK}": P["places"]["instrument blocker"],
    "{PLACES_INST}": P["places"]["instrument record"],
    "{PLACES_RULE}": P["places"]["rule record"],
    "{PLACES_GAP}": P["places"]["method gap"],
    "{BLOCKED}": P["blocked"],
    "{PHASE_B}": P["phase_b"],
    "{PHASE_A}": P["phase_a"],
    "{ALREADY}": P["already"],
    "{TABLE}": P["table"],
    "{NOTES}": P["notes"],
}
text = TEMPLATE
for k, v in fill.items():
    text = text.replace(k, v)
if "--stdout" in sys.argv:
    sys.stdout.write(text)
else:
    open(OUT, "w", encoding="utf8").write(text)
    print("wrote", OUT, len(text), "characters")
