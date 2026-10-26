# Requests for the lead from the scope settling pass (2026-10-26)

Written by the rule-base editor beside `settle-brief.md`. Each item is a decision or a change outside the rule base (engine, site, `data/` other than `data/rules`, `docs/`), which the brief leaves to the lead. Nothing here has been done. The full settling report is `settled.md` in this folder.

## 1. The child-savings fee after 21 (brief item 7, review.md 6.1)

What the records now say:
- **CS-18 (general):** the National Insurance Institute (NII) bears the management cost until 21 and pays the funds 0.23% a year of assets. That figure is NII's payment, not a rate after 21. After 21 the general provident-fund cap applies: up to 1.05% a year of the balance and up to 4% of deposits. The figures are `balance_cap_after_21` = 1.05 and `deposit_cap_after_21` = 4. The NII quote's word order was also fixed.
- **CS-30 (`institution: Harel, Altshuler Shaham, Bank Yahav`):** Harel's bylaw fills in 0.23% of the balance and 0% of deposits. Altshuler Shaham says it charges 0.23% of the balance after 21. Bank Yahav's account for the programme is fee-free. The other managers were not checked. Its Conditions now say that 0.23% is not a figure for the product.

What is left for the lead:
- The child-savings ledger in the engine (formula F-54, `packages/engine/src/ledgers/child-savings.ts`, `book.rate("CS-30", "fee_after_21")`) presents those two companies' rate as the provident route's rate.
- Run it either on CS-18's cap, labelled "עד", or on a rate the person enters, bounded by the cap. Show Harel's and Altshuler Shaham's 0.23% only as a named example. The guide already names them.
- CS-30 is also cited in `data/instruments/wrappers/child-savings-provident.json` and in three dimension files.

## 2. MF-26 against the non-bank brokers' custody fee on money-market units (audit hand-off 6): no conflict

- **The audit's worry:** the fee snapshots of Altshuler Shaham Trade, Excellence, IBI and Psagot apply custody to money-market fund units, while MF-26 (distribution-fee regulations, reg. 2(ד)) bars any fee on those units for a distributor under an agreement.
- **Answered by the open-question hunt (BRK OQ11, closed 2026-10-26):** the regulations define "מפיץ" as "מפיץ שאינו משווק השקעות כהגדרתו בחוק הסדרת העיסוק" (reg. 1), so they do not bind an investment marketer. The regulators' joint report of June 2026 says most non-bank members are marketers with no distribution agreements, and that no parallel fee rule binds them. The bank ban (BRK-17) binds banks only. The new general rule is BRK-52; MF-26 and MF-27 now say "a distributor that is not an investment marketer".
- **So the four snapshots can stay as they are.** Their custody notes cite "(BRK OQ11)" and could cite BRK-52 once it has a record. The report adds, as practice and not a term, that custody at non-bank members is customarily waived for all clients. Section 10 lists the method and page effects.
- **Not touched:** nothing in `data/fees/`.

## 3. New rule ids with no `data/rules` record

The splits produced 17 new records and the open-question hunt one more (BRK-52); none of them is used by the site yet. Add a `data/rules` record for those the company pages (spec section 4) should show.

| New id | Split from | Scope | What it holds |
|---|---|---|---|
| BANK-36 | BANK-26 | institution: Bank Leumi, Bank Yahav, Discount Bank | Quoting a linked deposit as a real rate plus linkage, and the three banks' linked products |
| BANK-37 | BANK-27 | institution: Bank Leumi, Bank Massad, Bank Yahav, Mercantile Discount Bank | Exit-point patterns, minimum deposits, Yahav's business-day rule |
| BANK-38 | BANK-28 | institution: Bank Yahav, Bank Leumi, Discount Bank, First International Bank, Bank Massad | Each bank's savings-plan structures |
| BRK-52 | new (BRK OQ11) | general | Non-bank TASE members: no rule limits their custody fee on makam and money-market units |
| BRK-51 | BRK-35 | institution: Interactive Brokers Ireland | IB Ireland's own statements: segregation, SIPC, the Lloyd's excess |
| ETF-68 | ETF-47 | institution: IBI, Mor, MTF | How the three NASDAQ-100 funds word their tracking asset |
| ETF-69 | ETF-49 | institution: MTF, Tachlit, IBI, Kesem | How the five MSCI funds word their tracking asset |
| KH-33 | KH-23 | institution: Altshuler Shaham, Harel, Meitav | How the three companies state the study-fund fee |
| PEN-45 | PEN-10 | institution: Mor | Mor's general fund takes members in without a joining request |
| PEN-46 | PEN-19 | institution: nine pension funds | Each fund's actuarial surplus or deficit for 2024 and 2025 (really a data series) |
| PEN-47 | PEN-25 | institution: Mor | Mor's provident bylaws still print a two-year fee discount, against the circular's five years |
| PF-41 | PF-39 | institution: nine pension funds | Each fund's 2025 fee averages from the regulator's table ד-9 (a data series) |
| REG-32 | REG-13 | institution: Tel Aviv Stock Exchange | TASE as a listed company, its subsidiaries, its self-description |
| SW-56 | SW-20 | institution: The Phoenix | The Phoenix's 0.75% fee for digital joining |
| TXH-24 | TXH-22 | unsettled (press reports only) | The 2026 press reports on a possible 2027 proposal |
| TXK-28 | TXK-26 | unsettled; seen at: Harel | Harel's statement that it withholds 25% on a kupat gemel lehashkaa lump sum |
| TXS-26 | TXS-12, TXS-24 | institution: Yalin Lapidot, Migdal Mutual Funds, Harel | The tax track of named money-market funds |
| TXS-27 | TXS-13 | institution: Migdal Mutual Funds | The tax track of Migdal's ETFs in its 2026 tables |

Some company parts went into records that already existed, whose JSON was updated: CS-16 into CS-28; IRA-07, IRA-09 and IRA-16 into IRA-29. Some general parts went into existing general records: PF-40 into PF-23, KGL-26 into KGL-06.

Removed from a record: TXK-26 no longer carries Harel's `harel_stated_rate` figure (25%). Only the built site used it. If TXK-28 gets a record, the figure belongs there.

## 4. Not rules (judgement call: listed, not moved)

The rules page lists every `data/rules` record, so every one of these is cited by the site. None was moved; each carries the scope the definition gives it in the meantime.

**Forum posts, to become experience notes or leave the rule set:** SW-X01, SW-X02, SW-X03, SW-X04 (Hasolidit). They already sit under the switching file's "Experience" heading.

**Press reports:**
- IRA-28 (events at Slice and Globalnet; it now also cites the regulator's own 26.12.2023 press release). It could become a note on the protection topic or an open question.
- TXH-24 (new id): a note under TXH-22, or an open question.

**Series and per-company figures, to go to `data/`:**
- MKT-01: J.P. Morgan's past-return slide.
- PEN-46 and PF-41 (new ids): per-fund series from the regulator's tables.
- MF-18: the Securities Authority's yearly average fee per fund type.
- CS-20: the share of tracks chosen by parents.
- CS-22: market shares; the programme roster stays a rule.
- CS-08: the figures only; the rule part is general.
- SW-53: two brokers' tariffs, which belong in `data/fees`.
- TXS-26 and TXS-27 (new ids): a tax-track field on each fund record.

**Counts and lists, to go to `data/` as a dated count or list with its method:**
- IRA-03 (15 IRA funds of 7 companies) and IRA-17 (the range of IRA fee averages).
- ETF-32, ETF-43 and ETF-50: the foreign funds on TASE, and the ETF counts per index.
- BRK-32: TASE's member register.
- TXS-24: Maya's count of exempt and taxable funds.
- CAT-42: Maya's counts and download steps.
- MF-52: new, merged and liquidated funds a year.
- REG-03 (the Bank of Israel's list of banking corporations) and REG-14 (TASE's member list), for the institution registry.
- MGD-23 (rule base only): the register's 129 portfolio managers.
- ETF-17, ETF-18 and ETF-26 are the Securities Authority's own counts. They stay general and not binding, and could also live in `data/`.

**Website terms and where things are published, to become data-licensing or data-source notes (`docs/data-inventory.md`):**
- MF-55: the Securities Authority's site terms.
- CAT-43: TASE's site terms.
- GOV-19: where official yields are published.
- PF-39: its gov.il terms-of-use paragraph only.

**Computation checks and summaries:**
- KGL-24 is a check of KGL-03 and could merge into it.
- TXS-22 summarises TXS-08 to TXS-11 and could become a note or guide prose.

**"No rule exists" records, kept with the search written in each:** BANK-23, BANK-27 (the no-minimum statement), IRA-10, SW-19, SW-34, SW-37. They are candidates for the open questions.

## 5. Records that are not general but are cited in product contexts (D30, spec section 4)

Found by `tools/ed_cited.py`. These are cited in guide or exposure pages, wrapper records, terms or the engine. Under D30 a product context shows general rules only. Index exposure pages are the index's own context (D31), so ETF-37 to ETF-40 may stay on `index-sp500`.

- BANK-34 (institution: Bank Leumi, Bank Hapoalim, Bank Yahav): guides `bank-deposit`, `savings-plan`
- BPN-10 (institution: Bank Hapoalim): wrapper `savings-plan`, guide `savings-plan`
- BRK-12 (unsettled): wrapper `brokerage-account`, term `mslkt-hbvrsh`, guide `brokerage-account`
- BRK-13 (institution: Tel Aviv Stock Exchange): wrapper `brokerage-account`, terms `dybydnd`, `hchbrh-lryshvmym`, guides `brokerage-account`, `government-bond`, `makam`
- BRK-23 (institution: Bank Leumi): exposure `index-sp500`, wrapper `brokerage-account`, terms `amlt-chlypyn-b`, `mrvvch-hmrh`
- BRK-28 (institution: Bank Leumi, Meitav Trade, Fair, Psagot): wrappers `brokerage-account`, `money-market-fund-daily`, `money-market-fund-renewable`, term `chshbvn-nyyrvt-ark`
- BRK-36 (institution: Interactive Israel): term `brvkr-zr`, `packages/engine/src/formulas/fees.ts`
- BRK-37 (institution: Tel Aviv Stock Exchange): `site/app/lib/fees.server.ts`, `holdings.server.ts`, `variants.server.ts`, `routes/workbench-providers.tsx` (the calculator link-out under TASE's terms; method F-61)
- CS-09 (institution: Harel): wrapper `child-savings-provident`, terms `chvskym-hmadypym-sykvn-mvgbr`, `mslvl-bryrt-mchdl`
- CS-29 (institution: Bank Leumi, Bank Yahav): wrapper `child-savings-bank`
- CS-30 (institution: Harel, Altshuler Shaham, Bank Yahav): wrapper `child-savings-provident`, the engine's F-54, guide `child-savings-provident` (named there)
- ETF-19 (institution: IBI), ETF-27 (institution: BlackRock), ETF-30 (institution: iShares): exposures `index-*`, terms
- ETF-37 to ETF-40 (institution: S&P Dow Jones Indices): exposure `index-sp500` (its own context)
- IRA-21 (institution: Meitav): wrappers `ira-hishtalmut`, `ira-provident`, terms `amlvt-brvkraz`, `hlyk-tchrvty`, guides `ira-hishtalmut`, `ira-provident`
- IRA-22 (institution: Meitav Trade): wrappers `ira-*`, term `dmy-mshmrt`
- IRA-28 (institution: Slice, Globalnet): wrappers and guides `ira-*`
- KGL-26 (institution: Altshuler Shaham, Meitav, Hebrew University provident fund): term `mtnh-blty-chvzrt` ("מתנה בלתי חוזרת" is Meitav's wording)
- KH-09, KH-13, KH-25, KH-27 (institution: Altshuler Shaham, Harel): wrapper `keren-hishtalmut`, terms
- REG-14 (institution: Tel Aviv Stock Exchange): guide `brokerage-account`
- REG-26 (institution: Interactive Israel): wrapper `brokerage-account`
- SW-34 (unsettled): wrapper `brokerage-account`
- Also in the data files: BRK-12 and BRK-13 in every `data/fees/*` snapshot's protection list; CAT-43 in `site/app/lib/variants.server.ts` and about 40 `data/funds/*@2026-10-25.json`; MF-55 in `site/app/lib/fees.server.ts`.

## 6. Corrections that need a change outside the rule base

- **IRA-09 said the reverse of the regulation.** Reg. 2(ג) needs the employer's approval for severance money that does *not* replace s.14 severance pay; the record said it was needed for money that does. The record is now corrected (the review had not caught it).
  - The eligibility text in `data/instruments/wrappers/ira-provident.json` says "severance money needs the employer's approval" and needs the same correction.
  - The same text carries "Meitav suggests from about NIS 200,000", a company's figure in a product context.
- **BRK-35 is now Ireland's investor compensation scheme** (general, from the Irish consumer regulator). The two Interactive fee snapshots (`data/fees/interactive-brokers@2026-10-25.json`, `interactive-israel@2026-10-25.json`, `protection_rule_ids`) and `data/terms/sipc.json` cite BRK-35. If they meant IB Ireland's own statements, those are now BRK-51, which has no record yet.
- **gov-14.json:** the `margin_cap` (4%) and `coupon_floor` (0%) figures belong only to the old type "גילון חדש"; their notes now say so. The type auctioned today has neither. Drop them, or label them on the site.
- **`data/dimensions/fee-exit.json`** still lists CS-16, but Bank Yahav's early-break cost now sits in CS-28. CS-28's own dimensions were not changed.
- **TXS-12's `taxable_fund_rate`** (15%, used by `packages/engine/src/ledgers/securities.ts`) now cites the Ordinance s.125ג(ג)(1) and circular 7/2003 instead of a press article. The value is unchanged; only the figure's provenance on the site may change.
- **TXI-25 now reads the judgment in a copy.** The Supreme Court held that interest is taxed in full, but left open whether the linkage loss can be offset (para 23). The "not offset" half is the district court's. Five pages cite TXI-25 in a `RulesLine` (the two money-market guides, the government-bond guide and exposure, the shekel-cash exposure), and so does the government bond's signature bundle (`site/app/lib/guide-signature.server.ts`). The record's own text is corrected; check any prose there that says the Supreme Court ruled out the offset.
- **docs/method.md lines that are not split ids,** so the editor left them:
  - Line 375 (G-07): "negative linkage not offset, TXI-25". Say instead: interest taxed in full (the Supreme Court); the no-offset point is the district court's, and the Supreme Court left it open.
  - Line 224 (F-25): "the rule base has not sourced it (GOV-13)". GOV-13 now sources 12-month interest periods for the fixed-rate type (KT 6457 regs. 1, 5(ג)).
  - Line 211 (optional): circular 7/2003 s.2.1.1 now states the taxable-fund principle (TXS-11).

## 7. Source labels the markdown cannot fix (`data/sources/documents.json` or the extraction)

The kind and the Hebrew title of a source come from `publishers.json`, `documents.json` and host rules in `extract-sources.ts`.

**Kinds:**
- TASE's own documents are labelled `exchange_rules` by the host rule for tase.co.il, but they are TASE's own documents (`institution_doc`):
  - its brochures and guides: "מדדי הבורסה המובילים", "How to become TASE Foreign Bank Member", "How to become an NBCM" (documents.json row `tase-nbcm-guide-2026`), "TASE, How to become TASE Remote Member", "מדריך לחברות בבורסה - חש"ב";
  - its site terms (row `tase-terms-of-use-2026`);
  - its knowledge-centre and data-product pages.
- `market.tase.co.il` is a `dataset` in publishers.json, and every dataset ranks first. TASE's index "about" pages therefore come before the exchange guidelines in ETF-44 and ETF-45. Fix with a documents.json row or a rank rule.
- The Banking (Customer Service) (Proper Disclosure) Rules 1992 (boi `151.pdf`, BRK-21, BRK-22) come out as `regulator_page`, while the Fees Rules come out as `regulation`. A documents.json row would label them `regulation`.
- The 2016 bill for Amendment 15 (TXK-06, TXK-07) matches row `prov-df9eea2b` ("... (תיקון מס' 15), התשע"ו-2016", kind law). A row with the longer token "הצעת חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15)" would label it as a bill (`official_pdf`).
- The Supreme Court ruling in TXI-25 (the court's own link and the Capitax copy) has no row. A row (publisher_he "בית המשפט העליון") would label it.
- The CMA standard bylaws for kupat gemel lehashkaa (regulation-2829) and for child savings (regulation-1056) have no row. They now carry Hebrew link titles, but a row would group them on the documents page.

- The regulators' joint report of June 2026 ("מודלי תגמול בפעילות הציבור בניירות ערך", BRK-52, MF-27) is read in funder.co.il's copy. `cdn.funder.co.il` is in `NEWS_HOSTS` in `extract-sources.ts`, so it extracts as kind `article`. A documents.json row (an official report; publisher_he "הפיקוח על הבנקים, משרד האוצר ורשות ניירות ערך") would label it.

**Publishers:** btl.gov.il's publisher is "National Insurance Institute", but NII only hosts the Income Tax regulations, which are the Finance Minister's (BRK-27 and others). www.ccpc.ie, www.msci.com and www.spglobal.com have no publishers.json row.

**Hebrew titles:** foreign documents, and Hebrew titles with Latin fund or index names, get no `title_he`. Examples are BRK-35 (CCPC), BRK-41 to BRK-44, BRK-50, ETF-28, ETF-29, ETF-46 to ETF-49, ETF-64 to ETF-66, and the English link titles of company bylaws (Mor, The Phoenix). 18 records still warn that their first source lacks one.

## 8. Calls the founder may want to see

These were decided on the sources. The reasons are in `settled.md`.
- **PEN-23 kept whole and general,** against the review's suggested split. The four default pension funds and their 1% + 0.22% fee are the regulator's own selection result, published by the regulator, not one company's term.
- **PF-40 and KGL-26:** the company part kept the id. Their general clauses, which are the regulator's standard bylaw word for word, went into the general records PF-23 and KGL-06. PF-40 had been made the day before as PF-23's company part.
- **BRK-29 is general,** against the review's unsettled. TASE's trading guidelines set session times only for Monday to Thursday and Friday.
- **REG-14 is institution: Tel Aviv Stock Exchange,** against the review's general. It rests only on TASE's own membership guides.
- **GOV-13 was not split.** The Accountant General's page settles the old bond names.
- **TXK-26 was split, and Harel's 25% (TXK-28) is unsettled rather than institution.** "Not amended since 2017" rests on a mirror and searches, not on the gazette after 2017.
- **The Maya records:** CAT-42 (Maya's filter and download) is institution: Tel Aviv Stock Exchange, and TXS-24 (the count over every fund in Maya's export) is general as a count. They are different claims; both are listed as not rules.

## 9. Housekeeping

- **Scope lines outside the review:** 347 rule-base blocks outside `data/rules` still have no Scope line. The review did not cover them, and the site does not show them. Any of them added to `data/rules` later needs a Scope line first.
- **Validator warnings left:**
  - "Rule strength differs from its strongest source": BRK-43, BRK-46, IRA-28, MKT-01, PEN-40, PEN-44, TXK-23. IRA-28 is mostly press; PEN-40 and PEN-44 are unsettled records that cite the general text they are compared with.
  - "First source lacks title_he": 18 records.
  - "Source checked later than the rule's checked": 489, down from 1,002.
  - "Figures behind the current tax year": TX2-21 and TXF-21 (TXG-17's is gone: its ceilings are now sourced "נכון לשנת 2026").
- **Hebrew text:** the settling pass and the hunt rewrote `title_he` or `text_he` in 184 `data/rules` records (list in `tools/work/json-text-changed.txt`, gitignored). The Hebrew editor may want a pass. Eleven of them now carry digits they did not carry before (BANK-23, CS-15, CS-16, CS-28, ETF-33, IRA-28, KGL-30, PEN-04, PF-02, TXF-10, TXK-16): years, ages, a section number, an index name and the form W-8BEN.

## 10. Site effects of the open-question hunt (2026-10-26, rows in `research/knowledge/2026-10-26-oq-hunt/`)

The 20 rows are applied in the rule base:
- **Closed (8):** BRK OQ11, MF OQ4, TXI OQ2, TXF OQ5, TXS OQ15, TXG OQ13, TXS OQ7, TXG OQ5.
- **Narrowed (11):** MF OQ3, TXI OQ14, BANK OQ12, TXI OQ5, TXI OQ3, TXI OQ11, TXF OQ1, TXF OQ3, TXF OQ7, TXS OQ12, TXG OQ4.
- **Open (1):** TXI OQ9.

What each row means outside the rule base:

**BRK OQ11 closed (BRK-52, BRK-17, MF-26, MF-27).**
- **Method F-63:** its "money-market funds held free" holds at banks only (and at a distributor that is not a marketer and has an agreement for that fund).
- **At a non-bank broker:** the tariff's custody line applies, with a provenance note that the regulators report custody there is customarily waived (practice, not a term).
- **The report's two lines:** a handling fee (דמי טיפול בפיקדון, usually fixed, often refunded) and custody (דמי משמרת, customarily waived). These match the two kinds of line in the four snapshots.
- **Idle-cash and comparison verdicts:** when they put a money-market fund at a non-bank broker, add that broker's buy and sell commission on fund units. Banks do not charge it on money-market funds.
- **Guide text:** "no custody on money-market funds anywhere" should say "at banks".
- **Data marks naming BRK-OQ11:**
  - the open lists of `data/instruments/wrappers/money-market-fund-daily.json`, `money-market-fund-renewable.json`, `makam.json` and `brokerage-account.json`, and `data/instruments/exposures/makam.json`;
  - the fee notes in the two money-market wrappers and `makam.json`;
  - the custody notes in `data/fees/altshuler-trade@2026-10-23.json`, `excellence@…`, `ibi@…` and `psagot@…`.

**MF OQ4 closed (MF-11).**
- **Method gap G-26 can close for the redemption day:**
  - a fund whose policy keeps foreign securities at no more than 10% of net assets pays on the day the order reaches the clearing house (same day if the order is in before the designated hour on a pricing day);
  - a fund allowed more pays one trading day later;
  - a fixed-date fund pays only on its fixed date.
- **Data and copy:**
  - lift `"liquidity-lockup": "blocked:MF-OQ4"` on both money-market wrappers;
  - drop MF-OQ4 from their open lists and from `exposures/shekel-cash.json`;
  - `site/app/copy.ts` `mmfPayoutDays` and comments in `guide.server.ts` and `guide-signature.server.ts` name it.

**MF OQ3 narrowed (MF-10, MF-14).**
- **The order-timing line can say:**
  - orders before the fund's designated hour are executed that pricing day, later ones the next;
  - no Sunday execution since 5.1.2026;
  - funds not limited in foreign securities take orders Monday to Thursday only.
- **Do not show one cut-off hour for daily funds.** For renewable funds the hour is in the bank's 447A display (per-fund data).
- **G-26 stays open** for the daily-fund hours and for Friday.

**TXI OQ14 narrowed (TXI-07, BANK-06).**
- **The deposit guide can say:** breaking early is taxed only on the interest actually paid, at the deposit's rate, withheld by the bank. A break penalty may exceed all the interest; that is the bank's term.
- **The engine** should not offset a principal loss from a break against other income.
- **Marks:** `shekel-cash.json`, `savings-plan.json`, `bank-deposit.json`, `guide.server.ts`.

**BANK OQ12 narrowed (BANK-28).**
- **The savings-plan guide** should not model instalments as separate lock-ups by default. The plan's own exit points and the 447 break column decide.
- **Method G-16** can be labelled "product term, per bank" instead of "rule missing".

**TXI OQ5 narrowed (TXI-16).**
- **The guides can say:** the coupon is withheld in full (15% unlinked, 25% of the real coupon linked) from whoever holds the bond on the payment date, and a buyer not in business cannot offset the part before the purchase (s.3(ח)(1)).
- **Do not compute** a capital loss from accrued interest paid.
- **Keep** G-10 and the government-bond price-side blocker.

**TXI OQ3 narrowed (TXI-11).**
- **The makam guide and exposure** can show 15% on the discount held to redemption as sourced (the law and reg. 5(א)), with a note that one line of the Tax Authority's guide says 20%.
- **G-09** narrows to the split of a sale before redemption.

**TXI OQ2 closed (TXI-04).**
- **Prime-based deposits and plans** compute at 15% on all interest, shown as sourced; drop the "reading" caveat.
- **Drop TXI-OQ2** from the open lists of `bank-deposit.json`, `savings-plan.json` and `shekel-cash.json`; `guide.server.ts` names it.

**TXI OQ9 open, TXI OQ11 narrowed:** no change. TXI OQ9 keeps 15% at every age and the makam tag; TXI OQ11 leaves the current-account blocker as it is.

**TXS OQ15 and TXG OQ13 closed (TXS-02, TXG-12).**
- **F-40's `max(0, real)` is confirmed:** no loss arises when the CPI rise exceeds the nominal gain.
- **If losses are ever modelled:** in a deflation the allowable loss is the nominal loss minus the index fall.
- **docs/method.md G-07** can drop both questions.
- **Data:** "TXS-OQ15" sits in the open lists of both money-market wrappers and `exposures/government-bond-cpi.json`, and `site/app/content/exposure/government-bond-cpi.tsx` lists it as "not documented yet". It can state TXS-02.

**TXF OQ5 closed (TXF-03).**
- **The engine can compute foreign-currency holdings when the shekel strengthens:**
  - the inflationary amount is `max(0, cost × (rate_sale / rate_buy − 1))`;
  - on a loss, the currency part is not allowable.
- **TX2 OQ1 (deposits)** stays separate.

**TXS OQ7 closed (TXS-10):** exempt-fund pages can say that a fund's distributions do not absorb securities losses (circular 10/2025 s.3.7).

**TXG OQ5 closed (TXG-17):** `txg-17.json`'s ceilings are re-sourced to the Tax Authority's refund guide for tax year 2026 (values unchanged). Only the provenance link changes.

**TXF OQ1 narrowed (TXF-11).**
- **The caution stays:** the sale-only reading now rests on the Tax Authority's 4.7.2019 letter by implication, and circular 7/2003 s.4.4 points the other way.
- **Founder's call under D10:** whether "by implication" is enough to drop the caution.
- **Where the caution appears:** `site/app/copy.ts` g18, `site/app/lib/variants.ts`, `content/guide/brokerage-account.tsx`, `content/exposure/index-sp500.tsx`, and `wrappers/brokerage-account.json` ("secondary source ... (TXF-11; TXF OQ1)").
- **G-18's numbers** are unchanged.

**TXF OQ3 narrowed (TXF-10).**
- **US holdings through an Israeli bank:** dividends bear 25% in total (US 25%, Israeli top-up 0), not 50%, per a Tax Authority ruling (not binding beyond similar cases) and bank practice.
- **An Irish distributing fund** bears 25% in Israel on top of the fund-level US 15% (TXF-16, TXF-28).

**TXF OQ7 narrowed (TXF-16).**
- **F-20's fund-level US 15% for an Irish fund** can cite the treaty cap, labelled "treaty rate; the fund's own report not read".
- **It stays a cost inside the fund** and is not credited.

**TXS OQ12 narrowed (TXS-06):** keep G-20 flagged. The fee deduction is certain only through a return, or as a securities loss.

**TXG OQ4 narrowed (TXG-20).**
- **The site can say:** a foreign-broker account means an annual return, half-yearly reports and advances, and losses carry forward only with a filed return.
- **The 375,000 shortcut stays blocked:** `copy.ts` noReturnCode, G-22, `packages/engine/src/compare/candidates.ts`.
