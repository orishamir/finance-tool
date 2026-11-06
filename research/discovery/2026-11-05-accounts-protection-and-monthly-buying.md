# Securities accounts on the indices page: who supervises them, what protects the money, the monthly purchase, and why the second pair leaves less

2026-11-05. Asked for by the founder after the decision audit of the indices page
(`research/audit/2026-11-05-indices-relevance/audit.md`, section 3 items 7 and 8, and the skeptic's section 4 item 1).

**The houses.** The page loads 20 tariff snapshots (`buildWorkbenchBundle`, 2026-11-05). Two are provident-fund managers, not
securities accounts (`meitav`, `phoenix`), so they are left out here. That leaves 18 houses: 10 banks, PEPPER (a house inside
Leumi, `part_of: leumi`, not listed on the page), 5 Israeli brokers that are members of the Tel Aviv exchange, and 2 foreign
brokers.

**How to read the tables.** Strength: *primary* means the law, a regulation, a regulator or the exchange's rules. *Institution*
means the house's own document. *Secondary* means the press or another third party. "Read" is what a document says. "Inferred" is
my reasoning from what was read. Rule ids (REG-, BRK-, TXS-, TXF-) are records in
`.claude/skills/il-finance/references/`; each carries its own link, page and checked date. Most of question 1 and question 2
was already in the rule base and in the price-list review of 4 November (`research/2026-11-04-binding-prices/`). This report puts
it per house, checks it, and adds what was new on 5 November.

---

## 1. Who supervises each house, and what protects the customer's securities and cash if it fails

### What holds for all houses of a kind (the general rule)

| Kind | Supervisor | Securities if the house fails | Cash if the house fails | Compensation scheme | Source, strength |
|---|---|---|---|---|---|
| Israeli bank | The Supervisor of Banks at the Bank of Israel (Banking Ordinance s.5) | **Open.** Every custodian must keep each client's assets identifiable (the custody committee's rules, adopted by the Supervisor on 16.1.2013), and every exchange member keeps a separate account for each client (exchange rules s.25ו). No text says the securities stay outside a failing bank's estate (REG open question 10). | A deposit at the bank. **Israel has no deposit insurance law.** The Governor, with the Government's approval, *may* guarantee deposits at a failing bank; that is a discretionary power, not a right (Banking Ordinance s.8יא). A 2026 law orders an examination of deposit insurance. A private bill (250,000 ₪) has stood at "tabled for preliminary reading" since 2.2.2026. | **None** | REG-01, REG-03 to REG-06, BRK-10; primary |
| Israeli broker that is a non-bank member of the exchange | **The exchange (TASE)** supervises its members, including their financial stability, under its rules. **The Israel Securities Authority (ISA) supervises the exchange**, not the broker's account business directly. | Held apart from the broker's own assets, **in trust for the clients**, in an account at the exchange's clearing house in the broker's name (exchange guidelines s.26ג, 26ד). The Trust Law lets the broker's creditors reach trust assets only for debts of the trust (s.3(ב)). So the securities should stay outside the broker's estate. That is *derived*: no text in force says it in words (REG open question 9). | Held in the broker's name in trust for clients, at a bank or a supervised foreign institution, apart from the broker's money and free of any lien (guidelines s.26ה). The cash is then a deposit at *that bank*, which has no deposit insurance (REG open question 21). | **None.** The 2019 joint regulators' report: "היעדרם של ביטוח פיקדונות וסכמת הגנה על נכסי לקוחות בישראל" (p.22). | BRK-04, BRK-07, BRK-08, REG-16, REG open question 9; primary (exchange rules approved by the ISA; the joint report) |
| Foreign broker serving Israelis under a section 49A permit | Its home regulator. The ISA permit requires the fixed sentence "פעילות בעל ההיתר אינה מפוקחת על-ידי רשות ניירות ערך". | The foreign scheme. SIPC (United States): USD 500,000, of which USD 250,000 cash, for a failed custodian only, not for market losses, with no residence requirement. Ireland's Investor Compensation Scheme: 90% of the net loss, up to EUR 20,000. | As above | Foreign only | BRK-06, REG-27, BRK-35; primary (law, ISA permit conditions, SIPC, Ireland's consumer regulator) |
| The fund itself, at any house | An Israeli tracking fund or ETF: the ISA. The fund's assets are vested in a trustee for the unit holders, apart from the trustee's property, and cannot be attached (Joint Investment Trust Law ss.76, 79). | The units are the customer's securities, as above. A failure of the fund manager or the trustee moves the fund to another manager (REG-11). | – | – | REG-10, REG-11; primary. **Missing from the rule base:** the same for an Irish UCITS fund (its depositary and the segregation of its assets). |

**New on 5 November: the broker licensing bill is still a bill.** The government bill that would license brokers and say in
words that clients' securities and money are not the licensee's assets ("הצעת חוק הסדרת העיסוק בשירותי מסחר בניירות ערך,
התשפ"ה-2025", government bill no. 1884) has status 141, "הונחה על שולחן הכנסת לקריאה ראשונה" (tabled for first reading). The
record was last updated on 13.7.2025 and names no committee. No law of that name is in the Knesset's list of laws.
- Source: [Knesset OData, KNS_Bill 2234109](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill(2234109)?$format=json), [KNS_Status 141](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status(141)?$format=json), [KNS_IsraelLaw search](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$filter=substringof('%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%20%D7%9E%D7%A1%D7%97%D7%A8',Name)&$format=json) (empty).
- Checked 2026-11-05. Strength: primary. Read.

### Per house

The supervisor column is what was read. The "data says" column is `provider.regulator` in the house's snapshot today.

| House (snapshot id) | Legal entity that holds the account | Supervisor (read) | Data says | Protection (by the kind above) | Source, strength | Read or inferred |
|---|---|---|---|---|---|---|
| לאומי (`leumi`) | בנק לאומי לישראל בע"מ | Supervisor of Banks; an exchange member | BoI | Bank row. Its own terms: securities may be pooled with other clients' securities, kept apart in its books, and returned as equivalent securities (BRK-47). | REG-03 (BoI list), BRK-32 (exchange list); primary. BRK-47; institution | Read |
| פפר (`pepper`) | בנק לאומי לישראל בע"מ. PEPPER is a brand inside Leumi. | Supervisor of Banks | BoI, `part_of: leumi` | Bank row | PEPPER's prices are an annex "לקוחות PEPPER" in Leumi's full price list (p.11); PEPPER's general terms (08.25) are published by Bank Leumi le-Israel B.M.; institution | Read that both documents are Leumi's; that the account is a Leumi account is inferred from them |
| הפועלים (`hapoalim`) | בנק הפועלים בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| דיסקונט (`discount`) | בנק דיסקונט לישראל בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| מרכנתיל (`mercantile`) | בנק מרכנתיל דיסקונט בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| מזרחי טפחות (`mizrahi-tefahot`) | בנק מזרחי טפחות בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| הבינלאומי (`fibi`) | הבנק הבינלאומי הראשון לישראל בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| מסד (`massad`) | בנק מסד בע"מ | Supervisor of Banks; exchange member. Not a clearing member; how it clears was not found (REG-14). | BoI | Bank row | REG-03, BRK-32, REG-14; primary | Read |
| יהב (`yahav`) | בנק יהב לעובדי המדינה בע"מ | Supervisor of Banks; exchange member. It also holds a section 49A permit for trading abroad, which the ISA does not supervise (BRK-46). | BoI | Bank row | REG-03, BRK-32; primary. BRK-46 (ISA list p.4); primary | Read |
| ירושלים (`jerusalem`) | בנק ירושלים בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| וואן זירו (`one-zero`) | וואן זירו הבנק הדיגיטלי בע"מ | Supervisor of Banks; exchange member | BoI | Bank row | REG-03, BRK-32; primary | Read |
| פסגות (`psagot`) | פסגות ניירות ערך בע"מ | The exchange, which the ISA supervises | ISA | Broker row | BRK-03, BRK-32 (exchange's member and clearing lists), BRK-04; primary (exchange rules) and institution (the exchange's periodic report, for how far it supervises) | Read |
| מיטב טרייד (`meitav-trade`) | מיטב טרייד בע"מ | The exchange, under the ISA | ISA | Broker row | BRK-03, REG-28; primary | Read |
| אלטשולר טרייד (`altshuler-trade`) | אלטשולר שחם טרייד בע"מ. Not the same company as "אלטשולר שחם פיננשיאל סרביסס", which the Bank of Israel lists as a financial institution (REG-03). | The exchange, under the ISA | ISA | Broker row | BRK-03, REG-14; primary | Read |
| אקסלנס (`excellence`) | אקסלנס ניהול השקעות וניירות ערך בע"מ (the exchange's clearing list). The data's name, "אקסלנס טרייד", is the brand. | The exchange, under the ISA | ISA | Broker row | BRK-03, REG-14; primary | Read the company name; that the brand's accounts sit at that company is inferred |
| אי.בי.אי (`ibi`) | שרותי בורסה והשקעות בישראל אי.בי.אי בע"מ | The exchange, under the ISA | ISA | Broker row | BRK-03, REG-14; primary | Read |
| אינטראקטיב ישראל (`interactive-israel`) | The account is opened at **Interactive Brokers LLC** (United States) or **Interactive Brokers Ireland**, as the client chooses. The introducer is Mexem Ltd, which uses the brand, is licensed by CySEC 325/17, and holds a 49A permit since 21.02.2024. | Home regulators: SEC, CFTC and FINRA (LLC), or the Central Bank of Ireland. **Not the ISA**, in the house's own words. | foreign, CySEC | SIPC up to USD 500,000 (USD 250,000 cash) at the LLC; the Irish scheme up to EUR 20,000 at the Irish entity | BRK-41, BRK-46, REG-26 (institution); ISA list of permit holders p.13 row 3 (primary); REG-27, BRK-35 (primary) | Read |
| Interactive Brokers (`interactive-brokers`) | **Not settled.** Interactive Brokers says the entity follows the client's country of legal residence and does not name Israel. Interactive Brokers LLC (SEC) and Interactive Brokers (U.K.) Limited (FCA) hold ISA 49A permits since 20.10.2021; the Irish entity does not. | SEC, CFTC and FINRA (LLC); FCA (UK); Central Bank of Ireland (Ireland) | foreign, SEC and CFTC or Central Bank of Ireland | By entity: SIPC at the LLC, plus an excess policy as the Irish entity states it (BRK-51); the Irish scheme at the Irish entity; the UK scheme not read | BRK-43 (institution and ISA list, primary); BRK-51 (institution) | Read. Which entity serves an Israeli resident: open. A web search on 5 November found nothing new. |

**One correction to propose for the data.** The five brokers carry `regulator: "ISA"`. What was read is that the exchange
supervises them and the ISA supervises the exchange (BRK-04, REG-13). The schema's list of regulators (BoI, ISA, CMA, foreign)
has no value for the exchange. I did not change it: that is a schema change for the lead. See "Proposed data fields".

---

## 2. Can each house run the monthly purchase automatically

"Standing order" here means an instruction the house carries out every month by itself (הוראת קבע לרכישה). Only a binding document
(price list, terms, account agreement) gives a price. A help page or an advert can show that the service exists, and is marked as
the weaker source.

Three houses price a standing order for a tracking fund on the indices page today: **Leumi, הבינלאומי and מסד**. Interactive
Israel's recurring plan prices the currency conversion at 0. The site already holds the standing-order lines in
`data/fees/*@2026-11-04.json` (`band: "הוראת קבע"` or `"השקעה קבועה אוטומטית"`). I checked them against the 4 November review.

| House | Is there a standing order? | Which securities | Price (binding document only) | Minimum amount per month | Source, strength | Read or inferred |
|---|---|---|---|---|---|---|
| לאומי | **Yes** | "קרן מחקה" (tracking fund). The site reads it as including Israeli ETFs, since the law defines a tracking fund (MF-58), and leaves out foreign funds listed in Tel Aviv. | **0.225%, at least 5 ₪, at most 6,300 ₪**, for a purchase only. No channel is named. | Not found | Leumi full price list 01/10/2026, part 4 note 10, p.30; institution (binding). The terms (310-93, p.14) say the bank may stop a standing order to buy securities. | Price read; the ETF scope is the site's reading of the law |
| פפר | Not found | – | – | – | PEPPER annex p.11 and PEPPER general terms (08.25). No PEPPER document names any fund on an index ("כל קרן על מדד: No PEPPER document names one"). | Not found |
| הבינלאומי | **Yes** | Tracking funds and Israeli ETFs in Tel Aviv; securities abroad | Tel Aviv **0.64%, at least 7 ₪, at most 7,000 ₪**. Abroad **0.85%, at least USD 4.5, at most USD 7,000**. The internet rate does not apply: note 9 limits it to "פעולה המבוצעת ישירות באמצעות האינטרנט", and the bank's HighTech 10 terms list a standing-order purchase among actions done "שלא באמצעות האינטרנט". | Not found | Price list part 4 (`חלק-4-ניירות-ערך-31.pdf`) p.1 note 13, p.2; institution (binding) | Price read; that the branch rate is the right one is a reading, stated in `research/2026-11-04-binding-prices/fibi-massad.md` |
| מסד | **Yes** | As at הבינלאומי | Tel Aviv **0.64%, at least 7 ₪, at most 7,000 ₪**. Abroad **0.8%, at least USD 4.5, at most USD 1,200**. | Not found | Price list part 4 (`חלק-4-ניירות-ערך-46.pdf`) note 13; institution (binding) | As at הבינלאומי (the channel reading is inferred) |
| הפועלים | **Yes**: the general terms (09.23) know "הוראת רכישה המתנהלת בהוראת קבע" (s.4.2.2, p.25; s.20.4, p.27) | Securities (not limited by kind in the terms) | **No price printed.** By the channel reading, the branch rate: 0.60%, at least 26 ₪ (inferred). A purchase placed online each month costs 0.40%, at least 20 ₪, which is what the site prices. | Not found | General terms 09.23 and the full price list; institution | Service read; price inferred |
| מזרחי טפחות | **Yes**: the securities terms (7.2025, s.5.7.2) know "הוראת קבע לרכישת ני"ע" | Securities | **No price printed.** Clerk price 0.64%, at least 50 ₪ (inferred). Online each month: 0.52%, at least 45 ₪. | Not found | Securities terms 7.2025 p.2; price list part 4 and annex E; institution | Service read; price inferred |
| ירושלים | **Yes**: the general terms (January 2024, s.138.3.2, s.151.2) | Securities and fund units | **No price printed.** Clerk price 0.55%, at least 20 ₪ (inferred). Online: 0.50%, at least 20 ₪. | Not found | General terms 01.2024; full price list 7012, annex E 08/06/2026; institution | Service read; price inferred |
| יהב | **Yes**: the account agreement (ch.5 s.1.1.2, p.39) knows "הוראת קבע לרכישת ני״ע/קרן נאמנות" | Securities and fund units | **No price printed.** Clerk price 0.55%, at least 32 ₪ (inferred). Online: 0.40%, at least 20 ₪. | Not found | Account agreement; price list 2026; institution | Service read; price inferred |
| דיסקונט | **Not found** | – | No line in the price list | – | Discount price list and annex A (22/06/2026); institution. The general terms were not searched for a standing order. | Not found |
| מרכנתיל | **Not found** | – | No line in the price list | – | Mercantile price list; institution. General terms not searched. | Not found |
| וואן זירו | **Yes, but US ETFs only**: "השירות פעיל בשלב זה רק עבור קרנות סל הנסחרות בבורסות בארצות הברית" (s.9.1) | ETFs traded in the United States. **Not** a tracking fund or ETF in Tel Aviv. | No fee of its own. Each purchase pays the plan's commission: without a plan 0.3%, at least USD 24, plus conversion at 0.15%, at least USD 5, at the bank's own rate (s.7.2, s.4.4.2). The bank may change or end the service at any time (s.9.6). | Not found | Standing-order terms, information/5751; institution (binding) | Read |
| פסגות | **Advertised only**: "אפשרות להוראת קבע לרכישת ניירות ערך" | Securities | **No fee printed** in the price list or the exchange's sheet. Each monthly buy would be an ordinary trade. | Not found | Advertising, psagot.co.il/en/website1 (modified 2026-09-16, library 505596403a04c846); weaker source. Price list: nothing. | Existence from advertising only |
| מיטב טרייד | **Not found**: no page offers a standing order to buy. The deposits page gives account details for a standing order of cash only. | – | – | – | Price list part 4(א); deposits page; institution | Not found |
| אלטשולר טרייד | **Yes (help pages)**: the monthly-investment page lets any security be picked. An older direct-deposit page buys only Altshuler's own funds, from 500 ₪. | Any security (monthly-investment page) | **No standing-order line.** Each buy is an ordinary trade: funds 0.15%, at least 16 ₪, or 3.5 ₪ for an ETF in continuous trading. The joining page's "ללא עלות" is an advert for new customers. | 500 ₪ on the older own-funds page only | Pages /trade/monthly_investment/ (library 3f2efb55be47f51f) and /trade/direct_deposit/ (1aea85b4bdef7273); weaker source. Price list; institution. | Service from the house's pages; price read |
| אקסלנס | **Yes (help page)**: "מגדירים סכום קבוע להשקעה בכל חודש" (recurring instruction) | Any security in its system | **No line.** Each buy is a trade at 0.4%, at least 10 ₪. | Not found | /trading/extrade-pro/recurring-instruction/ (library 281434618d0953df); weaker source. Price list; institution. | Service from the house's page; price read |
| אי.בי.אי | **No on Tel Aviv.** Its "standing order for US trading" sends reminders only: "שירות הוראות הקבע מספק התראות בלבד ואינו מבצע מסחר אוטומטי". | – | Each purchase pays the account's regular fees | – | /solutions/standing-order-for-us-trading/ (library ede774e476e7d32a); institution | Read |
| אינטראקטיב ישראל | **Yes**: a recurring plan that buys "כל מניה או תעודת סל שתבחרו" automatically | Stocks and ETFs abroad. Not Tel Aviv: that is for institutional clients only (BRK-41). | Conversion inside the plan is free: "בזמן ביצוע המרת מטבע במסגרת תכנית השקעה אוטומטית קבועה אין חיוב בגין עמלת המרת מט"ח" (price list p.6). Each purchase pays the regular commission, at least USD 2.5. No document fixes the conversion *rate*. P.7 lets the company withdraw a benefit without notice. | Not found | Price list 23.09.2026 pp.6-7; institution (binding). Plan page /recurring-transfer/ (library 121e0bc56cfc7437); weaker source. | Read |
| Interactive Brokers | **Yes (help page)**: "Recurring Investments" buy on a daily, weekly or monthly schedule, using fractional shares. **New on 5 November.** | "available US, Canadian and European shares". Whether the Irish S&P 500 fund on the London exchange is eligible was not found. | No fee of its own on the page. Each purchase is priced at the account's commission (BRK-42). | Not found | [Interactive Brokers: Recurring Investments](https://www.interactivebrokers.com/en/trading/recurring-investments.php), read 2026-11-05, library 313d1b606db3b24f; institution (help page, weaker) | Read |

**In short.** 13 of the 18 houses run some automatic monthly purchase: 8 banks by their terms or price list (One Zero for US
ETFs only), 3 brokers by their own pages or advertising (Altshuler, Excellence, Psagot), and both foreign brokers. Three price one for a Tel Aviv tracking fund in a binding document (Leumi, הבינלאומי, מסד).
Four banks know the service in their terms but print no price for it (הפועלים, מזרחי טפחות, ירושלים, יהב). One Zero runs it
only for US ETFs, and IBI's is reminders only. Nothing was found at Discount, Mercantile, Meitav Trade and PEPPER. No document at
any house states a minimum monthly amount, except Altshuler's older page for its own funds (500 ₪).

---

## 3. Why the second pair leaves less

**The plan:** S&P 500, 10,000 ₪ now, 500 ₪ a month, 10 years, 7% a year, inflation 2%, the dollar flat, list prices.

Every figure below comes from the site's own functions: `buildInvest`, `pairCosts`, and the engine's run detail behind
`pairOf` and `priceMany`. They were run from an unchanged copy of `site/app/lib/invest.ts` with those two functions exported. The
script is `/tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/decomp.ts`; run it from
the repository root with `npx tsx`. No figure is typed by hand. The site's money is in today's shekels; the run's tax detail is in
shekels at year 10, and dividing by `I_T = 1.02^10 = 1.21899` turns it into today's money.

| | פסגות · ילין לפידות מחקה (4D) | אינטראקטיב ישראל · iShares Core S&P 500 UCITS (Acc), bought abroad | Gap |
|---|---|---|---|
| Left, today's ₪ | 86,492 | 84,184 | **2,308** |
| Account (before the tax it saves) | 1,057 (+3 interaction) | 1,298 | +238 |
| Fund (its own costs) | 116 | 404 | +288 |
| Tax, today's ₪ | 5,703 | 7,483 | **+1,780** |
| Nominal gain at year 10 | 36,738 | 36,485 | −253 |
| Inflationary amount (exempt part) | 8,928 | 0 | |
| Real gain taxed | 27,809 | 36,485 | |
| Tax at year 10, nominal | 6,952 | 9,121 | |

The parts add up to the gap within ±3 ₪ of rounding.

**The tax gap splits into two pieces:**

`tax gap = 0.25 × (real gain at Interactive − real gain at Psagot) / I_T
         = 0.25 × 8,928 / I_T  +  0.25 × (36,485 − 36,738) / I_T
         = 1,831 ₪  −  52 ₪  =  1,779 ₪`

1. **1,831 ₪: the index that measures the real gain.** This is almost all of the tax gap, and so about four fifths of the whole
   2,308 ₪.
   - The Yelin fund is an Israeli exempt fund in shekels. Its gain is measured above the CPI, and the part equal to inflation
     (8,928 ₪ at 2% a year) is not taxed.
     Rules: TXS-09 (an exempt fund's real capital gain at up to 25%, withheld at 25%, s.91(ב)(1) and reg. 3א of the withholding
     regulations); TXS-14 first limb (shekel units: CPI, s.88 "מדד"); TXS-01 and TXF-02 (25%, s.91(ב)(1)).
   - The Irish fund is a security in dollars. **For a security in a foreign currency, the law makes the exchange rate the index**
     ("יראו את שער המטבע כמדד", s.88). It is mandatory, not an election. With the dollar flat, the inflationary amount is 0, so
     the whole shekel gain is taxed.
     Rules: TXF-03 and TXS-04 (s.88; ע"א 3555/15 מוזס; circular 10/2025).
   - Method: F-40 (`τ_exit = 25% × max(0, real)`, "the index J is CPI, or the exchange rate for a foreign-currency security"),
     F-04 ("X replaces I as the tax index"), F-91 (the split by who takes it). The tax at a foreign broker is paid by advance,
     not withheld (TXF-22); the engine charges it at the same time, so the timing does not change the figure.
   - *Inferred from the formula, not run:* this piece exists because the plan pairs a flat dollar with 2% inflation, which
     means the shekel gains 2% a year in real terms. If the dollar rose at the CPI's pace, the two inflationary amounts would
     about meet and this piece would mostly go. So the 1,831 ₪ is the plan's currency assumption acting through the tax law,
     not a fixed cost of buying abroad.
   - *Checked:* is the Yelin fund a "foreign-investment fund", whose index would be its principal currency (TXS-14 third
     limb)? Its report of 14.12.2025 does not call itself one. Its asset table holds 61.6 to 66.8% "ני"ע הנכללים במדד תל
     גוב" and reaches the S&P 500 through a swap (library 5e4ed21a880adf07, p.2 asset table). That is short of the 90% test.
     So the CPI index stands. Whether it is one: read that the report does not say so; inferred from the asset mix that it
     fails the test.
2. **−52 ₪: the smaller taxed gain.** Interactive's pair pays more in account and fund costs (+238 and +288 before tax), so it
   ends with 253 ₪ less nominal gain and pays 25% less tax on it. Of this, the fund's costs save 71 ₪ more tax at Interactive
   than at Psagot (100 against 29, running each pair with the fund's costs off). The account's costs and their interaction make
   up the other +19 ₪. Rule: the same 25% (TXS-09, TXF-02); method F-91.

Nothing else is in the tax gap. Both funds accumulate, so neither pays tax on a distribution (`israeliTaxOnDistributions` 0 at
both). Neither has surtax at this size.

### Is counting the withholding inside the Irish fund as 0 right?

**No, by the rule base and by the site's own method.**

- **The rule.** TXF-16: tax withheld from a foreign fund on its own holdings is paid by the fund, not by the Israeli resident,
  so it cannot be credited in Israel and is a cost inside the fund. For an Irish fund on US shares, the US-Ireland treaty sets
  the rate at 15% of the dividends, if the fund passes the treaty's limitation-on-benefits article (Art. 10(2)(b), Art. 23).
  Source: Ordinance s.199 ("מסי־חוץ"); IRS treaty table; the treaty text; checked 2026-10-26; primary. TXF-28 adds that Ireland
  itself deducts nothing from the holder.
- **The method.** A-11 in `docs/method.md`: "Irish-domiciled holding US shares 15% of the dividend yield (TXF-16)".
- **The data.** The fund record `data/funds/ie00b5bmr087@2026-10-31.json` leaves `fund_level_withholding_drag` empty, with the
  note that the factsheet prints no figure, and no dividend yield is collected anywhere. So the engine reads 0. The same goes
  for `tracking_difference_12m` and for the yearly gap to the index (F-92), which would carry this cost if the yearly returns
  were collected.
- **The gap is in an input, not in the rule.** The rule base has the rate. The yield it applies to is a market figure, which I
  did not fill in. Whether this fund qualifies under the treaty is the fund's own fact (TXF-16, open question 7).
- **The scale, computed by the site's functions as a sensitivity and not as a figure for the page:**
  - every 0.1 point a year of drag inside the fund takes **424 ₪** off Interactive Israel's 84,184 ₪;
  - 0.2 point takes 845 ₪ (to 83,340), which puts it under לאומי's 83,396 ₪;
  - 0.3 point takes 1,262 ₪ (to 82,922).

  The same drag would lower every row that holds this fund, including Interactive Brokers (82,848) and the Irish fund listed
  in Tel Aviv at פסגות (86,279).
  - *Inferred:* with 15% of a dividend yield of about 1 to 1.5%, the drag would be 0.15 to 0.23 points a year, so second place
    can change. I state that range only as a scale. A dividend yield taken from a source is needed before any figure goes on
    the page.
- **Fairness note (inferred).** The Israeli funds' rows carry their shortfall from their own reports (F-92), which already
  includes whatever withholding they bear inside their swaps. The Irish fund's row carries only its 0.07% fee. So today the
  comparison counts that cost for one side and not the other.

---

## Rule findings, for the rule base's owners

In the rule base's own format. The lead or the file's owner moves them in.

**BRK-05, replace the press source (domain-specialist, `brokerage-account.md`).**
- Rule: The government bill "הצעת חוק הסדרת העיסוק בשירותי מסחר בניירות ערך, התשפ"ה-2025" (government bill no. 1884) is at
  status 141, "הונחה על שולחן הכנסת לקריאה ראשונה". It is not law. Its s.33(ב) would say that clients' securities and money are
  not the licensee's assets (REG open question 9 already cites the text).
- Source: [Knesset OData KNS_Bill 2234109](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill(2234109)?$format=json) (LastUpdatedDate 2025-07-13, no committee); [KNS_Status 141](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status(141)?$format=json); KNS_IsraelLaw search by name returns nothing.
- Checked 2026-11-05 · primary · Scope: general · Dimensions: `regulator`, `protection` · Likely to change: yes.
- Effect: the open question's "the bill's progress" is answered for now. The Calcalist line of 2024 can drop to context.

**New institution record: Interactive Brokers, Recurring Investments (`brokerage-account.md`).**
- Rule (Interactive Brokers' own statement): "The Recurring Investments feature lets you setup and execute a predetermined
  investment strategy by automatically investing funds on a recurring schedule … Select from available US, Canadian and European
  shares … (daily, weekly or monthly) … Recurring Investments uses fractional shares trading."
- Conditions: no fee is named on the page. It does not say whether a UCITS ETF on the London exchange is eligible, or which
  entity serves a resident of Israel (BRK-43 open question).
- Source: [Interactive Brokers: Recurring Investments](https://www.interactivebrokers.com/en/trading/recurring-investments.php), library 313d1b606db3b24f.
- Checked 2026-11-05 · institution · Scope: institution: Interactive Brokers · Dimensions: `fee-trade` · Likely to change: possible.

**REG-28-style line for PEPPER (domain-specialist, `regulators-and-protection.md`).**
- Rule (institution): PEPPER's general account terms (08.25) are Bank Leumi le-Israel B.M.'s, and PEPPER's prices are an annex
  "לקוחות PEPPER" in Leumi's full price list (p.11). *Inferred:* a PEPPER account is a Leumi account, under the Supervisor of
  Banks, with Leumi's protection (REG-04 to REG-06, BRK-47).
- Sources: [PEPPER general terms](https://www.pepper.co.il/pepper/s3fs-public/home-v11/tnaei_nihul_pepper_0.pdf) p.52; [Leumi full price list](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf) p.11.
- Checked 2026-11-04 (by the price-list review) · institution · Scope: institution: Bank Leumi (PEPPER) · Dimensions: `regulator`, `protection`.

**TXS-14, a worked case (tax-specialist, `tax-securities-israeli.md`, "Conditions").**
- Note: an Israeli S&P 500 tracking fund that reaches the index by swap and holds mostly Israeli government bonds does not meet
  the foreign-investment fund's 90% test. Its inflationary amount follows the CPI. Example: ילין לפידות מחקה (4D) S&P 500,
  report of 14.12.2025, asset table: "ני"ע הנכללים במדד תל גוב" 61.6% to 66.8%.
- Strength: the report is institution, for its own assets. That it fails the test is a reading.

**TXF-16, no change to the rule.** The rule is complete for the question. What is missing is a data input (the dividend yield,
or the fund's yearly returns for F-92), and that belongs to `data-update`. Open question 7 stays: whether this fund passes the
treaty's limitation-on-benefits article.

**Missing from the rule base (stop).**
1. What protects the assets of an Irish UCITS fund: its depositary, and the segregation of its assets. This is the counterpart
   of REG-10 for Israeli funds. I did not fill it.
2. The UK investor compensation scheme, for an account at Interactive Brokers (U.K.) Limited. I did not fill it either.

---

## Proposed data fields (the schema has no place for these, so nothing was added)

`docs/data-schema.md` section 3.6 already carries `provider.regulator`, `regulator_foreign`, `protection_rule_ids` and `part_of`,
and every house has them. It has no place for the other facts above:

1. `provider.supervised_by: "exchange"` (or a value `TASE` in `regulator`), for a non-bank exchange member. Today those houses
   read `ISA`, while what was read is that the exchange supervises them and the ISA supervises the exchange (BRK-04).
2. `provider.legal_entity: { name_he, register?, source }`, the company that holds the account. It settles PEPPER (Leumi),
   Excellence (the brand against the company) and Interactive Brokers (open), and lets the page say whose failure matters.
3. `provider.protection_scheme: { name, ceiling, currency, cash_ceiling?, rule_id } | { none: true, rule_id }`, so a figure can
   travel with its protection status as the product asks. For an Israeli house: none (the 2019 report, REG-04); SIPC or the
   Irish scheme by entity.
4. `standing_order: { offered: true|false|"not_found", classes, source: { url, kind: "terms"|"price_list"|"help_page"|"advert", checked, quote }, line_id? }`
   on the snapshot. It records that the service exists apart from its price. Today a house with the service but no printed price
   (הפועלים, מזרחי טפחות, ירושלים, יהב, אלטשולר, אקסלנס, פסגות) cannot be told apart from one without it (דיסקונט, מרכנתיל,
   מיטב טרייד).
5. On fund records: `tax_status.foreign_investment_fund: { principal_currency } | null`. The engine would then use the principal
   currency as the index where a fund is one (TXS-14). Today every Israeli shekel fund is indexed to the CPI.

No data file was changed, so `npm run validate` was not needed.

---

## Still open

1. **Interactive Brokers: which entity holds a resident of Israel's account**, and so which scheme applies. Settled by the
   entity named in the account agreement or on the activity statement.
2. **The standing-order price at the four banks that know the service but print no price** (the branch or clerk rate, by the
   reading of the internet-rate notes). Settled by a written answer from each bank or a customer's statement. It moves nothing
   below the minimum: for example at Bank of Jerusalem, below about 3,600 ₪ a month.
3. **Discount and Mercantile.** Their general terms were not searched for a standing order. Only the price lists were read.
4. **A minimum monthly amount** for any standing order: not found at any house, except Altshuler's own-funds page.
5. **Whether the Irish S&P 500 fund is eligible** for Interactive Brokers' and Interactive Israel's recurring plans.
6. **The withholding drag of the Irish fund:** a sourced dividend yield, or its yearly returns against its benchmark (F-92).
   Until then, second place on the page rests on a cost counted as 0. A product-level note in the meantime is the founder's call.
7. **What happens to securities at a failing bank or broker**, and who bears a shortfall (REG open questions 9, 10, 21). It is
   still not stated in any text in force.
8. **The rule-base gaps above:** the Irish fund's depositary, and the UK scheme.

## Files

- This report.
- Library: added 313d1b606db3b24f (Interactive Brokers, Recurring Investments) and 5e4ed21a880adf07 (Yelin S&P 500 tracking
  fund report, 14.12.2025).
- Scratch, not in the repository: `decomp.ts`, `invest-probe.ts` and `houses.ts` in
  `/tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/`.
