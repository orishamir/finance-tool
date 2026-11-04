# Bank Yahav (`yahav`): binding prices, 2026-11-04

Read on 2026-11-04 under D56. The new snapshot is `data/fees/yahav@2026-11-04.json`, copied from `yahav@2026-10-31.json`.

**In one line.** Yahav advertises no securities price that an ordinary customer can get. Its general pages say only "חיסכון בעמלות" and "עמלות מופחתות". The price list prints custody of **0.15% a quarter (0.60% a year)** in Israel and 0.19% a quarter abroad, with no waiver for anyone. The online price in Tel Aviv is **0.40% with a 20 ₪ minimum**.

**One ranked price moves (a ranking change, for its own commit).**
- The record had one conversion line at the clerk price, 0.185% (6.75$ minimum, 2,000$ maximum), and its notes said the chapter had no channel split.
- Annex E of the same price list (PDF p.43) prints a price for the channel "אינטרנט / יישומון": **0.13%, minimum 5$, maximum 1,300$**. The change notice of 16/09/2026 confirms it from 01/10/2026.
- The line is now split into `-branch` and `-direct`, as at the seven other banks. The site prices the direct channel, so a fund abroad now pays 0.13% instead of 0.185%.
- The between-currencies line is split the same way: 0.26% online, 0.37% at the clerk. The site does not read it.
- Both clerk lines gain a spread of "not limited" (agreement ch.5 s.15.1, p.44). The calculation does not read the spread.

**The standing order.**
- The agreement (ch.5 s.1.1.2, p.39) knows a "הוראת קבע לרכישת ני״ע/קרן נאמנות". No price list prints a price for one.
- Note 06's rate is for a "פעולה המבוצעת ישירות באמצעות האינטרנט". By the same reading as FIBI, Mizrahi-Tefahot and Bank of Jerusalem, a standing order pays the clerk price: **0.55% with a 32 ₪ minimum**. That is inferred.
- The record prices a purchase the reader places online each month: 0.40% with a 20 ₪ minimum. For any purchase up to 5,000 ₪ the two readings differ by 12 ₪ (32 ₪ against 20 ₪).

**Groups.** Yahav is a bank for state employees, but its price list prints no securities price for any group. Annex A has only young customers, soldiers and students, and no securities row.
- Group securities prices appear only in advertising flyers. The flyers say eligibility follows "התעריפון הרלבנטי למועדון הלקוחות", and that tariff is not published.
- The one flyer with figures that is live and linked is the **self-employed doctors' flyer** (September 2026). It is now an entry under `groups`, so `state` goes from `none_on_securities` to `prices`.
- The state employees' custody exemption is printed only in a leaflet from 11.2024 that the site no longer links. It goes to `left_out`.

## 1. Claims and verdicts

| Claim (words, where, seen) | What the binding documents say | Verdict |
|---|---|---|
| "מגוון יתרונות משתלמים לביצוע פעולות באתר ובאפליקציית שוק ההון: … חיסכון בעמלות" (/investments/stock-market, live 2026-11-04; library f84389099ba2584a) | Note 06 and annex E: online 0.4%, minimum 20 ₪, maximum 4,000 ₪, against the clerk price of 0.55%, minimum 32 ₪, maximum 6,000 ₪. Annex E also exempts an unexecuted order placed online | **Guaranteed** (every customer, no end date). The saving is on trades only; custody is the same on every channel |
| "ניתן להצטרף ללא תשלום לשירות קבלת שערי מניות עדכניים בניירות ערך זרים" (same page) | No data fee in the securities chapter. The third-party chapter passes on "תשלומים לבורסה" "לפי החיוב בפועל" | **Not found** as a price. No fee for the service is printed |
| "בגין פעולת המרה בדיגיטל ניתנת הנחה בעמלת חליפין" (/investments/foreing-currency, live; library a1b0dc6de2fee00f) | Annex E p.43: "@ עמלת חליפין", "אינטרנט / יישומון", 0.13%, minimum 5$, maximum 1,300$ (clerk price 0.185%, 6.75$, 2,000$). Change notice 16/09/2026 p.2 | **Guaranteed**. The spread is **not limited** (s.15.1: the bank's own selling rate, "הכל לפי השער הגבוה יותר") |
| Young customers: "החזר רטרואקטיבי עבור עמלות ששולמו ברבעון השלישי של שנת 2026", up to 500 ₪, ages 18 to 35, portfolio up to 450,000 ₪ on 30.09.2026, "במסגרת מתווה בנק ישראל" (/investments/trading-benefits-young, live; Wayback from 2026-06-24; library 4b5d6522bfe22050) | No terms published. The "לפרטים נוספים" link (/niyaroterech/) is refused. Annex A has no securities row | **Offer**, and closed to a new customer: it refunds a quarter that has ended. An earlier round covered Q1 2026 (ice.co.il, 13.4.2026). In `left_out` |
| State employees: "פטור מדמי ניהול פיקדון ני"ע (עמלת דמי משמרת)", "הטבות בעמלת קניה / מכירה", "פטור מעמלת אי ביצוע" (leaflet "שיווק 11.24", p.2; Wayback from 2024-12-20; library 941f7bd0ff7f160a) | The price list's custody rows print 0.15% and 0.19% a quarter with no exemption. Annex A has no state-employee row. Fine print: "הזכאות להטבות הינה לפי התעריפון הרלבנטי למועדון הלקוחות", "הבנק רשאי לשנות את התנאים בכל עת", and a salary credited from the employer is required | **Not found** in a binding document; a group offer at most. Today's page /account-management/gov-employees says only "שירותי ני"ע - עמלות מופחתות". The flyer it links reads "מסמך זה לא פורסם עדיין" |
| Doctors: "קניה/מכירה בבורסת ת"א" 0.15% / 0.12% / 0.1% for those transferring a portfolio above 200,000 / 500,000 / 1,000,000 ₪; abroad 0.25% / 0.2% / 0.15%; "עמלת דמי ניהול לרבעון" 0.05% / 0.04% / 0.02% (doctors' flyer, PDF modified 2026-09-07, p.4; library d666833e75388957) | Not in the price list. Fine print:<br>- "מותנה בהעברת פעילות עסקית חודשית בהיקף של 15,000 ₪ ומעלה"<br>- "בכפוף לעמלת מינימום", which is not printed<br>- "ההטבות הינן לשנה ויחודשו … בכפוף לשיקולי הבנק"<br>- "רשאי להפסיק או לשנות את התנאים בכל עת"<br>The rows do not name funds | **Offer** (group), printed only in advertising. Entry under `groups` |
| Free professions: "עמלות מופחתות בניירות ערך" (flyer, September 2026; library e578cc04e27c858c) | No figure | No claim to check |
| Slogan "הכי משתלם. הכי בשבילך." (page headers) | – | No claim to check |
| Monthly investment by standing order: no advert | Agreement ch.5 s.1.1.2, p.39. No price list prices it | **Guaranteed** at the clerk price, 0.55% with a 32 ₪ minimum (inferred reading) |

**The catch for an ordinary customer:**
- custody of 0.60% a year on every Israeli fund, and 0.76% abroad, with no waiver;
- a minimum of 20 ₪ a trade online and 32 ₪ at a branch;
- a fund abroad at 0.95% with a 25$ minimum, because the 0.30% online row names shares only;
- third-party costs abroad "לפי החיוב בפועל" with no ceiling;
- a conversion rate the bank sets itself;
- a current-account minimum of 4 ₪ a month.

**What customers paid (a fact, not a price).** From the exchange's sheet ("01/01/26 - 30/06/26"). The bank's own page "התפלגות עמלות ניירות ערך" prints the same figures; checked on the page image.
- Israeli custody: **0.23%** a year up to 25 thousand ₪, then 0.28, 0.28, 0.27, 0.22, 0.17, 0.13, 0.09, and **0.03%** above one million.
- Foreign custody: 0.03% to 0.37%.
- Israeli shares and bonds: 0.15% to 0.36%.
- Makam: 0.05% to 0.07%.
- Foreign trading: 0.17% to 0.42%.

## 2. The documents

| Document | URL (bank-yahav.co.il) | Printed date | File dates | Library |
|---|---|---|---|---|
| **Full tariff 2.2026, PDF and Excel (binding, newest)** | /media/fhukyxkr/22026_taarifon_male.pdf, /media/020jnu0x/…xlsx | "נכון ליום: 01/10/2026", "מספר סידורי: 2.2026" | PDF created 2026-10-15, modified 2026-10-18. The same md5 as the 31 Oct copy. The Last-Modified header is the request time | 7195a5fd275270b4, 5a675100ac5dc956 |
| Change notice | /media/0jqnbemo/notification_of_changespdf.pdf | 16/09/2026, changes from 01/10/2026 | Modified 2026-09-17 | 27bd3cacbc773066 (p.1-2: conversion fees, clerk and online) |
| General instructions to the tariff | /media/2ouezmnj/הוראות-כלליות-12026.pdf | 1.2026 | Modified 2026-07-09 | **4fb2de5e055a5ef0** (new). s.6: the bank may charge less than the tariff |
| Account opening and general terms | /media/zordhsxh/new-account-agreement.pdf | no edition printed | Created 2024-03-26, modified 2024-04-01; unchanged | 322ff632b328571c (ch.5 s.1.1.2 p.39; s.11.2, s.15.1-15.2 p.44, checked on the page images) |
| Exchange's sheet | market.tase.co.il trading_fees | list "עדכון אחרון: 01/07/26"; averages "01/01/26 - 30/06/26" | – | Read in Chrome, not filed |
| Averages page | /media/drhhivrw/securities-commissions-split.pdf | 01/01/2026-30/06/2026 | Modified 2026-07-28 | **64b0a8432e8844d8** (new) |
| Doctors' and free-professions flyers | /media/ch3bfrkq/doctors-flyer.pdf, /media/nypekqfi/professions-flyer.pdf | – | Modified 2026-09-07 | **d666833e75388957, e578cc04e27c858c** (new) |
| State-employee leaflet | /media/h01eqxjk/עובדי-מדינה-11-2024.pdf | "שיווק 11.24" | Created 2024-11-10 | **941f7bd0ff7f160a** (new). No longer linked |
| Group and investment pages | /investments/stock-market, /foreing-currency, /trading-benefits-young, /account-management/gov-employees and the other group pages | – | – | **f84389099ba2584a, a1b0dc6de2fee00f, 4b5d6522bfe22050, 90c65daa72e89374** (new) |
| Promotion terms; club tariffs; terms of the young refund | – | – | – | None published (`tried` logged twice) |

**Which is newest.** The 2.2026 tariff is the newest binding document: the change notice of 16/09/2026 announces it, and the tariff page links no later notice. On its securities chapter it matches the exchange's sheet of 01/07/26. The flyers are advertising, and each defers to a club tariff that is not published.

## 3. The ordinary customer's price (the most the documents allow)

**Case 1: an S&P 500 tracking fund or ETF in Tel Aviv, in shekels**

| Cost | Bank Yahav |
|---|---|
| Lump sum, online or app (note 06; annex E) | **0.40%, minimum 20 ₪, maximum 4,000 ₪**. Note 04 takes "קרן מחקה" and "קרן סל" into the row |
| At a branch or by phone (clerk) | 0.55%, minimum 32 ₪, maximum 6,000 ₪ |
| Monthly, bought online each month | 0.40%, minimum 20 ₪ (the record's price) |
| Monthly by standing order | no price printed; the clerk price, **0.55%, minimum 32 ₪**, by the channel reading (inferred) |
| Split order (note 07) | one minimum a day per order |
| Unexecuted order | 32 ₪ only if a clerk acted (note 08); online exempt (annex E) |
| Custody | **0.15% a quarter**, at most 8,500 ₪ a quarter per deposit, no minimum. Computed daily on closing prices. None on makam or a money-market fund (note 03) |
| Distribution fee | types 1, 3 and 4 at 0.20%, 0.35% and 0.10% a year. Note 04 excludes a tracking fund from types 1 and 3 |
| Transfer out | **5 ₪ a transfer** (supervised) plus third-party cost; at most 10 ₪ for the whole portfolio on closing |
| Dividends, inactivity, platform | none printed. Inactivity is priced only for non-resident accounts |
| Current account (part 1) | clerk action 4.00 ₪, direct action 1.20 ₪; **at least 4.00 ₪ a month** (notes 02, 07); tracks 10 ₪ or 20 ₪ |

Illustrations (inferred):
- A 67,000 ₪ account pays 402 ₪ a year in custody.
- A 500 ₪ monthly purchase pays the 20 ₪ online minimum (4%), or 32 ₪ (6.4%) by standing order on the clerk reading.

**Case 2: an ETF in the US**

| Cost | Bank Yahav |
|---|---|
| Trade | **0.95%, minimum 25$, maximum 1,500$**. The row names "קרנות נאמנות"; the online 0.30% (24$ minimum) names "מניות" only |
| Third parties abroad | "לפי החיוב בפועל": broker, custodian, exchange, and corporate-event fees (s.11.2). **Not limited** |
| Custody | 0.19% a quarter, at most 8,500 ₪ a quarter |
| Conversion online | **0.13%, minimum 5$, maximum 1,300$** (annex E) |
| Conversion by the bank or at a branch | 0.185%, minimum 6.75$, maximum 2,000$ |
| Spread | **not limited by the documents**. The bank buys currency at "שער ההזמנה להעברות והמחאות שבו הבנק נוהג למכור", "הכל לפי השער הגבוה יותר" of three days (s.15.1). Proceeds are converted at its buying rate, less the fee (s.15.2) |

Illustration (inferred): a 1,000$ purchase pays 25$ commission (2.5%), 5$ to convert online, the spread, and third-party costs.

## 4. What changed in the record

- `snapshot` is 2026-11-04. Every line's `checked` and every `availability` entry's `checked` is 2026-11-04.
- `tariff.notes` gain the re-read:
  - the md5 and the PDF dates;
  - the change notice and the general instructions;
  - annex E;
  - the exchange's sheet;
  - the agreement's clauses;
  - the absence of promotion terms and club tariffs.
- `yahav-buy-sell-tase-direct`:
  - the rate note now cites annex E's channel "אינטרנט / יישומון", replacing "names no app";
  - it adds the standing-order reading;
  - `names` gains the channel words.
- `yahav-buy-sell-foreign`: the note adds annex E.
- **`yahav-fx-conversion` → `yahav-fx-conversion-branch`**:
  - `channel` null → branch, the same 0.185%, 6.75$ and 2,000$;
  - new `spread`, null, "not limited", sourced to s.15.1, p.44.
- **New `yahav-fx-conversion-direct`**: 0.13%, minimum 5$, maximum 1,300$, channel direct, annex E p.43, with a spread of "not limited".
- `yahav-fx-conversion-fx-to-fx` → `-fx-to-fx-branch` (channel branch, 0.37%, with a spread). New `-fx-to-fx-direct`: 0.26%, 10$, 2,600$. The site filters both out.
- `groups`:
  - `state` none_on_securities → **prices**;
  - a new `row_he`;
  - one entry, kind other, "רופאים עצמאיים", with three prices, `names_fund` false, an end printed (one year, then at the bank's discretion), and `inferred` saying it is advertising only;
  - `read` grows to 7 documents.
- `left_out`: 1 → 7 entries:
  - the foreign online row, now with the exchange's "כללי" label;
  - third-party costs;
  - the standing order;
  - the current account;
  - the young refund;
  - the state-employee leaflet;
  - the averages.

**Price values changed, old → new:**
- the direct conversion: 0.185% / 6.75$ / 2,000$ → **0.13% / 5$ / 1,300$** (new line `yahav-fx-conversion-direct`; the old line kept as `-branch`);
- the direct between-currencies conversion: 0.37% / 13.5$ / 4,000$ → 0.26% / 10$ / 2,600$ (not read by the site);
- the spread on the two clerk lines: absent → null ("not limited", not read).

`npm run validate`: data/ is valid, with the usual warnings only. `npx vitest run`: 101 files, 1499 passed, 1 todo, **0 failed**. No note on a priced line uses a word of doubt.

## 5. Still open

- **The automatic conversion.** When a reader buys abroad without dollars in the account, s.15.1 has the bank buy them "בתוספת עמלת מס חליפין" and names no channel. The record treats that as the clerk price and prices the reader's own online conversion at 0.13%. A written answer from the bank (*2616) or a customer's statement would settle which fee an automatic conversion pays.
- **The standing order's price** (0.40% or 0.55%; 20 ₪ or 32 ₪). It is the same open question as at the other banks, and the same answer would settle it.
- **The foreign online row and funds.** The price list's note 08 and annex E say "מניות". The exchange's sheet, which the bank supplies, says "מניות, אג"ח, קרנות נאמנות - כללי". The record keeps 0.95% for a fund abroad. A written answer would settle it; if the bank confirms funds, the price would fall to 0.30% with a 24$ minimum.
- **Club tariffs.** Every flyer defers to "התעריפון הרלבנטי למועדון הלקוחות", and none is published. A copy from the bank would turn the doctors' and state employees' prices into binding ones.
- **Third-party costs abroad** have no ceiling at all, unlike Jerusalem's 3%. Like the other banks, they are kept out of the price (a decision for the lead or founder).
- **The current account (decision for all banks):** at least 4 ₪ a month (48 ₪ a year); young customers, soldiers and students are exempt.
- **For other houses:** nothing found. Yahav routes foreign orders through a "ברוקר כללי" (customer-information document, July 2025), whose name it does not give.
- **Tabs.** I opened one Chrome tab for the bank's pages (the tariff list is drawn by script) and the exchange's sheet, and closed it; the group is gone. Two tabs that another session opened (xnes on the Wayback Machine, interactivebrokers.com) appeared in the same group meanwhile. I did not touch them, and they were gone when I closed mine. curl fetched every file at four-second intervals with no block.

## Contradicted advertising

None found. The binding documents contradict no live claim:
- "חיסכון בעמלות" is true of the online trade price.
- "הנחה בעמלת חליפין" for digital conversion is printed in annex E.

The state employees' "פטור מדמי ניהול פיקדון ני"ע (עמלת דמי משמרת)" (leaflet 11.24) is printed in no binding document; the price list's custody row reads "0.15% לרבעון". That claim is two years old and the site no longer links it, so it is in `left_out`, not shown here as a live contradiction.
