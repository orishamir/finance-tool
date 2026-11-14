// A price a template fills, built through the registries (method §10.6): its form through the form's part (`PARTS[form].apply`), each
// figure where the price has a place for it (`FIGURES[figure].set`) and its part can stand there (`PARTS[part].holds`), each note through
// its part, then held to the fee's capacity (`fitted`). A template therefore cannot fill a price the model cannot hold; that it fills only
// what the product's fee is offered is held by a test (fill-offer.test.ts). Pure; no Hebrew.
import type { BoundCurrency, Months, Note, Num, Price } from "../model";
import type { FeeKindId } from "../shapes";
import type { ChargedForm } from "./capacity";
import { FIGURES, type Figure } from "./figures";
import { fitted, isFormPart, PART_IDS, PARTS, putPart, type FormPart, type PartId } from "./parts";

/** What a template gives of a price: its form, its figures with their sources, its notes, and the fields a form has that are no part. */
export interface PriceSpec {
  form: ChargedForm;
  figures: Partial<Record<Figure, Num>>;
  notes?: readonly Note[];
  /** The currency of its sums, for a form on an action; or that they are in the currency the action is made in (`inTrade`). */
  currency?: BoundCurrency;
  inTrade?: true;
  /** The months a share of what is held is for and between charges, and the months its bounds are printed per. */
  per?: Months;
  every?: Months;
  boundsEvery?: 1;
}

/** The part a form is, by the form (the registry's form parts). */
const FORM_PART = Object.fromEntries(PART_IDS.filter(isFormPart).map((id) => [PARTS[id].form, id])) as Readonly<Record<ChargedForm, FormPart>>;
/** The part a figure beside the main one stands in (the registry's figures of each part that is no form); the rate and the sum are the form's own. */
const FIGURE_PART = Object.fromEntries(PART_IDS.filter((id) => !isFormPart(id)).flatMap((id) => PARTS[id].figures.map((f) => [f, id]))) as Readonly<Partial<Record<Figure, PartId>>>;

/**
 * A template's price for a fee of `kind`: the form put on a free price, its periods and currency, each figure whose part the price can
 * hold (a part that stands blank until typed is put on first), each note, then what the fee's capacity keeps.
 */
export function buildPrice(kind: FeeKindId, spec: PriceSpec): Price {
  let p = putPart(kind, { form: "free" }, FORM_PART[spec.form], true);
  const fields = { ...(spec.per ? { per: spec.per } : {}), ...(spec.every ? { every: spec.every } : {}), ...(spec.boundsEvery ? { boundsEvery: spec.boundsEvery } : {}), ...(spec.currency ? { currency: spec.currency } : {}) };
  p = { ...p, ...fields } as Price;
  for (const [figure, n] of Object.entries(spec.figures) as [Figure, Num][]) {
    const part = FIGURE_PART[figure];
    if (part) {
      if (!PARTS[part].holds(kind, p)) continue;
      // a part that asks for no figure stands blank until its figures are set; a bound's figure is the part itself
      if (PARTS[part].ask === null && !PARTS[part].used(p)) p = putPart(kind, p, part, true);
    }
    p = FIGURES[figure].set(p, n);
  }
  for (const note of spec.notes ?? []) p = putPart(kind, p, note, true);
  if (spec.inTrade) p = putPart(kind, p, "inTrade", true);
  return fitted(kind, p);
}
