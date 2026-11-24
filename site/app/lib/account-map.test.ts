import { describe, expect, it } from "vitest";
import { accountMap, cleanUp, type LeftAt } from "./account-map";

/**
 * Three made-up accounts over the same deposits (`base`): what each leaves is the deposits grown less its own cost, so the expected
 * borders follow from the costs by hand.
 * - A: 0.4% of today's amount and 0.24 ₪ for each shekel of the monthly deposit.
 * - B: 300 ₪, 0.1% of today's amount and 0.096 ₪ a shekel of the deposit. A and B cost the same where 0.003 a + 0.144 m = 300: the line
 *   from (100,000, 0) to (0, 2,083.33).
 * - C: 0.35% of today's amount, and 2,000 ₪ more with any monthly deposit: with none it is cheaper than A at any amount, and than B below
 *   120,000 ₪ (0.0035 a = 300 + 0.001 a); with a deposit it wins nowhere on the map (it would need over 8,000 ₪ a month).
 */
const base = (a: number, m: number) => 1.3 * a + 140 * m;
const costs: Record<string, (a: number, m: number) => number> = {
  a: (a, m) => 0.004 * a + 0.24 * m,
  b: (a, m) => 300 + 0.001 * a + 0.096 * m,
  c: (a, m) => 0.0035 * a + (m > 0 ? 2000 : 0),
};
const cost = (id: string, a: number, m: number) => costs[id]?.(a, m) ?? Infinity;
const order = ["a", "b", "c"];
let asked = 0;
const leftAt: LeftAt = (a, m, houses) => {
  asked += (houses ?? order).length;
  return new Map((houses ?? order).map((id) => [id, base(a, m) - cost(id, a, m)]));
};
const reach = { amount: 1_000_000, monthly: 10_000 };
/** A value the test's setup must have, else the test stops naming what was missing. */
function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing: ${what}`);
  return x;
}


describe("the account map (F-131)", () => {
  const map = need(accountMap({ leftAt, order, plan: { amount: 10_000, monthly: 500 }, reach }), "the map");

  it("names the account that costs least at the plan, and the nearest switch along each axis", () => {
    expect(map.plan.winner).toBe("a");
    // at 500 ₪ a month: 0.003 a + 72 = 300; at 10,000 ₪ today: 30 + 0.144 m = 300
    expect(map.switches.amount).toMatchObject({ dir: "up", to: "b" });
    expect(need(map.switches.amount, "a switch along the amount").at).toBeCloseTo(76_000, 0);
    expect(map.switches.monthly).toMatchObject({ dir: "up", to: "b" });
    expect(need(map.switches.monthly, "a switch along the deposit").at).toBeCloseTo(1875, 1);
  });

  it("runs each axis past the plan's farthest switch with room, to a clean value", () => {
    // 1.5 × 76,000 = 114,000, up to 150,000; 1.5 × 1,875 = 2,812.5, up to 3,000
    expect(map.max).toEqual({ amount: 150_000, monthly: 3000 });
  });

  it("draws the border where the two accounts' figures are equal, not where a grid steps", () => {
    const ab = map.borders.filter((b) => b.a === "a" && b.b === "b");
    expect(ab.length).toBeGreaterThan(0);
    const pts = ab.flatMap((b) => b.points);
    expect(pts.length).toBeGreaterThan(20);
    for (const [a, m] of pts) expect(Math.abs(a / 100_000 + m / (300 / 0.144) - 1)).toBeLessThan(1e-6);
    // and it reaches across the map, from the areas' bottom row (1% of the monthly range, 30 ₪, above no deposit: 98,560 ₪) to the left edge
    expect(Math.max(...pts.map((p) => p[0]))).toBeCloseTo(98_560, 0);
    expect(Math.max(...pts.map((p) => p[1]))).toBeGreaterThan(2_000);
  });

  it("keeps the line for no monthly deposit apart: from 0, C up to where B becomes cheaper, then B", () => {
    expect(map.edge.map((e) => e.id)).toEqual(["c", "b"]);
    const [c, b] = [need(map.edge[0], "C's stretch"), need(map.edge[1], "B's stretch")];
    expect(c.from).toBe(0);
    expect(c.to).toBeCloseTo(120_000, 0);
    expect(b.from).toBe(c.to);
    expect(b.to).toBe(150_000);
  });

  it("gives every area to its winner, the plan's first, and C only on the edge", () => {
    expect(map.winners).toEqual(["a", "b", "c"]);
    expect(map.tiles.some((t) => t.id === "c")).toBe(false);
    // a tile of A lies below the border, one of B above it
    for (const t of map.tiles) {
      const [a, m] = t.poly.reduce(([x, y], p) => [x + p[0] / t.poly.length, y + p[1] / t.poly.length], [0, 0]);
      const side = a / 100_000 + m / (300 / 0.144) - 1;
      if (Math.abs(side) > 0.02) expect(t.id).toBe(side < 0 ? "a" : "b");
    }
  });

  it("prices only the accounts that can win once the coarse grid has found them", () => {
    asked = 0;
    accountMap({ leftAt, order, plan: { amount: 10_000, monthly: 500 }, reach });
    // every account at every point would be 3 × (2 lines × 24 + 49 + 13 + 4,000 or so); C drops out of the cells after the coarse grid
    expect(asked).toBeLessThan(2500);
  });

  it("finds a switch at a lower amount when the plan is past a border", () => {
    const past = need(accountMap({ leftAt, order, plan: { amount: 90_000, monthly: 500 }, reach }), "the map past the border");
    expect(past.plan.winner).toBe("b");
    expect(past.switches.amount).toMatchObject({ dir: "down", to: "a" });
    expect(need(past.switches.amount, "the switch down").at).toBeCloseTo(76_000, 0);
  });

  it("has no switch where one account is cheapest along the whole line", () => {
    const one: LeftAt = (a, m, houses) => new Map((houses ?? order).map((id) => [id, base(a, m) - (id === "a" ? 0 : 1 + cost(id, a, m))]));
    const only = need(accountMap({ leftAt: one, order, plan: { amount: 10_000, monthly: 500 }, reach }), "the map of one account");
    expect(only.switches).toEqual({ amount: null, monthly: null });
    expect(only.winners).toEqual(["a"]);
    expect(only.borders).toEqual([]);
  });

  it("rounds an axis's end up to a clean value", () => {
    expect([cleanUp(114_000), cleanUp(2812.5), cleanUp(100_000), cleanUp(31)]).toEqual([150_000, 3000, 100_000, 40]);
  });
});
