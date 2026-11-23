// For the move tests (move.test.ts on a few indices, move.deals.deep.test.ts on every index): typed accounts, and what each leaves on each
// fund before the move and after it.
import { feesData } from "../fees.server";
import { fxRunInput } from "../fx";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { buildInvest, indexById } from "../invest";
import type { BundleSnapshot, IndicesBundle, WorkbenchInputs } from "../providers";
import type { CustomBroker } from "../custom-entries";
import { baseOf, groupInputs, layeredOf } from "../own-account";
import { dealProviderId, withDeals } from "./bundle";
import { dealOfTypedAccount, movedDealId, type MoveContext } from "./move";
import { readDeal, type FeeDeal } from "../fee-deal/model";
import { onDealsTerms } from "./exceptions-fixtures";

/**
 * The bundle with a typed account in it, as it was priced before the move: the house's own record under the account's name, so its lines,
 * what it sells and its kind are the house's, priced in layers on the house's own list tariff (F-101, `layeredOf`) where the house is.
 */
function withTypedAccount(bundle: IndicesBundle, house: BundleSnapshot, b: CustomBroker): IndicesBundle {
  const { provider, tariff, snapshot, missing, missing_reason, missing_reason_he, lines, averages, minimums, notice_rule_ids } = house;
  const own: BundleSnapshot = { id: b.id, provider: { ...provider, name_he: b.name, part_of: undefined }, tariff, snapshot, missing, missing_reason, ...(missing_reason_he ? { missing_reason_he } : {}), lines, averages, minimums, notice_rule_ids, availability: house.availability ?? [], ...(house.fundByFund ? { fundByFund: house.fundByFund } : {}) };
  const held = bundle.entered;
  return {
    ...bundle,
    snapshots: [...bundle.snapshots, own],
    entered: {
      layered: { ...held?.layered, [b.id]: layeredOf(b) },
      bases: { ...held?.bases, [b.id]: house.id },
      inputs: { ...held?.inputs, [b.id]: groupInputs(b) },
      exposures: held?.exposures ?? {},
      shekelFunds: held?.shekelFunds ?? [],
    },
  };
}

export const data = feesData();
export const bundle = buildIndicesBundle();
export const t = bundle.today;
export const plan: WorkbenchInputs = {
  amountNow: 10_000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  currentAccounts: true,
};
export const ctx: MoveContext = { houses: data.houses, kinds: data.kinds, snapshots: bundle.snapshots, fx: bundle.fx ? fxRunInput(bundle.fx) : {}, today: t };

export const fig = (v: number, unit: Parameters<typeof entered>[1]) => entered(v, unit, t);
/** A value for every field of a typed account. */
export const full = { tradePct: 0.1, tradeMin: 5, custodyPct: 0.1, custodyMin: 2, fxPct: 0.3, monthlyFee: 10 };
export type Typed = Partial<Record<keyof typeof full, number | null>>;
let n = 0;
/** A typed account with the fields of `typed`, the others left empty, selling in Israel and abroad unless `more` says otherwise. */
export function account(typed: Typed, more: Partial<CustomBroker> = {}): CustomBroker {
  const v = (k: keyof typeof full) => (typed[k] === undefined || typed[k] === null ? null : typed[k]!);
  const at = (k: keyof typeof full, unit: Parameters<typeof entered>[1]) => (v(k) === null ? null : fig(v(k)!, unit));
  return {
    id: `custom-broker-test-${n++}`,
    name: `account ${n}`,
    added: t,
    tradePct: at("tradePct", "pct_of_trade"),
    tradeMin: at("tradeMin", "nis_per_trade"),
    custodyPct: at("custodyPct", "pct_per_year"),
    custodyMin: at("custodyMin", "nis_per_month"),
    fxPct: at("fxPct", "pct_of_trade"),
    monthlyFee: at("monthlyFee", "nis_per_month"),
    sells: { israeli: true, abroad: true },
    ...more,
  };
}

/** The houses with a price list in the bundle. */
export const houses = data.houses.map((h) => h.id).filter((id) => bundle.snapshots.some((s) => s.id === id));
/** An account built on house `id`, no group, with the fields of `typed`. */
export const on = (id: string, typed: Typed) => account(typed, { base: baseOf(bundle.snapshots.find((x) => x.id === id)!, { group: null }) });

/** An account's deal as the move makes it, and as the device reads it back once stored (`readDeal` over its stored form). */
export function readBack(a: CustomBroker): { wrote: FeeDeal; read: FeeDeal | null } {
  const wrote = dealOfTypedAccount(a, ctx);
  return { wrote, read: readDeal(JSON.parse(JSON.stringify(wrote))) };
}

export type Row = { ix: string; fund: string; abroad: boolean; before: number | null; after: number | null };

/**
 * What each account leaves on each fund of each index, before the move (the typed account) and after it (its deal), rounded to the shekel:
 * after tax, or before it on a fund an open rule leaves untaxed (F-118); null where it has no price. `terms`: on the houses' records read on
 * their deals' terms, F-128's stated exceptions taken out (exceptions-fixtures.ts); `p` and `fxChange`: the plan and A-03; `indices`: the
 * indices compared on, every index the bundle prices when absent.
 */
export function compare(accounts: CustomBroker[], terms = false, p: WorkbenchInputs = plan, fxChange = 0, indices?: readonly string[]): Map<string, Row[]> {
  const deals = accounts.map((a) => dealOfTypedAccount(a, ctx));
  const base = terms ? onDealsTerms(bundle, accounts.map((a, i) => ({ house: a.base!.houseId, deal: deals[i]! })), data.kinds).bundle : bundle;
  const before = accounts.reduce((b, a) => withTypedAccount(b, base.snapshots.find((s) => s.id === a.base!.houseId) as BundleSnapshot, a), base);
  const both = withDeals(before, deals, data.kinds);
  const out = new Map(accounts.map((a) => [a.id, [] as Row[]]));
  for (const e of bundle.exposures) {
    if (indices && !indices.includes(e.id)) continue;
    const index = indexById(both, e.id);
    if (!index) continue;
    const funds = buildInvest({ bundle: both, index, plan: p, assumptions: { fxChange } }).options.flatMap((o) => o.funds);
    const left = (f: (typeof funds)[number], id: string): number | null => {
      const at = f.byHouse[id];
      const n = at && "valueN" in at ? at.valueN : f.beforeTax?.byHouse[id]?.leftN;
      return n === undefined ? null : Math.round(n);
    };
    for (const a of accounts) for (const f of funds) out.get(a.id)!.push({ ix: e.id, fund: f.rec.id, abroad: f.option === "abroad", before: left(f, a.id), after: left(f, dealProviderId(movedDealId(a.id))) });
  }
  return out;
}

export const differing = <R extends { before: number | null; after: number | null }>(rows: R[]): R[] => rows.filter((r) => r.before !== r.after);

/** A differing row F-128's stated exceptions cannot be: one only one of the two prices, or where the deal leaves more. */
export const unstated = (r: Row) => r.before === null || r.after === null || r.after > r.before;
