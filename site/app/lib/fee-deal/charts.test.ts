// The reading's panels and timeline (charts.ts) on the layout check's deal (scripts/layout-check-deal.txt): a broker abroad with a trade
// fee of 0.25% (at least 39 $, at most 6,900 $, at most 30% of a small purchase), a conversion of 0.0875% (free to 10 $, 1.50 $ to 100 $,
// at least 5 $, at most 2,475 $), custody of 0.199%, 0.15% and 0.1% a quarter by the value held, a fund's 0.1% a year, a current account
// of 9 ₪ and a data plan of 10 ₪ a month, and a fixed account fee of 20 ₪ a month from 01.2027 that the month's trade fees offset.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { unpackDeal } from "./link";
import { readDealFor } from "./deal-read";
import { readingOf } from "./reading";
import { openingRange, partAt, roundAmount, samples, settleRange, type ActionView, type HeldView, type LanePart } from "./charts";
import { nisPerNumber } from "../fx";
import { typed, type FeeDeal, type Price } from "./model";

const data = feesData();
const link = readFileSync(new URL("../../../scripts/layout-check-deal.txt", import.meta.url), "utf8").trim();
const reading = async () => {
  const deal = await unpackDeal(link.split("#d=")[1]!);
  return readingOf(readDealFor(deal!, data.kinds, "2026-11-20"), data.fx);
};
const chartOf = (v: { chart: ActionView } | object) => (v as { chart: ActionView }).chart;
/** What a test reads that must be there; it fails naming what is missing. */
const got = <T,>(x: T | null | undefined, what: string): T => {
  if (x === null || x === undefined) throw new Error(`the reading has no ${what}`);
  return x;
};
const heldOf = (v: { chart: HeldView } | object) => (v as { chart: HeldView }).chart;

describe("the axis", () => {
  it("opens from the largest power of ten at most half the smallest mark to the curve's end, never cut to the bounds", () => {
    expect(openingRange([18_650, 9_232_057])).toEqual({ lo: 1000, hi: 50_000_000 });
    expect(openingRange([25_446, 500_000])).toEqual({ lo: 10_000, hi: 2_000_000 });
    expect(openingRange([1_200, 90_000_000]).hi).toBe(500_000_000);
  });
  it("settles a typed or dragged range inside the bounds, at least twice as wide, its ends in order", () => {
    const opening = { lo: 10_000, hi: 2_000_000 };
    expect(settleRange(50_000, 20_000, opening)).toEqual({ lo: 20_000, hi: 50_000 });
    expect(settleRange(100, 150, opening)).toEqual({ lo: 1000, hi: 2000 });
    expect(settleRange(9_000_000, 9_500_000, opening)).toEqual({ lo: 5_000_000, hi: 10_000_000 });
  });
  it("widens the bounds to the opening range, so a mark above 10,000,000 stays reachable", () => {
    expect(settleRange(1_000_000, 90_000_000, { lo: 1000, hi: 500_000_000 })).toEqual({ lo: 1_000_000, hi: 90_000_000 });
  });
  it("reads an amount the reader points at to two figures", () => {
    expect(roundAmount(18_650.62)).toBe(19_000);
    expect(roundAmount(1234)).toBe(1200);
  });
});

describe("what a purchase or sale costs", () => {
  it("draws one chart for every period, its point starting at the deal's first mark, its zones from the minimum to the maximum", async () => {
    const tab = (await reading()).panels.actions.find((t) => t.key === "trade:all")!;
    expect(tab.views).toHaveLength(1);
    const c = chartOf(tab.views[0]!);
    expect(c.periods).toEqual(["2026-11", "2027-01"]);
    // the conversion's minimum ends at 5,714 $ (5 $ / 0.0875%), the deal's first mark; the point starts at it as said, 5,714 $ in whole shekels
    expect(c.start).toBe(Math.round(5714 * (c.marks[0]!.at / (c.marks[0]!.label.value as number))));
    expect(c.marks[0]!.label).toMatchObject({ unit: "usd" });
    expect(c.marks[0]!.label.value).toBeCloseTo(5 / 0.000875, 6);
    expect(c.zones.map((z) => z.kind)).toEqual(["min", "rate", "max"]);
    expect(c.lanes.map((l) => l.parts!.map((x) => x.part))).toEqual([
      ["cap", "min", "rate", "max"],
      ["free", "flat", "min", "rate", "max"],
    ]);
  });
  it("says the minimum decides below 15,600 $ and the rates above it add to 0.3375%", async () => {
    const c = chartOf((await reading()).panels.actions.find((t) => t.key === "trade:all")!.views[0]!);
    expect(c.head).toMatchObject({ kind: "below", below: { value: expect.closeTo(15_600, 6), unit: "usd" }, rate: { value: expect.closeTo(0.3375, 10) } });
    if (c.head.kind === "below") expect(c.head.adds.map((a) => a.rate.value)).toEqual([0.25, 0.0875]);
  });
  it("reads the first mark: the two minimums, $44 at the day's ECB rate, 0.77% of it, and what the trade's rate alone would charge", async () => {
    const c = chartOf((await reading()).panels.actions.find((t) => t.key === "trade:all")!.views[0]!);
    const r = c.readAt(c.start);
    // the minimums are set in dollars, so the shekel sum moves with each data/series/ecb-fx.json refresh; the total is the two as shown
    const usd = got(nisPerNumber(got(data.fx, "rates"), "USD"), "dollar");
    expect(r.parts.map((p) => p.cost.value)).toEqual([expect.closeTo(39 * usd, 6), expect.closeTo(5 * usd, 6)]);
    expect(r.total.value).toBe(Math.round(39 * usd) + Math.round(5 * usd));
    // the share is of the cost itself (F-123), not of the total as shown
    expect(r.share.value).toBeCloseTo(((44 * usd) / c.start) * 100, 9);
    expect(r.share.value).toBeCloseTo(0.77, 3);
    expect(r.parts.map((p) => p.part?.part)).toEqual(["min", "min"]);
    expect(r.parts[0]!.rateAlone!.value).toBeCloseTo(c.start * 0.0025, 9);
  });
});

describe("a purchase's conversion, read on what it buys (F-13)", () => {
  // Discount's direct line: 0.17%, at least 6 $, at most 1,055 $; free up to 10 $, half the price and its minimum up to 100 $; at 3.70 ₪ a dollar
  const usd = (p: Omit<Extract<Price, { form: "action" }>, "form" | "currency">): Price => ({ form: "action", ...p, currency: "USD" });
  const line = { rate: typed(0.17), min: typed(6), max: typed(1055) };
  const deal: FeeDeal = {
    id: "deal-x",
    name: "",
    kind: "brokerage-account",
    fees: [
      {
        id: "fee-fx",
        kind: "fx",
        by: [{ kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }],
        cases: [
          { id: "x1", when: [0], stages: [{ price: { form: "free" } }] },
          { id: "x2", when: [1], stages: [{ price: { ...usd(line), discount: { pct: typed(50), alsoMin: true } } as Price }] },
          { id: "x3", when: [2], stages: [{ price: usd(line) }] },
        ],
      },
    ],
  };
  const chart = () => {
    const fx = { ...data.fx!, perEur: { ILS: 3.7, USD: 1 } };
    const tab = readingOf(readDealFor(deal, data.kinds, "2026-11-20"), fx).panels.actions.find((t) => t.action === "conversion")!;
    expect(tab.side).toBe("all");
    return chartOf(tab.views[0]!);
  };
  it("names the part whose price the purchase pays: free at 40 ₪, half the minimum at 380 ₪ and 385 ₪, the full minimum at 400 ₪", () => {
    const c = chart();
    // 40 ₪ converts 37 ₪, which buy 10 $ free; 380 ₪ buys 368.90 ₪ at half the minimum, 3 $ = 11.10 ₪; 385 ₪ converts 381.10 ₪, which buy
    // the 100 $ top at half the minimum; from 392.20 ₪ the full minimum, 6 $ = 22.20 ₪, buys more than the top
    for (const [a, part, figure, cost] of [[40, "free", null, 0], [380, "min", 3, 11.1], [385, "min", 3, 11.1], [400, "min", 6, 22.2]] as const) {
      const r = c.readAt(a);
      expect(got(r.parts[0], "part").cost.value).toBeCloseTo(cost, 9);
      // the total is its one line as shown, in whole shekels from 10 ₪
      expect(r.total.value).toBe(Math.round(cost));
      expect(r.parts).toHaveLength(1);
      expect(r.parts[0]!.part?.part).toBe(part);
      expect(r.parts[0]!.part?.figure?.value ?? null).toBe(figure);
    }
  });
  it("says what the rate alone would charge on the shekels the purchase converts, not on its cash: at 385 ₪, on 381.10 ₪ (F-123)", () => {
    const r = chart().readAt(385);
    // the step's rate is half the line's 0.17%; the rest of the cash, 3.90 ₪, waits unconverted
    expect(r.parts[0]!.rateAlone!.value).toBeCloseTo(0.0017 * 0.5 * 381.1, 9);
    expect(r.parts[0]!.apart!.value).toBeCloseTo(11.1 - 0.0017 * 0.5 * 381.1, 9);
  });
  it("marks each step's top at the cash from which the purchase buys past it, and the lane changes part there", () => {
    const c = chart();
    // the 100 $ top at 392.20 ₪, not at the 370 ₪ that 100 $ are worth; the 10 $ top, at 48.10 ₪, lies under the opening range from 100 ₪
    expect(c.range.lo).toBe(100);
    expect(c.marks.map((m) => [m.at, m.label.value])).toEqual([
      [expect.closeTo(392.2, 9), 100],
      [expect.closeTo(6 / 0.0017 * 3.7, 6), expect.closeTo(6 / 0.0017, 6)],
      [expect.closeTo(1055 / 0.0017 * 3.7, 6), expect.closeTo(1055 / 0.0017, 6)],
    ]);
    const lane = c.lanes[0]!.parts!;
    expect(lane.slice(0, 3).map((x) => [x.part, x.figure?.value ?? null, x.from, x.to])).toEqual([
      ["free", null, 0, expect.closeTo(48.1, 9)],
      ["min", 3, expect.closeTo(48.1, 9), expect.closeTo(392.2, 9)],
      ["min", 6, expect.closeTo(392.2, 9), expect.closeTo(6 / 0.0017 * 3.7, 6)],
    ]);
  });
});

describe("what holding costs", () => {
  it("meets the fixed sums and every share at 25,446 ₪ today and at 52,232 ₪ from 01.2027, with the fixed account fee", async () => {
    const [now, later] = (await reading()).panels.held.map(heldOf);
    // 228 ₪ a year against 0.796% custody and 0.1% the fund's; from 01.2027 468 ₪
    expect(now!.cross).toBeCloseTo(228 / 0.00896, 6);
    expect(later!.cross).toBeCloseTo(468 / 0.00896, 6);
    expect(now!.falls).toBe(true);
    expect(now!.bands?.each.map((b) => b.rate.value)).toEqual([expect.closeTo(0.896, 9), expect.closeTo(0.7, 9), expect.closeTo(0.5, 9)]);
    expect(now?.bands?.from.value).toBeCloseTo(228 / 0.00896, 6);
    expect(later!.changes.map((x) => x.kind)).toEqual(["fixed_period"]);
  });
  it("compares a year just under each step's top with one just over it, the new rate on the whole amount (F-125)", async () => {
    const now = heldOf((await reading()).panels.held[0]!);
    const at100 = now.drops.find((d) => d.at === 100_000)!;
    expect([at100.under.value.value, at100.under.cost.value, at100.over.value.value, at100.over.cost.value]).toEqual([99_000, expect.closeTo(1115.04, 6), 101_000, expect.closeTo(935, 6)]);
    expect(at100.what).toEqual({ kind: "share" });
  });
  it("reads a year on an amount by layer, the shares first", async () => {
    const r = heldOf((await reading()).panels.held[0]!).readAt(60_000);
    // each group's sum is its rows' as shown: the custody's 477.60 ₪ and the fund's 60 ₪ show as 478 ₪ and 60 ₪
    expect(r.groups.map((g) => [g.group, g.total.value])).toEqual([
      ["share", 538],
      ["sum", 228],
    ]);
    expect(r.share.value).toBeCloseTo(1.276, 9);
  });
});

describe("holding, the fees by their kind: custody of 0.15% a year with at least 900 ₪, and 80 ₪ a month of account fee to 08.2027", () => {
  const deal: FeeDeal = {
    id: "deal-k",
    name: "",
    kind: "brokerage-account",
    fees: [
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.15), per: 12, every: 12, min: typed(900) } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(80), every: 1 }, until: "2027-08" }, { price: { form: "sum", amount: typed(0), every: 1 } }] },
    ],
  };
  /** The chart of today's period, or of the one from 08.2027. */
  const held = (k: 0 | 1): HeldView => {
    const v = readingOf(readDealFor(deal, data.kinds, "2026-11-20"), data.fx).panels.held[k];
    if (!v || !("chart" in v)) throw new Error(`no holding chart in period ${k}`);
    return v.chart;
  };
  const said = (r: ReturnType<HeldView["readAt"]>) => r.groups.map((g) => [g.group, g.total.value, g.rows.map((x) => [x.fee.ref.kind, x.cost.value, x.part?.part])]);

  it("meets 960 ₪ a year of account fee where the custody's rate passes it, at 640,000 ₪, not where its minimum ends", () => {
    const now = held(0);
    expect(now.cross).toBeCloseTo(960 / 0.0015, 6);
    expect(now.head).toMatchObject({ kind: "cross" });
  });

  it("files the custody at its minimum under the shares, as its lane, and the account fee under the sums", () => {
    const now = held(0);
    expect(now.lanes.map((l) => [l.fee.ref.kind, l.group])).toEqual([
      ["custody", "share"],
      ["fixed_period", "sum"],
    ]);
    expect(said(now.readAt(100_000))).toEqual([
      ["share", 900, [["custody", 900, "min"]]],
      ["sum", 960, [["fixed_period", 960, undefined]]],
    ]);
  });

  it("from 08.2027 has no crossover, heads the chart with the minimum's end at 600,000 ₪, and leaves the account fee of 0 ₪ out of the box", () => {
    const later = held(1);
    expect(later.cross).toBeNull();
    expect(later.head).toMatchObject({ kind: "mark", of: "minEnd", at: { value: expect.closeTo(600_000, 6) } });
    expect(said(later.readAt(100_000))).toEqual([["share", 900, [["custody", 900, "min"]]]]);
    expect(said(later.readAt(1_000_000))).toEqual([["share", expect.closeTo(1500, 9), [["custody", expect.closeTo(1500, 9), "rate"]]]]);
  });
});

describe("holding, a fee whose steps by the value held mix a sum per period and a share (F-124, heldKind)", () => {
  /** Custody by the value held: `sum` ₪ a year up to 100,000 ₪ and `pct`% a year above, with `fixed` ₪ a year of fixed fee beside it. */
  const deal = (sum: number, pct: number, fixed: number): FeeDeal => ({
    id: "deal-m",
    name: "",
    kind: "brokerage-account",
    fees: [
      {
        id: "fee-custody",
        kind: "custody",
        by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100_000)] }],
        cases: [
          { id: "c1", when: [0], stages: [{ price: { form: "sum", amount: typed(sum), every: 12 } }] },
          { id: "c2", when: [1], stages: [{ price: { form: "held", rate: typed(pct), per: 12, every: 12 } }] },
        ],
      },
      ...(fixed > 0 ? [{ id: "fee-fixed", kind: "fixed_period" as const, stages: [{ price: { form: "sum" as const, amount: typed(fixed), every: 12 as const } }] }] : []),
    ],
  });
  const held = (d: FeeDeal): HeldView => {
    const v = readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held[0];
    if (!v || !("chart" in v)) throw new Error("no holding chart");
    return v.chart;
  };
  const said = (r: ReturnType<HeldView["readAt"]>) => r.groups.map((g) => [g.group, g.total.value, g.rows.map((x) => [x.fee.ref.kind, x.cost.value, x.part?.part])]);

  it("stands the custody under both kinds, each lane with its own steps: the sum up to 100,000 ₪, the share above it", () => {
    const c = held(deal(240, 0.1, 1200));
    expect(c.lanes.map((l) => [l.fee.ref.kind, l.group])).toEqual([
      ["custody", "share"],
      ["custody", "sum"],
      ["fixed_period", "sum"],
    ]);
    expect(new Set(c.lanes.map((l) => l.id)).size).toBe(3);
    expect(c.lanes.map((l) => l.parts?.map((x) => [x.part, x.figure?.value, x.from, x.to]) ?? null)).toEqual([
      [["rate", 0.1, 100_000, null]],
      [["sum", 240, 0, 100_000]],
      null,
    ]);
  });

  it("files the custody's year under the kind its step charges, in the box and in the layers: a sum at 50,000 ₪, a share at 2,000,000 ₪", () => {
    const c = held(deal(240, 0.1, 1200));
    // 50,000 ₪: the custody's 240 ₪ and the fixed 1,200 ₪, both sums; 2,000,000 ₪: the custody's 0.1% = 2,000 ₪, and the fixed 1,200 ₪
    expect(said(c.readAt(50_000))).toEqual([["sum", 1440, [["custody", 240, "sum"], ["fixed_period", 1200, undefined]]]]);
    expect(said(c.readAt(2_000_000))).toEqual([
      ["share", expect.closeTo(2000, 9), [["custody", expect.closeTo(2000, 9), "rate"]]],
      ["sum", 1200, [["fixed_period", 1200, undefined]]],
    ]);
    const at = (v: number) => c.sample({ lo: v, hi: v * 1.0001 }, 1)[0]?.layers;
    expect(at(50_000)).toEqual([0, expect.closeTo(240 / 50_000, 12), expect.closeTo(1200 / 50_000, 12)]);
    expect(at(2_000_000)).toEqual([expect.closeTo(0.001, 12), 0, expect.closeTo(1200 / 2_000_000, 12)]);
  });

  it("meets the sums where the share passes them: 1,200 ₪ a year over 0.1% is 1,200,000 ₪, the bands from there", () => {
    const c = held(deal(240, 0.1, 1200));
    expect(c.cross).toBeCloseTo(1_200_000, 6);
    expect(c.bands?.from.value).toBeCloseTo(1_200_000, 6);
    expect(c.bands?.each.map((b) => b.rate.value)).toEqual([expect.closeTo(0.1, 9)]);
  });

  it("at exactly 100,000 ₪ charges the sum's step alone: its marks, headline, drop, box and the parts holding it", () => {
    const c = held(deal(240, 0.1, 1200));
    // the step's top and the crossover, where 0.1% of 1,200,000 ₪ is the fixed 1,200 ₪
    expect(c.marks.map((m) => [m.kind, m.at])).toEqual([
      ["edge", 100_000],
      ["cross", expect.closeTo(1_200_000, 6)],
    ]);
    expect(c.head).toMatchObject({ kind: "cross", meets: "same", at: { value: expect.closeTo(1_200_000, 6) } });
    // 99,000 ₪: 240 + 1,200 = 1,440 ₪; 101,000 ₪: 0.1% of it, 101 ₪, and 1,200 ₪ = 1,301 ₪; above the top the custody is a share
    expect(c.drops.map((d) => [d.at, d.what, d.under.value.value, d.under.cost.value, d.over.value.value, d.over.cost.value])).toEqual([[100_000, { kind: "share" }, 99_000, 1440, 101_000, expect.closeTo(1301, 9)]]);
    // F-115: at the top the lower step charges, so the custody is the sum's 240 ₪ and nothing is a share
    expect(said(c.readAt(100_000))).toEqual([["sum", 1440, [["custody", 240, "sum"], ["fixed_period", 1200, undefined]]]]);
    expect(c.lanes.map((l) => (l.parts ? (partAt(l.parts, 100_000)?.part ?? "none") : null))).toEqual(["none", "sum", null]);
    expect(c.lanes.map((l) => (l.parts ? (partAt(l.parts, 100_001)?.part ?? "none") : null))).toEqual(["rate", "none", null]);
  });

  it("adds its groups' totals up to the year's total at every value", () => {
    const c = held(deal(240, 0.1, 1200));
    for (const v of [10_000, 99_000, 100_000, 101_000, 1_200_000, 5_000_000]) {
      const r = c.readAt(v);
      expect(r.groups.reduce((a, g) => a + (g.total.value as number), 0), String(v)).toBeCloseTo(r.total.value as number, 9);
    }
  });

  it("is a cut where the sums drop to the share's charge: 120 ₪ a year up to 100,000 ₪, then 0.15%, where the shares cost more past it", () => {
    // at 100,000 ₪ the sum's 120 ₪ still charges and nothing is a share; just above, the share is 150 ₪ and the sums nothing
    const c = held(deal(120, 0.15, 0));
    expect(c.cross).toBe(100_000);
    expect(c.head).toMatchObject({ kind: "cross", meets: "past" });
  });
});

describe("holding, the sentence at a drop, by what the fee whose step ends there does over it (F-125)", () => {
  /** Custody by the value held: `below` up to 100,000 ₪ and `above` over it, with `fixed` ₪ a year of fixed fee and a fund's `fund`% beside it. */
  const deal = (below: Price, above: Price, fixed = 0, fund = 0): FeeDeal => ({
    id: "deal-d",
    name: "",
    kind: "brokerage-account",
    fees: [
      {
        id: "fee-custody",
        kind: "custody",
        by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100_000)] }],
        cases: [
          { id: "c1", when: [0], stages: [{ price: below }] },
          { id: "c2", when: [1], stages: [{ price: above }] },
        ],
      },
      ...(fixed > 0 ? [{ id: "fee-fixed", kind: "fixed_period" as const, stages: [{ price: { form: "sum" as const, amount: typed(fixed), every: 12 as const } }] }] : []),
      ...(fund > 0 ? [{ id: "fee-fund", kind: "fund_management" as const, stages: [{ price: { form: "held" as const, rate: typed(fund), per: 12 as const, every: 12 as const } }] }] : []),
    ],
  });
  const drops = (d: FeeDeal) => {
    const v = readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held[0];
    if (!v || !("chart" in v)) throw new Error("no holding chart");
    return v.chart.drops.map((x) => [x.at, x.what.kind, x.under.value.value, x.under.cost.value, x.over.value.value, x.over.cost.value]);
  };
  const free: Price = { form: "free" };
  const monthly = (n: number): Price => ({ form: "sum", amount: typed(n), every: 1 });
  const yearly = (n: number): Price => ({ form: "sum", amount: typed(n), every: 12 });

  it("says the custody stops where 10 ₪ a month ends at 100,000 ₪: 99,000 ₪ cost 120 ₪ and 101,000 ₪ nothing", () => {
    expect(drops(deal(monthly(10), free))).toEqual([[100_000, "stops", 99_000, 120, 101_000, 0]]);
    // beside a fund's 0.1% a year: 120 + 99 = 219 ₪ under it, 101 ₪ over it
    expect(drops(deal(monthly(10), free, 0, 0.1))).toEqual([[100_000, "stops", 99_000, expect.closeTo(219, 9), 101_000, expect.closeTo(101, 9)]]);
  });

  it("says the custody stops where 0.2% a year ends at 100,000 ₪, beside 100 ₪ a year: 298 ₪ under it, 100 ₪ over it", () => {
    expect(drops(deal({ form: "held", rate: typed(0.2), per: 12, every: 12 }, free, 100))).toEqual([[100_000, "stops", 99_000, expect.closeTo(298, 9), 101_000, 100]]);
  });

  it("says the custody's price falls where 240 ₪ a year gives way to 60 ₪ a year at 100,000 ₪", () => {
    expect(drops(deal(yearly(240), yearly(60)))).toEqual([[100_000, "falls", 99_000, 240, 101_000, 60]]);
  });
});

describe("a lane's part at an amount (partAt)", () => {
  const part = (from: number, to: number | null): LanePart => ({ part: "sum", from, to, i: 0 });

  it("is the part holding the amount, more than its bottom and up to its top, and none outside every part", () => {
    const sumUpTo = [part(0, 100_000)];
    const shareFrom = [part(100_000, null)];
    expect(partAt(sumUpTo, 100_000)).toBe(sumUpTo[0]);
    expect(partAt(sumUpTo, 150_000)).toBeUndefined();
    expect(partAt(shareFrom, 100_000)).toBeUndefined();
    expect(partAt(shareFrom, 100_001)).toBe(shareFrom[0]);
    expect(partAt(shareFrom, 50_000)).toBeUndefined();
  });
});

describe("holding, the bands from the first value above the crossover where every share is at its rate", () => {
  it("starts them where the custody's minimum ends, 600,000 ₪, when the crossover, 100,000 ₪, falls inside it", () => {
    // custody of 0.15% a year with at least 900 ₪, a fund's 0.1% a year, and 1,000 ₪ a year: the shares cost 900 + 0.001 × B up to
    // 600,000 ₪, which is 1,000 ₪ at 100,000 ₪; from 600,000 ₪ both shares are at their rates, 0.25% a year
    const deal: FeeDeal = {
      id: "deal-b",
      name: "",
      kind: "brokerage-account",
      fees: [
        { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.15), per: 12, every: 12, min: typed(900) } }] },
        { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] },
        { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(1000), every: 12 } }] },
      ],
    };
    const v = readingOf(readDealFor(deal, data.kinds, "2026-11-20"), data.fx).panels.held[0];
    if (!v || !("chart" in v)) throw new Error("no holding chart");
    expect(v.chart.cross).toBeCloseTo(100_000, 6);
    expect(v.chart.bands?.from.value).toBeCloseTo(600_000, 6);
    expect(v.chart.bands?.each.map((b) => [b.rate.value, b.to])).toEqual([[expect.closeTo(0.25, 9), undefined]]);
  });
});

describe("what changes and when", () => {
  it("costs an idle month 19 ₪ today and 39 ₪ from 01.2027, when 67 ₪ of trading covers the fixed account fee", async () => {
    const [now, later] = (await reading()).timeline;
    expect(now!.idle!.total.value).toBe(19);
    expect(later!.idle!.total.value).toBe(39);
    expect(later!.covers).toEqual([expect.objectContaining({ against: "trade", action: "trade", side: "all", from: expect.objectContaining({ value: 67, computed_from: expect.objectContaining({ formula: "F-127" }) }) })]);
  });
  it("states directive 415's bound beside the idle month at a bank, and nothing beside it elsewhere (F-126)", async () => {
    const deal = (await unpackDeal(link.split("#d=")[1]!))!;
    const at = (provider: string) => readingOf(readDealFor({ ...deal, provider } as typeof deal, data.kinds, "2026-11-20"), data.fx).timeline[0]!.idle!.bank;
    expect(at("bank")).toEqual(["BRK-61"]);
    expect(at("non-bank")).toEqual([]);
  });
});

describe("a deal read whole, whatever the fees an action or a holding prices are charged in", () => {
  // a dollar at 3.70 ₪: the ECB's rates per euro, as a fixed snapshot
  if (!data.fx) throw new Error("the site's exchange rates");
  const fx = { ...data.fx, perEur: { ILS: 3.7, USD: 1 } };
  const us = (fees: FeeDeal["fees"]): FeeDeal => ({ id: "deal-x", name: "", kind: "brokerage-account", readFor: [{ by: "what", is: "us" }], fees });
  const trade = (rate: number): FeeDeal["fees"][number] => ({ id: "fee-t", kind: "trade", by: [{ kind: "what", values: ["us"] }], cases: [{ id: "c1", when: [["us"]], stages: [{ price: { form: "action", rate: typed(rate) } }] }] });
  const account = { id: "fee-a", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(15), every: 1, offset: { kind: "trade" } } }] } as const satisfies FeeDeal["fees"][number];
  const read = (deal: FeeDeal, unitPrice: number | null = null) => readingOf(readDealFor(deal, data.kinds, "2026-11-20"), fx, unitPrice);
  const coverOf = (deal: FeeDeal, unitPrice: number | null = null) => read(deal, unitPrice).timeline.flatMap((t) => t.covers.map((c) => (c.from === "any" ? "any" : c.from.value)));

  it("counts only the trade fee towards an offset set against it, beside a conversion with a minimum in dollars: 15 ₪ at 0.1% is 15,000 ₪ (F-127)", () => {
    const fxFee = { id: "fee-x", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2), min: typed(5), currency: "USD" } }] } as const satisfies FeeDeal["fees"][number];
    expect(coverOf(us([trade(0.1), fxFee, account]))).toEqual([15_000]);
  });
  it("reads an offset set against a trade fee with a third party's sum per unit once the unit's price is given, and says nothing before (F-117, F-127)", () => {
    // 0.1% with at least 5 ₪, and 0.005 $ a unit at 50 $ a unit, 0.01% of the action: max(5, 0.1% × a) + 0.01% × a reaches 15 ₪ at 13,636.36 ₪
    const deal: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(5), third: { who: "הברוקר", price: { form: "perUnit", amount: typed(0.005), currency: "USD" } } } }] }, account],
    };
    expect(coverOf(deal)).toEqual([]);
    expect(coverOf(deal, 50)).toEqual([13_637]);
    // the figure rests on the unit's price given, as on the trade fee's figures
    const [cover] = read(deal, 50).timeline.flatMap((t) => t.covers);
    expect(cover?.from !== "any" && cover?.from.computed_from?.inputs).toMatchObject({ "deal:unit-price": expect.objectContaining({ value: 50, state: "entered" }), "deal:trade": expect.anything() });
  });
  it("says the cover beside another fee on the action priced per unit before the unit's price is given: it prices only the trade fee (F-127)", () => {
    const deal: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [
        { id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(5) } }] },
        { id: "fee-s", kind: "spread", stages: [{ price: { form: "action", rate: typed(0.05), third: { who: "הברוקר", price: { form: "perUnit", amount: typed(0.005), currency: "USD" } } } }] },
        account,
      ],
    };
    expect(coverOf(deal)).toEqual([15_000]);
  });
  it("reads a purchase whose conversion has a third party's sum per unit as one with a conversion priced per unit itself: no one rate (F-123)", () => {
    const thirdFee = { id: "fee-x", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2), third: { price: { form: "perUnit", amount: typed(0.005), currency: "USD" } } } }] } as const satisfies FeeDeal["fees"][number];
    expect(read(us([trade(0.1), thirdFee]), 50).panels.actions.find((t) => t.key === "trade:all")?.views).toEqual([{ one: expect.objectContaining({ one: null }) }]);
  });
  it("reads a year of an account fee changed by the value held in dollars: 25 ₪ a month on a small value, 300 ₪ a year (F-111, F-115)", () => {
    const deal: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [
        {
          id: "fee-1",
          kind: "fixed_period",
          by: [{ kind: "portfolioSize", unit: "USD", tops: [typed(10_000)] }],
          cases: [
            { id: "c0", when: [0], stages: [{ price: { form: "sum", amount: typed(25), every: 1 } }] },
            { id: "c1", when: [1], stages: [{ price: { form: "sum", amount: typed(15), every: 1 } }] },
          ],
        },
      ],
    };
    // a sum by the value held has a mark at its step's top (F-115), so it is a chart, read at a small value
    const [held] = read(deal).panels.held;
    expect(held && "chart" in held).toBe(true);
    if (!held || !("chart" in held)) return;
    expect(held.chart.readAt(1_000).total.value).toBe(300);
  });
});

describe("a step that charges nothing, free or a price of zero (F-110, F-115)", () => {
  const held = (rate: number) => ({ price: { form: "held", rate: typed(rate), per: 12, every: 12 } }) as const;
  const free = { price: { form: "free" } } as const;
  const custody = (tops: number[], ...steps: FeeDeal["fees"][number]["stages"][]): FeeDeal["fees"][number] =>
    ({ id: "fee-c", kind: "custody", by: [{ kind: "portfolioSize", unit: "ILS", tops: tops.map((t) => typed(t)) }], cases: steps.map((stages, k) => ({ id: `c${k}`, when: [k], stages })) }) as FeeDeal["fees"][number];
  const fund = { id: "fee-m", kind: "fund_management", stages: [held(0.1)] } as FeeDeal["fees"][number];
  const account = (amount: number) => ({ id: "fee-a", kind: "current_account", stages: [{ price: { form: "sum", amount: typed(amount), every: 1 } }] }) as FeeDeal["fees"][number];
  const deal = (...fees: FeeDeal["fees"]): FeeDeal => ({ id: "deal-x", name: "", kind: "brokerage-account", fees });
  const view = (d: FeeDeal) => got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held[0], "holding view");
  const parts = (v: ReturnType<typeof view>) => got(heldOf(v).lanes.find((l) => l.fee.ref.kind === "custody")?.parts, "custody's parts").map((x) => [x.part, x.from, x.to]);

  it("stays a step on the holding chart: its top is a mark, and the shares' bands rise there, so the share is not said to fall", () => {
    // custody free up to 100,000 ₪ and 0.2% above, a fund's 0.1% and 5 ₪ a month: the fund alone reaches 60 ₪ at 60,000 ₪ (F-124)
    const shown = view(deal(custody([100_000], [free], [held(0.2)]), fund, account(5)));
    const v = heldOf(shown);
    expect(parts(shown)).toEqual([["free", 0, 100_000], ["rate", 100_000, null]]);
    expect(v.marks.map((m) => Math.round(m.at))).toEqual([60_000, 100_000]);
    expect(v.bands?.each.map((b) => [b.rate.value, b.to?.value ?? null])).toEqual([[expect.closeTo(0.1, 9), 100_000], [expect.closeTo(0.3, 9), null]]);
    expect(v.falls).toBe(false);
  });
  it("draws a chart, not one number, where a free step comes before a share, and marks the top of a share before a free step", () => {
    const after = view(deal(custody([100_000], [free], [held(0.1)])));
    expect("chart" in after).toBe(true);
    expect(heldOf(after).marks.map((m) => m.at)).toEqual([100_000]);
    const before = view(deal(custody([1_000_000], [held(0.2)], [free])));
    expect(parts(before)).toEqual([["rate", 0, 1_000_000], ["free", 1_000_000, null]]);
    expect(heldOf(before).readAt(2_000_000).total.value).toBe(0);
  });
  it("reads a step of 0% as a free one", () => {
    expect(parts(view(deal(custody([100_000], [held(0.2)], [held(0)]))))).toEqual([["rate", 0, 100_000], ["free", 100_000, null]]);
  });
  it("leaves a fee that charges nothing in the period off the chart, so the others' one number stands: 0 ₪ a month, or 0% a year", () => {
    expect(view(deal({ id: "fee-c", kind: "custody", stages: [held(0.1)] } as FeeDeal["fees"][number], account(0)))).toEqual({ one: expect.objectContaining({ one: { value: expect.objectContaining({ value: 0.1 }), of: "share" } }) });
    expect(view(deal({ id: "fee-c", kind: "custody", stages: [held(0)] } as FeeDeal["fees"][number], account(10)))).toEqual({ one: expect.objectContaining({ one: { value: expect.objectContaining({ value: 120 }), of: "sum" } }) });
  });
});

describe("what an action costs at the reader's amount, as the card says it", () => {
  // a dollar at 3.70 ₪: the ECB's rates per euro, as a fixed snapshot
  if (!data.fx) throw new Error("the site's exchange rates");
  const fx = { ...data.fx, perEur: { ILS: 3.7, USD: 1 } };
  const deal = (fees: FeeDeal["fees"], us = false): FeeDeal => ({ id: "deal-x", name: "", kind: "brokerage-account", ...(us ? { readFor: [{ by: "what", is: "us" }] } : {}), fees });
  const tradeOf = (d: FeeDeal) => chartOf(got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), fx).panels.actions.find((t) => t.action === "trade")?.views[0], "trade's view"));
  const withThird = { id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(5), third: { who: "הבורסה", price: { form: "action", rate: typed(0.02) } } } }] } as FeeDeal["fees"][number];

  it("counts a third party's share in the rate the headline and the card name: 0.12% from 5,000 ₪, not 0.1% (F-117)", () => {
    const c = tradeOf(deal([withThird]));
    expect(c.head).toMatchObject({ kind: "below", below: { value: 5000 }, rate: { value: expect.closeTo(0.12, 9) } });
    expect(c.readAt(10_000).parts[0]?.rate?.value).toBeCloseTo(0.12, 9);
  });
  it("adds the fee's share with its third party's to the others': 0.32% is 0.12% and the conversion's 0.2%", () => {
    const c = tradeOf(deal([withThird, { id: "fee-x", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] }], true));
    expect(c.head.kind === "below" && c.head.adds.map((a) => a.rate.value)).toEqual([expect.closeTo(0.12, 9), 0.2]);
  });
  it("says what the minimum adds to the fee's own rate alone, the third party's share apart: 3 ₪ at 2,000 ₪, by the fee's 0.1%", () => {
    const p = got(tradeOf(deal([withThird])).readAt(2000).parts[0], "part");
    expect(p.cost.value).toBeCloseTo(5.4, 9);
    expect(p.rate?.value).toBe(0.1);
    expect(p.rateAlone?.value).toBeCloseTo(2, 9);
    expect(p.apart?.value).toBeCloseTo(3, 9);
  });
  it("names the rate of the step the point is in where its minimum decides: half the line's 0.17% at 380 ₪ (F-115, F-116)", () => {
    const usd = (q: Omit<Extract<Price, { form: "action" }>, "form" | "currency">): Price => ({ form: "action", ...q, currency: "USD" });
    const line = { rate: typed(0.17), min: typed(6), max: typed(1055) };
    const conversion = deal([
      {
        id: "fee-fx",
        kind: "fx",
        by: [{ kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }],
        cases: [
          { id: "x1", when: [0], stages: [{ price: { form: "free" } }] },
          { id: "x2", when: [1], stages: [{ price: { ...usd(line), discount: { pct: typed(50), alsoMin: true } } as Price }] },
          { id: "x3", when: [2], stages: [{ price: usd(line) }] },
        ],
      },
    ]);
    const tab = readingOf(readDealFor(conversion, data.kinds, "2026-11-20"), fx).panels.actions.find((t) => t.action === "conversion");
    const p = got(chartOf(got(tab?.views[0], "conversion's view")).readAt(380).parts[0], "part");
    expect(p.part?.part).toBe("min");
    expect(p.rate?.value).toBeCloseTo(0.085, 9);
  });
  it("says nothing of a minimum that adds less than the figures show: at 4,996 ₪, 5 ₪ against 0.1%'s 5.00 ₪", () => {
    const p = got(tradeOf(deal([{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(5) } }] }])).readAt(4996).parts[0], "part");
    expect(p.part?.part).toBe("min");
    expect(p.apart).toBeUndefined();
  });
  it("gives each fee's cost as shown and their total as the sum of those: 42 ₪ and 17 ₪ make 59 ₪, not 58 ₪", () => {
    const r = tradeOf(
      deal(
        [
          { id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.4178), min: typed(1) } }] },
          { id: "fee-x", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.1671) } }] },
        ],
        true,
      ),
    ).readAt(10_000);
    // the lines show 42 ₪ and 17 ₪; their values stay as computed, 41.78 ₪ and 16.71 ₪
    expect(r.parts.map((p) => p.cost.value)).toEqual([expect.closeTo(41.78, 9), expect.closeTo(16.71, 9)]);
    expect(r.total.value).toBe(59);
  });
  it("gives each year's row as shown and the groups and the total as their sums on the holding chart", () => {
    const held = (rate: number, extra = {}) => ({ price: { form: "held", rate: typed(rate), per: 12, every: 12, ...extra } }) as const;
    const d = deal([
      { id: "fee-c", kind: "custody", stages: [held(0.4178, { min: typed(1) })] },
      { id: "fee-m", kind: "fund_management", stages: [held(0.1671)] },
    ] as FeeDeal["fees"]);
    const v = heldOf(got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), fx).panels.held[0], "holding view")).readAt(10_000);
    expect(v.groups.flatMap((g) => g.rows.map((x) => x.cost.value))).toEqual([expect.closeTo(41.78, 9), expect.closeTo(16.71, 9)]);
    expect(v.groups.map((g) => g.total.value)).toEqual([59]);
    expect(v.total.value).toBe(59);
  });
});

describe("a stretch under the axis's start (F-112)", () => {
  it("is listed to be said in words under the chart, and the headline counts only the marks the chart draws", () => {
    // a trade of 4 ₪ up to 100 ₪ and 0.1% above, up to 50,000 ₪, and 0.05% above that: the axis opens from 10,000 ₪, the rate's end
    const d: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [
        {
          id: "fee-t",
          kind: "trade",
          by: [{ kind: "actionSize", unit: "ILS", tops: [typed(50_000)] }],
          cases: [
            { id: "c0", when: [0], stages: [{ price: { form: "action", rate: typed(0.1), flat: { amount: typed(4), upTo: typed(100) } } }] },
            { id: "c1", when: [1], stages: [{ price: { form: "action", rate: typed(0.05) } }] },
          ],
        },
      ],
    };
    const c = chartOf(got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.actions[0]?.views[0], "action's view"));
    expect(c.range.lo).toBe(10_000);
    expect(c.below.map((b) => [b.fee.ref.kind, b.part.part, b.part.end?.value])).toEqual([["trade", "flat", 100]]);
    expect(c.head).toEqual({ kind: "marks", n: 1 });
  });
});

describe("a drop at a step's top (F-125)", () => {
  it("says the price falls, not that the new rate holds on the whole amount, where the next step's minimum decides over it", () => {
    // custody of 0.3% a year up to 100,000 ₪, and 0.1% with at least 200 ₪ above: 101,000 ₪ costs the 200 ₪ minimum, not 0.1% of it
    const d: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [
        {
          id: "fee-c",
          kind: "custody",
          by: [{ kind: "portfolioSize", unit: "ILS", tops: [typed(100_000)] }],
          cases: [
            { id: "c0", when: [0], stages: [{ price: { form: "held", rate: typed(0.3), per: 12, every: 12 } }] },
            { id: "c1", when: [1], stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12, min: typed(200) } }] },
          ],
        },
      ],
    };
    const v = heldOf(got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held[0], "holding view"));
    const drop = got(v.drops.find((x) => x.at === 100_000), "drop at 100,000 ₪");
    expect([drop.under.cost.value, drop.over.cost.value]).toEqual([expect.closeTo(297, 9), 200]);
    expect(drop.what).toEqual({ kind: "falls", fee: expect.objectContaining({ kind: "custody" }) });
  });
});

describe("the periods a chart holds (F-110, F-112)", () => {
  it("joins only periods in a row: a price that comes back after a change starts a view of its own, so each view is one stretch of time", () => {
    // 80 ₪ a month, 20 ₪ from 08.2027 and 80 ₪ again from 01.2028, beside a fund's 0.3% a year
    const d: FeeDeal = {
      id: "deal-x",
      name: "",
      kind: "brokerage-account",
      fees: [
        { id: "fee-a", kind: "current_account", stages: [{ price: { form: "sum", amount: typed(80), every: 1 }, until: "2027-08" }, { price: { form: "sum", amount: typed(20), every: 1 }, until: "2028-01" }, { price: { form: "sum", amount: typed(80), every: 1 } }] },
        { id: "fee-m", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.3), per: 12, every: 12 } }] },
      ],
    };
    const views = readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held;
    expect(views.map((v) => heldOf(v).periods)).toEqual([["2026-11"], ["2027-08"], ["2028-01"]]);
  });
});

describe("a year that costs a smaller share of a larger value (F-123)", () => {
  const custody = (extra: object): FeeDeal => ({ id: "deal-x", name: "", kind: "brokerage-account", fees: [{ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12, ...extra } }] }] });
  const falls = (d: FeeDeal) => heldOf(got(readingOf(readDealFor(d, data.kinds, "2026-11-20"), data.fx).panels.held[0], "holding view")).falls;
  it("is not said where the share stays flat over a stretch: 0.1% a year up to its 1,000 ₪ maximum, or above its 900 ₪ minimum", () => {
    expect(falls(custody({ max: typed(1000) }))).toBe(false);
    expect(falls(custody({ min: typed(900) }))).toBe(false);
  });
  it("is said where a sum is charged beside the share, so the share falls at every value", () => {
    const d = custody({ min: typed(900) });
    d.fees.push({ id: "fee-a", kind: "current_account", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] });
    expect(falls(d)).toBe(true);
  });
});

describe("a curve's samples around a cut", () => {
  it("put the cut and the point just above it next to each other, even where the even spread lands on the cut", () => {
    // the cut where a conversion's second step ended on the ECB rate of 23.11.2026; a range centred on it puts a point of the spread a
    // floating-point step above it, which read the step below and stood between the two
    const c = 357.7541274339519;
    for (const range of [{ lo: c / 2, hi: c * 2 }, { lo: c / 3, hi: c * 3 }, { lo: c * 0.9, hi: c * 1.5 }]) {
      const xs = samples(range, [c], 480);
      const k = xs.indexOf(c);
      expect(k).toBeGreaterThan(0);
      expect(xs[k + 1]).toBe(c * (1 + 1e-9));
      expect(xs.filter((x) => Math.abs(x - c) <= c * 1e-9)).toEqual([c]);
    }
  });
});
