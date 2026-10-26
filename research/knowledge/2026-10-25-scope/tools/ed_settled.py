#!/usr/bin/env python3
"""ed_settled.py: writes settled.md, the report of the scope settling pass (editor, 2026-10-26).

The editor's own sections are below; the per-file text fixes, skipped items and blocked pages come verbatim from the
seven forks' partial reports (tools/work/part-F1.md ... part-F7.md, gitignored), so settled.md keeps them in the repo.
Run: python3 research/knowledge/2026-10-25-scope/tools/ed_settled.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, "work")
OUT = os.path.join(HERE, "..", "settled.md")


def section(fork, number):
    """The body of '## <number>. ...' in a partial, headings demoted to ####."""
    text = open(os.path.join(WORK, "part-%s.md" % fork), encoding="utf8").read()
    m = re.search(r"^## %s\.[^\n]*\n(.*?)(?=^## |\Z)" % re.escape(str(number)), text, re.S | re.M)
    body = m.group(1).strip() if m else "(none)"
    return re.sub(r"^### ", "#### ", body, flags=re.M)


HEAD = r"""# Scope settling in the rule base (2026-10-26)

This pass settles the independent scope review (`review.md`, `review.json`) and the open-questions audit's hand-offs (`research/knowledge/2026-10-26-open-questions.md`, "Hand-offs for the lead") in the rule base, `.claude/skills/il-finance/references/*.md`, and in the Hebrew text of `data/rules/*.json`. The brief is `settle-brief.md`. A later addition from the lead applied the open-question hunt's 20 rows (`research/knowledge/2026-10-26-oq-hunt/`), section 8.

**Who did it.**
- The editor split the files among seven forks (Opus 5.5, as the founder's research setting), each owning only its own files:
  - F1: the provident files (PF, KGL, KH, CS, IRA);
  - F2: pension, switching, insurance (PEN, SW, INS);
  - F3: brokerage and ETFs (BRK, ETF, MKT);
  - F4: banks, funds, regulators, government bonds, the catalogue (BANK, BPN, MF, REG, GOV, CAT, MGD-23);
  - F5: the tax files (TX2, TXA, TXF, TXG, TXH, TXI, TXK, TXP, TXS);
  - F6 and F7: the hunt's cash-and-bonds and securities-tax rows.
- The editor:
  - decided the cross-file items and made the edits in files no fork owned (section 10);
  - spot-checked the forks' main claims against the sources: IRA-09, BRK-29, PEN-28, TXI-25, TXG-17, REG-21, BRK-52 and circular 10/2025, all confirmed;
  - ran the checks (section 15) and wrote this report and `requests.md`.

**Rules kept.**
- Every change cites a source read on 2026-10-26: gov.il HTML pages through `research/audit/tools/govil-page.sh` only, everything else by plain curl, through `tools/src.py` with its cache in `tools/work/srccache`.
- Bot checks were listed, never worked around.
- Nothing was committed. Nothing in `site/` or `packages/` was edited; in `docs/`, only the `docs/method.md` lines that name a split id (section 14).

## 1. Counts

Scope of the 577 `data/rules` records:

| | general | institution | unsettled | no Scope line |
|---|---|---|---|---|
| Before (the editor's lines, 2026-10-25) | 102 | 73 | 10 | 392 |
| The independent review | 474 | 90 | 13 | |
| After this pass | 475 | 90 | 12 | 0 |

**Where the result departs from the review's kinds:**
- BRK-29: unsettled → general. The rule text was read: TASE's trading guidelines set session times only for Monday to Thursday and Friday.
- BRK-35: institution → general, by the split. Ireland's investor compensation scheme is cited from the Irish consumer regulator; Interactive Brokers Ireland's statements moved to BRK-51.
- REG-14: general → institution: Tel Aviv Stock Exchange. Its only sources are TASE's own membership guides, under the lead's "exchange as a company" call.

**Outside `data/rules`:**
- The rule base now has 961 blocks: 494 general, 106 institution, 14 unsettled.
- 347 blocks have no Scope line. They are not in `data/rules`, the review did not cover them, and the site does not show them.
- 18 blocks are new: 17 from splits and BRK-52 from the hunt.

The 102 records that are not general, with their lines, are listed in `tools/work/nongeneral-final.txt` (gitignored); `requests.md` section 5 lists those cited in product contexts.

## 2. The eight disagreements

| Record | Decision | Reason | Source read |
|---|---|---|---|
| CAT-23 | **general** (as the audit had moved it). The JSON is brought in line: title, title_he, text_he, strength primary. | The CMA's list of investment tracks carries every policy text. Re-checked against the 2024 amendment, which adds the 1.7.2024 condition that a debt fund holds at least 75% debt and drops "מתמחה גמיש". | רשימת מסלולי השקעה – תיקון (notice-2023-069), Word file, cluster 1 and the explanatory notes (F4) |
| KGL-27 | **general** | The joining clause is the CMA standard bylaw for kupat gemel lehashkaa s.11 word for word. The regulator sent that bylaw to every managing company on 29.9.2016 as the basis for approving bylaws, and a gov.il search found no later version. Meitav's sentence was dropped, since KGL-26 already holds it. Whether a later circular changed s.11 is said in the record as not established. JSON strength institution → primary. | regulation_hm_takanongemel.pdf p.5 s.11; the covering letter (ref. 2016-19364) (F1) |
| KGL-28 | **general** | The standard bylaw ss.13-14 carry both clauses. The s.14.2 wording is tightened: the difference is owed whenever the value at actual payment is higher, not only after a fall. JSON → primary. | same file, p.6 (F1) |
| TXK-26 | **split:** TXK-26 general (reg. 3(א), 20%, and 15% on sums deposited before the regulations); Harel's 25% → TXK-28, **unsettled**, seen at Harel. | No text read amends reg. 3: the National Insurance consolidated copy runs to 27.12.2017, and the Wikisource consolidated text tags only regs. 4 and 5 as amended in 2012. "Not amended since" rests on a mirror and searches, not the gazette after 2017, so Harel's figure is unsettled rather than institution. The lead's reading kept. | btl 02_0103_100269.pdf p.2 reg. 3(א); Wikisource raw text (F5) |
| PF-40 | **institution: The Phoenix keeps PF-40;** the Altshuler Shaham clauses (standard bylaw ss.10, 20.1-20.4) went into the general record PF-23. | PF-40 was itself made the day before as PF-23's company part. Its "company" clauses turned out to be the standard bylaw, so they return to the general record that already cited s.20.2, instead of a second general record that would duplicate it. Both ids stay in the one dimension list that cites them. The same choice was made for KGL-26 (its joining clauses ss.7.1-7.2 went to KGL-06). This departs from the spec's default on purpose. | standard bylaw p.5 s.10, p.6 s.20.1, p.7 ss.20.2-20.4 (F1; the editor accepted it) |
| IRA-21 | **institution: Meitav** (the lead's reading) | All five documents are Meitav's, the results of its competitive process for its IRA. The broker prices are terms of Meitav's IRA and each broker is named in the table; the brokers' own documents were not read. Written into the record. | the record's Meitav documents (F1) |
| REG-26 | **institution: Interactive Israel** (the editor of 2026-10-25 was right) | The only source is Interactive Israel's own "about" page; no Interactive Brokers document is cited. | the record's own source (F4) |
| PEN-40 | **unsettled**, seen at Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim and **Infinity** (added) | Infinity's January 2023 bylaw p.62 has the same 40% split. No regulator circular changing s.94 of the 2016 standard text was found, and six bylaws are only a partial count. Harel's, Altshuler Shaham's and Infinity's links are now recorded; Meitav's and Menora's were not found. PEN-37 (the 12.5% floor) got the same treatment, with Infinity added. | Infinity, Harel and Altshuler Shaham bylaws (F2) |

## 3. Judgement calls applied, and departures from the review's suggestions

The lead's provisional calls were applied:
- **Index rules:** the S&P, MSCI and Nasdaq rulebooks are institution (ETF-37 to ETF-40, ETF-46 to ETF-49), with the strength words and JSON strength fixed. TASE's index records (ETF-33 to 36, 41, 42, 44, 45) stay general and are now cited from its index guidelines first. That reading corrected one fact: TASE publishes index updates at least five trading days ahead, not two weeks (ETF-35, ETF-42).
- **The exchange as a company:** BRK-13, BRK-37, BRK-39, CAT-42, CAT-43 and REG-14 are institution: Tel Aviv Stock Exchange, and the TASE part of REG-13 moved to REG-32. BRK-12 stays unsettled, since the clearing-house rules were not found. BRK-29 is settled general from the trading guidelines.
- **"No rule exists" records:** BANK-23, BANK-27 (the no-minimum statement), IRA-10, SW-19, SW-34 and SW-37 are kept, with the search written in each.
- **Regulator texts that bind no one:** each is general, with a not-binding line in Conditions and in text_he.
  - The Securities Authority's yearly report: ETF-11, ETF-17, ETF-18, ETF-26, ETF-52.
  - The voluntary outline and the Securities Authority's reports: MF-17, MF-41.
  - The pension regulator's drafts and plans: IRA-07 (the draft part), IRA-26, IRA-27, PF-33 (the draft).
  - The chief economist's paper: TXH-04, TXH-17, TXH-22.
  - National Insurance's FAQ: TXK-25.
  - Ruling 6849/15: TXA-30. TXA-22, TXA-23 and TXA-24 moved to general on it.
  - Bills and memoranda: BANK-21, BANK-23, TXH-13.
- **Company clauses copied from a standard bylaw:** each is general, citing the standard bylaw first:
  - KGL-02, KGL-06, KGL-27, KGL-28 and PF-23, from the kupat gemel lehashkaa standard bylaw;
  - CS-04, CS-06 and CS-16, from the child-savings standard bylaw;
  - PEN-10, PEN-21, PEN-26, PEN-28 and PEN-29, from the pension standard bylaw;
  - KGL-30, which now says its two-year wording is the regulator's own 2016 standard bylaw, overridden by circular 2017-9-15.
  PEN-44 stays unsettled: the base text of the savings provident standard bylaw was not found, though Analyst's and Altshuler Shaham's bylaws carry the same s.47.
- **Partial counts:** PEN-37 and PEN-40 are unsettled, with "seen at".
- **Not rules:** listed in section 5, none moved, because the rules page lists every `data/rules` record.

**Departures from the review's suggested mechanics, each decided on the sources:**
- PEN-23 was not split. The four default funds and their 1% + 0.22% fee are the regulator's own selection result, published by it.
- GOV-13 was not split. The Accountant General's bond page settles the old names as separate types.
- BANK-27's "no regulatory minimum" stays in the general record as a "no rule exists" statement. Directive 447 leaves the amount range blank for each bank, and neither 447 nor the Disclosure Rules set one.
- CAT-17: Harel's remark on its own web page was dropped rather than given an id.
- Pointers instead of new ids where the company sentence already lived elsewhere: BRK-28, BRK-36, BRK-37, ETF-40, ETF-43, ETF-53, KGL-27, CS-16 (to CS-28), and IRA-07, IRA-09 and IRA-16 (to IRA-29).
- KH-01: Harel's purpose wording is kept only as a named example in Conditions.
- ETF-47 and ETF-49 were split by kind of company: the index provider keeps the id, and the Israeli funds' wording went to ETF-68 and ETF-69.

## 4. Splits and new ids

The general part keeps the old id unless section 2 says otherwise. None of the new ids has a `data/rules` record (`requests.md` section 3).

| Parent | New id | Scope of the new id | What moved |
|---|---|---|---|
| BANK-26 | BANK-36 | institution: Bank Leumi, Bank Yahav, Discount Bank | Quoting a linked deposit as a real rate plus linkage; the banks' linked products |
| BANK-27 | BANK-37 | institution: Bank Leumi, Bank Massad, Bank Yahav, Mercantile Discount Bank | Exit-point patterns, minimums, Yahav's business-day rule |
| BANK-28 | BANK-38 | institution: five banks | Each bank's savings-plan structure |
| BRK-35 | BRK-51 | institution: Interactive Brokers Ireland | IB Ireland's own statements (BRK-35 is now the Irish scheme, general) |
| ETF-47 | ETF-68 | institution: IBI, Mor, MTF | The NASDAQ-100 funds' tracking-asset wording |
| ETF-49 | ETF-69 | institution: MTF, Tachlit, IBI, Kesem | The MSCI funds' tracking-asset wording |
| KH-23 | KH-33 | institution: Altshuler Shaham, Harel, Meitav | How the three state the study-fund fee (audit hand-off 4) |
| PEN-10 | PEN-45 | institution: Mor | Joining the general fund without a request |
| PEN-19 | PEN-46 | institution: nine funds | Per-fund actuarial balance 2024-2025 |
| PEN-25 | PEN-47 | institution: Mor | A two-year discount against the circular's five years |
| PF-39 | PF-41 | institution: nine funds | Per-fund 2025 fee averages (table ד-9) |
| REG-13 | REG-32 | institution: Tel Aviv Stock Exchange | TASE as a company |
| SW-20 | SW-56 | institution: The Phoenix | 0.75% fee for digital joining |
| TXH-22 | TXH-24 | unsettled (press only) | The 2026 press reports |
| TXK-26 | TXK-28 | unsettled; seen at: Harel | Harel's 25% withholding |
| TXS-12, TXS-24 | TXS-26 | institution: Yalin Lapidot, Migdal Mutual Funds, Harel | Named money-market funds' tax tracks |
| TXS-13 | TXS-27 | institution: Migdal Mutual Funds | Migdal's 2026 ETF tables |
| (BRK OQ11) | BRK-52 | general | No rule limits a non-bank member's custody on makam and money-market units (section 8) |

Parts folded into records that already existed:
- PF-40's standard-bylaw clauses into PF-23; KGL-26's into KGL-06 (both general).
- CS-16's Bank Yahav terms into CS-28; IRA-07's, IRA-09's and IRA-16's Meitav sentences into IRA-29 (both institution).
- CAT-17's Harel clause was dropped.

**Site citations of the parents:** every citation in `site/app`, `data/`, `packages/` and `docs/method.md` uses the part that kept the id, with these exceptions:
- `docs/method.md` lines 129 (TXS-24 naming the two funds), 215 (BANK-26 quoting) and 262 and 370 (TXK-26, Harel): fixed in section 14.
- The BRK-35 citations in two fee snapshots and `data/terms/sipc.json`: a request.

## 5. Not rules

Listed with where each should go in `requests.md` section 4; none was moved.
- **Forum posts:** SW-X01 to SW-X04.
- **Press:** IRA-28, TXH-24.
- **Series and per-company figures:** MKT-01, PEN-46, PF-41, MF-18, CS-20, CS-22 (shares), CS-08 (figures), SW-53, TXS-26, TXS-27.
- **Counts and lists:** IRA-03, IRA-17, ETF-32, ETF-43, ETF-50, BRK-32, TXS-24, CAT-42, MF-52, REG-03, REG-14, MGD-23. ETF-17, ETF-18 and ETF-26 are the regulator's own counts and stay general.
- **Website terms and data-source notes:** MF-55, CAT-43, GOV-19, and PF-39's terms paragraph.
- **A computation check and a summary:** KGL-24, TXS-22.
- **"No rule exists" records,** candidates for the open questions: BANK-23, BANK-27, IRA-10, SW-19, SW-34, SW-37.

**The Maya records:** CAT-42 (TASE's platform: its filter and download) is institution, while TXS-24 (the count over every fund in Maya's export, which says it is a count) is general. They are different claims.

## 6. The audit's hand-offs

| Item | Status |
|---|---|
| 1. New rules without a `data/rules` record (BANK-35, GOV-24, ETF-67, TXF-28, TXK-27, TXA-30) | All carry `Scope: general` (checked); TXA-30 has its not-binding line. |
| 2. Hebrew text behind its source | Done: cat-23 (F4), etf-33 (F3), txf-16, txf-21, txs-11, txs-23 (F5), gov-14 (F4: the interest period re-sourced to the current type's regulations), cs-15 and pf-33 (F1). |
| 3. Stale rule text | Done in every record named: BRK-03, BRK-15, BRK-16, BRK-26, BRK-30 (F3); MF-28, MF-39, MF-08, the GOV Summary, GOV-14's heading and terms, GOV-13 (F4); PEN-04, PEN-07, PEN-25, PEN-26 (F2); KGL-14, KH-23, IRA-17 (F1); TXS-12 and the TXS Summary, TXI-05 with the TXI Summary and worked statement, TXP-16, TXP-19, TXK-02, TXK-16, TX2-09 (F5). |
| 4. Scope calls | TXA-30 general (not binding); TXA-22, TXA-23 and TXA-24 general on ruling 6849/15; KH-23 split (KH-33); CAT-23 general. |
| 6. Contradictions | **MF-26 against the non-bank custody:** written as a request, then answered by the hunt's BRK OQ11: there is no conflict (section 8). **REG-21 against PEN-18:** settled from the law. Its s.34ב reads "יום ב' בתמוז התשפ"ב (1 ביולי 2022), או מועד מאוחר יותר שקבע השר", and the Finance Minister's report to the Knesset (28.5.2023, p.2) says the mechanism took effect on 1 October 2022, so PEN-18 was right. The editor fixed REG-21 and closed REG open question 18. **TXG-17:** settled from the regulation. The 2,810,000 securities ceiling covers only exempt or fully withheld proceeds; proceeds with only an advance paid fall under foreign income (375,000); the Tax Authority's guide is wider than the regulation. **MGD-23:** left open with the reason. No "Psagot" is among the register's 129 portfolio managers, and the register page is a JavaScript app. |
| 7. Leads across files | TXG OQ7 and TXS OQ6 point at each other (the same reg. 11). SW OQ10 and SW-52 point at BRK OQ12, which carries the Bank of Israel's 2021 court position on supervised prices. |

## 7. The child-savings fee after 21 (brief item 7)

- **CS-18** is the general legal cap after 21: up to 1.05% a year of the balance and 4% of deposits. National Insurance's 0.23% until 21 is its payment, not a rate after 21; the quote's word order was also fixed.
- **CS-30** is institution: Harel and Altshuler Shaham each state 0.23% of the balance, named. Its Conditions now say it is not a figure for the product.
- **The engine's F-54** still takes CS-30's rate. Moving it to the cap labelled "עד", or to an entered rate, is the lead's (`requests.md` section 1).

## 8. The open-question hunt (the lead's addition, 2026-10-26)

All 20 rows were applied:
- **Closed (8):** BRK OQ11, MF OQ4, TXI OQ2, TXF OQ5, TXS OQ15, TXG OQ13, TXS OQ7, TXG OQ5.
- **Narrowed (11):** MF OQ3, TXI OQ14, BANK OQ12, TXI OQ5, TXI OQ3, TXI OQ11, TXF OQ1, TXF OQ3, TXF OQ7, TXS OQ12, TXG OQ4.
- **Still open (1):** TXI OQ9.

How they were written:
- Closed questions are struck in the site's format, `N. ~~**question**~~ Closed 2026-10-26: … (rule ids)`, which the graduation parser reads. Narrowed questions carry `**[2026-10-26 open-question hunt]** Narrowed: … Still unknown: …`.
- Every written quote was checked in its source: F6 searched every segment, two gazette scans on their page images; F7 found 69 of 70 quote parts, and the missing one was not written anew.
- Third-party copies are labelled "primary (third-party host)": the regulators' joint report of June 2026 (funder.co.il), the Moses ruling ע"א 3555/15 and the Tax Authority's 4.7.2019 letter (capitax.co.il), and the gazette scans (olaw.org.il).
- Two row quotes were corrected to the source: KT 11476 rule 3(ב)(1) has no "חדשה", and the report's "לא קיימת הסדרה מקבילה" is on p.3.

The highlights:
- **BRK OQ11 closed:** a non-bank broker may charge custody on money-market units and makam. The new general rule is BRK-52. MF-26 and MF-27 now say "a distributor that is not an investment marketer", and BRK-17 says banks only. The audit's contradiction note on the four non-bank price lists is withdrawn in the closure; the rule base repeated it nowhere else (coverage.md's line was updated).
- **Circular 10/2025 and the Moses ruling settle TXG OQ13, TXS OQ15 and TXF OQ5** (TXS-02, TXG-12, TXF-03). When the index or the currency falls, the inflationary amount is zero; a gain below the inflationary amount is wholly exempt with no loss; and the part of a nominal loss equal to the fall is not allowable. This corrects the earlier audit's reading for TXF that a shekel loss counts whatever the currency did.
- **TXF OQ1 stays narrowed** (TXF-11). The 2019 letter supports the sale-only reading by implication, and circular 7/2003 s.4.4 points the other way, so the caution stays.

The site effects of every row are in `requests.md` section 10. The per-row detail from the two forks follows.

### F6: the cash-and-bonds rows

{F6_1}

### F7: the securities-tax rows

{F7_1}

## 9. Text and source fixes, by file

The detail as each fork recorded it. `[json]` means the `data/rules` record's title_he, text_he, checked, strength or figures changed too. In all, 184 records changed their Hebrew title or text (167 in the settling pass, the rest in the hunt). No figure value changed. Only TXK-26's `harel_stated_rate` (25%) was removed, and only the built site used it.

**Corrections that change what a reader is told:**
- **IRA-09** was inverted: the employer's approval is needed for severance money that does *not* replace s.14 severance pay. The review had not caught it.
- **PEN-28, PEN-29 and PEN-34:** the minimum-annuity condition was inverted.
- **SW-17:** the percentage-fee exception was restored.
- **SW-14:** the order of a partial transfer applies only between new funds.
- **SW-39:** route (11א) is not covered by the payment-date carry-over. The same misreading was fixed by the editor in TXK-04 and the PF-17 note.
- **PEN-18:** the target is CPI-linked.
- **GOV-16:** no market-price buyback rule is left.
- **BANK-06:** the break form need not give the exact consequences.
- **MF-13:** the suspension powers are corrected from the full s.48.
- **CAT-19:** the closed general track now cites the right source.
- **CAT-24:** the example is replaced by a count over all 11 managers.
- **TXI-25:** the Supreme Court left the offset of a linkage loss open.
- **TXG-17:** the regulation's securities ceiling is narrower than the guide's wording.
- **TX2-09:** Amendment 285 adds a new 70% case.
- **ETF-35:** index updates are published five trading days ahead, not two weeks.
- **BRK-29:** TASE trades Monday to Friday.
- **REG-21:** the determining date is 1 October 2022.

### F1: provident files (provident-family-common, kupat-gemel-lehashkaa, keren-hishtalmut, child-savings, ira-self-directed)

{F1_5}

### F2: pension, switching, insurance

{F2_5}

### F3: brokerage-account and etfs-and-index-funds

{F3_5}

### F4: banks, bank product names, mutual funds, regulators, government bonds, the catalogue

{F4_5}

### F5: the tax files

{F5_5}

## 10. The editor's own edits (files no fork owned, and cross-file items)

- **regulators-and-protection.md, REG-21:**
  - Conditions now give the law's "או מועד מאוחר יותר שקבע השר" and the Finance Minister's report (28.5.2023, p.2, "ביום 1 באוקטובר 2022 נכנס לתוקף החוק המסדיר את מנגנון הבטחת השלמת תשואה"), both checked 2026-10-26.
  - The report was added to the Source line, `Scope: general` was added, and open question 18 was closed.
  - reg-21.json text_he and checked were updated; the text_he carries no digits.
- **The route (11א) misreading** (F2's SW-39 finding, verified in the Nevo consolidated text: "למעט לפי – (1) פסקאות (8) עד (12) שבה" with (11א) between (11) and (12)):
  - tax-gemel-lehashkaa-ira-child.md, TXK-04: the payment-date carry-over sentence was replaced, the source segment quotes the opening, and txk-04.json text_he was updated;
  - provident-family-common.md, the 2026-10-23 note under PF-17 was corrected.
- **tax-securities-foreign.md, TXF-13:** the IRS validity wording is quoted ("for a period starting on the date the form is signed and ending on the last day of the third succeeding calendar year", Instructions for Form W-8BEN, "Expiration of Form W-8BEN", checked 2026-10-26), as in BRK-45.
- **coverage.md:**
  - the two taxable money-market funds now point to TXS-26;
  - the hunt's closures and narrowings were added: BRK OQ11, MF OQ3 and MF OQ4, TXI OQ2, TXI OQ14, BANK OQ12, TXI OQ3 (two places), TXF OQ1, TXG OQ4.
- **fx-and-structured-deposits.md:** the TX2 open question 1 line no longer says the Supreme Court ruled out the offset (TXI-25).
- **government-bonds-and-makam.md, GOV-22:** the makam rate's note now points to TXI-11 (TXI OQ3 narrowed).
- **tax-interest-deposits-bonds.md:**
  - TXI-25's deflation sentence now points to TXS-02, from F7;
  - the Galil row of the worked table was updated.
- **tax-tier2-other.md, TX2 OQ1:** TXF open question 5 is closed for securities; the deposit case stays separate.
- **txk-23.json:** the text_he keeps the press guide as the reason for its "secondary source" label, after F5 dropped the managers' practice.

## 11. Skipped, and why

**F1**

{F1_7}

**F2**

{F2_7}

**F3**

{F3_7}

**F4**

{F4_7}

**F5**

{F5_7}

**F6 and F7 (the hunt)**

{F6_6}

{F7_6}

## 12. Blocked pages

None was worked around.

**F1**

{F1_8}

**F2**

{F2_8}

**F3**

{F3_8}

**F4**

{F4_8}

**F5**

{F5_8}

**F6 and F7 (the hunt)**

- https://apicontent.tase.co.il/api/Cms?Route=/he/content/knowledge_center/trading_hours (MF OQ3, the designated hours): 403, per the row; not retried.
- The Supreme Court's own copy of ע"א 3555/15 (supremedecisions.court.gov.il), which resets scripted connections; the ruling was read in capitax.co.il's copy.
- Not located: the joint regulators' report PDF on boi.org.il (only the press release); the report was read in funder.co.il's copy.

## 13. requests.md

`requests.md` in this folder holds what is the lead's:
1. The child-savings fee after 21 in the engine (F-54).
2. MF-26 against the non-bank custody: no conflict, the snapshots stay.
3. Eighteen new ids with no `data/rules` record.
4. The not-rules list.
5. Records that are not general but are cited in product contexts (28 by record).
6. Corrections that need a change outside the rule base:
   - IRA-09's wrapper text;
   - the BRK-35 citations;
   - gov-14's old-type figures;
   - the fee-exit dimension;
   - TXS-12's provenance;
   - TXI-25's pages;
   - three method.md lines that are not split ids (375, 224, 211).
7. Source labels the markdown cannot fix (documents.json or the extraction).
8. Calls the founder may want to see.
9. Housekeeping: Scope lines outside the review, the validator warnings, the Hebrew editor.
10. The site effects of the hunt's 20 rows.

## 14. docs/method.md

Only the lines naming a split id whose moved part they used were changed, at the very end, after the lead's merge (d64ee04) had landed:
- **Line 129:** the two taxable funds are named in TXS-26 (TXS-24 counts them).
- **Line 215 (F-21):** the quoting convention as the banks read show it is BANK-36; BANK-26 keeps the 447 linkage column.
- **Line 262 (F-44):** the regulation's 20% is TXK-26; Harel's 25% is TXK-28, unsettled.
- **Line 370 (G-02):** the same split.

Every other line naming a split id uses the part that kept it: 55, 211, 218, 220, 251, 284, 291, 293, 314.

## 15. Checks

- `npm run extract:sources -w @finance-tool/pipeline`: 577 rules, 0 unresolved.
- `npm run validate`: data/ is valid. Warnings went from 1,002 to 489 ("source checked later than the rule's checked"), from 20 to 18 (first source without title_he), from 8 to 7 (strength differs from the best source), and from 3 to 2 (figures behind the tax year).
- `npx vitest run`: 74 files, 1,006 tests pass.
- The Scope line format was checked by script: one line per record, directly after the Source line, in one of the three forms. Every `data/rules` record has one.

## 16. Files and tools

**Rule base:**
- 28 of the 31 files in `.claude/skills/il-finance/references/` were touched: all but README.md, corporate-bonds.md and reits-and-gold-funds.md.
- 195 `data/rules` records changed their title, Hebrew text, strength or figures. The extraction rewrote the sources of 193.

**The editor's tools** (in `tools/`):
- `rb.py`: blocks, inventory, counts and missing Scope lines.
- `rj.py`: JSON patches that keep the format and refuse the extraction's keys.
- `ed_sub.py`: exact single-occurrence edits.
- `ed_cited.py`: where records that are not general are cited.
- `ed_settled.py`: this report.
- `fork-conventions.txt`: the forks' shared brief.

**The forks' scripts:** `f1_*` to `f7_*` in the same folder.

**Gitignored (in `tools/work/`):** the partial reports (`part-F1.md` … `part-F7.md`), the patches, the source cache (`srccache`), and `nongeneral-cited.txt` / `nongeneral-final.txt`.

## Summary for the founder

**What changed:**
- Every rule the site shows now says who it applies to:
  - 475 apply to everyone, because a law, regulation or regulator says so;
  - 90 are one company's own terms, with the company named;
  - 12 look general but rest only on company documents, so far.
- **Corrections:** reading the rules against their sources found real errors, and they are fixed. Three pension rules had a condition backwards. A self-directed fund rule said the opposite of the regulation. A government-bond rule described a price rule that was repealed in 2007. A court ruling was read as deciding something it explicitly left open.
- **Splits:** company terms were cut out of general rules into 18 new records, so a guide can show only what holds everywhere.
- **The new findings on cash and securities tax are in.** A non-bank broker may charge custody on money-market funds; the earlier worry about a conflict was wrong. A fall in the index or the currency never makes a loss allowable, and never raises the taxable gain.

**What is left** (in `requests.md`):
- The child-savings fee after 21 is still computed from two companies' rate. The engine should use the legal cap, labelled "up to", or a rate you enter.
- 28 records that are one company's terms are still shown on product pages.
- 18 new records need adding to the site's data before company pages can show them.
- A few labels on sources need a data-table change.
- Some calls are yours to confirm: one pension rule kept as general, the tax on accumulating foreign funds, and whether to drop the caution there.
"""


def main():
    vals = {}
    for f in ["F1", "F2", "F3", "F4", "F5"]:
        for n in (5, 7, 8):
            vals["%s_%d" % (f, n)] = section(f, n)
    for f in ["F6", "F7"]:
        vals["%s_1" % f] = section(f, 1)
        vals["%s_6" % f] = section(f, 6)
    text = HEAD
    for k, v in vals.items():
        text = text.replace("{%s}" % k, v)
    open(OUT, "w", encoding="utf8").write(text)
    print("wrote", os.path.normpath(OUT), len(text), "chars")


if __name__ == "__main__":
    main()
