import { describe, expect, it } from "vitest";
import { accountMap, cleanUp, type AccountMap, type LeftAt } from "./account-map";
import { stripedPairs } from "../components/kit/region-map";

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

  it("runs each axis past the farthest change up the plan's line with room, to a clean value", () => {
    // the switches up are the nearest changes up the plan's lines, past three times the plan (30,000 ₪, 600 ₪ a month): 1.5 × 53,546 =
    // 80,319, up to 100,000; 1.5 × 1,650 = 2,475, up to 2,500
    expect(map.max).toEqual({ amount: 100_000, monthly: 2500 });
    // up today's amount at 200 ₪ a month, A is θ ahead while 440 − 0.015 a ≥ 0.005 (0.98 a + 19,800), to 17,135.7 ₪, and B leaves more
    // from 29,333.3 ₪; up the deposit at 10,000 ₪, A is θ ahead while 450 − 0.8 m ≥ 0.005 (9,800 + 99 m), to 309.7 ₪ a month, and B leaves
    // more from 562.5 ₪
    expect(map.changes.amount.band).toBeCloseTo(17_135.7, -2);
    expect(map.changes.amount.even).toBeCloseTo(29_333.3, -2);
    expect(Math.abs((map.changes.monthly.band ?? NaN) - 309.7)).toBeLessThan(1);
    expect(map.changes.monthly.even).toBeCloseTo(562.5, 0);
  });

  it("finds where along each of the plan's lines the other account leaves as much, the nearer way", () => {
    // B leaves 0.015 a − 440 more at 200 ₪ a month: equal at 29,333.3 ₪, up from 10,000 ₪ and down from 100,000 ₪; at 10,000 ₪ today
    // B leaves 0.8 m − 450 more: equal at 562.5 ₪ a month
    expect(map.equal.amount).toMatchObject({ dir: "up", to: "b" });
    expect(map.equal.amount?.at).toBeCloseTo(29_333.3, -2);
    expect(map.equal.monthly).toMatchObject({ dir: "up", to: "b" });
    expect(map.equal.monthly?.at).toBeCloseTo(562.5, 0);
    const past = mapOf(linear, { amount: 100_000, monthly: 200 });
    expect(past.equal.amount).toMatchObject({ dir: "down", to: "a" });
    expect(past.equal.amount?.at).toBeCloseTo(29_333.3, -2);
  });

  it("names no equal point where another account leads only with no money at all today", () => {
    // C leaves 300 ₪ less than A wherever there is money today, and 100 ₪ more at exactly 0 ₪: not a point along the line, but the value
    // of no money at all, as the bottom edge is
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const atNothing = { a: base, c: (a: number, m: number) => base(a, m) + (a === 0 ? 100 : -300) };
    expect(mapOf(atNothing, { amount: 10_000, monthly: 200 }).equal.amount).toBeNull();
  });

  it("names nothing up a line from no money at all where the accounts differ only there: no equal point, no switch, no change", () => {
    // B leaves 1% less than A with no monthly deposit (or nothing today), and 0.1% more, within θ, wherever there is one: up the line from
    // 0 nothing changes along it, since no money at all is a value of its own, as the bottom edge is
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const noDeposit = { a: base, b: (a: number, m: number) => base(a, m) * (m === 0 ? 0.99 : 1.001) };
    const noAmount = { a: base, b: (a: number, m: number) => base(a, m) * (a === 0 ? 0.99 : 1.001) };
    for (const [accounts, plan, axis] of [[noDeposit, { amount: 10_000, monthly: 0 }, "monthly"], [noAmount, { amount: 0, monthly: 200 }, "amount"]] as const) {
      const got = mapOf(accounts, plan);
      expect(got.plan.lead, axis).toEqual({ kind: "clear", first: "a" });
      expect(got.equal[axis], axis).toBeNull();
      expect(got.switches[axis], axis).toBeNull();
      expect(got.changes[axis], axis).toEqual({ band: null, even: null });
      // where nothing changes up a line, three times the plan's own value; on an axis where the plan has no money, a fiftieth of the
      // sliders' reach: 10,000 ₪ today, 200 ₪ a month
      expect(got.max, axis).toEqual(axis === "monthly" ? { amount: 30_000, monthly: 200 } : { amount: 10_000, monthly: 600 });
    }
  });

  it("names no switch or equal point under a hundredth of the sliders' reach: 100 ₪ a month, 5,000 ₪ today", () => {
    // B leaves more than A under 60 ₪ a month (or 3,000 ₪ today) and less from there, the gap passing through zero: equal at 60 ₪
    // (3,000 ₪), too low to name
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const lowMonthly = { a: base, b: (a: number, m: number) => base(a, m) * (1 + 0.00002 * (60 - m)) };
    const lowAmount = { a: base, b: (a: number, m: number) => base(a, m) * (1 + 0.0000005 * (3000 - a)) };
    expect(mapOf(lowMonthly, { amount: 10_000, monthly: 200 }).equal.monthly).toBeNull();
    expect(mapOf(lowAmount, { amount: 10_000, monthly: 200 }).equal.amount).toBeNull();
    // and one at 150 ₪ a month is named
    const named = { a: base, b: (a: number, m: number) => base(a, m) * (1 + 0.00002 * (150 - m)) };
    expect(mapOf(named, { amount: 10_000, monthly: 200 }).equal.monthly?.at).toBeCloseTo(150, -1);
  });

  it("an account of the plan with no ranked price at a point is not compared there: neither beaten nor equal (F-80)", () => {
    // A has no ranked price from 50,000 ₪ today (the list does not rank it there); B is A's twin, or 1% behind it, where both are priced
    const unpricedFrom = (accounts: Record<string, (a: number, m: number) => number>): LeftAt => (a, m, houses) =>
      new Map((houses ?? Object.keys(accounts)).flatMap((id) => (accounts[id] && !(id === "a" && a >= 50_000) ? [[id, accounts[id](a, m)] as const] : [])));
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const plan = { amount: 10_000, monthly: 200 };
    const run = (accounts: Record<string, (a: number, m: number) => number>) => need(accountMap({ leftAt: unpricedFrom(accounts), order: ["a", "b"], theta: THETA, plan, reach }), "the map");
    const twins = run({ a: base, b: base });
    expect(twins.plan.lead).toEqual({ kind: "near", tied: ["a", "b"] });
    expect(twins.switches.amount).toBeNull();
    const behind = run({ a: base, b: (a, m) => base(a, m) * 0.99 });
    expect(behind.plan.lead).toEqual({ kind: "clear", first: "a" });
    expect(behind.equal.amount).toBeNull();
    expect(behind.changes.amount).toEqual({ band: null, even: null });
  });

  it("shows the band and the other account's side up a line where the other never becomes clearly cheaper", () => {
    // A: 2% of today's amount and 0.6 ₪ a shekel of the deposit; B as before. Up the deposit at 10,000 ₪, B leaves 0.4 m − 450 more: A is θ
    // ahead while 450 − 0.4 m ≥ 0.005 (9,800 + 99.4 m), to 447.0 ₪ a month, B leaves more from 1,125 ₪, and B is never θ ahead, since
    // 0.4 m − 450 ≥ 0.005 (9,350 + 99.8 m) holds for no m. The axis runs to 1.5 × 1,125 = 1,687.5, up to 2,000.
    const slow = { a: (a: number, m: number) => left(a, m, 0.02 * a + 0.6 * m), b: (a: number, m: number) => left(a, m, 600 + 0.005 * a + 0.2 * m) };
    const got = mapOf(slow, { amount: 10_000, monthly: 200 });
    expect(got.switches.monthly).toBeNull();
    expect(got.changes.monthly.band).toBeCloseTo(447.0, 0);
    expect(Math.abs((got.changes.monthly.even ?? NaN) - 1125)).toBeLessThan(1);
    expect(got.max.monthly).toBe(2000);
    // up today's amount at 200 ₪ a month, B leaves 0.015 a − 520 more: clearly from 61,526.2 ₪ (0.015 a − 520 ≥ 0.005 (0.995 a + 19,360)),
    // 1.5 × 61,526 = 92,289, up to 100,000
    expect(need(got.switches.amount, "the switch up today's amount").at).toBeCloseTo(61_526.2, 0);
    expect(got.max.amount).toBe(100_000);
    expectFieldTrue(got, slow);
  });

  it("where nothing changes up a line, the axis spans three times the plan's own value", () => {
    // B costs 600 ₪, 2% of today's amount and 1 ₪ a shekel of the deposit more than A, which leaves at least 0.6% more everywhere: A is θ
    // ahead up both lines. Three times 10,000 ₪ is 30,000 ₪; three times 200 ₪ a month is 600 ₪.
    const still = { a: (a: number, m: number) => left(a, m, 0), b: (a: number, m: number) => left(a, m, 600 + 0.02 * a + m) };
    const got = mapOf(still, { amount: 10_000, monthly: 200 });
    expect(got.changes).toEqual({ amount: { band: null, even: null }, monthly: { band: null, even: null } });
    expect(got.max).toEqual({ amount: 30_000, monthly: 600 });
    // a plan of nothing has no line to change along: a fiftieth of the sliders' reach on each axis, 10,000 ₪ and 200 ₪ a month
    expect(mapOf(linear, { amount: 0, monthly: 0 }).max).toEqual({ amount: 10_000, monthly: 200 });
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
    // on its axes (to 10,000 ₪ and 200 ₪ a month) B leaves 0.015 a + 0.8 m − 600 more than A, under 0 everywhere: A alone
    expect(empty.accounts).toEqual(["a"]);
    expect(empty.field.first.every((k) => empty.accounts[k] === "a")).toBe(true);
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

  it("a turn inside the first step of an axis is not carried up the cell above it", () => {
    // C leaves 0.2% less than A under 9 ₪ a month and 2.2% less from there; D the same under 200 ₪ today. On these maps the areas' rows
    // start at 6 ₪ a month, 6.2 ₪ apart, and the columns are 312.5 ₪ apart: the turn falls between the first row (or column) and the next,
    // and a cell's corners on the first row (or column) would carry C (or D) within θ of A across the whole cell
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const lowMonthly = { a: base, c: (a: number, m: number) => base(a, m) * (m < 9 ? 0.998 : 0.978) };
    const lowAmount = { a: base, d: (a: number, m: number) => base(a, m) * (a < 200 ? 0.998 : 0.978) };
    for (const accounts of [lowMonthly, lowAmount]) {
      const got = mapOf(accounts, { amount: 10_000, monthly: 200 });
      expect([got.max, got.bottom]).toEqual([{ amount: 30_000, monthly: 600 }, 6]);
      expectFieldTrue(got, accounts);
    }
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

  it("keeps the axes to the plan's range: an account clearly first only far past it has no area", () => {
    // A: 8% of today's amount and 4 ₪ a shekel of the deposit; B: 6,000 ₪, 1.6% and 0.8 ₪; C: 1,200 ₪, 4% and 2 ₪. At the plan A is first;
    // C is clearly cheaper up both lines (from about 25,300 ₪ today and 558 ₪ a month): today's amount runs to 1.5 × 25,300 = 37,950, up to
    // 40,000 ₪, and the deposit to 1.5 × 558 = 837, up to 1,000 ₪. B is clearly first only from 250,000 ₪ with no monthly deposit (0.024 a −
    // 4,800 = 0.005 (0.984 a − 6,000)), far past the plan, and the axis is not stretched to it
    const three = {
      a: (a: number, m: number) => left(a, m, 0.08 * a + 4 * m),
      b: (a: number, m: number) => left(a, m, 6000 + 0.016 * a + 0.8 * m),
      c: (a: number, m: number) => left(a, m, 1200 + 0.04 * a + 2 * m),
    };
    const got = mapOf(three, { amount: 10_000, monthly: 200 });
    expect(got.plan.lead).toEqual({ kind: "clear", first: "a" });
    expect(got.max).toEqual({ amount: 40_000, monthly: 1000 });
    expect([...got.accounts].sort()).toEqual(["a", "c"]);
    expectFieldTrue(got, three);
    // the legend's stripes: A and C about the same around where they are equal, and no other pair
    const pairs = stripedPairs(got.field).map((p) => p.map((k) => got.accounts[k] ?? "").sort((x, y) => x.localeCompare(y)).join("|"));
    expect(pairs).toEqual(["a|c"]);
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

  it("a stretch in the middle of a line where the other account is clearly cheaper, and no equal point at a step", () => {
    // B leaves 1% more than A from 30,000 ₪ to 70,000 ₪ today and 1% less elsewhere: clearly cheaper only in that stretch, so no switch;
    // its gap jumps across zero at each end, where the two never leave the same amount
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const middle = { a: base, b: (a: number, m: number) => base(a, m) * (a > 30_000 && a < 70_000 ? 1.01 : 0.99) };
    const got = mapOf(middle, { amount: 10_000, monthly: 200 });
    expect(got.plan.lead).toEqual({ kind: "clear", first: "a" });
    expect(got.switches.amount).toBeNull();
    const st = need(got.stretches.amount, "the stretch along today's amount");
    expect([st.dir, st.to]).toEqual(["up", "b"]);
    expect(st.lo).toBeCloseTo(30_000, -1);
    expect(st.hi).toBeCloseTo(70_000, -1);
    expect(got.equal.amount).toBeNull();
    expect(got.stretches.monthly).toBeNull();
    // the axis runs past the stretch's far end with room: 1.5 × 70,000 = 105,000, up to 150,000
    expect(got.max.amount).toBe(150_000);
  });

  it("a lead just short of θ is never rounded into a clear lead", () => {
    // B leaves 0.9997 θ less than A everywhere: about the same at every node, the edge's included
    const base = (a: number, m: number) => left(a, m, 0.01 * a + m);
    const short = { a: base, b: (a: number, m: number) => base(a, m) * (1 - 0.9997 * THETA) };
    const got = mapOf(short, { amount: 10_000, monthly: 200 });
    expect(Math.max(...got.field.ahead, ...got.edge.ahead)).toBeLessThan(1);
  });

  it("rounds an axis's end up to a clean value", () => {
    expect([cleanUp(114_000), cleanUp(2812.5), cleanUp(100_000), cleanUp(31)]).toEqual([150_000, 3000, 100_000, 40]);
  });
});
