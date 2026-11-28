// The index page's pair (spec 8dd1f013:research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account and a fund, and what the
// page says of them. Here: the pair's verdict and ties (the pair set beside the chosen one, which the receipt and the fees panel read),
// how a pick moves the other half, and the pieces the lists (lists.tsx), the receipt's parts (receipt.tsx) and the custom index's lists
// (no-fund.tsx) share: a house's groups (the custom index's lists only), standing-order and phone-only prices, the notes on prices abroad,
// and a fund's gap from its index.
import { mayaFundHref } from "../../lib/sources";
import { type ReactNode } from "react";
import { isTie, type GapList } from "@finance-tool/engine";
import { currencyWord, groupPrices, invest as c } from "../../copy";
import { isShekel } from "@finance-tool/schema";
import { isCustomFund } from "../../lib/custom-entries";
import { doubtAt, doubtOf, entryRules, tieShareOf, paybackMayLower, gapOf, gapUnstated, indexSeenBy, kindOf, opensOn, pairCostsKept, phoneOnlyValue, type AsideLine as AsideLineRecord, type Availability, type FundWay, type OptionId, type InvestView, type Kind, type Reason, type WayPrice } from "../../lib/invest";
import { brokeragePagePath } from "../../lib/site-paths";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { brokerLabels, fundLabels, label, optionLabels, type Label } from "../../lib/labels";
import { computed, differenceOf, ownBy, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { Num, Ruled, Term, type SheetPart } from "../provenance";
import { ClampedText, gershayim, DocLink, LabelRow, Tag, Tpl, GroupPriceFold, fill } from "../kit";
import { optionClass, reasonText } from "./parts";
import { providerName } from "./sections";
import { DealFromHouseButton } from "./deal-account";
import { StateTag } from "../provenance";
import { sourceHref, withoutCodes, type CitedPlace } from "../../lib/sources";
import { priced } from "../../lib/stretch";

export interface Pick {
  house: string;
  fund: string;
}

/** A figure rounded to whole shekels, as the receipt's lines show it: the input of a difference taken between shown figures (F-91). */
export const whole = (v: SiteValue): SiteValue => ({ ...v, value: Math.round(v.value as number) });

/** A pair's "by phone only": the house's words for the exchange its price rests on, as the value its tag opens; null for any other pair. */
export function phoneOf(view: InvestView, bundle: IndicesBundle, p: { house: string; fund: string }): SiteValue | null {
  const f = allFunds(view).find((x) => x.rec.id === p.fund);
  const at = f?.byHouse[p.house];
  if (!f || !priced(at)) return null;
  return phoneOnlyValue(bundle.snapshots.find((s) => s.id === p.house), f.option, at.venue, providerName(view, p.house)?.short ?? p.house);
}

/** Every fund on the index, of every option that exists for it. */
export const allFunds = (view: InvestView): FundWay[] => view.options.filter((o) => o.exists).flatMap((o) => o.funds);

/** The default pick: the cheapest complete way. */
export const pickOfHeadline = (view: InvestView): Pick | null => (view.headline ? { house: view.headline.providerId, fund: view.headline.fund.rec.id } : null);

/**
 * The cheapest pair to set beside the person's: the headline, unless they picked a currency-hedged fund, which is compared with the best
 * hedged pair: the page opens on unhedged funds only, and "the cheapest" must never leave less than the pick beside it.
 */
export function bestFor(view: InvestView, pick: Pick): Pick | null {
  const rec = allFunds(view).find((f) => f.rec.id === pick.fund)?.rec;
  if (!rec || opensOn(rec)) return pickOfHeadline(view);
  const top = allFunds(view)
    .filter((f) => !opensOn(f.rec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
    .sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : pickOfHeadline(view);
}

/** Every way a house prices on the index. */
const waysOf = (view: InvestView, house: string): { fund: FundWay; at: WayPrice }[] =>
  allFunds(view).flatMap((f) => { const at = f.byHouse[house]; return priced(at) ? [{ fund: f, at }] : []; });

/** A house's way that leaves the most. Its row names it when the picked fund has no price there. */
export function otherWay(view: InvestView, house: string): { fund: FundWay; at: WayPrice } | null {
  return waysOf(view, house).sort((a, b) => b.at.valueN - a.at.valueN)[0] ?? null;
}

/**
 * Why a house gives a fund no price, from the house's record first (the page said Psagot's price list has no line for
 * foreign securities; it has two, and the record says the price in Europe is not final): a doubt the record words, a price list not
 * collected, a kind the house does not sell, and only then the engine's reason.
 */
export function whyNoPrice(bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, fund: FundWay): string {
  return whyOfKind(bundle, houseId, kindAt(fund, houseId));
}

/** A fund's entry at a house as a `KindAt`: a price stands for no reason. */
const kindAt = (fund: FundWay, houseId: string): KindAt => {
  const at = fund.byHouse[houseId];
  return { option: fund.option, at: at && !priced(at) ? at : undefined };
};

/**
 * One kind of fund at a house, as the reasons read it: the kind, and the house's entry for it, a fund's price or reason
 * (`FundWay.byHouse`) or, on an index with no fund, the house's cell for the kind (`BrokerCell`).
 */
export interface KindAt {
  option: OptionId;
  at?: { availability?: Availability | null; reason?: Reason; doubt?: Availability } | undefined;
}

/**
 * `whyNoPrice` for one kind at a house: a doubt about this fund (`FundNotPriced.doubt`) or the record's about the kind, a price list not
 * collected, a kind the house does not sell, the engine's reason.
 */
function whyOfKind(bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, { option, at }: KindAt): string {
  if (at?.doubt) return at.doubt.reason_he ?? c.reasons.noAgreementFound;
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  const doubt = doubtOf(snap, option);
  if (doubt) return doubt;
  if (snap?.missing && snap.missing_reason_he) return snap.missing_reason_he;
  // the record's own sentence where it has one (Interactive Brokers: its FAQ's words on Tel Aviv), the page's general words otherwise
  if (at?.availability) return at.availability.reason_he ?? c.pair.notPossibleWhy(c.stairs.kinds[option] ?? option);
  return at?.reason ? reasonText(at.reason, optionClass[option]) : c.funds.cannot;
}

/** The record's entry behind `whyOfKind`'s words, in the same order: its doubt, nothing for a price list not collected, the kind it does not sell. */
const entryOfWhy = (bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, { option, at }: KindAt) => {
  if (at?.doubt) return at.doubt;
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  if (doubtOf(snap, option)) return doubtAt(snap, option);
  if (snap?.missing && snap.missing_reason_he) return null;
  return at?.availability ?? null;
};

/**
 * Why a house prices no fund on the index, over every kind of fund the index has, for the house's own row: "no data" told a reader
 * nothing where the record says trading in Tel Aviv is for institutional clients only, or prints a price and does not say who may use
 * it. The state the row names follows `whyNoPrice`'s order (a doubt in the record, a price list not collected, every kind not sold
 * there), and `why` is each kind's reason in `whyNoPrice`'s words, the kind named where the kinds' reasons differ. `rules` are the
 * rules the record names for those reasons (the row's label opens their cards instead of the reasons), and `parts` the same reasons one
 * by one, each with the document it rests on, shown for a row where some reason has no rule behind it: the row's one "source" link led to the first kind's document only, so a reader
 * looking for Interactive Brokers' FAQ landed on its fund list.
 */
export function whyNoFundAt(bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, funds: readonly FundWay[]) {
  return whyNoKindAt(bundle, houseId, funds.map((f) => kindAt(f, houseId)));
}

/** The type of what `whyNoFundAt` returns: the state the words name, the reasons as one line, each reason with its document, and the rules. */
export type WhyNone = ReturnType<typeof whyNoKindAt>;

/**
 * `whyNoFundAt` over kinds of fund rather than funds: an index with no fund (a custom index) has only each kind's cell at the house, and its
 * account rows say why in the same words and open the same card (the funds section had a tag and a separate "source" link).
 */
export function whyNoKindAt(bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, ways: readonly KindAt[]) {
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  const kinds = ways.filter((f, i) => ways.findIndex((g) => g.option === f.option) === i);
  // a run its open question's readings stopped (method §13): the reason's sentence carries the question, whose card it opens
  const questionOf = (f: KindAt) => (f.at?.reason?.code === "rule-open" ? f.at.reason.question : undefined);
  const reasons = kinds.map((f) => ({ kind: c.stairs.kinds[f.option] ?? f.option, why: whyOfKind(bundle, houseId, f), at: entryOfWhy(bundle, houseId, f), question: questionOf(f) }));
  const told = reasons.filter((r, i) => reasons.findIndex((x) => x.why === r.why) === i);
  const why = told.length === 1 ? told[0]!.why : told.map((r) => `${r.kind}: ${r.why}`).join(" ");
  const state: "doubt" | "missing" | "notSold" | "other" = kinds.some((f) => f.at?.doubt || doubtOf(snap, f.option)) ? "doubt" : snap?.missing ? "missing" : kinds.length > 0 && kinds.every((f) => !!f.at?.availability) ? "notSold" : "other";
  const parts = told.map((r) => ({ ...(told.length > 1 ? { head: r.kind } : {}), text: r.why, ...(r.at ? { doc: { href: sourceHref(r.at.source), title: withoutCodes(r.at.source.title) } } : {}), ...(r.question ? { question: r.question } : {}) }));
  // a rule's card replaces the reasons, so it opens only where every reason has a rule behind it: a kind with none would lose its reason
  const rules = told.every((r) => r.at?.rule_ids?.length) ? [...new Set(told.flatMap((r) => entryRules(r.at!)))] : [];
  return { state, why: why || c.funds.cannot, parts: parts.length ? parts : [{ text: c.funds.cannot }], rules };
}

/**
 * The words that say why an account sells no such fund (`whyNoFundAt`, or the reasons of several rows), which open why: the rules that say
 * so, as words that state a rule (D116), where every reason has one; else the reasons themselves, each with its document.
 */
export function NoFundWords({ told, name, children }: { told: { parts: readonly SheetPart[]; rules: readonly string[] }; /** What the sheet is about: the title over the reasons, or under the rules' list. */ name: string; children: ReactNode }) {
  return told.rules.length > 0 ? (
    <Ruled id={told.rules} name={name}>
      {children}
    </Ruled>
  ) : (
    <Term id={[]} name={name} parts={told.parts}>
      {children}
    </Term>
  );
}

/** The short line in a fund's last cell when the house gives it no price, naming the house, in `whyNoPrice`'s order. */
export function noPriceLine(bundle: { snapshots: IndicesBundle["snapshots"] }, houseId: string, fund: FundWay, house: string): string {
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  const at = fund.byHouse[houseId];
  if ((at && "doubt" in at && at.doubt) || doubtOf(snap, fund.option)) return c.pair.noPriceAt.doubt(house);
  if (snap?.missing) return c.pair.noPriceAt.missing(house);
  if (at && "availability" in at && at.availability) return c.pair.noPriceAt.notSold(house);
  return c.pair.noPriceAt.other(house);
}

/** The other half when one half changes: keep it when it still prices, else the one that leaves the most with the new half. */
export function repick(view: InvestView, cur: Pick, change: Partial<Pick>): Pick {
  const funds = allFunds(view);
  if (change.house) {
    const keep = funds.find((f) => f.rec.id === cur.fund);
    if (keep && priced(keep.byHouse[change.house])) return { house: change.house, fund: cur.fund };
    return { house: change.house, fund: otherWay(view, change.house)?.fund.rec.id ?? cur.fund };
  }
  if (change.fund) {
    const f = funds.find((x) => x.rec.id === change.fund);
    if (f && priced(f.byHouse[cur.house])) return { house: cur.house, fund: change.fund };
    return { house: f?.best?.providerId ?? cur.house, fund: change.fund };
  }
  return cur;
}

/** A pick that changed the other half too (a fund with no price at the account, an account with no price for the fund): the row tapped
 * says so, with the way back (the account moved to another house with nothing near the row to say it). */
export interface Moved {
  /** The pair before the tap, whose house the way back names. */
  prev: Pick;
  /** The pair the tap made. */
  at: Pick;
  /** The half that changed without being tapped. */
  half: "house" | "fund";
  /** Set by the page: puts back what was there before the tap, the page's own pair included (the way back made the page's pair the
   *  person's pick). */
  back?: () => void;
}
export type OnPick = (p: Pick, moved?: Moved) => void;
/** Pick one half; when the other half has to change with it, say which. */
export function pickHalf(view: InvestView, cur: Pick, change: Partial<Pick>, onPick: OnPick) {
  const next = repick(view, cur, change);
  const half = change.house ? (next.fund !== cur.fund ? "fund" : null) : next.house !== cur.house ? "house" : null;
  onPick(next, half ? { prev: { house: cur.house, fund: cur.fund }, at: next, half } : undefined);
}

/** The best pair of one kind (hedged or not) over every ranked fund at every house; null when the kind has none priced. */
export function bestOfKind(view: InvestView, kind: Kind): Pick | null {
  const top = allFunds(view)
    .filter((f) => kindOf(f.rec) === kind)
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
    .sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : null;
}

/** The pair of each kind the result shows (F-94): the person's pick in its own kind, the best pair in the other. */
export function kindPairs(view: InvestView, pick: Pick): Record<Kind, Pick> | null {
  const rec = allFunds(view).find((f) => f.rec.id === pick.fund)?.rec;
  if (!rec) return null;
  const mine = kindOf(rec);
  const other: Kind = mine === "hedged" ? "unhedged" : "hedged";
  const best = bestOfKind(view, other);
  return best ? ({ [mine]: pick, [other]: best } as Record<Kind, Pick>) : null;
}

// ---------------------------------------------------------------- the result

/** Every ranked pair of the same kind (hedged or not) as `best`, at every house, what it leaves, most first. */
function pairsOfKind(view: InvestView, best: Pick): { house: string; fund: string; v: number }[] {
  const bestRec = allFunds(view).find((f) => f.rec.id === best.fund)?.rec;
  return allFunds(view)
    .filter((f) => !bestRec || opensOn(f.rec) === opensOn(bestRec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
    .sort((a, b) => b.v - a.v);
}

/** The pair beside the best one when the person is on it: the next that leaves the most, over every ranked fund at every house of the same kind (hedged or not) as the best one. */
function runnerUp(view: InvestView, best: Pick): Pick | null {
  const top = pairsOfKind(view, best).find((x) => !(x.house === best.house && x.fund === best.fund));
  return top ? { house: top.house, fund: top.fund } : null;
}

/** What a priced pair leaves (its ranked figure), or null. */
const valueOfPair = (view: InvestView, p: Pick): number | null => {
  const at = allFunds(view).find((f) => f.rec.id === p.fund)?.byHouse[p.house];
  return priced(at) ? at.valueN : null;
};
/**
 * The tie set of F-80: every ranked pair of the best one's kind within the site's tie threshold of it (P-01), the best included; 0 when it
 * has no price (the words said "one of the two" when three pairs were within it).
 */
export function tieCount(view: InvestView, best: Pick | null, theta: number): number {
  return tieSet(view, best, theta).length;
}
/** The pairs of the tie set, the best one first. */
export function tieSet(view: InvestView, best: Pick | null, theta: number): { house: string; fund: string }[] {
  const a = best ? valueOfPair(view, best) : null;
  if (!best || a === null) return [];
  const inSet = pairsOfKind(view, best).filter((x) => !(x.house === best.house && x.fund === best.fund) && (x.v >= a || isTie(a, x.v, theta)));
  return [best, ...inSet];
}
/**
 * The best pair is crowned only when it is alone in its tie set (P-01, F-80; a pair 43 ₪ ahead, 0.05%, took the star).
 * Within the threshold the pairs share the top, and no star is drawn.
 */
export function crowned(view: InvestView, best: Pick | null, theta: number): boolean {
  return tieCount(view, best, theta) === 1;
}
/**
 * The funds of the tie set, each once, the best one's first: the fund list counts funds, not pairs (the same
 * fund tied at two houses counted twice in "אחת מ־3 השקולות").
 */
export function tieFunds(view: InvestView, best: Pick | null, theta: number): string[] {
  return [...new Set(tieSet(view, best, theta).map((x) => x.fund))];
}
/** How many funds the tie set holds: a fund listed in Tel Aviv and abroad (one ISIN) is one (count funds, not rows). */
export function tieFundCount(view: InvestView, best: Pick | null, theta: number): number {
  const isin = (id: string) => allFunds(view).find((f) => f.rec.id === id)?.rec.identifiers?.isin ?? id;
  return new Set(tieFunds(view, best, theta).map(isin)).size;
}
/** The pair is in the tie set of the best one. */
export function inTieSet(view: InvestView, best: Pick | null, p: Pick, theta: number): boolean {
  return tieSet(view, best, theta).some((x) => x.house === p.house && x.fund === p.fund);
}

/** The pair a pick is set against, and what the page says of the two (F-80, P-01): one reading for the receipt above the lists and the
 * fees panel under the lists, so the two never disagree. The pairs are priced once per plan (`pairCostsKept`). */
export function pairVerdict(view: InvestView, bundle: IndicesBundle, plan: WorkbenchInputs, pick: Pick, chosen: boolean) {
  const best = bestFor(view, pick);
  const onBest = !!best && best.house === pick.house && best.fund === pick.fund;
  // one shape whichever pair is picked ("the page is still jumping when changing from the winning combination"): the person's pair beside
  // the cheapest, or, on the cheapest, beside the next one
  const other = onBest ? runnerUp(view, pick) : best;
  const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house });
  const pcOther = other ? pairCostsKept({ bundle, index: view.index, plan, fundId: other.fund, providerId: other.house }) : null;
  // the tie set of F-80: every ranked pair within the site's tie threshold of the best one (P-01); crowned when it is alone
  // (with the person's own pick far from the best, the best pair is still in a tie and is not crowned)
  const theta = tieShareOf(bundle);
  const n = tieCount(view, best, theta);
  // the funds the tied pairs hold, each once: the fund list counts these, and the words name both counts where they differ
  const nFunds = tieFundCount(view, best, theta);
  const crown = n === 1;
  // the person's pick within the threshold of the best pair: in the tie set too
  const tied = !!pc && !!pcOther && isTie(pc.left.value as number, pcOther.left.value as number, theta);
  // under a tie no pair is first: the pairs are named by what they are and by where they stand, never by an order the page does not show
  const tie = onBest && n > 1;
  const mineRole = chosen ? c.pair.yours : onBest ? (tie ? c.pair.tieRole : c.pair.cheapest) : c.shownPair(false).name;
  const otherRole = onBest ? (tie ? c.pair.tieRole : c.pair.next) : crown ? c.pair.cheapest : c.pair.tieRole;
  // the exact tax the state's parts hold (docs/copy.md 1): the capital gains tax at the sale, and the tax on what a fund pays out where either
  // pair's fund pays out (A-10, TXS-10, TXF-10)
  const taxName = pc?.distributes || pcOther?.distributes ? c.pair.taxLinePayouts : c.pair.taxLine;
  const nameOf = (p: Pick) => providerName(view, p.house)?.short ?? p.house;
  const fundOf = (p: Pick) => allFunds(view).find((f) => f.rec.id === p.fund)?.name ?? p.fund;
  // a figure's sheet names its two inputs by whose they are; two pairs of one role are told apart by their account and fund
  const mineKey = mineRole === otherRole ? `${mineRole}, ${nameOf(pick)} · ${fundOf(pick)}` : mineRole;
  const otherKey = other && mineRole === otherRole ? `${otherRole}, ${nameOf(other)} · ${fundOf(other)}` : otherRole;
  const gap = (a: SiteValue, aName: string, b: SiteValue, bName: string, about: string) => differenceOf([aName, a], [bName, b], "F-65", { today: bundle.today, about });
  // what the other pair leaves more than the pick (F-65), where the pick is not the best
  const moreIfOther = pc && pcOther ? gap(pcOther.left, c.pair.input(otherKey, c.pair.colLeft), pc.left, c.pair.input(mineKey, c.pair.colLeft), c.pair.moreIfCheapest) : null;
  return { best, onBest, other, pc, pcOther, theta, n, nFunds, crown, tied, tie, mineRole, otherRole, taxName, nameOf, fundOf, mineKey, otherKey, gap, moreIfOther };
}

/**
 * A fund's figure rests on a steady currency, and says which: the fund's own where it is in a foreign currency, else its index's; on an
 * index the person added, the currency they said the fund is bought in, else the index's, unnamed. A hedged fund's and an Israeli index's
 * figures rest on none.
 */
export function steadyOf(view: InvestView, bundle: IndicesBundle, fund: string): string | null {
  if (view.index.israeli) return null;
  const rec = allFunds(view).find((f) => f.rec.id === fund)?.rec;
  if (!rec || kindOf(rec) !== "unhedged") return null;
  const seen = indexSeenBy(view.index, rec, bundle);
  if (seen.israeli) return null;
  if (seen.custom) return seen.boughtIn ? c.pair.steadyIn(currencyWord(seen.boughtIn)) : c.pair.steadyIndexCurrency;
  const moves = !isShekel(rec.currency) ? rec.currency : seen.exposure?.currency;
  return moves ? c.pair.steadyIn(currencyWord(moves)) : c.pair.steadyIndexCurrency;
}

/** The "!" beside the total: the dollar held still where the figure rests on it, and for a fund bought abroad what its price leaves out. */
export function totalNoteOf(view: InvestView, bundle: IndicesBundle, fund: string): string | null {
  const abroad = allFunds(view).find((f) => f.rec.id === fund)?.option === "abroad";
  const sayings = [steadyOf(view, bundle, fund), abroad ? c.pair.abroadShort : null].filter((x): x is string => !!x);
  return sayings.length === 0 ? null : sayings.map((x) => (x.endsWith(".") ? x : `${x}.`)).join(" ");
}

// ---------------------------------------------------------------- the account column

/** The bars' scale: the costs of the main group, so one or two far larger accounts do not flatten the rest (they get a break mark). */
export function barScale(costs: number[]): number {
  if (costs.length === 0) return 0;
  const sorted = [...costs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  const inGroup = sorted.filter((x) => x <= 2.5 * Math.max(median, 1));
  return Math.max(...inGroup);
}

/**
 * A house's group prices, on its row and never in its figure (D43): one closed line that opens, at the person's own
 * tap, to a sub-row per price. The line belongs to the house, so a re-sort or a new input never changes the row's height.
 */
export function GroupLine({ id, house, snapshots, open, onOpen }: { id: string; house: string; snapshots: IndicesBundle["snapshots"]; open: boolean; onOpen: (id: string, open: boolean) => void }) {
  const g = snapshots.find((s) => s.id === id)?.groups;
  if (!g || g.state !== "prices") return null;
  return <GroupPriceFold className="col-start-2 col-end-[-1]" entries={g.entries} house={house} href={brokeragePagePath(id)} open={open} onOpenChange={(o) => onOpen(id, o)} />;
}

/**
 * A standing-order price the house's price list prints and the row's figure leaves out (D41, D56), under the house's row: the "not counted"
 * tag a group price carries, the printed price, and the record's reason with its source. Two lines of it, the rest at the person's tap, as
 * a grey row's reason; `open` is kept by the list, whose held height starts over with it.
 */
export function AsideLine({ lines, company, open, onOpen }: { lines: readonly AsideLineRecord[]; /** The house's name in its record, for the price's source. */ company: string; open: boolean; onOpen: (open: boolean) => void }) {
  const words = asideWords(lines, company);
  if (!words) return null;
  return (
    <span className="col-start-2 col-end-[-1] text-xs leading-snug text-muted-foreground">
      <ClampedText open={open} onOpenChange={onOpen} more={c.pair.reasonMore} less={c.pair.reasonLess}>
        <Tag className="me-1.5">{groupPrices.notCounted}</Tag>
        {words}
      </ClampedText>
    </span>
  );
}

/** A left-out price's minimum as its price list prints it, in shekels or dollars; null where it prints none in either. */
const asideAmount = (v: NonNullable<AsideLineRecord["min"]>) => (typeof v.value !== "number" ? null : v.unit === "nis_per_trade" || v.unit === "nis" ? fmt.nis(v.value) : v.unit === "usd_per_trade" || v.unit === "usd" ? fmt.usd(v.value) : null);

/** The words of a price left out of the figure (D41, D56): the printed price, the record's reason, and its source; null with none to say. */
function asideWords(lines: readonly AsideLineRecord[], company: string): ReactNode {
  const l = lines[0];
  if (!l) return null;
  const min = l.min && asideAmount(l.min);
  const rate = typeof l.rate.value === "number" ? <Num value={ownBy({ ...l.rate } as SiteValue, company)} display={fmt.pct(l.rate.value)} /> : null;
  if (!rate) return null;
  return (
    <>
      {min ? <Tpl t={c.pair.asideLine} vars={{ rate, min: <Num value={ownBy({ ...l.min! } as SiteValue, company)} display={min} /> }} /> : <Tpl t={c.pair.asideLineNoMin} vars={{ rate }} />} {l.not_ranked.reason_he}{" "}
      <DocLink look="inline" source={l.not_ranked.source}>
        {c.pair.notPossibleSource}
      </DocLink>
    </>
  );
}

/**
 * The same prices left out of the figure as sentences of a sheet (`Term`'s `parts`), for words that open them: for each, the printed price
 * with the place it is printed (the minimum a sentence of its own where its place is another than the rate's), then the record's reason
 * with the document it rests on. A sentence several prices share is said once, with the first one's document.
 */
export function asideParts(lines: readonly AsideLineRecord[]): SheetPart[] {
  const out: SheetPart[] = [];
  const doc = (s: CitedPlace & { title: string }) => ({ href: sourceHref(s), title: withoutCodes(s.title) });
  const add = (p: SheetPart) => {
    if (!out.some((q) => q.text === p.text)) out.push(p);
  };
  for (const l of lines) {
    if (typeof l.rate.value !== "number") continue;
    const min = l.min && asideAmount(l.min);
    const rate = fmt.pct(l.rate.value);
    const at = doc(l.rate.source);
    if (!min || !l.min) add({ text: fill(c.pair.asideLineNoMin, { rate }), doc: at });
    else if (doc(l.min.source).href === at.href) add({ text: fill(c.pair.asideLine, { rate, min }), doc: at });
    else {
      add({ text: fill(c.pair.asideLineNoMin, { rate }), doc: at });
      add({ text: fill(c.pair.asideMin, { min }), doc: doc(l.min.source) });
    }
    add({ text: l.not_ranked.reason_he, doc: doc(l.not_ranked.source) });
  }
  return out;
}

/** What the account card says of its house, under its name: what it charges, its labels and its price list. */
export function HouseLine({ house, snapshot, charge }: { house: NonNullable<ReturnType<typeof providerName>>; snapshot: IndicesBundle["snapshots"][number] | undefined; charge: ReactNode }) {
  // the house's account on your own terms opens from here, a 44 px target that takes no more height than the words beside it
  return (
    <span className="flex flex-wrap items-center content-start gap-x-4 gap-y-1 text-sm">
      {/* on a phone the charge has its own line, so a longer figure does not push the words beside it to another line */}
      {charge && <span className="text-muted-foreground whitespace-nowrap max-md:basis-full">{charge}</span>}
      <LabelRow labels={brokerLabels(house, false)} />
      {house.custom ? (
        <StateTag state="entered" />
      ) : (
        snapshot && (
          <>
            <span className="whitespace-nowrap">
              {/* its 44 px target takes no more height than the words beside it, as the own-price button's */}
              <DocLink source={snapshot.tariff} className="-my-2.5">
                {gershayim(c.pair.tariff)}
              </DocLink>
              <span className="text-muted-foreground"> · {c.pair.collectedOn(`\u2066${fmt.date(snapshot.snapshot)}\u2069`)}</span>
            </span>
            <DealFromHouseButton houseId={house.id} className="-mx-2 -my-2.5">
              {c.pair.ownPrice}
            </DealFromHouseButton>
          </>
        )
      )}
    </span>
  );
}

/** The largest amount the unseen longest case of a line holds: it stands in for a figure the sliders can change, and is never shown. */
export const LONGEST_AMOUNT = 9_999_999;
/** What a plan at the sliders' ends can leave (nine digits: 500,000 ₪ and 10,000 ₪ a month for 40 years at 12%), for a line's unseen case. */
export const LONGEST_LEFT = 999_999_999;
/** The most years a plan's sliders give, for a sentence's unseen longest case. */
export const LONGEST_YEARS = 40;

// ---------------------------------------------------------------- the fund column

export const mayaHrefOf = (f: FundWay) => {
  // Maya's page of the fund exists for a fund listed in Israel
  return !isCustomFund(f.rec) && (f.option === "il-etf" || f.option === "il-tracking") && f.rec.identifiers.tase_number ? mayaFundHref(f.rec.identifiers.tase_number) : null;
};

/**
 * The fund's labels: how it trades (the type, from its option; a foreign fund, where it is listed, since the same fund can have a row for
 * each), then what the record says about it, and where its run flags a currency other than its index's (F-65), that.
 */
export const labelsOf = (view: InvestView, f: FundWay, bundle: IndicesBundle): Label[] => [
  f.option === "tase-foreign" ? optionLabels(f.option)[0]! : optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!,
  ...fundLabels(f.rec, indexSeenBy(view.index, f.rec, bundle), f.option),
  ...(f.currencyMismatch ? [label("currency-mismatch", f.rec.currency)] : []),
];

/** What a fund's gap cell shows (F-92): a compared gap against a net or gross index, years not compared, or no years. */
export type GapState = "net" | "gross" | "unstated" | "gross-apart" | "none";

/** F-92 (d) the state of one fund's cell on its list; "gross-apart": a gross index the fund is not fairly measured against there. */
export function gapStateOf(rec: FundWay["rec"], list: GapList): GapState {
  if (gapUnstated(rec, list)) return rec.tracking_record!.benchmark.dividends === "gross" ? "gross-apart" : "unstated";
  if (!gapOf(rec, list) || !rec.fees.tracking_difference_12m) return "none";
  return rec.tracking_record!.benchmark.dividends === "gross" ? "gross" : "net";
}

/**
 * The kind of index the compared gaps of a list are measured against, said once in the column's head and the note under the list ("מול
 * מדד נטו" under every figure repeats a label true of every row); "mixed" only when a list truly mixes; null with none compared.
 */
export function gapKindOf(states: readonly GapState[]): "net" | "gross" | "mixed" | null {
  const kinds = new Set(states.filter((x): x is "net" | "gross" => x === "net" || x === "gross"));
  return kinds.size === 0 ? null : kinds.size > 1 ? "mixed" : [...kinds][0]!;
}

/**
 * F-92 (a) the gap as its sheet shows it: the report's own figures for each year, and the document that says whether the index is net or
 * gross, at its page (every number traces to its source; that link sat under every figure); null with no compared gap.
 */
export function gapValue(rec: FundWay["rec"], list: GapList, today: string): SiteValue | null {
  const state = gapStateOf(rec, list);
  const g = gapOf(rec, list);
  const td = rec.fees.tracking_difference_12m;
  if ((state !== "net" && state !== "gross") || !g || !rec.tracking_record || !td) return null;
  // the inputs are the report's own figures for each year, from the same document as the fund's tracking note (D31: the fund's own report)
  const inputs: Record<string, SiteValue> = {};
  // the index by the name the fund's own document prints, so the gap says what it is measured against
  const bench = rec.tracking_record.benchmark;
  for (const y of rec.tracking_record.years) {
    inputs[c.kinds.gapInputFund(y.year)] = ownBy({ ...(td as SiteValue), value: y.fund_pct, unit: "pct", notes: undefined } as SiteValue, rec.manager);
    inputs[c.kinds.gapInputBenchmark(bench.name, y.year)] = ownBy({ ...(td as SiteValue), value: y.tracking_pct, unit: "pct", notes: undefined } as SiteValue, rec.manager);
  }
  // the document that says the index is net or gross: its own source, else the record's (the same report), at its page
  const doc = bench.source ?? rec.tracking_record.source;
  const page = bench.page ?? (bench.source ? undefined : (rec.tracking_record.page ?? undefined));
  // the same report as the years' is cited once for all three (one citation per sheet); another document, at its page
  const sameDoc = doc.url === (td as SiteValue).source.url;
  const kindDoc = sameDoc ? (td as SiteValue).source : { ...doc, ...(page ? { page, locator_he: c.kinds.gapPage(page) } : {}) };
  const kindValue = { ...(td as SiteValue), value: c.kinds.gapKindWord[state], unit: "text", source: kindDoc, checked: rec.tracking_record.checked, notes: undefined } as SiteValue;
  inputs[c.kinds.gapInputKind] = doc.strength === "institution" ? ownBy(kindValue, rec.manager) : kindValue;
  // the returns are in shekels in an Israeli fund's annual report, in the fund's own currency in a foreign issuer's documents
  const israeli = rec.domicile === "IL" && !isCustomFund(rec);
  const lead = c.kinds.gapLead(state, israeli ? c.kinds.currencyIn.ILS! : (c.kinds.currencyIn[rec.currency] ?? c.kinds.currencyInOther), israeli, g.years);
  // Mor's footnote, a caveat of the gap, only where A-07 is floored at 0: above the floor the variable fee charged cancels out of the
  // forward cost (F-92 (b))
  const positiveOnly = !!rec.tracking_record.variable_positive_only && paybackMayLower(rec, list);
  // the head says what the row says, in full ("בשנה" alone hid how many years): one year is that year's
  // difference, "ב־2025"; more years, the yearly mean and how many, "בשנה · 3 שנים"
  const year = rec.tracking_record.years[0]?.year;
  return computed(Math.round(g.pct * 100) / 100, g.years === 1 ? "pct" : "pct_per_year", "F-92", inputs, { today, about: c.kinds.gapHead[state], lead, ...(positiveOnly ? { caveat: c.kinds.gapPositiveOnly } : {}), signed: true, unitText: c.kinds.gapYears(g.years, year) });
}

/** The note under the gap column: a sentence for each state the list shows and none for the others. */
export function gapNoteOf(recs: readonly FundWay["rec"][], states: readonly GapState[]): string {
  const israeliNone = (i: number) => states[i] === "none" && recs[i]!.domicile === "IL" && !isCustomFund(recs[i]!);
  return c.funds.gapNote({
    kind: gapKindOf(states),
    unstated: states.filter((x) => x === "unstated").length,
    grossApart: states.includes("gross-apart"),
    funds: states.length,
    noYear: states.filter((_, i) => israeliNone(i)).length,
    notCollected: states.filter((x, i) => x === "none" && !israeliNone(i) && !isCustomFund(recs[i]!)).length,
    typed: states.filter((x, i) => x === "none" && isCustomFund(recs[i]!)).length,
  });
}

/** F-92 (a) after its words (the fund's part of the receipt): the gap with its sign, then the years it rests on, on one line where it fits; the document that says what the index is opens from its sheet. */
export function GapCell({ rec, today, list }: { rec: FundWay["rec"]; today: string; /** F-92 (d): the list the fund is compared on (`gapListFor`). */ list: GapList }) {
  const state = gapStateOf(rec, list);
  // a word in place of a figure stands where the figure would
  const note = (words: string) => <span className="text-muted-foreground">{words}</span>;
  // F-92 (d): an index of unstated kind, or a gross one the fund is not fairly measured against on this list: no gap stands beside the others
  if (state === "unstated" || state === "gross-apart") return note(c.kinds.gapUnstated);
  const g = gapOf(rec, list);
  const val = gapValue(rec, list, today);
  // "no full year" is what an Israeli fund's annual report says; a foreign fund's years were not read yet, which says nothing about its age;
  // a fund the person typed has no report the site reads, so nothing is waiting to be collected (D105)
  if (!g || !val) return note(isCustomFund(rec) ? c.kinds.gapTyped : rec.domicile === "IL" ? c.kinds.gapNone : c.kinds.gapNotCollected);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className="font-semibold text-foreground">
        <Num value={val} display={fmt.signedPct(g.pct, 2)} />
      </span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.kinds.gapYears(g.years, rec.tracking_record?.years[0]?.year)}</span>
    </span>
  );
}
