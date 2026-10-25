// The home page's question card: the purpose to preset table, the validation and what the produced goal does in the check.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkGoal, emptyGoal, resolveGoal, type Presets } from "./goal";
import { presetFor, purposeIds, quickFields, quickGoalPlan, showsHorizonHonestLine, type PurposeId, type QuickInput, type QuickMessages } from "./quick-goal";

const presets = (JSON.parse(readFileSync(new URL("../../../data/parameters/goal-presets.json", import.meta.url), "utf8")) as { presets: Presets }).presets;
const bounds = { horizon: { min: 1, max: 40 }, pct: { min: -50, max: 50 }, age: { min: 16, max: 100 }, today: "2026-10-25" };
const names: Record<PurposeId, string> = { apartment: "דירה", wedding: "חתונה", studies: "לימודים", child: "ילד", retirement: "פרישה", cushion: "כרית ביטחון", none: "בלי מטרה מסוימת" };
const msgs: QuickMessages = { needAmount: "need", nan: "nan", years: "years", yearsWhole: "whole", yearsRange: "range", childAge: "age", negative: "neg", names };
const checkMsgs = { years: "years", yearsWhole: "whole", yearsRange: "range", negative: "neg", available: "avail", age: "age", pct: () => "pct" };
const input = (over: Partial<QuickInput> = {}): QuickInput => ({ amountNow: 120_000, monthly: null, years: 7, unknownYears: false, purpose: "apartment", ...over });
const plan = (over: Partial<QuickInput> = {}) => quickGoalPlan(input(over), bounds, msgs);

describe("presetFor", () => {
  it("maps the seven purposes", () => {
    expect(presetFor("apartment", { monthly: null })).toBe("known-date");
    expect(presetFor("wedding", { monthly: null })).toBe("known-date");
    expect(presetFor("studies", { monthly: null })).toBe("known-date");
    expect(presetFor("child", { monthly: null })).toBe("child");
    expect(presetFor("retirement", { monthly: null })).toBe("long-term");
    expect(presetFor("cushion", { monthly: null })).toBe("liquid-reserve");
  });
  it("none and null follow the monthly deposit", () => {
    for (const p of ["none", null] as const) {
      expect(presetFor(p, { monthly: null })).toBe("lump-sum");
      expect(presetFor(p, { monthly: 0 })).toBe("lump-sum");
      expect(presetFor(p, { monthly: 500 })).toBe("long-term");
    }
  });
  it("a monthly deposit does not change a named purpose", () => {
    expect(presetFor("apartment", { monthly: 500 })).toBe("known-date");
  });
});

describe("quickGoalPlan", () => {
  it("a cushion with a sum goes to idle cash with whole shekels", () => {
    expect(plan({ purpose: "cushion", amountNow: 15000, years: 99 })).toEqual({ kind: "idle", to: "/idle-cash?balance=15000" });
    expect(plan({ purpose: "cushion", amountNow: 15000.4, monthly: 300 })).toEqual({ kind: "idle", to: "/idle-cash?balance=15000" });
  });
  it("a cushion without a sum, or no sum at all, asks for a sum", () => {
    expect(plan({ purpose: "cushion", amountNow: null })).toMatchObject({ kind: "invalid", field: "amount", message: "need" });
    expect(plan({ amountNow: null, monthly: null })).toMatchObject({ kind: "invalid", field: "amount", message: "need" });
    expect(plan({ amountNow: 0, monthly: 0 })).toMatchObject({ kind: "invalid", field: "amount" });
    expect(plan({ amountNow: Number.NaN })).toMatchObject({ kind: "invalid", field: "amount", message: "nan" });
  });
  it("a monthly sum alone is enough and leaves the amount now not entered", () => {
    const p = plan({ amountNow: null, monthly: 800, purpose: null });
    expect(p.kind).toBe("compare");
    if (p.kind !== "compare") return;
    expect(p.preset).toBe("long-term");
    const g = p.patch(emptyGoal(0));
    expect(g.amountNow).toEqual({ value: null, entered: false });
    expect(g.monthly).toEqual({ value: 800, entered: true });
  });
  it("years out of range or not whole give the form's messages", () => {
    expect(plan({ years: 0.5 })).toMatchObject({ kind: "invalid", field: "years", message: "years" });
    expect(plan({ years: 0 })).toMatchObject({ kind: "invalid", field: "years", message: "years" });
    expect(plan({ years: 41 })).toMatchObject({ kind: "invalid", field: "years", message: "range" });
    expect(plan({ years: 2.5 })).toMatchObject({ kind: "invalid", field: "years", message: "whole" });
  });
  it("typed years are entered; unknown years are not (and typed years are then ignored)", () => {
    const typed = plan({ years: 7 });
    const unknown = plan({ years: 7, unknownYears: true });
    if (typed.kind !== "compare" || unknown.kind !== "compare") throw new Error("expected compare");
    expect(typed.patch(emptyGoal(0)).horizonYears).toEqual({ value: 7, entered: true });
    expect(unknown.patch(emptyGoal(0)).horizonYears).toEqual({ value: null, entered: false });
    expect(plan({ unknownYears: true, years: 99 }).kind).toBe("compare");
  });
  it("sets the preset and the chip word as the name; none sets no name", () => {
    const apt = plan();
    const none = plan({ purpose: "none" });
    if (apt.kind !== "compare" || none.kind !== "compare") throw new Error("expected compare");
    expect(apt.patch(emptyGoal(0))).toMatchObject({ preset: "known-date", name: "דירה" });
    expect(none.patch(emptyGoal(0))).toMatchObject({ preset: "lump-sum", name: "" });
  });
  it("the produced goal is ready for every purpose except the cushion, and the unknown horizon is the preset's", () => {
    for (const purpose of purposeIds.filter((p) => p !== "cushion")) {
      for (const unknownYears of [false, true]) {
        const p = plan({ purpose, unknownYears, years: unknownYears ? null : 7 });
        if (p.kind !== "compare") throw new Error(`${purpose}: expected compare`);
        const g = p.patch(emptyGoal(0));
        const r = resolveGoal(g, presets);
        expect(checkGoal(g, r, bounds, checkMsgs).ready, purpose).toBe(true);
        // a child's goal asks the age, not the years: years typed before the chip are not used
        if (unknownYears || purpose === "child") {
          expect(r.source.horizonYears).toBe("preset");
          expect(r.horizonYears).toBe((presets[p.preset]!.horizon_years!.value as number));
        } else expect(r.horizonYears).toBe(7);
      }
    }
  });
  it("unknown years give the horizons the table promises", () => {
    const horizon = (purpose: PurposeId, monthly: number | null = null) => {
      const p = plan({ purpose, unknownYears: true, monthly });
      if (p.kind !== "compare") throw new Error("expected compare");
      return resolveGoal(p.patch(emptyGoal(0)), presets).horizonYears;
    };
    expect([horizon("apartment"), horizon("wedding"), horizon("studies"), horizon("child"), horizon("retirement"), horizon("none"), horizon("none", 500)]).toEqual([4, 4, 4, 18, 20, 10, 20]);
  });
  it("leaves the profile and the assumptions as they were", () => {
    const before = { ...emptyGoal(0), profile: { ...emptyGoal(0).profile, age: 31, salary: 15000 }, assumptions: { return: 5, inflation: 2.5, insurance: 0.3, acceptedFall: 20 }, exposures: { x: {} } };
    const p = plan();
    if (p.kind !== "compare") throw new Error("expected compare");
    const after = p.patch(before);
    expect(after.profile).toEqual(before.profile);
    expect(after.assumptions).toEqual(before.assumptions);
    expect(after.exposures).toEqual(before.exposures);
    expect(after.available).toEqual(before.available);
    expect(after.anytime).toEqual(before.anytime);
  });
});

describe("what each purpose asks", () => {
  it("the cushion asks the sum only, a child the age instead of the years, a purchase its cost", () => {
    expect(quickFields("cushion")).toEqual({ monthly: false, years: false, childAge: false, targetCost: false });
    expect(quickFields("child")).toEqual({ monthly: true, years: false, childAge: true, targetCost: false });
    for (const p of ["apartment", "wedding", "studies"] as const) expect(quickFields(p)).toEqual({ monthly: true, years: true, childAge: false, targetCost: true });
    for (const p of ["retirement", "none", null] as const) expect(quickFields(p)).toEqual({ monthly: true, years: true, childAge: false, targetCost: false });
  });
  it("a child's age (or birth year) sets the horizon to the preset's 18 less the age", () => {
    const horizon = (childAge: number | null) => {
      const p = plan({ purpose: "child", years: 30, childAge });
      if (p.kind !== "compare") throw new Error("expected compare");
      const g = p.patch(emptyGoal(0));
      return [g.childAge, resolveGoal(g, presets).horizonYears];
    };
    expect(horizon(5)).toEqual([5, 13]);
    expect(horizon(2021)).toEqual([5, 13]);
    expect(horizon(null)).toEqual([null, 18]);
  });
  it("a child's age outside 0 to 17, or not a number, is refused on its own field", () => {
    expect(plan({ purpose: "child", childAge: 18 })).toMatchObject({ kind: "invalid", field: "childAge", message: "age" });
    expect(plan({ purpose: "child", childAge: 2.5 })).toMatchObject({ kind: "invalid", field: "childAge", message: "age" });
    expect(plan({ purpose: "child", childAge: Number.NaN })).toMatchObject({ kind: "invalid", field: "childAge", message: "nan" });
  });
  it("a purchase's cost is kept as an entered value; a negative one is refused", () => {
    const p = plan({ purpose: "wedding", targetCost: 80_000.4 });
    if (p.kind !== "compare") throw new Error("expected compare");
    expect(p.patch(emptyGoal(0)).targetCost).toMatchObject({ value: 80_000, unit: "nis", checked: "2026-10-25" });
    expect(plan({ purpose: "apartment", targetCost: -1 })).toMatchObject({ kind: "invalid", field: "cost", message: "neg" });
  });
  it("a field the purpose does not ask is ignored, even when it holds text", () => {
    const p = plan({ purpose: "retirement", childAge: 99, targetCost: -5 });
    if (p.kind !== "compare") throw new Error("expected compare");
    const g = p.patch({ ...emptyGoal(0), childAge: 3 });
    expect(g.childAge).toBe(3);
    expect(g.targetCost).toBeUndefined();
  });
});

describe("showsHorizonHonestLine", () => {
  it("is shown below P-04's equity minimum only", () => {
    expect(showsHorizonHonestLine(7, 10)).toBe(true);
    expect(showsHorizonHonestLine(10, 10)).toBe(false);
    expect(showsHorizonHonestLine(12, 10)).toBe(false);
    expect(showsHorizonHonestLine(4, 10)).toBe(true);
    expect(showsHorizonHonestLine(4, null)).toBe(false);
  });
});
