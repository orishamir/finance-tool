// docs/method.md §10.6, F-110 to F-113: a deal read on its own, with no plan. Every expected figure is worked by hand from the formula.
import { describe, expect, it } from "vitest";
import {
  actionCost,
  capStanding,
  changeKind,
  chargedOn,
  curveEnd,
  dealMarks,
  dealPeriods,
  groupRate,
  holdingCost,
  perYear,
  type Deal,
  type DealCap,
  type DealPrice,
} from "../src/index.ts";

const today = { y: 2026, m: 11 };
const commission: DealPrice = { kind: "action", rate: 0.0025, min: 15 };
const custodyYear: DealPrice = { kind: "held", rate: 0.004, everyMonths: 12 };
const fundFee: DealPrice = { kind: "held", rate: 0.0007, everyMonths: 12 };
const free: DealPrice = { kind: "free" };

/** The deal of the page's example: a fund abroad, custody free for a while, a monthly account fee from a date. */
const example: Deal = {
  foreign: true,
  fees: [
    { base: { key: "trade" }, stages: [{ price: commission }] },
    { base: { key: "custody" }, stages: [{ price: free, until: { y: 2028, m: 3 } }, { price: custodyYear }] },
    { base: { key: "fixed_period" }, stages: [{ price: free, until: { y: 2027, m: 3 } }, { price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
    { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002 } }] },
    { base: { name: "fund" }, stages: [{ price: fundFee }] },
  ],
};

describe("F-110 a deal's periods", () => {
  it("cuts time at each fee's end, ends on different months giving three periods", () => {
    const r = dealPeriods(example, today);
    expect(r.from).toEqual(today);
    expect(r.periods.map((p) => [p.from, p.to])).toEqual([
      [today, { y: 2027, m: 3 }],
      [{ y: 2027, m: 3 }, { y: 2028, m: 3 }],
      [{ y: 2028, m: 3 }, null],
    ]);
    expect(r.periods.map((p) => p.prices[1]!.price.kind)).toEqual(["free", "free", "held"]);
    expect(r.periods.map((p) => p.prices[2]!.price.kind)).toEqual(["free", "sum", "sum"]);
    expect(r.fees.map((f) => f.holds)).toEqual([true, false, false, true, true]);
    expect(r.fees[1]!.changes).toEqual([{ at: { y: 2028, m: 3 }, side: "all", from: free, to: custodyYear, kind: "starts" }]);
  });

  it("does not read a price whose end has passed", () => {
    const deal: Deal = {
      foreign: false,
      fees: [{ base: { key: "custody" }, stages: [{ price: free, until: { y: 2026, m: 6 } }, { price: custodyYear }] }],
    };
    const r = dealPeriods(deal, today);
    expect(r.periods).toHaveLength(1);
    expect(r.periods[0]!.prices[0]!.price).toEqual(custodyYear);
    expect(r.fees[0]).toEqual({ holds: true, changes: [] });
    // an end on the reading's own month has passed too: the month starts with the later price
    const atToday = dealPeriods({ ...deal, fees: [{ ...deal.fees[0]!, stages: [{ price: free, until: today }, { price: custodyYear }] }] }, today);
    expect(atToday.periods[0]!.prices[0]!.price).toEqual(custodyYear);
    expect(atToday.fees[0]!.holds).toBe(true);
  });

  it("reads the deal from its start where the start is later than today", () => {
    const deal: Deal = {
      foreign: false,
      start: { y: 2027, m: 1 },
      fees: [
        // ends after today but before the start: passed by the start
        { base: { key: "custody" }, stages: [{ price: free, until: { y: 2026, m: 12 } }, { price: custodyYear }] },
        { base: { key: "trade" }, stages: [{ price: commission, until: { y: 2027, m: 7 } }, { price: { kind: "action", rate: 0.001, min: 15 } }] },
      ],
    };
    const r = dealPeriods(deal, today);
    expect(r.from).toEqual({ y: 2027, m: 1 });
    expect(r.periods.map((p) => [p.from, p.to])).toEqual([
      [{ y: 2027, m: 1 }, { y: 2027, m: 7 }],
      [{ y: 2027, m: 7 }, null],
    ]);
    expect(r.periods[0]!.prices[0]!.price).toEqual(custodyYear);
    expect(r.fees[1]!.changes[0]!.kind).toBe("falls");
    // a start earlier than today does not move the reading
    expect(dealPeriods({ ...deal, start: { y: 2025, m: 1 } }, today).from).toEqual(today);
  });

  it("reads a sale's own prices as their own side", () => {
    const deal: Deal = {
      foreign: false,
      fees: [{ base: { key: "trade" }, stages: [{ price: commission }], sale: [{ price: free, until: { y: 2027, m: 1 } }, { price: commission }] }],
    };
    const r = dealPeriods(deal, today);
    expect(r.periods[0]!.prices[0]).toEqual({ price: commission, sale: free });
    expect(r.periods[1]!.prices[0]).toEqual({ price: commission, sale: commission });
    expect(r.fees[0]!.changes).toEqual([{ at: { y: 2027, m: 1 }, side: "sell", from: free, to: commission, kind: "starts" }]);
  });

  it("names a change by the two prices around it", () => {
    expect(changeKind(free, custodyYear)).toBe("starts");
    expect(changeKind(custodyYear, free)).toBe("ends");
    expect(changeKind(custodyYear, { kind: "held", rate: 0.005, everyMonths: 12 })).toBe("rises");
    // 0.1% a quarter is 0.4% a year: the yearly figure is the same, the charging period is not
    expect(changeKind({ kind: "held", rate: 0.001, everyMonths: 3 }, custodyYear)).toBe("changes");
    expect(changeKind({ kind: "sum", amount: 30, everyMonths: 3 }, { kind: "sum", amount: 10, everyMonths: 1 })).toBe("changes");
    expect(changeKind({ kind: "sum", amount: 10, everyMonths: 1 }, { kind: "sum", amount: 10, everyMonths: 1 })).toBeNull();
    expect(changeKind(free, free)).toBeNull();
    expect(changeKind({ kind: "sum", amount: 30, everyMonths: 3 }, { kind: "sum", amount: 15, everyMonths: 1 })).toBe("rises");
    expect(changeKind(commission, { kind: "action", rate: 0.0025, min: 10 })).toBe("changes");
    expect(changeKind(commission, { kind: "action", rate: 0.0025, min: 15, currency: "USD" })).toBe("changes");
    expect(changeKind(commission, { kind: "action", rate: 0.0025, min: 15, currency: "ILS" })).toBeNull();
    expect(changeKind(commission, { kind: "perAction", amount: 15 })).toBe("changes");
  });

  it("treats a free price and a price of zero as equal: no change, and one charging something after either starts", () => {
    for (const zero of [{ kind: "action", rate: 0 }, { kind: "action", rate: 0, max: 50 }, { kind: "held", rate: 0, everyMonths: 3 }, { kind: "sum", amount: 0, everyMonths: 1 }, { kind: "perAction", amount: 0 }] as DealPrice[]) {
      expect(changeKind(free, zero)).toBeNull();
      expect(changeKind(zero, free)).toBeNull();
    }
    expect(changeKind({ kind: "action", rate: 0 }, commission)).toBe("starts");
    expect(changeKind(custodyYear, { kind: "held", rate: 0, everyMonths: 12 })).toBe("ends");
    // a share of 0 with a minimum charges the minimum: it is not free
    expect(changeKind(free, { kind: "held", rate: 0, everyMonths: 3, min: 10 })).toBe("starts");
    const deal: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: free, until: { y: 2027, m: 6 } }, { price: { kind: "held", rate: 0, everyMonths: 12 } }] }] };
    const r = dealPeriods(deal, today);
    expect(r.periods).toHaveLength(1);
    expect(r.fees[0]!.holds).toBe(true);
  });

  it("counts a bound's currency only where a minimum or a maximum is typed", () => {
    expect(changeKind({ kind: "action", rate: 0.002 }, { kind: "action", rate: 0.002, currency: "USD" })).toBeNull();
    expect(changeKind({ kind: "action", rate: 0.002, currency: "EUR" }, { kind: "action", rate: 0.002, currency: "USD" })).toBeNull();
    expect(changeKind({ kind: "action", rate: 0.002, max: 20 }, { kind: "action", rate: 0.002, max: 20, currency: "USD" })).toBe("changes");
  });

  it("names the same yearly figure charged at a different number of months a change that just changes", () => {
    // 0.1% every quarter and 0.4% once a year; 30 ₪ a quarter and 10 ₪ a month: the same a year, charged apart
    expect(changeKind({ kind: "held", rate: 0.001, everyMonths: 3 }, custodyYear)).toBe("changes");
    expect(changeKind({ kind: "sum", amount: 30, everyMonths: 3 }, { kind: "sum", amount: 10, everyMonths: 1 })).toBe("changes");
    const deal: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3 }, until: { y: 2027, m: 6 } }, { price: custodyYear }] }] };
    expect(dealPeriods(deal, today).fees[0]!.changes.map((c) => c.kind)).toEqual(["changes"]);
  });

  it("does not cut time at an end whose two prices are equal", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        // a typed end with the same price after it: no change point, so the fee holds throughout
        { base: { key: "custody" }, stages: [{ price: custodyYear, until: { y: 2027, m: 6 } }, { price: { ...custodyYear } }] },
        { base: { key: "trade" }, stages: [{ price: commission }] },
      ],
    };
    const r = dealPeriods(deal, today);
    expect(r.periods).toHaveLength(1);
    expect(r.fees.map((f) => f.holds)).toEqual([true, true]);
    // the same end on another fee that does change still cuts, and the equal fee still holds
    const both: Deal = { ...deal, fees: [deal.fees[0]!, { base: { key: "trade" }, stages: [{ price: commission, until: { y: 2027, m: 6 } }, { price: free }] }] };
    const r2 = dealPeriods(both, today);
    expect(r2.periods.map((p) => p.from)).toEqual([today, { y: 2027, m: 6 }]);
    expect(r2.fees.map((f) => f.holds)).toEqual([true, false]);
    expect(r2.fees[1]!.changes[0]!.kind).toBe("ends");
  });

  it("reads a load on the purchase side and a redemption deduction on the sale side", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "load" }, stages: [{ price: { kind: "action", rate: 0.01 }, until: { y: 2027, m: 1 } }, { price: free }] },
        { base: { key: "redemption_deduction" }, stages: [{ price: { kind: "action", rate: 0.005 } }] },
      ],
    };
    const r = dealPeriods(deal, today);
    expect(r.fees[0]!.changes).toEqual([{ at: { y: 2027, m: 1 }, side: "buy", from: { kind: "action", rate: 0.01 }, to: free, kind: "ends" }]);
    expect(() => dealPeriods({ ...deal, fees: [{ ...deal.fees[0]!, sale: [{ price: free }] }] }, today)).toThrow(RangeError);
  });

  it("refuses prices that do not end in order or a last price with an end", () => {
    const deal = (stages: Deal["fees"][number]["stages"]): Deal => ({ foreign: false, fees: [{ base: { key: "custody" }, stages }] });
    expect(() => dealPeriods(deal([]), today)).toThrow(RangeError);
    expect(() => dealPeriods(deal([{ price: free, until: { y: 2027, m: 1 } }]), today)).toThrow(RangeError);
    expect(() => dealPeriods(deal([{ price: free }, { price: custodyYear }]), today)).toThrow(RangeError);
    expect(() =>
      dealPeriods(deal([{ price: free, until: { y: 2028, m: 1 } }, { price: commission, until: { y: 2027, m: 1 } }, { price: custodyYear }]), today),
    ).toThrow(RangeError);
  });
});

describe("F-111 what a fee is charged on, and what adds", () => {
  it("says what each fee is charged on", () => {
    expect(chargedOn({ key: "trade" }, commission)).toEqual({ on: "action", action: "trade" });
    expect(chargedOn({ key: "fx" }, free)).toEqual({ on: "action", action: "conversion" });
    expect(chargedOn({ key: "custody" }, free)).toEqual({ on: "held" });
    expect(chargedOn({ key: "custody" }, { kind: "sum", amount: 30, everyMonths: 3 })).toEqual({ on: "account" });
    expect(chargedOn({ key: "fixed_period" }, free)).toEqual({ on: "account" });
    expect(chargedOn({ name: "fund" }, fundFee)).toEqual({ on: "held" });
    expect(chargedOn({ name: "other" }, commission)).toEqual({ on: "action", action: null });
    expect(chargedOn({ name: "other" }, free)).toBeNull();
    expect(chargedOn({ key: "load" }, free)).toEqual({ on: "action", action: "trade", side: "buy" });
    expect(chargedOn({ key: "redemption_deduction" }, commission)).toEqual({ on: "action", action: "trade", side: "sell" });
  });

  it("places a price typed in a form its base does not usually take by the price's form", () => {
    // a share every few months on an action's base is on what is held; a sum every few months is on the account
    expect(chargedOn({ key: "trade" }, custodyYear)).toEqual({ on: "held" });
    expect(chargedOn({ key: "transfer_out" }, { kind: "sum", amount: 10, everyMonths: 1 })).toEqual({ on: "account" });
    expect(chargedOn({ key: "fixed_period" }, custodyYear)).toEqual({ on: "held" });
    // a price per action on what is held or on the account adds to nothing
    expect(chargedOn({ key: "custody" }, commission)).toEqual({ on: "action", action: null });
    expect(chargedOn({ key: "balance" }, { kind: "perAction", amount: 5 })).toEqual({ on: "action", action: null });
    expect(chargedOn({ key: "fixed_period" }, { kind: "perAction", amount: 5 })).toEqual({ on: "action", action: null });
    expect(chargedOn({ key: "fixed_period" }, commission)).toEqual({ on: "action", action: null });
    // a free price still takes its base's
    expect(chargedOn({ key: "balance" }, free)).toEqual({ on: "held" });
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: commission }] },
        { base: { key: "custody" }, stages: [{ price: { kind: "action", rate: 0.001 } }] },
      ],
    };
    const groups = groupRate(deal, dealPeriods(deal, today).periods[0]!);
    expect(groups.map((g) => g.fees)).toEqual([[0]]);
  });

  it("lists insurance on its own whatever its price's form", () => {
    for (const price of [free, custodyYear, commission, { kind: "sum", amount: 30, everyMonths: 1 } as DealPrice]) expect(chargedOn({ key: "insurance_premium" }, price)).toEqual({ on: "cover" });
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "balance" }, stages: [{ price: { kind: "held", rate: 0.0022, everyMonths: 12 } }] },
        { base: { key: "insurance_premium" }, stages: [{ price: { kind: "held", rate: 0.003, everyMonths: 12, min: 1 } }] },
        { base: { key: "custody" }, stages: [{ price: custodyYear }] },
        { base: { key: "insurance_premium" }, stages: [{ price: { kind: "sum", amount: 30, everyMonths: 1 } }] },
      ],
    };
    const [p] = dealPeriods(deal, today).periods;
    const held = groupRate(deal, p!).find((g) => g.on === "held")!;
    expect(held.fees).toEqual([0, 2]);
    expect(held.rate).toBeCloseTo(0.0062, 12);
    // no minimum of cover is marked, no sum of cover meets custody, and cover is no cost of holding
    expect(dealMarks(deal, p!)).toEqual([]);
    expect(holdingCost(deal, p!, 10000).parts.map((x) => x.fee)).toEqual([0, 2]);
  });

  it("states custody of 0.1% a quarter as 0.4% a year, and a sum every month as twelve a year", () => {
    expect(perYear({ kind: "held", rate: 0.001, everyMonths: 3 })).toBeCloseTo(0.004, 12);
    expect(perYear({ kind: "sum", amount: 10, everyMonths: 1 })).toBe(120);
    expect(perYear(commission)).toBeNull();
  });

  it("adds 0.25% and 0.2% on one action to 0.45% where what is held is not in shekels", () => {
    const [p] = dealPeriods(example, today).periods;
    const trade = groupRate(example, p!).find((g) => g.on === "action");
    expect(trade).toMatchObject({ on: "action", action: "trade", side: "all", fees: [0, 3] });
    expect(trade!.rate).toBeCloseTo(0.0045, 12);
    // in shekels the conversion is not part of a purchase
    const groups = groupRate({ ...example, foreign: false }, p!);
    expect(groups.find((g) => g.on === "action" && g.action === "trade")!.rate).toBeCloseTo(0.0025, 12);
    expect(groups.find((g) => g.on === "action" && g.action === "conversion")!.rate).toBeCloseTo(0.002, 12);
  });

  it("gives a held group of 0.07% while custody is free, and 0.47% after it", () => {
    const held = dealPeriods(example, today).periods.map((p) => groupRate(example, p).find((g) => g.on === "held")!);
    expect(held.map((g) => g.fees)).toEqual([[4], [4], [1, 4]]);
    expect(held[0]!.rate).toBeCloseTo(0.0007, 12);
    expect(held[2]!.rate).toBeCloseTo(0.0047, 12);
  });

  it("splits an action's group by side where a sale has its own price", () => {
    const deal: Deal = {
      foreign: true,
      fees: [
        { base: { key: "trade" }, stages: [{ price: commission }], sale: [{ price: { kind: "action", rate: 0.001 } }] },
        { base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002 } }] },
      ],
    };
    const groups = groupRate(deal, dealPeriods(deal, today).periods[0]!);
    expect(groups.map((g) => (g.on === "action" ? g.side : g.on))).toEqual(["buy", "sell"]);
    expect(groups[0]!.rate).toBeCloseTo(0.0045, 12);
    expect(groups[1]!.rate).toBeCloseTo(0.003, 12);
  });

  it("gives a purchase and a sale their own rate where a fee is charged on one of them alone", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] },
        { base: { key: "load" }, stages: [{ price: { kind: "action", rate: 0.01 } }] },
        { base: { key: "redemption_deduction" }, stages: [{ price: { kind: "action", rate: 0.005 } }] },
      ],
    };
    const [p] = dealPeriods(deal, today).periods;
    const groups = groupRate(deal, p!);
    expect(groups.map((g) => (g.on === "action" ? [g.side, g.fees] : g.on))).toEqual([["buy", [0, 1]], ["sell", [0, 2]]]);
    expect(groups[0]!.rate).toBeCloseTo(0.011, 12);
    expect(groups[1]!.rate).toBeCloseTo(0.006, 12);
    expect(actionCost(deal, p!, "trade", 1000, "buy").parts.map((x) => x.fee)).toEqual([0, 1]);
    expect(actionCost(deal, p!, "trade", 1000, "sell").total).toBeCloseTo(6, 10);
  });
});

describe("F-112 the sums a deal's prices mark", () => {
  it("marks a commission of 0.25% with a 15 ₪ minimum binding below 6,000 ₪", () => {
    const [p] = dealPeriods(example, today).periods;
    expect(dealMarks(example, p!)).toEqual([{ kind: "min", on: "action", fee: 0, side: "all", amount: 6000, currency: "ILS" }]);
    expect(actionCost(example, p!, "trade", 5000).total).toBeCloseTo(15 + 10, 10);
    const at8000 = actionCost(example, p!, "trade", 8000);
    expect(at8000.parts.map((x) => x.fee)).toEqual([0, 3]);
    expect(at8000.parts[0]!.cost).toBeCloseTo(20, 10);
    expect(at8000.total).toBeCloseTo(36, 10);
  });

  it("marks 10 ₪ a month against custody of 0.4% a year meeting at 30,000 ₪", () => {
    const periods = dealPeriods(example, today).periods;
    expect(dealMarks(example, periods[1]!).filter((m) => m.kind === "meet")).toEqual([]);
    const meet = dealMarks(example, periods[2]!).find((m) => m.kind === "meet")!;
    expect(meet).toMatchObject({ on: "held", fees: [2], against: [1], sum: 120, currency: "ILS" });
    expect(meet.amount).toBeCloseTo(30000, 8);
    const at = holdingCost(example, periods[2]!, 30000);
    expect(at.parts.map((x) => x.fee)).toEqual([1, 2, 4]);
    expect(at.parts[0]!.cost).toBeCloseTo(120, 10);
    expect(at.parts[1]!.cost).toBe(120);
    expect(at.total).toBeCloseTo(120 + 120 + 21, 10);
  });

  it("adds every sum on the account against every custody fee, in one mark per period", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
        { base: { name: "current account" }, stages: [{ price: { kind: "sum", amount: 30, everyMonths: 3 } }] },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3 } }] },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 12 } }] },
        // a share of what is held paid inside a fund is not the account's custody
        { base: { name: "fund" }, stages: [{ price: fundFee }] },
      ],
    };
    const meets = dealMarks(deal, dealPeriods(deal, today).periods[0]!).filter((m) => m.kind === "meet");
    expect(meets).toHaveLength(1);
    // (120 + 120) ₪ a year against (0.4% + 0.1%) a year: 48,000 ₪
    expect(meets[0]).toMatchObject({ fees: [0, 1], against: [2, 3], sum: 240 });
    expect(meets[0]!.kind === "meet" && meets[0]!.rate).toBeCloseTo(0.005, 12);
    expect(meets[0]!.amount).toBeCloseTo(48000, 6);
  });

  it("marks a maximum and a minimum per charge of a held share, and prices each charge of a year", () => {
    const deal: Deal = { foreign: false, fees: [{ base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 10, max: 100 } }] }] };
    const [p] = dealPeriods(deal, today).periods;
    expect(dealMarks(deal, p!).map((m) => [m.kind, m.on, Math.round(m.amount)])).toEqual([["min", "held", 10000], ["max", "held", 100000]]);
    expect(holdingCost(deal, p!, 5000).total).toBeCloseTo(40, 10);
    expect(holdingCost(deal, p!, 50000).total).toBeCloseTo(200, 10);
    expect(holdingCost(deal, p!, 500000).total).toBeCloseTo(400, 10);
  });

  it("does not limit a charge to the value held: below a custody minimum, and on nothing held, the cost is the minimum", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, min: 10 } }] },
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
      ],
    };
    const [p] = dealPeriods(deal, today).periods;
    // on 5 ₪ a run's charge is at most the 5 ₪ held; the curve shows the minimum, 10 ₪ a quarter, and the sums in full
    expect(holdingCost(deal, p!, 5).parts).toEqual([{ fee: 0, cost: 40 }, { fee: 1, cost: 120 }]);
    expect(holdingCost(deal, p!, 0).total).toBe(160);
  });

  it("starts an action's curve at its minimum: the smallest action pays the minimum or the sum per action", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: commission }] },
        { base: { key: "trade" }, stages: [{ price: { kind: "perAction", amount: 2 } }] },
        { base: { key: "trade" }, stages: [{ price: { kind: "action", rate: 0.001 } }] },
      ],
    };
    const [p] = dealPeriods(deal, today).periods;
    expect(actionCost(deal, p!, "trade", 0).parts).toEqual([{ fee: 0, cost: 15 }, { fee: 1, cost: 2 }, { fee: 2, cost: 0 }]);
  });

  it("marks no meeting where a custody minimum or maximum binds at the sum where the two would meet", () => {
    // 120 ₪ a year against 0.1% a quarter (0.4% a year) would meet at 30,000 ₪, where one charge is 30 ₪
    const deal = (bounds: { min?: number; max?: number }): Deal => ({
      foreign: false,
      fees: [
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0.001, everyMonths: 3, ...bounds } }] },
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
      ],
    });
    const meets = (d: Deal) => dealMarks(d, dealPeriods(d, today).periods[0]!).filter((m) => m.kind === "meet");
    expect(meets(deal({ min: 10, max: 100 }))).toHaveLength(1);
    expect(meets(deal({ min: 30 }))).toHaveLength(1);
    expect(meets(deal({ min: 50 }))).toEqual([]);
    expect(meets(deal({ max: 20 }))).toEqual([]);
  });

  it("gives a mark on the same sum for a purchase and for a sale once, on both", () => {
    const deal: Deal = {
      foreign: false,
      fees: [{ base: { key: "trade" }, stages: [{ price: commission }], sale: [{ price: { kind: "action", rate: 0.0025, min: 15, max: 100 } }] }],
    };
    const marks = dealMarks(deal, dealPeriods(deal, today).periods[0]!);
    expect(marks.map((m) => [m.kind, m.side, Math.round(m.amount)])).toEqual([["min", "all", 6000], ["max", "sell", 40000]]);
    // different sums stay two marks
    const apart: Deal = { foreign: false, fees: [{ base: { key: "trade" }, stages: [{ price: commission }], sale: [{ price: { kind: "action", rate: 0.001, min: 15 } }] }] };
    expect(dealMarks(apart, dealPeriods(apart, today).periods[0]!).map((m) => m.side)).toEqual(["buy", "sell"]);
  });

  it("needs no exchange rate for a price that names a currency but has no bound typed", () => {
    const deal: Deal = { foreign: true, fees: [{ base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.002, currency: "USD" } }] }] };
    const [p] = dealPeriods(deal, today).periods;
    expect(actionCost(deal, p!, "trade", 1000).total).toBeCloseTo(2, 10);
  });

  it("gives a bound typed in another currency its sum in that currency, and converts it only for a cost", () => {
    const deal: Deal = { foreign: true, fees: [{ base: { key: "fx" }, stages: [{ price: { kind: "action", rate: 0.0019, min: 6.7, max: 2700, currency: "USD" } }] }] };
    const [p] = dealPeriods(deal, today).periods;
    const marks = dealMarks(deal, p!);
    expect(marks.map((m) => m.currency)).toEqual(["USD", "USD"]);
    expect(marks[0]!.amount).toBeCloseTo(6.7 / 0.0019, 8);
    // 100 ₪ converted: 0.19 ₪ at the rate, the minimum 6.70 $ × 3.70 = 24.79 ₪ instead (F-13's example)
    expect(actionCost(deal, p!, "trade", 100, "buy", { USD: 3.7 }).total).toBeCloseTo(24.79, 10);
    expect(() => actionCost(deal, p!, "trade", 100)).toThrow(RangeError);
  });

  it("marks nothing for a bound with no rate or a free price, and no meeting where custody is free", () => {
    const deal: Deal = {
      foreign: false,
      fees: [
        { base: { key: "trade" }, stages: [{ price: { kind: "perAction", amount: 7 } }] },
        { base: { key: "custody" }, stages: [{ price: { kind: "held", rate: 0, everyMonths: 3, min: 10 } }] },
        { base: { key: "fixed_period" }, stages: [{ price: { kind: "sum", amount: 10, everyMonths: 1 } }] },
      ],
    };
    const [p] = dealPeriods(deal, today).periods;
    expect(dealMarks(deal, p!)).toEqual([]);
    expect(actionCost(deal, p!, "trade", 1000).total).toBe(7);
  });

  it("ends an axis at 1, 2 or 5 times a power of ten, at least three times the largest mark", () => {
    expect(curveEnd(6000)).toBe(20000);
    expect(curveEnd(30000)).toBe(100000);
    expect(curveEnd(1000)).toBe(5000);
    expect(curveEnd(10000 / 3)).toBe(10000);
    expect(() => curveEnd(0)).toThrow(RangeError);
  });
});

describe("F-113 a typed price against the legal cap", () => {
  const cap = (value: DealCap["value"], more: Partial<DealCap> = {}): DealCap => ({ value, state: "sourced", ...more });

  it("judges a price below, at or above the cap, with its share of it", () => {
    const below = capStanding(0.6, cap(1.05));
    expect(below).toMatchObject({ judged: true, standing: "below" });
    expect(below.judged && Math.round(below.share! * 100)).toBe(57);
    expect(capStanding(1.05, cap(1.05))).toEqual({ judged: true, standing: "at", share: 1 });
    expect(capStanding(1, cap(4))).toEqual({ judged: true, standing: "below", share: 0.25 });
    expect(capStanding(1.2, cap(1.05))).toMatchObject({ judged: true, standing: "above" });
  });

  it("calls any positive price above a cap of 0", () => {
    expect(capStanding(0.01, cap(0))).toEqual({ judged: true, standing: "above", share: null });
    expect(capStanding(0, cap(0))).toEqual({ judged: true, standing: "at", share: null });
  });

  it("judges nothing with no value, no cap, or a cap not sourced", () => {
    expect(capStanding(undefined, cap(1.05))).toEqual({ judged: false, why: "no-price" });
    expect(capStanding(0.5, cap(null))).toEqual({ judged: false, why: "no-cap" });
    expect(capStanding(0.5, undefined)).toEqual({ judged: false, why: "no-cap" });
    expect(capStanding(0.5, cap(1.05, { state: "computed" }))).toEqual({ judged: false, why: "not-sourced" });
  });

  it("judges a cap that binds banks only where the deal names a bank", () => {
    const banks = cap(10, { binds: "banks" });
    expect(capStanding(25, banks)).toEqual({ judged: false, why: "binds" });
    expect(capStanding(25, banks, "non-bank")).toEqual({ judged: false, why: "binds" });
    expect(capStanding(25, banks, "bank")).toEqual({ judged: true, standing: "above", share: 2.5 });
  });

  it("calls a converted price from half a percent below the cap to a tenth of a percent above it at it, and compares a price in the cap's own period as typed", () => {
    // 0.04157% a month is 0.49884% a year: 0.23% under the cap of 0.5%, a pension bylaw's compounded twelfth (PEN-21)
    expect(capStanding(0.04157 * 12, cap(0.5), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    // 0.0417% a month is 0.5004% a year: 0.08% over, what rounding to four decimals can add
    expect(capStanding(0.0417 * 12, cap(0.5), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    // 0.0418% a month is 0.5016% a year: 0.32% over
    expect(capStanding(0.0418 * 12, cap(0.5), undefined, true)).toMatchObject({ judged: true, standing: "above" });
    // 0.1667% a month is 2.0004% a year: 0.02% over
    expect(capStanding(0.1667 * 12, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    // 0.1675% a month is 2.01% a year: 0.5% over
    expect(capStanding(0.1675 * 12, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "above" });
    // 0.08708% a month is 1.04496% a year: 0.48% under the cap of 1.05%, the compounded twelfth computed as PEN-21's
    expect(capStanding(0.08708 * 12, cap(1.05), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    // the two ends of the band are at the cap: 0.5% below it and 0.1% above it
    expect(capStanding(2 * 0.995, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    expect(capStanding(2 * 1.001, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "at" });
    expect(capStanding(2 * 0.994, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "below" });
    expect(capStanding(2 * 1.002, cap(2), undefined, true)).toMatchObject({ judged: true, standing: "above" });
    // a price in the cap's own period is compared as typed: 0.1% above is above
    expect(capStanding(2 * 1.001, cap(2))).toMatchObject({ judged: true, standing: "above" });
    // 0.0414% a month is 0.4968% a year: 0.64% under
    expect(capStanding(0.0414 * 12, cap(0.5), undefined, true)).toMatchObject({ judged: true, standing: "below" });
    // 0.045% a month is 0.54% a year: 8% over
    expect(capStanding(0.045 * 12, cap(0.5), undefined, true)).toMatchObject({ judged: true, standing: "above" });
    // typed for the cap's own period, the same figures are compared as typed
    expect(capStanding(0.49884, cap(0.5))).toMatchObject({ judged: true, standing: "below" });
    expect(capStanding(2.0004, cap(2))).toMatchObject({ judged: true, standing: "above" });
  });

  it("judges no cap that holds only in a case the deal does not state, at any provider", () => {
    const closing = cap(10, { binds: "banks", caveat: "closing_account" });
    for (const provider of [undefined, "bank", "non-bank"] as const) expect(capStanding(25, closing, provider)).toEqual({ judged: false, why: "caveat" });
    expect(capStanding(0.1, cap(null, { caveat: "distribution_agreement" }), "bank")).toEqual({ judged: false, why: "caveat" });
    // whatever is typed, or nothing
    expect(capStanding(undefined, closing)).toEqual({ judged: false, why: "caveat" });
  });

  it("judges a cap that binds banks and a fund's distributor only where the deal names a bank", () => {
    const distributors = cap(0, { binds: "banks_and_fund_distributors" });
    expect(capStanding(0.2, distributors)).toEqual({ judged: false, why: "binds" });
    expect(capStanding(0.2, distributors, "non-bank")).toEqual({ judged: false, why: "binds" });
    expect(capStanding(0.2, distributors, "bank")).toEqual({ judged: true, standing: "above", share: null });
  });
});
