// The deposits grid's shading scale (F-108, `scaleTop`): it ends at the highest rate a cell may pick, so every rate has a shade of its own;
// linked and limited offers never set it.
import { describe, expect, it } from "vitest";
import { scaleTop, type DbData, type DbOffer } from "./deposit-browser";
import type { SiteValue } from "./value";

const v = (value: number): SiteValue => ({ value, unit: "pct_per_year", state: "sourced" }) as unknown as SiteValue;

function offer(id: string, rate: number, extra: Partial<DbOffer> = {}): DbOffer {
  return { id, bank: "b", term: "y1", name: id, kind: "fixed", linkage: "none", limited: false, labels: [], rate_offered: v(rate), anchor: null, spread: null, amount_range: { min: v(1000), max: null }, breakTerm: "none", exits: { exists: false, everyMonths: null }, ...extra };
}

const data = (offers: DbOffer[]): DbData => ({ today: "2026-11-09", read: "2026-11-09", banks: [], offers, amounts: [], start: 10000 });

describe("scaleTop", () => {
  it("ends at the highest rate", () => {
    const rates = Array.from({ length: 19 }, (_, i) => offer(`o${i}`, 0.1 * (i + 1) + 0.3));
    expect(scaleTop(data([...rates, offer("high", 3.5)]), "fixed")).toEqual({ top: 3.5 });
  });

  it("is not set by linked, limited or other-kind offers", () => {
    const base = [offer("a", 1), offer("b", 1.2)];
    const others = [offer("cpi", 9, { linkage: "cpi" }), offer("closed", 9, { limited: true }), offer("var", 9, { kind: "variable" })];
    expect(scaleTop(data([...base, ...others]), "fixed")).toEqual({ top: 1.2 });
  });
});
