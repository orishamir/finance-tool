# Meitav Trade (`meitav-trade`): binding prices, 2026-11-04

Read 2026-11-04 under D56. Record: `data/fees/meitav-trade@2026-11-04.json`. It is a **new, full record**: the snapshot of 2026-10-31 had `missing: true` and no lines.

**In one line.** No binding document waives custody for an ordinary customer. The only price list, version 04/2026, prints two separate charges:
- custody, "0.15%, מינימום ₪ 270 לרבעון";
- a handling fee, "דמי שימוש/ טיפול", "עד ₪ 90" once a month.

It also prints a conversion fee of 0.13%. The site says, with no condition, "פטור מדמי משמרת", "ללא דמי משמרת ועמלות נסתרות", "ללא עמלת חליפין" and "ללא עמלות אחזקת חשבון". **All four are contradicted.**

The only current offer is the November joining offer, "פטור מדמי טיפול לארבע שנים". It is printed only on advertising pages, and no terms for it are published.

The exchange's sheet shows that customers actually paid very little custody in H1 2026: 0.0718% for portfolios up to 25,000 ₪, down to 0.0011% above 1 million ₪. That is a fact, not a price.

Priced at the list, an ordinary customer pays **at least 2,160 ₪ a year before any trade** while the portfolio is below 180,000 ₪. On the S&P 500 page that makes Meitav Trade **the dearest house of all 17** for 10,000 ₪ plus 500 ₪ a month over 10 years.

## 1. Claims and verdicts

| Claim (words, where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| "פטור מדמי משמרת" (/trade/independent_trading, /trade/currency_exchange). The self-trading page has carried it since at least the Wayback copy of 10.10.2023. "כולל פטור מדמי משמרת" (/trade/application). "ללא דמי משמרת ועמלות נסתרות" (/trade/about; the same words in the Wayback copy of 15.3.2025) | Price list 04/2026, part 4(א) item 8 (p.3, checked on the page image): "דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות)", "0.15%, מינימום ₪ 270 לרבעון". Version 01/2025 prints the same | **Contradicted** |
| "ללא עמלות אחזקת חשבון" (/trade/currency_exchange) | Part 9 item 1 (p.5): "דמי שימוש/ טיפול", "עד ₪ 90", "אחת לחודש" | **Contradicted** |
| "ללא עמלת חליפין" (/trade/currency_exchange, /trade/about); "פטור מעמלת המרת מט"ח" (/trade/independent_trading, /trade/application) | Part 5 item 1 (p.5): "עמלת חליפין 0.13%" | **Contradicted** |
| "מרווח ההמרה נמוך משמעותית" (/trade/currency_exchange) | Part 5 item 2: "מרווח המרה עד 0.8% משער ההמרה". Version 01/2025 printed 0.7%, so 04/2026 raised it | The spread is **limited by the document to 0.8%** |
| "ללא עמלת העברת שקלים (לחשבון בישראל)" (/trade/currency_exchange) | Part 1 item 1 (p.1): "העברות שקלים 25 ₪" | **Contradicted** (a cost on leaving, not priced) |
| "פטור מעמלות אי ביצוע" | Part 4(א) items 1, 3, 4, 5: "לא נגבית עמלה בגין אי ביצוע" | **Guaranteed** |
| "חודש בלאק פריידי ... פטור מדמי טיפול לארבע שנים", for those whose first deposit is made by 30.11.26, "אין כפל מבצעים" (/trade, /trade/independent_trading) | No terms published: the terms page lists only offers that have ended. The reservists' terms of May to June 2026 used the same words, "פטור מדמי טיפול בחשבון המסחר" for four years, and ended 30.6.2026 (section 7.1) | **Offer**, printed only on advertising. Which fee it waives is **not stated**: see §3 |
| "מסלול קרנות ללא עמלות: אין דמי טיפול חודשיים, אין דמי משמרת" (tracks page) | Not in the price list. The page itself limits it to accounts holding only mutual funds, with at least 100,000 ₪, and "לא כולל קרנות שמוגדרות כמניות עפ"י הבורסה" | **Not found** in any binding document. It would be an offer anyway |
| "אפליקציית Mטרייד ללא עלות נוספת" | Part 9 item 2: advanced systems and quotes cost "עד ₪ 3,000" a month. No line prices the basic app | **Not found** |
| Third party (a forum, found by web search): "דמי ניהול: פטור לשנתיים, אח״כ ₪15" | No Meitav document prints 15 ₪ | **Not found** |

The site's own pages disagree on the opening minimum: 10,000 ₪ (the about page and the tracks page, general track) against 5,000 ₪ (landing page, FAQ).

## 2. The documents

| Document | URL | Printed date | File dates | Library |
|---|---|---|---|---|
| Price list (binding, **newest**) | meitav.co.il/media/zitlfr4f/עמלות-תעריפון-42026.pdf, linked from /trade/about and from the exchange's sheet | "גרסת 04/2026" on every page | Created and modified 23.4.2026 | 3ec196cf860a522c. Re-fetched today, same md5 (a426a621…). The server sends no Last-Modified |
| Earlier price list | meitav.co.il/media/z2hkkhku/taarifon.pdf (still served; linked from /trade/about in 2025) | "גרסת 01/2025" | 14.1.2025 | 3dab65d44284a0e2, same md5 today. A text diff shows the spread (0.7% then 0.8%) is the only change |
| Promotion terms (all ended) | /media/ijvfm5ag/ (reservists, 1.5 to 30.6.2026); /media/mfnoodqc/ (provident-fund mailing, 2024, "המבצע הסתיים"); /media/b15gp0ew/ (I24, ended) | as printed | 31.5.2026 / 17.6.2024 / – | dcecc52b58613c1e, a7aaf9628ee8db97, 18d8c74d49f9d1e5 |
| November 2026 offer terms | **not published** | – | – | `tried` logged |
| Account agreement or fee annex | not published | – | – | `tried` logged (2026-10-31) |
| Exchange sheet | market.tase.co.il/he/market_data/trading_fees, מיטב טרייד | "עדכון אחרון: 07/07/26"; averages 01/01/26–30/06/26 | – | read in Chrome, not filed |
| Advertising | /trade (2eb0a32e8942bdba, filed today), /trade/currency_exchange (12fe612e0d2913df, filed today), /trade/independent_trading (f57d393657c2d282), /trade/about (697ecc32a2bdcfa4), /trade/application (1315f97ac91f198c), tracks page (3d56645174b8a3b4) | – | Wayback: about page from 2025-03-15, self-trading page from 2023-10-10 | – |

**Which is newest.** Version 04/2026 is the newest price list, for three reasons:
- The about page and the exchange's sheet link only to it.
- The exchange's sheet, updated 07/07/26 (after April 2026), prints its figures: 0.3% with a 10 ₪ minimum; makam 0.1% with 10 ₪; US 0.01$ a share with a 12$ minimum; custody "0.6000% לשנה", minimum "90.00 ₪ לחודש".
- A web search found no newer one.

No promotion's terms in force were found.

**Does the custody period hold?** The exchange's sheet gives 0.6% a year and 90 ₪ a month. That is exactly 0.15% and 270 ₪ a quarter, so "לרבעון" covers both the rate and the minimum. The price list's collection column reads "ביום העסקה", which looks like a template slip. It does not change the price.

## 3. The ordinary customer's price (the most the documents allow)

**Case 1: an S&P 500 tracking fund or ETF in Tel Aviv, in shekels**

- Trade: **0.3%, at least 10 ₪** (4(א)1). This one line covers every security on the Tel Aviv exchange except Maof options and futures, and there is no separate fund line. A 500 ₪ monthly buy pays 10 ₪ (2%).
- Custody: **0.15% a quarter, at least 270 ₪ a quarter**. Below 180,000 ₪ the minimum governs: 1,080 ₪ a year.
- Handling fee: **up to 90 ₪ a month**, priced at 90, so 1,080 ₪ a year.
- Standing order: no line, and no page offers a standing buy order. Each monthly buy is a trade at 10 ₪ at least.
- Dividend or interest handling: **0.3% of each payment**. An accumulating fund pays none.
- Inactivity: none printed.
- Transfer out: **20 ₪ per security, at most 99 ₪**. Shekels out: 25 ₪.
- Data: advanced systems cost up to 3,000 ₪ a month, by the client's choice.

An illustration, inferred and not printed anywhere: 67,000 ₪ pays 1,080 ₪ custody plus 1,080 ₪ handling, 2,160 ₪ a year (3.2%), before any trade.

**Which fee the offer waives.** The offer says "פטור מדמי טיפול". By its name it matches part 9 item 1 ("דמי שימוש/ טיפול"), not custody ("דמי ניהול פיקדון"). If that reading is right, a joiner in November still pays the 1,080 ₪ a year of custody. This is inferred from the names, never read.

**Case 2: a fund abroad**

- US, track A (priced): **1 cent a share, at least 12$**. Track B is "0.7% משווי העסקה, מינימום 12 $". The document prints both, "על פי אחד המסלולים", and does not say which applies.
- Other exchanges: **0.25%, at least 25 in the trade's currency**, "יתכן חיוב בעמלות ברוקר/עמלות צד ג' נוספות" (not limited). The exchange's sheet prints **0.3%** for outside the US.
- Conversion: **0.13% fee plus a spread of up to 0.8%**, both limited by the document.
- Custody and the handling fee: the same as case 1.
- Dividends: 0.3% of each.
- Transfer out: 10$ per security.
- An open-ended foreign fund (not an ETF): 0.2%, at least 20$, plus settlement and correspondent fees.

## 4. What changed in the record

- New snapshot `meitav-trade@2026-11-04.json`. It sets `missing: false`, `missing_reason: null` and drops `missing_reason_he`. The tariff title is the document's own; `tariff.notes` holds the dates, the md5, why this is the newest list, and the 01/2025 difference.
- **Eight lines** (there were none). Each has its source, the document's words, its page, and `checked: 2026-11-04`. The custody, fund, FX and handling lines were checked on the page images.
  - `buy-sell-tase`: 0.3%, min 10 ₪; applies to `tase_shares_bonds`, `mutual_fund_units`, `etf_units`.
  - `buy-sell-makam` and `redemption-makam` (band "פדיון"): 0.1%, min 10 ₪.
  - `buy-sell-foreign-us`: 0.01 usd_per_share, min 12 usd; band "מסחר בבורסות ארה"ב, מסלול א'".
  - `buy-sell-foreign-world`: 0.25%, min 25 eur; band "מסחר בשאר בורסות העולם, מחוץ לארה"ב". I added "מחוץ לארה"ב" so the page reads it as Europe.
  - `custody`: 0.15 `pct_of_balance_per_period`, period `quarter`, min 270 `nis`, on every class.
  - `fx-conversion`: 0.13%, spread 0.8%.
  - `account-fee`: `fixed_period`, 90 `nis_per_month`.
- `availability` has three `true` entries:
  - mutual funds: the custody line's words "יחידות השתתפות בקרנות נאמנות";
  - ETFs: the self-trading page, "קרנות נאמנות, קרנות סל", because the price list names no ETF;
  - foreign: "ניירות ערך בחוץ לארץ".
- `minimums.account_opening`: **10,000 ₪**, the higher of the two the site states.
- `left_out` has 15 entries:
  - the custody claims and the fee claims, both contradicted;
  - the exchange's averages;
  - US track B;
  - the exchange's 0.3% outside the US;
  - the open foreign fund;
  - dividends;
  - transfer out;
  - advanced systems;
  - a "עמלת קסטודיאן 0.1%, 30 ₪" line under special services, which prints nothing about what it is charged on;
  - the standing order;
  - the funds-only track;
  - the three ended offers;
  - the referral offer;
  - the forum claim.
- `groups`: `prices`, with one entry of kind `other`, "מבצע הצטרפות נובמבר 2026". Its source is the landing page; `inferred` gives the reading of which fee it waives.

**How the price on the site moves.** Before, the row was grey. Now it is priced. I computed this with the site's own `buildInvest` in a throwaway probe, since deleted, on the S&P 500 page, assuming 7% a year and 2% inflation. Figures are the account's cost over the horizon in today's shekels, and our computation:

| Plan | Meitav's cost | Rank (tracking fund) | Rank of houses by value |
|---|---|---|---|
| 10,000 ₪ + 500 ₪ a month, 10 years | **26,846 ₪** | 14th of 15 (Excellence 26,861); best is Psagot, 1,058 | **17th of 17**: 63,507 ₪, 22,986 ₪ below Psagot |
| 67,000 ₪, 8 years | 19,988 ₪ | 14th of 15 | 16th of 17 |
| 200,000 ₪, 10 years | 32,804 ₪ | 14th of 15 | 16th of 17 |

Abroad, for 10,000 ₪ plus 500 ₪ a month, Meitav is last of 15 at 38,112 ₪, priced on Europe. **No top pick changes.**

`npm run validate`: data/ is valid, with the usual warnings only.

`npx vitest run`: 101 files, 1 failed, 1498 passed, 1 todo. The failure, as expected: `site/app/lib/compare-broker.test.ts` › "the providers the brokerage wrapper carries" › "are the banks and brokers whose tariff has a line for the class of the fund the account holds…". It fails at line 19, `expect(ids).not.toContain("meitav-trade"); // its snapshot is marked missing`, with "expected [ 'altshuler-trade', …(14) ] to not include 'meitav-trade'". **No test was changed.**

## 5. Still open

- **Which fee the November offer waives, and on what terms.** It could waive custody, the handling fee, or both. Settled by any one of:
  - the offer's terms;
  - a written answer to the question already in issue 150 (rewrite it to ask about the two fees by name);
  - a statement from a customer who joined.
- **Why so little custody was collected in H1 2026** (an average of 0.0718% up to 25,000 ₪, against a list minimum that comes to more than 4% a year at that size). The same three sources would settle it. Possibly most accounts get a personal arrangement; nothing published binds the house to one.
- **US track B** ("0.7%, minimum 12$") against track A. Track B is dearer for any share priced above 1.43$. The lead decides, as for IBI and Altshuler.
- **Outside the US: 0.25% (price list) against 0.3% (the exchange's sheet).** Which one rules?
- **"עמלת קסטודיאן 0.1%, 30 ₪"** in part 4(ב): what it is charged on is not printed.
- **Hebrew.** The new `row_he`, `who_he`, `ends_he` and `price_he` texts have not been through the Hebrew editor.
- **Issue 150:** Meitav's half is settled by D56, since the row is priced, not grey. The issue should be rewritten (left to the lead).
- **For other houses:** nothing found.
- **Tabs.** The one Chrome tab opened (the exchange calculator) was closed, and the group was removed with it. No tab fell out of the group.
