# Job 1 report: the price underneath (2026-11-04)

Saved by the lead from the builder's final message (the builder could not write files of its own report).

`npm run check` passes: 1554 tests (from 1508), no existing number moved.

## Schema

- `groupPriceValue` (optional `value` on a group price) holds exactly one kind of price: `exempt`, `discount_pct` (with `not_below_pct`), `rate_pct` with `per`, `flat` (with `flat_up_to`), or `per_share_cents`.
- `min`, `max` and `currency` where the words print an amount or bound; `for_months` where the price's words say how long, or its entry prints a plain period from joining.
- Validator: `checkGroupValues` in `packages/pipeline/src/validate.ts`, tests in `price-premises.test.ts`. `docs/data-schema.md` and the JSON Schema updated.

## Filled and left out

112 of 140 group prices filled (140 across 12 houses). Only insertions in the data files.

Left out (28): two prices in the words, for shares and bonds (Hapoalim, Leumi, Mercantile); tiers (Yahav, all three); Mercantile's abroad trade price ("ועמלת סוכן"); Discount's custody exemption below 150,000 (8 prices); Excellence's 40-purchase limit; Altshuler's and Meitav Trade's custody exemptions.

`for_months`: Top and Deluxe 36, student 48, masters 24, released 12 or 24, PEPPER 12, Leumi's opening offers 12.

## Formula F-101 (`docs/method.md` 4.1, after F-14)

A purchase in month m pays the price of month m; custody and the fixed fee charged in month m use that month's tariff on F-14's phase; the sale at T pays the price at T; each tariff's own minimum and maximum apply. u = 0 is the second tariff throughout; u ≥ T the first. A tariff without a period is unchanged.

Leumi example (100,000 held 12 months, custody only): 449.27 at the student price for 6 months then the list price, against 598.65 at the list price throughout.

Built in the securities ledger through `tariff.until`; `EnteredTariff` and F-61 handle both periods.

## Tests

- `packages/engine/test/tariff-period.test.ts`: u = 12, 14, 0, past the horizon, T and T−1, a monthly plan with the standing-order price, a small balance, the F-61 split, the workbench path.
- `site/app/lib/own-account.test.ts`: starting points and layers; the account on the price list alone equals the house's row to 9 digits; Top for 3 years, 2 years and the whole plan; the person's values over the group's; save, export and import; a house that is gone; an old entry loading unchanged; the panel's numbers.
- Expected values from `tests/golden/expected_tariff_period.py` and `tests/golden/expected_own_account.py`.

## State

`CustomBroker` gains optional `base { houseId, houseName, group }` and `untilYears`. The six existing fields are the person's values: null means "as the base" with a base, zero without one. State version unchanged. The tariff is built per run: the house's list tariff, then the group's values, then the person's (`ProviderInput.layered`). A house no longer on the site falls back to the typed-values path.

## Choices to review

- A group trade price, or a typed trade value, removes the list's standing-order line.
- A person's custody rate over a group exemption has no maximum.
- A group price is not applied where the house's list has no line for that kind of holding.
- One `untilYears` covers all of the group's prices.
- The guard "calculation never reads a group price" now names `own-account.ts` as the one reader.

## Exports for job 2

- `own-account.ts`: `startingPointsOf`, `baseOf`, `layeredOf`, `layeredTariff`.
- `own-account-view.ts`: `layersOf` (per fee type list, group and person figures and `setBy`), `withoutGroupLine`, `ownAccountResult` (`left`, `place`, `rank`, `of`, `difference`, `yours`, `list`, `deciding`, each with provenance), `groupFigure`, `groupInputs`.
- `invest.ts`: `listReading`.

## New strings (`invest.ownAccount` in `copy.ts`)

- `placeAbout(of)`: "המקום בין {of} חשבונות, לפי מה שנשאר בסוף"
- `differenceAbout`: "מה שנשאר בחשבון שלכם פחות מה שנשאר בחשבון לפי המחירון של אותו בית, באותה קרן"
- `decidingAbout(line)`: "ההפרש בין המחירון לחשבון שלכם: {line}"

## Files changed

`packages/engine/src/ledgers/securities.ts`, `packages/engine/src/providers/workbench.ts`, `packages/engine/src/fees/materiality.ts`, `packages/engine/src/registry.ts`, `site/app/lib/custom-entries.ts`, `site/app/lib/invest.ts`, `site/app/lib/own-account.ts`, `site/app/lib/own-account-view.ts`, `site/app/copy.ts`, `docs/method.md`, `docs/data-schema.md`, the schema and its JSON export, the validator, the fee records (group values only), tests and golden scripts.

## Finance review (2026-11-04) and the lead's rulings

The independent check found F-101 coherent and the ledger correct (every event on its month's tariff; no-period runs unchanged; the golden scripts' arithmetic independent and matching). Defects in the layering, with the lead's ruling on each:

1. **A group or typed trade price deleted the list's standing-order line** (own-account.ts:201, :234, :249). Leumi Total Digital, 500 ₪ a month: 26 ₪ an order instead of the list's 5 ₪, 2,520 ₪ over 10 years. Ruling: a value replaces only what it states, so the list's standing-order line (and fx plan line) stays. Where the group or the person sets the regular trade price, a monthly purchase pays the lower of the standing-order price and that regular price, order by order (the person can place either). Where neither sets it, F-12 as now, so the account on the list alone still equals the house's row.
2. **One "until when" for all of a group's prices** (:55-58, :283). Leumi's opening offer: the custody exemption's 12 months ended the 7 ₪ trade price too, which has no printed end; a sale at month 60 paid 400 ₪ instead of 7 ₪. Ruling: each price ends at its own `for_months` where it has one; the panel's "until when" is how long the person stays in the group (empty: the whole plan) and ends every group price no later than that. F-101 becomes a sequence of tariffs (months 1 to u₁, u₁+1 to u₂, …, then the list).
3. **A purchase-only price was applied to the sale** (:198-199): Mercantile Top and Deluxe abroad say "עמלת קניה". Ruling: a `side` ("buy" | "sell", absent for both) on the group value where the words name one; the other side keeps the list's price.
4. **A typed custody rate got a different maximum per period** (:240). Ruling: a typed or group rate keeps the list's minimum and maximum in every period unless it states its own.
5. **A period ending mid-quarter** charges the whole straddling quarter at the second tariff. Ruling: the site's ends are whole years or printed months (12, 24, 36, 48), all on quarter boundaries; record the limitation in method section 12 and have the engine refuse an `until` that is not a multiple of the custody period, rather than prorate.
6. **`names_fund: false` was ignored.** Ruling (the "no price from analogy" rule): a group price that does not name funds is not applied to a fund by the site. The panel shows its words beside the list price with a one-tap "use this price", which makes it the person's own value (entered, blue). Altshuler's group values rest on advertising: remove them. PEPPER's exemption carries "עד 30 פעולות בחודש", an order-count condition: remove its value, as Excellence's 40-purchase limit was.
7. **A group `rate_pct` kept a list `perShare`** (:170-175): a stated rate replaces the commission's whole rate shape, keeping min and max unless stated.

Test gaps to close: the golden scripts add conversion by period, a standing-order price in the later tariff, a house with a standing line under a group trade price (defect 1), the sequence of periods (defect 2), and a buy-only price (defect 3); `expected_own_account.py` computes from the written layering rules above, not from the code's choices.

## Fixes (job 1b), 2026-11-04

`npm run check` passes: 1569 tests (from 1554). Nothing committed. No existing expected number moved (the tariff-period script's cases that used an end between two charges now use ends on a charge or a monthly-custody tariff; their figures are unchanged where the case is the same).

**Rulings**
1. Standing-order line stays. A group or typed regular trade price (or a typed conversion price) no longer deletes `buyStanding` or `fxStanding`; the tariff carries `cheaperOfStanding` and the engine's monthly purchase pays, order by order, the lower of the two (`runSecurities`, `buy()`). Without the flag the standing price replaces the regular one as before, so the account on the price list alone still equals the house's row (checked at Mercantile and at Leumi, to 9 digits).
2. F-101 is a sequence. `tariff.until` and `EnteredTariff.until` nest (`then` may carry its own `until`, ends counted from the run's start). `layeredTariff` gives each group price its own end (`for_months`, none: no end) capped by the person's stay; the stretches between ends are built from the prices not yet ended. `StartingPoint.printedEndMonths` is replaced by `endsMonths` (distinct printed ends; the "until when" field starts empty). Method F-101 amended with its date; worked examples kept, and Leumi's opening offer added (custody exempt 12 months, 7 ₪ a trade with no end, stay 5 years: trade 314.00, custody 2,074.18, left 107,611.82; stay 3 years given too).
3. `side` ("buy" or "sell") on a group value; the other side keeps the list's price.
4. A typed or group custody rate keeps the list's minimum and maximum per month in every period (`applyOwn(base, own, list)`).
5. The engine refuses an end that is not a multiple of the custody period of either tariff it separates (`checkTariffPeriods`, `(u + gridOffset) mod n`); the workbench row says "record-error" with the reason; method section 12 gets G-31 (mid-quarter limitation). Note for job 2: a stay typed in years between two charges at a yearly-custody house gives that reason; limit the field to whole years or say so.
6. `names_fund: false`: the layered tariff does not apply the price to a fund. Job 2 exports in `own-account.ts`: `adoptGroupPrice(list, price, run)` returns the person's fields (`tradePct`, `tradeMin`, `custodyPct`, `custodyMin`) or null where they cannot hold it (price per share, flat price up to a sum, a maximum the list lacks). In `own-account-view.ts` each `FeeLayers.group` gains `applied`, `side` and `adopt`; `setBy` is "group" only for an applied price. `groupInputs` lists only applied prices.
7. A stated group rate replaces the commission's whole rate shape (flat, per share, per-share-above, per-unit) and keeps min/max/cap unless stated; a discount scales every component.

**Data changes** (only these, besides the earlier insertions)
- Schema: optional `side` on a group value; `docs/data-schema.md` and `packages/schema/json/fees.schema.json` updated; validator checks it against the words both ways (a one-sided price without `side` fails), tests added.
- `mercantile@2026-11-04.json`: `"side": "buy"` on Top's and Deluxe's trade_abroad ("עמלת קניה בחו"ל"), the only two found by reading every valued trade price's words and quote.
- `altshuler-trade@2026-11-04.json`: both group values removed (advertising). `pepper@2026-11-04.json`: both values removed (the exemption is limited to 30 orders a month). Net 108 valued prices (from 112).

**Tests added** (15): sequence of three, T and T-1 with monthly custody, refusal cases, the lower-of rule for orders and for conversion, a standing price only in the later tariff (engine); Leumi opening offer for the whole plan, 5 years, 3 years, 6 months; Total Digital not applied, then adopted; adopted over the offer; buy-only; two ends; mid-quarter refusal; rate-shape replacement; adoption (site); side validation (pipeline). Expected figures from `tests/golden/expected_tariff_period.py` and `tests/golden/expected_own_account.py`, which now compute the layering from the written rules (Leumi and Mercantile data lines).

**Not followed**: none. One consequence to know: 82 of the 108 valued group prices name no fund units, so most groups (Top, Deluxe, Leumi's offers, Total Digital) now leave the row at the price list until the person adopts a price; the Mercantile Top test cases were replaced by the student custody line (names funds) and by synthetic groups read as if the words named funds.

## Second finance check (2026-11-04)

Rulings 1, 2, 3, 4 and 6 confirmed as implemented, and the golden scripts independent. Found:
- **Adopting a price lost its end and the stay cap** (`adoptGroupPrice` copied it into the person's flat values): Leumi's opening offer adopted gave custody exempt for 60 months instead of 12, 2,074.18 ₪ overstated. Sent to the panel builder: adopting records the price on the account (`base.group.adopted`), and `partsOf` treats it as a price that names funds, with its own end.
- **One `cheaperOfStanding` flag for trade and conversion**, and the lower-of chosen per part: a person typing only a conversion price makes the commission the lower of standing and regular (F-12 forbids), and a regular commission can combine with the plan's conversion price, which no single order offers. To fix after the panel job: one flag per side, and the cheaper whole order (commission and conversion together) chosen per order.
- Test gap: conversion that changes between periods is in neither golden script.
