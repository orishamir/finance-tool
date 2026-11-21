// A typed account moved into a deal (method §10.4). An account built on a house or on a group leaves what it left before on every fund of every
// index, to the shekel, priced before as the page still prices an account built on a house (F-101, lib/group-pick.ts). An account typed
// from scratch has a fee for each field, a fee with no price where a field was left empty, and cases only for what it sold; what it leaves
// is checked against the figures the golden script printed for it (custom-entries.test.ts). A fund that differs is one of two named
// differences, both F-128's reading of the house, which the move carries: F-128's exceptions (a monthly purchase abroad on a recurring plan,
// at Interactive Israel also the standing order whose cheaper price the move does not carry, and Interactive Brokers' track: the deal leaves
// no more), and a conversion priced by its size, which the house's row prices at one step (F-13) where the deal reads every step (F-115),
// not one of F-128's stated exceptions. A group's months counted from the day the account was typed differ nothing here: every account is typed today.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { fxRunInput } from "../fx";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import { buildInvest, indexById } from "../invest";
import type { WorkbenchInputs } from "../providers";
import type { CustomBroker } from "../custom-entries";
import { withGroupAccount } from "../group-pick";
import type { BundleSnapshot } from "../providers";
import { baseOf, startingPointsOf } from "../own-account";
import { hasCases, readDeal } from "../fee-deal/model";
import { isConversion } from "../fee-deal/shapes";
import { dealProviderId, withDeals } from "./bundle";
import { dealOfTypedAccount, movedDealId, withMoved, type MoveContext } from "./move";

const data = feesData();
const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 10_000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  returnFromParameter: false, currentAccounts: { own: null },
};
const ctx: MoveContext = { houses: data.houses, kinds: data.kinds, snapshots: bundle.snapshots, fx: bundle.fx ? fxRunInput(bundle.fx) : {}, today: t };

const fig = (v: number, unit: Parameters<typeof entered>[1]) => entered(v, unit, t);
const full = { tradePct: 0.1, tradeMin: 5, custodyPct: 0.1, custodyMin: 2, fxPct: 0.3, monthlyFee: 10 };
type Typed = Partial<Record<keyof typeof full, number | null>>;
let n = 0;
function account(typed: Typed, more: Partial<CustomBroker> = {}): CustomBroker {
  const v = (k: keyof typeof full) => (typed[k] === undefined || typed[k] === null ? null : typed[k]!);
  const at = (k: keyof typeof full, unit: Parameters<typeof entered>[1]) => (v(k) === null ? null : fig(v(k)!, unit));
  return {
    id: `custom-broker-test-${n++}`,
    name: `חשבון ${n}`,
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

/**
 * What each account leaves on each fund of each index, before the move (the typed account) and after it (its deal), rounded to the shekel:
 * after tax, or before it on a fund an open rule leaves untaxed (F-118); null where it has no price.
 */
function compare(accounts: CustomBroker[]): Map<string, { ix: string; fund: string; abroad: boolean; before: number | null; after: number | null }[]> {
  const deals = accounts.map((a) => dealOfTypedAccount(a, ctx));
  const before = accounts.reduce((b, a) => withGroupAccount(b, bundle.snapshots.find((s) => s.id === a.base!.houseId) as BundleSnapshot, a), bundle);
  const both = withDeals(before, deals, data.kinds);
  const out = new Map(accounts.map((a) => [a.id, [] as { ix: string; fund: string; abroad: boolean; before: number | null; after: number | null }[]]));
  for (const e of bundle.exposures) {
    const index = indexById(both, e.id);
    if (!index) continue;
    const funds = buildInvest({ bundle: both, index, plan }).options.flatMap((o) => o.funds);
    const left = (f: (typeof funds)[number], id: string): number | null => {
      const at = f.byHouse[id];
      const n = at && "valueN" in at ? at.valueN : f.beforeTax?.byHouse[id]?.leftN;
      return n === undefined ? null : Math.round(n);
    };
    for (const a of accounts) for (const f of funds) out.get(a.id)!.push({ ix: e.id, fund: f.rec.id, abroad: f.option === "abroad", before: left(f, a.id), after: left(f, dealProviderId(movedDealId(a.id))) });
  }
  return out;
}

const differing = <R extends { before: number | null; after: number | null }>(rows: R[]): R[] => rows.filter((r) => r.before !== r.after);

describe("the move", () => {
  it("makes one deal per account, with an id from the account's, that reads back as a deal; a second move adds nothing", () => {
    const a = account(full);
    const d = dealOfTypedAccount(a, ctx);
    expect(d.id).toBe(movedDealId(a.id));
    expect(readDeal(JSON.parse(JSON.stringify(d)))).not.toBeNull();
    const once = withMoved([], [d]);
    expect(withMoved(once, [dealOfTypedAccount(a, ctx)])).toEqual(once);
  });
});

describe("the move: an account typed from scratch", () => {
  const priceOf = (d: ReturnType<typeof dealOfTypedAccount>, kind: string) => {
    const f = d.fees.find((x) => x.kind === kind)!;
    return hasCases(f) ? f.cases.map((c) => c.stages[0]!.price) : [f.stages[0]!.price];
  };

  it("has a fee for each field, as typed: the trade a share of each action with its minimum, custody a percent a year charged each month, the conversion, the monthly fee", () => {
    const d = dealOfTypedAccount(account(full), ctx);
    expect(d.fees.map((f) => f.kind)).toEqual(["trade", "custody", "fx", "fixed_period"]);
    expect(priceOf(d, "trade")).toEqual([{ form: "action", rate: { v: 0.1 }, min: { v: 5 } }]);
    expect(priceOf(d, "custody")).toEqual([{ form: "held", rate: { v: 0.1 }, per: 12, every: 1, min: { v: 2 } }]);
    expect(priceOf(d, "fx")).toEqual([{ form: "action", rate: { v: 0.3 } }]);
    expect(priceOf(d, "fixed_period")).toEqual([{ form: "sum", amount: { v: 10 }, every: 1 }]);
  });

  const empty = (Object.keys(full) as (keyof typeof full)[]).map((k): [string, CustomBroker] => [k, account({ ...full, [k]: null })]);
  const sold: [string, CustomBroker][] = [
    ["in Israel", account(full, { sells: { israeli: true, abroad: false } })],
    ["abroad", account(full, { sells: { israeli: false, abroad: true } })],
  ];
  const all = [account(full), ...empty.map((x) => x[1]), ...sold.map((x) => x[1])];
  const b = withDeals(bundle, all.map((a) => dealOfTypedAccount(a, ctx)), data.kinds);
  const view = buildInvest({ bundle: b, index: indexById(b, "index-sp500")!, plan });
  const funds = view.options.flatMap((o) => o.funds);
  // the funds some collected house prices: a fund with no price anywhere (no record of its tracking, an open rule) has none here either
  const has = (at: unknown) => !!at && typeof at === "object" && "valueN" in at;
  const pricedSomewhere = funds.filter((f) => Object.entries(f.byHouse).some(([id, at]) => !id.startsWith("deal:") && has(at)));
  const priced = (a: CustomBroker, abroad: boolean) => pricedSomewhere.filter((f) => (f.option === "abroad") === abroad).map((f) => has(f.byHouse[dealProviderId(movedDealId(a.id))]));

  it("with every field typed, has a price on every fund the index has", () => {
    expect([...priced(all[0]!, false), ...priced(all[0]!, true)].every(Boolean)).toBe(true);
  });

  it.each(empty)("with %s left empty, has a fee with no price yet, and so no price on the funds that fee is charged on (D56)", (k, a) => {
    const d = dealOfTypedAccount(a, ctx);
    const kind = { tradePct: "trade", tradeMin: "trade", custodyPct: "custody", custodyMin: "custody", fxPct: "fx", monthlyFee: "fixed_period" }[k]!;
    expect(priceOf(d, kind).some((p) => Object.values(p).some((x) => typeof x === "object" && x !== null && "blank" in x))).toBe(true);
    // only a fund bought abroad converts: the conversion left empty leaves the others priced
    expect(priced(a, true).some(Boolean)).toBe(false);
    expect(priced(a, false).every(Boolean)).toBe(k === "fxPct");
  });

  it.each(sold)("selling only %s, prices the trade only for what is bought there, and has no price on the funds it does not sell", (where, a) => {
    const d = dealOfTypedAccount(a, ctx);
    const trade = d.fees.find((f) => f.kind === "trade")!;
    expect(hasCases(trade) && trade.by[0]!.kind).toBe("what");
    const abroad = where === "abroad";
    expect(priced(a, abroad).every(Boolean)).toBe(true);
    expect(priced(a, !abroad).some(Boolean)).toBe(false);
  });
});

/**
 * F-128's exceptions: a house whose row buys each month's purchase of a fund bought abroad on its recurring plan (Interactive Israel,
 * Interactive Brokers), and one whose row reads more than one track (Interactive Brokers' Fixed and Tiered): its deal leaves no more there.
 */
const RECURRING_ABROAD = new Set(["interactive-israel", "interactive-brokers"]);

/**
 * A house whose list prices a conversion by its size (`size_tiers`: Discount's and Mercantile's free and half-price small conversions, IBI's
 * smaller spread above 15,000 dollars): its row prices every conversion at one step (F-13), and the deal filled from its list reads each step
 * (F-115). F-128's reading of the house, not one of its stated exceptions; the moved account carries it on a fund bought abroad.
 */
const bySize = (id: string) => (data.houses.find((h) => h.id === id)?.fees ?? []).some((f) => isConversion(f.kind) && "by" in f && !!f.by?.some((b) => b.kind === "actionSize"));

type Row = { ix: string; fund: string; abroad: boolean; before: number | null; after: number | null };
/** The named difference a differing row of an account built on house `id` is, or null where it is none. */
function why(id: string, r: Row): "recurring-abroad" | "by-size" | null {
  const both = r.before !== null && r.after !== null;
  if (RECURRING_ABROAD.has(id) && r.abroad && both && r.after! <= r.before!) return "recurring-abroad";
  if (bySize(id) && r.abroad && both) return "by-size";
  return null;
}

/** The rows of an account at a house that differ beyond the named differences. */
const onHouse = (id: string, rows: Row[]) => differing(rows).filter((r) => why(id, r) === null);

describe("the move: an account built on a house leaves what it left", () => {
  const houses = data.houses.map((h) => h.id).filter((id) => bundle.snapshots.some((s) => s.id === id));
  const on = (id: string, typed: Typed) => {
    const s = bundle.snapshots.find((x) => x.id === id)!;
    return account(typed, { base: baseOf(s, { group: null }) });
  };
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "every field typed", on(id, { tradePct: 0.05, tradeMin: 3, custodyPct: 0.08, custodyMin: 1, fxPct: 0.2, monthlyFee: 5 })],
    [id, "the trade's percent alone", on(id, { tradePct: 0.07 })],
    [id, "the custody's minimum alone", on(id, { custodyMin: 4 })],
    [id, "the custody's percent alone", on(id, { custodyPct: 0.08 })],
    [id, "the conversion alone", on(id, { fxPct: 0.2 })],
    [id, "the monthly fee alone", on(id, { monthlyFee: 5 })],
    [id, "the trade's minimum alone", on(id, { tradeMin: 3 })],
  ]);
  const got = compare(shapes.map((s) => s[2]));
  it.each(shapes)("%s, %s: the same on every fund", (id, _, a) => {
    expect(onHouse(id, got.get(a.id)!)).toEqual([]);
  });

  it.each(["excellence", "meitav-trade", "ibi"])("%s: a minimum typed over one printed in the trade's currency stands in shekels", (id) => {
    const trade = dealOfTypedAccount(on(id, { tradeMin: 3 }), ctx).fees.find((f) => f.kind === "trade")!;
    const prices = (hasCases(trade) ? trade.cases : [trade]).flatMap((c) => [...c.stages, ...(c.sale ?? [])].map((s) => s.price));
    const typedMin = prices.filter((p) => "min" in p && p.min?.v === 3);
    expect(typedMin.length).toBeGreaterThan(0);
    expect(typedMin.every((p) => !("inTrade" in p && p.inTrade) && !("currency" in p && p.currency))).toBe(true);
  });
});

describe("the move: an account built on a house with nothing typed", () => {
  const houses = data.houses.map((h) => h.id).filter((id) => bundle.snapshots.some((s) => s.id === id));
  const bare = houses.map((id) => account({}, { base: baseOf(bundle.snapshots.find((x) => x.id === id)!, { group: null }) }));
  const got = compare(bare);
  const rows = houses.flatMap((id, i) => differing(got.get(bare[i]!.id)!).map((r) => ({ id, r })));

  it("differs only on funds bought abroad, each by a named difference", () => {
    expect(rows.every(({ r }) => r.abroad)).toBe(true);
    expect(rows.filter(({ id, r }) => why(id, r) === null)).toEqual([]);
  });

  it("is priced on every fund exactly where it was before", () => {
    expect(rows.filter(({ r }) => (r.before === null) !== (r.after === null))).toEqual([]);
  });
});

describe("the move: an account built on a group, typed today, leaves what it left", () => {
  const shapes = bundle.snapshots.flatMap((s) =>
    data.houses.some((h) => h.id === s.id)
      ? startingPointsOf(s).flatMap((p): [string, string, CustomBroker][] =>
          p.group
            ? [
                [s.id, p.nameHe, account({}, { base: baseOf(s, p) })],
                [s.id, `${p.nameHe}, every price used`, account({}, { base: { ...baseOf(s, p), group: { ...p.group, adopted: p.group.prices.map((x) => x.fee) } } })],
                [s.id, `${p.nameHe}, for two years, the trade typed`, account({ tradePct: 0.06 }, { base: baseOf(s, p), untilYears: 2 })],
              ]
            : [],
        )
      : [],
  );
  const got = compare(shapes.map((s) => s[2]));
  it.each(shapes)("%s, %s: the same on every fund", (id, _, a) => {
    expect(onHouse(id, got.get(a.id)!)).toEqual([]);
  });
});
