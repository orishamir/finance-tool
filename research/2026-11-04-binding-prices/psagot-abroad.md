# Psagot Trade (`psagot`): a fund bought abroad, 2026-11-04

The question: can an ordinary Psagot Trade customer buy an Irish UCITS ETF such as iShares Core S&P 500 UCITS ETF (Acc), IE00B5BMR087, CSPX on the London Stock Exchange in dollars, and what does that cost under the binding documents? This report follows `psagot.md` (same folder); it does not repeat it.

**In one line.** No published document settles any of the three points. Psagot's own price list tells the customer to ask before trading in Europe: **"באחריות הלקוח לפנות לחברה, על מנת לברר גובה העמלה לפני ביצוע הפעילות"**. No Psagot document names London or any other European exchange. Nothing explains "1.5 אגורות עבור כל דולר/שקל". Two smaller points are settled: the fee is collected in the trade currency, with the euro minimum converted into it; and a dollar-denominated security is bought in dollars. The row stays grey. Only the reason gets more exact.

## Documents read (all on 2026-11-04)

| Document | URL | Its date | Strength | Library |
|---|---|---|---|---|
| Price list, HTML (binding, newest) | https://www.psagot.co.il/תעריפון-בורסה-פסגות-טרייד-2/ | WordPress modified 2026-08-09 | binding document (the company's tariff) | 95671307abfe64f1 |
| Price list, PDF, August 2026 | https://www.psagot.co.il/wp-content/uploads/2026/08/תעריפון-בורסה-פסגות-טרייד-1.pdf, p.4 | PDF 2026-08-06 | binding document (same text) | 40313c4c1c6f1d21 |
| Exchange's fee sheet for member 2881, Psagot (the publication s.45טז requires; BRK-15, BRK-33) | https://api.tase.co.il/api/commissions/loadmembercommissions?memberId=2881 (the data behind market.tase.co.il/he/market_data/trading_fees) | list "DateUpdate 2026-08-10"; averages 2026-01-01 to 2026-06-30 | regulator-mandated publication, figures as reported by the member (BRK-37) | 4bfab65e3a2923be (new) |
| FAQ, "מרכז מידע" | https://www.psagot.co.il/resources_heb/ | modified 2026-09-02 | company page (advertising) | b68e1d120963b836 (new) |
| Landing page "עמוד נחיתה-אתר" (Hebrew text at an /en/ address) | https://www.psagot.co.il/en/website1/ | modified 2026-09-16 | company page (advertising) | 505596403a04c846 (new) |
| User guide "מדריך מערכת המסחר ב-Mobile" (Trade 2) | https://www.psagot.co.il/wp-content/uploads/2025/09/מדריך-למשתמש-trade-004.pdf, p.1 | PDF modified 2025-04-21, uploaded 2025-09-09 | company guide | 9b237c450a1e5b30 (new) |
| Custody policy "מסמך מדיניות אחזקת נכסי החבר ולקוחותיו במשמורנים צד ג'" | https://www.psagot.co.il/מדיניות-אחזקת-נכסי/ | modified 2026-05-11 | company policy | not filed (no fee or exchange content) |
| Foreign-securities withdrawal form (English) | https://www.psagot.co.il/wp-content/uploads/2025/07/Foreign-securities-withdrawal-According-to-the-instruction-of-an-independent-customer.pdf | 2025-07 | company form | not filed ("I authorize a charge of 10$ for the withdrawal of each stock", the same as the tariff) |

The exchange's page is a script shell, but its data API answered a plain `curl` today. BRK-33 says the page "blocked plain fetches", and the API is the way round that. The exchange's terms allow "שליפה נקודתית ... ציטוט מוגבל" with a link to the source page (BRK-37). One fetch was made, for research.

## 1. The European price

**What the binding document says.** HTML price list, part 4(א), item 5, "קניה, מכירה, ופדיון של ניירות ערך בחו״ל", has six rows:

- "מניות ו-ETF הנסחרים בבורסות ארה"ב": "1 סנט למניה מינימום $ 6.5לעסקה"
- "מניות ו-ETF הנסחרות בבורסות אירופה": "עמלה בגובה 0.15% מהעסקה, מינימום 15 יורו לעסקה"
- "אג"ח חו"ל": "0.25%, מינימום 50 יח' מטבע לעסקה"
- "אג"ח חו"ל – דמי טיפול ריבית ופדיון": "0.25% ללא מינימום"
- "מניות בקנדה": "0.15% מינימום 10 דולר קנדי לעסקה"
- "קרנות זרות": "0.25% ללא מינימום"

Under the rows the list says:

- "עמלת המינימום המפורטת היא עבור כל עסקה בנפרד"
- "הגבייה בפועל מהלקוח תעשה בהתאם למטבע בו בוצעה הפעולה. דוגמא: עסקה שבוצעה ו/או תקבול שהתקבל בפרנק שוויצרי, תיגבה עבורם עמלה בפרנק שוויצרי, כאשר העמלה המינימלית תהיה 15 יורו לאחר המרתם לפרנק שוויצרי"
- "עמלת ני"ע באסיה ובאירופה עשויה להשתנות בהתאם לסוג המניה ואופי הפעילות. **באחריות הלקוח לפנות לחברה, על מנת לברר גובה העמלה לפני ביצוע הפעילות**"

**What the exchange's sheet says.** Psagot's sheet has one row for everything outside the US: "קניה/ מכירה/ פדיון - ני"ע בחו"ל - מניות, אג"ח, קרנות נאמנות - מחוץ לארה"ב", "0.2500% משווי עסקה", minimum "50.00 במטבע העסקה". The US row is "... - רק ארה"ב", "0.01 $ למניה", "6.50 $ לעסקה". The sheet links to the HTML price list as the member's tariff ("TaseMemberLink").

**Which is binding.** Neither one, in full:

- The price list, the binding document, does not fix a European price. It prints one and then sends the customer to the company before every trade.
- The exchange's sheet is the member's own report. The exchange guidelines require it to be "זהה למידע המפורסם על ידי החבר" (BRK-24, guidelines s.17(ד)). The exchange disclaims its content: "האחריות המלאה בקשר לנתונים חלה על חבר הבורסה" (BRK-37).
- What binds a customer is the signed agreement, which must state "שעור העמלות" (BRK-24, rules s.29ג(2)). That agreement and its fee annex are not published (see `psagot.md`).

**Inferred, not read.** The sheet's figures, 0.25% with a minimum of 50 in the trade currency, are the price list's "אג"ח חו"ל" row. Its "קרנות זרות" row has the same 0.25%. The exchange's form has only one row outside the US, so Psagot seems to have filled it with its highest rate, not its European share rate. On that reading the two documents do not contradict each other.

**Which row an Irish UCITS ETF falls under.** This is not settled by the documents:

- The row "מניות ו-ETF הנסחרות בבורסות אירופה" names ETFs. It does not say which exchanges count as "אירופה".
- The row "קרנות זרות" (0.25%, no minimum) could also cover an Irish fund. The list does not define it.

**Strength:** binding document for the printed rows; regulator-mandated publication for the sheet. **Answer:** unanswerable from published sources. Only Psagot's answer, or the signed fee annex, settles it.

## 2. The dollar conversion

**What the document says.** Part 5, item 1, "עמלת המרת מט"ח": "עבור המרה מדולר או לדולר – 1.5 אגורות עבור כל דולר/שקל עבור המרה למטבע אחר או ממטבע אחר – עד 0.5% משווי העסקה", "בעת ביצוע העסקה". The PDF, p.4, has the same words.

**What was searched, and found nothing:**

- Every Psagot page in the WordPress page list (73 pages) and every PDF in the media list (16 files).
- The FAQ, the two landing pages and the user guide.
- The exchange's sheet, which has no conversion row.
- A Google search.

No example, calculator or FAQ answer anywhere gives the unit.

**Inferred, not read.** The list prices the US commission in dollars and cents. A fee in agorot is shekels, so "per dollar" (0.015 ₪ for each dollar converted) is the natural reading. At about 3.12 ₪ a dollar that is about 0.48%, in line with the "עד 0.5%" printed for other currencies. Read per shekel, it would be 1.5%, three times the ceiling on other currencies. This is reasoning only. The words "דולר/שקל" allow both readings, and no document says which.

**Strength:** binding document, with ambiguous wording. **Answer:** unanswerable from published sources.

**Settled.** A dollar security is bought in dollars: "רכישה של ניירות ערך תתבצע במטבע הנקוב של אותו נייר. לדוגמא, רכישה של נייר ערך הנקוב בדולר על סמך יתרה שיקלית, תגרור חיוב ריבית דולרית" (HTML price list, the interest part). So CSPX, which trades in dollars, needs dollars:

- The conversion that applies is the dollar line, not "מטבע אחר".
- The commission is collected in dollars, and its 15 euro minimum is converted into dollars, by the Swiss franc example quoted in section 1.

## 3. Which exchanges, and whether London counts as "Europe"

What Psagot's documents say, word for word:

- **Price list:** "בורסות ארה"ב", "בורסות אירופה", "מניות בקנדה", "ני"ע באסיה ובאירופה". No exchange is named.
- **FAQ (resources_heb):** "מערכת המסחר שלנו מאפשרת גישה מלאה הן לבורסה לניירות ערך בתל אביב והן לשווקים הבינלאומיים המרכזיים בצפון אמריקה, אירופה ואסיה". Elsewhere it says "בישראל, אירופה וארצות הברית".
- **User guide, p.1:** "המערכת החדשה – Trade 2, הינה מערכת חדשנית, המאפשרת לסחור במניות בארץ, באירופה ובארה"ב".
- **Landing page en/website1:** "ממשק מתקדם להשקעה במגוון ניירות ערך ומכשירים פיננסיים בארץ ובארה”ב". Europe is not mentioned.
- **The custody policy** sets criteria for foreign brokers, such as membership "בבורסה בצפון אמריקה או באירופה". It names no custodian or exchange.

Searches for "לונדון", "London" and "LSE" across the WordPress search, every page and every PDF returned nothing.

**Answer:**

- **Read:** Psagot says in advertising and guides that it offers European markets. It names no exchange.
- **Not read anywhere:** whether London, Amsterdam or Xetra is reachable, and whether CSPX itself can be bought.
- **Inferred:** a London listing traded in dollars is "בבורסות אירופה" by geography. The document does not define the term.

**Strength:** company pages (advertising and a guide); nothing binding.

## 4. The US line and custody

- **US line.** The exchange's sheet matches the price list: "0.01 $ למניה", "6.50 $ לעסקה". Its label adds "מניות, אג"ח, קרנות נאמנות - רק ארה"ב". Nothing changes the recorded line.
- **Custody.** The sheet prints "דמי ניהול/טיפול פקדון ני"ע כללי - לפקדון", "0.0300% לרבעון", with a minimum of "0.00% לרבעון". It has no separate line for foreign securities, and the price list's item 8 ("דמי משמרת 0.12%, גבייה רבעונית 0.03%") is general too. Nothing changes the recorded line.
- **Averages actually charged, 2026-01-01 to 2026-06-30.** "קניה, מכירה ופדיון - ני"ע זרים" was 0.0460% to 0.1155% by portfolio band. "דמי ניהול - ני"ע זרים" was 0% in every band. These are facts, not prices (D56). The trade averages do not say which exchanges they cover.

## 5. Found on the way (for the existing record and report)

- **What the advert's "דמי ניהול" means.** The landing page en/website1 (modified 2026-09-16) reads **"פטור מלא מדמי טיפול (דמי ניהול חשבון), ללא הגבלת זמן"**. So Psagot's own advertising uses "דמי ניהול" for the account handling fee (part 6, item 1, "ללא עלות"), not for custody. This settles item 2 of "Still open" in `psagot.md` ("Psagot could say which fee it means"), and the "Read as custody: contradicted" verdict becomes "the advert means the handling fee: guaranteed".
- **A standing order exists in the advertising.** The same page says "השקעה חכמה: אפשרות להוראת קבע לרכישת ניירות ערך". The record's `left_out` entry says "no standing-order purchase plan was found in any document". Advertising does mention one. No fee for it is printed anywhere.
- **The same page says "קרנות נאמנות: פטור מעמלת ק/מ בקרנות כספיות ואקטיביות"** (advertising). The price list prints 0.07%, minimum 2 ₪, for mutual funds with no such exemption. This is a claim to add to the advertising table, not a price.
- **Issue 187** (a foreign fund listed in Tel Aviv). The price list's "קרנות זרות" row sits under item 5, "ניירות ערך בחו״ל", so it does not name a fund listed in Tel Aviv. No document read today names one either. The issue stays as it is.

## 6. Proposed data change (`data/fees/psagot@2026-11-04.json`)

No price value changes. The European price, the conversion unit and access to London all stay open, because no published document settles them and the price list itself tells the customer to ask first.

1. **`availability`, entry `foreign_securities`.** Stays `available: "unknown"`. Proposed `reason_he`: "בתעריפון המחיר על ניירות ערך באירופה לא סופי: ״עמלת ני״ע באסיה ובאירופה עשויה להשתנות בהתאם לסוג המניה ואופי הפעילות. באחריות הלקוח לפנות לחברה, על מנת לברר גובה העמלה לפני ביצוע הפעילות״. אף מסמך של פסגות לא מונה את הבורסות באירופה שאפשר לקנות בהן. גם ההמרה לדולר, ״1.5 אגורות עבור כל דולר/שקל״, אפשר לקרוא ביותר מדרך אחת, בין 0.48% ל־1.5%." This text needs the Hebrew editor. Append to `note`: "2026-11-04 (psagot-abroad.md): the exchange's sheet, read through api.tase.co.il loadmembercommissions?memberId=2881, has one row outside the US ('מניות, אג"ח, קרנות נאמנות - מחוץ לארה"ב', 0.25%, min 50 in the trade currency), equal to the tariff's 'אג"ח חו"ל' row; no Psagot page or PDF names London or any European exchange."
2. **`psagot-buy-sell-foreign-europe`, `rate.notes`.** Append: "The tariff adds 'באחריות הלקוח לפנות לחברה, על מנת לברר גובה העמלה לפני ביצוע הפעילות'. The fee is collected in the trade currency and the 15 euro minimum is converted into it ('העמלה המינימלית תהיה 15 יורו לאחר המרתם', the Swiss franc example). Which row an Irish UCITS ETF falls under, this one or 'קרנות זרות' (0.25%, no minimum), is not stated." The values stay at 0.15% and 15 EUR.
3. **`psagot-fx-conversion-usd`, `rate.notes`.** Append: "2026-11-04: no Psagot page, guide, form or the exchange's sheet gives the unit; a dollar security is bought in dollars ('רכישה של ניירות ערך תתבצע במטבע הנקוב של אותו נייר')." The value stays 0.015 nis_per_usd, with the reading marked as a reading.
4. **`left_out` and `advertising`.** These follow from section 5:
   - In the standing-order entry, replace "no standing-order purchase plan was found in any document" with: advertising (en/website1, 2026-09-16) offers "אפשרות להוראת קבע לרכישת ניירות ערך", and no fee for it is printed.
   - Add the claim "פטור מעמלת ק/מ בקרנות כספיות ואקטיביות" as advertising that the tariff contradicts.
   - Add "פטור מלא מדמי טיפול (דמי ניהול חשבון)" as the source that shows the advert's "דמי ניהול" means the handling fee.

## 7. For the rule base (owner to judge)

- **BRK-33** says the exchange's calculator "blocked plain fetches" and that "the reporting period is not shown on the page (open)". The data API `api.tase.co.il/api/commissions/loadmembercommissions?memberId=<id>` answers `curl` and gives `DateFrom`/`DateTo` for the averages: 2026-01-01 to 2026-06-30 for Psagot. The member ids are listed at `api.tase.co.il/api/commissions/loadcommissions`.

## 8. What would settle it

Any one of these would settle it. Each needs a person, not a script:

- Psagot's written answer to Trade@psagot.co.il, asking:
  - Is CSPX (IE00B5BMR087, LSE, USD) tradable?
  - Which row prices it?
  - Is the 1.5 agorot charged per dollar converted?
- The signed fee annex.
- A customer's trade confirmation for a London trade.
