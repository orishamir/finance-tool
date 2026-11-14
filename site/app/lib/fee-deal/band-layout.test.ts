// When two cases' parts read the same (band-layout.ts): the same figure in the same unit, whether the price list prints it there or the
// person copied it there; the cell they share names where each case holds it from, and never shows a list's figure as the person's.
import { describe, expect, it } from "vitest";
import { laterChanges, mergedParts, partKey } from "./band-layout";
import { entered, type SiteValue } from "../value";
import type { SlimPart } from "./case-words";

const today = "2026-11-14";
const sourced = (v: number): SiteValue => ({ ...entered(v, "pct_of_trade", today), state: "sourced" } as SiteValue);
const max = (figure: SiteValue): SlimPart => ({ id: "cap", kind: "bound", words: { lead: "מקסימום ", figure, tail: " מהפעולה" } } as SlimPart);

describe("two parts that read the same", () => {
  it("are equal whatever the figure's state: a copy of a listed figure shares one cell with it", () => {
    expect(partKey(max(sourced(30)))).toBe(partKey(max(entered(30, "pct_of_trade", today))));
    expect(partKey(max(sourced(30)))).not.toBe(partKey(max(sourced(25))));
  });

  it("show a figure the cases hold from one place as it is", () => {
    const parts: Record<string, SlimPart[]> = { a: [max(sourced(30))], b: [max(sourced(30))] };
    expect(mergedParts(["a", "b"], (id) => parts[id]!)).toEqual(parts.a);
  });

  it("show a list's figure and the person's copy as the list's, naming where each case's is from", () => {
    const own = entered(30, "pct_of_trade", today);
    const parts: Record<string, SlimPart[]> = { a: [max(own)], b: [max(sourced(30))] };
    const [m] = mergedParts(["a", "b"], (id) => parts[id]!);
    expect(m!.words.figure!.state).toBe("sourced");
    expect(m!.froms![0]!.map((x) => [x.case, x.value.state])).toEqual([["a", "entered"], ["b", "sourced"]]);
    expect(m!.froms![1]).toBeNull();
  });

  it("name both lists where two cases hold one figure from two lines of lists", () => {
    const fromList = (house: string): SiteValue => ({ ...sourced(30), own: house, source: { ...sourced(30).source, url: `https://example.org/${house}` } });
    const parts: Record<string, SlimPart[]> = { a: [max(fromList("x"))], b: [max(fromList("y"))] };
    const [m] = mergedParts(["a", "b"], (id) => parts[id]!);
    expect(m!.froms![0]!.map((x) => x.value.own)).toEqual(["x", "y"]);
  });
});

describe("a later price in a table, a grid or its rows", () => {
  const rate = (v: number, stage?: number): SlimPart => ({ id: "share", kind: "price", words: { figure: sourced(v), tail: " לכל פעולה" }, ...(stage ? { stage } : {}) } as SlimPart);
  const cap = (v: number, stage?: number): SlimPart => ({ ...max(sourced(v)), ...(stage ? { stage } : {}) });
  const note = (stage?: number): SlimPart => ({ id: "unfilled", kind: "note", words: { lead: "ועוד עמלת ברוקר בחו״ל" }, ...(stage ? { stage } : {}) } as SlimPart);
  const until = (month: string, stage: number): SlimPart => ({ id: "until", kind: "note", words: { lead: "ו", month }, stage } as SlimPart);
  const ids = (ps: readonly SlimPart[]) => ps.map((p) => `${p.id}@${p.stage ?? 0}`);

  it("says only what it changes: a part it holds as the price before it reads once, for every price", () => {
    const parts = [rate(0.25), cap(30), note(), until("2027-03", 1), rate(0.5, 1), cap(30, 1), note(1)];
    expect(ids(laterChanges(parts))).toEqual(["share@0", "cap@0", "unfilled@0", "until@1", "share@1"]);
  });

  it("is read against the price just before it, so a part changed back is said", () => {
    const parts = [rate(0.25), cap(30), until("2027-03", 1), rate(0.5, 1), cap(25, 1), until("2027-09", 2), rate(0.5, 2), cap(30, 2)];
    expect(ids(laterChanges(parts))).toEqual(["share@0", "cap@0", "until@1", "share@1", "cap@1", "until@2", "cap@2"]);
  });

  it("is said whole where it lacks a part the price before it holds", () => {
    const parts = [rate(0.25), cap(30), note(), until("2027-03", 1), rate(0.5, 1), note(1)];
    expect(ids(laterChanges(parts))).toEqual(ids(parts));
  });

  it("leaves a fee whose price does not change with time as it is", () => {
    const parts = [rate(0.25), cap(30)];
    expect(laterChanges(parts)).toEqual(parts);
  });
});
