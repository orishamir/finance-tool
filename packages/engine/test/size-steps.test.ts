// F-13: a conversion priced by its size (`size_tiers`, data-schema §3.6a item 3), each step a kind of its own: nothing, a flat price, a share off
// the line's price (on its minimum too where the list says so, F-116's reading), and a spread rate in that step. Expected figures worked by hand
// from the formulas (comments), with no return, fund cost or inflation; the dollar at 3.70 ₪.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { conversionCharges, convertedAtMost, convertFor, fxFee, saleConversion, type SizedConversion } from "../src/formulas/fees.ts";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { buildTariff, type WorkbenchInput } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const usd = 3.7;
const terms = { fxRate: usd };
const record = (id: string) => JSON.parse(readFileSync(new URL(`../../../data/fees/${id}.json`, import.meta.url), "utf8"));

// Discount's direct line as its price list prints it: 0.17%, minimum 6 $, maximum 1,055 $; up to 10 $ free, up to 100 $ half the price and its minimum
const discount: SizedConversion = {
  line: { rate: 0.0017, min: 6, max: 1_055, in: "instrument" },
  steps: [
    { upTo: 10, price: { kind: "exempt" } },
    { upTo: 100, price: { kind: "discount", off: 0.5, onMin: true } },
  ],
  in: "instrument",
};
// Mizrahi-Tefahot's internet line: 0.133%, minimum 5.4 $; up to 10 $ free, up to 50 $ a flat 2.85 $
const mizrahi: SizedConversion = {
  line: { rate: 0.00133, min: 5.4, max: 2_250, in: "instrument" },
  steps: [
    { upTo: 10, price: { kind: "exempt" } },
    { upTo: 50, price: { kind: "flat", amount: 2.85 } },
  ],
  in: "instrument",
};
// IBI's spread: 0.7% up to 15,000 $, 0.5% above
const ibiSpread: SizedConversion = { line: 0.007, steps: [{ upTo: 15_000, price: { kind: "rate", rate: 0.007 } }, { upTo: Infinity, price: { kind: "rate", rate: 0.005 } }], in: "instrument" };

describe("each kind of step (F-13)", () => {
  it("exempt: a conversion up to the top pays nothing, the top itself included", () => {
    // 30 ₪ is 8.11 $; 37 ₪ is exactly 10 $
    expect(fxFee(discount, 30, terms)).toBe(0);
    expect(fxFee(discount, 37, terms)).toBe(0);
  });

  it("a share off the line, on the minimum too: half of the 6 $ minimum, and above the top the full line", () => {
    // 200 ₪ (54.05 $): 0.085% is 0.17 ₪, the halved minimum 3 $ = 11.10 ₪; 400 ₪ (108.11 $): the minimum 6 $ = 22.20 ₪
    expect(fxFee(discount, 200, terms)).toBeCloseTo(11.1, 9);
    expect(fxFee(discount, 370, terms)).toBeCloseTo(11.1, 9);
    expect(fxFee(discount, 400, terms)).toBeCloseTo(22.2, 9);
  });

  it("a share off the line alone: its rate halves and its minimum stays where the list does not take it down", () => {
    // 10% with a minimum of 1 $ (3.70 ₪), half off up to 100 $: 50 ₪ pays max(3.70, 2.50) = 3.70; with the minimum halved, max(1.85, 2.50) = 2.50
    const line = { rate: 0.1, min: 1, in: "instrument" as const };
    const off = (onMin: boolean): SizedConversion => ({ line, steps: [{ upTo: 100, price: { kind: "discount", off: 0.5, onMin } }], in: "instrument" });
    expect(fxFee(off(false), 50, terms)).toBeCloseTo(3.7, 9);
    expect(fxFee(off(true), 50, terms)).toBeCloseTo(2.5, 9);
    // 300 ₪: the rate decides, 15 ₪ either way
    expect(fxFee(off(false), 300, terms)).toBeCloseTo(15, 9);
  });

  it("a flat price: a sum on each conversion in the step, in dollars at the rate of the conversion", () => {
    // 100 ₪ is 27.03 $: 2.85 $ = 10.545 ₪; 30 ₪ is in the free step below it; 200 ₪ (54.05 $) pays the line's minimum, 5.4 $ = 19.98 ₪
    expect(fxFee(mizrahi, 100, terms)).toBeCloseTo(10.545, 9);
    expect(fxFee(mizrahi, 30, terms)).toBe(0);
    expect(fxFee(mizrahi, 200, terms)).toBeCloseTo(19.98, 9);
  });

  it("a spread rate in that step: 0.7% up to 15,000 $, the top included, and 0.5% above", () => {
    // 37,000 ₪ (10,000 $): 259 ₪; 55,500 ₪ (15,000 $): 388.50 ₪; 74,000 ₪ (20,000 $): 370 ₪
    expect(fxFee(ibiSpread, 37_000, terms)).toBeCloseTo(259, 9);
    expect(fxFee(ibiSpread, 55_500, terms)).toBeCloseTo(388.5, 9);
    expect(fxFee(ibiSpread, 74_000, terms)).toBeCloseTo(370, 9);
  });

  it("a rate in a step over a line with bounds keeps the bounds", () => {
    const line = { line: { rate: 0.01, min: 2, in: "instrument" as const }, steps: [{ upTo: 100, price: { kind: "rate" as const, rate: 0.005 } }], in: "instrument" as const };
    // 370 ₪ (100 $): 0.5% is 1.85 ₪, under the 2 $ = 7.40 ₪ minimum
    expect(fxFee(line, 370, terms)).toBeCloseTo(7.4, 9);
  });

  it("a price whose steps charge a sum charges, a free step over a free line does not (F-61)", () => {
    expect(conversionCharges(discount)).toBe(true);
    expect(conversionCharges({ line: 0, steps: [{ upTo: 10, price: { kind: "exempt" } }], in: "instrument" })).toBe(false);
    expect(conversionCharges(ibiSpread)).toBe(true);
  });
});

describe("the shekels a purchase converts, the step read on the dollars bought (convertFor, convertedAtMost)", () => {
  it("prices the step the dollars bought fall in, the top included in the step below it", () => {
    // owed 30 ₪ (8.11 $): free; owed 37 ₪, exactly 10 $: still free ("עד 10$")
    expect(convertFor(30, discount, terms)).toEqual({ converted: 30, cost: 0, extra: 0 });
    expect(convertFor(37, discount, terms)).toEqual({ converted: 37, cost: 0, extra: 0 });
    // owed 37.50 ₪ (10.14 $): half price, c = 37.50 + 11.10 = 48.60
    expect(convertFor(37.5, discount, terms).converted).toBeCloseTo(48.6, 9);
    // owed 360 ₪ (97.30 $), under the 100 $ top, though the shekels converted, 371.10 ₪ (100.30 $), are over it: half price
    const under = convertFor(360, discount, terms);
    expect(under.converted).toBeCloseTo(371.1, 9);
    expect(under.cost).toBeCloseTo(11.1, 9);
    // owed 380 ₪ (102.70 $): the line, c = 380 + 22.20 = 402.20
    const past = convertFor(380, discount, terms);
    expect(past.converted).toBeCloseTo(402.2, 9);
    expect(past.cost).toBeCloseTo(22.2, 9);
  });

  it("where the step above is cheaper, buys just over the top where that takes fewer shekels, and keeps the rest", () => {
    // the top is 55,500 ₪ (15,000 $), in the 0.7% step; just over it is one cent more, 55,500.037 ₪, at 0.5%: 55,500.037 / 0.995 = 55,779.94 ₪
    const over = 55_500 + 0.01 * usd;
    // owed 55,150 ₪: at 0.7%, 55,150 / 0.993 = 55,538.77 ₪, fewer than just over the top
    expect(convertFor(55_150, 0, terms, ibiSpread)).toEqual({ converted: expect.closeTo(55_150 / 0.993, 6), cost: expect.closeTo(55_150 / 0.993 - 55_150, 6), extra: 0 });
    // owed 55,400 ₪: at 0.7% it would take 55,790.53 ₪; just over the top takes 55,779.94 ₪ and buys 100.04 ₪ more, kept in dollars
    const gap = convertFor(55_400, 0, terms, ibiSpread);
    expect(gap.converted).toBeCloseTo(over / 0.995, 6);
    expect(gap.cost).toBeCloseTo(over / 0.995 - over, 6);
    expect(gap.extra).toBeCloseTo(over - 55_400, 6);
    // owed exactly the top, 15,000 $: priced at 0.7% it takes 55,891.24 ₪, so the order buys just over it
    expect(convertFor(55_500, 0, terms, ibiSpread).converted).toBeCloseTo(over / 0.995, 6);
    // owed 56,000: 0.5%, c = 56,000 / 0.995
    expect(convertFor(56_000, 0, terms, ibiSpread).converted).toBeCloseTo(56_000 / 0.995, 6);
  });

  it("the most a cash's conversion buys counts a cheaper step below the whole cash, converting less than the cash", () => {
    // 380 ₪: all of it at half price buys 368.90 ₪ (99.70 $), under the top
    expect(convertedAtMost(380, discount, terms)).toEqual({ converted: 380, cost: expect.closeTo(11.1, 9), left: expect.closeTo(368.9, 9) });
    // 385 ₪: all of it would buy 373.90 ₪ at half price, over the top, or 362.80 ₪ at the line; 381.10 ₪ buy the top, 370 ₪ (100 $), the most
    expect(convertedAtMost(385, discount, terms)).toEqual({ converted: expect.closeTo(381.1, 9), cost: expect.closeTo(11.1, 9), left: expect.closeTo(370, 9) });
    expect(convertedAtMost(30, discount, terms)).toEqual({ converted: 30, cost: 0, left: 30 });
    // IBI's spread: 55,700 ₪ buy 55,310.10 ₪ at 0.7% (at 0.5%, 55,421.50 ₪ would be under the top); 56,000 ₪ buy 55,720 ₪ at 0.5%
    expect(convertedAtMost(55_700, 0, terms, ibiSpread).left).toBeCloseTo(55_700 * 0.993, 6);
    expect(convertedAtMost(56_000, 0, terms, ibiSpread).left).toBeCloseTo(56_000 * 0.995, 6);
  });
});

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
const run = (over: Partial<SecuritiesInput> & { goal: SecuritiesInput["goal"]; tariff: SecuritiesInput["tariff"] }): SecuritiesInput => ({
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "foreign-fund", drag: {} },
  profile: {},
  ...over,
});

describe("reading the steps from a price record (F-13, F-63)", () => {
  const disc = record("discount@2026-11-14");

  it("reads Discount's free step and half-price step over its direct line, and names their figures among the line's sources", () => {
    const built = buildTariff(wb(), { snapshot: disc, level: "list" }, disc);
    expect(built.tariff.fx).toEqual({ line: { rate: expect.closeTo(0.0017, 12), min: 6, max: 1_055, in: "instrument" }, steps: discount.steps, in: "instrument" });
    expect(built.linesUsed).toContain("discount-fx-conversion-direct");
  });

  it("at an average level the steps go with the bounds: a percentage alone (F-63)", () => {
    const avg = { ...disc, averages: [...(disc.averages ?? []), { line_id: "discount-fx-conversion-direct", level: "regulator_average", band: null, rate: { ...disc.lines.find((l: { id: string }) => l.id === "discount-fx-conversion-direct").rate, value: 0.15 } }] };
    expect(buildTariff(wb(), { snapshot: avg, level: "regulator_average" }, avg).tariff.fx).toBeCloseTo(0.0015, 12);
  });

  it("a europe fund in euros reads each dollar top and bound in shekels at the run's dollar rate, the one rate the run holds for the dollar", () => {
    // the euro at 4.00 ₪ and the dollar at 3.70 ₪: the 10 $ top is 37 ₪, the 100 $ top 370 ₪, the 6 $ minimum 22.20 ₪, whatever the euro does
    const built = buildTariff(wb({ currency: { code: "EUR", startRate: 4 }, fx: { USD: usd, EUR: 4 } }), { snapshot: disc, level: "list" }, disc);
    const fx = built.tariff.fx as SizedConversion;
    expect(fx.in).toBe("nis");
    expect(fx.steps.map((s) => s.upTo)).toEqual([expect.closeTo(37, 12), expect.closeTo(370, 12)]);
    expect(fx.line).toMatchObject({ min: expect.closeTo(22.2, 12), max: expect.closeTo(3_903.5, 9) });
    expect((fx.line as { in?: string }).in).toBeUndefined();
    // 36 ₪ is free; 38 ₪ half the minimum, 11.10 ₪; 400 ₪ the minimum, 22.20 ₪; the same with the euro at 5.00 ₪
    for (const eur of [{ fxRate: 4 }, { fxRate: 5 }]) {
      expect(fxFee(fx, 36, eur)).toBe(0);
      expect(fxFee(fx, 38, eur)).toBeCloseTo(11.1, 9);
      expect(fxFee(fx, 400, eur)).toBeCloseTo(22.2, 9);
    }
  });

  it("a monthly purchase in Discount's half-price step pays half the minimum, and the sale the full line", () => {
    // 300 ₪ a month is 81.08 $, in the half-price step: 3 $ = 11.10 ₪ each; 12 × 288.90 = 3,466.80 ₪ sold (936.97 $), at the minimum 22.20 ₪
    const fx = buildTariff(wb(), { snapshot: disc, level: "list" }, disc).tariff.fx;
    const r = runSecurities(run({ goal: { amountNow: 0, monthly: 300, months: 12 }, tariff: { buy: { rate: 0 }, fx, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.fees.fx).toBeCloseTo(12 * 11.1 + 22.2, 6);
    expect(r.nominal).toBeCloseTo(3_600 - 12 * 11.1 - 22.2, 6);
  });

  it("a sale above IBI's 15,000 $ pays the 0.5% spread on all of it, the monthly purchases below it 0.7%", () => {
    const ibi = record("ibi@2026-11-12");
    const built = buildTariff(wb(), { snapshot: ibi, level: "list", band: "מסחר בשווקים נוספים, מחוץ לארה״ב, לקנדה ולישראל" }, ibi);
    expect(built.tariff.fxSpread).toEqual({ line: expect.closeTo(0.007, 12), steps: [{ upTo: 15_000, price: { kind: "rate", rate: expect.closeTo(0.007, 12) } }, { upTo: Infinity, price: { kind: "rate", rate: expect.closeTo(0.005, 12) } }], in: "instrument" });
    // 74,000 ₪ (20,000 $): 0.5%, 370 ₪
    expect(saleConversion(built.tariff.fx, 74_000, terms, built.tariff.fxSpread)).toBeCloseTo(370, 9);
    // 3,000 ₪ a month (810.81 $) for two years at 0.7%: 21 ₪ each, 71,496 ₪ held; sold at 19,323 $, 0.5%: 357.48 ₪
    const r = runSecurities(run({ goal: { amountNow: 0, monthly: 3_000, months: 24 }, tariff: { buy: { rate: 0 }, fx: built.tariff.fx, fxSpread: built.tariff.fxSpread, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.fees.fx).toBeCloseTo(24 * 21 + 0.005 * 71_496, 6);
  });

  it("in whole units an order whose conversion falls in the free step converts at no fee", () => {
    // Mizrahi-Tefahot's internet line, a unit of 30 ₪ (8.11 $), 33 ₪ a month: each month converts 30 ₪, free (under 10 $), buys a unit and
    // leaves 3 ₪; at the free step's top the flat price would cost 2.85 $, so a larger cash still buys one unit at no fee. Sold: 360 ₪ (97.30 $),
    // above the flat price's 50 $, at the line's minimum 5.4 $ = 19.98 ₪
    const miz = record("mizrahi-tefahot@2026-11-12");
    const fx = buildTariff(wb(), { snapshot: miz, level: "list" }, miz).tariff.fx;
    expect(fx).toMatchObject({ steps: mizrahi.steps });
    const r = runSecurities(run({ goal: { amountNow: 0, monthly: 33, months: 12 }, wholeUnits: { price: 30 }, tariff: { buy: { rate: 0 }, fx, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.detail.monthlyOrders).toBe(12);
    expect(r.detail.cashLeft).toBeCloseTo(12 * 3, 6);
    expect(r.fees.fx).toBeCloseTo(19.98, 6);
  });

  it("in whole units the search starts from the most any conversion of the cash buys, a cheaper step below the whole cash included", () => {
    // a unit of 369 ₪ and 385 ₪ now at Discount: converting all 385 ₪ pays the line (22.20 ₪) and buys 362.80 ₪, less than the unit, but
    // converting 380.10 ₪ buys the unit's 369 ₪ (99.73 $) at half the minimum (11.10 ₪): the order buys it and 4.90 ₪ wait. Sold: 369 ₪, half
    // the minimum again
    const r = runSecurities(run({ goal: { amountNow: 385, monthly: 0, months: 1 }, wholeUnits: { price: 369 }, tariff: { buy: { rate: 0 }, fx: discount, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.detail.cashLeft).toBeCloseTo(385 - 380.1, 6);
    expect(r.fees.fx).toBeCloseTo(11.1 + 11.1, 6);
  });

  it("by amount the order converts as far as that buys the most, and the rest of the cash waits", () => {
    // 385 ₪ now at Discount: 381.10 ₪ buy 370 ₪ (100 $) at half the minimum, 3.90 ₪ wait; sold: 370 ₪ (100 $, the top), half the minimum
    const r = runSecurities(run({ goal: { amountNow: 385, monthly: 0, months: 1 }, tariff: { buy: { rate: 0 }, fx: discount, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.fees.fx).toBeCloseTo(11.1 + 11.1, 6);
    expect(r.nominal).toBeCloseTo(370 - 11.1 + 3.9, 6);
  });

  it("in whole units a conversion just over a top that buys more than the order keeps the rest in dollars", () => {
    // a unit of 55,400 ₪ and 56,000 ₪ now, IBI's spread alone: just over the top, 55,500.037 ₪ (15,000.01 $) bought at 0.5% for 55,779.94 ₪, the
    // unit and 100.04 ₪ in dollars; 220.06 ₪ wait unconverted. Sold with the dollars: 55,500.037 ₪, just over the top, at 0.5%
    const over = 55_500 + 0.01 * usd;
    const r = runSecurities(run({ goal: { amountNow: 56_000, monthly: 0, months: 1 }, wholeUnits: { price: 55_400 }, tariff: { buy: { rate: 0 }, fx: 0, fxSpread: ibiSpread, currency: { code: "USD", startRate: usd } } }), ctx);
    expect(r.detail.cashLeft).toBeCloseTo(56_000 - over / 0.995 + (over - 55_400), 6);
    expect(r.fees.fx).toBeCloseTo(over / 0.995 - over + 0.005 * over, 6);
  });
});
