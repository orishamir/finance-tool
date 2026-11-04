// F-101 (2026-11-04): a price for a time. The first tariff applies to months 1 to u, the second after them: a trade in month m pays the price of
// month m, custody and the fixed fee charged in month m that month's price, the sale at T the price at T, a minimum the tariff in force's own.
// Expected figures: tests/golden/expected_tariff_period.py, from the fee formulas alone, with no return, fund cost, inflation or tax.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feeLines, providerWorkbench, runSecurities, withFeeRate, withoutFeeLine, type ComparedProvider, type EnteredTariff, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
import { context } from "./golden/harness.ts";

const ctx = context();

const FIRST: SecuritiesInput["tariff"] = {
  buy: { rate: 0.001, min: 5 },
  buyStanding: { rate: 0.0005, min: 2 },
  sell: { rate: 0.001, min: 5 },
  custody: { rate: 0.00075, everyMonths: 3, min: 3 },
};
const THEN: SecuritiesInput["tariff"] = {
  buy: { rate: 0.004, min: 26 },
  sell: { rate: 0.004, min: 26 },
  custody: { rate: 0.0015, everyMonths: 3, min: 30, max: 3700 },
  monthlyFee: 10,
};
const run = (tariff: SecuritiesInput["tariff"], goal: Partial<SecuritiesInput["goal"]> = {}) =>
  runSecurities(
    { goal: { amountNow: 10_000, monthly: 500, months: 24, ...goal }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund", drag: {} }, tariff, profile: {} },
    ctx,
  );
const FIRST_M: SecuritiesInput["tariff"] = { ...FIRST, custody: { rate: 0.00025, everyMonths: 1, min: 1 } };
const THEN_M: SecuritiesInput["tariff"] = { ...THEN, custody: { rate: 0.0005, everyMonths: 1, min: 10, max: 1200 } };
const OFFER: SecuritiesInput["tariff"] = { buy: { rate: 0 }, sell: { rate: 0 }, custody: { rate: 0, everyMonths: 3 } };
const STUDENT3: SecuritiesInput["tariff"] = { buy: { rate: 0.002, min: 7 }, buyStanding: { rate: 0.001, min: 4 }, sell: { rate: 0.002, min: 7 }, custody: { rate: 0.00075, everyMonths: 3 } };
const LIST3: SecuritiesInput["tariff"] = { buy: { rate: 0.004, min: 26 }, buyStanding: { rate: 0.0015, min: 5 }, sell: { rate: 0.004, min: 26 }, custody: { rate: 0.0015, everyMonths: 3, max: 3700 }, monthlyFee: 8 };
/** The offer to month `a`, the student price to month `b`, then the list. */
const sequence = (a: number, b: number): SecuritiesInput["tariff"] => ({ ...OFFER, until: { months: a, then: { ...STUDENT3, until: { months: b, then: LIST3 } } } });
const until = (months: number, a = FIRST, b = THEN): SecuritiesInput["tariff"] => ({ ...a, until: { months, then: b } });

/** Printed by tests/golden/expected_tariff_period.py. */
const EXPECTED = {
  plan_u12: { trade: 431.4727361634534, custody: 163.3284466490463, fixed: 120, left: 21285.198817187502 },
  plan_u0: { trade: 747.2598979442231, custody: 241.3442390438247, fixed: 240, left: 20771.39586301195 },
  plan_u102: { trade: 79.83196953908815, custody: 100.05044093147859, fixed: 0, left: 21820.117589529433 },
  plan_u24: { trade: 79.83196953908815, custody: 100.05044093147859, fixed: 0, left: 21820.117589529433 },
  monthly_custody_u24: { trade: 79.83497342140254, custody: 97.04655861709318, fixed: 0, left: 21823.118467961507 },
  monthly_custody_u23: { trade: 169.21206128954333, custody: 102.49716512656877, fixed: 10, left: 21718.290773583893 },
  small_u6: { trade: 31, custody: 66, fixed: 60, left: 843 },
  student_u6: { trade: 0, custody: 449.2692561234375, fixed: 0, left: 99550.73074387656 },
  student_list_alone: { trade: 0, custody: 598.65134949375, fixed: 0, left: 99401.34865050626 },
  sequence_6_24: { trade: 242.14996087391097, custody: 234.50978152225454, fixed: 96, left: 27427.340257603835 },
  sequence_6_6: { trade: 259.18480031214995, custody: 313.7999219625051, fixed: 240, left: 27187.015277725346 },
  sequence_0_24: { trade: 285.8635572128381, custody: 252.17057702988922, fixed: 96, left: 27365.965865757273 },
  standing_later: { trade: 462.3372749003984, custody: 0, fixed: 0, left: 21537.6627250996 },
  lower_small_orders: { trade: 9, custody: 0, fixed: 0, left: 2991 },
  lower_large_orders: { trade: 59.94005994005889, custody: 0, fixed: 0, left: 29940.05994005994 },
  replacing_large_orders: { trade: 89.82035928143586, custody: 0, fixed: 0, left: 29910.179640718565 },
};
const expectRun = (r: ReturnType<typeof run>, e: { trade: number; custody: number; fixed: number; left: number }) => {
  expect(r.fees.trade).toBeCloseTo(e.trade, 6);
  expect(r.fees.custody).toBeCloseTo(e.custody, 6);
  expect(r.fees.fixed).toBeCloseTo(e.fixed, 6);
  expect(r.nominal).toBeCloseTo(e.left, 6);
};

describe("a price for a time in the securities ledger (F-101)", () => {
  it("a period ending at a custody charge: months 1 to 12 at the first price, the rest at the second", () => {
    expectRun(run(until(12)), EXPECTED.plan_u12);
  });
  it("a period of 0 puts every month on the second tariff, the first purchase and the sale too", () => {
    expectRun(run(until(0)), EXPECTED.plan_u0);
  });
  it("a period past the horizon is the first tariff all along", () => {
    expectRun(run(until(102)), EXPECTED.plan_u102);
  });
  it("the sale at the horizon pays the price of that month: a period of T keeps the first, T - 1 does not (a charge every month)", () => {
    expectRun(run(until(24)), EXPECTED.plan_u24);
    expectRun(run(until(24, FIRST_M, THEN_M)), EXPECTED.monthly_custody_u24);
    expectRun(run(until(23, FIRST_M, THEN_M)), EXPECTED.monthly_custody_u23);
  });
  it("refuses a period that ends between two custody charges, rather than prorate it (docs/method.md section 12)", () => {
    for (const months of [14, 23, 100, 7]) expect(() => run(until(months))).toThrow(/between two custody charges/);
    // a charge every month, or a tariff without custody, ends anywhere
    expect(() => run(until(14, FIRST_M, THEN_M))).not.toThrow();
    expect(() => run({ buy: { rate: 0.001 }, until: { months: 14, then: { buy: { rate: 0.002 } } } })).not.toThrow();
    // either side's charging period counts, and a later link of a sequence is checked against its neighbours
    expect(() => run({ ...FIRST_M, until: { months: 14, then: THEN } })).toThrow(/between two custody charges/);
    expect(() => run({ ...FIRST, until: { months: 12, then: { ...THEN, until: { months: 14, then: THEN } } } })).toThrow(/between two custody charges/);
    expect(() => run(until(-3))).toThrow(/whole number of months/);
    // the charging phase is the grid offset's: a leg that starts one month in has its charges at months 2, 5, 8, ...
    expect(() => runSecurities({ goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund", drag: {} }, tariff: until(5), profile: {}, gridOffset: 1 }, ctx)).not.toThrow();
  });
  it("a sequence of three tariffs: every month on its own, an empty period skipped, the second as the first", () => {
    expectRun(run(sequence(6, 24), { months: 36 }), EXPECTED.sequence_6_24);
    expectRun(run(sequence(6, 6), { months: 36 }), EXPECTED.sequence_6_6);
    expectRun(run(sequence(0, 24), { months: 36 }), EXPECTED.sequence_0_24);
    expect(run(sequence(6, 24), { months: 36 }).formulas).toContain("F-101");
  });
  it("a standing-order price that only the later tariff has is paid from the month that tariff begins", () => {
    const first = { buy: { rate: 0.004, min: 26 }, sell: { rate: 0.004, min: 26 } };
    const later = { buy: { rate: 0.004, min: 26 }, buyStanding: { rate: 0.0005, min: 2 }, sell: { rate: 0.004, min: 26 } };
    expectRun(run({ ...first, until: { months: 12, then: later } }, { amountNow: 10_000, monthly: 500, months: 24 }), { ...EXPECTED.standing_later });
  });
  it("where a regular price sits over a standing-order price, a monthly purchase pays the lower of the two, order by order", () => {
    const goal = (monthly: number) => ({ amountNow: 0, monthly, months: 6 });
    const lower = { buy: { rate: 0.001, min: 3 }, buyStanding: { rate: 0.002, min: 1 }, sell: { rate: 0.001, min: 3 }, cheaperOfStanding: true };
    const { cheaperOfStanding: _, ...replacing } = lower;
    // 500 a month: the standing price (1.00) is the lower; 5,000 a month: the regular one (5.00 against 10.00)
    expectRun(run(lower, goal(500)), EXPECTED.lower_small_orders);
    expectRun(run(lower, goal(5000)), EXPECTED.lower_large_orders);
    // without the flag the standing-order price replaces the regular one, as it always did
    expectRun(run(replacing, goal(5000)), EXPECTED.replacing_large_orders);
    // the flag with no standing-order line changes nothing
    const noStanding = { buy: lower.buy, sell: lower.sell };
    expect(run({ ...noStanding, cheaperOfStanding: true }, goal(500)).nominal).toBe(run(noStanding, goal(500)).nominal);
  });
  it("the conversion of a monthly purchase is the lower of the plan's price and the regular one too", () => {
    // three deposits of 500 at no return; conversion 1% regular and 2% on a plan: with the flag 5 a deposit, without it 10; the exit converts back at 1%
    const base = { fx: 0.01, fxStanding: 0.02, currency: { code: "USD", startRate: 1 } };
    const goal = { amountNow: 0, monthly: 500, months: 3 };
    const fees = (tariff: SecuritiesInput["tariff"]) => run(tariff, goal).fees.fx;
    expect(fees({ ...base, cheaperOfStanding: true })).toBeCloseTo(15 + 0.01 * 1485, 6);
    expect(fees(base)).toBeCloseTo(30 + 0.01 * 1470, 6);
  });
  it("the worked example of the method: 100,000 held a year, the student price for six months, then the list price", () => {
    const student = { custody: { rate: 0.00075, everyMonths: 3 } };
    const list = { custody: { rate: 0.0015, everyMonths: 3, max: 3700 } };
    expectRun(run({ ...student, until: { months: 6, then: list } }, { amountNow: 100_000, monthly: 0, months: 12 }), EXPECTED.student_u6);
    expectRun(run(list, { amountNow: 100_000, monthly: 0, months: 12 }), EXPECTED.student_list_alone);
  });
  it("a tariff without a period, or with two equal ones, runs as it always did", () => {
    const alone = run(FIRST);
    expect(run({ ...FIRST, until: undefined }).nominal).toBe(alone.nominal);
    const same = run({ ...FIRST, until: { months: 9, then: FIRST } });
    expect(same.nominal).toBeCloseTo(alone.nominal, 9);
    expect(same.fees.trade).toBeCloseTo(alone.fees.trade, 9);
    expect(alone.formulas).not.toContain("F-101");
    expect(run(until(12)).formulas).toContain("F-101");
  });
});

describe("the small balance (F-101)", () => {
  it("a minimum is the minimum of the tariff in force: 1,000 held a year, custody 3 twice then 30 twice, a buy of 5 and a sale of 26", () => {
    const small = runSecurities({ goal: { amountNow: 1000, monthly: 0, months: 12 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund", drag: {} }, tariff: until(6), profile: {} }, ctx);
    expectRun(small, EXPECTED.small_u6);
  });
});

describe("the fee split of a price for a time (F-61, F-101)", () => {
  const plan = (tariff: SecuritiesInput["tariff"]) => ({
    run: "runSecurities" as const,
    input: { goal: { amountNow: 10_000, monthly: 500, months: 24 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" as const, drag: {} }, tariff, profile: {} },
  });
  it("lists a line either tariff charges", () => {
    const freeFirst: SecuritiesInput["tariff"] = { buy: { rate: 0 }, sell: { rate: 0 }, custody: { rate: 0, everyMonths: 3 }, until: { months: 6, then: THEN } };
    expect(feeLines(plan(freeFirst))).toEqual(["trade", "custody", "fixed"]);
  });
  it("removing a line removes it from both tariffs", () => {
    const p = plan(until(12));
    const w = withoutFeeLine(p, "custody");
    if (w.run !== "runSecurities") throw new Error("unreachable");
    expect(w.input.tariff.custody).toBeUndefined();
    expect(w.input.tariff.until?.then.custody).toBeUndefined();
    expect(w.input.tariff.until?.months).toBe(12);
    const without = runSecurities(w.input, ctx);
    expect(without.fees.custody).toBe(0);
    expect(without.fees.trade).toBeGreaterThan(0);
    const f = withoutFeeLine(p, "fixed");
    if (f.run !== "runSecurities") throw new Error("unreachable");
    expect(f.input.tariff.until?.then.monthlyFee).toBeUndefined();
    expect(runSecurities(f.input, ctx).fees.fixed).toBe(0);
  });
  it("changing a rate changes it in both tariffs and keeps the period", () => {
    const w = withFeeRate(plan(until(12)), "custody", 0.002);
    if (w.run !== "runSecurities") throw new Error("unreachable");
    expect(w.input.tariff.custody?.rate).toBe(0.002);
    expect(w.input.tariff.until?.then.custody?.rate).toBe(0.002);
  });
});

describe("an entered tariff with a period through the workbench (F-101)", () => {
  const snapshot = JSON.parse(readFileSync(new URL("../../../data/fees/leumi@2026-11-04.json", import.meta.url), "utf8"));
  const input = (providers: WorkbenchInput["providers"]): WorkbenchInput => ({
    goal: { amountNow: 100_000, monthly: 0, months: 36 },
    market: { grossReturn: 0, inflation: 0 },
    fund: { kind: "israeli-fund", drag: {} },
    profile: {},
    instrumentClass: "etf_units",
    channel: "direct",
    theta: 0.005,
    providers,
  });
  const rowOf = (providers: WorkbenchInput["providers"]) => providerWorkbench(input(providers), ctx).rows[0] as ComparedProvider;
  const list = rowOf([{ snapshot, level: "list" }]);

  it("the provider's own list lines fill what the entered tariff leaves out, in both periods", () => {
    const entered: EnteredTariff = { custody: { rate: 0.00075, everyMonths: 3 }, until: { months: 12, then: {} } };
    const row = rowOf([{ snapshot, level: "entered", entered }]);
    expect(row.kind).toBe("compared");
    expect(row.tariff.custody).toEqual({ rate: 0.00075, everyMonths: 3 });
    // after the period the list's own custody line is back, its maximum and quarter included
    expect(row.tariff.until!.then.custody).toEqual(list.tariff.custody);
    expect(row.tariff.until!.then.buy).toEqual(list.tariff.buy);
    expect(row.tariff.buy).toEqual(list.tariff.buy);
    expect(row.run.fees.custody).toBeLessThan(list.run.fees.custody);
    // 12 months at half the list rate, 24 at the list rate: between the list alone and half of it all along
    const halfAlone = rowOf([{ snapshot, level: "entered", entered: { custody: { rate: 0.00075, everyMonths: 3 } } }]);
    expect(row.run.fees.custody).toBeGreaterThan(halfAlone.run.fees.custody);
    expect(row.run.fees.custody).toBeCloseTo((12 * halfAlone.run.fees.custody + 24 * list.run.fees.custody) / 36, -1);
  });

  it("a layered account is built on the list tariff the engine reads, and a layer that changes nothing gives the list row", () => {
    const seen: unknown[] = [];
    const row = rowOf([{ snapshot, level: "entered", layered: (l, run) => (seen.push([l, run]), { buy: l.buy, sell: l.sell, custody: l.custody, ...(l.fx !== undefined ? { fx: l.fx } : {}) }) }]);
    expect(seen).toHaveLength(1);
    expect((seen[0] as [SecuritiesInput["tariff"], unknown])[0]).toEqual(list.tariff);
    expect(row.real).toBeCloseTo(list.real, 9);
    expect(row.feeState).toBe("entered");
  });

  it("splits the cost by fee type over both periods", () => {
    const entered: EnteredTariff = { custody: { rate: 0.00075, everyMonths: 3 }, until: { months: 12, then: {} } };
    const row = rowOf([{ snapshot, level: "entered", entered }]);
    const custody = row.byType.find((t) => t.line === "custody")!;
    expect(custody.cost).toBeGreaterThan(0.99 * row.run.fees.custody);
    expect(row.byType.reduce((a, t) => a + t.cost, 0) + row.interaction).toBeCloseTo(row.horizonCost.value as number, 6);
  });
});
