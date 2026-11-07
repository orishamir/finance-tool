# One-year deposit rows at Discount, Hapoalim and Mizrahi-Tefahot (issue #153), 2026-11-06

All values were read on 2026-11-06 from each bank's directive-447 publication. Each row was checked against the bank's terms document or product page where one exists. No page was behind a bot check. Every new document is filed in `research/library/`.

## What was read

| Bank | Publication (the page) | What the page loads | Its own date |
|---|---|---|---|
| Discount | https://www.discountbank.co.il/private/savings-investments/deposits-savings/classic/interest-rate-tables/ | `/api/MoneyMarket/Saving?pageId=6c03bad7-…` (JSON). The column titles come from the page's own `data-columns` | `lastUpdatedAt` 2026-11-06T18:00, prime 4.75% |
| Discount | closed-system page https://www.discountbank.co.il/private/savings-investments/deposits-savings/deposits-without-account/ and its one-year form page `…/palal-form-fixed-interest-year/` | static HTML | read 2026-11-06 |
| Discount | campaign page https://www.discountbank.co.il/private/savings-investments/deposits-savings/campaign/ | static HTML | prime "נכון ל-03.09.2026" |
| Hapoalim | https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest | `/forms/he/_api/deposit-products-data` (JSON) | none in the data; the page says "המידע נכון למועד הצגתו" |
| Hapoalim | WIN WIN contract and Sprint contract and brochure | already in the library (filed 2026-10-31) | contract metadata 16.3.2025; brochure "ספטמבר 2023" |
| Mizrahi-Tefahot | https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ | `/umbraco/surface/NabatDeposits/GetNabatDeposits?depositType=fixed|additional&pageIndex=n&itemsPerPage=10&currencyCode=99` (HTML rows) | "נכון לתאריך ושעה" 06/11/2026 08:30 |
| Mizrahi-Tefahot | terms documents `MiniSites/Pikdonot-Terms/1_99_150_<code>.pdf` for 165, 189, 261, 287, 256, 331, 530, 610, 630, 660 | PDF | none printed |

The three rows the site already held were unchanged on 2026-11-06: Discount 0122 at 2.25, Hapoalim's fixed "פיקדון לשנה" at 1.74% and Mizrahi 131 at 1.55%. They were not rewritten.

## Rows collected (21 records under `data/terms/deposits/`; 17 after the fix pass, below)

Rates are nominal annual rates before tax, as printed. For prime-linked rows: prime is 4.75%. "Break" is the 447 table's break column.

| Record | Printed name | Rate type, linkage | Rate | From (₪) | Break | Exit points | Channel or condition printed |
|---|---|---|---|---|---|---|---|
| discount-shana-kvua-kol-habankim-0513 | שנה קבועה -ללקוחות כל הבנקים (0513) | fixed, none | 2.4 | 250 | with a penalty | none | branch, private site, private app; "פיקדון במערכת סגורה" |
| discount-shana-mishtana-kol-habankim-0523 | שנה משתנה -ללקוחות כל הבנקים (0523) | prime −2.1, none | 2.65 | 250 | with a penalty | none | branch, private site; closed system |
| discount-kvua-leshana-mivtza-0183 | קבועה לשנה (0183) | fixed, none | 2.25 (common 2.5) | 250 | with a penalty | none | every channel; "מוצר מבצע" |
| discount-pakam-hachnasa-shotefet-0130 | פק"מ הכנסה שוטפת (0130) | fixed, none | 2.0 | 250 | with a penalty | none | branch, telebank; "תשלום ריבית לעוש מידי חודש" |
| discount-pikadon-leshana-yetzia-riv-0192 | פקדון לשנה (0192) | fixed, none | 1.0 (common 1.25) | 250 | with a penalty | every 3 months | branch, telebank, site, feedback channel |
| discount-pikadon-leshana-yetzia-hodshit-0191 | פקדון לשנה (0191) | fixed, none | 0.5 (common 0.75) | 250 | with a penalty | monthly | every channel |
| discount-pikadon-leshana-prime-yetzia-riv-0226 | פקדון לשנה (0226) | prime −3.25, none | 1.5 | 250 | with a penalty | every 3 months | every channel |
| discount-pikadon-leshana-prime-yetzia-hodshit-0224 | פקדון לשנה (0224) | prime −4, none | 0.75 | 250 | with a penalty | monthly | every channel |
| hapoalim-win-win-leshana | WIN WIN לשנה | fixed, "ללא הצמדה" | 2.35 | 1,000 | not allowed | none | not printed; better of the fixed rate or CPI linkage with no interest |
| hapoalim-sprint | ספרינט | fixed, none | 1.8 | 1,000 | not allowed | monthly, with 100% of the accrued interest | not printed |
| hapoalim-pikadon-leshana-madad | פיקדון לשנה | fixed, CPI | 0.9 | 1,000 | not allowed | none | not printed |
| mizrahi-tefahot-duvdevan-hodshi-kvua-shana-165 | 165 - דובדבן-חודשי קבועה שנה | fixed, none | 2.00 (effective 2.02) | 30,000 (up to 10,000,000) | not allowed | none | banker, site; interest paid monthly |
| mizrahi-tefahot-litchi-kvua-shana-189 | 189 - ליצ'י קבועה שנה | fixed, none | **null**: printed "1.50% / 1.51% / 1.52% / 1.53%", effective 1.52% | 10,000 (up to 10,000,000) | not allowed | every 3 months | banker |
| mizrahi-tefahot-duvdevan-hodshi-prime-shana-261 | 261 - דובדבן-חודשי פריים שנה | prime −3.03, none | 1.72 (higher tiers prime −2.78 = 1.97) | 30,000 | not allowed | none | banker, site; interest paid monthly |
| mizrahi-tefahot-rimonim-yomi-prime-shana-287 | 287 - רימונים- יומי פריים לשנה | prime −4.65, none | 0.10 | 2,000 | not allowed | daily after 7 days | banker, site, app |
| mizrahi-tefahot-rimonim-hodshi-prime-shana-256 | 256 - רימונים- חודשי פריים לשנה | prime −3.75, none | 1.00 | 2,000 (up to 5,000,000) | not allowed | monthly | banker, site, app |
| mizrahi-tefahot-pomelit-madad-shana-331 | 331 - פומלית- מדד שנה | fixed, CPI | 1.00 | 10,000 (up to 10,000,000) | not allowed | none | banker, site, app; "קרן הפיקדון אינה מובטחת" |
| mizrahi-tefahot-pomelit-tzamud-usd-shana-530 | **taken out, see below** 530 - פומלית- צ. דולר שנה | fixed, FX (USD) | 3.40 | 1,000 | not allowed (terms) | none | banker, site |
| mizrahi-tefahot-pomelit-tzamud-eur-shana-610 | **taken out, see below** 610 - פומלית- צ. אירו שנה | fixed, FX (EUR) | 2.48 | 1,000 | not allowed (terms) | none | banker, site |
| mizrahi-tefahot-pomelit-tzamud-gbp-shana-630 | **taken out, see below** 630 - פומלית- צ. לי"ש שנה | fixed, FX (GBP) | 3.01 | 1,000 | not allowed (terms) | none | banker, site |
| mizrahi-tefahot-pomelit-tzamud-aud-shana-660 | **taken out, see below** 660 - פומלית-צ.דולר אוסטרלי שנה | fixed, FX (AUD) | 2.94 | 1,000 | not allowed (terms) | none | banker |

## The issue's open points

- **Discount 0513, "מערכת סגורה": settled from the bank's own pages.** The closed-system page says "הפקדונות מיועדים למי שאינם מנהלים חשבון עו"ש בבנק דיסקונט" and "ללקוחות פרטיים בלבד". The money comes from the depositor's account at another bank and goes back to it at the end, and the owners of both accounts must be the same. The rate offer holds for 3 business days. The deposit does not renew and cannot be pledged or set off. So someone with an account at Discount cannot open 0513. The page prints "ריבית שנתית 2.4% (מתואמת שנתית 2.4%)".
- **The "calculated rate 2.35" beside 2.4 is not a published rate.** It is the data field `OfferedCalculatedNominalInterest`, which no column of the page shows. On every fixed row it equals prime 4.75 less the rate: 0122 gives 2.25 and 2.5, 0513 gives 2.4 and 2.35. That is inferred from the pattern; nothing on the page says it. The record keeps 2.4.
- **Hapoalim's 2.19% is the prime-linked "פיקדון לשנה" that the site already holds** (`hapoalim-pikadon-leshana-prime`, printed "2.19% = 2.56% - פריים"). It is not another fixed row.

## Not collected, or collected without a value

- **Discount 0811 "פקדון לשנה", CPI-linked, 0.5.** Its rate type is printed "צמוד מדד", neither "קבועה" nor "משתנה". The schema requires one of the two, and choosing would be inference.
- **Discount 0735 "פצ"מ דולר לשנה", USD-linked shekel deposit, 0.15.** Its rate type is printed "צמוד מטח", so the same reason applies.
- **Mizrahi 189: `rate_offered.value` is null.** The table prints four rates, one per three-month period. The terms say each period earns "הריבית השנתית שנקבעה לתקופה". Which rate a deposit held for the whole year earns is not printed in words. The record carries a `doubt_he`. Its common-rate column also prints 3.00% and 4.00% on the higher amount tiers, above the offered rates, with no explanation.
- **Hapoalim WIN WIN: `tax_bucket.value` is null. The rule is missing.** The rule base has no tax rule for a deposit that pays the better of a fixed unlinked rate and CPI linkage with no interest (BPN-09 names it, and no TXI rule covers it). The bank's contract says track A pays 15% and track B is exempt. The notes quote that as the bank's statement, not as a rule.
- **Hapoalim: no deposit channel for any row.** Its 447 table prints no channel column.
- **Discount: the printed upper amount "עד 999999999"** on the rows of the additional table is kept out of `amount_range.max` (null) and quoted in notes.
- **Rows read and left out as not one-year:**
  - Discount "חיסכון ליעד קצר" 0660, "12-24 חודשים": a standing-order savings plan.
  - Hapoalim "מנצח ל 13 חודשים".
  - Mizrahi "110 - אפרסמון- קבועה 10-12 חד'": its period is printed "10 חודשים".
- **Mizrahi 287, daily exit points:** `exit_points.every_months` is null because a number of months cannot hold "every day". The notes and `conditions_he` say it in words.

## Conflicts and doubts

- **Hapoalim Sprint:** today's 447 table says a withdrawal at an exit point earns "100% מהריבית הצבורה". The 2023 brochure "פיקדון ספרינט דיגיטלי" says 70%. The record keeps the table.
- **Discount 0183** is printed at 2.25 (the 447 offered minimum), with a common rate of 2.5. The bank's campaign page prints 2.50% for deposits made on the site or app and 2.25% at a branch, without naming the code. The record keeps 2.25, and the notes carry the rest.
- **New tax-bucket value:** CPI-linked and FX-linked rows carry `tax_bucket` "linked_25" (TXI-02, TXI-04, TXI-05). The existing records use only "unlinked_15", and the engine reads neither.
- **Hebrew:** the new `conditions_he` and `doubt_he` lines have not been through the Hebrew editor.

## What this does to the bank-deposit page (needs the lead before landing)

F-86 (`oneYearDepositRecords`) keeps one record per bank: the fixed, unlinked, 12-month record with the latest `snapshot`. The new records are dated 2026-11-06, so the latest-snapshot rule now picks each bank's alphabetically first new row instead of the row the page shows:

| Bank | Picked now | Picked before |
|---|---|---|
| Discount | 0183 (2.25, with a penalty) | 0122 (2.25) |
| Hapoalim | ספרינט (1.8, monthly exits) | פיקדון לשנה (1.74) |
| Mizrahi | 165 (2.00) | 131 (1.55) |

Sprint has monthly exit points but counts as "cannot be broken". WIN WIN and 0513 also pass the filter. `site/app/lib/guide-signature.test.ts` fails 3 tests: the F-86 range, the example deposit and the per-bank list. This finish-line work of the issue was not done, because it is the site's selection and method, not data:
- F-86 needs a rule for which row stands for a bank, for example the 447 standard type "פיקדון לשנה" without exit points.
- The grey rows for rows in doubt still need to be built: 0513 closed to the bank's own customers, WIN WIN a choice deposit, Mizrahi 189 with no single rate.

## Rule-base findings (for the domain specialist)

- **BANK-21:** the examples of each bank's closed-system offer leave out Discount's "פיקדונות ללקוחות כל הבנקים". That offer is for private individuals with no current account at Discount, has a 3-business-day rate offer, does not renew, cannot be pledged or set off, and requires the source account's owners to be the same.
- **BPN-09 or the tax files:** no rule gives the tax on a choice deposit (track A unlinked, track B CPI linkage with no interest).
- **bank-product-names row 61** (Sprint digital, 70% of accrued interest, from the 2023 brochure) disagrees with today's 447 table (100%).
- **docs/method.md F-86** says "the banks' tables print one-year rows not collected (Discount's closed-system row 0513 at 2.4%, Hapoalim's WIN WIN)". They are now collected. That sentence and the selection rule are the lead's to update.

## Data check

`npm run validate`: `data/ is valid`. The run printed only the warnings it prints on main, none about these files.

## Fix pass after the finance review (2026-11-06)

- **Mizrahi-Tefahot's four foreign-currency-linked rows were taken out** (`mizrahi-tefahot-pomelit-tzamud-{usd-530,eur-610,gbp-630,aud-660}`). A foreign-currency deposit is tier 2 (docs/product.md D2), and the rule base says FX-linked shekel deposits are not ready (`fx-and-structured-deposits.md`, "Graduation status": the agreements unread, tax not closed). The records stand in git at d2c52e8e, so they can return when that changes. What was learned, for that day:
  - The rows come from the 447 page's "פיקדונות נוספים" table (`GetNabatDeposits?depositType=additional`, "06/11/2026 08:30:52"): 530 "פומלית- צ. דולר שנה" 3.40%, 610 "פומלית- צ. אירו שנה" 2.48%, 630 "פומלית- צ. לי"ש שנה" 3.01%, 660 "פומלית-צ.דולר אוסטרלי שנה" 2.94%; each "12 חודשים", "קבועה", "צמוד מט"ח", the same rate on every amount tier, from 1,000 ₪, no exit points; channels "בנקאי אתר פעולות" (660: "בנקאי" only).
  - That table has no break or renewal column. The break came from each row's terms document (`MiniSites/Pikdonot-Terms/1_99_150_<code>.pdf`): "לא ניתן למשוך את הפיקדון לפני מועד פירעונו המוסכם", "שקלי צמוד מטבע", "סכום הפקדה מקסימלי: ללא מגבלה".
  - The records carried `tax_bucket` "linked_25" on the reading that the deposit is fully linked to the exchange rate (TXI-04: for a foreign-currency asset the index is the exchange rate). Nothing in the terms documents read says the linkage is full; that was inferred, and it goes with the records.
  - With them out, F-104 counts 24 one-year deposits, not 28; its bank counts do not change (B 4, locked 3, locked with exit points 2, Discount 10 of 10 with a penalty), and every break column F-104 reads now comes from a 447 table.
- **WIN WIN's tax is an open value.** `tax_bucket` stays null; its source's strength is now `open`, its rule is BPN-09 (which names the kind of deposit), and it no longer cites TXI-03 and TXI-05, which do not cover a best-of deposit. The bank's own statement stays quoted in its notes. The company page showed the word "null" for it; it now shows "שאלה פתוחה" with the lock, and its sheet says no source answers it yet.
- **The two CPI-linked rows.** Their tax notes no longer carry the sentence about a foreign-currency deposit's exchange rate. Mizrahi-Tefahot 331's full linkage rests on its terms document ("קרן הפיקדון והריבית עליה תוגדל או תוקטן בשיעור השינוי במדד"); Hapoalim's rests on the 447 table's linkage column alone, and its notes say so. Both cite TXI-19 (a lower bracket from age 60) beside TXI-02, TXI-04 and TXI-05.
- **Discount 0513 and 0523:** the table prints "-ללקוחות" with the dash attached to the next word, which read on the page as a stray leading dash; the name is kept as "שנה קבועה - ללקוחות כל הבנקים" (and "שנה משתנה - …"), with the printed spelling in the rate's notes.
