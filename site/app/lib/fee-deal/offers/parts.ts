// The parts a price may have (method §10.6, F-110, F-116, F-117 and §10.6's stated parts), one definition each: its look, the form it sets
// or the field it is kept in, the forms between which a change of form carries it, its figures, what it asks for before it stands, whether
// a case has it, and the edit that adds or takes it away. The toolbox, the open case, the undo's words and a change of form read this
// registry; adding a part is adding an entry here, its words (builder.ts) and its copy. Pure; no Hebrew.
import { blankPrice, mainFigure, typed, type Fee, type MonthKey, type Note, type Price, type Priced, type Side } from "../model";
import { editPrice, holdOn, setLimited, setSaleApart, withDiscount, withFigure, withFlat, withNote, withOffset, withRefund, withThird } from "../edit";
import { type FeeKindId, type FormId } from "../shapes";
import { keeps, PART_FIELDS, pricesSaleApart, takes, type PartFieldId } from "./capacity";
import { boundsAction, byRate, charged, formBounded, formBoundsAction, formCharged, formOnAction, onAction, pricedCurrency, sameFigureKind } from "./capabilities";
import { FIGURES, type Figure } from "./figures";

/**
 * Every part a price may have, by id (the toolbox's cards and the open case's lines): its main figure as a share of each action (`share`),
 * a sum for each unit (`perUnit`), a sum on each action (`perAction`), a share of what is held (`held`), a sum per period (`sum`), free
 * (`free`), a discount, a third party's fee, a later price (`until`); a minimum, a maximum, a percent maximum (`cap`), a flat price for a
 * small action (`flat`), a held share's maximum on each security (`maxPerSecurity`); an offset, a refund; notes on an order (`unfilled`,
 * `unfilledClerk`, `unfilledClerkAbroad`, `capRead`, `partial`), sums in the action's currency (`inTrade`) and a sale priced apart (`sale`).
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

/** What a part asks for before it can stand, where it asks: a percent, a sum, a month (a later price's) or a fee (an offset's). */
export type Ask = "pct" | "sum" | "month" | "fee" | null;

/**
 * Where a part goes, and what it needs: the case (`caseId`; a fee with cases is edited in its first where none is named), the side and the
 * price (`side`, `k`: the purchase's first where none is said), a bound's or a percent maximum's figure (`value`: a bound is never blank),
 * a later price's month (`month`), and the fee an offset is against (`against`).
 */
export interface PartAt {
  caseId?: string;
  side?: Side;
  k?: number;
  value?: number;
  month?: MonthKey;
  against?: FeeKindId;
}

/** The key of a price a part is kept in: a capacity field's (capacity.ts), or a part's own; a note's is the price's list of notes, which every note shares. */
type PartKey = Exclude<PartFieldId, "currency"> | "discount" | "third" | "notes" | "offset" | "refund";

/** A part's edit: of the one price it is on (with the fee's kind, which a form's fields follow), or of the fee's prices (a later price, a sale). */
type PartEdit = { on: "price"; edit: (p: Price, on: boolean, at: PartAt, kind: FeeKindId) => Price } | { on: "fee"; edit: <F extends Fee>(fee: F, on: boolean, at: PartAt) => F };

export interface PartDef {
  id: PartId;
  kind: PartKind;
  /** The form it puts the price in, for a form of the price. */
  form?: FormId;
  /** The key of the price it is kept in, for a part a price holds beside its main figure. */
  field?: PartKey;
  /** The forms whose price has a place for it, for a part kept in a key. */
  standsIn?: (form: FormId) => boolean;
  /**
   * The forms between which a change of form carries it, where narrower than where it stands: a minimum and a maximum carry between a share
   * of an action and a sum per unit, which bound the action the same way, and not to or from a share of what is held, whose bounds are per
   * charge.
   */
  carriesIn?: (form: FormId) => boolean;
  /** The capacity field a fee's form must list for the part to stand on its price (capacity.ts); none where every price of its forms can. */
  capField?: PartFieldId;
  /** The figures it holds, in the order its boxes stand. */
  figures: readonly Figure[];
  /**
   * Whether a fee of `kind` can hold it on the price `p` as it stands: a form, where the fee can take it; a part kept in a key, where the
   * price's form has a place for it and the fee's capacity lists its field there. A part the price cannot hold is not offered and is not
   * put on; a form of the price that can is.
   */
  holds: (kind: FeeKindId, p: Price) => boolean;
  /** What it asks for before it stands (the toolbox hands it to the open case to ask); null where it stands at once. */
  ask: Ask;
  /** Whether a price has it; a part of the fee's prices (a later price, a sale) asks the case's prices `x`. */
  used: (p: Price, x?: Priced) => boolean;
  /** The edit that adds it (`on`) or takes it away. */
  apply: PartEdit;
  /** Whether a change of form that leaves it behind says so by name (undo.ts). */
  lost?: true;
}

const onPrice = (edit: (p: Price, on: boolean, at: PartAt, kind: FeeKindId) => Price): PartEdit => ({ on: "price", edit });

/** A part kept in a key of the price: where it holds follows from where it stands and its capacity field. */
const keyed = (def: Omit<PartDef, "holds"> & Required<Pick<PartDef, "field" | "standsIn">>): PartDef => ({
  ...def,
  holds: (kind, p) => def.standsIn(p.form) && (!def.capField || keeps(kind, p.form, def.capField)),
});

/** A form of the price: on, the price in that form with what carries over (`withForm`), as the fee may hold it (`fitted`); off, free. */
const formPart = (id: PartId, form: FormId, figures: readonly Figure[]): PartDef => ({
  id,
  kind: "price",
  form,
  figures,
  holds: (kind) => takes(kind, form),
  ask: null,
  used: (p) => p.form === form,
  apply: onPrice((p, on, _at, kind) => (on ? fitted(kind, withForm(p, form)) : p.form === form ? { form: "free" } : p)),
});

/** A bound or a percent maximum, where the fee's form lists it: on, with the figure the open case asked for; off, taken away. */
const boundPart = (id: "min" | "max" | "cap", ask: Ask, standsIn: (form: FormId) => boolean, carriesIn?: (form: FormId) => boolean): PartDef =>
  keyed({
    id,
    kind: "bound",
    field: id,
    standsIn,
    ...(carriesIn ? { carriesIn } : {}),
    capField: id,
    figures: [id],
    ask,
    used: (p) => FIGURES[id].get(p) !== undefined,
    apply: onPrice((p, on, at) => withFigure(p, id, on ? at.value! : null)),
    lost: true,
  });

/** A note on an order (§10.6's stated parts), kept in the price's list of notes: on any price on an action, a corporate event's sum among them. */
const notePart = (id: Note): PartDef =>
  keyed({
    id,
    kind: "note",
    field: "notes",
    standsIn: formOnAction,
    figures: [],
    ask: null,
    used: (p) => onAction(p) && !!p.notes?.includes(id),
    apply: onPrice((p, on) => withNote(p, id, on)),
  });

/** Every part, in the order a price's line says them: its price, its time limit, its bounds, its links, its notes. */
export const PARTS: Readonly<Record<PartId, PartDef>> = {
  share: formPart("share", "action", ["rate"]),
  perUnit: formPart("perUnit", "perUnit", ["amount"]),
  perAction: formPart("perAction", "perAction", ["amount"]),
  held: formPart("held", "held", ["rate"]),
  sum: formPart("sum", "sum", ["amount"]),
  free: formPart("free", "free", []),
  discount: keyed({ id: "discount", kind: "price", field: "discount", standsIn: formOnAction, figures: ["discount"], ask: null, used: (p) => onAction(p) && !!p.discount, apply: onPrice((p, on) => withDiscount(p, on)) }),
  third: keyed({ id: "third", kind: "price", field: "third", standsIn: formOnAction, figures: ["third", "thirdMin", "thirdMax"], ask: null, used: (p) => onAction(p) && !!p.third, apply: onPrice((p, on) => withThird(p, on)) }),
  until: {
    id: "until",
    kind: "price",
    figures: [],
    holds: () => true,
    ask: "month",
    used: (_p, x) => !!x && x.stages.length > 1,
    // on, the price ends at the month and a later one follows it; off, the prices after it go
    apply: { on: "fee", edit: (fee, on, at) => (on ? setLimited(fee, at.side ?? "buy", at.k ?? 0, at.month!, at.caseId) : holdOn(fee, at.side ?? "buy", at.k ?? 0, at.caseId)) },
  },
  min: boundPart("min", "sum", formBounded, formBoundsAction),
  max: boundPart("max", "sum", formBounded, formBoundsAction),
  cap: boundPart("cap", "pct", formOnAction),
  flat: keyed({ id: "flat", kind: "bound", field: "flat", standsIn: formBoundsAction, capField: "flat", figures: ["flat", "upTo"], ask: null, used: (p) => boundsAction(p) && !!p.flat, apply: onPrice((p, on) => withFlat(p, on)), lost: true }),
  // a maximum on each security of a held share, stated and never computed (§10.6's stated parts)
  maxPerSecurity: keyed({
    id: "maxPerSecurity",
    kind: "bound",
    field: "perSecurity",
    standsIn: (form) => form === "held",
    capField: "perSecurity",
    figures: ["perSecurity"],
    ask: "sum",
    used: (p) => p.form === "held" && p.perSecurity !== undefined,
    apply: onPrice((p, on, at) => withFigure(p, "perSecurity", on ? at.value! : null)),
    lost: true,
  }),
  offset: keyed({ id: "offset", kind: "link", field: "offset", standsIn: formCharged, figures: [], ask: "fee", used: (p) => charged(p) && !!p.offset, apply: onPrice((p, on, at) => withOffset(p, on ? at.against! : null)) }),
  refund: keyed({ id: "refund", kind: "link", field: "refund", standsIn: formCharged, figures: ["refund"], ask: null, used: (p) => charged(p) && !!p.refund, apply: onPrice((p, on) => withRefund(p, on)) }),
  unfilled: notePart("unfilled"),
  unfilledClerk: notePart("unfilledClerk"),
  unfilledClerkAbroad: notePart("unfilledClerkAbroad"),
  capRead: notePart("capRead"),
  partial: notePart("partial"),
  // sums in the currency the trade is made in ("מינימום 30 במטבע העסקה"), where the fee's form lists it: a reading takes it from what is bought
  inTrade: keyed({
    id: "inTrade",
    kind: "note",
    field: "inTrade",
    standsIn: formOnAction,
    capField: "inTrade",
    figures: [],
    ask: null,
    used: (p) => onAction(p) && !!p.inTrade,
    apply: onPrice((p, on) => (!onAction(p) || on === !!p.inTrade ? p : on ? { ...p, inTrade: true } : without(p, "inTrade"))),
  }),
  sale: { id: "sale", kind: "note", figures: [], holds: pricesSaleApart, ask: null, used: (_p, x) => !!x?.sale, apply: { on: "fee", edit: (fee, on, at) => setSaleApart(fee, on, at.caseId) } },
};

export const PART_IDS = Object.keys(PARTS) as PartId[];

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

/** Whether `at` gives what a part asks for: a percent's or a sum's figure, a month, a fee. */
function gives(at: PartAt, ask: Ask): boolean {
  if (ask === "pct" || ask === "sum") return at.value !== undefined;
  if (ask === "month") return !!at.month;
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
 * A fee with a part added (`on`) or taken away, as the toolbox and the open case's ✕ do (`PARTS[part].apply`), on the price `at` names. A
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
    const { field, standsIn, carriesIn = standsIn } = PARTS[id];
    if (field && carriesIn?.(p.form) && carriesIn(form) && from[field] !== undefined) kept[field] = from[field];
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
export function lostParts(before: Price, after: Price | null, x: Priced): PartId[] {
  return PART_IDS.filter((id) => PARTS[id].lost && PARTS[id].used(before, x) && !(after && PARTS[id].used(after, x)));
}
