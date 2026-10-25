# Report A3 (fx), 2026-10-25

## What changed
- `packages/pipeline/scripts/fetch-ecb-rates.ts` (new) + script `fetch:ecb` in `packages/pipeline/package.json`. Fetches the ECB daily XML, parses it (`parseEcbXml`), builds the series (`buildSeries`), checks it with `seriesRecord`, writes `data/series/ecb-fx.json`. Run: `npm run fetch:ecb -w @finance-tool/pipeline`. `--from-file x.xml` reads a saved file.
- `data/series/ecb-fx.json` (new): ECB reference day 2026-10-23, 29 currencies per euro (USD 1.1193, ILS 3.4939, JPY 175.51 ...), one observation per currency (`key` = ISO code), terms confirmed (read 2026-10-25, ECB copyright conditions in `notes`), attribution "הבנק המרכזי האירופי (ECB)", daily, `stale_after_days` 5. Latest day only. Unit `fx_per_eur` (A1 added it to the schema on request).
- `site/app/lib/fx.ts` (pure) and `site/app/lib/fx.server.ts` (`loadFx()` reads the series file).
- Typed start rate removed: `FundAssumptions.fxStart` and its parsing are gone (`providers.ts`, `variants.ts`); the funds sheet shows the ECB rate read-only with its provenance (`Num`) and label; the chips show it; the "הזינו את שער" reason became `no-rate` ("אין שער ל־X בשערי הייחוס..."), shown only when the ECB has no rate for the currency. A-03 (`fxChange`) is unchanged. An old saved `fxStart` is ignored.
- `fundRun(...)` takes an optional fifth argument `fx`; `WorkbenchBundle.fx?: FxSnapshot` was added. `buildFundVariants` and `buildProviderWorkbench` read `bundle.fx`.

## API for the page builder
```ts
import { nisPer, nisPerNumber, nisPerQuoted, fxLabel, hasRate, type FxSnapshot } from "./fx";
import { loadFx } from "./fx.server";   // server side only; carry the FxSnapshot in the bundle/loader data
nisPer(fx, "USD", today): SiteValue | null   // NIS per ONE unit, state "computed", formula F-84, unit "nis"
                                             // .about = "מחושב משערי הייחוס של הבנק המרכזי האירופי, 23.10.2026"
                                             // .notes = ECB attribution; .stale set after stale_after_days (D3)
                                             // inputs: ILS per EUR and code per EUR as sourced values (ECB url)
nisPerNumber(fx, code): number | null        // the bare number, for the engine's `fx` run input
nisPerQuoted(fx, code): { per: 1 | 100; value } | null   // JPY per 100
hasRate(fx, code): boolean
fxLabel(fx): string
```
Codes: ISO, "NIS" is read as "ILS". EUR gives ILS per EUR, ILS gives 1. Null when the ECB has no rate. Show with `<Num value={v} exact />` (computed amounts otherwise round to whole shekels).

## Text for docs/method.md (the lead adds it; F-84 is proposed, the next free id after F-83, change it if A2 uses it)
**F-84 Exchange rate (cross rate) (D26, 2026-10-25).** NIS per one unit of currency `c`: `S_c = E_ILS / E_c`, where `E_x` is the ECB's euro reference rate for `x` (units of `x` per one euro) on the same reference day; `S_EUR = E_ILS`, `S_ILS = 1`. Source: `data/series/ecb-fx.json` (ECB eurofxref-daily, terms confirmed 2026-10-25), state "computed" (inputs sourced). The rate is a reference rate for the ECB's reference day, not a rate anyone trades at; it is stale after `stale_after_days` (D3). It is the start rate of every foreign-currency run (fund variants F-65, provider workbench F-63, and the invest page); the person never types one. The future change of the rate stays A-03 (default 0). Example: 2026-10-23, `S_USD = 3.4939 / 1.1193 = 3.1215`, `S_JPY = 3.4939 / 175.51 = 0.01991` (1.99 per 100).

## Tests run
- `npx vitest run site/app/lib packages/pipeline`: 36 files, 483 tests, all pass (new: `site/app/lib/fx.test.ts`, `packages/pipeline/test/ecb-fx.test.ts`, one case in `site/app/lib/variants.test.ts`).
- `npm run validate`: data valid (existing warnings only).
- `npm run typecheck`: my files are clean; remaining errors are `"foreign"` regulator types in `institutions.server.ts` and `providers.ts` lines ~628-695 (A1's schema change meeting `ProviderRowView`, not mine; the lead or B1 widens that type).

## Open (also in requests.md)
1. `providers.server.ts` `buildWorkbenchBundle` must add `fx: loadFx() ?? undefined`; until then no foreign-currency run has a start rate in the app (the new variants test passes the fx itself).
2. `playbook.ts` (~562, ~564): pass `wb.fx` to `fundRun`.
3. Strings not mine: `copy.ts` `funds.reasons.startRate`, `funds.sheet.fxD20` ("...הזינו את השער.", still shown under the A-03 field), `providers.cannotRun.needRate`, `funds.errors.needRate`/`"need-rate"` at ~2365; `workbench-providers.tsx:208`. They should say "the ECB has no rate for this currency" or be dropped. The two new strings I wrote ("אין שער ל־X בשערי הייחוס...") are inline in `controls.tsx` and `row.tsx`; move them into copy.ts.
4. `documents.server.ts` ~263: add "ecb-fx" to the series ids so the documents page lists it.
5. Engine `fund-variants.ts` still calls the input `fxStartRates` (fine; the site fills it from the ECB).
6. The script keeps only the latest day (no history); a rate quoted by the ECB is for the previous working day, so on a Monday the file can be 3 days old (`stale_after_days` 5 covers it).
