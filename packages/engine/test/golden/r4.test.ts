// Release 4 golden scenarios: S44 and S45 (provider workbench, F-63), S38 (switching cost, F-66), plus F-65
// (fund variants) on a small fund-list fixture, since the coverage matrix says F-65 waits for a list.
//
// Inputs filled in where the scenarios leave them open, following the workings' notes (Q16):
// - S44's providers are written as fee snapshots (the shape of data/fees/): bank A, bank B, broker C and broker D
//   with no tariff. The regulator or TASE average is a percentage with no minimum and replaces only the trade
//   line (the snapshot's `averages` row); custody and the monthly fee stay at the list price.
// - The fund is S14's Israeli accumulating ETF (r_g 6%, pi 2.5%), 10,000 now and 2,000 a month for 5 years.
// - S45 is bank A with the person's own buy and sell fee of 0.1% min 10; the rest of A's tariff is its list.
// - S38 (a) is S14's fees on 100,000 now with no monthly deposit for 6 years, switched at month 36; (b) is a track
//   switch inside a kupat gemel lehashkaa, which costs nothing.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feesSnapshot, fundListFile, type FundListFile, type ValueObject } from "@finance-tool/schema";
import {
  buildTariff,
  formulas,
  fundVariants,
  pending,
  providerWorkbench,
  runSecurities,
  switchingCost,
  tieThreshold,
  type Fund,
  type ProviderInput,
  type ProviderWorkbench,
  type ComparedProvider,
  type SecuritiesInput,
  type VariantExposure,
  type WorkbenchInput,
} from "../../src/index.ts";
import { RecordInputError } from "../../src/index.ts";
import { context, golden, loadRules } from "./harness.ts";
import { r4Expected as x } from "./expected.ts";

const dataDir = new URL("../../../../data/", import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, dataDir), "utf8")) as Record<string, unknown>;
const ctx = context(loadRules());
const theta = tieThreshold([readJson("parameters/tie-threshold.json")]);

// ---------------------------------------------------------------- fixtures: fee snapshots

const src = { url: "https://example.test/tariff", title: "fixture tariff", publisher: "fixture", strength: "institution" as const };
const vo = (value: number | null, unit: ValueObject["unit"], notes?: string): ValueObject => ({
  value,
  unit,
  source: src,
  checked: "2026-10-23",
  effective_from: null,
  effective_to: null,
  update_rule: "provider-set",
  state: "sourced",
  ...(notes ? { notes } : {}),
});

function line(id: string, base: string, rate: ValueObject, over: Record<string, unknown> = {}) {
  return {
    id,
    base,
    applies_to: ["etf_units"],
    level: "list",
    rate,
    min: null,
    max: null,
    period: null,
    channel: null,
    band: null,
    statement_code: null,
    names: { tariff: [id] },
    ...over,
  };
}

function snapshot(id: string, over: Record<string, unknown>) {
  return {
    id,
    provider: { name_he: id, class: id.startsWith("bank") ? "bank" : "broker", regulator: id.startsWith("bank") ? "BoI" : "ISA", tase_member: true, protection_rule_ids: ["BRK-10"] },
    tariff: { url: "https://example.test/tariff", title: "fixture", published: "2026-10-01", format: "pdf" },
    snapshot: "2026-10-23",
    missing: false,
    missing_reason: null,
    lines: [],
    averages: [],
    minimums: { account_opening: null },
    notice_rule_ids: [],
    ...over,
  };
}

const bankA = snapshot("bank-a", {
  lines: [
    line("a-trade", "trade", vo(0.3, "pct_of_trade"), { min: vo(25, "nis_per_trade") }),
    line("a-custody", "custody", vo(0.15, "pct_of_balance_per_period"), { min: vo(15, "nis_per_trade"), period: "quarter" }),
  ],
  averages: [{ line_id: "a-trade", level: "regulator_average", band: "100k-200k", rate: vo(0.21, "pct_of_trade") }],
  minimums: { account_opening: vo(5000, "nis") },
});
const bankB = snapshot("bank-b", {
  lines: [
    line("b-trade", "trade", vo(0.25, "pct_of_trade"), { min: vo(30, "nis_per_trade") }),
    line("b-custody", "custody", vo(0.12, "pct_of_balance_per_period"), { min: vo(20, "nis_per_trade"), period: "quarter" }),
  ],
  averages: [{ line_id: "b-trade", level: "regulator_average", band: null, rate: vo(0.19, "pct_of_trade") }],
});
const brokerC = snapshot("broker-c", {
  lines: [
    line("c-trade", "trade", vo(0.08, "pct_of_trade"), { min: vo(8, "nis_per_trade") }),
    line("c-fixed", "fixed_period", vo(15, "nis_per_month"), { period: "month" }),
  ],
  averages: [{ line_id: "c-trade", level: "tase_average", band: null, rate: vo(0.07, "pct_of_trade") }],
});
const brokerD = snapshot("broker-d", { missing: true, missing_reason: "no tariff is published for broker D (fixture)" });
const leumi = readJson("fees/leumi@2026-10-23.json");

// ---------------------------------------------------------------- S44, S45

const s14Fund: Fund = { kind: "israeli-fund", drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s44Base = (ordersPerMonth: number, providers: ProviderInput[]): WorkbenchInput => ({
  goal: { amountNow: 10_000, monthly: 2_000, months: 60 },
  market: { grossReturn: 0.06, inflation: 0.025 },
  fund: s14Fund,
  profile: {},
  behaviour: { ordersPerMonth },
  instrumentClass: "etf_units",
  theta,
  providers,
});

const at = (wb: ProviderWorkbench, id: string) => {
  const r = wb.rows.find((row) => row.id === id);
  if (!r || r.kind !== "compared") throw new Error(`${id} is not compared`);
  return r;
};
const cost = (r: ComparedProvider) => r.horizonCost.value as number;
const byType = (r: ComparedProvider, line: "trade" | "custody" | "fixed") => r.byType.find((t) => t.line === line)?.cost ?? 0;

function checkRow(g: ReturnType<typeof golden>, label: string, r: ComparedProvider, e: { cost: number; year1: number; fees1: number; trade: number; custody: number; fixed: number }) {
  g.value(`${label} horizon cost`, cost(r), e.cost);
  g.value(`${label} year-1 cost`, r.yearOneCost.value as number, e.year1);
  g.value(`${label} year-1 fees paid`, r.yearOneFeesPaid, e.fees1);
  g.value(`${label} trade`, byType(r, "trade"), e.trade);
  g.value(`${label} custody`, byType(r, "custody"), e.custody);
  g.value(`${label} account fee`, byType(r, "fixed"), e.fixed);
}

describe("S44 provider workbench, F-63", () => {
  const level = (orders: number) => {
    const list = providerWorkbench(
      s44Base(orders, [
        { snapshot: bankA, level: "list" },
        { snapshot: bankB, level: "list" },
        { snapshot: brokerC, level: "list" },
        { snapshot: brokerD, level: "list" },
      ]),
      ctx,
    );
    const average = providerWorkbench(
      s44Base(orders, [
        { snapshot: bankA, level: "regulator_average" },
        { snapshot: bankB, level: "regulator_average" },
        { snapshot: brokerC, level: "tase_average" },
        { snapshot: brokerD, level: "tase_average" },
      ]),
      ctx,
    );
    return { list, average };
  };

  it("1 order a month: list and average levels, year 1, fee types, deciding type, tie", () => {
    const { list, average } = level(1);
    const e = x.s44.oneOrder;
    const g = golden("S44");
    checkRow(g, "A list", at(list, "bank-a"), e.aList);
    checkRow(g, "B list", at(list, "bank-b"), e.bList);
    checkRow(g, "C list", at(list, "broker-c"), e.cList);
    checkRow(g, "A average", at(average, "bank-a"), e.aAverage);
    checkRow(g, "B average", at(average, "bank-b"), e.bAverage);
    checkRow(g, "C average", at(average, "broker-c"), e.cAverage);
    const d = x.s44.deciding;
    for (const [name, wb, want, order] of [
      ["list", list, d.oneOrderList, ["broker-c", "bank-b", "bank-a"]],
      ["average", average, d.oneOrderAverage, ["broker-c", "bank-b", "bank-a"]],
    ] as const) {
      expect(wb.ranking.order, name).toEqual(order);
      const t = wb.ranking.topTwo!;
      g.value(`${name} gap`, cost(at(wb, t.second)) - cost(at(wb, t.top)), want.costGap);
      g.value(`${name} deciding trade`, t.deciding.gaps.trade, want.trade);
      g.value(`${name} deciding custody`, t.deciding.gaps.custody, want.custody);
      g.value(`${name} deciding fixed`, t.deciding.gaps.fixed, want.fixed);
      expect(t.deciding.line, name).toBe("custody");
      expect(t.gap * 100, name).toBeCloseTo(want.tiePct, 2);
      expect(t.tie, name).toBe(false);
      expect(wb.ranking.tieSet).toEqual([t.top]);
    }
    g.done();
  });

  it("10 orders a month of 200 each: the minimums bite per order", () => {
    const { list, average } = level(10);
    const e = x.s44.tenOrders;
    const g = golden("S44");
    checkRow(g, "A list", at(list, "bank-a"), e.aList);
    checkRow(g, "B list", at(list, "bank-b"), e.bList);
    checkRow(g, "C list", at(list, "broker-c"), e.cList);
    checkRow(g, "A average", at(average, "bank-a"), e.aAverage);
    checkRow(g, "B average", at(average, "bank-b"), e.bAverage);
    checkRow(g, "C average", at(average, "broker-c"), e.cAverage);
    const d = x.s44.deciding;
    expect(list.ranking.order).toEqual(["broker-c", "bank-a", "bank-b"]);
    expect(average.ranking.order).toEqual(["broker-c", "bank-b", "bank-a"]);
    for (const [name, wb, want, decider] of [
      ["list", list, d.tenOrdersList, "trade"],
      ["average", average, d.tenOrdersAverage, "custody"],
    ] as const) {
      const t = wb.ranking.topTwo!;
      g.value(`${name} gap`, cost(at(wb, t.second)) - cost(at(wb, t.top)), want.costGap);
      g.value(`${name} deciding trade`, t.deciding.gaps.trade, want.trade);
      g.value(`${name} deciding custody`, t.deciding.gaps.custody, want.custody);
      g.value(`${name} deciding fixed`, t.deciding.gaps.fixed, want.fixed);
      expect(t.deciding.line, name).toBe(decider);
      expect(t.gap * 100, name).toBeCloseTo(want.tiePct, 2);
      expect(t.tie, name).toBe(false);
    }
    g.done();
  });

  it("broker D has no tariff: a row 'not comparable, data missing' with the snapshot's reason; every provider once", () => {
    const { list } = level(1);
    const d = list.rows.find((r) => r.id === "broker-d")!;
    expect(d.kind).toBe("not-comparable");
    if (d.kind !== "not-comparable") return;
    expect(d.reason).toEqual({ code: "data-missing", detail: "no tariff is published for broker D (fixture)" });
    expect(list.coverage.considered).toBe(4);
    expect(list.coverage.counts).toEqual({ ranked: 3, "not-evaluated": 1 });
    expect(list.coverage.notRanked.map((n) => n.id)).toEqual(["broker-d"]);
    expect(list.coverage.invariant.ok).toBe(true);
    expect(list.ranking.order).not.toContain("broker-d");
  });

  it("passes the account minimum and the protection rules through from the snapshot, and labels each fee as sourced", () => {
    const { list } = level(1);
    const a = at(list, "bank-a");
    expect(a.minimums.account_opening?.value).toBe(5000);
    expect(a.protectionRuleIds).toEqual(["BRK-10"]);
    expect(a.feeState).toBe("sourced");
    expect(a.horizonCost.state).toBe("computed");
    expect(a.horizonCost.computed_from?.formula).toBe("F-63");
    expect(a.horizonCost.source.strength).toBe("institution");
  });

  it("two providers within theta are a tie (F-80), compared with the top", () => {
    const twin = { ...bankA, id: "bank-a-twin" };
    const wb = providerWorkbench(
      s44Base(1, [
        { snapshot: bankA, level: "list" },
        { snapshot: twin, level: "list" },
        { snapshot: brokerC, level: "list" },
      ]),
      ctx,
    );
    // Broker C is cheaper; the two A rows are equal to each other and not within theta of C.
    expect(wb.ranking.order[0]).toBe("broker-c");
    const near = providerWorkbench(
      s44Base(1, [
        { snapshot: bankA, level: "list" },
        { snapshot: twin, level: "list" },
      ]),
      ctx,
    );
    expect(near.ranking.tieSet).toHaveLength(2);
    expect(near.ranking.topTwo!.tie).toBe(true);
    expect(near.ranking.topTwo!.deciding.line).toBeNull();
  });
});

describe("S45 provider with an entered fee, F-63", () => {
  it("bank A with an entered 0.1% min 10, 1 and 10 orders a month", () => {
    const entered = { buy: { rate: 0.001, min: 10 }, sell: { rate: 0.001, min: 10 } };
    const g = golden("S45");
    for (const [orders, e] of [
      [1, x.s44.oneOrder.aEntered],
      [10, x.s44.tenOrders.aEntered],
    ] as const) {
      const wb = providerWorkbench(s44Base(orders, [{ snapshot: bankA, level: "entered", entered }]), ctx);
      const r = at(wb, "bank-a");
      g.value(`${orders} order(s) horizon cost`, cost(r), e.cost);
      g.value(`${orders} order(s) year-1 cost`, r.yearOneCost.value as number, e.year1);
      expect(r.feeState).toBe("entered");
      expect(r.horizonCost.source.strength).toBe("entered");
      // The rest of A's tariff stays at the list price: custody 0.15% a quarter, min 15.
      expect(r.tariff.custody).toEqual({ rate: 0.0015, min: 15, everyMonths: 3 });
    }
    g.done();
  });

  it("an entered tariff can stand in for a snapshot with no tariff", () => {
    const wb = providerWorkbench(s44Base(1, [{ snapshot: brokerD, level: "entered", entered: { buy: { rate: 0.001, min: 10 }, sell: { rate: 0.001, min: 10 } } }]), ctx);
    expect(at(wb, "broker-d").noLine).toEqual(["custody"]);
  });

  it("level entered without an entered tariff stops with the field named", () => {
    expect(() => providerWorkbench(s44Base(1, [{ snapshot: bankA, level: "entered" }]), ctx)).toThrow(RecordInputError);
  });
});

describe("F-63 on real and fixture snapshot shapes", () => {
  const input = (providers: ProviderInput[], channel?: string): WorkbenchInput => ({ ...s44Base(1, providers), ...(channel ? { channel } : {}) });

  it("Leumi (data/fees) through its direct channel: tariff mapped from the lines, in fractions and shekels", () => {
    const parsed = providerWorkbench(input([{ snapshot: leumi, level: "list" }], "direct"), ctx);
    const l = at(parsed, "leumi");
    expect(l.tariff.buy).toEqual({ rate: 0.004, min: 26, max: 6300 });
    expect(l.tariff.sell).toEqual({ rate: 0.004, min: 26, max: 6300 });
    expect(l.tariff.custody).toEqual({ rate: 0.0015, max: 3700, everyMonths: 3 });
    expect(l.linesUsed).toEqual(["leumi-buy-sell-tase-direct", "leumi-custody-israel"]);
    // The FX line is not read: the fund is in shekels. The accumulating fund has no distributions, so F-18 is not flagged.
    expect(l.flags).toEqual([]);
    expect(l.protectionRuleIds).toEqual(["BRK-10", "BRK-12", "BRK-13"]);
    // Same cost as the run F-08 does on that tariff by hand.
    const hand = runSecurities({ goal: { amountNow: 10_000, monthly: 2_000, months: 60 }, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff: l.tariff, profile: {} }, ctx);
    expect(l.real).toBeCloseTo(hand.real, 6);
    expect(cost(l)).toBeGreaterThan(0);
  });

  const oneZero = readJson("fees/one-zero@2026-10-24.json");
  const psagot = readJson("fees/psagot@2026-10-23.json");
  const tariffFor = (snap: Record<string, unknown>, instrumentClass: string, band?: string) => {
    const snapshot = feesSnapshot.parse(snap);
    const p: ProviderInput = { snapshot: snap, level: "list", ...(band ? { band } : {}) };
    return buildTariff({ ...s44Base(1, [p]), instrumentClass }, p, snapshot);
  };

  it("One Zero (data/fees): the standard line is chosen over the ONE plan line, with no monthly fee", () => {
    const t = tariffFor(oneZero, "etf_units");
    expect(t.linesUsed).toContain("one-zero-buy-sell-tase");
    expect(t.linesUsed).not.toContain("one-zero-buy-sell-tase-plan-one");
    expect(t.tariff.buy!.rate).toBeCloseTo(0.003, 12);
    expect(t.tariff.buy).toMatchObject({ min: 30, max: 6000 });
    expect(t.tariff.monthlyFee).toBeUndefined();
  });

  it("One Zero asked for the ONE plan: the plan's rates and its 49 a month", () => {
    const t = tariffFor(oneZero, "etf_units", "ONE");
    expect(t.linesUsed).toContain("one-zero-buy-sell-tase-plan-one");
    expect(t.tariff.buy!.rate).toBeCloseTo(0.001, 12);
    expect(t.tariff.buy).toMatchObject({ min: 10, max: 2000 });
    expect(t.tariff.monthlyFee).toBe(49);
  });

  it("Psagot (data/fees): an ETF reads the shares line, a bond reads the bonds line", () => {
    expect(tariffFor(psagot, "etf_units").linesUsed).toContain("psagot-buy-sell-tase-shares");
    expect(tariffFor(psagot, "etf_units").tariff.buy!.rate).toBeCloseTo(0.0007, 12);
    const bond = tariffFor(psagot, "tase_bonds");
    expect(bond.linesUsed).toContain("psagot-buy-sell-tase-bonds");
    expect(bond.linesUsed).not.toContain("psagot-buy-sell-tase-shares");
    expect(bond.tariff.buy!.rate).toBeCloseTo(0.0006, 12);
  });

  it("two banded lines with no standard line and no band asked stay ambiguous", () => {
    expect(() => tariffFor(psagot, "foreign_securities")).toThrow(/ambiguous/);
  });

  it("Leumi through the branch costs more than through the direct channel", () => {
    const direct = at(providerWorkbench(input([{ snapshot: leumi, level: "list" }], "direct"), ctx), "leumi");
    const branch = at(providerWorkbench(input([{ snapshot: leumi, level: "list" }], "branch"), ctx), "leumi");
    expect(branch.tariff.buy).toMatchObject({ min: 27, max: 7000 });
    expect(branch.tariff.buy!.rate).toBeCloseTo(0.0065, 12);
    expect(cost(branch)).toBeGreaterThan(cost(direct));
  });

  it("Leumi with the FX line and a distributing fund: FX is read for a foreign-currency fund, distribution handling is flagged F-18", () => {
    const wb = providerWorkbench(
      {
        ...input([{ snapshot: leumi, level: "list" }], "direct"),
        fund: { kind: "israeli-fund", drag: { management: 0.003 }, distribution: { yield: 0.02, perYear: 4 }, },
        currency: { code: "USD", startRate: 3.7 },
        market: { grossReturn: 0.06, inflation: 0.025, returnIn: "instrument" },
        instrumentClass: "mutual_fund_units",
      },
      ctx,
    );
    const l = at(wb, "leumi");
    expect(l.tariff.fx).toBeCloseTo(0.0016, 12);
    expect(l.flags).toContain("F-18");
    expect(l.notModelled.map((n) => n.lineId)).toEqual(["leumi-distribution-fee-type-1", "leumi-distribution-fee-type-3"]);
  });

  it("a channel must be named when the snapshot's lines differ by channel", () => {
    expect(() => providerWorkbench(input([{ snapshot: leumi, level: "list" }]), ctx)).toThrow(/name the channel/);
  });

  it("Leumi has no averages, so at an average level it is not comparable with the reason", () => {
    const wb = providerWorkbench(input([{ snapshot: leumi, level: "regulator_average" }], "direct"), ctx);
    const r = wb.rows[0]!;
    expect(r.kind).toBe("not-comparable");
    if (r.kind === "not-comparable") expect(r.reason.code).toBe("no-average");
  });

  it("Leumi with a missing:true provider and a fixture: ranked, with the missing one accounted for", () => {
    const wb = providerWorkbench(input([{ snapshot: leumi, level: "list" }, { snapshot: brokerC, level: "list" }, { snapshot: brokerD, level: "list" }], "direct"), ctx);
    expect(wb.rows.map((r) => `${r.id}:${r.kind}`)).toEqual(["leumi:compared", "broker-c:compared", "broker-d:not-comparable"]);
    expect(wb.coverage.considered).toBe(3);
    expect(wb.ranking.order).toHaveLength(2);
  });

  it("a snapshot with no line for the fund's class is not comparable (no-applicable-line)", () => {
    const wb = providerWorkbench({ ...input([{ snapshot: leumi, level: "list" }], "direct"), instrumentClass: "makam_units" }, ctx);
    const r = wb.rows[0]!;
    expect(r.kind).toBe("not-comparable");
    if (r.kind === "not-comparable") expect(r.reason.code).toBe("no-applicable-line");
  });

  it("a null value in a line makes the provider not comparable, not zero", () => {
    const hole = snapshot("bank-hole", { lines: [line("h-trade", "trade", vo(null, "pct_of_trade", "not printed"))] });
    const wb = providerWorkbench(input([{ snapshot: hole, level: "list" }]), ctx);
    const r = wb.rows[0]!;
    expect(r.kind).toBe("not-comparable");
    if (r.kind === "not-comparable") expect(r.reason.code).toBe("line-without-value");
  });

  it("buildTariff spreads a quarterly fixed fee over its months and flags it", () => {
    const quarterly = snapshot("broker-q", { lines: [line("q-fixed", "fixed_period", vo(45, "nis"), { period: "quarter" })] });
    const built = buildTariff(input([]), { snapshot: quarterly, level: "list" }, quarterly as never);
    expect(built.tariff.monthlyFee).toBe(15);
    expect(built.flags).toEqual(["fixed-fee-spread:q-fixed"]);
  });
});

// ---------------------------------------------------------------- S38

describe("S38 switching cost, F-66", () => {
  const s14Tariff = {
    buy: { rate: 0.003, min: 25 },
    sell: { rate: 0.003, min: 25 },
    custody: { rate: 0.0015, min: 15, everyMonths: 3 },
  };
  const a: SecuritiesInput = {
    goal: { amountNow: 100_000, monthly: 0, months: 72 },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fund: s14Fund,
    tariff: s14Tariff,
    profile: {},
  };

  it("(a) brokerage: sale at month 36 with tax on A's lots, net proceeds buy B (same fees)", () => {
    const r = switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: s14Fund }, 36, ctx);
    if (r.kind !== "brokerage") throw new Error(r.kind);
    const g = golden("S38");
    g.value("real without switch", r.realNoSwitch, x.s38.realNoSwitch);
    g.value("real with switch", r.realWithSwitch, x.s38.realWithSwitch);
    g.value("cost of switching", r.cost.value as number, x.s38.cost);
    g.value("tax paid at the switch", r.taxAtSwitch, x.s38.taxAtSwitch);
    g.done();
    expect(r.cost.state).toBe("computed");
    expect(r.cost.computed_from?.formula).toBe("F-66");
    expect(r.cost.rule_ids).toContain("TXS-21");
    expect(r.outcome).toEqual({ code: "eligible" });
  });

  it("a switch to a fund on the same terms costs something at any month: the sale pays commissions and spread twice over", () => {
    const early = switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: s14Fund }, 12, ctx);
    const late = switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: s14Fund }, 60, ctx);
    if (early.kind !== "brokerage" || late.kind !== "brokerage") throw new Error("not brokerage");
    expect(early.cost.value as number).toBeGreaterThan(0);
    expect(late.cost.value as number).toBeGreaterThan(0);
  });

  it("a switch to a cheaper fund gains when its lower drag outweighs the cost of the sale", () => {
    const cheap: Fund = { kind: "israeli-fund", drag: { management: 0 }, halfSpread: 0.0005 };
    const r = switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: cheap }, 12, ctx);
    if (r.kind !== "brokerage") throw new Error(r.kind);
    expect(r.cost.value as number).toBeLessThan(0);
  });

  it("later contributions follow to B, and a switch month must lie inside the horizon", () => {
    const withMonthly: SecuritiesInput = { ...a, goal: { ...a.goal, monthly: 1_000 } };
    const r = switchingCost({ kind: "brokerage", input: withMonthly }, { kind: "brokerage", fund: s14Fund }, 36, ctx);
    if (r.kind !== "brokerage") throw new Error(r.kind);
    expect(r.runs.legB.paidIn).toBeGreaterThan(r.netProceeds);
    expect(() => switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: s14Fund }, 72, ctx)).toThrow(RangeError);
    expect(() => switchingCost({ kind: "brokerage", input: a }, { kind: "brokerage", fund: s14Fund }, 0, ctx)).toThrow(RangeError);
  });

  it("(b) kupat gemel lehashkaa: a track switch costs nothing (TXK-04, PF-23)", () => {
    const side = { kind: "provident", wrapper: "kupat-gemel-lehashkaa", ruleIds: ["TXK-04", "PF-23"] } as const;
    const r = switchingCost(side, side, 36, ctx);
    if (r.kind !== "provident") throw new Error(r.kind);
    const g = golden("S38");
    g.value("cost of switching", r.cost.value as number, x.s38.providentCost);
    g.done();
    expect(r.ruleIds).toEqual(["TXK-04", "PF-23"]);
    expect(r.cost.rule_ids).toEqual(expect.arrayContaining(["TXK-04", "PF-23"]));
  });

  it("a hishtalmut moves whole: a part is not allowed (PF-18, KH-17); the whole costs nothing (TXH-17)", () => {
    const whole = { kind: "provident", wrapper: "keren-hishtalmut", ruleIds: ["TXH-17", "TXH-19"], wholeOnlyRuleIds: ["PF-18", "KH-17"] } as const;
    const part = { ...whole, share: 0.5 };
    const no = switchingCost(part, part, 36, ctx);
    expect(no).toEqual({ formula: "F-66", kind: "not-allowed", code: "hishtalmut-whole-only", ruleIds: ["PF-18", "KH-17"] });
    const yes = switchingCost(whole, whole, 36, ctx);
    expect(yes.kind).toBe("provident");
    if (yes.kind === "provident") expect(yes.cost.value).toBe(0);
  });

  it("a transfer between kinds is not evaluated, and a rule the bundle lacks stops the cost with that rule", () => {
    const kgl = { kind: "provident", wrapper: "kupat-gemel-lehashkaa", ruleIds: ["TXK-04"] } as const;
    const kh = { kind: "provident", wrapper: "keren-hishtalmut", ruleIds: ["TXH-17"], wholeOnlyRuleIds: ["PF-18"] } as const;
    expect(switchingCost(kgl, kh, 36, ctx)).toMatchObject({ kind: "not-evaluated", code: "different-kind" });
    const missing = { kind: "provident", wrapper: "kupat-gemel-lehashkaa", ruleIds: ["ZZZ-99"] } as const;
    expect(switchingCost(missing, missing, 36, ctx)).toEqual({ formula: "F-66", kind: "not-evaluated", code: "rule-missing", ruleIds: ["ZZZ-99"] });
  });
});

// ---------------------------------------------------------------- F-65

describe("F-65 fund variants on a five-row fixture list", () => {
  const sp500Record = readJson("funds/1148162@2026-10-23.json");
  const sp500 = readJson("instruments/exposures/index-sp500.json");
  const record = (over: Record<string, unknown>) => ({ ...sp500Record, ...over });
  const fee = (value: number | null, unit: ValueObject["unit"]) => vo(value, unit, value === null ? "not collected" : undefined);

  // Two Israeli funds with records (the real S&P 500 ETF record and a second, cheaper tracker), one matching row
  // without a record, one row of another exposure, and one TASE foreign fund with a record.
  const second = record({
    id: "9000001",
    names: { en: [], he: ["קרן שנייה על S&P 500"], tase: ["9000001"] },
    identifiers: { isin: null, tase_number: "9000001", cusip: null, ticker: {} },
    fees: { ...(sp500Record.fees as object), fixed_management: fee(0.1, "pct_per_year"), variable_management: fee(null, "pct_per_year"), trustee: fee(0.01, "pct_per_year") },
  });
  const foreign = record({
    id: "9000004",
    names: { en: ["Fixture Ireland S&P 500 UCITS"], he: ["קרן אירית על S&P 500"], tase: ["9000004"] },
    identifiers: { isin: "IE0000000004", tase_number: "9000004", cusip: null, ticker: {} },
    domicile: "IE",
    legal_form: "UCITS ETF",
    currency: "USD",
    trading_currency_on_tase: "NIS",
    distribution_policy: "accumulating",
    exposure_code: null,
    fees: { ...(sp500Record.fees as object), fixed_management: fee(0.07, "pct_per_year"), variable_management: fee(null, "pct_per_year"), trustee: fee(null, "pct_per_year") },
  });
  const usAbroad = record({
    id: "us0000000005",
    names: { en: ["Fixture US S&P 500 ETF"], he: [], tase: [] },
    identifiers: { isin: "US0000000005", tase_number: null, cusip: null, ticker: { NYSE: "FIX" } },
    domicile: "US",
    legal_form: "ETF",
    currency: "USD",
    trading_currency_on_tase: null,
    distribution_policy: "distributing",
    exposure_code: null,
    fees: { ...(sp500Record.fees as object), fixed_management: fee(0.03, "pct_per_year"), variable_management: fee(null, "pct_per_year"), trustee: fee(null, "pct_per_year") },
  });

  const row = (n: string, code: string | null, name: string, over: Record<string, unknown> = {}) => ({
    fund_number: n,
    isin: null,
    names: { he: [name] },
    manager: "fixture manager",
    classification: ["מניות", "חו\"ל"],
    exposure_code: code,
    tax_status: "פטור",
    data_date: "2026-10-22",
    ...over,
  });
  const base = {
    snapshot: "2026-10-23",
    source: { url: "https://example.test/list", title: "fixture list", publisher: "fixture", strength: "primary" as const },
    checked: "2026-10-23",
    terms_of_use: { status: "confirmed" as const, fallback: "n/a" },
    raw: { archive_key: "fixture", sha256: "0".repeat(64) },
  };
  const israeliList: FundListFile = fundListFile.parse({
    ...base,
    list: "maya-mutual-funds",
    funds: [
      row("1148162", "4D", "אי.בי.אי. סל (4D) S&P 500"),
      row("9000001", "4D", "קרן שנייה על S&P 500"),
      row("9000002", "4D", "קרן ללא רשומה"),
      row("9000003", "3A", "קרן של נכס אחר"),
    ],
  });
  const taseList: FundListFile = fundListFile.parse({
    ...base,
    list: "tase-foreign-funds",
    funds: [row("9000004", null, "קרן אירית על S&P 500", { isin: "IE0000000004", classification: ["קרנות זרות"] })],
  });
  // An older Israeli list that must be ignored: it holds a row the latest one dropped.
  const oldList: FundListFile = fundListFile.parse({ ...base, snapshot: "2026-01-01", list: "maya-mutual-funds", funds: [row("9000099", "4D", "ישנה")] });

  const exposure = (over: Partial<VariantExposure["run"]> = {}): VariantExposure => ({
    record: sp500 as never,
    theta,
    run: {
      goal: { amountNow: 50_000, monthly: 0, months: 120 },
      grossReturn: 0.06,
      inflation: 0.025,
      fxChange: 0,
      tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 }, fx: 0.0025 },
      profile: {},
      fxStartRates: { USD: 3.7 },
      distributions: { us0000000005: { yield: 0.013, perYear: 4 } },
      ...over,
    },
  });
  const funds = [sp500Record, second, foreign, usAbroad];
  const result = fundVariants(exposure(), [oldList, israeliList, taseList], funds, ctx);
  const get = (id: string) => result.rows.find((r) => r.id === id)!;

  it("candidates: matching rows of the latest lists and the foreign records, not the other exposure's row or the old list", () => {
    expect(result.rows.map((r) => r.id)).toEqual(["maya:1148162", "maya:9000001", "maya:9000002", "tase:9000004", "fund:us0000000005"]);
    expect(result.lists).toEqual({ israeli: "2026-10-23", tase: "2026-10-23" });
  });

  it("a candidate with a record runs F-08 with its own drag: same result as the run by hand", () => {
    const r = get("maya:1148162");
    expect(r.kind).toBe("ranked");
    const hand = runSecurities(
      {
        goal: { amountNow: 50_000, monthly: 0, months: 120 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: { kind: "israeli-fund", drag: { management: 0.008, variable: 0.003, trustee: 0.00015 } },
        tariff: { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } },
        profile: {},
      },
      ctx,
    );
    expect(r.run!.real).toBeCloseTo(hand.real, 6);
    // Fee fields the record leaves empty are named, not silently dropped.
    expect(r.notCollected).toEqual(["tracking_difference_12m", "median_spread", "fund_level_withholding_drag"]);
    expect(get("maya:9000001").run!.real).toBeGreaterThan(r.run!.real);
  });

  it("a matching row without a record is 'not evaluated: details not collected'", () => {
    const r = get("maya:9000002");
    expect(r.kind).toBe("not-evaluated");
    expect(r.reasons).toEqual([{ code: "missing-record", ruleIds: [], gapIds: [], detail: "details not collected" }]);
    expect(r.run).toBeUndefined();
  });

  it("an accumulating foreign-domiciled fund is computed, labelled secondary, listed and not ranked (G-18)", () => {
    const r = get("tase:9000004");
    expect(r.kind).toBe("listed-not-ranked");
    expect(r.reasons[0]).toMatchObject({ code: "gap", gapIds: ["G-18"] });
    expect(r.labels).toContainEqual({ code: "secondary-source", ruleId: "TXF-11" });
    expect(r.run!.real).toBeGreaterThan(0);
    expect(r.rank).toBeUndefined();
    // Bought in shekels on TASE: no FX conversion line.
    expect((r.plan as { input: SecuritiesInput }).input.tariff.currency).toBeUndefined();
    expect(r.run!.fees.fx).toBe(0);
  });

  it("a foreign fund traded abroad runs in its currency with the FX start rate, its distributions and W-8BEN-based withholding", () => {
    const r = get("fund:us0000000005");
    expect(r.kind).toBe("ranked");
    const input = (r.plan as { input: SecuritiesInput }).input;
    expect(input.market.returnIn).toBe("instrument");
    expect(input.tariff.currency).toEqual({ code: "USD", startRate: 3.7 });
    expect(input.fund).toMatchObject({ kind: "foreign-fund", domicile: "us", distribution: { yield: 0.013, perYear: 4 } });
    expect(r.run!.fees.fx).toBeGreaterThan(0);
    expect(r.run!.flags.map((f) => f.code)).toContain("G-20");
  });

  it("ranks by real value with ties by F-80; the listed and not-evaluated variants are not in the ranking", () => {
    const ids = result.ranking.entries.map((e) => e.id);
    expect(ids).toHaveLength(3);
    expect(ids).not.toContain("tase:9000004");
    expect(ids).not.toContain("maya:9000002");
    const reals = result.ranking.entries.map((e) => e.real);
    expect([...reals].sort((p, q) => q - p)).toEqual(reals);
    expect(result.ranking.tieSet[0]).toBe(result.ranking.top);
    expect(result.rows.filter((r) => r.rank !== undefined)).toHaveLength(3);
  });

  it("coverage line (F-83): every candidate once, the not-held-abroad group as one line (G-29)", () => {
    const c = result.coverage;
    expect(c.considered).toBe(6);
    expect(c.counts).toEqual({ "not-eligible": 0, excluded: 0, "not-evaluated": 2, "listed-not-ranked": 1, ranked: 3 });
    expect(c.invariant.ok).toBe(true);
    const group = c.notRanked.find((n) => n.id === "group:foreign-traded-abroad")!;
    expect(group.reasons[0]).toMatchObject({ code: "gap", gapIds: ["G-29"] });
    expect(result.group).toEqual({ id: "group:foreign-traded-abroad", gapId: "G-29", held: 1 }); // the US fund traded abroad only; the Irish fund traded on TASE is a row of its own
  });

  it("a record with no management fee collected is not evaluated, and a distributing fund with no yield asks for it", () => {
    const blank = { ...second, fees: { ...(second.fees as object), fixed_management: fee(null, "pct_per_year") } };
    const r1 = fundVariants(exposure(), [israeliList], [sp500Record, blank], ctx);
    expect(r1.rows.find((r) => r.id === "maya:9000001")!.reasons[0]).toMatchObject({ code: "missing-record", detail: "details not collected: fees.fixed_management" });
    const r2 = fundVariants(exposure({ distributions: {} }), [israeliList, taseList], funds, ctx);
    expect(r2.rows.find((r) => r.id === "fund:us0000000005")!.reasons[0]).toMatchObject({ code: "missing-input" });
    const r3 = fundVariants(exposure({ fxStartRates: {} }), [israeliList, taseList], funds, ctx);
    expect(r3.rows.find((r) => r.id === "fund:us0000000005")!.reasons[0]).toMatchObject({ code: "missing-input", detail: "fxStartRates.USD" });
  });

  it("matches a row without a record by the caller's reference asset, and a record's exposure overrides a matching code", () => {
    const rows = fundListFile.parse({ ...base, list: "maya-mutual-funds", funds: [row("9100001", null, "קרן עם נכס ייחוס", { reference_asset: "  S&P   500 " }), row("9100002", "4D", "קרן שרשומה לנכס אחר")] });
    const other = record({ id: "9100002", identifiers: { isin: null, tase_number: "9100002", cusip: null, ticker: {} }, exposure_id: "index-ta125", exposure_code: "4D" });
    const r = fundVariants(exposure(), [rows], [other], ctx);
    expect(r.rows.map((v) => v.id)).toEqual(["maya:9100001"]);
  });

  it("is registered in the formula registry with F-63 and F-66, and no longer pending", () => {
    for (const id of ["F-63", "F-65", "F-66"]) {
      expect(id in formulas, id).toBe(true);
      expect(id in pending, id).toBe(false);
    }
  });
});
