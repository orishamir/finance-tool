// The stretches of the index page (D104): an account's best and worst, every fund's spot, the ruler's scale and ticks, on made-up funds
// and on the collected data.
import { describe, expect, it } from "vitest";
import type { FundWay } from "./invest";
import { buildInvest, indexById } from "./invest";
import { cleanStep, placeOn, scaleOf, stretchOf, stretchesOf, ticksOf } from "./stretch";
import { allFunds } from "../components/invest/pair";
import { bundle, plan } from "../components/invest/render-fixtures";

/** A fund priced at the houses given, by their values; a house given null holds a row with no price, one given `{ open }` a pair on an open rule. */
const way = (id: string, at: Record<string, number | null | { open: number }>) =>
  ({
    rec: { id },
    byHouse: Object.fromEntries(
      Object.entries(at).map(([h, v]) => [h, v === null ? { availability: null } : typeof v === "number" ? { valueN: v, value: v, open: false } : { valueN: v.open, value: v.open, open: true }]),
    ),
  }) as unknown as FundWay;

const funds = [way("a", { x: 100, y: 90 }), way("b", { x: 120, y: null }), way("c", { x: 80, y: 95 }), way("d", { z: 70 })];

describe("an account's stretch", () => {
  it("runs from its dearest fund's value to its cheapest's, every priced fund a spot, most first", () => {
    const x = stretchOf(funds, "x")!;
    expect(x.best).toBe(120);
    expect(x.worst).toBe(80);
    expect(x.bestFund).toBe("b");
    expect(x.spots).toEqual([
      { fund: "b", value: 120 },
      { fund: "a", value: 100 },
      { fund: "c", value: 80 },
    ]);
  });
  it("leaves out a fund it gives no price, and is null where it prices none", () => {
    const y = stretchOf(funds, "y")!;
    expect(y.spots.map((s) => s.fund)).toEqual(["c", "a"]);
    expect([y.best, y.worst]).toEqual([95, 90]);
    expect(stretchOf(funds, "w")).toBeNull();
  });
  it("one priced fund is a stretch of one spot, its best and worst the same", () => {
    const z = stretchOf(funds, "z")!;
    expect([z.best, z.worst, z.spots.length]).toEqual([70, 70, 1]);
  });
  it("leaves out a pair on an open rule (G-18, shown, not ranked): no spot, no end, and no stretch where every pair is open", () => {
    const withOpen = [...funds, way("e", { x: 150, y: { open: 200 } }), way("f", { v: { open: 99 } })];
    const x = stretchOf(withOpen, "x")!;
    expect(x.best).toBe(150);
    const y = stretchOf(withOpen, "y")!;
    expect(y.spots.map((s) => s.fund)).toEqual(["c", "a"]);
    expect(y.best).toBe(95);
    expect(stretchOf(withOpen, "v")).toBeNull();
    expect(scaleOf(stretchesOf(withOpen, ["x", "y", "z", "v"]))).toEqual({ lo: 70, hi: 150 });
  });
  it("every account in the order given, one that prices nothing left out", () => {
    expect(stretchesOf(funds, ["z", "w", "x"]).map((s) => s.house)).toEqual(["z", "x"]);
  });
});

describe("the ruler's scale", () => {
  const scale = scaleOf(stretchesOf(funds, ["x", "y", "z"]))!;
  it("runs from the lowest worst to the highest best over every stretch", () => {
    expect(scale).toEqual({ lo: 70, hi: 120 });
    expect(scaleOf([])).toBeNull();
  });
  it("places the most at the top and the least at the foot, a value past an end at that end", () => {
    expect(placeOn(scale, 120)).toBe(0);
    expect(placeOn(scale, 70)).toBe(1);
    expect(placeOn(scale, 95)).toBeCloseTo(0.5);
    expect(placeOn(scale, 200)).toBe(0);
    expect(placeOn(scale, 0)).toBe(1);
    expect(placeOn({ lo: 5, hi: 5 }, 5)).toBe(0.5);
  });
  it("ticks at a clean step, highest first, inside the scale", () => {
    expect(cleanStep(50, 6)).toBe(10);
    expect(cleanStep(9000, 6)).toBe(2000);
    expect(cleanStep(13000, 6)).toBe(2500);
    expect(cleanStep(0, 6)).toBe(0);
    expect(ticksOf(scale, 6)).toEqual([120, 110, 100, 90, 80, 70]);
    expect(ticksOf({ lo: 81_234, hi: 93_870 }, 6)).toEqual([92_500, 90_000, 87_500, 85_000, 82_500]);
  });
});

describe("on the collected data", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const all = allFunds(view);
  const stretches = stretchesOf(all, view.providers.map((p) => p.id));
  it("each account's best and worst are the most and the least its ranked funds leave, and every one of them is a spot", () => {
    expect(stretches.length).toBeGreaterThan(3);
    for (const s of stretches) {
      const values = all.flatMap((f) => {
        const at = f.byHouse[s.house];
        return at && "valueN" in at && !at.open ? [at.valueN] : [];
      });
      expect(s.spots.length, s.house).toBe(values.length);
      expect(s.best, s.house).toBe(Math.max(...values));
      expect(s.worst, s.house).toBe(Math.min(...values));
    }
  });
  it("the scale's ends are the highest best and the lowest worst, and every spot stands inside it", () => {
    const scale = scaleOf(stretches)!;
    expect(scale.hi).toBe(Math.max(...stretches.map((s) => s.best)));
    expect(scale.lo).toBe(Math.min(...stretches.map((s) => s.worst)));
    for (const s of stretches) for (const p of s.spots) expect(placeOn(scale, p.value)).toBeGreaterThanOrEqual(0);
    expect(ticksOf(scale, 7).length).toBeGreaterThan(2);
  });
});
