// Release 4 golden scenarios: S44 and S45 (provider workbench, F-63).
//
// Inputs filled in where the scenarios leave them open, following the workings' notes (Q16):
// - S44's providers are written as fee snapshots (the shape of data/fees/): bank A, bank B, broker C and broker D
//   with no tariff. The regulator or TASE average is a percentage with no minimum and replaces only the trade
//   line (the snapshot's `averages` row); custody and the monthly fee stay at the list price.
// - The fund is S14's Israeli accumulating ETF (r_g 6%, pi 2.5%), 10,000 now and 2,000 a month for 5 years.
// - S45 is bank A with the person's own buy and sell fee of 0.1% min 10; the rest of A's tariff is its list.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feesSnapshot, type ValueObject } from "@finance-tool/schema";
import {
  buildTariff,
  formulas,
  pending,
  providerWorkbench,
  runSecurities,
  tieThreshold,
  type Fund,
  type ProviderInput,
  type ProviderWorkbench,
  type ComparedProvider,
  type WorkbenchInput,
} from "../../src/index.ts";
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
  // the Python check's run orders every month (A-28); F-133's longer intervals are tested on their own (order-interval.test.ts)
  behaviour: { ordersPerMonth, orderEvery: 1 },
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

  it("level entered without an entered tariff is that provider's row, with the field named (E5, 2026-10-25)", () => {
    const r = providerWorkbench(s44Base(1, [{ snapshot: bankA, level: "entered" }]), ctx).rows[0]!;
    expect(r.kind).toBe("not-comparable");
    if (r.kind === "not-comparable") expect(r.reason).toMatchObject({ code: "record-error", detail: expect.stringContaining("entered") });
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

  it("a channel must be named when the snapshot's lines differ by channel: the provider's row says so (E5, 2026-10-25)", () => {
    const r = providerWorkbench(input([{ snapshot: leumi, level: "list" }]), ctx).rows[0]!;
    expect(r.kind).toBe("not-comparable");
    if (r.kind === "not-comparable") expect(r.reason).toMatchObject({ code: "record-error", detail: expect.stringMatching(/name the channel/) });
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

describe("registry", () => {
  it("F-63 is registered, and no longer pending", () => {
    expect("F-63" in formulas).toBe(true);
    expect("F-63" in pending).toBe(false);
  });
});
