// The builder column (method §10.6): a block per fee, either a slim price or the band of its cases (F-114) with each case's value per thing
// and its parts in short; the fees to suggest; and each fee's facts beside its prices and its standing against the cap now and where it
// next changes (the prices against the cap are the reading's law row, reading.ts). A component only lays them out.
import { feeDeal as copy } from "../../copy";
import type { ChangeKind } from "@finance-tool/engine";
import { feeOf, inCurrency, picked, tradeCurrency } from "./cases";
import { feeInOrder, feePriced, hasCases, monthKey, pricedOf, type BoundCurrency, type Case, type CasesFee, type Fee, type MonthKey, type Priced, type Stage } from "./model";
import { feesOffered, type DataBar } from "./offers/offer";
import type { BanSaid } from "./kinds";
import { priceView, refOf, standingView, type DealRead, type FeeRef, type PriceView, type StandingView } from "./deal-read";
import { type FeeKindId } from "./shapes";
import { BY_MAX, type ByKind } from "./offers/conditions";
import { insideFund } from "./values";
import type { SiteValue } from "../value";
import { firstCase, slimParts, thingName, whenWords, type SlimPart, type WhenWords } from "./case-words";

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

/**
 * A fee's row in the builder: its prices in short and the facts beside them; for a fee with cases, those of its first case, the one the
 * edits edit where they name no case, so a card that shows one price shows and edits that one; and the fee as a block, every case in it.
 */
export interface BuilderRow extends FeeRef {
  stages: StageView[];
  /**
   * Whether every price the row shows is given (`feePriced`) and the fee is read: a fee with a price not given yet, or one the picks give no
   * case, shows its boxes and no standing or change.
   */
  priced: boolean;
  /** Whether the picks give the fee no case (F-114): it is not read, and its card says so rather than that a price is missing. */
  unmatched: boolean;
  /** Whether its case's sums are in the action's currency, which the deal does not know for the picks: its card says so. */
  noCurrency: boolean;
  /** How the ban on the fee here is said (`DealRead.banned`): it is read as nothing charged, and its card says it is banned. */
  banned?: BanSaid;
  /** A sale's own prices from the reading's month on, where a sale is priced apart. */
  sale?: StageView[];
  /** The fee's next change, and whether it is a start from free. */
  next?: NextChange;
  /** Whether the price now has a minimum and a maximum (on any side). */
  bounds: { min: boolean; max: boolean };
  /** Whether the fee is charged inside a fund. */
  insideFund: boolean;
  /** The standing now; a later price's is said with that price. */
  standingNow: StandingView;
  /** The fee as a block: a slim price, or the band of its cases. */
  block: FeeBlock;
}


/** A case as a band row shows it: its id, its value per thing, whether its track is the person's, whether it is open, and its parts. */
export interface CaseRow {
  case: string;
  when: WhenWords[];
  mine: boolean;
  open: boolean;
  /** Whether its prices are given and in order: a case still asking for a figure is read nowhere until it is. */
  priced: boolean;
  parts: SlimPart[];
  /**
   * Its price now against the cap (F-113), as a slim fee's row says it: the price charged, after its discount and without a third party's
   * fee, whichever case the reading reads.
   */
  standing: StandingView;
}

/** A thing a fee changes by, as the band's head names it (a pill): its place among the fee's things, its kind, and its words. */
export interface ThingPill {
  thing: number;
  kind: ByKind;
  words: string;
  /** Whether the reading picks a value of it, or reads it across sizes (F-115). */
  picked: boolean;
}

/**
 * A fee as a block: `slim`, a fee whose price changes by nothing, its parts in one line; `band`, the head's things and one row per case,
 * the cases on tracks that are not the person's folded into one line (`folded`: how many tracks, and their rows), where the person has
 * marked a track as theirs.
 */
export type FeeBlock =
  | { kind: "slim"; parts: SlimPart[]; open: boolean }
  | { kind: "band"; things: ThingPill[]; rows: CaseRow[]; folded?: { tracks: number; words: string; rows: CaseRow[] }; canAdd: boolean };

export interface Builder {
  rows: BuilderRow[];
  /** The fees to offer: the kind's that fit, then the rarer ones and the person's own. */
  suggestions: { usual: FeeKindId[]; rarer: FeeKindId[] };
}

/** A fee's prices as stage views, the fee being `fees[i]`. */
function stageViews(r: DealRead, fees: readonly Pick<Fee, "kind">[], i: number, stages: readonly Stage[]): StageView[] {
  return stages.map((s) => {
    const price = priceView(fees, i, s.price, r.today);
    return { price, ...(s.until ? { until: s.until } : {}), standing: standingView(r, fees, i, s.price, price) };
  });
}

/** The stages read from the reading's month on: those whose end is after it, and the last. */
const readStages = (r: DealRead, views: StageView[]): StageView[] => views.filter((s) => s.until === undefined || s.until > monthKey(r.reading.from));

/** A case's prices with their sums in the trade's currency in that currency (`inCurrency`); as they are where the deal does not know it. */
const inTradeOf = <P extends Priced>(priced: P, trade: BoundCurrency | null): P => (trade ? { ...priced, stages: priced.stages.map((s) => ({ ...s, price: inCurrency(s.price, trade) })) } : priced);

/** A part's figure with no currency sign, where it is a sum (its unit a shekel one, since a price in the trade's currency names none). */
const signless = (v: SiteValue): SiteValue => (v.unit.startsWith("nis") ? { ...v, unit: "count" } : v);

/** Where the reading reads a fee's case (or its own prices, `caseId` none): its place among the read fees, -1 where it does not. */
const readAt = (r: DealRead, fee: Fee, caseId: string | undefined): number => r.fees.findIndex((x) => feeOf(x) === fee.id && x.read?.case === caseId);

/**
 * The currency a case's sums in the trade's currency (`inTrade`, BRK-48) are in: what is bought's, where the reading reads the case for
 * the picks; none for a case it does not read, whose trade is not the one picked, nor where the deal does not know it.
 */
const tradeOf = (r: DealRead, fee: Fee, caseId: string | undefined): BoundCurrency | null => (readAt(r, fee, caseId) >= 0 ? tradeCurrency(r.deal.fees, r.picks) : null);

/**
 * A price's parts as the builder line says them: sums in the trade's currency in it where it is known (`tradeOf`), as the reading reads
 * them, else as the list prints them, a number with no currency sign, which the price's own note says is in the trade's currency.
 */
function lineParts(r: DealRead, fee: Fee, priced: Priced, caseId: string | undefined): SlimPart[] {
  const trade = tradeOf(r, fee, caseId);
  const parts = slimParts(fee, inTradeOf(priced, trade), r);
  const p = priced.stages[0]!.price;
  if (trade || !("inTrade" in p) || !p.inTrade) return parts;
  return parts.map((x) => ({ ...x, words: { ...x.words, ...(x.words.figure ? { figure: signless(x.words.figure) } : {}), ...(x.words.second ? { second: signless(x.words.second) } : {}) } }));
}

/** A fee's things as the band's pills. */
const pillsOf = (fee: CasesFee): ThingPill[] => fee.by.map((b, t) => ({ thing: t, kind: b.kind, words: thingName(fee.kind, b), picked: picked(fee, b) }));

/** A case as its band row (`open`: the case open in place). */
function caseRow(r: DealRead, fee: CasesFee, c: Case, open: string | null): CaseRow {
  const from = monthKey(r.reading.from);
  return { case: c.id, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)), mine: !!c.mine, open: c.id === open, priced: feeInOrder(c) && feePriced(c, from), parts: lineParts(r, fee, c, c.id), standing: standingNow(r, fee, c, c.id) };
}

/** The count of a number of tracks in words. */
const tracksWords = (n: number): string => (n === 1 ? copy.cases.folded.one : n === 2 ? copy.cases.folded.two : copy.cases.folded.many.replace("{n}", String(n)));

/**
 * A fee's block: slim, or its band. Where the person marked a track as theirs, the cases of the other tracks fold into one line, with how
 * many tracks they are; a case on any track stays in the band, and so does the open case.
 */
function blockOf(r: DealRead, fee: Fee, open: { fee: string; case: string | null } | null): FeeBlock {
  const isOpen = open?.fee === fee.id;
  if (!hasCases(fee)) return { kind: "slim", parts: lineParts(r, fee, fee, undefined), open: isOpen };
  const openCase = isOpen ? (open!.case ?? fee.cases[0]!.id) : null;
  const t = fee.by.findIndex((b) => b.kind === "track");
  const marked = t >= 0 && fee.cases.some((c) => c.mine);
  const foldedCase = (c: Case) => marked && !c.mine && c.when[t] !== "any" && c.id !== openCase;
  const rows = fee.cases.filter((c) => !foldedCase(c)).map((c) => caseRow(r, fee, c, openCase));
  const other = fee.cases.filter(foldedCase);
  const tracks = new Set(other.flatMap((c) => c.when[t] as string[])).size;
  return {
    kind: "band",
    things: pillsOf(fee),
    rows,
    ...(other.length ? { folded: { tracks, words: tracksWords(tracks), rows: other.map((c) => caseRow(r, fee, c, openCase)) } } : {}),
    canAdd: fee.by.length < BY_MAX,
  };
}


/**
 * A fee's case (or its own prices, `caseId` none) from the reading where the reading reads that case, so its share opens the reading's own
 * calculation, else on its own: its place among the read fees (`i`, -1 where not read), the fees its views are of and its place among them,
 * its prices from the reading's start, and its price now (the last where every price ended before the start).
 */
function caseRead(r: DealRead, fee: Fee, priced: Priced, caseId: string | undefined) {
  const i = readAt(r, fee, caseId);
  const fees = i >= 0 ? r.fees : [fee];
  const at = Math.max(i, 0);
  // sums in the trade's currency are shown in it where the reading reads the case for the picks (BRK-48), as the reading reads them
  const views = stageViews(r, fees, at, inTradeOf(priced, tradeOf(r, fee, caseId)).stages);
  const stages = readStages(r, views);
  return { i, fees, at, stages, now: stages[0] ?? views.at(-1)! };
}

/** The price now of a fee's case (or its own, `caseId` none) against the cap (`caseRead`). */
const standingNow = (r: DealRead, fee: Fee, priced: Priced, caseId: string | undefined): StandingView => caseRead(r, fee, priced, caseId).now.standing;

/**
 * A fee's row: the prices of its first case (or its own), from the reading where the reading reads that case, or on their own where it does
 * not (the picks give the fee another case, or none, or a price is not given yet).
 */
function rowOf(r: DealRead, fee: Fee, open: { fee: string; case: string | null } | null): BuilderRow {
  const caseId = firstCase(fee);
  const priced = pricedOf(fee, caseId);
  const { i, fees, at, stages, now } = caseRead(r, fee, priced, caseId);
  // a fee the picks give no case, or the law bans here, is not read, whatever its first case states: its card says so
  const { fee: _f, ...ban } = r.banned.find((b) => b.fee === fee.id) ?? { fee: "" };
  const banned: BanSaid | undefined = "rules" in ban ? ban : undefined;
  const given = !banned && (i >= 0 || (hasCases(fee) && !r.unmatched.includes(fee.id) && feeInOrder(priced) && feePriced(priced, monthKey(r.reading.from))));
  const sale = priced.sale ? readStages(r, stageViews(r, fees, at, priced.sale)) : undefined;
  const c = i < 0 ? undefined : r.reading.fees[i]!.changes[0];
  const has = (k: "min" | "max") => !!now.price.figures[k] || !!sale?.[0]?.price.figures[k];
  return {
    ...refOf(i >= 0 ? r.fees[i]! : { fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) }, r.today),
    fee: fee.id,
    stages: stages.length ? stages : [now],
    priced: given,
    unmatched: r.unmatched.includes(fee.id),
    noCurrency: r.noCurrency.includes(fee.id),
    ...(banned ? { banned } : {}),
    ...(sale ? { sale } : {}),
    ...(c ? { next: { at: monthKey(c.at), change: c.kind } } : {}),
    bounds: { min: has("min"), max: has("max") },
    insideFund: insideFund(fee),
    standingNow: now.standing,
    block: blockOf(r, fee, open),
  };
}

/**
 * The builder column of a deal, from the deal read once (`readDealFor`): a row per fee, the read ones and those not read for a price not
 * given or for no case for the picks, each with its block; a fee whose prices are out of order has none (the glance names it, `unread`).
 * `bar`: the fees the data says the deal's product may not charge, never offered, nor is a fee its product is not offered (`feesOffered`). `open`:
 * the fee open in place, and its case (the first where none is named).
 */
export function builder(r: DealRead, bar: DataBar | null = null, open: { fee: string; case: string | null } | null = null): Builder {
  const deal = r.deal;
  return {
    rows: deal.fees.filter((fee) => !r.unread.includes(fee.id)).map((fee) => rowOf(r, fee, open)),
    suggestions: feesOffered(r.kind, deal.fees.map((f) => f.kind), bar),
  };
}
