# Coverage: what in `docs/product.md` the knowledge base does not cover yet

Written 2026-10-22, after the 29 topic files in this folder were finished and reviewed.
The knowledge base holds 775 rules and about 510 open questions. Every rule has a link and a
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
2. **Some sources can't be opened by a script.** A browser pass through your Chrome on 2026-10-22 got past most of these (§12): TASE, the ISA register, hly.gov.il, gov.il service pages, Bank of Israel pages, Bank of Jerusalem and One Zero all opened. Still not done from this list: Kol Zchut (opens, not yet used), S&P Maalot, the CMA fslproviders register, circular 7/2003, Accountant General bond terms, and Mercantile's rate table. Discount's rate table opened but was machine-translated. The original list:
   - **gov.il landing pages (403):** Har HaKesef, CMA public enquiries, Tax Authority forms 161/161d,
     Accountant General bond terms, Tax Authority circular 7/2003. Note that gov.il *BlobFolder* PDFs
     do open.
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
   - the annual statements of your own funds (PF OQ5, CS OQ11);
   - product names that banking apps show only after login (BPN OQ20).

---

## 1. Decisions that need the founder (product.md section 1)

The research raised these. None was decided here; product.md was not edited.

| # | Issue | Where it came from | What it changes |
|---|---|---|---|
| F1 | **D10 has no policy for institution-strength rules** (a fund's bylaw, prospectus or form). D10 covers primary, secondary and open sources only. | TXA (Amendment 190 conditions TXA-22 to TXA-24); also TXS-12/13 (a money-market fund's tax track comes from its prospectus), KGL lump-sum withholding at 25%, many KH and PEN rules | Whether these rules compute, compute with a label, or block. Narrowed in browser pass 2: TASE's Maya publishes each fund's tax status (TXS-24), so the money-market case no longer rests on prospectuses alone. The rest of F1 stands. |
| F2 | **D4 is wrong for non-bank brokers** (confirmed in the browser pass, §12). TASE's s.45טז calculator shows average fees actually charged by every member, banks and non-bank brokers alike, by portfolio-size band and security type. | BRK-33 | D4's "no average exists for non-bank brokers" should be corrected, and 3.4's provider table can show this reference for them. |
| F3 | **The roadmap R2 risk is partly wrong.** The employee's s.45A/47 ceilings are CPI-linked and frozen for 2025–2027; they are not tied to the average wage. The employer, severance, 16% beneficiary-member and self-employed ceilings *are* tied to the average wage. | TXP (see its summary) | The wording of the roadmap R2 risk and of tax-landscape §3.1 and §10 item 4. |
| F4 | **Accumulating foreign funds (tax Q1).** No rule taxes a minority holder on a foreign fund's undistributed income: none in the Ordinance (checked section by section), not CFC s.75B, and nothing like the US PFIC rule (Q19). But no Tax Authority statement confirms tax is due only on sale either. | TXF OQ1, OQ2 | Under D10 this variant stays blocked in 3.4 unless you accept the reading or a source appears. |
| F5 | **61 new dimensions were proposed** across files, some overlapping (for example `default-allocation`, `default-assignment`, `default-track`). Examples: `fund-tax-track`, `estate-situs`, `market-price-exit`, `rate-reset`, `surtax`, `social-contributions`, `threshold-drift`, `dispute-channel`, `investment-restrictions`, `self-directed-risk`, `default-assignment`, `employer-dependence`, `actuarial-adjustment`, `death-and-beneficiaries`, `annuity-vs-lump-sum`, `order-timing`, `product-marking`, `fee-performance`, `fund-closure-merger`, `fx-spread`, `conditional-return`, `issuer-conflict`, `value-date`, `conflict-of-interest`, `fee-fund-underlying`, `rate-type-anchor`, `auto-renewal`, `benefit-expiry`. | "Proposed dimensions" in each file | product.md 3.3 sets the minimum list. Adding to `data/dimensions/` is your call. **Answered 2026-10-23: none adopted for release 1** (chosen by Claude at the founder's request); the 26 rows stand. |
| F6 | **Structured bonds and bank-issued structured notes** (איגרות חוב מובנות; NIS 27 bn raised on TASE in 2025) are in no tier and no file. D2 lists only structured *deposits*. | CORP findings; TX2 OQ16 | Whether to add them to the tier-2 list. |
| F7 | **Payment-wallet balances** (for example LAYA, which holds an ISA payment-services licence) are a way to hold money that D2 does not mention. | FXD findings | Whether they are in scope at all. |
| F8 | **Your age-60 example now has an answer**, at primary strength for the law (TXK-12). A lump sum is taxed the same before and after 60. At 60 or later the balance can move to an annuity fund, and the resulting annuity is fully exempt. Whether that money can later be commuted to a lump sum is open (TXK OQ4). | TXK | Nothing to decide; this confirms or corrects your interview claim. |

---

## 2. Section 3.1, instrument guide: gaps per tier-1 page

The guide page has a fixed structure. These are the parts not yet sourced for each wrapper or exposure.

| Page | Not covered yet | Where |
|---|---|---|
| **Current account, deposits, savings plans** | <ul><li>What Bank of Israel supervision actually protects if a bank fails (BANK OQ8; REG OQ10, OQ13)</li><li>How breaking a savings plan is priced, and whether each monthly deposit has its own exit points (BANK OQ12, partly answered for Hapoalim in BPN)</li><li>Whether 447 rates for CPI-linked deposits are real or nominal (BANK OQ17)</li><li>The official definition of prime (BANK OQ14)</li><li>Tax: prime-linked deposits fall in the 15% bucket only by the agent's reading (TXI-04); breaking a deposit early (TXI OQ14); deflation on CPI-linked deposits (TXI OQ6)</li><li>Which banks count as "small" and are exempt from the account-free deposit rule (BANK OQ5)</li></ul> | BANK, TXI |
| **Money-market funds** | <ul><li>The final ISA money-market directive was read only as a draft (MF OQ1)</li><li>The A447 bank-display rules in MF still cite the draft; the final text is in BANK-15 and the rules are marked for re-check</li><li>Order cut-off times, and whether units can be bought or redeemed on Fridays since TASE moved to Monday–Friday on 5.1.2026 (MF OQ3)</li><li>How many days until redemption cash is usable (MF OQ4)</li><li>Tax: Q15 is closed, but only at fund level. Each fund's "מסלול המס" must be read from its prospectus, and whether any taxable money-market fund exists is unknown (TXS OQ1; see F1)</li></ul> | MF, TXS |
| **Makam and government bonds** | <ul><li>Whether and how an individual can bid in a makam or bond auction, with what minimum and fee (GOV OQ2, OQ8)</li><li>The Shahar series regulations (GOV OQ4)</li><li>Which regulation governs Gilon (GOV OQ5)</li><li>Per-series deflation floors (GOV OQ6)</li><li>The official risk wording (GOV OQ9)</li><li>Tax: makam at 20% (2025 guide) or 15% (s.125C(c)) conflict (TXI OQ3); accrued interest when buying between coupon dates (TXI OQ5)</li></ul> | GOV, TXI |
| **ETFs and index funds** (Israeli, foreign on TASE, foreign-domiciled) | <ul><li>Accumulating foreign funds (F4)</li><li>Whether Ireland withholds on an Irish fund's distributions (TXF OQ6)</li><li>EU PRIIPs/KID limits for Israelis at EU brokers (ETF OQ11)</li><li>The full lists of Israeli ETF issuers and of foreign funds registered in Israel (ETF OQ3, OQ4)</li><li>The scale of the exposure codes in fund names (ETF OQ9)</li><li>Spread obligations of market makers (ETF OQ2)</li><li>Foreign-currency cash at a foreign broker (TXF OQ4)</li><li>Whether Israeli banks deduct foreign tax already withheld (TXF OQ3)</li></ul> | ETF, TXF, BRK |
| **Active mutual funds** | <ul><li>The current ISA list of classification headings and naming rules (MF OQ8, OQ9)</li><li>How many funds charge loads (MF OQ7)</li></ul> | MF |
| **Brokerage account** (the wrapper) | <ul><li>**No statute found that segregates a non-bank TASE member's client assets** (REG OQ9, BRK OQ3); protection rests on brokers' own statements</li><li>Whether non-bank members and foreign brokers withhold Israeli tax (BRK OQ16)</li><li>Direct IBKR and eToro accounts for Israeli residents (BRK OQ9)</li><li>~~The 3 non-bank TASE members not yet named~~ closed in the browser pass (BRK-32)</li></ul> | BRK, REG |
| **Kupat gemel lehashkaa** | <ul><li>~~The official 2026 ceiling~~ confirmed by CBS calculation (KGL-24)</li><li>Tax: the legal rate on a lump sum, 25% of real gain or 15% nominal, and which provision exempts the inflation part (TXK OQ2); the current withholding regulation (TXK OQ3)</li><li>Whether an employer may deposit (KGL OQ5)</li><li>Eligibility for 5 of the 6 sector funds (KGL OQ11)</li></ul> | KGL, TXK |
| **Keren hishtalmut** | <ul><li>The legal source of the "employee pays at least one third" rule (KH OQ1; conflicts with TXH, see §9)</li><li>Loan terms (KH OQ4)</li><li>Extension orders that require a study fund (KH OQ3)</li><li>Tax on gains from deposits above the ceiling, real or nominal (TXH OQ1)</li><li>The 2027 budget proposal to narrow the exemption (TXH OQ2, tax Q18), to re-check after the elections</li></ul> | KH, TXH |
| **Pension fund** | <ul><li>Insurance cost tables and annuity conversion factors (PEN OQ7)</li><li>Whether the 5.15% guaranteed return is CPI-linked (PEN OQ8)</li><li>The fee after leaving an employer (PEN OQ10)</li><li>The current form for fixing the annuity exemption (TXP OQ1)</li><li>The taxable base of an early withdrawal (TXP OQ3)</li><li>National Insurance's own 2026 average-wage figure (PEN OQ5)</li></ul> | PEN, TXP |
| **Provident fund for annuity** | <ul><li>Who accepts provident money for an annuity, and on what conversion factors (PEN OQ19)</li><li>The default track (PEN OQ18)</li></ul> | PEN |
| **Child savings** | <ul><li>Tax rate, base and withholding on gains at withdrawal (TXK OQ1, Q4 partly closed)</li><li>The legal basis of the age-18 grant: the NII site says it exists, but s.74ג(א) is marked repealed (CS OQ5)</li><li>How today's default fund is picked (CS OQ4)</li><li>The fields of the annual statement (CS OQ11)</li><li>Clal's 4 tracks, which do not appear in NII's list (CS OQ2)</li></ul> | CS, TXK |
| **IRA** | <ul><li>The official consolidated regulations, and the status of the 2025 draft amendment (IRA OQ1, OQ2)</li><li>The fee cap after the 2017 amendment (IRA OQ3; PF reads reg. 4 at 2%)</li><li>Protection if the manager or broker fails (IRA OQ11)</li><li>Whether active trading inside an IRA can become business income (TXK OQ8)</li></ul> | IRA, TXK |
| **Who offers it** (all pages) | The ISA register and the full TASE member list were read in the browser pass (§12); the CMA licensee register is still unread (REG OQ3). The bank list is read: data.gov.il dataset 375, 17 entries. | REG |
| **Terms matched to statements** (`data/terms/`) | <ul><li>Payslip line labels have no official source</li><li>The uniform annual and quarterly statement format was not reached (PF OQ5)</li></ul> | PF, KH, PEN, TXP |
| **Illustrative timeline visual** | Out of scope for the knowledge base: needs `docs/method.md` and `tests/cases/`. | — |

**Tier-2 "not covered yet" page.** Each tier-2 file ends with a graduation status:

| Instrument | Blocked by |
|---|---|
| Savings policies | Policy gains taxed at 25% real or 15% nominal (TXA OQ1); whether moving to another insurer is a tax event (TXA OQ3); no regulatory fee cap found (INS OQ2) |
| Executive insurance | How growth inside the policy is taxed (TXA OQ6); the meaning of the issue-period cohorts; guaranteed annuity factors (INS OQ9, OQ10) |
| Amendment 190 | Legal source of the age ceilings (TXA OQ9); the commutation conditions (TXA OQ10, OQ11); F1 |
| FX and structured deposits | Classifying a structured payout for tax (TX2 OQ5); the legal basis of 25% withholding on FX deposits (TX2 OQ2); who supervises non-bank FX providers (FXD OQ8) |
| Corporate bonds | The ISA registers of rating agencies and trustees (CORP OQ1, OQ2); default-loss timing (TX2 OQ6) |
| Managed and robo portfolios | Named licensees (MGD OQ1); the ISA directives seen only in secondary sources (MGD OQ2) |
| REITs | The current REIT list, which is secondary only (RG OQ4) |
| Gold via funds | Gold fund names and fees, secondary only (RG-16, RG OQ8); tax on foreign gold ETCs and US trusts (TX2 OQ10) |

---

## 3. Section 3.2, goal comparison (R2)

- **Tax rules per tier-1 wrapper are now mostly primary.** The exceptions are in the §2 table above.
- **The idle-cash preset's blocker (tax Q15) is closed at law level.** Each money-market fund's tax track still comes from its prospectus (F1).
- **The constraint "must not need an annual tax return" can't be evaluated yet.** It is still unsettled whether someone with a foreign-broker account who pays advance tax must file a return (TXG OQ4).
- **National Insurance and health contributions on passive income are only partly sourced** (TXG OQ2, tax Q10).
- **For people aged 60+, how the lower rates reach gains already withheld at a flat 25% is open** (TXS OQ6, TXG OQ7).
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
  - which periods the fee fields average, and their units (CAT OQ2; discovery O11 partly closed);
  - the meaning of the risk fields (CAT OQ3);
  - the CMA's official list of standard tracks (CAT OQ9).
- **Provider tariffs.** BRK lists where each provider publishes its tariff, except Meitav Trade, One Zero and Interactive Israel (BRK OQ18, OQ19). The tariff figures themselves are data-researcher work.
- **Regulator averages.** These exist for:
  - banks (EDGE FEES_DASH);
  - portfolio managers (ISA report, MGD);
  - provident tracks (CMA).
  
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
  - savings-policy caps (INS OQ2);
  - how long a fee discount must last: the CMA circular says 5 years, bylaws say 2 (see §9);
  - the rule for pension fees after leaving an employer (PEN OQ10);
  - whether non-bank members may charge custody on makam and money-market funds (BRK OQ11). Banks may not.

## 7. Sections 3.6 holdings review and 3.7 switching playbook (R3, R4)

- **Holdings review.** Track classification (CAT) and transfer rules (PF, SW) are covered. One gap blocks the child-savings check in 3.6: no source shows a parent whether their child's track was chosen by them or assigned by default (CS OQ10).
- **Switching playbook.** SW has 38 rules and an ordered step list for all 9 wrappers. The CMA transfer circular was read in full, from a third-party host. Still open:
  - whether any retention rule exists for provident products (SW OQ3);
  - whether a quoted fee binds the institution (SW OQ4);
  - the clearing house's price for a direct request (SW OQ5);
  - who must notify the employer after a transfer (SW OQ6);
  - whether the transfer circular governs kupat gemel lehashkaa (SW OQ2);
  - moving securities to or from a foreign broker (SW OQ12);
  - tax on moving securities in kind between your own accounts, which only institutions describe (SW OQ11);
  - how to remove an agent already attached to an account (SW OQ16).

## 8. Section 3.10, catalogue of every option (was "catalogue of every option" until 2026-10-23)

- **CMA side (R1).** The catalogue is covered. Your Meitav "general twice" question:
  - In Gemel-Net, Meitav's kupat gemel lehashkaa (fund 7857) has 16 tracks and only one "כללי" (track 7978, the default).
  - The duplicate you saw may be "מיטב קידס", which is a kupat gemel lehashkaa opened in a child's name (CAT OQ13). It can't be settled without the app's own screens, and since 2026-10-23 it does not need to be: the site lists all 16 tracks and every Meitav product in the data, so whatever the app's second "כללי" is, it is covered (product.md D17).
  - Altshuler has the same pattern: "כללי" alongside "כללי ב'", which has been closed to new members since 2016 (KH).
- **Bank side (R4).** BPN catalogues 286 names from 10 bank brands. Gaps:
  - no names yet for Discount, Bank of Jerusalem, One Zero or Esh Israel (BPN OQ1, OQ5);
  - the same name means different products at different banks (BPN-05);
  - several abbreviations are not explained anywhere read: פק"מ, לל"ת, מני"ע (BPN OQ8).
- **N6 is closed.** Directive 447 requires on-screen display only. No bank publishes its rates as a data file. The only machine-readable per-bank series is the Bank of Israel's EDGE INTEREST_DASH: monthly, per bank rather than per product, and its series codes are not yet decoded (BPN OQ16).

## 9. Contradictions between sources still to resolve

| Topic | Conflict | Files |
|---|---|---|
| Fee-discount minimum period | CMA circular 2017-9-15 says 5 years; Altshuler and Harel bylaws say 2 years | PF OQ1–2, KGL OQ8, CS findings |
| Employee one-third share in a study fund | TXH cites Income Tax Rules 19(b2)(1); KH found only an upper bound in law | TXH, KH OQ1 |
| s.9(18ב) | The fetch tool says repealed; the 2025 guide p.87 lists it; TXK reads it as a deposit window that closed in 2017 | TXP, TXK OQ6 |
| Makam tax rate | 20% in the 2025 guide p.39 against 15% in s.125C(c) | TXI OQ3 |
| Child-savings grant at 18 | The NII site says it exists; s.74ג(א) is marked repealed | CS OQ5, TXK |
| 2025 average wage | Different figures in different provisions | TXP OQ4, TXA |
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
- **`data-landscape.md` 1.4:** the MoF `savingsplaninterest` dataset is stale (newest rows 02/09/2025).
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
- **The makam tax rate is not settled.** BoI's consumer page says 15%; a Tax Authority source is still needed (TXI OQ3).

### Browser pass 2 (Google Translate off), 2026-10-22

| Closed or narrowed | New rule | Was |
|---|---|---|
| Full exposure-code scale (0 to 6, A to F) and the "(!)" mark | MF-54 | MF OQ9, ETF OQ9 |
| Each fund's tax status is on Maya; 2 of 73 money-market funds are **taxable** (Harel dollar 5103403, Migdal monthly-distributing shekel 5137559) | TXS-24 | TXS OQ1, F1 (narrowed) |
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

The Maya export file was downloaded once through the browser, into your Downloads folder (`mutual-funds.csv`). Later files were fetched in WSL instead.
