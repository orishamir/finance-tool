// The stairs' selection logic (founder, 2026-11-01): rows, climb, ceiling, scale and the start, on a small grid and on the engine's own numbers.
import { describe, expect, it } from "vitest";
import { buildInvest, indexById } from "./invest";
import { buildWorkbenchBundle } from "./providers.server";
import { chainOf, ceilingOf, climbFrom, gridOf, laneCases, LANES, middleStart, rowsAt, unitOf, type Grid } from "./stairs";
import { entered } from "./value";

/** accounts A..C, funds: t1, t2 (tracking), h1 (hedged tracking), e1 (etf), o1 (abroad, open). */
const V: Record<string, number | null> = { "A|t1": 100, "B|t1": 110, "C|t1": null, "A|t2": 105, "B|t2": 120, "C|t2": 90, "A|e1": 95, "B|e1": 99, "C|e1": 98, "A|h1": 200, "B|h1": 200, "C|h1": null, "A|o1": 300, "B|o1": 310, "C|o1": null };
const g: Grid = {
  accounts: ["A", "B", "C"],
  funds: [{ id: "t1", kind: "tr", hedged: false }, { id: "t2", kind: "tr", hedged: false }, { id: "h1", kind: "tr", hedged: true }, { id: "e1", kind: "etf", hedged: false }, { id: "o1", kind: "ab", hedged: false }],
  kinds: ["tr", "etf", "ab"],
  cell: (a, f) => (V[`${a}|${f}`] == null ? null : { v: V[`${a}|${f}`]!, open: f === "o1" }),
  why: () => "n",
};

describe("rowsAt", () => {
  const rows = rowsAt(g, { a: "A", f: "t1" });
  it("has one row per single change: other accounts, other kinds, other funds of the kind", () => {
    expect(rows.map((r) => r.key)).toEqual(["account|B", "account|C", "kind|etf", "kind|ab", "fund|t2", "fund|h1"]);
  });
  it("gives a difference only where both ends are priced, and a reason where not", () => {
    expect(rows.find((r) => r.key === "account|B")!.d).toBe(10);
    expect(rows.find((r) => r.key === "account|C")).toMatchObject({ d: null, why: "n" });
  });
  it("hedged and open rows are shown but never rank", () => {
    expect(rows.find((r) => r.key === "fund|h1")).toMatchObject({ hedged: true, d: 100 });
    expect(rows.find((r) => r.key === "kind|ab")).toMatchObject({ open: true });
  });
});

describe("climb and ceiling", () => {
  it("the ceiling ignores hedged and open pairs", () => expect(ceilingOf(g)).toEqual({ v: 120, pos: { a: "B", f: "t2" } }));
  it("climbs by the largest ranked gain each time, and stops", () => {
    expect(climbFrom(g, { a: "A", f: "t1" }).map((r) => r.to)).toEqual([{ a: "B", f: "t1" }, { a: "B", f: "t2" }]);
  });
  it("a taken step that loses money stays, and the chain goes on from it", () => {
    const c = chainOf(g, { start: { a: "A", f: "t1" }, taken: [{ lane: "kind", to: { a: "A", f: "e1" } }] })!;
    expect(c.chain.map((s) => s.d)).toEqual([null, -5, 10, 15]);
    expect(c.here).toBe(1);
  });
  it("a taken step the plan no longer prices ends the taken part", () => {
    const c = chainOf(g, { start: { a: "A", f: "t1" }, taken: [{ lane: "account", to: { a: "C", f: "t1" } }] })!;
    expect(c.taken).toEqual([]);
  });
});

describe("unitOf", () => {
  const row = (d: number) => ({ lane: "account", to: { a: "x", f: "y" }, key: String(d), kind: null, v: 0, d, open: false, hedged: false, why: null }) as const;
  it("is the larger of the biggest gain and the second-largest loss among rows that rank", () => {
    expect(unitOf([row(50), row(-30), row(-400), row(-900)])).toBe(400);
    expect(unitOf([row(500), row(-30), row(-400)])).toBe(500);
    expect(unitOf([row(-30)])).toBe(30);
  });
});

describe("on the engine's numbers (S&P 500, 10,000 now + 500 a month, 10 years, 7%, 2%)", () => {
  // The rates of 23.10.2026: the refresh changes the real file every working day, and these sums must not move with it.
  const fx = { date: "2026-10-23", checked: "2026-10-25", perEur: { USD: 1.1193, ILS: 3.4939, JPY: 175.51, GBP: 0.83728 }, attribution: "", staleAfterDays: 5, sourceUrl: "" };
  const bundle = { ...buildWorkbenchBundle(), fx };
  const t = bundle.today;
  const plan = { amountNow: 10000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null, values: { amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) }, fromGoal: false, returnFromParameter: false };
  const grid = gridOf(buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan }), bundle.snapshots);
  const steps = (a: string, f: string) => chainOf(grid, { start: { a, f }, taken: [] })!.chain.map((s) => [Math.round(s.v), s.d]);
  it("Hapoalim with the MTF fund", () => expect(steps("hapoalim", "1150333")).toEqual([[79273, null], [84148, 4875], [86492, 2344]]));
  // since 2026-11-04 the accumulating iShares is ranked (TXF-11: its own annex reports the ruling), so the climb stays on it: to Interactive Israel, then no single change improves
  it("Bank Jerusalem with the accumulating iShares", () => expect(steps("jerusalem", "ie00b5bmr087")).toEqual([[59435, null], [84198, 24763]]));
  it("Interactive Israel with the same iShares: no single change improves, the top is 2,294 away", () => {
    const c = chainOf(grid, { start: { a: "interactive-israel", f: "ie00b5bmr087" }, taken: [] })!;
    expect(c.chain).toHaveLength(1);
    expect(Math.round(c.ceiling.v) - Math.round(c.chain[0]!.v)).toBe(2294);
  });
  // the lanes' held heights are measured from these cases: every lane any start shows has a case with each of its rows, in the
  // same state, so no start draws a lane taller than its hold
  it("every lane from every priced start is covered by one of the lane's cases", () => {
    const cases = laneCases(grid);
    const sig = (r: { key: string; d: number | null; why: string | null; open: boolean; hedged: boolean; to: { f: string }; lane: string }) => `${r.key}:${r.d == null ? r.why : "p"}:${r.open}:${r.hedged}:${r.lane === "kind" ? r.to.f : ""}`;
    for (const a of grid.accounts)
      for (const f of grid.funds) {
        if (!grid.cell(a, f.id)) continue;
        const rows = rowsAt(grid, { a, f: f.id });
        for (const lane of LANES) {
          const mine = rows.filter((r) => r.lane === lane).map(sig);
          if (!mine.length) continue;
          expect(cases[lane].some((c) => { const have = new Set(c.map(sig)); return mine.every((x) => have.has(x)); }), `${lane} at ${a} with ${f.id}`).toBe(true);
        }
      }
    expect(cases.account.length).toBeLessThan(grid.funds.length + 1);
  });
  it("opens with no pick on a priced pair that ranks, of an exchange-traded fund", () => {
    const s = middleStart(grid)!;
    expect(grid.cell(s.a, s.f)).toMatchObject({ open: false });
    expect(grid.funds.find((f) => f.id === s.f)!.kind).toBe("il-etf");
  });
});
