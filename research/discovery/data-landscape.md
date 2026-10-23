# Data landscape: what is publicly available for Israeli saving/investment decisions

Track: data sources survey (discovery phase). Nothing here is a product decision.
Date of survey: 2026-10-22. Every fetch described below was made on that date from one Linux machine (WSL) with plain `curl`, a Chrome-like User-Agent and no login. "Verified" means I fetched it and looked at the response. "Not verified" means I could not read it (blocked, JS-only, login) or only have a secondary source.

Rules followed: no files written under `data/`; no number estimated; any figure quoted is an *example of a field*, with source URL and the date I read it. None of them is meant to be reused.

No tax or financial rule is stated anywhere in this file. (The `il-finance` skill does not exist yet; where a source mentions a rule I only name the source.)

---

## 0. Executive summary

1. **The best machine-readable sources are all official and free:**
   - **CMA (Capital Market Authority) on data.gov.il**: monthly fund-level data for provident funds / study funds (gemel), pension funds, and life-insurance savings policies: management fees, yields, assets, risk metrics. CKAN datastore API + CSV, history from 1999. Verified.
   - **Bank of Israel (BOI) EDGE API** (SDMX REST: `/sdmx/v2/` path, SDMX 3.0 message namespace; CSV/JSON/Excel/XML output): policy rate, FX rates, makam and government-bond yields, zero-curve, inflation expectations, CPI copy, bank-level deposit/credit interest, quarterly bank-level securities fee averages, mortgage rates. Verified.
   - **CBS (Central Bureau of Statistics) API**: CPI (index values, monthly/annual change, linkage calculator), JSON/XML, history to the 1950s. Verified.
   - **MoF (Ministry of Finance) datasets on data.gov.il**: "Savings for every child" deposit rates by bank (daily), Accountant General rates, government bond issuance/trading. Verified.
2. **Brokerage commissions and bank fee schedules (tarifon)** exist only as per-institution documents (PDF, sometimes also XLSX or HTML). Leumi publishes stable-URL PDF + XLSX; others use PDFs with hashed URLs. There is no cross-institution machine-readable price list. BOI publishes only *aggregate* actually-charged averages (FEES_DASH, 10 banks, quarterly).
3. **Current bank deposit offers** (product-level rates) are client-rendered (JS/XHR) on most bank sites, or published as dated PDF "rate boards" (Yahav, Hapoalim). BOI has only per-bank monthly *average* deposit rates, not offers.
4. **Exchange (TASE) and securities-authority (ISA) data are the weakest area for free machine access.** TASE and ISA sites are JS-rendered; TASE API hosts return 403 to scripts; the only documented route is the TASE DataHub developer portal (free tier reported by a third-party SDK, terms not read). Neither TASE nor ISA publishes on data.gov.il.
5. **Everything on gov.il (Tax Authority rules, CMA service pages, Har HaBituach/Har HaKesef) returned 403 or a bot challenge to scripted fetches.** The Tax Authority has no machine-readable rate/bracket dataset anywhere I found.
6. **Commercial aggregators (Funder, Globes, TheMarker) explicitly forbid automated collection in their terms; Bizportal restricts to private non-commercial use.** Treat them as read-by-human references only.
7. **Practical gotchas found:** `e.data.gov.il` resource URLs redirect to a Google login (use the `data.gov.il/dataset/.../download/...` form); CMA CSV downloads are Windows-1255 encoded, not UTF-8; some data.gov.il API queries (large `rows`, `GROUP BY` SQL) were rejected by the CDN/WAF; BOI web pages (not EDGE) sit behind Radware; TASE/MAYA behind Imperva.

Biggest gaps: see section 5.

---

## 1. Source catalogue: regulator and official sources

### 1.1 data.gov.il (national open-data catalogue)

| Item | Detail |
|---|---|
| URL | https://data.gov.il (CKAN). API root `https://data.gov.il/api/3/action/` |
| Catalogue size | `package_list` returned 1203 datasets (read 2026-10-22). Organizations: 61 (`organization_list`). |
| Finance-relevant publishers (verified present) | `cma` (9 datasets), `bank_israel` (30), `mof` (60), `taxes-authority` (4, all customs-related), `lamas` (CBS, 14, none finance), `social_security` (21, mostly 2009-2014 static) |
| Publishers NOT present | No Israel Securities Authority, no TASE organization. Searches for "קרנות נאמנות", "ניירות ערך", "מנהלי תיקים", "עמלות", "בורסה", "הר הביטוח", "מדד המחירים" returned 0 datasets (read 2026-10-22). |
| Formats | CSV, XLSX, XML, JSON; datastore-enabled resources are queryable with `datastore_search`. |
| License | `https://data.gov.il/terms-of-use` (read 2026-10-22): copying, redistribution, derived works and commercial use allowed; forbidden to present the data misleadingly or alter it so as to distort it. A license attached to an individual dataset overrides the general one. Individual CMA datasets show license "Other (Open)". |
| Access gotchas | (a) Resource URLs shown in package metadata use host `e.data.gov.il`, which answers `302` to a Google OAuth login (verified). The same path on `https://data.gov.il/dataset/<pkg-id>/resource/<res-id>/download/file.csv` returns the file anonymously (verified, 8,849,025 bytes for CMA gemel 2024+). (b) `package_search?rows=200` returned an HTML error page; `rows=20` worked. (c) A `datastore_search_sql` query with `GROUP BY` returned an HTML 404-style page; simple `min/max` SQL worked. (d) API rate limits: not documented in anything I could read; unknown. |
| Historical data | Per-dataset (see below). |

### 1.2 Capital Market, Insurance and Savings Authority (CMA / רשות שוק ההון)

#### 1.2.1 Datasets on data.gov.il (organization `cma`; all verified 2026-10-22)

| Dataset (CKAN id) | Content | Format / access | Update | History |
|---|---|---|---|---|
| `gemelnet` https://data.gov.il/dataset/gemelnet | Monthly report per provident-fund track: provident funds for compensation and benefits, study funds (קרנות השתלמות), investment provident funds (גמל להשקעה), child-savings investment funds (חסכון לילד), central severance funds, "other purpose". | CSV (3 resources: 1999-2022, 2023, 2024-today) + datastore API. Resource id of 2024-today: `a30dcbea-a1d2-482c-ae29-8f781f5025fb`. | Resource `last_modified` 2026-10-22T04:00 (daily job). Data is monthly: latest `REPORT_PERIOD` = 202609 as of 2026-10-22. | From 1999-01 (1999-2022 resource: min 199901, max 202212, read via SQL on 2026-10-22). |
| `pensia-net` https://data.gov.il/dataset/pensia-net | Same structure for new pension funds ("קרנות חדשות") and general pension funds ("קרנות כלליות"); extra field `ACTUARIAL_ADJUSTMENT`, parent-company fields. Resource id 2024-today: `6d47d6b5-cb08-488b-b333-f1e717b1e1bd`. | CSV + datastore | as above (latest 202609) | from 1999 |
| `insurance` (Bituach-Net) https://data.gov.il/dataset/insurance | Life-insurance savings policies/funds by issue period (policies issued 1990-91, 1992-2003, 2004+). Resource id 2024-today: `c6c62cc7-fe02-4b18-8f3e-813abfbb4647`. | CSV + datastore | as above | from 1999 |
| `transfer_bank` https://data.gov.il/dataset/transfer_bank | Directory of funds/tracks with tax-authority approval number and bank/branch/account details for institutional transfers (2,022 rows). | CSV + datastore | daily job | snapshot only |
| `nechasimg`, `nechasimp`, `nechasimb`, `mishtatef` | Asset lists (holdings) for provident funds, pension funds, insurance participant portfolios, institutions. | ZIP/RAR | **Last modified 2023-03-21: stale** | n/a |
| `serviceindex` | Insurer service index. | DOCX/XLSX | last modified 2023-03-21: stale | n/a |

Fields in the monthly fund datasets (from the live datastore schema, 2026-10-22):
`FUND_ID, FUND_NAME, FUND_CLASSIFICATION, CONTROLLING_CORPORATION, MANAGING_CORPORATION, REPORT_PERIOD (YYYYMM), INCEPTION_DATE, TARGET_POPULATION, SPECIALIZATION, SUB_SPECIALIZATION, DEPOSITS, WITHDRAWLS, INTERNAL_TRANSFERS, NET_MONTHLY_DEPOSITS, TOTAL_ASSETS, AVG_ANNUAL_MANAGEMENT_FEE, AVG_DEPOSIT_FEE, MONTHLY_YIELD, YEAR_TO_DATE_YIELD, YIELD_TRAILING_3_YRS, YIELD_TRAILING_5_YRS, AVG_ANNUAL_YIELD_TRAILING_3YRS, AVG_ANNUAL_YIELD_TRAILING_5YRS, STANDARD_DEVIATION, ALPHA, SHARPE_RATIO, LIQUID_ASSETS_PERCENT, STOCK_MARKET_EXPOSURE, FOREIGN_EXPOSURE, FOREIGN_CURRENCY_EXPOSURE, MANAGING_CORPORATION_LEGAL_ID, CURRENT_DATE`.
Pension adds `PARENT_COMPANY_ID/NAME, ACTUARIAL_ADJUSTMENT`; insurance has a reduced set (no inception/target-population/specialization fields) and uses `PARENT_COMPANY_*`.

Profile of the 2024-today CSVs, computed from the files I downloaded on 2026-10-22:
- Gemel: 23,800 rows, 33 monthly periods (202401 to 202609); 764 track rows for 202609 from 59 managing corporations; 68 of the 764 have no management fee (new tracks).
- Pension: 9,309 rows; 293 rows for 202609 from 9 managing corporations; 6 without fee.
- Insurance: 6,505 rows; 200 rows for 202609 from 8 parent companies; 6 without fee.
- Units/semantics of fee and yield columns (percent? fraction? gross/net?) are *not defined in the datasets*; the "פירוט שינויים פורמט חדש" XLSX in each dataset records format changes only. Not verified where the authoritative field definitions live (probably the "מקורות המידע והנחות המערכת" page on each -net site, see 1.2.2).
- Encoding: the CSV file I downloaded (gemel 2024+) is **not valid UTF-8**; it decodes correctly as cp1255 (verified; same for the pension and insurance files). The JSON datastore API returns UTF-8.
- Example of a field value (do not reuse): record `FUND_ID 259013`, "הראל-קרן י' חדשה", `REPORT_PERIOD 202609`, `AVG_ANNUAL_MANAGEMENT_FEE = 1`, from the `insurance` datastore, read 2026-10-22 (https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&limit=2&sort=_id%20desc).

Source of truth note: the -net sites say the data is reported by the institutions to the CMA ("דווחו לרשות שוק ההון... ומפורסמים לציבור לצורך מדידה והשוואה", dataset descriptions, read 2026-10-22).

#### 1.2.2 CMA web portals

| Portal | URL | Status (2026-10-22) |
|---|---|---|
| Gemel-Net | https://gemelnet.cma.gov.il/views/dafmakdim.aspx | Fetches (200, ASP.NET). Interactive comparison tool (returns by time range, vs. market indices). Same data as the dataset above; scraping not needed. |
| Pensia-Net | https://pensyanet.cma.gov.il/ | Fetches (200). Links to Gemel-Net, Bituach-Net, fee calculator, car/home/health insurance calculators. |
| Bituach-Net | https://bituachnet.cma.gov.il/ | Fetches (200); redirects to `/bituachTsuotUI/Tsuot/UI/dafmakdim.aspx`. |
| Har HaBituach ("insurance mountain") | https://harb.cma.gov.il/ | Returns 202 + JavaScript bot challenge ("verify you're not a robot"). Per search results the tool requires the person's ID and ID-issue date, i.e. personal data; not a public dataset. **Not verified.** |
| Har HaKesef ("money mountain") | gov.il service page | gov.il returns 403 to scripted fetch. **Not verified.** Personal-account lookup; no public dataset expected. |
| CMA department / guidance pages on gov.il | https://www.gov.il/he/departments/capital_market_insurance_and_savings_authority | 403. **Not verified.** Anything about fee ceilings, circulars, etc. must be read in a browser. |

Other CMA publications mentioned by search results but not located as data: annual/quarterly management-fee reviews, mandatory total-cost-of-fees disclosures from January 2024 (per a Calcalist article, a secondary claim, https://www.calcalist.co.il/market/article/rjgoai9rxx, read 2026-10-22 via search snippet only).

### 1.3 Bank of Israel (BOI)

#### 1.3.1 EDGE series database (SDMX REST API) — verified, the most useful single source

- Base: `https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/`
- Official how-to (PDF, read 2026-10-22): https://www.boi.org.il/media/upqgqpuv/extracting-representative-exchange-rates-from-the-new-series-database.pdf. Documents: data URL pattern `/data/dataflow/BOI.STATISTICS/<FLOW>/1.0/<series>?format=csv`, `startperiod/endperiod`, `lastNObservations`, `firstNObservations` (verified), formats csv / excel-series / excel-table / sdmx-json / xml (default), `labels=id|name|both`, server-side aggregation `normalisefreq=M;mean`. The PDF says FX data in the database are revised about 15 minutes after publication (around 15:45).
- Dataflow list: `GET /structure/dataflow` returns 56 dataflows (read 2026-10-22; agencies `BOI.STATISTICS` and `BOI.BankingSupervision`).
- No auth, no key. Rate limits and a formal license for EDGE: **not found**. The EDGE page footer links to the BOI "Terms of use" (SPA page not readable by script). A search-result summary of https://boi.org.il/en/terms-of-use says site material may not be copied/published/sold without BOI's prior written consent. **Not verified directly; treat redistribution as unclear** (see 1.3.4).
- Historical depth examples (queried 2026-10-22): BOI policy-rate series `MNT_RIB_BOI_D` first observation 1994-01-27; `RER_USD_ILS` first observation 1948-05-15; makam yield series first observation 1992-01-02.

Dataflows relevant to saving/investing (verified by fetching `lastNObservations=1` on 2026-10-22):

| Flow (agency) | What it holds | Freq / latest obs seen |
|---|---|---|
| `EXR` (STATISTICS) | Representative exchange rates (use `DATA_TYPE=OF00`), many currencies (the data.gov.il history files are titled "24 currencies"). Example: `RER_USD_ILS` 2026-10-22 = 3.107 (https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/?c%5BDATA_TYPE%5D=OF00&c%5BBASE_CURRENCY%5D=USD&c%5BCOUNTER_CURRENCY%5D=ILS&startPeriod=2026-10-01&format=csv, read 2026-10-22). | Daily |
| `BR` (STATISTICS) | BOI interest rate and related: `MNT_RIB_BOI_D` (policy rate), `MNT_SHIR_D`, `MNT_RIB_EFYB_D`, standing-facility rates `MNT_WIN_DEP_D`, `MNT_WIN_LN_D`. Example: `MNT_RIB_BOI_D` 2026-10-22 = 3.25 (https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BR/1.0/?format=csv&lastNObservations=1, read 2026-10-22). | Daily |
| `SECDWH` | "Securities TASE": makam gross yields by term, government-bond yields by maturity (monthly averages), Tel-Bond spreads; 87 series. Example: "Makam yield for 3 months, gross" 2026-10-21 = 3.0817604064943 (https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/SECDWH/1.0/?format=csv&lastNObservations=1&labels=name, read 2026-10-22). | Daily (makam) / monthly (bonds) |
| `ZCM` | Zero-coupon yield curve (nominal, real) and inflation expectations by horizon. Latest 2026-09. | Monthly |
| `PRI` | Price indices: CPI (including sub-indices; 2,418 series), construction input prices. | Monthly (copy of CBS) |
| `BIR_MRTG_99` | Interest rates and volumes on new housing loans by type/linkage/LTV band, total banking system (113 series). | Monthly |
| `BIR` | Interest rates/volumes, non-housing credit, total banking system (30 series at last obs). | Monthly |
| `INTEREST_DASH` (BankingSupervision; Hebrew name "דשבורד ריביות") | Per-bank monthly interest-rate series: deposits and credit by type (prime-linked, fixed, indexed), by contractual maturity band, by percentile (e.g. 50th) and as spread vs anchor/prime; 10 banks (Hapoalim, Leumi, Discount, Mercantile, Mizrahi-Tefahot, FIBI, Jerusalem, Yahav, Massad, One Zero) + system total + 3 card companies; 671 series, latest period 2026-09 (read 2026-10-22). These are *average rates actually paid*, not current offers. | Monthly |
| `FEES_DASH` ("דשבורד עמלות") | Quarterly per-bank weighted-average *actual* fees: custody fee on Israeli securities by portfolio-size band, buy/sell/redeem commission for Israeli and foreign securities by trade-size band, cost of "fee tracks" (basic/extended plan cost per usage). 10 banks; 2,155 observations over 13 quarters, 2022-Q2 to 2026-Q2 (read 2026-10-22). | Quarterly |
| `FEES_TRF` ("Fees_Taarifon") | Despite the name: *aggregate fee income by tariff section* (e.g. total income, individuals and small business, part 9) per bank/system, quarterly from 2010-Q1; **not a price list**. | Quarterly |
| `MF` | Mutual-fund sector aggregates (assets, issuance/redemption) by fund group, incl. ETFs; 125 series. Not per-fund. | Monthly |
| `INSINV2` | Institutional investors: total assets by provident funds, profit-sharing policies, old pension funds (7 series). | Monthly |
| `TLB` | Telbor rates. **Series appears discontinued** (last observation seen 2025-06-30 for most tenors; one tenor 2013-05-10). | n/a |
| Others | `DEBT_AGG`, `PS` (public sector), `BOP`, `NA`, `LBM`, `REAL_ES_DF` (real estate), `CCIR` (card-company rates), `BBS_99`/`BFR_99` (bank balance sheets/financials) etc. | various |

Not found in EDGE: an explicit "prime rate" series (the `BR` flow has five series, none called prime; `BIR`, `BIR_MRTG_99` have no series with "prime" in the name). The BOI page `/information/interestrates/primerates` exists in the sitemap but could not be read (see 1.3.3).

#### 1.3.2 Other BOI machine-readable endpoints

- `https://www.boi.org.il/currency.xml` returns **JSON** (despite the name) with current USD, GBP, JPY, EUR, AUD, CAD... rates, `currentChange` and `lastUpdate` (read 2026-10-22; e.g. USD `currentExchangeRate` 3.107, `lastUpdate` 2026-10-22T12:22:03Z).
- data.gov.il, organization `bank_israel` (30 datasets, listed 2026-10-22): bank branches, ATMs, **list of banking corporations with website links** (`375`; 17 entities, used here as a register; fields Category, Bank_Code, Bank_Name, Internet_Address, Swift, address, phone), restricted-account list (PDF/ZIP), representative FX history files (`348`-`354new`, `652`, `651` XML; marked last modified 2023-03-21) and average mortgage-rate files `371`, `374` (XLS, **stale 2023-03-21**). Prefer EDGE for these.

#### 1.3.3 BOI website pages (consumer tools, "Kav HaMashveh")

The consumer pages exist per the BOI sitemap (https://www.boi.org.il/sitemap.xml, 14,228 URLs, read 2026-10-22), for example:
`/information/interestrates/` (+ `/not-indexed/`, `/primerates/`, `/mortgage/`, `/not-residence/`, `/allbankslinks/`), `/information/fees/`, `/information/מחשבונים-וכלים/עמלות/`, `/roles/statistics/banking/deposits/`, `/roles/statistics/makamandbonds/yield/`, `/roles/supervisionregulation/policy_nbt_4reg/פרסום-שיעורי-ריבית-על-פיקדונות-ועל-יתרות-זכות-בחשבון/` (a supervision page on publishing deposit rates), `/roles/supervisionregulation/data_info/timeavrageintr/`.
**Fetch result:** all BOI HTML pages return a JS shell (identical 118,350-byte page) and some paths return a Radware "Verifying your browser" interstitial (e.g. `/consumer/`, `/information/interestrates/` via WebFetch). Content of these pages and their underlying endpoints is **not verified**. The statistics behind several of them are reachable through EDGE (table above).

#### 1.3.4 Terms for BOI data

- data.gov.il copies: data.gov.il license (1.1).
- EDGE/website: terms page not readable; a search-engine summary says prior written consent is required to copy/publish/sell site material (https://boi.org.il/en/terms-of-use, **secondary, not verified**). Also https://www.boi.org.il/website_terms/ exists (in sitemap; not fetched successfully). Open question for later: whether personal, non-published use of EDGE series is fine. (CLAUDE.md says no legal work; recorded only so the next phase knows the question exists.)

**Update 2026-10-23 (verified).** The terms text was read in Internet Archive captures (English 2025-12-13: https://web.archive.org/web/20251213012931id_/https://boi.org.il/en/terms-of-use ; Hebrew 2026-01-01: https://web.archive.org/web/20260101070723id_/https://www.boi.org.il/website_terms/ ; both pages state "last updated 17/02/2025"; the live URLs still return the JS shell or a Radware interstitial). Quote: "the user may not copy, publish, disseminate, transmit or sell any information made available this site, without the prior written consent of the BOI" / "אסור למשתמש להעתיק, לפרסם, להפיץ, לשדר או למכור חומר המופיע באתר זה ללא קבלת רשות הבנק מראש ובכתב". The EDGE home page (https://edge.boi.org.il/) carries only a cookie notice and a "Terms of use" link to that page; no separate API licence. Each EDGE observation has `CONF_STATUS=F` "Free (free for publication)", an SDMX dissemination flag, not a licence. **Republication status: not permitted without written consent.** data.gov.il fallback checked the same day: organization `bank_israel` (30 datasets) has no policy-rate, deposit-rate or CPI dataset; `381` "תשואות לפדיון על מק"מ" has one resource pointing to the retired `bankisrael.gov.il` host (does not resolve). Series verified again 2026-10-23: `MNT_RIB_BOI_D` 2026-10-23 = 3.25 (first obs 1994-01-27; changes 2026: 01-08 4.0, 05-28 3.75, 07-09 3.5, 09-03 3.25); makam `DWH_SRC_0342` (`TSB_BAGR_MAKAM_03M.D`) 2026-10-22 = 3.0225, first obs 1992-01-02; INTEREST_DASH: the per-bank *fixed-rate* household deposit averages by term band are the unnamed `BNK_<bank>001_LM_BIR_<n>_IF` series (e.g. Hapoalim 1–3 months `…_5712_IF` 2026-09 = 2.26, first obs 2024-05); their names sit in codelist `CL_BNK_WEB` of the dataflow structure under the sibling `…_LR_BIR_<n>_IF` code (`?references=all`, 1.6 MB). Per-series specs and fetch recipes: scratch report `reports/r2-series.md` (2026-10-23).

### 1.4 Ministry of Finance datasets (data.gov.il, organization `mof`) — verified 2026-10-22

| Dataset | Content | Format | Update | Note |
|---|---|---|---|---|
| `savingsplaninterest` https://data.gov.il/dataset/savingsplaninterest | Interest on "savings for every child" deposits by bank, age band, plan type, saving period; fields `INTERESTSDATE, SAVINGSPROGRAMBYAGE, AGE, BANK, SAVINGSPLAN, SAVINGSPERIOD, FIXEDWITHOUTLINKAGEVAL, FIXEDLINKEDCONSUMERPRICEINDVAL, VARIABLESPREAD`; 52,290 rows. Description says daily update, "information existing at the banks up to two years back". | CSV + datastore API | daily job (resource modified 2026-10-22T04:00) | Date column is text `dd/mm/yyyy`; I did not check the newest `INTERESTSDATE` value (the highest `_id` row I saw was dated 02/09/2025, so check before relying on freshness). |
| `accountantgeneralinterest` | Accountant General interest rates (e.g. foreign-currency interest, state-employee loan interest) with effective-from date; 13 rows. | CSV | daily job | Reference rates for public-sector debts, not savings products. |
| `goverment-domesticdebt` | Domestic government debt: tradable-bond issuance auctions (coupon, avg/cutoff gross yield, cover ratio), non-tradable bonds, redemptions, swap/reverse auctions, aggregate daily trading (TASE/MTS/OTC) per bond since 2020 (53,737 rows). | CSV + datastore | daily job | Issuance yields only, not a daily price feed. |
| Budget execution files | many | XLSX | irregular | out of scope |

**Update 2026-10-23 (verified).** `savingsplaninterest`: the datastore is stale (highest `_id` 52605 dated 02/09/2025) but the CSV file at https://data.gov.il/dataset/dcd96625-def1-45dc-a2cf-f4ad7fc2360a/resource/a737b311-c6d8-4084-9ac9-c40d0fd01125/download/file.csv is current: 5.56 MB, Windows-1255, 52,605 rows, 167 value dates from 02/09/2025 to **22/10/2026** (a rolling window of about 14 months, not two years), 9 banks and 315 rows per day; resource `last_modified` 2026-10-23T04:00. Read the file, not the datastore. Field descriptions: resource `d4b0d8f5-a0c0-4614-866c-107fe879cf26`. Licence: none attached, so the data.gov.il licence applies (https://data.gov.il/he/terms-of-use, updated 30/08/2025, read 2026-10-23: copying, distribution, derived works and commercial use allowed; source must be named). CS-23 in il-finance should be rewritten accordingly.

### 1.5 Central Bureau of Statistics (CBS)

- CPI API, verified 2026-10-22:
  - `https://api.cbs.gov.il/index/data/price?id=120010&format=json&download=false&last=3` returns monthly index value, monthly % and 12-month % per base year. Example: September 2026 "מדד המחירים לצרכן - כללי" = 105.3 (base: 2024 average) (read 2026-10-22).
  - `https://api.cbs.gov.il/index/data/price_selected?id=120010&...` returns XML with the index on all historical bases and chaining coefficients (`UpdateDate="2026-10-22T08:04:53"`).
  - `https://api.cbs.gov.il/index/data/calculator/120010?value=100&date=2020-01&toDate=2025-01&format=json` is a linkage calculator (verified; I did not verify the formula against any rule).
  - History: queried `startPeriod=01-1951&endPeriod=12-1960`, got 100 monthly records, oldest in that window 1952. So history reaches at least 1952 (read 2026-10-22).
- API doc page https://www.cbs.gov.il/he/Pages/ממשק-API.aspx (read 2026-10-22): says a `User-Agent` header is **mandatory**; covers central time-series database and price indices.
- Licensing/terms for CBS data: **not found** (the API page I read has no licence text; CBS site footer not checked).
- CPI is also copied in BOI `PRI` (EDGE).
- CBS publishes CPI monthly (the 2026-09 value was present on 2026-10-22). Exact release timetable not read.
- Other CBS datasets on data.gov.il (organization `lamas`) are not finance-related.

**Update 2026-10-23 (verified).** Licence found: https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx ("רישיון פתוח למידע באתר האינטרנט של הלשכה המרכזית לסטטיסטיקה", version 2.1, 3 January 2016; linked from the site's master-page footer as "רישיון שימוש"; the guessed "תנאי שימוש" URLs are 404). It grants a worldwide, royalty-free, perpetual, non-exclusive licence to copy, distribute, make available, and create derived works, commercial or not, and requires attribution in this form: "הלשכה המרכזית לסטטיסטיקה (הלמ"ס), [שם הקובץ/מוצר], [(תאריך כריית המידע מהאתר)], ניתן לצפייה באתר: [קישורית למידע עצמו] מועתק ומופץ כמות שהוא – as is – על פי רישיון שימוש של הלמ"ס בכתובת אתר האינטרנט [קישורית לתנאי השימוש באתר]". **Republication status: confirmed.** Release day: the CBS publication forecast (`https://www.cbs.gov.il/he/AjaxListAggregatorHandler.ashx?lists=cbspublicationforcastlistfutureitems`, read 2026-10-23) lists "מדדי המחירים לצרכן – אוקטובר 2026" on 15/11/2026 and November on 15/12/2026, i.e. the 15th of the following month. API re-verified 2026-10-23: `price?id=120010&last=3` gives 2026-09 = 105.3 (−0.5 % m/m, 1.6 % y/y; base 2024 average), `price_selected` `UpdateDate` 2026-10-23T16:30:30; a call without a User-Agent also answered today, but the API page says the header is mandatory.

### 1.6 Tel Aviv Stock Exchange (TASE)

| Item | Detail (2026-10-22) |
|---|---|
| Public site | https://www.tase.co.il (Angular SPA; `robots.txt` allows everything: `User-agent: *  Allow: /`). Content (prices, funds, indices, ETF lists, historical data) is loaded by JS from `api.tase.co.il`. |
| Scripted access to the site's own API | `https://api.tase.co.il/...` and `https://mayaapi.tase.co.il/...` answer **403 "Request Rejected" (Imperva)** to curl, even with Origin/Referer headers. Not bypassed. |
| Pages that exist (TASE sitemap, 1,088 URLs): | `/he/content/products_lobby/data_services_hub`, `/data_services_store`, `/datastore_pricelist`, `/data_vendors`, `/index_licensing`; `/he/content/data/historical_data/`, `/he/content/data/indices_yield/`; `/he/content/knowledge_center/etf_issuers_list/`; `/he/content/about/api_usage_agreement/`, `/he/content/about/terms_of_service/`. All SPA pages: **content not readable by script, terms and prices NOT verified.** |
| Developer portal | https://datahubapi.tase.co.il/ ("Developer Portal", a JS portal; `/api/v2/portal/*` paths are 404 for guessed endpoints). `datahub.tase.co.il` redirects to the TASE data-services page. |
| What the free tier covers (secondary source) | The community SDK `tasepy` v0.2.1 (PyPI JSON read 2026-10-22: https://pypi.org/pypi/tasepy/json) says it implements "the 4 free API endpoints" of TASE DataHub: Funds (fund lists, classifications, exposure profiles, tax statuses), Indices Basic (index lists and components by date), Indices Online (real-time index rates), Securities Basic (security lists, company data, trading information); additional paid products exist; an API key ("DataWise API key") is needed. Rate limits, redistribution/caching rules and price: **not found**. |
| Launch material | 2020 announcement (Mondo Visione / Israel Hayom / Funder via search) says TASE Data Hub is API-based with current, end-of-day and historical data aimed at institutions via distribution partners. Individual-investor terms not covered. |
| Related public datasets | BOI `SECDWH` (makam/bond yields, 1.3.1), BOI `MF`, MoF `goverment-domesticdebt` (1.4). No TASE dataset on data.gov.il. |

### 1.7 Israel Securities Authority (ISA / הרשות לניירות ערך)

| Item | Detail (2026-10-22) |
|---|---|
| Site | https://www.new.isa.gov.il (JS-rendered shell, 105,690 bytes for every path; `robots.txt` disallows only `/admin/`). |
| Search/register pages (exist, from `https://www.new.isa.gov.il/sitemap/supervised/sitemap_entity.xml`, 13,473 URLs; **content not readable by script**) | `/nav-index/api/mutualfunds-search`, `.../mutualfunds-archive-search`, `.../mutualfunds-foreignfunds-active-search`, `.../mutualfunds-advertising-search`, `.../consultants-marketers-search` (investment advisors/marketers), `.../licensing-advisors-*` (licensed advisors/portfolio managers: specialization, archives, exemptions), `.../exchange-search`, `.../corporations-search`, `.../credit-rating-search`, `.../double-listing-search`; information pages under `/nav-index/supervised-mutualfunds/` (158 pages). Whether these searches expose downloadable files or a JSON API: **not verified.** |
| MAGNA (electronic disclosure/distribution) | https://www.magna.isa.gov.il/ ("Magna Distribution Site", Angular SPA, 200). Public filings of funds, trustees, advisers, portfolio managers per a search result (Funder 2002 article via search snippet); content/API **not verified**. |
| MAYA (TASE company filings) | https://maya.tase.co.il/he (200, SPA); API host `mayaapi.tase.co.il` 403 (Imperva). **Not verified.** |
| On data.gov.il | No ISA organization or dataset (1.1). |
| What the ISA data would hold if reachable | Mutual-fund registry (manager, trustee, classification, prospectus/reports), advisor and portfolio-manager licence registers. Per-fund fee and return data is more reliably available from TheMarker/Funder/Bizportal (section 3) than from anything I could read on the ISA site. |

### 1.8 Tax Authority and other gov.il content

- `https://www.gov.il/*` (including `/he/departments/israel_tax_authority`, the Tax Authority landing page and brackets pages) returned **403 (bot protection)** to scripted fetch (read 2026-10-22). `taxes.gov.il` redirects into the same blocked gov.il area. **Official rate/bracket/credit-point pages could not be read.**
- data.gov.il organization `taxes-authority` has 4 datasets, all customs-related (`customsbook`, `customsbookexport`, `regularityrequirement`, `releasespeed`). **No machine-readable tax-bracket, credit-point, capital-gains or withholding table was found.**
- Secondary (non-authoritative) sources of tax tables that did fetch: Kol Zchut (https://www.kolzchut.org.il/he/מדרגות_מס_הכנסה, 200) and accountants' PDFs. A search result mentions credit-point value disagreement between a third-party calculator and Kol Zchut, which is exactly the reason not to use secondary tables for numbers. Nothing from them is recorded here.
- National Insurance Institute (Bituach Leumi) datasets on data.gov.il (minimum/maximum income for contributions, minimum wage, rates) are last modified 2023: stale.

---

## 2. Institution-published data

Legend for "Machine-readable": A = structured API/CSV/XLSX; B = PDF with extractable text; C = HTML server-rendered; D = client-rendered/blocked.

### 2.1 Banks (register: BOI list, https://data.gov.il/dataset/375, read 2026-10-22; commercial banks code: Hapoalim 12, Leumi 10, Discount 11, Mizrahi-Tefahot 20, FIBI 31, Yahav 4, Jerusalem 54, Massad 46, Mercantile 17, One Zero 18, plus "Bank Esh Israel" 3 (no site listed); also foreign banks Citibank, HSBC, Barclays, SBI; Altshuler Shaham Financial Services listed as a "financial institution" code 60)

| Bank | Fee schedule (tarifon) | Deposit rates / offers | Brokerage commission | Notes |
|---|---|---|---|---|
| **Leumi** | https://www.leumi.co.il/he/economic-info/commissions_and_fees : online chapters (`bankleumi.co.il/Commissions/private/chapters`), **PDF** `https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf` (61 pages, "updated to 01/10/2026", HTTP Last-Modified 2026-10-01) and **XLSX** `.../AmlotYechidimL.xlsx` (sheet per chapter: parts 1-9, 11, appendices) – verified. Also shortened and business tariffs (`AmlotMekuzarL`, `AmlotTaagidimL`). Stable URLs (file overwritten in place). | Not examined | Chapter 4 of the same tariff (securities); also a Leumi file on actually-charged securities commission distribution (`/leumi-hebrew/s3fs-public/newsite/amlot/Hitpalgotnetonim_acc1.pdf`, from page links; not fetched) | Class: A/B. Best machine-readable bank tarifon found. |
| **Hapoalim** | `https://www.bankhapoalim.co.il/forms/he/fee-list` (200, HTML containing ~45k characters of tariff text, plus 3 xls and many PDF links) and `/taarifon-change` (change notices). | `/interest-update` ("הודעות על שינויים בריבית"): PDF notices (one "August" notice link seen, file-name prefix 2608); the page text itself holds little data. | Part of the tariff | Class: B/C. Large pages (500-900 KB). |
| **Discount** | https://www.discountbank.co.il/private/general-information/charges-tariff/ : per-part PDF + accessible XLSX (24 PDF / 23 XLS links; file names look like `part_1_osh_11026.xlsx`, date-stamped; the date meaning is my inference). `/private/general-information/updates-on-charges-and-interest/` for change notices. | https://www.discountbank.co.il/private/savings-investments/savings-interest/ : server HTML is a template with placeholders (e.g. `{{CurrentPrimeRate}}`); data loaded via same-site XHR `/api/MoneyMarket/Saving`, `/Makam`, `/MoneyMarketFunds` (undocumented endpoints visible in page source; **not called**). Page also shows makam (15-minute delay) and money-market funds. | Part 4 of tariff (PDF/XLSX) | Class: A/B for tariff, D for deposit rates. |
| **Mercantile Discount** | PDF `https://www.mercantile.co.il/media/5sgkpskc/taarifon_private_full.pdf` (42 pages, created 2025-04-01 per PDF metadata: possibly stale vs. the live site; hashed path changes on update). | not examined | Part 4 | Class: B. |
| **Mizrahi-Tefahot** | https://www.mizrahi-tefahot.co.il/interest-list-small-buisness/ : per-chapter PDF **and XLS** (`/media/smallbusiness1..11.pdf/.xls`, fixed names; XLS is legacy binary Excel, codepage 1255 – verified downloadable). Credit-card parts on separate pages. | https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ ("money-market products"): empty table template (`{0} results`) filled by JS; columns include product name, period band, rate type, linkage, amount range, break option, renewal terms, exit points, anchor rate, spread, offered nominal and effective rate. Underlying XHR **not identified**. Also `https://sc.mizrahi-tefahot.co.il/SCServices/...` links. | Part 4 | Class: A/B for tariff, D for offers. |
| **FIBI (First International)** | https://www.fibi.co.il/private/general/commissionsrate/ (little text in HTML; tariff parts are PDFs under `fibi.co.il/media/<hash>/...`, e.g. securities part PDF `ניירות-ערך-31.pdf`); dated **change-notice PDFs** (search results list ones dated 2026-04-29, 2026-07-01, 2026-08-23, 2026-09-02). | https://www.fibi.co.il/private/depositsandsavings/interest/ ("ריביות על פיקדונות": sections for shekel accepted/additional deposits, FX deposits...) renders no numbers in server HTML. | In tariff PDF | Class: B, D. Massad and Pagi (same group, same site template) also host their own tariff PDFs (Massad securities part: `bankmassad.co.il/media/qb0h1di4/חלק-4-ניירות-ערך-46.pdf`, from search). |
| **Yahav** | https://www.bank-yahav.co.il/footer/footer-menu/bank-tariff/ (HTML with 8 PDF links). | **Dated PDF rate boards**: `https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf` ("board 13_26, effective 06/10/2026, replaces board of 03/09/2026", 8 pages, PDF created 2026-10-05), plus overdraft rate PDF and accepted-deposit table. Text-extractable tables (verified with `pdftotext`). | Part of tariff | Class: B. Shows that a "new board" PDF is issued each time rates change. |
| **Bank of Jerusalem** | https://www.bankjerusalem.co.il/others/commissions-rates : **Radware CAPTCHA** to scripted fetch; homepage fetched OK. | `/deposits-savings` pages exist (not read) | not examined | Class: D (blocked). |
| **One Zero** | https://www.onezerobank.com/ returns **403** to scripted fetch. Press describes a subscription-based fee model (secondary: Bizportal/Globes via search, not verified). | not accessible | not accessible | Class: D (blocked). |
| Other bodies | Bank Esh Israel: no site in BOI list. Foreign banks (Citibank, HSBC, Barclays, SBI): out of scope here. | | | |

Cross-bank, official: BOI `INTEREST_DASH` and `FEES_DASH` (1.3.1) cover 10 banks including One Zero, so these two flows are the only uniform cross-bank dataset for deposit/credit interest and securities fees.

Frequency evidence for tariff changes: Leumi PDF/XLSX Last-Modified 2026-10-01; Yahav board dated 2026-10-06; FIBI notices on four dates between April and September 2026; Hapoalim and Discount keep "change notice" pages. So tariffs change several times per year and deposit rates change at least monthly (per-event). I found no change-history archive for any bank (only current file + notices).

### 2.2 Investment houses, brokers and insurers

All CMA-regulated funds of these institutions are *already covered* by the CMA datasets (1.2.1) for management fees, deposit fees, yields, assets, risk metrics. The institutions' own sites add: broker tariffs, fund-family PDFs, calculators, quarterly reports.

| Institution | Brokerage/trading tariff | Fund fees / yields on own site | Status (2026-10-22) |
|---|---|---|---|
| **Meitav (Meitav Trade / Meitav Dash)** | https://www.meitav.co.il/trade (200). Tariff document not located; site pages contain order/forms PDFs (5 PDF links) and the trading rules ("takanon") page `/companies-and-business-units/trade/trade-info/takanon-trade-app/`. | Product pages (pension, gemel, study funds) are marketing HTML; fees/yields per track not found as a file. | Reachable. **Tariff not found.** |
| **Altshuler Shaham (Trade)** | PDF `https://www.as-invest.co.il/media/oqdfpafo/תעריפון-מלא-אלטשולר-שחם-טרייד.pdf` (3 pages; PDF metadata modified 2025-05-22; extractable text). | Product pages (`/interstedin/...`). Altshuler Shaham Financial Services also listed as financial institution code 60 in BOI list. | PDF verified; may be older than the live version. |
| **Yalin Lapidot** | Not found. | Fund-level fees visible on TheMarker fund pages (see 3). | `https://www.yl-invest.co.il/` returns a 212-byte Incapsula (Imperva) block page to scripts: **blocked.** |
| **IBI** | PDF `https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf` ("tariff, TASE-member exchange and investment services", 8 pages, created 2026-07-03; extractable text) linked from ibi.co.il homepage. | n/a | Verified. |
| **Interactive Israel** (inter-il.com) | HTML page https://www.inter-il.com/commission/ (mentions commission plans; no table parsed). Per a tax-adviser article and the company's own landing pages (via search), it is an introducing agent for Interactive Brokers; commissions are those of the foreign broker and Israeli tax handling differs. **Secondary, not verified.** | n/a | `www.ibkr.co.il` does not resolve; `www.inter-il.com` works (200). |
| **Mor (More Investment House)** | not found | Quarterly financial-report PDFs of the fund manager, e.g. `https://www.moreinvest.co.il/media/lgohugon/6_5_0_2025_q3.pdf` (59 pages, "דו"ח כספי - רבעון 3 2025"); `mor.co.il` redirects to the 5.9 KB shell then to `moreinvest.co.il`. | Reachable. |
| **Psagot (Psagot Trade)** | HTML page "תעריפון עמלות פסגות טרייד" (server-rendered tables and text, 1 table, ~12k characters; https://www.psagot.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f-%d7%91%d7%95%d7%a8%d7%a1%d7%94-%d7%a4%d7%a1%d7%92%d7%95%d7%aa-%d7%98%d7%a8%d7%99%d7%99%d7%93-2/). | not examined | Verified (HTML). |
| **Excellence (xnes.co.il)** | PDF `https://www.xnes.co.il/media/nwogkoos/taarifon.pdf` (6 pages, created 2026-07-15). | Part of Phoenix group (fnx calculators link "Excellence Invest"). | Verified. |
| **Phoenix** | n/a (own brokers not examined) | https://www.fnx.co.il/pension-savings/yields/ : lists "מרכיבי תשואה רבעוני", "עלון תשואות חודשי", "ריכוז תשואות מסלולים" per product family (PDF/Excel links not individually opened) and calculators on subdomains (`investroutescalc.fnx.co.il`, `gemel-calc.fnx.co.il`). Investment tracks page `/pension-savings/investment-tracks/`. | Page fetched (458 KB HTML); files not opened. |
| **Migdal** | n/a | Annual PDF booklet per product, e.g. `https://my.migdal.co.il/media/29113/7391-booklet-gemelveheshtalmut-2026_b.pdf` (76 pages, created 2026-03-12), quarterly reports `my.migdal.co.il/media/28334/makefet-quarterly-reports-300625.pdf` (from search). Homepage 4.5 MB HTML. | Reachable; PDFs verified. |
| **Harel** | n/a | Quarterly pension/gemel report PDFs under `harel-group.co.il/about/harel-group/harel-pensia-and-gemel/gemel-pensia/doclib/...` (from search result, not fetched). Product pages under `/long-term-savings/...`. | Reachable. |
| **Clal** (clalbit.co.il) | not found | not found | Homepage reachable (91 KB); nothing located. |
| **Menora Mivtachim** | n/a | `https://www.menoramivt.co.il/yields-calculator/` (insurance products yields) **behind Radware CAPTCHA** for scripted fetch; study-fund tracks page link seen. | Homepage reachable; yields page blocked. |
| **Analyst** | n/a | https://www.analyst.co.il/yield-comparison-calculator/ : a calculator for study funds/provident funds; page states its assumptions come from the Ministry of Finance Gemel-Net ("התשואות... הינן על פי אתר הגמל נט"), i.e. no independent data. | Verified (HTML). |
| **Infinity** | not found | product category pages (WordPress) only | Reachable. |
| **Ayalon (insurance)** | n/a | not examined | Radware block to scripts. |
| Others seen reachable but not analyzed: **Kesem (ksm.co.il)**, **Tachlit (tachlit.co.il)**, **More/Moreinvest**. Not reachable by script / not resolved: `mivtachim.co.il`, `hachsharat.co.il`, `blink.co.il`, `tradewin.co.il` (DNS or connection failure; may simply be wrong host guesses). | | | |

Tariff cadence evidence: IBI PDF 2026-07-03, Excellence PDF 2026-07-15, Altshuler Trade PDF 2025-05-22 (PDF metadata dates: not necessarily publication dates).

---

## 3. Market and third-party sources

| Source | What | Format/access | License/terms (read 2026-10-22) | Notes |
|---|---|---|---|---|
| **TheMarker Finance** https://finance.themarker.com/mtf/<id> | Mutual-fund page: price, change, exposure percentages, management fee, trustee fee, distribution commission, "as of" timestamp, policy-change date. Example: Yalin Lapidot (4B) equity fund `mtf/5106273`: management fee 2.32, trustee fee 0.05, distribution fee 0.35, as of 20.10.2026 03:00 (read 2026-10-22). | Server-rendered HTML (3 KB of text); `robots.txt`: `Allow: /`, only `*/options/*` disallowed | Terms https://www.themarker.com/misc/site-policy prohibit any collection/scanning/copying/mining including web crawlers, bots and AI training | Fields are fund-registry values. Human reading only. |
| **Supermarker (TheMarker comparison tool)** https://www.supermarker.themarker.com/account/CompareInvestmentAccounts.aspx | Comparison of brokerage/bank investment accounts incl. commissions and account fees; page stated "עודכן בתאריך: 14/06/2026" on 2026-10-22 (about 4 months stale); similar tools for deposits, pension, gemel, insurance | HTML | same TheMarker terms | Stale signal. |
| **Funder** https://www.funder.co.il (+ `gemel.funder.co.il`, `pensiya.funder.co.il`, `polisa.funder.co.il`, `yoatzim.funder.co.il`) | Mutual funds, gemel/study funds, pension, insurance policies, child savings, investment gemel; rankings; issuance/redemption flows | HTML (large pages, e.g. fund list 1.4 MB) | Terms https://www.funder.co.il/reg: section 14 "absolute prohibition of data mining, automatic collection, scraping, systematic copying ... whether personal, private, research or commercial"; says IP in TASE/ISA data belongs to TASE/ISA; access to data is personal; users must not publish the information | `robots.txt` also disallows several paths. Do not scrape. |
| **Bizportal** https://www.bizportal.co.il | News, fund/pension data, prices | HTML | Terms https://www.bizportal.co.il/page/terms: content is for private non-commercial use; no copying/publishing without express consent (no explicit crawler clause found by keyword search) | `robots.txt`: `Allow: /`. |
| **Globes** https://www.globes.co.il | News, market data | HTML | Terms (https://www.globes.co.il/news/article.aspx?did=1000252043): no crawlers/robots for automated search, scan, copy or retrieval; no building databases from site content | |
| **Calcalist** | not fetched | `www.calcalist.co.il` returned 403 to scripts | not read | |
| **Morningstar Israel** | **No Israel-specific site found**: `morningstar.co.il` redirects to `global.morningstar.com`. | n/a | n/a | Gap. |
| **Investing.com / il.investing.com** | Prices, FX | reachable (200) | not read | Unofficial APIs; terms not read. |
| **Kol Zchut** (https://www.kolzchut.org.il) | Rights/benefits explainers, tax/pension tables (human-written, community-maintained) | HTML | not read | Secondary reference only. |

---

## 4. Price and FX APIs for foreign securities and currencies

All entries below were tested on 2026-10-22 unless noted. None was integrated; none is a recommendation.

| Source | What | Access | Limits / terms seen | Historical |
|---|---|---|---|---|
| **BOI EDGE `EXR`** (1.3.1) | Representative ILS rates vs. many currencies, daily | REST CSV/JSON, no key | Terms unclear (1.3.4) | From 1948 (USD) |
| **ECB euro reference rates** https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml | EUR vs many currencies incl. ILS (daily XML; value `ILS 3.4824` EUR→ILS dated 2026-10-22, read 2026-10-22) | XML/CSV/90-day and history files | Terms not read | Yes |
| **Frankfurter** https://api.frankfurter.dev/v1/latest?base=USD&symbols=ILS | ECB-based FX JSON, no key (returned USD/ILS 3.1079 dated 2026-10-22, read 2026-10-22) | REST JSON | Third-party free service; terms not read | Yes (date path) |
| **open.er-api.com** (ExchangeRate-API open endpoint) | Daily FX JSON for many currencies | REST JSON, no key; response includes `terms_of_use` URL https://www.exchangerate-api.com/terms and `time_next_update_utc` (daily) | Attribution/terms in their ToS (not read) | Latest only on this endpoint |
| **Alpha Vantage** | US/global equities, ETFs, FX | API key (free) | Free tier: 25 requests/day; real-time/15-min-delayed US data premium-only (https://www.alphavantage.co/support/, read 2026-10-22). Israel (TASE) coverage not checked. | Yes |
| **Twelve Data** | Equities, FX, ETFs | API key | Pricing page: free "Basic" plan listed as "Core API requests: 8 (800 a day)", "internal non-display usage ... data cannot be displayed to users, shared externally, or used in production systems" (https://twelvedata.com/pricing, read 2026-10-22). Paid personal/commercial plans exist. Matters for any site that *displays* prices. | Yes |
| **Finnhub** https://finnhub.io/pricing | Equities/FX/crypto | API key | Page fetched but JS-driven; free-tier terms not extracted. | Partial |
| **Yahoo Finance (unofficial chart endpoint)** | prices | No official API; `query1.finance.yahoo.com/v8/finance/chart/SPY` returned **429 Too Many Requests** to plain curl | No licence for programmatic use known | n/a |
| **Stooq** | daily CSV | `stooq.com/q/d/l/?s=spy.us&i=d` returned a **JS bot-verification page** to curl | n/a | n/a |
| **FRED** (US series) | not reachable by curl (HTTP/2 error), not verified | | | |

Licensing summary: only the central-bank/public FX feeds (BOI, ECB) are clearly public-sector; for equity/ETF prices, free tiers of commercial APIs typically forbid display or redistribution of exchange data. Whether any of them carries TASE-listed ETF/fund prices was not tested.

---

## 5. Cross-cutting findings

### 5.1 Access obstacles (what the next phase must plan around)

| Host | Behaviour to plain `curl` (2026-10-22) |
|---|---|
| data.gov.il API and `data.gov.il/dataset/.../download/...` | Works. `e.data.gov.il` download URLs need Google login. Some large queries get an HTML error. |
| edge.boi.org.il (API) | Works, no key. |
| www.boi.org.il HTML pages | JS shell; some paths Radware interstitial. `sitemap.xml` and `currency.xml` work. |
| api.cbs.gov.il | Works; `User-Agent` header mandatory. |
| www.gov.il (all) | 403. |
| harb.cma.gov.il | JS bot challenge. gemelnet/pensyanet/bituachnet work. |
| tase.co.il HTML | 200 but JS shell. `api.tase.co.il`, `mayaapi.tase.co.il`: 403 (Imperva). |
| new.isa.gov.il, magna.isa.gov.il | 200 JS shells (no data in HTML). |
| Bank sites | Hapoalim, Discount, Leumi, Mizrahi, FIBI, Yahav, Massad: fetch OK. Jerusalem: Radware CAPTCHA on some paths. One Zero: 403. |
| Institution sites | Menora, Ayalon: Radware. Yalin Lapidot: Imperva block. Others fetch. |
| Aggregators | Funder/TheMarker/Bizportal/Globes fetch, but terms forbid automation (Funder, Globes, TheMarker) or restrict use (Bizportal). Calcalist 403. |

I did not attempt to circumvent any bot protection.

### 5.2 Update cadence (as observed)

| Data | Cadence | Evidence |
|---|---|---|
| CMA gemel/pension/insurance funds | Monthly data, ~3 weeks lag (period 2026-09 present on 2026-10-22); file refreshed daily | datastore max `REPORT_PERIOD` |
| BOI FX, policy rate, makam | Daily (FX after the afternoon publication) | EDGE responses dated 2026-10-21/22; BOI PDF |
| BOI per-bank interest, mortgages, CPI copy, curve | Monthly (period 2026-09) | EDGE |
| BOI per-bank fee averages | Quarterly (period 2026-Q2) | EDGE |
| CBS CPI | Monthly | API |
| MoF child-savings rates, government debt | Daily job | data.gov.il resource modified 2026-10-22 |
| Bank tariffs | Several times a year, no archive | file dates, change notices |
| Bank deposit rates | Event-driven (Yahav board replaced between 2026-09-03 and 2026-10-06) | PDF |

### 5.3 Identifiers (for joining later)

CMA `FUND_ID` (fund/track) with `MANAGING_CORPORATION_LEGAL_ID` (company registration number) and, in `transfer_bank`, the tax-authority fund approval number and track number. BOI bank codes (`REP_ENTITY` in EDGE: 12 Hapoalim, 10 Leumi, etc.; EDGE series names embed them). TASE security numbers (מספר נייר) appear in Funder/TheMarker URLs and in MoF bond `SERIES`. No published crosswalk between CMA fund IDs and TASE/ISA fund numbers was found (not applicable to non-traded gemel/pension tracks).

---

## 6. Mandatory sections

### 6.1 How I made sure coverage is complete (enumeration sources)

I enumerated from catalogues and registers, not from memory, then used the user's list only to add what was missing:

1. **data.gov.il catalogue**: `organization_list` (61 organizations; https://data.gov.il/api/3/action/organization_list?all_fields=true), `package_list` (1203 names; https://data.gov.il/api/3/action/package_list) and `package_search?fq=organization:<org>` for `cma`, `bank_israel`, `taxes-authority`, `mof`, `lamas`, `social_security` (complete listings), plus keyword searches (Hebrew) for mutual funds, securities, portfolio managers, deposits, interest, CPI, pension, "Har HaBituach", fees, bonds, FX, exchange. Result: no ISA/TASE publishers.
2. **BOI**: full `sitemap.xml` (14,228 URLs, https://www.boi.org.il/sitemap.xml) filtered for consumer/statistics/fees/interest/open-banking pages; full EDGE dataflow list (56 flows, https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/dataflow); BOI register of banking corporations (https://data.gov.il/dataset/375) as the bank list.
3. **TASE**: sitemap (https://www.tase.co.il/sitemap.xml, 1,088 URLs) for data/API/terms pages; developer portal host found through TASE data-services redirect.
4. **ISA**: sitemap index (https://www.new.isa.gov.il/sitemap.xml and `.../sitemap/supervised/sitemap_entity.xml`, 13,473 URLs) for registers, mutual-fund pages, MAGNA references.
5. **CMA fund managers and insurers**: the manager/parent-company names *in the data itself* for period 2026-09 (59 gemel managing corporations, 9 pension managers, 8 insurance parent companies; downloaded 2026-10-22) were used as the master list of institutions that report funds. From that list I checked the user's examples (Meitav, Altshuler Shaham, Yalin Lapidot, Mor, Phoenix, Migdal, Harel, Clal, Menora, Analyst, Infinity) and added Excellence, Kesem, Tachlit, Ayalon and the employee-owned/sectoral funds noted below.
6. **Brokers**: investment houses with a TASE-member broker arm (IBI, Psagot Trade, Meitav Trade, Altshuler Shaham Trade, Excellence) and Interactive Israel, from the user's list plus TheMarker/Supermarker's "compare investment accounts" tool, which lists banks and private brokers (page read 2026-10-22; I did not extract its full broker list, a follow-up).
7. **Aggregators**: Funder (+ sub-sites), Bizportal, Globes, TheMarker/Supermarker, Calcalist, Morningstar, Investing.com.
8. **FX/price APIs**: BOI, ECB, Frankfurter, ExchangeRate-API, Alpha Vantage, Twelve Data, Finnhub, Yahoo, Stooq, FRED.

Items I added beyond your list (per "lists are starting points"): MoF datasets (child-savings rates, Accountant General rates, government debt), BOI EDGE flows (INTEREST_DASH, FEES_DASH, SECDWH, ZCM, MF, INSINV2), `transfer_bank` dataset, BOI `currency.xml`, CBS calculator endpoint, Kol Zchut, Supermarker, Interactive Israel, Excellence, Kesem, Tachlit, Massad/Pagi/Mercantile, ECB/Frankfurter/other FX APIs.

Known weakness in coverage: for institutions where fetch failed or stopped at the homepage (Clal, Infinity, Meitav tariff, Yalin Lapidot, Menora yields, One Zero, Jerusalem tariff), I do not know where/if they publish tariff or yield files. The CMA datasets make this less important for fund fees/yields but not for broker/bank tariffs.

### 6.2 What I deliberately left out, and why

- **Collecting any data** (task was a survey; nothing written under `data/`).
- **Tax rules and thresholds** (Tax Authority brackets, credit points, capital-gains, pension-deposit deductibility, linkage/indexation rules): per CLAUDE.md these must come from the `il-finance` skill (not yet existing); I recorded only where the official pages are and that they were not machine-readable or fetchable.
- **Personal-data sources**: Har HaBituach, Har HaKesef, pension clearinghouse (Mislaka), bank "open banking" APIs, broker account exports. They need the person's identity or credentials; whether the product wants them is a product decision not yet made.
- **Mortgages, credit cards, consumer loans, car/home/health insurance**, real estate, crypto: not saving/investing instruments in the brief; I mention BOI mortgage-rate series only because they are in the same API.
- **Company-level filings** (MAYA/MAGNA individual reports, financial statements, prospectuses): not needed for saving/investing comparison at this stage.
- **Foreign brokers' own global price lists** (e.g. Interactive Brokers' commission pages): out of the Israeli-institution scope; only the Israeli agent was noted.
- **Reverse-engineering undocumented JSON endpoints** behind bank/insurer pages (e.g. Discount `/api/MoneyMarket/*`): not called; possible future option but a terms/ethics decision for the owner.
- **Bypassing bot protection** (Radware, Imperva, Incapsula, gov.il WAF): not attempted.
- **Legal/commercial/accessibility analysis**: out of scope per CLAUDE.md. I recorded what the terms of use *say* about automated collection because it determines feasibility, not as a legal opinion.
- **Employee/sector-specific funds** (e.g. teacher, civil-service, Bank Leumi employees' funds): these appear as managing corporations in the CMA data (59 managers in 202609) and are covered there; no separate site check.

### 6.3 Open questions and gaps (data that seems not to be published, or that I could not read)

1. **Tax Authority rate tables as data**: none found in machine-readable form; gov.il blocks scripts. Needs a human/browser pass or a curated source via the `il-finance` skill.
2. **TASE prices, ETF/fund lists, history, and DataHub terms**: not verified. Unknown: free-tier scope (only a third-party SDK says four free endpoints), rate limits, whether a personal website may display the data, price of paid tiers, historical depth.
3. **ISA mutual-fund registry and advisor/portfolio-manager registers**: pages exist but are JS-only; unknown whether exportable. No per-fund fee/yield dataset from ISA found. **Gap: per-fund mutual-fund fees and net returns have no official open dataset I could reach**; they exist on TheMarker/Funder/Bizportal whose terms restrict automation.
4. **Bank fee schedules**: no uniform, machine-readable cross-bank price list. Leumi (PDF+XLSX), Mizrahi (XLS), Discount (XLSX) are structured; others PDF or blocked (Jerusalem, One Zero). **No historical archive of tariffs** found (a change-over-time view would need Wayback or periodic snapshots).
5. **Current deposit offers by bank/product**: client-rendered or dated PDFs; BOI gives only monthly averages (INTEREST_DASH). **No official feed of the offers a customer would actually see**; the BOI "Kav HaMashveh" deposit comparison exists but is unreadable by script (JS/Radware). Spreads for prime-linked deposits are in the BOI per-bank series, but I did not decode the series dictionary fully.
6. **Prime rate**: no EDGE series found; page `/information/interestrates/primerates` unreadable. Whether the prime rate is derivable from the BOI policy rate is a *rule*, not stated here.
7. **Brokerage commissions of non-bank brokers**: IBI, Psagot, Altshuler, Excellence located as PDF/HTML; Meitav, Yalin Lapidot, Interactive Israel numbers not extracted (Meitav tariff not found; Yalin blocked; Interactive Israel HTML not parsed).
8. **Negotiated/discounted management fees** that individual savers actually pay (the CMA data holds *average* fees per track): not published anywhere I found; only per-customer in annual statements or Har HaBituach/clearinghouse.
9. **Gemel/pension fund holdings (asset lists)**: published through 2023-03-21 only (stale datasets).
10. **Definitions of fee/yield fields and units in the CMA datasets** (percent vs fraction; gross/net of fee; how "AVG_ANNUAL_MANAGEMENT_FEE" is averaged): not found in the dataset descriptions; probably on the -net "sources and assumptions" pages (not fetched). Must be confirmed before any display.
11. **Terms for BOI EDGE and CBS data**: BOI site terms (secondary source) say prior written consent for copying/publishing; CBS licence not found. data.gov.il copies of BOI data are under the open data.gov.il licence. Unclear which governs EDGE.
12. **Freshness of the MoF child-savings dataset**: newest `INTERESTSDATE` not confirmed; description says up to two years of daily data.
13. **Morningstar Israel / independent fund ratings**: no Israeli source found; Funder has its own fund ranking ("סופר פאנדר", link seen on its home page, not read).
14. **Yield data of the "kupot" net of tax or net of fees**: not published in the datasets (gross yields, fees separate).
15. **Foreign-security prices with a licence permitting display on a personal site**: only FX from public bodies was clear-cut; equities/ETFs: unresolved. TASE-listed funds in USD/ILS: not tested at any API.
16. **Unchecked institutions**: Clal, Infinity, Meitav (tariff), Yalin Lapidot, Menora (yields), Ayalon, One Zero, Bank of Jerusalem tariff — blocked or not located.

---

## 7. Appendix: attempts that failed or were incomplete (2026-10-22)

| URL / host | Result |
|---|---|
| https://www.gov.il/* (Tax Authority, CMA department, Har HaKesef, API) | 403 |
| https://harb.cma.gov.il/ | 202 + JS challenge |
| https://api.tase.co.il/*, https://mayaapi.tase.co.il/* | 403 Imperva "Request Rejected" |
| https://www.tase.co.il/*, https://maya.tase.co.il/*, https://www.magna.isa.gov.il/, https://www.new.isa.gov.il/* | 200 but JS shell with no data |
| https://datahubapi.tase.co.il/ | 200 JS developer portal; no readable catalogue |
| https://www.boi.org.il/ pages (consumer, interest rates, fees, terms) | JS shell, or Radware interstitial |
| https://www.onezerobank.com/ | 403 |
| https://www.bankjerusalem.co.il/others/commissions-rates | Radware CAPTCHA |
| https://www.yl-invest.co.il/ | Incapsula block |
| https://www.menoramivt.co.il/yields-calculator/, https://www.ayalon-ins.co.il/ | Radware |
| https://www.calcalist.co.il/ | 403 |
| e.data.gov.il resource URLs | 302 to Google login (use data.gov.il host) |
| data.gov.il `package_search?rows=200`, SQL with `GROUP BY` | HTML error page |
| https://fred.stlouisfed.org/docs/api/fred/ | connection error from curl |
| Yahoo chart endpoint, Stooq CSV | 429 / JS verification |
| `ibkr.co.il`, `mivtachim.co.il`, `hachsharat.co.il`, `blink.co.il`, `tradewin.co.il` | did not resolve (host guesses, may be wrong) |
| Paywalled/unknown: TASE price list and API usage agreement, BOI terms of use text, CBS terms | not read |

Working scratch files (downloads and scripts) are in the session scratchpad only, not in the repo.
