# Requests between owners (append only)

Format: date · from → owner · file · what · why.

2026-10-25 · A3 → A1 · packages/schema/src/value.ts (`unit`) and docs/data-schema.md §2 · add the unit `fx_per_eur` ("units of the observation's currency per one euro"; the ECB reference rate). The series shape itself holds the rates already: one multi-key series, one observation per currency (`key` = ISO code, `date` = the ECB's reference date). · No existing unit fits a rate quoted per euro (`eur`/`usd`/`nis` are amounts). Until it exists the file `data/series/ecb-fx.json` fails validation on `unit`.
2026-10-25 · A3 → lead · site/app/lib/providers.server.ts line ~66 (`buildWorkbenchBundle`) · add `fx: loadFx() ?? undefined` to the bundle (import `loadFx` from `./fx.server`); `WorkbenchBundle.fx?: FxSnapshot` already exists in providers.ts. · Without it no foreign-currency run has a start rate (fund variants show "no rate", the provider workbench "need-rate"). Also: `site/app/lib/playbook.ts` lines ~562 and ~564 call `fundRun(...)`: pass `wb.fx` as the new fifth argument; `site/app/routes/workbench-providers.tsx:208` and `copy.ts` (`providers.cannotRun.needRate`, `funds.reasons.startRate`, `funds.sheet.fxD20`, `errors.needRate`) still say "הזינו את שער" and now mean "the ECB has no rate for this currency" or are unused.
2026-10-25 · A3 → lead · site/app/lib/documents.server.ts line ~263 · add "ecb-fx" to the hard-coded series ids so the documents page lists the new series (attribution is in the file). · The ECB's terms ask that it be cited.
2026-10-25 · lead · done · the three A3 → lead requests above: the bundle carries `fx`, the playbook passes `wb.fx`, the "הזינו את שער" strings now say the ECB has no rate (`funds.reasons.noRate` replaces `startRate`), the documents page lists `ecb-fx`; F-84 is in docs/method.md and in the engine (`crossRate`, formulas/time.ts), which `site/app/lib/fx.ts` calls. The foreign regulator label is wired (`foreignRegulator` on the provider row and the brokerage card). · Phase A merge.
2026-10-25 · A2 → site owner · site/app/lib/providers.ts ~line 703 (the mapping of `row.reason` to `NotComparable`) and the copy for its reasons · the engine's `NotComparableReason` has three new codes, `needs-share-price`, `needs-fx-rate`, `record-error` (each with `detail`); the mapping only knows `no-applicable-line` and `no-average` for those, so the site typecheck fails until it maps them (and `copy.ts` words them). · E1, E2, E5. Also pass `fx: { USD, GBP, ... }` (NIS per unit, `crossRate`) in `WorkbenchInput`, and `band` (string or string[]) per provider for the foreign brokers (see report-A2).

## B1 API (2026-10-25, B1 -> B2): `site/app/lib/invest.ts`
All pure, from the workbench bundle (`WorkbenchBundle`) and a `WorkbenchInputs` plan (the one the funds and brokers pages build from the goal). Values are `SiteValue` (state computed, today's shekels).
```ts
knownIndices(bundle): IndexRef[]                       // every equity_index exposure; nothing is preselected (D27)
indexById(bundle, id, customs?: CustomIndex[]): IndexRef | null
refOfCustom(c: CustomIndex): IndexRef                  // custom index: { id, name, israeli, currency?, region?, added }
cheapestWay(bundle, index: IndexRef, plan: WorkbenchInputs, assumptions?: FundAssumptions): CheapestWay | null
  // CheapestWay = { indexId, option: OptionId, providerId, providerName, fundRecordId, fundName, value: SiteValue, valueN: number }
  // best ranked way over the index's options; a way that rests on an open rule (accumulating foreign fund, G-18) is not ranked
brokerCostsByOption(bundle, index, plan): Record<OptionId, BrokerCell[]>   // per option, per broker: kind cost|unavailable|no-line|not-comparable, cost: SiteValue, venue, reason; works for a custom index
rangeOverKnownIndices(bundle, plan, assumptions?): { low: CheapestWay; high: CheapestWay; perIndex: CheapestWay[] } | null   // lowest and highest value over the known indices, each through its cheapest way
buildInvest({ bundle, index, plan, yourBroker?, assumptions? }): InvestView   // the whole page's view
```
Notes: the return comes from `plan.grossReturn`; values do not depend on the index except through fund fees. Link to `/invest/{indexId}`; the plan is carried by the saved goal.

## B1 requests (2026-10-25)
2026-10-25 · B1 -> lead (data) · data/fees/interactive-israel · `availability`: the unavailable entry names tase_shares_bonds, etf_units, tase_foreign_fund_units but not `mutual_fund_units`; the page therefore shows "אין שורה בתעריפון" (derived), not "לא זמין", for Interactive Israel in the Israeli tracking-fund column. Add mutual_fund_units (and money_market_units) if BRK-40 supports it. · spec §8 expects "לא זמין" in every TASE column.
2026-10-25 · B1 -> A2 (engine) · providers/workbench.ts `bound()` · a minimum in `eur` (Psagot's Europe line, 15 EUR) is a record-error; accept `eur`/`eur_per_trade` at `fx.EUR`. · Psagot's abroad cell shows a reason instead of a price. Psagot's US line has a null rate.
2026-10-25 · B1 -> lead (data) · Yahav, Jerusalem, One Zero fee snapshots · the "fx-to-fx" conversion lines have no band, so the engine finds two FX lines; the page drops lines whose tariff name says currency-to-currency (invest.ts `FX_TO_FX`). Better to give them a band. · same.
2026-10-25 · B1 -> lead · site/app/components/shell.tsx (nav entry, `byHref("/invest")` after holdings) and routes/workbench-funds.tsx line 148 (provider list takes foreign_broker) were edited by B1 though not on its list. `/companies/interactive-*` has no page (institutions.server.ts takes bank and broker only); the invest page does not link them, the brokers page does.

## B2 requests (2026-10-25)
2026-10-25 · B2 -> B1/lead (invest.ts) · export from invest.ts one helper that returns, for a `CheapestWay`, the engine tariff (`buildTariff` result) of its broker for the fund's class, and one `planOfGoal` shared with routes/invest.tsx. · compare-index.ts repeats two small things: the IBKR band `"המרה אוטומטית"` (`FX_BAND`) and the plan built from `feeInputs` (the same code as invest.tsx `Body`). Tests (compare-index.test.ts) fail if either drifts: the account's run must equal the way's `valueN`.
2026-10-25 · B2 -> lead (files outside the B2 list, edited because the saved-comparison re-run must apply the same index layer as the page) · site/app/lib/revisit.ts (`revisitSaved` takes an optional 4th argument, the workbench bundle) and site/app/components/revisit/use-revisit.ts (loads it with the compare bundle) · without it a comparison saved now would show a spurious "changed" for the securities account on revisit.
2026-10-25 · B2 -> lead (own-rate.ts, also not on the list) · `OwnTerms.index` added to the per-goal, per-wrapper own-terms store (same key `mekor.v2.own-rates`, old files load unchanged); `splitOwnTerms` returns `ownIndices`. The index choice is not yet in the saved state v3 merge (it travels with the own-rates side store, like the broker choice).
