// A typed account moved into a deal (method §10.4). An account built on a house or on a group leaves what it left before on every fund of every
// index, to the shekel, priced before as an account built on a house (F-101, in layers on the house's list tariff, move-fixtures.ts). An account typed
// from scratch has a fee for each field, a fee with no price where a field was left empty, and cases only for what it sold; what it leaves
// is checked against the figures the golden script printed for it (custom-entries.test.ts). A fund that differs is one of F-128's stated
// exceptions, F-128's reading of the house, which the move carries: a monthly purchase abroad on a recurring plan (at Interactive Israel
// also the cheaper of the plan's conversion and the regular price, which the move does not carry), Interactive Brokers' track. Each is proven
// by its cause: on the house's record with the cause taken out (exceptions-fixtures.ts), the account and its deal leave the same.
// A group's months counted from the day the account was typed differ nothing here: every account is typed today.
// The comparisons here run on a few indices and a slice of the accounts; move.deals.deep.test.ts runs every account on every index.
import { describe, expect, it } from "vitest";
import { buildInvest, indexById } from "../invest";
import type { CustomBroker } from "../custom-entries";
import { baseOf, startingPointsOf } from "../own-account";
import { hasCases, NAME_MAX, readDeal } from "../fee-deal/model";
import { dealProviderId, withDeals } from "./bundle";
import { dealOfTypedAccount, movedDealId, withMoved } from "./move";
import { account, bundle, compare, ctx, data, differing, fig, full, houses, on, plan, unstated } from "./move-fixtures";

/** The indices the fast comparisons run on: the Tel Aviv 125 (bought in shekels) and the MSCI World (bought abroad, and the dollar's rate). */
const FEW = ["index-ta125", "index-msci-world"];

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

describe("the move: an account selling only the side its house does not sell", () => {
  // the account had no price anywhere: the side it does not sell was closed to it, and the house sells nothing on the other
  const shapes: [string, CustomBroker][] = [
    ["psagot, abroad only", { ...on("psagot", full), sells: { israeli: false, abroad: true } }],
    ["interactive-brokers, in Israel only", { ...on("interactive-brokers", full), sells: { israeli: true, abroad: false } }],
    ["interactive-israel, in Israel only", { ...on("interactive-israel", full), sells: { israeli: true, abroad: false } }],
  ];
  const deals = shapes.map(([, a]) => dealOfTypedAccount(a, ctx));
  const b = withDeals(bundle, deals, data.kinds);
  const has = (at: unknown) => !!at && typeof at === "object" && "valueN" in at;

  it.each(shapes)("%s: its trade fee has a case for each value on the side sold, its price not given, and the deal reads back as written", (_n, a) => {
    const d = dealOfTypedAccount(a, ctx);
    const trade = d.fees.find((f) => f.kind === "trade")!;
    expect(hasCases(trade) && trade.cases.length).toBeGreaterThan(0);
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
  });

  it.each(FEW)("on %s, the deal has no price on any fund, as the account had none", (ix) => {
    const view = buildInvest({ bundle: b, index: indexById(b, ix)!, plan });
    const funds = view.options.flatMap((o) => o.funds);
    for (const [, a] of shapes) expect(funds.filter((f) => has(f.byHouse[dealProviderId(movedDealId(a.id))]))).toEqual([]);
  });
});

it("the move cuts a name longer than a deal's to a deal's, as the editor's name field does", () => {
  const long = "n".repeat(NAME_MAX + 5);
  for (const a of [account(full, { name: long }), on("leumi", {})].map((x) => ({ ...x, name: long }))) {
    const d = dealOfTypedAccount(a, ctx);
    expect(d.name).toBe(long.slice(0, NAME_MAX));
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
  }
});

describe("the move: an account built on a house leaves what it left, on a few indices", () => {
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "every field typed", on(id, { tradePct: 0.05, tradeMin: 3, custodyPct: 0.08, custodyMin: 1, fxPct: 0.2, monthlyFee: 5 })],
  ]);
  const got = compare(shapes.map((s) => s[2]), false, plan, 0, FEW);
  const onTerms = compare(shapes.map((s) => s[2]), true, plan, 0, FEW);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms; as it is, no more anywhere", (_id, _, a) => {
    expect(differing(onTerms.get(a.id)!)).toEqual([]);
    expect(differing(got.get(a.id)!).filter(unstated)).toEqual([]);
  });

  it.each(["excellence", "meitav-trade", "ibi", "interactive-israel"])("%s: a minimum typed over one printed in the trade's currency stands in shekels", (id) => {
    const trade = dealOfTypedAccount(on(id, { tradeMin: 3 }), ctx).fees.find((f) => f.kind === "trade")!;
    const prices = (hasCases(trade) ? trade.cases : [trade]).flatMap((c) => [...c.stages, ...(c.sale ?? [])].map((s) => s.price));
    const typedMin = prices.filter((p) => "min" in p && p.min?.v === 3);
    expect(typedMin.length).toBeGreaterThan(0);
    expect(typedMin.every((p) => !("inTrade" in p && p.inTrade) && !("currency" in p && p.currency))).toBe(true);
  });
});

describe("the move: a typed conversion keeps the list's steps by size (F-13)", () => {
  const onFx = (id: string) => on(id, { fxPct: 0.2 });
  /** The prices of each case of the deal's conversion fee, by the step of the action's size it is (the open top last). */
  const steps = (id: string) => {
    const fx = dealOfTypedAccount(onFx(id), ctx).fees.find((f) => f.kind === "fx")!;
    if (!hasCases(fx)) throw new Error("the conversion changes by its size");
    const t = fx.by.findIndex((b) => b.kind === "actionSize");
    return fx.cases.map((c) => ({ step: c.when[t], price: c.stages[0]!.price }));
  };

  it.each(["mizrahi-tefahot", "discount"])("%s: the free step stays free, and the typed rate prices the line above the steps", (id) => {
    const s = steps(id);
    expect(s.find((x) => x.step === 0)?.price.form).toBe("free");
    const top = s.find((x) => x.step === Math.max(...s.map((y) => (typeof y.step === "number" ? y.step : -1))))!.price;
    expect(top).toMatchObject({ form: "action", rate: { v: 0.2 } });
  });

  it("a small conversion leaves what the account built on the house left", () => {
    const small = { ...plan, amountNow: 0, monthly: 30, years: 3, values: { ...plan.values, amount: fig(0, "nis"), monthly: fig(30, "nis_per_month"), years: fig(3, "years") } };
    const a = onFx("mizrahi-tefahot");
    expect(differing(compare([a], true, small).get(a.id)!)).toEqual([]);
  });
});

describe("the move with the dollar moving: A-03 = +3% a year over 20 years, on a few indices", () => {
  const at = (amount: number) => ({ ...plan, amountNow: amount, years: 20, values: { ...plan.values, amount: fig(amount, "nis"), years: fig(20, "years") } });
  const shapes = houses.map((id): [string, string, CustomBroker] => [id, "the trade's minimum alone", on(id, { tradeMin: 3 })]);
  const got = compare(shapes.map((s) => s[2]), true, at(10_000), 3, FEW);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms", (_id, _, a) => {
    expect(differing(got.get(a.id)!)).toEqual([]);
  });

  // the third stated difference: beside a typed minimum, a maximum in dollars stands at F-84's rate, so where it binds (a large first sum)
  // and the dollar rises, the deal pays less than the account priced it at each month's rate; with the dollar still, the two agree
  const banks = ["hapoalim", "yahav", "massad"].map((id): [string, CustomBroker] => [id, on(id, { tradeMin: 3 })]);
  const big = compare(banks.map((b) => b[1]), true, at(1_000_000), 3, FEW);
  const still = compare(banks.map((b) => b[1]), true, at(1_000_000), 0, FEW);
  it.each(banks)("%s: a typed minimum over a maximum in dollars leaves no less with the dollar rising, and the same with it still", (_id, a) => {
    const rows = differing(big.get(a.id)!).filter((r) => r.abroad);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter((r) => r.before === null || r.after === null || r.after < r.before)).toEqual([]);
    expect(differing(still.get(a.id)!).filter((r) => r.abroad)).toEqual([]);
  });
});

describe("the move at 1,000,000 now over 20 years, where every custody maximum binds (F-14), on a few indices", () => {
  const big = { ...plan, amountNow: 1_000_000, years: 20, values: { ...plan.values, amount: fig(1_000_000, "nis"), years: fig(20, "years") } };
  const shapes = houses.map((id): [string, string, CustomBroker] => [id, "the custody's percent alone, 2% a year", on(id, { custodyPct: 2 })]);
  const got = compare(shapes.map((s) => s[2]), true, big, 0, FEW);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms", (_id, _, a) => {
    expect(differing(got.get(a.id)!)).toEqual([]);
  });
});

describe("the move: an account built on a group, typed today, leaves what it left, on a few indices", () => {
  const shapes = bundle.snapshots.flatMap((s) =>
    data.houses.some((h) => h.id === s.id) ? startingPointsOf(s).flatMap((p): [string, string, CustomBroker][] => (p.group ? [[s.id, p.nameHe, account({}, { base: baseOf(s, p) })]] : [])) : [],
  );
  const got = compare(shapes.map((s) => s[2]), false, plan, 0, FEW);
  const onTerms = compare(shapes.map((s) => s[2]), true, plan, 0, FEW);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms; as it is, no more anywhere", (_id, _, a) => {
    expect(differing(onTerms.get(a.id)!)).toEqual([]);
    expect(differing(got.get(a.id)!).filter(unstated)).toEqual([]);
  });
});
