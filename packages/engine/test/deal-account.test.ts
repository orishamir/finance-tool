// F-128 An account priced by a deal: the securities run reads every charge from the deal's own formulas (F-110 to F-117). A deal that states
// the same prices as a tariff runs to the same figures, so the indices page and the fee page never disagree about a fee.
import { describe, expect, it } from "vitest";
import { boughtFor, conversionStretches, dealCharges, planChargeOf, providerWorkbench, runSecurities, tradeForCash, type Deal, type DealAccount, type DealProvider, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
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
  it("places no order where the cash is at or below the cost of the smallest trade, as F-12's `buyWithCash` places none", () => {
    const cost = (t: number) => Math.max(10, 0.001 * t);
    expect(tradeForCash(10, cost, [])).toBe(0);
    expect(tradeForCash(10, cost, [5])).toBe(0);
    expect(tradeForCash(10.5, cost, [])).toBeCloseTo(0.5, 9);
  });
  it("converts the shekels a sum owed needs", () => {
    expect(boughtFor(1_000, conversionStretches(0.002, 0, { fxRate: 1 }), 0.01).converted).toBeCloseTo(1_000 / 0.998, 6);
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

describe("F-128 charges on what is held and on the account", () => {
  const short = { ...base, goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" as const } };
  const sumIn = (to: number | null, from = 0): Deal => ({ ...deal, fees: [deal.fees[0]!, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }], within: { on: "held", from, to, currency: "ILS" } }] });

  it("charges a sum per period only within its step of the value held, as the deal's own formula does", () => {
    expect(runSecurities({ ...short, deal: account(sumIn(50_000)) }, ctx).fees.fixed).toBeCloseTo(120, 6);
    expect(runSecurities({ ...short, deal: account(sumIn(null, 50_000)) }, ctx).fees.fixed).toBe(0);
  });

  it("reports custody priced as a sum on custody's line, charged as the account's own sums are", () => {
    const custodySum: Deal = { ...deal, fees: [deal.fees[0]!, { base: { key: "custody" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] }] };
    const r = runSecurities({ ...short, deal: account(custodySum) }, ctx);
    expect(r.fees.custody).toBeCloseTo(120, 6);
    expect(r.fees.fixed).toBe(0);
    expect(r.feesCarriedBy![1]).toBeCloseTo(r.feesCarried!.custody, 6);
  });

  it("charges no custody on a money-market unit at a bank, priced as a share of what is held or as a sum (F-14)", () => {
    const custodySum: Deal = { ...deal, fees: [deal.fees[0]!, { base: { key: "custody" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] }] };
    const custodyHeld: Deal = { ...deal, fees: [deal.fees[0]!, deal.fees[1]!] };
    const mmf = { ...short, fund: { kind: "money-market-daily" as const } };
    for (const d of [custodySum, custodyHeld]) {
      expect(runSecurities({ ...mmf, memberKind: "bank", deal: account(d) }, ctx).fees.custody).toBe(0);
      expect(runSecurities({ ...mmf, memberKind: "non-bank", deal: account(d) }, ctx).fees.custody).toBeGreaterThan(0);
    }
  });

  it("charges a fee in the person's own words where F-111 places it: a sum on the account, a share on what is held; never one on an action", () => {
    const facts = { converts: false, distributes: false };
    expect(planChargeOf({ name: "own" }, facts, [{ kind: "sum", amount: 10, everyMonths: 1 }])).toEqual({ charge: "holding" });
    expect(planChargeOf({ name: "own" }, facts, [{ kind: "free" }, { kind: "held", rate: 0.001, everyMonths: 3 }])).toEqual({ charge: "holding" });
    expect(planChargeOf({ name: "own" }, facts, [{ kind: "sum", amount: 10, everyMonths: 1 }, { kind: "perAction", amount: 5 }])).toEqual({ not: "named" });
    const named: Deal = { ...deal, fees: [deal.fees[0]!, deal.fees[1]!, { base: { name: "own" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] }] };
    expect(runSecurities({ ...base, deal: account(named) }, ctx).nominal).toBeCloseTo(runSecurities({ ...base, deal: account() }, ctx).nominal, 6);
  });
});

describe("F-128 a charge on what is held or on the account reads the months it covers", () => {
  /** The account's sum as two fees, 10 ₪ within up to `top` orders and 20 ₪ above, charged every `every` months. */
  const byCount = (top: number, every: number): DealAccount => ({
    ...account({ ...deal, fees: [deal.fees[0]!, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10 * every, everyMonths: every } }] }, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 20 * every, everyMonths: every } }] }] }),
    planWithin: [undefined, [{ on: "count", from: 0, to: top, unit: "actions" }], [{ on: "count", from: top, to: null, unit: "actions" }]],
  });

  it("a monthly charge reads its month: the first and the last months, with two orders each, pay the dearer step", () => {
    const r = runSecurities({ ...base, deal: byCount(1, 1) }, ctx);
    expect(r.fees.fixed).toBeCloseTo(118 * 10 + 2 * 20, 6);
  });

  it("a quarterly charge reads its quarter's orders a month, their total ÷ 3, against steps written per month", () => {
    // one order a month, four in the first quarter and the last (4 ÷ 3 a month): up to one a month the cheaper step, so only those two pay the dearer
    const r = runSecurities({ ...base, deal: byCount(1, 3) }, ctx);
    expect(r.fees.fixed).toBeCloseTo(38 * 30 + 2 * 60, 6);
    // up to three a month: every quarter, whose total is three or four orders, is in the cheaper step
    expect(runSecurities({ ...base, deal: byCount(3, 3) }, ctx).fees.fixed).toBeCloseTo(40 * 30, 6);
  });

  it("a quarterly charge reads its quarter's trading a month against steps of a month's trading", () => {
    // up to 1,000 ₪ of trading a month at 10 ₪ a month, above it 20: a quarter of three deposits (500 ₪ a month, grown with inflation)
    // trades under 1,000 a month, though its total is above it; the first quarter (10,000 ₪ now) and the last (the sale) trade more
    const byTrading: DealAccount = {
      ...account({ ...deal, fees: [deal.fees[0]!, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 30, everyMonths: 3 } }] }, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 60, everyMonths: 3 } }] }] }),
      planWithin: [undefined, [{ on: "trading", from: 0, to: 1_000, unit: "ILS" }], [{ on: "trading", from: 1_000, to: null, unit: "ILS" }]],
    };
    expect(runSecurities({ ...base, deal: byTrading }, ctx).fees.fixed).toBeCloseTo(38 * 30 + 2 * 60, 6);
  });
});

describe("F-128 orders as the house's row places them", () => {
  const currency = { code: "USD", startRate: 3.7 };
  const abroad: SecuritiesInput = { ...base, fund: { kind: "foreign-fund", drag: { management: 0.0007 } }, market: { ...base.market, returnIn: "instrument", fxChange: 0.03 } };

  it("prices the amount now at month 0's rate, as the row does: a minimum in dollars at A-03 above zero", () => {
    const t = runSecurities({ ...abroad, tariff: { buy: { rate: 0.001, min: 5, in: "instrument" }, sell: { rate: 0.001, min: 5, in: "instrument" }, fx: 0.002, currency } }, ctx);
    const usd: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 5, currency: "USD" } }] }, { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002 } }] }] };
    const d = runSecurities({ ...abroad, tariff: { currency }, deal: account(usd) }, ctx);
    expect(d.fees.trade).toBeCloseTo(t.fees.trade, 6);
    expect(d.nominal).toBeCloseTo(t.nominal, 6);
  });

  it("a flat price for a small order: an order whose trade after it fits under its sum pays only that, a larger one the line (F-12)", () => {
    // 1,005 ₪ a month: 1,003 after the flat 2 ₪ is above 1,000, so the order pays the line's minimum of 10 ₪ on a trade of 995
    const plan = { ...base, goal: { amountNow: 0, monthly: 1_005, months: 24 } };
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0.001, min: 10, flatUpTo: { amount: 2, upTo: 1_000 } }, sell: { rate: 0.001, min: 10 } } }, ctx);
    const flat: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 10, flat: { amount: 2, upTo: 1_000 } } }], sale: [{ price: { kind: "action", rate: 0.001, min: 10 } }] }] };
    const d = runSecurities({ ...plan, deal: account(flat) }, ctx);
    expect(d.fees.trade).toBeCloseTo(t.fees.trade, 6);
    expect(d.nominal).toBeCloseTo(t.nominal, 6);
    // 1,001 ₪ a month: 999 after the flat price fits under it
    const small = { ...plan, goal: { amountNow: 0, monthly: 1_001, months: 24 } };
    expect(runSecurities({ ...small, deal: account(flat) }, ctx).nominal).toBeCloseTo(runSecurities({ ...small, tariff: { buy: { rate: 0.001, min: 10, flatUpTo: { amount: 2, upTo: 1_000 } }, sell: { rate: 0.001, min: 10 } } }, ctx).nominal, 6);
  });

  it("cash a step leaves waiting, converted already, is not converted again", () => {
    // free trades up to 400 ₪, 50 ₪ above: each month's 450 ₪, 445.5 after the conversion, buys 400 and leaves 45.5 in dollars
    const stepped: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: { kind: "free" } }], within: { on: "action", from: 0, to: 400, currency: "ILS" } },
        { base: { key: "trade" }, stages: [{ price: { kind: "perAction", amount: 50 } }], within: { on: "action", from: 400, to: null, currency: "ILS" } },
        { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.01 } }] },
      ],
    };
    const plan: SecuritiesInput = { ...abroad, goal: { amountNow: 0, monthly: 450, months: 12 }, market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 }, fund: { kind: "foreign-fund" }, tariff: { currency } };
    const r = runSecurities({ ...plan, deal: account(stepped) }, ctx);
    // the purchases convert only what was paid in; the sale converts what is left of it after the trades' charges
    expect(r.fees.trade).toBeGreaterThan(0);
    expect(r.fees.fx).toBeCloseTo(0.01 * 5_400 + 0.01 * (0.99 * 5_400 - r.fees.trade), 6);
  });

  it("an order by amount whose cash cannot pay the trade's minimum is not placed, and its cash waits for the next order", () => {
    // 8 ₪ a month against a minimum of 10 ₪: month 1's order is not placed; month 2's 16 ₪ buy 6 ₪ and pay the minimum; the sale is free
    const min: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 10 } }], sale: [{ price: { kind: "free" } }] }] };
    const plan: SecuritiesInput = { ...base, goal: { amountNow: 0, monthly: 8, months: 2 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" } };
    const r = runSecurities({ ...plan, deal: account(min) }, ctx);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(6, 9);
  });

  it("an order by amount whose cash is exactly the trade's minimum is not placed, as the row's is not", () => {
    // 10 ₪ a month against a minimum of 10 ₪: month 1's order is not placed; month 2's 20 ₪ buy 10 ₪ and pay the minimum
    const min: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 10 } }], sale: [{ price: { kind: "free" } }] }] };
    const plan: SecuritiesInput = { ...base, goal: { amountNow: 0, monthly: 10, months: 2 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" } };
    const d = runSecurities({ ...plan, deal: account(min) }, ctx);
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0.001, min: 10 }, sell: { rate: 0 } } }, ctx);
    expect(d.fees.trade).toBeCloseTo(10, 9);
    expect(d.nominal).toBeCloseTo(10, 9);
    expect(d.nominal).toBeCloseTo(t.nominal, 9);
  });

  it("the shekels of an order not placed wait unconverted, and the next order converts them once", () => {
    // 1% a conversion: month 1's 8 ₪, 7.92 after it, cannot pay the 10 ₪ minimum, so nothing is converted; month 2 converts the 16 ₪ at once
    const min: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 10 } }], sale: [{ price: { kind: "free" } }] },
        { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.01 } }] },
      ],
    };
    const plan: SecuritiesInput = { ...base, goal: { amountNow: 0, monthly: 8, months: 2 }, market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 }, fund: { kind: "foreign-fund" }, tariff: { currency: { code: "USD", startRate: 3.7 } } };
    const r = runSecurities({ ...plan, deal: account(min) }, ctx);
    const bought = 16 * 0.99 - 10;
    expect(r.fees.trade).toBeCloseTo(10, 9);
    // the purchase's conversion on the 16 ₪, and the sale's on what was bought
    expect(r.fees.fx).toBeCloseTo(0.16 + 0.01 * bought, 9);
  });

  it("an order that buys no unit is not counted among a month's orders", () => {
    // two months at 1,850 ₪ a unit: the amount now buys five units, and neither deposit buys one, so each month places one order
    const plan: SecuritiesInput = { ...base, goal: { amountNow: 10_000, monthly: 500, months: 2 }, wholeUnits: { price: 1_850 } };
    const steps: DealAccount = {
      ...account({ foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] }, { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.003 } }] }] }),
      planWithin: [[{ on: "count", from: 0, to: 1, unit: "actions" }], [{ on: "count", from: 1, to: null, unit: "actions" }]],
    };
    const low = account({ foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] }] });
    expect(runSecurities({ ...plan, deal: steps }, ctx).fees.trade).toBeCloseTo(runSecurities({ ...plan, deal: low }, ctx).fees.trade, 9);
  });
});

describe("F-128 at the edges, as the house's row (F-09, F-12, F-17)", () => {
  const flat: SecuritiesInput = { ...base, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund", drag: {} } };
  const usd = { code: "USD", startRate: 4 };
  const abroad: SecuritiesInput = { ...flat, market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 }, fund: { kind: "foreign-fund", drag: {} } };
  const minTen = (rate = 0) => ({ kind: "action" as const, rate, min: 10 });

  it("a sale's commission takes at most its proceeds: 15 ₪ buys 5 with a 10 ₪ minimum, and the sale of 5 pays 5", () => {
    const plan = { ...flat, goal: { amountNow: 15, monthly: 0, months: 2 } };
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0, min: 10 }, sell: { rate: 0, min: 10 } } }, ctx);
    const d = runSecurities({ ...plan, deal: account({ foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: minTen() }] }] }) }, ctx);
    expect(d.fees.trade).toBeCloseTo(15, 9);
    expect(d.nominal).toBeCloseTo(0, 9);
    expect(d.nominal).toBeCloseTo(t.nominal, 9);
  });

  it("a sale's conversion takes at most what it converts: 15 ₪ converts for 10 and buys 5, and converting the 5 back takes 5", () => {
    const plan = { ...abroad, goal: { amountNow: 15, monthly: 0, months: 2 } };
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0 }, fx: { rate: 0, min: 10 }, currency: usd } }, ctx);
    const d = runSecurities({ ...plan, tariff: { currency: usd }, deal: account({ foreign: false, fees: [{ base: { key: "fx" }, stages: [{ price: minTen() }] }] }) }, ctx);
    expect(d.fees.fx).toBeCloseTo(15, 9);
    expect(d.nominal).toBeCloseTo(0, 9);
    expect(d.nominal).toBeCloseTo(t.nominal, 9);
  });

  it("by amount, shekels whose conversion leaves nothing wait unconverted while a dividend held in dollars buys alone", () => {
    // 1,000 ₪ now and 5 ₪ a month, a 10 ₪ minimum on every conversion, no commission: month 2's 10 ₪ wait, since converting them for 10
    // leaves nothing, and the dividend's net buys alone; the two conversions are the amount now's and the sale's
    const plan: SecuritiesInput = { ...abroad, goal: { amountNow: 1_000, monthly: 5, months: 2 }, fund: { kind: "foreign-fund", drag: {}, domicile: "ireland", distribution: { yield: 0.06, perYear: 6 } } };
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0 }, fx: { rate: 0, min: 10 }, currency: usd } }, ctx);
    const d = runSecurities({ ...plan, tariff: { currency: usd }, deal: account({ foreign: false, fees: [{ base: { key: "fx" }, stages: [{ price: minTen() }] }] }) }, ctx);
    expect(d.fees.fx).toBeCloseTo(20, 9);
    expect(d.nominal).toBeCloseTo(t.nominal, 9);
  });

  it("by amount, the account's monthly fee the units cannot pay comes out of the cash waiting for the next order", () => {
    // 8 ₪ a month, a 10 ₪ minimum and 1 ₪ a month: month 1's order is not placed and its fee comes out of the 8 waiting
    const plan = { ...flat, goal: { amountNow: 0, monthly: 8, months: 3 } };
    const t = runSecurities({ ...plan, tariff: { buy: { rate: 0.001, min: 10 }, monthlyFee: 1 } }, ctx);
    const fees: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: minTen(0.001) }], sale: [{ price: { kind: "free" } }] }, { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 1, everyMonths: 1 } }] }] };
    const d = runSecurities({ ...plan, deal: account(fees) }, ctx);
    expect(d.fees.fixed).toBeCloseTo(3, 9);
    expect(d.nominal).toBeCloseTo(t.nominal, 9);
    expect(d.fees.fixed).toBeCloseTo(t.fees.fixed, 9);
  });
});

describe("F-128 the steps of a month's trading counted in units", () => {
  it("reads each month's trading at that month's unit price, in the run and in the key that settles the runs after it", () => {
    // up to 4 units a month at 0.1%, more at 0.3%; the unit's price is 100 ₪ in month 1 and grows 1% a month, 200 ₪ at the run's end
    const steps: DealAccount = {
      ...account({ foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] }, { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.003 } }] }] }),
      planWithin: [[{ on: "trading", from: 0, to: 4, unit: "units" }], [{ on: "trading", from: 4, to: null, unit: "units" }]],
    };
    const dc = dealCharges(steps, { currency: null, fxRate: () => 1, unitPrice: () => 200, unitPriceOfMonth: (m) => 100 * 1.01 ** (m - 1), gridOffset: 0, distributes: false, activity: () => ({ count: 1, trading: 0 }) });
    // 450 ₪ a month is above 4 units in the first months at their prices, 350 ₪ never is; at the end's price of 200 ₪ both would be below
    const key = (trading: number) => dc.activityKey(() => ({ count: 1, trading }), 12);
    expect(key(450)).not.toBe(key(350));
    expect(key(350)).toBe(key(1));
  });
});

describe("F-128 what the run reaches", () => {
  it("names the months each fee with a step was charged within it", () => {
    const steps: DealAccount = {
      ...account({ ...deal, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] }, { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.003 } }] }, ...deal.fees.slice(1)] }),
      planWithin: [[{ on: "count", from: 0, to: 1, unit: "actions" }], [{ on: "count", from: 1, to: null, unit: "actions" }]],
    };
    const r = runSecurities({ ...base, deal: steps }, ctx);
    expect(r.dealReach![1]).toEqual([1, 120]);
    expect(r.dealReach![0]).toHaveLength(118);
    // a fee with no step reaches nothing to mark
    expect(r.dealReach![2]).toEqual([]);
  });
});

describe("F-128 a deal row in the workbench", () => {
  const input = (deals: DealProvider[], fund: WorkbenchInput["fund"] = { kind: "israeli-fund", drag: { management: 0.001 } }): WorkbenchInput => ({
    goal: { amountNow: 10_000, monthly: 500, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.02 },
    fund,
    profile: {},
    instrumentClass: "etf_units",
    theta: 0.005,
    providers: [],
    deals,
  });
  const provider = (a: DealAccount): DealProvider => ({ id: "deal-a", name: "עסקה", providerClass: "broker", saved: "2026-11-21", account: () => a });

  it("has the lines its fees were charged on, adding up to its fees, and none names a deciding fee type", () => {
    const row = providerWorkbench(input([provider(account())]), ctx).rows[0]!;
    if (row.kind !== "compared") throw new Error("compared");
    expect(row.byType.map((x) => x.line).sort()).toEqual(["custody", "fixed", "trade"]);
    expect(row.byType.every((x) => x.cost === null)).toBe(true);
    expect(row.byType.reduce((a, x) => a + x.costBeforeTax, 0)).toBeCloseTo(row.byFee!.reduce((a, x) => a + x.costBeforeTax, 0), 6);
  });

  it("says the fund's price per unit is missing where a sum per unit cannot be measured", () => {
    const perUnit: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "perUnit", amount: 0.01 } }] }] };
    const wb = providerWorkbench(input([provider(account(perUnit))], { kind: "israeli-fund", sharePrice: 100, sharePriceCurrency: "EUR" }), ctx);
    expect(wb.rows[0]).toMatchObject({ kind: "not-comparable", reason: { code: "needs-share-price" } });
  });
});

describe("F-102 with BANK-35 on a deal's current account: the cap is compared with what a month is charged", () => {
  /** The deal with `fees` as its current account (F-102), after its trade fee, each charged within its steps (`planWithin`). */
  const withAccount = (fees: Deal["fees"], planWithin?: DealAccount["planWithin"]): DealAccount => ({
    ...account({ ...deal, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 5 } }] }, ...fees] }),
    currentAccount: fees.map((_, i) => i + 1),
    ...(planWithin ? { planWithin: [undefined, ...planWithin] } : {}),
  });
  const monthly = (amount: number): Deal["fees"][number] => ({ base: { name: "current_account" }, stages: [{ price: { kind: "sum", amount, everyMonths: 1 } }] });
  const flagged = (a: DealAccount) => runSecurities({ ...base, deal: a }, ctx).flags.filter((f) => f.code === "BANK-35");
  // up to 1,000 ₪ of trading a month, and above it
  const byTrading: DealAccount["planWithin"] = [[{ on: "trading", from: 0, to: 1_000, unit: "ILS" }], [{ on: "trading", from: 1_000, to: null, unit: "ILS" }]];

  it("a card above the cap for 0 to 2 actions is flagged on the cap's first month", () => {
    expect(flagged(withAccount([monthly(5.5)]))).toEqual([{ code: "BANK-35", month: 9 }]);
    expect(flagged(withAccount([monthly(5)]))).toEqual([]);
  });

  it("a card split by a month's trading is read at the step each month charges, never at the sum of its steps", () => {
    // 4 ₪ in each step: every month is charged 4, under the cap, though the steps add to 8
    expect(flagged(withAccount([monthly(4), monthly(4)], byTrading))).toEqual([]);
    // 4 ₪ up to 1,000 ₪ of trading and 6 above: the months of one 500 ₪ deposit are under the cap; the first month from the cap's start
    // charged 6 is the last, whose sale trades the whole holding
    expect(flagged(withAccount([monthly(4), monthly(6)], byTrading))).toEqual([{ code: "BANK-35", month: 120 }]);
  });

  it("never reads a current account within the plan's orders: its count of actions is the deal's pick (F-102)", () => {
    const byCount: DealAccount["planWithin"] = [[{ on: "count", from: 0, to: 1, unit: "actions" }], [{ on: "count", from: 1, to: null, unit: "actions" }]];
    expect(() => runSecurities({ ...base, deal: withAccount([monthly(4), monthly(6)], byCount) }, ctx)).toThrow(/F-102/);
  });
});
