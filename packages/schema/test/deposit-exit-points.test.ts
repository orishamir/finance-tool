// A deposit's exit points (2026-11-12). The interval between exit points (`every_months`) was read as the date of the first one, so a plan
// whose first exit comes after ten years (Bank Hapoalim's חושבים קדימה: after 120 months, then every 12) would have been shown and run as
// one that lets money out after a year. The record now says when the first one falls, and the schema keeps the two apart.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { depositTerms } from "../src/index.ts";

const record = (name: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`../../../data/terms/deposits/${name}.json`, import.meta.url)), "utf8")) as Record<string, unknown>;
const withExits = (base: Record<string, unknown>, exit_points: unknown) => depositTerms.safeParse({ ...base, exit_points });
const paths = (r: ReturnType<typeof withExits>) => (r.success ? [] : r.error.issues.map((i) => i.path.join(".")));

describe("a deposit's exit points", () => {
  const plan = record("hapoalim-hoshvim-kadima"); // 180 months, first exit after 120, then every 12
  const plain = record("leumi-tashlumim-prime-3y");

  it("the records as collected pass", () => {
    expect(depositTerms.safeParse(plan).success).toBe(true);
    expect(depositTerms.safeParse(plain).success).toBe(true);
    expect((plan.exit_points as { first_after_months: number }).first_after_months).toBe(120);
  });

  it("a deposit with exit points says when the first falls, or null where the bank prints only how often they come", () => {
    expect(withExits(plan, { exists: true, every_months: 12, first_after_months: null }).success).toBe(true);
    expect(withExits(plan, { exists: true, every_months: null, first_after_months: 60 }).success).toBe(true);
    // the key left out is a record nobody read for its first exit point: not the same as a bank that prints none
    expect(paths(withExits(plan, { exists: true, every_months: 12 }))).toEqual(["exit_points.first_after_months"]);
  });

  it("a deposit without exit points carries no interval and no first", () => {
    expect(withExits(plan, { exists: false, every_months: null }).success).toBe(true);
    expect(withExits(plan, { exists: false, every_months: null, first_after_months: null }).success).toBe(true);
    expect(paths(withExits(plan, { exists: false, every_months: 12 }))).toEqual(["exit_points.every_months"]);
    expect(paths(withExits(plan, { exists: false, every_months: null, first_after_months: 6 }))).toEqual(["exit_points.first_after_months"]);
  });

  it("an interval or a first of zero or less is no figure", () => {
    expect(withExits(plan, { exists: true, every_months: 0, first_after_months: null }).success).toBe(false);
    expect(withExits(plan, { exists: true, every_months: -3, first_after_months: null }).success).toBe(false);
    expect(withExits(plan, { exists: true, every_months: 12, first_after_months: 0 }).success).toBe(false);
    // a week is a quarter of a month (Mizrahi-Tefahot's daily exits after a week)
    expect(withExits(plan, { exists: true, every_months: null, first_after_months: 0.25 }).success).toBe(true);
  });

  it("the first exit point falls inside the term", () => {
    expect(withExits(plan, { exists: true, every_months: 12, first_after_months: 179 }).success).toBe(true);
    expect(paths(withExits(plan, { exists: true, every_months: 12, first_after_months: 180 }))).toEqual(["exit_points.first_after_months"]);
    expect(paths(withExits(plan, { exists: true, every_months: 12, first_after_months: 240 }))).toEqual(["exit_points.first_after_months"]);
    // a term in days: a week inside a 30-day deposit passes, two months do not
    const days = { ...plan, term_months: { ...(plan.term_months as object), value: 30, unit: "days" } };
    expect(withExits(days, { exists: true, every_months: null, first_after_months: 0.25 }).success).toBe(true);
    expect(paths(withExits(days, { exists: true, every_months: null, first_after_months: 2 }))).toEqual(["exit_points.first_after_months"]);
  });
});
