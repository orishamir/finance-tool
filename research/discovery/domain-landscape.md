# Domain landscape: where an individual in Israel can save, invest or hold money

Discovery track: domain landscape. Written 2026-10-22.
Status: discovery input for `docs/product.md`. This file does not choose any product scope.

## How to read this file

- Every rule, term, cost and count has a source ID in square brackets, for example [S5]. Section 9 lists each source with its URL, what it is, how it was read, and the date checked. **All sources were checked on 2026-10-22** unless the register says otherwise.
- **Source quality labels** used in Section 9:
  - **Official**: a regulator, government body, or official open-data dataset.
  - **Institution**: the provider's own page or legal document (bylaws, fee table).
  - **Secondary**: press, comparison sites, Wikipedia. These are used only for leads or where nothing better was reachable, and are flagged where used.
  - **Extract**: the page itself was blocked, so the text comes from a search-engine extract. Treat it as unverified.
- Gaps are listed as open questions (Section 8). Nothing here was filled in from memory. Where a term is missing, the cell says "not found" or "open".
- Tax rules belong to a separate track. This file records deposit ceilings and liquidity rules (which the providers publish as product terms) but does **not** set out tax treatment, except to point to where a source mentions it.
- Hebrew terms are given once, in parentheses, so the next phase can match them to Hebrew UI labels.

---

## 1. Key findings

1. **Long-term savings are an oligopoly that can be fully enumerated from official data.** The Capital Market Authority (CMA) Gemel-Net open dataset (report period 2026-09) shows **15 managing companies offering provident products to the general public**. Pension-Net shows **9 pension fund managers**. Bituach-Net shows **8 insurers** reporting investment tracks for savings and executive policies [S1][S2][S3].
2. **The mutual-fund market is also fully enumerable.** The ISA's 2025 report names **15 fund managers** and **4 trustees**: 2,444 funds holding NIS 757 bn at end-2025. Five managers hold about 69% of assets [S6].
3. **Portfolio management can only be counted, not listed.** At end-2025 there were 131 licensed portfolio-management firms, 46 investment-marketing firms and 13 non-bank advisory firms [S7]. The ISA's searchable register that would name them could not be read (it needs JavaScript) [S11].
4. **Banks and TASE members are the weakest coverage.** The Bank of Israel register and the TASE member list are both behind bot protection or need JavaScript [S8][S10]. Bank coverage below uses a secondary source (Wikipedia, revised 27 Dec 2025) plus bank websites. It must be verified.
5. **Recent structural changes matter for any tool:**
   - Money-market funds grew to about NIS 179 bn across 66 funds at end-2025, including new "renewable" funds that publish an expected yield [S6].
   - Since April 2025, banks must publish deposit rates in a single uniform format, and must show money-market funds and makam next to deposits [S6][S24][S25].
   - Hedge funds in trust received permanent regulation in 2025 [S6].
   - Digital-asset (crypto) mutual funds and ETFs now exist on TASE [S6].
6. **Israel has no formal deposit-insurance scheme.** A private member's bill was tabled on 2 Feb 2026 [S26][S27]. The status of that bill is open.
7. **Foreign brokers sit outside Israeli supervision.** "Interactive Israel" is a brand of Mexem Ltd (CySEC licence 325/17) operating under an ISA section-49A permit. Its own site says it is **not supervised by the ISA** [S37]. The old domain interactive.co.il now redirects to an unrelated UX consultancy. A tool should not link to it.

---

## 2. Completeness: how coverage was established, and what could not be reached

### 2.1 Registers and official lists used

| # | Register / list | Owner | What it gave | Access result |
|---|---|---|---|---|
| R1 | **Gemel-Net** open dataset (provident funds, hishtalmut, gemel lehashkaa, child savings, central severance). Resource `a30dcbea-…`, records 2024 to date [S1] | CMA via data.gov.il | Every managing company, by fund classification and target population, for report period 202609. Also fund names, IRA funds and average fees. | **Read** through the CKAN API |
| R2 | **Pension-Net** open dataset. Resource `6d47d6b5-…` [S2] | CMA via data.gov.il | Every pension fund manager (new and general funds), period 202609 | **Read** |
| R3 | **Bituach-Net** open dataset (profit-sharing life policies: executive insurance and savings policies). Resource `c6c62cc7-…` [S3] | CMA via data.gov.il | Every insurer reporting policy investment tracks, period 202609 | **Read** |
| R4 | CMA list of all open datasets [S4] | data.gov.il | Confirms the three datasets above are the CMA's full set of fund-level datasets (plus asset lists and a transfer dataset) | **Read** |
| R5 | ISA, *Mutual fund activity in Israel 2024* [S5] and *2025* [S6] | ISA | All mutual fund managers and trustees, counts by fund type, average fees, money-market data | **Read**. The 2024 report came from isa.gov.il. The 2025 report came from a copy hosted by Funder, because the ISA site copy was not located. |
| R6 | ISA, *Activity of investment-licence companies 2025* [S7] | ISA | Counts of portfolio managers, marketers and advisers. Fees by portfolio size. Hosting. Custody. | **Read** (copy hosted by Funder) |
| R7 | Bank of Israel, list of banking corporations [S8] | BoI Banking Supervision | Would give the authoritative bank list. A search extract says an Excel version was "updated 11/05/2026". | **Blocked** (Radware bot check on every boi.org.il HTML page). BoI media PDFs are reachable [S28]. |
| R8 | TASE member list [S10] | TASE | Would give all banks and brokers that are exchange members | **Not readable**: the pages need JavaScript, and info.tase.co.il does not resolve in DNS |
| R9 | ISA licensee search (advisers, marketers, portfolio managers) [S11] | ISA | Would name all 131 portfolio managers | **Not readable** (JavaScript page) |
| R10 | CMA registry of financial service providers (`cmainfo.cma.gov.il/fslproviders`) [S12] | CMA | Would name P2P platforms, credit providers and crypto ("financial asset") licensees | **403** |
| R11 | gov.il CMA pages; Kol-Zchut | Government / NGO | Rules pages | **403**. gov.il "BlobFolder" PDFs are reachable [S29]. |
| R12 | National Insurance (Bituach Leumi) child-savings pages [S19] | NII | Rules of the child-savings programme | **Read** |

### 2.2 How each product family was made complete

| Family | Method | Confidence |
|---|---|---|
| Pension, provident, hishtalmut, gemel lehashkaa, child savings, IRA | Enumerated from R1 and R2: filtered to the latest period (202609), took distinct managers per classification, and separated "general population" funds from sector or employer funds | **High**. This is the regulator's own data. |
| Insurance savings policies, executive insurance | Enumerated from R3 | **High** for insurers that report investment tracks. Product-level split (executive insurance vs. savings policy) is not in the dataset. |
| Mutual funds, ETFs, tracking funds, money-market funds | Enumerated from R5 and R6 | **High** as of end-2025 |
| Portfolio managers, investment advisers, marketers | Counts only, from R6. Names only for firms whose own sites were checked. | **Low** for names |
| Banks | Secondary list (Wikipedia, revised 27 Dec 2025) plus bank websites. The official BoI list was unreachable. | **Medium-low** |
| Brokers and trading platforms | Institution sites, plus regulator reports for aggregate facts. TASE list unreachable. | **Medium-low** |
| P2P lending, crypto service providers, crowdfunding | Institution sites and press. Official registers unreachable. | **Low** |

### 2.3 What would close the gaps

Use a real browser, or ask the user to download them:

- the BoI Excel list of banking corporations;
- the TASE member list;
- the ISA licensee search export;
- the CMA financial-service-provider registry.

---

## 3. Regulators

| Regulator | Supervises (as stated by the source) | Source |
|---|---|---|
| **Capital Market, Insurance and Savings Authority** (רשות שוק ההון, ביטוח וחיסכון) | Insurers. Pension and provident managing companies. Non-bank credit companies. Savings-and-credit cooperatives (אגודות פיקדון ואשראי). Credit service providers. Financial intermediaries (insurance agencies, pension advisers). Since 2016, regulated financial service providers. Since 2019, free-loan (gemach) institutions. Also activity in financial assets, including crypto. | [S29] p.2 |
| **Israel Securities Authority** (רשות ניירות ערך) | Supervises mutual funds (via the Joint Investment Trust Law), investment advisers, marketers and portfolio managers, TASE, and trading platforms. Hedge funds in trust are supervised and operate under a prospectus. | [S5] p.2, [S6] p.2, [S7] p.2 |
| **Bank of Israel – Banking Supervision** (הפיקוח על הבנקים) | Banks: deposits, current accounts, disclosure directives 447 and A447 | [S24][S25] |
| **Bank of Israel (monetary)** | Issues makam (short-term bills) | [S39] (secondary, 2020) |
| **Ministry of Finance – Accountant General** | Issues government bonds | [S39] (secondary, 2020) |
| **National Insurance Institute** | Funds and administers "Savings for Every Child" | [S19] |
| **Foreign regulators** (CySEC, SEC/FINRA, Central Bank of Ireland) | Foreign brokers used by Israeli residents | [S37] |

---

## 4. Product landscape

Notes for all tables:

- "Who offers" points to the institution tables in Section 5.
- "Risk" gives only what a source states. Otherwise it says "not assessed".

### 4.1 Bank products

| Product | What it is (per source) | Who offers | Main terms found | Costs | Liquidity / lock-up | Minimum | Risk notes | Regulator | Sources |
|---|---|---|---|---|---|---|---|---|---|
| **Current account** (עו"ש) | Bank account | All banks (§5.4) | Since 1 Apr 2025, banks must publish interest offered on credit balances in a uniform consolidated format: website, app and branches (directive 447) | Fee schedules per bank: not collected (data track) | Liquid | Open | Not assessed | BoI | [S24] (extract) |
| **Bank deposit** (פיקדון) | Money left with a bank for a set term in return for interest. Terms from short (e.g. daily or weekly) to long. Fixed or variable rate; variable tracks the BoI rate. Some deposits have exit points, some do not. Linkage types exist. | All banks. Leumi also offers a deposit with no current account. | Rate publication duty since 1 Apr 2025 (directive 447) | Not found | Per deposit: exit points or none | Not found | Fixed-rate amount known in advance (BoI). **No formal deposit insurance in Israel.** | BoI | [S22] (extract), [S23] Leumi, [S24], [S26], [S27] |
| **Savings plan** (תוכנית חיסכון) | Recurring-deposit savings product | Banks, e.g. Leumi "חיסכון בטאצ'" | Not found | Not found | Not found | Not found | Not assessed | BoI | [S23] |
| **Foreign-currency account / deposit** (מט"ח) | FX account and deposits | Banks (Otzar Hahayal lists FX); investment houses (Altshuler "Financial Services": FX conversion, hedging, deposits; "LAYA" digital FX wallet) | Not found | Not found | Not found | Not found | Not assessed | BoI (banks); open for non-banks | [S30b][S32] |
| **Structured deposit** (פיקדון מובנה) | Non-tradable deposit plus an option-like instrument. Principal returned at maturity; the return can be zero. Cannot be broken early. | Banks (Otzar Hahayal lists them) | BoI advises full disclosure. Its article dates from 2003. | Not found | Locked to maturity | Not found | Return uncertain; no early exit (BoI) | BoI | [S28b] (extract), [S30b] |
| **"Money-market products" display** (מוצרי שוק הכסף) | Banks must show deposits, money-market funds and makam together. Tiered selection with filters by term and currency. No product may be favoured. | All banks | Directive A447, published 9 Apr 2025 jointly with the ISA | n/a | n/a | n/a | n/a | BoI and ISA | [S6] p.2, [S25] (extract) |

### 4.2 Capital-market vehicles (through banks and brokers)

| Product | What it is (per source) | Who offers | Main terms / facts | Costs found | Liquidity | Minimum | Risk notes | Regulator | Sources |
|---|---|---|---|---|---|---|---|---|---|
| **Shares (TASE and foreign)** | Listed equity | Banks, TASE-member brokers, foreign brokers (§5.5) | At end-2025, about 90% of non-institutional managed-portfolio securities were held at banks [S7] | Commissions and custody fees: **not verified from official price lists** (open) | Exchange hours | Broker-specific | Not assessed | ISA (TASE, members) | [S7] |
| **Government bonds** (אג"ח ממשלתיות) | Fixed shekel ("Shahar"), CPI-linked ("Galil"), floating ("Gilon"). Some designated series (Miron, Arad) are only for pension funds. | Issued by the Accountant General; traded on TASE | Tradable on TASE at market price | As for shares | Exchange | Broker-specific | Lower yield than corporate bonds (secondary) | MoF; ISA (exchange) | [S39] (secondary, 2020) |
| **Makam** (מק"ם) | Short-term bill, up to one year, issued by BoI | TASE | — | As for shares | Exchange | Broker-specific | Not assessed | BoI | [S39] (secondary, 2020) |
| **Corporate bonds** | Rated by Maalot and Midroog. Convertible or straight. | TASE | — | As for shares | Exchange | — | Default risk; higher yield than government bonds (secondary) | ISA | [S39] |
| **Mutual funds – active** (קרנות אקטיביות) | — | 15 fund managers (§5.3) | End-2025: 1,117 funds, NIS 232.7 bn | Avg mgmt fee 2025: **1.01%** | Daily creation and redemption with the manager | Not found | Not assessed | ISA | [S6] p.3–4, 13 |
| **Open-ended tracking funds** (קרנות מחקות) | Passive funds that track an index | Same | End-2025: 799 funds, NIS 128.9 bn | Avg mgmt fee 2025: **0.31%** | Mostly traded at the closing auction (63%) | Not found | Not assessed | ISA | [S6] p.3, 9, 13 |
| **ETFs** (קרנות סל) | Passive funds traded on exchange with a market maker | Same | End-2025: 465 funds, NIS 216.5 bn. About 80% of ETF and fund trading was against a market maker. | Avg mgmt fee 2025: **0.51%** | Continuous trading | Not found | Not assessed | ISA | [S6] p.3, 9, 13 |
| **Money-market funds** (קרנות כספיות) | ISA: high liquidity and relatively low risk; an alternative to bank deposits. New types since the October 2024 reform: daily MMFs and defined-period/renewable MMFs, which publish an expected yield and auto-renew. | Same | End-2025: 66 funds, NIS 178.9 bn. Shekel MMFs averaged 4.4% return in 2025, vs. an average BoI rate of 4.48%. | Avg mgmt fee 2025: **0.17%**. On renewable funds, the fee is deducted from the expected yield. | Daily (daily type) or monthly renewable | Not found | "Relatively low risk" (ISA) | ISA | [S5] p.2, 18; [S6] p.3, 13, 19 |
| **Foreign "registered" funds** (קרנות מגוירות) | Foreign UCITS/ICA funds registered to be offered in Israel | Foreign managers (e.g. BlackRock; Psagot is its operational representative) | End-2025: 46 funds (40 ETFs, 6 open), NIS 19.9 bn | Not found | ETFs on TASE; the public can only trade on exchange | Not found | Not assessed | ISA | [S6] p.3; [S5] p.20; [S34] |
| **Hedge funds in trust** (קרן גידור בנאמנות) | ISA-supervised hedge fund under a prospectus. Permanent regulation completed in 2025. | Fund managers and hosted portfolio managers | End-2025: 47 "alternative" funds, NIS 4.5 bn (includes one high-tech fund) | Avg fee 2025: **1.17%** (alternative) | Not found | Not found | Not assessed | ISA | [S6] p.2–3, 13; [S5] p.19 |
| **Digital-asset (crypto) funds** (נכסים דיגיטליים) | Fund category for digital assets | Several managers | End-2025 AUM: active NIS 0.02 bn, tracking 0.22 bn, ETF 0.03 bn. 2025 average return of digital-asset tracking funds: −19.36%. | 2025 avg fee: active 0.65%; tracking 0.25% (weighted); ETF 0.23% (weighted) | As for the fund type | Not found | Not assessed | ISA | [S6] p.5, 14, 16 |
| **Commodity funds** (סחורות; route for gold exposure) | Fund category for commodities | Several managers | End-2025 AUM: ETF NIS 0.65 bn, tracking 0.01 bn | 2025 weighted fee: ETF 1.49%; tracking 0.87% | As for the fund type | Not found | Not assessed | ISA | [S6] p.5, 14 |
| **Structured products / notes** | — | IBI lists "structured products" | Not found | Not found | Not found | Not found | Not assessed | Open | [S33] |
| **Derivatives (options, futures)** | Listed on TASE; also offered via foreign brokers | — | Out of scope (§7) | — | — | — | — | ISA | [S7] p.11 |

### 4.3 Long-term and tax-advantaged wrappers

Context for the 2026 figures:

- The 2026 ceilings below come from two managing companies' published tables. They agree with each other [S13][S14].
- Phoenix also confirms the gemel lehashkaa ceiling [S15].
- These are institution sources, not the Tax Authority's own publication. That publication was not reached (open question).

| Product | What it is | Who offers (general public) | Main terms found | Costs found | Liquidity / lock-up | Minimum | Regulator | Sources |
|---|---|---|---|---|---|---|---|---|
| **Comprehensive pension fund** (קרן פנסיה חדשה מקיפה) | Pension savings with insurance cover | 9 managers (§5.1) | 2026 maximum monthly deposit to a comprehensive fund: **NIS 5,645.29** (20.5% × 2 × average wage). Average wage 2026: **NIS 13,769**. Insured-salary ceiling for the comprehensive fund: NIS 41,307 (3× average wage). Mandatory minimum for the self-employed: 4.45% of income up to NIS 6,884.5, plus 12.55% on income from NIS 6,884.5 to NIS 13,769; maximum NIS 1,170.24 per month. | **Fee caps in the bylaws: up to 6% of contributions and up to 0.5% a year of the balance.** Pensioners: 0.5%. Pre-existing pensioners: 0.3%. Default-fund fees: open. | Long-term pension; withdrawal rules not collected | n/a | CMA | [S13]; [S17] §8 |
| **General pension fund** (קרן פנסיה כללית) | Fund for amounts above the comprehensive-fund ceiling | Same 9 managers report "general funds" | Insured-salary ceiling for the general fund: NIS 55,706 (4× average wage) | Not found | — | — | CMA | [S2]; [S13] |
| **Provident fund** (קופת גמל לתגמולים ואישית לפיצויים) | Retirement savings fund | 15 public managers (§5.1) | Employee and self-employed ceilings for 2026 in [S13] p.1–2. Amendment 190 minimum pension: NIS 5,306. | Not found | Not collected | — | CMA | [S1]; [S13]; [S14] |
| **Investment provident fund** (קופת גמל להשקעה) | Flexible, liquid long-term savings | 14 public managers; 18 incl. sector funds (§5.1) | Annual deposit ceiling: **NIS 70,000 linked to the July 2016 CPI**, applied across all of a saver's funds = **NIS 83,641 for 2026**. Exception: proceeds from a home sale up to NIS 2,000,000 with Tax Authority approval. Default track if none chosen. Deposits by credit card, transfer, standing order or cheque. | Bylaws refer to the "maximum fee in the regulatory arrangement" without a figure. **4% of deposits + 1.05% of balance** appears only in secondary or blocked sources (open). | **Withdrawal at any time.** Paid within 4 business days. Transfers to other provident funds allowed. Track switch within 3 business days. | Not found | CMA | [S16] §7.4, 8.1, 8.3, 9, 11, 12.1, 16, 20.2, 35; [S13]; [S14]; [S15]; [S48] (extract) |
| **Child savings** (חיסכון לכל ילד; in Gemel-Net as "קופת גמל להשקעה – חסכון לילד") | Government-funded savings for each child entitled to child allowance | Gemel: 10 managers (§5.1). Banks: list not found (open). | NII deposits **NIS 58/month from 1 Jan 2026**. Parents may add NIS 58 from the child allowance. Held at a bank or provident fund, parents' choice. Annual statement by 1 March. Grants: born ≤2016: NIS 582 at 18. Born ≥2017: NIS 291 at 3 and at bar/bat mitzvah. NIS 582 at 21 if nothing withdrawn. | Management fees paid by NII until age 21 (extract) | Withdrawal from 18; from 21 without parental approval. Bank savings cannot move to another bank (extract). | n/a | NII; CMA (gemel); BoI (banks) | [S19]; [S20] (extract); [S1] |
| **Study fund** (קרן השתלמות) | Medium-term savings | 18 public managers incl. IRA-only firms (§5.1) | **Liquid after 6 years** from first deposit. **After 3 years** for study purposes, or at retirement age (with conditions). Employee 2026: salary ceiling NIS 15,712/month; employer up to 7.5%, employee up to 2.5% (at least one-third of the employer rate). Self-employed: deposits up to 4.5% of income are deductible, up to NIS 13,203 (income ceiling NIS 293,397); tax-advantaged deposit ceiling **NIS 20,566/year**. Track changes without a tax event. | Not found | 6 years / 3 years, as above | — | CMA | [S18]; [S13]; [S14] |
| **Self-directed provident / study fund** (בניהול אישי, IRA) | Saver directs the investments | Gemel-Net IRA funds: Menora, Globalnet, Migdal, Slice, Meitav, Phoenix, Action (אקטיון) | CMA 2026 plan includes updating the IRA regulations | Avg annual mgmt fee, period 202609: 0.15%–0.36% where reported | As the underlying product | Not found | CMA | [S1]; [S29] p.16 |
| **Central severance fund** (מרכזית לפיצויים) | Employer product | 10 public managers | Not relevant to individual choice (§7) | — | — | — | CMA | [S1] |
| **Savings policy** (פוליסת חיסכון) | Insurer-managed savings policy | 8 insurers report investment tracks (§5.2). Some tracks are managed by investment houses ("hosting"), e.g. Hachshara tracks managed by Altshuler Shaham. | **NIS 21.4 bn** of savings policies were hosted by portfolio managers (end-2025) | Not verified (open). A secondary page shows one Phoenix track at 2.23% of deposits + 0.86% of assets. | Not verified (open) | Not found | CMA | [S3]; [S7] p.19; [S49] (secondary) |
| **Executive insurance** (ביטוח מנהלים) | Insurer pension and savings policy | Same insurers. Bituach-Net groups by issue period (1990–91, 1992–2003, 2004+). | Not collected | Not found | Not collected | — | CMA | [S3] |
| **Amendment 190 deposits** (תיקון 190) | Deposits for retirees, by age | Mor lists it as a product | Age-based ceilings for exempt deposits in [S14] p.3 | — | — | — | CMA | [S14]; [S36] |

### 4.4 Managed portfolios, digital investing, and brokers

| Channel | Facts found | Sources |
|---|---|---|
| **Portfolio management** (ניהול תיקים; ISA licence) | End-2025: 131 firms, 96,161 clients, NIS 493 bn (NIS 257 bn private and corporate clients), 94,139 client portfolios. The ten largest firms manage about 72%. Weighted average direct fee **0.50%** (2025). By portfolio size: under NIS 0.5m 0.51%; 0.5–1.5m 0.66%; 1.5–5m 0.61%; over 5m 0.43%. **25,758 portfolios are under NIS 0.5m.** 45 managers run hosted mutual funds (about NIS 49 bn). | [S7] p.2–3, 6, 8, 16, 19 |
| **Conflicts of interest** | 70 firms (53%) hold assets of related parties ("זיקה") in client portfolios: NIS 53.5 bn, 11% of managed assets | [S7] p.7 |
| **Minimums** | No official minimum. Firm-specific (open). Meitav "Manager" digital portfolio: **from NIS 25,000** (on what may be a demo page). Secondary sources cite NIS 250–350k for traditional portfolios. | [S31]; [S50] (secondary) |
| **Digital / robo portfolios** | Meitav Manager (Meitav Portfolio Management Ltd) [S31]. Others are unverified (open). | [S31] |
| **Israeli self-directed trading platforms** | IBI Trade (SPARK, NextGen, IBI SMART app) [S33]; Psagot Trade [S34]; Meitav Trade [S30]; Altshuler Trade [S32]; bank platforms (e.g. Otzar Hahayal "Top Trade") [S30b]. Commission levels: **not verified from official price lists**; secondary comparisons exist [S51]. | as cited |
| **Investment advice** | Banks offer advice under an advisory agreement (e.g. Otzar Hahayal). End-2025: 13 non-bank advisory firms with 1,432 clients. | [S30b]; [S7] p.3 |
| **Foreign brokers** | Interactive Israel: brand of Mexem Ltd, CySEC 325/17, ISA section-49A permit, **not ISA-supervised**, introducing broker to IBKR LLC. IBKR LLC accounts carry SIPC protection up to USD 500,000; IBKR Ireland up to EUR 20,000 (as stated). IBKR knowledge base describes limits on leveraged FX for Israeli retail clients. Direct IBKR and eToro status for Israeli residents: open. | [S37]; [S46] (extract) |

### 4.5 Other holdings

| Holding | Facts found | Regulator | Sources |
|---|---|---|---|
| **P2P lending** (הלוואות עמית לעמית) | Tarya: licence no. 58971 under the Regulated Financial Services Law 2016, licensed by the CMA in June 2021. Markets a real-estate track at "prime + at least 3%", stated to be gross and not guaranteed. Blender: runs "Blender Invest (P2P)" and a liquid product "REBLEND". Terms not on its home page. BTB: unverified. The CMA plans a 2026 reporting circular for credit-intermediation systems. | CMA | [S40][S41][S29] p.9 |
| **Crypto: licensed service providers** | Press: Horizon (Altshuler Shaham group) has a permanent licence. Tectona Custody is licensed to 31 Dec 2026. Bit2C is licensed and being acquired by eToro (May 2026). A Calcalist report cites nine licensees. **Full list: open.** The CMA's 2026 plan includes custody and segregation rules for crypto providers, and supervision of stablecoin issuers. | CMA | [S45] (extracts); [S29] p.12; [S32] |
| **Crypto via funds** | See §4.2 "Digital-asset funds" | ISA | [S6] |
| **Real estate: listed / REIT** | Not enumerated (open). TASE allows dual listing of foreign REITs (secondary). | ISA | [S52] (extract) |
| **Real estate: through investment houses** | IBI Pillar [S33]; Altshuler "overseas real estate" [S32]. Eligibility (qualified investors only?): open. | Open | [S32][S33] |
| **Real-estate crowdfunding** | Not enumerated (open) | ISA (presumed; open) | — |
| **Gold** | Via commodity funds (§4.2). Physical gold: no official source reached (open). | — | [S6] |
| **Savings-and-credit cooperatives; free-loan (gemach) deposits** | Both under CMA supervision. The CMA's 2026 plan adds fee, disclosure and reporting rules for gemach institutions. Who operates, and whether they take public deposits: open. | CMA | [S29] p.2, 9–10 |
| **State savings instrument for individuals** | None found (open) | — | — |

---

## 5. Institutions

### 5.1 Provident and pension managing companies (CMA licence)

Source: Gemel-Net and Pension-Net, report period 202609 [S1][S2]. "Public" means target population "כלל האוכלוסיה".

Column key: P = pension (new comprehensive and general); G = provident (tagmulim); H = study fund; GL = gemel lehashkaa; C = child savings; CS = central severance; IRA = self-directed fund in the name.

| Managing company (legal name) | Brand | P | G | H | GL | C | CS | IRA |
|---|---|---|---|---|---|---|---|---|
| איילון קופות גמל בע"מ | Ayalon | | ✓ | ✓ | ✓ | | | |
| אינפיניטי השתלמות, גמל ופנסיה בע"מ | Infinity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| אלטשולר שחם גמל ופנסיה בע"מ | Altshuler Shaham | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| אנליסט קופות גמל בע"מ | Analyst | | ✓ | ✓ | ✓ | ✓ | ✓ | |
| אקטיון בע"מ | Action | | ✓ | ✓ | | | | ✓ |
| גלובלנט ניהול קופות גמל בע"מ | Globalnet | | ✓ | ✓ | | | | ✓ |
| הפניקס פנסיה וגמל בע"מ | Phoenix | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| הראל פנסיה וגמל בע"מ | Harel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| ילין לפידות ניהול קופות גמל בע"מ | Yalin Lapidot | | ✓ | ✓ | ✓ | | ✓ | |
| כלל פנסיה וגמל בע"מ | Clal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| מגדל מקפת קרנות פנסיה וקופות גמל בע"מ | Migdal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| מור גמל ופנסיה בע"מ | Mor | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| מיטב גמל ופנסיה בע"מ | Meitav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| מנורה מבטחים פנסיה וגמל בע"מ | Menora Mivtachim | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| סלייס גמל בע"מ | Slice | | ✓ | ✓ | | | | ✓ |

Notes:

- Infinity is wholly owned by Infinity Portfolio Management Ltd (company document, search extract) [S38].
- Phoenix's provident company: the IRA tick is from fund names "הפניקס גמל/השתלמות בניהול אישי" [S1].

**Sector or employer funds** (not "general population" in the dataset, so excluded from the public list; eligibility is an open question):

- **Gemel lehashkaa:** Gal (teachers), Handasaim and Technicians, Hebrew University staff fund, Yachad Rofim (doctors), Machog (Israel Electric employees), Ami.
- **Study funds:** about 20 more (teachers, judges, lawyers, engineers, social workers, pharmacists, state employees, local authorities, career soldiers, and others).
- **Tagmulim:** about 15 more employer funds (El Al, Israel Aerospace Industries, Tel Aviv and Haifa municipalities, Leumi employees, and others) [S1].

### 5.2 Insurers with savings / executive policies (CMA licence)

Source: Bituach-Net, period 202609 [S3]. All report policies issued 1990–91, 1992–2003 and from 2004, except IDI (2004+ only).

| Insurer (legal name) | Brand | Note |
|---|---|---|
| איילון חברה לביטוח בע"מ | Ayalon Insurance | |
| הכשרה חברה לביטוח בע"מ | Hachshara | Some tracks "managed through Altshuler Shaham" |
| הפניקס חברה לביטוח בע"מ | Phoenix | Some tracks are "Phoenix-Excellence Invest" |
| הראל חברה לביטוח בע"מ | Harel | |
| ישיר – איי. די. איי. חברה לביטוח בע"מ | IDI / Direct | 2004+ policies only |
| כלל חברה לביטוח בע"מ | Clal | |
| מגדל חברה לביטוח בע"מ | Migdal | |
| מנורה מבטחים חברה לביטוח בע"מ | Menora Mivtachim | |

### 5.3 Mutual fund managers and trustees (ISA licence)

Source: ISA, *Mutual fund activity 2025* [S6] p.5, 7. AUM is at end-2025, in NIS bn.

| Fund manager (legal name as listed) | AUM | of which MMF / active / passive |
|---|---|---|
| קסם קרנות נאמנות בע"מ (Kesem) | 126.5 | 80.1 / 21.1 / 24.6 |
| מיטב קרנות נאמנות בע"מ (Meitav) | 109.8 | 62.4 / 22.6 / 24.8 |
| הראל קרנות נאמנות בע"מ (Harel) | 102.6 | 50.7 / 34.2 / 17.7 |
| מגדל קרנות נאמנות בע"מ (Migdal) | 94.7 | 63.1 / 19.1 / 12.5 |
| אי.בי.אי קרנות נאמנות בע"מ (IBI) | 87.1 | 56.5 / 16.3 / 14.3 |
| מור ניהול קרנות נאמנות (2013) בע"מ (Mor) | 57.2 | 23.7 / 6.7 / 26.8 |
| איילון קרנות נאמנות בע"מ (Ayalon) | 50.9 | – / 18.5 / 32.4 |
| ילין לפידות – ניהול קרנות נאמנות בע"מ (Yalin Lapidot) | 47.3 | 5.7 / 17.6 / 24.0 |
| אנליסט אי.אמ.אס ניהול קרנות נאמנות (1986) בע"מ (Analyst) | 23.6 | 2.0 / 14.7 / 6.9 |
| אלטשולר-שחם ניהול קרנות נאמנות בע"מ (Altshuler Shaham) | 19.4 | 1.2 / 7.8 / 10.4 |
| סיגמא קרנות נאמנות בע"מ (Sigma) | 14.5 | – / – / 14.5 |
| אילים קרנות נאמנות בע"מ (Ilim) | 10.4 | – / – / 10.4 |
| פורסט קרנות נאמנות בע"מ (Forest) | 8.7 | – / 0.2 / 8.5 |
| תמיר פישמן קרנות נאמנות בע"מ (Tamir Fishman) | 3.8 | – / – / 3.8 |
| ברק קרנות נאמנות בע"מ (Barak) | 0.4 | – / – / 0.4 |

Notes:

- **Psagot's fund business:** the 2024 report records that in 2024 IBI acquired fund manager Psagot, and Kesem acquired Psagot's active funds [S5] p.8.
- **Kesem's parent:** described in press as the fund arm of "Phoenix Investment House", formerly Excellence. This is secondary [S42].
- **Trustees, end-2025** [S6] p.5:

| Trustee | AUM (NIS bn) | Share |
|---|---|---|
| Yuvank (יובנק) | 416.7 | 55% |
| Mizrahi Tefahot Trust | 160.8 | 21.2% |
| Almagor-Britman | 113.1 | 15% |
| Hermetic | 66.4 | 8.8% |

### 5.4 Banks (BoI licence)

The official list was **not reachable** (§2). The table below is a secondary list: Wikipedia, revised 27 Dec 2025 [S9]. Bank sites were checked where noted. Product rows show only what was seen on a site. No bank appears as a mutual-fund manager [S6] or as a provident managing company [S1].

| Bank / group | Notes (source) |
|---|---|
| Bank Leumi | Deposits, "Touch savings", child savings, deposit without a current account, money-market products menu [S23] |
| Bank Hapoalim | Site page not reached (404 on the guessed URL) |
| Israel Discount Bank; Mercantile Discount (subsidiary) | [S9] |
| Mizrahi-Tefahot; Union Bank (acquired); Bank Yahav (50% owned) | [S9] |
| First International Bank (FIBI); brands Otzar Hahayal, Poalei Agudat Israel, U-Bank; Bank Massad (51%) | Otzar Hahayal site lists deposits and savings incl. structured deposits, capital-market trading ("Top Trade"), FX, investment advice, money-market products, portfolio management, pension advice. Footer links to fibi.co.il, pagi.co.il, bankmassad.co.il. [S30b][S9] |
| Bank of Jerusalem | [S9] |
| One Zero (digital bank) | [S9]; site returned 403 |
| Esh (digital bank) | Full licence August 2024; reported acquisition by Isracard. Public launch status: **open**. [S43] (secondary) |
| Foreign branches: Citibank, HSBC, Barclays, State Bank of India, BNP Paribas, UBS | [S9]; retail relevance open |
| Postal Bank (Bank HaDoar) | Cannot give credit; supervised by the Ministry of Communications [S9]. Out of scope (§7). |

### 5.5 Investment houses, brokers and platforms

Founder's list in **bold**. Licence basis is taken from the registries above where possible.

| Institution | Product lines seen on own site | Licensed entities confirmed by registry or own site | Sources |
|---|---|---|---|
| **Meitav** | Pension, gemel, hishtalmut, gemel lehashkaa, child savings, Amendment 190, IRA; mutual funds; Meitav Trade; portfolio management incl. digital "Manager"; loans; FX | מיטב גמל ופנסיה (CMA); fund manager (ISA, listed as "מיטב קרנות נאמנות"; site names "מיטב תכלית קרנות נאמנות" — naming discrepancy open); מיטב ניהול תיקים (ISA) | [S30][S31][S1][S6] |
| **Altshuler Shaham** | Pension, gemel, hishtalmut, gemel lehashkaa, child savings; mutual funds; portfolio management; hedge and alternative funds; overseas real estate; Horizon digital assets; FX services and LAYA wallet; Trade; credit | אלטשולר שחם גמל ופנסיה (CMA); fund manager (ISA); Horizon (crypto licence per press) | [S32][S1][S2][S6][S45] |
| **Yalin Lapidot** | Site not reached. Registry: gemel, hishtalmut, gemel lehashkaa, central severance; mutual funds. Secondary: portfolio management and savings policies. | ילין לפידות ניהול קופות גמל (CMA); fund manager (ISA) | [S1][S6][S53] |
| **IBI** | IBI Trade (SPARK, NextGen), IBI SMART app; portfolio management; mutual funds; US/Canada trading; alternative investments, hedge fund, real estate (IBI Pillar), structured products | Fund manager (ISA); no CMA provident licence in Gemel-Net | [S33][S6][S1] |
| **Interactive Israel** | Shares, options, futures, bonds, ETFs, funds via IBKR; Collective2 portfolio services | Mexem Ltd (CySEC 325/17); ISA section-49A permit; **not ISA-supervised** | [S37] |
| **Mor** | Pension, gemel, hishtalmut, gemel lehashkaa, child savings, Amendment 190; mutual funds; portfolio management; private funds (qualified investors); Mor Magna (institutional); Mor Credit | מור גמל ופנסיה (CMA); מור ניהול קרנות נאמנות (2013) (ISA); מור בית השקעות ניהול תיקים (ISA) | [S36][S1][S2][S6] |
| **Psagot** | Psagot Trade; institutional brokerage; trust services; equity compensation; operational representative for BlackRock funds in Israel | Not in Gemel-Net 202609; not a fund manager at end-2025. Ownership of the brokerage: press reports a 2024 sale to Sigma Clarity and Carmel Credit (open). | [S34][S5][S1] |
| **Phoenix (Hafenix)** | Insurer; pension and gemel; Kesem funds (via Phoenix Investment House, ex-Excellence: secondary) | הפניקס פנסיה וגמל (CMA); הפניקס חברה לביטוח (CMA); Kesem (ISA) | [S1][S2][S3][S6][S42] |
| **Migdal** | Insurer; pension and gemel incl. IRA; mutual funds; portfolio management (Migdal Capital Markets: secondary) | מגדל מקפת (CMA); מגדל חברה לביטוח (CMA); Migdal funds (ISA) | [S1][S2][S3][S6] |
| **Harel** | Insurer; pension and gemel; mutual funds | הראל פנסיה וגמל (CMA); הראל חברה לביטוח (CMA); Harel funds (ISA) | [S1][S2][S3][S6] |
| **Clal** | Insurer; pension and gemel incl. child savings | כלל פנסיה וגמל (CMA); כלל חברה לביטוח (CMA). Not a fund manager. | [S1][S2][S3][S6] |
| **Menora Mivtachim** | Insurer; pension and gemel incl. IRA | מנורה מבטחים פנסיה וגמל (CMA); insurer (CMA). Not a fund manager. | [S1][S2][S3][S6] |
| **Analyst** | Gemel, hishtalmut, gemel lehashkaa, child savings; mutual funds; portfolio management; pension agency (Netz) | אנליסט קופות גמל (CMA); אנליסט אי.אמ.אס קרנות נאמנות (ISA) | [S35][S1][S6] |
| **Infinity** | Pension, gemel, hishtalmut, gemel lehashkaa, child savings, central severance | אינפיניטי השתלמות, גמל ופנסיה (CMA) | [S1][S2][S38] |
| **Ayalon** | Gemel, hishtalmut, gemel lehashkaa; mutual funds; insurer with policies | איילון קופות גמל (CMA); Ayalon funds (ISA); איילון חברה לביטוח (CMA) | [S1][S3][S6] |
| **Hachshara** | Insurer with policy tracks (some managed by Altshuler Shaham) | הכשרה חברה לביטוח (CMA) | [S3] |
| **Kesem** | Largest fund manager at end-2025 | קסם קרנות נאמנות (ISA) | [S6] |
| Sigma, Ilim, Forest, Tamir Fishman, Barak | Passive or active fund managers | ISA (fund managers) | [S6] |
| Action, Globalnet, Slice | Provident and study funds, IRA-type | CMA | [S1] |
| Excellence | Site refused connection. In press, the old name of Phoenix Investment House. | Open | [S42] |
| Blender, Tarya | P2P lending platforms | CMA (Tarya licence no. 58971) | [S40][S41] |
| Bits of Gold, Bit2C, Tectona, Horizon | Crypto services | CMA (per press; registry unreachable) | [S45] |
| eToro | Global platform; acquiring Bit2C (press, May 2026) | Israeli status open | [S44] |
| Interactive Brokers (direct) | Used directly by Israeli residents (secondary) | Foreign (SEC/FINRA; CBI) | [S46] |

---

## 6. Changes to watch (from the CMA 2026 regulation plan)

Published 31 Dec 2025, updated 14 Jan 2026 [S29]. Planned items that touch the products above:

- Update to the IRA (personal-management provident fund) regulations (p.16).
- Investment-tracks circular (p.20).
- New rules on publishing returns and investment tracks (p.21).
- Unified rules for withdrawing from pension savings, and a retirement circular (p.20).
- Fee discounts and cancellations in life insurance (p.21).
- Reporting circular for P2P credit-intermediation systems (p.9).
- Crypto custody and segregation rules, and supervision of stablecoin issuers (p.12).
- Fee, disclosure and reporting rules for gemach institutions (p.9–10).
- Amendment 17 to allow licensing of foreign financial service providers (p.10).

Outside the CMA plan: a deposit-insurance bill was tabled on 2 Feb 2026 [S27].

---

## 7. Deliberately left out, and why

| Left out | Why |
|---|---|
| Tax rates and tax treatment (capital gains, deposit interest, annuity exemptions, section 45/47 credits) | Belongs to the tax track. Project rules forbid writing tax rules from memory. The 2026 ceiling tables [S13][S14] list tax-related amounts and can be handed to that track. |
| Sector and employer-only provident and study funds | Not open to the general public per the dataset. Named in §5.1; eligibility is an open question. |
| "Other purpose" provident funds (sickness/accident, holiday funds) and the old closed pension funds | Not savings vehicles an individual can choose |
| Central severance funds | Employer product |
| Pure-risk insurance (life, disability, health) | Not saving or investing |
| Borrowing products (mortgages, loans, credit cards, BNPL) | The task covers saving and holding money |
| Derivatives, leveraged FX and CFDs | Speculative trading. Listed only as a category; no institution mapping. |
| Private equity, VC, angel investing, qualified-investor-only funds (e.g. Mor private funds) | Restricted to qualified investors. Thresholds not researched. |
| Foreign bank branches in Israel | Retail relevance not established |
| Postal Bank | Not a bank under BoI; cannot give credit |
| Rates, yields and fee schedules per institution | Data-collection track. Only regulator aggregates were recorded here. |
| Collectibles, art, wine, business ownership | Out of scope of the brief |
| Unlicensed or offshore platforms | Cannot be enumerated from any register |

---

## 8. Open questions

**Registers and coverage**

1. Official BoI list of banking corporations: is Esh live for the public? Is Union Bank fully merged? Is Massad still separate? (Use the BoI Excel file, said to be updated 11/05/2026.) [S8]
2. TASE member list: which non-bank members serve retail clients? [S10]
3. Names of all 131 licensed portfolio managers, and which offer digital or low-minimum portfolios [S11]
4. CMA registry: full list of P2P platforms, crypto ("financial asset") licensees, savings-and-credit cooperatives, and gemach institutions that take deposits [S12]

**Bank products**

5. Which banks take child-savings accounts, and on what terms?
6. Current terms for bank savings plans, structured deposits and FX deposits. Is there any current BoI page with rules? (BoI HTML pages are blocked.)
7. Status of the deposit-insurance bill tabled 2 Feb 2026 [S27]

**Long-term savings**

8. Binding fee caps for provident, study and gemel lehashkaa funds, and for savings policies. 4% of deposits + 1.05% of balance appears only in secondary or blocked sources.
9. Which funds are the current default ("selected") pension funds, for which period, and at what fees?
10. Statutory employee/employer pension contribution rates. Not found in an accessible source.
11. Tax Authority's own publication of the 2026 ceilings (to replace the institution tables)
12. Liquidity, withdrawal and fee rules for savings policies and executive insurance. Minimum deposits.
13. Eligibility for sector gemel lehashkaa funds (e.g. family members?)

**Brokers and platforms**

14. Official commission and custody fee schedules for each trading platform and bank
15. Status of direct Interactive Brokers and eToro accounts for Israeli residents under ISA rules. Investor-protection implications.
16. Ownership and licence of Psagot's brokerage (Psagot Trade) after the 2024 transactions

**Other holdings**

17. REITs listed on TASE (list and rules); real-estate crowdfunding regulation and platforms
18. Physical gold: who sells it, and on what terms
19. Whether any state retail savings instrument exists for residents
20. Is Bits of Gold permanently licensed? What is the full crypto licensee list (press says nine)?
21. Hedge funds in trust: minimum investment and redemption frequency under the permanent regulation
22. Meitav naming: "מיטב קרנות נאמנות" (ISA report) vs. "מיטב תכלית קרנות נאמנות" (site)
23. Whether the Meitav "Manager" page (/test/) reflects the live product terms

---

## 9. Source register

All sources were checked on **2026-10-22**. IDs S21 and S47 are intentionally unassigned.

| ID | Source | Type | How read | URL |
|---|---|---|---|---|
| S1 | CMA Gemel-Net dataset, resource "2024–today", report period 202609 | Official | CKAN API queries: distinct managers by classification and target population; IRA fund search | https://data.gov.il/dataset/gemelnet ; API: https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb |
| S2 | CMA Pension-Net dataset, period 202609 | Official | CKAN API | https://data.gov.il/dataset/pensia-net ; resource 6d47d6b5-cb08-488b-b333-f1e717b1e1bd |
| S3 | CMA Bituach-Net dataset, period 202609 | Official | CKAN API | https://data.gov.il/dataset/insurance ; resource c6c62cc7-fe02-4b18-8f3e-813abfbb4647 |
| S4 | CMA organisation datasets on data.gov.il | Official | API | https://data.gov.il/api/3/action/organization_show?id=cma&include_datasets=true |
| S5 | ISA, *פעילות קרנות נאמנות בישראל 2024* | Official | PDF, read in full | https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf |
| S6 | ISA, *פעילות קרנות נאמנות בישראל 2025* (published 17 Jun 2026). Copy hosted by Funder. | Official (third-party host) | PDF, pages 1–20 | https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf ; news: https://funder.co.il/article/203717 |
| S7 | ISA, *פעילות חברות בעלות רישיון השקעות 2025* (published 29 Jul 2026). Copy hosted by Funder. | Official (third-party host) | PDF, pages 1–20 | https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf ; news: https://funder.co.il/article/206333 |
| S8 | BoI list of banking corporations | Official | **Blocked** (Radware) | https://boi.org.il/roles/supervisionregulation/bank-sup/banklist ; https://www.boi.org.il/roles/statistics/banking/banks-and-branches/ |
| S9 | Wikipedia, *List of banks in Israel* (rev. 27 Dec 2025) | Secondary | Fetched | https://en.wikipedia.org/wiki/List_of_banks_in_Israel |
| S10 | TASE member list | Official | **Not readable** | https://market.tase.co.il/en/about_tase/tase_members/tase_members_list ; https://www.tase.co.il/he/content/about/tase_members |
| S11 | ISA licensee search | Official | **Not readable** | https://www.investors.isa.gov.il/page/search-advisor |
| S12 | CMA financial service providers registry | Official | **403** | https://cmainfo.cma.gov.il/fslproviders |
| S13 | Harel, *תקרות וסכומים לשנת 2026* (PDF dated Mar 2026) | Institution | PDF, read in full | https://media.harel-group.co.il/media/eh3fyryd/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf |
| S14 | Mor Gemel & Pension, *תקרות וסכומים לשנת 2026* (Jan 2026) | Institution | PDF, read in full | https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf |
| S15 | Phoenix, gemel lehashkaa ceilings page (2026) | Institution | Fetched | https://www.fnx.co.il/gemel/gemelhashkaa/tikrot-hafkada-hatvot-mas-gemelashkaa/ |
| S16 | Altshuler Shaham, gemel lehashkaa "חיסכון פלוס" bylaws, March 2025 edition | Institution (legal doc) | PDF, pages 1–12 | https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf |
| S17 | Mor, comprehensive pension fund bylaws, version 01.06.2025 | Institution (legal doc) | PDF, §8 (fees) | https://www.moreinvest.co.il/media/ckfdk24k/תקנון-קרן-פנסיה-מקיפה-6-2025.pdf |
| S18 | Altshuler Shaham, study-fund Q&A | Institution | Fetched | https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/ |
| S19 | NII, *תכנית חיסכון לכל ילד* | Official | Fetched | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx |
| S20 | NII withdrawal page and age-18 FAQ | Official | **Extract** | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx ; https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/age18.aspx |
| S22 | BoI consumer page, "פיקדון בנקאי" | Official | **Extract** (blocked) | https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/pikadon/ |
| S23 | Leumi, savings page | Institution | Fetched | https://www.leumi.co.il/he/savings |
| S24 | BoI press release 1 Apr 2025: deposit-rate publication duty in force (directive 447) | Official | **Extract** | https://www.boi.org.il/publications/pressreleases/1-4-25/ |
| S25 | BoI press release 30 Dec 2024 and directive A447 (money-market products display) | Official | **Extract** | https://boi.org.il/publications/pressreleases/30-12-24/ ; https://boi.org.il/media/npifkjqk/הוראה-a447.pdf |
| S26 | Funder, 15 Jun 2026: Israel has no formal deposit-insurance scheme (citing a letter by the Movement for Quality Government) | Secondary | Fetched | https://www.funder.co.il/article/203575 |
| S27 | Knesset, deposit-insurance bill 2026 (tabled 2 Feb 2026) | Official | **Extract** | https://fs.knesset.gov.il/25/law/25_lst_11195962.pdf |
| S28 | BoI, *מערכת הבנקאות בישראל, מחצית ראשונה 2025* (Nov 2025). Used only to confirm BoI media PDFs are reachable. | Official | PDF, pages 1–4 | https://boi.org.il/media/trqltwil/סקירת-מערכת-הבנקאות-מחצית-ראשונה-2025.pdf |
| S28b | BoI, structured deposits public information (2003 data) | Official | **Extract** | https://boi.org.il/publications/pressreleases/הפיקדונות-המובנים-structured-products-מידע-לציבור/ |
| S29 | CMA, *תכנית אסדרה לשנת 2026* (31 Dec 2025, updated 14 Jan 2026) | Official | PDF, read in full | https://www.gov.il/BlobFolder/reports/report_0015/he/regulation_plan_26_1.pdf |
| S30 | Meitav home page | Institution | Fetched | https://www.meitav.co.il/ |
| S30b | Otzar Hahayal home page | Institution | Fetched | https://www.bankotsar.co.il/ |
| S31 | Meitav "Manager" digital portfolio page (URL path /test/) | Institution | Fetched | https://www.meitav.co.il/test/ |
| S32 | Altshuler Shaham home page | Institution | Fetched | https://www.as-invest.co.il/ |
| S33 | IBI home page | Institution | Fetched | https://www.ibi.co.il/ |
| S34 | Psagot home page | Institution | Fetched | https://www.psagot.co.il/ |
| S35 | Analyst home page | Institution | Fetched | https://www.analyst.co.il/ |
| S36 | Mor home page | Institution | Fetched | https://www.moreinvest.co.il/ |
| S37 | Interactive Israel "about" page. Observed: interactive.co.il redirects (301) to 2cents.co.il, an unrelated UX firm. | Institution | Fetched | https://lp3.inter-il.com/about-3 |
| S38 | Infinity company documents (ownership, licences) | Institution | **Extract** | https://infinity.co.il/wp-content/uploads/2025/07/דוח-שנתי21.pdf |
| S39 | Altshuler Shaham magazine, bonds explainer (17 Jun 2020) | Institution (dated) | Fetched | https://www.as-invest.co.il/magazine/אגח/כל-מה-שכדאי-לדעת-על-אגח-ולא-חשבתם-לשאול/ |
| S40 | Tarya home page | Institution | Fetched | https://www.tarya.co.il/ |
| S41 | Blender home page | Institution | Fetched | https://www.blender.co.il/ |
| S42 | Calcalist on Kesem / Phoenix Investment House (ex-Excellence) | Secondary | **Extract** | https://www.calcalist.co.il/market/article/bkqncash0 |
| S43 | Esh bank licence and Isracard deal | Secondary | **Extract** | https://www.calcalistech.com/ctechnews/article/x8ijyku7k ; https://www.fintechfutures.com/m-a/isracard-reportedly-acquires-esh-bank |
| S44 | eToro acquiring Bit2C (May 2026). Exact article not opened. | Secondary | **Extract** | https://www.funder.co.il/article/200874 (candidate) |
| S45 | Crypto licensing press: Horizon; Tectona (licence to 31 Dec 2026); "nine licensees" | Secondary | **Extract** | https://www.ice.co.il/crypto/news/article/918161 ; https://www.bizportal.co.il/capitalmarket/news/article/824732 ; https://www.calcalist.co.il/market/article/hyn4j63ngl |
| S46 | IBKR knowledge base, leveraged FX restrictions for Israeli retail clients | Institution (foreign) | **Extract** | https://ibkb.interactivebrokers.com/de/node/3242 |
| S48 | Kol-Zchut, gemel lehashkaa fee cap | Secondary | **Extract** (403) | https://www.kolzchut.org.il/he/איסור_גביית_דמי_ניהול_בקופת_גמל_להשקעה_מעל_התקרה_המקסימלית |
| S49 | TheMarker Supermarker, Phoenix policy track page (May 2026 data) | Secondary | **Extract** | https://www.supermarker.themarker.com/MenahalimInsurance/MenahalimInsurance.aspx?ID=50 |
| S50 | Portfolio minimums (Moneyplan, TheMarker comparison) | Secondary | **Extract** | https://moneyplan.co.il/?p=46542 ; https://www.supermarker.themarker.com/PortfolioManagement/ComparePortfolioManagement.aspx |
| S51 | Broker commission comparisons (leads only; numbers not used) | Secondary | **Extract** | https://gemeltop.co.il/amlot-mischar-babursa-2026/ ; https://addiction2success.co.il/עמלות-מסחר-ישראל-2026/ |
| S52 | TASE dual listing of REITs | Secondary | **Extract** | https://www.hon.co.il/?p=116296 |
| S53 | Bizportal, Yalin Lapidot profile | Secondary | **Extract** | https://www.bizportal.co.il/list/Tags/27536 |
