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
