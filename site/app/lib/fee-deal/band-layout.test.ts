// When two cases' parts read the same (band-layout.ts): the same figure in the same unit, whether the price list prints it there or the
// person copied it there; the cell they share shows it as the person's, so no figure is shown with a source it lacks somewhere.
import { describe, expect, it } from "vitest";
import { partKey, weakestOf } from "./band-layout";
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

  it("show the figure of the case that holds it as the person's, where one does", () => {
    const parts: Record<string, SlimPart[]> = { a: [max(sourced(30))], b: [max(entered(30, "pct_of_trade", today))] };
    expect(weakestOf(["a", "b"], (id) => parts[id]!)).toBe("b");
    expect(weakestOf(["a"], (id) => parts[id]!)).toBe("a");
  });
});
