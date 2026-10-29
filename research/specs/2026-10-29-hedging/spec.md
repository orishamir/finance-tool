# Hedged and unhedged funds on the index page (2026-10-29)

Proposal for the founder. Mockups in `mockups/` (PC, 1366 px), drawn on the site's data of 29.10.2026, the default plan (10,000 ₪, 500 ₪ a month, 10 years, 7%) and the Psagot account.

## 1. The problem

**The cost of hedging is counted nowhere.** The page prices a fund on its listed fees and takes its tracking difference as zero (`site/app/copy.ts` `funds.trackingNote`). Each fund's annual report prints its yearly return against its tracking asset (kept in `fees.tracking_difference_12m.notes` of each record). The shortfall beyond the listed fees, averaged over the full years printed:

| | Funds | Shortfall beyond fees, a year |
|---|---|---|
| Unhedged | every one with a full year in its report | between −0.2 and −0.9 points (they did better than their fees imply) |
| Hedged | 1144336, 1147362, 1143734, 1165844, 5127527, 5139696 | between 1.79 and 2.68 points |

5140165 has no full year yet (23.4.2025 to 31.12.2025 only).

Visible effect: on MSCI World the page's pick is the dollar-hedged 5139696 (85,182 ₪). With its shortfall counted it leaves 78,540 ₪ and ranks last of the four priced. The S&P 500 hedged fund 5127527 drops from 85,224 ₪ to 77,431 ₪, and NASDAQ 100's 1165844 from 84,808 ₪ to 75,827 ₪.

**The page assumes the shekel-dollar rate never changes** (A-03 fixed at 0 on this page, no field for it). That is the one case where hedging only costs. In the reports the S&P 500 returned −18.52%, 25.70%, 24.16% and 17.43% in dollars in 2022 to 2025, against −7.55%, 29.43%, 24.96% and 2.61% in shekels. The yearly gap (up to 14.8 points) is far larger than any fee difference on the page (about 1 point). ETF-12 treats a hedged fund as a different tracking asset, so ranking both together by fees also breaks ground rule 2.

**The engine moves hedged funds with the currency.** F-04 (`packages/engine/src/variants/fund-variants.ts`, and `fundRun` in `site/app/lib/providers.ts`) applies A-03 to every shekel fund on a foreign index, hedged or not. With the dollar falling 3% a year, 5127527 drops from 85,224 ₪ to 73,814 ₪, like an unhedged fund. This does not show on the index page today, where A-03 is 0, but it does on `/workbench/funds/:exposure`, which has the currency field.

**The label claims more than is true.** "מנוטרלת מט״ח" says a change in the rate does not change the fund's value, and that the cost is "in the fees or the tracking". The cost is counted nowhere. The two MSCI World hedged funds remove only the dollar ("מנוטרלת דולר", exposure code 4D, foreign currency up to 120%), so other currencies still move them.

**Leftover control.** The three-way hedging filter in `site/app/components/invest/funds.tsx` remained after hedging became a label filter (D28 as amended 2026-10-27). It shows only when no pair can be priced.

**Rule base gap.** What currency hedging costs and why is not in il-finance (`reits-and-gold-funds.md` open question 10, `etfs-and-index-funds.md` open question 18). The reports give the size of the gap but not its cause, so the page cannot explain the cause yet.

## 2. Changes in every option

1. **Data.** Each fund record gets its yearly returns against its tracking asset as fields (year, fund, tracking asset, with the report's page), taken from the reports already read. Schema and `docs/data-schema.md` change; data-update collects them for new funds.
2. **Method.** A new formula: a fund's shortfall beyond its listed fees, `max(0, mean over full calendar years of (tracking asset − fund) − listed fees)`, enters the run as the fund's tracking difference. Provisional choices (Claude's, revisable): only full calendar years count; a fund that beat its index is counted as zero, so funds with a short record are not ranked below funds that earned a credit; an unhedged fund with no full year takes zero, as every unhedged fund with one shows no shortfall; a hedged fund with no full year is listed with its reason and not ranked.
3. **Engine.** A hedged fund does not move with A-03 (F-04 and `fundRun`), with a golden test.
4. **Labels.** "מנוטרלת דולר" for a fund that hedges only the dollar (from its name); the explanation says what the page counts. The old three-way filter goes.
5. **Rule base.** The domain-specialist researches what hedging costs and why, from a regulator or Bank of Israel source, to close the two open questions.

## 3. How the page shows the choice (mockups)

- **Fix, all options** (`fix-msci-world-before-after-pc.png`). MSCI World before and after: the unhedged 5122569 becomes the pick, 5139696 falls to fourth, 5140165 is listed with "בדוח השנתי של הקרן עוד אין שנה מלאה". A fourth figure, "פער מהמדד", joins the fees.
- **A, one list, the label explains the choice. Recommended** (`option-A-label-sheet-pc.png`). Keeps the decision of 2026-10-27 (hedging is a label, not a filter) and builds the explanation it left for later. The sheet has the meaning, the index in dollars and in shekels each year 2022 to 2025 with the dollar's yearly change, what the hedge cost in this fund (2.44% a year short of its index, 0.32% of it fees, 2.12% counted), and the dollar fall at which the hedged fund leaves more on the reader's plan (2.27% a year against the chosen fund).
- **B, hedging is a choice of what you hold** (`option-B-holding-switch-pc.png`). A switch above the lists: "S&P 500 בשקלים · 13 קרנות" / "S&P 500 בדולרים, מנוטרל מט״ח · קרן אחת". The lists and the result rank one kind only; below, the cheapest of each kind side by side and the break-even. This is the separate-variant idea the founder turned down on 2026-10-27, now with the cost known.
- **C, a field for the dollar's yearly change** (`option-C-currency-field-pc.png`). One list as today, with a new plan field. At −3% the hedged fund ranks first; at 0% it ranks last. The ranking then rests on the reader's guess about the dollar.

**Why A.** It fixes the wrong pick without a new control. It answers the reader's real question ("should I take the hedged one?") with sourced past figures and one computed threshold instead of a forecast, and it keeps the founder's earlier decision. B adds a control that, on S&P 500, switches to a list of one fund. C makes every figure on the page depend on a guess about the dollar.

## 4. Decisions for the founder

1. Which option: A (recommended), B or C.

Break-even figures for the other indices, for reference: MSCI World 1.44% a year (5139696 against 5122569), NASDAQ 100 2.61% (1165844 against 5129283).
