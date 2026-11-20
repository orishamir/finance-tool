// docs/method.md §10.6, F-112's parts and F-123 to F-127: what the reading's charts read off a deal. Every expected figure is worked by
// hand from the formula.
import { describe, expect, it } from "vitest";
import { acrossDrop, costShare, coverFrom, dealPeriods, heldCrossover, heldLayers, idleMonth, priceParts, rateAt, type Deal } from "../src/index.ts";

const today = { y: 2026, m: 11 };
const USD = 3.264;
const rates = { USD };

/**
 * A securities account abroad: a commission of 0.25% with at least 39 $, at most 6,900 $ and at most 30% of the action; custody by the
 * value held, 0.199% a quarter up to 100,000 ₪, 0.15% up to 500,000 ₪ and 0.1% above; a fund's own 0.1% a year; 9 ₪ and 10 ₪ a month;
 * and an account fee of 20 ₪ a month from January 2027.
 */
const account: Deal = {
  foreign: true,
  fees: [
    { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.0025, min: 39, max: 6900, cap: 0.3, currency: "USD" } }] },
    { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.00199, everyMonths: 3 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
    { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0015, everyMonths: 3 } }], within: { on: "held", from: 100000, to: 500000, currency: "ILS" } },
    { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3 } }], within: { on: "held", from: 500000, to: null, currency: "ILS" } },
    { base: { name: "fund" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }] },
    { base: { name: "current_account" }, stages: [{ price: { kind: "sum", amount: 9, everyMonths: 1 } }] },
    { base: { name: "data" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
    { base: { key: "fixed_period" }, stages: [{ price: { kind: "free" }, until: { y: 2027, m: 1 } }, { price: { kind: "sum", amount: 20, everyMonths: 1 } }] },
  ],
};
const [now, later] = dealPeriods(account, today).periods as [never, never];

describe("F-112 a price's parts along the size", () => {
  it("gives the cap up to 130 $, the minimum up to 15,600 $, the rate, and the maximum above 2,760,000 $", () => {
    expect(priceParts({ kind: "action", rate: 0.0025, min: 39, max: 6900, cap: 0.3, currency: "USD" })).toEqual([
      { part: "cap", from: 0, to: 130 },
      { part: "min", from: 130, to: 15600 },
      { part: "rate", from: 15600, to: 2760000 },
      { part: "max", from: 2760000, to: null },
    ]);
  });

  it("reads a sum per action under a percent maximum as the cap up to sum / cap, then the sum", () => {
    // Excellence's 11 $ under 2%: the cap up to 550 $
    expect(priceParts({ kind: "perAction", amount: 11, cap: 0.02, currency: "USD" })).toEqual([
      { part: "cap", from: 0, to: 550 },
      { part: "sum", from: 550, to: null },
    ]);
    expect(priceParts({ kind: "perAction", amount: 11 })).toEqual([{ part: "sum", from: 0, to: null }]);
  });

  it("reads a sum per unit only with the unit's price: 1 cent a unit at 150 $ with at least 1 $ is the minimum up to 15,000 $", () => {
    expect(priceParts({ kind: "perUnit", amount: 0.01, min: 1, currency: "USD" })).toBeNull();
    expect(priceParts({ kind: "perUnit", amount: 0.01, min: 1, currency: "USD" }, 150)).toEqual([
      { part: "min", from: 0, to: 15000 },
      { part: "rate", from: 15000, to: null },
    ]);
  });

  it("is free throughout for a free price, and has no parts for a sum per period", () => {
    expect(priceParts({ kind: "free" })).toEqual([{ part: "free", from: 0, to: null }]);
    expect(priceParts({ kind: "sum", amount: 9, everyMonths: 1 })).toBeNull();
  });
});

describe("F-123 the share a cost is of its amount, and the layers of holding", () => {
  it("divides the cost by the amount", () => {
    expect(costShare(144, 18650)).toBeCloseTo(0.0077212, 6);
    expect(costShare(24, 0)).toBe(Infinity);
    expect(costShare(0, 0)).toBe(0);
  });

  it("puts each share at its rate in the share layer and the sums in the fixed layer", () => {
    // 60,000 ₪: custody 0.199% × 4 = 477.6 ₪, the fund 60 ₪, and 108 + 120 ₪
    const l = heldLayers(account, now, 60000);
    expect(l.map((x) => [x.fee, x.layer])).toEqual([
      [1, "share"],
      [4, "share"],
      [5, "fixed"],
      [6, "fixed"],
    ]);
    expect(l[0]!.cost).toBeCloseTo(477.6, 6);
  });

  it("puts a share whose minimum decides its charge in the fixed layer", () => {
    const d: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 40 } }] }] };
    const p = dealPeriods(d, today).periods[0]!;
    expect(heldLayers(d, p, 20000)[0]).toEqual({ fee: 0, cost: 160, layer: "fixed" });
    expect(heldLayers(d, p, 50000)[0]!.layer).toBe("share");
  });

  it("adds the rates where every fee is at its rate: 0.25% and the conversion's 0.0875% above 15,600 $", () => {
    const d: Deal = { foreign: true, fees: [account.fees[0]!, { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.000875, min: 5, max: 2475, currency: "USD" } }] }] };
    const p = dealPeriods(d, today).periods[0]!;
    expect(rateAt(d, p, { action: "trade", side: "buy" }, 20000 * USD, rates)).toBeCloseTo(0.003375, 9);
    // under 15,600 $ the minimum decides the commission
    expect(rateAt(d, p, { action: "trade", side: "buy" }, 10000 * USD, rates)).toBeNull();
  });

  it("adds the yearly shares of what is held step by step, leaving the sums out", () => {
    expect(rateAt(account, now, "held", 50000)).toBeCloseTo(0.00896, 9);
    expect(rateAt(account, now, "held", 200000)).toBeCloseTo(0.007, 9);
    expect(rateAt(account, now, "held", 800000)).toBeCloseTo(0.005, 9);
  });
});

describe("F-124 where the shares come to cost as much as the fixed sums", () => {
  it("is 228 ₪ over 0.896% today, and 468 ₪ over 0.896% once the account fee starts", () => {
    expect(heldCrossover(account, now)).toBeCloseTo(228 / 0.00896, 6);
    expect(heldCrossover(account, later)).toBeCloseTo(468 / 0.00896, 6);
  });

  it("is the step's bottom where the shares jump past the sums there", () => {
    // 0.01% a year up to 100,000 ₪ (10 ₪ at most), then 1%: 500 ₪ a year meet from the step's bottom
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0001, everyMonths: 12 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.01, everyMonths: 12 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 500, everyMonths: 12 } }] },
      ],
    };
    expect(heldCrossover(d, dealPeriods(d, today).periods[0]!)).toBe(100000);
  });

  it("is none with no sum, with no share, or where a share's maximum lets the sums pass it again", () => {
    const shares: Deal = { foreign: false, fees: [account.fees[4]!] };
    expect(heldCrossover(shares, dealPeriods(shares, today).periods[0]!)).toBeNull();
    const sums: Deal = { foreign: false, fees: [account.fees[5]!] };
    expect(heldCrossover(sums, dealPeriods(sums, today).periods[0]!)).toBeNull();
    // 0.4% a year with at most 50 ₪ a year: it passes 108 ₪ only where it is held to 50
    const capped: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.004, everyMonths: 12, max: 50 } }] }, account.fees[5]!] };
    expect(heldCrossover(capped, dealPeriods(capped, today).periods[0]!)).toBeNull();
  });
});

describe("F-125 a year just under and just over a drop", () => {
  it("sets 99,000 ₪ at 1,115 ₪ against 101,000 ₪ at 935 ₪", () => {
    const x = acrossDrop(account, now, 100000);
    expect(x.under.value).toBeCloseTo(99000, 6);
    expect(x.over.value).toBeCloseTo(101000, 6);
    // 99,000 × (0.796% + 0.1%) + 228 = 1,115.04; 101,000 × (0.6% + 0.1%) + 228 = 935
    expect(x.under.cost).toBeCloseTo(1115.04, 6);
    expect(x.over.cost).toBeCloseTo(935, 6);
  });
});

describe("F-126 a month with no action and nothing held", () => {
  it("costs the monthly sums: 19 ₪ today, 39 ₪ once the account fee starts", () => {
    expect(idleMonth(account, now)!.total).toBe(19);
    expect(idleMonth(account, later)!.total).toBe(39);
    expect(idleMonth(account, later)!.parts.map((p) => p.fee)).toEqual([5, 6, 7]);
  });

  it("says nothing where a sum is charged every quarter or a share has a minimum", () => {
    const quarter: Deal = { foreign: false, fees: [{ base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 30, everyMonths: 3 } }] }] };
    expect(idleMonth(quarter, dealPeriods(quarter, today).periods[0]!)).toBeNull();
    const min: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 40 } }] }] };
    expect(idleMonth(min, dealPeriods(min, today).periods[0]!)).toBeNull();
  });
});

describe("F-127 the smallest action whose charges reach a sum", () => {
  it("covers 20 ₪ from an action of 66.67 ₪, where 30% of it reaches 20 ₪", () => {
    const at = coverFrom(account, later, [0], "trade", "buy", 20, rates)!;
    expect(at).toBeCloseTo(20 / 0.3, 6);
  });

  it("is nothing where every action reaches the sum, and none where no action does", () => {
    const d: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, min: 30 } }] }] };
    const p = dealPeriods(d, today).periods[0]!;
    expect(coverFrom(d, p, [0], "trade", "buy", 20)).toBe(0);
    const capped: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, max: 10 } }] }] };
    expect(coverFrom(capped, dealPeriods(capped, today).periods[0]!, [0], "trade", "buy", 20)).toBeNull();
  });

  it("finds the amount past a flat price that ends above the sum", () => {
    // 25 ₪ for an action up to 1,000 ₪, then 0.5%: 20 ₪ is reached on every action up to 1,000 ₪, then again only from 4,000 ₪
    const d: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.005, flat: { amount: 25, upTo: 1000 } } }] }] };
    expect(coverFrom(d, dealPeriods(d, today).periods[0]!, [0], "trade", "buy", 20)).toBeCloseTo(4000, 4);
  });
});
