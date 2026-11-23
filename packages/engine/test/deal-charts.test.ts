// docs/method.md §10.6, F-112's parts and F-123 to F-127: what the reading's charts read off a deal. Every expected figure is worked by
// hand from the formula.
import { describe, expect, it } from "vitest";
import { acrossDrop, costShare, coverFrom, dealPeriods, heldCrossover, idleMonth, priceParts, rateAt, type Deal } from "../src/index.ts";

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

describe("F-123 the share a cost is of its amount, and the rate where every fee is at its rate", () => {
  it("divides the cost by the amount", () => {
    expect(costShare(144, 18650)).toBeCloseTo(0.0077212, 6);
    expect(costShare(24, 0)).toBe(Infinity);
    expect(costShare(0, 0)).toBe(0);
  });

  it("has no rate on what is held where a share's minimum decides its charge: 0.1% a quarter with at least 40 ₪ up to 40,000 ₪", () => {
    const d: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 40 } }] }] };
    const p = dealPeriods(d, today).periods[0]!;
    expect(rateAt(d, p, "held", 20000)).toBeNull();
    expect(rateAt(d, p, "held", 50000)).toBeCloseTo(0.004, 12);
  });

  it("adds the rates where every fee is at its rate: 0.25% and the conversion's 0.0875% above 15,600 $", () => {
    const d: Deal = { foreign: true, fees: [account.fees[0]!, { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.000875, min: 5, max: 2475, currency: "USD" } }] }] };
    const p = dealPeriods(d, today).periods[0]!;
    expect(rateAt(d, p, { action: "trade", side: "buy" }, 20000 * USD, rates)).toBeCloseTo(0.003375, 9);
    // under 15,600 $ the minimum decides the commission
    expect(rateAt(d, p, { action: "trade", side: "buy" }, 10000 * USD, rates)).toBeNull();
  });

  it("reads a price held to a cap of 0 as free: 0.1% capped at 0 beside a conversion of 0.2% is 0.2%", () => {
    const d: Deal = {
      foreign: true,
      fees: [
        { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001, cap: 0 } }] },
        { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002 } }] },
      ],
    };
    expect(rateAt(d, dealPeriods(d, today).periods[0]!, { action: "trade", side: "buy" }, 50000)).toBeCloseTo(0.002, 12);
  });

  it("adds the yearly shares of what is held step by step, leaving the sums out", () => {
    expect(rateAt(account, now, "held", 50000)).toBeCloseTo(0.00896, 9);
    expect(rateAt(account, now, "held", 200000)).toBeCloseTo(0.007, 9);
    expect(rateAt(account, now, "held", 800000)).toBeCloseTo(0.005, 9);
  });
});

describe("F-124 where the shares come to cost as much as the sums per period", () => {
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

  it("is none with no sum, with no share, or where a share's maximum keeps it below the sums", () => {
    const shares: Deal = { foreign: false, fees: [account.fees[4]!] };
    expect(heldCrossover(shares, dealPeriods(shares, today).periods[0]!)).toBeNull();
    const sums: Deal = { foreign: false, fees: [account.fees[5]!] };
    expect(heldCrossover(sums, dealPeriods(sums, today).periods[0]!)).toBeNull();
    // 0.4% a year with at most 50 ₪ a year never costs more than 50 ₪, so it never reaches 108 ₪
    const capped: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.004, everyMonths: 12, max: 50 } }] }, account.fees[5]!] };
    expect(heldCrossover(capped, dealPeriods(capped, today).periods[0]!)).toBeNull();
  });

  it("is 38,000 ₪ for 228 ₪ a year against 0.15% a quarter with at most 3,700 ₪ a quarter, which stays above the sums", () => {
    // 0.15% a quarter is 0.6% a year, so 228 / 0.006 = 38,000 ₪; from 3,700 / 0.0015 = 2,466,667 ₪ the maximum holds the custody at
    // 14,800 ₪ a year, still a share's charge and still above 228 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0015, everyMonths: 3, max: 3700 } }] },
        { base: { name: "current_account" }, stages: [{ price: { kind: "sum", amount: 9, everyMonths: 1 } }] },
        { base: { name: "data" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
      ],
    };
    expect(heldCrossover(d, dealPeriods(d, today).periods[0]!)).toBeCloseTo(38000, 6);
  });

  it("is 100,000 ₪ under a maximum per charge on the whole deposit charged every month", () => {
    // 0.05% a month (0.6% a year) with at most 250 ₪ a month on the deposit, against 600 ₪ a year: 100,000 ₪; from 500,000 ₪ the maximum
    // holds the custody at 3,000 ₪ a year, above 600 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0005, everyMonths: 1, max: 250 } }] },
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 50, everyMonths: 1 } }] },
      ],
    };
    expect(heldCrossover(d, dealPeriods(d, today).periods[0]!)).toBeCloseTo(100000, 6);
  });
});

describe("F-124 the fees by their kind: the sums per period against every share of what is held at its charge", () => {
  // custody of 0.15% a year with at least 900 ₪ a year: its minimum holds up to 900 / 0.0015 = 600,000 ₪
  const custody: Deal["fees"][number] = { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.0015, everyMonths: 12, min: 900 } }] };
  const sums = (amount: number): Deal["fees"][number] => ({ base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount, everyMonths: 12 } }] });
  const at = (d: Deal) => heldCrossover(d, dealPeriods(d, today).periods[0]!);

  it("is none where the shares cost more at every value: 500 ₪ a year against custody that costs at least 900 ₪", () => {
    expect(at({ foreign: false, fees: [custody, sums(500)] })).toBeNull();
  });

  it("is where the rate passes the sums: 960 ₪ a year against the same custody is 960 / 0.0015 = 640,000 ₪", () => {
    expect(at({ foreign: false, fees: [custody, sums(960)] })).toBeCloseTo(640000, 6);
  });

  it("is none with no sum per period: the custody's own minimum, ending at 600,000 ₪, is no sum", () => {
    expect(at({ foreign: false, fees: [custody] })).toBeNull();
    expect(at({ foreign: false, fees: [custody, sums(0)] })).toBeNull();
  });

  it("counts a share held to its maximum with the shares: 1% a year at most 100 ₪, and 0.1% a year, pass 300 ₪ at 200,000 ₪", () => {
    // from 10,000 ₪ the first share is 100 ₪ a year, so the shares cost 100 + 0.001 × B, which is 300 ₪ at 200,000 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.01, everyMonths: 12, max: 100 } }] },
        { base: { name: "fund" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }] },
        sums(300),
      ],
    };
    expect(at(d)).toBeCloseTo(200000, 6);
  });

  it("holds a share to its maximum on each security: 1% a year at most 100 ₪ a security, and 0.1% a year, pass 300 ₪ at 200,000 ₪", () => {
    // the deal holds one security, so the 100 ₪ binds from 10,000 ₪ as a maximum would; without it, 300 / 0.011 = 27,273 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.01, everyMonths: 12, perSecurity: 100 } }] },
        { base: { name: "fund" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }] },
        sums(300),
      ],
    };
    expect(at(d)).toBeCloseTo(200000, 6);
  });

  it("is none where the shares fall back below the sums: 1% a year up to 100,000 ₪ and 0.1% on the whole above, against 500 ₪", () => {
    // they meet at 500 / 0.01 = 50,000 ₪, but from 100,000 ₪ the shares cost 0.001 × 100,000 = 100 ₪, below 500 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.01, everyMonths: 12 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
        sums(500),
      ],
    };
    expect(at(d)).toBeNull();
  });

  it("is past a cut where the shares only equal the sums at it: 0.2% a year up to 100,000 ₪, then 0.1% on the whole, against 200 ₪", () => {
    // 200 / 0.002 = 100,000 ₪ is the step's top, where just above it the shares cost 100 ₪; the 0.1% reaches 200 ₪ at 200,000 ₪
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.002, everyMonths: 12 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
        sums(200),
      ],
    };
    expect(at(d)).toBeCloseTo(200000, 6);
  });

  it("adds nothing for a share at 0%: 0% and 0.1% a year against 300 ₪ meet at 300,000 ₪, and 0% alone never does", () => {
    const zero: Deal["fees"][number] = { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0, everyMonths: 12 } }] };
    expect(at({ foreign: false, fees: [zero, { base: { name: "fund" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }] }, sums(300)] })).toBeCloseTo(300000, 6);
    expect(at({ foreign: false, fees: [zero, sums(300)] })).toBeNull();
  });

  it("is none where no share charges anything from there up: 10 ₪ a month up to 100,000 ₪ and free above, with nothing else", () => {
    // above 100,000 ₪ the sum's step ends and nothing is charged: the shares' 0 ₪ is no crossover
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "free" } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
      ],
    };
    expect(at(d)).toBeNull();
  });

  it("is none where the shares charge nothing over some larger stretch: 120 ₪ a year up to 100,000 ₪, free to 200,000 ₪, 0.1% above", () => {
    // from 100,000 ₪ the sums drop to 0 ₪ and meet the shares' 0 ₪, but up to 200,000 ₪ nothing is a share that charges: no crossover,
    // though the 0.1% charges from 200,000 ₪ up
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "sum", amount: 120, everyMonths: 12 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "free" } }], within: { on: "held", from: 100000, to: 200000, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }], within: { on: "held", from: 200000, to: null, currency: "ILS" } },
      ],
    };
    expect(at(d)).toBeNull();
  });

  it("is where a sum's step ends and a share's begins, for one fee whose steps mix the two kinds", () => {
    const mixed = (sum: number, rate: number): Deal["fees"] => [
      { base: { key: "custody" }, stages: [{ price: { kind: "sum", amount: sum, everyMonths: 12 } }], within: { on: "held", from: 0, to: 100000, currency: "ILS" } },
      { base: { key: "custody" }, stages: [{ price: { kind: "held", rate, everyMonths: 12 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
    ];
    // 120 ₪ a year up to 100,000 ₪, then 0.15%: the sums drop to nothing at the step's top, where the share is 150 ₪
    expect(at({ foreign: false, fees: mixed(120, 0.0015) })).toBe(100000);
    // 240 ₪ a year up to 100,000 ₪, then 0.1%, and 1,200 ₪ a year: above 100,000 ₪ the share passes 1,200 ₪ at 1,200,000 ₪
    expect(at({ foreign: false, fees: [...mixed(240, 0.001), sums(1200)] })).toBeCloseTo(1200000, 6);
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

  it("stops halfway to a neighbouring change within a hundredth: a step from 100,000 ₪ to 100,400 ₪", () => {
    // 0.2% a year up to 100,000 ₪, 0.1% up to 100,400 ₪ and 0.05% above: the side over 100,000 ₪ reads 100,200 ₪, inside the middle step
    const step = (rate: number, from: number, to: number | null) => ({ base: { key: "custody" as const }, stages: [{ price: { kind: "held" as const, rate, everyMonths: 12 } }], within: { on: "held" as const, from, to, currency: "ILS" } });
    const d: Deal = { foreign: false, fees: [step(0.002, 0, 100000), step(0.001, 100000, 100400), step(0.0005, 100400, null)] };
    const x = acrossDrop(d, dealPeriods(d, today).periods[0]!, 100000);
    expect(x.under.value).toBeCloseTo(99000, 6);
    expect(x.over.value).toBeCloseTo(100200, 6);
    expect(x.over.cost).toBeCloseTo(100.2, 6);
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

  it("first asks whether a fee charges anything on nothing: 10 ₪ a month, and 30 ₪ a quarter on a step from 100,000 ₪, is 10 ₪", () => {
    const d: Deal = {
      foreign: false,
      fees: [
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
        { base: { name: "large" }, stages: [{ price: { kind: "sum", amount: 30, everyMonths: 3 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 40 } }], within: { on: "held", from: 100000, to: null, currency: "ILS" } },
      ],
    };
    expect(idleMonth(d, dealPeriods(d, today).periods[0]!)).toEqual({ total: 10, parts: [{ fee: 0, cost: 10 }] });
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
