# Coverage: what in `docs/product.md` the knowledge base does not cover yet

Written 2026-10-22, after the 29 topic files in this folder were finished and reviewed.
The knowledge base holds 775 rules and about 510 open questions (493 numbered items in 29 files on 2026-10-26, of which 101 are closed and struck; see `research/knowledge/2026-10-26-open-questions.md`). Every rule has a link and a
checked date. Rules that only point to other rules carry the links of the rules they point to.

This file lists what is still missing, in the order of `docs/product.md`. Each gap names the file and
open question (OQ) or rule where the detail is. "Out of scope for the knowledge base" marks
things product.md asks for that are data, method or design work rather than rules.

---

## 0. Before anything is encoded

These apply to the whole knowledge base, not to one topic.

1. **Most legislation was read through mirrors.** Laws and regulations were read on Wikisource or Nevo
   through a fetch tool that summarises or returns short quotes. These rules are marked
   `primary (mirror)`. Before a rule enters `il-finance`, re-read its exact wording in the official text
   (Reshumot on fs.knesset.gov.il, which opens, or the full Nevo text). Several files say a mirror may
   be out of date: the IRA regulations, the 1964 provident rules, the withholding regulations, and the
   mutual-fund regulations.
2. **Some sources can't be opened by a script.** A browser pass through your Chrome on 2026-10-22 got past most of these (§12): TASE, the ISA register, hly.gov.il, gov.il service pages, Bank of Israel pages, Bank of Jerusalem and One Zero all opened. Still not done from this list: Kol Zchut (opens, not yet used), S&P Maalot, the CMA fslproviders register, circular 7/2003, Accountant General bond terms, and Mercantile's rate table. Discount's rate table opened but was machine-translated. *Status 2026-10-23:* the Gemel-Net and Pensia-Net portals were read in browser pass 4 (CAT-35 to CAT-41, the fee fields confirmed for display); the Bank of Israel's terms of use were read in archived copies (republication not permitted, discovery O14); S&P Dow Jones Indices' pages and TASE's TA-125 page were read in Chrome (ETF-33 to ETF-42). Still not done: Kol Zchut, S&P Maalot, the CMA fslproviders register, circular 7/2003, Accountant General bond terms, Mercantile's rate table. *Status 2026-10-24 (browser pass 5, release 4):* Bank Yahav's, Bank of Jerusalem's and One Zero's tariffs were read in Chrome (snapshots in `data/fees/*@2026-10-24.json`, BRK-30, BRK-38); Meitav Trade still publishes none (BRK OQ18); Maya's fund list and TASE's foreign-funds list were read and counted but not republished because TASE's August 2026 terms forbid it (CAT-42, CAT-43, ETF-43); TASE's Data Hub and Data Store terms and prices were read (BRK-39, discovery O13); the CMA transfer circular, the clearing-house letters and circulars and directive 448 version 4 were read on gov.il and boi.org.il (SW-41 to SW-44). The original list:
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
     gov.il's HTML pages and their data APIs sit behind Cloudflare's human check. The founder allowed
     FlareSolverr for gov.il pages only (2026-10-25). It runs in Docker on this machine (start it with
     `docker start flaresolverr`), and `research/audit/tools/govil-page.sh URL` prints one page's HTML,
     refusing any address outside gov.il. A page takes about 15 seconds. The script waits 6 seconds after
     the check, because without the wait a page could come back as the bare frame. The page is where to
     see which edition is current: an old PDF stays online after a new one replaces it, so a link check
     never shows it is out of date. Read this way on the first day:
     - "דע זכויותיך" lists the 2025 and 2024 editions, so 2025 is the newest.
     - The clearing-house page lists its six attachments.
     - Circular 7/2003, on this list's not-done items, has its PDF at
       `/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf`.
     - The tax-treaties collector address in `tax-securities-foreign.md` now leads to gov.il's error page.
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
   - ~~the Meitav app's "open a new saving" menu and its eight tracks~~ (CAT OQ12, OQ19): not needed
     since 2026-10-23, because the site lists every track from the data (product.md D17);
   - a payslip from you and from a friend (no official source gives the line labels; KH OQ5, PEN OQ11,
     TXP OQ16);
   - ~~the annual statements of your own funds~~ (PF OQ5, CS OQ11): the uniform formats were read on 2026-10-23 (PF-33 to PF-38, CS-27), so your own statement is now only a check of what a fund prints, not the source of the field names;
   - product names that banking apps show only after login (BPN OQ20).

---

## 1. Decisions that need the founder (product.md section 1)

The research raised these. None was decided here; product.md was not edited.

| # | Issue | Where it came from | What it changes |
|---|---|---|---|
| F1 | **Answered 2026-10-24 by D23: institution-strength rules compute, labelled "institution source", and never close a tax question for graduation.** (Original finding:) D10 has no policy for institution-strength rules (a fund's bylaw, prospectus or form). D10 covers primary, secondary and open sources only. | TXA (Amendment 190 conditions TXA-22 to TXA-24); also TXS-12/13 (a money-market fund's tax track comes from its prospectus), KGL lump-sum withholding at 25%, many KH and PEN rules | Whether these rules compute, compute with a label, or block. Narrowed in browser pass 2: TASE's Maya publishes each fund's tax status (TXS-24), so the money-market case no longer rests on prospectuses alone. The rest of F1 stands. |
| F2 | **D4 is wrong for non-bank brokers** (confirmed in the browser pass, §12). TASE's s.45טז calculator shows average fees actually charged by every member, banks and non-bank brokers alike, by portfolio-size band and security type. | BRK-33 | D4's "no average exists for non-bank brokers" should be corrected, and 3.4's provider table can show this reference for them. |
| F3 | **The roadmap R2 risk is partly wrong.** The employee's s.45A/47 ceilings are CPI-linked and frozen for 2025–2027; they are not tied to the average wage. The employer, severance, 16% beneficiary-member and self-employed ceilings *are* tied to the average wage. | TXP (see its summary) | The wording of the roadmap R2 risk and of tax-landscape §3.1 and §10 item 4. |
| F4 | **Accumulating foreign funds (tax Q1).** No rule taxes a minority holder on a foreign fund's undistributed income: none in the Ordinance (checked section by section), not CFC s.75B, and nothing like the US PFIC rule (Q19). But no Tax Authority statement confirms tax is due only on sale either. *2026-10-26 (open-question hunt):* the Tax Authority's 4.7.2019 letter supports the sale-and-distribution reading by implication, while circular 7/2003 s.4.4 points the other way (TXF-11; TXF OQ1 narrowed, not closed). | TXF OQ1, OQ2 | Under D10 this variant stays blocked in 3.4 unless you accept the reading or a source appears. |
| F5 | **61 new dimensions were proposed** across files, some overlapping (for example `default-allocation`, `default-assignment`, `default-track`). Examples: `fund-tax-track`, `estate-situs`, `market-price-exit`, `rate-reset`, `surtax`, `social-contributions`, `threshold-drift`, `dispute-channel`, `investment-restrictions`, `self-directed-risk`, `default-assignment`, `employer-dependence`, `actuarial-adjustment`, `death-and-beneficiaries`, `annuity-vs-lump-sum`, `order-timing`, `product-marking`, `fee-performance`, `fund-closure-merger`, `fx-spread`, `conditional-return`, `issuer-conflict`, `value-date`, `conflict-of-interest`, `fee-fund-underlying`, `rate-type-anchor`, `auto-renewal`, `benefit-expiry`. | "Proposed dimensions" in each file | product.md 3.3 sets the minimum list. Adding to `data/dimensions/` is your call. **Answered 2026-10-23: none adopted for release 1** (chosen by Claude at the founder's request); the 26 rows stand. |
| F6 | **Structured bonds and bank-issued structured notes** (איגרות חוב מובנות; NIS 27 bn raised on TASE in 2025) are in no tier and no file. D2 lists only structured *deposits*. | CORP findings; TX2 OQ16 | Whether to add them to the tier-2 list. |
| F7 | **Payment-wallet balances** (for example LAYA, which holds an ISA payment-services licence) are a way to hold money that D2 does not mention. | FXD findings | Whether they are in scope at all. |
| F8 | **Your age-60 example now has an answer**, at primary strength for the law (TXK-12). A lump sum is taxed the same before and after 60. At 60 or later the balance can move to an annuity fund, and the resulting annuity is fully exempt. Whether that money can later be commuted to a lump sum is open (TXK OQ4). | TXK | Nothing to decide; this confirms or corrects your interview claim. |

---

## 2. Section 3.1, instrument guide: gaps per tier-1 page

The guide page has a fixed structure. These are the parts not yet sourced for each wrapper or exposure.

| Page | Not covered yet | Where |
|---|---|---|
| **Current account, deposits, savings plans** | <ul><li>What Bank of Israel supervision actually protects if a bank fails (BANK OQ8; REG OQ10, OQ13)</li><li>How breaking a savings plan is priced, and whether each monthly deposit has its own exit points (BANK OQ12, partly answered for Hapoalim in BPN; narrowed 2026-10-26: no general rule, each bank's plan terms (BANK-28))</li><li>Whether 447 rates for CPI-linked deposits are real or nominal (BANK OQ17)</li><li>The official definition of prime (BANK OQ14)</li><li>Tax: prime-linked deposits are in the 15% bucket (TXI-04; TXI OQ2 closed 2026-10-26); breaking a deposit early (TXI OQ14, narrowed 2026-10-26: only interest actually paid is taxed); deflation on CPI-linked deposits (TXI OQ6)</li><li>Which banks count as "small" and are exempt from the account-free deposit rule (BANK OQ5)</li></ul> | BANK, TXI |
| **Money-market funds** | <ul><li>The final ISA money-market directive was read only as a draft (MF OQ1)</li><li>The A447 bank-display rules in MF still cite the draft; the final text is in BANK-15 and the rules are marked for re-check</li><li>Order cut-off hours for daily funds, and whether Friday is a pricing day for funds limited in foreign securities (MF OQ3, narrowed 2026-10-26: pricing days are set by the prices regulations, MF-14)</li><li>~~How many days until redemption cash is usable (MF OQ4)~~ closed 2026-10-26: reg. 15 of the prices regulations (MF-11)</li><li>Tax: Q15 is closed, but only at fund level. Each fund's "מסלול המס" must be read from its prospectus, and whether any taxable money-market fund exists is unknown (TXS OQ1; see F1)</li></ul> | MF, TXS |
| **Makam and government bonds** | <ul><li>Whether and how an individual can bid in a makam or bond auction, with what minimum and fee (GOV OQ2, OQ8)</li><li>The Shahar series regulations (GOV OQ4; narrowed 2026-10-26: today's fixed-rate series are "אג"ח ממשלתית", GOV-14; the old שחר series remain)</li><li>~~Which regulation governs Gilon (GOV OQ5)~~ closed 2026-10-26: today's floating series are "אג"ח ממשלתית בריבית משתנה" under the 2006 regulations as amended in 2007 (GOV-14)</li><li>Per-series deflation floors (GOV OQ6)</li><li>The official risk wording (GOV OQ9)</li><li>Tax: makam at 20% (2025 guide) or 15% (s.125C(c)) conflict (TXI OQ3); accrued interest when buying between coupon dates (TXI OQ5)</li></ul> | GOV, TXI |
| **ETFs and index funds** (Israeli, foreign on TASE, foreign-domiciled) | <ul><li>Accumulating foreign funds (F4)</li><li>~~Whether Ireland withholds on an Irish fund's distributions (TXF OQ6)~~ closed 2026-10-26: no Irish tax on units held in a recognised clearing system or paid to a declared non-resident (TXF-28)</li><li>EU PRIIPs/KID limits for Israelis at EU brokers (ETF OQ11)</li><li>The full lists of Israeli ETF issuers and of foreign funds registered in Israel (ETF OQ3, OQ4)</li><li>~~The scale of the exposure codes in fund names (ETF OQ9)~~ closed 2026-10-25: the classification regulations set it (ETF-12, MF-54)</li><li>Spread obligations of market makers (ETF OQ2)</li><li>Foreign-currency cash at a foreign broker (TXF OQ4)</li><li>Whether Israeli banks deduct foreign tax already withheld (TXF OQ3)</li><li>~~What the S&P 500 and the TA-125 are, from their providers, for the exposure pages (product D18)~~ closed 2026-10-23 (ETF-33 to ETF-42)</li></ul> | ETF, TXF, BRK |
| **Active mutual funds** | <ul><li>The current ISA list of classification headings and naming rules (MF OQ8, OQ9)</li><li>How many funds charge loads (MF OQ7)</li></ul> | MF |
| **Brokerage account** (the wrapper) | <ul><li>**No statute found that segregates a non-bank TASE member's client assets** (REG OQ9; BRK OQ3, the TASE rules' current text, closed 2026-10-25, BRK-07, BRK-10); protection rests on brokers' own statements and the TASE rules (REG OQ9 narrowed 2026-10-26 by a reading of the Trust Law)</li><li>~~Whether non-bank members and foreign brokers withhold Israeli tax (BRK OQ16)~~ closed 2026-10-25: every TASE member withholds; a foreign broker does not (BRK-27, TXS-05, TXF-22)</li><li>Direct IBKR and eToro accounts for Israeli residents (BRK OQ9; narrowed 2026-10-26: the ISA's s.49A list names Interactive Brokers LLC and IB UK, `research/knowledge/2026-10-26-ibkr-permit.md`)</li><li>~~The 3 non-bank TASE members not yet named~~ closed in the browser pass (BRK-32)</li></ul> | BRK, REG |
| **Kupat gemel lehashkaa** | <ul><li>~~The official 2026 ceiling~~ confirmed by CBS calculation (KGL-24)</li><li>~~Tax: the legal rate on a lump sum, 25% of real gain or 15% nominal, and which provision exempts the inflation part (TXK OQ2)~~ closed 2026-10-25: up to 25% of the real gain, s.9(13) exempting the linkage part since Amendment 190 (TXK-07, TXK-06); the 60+ brackets apply (TXK OQ12, closed 2026-10-26); no NII or health on the lump-sum gains (TXK-27, new); the current withholding regulation (TXK OQ3)</li><li>Whether an employer may deposit (KGL OQ5)</li><li>Eligibility for 5 of the 6 sector funds (KGL OQ11)</li></ul> | KGL, TXK |
| **Keren hishtalmut** | <ul><li>~~The legal source of the "employee pays at least one third" rule (KH OQ1)~~ closed 2026-10-25: a condition of the fund's tax approval, Income Tax Rules rule 19(ב2)(1) (KH-05)</li><li>Loan terms (KH OQ4)</li><li>Extension orders that require a study fund (KH OQ3)</li><li>~~Tax on gains from deposits above the ceiling, real or nominal (TXH OQ1)~~ closed 2026-10-26: up to 25% of the real gain (TXH-11)</li><li>The 2027 budget proposal to narrow the exemption (TXH OQ2, tax Q18), to re-check after the elections</li></ul> | KH, TXH |
| **Pension fund** | <ul><li>Insurance cost tables and annuity conversion factors (PEN OQ7)</li><li>~~Whether the 5.15% guaranteed return is CPI-linked (PEN OQ8)~~ closed 2026-10-25: it is (PEN-18)</li><li>~~The fee after leaving an employer (PEN OQ10)~~ closed 2026-10-25: circular 2017-9-15 (PF-13 to PF-15)</li><li>~~The current form for fixing the annuity exemption (TXP OQ1)~~ closed 2026-10-22: form 161ד (TXP-28)</li><li>~~The taxable base of an early withdrawal (TXP OQ3)~~ closed 2026-10-26: the whole amount paid, at 35% or the ordinary tax if higher (TXP-18)</li><li>~~National Insurance's own 2026 average-wage figure (PEN OQ5)~~ closed 2026-10-25 (PEN-08)</li></ul> | PEN, TXP |
| **Provident fund for annuity** | <ul><li>Who accepts provident money for an annuity, and on what conversion factors (PEN OQ19)</li><li>~~The default track (PEN OQ18)~~ closed 2026-10-25: the age-matched default tracks (PF-24, PEN-17)</li></ul> | PEN |
| **Child savings** | <ul><li>Tax rate, base and withholding on gains at withdrawal (TXK OQ1, Q4 partly closed)</li><li>~~The legal basis of the age-18 grant (CS OQ5)~~ closed 2026-10-26: the pre-2017 s.74ג(א) still applies to children born before 1.1.2017 (CS-13)</li><li>How today's default fund is picked (CS OQ4)</li><li>~~The fields of the annual statement (CS OQ11)~~ closed 2026-10-23 (CS-27)</li><li>Clal's 4 tracks, which do not appear in NII's list (CS OQ2)</li><li>~~Current bank rates for the bank route~~ closed 2026-10-23: the Ministry of Finance file is current and daily (CS-23 corrected; `data/series/mof-child-savings-rates.json`)</li></ul> | CS, TXK |
| **IRA** | <ul><li>The official consolidated regulations, and the status of the 2025 draft amendment (IRA OQ1, OQ2)</li><li>~~The fee cap after the 2017 amendment (IRA OQ3)~~ closed 2026-10-25: 2% a year of the balance, fee regulations reg. 4 (PF-06, IRA-17)</li><li>Protection if the manager or broker fails (IRA OQ11)</li><li>Whether active trading inside an IRA can become business income (TXK OQ8)</li></ul> | IRA, TXK |
| **Who offers it** (all pages) | The ISA register and the full TASE member list were read in the browser pass (§12); the CMA licensee register is still unread (REG OQ3). The bank list is read: data.gov.il dataset 375, 17 entries. | REG |
| **Terms matched to statements** (`data/terms/`) | <ul><li>Payslip line labels have no official source</li><li>~~The uniform annual and quarterly statement format was not reached (PF OQ5)~~ closed 2026-10-23: circular 2020-9-22 and the gov.il draft 2025-26 read in full; field labels in PF-34 to PF-38, the child-savings statement in CS-27, the bank annual report (directive 425) in BANK-32</li></ul> | PF, KH, PEN, TXP, BANK, CS |
| **Illustrative timeline visual** | Out of scope for the knowledge base: needs `docs/method.md` and `tests/cases/`. | — |

**Tier-2 "not covered yet" page.** Each tier-2 file ends with a graduation status. *2026-10-24 (release-5 tier-2 pass):* ranking, blockers, browser to-dos and two draft records in `scratchpad/reports/r5-tier2.md`; eight rules added (INS-25, INS-26, TXA-27, TXA-28, TX2-17 to TX2-20).

| Instrument | Blocked by |
|---|---|
| Savings policies | Policy gains taxed at 25% real or 15% nominal (TXA OQ1; *2026-10-24:* narrowed, two insurers state 25% real; *2026-10-25:* the real base is the law's, TXA-28 general; still open: whether 15% can reach a policy that is not profit-sharing); ~~whether moving to another insurer is a tax event (TXA OQ3)~~ closed 2026-10-25: it is (TXA-28); ~~no regulatory fee cap found (INS OQ2)~~ closed 2026-10-24: 1% a year, 2% with approval (INS-25); deposit fees' basis open (INS OQ16); the legal definition of a profit-sharing policy (INS OQ1, *2026-10-24:* narrowed: the chain ends in the 1998 report regulations, marked repealed, so the current home of the definition is a browser to-do) |
| Executive insurance | How growth inside the policy is taxed (TXA OQ6); the meaning of the issue-period cohorts; guaranteed annuity factors (INS OQ9, OQ10). *2026-10-24:* unchanged; last in the graduation ranking |
| Amendment 190 | ~~Legal source of the age ceilings (TXA OQ9) and the commutation conditions (TXA OQ10)~~ closed 2026-10-26: the Tax Authority's ruling 6849/15 (TXA-30); the interplay with the exempt commutation (TXA OQ11) closed 2026-10-26 (circular 2/2013 s.5.2.5, TXA-19); still open: National Insurance on the annuity and the commuted sum (TXA OQ14) and surtax (TXA OQ15), both narrowed 2026-10-26 and now the G-24 blockers; F1 |
| FX and structured deposits | Classifying a structured payout for tax (TX2 OQ5; *2026-10-24:* derived per payout type from the partial-linkage regulations, TX2-18); the legal basis of 25% withholding on FX deposits (TX2 OQ2, wording confirmed, still open); ~~a falling currency (TX2 OQ1)~~ closed 2026-10-22 by TXI-25, struck 2026-10-26; who supervises non-bank FX providers (FXD OQ8). The olim orders are read (TX2-19; TX2 OQ3 closed 2026-10-24 except a check of the 2026 wording). FX deposits rank second for graduation; draft record in the scratch report |
| Corporate bonds | The ISA registers of rating agencies and trustees (CORP OQ1, OQ2; ISA site is JavaScript, browser to-do); default-loss timing (TX2 OQ6). *2026-10-24:* acceleration quorum read verbatim (CORP-07); third in the graduation ranking, the normal held-to-maturity case computes as a government bond |
| Managed and robo portfolios | ~~Named licensees (MGD OQ1)~~ closed by MGD-23; the ISA directives seen only in secondary sources (MGD OQ2; narrowed 2026-10-26: the technology directive is read in the ISA's file, MGD-21; the needs-clarification directive is not); ~~VAT on fees (MGD OQ15)~~ closed 2026-10-24 (TX2-17; the same question as TX2 OQ12, closed with it). *2026-10-24:* closest to graduation; the tax side computes (TX2-15, TX2-17); what remains is a retail-offer pass over the licensees, an entered or ISA-average fee (D4) and two method formulas; draft record in the scratch report |
| REITs | The current REIT list, which is secondary only (RG OQ4); the per-distribution source split (RG OQ5); NII on pass-through income (TX2 OQ8). *2026-10-24:* withholding practice recorded from Reit 1 (TX2-20, institution; since the 2026-10-25 scope pass the withholding rates by law are TX2-20 and Reit 1's statement and example are TX2-21), which narrows TX2 OQ7 (the ministerial rate) but does not close it; fourth in the ranking |
| Gold via funds | Gold fund names and fees, secondary only (RG-16, RG OQ8; the managers' lists load by script, browser to-do on Maya); tax on foreign gold ETCs and US trusts (TX2 OQ10). *2026-10-24:* fifth in the ranking; an exposure plus fund records, not a wrapper |

---

## 3. Section 3.2, goal comparison (R2)

- **Tax rules per tier-1 wrapper are now mostly primary.** The exceptions are in the §2 table above.
- **The idle-cash preset's blocker (tax Q15) is closed at law level.** Each money-market fund's tax track still comes from its prospectus (F1).
- **The constraint "must not need an annual tax return" can't be evaluated yet.** It is still unsettled whether someone with a foreign-broker account who pays advance tax must file a return (TXG OQ4). *2026-10-26 (open-question hunt):* the Tax Authority treats a seller at a foreign broker as someone who files (form 1322, the refund guide; TXG-20); whether the 30 April foreign-income advance can replace the return is still open.
- **National Insurance and health contributions on passive income are only partly sourced** (TXG OQ2, tax Q10).
- ~~**For people aged 60+, how the lower rates reach gains already withheld at a flat 25% is open** (TXS OQ6, TXG OQ7).~~ Closed 2026-10-26: the bank withholds the full rate whatever the age; the excess comes back through a return or form 0135, or the assessing officer cuts the withholding in writing (reg. 11 of both withholding regulations; TXS-23, TXG-08).
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
  - ~~the CMA's official list of standard tracks (CAT OQ9)~~ closed 2026-10-26: list 2024-1471 on gov.il (CAT-23, CAT-15).
- **Provider tariffs.** BRK lists where each provider publishes its tariff, except Meitav Trade, One Zero and Interactive Israel (BRK OQ18, OQ19). The tariff figures themselves are data-researcher work. *2026-10-24:* One Zero's full tariff is now located and read (BRK-38); Yahav's and Bank of Jerusalem's securities parts too (BRK-30); Meitav Trade still has no published tariff (OQ18 open). Fund variants: the Maya list and TASE's foreign-funds list hold 2,009 and 40 funds (CAT-42, ETF-43) and are not republished (CAT-43); the site shows counts and links.
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
  - ~~savings-policy caps (INS OQ2)~~ closed 2026-10-24 (INS-25);
  - how long a fee discount must last: the CMA circular says 5 years, bylaws say 2 (see §9);
  - ~~the rule for pension fees after leaving an employer (PEN OQ10)~~ closed 2026-10-25 (PF-13 to PF-15);
  - ~~whether non-bank members may charge custody on makam and money-market funds (BRK OQ11)~~ closed 2026-10-26: banks may not (BRK-17); no rule limits a non-bank member, most of which are investment marketers outside the distribution-fee regulations (BRK-52).

## 7. Sections 3.6 holdings review and 3.7 switching playbook (R3, R4)

- **Holdings review.** Track classification (CAT) and transfer rules (PF, SW) are covered. One gap blocks the child-savings check in 3.6: no source shows a parent whether their child's track was chosen by them or assigned by default (CS OQ10; narrowed 2026-10-23: the statement template has no such field, CS-27; NII's personal-information service was not checked, CS-26). *2026-10-23:* "where to find it on the statement" is sourced for provident, study-fund, gemel lehashkaa and pension accounts (PF-34 to PF-38), child savings (CS-27) and bank deposits and securities (BANK-32); consolidation seniority is settled (SW-39: transferred money keeps its payment dates; two study funds merge into one account only when both are withdrawable), pension-to-pension carry-over is sourced and its tax neutrality narrowed but still not stated by an official text (SW-40, SW OQ8).
- **Switching playbook.** SW has 44 rules and an ordered step list for all 9 wrappers. The CMA transfer circular was read in full, from a third-party host; *2026-10-24:* the CMA's own copy on gov.il is identical (SW-41), the clearing-house channel and the regulator's deferral power are sourced (SW-42), directive 448 version 4 changes disclosure only (SW-43, SW OQ15 closed), and the clearing house's price cap for a saver is sourced (SW-44, SW OQ5 price side closed, PF OQ6 narrowed). Still open:
  - whether any retention rule exists for provident products (SW OQ3);
  - whether a quoted fee binds the institution (SW OQ4);
  - ~~the clearing house's price for a direct request (SW OQ5)~~ closed 2026-10-24 (SW-44);
  - ~~who must notify the employer after a transfer (SW OQ6)~~ closed 2026-10-26: the receiving fund, within 10 business days (SW-10);
  - whether the transfer circular governs kupat gemel lehashkaa (SW OQ2);
  - moving securities to or from a foreign broker (SW OQ12);
  - tax on moving securities in kind between your own accounts, which only institutions describe (SW OQ11);
  - how to remove an agent already attached to an account (SW OQ16).

## 8. Section 3.10, catalogue of every option (was "catalogue of every option" until 2026-10-23)

- **CMA side (R1).** The catalogue is covered. The fee fields can now be shown (browser pass 4, 2026-10-23): both portals print them in percent and label them "לשנת 2025" / "בשנת 2025", the latest completed calendar year (CAT-35, CAT-36); the CMA's definition of the same-named member-report figure is the rate actually charged from all members, after discounts (CAT-37); pension fees are per fund (CAT-39); 68 gemel tracks and 6 pension tracks have no value because they are younger than a full calendar year, with 13 unexplained exceptions (CAT-40, OQ22). The averaging weight is still not stated by the CMA (OQ2, OQ23); the site should say "ממוצע" and the year, not "משוקלל". Your Meitav "general twice" question:
  - In Gemel-Net, Meitav's kupat gemel lehashkaa (fund 7857) has 16 tracks and only one "כללי" (track 7978, the default).
  - The duplicate you saw may be "מיטב קידס", which is a kupat gemel lehashkaa opened in a child's name (CAT OQ13). It can't be settled without the app's own screens, and since 2026-10-23 it does not need to be: the site lists all 16 tracks and every Meitav product in the data, so whatever the app's second "כללי" is, it is covered (product.md D17).
  - Altshuler has the same pattern: "כללי" alongside "כללי ב'", which has been closed to new members since 2016 (KH).
- **Bank side (R4).** BPN catalogues 286 names from 10 bank brands. Gaps:
  - no names yet for Bank of Jerusalem, One Zero or Esh Israel (BPN OQ5; Discount's names, BPN OQ1, closed 2026-10-22 by BPN-12);
  - the same name means different products at different banks (BPN-05);
  - several abbreviations are not explained anywhere read: פק"מ, לל"ת, מני"ע (BPN OQ8).
- **N6 is closed.** Directive 447 requires on-screen display only. No bank publishes its rates as a data file. The only machine-readable per-bank series is the Bank of Israel's EDGE INTEREST_DASH: monthly, per bank rather than per product, and its series codes are not yet decoded (BPN OQ16).

## 9. Contradictions between sources still to resolve

| Topic | Conflict | Files |
|---|---|---|
| ~~Fee-discount minimum period~~ | Resolved 2026-10-25: 5 years; the circular covers kupat gemel lehashkaa managers and the bylaws' 2 years is the replaced circular 2012-9-22 (PF-13, KGL-16, KGL-30) | PF OQ2 and KGL OQ8 closed (struck 2026-10-26) |
| ~~Employee one-third share in a study fund~~ | Resolved 2026-10-25: Income Tax Rules rule 19(ב2)(1), a condition of the fund's tax approval (KH-05) | KH OQ1 closed (struck 2026-10-26) |
| s.9(18ב) | The fetch tool says repealed; the 2025 guide p.87 lists it; TXK reads it as a deposit window that closed in 2017 | TXP, TXK OQ6 |
| Makam tax rate | 15% by the law and reg. 5(א); the 2024 and 2025 guides' 20% line matches no rate in the law (TXI-11); the sale split is still open | TXI OQ3 (narrowed 2026-10-26) |
| ~~Child-savings grant at 18~~ | Resolved 2026-10-26: the 2016 Economic Efficiency Law s.163 applies the new s.74ג only to children born from 1.1.2017, so the old grant stays for earlier cohorts (CS-13) | CS OQ5 closed |
| ~~2025 average wage~~ | Resolved 2026-10-25: the 2025 booklet applies 13,316 to the employer and severance ceilings and 12,536 to the beneficiary-member test (TXP-03, TXP-10) | TXP OQ4 closed (struck 2026-10-26) |
| Distributions from a foreign fund on TASE | The 2019 Tax Authority letter says no loss offset, which seems to conflict with s.92(a)(4) | TXF OQ9 |
| Start of the pension return guarantee | The law says 1.7.2022; a Wikisource note says 1.10.2022 | REG OQ18 |
| Annual-return deadline for 2025 | 30.4.2026 in the guide; 31.3.2026 in the discovery report | TXG OQ11 |
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
| Full TASE member list: 8 non-bank members, adding Blink Fintech and UBS; One Zero is a member | BRK-32 | BRK OQ1, REG OQ1 |
| TASE publishes **average fees actually charged** per member, including non-bank brokers, by size band | BRK-33 | BRK OQ8, F2 |
| One Zero's tariff, deposit terms and 447A page | BRK-34 | BRK OQ19 |
| ISA register totals; 129 portfolio-management companies by name and licence number | REG-30, MGD-23 | REG OQ2, MGD OQ1 (names) |
| Meitav's portfolio-management company holds licence 322 | REG-31 | REG OQ15 (in part) |
| Gemel-Net yields are nominal and gross of management fees (CMA page) | CAT-32 | CAT OQ1 (in part) |
| The public mutual-fund list is on Maya (2,009 open-end funds, with filters) | CAT-33 | CAT OQ14 |
| Fixing the annuity exemption: form 161ד, filed through the Tax Authority personal area | TXP-28 | TXP OQ1 |
| Leaving a job: the new form 161 (since 1.1.2024), its parts, and the employee's four choices per grant (annuity continuity, severance continuity, exempt grant, taxable grant) | TXP-29, TXP-30 | TXP OQ2 |
| NII's official child-savings fund list (10 managers, including Clal) and its 5 tracks | CS-24 | CS OQ1, OQ2 |
| Bank vs provident child savings: principal guarantee, transfer limits, fees to 21 | CS-25 | CS OQ14 (conflict noted) |
| The CMA lost-accounts search ("הר הכסף" route) | PF-32 | PF OQ7 |
| Makam: monthly issue, 12 series, individuals can bid through their account, BoI calls it risk-free | GOV-22 | GOV OQ1, OQ2 (in part), OQ9 |
| Makam issue schedule to February 2027, about one year per series | GOV-23 | GOV OQ1, OQ3 |
| "פק"מ" = "פיקדון קצר מועד" (institution source) | BANK-30 | BANK OQ13, BPN OQ8 (in part) |
| Bank of Jerusalem and One Zero product names | BPN-11 | BPN OQ5 (in part) |

**What the browser pass did not settle:**

- **Chrome machine-translated some sites into English** (TASE, Maya, Discount, one gov.il page). Fixed after you switched Google Translate off; see browser pass 2.
- **The TASE fee calculator doesn't show its data period** (BRK-33).
- **The makam tax rate is 15% by law** (s.125ג(ג)(1), reg. 5(א) of the 2005 withholding regulations; TXI-11). The Tax Authority guide's 20% line, printed in 2024 and 2025, matches no rate in the law; only the split of a sale before redemption is open (TXI OQ3, narrowed 2026-10-26).

### Browser pass 2 (Google Translate off), 2026-10-22

| Closed or narrowed | New rule | Was |
|---|---|---|
| Full exposure-code scale (0 to 6, A to F) and the "(!)" mark | MF-54 | MF OQ9, ETF OQ9 |
| Each fund's tax status is on Maya; 2 of 73 money-market funds are **taxable** (Harel dollar 5103403, Migdal monthly-distributing shekel 5137559) | TXS-24 (the count), TXS-26 (the two funds, split 2026-10-26) | TXS OQ1, F1 (narrowed) |
| Maya's fund export and its fields (fees, tax status, trustee, distribution-fee class) | CAT-34 | CAT OQ14 (completed) |
| 40 foreign funds on TASE (iShares and Invesco), traded in shekels | ETF-32 | ETF OQ4, OQ16 (in part) |
| Discount's 47 named deposit products | BPN-12 | BPN OQ1 |
| Mercantile's deposit names (and its double spelling of the same products) | BPN-13 | BPN (Mercantile) |
| Form 161 part B: annuity continuity, severance continuity, exempt grant, taxable grant, and the default | TXP-30 | TXP OQ2 |
| IB Ireland protection: Irish scheme up to EUR 20,000, SIPC via IBLLC up to USD 500,000 | BRK-35 | BRK OQ7 |
| Interactive Israel says it withholds Israeli tax via HYBRID | BRK-36 | BRK OQ16 (in part) |
| Kol Zchut lead: the "one third" study-fund rule is a tax condition (employer not more than 3× employee) | KH OQ1 note | KH OQ1 / §9 conflict (lead) |

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
| Pension fees are per fund; every track of a fund carries the same pair | CAT-39 | CAT OQ15 |
| Empty means not reported (young tracks), not zero; one negative deposit fee | CAT-40 | new |
| Yields, Sharpe and liquidity fields equal the portal display; trailing windows end at the report month | CAT-41 | CAT OQ1 (in part) |

**Not settled:** how the published average is weighted and which report feeds it (CAT OQ2, OQ23); 13 tracks opened in 2024 without a value (OQ22); whether portal yields are after direct expenses (CAT-41). Gemel-Net's "הסברים" pages are images of an academic paper on risk measures, not read in full (OQ3).

The Maya export file was downloaded once through the browser, into your Downloads folder (`mutual-funds.csv`). Later files were fetched in WSL instead.

### Browser pass 5 (release 4 research), 2026-10-24

| Found | Rule | Closes |
|---|---|---|
| Bank Yahav's full tariff 2.2026 (PDF and XLSX, 'נכון ליום: 01/10/2026') and its 16/09/2026 change notice; snapshot `yahav@2026-10-24` (14 lines) | BRK-30 | data gap O12 (Yahav) |
| Bank of Jerusalem's individuals tariff (PDF and XLSX per part; part 4 printed 'בתוקף מתאריך : 06/02/20217', part 5 20/06/2021); snapshot `jerusalem@2026-10-24` (13 lines) | BRK-30 | O12 (Jerusalem) |
| One Zero's full tariff (26.7.2026): TA-125 shares, Israeli funds and US securities only; zero custody; one rate for clerk and internet; plan ONE 49 NIS a month with a 66% trade benefit; snapshot `one-zero@2026-10-24` (11 lines) | BRK-38 | O12 (One Zero), BRK OQ19 (figures) |
| Meitav Trade: still no tariff; the four-tracks page gives words only | BRK-30, OQ18 | — |
| Maya list: 2,009 funds; counts by top classification (two heading trees, 1,163 active and 846 tracking/ETF) and tax status (1,986 / 21 / 2); the by-hand export path | CAT-42 | CAT-33, CAT-34 refresh |
| TASE terms (August 2026): no republishing without written consent; limited quotation with a link only on www.tase.co.il; no databases | CAT-43 | product dependency 7 (fund lists: not shipped) |
| TASE foreign-funds list: 40 funds, 29 equity, 11 bond, as of 23/10/2026 | ETF-43 | ETF-32 refresh |
| TASE Data Hub / Data Store: licence by use (internal or distribution), mutual-fund products priced 797.5 to 2,016 NIS, free products only at checkout, site terms apply | BRK-39 | discovery O13 |
| The CMA's own copy of circular 2017-9-17 (gov.il) is the text read; deadlines verbatim; later CMA circulars cite 2016-9-11 | SW-41 | SW OQ1 (narrowed) |
| Transfer information passes through the clearing house since 23.2.2020 (ממשק ניוד); the Commissioner may defer the ten-day deadline by up to twenty business days | SW-42 | PF OQ6 (channel) |
| Directive 448 version 4 (11/25, circular 2833): disclosure sections 16א and 19א only; start by 1.3.2026 | SW-43 | SW OQ15 |
| Clearing-house payment circular 2026-10-6: a saver's one-time all-institutions request capped at NIS 11 from 1.1.2027 | SW-44 | SW OQ5 (price), PF OQ6 (narrowed) |

**Not done:** the ISA and CMA licensee registers (REG OQ3, task item 4); the clearing house's current (2022) price list and the operator's own price page (rendered no text); the CMA's regulation collector for amendments to the transfer circular (OQ1); the 2026-9-3 circular's deferred dates. One Zero's PDF was fetched inside the Chrome tab (the host returns 403 to curl) and its one-glyph-per-letter text layer re-joined by hand; the Maya counts came from the list page's own filter requests, one heading at a time.
