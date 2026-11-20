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
    // the parts under the axis's start are said under the chart: the trade's cap, the conversion's free and flat stretches
    expect(c.below.map((b) => b.parts.map((x) => x.part))).toEqual([["cap"], ["free", "flat"]]);
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
    expect(r.share.value).toBeCloseTo((r.total.value / c.start) * 100, 9);
    expect(r.share.value).toBeCloseTo(0.77, 3);
    expect(r.parts.map((p) => p.part?.part)).toEqual(["min", "min"]);
    expect(r.parts[0]!.rateAlone!.value).toBeCloseTo(c.start * 0.0025, 9);
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
    expect(r.groups.map((g) => [g.layer, g.total.value])).toEqual([
      ["share", expect.closeTo(537.6, 6)],
      ["fixed", expect.closeTo(228, 6)],
    ]);
    expect(r.share.value).toBeCloseTo(1.276, 9);
  });
});

describe("what changes and when", () => {
  it("costs an idle month 19 ₪ today and 39 ₪ from 01.2027, when 67 ₪ of trading covers the fixed account fee", async () => {
    const [now, later] = (await reading()).timeline;
    expect(now!.idle!.total.value).toBe(19);
    expect(later!.idle!.total.value).toBe(39);
    expect(later!.covers).toEqual([expect.objectContaining({ against: "trade", action: "trade", side: "all", from: expect.objectContaining({ value: 67, computed_from: expect.objectContaining({ formula: "F-127" }) }) })]);
    expect(later!.rest).toBe(true);
  });
  it("states directive 415's bound beside the idle month at a bank, and nothing beside it elsewhere (F-126)", async () => {
    const deal = (await unpackDeal(link.split("#d=")[1]!))!;
    const at = (provider: string) => readingOf(readDealFor({ ...deal, provider } as typeof deal, data.kinds, "2026-11-20"), data.fx).timeline[0]!.idle!.bank;
    expect(at("bank")).toEqual(["BRK-61"]);
    expect(at("non-bank")).toEqual([]);
  });
});
