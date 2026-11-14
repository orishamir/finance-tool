// What a product is offered (method §10.6), decided here alone: which fees it is offered to add (`feeOffered`, `feesOffered`; the fees its
// records give it, less a fee the regulator's data bars and a fee whose offer keeps no form that charges), whether the product picker
// offers it (`productOffered`), and what each fee is offered (`offerFor`: its kind's capacity, the parts a price of it can hold and the
// things it may change by, narrowed by the rule table's rows for the product, rules.ts). The toolbox shows only what the offer holds, a new
// fee and a price after a free one start in the first form offered, and a deal of another product keeps only the fees it is offered; a
// deal that holds more still opens and reads, since the model reads capacity. Pure; no Hebrew.
import type { ProviderKind } from "../model";
import { blankPrice } from "../model";
import type { FeeBase, ProductId } from "@finance-tool/schema";
import { FEE_KIND_IDS, holdsFunds, type FeeKindId, type FormId } from "../shapes";
import { capacity, type ChargedForm } from "./capacity";
import { conditionsFor, type ByKind } from "./conditions";
import { PART_IDS, PARTS, type PartId } from "./parts";
import { RULES, type ProductFacts, type RuleRow } from "./rules";

/**
 * A ban the law sets on a fee (a row's `ban`): the provider kind it binds, the values of what is bought or held it holds for, its cites,
 * whether it is the site's reading of them (`reading`), and whether a distribution fee may still be charged (`distribution`).
 */
export interface Ban {
  provider: ProviderKind;
  values?: readonly string[];
  cite: readonly string[];
  reading?: true;
  distribution?: true;
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
      bans.push({ provider: v.provider, ...(v.values ? { values: v.values } : {}), cite: row.cite, ...(v.reading ? { reading: true as const } : {}), ...(v.distribution ? { distribution: true as const } : {}) });
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

/**
 * The fees a kind offers beyond its record's bases, the rarer ones: for a kind that holds funds, the spread of a conversion, a charge for a
 * corporate event abroad and a current account at a bank. A fee of the person's own (`own`) is offered to every kind, last.
 */
const RARER_FOR_FUNDS: readonly FeeKindId[] = ["fx_spread", "corporate_event", "current_account"];

/**
 * Whether a kind has a fee at all: one of its record's bases, for a kind that holds funds the fund's own fee and the rarer fees, and a fee
 * of the person's own, which every kind has.
 */
export function kindHas(kind: ProductId, bases: readonly FeeBase[], fee: FeeKindId): boolean {
  return fee === "own" || (bases as readonly FeeKindId[]).includes(fee) || (holdsFunds(kind) && (fee === "fund_management" || RARER_FOR_FUNDS.includes(fee)));
}

/**
 * A verdict from the data that a product may not charge some fees, which no rule row can say since it reads the regulator's data, with the
 * rules it stands on: a fee from deposits where the data says of every track of the product that there is none, by rule (PF-06).
 */
export interface DataBar {
  fees: readonly FeeKindId[];
  cite: readonly string[];
}

/**
 * Whether a product's fee is offered as a fee to add: the product has it (`kindHas`), the data does not bar it (`bar`), and its offer
 * keeps a form that charges; with no product yet, any fee its kind's capacity can charge.
 */
export const feeOffered = (product: ProductFacts | null, fee: FeeKindId, bar?: DataBar | null): boolean =>
  (product === null || kindHas(product.id, product.bases, fee)) && !bar?.fees.includes(fee) && offerFor(product, fee).usual !== null;

/**
 * The fees to suggest for a deal of a product, each one it is offered (`feeOffered`) and lacks (`present`): `usual`, its record's bases
 * (and, for a kind that holds funds, the fund's own fee); `rarer`, the rarer fees and a fee of the person's own, last. A deal with no
 * product yet is suggested a fee of the person's own alone.
 */
export function feesOffered(product: ProductFacts | null, present: readonly FeeKindId[], bar?: DataBar | null): { usual: FeeKindId[]; rarer: FeeKindId[] } {
  const ok = (k: FeeKindId) => !present.includes(k) && feeOffered(product, k, bar);
  if (!product) return { usual: [], rarer: ok("own") ? ["own"] : [] };
  const funds = holdsFunds(product.id);
  const own: FeeKindId[] = [...(product.bases as readonly FeeKindId[]), ...(funds ? (["fund_management"] as const) : [])];
  const usual = own.filter(ok);
  const rarer = [...(funds ? RARER_FOR_FUNDS.filter((k) => !own.includes(k)) : []), "own" as const].filter(ok);
  return { usual, rarer };
}

/**
 * Whether the page's product picker offers a product: some fee it has is offered. A bank deposit's, a savings plan's and a bank
 * child-savings plan's only fee, breaking it, fits no form the page has (BANK-06, BANK-16, BANK-28), so they are not; a saved deal of one
 * still opens.
 */
export const productOffered = (product: ProductFacts): boolean => FEE_KIND_IDS.some((f) => feeOffered(product, f));

/**
 * The ban the law sets on a product's fee for a deal (a row's `ban`): one that binds the deal's provider kind and, where it names values,
 * holds for the deal's pick of what is bought or held (F-114). Null where none holds, or the deal names no provider kind.
 */
export function banFor(product: ProductFacts | null, fee: FeeKindId, provider: ProviderKind | undefined, picks: readonly { by: string; is: string }[]): Ban | null {
  if (!provider) return null;
  const what = picks.find((p) => p.by === "what")?.is;
  return offerFor(product, fee).bans.find((b) => b.provider === provider && (!b.values || (what !== undefined && b.values.includes(what)))) ?? null;
}
