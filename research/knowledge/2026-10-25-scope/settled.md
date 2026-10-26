# Scope settling in the rule base (2026-10-26)

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

Every quote of every row was searched in its fetched source (`tools/f6_verify.py`, then shorter fragments where the text layer interleaves footnote numbers). All were found except the four listed under "quotes"; two gazette scans with no text layer were read on their rendered page images.

- **BRK OQ11 (closed).** Struck: `11. ~~**Custody fee on makam and money-market funds at non-bank members.**~~ Closed 2026-10-26 (open-question hunt): ... (BRK-52, BRK-17, MF-26)`. The closure withdraws the audit's narrowing (that reg. 2(ד) binds any member with a distribution agreement and so may conflict with the four non-bank snapshots' custody lines).
  - New rule BRK-52 (general): non-bank members, no rule limits their custody fee on makam and money-market units. Distribution-fee regulations reg. 1 ("מפיץ" excludes an investment marketer), law s.82(א)(2), the joint report pp.3, 10, 11, 13 (funder.co.il copy, "primary (third-party host: funder.co.il)", with a not-binding line and the practice statements), the BoI press release p.3, the BoI fee rules note 2.
  - BRK-17 [json]: banks only; points to BRK-52.
  - MF-26 [json, title]: binds only a distributor that is not an investment marketer (reg. 1), s.82(א)(2)-(3), and reg. 2(ג)'s wording for the whole regulation.
  - MF-27 [json]: "a distributor that is not an investment marketer (mainly the banks)", the report's own words; Conditions add the report's statement that most non-bank members charge buy and sell commissions on fund units (not binding).
  - MF OQ10: a dated narrowing note.
  - The row's suggested line for BRK-48 or MF-56 (institution records) went into the general MF-27 and BRK-52 instead, since it is the regulators' statement about the market.
  - Quotes: all 15 segments found. The "לא קיימת הסדרה מקבילה" sentence is on report p.3, not p.10 as the row says; the record cites p.3.
- **MF OQ4 (closed).** Struck in the site's format. MF-11 [json] now gives reg. 15 of the prices regulations:
  - in a fund whose policy keeps foreign securities at no more than 10% of net assets, the transfer is on the day the distributor must pass the order to the clearing house; otherwise the next trading day;
  - crediting the accounts counts as the transfer;
  - a fixed-date fund executes only on its fixed date (ISA rules 2024, rule 2(ב));
  - Mizrahi Tefahot's next-business-day statement for fixed-date funds is a named example.
  - Sources: law s.46(ד) p.37; the Wikisource consolidated regulation (mirror); KT 5637 p.326 and KT 5987 p.1026 (olaw.org.il scans, read on page images, "primary (third-party host: olaw.org.il)"); KT 11476 (olaw copy); Mizrahi (institution).
  - Not carried over: the row's "shekel money-market funds" as the 10% class. The texts read tie it to each fund's stated policy, not to the fund type.
- **MF OQ3 (narrowed).** Dated note on the question.
  - MF-10 [json]: 447A appendix A note 2 (orders by the designated hour on the date shown, for renewable funds), the ISA report's 16:00 example (labelled an example), ISA rules 2024 rule 3(ב)(1).
  - MF-14 (rule-base only) rewritten from "open" to the regulation's pricing days: law s.46(א); prices regulations reg. 1 "יום מסחר" and reg. 2(א). That means no Sunday execution since 5.1.2026, and no Friday orders in funds not limited in foreign securities; Friday for limited funds is not checked. Scope line added (general); the press reports stay as background.
  - MF OQ1: a dated note that the 2024 ISA rules were read (KT 11476, in force 3.10.2024, rule 6).
  - Quote fix: the row's rule 3(ב)(1) quote reads "קרן כספית מועדים קבועים חדשה". The gazette text has no "חדשה", so the record quotes it without that word and does not say "new fund".
- **TXI OQ14 (narrowed).** Dated note.
  - TXI-07 [json]: no special break rule; only interest actually paid is taxed and withheld (reg. 4, guide 2025 ss.21-23). What a break pays is the bank's term (s.10, BANK-06). Directive 221 s.82's "קנס משמעותי ששיעורו גדול מהותית מהפסד הריבית" explains breaks that eat principal; their tax effect is unknown.
  - Bank Hapoalim's terms (withholding at crediting) are a named example, institution.
- **BANK OQ12 (narrowed).** Dated note.
  - BANK-28 [json]: no general rule makes an instalment a separate sub-deposit; s.7(ב)(4)-(5); directive 221 note 38; the plan terms are each bank's (BPN-10).
  - BANK-06 [json]: the directive 221 s.82, s.83 and note 38 sentence.
- **TXI OQ5 (narrowed).** Dated note.
  - TXI-16 [json]: the withholding regulations have no accrued-interest provision, so the payer withholds from the whole coupon (reg. 5(א)).
  - Same-year loss offset at withholding under reg. 9(א) of the 2002 regulations and s.92(א)(4)(א); how it meets s.3(ח)(1) was not found.
  - Bank Leumi's note 3 (pro rata by accrual days across legacy rate periods) is a named example.
  - The TXI worked-statement row for Shahar coupons is updated.
- **TXI OQ9 (open).** A dated note of what was searched. TXI-19 Conditions add the statute's and the guide's wording (p.40 fixed-rate definition, p.41 section 13). No JSON change, since the meaning is unchanged and it is still open.
- **TXI OQ3 (narrowed).** Dated note.
  - TXI-11 [json]: the 20% line is in both the 2024 and 2025 guides, matches no rate in the law, and the guide defers to the law (TXG-31). The law and reg. 1/5(א) give 15%.
  - Bank Leumi's 15% table is a named example.
  - The sale split stays open.
  - The worked-statement makam row is updated.
- **TXI OQ2 (closed).** Struck. TXI-04 [json]: a prime-based deposit is unlinked.
  - Sources: s.125ג(א), s.88 through reg. 1 of the 2005 regulations, the guide's "אופן הצמדה", reg. 4, directive 447's separate "סוג ריבית" and "סוג הצמדה".
  - The "my reading" caveat is removed. The worked-statement prime row now reads "sourced".
- **TXI OQ11 (narrowed further).** Dated note. TXI-20's Conditions bullet now quotes s.125ד(א), s.1 "פיקדון", and the guide's "מחושבות אוטומטית על-ידי המחשב". No JSON change: it is still an open question there.

### F7: the securities-tax rows

- **TXF OQ1, narrowed.**
  - *TXF-11:* retitled ("taxed on sale and distributions only (by implication; no deemed-distribution rule)"). Its Rule now rests on three things: the Tax Authority's 4.7.2019 letter (a "קרן חוץ" is a unit; withholding on sale and distribution only; credit only for tax on the fund's distributions); s.88 "נייר ערך" since Amendment 147; and no attribution rule for a non-controlling holder (the old s.75B text, kept).
  - *The caution stays:* circular 7/2003 s.4.4 ("החיוב במס של בעל היחידה יערך לפי השקעות הקרן ...") is quoted as the contrary, older text. Circular 22/2002 s.3.1(ה) is added as its background. The record says whether "by implication" is enough is the founder's call under D10, and records the rulings-database search (45 capital-market rulings, none on point).
  - *CSPX:* BlackRock's factsheet is a named example, labelled institution.
  - *Elsewhere:* the OQ note is added (`**[2026-10-26 open-question hunt]** Narrowed: ... Still unknown: ...`), and the Summary bullet is updated.
  - *Quotes:* all verified.
- **TXF OQ3, narrowed.**
  - *TXF-10, Conditions:* the withholder computes on the gross amount and credits foreign tax up to the treaty or domestic rate. Sources: Tax Authority ruling 5916/20 (a US REIT on TASE, published 8.9.2020), labelled not binding beyond similar cases, with the rulings database's "בכפוף לקיום מערכת נסיבות דומה"; the 2019 letter s.4.1.4; and Mercantile Discount Bank's page as a named example (institution). Result: a US dividend with a W-8BEN bears no further Israeli withholding.
  - *Elsewhere:* the OQ note. *Quotes:* verified.
- **TXF OQ5, closed.**
  - *TXF-03, Conditions:* a currency fall gives an inflationary amount of zero, so tax applies to the whole shekel gain and never more. On a shekel loss, the currency part is not allowable. The family-company exception (ע"א 1038/17) is noted. Sources added: circular 10/2025 and the Moses ruling (capitax copy); `loss-offset` added to the dimensions.
  - *OQ5:* struck as `5. ~~**Currency weakening against the shekel.**~~ Closed 2026-10-26: ... (TXF-03, TXS-02)`.
  - *The audit's reading* ("a shekel loss is a capital loss whatever the currency did") is corrected in the question's note.
  - *Quotes:* verified.
- **TXF OQ7, narrowed.**
  - *TXF-16, Conditions:* US-Ireland treaty Art. 4(1)(d) (an Irish collective investment undertaking is resident), Art. 10(2)(b) (15%) and Art. 23 (limitation on benefits); the rate a given fund bears is that fund's fact.
  - *Elsewhere:* the OQ note. *Quotes:* verified (English).
- **TXS OQ12, narrowed.**
  - *TXS-06, Conditions:* s.92(א)(5) (fees not deducted become a securities capital loss); reg. 8 of the 2002 withholding regulations (only "אם אישר זאת המנהל, בהתאם לכללים שקבע"; not found); form 1325 counts only transaction commissions ("לא כולל עמלות תקופתיות"); carry-forward only with returns (circular 10/2025 s.4.3).
  - *Elsewhere:* the OQ note. *Quotes:* verified.
- **TXS OQ15, closed.**
  - *TXS-02, Rule:* if the index fell, the inflationary amount is 0 and the real gain equals the nominal gain. If the inflationary amount exceeds the nominal gain, the gain is fully exempt and there is no loss (the loss is nominal only). On a nominal loss while the index fell, the part equal to the fall is not allowed.
  - *TXS-02, Conditions:* the Inflation Adjustments Law exception (note 1) and form 1325 note 6. Sources added: circular 10/2025, the Moses ruling (capitax copy), s.88 "הפסד הון" (p.150) and form 1325.
  - *OQ15:* struck. *Quotes:* verified.
- **TXG OQ4, narrowed.**
  - *TXG-20, Conditions:* the Tax Authority treats a foreign-broker seller as a filer. Sources: form 1322 notes 1, 2(ב) and 6; the refund guide (updated 20.4.2026), which excludes "מסחר בניע"ז בפלטפורמה חיצונית" from form 135; s.91(ד)(2ג)(ב), which ties the half-yearly report to a seller "חייב בהגשת דוח לפי סעיף 131"; and circular 10/2025 s.4.3 (losses carry forward only with returns).
  - *Still open:* whether the 30 April annual foreign-income advance (TXG-19) can replace the return.
  - *TXG-19:* a dated Conditions note, plus `- Scope: general` (it is rule-base only and had none).
  - *Elsewhere:* the OQ note. *Quotes:* verified, except the one 6317א part above, which was not used.
- **TXG OQ13, closed.**
  - *TXG-12, Conditions:* a nominal gain below the inflationary amount is wholly exempt, with no loss (circular 10/2025 s.2.1, example 2; TXS-02). The source was added.
  - *OQ13 ("Real loss (for TXS)"):* struck. *Quotes:* verified.
- **TXS OQ7 (bonus), closed.**
  - *TXS-10, Conditions:* an exempt fund's distribution does not absorb a securities loss: circular 10/2025 s.3.7, "או כנגד רווחים ששילמה קרן נאמנות". The source was added.
  - *OQ7:* struck. *Quote:* verified.
- **TXG OQ5 (bonus), closed.**
  - *TXG-17:* the Figures line says the refund guide (updated 20.4.2026) gives the same ceilings "נכון לשנת 2026". Foreign income shares schedule ד with foreign pension.
  - *txg-17.json:* both figures are re-sourced to the refund guide, with `tax_year` 2026. The securities note now says the regulation covers only exempt or fully withheld proceeds, and that the guide's "or an advance was paid" is wider.
  - *OQ5:* struck. *Quote:* verified.

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

child-savings.md
- CS-04: Harel bylaw s.8 replaced by the CMA standard child bylaw s.8 (regulation-1056 p.5, "הפקדות לחשבון העמית יבוצעו בידי המוסד לביטוח לאומי בלבד לפי חוק הביטוח הלאומי"). [json: checked]
- CS-05: the bank floor now cited to hly.gov.il ("מסלולי החיסכון יבטיחו כי הילד יקבל בסוף תקופת החיסכון לכל הפחות את כספי ההפקדות (סכום הקרן)"); Yahav's s.3.8 wording kept only as a named example; Yahav 1.5 and the Harel annex dropped. [json]
- CS-06: Harel 7.1 replaced by the standard child bylaw s.7.1 (p.5). [json: checked]
- CS-08: every manager must offer the three risk tracks, halacha/sharia only if it runs one elsewhere (circular 2022-9-29 annex s.3(א), p.3); one track from reg. 4(א) (KT 7727 p.8); Altshuler Shaham Q&A dropped. [json]
- CS-10: locator p.22 (was p.5, pp.21-22). [json: checked]
- CS-12: Altshuler Shaham Q&A and Yahav agreement dropped; Yahav 4.6 moved to CS-28. [json: checked]
- CS-15: [json] text_he now gives both cohorts (age-3 and age-13/12 sums from 1.1.2017; the age-18 grant before), as the markdown already did (audit hand-off 2).
- CS-16: Yahav's after-18 terms moved to CS-28; "what was searched" added (NII circular 1356 p.9, NII withdrawal page, hly.gov.il); Harel s.8/s.28.1 replaced by the standard child bylaw s.8 and s.28.1 (p.9 "עמית יחדל להיות עמית בקופה במקרה שמשך או העביר את כל הכספים"). [json]
- CS-18: NII quote order fixed to "לאחר גיל 21 דמי הניהול ייגבו מחשבון החיסכון" (sum page, read). [json: checked]
- CS-25: Conditions say the page is out of date on the bank-to-provident point (law s.74ב(א)(2א), in force 1.1.2025); quote re-read. [json: checked]
- CS-27: re-sourced to circular 2022-9-29 (s.5 p.5, annex ג p.9): the row now reads "דמי ניהול ששולמו עבור העמית בפועל"; balloon wording updated; 2018 text kept second. [json]
- CS-28: absorbs the Yahav after-18 terms (Yahav 4.1-4.6, 5.3, 6.3, read in the cached agreement). [json: title, title_he, text_he]
- CS-30: Conditions add that 0.23% is not a product figure (brief item 7). No JSON change.

provident-family-common.md
- PF-02: annuitant caps now quoted from the Reshumot files (reg. 2(א)(3) 0.6%; reg. 2(א)(4) 0.3% from 1.2.2022, KT 9942 p.2); stale "read in summary on Wikisource" removed. [json]
- PF-05: [json] stale "copying site" sentence removed.
- PF-06: Altshuler page example dropped; reading backed by circular 2020-9-22 sign ב direction ג.1, p.37 ("כגון: קופה בניהול אישי, קרן השתלמות"). [json]
- PF-12: stale Wikisource remark removed. [json]
- PF-16: Conditions now say the standard bylaw ss.37.1-37.3 (p.10-11) adds a no-notice exception the circular lacks (not "the exception in PF-14"). [json: stale third-party-copy sentence removed]
- PF-19: Phoenix FAQ and Altshuler bylaws ss.16-19 dropped. [json: checked]
- PF-22: [json] stale "copying site" sentence removed.
- PF-23: the circular clause reworded as presupposing the right (s.4(ד)(3) context, p.4); the standard bylaw ss.10, 20.1-20.4 added; PF-40's clauses folded in. [json]
- PF-29: the gemel lehashkaa pledge re-sourced to Amendment 15 s.4 (p.2, adds "בקופת גמל להשקעה" to s.25(א)(1)). [json: checked]
- PF-33: [json] stale "third-party copy, no gov.il copy" sentence removed; the 2025-26 draft marked not binding (audit hand-off 2).
- PF-39: per-fund table moved to PF-41. [json: text_he]
- PF-40: The Phoenix only. [json: title, title_he, text_he]
- The standard bylaw's English link title "CMA standard bylaw for kupat gemel lehashkaa (2016)" replaced by a Hebrew title in PF and KGL (gives title_he).

kupat-gemel-lehashkaa.md
- KGL-02: Altshuler cl. 8.1 dropped, the standard bylaw s.8.1 added as the clean copy of law s.22(א); "as Altshuler words it" removed. [json: checked]
- KGL-06: standard bylaw ss.7.1-7.2 added (from KGL-26). [json]
- KGL-14: reg. 6 quoted ("כאילו היה חשבון נפרד": account, not fund); reg. 5 quoted for sector funds; stale Wikisource/Kol Zchut sentence removed; Altshuler and Yachad Rofim cl. 35 dropped (audit hand-off 3). [json]
- KGL-24: the comparison with company figures removed. [json]
- KGL-26: Altshuler cl. 7.1-7.2 moved to KGL-06. [json]
- KGL-27, KGL-28: see section 1. [json]
- KGL-30: says the two-year wording and s.37.3 are the CMA's own 2016 standard bylaw (ss.36.1, 36.2, 37.3, read), overridden by circular 2017-9-15. [json]

keren-hishtalmut.md
- KH-01: Harel wording as a named example; "copying site" removed. [json]
- KH-03: the s.20(א) quote marks its elision (opening words read on the rendered page 9: "שאינה קרן ותיקה שמונה לה מנהל מיוחד"); "gov.il is blocked" corrected (reachable through the gov.il route since 2026-10-25; orders not looked up). [json: checked]
- KH-12: Altshuler form dropped; text_he starts from the Ordinance and drops the stale "inference" and mirror remarks. [json]
- KH-17: Altshuler bylaws s.10 dropped. [json: checked]
- KH-23: fee-field units corrected from CAT-35/36/37 (percent; latest completed calendar year) (audit hand-off 3); company sentences split to KH-33. (No JSON record.)

ira-self-directed.md
- IRA-01: definition given as the current consolidated text (Wikisource mirror, with "כקופת גמל לקצבה") and the 2005 enacted text distinguished; stale "Nevo summarising fetch" removed. [json]
- IRA-03: count-method note (not reproducible from either query). Scope only otherwise.
- IRA-05, IRA-29: reg. 3(ג) → reg. 3(ב) (KT 6820 p.3, read). [json: checked]
- IRA-07: Meitav summary and joining form dropped (handling moved to IRA-29); draft marked not binding. [json: checked]
- IRA-09: **meaning corrected**: the regulation excludes severance money that does NOT come in place of s.14 severance pay unless the employer approved (reg. 2(ג), consolidated text: "כספים במרכיב הפיצויים שאינם באים במקום פיצויי פיטורים לפי סעיף 14 ... שמעבידו של העמית לא אישר לו להפקידם בקופה"); the record said the reverse. Release-letter route moved to IRA-29. Not flagged by the review. [json: title, title_he, text_he]
- IRA-15: locator reg. 6(א)-(ג)(5). [json: checked]
- IRA-16: Meitav warning moved to IRA-29. [json: checked]
- IRA-17: fee-field unit corrected from CAT-35/36/37 (audit hand-off 3). [json: checked]
- IRA-18: Meitav brokerage page dropped; pointer to IRA-21. [json: checked]
- IRA-21: Conditions state why it is Meitav's alone.
- IRA-23: the transfer regulations added as a source for seniority (KT 6657 p.6 reg. 3(ב)(1) "ויראו לעניין דיני המס, את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת"); text_he says "לעניין המס". [json]
- IRA-25: Calcalist item dropped (pointer to IRA-28). [json: checked]
- IRA-26: retitled to what the source says; not-binding line. [json: title, title_he, text_he]
- IRA-27: not-binding line. [json]
- IRA-28: CMA press release of 26.12.2023 added (https://www.gov.il/he/Departments/news/news_0008, read through govil-page.sh): the appointment was 26.12.2023, not 2024; "gov.il blocks scripts" corrected. [json: text_he; strength left "secondary", see requests]

### F2: pension, switching, insurance

pension-and-gemel-lekitzba.md
- PEN-01 `[json]`: text_he no longer says the wording was checked against a payroll company's copy (no such source).
- PEN-03 `[json]`: Harel's June 2016 letter dropped; the gov.il scan of the 2016 order is legible and carries every rate (p.2 page image viewed 2026-10-26); text_he provenance fixed.
- PEN-04 `[json]`: the 2026 average wage re-sourced from Harel to NII's average-wage page ("לפי סעיף 2 בחוק - קצבאות: 13,769 ש"ח", read 2026-10-26) and the Tax Authority's 2026 deductions booklet p.12 (read 2026-10-26); text_he fixed (audit hand-off 3).
- PEN-06 `[json]`: text_he: the law was read in the Knesset's Sefer HaChukim, not Wikisource.
- PEN-07 `[json]`: 2026 amounts computed from the NII average wage (half 6,884.50; most required NIS 1,170.37 a month, computed); Harel's table (which printed 1,170.24) dropped; text_he and the figure note fixed (audit hand-off 3).
- PEN-10 `[json]`: definition from the 1964 rules reg. 1 (btl copy p.4, "ושנקבע לגביה כי אינה זכאית לרכוש איגרת חוב מיועדת"), transfer terms from the CMA standard bylaw s.18 (p.18); the extension order and Mor's bylaws dropped; text_he rewritten.
- PEN-12: the day-61 quote moved to its own p.45, s.72(א) segment (the text layer interleaves "(א)"; read 2026-10-26).
- PEN-15: Conditions note that the Codex part 6 file garbles digits; figures come from the standard bylaw.
- PEN-18 `[json]`: the cumulative target is CPI plus 5.15% by the law's own definition (s.34ב "תשואת היעד המצטברת", p.34, read 2026-10-26); the determining date settled (section 6, item 6); Mor's bylaws dropped; text_he fixed.
- PEN-21 `[json]`: the disabled-member clause and monthly 0.04157% cited to the CMA standard bylaw s.8(א)-(ב) (pp.13-14, read 2026-10-26); 0.02497% and 0.08708% labelled computed ((1 + r)^(1/12) − 1); Mor's two bylaws dropped; text_he fixed.
- PEN-22 `[json]`: Mor's provident bylaws dropped; text_he fixed.
- PEN-23: "at least two" selected funds is in the circular, annex s.4(א) p.4, "יקבע הממונה שתי קרנות פנסיה חדשות מקיפות לפחות" (the review searched the other word order); quote added. Scope decision written in Conditions.
- PEN-25 (rule-base only): rewritten to circular 2017-9-15 (audit hand-off 3); Mor's out-of-date clause split to PEN-47.
- PEN-26 `[json]`: women born from January 1970: 65, from the Tax Authority's 2026 booklet p.7 ("65 ינואר 1970 ואילך", read 2026-10-26), open question 20 already closed; minimum eligibility age cited to the standard bylaw definitions (p.5, read 2026-10-26); Mor dropped; text_he fixed (audit hand-off 3).
- PEN-28 `[json]`: the 25%/5-year commutation condition un-inverted: only when the pension is at or below the minimum (standard bylaw s.51(א)(2), p.35, read 2026-10-26); Mor's bylaws and the Harel table dropped; 2026 figure from the Tax Authority booklet p.12. The review's second point (1 March, not 1 January) does not hold: amendment 13 (2015), p.5, moved the update to 1 January ("במקום 'ב–1 במרס' יבוא 'ב–1 בינואר'", read 2026-10-26; the Wikisource consolidated text agrees), now cited.
- PEN-29 `[json]`: the annuity condition un-inverted: no annuity, or annuities above the minimum (law s.23(ב)(3)(ג), amendment 13 p.4, read 2026-10-26); general sources lead (law, standard bylaw s.1 p.9 and s.52 p.36); Mor dropped; the minimum pension labelled computed (5% of NII's average wage); text_he and the figure note fixed (the note had the same inversion).
- PEN-34 `[json]`: the pre-2008 limit cited to amendment 3 (2008) s.3, p.2 (read 2026-10-26); Mor's copy replaced by CMA circular גמל 2021-2-1 (gov.il docx, read 2026-10-26), which names the standard bylaws and sets the withdrawal conditions; the same annuity inversion found and fixed ("ולא משולמת לו קצבה או משולמת לו קצבה אשר עולה על סכום הקצבה המזערי"); s.14.3 on non-compliant withdrawals while employed added; text_he fixed.
- PEN-37 `[json]`, PEN-40 `[json]`: links recorded, Infinity added (section 1).
- PEN-44 `[json]`: Analyst's 1.1.2016 and Altshuler Shaham's 1.3.2025 standard provident bylaws carry the same s.47 word for word (read 2026-10-26); the 2021 circular confirms a standard text exists but its base text was not found; still unsettled.
- Open question 10 updated (PEN-25, PEN-47).

switching-and-transfers.md
- SW-01, SW-03, SW-11, SW-12, SW-13, SW-16 `[json]`: text_he provenance sentences ("read on a copying site", "a third-party copy") now say Reshumot or gov.il.
- SW-04 `[json]`: reg. 1's second case added (an active member who told the receiving fund no deposits will come: the determining date is that notice; 6657 p.2, read 2026-10-26).
- SW-14 `[json]`: reg. 9(ד)'s order applies only when the receiving fund is also a new pension fund (2014 text p.5; the 2022 amendment p.7 reads "קרן חדשה מקיפה או קרן חדשה כללית"; both read 2026-10-26).
- SW-15 `[json]`: Altshuler Shaham and Infinity bylaws and The Phoenix's FAQ dropped; text_he fixed.
- SW-17 `[json]`: s.28(ב)'s exception restored: percentage pay is allowed "בתקופת הייעוץ הפנסיוני הקבועה בהסכם" (as enacted p.13 and the Wikisource consolidated text, both read 2026-10-26).
- SW-19 `[json]`: "read on the mirror" fixed; the search made is in the record.
- SW-20 `[json]`: re-sourced to the regulations; split (section 3); "some funds do not accept deposits" reworded as "depends on its bylaws".
- SW-21: Altshuler Shaham bylaws, Harel's flyer and the ice article dropped; the no-tax point is TXK-04's.
- SW-34: the review's search added; candidate for the open questions.
- SW-37: the search made added.
- SW-38: The Phoenix's FAQ dropped.
- SW-39 `[json]`: corrected: route (11א) (gemel lehashkaa to gemel lehashkaa) was added in 2020 inside the numbering range "(8) עד (12)" that reg. 3(ב)(1) excludes, and the 2020 amendment did not touch reg. 3(ב) (8735 p.2 and the Nevo consolidated text, both read 2026-10-26); the carry-over of payment dates is not stated for that route; new open question 17.
- SW-41 `[json]`: text_he no longer says the official copy "is identical to the copy read earlier"; markdown says the SW rules now cite gov.il.
- SW-44: the annex ג text-layer note; the NIS 11 and 11 + 1 cells checked on the rendered page 8 (2026-10-26); the operator's price page dropped.
- SW-52 and open question 10: cross-referenced to BRK open question 12 (audit hand-off 7).
- Open question 14 narrowed (reg. 1 defines "המנהל" "כהגדרתו בפקודת מס הכנסה"); open question 17 opened.

### F3: brokerage-account and etfs-and-index-funds

brokerage-account.md:
- BRK-01: member classes cited from TASE rules part 1, s.1 definitions (p.4) and s.2 (p.8, "חבר בורסה הוא חברה שהתאגדה ונרשמה בישראל"), checked 2026-10-26; the periodic report stays only for TASE's sentence on trading through members (no rule sentence found in rules part 1 or the part 3 guidelines), strength institution. [json: text_he no longer says the own-initiative case is open; it gives the ISA Q&A answer, QAA49a.pdf p.3 q.5, p.4 q.6]
- BRK-04: rules s.40 (p.39) first; admission conditions s.5 (pp.9-12); equity floor from the guidelines s.5ב (p.6: "17.9 מיליון ש"ח", "5.9 מיליון ש"ח"); the periodic report kept only for TASE's statement on the limit of its supervision over bank members (institution); NBCM guide and foreign-bank guide dropped (the latter's p.4 says only that the ISA supervises TASE). [json]
- BRK-06: the English permit-conditions link retitled so its title no longer matches documents.json's "Securities Law" row (it was extracted as kind law with the law's title).
- BRK-12: strength words institution; "not a compensation scheme" no longer worded as a rule; the searches written out; a Bank of Israel Monetary Committee summary of March 2012 (mc20120325h.pdf p.1: "כל אחת מהמסלקות פועלת כצד נגדי מרכזי", risk funds, at least 25% cash) recorded as a lead, not the rule text. [json: title, title_he, text_he, strength institution]
- BRK-13: strength words institution; Conditions say what was searched. [json: text_he attributes to TASE, strength institution]
- BRK-15: the periodic report (which only repeated the law) dropped; stale "open question 8" note replaced by BRK-33. [json: "נוסח החוק נקרא באתר שמעתיק אותו" removed]
- BRK-16: stale open question 10 replaced (BANK-16).
- BRK-18: the BoI 2009 summary link now carries its Hebrew title ("סיכום פעילות הפיקוח על הבנקים להגנת הצרכן הבנקאי בשנת 2008", act08.pdf p.1), checked 2026-10-26.
- BRK-21: "as read from the scanned text" hedge removed; s.5(א)(5) quoted (151.pdf p.4: "עמלות על מכירת ניירות ערך"). [json]
- BRK-27: the gross-payment sentence attributed to TASE's periodic report (strength institution); note that btl.gov.il only hosts the Finance Minister's regulations. [json]
- BRK-29: settled from TASE's part 3 guidelines (see section 2); heading and text rewritten. [json: title, title_he, text_he]
- BRK-32: rules s.1-2 added for the member classes; note that the page cannot be quoted (script-rendered) and that the record is a register.
- BRK-33: Amendment 63 s.45טז (p.9, "חובה לפרסם עמלות מסחר וסליקה") added first.
- BRK-35 / BRK-51: split (section 3). [json BRK-35: title, title_he, text_he, strength primary]
- BRK-36, BRK-28: general sentences turned into pointers. [json]
- BRK-37: split; strength words institution. [json: title, title_he, text_he, strength institution]
- BRK-39: strength words institution (TASE's product pages, price list, store). [json strength]
- BRK-45: the IRS wording "for a period starting on the date the form is signed and ending on the last day of the third succeeding calendar year" (Instructions for Form W-8BEN, "Expiration of Form W-8BEN", read 2026-10-26).
- BRK-47: the clause that Leumi need not keep a client's securities apart may depart from the Supervisor of Banks' custody guidance (BRK-10: "חובות שתכליתן לאפשר זיהוי בנפרד של נכסי הלקוחות"); Leumi does keep them apart in its books; not settled. [json]
- BRK-48: the Altshuler Shaham Trade tariff link has a Hebrew title.
- BRK-03, BRK-16, BRK-26, BRK-30: stale open questions (1, 8, 10, 19) replaced by what closed them (audit hand-off item 3). BRK-15 likewise.
- Summary: the closed foreign-broker withholding question corrected (BRK-27).
- Sources table: TASE's periodic report, NBCM and foreign-bank guides, site terms and data-product pages relabelled institution.
- BRK OQ12: points out that SW open question 10 and SW-52 ask the same question (hand-off item 7); the BoI court position (202207.pdf p.1, "המחיר קובע (was fixed) למחיר שנהג בכל בנק במועד ההכרזה על השירות כמפוקח", re-read 2026-10-26) was already recorded there by the audit.

etfs-and-index-funds.md:
- ETF-04: the dormant units cited from the law s.57ב(1)-(2) (ISA consolidated text p.43, "בסעיף קטן זה - יחידות רדומות"), checked 2026-10-26; IBI's report dropped. [json checked]
- ETF-06: the Wikisource link titled in Hebrew; reg. 3 located under its heading "חובת מינוי עושה שוק ועשיית שוק ביחידות קרן סל" (gazette p.2396), which the PDF layout misnumbers.
- ETF-09, ETF-54: the Wikisource copy added so the reg. 18(ה) quotes are checkable (the olaw page is interleaved), checked 2026-10-26.
- ETF-10: the Wikisource link titled in Hebrew.
- ETF-11, ETF-17, ETF-18, ETF-26, ETF-52: "Not binding" line (the Securities Authority's yearly report). [json: "פרסום של רשות ניירות ערך, לא מחייב."] ETF-52 notes ETF-11 cites the same page.
- ETF-14: the variable fee's scope cited from reg. 11(א) (a tracking fund that is not leveraged or inverse); Yalin Lapidot stays a named example.
- ETF-01, ETF-05, ETF-21, ETF-22, ETF-23, ETF-31: [json] stale "read on a copying site" sentences removed.
- ETF-32: the Securities Authority's count of 40 (Funds_Report2025.pdf p.3, "מתוכן 40 קרנות מסוג ETF שנסחר בבורסה ו 6- קרנות פתוחות") added first; note that TASE's page cannot be quoted; the f-etfs link kept (variants.server.ts reads it).
- ETF-33: TA-125's structure cited from the index guidelines annex 3 ss.1-2 (274765-1.pdf p.31); the brochure is TASE's own words (institution), retitled in Hebrew without "PDF". [json: title, title_he, text_he (the stale "rules not read" note, hand-off item 2), figure note]
- ETF-34: the guidelines replace the knowledge-centre page (pp.5, 9-12: Tamar thresholds 10%/15%, NIS 20m/40m, 30/50 agorot; Rimon thresholds; fast track s.4); "זיקה לישראל" replaced by the guidelines' "המניה הינה מניה ישראלית" (p.11). [json]
- ETF-35: the guidelines replace the knowledge-centre pages (ss.2(4), 3א-ד, 3ח, 9א); corrected: the universe list and the parameters are published at least five trading days before an update (p.11 s.3ח; p.18 s.9א(6)), not two weeks; the postponement rule names the U.S. and London exchanges, not only New York. [json: text_he; both figures re-sourced to the guidelines with corrected notes]
- ETF-36: the guidelines first (definitions p.7, weight formula s.8, parameter updates s.9, liquidity groups and factors pp.20-21, six-month medians pp.4-5); "every 15 seconds" is in the guidelines (p.15 footnote 1: "ועדת המדדים החליטה כי המדדים הרציפים והתיאורטיים יחושבו ויפורסמו בתדירות של 15 שניות"); TASE's pages stay only for the history and the public-holdings rounding. [json: the stale "cap in rules not read" sentence]
- ETF-37, ETF-38, ETF-39, ETF-46, ETF-48: strength words institution (index provider's own document). [json strength]
- ETF-40, ETF-47, ETF-49, ETF-53: splits (section 3). [json: titles, text_he, strength institution for 40, 47, 49]
- ETF-41: TASE's index page, which repeated the guidelines, dropped; the guidelines relabelled exchange rules. [json checked]
- ETF-42: the guidelines carry the formula, launch, base 100 and the 9.2.2017 expansion (annex 3 ss.6-8) and the 15 seconds (p.15); the index page kept only for the identifiers; the five-days-versus-two-weeks conflict reconciled (ETF-35 corrected). [json checked]
- ETF-43: the regulator's 40 added first; pointer to CAT-43. [json: title, text_he]
- ETF-44, ETF-45: the guidelines cited first (annexes 1 and 4, p.15); TASE's index pages kept for their description and identifiers, strength institution. [json checked]
- ETF-50: note that it is a count; pointer to CAT-43. [json: the "TASE forbids republishing" sentence replaced]
- ETF-51: the TASE guidelines labelled exchange rules (ch. ב s.2(6), derivatives on Rimon indices).
- MKT-01: Scope institution: J.P. Morgan Asset Management; note that it is a series.
- Sources table: TASE brochure, knowledge-centre and index pages, S&P, Nasdaq and MSCI documents relabelled institution; the index guidelines relabelled exchange rules.

### F4: banks, bank product names, mutual funds, regulators, government bonds, the catalogue

#### bank-current-account-deposits.md
- BANK-05: the renewal-table sentence now cites directive 447 Annex A p.3 (columns "תנאי חידוש") and circular 2781 p.3; Yahav and Mercantile moved from the Source line to named examples in Conditions (checked 2026-10-26).
- BANK-06: s.10 corrected: (א) joins the nearest date *and* the changes or principles; (ב) "ואין צורך לפרט את התוצאות המדוייקות הנוגעות לפקדון המסויים" (151.pdf p.6). [json]
- BANK-09, BANK-14: Yahav only as a named example in Conditions; dropped from the Source line.
- BANK-17: the annual check now distinguishes s.4A(ב1) (senior citizen, person with disabilities: basic track only) from s.4A(ב2) (small business, licensed dealer "עוסק מורשה", not "exempt dealer": basic or extended) (159a.pdf p.5); the banks' track names are named examples; their pages left the Source line. [json]
- BANK-21: the bill marked "(a bill, not binding)"; Leumi, Mercantile, Massad and the ice.co.il item moved to named examples in Conditions. text_he no longer says the "small bank" definition was not read. [json]
- BANK-23: now cites the 2026 competition law s.16 first ("שר האוצר ונגיד בנק ישראל יבחנו אם מתקיימים נסיבות או תנאים המקימים צורך בביטוח פיקדונות", 119.pdf p.2); the bill marked not binding; Conditions record the searches made. [json]
- BANK-26, BANK-27, BANK-28: rewritten with the splits (section 3); BANK-27 cites 447 s.5(ג) p.2 and Annex A; BANK-28 adds 447 s.4(ב) p.1 and its search. [json]
#### bank-product-names.md
- BPN-10: the closing general sentence removed from text_he (its source belongs to BANK-28/BANK-02); Conditions say where it lives. [json]
#### mutual-funds-and-money-market-funds.md
- MF-01: "Likely to change" adds what ס"ח 3579 does (adds the private investment trust fund, deletes "קרן ייחודית", read 2026-10-26); text_he no longer says the law was read on a copying site (it is the ISA's consolidated text). [json]
- MF-08 (audit hand-off 3): open question 17 narrowed: s.47(א)(3) only gains "ובקרן השקעות פרטיות בנאמנות - לא תעלה על 15 שנים" (25_lsr_14375739.pdf p.3, item (6)).
- MF-10: Meitav only as a named example; off the Source line.
- MF-13: s.48 rewritten from the ISA consolidated text p.39: (2) is the chair's approval at the manager's request, the 60-day cap applies only to (3) orders, (1) orders may be extended "כל עוד מתקיימת עילה כאמור בו"; the "summarising fetch" note removed. [json]
- MF-17: "Not binding" line (a voluntary outline described in the ISA's report and guide). [json]
- MF-21: classification regulations reg. 3(א)(8) added ("שיעור הוספה בקרן אם נגבית הוספה", Wikisource mirror).
- MF-24: Conditions say the 2006 base text had other types and rates (0.25%/0.8%/0.4%, KT 6464 p.3) and the 2013 amendment (KT 7236) set today's; Leumi's tariff only as a named example.
- MF-28 (rule base only, hand-off 3): the variable band's basis now points to ETF-14, ETF-07 (open question 13 closed 2026-10-25); Scope `institution: Meitav`.
- MF-32, MF-34, MF-37, MF-39: the final 447A (04/25) replaces "draft" wording; MF-37's bank-commissions clause now cites 447A Annex A note (4) ("האומדן הוא לפני חישוב מס רווחי הון ועמלות בנקאיות"); MF-39 lists the final sections (ss.5, 6, 13, 14, 18, 19). [json ×4]
- MF-41: "Not binding" line (ISA reports and guide describe; they bind no one). [json]
- MF-55: Scope paragraph; the publications and terms pages marked "recorded only: a JavaScript page".
- Terms table: "A447 draft" links → the final 447a.pdf (6 rows).
#### regulators-and-protection.md
- Summary: the segregation line now says the TASE rules (s.26ג(1), 274691 p.96, read 2026-10-26) bind every non-bank member; failure is still open.
- REG-01: quote corrected to "והביקורת" (103.pdf p.4).
- REG-13: TASE's self-description moved to REG-32.
- REG-14: TASE's guides relabelled institution; Scope paragraph. [json: strength institution]
- REG-15: TASE guides relabelled `institution (TASE's own guide, for what TASE states)`.
- REG-16: the TASE PDFs' cited pages carry their own "מעודכן עד ליום" dates (19.8.24, 4.3.18, 7.4.22); the file's latest pages are 1.1.26; locators say so.
- REG-26: Conditions record the scope decision.
#### government-bonds-and-makam.md
- Summary (hand-off 3): the 0% floor and 4% margin belong only to the old "גילון חדש"; the type auctioned now has neither; 447A read in its final text.
- GOV-02: both laws pay "מתוך הכנסותיה הכלליות של המדינה ומתוך נכסיה"; the marginal heading is "תשלום וערובה"; Nevo remark out of text_he. [json]
- GOV-03: 447A s.17 ("מועד פירעונו הוא עד שנה") is the final directive, not a draft. [json]
- GOV-10, GOV-12, GOV-15: Nevo remark out of text_he (sources are Reshumot files). [json ×3]
- GOV-11: definitions re-quoted from the gazette (KT 6457 p.4), not "the Nevo text". [json]
- GOV-13: heading no longer says "formerly שחר"; Wikipedia dropped; the AG page settles the mapping. [json: title, title_he, text_he]
- GOV-14 (hand-offs 2, 3): heading no longer "formerly גילון"; gov-14.json: text_he rewritten (current type, no margin, no floor; old type separate), coupon_every_months re-sourced to the 2006 regulations' "תקופת ריבית" (KT 6457 p.6: "ביום העסקים הבנקאי האחרון בחודש השלישי שקדם לו"), notes on linkage, margin_cap and coupon_floor updated (old type only). [json]
- GOV-16: the market-price buyback rule removed: the 2007 amendments replaced the tail "ובמחיר השוק" in every type (KT 6597 pp.3-5); title changed. [json: title, title_he, text_he]
- GOV-17: the makam listing sentence cites the BoI conditions s.5.2 (makam.pdf p.9); text_he points to GOV-24 for the trading unit. [json]
- GOV-18: text_he no longer says מירון is known only from a secondary source (the AG lists it). [json]
- GOV-19: all 87 SECDWH series carry "Free (free for publication)" and "Published on the website: Yes" (EDGE CSV fetched 2026-10-26). [json]
- Terms table: "שחר", "גליל", "גילון חדש" are older separate types (AG page), not former names; "ממשלתית שקלית" no longer cites Wikipedia; "A447 draft" links → final 447a.pdf.
#### tracks-catalogue-and-decoder.md
- CAT-06: the portals' year label leads; Meitav's label a named example; its page off the Source line; "changes every January" says what it rests on. [json]
- CAT-09: the claim now rests on the CMA's transfer_bank dataset: all 764 Gemel-Net 202609 FUND_IDs are track numbers there, 85 also fund numbers (join run 2026-10-26); Meitav a named example. [json]
- CAT-10: the five dead datastore_search_sql links replaced by datastore_search queries (202609, fields), values re-read; TARGET_POPULATION spelling "מסויים" as in the data; the "values not in 202609" line marked not re-checkable.
- CAT-15: text_he no longer says the list was not obtained. [json]
- CAT-17: Harel's grouping replaced by the CMA list's clusters 1 to 5 and "מסלולים מתמחים – אחר"; Harel off the Source line. [json]
- CAT-19: the closed general track now cites the 2024 list notes ("המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)"); s.3(ד) described as what it says (pre-2004 insurance policies). [json]
- CAT-23: see section 1. [json]
- CAT-24: Meitav's notice described as a change of its regulatory policy under the same name; the Meitav-versus-Harel example replaced by the count over all 11 managers of "משולב סחיר" in kupat gemel lehashkaa, 202609 (equities 23.9% to 99.1%, abroad 1.2% to 109.4%, computed 2026-10-26); Harel off the Source line. [json]
- CAT-35: "empty is not zero" now traced (portal "- - -" vs "0.00%", recorded in CAT-40; first-value rule CAT-36).
- CAT-39: the fee pair holds for tracks that have a value; four funds also have empty tracks (Altshuler Shaham new and general, Mor new and general; checked over every row 2026-10-26); the concepts page marked recorded only. [json]
- CAT-42, CAT-43: Scope paragraphs; their segments relabelled institution (TASE's own platform / site terms). [json: strength institution]
#### managed-and-robo-portfolios.md
- MGD-23 (hand-off 6): no company named Psagot among the 129; left open (MGD OQ17): whether Psagot manages portfolios through an entity under another name was not established; the register is a JavaScript page.

### F5: the tax files

tax-gemel-lehashkaa-ira-child.md (TXK)
- TXK-02 (no json): hand-off 3: the 2026 ceiling re-sourced to Amendment 15 s.3 ([Knesset 20_lsr_343169.pdf](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2, "לא יעלו על 70,000 שקלים חדשים", interleaved text layer) and the CBS linkage calculator (to_value 83641.09), as KGL-03/KGL-24; Harel's 2026 table and the Wikisource editor's note dropped; the freeze sentence now only says s.120ב(ה) is in the Ordinance ([Knesset 25_lsr_5396578.pdf](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf) p.2, read). checked 2026-10-26.
- TXK-04 [json]: Harel flyer dropped; the Ministry of Finance team's interim report (Feb 2025) p.14 "וכן מעבר בין קופות גמל להשקעה אינה נחשבת" added (found 2026-10-26); text_he no longer leans on "חברה מנהלת אומרת".
- TXK-09 [json]: text_he's press sentence dropped (the press report lives in TXK-21).
- TXK-16 [json]: hand-off 3: the current consolidated definition (Wikisource raw, s.1 tagged last amended תשפ"ב) also names "קופת גמל לקצבה"; neither text names a kupat gemel lehashkaa (IRA OQ4); Wikisource source added. checked 2026-10-26.
- TXK-17 [json]: the "not found" now rests on the Tax Authority's consolidated Ordinance (312 pages, no "בניהול אישי", re-run 2026-10-26), not the Nevo mirror.
- TXK-23 [json]: "the managers apply it on the real gain" dropped (no manager document cited); the real-gain base is the law's (TXK-07); the dated press guide kept only in Conditions as corroboration.
- TXK-25 [json]: not binding: National Insurance's FAQ (btl pension.aspx, quote found 2026-10-26), line in Conditions and text_he.
- TXK Summary, TXK-07 Conditions, TXK OQ3: pointed at TXK-26 (regulation) and TXK-28 (Harel); OQ3 annotated with today's Wikisource reading.
- TXK-26 [json]: see 1 (title, title_he, text_he, figure_names_he, figures, strength primary).

tax-pension-gemel-lekitzba.md (TXP)
- TXP-04, 05, 06, 12, 13, 14, 15, 17, 27 [json]: text_he's stale "הפקודה נקראה בעותק בוויקיטקסט (ואומתה מול …)" dropped; the markdown already cites the Tax Authority's PDF.
- TXP-16 (no json): hand-off 3: "form not found" now points to form 161ד (TXP-28; OQ1 closed 2026-10-22).
- TXP-19: hand-off 3: "notice and choice forms not read" now points to form 161 (TXP-29) and its part B choices (TXP-30; OQ2 closed 2026-10-22).

tax-interest-deposits-bonds.md (TXI)
- TXI-05 [json]: the Minister's definition of partial linkage differentials now cited: תקנות מס הכנסה (קביעת הפרשי הצמדה חלקיים), התשס"ג-2003, ק"ת 6227 p.9 reg. 1 "הפרשי הצמדה חלקיים הם כל אחד מאלה" (read 2026-10-26); the Terms row updated.
- TXI Summary and worked statement (hand-off 3): NII and health on interest settled (NII Law s.350(א)(6), [btl 00_0001_000000.pdf](https://www.btl.gov.il/Laws1/00_0001_000000.pdf) p.246, read 2026-10-26; TXG-27, TXG-34); the Gilon row from "blocked" to "sourced" (OQ8 closed 2026-10-26).
- TXI-17 [json]: the bank-practice sentence rests on withholding regulations 2002 reg. 9(א)(1)-(2) ([btl 02_0103_100228.pdf](https://www.btl.gov.il/Laws1/02_0103_100228.pdf) p.2, read); Discount's and Mercantile's pages dropped.
- TXI-25 [json, title]: the ruling read in a third-party copy, [capitax.co.il/Attachments/7486-14.pdf](https://www.capitax.co.il/Attachments/7486-14.pdf) (the court's file 14074860_L09): p.8 para 13 "מדובר בחלופות הכנסה נפרדות ועצמאיות"; p.15 para 23 leaves the offset open ("תוך שאיני מביע דעתי לגופו של עניין … הסוגיה תיבחן בעתיד"); para 22 does not rule on s.28. Corrected: the Supreme Court upheld the separation (interest taxed in full) and did not uphold the no-offset point, which is the district court's. Pointers corrected in the TXI worked table (2 rows), TXI OQ6, TX2-01 Conditions and TX2 OQ1.

tax-securities-israeli.md (TXS)
- TXS-07, 08, 09, 10, 11, 14, 19, 22 (review 6.3): Migdal Mutual Funds' 30.1.2026 prospectus dropped from each general record's Source line (it only restated the law). TXS-08's REIT finality now cites Ordinance s.64א5(א)(4) p.107 "יראו מס ששולם לפי פסקה זו כמס סופי שקרן הנאמנות הפטורה חייבת בו"; TXS-14's currency-unit rule cites s.88 "מדד" p.146 "לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד" and "נייר ערך" p.148 (includes "יחידה"); TXS-19's return requirement rests on reg. 9(א)(1). All read 2026-10-26. [json] TXS-07 (the "field מסלול המס" generalisation removed), TXS-09 ("the prospectus describes the case" reworded as the rule's own case).
- TXS-11 [json]: hand-off 2: text_he now says circular 7/2003 s.2.1.1 states the principle (OQ11 closed).
- TXS-12 [json, figures]: split (3); hand-off 3: the stale "no taxable money-market fund was found" replaced by Maya's count (TXS-24); the `taxable_fund_rate` figure (15%, used by `packages/engine/src/ledgers/securities.ts:170`) re-sourced from a bizportal article (secondary) to Ordinance s.125ג(ג)(1) p.204 and circular 7/2003 s.2.1.1 (quote found 2026-10-26), notes updated.
- TXS-13 [json]: split (3); text_he no longer cites one manager's prospectus.
- TXS-15: locator p.16 → p.17 (gazette p.1017).
- TXS-23 [json]: hand-off 2: the recovery route and the exempt-fund reach are stated (return, form 0135, reg. 11 coordination; s.91(ב1)(1ב)).
- TXS-24 [json]: split (3); text_he says it is a count over every fund in the export.
- TXS-25 [json]: Yalin Lapidot's footnote 3 names only foreign-traded and dual-listed securities (verified p.1); the third situation is Migdal's only; the "likely common" guess removed.
- TXS Summary (hand-off 3): the money-market bullet and the "field מסלול המס" bullet updated.

tax-securities-foreign.md (TXF)
- TXF-04: locator p.2 → pp.2-3 (section 4.1.5 starts on p.2; the 90% condition is on p.3, confirmed on the rendered page 2026-10-26; the text layer prints "60%").
- TXF-05 [json]: Bank Leumi's ETF page dropped (Source line, Conditions, text_he).
- TXF-11 [json checked]: the personal-finance blog that text_he relies on is now on the Source line as secondary (it was only linked in Conditions).
- TXF-16 [json, figure note]: hand-off 2: "whether Ireland withholds on distributions was not found" replaced: Ireland deducts nothing (TXF-28; OQ6 closed 2026-10-26).
- TXF-21 [json, figure note]: hand-off 2: the "low-resolution page image" note replaced (guide p.5 item 3, 375,000, re-read 2026-10-26).
- TXF-22: locator p.152 → pp.152-153 (the dates are on p.153).

tax-general.md (TXG)
- TXG-17 [json]: hand-off 6, settled from the regulation (see 6).

tax-hishtalmut.md (TXH)
- TXH-04, TXH-17 [json]: not binding: the Chief Economist's paper (review-15102025.pdf p.5, quotes found 2026-10-26), in Conditions and text_he.
- TXH-13: the 2024 memorandum marked a draft, not binding, corroboration only (tazkirim.gov.il fails TLS by script).
- TXH-22 [json]: split (3); not binding; the search for a bill recorded in the record.

tax-tier2-other.md (TX2)
- TX2-09 (no json): hand-off 3: Amendment 285 ([Knesset 25_lsr_12223928.pdf](https://fs.knesset.gov.il/25/law/25_lsr_12223928.pdf) p.346 s.1(1)(א)-(ב), read 2026-10-26) adds to "הכנסות חריגות" (70%) "הכנסות ממכירת מקרקעין שבעת רכישתם היו מקרקעין בהקמה, אם נמכרו בטרם חלפו ארבע שנים לפחות מהמועד שבו החלו לשמש למטרת השכרה", and adds income from property under construction to the kinds outside the 5% test; Rule, Source and the Terms row updated.
- TX2-01 Conditions, TX2 OQ1: TXI-25 correction.
- TX2-17 [json title]: the English title keeps the 75%-of-turnover condition; the s.4(ב) "מס שכר וריווח" sentence marked as resting on the Wikisource mirror only.
- TX2-18: Conditions say the primary strength covers the statutory part; the structured-payout application is a reading.
- TX2-21: the page's "כיום 23%" company note marked undated.

tax-insurance-and-amendment-190.md (TXA)
- TXA-27 [json]: the "three payslips in the funds' forms" sentence now rests on ruling 6849/15 fact 1.5 (TXA-30), not an unnamed company practice.
- TXA-28, TXA-03: locator p.21 → p.22 for s.3(ה5).
- TXA-30 (no json): hand-off 4: "Not binding: a ruling made with one unnamed company, binds no one else"; Scope line already general.
- TXA-22, TXA-23, TXA-24 (no json): hand-off 4: decided general on ruling 6849/15 (facts 1.1, 1.4-1.6, s.3.4-3.5, read 2026-10-26); each Rule opens with the ruling; the funds' forms (Altshuler Shaham, Analyst, Mor) stay as named examples; TXA-23's 38,412 is named as the funds' computation of the s.45A/s.47 maximums; Analyst's "non-compliant if a condition fails" kept as Analyst's wording (the ruling sends such a commutation to the assessing officer, s.3.4).

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

- KH-03: extension orders not looked up on gov.il (an open-question research task beyond text fixes); the record now says the route exists.
- KGL-27: whether any circular after 2016 changed the standard bylaw s.11 was not established (said in the record).
- IRA-01: the amendment that added annuity funds to the IRA definition was not identified.
- CS-30: left as it is apart from the not-a-product-figure line (it already names Harel and Altshuler Shaham and says others were not checked).
- Source titles in English for company documents (Altshuler, Harel, Meitav, Infinity, Yachad Rofim) left: documents.json already maps them to Hebrew titles; renaming them would break that mapping.

**F2**

- PEN-28, the review's "updated each 1 March, not 1 January": the review read only the 2008 text; amendment 13 (2015) moved it to 1 January. The record was right; the citation was added.
- SW-17, the recorded span for s.13(ב)(1) in the 2015 Economic Plan Law PDF that a script cannot match: left (180-page PDF, likely its text layer); the record's s.13(ב)(1) statement is not in doubt.
- SW-36 (locator "p.68 (file p.69)"): already right; no change.
- SW-43 (circular h-2833 misprints "488-1-14"): the record correctly says 448; no change.
- PEN-37/PEN-40: Meitav's and Menora Mivtachim's bylaw links not found (one web search); left unrecorded, said so in the records.
- PEN-44: the base text of the CMA standard provident bylaw not found (web searches); stays unsettled.
- SW open question 14: the Ordinance's definition of "המנהל" was not located in the Tax Authority's text by a quick search; narrowed only.

**F3**

- BRK-41, BRK-42, BRK-43, BRK-44, BRK-50, ETF-28, ETF-29, ETF-46 to ETF-49, ETF-64, ETF-65, ETF-66, BRK-35 (CCPC), BRK-12 (TASE English guide): sources with no title_he. They are English documents or Hebrew titles with Latin fund or index names (IBI, MSCI, Nasdaq, MTF); the extraction gives title_he only to a title with no Latin letter, so the markdown cannot fix them without translating names. Needs documents.json rows (section 10).
- ETF-48: page=None on msci.com locators: msci.com/documents URLs are not recognised as PDFs by the extraction; not fixable in the markdown.
- BRK-32, ETF-32 (TASE part): no quoted span from TASE's script-rendered pages (curl returns an empty shell); left as recorded.
- BRK-12: the clearing-house rules were not found (three web searches; TASE rules part 1 and part 3 guidelines read); stays unsettled.
- BRK-21, BRK-22: kind regulator_page for the 1992 Disclosure Rules (151.pdf): set by publishers.json for boi.org.il; documents.json has no row for these rules (section 10).
- BRK-27: publisher shown as National Insurance Institute for btl.gov.il: set by publishers.json (section 10); the record now says the regulations are the Finance Minister's.
- The ETF-33 figure "constituents" (125) and BRK-12 figure "clearing_members" (21) keep source strength "primary" for a TASE document; left so the figure's display does not change (a company's figure about its own index/clearing house in its own context, D31).
- The same IRS W-8BEN wording ("until ...") appears in tax-securities-foreign.md TXF-13 conditions (F5's file): not edited.

**F4**

- REG-21 (Scope line and the 1.7.2022 / 1.10.2022 date): left for the editor, as instructed (F2 settles it against PEN-18).
- CAT-10: the four SPECIALIZATION values not seen in 202609 could not be re-checked: the DISTINCT endpoint now returns HTML, and `datastore_search` with `distinct=true` returned only part of the values; the line is marked.
- MF-01: the s.5(א)(3) change "from 2.2.2027" (mirror note) and the amendment at ס"ח התשפ"ו p.359 not read.
- GOV-12: "the AG's 'תקנות אג"ח סחיר' page was not reachable (open question 6)" not re-checked (not in the issue list).
- The Sources tables at the end of the MF, GOV and BANK files still list the Nevo mirrors and the 447A draft as historical entries; left.
- MF-55: the ISA publications and terms pages not re-tried (the review found them to be JavaScript shells); recorded only.

**F5**

- TXK-06, TXK-07: the 2016 government bill is labelled kind `law` → not fixable in the markdown (the link title already says "הצעת חוק … דברי הסבר"); a documents.json entry overrides it (see 10).
- TXA-29: the review's issue (The Phoenix's s.125ד figures shown only as The Phoenix's) is already how the record and its text_he read; no change.
- TXS OQ1: the audit's note that TXS-24 counts open-end funds only, so the ETF half is open, was left as the audit left it.
- TXS-24's counts were not re-run (Maya's export is script-rendered; read in Chrome on 2026-10-22).

**F6 and F7 (the hunt)**

- **Quotes not written as the row gave them:**
  - KT 11476 rule 3(ב)(1): the row adds "חדשה", which the gazette text does not have. Quoted without it.
  - The report's "לא קיימת הסדרה מקבילה" sentence: cited on p.3, where it is, not p.10.
- **Not carried over:**
  - "shekel money-market funds" as the reg. 15 10% class (the regulation ties it to each fund's policy);
  - the row's line for the institution records BRK-48 and MF-56 (went into general records);
  - the "reg. 12(א)" refund sentence for TXI-20 (context, not needed).
- **Blocked, not retried:** TASE's trading-hours page (apicontent.tase.co.il, 403 per the row). Not located: the report PDF on boi.org.il.
- **Label the markdown cannot fix:** `cdn.funder.co.il` is in `NEWS_HOSTS` in `extract-sources.ts`, so the joint report extracts as kind `article`. A `documents.json` row (an official regulators' report, publisher_he "הפיקוח על הבנקים, משרד האוצר ורשות ניירות ערך") would label it.

- **Skipped:** the TXG OQ4 quote part from ק"ת 6317א ("ישלם בשלהן מקדמה שנתית עד יום 30 באפריל בשנת המס שלאחריה") was not found in the scan's text layer. It was not written anew; TXG-19 already carries that quote from an earlier pass.
- **Skipped:** the row's suggestion to add the rule to "TXS-02 (and TXG)". In TXG it went into TXG-12, the TXG definitions record that names the question, as a pointer to TXS-02.
- **Blocked (per the rows, not retried):** the Supreme Court's own copy of ע"א 3555/15 (https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts\15\550\035\e25&fileName=15035550_e25.txt&type=4), which resets scripted connections. The ruling was read in capitax.co.il's copy.

## 12. Blocked pages

None was worked around.

**F1**

None met in F1's items.

**F2**

- None met in this part (gov.il HTML not needed; Nevo, Wikisource, btl.gov.il, prisha.co.il, company PDFs all answered curl).

**F3**

None newly met. (Not re-tried: market.tase.co.il and www.tase.co.il pages are script-rendered; the editor's earlier readings were in a browser.)

**F4**

- https://www.investors.isa.gov.il/page/search-advisor?isa_type_s=%D7%A0%D7%99%D7%94%D7%95%D7%9C%20%D7%AA%D7%99%D7%A7%D7%99%D7%9D&itemsPerPage=27 (MGD-23: a JavaScript app; curl gets an empty frame)
- Per the review, not re-tried: https://www.new.isa.gov.il/nav-index/supervised-mutualfunds/mutualfundsActivities and https://www.new.isa.gov.il/nav-index/supervised-general/takanon2 (MF-55); https://pensyanet.cma.gov.il/Home/Concepts (CAT-39); https://maya.tase.co.il/he/funds/mutual-funds (CAT-42); https://www.tase.co.il/he/content/about/terms_of_service (CAT-43).

**F5**

- https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2 (TXI-25): connection reset by curl, 2026-10-26; not worked around; the ruling was read in a third-party copy on capitax.co.il instead.
- https://www.calcalist.co.il/local_news/article/skys1wkozg (TXH-24): 403 bot check (per the review); not retried.
- https://www.tazkirim.gov.il/s/legislativeworkactivity/a133Y00000LPZM1QAP (TXH-13): TLS certificate failure by script (per the review); not retried.
- https://maya.tase.co.il/he/funds/mutual-funds (TXS-24, TXS-26): script-rendered; not re-run.

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
