# Bank product names (catalogue of every option, bank side)

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.10 (catalogue of every option, bank products), D2 (every product name a bank shows must be in the catalogue), section 2 success criterion 5, section 5 item 6a (`data/catalog/` seeded with each bank's deposit and savings-plan names), N6 (machine-readability of the directive-447 publication); roadmap release R4 (3.10 bank products; tariff and catalogue snapshots).
Scope: in: the names each bank in the BoI register that serves individuals uses on its site, in its directive-447 publication, in its standard contracts and (where public) its app, for shekel deposits, savings plans, current-account credit interest, fee tracks, child-savings products, and the names of FX and structured deposits (name only); per name, what it is in the wrapper model; names that look alike but differ; names that cannot be decoded from public sources; whether each bank's 447 publication is machine-readable. Out: the rules behind deposits, 447 and fee tracks (`bank-current-account-deposits.md` BANK-01 to BANK-29, not repeated here); FX and structured deposit terms (`fx-and-structured-deposits.md`); child-savings rules (`child-savings.md`); tax (`tax-interest-deposits-bonds.md`); rates and prices (data track, `data/`).

## Summary

No regulator keeps a catalogue of bank product names. Directive 447 makes every bank publish its deposit offer in one uniform table, but it is a display duty (branches, website, personal area, app, search tool); it says nothing about files, downloads or APIs (BPN-01). In practice Leumi, its Pepper app and Yahav publish the 447 table as a PDF (text layer confirmed for Pepper and Yahav); the other banks reached render it in the browser by script, and none publishes CSV, JSON or XLS of it (BPN-02). The only machine-readable per-bank rate source found is the BoI EDGE dataflow "דשבורד ריביות", monthly per bank, not per product (BPN-03).
Bank names are marketing names. The stable key is the bank's own product code where it shows one (Leumi "דגם", Mizrahi three-digit code, Mercantile product number); the 447 row gives the decodable attributes (BPN-04).
The same name means different products at different banks (אדיר, לביא/לביאה, חיסכון גמיש, ארבל, אופק) and sometimes two products at one bank (Hapoalim "עתיד מניב שקלי", Mercantile code 154) (BPN-05, look-alike table).
286 numbered names are catalogued below, from 10 bank brands (8 licensed banks plus Pepper and Otzar Hahayal). Discount, Bank of Jerusalem, One Zero and Esh Israel product names could not be read from public sources.

## Rules

### BPN-01 No regulator catalogue; directive 447 is a display duty, not a data feed (N6)
- Rule: Directive 447 requires a "פרסום מרוכז" of deposit and credit-balance rates in the Annex A wording and structure, shown at least in every branch and on the bank's website (public site and personal area) and in the app, plus a search tool (מנגנון חיפוש) on the website and app. The text sets display rules (percent, nominal annual, anchor and spread shown, one row per amount range, link to the BoI comparison, prominent and accessible). It contains no requirement for a downloadable file, a machine-readable format or an API.
- Conditions / exceptions: Annex A's first column is "סוג המוצר (לפי תקופה)", a period type, not a product name. Banks fill it with their own names (BPN-04). The rule content of 447 is in `bank-current-account-deposits.md` BANK-13, BANK-14.
- Figures: version 1, circular 2781, 20/5/2024 (the only version listed in the "עדכונים" table of the copy read).
- Source: [Directive 447 "פרסום שיעורי ריבית על פיקדונות ועל יתרות זכות בחשבון" (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf), s.4-8 and "עדכונים" table, pp.1-2 · checked 2026-10-22 · primary
- Dimensions: reporting-obligation, regulator
- Likely to change: yes: the Competition Authority's deposit directives (BANK-24) or a 447 update could add a data duty; none seen.

### BPN-02 How each bank actually publishes its 447 table
- Rule: As seen on 2026-10-22, the 447 publication is a script-rendered web page at Hapoalim, Discount, Mercantile, Mizrahi-Tefahot, First International and Otzar Hahayal, and a generated PDF at Leumi, Leumi's Pepper app and Yahav. No bank was seen publishing the table as CSV, JSON or spreadsheet. Massad's rate page was not opened. See the machine-readability table below for URLs and formats.
- Conditions / exceptions: Leumi also shows an HTML table whose text arrives with unfilled placeholders ("{asOfDate}", "{primeBaseRate}"), so the values are filled by script. Discount and Mercantile pages returned "המידע אינו זמין כעת" in place of the tables. Bank of Jerusalem (Radware) and One Zero (403) were not reachable.
- Figures: none.
- Source: per-bank page URLs are in the "Directive-447 publication: machine-readability per bank" table below · checked 2026-10-22 · institution
- Dimensions: reporting-obligation
- Likely to change: yes: page formats change without notice.

### BPN-03 BoI EDGE "דשבורד ריביות" is machine-readable per bank but not per product
- Rule: The BoI EDGE dataflow BOI.BankingSupervision/INTEREST_DASH ("דשבורד ריביות", description "D-823A", structure BOI.BankingSupervision:WEB 1.0) returns CSV through the SDMX API. Dimensions are SERIES_CODE, FREQ, REP_ENTITY (reporting bank), TIME_COLLECT and TIME_PERIOD. A query for the last observation returned monthly values for 2026-09 for reporting entities 4, 10, 11, 12, 17, 18, 20, 31, 46, 54, 12002 and 99010 (system total), in percent (PT) or ILS thousands.
- Conditions / exceptions: Series codes (for example "BNK_10001_LM_BIR_5718_IF") are not product names; their meaning sits in codelist CL_BNK_WEB (about 1 MB), which was not decoded (open question 16). Release 1 records that BoI publishes monthly comparative information on interest actually paid (BANK-22); whether this dataflow is that publication is not confirmed. It cannot decode a product name.
- Figures: latest period seen 2026-09.
- Source: [EDGE dataflow INTEREST_DASH](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/dataflow/BOI.BankingSupervision/INTEREST_DASH); [DSD WEB 1.0](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/datastructure/BOI.BankingSupervision/WEB/1.0); [data, lastNObservations=1, CSV](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/INTEREST_DASH/1.0?lastNObservations=1&format=csv) · checked 2026-10-22 · primary
- Dimensions: reporting-obligation
- Likely to change: unknown

### BPN-04 Where the decodable name and the stable key sit
- Rule: Banks put their own names inside the 447 table: Leumi and Pepper write "דגם NNN/N: <name>" in "סוג המוצר"; Yahav writes product names ("חסכון אודם לשנה", "חסכון נבו ברירה- מדד לשנה"); Mizrahi's table adds a column "שם הפיקדון" and shows "ריבית אפקטיבית" and "אפשרויות הפקדה". The stable key for the catalogue is the bank's own code where one is shown: Leumi "דגם" (for example 5071/5), Mizrahi's three-digit code in brackets (for example "פטל פריים שבועי (211)"), Mercantile's product number (for example 0660). Hapoalim, FIBI, Massad and Yahav show names without codes on public pages.
- Conditions / exceptions: The same code can carry two names (Mercantile 154 / 0154, look-alike table). Leumi's HTML rendering and its PDF may place some models in different sections; the PDF was used.
- Figures: none.
- Source: [Leumi 447 PDF](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/leumi), [Pepper 447 PDF](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/pepper), [Yahav board](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf) pp.6, 8, [Mizrahi deposit rates page](https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/), [Mercantile monthly deposits](https://www.mercantile.co.il/private/investments-savings/deposit-savings/monthly-deposit/) · checked 2026-10-22 · institution
- Dimensions: reporting-obligation
- Likely to change: yes

### BPN-05 A shared name does not mean a shared product
- Rule: Several names are used by more than one bank for products with different terms, and a few names are used twice inside one bank. The catalogue must key on bank plus name (plus code where shown), never on name alone. The cases found are in "Look-alike names" below.
- Conditions / exceptions: FIBI and Massad (same group) use the same names with the same one-line descriptions on some products; whether they are one product sold under two bank licences is not stated (open question 15).
- Figures: none.
- Source: each name's page URL is in its Catalogue row (see the "Look-alike names" table below) · checked 2026-10-22 · institution
- Dimensions: reporting-obligation
- Likely to change: yes

### BPN-06 Names that appear on statements but cannot be bought
- Rule: Leumi's 447 PDF has a section "שיעורי ריבית לפיקדונות מעוקלים / משועבדים /ללא תנועה בשקלים" with its own models (5065/0, 5066/8, 5430/3, 5630/5, 5724/6) and the note "מוצרים אלה אינם ניתנים להפקדה באופן יזום". Pepper's PDF links to the same information "עבור לקוחות פפר". These names can appear on a statement for seized, pledged or dormant money without the person having chosen them.
- Conditions / exceptions: Only Leumi was seen publishing such a section.
- Figures: none.
- Source: [Leumi 447 PDF](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/leumi), pp.74-78; [Pepper 447 PDF](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/pepper), p.4 · checked 2026-10-22 · institution
- Dimensions: liquidity-lockup, reporting-obligation
- Likely to change: no

### BPN-07 Channel-specific products and rates
- Rule: Some products can be opened only in one channel, and some carry a rate addition for digital deposit. Leumi's 447 PDF has a column "הטבת דיגיטל" (not in Annex A) and per-product notes such as "המוצר ניתן להפקדה באמצעות אפליקציה" or "באמצעות בנקאי"; Pepper products are "ניתן להפקדה באפליקציית פפר"; FIBI's "פיקדון עוז" and "פיקדון ארבל" and Massad's "פיקדון ארבל" are digital only; FIBI quotes "פיקדון לביא"'s rate "למפקידים בדיגיטל בלבד"; Massad gives a 0.3% addition for digital deposit in "פיקדון ארגמן"; Mercantile has a page "משתלם להפקיד בדיגיטל"; Hapoalim's "ספרינט" has a separate "ספרינט דיגיטלי" brochure.
- Conditions / exceptions: The same named product can therefore show two rates. The catalogue records the channel note where the source gives one.
- Figures: rates are data-track items.
- Source: Leumi and Pepper PDFs; [FIBI choice deposits](https://www.fibi.co.il/private/depositsandsavings/savingtypes/choicedeposits/); [FIBI deposits team](https://www.fibi.co.il/private/depositsandsavings/savingtypes/depositsteam/); [Massad Arbel](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/arbel/), [Massad Argaman](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/argaman/); [Mercantile deposits](https://www.mercantile.co.il/private/investments-savings/deposit-savings/) · checked 2026-10-22 · institution
- Dimensions: eligibility, minimum
- Likely to change: yes

### BPN-08 The date on the source differs from the date seen, and some pages are stale
- Rule: Every catalogue entry needs the date printed on the source as well as the date seen. Examples found on 2026-10-22: Yahav's board 13_26 is "בתוקף מיום 06/10/2026" but its 447 pages carry "24/09/2026 11_26"; Mercantile's "משתלם להפקיד בדיגיטל" page quotes prime 5.00% from 9.7.26 while Leumi and Yahav show prime 4.75% from 03.09.2026; Hapoalim's "פיקדון ספרינט דיגיטלי" brochure says "התנאים המופיעים בהסכם זה נכונים לספטמבר 2023"; FIBI's child-savings rate table is "מעודכן ליום: 26.02.23"; Leumi's 447 PDF says "הנתונים נכונים ליום: 23.10.2026" when read on 22.10.2026.
- Conditions / exceptions: none.
- Figures: none.
- Source: [Yahav board](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf) pp.1, 6; [Mercantile web deposits](https://www.mercantile.co.il/private/investments-savings/deposit-savings/web/); [Hapoalim Sprint digital](https://www.bankhapoalim.co.il/sites/default/files/media/sprynt_dygytly.pdf) p.2; [FIBI child table](https://www.fibi.co.il/media/cmsbfk0k/טבלת-ריביות.pdf) p.1; Leumi 447 PDF p.1 · checked 2026-10-22 · institution
- Dimensions: fee-change-over-time
- Likely to change: yes

### BPN-09 "Choice" and "dual-track" deposits: the alternatives differ by bank
- Rule: Banks sell deposits that pay the better of two or three alternatives at the end. The alternatives differ: fixed unlinked vs CPI-linked (Yahav "נבו ברירה מדד", FIBI "עוז", Hapoalim "WIN WIN", Mizrahi "קרמבולה", "פסיפלורה", "תות"); fixed vs variable prime-based (Yahav "נבו ברירה שקלי", FIBI and Massad "ארבל"); unlinked, CPI-linked or USD-linked (FIBI "תלתן"); USD-linked vs fixed (Leumi 265/9). What happens on early exit also differs: Mizrahi's "קרמבולה" and "פסיפלורה" repay early withdrawals CPI-linked with no interest and "ללא הבטחת קרן ההפקדה הנומינאלית"; Hapoalim's "WIN WIN" allows no withdrawal before maturity; Yahav's "חסכון נבו ברירה" rows show "אין אפשרות שבירה".
- Conditions / exceptions: In the wrapper model these are deposits with a "choice of best" attribute. Ones with an FX alternative are mapped to `fx-and-structured-deposits.md`.
- Figures: none.
- Source: [Yahav board](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf) pp.4, 8; [FIBI choice deposits](https://www.fibi.co.il/private/depositsandsavings/savingtypes/choicedeposits/); [Hapoalim WIN WIN contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/win_win_1832025.pdf) p.1; [Mizrahi Carambola](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/carambola-cd/), [Passiflora](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/passionfruit-cd/), [Strawberry](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/cd_strawberry/); Leumi 447 PDF p.36 · checked 2026-10-22 · institution
- Dimensions: real-vs-nominal, liquidity-lockup, protection, currency
- Likely to change: no

### BPN-10 Savings-plan names: what the contracts say about instalments
- Rule: Hapoalim's periodic-deposit plans set one rate table by withdrawal date that applies to all deposits since the plan start ("שיעורי הריבית ייקבעו בהתאם למועדי המשיכה מהתכנית ויחולו בגין כל ההפקדות שהופקדו החל ממועד תחילת תקופת החיסכון"), count exit points from the plan start, and allow only full withdrawal at an exit point ("לא ניתן לבצע משיכה חלקית של ההפקדות, אלא משיכת מלוא סכום החיסכון במועדים שנקבעו לכך בלבד"). So in these plans an instalment does not have its own lock-up.
- Conditions / exceptions: Seen in "חושבים קדימה", "חושבים קדימה צמוד", "שקלי לצעד הבא", "חיסכון צומח לעתיד". Other banks' plans were not read at contract level.
- Figures: none.
- Source: [הפועלים: תנאי התכנית חושבים קדימה](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/hwsbym_qdymh.pdf), p.1, s.1.3, 1.4 · checked 2026-10-25 · institution; [הפועלים: תנאי התכנית חושבים קדימה צמוד](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/mspty_hwsbym_qdymh_zmwd_03.04.24.pdf), p.1, s.1.4-1.6 · checked 2026-10-25 · institution; [הפועלים: תנאי התכנית שקלי לצעד הבא](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/sqly_lz_d_hb.pdf), p.1, s.1.3-1.5 · checked 2026-10-25 · institution; [הפועלים: תנאי התכנית חיסכון צומח לעתיד](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/saving_for_the_future.pdf), p.1, s.1.3-1.5 · checked 2026-10-25 · institution
- Dimensions: liquidity-lockup
- Likely to change: no

### BPN-11 Bank of Jerusalem and One Zero names (browser pass)
- Rule: Bank of Jerusalem's site uses "פיקדון דיגיטלי" (online deposit), "פרי" (a deposit product page), prime-linked deposits ("פריים") and "פק"מ" (short-term deposit, BANK-30), and offers deposits to customers of all banks without a current account. One Zero advertised "פיקדון 6%" for customers of all banks: up to NIS 100,000 at a 3% base annual rate plus a 3% benefit conditional on salary and card use in 9 of 12 months, for joiners to 31.10.26.
- Conditions / exceptions: Names from navigation and marketing; terms of "פרי" not read. One Zero's offer is a conditional promotion, not a standing product.
- Figures: as stated, 2026-10-22.
- Source: [Bank of Jerusalem, deposits](https://www.bankjerusalem.co.il/deposits-savings); [One Zero home page](https://www.onezerobank.com/) · checked 2026-10-22 · institution
- Dimensions: `rate-type-anchor`, `benefit-expiry`
- Likely to change: yes.

### BPN-12 Discount: names in its 447 tables
- Rule: Discount's consolidated table (data as of 22.10.26) lists generic deposits ("פקדון שבועי", "פקדון חודשי", "פקדון ל-3/6 חודשים", "פקדון לשנה", "פקדון לשנתיים", "פקדון ל-3 שנים"; fixed, variable as prime minus a margin, one CPI-linked) and 47 named products, including: פק"מ 14-29 יום; פצ"מ דולר (1-2, 2-6, 6-12 months, one year; USD-linked); חיסכון ליעד קצר; חיסכון ליעד ארוך (2 to 18 years); פח"ק פיקדון יומי עסקי; נזיל יומי ל-3 חודשים; נזיל שבועי ל-91 יום; 6 חודש קבועה / שנה קבועה / שנה משתנה "ללקוחות כל הבנקים"; פק"מ הכנסה שוטפת (1 and 3 years); פיקדון בריבית עולה לשנתיים; נזיל יומי לשנתיים; פק"מ משנה ומעלה; הו"ק נזיל חודשי / רבעוני / חצי שנתי / שנתי (5-year standing-order plans); גמיש רבעוני לשנה; FX deposits מט"ח 7-30 יום, מט"ח 1-12 חודשים, מט"ח משנה ומעלה, ריבית עולה ל-3 שנים USD / EUR.
- Conditions / exceptions: Columns: period, rate type, linkage, amount range (generic deposits from NIS 250), early-break option (with penalty), renewal, exit points and frequency, offered rate, common-deposit rate, currency, channel. Abbreviations פצ"מ, פח"ק and הו"ק are not expanded on the page.
- Figures: names only.
- Source: [Discount, פרסום מרוכז - שיעורי ריבית בפקדונות ויתרות זכות בחשבון](https://www.discountbank.co.il/private/savings-investments/deposits-savings/classic/interest-rate-tables/) · checked 2026-10-22 · institution
- Dimensions: `rate-type-anchor`, `liquidity-lockup`, `auto-renewal`
- Likely to change: yes.

### BPN-13 Mercantile: names in its 447 tables
- Rule: Mercantile's table (5 tables, 140 rows by amount tier from NIS 50 to 500,000) uses generic names with mixed spelling (פקדון/פיקדון לשבוע, פק"מ לחודש, פיקדון ל-3/6 חודשים, פיקדון לשנה, פקצ"מ לשנה, פיקדון לשנתיים, לשלוש שנים) and named products: פיקדון 14-29 יום; חיסכון ליעד קצר; פיקדון צמוד מט"ח; חודשי יומי; פר"ן עדיף; פיקדון הכנסה שוטפת; פק"מ תחנות; פח"ק פיקדון יומי; פקדון הכנסה חודשית; תשע גמיש; פק"מ לשנה תחנות רבעוניות / חודשיות; חיסכון ליעד; יומי שנתי; שנתי יומי בריבית משתנה; חיסכון ל-10 שנים; פק"מ מתעצם לשנתיים; חיסכון ליעד ארוך; פר"ן מתעצם לשנתיים; הו"ק ל-3 שנים; מתעצם לשלוש שנים; הו"ק נזיל חודשי / חצי שנתי / שנתי; נזיל חודשי / חצי שנתי / שנתי; פק"מ משנה ומעלה; חיסכון ל-18 שנה; FX: מט"ח 7-29 / 7-30 יום, מט"ח 1-12 and others.
- Conditions / exceptions: The same product type appears under two spellings ("פקדון"/"פיקדון"), so the catalogue must normalise them. פקצ"מ and פר"ן are not expanded.
- Figures: names only.
- Source: [Mercantile, שיעורי ריבית על פיקדונות ויתרות זכות](https://www.mercantile.co.il/private/investments-savings/deposit-savings/classic/interest-tables-new/) · checked 2026-10-22 · institution
- Dimensions: `rate-type-anchor`, `liquidity-lockup`
- Likely to change: yes.

## Proposed dimensions

- `channel-restriction`: a product or rate only available in one channel (app, digital, banker), BPN-07.
- `choice-of-best`: payout is the better of several alternatives, with its own early-exit rule, BPN-09.

## Catalogue

All entries seen on 2026-10-22. "Wrapper" is the D6 wrapper the name opens; for deposits the attributes are rate type (fixed / variable on prime), linkage, term, exit points, renewal, minimum or amount range, break option. "Source date" is the date printed on the source. Strength is `institution` for every entry (the bank's own page, table or contract). Rates are not recorded (data track). "Not stated" means the source read does not say.

### Leumi (bank 10)

Main source: Leumi 447 PDF "שיעורי הריבית על הפיקדונות ועל יתרות זכות בחשבון", 80 pages, "הנתונים נכונים ליום: 23.10.2026", prime 4.75% "החל מתאריך: 03.09.2026" ([L-447](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/leumi)). Amount ranges in the standard and additional sections are 1,000-99,999 / 100,000-249,999 / 250,000+ unless stated. Every row below shows "אין אפשרות שבירה". Pages 40-68 (foreign currency) were not read page by page.

Standard section ("שיעורי הריבית על סוגי הפיקדונות השקליים המקובלים ועל יתרות זכות בחשבון"):

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 1 | פיקדון יומי דגם 5071/5: פדיום פריים 2-90 יום | 5071/5 | Deposit; variable on prime; unlinked; exit points every day; no auto-renewal; channel banker, secure site, app | L-447 p.1 | 23.10.2026 |
| 2 | פיקדון שבועי דגם 5126/6: פק"מ פריים 7-13 ימים | 5126/6 | Deposit; variable on prime; unlinked; 7-13 days; no exits; no renewal | L-447 p.2 | 23.10.2026 |
| 3 | פיקדון שבועי דגם 5164/8: פק"מ קבוע 7-13 ימים | 5164/8 | Deposit; fixed; unlinked; 7-13 days; no exits; no renewal | L-447 p.3 | 23.10.2026 |
| 4 | פיקדון חודשי דגם 5166/4: פק"מ קבוע 30-59 יום | 5166/4 | Deposit; fixed; unlinked; 30-59 days; no exits | L-447 p.4 | 23.10.2026 |
| 5 | פיקדון חודשי דגם 5425/6: פק"מ פריים 30-59 ימים | 5425/6 | Deposit; variable on prime; unlinked; 30-59 days; no exits | L-447 p.5 | 23.10.2026 |
| 6 | פיקדון ל-3 חודשים דגם 5168/0: פק"מ קבוע 90-179 יום | 5168/0 | Deposit; fixed; unlinked; 90-179 days; no exits | L-447 p.6 | 23.10.2026 |
| 7 | פיקדון ל-3 חודשים דגם 5632/1: פק"מ פריים 90-179 ימים | 5632/1 | Deposit; variable on prime; unlinked; 90-179 days; no exits | L-447 p.7 | 23.10.2026 |
| 8 | פיקדון ל-6 חודשים דגם 5145/2: ריבית קבועה 180-269 ימים | 5145/2 | Deposit; fixed; unlinked; 180-269 days; no exits | L-447 p.8 | 23.10.2026 |
| 9 | פיקדון ל-6 חודשים דגם 5159/1: ריבית משתנה 180-269 ימים | 5159/1 | Deposit; variable on prime; unlinked; 180-269 days; no exits; banker or secure site only | L-447 p.9 | 23.10.2026 |
| 10 | פיקדון ל-6 חודשים דגם 104/0: 6 חודשים שקלי זמין חודשי | 104/0 | Deposit; fixed; unlinked; 6 months; exit points every month | L-447 p.10 | 23.10.2026 |
| 11 | פיקדון ל-6 חודשים דגם 163/6: חצי שנה פריים זמין חודשי | 163/6 | Deposit; variable on prime; unlinked; 6 months; exits every month | L-447 p.11 | 23.10.2026 |
| 12 | פיקדון ל-6 חודשים דגם 5173/7: חציוני זמין כל שבוע | 5173/7 | Deposit; variable on prime; unlinked; 6 months; exits every 7 days | L-447 p.12 | 23.10.2026 |
| 13 | פיקדון לשנה דגם 5421/4: פק"מ קבוע 365 יום | 5421/4 | Deposit; fixed; unlinked; 365 days; no exits | L-447 p.13 | 23.10.2026 |
| 14 | פיקדון לשנה דגם 5789/8: פק"מ פריים ל- 365 ימים | 5789/8 | Deposit; variable on prime; unlinked; 365 days; no exits | L-447 p.14 | 23.10.2026 |
| 15 | פיקדון לשנה דגם 216/2: פריים לשנה זמין כל רבעון | 216/2 | Deposit; variable on prime; unlinked; 1 year; exits every 3 months | L-447 p.15 | 23.10.2026 |
| 16 | פיקדון לשנה דגם 231/1: חסכון שקלי לשנה | 231/1 | Deposit; fixed; unlinked; 1 year; exits every 3 months | L-447 p.16 | 23.10.2026 |
| 17 | פיקדון לשנה דגם 401/0: חסכון צמוד למדד לשנה | 401/0 | Deposit; fixed; CPI-linked; 1 year; no exits | L-447 p.17 | 23.10.2026 |

Closed-system section ("שיעורי הריבית על סוגי פיקדונות השקליים המקובלים - ללקוחות כל הבנקים בפתיחת חשבון פקדון ללא עו"ש"; all fixed or prime as named, unlinked, no exits, no renewal; note "המוצר ניתן להפקדה באמצעות האתר השיווקי"; rules in BANK-21):

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 18 | פיקדון ל-90 ימים דגם 5502/4: פיקדון קבוע 90 ימים ללא חשבון עו"ש | 5502/4 | Closed-system deposit; fixed; 90 days | L-447 p.18 | 23.10.2026 |
| 19 | פיקדון ל-90 ימים דגם 5503/2: פיקדון פריים 90 ימים ללא חושבון עו"ש (spelling "חושבון" as printed) | 5503/2 | Closed-system deposit; variable on prime; 90 days | L-447 p.19 | 23.10.2026 |
| 20 | פיקדון ל-180 ימים דגם 5504/0: פיקדון קבוע 180 ימים ללא חשבון עו"ש | 5504/0 | Closed-system; fixed; 180 days | L-447 p.20 | 23.10.2026 |
| 21 | פיקדון ל-180 ימים דגם 5505/8: פיקדון פריים 180 ימים ללא חשבון עו"ש | 5505/8 | Closed-system; prime; 180 days | L-447 p.21 | 23.10.2026 |
| 22 | פיקדון ל-270 ימים דגם 5508/2: פיקדון פריים 270 ימים ללא חשבון עו"ש | 5508/2 | Closed-system; prime; 270 days | L-447 p.22 | 23.10.2026 |
| 23 | פיקדון ל-270 ימים דגם 5509/0: פיקדון קבוע 270 ימים ללא חשבון עו"ש | 5509/0 | Closed-system; fixed; 270 days | L-447 p.23 | 23.10.2026 |
| 24 | פיקדון ל-365 ימים דגם 5506/6: פיקדון קבוע 365 ימים ללא חשבון עו"ש | 5506/6 | Closed-system; fixed; 365 days | L-447 p.24 | 23.10.2026 |
| 25 | פיקדון ל-365 ימים דגם 5507/4: פיקדון פריים 365 ימים ללא חשבון עו"ש | 5507/4 | Closed-system; prime; 365 days | L-447 p.25 | 23.10.2026 |
| 26 | פיקדון ללא חשבון עו"ש | - | Site page name for the closed-system deposits 18-25 | [Leumi savings](https://www.leumi.co.il/he/savings) | not dated |

Additional section ("שיעורי ריבית על סוגי פיקדונות נוספים" / "שיעורי הריבית לפיקדונות בשקלים"):

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 27 | פיקדון ל- 14-29 ימים דגם 5165/6: פק"מ קבוע 14-29 יום | 5165/6 | Deposit; fixed; unlinked; 14-29 days; no exits; banker only | L-447 p.26 | 23.10.2026 |
| 28 | פיקדון ל- 14-29 ימים דגם 5232/7: פק"מ פריים 14-29 ימים | 5232/7 | Deposit; prime; unlinked; 14-29 days | L-447 p.27 | 23.10.2026 |
| 29 | פיקדון ל- 60-89 ימים דגם 5167/2: פקמ קבוע 60-89 יום | 5167/2 | Deposit; fixed; unlinked; 60-89 days | L-447 p.28 | 23.10.2026 |
| 30 | פיקדון ל- 60-89 ימים דגם 5526/0: פק"מ פריים 60-89 ימים | 5526/0 | Deposit; prime; unlinked; 60-89 days | L-447 p.29 | 23.10.2026 |
| 31 | פיקדון ל- 270-330 ימים דגם 5146/0: ריבית קבועה 270-330 ימים | 5146/0 | Deposit; fixed; unlinked; 270-330 days | L-447 p.30 | 23.10.2026 |
| 32 | פיקדון ל- 270-330 ימים דגם 5160/6: ריבית משתנה 270-330 ימים | 5160/6 | Deposit; prime; unlinked; 270-330 days | L-447 p.31 | 23.10.2026 |
| 33 | פיקדון לשנה דגם 127/1: פריים שנתי בטאצ' | 127/1 | App savings ("חיסכון בטאצ'"); prime; unlinked; 1 year; range 10-5,000; exits "בתום 6 חודשים, וכל חודש לאחר מכן"; app only | L-447 p.32 | 23.10.2026 |
| 34 | פיקדון לשנה דגם 266/7: פיקדון אוטומטי | 266/7 | Deposit; prime; unlinked; 1 year; range 10-200,000; exits every day; app only | L-447 p.32 | 23.10.2026 |
| 35 | פיקדון ל-3 שנים דגם 503/3: תשלומים שקלי ל- 3 שנים | 503/3 | Deposit (name suggests instalments; not stated); fixed; unlinked; 3 years; range 100-10,000; no exits | L-447 p.33 | 23.10.2026 |
| 36 | פיקדון ל-3 שנים דגם 504/1: תשלומים פריים ל- 3 שנים | 504/1 | Deposit; prime; unlinked; 3 years; range 100-10,000; exits after 6 months then every 3 months | L-447 p.33 | 23.10.2026 |
| 37 | פיקדון ל-4 שנים דגם 147/9: 4 שנים שקלי זמין כל שנה | 147/9 | Deposit; fixed; unlinked; 4 years; exits every year | L-447 p.34 | 23.10.2026 |
| 38 | פיקדון ל-5 שנים דגם 506/6: תשלומים שקלי ל-5 שנים | 506/6 | Deposit; fixed; unlinked; 5 years; range 100-10,000; no exits | L-447 p.34 | 23.10.2026 |
| 39 | פיקדון ל-15 שנים דגם 508/2: תשלומים צמוד מדד 15 שנים | 508/2 | Deposit; fixed; CPI-linked; 15 years; range 100-10,000; exits "בתום 12 ו- 13 שנים" | L-447 p.35 | 23.10.2026 |
| 40 | פיקדון לשנה דגם 265/9: ברירה צמוד דולר-שקל לשנה | 265/9 | Better of USD linkage or fixed rate; from 1,000. Map to `fx-and-structured-deposits.md` | L-447 p.36 | 23.10.2026 |

Statement-only section ("שיעורי ריבית לפיקדונות מעוקלים / משועבדים /ללא תנועה בשקלים"; "מוצרים אלה אינם ניתנים להפקדה באופן יזום", BPN-06):

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 41 | פיקדון ל- 2-365 ימים דגם 5065/0: פדיום מעוקל ריבית משתנה | 5065/0 | Deposit holding seized money; prime; exits every day; from 2 | L-447 p.74 | 23.10.2026 |
| 42 | פיקדון ל- 2-30 ימים דגם 5066/8: פידיום קבוע משועבד | 5066/8 | Deposit holding pledged money; fixed; exits every day | L-447 p.75 | 23.10.2026 |
| 43 | פיקדון ל-30 ימים דגם 5430/3: פק"מ חדש/חסכון לל"ת מתחדש | 5430/3 | Renewing fixed 30-day deposit for dormant money (expansion of "לל"ת" not stated; the heading says "ללא תנועה") | L-447 p.76 | 23.10.2026 |
| 44 | פיקדון ל-180 ימים דגם 5630/5: פק"מ חדש/עו"ש לל"ת מתחדש | 5630/5 | Renewing fixed 180-day deposit for dormant money | L-447 p.77 | 23.10.2026 |
| 45 | פיקדון ל-180 ימים דגם 5724/6: פיקדון לל"ת מני"ע | 5724/6 | Fixed 180 days, range 1,000-5,000; "מני"ע" not decodable from public sources | L-447 p.78 | 23.10.2026 |

Other Leumi names:

| # | Name exactly as shown | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|
| 46 | חיסכון בטאצ' | App savings = model 127/1 above; 10 to 5,000 NIS a day, several deposits a day, app only, 1 year, prime minus spread, exits from six months then monthly, one per customer number, same-day cancellation of daily deposits | [Leumi touch savings](https://www.leumi.co.il/he/savings/saving_by_touch) | not dated |
| 47 | יתרת זכות בחשבון: "הריבית תשולם על יתרה של עד 10,000₪ ללקוחות זכאים" | Current-account credit interest; fixed; on balance up to NIS 10,000; for private customers whose salary or pension is paid in by clearing integration (one or two salaries) and who hold at least one of: Leumi mortgage charged to the account, credit-card charges of at least NIS 7,000 a month, a Leumi securities account; credited quarterly; automatic; "ריבית זו אינה חלה על לקוחות פפר" | L-447 pp.79-80 | 23.10.2026 |
| 48 | לאומי Digital | Fee track = basic track (מסלול בסיסי), BANK-17 | [Leumi fee tracks](https://www.leumi.co.il/he/commission-rate-tracks) | not dated |
| 49 | לאומי Digital Plus | Fee track = extended track (מסלול מורחב) | same | not dated |
| 50 | Total Digital | Mentioned only in the fee-track page disclaimer; not decodable from public sources | same | not dated |
| 51 | חיסכון לכל ילד בלאומי | Child savings, bank option (`child-savings.md` CS-10) | [Leumi kids savings](https://www.leumi.co.il/he/savings/savings-for-your-kids) | not dated |
| 52 | חיסכון לכל ילד (לילדים בגילאים 0-18) ללא אפשרות להחלפת מסלול | Child savings bank track family without exit stations; columns "ריבית קבועה (לא צמודה)", "ריבית קבועה (צמודה למדד מחירים לצרכן)", "ריבית משתנה על בסיס הפריים (p)" | [Leumi child rate sheet "עלון ריביות "חיסכון לכל ילד""](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/General/forms/interest_rate_sheet.pdf) | rates from 9.07.2026 |
| 53 | חיסכון לכל ילד (לילדים בגילאים 0-18) עם תחנות יציאה להחלפת מסלול כל 5 שנים | Child savings bank track family with exit stations every 5 years; same three rate types | same | 9.07.2026 |
| 54 | חיסכון לכל ילד- חסכונות המשך (לילדים בגילאים 18-21) | Continuation savings from 18 to 21; periods חודש / שנה / שנתיים / שלוש שנים; same three rate types; "החיסכון יפרע בגיל 21" | same | 9.07.2026 |
| 55 | פיקדון ל<period> תושב ישראל / פיקדון ל<period> תושב חוץ (for example "פיקדון לשבוע תושב ישראל", "פיקדון ל- 24 חודשים תושב חוץ"), currencies דולר ארה"ב, אירו, לירה שטרלינג | FX deposits by residency; fixed; unlinked; no exits; from 500. Map to `fx-and-structured-deposits.md` | L-447 pp.37-39, 69-72 | 23.10.2026 |

### Pepper (Leumi digital app; Leumi licence)

Source: "PEPPER." 447 PDF hosted on leumi.co.il, "הנתונים נכונים ליום: 23.10.2026" ([P-447](https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/pepper)). Every row: "המוצר ניתן להפקדה באפליקציית פפר", unlinked, "אין אפשרות שבירה", no auto-renewal. Pepper is not in the BoI register as a separate entity; the PDF refers to "לאומי ... עבור לקוחות פפר".

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 56 | פיקדון לשנה דגם :157/8 WOW | 157/8 | Deposit; fixed; 1 year; no exits; tiers 1,000-49,999 / 50,000-149,999 / 150,000-1,000,000 | P-447 p.1 | 23.10.2026 |
| 57 | פיקדון לשנה דגם :681/7 DIY | 681/7 | Deposit; variable on prime; 1 year; exits every day; from 1 | P-447 p.1 | 23.10.2026 |
| 58 | פיקדון לשנה דגם :685/8 HOME | 685/8 | Deposit; variable on prime; 1 year; exits every day; 150,000-10,000,000 | P-447 p.2 | 23.10.2026 |
| 59 | פיקדון לשנה דגם :686/6 FLEX | 686/6 | Deposit; fixed; 1 year; exits every month; tiers 1,000 to 1,000,000 | P-447 p.3 | 23.10.2026 |
| 60 | פיקדון ל3- שנים דגם :689/0 GROW | 689/0 | Deposit; variable on prime; 3 years; exits after 6 months then every 3 months; 100-10,000 | P-447 p.3 | 23.10.2026 |

### Hapoalim (bank 12)

Sources: rate page listing "ספרינט דיגיטלי", "ריבית קבועה", "פריים", "חיסכון גמיש", "פר"י", "7 וקליק" ([H-rates](https://www.bankhapoalim.co.il/he/savings/product-of-the-month/interest-rates)); standard-contracts page ([H-SC](https://www.bankhapoalim.co.il/standard-contract)), whose shekel-deposit and savings-plan links were opened one by one (page 1 read unless stated). Contracts leave rates, periods and minimums blank ("____"); the contract wording gives the structure.

| # | Name exactly as shown | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|
| 61 | פיקדון ספרינט דיגיטלי | Deposit; "פיקדון שקלי לתקופה של כ-12 ח' בריבית שקלית קבועה"; unlinked; exit points monthly from end of first month (11 dates); withdrawal at an exit point earns 70% of accrued interest; minimum NIS 1,000 | [brochure](https://www.bankhapoalim.co.il/sites/default/files/media/sprynt_dygytly.pdf) pp.1-2 | "נכונים לספטמבר 2023" |
| 62 | ספרינט | Contract for the same product family; listed on H-SC, not opened; not decodable beyond row 61 | [H-SC link](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/sprynt.pdf) | - |
| 63 | פיקדון ריבית יומית – פר"י | Deposit; variable, prime minus fixed spread (bank-defined prime); unlinked; withdraw all or part any business day; add any business day; minimum NIS 100; not renewed unless the transaction details say so | [contract 2024](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/standard-contract/2pr_y.pdf) p.1; [contract 2022](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/peri_13042022.pdf) pp.1-2 | PDF metadata 8.5.2024; 13.4.2022 |
| 64 | פיקדון ריבית יומית – 7 וקליק | Deposit; prime minus fixed spread; unlinked; no withdrawal in first 7 calendar days, then any business day ("תחנת יציאה"); no additions; minimum NIS 100; no renewal unless stated; cannot be transferred or pledged | [contract](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/standard-contract/deposit_7_and_click.pdf) pp.1-3 | PDF metadata 28.1.2026 |
| 65 | פיקדון פריים – פיקדון בריבית משתנה (list name "פריים פיקדון בריבית משתנה") | Deposit; prime minus fixed spread; unlinked; 7 to 730 days chosen by customer; 7-90 days auto-renews up to a maximum of 182 days then returns to current account; 91-730 days does not renew; additions and partial withdrawal at renewal dates; minimum NIS 100 | [brochure](https://www.bankhapoalim.co.il/sites/default/files/media/prm.pdf) p.1 | not dated |
| 66 | פיקדון בריבית קבועה | Deposit; fixed, paid at maturity; unlinked; one-off; no withdrawal before maturity (bank may agree to a break at a cost) | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/ligal_deposit_contract_311223_ribit_kvua.pdf) p.1 | file name 31.12.23 |
| 67 | פיקדון מטרה | Page 1 wording matches row 66 (fixed, unlinked, one-off, no early withdrawal); what makes it a "goal" deposit is not decodable from the page read | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/hskm_mspty_ngys_pyqdwn_mtrh_19.06.23.pdf) p.1 | 19.06.23 |
| 68 | חיסכון גמיש ("הסכם משפטי - חיסכון גמיש") | Savings plan; monthly deposit by standing order plus occasional deposits ("הפקדות מזדמנות"); unlinked; partial withdrawal at "תקופה/תחנה" dates in the transaction details; rate type not on page 1 | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/hyskwn_gmys.pdf) p.1 | PDF metadata 7.5.2024 |
| 69 | פיקדון צעד ראשון - פיקדון בריבית משתנה | Deposit; prime minus fixed spread; unlinked; partial withdrawals and additions at "תקופה/תחנה" dates; total deposits capped at NIS 25,000 | [contract](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/standard-contract/first_step_variable_intrest_deposit.pdf) p.1 | PDF metadata 26.2.2026 |
| 70 | צעד ראשון לחיסכון | Promotion page for row 69: NIS 500 bank grant deposited 5.3.2026 into "פיקדון לשנתיים", variable (prime minus 2% as of 01.03.2026), monthly exit points, ceiling NIS 25,000; eligibility includes accounts that received child allowance in Q4 2025 and other activity tests | [first-step page](https://www.bankhapoalim.co.il/savings/first-step/) | 2026 |
| 71 | WIN WIN | Choice deposit (BPN-09): track A fixed overall rate unlinked, track B principal plus CPI linkage differentials with no interest; customer gets the higher gross; one-off; no withdrawal before maturity | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/win_win_1832025.pdf) p.1 | PDF metadata 16.3.2025 |
| 72 | חיסכון זמין רבעוני עולה (list) / "זמין רבעוני עולה" (contract) | Deposit; one-off; unlinked; rate rising by quarter, compounded quarterly; 4 quarterly rates listed; exit points at the end of each quarter; withdrawal before end of first quarter not allowed | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/zmyn_rb_wny_wlh.pdf) p.1 | PDF metadata 12.3.2024 |
| 73 | זמין רבעוני 15 חודשים | As row 72 with 5 quarterly rates | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/deposit_15_months.pdf) p.1 | PDF metadata 28.1.2026 |
| 74 | חיסכון זמין פלוס (list) / "זמין פלוס" (contract) | Deposit; one-off; unlinked; rising quarterly rate, 8 quarters listed; exit points at end of year 1 and every quarter after; no withdrawal in first year | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/ZAMINPLUS_02_06_24.pdf) p.1 | 02.06.24 |
| 75 | שקלי לכל עת | Deposit; one-off; unlinked; overall compound rate at maturity; no fixed withdrawal dates; withdrawal allowed after a set number of months at a reduced share of the rate, partial allowed | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/shikli_2432025.pdf) p.1 | file name 24.3.2025 |
| 76 | מדדי לכל עת | Deposit; CPI-linked; no fixed withdrawal dates; early withdrawal after a set number of months with a stated share of linkage and interest; if CPI falls below the base index, the base index is used | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/madadi_2432025.pdf) p.1 | file name 24.3.2025 |
| 77 | חיסכון מדדי | Deposit; one-off; CPI-linked principal and interest at a fixed real rate; no withdrawal before maturity; principal at least the deposit (CPI floor) | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/madadi_1832025.pdf) p.1 | PDF metadata 17.3.2025 |
| 78 | חיסכון משלם שקלי (list: "משלם שקלי") | Deposit paying out: unlinked; principal and interest returned as periodic payments to the current account (monthly, 3, 6 or 12 months; "שיטת שפיצר"); no fixed withdrawal dates; no partial withdrawal; early exit only after a set number of years, with a deduction | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/mslm_sqly.pdf) p.1 | PDF metadata 16.1.2024 |
| 79 | חיסכון מנצח | Deposit; one-off; unlinked; fixed overall compound rate; no withdrawal dates; no early withdrawal | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/winning_save_april_25.pdf) p.1 | April 2025 |
| 80 | עתיד מניב שקלי (list: "עתיד מניב שקלי 60 חודשים") | Income deposit: unlinked; interest only, paid every month, 3, 6 or 12 months; no exit points; early exit after a set number of years with a deduction; part of "תכניות החיסכון להכנסה שוטפת" | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/_tyd_mnyb_sqly_60_hwdsym.pdf) p.1 | PDF metadata 24.1.2024 |
| 81 | עתיד מניב שקלי (list: "עתיד מניב לשנתיים") | Income deposit: unlinked; interest only at a fixed periodic rate paid per chosen frequency; no withdrawal before maturity | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/atid_meniv_for2y_021125.pdf) p.1 | file name 02.11.25 |
| 82 | חושבים קדימה | Savings plan; unlinked; regular monthly deposits with min and max; rate by withdrawal year (6 rows); first exit point after a set number of years then yearly; full withdrawal only (BPN-10) | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/hwsbym_qdymh.pdf) p.1 | PDF metadata 7.2.2024 |
| 83 | חושבים קדימה צמוד | Savings plan; CPI-linked; 15 years; monthly deposits; exits at end of year 10 then yearly; no withdrawal in first 5 years; years 5-10 principal plus linkage only; years 10+ before exit point principal plus linkage plus 50% of the rate | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/mspty_hwsbym_qdymh_zmwd_03.04.24.pdf) p.1 | 03.04.24 |
| 84 | שקלי לצעד הבא | Savings plan; unlinked; monthly deposits; rate by withdrawal year (4 rows); exits after a set number of years; full withdrawal only | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/%D7%90%D7%97%D7%95%D7%96%D7%99%D7%9D%20%D7%90%D7%97%D7%99%D7%93%D7%99%D7%9D/sqly_lz_d_hb.pdf) p.1 | PDF metadata 6.2.2024 |
| 85 | חיסכון צומח לעתיד | Savings plan; unlinked; first deposit at opening then standing order; rate by withdrawal year (3 rows); exits after a set number of months | [contract](https://www.bankhapoalim.co.il/api/media/PDFS/standard-contract/saving_for_the_future.pdf) p.1 | PDF metadata 22.2.2026 |
| 86 | פיקדון ללקוחות כל הבנקים | Closed-system deposit (BANK-21); private customers over 16 with no Hapoalim account; minimum NIS 1,000; online; deposit types not named on the page | [page](https://www.bankhapoalim.co.il/he/savings/deposit-for-all-customers) | not dated |
| 87 | חיסכון לכל ילד בבנק הפועלים | Child savings, bank option; the page says six plans, three described with track switching: fixed unlinked, fixed CPI-linked, variable (`child-savings.md`) | [kids page](https://www.bankhapoalim.co.il/he/savings/saving-plan-for-each-child) | not dated |
| 88 | חיסכון לכל ילד – קבועה לא צמודה עם מעבר מסלול | Child savings track: "מסלול ריבית שקלית קבועה לא צמודה עם אפשרות מעבר מסלול", exit date every 5 years | [contract](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/kvoaaemmaavar.pdf) pp.1-2 | PDF metadata 29.11.2016 |
| 89 | מסלול פועלים בסיסי (פ) | Fee track named basic; "(פ)" not explained | [fee-list](https://www.bankhapoalim.co.il/forms/he/fee-list) | not dated |
| 90 | מסלול פועלים מורחב | Fee track named extended | same | not dated |
| 91 | פיקדון לזמן ארוך; פיקדון קצוב בחודשים; פיקדון קצוב בימים; פיקדון BURN RATE (under "פיקדונות מט"ח") | FX deposits; map to `fx-and-structured-deposits.md` | [H-SC](https://www.bankhapoalim.co.il/standard-contract) | not opened |
| 92 | אפיק השקעה סולדי; פיקדונות לתקופות זמן שונות | Marketing phrases on the savings page, not products | [savings page](https://www.bankhapoalim.co.il/he/savings) | not dated |
| 93 | עו"ש מקזז ("מידע על עו"ש מקזז") | Named on the standard-contracts page; product page /he/savings/offset-account returned 404; not decodable from public sources | H-SC | - |

### Discount (bank 11)

Discount's deposit names were not readable: the "מוצרי שוק הכסף" page renders its tables by script and returned "המידע אינו זמין כעת" ([D-447](https://www.discountbank.co.il/private/savings-investments/savings-interest/)); the explanation page names no products ([D-explain](https://www.discountbank.co.il/private/savings-investments/savings-and-investment-products-explanation/)). Labels seen:

| # | Name exactly as shown | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|
| 94 | פיקדון חד פעמי / פיקדון בהוראת קבע | Filter labels: one-off deposit / standing-order savings | D-447 | not dated |
| 95 | פקדונות שקליים מקובלים / פקדונות נוספים - שקלי / פקדונות נוספים – מט"ח | 447 section headings (standard / additional shekel / additional FX) | D-447 | not dated |
| 96 | מסלול העמלות הבסיסי | Fee track = basic | [D-tariff](https://www.discountbank.co.il/private/general-information/charges-tariff/) | not dated |
| 97 | מסלול בסיסי בפיקוח / מסלול מורחב | Fee tracks in "תנאי מסלולי עמלות בחשבון עו"ש- לקוח יחיד/עסק קטן", form 01-312 | [form 01-312](https://www.discountbank.co.il/media/uovfz0dk/01-312-2.pdf) | "הודפס בתאריך 12.2015" (may be outdated) |

### Mercantile Discount (bank 17)

| # | Name exactly as shown | Code | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|---|
| 98 | פיקדון לשלושה חודשים בריבית קבועה ללקוחות כל הבנקים | - | Closed-system deposit; fixed; 3 months; no exits; minimum NIS 250; no renewal; money returns to source account | [M-noaccount](https://www.mercantile.co.il/private/investments-savings/deposit-savings/deposits-without-account/) | rates from 3.9.26 |
| 99 | פיקדון לשנה בריבית קבועה ללקוחות כל הבנקים | - | Closed-system; fixed; 1 year; no exits; minimum 250 | same | 3.9.26 |
| 100 | פיקדון לשנה בריבית משתנה ללקוחות כל הבנקים | - | Closed-system; rate quoted "p-2.7%"; the page's description says "פיקדון שקלי בריבית קבועה" (conflict, open question 11); 1 year; minimum 250 | same | 3.9.26 |
| 101 | פק"מ 7-13 ימים (rendered "פ"ק"מ" in one place) | 119 | Deposit; fixed (section "פקדונות שיקליים בריבית קבועה"); 7-13 days; minimum 50; via Telebank | [M-direct](https://www.mercantile.co.il/private/investments-savings/deposit-savings/fixed-interest-deposits/) | not dated |
| 102 | פק"מ 14-29 ימים | 118 | Fixed; 14-29 days; minimum 50 | M-direct | not dated |
| 103 | פק"מ 1-3 חודשים | 123 | Fixed; 1-3 months; minimum 50 | M-direct | not dated |
| 104 | פק"מ 3-12 חודשים | 124 | Fixed; 3-12 months; minimum 50 | M-direct | not dated |
| 105 | פק"מ 12 חודשים | 154 | Fixed; 12 months; minimum 50 | M-direct | not dated |
| 106 | פיקדון מודולרי | 140 | Fixed, rate set per year, valued "באופן ממוצע" at exits and maturity; 3 years; exit every year; minimum NIS 50,000 | M-direct | not dated |
| 107 | נזיל חודשי ל 5 שנים | 0113 | Fixed; 5 years; exits every month; minimum 250 | M-direct | not dated |
| 108 | נזיל חצי שנתי | 0156 | Fixed; 5 years; exits every half year; minimum 250 | M-direct | not dated |
| 109 | "פיקדון ליעד" - עד 24 חודשים ללא תחנות יציאה | 0660 | Monthly-deposit savings; fixed; unlinked; up to 24 months; no exits; NIS 50-30,000 a month; site or app | [M-monthly](https://www.mercantile.co.il/private/investments-savings/deposit-savings/monthly-deposit/) | not dated |
| 110 | "פיקדון ליעד" - עד 180 חודשים ללא תחנות יציאה | 0669 | Same, up to 180 months | M-monthly | not dated |
| 111 | פיקדון הוראות קבע ל 3 שנים | 0662 | Monthly savings; variable; unlinked; 3 years; exits monthly from 3 months after deposit | M-monthly | not dated |
| 112 | פיקדון נזיל חודשי ל 5 שנים (menu: "פיקדון נזיל ל5 שנים") | 0626 | Monthly savings; fixed; 5 years; exit wording ambiguous (yearly, then monthly) | M-monthly | not dated |
| 113 | פיקדון נזיל חצי שנתי ל 5 שנים | 0627 | Monthly savings; fixed; 5 years; exits every half year | M-monthly | not dated |
| 114 | פיקדון נזיל שנתי ל- 5 שנים | 0628 | Monthly savings; fixed; 5 years; exits yearly | M-monthly | not dated |
| 115 | פיקדון חיסכון ל 10 שנים | 0632 | Monthly savings; fixed; 10 years; exits yearly after 2 years | M-monthly | not dated |
| 116 | פיקדון חיסכון ל 18 שנים (216 חודשים) | 0670 | Monthly savings; fixed; CPI-linked or unlinked chosen at setup; exits after 12 and 13 years; NIS 50-250 a month | M-monthly | not dated |
| 117 | פיקדון לשנה בריבית משתנה | 0272 | Promotion deposit; variable; 1 year; no exits; minimum NIS 50 | [M-promo](https://www.mercantile.co.il/private/investments-savings/deposit-savings/ten-months-deposits/) | not dated |
| 118 | פיקדון לשנה בריבית קבועה | 0154 | Promotion deposit; fixed; 1 year; no exits; minimum NIS 50 (same number as row 105) | M-promo | not dated |
| 119 | פיקדון לשנה צמוד למדד המחירים לצרכן | 0816 | Promotion deposit; CPI-linked; 1 year; no exits; minimum NIS 10,000 | M-promo | not dated |
| 120 | פקדונות לטווח קצר המומלצים להפקדה באתר האינטרנט | 0118, 0119, 0123, 0124 | Web-only versions of rows 101-104 with a web rate benefit | [M-web](https://www.mercantile.co.il/private/investments-savings/deposit-savings/web/) | rates from 9.7.26 (stale prime, BPN-08) |
| 121 | פיקדונות במבצע / משתלם להפקיד בדיגיטל / פיקדונות חיסכון בהפקדות חודשיות / פיקדונות להפקדה ישירה / פיקדונות ללקוחות כל הבנקים | - | Page titles for rows 117-119, 120, 109-116, 101-108, 98-100 | [M-deposits](https://www.mercantile.co.il/private/investments-savings/deposit-savings/) | not dated |
| 122 | מסלול העמלות הבסיסי | - | Fee track = basic | [M-tariff](https://www.mercantile.co.il/private/generalinfo/price-list-fees-tracks/) | not dated |
| 123 | מרכנתיל פלוס | - | Seen on the money-market page; not decodable from the page read | [M-447](https://www.mercantile.co.il/private/investments-savings/savings-interest/) | - |

### Mizrahi-Tefahot (bank 20)

Mizrahi names deposit families after fruit and shows a three-digit code per product. Sources: deposits page ([Z-main](https://www.mizrahi-tefahot.co.il/saving-accounts/)), families page ([Z-all](https://www.mizrahi-tefahot.co.il/saving-accounts/cd-all/)), family pages as linked. No family page gives exit points or minimums unless stated; "אין הבטחת קרן" is stated for every FX-linked line.

| # | Name exactly as shown | Code(s) | Wrapper and terms | Seen at |
|---|---|---|---|---|
| 124-126 | פטל קבועה חודשי / פטל קבועה חודשיים / פטל קבועה 45 יום | 121, 122, 145 | Deposit; fixed; unlinked; 1-2 months; "קיימת אפשרות לחידוש אוטומטי" (family-level) | [Z-raspberry](https://www.mizrahi-tefahot.co.il/saving-accounts/raspberry-cd/) |
| 127-132 | פטל פריים שבועי / פטל פריים 2 שבועות / פטל פריים 3 שבועות / פטל פריים חודשי / פטל פריים חודשיים / פטל פריים 45 יום | 211, 212, 213, 221, 222, 245 | Deposit; variable on prime, fixed spread; 1 week to 2 months | Z-raspberry |
| 133-134 | פטל צמוד דולר 1 חודש / פטל צמוד דולר חודשיים | 511, 512 | Shekel deposit linked to FX; map to `fx-and-structured-deposits.md` | Z-raspberry |
| 135-140 | אפרסמון קבועה 3 חודשים / 5-4 חודשים / 6 חודשים / 8-7 חודשים / 9 חודשים / 12-10 חודשים | 123, 124, 126, 127, 129, 110 | Deposit; fixed; unlinked; 3-12 months | [Z-persimmon](https://www.mizrahi-tefahot.co.il/saving-accounts/persimmon-cd/) |
| 141-146 | אפרסמון פריים 3 חודשים / 5-4 חודשים / 6 חודשים / 8-7 חודשים / 9 חודשים / 10 חודשים | 223, 224, 226, 227, 229, 210 | Deposit; variable on prime | Z-persimmon |
| 147-162 | אפרסמון צ. דולר (6 codes), אפרסמון צ. ליש"ט / אפרסמון צמוד ליש"ט (6 codes), אפרסמון צ. אירו (4 codes) | 513, 524, 526, 527, 529, 531; 636, 624, 626, 627, 629, 631; 606, 607, 609, 611 | FX-linked shekel deposits; map to FXD | Z-persimmon |
| 163-165 | רימונים יומי פריים לשנה / רימונים חודשי פריים לשנה / רימונים רבעוני פריים לשנתיים | 287, 256, 259 | Deposit; variable on prime; 1-2 years; "נזילות גבוהה" (exit frequency implied by name, not stated) | [Z-pomegranate](https://www.mizrahi-tefahot.co.il/saving-accounts/pomegranate-cd/) |
| 166 | רימונים צמוד דולר לשנתיים | 547 | FX-linked; map to FXD | Z-pomegranate |
| 167 | פיקדון רימונים עד שקונים | link cd-256 | Headline product: 1 year, unlinked, monthly withdrawal, minimum 50,000 per Z-main; appears to be code 256 (inferred from URL, open question 14) | Z-main |
| 168 | פיקדון עד שצריך | link cd-259 | Headline product: 2 years, unlinked, every 3 months, minimum 2,000 per Z-main; appears to be code 259 (inferred from URL) | Z-main |
| 169-173 | ליצ'י קבועה שנה / ליצ'י קבועה 2 שנים / ליצ'י קבועה 4 שנים / ליצ'י קבועה 5 שנים / ליצ'י קבועה 6 שנים | 189, 176, 178, 174, 175 | Deposit; fixed; unlinked; withdrawal during the term allowed (timing not stated on family page) | [Z-lychee](https://www.mizrahi-tefahot.co.il/saving-accounts/lychee-cd/) |
| 174-175 | ליצ'י מדד 4 שנים / ליצ'י מדד 5 שנים | 378, 374 | Deposit; fixed real rate; CPI-linked | Z-lychee |
| 176-179 | פיקדון ליצ'י לשנה / פיקדון ליצ'י לשנתיים / פיקדון ליצ'י ל-4 שנים (fixed) / פיקדון ליצ'י ל-4 שנים (CPI) | links cd-189, cd-1766, cd-178, cd_378 | Headline names on Z-main for the codes above: exits every 3 months (1 year), every half year (2 years), yearly after year 1 (4 years); minimums 50,000 / 100,000 | Z-main |
| 180-188 | פומלית קבועה שנה / 17-13 חודשים / 18 חודשים / 23-19 חודשים / שנתיים / שנתיים וחודש / שנתיים וחצי / 3 שנים / 4 שנים | 131, 143, 148, 149, 132, 150, 153, 133, 134 | Deposit; fixed; unlinked; 1-4 years | [Z-oroblanco](https://www.mizrahi-tefahot.co.il/saving-accounts/oroblanco-cd/) |
| 189-193 | פומלית פריים שנה / 17-13 חודשים / 18 חודשים / לשנתיים / ל-3 שנים | 231, 243, 248, 232, 233 | Deposit; variable on prime | Z-oroblanco |
| 194-199 | פומלית מדד לשנה / לשנה וחצי / לשנתיים / 2.5 שנים / 3 שנים / 4 שנים | 331, 327, 332, 342, 333, 334 | Deposit; fixed; CPI-linked; Z-main shows no exits and minimum 100,000 for 331, 333, 334 | Z-oroblanco |
| 200-203 | פומלית צ. דולר לשנה / צ. שטרלינג לשנה / צ. אירו לשנה / צ. דולר אוסטרלי לשנה | 530, 630, 610, 660 | FX-linked; map to FXD | Z-oroblanco |
| 204-214 | דובדבן חודשי קבועה לשנה / 2 / 3 / 4 / 5 שנים; דובדבן חודשי פריים לשנה; דובדבן חודשי מדד 3 / 4 / 5 / 10 / 15 שנים | 165-169, 261, 363, 364, 365, 370, 375 | Income deposit: interest paid monthly; fixed unlinked, prime, or CPI-linked fixed; Z-main: no exits | [Z-cherry](https://www.mizrahi-tefahot.co.il/saving-accounts/churry-cd/) |
| 215 | פיקדונות קוקוס - מגוון מסלולי הצמדה לטווח ארוך | 155, 335, 350, 355 (per Z-main links) | Long deposit, no liquidity before maturity; tracks fixed unlinked, prime (5 years), CPI-linked (5-15 years), dollar-linked (FXD); minimum stated as 5,000 on the kids page and as 1,000 or 100,000 per product on Z-main (conflict, open question 13) | [Z-kids](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-for-kids/), Z-main |
| 216 | פיקדונות סברס - פיקדון לטווח ארוך, עם אפשרות לנזילות | 196, 197 (links) | Deposit; fixed; unlinked; 7, 10 or 15 years; lump sum from 10,000; withdrawal any time with advance notice (35 days per Z-main) at a reduced rate | Z-kids, Z-main |
| 217 | פיקדונות ענבים - חיסכון חודשי בהוראת קבע | - | Savings plan; standing order from NIS 100 a month; tracks "הצמדה משתנה על בסיס הפריים, ל-6, 18 או 25 שנים" and "מסלול הצמדה למדד המחירים לצרכן ל-18 שנים" | Z-kids |
| 218 | פיקדון קרמבולה דו מסלולי | 130 | Choice deposit (BPN-09): unlinked with fixed annual addition, or CPI-linked with no interest; 3 years; withdrawal from end of first month on any business day, early withdrawal CPI-linked without interest and without nominal-principal guarantee; 10,000-1,000,000; private customers | [Z-carambola](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/carambola-cd/) |
| 219 | פיקדון פסיפלורה דו מסלולי | 137 | Choice deposit: fixed shekel or CPI-linked plus interest; 3 years; withdrawal from one month after deposit daily, early exit CPI-linked without interest, no nominal-principal guarantee; minimum 10,000 | [Z-passiflora](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/passionfruit-cd/) |
| 220 | פיקדון תות דו מסלולי | 188 | Choice deposit: fixed stepped rising shekel, or CPI linkage with no interest; 4 years; withdrawal yearly after year 1; 100,000-10,000,000 | [Z-strawberry](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/cd_strawberry/) |
| 221 | פיקדון תפוז | 190 | Deposit; fixed stepped rate rising at 3, 6, 12, 18 and 48 months, paid retroactively; unlinked; 4 years; withdrawal any time on 35 days' notice; minimum 10,000 | [Z-orange](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/orange-cd/) |
| 222 | פיקדון אננס | 170 | Deposit; fixed stepped rising; unlinked; 6 years; withdrawal any business day after 3 years; 50,000-10,000,000 | [Z-pineapple](https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-attractive-offers/pineapple-cd/) |
| 223 | פיקדון פומלית פריים לשנה | link cd-231 | Headline name for code 231; 1 year; prime; minimum 10,000; no exits (Z-main) | Z-main |
| 224 | פיקדון ללא חשבון עו"ש / פיקדון ללקוחות כל הבנקים | - | Closed-system deposit (BANK-21); private customers; money returns to source current account; deposit types not named | [Z-noaccount](https://www.mizrahi-tefahot.co.il/saving-accounts/deposite-without-account/) |
| 225 | העתיד מתחיל עכשיו | - | Page title for children-oriented deposits; the page shows ענבים, סברס, קוקוס; not the NII programme | Z-main, Z-kids |
| 226 | הזמן הנכון לפיקדון | - | Promotion page title; not opened; not decodable | Z-main |

### First International (bank 31)

Sources: FIBI deposit pages as linked. FIBI says "ההפקדה בפיקדון מותנת בפתיחת חשבון בבנק" for the deposits-team and Eretz Israel products.

| # | Name exactly as shown | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|
| 227 | נבחרת הפיקדונות שלנו | Page title for rows 228-232 | [F-team](https://www.fibi.co.il/private/depositsandsavings/savingtypes/depositsteam/) | - |
| 228 | פיקדון אדיר | Deposit; fixed; unlinked; 12 months; exit points (every 3 months per description); minimum 10,000; digital possible | F-team | not dated |
| 229 | פיקדון איתן | Deposit; fixed; unlinked; "לשנה עד שנתיים" (period field says 12 months); no exits; minimum 1,000; digital benefit | F-team | not dated |
| 230 | פיקדון לביא | Deposit; variable "P-1.75%"; unlinked; 12 months; no exits; minimum 1,000; quoted rate for digital depositors only | F-team | rate as of 06.09.26 |
| 231 | גולן (פיקדון שקלי בריבית צומחת) | Deposit; variable, spread from prime improves each period; unlinked; 12 months; weekly exits; minimum 10,000 | F-team | not dated |
| 232 | גלבוע | Deposit; fixed or variable; unlinked; 12 months; withdrawal any time on 33 days' notice; minimum 10,000 | F-team | not dated |
| 233 | פיקדונות ארץ ישראל | Page title for rows 234-237 | [F-israel](https://www.fibi.co.il/private/depositsandsavings/savingtypes/israel/) | - |
| 234 | סער | Deposit; fixed stepped rising; unlinked; 24 months; exits every 3 months; minimum 10,000 | F-israel | not dated |
| 235 | מירון | Deposit; fixed stepped rising yearly; unlinked; 4 years; exits at end of years 1, 2, 3; minimum 10,000 | F-israel | not dated |
| 236 | כנרת | Deposit; fixed stepped rising; unlinked; 3 years; exit point at 18 months; minimum 10,000; a preferential-loan benefit if not withdrawn; branch or call centre only | F-israel | not dated |
| 237 | שניר | Deposit; 4 years; floating rate reset every 3 months to the makam yield nearest one year to maturity plus 0.20%, fixed until 7.12.2026; exits every 3 months on the 8th of March, June, September, December; linkage and minimum not stated | F-israel | not dated |
| 238 | פיקדונות ברירה | Page title for rows 239-241 | [F-choice](https://www.fibi.co.il/private/depositsandsavings/savingtypes/choicedeposits/) | - |
| 239 | פיקדון תלתן | Choice of best of unlinked shekel, CPI-linked or USD-linked; 1 year; NIS 10,000-250,000; login required. Has a USD leg: map to FXD as well | F-choice | not dated |
| 240 | פיקדון עוז | Choice deposit: fixed shekel or CPI-linked plus fixed real rate; 1 year; no exits; minimum 10,000; digital only | F-choice | not dated |
| 241 | פיקדון ארבל | Choice deposit: fixed or "P-2.25%" variable, the higher; 1 year; no exits; minimum 10,000; digital only | F-choice | rate note 06.09.26 |
| 242 | הוראות קבע | Page title for rows 243-246 | [F-standing](https://www.fibi.co.il/private/depositsandsavings/savingtypes/standingorders/) | - |
| 243 | פיקדון אופק | Savings plan; variable "פריים בניכוי 1.75%"; 6 years; exits from end of year 2 then yearly; standing order NIS 100-2,000; account type 287 | F-standing | rate as of 06.09.26 |
| 244 | חיסכון גמיש | Savings plan; monthly deposit for 4 years from NIS 50; monthly exit points; variable rate | F-standing | not dated |
| 245 | חיסכון לכל ילד | Child savings; six plans fixed / variable / CPI-linked, with or without exit stations | F-standing | not dated |
| 246 | מסלול ללא תחנות יציאה / מסלול עם תחנות יציאה / מסלולי המשך אפשריים מגיל 18 עד גיל 21; columns "שקלי – ריבית משתנה", "שקלי – ריבית קבועה", "ריבית שקלית קבועה צמודה" | Child-savings track names in FIBI's rate table | [F-child-table "טבלת ריביות תוכנית חיסכון לכל ילד"](https://www.fibi.co.il/media/cmsbfk0k/טבלת-ריביות.pdf) | "מעודכן ליום: 26.02.23" (stale) |
| 247 | פיקדון מותאם אישית | Named only; no terms on the page; not decodable from public sources | [F-personal](https://www.fibi.co.il/private/depositsandsavings/personal/) | - |
| 248 | פיקדון ללקוחות כל הבנקים | Closed-system deposit (BANK-21); page not opened | [F-savingtypes](https://www.fibi.co.il/private/depositsandsavings/savingtypes/) menu | - |
| 249 | פיקדון דולרי עם הכנסה חודשית; פיקדונות מובנים | FX deposit with monthly income; structured deposits; map to FXD | F-savingtypes | - |
| 250 | פיקדונות שיקליים מקובלים / פיקדונות שיקליים נוספים / פיקדונות מט"ח / פיקדונות בהוראת קבע / פיקדונות מובנים | 447 section names (spelling "שיקליים" as shown) | [F-interest](https://www.fibi.co.il/private/depositsandsavings/interest/) | - |
| 251 | מסלול בסיסי | Fee track = basic | [F-tracks](https://www.fibi.co.il/private/general/servicefeesroutes/) | - |
| 252 | מסלול מורחב | Fee track = extended | F-tracks | - |

### Otzar Hahayal (FIBI brand "אוצר החייל-הבינלאומי")

Not a separate entity in the BoI register (release 1). Its site shows the same menu names as FIBI and its 447 portal uses code 14 (online.bankotsar.co.il ... details/14).

| # | Name exactly as shown | Wrapper | Seen at |
|---|---|---|---|
| 253-260 | נבחרת הפיקדונות שלנו; פיקדון דולרי עם הכנסה חודשית; פיקדונות ארץ ישראל; פיקדונות ברירה; הוראות קבע; פיקדון מותאם אישית; פיקדונות מובנים; פיקדון ללקוחות כל הבנקים | Same labels as FIBI rows 227, 249, 233, 238, 242, 247, 249, 248; whether the products under them are identical to FIBI's was not checked (sub-pages not opened) | [O-savingtypes](https://www.bankotsar.co.il/private/depositsandsavings/savingtypes/), [O-interest](https://www.bankotsar.co.il/private/depositsandsavings/interestondeposits/) |

### Massad (bank 46)

Source: [S-savingtypes](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/) and the product pages linked from it.

| # | Name exactly as shown | Wrapper and terms | Seen at | Source date |
|---|---|---|---|---|
| 261 | פיקדון ארבל | Choice deposit ("פיקדון ברירת ריבית"): fixed or variable, the better at year end; 1 year; minimum 10,000; digital only | [S-arbel](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/arbel/) | not dated |
| 262 | פיקדון איתן | Deposit; fixed; shekel; 1 to 2 years; minimum 1,000 | [S-eitan](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/eitan/) | not dated |
| 263 | פיקדון אדיר | Deposit; rising rate; shekel; 1 year; exits every 3 months; minimum 10,000 | [S-adir](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/adir/) | not dated |
| 264 | פיקדון סער | Deposit; fixed stepped rising; shekel; 2 years; exits every 3 months; minimum 10,000; branch or Massad Call | [S-sahr](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/sahr/) | not dated |
| 265 | פיקדון גולן | Deposit; variable, spread from prime improves each period; shekel; 1 year; weekly exits; minimum 10,000 | [S-golan](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/golan/) | not dated |
| 266 | פיקדון ארגמן | Deposit; variable; 1 year; withdrawal on advance notice (period not stated); NIS 1,000-10,000; 0.3% addition for digital deposit | [S-argaman](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/argaman/) | not dated |
| 267 | אופק להשתלמות | Savings plan; variable "ריבית "פריים" בניכוי 2%"; 6 years; exits from end of year 2 then yearly; monthly amount not stated | [S-ofek](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/advanced/) | prime as of 4.9.2026 |
| 268 | חיסכון לכל ילד | Child savings; "שש תוכניות חסכון כל ילד בריבית קבועה/משתנה/צמודה למדד", with or without exit stations; plan names not shown | [S-child](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/savingsforeachchild/) | not dated |
| 269 | פתיחת חשבון פיקדון ("ללקוחות כל הבנקים") / פיקדון ללקוחות כל הבנקים | Closed-system deposit (BANK-21) | S-savingtypes | - |

### Yahav (bank 4)

Source: Yahav board "לוח מספר 13_26", "בתוקף מיום 06/10/2026", "מחליף לוח קודם מיום 03/09/2026"; its 447 pages are headed "24/09/2026 11_26" ([Y-board](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf)). Every 447 row shows "אין אפשרות לשבירה".

| # | Name exactly as shown | Wrapper and terms | Seen at |
|---|---|---|---|
| 270 | פיקדון בריבית קבועה ("פיקדון לזמן קצוב נושא ריבית קבועה") | Deposit; fixed; unlinked; 7 to 1,115 days in bands; from NIS 1,000 (a 50 row exists for short terms); the 447 fixed rows show no renewal | Y-board p.1, p.6 |
| 271 | פר"י ("פקדון בריבית יומית נושא ריבית משתנה") | Daily deposit; variable, spread from prime; unlinked; from 50; 447 row "פיקדון יומי": renewal "עד 180 יום" | Y-board p.2, p.6 |
| 272 | פריים קצר ("פקדון לזמן קצוב נושא ריבית משתנה") | Deposit; variable on prime; unlinked; 7 to 735 days; 447 rows show automatic renewal up to a set number of periods "ולא יותר מ- 540 יום" | Y-board p.2, p.6 |
| 273 | חסכון גמיש חדש ("פיקדון בהוראת קבע חודשית לתקופה של שנתיים בריבית משתנה על בסיס הפריים") | Savings plan; monthly standing order; 2 years; prime-based; from 200 | Y-board p.2 |
| 274 | חיסכון אודם חד פעמי- צמוד מדד / 447: חסכון אודם לשנה, חסכון אודם לשנתיים | Deposit; fixed real rate; CPI-linked; 365 or 730 days; from 1,000; no exits; "*החיסכון מעניק הבטחת קרן" | Y-board p.4, p.6 |
| 275 | חיסכון- נבו ברירה מדד / 447: חסכון נבו ברירה- מדד לשנה | Choice deposit: fixed unlinked or fixed plus CPI linkage, the better; 1 year; from 25,000 (447) or 1,000 (board); no exits | Y-board p.4, p.8 |
| 276 | חיסכון- נבו ברירה שקלי / 447: חסכון נבו ברירה- שקלי לשנה | Choice deposit: fixed or variable on prime, the better; 1 year; from 1,000; no exits | Y-board p.4, p.8 |
| 277 | חיסכון- חרמון חודשי | Savings plan (name says monthly); variable on prime with spread stepping by period: first 2 years, 2-5, 5-8, 8-10 years; NIS 100 to 5 million | Y-board p.4 |
| 278 | חיסכון- מונדיאל | Deposit; fixed rate stepping by year over 4 years; NIS 100 to 5 million | Y-board p.4 |
| 279 | חיסכון-חרמון חד פעמי | Deposit; variable on prime, spread stepping over 3 years; from 1,000 | Y-board p.4 |
| 280 | חיסכון- אדיר חד פעמי / 447: חסכון אדיר לשנה | Deposit; fixed rising by quarter, "ממוצעת לכל התקופה"; unlinked; 1 year; exits every 3 months; from 1,000 | Y-board p.5, p.8 |
| 281 | חיסכון- לביאה / 447: חסכון לביאה לשנתיים | Deposit; variable on prime, spread stepping by quarter; unlinked; 2 years; exits every 3 months; from 25,000 | Y-board p.5, p.8 |
| 282 | חיסכון ליוויתן / 447: חסכון ליוויתן לחמש שנים | Deposit; fixed rising, average for the period; unlinked; 5 years; exits after one year every 6 months; from 25,000 | Y-board p.5, p.8 |
| 283 | חיסכון מישר חד פעמי - צמוד דולר | USD-linked, "*החיסכון ללא הבטחת קרן"; map to FXD | Y-board p.4 |
| 284 | לוח שיעורי ריבית על פקדונות במט"ח בריבית קבועה; חיסכון חודשי בהוראת קבע (FX, 3-48 months) | FX deposits and FX monthly savings; map to FXD | Y-board p.3 |
| 285 | תשלום ריבית על יתרת זכות בחשבון | Current-account credit interest; variable (prime minus 4%); benefit for 01.10.26-31.12.26; conditions: salary or allowance of NIS 5,000+ (not child allowance), card charges NIS 2,000+, daily balance up to NIS 10,000 with average monthly balance below 10,000; quarterly; automatic | Y-board p.7 |
| 286 | ריבית תיקונים | Not a product: correction rate (prime minus 1.5%) | Y-board p.1 |

### Banks with no catalogued names

| Bank (register) | Result |
|---|---|
| בנק ירושלים (54) | Site returned a Radware bot-check redirect (validate.perfdrive.com); not followed. Only undated secondary press items found. Not decodable from public sources. |
| וואן זירו הבנק הדיגיטלי (18) | 403 at https://www.onezerobank.com/. Not decodable. |
| בנק אש ישראל (3) | Register lists no website (release 1). Nothing found. |
| Discount (11) | Labels only (rows 94-97). |

## Look-alike names

| Name | Banks | How they differ (as published) |
|---|---|---|
| אדיר | FIBI "פיקדון אדיר"; Massad "פיקדון אדיר"; Yahav "חיסכון- אדיר חד פעמי" / "חסכון אדיר לשנה" | All 1 year with exits every 3 months. FIBI: fixed, minimum 10,000. Massad: "ריבית עולה", minimum 10,000. Yahav: fixed rising, average rate, from 1,000. Different banks, different rates. |
| לביא / לביאה | FIBI "פיקדון לביא"; Yahav "חיסכון- לביאה" | FIBI: 12 months, variable, no exits, from 1,000. Yahav: 2 years, variable stepped, exits every 3 months, from 25,000. |
| חיסכון גמיש | Hapoalim "חיסכון גמיש"; FIBI "חיסכון גמיש"; Yahav "חסכון גמיש חדש" | Hapoalim: standing order plus occasional deposits, unlinked, rate type not seen. FIBI: 4 years, from 50, monthly exits, variable. Yahav: 2 years, prime-based, from 200. |
| ארבל | FIBI "פיקדון ארבל"; Massad "פיקדון ארבל" | Same description (fixed or variable, the better, 1 year, minimum 10,000, digital only); same group; whether one product is not stated. |
| איתן, סער, גולן | FIBI and Massad | Same descriptions and minimums at both; FIBI "איתן" period field 12 months vs Massad "לשנה עד שנתיים". |
| אופק | FIBI "פיקדון אופק"; Massad "אופק להשתלמות" | Both 6-year savings with exits from year 2. FIBI: prime minus 1.75%, NIS 100-2,000 a month. Massad: prime minus 2%. |
| פר"י | Hapoalim "פיקדון ריבית יומית – פר"י"; Yahav "פר"י" | Both daily, prime-based. Minimums 100 (Hapoalim) and 50 (Yahav); Yahav shows renewal up to 180 days. |
| פק"מ | Leumi (fixed and prime models); Mercantile (fixed, codes 118-154) | Same abbreviation; expansion not stated at either bank. |
| פיקדון בריבית קבועה | Hapoalim (one-off contract); Yahav (rate-board family 7-1,115 days) | Generic name; different structures. |
| עתיד מניב שקלי | Hapoalim, two contracts with the same heading | 60-month version (income deposit, early exit after a set number of years) and 2-year version (no early withdrawal). |
| 154 / 0154 | Mercantile "פק"מ 12 חודשים" (154) and "פיקדון לשנה בריבית קבועה" (0154) | Same product number, two names; likely one product shown twice (not confirmed). |
| נזיל ... ל 5 שנים | Mercantile "נזיל חודשי ל 5 שנים" (0113, one-off) and "פיקדון נזיל חודשי ל 5 שנים" (0626, monthly deposits) | One-off deposit vs monthly savings plan. |
| מדדי | Hapoalim "מדדי לכל עת" and "חיסכון מדדי" | Early exit allowed after set months vs no withdrawal before maturity. |
| צעד ראשון | Hapoalim contract "פיקדון צעד ראשון" and promotion "צעד ראשון לחיסכון" | Same product family; the promotion adds a NIS 500 grant and eligibility tests. |
| ברירה / דו מסלולי | Leumi, FIBI, Massad, Yahav, Mizrahi, Hapoalim (WIN WIN) | Different alternatives and early-exit rules (BPN-09). |
| חיסכון לכל ילד | Every participating bank; Mizrahi "העתיד מתחיל עכשיו" | The NII programme at a bank (`child-savings.md`) vs a bank's own long deposits marketed for children. |
| פיקדון ללקוחות כל הבנקים / פיקדון ללא חשבון עו"ש | Hapoalim, Mercantile, FIBI, Otzar, Massad, Mizrahi; Leumi | Same regulatory wrapper (BANK-21); minimums differ (Hapoalim 1,000; Mercantile 250; Leumi models from 1,000). |

## Not decodable from public sources

1. Discount: every deposit and savings-plan name (script table unavailable).
2. Bank of Jerusalem, One Zero, Esh Israel: all names.
3. Leumi "Total Digital"; Leumi "לל"ת" and "מני"ע" expansions; whether "תשלומים" models take instalments.
4. Hapoalim "פיקדון מטרה" (what distinguishes it from "פיקדון בריבית קבועה"); "חיסכון גמיש" rate type; "עו"ש מקזז"; "ספרינט" (non-digital) terms; "(פ)" in the fee-track name.
5. FIBI and Otzar "פיקדון מותאם אישית".
6. Mizrahi "הזמן הנכון לפיקדון"; whether "פיקדון עד שצריך" and "פיקדון רימונים עד שקונים" are codes 259 and 256.
7. Mercantile "מרכנתיל פלוס".
8. Massad child-savings plan names.
9. Names that exist only inside apps after login (all banks): not visible to a public fetch.

## Directive-447 publication: machine-readability per bank (N6)

| Bank | Format seen | URL | Machine-readable? |
|---|---|---|---|
| Leumi | HTML filled by script (placeholders "{asOfDate}", "{primeBaseRate}" in fetched text); PDF "print-pdf", 80 pages | https://www.leumi.co.il/he/savings/interest-rate-table ; https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/leumi | Partly: PDF with one product per page block; text extraction not tested on this PDF (it rendered as images in the reader used) |
| Pepper (Leumi) | PDF, 4 pages | https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/pepper | Partly: text layer extracted |
| Hapoalim | HTML, tables not present in fetched text (script) | https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest | No public file found |
| Discount | HTML, script; "המידע אינו זמין כעת" | https://www.discountbank.co.il/private/savings-investments/savings-interest/ | No |
| Mercantile | Same page layout as Discount; tables empty | https://www.mercantile.co.il/private/investments-savings/savings-interest/ | No |
| Mizrahi-Tefahot | HTML, script; column headers visible incl. "שם הפיקדון" | https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ | No public file found |
| First International | Angular app "PortalNG/deposits-details", hash routes | https://online.fibi.co.il/appsng/Resources/PortalNG/deposits-details/#/details/31 (sections /2 additional, /3 FX, /4 standing order, /5 structured) | Unknown: a data endpoint behind the app was not found |
| Otzar Hahayal | Same app, code 14 | https://online.bankotsar.co.il/appsng/Resources/PortalNG/deposits-details/#/details/14 | Unknown |
| Massad | Rate page link seen in release 1; not opened | https://www.bankmassad.co.il/private/depositsandsavings/interestratesondeposits/ | Unknown |
| Yahav | PDF generated from Excel (metadata), 8 pages incl. 447 tables, URL stable across boards | https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf | Partly: text layer extracted |
| Bank of Jerusalem | Blocked (Radware) | https://www.bankjerusalem.co.il/deposits-savings | Not reachable |
| One Zero | 403 | https://www.onezerobank.com/ | Not reachable |
| BoI (all banks) | EDGE SDMX, CSV | BPN-03 | Yes, but per bank and monthly, not per product; series meaning not decoded |

Conclusion for N6: the uniform format is uniform on screen only. Directive 447 does not require a machine-readable output (BPN-01). For the catalogue, bank names must be collected by hand from PDFs and pages, keyed on the bank's code where one exists, dated with the source date, and topped up with what the founder and friends paste in.

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| דגם | model | Leumi's product code, written "דגם NNN/N" | 447 table (statement use not verified) | Leumi 447 PDF |
| הטבת דיגיטל | digital benefit | Rate addition for digital deposit, a column Leumi adds to the 447 table | 447 table | Leumi 447 PDF |
| פדיום | redemption | Leumi daily models ("פדיום פריים", "פדיום מעוקל") | 447 table | Leumi 447 PDF |
| זמין חודשי / זמין כל שבוע / זמין כל רבעון / זמין כל שנה | available monthly / weekly / quarterly / yearly | Exit-point frequency in the name (Leumi; Hapoalim "זמין רבעוני") | product names | Leumi 447 PDF; Hapoalim contracts |
| חציוני | half-yearly | Leumi 6-month model | product name | Leumi 447 PDF |
| תשלומים | instalments / payments | Leumi models "תשלומים שקלי", "תשלומים פריים", "תשלומים צמוד מדד"; meaning not stated | product name | Leumi 447 PDF |
| מעוקל / משועבד / ללא תנועה (לל"ת) | seized / pledged / dormant | Deposits holding money not freely available; not open to new deposits | statement | Leumi 447 PDF pp.74-78 |
| תושב ישראל / תושב חוץ | resident / non-resident | Leumi FX deposit variants | 447 table | Leumi 447 PDF |
| ריבית כוללת | overall interest | Total rate for the whole term (Hapoalim) | contract | Hapoalim "חיסכון מנצח", "שקלי לכל עת" |
| מסלול א' / מסלול ב' | track A / track B | The two alternatives in a choice deposit | contract | Hapoalim WIN WIN |
| דו מסלולי | dual-track | Mizrahi's term for a choice deposit | product name | Mizrahi |
| ברירה / ברירת ריבית | choice / rate choice | Pays the better alternative | product name | Yahav, FIBI, Massad, Leumi |
| ריבית מדורגת עולה / ריבית עולה / ריבית צומחת | stepped rising rate / rising / growing | Fixed rate that rises by period, or a prime spread that improves | product descriptions | FIBI, Massad, Mizrahi, Hapoalim |
| ממוצעת לכל התקופה | average for the whole period | How Yahav quotes stepped products in the 447 table | 447 table | Yahav board p.8 |
| הודעה מראש | advance notice | Withdrawal any time after notice (33 days FIBI "גלבוע"; 35 days Mizrahi "תפוז", "סברס") | product pages | FIBI; Mizrahi |
| הפקדות מזדמנות | occasional deposits | Extra deposits beside the standing order | contract | Hapoalim "חיסכון גמיש" |
| תקופה/תחנה | period/station | Date when partial withdrawal or addition is allowed | contract | Hapoalim "חיסכון גמיש", "צעד ראשון" |
| תכניות החיסכון להכנסה שוטפת | savings plans for current income | Plans that pay interest out periodically | contract | Hapoalim "עתיד מניב שקלי" |
| שיטת שפיצר | Spitzer (annuity) method | Equal periodic payouts of principal and interest | contract | Hapoalim "חיסכון משלם שקלי" |
| צ. דולר / צ. אירו / צ. ליש"ט / צ. שטרלינג | dollar- / euro- / sterling-linked | Shekel deposit linked to a currency; "אין הבטחת קרן" | product names | Mizrahi |
| הבטחת קרן / ללא הבטחת קרן | principal guarantee / none | Whether nominal principal is protected | board, product pages | Yahav; Mizrahi |
| ללא הבטחת קרן ההפקדה הנומינאלית | without guarantee of the nominal principal | Mizrahi's early-exit wording for dual-track deposits | product pages | Mizrahi Carambola, Passiflora |
| הפקדה ישירה | direct deposit | Mercantile's page for self-service fixed deposits | site | Mercantile |
| נזיל | liquid | Mercantile name element for deposits with frequent exits | product names | Mercantile |
| פיקדון ליעד | goal deposit | Mercantile monthly savings with no exits | product name | Mercantile |
| פיקדון מטרה | goal deposit | Hapoalim one-off fixed deposit | contract | Hapoalim |
| ריבית ב"י | BoI rate | Shown next to prime on Yahav's board | rate board | Yahav |

## Institutions

Banks covered against the BoI register "רשימת תאגידים בנקאיים בישראל" (data.gov.il dataset 375) as recorded in `bank-current-account-deposits.md` Institutions and `regulators-and-protection.md` REG-03 (register not re-read here). Ordinary banks: Leumi 10 (plus the Pepper app), Hapoalim 12, Discount 11, Mercantile 17, Mizrahi-Tefahot 20, First International 31 (plus the Otzar Hahayal brand; a Pagi link appears in Otzar's footer, not researched), Massad 46, Yahav 4, Jerusalem 54, One Zero 18, Esh Israel 3. Left out from the register: Altshuler Shaham Financial Services (60), the clearing company (50), foreign bank branches (27, 22, 23, 39), as in release 1. Checked 2026-10-22.

Catalogued names (numbered entries; a range such as 147-162 counts each name in it): Leumi 55, Pepper 5, Hapoalim 33 (incl. one row of 4 FX contract names), Discount 4 labels, Mercantile 26, Mizrahi-Tefahot 103 (incl. 23 FX-linked codes), First International 26, Otzar Hahayal 8 labels, Massad 9, Yahav 17, Jerusalem 0, One Zero 0, Esh Israel 0. Total 286.

## Open questions

1. **Discount product names.** The money-market page shows filters only; tables are script-loaded and returned "המידע אינו זמין כעת". Likely answer: the page in a browser or the Discount app; or the founder's paste. **[2026-10-22 browser pass: Update: the page loads in a real browser, but Chrome auto-translated it; names not captured.]** **[2026-10-22 browser pass 2: Closed by BPN-12 (second browser pass, translation off).]**
2. **Hapoalim 447 table content** (names in "ריבית בפיקדונות נוספים", the current-account row). Page renders by script. Browser needed.
3. **Mizrahi 447 table content** (the "שם הפיקדון" column, current-account interest). Same.
4. **FIBI-group PortalNG data source.** Whether online.fibi.co.il exposes a JSON endpoint behind "deposits-details"; Massad's code in the same app. Browser developer tools would show it.
5. **Bank of Jerusalem, One Zero, Esh Israel.** Blocked or no site. Browser by hand, or app screens typed in by a customer. **[2026-10-22 browser pass: Partly closed by BPN-11 (Jerusalem, One Zero); Esh Israel still has no site.]**
6. **Pagi brand.** pagi.co.il is linked from Otzar's footer; whether it still sells deposits under its own names was not checked.
7. **Leumi PDF pages 40-68** were not read page by page (FX by currency assumed from pages 37-39 and 69-72).
8. **Expansions**: "פק"מ" (Leumi, Mercantile), "לל"ת" and "מני"ע" (Leumi), "(פ)" (Hapoalim fee track). Not stated in any source read. **[2026-10-22 browser pass: "פק"מ" closed by BANK-30; פז"ק, פקצ"מ, פח"ק, פצ"מ and הו"ק closed by BANK-31 (browser pass 3); לל"ת, מני"ע, Hapoalim's "(פ)" and Mercantile's פר"ן stay open.]**
9. **Hapoalim "פיקדון מטרה"** vs "פיקדון בריבית קבועה": page 1 identical; read page 2 or the transaction details.
10. **Hapoalim "חיסכון גמיש"** rate type and term: contract page 1 silent; the brochure https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/פקדונות/gamish.pdf was seen only as a search result, not opened.
11. **Mercantile "פיקדון לשנה בריבית משתנה ללקוחות כל הבנקים"**: product name and rate are variable, description says fixed.
12. **Mercantile code 154 / 0154** shown under two names.
13. **Mizrahi קוקוס minimum**: 5,000 (kids page) vs 1,000 or 100,000 (main page per product).
14. **Mizrahi "פיקדון עד שצריך" and "פיקדון רימונים עד שקונים"**: codes inferred from URL slugs cd-259 and cd-256 only.
15. **FIBI and Massad shared names** (ארבל, איתן, סער, גולן; אופק vs אופק להשתלמות): one product or two; whether Otzar's sub-pages carry the same products.
16. **EDGE INTEREST_DASH series meaning**: codelist CL_BNK_WEB (about 1 MB) not decoded; reporting directive "D823A" not read. Likely in the BoI EDGE series browser.
17. **Fee-track names** at Mizrahi, Yahav, Massad, Jerusalem, One Zero not checked; Leumi "Total Digital"; Discount's 01-312 form is from 2015.
18. **Child-savings track names** at Discount (agreement 04-183 dated 01/01/17 seen only as a search result), Mercantile, Mizrahi (no NII page found), Massad (six plans unnamed), Otzar; Hapoalim's other five plan names (only one contract title read verbatim).
19. **Yahav 447 pages lag the board** (11_26 of 24/09/2026 inside board 13_26 of 06/10/2026): whether the 447 rows were current.
20. **App-only names**: every bank's app shows names after login that public pages may not (success criterion 5). Only the founder or a friend can supply them.
21. **Statement names**: whether Leumi statements show the "דגם" code; no statement was seen.

## Left out and why

| Left out | Why |
|---|---|
| Rates, spreads, tariff prices on every page read | Data track; they change daily or by board. |
| FX and structured deposit terms (Leumi FX, 265/9; Hapoalim FX contracts incl. BURN RATE; Yahav FX and מישר; Mizrahi FX-linked codes; FIBI dollar income, structured, תלתן USD leg; Discount and Mercantile FX headings) | `fx-and-structured-deposits.md`; names only here. |
| Rules behind closed-system deposits, 447, fee tracks, credit interest | `bank-current-account-deposits.md` (BANK-13, BANK-14, BANK-17, BANK-21). |
| Child-savings rules and NII process | `child-savings.md`. |
| Tax clauses inside the contracts (withholding rates, CPI-fall treatment) | `tax-interest-deposits-bonds.md`; not stated as rules here. |
| Business products (for example Hapoalim "מסלול פועלים UP עסקי", Mercantile municipal deposits) | Not for individuals. |
| Money-market funds and makam shown on the same 447A pages | `mutual-funds-and-money-market-funds.md`, `government-bonds-and-makam.md`. |
| Following the Radware challenge URL for Bank of Jerusalem | Bot-check page; not a content source. |
| Secondary press items on Bank of Jerusalem products (hon.co.il, undated) | Undated and not opened; not a source. |

## Sources

All checked 2026-10-22.

| Title | Publisher | Strength | URL |
|---|---|---|---|
| Directive 447 (5/24), version 1 | BoI Banking Supervision | primary | https://www.boi.org.il/media/orgfwntb/447.pdf |
| EDGE dataflow INTEREST_DASH; DSD WEB 1.0; data CSV | BoI | primary | https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/dataflow/BOI.BankingSupervision/INTEREST_DASH ; https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/datastructure/BOI.BankingSupervision/WEB/1.0 ; https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/INTEREST_DASH/1.0?lastNObservations=1&format=csv |
| Leumi 447 PDF (data 23.10.2026) | Bank Leumi | institution | https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/leumi |
| Leumi interest-rate table (HTML) | Bank Leumi | institution | https://www.leumi.co.il/he/savings/interest-rate-table |
| Pepper 447 PDF (data 23.10.2026) | Bank Leumi (Pepper) | institution | https://www.leumi.co.il/he/savings/interest-rate-table/print-pdf/pepper |
| Leumi savings, touch savings, kids savings, fee tracks | Bank Leumi | institution | https://www.leumi.co.il/he/savings ; https://www.leumi.co.il/he/savings/saving_by_touch ; https://www.leumi.co.il/he/savings/savings-for-your-kids ; https://www.leumi.co.il/he/commission-rate-tracks |
| Leumi child-savings rate sheet (from 9.07.2026) | Bank Leumi | institution | https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/General/forms/interest_rate_sheet.pdf |
| Hapoalim rate page; savings page; 447 page; deposit for all customers; deposit search; first step; kids page; fee list | Bank Hapoalim | institution | https://www.bankhapoalim.co.il/he/savings/product-of-the-month/interest-rates ; https://www.bankhapoalim.co.il/he/savings ; https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest ; https://www.bankhapoalim.co.il/he/savings/deposit-for-all-customers ; https://www.bankhapoalim.co.il/he/savings/deposit-search ; https://www.bankhapoalim.co.il/savings/first-step/ ; https://www.bankhapoalim.co.il/he/savings/saving-plan-for-each-child ; https://www.bankhapoalim.co.il/forms/he/fee-list |
| Hapoalim standard contracts page and the contracts linked in the Hapoalim table | Bank Hapoalim | institution | https://www.bankhapoalim.co.il/standard-contract (each PDF URL in the table) |
| Hapoalim Sprint digital brochure; prime brochure; פר"י 2022 | Bank Hapoalim | institution | https://www.bankhapoalim.co.il/sites/default/files/media/sprynt_dygytly.pdf ; https://www.bankhapoalim.co.il/sites/default/files/media/prm.pdf ; https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/peri_13042022.pdf |
| Hapoalim child-savings contract (fixed unlinked with switching) | Bank Hapoalim | institution | https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/kvoaaemmaavar.pdf |
| Discount money-market page; explanation page; tariff page; form 01-312 | Discount Bank | institution | https://www.discountbank.co.il/private/savings-investments/savings-interest/ ; https://www.discountbank.co.il/private/savings-investments/savings-and-investment-products-explanation/ ; https://www.discountbank.co.il/private/general-information/charges-tariff/ ; https://www.discountbank.co.il/media/uovfz0dk/01-312-2.pdf |
| Mercantile money-market page; deposits; deposits without account; direct; monthly; promotion; web; tariff | Mercantile Discount | institution | https://www.mercantile.co.il/private/investments-savings/savings-interest/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/deposits-without-account/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/fixed-interest-deposits/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/monthly-deposit/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/ten-months-deposits/ ; https://www.mercantile.co.il/private/investments-savings/deposit-savings/web/ ; https://www.mercantile.co.il/private/generalinfo/price-list-fees-tracks/ |
| Mizrahi deposit rates (447); deposits; families; family and product pages; kids; no-account | Mizrahi-Tefahot | institution | https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ ; https://www.mizrahi-tefahot.co.il/saving-accounts/ ; https://www.mizrahi-tefahot.co.il/saving-accounts/cd-all/ ; family and product URLs in the Mizrahi table ; https://www.mizrahi-tefahot.co.il/saving-accounts/deposits-for-kids/ ; https://www.mizrahi-tefahot.co.il/saving-accounts/deposite-without-account/ |
| FIBI interest; saving types; deposits team; Eretz Israel; choice; standing orders; personal; fee tracks; child rate table (26.02.23) | First International | institution | https://www.fibi.co.il/private/depositsandsavings/interest/ ; https://www.fibi.co.il/private/depositsandsavings/savingtypes/ ; https://www.fibi.co.il/private/depositsandsavings/savingtypes/depositsteam/ ; https://www.fibi.co.il/private/depositsandsavings/savingtypes/israel/ ; https://www.fibi.co.il/private/depositsandsavings/savingtypes/choicedeposits/ ; https://www.fibi.co.il/private/depositsandsavings/savingtypes/standingorders/ ; https://www.fibi.co.il/private/depositsandsavings/personal/ ; https://www.fibi.co.il/private/general/servicefeesroutes/ ; https://www.fibi.co.il/media/cmsbfk0k/טבלת-ריביות.pdf |
| Otzar Hahayal home, saving types, interest | Otzar Hahayal (FIBI) | institution | https://www.bankotsar.co.il/ ; https://www.bankotsar.co.il/private/depositsandsavings/savingtypes/ ; https://www.bankotsar.co.il/private/depositsandsavings/interestondeposits/ |
| Massad saving types and product pages; child savings | Bank Massad | institution | https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/ and sub-pages in the Massad table ; https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/savingsforeachchild/ |
| Yahav board 13_26 (06/10/2026) | Bank Yahav | institution | https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf |
| Not reached: Bank of Jerusalem (Radware), One Zero (403), Hapoalim offset-account and product-of-the-month (404), Discount lo_zamood PDF (404), BoI equator page (Radware) | - | - | https://www.bankjerusalem.co.il/deposits-savings ; https://www.onezerobank.com/ ; https://www.bankhapoalim.co.il/he/savings/offset-account ; https://www.bankhapoalim.co.il/he/savings/product-of-the-month ; https://www.discountbank.co.il/media/i0chkvpg/lo_zamood_20524.pdf ; https://www.boi.org.il/information/bank-paymnts/financial-education/campaigns/boi-equator/ |
