// What a product's fee is offered (method §10.6): its kind's capacity (capacity.ts, the parts a price of it can hold and the things it may
// change by), narrowed by the rule table's rows for the product (rules.ts). The toolbox shows only what the offer holds, a fee is offered
// to add only where its offer keeps a form that charges, and a new fee starts in the first form offered; a deal that holds more still
// opens and reads, since the model reads capacity. Pure; no Hebrew.
import type { ProviderKind } from "../model";
import { blankPrice } from "../model";
import { FEE_KIND_IDS, kindHas, type FeeKindId, type FormId } from "../shapes";
import { capacity, type ChargedForm } from "./capacity";
import { conditionsFor, type ByKind } from "./conditions";
import { PART_IDS, PARTS, type PartId } from "./parts";
import { RULES, type ProductFacts, type RuleRow } from "./rules";

/** A ban the law sets on a fee (a row's `ban`): the provider kind it binds, the values of what is bought or held it holds for, its cites. */
export interface Ban {
  provider: ProviderKind;
  values?: readonly string[];
  cite: readonly string[];
}

export interface Offer {
  /** The forms a price of the fee is offered in: free, which every price can be, and those that charge. */
  forms: readonly FormId[];
  /** The form a new price of the fee starts in: its kind's usual form where offered, else the first form offered that charges. */
  usual: ChargedForm | null;
  /** The parts offered, in the registry's order; the toolbox shows those its price can hold now. A form's part follows its form. */
  parts: readonly PartId[];
  /** The things its price may be offered to change by, in their order. */
  conditions: readonly ByKind[];
  /** The bans the law sets on the fee here, which the reading says (rules.ts). */
  bans: readonly Ban[];
  /** The cites behind each narrowing, by the part, thing or form it took away: a row's cites, and the product's record where it stands on it. */
  why: Partial<Record<PartId | ByKind | FormId, readonly string[]>>;
}

/** The forms a fee kind's price can take: free, and its capacity's. */
const formsOf = (fee: FeeKindId): FormId[] => ["free", ...capacity(fee).forms];

/**
 * What a fee kind's price can hold at all: the forms it can take, every part some price of it can hold (`PARTS[id].holds` on a price of
 * each form), and the things it may change by.
 */
export function capacityOffer(fee: FeeKindId): Offer {
  const forms = formsOf(fee);
  return {
    forms,
    usual: capacity(fee).usual,
    parts: PART_IDS.filter((id) => forms.some((f) => PARTS[id].holds(fee, blankPrice(f)))),
    conditions: conditionsFor(fee),
    bans: [],
    why: {},
  };
}

/** Whether a row is about a product's fee. */
const about = (row: RuleRow, product: ProductFacts | null, fee: FeeKindId): boolean =>
  (!row.when.fees || row.when.fees.includes(fee)) && (!row.when.products || (product !== null && row.when.products(product)));

/**
 * A list narrowed by a verdict's list: kept to it (`only`) or without it (`deny`), with the reasons for each item taken away. Free is
 * never taken away: every price can be free.
 */
function narrowed<T extends PartId | ByKind | FormId>(items: readonly T[], named: readonly T[] | undefined, kind: "only" | "deny", reasons: readonly string[], why: Offer["why"]): readonly T[] {
  if (!named) return items;
  const keep = (x: T) => x === "free" || (kind === "only" ? named.includes(x) : !named.includes(x));
  for (const x of items) if (!keep(x)) why[x] = [...new Set([...(why[x] ?? []), ...reasons])];
  return items.filter(keep);
}

/**
 * What a product's fee is offered: its kind's capacity (`capacityOffer`), narrowed by every row of the rule table about it. Always within
 * capacity: a row only keeps or drops, or names a ban. A form's part (`PARTS[id].form`) stands where its form is offered. A deal with no
 * product yet is offered its fee's capacity.
 */
export function offerFor(product: ProductFacts | null, fee: FeeKindId): Offer {
  const base = capacityOffer(fee);
  const why: Offer["why"] = {};
  const bans: Ban[] = [];
  let { forms, parts, conditions } = base;
  for (const row of RULES.filter((r) => about(r, product, fee))) {
    const v = row.verdict;
    if (v.kind === "ban") {
      bans.push({ provider: v.provider, ...(v.values ? { values: v.values } : {}), cite: row.cite });
      continue;
    }
    const reasons = [...row.cite, ...(row.records && product ? [product.id] : [])];
    forms = narrowed(forms, v.forms, v.kind, reasons, why);
    const own = parts.filter((id) => !PARTS[id].form);
    const kept = narrowed(own, v.parts, v.kind, reasons, why);
    parts = parts.filter((id) => (PARTS[id].form ? true : kept.includes(id)));
    conditions = narrowed(conditions, v.conditions, v.kind, reasons, why);
  }
  // a form's part follows its form, with the form's reasons
  parts = parts.filter((id) => {
    const form = PARTS[id].form;
    if (!form || forms.includes(form)) return true;
    if (why[form]) why[id] = why[form];
    return false;
  });
  const charging = forms.filter((f): f is ChargedForm => f !== "free");
  const usual = base.usual && charging.includes(base.usual) ? base.usual : (charging[0] ?? null);
  return { forms, usual, parts, conditions, bans, why };
}

/** Whether a product's fee is offered as a fee to add: its offer keeps a form that charges. */
export const feeOffered = (product: ProductFacts | null, fee: FeeKindId): boolean => offerFor(product, fee).usual !== null;

/**
 * Whether the page's product picker offers a product: some fee it has (`kindHas`) is offered. A bank deposit's, a savings plan's and a bank
 * child-savings plan's only fee, breaking it, fits no form the page has (BANK-06, BANK-16, BANK-28), so they are not; a saved deal of one
 * still opens.
 */
export const productOffered = (product: ProductFacts): boolean => FEE_KIND_IDS.some((f) => kindHas(product.id, product.bases, f) && feeOffered(product, f));
