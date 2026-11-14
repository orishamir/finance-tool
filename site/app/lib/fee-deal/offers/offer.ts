// What a product's fee is offered (method §10.6): its kind's capacity (capacity.ts, the parts a price of it can hold and the things it may
// change by), narrowed by the rule table's rows for the product (rules.ts). The toolbox shows only what the offer holds; a deal that holds
// more still opens and reads, since the model reads capacity. Pure; no Hebrew.
import { blankPrice } from "../model";
import type { FeeKindId, FormId } from "../shapes";
import { capacity } from "./capacity";
import { conditionsFor, type ByKind } from "./conditions";
import { PART_IDS, PARTS, type PartId } from "./parts";
import { RULES, type ProductFacts, type RuleRow } from "./rules";

export interface Offer {
  /** The forms a price of the fee is offered in, free among them. */
  forms: readonly FormId[];
  /** The parts offered, in the registry's order; the toolbox shows those its price can hold now. */
  parts: readonly PartId[];
  /** The things its price may be offered to change by, in their order. */
  conditions: readonly ByKind[];
  /** The cites behind each narrowing, by the part, thing or form it took away. */
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
    parts: PART_IDS.filter((id) => forms.some((f) => PARTS[id].holds(fee, blankPrice(f)))),
    conditions: conditionsFor(fee),
    why: {},
  };
}

/** Whether a row is about a product's fee. */
const about = (row: RuleRow, product: ProductFacts | null, fee: FeeKindId): boolean =>
  (!row.when.fees || row.when.fees.includes(fee)) && (!row.when.products || (product !== null && row.when.products(product)));

/** A list narrowed by a verdict's list: kept to it (`only`) or without it (`deny`), with the cites for each item taken away. */
function narrowed<T extends PartId | ByKind | FormId>(items: readonly T[], named: readonly T[] | undefined, row: RuleRow, why: Offer["why"]): readonly T[] {
  if (!named) return items;
  const keep = (x: T) => (row.verdict.kind === "only" ? named.includes(x) : !named.includes(x));
  for (const x of items) if (!keep(x)) why[x] = [...(why[x] ?? []), ...row.cite];
  return items.filter(keep);
}

/**
 * What a product's fee is offered: its kind's capacity (`capacityOffer`), narrowed by every row of the rule table about it. Always within
 * capacity: a row only keeps or drops. A deal with no product yet is offered its fee's capacity.
 */
export function offerFor(product: ProductFacts | null, fee: FeeKindId): Offer {
  const base = capacityOffer(fee);
  const why: Offer["why"] = {};
  let { forms, parts, conditions } = base;
  for (const row of RULES.filter((r) => about(r, product, fee))) {
    forms = narrowed(forms, row.verdict.forms, row, why);
    parts = narrowed(parts, row.verdict.parts, row, why);
    conditions = narrowed(conditions, row.verdict.conditions, row, why);
  }
  return { forms, parts, conditions, why };
}
