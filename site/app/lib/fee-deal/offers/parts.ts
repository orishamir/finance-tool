// The part registry (method §10.6, F-110, F-116, F-117 and §10.6's stated parts): every part a price may have, defined once. Each entry
// says the part's look, the form it puts the price in or the key it is kept in, where a change of form carries it, its figures, what it
// asks for before it stands, where the toolbox shows it, whether the reading states it, whether a change of form that leaves it says so,
// whether a price has it, and the edit that adds or takes it away. Where it can stand follows from its key (capabilities.ts) and the fee's
// capacity (capacity.ts). The toolbox, the open case, the templates, the undo's words, the reading's stated parts, the rule table and a
// change of form all read this registry, and the types they key by (`PendingPart`, `ToolPartId`, `RulePart`, `LostPart`, `StatedPart`)
// are derived from it. Adding a part is adding an entry here and its words (part-words.ts and the copy); a table keyed by a derived type
// fails to compile until it has the part. Pure; no Hebrew.
import { blankPrice, mainFigure, typed, type Fee, type MonthKey, type Note, type Price, type Priced, type Side } from "../model";
import { editPrice, removeChange, setSaleApart, splitAt } from "../edits/stage";
import { withDiscount, withFigure, withFlat, withNote, withOffset, withRefund, withThird } from "../edits/price";
import { type FeeKindId, type FormId } from "../shapes";
import { keeps, PART_FIELDS, pricesSaleApart, takes, type PartFieldId } from "./capacity";
import { boundsAction, byRate, charged, formBoundsAction, KEY_FORMS, onAction, pricedCurrency, sameFigureKind, type PartKey } from "./capabilities";
import { FIGURES, type Figure } from "./figures";

/**
 * Every part a price may have, by id (the toolbox's cards and the open case's lines): its main figure as a share of each action (`share`),
 * a sum for each unit (`perUnit`), a sum on each action (`perAction`), a share of what is held (`held`), a sum per period (`sum`), free
 * (`free`), a discount, a third party's fee, a later price (`until`); a minimum, a maximum, a percent maximum (`cap`), a flat price for a
 * small action (`flat`), a held share's maximum on each security (`maxPerSecurity`); an offset, a refund; notes on an order (`unfilled`,
 * `unfilledClerk`, `unfilledClerkAbroad`, `capRead`, `partial`), sums in the action's currency (`inTrade`) and a sale priced apart (`sale`).
 * `PARTS` satisfies a record of these ids, so the union and the registry cannot drift apart.
 */
export type PartId =
  | "share"
  | "perUnit"
  | "perAction"
  | "held"
  | "sum"
  | "free"
  | "discount"
  | "third"
  | "until"
  | "min"
  | "max"
  | "cap"
  | "flat"
  | "maxPerSecurity"
  | "offset"
  | "refund"
  | "unfilled"
  | "unfilledClerk"
  | "unfilledClerkAbroad"
  | "capRead"
  | "partial"
  | "inTrade"
  | "sale";

/**
 * The kind of a part, which gives its colour and icon: `price` (a share, a sum, a discount, a third party's fee, a time limit; neutral),
 * `bound` (a minimum, a maximum, a percent maximum, a flat price for a small action), `link` (an offset or a refund), `note` (words on an
 * order, a sale priced apart; a dashed edge).
 */
export type PartKind = "price" | "bound" | "link" | "note";

/** The toolbox's groups a part may show in: the price, minimum and maximum, a link to another fee, more on the price. */
export type ToolGroupId = "price" | "bound" | "link" | "more";

/** What a part asks for before it can stand, where it asks: a percent, a sum or a fee (an offset's). */
export type Ask = "pct" | "sum" | "fee" | null;

/**
 * Where a part goes, and what it needs: the case (`caseId`; a fee with cases is edited in its first where none is named), the side and the
 * price (`side`, `k`: the purchase's first where none is said), a bound's or a percent maximum's figure (`value`: a bound is never blank),
 * the month a price changes from (`month`), and the fee an offset is against (`against`).
 */
export interface PartAt {
  caseId?: string;
  side?: Side;
  k?: number;
  value?: number;
  month?: MonthKey;
  against?: FeeKindId;
}

/** A part's edit: of the one price it is on (with the fee's kind, which a form's fields follow), or of the fee's prices (a later price, a sale). */
type PartEdit = { on: "price"; edit: (p: Price, on: boolean, at: PartAt, kind: FeeKindId) => Price } | { on: "fee"; edit: <F extends Fee>(fee: F, on: boolean, at: PartAt) => F };

/** A part as the registry defines it; `holds` is derived from it (`PartDef`). */
interface PartSpec {
  kind: PartKind;
  /** The form it puts the price in, for a form of the price. */
  form?: FormId;
  /** The key of the price it is kept in, for a part a price holds beside its main figure: it stands where the key has a place (`KEY_FORMS`). */
  field?: PartKey;
  /**
   * The forms between which a change of form carries it, where narrower than where its key stands: a minimum and a maximum carry between a
   * share of an action and a sum per unit, which bound the action the same way, and not to or from a share of what is held, whose bounds
   * are per charge.
   */
  carriesIn?: (form: FormId) => boolean;
  /** The capacity field a fee's form must list for the part to stand on its price (capacity.ts); none where every price with its key can. */
  capField?: PartFieldId;
  /** Whether a fee can hold it, for a part of the fee's prices (a later price, a sale) rather than of one price. */
  feeHolds?: (kind: FeeKindId) => boolean;
  /** The figures it holds, in the order its boxes stand. */
  figures: readonly Figure[];
  /** What it asks for before it stands (the toolbox hands it to the open case to ask); null where it stands at once. */
  ask: Ask;
  /** The toolbox group it shows in; null where the toolbox does not offer it (a note only a template fills, a later price). */
  tool: ToolGroupId | null;
  /** Whether the reading states it without computing it (§10.6's stated parts), where the price has it. */
  stated?: true;
  /** Whether a change of form that leaves it behind says so by name (undo.ts). */
  lost?: true;
  /** Whether a price has it; a part of the fee's prices (a later price, a sale) asks the case's prices `x`. */
  used: (p: Price, x?: Priced) => boolean;
  /** The edit that adds it (`on`) or takes it away. */
  apply: PartEdit;
}

export interface PartDef extends PartSpec {
  /**
   * Whether a fee of `kind` can hold it on the price `p` as it stands: a form, where the fee can take it; a part kept in a key, where the
   * price's form has a place for the key and the fee's capacity lists its field there; a part of the fee's prices, where the fee can. A
   * part the price cannot hold is not offered and is not put on; a form of the price that can is.
   */
  holds: (kind: FeeKindId, p: Price) => boolean;
}

const onPrice = (edit: (p: Price, on: boolean, at: PartAt, kind: FeeKindId) => Price): PartEdit => ({ on: "price", edit });

/** A form of the price: on, the price in that form with what carries over (`withForm`), as the fee may hold it (`fitted`); off, free. */
const formEdit = (form: FormId) => ({
  used: (p: Price) => p.form === form,
  apply: onPrice((p, on, _at, kind) => (on ? fitted(kind, withForm(p, form)) : p.form === form ? { form: "free" } : p)),
});

/** A figure kept as a part (a bound, a percent maximum, a maximum on each security): on, with the figure the open case asked for; off, taken away. */
const figureEdit = (figure: "min" | "max" | "cap" | "perSecurity") => ({
  used: (p: Price) => FIGURES[figure].get(p) !== undefined,
  apply: onPrice((p, on, at) => withFigure(p, figure, on ? at.value! : null)),
});

/** A note on an order (§10.6's stated parts), kept in the price's list of notes: on any price on an action, a corporate event's sum among them. */
const noteEdit = (id: Note) => ({
  used: (p: Price) => onAction(p) && !!p.notes?.includes(id),
  apply: onPrice((p, on) => withNote(p, id, on)),
});

/** The registry, in the order a price's line says its parts: its price, its time limit, its bounds, its links, its notes. */
const SPECS = {
  share: { kind: "price", form: "action", figures: ["rate"], ask: null, tool: "price", ...formEdit("action") },
  perUnit: { kind: "price", form: "perUnit", figures: ["amount"], ask: null, tool: "price", ...formEdit("perUnit") },
  perAction: { kind: "price", form: "perAction", figures: ["amount"], ask: null, tool: "price", ...formEdit("perAction") },
  held: { kind: "price", form: "held", figures: ["rate"], ask: null, tool: "price", ...formEdit("held") },
  sum: { kind: "price", form: "sum", figures: ["amount"], ask: null, tool: "price", ...formEdit("sum") },
  free: { kind: "price", form: "free", figures: [], ask: null, tool: "price", ...formEdit("free") },
  discount: { kind: "price", field: "discount", figures: ["discount"], ask: null, tool: "price", used: (p: Price) => onAction(p) && !!p.discount, apply: onPrice((p, on) => withDiscount(p, on)) },
  third: { kind: "price", field: "third", figures: ["third", "thirdMin", "thirdMax"], ask: null, tool: "price", stated: true, used: (p: Price) => onAction(p) && !!p.third, apply: onPrice((p, on) => withThird(p, on)) },
  // the month a price changes from (F-110): never a card of the toolbox; the page adds it at the end of the prices, by its month alone, and
  // takes it away at its divider
  until: {
    kind: "price",
    feeHolds: () => true,
    figures: [],
    ask: null,
    tool: null,
    used: (_p: Price, x?: Priced) => !!x && x.stages.length > 1,
    // on, the price in force at the month splits in two there (nothing without a month); off, change `k` goes, the later price merging back
    apply: { on: "fee", edit: (fee, on, at) => (!on ? removeChange(fee, at.side ?? "buy", at.k ?? 0, at.caseId) : at.month ? splitAt(fee, at.side ?? "buy", at.month, at.caseId) : fee) },
  },

  min: { kind: "bound", field: "min", carriesIn: formBoundsAction, capField: "min", figures: ["min"], ask: "sum", tool: "bound", lost: true, ...figureEdit("min") },
  max: { kind: "bound", field: "max", carriesIn: formBoundsAction, capField: "max", figures: ["max"], ask: "sum", tool: "bound", lost: true, ...figureEdit("max") },
  cap: { kind: "bound", field: "cap", capField: "cap", figures: ["cap"], ask: "pct", tool: "bound", lost: true, ...figureEdit("cap") },
  flat: { kind: "bound", field: "flat", capField: "flat", figures: ["flat", "upTo"], ask: null, tool: "price", lost: true, used: (p: Price) => boundsAction(p) && !!p.flat, apply: onPrice((p, on) => withFlat(p, on)) },
  // a maximum on each security of a held share, stated and never computed (§10.6's stated parts)
  maxPerSecurity: { kind: "bound", field: "perSecurity", capField: "perSecurity", figures: ["perSecurity"], ask: "sum", tool: "bound", stated: true, lost: true, ...figureEdit("perSecurity") },
  offset: { kind: "link", field: "offset", figures: [], ask: "fee", tool: "link", stated: true, used: (p: Price) => charged(p) && !!p.offset, apply: onPrice((p, on, at) => withOffset(p, on ? at.against! : null)) },
  refund: { kind: "link", field: "refund", figures: ["refund"], ask: null, tool: "link", stated: true, used: (p: Price) => charged(p) && !!p.refund, apply: onPrice((p, on) => withRefund(p, on)) },
  unfilled: { kind: "note", field: "notes", figures: [], ask: null, tool: "more", stated: true, ...noteEdit("unfilled") },
  // a bank's order through a clerk not carried out (BRK-16) and the site's reading of a percent maximum over a minimum (F-12): a template fills them
  unfilledClerk: { kind: "note", field: "notes", figures: [], ask: null, tool: null, stated: true, ...noteEdit("unfilledClerk") },
  unfilledClerkAbroad: { kind: "note", field: "notes", figures: [], ask: null, tool: null, stated: true, ...noteEdit("unfilledClerkAbroad") },
  capRead: { kind: "note", field: "notes", figures: [], ask: null, tool: null, stated: true, ...noteEdit("capRead") },
  partial: { kind: "note", field: "notes", figures: [], ask: null, tool: "more", stated: true, ...noteEdit("partial") },
  // sums in the currency the trade is made in ("מינימום 30 במטבע העסקה"), where the fee's form lists it: a reading takes it from what is bought
  inTrade: {
    kind: "note",
    field: "inTrade",
    capField: "inTrade",
    figures: [],
    ask: null,
    tool: "more",
    used: (p: Price) => onAction(p) && !!p.inTrade,
    apply: onPrice((p, on) => (!onAction(p) || on === !!p.inTrade ? p : on ? { ...p, inTrade: true } : without(p, "inTrade"))),
  },
  sale: { kind: "note", feeHolds: pricesSaleApart, figures: [], ask: null, tool: "more", used: (_p: Price, x?: Priced) => !!x?.sale, apply: { on: "fee", edit: (fee, on, at) => setSaleApart(fee, on, at.caseId) } },
} as const satisfies Record<PartId, PartSpec>;

type Specs = typeof SPECS;
type IdsWhere<C> = { [K in PartId]: Specs[K] extends C ? K : never }[PartId];

/** A form of the price, as a part. */
export type FormPart = IdsWhere<{ form: FormId }>;
/** A part that is no form of the price: the parts a rule row names (rules.ts). */
export type RulePart = Exclude<PartId, FormPart>;
/** A part the toolbox adds that cannot stand until it has what it asks for (`ask`): a figure, a month or a fee. */
export type PendingPart = Exclude<PartId, IdsWhere<{ ask: null }>>;
/** A part the toolbox offers. */
export type ToolPartId = Exclude<PartId, IdsWhere<{ tool: null }>>;
/** The parts the toolbox offers in a group. */
export type ToolPartIn<G extends ToolGroupId> = IdsWhere<{ tool: G }>;
/** A part a change of form names when it leaves it behind (undo.ts). */
export type LostPart = IdsWhere<{ lost: true }>;
/** A part the reading states without computing (§10.6's stated parts). */
export type StatedPartId = IdsWhere<{ stated: true }>;

/** Whether a part kept in a key stands on the price: its key has a place in the form, and the fee's form lists its capacity field. */
const keyHolds = (spec: PartSpec, kind: FeeKindId, p: Price): boolean =>
  !!spec.field && KEY_FORMS[spec.field](p.form) && (!spec.capField || keeps(kind, p.form, spec.capField));

function defOf(spec: PartSpec): PartDef {
  const holds = spec.form !== undefined ? (kind: FeeKindId) => takes(kind, spec.form!) : spec.feeHolds ? (kind: FeeKindId) => spec.feeHolds!(kind) : (kind: FeeKindId, p: Price) => keyHolds(spec, kind, p);
  return { ...spec, holds };
}

/** Every part, by id, with where it holds. */
export const PARTS = Object.fromEntries(Object.entries(SPECS).map(([id, spec]) => [id, defOf(spec)])) as { readonly [K in PartId]: Specs[K] & PartDef };

export const PART_IDS = Object.keys(PARTS) as PartId[];

/** Whether a part asks for something before it stands. */
export const isPending = (id: PartId): id is PendingPart => PARTS[id].ask !== null;
/** Whether a part is a form of the price. */
export const isFormPart = (id: PartId): id is FormPart => PARTS[id].form !== undefined;

/**
 * The parts a price says, in the registry's order (its price, its end, its bounds, its links, its notes): the parts it has, its notes in
 * the order they were added, its end where the line gives one (`until`), and a sale priced apart where the line has one (`sale`).
 */
export function partsSaid(p: Price, line: { until?: MonthKey; sale?: boolean }): PartId[] {
  const out: PartId[] = [];
  for (const id of PART_IDS) {
    const def = PARTS[id];
    if (id === "until" || id === "sale") {
      if (id === "until" ? line.until : line.sale) out.push(id);
    } else if (def.field === "notes") {
      // the notes are one list: said once, where the first note stands, in the list's order
      if (!out.some((x) => PARTS[x].field === "notes") && onAction(p)) out.push(...(p.notes ?? []));
    } else if (def.used(p)) out.push(id);
  }
  return out;
}

/** Whether `at` gives what a part asks for: a percent's or a sum's figure, a fee. */
function gives(at: PartAt, ask: Ask): boolean {
  if (ask === "pct" || ask === "sum") return at.value !== undefined;
  if (ask === "fee") return !!at.against;
  return true;
}

/**
 * A price of a fee of `kind` with a part of the price added (`on`) or taken away: a part the price cannot hold (`holds`) is not put on, and
 * a part of the fee's prices (a later price, a sale) is no single price's.
 */
export function putPart(kind: FeeKindId, p: Price, part: PartId, on: boolean, at: PartAt = {}): Price {
  const a = PARTS[part].apply;
  if (a.on === "fee" || (on && !PARTS[part].holds(kind, p))) return p;
  return a.edit(p, on, at, kind);
}

/**
 * A fee with a part added (`on`) or taken away, as the toolbox and the open case's bin do (`PARTS[part].apply`), on the price `at` names. A
 * part that asks for what `at` does not give, or a price that cannot hold it, leaves the fee as it is.
 */
export function setPart<F extends Fee>(fee: F, part: PartId, on: boolean, at: PartAt = {}): F {
  const def = PARTS[part];
  if (on && !gives(at, def.ask)) return fee;
  if (def.apply.on === "fee") return def.apply.edit(fee, on, at);
  return editPrice(fee, at.side ?? "buy", at.k ?? 0, (p) => putPart(fee.kind, p, part, on, at), at.caseId);
}

/**
 * A price in another form: the rate or the sum typed so far carries over where the new form's figure is of the same kind (a share to a
 * share, a sum per period or per action to the other), as the person's own figure, since the same number in another form is a price the
 * source does not give. Every part that can stand in both forms carries over with its source, as the list printed it (a list's 2%
 * maximum stays the list's): between a share of an action and a sum per unit, which price the action the same way, the bounds and the flat
 * price too; between any two forms on an action, the percent maximum, a discount, a third party's fee and notes, and the currency that
 * priced something (`pricedCurrency`); an offset and a refund between any two forms that charge. The rest starts empty.
 */
export function withForm(p: Price, form: FormId): Price {
  if (p.form === form) return p;
  const next = blankPrice(form);
  if (!charged(p) || !charged(next)) return next;
  const main = mainFigure(p);
  const key = byRate(next) ? "rate" : "amount";
  const figure = main && sameFigureKind(p.form, form) ? { [key]: main.blank ? main : typed(main.v) } : {};
  const from: Partial<Record<PartKey, unknown>> = p;
  const kept: Partial<Record<PartKey, unknown>> = {};
  for (const id of PART_IDS) {
    const { field } = PARTS[id] as PartDef;
    const carriesIn = (PARTS[id] as PartDef).carriesIn ?? (field && KEY_FORMS[field]);
    if (field && carriesIn && carriesIn(p.form) && carriesIn(form) && from[field] !== undefined) kept[field] = from[field];
  }
  const currency = onAction(next) ? pricedCurrency(p) : undefined;
  return { ...next, ...figure, ...kept, ...(currency ? { currency } : {}) } as Price;
}

/**
 * A price as a fee of `kind` may hold it (its capacity): each field its form's capacity does not list is dropped (a percent maximum carried
 * into a form that has none, a currency into a form whose sums the fee keeps in shekels).
 */
export function fitted(kind: FeeKindId, p: Price): Price {
  return PART_FIELDS.reduce((out, field) => (keeps(kind, p.form, field) ? out : without(out, field)), p);
}

/** A price without one of its keys. */
function without<P extends Price>(p: P, key: PartFieldId): P {
  if (!(key in p)) return p;
  const out: Partial<Record<string, unknown>> = { ...p };
  delete out[key];
  return out as P;
}

/** The parts the open case's first price leaves behind in a change of form that name themselves (`lost`), in the registry's order. */
export function lostParts(before: Price, after: Price | null, x: Priced): LostPart[] {
  return PART_IDS.filter((id): id is LostPart => !!PARTS[id].lost && PARTS[id].used(before, x) && !(after && PARTS[id].used(after, x)));
}
