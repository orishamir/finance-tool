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
  it("leaves out each part its price holds as the price before it, and nothing else", () => {
    const part = (id: string, stage?: number, alike?: true): SlimPart => ({ id, kind: "charge", words: {}, ...(stage ? { stage } : {}), ...(alike ? { alike } : {}) } as SlimPart);
    const parts = [part("share"), part("cap"), part("until", 1), part("share", 1), part("cap", 1, true)];
    expect(laterChanges(parts).map((p) => `${p.id}@${p.stage ?? 0}`)).toEqual(["share@0", "cap@0", "until@1", "share@1"]);
  });
});
