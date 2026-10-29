# Hedged and unhedged funds on the index page (2026-10-29)

Proposal for the founder. Mockups in `mockups/` (PC, 1366 px), drawn on the site's data of 29.10.2026, the default plan (10,000 ₪, 500 ₪ a month, 10 years, 7%) and the Psagot account. Builds on the decisions of 2026-10-27 (hedging is a label, not a filter) and 2026-10-28 (the page opens on the best unhedged pair; a with/without-the-dollar switch was turned down; "pricing the hedge from the funds' reported gaps" was one of the three options and was not chosen then). Both decisions stay.

## 1. What is still wrong after 2026-10-28

**Hedged funds are priced on their fees alone.** The page opens on the right fund, but the fund list still prices every fund on its listed fees with tracking difference taken as zero. On MSCI World the two hedged funds sit above the opened fund with "+993 ₪"; with their reported shortfall counted they leave 5,649 ₪ less, not 993 ₪ more. The label now says the cost is not counted, but the figure beside it is still wrong. The same holds when a reader picks a hedged fund: the result and the cost bars are overstated (S&P 500's 5127527: 85,224 ₪ shown, 77,431 ₪ with its shortfall).

**The size is known from the funds' own reports.** Each annual report prints the fund's yearly return against its tracking asset (kept in `fees.tracking_difference_12m.notes` of each record). The shortfall beyond the listed fees, averaged over the full years printed:

| | Funds | Shortfall beyond fees, a year |
|---|---|---|
| Unhedged | every one with a full year in its report | between −0.2 and −0.9 points (they did better than their fees imply) |
| Hedged | 1144336, 1147362, 1143734, 1165844, 5127527, 5139696 | between 1.79 and 2.68 points, in every year 2022 to 2025 |

5140165 has no full year yet (23.4.2025 to 31.12.2025 only).

**The engine moves hedged funds with the currency.** F-04 (`packages/engine/src/variants/fund-variants.ts`, and `fundRun` in `site/app/lib/providers.ts`) applies A-03 to every shekel fund on a foreign index, hedged or not. With the dollar falling 3% a year, 5127527 drops from 85,224 ₪ to 73,814 ₪, as an unhedged fund would. The index page has A-03 at 0, so this does not show there, but it does on `/workbench/funds/:exposure`, which has the currency field.

**Labels.** The two MSCI World hedged funds remove only the dollar ("מנוטרלת דולר", exposure code 4D, foreign currency up to 120%), yet carry "מנוטרלת מט״ח", whose explanation says a change in the rate does not change the fund's value.

**Leftover control.** The three-way hedging filter in `site/app/components/invest/funds.tsx` remained after hedging became a label filter. It shows only when no pair can be priced.

**Rule base gap.** What currency hedging costs and why is not in il-finance (`reits-and-gold-funds.md` open question 10, `etfs-and-index-funds.md` open question 18). The reports give the size of the gap, not its cause.

## 2. In every option

1. **Engine.** A hedged fund does not move with A-03 (F-04 and `fundRun`), with a golden test.
2. **Labels.** "מנוטרלת דולר" for a fund that hedges only the dollar (from its name). The old three-way filter goes.
3. **Rule base.** The domain-specialist researches what hedging costs and why, from a regulator or Bank of Israel source, to close the two open questions.

## 3. Options (mockups)

- **A, price the hedge from each fund's reports, and the label explains the choice. Recommended.**
  - Part 1 (`option-A1-msci-world-now-and-after-pc.png`): MSCI World today and after. The hedged 5139696 moves from "+993 ₪" to "−5,649 ₪"; 5140165 is listed with "בדוח השנתי של הקרן עוד אין שנה מלאה". A fourth figure, "פער מהמדד", joins the fees.
  - Part 2 (`option-A2-label-sheet-pc.png`): the "מנוטרלת מט״ח" sheet on S&P 500. It gives the meaning; the index in dollars and in shekels each year 2022 to 2025, with the dollar's yearly change; what the hedge cost in this fund (2.44% a year short of its index, 0.32% of it fees, 2.12% counted); and the dollar fall at which the hedged fund leaves more on the reader's plan (2.27% a year against the chosen fund).
  - Data: each fund record gets its yearly returns against its tracking asset as fields (year, fund, tracking asset, report page), from the reports already read. Schema and `docs/data-schema.md` change; data-update collects them for new funds.
  - Method: a new formula, a fund's shortfall beyond its listed fees, `max(0, mean over full calendar years of (tracking asset − fund) − listed fees)`. It enters the run as the fund's tracking difference. Provisional choices (Claude's, revisable):
    - only full calendar years count;
    - a fund that beat its index counts as zero, so a fund with a short record is not ranked below funds that earned a credit;
    - an unhedged fund with no full year takes zero, since every unhedged fund with one shows no shortfall;
    - a hedged fund with no full year is listed with its reason and not ranked.
- **B, hedged funds listed without a figure** (`option-B-hedged-without-figure-pc.png`). No new calculation. While the hedge's cost is not counted, a hedged fund is listed with its label and the reason, like any fund that cannot be priced. The wrong "+993 ₪" goes, but the reader learns nothing about what hedging costs, and picking a hedged fund gives no result.
- **C, a field for the dollar's yearly change** (`option-C-currency-field-pc.png`). One list as today, with a new plan field, after A's pricing. At −3% the hedged fund ranks first; at 0% it ranks last. The ranking then rests on the reader's guess about the dollar.

**Why A.** It removes the wrong figure and answers the reader's real question ("should I take the hedged one?") with sourced past figures and one computed threshold instead of a forecast. It keeps both earlier decisions and adds no control. When "pricing from the reported gaps" was set aside on 2026-10-28, it was not yet checked across every record: the gap holds for all six hedged funds in every year printed, and every unhedged fund shows none. B is the smallest safe step, but it leaves hedged funds unpriced for good unless A follows. C makes every figure on the page depend on a guess about the dollar.

## 4. Decisions for the founder

1. Which option: A (recommended), B or C.

Break-even figures for the other indices, for reference: MSCI World 1.44% a year (5139696 against 5122569), NASDAQ 100 2.61% (1165844 against 5129283).
