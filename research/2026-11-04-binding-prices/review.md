# Independent review of three price records (2026-11-04)

The reviewer worked from the documents and the three data files only. It did not read the researchers'
notes in this folder or the commit messages. Every price-list quote below was checked on the page image
(`pdftoppm`). The live documents were fetched again on 2026-11-04:

- **Altshuler:** the PDF is byte-identical to library 500b2b74e04bd53e (md5 912bc1f6).
- **Meitav:** the PDF is byte-identical to 3ec196cf860a522c (md5 a426a621).
- **Psagot:** the tariff page is unchanged (dateModified 2026-08-09) and carries the same lines as PDF
  40313c4c1c6f1d21. The landing page is unchanged (2026-09-17). The January 2026 PDF (6aa0467f9b7f4207)
  has the same figures.

The exchange's fee calculator was read in Chrome for Psagot and One Zero, and the tab was closed afterwards.

Verdicts: CONFIRMED means the document was checked and the record is wrong. PLAUSIBLE means likely but not
proven. NONE means nothing was found.

## 1. Psagot Trade (`psagot@2026-11-04.json`): the top pick

| # | Checked | Verdict |
|---|---|---|
| P1 | Buying or selling a share or ETF: "0.07% משווי העיסקה, מינימום 2₪ לפעולה" (part 4(א)1). A mutual fund, including a tracking fund, pays the same (4(א)2). | NONE: the record matches. |
| P2 | Custody: "דמי משמרת 0.12%", collection "גבייה רבעונית 0.03%" (4(א)8, p.5). That is 0.12% a year, collected as 0.03% a quarter. The exchange's member sheet (updated 10/08/26) agrees: "0.0300% לרבעון", **minimum "0.00% לרבעון"**. | NONE: the period is read correctly and there is no minimum. |
| P3 | Account fee: "דמי שימוש/דמי טיפול ללא עלות". A second account: "ללא עלות" (part 6, items 1 and 2). | NONE |
| P4 | Data: delayed Tel Aviv quotes "ללא תשלום". Level 1 costs 4.60 NIS and Level 2 costs 40.32 NIS a month (part 6, item 3), and both are optional. | NONE: rightly left out. |
| P5 | Deposits and transfers into Psagot: "הפקדה – ללא עלות" (part 1). A transfer out by RTGS costs 27 NIS. Dividend or interest handling, inactivity fees and standing-order fees: no line in any of the 7 pages. | NONE |
| P6 | Part 7 ("שירותי תפעול לחברות"), where the account-opening fee is set "בהתאם להסכם", applies to companies, not to retail customers. | NONE |
| P7 | Advertising: "פטור מלא מדמי ניהול ללא הגבלת זמן". The record keeps custody at 0.12%, so it does not price from advertising. | NONE |
| P8 | The record cites the 10,000 NIS minimum to open from the landing page's small print, a page that D56 does not count as binding. It is a condition of opening, not a price. The plan under review starts at exactly 10,000 NIS. | NONE for the price. A reader with less than 10,000 NIS cannot open this account. |
| P9 | The binding fee annex is not published. The landing page says the account is "כפוף... להסכם פתיחת החשבון... ולתעריפון", and the tariff keeps the right to change fees "לפי שיקול דעתה". The exchange's averages for H1 2026 show 0% custody actually collected in every portfolio band. | PLAUSIBLE: the signed annex may differ from the public tariff, in either direction. It cannot be checked without a customer's annex. |
| P10 | Cost outside Psagot's documents: the monthly 500 NIS must be sent from the reader's bank. Psagot charges nothing to receive it. Any outgoing-transfer fee is set by the sending bank's own price list and is not in this record. This applies to every non-bank house, and not to Leumi or One Zero. | PLAUSIBLE comparison gap. Its size depends on the reader's bank and was not checked. |

I found no omitted fee and no wrongly read period in the Psagot record.

## 2. Altshuler Shaham Trade (`altshuler-trade@2026-11-04.json`)

| # | Checked | Verdict |
|---|---|---|
| A1 | Shares: "0.15% מינימום ₪ 3.5". Makam: "0.1%, מינימום ₪ 3.5" (p.1). | NONE |
| A2 | Funds and ETFs: "0.15%, מינימום ₪ 16". The notes column says "קרנות סל במסלול מסחר רציף, מינימום ₪ 3.5" (4(א)5, p.2). The record's `min` is 16 for every unit in `applies_to`, including `etf_units`. The 3.5 appears only in the notes, which no calculation reads. | **CONFIRMED (overprices)**: an ETF in continuous trading, which covers the Tel Aviv S&P 500 ETFs, has a printed minimum of 3.5 NIS, not 16. On a 500 NIS monthly buy this is 12.5 NIS too much per buy, about 150 NIS a year. The house stays last either way. |
| A3 | Custody: "0.15%, מינימום ₪ 75 לחודש", collected "אחת לחודש", on the whole portfolio including fund units (4(א)10, p.2). The tariff prints no period for the 0.15%. The record takes "a year" from the member sheet. | PLAUSIBLE inconsistency, with no effect on the price. Here the record takes the cheaper reading from the member sheet, while for Meitav the sheet gives the dearer one. Read alone, D56 would allow 0.15% a month. At the 75 NIS monthly minimum the percentage binds only above 600,000 NIS (yearly reading) or 50,000 NIS (monthly reading). Under the monthly reading, the plan's balance passes 50,000 NIS around year 5, and the yearly reading would then be priced too low. |
| A4 | Periodic management fee: "דמי ניהול תקופתיים עד ₪ 80 אחת לחודש" (part 9, item 1, p.3). It is priced at the 80 NIS ceiling, as a separate line from custody. | NONE: the tariff prints both lines, and D56 prices an "up to" fee at its ceiling. |
| A5 | Currency: conversion fee "פטור", spread "עד 0.7%". | NONE |
| A6 | Promotion terms (e99ac8ffb6741bb3): the offer requires a new customer, 5,000 NIS, "ביצוע תדיר של עסקאות" at the company's "שיקול דעתה הבלעדי", and it runs "עד להחלטה אחרת". The benefits sit in fee annex B, which is not published. The record treats it as an offer and does not rank it. | NONE |
| A7 | Interest or dividend handling: "0.3% מסכום הריבית/דיבידנד" (4(ב)5). It is left out with a reason. | NONE. It matters only for a distributing fund. |
| A8 | Anything priced that the documents do not print? | NONE found. The 5,000 NIS minimum comes from the company's deposit page, not the tariff, and it is a condition, not a price. |

## 3. Meitav Trade (`meitav-trade@2026-11-04.json`)

| # | Checked | Verdict |
|---|---|---|
| M1 | Tel Aviv securities, including funds and ETFs: "0.3%, מינימום 10 ₪ לעסקה". Makam: "0.1%, מינימום 10 ₪" (4(א)1–2, p.2). There is no separate fund line. | NONE |
| M2 | Custody: "דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות) 0.15%, מינימום 270 ₪ לרבעון" (4(א)8, p.3). The record reads 0.15% a quarter, which is 0.6% a year, and the member sheet's "0.6000% לשנה, 90 ₪ לחודש" backs that reading. | NONE. The Hebrew alone could be read as 0.15% a year, but the member sheet settles it. |
| M3 | Account fee: "דמי שימוש/ טיפול עד 90 ₪ אחת לחודש" (part 9, item 1, p.5), priced at 90. Currency: exchange fee "0.13%", spread "עד 0.8%". | NONE |
| M4 | The version printed on every page is "גרסת 04/2026". No newer version was found. | NONE |
| M5 | Promotion terms: dcecc52b58613c1e (reservists) and a7aaf9628ee8db97 (Meitav Gemel customers, 2024). Both are conditional or group offers ("פטור מדמי טיפול" for 4 years and for 2 years, a gift of 200 NIS, and "רשאית... לשנות... ללא הודעה"). None is in the price. | NONE |
| M6 | The optional "מערכות מסחר מתקדמות/ציטוטים עד 3,000 ₪" line. The tariff does not say whether the basic platform needs it. | PLAUSIBLE: not settled by the documents, as for Altshuler. Correctly left unpriced. |
| M7 | Anything priced that the documents do not print? | NONE found. |

## 4. Comparison: Tel Aviv S&P 500 tracking fund, 10,000 NIS now plus 500 NIS a month, 10 years, 7% a year before costs

The script is `/tmp/claude-1000/-home-ori-dev-finance-tool/bdca10f8-7a3e-4d74-863d-a9dbebab59aa/scratchpad/calc/plan.py` (scratchpad, not in the repository), my own; it is not the site's engine. It uses only the figures
printed in the price lists. One Zero's figures were checked against the exchange's member sheet (updated
26/07/26): "0.3000%", minimum 30 NIS, maximum 6,000 NIS, custody 0% a quarter. **Leumi's figures were
taken from its record and not re-checked against its PDF.**

Assumptions:

- Growth is compounded monthly at 1.07^(1/12).
- The 500 NIS goes in at the end of each month, and the buy fee comes out of it.
- Fees are taken from the account.
- Quarterly custody is charged on the balance at the end of each quarter.
- Altshuler's custody is 0.15%/12 each month with the 75 NIS minimum, plus the 80 NIS fee.
- Everything is sold at the end of year 10 at the sale fee.
- The fund's own management fee is the same at every house and is left out, as are tax and the sending
  bank's transfer fees.
- "Value lost" is the final value without any costs minus the net value. Without any costs the plan
  grows to 105,197 NIS.

| House, at list price | Fees, year 1 | Fees paid, 10 years | Value lost by year 10 | Net value |
|---|---:|---:|---:|---:|
| **Psagot** (0.07% min 2; custody 0.12%/yr) | 47 | 950 | **1,233** | 103,964 |
| One Zero, no plan (0.3% min 30 max 6,000; custody 0) | 390 | 3,930 | 5,491 | 99,707 |
| One Zero, ONE plan (49/month; 0.1% min 10) | 718 | 7,185 | 10,207 | 94,991 |
| Leumi, direct; monthly by standing order (0.225% min 5; custody 0.15%/quarter, at most 3,700) | 182 | 4,116 | 5,265 | 99,932 |
| Leumi, direct; monthly by hand (0.4% min 26) | 433 | 6,527 | 8,725 | 96,472 |
| Altshuler, ETF (min 3.5; 75 custody + 80 fee a month) | 1,917 | 19,152 | 27,258 | 77,939 |
| Altshuler, as recorded (min 16) | 2,068 | 20,650 | 29,395 | 75,802 |
| Meitav (0.3% min 10; 270 a quarter + 90 a month) | 2,310 | 23,048 | 32,690 | 72,507 |
| *Psagot if custody were 0, as advertised (not a price)* | *31* | *320* | *429* | *104,768* |

Fixed yearly cost, the part that does not depend on the balance:

| House | Fixed yearly cost |
|---|---:|
| Psagot | 0 |
| One Zero | 0 |
| Leumi | 0 |
| Altshuler | 960 NIS fee + 900 NIS custody minimum = 1,860 NIS |
| Meitav | 1,080 NIS fee + 1,080 NIS custody minimum = 2,160 NIS |

**Verdict on this plan:** Psagot beats One Zero by about 4,260 NIS and Leumi by about 4,030 NIS of value
after 10 years, which is about 4% of the final value. The 500 NIS monthly buy drives this. Psagot's 2 NIS
minimum against One Zero's 30 NIS (and Leumi's 5 NIS standing-order minimum plus 0.6% a year custody)
outweighs Psagot's 0.12% a year custody at these balances.

**What the answer depends on.** I ran the same script on other plans (value lost by year 10, NIS):

| Plan | Psagot | One Zero | Leumi |
|---|---:|---:|---:|
| 10,000 NIS now + 2,000 NIS a month | 3,129 | 6,260 | 14,707 |
| 100,000 NIS now, nothing monthly | 2,619 | 1,179 | 12,943 |
| 300,000 NIS now, nothing monthly | 7,857 | 3,536 | 38,830 |

- **Lump sum or monthly buys.** For a lump sum with few trades, **One Zero wins**: 0.3% to buy plus
  0.3% to sell, with no custody, costs less than 0.14% in trades plus 0.12% a year once it is held
  for more than about 4 years. Psagot wins whenever there are frequent small buys. With monthly buys of 500 NIS,
  the switch to One Zero comes only at a balance of roughly 280,000 NIS (336 NIS of extra minimums a
  year divided by 0.12%).
- **Psagot's signed annex and future changes.** The tariff is undated and changeable at Psagot's
  discretion (P9).
- **The cost of sending money from the reader's bank to Psagot each month (P10).** It is not counted
  here. At 120 transfers, a fee of a few NIS each would narrow the gap but not close it, unless it
  exceeded about 35 NIS a transfer.
- **Leumi.** Whether the standing-order tracking-fund line covers an ETF, and Leumi's current-account
  fees, were not re-checked.

## Summary for the lead

- **Psagot's record:** no finding changes its price. The top pick holds on this plan, by about 4,000 NIS
  over 10 years. It would not hold for a lump-sum reader, for whom One Zero is cheaper.
- **Altshuler (A2):** one CONFIRMED error that overprices it. ETF buys carry the 16 NIS minimum instead
  of the printed 3.5 NIS for continuous trading. The house stays last.
- **Meitav:** the record matches its documents.
