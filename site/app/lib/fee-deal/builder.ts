// The builder column and one fee's panel (method §10.6): a row per fee with its prices in short, the facts the row says beside them,
// and its standing against the cap now and where it next changes; the fees to suggest; and the panel's fields by the fee's shape and the
// cap's line (the panel's prices against the cap are the reading's law row, reading.ts).
import type { ChangeKind } from "@finance-tool/engine";
import { capLine, type CapLine } from "./kinds";
import { monthKey, type Fee, type MonthKey, type Price, type Stage } from "./model";
import { priceView, refOf, sameStanding, standingView, type DealRead, type FeeRef, type PriceView, type StandingView } from "./parts";
import { FEE_SHAPES, holdsFunds, ONE_SIDE, suggestions, type FeeKindId, type FeeShape, type FieldId, type Held } from "./shapes";
import { insideFund } from "./values";

/** A price of a fee as a row shows it: the price, the month it ends where it ends, and its standing against the cap. */
export interface StageView {
  price: PriceView;
  until?: MonthKey;
  standing: StandingView;
}

/** One fee's next change after the reading's month, where it has one (F-110). */
export interface NextChange {
  at: MonthKey;
  change: ChangeKind;
}

/** A fee's row in the builder: its prices in short and the facts beside them. */
export interface BuilderRow extends FeeRef {
  stages: StageView[];
  /** Whether a sale is priced as a purchase is: null where the fee is not one a sale may price apart. */
  saleSame: boolean | null;
  /** The fee's next change, and whether it is a start from free. */
  next?: NextChange;
  /** Whether the price now has a minimum and a maximum (on any side). */
  bounds: { min: boolean; max: boolean };
  /** Whether the fee is charged inside a fund. */
  insideFund: boolean;
  /** The standing now, and the first later price whose standing differs (with the month it starts). */
  standingNow: StandingView;
  standingLater?: { at: MonthKey; standing: StandingView };
}

export interface Builder {
  rows: BuilderRow[];
  /** The fees to offer: the kind's that fit what is held, then the rarer ones and the person's own. */
  suggestions: { usual: FeeKindId[]; rarer: FeeKindId[] };
  /** Whether the deal says what it holds (a kind that holds funds), and what. */
  holdsFunds: boolean;
  held?: Held;
}

/** A fee's prices as stage views. */
function stageViews(r: DealRead, i: number, stages: readonly Stage[]): StageView[] {
  return stages.map((s) => {
    const price = priceView(r.fees, i, s.price, r.today);
    return { price, ...(s.until ? { until: s.until } : {}), standing: standingView(r, r.fees, i, s.price, price) };
  });
}

/** The stages read from the reading's month on: those whose end is after it, and the last. */
const readStages = (r: DealRead, views: StageView[]): StageView[] => views.filter((s) => s.until === undefined || s.until > monthKey(r.reading.from));

function rowOf(r: DealRead, i: number): BuilderRow {
  const fee = r.fees[i]!;
  const stages = readStages(r, stageViews(r, i, fee.stages));
  const sale = fee.sale ? readStages(r, stageViews(r, i, fee.sale)) : undefined;
  const c = r.reading.fees[i]!.changes[0];
  const now = stages[0]!;
  // a later price starts where the one before it ends
  const k = stages.findIndex((s, j) => j > 0 && !sameStanding(s.standing, now.standing));
  const later = k > 0 ? { at: stages[k - 1]!.until!, standing: stages[k]!.standing } : undefined;
  const shape = FEE_SHAPES[fee.kind];
  const has = (k: "min" | "max") => !!now.price.figures[k] || !!sale?.[0]?.price.figures[k];
  return {
    ...refOf(fee),
    stages,
    saleSame: shape.saleApart && !ONE_SIDE[fee.kind] ? !fee.sale : null,
    ...(c ? { next: { at: monthKey(c.at), change: c.kind } } : {}),
    bounds: { min: has("min"), max: has("max") },
    insideFund: insideFund(fee),
    standingNow: now.standing,
    ...(later ? { standingLater: later } : {}),
  };
}

/** The builder column of a deal, from the deal read once (`readDealFor`). */
export function builder(r: DealRead): Builder {
  const deal = r.deal;
  const funds = holdsFunds(deal.kind);
  return {
    rows: r.fees.map((_, i) => rowOf(r, i)),
    suggestions: deal.kind && r.kind ? suggestions(deal.kind, r.kind.bases, deal.fees.map((f) => f.kind), deal.held) : { usual: [], rarer: ["own"] },
    holdsFunds: funds,
    ...(funds && deal.held ? { held: deal.held } : {}),
  };
}

// ---------------------------------------------------------------- one fee's panel

/** A price in the panel: its view, the month it ends, and the fields its form has for this fee. */
export interface PanelStage {
  price: PriceView;
  until?: MonthKey;
  fields: readonly FieldId[];
}

export interface Panel extends FeeRef {
  shape: FeeShape;
  /** The side of a trade it is charged on alone, where it is. */
  oneSide?: "buy" | "sell";
  /** Every price as typed, the passed ones too (the panel edits them all). */
  stages: PanelStage[];
  /** A sale's own prices: `allowed` where the fee may price a sale apart, `stages` where it does. */
  sale: { allowed: boolean; stages?: PanelStage[] };
  /** Whether the fee has more than one price (its price is for a time). */
  limited: boolean;
  cap: CapLine;
}

const fieldsOf = (fee: Fee, p: Price): readonly FieldId[] => (p.form === "free" ? [] : (FEE_SHAPES[fee.kind].fields[p.form] ?? []));

/** One fee's panel, from the deal read once (`readDealFor`); null where the deal has no fee with that id. */
export function panel(r: DealRead, feeId: string): Panel | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  // a fee whose prices are not in order is not among the read fees: its prices are shown on their own, so its fields still show while it is edited
  const at = r.fees.indexOf(fee);
  const fees = at >= 0 ? r.fees : [fee];
  const i = Math.max(at, 0);
  const stagesOf = (stages: readonly Stage[]): PanelStage[] => stages.map((s) => ({ price: priceView(fees, i, s.price, r.today), ...(s.until ? { until: s.until } : {}), fields: fieldsOf(fee, s.price) }));
  const shape = FEE_SHAPES[fee.kind];
  const side = ONE_SIDE[fee.kind];
  return {
    ...refOf(fee),
    shape,
    ...(side ? { oneSide: side } : {}),
    stages: stagesOf(fee.stages),
    sale: { allowed: shape.saleApart && !side, ...(fee.sale ? { stages: stagesOf(fee.sale) } : {}) },
    limited: fee.stages.length > 1,
    cap: capLine(r.kind, fee.kind),
  };
}
