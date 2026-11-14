// The part registry and the tables keyed by it (method §10.6): every mirror of the registry follows it, every part a price can hold goes on
// and comes off again, and every part a change of form leaves behind is named in the undo's words.
import { describe, expect, it } from "vitest";
import { computedInputs, feeDeal as copy } from "../../../copy";
import { feesData } from "../../fees.server";
import { blankPrice, newDeal, typed, type FeeDeal, type Price } from "../model";
import { OFFERED, SAID, STATED } from "../part-words";
import { TOOL_ORDER } from "../toolbox";
import { FEE_KIND_IDS } from "../shapes";
import { changeFormKept, undoWords } from "../undo";
import { capacity, keeps } from "./capacity";
import { KEY_FORMS, PART_KEYS } from "./capabilities";
import { FIGURE_IDS, FIGURES } from "./figures";
import { isFormPart, isPending, PART_IDS, PARTS, putPart, type PartDef, type PartId } from "./parts";

const data = feesData();

/** Each part's sample `at`: its figure, a fee to be offset against. */
const at = (id: PartId) => ({ value: PARTS[id].ask === "pct" ? 2 : 5, against: "fixed_period" as const });

/** A price of the form with its own figure typed. */
function priced(form: Price["form"]): Price {
  let p = blankPrice(form);
  for (const f of ["rate", "amount"] as const) p = FIGURES[f].set(p, typed(1));
  return p;
}

describe("the part registry", () => {
  it("derives which parts ask, which are forms and which the toolbox offers", () => {
    expect(PART_IDS.filter(isPending)).toEqual(["until", "min", "max", "cap", "maxPerSecurity", "offset"]);
    expect(PART_IDS.filter(isFormPart)).toEqual(["share", "perUnit", "perAction", "held", "sum", "free"]);
    expect(PART_IDS.filter((id) => PARTS[id].tool === null)).toEqual(["free", "unfilledClerk", "unfilledClerkAbroad", "capRead"]);
  });

  it("puts every part the registry gives a toolbox group in that group's order, once", () => {
    for (const [group, order] of Object.entries(TOOL_ORDER)) expect([...order].sort(), group).toEqual(PART_IDS.filter((id) => PARTS[id].tool === group).sort());
  });

  it("has words for every part, every card the toolbox offers and every stated part", () => {
    for (const id of PART_IDS) {
      expect(SAID[id], id).toBeTypeOf("function");
      if (PARTS[id].tool) expect(OFFERED[id as keyof typeof OFFERED], id).toBeTypeOf("function");
      if (PARTS[id].stated) expect(STATED[id as keyof typeof STATED], id).toBeTypeOf("function");
    }
  });

  it("names every part a change of form leaves behind in the undo's words", () => {
    for (const id of PART_IDS.filter((x) => PARTS[x].lost)) expect((copy.cases.formChanged.parts as Record<string, string>)[id], id).toMatch(/\S/);
    // a held share's maximum on each security, left behind by a sum per period
    const deal: FeeDeal = { ...newDeal("brokerage-account"), fees: [{ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 3, perSecurity: typed(7500) } }] }] };
    const r = changeFormKept(deal, "fee-c", "sum", null)!;
    const words = undoWords(r.undo!, () => "", data);
    expect(words).toContain(copy.cases.formChanged.parts.maxPerSecurity);
    expect(words).not.toContain("undefined");
  });

  it("keeps each part in a key that has a place in the forms it stands in, and each capacity field in a key of its own", () => {
    for (const id of PART_IDS) {
      const def: PartDef = PARTS[id];
      if (def.field) expect(PART_KEYS, id).toContain(def.field);
      if (def.capField && def.capField !== "currency") expect(def.field, id).toBe(def.capField === "perSecurity" ? "perSecurity" : def.capField);
    }
    // every capacity field a fee lists beside its form's own figure has a place in that form
    for (const fee of FEE_KIND_IDS)
      for (const form of capacity(fee).forms)
        for (const f of PART_KEYS.filter((k) => keeps(fee, form, k as never))) expect(KEY_FORMS[f](form), `${fee} ${form} ${f}`).toBe(true);
  });

  it("puts every part a fee's price can hold on, and takes it away again, for every fee and form", () => {
    let checked = 0;
    for (const fee of FEE_KIND_IDS) {
      for (const form of capacity(fee).forms) {
        const p = priced(form);
        for (const id of PART_IDS.filter((x) => !isFormPart(x) && PARTS[x].apply.on === "price" && PARTS[x].holds(fee, p))) {
          const on = putPart(fee, p, id, true, at(id));
          expect(PARTS[id].used(on), `${fee} ${form} ${id}`).toBe(true);
          expect(putPart(fee, on, id, false), `${fee} ${form} ${id}`).toEqual(p);
          checked++;
        }
        // a part the price cannot hold is not put on
        for (const id of PART_IDS.filter((x) => !isFormPart(x) && PARTS[x].apply.on === "price" && !PARTS[x].holds(fee, p))) expect(putPart(fee, p, id, true, at(id)), `${fee} ${form} ${id}`).toBe(p);
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it("names every figure in the reading's input names", () => {
    for (const f of FIGURE_IDS) {
      const key = f === "rate" || f === "amount" ? "deal:trade" : `deal:trade.${f}`;
      expect(computedInputs.names[key], f).toMatch(/\S/);
    }
  });
});
