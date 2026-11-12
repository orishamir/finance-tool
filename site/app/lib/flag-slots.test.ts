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

  it("the exit-point flag opens by saying the sum received may differ, then why, in words that hold for every bank (G-34, 2026-11-12)", () => {
    // conclusion first, with the day named (guidelines/wording.md). The run knows the day is an exit point, not what it pays nor the
    // notice it needs: both are each product's terms (BANK-27, BANK OQ20). One bank's plan pays a lower rate there, another's adds
    // to the rate at each exit point, so the sum may be lower or higher: the sentence says "different", and names no bank's term as
    // the product's.
    expect(flags["G-34"]).toMatch(/^הסכום שמקבלים בסוף התקופה יכול להיות שונה מהסכום כאן, כי /);
    expect(flags["G-34"]).toContain("בתחנת יציאה");
    expect(flags["G-34"]).toContain("קובע כל בנק בתנאי הפיקדון");
    expect(flags["G-34"]).not.toMatch(/גבוה|נמוך/);
    expect(flags["G-34"]).not.toMatch(/יש בנקים|יש פיקדונות/);
    expect(flags["G-34"]).not.toMatch(/באותו יום/); // no day is named before it
    // a note, not a page: the conclusion with its reason, and the one caveat
    expect(flags["G-34"]!.split(/\.(?:\s|$)/).filter(Boolean)).toHaveLength(2);
  });
});
