# Why a hedged tracking fund falls short of its index (issue #149), 2026-10-31

Rules added: ETF-75 to ETF-78 in `.claude/skills/il-finance/references/etfs-and-index-funds.md`, open questions 30 to 32 there. Everything below was checked on 2026-10-31.

## Answers

**1. What the shortfall depends on.**
- *Read, regulator.* The ISA's variable-fee directive splits the hedge into two coefficients: `R`, from the interest differential in three-month forward points, and `Q`, the daily product of the index's change and the currency's change (quanto). It calls the result "expenses or income" (ETF-75).
- *Read, companies.* Reports add fees, and in swap funds swap spread and interest costs (ETF-77).
- *Not found.* No regulator or central bank gives the size. No report prints the quanto figure.

**2. Does it follow the rate gap?**
- *Read.* The interest gap is one part by rule.
- *Inferred.* The total does not follow it point for point. Harel S&P 500 moved 0.19 points from 2024 to 2025 while the policy-rate gap moved 0.91. MTF Utilities was −3.32 at gaps of −1.91 (2019) and −0.42 (2022). That quanto causes the rest is inferred; no report prints it.

**3. Can it be positive?**
- *Read.* A part can. The directive says "income"; Meitav writes that a negative differential "will be added as income"; Kesem that a positive rate "was added"; Harel and MTF that a direct correlation is a gain. MTF printed +0.12% for 23.4 to 31.12.2025.
- *Read.* The whole, fees included, never was: 38 of 38 full fund-years fell short.
- *Inferred.* Fees and quanto were large enough to outweigh any positive part in those years. Nothing read tests a year with a large positive gap such as 2011 to 2014.

**4. Before 2022?**
- *Read.* 7 fund-years on 3 funds: MTF Utilities 2019 −3.32, 2020 −3.20, 2021 −1.71; MTF Technology 2020 −4.77, 2021 −1.32; Tachlit S&P 500 2020 −2.42, 2021 −0.61.
- *Not found.* Nothing before 2019.

## What was read

| Document | What it gave | Library id |
|---|---|---|
| [ISA directive on the variable fee in a tracking fund](https://www.chamber.org.il/media/159262/fees.pdf#page=5), Chamber of Commerce copy, PDF of 23.8.2018 | p.1 s.3, p.2 and Appendix A p.5: the formula, three-month forward, `R`, `Q` (page viewed as an image, since the formula does not extract) | 0e315ca16d204980 |
| [ISA rules on tracking-fund prospectuses, 2018](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/shared_investments_rules.pdf#page=3) | p.3: hedging costs are left out of the tracking difference | 6039c4f96014eccb |
| [ISA draft amendment, 9.10.2024](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/indexfund091024.pdf#page=8) | p.8 footnote 2: quanto named, and the variable-fee directive still cited | feff9484409e663d |
| [Bank of Israel, Financial Stability Report 2024 H1](https://www.boi.org.il/media/atwl5mcy/fsr2024fe1.pdf#page=47) | p.47: the basis as a deviation from interest parity, for institutions | c96cb764c60254a0 |
| [BIS Quarterly Review, September 2016](https://www.bis.org/publ/qtrpdf/r_qt1609e.htm) | Interest parity in words | fe0611f2fc307e2c |
| [Bank of Israel rate](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BR/1.0/?format=csv&startperiod=2011-01-01), [New York Fed effective federal funds rate](https://markets.newyorkfed.org/api/rates/unsecured/effr/search.csv?startDate=2011-01-01&endDate=2026-10-30) | Daily rates; the yearly gap | 2ab89f10dda63973, 205c7eb9017cc0cf |
| Reports for 2025 of Harel (2), Kesem (3), MTF, Tachlit (2), Mor | Hedge lines, returns | ETF-77 lists each with its page |
| Reports printing older years: [MTF Utilities, 2022](https://mayafiles.tase.co.il/rpdf/1507001-1508000/P1507480-00.pdf#page=8), [MTF Technology, 2023](https://mayafiles.tase.co.il/rpdf/1584001-1585000/P1584110-00.pdf#page=8), [Tachlit S&P 500, 2023](https://mayafiles.tase.co.il/rpdf/1575001-1576000/P1575487-00.pdf#page=6) | 2019 to 2023 by year. Column order checked against TA-125 and the dollar in the same table | b388e41abb62a54f, 3f654f0ada1a2fc4, de5cd77c07f6c314 |

The record, year by year, and the hedge lines are the tables in ETF-77 and ETF-78.

## What was inferred, and how far it goes

1. **The arithmetic of `Q`.** It falls when the index and the currency move opposite ways and rises when they move together, from the formula itself. Harel and MTF say the same in words. That it is large is not read; it rests on the gap the line and the fees leave open.
2. **"Rest" in ETF-77** is fund minus index minus the line, with fees still inside. The rest is not all quanto: tracking error and swap costs are in it too. Today's fees in `data/funds/` are not 2025's (Harel S&P 500 shows 0 fixed today, and its 2025 report states expenses of 0.32), so fees were not subtracted except where the report states them.
3. **Harel's line** seems to hold more than interest, since with its expenses it nearly closes the gap (17.43 − 1.85 − 0.32 = 15.26 against 15.32), though its footnote says it holds interest. MTF also calls its line interest and prints the opposite sign, for part of the year. Meitav prints −0.60 under a heading saying it is deducted, while its footnote says a negative differential is added as income; Kesem prints the same −0.60 and says a negative rate is deducted. The lines cannot all be one measure of one thing, and a printed sign alone does not prove a cost or an income. Open question 31.
4. **The basis as a cost to a hedged fund** (ETF-76) rests on the direction of trade. The Bank of Israel does not speak of funds.
5. **The gap column is a policy-rate gap,** not the forward-implied one. In 2025 it was +0.26 while most reports printed −0.60. A year-by-year comparison is rough for this reason, for few years, and because the set of funds changes by year (1 fund in 2019, 9 in 2022) and the indices differ.

## Searched and not found

- Bank of Israel or ISA statement of how large a hedged fund's shortfall is: none. A text search of the ISA's fund reports for 2024 and 2025 found no hedging cost.
- The ISA's own copy of the variable-fee directive: its directive list does not render to scripts, and two web searches returned only the Chamber of Commerce copy. Amendments since 2018 not checked.
- An official series of shekel-dollar forward points: none in two searches. The Bank of Israel's other data flows were not gone through.
- Any fund report printing a year before 2019. Maya's list of a fund's reports stays by the founder's hand.
- Daily S&P 500 values, to compute `Q` as a test: FRED timed out and Stooq asked for a browser check. Not computed.
- Recorded in `research/library/tried.jsonl`.

## Left out, and why

- **TASE index rules for hedged indices.** Not searched. The hedged funds read track the index itself and do the hedging at fund level (ETF-75, ETF-77), so an exchange rule on a hedged index would not bear on them.
- **Forum and blog figures on hedging cost** (Hasolidit, Moneyplan, Tradingil: about 1% or 1 to 2% a year, or 1.2% at end 2024). Seen only as search summaries, not opened, not official, so not used.
- **Gold, sector and Brent hedged funds beyond the two MTF sector funds.** The two sector funds were used only because they print years before 2022.
- **Foreign hedged share classes,** a different structure.

The budget of about 25 searches and fetches was reached, slightly passed, and stopped there.

## For the lead

- **A finding for the page.** "הפער ... שחזר בכל שנה בדוחות" holds on all 38 fund-years. Its wording is safe for now.
- **F-92(b) floors the cost at 0.** No fund-year read was above its index. Whether any fell short by less than its fees was not checked; Tachlit S&P 500 in 2021, at −0.61, is the closest. The formula allows income, so the floor is a choice and not a law. Nothing here says to change it.
- **"מה הנטרול עולה: פער מהמדד"** counts fees inside. It stays accurate as worded, and "the cost of the hedge" alone would not be.
- **Data, if wanted.** `tracking_record` holds 2022 to 2025 only. Adding the earlier years for Tachlit S&P 500 (5123161) needs a new fund record; MTF's two sector funds are on other indices. Harel ACWI and Kesem World ETF are not in `data/funds/`.
- **`.claude/skills/il-finance/SKILL.md`** still says 937 rules; it was not edited, and neither was `coverage.md`, which is the lead's.
- **`data/open-questions.json`** is now behind the rule base by three questions (the validator warns; `data/` is otherwise valid). Run `npm run gen:open-questions -w @finance-tool/pipeline`; I was told not to edit `data/`.
- The library index gained 10 documents and 5 "tried" lines, to commit with this.

## Recommendation for the closing line

Using only what is sourced, in English for the Hebrew editor:

> Hedging swaps the dollar's swings for a gap to the index, made up by the regulator's formula of the interest gap between shekel and dollar and of how the index and the dollar moved together, so its size changes from year to year and no one can state it in advance. In every full year in the reports we read, on the funds collected, that gap with fees was a shortfall, whatever the interest gap was doing.

Two cautions if it is shortened. "On the funds collected" must stay true to the site's count, since D30 lets a market statement rest only on a count over every collected institution: the site's records hold 2022 to 2025, so the earlier years stay out unless the data is added or the three funds are named. And "no one can state it in advance" is my wording for what was not found, so the lead may prefer "the reports do not state its size". The existing sentence on the dollar weakening faster than the gap can stay after it.
