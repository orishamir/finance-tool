// A part the toolbox added that asks for its figure takes the focus only the first time it is drawn: the page keeps the one whose box has
// had the focus (`useOpenCase`'s `pendingShown`) and calls it fresh while the part asking is another. A second tap or drop of the same card
// sets the same part again, which must leave the part asking as it is (`pendingAfter`), or its box would take the focus once more when it
// is drawn again (from the undo line of a condition taken away, among others). The page drops a pending part that waits no more
// (`pendingStands`): its fee, case, side or price gone, or its side's prices changed; any other change leaves it.
import { describe, expect, it } from "vitest";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { removeChange } from "../../lib/fee-deal/edits/stage";
import { pendingAfter, pendingFresh, pendingStands, type Pending } from "./part-edit";

/** The page's part asking, and the one whose box has had the focus, as `useOpenCase` holds them. */
function page() {
  let pending: Pending | null = null;
  let shown: Pending | null = null;
  return {
    set: (next: Pending | null) => void (pending = pendingAfter(pending, next)),
    fresh: () => pendingFresh(pending, shown),
    onShown: () => void (shown = pending),
  };
}

describe("a pending part's focus", () => {
  const min: Pending = { fee: "fee-custody", case: null, part: "min", place: { on: "price", side: "buy", k: 0 }, seen: "" };

  it("is taken once: the same card tapped again keeps the part asking as it was drawn", () => {
    const p = page();
    p.set(min);
    expect(p.fresh()).toBe(true);
    p.onShown();
    p.set({ ...min });
    expect(p.fresh()).toBe(false);
    expect(pendingAfter(min, { ...min })).toBe(min);
  });

  it("is taken again by another part, the same part on another price, case or fee, and the same part once the one asking was given or dropped", () => {
    for (const other of [{ ...min, part: "max" }, { ...min, place: { on: "price", side: "buy", k: 1 } }, { ...min, seen: "2027-01," }, { ...min, case: "case-2" }, { ...min, fee: "fee-trade" }] satisfies Pending[]) {
      const p = page();
      p.set(min);
      p.onShown();
      p.set(other);
      expect(p.fresh(), JSON.stringify(other)).toBe(true);
    }
    const p = page();
    p.set(min);
    p.onShown();
    p.set(null);
    p.set({ ...min });
    expect(p.fresh()).toBe(true);
  });
});

describe("a pending part kept by the page", () => {
  const share = (rate: number) => ({ form: "action", rate: typed(rate) }) as const;
  const deal: FeeDeal = {
    id: "deal-p",
    name: "",
    kind: "brokerage-account",
    fees: [
      { id: "fee-trade", kind: "trade", stages: [{ price: share(0.1), until: "2027-01" }, { price: share(0.2) }] },
      { id: "fee-fx", kind: "trade", by: [{ kind: "what", values: [] }], cases: [{ id: "c1", when: [["tase"]], stages: [{ price: share(0.2) }] }, { id: "c2", when: [["us"]], stages: [{ price: share(0.3) }] }] },
    ],
  };
  const onTrade: Pending = { fee: "fee-trade", case: null, part: "min", place: { on: "price", side: "buy", k: 1 }, seen: "2027-01," };

  it("stands while its fee, its case and its price are there as they were", () => {
    expect(pendingStands(deal, onTrade)).toBe(true);
    expect(pendingStands(deal, { fee: "fee-fx", case: "c2", part: "min", place: { on: "price", side: "buy", k: 0 }, seen: "" })).toBe(true);
  });

  it("goes with its fee, its case, or a change of its side's prices", () => {
    expect(pendingStands({ ...deal, fees: deal.fees.slice(1) }, onTrade)).toBe(false);
    expect(pendingStands(deal, { fee: "fee-fx", case: "c3", part: "min", place: { on: "price", side: "buy", k: 0 }, seen: "" })).toBe(false);
    expect(pendingStands(deal, { ...onTrade, case: "c1" })).toBe(false);
    const merged: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === "fee-trade" ? removeChange(f, "buy", 0) : f)) };
    expect(pendingStands(merged, onTrade)).toBe(false);
  });
});
