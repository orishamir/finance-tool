// Every price a template fills is one its product's fee is offered (method §10.6): its form, and every part it has, are in the offer
// (offers/offer.ts), so a template never fills what the toolbox would not let the person type. Exceptions are listed with their cite.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { kindById } from "./kinds";
import { hasCases, newDeal, type Fee, type Price, type Priced } from "./model";
import { offerFor } from "./offers/offer";
import { PART_IDS, PARTS, type PartId } from "./offers/parts";
import { buildPrice } from "./offers/build";
import { typed } from "./model";
import { fillDeal, templateOptions } from "./templates";

const data = feesData();
const TODAY = "2026-11-12";

/** The prices of a fee, each with the priced thing it stands in (its case, or the fee). */
const pricesOf = (fee: Fee): { p: Price; x: Priced }[] => (hasCases(fee) ? fee.cases.flatMap((c) => [...c.stages, ...(c.sale ?? [])].map((s) => ({ p: s.price, x: c }))) : [...fee.stages, ...(fee.sale ?? [])].map((s) => ({ p: s.price, x: fee })));

/** What a template fills outside its product's offer, by fee kind and part, as `kind · part`. */
function outside(): { filled: number; out: Record<string, string[]> } {
  const out: Record<string, Set<string>> = {};
  let filled = 0;
  for (const kind of data.kinds) {
    const product = kindById(data.kinds, kind.id);
    for (const o of templateOptions(kind.id, data, TODAY)) {
      const d = fillDeal(newDeal(kind.id), o.id, data, TODAY);
      if (!d) continue;
      filled++;
      for (const fee of d.fees) {
        const offer = offerFor(product, fee.kind);
        for (const { p, x } of pricesOf(fee)) {
          const used = PART_IDS.filter((id) => PARTS[id].used(p, x));
          for (const id of used.filter((id: PartId) => !offer.parts.includes(id))) (out[`${kind.id} · ${fee.kind} · ${id}`] ??= new Set()).add(o.id);
        }
      }
    }
  }
  return { filled, out: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v].sort()])) };
}

describe("a template's prices", () => {
  it("are inside their product's offer", () => {
    const { filled, out } = outside();
    expect(filled).toBeGreaterThan(50);
    expect(out).toEqual({});
  });
});

describe("buildPrice", () => {
  it("builds a price through the registries and leaves out what the fee's kind cannot hold", () => {
    const n = typed;
    expect(buildPrice("trade", { form: "action", figures: { rate: n(0.1), min: n(5), cap: n(2), flat: n(3), upTo: n(50) }, currency: "USD", notes: ["unfilled"] })).toEqual({
      form: "action", rate: n(0.1), min: n(5), cap: n(2), flat: { amount: n(3), upTo: n(50) }, currency: "USD", notes: ["unfilled"],
    });
    // custody's held share has bounds and no percent maximum; a conversion's share no percent maximum; a deposit's share no bounds, no currency
    expect(buildPrice("custody", { form: "held", figures: { rate: n(0.2), max: n(7500), cap: n(2) }, per: 3, every: 3 })).toEqual({ form: "held", rate: n(0.2), max: n(7500), per: 3, every: 3 });
    expect(buildPrice("fx", { form: "action", figures: { rate: n(0.2), cap: n(1) } })).toEqual({ form: "action", rate: n(0.2) });
    expect(buildPrice("deposit", { form: "action", figures: { rate: n(1), min: n(5) }, currency: "USD" })).toEqual({ form: "action", rate: n(1) });
  });
});
