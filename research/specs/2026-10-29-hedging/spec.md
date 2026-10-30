# Hedged and unhedged funds on the index page (2026-10-29)

Proposal for the founder, round 2. Whole-page mockups in `mockups/` (PC, 1366 px, `page.html`), drawn for S&P 500 on the site's data of 29.10.2026, the default plan (10,000 ₪, 500 ₪ a month, 10 years, 7% a year in dollars) and the Psagot account. Round 1 (three options, all priced at a steady dollar) is kept in `mockups/round1/`.

## 1. Where things stand

- **Decisions kept.** Hedging is a label, not a filter (2026-10-27). The page opens on the best unhedged pair, and a with/without-the-dollar switch was turned down (2026-10-28).
- **Founder, 2026-10-29.**
  - Every round-1 option assumed no change in the exchange rate. The page has to lay out the information so the reader decides, without drawing conclusions from the past.
  - The gap to the index belongs to every fund, so it is a field either way, not a hedging matter.

**The gap to the index ("מול המדד").** Each annual report prints the fund's yearly return against its tracking asset (now only in `fees.tracking_difference_12m.notes` of each record). The mean over the full years, after all expenses:

| S&P 500 fund | Years | Fund minus index, a year |
|---|---|---|
| Harel tracking 5129275 | 4 | +0.65% |
| Yelin Lapidot tracking 5139282 | 1 | +0.37% |
| Kesem KTF 5124482 | 4 | +0.36% |
| Altshuler Shaham tracking 5139100 | 1 | +0.32% |
| Mor ETF 1165810 | 4 | +0.18% |
| Yelin Lapidot ETF 1201656 | 1 | +0.03% |
| MTF ETF 1150333 | 4 | +0.01% |
| ATF ETF 1218916 | 0 | none yet (8.4.2025 to 31.12.2025 only) |
| Harel ETF 1149020 | 4 | −0.31% |
| Kesem ETF 1146471 | 1 | −0.43% |
| Tachlit ETF 1144385 | 4 | −0.43% |
| IBI ETF 1148162 | 4 | −0.53% |
| Harel hedged 5127527 | 4 | −2.44% (its index is in dollars) |

The hedged fund's shortfall was there whether the dollar rose or fell (−3.26% in 2022, when the dollar rose 13.4%; −2.11% in 2025, when it fell 12.5%). It is still the past: it moved between −2.10% and −3.26%, and the rule base does not say why hedging costs this much.

**The dollar against the shekel** (ECB reference rates, the shekel quoted since 3.1.2011; the dollar-shekel rate is a cross rate computed by the site; read 2026-10-29):

| Measure | Range | Middle |
|---|---|---|
| Single calendar years 2012 to 2025 | −12.5% (2025) to +13.4% (2022); down in 8 of 14 | |
| Every 10-year stretch from a month end (70, overlapping) | −3.12% to +1.35% a year | −0.96% |
| Every 5-year stretch (130) | −4.16% to +2.40% a year | −0.30% |

The founder's sensitivity range for the dollar (P-02, A-03) is −3% to +3% a year. For a 10-year plan it is about as wide as the past, but the past sat lower. The data covers only 2011 to 2026, so the 70 ten-year stretches are one and a half decades seen many times. They show how wide the moves were, not where the dollar will go.

## 2. In every option

1. **"מול המדד" on every fund**, with the number of full years. The value counts it in place of the listed fees (both directions); a fund with no full year is priced on its fees and says so. Provisional (Claude's). With it, S&P 500's order at Psagot becomes Harel tracking 89,212 ₪, Yelin Lapidot tracking 88,079 ₪, Kesem KTF 87,988 ₪, Altshuler Shaham 87,871 ₪, then the ETFs. The order today runs Yelin, Altshuler, Kesem, Harel.
2. **Data.**
   - The yearly fund and index returns become fields of each fund record, with the report page. Schema and `docs/data-schema.md` change.
   - The ECB series keeps its history (today the file holds the latest day only), under the ECB's terms with attribution. The Bank of Israel's rates stay links (D20).
3. **Engine.** A hedged fund does not move with A-03 (F-04 and `fundRun`), with a golden test.
4. **Labels.** "מנוטרלת דולר" for a fund that hedges only the dollar. The old three-way filter goes.
   - **Many-currency indices** (founder's question, 2026-10-29).
     - The hedged MSCI World and ACWI funds track the index in dollar terms and neutralise only the dollar against the shekel (ETF-69; the funds' reports, "עסקאות חוזי אקדמה וספוט לצורך נטרול החשיפה למטבע"). MSCI World is calculated in dollars over 23 countries (ETF-48, ETF-49), so the euro, yen and the index's other currencies still move a hedged fund, against the dollar.
     - In 2025 the shekel target and the dollar target differ by the same amount on every index: −12.77% (MSCI World 4.96% against 20.32%), −12.76% (ACWI), −12.62% (S&P 500) and −12.63% (NASDAQ 100). Hedged and unhedged therefore differ only by the dollar against the shekel, so option A's dollar axis holds for these indices too.
     - Wording:
       - a hedged MSCI World figure is "not tied to the dollar against the shekel", never "not tied to currencies";
       - the unhedged label on these indices says the dollar and the other currencies.
     - The exposure codes do not tell how hedged a fund is: the two ACWI hedged ETFs are 4A (foreign currency up to 10%), the two MSCI World hedged funds 4D (up to 120%), though their reports describe the same hedge.
     - Not in the rule base: the index's share outside the dollar (the MSCI factsheet's country weights), for the domain-specialist.
5. **Rule base.** The domain-specialist researches what hedging costs and why.

## 3. Options

- **A, both kinds in the result, with no assumption about the dollar. Recommended** (`page-A-both-kinds-in-result-pc.png`).
  - **Result.** The cheapest of each kind. Unhedged is shown as a range over the founder's dollar range: 76,970 to 104,234 ₪, with 89,212 ₪ marked "if the rate does not change". Hedged is one figure, 77,431 ₪, with its band from its cheapest and dearest year, 74,687 to 78,612 ₪. One sentence follows: the hedged fund leaves more only if the dollar falls more than 2.87% a year on average.
  - **New section, "עם נטרול מט״ח או בלי: לפי מה שיקרה לדולר".** Both kinds across the dollar's average yearly change, the past 10-year stretches shaded, and the dollar's yearly change 2012 to 2025.
  - **Fund list.** Two groups, each ranked on its own; the hedged row shows its difference as a range, +461 to −26,803 ₪.
  - No new input.
- **B, a dollar field in the plan** (`page-B-dollar-field-pc.png`).
  - A fifth slider, "שינוי שער הדולר בשנה", from −3% to +3%, starting at 0%.
  - Every figure follows it, and one list ranks all funds by it. At 0% the hedged fund is last (−11,781 ₪); below −2.87% it is first.
  - The same section marks the entered value.
- **C, today's page with the field and the section** (`page-C-today-plus-section-pc.png`). The result and the list stay single figures, now saying "if the rate does not change"; the hedged row shows a range; the section sits at the bottom.

**Why A.** The choice that moves the result most, hedged or not, answered across the dollar range, is in the headline, and no figure there rests on one guess about the dollar. The order inside each kind does not depend on the dollar, so the lists can rank. There is no new control. B makes every figure depend on a number the reader has to guess, and its 0% start is the steady-dollar assumption again. C keeps a steady-dollar headline and puts the choice at the bottom.

## 4. Decisions for the founder

1. Which option: A (recommended), B or C.
2. The dollar range: keep −3% to +3% a year, or follow the plan's length. In the past, 5-year stretches ran from −4.2% to +2.4% and 10-year stretches from −3.1% to +1.4%.

Figures for the drawings come from the site's engine with each fund's gap applied through the return; the build computes it in the engine. Break-even for the other indices, round 1: MSCI World 1.44% a year, NASDAQ 100 2.61% (fees and hedged gaps only).

## 5. Built (2026-10-29, founder: "Implement the recommended option")

Option A, as drawn, with these differences from the drawing:
- **Only a shortfall counts.** The gap to the index ("מול המדד") is shown on every fund with its years. In the figures, only the part of a shortfall beyond the fees is counted (F-92 b); a lead over the index is not counted as a gain. Counting both ways made the fund's part of the cost bars negative (Harel's tracking fund beat its index by 0.65% a year), and then the bars no longer added up to the gap in what is left (F-91). So the S&P 500 order among unhedged funds stays as before (Yelin Lapidot's tracking fund first at Psagot, 86,492 ₪ on the default plan). The hedged fund's cost is counted in full (77,032 ₪), and the crossing is −2.38% a year. The rule is provisional (Claude's), revisable.
- **The dollar's history starts in 2000**, not 2011: the ECB Data Portal's month-end series has the shekel from January 2000 (`data/series/ecb-fx-month-end.json`, `npm run fetch:ecb-month -w @finance-tool/pipeline`). Its 201 ten-year stretches run from −3.1% to +1.3% a year.
- A hedged fund with no full year in its report (MTF 5140165) is listed with its reason and not priced.
- On MSCI World and ACWI the labels say "מנוטרלת דולר" and "חשיפה לדולר ולמטבעות נוספים" (`other_currencies` on the exposure).
- The old three-way hedging filter is gone.

Checks:
- Tests: engine `fund-gap.test.ts`; site `invest.test.ts` (a hedged fund is not moved by the dollar), `render.test.ts`, `variants.test.ts`.
- Jump check on /indices/sp500: 0 moved at PC and phone.
- The slider check (every plan field changed, boxes compared): the new blocks keep their size. The plan block itself still pushes the page down 50 px per field changed; that predates this work, on every index, and is a separate task.
- Timing: the result's figures take about 6 ms and the section about 18 ms.

**Independent review (2026-10-29)** found the 43 yearly records match their reports. Fixed after it:
- The result's cards and the dollar section run on the settled plan, so they wait until the slider rests (about 15 pricings each).
- The gap carries the report's yearly figures as its inputs, the F-94 figures carry the plan's inputs, and the dollar's range is shown as the P-02 parameter.
- A crossing is never computed from a result that cannot be priced.
- The hedged colour is the guide's gold "alternative", not the fee orange.
- A group's first row never folds on a phone.
- The cross-kind range wraps, and the verdict line keeps one height.

Left open:
- The ±10% search range for the crossing is in code, not in `data/parameters/`.
- F-92 compares past gaps with today's fees.
- The range bar in the unhedged card is a one-off in the feature file.
- The stretch count counts overlapping stretches.
