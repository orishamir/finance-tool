// F-13: a flat price for a small conversion (`flat_up_to` on a conversion line), read as a trade line reads it (F-12), in the line's own
// currency. Expected figures worked by hand from the formulas (comments), with no return, fund cost or inflation; the dollar at 3.70 ₪.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { convertFor, fxFee } from "../src/formulas/fees.ts";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { withFeeRate } from "../src/fees/materiality.ts";
import { buildTariff, type WorkbenchInput } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const usd = 3.7;
const terms = { fxRate: usd };
// a direct channel's conversion as Hapoalim prints it: 0.17%, minimum 5.7 $, maximum 2,300 $, up to 99 $ a flat 3.3 $
const line = { rate: 0.0017, min: 5.7, max: 2_300, in: "instrument" as const, flatUpTo: { amount: 3.3, upTo: 99 } };

const input = (over: Partial<SecuritiesInput> & { goal: SecuritiesInput["goal"] }): SecuritiesInput => ({
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "foreign-fund", drag: {} },
  tariff: { buy: { rate: 0 }, fx: line, currency: { code: "USD", startRate: usd } },
  profile: {},
  ...over,
});

describe("the conversion's fee (F-13)", () => {
  it("is the flat price up to the sum and the line above it, the sum in dollars at the rate of the trade", () => {
    // 99 $ = 366.30 ₪: 300 ₪ pays 3.3 $ = 12.21 ₪; 366.30 ₪ still the flat price; 400 ₪ pays the minimum 5.7 $ = 21.09 ₪ (0.17% is 0.68 ₪)
    expect(fxFee(line, 300, terms)).toBeCloseTo(12.21, 9);
    expect(fxFee(line, 366.3, terms)).toBeCloseTo(12.21, 9);
    expect(fxFee(line, 400, terms)).toBeCloseTo(21.09, 9);
    // at another rate the sum moves with it: at 3.00 ₪, 300 ₪ is 100 $, above the sum
    expect(fxFee(line, 300, { fxRate: 3 })).toBeCloseTo(17.1, 9);
  });
});

describe("the shekels a purchase in whole units converts (convertFor)", () => {
  it("settles a flat price before the iteration, and crosses the sum to the line where the flat price no longer fits", () => {
    // owed 350 ₪: c = 350 + 12.21 = 362.21 ≤ 366.30, the flat price
    expect(convertFor(350, line, terms)).toBeCloseTo(362.21, 9);
    // owed 360 ₪: 360 + 12.21 = 372.21 > 366.30, so the line: c = 360 + 21.09 = 381.09 (the minimum, 0.17% of 381 is 0.65 ₪)
    expect(convertFor(360, line, terms)).toBeCloseTo(381.09, 9);
    // a spread beside it: c = (350 + 12.21) / (1 − 0.001) = 362.5726
    expect(convertFor(350, line, terms, 0.001)).toBeCloseTo(362.21 / 0.999, 9);
    // nothing owed converts nothing; a bare percentage is the old iteration, c = owed / (1 − r)
    expect(convertFor(0, line, terms)).toBe(0);
    expect(convertFor(995, 0.005, terms)).toBeCloseTo(1_000, 9);
  });
});

describe("a run with a flat price for a small conversion (F-13)", () => {
  it("by amount: twelve purchases of 300 ₪ pay 3.3 $ each, and the sale of 3,600 ₪ pays the line", () => {
    // each month converts 300 ₪ (81.08 $): 12.21 ₪, 146.52 ₪ in the year; 3,453.48 ₪ held, sold, converted at the minimum 21.09 ₪
    const r = runSecurities(input({ goal: { amountNow: 0, monthly: 300, months: 12 } }), ctx);
    expect(r.fees.fx).toBeCloseTo(12 * 12.21 + 21.09, 6);
    expect(r.nominal).toBeCloseTo(3_600 - 12 * 12.21 - 21.09, 6);
    // the same plan without the flat price pays the minimum every month: 12 × 8.88 ₪ more
    const { flatUpTo: _, ...plainLine } = line;
    const before = runSecurities(input({ goal: { amountNow: 0, monthly: 300, months: 12 }, tariff: { buy: { rate: 0 }, fx: plainLine, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(before.fees.fx - r.fees.fx).toBeCloseTo(12 * (21.09 - 12.21), 6);
  });

  it("in whole units: an order whose dollars fit under the sum pays the flat price, a larger one the line", () => {
    // a unit of 350 ₪, 370 ₪ a month: converting all 370 ₪ would pay the minimum (21.09 ₪) and leave 348.91 ₪, less than a unit, but the
    // unit's 350 ₪ needs only 362.21 ₪ converted at the flat price, so month 1 buys it and 7.79 ₪ waits; every month the same, 12 units
    const flat = runSecurities(input({ goal: { amountNow: 0, monthly: 370, months: 12 }, wholeUnits: { price: 350 } }), ctx);
    expect(flat.detail.monthlyOrders).toBe(12);
    const sale = 12 * 350; // sold, converted at the line: 0.17% of 4,200 is 7.14 ₪, under the minimum 21.09 ₪
    expect(flat.fees.fx).toBeCloseTo(12 * 12.21 + 21.09, 6);
    expect(flat.detail.cashLeft).toBeCloseTo(12 * 7.79, 6);
    expect(flat.nominal).toBeCloseTo(12 * 370 - 12 * 362.21 + sale - 21.09, 6);
    // a unit of 360 ₪ no longer fits: each order converts 381.09 ₪ at the minimum; 400 a month buys one every month, 18.91 waits each
    const line2 = runSecurities(input({ goal: { amountNow: 0, monthly: 400, months: 12 }, wholeUnits: { price: 360 } }), ctx);
    expect(line2.detail.monthlyOrders).toBe(12);
    expect(line2.fees.fx).toBeCloseTo(12 * 21.09 + 21.09, 6);
  });

  it("a rate of one's own over the line keeps its flat price: a typed 0.1% never makes a small conversion dearer (F-13, F-61)", () => {
    const plan = { run: "runSecurities" as const, input: input({ goal: { amountNow: 0, monthly: 300, months: 12 } }) };
    const changed = withFeeRate(plan, "fx", 0.001);
    const fx = changed.run === "runSecurities" ? changed.input.tariff.fx : undefined;
    expect(fx).toEqual({ rate: 0.001, min: 5.7, max: 2_300, in: "instrument", flatUpTo: { amount: 3.3, upTo: 99 } });
    // 300 ₪ at 3.70: 12.21 ₪ at the list and 12.21 ₪ with the typed rate; without the flat price the 5.7 $ minimum would be 21.09 ₪
    expect(fxFee(fx, 300, terms)).toBeCloseTo(12.21, 9);
    expect(fxFee(line, 300, terms)).toBeCloseTo(12.21, 9);
    // above the sum the typed rate prices it: 1,000 ₪ (270 $) pays max(0.1% = 1 ₪, 21.09 ₪)
    expect(fxFee(fx, 1_000, terms)).toBeCloseTo(21.09, 9);
    if (changed.run === "runSecurities") expect(runSecurities(changed.input, ctx).fees.fx).toBeCloseTo(runSecurities(plan.input, ctx).fees.fx, 9);
  });
});

describe("reading the line from a price record (F-13, F-63)", () => {
  const hapoalim = JSON.parse(readFileSync(new URL("../../../data/fees/hapoalim@2026-10-31.json", import.meta.url), "utf8"));
  const wb = (over: Partial<WorkbenchInput> = {}): WorkbenchInput => ({
    goal: { amountNow: 0, monthly: 300, months: 12 },
    market: { grossReturn: 0, inflation: 0 },
    fund: { kind: "foreign-fund", drag: {} },
    profile: {},
    instrumentClass: "foreign_securities",
    currency: { code: "USD", startRate: usd },
    fx: { USD: usd },
    theta: 0.005,
    providers: [],
    channel: "direct",
    ...over,
  });
  const vo = (value: number, unit: string) => ({ value, unit, source: { url: "https://example.org/tariff.pdf", title: "t", publisher: "p", strength: "institution" }, checked: "2026-11-12", effective_from: null, effective_to: null, tax_year: null, update_rule: "provider-set", rule_ids: [], state: "sourced" });
  const withFlat = (amount: ReturnType<typeof vo>, upTo: ReturnType<typeof vo>) => ({
    ...hapoalim,
    lines: hapoalim.lines.map((l: { id: string }) => (l.id === "hapoalim-fx-conversion-direct" ? { ...l, flat_up_to: { amount, up_to: upTo } } : l)),
  });

  it("keeps the flat price in dollars beside the line's dollar bounds, and names its sources", () => {
    const snap = withFlat(vo(3.3, "usd"), vo(99, "usd"));
    const built = buildTariff(wb(), { snapshot: snap, level: "list" }, snap);
    expect(built.tariff.fx).toEqual({ rate: expect.closeTo(0.0017, 12), min: 5.7, max: 2_300, in: "instrument", flatUpTo: { amount: 3.3, upTo: 99 } });
    expect(built.linesUsed).toContain("hapoalim-fx-conversion-direct");
    // at an average level the line is a percentage with no bounds and no flat price (F-63)
    const avg = { ...snap, averages: [{ line_id: "hapoalim-fx-conversion-direct", level: "regulator_average", band: null, rate: vo(0.15, "pct_of_trade") }] };
    expect(buildTariff(wb(), { snapshot: avg, level: "regulator_average" }, avg).tariff.fx).toBeCloseTo(0.0015, 12);
  });

  it("refuses a flat price in shekels beside bounds in dollars: one line holds one currency", () => {
    const snap = withFlat(vo(12, "nis"), vo(366, "nis"));
    expect(() => buildTariff(wb(), { snapshot: snap, level: "list" }, snap)).toThrow(/different units/);
  });
});
