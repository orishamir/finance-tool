import { describe, expect, it } from "vitest";
import { accountMap, cleanUp, type AccountMap, type LeftAt } from "./account-map";

/**
 * Made-up accounts over the same deposits: what each leaves is today's amount and 100 times the monthly deposit, less its own cost, so the
 * expected points follow from the costs by hand. θ is 0.5%, as P-01.
 * - A: 2% of today's amount and 1 ₪ for each shekel of the monthly deposit.
 * - B: 600 ₪, 0.5% of today's amount and 0.2 ₪ a shekel of the deposit. B leaves 0.015 a + 0.8 m − 600 more than A.
 */
const THETA = 0.005;
const left = (a: number, m: number, cost: number) => a + 100 * m - cost;
const linear: Record<string, (a: number, m: number) => number> = {
  a: (a, m) => left(a, m, 0.02 * a + m),
  b: (a, m) => left(a, m, 600 + 0.005 * a + 0.2 * m),
};
let asked = 0;
const leftOf =
  (accounts: Record<string, (a: number, m: number) => number>): LeftAt =>
  (a, m, houses) => {
    const ids = houses ?? Object.keys(accounts);
    asked += ids.length;
    return new Map(ids.flatMap((id) => (accounts[id] ? [[id, accounts[id](a, m)] as const] : [])));
  };
const reach = { amount: 500_000, monthly: 10_000 };
const mapOf = (accounts: Record<string, (a: number, m: number) => number>, plan: { amount: number; monthly: number }) =>
  need(accountMap({ leftAt: leftOf(accounts), order: Object.keys(accounts), theta: THETA, plan, reach }), "the map");
/** A value the test's setup must have, else the test stops naming what was missing. */
function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing: ${what}`);
  return x;
}

/** The field's reading at node (i, j): its first account, and how far ahead. */
function nodeAt(map: AccountMap, i: number, j: number) {
  const k = j * map.field.cols + i;
  return { first: map.accounts[map.field.first[k] ?? -1], ahead: map.field.ahead[k] ?? NaN };
}
const xOf = (map: AccountMap, i: number) => (map.max.amount * i) / (map.field.cols - 1);
const yOf = (map: AccountMap, j: number) => map.bottom + ((map.max.monthly - map.bottom) * j) / (map.field.rows - 1);
/** The exact first and lead at a point, from the accounts themselves. */
function exactAt(accounts: Record<string, (a: number, m: number) => number>, a: number, m: number) {
  const vs = Object.entries(accounts)
    .map(([id, f]) => ({ id, v: f(a, m) }))
    .sort((x, y) => y.v - x.v);
  const [p, q] = vs;
  return { first: p?.id, ahead: p && q ? Math.min(1, (p.v - q.v) / p.v / THETA) : 1 };
}
/** Every node of the field reads as the accounts do: the same first wherever the first is a third of θ ahead or more, and a lead within 0.15. */
function expectFieldTrue(map: AccountMap, accounts: Record<string, (a: number, m: number) => number>) {
  const wrong: string[] = [];
  for (let j = 0; j < map.field.rows; j++)
    for (let i = 0; i < map.field.cols; i++) {
      const got = nodeAt(map, i, j);
      const want = exactAt(accounts, xOf(map, i), yOf(map, j));
      if ((want.ahead > 0.33 && got.first !== want.first) || Math.abs(got.ahead - want.ahead) > 0.15) wrong.push(`(${xOf(map, i)}, ${yOf(map, j)}): ${got.first} ${got.ahead} against ${want.first} ${want.ahead}`);
    }
  expect(wrong.slice(0, 5), `${wrong.length} nodes read otherwise`).toEqual([]);
}

describe("the account map (F-131)", () => {
  const map = mapOf(linear, { amount: 10_000, monthly: 200 });

  it("names the account clearly cheapest at the plan, and where the other becomes clearly cheaper along each axis", () => {
    // at the plan B leaves 290 ₪ less than A's 29,600 ₪, 1%: A is θ ahead
    expect(map.plan.lead).toEqual({ kind: "clear", first: "a" });
    // along today's amount at 200 ₪ a month: 0.015 a − 440 ≥ 0.005 (0.995 a + 19,360), a ≥ 53,546.1
    expect(map.switches.amount).toMatchObject({ dir: "up", to: "b" });
    expect(need(map.switches.amount, "a switch along the amount").at).toBeCloseTo(53_546.1, 0);
    // along the deposit at 10,000 ₪ today: 0.8 m − 450 ≥ 0.005 (9,350 + 99.8 m), m ≥ 1,650.3
    expect(map.switches.monthly).toMatchObject({ dir: "up", to: "b" });
    expect(need(map.switches.monthly, "a switch along the deposit").at).toBeCloseTo(1650.3, 0);
  });

  it("runs each axis past the plan's farther switch with room, to a clean value, and at least a tenth of the sliders' reach", () => {
    // 1.5 × 53,546 = 80,319, up to 100,000; 1.5 × 1,650 = 2,475, up to 2,500
    expect(map.max).toEqual({ amount: 100_000, monthly: 2500 });
    expect(mapOf(linear, { amount: 0, monthly: 0 }).max).toEqual({ amount: 50_000, monthly: 1000 });
  });

  it("reads every node of the areas as the accounts do, the band between them included", () => {
    expectFieldTrue(map, linear);
    // the band along a row near the plan's 200 ₪ a month: A clearly cheaper up to about 17,000 ₪, B from about 53,500 ₪
    const row = need([...Array(map.field.rows).keys()].find((j) => Math.abs(yOf(map, j) - 200) < 15), "a row near 200 ₪ a month");
    const band = [...Array(map.field.cols).keys()].filter((i) => nodeAt(map, i, row).ahead < 1).map((i) => xOf(map, i));
    expect(Math.min(...band)).toBeGreaterThan(15_000);
    expect(Math.max(...band)).toBeLessThan(56_000);
    expect(band.length).toBeGreaterThan(30);
  });

  it("finds a switch at a lower amount when the plan is past the band", () => {
    // at 100,000 ₪ B leaves 1,060 ₪ more, 0.9%; A clearly cheaper where 440 − 0.015 a ≥ 0.005 (0.98 a + 19,800), a ≤ 17,135.7
    const past = mapOf(linear, { amount: 100_000, monthly: 200 });
    expect(past.plan.lead).toEqual({ kind: "clear", first: "b" });
    expect(past.switches.amount).toMatchObject({ dir: "down", to: "a" });
    expect(need(past.switches.amount, "the switch down").at).toBeCloseTo(17_135.7, 0);
  });

  it("a plan inside the band: both accounts tied, and the nearer of the switches up and down", () => {
    // at 40,000 ₪ B leaves 160 ₪ more of 59,160 ₪, 0.27%: within θ. B clearly cheaper from 53,546.1, A up to 17,135.7
    const at40 = mapOf(linear, { amount: 40_000, monthly: 200 });
    expect(at40.plan.lead).toEqual({ kind: "near", tied: ["b", "a"] });
    expect(at40.switches.amount).toMatchObject({ dir: "up", to: "b" });
    expect(need(at40.switches.amount, "the switch up").at).toBeCloseTo(53_546.1, 0);
    // at 30,000 ₪ the switch down is nearer: 12,864 ₪ against 23,546 ₪
    const at30 = mapOf(linear, { amount: 30_000, monthly: 200 });
    expect(at30.plan.lead.kind).toBe("near");
    expect(at30.switches.amount).toMatchObject({ dir: "down", to: "a" });
    expect(need(at30.switches.amount, "the switch down").at).toBeCloseTo(17_135.7, 0);
  });

  it("a plan with no monthly deposit still has a switch along the deposit", () => {
    const none = mapOf(linear, { amount: 10_000, monthly: 0 });
    expect(none.plan.lead).toEqual({ kind: "clear", first: "a" });
    expect(need(none.switches.monthly, "the switch along the deposit").at).toBeCloseTo(1650.3, 0);
  });

  it("a plan of nothing at all: no account leads there and no switch is looked for, and the map still stands", () => {
    const empty = mapOf(linear, { amount: 0, monthly: 0 });
    expect(empty.plan.lead).toEqual({ kind: "empty" });
    expect(empty.switches).toEqual({ amount: null, monthly: null });
    expect(empty.accounts.sort()).toEqual(["a", "b"]);
  });

  it("the line for no monthly deposit: A clearly up to 30,150.8 ₪, B clearly from 59,551.1 ₪, the band between", () => {
    const wide = mapOf(linear, { amount: 60_000, monthly: 0 });
    const n = wide.edge.cols - 1;
    for (let i = 0; i <= n; i++) {
      const a = (wide.max.amount * i) / n;
      const k = wide.edge.first[i] ?? -1;
      const ahead = wide.edge.ahead[i] ?? NaN;
      if (a > 0 && a < 29_000) expect([wide.accounts[k], ahead >= 0.95], `${a}`).toEqual(["a", true]);
      if (a > 61_000) expect([wide.accounts[k], ahead >= 0.95], `${a}`).toEqual(["b", true]);
      if (a > 32_000 && a < 57_000) expect(ahead, `${a}`).toBeLessThan(1);
    }
    // from its start: the account just above 0 ₪, never none
    expect(wide.accounts[wide.edge.first[0] ?? -1]).toBe("a");
  });

  it("breaks an exact tie to the account earlier in the order, as the headline does", () => {
    const same = { x: (a: number, m: number) => left(a, m, 100), y: (a: number, m: number) => left(a, m, 100) };
    const map = mapOf(same, { amount: 10_000, monthly: 200 });
    expect(map.plan.lead).toEqual({ kind: "near", tied: ["x", "y"] });
    expect(new Set(map.field.first.map((k) => map.accounts[k]))).toEqual(new Set(["x"]));
    expect(new Set(map.field.ahead)).toEqual(new Set([0]));
    const swapped = need(accountMap({ leftAt: leftOf(same), order: ["y", "x"], theta: THETA, plan: { amount: 10_000, monthly: 200 }, reach }), "the map");
    expect(swapped.plan.lead).toEqual({ kind: "near", tied: ["y", "x"] });
  });

  it("a monthly deposit under a per-trade minimum: B's minimum of 10 ₪ a deposit binds up to 5,000 ₪ a month", () => {
    // A: 0.4% of every deposit; B: max(10 ₪, 0.2%) of every deposit; 120 deposits. The two equal at 2,500 ₪ a month, where B's minimum
    // still binds
    const minimum = {
      a: (a: number, m: number) => left(a, m, 120 * 0.004 * m + 0.002 * a),
      b: (a: number, m: number) => left(a, m, 120 * Math.max(10, 0.002 * m) * (m > 0 ? 1 : 0) + 0.002 * a),
    };
    const map = mapOf(minimum, { amount: 10_000, monthly: 500 });
    expectFieldTrue(map, minimum);
  });

  it("a step in a price list: B's custody drops from 3% to 1% at 50,000 ₪, so it is clearly cheaper from exactly there", () => {
    const step = {
      a: (a: number, m: number) => left(a, m, 0.02 * a),
      b: (a: number, m: number) => left(a, m, (a < 50_000 ? 0.03 : 0.01) * a),
    };
    const map = mapOf(step, { amount: 20_000, monthly: 100 });
    expect(map.switches.amount).toMatchObject({ dir: "up", to: "b" });
    expect(need(map.switches.amount, "the step").at).toBeCloseTo(50_000, -1);
    expectFieldTrue(map, step);
  });

  it("finds an area narrower than a coarse cell, which none of the cell's corners shows: C leads only from 57,067 ₪ to 58,933 ₪ today", () => {
    // C leaves 0.7% more than the better of A and B at 58,000 ₪, less with the distance, and 0.8% less from 2,000 ₪ away: third at every
    // node of the coarse grid (16,667 ₪ apart on this map), first only around the middle of one cell
    const [la, lb] = [need(linear.a, "A"), need(linear.b, "B")];
    const best = (a: number, m: number) => Math.max(la(a, m), lb(a, m));
    const narrow = { ...linear, c: (a: number, m: number) => best(a, m) * (1 + 0.015 * Math.max(0, 1 - Math.abs(a - 58_000) / 2000) - 0.008) };
    const map = mapOf(narrow, { amount: 10_000, monthly: 200 });
    expect(map.accounts).toContain("c");
    expectFieldTrue(map, narrow);
  });

  it("a switch holds to the end of the search: a lead that dips under θ and back cannot place it", () => {
    // B's lead over A grows with today's amount and wavers by two fifths every 40,000 ₪, so it first reaches θ at 35,623 ₪ and stays there
    // only past its last dip, from 65,259 ₪
    const lead = (a: number) => THETA * (a / 40_000) * (1 + 0.4 * Math.sin((2 * Math.PI * a) / 40_000 + 1));
    const wavy = { a: (a: number, m: number) => left(a, m, 0), b: (a: number, m: number) => left(a, m, 0) / (1 - lead(a)) };
    const map = mapOf(wavy, { amount: 10_000, monthly: 200 });
    const at = need(map.switches.amount, "the switch").at;
    const gap = (a: number) => {
      const [x, y] = [wavy.a(a, 200), wavy.b(a, 200)];
      return (y - x) / y;
    };
    for (let a = Math.ceil(at); a < 100_000; a += 5) expect(gap(a) >= THETA, `${a}`).toBe(true);
    expect(gap(at - 1)).toBeLessThan(THETA);
    expect(at).toBeCloseTo(65_259, -1);
  });

  it("prices only the accounts that can lead once the coarse grid has found them", () => {
    const many: Record<string, (a: number, m: number) => number> = { ...linear };
    for (let k = 0; k < 10; k++) many[`far${k}`] = (a, m) => left(a, m, 0.05 * a + 5 * m + 1000);
    asked = 0;
    mapOf(many, { amount: 10_000, monthly: 200 });
    const all = asked;
    asked = 0;
    mapOf(linear, { amount: 10_000, monthly: 200 });
    // the ten far accounts are priced on the coarse grid and the lines' samples alone, not in the cells after
    expect(all - asked).toBeLessThan(10 * 200);
  });

  it("rounds an axis's end up to a clean value", () => {
    expect([cleanUp(114_000), cleanUp(2812.5), cleanUp(100_000), cleanUp(31)]).toEqual([150_000, 3000, 100_000, 40]);
  });
});
