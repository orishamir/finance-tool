// Save and revisit (flow 35): nothing changed reads unchanged; a changed rule figure, parameter or data file shows as a
// diff row with the ranking verdict; exposure mode saves and re-checks the same way.
import { beforeAll, describe, expect, it } from "vitest";
import { buildCompareBundle } from "./compare.server";
import { evaluate, runGoalOf, type CompareBundle } from "./compare";
import { computeExposureMode } from "./exposure-mode";
import { emptyGoal, resolveGoal, type Goal } from "./goal";
import { revisitSaved, snapshotExposure, snapshotWrapper } from "./revisit";
import { entered } from "./value";

let bundle: CompareBundle;
beforeAll(() => {
  bundle = buildCompareBundle();
}, 120_000);

const day = "2026-10-24";
const site = { version: "t", data: "t" };
function goal(): Goal {
  const g = emptyGoal(0);
  g.horizonYears = { value: 20, entered: true };
  g.amountNow = { value: 30_000, entered: true };
  g.monthly = { value: 2_000, entered: true };
  g.assumptions.return = 6;
  g.assumptions.inflation = 2.5;
  g.assumptions.acceptedFall = 30;
  g.profile.age = 22;
  g.profile.employment = "employee";
  g.profile.salary = 12_000;
  g.profile.pension = { employer: 6.5, employee: 6 };
  g.assumptions.insurance = 0.3;
  g.exposures = { "index-sp500": { return: entered(6, "pct_per_year", day), worstFall: entered(40, "pct", day) }, "government-bond-cpi": { return: entered(3, "pct_per_year", day), worstFall: entered(10, "pct", day) } };
  return g;
}
const runOf = (g: Goal) => runGoalOf(g, resolveGoal(g, {}))!;

describe("wrapper mode", () => {
  it("reads unchanged right after saving", () => {
    const g = goal();
    const ev = evaluate(bundle, runOf(g));
    const rec = snapshotWrapper({ bundle, g: runOf(g), goal: g, site, today: day, ev });
    const r = revisitSaved(bundle, rec, day);
    expect(r.status).toBe("unchanged");
    expect(r.diff).toEqual([]);
    expect(r.verdict).toBe("top-unchanged");
  });

  it("names a changed tie threshold and a re-checked data file, and keeps the ranking", () => {
    const g = goal();
    const ev = evaluate(bundle, runOf(g));
    const rec = snapshotWrapper({ bundle, g: runOf(g), goal: g, site, today: day, ev });
    const next: CompareBundle = {
      ...bundle,
      parameters: bundle.parameters.map((p) => ((p as { method_id?: string }).method_id === "P-01" ? ({ ...p, value: { ...(p as { value: object }).value, value: 0.6 } } as typeof p) : p)),
      dataFiles: bundle.dataFiles!.map((f, i) => (i === 0 ? { ...f, checked: "2026-11-30" } : f)),
    };
    const r = revisitSaved(next, rec, "2026-11-30");
    expect(r.status).toBe("changed");
    expect(r.diff.map((d) => d.kind).sort()).toEqual(["data", "parameter"]);
    expect(r.diff.find((d) => d.kind === "data")!.recheckedOnly).toBe(true);
  });

  it("calls a record it cannot read unreadable, keeping the date and the choice", () => {
    const r = revisitSaved(bundle, { id: "x", goalId: "g", mode: "wrapper", savedOn: day, choice: { id: "a", name: "קופת גמל" }, goal: 1 }, day);
    expect(r).toMatchObject({ status: "unreadable", savedOn: day, choice: { name: "קופת גמל" } });
  });
});

describe("exposure mode", () => {
  it("saves with the loss filter and the returns, re-checks unchanged, and sees a changed deposit rate", () => {
    const g = goal();
    const view = computeExposureMode({ bundle, g: runOf(g), goal: g });
    const rec = snapshotExposure({ bundle, g: runOf(g), goal: g, site, today: day, view, choice: { id: "shekel-cash", name: "מזומן שקלי" } });
    expect(rec.exposure!.returns["index-sp500"]!.state).toBe("entered");
    expect(rec.exposure!.lossFilter.acceptedFall!.value).toBe(30);
    expect(revisitSaved(bundle, rec, day).status).toBe("unchanged");
    const next: CompareBundle = {
      ...bundle,
      wrappers: bundle.wrappers.map((w) => (w.id === "bank-deposit" && w.cashRate ? { ...w, cashRate: { ...w.cashRate, value: 0.5 } } : w)),
    };
    const r = revisitSaved(next, rec, day);
    expect(r.status).toBe("changed");
    expect(r.diff.some((d) => d.kind === "assumption" && d.key === "A-01:shekel-cash")).toBe(true);
    expect(r.valueChanges.some((v) => v.id === "shekel-cash")).toBe(true);
  });
});
