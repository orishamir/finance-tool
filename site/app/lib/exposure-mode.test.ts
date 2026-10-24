// Exposure mode on the collected records (the S49 shape: equity excluded by the filter, cash and bonds ranked).
// The numbers differ from S49's golden fixture by design: the site runs on Leumi's published cash rate and the
// collected fund terms, not on the fixture's inputs.
import { beforeAll, describe, expect, it } from "vitest";
import { buildCompareBundle } from "./compare.server";
import { runGoalOf, type CompareBundle } from "./compare";
import { emptyGoal, resolveGoal, type Goal } from "./goal";
import { computeExposureMode, defaultSelection, seriesFor } from "./exposure-mode";
import { entered } from "./value";

let bundle: CompareBundle;
beforeAll(() => {
  bundle = buildCompareBundle();
}, 120_000);

const day = "2026-10-24";
function goal(over: Partial<Goal["exposures"]> = {}, accepted: number | null = 30): Goal {
  const g = emptyGoal(0);
  g.horizonYears = { value: 20, entered: true };
  g.amountNow = { value: 30_000, entered: true };
  g.monthly = { value: 2_000, entered: true };
  g.assumptions.inflation = 2.5;
  g.assumptions.acceptedFall = accepted;
  g.profile.age = 22;
  g.exposures = {
    "government-bond-cpi": { return: entered(3, "pct_per_year", day), worstFall: entered(10, "pct", day) },
    "index-sp500": { return: entered(6, "pct_per_year", day), worstFall: entered(40, "pct", day) },
    ...(over ?? {}),
  };
  return g;
}
const run = (g: Goal) => computeExposureMode({ bundle, g: runGoalOf(g, resolveGoal(g, {}))!, goal: g });

describe("exposure mode", () => {
  it("accounts for every exposure record once", () => {
    const v = run(goal());
    expect(v.rows.length).toBe(bundle.exposures!.length);
    expect(v.comparison.coverage.invariant.ok).toBe(true);
  });

  it("excludes the index at 40% worst against 30% accepted, and ranks cash and the bond", () => {
    const v = run(goal());
    expect(v.rows.find((r) => r.id === "index-sp500")).toMatchObject({ kind: "excluded", exclusion: { worst: 40, accepted: 30 } });
    expect(v.ranked.map((r) => r.id)).toContain("shekel-cash");
    const bond = v.rows.find((r) => r.id === "government-bond-cpi")!;
    // listed with its value (G-10: accrued interest on a bond bought between coupon dates), as in wrapper mode
    expect(["ranked", "listed-not-ranked"]).toContain(bond.kind);
    expect(bond.real).toBeGreaterThan(0);
    expect(bond.grossReturn?.state).toBe("entered");
    expect(v.rows.find((r) => r.id === "shekel-cash")!.grossReturn?.state).toBe("sourced");
  });

  it("uses the entered bond return (a 6% bond ends above a 3% one)", () => {
    const at = (r: number) => run(goal({ "government-bond-cpi": { return: entered(r, "pct_per_year", day), worstFall: entered(10, "pct", day) } })).rows.find((x) => x.id === "government-bond-cpi")!.real!;
    expect(at(6)).toBeGreaterThan(at(3));
  });

  it("keeps the index when the accepted fall rises to 40, and runs unfiltered with a note when it is empty", () => {
    expect(run(goal({}, 40)).rows.find((r) => r.id === "index-sp500")!.kind).toBe("ranked");
    const v = run(goal({}, null));
    expect(v.rows.find((r) => r.id === "index-sp500")).toMatchObject({ kind: "ranked", lossNote: "largest-fall-accepted" });
  });

  it("does not evaluate the unlinked bond (P-08, GOV OQ4) and makam without a yield", () => {
    const v = run(goal());
    expect(v.rows.find((r) => r.id === "government-bond-unlinked")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "p08-gov" }] });
    expect(v.rows.find((r) => r.id === "makam")).toMatchObject({ kind: "not-evaluated", noSeries: true });
  });

  it("runs the TA-125 through the collected fund and draws at most three lines beside the reference", () => {
    const v = run(goal({ "index-ta125": { return: entered(6, "pct_per_year", day), worstFall: entered(20, "pct", day) } }));
    expect(v.rows.find((r) => r.id === "index-ta125")!.kind).toBe("ranked");
    const sel = defaultSelection(v);
    expect(sel.length).toBeLessThanOrEqual(4);
    const lines = seriesFor(v, runGoalOf(goal(), resolveGoal(goal(), {}))!, sel);
    expect(lines.length).toBeLessThanOrEqual(4);
  });

  it("labels no exposure ranked without a return, and does not guess one", () => {
    const g = goal();
    g.exposures = {};
    const v = run(g);
    expect(v.ranked.map((r) => r.id)).toEqual(["shekel-cash"]);
    expect(v.rows.filter((r) => r.kind === "ranked" && r.grossReturn?.state === "entered")).toHaveLength(0);
  });
});
