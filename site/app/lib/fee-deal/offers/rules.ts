// The rule table (method §10.6): where a product's records or a rule narrow what its fee is offered, one row each, every row citing the
// rule ids (data/rules) or the record and line ids (data/) it stands on. A row never invents a rule: a narrowing with nothing to cite is
// not a row. The offer (offer.ts) reads the rows; capacity (capacity.ts) never does, so a deal that holds more still opens. Pure; no Hebrew.
import type { DealKind } from "../kinds";
import type { FeeKindId, FormId } from "../shapes";
import type { ByKind } from "./conditions";
import type { PartId } from "./parts";

/** The facts of a product the rows read: its record's id, the fee bases it allows, and its regulator (data-schema §3.3). */
export type ProductFacts = Pick<DealKind, "id" | "bases" | "regulator">;

/** Which products' fees a row is about: the products whose facts it holds of, and the fees among theirs; either left out is every one. */
export interface Selector {
  products?: (f: ProductFacts) => boolean;
  fees?: readonly FeeKindId[];
}

/**
 * What a row does to the offer: `only` keeps the parts, things to change by and forms it names (of each list it names) and drops the
 * rest; `deny` drops those it names.
 */
export type Verdict =
  | { kind: "only"; parts?: readonly PartId[]; conditions?: readonly ByKind[]; forms?: readonly FormId[] }
  | { kind: "deny"; parts?: readonly PartId[]; conditions?: readonly ByKind[]; forms?: readonly FormId[] };

export interface RuleRow {
  id: string;
  when: Selector;
  verdict: Verdict;
  /** The rule ids, or the record and line ids, the row stands on. */
  cite: readonly string[];
}

/** Whether a product is of the provident family: its record names the Capital Market Authority as its regulator (PF-01). */
export const providentFamily = (f: ProductFacts): boolean => f.regulator === "CMA";

export const RULES: readonly RuleRow[] = [
  {
    // a provident-family product's management fee, from each deposit or from the balance (KGL-14), is charged as a rate alone (PF-01),
    // with a discount only for a period (PF-13): its share, a price for a period, and a condition of the person's own
    id: "provident-management",
    when: { products: providentFamily, fees: ["deposit", "balance"] },
    verdict: { kind: "only", parts: ["share", "held", "until"], conditions: ["own"] },
    cite: ["PF-01", "KGL-14", "PF-13"],
  },
];
