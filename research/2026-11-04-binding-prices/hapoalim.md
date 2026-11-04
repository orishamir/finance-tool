# Bank Hapoalim (`hapoalim`): binding prices, 2026-11-04

Read on 2026-11-04 under D56. The new snapshot is `data/fees/hapoalim@2026-11-04.json`, copied from `hapoalim@2026-10-31.json`.

**In one line.** Hapoalim advertises no securities price that an ordinary customer can get today. The price list prints custody of **0.15% a quarter in Israel (0.60% a year)** and 0.20% a quarter abroad, with no waiver open to an ordinary new customer.

**No price moves.** I added one line, transfer out at 5 ₪, which the calculation does not read.

**The standing order.**
- The general terms allow a purchase by standing order, but the price list prints no price for one.
- The reduced online rate covers only "פעולה המבוצעת ישירות באמצעות האינטרנט". By the same reading as FIBI, a standing order would pay the branch rate, 0.60% with a 26 ₪ minimum. That is inferred: no Hapoalim document says it.
- A purchase the reader places online each month pays 0.40% with a 20 ₪ minimum. That is what the record prices, and it is the lower of the two. The record keeps no standing-order line.

**The loud advert has ended.** The page "צעירים משקיעים בחינם" ("0 עמלות מסחר בדיגיטל ו-0 דמי ניהול") is still live. Its own fine print ends the refunds on 30.6.2026, and no binding document has it.

## 1. Claims and verdicts

| Claim (words, where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| "צעירים משקיעים בחינם", "0 עמלות מסחר בדיגיטל ו-0 דמי ניהול בניירות ערך בארץ ובחו"ל" (capital-market/trade-package-info; Wayback since 2025-11-26; library 97281897a61a02a9) | The page's own terms:<br>- ages 18-35 or the student club<br>- a refund of fees already charged, "עד להחזר מקסימלי בסך 2,000 ₪ לרבעון"<br>- existing customers 1.7.2025-31.12.2025; new customers who joined 23.11.2025-31.3.2026, refunds "עד ל- 30.6.2026"<br>- digital actions only; "הבנק רשאי להאריך או לשנות את תוקף ההטבה"<br>Not in annex A or any binding document | **Offer, ended** 30.6.2026. In `left_out` |
| Poalim Plus: "הטבות בעמלות ניירות ערך" (open-account/poalim-plus; library 7e6de8c6c17a9800) | No figure on the page. Its conditions:<br>- a new account opened 1.10-31.12.2026<br>- a net salary from 10,000 ₪ (joint 15,000 ₪)<br>- three years<br>Annex A has no Poalim Plus club. The linked terms (library 074b3666da413df1) cover the April-June grant offer only | **Not found** (no price stated; salary condition). In `left_out` |
| Student page: "הנחה בעמלות ני"ע ומט"ח: בכפוף לעמלת המינימום והמקסימום" | Annex A, student club: direct channels "מניות 0.35%, אגרות חוב 0.25%"; ages 18-35, 3 years, up to 5 | **Offer** (group). Already under `groups`, unchanged |
| Broker-fee page: "מניות בבורסות ארה"ב: עמלה של 0.4 סנט למניה, מינימום 3$ לעסקה"; "עמלות הברוקר עשויות להשתנות מעת לעת" | Third-party chapter, row 2089: "הוצאות ברוקר-ארה"ב \| $0.40 סנט למניה \| $1.00 \| $3,000.00" | **Contradicted on the minimum**: the page's minimum (3$) is above the price list's (1$). In `left_out` |
| bit, Poalim Wonder, HighTech Zone, PRO, young and wedding pages | No securities claim. bit offers deposits ("ריביט") only | No claim to check |
| Capital-market and MyTrade pages | "הפעולות עשויות להיות כרוכות בעמלות על פי תעריפון הבנק". No fee claim | No claim to check |
| Monthly investment by standing order: no advert | General terms 09.23, securities chapter s.4.2.2 (p.25) "הוראת רכישה המתנהלת בהוראת קבע" and s.20.4 (p.27). The price list prints no standing-order price. Note (07) (row 962): the 0.40% is "עבור פעולה המבוצעת ישירות באמצעות האינטרנט" | **Guaranteed** at the branch rate, 0.60% with a 26 ₪ minimum (inferred reading); an online purchase each month pays 0.40% with a 20 ₪ minimum |

**The catch for an ordinary customer:**
- Custody of 0.60% a year on every fund, including a tracking fund, with no waiver open.
- A minimum of 20 ₪ a trade online.
- A fund abroad pays 0.90% with a $25 minimum: the lower online rates name shares only.
- Broker costs abroad, and custodian costs abroad with no ceiling.
- A conversion rate the bank publishes itself.
- A foreign-currency account with no activity for 12 months or more pays $7.50 a quarter (balance up to $100) or $12 a year (above $100), rows 1905-1906.
- The current account's monthly minimum of up to 5.30 ₪.

**What customers paid (a fact, not a price).** These figures appear both on the bank's sheet (library ef2681f813a11810, period 1.1–30.6.2026; "לגבי דמי ניהול יוצג שיעור עמלה שנתי בפועל") and on the exchange's sheet, which agree:
- Israeli custody: **0.30%** (up to 25 thousand ₪), 0.33 to 0.40 up to 200 thousand, then falling to **0.08%** above 1,000 thousand.
- Foreign custody: 0.07 to 0.39.
- Israeli shares and bonds: 0.15 to 0.30.
- Foreign trading: 0.14 to 0.35.

## 2. The documents

| Document | URL (bankhapoalim.co.il) | Printed date | File dates | Library |
|---|---|---|---|---|
| Full tariff, sheet (binding, **newest**) | /sites/default/files/media/PDFS/Taarifon/single_small_51026.xls | "נכון ליום: 05/10/2026" | Last-Modified 2026-10-07; md5 4fa41eb7…, the same file as on 31 Oct | e939af51e5b97376 |
| Full tariff, PDF (its twin; Type 3 font, read on page images) | …/Taarifon/single_small_51026.pdf | 05.10.26 on each page | Created 2026-10-05 16:10 | 40bd62035edbad6f |
| Annex E, own file | …/Taarifon/145.pdf | "נכון ליום: 02/08/2026" | Created 2026-07-27, modified 2026-08-05 | **0c2a960bbbf4ee62** (new) |
| Short tariff with annexes A and E | …/Taarifon/united_23926.pdf | "נכון ליום: 01/10/2026" | Created 2026-03-04, modified 2026-09-24 | **41f643f8f9216975** (new) |
| Annex A, own file | …/Taarifon/nsph_wklwsywt.pdf | "נכון ליום: 24/12/2023" | Modified 2023-12-24; matches the sheet's club rows | **9d582d194457104f** (new) |
| General terms, adult (with the securities chapters) | /api/media/rvvhcfel/account-opening-request-adult-0923.pdf | 09.23 | Still the one the standard-contract page links | 5164629834e3d870; chapters alone 7f80485c391113cb |
| Fee-distribution sheet | …/PDFS/hitpalgut-amalot.pdf | 1.1.26-30.6.26 | Created 2026-07-08, Last-Modified 2026-07-12 | **ef2681f813a11810** (new) |
| Poalim Plus terms | …/PDFS/Takanon/takanon_poalim_plus_april_2026.pdf (the page's /api/media/ link returns "Media not found") | 1.4.2026-30.6.2026 | Created 2026-03-25 | **074b3666da413df1** (new; image only, read on page 1) |
| Pages: young package, broker fee, Poalim Plus, capital market | /he/capital-market/trade-package-info; /capital-market/broker-fee; /he/open-account/poalim-plus; /he/capital-market | – | Fetched 2026-11-04 | **97281897a61a02a9, 9b5d92333f96fc63, 7e6de8c6c17a9800, b613ef4925ba65f1** |
| Change notices | /he/taarifon-change | the notice of 1.11.2021 only | – | not filed |
| Exchange's sheet | market.tase.co.il/he/market_data/trading_fees | list "עדכון אחרון: 26/01/25"; averages "01/01/26 - 30/06/26" | – | Read in Chrome, not filed. It matches the tariff |
| Account agreement with a securities fee annex | not published | – | – | `tried` logged |

**Which is newest.** The full tariff of 05/10/2026 is the newest binding document. The fee-list page links it, and its securities and conversion figures equal annex E (02/08/2026) and the short tariff (01/10/2026). The bank links no change notice after 2021, and no promotion terms with a securities price are open.

## 3. The ordinary customer's price (the most the documents allow)

**Case 1: an S&P 500 tracking fund or ETF in Tel Aviv, in shekels**

| Cost | Hapoalim |
|---|---|
| Lump sum, online (note 07; annex E) | **0.40%, min 20 ₪, max 7,000 ₪** per trade. Note (05): a mutual fund pays no trade fee, "אך לרבות "קרן מחקה"" and a fund listed on the exchange |
| At a branch (row 947) | 0.60%, min 26 ₪, max 7,500 ₪ |
| Monthly, bought online each month | 0.40%, min 20 ₪ (the record's price) |
| Monthly by standing order | no price printed; the branch rate, **0.60%, min 26 ₪**, by the reading of note (07) (inferred) |
| Fee cap per trade (note 06) | 25% of the trade |
| Custody (rows 981, 1005) | **0.15% a quarter**, at most 10,600 ₪ per security and 10,600 ₪ per deposit a quarter; none on makam or a money-market fund (note 12) |
| Distribution fee (rows 1049-1051) | 0.20%, 0.35% or 0.10% a year on a fund's units; note (03) "למעט "קרן מחקה"" and listed funds, so **none** for this reader |
| Transfer out (row 1009) | **5 ₪** per transfer, plus exchange costs; on closing at most 10 ₪ with third-party costs (note 11) |
| Dividends, inactivity, platform | none printed for securities. "שירותי מידע" (row 2087, exchange payments, "לפי החיוב בפועל") prints no trigger; see section 5 |
| Current account (rows 697, 705, 752-753) | minimum **up to 5.30 ₪ a month**; direct action 1.75 ₪, and a standing-order debit counts as one; tracks 10 or 22 ₪ |

Illustrations (inferred):
- A 67,000 ₪ account pays 402 ₪ a year in custody.
- A 500 ₪ monthly purchase online pays 20 ₪ (4%) each time; the minimum binds up to 5,000 ₪ a month.
- By standing order, if the branch reading holds, the same purchase pays 26 ₪ (5.2%).

**Case 2: an ETF in the US**

| Cost | Hapoalim |
|---|---|
| Trade (row 979) | **0.90%, min $25, max $7,500**, any channel. The online 0.30% (US) and 0.50% (elsewhere) name "מניות" only (`left_out`, D42) |
| Broker (row 2089) | 0.40 cent a share, min $1, max $3,000, plus local taxes and levies |
| Custodian costs abroad (note 04) | **not limited**: passed on, with no amount or ceiling printed |
| Custody (row 1006) | 0.20% a quarter, max 10,600 per security and per deposit |
| Conversion online (annex E) | 0.17%, min $5.70, max $2,300 (up to $99: $3.30); branch 0.19%, min $6.70, max $2,700 |
| Spread | **not limited by the documents**. The bank's "שער המכירה/הקנייה המקובל בבנק" is the "העברות/ המחאות / מזומנים" rate "המתפרסם מדי פעם על ידי הבנק" (general terms, defs 34.61-34.62, p.15) |
| Foreign-currency account with no activity for 12 months or more (rows 1905-1906) | $7.50 a quarter (balance up to $100); $12 a year (above $100) |

## 4. What changed in the record

- `snapshot` is 2026-11-04. Every `checked` is 2026-11-04.
- `tariff.notes` gain the re-read:
  - the md5, the PDF and HTTP dates, and which file is newest;
  - annex E, annex A and the short tariff;
  - the change-notice page, the exchange's sheet, and the absence of an agreement annex.
- `hapoalim-buy-sell-tase-direct` notes: the standing-order reading (section 1). No standing-order line is added, since one would be dearer than the purchase online each month.
- `hapoalim-buy-sell-foreign` and `hapoalim-custody-foreign` notes: the broker row, and custodian costs "not limited". The advert's minimum is noted beside them.
- Both FX `spread.notes`: "Not limited by the documents", now citing the general terms (p.15). The value is still null.
- **New line** `hapoalim-transfer-out-same-client`: 5 ₪ (row 1009), the same shape as FIBI's and Discount's. The calculation does not read `transfer_out`.
- `groups.note`: re-checked against annex A (24/12/2023) and the short tariff (01/10/2026). The entries, ages and periods are unchanged.
- `left_out`: 1 entry becomes 7. The new ones are:
  - the ended young package;
  - Poalim Plus;
  - third-party costs abroad;
  - the "עמלת קסטודיאן" row;
  - the current account;
  - the averages.

**Price values changed, old → new:** none.

`npm run validate`: data/ is valid, with the usual warnings only.

`npx vitest run`: 101 files, 1499 passed, 1 todo, 0 failed. A first wording of the standing-order note tripped `packages/pipeline/test/price-premises.test.ts` (its doubt words on a priced line). I reworded the note; the test was not touched.

## 5. Still open

- **The standing order's price.** Does Hapoalim charge a monthly fund purchase by standing order at 0.40% or at 0.60%, and with which minimum? Can one be set up online?
  - The reading rests on note (07) and on FIBI's own documents for the same wording.
  - A written answer from the bank (*2405, the number on its joining page) or a customer's statement would settle it.
  - It moves no price today, because the record prices the online purchase.
- **"עמלת קסטודיאן" 0.01%, min 20 ₪, max 500 ₪ per security** (row 1054, PDF p.48, checked on the page image). Note (05) says only "כולל אופציות וחוזים עתידיים על נכסי בסיס במעו"ף", and what it is charged on is not printed. It is not priced, as at Leumi, Discount and Meitav Trade.
- **"שירותי מידע" 202 / 15,318 ₪** (row 2087, exchange payments, "לפי החיוב בפועל"). Nothing says that an ordinary customer's trading screen triggers it. Not priced.
- **Third-party costs abroad (decision for the lead or founder).** The broker charge is printed with a ceiling; custodian costs have none. These are kept out of the price, as for FIBI.
- **The current account (decision for all banks):** up to 5.30 ₪ a month.
- **For other houses:** nothing found.
- **Tabs.** One Chrome tab was opened (the exchange's sheet) and closed. The group is empty.

## Contradicted advertising

- Young package page (live 2026-11-04): "0 עמלות מסחר בדיגיטל ו-0 דמי ניהול בניירות ערך בארץ ובחו"ל". The price list says "0.40%" online (note 07) and "0.15% לרבעון" custody (row 981). The page's own terms ended the refunds on 30.6.2026.
- Broker-fee page: "עמלה של 0.4 סנט למניה, מינימום 3$ לעסקה". The price list says "$0.40 סנט למניה \| $1.00 \| $3,000.00" (row 2089). The advert is dearer than the price list, not cheaper.
