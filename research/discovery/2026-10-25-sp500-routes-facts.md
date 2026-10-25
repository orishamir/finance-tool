# How to buy the S&P 500: facts before designing (2026-10-25)

The founder's question: with 6,000 NIS now and 400 NIS a month into the S&P 500, does the site help choose the way to do it? The choices he named:
- the broker;
- iShares Core S&P 500 (and whether in London or Tel Aviv), an American ETF, or an Israeli fund;
- for an Israeli fund, an ETF or a tracking fund, and which manager.

He asked to define the functionality and how it fits the interface before anything is programmed. This file gathers the facts. Nothing here is a design decision.

Method: the plan was run through the built site with the founder's numbers, 20 years, and a 7% yearly return typed in by Claude only so that the site would rank. The site ranks nothing in equities for 20 years without an entered return (D9/D10). The code and data were read where the pages disagreed.

## 1. The decision, level by level

| Level | Options | Notes |
|---|---|---|
| Product | Securities account; kupat gemel lehashkaa; study fund; IRA; pension and others | The comparison page answers this today |
| Broker | 14 Israeli banks and investment houses with a collected tariff; foreign brokers (for example Interactive Brokers, through an ISA 49A permit, BRK-06) | No foreign broker has a tariff in `data/fees/` |
| Route | (a) An Israeli fund (ETF or tracking fund). (b) A foreign fund registered on TASE, bought in shekels (e.g. iShares CSPX, TASE 1159250, ETF-32). (c) A foreign fund bought abroad: an Irish UCITS such as CSPX in London, or a US ETF such as IVV | (b) and (c) can be the same share class and ISIN (ETF-27) |
| Fund | Manager; ETF or tracking fund; currency-hedged or not; distributing or accumulating | An ETF trades on the exchange during the day. A tracking fund is bought and redeemed once a day at its unit price through a distributor (ETF-04) |
| Behaviour | Orders a month (A-28) | One order per monthly deposit by default |

The levels are not independent:
- A foreign broker serves only route (c). An Israeli broker serves all three.
- Each broker prices the instrument classes differently. The tariffs have separate lines for `etf_units`, `mutual_fund_units` and `foreign_securities`, plus FX conversion lines. So the cheapest broker can depend on the fund, and the cheapest fund on the broker.

## 2. How much each level moves the result (this plan, 7% typed, 20 years, today's shekels)

| Level | Range | Detail |
|---|---|---|
| Broker, same fund | 2,320 to 50,345 NIS in broker fees | Psagot Trade 2,320; One Zero 8,086; Jerusalem 9,545; Hapoalim and Yahav 13,592; Leumi 15,020; other banks 17,000 to 21,000; Altshuler Shaham Trade 46,610 and Excellence 50,345 (high monthly account fees) |
| Fund, same broker (Psagot) | 139,035 to 155,116 | The IBI ETF (0.8% fixed + 0.3% variable) is the outlier. The other seven are within 4,700 of each other |
| Product | 155,116 against 145,967 | Securities account at Psagot against a kupat gemel lehashkaa |
| ETF against tracking fund, same manager (Yelin Lapidot, at Psagot) | 150,447 against 155,116 | Mostly the funds' own fees |
| Route (Israeli fund / iShares in Tel Aviv / iShares in London / US ETF) | Not measurable yet | See section 4 |

The order of the levers for this plan: the broker, then the fund (mainly by avoiding the expensive one), then the product. The route's size is unknown. This matches Doron's case (the broker beat the product; `dilemma-first-home` memory).

## 3. What the site does today, page by page

- **Comparison (`/goal/compare`):**
  - Ranks products.
  - Its securities-account option is priced on the representative fund (P-05: Yelin Lapidot's tracking fund, 5139282) at the broker whose tariff leaves the goal the most (F-80, the site's pick: Psagot Trade).
  - "להחליף" changes the fund. A link opens the brokers page.
- **Brokers (`/workbench/providers/brokerage-account`):** ranks the 14 brokers for one fund, using that fund's own instrument class.
- **Funds (`/workbench/funds/index-sp500`):**
  - Ranks the funds for one broker. The default broker is Leumi (P-05's tariff), not the comparison's pick.
  - So the same plan shows 139,466 on this page and 155,116 on the comparison.
- **S&P 500 guide (`/exposure/index-sp500`):** explains the three routes and their tax in prose. No numbers.

Flaws found while measuring:
1. **One fee line for every fund on the funds page.** It prices every fund with one shared tariff read for `etf_units` (`site/app/lib/variants.ts:232-236`), so a tracking fund is charged ETF lines and a fund bought abroad is charged ETF lines when Israeli funds share the exposure. For the two Israeli classes the gap is small at today's tariffs (Leumi: 15,020 for the tracking fund against 14,556 for the ETF on the brokers page). For a fund bought abroad it skips the foreign-trading and FX lines.
2. **Tracking difference and spread are not collected for any fund.** Each is counted as zero. Tracking difference is where a swap fund's advantage or cost would show.
3. **iShares CSPX is "not evaluated" until the person types the dollar rate.** The site does not hold the Bank of Israel rate (D20). The brokers page gives no row for it either.
4. **US ETFs and foreign brokers are absent.** There is no record for IVV or VOO (ETF-30 is a rule, not a record), and no foreign broker tariff, although D2 puts foreign-domiciled ETFs in tier 1 and D17 forbids blind spots.
5. **CSPX has one record, as "bought in USD abroad".** Its Tel Aviv listing (a different security number and kind, `tase-foreign-fund`) is not a variant.
6. **Funds missing:** Migdal's and other S&P 500 funds have no record. The R-funds agent (running) adds the five largest missing ones, plus replication method and tracking difference for all.

## 4. What the engine and data can price, per route

| Route | Engine | Data today | Missing for a ranking |
|---|---|---|---|
| (a) Israeli fund | `israeli-fund`; 25% real-gain tax at sale, gain measured against the CPI (TXS-09) | 8 records; 14 tariffs with `etf_units` and `mutual_fund_units` lines | Tracking difference, spread, the larger funds (in progress) |
| (b) Foreign fund on TASE | `tase-foreign-fund`, with the 90% main-currency test (TXF-04) | No record for the TASE listing | A record; whether the 2019 letter (TXF-04) is in force (Q10, rests on a copy) |
| (c) Irish fund abroad | `foreign-fund`, domicile `ireland` | CSPX record; Israeli tariffs' `foreign_securities` and FX lines | The dollar rate (entered, D20); a foreign broker's tariff; Q1 (is an accumulating foreign fund taxed only at sale?) |
| (c) US ETF abroad | `foreign-fund`, domicile `us`, W-8BEN, distributions | Nothing | A record; distribution yield (entered, A-10); a foreign broker's tariff; whether Israelis can buy US ETFs at an EU-regulated broker (ETF open question 11, PRIIPs) |

## 5. Sourced facts that tell the routes apart

Money:
- **Tax base.** An Israeli exempt fund's real gain is measured against the CPI, so a rise in the dollar is taxed (TXS-09, the guide's prose). A foreign security held directly is measured against the exchange rate, by law (TXF-03). A TASE foreign fund follows the exchange rate if its prospectus commits to the 90% test, otherwise the CPI (TXF-04).
- **Dividends.**
  - Israeli funds track the S&P 500 net total return, so the index already assumes US withholding (ETF-40); the rate it uses was not read.
  - An Irish fund pays 15% on US dividends under the Ireland–US treaty (TXF-16). Whether CSPX actually gets it is open (Q7).
  - An Israeli holding US shares or a US ETF pays up to 25% with a W-8BEN, 30% without (TXF-12, TXF-13). Credit in Israel is possible for tax on the holder's own dividends, not for tax inside a fund (TXF-16, TXF-06).
- **Distributions.** IVV distributes quarterly (ETF-30), taxed each year at 25% (TXF-08). CSPX and the Israeli funds accumulate (ETF-27; Israeli funds per their records).
- **Costs.** CSPX 0.07% (record). IVV 0.03% (ETF-30). Israeli funds 0.02% to 1.1% all in (records). Plus broker commissions, custody and FX conversion per tariff.

Not money (dimensions, not numbers):
- **US estate tax.** An Israeli holding US-situs assets above 60,000 dollars is exposed, because there is no Israel–US estate tax treaty. Irish fund shares are not US-situs (TXF-27). Whether a US ETF organised as a trust counts is open (Q11).
- **Reporting.** At a foreign broker no Israeli tax is withheld: a semi-annual report with an advance, and an annual return (TXF-22). At an Israeli broker the tax is withheld, Tel Aviv listing included (TXF-05).
- **Supervision.** Foreign brokers working through a 49A permit are not supervised by the ISA (BRK-06). Foreign funds on TASE are not supervised by the ISA either; the prospectus annex must say so (ETF-24).
- **Trading.** A TASE foreign fund can only be bought on the exchange, against a market maker (ETF-26). Spreads were not collected.
- **Replication.** Israeli funds on foreign indices usually use unfunded swaps, and foreign funds usually hold the shares (ETF-11, ISA 2024). Counterparty risk is limited by regulation (ETF-11, reg. 8). Whether swaps track better is being researched (R-index, running).

## 6. Constraints the design must keep

- **No guessed returns (D9, D10).** Equity routes rank only on an entered return. The routes differ mostly in costs and tax, so a ranking between routes could be shown as a difference that holds at any return, or for the entered one.
- **No blind spots (D17).** Every route the site knows of appears, priced or marked "not evaluated" with the reason.
- **The Bank of Israel exchange rate is a link, not a number (D20).** A route bought in dollars needs the person to type the rate.
- **TASE's fund lists can't be republished (D22, CAT-43).** Records are hand-collected.
- **No referral or affiliate links;** a foreign broker is named, never linked for sign-up.
- **The choice that moves the result most goes in the headline (`dilemma-first-home`).** For this plan that is the broker.
- **Every number traces to a source and shows its state (D7).**

## 7. Questions for the interface design (to discuss with the founder)

1. Where does "how to buy the S&P 500" live? Options:
   - the S&P 500 guide page;
   - a step inside the comparison's securities-account card;
   - one new page that ranks complete ways (broker + route + fund);
   - the existing brokers and funds pages, made to agree.
2. One joint ranking of complete ways (best broker for each fund, best fund for each broker), or a step-by-step path where each step holds the others at the site's pick?
3. How is the route chosen and shown? Israeli fund / TASE foreign fund / abroad as a first-class level, or as a tag on each fund?
4. How do the non-money differences show beside the numbers? Estate tax, reporting duty, supervision, swap counterparty risk.
5. What does the page say for a route it can't price yet (US ETF, foreign broker)? D17 wants the route visible with the reason.
6. Which defaults should the three pages share, so that they never disagree again (the comparison's broker pick, the funds page's broker, the representative fund)?
7. How does the person give the facts only they have (dollar rate, W-8BEN, distribution yield) without a long form?

## 8. Facts added the same evening

- **Replication.** By law, an Israeli fund may hold an unfunded swap only on an index of foreign securities, a commodity or a currency (ETF-51), so every TA-35, TA-90 and TA-125 fund holds the shares; Harel's TA-35 funds included (ETF-52). Every Israeli fund on the S&P 500, the NASDAQ-100, MSCI World or MSCI ACWI uses swaps or futures.
- **Do swaps pay more?** The sources do not show it after expenses. In 2025, six of seven swap funds read beat their net index before expenses, by about 0.1 to 0.8 points, and six of seven trailed it after expenses (ETF-53, ETF-54; that comparison is the agent's own arithmetic over the reports). The net index assumes a 30% US dividend tax. An Irish fund holding the shares pays 15% (TXF-16).
- **Tracking difference.** No annual report prints the 12-month figure; each points to Funds Center, whose terms forbid redistribution. The reports do print the fund's return beside its tracking asset's for the period, so a tracking difference can be computed from them (a formula to define in `docs/method.md`).
- **Records.**
  - Pushed: 10 more S&P 500 and TA-125 funds, among them the five largest S&P 500 funds, which had no record.
  - Held back: TA-35, TA-90, NASDAQ-100, MSCI World and ACWI (26 funds, 5 exposures). Any exposure record publishes its own pages, and the design comes first.

## 9. Two people, one question (design thinking, 2026-10-25)

The founder named two people:
- **The one who knows.** They have chosen the index and ask how to hold it: Israeli fund or iShares, which broker, which exchange. This is why the site was started.
- **The one who didn't know to ask.** A goal led to "a securities account beats a kupat gemel". Now they must pick an index, and then they face the first person's question.

**They meet at one question: how do I hold index X with my money, all things counted?** So there should be one answer screen for "the way" (broker + route + fund), reached through two doors, not two features.

### 9.1 The way screen
- **Headline: the cheapest complete way for this plan,** and what it saves against the person's own bank (or a typical bank). For example: "Psagot Trade, Yelin Lapidot tracking fund, in shekels: about 13,000 NIS more than at Leumi over 20 years". The broker leads because it moves this plan most (section 2; `dilemma-first-home`).
- **Then the ladder of choices, each with what it is worth:**
  - broker;
  - route (an Israeli fund / iShares in Tel Aviv / abroad);
  - fund (manager, ETF or tracking fund);
  - hedged or not.
  Each row opens its full ranked list. Today's brokers page and funds page become these two lists, sharing one computation and one set of defaults, so the pages can no longer disagree.
- **Not money, beside the money:** chips per route for US estate tax, reporting to the Tax Authority yourself, ISA supervision, swap counterparty and hedging. Each has one line and a rule link.
- **Asked only where it matters:**
  - where your account is today (it turns the headline into "stay or move");
  - the dollar rate, only when a route bought abroad is opened;
  - W-8BEN, only for a US ETF.
- **Routes the site can't price yet** stay on the screen with the reason: US ETFs, foreign brokers (D17).
- **What to do next:** the chosen way becomes three or four steps.
  1. Open an account (or keep yours).
  2. Buy the fund by its security number.
  3. Set a standing order of 400 a month.
  4. For a route bought abroad: the semi-annual report.

### 9.2 Does the way screen need a return?
All ways hold the same index, so the return mostly cancels. What differs is fees, tax, and tracking. The way screen could rank ways without asking for a return: it would check that the order holds across a range of returns and dollar moves, and say "the order holds for any return from X to Y" or "depends on the dollar". Amounts would show at the entered return, or as "even with no growth". This would be a robustness statement, not a forecast. Whether it fits D9 is a product decision for the founder.

### 9.3 The index step (the second person)
- The comparison already priced the securities account on the S&P 500 (the representative fund, P-05). The card should say so ("חושב לפי S&P 500") and make it changeable, so the hidden choice becomes visible.
- Choosing an index shows what a person can judge without a forecast:
  - what is inside (how many companies, which countries);
  - currency (and that an Israeli fund on a foreign index is taxed on the dollar's rise);
  - typical fees per index;
  - published past ranges, where the rule base has them.
- No ranking by return (D9). Exposure mode stays for someone who wants to enter returns and worst falls.
- After the index, the person lands on the way screen with their plan already filled in.

### 9.4 Doors for the first person
- On the first page: "I know what I want to buy". Index chips (S&P 500, TA-35, TA-90, TA-125, NASDAQ-100, world) and the three numbers lead to the way screen. With no saved goal, the numbers start from P-05 and are marked as the site's.
- Each index guide page carries the way screen as its main block.
- **A third door, from search:** a fund the person already has in mind (the founder's "הראל מחקה ת"א 35") opens the way screen with that fund marked: where it ranks, and what the cheapest way saves against it.

### 9.5 Decisions for the founder
1. May the way screen rank ways without an entered return, through the robustness check of 9.2?
2. For the index step: explain only, or also a site default that is marked as the site's judgement (a parameter, like P-05)?
3. Where the first person's door lives: the first page, the index pages, or both.
4. Whether "where is your account today" becomes a standing question that turns every way answer into stay-or-move.

### 9.6 The founder's direction (2026-10-25, later)
- **Exchange rates are the site's (D26).** They come from the ECB's daily reference rates, with the dollar computed as a cross rate. The person never types a rate.
- **No index is ever recommended (D27).** The index chips start with none chosen. The comparison's securities-account card stops pricing silently on the S&P 500: it asks for the index, or shows the result per index.
- **The way screen is a new top-level page,** next to מדריך, שאלות שכולם שואלים, חברות ומסלולים, השוואה למטרה and מה כבר יש לכם. It is a long-term comparison like lazyinvestor.co.il's trading-fees calculator, which compares two providers on fees the person types in. Here every provider's tariff and every fund's report is already in the data.
  - The person who knows the index goes to this page.
  - The person who came from a goal sees a one-line summary on the comparison card, the cheapest way for the index they chose, and a link to the page with the plan already filled in.
  - Both are one calculation, so the numbers agree.
- Still to settle:
  - the page's name (proposed: "השקעה במדד");
  - whether index tracks inside savings products (kupat gemel lehashkaa, study fund, IRA) appear as rows beside the securities-account ways;
  - 9.5 question 1 (ranking without an entered return).

## 10. Second round: labels, a custom index, foreign brokers, onboarding (2026-10-25, evening)

The founder asked for:
- Interactive Israel and Interactive Brokers (an agent is collecting them);
- a better "השקעה במדד" page, with an "אחר" index the person types;
- the labels developed into a system that explains itself;
- an easier start on the goal comparison for people who know less.
He also asked that UI talk always come with visuals (memory `show-ui-visually`).

### 10.1 Labels: one system, five families
Each label is an icon plus two or three words. Colour never carries meaning alone (design system). Tapping a label opens a short sheet:
- what it means, in one or two plain sentences;
- what it means for this plan, with a number where the engine has one;
- the rule chips;
- a link to the term.
A line above the table, "מה אומרות התוויות?", opens every label on the page at once. The labels become glossary terms (`data/terms`), so search finds them.

| Family | Labels | Tone |
|---|---|---|
| Where it is held | קרן ישראלית · קרן חוץ בת״א · נקנית בחו״ל | neutral |
| How it trades | קרן סל: נסחרת כל היום · קרן מחקה: פעם ביום | neutral |
| How it follows the index | מחזיקה את המניות · עסקת החלף (ETF-51, ETF-52) | neutral |
| Currency | חשיפה לדולר · מנוטרלת מט״ח · בשקלים | neutral |
| Tax | מס גם על עליית הדולר (TXS-09) · מס דיבידנד 15% בקרן (TXF-16) · מס על כל חלוקה (TXF-08) · מס רק במכירה (open, TXF OQ1: carries the lock) | neutral, or the open-rule lock |
| What it asks of you, and risk | דיווח עצמי למס (TXF-22) · מס עיזבון אמריקאי (TXF-27) · לא בפיקוח רשות ני״ע (BRK-06, ETF-24) · צריך טופס W-8BEN (TXF-13) | caution |
| Availability | לא זמין בבית ההשקעות הזה | caution |

A label states a sourced fact or an open rule. It never praises: there is no "good" label.

### 10.2 The custom index ("אחר")
- An "אחר" chip opens a field with suggestions: the indices named in the fund records and in the rule base, for example MSCI EM and MSCI Europe from ETF-32.
- For a name the site doesn't know, two questions settle what can be said without any fund record: where the companies are (Israel / the US / the world / emerging markets / other), and the index's currency.
- The page then shows the routes that exist in principle, each with its labels:
  - An Israeli index: only Israeli funds, holding the shares (ETF-51). No foreign fund may specialise in Israel (ETF-31).
  - A foreign index: Israeli funds through swaps, foreign funds on TASE if there are any, and funds abroad.
- The brokers' costs per route still compute, because they depend on the instrument class, not the fund.
- Funds without records are shown as "לא נאספו קרנות על המדד הזה", with a link to Maya's search for the index name. This follows D17: no blind spot, and no guess.
- Availability per broker comes from a broker × vehicle matrix: Israeli tracking fund, Israeli ETF, TASE foreign fund, LSE UCITS ETF, US ETF. For example, a foreign broker does not sell Israeli tracking funds, and US ETFs may be blocked at an EU-regulated entity (the foreign-brokers agent is sourcing this).

### 10.3 The page, improved
- **"What each choice is worth"** comes before the table, as three short bars. For the founder's plan: the broker, up to 48,000 NIS; the fund, up to 16,000; the route, not priced yet. This is the dilemma-first rule made visible.
- **Your own broker** is pinned as a row: "אצלכם היום: לאומי".
- **Labels double as filters:** "בלי דיווח עצמי", "רק בשקלים", "רק בבורסה בתל אביב".
- **Custom index:** the "אחר" chip, as in 10.2.

### 10.4 Easier start on the goal comparison
Today a person with a 20-year goal and no return typed sees a money-market fund ranked first, under a legend of number colours, a "type a return" line, "16 options not checked" and a past-record paragraph. Changes:
1. **A journey line at the top:** מטרה → מוצר → מדד → דרך → מה עושים. It shows where they are and what comes after the product answer, and it is the bridge to "השקעה במדד".
2. **The answer as a threshold instead of a demand for a return.** For example: "בכל תשואה מעל 3.6% בשנה, חשבון ניירות ערך משאיר הכי הרבה; מתחת לזה, קרן כספית." The comparison already computes this flip point. The person can still type a return. D9 holds: nothing is forecast.
3. **Two quick questions,** employment type and age, asked as chips in the card itself. Today they hide behind "16 options not checked".
4. **The number-colour legend** appears as a one-time tip beside the first number, not as a strip at the top.
5. **After the product answer, the index step.** Explain-only cards per index, carrying the same labels (D27: no recommendation), or "compare more than one", which shows the ways for each chosen index side by side.

### 10.5 For the founder
1. Should the threshold sentence (10.4, point 2) replace "type a return" as the first answer for people who type none?
2. Should the journey line appear only on the goal path, or also on "השקעה במדד"?

### 10.6 The custom index from the site's side (2026-10-25, evening)
**Saved on the device.**
- A custom index the person adds is kept in the saved state (`mekor.v2.state`), like goals: its name, the two answers, and the date added.
- It travels in the export file, and from then on it shows as a chip beside the site's indices, with × to remove it.
- It never leaves the device. There are no accounts, and nothing goes to a server.

**"Checks its sources" means its own data, not a live search.** The site is static, with no server, and TASE's terms forbid storing its lists (CAT-43). When someone types a name, the page looks it up only in what the build already holds:
- the exposure records;
- the fund records, matched on each Israeli fund's printed tracking asset ("נכס מעקב") and its names;
- index names in the rule base, for example ETF-32's TASE foreign funds.
For MSCI Emerging Markets today, that finds:
- no exposure record and no fund record;
- the names of two TASE foreign funds on it: iShares 01159169 and Invesco UCITS 01183490 (ETF-32);
- MSCI's description of ACWI, which adds 24 emerging markets (ETF-48).
Matching needs an alias list (MSCI EM = MSCI Emerging Markets = "שווקים מתפתחים"; hedged and net versions) in the style of `site/app/lib/search-aliases.ts`.

**What the comparison needs, in three layers:**

| Layer | Facts | Who gives them | What they unlock |
|---|---|---|---|
| The index | Where the companies are (Israel / abroad); the index's currency | The site for a known index; the person's two answers for an unknown one | Which routes exist by law (ETF-51, ETF-31); the currency and tax labels; whether buying converts currency |
| The broker | Tariff lines per kind of security; FX conversion; which kinds of security the broker sells at all | The 14 tariffs (+2 coming); a new availability field | The broker's cost per route; "לא זמין כאן" |
| The fund | Fees (fixed, variable, trustee or TER), legal form (ETF / tracking fund), domicile, distribution policy, where it trades and in what currency, tax status, tracking difference, spread, share price | A fund record, hand-collected from the fund's own report | The fund's own cost and tax; a full ranking of complete ways |

What each level of knowledge gives:
- **With the index layer only** (the two answers), the page can show the routes, the labels, and each broker's cost per route. That is already the largest lever (section 2).
- **A full ranking needs at least one fund record per route.**
- **Without fund records**, each route says so ("לא נאספו קרנות על המדד הזה"), with a link to Maya's search and a "בקשו שנאסוף" copy button for the founder (flow 10). Nothing is guessed.

**Known limits:**
- A distributing fund (most US ETFs) needs its distribution yield for the yearly tax (A-10). Without a record, that route cannot be priced.
- Fund-level dividend withholding is sourced for US dividends only (an Irish fund pays 15%, TXF-16). For an index of other countries, such as emerging markets, it is not counted, and the row says so.

### 10.7 Walk-through: a Japanese index (2026-10-25, evening)
The site holds nothing on Japan today: no index record, no fund record, no rule naming Nikkei, TOPIX or MSCI Japan. The ECB's rates include the yen (175.51 yen per euro on 23.10.2026, so about 1.99 NIS per 100 yen). The walk-through led to four refinements:
1. **The two questions change.**
   - The legal fact is "are the companies Israeli?" (yes/no), and it alone decides the routes (ETF-51, ETF-31).
   - Second, the index currency, from a list that includes the yen, the pound and "other".
   - The region (Japan, Europe, emerging markets and so on) is optional and feeds only the labels.
2. **The currency label generalises:** "חשיפה ל{מטבע}", for example "חשיפה לין". The tax label becomes "מס גם על עליית ה{מטבע}" for an Israeli fund.
3. **The abroad route splits by exchange,** because tariffs differ by market and trading currency:
   - a US-listed ETF (in dollars, so the dollar conversion and US estate tax apply);
   - a London-listed UCITS ETF (in dollars or pounds);
   - and the home exchange (Tokyo, in yen) where a broker offers it.
   Without a fund record, each sub-route shows the broker's cost for that market.
4. **Unknown dividend tax inside the fund gets its own label,** "מס דיבידנד בתוך הקרן: לא נבדק". The rule base sources it for US dividends only (TXF-16).

For a Japanese index today, the page shows:
- the routes;
- the labels;
- each broker's cost per route and exchange;
- "לא נאספו קרנות" on every fund line, with Maya's search and the "בקשו שנאסוף" copy.
After the founder (or an agent) collects the main funds (the largest Israeli funds on a Japanese index, a UCITS and a US ETF), the same saved chip shows a full ranking.

### 10.8 Correction: the index's currency and region don't change the comparison (the founder, 2026-10-25)
The founder pointed out that any currency other than NIS, USD or EUR is the same to the comparison, and so is the region. Checked against the engine and the rules, he is right, and further: for comparing ways on one index, the index's currency never changes the ranking.
- **Conversion cost** depends on the currency the vehicle trades in: shekels on TASE; dollars, pounds or yen abroad. It does not depend on the index's currency. Every tariff has one FX conversion line for all currencies, so any foreign trading currency costs the same unless a broker prices by currency or does not offer that market.
- **Tax.**
  - An Israeli fund is taxed on its real gain against the CPI (TXS-09).
  - A foreign security held directly is taxed against the exchange rate of the currency it is denominated in (TXF-03).
  - A TASE foreign fund is taxed against its prospectus's main currency, under the 90% test (TXF-04).
  All three are vehicle facts, not index facts.
- **The return.** The index's currency only says what an entered return is in. The currency change on top of it (A-03) is zero by default (`securities.ts`: the return is grossReturn × (1 + fxChange)), and it is the same for every way on the index.
- **Region:** fund-level dividend tax is sourced for US dividends only (TXF-16). US estate tax follows the fund's domicile, not the index's region (TXF-27).

So the custom index asks **one question, "are the companies Israeli?"**, which decides the routes (ETF-51, ETF-31).
- Currency and region are optional "for your information" fields. They are shown once, in the index's header, and are never row labels.
- Row labels carry only what differs between ways: where the fund is held, how it trades, how it follows the index, hedging, tax mechanics, and burdens and risks.

**Engine change to make when building:** `fund-variants.ts` line 211 refuses a fund whose trading currency differs from the exposure's currency ("a USD fund on a JPY exposure has no run"). A dollar-traded Nikkei ETF would be refused. The model should separate the index's currency (for an entered return and A-03, zero by default) from the vehicle's trading currency (for the broker's FX line and the TXF-03 tax base).

### 10.9 The founder's critique: options, and the best broker for each (2026-10-25, evening)
The founder found 10.8's page useless: three routes with no answer. The page must answer two things for any index:
- (a) what are my options for owning it;
- (b) which broker is best for each option, because a broker can be cheap for an Israeli fund and dear for a US ETF, or the other way round.
He also wants both "חשיפה לדולר" and "מנוטרלת מט״ח" kept as labels: they tell the unhedged and the hedged funds apart.

**The redesign:**
- **The options:** one card per way of owning the index (Israeli tracking fund, Israeli ETF, TASE foreign fund, a fund bought abroad), each naming its best broker, that broker's cost, and the cheapest fund in it.
- **The broker × option matrix:** one row per broker, one column per option. Each cell holds the broker's 20-year cost, or "לא זמין". The best broker in each column is marked.
- **The headline** is the cheapest complete way: the best broker in the best option.

**Computed with the engine** for the founder's plan (6,000 + 400 a month, 20 years, 7% typed, 2% inflation), as each broker's 20-year cost in today's shekels:

| Broker | Israeli tracking fund (Yelin 5139282) | Israeli ETF (Tachlit 1144385) |
|---|---|---|
| Psagot Trade | 2,894 | 2,565 |
| One Zero | 9,760 | 8,811 |
| Bank of Jerusalem | 11,973 | 10,581 |
| Hapoalim, Yahav | 16,829 | 14,979 |
| Leumi | 18,544 | 16,532 |
| Altshuler Shaham Trade | 56,968 | 51,040 |
| Excellence | 61,559 | 55,145 |
| Interactive Israel | not available (no line of its new snapshot applies to TASE units) | not available |

- Between the two Israeli options the broker order is the same today. The interaction the founder expects shows between the Israeli and the abroad options. Interactive Israel has no line for TASE units, and the banks price foreign trading separately.
- The abroad option did not compute. Altshuler Shaham Trade's foreign-trade line sets its minimum in dollars, and the engine rejects that ("unit is usd, expected shekels"). It rejects it for the whole run, not just that broker's row.
- **Engine changes to make when building:**
  - convert foreign-currency minimums and maximums at the site's rate (D26);
  - make a broker the engine can't run a "not comparable" row instead of an error for the whole page.

The Interactive snapshots in this table are the foreign-brokers agent's work in progress (uncommitted).
