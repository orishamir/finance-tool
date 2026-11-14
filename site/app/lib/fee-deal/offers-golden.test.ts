// What each fee offers and holds, pinned in golden files: the toolbox's groups for every product, every fee its product has and every form
// the fee can take, each in its plain state and with every part it can hold; a price with every field and part its fee kind can hold,
// read back through the device and a link; and links written in the past, read back. A change that leaves what the page offers and reads
// as it is leaves these files as they are; one that narrows an offer changes the toolbox file only in the rows it names.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { toolbox } from "./builder";
import { decodeDeal, encodeDeal } from "./link";
import { blankPrice, newDeal, readDeal, typed, type Fee, type FeeDeal, type Price } from "./model";
import { readDealFor } from "./parts";
import { FEE_KIND_IDS, type FeeKindId, type FormId } from "./shapes";
import { kindHas } from "./offers/offer";
import { CAPACITY, keeps } from "./offers/capacity";
import { FIGURES, type Figure } from "./offers/figures";
import { isFormPart, PART_IDS, PARTS, putPart, type PartDef } from "./offers/parts";

const data = feesData();
const TODAY = "2026-11-12";
const GOLDEN = new URL("./__goldens__/", import.meta.url).pathname;

/** A sample for each figure a price can hold. */
const SAMPLE: Readonly<Record<Figure, number>> = { rate: 0.5, amount: 10, min: 5, max: 500, cap: 2, flat: 3, upTo: 50, discount: 10, third: 1, thirdMin: 1, thirdMax: 2, refund: 1, perSecurity: 7500 };

/**
 * A price of a form with every part its fee kind can hold there, from the part registry: the form's own figure, the currency where the
 * form keeps one, then each part of one price that the price holds (`PARTS[id].holds`), put on with its figures set. A new part is in it
 * without a change here.
 */
function fullPrice(fee: FeeKindId, form: FormId): Price {
  let p: Price = blankPrice(form);
  for (const f of ["rate", "amount"] as const) p = FIGURES[f].set(p, typed(form === "perUnit" ? 0.01 : SAMPLE[f]));
  if (keeps(fee, form, "currency")) p = { ...p, currency: "USD" } as Price;
  for (const id of PART_IDS) {
    const def: PartDef = PARTS[id];
    if (isFormPart(id) || def.apply.on === "fee" || !def.holds(fee, p)) continue;
    p = putPart(fee, p, id, true, { value: SAMPLE[def.figures[0] ?? "min"], against: "fixed_period" });
    for (const f of def.figures) if (FIGURES[f].placed(p)) p = FIGURES[f].set(p, typed(SAMPLE[f]));
  }
  return p;
}

/** A deal without its ids and its fees' ids, which a link makes anew by design. */
const content = (d: FeeDeal | null) => d && { ...d, id: "", fees: d.fees.map((f) => ({ ...f, id: "" })) };

const dealOf = (kind: FeeDeal["kind"], fee: Fee): FeeDeal => ({ ...newDeal(kind), id: "deal-golden", fees: [fee] });

describe("what each fee offers today (golden)", () => {
  it("the toolbox's groups for every product × fee × form, plain and full", async () => {
    const rows: Record<string, unknown> = {};
    for (const kind of data.kinds) {
      for (const fee of FEE_KIND_IDS.filter((f) => f !== "own" && kindHas(kind.id, kind.bases, f))) {
        for (const form of CAPACITY[fee].forms) {
          for (const state of ["plain", "full"] as const) {
            const price = state === "plain" ? blankPrice(form) : fullPrice(fee, form);
            const deal = dealOf(kind.id, { id: "fee-g", kind: fee, stages: [{ price }] });
            const t = toolbox(readDealFor(deal, data.kinds, TODAY), "fee-g")!;
            rows[`${kind.id} · ${fee} · ${form} · ${state}`] = t.groups.map((g) => `${g.group}: ${g.parts.map((x) => `${x.id}${x.used ? "✓" : ""}${x.off ? "⊘" : ""}`).join(" ")}`);
          }
        }
      }
    }
    await expect(JSON.stringify(rows, null, 1)).toMatchFileSnapshot(`${GOLDEN}toolbox.json`);
  });

  it("a price with every field its fee kind can hold reads back as it was, through the device and a link", async () => {
    const out: Record<string, string> = {};
    for (const fee of FEE_KIND_IDS) {
      for (const form of CAPACITY[fee].forms) {
        const deal = dealOf("brokerage-account", { id: "fee-g", kind: fee, stages: [{ price: fullPrice(fee, form) }] });
        const stored = readDeal(JSON.parse(JSON.stringify(deal)));
        const linked = decodeDeal(encodeDeal(deal));
        out[`${fee} · ${form}`] = stored === null ? "refused" : !isDeepStrictEqual(stored, deal) ? "device differs" : !isDeepStrictEqual(content(linked), content(deal)) ? `link differs: ${JSON.stringify(linked?.fees[0]?.stages?.[0]?.price)}` : "kept";
      }
    }
    await expect(JSON.stringify(out, null, 1)).toMatchFileSnapshot(`${GOLDEN}capacity.json`);
  });

  it("links written today read back as they read today", async () => {
    const links = JSON.parse(readFileSync(`${GOLDEN}links.json`, "utf8")) as Record<string, string>;
    const read = Object.fromEntries(Object.entries(links).map(([k, d]) => [k, content(decodeDeal(d))]));
    await expect(JSON.stringify(read, null, 1)).toMatchFileSnapshot(`${GOLDEN}links-read.json`);
  });
});
