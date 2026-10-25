# Report B2: the comparison's securities-account card over the indices (2026-10-25)

Builder: Sonnet, medium effort. Saved by the lead from the builder's hand-back.

## Checks the builder ran
`npx vitest run site` (37 files, 424 tests), `npm run typecheck`, `npm run validate`: clean. Render-tested only; not looked at in a browser.

## What changed
- `site/app/lib/compare-index.ts` (new): `planOfGoal` (the same plan the index page builds), `readIndex` (range over the known indices before a choice, `cheapestWay` after), `applyIndexWay` (the way's fund, costs and broker tariff into the brokerage wrapper), `applyIndex` (falls back to the next-lowest runnable way). No return in the goal: nothing applied.
- `site/app/lib/compare.ts`: `RunGoal.ownIndices`, `IndexFundTerms`, `CompareBundle.indexFunds`, `representative.viaIndex`; `applyProviders` leaves the broker alone when a way is applied.
- `site/app/lib/compare.server.ts`: `indexFundTerms` for every fund on an equity index (shekel funds only). Class fix: the brokerage providers list was read as `etf_units`; it is now read for the representative fund's class.
- `site/app/components/compare/index-card.tsx` (new), `representative.tsx`, `rows.tsx`, `ctx.ts`, `site/app/routes/goal-compare.tsx`: the card shows the range, one line on how the ranking uses it, and the index chips; after a choice "הדרך הזולה: {ברוקר} · {קרן}", "כל הדרכים להשקיע במדד ←" to `/invest/{id}`, and a clear button. The representative fund's name is no longer printed on the card. The page loads the workbench bundle beside the compare bundle; if that fails the card shows no index.
- `site/app/copy.ts`: `ownTermsCopy.index` (exact-string Edit).
- `site/app/lib/own-rate.ts`: `OwnTerms.index` stored per goal and wrapper in `mekor.v2.own-rates`; old goals load unchanged.
- Outside the list: `site/app/lib/revisit.ts`, `site/app/components/revisit/use-revisit.ts` (a saved comparison re-runs with the same index layer, so it shows no spurious change).
- Tests: `compare-index.test.ts` (11), `components/compare/index-card.test.ts` (2).

## No line, no price in the comparison
The pick could land on One Zero and did: on Doron's goal (67,000 ₪, 8 years, 7%) One Zero was the pick at 89,759 against Psagot's 89,357, priced as if the tracking fund were an ETF. Now the providers list is Psagot, IBI and Altshuler Trade for a tracking fund.

## Numbers (today's shekels)
| Plan | Before | After |
|---|---|---|
| Founder (6,000 + 400 a month, 20 years, 7%, 2%) | 155,116 (Psagot, 5139282) | 147,744 with no choice (lowest: MSCI ACWI ETF); range 147,744 to 155,116; S&P 500 chosen 155,116; TA-35 154,323; kupat gemel lehashkaa 145,967 |
| Doron (67,000, 8 years, 7%) | 89,759 (One Zero pick) | 89,357 after the class fix; 87,384 with no choice; kupat gemel lehashkaa 85,870 |
The account stays first on both plans. The comparison's run of each way equals the index page's value within 0.5 ₪.

## Tests changed
`compare-broker.test.ts`: providers list psagot, ibi, altshuler-trade; best provider Psagot; 20-year case 1,094,858 (was 1,098,743); the "Leumi in the picker" assertion removed; Doron's pick Psagot at 89,357 (gap at least 3,000); own-choice test uses IBI; new test that the pick never lacks a line for the class. `splitOwnTerms` shape (one line each in `compare-broker.test.ts`, `compare-represent.test.ts`).

## Open
- The picker no longer offers the banks (their tariffs have no tracking-fund line): a Leumi customer can't pick Leumi. A "no line" row in the picker would fix that.
- The card's figures are in today's shekels even in nominal mode.
- A stored broker choice (`ownProviders`) is read with the tracking-fund tariff even if the chosen index's cheapest fund is an ETF.
- The lowest-of-range ranking is provisional (D10), told to the founder.

## Doc text for the lead
Method F-80 note (no index until chosen; lowest of the range before; the cheapest way after; the pick reads only providers with a line for the fund's class); Doron's case note (Psagot 89,357 since 2026-10-25); design-spec card; copy `ownTermsCopy.index`.
