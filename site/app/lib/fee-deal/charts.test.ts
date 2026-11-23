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
import { openingRange, roundAmount, settleRange, type ActionView, type HeldView } from "./charts";
import { nisPerNumber } from "../fx";
import { typed, type FeeDeal, type Price } from "./model";

const data = feesData();
const link = readFileSync(new URL("../../../scripts/layout-check-deal.txt", import.meta.url), "utf8").trim();
const reading = async () => {
  const deal = await unpackDeal(link.split("#d=")[1]!);
  return readingOf(readDealFor(deal!, data.kinds, "2026-11-20"), data.fx);
};
const chartOf = (v: { chart: ActionView } | object) => (v as { chart: ActionView }).chart;
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
    // the minimums are set in dollars, so the shekel sum moves with each data/series/ecb-fx.json refresh
    expect(r.total.value).toBeCloseTo(44 * nisPerNumber(data.fx!, "USD")!, 6);
    expect(r.share.value).toBeCloseTo((Number(r.total.value) / c.start) * 100, 9);
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
      expect(r.total.value).toBeCloseTo(cost, 9);
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
    expect(now!.bands.map((b) => b.rate.value)).toEqual([expect.closeTo(0.896, 9), expect.closeTo(0.7, 9), expect.closeTo(0.5, 9)]);
    expect(later!.changes.map((x) => x.kind)).toEqual(["fixed_period"]);
    expect(later!.offsets).toEqual([expect.objectContaining({ against: "trade", action: "trade" })]);
  });
  it("compares a year just under each step's top with one just over it, the new rate on the whole amount (F-125)", async () => {
    const now = heldOf((await reading()).panels.held[0]!);
    const at100 = now.drops.find((d) => d.at === 100_000)!;
    expect([at100.under.value.value, at100.under.cost.value, at100.over.value.value, at100.over.cost.value]).toEqual([99_000, expect.closeTo(1115.04, 6), 101_000, expect.closeTo(935, 6)]);
  });
  it("reads a year on an amount by layer, the shares first", async () => {
    const r = heldOf((await reading()).panels.held[0]!).readAt(60_000);
    expect(r.groups.map((g) => [g.group, g.total.value])).toEqual([
      ["share", expect.closeTo(537.6, 6)],
      ["fixed", expect.closeTo(228, 6)],
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
  const held = () => readingOf(readDealFor(deal, data.kinds, "2026-11-20"), data.fx).panels.held.map(heldOf);
  const said = (r: ReturnType<HeldView["readAt"]>) => r.groups.map((g) => [g.group, g.total.value, g.rows.map((x) => [x.fee.ref.kind, x.cost.value, x.part?.part])]);

  it("meets 960 ₪ a year of account fee where the custody's rate passes it, at 640,000 ₪, not where its minimum ends", () => {
    const [now] = held();
    expect(now!.cross).toBeCloseTo(960 / 0.0015, 6);
    expect(now!.head).toMatchObject({ kind: "cross" });
  });

  it("files the custody at its minimum under the shares, as its lane, and the account fee under the sums", () => {
    const [now] = held();
    expect(now!.lanes.map((l) => [l.fee.ref.kind, l.group])).toEqual([
      ["custody", "share"],
      ["fixed_period", "fixed"],
    ]);
    expect(said(now!.readAt(100_000))).toEqual([
      ["share", 900, [["custody", 900, "min"]]],
      ["fixed", 960, [["fixed_period", 960, undefined]]],
    ]);
  });

  it("from 08.2027 has no crossover, heads the chart with the minimum's end at 600,000 ₪, and leaves the account fee of 0 ₪ out of the box", () => {
    const [, later] = held();
    expect(later!.cross).toBeNull();
    expect(later!.head).toMatchObject({ kind: "mark", of: "minEnd", at: { value: expect.closeTo(600_000, 6) } });
    expect(said(later!.readAt(100_000))).toEqual([["share", 900, [["custody", 900, "min"]]]]);
    expect(said(later!.readAt(1_000_000))).toEqual([["share", expect.closeTo(1500, 9), [["custody", expect.closeTo(1500, 9), "rate"]]]]);
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
