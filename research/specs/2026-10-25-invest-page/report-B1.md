# Report B1: the index page "השקעה במדד" (2026-10-25)

Builder: Sonnet, medium effort. Saved by the lead from the builder's hand-back.

## Checks the builder ran
`npx vitest run site` (35 files, 409 tests), `npm run typecheck`, `npm run validate`: clean. A look at `/invest/index-sp500` at 1280 and `/invest` at 390 in headless Chrome against the dev server.

## Important finding
`instrumentClassOf` (providers.ts) classed every Israeli open tracking fund as `etf_units`: the legal form reads "not traded on the exchange, ETF-04" and the regex /ETF/ matched the rule id. Fixed; the funds page, brokers page and playbook numbers for tracking funds move. The lead's earlier table (tracking-fund column) was priced with the wrong class. With the right class One Zero has no trade line for `mutual_fund_units`; the engine charged nothing and One Zero looked free, so the page treats "no trade line for the class" as "אין שורה בתעריפון", never a price. Founder's plan (6,000 + 400 a month, 20 years, 7%, 2%): Psagot with tracking fund 5139282, 155,116 ₪ left.

## What changed
- `site/app/lib/invest.ts` (new): options `il-tracking`, `il-etf`, `tase-foreign`, `abroad` (Israeli index: first two); broker grid on a zero-fee generic fund through `providerWorkbench`; failures become per-broker reasons; funds priced at the option's cheapest broker and at the person's broker; abroad cells try US, Europe and plain readings and keep the cheapest that computes, naming the exchange; `availability: false` gives "unavailable" with source; IBKR Fixed only, FX band "המרה אוטומטית"; currency-to-currency FX lines dropped by name (`FX_TO_FX`); a way resting on an open rule (G-18) is shown with a lock, not ranked; bars (broker, fund, ETF vs tracking, Israel vs abroad, where "Israel" includes `tase-foreign`); order check at 0% and 10% when the return is the illustration, within P-01 counted as one place.
- `site/app/lib/labels.ts` (new): 20 label ids with icon, tone and rules; words in `copy.invest.labels`.
- `site/app/components/invest/**` (new), `site/app/routes/invest.tsx` (new; `/invest` and `/invest/:exposureId`, `?custom=<id>` on the client), `routes.ts`, `paths.server.ts` (pre-render `/invest` and every `equity_index` exposure).
- `site/app/lib/state.ts`: optional `customIndices` and `broker` on state v3 (version unchanged), validated, exported, merged on import.
- `site/app/copy.ts`: `invest` block and the nav entry. Caution from the builder: the first append and the menu edit were made by a script that rewrote the file; later edits used Edit.
- `site/app/lib/variants.ts`: the funds page runs `fundVariants` once per instrument class with that class's tariff, merges and re-ranks; provider lookup includes `foreign_broker`.
- `site/app/lib/providers.ts`: `providersOf` includes `foreign_broker`; `fundRun` no longer refuses a fund in another currency than its index (E4); `instrumentClassOf` fixed; `buildProvidentListing` skips foreign brokers.
- Outside the list: `site/app/components/shell.tsx` (nav), `site/app/routes/workbench-funds.tsx` (provider dropdown takes `foreign_broker`).

## B1 API (also in requests.md)
`knownIndices`, `indexById`, `refOfCustom`, `cheapestWay`, `brokerCostsByOption`, `rangeOverKnownIndices`, `buildInvest`. Values differ between indices only through fund fees (one return for all indices).

## Tests
`invest.test.ts` (13), `state.test.ts` (+3), `variants.test.ts` (+1: funds page equals brokers page for 5139282 and 1144385 at Psagot), `components/invest/render.test.ts` (2).

## Open
- Interactive Israel's tracking-fund column reads "אין שורה בתעריפון", not "לא זמין" (its availability omits `mutual_fund_units`).
- Psagot abroad: US line has no rate; Europe line's minimum is in EUR, which the engine's `bound()` rejects.
- Yahav, Jerusalem, One Zero: currency-to-currency FX lines have no band (the page drops them by name; a band in the data is the better fix). IBI abroad is `line-without-value`.
- IBKR's TASE lines price the Israeli options though availability is unconfirmed.
- No fund has `share_price` (US per-share lines show `needs-share-price`). `tase-foreign` has no fund record. Distributing funds show "needs yield".
- Not built: "only in shekels" and "only on TASE" filters; "what each label means for this plan".
- Product question: the headline excludes open-rule ways (G-18).

## Doc text for the lead
Design-spec screen, flows (custom index), design-system label families and tones, copy.md strings, method notes (generic-fund broker cost, no line means no price, IBKR Fixed only, best-of-exchange abroad cell).
