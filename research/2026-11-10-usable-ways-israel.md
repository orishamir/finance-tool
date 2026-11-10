# Can a reader in Israel actually buy the way the indices page prices it? Standing orders, whole ETF units, fund minimums (2026-11-10)

The question: the indices page prices a monthly purchase of an Israeli tracking fund or Israeli ETF at Leumi, Massad and First International on a cheaper standing-order line (D41, F-12), and prices every monthly sum as if all of it is invested. Is the standing order open to the reader for those funds, and through which channel? Which ETFs on TASE cost more than a NIS 500 or NIS 2,000 monthly sum? Does any house set a minimum that a NIS 500 purchase of a tracking mutual fund misses?

**Short answer.**
1. **Leumi's standing order covers "קרנות נאמנות בישראל בלבד ורשימה חלקית"**: Israeli mutual funds only, and only a partial list. That is the bank's own channel table, linked from its service charter today. The list is not published. So no Leumi document shows that a given tracking fund is on it, and the table's words do not show that an ETF is. The tariff line (note 10) is real, but whether a reader can use it for a fund the page names is not shown. It can be set up at a branch, by phone, by ZOOM, on the Leumi Trade website (not the ordinary private site) and in the Leumi Trade app. It is not offered in the bank's ordinary private app.
2. **First International and Massad:** the only pages that name the service at all are the call-centre pages: "הקמה/שינוי/ביטול של הוראות קבע לקרנות נאמנות". At Massad the same line reads "(לא כולל הקמת הו"ק במסד)", so Massad's phone centre cannot set one up. Neither bank says whether one can be set up online, which funds qualify (the page says "קרנות נאמנות", the tariff says "קרן מחקה"), or names any amount or frequency. FIBI's own HighTech 10 leaflet lists a standing-order purchase among actions "שלא באמצעות האינטרנט או האפליקציה". That supports D56's reading that a standing order pays the non-internet rate.
3. **Whole units on TASE:** three of the 37 TASE-traded funds the site holds cost more than NIS 500 a unit (closing prices, 10.11.2026): iShares NASDAQ 100 (1159243) and iShares Core S&P 500 (1159250) above NIS 2,000, and Kesem NASDAQ 100 ETF (1146505) above NIS 500. The first two also cost more than NIS 2,000, so neither monthly sum buys even one unit. One more, Invesco MSCI World (1185164), costs just under NIS 500, so NIS 500 buys one unit only where the commission is small. Many others leave a large part of NIS 500 uninvested in a given month (the cash waits for the next purchase), among them Kesem TA-125, Kesem S&P 500 and Invesco NASDAQ-100.
4. **TASE's minimum order in continuous trading** is a monthly quantity worth about NIS 500. For 14 more of the funds (besides the three above NIS 500) that quantity is worth more than NIS 500 at today's price. So a NIS 500 monthly order cannot go into continuous trading at all; it can go only into the auction phases (pre-opening, pre-close, TAL), where one unit is enough. In 13 of the other funds the margin is under NIS 20, so any commission larger than the margin makes the order fall short there too.
5. **Tracking mutual funds:** no house's price list read prints a minimum order or purchase sum. The minimums found are minimum *commissions* and account-opening deposits: IBI NIS 15,000, Meitav Trade and Psagot NIS 10,000, Altshuler Trade NIS 5,000, Excellence NIS 4,500. Altshuler Trade's direct-deposit standing order for its own funds starts at NIS 500 a month, so a NIS 500 sum meets it exactly. Tracking funds are bought by amount (MF-11), so whole units do not apply to them.

Everything below was read on 2026-11-10 unless a row says otherwise. Nothing was written to `data/`, the rule base, `docs/` or code. TASE's prices are quoted here only as research evidence, with their date, and are not to be copied into `data/`.

## 1. Standing orders at Leumi, Massad and First International

What the data holds: `data/fees/leumi@2026-11-07.json` line `leumi-tracking-fund-standing-order` (0.225%, min NIS 5, max NIS 6,300, mutual-fund and ETF units). `data/fees/massad@2026-11-04.json` and `data/fees/fibi@2026-11-04.json`: `*-standing-order-tase-direct/branch` (0.64%, reduced min NIS 7, max NIS 7,000) and `*-standing-order-foreign-direct/branch`.

### Leumi

| Question | Finding | Exact words | Source | Read |
|---|---|---|---|---|
| Which securities | **Israeli mutual funds only, and a partial list.** The list itself is not published. | Row "פתיחת הו"ק לרכישת ני"ע (עבור קרנות נאמנות בישראל בלבד ורשימה חלקית)"; the same words on the row "ביטול הו"ק לרכישת ני"ע" | [ביצוע פעולות נפוצות, לפי ערוצי השירות ללקוחות](https://www.leumi.co.il/leumi-hebrew/s3fs-public/pdfFile/Service_0.pdf), p.8 (8/8), section "ניירות ערך". PDF created 26.03.2025. Library 48091ba529e816e7 (its text layer is poor; read on the rendered page) | 2026-11-10 |
| Is the table current | Linked from the bank's service charter page today | "ביצוע פעולות נפוצות, לפי ערוצי השירות ללקוחות: לצפייה בפירוט לחצו כאן" | [אמנת השירות](https://www.leumi.co.il/minisite/our_service_convention/), library 548f6fa08150d178 | 2026-11-10 |
| Channels to set one up | Branch, phone, ZOOM (private customers), the Leumi Trade website, the Leumi Trade app, and the business site and app through Leumi Trade. **Not the ordinary private app** (empty cell). | Columns: סניף פרונטאלי "V", טלפוני "V", ZOOM "V", אתר (פרטי) "רק דרך אתר לאומי טרייד", אפליקציה (פרטי) empty, אפליקציית לאומי טרייד "V", אתר (עסקים) "V דרך לאומי טרייד", אפליקציה (עסקים) "V דרך לאומי טרייד" | Same table, p.8; column heads on p.7 | 2026-11-10 |
| Price and channel | One price on any channel: the note names none (as the data says) | "בגין קנית קרן מחקה באמצעות הוראת קבע, תיגבה עמלה בשיעור 0.225%, מינ' 5 ש"ח מכסימום 6,300 ש"ח" | [Tariff updated 01/10/2026](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf), p.30, 4(א)(1) note 10. Library f31f4fdbee1483d9 | as in data, 2026-11-04 |
| Minimum or maximum amount per order | **Not stated.** Only the commission minimum and maximum above. | | Tariff; general terms 310-93; channel table | 2026-11-10 |
| How often it runs | **Not stated** | | | |
| Conditions | The bank may stop the standing order without notice if the account lacks cover | 3.7.3: "הלקוחות מתחייבים לדאוג לכיסוי מספיק בחשבון ... (2) במקרה של הוראת קבע לרכישת ני"ע - להפסיקה ללא מתן הודעה מוקדמת" | [General terms 310-93](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/General/chozim%20achidim/310-93%20-%20%D7%AA%D7%99%D7%A7%D7%95%D7%9F%20%D7%94%D7%9C%D7%95%D7%95%D7%90%D7%95%D7%AA%20%D7%90%D7%95%D7%9F%20%D7%A7%D7%95%D7%9C%20(002)%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9-PDFUA.pdf), p.14, s.3.7.3. Library 92690e4986a08814 | 2026-11-10 |

**What this does to the page.** D41 extends note 10 to Israeli ETFs on the tariff's own definition (MF-58). The definition holds, and Leumi's ETF page itself says "קרן סל הינה קרן נאמנות כמשמעותה בחוק" (library 2615f4fcb9f6290c). But the bank's operating document limits the *service* to a partial, unpublished list of Israeli mutual funds. No Leumi document shows that any particular tracking fund or ETF is on that list. On the guidelines' rule "silence is not a yes", the standing-order price at Leumi is a price for a service whose scope for the page's funds is **not stated**. A customer's screen in Leumi Trade, or a written answer from Leumi, would settle it per fund.

### First International (fibi)

| Question | Finding | Exact words | Source | Read |
|---|---|---|---|---|
| Who sets it up, where | The phone banking centre lists it. No site, app or capital-market page read names it (29 FIBI pages under /private/fibiaccount and /private/capitalmarket crawled). | "ניירות ערך ... הקמה/שינוי/ביטול של הוראות קבע לקרנות נאמנות"; and "ביצוע פעולות באמצעים הישירים הינם בהתאם לקיום הרשאה מתאימה בחשבון" | [מרכז שירות בנקאי](https://www.fibi.co.il/private/fibiaccount/infoactions/call/), library e567cc8c0f1268f8 | 2026-11-10 |
| Which securities | Page: "קרנות נאמנות". Tariff: "קרן מחקה" (note 13), defined in note 3 by the law and including "קרן להשקעות משותפות בנאמנות, שיחידותיה רשומות בבורסה". Whether the service accepts an ETF is **not stated**. | Note 13: "בגין רכישת/מכירת קרן מחקה באמצעות הוראות קבע תיגבה העמלה בכפוף לעמלת מינ' מופחת בסך 7 ש"ח" | [Tariff part 4](https://www.fibi.co.il/media/jqob143q/חלק-4-ניירות-ערך-31.pdf), p.1 notes 3, 13, 14. Library 4cfbcc09992df849 | as in data |
| Channel the price applies to | The bank's own leaflet puts a standing-order purchase among non-internet actions | "להלן הטבות בעמלות בעת ביצוע פעולות שלא באמצעות האינטרנט או האפליקציה: קניה של קרן מחקה באמצעות הוראות קבע (שיעור העמלה, לאחר הטבה, 0.1%, מינימום 5 ₪ ...)" | HighTech 10 leaflet, library 0f78d041cd99c818, p.3 (already in data) | as in data |
| Amount limits, frequency | **Not stated** | | Tariff; chapter ג 8.2025 (library 30db20eaa1f2c615) prints nothing on standing orders | 2026-11-10 |

### Massad

| Question | Finding | Exact words | Source | Read |
|---|---|---|---|---|
| Who sets it up, where | The phone centre (run by First International) can change or cancel a fund standing order, but **cannot set one up** at Massad. The page does not say where a Massad customer sets one up. | "הקמה/שינוי/ביטול של הוראות קבע לקרנות נאמנות (לא כולל הקמת הו"ק במסד)"; "השירותים ב"מסד CALL" ניתנים ע"י הבנק הבינלאומי הראשון לישראל בע"מ"; "תעריף ביצוע פעולות כמצויין בתעריפון הבנק" | [מרכז שירות בנקאי](https://www.bankmassad.co.il/private/accountmngment/servicess/call/), library 5583f995c5396281 | 2026-11-10 |
| Online | The app page lists only deposit and savings standing orders ("עדכון הו"ק (שינוי מועד וסכום הו"ק)" under פקדונות וחסכונות); nothing on securities | | bankmassad.co.il/private/accountmngment/digitalservices/application/ (not filed: says nothing on the question) | 2026-11-10 |
| Which securities | Page: "קרנות נאמנות"; tariff note 13: "קרן מחקה" (same wording as FIBI). ETF **not stated**. | | [Tariff part 4](https://www.bankmassad.co.il/media/qb0h1di4/חלק-4-ניירות-ערך-46.pdf), p.1 notes 3, 13. Library 14d10e0ed6b25245 | as in data |
| Amount limits, frequency | **Not stated** | | Chapter ג (library 22ac104aaabbb8f3) prints nothing on standing orders | 2026-11-10 |

### Other houses in `data/fees` with a recurring purchase for funds

Every one below is already in its record's notes or `left_out`. None prints a standing-order *price* line, so none is a missing priced line. Two facts are new or sharper:

| House | Service | Scope and minimum, in its words | Where | In data? |
|---|---|---|---|---|
| altshuler-trade | Direct-deposit standing order | "לרכישת קרנות נאמנות המנוהלות על ידי אלטשולר שחם ניהול קרנות נאמנות בע"מ", "החל מ-500 ש"ח בחודש", "מדי חודש"; footnote: "בשלב זה ... בלבד"; "סכום ההפקדה המינימלי עשוי להשתנות מעת לעת". One-time additions "החל מסכום של 1000 ₪". Bound by "הסכם תנאים כלליים להקמת הרשאה, אישור לחיוב חשבון והוראה מתמשכת בניירות ערך" (not published) | [as-invest.co.il/trade/direct_deposit/](https://www.as-invest.co.il/trade/direct_deposit/), library 1aea85b4bdef7273 | Notes only. It covers the site's fund 5139100 (אלטשולר שחם מחקה S&P 500). The price of each purchase is not printed |
| altshuler-trade | "השקעה חודשית קבועה" in the trading system | Any security; set amount, security, date; does not run if buying power is short | library 3f2efb55be47f51f | Notes |
| excellence | "הוראה מחזורית" | "מגדירים סכום ותדירות השקעה", start and end date; skips a month without funds | library 281434618d0953df | Notes |
| psagot | Advertised only | "מסחר אוטומטי: אפשרות להוראות קבע לרכישת ניירות ערך"; no terms, scope or minimum found | [psagot.co.il/1604-2/](https://www.psagot.co.il/1604-2/), library 9b4cd7bc0e53bb6d | Notes (from another page) |
| ibi | US alerts only | "מספק התראות בלבד ואינו מבצע מסחר אוטומטי" | in record | Notes |
| one-zero | US ETFs only | s.9.1 "רק עבור קרנות סל הנסחרות בבורסות בארצות הברית" | in record | Notes |
| hapoalim, mizrahi-tefahot, jerusalem, yahav | General terms know a securities standing order; no price | | in records | Notes |
| discount, mercantile | General terms know one (part ה); the full tariffs (library b576758838afae08, cc45f15d6d9fec45) print no securities standing-order line | | searched 2026-11-10 | Not mentioned in their records |

## 2. ETFs and foreign funds on TASE: whole units

**Source.** TASE's own security data (its prices are not reproduced here: TASE's terms forbid republishing its data; each fund's side of NIS 500 / 2,000 is kept), the JSON its market site serves for each security page: `https://api.tase.co.il/api/company/securitydata?securityId=<no.>&lang=0`, Referer market.tase.co.il, read 2026-11-10 after the close. "TradeDate" was "10/11/2026" and "LastDealTime" "סוף יום" for every fund. The price is "LastRate". It is in agorot: market value ÷ listed units and turnover ÷ units turned over both give the same NIS figure. (Checked on 1159250; the figures are TASE's and are not reproduced.) ETF-43 also says TASE quotes foreign funds in agorot. The response is TASE's data, so no copy was filed in the public library index; re-fetch it to check. Script: `/tmp/claude-1000/-home-ori-dev-finance-tool/ef47d141-e3fb-40de-a17c-a9d617d50c84/scratchpad/israel/tase_prices.sh` (scratchpad, not kept).

**The TASE rules.** The trading unit is one unit (ETF-67). The minimum order in continuous trading is a quantity of units worth the board's NIS 500. It is computed monthly at the end of the last trading day and rounded (to the nearest whole up to 100 units, to the nearest 10 from 101 to 1,000). The field "MinimumVolume" matches this rule in every row: 1144336, a unit of a few shekels, gives 100 units, the rounding to tens. The site's label for that field was not read (unreached), so the column is TASE's field name. The rule's own words: "בכל שאר סוגי הפקודות תהיה הכמות גבוהה או שווה לגודל מזערי של פקודה ... בשלב הרציף בלבד. בשלב טרום הפתיחה, במסחר פתיחה נוסף, במהלך הפעלת ממתן תנודות, בשלב טרום הנעילה ובפקודות TAL תהיה הכמות גבוהה או שווה ליחידת מסחר אחת". Source: [מדריך המסחר, הנחיות לחלק השלישי](https://content.tase.co.il/media/mwsduioc/274698.pdf), file p.42 (printed ב-28, "מעודכן עד ליום 10.8.25"), ch. ה' s.2ב(3)(א),(ג) and s.2ב(6). Library 5cceb61e1c070775.

"One unit" says which side of NIS 500 and NIS 2,000 one unit fell at the close of 2026-11-10, **before any commission and at the closing price rather than the ask**.

| TASE no. | Kind | Fund (name in our record) | One unit | 
|---|---|---|---|
| 1159243 | foreign fund | iShares NASDAQ 100 UCITS ETF USD (Acc) | **above 2,000** |
| 1159250 | foreign fund | iShares Core S&P 500 UCITS ETF USD (Accumulating) | **above 2,000** |
| 1146505 | Israeli ETF | קסם NASDAQ 100 (4D) ETF | **above 500** |
| 1185164 | foreign fund | Invesco MSCI World UCITS ETF Acc | just below 500: one unit fits NIS 500 only with a small commission |
| 1146570 | Israeli ETF | קסם (4A) ETF ת"א 35 | below 500 |
| 1146356 | Israeli ETF | קסם (4A) ETF ת"א 125 | below 500 |
| 1159235 | foreign fund | iShares MSCI ACWI UCITS ETF USD (Acc) | below 500 |
| 1146331 | Israeli ETF | קסם (4A) ETF ת"א 90 | below 500 |
| 1144385 | Israeli ETF | תכלית סל (4D) S&P 500 | below 500 |
| 1186063 | foreign fund | Invesco NASDAQ-100 Swap UCITS ETF Acc | below 500 |
| 1146471 | Israeli ETF | קסם S&P 500 (4D) ETF | below 500 |
| 1148162 | Israeli ETF | אי.בי.אי. סל (4D) S&P 500 | below 500 |
| 1143734 | Israeli ETF | תכלית סל (4A) NASDAQ 100 מנוטרלת מט"ח | below 500 |
| 1145804 | Israeli ETF | קסם MSCI World (4D) ETF | below 500 |
| 1165844 | Israeli ETF | מור סל (4A) NASDAQ 100 מנוטרלת מט"ח | below 500 |
| 1165810 | Israeli ETF | מור סל (4D) S&P 500 | below 500 |
| 1150333 | Israeli ETF | MTF סל (4D) S&P 500 | below 500 |
| 1209444 | Israeli ETF | אי.בי.אי. סל (4A) ת"א-90 | below 500 |
| 1201656 | Israeli ETF | ילין לפידות סל (4D) S&P 500 | below 500 |
| 1218916 | Israeli ETF | ATF סל (4D) S&P 500 | below 500 |
| 1150283 | Israeli ETF | MTF סל (4A) ת"א 125 | below 500 |
| 1150184 | Israeli ETF | MTF סל (4A) ת"א 35 | below 500 |
| 1150259 | Israeli ETF | MTF סל (4A) ת"א 90 | below 500 |
| 1147362 | Israeli ETF | קסם MSCI AC World (4A) ETF מנוטרלת דולר | below 500 |
| 1183441 | foreign fund | Invesco S&P 500 UCITS ETF Acc | below 500 |
| 1144237 | Israeli ETF | תכלית סל (4D) MSCI AC World | below 500 |
| 1149772 | Israeli ETF | אי.בי.אי. סל (4D) MSCI AC World | below 500 |
| 1148907 | Israeli ETF | הראל סל (4A) ת"א 35 | below 500 |
| 1143700 | Israeli ETF | תכלית סל (40) ת"א 35 | below 500 |
| 1143718 | Israeli ETF | תכלית סל (40) ת"א 125 | below 500 |
| 1201003 | Israeli ETF | MTF סל (4D) MSCI AC World | below 500 |
| 1148899 | Israeli ETF | הראל סל (4A) ת"א 125 | below 500 |
| 1148808 | Israeli ETF | אי.בי.אי. סל (4A) ת"א 125 | below 500 |
| 1148931 | Israeli ETF | הראל סל (4A) ת"א 90 | below 500 |
| 1143783 | Israeli ETF | תכלית סל (40) ת"א 90 | below 500 |
| 1149020 | Israeli ETF | הראל סל (4D) S&P 500 | below 500 |
| 1144336 | Israeli ETF | תכלית סל (4A) MSCI AC World מנוטרלת דולר | below 500 |

**Reading it.**
- **Above NIS 2,000:** 1159243, 1159250. **Above NIS 500 (but not 2,000):** 1146505. These cannot be bought at all with that monthly sum. A fraction trades only once a year, on 25 December (open question 21).
- **Continuous trading:** besides the three funds above NIS 500, there are 14 funds whose minimum quantity (TASE's "MinimumVolume" × the close) was worth more than NIS 500. In those a NIS 500 order cannot reach the minimum quantity even before commission: 1146331, 1144385, 1186063, 1146471, 1165844, 1150333, 1209444, 1218916, 1148907, 1143700, 1143718, 1201003, 1148899, 1149020. In the others the minimum quantity cost a little under NIS 500, so a commission can still push the order short. Such an order is accepted only in pre-opening, pre-close or as a TAL order (s.2ב(6)). Whether each house's site, app or standing order lets a customer use those phases was not checked.
- At NIS 2,000 every fund but the two iShares funds above NIS 2,000 can be bought, and the continuous minimum is met.
- Prices move. A fund near NIS 500 (1185164) can cross it in a month. These figures are one day's close.

## 3. Tracking mutual funds: minimums

| Question | Finding | Source | Read |
|---|---|---|---|
| A minimum purchase or order sum in a price list | **None found.** Every house's latest record in `data/fees` was scanned for order or purchase minimums. Only minimum *commissions* and account-opening deposits appear. MF-15: "most mutual funds have no minimum investment"; its open point ("Whether any distributor imposes a minimum order amount was not checked") is now answered for the price lists collected: none prints one. | `data/fees/*` latest; MF-15 | 2026-11-10 |
| Account-opening minimums (once, not per order) | IBI NIS 15,000; Meitav Trade NIS 10,000; Psagot NIS 10,000; Altshuler Trade NIS 5,000; Excellence NIS 4,500 (until 31.12.2026); Interactive Israel and Interactive Brokers none | `minimums.account_opening` in each record, with its quote | as in data |
| A house's own standing order with a floor | Altshuler Trade direct deposit: "החל מ-500 ש"ח" a month, Altshuler funds only (5139100 among the site's funds). One-time additions from NIS 1,000. The floor "עשוי להשתנות מעת לעת" | library 1aea85b4bdef7273 | 2026-11-10 (as filed) |
| Whole units | Unit prices from Maya's fund data (`maya.tase.co.il/api/v1/funds/mutual/<no.>`, field "purchasePrice"). The field is in agorot: the same API gives the ETF 1146471 "purchasePrice" [left out] against TASE's close [left out], the same figure. | Maya, read 2026-11-10 | 2026-11-10 |

Tracking mutual funds are bought by amount: the ISA's guide says the investor buys by amount and receives units (MF-11, מדריך למשקיע: קרנות נאמנות, 2017, pp.8, 27). Whole units do not apply to them. (Their unit prices, a few shekels each on Maya on 2026-11-10, are not reproduced: TASE's terms forbid republishing its data.)

## 4. For the rule base (not edited: for the domain-specialist)

- **MF-58**, conditions: "None of the three was found to publish a page or form listing which funds a standing order can buy" is out of date. Leumi's channel table (library 48091ba529e816e7, p.8) limits the standing order to "קרנות נאמנות בישראל בלבד ורשימה חלקית". FIBI's and Massad's call-centre pages name it "הוראות קבע לקרנות נאמנות", and Massad's adds "(לא כולל הקמת הו"ק במסד)". The rule should say the service covers a partial, unpublished list at Leumi, and that no document of the three shows an ETF or a given tracking fund on it.
- **ETF-67**: add s.2ב(6) (file p.42). The minimum quantity binds only in continuous trading; pre-opening, pre-close and TAL orders need one unit. Also add s.2ב(3): the minimum is recomputed monthly at the month's last close and rounded. Today it binds a NIS 500 order in most funds.
- **Open question 21**: narrowed for TASE. List prices above NIS 500 and NIS 2,000 (above) as research evidence, with the continuous-trading point.
- **MF-15**: its open point can be closed for the collected price lists (no order minimum printed). Altshuler Trade's NIS 500 floor applies to its own direct-deposit service only.

## 5. What stayed unreached or not stated

- Leumi's "רשימה חלקית" of funds open to a standing order: not published. It needs a customer's Leumi Trade screen or a written answer from Leumi.
- Whether FIBI or Massad let a customer set up a fund standing order in the site or app, and where a Massad customer sets one up (the phone centre cannot). Their pages name only the call centre.
- Any minimum or maximum amount per standing order, and its frequency, at all three banks: not stated anywhere read.
- Whether the three banks' standing orders accept an ETF at all: not stated in words by any of them.
- Psagot's advertised standing order: no terms found. The Trade user guide (psagot.co.il, 15 pp., January 2025) has no text on it, and knowledge.psagot.co.il/psagot-trade/ did not answer (connection failed).
- The label TASE's site shows for the "MinimumVolume" field: it is in a lazy-loaded script, not read. The field matches the guide's rule in every row.
- Whether each house's app or standing order can place an order in TASE's pre-opening or pre-close phase.
- Leads only, not cited: a hasolidit.com forum thread "הוראה מחזורית בסכום קטן" (5.10.26) says a bank standing order can buy "מספר קבוע של יחידות". No bank document read says whether its standing order is by amount or by units.

Fruitless searches are logged in `research/library/tried.jsonl` (three entries, 2026-11-10). New documents filed: 48091ba529e816e7 (Leumi channel table), 548f6fa08150d178 (Leumi service charter), e567cc8c0f1268f8 (FIBI call centre), 5583f995c5396281 (Massad call centre), 9b4cd7bc0e53bb6d (Psagot, why-us page).
