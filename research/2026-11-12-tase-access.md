# Can a private client in Israel buy a Tel Aviv fund at Interactive Israel and at Interactive Brokers? (2026-11-12)

The question, per company and per kind of fund:
- an Israeli ETF on the Tel Aviv exchange (קרן סל; classes `etf_units` and `tase_foreign_fund_units`);
- an Israeli index mutual fund not traded on the exchange (קרן מחקה; class `mutual_fund_units`).

Read first: `brokerage-account.md` BRK-41, BRK-43 and open question 9; `research/2026-11-04-binding-prices/interactive.md` sections 3 and 6; `research/2026-10-26-ibkr-permit.md`. Records: `data/fees/interactive-israel@2026-11-12.json` and `data/fees/interactive-brokers@2026-11-12.json`, copied from the 2026-11-04 snapshots with only the `availability` entries for these classes changed. No price line moved and nothing new ranks.

## The answers

| Company | Kind of fund | Answer | The words it rests on |
|---|---|---|---|
| Interactive Israel | Tel Aviv ETF | **No** (unchanged) | "באינטראקטיב ישראל נכון להיום, קנייה ומכירה של ניירות ערך ישראלים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד" ([israeli-stock-market](https://www.inter-il.com/israeli-stock-market/)) |
| Interactive Israel | Israeli mutual fund | **Still not written** (reworded) | Tariff p.5 prices "קרנות נאמנות" in EUR and USD only; no page names an Israeli fund or says one cannot be bought |
| Interactive Brokers | Tel Aviv ETF | **No** (was unknown) | "At this moment we do not offer trading on Tel Aviv Exchange (TASE) to retail clients who are a resident of Israel." ([FAQ 56713690](https://www.interactivebrokers.com/lib/cstools/faq/#/content/56713690)) |
| Interactive Brokers | Israeli mutual fund | **No, from the product list** (was unknown) | "Use our Mutual Fund Inventory Search Tool to identify funds by country of your residence" ([products-mutual-funds](https://www.interactivebrokers.com/en/trading/products-mutual-funds.php)); for residence Israel the tool lists no fund in shekels and no Israeli manager |

## Interactive Israel

### Tel Aviv ETF: no

All read 2026-11-12, in the company's own pages:
- **Israeli-market page**, https://www.inter-il.com/israeli-stock-market/ (WordPress dateModified 2026-10-14), above its list of 1,241 Tel Aviv securities ("מניות (499)", "תעודות סל (742)"): "באינטראקטיב ישראל נכון להיום, קנייה ומכירה של ניירות ערך ישראלים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד." Library a4772d58ad581978.
- **Company-account page**, https://www.inter-il.com/company-account/ (dateModified 2026-06-30), under "האם אפשר לסחור במניות ותעודות סל בישראל בחשבון חברה?": "כן, אפשר. באינטראקטיב ישראל, קנייה ומכירה של ניירות ערך ישראליים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד." Library 50c31ceacbb9ef6f.
- **World-markets page**, https://www.inter-il.com/world-markets/ (dateModified 2026-10-14), row "בורסת תל אביב": "מוצרים:מניות ותעודות סל", "המסחר בישראל מתאפשר לחברות או לפרטים עם פטור מתשלום מס בניירות ערך במקור בלבד." Library 31fd9a8d3d3fdb8e. **New, and worded differently**: it admits an individual who holds an exemption from withholding tax on securities. For a private client without such an exemption, both wordings say no. Which individuals can hold that exemption is not in the rule base (see "Still open").
- **Tariff** (23.09.2026, library 58a938374a90ac29), p.1: the Tel Aviv lines are "עבור מניות ותעודות סל הנסחרות בבורסת תל אביב".

The record keeps `available: false` and now quotes the page and gives `reason_he`. The 2026-11-04 note said the tariff "prints no mutual-fund line"; that was wrong (next section).

### Israeli mutual fund: still not written

- **Tariff p.5**, table "קרנות נאמנות": two rows, "EUR (%)" 7.5 with minimum "7.5 EUR", and "USD (Transaction)" 30 with minimum "7.5 USD". No ILS row.
- "קרנות נאמנות" also appears as a filter on the order-types page (https://www.inter-il.com/trading-orders/, library 5b9c3d724752b563) and in the hedge-fund page's product list (https://www.inter-il.com/hedge-fund/, library 73a3ccc455882a60). Neither names a fund.
- The world-markets page lists products per exchange, so it cannot show a fund that is not exchange-traded.
- Searched: all 795 pages in the site's sitemaps (pages, Q&A, FAQ categories, guides, instructions and blog posts), for "קרן מחקה", "קרנות מחקות", "מחקה", "קרן נאמנות", "קרנות נאמנות", "נאמנות", "מוסדיים בלבד", "בורסת תל אביב", "TASE". No sentence says whether a client can buy an Israeli mutual fund or tracking fund there. One blog post (/how-to-invest-correctly-in-the-dow-jones-index-the-complete-guide-for-the-beginner-investor/, dateModified 2026-06-29) says in general that "בשוק הישראלי קיימות קרנות מחקות של בתי השקעות מקומיים המאפשרות רכישה פשוטה בשקלים". It does not say they can be bought at the company, and it is advertising.

So the record stays `"unknown"`, with a reworded `reason_he` and the tariff p.5 as its source.

**BRK-41's Hebrew text** ("ואין בה קרנות נאמנות או קרנות מחקות ישראליות") says more than the documents. Its English text ("No page offers Israeli mutual funds or tracking funds") is right: the documents are silent.

**What would settle it:** a written answer from Interactive Israel (support address in its site terms) to: "Can a private client resident in Israel buy units of an Israeli mutual fund, including a tracking fund (קרן מחקה), in an account with you, and at what price?". Or a product list for Israeli funds from the company.

## Interactive Brokers (an account opened directly)

### Tel Aviv ETF: no

- **The company's FAQ**, entry 56713690, "How do I trade stocks on the Tel Aviv Exchange (TASE)?", filed under Trading & Margin > Products & Exchanges > Exchange Information / Request. Read 2026-11-12. https://www.ibkr.com/faq?id=56713690 redirects to https://www.interactivebrokers.com/lib/cstools/faq/#/content/56713690. Under "Please Note": "At this moment we do not offer trading on Tel Aviv Exchange (TASE) to retail clients who are a resident of Israel." The entry carries no date. Library 086be7aae6d90794.
  - How it was read: the FAQ page is script-built. The text was fetched with the same request the page makes to show an entry by its id (`/tws.proxy/faq/content`, `question_id` 56713690). The reply's type is `FAQ_BROWSER_CONTENT`, a written FAQ entry with a fixed id and place in the FAQ's tree, not the AI assistant's answer. **A person should open the URL in a browser and confirm the same words show.**
  - It covers all trading on the exchange, so it covers a Tel Aviv ETF and a foreign fund traded there alike. It holds whichever group company carries the account.
- **How it was found:** the knowledge-base article the search engine listed was at `ibkr.info/article/3382` (not `/node/3382`). The Wayback Machine has copies from 23.8.2019 to 1.2.2023. Its capture of 31.1.2024 is a 302 to `www.ibkr.com/faq?id=56713690`, so the article was moved into this FAQ entry. The archived article (library 7c19e234b3738e7a, a copy, corroboration only): "Who can trade TASE listed instruments? Non-Israeli residents, retail and corporate; Corporate clients in Israel who are tax exempt".
- **Corroboration:** NEWs @ IBKR 2019 vol.6 (https://www.interactivebrokers.com/en/general/communiques/2019/news-at-ibkr-02-2019-vol6.php, library bdad1ea243e5b63d): "IBKR institutional clients globally and retail clients outside of Israel can use their account to trade stocks on the Tel Aviv Stock Exchange".
- **Not in conflict:** the market-data page prices "Tel Aviv Stock Exchange (L1) - clients residing in Israel" (ILS 5.10 / ILS 226.00). Quotes are not trading, and an institutional client in Israel may trade there.

The record's `etf_units`/`tase_foreign_fund_units` entry goes from `"unknown"` to `false`. The Tel Aviv price and custody lines stay as printed. They ranked nothing before and rank nothing now.

### Israeli mutual fund: no, from the company's product list

- **The page**, https://www.interactivebrokers.com/en/trading/products-mutual-funds.php (library a93e2a463774894d): "Interactive Brokers offers access to over 50,000 mutual funds from over 500 fund families ... Our Mutual Fund Search Tool makes searching this extensive inventory straightforward", and "Use our Mutual Fund Inventory Search Tool to identify funds by country of your residence, commission charged, fund type or fund family."
- **The tool's own data**, read 2026-11-12 through the requests the products search page makes (`/webrest/scanner/funds/...`):
  - 56,354 funds in all, from 557 fund families (library f061a5b6d557a8a1). No Israeli manager among the families.
  - The only funds in ILS in the whole inventory are four UBAM Luxembourg share classes hedged to the shekel (ISINs LU2051743115, LU2051743206, LU2051745326, LU2051745599; library 885cde0abbe6e6f8).
  - For residence Israel: 14,972 funds, all read (library 00856797c3e15bf6). None has an Israeli ISIN (IL...), none has Israel or Tel Aviv in its name, none is in shekels (investment currencies: EUR 6,341, USD 5,676, GBP 1,705 and smaller ones, no ILS). Filtered to currency ILS for residence Israel: 0 (library c65ee49890b4f9a5).
- The mutual-fund price page (commissions-mutual-funds) prices no fund in shekels.

This is a "no" from the company's complete list for that client, as the brief allows, not from words: no page says an Israeli fund cannot be bought. The record's `mutual_fund_units` goes from `"unknown"` to `false`, with that stated in its note. **A person can repeat it in a browser:** Products, Exchanges and Contracts Search, Mutual Funds, region Israel, currency ILS.

### Which company carries the account: still open

Not needed for the answers above: the FAQ's words hold for any group company. A lead only: the products search script carries a table named `testList` that maps "Israel" to "IBLLC-US" (a developer's artefact, not a statement).

## Leads (not cited)

- Search engine: a listing for `ibkb.interactivebrokers.com/article/3382`, "Trading Securities listed on Tel Aviv Stock Exchange (TASE)". It led to the archived article and the FAQ entry.
- A Google search in a browser on 2026-11-12 found no company page placing "TASE" next to "Israeli residents". It found the portal release notes (www.ibkrguides.com/releasenotes/archive/portal-archive.htm), which do not say who may trade.
- bluewhitefinance.com/how-to-use-ibkr-faq/ (2021): "Interactive Brokers does not provide access to the TASE if you are an ..." (cut off). A third-party site.
- The IBKR products script's `testList` (above).

## Tried and failed

- `https://ibkb.interactivebrokers.com/article/3382`: redirects to `https://www.ibkr.info/article/3382`, which answers 403 to scripts and to the fetch tool. Not worked around.
- `ibkr.info/node/3382`, `interactivebrokers.com/kb/node/3382`, `ibkrguides.com/kb/en-us/article-3382.htm`: search page or 404 (2026-11-04). Also in a real browser on 2026-11-12. No Wayback copy under `/node/`.
- The Wayback Machine refused the library tool's fetch of the 2023 copy (429). The copy downloaded earlier the same day was filed instead.
- Interactive Israel's site: all 795 sitemap pages searched (above). No statement on Israeli mutual funds at the company.

## Still open

1. **Interactive Israel, Israeli mutual fund.** Settled by a written answer from the company, or a product list of Israeli funds (see above).
2. **Who can hold an exemption from withholding on securities.** Interactive Israel's world-markets page admits "פרטים עם פטור מתשלום מס בניירות ערך במקור". The rule base has no rule on which individuals can get such an exemption (TXS-05 covers the withholding only). Until it does, the record reads the page as closed to a private client without one.
3. **Interactive Brokers' FAQ entry carries no date.** The page should be opened in a browser to confirm the words show as fetched.
4. **Which Interactive Brokers company carries a direct Israeli account** (BRK-43, open question 9). It no longer decides any availability here.

## Second pass (2026-11-12): Interactive Israel and an Israeli mutual fund

**Answer: no.** It rests on three kinds of text, none of them advertising. No single sentence of the company says "no Israeli funds". Each step is a binding text or an official register, and no step rests on a page being silent.

### 1. The law: units are ordered through a distributor that is an exchange member, through the licensed clearing house

- Joint Investment Trust Law, ISA consolidated text (library d386a692cce2ad86):
  - p.3, s.1: "מפיץ" - חבר בורסה שניתן להגיש אצלו הזמנות ליחידות.
  - p.36, s.44(א): "הזמנות ליחידות המוצעות בתשקיף והוראות לפדיונן יוגשו למפיץ".
  - p.36, s.44(ב): "המפיץ יעביר למנהל הקרן באמצעות מסלקה". The law's "מסלקה" is the one defined in Securities Law s.44לא: "חברה שקיבלה רישיון לפתיחה ולניהול של מערכת סליקה לפי סעיף 50א" (Securities Law, ISA text, p.93, library 5b5d6552e5f5129e).
  - Already in the rule base as MF-11.
- Amendment 33 (ספר החוקים 3579, 2.8.2026, library 46c45ef0199b5fbb) amends s.1 only in items (א) to (ה). This was read on the page image of gazette p.1070 and p.1071, because the text layer is scrambled. None of those items touches "מפיץ". The ISA consolidated text runs to the 2024 amendment.
- A limit of the law alone: in this law "בורסה" also covers an approved exchange outside Israel (s.1, p.1), and "חבר בורסה" has no definition of its own there. So the definition alone does not shut out a member of a foreign exchange. The clearing-house bylaws below close that gap for whoever hands orders to the clearing house.
- **TASE clearing-house bylaws, part B, ch. י"ב "קרנות נאמנות פתוחות", s.3א** (update 115, to 11.11.25; library 0b27c90213042b30, p.89, sheet ג-64). The current file was downloaded on 2026-11-12 and is byte-identical to the library copy.
  - "חבר יעביר למסלקה, הזמנות ליצירת יחידות ... והוראות לפדיון יחידות בקרן."
  - "חבר משמורן, שאינו חבר בורסה, אינו רשאי להגיש הזמנות ליצירה או הוראות לפדיון."
- **The ISA's investor guide** (January 2017; library f4aa19056ef4fd8f) gives the same reading:
  - p.8: "מפיץ – חבר בורסה אשר ניתן להגיש אצלו הזמנות לרכישה או לפדיון של יחידות (בדרך כלל בנקים, אך גם בתי השקעות). המפיץ מעביר בכל יום למנהל הקרן, באמצעות מסלקת הבורסה ...".
  - p.27: "רכישת קרן נאמנות אפשרית באמצעות כל הבנקים וחברי הבורסה שאינם בנקים (שהוגדרו במדריך זה "מפיצים")".

### 2. The registers: neither company is a member

Read on 2026-11-12 through FlareSolverr, in TASE's own pages:
- **TASE member list** (library e3967a34d0f70c93), 25 members: 11 banks, 3 foreign banks, 8 non-bank members, and 3 remote members (Jefferies LLC, Jump Trading Europe B.V, Merrill Lynch International). The page says "הרשימה לא כוללת חברים משמורנים". This is the same list as BRK-32.
- **TASE clearing-house member list** (library 80edf78b84397c07). Under "חבר משמורן (אינו פועל במסחר כחבר)" it names Fair, Clearstream Banking S.A, Euroclear Bank SA/NV and הפניקס.
- Neither list names Mexem, Interactive Israel or any Interactive Brokers company.
- Euroclear and Clearstream are custodial members only. Under s.3א above they may not submit fund orders.
- Even if an IBKR company joined as a remote member, TASE's rules bar a remote member from serving Israeli clients (BRK-02).

### 3. The company's binding documents: the account, the custody and every order are Interactive Brokers'

- **Mexem's Terms of Use**, English, https://www.inter-il.com/terms-and-conditions/ (dateModified 2026-10-08; library 0729812a349cdf0d). The Hebrew version says the English prevails ("יגבר ויכריע תמיד הנוסח המקורי בשפה האנגלית"; library 958a0896783ebee5).
  - "“Client Account shall mean any and all accounts opened by you with IB on the Platform through this Website"
  - "“Platform” shall mean the IB’s online trading platform located at where you can trade in financial instruments and where your Client Account is located."
  - "“Orders” shall mean the reception and transmission of your orders by us and executed or further transmitted by IB with regards to financial instruments in your Client Account."
  - "With respect to the IB Brokerage Account, the Company ... is not the carrying broker, the custody broker, or the entity that operates or maintains the IB Brokerage Account. Responsibility for ... the custody of the Client’s assets ... rests with the relevant IB entity"
  - "You understand and agree that the Company acts as the intermediary for the Interactive Brokers."
- **Order Execution Policy**, October 2023, https://www.inter-il.com/order-execution-policy-oct-2023-2/ (dateModified 2025-09-29; library 11b7f57a0f07d6eb):
  - "The Company routes client orders for execution to another broker, Interactive Brokers (“the execution broker”), which then arranges to execute the relevant orders on various execution venues"
  - "It is clarified that the Company does not hold clients’ funds."
- So an Interactive Israel client can hold only what Interactive Brokers carries in that client's own IB account.

### 4. What Interactive Brokers offers that client

- Interactive Israel offers accounts at Interactive Brokers LLC and at Interactive Brokers Ireland (BRK-41). The first pass read the fund inventory on the .com site. This pass asked the Irish site the same question, with the request its products-search page makes (`/webrest/scanner/funds/products`, domain `ie`, residency `ISR`). Library a7e4abd6321fb12c.
- **Result:** 14,972 funds, all read, the same count as on .com.
  - ISIN prefixes: LU 11,297; IE 2,695; GB 663; FR 165; DE 83; CH 58; AT 7; NL 2; SE 2. **None is IL.**
  - Investment currencies: EUR 6,341; USD 5,676; GBP 1,705; and smaller ones. **None is ILS.**
  - No name mentions Israel or Tel Aviv.
  - Filtered to currency ILS: 0.
  - The funds settle through ALLFUNDS, FUNDSERV and FUNDSETL, none of which is a TASE distributor.
- Interactive Brokers' FAQ 56713690 (first pass) adds that it offers no Tel Aviv trading to retail clients resident in Israel.

### What this does and does not show

- Neither Mexem nor any Interactive Brokers company can itself hand a fund order to the clearing house: none is a member.
- The only route left would be Interactive Brokers holding the units through an Israeli member. Its own product list for a client resident in Israel holds no Israeli fund, on either entity's site.
- No document of either company says in words "Israeli mutual funds cannot be bought". A written answer from Interactive Israel would still be the plainest proof. It is not needed for "no".

### Route 1: the section 49A permit

- The general permit conditions (library 1f679ddf33e9b910) limit what a foreign *exchange* may offer: "ולא יכללו ניירות ערך הנסחרים בבורסה בישראל" (p.5, alternative 1(ג)). Alternative B, for brokers, sets no such limit.
- p.8: "יובהר כי אין בקבלת ההיתר כדי לפגוע בתחולתה של כל הוראת דין אחרת".
- The ISA's Q&A (update of 13.1.2025, library 0c40eda745541fae), question 4, pp.2-3: brokerage in securities not traded on a trading system needs no 49A permit, "ואולם, אין באמור כדי לפטור מחובות ומגבלות אחרות שעשויות לחול על הפעילות לפי דיני ניירות ערך, ובהן כאלה הנוגעות לזירות סוחר, הצעה לציבור של ניירות ערך, הצעת קרנות נאמנות ...".
- So the permit neither allows nor forbids Israeli fund units. The Joint Investment Trust Law governs them (section 1 above).

### Route 4: an exemption from withholding

- Not in the rule base, and no official text was read. Leads only: accountants' notes on the Tax Authority's forms 746 to 748 of 19.5.2025, for donations of listed securities.
- This belongs to the tax-specialist. It bears only on the Tel Aviv ETF row, which is already "no" for a private client without such an exemption.

### Leads (not cited)

- A search listing (financefeeds.com) titled "Interactive Brokers aims to join Tel Aviv Stock Exchange as remote member". TASE's list of 2026-11-12 has no Interactive Brokers company, and a remote member may not solicit Israeli clients (BRK-02; corrected 2026-11-12: the exchange's rules say "לא ישדל", not that it may not serve one).
- A search summary saying a company named Interactive is investment manager of some Migdal funds. Not followed: an investment manager of a fund is not a distributor, and the brokerage account is Mexem's.

### Tried

- The inter-il.com sitemaps now list 1,610 URLs, including the categories. The category `instructions-category/קרנות-נאמנות` holds two order-type instructions only (Basket, Market). The legal pages read: Terms of Use (English and Hebrew), Order Execution Policy, Client Categorization Policy, Investor Compensation Fund, Conflict of Interest Policy, Risk Disclosure, Market Discipline report. Besides the sentences quoted, none names Israeli funds.
- On interactivebrokers.com the funds request answers 400 with an empty `domain` and 500 with `us` or `en`; with `com` it gives 14,972.
