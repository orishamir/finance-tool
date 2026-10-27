# CMA fund catalogue, track naming and the catalogue of every option

Checked: 2026-10-22 (fee fields re-checked 2026-10-23, CAT-35 to CAT-41) · Owner: domain-specialist
Serves: product.md 3.10 (catalogue of every option), 3.4 (workbench, tracks), 3.6 (holdings review), dependency 4 (CMA field definitions, discovery O11) and 6a (`data/catalog/`), § 6 refresh; roadmap R1 (catalogue, CMA refresh), R3 (tracks workbench)
Scope: in: the three CMA monthly datasets on data.gov.il (Gemel-Net, Pension-Net, Bituach-Net) and the `transfer_bank` crosswalk; what each field means, its unit, period and gross/net basis as far as sources allow; identifiers (fund vs track); classification and specialization values; how merged and renamed tracks appear; the CMA circular on investment tracks (naming, categories, defaults); the Meitav kupat gemel lehashkaa case end to end; where the ISA-side fund list is (not found); refresh and new-period detection. Out: fee caps and transfer rules (`provident-family-common.md`), wrapper rules (`kupat-gemel-lehashkaa.md`, `keren-hishtalmut.md`, `pension-and-gemel-lekitzba.md`, `child-savings.md`, `ira-self-directed.md`), tax (tax files), the meaning of ISA exposure codes (`mutual-funds-and-money-market-funds.md`).

## Summary

- The CMA publishes one row per **track** per month for every provident, study, investment-provident, child-savings, pension and insurance savings track, on data.gov.il, history from 1999. Each dataset ships a CMA field dictionary (resource "פירוט שינויים פורמט חדש ..."), which states that amounts are in NIS millions and yields are **nominal gross** (CAT-02 to CAT-04). This closes part of discovery O11; fee averaging, risk-measure method and exposure units remain open or inferred (CAT-06, CAT-07, CAT-03).
- **Fee fields (2026-10-23).** `AVG_ANNUAL_MANAGEMENT_FEE` and `AVG_DEPOSIT_FEE` are percent values (of assets per year; of deposits) and hold the **average actually charged over the latest completed calendar year**: in October 2026 both portals label them "לשנת 2025" / "בשנת 2025" (CAT-35, CAT-36). The CMA defines the same-named member-report figure as the rate "שגבתה הקופה בפועל מכלל העמיתים" (after discounts, CAT-37); the identity with the dataset field is inferred. Pension fees are per fund, not per track (CAT-39). Empty means not reported, not zero (CAT-40). The weighting of the average is still not stated by the CMA (OQ2).
- In Gemel-Net, `FUND_ID` is the **track's** income-tax number. The fund (קופה) number, for example Meitav's 7857 "מיטב גמל להשקעה", is not in Gemel-Net. It is in the `transfer_bank` dataset, which maps fund number to track number (CAT-09, CAT-30).
- Since the CMA circular on investment tracks (2022-9-28 as amended by 2022-9-30), a track's name must match the CMA's list of tracks and its policy. Misleading words such as "בטוחה" or "סולידית" are banned. Specialized tracks fall into five clusters (CAT-14 to CAT-21). Institutions implemented the new names on 1.7.2024. The CMA's list itself was not obtained (open question 9).
- Meitav: in report period 202609, kupat gemel lehashkaa fund 7857 has **16** public tracks and exactly **one** named "כללי" (7978), which Meitav marks as the default track at joining. The data rules out two distinct "general" investment-provident tracks at Meitav. What the app's duplicate is could not be seen without the app (CAT-25 to CAT-28, open question 12).
- The same standard track name can hold quite different mixes at different managers, and the actual mix can change without a rename (CAT-12, CAT-24). The catalogue must show the CMA record (classification, fee, exposures with date), not infer content from the name.

## Rules

### CAT-01 The three CMA monthly fund datasets and their resources
- Rule: The CMA (organization `cma`) publishes on data.gov.il three monthly datasets: Gemel-Net (`gemelnet`, provident, study, investment-provident, child-savings, central severance and other-purpose funds), Pension-Net (`pensia-net`, new and general pension funds) and Bituach-Net (`insurance`, life-insurance savings tracks). Each dataset has three CSV resources (1999–2022, 2023, 2024 to date) plus a field-dictionary XLSX. All are datastore-enabled, so they can be queried by API.
- Conditions / exceptions: Gemel-Net's source page in the metadata is `http://gemelnet.mof.gov.il/views/dafmakdim.aspx`, a host that did not resolve on 2026-10-22. The Gemel-Net and Pension-Net licence is "Other (Open)". **Bituach-Net shows no licence** (license fields empty). The general data.gov.il terms are in data-landscape 1.1.
- Figures: resource IDs: Gemel-Net 1999–2022 `91c849ed-ddc4-472b-bd09-0f5486cea35c`, 2023 `2016d770-f094-4a2e-983e-797c26479720`, 2024+ `a30dcbea-a1d2-482c-ae29-8f781f5025fb`, dictionary `76ad9eed-d076-46d6-96e2-a4eb8e045444`. Pension-Net: `a66926f3-e396-4984-a4db-75486751c2f7`, `4694d5a7-5284-4f3d-a2cb-5887f43fb55e`, `6d47d6b5-cb08-488b-b333-f1e717b1e1bd`, dictionary `b58b5a80-84b7-490d-ab02-bff12f1941b2`. Bituach-Net: `584e6b69-174f-46c9-b8db-03925b4c68c6`, `672090ba-7893-4496-a07c-dc7e822cbf18`, `c6c62cc7-fe02-4b18-8f3e-813abfbb4647`, dictionary `388992c7-0280-48d8-b147-13e636bd804d`. The Gemel-Net 2024+ resource held 23,800 rows on 2026-10-22.
- Source: [package_show gemelnet](https://data.gov.il/api/3/action/package_show?id=gemelnet), [package_show pensia-net](https://data.gov.il/api/3/action/package_show?id=pensia-net), [package_show insurance](https://data.gov.il/api/3/action/package_show?id=insurance) · checked 2026-10-22 · primary
- Dimensions: regulator, reporting-obligation
- Likely to change: yes. Resources are split by year; a new split, for example a 2026+ file, would change resource IDs (CAT-29).

### CAT-02 The CMA field dictionaries exist and define each field
- Rule: Each dataset's XLSX resource is a field dictionary. Gemel-Net's is named "פירוט שינויים פורמט חדש גמל", Pension-Net's "פירוט שינויים פורמט חדש פנסיה", Bituach-Net's "פירוט שינויים פורמט חדש ביטוח". Each row gives the system field name, its Hebrew display name, a Hebrew description, a type, the old-format field name, and notes. These are the CMA's own field definitions; the terms table below copies the Hebrew display names.
- Conditions / exceptions: The dictionaries date from 2018. The resource descriptions say they record the move to the new format. Several descriptions only repeat the display name. The gemel dictionary's specialization lists predate the 2024 track reform (CAT-10). Twelve gemel, 22 pension and 13 insurance rows are marked "הוסר" (removed). Among the removed old fields are `MISPAR_KUPA_AV` (old name meaning parent fund number) and `TAARICH_SIUM_PEILUT` (end-of-activity date), and in pension `ID_MASLUL_RISHUY`. So the current files carry **no parent-fund number for gemel and no closure date**.
- Figures: 46 rows (gemel), 57 (pension), 39 (insurance), read 2026-10-22.
- Source: [Gemel-Net dictionary](https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444&limit=100), [Pension-Net dictionary](https://data.gov.il/api/3/action/datastore_search?resource_id=b58b5a80-84b7-490d-ab02-bff12f1941b2&limit=100), [Bituach-Net dictionary](https://data.gov.il/api/3/action/datastore_search?resource_id=388992c7-0280-48d8-b147-13e636bd804d&limit=100), [resource_show gemel dictionary](https://data.gov.il/api/3/action/resource_show?id=76ad9eed-d076-46d6-96e2-a4eb8e045444) · checked 2026-10-22 · primary
- Dimensions: reporting-obligation
- Likely to change: no (unchanged since 2018), but the data has moved past it (CAT-10).

### CAT-03 Units: amounts in NIS millions; rates in percent
- Rule: The dictionaries' general note 1 says "סכומים במיליוני ₪" (gemel, insurance) and "כלל הסכומים הנקובים בשורה הינם במיליוני שקלים" (pension). So `DEPOSITS`, `WITHDRAWLS`, `INTERNAL_TRANSFERS`, `NET_MONTHLY_DEPOSITS` (pension: `MONTHLY_DEPOSITS`) and `TOTAL_ASSETS` are NIS millions at the period end. Fee and yield fields are **percent values** (0.61 means 0.61%), not fractions. `LIQUID_ASSETS_PERCENT` is a percent of the track's assets ("אחוז הנזילות של נכסי הקופה").
- Conditions / exceptions: Percent units are confirmed by the institution's own display of the same numbers with a % sign. Meitav shows track 7978's fee as 0.61% and the CMA field shows 0.61. Meitav also shows assets "באלפי ש"ח" equal to the CMA value times 1,000, for example 3,884,432 against 3884.43. **Inferred, not stated:** `STOCK_MARKET_EXPOSURE`, `FOREIGN_EXPOSURE` and `FOREIGN_CURRENCY_EXPOSURE` are NIS millions, not percent. In 202609, track 13259 (S&P 500) shows 1284.46 against total assets of 1291.02, and track 103 shows 12378.07 against 25706.14. Their share of assets is a computation (exposure ÷ `TOTAL_ASSETS`). Whether exposure is measured net of derivatives or by look-through is not stated (open question 4). Note that the dictionary types several percent fields as `int(10)`, while the live datastore types them numeric with decimals.
- Figures: n/a
- Source: dictionaries as in CAT-02, rows `DESCRIPTION1`, `LIQUID_ASSETS_PERCENT`; [Gemel-Net record example, latest period](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=1&sort=REPORT_PERIOD%20desc); [Meitav kupat gemel lehashkaa tracks page](https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/) · checked 2026-10-22 · primary (amounts, liquidity), institution (percent display), inferred (exposure units)
- Dimensions: fee-management-balance, fee-deposit, currency
- Likely to change: no

### CAT-04 Yields are nominal and gross of management fees
- Rule: All yield fields are nominal and gross: "תשואות נומינליות ברוטו" (gemel, insurance); "כלל התשואות הפיננסיות הינן נומינליות ברוטו" (pension). Meitav's page, which shows the same values, says "התשואה הינה לפני ניכוי דמי ניהול" (the yield is before deducting management fees). So a saver's net return requires subtracting the fee the saver actually pays, which is not in the data (data-landscape 6.3 item 8).
- Conditions / exceptions: The CMA dictionary says "ברוטו" without saying what else, besides management fees, is or is not deducted (for example direct investment expenses). This stays open (open question 2). Yields are not net of tax.
- Figures: n/a
- Source: dictionaries (CAT-02) rows `DESCRIPTION2`; [Meitav tracks page](https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/) footnote · checked 2026-10-22 · primary, institution
- Dimensions: fee-management-balance, real-vs-nominal
- Likely to change: no

### CAT-05 Yield period conventions
- Rule: `REPORT_PERIOD` is yyyymm. `MONTHLY_YIELD` is the yield for that month. `YEAR_TO_DATE_YIELD` is cumulative from the start of the calendar year to the report month; before the format change it was a 12-month cumulative figure (dictionary note "היה מצטברת ל12 חודשים, הפך למתחילת שנה"). `YIELD_TRAILING_3_YRS` and `_5_YRS` are cumulative over 3 and 5 consecutive years (old names `..._36_HODASHIM`, `..._60_HODASHIM`). `AVG_ANNUAL_YIELD_TRAILING_3YRS` and `_5YRS` are average annual yields over the same windows.
- Conditions / exceptions: **Inferred from the data, not stated by the CMA:** the average annual figures are geometric (compound) annualisations of the cumulative ones. 7978 in 202609: (1 + 45.15%)^(1/3) − 1 = 13.22%, matching the field; 5 years: (1 + 47.10%)^(1/5) − 1 = 8.02%, matching. 7860: (1 + 82.45%)^(1/3) − 1 = 22.19%, matching. It is also inferred that the 36- and 60-month windows end at the report month. Trailing fields are null when the track is younger than the window (Meitav 15347 to 15351 in 202609). In pension, yields were published at both fund and track level until 12/2016 and at track level only from 01/2017. In 2023 rows, `SPECIALIZATION` was null for many tracks (CAT-10).
- Figures: n/a
- Source: Gemel-Net dictionary rows 8, 20 to 25; Pension-Net dictionary rows 3, 21; [Meitav gemel lehashkaa 202609 yields](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=50&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קופת%20גמל%20להשקעה"}&q=מיטב) (my computation) · checked 2026-10-22 · primary (definitions), inferred (annualisation)
- Dimensions: real-vs-nominal
- Likely to change: no

### CAT-06 Fee fields: average rates, apparently for the previous year
- Rule: `AVG_ANNUAL_MANAGEMENT_FEE` is "שיעור דמי ניהול ממוצעת שנתי – נכסים", the average annual management-fee rate on assets. `AVG_DEPOSIT_FEE` (pension: `AVG_FEE_ON_DEPOSITS`) is "שיעור דמי ניהול ממוצעת- הפקדות", the average rate on deposits. Both are percent (CAT-03). They are averages across the track's members, not the price a given saver pays and not a list price.
- Conditions / exceptions: The CMA does not define the averaging (asset-weighted or member-weighted) or the period. Two sourced facts point to "average actually charged in the previous calendar year". (1) The CMA portals label the pair with the latest completed year ("לשנת 2025", CAT-36); as a named example, Meitav labels the same numbers "דמי ניהול ממוצעים מצבירה בשנה קודמת" and "דמי ניהול ממוצעים מהפקדה משנה קודמת" ([Meitav reports page](https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/), checked 2026-10-25, institution). (2) In the data the value changes only in January: 7978 was 0.57 (2024), 0.60 (2025), 0.61 (2026); 7860 was 0.54, 0.58, 0.59. A track with no prior year has null fees: 15472 in 202609; 14270 in 2023, inception 2023-01-01. Treat "previous-year average" as **institution-labelled and data-consistent, not CMA-defined** (open question 2). In Pension-Net, every Meitav comprehensive track in 202609 shows the same fees (0.11 and 1.25), which suggests the fee is reported at fund level (inference, open question 15). The fee caps themselves are in `provident-family-common.md`.
- Figures: Meitav kupat gemel lehashkaa, 202609: see CAT-25.
- Source: [גמל-נט: מילון השדות](https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444&limit=100), rows 18 to 19 · checked 2026-10-25 · primary; [גמל-נט: סדרת קופה 7978](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"FUND_ID":7978}&sort=REPORT_PERIOD) · checked 2026-10-25 · primary; [גמל-נט: סדרת קופה 7860](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"FUND_ID":7860}&sort=REPORT_PERIOD) · checked 2026-10-25 · primary · inferred (January change)
- Scope: general
- Dimensions: fee-management-balance, fee-deposit, fee-change-over-time
- Likely to change: yes. The value changes every January: seen in the rows of two tracks here and of four in CAT-36, whose portal labels name the year.
- **[2026-10-23 browser pass: unit confirmed on both portals (CAT-35); period confirmed as the latest completed calendar year, labelled on the portals (CAT-36); "average" is the rate actually charged after discounts under the CMA's member-report definition, identity with the field inferred (CAT-37); pension fees are per fund (CAT-39). Averaging weight still open (OQ2).]**

### CAT-07 Risk and liquidity fields
- Rule: `STANDARD_DEVIATION` is "סטית תקן – 5 שנים עוקבות" (old name `STIAT_TEKEN_60_HODASHIM`). `ALPHA` is "אלפא שנתית": "חישוב אלפא שנתית של תשואות הקופה על סמך התשואה החודשית של 60 החודשים האחרונים", an annual alpha computed from the last 60 monthly yields. `SHARPE_RATIO` is "שארפ ריבית חסרת סיכון": "מדד שנתי של תשואות ... ביחס למדד ריבית ללא סיכון, על סמך התשואה החודשית של 60 החודשים האחרונים", an annual measure against a risk-free interest index over 60 months. `LIQUID_ASSETS_PERCENT` is the liquidity percentage of the track's assets.
- Conditions / exceptions: The following are not defined in any source read: the alpha benchmark, the risk-free index, whether the standard deviation is annualised, and what counts as "liquid" (open question 3). Meitav shows the standard deviation without a % sign (for example 5.99 for 7978). Per product.md section 4, the site does not rank by past return; these fields are history only.
- Figures: n/a
- Source: dictionaries (CAT-02) rows 26 to 29 (gemel), 27 to 30 (pension), 18 to 21 (insurance) · checked 2026-10-22 · primary · links from the cited rules: [1](<https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444&limit=100>), [2](<https://data.gov.il/api/3/action/datastore_search?resource_id=b58b5a80-84b7-490d-ab02-bff12f1941b2&limit=100>), [3](<https://data.gov.il/api/3/action/datastore_search?resource_id=388992c7-0280-48d8-b147-13e636bd804d&limit=100>), [4](<https://data.gov.il/api/3/action/resource_show?id=76ad9eed-d076-46d6-96e2-a4eb8e045444>)
- Dimensions: liquidity-lockup (only in the sense of asset liquidity inside the track, not saver access)
- Likely to change: no

### CAT-08 Flow fields, and how mergers show in the flows
- Rule: `DEPOSITS` are deposits by salaried and self-employed members, excluding transfers. `WITHDRAWLS` (sic) are payments to members, excluding transfers. `INTERNAL_TRANSFERS` is net transfers: in from other provident funds minus out to other funds (gemel); pension's description reads "העברות בין המסלולים". `NET_MONTHLY_DEPOSITS` is deposits − withdrawals ± transfers.
- Conditions / exceptions: The pension dictionary describes the net field as "(משמאל לימין) העברות + משיכות - הפקדות", which contradicts the data. Data check: Meitav pension track 1589, 202609: 41.29 − 3.61 + 143.12 = 180.8, matching the field. So use deposits − withdrawals + transfers for both datasets (my computation). **Inferred from one case:** a track merger is not recorded as a transfer. In 202407 Meitav track 7981 went to 0 assets and track 7862's assets rose from 63.31 to 125.92 while 7862's `INTERNAL_TRANSFERS` was −2.41. Meitav's notice confirms the merger of 7981 into 7862 on 1.7.24 (CAT-13).
- Figures: n/a
- Source: dictionaries (CAT-02) rows 13 to 16; [Meitav gemel lehashkaa 202406 to 202408](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"REPORT_PERIOD":[202406,202407,202408],"FUND_CLASSIFICATION":"קופת%20גמל%20להשקעה"}&q=מיטב); [Pension-Net Meitav 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=3&sort=REPORT_PERIOD%20desc&q=מיטב) · checked 2026-10-22 · primary, inferred
- Dimensions: transfer-switch-process
- Likely to change: no

### CAT-09 Identifiers: a Gemel-Net "fund" row is a track; the fund number lives elsewhere
- Rule: Gemel-Net `FUND_ID` ("מס' הקופה") is "מספר מס הכנסה של קופת הגמל. זיהוי יחודי לקופה". In practice it is the **track's** income-tax number: every one of the 764 distinct `FUND_ID`s of Gemel-Net 202609 appears as a track number ("מספר מסלול השקעה") in the CMA's own transfer dataset `transfer_bank` ("פרטי קופות לצורך העברת כספים בין גופים מוסדיים"), and 85 of them also as a fund number, where fund and track share one (join over every row, run 2026-10-26). Example (named): Meitav's documents list fund "מיטב גמל להשקעה (מספר מס הכנסה 7857)" with tracks numbered 7978, 7860 and so on ([Meitav merger notice](https://www.meitav.co.il/media/41anarx5/%D7%9E%D7%99%D7%96%D7%95%D7%92-%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94-7981.pdf), pp.1, 3, checked 2026-10-25, institution). Gemel-Net has no column for the umbrella fund number (the old `MISPAR_KUPA_AV` was removed, CAT-02). In Pension-Net, `FUND_ID` is "מס' המסלול" (track number, "מספר אוצר של המסלול בקרן הפנסיה") and `PARENT_COMPANY_ID` ("מספר קרן") is the fund number: 163 = "מיטב פנסיה מקיפה". In Bituach-Net, `FUND_ID` is the track number and `PARENT_COMPANY_ID` is the insurer's licence number ("מספר רישיון החברה"). The CMA circular's model joining form also refers to "מספר מס הכנסה של המסלול", the track's own income-tax number.
- Conditions / exceptions: `MANAGING_CORPORATION_LEGAL_ID` is the managing company's registration number (Meitav: 512065202). `CONTROLLING_CORPORATION` is the controlling corporation (Meitav: "מיטב דש השקעות בע"מ"). To get the fund number for a gemel, study or investment-provident track, join with `transfer_bank` (CAT-30).
- Figures: n/a
- Source: [גמל-נט: מילון השדות](https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444&limit=100), row `FUND_ID` · checked 2026-10-25 · primary; [פנסיה-נט: מילון השדות](https://data.gov.il/api/3/action/datastore_search?resource_id=b58b5a80-84b7-490d-ab02-bff12f1941b2&limit=100), rows `FUND_ID`, `PARENT_COMPANY_ID` · checked 2026-10-25 · primary; [רשות שוק ההון (data.gov.il): פרטי קופות לצורך העברת כספים בין גופים מוסדיים](https://data.gov.il/api/3/action/package_show?id=transfer_bank), field "מספר מסלול השקעה", joined with the Gemel-Net 202609 rows · checked 2026-10-26 · primary; [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), p.10, appendix form, footnote 1 · checked 2026-10-25 · primary
- Scope: general
- Dimensions: reporting-obligation
- Likely to change: no

### CAT-10 Classification and specialization fields and their current values
- Rule: Four fields classify a row. (1) `FUND_CLASSIFICATION`, the product type. (2) `TARGET_POPULATION`, open to all or to a sector or employer. (3) `SPECIALIZATION` and (4) `SUB_SPECIALIZATION`, the primary and secondary investment specialization. These are the CMA-side keys for the catalogue's "what is this" and for 3.6's fit check.
- Conditions / exceptions: Values read from the live data. Spelling and spacing should be confirmed from the raw cp1255 CSV before exact matching (open question 20).
  - Gemel-Net `FUND_CLASSIFICATION` (2024+): "תגמולים ואישית לפיצויים", "קרנות השתלמות", "קופת גמל להשקעה", "קופת גמל להשקעה - חסכון לילד", "מרכזית לפיצויים", "מטרה אחרת". The dictionary's description instead says "קופת גמל להשקעה חיסכון לכל ילד".
  - Pension-Net: "קרנות חדשות", "קרנות כלליות".
  - Bituach-Net uses `FUND_CLASSIFICATION` for the policy issue period ("תקופת הקמת המסלול"): "פוליסות שהונפקו בשנים 1990-1991", "פוליסות שהונפקו בשנים 1992-2003", "פוליסות שהונפקו החל משנת 2004".
  - `TARGET_POPULATION`: "כלל האוכלוסיה", "עובדי מפעל/גוף מסויים", "עובדי סקטור מסויים" (spelled with a double yod in the data, read 2026-10-26).
  - `SPECIALIZATION` / `SUB_SPECIALIZATION` in Gemel-Net 202609: 35 pairs.
    - אג"ח: אג"ח; אג"ח צמוד מדד; משולב מניות; פאסיבי
    - הלכתי: הלכה איסלאמית; הלכה יהודית
    - כללי: כללי; ללא מניות; עד 10% מניות
    - מבטיח תשואה: מבטיח תשואה
    - מדד: מדד; מניות; עוקב מדדים גמיש
    - מדרגות: עד 50; 50-60; 60 ומעלה
    - מודל חכ"מ אחר: חיסכון לילד -חוסכים המעדיפים סיכון מועט / בינוני / גבוה
    - מניות: מניות
    - מתמחים באפיקי השקעה סחירים: אג"ח ממשלתי סחיר; אג"ח סחיר; מניות סחיר; משולב סחיר
    - מתמחים בניהול אקטיבי: אג"ח ממשלות; אשראי ואג"ח; כספי (שקלי); מניות
    - עוקבי מדדים: עוקב מדדים - גמיש; עוקב מדדי מניות; עוקב מדדי אג"ח; עוקב מדד s&p 500
    - קיימות: קיימות
    - שיקלי: שקלי; שקלי טווח קצר
  - Other 2024+ `SPECIALIZATION` values that do not occur in 202609: "ישראל", "חו"ל", "ללא סיווג", "מתמחה אחר" (read 2026-10-22 with a `datastore_search_sql` DISTINCT query; data.gov.il now answers those queries with an HTML page, so this line was not re-checked).
  - The 2018 dictionary lists older values (כללי, מניות, אג"ח, מט"ח, שקלי, מדד, חו"ל, ישראל, הלכתי, חכ"מ, אחר) and ends its sub-specialization list with "וכו'". It is out of date.
  - The new categories ("מתמחים בניהול אקטיבי", "מתמחים באפיקי השקעה סחירים", "עוקבי מדדים") appear from 2024. In 2023 the same Meitav tracks had null specialization.
  - Pension-Net and Bituach-Net have no specialization or target-population fields.
- Figures: 764 Gemel-Net rows in 202609.
- Source: [גמל-נט 202609: סיווג, אוכלוסיית יעד, התמחות ותת-התמחות של כל המסלולים](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=1000&fields=FUND_CLASSIFICATION,TARGET_POPULATION,SPECIALIZATION,SUB_SPECIALIZATION&filters={"REPORT_PERIOD":202609}) (764 rows; the values above are the distinct values of these columns, 35 specialization pairs) · checked 2026-10-26 · primary; [פנסיה-נט 202609: ערכי סיווג הקרן](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=1000&fields=FUND_CLASSIFICATION&filters={"REPORT_PERIOD":202609}) · checked 2026-10-26 · primary; [ביטוח-נט 202609: ערכי סיווג](https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&limit=1000&fields=FUND_CLASSIFICATION&filters={"REPORT_PERIOD":202609}) · checked 2026-10-26 · primary; the five `datastore_search_sql` DISTINCT queries first cited here (2026-10-22) now return an HTML page and were replaced on 2026-10-26; [גמל-נט 2023: שורות מיטב גמל להשקעה](https://data.gov.il/api/3/action/datastore_search?resource_id=2016d770-f094-4a2e-983e-797c26479720&limit=100&filters={"REPORT_PERIOD":[202301,202312],"FUND_CLASSIFICATION":"קופת%20גמל%20להשקעה"}&q=מיטב) · checked 2026-10-25 · primary
- Scope: general
- Dimensions: eligibility (target population), regulator
- Likely to change: yes. Values follow the CMA list of tracks (CAT-22).

### CAT-11 How a saver-facing name maps to the data
- Rule: A saver-facing label combines up to six layers. The data keeps them in separate places:
  1. the controlling group (`CONTROLLING_CORPORATION`, for example "מיטב דש השקעות בע"מ");
  2. the managing company (`MANAGING_CORPORATION`, for example "מיטב גמל ופנסיה בע"מ");
  3. the product type (`FUND_CLASSIFICATION`, for example "קופת גמל להשקעה");
  4. the fund (קופה), with its own income-tax number and name ("מיטב גמל להשקעה", 7857), found only in `transfer_bank` and in the institution's documents;
  5. the track (מסלול), with its own income-tax number = Gemel-Net `FUND_ID`;
  6. the track name (`FUND_NAME`), which in Gemel-Net is the full string brand + product + standard track name (for example "מיטב גמל להשקעה כללי").
  A marketing name can hide the product type: in 202609 the general investment-provident tracks include "אלטשולר שחם חיסכון פלוס כללי", "אנליסט מסלולית - קופת גמל להשקעה כללי", "כלל גמל לעתיד כללי" and "מחוג חיסכון פלוס כללי", and Meitav markets "מיטב קידס" as a children's plan "המבוצעת באמצעות קופת גמל להשקעה".
- Conditions / exceptions: Names in `transfer_bank` ("שם מסלול ארוך", "שם מסלול קצר") can differ from Gemel-Net `FUND_NAME`, and from institution pages. For example Meitav writes "כספי (שיקלי)" in its flyer, while the data has "כספי (שקלי)". Match on track number, not name.
- Figures: n/a
- Source: [Gemel-Net general gemel lehashkaa tracks 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קופת%20גמל%20להשקעה","SPECIALIZATION":"כללי"}&sort=MANAGING_CORPORATION); [transfer_bank, fund 7857](https://data.gov.il/api/3/action/datastore_search?resource_id=b5223cbc-e1b2-4503-a499-97cdcd7190d2&limit=60&filters={"מספר%20קופה%20-אישור%20מס%20הכנסה":7857}); [Meitav Kids page](https://www.meitav.co.il/provident_pension/saving_kids/); [Meitav flyer](https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf) · checked 2026-10-22 · primary, institution
- Dimensions: regulator
- Likely to change: yes. Marketing names change at will.

### CAT-12 Why two tracks can share a name
- Rule: In the data, identical or near-identical names arise in these sourced ways.
  - (a) **The same standard track name in different products of one manager.** For example "מיטב גמל להשקעה כללי" (7978, investment provident), "מיטב השתלמות כללי" (880, study fund), and the tagmulim tracks. Without the product word these read alike.
  - (b) **The same standard name at different managers.** The circular requires names from the CMA list (CAT-15). In 202609, 18 investment-provident tracks have specialization "כללי", one per managing company.
  - (c) **Old and new names for one track number** after the 1.7.2024 renames (CAT-13, CAT-26).
  - (d) **One fund marketed under several product names.** "מיטב קידס" joins through the same online join URL as Meitav's investment-provident fund (CAT-27).
  In 202609 no managing company had two investment-provident tracks with specialization "כללי".
- Conditions / exceptions: (d) rests on the shared URL only; the fund number is not stated on the Kids page (open question 13). The same standard name does not guarantee the same holdings across managers (CAT-24).
- Figures: 18 general investment-provident tracks in 202609 (12 open to all, 6 sector or employer).
- Source: as CAT-11; [Meitav 202609 all tracks](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=200&fields=FUND_ID,FUND_NAME,FUND_CLASSIFICATION,MANAGING_CORPORATION,TARGET_POPULATION&filters={"REPORT_PERIOD":202609}&q=מיטב&sort=FUND_CLASSIFICATION) · checked 2026-10-22 · primary, inferred for (d)
- Dimensions: regulator
- Likely to change: yes

### CAT-13 Merged, renamed and legacy tracks: how they appear
- Rule: A renamed track keeps its income-tax number. Meitav's 2024 tables map each old name to the same number, for example 7861 "מסלול שקלי טווח קצר" → "כספי (שקלי)". A merged track is absorbed into an existing track, which keeps its own number. In the data the merged track's assets drop to 0 in the merger month and the track then disappears: 7981's last row is 202407 with `TOTAL_ASSETS` 0. Meitav's notice: track 7981 "מיטב גמל להשקעה מסלול אג"ח עד 10% מניות" merged into 7862 "מיטב גמל להשקעה אשראי ואג"ח" on 1.7.24, "בכפוף לאישור הממונה". The change was automatic, members needed to do nothing, and their rights were stated not to be harmed. The CMA circular allows a track to be closed only if it has no members or assets, or through a merger "בהתאם להוראות הדין" (s.14).
- Conditions / exceptions: Because the dataset has no closure-date or successor field (CAT-02), a track that disappears cannot be linked to its successor from the data alone. The catalogue needs the institution's notice or a hand-kept mapping in `data/catalog/`. A statement or app showing an old name must be matched by number.
- Figures: n/a
- Source: [7981 series](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"FUND_ID":7981}&sort=REPORT_PERIOD); [Meitav merger notice 7981](https://www.meitav.co.il/media/41anarx5/%D7%9E%D7%99%D7%96%D7%95%D7%92-%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94-7981.pdf); [Meitav merger summary](https://www.meitav.co.il/media/r0wh30iv/%D7%A8%D7%99%D7%9B%D7%95%D7%96-%D7%9E%D7%99%D7%96%D7%95%D7%92%D7%99%D7%9D-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf); [CMA circular 2022-9-30](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf) appendix s.14 · checked 2026-10-22 · primary, institution
- Dimensions: transfer-switch-process
- Likely to change: yes. Mergers recur.

### CAT-14 The CMA circular on investment tracks: which text is in force
- Rule: CMA circular "מסלולי השקעה בקופות גמל - תיקון", חוזר גופים מוסדיים 2022-9-28 (28.9.2022), as amended by חוזר גופים מוסדיים 2022-9-30 (20 December 2022, signed by the acting Commissioner). It replaces circular 2016-9-13 (s.18). It applies to all institutional bodies that manage provident funds or non-provident life-insurance policies (s.15). Its stated aim includes setting "כללים אחידים לקביעת שמות ומדיניות השקעה במסלולים השונים (מתמחים ושאינם מתמחים)".
- Conditions / exceptions: Start: per 2022-9-30 s.4, the provisions of 2022-9-28 start on 1 January 2024. Exceptions start on 1 January 2023: s.6(ב), the obligation to manage "משולב סחיר" and "עוקב מדדים גמיש"; s.17; and s.6 to 7 as they concern "קיימות" and "השקעה סביבתי" tracks. Institutions report the new tracks and names took effect on **1.7.2024**. Meitav and Harel both say so, and Meitav's merger notices are dated May 2024 for 1.7.24. The CMA instrument that moved 1.1.2024 to 1.7.2024 was not seen (open question 10). The appendix of 2022-9-30 reproduces the consolidated text of 2022-9-28, with amendments underlined. Two earlier drafts exist and are **not in force**: 2020-253 (19 May 2022) and 2022-312 (22 November 2022).
- Figures: start dates 1.1.2023 and 1.1.2024 (circular); 1.7.2024 (institutions).
- Source: [CMA circular 2022-9-30, final](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf) pp.1 to 9; [draft 2022-312](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-22-11-22-1/he/Investment-tracks-in-provident-funds-draft-pdf.pdf); [draft 2020-253](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-25/he/Management-of-investment-tracks-in-a-provident-fund-draft.pdf); [Meitav reform page](https://www.meitav.co.il/provident_pension/reform_of_investment_routes_2024/); [Harel reform page](https://www.harel-group.co.il/long-term-savings/information/reform) · checked 2026-10-22 · primary (circular), institution (1.7.2024)
- Dimensions: regulator
- Likely to change: yes. The CMA can amend the list and the circular. The CMA 2026 regulation plan (domain-landscape 6) should be watched.

### CAT-15 A track's name must match its regulatory policy as set in the CMA list
- Rule: A track's name must fit its regulatory investment policy as set out in the list of investment tracks (s.9(א)). An institution may not use a list name for a track whose regulatory policy differs from the policy the list sets for that name (s.9(ב)). The CMA publishes on its website a "רשימת מסלולי השקעה" setting out the regulatory investment policy of each possible track and the matching name (s.10(א)). When the Commissioner changes the list, including a policy or a name, institutions must change their bylaws within three months unless told otherwise (s.10(ב)). Tracks must be anchored in the fund bylaws or the policy's tracks appendix, per the list (s.11).
- Conditions / exceptions: The list now in force is "רשימת מסלולי השקעה – תיקון", ref. 2024-1471, 17.4.2024, on gov.il; the per-name policies are CAT-23 (open question 9, closed 2026-10-26). The May 2022 draft's explanatory notes proposed a **closed** list, with an institution allowed to manage a track only if it appears in it. That is draft text, not confirmed for the final list.
- Figures: n/a
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), pp.3, 7, s.2 (definition "רשימת מסלולי השקעה"), ss.9, 10, 11 · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2020-253 ניהול מסלולי השקעה בקופת גמל - טיוטה (19.5.2022)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-25/he/Management-of-investment-tracks-in-a-provident-fund-draft.pdf), p.14 · checked 2026-10-25 · primary (draft labelled)
- Scope: general
- Dimensions: regulator
- Likely to change: yes. The list changes by notice.

### CAT-16 Misleading track and fund names are prohibited
- Rule: An institution may not call a provident fund, an insurance fund, a non-insurance-fund policy or a track by a name that misleads or implies a guarantee of achieving or meeting a qualitative or quantitative criterion, or from which the way investments are managed could be inferred. The circular's examples: "בטוחה, רווחית, סולידית, יציבה, איתנה, אגרסיבית" (s.8).
- Conditions / exceptions: Marketing names of products (CAT-11) are not addressed by this text beyond "שם של קופת גמל". The catalogue can flag any such word seen in an app as not a CMA track name.
- Figures: n/a
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), p.7, s.8 · checked 2026-10-25 · primary
- Scope: general
- Dimensions: regulator
- Likely to change: no

### CAT-17 Track categories: general, default, specialized, and the five clusters
- Rule: The circular defines these categories.
  - **General track** ("מסלול כללי"): a track that is not specialized, not a default track and not an annuitants' track.
  - **Specialized track** ("מסלול השקעה מתמחה"): a track in the list under one of five clusters ("אשכולות"):
    - אשכול 1, active management (specialized tracks characterised by direct investment alongside index-tracking assets);
    - אשכול 2, active management with variable fees ("דמי ניהול משתנים"), charged according to the yield achieved;
    - אשכול 3, direct investment in tradable assets ("נכסים סחירים");
    - אשכול 4, index-tracking ("מכשירים עוקבי מדדים");
    - אשכול 5, faith and sustainability ("אמונה וקיימות"), managing investments by religious-law rules or a sustainability or environmental view.
  - Also defined: the **age-dependent model** ("מודל השקעות תלוי גיל"); the **hosted track** ("מסלול אירוח"), in which an external investment manager manages members' money; the **index-tracking track** ("מסלול השקעה עוקב מדדים"), which meets s.6 of chapter 4, part 2, title 5 of the consolidated circular.
- Conditions / exceptions: Category names as used in the data (CAT-10): "מתמחים בניהול אקטיבי", "מתמחים באפיקי השקעה סחירים", "עוקבי מדדים", "קיימות". The CMA's list of investment tracks (2024 amendment) names the standard tracks of each cluster:
  - אשכול 1, active management with fixed fees: כספי (שקלי); אשראי ואג"ח; אשראי ואג"ח עם מניות (עד 25% מניות); אג"ח ממשלות; מניות.
  - אשכול 2, active management with variable fees: אשראי ואג"ח; מניות.
  - אשכול 3, tradable assets: משולב סחיר; אג"ח ממשלתי סחיר; אג"ח סחיר; סחיר - אג"ח עם מניות (עד 25% מניות); מניות סחיר.
  - אשכול 4, index-tracking: עוקב מדדים – גמיש; עוקב מדדי אג"ח ממשלות; עוקב מדדי אג"ח; עוקב מדדים - אג"ח עם מניות (עד 25% מניות); עוקב מדדי מניות; עוקב מדד S&P 500.
  - אשכול 5, faith and sustainability: הלכה; שריעה; קיימות; סביבתי.
  - Also listed, as "מסלולים מתמחים – אחר": בניהול אישי (the IRA track).
  - Harel's page, which grouped the names with some missing, is no longer cited (2026-10-26, scope settling): the list is the regulator's own.
- Figures: n/a
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), pp.2 to 3, s.2 · checked 2026-10-25 · primary; [רשות שוק ההון, ביטוח וחיסכון: רשימת מסלולי השקעה – תיקון (שה. 2024-1471, 17.4.2024), קובץ Word](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx), clusters 1 to 5 ("אשכול 4 - מסלולים עוקבי מדדים") and "מסלולים מתמחים – אחר" (struck-through text not read) · checked 2026-10-26 · primary
- Scope: general
- Dimensions: regulator, fee-management-balance (cluster 2)
- Likely to change: yes

### CAT-18 What a kupat gemel lehashkaa (and keren hishtalmut) may offer, and its default track
- Rule: In study funds, investment provident funds and non-insurance-fund policies, an institution may manage a **general track** and the specialized tracks of s.6, without the s.6(ב) obligation to offer "משולב סחיר" and "עוקב מדדים גמיש" (s.7(א)). The institution must set a **default track** ("מסלול השקעה ברירת מחדל") in the bylaws of an investment provident fund or such a policy (s.7(ב)). A study fund's default must be either "מסלול השקעה כללי" or "מסלול השקעה עוקב מדדים גמיש" (s.7(ג)). The age-dependent model (s.3 to 4) applies only to provident funds that are **not** study funds and **not** investment provident funds. So a kupat gemel lehashkaa has a default track but no age-based default under this circular.
- Conditions / exceptions: Within cluster 5, an institution may manage only one track of each type, for example one Jewish-law track (s.6(ד)). A cluster-2 track may be offered only if the institution manages a cluster-1 track with the same specialization (s.6(ג)). The board must approve that each specialized track's regulatory policy differs clearly from every other specialized track in the same fund (s.6(ד)). Child-savings tracks are governed by a separate circular, 2022-9-29 (s.7(ה)), not read here (see `child-savings.md`).
- Figures: n/a
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), pp.4 to 6, ss.3, 4, 6, 7 · checked 2026-10-25 · primary
- Scope: general
- Dimensions: regulator, eligibility
- Likely to change: yes

### CAT-19 Age-dependent and general tracks in tagmulim-type funds (decoding names like "לבני 50 ומטה")
- Rule: In provident funds that are not study funds and not investment provident funds, a new member who did not choose a track joins the default track that matches their age (s.4(ב)). The model is either three tracks (age up to 50; 50 to 60; 60 and over, s.4(א)(1)) or tracks for birth-date cohorts spanning at least 5 and at most 10 years (s.4(א)(2)). In annuity provident funds the general track is closed to new joiners: the CMA's 2024 list amendment says so in passing ("המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)"). The circular's s.3(ד) itself lets an institution keep a general track only within insurance policies that are insurance funds marketed before 2004, closed to members who were not in it on the start date.
- Conditions / exceptions: This explains Meitav names such as "מיטב גמל לבני 50 ומטה" (7215), "לבני 50 עד 60" (103) and "לבני 60 ומעלה" (551), with specialization "מדרגות". The process rules (moving members between age tracks, notices) belong to `provident-family-common.md` and `pension-and-gemel-lekitzba.md`.
- Figures: age bands 50 and 60; cohort width 5 to 10 years.
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), p.4, ss.3 to 4; s.3(ד): "במסגרת פוליסות ביטוח שהן קופות ביטוח ששווקו לפני שנת 2004, גוף מוסדי יהיה רשאי לנהל מסלול כללי" · checked 2026-10-26 · primary; [רשות שוק ההון, ביטוח וחיסכון: רשימת מסלולי השקעה – תיקון (שה. 2024-1471, 17.4.2024), קובץ Word](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx), explanatory notes, "ביטול מסלול מתמחה גמיש": "המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)" · checked 2026-10-26 · primary
- Scope: general
- Dimensions: age-or-use-exemption (not tax; age-based default), eligibility
- Likely to change: yes. A 2024 draft regulation on moving default-track members to age-matched tracks was seen only as a search title (open question 18).

### CAT-20 Money-market (כספי) track: chosen holding period
- Rule: A member who chooses a "מסלול השקעה כספי" must choose, on joining, (1) a period of 6, 12 or 24 months and (2) the track to which the institution will move the money at the end of that period. One to two months before the end, the institution notifies the member, who may choose another track or a new money-market period (s.6א). This does not apply to members who chose the money-market track before the circular's start (s.6א(ג)).
- Conditions / exceptions: Whether s.6א applies to investment provident funds is not stated in the text. s.6א sits between s.6 (funds that are neither study nor investment-provident) and s.7, which refers back to "s.6" only (open question 11). Meitav's investment-provident track 7861 "כספי (שקלי)" exists, but its joining terms were not seen.
- Figures: 6, 12 or 24 months.
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), p.6, s.6א · checked 2026-10-25 · primary
- Scope: general
- Dimensions: liquidity-lockup, transfer-switch-process
- Likely to change: yes

### CAT-21 Changes to a track's specialization, deviations, and notice to members
- Rule: An institution may change the specialization of a specialized track (as set out in the list) only if its board approves that the change better reflects the track's investment mix as actually managed (s.12(א)). It must notify members at least 45 days and at most three months before the change, including the reasons, what the change means for management flexibility, a before-and-after comparison of the regulatory policy, and the member's right to move to any track in the fund or to another fund (s.12(ב)). In a track's first year the institution may deviate from the regulatory policy while the track's assets are too small to follow it (s.13(א)).
- Conditions / exceptions: Meitav's May 2024 notices for 7980 and 7861 follow this form: before and after names and policies, and the right to move at any time. Meitav also states that the changes "הורחבה גמישות ניהול השקעות נכסי המסלולים". The catalogue should show the date of a track's last policy change where known.
- Figures: 45 days to 3 months notice.
- Source: [CMA circular 2022-9-30](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf) appendix ss.12 to 13, pp.7 to 8; [Meitav notice 7980](https://www.meitav.co.il/media/53vlo3zc/שינוי-התמחות-גמל-להשקעה-7980.pdf); [Meitav notice 7861](https://www.meitav.co.il/media/sisdprky/שינוי-התמחות-גמל-להשקעה-7861.pdf) · checked 2026-10-22 · primary, institution
- Dimensions: transfer-switch-process, fee-change-over-time
- Likely to change: no

### CAT-22 The CMA list of standard tracks: what is known without the list
- Rule: The standard names in use after 1.7.2024 are known from the data (CAT-10) and institutions (CAT-17), not from the CMA list. Each name's regulatory policy is set by the CMA list (CAT-15), which was not obtained. Until it is, the catalogue may state a track's **category and classification from the CMA data** and its **policy text from the institution's bylaw notice** (CAT-23), labelled "institution".
- Conditions / exceptions: An older CMA list exists, "רשימת מסלולי השקעה" (2015, regulation_2015-9-7a.pdf). It was seen only as a search title and not read; it is superseded by the 2022 circular's list.
- Figures: n/a
- Source: as CAT-10, CAT-15, CAT-17 · checked 2026-10-22 · primary (data), institution · links from the cited rules: [1](<https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20DISTINCT%20%22FUND_CLASSIFICATION%22%20FROM%20%22a30dcbea-a1d2-482c-ae29-8f781f5025fb%22>), [2](<https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20DISTINCT%20%22SPECIALIZATION%22%20FROM%20%22a30dcbea-a1d2-482c-ae29-8f781f5025fb%22>), [3](<https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20DISTINCT%20%22TARGET_POPULATION%22%20FROM%20%22a30dcbea-a1d2-482c-ae29-8f781f5025fb%22>), [4](<https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20DISTINCT%20%22FUND_CLASSIFICATION%22%20FROM%20%226d47d6b5-cb08-488b-b333-f1e717b1e1bd%22>), [5](<https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20DISTINCT%20%22FUND_CLASSIFICATION%22%20FROM%20%22c6c62cc7-fe02-4b18-8f3e-813abfbb4647%22>), [6](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf>)
- Dimensions: regulator
- Likely to change: yes

### CAT-23 What specific standard tracks hold, as the CMA's list of investment tracks sets them
- Rule: The CMA's list of investment tracks ("רשימת מסלולי השקעה – תיקון", ref. 2024-1471, 17.4.2024) sets the regulatory investment policy ("מדיניות ההשקעה התקנונית") of each standard track name. For these names:
  - **"אשראי ואג"ח"**: exposure in Israel and abroad to deposits, tradable and non-tradable bonds including convertibles, commercial paper issued by corporations or governments, non-tradable loans to corporations and individuals, and investment funds and ETFs mostly invested in debt. Exposure is at least 75% and at most 120% of assets; total exposure at most 120%; may carry currency risk. No equity allowance is stated.
  - **"אשראי ואג"ח עם מניות (עד 25% מניות)"** (study fund, kupat gemel lehashkaa and individual policy only): credit and bonds as above at least 75%; equities at most 25%; total at most 120%.
  - **"כספי (שקלי)"**: assets that are not index-linked and not exposed to currency other than the shekel: shekel deposits, government loans in NIS, shekel loans and shekel bonds (tradable and non-tradable). At least 75% and at most 120%. No average-life cap is stated.
  - **"עוקב מדדים – גמיש"**: via index-tracking instruments, 75% to 100% tracking equity indices, corporate-bond indices or government-bond indices, with at least three dissimilar indices, each of the three largest between 10% and 50% of assets.
  - **"כללי"**: "נכסי המסלול יהיו חשופים לנכסים מסוגים שונים בכפוף להוראות הדין, ובכפוף לשיקול דעתה של ועדת ההשקעות", that is, no stated mix.
  - **Age tracks** ("לבני 50 ומטה", "לבני 50 עד 60", "לבני 60 ומעלה", the default model for provident funds other than a study fund or a kupat gemel lehashkaa, pension funds and insurance funds): assets invested at the investment committee's discretion, considering members' ages.
- Conditions / exceptions: The list groups specialised tracks into clusters (actively managed with fixed fees and direct expenses; actively managed with variable fees; tradable assets only; index trackers; faith and sustainability) and states the products each name may be used in. Before each name the manager adds its fund's or insurer's name as set in the CMA's systems. The list also holds names this record does not describe (מניות, מניות סחיר, משולב סחיר, אג"ח סחיר, סחיר - אג"ח עם מניות, עוקב מדדי מניות, עוקב מדד S&P 500, עוקב מדדי אג"ח, אג"ח ממשלות, הלכה, שריעה, קיימות and the pension-recipient tracks); their texts are in the same file. A manager's notice gives an **expected** asset mix per track for a year ("שיעור חשיפה צפוי"), which is not the regulatory policy (CAT-24). Re-sourced 2026-10-26 (open-questions audit): the record quoted Meitav's 2024 bylaw notices until the list's gov.il file was found; the list carries the same texts, so the Meitav notices are no longer cited. Open question 9 closed 2026-10-26. Re-checked against the amended text the same day (scope settling): from 1 July 2024 an investment in debt-specialised investment funds counts in "אשראי ואג"ח" and its version with equities only if the fund's policy keeps debt exposure at least 75% ("החל מיום 1 ביולי 2024 השקעה בקרנות השקעה מתמחות בחוב תהיה בתנאי שבהתאם למדיניות ההשקעה שלהן, שיעור החשיפה לחוב לא יפחת מ 75%"); and the amendment removed the "מתמחה גמיש" track, whose policy matched the general track's.
- Figures: as above; in force from 1.7.2024 (CAT-14, CAT-15).
- Source: [רשות שוק ההון, ביטוח וחיסכון: רשימת מסלולי השקעה – תיקון (שה. 2024-1471, 17.4.2024)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_PDF.pdf), p.2 (age tracks; "מסלול כללי": "נכסי המסלול יהיו חשופים לנכסים מסוגים שונים בכפוף להוראות הדין, ובכפוף לשיקול דעתה של ועדת ההשקעות"), p.4 (cluster 1: כספי (שקלי), אשראי ואג"ח, אשראי ואג"ח עם מניות (עד 25% מניות)), p.9 (cluster 4: עוקב מדדים – גמיש) · checked 2026-10-26 · primary; [רשות שוק ההון, ביטוח וחיסכון: רשימת מסלולי השקעה – תיקון (שה. 2024-1471, 17.4.2024), קובץ Word](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx), cluster 1 (the 1.7.2024 debt-fund condition) and explanatory notes ("ביטול מסלול מתמחה גמיש"), struck-through text not read · checked 2026-10-26 · primary. CAT-15.
- Scope: general
- Dimensions: currency, protection (none implied)
- Likely to change: yes

### CAT-24 Regulatory policy vs expected policy: the same name can hold a changing mix
- Rule: The circular distinguishes "מדיניות השקעה תקנונית" (the policy set in the fund bylaws or the policy's tracks appendix) from "מדיניות השקעה צפויה" (the institution's declared expected policy, per circular 2009-9-13). The name is tied to the regulatory policy only (CAT-15). Within the bounds the list sets for a name, a manager may change both its actual mix and its own regulatory policy without a rename. Example (named): Meitav's notice, titled "שינוי מדיניות השקעה תקנונית" (a change of the regulatory policy itself, under the same name): from 1.7.2026 its "עוקב מדדים גמיש" tracks (481 study fund, 7979 investment provident, 14265 tagmulim, 14260 comprehensive pension, 14268 general pension) move "מחשיפה של כ 50% מניות וחשיפה של 100% לחו״ל" to a "more balanced" policy with variable Israel and abroad allocation and about 55% equities, "ינוהל באופן אקטיבי".
- Conditions / exceptions: For this reason, the catalogue's "exposure in plain Hebrew" must come from the dated CMA exposure fields (CAT-03), labelled computed, with the period, and not from the track name. How far the same standard name can differ, over every manager in the regulator's data: in Gemel-Net 202609 the kupat gemel lehashkaa track "משולב סחיר" of 11 managers ranges from 23.9% to 99.1% of assets in equities and from 1.2% to 109.4% abroad (computed as exposure field ÷ total assets, 2026-10-26; for example Meitav 15349: 98.7% equities, 1.2% abroad; Harel 15288: 45.9%, 97.9%). Harel's own description is no longer cited.
- Figures: Meitav 2026 change: about 50% to about 55% equities; effective 1.7.2026.
- Source: [חוזר גופים מוסדיים 2022-9-30 מסלולי השקעה בקופות גמל - תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf), pp.2 to 3, s.2 · checked 2026-10-25 · primary; [מיטב: שינוי מדיניות השקעה תקנונית של מסלול השקעה עוקב מדדים גמיש](https://www.meitav.co.il/provident_pension/flexible_index_tracker_actively_managed_indices/) · checked 2026-10-25 · institution (named example); [גמל-נט 202609: כל מסלולי "משולב סחיר"](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=1000&filters={"REPORT_PERIOD":202609,"SUB_SPECIALIZATION":"משולב סחיר"}), fields STOCK_MARKET_EXPOSURE, FOREIGN_EXPOSURE, TOTAL_ASSETS · checked 2026-10-26 · primary · computed (exposure shares); [גמל-נט: מסלול 15349, תקופה 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"FUND_ID":15349,"REPORT_PERIOD":202609}) · checked 2026-10-25 · primary · computed (exposure shares)
- Scope: general
- Dimensions: currency, fee-change-over-time
- Likely to change: yes

### CAT-25 The Meitav kupat gemel lehashkaa: every public track in 202609
- Rule: Managing company "מיטב גמל ופנסיה בע"מ" (registration 512065202; controlled by "מיטב דש השקעות בע"מ") runs one investment provident fund, "מיטב גמל להשקעה", income-tax number 7857. Its operator ("חברה מתפעלת") is "בנק מזרחי טפחות בע"מ". In report period 202609 it has 16 tracks, all with target population "כלל האוכלוסיה". The `transfer_bank` dataset lists the same 16 track numbers under fund 7857, each once for incoming and once for outgoing transfers. Only **one** track is named or classified "כללי" (7978). Meitav's own track page marks it "מסלול ברירת המחדל בעת ההצטרפות לקופת הגמל".
- Conditions / exceptions: Assets and fees are CMA 202609, read 2026-10-22. Fees are percent, labelled by Meitav as prior-year averages (CAT-06); assets are NIS millions. Equity, foreign and FX columns are **computed by me** as exposure field ÷ `TOTAL_ASSETS`, rounded, 202609; their measurement basis is open (open question 4). "Old name" is from Meitav's 2024 flyer. 15472 was added after the flyer: its `transfer_bank` row was updated 2025-10-28; CMA inception is 2024-12-17, while Meitav's page says "מועד הקמת הקופה 01/07/2026" (open question 17). The CMA inception dates (2016-11-10, 2024-06-23) also differ from Meitav's (13/11/2016, 01/07/2024).

| Track no. | Name in Gemel-Net (202609) | SPECIALIZATION / SUB | CMA inception | Assets (NIS m) | Fee on assets % | Fee on deposits % | Equity % | Foreign % | FX % | Old name before 1.7.2024 |
|---|---|---|---|---|---|---|---|---|---|---|
| 7978 | מיטב גמל להשקעה כללי | כללי / כללי | 2016-11-10 | 3884.43 | 0.61 | 0 | 48.7 | 49.1 | 20.3 | מיטב גמל להשקעה מסלול כללי |
| 7860 | מיטב גמל להשקעה מניות | מתמחים בניהול אקטיבי / מניות | 2016-11-10 | 2183.87 | 0.59 | 0 | 100.5 | 72.4 | 30.1 | מיטב גמל להשקעה מסלול מניות |
| 7867 | מיטב גמל להשקעה עוקב מדדי מניות | עוקבי מדדים / עוקב מדדי מניות | 2016-11-10 | 1720.59 | 0.65 | 0 | 98.3 | 98.3 | 4.4 | מיטב גמל להשקעה מסלול פאסיבי - מדדי מניות |
| 13259 | מיטב גמל להשקעה עוקב מדד S&P 500 | עוקבי מדדים / עוקב מדד s&p 500 | 2020-07-28 | 1291.02 | 0.6 | 0 | 99.5 | 99.5 | 99.4 | מיטב גמל להשקעה מחקה מדד S&P500 |
| 15349 | מיטב גמל להשקעה משולב סחיר | מתמחים באפיקי השקעה סחירים / משולב סחיר | 2024-06-23 | 885.92 | 0.58 | 0.01 | 98.7 | 1.2 | 6.4 | (new 1.7.2024) |
| 7980 | מיטב גמל להשקעה אשראי ואג"ח עם מניות (עד 25% במניות) | מתמחים בניהול אקטיבי / אשראי ואג"ח | 2016-11-10 | 449.06 | 0.61 | 0.01 | 24.4 | 34.8 | 13.7 | מיטב גמל להשקעה מסלול אג"ח עד 20% במניות |
| 7862 | מיטב גמל להשקעה אשראי ואג"ח | מתמחים בניהול אקטיבי / אשראי ואג"ח | 2016-11-10 | 207.41 | 0.63 | 0 | 3.8 | 23.0 | 6.4 | מיטב גמל להשקעה מסלול אג"ח (absorbed 7981 "מסלול אג"ח עד 10% מניות") |
| 7979 | מיטב גמל להשקעה עוקב מדדים גמיש | עוקבי מדדים / עוקב מדדים - גמיש | 2016-11-10 | 149.39 | 0.67 | 0.01 | 63.6 | 45.0 | 24.1 | מיטב גמל להשקעה מסלול פאסיבי - כללי |
| 7863 | מיטב גמל להשקעה הלכה | הלכתי / הלכה יהודית | 2016-11-10 | 148.4 | 0.67 | 0.01 | 48.6 | 37.6 | 15.5 | מיטב גמל להשקעה מסלול הלכה |
| 15350 | מיטב גמל להשקעה מניות סחיר | מתמחים באפיקי השקעה סחירים / מניות סחיר | 2024-06-23 | 135.06 | 0.62 | 0.01 | 99.9 | 99.9 | 97.9 | (new 1.7.2024) |
| 14270 | מיטב גמל להשקעה קיימות | קיימות / קיימות | 2023-01-01 | 106.9 | 0.6 | 0 | 98.2 | 98.2 | 2.5 | מיטב גמל להשקעה קיימות |
| 15348 | מיטב גמל להשקעה סחיר - אג"ח עם מניות (עד 25% מניות) | מתמחים באפיקי השקעה סחירים / אג"ח סחיר | 2024-06-23 | 52.83 | 0.63 | 0 | 22.0 | 4.6 | 4.8 | (new 1.7.2024) |
| 7861 | מיטב גמל להשקעה כספי (שקלי) | מתמחים בניהול אקטיבי / כספי (שקלי) | 2016-11-10 | 51.73 | 0.58 | 0 | 0 | 0 | 0.04 | מיטב גמל להשקעה מסלול שקלי טווח קצר |
| 15351 | מיטב גמל להשקעה עוקב מדדי אג"ח עם מניות (עד 25% מניות) | עוקבי מדדים / עוקב מדדי אג"ח | 2024-06-23 | 14.95 | 0.63 | 0.02 | 22.9 | 100 | 98.1 | (new 1.7.2024) |
| 15347 | מיטב גמל להשקעה אג"ח סחיר | מתמחים באפיקי השקעה סחירים / אג"ח סחיר | 2024-06-23 | 8.63 | 0.65 | 0 | 0 | 94.9 | 95.2 | (new 1.7.2024) |
| 15472 | מיטב גמל להשקעה אג"ח ממשלות | מתמחים בניהול אקטיבי / אג"ח ממשלות | 2024-12-17 | 4.7 | null | null | 0 | 2.8 | 2.8 | (added after 2024 flyer) |

- Figures: 16 tracks; total of the assets column 11,294.9 NIS m (my sum), 202609.
- Source: [Gemel-Net Meitav gemel lehashkaa 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קופת%20גמל%20להשקעה"}&q=מיטב); [transfer_bank fund 7857](https://data.gov.il/api/3/action/datastore_search?resource_id=b5223cbc-e1b2-4503-a499-97cdcd7190d2&limit=60&filters={"מספר%20קופה%20-אישור%20מס%20הכנסה":7857}); [Meitav tracks page](https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/); [Meitav flyer](https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf) p.3; [Meitav merger notice 7981](https://www.meitav.co.il/media/41anarx5/%D7%9E%D7%99%D7%96%D7%95%D7%92-%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94-7981.pdf) pp.3 to 4 · checked 2026-10-22 · primary (data), institution (default, old names), computed (percent columns, total)
- Dimensions: fee-management-balance, fee-deposit, currency
- Likely to change: yes. Refreshes monthly.

### CAT-26 Meitav old-to-new track names in its other CMA products (for statements that still show old names)
- Rule: Meitav's 2024 flyer maps every old track name to the new name and number, by fund. For example:
  - **Tagmulim** (fund 874): "מיטב גמל אג"ח עד 25% במניות" (874) merged into "לבני 60 ומעלה" (551). "שקלי" (876) and "שקלי טווח קצר" (948) became "מיטב גמל כספי (שיקלי)" (876). "אג"ח ללא מניות" (223) became "אשראי ואג"ח". "פאסיבי מדדי אג"ח עד 25% במדדי מניות" (1692) became "עוקב מדדי אג"ח". "מחקה מדד S&P500" (13246) became "עוקב מדד S&P500". New: 15344, 15345, 15346.
  - **Study fund** (fund 880): "עד 6 שנות וותק" (554) merged into "כללי" (880). "מעל 6 שנות וותק" (1353) merged into "אשראי ואג"ח עם מניות (עד 25% מניות)" (8885). "אג"ח צמוד מדד" (881) merged into "אשראי ואג"ח" (1240). "פאסיבי כללי" (481) became "עוקב מדדים גמיש". New: 15352 to 15358.
  - **Comprehensive pension** (fund 163) and **general pension** (fund 660): similar.
  - The flyer also shows "אגוד תגמולים" (fund 247) tracks.
- Conditions / exceptions: The flyer carries per-track "קוד מזרחי" and "קוד נס פנסיה" columns (operator codes). Their use is not explained (open question 16). The "פאסיבי - כללי" old name of 7979 and 481 is a "general"-looking label for what is now the flexible index-tracking track.
- Figures: n/a
- Source: [Meitav flyer](https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf) pp.1 to 5; [Meitav merger summary](https://www.meitav.co.il/media/r0wh30iv/%D7%A8%D7%99%D7%9B%D7%95%D7%96-%D7%9E%D7%99%D7%96%D7%95%D7%92%D7%99%D7%9D-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) · checked 2026-10-22 · institution
- Dimensions: transfer-switch-process
- Likely to change: no (historical mapping)

### CAT-27 Meitav's public website: product entry points and join flow
- Rule: Meitav's website lists "קופת גמל להשקעה – תכנית חיסכון לכל מטרה", with join buttons "להצטרפות Online >>" and "להצטרפות לחצו כאן >>". Both go to `https://gemel-invest.meitav.co.il/Join?pt=11&pn=gemelInvestM`. The "מיטב קידס" page ("תוכנית חיסכון לילדים המבוצעת באמצעות קופת גמל להשקעה") uses the same join URL and says a digital joiner is placed in "מסלול השקעה כללי"; choosing another track requires contacting customer service. Meitav's app page lists app actions including "הפקדות לקופת גמל להשקעה" and "שינוי מסלולי השקעה". It does not describe an "open a new saving" flow.
- Conditions / exceptions: The join page returned only a title ("מיטב - גמל להשקעה") to a script, so its steps and track list were not seen. Fee and deposit-limit statements on these pages are wrapper rules and are passed to `kupat-gemel-lehashkaa.md` (see the hand-off in this file's report).
- Figures: n/a here.
- Source: [Meitav gemel lehashkaa product page](https://www.meitav.co.il/provident_pension/provident_invest/); [Meitav Kids page](https://www.meitav.co.il/provident_pension/saving_kids/); [Meitav app page](https://www.meitav.co.il/application/); [Meitav join page](https://gemel-invest.meitav.co.il/Join?pt=11&pn=gemelInvestM) (title only) · checked 2026-10-22 · institution
- Dimensions: minimum, transfer-switch-process
- Likely to change: yes

### CAT-28 The founder's "general twice": what the data settles and what it does not
- Rule: Settled from data: in 202609 Meitav's investment provident fund 7857 has exactly one track named "כללי" (7978), the default at joining (CAT-25). No other Meitav investment-provident track in Gemel-Net or `transfer_bank` has "כללי" in its name or specialization. So two "גמל להשקעה כללי" entries in the app are **not two distinct CMA investment-provident tracks**.
- Conditions / exceptions: Not settled; each of these is consistent with the sources, and none is confirmed.
  - (a) The app shows 7978 twice, once as the "general, most common" preset and once in the full list.
  - (b) One entry belongs to another product that lands in a general track, for example "מיטב קידס" (CAT-27), or a Meitav study fund or tagmulim general track.
  - (c) One entry is 7979 under its old label "פאסיבי - כללי" (CAT-26).
  The app also shows eight tracks against the 16 on the website and in the data; which eight, and why, could not be seen. Needs the founder's screenshots or typed list (open question 12); not needed for the site since 2026-10-23 (product.md D17).
- Figures: 16 tracks (data, website) vs 8 (founder's description of the app).
- Source: as CAT-25 to CAT-27; product.md 3.10 for the app description · checked 2026-10-22 · primary (data), institution · links from the cited rules: [1](<https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/>), [2](<https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf>), [3](<https://www.meitav.co.il/media/41anarx5/%D7%9E%D7%99%D7%96%D7%95%D7%92-%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94-7981.pdf>), [4](<https://www.meitav.co.il/media/r0wh30iv/%D7%A8%D7%99%D7%9B%D7%95%D7%96-%D7%9E%D7%99%D7%96%D7%95%D7%92%D7%99%D7%9D-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf>), [5](<https://www.meitav.co.il/provident_pension/provident_invest/>), [6](<https://www.meitav.co.il/provident_pension/saving_kids/>)
- Dimensions: regulator
- Likely to change: yes

### CAT-29 Refresh: cadence, new-period detection, and API behaviour
- Rule: All three CMA datasets are tagged frequency "Day", update "Automat". The 2024+ resources were last modified 2026-10-22 around 04:00. Data is monthly by `REPORT_PERIOD`. On 2026-10-22 the latest period in Gemel-Net, Pension-Net and Bituach-Net was **202609**. Detect a new period by querying `SELECT MAX("REPORT_PERIOD")` per resource. `datastore_search_sql` accepted this form on 2026-10-22, and `package_show` `last_modified` changes daily even without a new period, so it does not signal one. Store each month's rows as a dated snapshot (product.md § 6).
- Conditions / exceptions: Gemel-Net row counts were 735 (202607), 759 (202608) and 764 (202609). Whether rows for a period are added or revised after it first appears was not observed (open question 7). Resources are split by year range, so check `package_show` for new resource IDs each refresh. Observed API behaviour on 2026-10-22 through the fetch tool:
  - `datastore_search_sql` with a `WHERE` clause returned 404, while `DISTINCT` and `MAX` worked;
  - `datastore_search` with JSON `filters` (numbers, Hebrew strings, lists) worked, but a filter value containing a double quote (for example בע"מ) returned 404;
  - `distinct=true` with paging returned incomplete pages;
  - `q=` full-text search adds a `rank` column;
  - the downloaded CSV is cp1255 per data-landscape 1.2.1, not re-checked here.
- Figures: latest period 202609, observed 2026-10-22.
- Source: package_show links (CAT-01); [MAX gemel](https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20MAX(%22REPORT_PERIOD%22)%20FROM%20%22a30dcbea-a1d2-482c-ae29-8f781f5025fb%22), [MAX pension](https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20MAX(%22REPORT_PERIOD%22)%20FROM%20%226d47d6b5-cb08-488b-b333-f1e717b1e1bd%22), [MAX insurance](https://data.gov.il/api/3/action/datastore_search_sql?sql=SELECT%20MAX(%22REPORT_PERIOD%22)%20FROM%20%22c6c62cc7-fe02-4b18-8f3e-813abfbb4647%22); [count 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=0&filters={"REPORT_PERIOD":202609}) · checked 2026-10-22 · primary
- Dimensions: reporting-obligation
- Likely to change: yes

### CAT-30 The `transfer_bank` dataset: fund-to-track crosswalk
- Rule: data.gov.il dataset `transfer_bank`, "פרטי קופות לצורך העברה בנקאית כספים בין גופים מוסדיים" (resource `b5223cbc-e1b2-4503-a499-97cdcd7190d2`, daily, Other (Open)). One row per track and direction. Fields: "תחום", "ח.פ. של חברה", "שם חברה", "מספר קופה -אישור מס הכנסה", "שם קופה / קרן", "שם קצר - קופה / קרן", "מספר מסלול השקעה", "שם מסלול ארוך", "שם מסלול קצר", "סוג מסלול השקעה", "התמחות ראשית של מסלול", "התמחות משנית של מסלול", "מספר ח.פ. של חברה מתפעלת", "שם חברה מתפעלת", contact fields, "העברות נכנסות / יוצאות", bank details, "תאריך עדכון אחרון". It is the only source read that links Gemel-Net track numbers to the fund (קופה) number and name.
- Conditions / exceptions: Bank account fields are for institutional transfers and are not needed by the site. Leave them out of `data/`.
- Figures: n/a
- Source: [package_show transfer_bank](https://data.gov.il/api/3/action/package_show?id=transfer_bank); [transfer_bank fund 7857](https://data.gov.il/api/3/action/datastore_search?resource_id=b5223cbc-e1b2-4503-a499-97cdcd7190d2&limit=60&filters={"מספר%20קופה%20-אישור%20מס%20הכנסה":7857}) · checked 2026-10-22 · primary
- Dimensions: transfer-switch-process
- Likely to change: no

### CAT-31 ISA side: why near-identical mutual funds exist; the fund list was not reached
- Rule: The ISA states that the high number of Israeli mutual funds stems from a regulatory structure that does not allow splitting a fund with one investment policy into sub-funds differing by currency, tax regime or investor type (share class). For index tracking there are two passive fund types, "קרן מחקה" and "קרן סל", which differ in trading and liquidity, not in investment policy. Some funds, mainly ETFs, were set up for a specific institutional investor. So two mutual funds with near-identical names can be distinct funds with the same policy. Decode by security number, not name.
- Conditions / exceptions: Where the public mutual-fund list with names, classification and exposure codes is published was **not found**. The ISA mutual-fund search page returned an empty shell to a script; TASE's funds page redirected to `market.tase.co.il`, which returned 403; the ISA 2024 report does not name the list's location (open question 14). Meaning of exposure codes: `mutual-funds-and-money-market-funds.md`.
- Figures: end-2024: 2,290 funds; 1,607 with a distinct investment policy; 683 "קרנות כפולות" (601 passive, 82 active).
- Source: [ISA, פעילות קרנות נאמנות בישראל 2024](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) p.3 · checked 2026-10-22 · primary
- Dimensions: regulator, foreign-withholding-domicile (share-class absence)
- Likely to change: yes. Annual report.

### CAT-32 Gemel-Net "sources and assumptions": yields are nominal and gross of management fees
- Rule: The CMA's Gemel-Net page says the system uses monthly yield reports from the funds to the CMA, market indices as published by TASE, and "תשואה נומינלית ברוטו – המערכת משתמשת בנתוני תשואות נומינליות ללא ניכוי דמי ניהול".
- Conditions / exceptions: The page says nothing about how the fee fields are averaged or about the risk measures, so CAT OQ1-OQ3 stay open for those parts.
- Figures: none.
- Source: [Gemel-Net, מקורות המידע והנחות מערכת](https://gemelnet.cma.gov.il/views/dafMakdim_Link3.aspx) · checked 2026-10-22 · primary
- Dimensions: `fee-management-balance`
- Likely to change: no.

### CAT-33 Where the public mutual-fund list is: Maya
- Rule: TASE's Maya site lists Israeli open-end mutual funds (2,009 records on 2026-10-22) with columns for manager, fund characteristics, three-level fund classification, exposure-profile code (for example 00, 4A, 4D, 2B), fund number and fund name, and filters by manager, trustee, classification and characteristics (kosher, unlimited foreign, leveraged, tracking, inverse exposure, fixed-term, units in dollars, foreign-investment fund and others). Each fund has a page at /he/funds/mutual-funds/<fund no.>.
- Conditions / exceptions: Chrome machine-translated the page, so Hebrew names were not captured from it; the structure and counts are as seen. The exposure-code legend did not open. Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches.
- Figures: 2,009 open-end funds, 2026-10-22.
- Source: [Maya, רשימת קרנות](https://maya.tase.co.il/he/funds/mutual-funds) · checked 2026-10-22 · primary
- Dimensions: `product-marking`
- Likely to change: yes.
**[2026-10-24 R4 research pass]** Count on 2026-10-24: 2,009 again; per-classification counts and the by-hand download path in CAT-42; republishing terms in CAT-43.

### CAT-34 Maya's fund export: the fields available per mutual fund
- Rule: The Maya fund list's export ("הורדת נתונים", a CSV) has one row per open-end fund (2,009 on 2026-10-22) with: fund name, fund number, equity and FX exposure codes, three classification levels, characteristics, manager, trustee, tax status, management fee, trustee fee, assets, data date, buy and redemption prices, daily change, returns (month, year to date, 12 months), standard deviation, reference asset, and distribution-fee class.
- Conditions / exceptions: Counts on 2026-10-22: 15 managers, 4 trustees; distribution-fee class 0.35% (1,082 funds), none (845, the tracking funds), 0.1% (73, all money-market funds), 0.2% (9). The export is the mutual-fund counterpart of the CMA datasets and can serve the catalogue for fund names. Terms of use for republishing were not checked (data track).
- Figures: as above.
- Source: [Maya, רשימת קרנות](https://maya.tase.co.il/he/funds/mutual-funds) · checked 2026-10-22 · primary
- Dimensions: `product-marking`, `fee-management-balance`
- Likely to change: yes.
**[2026-10-24 R4 research pass]** Terms of use now checked (CAT-43): the export may be downloaded for personal use but not republished; the site keeps counts and a link (data-schema 3.14 stays unconfirmed).

### CAT-35 Fee fields are percent values, as both CMA portals print them
- Rule: `AVG_ANNUAL_MANAGEMENT_FEE` is an annual rate in percent of assets and `AVG_DEPOSIT_FEE` is a rate in percent of the deposits (0.61 means 0.61%). Gemel-Net's yields report heads the pair "שיעור דמי ניהול ממוצע לשנת 2025" with sub-columns "נכסים" and "הפקדות" and prints 0.61% and 0.00% for track 7978, where the dataset's 202609 row holds 0.61 and 0. Its advanced search filters on "שיעור דמי ניהול ממוצע שנתי - נכסים %" with the bands "נמוך - עד 0.5", "בינוני - מעל 0.5 עד 1", "גבוה - מעל 1 עד 1.5", "גבוה מאד - מעל 1.5". Pensia-Net heads the same pair "שיעור דמי ניהול ממוצעים בשנת 2025" / "נכסים" / "הפקדות" and prints 0.16% and 1.47% for Harel's comprehensive pension fund 214, whose every track holds 0.16 and 1.47 in 202609.
- Conditions / exceptions: The dictionary names are "שיעור דמי ניהול ממוצעת שנתי – נכסים" and "שיעור דמי ניהול ממוצעת- הפקדות" (CAT-06); the pension dictionary calls the second `AVG_FEE_ON_DEPOSITS`, but the live 2024+ pension resource uses `AVG_DEPOSIT_FEE` like gemel. The deposit rate is a share of the period's deposits, not an annual rate. Empty is not zero: the portals print "- - -" for an empty value and "0.00%" for a zero one (portal reading of 2026-10-23, recorded in CAT-40), and a track gets its first value only in the January after its first full calendar year (CAT-36).
- Figures: 7978 (202609): 0.61 / 0; pension fund 214 (202609): 0.16 / 1.47. Read 2026-10-23.
- Source: [דוח תשואות גמל-נט, קופה 7978, תקופה 10/2025 עד 09/2026](https://gemelnet.cma.gov.il/views/gemelTsuot.aspx), (read in Chrome) · checked 2026-10-25 · primary; [דוח פנסיה-נט, קרן 214, תקופה 10/2025 עד 09/2026](https://pensyanet.cma.gov.il/Parameters), (read in Chrome) · checked 2026-10-25 · primary; [גמל-נט: קופה 7978, תקופה 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"FUND_ID":7978,"REPORT_PERIOD":202609}) · checked 2026-10-25 · primary; [פנסיה-נט: כל המסלולים, תקופה 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=1000&filters={"REPORT_PERIOD":202609}) · checked 2026-10-25 · primary
- Scope: general
- Dimensions: fee-management-balance, fee-deposit
- Likely to change: no

### CAT-36 The fee value is the average for the latest completed calendar year; dataset rows of year Y carry year Y−1
- Rule: The figure is a calendar-year average, and the portals show the latest completed year whatever the report period: in October 2026 Gemel-Net labels it "לשנת 2025" and prints the same 0.61% for 7978 whether the report runs 10/2025–09/2026 or 01/2025–12/2025. In the dataset the value is identical in every row of a calendar year and changes only in the January row: 7978 holds 0.55 in all 2023 rows, 0.57 in 2024, 0.60 in 2025, 0.61 in 2026 (deposit fee 0 / 0.01 / 0 / 0); 7860: 0.52, 0.54, 0.58, 0.59; 103: 0.44, 0.48, 0.50, 0.53; 13259: 0.46, 0.49, 0.55, 0.60. So the rows of 2026 hold the 2025 average, and by the same pattern the rows of year Y hold the average for Y−1.
- Conditions / exceptions: Primary for the 2026 rows (portal label read against the data). The mapping of earlier years is inferred from the January change, from Meitav's label "בשנה קודמת" (CAT-06) and from the dictionary's old field name `SHIUR_DMEI_NIHUL_AHARON` ("last" fee rate). A track receives its first value in the January after its first full calendar year: tracks opened in January 2024 (15028, 14919) have a value from 202501; tracks opened February to December 2024 (15055, 15209, 15465) only from 202601; no track opened in 2025 or 2026 has one in 202609. The reporting channel that fits a January change is the annual yields-and-fees report ("דוח 3", circular גמל 2002/11 as replaced by גמל 2003/13), which carries "דמי ניהול שנתיים שגבתה הקופה" and "שיעור דמי ניהול שנתיים שגבתה הקופה" and was due "עד ליום ה-15 בינואר של כל שנה עוקבת לשנת הדיווח"; whether that report still exists and feeds the portals was not verified (OQ23). Thirteen tracks opened in 2024 still have no value in 202609 (OQ22).
- Figures: as above, read 2026-10-23.
- Source: [דוח תשואות גמל-נט, קופה 7978, תקופה 10/2025 עד 09/2026](https://gemelnet.cma.gov.il/views/gemelTsuot.aspx), (read in Chrome) · checked 2026-10-25 · primary; [דוח פנסיה-נט, קרן 214, תקופה 10/2025 עד 09/2026](https://pensyanet.cma.gov.il/Parameters), (read in Chrome) · checked 2026-10-25 · primary; plus the Gemel-Net run for 01/2025–12/2025; [גמל-נט: סדרת קופה 7978 (מ-2024)](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=100&filters={"FUND_ID":7978}&sort=REPORT_PERIOD) · checked 2026-10-25 · primary; [גמל-נט: סדרת קופה 7978 (2023)](https://data.gov.il/api/3/action/datastore_search?resource_id=2016d770-f094-4a2e-983e-797c26479720&limit=100&filters={"FUND_ID":7978}&sort=REPORT_PERIOD) · checked 2026-10-25 · primary; and the same queries for 7860, 103, 13259, 15028, 14919, 15055, 15209, 15465; [חוזר גמל 2002/11, דוח תשואות שנתי - הרחבה](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1703/he/regulation_2002-11.pdf), pp.1 to 2, §§2, 6 · checked 2026-10-25 · primary; [חוזר גמל 2003/13, עדכון דוח תשואות (דוח 3)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-2030/he/regulation_2003-13.pdf), pp.1 to 2 · checked 2026-10-25 · primary · inferred (earlier years, first-value rule)
- Scope: general
- Dimensions: fee-management-balance, fee-deposit, fee-change-over-time
- Likely to change: yes, every January, when the previous year's average replaces the one before.

### CAT-37 "Average" is the rate actually charged from all members, after discounts (CMA definition of the same figure in member reports; identity with the field inferred)
- Rule: The CMA defines the figure of the same name that every fund must print in a member's annual report. Provident funds: "ממוצע דמי הניהול (באחוזים) שנגבו מכלל העמיתים באותו מסלול השקעה בקופה בשנת XXXX – לצד נתוני דמי הניהול שנגבו בפועל מהחשבון ... יש לפרט את דמי הניהול הממוצעים שגבתה הקופה בפועל מכלל העמיתים באותו מסלול השקעה בשנת הדוח", and the balloon note "לידיעתך, ממוצע דמי ניהול בקופה: מהפקדה ____% מחיסכון ____%" is filled with "שיעור דמי הניהול (מחיסכון ומהפקדה, בהתאמה) הממוצעים שגבתה הקופה בפועל מכלל העמיתים בקופת הגמל". Pension funds: "שיעור דמי הניהול הממוצעים שגבתה קרן הפנסיה בפועל מכלל העמיתים באותה הקרן בשנת הדוח". The quarterly report shows the averages "על בסיס שנתי". The stated purpose: "טבלת דמי ניהול שנגבו בפועל מאפשרת לבצע השוואה בין שיעור דמי הניהול שנגבה מהעמית לבין השיעור הממוצע של דמי הניהול שנגבה מכלל העמיתים בקופת הגמל". So the average is what was actually collected, after discounts, over the calendar year; per track for provident funds, per fund for pension funds.
- Conditions / exceptions: The circular defines the member-report figure, not the Gemel-Net field. No CMA text read says they are the same; the identification rests on the same wording ("ממוצע", "בשנת"), the same period (CAT-36) and the same level (track for gemel, fund for pension, CAT-39). Treat as **primary for the definition, inferred for the identity**. The circular does not say how the average is weighted (by assets, members or accounts), so OQ2 stays open for that part. Direct investment expenses ("הוצאות ניהול השקעות") are a separate line in the same report and are not part of management fees.
- Figures: none.
- Source: [חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf), pp.39, 108, 128, 132, 149 to 151, provident fund annual report parts ב.5 note 8, ג.2 and the balloon note, pension fund parts א.6, א.7 and ב.2, quarterly report note ד · checked 2026-10-25 · primary (definition) · inferred (identity with the dataset field)
- Scope: general
- Dimensions: fee-management-balance, fee-deposit
- Likely to change: no

### CAT-38 How funds report fee rates to the CMA: the monthly report's quarterly fee codes
- Rule: Circular 2015-9-9 "דוח חודשי לגבי קופות גמל, קרנות פנסיה וחברות ביטוח" (applies from the report for January 2015; the 2013 draft 2013-138 preceded it) moved fee reporting in annex א of provident and pension funds from monthly to quarterly, in the March, June, September and December reports: "דמי ניהול מנכסים בגין רבעון הדיווח, כולל תיקונים רטרואקטיביים" (KT946), "דמי ניהול מהפקדות בגין רבעון הדיווח, כולל תיקונים רטרואקטיביים" (KT947), "שיעור דמי ניהול רבעוניים שנוכו מסך נכסי הקרן" (KT948, built from "הסכום בשקלים חדשים של דמי הניהול ביום עסקים מסוים" and "שווי סך כל הנכסים ברוטו שבקופת הגמל ביום עסקים מסוים" over the business days of the quarter), "שיעור דמי ניהול רבעוניים שנוכו מתוך תשלומים (הפקדות)" (KT949), "שיעור דמי ניהול ממוצעים שנוכו מתוך תשלומים (הפקדות) המועברים בגין מבוטחים בקרן במהלך השנה" (KT411), "שיעור דמי ניהול מצטברים שנוכו מסך נכסי הקרן" (KT324) and quarterly minimum and maximum rates (KT950, KT951). Deposits are reported gross, "סעיפי ההפקדות השונים ירשמו ברוטו (לפני דמי ניהול)", and fee amounts "בהתאם לדמי הניהול שנגבו בפועל". Deposit-fee codes KT410 and KT411 were introduced by חוזר גמל 2013-2-1 when deposit fees became chargeable under the 2012 fee regulations.
- Conditions / exceptions: These rates are, by construction, fees collected divided by assets (or by deposits), that is an asset-weighted average across members. But no text read says that the published annual figure (CAT-36) is derived from these codes rather than from the annual report (CAT-36), so the weighting of the published figure remains inferred (OQ2). The PDF's digits are garbled by text extraction; the wording was read, formulas only by their symbols. Insurance companies report differently (annex ג, daily yields annex).
- Figures: none.
- Source: [חוזר גופים מוסדיים 2015-9-9 דוח חודשי לגבי קופות גמל, קרנות פנסיה וחברות ביטוח](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1446/he/regulation_h_2015-9-9.pdf), pp.9, 15, 20, §§2ז–ח, 3ה, 4ב, 5ה(2)–(3), 11 · checked 2026-10-25 · primary (reporting codes); [חוזר גופים מוסדיים 2013-138 דוח חודשי של קופות גמל, קרנות פנסיה וחברות ביטוח - טיוטה](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-3157/he/regulation_t2013-138.pdf) · checked 2026-10-25 · primary (draft labelled); [טיוטה 2013-138, מבנה דוח חודשי לגבי קופות גמל (קובץ א)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-3157/he/regulation_t2013-138a.pdf), p.16 · checked 2026-10-25 · primary (draft labelled); [טיוטה 2013-138, מבנה דוח חודשי לגבי קרן פנסיה (קובץ ב)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-3157/he/regulation_t2013-138b.pdf), p.4 · checked 2026-10-25 · primary (draft labelled); [חוזר גמל 2013-2-1, דוח חודשי של קופות הגמל - עדכון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1630/he/regulation_2013-2-1.pdf), p.1 · checked 2026-10-25 · primary · inferred (link to the published figure)
- Scope: general
- Dimensions: reporting-obligation, fee-management-balance, fee-deposit
- Likely to change: yes, the reporting format is amended every few years.

### CAT-39 Pension-Net fee fields are per fund, not per track
- Rule: Pensia-Net prints the fee pair on the fund row only and "- - -" on each track row (Harel comprehensive pension 214: 0.16% / 1.47%; its tracks: none). In the dataset every track of a fund that has a value carries the fund's pair: in 202609 each (manager, fund type) group holds one pair, and four funds (Altshuler Shaham new and general, Mor new and general) also have tracks with no value (checked over every row, 2026-10-26); for example Meitav new funds 0.11 / 1.25 and general 0.14 / 1.07, Harel new 0.16 / 1.47 and general 0.15 / 1.14, Clal new 0.14 / 1.52, Menora new 0.15 / 1.73, Phoenix new 0.14 / 1.53, Altshuler new 0.15 / 1.24, Mor new 0.19 / 1.05, Infinity new 0.18 / 1.0. This closes OQ15: a pension track's fee in the data is its fund's average, and tracks of one fund cannot be compared on fees.
- Conditions / exceptions: Pension deposit fees are large shares of deposits (1.0 to 1.73 in 202609) because a new pension fund may deduct "עד 6%" of contributions and "0.0416% (0.5% בחישוב שנתי)" of the balance monthly (Pensia-Net "מושגים"); provident tracks mostly show 0 or empty.
- Figures: as above, 202609, read 2026-10-23.
- Source: [דוח פנסיה-נט, קרן 214, תקופה 10/2025 עד 09/2026](https://pensyanet.cma.gov.il/Parameters), (read in Chrome) · checked 2026-10-25 · primary; [פנסיה-נט: כל המסלולים, תקופה 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=1000&filters={"REPORT_PERIOD":202609}) · checked 2026-10-25 · primary; [פנסיה-נט: מושגים](https://pensyanet.cma.gov.il/Home/Concepts) · checked 2026-10-25 · primary (recorded only: the page is script-rendered and a script does not get the quoted text)
- Scope: general
- Dimensions: fee-management-balance, fee-deposit
- Likely to change: no

### CAT-40 Empty, zero and negative fee values, and what they mean
- Rule: In Gemel-Net 202609, 68 of 764 tracks have no `AVG_ANNUAL_MANAGEMENT_FEE`: 43 opened in 2026, 11 in 2025, 13 in 2024, and one from 2010 (1514 "סלייס גמל בניהול אישי", an IRA track). 472 of 764 have no `AVG_DEPOSIT_FEE` while 99 show a positive one. The portals print "- - -" for an empty value and "0.00%" for zero, so empty means "not reported", not "no fee". Track 7233 ("אינפיניטי גמל מסלול לבני 60 ומעלה") shows a deposit fee of −0.21; refunds are reported as negative amounts under the reporting circular ("דמי ניהול שהוחזרו ידווחו כסכום שלילי"), but a negative rate is meaningless as a price. Pension 202609: 6 of 293 tracks empty, all opened in March 2026 (Altshuler 15840 to 15843, Mor 15892, 15893). Observed ranges, gemel 202609: management 0 to 2.0, deposit −0.21 to 1.26.
- Conditions / exceptions: Why 13 tracks opened in 2024 (Clal's tradable tracks 15424 to 15431, 15376, 15377, 15444, 15472, 15482) still have no value in 202609 is not explained; 15472's public opening date differs from its CMA inception date (OQ17), which may be the pattern (OQ22). The site should show an empty value as "not reported yet" with the likely reason, never rank it as the cheapest, and show a negative value as reported with a flag. **2026-10-27 (deposit fee):** of the 472 empty deposit fees, 310 are of product types whose fee regulation has no deposit-fee item (PF-06): every study-fund track (244), every central severance fund (53), every other-purpose fund (5) and the IRA funds filed under tagmulim (8; IRA-03 counts 15 IRA funds, 7 of them study funds). For these, empty is the rule, not a gap: the pipeline notes PF-06 as the reason and the site shows "אין". About 60 more are tracks without a full calendar year. The rest stay "reason unknown": 24 of Migdal's tracks (OQ24), guaranteed-return funds (OQ25), sector and employer funds (OQ26), and the 2024 tracks of OQ22.
- Figures: as above, read 2026-10-23.
- Source: [Gemel-Net 2024+ datastore, 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&limit=1000&filters={"REPORT_PERIOD":202609}); Pension-Net 202609 as in CAT-39; series for 15424, 15367, 15376, 15444 (same resource, filter by `FUND_ID`); circular 2015-9-9 §7ב (negatives) · checked 2026-10-23 · primary (counts), inferred (meaning of empty)
- Dimensions: fee-management-balance, fee-deposit
- Likely to change: yes, the counts change monthly.

### CAT-41 Yield and risk fields match the portal display: percent values, windows ending at the report month
- Rule: For 7978 at 202609 Gemel-Net prints "ממוצעת שנתית 3 שנים אחרונות" 13.22%, "ממוצעת שנתית 5 שנים אחרונות" 8.02%, "שארפ ריבית חסרת סיכון" 1.06, "מדד נזילות" 81.4% and "יתרת נכסים לסוף התקופה" 3,884.4 (NIS m), equal to the dataset's `AVG_ANNUAL_YIELD_TRAILING_3YRS` 13.22, `AVG_ANNUAL_YIELD_TRAILING_5YRS` 8.02, `SHARPE_RATIO` 1.06, `LIQUID_ASSETS_PERCENT` 81.4 and `TOTAL_ASSETS` 3884.43. So yields and the liquidity index are percent values, the Sharpe ratio a plain number, and the trailing windows end at the report month (the report ran to 09/2026). Yields are nominal and before management fees (CAT-04, CAT-32).
- Conditions / exceptions: The member-report circular says the yields it shows are "בניכוי הוצאות ניהול השקעות וללא ניכוי דמי ניהול" (after direct investment expenses, before management fees), while the portals say only "ללא ניכוי דמי ניהול"; whether the portal yields are after direct expenses is therefore not stated (OQ2 remainder). The Sharpe column's risk-free basis and the alpha benchmark are explained on Gemel-Net's "הסברים" page only as images of an academic paper (Caesarea Center), not read in full (OQ3).
- Figures: as above, read 2026-10-23.
- Source: Gemel-Net report as in CAT-35; [7978 at 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"FUND_ID":7978,"REPORT_PERIOD":202609}); circular 2018-9-26 (table ד note) · checked 2026-10-23 · primary
- Dimensions: real-vs-nominal, fee-management-balance
- Likely to change: no

### CAT-42 Maya's fund list on 2026-10-24: 2,009 funds, their counts by top classification and tax status, and how a person downloads the export
- Rule: On 24.10.2026 Maya's "רשימת קרנות" showed "סה''כ רשומות : 2,009" open-end funds. The page's own filters (read in Chrome through the list page's filter requests, one filter at a time, which return the record count the page prints) give: by tax status "פטורה" 1,986, "חייבת" 21, "חייבת לתושבי חוץ" 2; by top classification ("סיווג על"), where the filter list holds two sets of headings, one for the active funds (keys 1 to 121: גמישות 44, מניות בארץ 141, מניות בחו"ל 121, ממונפות ואסטרטגיות 38, קרן כספית 73, אג"ח בארץ - מדינה 103, אג"ח בחו"ל 68, לתושבי חוץ בלבד 2, חו"ל כללי 0, אג"ח בארץ - חברות והמרה 141, אג"ח בארץ - כללי 405, אגד קרנות 27; together 1,163) and one for the tracking funds and ETFs (keys 147 to 478: קרן סגורה 0, מניות בארץ 152, מניות בחו"ל 319, ממונפות 0, אג"ח בארץ - מדינה 56, אג"ח בארץ - חברות והמרה 238, אג"ח בארץ משולבת 24, אג"ח בחו"ל 36, סחורות 3, אחר 2, קרן גידור בנאמנות 0, נכסים דיגיטליים 1 and 10, אג"ח בארץ - כללי 5; together 846). The two sets sum to 2,009, so every fund carries exactly one top classification. The filter lists hold 18 managers, 14 trustees, 7 fund types (קרן פתוחה, קרן סגורה, קרן הייטק, קרן מחקה, קרן סל, קרן גידור בנאמנות, קרן חוץ נסחרת), 106 main and 215 secondary classifications, 1,150 reference assets, 10 features and 4 payment policies (לא מתחייבת לחלק תשלומים, מתחייבת לתשלום חודשי, מתחייבת לתשלום רבעוני, הינה קרן צבירה-מתחייבת לא לחלק תשלומים). To download the list by hand: open Maya, "נתוני קרנות" → "רשימת קרנות" (https://maya.tase.co.il/he/funds/mutual-funds), set any filters, press "הורדת נתונים"; the CSV has the fields in CAT-34.
- Conditions / exceptions: Scope (2026-10-26, scope settling): this is the Tel Aviv Stock Exchange as a company, its own platform's filters and export button, not an exchange rule; the counts are a count over every listed fund that belongs in data/ (which TASE's terms bar from republishing, CAT-43), so the record is not a rule. That the second heading set is the tracking-fund tree is an inference from its headings and from CAT-34 (845 funds with no distribution fee on 2026-10-22); Maya labels neither set. The counts change daily as funds open, merge and close. The list is not republished by the site (CAT-43): the site shows counts and links to Maya.
- Figures: 2,009 funds; 1,986 / 21 / 2 by tax status; per top classification as above; read 2026-10-24.
- Source: [מאיה: רשימת קרנות](https://maya.tase.co.il/he/funds/mutual-funds), read in the founder's Chrome 2026-10-24 (the page, its filter panel and the counts its filters return); the page and its total (2,009) re-read 2026-10-25 · checked 2026-10-25 · institution (TASE's own platform; recorded only, the page is script-rendered)
- Scope: institution: Tel Aviv Stock Exchange
- Dimensions: `product-marking`
- Likely to change: yes, daily; recheck with each monthly save.

### CAT-43 TASE's terms of use (edition August 2026) forbid republishing the Maya export; limited quotation with a link is allowed, databases are not
- Rule: TASE's site terms, "מהדורת אוגוסט 2026", apply "על השימוש בכל פלטפורמה דיגיטלית באמצעותה מסופקים השירותים" (so to Maya and market.tase.co.il as well as www.tase.co.il). Use is "אך ורק למטרות שאינן מסחריות"; "אין לפרסם ברבים את המידע ו/או כל חלק ממנו ואין לפרסם כל מוצר שמקורו במידע … מבלי שניתן לכך אישור הבורסה מראש ובכתב"; "אין להעתיק ו/או לשכפל ו/או להדפיס את המידע או כל חלק ממנו לצורך הפצה או פרסום בדרך כלשהי" without that consent. The automated-means section forbids any automated activity, bots and AI tools without written approval, with an exception for "איתור, שליפה נקודתית, סיכום, ציטוט מוגבל או הצגה באמצעות אמצעים אוטומטיים של תכנים ציבוריים המוצגים בדומיין www.tase.co.il, ובלבד שכל הצגה של תוכן כאמור תכלול קישור ישיר לעמוד המקור"; "החרגה זו אינה מתירה אימון מודלים, שליפה רחבת היקף או הקמת מאגרים"; "scraping, mining, harvesting, שליפה רחבת היקף" are forbidden unless TASE permits them expressly, and permissions may be published in dedicated files per domain (robots.txt or llms.txt do not count by themselves). Intellectual property in "לקטים" (compilations) is TASE's. The terms carry no edition number beyond the month and may change at any time.
- Conditions / exceptions: Scope (2026-10-26, scope settling): these are the Tel Aviv Stock Exchange's terms as a site operator, a company's own contract terms, not the exchange's rules approved by the Securities Authority. For the site this means: no `data/fund-lists/` file is shipped (the republishing status stays unconfirmed, data-schema 3.14); the site may quote counts (CAT-42, ETF-43) with a direct link to the source page, and tells a person how to download the export themselves. Written consent from TASE (spokesperson@tasemail.co.il or the contact form) would lift this; asking is the founder's call, as for the Bank of Israel series (product D20) and the TASE fee calculator (BRK-37).
- Figures: none (terms).
- Source: [TASE, תנאי שימוש, מהדורת אוגוסט 2026](https://www.tase.co.il/he/content/about/terms_of_service), read in the founder's Chrome 2026-10-24 and again 2026-10-25 · checked 2026-10-25 · institution (TASE's own site terms, not its rulebook)
- Scope: institution: Tel Aviv Stock Exchange
- Dimensions: `regulator`
- Likely to change: yes; the terms carry an edition month.

## Proposed dimensions

- `default-track`: which track a saver lands in without choosing (CAT-18, CAT-19, CAT-25). It matters for 3.6 ("did you choose this?") and for the catalogue's "most common".
- `track-mandate`: the gap between a track's name, its regulatory policy and its current actual mix (CAT-15, CAT-23, CAT-24).

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| מס' הקופה | Fund number (Gemel-Net `FUND_ID`) | Track's income-tax number; unique row key | CMA data, Gemel-Net | CAT-02, CAT-09 |
| מס' המסלול / מספר מסלול | Track number | Pension and insurance `FUND_ID` | CMA data | CAT-02 |
| מספר קרן / שם קרן | Fund number / name | Pension `PARENT_COMPANY_ID` / `_NAME` | CMA data | CAT-09 |
| מספר חברה / מספר רישיון החברה | Company / licence number | Insurance `PARENT_COMPANY_ID` | CMA data | CAT-09 |
| שם קופה / שם מסלול | Fund / track name | `FUND_NAME` | CMA data | CAT-02 |
| סוג קופה / סוג קרן | Product type | `FUND_CLASSIFICATION` | CMA data | CAT-10 |
| תקופת הקמת המסלול | Track establishment period | Insurance `FUND_CLASSIFICATION` | CMA data | CAT-10 |
| שם תאגיד שולט | Controlling corporation | `CONTROLLING_CORPORATION` | CMA data | CAT-02 |
| שם חברה מנהלת | Managing company | `MANAGING_CORPORATION` | CMA data, statements | CAT-02 |
| ח.פ חברה | Company registration no. | `MANAGING_CORPORATION_LEGAL_ID` | CMA data | CAT-09 |
| תקופת הדיווח yyyymm | Report period | `REPORT_PERIOD` | CMA data | CAT-05 |
| תאריך הקמה / תאריך הקמת הקופה/מסלול | Inception date | `INCEPTION_DATE`; 1970-01-01 seen as a value (track 103) | CMA data | CAT-25, OQ 6 |
| אוכלוסיית יעד | Target population | `TARGET_POPULATION` | CMA data | CAT-10 |
| כלל האוכלוסיה / עובדי מפעל/גוף מסוים / עובדי סקטור מסוים | Open to all / one employer / one sector | Target population values | CMA data | CAT-10 |
| סוג התמחות ראשית / סוג התמחות משנית | Primary / secondary specialization | `SPECIALIZATION` / `SUB_SPECIALIZATION` | CMA data | CAT-10 |
| הפקדות ללא העברות | Deposits excluding transfers | `DEPOSITS`, NIS m | CMA data | CAT-08 |
| משיכות ללא העברות | Withdrawals excluding transfers | `WITHDRAWLS`, NIS m | CMA data | CAT-08 |
| העברות בין הקופות / העברות בין המסלולים | Net transfers | `INTERNAL_TRANSFERS`, NIS m | CMA data | CAT-08 |
| צבירה נטו | Net accumulation | `NET_MONTHLY_DEPOSITS` / `MONTHLY_DEPOSITS` | CMA data | CAT-08 |
| יתרת נכסים לסוף תקופה | Assets at period end | `TOTAL_ASSETS`, NIS m | CMA data | CAT-03 |
| שיעור דמי ניהול ממוצעת שנתי – נכסים | Average annual fee on assets | `AVG_ANNUAL_MANAGEMENT_FEE`, % | CMA data | CAT-06 |
| שיעור דמי ניהול ממוצעת- הפקדות | Average fee on deposits | `AVG_DEPOSIT_FEE`, % | CMA data | CAT-06 |
| דמי ניהול ממוצעים מצבירה בשנה קודמת | Average fee on balance, previous year | Meitav's label for the same value | Institution site | CAT-06 |
| דמי ניהול ממוצעים מהפקדה משנה קודמת | Average fee on deposits, previous year | Meitav's label | Institution site | CAT-06 |
| תשואה חודשית | Monthly yield | `MONTHLY_YIELD`, %, gross | CMA data | CAT-05 |
| תשואה מצטברת מתחילת השנה | Year-to-date yield | `YEAR_TO_DATE_YIELD` | CMA data, statements | CAT-05 |
| תשואה מצטברת ל-3 / ל-5 שנים עוקבות | Cumulative 3- / 5-year yield | `YIELD_TRAILING_3_YRS` / `_5_YRS` | CMA data | CAT-05 |
| תשואה שנתית ממוצעת ל-3 / ל-5 שנים עוקבות | Average annual 3- / 5-year yield | `AVG_ANNUAL_YIELD_TRAILING_*` | CMA data | CAT-05 |
| תשואות נומינליות ברוטו | Nominal gross yields | All yields are before management fees | CMA dictionary | CAT-04 |
| התשואה הינה לפני ניכוי דמי ניהול | Yield before fees | Institution's wording | Institution site | CAT-04 |
| סטית תקן – 5 שנים עוקבות | 5-year standard deviation | `STANDARD_DEVIATION` | CMA data | CAT-07 |
| אלפא שנתית | Annual alpha | `ALPHA`, 60 months | CMA data | CAT-07 |
| שארפ ריבית חסרת סיכון | Sharpe vs risk-free | `SHARPE_RATIO`, 60 months | CMA data | CAT-07 |
| יחס נזילות | Liquidity ratio | `LIQUID_ASSETS_PERCENT`, % | CMA data | CAT-07 |
| חשיפה למניות / לחו"ל / למט"ח | Equity / foreign / FX exposure | Exposure fields, NIS m (inferred) | CMA data | CAT-03 |
| איזון אקטוארי (דווח פעם ברבעון) | Actuarial balance, quarterly | Pension `ACTUARIAL_ADJUSTMENT` | CMA data | CAT-02 |
| תגמולים ואישית לפיצויים | Provident (benefits and personal severance) | Product type | CMA data | CAT-10 |
| קרנות השתלמות | Study funds | Product type | CMA data | CAT-10 |
| קופת גמל להשקעה | Investment provident fund | Product type | CMA data, app, ads | CAT-10 |
| קופת גמל להשקעה - חסכון לילד | Child-savings investment fund | Product type | CMA data | CAT-10 |
| מרכזית לפיצויים / מטרה אחרת | Central severance / other purpose | Product types | CMA data | CAT-10 |
| קרנות חדשות / קרנות כלליות | New / general pension funds | Pension types | CMA data | CAT-10 |
| מספר קופה -אישור מס הכנסה | Fund income-tax approval no. | Umbrella fund number (for example 7857) | transfer_bank | CAT-30 |
| מספר מסלול השקעה | Track number | = Gemel-Net `FUND_ID` | transfer_bank | CAT-30 |
| חברה מתפעלת | Operating company | Back-office operator (Meitav: Mizrahi Tefahot) | transfer_bank | CAT-30 |
| מ.ה. | Income-tax number | Track or fund number in institution tables | Institution docs | CAT-26 |
| מסלול השקעה | Investment track | | Statements, app, circular | CAT-14 |
| מסלול כללי | General track | Not specialized, not default, not annuitant | Circular, app | CAT-17 |
| מסלול השקעה מתמחה | Specialized track | Track in the CMA list under clusters 1 to 5 | Circular | CAT-17 |
| אשכול 1 – מסלולי השקעה בניהול אקטיבי | Cluster 1, active | | Circular | CAT-17 |
| אשכול 2 – בניהול אקטיבי בדמי ניהול משתנים | Cluster 2, variable fees | | Circular | CAT-17 |
| אשכול 3 – השקעות ישירות בנכסים סחירים | Cluster 3, tradable | | Circular | CAT-17 |
| אשכול 4 – מסלולי השקעה עוקבי מדדים | Cluster 4, index-tracking | | Circular | CAT-17 |
| אשכול 5 – מסלולי אמונה וקיימות | Cluster 5, faith and sustainability | | Circular | CAT-17 |
| מתמחים בניהול אקטיבי / מתמחים באפיקי השקעה סחירים / עוקבי מדדים | Category labels as written in the data | | CMA data | CAT-10 |
| מסלול ברירת מחדל / מסלול השקעה ברירת מחדל | Default track | Track for those who do not choose | Circular, institution site | CAT-18 |
| מסלול ברירת המחדל בעת ההצטרפות לקופת הגמל | Default track on joining | Meitav's label for 7978 | Institution site | CAT-25 |
| מודל השקעות תלוי גיל / מדרגות | Age-dependent model / "steps" | | Circular, CMA data | CAT-19 |
| לבני 50 ומטה / לבני 50 עד 60 / לבני 60 ומעלה | Age-band tracks | | App, statements | CAT-19 |
| מסלול השקעה כספי / תקופת הבחירה | Money-market track / chosen period | 6, 12 or 24 months | Circular | CAT-20 |
| מסלול אירוח | Hosted track | Managed by an external investment manager | Circular | CAT-17 |
| מדיניות השקעה תקנונית | Regulatory investment policy | Set in bylaws; ties the name | Circular, notices | CAT-24 |
| מדיניות השקעה צפויה / מוצהרת | Expected / declared policy | Can change within the regulatory policy | Circular, institution site | CAT-24 |
| רשימת מסלולי השקעה | CMA list of tracks | Names and policies | Circular | CAT-15 |
| איסור הטעיה בשם | Prohibition of misleading names | | Circular | CAT-16 |
| כללי | General | Standard track name | Data, app | CAT-10 |
| כספי (שקלי) / כספי (שיקלי) | Money (shekel) | Standard name; spelling varies | Data / institution | CAT-23 |
| אשראי ואג"ח | Credit and bonds | Standard name | Data, app | CAT-23 |
| אשראי ואג"ח עם מניות (עד 25% מניות) | Credit and bonds with equities up to 25% | Standard name | Data, app | CAT-23 |
| אג"ח ממשלות | Government bonds | Standard name (active cluster) | Data | CAT-10 |
| מניות | Equities | Standard name | Data, app | CAT-10 |
| אג"ח סחיר / מניות סחיר / משולב סחיר | Tradable bonds / equities / combined | Standard names (tradable cluster) | Data, app | CAT-10 |
| סחיר - אג"ח עם מניות (עד 25% מניות) | Tradable bonds with equities up to 25% | Standard name | Data | CAT-25 |
| אג"ח ממשלתי סחיר | Tradable government bonds | Sub-specialization | Data | CAT-10 |
| עוקב מדדי מניות / עוקב מדדי אג"ח / עוקב מדד S&P 500 / עוקב מדדים גמיש | Index-tracking: equity indices / bond indices / S&P 500 / flexible | Standard names | Data, app | CAT-10, CAT-23 |
| הלכה / הלכה יהודית / הלכה איסלאמית | Jewish law / Islamic law | Faith tracks | Data | CAT-10 |
| קיימות | Sustainability | Standard name | Data | CAT-10 |
| מבטיח תשואה | Guaranteed-return | Legacy specialization (tagmulim) | Data | CAT-10 |
| פאסיבי - כללי / פאסיבי - מדדי מניות / מחקה מדד / שקלי טווח קצר / אג"ח עד 20% במניות | Pre-2024 names | Old names still on old statements | Institution flyer | CAT-26 |
| מסלול המתמזג / מסלול הקולט | Merging / absorbing track | | Institution notices | CAT-13 |
| שינוי התמחות | Change of specialization | | Circular, notices | CAT-21 |
| קרנות כפולות | "Duplicate" mutual funds | Same policy, separate funds | ISA report | CAT-31 |
| קרן מחקה / קרן סל | Tracking fund / ETF | Two passive types | ISA report | CAT-31 |
| שיעור דמי ניהול ממוצע לשנת X / שיעור דמי ניהול ממוצעים בשנת X | Average fee rate for year X | Column head for the two fee fields; X is the latest completed year | Gemel-Net, Pensia-Net | CAT-35, CAT-36 |
| נכסים / הפקדות (sub-columns) | On assets / on deposits | Annual rate of assets; share of deposits | Gemel-Net, Pensia-Net | CAT-35 |
| דמי ניהול שנגבו בפועל | Fees actually charged | After discounts, as collected | Member annual report (circular) | CAT-37 |
| ממוצע דמי ניהול בקופה: מהפקדה / מחיסכון | Average fees in the fund: on deposit / on savings | The member report's balloon note | Member annual report | CAT-37 |
| דמי ניהול מנכסים בגין רבעון הדיווח | Fees from assets for the reporting quarter | Regulator reporting code KT946 | CMA monthly report | CAT-38 |
| דוח תשואות ודמי ניהול שנתיים ("דוח 3") | Annual yields and fees report | Old annual report to the regulator, due 15 January | Circulars 2002/11, 2003/13 | CAT-36 |

## Institutions

Managing companies with a general-specialization investment-provident track in Gemel-Net 202609 (enumerated from the CMA data on 2026-10-22).

Open to all (12):
- איילון קופות גמל
- אינפיניטי השתלמות, גמל ופנסיה
- אלטשולר שחם גמל ופנסיה ("חיסכון פלוס")
- אנליסט קופות גמל ("מסלולית")
- הפניקס פנסיה וגמל
- הראל פנסיה וגמל
- ילין לפידות ניהול קופות גמל
- כלל פנסיה וגמל ("גמל לעתיד")
- מגדל מקפת קרנות פנסיה וקופות גמל
- מור גמל ופנסיה
- מיטב גמל ופנסיה
- מנורה מבטחים פנסיה וגמל

Sector or employer funds (6): גל (teachers), הנדסאים וטכנאים, האוניברסיטה העברית, יחד רופאים, מחוג (Israel Electric), עמ"י.

The full list of managing companies per product is in research/discovery/domain-landscape.md 5.1, taken from the same data. The catalogue should pull it from Gemel-Net each month, not from this list.

## Open questions

1. **CMA "sources and assumptions" pages (discovery O11, remainder).** The dictionaries (CAT-02) define units and the gross basis, but not averaging, risk-measure method or exposure basis. Tried on 2026-10-22: `https://gemelnet.cma.gov.il/views/dafmakdim.aspx`, `https://gemelnet.cma.gov.il/`, `https://pensyanet.cma.gov.il/` and `https://bituachnet.cma.gov.il/` all returned ECONNRESET; `http://gemelnet.mof.gov.il/views/dafmakdim.aspx` did not resolve. Likely on the -net portals' explanation pages; needs a browser pass. **[2026-10-22 browser pass: Partly closed by CAT-32 (gross nominal yields confirmed); fee averaging still open.]** **[2026-10-23 browser pass: fee fields closed for unit, period, level and basis (CAT-35 to CAT-40); yields' percent unit and window end confirmed (CAT-41). Still open: averaging weight (OQ2), risk-measure method (OQ3), exposure basis (OQ4).]**
2. **Fee averaging.** How `AVG_ANNUAL_MANAGEMENT_FEE` and `AVG_DEPOSIT_FEE` are averaged (by assets or by members), over which period, and whether they include discounts. Meitav labels them previous-year averages (CAT-06), but the CMA does not. Also what "ברוטו" excludes besides management fees (direct expenses). Same sources as item 1. **[2026-10-23: Period closed (latest completed calendar year, CAT-36). Basis closed as far as the CMA defines the same-named member-report figure: actually charged, after discounts, across all members (CAT-37); the identity with the dataset field is inferred. Weighting still open: the regulator's own fee-rate codes are fees collected divided by assets (asset-weighted by construction, CAT-38), but no text says the published annual figure is built from them. "ברוטו": the member-report yields are after direct expenses and before management fees; the portals say only "ללא ניכוי דמי ניהול" (CAT-41).]** **[2026-10-26 open-questions audit]** Still open (narrowed). Searched: one web search for a CMA definition of how the average fee is weighted (only comparison sites that reprint the field). Would settle it: the CMA's reporting instructions that feed the portals (see item 23).
3. **Risk fields.** The alpha benchmark, the Sharpe risk-free index, whether the standard deviation is annualised, and the definition of "liquid" for `LIQUID_ASSETS_PERCENT`. Same sources as item 1.
4. **Exposure fields.** The NIS-millions unit is inferred (CAT-03). Whether exposure is delta- or derivative-adjusted, by look-through, and how FX hedging counts is unknown. Same sources; also the CMA reporting circular for monthly fund reports (not located).
5. **Liquidity semantics.** Covered by item 3.
6. **INCEPTION_DATE.** 1970-01-01 appears for track 103 (a placeholder?). CMA dates differ from Meitav's founding dates (2016-11-10 vs 13/11/2016; 2024-06-23 vs 01/07/2024; 2024-12-17 vs 01/07/2026). Which date the CMA field means is unknown. Same sources as item 1.
7. **Revisions and completeness.** Whether past periods are revised, and whether a new period appears complete on first publication. Row counts differed across 202607 to 202609. Needs snapshots over several months (product.md § 6).
8. **Merger representation.** One case shows that mergers are not recorded in `INTERNAL_TRANSFERS` (CAT-08). Confirm on more mergers.
9. ~~**The CMA list of investment tracks** ("רשימת מסלולי השקעה", circular s.10) with each name's regulatory policy was not obtained.~~ Closed 2026-10-26: the list in force, "רשימת מסלולי השקעה – תיקון" (ref. 2024-1471, 17.4.2024, 18 pages), is on gov.il at `https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_PDF.pdf` and sets each name's regulatory policy and the products it may be used in (CAT-23, CAT-15). **[2026-10-26 open-questions audit, lead]** The address came from the glossary research of the same day (`research/knowledge/2026-10-26-glossary-sources.md`); the file was read by curl and its texts match what CAT-23 had quoted from Meitav's notices. Web search for it returned only institution pages and drafts, and this turn's search budget was then exhausted. Likely at gov.il under the CMA's circulars or "רשימות" pages; gov.il BlobFolder PDFs did download by script, so the PDF may be reachable once its URL is known. The old 2015 list URL seen in a search title was `https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1456/he/regulation_2015-9-7a.pdf`. It was not opened and is superseded. **[2026-10-25 scope pass]** Instrument identified: "רשימת מסלולי השקעה – תיקון", ref. 2024-1471, dated 17.4.2024. Altshuler Shaham's bylaw-change summaries cite it by name, number and date ("שה. 2024-1471 'רשימת מסלולי השקעה - תיקון' (מיום 17.4.2024)") as the basis of the 1.7.2024 renaming ([אלטשולר שחם פנסיה מקיפה, תקנון, ריכוז שינויים יולי 2024](https://www.as-invest.co.il/media/oljpywz4/אלטשולר-שחם-פנסיה-מקיפה-תקנון-ריכוז-שינויים-יולי-2024.pdf), ss.19-20, read 2026-10-25, institution, used only to identify the instrument); a search summary of the CMA's 2024 annual report also mentions a list issued in June 2024 (not opened). Searched: web search for the list by title, by number and with policy wording (only institution documents came up); gov.il search results (the 2015 list `regulation_2015-9-7a.pdf`, superseded, and the 2022 drafts); the CMA consolidated circular's investment-assets chapter (`information-entities-codex/.../of_Chapter_4_Management_of_investment_assets.pdf`, no list in it); Altshuler Shaham's pages and PDFs for a gov.il link (none). What would settle CAT-23: the gov.il PDF of 2024-1471, likely under the CMA's dynamic collector of circulars and notices (the govil-page tool could open the CMA circulars index). **[2026-10-26 open-questions audit]** Still open (narrowed: instrument identified). Searched: two web searches by number and by title restricted to gov.il (only the superseded 2015 list and the 2022 drafts came up); a gov.il collector page guessed as `dynamiccollectors/regulation` (gov.il answered with its error page); four guessed BlobFolder URLs under `regulation-1456` and `notice-2024-1471` (none exists). Would settle it: the CMA collector's real name, or the item page of 2024-1471, opened in the founder's Chrome or through govil-page.sh once the address is known.
10. **Start-date deferral.** The CMA instrument that moved the start from 1.1.2024 (circular 2022-9-30) to 1.7.2024 (as stated by Meitav and Harel) was not seen. It is probably a later amendment circular on gov.il.
11. **Money-market track period (s.6א).** Whether it applies to investment provident funds and study funds, and how Meitav implements it for 7861. Sources: Meitav bylaws (תקנון) for fund 7857; CMA FAQ.
12. ~~**Meitav app (product.md 3.10 example).** The "open a new saving" button, the 8 tracks shown, the "general, most common" and "choose myself" options, and the duplicate "general" could not be seen; the join page returned a title only.~~ Closed 2026-10-23: not needed; the site lists all 16 tracks of the fund from the regulator's data, so which eight the app shows does not change coverage (product.md D17; CAT-25, CAT-28). Needs the founder to type or screenshot the menu and list. CAT-28 lists the three hypotheses the data leaves open. **[2026-10-23: Not needed. The founder meant that the site must cover every option, not explain the app (product.md D17, appendix E). The site lists all 16 tracks from the data, so which eight the app shows does not change coverage.]**
13. **"מיטב קידס".** Whether it is fund 7857 (same join URL) or a separate fund. Source: Meitav Kids terms or the founder's app.
14. ~~**ISA mutual-fund list.** Where the public list with names, classification and exposure codes is published and in what format.~~ Closed 2026-10-22: TASE's Maya site lists every Israeli open-end mutual fund with classification and exposure code, and its export gives the fields per fund (CAT-33, CAT-34). Tried: `https://www.new.isa.gov.il/nav-index/api/mutualfunds-search` (empty shell), `https://www.tase.co.il/he/market_data/funds`, which redirected to `https://market.tase.co.il/he/market_data/funds` (403), and the ISA 2024 report (no mention). Likely at ISA's mutual-fund search, MAGNA, or TASE DataHub (data-landscape 1.6, 1.7). Owner of the code meanings: `mutual-funds-and-money-market-funds.md`. **[2026-10-22 browser pass: Closed by CAT-33 (Maya).]**
15. ~~**Pension fees reported at fund level?**~~ Closed 2026-10-23: yes; Pensia-Net prints the fee pair on the fund row only, and every track of a fund carries the fund's pair in the data (CAT-39). All Meitav comprehensive-pension tracks show 0.11 and 1.25 in 202609. Same sources as item 1. **[2026-10-23 browser pass: Closed by CAT-39. Pensia-Net prints the pair on the fund row and "- - -" on every track.]**
16. **Operator codes.** The meaning and use of "קוד מזרחי", "קוד נס פנסיה" and the "קידוד" string (512065202000000000078570000000) on Meitav notices; possibly clearing-house product codes. Not needed for R1.
17. **Track 15472 "אג"ח ממשלות".** CMA inception 2024-12-17, but Meitav's founding date is 01/07/2026, YTD yield is null in both sources, and assets are 4.7 NIS m. When was it opened to the public? Source: Meitav notice or bylaws amendment.
18. **Track-name prefix rules and the 2024 draft regulation** on moving default-track members to age-matched tracks. Both were seen only as search titles or snippets (tazkirim.gov.il) and were not opened.
19. ~~**Which of Meitav's other products** (IRA "בניהול אישי" in tagmulim 1486 and study fund 1487, Kids) the app offers under "open a new saving".~~ Closed 2026-10-23: not needed; every Meitav product in the regulator's data is in the catalogue whatever the app shows (product.md D17; CAT-26). Same as item 12. **[2026-10-23: Not needed, as item 12: every Meitav product in the data is in the catalogue whatever the app shows.]**
20. **Exact spellings** in classification values (מסוים vs מסויים, שיקלי vs שקלי) for string matching. Confirm from the raw cp1255 CSV.
21. **Dictionary vs data mismatches.** The gemel dictionary lists "קופת גמל להשקעה חיסכון לכל ילד", while the data has "קופת גמל להשקעה - חסכון לילד". Pension's net-flow description contradicts the data (CAT-08). Report to the CMA, or simply rely on the data and document it.
22. **Thirteen tracks opened in 2024 with no fee value in 202609** (Clal 15424 to 15431, 15376, 15377, 15444, 15472, 15482; CAT-40). Under CAT-36 they should have had a 2025 average from 202601. Possible reason: the CMA inception date precedes the public opening (OQ17 shows this for 15472). Check their 202701 rows; if still empty, ask the CMA (through the portals' "צור קשר" form).
23. **The computation of the published annual average.** No CMA text read states the formula or the weighting of "שיעור דמי ניהול ממוצע לשנת X" (CAT-36, CAT-37), nor which report feeds the portals: the annual yields-and-fees report ("דוח 3", circulars גמל 2002/11, 2003/13, due 15 January; whether still in force is unknown) or the quarterly codes of circular 2015-9-9 (CAT-38). Tried on 2026-10-23: Gemel-Net's "מקורות המידע", "הסברים" and report pages; Pensia-Net's "מושגים" and "מקורות המידע"; the data.gov.il dictionaries and dataset descriptions; gov.il searches for "דוח חודשי", "דיווח שנתי", "דמי ניהול ממוצעים". Likely in the CMA's current annual reporting instructions ("הוראות דיווח שנתי" / "קובץ דיווח שנתי") or in a Gemel-Net system specification that is not public.
24. **Migdal's empty deposit fees.** Migdal leaves `AVG_DEPOSIT_FEE` empty on 24 of its 32 kupat gemel lehashkaa, tagmulim and child-savings tracks in 202609 (858, 859, 863, 1161, 7931, 7932, 7934, 7935, 7937, 8012, 9895, 9898, 13563, 13565, 14229, 14943, 14944, 15341, 15452 to 15457), where most other managers of the same products report 0 or a value; 8 of its tracks report one (7936, 9779 to 9781, 9896, 9897, 14228, 15055). These products may charge up to 4% of deposits (PF-02), so empty may be 0 or unreported. Would settle it: Migdal's member reports or bylaws for these funds, or the CMA (2026-10-27).
25. **Guaranteed-return funds and the deposit fee.** Nine tracks (120, 528 to 533, 536, 539: "מבטיח תשואה", Menora "יותר" and "אמיר") have an empty deposit fee. Reg. 2(ב) excludes guaranteed-return funds from the general cap; whether their own cap has a deposit-fee item was not read (2026-10-27).
26. **Which funds charge "actual expenses".** The annual-statement circular names "קופה לפי הוצאות בפועל" among the funds that cannot charge a deposit fee (PF-06), and sector funds charge actual expenses (law s.32(ג)). The data has no field that marks a sector fund (קופת גמל ענפית): of the tracks whose TARGET_POPULATION is a sector or an employer, 84 are empty, but 12 report a deposit fee (5 of them 0), so the target population is not that marker. Would settle it: the CMA's list of sector funds (2026-10-27).

## Left out and why

- **Fee caps, transfer and withdrawal rules, deposit ceilings:** `provident-family-common.md` and the wrapper files. Statements seen on Meitav pages (a fee figure and a deposit limit) are handed off in the report, not recorded here as rules.
- **Tax treatment of tracks and switches:** tax files.
- **Child-savings track rules** (circular 2022-9-29) and annuitant tracks (circular s.5): `child-savings.md`, `pension-and-gemel-lekitzba.md`. Only the names needed for decoding are here.
- **Track-level holdings (asset lists):** the CMA holdings datasets stopped in 2023 (data-landscape 1.2.1). Not re-checked.
- **Every manager's full track list:** not copied into this file. It is one query per month (CAT-25 shows the pattern). Copying it would go stale.
- **Past-return ranking:** product.md section 4. Yields are documented as fields, not as a ranking basis.
- **Bank account fields of `transfer_bank`:** not needed and not personal to the saver; excluded from any `data/` file.
- **Bypassing bot protection** on gov.il, TASE, ISA and the -net portals: not attempted.
- **Search-snippet claims** (for example the Altshuler note on index limits, the Planit cluster summary, the msl.org.il median fee): not opened, so not used.

## Sources

| Title | Publisher | URL | Strength | Checked |
|---|---|---|---|---|
| Gemel-Net dataset metadata | CMA via data.gov.il | https://data.gov.il/api/3/action/package_show?id=gemelnet | primary | 2026-10-22 |
| Pensia-Net dataset metadata | CMA via data.gov.il | https://data.gov.il/api/3/action/package_show?id=pensia-net | primary | 2026-10-22 |
| Bituach-Net dataset metadata | CMA via data.gov.il | https://data.gov.il/api/3/action/package_show?id=insurance | primary | 2026-10-22 |
| פירוט שינויים פורמט חדש גמל (field dictionary) | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444 | primary | 2026-10-22 |
| פירוט שינויים פורמט חדש פנסיה | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=b58b5a80-84b7-490d-ab02-bff12f1941b2 | primary | 2026-10-22 |
| פירוט שינויים פורמט חדש ביטוח | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=388992c7-0280-48d8-b147-13e636bd804d | primary | 2026-10-22 |
| Gemel-Net 2024+ data (queries as cited in rules) | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb | primary | 2026-10-22 |
| Gemel-Net 2023 data | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=2016d770-f094-4a2e-983e-797c26479720 | primary | 2026-10-22 |
| Pension-Net 2024+ data | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd | primary | 2026-10-22 |
| Bituach-Net 2024+ data | CMA via data.gov.il | https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647 | primary | 2026-10-22 |
| פרטי קופות לצורך העברה בנקאית כספים בין גופים מוסדיים | CMA via data.gov.il | https://data.gov.il/api/3/action/package_show?id=transfer_bank | primary | 2026-10-22 |
| חוזר גופים מוסדיים 2022-9-30 "מסלולי השקעה בקופות גמל - תיקון" (with consolidated 2022-9-28 text) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf | primary | 2026-10-22 |
| Draft 2022-312 (22.11.2022) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-22-11-22-1/he/Investment-tracks-in-provident-funds-draft-pdf.pdf | primary (draft, not in force) | 2026-10-22 |
| Draft 2020-253 "ניהול מסלולי השקעה בקופת גמל" (19.5.2022) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-25/he/Management-of-investment-tracks-in-a-provident-fund-draft.pdf | primary (draft, not in force) | 2026-10-22 |
| פעילות קרנות נאמנות בישראל 2024 | ISA | https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf | primary | 2026-10-22 |
| מיזוג מסלולי השקעה בקופת הגמל "מיטב גמל להשקעה" (7857), May 2024 | Meitav | https://www.meitav.co.il/media/41anarx5/%D7%9E%D7%99%D7%96%D7%95%D7%92-%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94-7981.pdf | institution | 2026-10-22 |
| ריכוז מיזוגים (merger summary, all products) | Meitav | https://www.meitav.co.il/media/r0wh30iv/%D7%A8%D7%99%D7%9B%D7%95%D7%96-%D7%9E%D7%99%D7%96%D7%95%D7%92%D7%99%D7%9D-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf | institution | 2026-10-22 |
| פלייר תפעולי (old-to-new track map) | Meitav | https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf | institution | 2026-10-22 |
| שינוי שם ומדיניות השקעה תקנונית, track 7980 | Meitav | https://www.meitav.co.il/media/53vlo3zc/שינוי-התמחות-גמל-להשקעה-7980.pdf | institution | 2026-10-22 |
| שינוי שם ומדיניות השקעה תקנונית, track 7861 | Meitav | https://www.meitav.co.il/media/sisdprky/שינוי-התמחות-גמל-להשקעה-7861.pdf | institution | 2026-10-22 |
| רפורמת מסלולי השקעה 2024 | Meitav | https://www.meitav.co.il/provident_pension/reform_of_investment_routes_2024/ | institution | 2026-10-22 |
| קופת גמל להשקעה product page | Meitav | https://www.meitav.co.il/provident_pension/provident_invest/ | institution | 2026-10-22 |
| מסלולים ותשואות, גמל להשקעה | Meitav | https://www.meitav.co.il/provident_pension/kupa_gemel_invest_reports/ | institution | 2026-10-22 |
| שינוי מדיניות השקעה, עוקב מדדים גמיש | Meitav | https://www.meitav.co.il/provident_pension/flexible_index_tracker_actively_managed_indices/ | institution | 2026-10-22 |
| מיטב קידס | Meitav | https://www.meitav.co.il/provident_pension/saving_kids/ | institution | 2026-10-22 |
| אפליקציית מיטב | Meitav | https://www.meitav.co.il/application/ | institution | 2026-10-22 |
| Provident and pension menu | Meitav | https://www.meitav.co.il/provident_pension/ | institution | 2026-10-22 |
| Online join page (title only) | Meitav | https://gemel-invest.meitav.co.il/Join?pt=11&pn=gemelInvestM | institution (not readable) | 2026-10-22 |
| רפורמה במסלולי השקעה | Harel | https://www.harel-group.co.il/long-term-savings/information/reform | institution (another manager, used for category grouping only) | 2026-10-22 |
| Gemel-Net, Pensia-Net, Bituach-Net portals | CMA | https://gemelnet.cma.gov.il/views/dafmakdim.aspx, https://pensyanet.cma.gov.il/, https://bituachnet.cma.gov.il/ | not reached (ECONNRESET) | 2026-10-22 |
| ISA mutual-fund search; TASE funds | ISA, TASE | https://www.new.isa.gov.il/nav-index/api/mutualfunds-search, https://market.tase.co.il/he/market_data/funds | not reached (empty shell; 403) | 2026-10-22 |
| Gemel-Net yields report (fund 7978, periods 10/2025–09/2026 and 01/2025–12/2025; column "שיעור דמי ניהול ממוצע לשנת 2025") | CMA | https://gemelnet.cma.gov.il/views/gemelTsuot.aspx | primary (read in Chrome) | 2026-10-23 |
| Gemel-Net help pages: מה ניתן להפיק, הסברים (Link1, Link2, Link4, Link5), מקורות המידע (Link3) | CMA | https://gemelnet.cma.gov.il/views/dafMakdim_Link1.aspx … dafMakdim_Link5.aspx | primary (no fee definition on them) | 2026-10-23 |
| Pensia-Net report (fund 214; column "שיעור דמי ניהול ממוצעים בשנת 2025") | CMA | https://pensyanet.cma.gov.il/Parameters | primary (read in Chrome) | 2026-10-23 |
| Pensia-Net: מושגים, מקורות המידע והנחות המערכת, מה ניתן להפיק | CMA | https://pensyanet.cma.gov.il/Home/Concepts, /Home/Sources, /Home/What | primary | 2026-10-23 |
| חוזר גופים מוסדיים 2018-9-26, דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי - תיקון (consolidated 2017-9-22 text) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-710/he/regulation_h_2018-9-26.pdf | primary | 2026-10-23 |
| חוזר גופים מוסדיים 2015-9-9, דוח חודשי לגבי קופות גמל, קרנות פנסיה וחברות ביטוח | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1446/he/regulation_h_2015-9-9.pdf | primary | 2026-10-23 |
| Draft 2013-138, דוח חודשי של קופות גמל, קרנות פנסיה וחברות ביטוח, with file structures א and ב | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-3157/he/regulation_t2013-138.pdf (…138a.pdf, …138b.pdf) | primary (draft) | 2026-10-23 |
| חוזר גמל 2013-2-1, דוח חודשי של קופות הגמל - עדכון | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1630/he/regulation_2013-2-1.pdf | primary | 2026-10-23 |
| חוזר גמל 2002/11, דוח תשואות שנתי - הרחבה | CMA (MoF) | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1703/he/regulation_2002-11.pdf | primary (cancelled by 2003/13) | 2026-10-23 |
| חוזר גמל 2003/13, עדכון דוח תשואות (דוח 3) וביטול דוח הכנסות (דוח 4) | CMA (MoF) | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-2030/he/regulation_2003-13.pdf | primary (later status unknown) | 2026-10-23 |
| חוזר גופים מוסדיים 2017-9-15, דמי ניהול במכשירי החיסכון הפנסיוני - תיקון (discount periods; member-report averages referenced) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf | primary | 2026-10-23 |
| Draft 2014-21, דיווח לממונה על שיעורי דמי ניהול (fee calculator reporting, list rates for new members, not averages) | CMA | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-3076/he/regulation_th_2014-21.pdf | primary (draft) | 2026-10-23 |
| Maya, רשימת קרנות (list page, filter panel and the counts its filters return) | TASE | primary | https://maya.tase.co.il/he/funds/mutual-funds | 2026-10-24 |
| TASE, תנאי שימוש, מהדורת אוגוסט 2026 | TASE | primary | https://www.tase.co.il/he/content/about/terms_of_service | 2026-10-24 |
| Funder news items reproducing the 2014 and 2015 monthly-report circulars and the 2015 fee-reporting circular (used only to locate the gov.il originals) | Funder | https://www.funder.co.il/article/40455, /46598, /47853 | secondary | 2026-10-23 |
