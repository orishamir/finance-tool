# First International (`fibi`) and Massad (`massad`): binding prices, 2026-11-04

Read 2026-11-04 under D56. Records: `data/fees/fibi@2026-11-04.json` (copied from `fibi@2026-10-31.json`) and `data/fees/massad@2026-11-04.json` (copied from `massad@2026-10-31.json`). Both are new snapshots. The two banks are one group with one tariff structure: part 4 has the same sections and notes, with different figures.

**In one line.** Neither bank advertises a securities price to the ordinary customer, and no waiver is open to one. Both price lists print custody of **0.195% a quarter in Israel (0.78% a year)**, and about 0.2% abroad.

**The price that moves is the monthly standing order.** Both records priced it at the internet rate with the 7 ₪ standing-order minimum: FIBI 0.3%, Massad 0.4%. Note 9 of both tariffs gives the internet rate only "עבור פעולה המבוצעת ישירות באמצעות האינטרנט". FIBI's own HighTech 10 terms list "קניה של קרן מחקה באמצעות הוראות קבע" among actions "שלא באמצעות האינטרנט או האפליקציה", and the club page lists it under "פעולות בסניף או בחדר עסקאות". So the most the documents allow is the tariff's own rate: **0.64%, at least 7 ₪, at most 7,000 ₪**, at both banks. The same reasoning moves the ETF-abroad standing order to the branch rate.

The rest of the picture:
- FIBI's part 11, since 6.9.26, prints **maxima for third-party costs abroad**, among them custodian custody "0.72%" a year. Massad's part 11 still prints none.
- FIBI's TopTrade young track (5 ₪ a trade, custody "פטור") was never in a binding document, and its table is now empty on the page.

## 1. First International: claims and verdicts

| Claim (words, where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| HighTech 10 club: Tel Aviv "מניות ואג"ח" 0.18%, abroad 0.22%, "דנ"פ ני"ע בארץ ובחו"ל ... 0.1% לרבעון" (leaflet iuwfsifx, 26.11.2024; club page) | Leaflet note 2: "יוענקו עד ליום 31.12.2026"; "החל מיום 1.1.2027, לא תהיה זכאות"; "הבנק רשאי לשנות או לבטל את ההטבה בכל עת". Club page: "מועדון הייטקטן מיועד ללקוחות פרטיים העובדים בחברות נבחרות (עפ"י החלטת הבנק) ממגזר ההייטק". Not in annex A | **Offer** (employer group, ends 31.12.2026, withdrawable). Already under `groups` |
| HighTech 10, self-directed track: Tel Aviv "מניות ואגרות חוב לרבות "קרן מחקה"" 0.1%, min 5 ₪; abroad 0.1%, min 8 $; custody 0.025% a quarter; standing order for "קרן מחקה" 0.1%, min 5 ₪ (leaflet cnvlnxrr, 28.11.2024, p.2-3; BRK-55) | The leaflet's own terms:<br>- club members only; "ההצטרפות כפופה לשיקול דעת הבנק"<br>- "לשנתיים מיום ההצטרפות", then the club's prices to 31.12.2026<br>- third-party costs "ללא ההטבה" | **Offer**. Already under `groups` |
| HighTech 10 club page: "פטור מעמלת חליפין", "הטבת שער ברכישת/המרת מט"ח - 5 פרומיל" | Club members only, at the bank's discretion | **Offer**; in `left_out` |
| TopTrade, "מסחר עצמאי - מסלול לצעירים עד גיל 30": "הטבות מטורפות", "אין הטבות כאלה!!!" (capitalmarket/toptrade) | No binding document: annex A has no such row. The Wayback copies (2025-09-16 to 2026-06-09) show "5 ש"ח (סכום קבוע)" for Israeli "מניות/אג"ח" in a portfolio up to 200,000 ₪, "$5 לפעולה" abroad, and custody "פטור". On 2026-11-04 that table is empty. The terms: ages 18-30, "הבנק רשאי לשנות את תנאי השירותים או להפסיקם בכל עת" | **Not found** (and withdrawn from the page) |
| Monthly investment by standing order: no advert | Part 4 note 13, p.15: "בגין רכישת/מכירת קרן מחקה באמצעות הוראות קבע תיגבה העמלה בכפוף לעמלת מינ' מופחת בסך 7 ש"ח". Note 9 (internet rate) covers only an action "המבוצעת ישירות באמצעות האינטרנט" | **Guaranteed** at 0.64%, min 7 ₪ (see section 3) |

**The catch for an ordinary customer:**
- Custody of 0.78% a year on every fund, including a tracking fund, with no waiver open.
- A minimum of 39 ₪ a trade online.
- The standing order at the branch rate.
- A conversion rate that the bank publishes itself.
- Third-party costs abroad up to the part 11 maxima.
- The current account's minimum of up to 6.30 ₪ a month.

**What customers paid (a fact, not a price).** These figures appear both on the bank's sheet (library e61fc4bbf05ba137, created 2026-07-22, period 1.1–30.6.2026; note 3: custody is "שיעור עמלה שנתי בפועל") and on the exchange's sheet:
- Israeli custody: **0.32%** (up to 25 thousand ₪), then 0.39, 0.41, 0.39, 0.43, 0.42, 0.41, 0.39, and **0.25%** above 1,000 thousand.
- Foreign custody: 0.28 to 0.37.
- Israeli shares and bonds: 0.02 to 0.19.
- Foreign trading: 0.08 to 0.23.

## 2. Massad: claims and verdicts

| Claim (words, where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| Teachers' and couples' pages: "50% הנחה בדמי ניהול פיקדון ני"ע (דנ"פ) לשלוש שנים" | The pages' own terms:<br>- new customers, salary from 5,000 ₪ (couples 10,000 ₪)<br>- "בפיקדון ניירות ערך החל מ- 150,000 ₪"<br>- "הבנק רשאי להפסיק את מתן ההטבות בכל עת"<br>Not in annex A | **Offer** (profession, three years); in `left_out` |
| Retirees' page: "33% הנחה בדמי ניהול פיקדון ני"ע" | Annex A: the retiree club pays 0.133% a quarter; "ההצטרפות למועדון עד יום 30/09/2024 בלבד" | **Offer, closed to joiners**; already under `groups` |
| Young, soldier and student pages | No securities claim. Annex A gives these groups 0.1% a quarter. The student page says "ההצטרפות למועדון סטודנט עד גיל 35" and its own offer runs "עד תאריך 31.12.26" | No claim to check; groups re-checked |
| Capital-market pages (capitalmarket, independenttrade, trustfunds, new) | No fee claim | No claim to check |
| Monthly investment by standing order: no advert | Part 4 note 13: the same words as FIBI's, with a 7 ₪ minimum. Note 9: "0.40%, מינ' 35.0 ש"ח" only for an action "המבוצעת ישירות באמצעות האינטרנט" | **Guaranteed** at 0.64%, min 7 ₪ (inferred reading; section 3) |

**The catch:**
- Custody of 0.78% a year in Israel and 0.8% abroad, with a cap of 10,000 ₪ a quarter.
- A minimum of 35 ₪ a trade online.
- The standing order at the branch rate.
- Foreign trading at 0.78% online, with a minimum of 24.5 $.
- Third-party costs abroad with **no** ceiling.
- The current account's minimum of up to 6.30 ₪ a month.

**What customers paid.** These figures appear both on the bank's sheet (library 820753ecaf4802d4, period H1 2026) and on the exchange's sheet:
- Israeli custody: **0.47%** (up to 25 thousand ₪), then 0.44 to 0.59, and **0.33%** above 1,000 thousand.
- Foreign custody: 0.28 to 0.67.
- Israeli shares and bonds: 0.14 to 0.40.

## 3. The documents

| Document | URL | Printed date | File dates | Library |
|---|---|---|---|---|
| FIBI full tariff (binding, **newest**) | fibi.co.il/media/dhneratu/תעריפון-בינלאומי-יחידים-26102026.pdf | cover "ספטמבר 2026"; page "החל מתאריך ה 06/09/2026" | Created 2026-10-26 15:31; Last-Modified 2026-10-26 | **8413a379a4e0652f** (new) |
| FIBI part 4 | …/jqob143q/חלק-4-ניירות-ערך-31.pdf | – | Created 2026-10-26; md5 08567e4a…, the same as the 31 Oct copy. Word for word pp.15-20 of the full file | 4cfbcc09992df849 |
| FIBI annex E; part 5; annex A | …/rgketaam/…; …/3avbury5/…; …/ys4pkdpw/… | – | 2026-09-01; 2025-12-24; 2025-09-21. All unchanged | 7d1cf0d48500cb12; f780bbff5d87c1c2; 97af2a349e48c612 |
| FIBI part 11 | …/1eylfxjt/חלק-11-הוצאות-צד-שלישי-31.pdf | maxima from 6.9.26 | Created 2026-09-16 | **0ce4c1a8904b8984** (new) |
| FIBI part 1 | …/5m4p1uyr/… | – | 2026-09-03 | **1365ff4311a67457** (new) |
| FIBI change notices | …/hrfp20fz/הודעה-על-שינויים-הבינלאומי-02092026.pdf | 23.8.26 (effective 6.9.26), 2.9.26 | 2026-09-02 | **837b0100c8b4b518** (new). No securities price changed; part 11 maxima added |
| FIBI HighTech 10 leaflets | …/iuwfsifx/…; …/cnvlnxrr/… | benefits to 31.12.2026 | 2024-11-26; 2024-11-28 (Last-Modified 2024-12-01). Unchanged | 40af22f3873afa06; 0f78d041cd99c818 |
| FIBI HighTech 10 page; TopTrade page | /private/fibiaccount/accounttypes/hightech10/; /private/capitalmarket/toptrade/ | – | – | **a8ce219346ee87fb**; **cd07a4daaecd8bf0** (today) and **421891a11c854334** (Wayback 2026-06-09) |
| FIBI general terms פח-90; securities chapter | …/g1gbjhvt/…; …/5cdnpd0s/… | 8.2025 | – | 0e1d2966962cb12c (FX: p.8, p.25); 30db20eaa1f2c615 |
| FIBI fee-distribution sheet | …/ds1hsij5/… | H1 2026 | Created 2026-07-22 | **e61fc4bbf05ba137** |
| Massad full tariff (binding, **newest**) | bankmassad.co.il/media/m5bpijsz/תעריפון-מסד-ליחידים-06092026.pdf | page "החל מתאריך ה- 06/09/2026" | Created 2026-09-03; Last-Modified 2026-09-06 | **e9cd177e3a3a9764** (new) |
| Massad part 4; annex E; part 5; annex A | …/qb0h1di4/…; …/bdihy3hk/…; …/u3le0ioe/…; …/sf5kfzdv/… | – | 2026-07-19; 2026-09-01; 2025-12-24; 2024-09-15. All unchanged; part 4 = pp.15-19 of the full file | 14d10e0ed6b25245; 9023a51ca129dafa; 0d2d6203cebe2ca5; baf8c01e5ae3f7f4 |
| Massad part 1; part 11 | …/e11agh3s/…; …/cxpdzwtq/… | – | 2026-09-03 | **594a97c31770e26d**; **3c626ab868cffc77** (new) |
| Massad general terms | …/wlcicay2/… | – | – | bddb14e343170642 (FX: p.8, p.25) |
| Massad fee-distribution sheet; account pages | …/gekaf1j3/…; accounttypes/teachers, couple, studentskids | H1 2026 | 2026-07-22 | **820753ecaf4802d4**; e482d4ca74c58147, af05f414e55a7416, b7544a94ce50f8ae |
| Exchange sheets | market.tase.co.il/he/market_data/trading_fees | list "עדכון אחרון: 19/07/26" (both); averages "01/01/26 - 30/06/26" | – | Read in Chrome, not filed. Both match the tariffs |
| Account agreement with a securities fee annex | not published by either bank | – | – | `tried` logged |

**Which is newest.**
- **FIBI:** the full tariff of 26.10.2026. Its securities pages are the part 4 file the record already cites.
- **Massad:** the full tariff of 06.09.2026. The bank links no change notices; its `/changes/` page is 404.
- No campaign terms at either bank are newer and still open.

## 4. The ordinary customer's price (the most the documents allow)

**Case 1: an S&P 500 tracking fund or ETF in Tel Aviv, in shekels**

| Cost | FIBI | Massad |
|---|---|---|
| Lump sum, online (note 9; annex E) | **0.3%, min 39 ₪, max 6,900 ₪** | **0.4%, min 35 ₪, max 6,300 ₪** |
| At a branch (4.1.1) | 0.64%, min 40, max 7,000 | 0.64%, min 40, max 7,000 |
| Monthly standing order (note 13 with 4.1.1) | **0.64%, min 7 ₪, max 7,000 ₪** (was 0.3%) | **0.64%, min 7 ₪, max 7,000 ₪** (was 0.4%) |
| Fee cap per trade (note 5) | 30% of the trade | 25% of the trade |
| Custody (4.5.1) | **0.195% a quarter**, max 4,000 per security, 10,000 per deposit; none on makam or a money-market fund | **0.195% a quarter**, max 10,000 per security and per deposit; the same exclusions |
| Distribution fee (4.9) | 0.2%, 0.35% or 0.1% a year, only where the 2006 regulations allow | the same |
| Dividends, inactivity, data, platform | none printed | none printed |
| Transfer out (4.6.1) | **5 ₪** per transfer, plus exchange and custodian costs; on closing at most 10 ₪, and all closing fees at most 40 ₪ | **5 ₪**; the same closing limits |
| Current account (part 1, 1.2.1 note 4) | minimum **up to 6.30 ₪ a month**; direct action 1.80 ₪; tracks 9 or 26 ₪ | minimum **up to 6.30 ₪**; direct action 2.00 ₪; tracks 10 or 30 ₪ (teachers 10 ₪) |

Illustrations, inferred:
- A 67,000 ₪ account pays 523 ₪ a year in custody at either bank.
- A 500 ₪ monthly order pays 7 ₪ (1.4%) at both, the same as before the change.
- The rate starts to bite above 1,094 ₪ a month.
- Above about 6,100 ₪ a month a manual online purchase (0.3% or 0.4%, with its higher minimum) costs less than the standing order.

**Case 2: an ETF in the US**

| Cost | FIBI | Massad |
|---|---|---|
| Trade online (annex E) | 0.25%, min 39 $, max 6,900 $ | 0.78%, min 24.5 $, max 1,100 $ |
| Standing order (note 10/11 with 4.4.1) | 0.85%, min 4.5 $, max 7,000 $ (was 0.25%) | 0.8%, min 4.5 $, max 1,200 $ (was 0.78%) |
| Third-party costs (part 11) | Maxima, "על פי החיוב בפועל":<br>- broker up to 6 cents a share<br>- custodian up to 5 $ an action<br>- **custody up to 0.72% a year**<br>- "הוצאות קרן" up to 9% of the trade<br>- SEC fee up to 27.8 $ per million | broker, correspondent and custodian **not limited** |
| Conversion online (annex E) | 0.0875%, min 5 $, max 2,475 $ | 0.17%, min 5 $, max 2,500 $ |
| Spread | **not limited by the documents**: the bank's own published "שער העברות והמחאות" (general terms p.8, p.25) | **not limited**, same terms |
| Custody (4.5.2) | 0.199% a quarter, max 4,000 per security | 0.2% a quarter, max 10,000 |

FIBI's club page offers its members "הטבת שער ... 5 פרומיל". That suggests, though no document says so, that the ordinary rate sits at least 0.5% from the best rate the bank can give.

## 5. What changed in the records

**Both records:**
- `snapshot` is 2026-11-04. Every `checked` is 2026-11-04.
- `tariff.notes` gain the re-read: md5s, PDF dates, which file is newest, part 11, and the exchange's sheet.
- **Standing-order lines** (`<id>-standing-order-tase-direct`, `<id>-standing-order-foreign-direct`):
  - The rate and maximum move to the part 4 section line, with its source, and the notes say why (section 1).
  - The minimum is unchanged: 7 ₪ and 4.5 $.
  - The ids and the `direct` channel are kept, so the engine still reads them.
- **New line** `<id>-transfer-out-same-client`: 5 ₪ (4.6.1, part 4 p.4), the same shape as Discount's and Leumi's. The calculation does not read `transfer_out`.
- FX `spread.notes`: "not limited by the documents", citing the general terms. Value still null.
- Foreign trade and custody notes: part 11 (FIBI's maxima; Massad's "not limited").
- `left_out`: 0 entries become 5 (FIBI) and 4 (Massad):
  - TopTrade (FIBI);
  - the teachers' 50% offer (Massad);
  - third-party costs abroad;
  - the current account;
  - the averages;
  - the HighTech 10 FX benefit (FIBI).

**FIBI groups:**
- HighTech 10 `who_he` now quotes the club page (employees of high-tech companies the bank selects).
- The self-directed track adds "ההצטרפות כפופה לשיקול דעת הבנק".
- `read` adds the club page; `note` re-checked. The ends (31.12.2026; two years) are unchanged.

**Massad groups:** `note` re-checked (the students' age of 35 from the page; the retirees' 33%). The entries are unchanged.

**Price values changed, old → new:**
- `fibi-standing-order-tase-direct`: rate 0.3 → 0.64; max 6,900 → 7,000 ₪.
- `fibi-standing-order-foreign-direct`: rate 0.25 → 0.85; max 6,900 → 7,000 $.
- `massad-standing-order-tase-direct`: rate 0.4 → 0.64; max 6,300 → 7,000 ₪.
- `massad-standing-order-foreign-direct`: rate 0.78 → 0.8; max 1,100 → 1,200 $.

The engine now reads the standing-order price for a Tel Aviv tracking fund or ETF, online, as `{rate 0.0064, min 7, max 7000}` at both banks. On 2026-10-31 it read `{0.003, 7, 6900}` at FIBI and `{0.004, 7, 6300}` at Massad.

`npm run validate`: data/ is valid, with the usual warnings only. `npx vitest run`: 101 files, 1499 passed, 1 todo, 0 failed. `packages/engine/test/standing-order.test.ts` reads the 2026-10-31 snapshots by name, lines 38–48, which is why nothing fails. Pointed at 2026-11-04, its expectations `massad … direct {rate 0.004, max 6300}` and `fibi … direct {rate 0.003, max 6900}` would fail.

## 6. Still open

- **The standing order's channel.** Does either bank charge the internet rate on a standing order the customer places online?
  - For FIBI, the bank's own HighTech 10 documents support the branch rate.
  - For Massad, the reading rests on its note 9 wording, plus FIBI's document of the same group. That is inferred, not read in a Massad document.
  - A customer's statement, or a written answer from either bank (FIBI *3009, Massad *2448), would settle it.
- **Third-party maxima (decision for the lead or founder).** FIBI is the only house read so far whose price list caps third-party costs abroad. The cap is generous: custodian custody up to 0.72% a year, and fund costs up to 9% of a trade. Pricing these for FIBI alone would rank it below banks whose documents are silent, so they are notes and `left_out` for now. The notice calls them maxima published "בהתאם להנחיות הפיקוח על הבנקים". Other banks may follow.
- **The current account (decision for all banks):** up to 6.30 ₪ a month at both banks.
- **For the lead:**
  - Rule BRK-55 has two entries with the same id in `.claude/skills/il-finance/references/brokerage-account.md`: line 499 (a Bank of Israel directive) and line 702 (the FIBI promotion). The FIBI one also now reads "תעודות סל/קרן מחקה" on the club page. Its owner should renumber it.
  - The engine prices every monthly purchase on the standing-order line. Above about 6,100 ₪ a month, the online lump-sum line is cheaper at both banks.
- **For other houses:** nothing found.
- **Tabs.** One Chrome tab was opened and closed. The group is empty.

## Contradicted advertising

- FIBI, TopTrade page, today: "זה הזמן ... להתחיל לסחור עם הטבות מטורפות", "אין הטבות כאלה!!!", with an empty table. Annex A and part 4 print no young-trader price (**not found** rather than contradicted). The figures the page showed until June 2026 ("5 ש"ח (סכום קבוע)", custody "פטור") are in no binding document.
- Massad: none found. No page states a securities price that the tariff contradicts.
