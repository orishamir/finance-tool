// Save and revisit (flow 35): nothing changed reads unchanged; a changed rule figure, parameter or data file shows as a
// diff row with the ranking verdict; exposure mode saves and re-checks the same way.
import { beforeAll, describe, expect, it } from "vitest";
import { buildCompareBundle } from "./compare.server";
import { evaluate, runGoalOf, type CompareBundle } from "./compare";
import { computeExposureMode } from "./exposure-mode";
import { emptyGoal, resolveGoal, type Goal } from "./goal";
import { goalChanges, revisitSaved, snapshotExposure, snapshotWrapper } from "./revisit";
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


// audit 2026-10-24 (A30): the saved comparison is about the goal as it was; the person's own edit since is named
describe("the goal's inputs against the saved goal", () => {
  it("is empty for the same goal, and ignores the name, order and the import tag", () => {
    const g = goal();
    const now = structuredClone(g);
    now.name = "שם אחר";
    now.order = 5;
    now.importedAt = day;
    expect(goalChanges(g, now)).toEqual([]);
  });

  it("names the horizon with both numbers (15 to 20 years)", () => {
    const g = goal();
    g.horizonYears = { value: 15, entered: true };
    const now = structuredClone(g);
    now.horizonYears = { value: 20, entered: true };
    expect(goalChanges(g, now)).toEqual([{ field: "horizonYears", values: { before: 15, after: 20, unit: "years" } }]);
  });

  it("lists each changed input, naming the field alone when a side is empty or the input is a group", () => {
    const g = goal();
    const now = structuredClone(g);
    now.monthly = { value: 3_000, entered: true };
    now.assumptions.return = null;
    now.profile.pension = { employer: 7, employee: 6 };
    now.exposures = { ...now.exposures, "index-sp500": { return: entered(7, "pct_per_year", day), worstFall: entered(40, "pct", day) } };
    expect(goalChanges(g, now)).toEqual([
      { field: "monthly", values: { before: g.monthly.value, after: 3_000, unit: "nis_per_month" } },
      { field: "return" },
      { field: "pension" },
      { field: "exposures" },
    ]);
  });

  it("a later date on an unchanged exposure input is not a change", () => {
    const g = goal();
    const now = structuredClone(g);
    now.exposures = { "index-sp500": { return: entered(6, "pct_per_year", "2026-11-02"), worstFall: entered(40, "pct", "2026-11-02") }, "government-bond-cpi": { return: entered(3, "pct_per_year", day), worstFall: entered(10, "pct", day) } };
    expect(goalChanges(g, now)).toEqual([]);
  });
});
