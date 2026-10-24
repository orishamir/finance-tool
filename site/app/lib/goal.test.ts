// The goal form's submit check, the bounds table and the employment default (audit 2026-10-24: A3, A38, A61).
import { describe, expect, it } from "vitest";
import { checkGoal, emptyGoal, pctBoundsFor, reconcileEmployment, resolveGoal, type CheckMessages, type Goal } from "./goal";
import { parseNumber } from "./format";

const bounds = { horizon: { min: 1, max: 40 }, pct: { min: -50, max: 50 }, age: { min: 16, max: 100 } };
const msg: CheckMessages = { years: "years", yearsWhole: "whole", yearsRange: "range", negative: "neg", available: "avail", age: "age", pct: (b) => `pct ${b.min}..${b.max}` };
const check = (g: Goal) => checkGoal(g, resolveGoal(g, {}), bounds, msg);
const ent = (value: number) => ({ value, entered: true });

describe("checkGoal", () => {
  it("an empty goal misses both years and an amount", () => {
    const c = check(emptyGoal(0));
    expect(c.missing).toEqual(["years", "amount"]);
    expect(c.ready).toBe(false);
  });
  it("years and one amount are enough", () => {
    expect(check({ ...emptyGoal(0), horizonYears: ent(10), monthly: ent(500) }).ready).toBe(true);
    expect(check({ ...emptyGoal(0), horizonYears: ent(10) }).missing).toEqual(["amount"]);
    expect(check({ ...emptyGoal(0), amountNow: ent(1000) }).missing).toEqual(["years"]);
  });
  it("blocks a negative amount, years out of range and kept-available above the amount", () => {
    const g = { ...emptyGoal(0), horizonYears: ent(10), amountNow: ent(-5) };
    expect(check(g).problems.map((p) => p.field)).toContain("amount");
    expect(check({ ...g, amountNow: ent(100), horizonYears: ent(41) }).problems[0]).toEqual({ field: "years", message: "range" });
    expect(check({ ...g, amountNow: ent(100), horizonYears: ent(2.5) }).problems[0]!.message).toBe("whole");
    expect(check({ ...g, amountNow: ent(100), available: ent(200) }).problems[0]).toEqual({ field: "available", message: "avail" });
  });
  it("names the bound of a percent field; insurance cannot be negative", () => {
    const g = { ...emptyGoal(0), horizonYears: ent(10), amountNow: ent(100) };
    expect(check({ ...g, assumptions: { ...g.assumptions, return: 75 } }).problems[0]).toEqual({ field: "return", message: "pct -50..50" });
    expect(check({ ...g, assumptions: { ...g.assumptions, insurance: -1 } }).problems[0]).toEqual({ field: "insurance", message: "pct 0..50" });
    expect(pctBoundsFor("insurance", bounds.pct)).toEqual({ min: 0, max: 50 });
  });
  it("a comma decimal is 7.5, not 75", () => {
    expect(parseNumber("7,5")).toBe(7.5);
  });
});

describe("reconcileEmployment", () => {
  const p = emptyGoal(0).profile;
  it("a yes through work defaults to employee, flagged", () => {
    expect(reconcileEmployment({ ...p, hasPension: true })).toMatchObject({ employment: "employee", employmentDefault: true });
    expect(reconcileEmployment({ ...p, hasHishtalmut: true })).toMatchObject({ employment: "employee", employmentDefault: true });
  });
  it("never overwrites a chosen type", () => {
    expect(reconcileEmployment({ ...p, employment: "self-employed", hasPension: true }).employment).toBe("self-employed");
  });
  it("a defaulted type goes back to empty when no answer is yes; a chosen one stays", () => {
    const d = reconcileEmployment({ ...p, hasPension: true });
    expect(reconcileEmployment({ ...d, hasPension: false })).toMatchObject({ employment: null, employmentDefault: false });
    expect(reconcileEmployment({ ...p, employment: "employee", employmentDefault: false, hasPension: false }).employment).toBe("employee");
  });
  it("no answer, no default", () => {
    expect(reconcileEmployment({ ...p, hasPension: false, hasHishtalmut: null }).employment).toBeNull();
  });
});
