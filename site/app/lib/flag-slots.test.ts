// A flag's words may carry {ID:figure} slots (copy.ts `flags`), rendered from the rule's record in the figure's sheet, so a rate or an
// age in a flag is the record's and not typed. A slot that names no figure, or a page that raises the flag without the record, would
// show "—": every slot names a figure a record has, and a guide page whose runs raise flags holds those records (`pointedWithFlagSlots`).
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { flags } from "../copy";
import { parseAnswer } from "./answer-slots";
import { loadRules } from "./data.server";
import { ruleFigure } from "./value";
import { ruleFigureFrom } from "../components/provenance-sheets";
import { loader as guideLoader } from "../routes/guide";

const slotsOf = (text: string) => parseAnswer(text).flatMap((p) => (p.kind === "slot" ? [p] : []));

describe("flag slots", () => {
  it("every slot in a flag's words names a figure its rule record has", () => {
    const rules = loadRules();
    const read = (id: string, figure: string) => (figure.endsWith(".from") ? ruleFigureFrom(rules[id]!, figure.slice(0, -5), "2026-11-12") : ruleFigure(rules[id]!, figure, "2026-11-12"));
    const bad = Object.entries(flags).flatMap(([code, text]) => slotsOf(text).filter((s) => !rules[s.id] || !read(s.id, s.figure)).map((s) => `${code}: ${s.id}:${s.figure}`));
    expect(bad).toEqual([]);
  });

  it("a guide page whose runs raise flags holds every record the flags' slots read", async () => {
    const missing: string[] = [];
    for (const id of ["kupat-gemel-lehashkaa", "keren-hishtalmut", "current-account", "child-savings-provident"]) {
      const d = (await guideLoader({ params: { id } } as never)) as { rules: Record<string, RuleRecord>; pointed?: Record<string, RuleRecord> };
      const held = { ...d.pointed, ...d.rules };
      missing.push(...Object.entries(flags).flatMap(([code, text]) => slotsOf(text).filter((s) => !held[s.id]).map((s) => `${id}, ${code}: ${s.id}`)));
    }
    expect(missing).toEqual([]);
  }, 120000);

  it("the deposit flag says which way the number is off and names the exit point (G-16, 2026-11-12)", () => {
    // the run prices no break: the sentence is true for a deposit that cannot be broken, with or without exit points
    expect(flags["G-16"]).toContain("יכול להיות גבוה");
    expect(flags["G-16"]).toContain("תחנת יציאה");
    expect(flags["G-16"]).toContain("שבירת פיקדון");
  });

  it("the exit-point flag says the money can come out and that the number may still run high (G-34, 2026-11-12)", () => {
    // the run knows the day is an exit point, not what the exit point pays: the sentence holds whether it pays all the interest or a share
    expect(flags["G-34"]).toContain("בלי לשבור את הפיקדון");
    expect(flags["G-34"]).toContain("רק חלק מהריבית");
    expect(flags["G-34"]).toContain("יכול להיות גבוה");
  });
});
