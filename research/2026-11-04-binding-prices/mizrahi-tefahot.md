# Bank Mizrahi-Tefahot (`mizrahi-tefahot`): binding prices, 2026-11-04

Read on 2026-11-04 under D56. The new snapshot is `data/fees/mizrahi-tefahot@2026-11-04.json`, copied from `mizrahi-tefahot@2026-10-31.json`.

**In one line.** Mizrahi-Tefahot advertises no securities price that an ordinary customer can get. The price list prints custody of **0.175% a quarter in Israel (0.70% a year)** and 0.195% a quarter abroad, with no waiver open to an ordinary new customer. The online minimum is **45 ₪ a trade**.

**No ranked price moves.** Three changes:
- I added one line, transfer out at 5 ₪, which the calculation does not read.
- The branch conversion line's spread goes from 2 to "not limited", which the calculation does not read either.
- The doubt in the foreign custody line's note is settled, so that line leaves the test's list of leftovers.

**The standing order.**
- The general securities terms know a "הוראת קבע לרכישת ני"ע" (7.2025, s.5.7.2, p.2). The price list prints no price for one.
- Annex E gives its lower prices to the channel "שירות האינטרנט" only. A standing order is carried out by the bank, so the most the documents allow is the clerk price: **0.64%, with a 50 ₪ minimum**. That is inferred, by the same reading as FIBI and Hapoalim; no Mizrahi document says it in words.
- A purchase the reader places online each month pays 0.52% with a 45 ₪ minimum. That is what the record prices, and it is the lower of the two. The record keeps no standing-order line.

**The only open offers are joining refunds.** New salaried customers get up to 500 ₪ a year for three years, and only with a salary condition. They appear on account pages alone, in no binding document.

## 1. Claims and verdicts

| Claim (words, where, seen) | What the binding documents say | Verdict |
|---|---|---|
| Young and soldier account pages: "0.4% עמלת קנייה/מכירה של ני"ע בבורסת בתל אביב, אך לא פחות מהעמלה המזערית" (Wayback 2026-05-21 and 2026-09-13; live crawl 2026-11-04; library bd6b289ec5246358, c0940a7266d99c8a) | Annex A ('13.01.2026', pp.33-34), fee 4.1: "0.40% עמלה מופחתת, אך לא פחות מהעמלה המזערית". Young: ages 14 to 21.5. Soldiers: automatic to 21.5, then on proof. Released soldiers: 3 years or to age 30. Students: 4 years or to age 35. Not for an account with a portfolio manager | **Offer** (group). Already under `groups`; re-checked, unchanged |
| The same pages: "50% הנחה על עמלת חליפין ... הטבות בשער חליפין" | Annex A, 5.1.1: 50% off, at least the minimum, and "3 פרומיל הטבת שער ברכישה ובהמרת מט"ח" | **Offer** (group). In `groups.note`; the schema has no group price for conversion |
| Favoured-employee, managers' and Priority pages: "החזר הוצאות עד 1,500 ₪"; fine print "החזר כלל העמלות בגין פעילות עו"ש, ני"ע ומט"ח עד 500 ₪ בשנה למשך 3 שנים, לא כולל הוצאות צד ג'". Employee page: up to 250 ₪ a year (live 2026-11-04; Wayback 2026-09-13 and 2026-10-11; library 366aff319792dd68, fb096743cb2d921d, 2f009d41deb7b30b, 5a881595c9b3de30) | Conditions on the page only:<br>- new customers who never had a joining benefit<br>- a new salary of 7,000 / 12,000 / 30,000 ₪ net (or 20,000 ₪ with 200,000 ₪ in assets)<br>- 6 to 8 initiated actions a month<br>- one benefit to choose among several<br>- "בכפוף לשיקול דעת הבנק"; "הבנק רשאי לשנות את התנאים בכל עת ללא הודעה מוקדמת"<br>No annex row and no promotion terms | **Not found** in a binding document (a capped refund with a salary condition). In `left_out` |
| Account pages: "הטבות בעמלות ני"ע ומט"ח מותאמות אישית לפעילות" | No figure | No claim to check |
| High-tech page: "מסלולים אטרקטיביים למסחר בשוק ההון" (live 2026-11-04; no Wayback copy); "הבנק רשאי לשנות את תנאי השירות או להפסיקו בכל עת" | No figure; annex A has no high-tech group | No claim to check |
| Capital-market hub, trade room, magazine | No fee claim. The S&P 500 and Nasdaq items are structured deposits, not securities | No claim to check |
| Monthly investment by standing order: no advert | Securities terms s.5.7.2 (p.2) know one. The price list prints no price; annex E prices only "שירות האינטרנט" | **Guaranteed** at the clerk price, 0.64% with a 50 ₪ minimum (inferred reading). A purchase made online each month pays 0.52% with a 45 ₪ minimum |

**The catch for an ordinary customer:**
- Custody of 0.70% a year on every fund, including a tracking fund, with no waiver open.
- A minimum of 45 ₪ a trade online, 50 ₪ at a branch.
- Third-party costs abroad, partly without a ceiling.
- A conversion rate the bank sets itself.
- The current account's monthly minimum of 6.80 ₪.

**What customers paid (a fact, not a price).** These figures come from the exchange's sheet, '01/01/26 - 30/06/26', and the bank's own page brokerage/amalot.
- Israeli custody: **0.22%** (up to 25 thousand ₪), then 0.44, 0.43, 0.41, 0.30, 0.30, 0.24, 0.21, and **0.08%** above 1,000 thousand.
- Foreign custody: 0.11 to 0.43.
- Israeli shares and bonds: 0.13 to 0.32.
- Foreign trading: 0.12 to 0.34.

## 2. The documents

| Document | URL (mizrahi-tefahot.co.il) | Printed date | File dates | Library |
|---|---|---|---|---|
| Full tariff, combined file (binding, **newest**) | /media/smallbusinessMeugad.pdf | per part:<br>- part 1 "01/10/2026"<br>- part 4 "02/04/2024"<br>- part 5 "11.7.2025"<br>- part 11 "18/08/2026"<br>- annex A "13.01.2026"<br>- annex E "12/08/2025" | Last-Modified 2026-10-20; ModDate 2026-10-20; md5 5facf477…, the same file as on 31 Oct | 8dedbb45235cd662 |
| Separate parts 1, 4, 5, 11 | /media/smallbusiness1.pdf, 4, 5, 11 | the same dates | part 4 created 2024-04-01, modified 2025-02-24; part 11 created 2026-09-24; all Last-Modified 2026-10-20 | not filed (identical to the combined file's pages) |
| General securities terms (0607-01) | /media/y45f5v3m/… | 7.2025 | – | 97e568f32eb2e075 (s.5.7.2 p.2; s.7.3, s.10 p.3) |
| General account terms (601-01) | /media/tckjpll1/… | 8.2025 | – | 75ad7686ca92ccd9 ("שער אחיד", p.6). The 1.2026 edition (9c29d0681b4ab0e2) is page images; not read |
| Agreements page | /about-mizrahi-tefahot-he/disclosure-links/bank-agreements/ | – | – | bf74aff852e6d78a: securities terms only; no fee annex (`tried` logged) |
| Account pages (offers) | /open-a-bank-account/accounts-type/… | – | Wayback 2026-05-21 to 2026-10-11; favoured employees live 2026-11-04 | **366aff319792dd68, fb096743cb2d921d, 2f009d41deb7b30b, 5a881595c9b3de30, bd6b289ec5246358, c0940a7266d99c8a** (new) |
| Exchange's sheet | market.tase.co.il/he/market_data/trading_fees | list "עדכון אחרון: 30/06/26"; averages "01/01/26 - 30/06/26" | – | Read in Chrome, not filed. It matches the tariff and gives custody's 10,750 ₪ ceiling "לפקדון" and "לני"ע" |
| Promotion terms; change notices | – | – | – | none published (`tried` logged) |

**Which is newest.** The combined tariff of 20 Oct 2026 is the newest binding document; the price-list page links it with its separate parts. Its securities part has not changed since 2.4.2024, and its annex E since 12.8.2025. Part 11 (18.8.2026) is the newest part that touches securities.

## 3. The ordinary customer's price (the most the documents allow)

**Case 1: an S&P 500 tracking fund or ETF in Tel Aviv, in shekels**

| Cost | Mizrahi-Tefahot |
|---|---|
| Lump sum, online (annex E) | **0.52%, min 45 ₪, max 9,675 ₪**. Footnote 4 takes "קרן מחקה" and listed funds into 4.1 |
| At a branch (4.1.1) | 0.64%, min 50 ₪, max 10,750 ₪ |
| Monthly, bought online each month | 0.52%, min 45 ₪ (the record's price) |
| Monthly by standing order | no price printed; the clerk price, **0.64%, min 50 ₪**, by the channel reading (inferred) |
| Minimum cap (note 6) | the minimum never exceeds 25% of the value |
| Custody (4.5.1) | **0.175% a quarter**, max 10,750 ₪ a quarter, per deposit and per security (the exchange's sheet). None on makam or a money-market fund (note 2) |
| Distribution fee (4.9.5) | "קרן מחקה: פטור"; types 1/3/4 only without a distribution agreement |
| Transfer out (4.6.1) | **5 ₪ per portfolio** (online 4.65 ₪), plus exchange costs; closing fees at most 40 ₪ in all |
| Dividends, inactivity, platform | none printed in part 4. 11.16 passes on the exchange's charge for live quotes "על פי תעריפון הבורסה", with no trigger printed. 2.7.2, 10 ₪ a month, is an optional alert service |
| Current account (part 1) | minimum **6.80 ₪ a month** (one clerk action, 1.2.1 note 3); direct action 1.76 ₪, and a standing-order debit counts as one; tracks 10, 29 or 35 ₪ |

Illustrations (inferred):
- A 67,000 ₪ account pays 469 ₪ a year in custody.
- A 500 ₪ monthly purchase online pays 45 ₪ (9%) each time; the minimum binds up to about 8,650 ₪ a month.
- By standing order, if the clerk reading holds, the same purchase pays 50 ₪ (10%).

**Case 2: an ETF in the US**

| Cost | Mizrahi-Tefahot |
|---|---|
| Trade online (annex E) | **0.30%, min $25, max $6,750**. The row names "מניות ,אגרות חוב וקרנות נאמנות", so funds are covered |
| Trade at a branch (4.4.1) | 0.89%, min $75, max $7,500 |
| Broker (11.10.1) | 0.5 cent a share; other markets up to 0.13% |
| Custodian (11.32) | $2.50 (US shares and ETF), up to $32 elsewhere, up to 250 euro for funds. What it is charged on is not printed |
| Correspondent (11.9.2) | 0.05%, min $2, max $500 |
| Market or state costs (11.34) | **not limited** in the price list (a JPMorgan guide is linked) |
| Custody (4.5.2) | 0.195% a quarter, max 10,750 ₪ |
| Conversion online (annex E) | 0.133%, min $5.40, max $2,250 (up to $50: $2.85; up to $10 exempt, part 5 note 6) |
| Spread | **not limited by the documents**. The quoted and uniform rates are set by the bank's dealing room; "שער אחיד" is the rate "המתפרסם על ידי הבנק" (account terms 8.2025, p.6). A deal at the known rate adds 2.00% on top (part 5 note 4) |

## 4. What changed in the record

- `snapshot` is 2026-11-04. Every `checked` is 2026-11-04.
- `tariff.notes` gain the re-read:
  - the md5 and the HTTP and PDF dates;
  - each part's date;
  - the exchange's sheet;
  - the absence of an agreement annex and of promotion terms.
- Custody maxima (both lines): the notes now cite the exchange's sheet, which prints 10,750 ₪ "לפקדון" and "לני"ע". This removes the "not stated" doubt, so `mizrahi-custody-foreign` leaves the leftover list.
- `mizrahi-custody-foreign` rate notes: the part 11 custodian costs, and securities terms s.7.3 and s.10.
- `mizrahi-buy-sell-tase-direct` notes: the standing-order reading (section 1).
- Both foreign trade lines: notes on the part 11 third-party costs. The direct line adds that annex E names funds.
- **FX spread, both lines:** value null, notes "Not limited by the documents", source the account terms (p.6). The branch line held **2**, the margin printed only for a deal at the known rate, on top of the bank's own rate.
- **New line** `mizrahi-transfer-out-same-client`: 5 ₪ (4.6.1, p.11), the same shape as Hapoalim's. The calculation does not read `transfer_out`.
- `groups.note`: re-checked against annex A (13.01.2026) and the young and soldier pages. It adds the groups' conversion benefits. Two pages are added to `read`. The entries, ages and periods are unchanged.
- `left_out`: 0 entries become 6:
  - the joining refunds;
  - third-party costs abroad;
  - the 4.11 custodian fee;
  - live quotes and alerts;
  - the current account;
  - the averages.

**Price values changed, old → new:**
- `mizrahi-fx-conversion-branch` spread: 2 → null ("not limited").

The engine reads neither change, so no ranking changes.

`npm run validate`: data/ is valid, with the usual warnings only.

`npx vitest run`: 101 files, 1498 passed, 1 todo, 1 failed. `packages/pipeline/test/price-premises.test.ts` › "a doubt written in a note on a priced line is on the list, and the list only shrinks" fails because the list shrank: `mizrahi-custody-foreign` is no longer found. Its LEFTOVERS entry should go. I did not touch the test.

## 5. Still open

- **The standing order's price.** Does Mizrahi charge a monthly fund purchase by standing order at 0.52% or at 0.64%, and with a 45 or a 50 ₪ minimum?
  - The reading rests on annex E's channel column and on FIBI's own documents.
  - A written answer from the bank (*8860) or a customer's statement would settle it.
  - It moves no price today, because the record prices the online purchase.
- **The app.** Annex E prices securities in "שירות האינטרנט" only. For other services it lists "שירות הסלולר" separately. Whether a trade placed in the app gets the internet price is not printed. The same answer from the bank would settle it.
- **4.11 "עמלת קסטודיאן" (0.10%, min 25, max 2,000 ₪)** and the **11.32 custodian costs**: what they are charged on is not printed. Neither is priced.
- **Third-party costs abroad (decision for the lead or founder).** Some are printed with amounts. Market or state costs have no ceiling. All are kept out of the price, as for FIBI and Hapoalim.
- **The current account (decision for all banks):** 6.80 ₪ a month at least.
- **For other houses:** nothing found.
- **Tabs.** One Chrome tab was opened (the bank's pages and the exchange's sheet) and closed. The group is gone.
- **For the lead:** a bulk fetch of the bank's site drew a 403 block for about twenty minutes. Later researchers should fetch one page at a time.

## Contradicted advertising

None found. The young and soldier pages' "0.4% עמלת קנייה/מכירה של ני"ע בבורסת בתל אביב, אך לא פחות מהעמלה המזערית" is annex A's "0.40% עמלה מופחתת, אך לא פחות מהעמלה המזערית". The joining refund ("החזר כלל העמלות בגין פעילות עו"ש, ני"ע ומט"ח עד 500 ₪ בשנה") is in no binding document, but no binding document contradicts it either.
