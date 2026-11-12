# Coverage: what in `docs/product.md` the knowledge base does not cover yet

Written 2026-10-22, after the 29 topic files in this folder were finished and reviewed.
The current number of rules is in SKILL.md and the open questions, each with its status, are in `data/open-questions.json` (generated from these files); on 2026-11-06 they were 1,051 rules and 550 numbered open questions, of which 144 are closed, 119 narrowed and 287 open. Every rule has a link and a
checked date. Rules that only point to other rules carry the links of the rules they point to.

This file lists what is still missing, in the order of `docs/product.md`. Each gap names the file and
open question (OQ) or rule where the detail is. "Out of scope for the knowledge base" marks
things product.md asks for that are data, method or design work rather than rules.

*2026-11-06:* the file now opens with a living table of the six things a reader needs for each kind of holding (what it is, tax, cost, getting the money out, what protects it if the company fails, moving it), graded from the rule files. The numbered sections after it are the gaps per `docs/product.md` section, as before.

**Do not research (founder, 2026-11-03).** Forty-three managing companies closed to one profession, employer or municipality are left out of the data and of this rule base. Do not collect, read or cite anything of theirs, and do not count their eligibility as a gap. The list, by legal id, is `EXCLUDED_COMPANIES` in `packages/pipeline/src/adapters/cma.ts`.

---

## The six things, kind by kind (living table)

*Graded 2026-11-06 from the rule base as it is on `main` at 177f169d (after the protection, tier-1 tax, pension-factors, open-questions and glossary branches), and `data/open-questions.json` for each question's status. Started from section 1 of `8dd1f013:research/specs/2026-11-06-guides-coverage/map.md`; every cell was graded again from the rule files, not copied from the map. Re-graded the same day after an independent check (`8dd1f013:research/audit/2026-11-06-six-things/check.md`) and after the tax rules on moving one's own securities and on a broken deposit landed (TXS-38 to TXS-40, TXI-26, at bfc59f93). On 2026-11-07 the savings policy's "what it is" and "getting the money out" were re-graded after the savings-policy pass of 2026-11-06 (fac9204b, 7f716e99), the securities account's failure cell after the second protection pass (3295ebb7), and the ranking below with them; the child-savings tax cell went from O! to L! the same day, when both routes' rates came to cite the Ordinance (TXK-23; TXK-29, the bank route's rates labelled the site's reading), and the counts with it. Later on 2026-11-07 the gaps pass (research-rb-gaps-1) re-graded Israel Bonds, the structured deposit, the FX deposit's exit, single shares and structured notes and bonds (FXD-18 to FXD-24, CORP-27 to CORP-30, SHR-01), with the counts; the savings plan's cells named BANK-38 and the new BANK-48 after eight banks' plans were read (research-rb-bank), with no grade change; the domain source check moved REIT · getting the money out from C to L (RG-02 read in the gazette) and re-cited the current account's, the Israeli index fund's and gold's cost cells to official texts (BANK-35, ETF-13, RG-14).*

For every kind of holding the guides cover, how well this rule base answers the six questions of the Guides goal: what it is, how it is taxed, what it costs, when the money can come out, what protects it if the company fails, and how to move it. Each cell names the rules that answer it and the open questions that leave part of it open.

**Grades.**
- **L**: answered from the law, a regulator or the exchange, read in its official publication (the gazette on fs.knesset.gov.il, gov.il, the Bank of Israel's, the Securities Authority's or the exchange's own site, National Insurance's own publications, a foreign regulator's own site).
- **C**: answered only from a copy of the law or of a regulator's report (Wikisource, Nevo, olaw.org.il, prisha.co.il, capitax.co.il, a press host of a regulator's report), or only from companies' own documents. National Insurance's law files (`btl.gov.il/Laws1/`, its consolidated texts of the Income Tax Ordinance and of regulations) are a state body's consolidated copy, not the binding gazette wording, and the rule records call them that; they count as a copy here. No cell rests only on them since 2026-11-07 (gold through a fund · tax moved to the Tax Authority's text); REIT · getting the money out left them on 2026-11-07 (RG-02, read in the gazette). In fourteen L cells some of the rules rest only on them; those rules are marked "(National Insurance's copy)" in the cell.
- **O**: open: not recorded, or only inferred in a rule that says it must not compute.
- **–**: does not apply: the holding sits in a securities account and moves with it, or the money follows the product that holds it.
- **!** after a grade: an open question in that cell can change a reader's result (a figure, a date, or which choice is better). A cell without it may still list open questions; those change wording or detail, not a result.

**How a cell is graded.** The grade is for the general answer. A company's own figure or term (its fee, its break penalty, its tariff) is that company's by design and does not lower a cell whose general rule is L; the cell names such rules as "(companies)" or "(one bank)". A rule that cites both an official text and a copy counts as official for what it read officially; where a cell's key rule rests partly on a copy, the cell says so. "Derived" means the answer follows from texts read officially but no text says it in one place.

**Kinds.** The map's 28 kinds, with its one row for index funds and ETFs split into three (Israeli fund, foreign fund traded on TASE, foreign-domiciled ETF bought abroad), because their tax and protection differ: 30 kinds, 180 cells. Left out, as in the map's section 1: the 43 closed managing companies and every track closed to joiners (CLAUDE.md, D51); the kinds out by scope (crypto, peer-to-peer lending, derivatives, leveraged FX and CFD platforms, leveraged and inverse ETFs, private equity, physical real estate, collectibles); and what the rule base names without researching (old pension funds closed to joiners, savings-and-credit cooperatives and gemach deposits, hedge funds in trust and private investment trust funds, real-estate crowdfunding, insurance-plan IRAs, payment wallets).

**Keeping it current.** When a rule or an open question named in a cell changes, re-grade the cell, its row's count, the totals and the ranking below in the same commit. A new kind gets a row with all six cells.

### Cash and bank

| Kind | What it is | Tax | Cost | Getting the money out | If the company fails | Moving it | Count |
|---|---|---|---|---|---|---|---|
| Current account | **L** BANK-01, BANK-09, BANK-17 | **L!** TXI-03, TXI-08<br>Open: TXI OQ11 (whether the low-income deduction reaches it) | **L** BANK-16, BANK-17; BANK-35 (the 2026 caps and what counts as an action, read in the gazette) | **L** BANK-20, BANK-45 | **L** REG-04, REG-06, BANK-23 (no deposit insurance; a discretionary state guarantee)<br>Open: BANK OQ8, REG OQ13 (any basis beyond s.8יא) | **L** SW-26 to SW-31<br>Open: SW OQ9 | L 6, C 0, O 0; 1 with ! |
| Bank deposit | **L!** BANK-02, BANK-14, BANK-26, BANK-27, BANK-41<br>Open: BANK OQ17 (whether the published rate of a CPI-linked type is real or nominal) | **L!** TXI-03 to TXI-05, TXI-07, TXI-25, TXI-26<br>Open: TXI OQ14 (a break taxes only the interest paid, a reading; whether principal lost to a break penalty is a capital loss) | **L** BANK-06 (the break price is each bank's term, shown in its directive-447 table), BANK-16; BANK-33 (two banks), BANK-49 (One Zero) | **L** BANK-05, BANK-06, BANK-27, BANK-40, BANK-41 | **L** REG-04, REG-06 | **L!** SW-32, BANK-21<br>Open: BANK OQ6, SW OQ13 (the Competition Authority's deposit directives) | L 6, C 0, O 0; 3 with ! |
| Savings plan | **L** BANK-28; BANK-38 (ten banks, 52 plans, as many as the data holds, 2026-11-09) | **L!** TXI-07, TXI-26<br>Open: TXI OQ14 (a break taxes only the interest paid, a reading; whether interest credited inside a multi-year plan is withheld when credited or when withdrawn; whether principal lost to a break penalty is a capital loss) | **L** BANK-28 (break terms are each bank's, disclosed under s.7(ב)(5), s.10, the 447 break column, directive 425 and directive 432 s.6); BANK-48 (ten banks), BANK-49 (One Zero), BPN-10 (one bank) | **L!** BANK-28, BANK-42; BANK-38, BANK-48 (ten banks: six no break, three with a penalty, one by consent without interest), BANK-49 (One Zero: 10% of the interest accrued); BPN-10<br>Open: BANK OQ12 (the break price at the banks that allow one is unpublished) | **L** REG-04, REG-06 | **L** SW-32 (a plan is a deposit, BANK-28) | L 6, C 0, O 0; 2 with ! |
| Foreign-currency deposit | **L** FXD-01, FXD-02; FXD-07, FXD-08 (banks' terms)<br>Open: FXD OQ1, FXD OQ12 | **L!** TX2-01, TX2-03, TX2-19, TXI-04; TX2-02 (the 25% withheld is banks' practice; National Insurance's copy)<br>Open: TX2 OQ2 (legal basis of the 25%) | **L!** FXD-05; FXD-06 (one bank)<br>Open: FXD OQ2 (conversion spread or fee), FXD OQ3 | **L** FXD-22 (the disclosure rules reach FX deposits: s.7(ב)(5), the break form of s.10, notices under s.9(ב) and s.11); FXD-07 (banks' terms: no exit points)<br>Open: FXD OQ4 (narrowed: whether a break is allowed and its price are each bank's terms) | **L** FXD-16, REG-04, REG-06 | **L** SW-29, FXD-04 | L 6, C 0, O 0; 2 with ! |
| Structured deposit | **L!** FXD-10; FXD-11, FXD-12 (banks' terms)<br>Open: FXD OQ6 (inside or outside the law's "structured product"), FXD OQ7 | **L!** TX2-05, TX2-18 (derived from the partial-linkage regulations)<br>Open: TX2 OQ5 | **L!** FXD-23 (no fee rule covers deposits, BANK-16: the cost is inside the formula; the ISA staff position of 4.5.2026, p.5; directive 460 s.11)<br>Open: FXD OQ13 (no rule makes the bank disclose its margin) | **L** FXD-24 (the disclosure rules' break form; ISA 4.5.2026 pp.5, 7: full or near-full principal protection and at least three months before redemption keep it outside the Securities Law); FXD-11, FXD-12 (banks' terms) | **L** FXD-16, REG-04 (the guarantee is the bank's own promise) | **L** SW-29 | L 6, C 0, O 0; 3 with ! |

### The state's debt

| Kind | What it is | Tax | Cost | Getting the money out | If the company fails | Moving it | Count |
|---|---|---|---|---|---|---|---|
| Makam | **L** GOV-01, GOV-03, GOV-04, GOV-22 | **L!** TXI-01, TXI-11 (15% by law), TXI-12<br>Open: TXI OQ3 (the split on a sale before redemption) | **L** GOV-21, BANK-18, BRK-17, BRK-52 | **L** GOV-17, GOV-22, GOV-24<br>Open: GOV OQ7 | **L** GOV-02 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 1 with ! |
| Government bond | **L!** GOV-08, GOV-11 to GOV-15<br>Open: GOV OQ6 (a deflation floor per series), GOV OQ4 | **L!** TXI-12, TXI-14, TXI-15, TXI-16<br>Open: TXI OQ5 (accrued interest bought between coupons) | **L** GOV-21 | **L** GOV-16, GOV-17, GOV-24 | **L** GOV-02 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 2 with ! |
| Israel Bonds (sold through the Bonds organisation) | **L!** FXD-18 (the Accountant General's debt reports 2024 p.42, 2025 pp.20-21; outside the Securities Law, ss.1 and 35א; the State's 2025 prospectus and rate sheet on sec.gov, the State's own official statement)<br>Open: GOV OQ11, FXD OQ10 (whether a resident can buy, narrowed) | **L** TX2-22 (the 1991 order under s.15 and its 1998 amendment, in the gazette: exempt for a holder who lent while a foreign resident; bought as a resident, a linked bond, up to 25% of the real gain; withholding reg. 5)<br>Open: TX2 OQ19 (withholding when paid abroad, the year the Savings series is taxed: timing, not the final tax), FXD OQ10 | **L** FXD-19 (bought at 100% of face value; the State pays the selling costs, so the cost is in the rate) | **L** FXD-20 (held to maturity, no secondary market; a buyback only on four listed events; the State may redeem early) | **L** FXD-21 (direct, unconditional, unsecured obligations of the State; full repayment due after 90 days of default) | **L** FXD-20 (entries in the fiscal agent's register; transfer only to listed people) | L 6, C 0, O 0; 1 with ! |

### Securities account and what it holds

| Kind | What it is | Tax | Cost | Getting the money out | If the company fails | Moving it | Count |
|---|---|---|---|---|---|---|---|
| Securities account (Israeli bank or broker, or a broker abroad) | **L** BRK-01 to BRK-04, BRK-06, BRK-32 | **L!** TXS-05, BRK-27, BRK-45, TXF-22, TXF-29, TXG-20<br>Open: TXG OQ4 (an annual return with a broker abroad) | **L** BRK-15, BRK-16, BRK-24, BRK-33, BRK-53, BRK-61; tariffs BRK-30, BRK-38, BRK-40, BRK-42<br>Open: BRK OQ14 | **L** BRK-29, MF-67 | **L!** REG-16, REG-34, REG-35, BRK-07, BRK-08, BRK-10, BRK-58 (derived; no text says it in one place); foreign securities through a bank REG-37 (at a custodian abroad, apart from the bank's own, in an account marked for its clients); BRK-63 (four banks' terms); abroad BRK-14, BRK-35, REG-27<br>Open: REG OQ9, REG OQ10 (who moves a failed member's or bank's accounts), REG OQ21, REG OQ23 (what happens to foreign securities if the bank fails), BRK OQ5, BRK OQ22, BRK OQ23, REG OQ14 | **L!** SW-33, SW-35, SW-36, BRK-18, TXS-38, TXS-39 (the cost and purchase day are the holder's; the receiving institution withholds from the cost it holds); SW-34, SW-37, SW-55 (unsettled); TXS-40 (banks' and a broker's own statements; Leumi and Massad: no tax when the holder is the same)<br>Open: TXS OQ17 and SW OQ11 (no official text says whether the move is a sale), SW OQ12 (to or from a broker abroad) | L 6, C 0, O 0; 3 with ! |
| Money-market fund | **L** MF-07, MF-29 to MF-35<br>Open: MF OQ1 (the directive's final text) | **L** TXS-12, TXS-24; TXS-26 (named funds) | **L** MF-16, MF-17, MF-20, MF-24, BRK-17 | **L** MF-09 to MF-11, MF-14, MF-34, MF-67, MF-68 (Fridays: only a fund limited in foreign securities, executed on the Sunday); MF-69 (the hours seven of the nine collected managers print: 16:00, 13:00 on a Friday) | **L!** REG-10, MF-02, REG-34, MF-29 to MF-31<br>Open: REG OQ22 (redeeming while the manager or trustee fails) | **–** a switch is a sale (TXS-21); the units move with the securities account | L 5, C 0, O 0, – 1; 1 with ! |
| Israeli index fund or ETF | **L** ETF-01, ETF-04, ETF-11, ETF-51, ETF-52, ETF-83 | **L!** TXS-07 to TXS-10, TXS-13, TXS-14, TXS-24; TXS-15 (copy)<br>Open: ETF OQ23 and TXF OQ8 (U.S. withholding inside an Israeli fund that holds U.S. shares, against a swap fund or a foreign fund on the same index), TXS OQ8 | **L!** ETF-05, ETF-14, ETF-17, ETF-75, MF-16, ETF-13<br>Open: ETF OQ8 (variable fee), ETF OQ22 (swap cost as a number), ETF OQ30 | **L** ETF-04, ETF-21, ETF-67, ETF-82, MF-67 | **L!** MF-02, REG-10, REG-34, ETF-51, ETF-52<br>Open: ETF OQ21 (the credit-risk directive), REG OQ22 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 3 with ! |
| Foreign fund traded on TASE | **L** ETF-22 to ETF-24, ETF-26, ETF-32, ETF-43, ETF-71 | **C!** TXF-04, TXF-06, TXF-07 (only capitax.co.il's copy of the Tax Authority's 2019 letter), TXF-05<br>Open: TXF OQ10, TXF OQ9 | **C** ETF-27 (BlackRock)<br>Open: ETF OQ5 | **L** ETF-26, ETF-67 | **L** ETF-24, REG-35, REG-36 | **–** moves with the securities account | L 3, C 2, O 0, – 1; 1 with ! |
| Foreign-domiciled ETF (bought at a broker abroad) | **L** ETF-28, ETF-29 | **L!** TXF-01 to TXF-03, TXF-08, TXF-12, TXF-14, TXF-22, TXF-27, TXF-28, TXF-41 (a US fund organised as a trust: US withholding and the credit); TXF-11 (by implication)<br>Open: TXF OQ1 (accumulating funds), TXF OQ11, TXF OQ19 and TXF OQ27 (how Israel classes a US trust-form fund's distribution and its capital gain dividend), TXF OQ23, TXF OQ24 | **C** ETF-30, ETF-63 (each fund's own); brokers BRK-40, BRK-42 | **L** ETF-29 | **L!** REG-36, BRK-35, REG-27<br>Open: REG OQ24 (a US fund's custody), REG OQ14 | **–** moves with the securities account | L 4, C 1, O 0, – 1; 2 with ! |
| Active mutual fund | **L** MF-01, MF-05, MF-06 | **L** TXS-07 to TXS-11, TXS-22 | **L!** MF-16, MF-17, MF-20 to MF-22, MF-24, MF-26, MF-27; MF-28 (companies)<br>Open: MF OQ7 (loads) | **L** MF-09 to MF-14, MF-67, MF-68 | **L!** REG-10, MF-02, REG-34<br>Open: REG OQ22 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 2 with ! |
| Bond fund that ends on a set date | **L!** MF-59, MF-60; MF-62 to MF-66 (companies)<br>Open: MF OQ19, MF OQ20, MF OQ22 | **L!** TXS-33 to TXS-37 (derived)<br>Open: TXS OQ21, TXS OQ22, TXS OQ23 | **L** MF-16, MF-20, MF-24; MF-62 to MF-64 (companies) | **L!** MF-60<br>Open: MF OQ18 (no real wind-up seen), MF OQ20 | **L!** REG-10, MF-02<br>Open: REG OQ22 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 4 with ! |
| Corporate bond | **L** CORP-01, CORP-02, CORP-16 | **L!** TX2-06 to TX2-08 (TX2-07: National Insurance's copy), TXS-03<br>Open: TX2 OQ6 (a default's timing), TX2 OQ14 | **L** CORP-23, GOV-21 | **L** CORP-07, CORP-18, CORP-19 | **L!** CORP-04 to CORP-09, CORP-24, REG-33<br>Open: CORP OQ12, CORP OQ9, CORP OQ1, CORP OQ2 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 2 with ! |
| REIT (real-estate fund on the exchange) | **L** RG-01 to RG-08 (the Tax Authority's text of the Ordinance; Amendments 264 and 285 read in the gazette)<br>Open: RG OQ4 (no official list) | **L!** TX2-09 to TX2-12 (TX2-10 to TX2-12: National Insurance's copy), TX2-20<br>Open: TX2 OQ7, TX2 OQ8 (National Insurance on payouts) | **L** BRK-15, BRK-16, BRK-24, BRK-33 (trading costs, as for any listed share, RG-11); RG-10 (press), RG-11 (each REIT's own management fee)<br>Open: RG OQ5 | **L** RG-02 (listed within 24 or 48 months and traded on the exchange from listing, s.64A3(a)(2), (3א), read in the gazette) | **L** RG-04, RG-05 (the Tax Authority's text), REG-33 | **–** moves with the securities account | L 5, C 0, O 0, – 1; 1 with ! |
| Gold through a fund | **C!** RG-16, RG-17, RG-18, RG-20, RG-21; ETF-01 (a fund may track a commodity)<br>Open: RG OQ8 (how each fund holds gold), ETF OQ37 | **L!** TX2-13, TX2-14 (no gold-specific rule; the Tax Authority's text, re-cited 2026-11-07; the fund rules they point to are TXS-07 to TXS-14); TX2-24 (each fund's tax track, from the IBI, Kesem and Meitav prospectuses: two measured against the dollar, four against the CPI)<br>Open: TX2 OQ10 | **L!** ETF-05, ETF-14, MF-16 (the fee rules of every Israeli tracking fund); RG-14 (the Securities Authority's averages), RG-16 (each fund's fees, from the IBI, Kesem and Meitav prospectuses)<br>Open: RG OQ10 (hedging cost) | **L** ETF-04, MF-09 | **L!** MF-02, ETF-51; RG-20, RG-21 (issuers)<br>Open: RG OQ8, RG OQ11 | **–** moves with the securities account | L 4, C 1, O 0, – 1; 4 with ! |
| Single shares | **L** SHR-01 (Securities Law s.1; Companies Law ss.177, 188, 190, 307 as enacted)<br>Open: SHR OQ1 (later amendments of those sections) | **L** TXS-01, TXS-16 to TXS-21, TXF-01, TXF-08 | **L** BRK-15, BRK-16, BRK-24, BRK-33 | **L** BRK-29 | **L** REG-33 (shareholders are paid last); custody: the securities account row | **–** moves with the securities account | L 5, C 0, O 0, – 1 |
| Structured notes and bonds | **L** CORP-27 (bonds in law under Securities Law s.35א; s.35א1 makes index-tracking certificates funds; the tracking-funds regulations, KT 8038 reg. 2; TASE's periodic report 2025 pp.7, 36)<br>Open: CORP OQ17 (which series TASE classes as structured) | **L!** TX2-23 (securities under s.88; linked only when the whole face value follows the full CPI or a full currency rate, circular 22/2002; otherwise 15% of the nominal gain, s.91(b)(3)(c); derived for each product)<br>Open: TX2 OQ20 (no Tax Authority text names these products), CORP OQ17 | **L!** CORP-29 (they cost what any listed bond costs; the issuer pays the trustee, s.35ב)<br>Open: CORP OQ19 (the issuer's margin) | **L** CORP-28 (sale on TASE or on the series' dates; a deposit certificate only on its turnover dates, reg. 2(3))<br>Open: CORP OQ18 | **L!** CORP-30 (a claim on the issuer alone; the trustee monitors, does not pay; an ordinary creditor, REG-33)<br>Open: CORP OQ20 (whether the deposits behind a certificate are pledged to the holders) | **–** moves with the securities account | L 5, C 0, O 0, – 1; 3 with ! |
| Managed and robo portfolio | **L** MGD-01 to MGD-07, MGD-21, MGD-22 | **L!** TX2-15 to TX2-17 (TX2-15, TX2-16: National Insurance's copy)<br>Open: TX2 OQ11 (fees in a year with no gain), TX2 OQ13 | **L!** MGD-08, MGD-09, TX2-17; MGD-10, MGD-11 (the regulator's averages through a press host's copy; the official copy not found, 2026-11-07)<br>Open: MGD OQ13 (termination fees) | **L** MGD-05 | **L** MGD-14, MGD-15; REG-09 (copy)<br>Open: MGD OQ16 | **L!** MGD-05, BRK-18, SW-33<br>Open: MGD OQ13 | L 6, C 0, O 0; 3 with ! |

### Provident family (regulated by the Capital Market Authority)

| Kind | What it is | Tax | Cost | Getting the money out | If the company fails | Moving it | Count |
|---|---|---|---|---|---|---|---|
| Provident fund for investing | **L** KGL-01, KGL-02, KGL-06, KGL-24 | **L!** TXK-01 to TXK-07, TXK-13 (National Insurance's copy), TXK-26 (25% withheld), TXK-27; TXK-30 (a lump sum at or below the deposits: nothing taxed or withheld, derived)<br>Open: TXK OQ10 (whether that shortfall offsets anything); TXK OQ3 (only the legal basis of the 25%; the final tax does not depend on it) | **L** PF-02, PF-03, PF-10, KGL-14, KGL-16 | **L!** KGL-08, KGL-09, KGL-28<br>Open: TXK OQ4 (taking the annuity money as a lump sum) | **L** REG-18, REG-19, PF-29 | **L** KGL-10, SW-21, TXK-04<br>Open: SW OQ2, SW OQ17 | L 6, C 0, O 0; 2 with ! |
| Study fund | **L** KH-01, KH-02, KH-04, KH-05 (National Insurance's copy) | **L!** TXH-01 to TXH-19, TXH-25 (order of withdrawal; read in the Reshumot booklet, ק"ת 6984, on 2026-11-08), TXH-26 (National Insurance on the employer's deposits) (TXH-07, TXH-16: National Insurance's copy)<br>Open: TXH OQ4 (National Insurance on money taken out before the period and on a self-employed person's deduction), TXH OQ15 (how a withdrawal divides inside a part), TXH OQ9 | **L** KH-22, KH-23, PF-06 | **L** KH-10 to KH-12, KH-14 to KH-16 (KH-16: National Insurance's copy)<br>Open: KH OQ4 (loans) | **L** REG-18, REG-19 | **L** KH-17, SW-20, TXH-19<br>Open: TXH OQ11 | L 6, C 0, O 0; 1 with ! |
| Self-managed fund (IRA, study or provident) | **L** IRA-01 to IRA-05, IRA-07, IRA-11 (the regulations cited in Reshumot as made and amended; Wikisource is a lead only; regs 3, 4, 6, 7(ב), 8, 11(א) and 13 not yet re-read against every amendment, IRA OQ1)<br>Open: IRA OQ1, IRA OQ2 | **L!** TXK-16 to TXK-18<br>Open: TXK OQ8 (active trading as business income) | **L** IRA-16 to IRA-18; IRA-21, IRA-22 (one manager)<br>Open: IRA OQ6, IRA OQ7 | **L** IRA-25 | **L!** REG-18, REG-19, REG-34, REG-35<br>Open: IRA OQ11 (in whose name the securities sit at the broker) | **L** IRA-23, SW-24 | L 6, C 0, O 0; 2 with ! |
| Child savings (bank or provident route) | **L** CS-01 to CS-08, CS-10, CS-13<br>Open: CS OQ4 | **L!** TXK-19 (deposits are not income), TXK-20; TXK-22, TXK-23 (provident route: a kupat gemel lehashkaa by law, the regulator's circular and the Ministry of Finance, so the Ordinance's 25% of the real gain); TXK-29 (bank route: the Ministry of Finance says the general rules apply; the rates are the Ordinance's, s.125ג(ב) and (ג)(1), and applying them to child savings is the site's reading, labelled)<br>Open: TXK OQ1 (no Tax Authority text names child savings; whether the Ordinance's trust chapter, s.75ג, reaches the child's statutory trust account, on both routes) | **L** CS-18 (after 21 the managers of the 2016 tender keep their tender rate); CS-30 (companies) | **L** CS-14 to CS-17 | **L** CS-05, REG-23 | **L** CS-11, CS-12, SW-25 | L 6, C 0, O 0; 1 with ! |
| Pension fund (comprehensive and general) | **L** PEN-01, PEN-05, PEN-08, PEN-10, PEN-34; PEN-11 to PEN-15 (the standard bylaw, on gov.il since 2026-11-06; PEN-11's 2017 amending circular still from a copy) | **L!** TXP-01 to TXP-23 (TXP-07, TXP-20: National Insurance's copy); TXP-32 (moving is not taxed, except severance money moved to a new account), TXP-33 (when an annuity is personal-effort income)<br>Open: TXP OQ17 (how the annuity paragraph of personal-effort income reads) | **L** PF-04, PF-05, PEN-15, PEN-21, PEN-23 | **L!** PEN-26 to PEN-31, PEN-48 to PEN-51 (PEN-48: the factor is computed at the fund's maximum pensioner fee, not the fee a pensioner is charged), PEN-63 (money moved in joins the balance)<br>Open: PEN OQ29 (the rate behind the statement's expected pension), PEN OQ22 | **L** REG-18, REG-19, REG-21, PEN-18, PEN-19 | **L** SW-12, SW-22, PF-28, TXP-32 (the receiving fund counts the earlier insurance months, PEN-14, PEN-30) | L 6, C 0, O 0; 2 with ! |
| Provident fund for annuity | **L** PEN-34, PEN-35 | **L!** TXP-14, TXP-24<br>Open: TXP OQ9 | **L** PEN-22 | **L!** PEN-34 (as an annuity only by moving the money to a pension fund or an insurer; as a lump sum only on the listed conditions), PEN-61, PEN-63 (in a pension fund the money joins the balance and is converted at that fund's factors, PEN-51; no text obliges a fund to accept it)<br>Open: PEN OQ19 (an insurer's factors for the money; whether commuting a pension bought with kupat gemel lehashkaa money is allowed) | **L** REG-18, REG-19 | **L** SW-23, TXP-32 | L 6, C 0, O 0; 2 with ! |

### Insurance

| Kind | What it is | Tax | Cost | Getting the money out | If the company fails | Moving it | Count |
|---|---|---|---|---|---|---|---|
| Savings policy | **L** INS-01 (the regulator's investment-tracks circular, the Ministry of Finance team and the Insurance Supervision Law; derived: that the product sold as a savings policy is the circular's "פוליסה שאינה קופת ביטוח" and return-dependent insurance is a reading); INS-27 (insurers' marks)<br>Open: INS OQ1 (the regulations' own term, "ביטוח חיים משתתף ברווחים", whose definition ends in regulations repealed in 2023) | **L!** TXA-03 to TXA-05 (TXA-04: National Insurance's copy), TXA-28<br>Open: TXA OQ1 (15% for a policy that is not profit-sharing), TXA OQ2, TXA OQ4 | **L!** INS-25, INS-26; INS-03 (insurers)<br>Open: INS OQ16 (deposit fees) | **L!** INS-07 (Insurance Contract Law s.46, gazette: redemption, whole or part, after two years of premiums, paid within 30 days; derived: that s.46 reaches a savings policy); INS-28 (five of the eight insurers in Bituach-Net: any time, 30 days from the request and all documents; a floor on a partial withdrawal at Clal and Harel, none at Migdal and Hachshara; no surrender fee named at any)<br>Open: INS OQ17 (the two-year condition on a policy funded by one deposit; the insurers' floors and document clock against s.46), INS OQ14 (Menora's, Ayalon's and IDI's terms, not found on their sites) | **L** INS-21, REG-22<br>Open: REG OQ27 | **L** TXA-08, INS-12 (no transfer route: withdraw and buy anew, a tax event) | L 6, C 0, O 0; 3 with ! |
| Executive insurance | **L** INS-13, INS-14, TXA-12<br>Open: INS OQ9 | **L!** TXA-12 to TXA-16 (TXA-14: National Insurance's copy)<br>Open: TXA OQ6 (growth inside the policy), TXA OQ7, TXA OQ8 | **L!** INS-15<br>Open: INS OQ8, INS OQ9 | **L!** INS-20, PEN-28 to PEN-30; INS-17 (an insurer's example)<br>Open: INS OQ10 (guaranteed annuity factors) | **L** INS-21, REG-22 | **L** INS-20, PF-17, PF-19 | L 6, C 0, O 0; 3 with ! |
| Amendment 190 deposits | **L** TXA-17 (National Insurance's copy), TXA-23, TXA-24; TXA-25 | **L!** TXA-18, TXA-19, TXA-30<br>Open: TXA OQ14 (National Insurance on the annuity), TXA OQ13, TXA OQ5 | **–** follows the product that holds it | **L** TXA-20 to TXA-22, TXA-27, TXA-30 | **–** follows the product that holds it | **–** follows the product that holds it | L 3, C 0, O 0, – 3; 1 with ! |

### Counts

| Grade | Cells | Of which with ! |
|---|---|---|
| L, answered from the law, a regulator or the exchange | 160 | 59 |
| C, only a copy or companies' documents | 4 | 2 |
| O, open | 0 | 0 |
| –, does not apply | 16 | |
| **All** | **180** | **61** |

By question (L / C / O / –, then cells with !): what it is 29 / 1 / 0 / 0, 6 with !; tax 29 / 1 / 0 / 0, 26 with !; cost 27 / 2 / 0 / 1, 9 with !; getting the money out 30 / 0 / 0 / 0, 7 with !; if the company fails 29 / 0 / 0 / 1, 10 with !; moving it 16 / 0 / 0 / 14, 3 with !. Tax is the question most often answered with an open part that changes a result; nearly all of those questions sit in the tax-specialist's files.

Every applicable cell is L in 27 of the 30 kinds, but only single shares is free of a !; the closest after it, with one each, are the current account, makam, money-market fund, study fund, child savings and Amendment 190 deposits. Kinds with cells not L: foreign fund traded on TASE (2 C), gold through a fund (1 C), foreign-domiciled ETF (1 C).

### The cells most worth answering next

Ranked by how many readers hold the kind, how much the answer moves their result, and whether the open question says where the answer probably is. Owner: tax = the tax-specialist's file; domain = the domain-specialist's.

| # | Cell | Grade | Why it changes a result | Open questions | Owner |
|---|---|---|---|---|---|
| 1 | Foreign fund traded on TASE · tax, and foreign-domiciled ETF · tax | C!, L! | The usual way to hold a world or S&P 500 index: whether tax waits until the sale on an accumulating fund, which index measures the gain, and whether a loss offsets distributions all rest on the Tax Authority's 2019 letter read only in a copy, or on an implication | TXF OQ10, TXF OQ1, TXF OQ9 | tax |
| 2 | Israeli index fund or ETF · tax | L! | The Israeli way to hold the same index: how much U.S. tax is withheld on dividends inside an Israeli fund that holds U.S. shares is needed to compare it with a swap fund or a foreign fund on the same index, and no official text compares Israeli funds holding foreign assets with foreign funds | ETF OQ23, TXF OQ8 | domain, tax |
| 3 | Child savings · tax | L! | Every child has one. The provident route's up to 25% of the real gain rests on the law (TXK-23), and the bank route's rates are the Ordinance's (15% on an unlinked track, up to 25% of the real interest on a linked one), but applying them to child savings is the site's reading, since no Tax Authority text names child savings, and National Insurance's own circular says 25% on both; on both routes, whether the Ordinance's trust chapter (s.75ג) reaches the child's statutory trust account, which would change whose income the gains are | TXK OQ1 | tax |
| 4 | Study fund · tax | L! | How a withdrawal from the taxable part divides between deposits, linkage and gains (which part comes out first is settled, TXH-25), and National Insurance on money taken out before the period and on a self-employed person's deduction (on the employer's deposits above the ceiling it is settled, TXH-26) | TXH OQ15, TXH OQ4 | tax |
| 5 | Securities account · moving it | L! | Whether moving your own securities to another account is a sale for tax: by law the cost and purchase day stay the holder's and the receiving institution withholds from the cost it holds (TXS-38, TXS-39), and Leumi and Massad say such a move is no tax event (TXS-40), but no official text says whether it is a sale; moving to or from a broker abroad; for a non-bank broker's fee for the move no cap was found and only companies state one | TXS OQ17, SW OQ11, SW OQ12 | tax, domain |
| 6 | Provident fund for investing · tax | L! | Whether the shortfall of a lump sum taken out below what was deposited offsets other interest or capital gains. That nothing is taxed or withheld on such a lump sum is now recorded, derived from the law, the withholder file and the 2016 bill's notes (TXK-30); no text names the shortfall a loss, and the nearest case left such a loss unoffset (TXI-25). The 25% withheld is settled (TXK-26); only its legal basis is open (TXK OQ3), and the final tax does not depend on it | TXK OQ10 | tax |
| 7 | Provident fund for annuity · getting the money out (with the provident fund for investing's annuity route) | L!, L! | The money comes out as an annuity only by moving it to a pension fund or an insurer (PEN-34). In a pension fund it joins the balance and is converted at that fund's factors, no text obliges a fund to accept it, and money moved from a provident fund for investing cannot come back out as a lump sum by the Commissioner's 2020 draft (PEN-63); open are an insurer's factors for the money, whether commuting part of such a pension counts as going back, and the tax on it | PEN OQ19, TXK OQ4 | domain, tax |
| 8 | Pension fund · getting the money out | L! | The rate behind the statement's expected pension: the circular names 4.26% gross, the factors' discount rate is 4.38%, and which one funds print was not found (a lower pensioner fee does not change the factor, PEN-48) | PEN OQ29 | domain |
| 9 | Bank deposit and savings plan · tax | L!, L! | Whether principal lost to a break penalty is a capital loss, and whether interest credited inside a multi-year plan is withheld when credited or when withdrawn: it changes the result for a break that eats into the principal, and the timing of tax inside a plan | TXI OQ14 | tax |
| 10 | Savings policy · getting the money out | L! | The law gives redemption, whole or part, within 30 days after two years of premiums (INS-07); five of the eight insurers' terms allow it any time and pay within 30 days of the request and all documents, two with a floor on a partial withdrawal, none with a surrender fee (INS-28). Open: how the two-year condition reads on a policy funded by one deposit, whether the floors and the later clock fit s.46, and Menora's, Ayalon's and IDI's terms | INS OQ17, INS OQ14 | domain |

The re-ranking of 2026-11-06 (after the check and the tax rules on moving securities and breaking a deposit): the Israeli index fund's tax enters at 2; the provident fund for investing falls from 2 to 7, because what is withheld is settled and only a loss at exit is left; moving a securities account falls from 4 to 6, because the cost and the withholding after a move are now in rules; bank deposit and savings plan · tax leaves the ten, because what a break taxes is now recorded as far as the texts go (only the interest paid, TXI-07; nothing withheld when a penalty takes principal, TXI-26), and what is left (whether that principal is a capital loss, when interest credited inside a plan is withheld) changes the result only for a break that eats into the principal or for the timing of tax inside a plan.

The re-ranking of 2026-11-07: securities account · if the company fails leaves the ten. The second protection pass placed foreign securities held through a bank (REG-37), and the trust step is now in rules (REG-34, REG-35, BRK-58); what is left, who moves a failed member's or bank's accounts, what happens to foreign securities if the bank fails, whether the clearing house's lien reaches client holdings and whether a broker's client cash is exposed to the bank holding it, was searched in every published text and needs a text that does not exist yet (a law, a court decision, the broker-dealer bill once enacted). Savings policy · what it is and getting the money out leaves too: both now rest on the law and the regulator (INS-01, INS-07), and what is left is the two-year condition on a policy funded by one deposit and the other insurers' terms. Bank deposit and savings plan · tax and the money-market fund's payout day enter at 9 and 10.

The re-ranking of 2026-11-07 (after the domain pass of the night): the money-market fund's payout day leaves the ten: Fridays are the Securities Authority's (MF-68: a fund limited in foreign securities takes Friday orders, executed on the Sunday; a fund not limited, Monday to Thursday) and the hours a count over the collected managers' prospectuses (MF-69), so both fund exit cells are L. Item 7 stays, narrowed (PEN-63); item 8 keeps only the statement's rate. Savings policy · getting the money out enters at 10, narrowed for Migdal (INS-28); its tax stays in the line below.

The domain pass of 2026-11-07 on item 10 narrowed it and the ranking stands. Hachshara's BEST INVEST terms were read (INS-28), so five of the eight insurers in Bituach-Net are now counted: all allow withdrawal at any time and pay within 30 days of the request and all documents, two set a floor on a partial withdrawal, none names a surrender fee. Menora's, Ayalon's and IDI's terms were not found on their own sites (two behind bot checks, one linking no terms), and the questions in law (the two-year condition on one deposit, the floors and the document clock against s.46) still need a regulator's text that was not found (INS OQ14, INS OQ17).

The tax pass of 2026-11-07 on items 1, 2, 6 and 9 settled none of them, and the ranking stands. Item 1: no official copy of the Tax Authority's 2019 letter exists anywhere reachable; a lead shows it was once published by the Tax Authority (capitax's bulletin of 12.8.2019), but the archived Tax Authority site holds no copy (TXF OQ10). Item 2: no official text gives the US rate an Israeli fund holding US shares bears; the leads that say 25% cite nothing (TXF OQ8, TXS OQ24). Item 6: narrowed: nothing is taxed or withheld on a lump sum at or below the deposits (TXK-30); only the offset is open. Item 9: nothing official on when interest credited inside a plan is withheld, or on lost principal beyond TXI-26 (TXI OQ14). A later tax pass of 2026-11-07 for the indices page settled the US side of a US fund organised as a trust (VOO, IVV and ACWI are all Delaware statutory trusts): for the treaty such a fund is a US corporation, its dividends bear at most 25%, and Israel credits that tax (TXF-41); how Israel classes its distribution is still open (TXF OQ19, OQ27). Item 1 is unchanged: the archived Tax Authority site and the archive's timemaps hold no copy of the 2019 letter (TXF OQ10). Item 2 is narrowed only by the treaty's technical explanation of when a trust is a resident (TXF OQ8, TXS OQ24).

Next after these: securities account · if the company fails (REG OQ23, REG OQ9, REG OQ10, BRK OQ23, REG OQ21; above); savings policy · tax (TXA OQ1, 15% for a policy that is not profit-sharing); bank deposit · what it is (BANK OQ17, whether published CPI-linked rates are real or nominal); gold through a fund · cost (RG OQ10, the cost of currency hedging); government bond · tax (TXI OQ5, accrued interest); self-managed fund · tax (TXK OQ8, active trading as business income); Israel Bonds · what it is (GOV OQ11, FXD OQ10, whether a resident can buy at all); foreign-currency deposit · out and tax (FXD OQ4, TX2 OQ2); executive insurance · tax (TXA OQ6).

Not a reader's result but a source check, cheap to fix: rules that rest only on a copy, among them TXS-15 (foreign tax inside an exempt fund, olaw.org.il), MGD-10 and MGD-11 (the Securities Authority's 2025 licensees report through a press host; since 2026-11-08 cited on the Authority's own site), and the cell that rests only on National Insurance's consolidated copy of the Ordinance, gold through a fund · tax (TX2-13, TX2-14), which a reading of the same sections in an official text would lift to L. The domain pass of 2026-11-07 settled the rest: BANK-35 already cited the gazette (booklet 12431) and was re-read there, adding what counts as an action (annex ו, pp.2250 to 2252); ETF-13 was re-read in the official booklet 7646 (the olaw.org.il file is byte-identical to it); RG-14 was re-read on the Securities Authority's own site; RG-02 (and RG-01's definition) were read in the gazette, amendments 147, 222, 264 and 285, which lifted REIT · getting the money out from C to L and corrected one word of RG-02 (the 30% test is met at the end of 24 months and at the end of 36, not only at 36). The licensees report's official copy was searched for and not found (MGD-11 says how), and was then found on the Authority's own site on 2026-11-08 (MGD-11); the data record `data/rules/etf-13.json` still cites the olaw.org.il copy and is listed in `unofficial-leftovers.json`, to be re-cited to the Reshumot booklet by the data owner.

How the copies were counted (2026-11-06, after the merge at bfc59f93): every `### ID` block of the rule files, by the validator's pattern (1,055 blocks: the 1,051 rules and the four SW-X records), every link in the block with reference-style links resolved. Copy hosts: nevo.co.il, wikisource.org, olaw.org.il, prisha.co.il, capitax.co.il, funder.co.il. Official hosts: the Knesset, the gov.il hosts, boi.org.il, isa.gov.il, tase.co.il and foreign regulators' own sites. Every other host is a company or the press. With National Insurance's law files counted as official, as they were at first: 32 rules rest only on a copy or on a copy and companies' documents, and 121 more cite a copy beside an official text. National Insurance's law files are the only official-host source of 42 more rules, so counting them as copies, 74 rules cite no official text other than a copy. Counting only the `- Source:` lines gives fewer (30 and 113 before the merge, by the independent check); adding press hosts as copies gives more (38 and 127).

---

## 0. Before anything is encoded

These apply to the whole knowledge base, not to one topic.

1. **Rules read from a copy.** How many rules rest only on a copy of the law (Nevo, Wikisource,
   olaw.org.il and the like, or National Insurance's consolidated files) is counted under the six-things
   table above, with the method. A copy only helps find the official text (founder, 2026-11-06): each
   such rule is re-read in its official publication (Reshumot on fs.knesset.gov.il, gov.il, the
   regulator's own site), never in Nevo.
2. **Some sources can't be opened by a script.** A browser pass through your Chrome on 2026-10-22 got past most of these (§12): TASE, the ISA register, hly.gov.il, gov.il service pages, Bank of Israel pages, Bank of Jerusalem and One Zero all opened. Still not done from this list: Kol Zchut (opens, not yet used), S&P Maalot, the CMA fslproviders register, circular 7/2003, Accountant General bond terms, and Mercantile's rate table. Discount's rate table opened but was machine-translated. *Status 2026-10-23:* the Gemel-Net and Pensia-Net portals were read in browser pass 4 (CAT-35 to CAT-41, the fee fields confirmed for display); the Bank of Israel's terms of use were read in archived copies (republication not permitted, discovery O14); S&P Dow Jones Indices' pages and TASE's TA-125 page were read in Chrome (ETF-33 to ETF-42). Still not done: Kol Zchut, S&P Maalot, the CMA fslproviders register, circular 7/2003, Accountant General bond terms, Mercantile's rate table. *Status 2026-10-24 (browser pass 5, release 4):* Bank Yahav's, Bank of Jerusalem's and One Zero's tariffs were read in Chrome (snapshots in `data/fees/*@2026-10-24.json`, BRK-30, BRK-38); Meitav Trade still published none (its tariff was found on 2026-10-31, BRK-30); Maya's fund list and TASE's foreign-funds list were read and counted but not republished because TASE's August 2026 terms forbid it (CAT-42, CAT-43, ETF-43); TASE's Data Hub and Data Store terms and prices were read (BRK-39, discovery O13); the CMA transfer circular, the clearing-house letters and circulars and directive 448 version 4 were read on gov.il and boi.org.il (SW-41 to SW-44). The original list:
   - **gov.il landing pages (403):** Har HaKesef, CMA public enquiries, Tax Authority forms 161/161d,
     Accountant General bond terms, Tax Authority circular 7/2003. Note that gov.il *BlobFolder* PDFs
     do open. *Finding a gov.il PDF without Chrome (2026-10-25):* the address is
     `https://www.gov.il/BlobFolder/{kind}/{page-slug}/{he|en}/{file}.pdf`. The kind follows the page:
     `generalpage` for `/he/pages/…`, `policy` for circulars, `dynamiccollectorresultitem` for CMA and
     Tax Authority collector items, and also `legalinfo`, `service`, `guide` and `reports`. The slug is
     the page's own, and the file name cannot be worked out. A HEAD request answers 404 for files that
     exist, so check with GET. Three ways to the file without opening the page:
     (1) The Wayback Machine's index lists every archived file under a folder. For example,
     `https://web.archive.org/cdx/search/cdx?url=gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/*&fl=timestamp,original&collapse=urlkey`
     gave every yearly edition from 2014 to 2025. The live file is then fetched from gov.il itself.
     (2) A web search limited to gov.il returns BlobFolder PDF links directly.
     (3) Yearly series keep one name pattern (`Guides_IncomeTax_da-YYYY.pdf`,
     `…monthly-deductions-booklet-YYYY.pdf`, `Policy_IncomeTaxProfessionalInst_hoz_NN_YYYY_acc.pdf`), so
     the next edition can be tried by name.
     gov.il's HTML pages and their data APIs sit behind Cloudflare's human check. The page is where to see which
     edition is current: an old PDF stays online after a new one replaces it, so a link check never shows
     it is out of date. Read on 2026-10-25 with FlareSolverr:
     - "דע זכויותיך" lists the 2025 and 2024 editions, so 2025 is the newest.
     - The clearing-house page lists its six attachments.
     - Circular 7/2003, on this list's not-done items, has its PDF at
       `/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf`.
     - Tax treaties: the collector address in `tax-securities-foreign.md` leads to gov.il's error page. The Tax Authority's real page is https://www.gov.il/he/pages/double-tax-prevention-agreements (read in Chrome 2026-10-31, updated 17.07.2024): a treaty takes priority over domestic law where it is kinder on the rate, domestic law applies where the treaty is harsher. It does not link each treaty's text in what was read; the Hebrew texts sit under `BlobFolder/dynamiccollectorresultitem/<country>_dtpa/` for some countries (Luxembourg opens, the United States, Ireland and the United Kingdom under that pattern answer 404), so the US treaty is still cited from the IRS's copy.
     These are not behind such a check: fs.knesset.gov.il (Reshumot PDFs), the Knesset OData API, data.gov.il,
     btl.gov.il, new.isa.gov.il, boi.org.il and gemelnet.cma.gov.il.
   - **Bank of Israel:** consumer pages and the makam auction pages (bot check).
   - **TASE:** the member list, trading pages, and the s.45טז fee-comparison page.
   - **Securities Authority (ISA):** the licensee registers (portfolio managers, rating agencies, bond
     trustees) and the mutual-fund list.
   - **CMA:** the fslproviders register, and the "sources and assumptions" pages of
     Gemel-Net, Pensia-Net and Bituach-Net.
   - **Other sites:** hly.gov.il (child savings), Kol Zchut, S&P Maalot, One Zero, Bank of Jerusalem,
     and Discount's and Mercantile's directive-447 rate tables.
3. **Web searches ran out in release 1.** All agents shared one search limit. Many open questions say
   "not searched, budget ran out" and may close with a targeted search pass. Google search inside the
   Chrome browser has no such limit and was used in the browser pass.
4. **Some gaps need your own material.** Only you can supply:
   - ~~the Meitav app's "open a new saving" menu and its eight tracks~~: not needed (product.md D17; CAT-26, CAT-28)
     since 2026-10-23, because the site lists every track from the data (product.md D17);
   - a payslip from you and from a friend (no official source gives the line labels; KH OQ5, PEN OQ11,
     TXP OQ16);
   - ~~the annual statements of your own funds~~: the uniform formats were read on 2026-10-23 (PF-33 to PF-38, CS-27), so your own statement is now only a check of what a fund prints, not the source of the field names;
   - product names that banking apps show only after login (BPN OQ20).

---

## 1. Decisions that need the founder (product.md section 1)

The research raised these. None was decided here; product.md was not edited.

| # | Issue | Where it came from | What it changes |
|---|---|---|---|
| F1 | **Answered 2026-10-24 by D23: institution-strength rules compute, labelled "institution source", and never close a tax question for graduation.** (Original finding:) D10 has no policy for institution-strength rules (a fund's bylaw, prospectus or form). D10 covers primary, secondary and open sources only. | TXA (Amendment 190 conditions TXA-22 to TXA-24); also TXS-12/13 (a money-market fund's tax track comes from its prospectus), KGL lump-sum withholding at 25%, many KH and PEN rules | Whether these rules compute, compute with a label, or block. Narrowed in browser pass 2: TASE's Maya publishes each fund's tax status (TXS-24), so the money-market case no longer rests on prospectuses alone. The rest of F1 stands. |
| F2 | **D4 is wrong for non-bank brokers** (confirmed in the browser pass, §12). TASE's s.45טז calculator shows average fees actually charged by every member, banks and non-bank brokers alike, by portfolio-size band and security type. | BRK-33 | D4's "no average exists for non-bank brokers" should be corrected, and 3.4's provider table can show this reference for them. |
| F3 | **Applied 2026-10-28: the roadmap's R2 risk now carries the correction.** (Original finding:) **The roadmap R2 risk is partly wrong.** The employee's s.45A/47 ceilings are CPI-linked and frozen for 2025–2027; they are not tied to the average wage. The employer, severance, 16% beneficiary-member and self-employed ceilings *are* tied to the average wage. | TXP (see its summary) | The wording of the roadmap R2 risk and of tax-landscape §3.1 and §10 item 4. |
| F4 | **Accumulating foreign funds (tax Q1).** No rule taxes a minority holder on a foreign fund's undistributed income: none in the Ordinance (checked section by section), not CFC s.75B, and nothing like the US PFIC rule (Q19). But no Tax Authority statement confirms tax is due only on sale either. *2026-10-26 (open-question hunt):* the Tax Authority's 4.7.2019 letter supports the sale-and-distribution reading by implication, while circular 7/2003 s.4.4 points the other way (TXF-11; TXF OQ1 narrowed, not closed). | TXF OQ1, OQ2 | Under D10 this variant stays blocked in 3.4 unless you accept the reading or a source appears. |
| F5 | **61 new dimensions were proposed** across files, some overlapping (for example `default-allocation`, `default-assignment`, `default-track`). Examples: `fund-tax-track`, `estate-situs`, `market-price-exit`, `rate-reset`, `surtax`, `social-contributions`, `threshold-drift`, `dispute-channel`, `investment-restrictions`, `self-directed-risk`, `default-assignment`, `employer-dependence`, `actuarial-adjustment`, `death-and-beneficiaries`, `annuity-vs-lump-sum`, `order-timing`, `product-marking`, `fee-performance`, `fund-closure-merger`, `fx-spread`, `conditional-return`, `issuer-conflict`, `value-date`, `conflict-of-interest`, `fee-fund-underlying`, `rate-type-anchor`, `auto-renewal`, `benefit-expiry`. | "Proposed dimensions" in each file | product.md 3.3 sets the minimum list. Adding to `data/dimensions/` is your call. **Answered 2026-10-23: none adopted for release 1** (chosen by Claude at the founder's request); the 26 rows stand. |
| F6 | **Structured bonds and bank-issued structured notes** (איגרות חוב מובנות; NIS 27 bn raised on TASE in 2025) are in no tier and no file. D2 lists only structured *deposits*. | CORP findings; TX2-23 (their tax, 2026-11-07) | Whether to add them to the tier-2 list. |
| F7 | **Payment-wallet balances** (for example LAYA, which holds an ISA payment-services licence) are a way to hold money that D2 does not mention. | FXD findings | Whether they are in scope at all. |
| F8 | **Your age-60 example now has an answer**, at primary strength for the law (TXK-12). A lump sum is taxed the same before and after 60. At 60 or later the balance can move to an annuity fund, and the resulting annuity is fully exempt. Whether that money can later be commuted to a lump sum is open (TXK OQ4). | TXK | Nothing to decide; this confirms or corrects your interview claim. |

---

## 2. Section 3.1, instrument guide: gaps per tier-1 page

The guide page has a fixed structure. These are the parts not yet sourced for each wrapper or exposure.

| Page | Not covered yet | Where |
|---|---|---|
| **Current account, deposits, savings plans** | <ul><li>~~What protects deposits if a bank fails~~ answered in the six-things table: no deposit insurance, and a state guarantee that is discretionary (REG-04, REG-06, BANK-23); any basis beyond s.8יא is still open (BANK OQ8, REG OQ13)</li><li>How breaking a savings plan is priced, and whether each monthly deposit has its own exit points (BANK OQ12, partly answered for Hapoalim in BPN; narrowed 2026-10-26: no general rule, each bank's plan terms (BANK-28))</li><li>Whether 447 rates for CPI-linked deposits are real or nominal (BANK OQ17)</li><li>Whether anything obliges a bank to keep prime at the Bank of Israel rate plus 1.5 (BANK OQ19; the definition itself is BANK-46)</li><li>Tax: prime-linked deposits are in the 15% bucket (TXI-04); breaking a deposit early (TXI OQ14, open: only the interest paid is taxed, a reading, TXI-07; whether principal lost to a break penalty is a capital loss, TXI-26); ~~deflation on CPI-linked deposits~~ closed 2026-10-31 (TXI-25)</li><li>Which banks count as "small" and are exempt from the account-free deposit rule (BANK OQ5)</li></ul> | BANK, TXI |
| **Money-market funds** | <ul><li>The final ISA money-market directive was read only as a draft (MF OQ1)</li><li>The A447 bank-display rules in MF still cite the draft; the final text is in BANK-15 and the rules are marked for re-check</li><li>~~Order cut-off hours for daily funds, and whether Friday is a pricing day for funds limited in foreign securities~~ closed 2026-11-07: Fridays are the Securities Authority's (MF-68); the hours are a count over the managers' prospectuses (MF-69)</li><li>~~How many days until redemption cash is usable~~ closed 2026-10-26: reg. 15 of the prices regulations (MF-11)</li><li>Tax: Q15 is closed. ~~Whether any taxable money-market fund exists~~ closed 2026-10-22: two do, and each fund's tax status is published on Maya (TXS-24, TXS-26)</li></ul> | MF, TXS |
| **Makam and government bonds** | <ul><li>Whether and how an individual can bid in a makam or bond auction, with what minimum and fee (GOV OQ2, OQ8)</li><li>The Shahar series regulations (GOV OQ4; narrowed 2026-10-26: today's fixed-rate series are "אג"ח ממשלתית", GOV-14; the old שחר series remain)</li><li>~~Which regulation governs Gilon~~ closed 2026-10-26: today's floating series are "אג"ח ממשלתית בריבית משתנה" under the 2006 regulations as amended in 2007 (GOV-14)</li><li>Per-series deflation floors (GOV OQ6)</li><li>The official risk wording (GOV OQ9)</li><li>Tax: ~~makam at 20% or 15%~~ 15% by law (TXI-11); still open: the split on a sale before redemption (TXI OQ3) and accrued interest when buying between coupon dates (TXI OQ5)</li></ul> | GOV, TXI |
| **ETFs and index funds** (Israeli, foreign on TASE, foreign-domiciled) | <ul><li>Accumulating foreign funds (F4)</li><li>~~Whether Ireland withholds on an Irish fund's distributions~~ closed 2026-10-26: no Irish tax on units held in a recognised clearing system or paid to a declared non-resident (TXF-28)</li><li>EU PRIIPs/KID limits for Israelis at EU brokers (ETF OQ11)</li><li>The full lists of Israeli ETF issuers and of foreign funds registered in Israel (ETF OQ3, OQ4)</li><li>~~The scale of the exposure codes in fund names~~ closed 2026-10-25: the classification regulations set it (ETF-12, MF-54)</li><li>~~Spread obligations of market makers~~ closed 2026-10-31: TASE's trading guide (ETF-82)</li><li>Foreign-currency cash at a foreign broker (TXF OQ4)</li><li>Whether Israeli banks deduct foreign tax already withheld (TXF OQ3)</li><li>~~What the S&P 500 and the TA-125 are, from their providers, for the exposure pages (product D18)~~ closed 2026-10-23 (ETF-33 to ETF-42)</li></ul> | ETF, TXF, BRK |
| **Active mutual funds** | <ul><li>The current ISA list of classification headings and naming rules (MF OQ8, OQ9)</li><li>How many funds charge loads (MF OQ7)</li></ul> | MF |
| **Brokerage account** (the wrapper) | <ul><li>Protection if a TASE member fails is derived from the Trust Law, the clearing-house rules and the bank directives, with no text that says it in one place (REG-34, REG-35, BRK-07, BRK-10, BRK-58; the six-things table grades it L!); still open: foreign securities held through an Israeli bank, who moves a failed member's accounts and bears a shortfall, and the clearing house's lien (REG OQ9, REG OQ10, REG OQ21, REG OQ23, BRK OQ23)</li><li>~~Whether non-bank members and foreign brokers withhold Israeli tax~~ closed 2026-10-25: every TASE member withholds; a foreign broker does not (BRK-27, TXS-05, TXF-22)</li><li>Direct IBKR and eToro accounts for Israeli residents (BRK OQ9; narrowed 2026-10-26: the ISA's s.49A list names Interactive Brokers LLC and IB UK, `research/2026-10-26-ibkr-permit.md`)</li><li>~~The 3 non-bank TASE members not yet named~~ closed in the browser pass (BRK-32)</li></ul> | BRK, REG |
| **Kupat gemel lehashkaa** | <ul><li>~~The official 2026 ceiling~~ confirmed by CBS calculation (KGL-24)</li><li>~~Tax: the legal rate on a lump sum, 25% of real gain or 15% nominal, and which provision exempts the inflation part~~ closed 2026-10-25: up to 25% of the real gain, s.9(13) exempting the linkage part since Amendment 190 (TXK-07, TXK-06); the 60+ brackets apply (TXK-06); no NII or health on the lump-sum gains (TXK-27, new); the rate withheld is 25% (TXK-26), and only its legal basis is open (TXK OQ3), which the final tax does not depend on</li><li>Whether an employer may deposit (KGL OQ5)</li><li>~~Eligibility for 5 of the 6 sector funds~~ closed 2026-11-03: out of the data and not researched, by the founder's decision</li></ul> | KGL, TXK |
| **Keren hishtalmut** | <ul><li>~~The legal source of the "employee pays at least one third" rule~~ closed 2026-10-25: a condition of the fund's tax approval, Income Tax Rules rule 19(ב2)(1) (KH-05)</li><li>Loan terms (KH OQ4)</li><li>Extension orders that require a study fund (KH OQ3)</li><li>~~Tax on gains from deposits above the ceiling, real or nominal~~ closed 2026-10-26: up to 25% of the real gain (TXH-11)</li><li>The 2027 budget proposal to narrow the exemption (TXH OQ2, tax Q18), to re-check after the elections</li></ul> | KH, TXH |
| **Pension fund** | <ul><li>Insurance cost tables and annuity conversion factors (PEN OQ7, narrowed 2026-11-06: where each of the nine funds prints them, the fee and rate behind them and one case each are in PEN-48 to PEN-60; the full tables are not collected as data)</li><li>~~Whether the 5.15% guaranteed return is CPI-linked~~ closed 2026-10-25: it is (PEN-18)</li><li>~~The fee after leaving an employer~~ closed 2026-10-25: circular 2017-9-15 (PF-13 to PF-15)</li><li>~~The current form for fixing the annuity exemption~~ closed 2026-10-22: form 161ד (TXP-28)</li><li>~~The taxable base of an early withdrawal~~ closed 2026-10-26: the whole amount paid, at 35% or the ordinary tax if higher (TXP-18)</li><li>~~National Insurance's own 2026 average-wage figure~~ closed 2026-10-25 (PEN-08)</li></ul> | PEN, TXP |
| **Provident fund for annuity** | <ul><li>Who accepts provident money for an annuity, and on what conversion factors (PEN OQ19)</li><li>~~The default track~~ closed 2026-10-25: the age-matched default tracks (PF-24, PEN-17)</li></ul> | PEN |
| **Child savings** | <ul><li>Tax rate, base and withholding on gains at withdrawal (TXK OQ1, Q4 partly closed)</li><li>~~The legal basis of the age-18 grant~~ closed 2026-10-26: the pre-2017 s.74ג(א) still applies to children born before 1.1.2017 (CS-13)</li><li>How today's default fund is picked (CS OQ4)</li><li>~~The fields of the annual statement~~ closed 2026-10-23 (CS-27)</li><li>Clal's 4 tracks, which do not appear in NII's list (CS OQ2)</li><li>~~Current bank rates for the bank route~~ closed 2026-10-23: the Ministry of Finance file is current and daily (CS-23 corrected; `data/series/mof-child-savings-rates.json`)</li></ul> | CS, TXK |
| **IRA** | <ul><li>The official consolidated regulations, and the status of the 2025 draft amendment (IRA OQ1, OQ2)</li><li>~~The fee cap after the 2017 amendment~~ closed 2026-10-25: 2% a year of the balance, fee regulations reg. 4 (PF-06, IRA-17)</li><li>Protection if the manager or broker fails (IRA OQ11)</li><li>Whether active trading inside an IRA can become business income (TXK OQ8)</li></ul> | IRA, TXK |
| **Who offers it** (all pages) | The ISA register and the full TASE member list were read in the browser pass (§12); the CMA licensee register is still unread (REG OQ3). The bank list is read: data.gov.il dataset 375, 17 entries. | REG |
| **Terms matched to statements** (`data/terms/`) | <ul><li>Payslip line labels have no official source</li><li>~~The uniform annual and quarterly statement format was not reached~~ closed 2026-10-23: circular 2020-9-22 and the gov.il draft 2025-26 read in full; field labels in PF-34 to PF-38, the child-savings statement in CS-27, the bank annual report (directive 425) in BANK-32</li></ul> | PF, KH, PEN, TXP, BANK, CS |
| **Illustrative timeline visual** | Out of scope for the knowledge base: needs `docs/method.md` and `tests/cases/`. | — |

**Tier-2 "not covered yet" page.** Each tier-2 file ends with a graduation status. *2026-10-24 (release-5 tier-2 pass):* ranking, blockers, browser to-dos and two draft records in `scratchpad/reports/r5-tier2.md`; eight rules added (INS-25, INS-26, TXA-27, TXA-28, TX2-17 to TX2-20).

| Instrument | Blocked by |
|---|---|
| Savings policies | Policy gains taxed at 25% real or 15% nominal (TXA OQ1; *2026-10-24:* narrowed, two insurers state 25% real; *2026-10-25:* the real base is the law's, TXA-28 general; still open: whether 15% can reach a policy that is not profit-sharing); ~~whether moving to another insurer is a tax event~~ closed 2026-10-25: it is (TXA-28); ~~no regulatory fee cap found~~ closed 2026-10-24: 1% a year, 2% with approval (INS-25); deposit fees' basis open (INS OQ16); the legal definition of a profit-sharing policy (INS OQ1, *2026-10-24:* narrowed: the chain ends in the 1998 report regulations, marked repealed, so the current home of the definition is a browser to-do) |
| Executive insurance | How growth inside the policy is taxed (TXA OQ6); the meaning of the issue-period cohorts; guaranteed annuity factors (INS OQ9, OQ10). *2026-10-24:* unchanged; last in the graduation ranking |
| Amendment 190 | ~~Legal source of the age ceilings and the commutation conditions~~ closed 2026-10-26: the Tax Authority's ruling 6849/15 (TXA-30); the interplay with the exempt commutation closed 2026-10-26 (circular 2/2013 s.5.2.5, TXA-19); the surtax closed 2026-10-26 (TXA-19); still open: National Insurance on the annuity and the commuted sum (TXA OQ14), narrowed 2026-10-26 and now the G-24 blocker; F1 |
| FX and structured deposits | Classifying a structured payout for tax (TX2 OQ5; *2026-10-24:* derived per payout type from the partial-linkage regulations, TX2-18); the legal basis of 25% withholding on FX deposits (TX2 OQ2, wording confirmed, still open); ~~a falling currency~~ closed 2026-10-22 by TXI-25; who supervises non-bank FX providers (FXD OQ8). The olim orders are read (TX2-19; TX2 OQ3 closed 2026-10-24 except a check of the 2026 wording). FX deposits rank second for graduation; draft record in the scratch report |
| Corporate bonds | The ISA registers of rating agencies and trustees (CORP OQ1, OQ2; ISA site is JavaScript, browser to-do); default-loss timing (TX2 OQ6). *2026-10-24:* acceleration quorum read verbatim (CORP-07); third in the graduation ranking, the normal held-to-maturity case computes as a government bond |
| Managed and robo portfolios | ~~Named licensees (MGD OQ1)~~ closed by MGD-23; the ISA directives seen only in secondary sources (MGD OQ2; narrowed 2026-10-26: the technology directive is read in the ISA's file, MGD-21; the needs-clarification directive is not); ~~VAT on fees~~ closed 2026-10-24 (TX2-17). *2026-10-24:* closest to graduation; the tax side computes (TX2-15, TX2-17); what remains is a retail-offer pass over the licensees, an entered or ISA-average fee (D4) and two method formulas; draft record in the scratch report |
| REITs | The current REIT list, which is secondary only (RG OQ4); the per-distribution source split (RG OQ5); NII on pass-through income (TX2 OQ8). *2026-10-24:* withholding practice recorded from Reit 1 (TX2-20, institution; since the 2026-10-25 scope pass the withholding rates by law are TX2-20 and Reit 1's statement and example are TX2-21), which narrows TX2 OQ7 (the ministerial rate) but does not close it; fourth in the ranking |
| Gold via funds | Gold fund names and fees, secondary only (RG-16, RG OQ8; the managers' lists load by script, browser to-do on Maya); tax on foreign gold ETCs and US trusts (TX2 OQ10). *2026-10-24:* fifth in the ranking; an exposure plus fund records, not a wrapper |

---

## 3. Section 3.2, goal comparison (R2)

- **How well each kind's tax is answered**, and which open questions change a result, is the tax column of the six-things table at the top of this file.
- **The idle-cash preset's blocker (tax Q15) is closed at law level.** Each money-market fund's tax status is published on Maya (TXS-24).
- **The constraint "must not need an annual tax return" can't be evaluated yet.** It is still unsettled whether someone with a foreign-broker account who pays advance tax must file a return (TXG OQ4). *2026-10-26 (open-question hunt):* the Tax Authority treats a seller at a foreign broker as someone who files (form 1322, the refund guide; TXG-20); whether the 30 April foreign-income advance can replace the return is still open.
- **National Insurance and health contributions on passive income are only partly sourced** (TXG OQ2, tax Q10).
- ~~**For people aged 60+, how the lower rates reach gains already withheld at a flat 25% is open**.~~ Closed 2026-10-26: the bank withholds the full rate whatever the age; the excess comes back through a return or form 0135, or the assessing officer cuts the withholding in writing (reg. 11 of both withholding regulations; TXS-23, TXG-08).
- **The "where to find this on the payslip" inputs have no source** (§0 item 4).
- **Out of scope for the knowledge base:**
  - the sourced series (BoI policy rate, per-bank deposit averages, makam yields, CPI), which belong to the data track; GOV and BPN record where they are published;
  - the tie threshold and sensitivity bounds, which are site parameters.

## 4. Section 3.3, dimension checklist

- The vocabulary in README covers the minimum list in product.md 3.3.
- Every rule is tagged.
- Proposed additions are listed in F5.

## 5. Section 3.4, workbench (R3 tracks, R4 providers and fund variants)

- **Tracks.** CAT covers the CMA catalogue, the naming circular 2022-9-28/9-30, and Meitav's old-to-new track mapping. Still open:
  - ~~which periods the fee fields average, and their units~~ closed 2026-10-23 (CAT-35, CAT-36, CAT-37: percent, latest completed calendar year, actually charged after discounts; discovery O11 confirmed for display). Still open: the weighting of the average (CAT OQ2, OQ23);
  - the meaning of the risk fields (CAT OQ3);
  - ~~the CMA's official list of standard tracks~~ closed 2026-10-26: list 2024-1471 on gov.il (CAT-23, CAT-15).
- **Provider tariffs.** BRK lists where each provider publishes its tariff, except Meitav Trade, One Zero and Interactive Israel. The tariff figures themselves are data-researcher work. *2026-10-24:* One Zero's full tariff is now located and read (BRK-38); Yahav's and Bank of Jerusalem's securities parts too (BRK-30); Meitav Trade then had no published tariff (it was found on 2026-10-31, BRK-30). Fund variants: the Maya list and TASE's foreign-funds list hold 2,009 and 40 funds (CAT-42, ETF-43) and are not republished (CAT-43); the site shows counts and links.
- **Regulator averages.** These exist for:
  - banks (EDGE FEES_DASH);
  - portfolio managers (ISA report, MGD);
  - provident tracks (CMA);
  - *2026-10-23:* per product class, the CMA annual report for 2025 on gov.il (PF-39: provident 0.53% of assets / 0.08% of deposits, new comprehensive pension 0.15% / 1.54%, life insurance 0.79% / 1.74%; no separate study-fund or gemel lehashkaa class); the ISA's 2025 mutual-fund report on the ISA's own site (MF-55, same figures as MF-18, MF-19); TASE's per-member averages (BRK-33, BRK-37).
  - *Terms, 2026-10-23:* the ISA site and TASE's terms do not permit republishing their figures without written consent (MF-55, BRK-37), the same position as the Bank of Israel series (product D20); gov.il's terms allow a reasonable quotation with attribution as fair use (PF-39). Which of these to ask for, or to hold as links, is the founder's call.
  
  For non-bank brokers, see F2.
- **Fund variants.** Tax by domicile is sourced except for accumulating funds (F4). The US estate-tax exposure of US-domiciled funds is sourced (TXF). `data/funds/` itself is data work.
- **Caps on direct investment expenses.** Each manager publishes its own yearly cap per track; these were not collected (PF OQ3).

## 6. Section 3.5, fee materiality (R3)

- **Fee caps are closed for the provident family**, from the 2012 management-fee regulations:
  - provident funds and kupat gemel lehashkaa: 4% of deposits and 1.05% of balance;
  - comprehensive pension fund: 6% of deposits and 0.5% of balance;
  - keren hishtalmut and IRA: 2% of balance, with no deposit fee;
  - accounts that lost contact: 0.3%.
- **Executive insurance** falls under the same caps, except policies issued before 2013.
- **Still open:**
  - ~~savings-policy caps~~ closed 2026-10-24 (INS-25);
  - how long a fee discount must last: the CMA circular says 5 years, bylaws say 2 (see §9);
  - ~~the rule for pension fees after leaving an employer~~ closed 2026-10-25 (PF-13 to PF-15);
  - ~~whether non-bank members may charge custody on makam and money-market funds~~ closed 2026-10-26: banks may not (BRK-17); no rule limits a non-bank member, most of which are investment marketers outside the distribution-fee regulations (BRK-52).

## 7. Sections 3.6 holdings review and 3.7 switching playbook (R3, R4)

- **Holdings review.** Track classification (CAT) and transfer rules (PF, SW) are covered. One gap blocks the child-savings check in 3.6: no source shows a parent whether their child's track was chosen by them or assigned by default (CS OQ10; narrowed 2026-10-23: the statement template has no such field, CS-27; NII's personal-information service was not checked, CS-26). *2026-10-23:* "where to find it on the statement" is sourced for provident, study-fund, gemel lehashkaa and pension accounts (PF-34 to PF-38), child savings (CS-27) and bank deposits and securities (BANK-32); consolidation seniority is settled (SW-39: transferred money keeps its payment dates; two study funds merge into one account only when both are withdrawable), pension-to-pension carry-over is sourced and its tax neutrality narrowed but still not stated by an official text (SW-40); since 2026-11-07 it is (`tax-pension-gemel-lekitzba.md` TXP-32).
- **Switching playbook.** SW has 44 rules and an ordered step list for all 9 wrappers. The CMA transfer circular was read in full, from a third-party host; *2026-10-24:* the CMA's own copy on gov.il is identical (SW-41), the clearing-house channel and the regulator's deferral power are sourced (SW-42), directive 448 version 4 changes disclosure only (SW-43), and the clearing house's price cap for a saver is sourced (SW-44, PF OQ6 narrowed). Still open:
  - whether any retention rule exists for provident products (SW OQ3);
  - whether a quoted fee binds the institution (SW OQ4);
  - ~~the clearing house's price for a direct request~~ closed 2026-10-24 (SW-44);
  - ~~who must notify the employer after a transfer~~ closed 2026-10-26: the receiving fund, within 10 business days (SW-10);
  - whether the transfer circular governs kupat gemel lehashkaa (SW OQ2);
  - moving securities to or from a foreign broker (SW OQ12);
  - tax on moving securities in kind between your own accounts: by law the cost and purchase day stay the holder's and the receiving institution withholds from the cost it holds (TXS-38, TXS-39); whether the move is a sale only banks and a broker say (TXS-40; TXS OQ17, SW OQ11);
  - ~~how to remove an agent already attached to an account~~ closed 2026-10-26: a written cancellation (SW-17).

## 8. Section 3.10, catalogue of every option (was "catalogue of every option" until 2026-10-23)

- **CMA side (R1).** The catalogue is covered. The fee fields can now be shown (browser pass 4, 2026-10-23): both portals print them in percent and label them "לשנת 2025" / "בשנת 2025", the latest completed calendar year (CAT-35, CAT-36); the CMA's definition of the same-named member-report figure is the rate actually charged from all members, after discounts (CAT-37); pension fees are per fund (CAT-39); 68 gemel tracks and 6 pension tracks have no value because they are younger than a full calendar year, with 13 unexplained exceptions (CAT-40, OQ22). The averaging weight is still not stated by the CMA (OQ2, OQ23); the site should say "ממוצע" and the year, not "משוקלל". Your Meitav "general twice" question:
  - In Gemel-Net, Meitav's kupat gemel lehashkaa (fund 7857) has 16 tracks and only one "כללי" (track 7978, the default).
  - The duplicate you saw may be "מיטב קידס", which is a kupat gemel lehashkaa opened in a child's name (CAT OQ13). It can't be settled without the app's own screens, and since 2026-10-23 it does not need to be: the site lists all 16 tracks and every Meitav product in the data, so whatever the app's second "כללי" is, it is covered (product.md D17).
  - Altshuler has the same pattern: "כללי" alongside "כללי ב'", which has been closed to new members since 2016 (KH).
- **Bank side (R4).** BPN catalogues 290 names from 11 bank brands (One Zero's four added 2026-11-09). Gaps:
  - no names catalogued yet for Bank of Jerusalem (its 447 table can be read and its names are in the deposit records) or Esh Israel (BPN OQ5; Discount's names are BPN-12);
  - the same name means different products at different banks (BPN-05);
  - several abbreviations are not explained anywhere read: פק"מ, לל"ת, מני"ע (BPN OQ8).
- **N6 is closed.** Directive 447 requires on-screen display only. No bank publishes its rates as a data file. The only machine-readable per-bank series is the Bank of Israel's EDGE INTEREST_DASH: monthly, per bank rather than per product, and its series codes are not yet decoded (BPN OQ16).

## 9. Contradictions between sources still to resolve

| Topic | Conflict | Files |
|---|---|---|
| ~~Fee-discount minimum period~~ | Resolved 2026-10-25: 5 years; the circular covers kupat gemel lehashkaa managers and the bylaws' 2 years is the replaced circular 2012-9-22 (PF-13, KGL-16, KGL-30) | PF, KGL |
| ~~Employee one-third share in a study fund~~ | Resolved 2026-10-25: Income Tax Rules rule 19(ב2)(1), a condition of the fund's tax approval (KH-05) | KH |
| ~~s.9(18ב)~~ | Resolved 2026-11-08: HCJ 10042/16 orders chapter 12 annulled, and the provision is in chapter 12 (TXK-15) | TXP, TXK |
| ~~Makam tax rate~~ | Resolved: 15% by the law and reg. 5(א); the 2024 and 2025 guides' 20% line matches no rate in the law (TXI-11). The split on a sale before redemption is still open | TXI OQ3 (narrowed 2026-10-26) |
| ~~Child-savings grant at 18~~ | Resolved 2026-10-26: the 2016 Economic Efficiency Law s.163 applies the new s.74ג only to children born from 1.1.2017, so the old grant stays for earlier cohorts (CS-13) | CS |
| ~~2025 average wage~~ | Resolved 2026-10-25: the 2025 booklet applies 13,316 to the employer and severance ceilings and 12,536 to the beneficiary-member test (TXP-03, TXP-10) | TXP |
| Distributions from a foreign fund on TASE | The 2019 Tax Authority letter says no loss offset, which seems to conflict with s.92(a)(4) | TXF OQ9 |
| ~~Start of the pension return guarantee~~ | Resolved 2026-10-26: 1.10.2022; the law allows a date later than 1.7.2022, and the Minister's s.34ז report and CMA circular 2022-3-3 start on 1.10.2022 (PEN-18) | REG, PEN |
| ~~Annual-return deadline for 2025~~ | Resolved 2026-10-31: 30.4.2026 in the guide's text; the discovery report's 31.3.2026 is another route (TXG-24) | TXG |
| Bank fee rules version | BRK-16 uses the consolidation to 5.11.2024; a newer one dated 9.4.2025 exists | FXD findings |
| Slice Gemel | IRA cites press only; PEN cites its funds being sold to Phoenix in October 2024 | IRA, PEN |

## 10. Corrections to the discovery reports found during this work

- **`domain-landscape.md` 4.3:** the gemel lehashkaa home-sale exception is a window that closed on 31.12.2017, capped at NIS 2.5 m. Gemel lehashkaa has 12 general-public managers plus 6 sector funds, not 14. Keren hishtalmut has 15 general-public managers in Gemel-Net for 2026-09, not 18.
- **`domain-landscape.md` 4.2:** the "63% closing auction" figure describes the funds' own trading, not investors' trades. The ISA's headline fee averages are simple averages, not weighted.
- **`domain-landscape.md` 4.1 lead:** the A447 URL is a draft. The final text is at boi.org.il/media/gcmk52bw/447a.pdf.
- **`data-landscape.md` 1.2.1:** the CMA "פירוט שינויים" XLSX files are field dictionaries, not just format-change notes. Bituach-Net carries no licence.
- **`data-landscape.md` 1.4:** the MoF `savingsplaninterest` dataset is stale (newest rows 02/09/2025). *Corrected 2026-10-23:* only the datastore API is stale; the CSV file is current (CS-23).
- **`tax-landscape.md`:**
  - **§3.1:** the 9,700 figure is the s.47(a)(1) eligible-income cap, not an "insured salary".
  - **Circular 2/2013:** its "67% from 2025" was replaced by Amendment 275 (57.5% in 2026, rising to 67% in 2028).
  - **Q22 is closed:** the gov.il booklet URL now serves the April 2026 edition.
  - **§3.2:** the Finance Ministry paper's 2025 self-employed figure (20,538) conflicts with the law's 20,566.
- **FX deposits (`domain-landscape.md` / brief):** Discount's "representative rate plus 0.2%" is the starting exchange rate for FX-linked shekel deposits, not an interest rate.
- **Discovery tax questions closed or narrowed:**
  - closed: Q2 (interest bucket), Q6, Q11, Q12 (deposits), Q15, Q16 (general rule), Q17, Q22;
  - mostly closed: Q14;
  - narrowed: Q1, Q19.
- **Discovery domain questions closed or narrowed:**
  - closed: 7, 8 (provident family), 9, 10, 23;
  - partly closed: 1, 2, 3, 5, 13, 14, 15, 22.

## 11. Product.md items with no knowledge-base work needed

- **Data, method or design work, not rules:** 3.8 parameters (N1), `docs/method.md`, `tests/cases/`, 3.9 saved state (N3), N4 (which exposures go into `data/funds/` first), N5 (a return-scenario file).
- **Out by decision:** P2P lending, crypto, derivatives, leveraged FX, private equity, physical real estate and collectibles (D2, product.md section 4). Physical gold is mentioned only to say it is out.
- **Data-track dependencies:** product.md §5 item 7, the data terms for EDGE, CBS and TASE DataHub, was not researched here. It belongs to the data track.

## 12. Browser pass, 2026-10-22

After the agents finished, I opened the blocked sources in your Chrome browser. New rules went into the
topic files with links and dates, and the open questions they answer are marked "browser pass" in each file.

| Closed or narrowed | New rule | Was |
|---|---|---|
| Full TASE member list: 8 non-bank members, adding Blink Fintech and UBS; One Zero is a member | BRK-32 | — |
| TASE publishes **average fees actually charged** per member, including non-bank brokers, by size band | BRK-33 | F2 |
| One Zero's tariff, deposit terms and 447A page | BRK-34 | — |
| ISA register totals; 129 portfolio-management companies by name and licence number | REG-30, MGD-23 | REG OQ2, MGD OQ1 (names) |
| Meitav's portfolio-management company holds licence 322 | REG-31 | REG OQ15 (in part) |
| Gemel-Net yields are nominal and gross of management fees (CMA page) | CAT-32 | CAT OQ1 (in part) |
| The public mutual-fund list is on Maya (2,009 open-end funds, with filters) | CAT-33 | — |
| Fixing the annuity exemption: form 161ד, filed through the Tax Authority personal area | TXP-28 | — |
| Leaving a job: the new form 161 (since 1.1.2024), its parts, and the employee's four choices per grant (annuity continuity, severance continuity, exempt grant, taxable grant) | TXP-29, TXP-30 | — |
| NII's official child-savings fund list (10 managers, including Clal) and its 5 tracks | CS-24 | CS OQ2 |
| Bank vs provident child savings: principal guarantee, transfer limits, fees to 21 | CS-25 | conflict noted |
| The CMA lost-accounts search ("הר הכסף" route) | PF-32 | — |
| Makam: monthly issue, 12 series, individuals can bid through their account, BoI calls it risk-free | GOV-22 | GOV OQ2 (in part), OQ9 |
| Makam issue schedule to February 2027, about one year per series | GOV-23 | GOV OQ3 |
| "פק"מ" = "פיקדון קצר מועד" (institution source) | BANK-30 | BPN OQ8 (in part) |
| Bank of Jerusalem and One Zero product names | BPN-11 | BPN OQ5 (in part) |

**What the browser pass did not settle:**

- **Chrome machine-translated some sites into English** (TASE, Maya, Discount, one gov.il page). Fixed after you switched Google Translate off; see browser pass 2.
- **The TASE fee calculator doesn't show its data period** (BRK-33).
- **The makam tax rate is 15% by law** (s.125ג(ג)(1), reg. 5(א) of the 2005 withholding regulations; TXI-11). The Tax Authority guide's 20% line, printed in 2024 and 2025, matches no rate in the law; only the split of a sale before redemption is open (TXI OQ3, narrowed 2026-10-26).

### Browser pass 2 (Google Translate off), 2026-10-22

| Closed or narrowed | New rule | Was |
|---|---|---|
| Full exposure-code scale (0 to 6, A to F) and the "(!)" mark | MF-43 (scale), MF-57 ("(!)"); MF-54 folded into them 2026-11-12 | MF OQ9 |
| Each fund's tax status is on Maya; 2 of 73 money-market funds are **taxable** (Harel dollar 5103403, Migdal monthly-distributing shekel 5137559) | TXS-24 (the count), TXS-26 (the two funds, split 2026-10-26) | F1 (narrowed) |
| Maya's fund export and its fields (fees, tax status, trustee, distribution-fee class) | CAT-34 | — |
| 40 foreign funds on TASE (iShares and Invesco), traded in shekels | ETF-32 | ETF OQ4, OQ16 (in part) |
| Discount's 47 named deposit products | BPN-12 | — |
| Mercantile's deposit names (and its double spelling of the same products) | BPN-13 | BPN (Mercantile) |
| Form 161 part B: annuity continuity, severance continuity, exempt grant, taxable grant, and the default | TXP-30 | — |
| IB Ireland protection: Irish scheme up to EUR 20,000, SIPC via IBLLC up to USD 500,000 | BRK-35 | — |
| Interactive Israel says it withholds Israeli tax via HYBRID | BRK-36 | — |
| Kol Zchut lead: the "one third" study-fund rule is a tax condition (employer not more than 3× employee) | KH-05 | §9 conflict (lead) |

**Browser pass 3** closed most of what pass 2 left:

- **2026 kupat gemel lehashkaa ceiling:** CBS's own linkage calculator, applied to the law's formula, gives NIS 83,641.09. That matches the managers' figure (KGL-24). No separate notice exists or seems required.
- **TASE's foreign funds:** all 40 read, 23 iShares and 17 Invesco (ETF-32).
- **Deposit abbreviations:** פז"ק, פקצ"מ, פח"ק, פצ"מ and הו"ק are now defined from bank documents (BANK-31).

**Still open:** "פר"ן" (Mercantile). No bank document defines it. Google's AI summary suggests "פיקדון ריבית ניידת", but that isn't a source and wasn't used. "לל"ת" and "מני"ע" (Leumi) and Hapoalim's "(פ)" were not searched.

### Browser pass 4 (CMA fee fields, discovery O11), 2026-10-23

| Closed or narrowed | New rule | Was |
|---|---|---|
| Fee fields are percent values; both portals print them with % and the same numbers as the data | CAT-35 | CAT OQ2 (unit), O11 |
| The value is the average for the latest completed calendar year ("לשנת 2025" in October 2026); dataset rows of year Y hold year Y−1; first value after the first full calendar year | CAT-36 | CAT OQ2 (period), CAT-06 |
| The CMA defines the same-named member-report average as the rate "שגבתה הקופה בפועל מכלל העמיתים" (after discounts); identity with the field inferred | CAT-37 | CAT OQ2 (basis) |
| The regulator's fee-rate reporting codes (quarterly, fees ÷ assets) from circular 2015-9-9 | CAT-38 | CAT OQ2 (weighting, narrowed) |
| Pension fees are per fund; every track of a fund carries the same pair | CAT-39 | — |
| Empty means not reported (young tracks), not zero; one negative deposit fee; an empty deposit fee of a balance-only product type is the rule (PF-06, 2026-10-27) | CAT-40 | CAT OQ24 to OQ26 |
| Yields, Sharpe and liquidity fields equal the portal display; trailing windows end at the report month | CAT-41 | CAT OQ1 (in part) |

**Not settled:** how the published average is weighted and which report feeds it (CAT OQ2, OQ23); 13 tracks opened in 2024 without a value (OQ22); Migdal's empty deposit fees, guaranteed-return funds' deposit fee and the list of actual-expense funds (OQ24 to OQ26); whether portal yields are after direct expenses (CAT-41). Gemel-Net's "הסברים" pages are images of an academic paper on risk measures, not read in full (OQ3).

The Maya export file was downloaded once through the browser, into your Downloads folder (`mutual-funds.csv`). Later files were fetched in WSL instead.

### Browser pass 5 (release 4 research), 2026-10-24

| Found | Rule | Closes |
|---|---|---|
| Bank Yahav's full tariff 2.2026 (PDF and XLSX, 'נכון ליום: 01/10/2026') and its 16/09/2026 change notice; snapshot `yahav@2026-10-24` (14 lines) | BRK-30 | data gap O12 (Yahav) |
| Bank of Jerusalem's individuals tariff (PDF and XLSX per part; part 4 printed 'בתוקף מתאריך : 06/02/20217', part 5 20/06/2021); snapshot `jerusalem@2026-10-24` (13 lines) | BRK-30 | O12 (Jerusalem) |
| One Zero's full tariff (26.7.2026): TA-125 shares, Israeli funds and US securities only; zero custody; one rate for clerk and internet; plan ONE 49 NIS a month with a 66% trade benefit; snapshot `one-zero@2026-10-24` (11 lines) | BRK-38 | O12 (One Zero) |
| Meitav Trade: still no tariff; the four-tracks page gives words only (its tariff was found on 2026-10-31) | BRK-30 | — |
| Maya list: 2,009 funds; counts by top classification (two heading trees, 1,163 active and 846 tracking/ETF) and tax status (1,986 / 21 / 2); the by-hand export path | CAT-42 | CAT-33, CAT-34 refresh |
| TASE terms (August 2026): no republishing without written consent; limited quotation with a link only on www.tase.co.il; no databases | CAT-43 | product dependency 7 (fund lists: not shipped) |
| TASE foreign-funds list: 40 funds, 29 equity, 11 bond, as of 23/10/2026 | ETF-43 | ETF-32 refresh |
| TASE Data Hub / Data Store: licence by use (internal or distribution), mutual-fund products priced 797.5 to 2,016 NIS, free products only at checkout, site terms apply | BRK-39 | discovery O13 |
| The CMA's own copy of circular 2017-9-17 (gov.il) is the text read; deadlines verbatim; later CMA circulars cite 2016-9-11 | SW-41 | — |
| Transfer information passes through the clearing house since 23.2.2020 (ממשק ניוד); the Commissioner may defer the ten-day deadline by up to twenty business days | SW-42 | PF OQ6 (channel) |
| Directive 448 version 4 (11/25, circular 2833): disclosure sections 16א and 19א only; start by 1.3.2026 | SW-43 | — |
| Clearing-house payment circular 2026-10-6: a saver's one-time all-institutions request capped at NIS 11 before VAT, from the new operator's takeover day (not yet named; the circular starts 1.1.2027) | SW-44 | PF OQ6 (narrowed) |

**Not done:** the ISA and CMA licensee registers (REG OQ3, task item 4); the clearing house's current (2022) price list and the operator's own price page (rendered no text); the CMA's regulation collector for amendments to the transfer circular (read on 2026-10-26: nothing later, SW-41); the 2026-9-3 circular's deferred dates. One Zero's PDF was fetched inside the Chrome tab (the host returns 403 to curl) and its one-glyph-per-letter text layer re-joined by hand; the Maya counts came from the list page's own filter requests, one heading at a time.
