# Report A1: schema and data foundations (2026-10-25)

Builder: Sonnet, medium effort. The builder's Write tool refused the report file, so the lead saved its hand-back here.

## Checks the builder ran
- `npm run validate`: data/ is valid.
- `npx vitest run packages/schema packages/pipeline`: 9 files, 127 tests pass.
- `npm run typecheck`: clean in `packages/`; the site had 4 errors from the new `foreign` regulator (fixed by the lead, see below).

## Schema fields
- `value.ts`: units `usd_per_share`, `usd_per_trade`, `gbp_per_trade` (S2) and `fx_per_eur` (A3's request); new export `instrumentClass`.
- `fees.ts`: `provider.class` adds `foreign_broker`; `provider.regulator` adds `foreign`; `provider.regulator_foreign {name, name_he, country}` is required exactly when the regulator is `foreign` (superRefine, so `feesSnapshot` is a ZodEffects with no `.shape`). A fee line gets `cap?` (unit `pct_of_trade`): commission = min(cap × trade, max(min, rate × base)). A snapshot gets `availability?: [{applies_to, available, source {url, title, checked}, note?}]`.
- `funds.ts`: `replication? {method: physical | swap | futures | mixed, source {url, page?, checked}}`, `hedged?`, `share_price?` (no record carries it yet).
- `exposures.ts`: `constituents_israeli?`.
- `validate.ts`: `foreign_broker` goes with `foreign`; a class may not appear in two availability entries.
- `docs/data-schema.md`: units line, a dated note under §2, notes in §3.4, §3.5, §3.6. New test `packages/schema/test/foreign-broker.test.ts` (7 cases).

## Data
- Interactive Israel: `foreign_broker`, CySEC (Cyprus). US line 0.01 USD a share, minimum 2.5 USD, cap 2%. Europe line minimum 2.5 USD (a 2.5 GBP doubt is in its note). Availability: TASE shares, bonds, ETFs and TASE foreign funds not available; foreign securities available.
- Interactive Brokers: `foreign_broker`, SEC/CFTC or the Central Bank of Ireland by carrying entity (BRK-43). US Fixed 0.005 a share, minimum 1.00, cap 1%; US Tiered 0.0035 (first volume tier only), minimum 0.35, cap 1% (the page also says 0.5%, noted as a doubt). LSE minimums moved to `usd_per_trade`. Spot FX rate stays null (basis points have no unit). Availability: foreign securities only; Israeli mutual funds and TASE at IBKR left out (unconfirmed).
- `replication` on 46 fund records (latest snapshot of each), sourced to the annual report the record's REPLICATION text cites, with its page. Swap-only is `swap`, physical-only `physical`, any mix of swaps, futures or derivatives `mixed`; 1143700 and 1143718 (assets plus synthetic options) `mixed`; 1144336 and 5124573 (swaps plus ETFs) `mixed`; 1146356 and 1146570 ("mainly the index securities, plus synthetic contracts") `physical`. Money-market funds 1223866 and 5138763 name no method. The iShares CSPX record is `physical` from its factsheet.
- `hedged: true` on 1143734, 1144336, 1147362, 1165844, 5127527, 5139696, 5140165 (name or legal form says the currency is neutralised); left out elsewhere.
- `constituents_israeli`: true on TA-35, TA-90, TA-125; false on S&P 500, NASDAQ-100, MSCI World, MSCI ACWI.

## Open
- No fund has `share_price`, so per-share lines price as needing a share price until one is collected.
- Which cases count as `mixed` is the builder's judgement; each is a one-line change per record.

## Lead's follow-up (2026-10-25)
- Site: `RowProtection` and the institutions tariff type take `foreign` with `foreignRegulator` (the Hebrew name from `regulator_foreign`); the broker row, protection line and brokerage card print it; `classWords.foreign_broker` is "ברוקר זר".
- `packages/schema/json` regenerated (the superRefine is not in the JSON Schema export; the validator enforces it).
