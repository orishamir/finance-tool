// F-128 An account priced by a deal: the securities run reads every charge from the deal's own formulas (F-110 to F-117). A deal that states
// the same prices as a tariff runs to the same figures, so the indices page and the fee page never disagree about a fee.
import { describe, expect, it } from "vitest";
import { convertedFor, planChargeOf, providerWorkbench, runSecurities, tradeForCash, type Deal, type DealAccount, type DealProvider, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const start = { y: 2026, m: 11 };

const base: SecuritiesInput = {
  goal: { amountNow: 10_000, monthly: 500, months: 120 },
  market: { grossReturn: 0.07, inflation: 0.02 },
  fund: { kind: "israeli-fund", drag: { management: 0.001 } },
  tariff: {},
  profile: {},
};

/** A tariff and the deal that states the same prices: 0.1% a trade with at least 5 ₪, 0.15% a quarter of what is held, 10 ₪ a month. */
const tariff = { buy: { rate: 0.001, min: 5 }, sell: { rate: 0.001, min: 5 }, custody: { rate: 0.0015, everyMonths: 3 }, monthlyFee: 10 };
const deal: Deal = {
  foreign: false,
  fees: [
    { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 5 } }] },
    { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0015, everyMonths: 3 } }] },
    { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
  ],
};
const account = (d: Deal = deal): DealAccount => ({ deal: d, start, rates: {} });

describe("F-128 a deal account runs as a tariff with the same prices", () => {
  it("by amount, a fund in shekels: the same value left and the same fees", () => {
    const t = runSecurities({ ...base, tariff }, ctx);
    const d = runSecurities({ ...base, deal: account() }, ctx);
    expect(d.nominal).toBeCloseTo(t.nominal, 6);
    for (const k of ["trade", "custody", "fixed", "fx"] as const) expect(d.fees[k]).toBeCloseTo(t.fees[k], 6);
    expect(d.formulas).toContain("F-128");
  });

  it("a fund bought abroad, with a conversion of 0.2% and whole units", () => {
    const currency = { code: "USD", startRate: 3.7 };
    const foreign: SecuritiesInput = { ...base, fund: { kind: "foreign-fund", drag: { management: 0.0007 }, sharePrice: 500 }, market: { ...base.market, returnIn: "instrument", fxChange: 0 }, wholeUnits: { price: 1850 } };
    const t = runSecurities({ ...foreign, tariff: { ...tariff, fx: 0.002, currency } }, ctx);
    const fx: Deal = { ...deal, fees: [...deal.fees, { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002 } }] }] };
    const d = runSecurities({ ...foreign, tariff: { currency }, deal: account(fx) }, ctx);
    expect(d.nominal).toBeCloseTo(t.nominal, 4);
    expect(d.fees.fx).toBeCloseTo(t.fees.fx, 4);
    expect(d.fees.trade).toBeCloseTo(t.fees.trade, 4);
  });

  it("each fee's carried payments add up to its line's", () => {
    const d = runSecurities({ ...base, deal: account() }, ctx);
    expect(d.feesCarriedBy![0]).toBeCloseTo(d.feesCarried!.trade, 6);
    expect(d.feesCarriedBy![1]).toBeCloseTo(d.feesCarried!.custody, 6);
    expect(d.feesCarriedBy![2]).toBeCloseTo(d.feesCarried!.fixed, 6);
  });

  it("refuses a tariff line beside the deal", () => {
    expect(() => runSecurities({ ...base, tariff, deal: account() }, ctx)).toThrow(/F-128/);
  });
});

describe("F-128 prices over time apply by calendar month", () => {
  it("a custody free until a month charges from that month's charge on", () => {
    // free to 2027-05 (the run's months 1 to 6), then 0.15% a quarter: the charges of months 3 and 6 are free, month 9's is not
    const later: Deal = { ...deal, fees: [deal.fees[0]!, { base: { key: "custody" }, stages: [{ price: { kind: "free" }, until: { y: 2027, m: 5 } }, { price: { kind: "held", rate: 0.0015, everyMonths: 3 } }] }] };
    const short = { ...base, goal: { amountNow: 100_000, monthly: 0, months: 12 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" as const } };
    const r = runSecurities({ ...short, deal: account(later) }, ctx);
    const all = runSecurities({ ...short, deal: account({ ...deal, fees: [deal.fees[0]!, deal.fees[1]!] }) }, ctx);
    // two quarterly charges of about 150 ₪ against four
    expect(r.fees.custody).toBeGreaterThan(290);
    expect(r.fees.custody).toBeLessThan(310);
    expect(all.fees.custody).toBeGreaterThan(590);
  });

  it("a quarter that straddles a change takes the later price", () => {
    // the price changes at the start of 2027-01 (run month 3), inside the first quarter: month 3's charge is at the new price
    const changed: Deal = { ...deal, fees: [deal.fees[0]!, { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0015, everyMonths: 3 } , until: { y: 2027, m: 1 } }, { price: { kind: "held", rate: 0.003, everyMonths: 3 } }] }] };
    const short = { ...base, goal: { amountNow: 100_000, monthly: 0, months: 3 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" as const } };
    const r = runSecurities({ ...short, deal: account(changed) }, ctx);
    expect(r.fees.custody).toBeCloseTo(0.003 * (100_000 - 100), 0);
  });
});

describe("F-128 what the plan charges, and why not", () => {
  const facts = { converts: false, distributes: false };
  it("names a reason for each base the plan never charges", () => {
    expect(planChargeOf({ key: "trade" }, facts)).toEqual({ charge: "trade" });
    expect(planChargeOf({ key: "fx" }, facts)).toEqual({ not: "shekel-fund" });
    expect(planChargeOf({ key: "fx" }, { ...facts, converts: true })).toEqual({ charge: "conversion" });
    expect(planChargeOf({ key: "transfer_out" }, facts)).toEqual({ not: "transfer-out" });
    expect(planChargeOf({ key: "trustee" }, facts)).toEqual({ not: "fund-record" });
    expect(planChargeOf({ key: "corporate_event" }, facts)).toEqual({ not: "no-dividend" });
    expect(planChargeOf({ key: "distribution_handling" }, facts)).toEqual({ not: "not-yet" });
    expect(planChargeOf({ name: "own" }, facts)).toEqual({ not: "named" });
  });

  it("a fee the plan does not charge leaves the run as it is", () => {
    const withTransfer: Deal = { ...deal, fees: [...deal.fees, { base: { key: "transfer_out" }, stages: [{ price: { kind: "perAction", amount: 50 } }] }] };
    expect(runSecurities({ ...base, deal: account(withTransfer) }, ctx).nominal).toBeCloseTo(runSecurities({ ...base, deal: account() }, ctx).nominal, 9);
  });
});

describe("F-128 the trade a cash pays for", () => {
  it("meets the cash where the cost is continuous", () => {
    const cost = (t: number) => Math.max(5, 0.001 * t);
    const t = tradeForCash(10_000, cost, []);
    expect(t + cost(t)).toBeCloseTo(10_000, 6);
  });
  it("finds the largest trade below a step whose price jumps past the cash", () => {
    // free up to 1,000, then 50 a trade: a cash of 1,020 buys 1,000 and leaves 20
    const cost = (t: number) => (t <= 1_000 ? 0 : 50);
    expect(tradeForCash(1_020, cost, [1_000])).toBeCloseTo(1_000, 6);
    expect(tradeForCash(2_000, cost, [1_000])).toBeCloseTo(1_950, 6);
  });
  it("converts the shekels a sum owed needs", () => {
    expect(convertedFor(1_000, (c) => 0.002 * c)).toBeCloseTo(1_000 / 0.998, 6);
  });
});

describe("F-128 in the workbench", () => {
  const input = (deals: DealProvider[]): WorkbenchInput => ({
    goal: { amountNow: 10_000, monthly: 500, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.02 },
    fund: { kind: "israeli-fund", drag: { management: 0.001 } },
    profile: {},
    behaviour: { ordersPerMonth: 1 },
    instrumentClass: "etf_units",
    channel: "direct",
    theta: 0.005,
    providers: [],
    deals,
  });
  const provider = (over: Partial<DealProvider> = {}): DealProvider => ({ id: "deal-a", name: "עסקה", providerClass: "broker", saved: "2026-11-21", account: () => account(), ...over });

  it("ranks a deal account as an entered row, its fees split by what each was paid", () => {
    const wb = providerWorkbench(input([provider()]), ctx);
    const row = wb.rows[0]!;
    expect(row.kind).toBe("compared");
    if (row.kind !== "compared") return;
    expect(row.feeState).toBe("entered");
    expect(row.rank).toBe(1);
    expect(row.byFee!.map((x) => x.fee)).toEqual([0, 1, 2]);
    expect(row.byFee!.reduce((a, x) => a + x.costBeforeTax, 0)).toBeGreaterThan(0);
  });

  it("lists a deal with no price for the run, with the caller's reason", () => {
    const wb = providerWorkbench(input([provider({ account: () => ({ unpriced: "custody" }) })]), ctx);
    expect(wb.rows[0]).toMatchObject({ kind: "not-comparable", reason: { code: "deal-unpriced", detail: "custody" } });
  });

  it("is not comparable where a sum is in a currency the run has no rate for", () => {
    const usd: Deal = { ...deal, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "perAction", amount: 5, currency: "USD" } }] }] };
    const wb = providerWorkbench(input([provider({ account: () => account(usd) })]), ctx);
    expect(wb.rows[0]).toMatchObject({ kind: "not-comparable", reason: { code: "needs-fx-rate" } });
  });
});

describe("F-128 what the plan's months set", () => {
  /** The trade fee of `deal` as two fees, one charged within each step (`PlanWithin`): `low` up to `top`, `high` above it. */
  const stepped = (on: "count" | "trading" | "balance", top: number, low: number, high: number, unit = on === "count" ? "actions" : "ILS"): DealAccount => ({
    ...account({ ...deal, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: low } }] }, { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: high } }] }, ...deal.fees.slice(1)] }),
    planWithin: [[{ on, from: 0, to: top, unit }], [{ on, from: top, to: null, unit }]],
  });
  const flat = (rate: number) => account({ ...deal, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate } }] }, ...deal.fees.slice(1)] });

  it("counts the orders the plan places in a month: two in the first month (the amount now and the deposit), one in each after, two in the last (the deposit and the sale)", () => {
    // one order a month at 0.1%, more at 0.3%: the first and last months' actions pay 0.3%, every other month's 0.1%
    const d = runSecurities({ ...base, deal: stepped("count", 1, 0.001, 0.003) }, ctx);
    const low = runSecurities({ ...base, deal: flat(0.001) }, ctx);
    const high = runSecurities({ ...base, deal: flat(0.003) }, ctx);
    expect(d.fees.trade).toBeGreaterThan(low.fees.trade);
    expect(d.fees.trade).toBeLessThan(high.fees.trade);
    // the first month's two orders and the last month's deposit and sale at 0.3%, the 118 deposits between at 0.1%
    const sale = d.fees.trade - (10_000 + 500) * 0.003 / 1.003 - 118 * 500 * 0.001 / 1.001 - 500 * 0.003 / 1.003;
    expect(sale).toBeGreaterThan(0);
    expect(sale / 0.003).toBeGreaterThan(20_000);
  });

  it("reads a month's trading: the month of the amount now pays its step, the months of the deposits theirs", () => {
    // up to 1,000 ₪ of trading in a month at 0.1%, above it 0.3%: only the first month (10,500 ₪) and the sale's month pay 0.3%
    const d = runSecurities({ ...base, deal: stepped("trading", 1_000, 0.001, 0.003) }, ctx);
    const count = runSecurities({ ...base, deal: stepped("count", 1, 0.001, 0.003) }, ctx);
    expect(d.fees.trade).toBeCloseTo(count.fees.trade, 6);
    // a step above every month's trading charges the low price throughout
    const all = runSecurities({ ...base, deal: stepped("trading", 1e9, 0.001, 0.003) }, ctx);
    expect(all.fees.trade).toBeCloseTo(runSecurities({ ...base, deal: flat(0.001) }, ctx).fees.trade, 6);
  });

  it("reads the balance when the order is placed: an order into an empty account pays its step, the later ones theirs", () => {
    // up to 1 ₪ held at 0.3%, more at 0.1%: only the amount now, placed into an empty account, pays 0.3%
    const d = runSecurities({ ...base, deal: stepped("balance", 1, 0.003, 0.001) }, ctx);
    const low = runSecurities({ ...base, deal: flat(0.001) }, ctx);
    // the dearer first order buys a little less, so the sale is a little smaller too
    expect(d.fees.trade - low.fees.trade).toBeCloseTo(10_000 * (0.003 / 1.003 - 0.001 / 1.001), 1);
  });
});
