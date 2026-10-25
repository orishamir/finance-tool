# Report A2: engine (2026-10-25)

Builder: Sonnet, medium effort. Saved by the lead from the builder's hand-back.

## Checks the builder ran
- `npx vitest run packages/engine`: 14 files, 302 pass, 1 todo. Golden expected values and the formula-registry test unchanged and green.
- `npm run validate`: valid. `npm run typecheck`: packages clean; one site error (the reason mapping, fixed by the lead).

## What changed
- `formulas/fees.ts`: `Commission` gains `perShare?` (NIS per share; needs `terms.sharePrice`, else a RangeError, never a silent zero) and `cap?` (a fraction of the trade value, applied last so it wins over the minimum). Formula: `min(cap × amount, max(min, min(rate × amount + perShare × n, max)))`, `n = amount ÷ fxRate ÷ sharePrice`.
- `providers/workbench.ts`:
  - E1: a trade line in `usd_per_share` becomes `perShare = value × fx.USD`; no `sharePrice` on the fund gives `needs-share-price`.
  - E2: trade minimums and maximums in `usd_per_trade`, plain `usd` (Altshuler's 9 USD) or `gbp_per_trade` convert at `fx.USD` / `fx.GBP`; FX-line bounds also accept `usd_per_trade`; a missing rate gives `needs-fx-rate`.
  - E3: the line's `cap` goes into `Commission.cap`; average-level rows carry none.
  - E5: a `RecordInputError` from `buildTariff` is that provider's not-comparable row (`record-error`, the engine's message), counted as `missing-record` in the coverage line. A snapshot that fails schema parsing still throws.
  - `ProviderInput.band` is `string | readonly string[]`: a line is asked for when its band contains any of the texts (needed to price the foreign brokers, which split one base by band).
- `variants/fund-variants.ts`: E4, a fund whose currency differs from its exposure's runs; A-01 stays in the exposure's currency, A-03 (default 0) moves the fund's currency against the shekel, the FX line and the TXF-03 tax index use the fund's currency. Not modelled: the fund currency against the exposure currency; the row carries `currencyMismatch?: { fund, exposure }`. `fundOf` maps `share_price` (unit nis, usd or eur) to `fund.sharePrice`.
- `docs/method.md`: dated notes on F-12, F-63, F-65.
- Tests: `packages/engine/test/foreign-broker.test.ts` (10 cases, with the real Interactive files); `golden/r4.test.ts` two throw assertions became `record-error` row assertions (E5), no expected value changed.

## For the page builder
- `WorkbenchInput.fx?: Record<string, number>` (NIS per unit; the site fills it with `fxRunInput`, `site/app/lib/fx.ts`).
- Reason codes: `needs-share-price`, `needs-fx-rate`, `record-error`, each with `detail`.
- Interactive Israel: two trade lines (US, Europe) on `foreign_securities`, told apart only by band; pass `band: 'מניות ותעודות סל הנסחרות בארה"ב'` (or Europe), otherwise `record-error` (ambiguous).
- Interactive Brokers: US, London and Tel Aviv lines, Fixed and Tiered each; pass a trade band ("IBKR Pro - Tiered: …" or "IBKR Pro - Fixed: …") and the FX band "המרה אוטומטית" (the standard spot line has a null rate, so without it the row is `line-without-value` whenever a currency is set).
- Pass `currency: { code, startRate }` for foreign funds and `fund.sharePrice` (via `fundOf`) for per-share brokers.

## Open
- No fund has `share_price`; the two Interactive US lines show `needs-share-price` until one is collected.
- Interactive Israel rounds fractional US shares up for the fee; the engine does not (matters only below the minimum; noted in the method).
- The `gbp_per_trade` path is built but no real record uses it.
- Per-share fees convert at the start rate; they do not follow later A-03 changes.

## Lead's follow-up (2026-10-25)
- Site: `NotComparable` takes the three codes; the row and coverage sentences word them (`copy.notComparable.needsSharePrice`, `needsFxRate`, `recordError`); the brokers page passes `fx` (`fxRunInput`); a provider whose tariff the site's pre-check cannot build now goes to the engine for its row instead of failing the whole page.
