// A grid cell's sheet lists every offer it chose among, each under a name of its own (F-108): offers a bank prints under one name, apart only
// in their exit points, kept one line between them when the sheet was keyed by the name.
import { describe, expect, it } from "vitest";
import { cellOf, sheetNames, type DbData, type DbOffer } from "./deposit-browser";
import type { SiteValue } from "./value";

const v = (value: number): SiteValue => ({ value, unit: "pct_per_year", state: "sourced", source: { url: "https://example.org", title: "t", publisher: "p", strength: "institution" }, checked: "2026-11-09", effective_from: "2026-11-09", effective_to: null }) as unknown as SiteValue;
function offer(id: string, rate: number, exits: DbOffer["exits"], min = 250): DbOffer {
  return { id, bank: "discount", term: "y1", name: "פקדון לשנה", kind: "fixed", linkage: "none", limited: false, labels: [], rate_offered: v(rate), anchor: null, spread: null, amount_range: { min: v(min), max: null }, breakTerm: "with_penalty", exits };
}
const data: DbData = {
  today: "2026-11-09",
  read: "2026-11-09",
  banks: [{ id: "discount", name: "דיסקונט", tableDate: null }],
  offers: [offer("a", 2.25, { exists: false, everyMonths: null }), offer("b", 1, { exists: true, everyMonths: 3 }), offer("c", 0.5, { exists: true, everyMonths: 1 }), offer("d", 0.4, { exists: true, everyMonths: 1 })],
  amounts: [],
  start: 10000,
};

describe("sheetNames", () => {
  it("gives every offer a name of its own, telling same-name offers apart", () => {
    const names = sheetNames(data);
    expect(new Set(names.values()).size).toBe(4);
    expect(names.get("b")).toContain("3");
    expect(names.get("d")).toMatch(/\(2\)$/);
  });

  it("lists in a cell's sheet every offer the amount opens", () => {
    const names = sheetNames(data);
    const cell = cellOf(data, "discount", "y1", "fixed", 10000, (o) => names.get(o.id)!);
    expect(Object.keys(cell.rate?.computed_from?.inputs ?? {})).toHaveLength(4);
    expect(cell.rate?.value).toBe(2.25);
  });
});
