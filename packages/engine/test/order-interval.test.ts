// F-133 The order interval: the plan's purchases placed every k months, the deposits between them waiting in shekels and earning nothing,
// each order at the regular lines; the workbench tries every way at k of 1, 2, 3, 4, 6 and 12 and keeps the one that leaves the most, the
// smaller k on a tie. The expected figures are worked from the plans below by hand.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feesSnapshot, type ValueObject } from "@finance-tool/schema";
import { intervalChosen, intervalWays, providerWorkbench, runSecurities, waitingReal, type ComparedProvider, type Deal, type DealProvider, type ProviderWorkbench, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8")) as Record<string, unknown>;
const row = (wb: ProviderWorkbench, id?: string): ComparedProvider => {
  const r = id ? wb.rows.find((x) => x.id === id) : wb.rows[0];
  if (!r || r.kind !== "compared") throw new Error(`not compared: ${JSON.stringify(r && "reason" in r ? r.reason : r)}`);
  return r;
};

const base: SecuritiesInput = {
  goal: { amountNow: 0, monthly: 100, months: 6 },
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "israeli-fund", drag: {} },
  tariff: {},
  profile: {},
};

describe("the run at an order interval (F-133)", () => {
  it("places an order in the months the interval divides, each paying its minimum once", () => {
    // 100 ₪ a month for 7 months at no return, a commission of 0 with a 10 ₪ minimum: monthly, 7 orders of 100 buy 90 each (630, 70 in
    // commissions); every 3 months, 2 orders of 300 buy 290 each, and month 7's 100 waits to the sale (680, 20)
    const tariff = { buy: { rate: 0, min: 10 } };
    const seven = { ...base, goal: { amountNow: 0, monthly: 100, months: 7 } };
    const monthly = runSecurities({ ...seven, tariff }, ctx);
    const every3 = runSecurities({ ...seven, tariff, way: { orderEvery: 3 } }, ctx);
    expect(monthly.fees.trade).toBeCloseTo(70, 9);
    expect(monthly.nominal).toBeCloseTo(630, 9);
    expect(every3.fees.trade).toBeCloseTo(20, 9);
    expect(every3.nominal).toBeCloseTo(680, 9);
    expect(every3.formulas).toContain("F-133");
    expect(monthly.formulas).not.toContain("F-133");
  });

  it("places no order in the month of the sale: what waits then is part of what is left, with no fee and no tax", () => {
    // 5 months every 4: an order in month 4 (400 buys 390); month 5's 100 waits to the sale, 490 in all
    const r = runSecurities({ ...base, goal: { amountNow: 0, monthly: 100, months: 5 }, tariff: { buy: { rate: 0, min: 10 } }, way: { orderEvery: 4 } }, ctx);
    expect(r.fees.trade).toBeCloseTo(10, 9);
    expect(r.nominal).toBeCloseTo(490, 9);
    // 6 months every 3, the fund up 1% a month: an order in month 3 alone, never in month 6, the month of the sale. Month 3 buys 300 and
    // pays 10, 290 grown four months, 290 × 1.01^4 = 301.78, a gain of 11.78 taxed at 25%; months 4 to 6's 300 wait, 598.84 in all
    const up = runSecurities({ ...base, market: { grossReturn: 1.01 ** 12 - 1, inflation: 0 }, tariff: { buy: { rate: 0, min: 10 } }, way: { orderEvery: 3 } }, ctx);
    expect(up.fees.trade).toBeCloseTo(10, 9);
    expect(up.nominal).toBeCloseTo(300 + 290 * 1.01 ** 4 - 0.25 * (290 * 1.01 ** 4 - 290), 9);
  });

  it("buys the amount now at once, as every month does", () => {
    // 1,000 now and 100 a month for 3 months, every 2: the amount now buys 990 in month 1, months 1 and 2's deposits 190 in month 2, and
    // month 3's 100 waits to the sale
    const r = runSecurities({ ...base, goal: { amountNow: 1_000, monthly: 100, months: 3 }, tariff: { buy: { rate: 0, min: 10 } }, way: { orderEvery: 2 } }, ctx);
    expect(r.fees.trade).toBeCloseTo(20, 9);
    expect(r.nominal).toBeCloseTo(1_280, 9);
  });

  it("prices an order placed every few months at the regular line, never the standing order's", () => {
    // 7 months, a standing order at a 2 ₪ minimum, the regular trade at 10 ₪: monthly 7 × 2 = 14; every 3 months 2 × 10 = 20
    const tariff = { buy: { rate: 0, min: 10 }, buyStanding: { rate: 0, min: 2 } };
    const seven = { ...base, goal: { amountNow: 0, monthly: 100, months: 7 } };
    expect(runSecurities({ ...seven, tariff }, ctx).fees.trade).toBeCloseTo(14, 9);
    expect(runSecurities({ ...seven, tariff, way: { orderEvery: 3 } }, ctx).fees.trade).toBeCloseTo(20, 9);
  });

  it("counts what the waiting deposits missed, as whole units count their waiting cash (F-91's W)", () => {
    // 100 a month for 3 months, the fund up 1% a month, no fee, every 2 months: month 1's deposit waits through the month's 1% and is carried
    // through months 2 and 3, 100 × 0.01 × 1.01²; month 3's waits through its own 1%, 100 × 0.01: W = 1.0201 + 1 = 2.0201. Month 2 buys 200 at
    // 1.01, worth 200 × 1.01² = 204.02 at the end, 25% of its gain of 4.02 taxed (TXS-09, no inflation), and month 3's 100 is left as it is:
    // 303.015. Monthly: 100 × (1.01³ + 1.01² + 1.01) = 306.0401, less 25% of 6.0401: 304.530075
    const up = { ...base, goal: { amountNow: 0, monthly: 100, months: 3 }, market: { grossReturn: 1.01 ** 12 - 1, inflation: 0 } };
    const every2 = runSecurities({ ...up, way: { orderEvery: 2 } }, ctx);
    expect(every2.nominal).toBeCloseTo(303.015, 9);
    expect(every2.waitingCarried).toBeCloseTo(2.0201, 9);
    expect(runSecurities(up, ctx).nominal).toBeCloseTo(304.530075, 9);
    expect(runSecurities(up, ctx).waitingCarried).toBeUndefined();
  });

  it("lets a distribution's net wait for the next order rather than place an order of its own", () => {
    // 1,000 now, a payout of 12% a year paid monthly (1% of what is held), no tax on it (a taxable fund pays its own), every 3 months for 4
    // months: the first two months' payouts wait, month 3's comes after its order and waits to the sale with month 4's, so the trades are the
    // amount now and the month-3 order alone
    const fund = { kind: "money-market-taxable" as const, drag: {}, distribution: { yield: 0.12, perYear: 12 } };
    const r = runSecurities({ ...base, goal: { amountNow: 1_000, monthly: 100, months: 4 }, fund, tariff: { buy: { rate: 0, min: 1 } }, way: { orderEvery: 3 } }, ctx);
    expect(r.fees.trade).toBeCloseTo(2, 9);
  });

  it("with no monthly deposit, places an order every few months for the payouts that wait", () => {
    // 1,000 now and nothing a month, the same payout, for 7 months every 3: orders in months 3 and 6 spend the payouts waiting, none in month
    // 7, the month of the sale; with a 1 ₪ minimum, 3 trades with the amount now. Monthly, each of the 7 payouts is its own order: 8
    const fund = { kind: "money-market-taxable" as const, drag: {}, distribution: { yield: 0.12, perYear: 12 } };
    const plan = { ...base, goal: { amountNow: 1_000, monthly: 0, months: 7 }, fund, tariff: { buy: { rate: 0, min: 1 } } };
    expect(runSecurities({ ...plan, way: { orderEvery: 3 } }, ctx).fees.trade).toBeCloseTo(3, 9);
    expect(runSecurities(plan, ctx).fees.trade).toBeCloseTo(8, 9);
  });

  it("flags the open tax on the exchange gain of fund currency that waits at a house that is not a bank (TX2 OQ4)", () => {
    // a US fund in dollars paying out four times a year: every 3 months its net waits in dollars for the next order
    const usd = {
      ...base,
      goal: { amountNow: 10_000, monthly: 100, months: 24 },
      market: { grossReturn: 0.05, inflation: 0.02, returnIn: "instrument" as const, fxChange: 0.01 },
      fund: { kind: "foreign-fund" as const, drag: {}, domicile: "us" as const, distribution: { yield: 0.02, perYear: 4 } },
      tariff: { currency: { code: "USD", startRate: 3.7 } },
    };
    const codes = (i: SecuritiesInput) => runSecurities(i, ctx).flags.map((f) => f.code);
    expect(codes({ ...usd, memberKind: "non-bank", way: { orderEvery: 3 } })).toContain("TX2-OQ4");
    expect(codes({ ...usd, broker: "foreign", memberKind: "non-bank", way: { orderEvery: 3 } })).toContain("TX2-OQ4");
    // at a bank the balance is a deposit, its exchange gain exempt (TX2-04's reading); monthly, the net is reinvested in its month
    expect(codes({ ...usd, memberKind: "bank", way: { orderEvery: 3 } })).not.toContain("TX2-OQ4");
    expect(codes({ ...usd, memberKind: "non-bank" })).not.toContain("TX2-OQ4");
  });

  it("refuses an interval with several orders a month (A-28), and an interval that is not one of the six", () => {
    expect(() => runSecurities({ ...base, ordersPerMonth: 2, way: { orderEvery: 3 } }, ctx)).toThrow(/F-133/);
    expect(() => runSecurities({ ...base, way: { orderEvery: 5 as 4 } }, ctx)).toThrow(/F-133/);
  });
});

describe("the ways the workbench tries (F-133)", () => {
  it("each way at each interval, monthly first; a way whose recurring plan buys by amount is not tried again above monthly", () => {
    const ways = [{ units: { price: 300, monthlyByAmount: true } }, { units: { price: 300 } }];
    const [own, units] = intervalWays(ways, { monthly: 500, months: 120, paysOut: false });
    expect(own).toEqual([ways[0]]);
    expect(units![0]).toEqual(ways[1]);
    expect(units!.slice(1).map((w) => w.orderEvery)).toEqual([2, 3, 4, 6, 12]);
    expect(units!.every((w) => !w.units?.monthlyByAmount)).toBe(true);
  });
  it("monthly alone with no monthly deposit and no payout, with several orders a month, and the person's own interval alone where given", () => {
    expect(intervalWays([{}], { monthly: 0, months: 120, paysOut: false })).toEqual([[{}]]);
    expect(intervalWays([{}], { monthly: 500, months: 120, paysOut: false, behaviour: { ordersPerMonth: 2 } })).toEqual([[{}]]);
    expect(intervalWays([{}], { monthly: 500, months: 120, paysOut: false, behaviour: { orderEvery: 6 } })).toEqual([[{ orderEvery: 6 }]]);
  });
  it("at a given interval above a month, a way whose recurring plan buys by amount is not tried, and the house's other way is", () => {
    const ways = [{ units: { price: 300, monthlyByAmount: true } }, { units: { price: 300 } }];
    expect(intervalWays(ways, { monthly: 500, months: 120, paysOut: false, behaviour: { orderEvery: 3 } })).toEqual([[{ units: { price: 300 }, orderEvery: 3 }]]);
  });
  it("every interval with no monthly deposit where the fund pays out, since its net waits for the next order", () => {
    expect(intervalWays([{}], { monthly: 0, months: 120, paysOut: true })[0]!.map((w) => w.orderEvery ?? 1)).toEqual([1, 2, 3, 4, 6, 12]);
  });
  it("no interval of the plan's months or more, which would place no order before the sale", () => {
    expect(intervalWays([{}], { monthly: 200, months: 12, paysOut: false })[0]!.map((w) => w.orderEvery ?? 1)).toEqual([1, 2, 3, 4, 6]);
    expect(intervalWays([{}], { monthly: 200, months: 4, paysOut: false })[0]!.map((w) => w.orderEvery ?? 1)).toEqual([1, 2, 3]);
  });
});

describe("which interval a way takes (F-133)", () => {
  // a run as the choice reads it: its real value after tax and the tax it paid, at an index of 1
  const at = (orderEvery: 1 | 2 | 3 | 4 | 6 | 12, real: number, tax: number) =>
    ({ way: orderEvery === 1 ? {} : { orderEvery }, run: { real, taxDuring: 0, taxAtExit: tax, nominal: real, exitMonth: 12, series: [{ month: 12, index: 1 }] } }) as unknown as Parameters<typeof intervalChosen>[0][number];
  it("the interval that leaves the most before tax, though another leaves more after tax (G-20)", () => {
    // monthly leaves 10,000 before tax; every 3 months 10,040 before tax, and more after tax too
    expect(intervalChosen([at(1, 9_000, 1_000), at(3, 9_100, 940)])).toBe(1);
    // every 6 months 10,060 before tax though less after tax than every 3 months
    expect(intervalChosen([at(1, 9_000, 1_000), at(3, 9_100, 940), at(6, 9_050, 1_010)])).toBe(2);
    // every 2 months more after tax alone: 9,950 before tax, under monthly
    expect(intervalChosen([at(1, 9_000, 1_000), at(2, 9_050, 900)])).toBe(0);
  });
  it("the smaller interval on a tie, within a part in a billion", () => {
    expect(intervalChosen([at(1, 9_000, 1_000), at(2, 9_100, 1_000), at(4, 9_200, 1_000), at(12, 9_150, 1_000)])).toBe(2);
    expect(intervalChosen([at(1, 9_000, 1_000), at(2, 9_200, 1_000), at(4, 9_100, 1_100)])).toBe(1);
    expect(intervalChosen([at(1, 9_000, 1_000), at(3, 9_000, 1_000 + 1e-6)])).toBe(0);
  });
});

describe("a fund bought abroad with no unit price at Psagot (F-133, F-63)", () => {
  // the person typed it: no unit price, so it is bought by amount; on a European exchange, Psagot's 0.15% with a 15 EUR minimum an order
  const psagot = read("fees/psagot@2026-11-04.json");
  const input = (monthly: number, orderEvery?: 1): WorkbenchInput => ({
    goal: { amountNow: 30_000, monthly, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.02, returnIn: "instrument", fxChange: 0 },
    fund: { kind: "foreign-fund", drag: { management: 0.002 }, domicile: "ireland" },
    profile: {},
    instrumentClass: "foreign_securities",
    currency: { code: "EUR", startRate: 3.9 },
    fx: { EUR: 3.9, USD: 3.6 },
    listing: "europe",
    theta: 0.005,
    providers: [{ snapshot: psagot, level: "list", band: "מניות ו-ETF הנסחרות בבורסות אירופה" }],
    ...(orderEvery ? { behaviour: { orderEvery } } : {}),
  });

  it("₪30,000 now and ₪300 a month for 10 years: bought every few months, it leaves clearly more than monthly", () => {
    const best = row(providerWorkbench(input(300), ctx));
    const monthly = row(providerWorkbench(input(300, 1), ctx));
    expect(monthly.way.orderEvery).toBe(1);
    expect(best.way.orderEvery).toBeGreaterThan(1);
    // monthly, each order of about 300 ₪ pays the 15 EUR minimum (58.5 ₪): 120 of them, 7,020 ₪. Every 12 months, 10 orders of the year's
    // deposits (about 3,600 ₪, 0.15% of which is under the minimum) pay 585 ₪: 6,435 ₪ less. A year's deposits wait 5.5 months on average,
    // which at 7% misses at most 3,600 × 1.22 × 0.07 × 5.5 / 12 ≈ 141 ₪ a year, 1,410 ₪ over the plan, carried at most to twice that: the
    // best interval leaves at least 6,435 − 2,820 = 3,615 ₪ more, in the shekels of the horizon, about 2,960 ₪ in today's (I_T = 1.22),
    // less the tax on the part of it that is gain. So above 2,000 ₪ of today's money
    expect(best.real - monthly.real).toBeGreaterThan(2_000);
    expect(best.run.fees.trade).toBeLessThan(monthly.run.fees.trade / 3);
    // the deposits waited: what they missed is its own part (F-91), apart from the account's fees
    expect(waitingReal(best.run)!).toBeGreaterThan(0);
    // F-61's split is by what each line paid, carried (F-63): with the waiting cash, the lines add up to the account's cost but for a small rest
    const rest = best.horizonCostBeforeTax - best.byType.reduce((s, t) => s + t.costBeforeTax, 0) - waitingReal(best.run)!;
    expect(Math.abs(rest)).toBeLessThan(0.05 * best.horizonCostBeforeTax);
    // year one is run on the interval chosen at the horizon
    expect(best.yearOneCost.value).not.toBeCloseTo(monthly.yearOneCost.value as number, 0);
  });

  it("₪5,000 a month: the minimum still binds, so a longer interval gains, but a small share of what is left", () => {
    // 0.15% of a 5,000 ₪ order is 7.5 ₪, under the 58.5 ₪ minimum: monthly pays at most 120 × (58.5 − 7.5) = 6,120 ₪ more than the rate
    // alone would, 5,016 ₪ in today's money, which grown with the fund stays under 1% of the about 730,000 ₪ left. The waiting costs the
    // gain back fast: 5,000 ₪ waiting a month misses 28 ₪ against the 58.5 ₪ an order saves, so only a short interval pays
    const best = row(providerWorkbench(input(5_000), ctx));
    const monthly = row(providerWorkbench(input(5_000, 1), ctx));
    expect(best.real).toBeGreaterThanOrEqual(monthly.real);
    expect((best.real - monthly.real) / monthly.real).toBeLessThan(0.01);
    expect(best.way.orderEvery).toBeLessThan(12);
  });
});

describe("monthly where no order pays a minimum, and on a tie (F-133)", () => {
  // no fee but a trade line of 0, no return, no inflation: every interval leaves exactly what was paid in
  const src = { url: "https://example.test/tariff", title: "fixture tariff", publisher: "fixture", strength: "institution" as const };
  const vo = (value: number, unit: ValueObject["unit"]): ValueObject => ({ value, unit, source: src, checked: "2026-10-23", effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced" });
  const free = feesSnapshot.parse({
    id: "broker-free",
    provider: { name_he: "broker-free", class: "broker", regulator: "ISA", tase_member: true, protection_rule_ids: [] },
    tariff: { url: "https://example.test/tariff", title: "fixture", published: "2026-10-01", format: "pdf" },
    snapshot: "2026-10-23",
    missing: false,
    missing_reason: null,
    lines: [{ id: "free-trade", base: "trade", applies_to: ["etf_units"], level: "list", rate: vo(0, "pct_of_trade"), min: null, max: null, period: null, channel: null, band: null, statement_code: null, names: { tariff: ["free-trade"] } }],
    averages: [],
    minimums: { account_opening: null },
    notice_rule_ids: [],
  });
  const cheap = feesSnapshot.parse({ ...free, id: "broker-cheap", lines: [{ ...free.lines[0]!, id: "cheap-trade", rate: vo(0.1, "pct_of_trade"), min: vo(5, "nis_per_trade") }] });
  it("₪5,000 a month where 0.1% of every order is above its 5 ₪ minimum: monthly leaves the most", () => {
    const r = row(providerWorkbench({ goal: { amountNow: 30_000, monthly: 5_000, months: 120 }, market: { grossReturn: 0.07, inflation: 0.02 }, fund: { kind: "israeli-fund", drag: {} }, profile: {}, instrumentClass: "etf_units", theta: 0.005, providers: [{ snapshot: cheap, level: "list" }] }, ctx));
    expect(r.way.orderEvery).toBe(1);
  });
  it("leaves the same at every interval, and is priced monthly", () => {
    const input: WorkbenchInput = {
      goal: { amountNow: 1_000, monthly: 333.33, months: 120 },
      market: { grossReturn: 0, inflation: 0 },
      fund: { kind: "israeli-fund", drag: {} },
      profile: {},
      instrumentClass: "etf_units",
      theta: 0.005,
      providers: [{ snapshot: free, level: "list" }],
    };
    const r = row(providerWorkbench(input, ctx));
    for (const k of [2, 3, 4, 6, 12] as const) expect(row(providerWorkbench({ ...input, behaviour: { orderEvery: k } }, ctx)).real).toBeCloseTo(r.real, 6);
    expect(r.way.orderEvery).toBe(1);
  });
});

describe("a deal account buys every few months too (F-133, F-128)", () => {
  // 0.1% a trade with at least 30 ₪, on 300 ₪ a month: a monthly order pays a tenth of its deposit
  const deal: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 30 } }] }] };
  const provider: DealProvider = { id: "deal-a", name: "עסקה", providerClass: "broker", saved: "2026-11-21", account: () => ({ deal, start: { y: 2026, m: 11 }, rates: {} }) };
  const input = (orderEvery?: 1): WorkbenchInput => ({
    goal: { amountNow: 10_000, monthly: 300, months: 120 },
    market: { grossReturn: 0.07, inflation: 0.02 },
    fund: { kind: "israeli-fund", drag: { management: 0.001 } },
    profile: {},
    instrumentClass: "etf_units",
    channel: "direct",
    theta: 0.005,
    providers: [],
    deals: [provider],
    ...(orderEvery ? { behaviour: { orderEvery } } : {}),
  });
  it("prices the deal on the interval that leaves the most, with fewer orders", () => {
    const best = row(providerWorkbench(input(), ctx));
    const monthly = row(providerWorkbench(input(1), ctx));
    expect(best.way.orderEvery).toBeGreaterThan(1);
    expect(best.real).toBeGreaterThan(monthly.real);
    // monthly: the amount now, 120 deposits and the sale pay at least 30 ₪ each; every k months, 120 / k orders of the deposits
    const orders = 2 + 120 / best.way.orderEvery;
    expect(best.run.fees.trade).toBeLessThan(monthly.run.fees.trade);
    expect(best.run.fees.trade).toBeGreaterThanOrEqual(30 * orders - 1e-9);
    // the deal's fees are carried as its lines, and the waiting cash is apart from them
    expect(best.byFee!.length).toBe(1);
    expect(waitingReal(best.run)!).toBeGreaterThan(0);
  });
});

