# Hedged and unhedged funds on the index page (issue #21), 2026-10-31

Drawings: `mockups.html` (screenshots `mockups-1440.png`, `mockups-390.png`). No site code changed.

All figures are `/indices/sp500` at the site's example plan: 10,000 ₪, 500 ₪ a month, 10 years, 7% a year in dollars, inflation 2%, as of 31.10.2026. The page's opening pairs are both at Fair: Yelin Lapidot tracking (4D) and Harel tracking (4A) hedged.

## What is misleading

The block presents a choice between a safe figure and a gamble, decided by a forecast about the dollar. Neither half is true.

| Expected | Found | Verdict |
|---|---|---|
| Range beside one figure suggests one kind is uncertain | **The main flaw.** The 7% is an assumption for both. At 5% to 9% the hedged pair leaves 71,102 to 84,599 ₪, a spread of 13,497 ₪, 3.3 times its band (74,591 to 78,673 ₪). The words "בלי קשר לשער הדולר" read as "safe". In 2022 the hedged fund fell 21.78%; the unhedged S&P 500 funds fell 7.35% to 8.15% (7 funds), because the dollar rose 13.4% as the market fell. | Misleading |
| The crossing implies a forecast | **Stronger than expected.** −2.38% is the same at 5, 10, 20 and 30 years, and −2.39% to −2.38% at 4% to 10% return. It is no property of the plan: it is about the yearly cost difference (hedged fund's fees 0.32% + 2.12% beyond them, against 0.02% on the unhedged fund, so about 2.4 points) restated as a threshold, to two decimals. | Misleading |
| A constant yearly change is not how the dollar moves | Confirmed and measured. Over all 201 ten-year stretches since 2000, with the plan's deposits, the real path against a constant change at the same average changes the end value by −8.7% to +10.9% (plain arithmetic beside the engine: 7% in dollars, before fees and tax, in `compute.ts`). Between −3% and −1% the line and the band are only 1,427 to 5,338 ₪ apart, less than that effect, so knowing the average would not settle who wins. | Misleading |
| (not on the list) The shading | The shaded stretches (2000 to 2026) are read against a cost measured only in 2022 to 2025. 186 of 201 stretches lie right of the crossing, so the picture says "unhedged usually wins" without saying so. Stretches overlap: 26 years, not 201 observations. | Misleading |
| Hedging's cost varies with the interest-rate gap, so the band is too narrow | **Could not be tested. The rule is missing.** `etfs-and-index-funds.md` has no rule on why hedging costs what it does (`reits-and-gold-funds.md` says the cost "was not found"), two searches of the document library returned nothing (its text may not be on this machine, so that is weak evidence), and `data/series/` has no interest-rate series. I did not fill it in from memory, and no option states it. What is read: all 18 fund-years of the 6 hedged funds with a record fell short of their index, by 2.1 to 4.63 points including fees, all in 2022 to 2025. What is inferred: the band (two single years stretched over 10 years) understates the unknown, since it assumes that short window repeats. F-92(b) also floors the cost at 0, so a hedge that earned something could not be shown. | Unknown; research needed |
| The tax on the currency move in an Israeli fund | **Correct, not the problem.** Under TXS-14 (derived there) a shekel fund's real gain is measured against CPI, so a gain from the dollar is taxed. The run agrees: tax 1,867 / 5,788 / 10,596 ₪ at −3 / 0 / +3%, exactly 25% of the before-tax difference; hedged 2,610 ₪. The page just never says so. A fund bought abroad differs (TXF-03, gain above the exchange rate): tax 3,554 / 7,378 / 9,307 ₪ on the Irish fund, not symmetric. Whether a fund qualifies as a foreign-investment fund (TXS-14) is not modelled and not tested here. | Fine, only unsaid |

Also checked: the two opening pairs are at one house, so the gap is not a broker effect on this plan (a pick at another house could make it one). "The hedged kind" on S&P 500 is one collected fund.

A useful proof of what hedging is: the two kinds' tracking assets, from the reports, imply the dollar's yearly change within 0.2 points of the ECB rate in each year (2022: 13.46 against 13.42). So on an index, unhedged less hedged is the dollar plus the hedged fund's shortfall, and nothing else.

## Numbers and where they come from

- `compute.ts` calls the site's own functions (`buildInvest`, `kindPairs`, `kindScenarios`, `pairValue`, `pairCosts`, `yearlyChanges`, `stretchRange`, `gapToIndex`, `trackingBeyondFeesRange`) over `data/` and writes `numbers.json`. `build.mjs` turns that into `mockups.html`; no figure is typed by hand. Run from the repository root: `npx tsx research/specs/2026-10-31-hedged/compute.ts`, then `node research/specs/2026-10-31-hedged/build.mjs`.
- Yearly fund and index returns: `tracking_record` in `data/funds/` (the funds' annual reports). Dollar: `data/series/ecb-fx-month-end.json`.
- `today-*.png` are screenshots of the current build (`shot-site.mjs`).
- **Made up, and marked so on the page:** option B's rows of 0, 1, 3 and 4 points of hedge shortfall. Only the 2.12 row comes from the reports.
- **Beside the engine, not a site function:** the path check above. The engine takes one constant A-03 only. It is labelled before fees and tax.
- The phrase "כל נקודה שווה 3,500 עד 4,500 ₪" is the rounded span of four differences in `pointWorth`.

## Options

**A. What happened each year (recommended).** Three tiles (what it removes, what it costs, what it does not remove), the yearly dollar chart with 2022 to 2025 lit, two kinds' yearly returns, a table including the four years together, then one sentence on the plan. Assumes nothing about the future, keeps the chart the founder likes, and shows 2022 and 2025 as opposites, which is the truth of the choice. Weakness: four years only, and one hedged fund on this index.

**B. The difference, across two unknowns.** A grid of what one kind leaves over the other, dollar left to right, hedge shortfall top to bottom. Removes the crossing and the false certainty, compares everything at once. Weakness: still a constant dollar and the same return in both, four of five rows are made up, and it still reads like a forecast.

**C. How much each thing moves in a year.** Five rows on one percent axis: market, dollar in one year, dollar over ten, hedged funds' shortfall, unhedged funds'. Shortest and covers every hedged fund. Weakness: no money, no 2022-against-2025, and it mixes indices in one row.

In all three: the block moves to the bottom of the page, the fund list stays.

## What each option would change

Common:
- `site/app/routes/invest.tsx`: move `DollarSection` below `PlanChanges`.
- `site/app/components/invest/pair.tsx`: remove `KindCards` and the `kinds ?` branch so the ordinary cards render.
- **A new sentence is needed on those cards:** an unhedged foreign fund's single figure rests on a steady dollar, so it must say "אם הדולר לא זז מול השקל". Without `KindCards` the assumption would otherwise go silent (ground rule 4).
- `site/app/copy.ts`: replace `kinds` strings and `dollar`, through the Hebrew editor.
- `docs/method.md`: F-94 amended. `kindScenarios`, `crossing` and `ScenarioChart` go if nothing else uses them (check the kit gallery and tests in `render.test.ts`).
- D-entry in `docs/product.md`.

A: a new engine function for the yearly table over `tracking_record` (new F number), a grouped-bar kit piece with gallery entry, `YearBars` gains highlighted years. Works on any index with both kinds; MSCI World has one reported year, so its table would have one row, and many-currency indices keep the wording "not tied to the dollar against the shekel" (ETF-69).
B: F-94 changes to the difference grid; a new kit heat table with fixed columns; `kindScenarios` extended by the override `pairValue` already has. About 40 pricings per plan, so it must wait for the slider to rest and be measured (ground rule 5).
C: a new kit strip plot; a function gathering every fund-year. No plan input, so nothing to re-run.

## Open

- **Research needed (domain-specialist):** why hedged funds fall short of their index, whether that follows the interest-rate gap, whether it can be positive, and what the record was before 2022. Until then the site says it has no source. A rule here could change A's closing line and make B's rows sourced. Suggested as its own issue.
- Hebrew in the drawings has not been through the Hebrew editor.
- The palette validator passes colour separation (worst pair 17.6). It flags lightness and chroma for the site's approved kind tokens and for the neutral dollar series, left as they are.
- Option A's unhedged bars show the middle of the range, and the table holds the range. The band across funds is about 1 point, too thin to draw.

## Option A's text, second version (founder, 2026-10-31)

He liked option A's graphs and found the text unclear, and asked how the hedged fund fell 21.78% in 2022 against 7.35% to 8.15% for the unhedged funds. `option-a.html` is option A alone with the new text; `mockups.html` carries the same block. What changed: the block opens with the two funds as sums (the index plus the dollar; the index less a gap), a worked example walks 2022 and 2025 step by step in percent (he asked for percent, not 100 ₪), the table runs index, dollar, funds, and "פיגור" gives way to "פער מהמדד", the site's own word. Every row of the example is read: the index in dollars and in shekels and the funds' returns from the reports, the dollar from the ECB series; the gap is the fund's return less its index. The graphs did not change.

