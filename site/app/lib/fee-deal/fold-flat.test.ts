// A flat price for a small action folded into the size of the action (fold-flat.ts): the same fee on every size, drawn as the size's steps.
import { describe, expect, it } from "vitest";
import { foldFlat } from "./fold-flat";
import type { Fee, Num } from "./model";

const n = (v: number): Num => ({ v });

describe("a flat price for a small action, folded", () => {
  it("makes a slim conversion change by the size of the action: the flat sum up to its sum, the rest above it", () => {
    const fee: Fee = { id: "f", kind: "fx", stages: [{ price: { form: "action", rate: n(0.0875), min: n(5), max: n(2475), flat: { amount: n(1.5), upTo: n(100) }, currency: "USD" } }] };
    expect(foldFlat(fee)).toEqual({
      id: "f",
      kind: "fx",
      by: [{ kind: "actionSize", unit: "USD", tops: [n(100)] }],
      cases: [
        { id: "c1", when: [0], stages: [{ price: { form: "perAction", amount: n(1.5), currency: "USD" } }] },
        { id: "c1-s1", when: [1], stages: [{ price: { form: "action", rate: n(0.0875), min: n(5), max: n(2475), currency: "USD" } }] },
      ],
    });
  });
  it("splits only the cases that hold one, the others standing at any size, and keeps a case's parts on both its steps", () => {
    const fee: Fee = {
      id: "f",
      kind: "trade",
      by: [{ kind: "what", values: [] }],
      cases: [
        { id: "a", when: [["tase"]], stages: [{ price: { form: "action", rate: n(0.1), flat: { amount: n(4), upTo: n(30000) }, discount: { pct: n(10) } } }] },
        { id: "b", when: ["any"], stages: [{ price: { form: "action", rate: n(0.2) } }] },
      ],
    };
    const out = foldFlat(fee);
    if (!out.cases) throw new Error("no cases");
    expect(out.by.map((b) => b.kind)).toEqual(["what", "actionSize"]);
    expect(out.cases.map((c) => [c.id, c.when])).toEqual([["a", [["tase"], 0]], ["a-s1", [["tase"], 1]], ["b", ["any", "any"]]]);
    expect(out.cases[0]!.stages[0]!.price).toEqual({ form: "perAction", amount: n(4), discount: { pct: n(10) } });
    expect(out.cases[1]!.stages[0]!.price).toEqual({ form: "action", rate: n(0.1), discount: { pct: n(10) } });
  });
  it("leaves a fee as it is where the fold cannot say the same: flat prices in two currencies, three things already, a price over time", () => {
    const two: Fee = {
      id: "f",
      kind: "trade",
      by: [{ kind: "what", values: [] }],
      cases: [
        { id: "a", when: [["tase"]], stages: [{ price: { form: "action", rate: n(0.1), flat: { amount: n(4), upTo: n(30000) } } }] },
        { id: "b", when: [["us"]], stages: [{ price: { form: "action", rate: n(0.1), flat: { amount: n(4), upTo: n(8000) }, currency: "USD" } }] },
      ],
    };
    expect(foldFlat(two)).toBe(two);
    const three: Fee = { ...two, by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }, { kind: "track", values: [] }], cases: [{ ...two.cases[0]!, when: [["tase"], "any", "any"] }] };
    expect(foldFlat(three)).toBe(three);
    const later: Fee = { id: "f", kind: "fx", stages: [{ price: { form: "action", rate: n(0.1), flat: { amount: n(1), upTo: n(100) } }, until: "2027-01" }, { price: { form: "action", rate: n(0.2) } }] };
    expect(foldFlat(later)).toBe(later);
    const none: Fee = { id: "f", kind: "fx", stages: [{ price: { form: "action", rate: n(0.1) } }] };
    expect(foldFlat(none)).toBe(none);
  });
});
