// A part the toolbox added that asks for its figure takes the focus only the first time it is drawn: the page keeps the one whose box has
// had the focus (`useOpenCase`'s `pendingShown`) and calls it fresh while the part asking is another. A second tap or drop of the same card
// sets the same part again, which must leave the part asking as it is (`pendingAfter`), or its box would take the focus once more when it
// is drawn again (from the undo line of a condition taken away, among others).
import { describe, expect, it } from "vitest";
import { pendingAfter, pendingFresh, type Pending } from "./part-edit";

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
  const min: Pending = { fee: "fee-custody", case: null, part: "min" };

  it("is taken once: the same card tapped again keeps the part asking as it was drawn", () => {
    const p = page();
    p.set(min);
    expect(p.fresh()).toBe(true);
    p.onShown();
    p.set({ ...min });
    expect(p.fresh()).toBe(false);
    expect(pendingAfter(min, { ...min })).toBe(min);
  });

  it("is taken again by another part, the same part on another case or fee, and the same part once the one asking was given or dropped", () => {
    for (const other of [{ ...min, part: "max" }, { ...min, case: "case-2" }, { ...min, fee: "fee-trade" }] satisfies Pending[]) {
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
