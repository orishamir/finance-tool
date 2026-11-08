// The index page as two linked lists (founder, 2026-10-27; spec 8dd1f013:research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account
// and a fund. The account list prices every account with the chosen fund, the fund list prices every fund at the chosen account;
// neither list leaves anything out (a row that cannot be priced stays, with its reason). Above them, the result: what is put in, what
// is left, and what it costs, split by who takes it: the person's pair and the cheapest one above each other, or, on the cheapest pair,
// the next one beside it (one shape, so a pick never resizes the block).
import { mayaFundHref } from "../../lib/sources";
import { Fragment, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { isTie, type FeeLine, type GapList } from "@finance-tool/engine";
import { brands, groupPrices, invest as c } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { brokeragePagePath, chargesCurrentAccount, doubtOf, firstCount, placesOf, tieShareOf, tieThresholdValue, paybackMayLower, accountWhole, pricedVariable, gapOf, gapListFor, gapUnstated, indexSeenBy, hasKinds, kindOf, opensOn, pairCosts, pairValueFigure, dollarBound, accountSum, phoneOnlyValue, type FundWay, type InvestView, type Kind, type PairCosts, type Reason, type WayPrice } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { brokerLabels, fundLabels, optionLabels, sharedLabels, type Label } from "../../lib/labels";
import { computed, differenceOf, ownBy, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { LeadTail, Num, ShortRow, shortRow, Term } from "../provenance";
import { AlsoChanged, HelpMark, ClampedText, gershayim, wholeParts, writtenAmounts, holdOnPick, MixedName, NameLine, figureFit, Card, PickCard, ChartLegend, CostStack, Disclosure, LabelChip, LabelFilter, LabelRow, LongestCase, NoteList, PickList, ProductIdLink, SelectField, Sentence, Stat, StatRow, SourcedTag, Swatch, Tag, Tpl, cx, GroupPriceFold, useChartPick, type ChartPick, useHeldHeight, type CostPart, type FoldOrder, type GroupChoice, type PickRow } from "../kit";
import { groupNameOf, isGroupPrice, isGroupProvider, pickableGroups } from "../../lib/group-pick";
import { optionClass, OptionTag, reasonText } from "./parts";
import { ProviderLink, providerName } from "./sections";
import { Fees } from "./funds";
import { AddEntryButton, BrokerTerms, FundTerms } from "./custom-entries";
import { OwnAccountButton } from "./own-account";
import { StateTag } from "../provenance";
import { sourceHref } from "../../lib/sources";

export interface Pick {
  house: string;
  fund: string;
  /** A group of the house picked in its fold (`group:<n>`): the pair is priced at that group's prices, beside the ranking (D43). */
  group?: string;
}

export const lineClass: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };
/** A bank's current account (F-102, D64) is a fee for keeping an account too: it takes the account fee's colour and legend item, and its own name in its part. */
export const lineOf = (line: FeeLine) => (line === "account" ? "fixed" : line in lineClass ? line : "other");
/** A legend item's name: the account fee's item stands for a bank's current account too, which shares its colour, where a bar shown has
 *  one (`current`); else it names the securities account's fee alone (a legend item names only what is drawn). */
export const legendName = (l: string, current = true) => (l === "fixed" ? (current ? c.pair.legendAccount : c.pair.legendSecurities) : (c.pair.lines[l] ?? c.pair.lines.other));
/** Whether any of these account lines is a bank's current account (F-102). */
export const hasCurrent = (lines: readonly { line: FeeLine }[]) => lines.some((l) => l.line === "account");
/** A part's name: the line's own where it has one (the current account), else its legend item's. */
export const partName = (line: FeeLine) => c.pair.lines[line] ?? c.pair.lines[lineOf(line)] ?? c.pair.lines.other;
/** The order of the account's lines in every bar, the legend's (`legendLines`): one order whatever the price list's own (2026-11-08, charts.md:
 *  the parts in one order in every bar, and the legend's the same); a bank's current account just after the account fee, whose item it shares. */
const LINE_ORDER = [...Object.keys(lineClass), "other"];
export const byLegend = <L extends { line: FeeLine }>(ls: readonly L[]): L[] => [...ls].sort((a, b) => LINE_ORDER.indexOf(lineOf(a.line)) - LINE_ORDER.indexOf(lineOf(b.line)) || Number(a.line === "account") - Number(b.line === "account") || (a.line < b.line ? -1 : a.line > b.line ? 1 : 0));
/** A legend names every account line whichever row or pair is shown, in one order, so its items keep their places from one pick to the next.
 * An index in shekels has no conversion line to name. */
export const legendLines = (israeli: boolean, used: readonly string[]) => [...Object.keys(lineClass).filter((l) => l !== "fx" || !israeli), ...(used.includes("other") ? ["other"] : [])];
/** A computed shekel figure of this page, whole shekels (the totals and gaps the bars and lists show). */
export const nis = (n: number, formula: string, about: string, today: string, inputs: Record<string, SiteValue> = {}): SiteValue => computed(Math.round(n), "nis", formula, inputs, { today, about });
/** A gain shown with its plus sign, isolated so it reads "+2,621 ₪" inside Hebrew. */
const plus = (n: number) => (n > 0 ? `\u2066+${fmt.nisWhole(n)}\u2069` : undefined);
const priced = (x: WayPrice | { reason: Reason } | undefined): x is WayPrice => !!x && "valueN" in x;

/** A pair's "by phone only" (2026-11-08): the house's words for the exchange its price rests on, as the value its tag opens; null for any other pair. */
function phoneOf(view: InvestView, bundle: WorkbenchBundle, p: { house: string; fund: string }): SiteValue | null {
  const f = allFunds(view).find((x) => x.rec.id === p.fund);
  const at = f?.byHouse[p.house];
  if (!f || !priced(at)) return null;
  return phoneOnlyValue(bundle.snapshots.find((s) => s.id === p.house), f.option, at.venue, providerName(view, p.house)?.short ?? p.house);
}

/** Every fund on the index, of every option that exists for it. */
export const allFunds = (view: InvestView): FundWay[] => view.options.filter((o) => o.exists).flatMap((o) => o.funds);

/** The default pick: the cheapest complete way. */
export const pickOfHeadline = (view: InvestView): Pick | null => (view.headline ? { house: view.headline.providerId, fund: view.headline.fund.rec.id } : null);
/** With no ranked way, the way that leaves the most on an open rule (a fund the person typed abroad that accumulates): shown, not ranked. */
export const pickOfOpen = (view: InvestView): Pick | null => {
  const w = view.options.find((o) => o.bestWay)?.bestWay;
  return w ? { house: w.providerId, fund: w.fund.rec.id } : null;
};

/**
 * The cheapest pair to set beside the person's: the headline, unless they picked a currency-hedged fund, which is compared with the best
 * hedged pair (2026-10-28): the page opens on unhedged funds only, and "the cheapest" must never leave less than the pick beside it.
 */
export function bestFor(view: InvestView, pick: Pick): Pick | null {
  const rec = allFunds(view).find((f) => f.rec.id === pick.fund)?.rec;
  if (!rec || opensOn(rec)) return pickOfHeadline(view);
  const top = allFunds(view)
    .filter((f) => !opensOn(f.rec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open && !isGroupPrice(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
    .sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : pickOfHeadline(view);
}

/** Every way a house prices on the index, a group's price aside. */
const waysOf = (view: InvestView, house: string): { fund: FundWay; at: WayPrice }[] =>
  allFunds(view).flatMap((f) => { const at = f.byHouse[house]; return priced(at) && !isGroupPrice(at) ? [{ fund: f, at }] : []; });

/** A house's way that leaves the most: a ranked one first, else one on an open rule, which is shown and not ranked. Its row names it when the picked fund has no price there. */
function otherWay(view: InvestView, house: string): { fund: FundWay; at: WayPrice } | null {
  return waysOf(view, house).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN)[0] ?? null;
}

/**
 * Why a house gives a fund no price, from the house's record first (2026-11-05: the page said Psagot's price list has no line for
 * foreign securities; it has two, and the record says the price in Europe is not final): a doubt the record words, a price list not
 * collected, a kind the house does not sell, and only then the engine's reason.
 */
export function whyNoPrice(bundle: { snapshots: WorkbenchBundle["snapshots"] }, houseId: string, fund: FundWay): string {
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  const at = fund.byHouse[houseId];
  const doubt = doubtOf(snap, fund.option);
  if (doubt) return doubt;
  if (snap?.missing && snap.missing_reason_he) return snap.missing_reason_he;
  if (at && "availability" in at && at.availability) return c.pair.notPossibleWhy(c.stairs.kinds[fund.option] ?? fund.option);
  return at && "reason" in at ? reasonText(at.reason, optionClass[fund.option]) : c.funds.cannot;
}

/** The short line in a fund's last cell when the house gives it no price, naming the house, in `whyNoPrice`'s order (founder, 2026-11-08). */
export function noPriceLine(bundle: { snapshots: WorkbenchBundle["snapshots"] }, houseId: string, fund: FundWay, house: string): string {
  const snap = bundle.snapshots.find((s) => s.id === houseId);
  const at = fund.byHouse[houseId];
  if (doubtOf(snap, fund.option)) return c.pair.noPriceAt.doubt(house);
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
 * says so, with the way back (2026-11-05: the account moved to another house with nothing near the row to say it). */
export interface Moved {
  /** The pair before the tap, whose house the way back names. */
  prev: Pick;
  /** The pair the tap made. */
  at: Pick;
  /** The half that changed without being tapped. */
  half: "house" | "fund";
  /** Set by the page: puts back what was there before the tap, the page's own pair or a group included (the way back made the page's
   *  pair the person's pick, and dropped a group). */
  back?: () => void;
}
/** The way back from a row of a list: the row stays where it is on the screen while the lists sort again. */
const backFrom = (moved: Moved, key: string) => (e: MouseEvent<HTMLButtonElement>) => {
  const row = e.currentTarget.closest<HTMLElement>("[data-pick-key]");
  if (row) holdOnPick(key, row);
  moved.back?.();
};
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
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open && !isGroupPrice(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
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

/** "3%", "−2.38%": a signed percent for chart ticks; `isoPct` isolates it for a Hebrew sentence (it reads "−2.38%" there too). */
export const signedPct = (x: number, digits = 0) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x).toFixed(digits)}%`;
export const isoPct = (x: number, digits = 0) => `\u2066${signedPct(x, digits)}\u2069`;

// ---------------------------------------------------------------- the result

function partsOf(pc: PairCosts, from: string, taxName: string): CostPart[] {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const account = byLegend(pc.account).map((l) => ({ id: l.line, legendId: lineOf(l.line), name: partName(l.line), value: n(l.cost), className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", inside: true as const, source: from, group: "account" }));
  // the account's remainder no single line explains is part of what it takes, so the bar holds the whole cost (F-91); it is the account's
  // fees on each other, first among the account's parts, far from the fund's (pass 7: both readers took it for the fund's, beside it)
  return [{ ...remainderPart(pc.interaction), inside: true as const, group: "account" }, ...account, { id: "fund", name: c.pair.fundLine, value: n(pc.fund), className: "bg-chart-cost-fund", inside: true as const, source: c.pair.sourceFund }, { id: "tax", name: taxName, value: n(pc.tax), className: "bg-chart-tax", inside: true as const, source: c.pair.sourceTax }];
}
/** The account's fees on each other (F-91's remainder), as every bar of the page draws it. */
const remainderPart = (value: number): CostPart => ({ id: "remainder", name: c.pair.remainder, about: c.pair.remainderAbout, value, className: "bg-chart-cost-other", source: c.pair.sourceComputed });
/** The account's figure a bar's account parts add up to: the account list's (pass 7). */
const accountGroups = (pc: PairCosts) => ({ account: accountWhole(pc) });
const totalOf = (parts: CostPart[]) => parts.reduce((a, p) => a + p.value, 0);

function CostLegend({ lines, pick, current = true, taxName = c.pair.taxLine }: { lines: string[]; pick: ChartPick<string>; /** A bar shown counts a bank's current account. */ current?: boolean; /** The exact tax the state's parts hold (docs/copy.md 1). */ taxName?: string }) {
  const groupHead = (text: string) => ({ id: `g-${text}`, label: <span className="text-foreground font-medium">{text}</span> });
  return (
    <ChartLegend
      pick={pick}
      items={[
        groupHead(c.pair.who.account),
        // the account's fees on each other first, as in the bars: away from the fund's group (pass 7)
        { id: "remainder", swatch: <Swatch shape="box" className="bg-chart-cost-other" />, label: c.pair.remainder },
        ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: legendName(l, current) })),
        groupHead(c.pair.who.fund),
        { id: "fund", swatch: <Swatch shape="box" className="bg-chart-cost-fund" />, label: c.pair.fundLine },
        groupHead(c.pair.who.state),
        { id: "tax", swatch: <Swatch shape="box" className="bg-chart-tax" />, label: taxName },
      ]}
    />
  );
}

/** Every role a cost bar can name, laid out unseen under its own: a longer role took a second line on a phone. */
const BAR_ROLES = [c.pair.yours, c.pair.cheapest, c.pair.next, c.pair.tieRole, c.pair.openTop];

/** A cost bar's total: the rounded base less the rounded value left, so two bars differ by exactly what the two "left" figures differ by. */
const barTotal = (pc: PairCosts) => Math.round(pc.base) - Math.round(pc.left.value as number);
/** The same as a figure (F-91: `X − V`), the two whole-shekel figures it is taken between as its inputs. */
const barTotalValue = (pc: PairCosts, who: string, today: string): SiteValue => {
  const whole = (v: SiteValue): SiteValue => ({ ...v, value: Math.round(v.value as number) });
  return differenceOf([c.pair.baseInput, whole(pc.baseValue)], [c.pair.input(who, c.pair.colLeft), whole(pc.left)], "F-91", { today, about: who });
};

function CostBar({ who, fund, funds, sub, pc, scale, you, entered, today, highlight, taxName }: { taxName: string; who: string; /** The fund's name: two bars of one house differ by the fund, and say so (2026-11-05). */ fund: string; /** Every fund name of the index: the name's lines are held at the longest, so another pair moves nothing. */ funds: string[]; sub: string; pc: PairCosts; scale: number; highlight: string | null; you?: boolean; /** The person typed this account (D44). */ entered?: boolean; today: string }) {
  const total = barTotal(pc);
  const parts = partsOf(pc, entered ? c.pair.sourceEntered : c.pair.sourceList(who), taxName);
  return (
    // the figure's column has one width for every plan, so a long figure never narrows the lines beside it; on a phone the fund's
    // name has the bar's whole width, under the figure, and it wraps rather than being cut: cut, a Latin name lost its start
    <div className="grid grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[15rem_minmax(0,1fr)_6rem] items-center gap-x-3 md:gap-y-1.5">
      {/* three lines on every bar, whichever pair: whose pair it is, the account, the fund */}
      <span className="flex flex-col min-w-0 leading-tight max-md:contents">
        <LongestCase className="text-xs text-muted-foreground leading-tight max-md:row-start-1 max-md:col-start-1" cases={BAR_ROLES.map((r) => <span key={r}>{r} · {c.customEntries.enteredWord}</span>)}>
          <span>
            {sub}
            {entered && ` · ${c.customEntries.enteredWord}`}
          </span>
        </LongestCase>
        <span className={cx("truncate font-semibold leading-tight max-md:row-start-2 max-md:col-start-1", (you || entered) && "text-entered")}>{who}</span>
        {/* two lines on every index, so another index moves nothing below the bars (the longest collected names take two) */}
        <LongestCase className="min-h-[2lh] text-xs text-muted-foreground leading-tight [overflow-wrap:anywhere] max-md:row-start-3 max-md:col-span-2" cases={funds.map((f) => <span key={f}><MixedName>{f}</MixedName></span>)}>
          <span>
            <MixedName>{fund}</MixedName>
          </span>
        </LongestCase>
      </span>
      <div className="min-w-0 max-md:col-span-2 max-md:row-start-4 max-md:mt-1.5">
        <CostStack parts={parts} total={total} groups={accountGroups(pc)} scale={scale} highlight={highlight} label={`${who}: ${fmt.nisWhole(total)}`} />
      </div>
      <span className={cx("text-end font-semibold max-md:row-start-1 max-md:row-span-2 max-md:col-start-2", figureFit(total))}>
        <Num value={barTotalValue(pc, who, today)} />
      </span>
    </div>
  );
}

/** Every ranked pair of the same kind (hedged or not) as `best`, at every house, what it leaves, most first. */
function pairsOfKind(view: InvestView, best: Pick): { house: string; fund: string; v: number }[] {
  const bestRec = allFunds(view).find((f) => f.rec.id === best.fund)?.rec;
  return allFunds(view)
    .filter((f) => !bestRec || opensOn(f.rec) === opensOn(bestRec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open && !isGroupPrice(at) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
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
function tieSet(view: InvestView, best: Pick | null, theta: number): { house: string; fund: string }[] {
  const a = best ? valueOfPair(view, best) : null;
  if (!best || a === null) return [];
  const inSet = pairsOfKind(view, best).filter((x) => !(x.house === best.house && x.fund === best.fund) && (x.v >= a || isTie(a, x.v, theta)));
  return [best, ...inSet];
}
/**
 * The best pair is crowned only when it is alone in its tie set (P-01, F-80; 2026-11-05: a pair 43 ₪ ahead, 0.05%, took the star).
 * Within the threshold the pairs share the top, and no star is drawn: in the tiles and in the account list alike.
 */
export function crowned(view: InvestView, best: Pick | null, theta: number): boolean {
  return tieCount(view, best, theta) === 1;
}
/**
 * The account the account list stars, from the same tie set: the one house every pair of the set is at, else none (on the S&P 500
 * three of Psagot's own funds were within the threshold, no other house was, and the clearly cheapest account lost its star). The tiles
 * speak of pairs and the list of accounts: a set of three pairs at one house crowns no pair and crowns the house.
 */
export function crownedHouse(view: InvestView, best: Pick | null, theta: number): string | null {
  const set = tieSet(view, best, theta);
  return set.length > 0 && set.every((x) => x.house === set[0]!.house) ? set[0]!.house : null;
}
/**
 * The funds of the tie set, each once, the best one's first: the fund list counts funds, not pairs (independent check of pass 5: the same
 * fund tied at two houses counted twice in "אחת מ־3 השקולות").
 */
export function tieFunds(view: InvestView, best: Pick | null, theta: number): string[] {
  return [...new Set(tieSet(view, best, theta).map((x) => x.fund))];
}
/** How many funds the tie set holds: a fund listed in Tel Aviv and abroad (one ISIN) is one (pass 7: count funds, not rows). */
export function tieFundCount(view: InvestView, best: Pick | null, theta: number): number {
  const isin = (id: string) => allFunds(view).find((f) => f.rec.id === id)?.rec.identifiers?.isin ?? id;
  return new Set(tieFunds(view, best, theta).map(isin)).size;
}
/** The pair is in the tie set of the best one. */
export function inTieSet(view: InvestView, best: Pick | null, p: Pick, theta: number): boolean {
  return tieSet(view, best, theta).some((x) => x.house === p.house && x.fund === p.fund);
}

/** The most pairs a tie can count, for the unseen longest cases of the words that count them. */
const TIE_MOST = 10;

/** The longest figure a tile's gap line can hold, for its unseen longest case. */
const LONGEST_GAP = `\u2066\u2212${fmt.nisWhole(9_999_999)}\u2069`;

export function PairResult({ view, bundle, plan, settled, pick, chosen, onPick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; settled?: WorkbenchInputs; pick: Pick; /** The person picked this pair (it is in the address); else it is the page's own, and is never called theirs (2026-11-05). */ chosen: boolean; onPick: OnPick }) {
  const best = bestFor(view, pick);
  const legendPick = useChartPick();
  const onBest = !!best && best.house === pick.house && best.fund === pick.fund;
  // the block keeps one shape whichever pair is picked (founder, 2026-10-27: "the page is still jumping when changing from the winning
  // combination"): the person's pair beside the cheapest, or, on the cheapest, beside the next one
  const other = onBest ? runnerUp(view, pick) : best;
  const pc = useMemo(() => pairCosts({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house }), [bundle, view.index, plan, pick.fund, pick.house]);
  const pcOther = useMemo(() => (other ? pairCosts({ bundle, index: view.index, plan, fundId: other.fund, providerId: other.house }) : null), [bundle, view.index, plan, other?.fund, other?.house]);
  if (!pc) return null;
  // a foreign fund's one figure rests on a steady dollar, and says so (founder, 2026-10-31: the assumption never goes silent); a hedged fund's does not
  const onSteadyDollar = (fund: string) => {
    const rec = allFunds(view).find((f) => f.rec.id === fund)!.rec;
    return kindOf(rec) === "unhedged" && !indexSeenBy(view.index, rec, bundle).israeli;
  };
  // held at its longest case on every index, empty on an Israeli one, so the tiles keep one height from index to index (nothing moves)
  const steady = (fund: string) => (
    <LongestCase className="text-xs text-muted-foreground" cases={[<span key="d">{c.pair.steadyDollar}</span>, <span key="i">{c.pair.steadyIndexCurrency}</span>]}>
      <span>{!view.index.israeli && onSteadyDollar(fund) ? (view.index.custom ? c.pair.steadyIndexCurrency : c.pair.steadyDollar) : ""}</span>
    </LongestCase>
  );
  const years = plan.years;
  const months = 12 * plan.years;
  const lines = legendLines(!!view.index.israeli, [...pc.account, ...(pcOther?.account ?? [])].map((l) => lineOf(l.line)));
  // the tie set of F-80: every ranked pair within the site's tie threshold of the best one (P-01); crowned when it is alone, in the tiles
  // as in the account list (with the person's own pick far from the best, the tile crowned a best pair that was in a tie)
  const theta = tieShareOf(bundle);
  const n = tieCount(view, best, theta);
  // the funds the tied pairs hold, each once: the fund list counts these, and the tile names both counts where they differ (pass 7)
  const nFunds = tieFundCount(view, best, theta);
  const crown = n === 1;
  // the person's pick within the threshold of the best pair: in the tie set too
  const tied = !!pcOther && isTie(pc.left.value as number, pcOther.left.value as number, theta);
  // under a tie no pair is first: the pairs are named by what they are and by where they stand, never by an order the page does not show
  const tie = onBest && n > 1;
  const mineRole = chosen ? c.pair.yours : onBest ? (tie ? c.pair.tieRole : c.pair.cheapest) : c.pair.openTop;
  const otherRole = onBest ? (tie ? c.pair.tieRole : c.pair.next) : crown ? c.pair.cheapest : c.pair.tieRole;
  const vsMine = chosen ? c.pair.vsYours : tie ? c.pair.vsRight : c.pair.vsCheapest;
  // the exact tax the state's parts hold (docs/copy.md 1): the capital gains tax at the sale, and the tax on what a fund pays out where either
  // bar's fund pays out (A-10, TXS-10, TXF-10)
  const taxName = pc.distributes || pcOther?.distributes ? c.pair.taxLinePayouts : c.pair.taxLine;
  // the cost bars' title: the largest of who takes the money (the account, the fund, the state) in each pair shown (charts.md: a finding)
  const costTitle = costTitleOf(years, [pc, ...(pcOther ? [pcOther] : [])], taxName);
  const costTitleCases = [1, 2, LONGEST_YEARS].flatMap((y) => [c.pair.costPart.account, c.pair.costPart.fund, c.pair.taxLinePayouts].map((part) => <span key={`${y}${part}`} className="block font-semibold">{c.pair.costTitleSplit(y, part, c.pair.taxLinePayouts)}</span>));
  const parts = partsOf(pc, "", taxName);
  const scale = Math.max(totalOf(parts), pcOther ? totalOf(partsOf(pcOther, "", taxName)) : 0);
  // the three parts of the gap, rounded so they add up to the gap between the two shown values left (F-91: the costs add up to it exactly)
  // the account, the fund and the tax as the two bars write them: each difference is what a reader gets from the bars' own figures, and
  // the three add up to the difference of the bars' totals (pass 6 readers: "1 ₪ יותר" beside account parts of 1,057 and 1,057)
  const byKind = (x: PairCosts) => {
    const parts = partsOf(x, "", taxName);
    const w = writtenAmounts(parts, barTotal(x), accountGroups(x));
    const of = (id: string) => w[parts.findIndex((p) => p.id === id)] ?? 0;
    return [parts.reduce((a, p, i) => a + (p.group === "account" ? w[i]! : 0), 0), of("fund"), of("tax")];
  };
  const gapParts = pcOther ? byKind(pc).map((v, i) => v - byKind(pcOther)[i]!) : null;
  const leftGap = pcOther ? (pc.left.value as number) - (pcOther.left.value as number) : 0;
  const nameOf = (p: Pick) => providerName(view, p.house)?.short ?? p.house;
  const fundOf = (p: Pick) => allFunds(view).find((f) => f.rec.id === p.fund)?.name ?? p.fund;
  const fundNames = [...new Set(allFunds(view).map((f) => f.name))];
  // a figure's sheet names its two inputs by whose they are; two pairs of one role are told apart by their account and fund
  const mineKey = mineRole === otherRole ? `${mineRole}, ${nameOf(pick)} · ${fundOf(pick)}` : mineRole;
  const otherKey = other && mineRole === otherRole ? `${otherRole}, ${nameOf(other)} · ${fundOf(other)}` : otherRole;
  const gap = (a: SiteValue, aName: string, b: SiteValue, bName: string, about: string) => nis((a.value as number) - (b.value as number), "F-65", about, bundle.today, { [aName]: a, [bName]: b });
  const gapNum = (amount: number, about: string, a: SiteValue, b: SiteValue) =>
    amount === 0 ? (
      c.pair.gapNone
    ) : (
      <>
        <Num value={nis(Math.abs(amount), "F-91", about, bundle.today, { [c.pair.input(mineKey, about)]: a, [c.pair.input(otherKey, about)]: b })} /> {amount > 0 ? c.pair.gapMore : c.pair.gapLess}
      </>
    );
  // each tile names its pair (2026-11-05: the tiles named neither): the account on a line, the fund under it in its own direction, so a
  // cut falls at the end of its name and the brand and the index always show ("...re S&P 500 UCITS ETF" lost "iShares Co")
  // The fund's number closes it, always (fourth pass: readers could not tell iShares' "(Accumulating)" abroad from the same name on
  // the exchange here, nor from its "(Dist)", once a phone's lines cut the name): beside the name on a computer, on a line of its own on a phone.
  const numberOf = (p: Pick) => allFunds(view).find((f) => f.rec.id === p.fund)?.number ?? null;
  const pairLine = (p: Pick) => {
    const phone = phoneOf(view, bundle, p);
    return (
      <span className="flex flex-col text-sm text-muted-foreground">
        {/* a house that sells this fund only by phone says so beside its name, and the tag opens the house's words (2026-11-08); in a
            phone's narrow tile the tag goes under the name: a small shift on that pair alone, not a blank line on every pair (guidelines/design.md) */}
        <span className="flex flex-wrap items-center gap-x-2 min-w-0">
          <span className="truncate min-w-0">
            <MixedName>{nameOf(p)}</MixedName>
          </span>
          {phone && <SourcedTag value={phone}>{c.pair.phoneTag}</SourcedTag>}
        </span>
        <span className="flex max-md:flex-col md:items-baseline md:gap-2 min-w-0">
          {/* on a phone the whole name wraps, held at the index's longest (guidelines/design.md: nothing cut off at 390 px; a cut
              "אלטשולר שחם מחקה (4D)…" lost the index, 2026-11-08); the held names are laid out on a phone only, so a computer's line keeps its width */}
          <LongestCase className="md:flex-initial min-w-0" cases={fundNames.map((n) => <span key={n} className="block md:hidden"><NameLine>{n}</NameLine></span>)}>
            <NameLine className="md:truncate">{fundOf(p)}</NameLine>
          </LongestCase>
          {/* a line held on a phone even for a fund typed without a number, so a pick of one moves nothing */}
          <span className="shrink-0 max-md:min-h-[1lh]">
            {numberOf(p) && (
              <bdi dir="ltr" className="num-id">
                {numberOf(p)}
              </bdi>
            )}
          </span>
        </span>
      </span>
    );
  };
  const phonePick = phoneOf(view, bundle, pick);
  // every title a tile can carry, laid out unseen: a tie that comes or goes with a slider, a pick, another index move nothing
  const mineTitles = [
    <span key="y1">{c.pair.yours}<span className="font-medium"> · {c.pair.tiedWith}</span></span>,
    <span key="y2">{c.pair.yours}<span className="font-medium"> · {c.pair.cheapestTag}</span></span>,
    <span key="t2" className="font-medium">{c.pair.tieTop(2)}</span>,
    <span key="tn" className="font-medium">{c.pair.tieTop(TIE_MOST, TIE_MOST - 1)}</span>,
    <span key="st" className="font-medium">{c.pair.cheapestStar}</span>,
    <span key="op">{c.pair.openTop}</span>,
  ];
  const otherTitles = [c.pair.next, c.pair.tieOther, c.pair.cheapestStar, c.pair.tieTop(2), c.pair.tieTop(TIE_MOST, TIE_MOST - 1)].map((x) => <span key={x}>{x}</span>);
  const otherTitle = onBest ? (tie ? c.pair.tieOther : c.pair.next) : crown ? c.pair.cheapestStar : c.pair.tieTop(n, nFunds);
  const mineTag = onBest ? (tie ? c.pair.tiedWith : c.pair.cheapestTag) : tied ? c.pair.tiedWith : null;
  const moreIfOther = pcOther ? gap(pcOther.left, c.pair.input(otherKey, c.pair.colLeft), pc.left, c.pair.input(mineKey, c.pair.colLeft), c.pair.moreIfCheapest) : null;
  // why there is no order, counted as the title counts ("one of 3" stood above "the two pairs are equal"); the pairs of the tie in
  // neither tile are named after it, one and a count, so "3" points at a pair the reader can find (fourth pass)
  // a fund named as another of the index is (iShares on the exchange here and abroad) is told apart by its number
  const twin = (id: string) => { const f = allFunds(view).find((x) => x.rec.id === id); return f && allFunds(view).some((x) => x !== f && x.name === f.name) ? f.number : null; };
  const pairName = (p: { house: string; fund: string }) => (
    <Fragment key={`${p.house}|${p.fund}`}>
      <MixedName>{nameOf(p)}</MixedName> {c.pair.tieWith} <MixedName>{fundOf(p)}</MixedName>
      {twin(p.fund) && <> {`\u2066${twin(p.fund)}\u2069`}</>}
    </Fragment>
  );
  const rest = tie || tied ? tieSet(view, best, theta).filter((x) => !(x.house === pick.house && x.fund === pick.fund) && !(other && x.house === other.house && x.fund === other.fund)) : [];
  const restLine = (names: ReactNode[], more: number) =>
    names.length === 0 ? null : (
      <>
        {" "}
        {names.length === 1 && more === 0 ? c.pair.tieThird : c.pair.tieRest}{" "}
        {names.map((x, i) => (
          <Fragment key={i}>
            {i > 0 && "; "}
            {x}
          </Fragment>
        ))}
        {more > 0 && <> {c.pair.tieMore(more)}</>}.
      </>
    );
  // what makes a tie, with P-01 written as its figure, where the tie is first named (pass 7 readers)
  const tieRule = <>{c.pair.tieRule.before}<Num value={tieThresholdValue(bundle)} />{c.pair.tieRule.after}</>;
  const whyTie = tie || tied ? <>{c.pair.tieWhy(Math.max(n, 2))}{tieRule}{restLine(rest.slice(0, 1).map(pairName), Math.max(0, rest.length - 1))}</> : null;
  const longestPairNames = (() => {
    const houses = view.providers.map((p) => p.short).sort((a, b) => b.length - a.length);
    const funds = [...new Set(allFunds(view).map((f) => f.name))].sort((a, b) => b.length - a.length);
    return [0].map((i) => (
      <Fragment key={i}>
        <MixedName>{houses[0] ?? ""}</MixedName> {c.pair.tieWith} <MixedName>{funds[i] ?? funds[0] ?? ""}</MixedName> {`\u2066${"0".repeat(12)}\u2069`}
      </Fragment>
    ));
  })();
  const gapCases = [c.pair.vsYours, c.pair.vsRight, c.pair.vsCheapest, c.pair.moreIfCheapest].map((vs) => (
    <span key={vs} className="block">
      {LONGEST_GAP} {vs}
    </span>
  ));
  return (
    <Card pad="roomy" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-stretch md:gap-x-6">
        {/* one width for the longest case: another digit in the months or the amount moved the two cards beside it */}
        <div className="flex flex-col gap-0.5 md:w-72 md:shrink-0">
          <span className="text-sm text-muted-foreground">{c.pair.paidIn}</span>
          <span className="text-2xl md:text-3xl font-bold leading-tight">
            <Num animate value={pc.paidIn} />
          </span>
          <LongestCase className="text-xs text-muted-foreground" cases={[<span key="o">{c.pair.paidInOnce}</span>, <span key="m">{c.pair.paidInNote(12 * LONGEST_YEARS)}</span>]}>
            <span>{plan.monthly === 0 ? c.pair.paidInOnce : c.pair.paidInNote(months)}</span>
          </LongestCase>
        </div>
        <span aria-hidden="true" className="hidden md:inline text-2xl text-muted-foreground self-center">
          ←
        </span>
        {/* the two tiles side by side are one row: a billion in one writes the other's large figures short too (fresh readers, round 3) */}
        <ShortRow when={shortRow(pc.left.value as number, pcOther?.left.value as number | undefined)}>
        <div className="grid grid-cols-2 gap-3 md:contents">
          {/* the person's colour only on the person's pick (blue is for what they entered or chose) */}
          <div className={cx("md:flex-1 md:min-w-64 min-w-0 rounded-lg border p-3 flex flex-col gap-0.5", chosen ? "border-entered bg-entered/10" : "border-primary")}>
            <LongestCase className="text-sm text-muted-foreground" cases={mineTitles}>
              <span>
                {chosen ? (
                  <>
                    {c.pair.yours}
                    {mineTag && <span className="text-primary font-medium"> · {mineTag}</span>}
                  </>
                ) : onBest ? (
                  <span className="text-primary font-medium">{tie ? c.pair.tieTop(n, nFunds) : c.pair.cheapestStar}</span>
                ) : (
                  c.pair.openTop
                )}
              </span>
            </LongestCase>
            {pairLine(pick)}
            <span className={cx("text-2xl md:text-3xl font-bold leading-tight max-md:min-h-[1.875rem]", figureFit(pc.left.value as number, "tile"))}>
              <Num animate value={pc.left} />
            </span>
            <LongestCase className="text-xs text-muted-foreground" cases={[1, 2, LONGEST_YEARS].map((y) => <span key={y}>{c.pair.left(y)}, {c.pair.leftNote}</span>)}>
              <span>
                {c.pair.left(years)}, {c.pair.leftNote}
              </span>
            </LongestCase>
            {steady(pick.fund)}
          </div>
          {pcOther && other && (
            // the whole card chooses the pair (founder, 2026-11-08: choose by tapping the option itself)
            <PickCard label={`${c.pair.pickCheapest}: ${nameOf(other)}`} onPick={() => onPick(other)} className="md:flex-1 md:min-w-64 min-w-0 p-3 flex flex-col gap-1">
              <LongestCase className="text-sm text-muted-foreground" cases={otherTitles}>
                <span>{otherTitle}</span>
              </LongestCase>
              {pairLine(other)}
              <span className={cx("text-2xl md:text-3xl font-bold leading-tight max-md:min-h-[1.875rem]", figureFit(pcOther.left.value as number, "tile"), !onBest && "text-primary")}>
                <Num animate value={pcOther.left} />
              </span>
              <span className="flex flex-col items-start gap-1 text-sm">
                {/* the gap, held at its longest case, so a tie that comes or goes with a slider moves nothing */}
                <LongestCase className="self-stretch" cases={gapCases}>
                  <span className="block">
                    {onBest ? (
                      <>
                        <Num animate value={gap(pcOther.left, c.pair.input(otherKey, c.pair.colLeft), pc.left, c.pair.input(mineKey, c.pair.colLeft), vsMine)} /> {vsMine}
                      </>
                    ) : tied ? (
                      // the pick is in the tie set: the other pair is not "the cheap one", only the other one
                      <>
                        <Num animate value={moreIfOther!} display={plus} /> {vsMine}
                      </>
                    ) : (
                      <>
                        <Num animate value={moreIfOther!} display={plus} /> {c.pair.moreIfCheapest}
                      </>
                    )}
                  </span>
                </LongestCase>
              </span>
              {steady(other.fund)}
            </PickCard>
          )}
        </div>
        </ShortRow>
        {/* under a tie, why no pair is first: a line of the block's width under both tiles, held whether or not there is a tie (held
            inside the narrow tile it left a 127 px hole on a phone when there was none) */}
        <LongestCase className="text-xs text-muted-foreground md:basis-full" cases={[<p key="t">{c.pair.tieWhy(TIE_MOST)}{tieRule}{restLine(longestPairNames, TIE_MOST - 3)}</p>]}>
          <p>{whyTie}</p>
        </LongestCase>
        {/* the exposure codes, (4D) and the like, said once, where a fund name first carries one, for every code on the page (readers: the
            tiles showed "(4D)" with nothing to say what it is; the list said it again far below, 2026-11-08) */}
        <p className="text-xs text-muted-foreground md:basis-full empty:hidden">
          <ProfileNote names={allFunds(view).map((f) => f.name)} />
        </p>
        {/* the chosen pair's house sells this fund only by phone: one line under the tiles (2026-11-08); the price and the order stay */}
        {phonePick && <p className="text-xs text-muted-foreground md:basis-full">{c.pair.phoneLine(nameOf(pick))}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <LongestCase cases={costTitleCases}>
          <h3 className="font-semibold">{costTitle}</h3>
        </LongestCase>
        {/* one legend for both bars, above them (charts.md); held at the legend of a foreign index, which names the conversion too: an
            Israeli index's legend took a line less on a phone */}
        <LongestCase cases={[<CostLegend key="l" lines={legendLines(false, ["other"])} pick={legendPick} taxName={c.pair.taxLinePayouts} />]}>
          <CostLegend lines={lines} pick={legendPick} current={hasCurrent([...pc.account, ...(pcOther?.account ?? [])])} taxName={taxName} />
        </LongestCase>
        <CostBar who={nameOf(pick)} fund={fundOf(pick)} funds={fundNames} sub={mineRole} pc={pc} taxName={taxName} scale={scale} you={chosen} entered={providerName(view, pick.house)?.custom} today={bundle.today} highlight={legendPick.active} />
        {pcOther && other && <CostBar highlight={legendPick.active} who={nameOf(other)} fund={fundOf(other)} funds={fundNames} sub={otherRole} pc={pcOther} taxName={taxName} scale={scale} entered={providerName(view, other.house)?.custom} today={bundle.today} />}
        {pcOther && (
          // three columns of one width: in a sentence, a number with another digit pushed everything after it (nothing moves when a number changes)
          <div className="flex flex-col gap-2 mt-1" data-gap={gapParts!.join(",")}>
            <LongestCase className="text-sm text-muted-foreground" cases={[c.pair.gapLead, c.pair.gapLeadTie, c.pair.gapLeadCheapest].map((x) => <p key={x}>{x}</p>)}>
              <p>{chosen ? c.pair.gapLead : tie ? c.pair.gapLeadTie : c.pair.gapLeadCheapest}</p>
            </LongestCase>
            <StatRow cols={3}>
              <Stat label={c.pair.gapPart.account}>{gapNum(gapParts![0]!, c.pair.gapPart.account, accountSum(pc, c.pair.gapPart.account, bundle.today, Math.round), accountSum(pcOther, c.pair.gapPart.account, bundle.today, Math.round))}</Stat>
              <Stat label={c.pair.gapPart.fund}>{gapNum(gapParts![1]!, c.pair.gapPart.fund, pc.fund, pcOther.fund)}</Stat>
              {/* more tax with more left: the gain explains it; with a different tax treatment the signs part, and nothing is said. The line keeps its room either way */}
              {/* the exact tax, as the legend names it (docs/copy.md 1; pass 7), held at the longer name so a pick moves nothing */}
              <Stat label={<LongestCase cases={[<span key="p">{c.pair.taxLinePayouts}</span>]}><span>{taxName}</span></LongestCase>} note={<LongestCase cases={[<span key="m">{c.pair.taxBecauseMore}</span>, <span key="l">{c.pair.taxBecauseLess}</span>]}><span>{gapParts![2]! !== 0 && Math.sign(gapParts![2]!) === Math.sign(leftGap) && (gapParts![2]! > 0 ? c.pair.taxBecauseMore : c.pair.taxBecauseLess)}</span></LongestCase>}>
                {gapNum(gapParts![2]!, taxName, pc.tax, pcOther.tax)}
              </Stat>
            </StatRow>
          </div>
        )}
      </div>
    </Card>
  );
}

/** The cost bars' title (charts.md: a finding, not the topic): which of the account's fees, the fund's fee and the tax is the largest part,
 *  in every pair shown or in each, and whether it is most of the cost. */
export function costTitleOf(years: number, pcs: readonly PairCosts[], taxName: string): string {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const largest = pcs.map((pc) => {
    const parts = { account: pc.account.reduce((t, l) => t + n(l.cost), 0) + pc.interaction, fund: n(pc.fund), tax: n(pc.tax) };
    const total = parts.account + parts.fund + parts.tax;
    const [key, v] = (Object.entries(parts) as [keyof typeof parts, number][]).reduce((a, b) => (b[1] > a[1] ? b : a));
    return { key, most: total > 0 && v / total > 0.5 };
  });
  const name = (k: "account" | "fund" | "tax") => (k === "tax" ? taxName : c.pair.costPart[k]);
  const [a, b] = largest;
  if (!a) return "";
  if (!b || a.key === b.key) return c.pair.costTitle(years, name(a.key), a.most && (!b || b.most), !!b);
  return c.pair.costTitleSplit(years, name(a.key), name(b.key));
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
 * A house's group prices, on its row and never in its figure (D43, amended 2026-11-04): one closed line that opens, at the person's own
 * tap, to a sub-row per price. The line belongs to the house, so a re-sort or a new input never changes the row's height.
 */
export function GroupLine({ id, house, snapshots, open, onOpen, choice }: { id: string; house: string; snapshots: WorkbenchBundle["snapshots"]; open: boolean; onOpen: (id: string, open: boolean) => void; choice?: GroupChoice }) {
  const g = snapshots.find((s) => s.id === id)?.groups;
  if (!g || g.state !== "prices") return null;
  // the groups the person can pick are radios in the fold (founder, 2026-11-04), in place of a link to the account panel on every sub-row
  return <GroupPriceFold className="col-start-2 col-end-[-1]" entries={g.entries} house={house} href={brokeragePagePath(id)} open={open} onOpenChange={(o) => onOpen(id, o)} {...(choice ? { choice } : {})} />;
}

/** What the account card says of its house, under its name: what it charges, its labels and its price list. */
export function HouseLine({ house, snapshot, charge }: { house: NonNullable<ReturnType<typeof providerName>>; snapshot: WorkbenchBundle["snapshots"][number] | undefined; charge: ReactNode }) {
  // the house's account on your own terms opens from here, the chosen account's card, not from a line on every row (founder, 2026-11-04);
  // a 44 px target that takes no more height than the words beside it
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
              <a href={sourceHref(snapshot.tariff)} target="_blank" rel="noopener noreferrer" title={snapshot.tariff.title} className="text-link hover:underline">
                {gershayim(c.pair.tariff)} ↗
              </a>
              <span className="text-muted-foreground"> · {c.pair.collectedOn(`\u2066${fmt.date(snapshot.snapshot)}\u2069`)}</span>
            </span>
            <OwnAccountButton houseId={house.id} house={house.short} className="-mx-2 -my-2.5">
              {c.pair.ownPrice}
            </OwnAccountButton>
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

/**
 * The bank where the person already has a current account (D64): that bank's row leaves its current account out, every other bank's row
 * counts it (F-102). The banks are those whose current account costs something a month. The field sits at the bottom of the accounts card,
 * under the list it changes, and what it does is said in its label's "?" (founder, 2026-11-08: "move the your bank to the bottom of the banks
 * section", the line under it "should be a tooltip"). A pick re-sorts the list above with its rows sliding (design-system 2.5a); the list
 * keeps its rows and their heights, so the field under it stays where the hand is.
 */
/** What the own-bank field does, for its "?". A bank whose price list charges nothing for its current account is not in the box: the text
 *  names it, so its row is read as a bank's. */
export const ownBankHelp = (view: InvestView, bundle: WorkbenchBundle): string =>
  c.pair.ownBank.counted(view.providers.filter((p) => !p.custom && bundle.snapshots.some((s) => s.id === p.id && s.current_account && !chargesCurrentAccount(s))).map((p) => p.short).sort((a, b) => a.localeCompare(b, "he")));

export function OwnBankField({ view, bundle, value, onChange }: { view: InvestView; bundle: WorkbenchBundle; value: string | null; onChange: (id: string | null) => void }) {
  const banks = view.providers.filter((p) => bundle.snapshots.some((s) => s.id === p.id && chargesCurrentAccount(s))).sort((a, b) => a.short.localeCompare(b.short, "he"));
  if (banks.length === 0) return null;
  const marked = banks.find((b) => b.id === value) ?? null;
  return (
    <SelectField
      label={c.pair.ownBank.label}
      mark={<HelpMark about={c.pair.ownBank.label} text={ownBankHelp(view, bundle)} />}
      none={c.pair.ownBank.none}
      options={banks.map((b) => ({ id: b.id, name: b.short }))}
      value={marked?.id ?? null}
      onChange={onChange}
    />
  );
}

/**
 * What a price for a fund bought abroad leaves out, said once on the page (D65, D66): a spread the price list does not limit, naming the
 * houses whose lists limit it, and what others abroad charge the house. Only on an index with funds bought abroad, folded, so the list
 * stays near its heading on a phone; `open` is kept by the list, whose held height starts over when it opens or closes.
 */
export function AbroadNotes({ view, bundle, open, onOpenChange }: { view: InvestView; bundle: WorkbenchBundle; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!view.options.some((o) => o.id === "abroad" && o.exists)) return null;
  const limits = (id: string) => bundle.snapshots.some((s) => s.id === id && s.lines.some((l) => l.base === "fx" && typeof l.spread?.value === "number"));
  const capped = view.providers.filter((p) => !p.custom && limits(p.id)).map((p) => p.short).sort((a, b) => a.localeCompare(b, "he"));
  // F-103 (D67): the houses whose price lists print a charge per corporate event abroad, which their figures count on each dividend
  const charge = (id: string) => bundle.snapshots.find((s) => s.id === id)?.lines.find((l) => l.base === "corporate_event" && typeof l.rate.value === "number")?.rate;
  const perDividend = view.providers.flatMap((p) => { const rate = p.custom ? undefined : charge(p.id); return rate ? [{ name: p.short, rate }] : []; }).sort((a, b) => a.name.localeCompare(b.name, "he"));
  return (
    <Disclosure label={c.pair.abroadTitle} open={open} onOpenChange={onOpenChange} labelClassName="text-sm text-link">
      <NoteList
        className="text-xs pb-1"
        items={[
          ...(capped.length > 0 ? [c.pair.abroadSpread(capped)] : []),
          <>
            {c.pair.abroadOthers}
            {perDividend.map((x) => (
              <Fragment key={x.name}>
                {" "}
                <Tpl t={c.pair.abroadPerDividend} vars={{ name: x.name, amount: <Num value={ownBy(x.rate as SiteValue, x.name)} display={fmt.usd(x.rate.value as number)} /> }} />
              </Fragment>
            ))}
          </>,
          // beside what the price of a fund abroad leaves out, not collected at the page's foot (wording.md: a note beside what it qualifies)
          c.foot.sharePrice,
        ]}
      />
    </Disclosure>
  );
}

export function AccountColumn({ view, bundle, years, monthly = 1, pick, onPick, moved = null, group = null, ownBank }: { view: InvestView; bundle: WorkbenchBundle; years: number; /** The plan's monthly deposit: at 0 no purchase runs on a standing order, and the list says so. */ monthly?: number; pick: Pick; onPick: OnPick; /** The tap before changed the fund too. */ moved?: Moved | null; /** The house's group picked in its fold: `pick.house` is then the held account priced at it, and this its house. */ group?: { house: string; key: string; name: string } | null; /** The bank where the person already has a current account, and its setter (D64). */ ownBank?: { value: string | null; onChange: (id: string | null) => void } }) {
  const legendPick = useChartPick();
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44)
  // the houses of the list: a picked group's held account stands beside its house, never as a row of its own (D43)
  const providers = view.providers.filter((p) => !isGroupProvider(p));
  const heldKey = `${view.index.id}:${providers.length}`;
  // a house's group prices open and close at the person's tap: the held height starts over, so a closed fold leaves no hole; an address
  // that names a group opens its house's fold, so the picked radio is in view
  const [openGroups, setOpenGroups] = useState<string[]>(() => (group ? [group.house] : []));
  const onGroup = (id: string, open: boolean) => setOpenGroups((xs) => (open ? (xs.includes(id) ? xs : [...xs, id]) : xs.filter((x) => x !== id)));
  // a grey row's long reason opens at the person's tap, as a house's group prices do: the held height starts over with it
  const [openWhys, setOpenWhys] = useState<string[]>([]);
  const onWhy = (id: string, open: boolean) => setOpenWhys((xs) => (open ? (xs.includes(id) ? xs : [...xs, id]) : xs.filter((x) => x !== id)));
  // the note on what a price abroad leaves out opens at a tap too
  const [abroadOpen, setAbroadOpen] = useState(false);
  const held = useHeldHeight<HTMLDivElement>(`${heldKey}:${openGroups.join()}:${openWhys.join()}:${abroadOpen}`);
  // the rows' cases, laid out unseen, hold heights a plan does not change: kept over a slider's moves, so they are not laid out again on
  // every key (the cases of every state cost about 8 ms a key)
  const casesKept = useRef<{ key: string; byRow: Map<string, NonNullable<PickRow["cases"]>> } | null>(null);
  // every house and every fund the header can name, laid out unseen, so a long one moves nothing above the list
  const longest = useMemo(() => {
    const houses = providers.map((p) => providerName(view, p.id)!);
    // each house's longest group that some fund can be priced at: its line under the house's, inside the same held height
    const pickedOf = (id: string) => {
      const s = bundle.snapshots.find((x) => x.id === id);
      const names = (["il-etf", "abroad"] as const).flatMap((o) => [...pickableGroups(s, o)].map((k) => groupNameOf(s, k)));
      return names.sort((a, b) => b.length - a.length)[0] ?? null;
    };
    return {
      names: houses.map((h) => <span key={h.id} className={cx("block text-xl font-bold [overflow-wrap:anywhere]", h.custom && "text-entered")}><ProviderLink p={h} /></span>),
      lines: houses.map((h) => (
        <span key={h.id} className="flex flex-col gap-1">
          <HouseLine house={h} snapshot={bundle.snapshots.find((s) => s.id === h.id)} charge={<>{c.pair.colCharges(LONGEST_YEARS)}: {fmt.nisWhole(LONGEST_AMOUNT)}</>} />
          {pickedOf(h.id) && <span className="block text-sm text-muted-foreground">{groupPrices.pickedLine(pickedOf(h.id)!)}</span>}
        </span>
      )),
      // laid out as the shown line is, a wrapping tag included: a nowrap case held one line where the shown name took two
      funds: allFunds(view).map((f) => <span key={f.rec.id} className="text-sm flex items-center gap-1.5 max-md:flex-col max-md:items-start md:flex-wrap">{c.pair.accountsCond} <Tag wrap><MixedName>{f.name}</MixedName></Tag></span>),
    };
  }, [heldKey, bundle.snapshots]); // eslint-disable-line react-hooks/exhaustive-deps
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const baseHouse = group?.house ?? pick.house;
  const house = providerName(view, baseHouse);
  if (!fund || !house) return null;
  const best = bestFor(view, pick);
  const theta = tieShareOf(bundle);
  // the account crowned from the tie set of the tiles: the house all its pairs are at, on the row of a pair in the set
  const crownHouse = crownedHouse(view, best, theta);
  const crownHere = !!crownHouse && inTieSet(view, best, { house: crownHouse, fund: pick.fund }, theta);
  // the groups each house offers that change this fund's figure and end after a printed number of months (lib/group-pick)
  const choiceOf = (id: string): GroupChoice | undefined => {
    const can = pickableGroups(bundle.snapshots.find((s) => s.id === id), fund.option);
    if (can.size === 0) return undefined;
    return { can: (k) => can.has(k), selected: group?.house === id ? group.key : null, onChoose: (k) => pickHalf(view, pick, { house: id }, (p, m) => onPick({ ...p, group: k }, m)) };
  };
  // counted over every fund of the index, so the sentence stays as it is when another fund is picked; a count over the collected houses
  const local = providers.filter((p) => !p.foreign && !p.custom);
  // when the price lists in this list were saved: the oldest and the newest day
  const saved = bundle.snapshots.filter((s) => providers.some((p) => p.id === s.id && !p.custom)).map((s) => s.snapshot).sort();
  const standingCount = local.filter((p) => allFunds(view).some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.standing; })).length;
  // what the cost column counts: the standing-order price where one is published, the regular customer's price, and when the price lists
  // were collected (the "?" in its head)
  const chargesHelp = [
    monthly === 0 ? c.pair.noMonthly : standingCount > 0 ? c.pair.standingNote(standingCount, local.length) : "",
    c.pair.whichPrice,
    saved.length > 0 ? c.pair.collectedSpan(`\u2066${fmt.date(saved[0]!)}\u2069`, `\u2066${fmt.date(saved.at(-1)!)}\u2069`) : "",
  ]
    .filter(Boolean)
    .join(" ");
  const rows = providers.map((p) => ({ p, at: fund.byHouse[p.id] }));
  const ok = rows.filter((r): r is { p: typeof r.p; at: WayPrice } => priced(r.at)).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN);
  // the cost figure beside each bar: one width on every row, for the longest amount in the list (a plan typed past the sliders' ends
  // ran "1,527,297,489 ₪" past the card's edge in a fixed 5.5rem)
  const costWidth = `max(5.5rem, ${Math.max(0, ...ok.map((r) => fmt.nisWhole(r.at.accountCost).length))}ch)`;
  const noWay = (r: (typeof rows)[number]) => (r.at && "availability" in r.at && r.at.availability ? r.at.availability : null);
  // every house keeps a row: what cannot be priced is grey, "no data" first and "not possible there" last (founder, 2026-10-31)
  const missing = rows.filter((r) => !priced(r.at)).sort((a, b) => Number(!!noWay(a)) - Number(!!noWay(b)) || a.p.short.localeCompare(b.p.short, "he"));
  const scale = barScale(ok.map((r) => r.at.accountCost));
  // the places: within the tie threshold of the first, a row shares the first place; equal figures share a place (P-01, F-80)
  const ranked = ok.filter((r) => !r.at.open);
  const places = placesOf(ranked.map((r) => r.at.valueN), theta);
  const placeOf = new Map(ranked.map((r, i) => [r.p.id, places[i]!]));
  const sharedTop = firstCount(places) > 1;
  const lines = legendLines(!!view.index.israeli, ok.flatMap((r) => r.at.lines.map((l) => lineOf(l.line))));
  // the lines any fund of the index has at any house, for the legend's held height
  const allLines = allFunds(view).flatMap((f) => Object.values(f.byHouse).flatMap((a) => (priced(a) ? a.lines.map((l) => lineOf(l.line)) : [])));
  const legendItems = (ls: string[], broken: boolean, current = true) => [
    { id: "remainder", swatch: <Swatch shape="box" className="bg-chart-cost-other" />, label: c.pair.remainder },
    ...ls.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: legendName(l, current) })),
    ...(broken ? [{ id: "broken", label: c.pair.broken }] : []),
  ];
  const snapshot = bundle.snapshots.find((s) => s.id === baseHouse);
  const at = fund.byHouse[pick.house];
  // the way back names the account it goes back to: held at the longest name a row can carry
  const longestShort = providers.map((p) => p.short).sort((a, b) => b.length - a.length)[0] ?? "";
  type Prov = (typeof providers)[number];
  // a house that sells a fund at a standing-order price keeps the tag's room whichever fund and plan (a monthly 0 and back moves nothing)
  const standingSomewhere = (id: string) => allFunds(view).some((f) => { const a = f.byHouse[id]; return priced(a) && a.standing; });
  // a house that sells some fund of the index only by phone keeps the tag's room whichever fund is picked (2026-11-08)
  const phoneSomewhere = (id: string) => allFunds(view).map((f) => phoneOf(view, bundle, { house: id, fund: f.rec.id })).find((v) => v) ?? null;
  /**
   * A priced row's cells; `unseen`: one of the row's cases, laid out to hold its height (PickList): every tag that can stand on many rows
   * at once (the tie, on a computer), and the one-per-list marks it is laid out with: the cheapest's star, the way back after a tap.
   */
  const pricedCells = (p: Prov, wp: WayPrice, unseen?: { crown: boolean; back: boolean; tie: boolean }) => {
    const parts: CostPart[] = [remainderPart(wp.interaction), ...byLegend(wp.lines).map((l) => ({ id: l.line, legendId: lineOf(l.line), name: partName(l.line), value: l.cost, className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", source: p.custom ? c.pair.sourceEntered : c.pair.sourceList(p.short) }))];
    const isYours = p.id === view.yourBroker;
    // shown on the row whether or not it is picked, so a pick never adds or removes a line (founder, 2026-10-27)
    const place = placeOf.get(p.id);
    const tiedTop = unseen ? unseen.tie && !unseen.crown : sharedTop && place === 1;
    const isBest = unseen ? unseen.crown : crownHere && crownHouse === p.id && !tiedTop;
    const phone = unseen ? phoneSomewhere(p.id) : phoneOf(view, bundle, { house: p.id, fund: fund.rec.id });
    return (
      // a row whose figure what is left or what it costs is a billion or more writes both in the short form on a phone (fresh readers, round 3)
      <ShortRow when={shortRow(wp.valueN, wp.accountCost)}>
        <span className="text-sm text-muted-foreground tabular-nums text-center">{wp.open ? "—" : place}</span>
        <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", (isYours || p.custom) && "text-entered")}>
          {p.short}
          {/* one line reserved on every row, so a re-sort never changes a row's height (2026-10-31) */}
          <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal text-muted-foreground">
            {isYours && <span>{c.pair.yoursTag}</span>}
            {isBest && <span className="font-medium text-primary">{c.pair.cheapestTag}</span>}
            {/* on a phone the two equal places say it alone: the word beside a standing-order price wrapped the row to a second line */}
            {tiedTop && <span className="font-medium text-primary max-md:hidden">{c.pair.tieTag}</span>}
            {/* the tap on this account changed the fund too: said on the row tapped, with the way back (a 44 px target in the line's height) */}
            {/* unseen, it is held too, on one row at a time: the row a tap turns from grey to priced is the one that carries it */}
            {unseen ? unseen.back && <AlsoChanged what={c.pair.movedFund} back={c.pair.moveBackTo(longestShort)} onBack={() => undefined} /> : p.id === baseHouse && moved?.half === "fund" && moved.back && <AlsoChanged what={c.pair.movedFund} back={c.pair.moveBackTo(providerName(view, moved.prev.house)?.short ?? moved.prev.house)} onBack={backFrom(moved, p.id)} />}
            {(unseen ? standingSomewhere(p.id) : wp.standing && monthly > 0) && <span>{c.pair.standingTag}</span>}
            {phone && <SourcedTag value={phone}>{c.pair.phoneTag}</SourcedTag>}
          </span>
        </span>
        {/* a narrow list (a phone, or this panel beside the funds on a computer) gives the bar a line of its own under the name, so it is wide enough to compare (2026-11-04) */}
        <span className="flex items-center gap-2 min-w-0 @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
          <CostStack size="sm" parts={parts} total={accountWhole(wp)} scale={scale} highlight={legendPick.active} label={`${p.short}: ${fmt.nisWhole(wp.accountCost)}`} />
          {/* one width on every row, for the longest amount: a longer figure would shorten its own bar, and the bars share one scale */}
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap" style={{ width: costWidth }}>
            <Num animate value={wp.cost(`${p.short}: ${c.pair.colChargesShort}`)} />
          </span>
        </span>
        <span className={cx("col-end-[-1] text-end font-semibold", figureFit(wp.valueN))}>
          <Num animate value={wp.value} />
        </span>
        <GroupLine id={p.id} house={p.short} snapshots={bundle.snapshots} open={openGroups.includes(p.id)} onOpen={onGroup} choice={choiceOf(p.id)} />
        {p.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={p.id} /></span>}
      </ShortRow>
    );
  };
  /** A grey row's cells for a fund with no price at the house: the reason the house's record gives for it. */
  const greyCells = (p: Prov, f: FundWay, unseen = false) => {
    const a = f.byHouse[p.id];
    const na = a && "availability" in a && a.availability ? a.availability : null;
    const other = otherWay(view, p.id);
    return (
      <>
        <span className="text-sm tabular-nums text-center">—</span>
        <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", p.custom && "text-entered")}>
          {p.short}
          <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal">{p.id === view.yourBroker && <span>{c.pair.yoursTag}</span>}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 text-xs @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
          <Tag tone={na ? undefined : "caution"}>{na ? c.pair.notPossible : c.pair.noData}</Tag>
          {na && !p.custom && (
            <a href={sourceHref(na.source)} target="_blank" rel="noopener noreferrer" title={na.note ?? na.source.title} className="text-link hover:underline">
              {c.pair.notPossibleSource} ↗
            </a>
          )}
        </span>
        <span className="col-end-[-1] text-end font-semibold">—</span>
        {/* the reason takes the row's width, like the group line: in the charges column it stood one word to a line (2026-10-31) */}
        <span className="col-start-2 col-end-[-1] flex flex-col gap-0.5 text-xs leading-snug">
          {na && p.custom && <span>{c.customEntries.notSold}</span>}
          {/* the reason in words on the row, never only in a link's title (nothing depends on hover) */}
          {/* two lines of it, the rest at a tap: a record's nine-line reason made the list's tallest state about 450 px taller on a phone */}
          {!(na && p.custom) && (
            <ClampedText open={!unseen && openWhys.includes(p.id)} onOpenChange={(o) => onWhy(p.id, o)} more={c.pair.reasonMore} less={c.pair.reasonLess}>
              {whyNoPrice(bundle, p.id, f)}
            </ClampedText>
          )}
          {/* what a tap on the row does, in words alone: a row with no data shows no figure (readers: "אין נתון" beside "נשארים 84,172 ₪"
              read as a value for this account); the fund it names changes with the plan, held at every fund the house prices (18 px) */}
          {other && (
            <LongestCase cases={waysOf(view, p.id).map((w) => <span key={w.fund.rec.id}>{c.pair.elsewhere} <MixedName>{w.fund.name}</MixedName>.</span>)}>
              <span>
                {c.pair.elsewhere} <MixedName>{other.fund.name}</MixedName>.
              </span>
            </LongestCase>
          )}
        </span>
        <GroupLine id={p.id} house={p.short} snapshots={bundle.snapshots} open={openGroups.includes(p.id)} onOpen={onGroup} choice={choiceOf(p.id)} />
        {p.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={p.id} /></span>}
      </>
    );
  };
  // the state a house's row takes with a fund: priced, or grey with the reason its record gives (the list holds its tallest state over the
  // index's funds, so a pick of another fund moves nothing below it; #190: picking a fund abroad grew the list by 377 px on a phone)
  const stateOf = (p: Prov, f: FundWay) => {
    const a = f.byHouse[p.id];
    return priced(a) ? "priced" : `grey|${a && "availability" in a && a.availability ? "na" : ""}|${whyNoPrice(bundle, p.id, f)}`;
  };
  // over the funds that can be picked (a fund priced nowhere for its own reason has no row to pick: its state never comes); the fund on
  // the screen first, so a state's case is laid out with it where it can be
  const pickable = [fund, ...allFunds(view).filter((f) => f !== fund && Object.keys(f.byHouse).length > 0)];
  // a house's grey rows: a tap on one moves the fund too, and the row tapped carries the way back in the state it brings
  const greySomewhere = (id: string) => pickable.some((f) => !priced(f.byHouse[id])) && otherWay(view, id) !== null;
  // every state of the row, the one on the screen included, each measured the same way (PickList): a priced state plain, and with each
  // mark that can come to it: the star where the house can rank (any plan can make it the cheapest), the way back where a tap can bring it
  const casesOf = (p: Prov): NonNullable<PickRow["cases"]> => {
    const out: NonNullable<PickRow["cases"]> = [];
    const seen = new Set<string>();
    for (const f of pickable) {
      const k = stateOf(p, f);
      if (seen.has(k)) continue;
      seen.add(k);
      if (k !== "priced") {
        out.push({ key: k, cells: greyCells(p, f, true) });
        continue;
      }
      const ways = pickable.flatMap((x) => { const a = x.byHouse[p.id]; return priced(a) ? [a] : []; });
      const way = ways[0]!;
      const crown = ways.some((a) => !a.open && !isGroupPrice(a));
      const back = greySomewhere(p.id);
      for (const [cr, bk] of [[false, false], [true, false], [false, true], [true, true]] as const) {
        if ((cr && !crown) || (bk && !back)) continue;
        out.push({ key: k, cells: pricedCells(p, way, { crown: cr, back: bk, tie: crown }), marks: [...(cr ? ["crown"] : []), ...(bk ? ["back"] : [])] });
      }
    }
    return out;
  };
  const states = pickable.map((f) => Object.fromEntries(providers.map((p) => [p.id, stateOf(p, f)])));
  const casesKey = [view.index.id, fund.rec.id, view.yourBroker ?? "", openGroups.join(), openWhys.join(), group?.key ?? "", ...providers.map((p) => p.id).sort(), ...pickable.map((f) => f.rec.id).sort()].join("|");
  if (casesKept.current?.key !== casesKey) casesKept.current = { key: casesKey, byRow: new Map(providers.map((p) => [p.id, casesOf(p)])) };
  const casesFor = (p: Prov) => casesKept.current!.byRow.get(p.id) ?? casesOf(p);
  const pickRows: PickRow[] = ok.map((r) => ({
    key: r.p.id,
    selected: r.p.id === baseHouse,
    onSelect: () => pickHalf(view, pick, { house: r.p.id }, onPick),
    cells: pricedCells(r.p, r.at),
    caseKey: "priced",
    cases: casesFor(r.p),
  }));
  const greyRows: PickRow[] = missing.map((r) => {
    const other = otherWay(view, r.p.id);
    return {
      key: r.p.id,
      selected: r.p.id === baseHouse,
      muted: true,
      // a house with no way on this index has nothing to show as a pair: its row stays, with the reason
      onSelect: () => {
        if (other) pickHalf(view, pick, { house: r.p.id }, onPick);
      },
      cells: greyCells(r.p, fund),
      caseKey: stateOf(r.p, fund),
      cases: casesFor(r.p),
    };
  });
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{c.pair.accountSlot}</span>
        <LongestCase cases={longest.names}>
          <span className={cx("block text-xl font-bold [overflow-wrap:anywhere]", house.custom && "text-entered")}>
            <ProviderLink p={house} />
          </span>
        </LongestCase>
        <LongestCase cases={longest.lines}>
          <span className="flex flex-col gap-1">
          <HouseLine
            house={house}
            snapshot={snapshot}
            charge={
              priced(at) && (
                <>
                  {c.pair.colCharges(years)}: <Num animate value={at.cost(c.pair.colCharges(years))} />
                </>
              )
            }
          />
          {/* the picked group's line: the held height counts each house's longest group, so picking one moves nothing below */}
          {group && <span className="block text-sm text-muted-foreground">{groupPrices.pickedLine(group.name)}</span>}
          </span>
        </LongestCase>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-0.5">
        <h3 className="font-semibold">{c.pair.accounts}</h3>
        <LongestCase cases={longest.funds}>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5 max-md:flex-col max-md:items-start md:flex-wrap">
            {c.pair.accountsCond} <Tag wrap><MixedName>{fund.name}</MixedName></Tag>
          </span>
        </LongestCase>
        {/* on lines of their own, kept whatever the fund's name: a longer name pushed the hint to a new line, and the page with it */}
        <span className="text-sm text-muted-foreground">{c.pair.accountsHint}</span>
        <AbroadNotes view={view} bundle={bundle} open={abroadOpen} onOpenChange={setAbroadOpen} />
      </div>
      {/* one legend for the list, above it (charts.md); held at every item a fund of the index or a plan can bring (a line only some funds
          have, a broken bar), so a pick moves nothing (24 px) */}
      <div className="px-5 pb-2">
        <LongestCase cases={[<ChartLegend key="l" pick={legendPick} items={legendItems(legendLines(!!view.index.israeli, allLines), true)} />]}>
          <ChartLegend pick={legendPick} items={legendItems(lines, ok.some((r) => r.at.accountCost > scale), ok.some((r) => hasCurrent(r.at.lines)))} />
        </LongestCase>
      </div>
      <div className="@container">
      <PickList
        label={c.pair.listLabelAccounts}
        holdKey={view.index.id}
        columns="1.5rem 9.5rem minmax(0,1fr) 7.5rem"
        phoneColumns="1.25rem minmax(0,1fr) 6.5rem"
        head={
          <>
            <span>#</span>
            <span>{c.pair.colAccount}</span>
            {/* over the bar and its figure, wherever the bar is: beside the name, or on a line of its own under it in a narrow list */}
            {/* which price each row counts, said in the head's "?", not in sentences above the list (design.md: tables) */}
            <span className="@max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1] @max-2xl:pt-1">
              <LeadTail lead={`${c.pair.colCharges(years)} `}>
                <HelpMark about={c.pair.colCharges(years)} text={chargesHelp} />
              </LeadTail>
            </span>
            <span className="text-end col-end-[-1] row-start-1">
              {/* the "?" holds to the head's last word: on a computer's narrow column it fell onto a line of its own (layout check, 2026-11-08) */}
              <LeadTail lead={`${c.pair.colLeftHead(years)} `}>
                <HelpMark about={c.pair.colLeftHead(years)} text={c.pair.colLeftHelp} />
              </LeadTail>
            </span>
          </>
        }
        rows={[...pickRows, ...greyRows]}
        states={states}
      />
      </div>
      <div className="px-5 py-3 flex flex-col gap-4">
        <AddEntryButton kind="broker" />
        {ownBank && <OwnBankField view={view} bundle={bundle} value={ownBank.value} onChange={ownBank.onChange} />}
      </div>
    </Card>
  );
}


// ---------------------------------------------------------------- the fund column

const FILTER_FAMILIES = new Set<Label["family"]>(["trade", "follow", "currency", "payout", "held"]);
/** The fund rests on an open rule at some house: its row keeps room for the tag at every house. */
const openSomewhere = (f: FundWay) => Object.values(f.byHouse).some((x) => priced(x) && x.open);

const mayaHrefOf = (f: FundWay) => {
  // Maya's page of the fund exists for a fund listed in Israel
  return !isCustomFund(f.rec) && (f.option === "il-etf" || f.option === "il-tracking") && f.rec.identifiers.tase_number ? mayaFundHref(f.rec.identifiers.tase_number) : null;
};

/** The fund's labels: how it trades (the type, from its option; a foreign fund, where it is listed, since the same fund can have a row for each), then what the record says about it. */
const labelsOf = (view: InvestView, f: FundWay, bundle: WorkbenchBundle): Label[] => [f.option === "tase-foreign" ? optionLabels(f.option)[0]! : optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!, ...fundLabels(f.rec, indexSeenBy(view.index, f.rec, bundle), f.option)];

/** What a fund's gap cell shows (F-92): a compared gap against a net or gross index, years not compared, or no years. */
export type GapState = "net" | "gross" | "unstated" | "gross-apart" | "none";

/** F-92 (d) the state of one fund's cell on its list; "gross-apart": a gross index the fund is not fairly measured against there. */
export function gapStateOf(rec: FundWay["rec"], list: GapList): GapState {
  if (gapUnstated(rec, list)) return rec.tracking_record!.benchmark.dividends === "gross" ? "gross-apart" : "unstated";
  if (!gapOf(rec, list) || !rec.fees.tracking_difference_12m) return "none";
  return rec.tracking_record!.benchmark.dividends === "gross" ? "gross" : "net";
}

/**
 * The kind of index the compared gaps of a list are measured against, said once in the column's head and the note under the list (re-check
 * F1, F5: "מול מדד נטו" under every figure repeated a label true of every row); "mixed" only when a list truly mixes; null with none compared.
 */
export function gapKindOf(states: readonly GapState[]): "net" | "gross" | "mixed" | null {
  const kinds = new Set(states.filter((x): x is "net" | "gross" => x === "net" || x === "gross"));
  return kinds.size === 0 ? null : kinds.size > 1 ? "mixed" : [...kinds][0]!;
}

/**
 * F-92 (a) the gap as its sheet shows it: the report's own figures for each year, and the document that says whether the index is net or
 * gross, at its page (every number traces to its source; re-check F1: that link sat under every figure); null with no compared gap.
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
  // the same report as the years' is cited once for all three (re-check F4: one citation per sheet); another document, at its page
  const sameDoc = doc.url === (td as SiteValue).source.url;
  const kindDoc = sameDoc ? (td as SiteValue).source : { ...doc, ...(page ? { page, locator_he: c.kinds.gapPage(page) } : {}) };
  const kindValue = { ...(td as SiteValue), value: c.kinds.gapKindWord[state], unit: "text", source: kindDoc, checked: rec.tracking_record.checked, notes: undefined } as SiteValue;
  inputs[c.kinds.gapInputKind] = doc.strength === "institution" ? ownBy(kindValue, rec.manager) : kindValue;
  // the returns are in shekels in an Israeli fund's annual report, in the fund's own currency in a foreign issuer's documents
  const israeli = rec.domicile === "IL" && !isCustomFund(rec);
  // Mor's footnote only where A-07 is floored at 0: above the floor the variable fee charged cancels out of the forward cost (F-92 (b), pass 7)
  const lead = c.kinds.gapLead(state, israeli ? c.kinds.currencyIn.ILS! : (c.kinds.currencyIn[rec.currency] ?? c.kinds.currencyInOther), israeli, g.years, !!rec.tracking_record.variable_positive_only && paybackMayLower(rec, list));
  // the head says what the row says, in full (recheck 3 M2; pass 5 readers: "בשנה" alone hid how many years): one year is that year's
  // difference, "ב־2025"; more years, the yearly mean and how many, "בשנה · 3 שנים"
  const year = rec.tracking_record.years[0]?.year;
  return computed(Math.round(g.pct * 100) / 100, g.years === 1 ? "pct" : "pct_per_year", "F-92", inputs, { today, about: c.kinds.gapHead[state], lead, signed: true, unitText: c.kinds.gapYears(g.years, year) });
}

/** The note under the gap column: a sentence for each state the list shows and none for the others (re-check F5, pass 3 readers). */
export function gapNoteOf(recs: readonly FundWay["rec"][], states: readonly GapState[]): string {
  const israeliNone = (i: number) => states[i] === "none" && recs[i]!.domicile === "IL" && !isCustomFund(recs[i]!);
  return c.funds.gapNote({
    kind: gapKindOf(states),
    unstated: states.filter((x) => x === "unstated").length,
    grossApart: states.includes("gross-apart"),
    funds: states.length,
    noYear: states.filter((_, i) => israeliNone(i)).length,
    notCollected: states.filter((x, i) => x === "none" && !israeliNone(i)).length,
  });
}

/** F-92 (a) in a row: the gap with its sign, and the years it rests on; the document that says what the index is opens from its sheet. */
export function GapCell({ rec, today, list }: { rec: FundWay["rec"]; today: string; /** F-92 (d): the list the fund is compared on (`gapListFor`). */ list: GapList }) {
  const state = gapStateOf(rec, list);
  // on a phone the cell sits under the fund's name with no column head above it, so it says what it is
  const head = <span className="md:hidden text-xs font-normal text-muted-foreground">{c.kinds.gapPhoneHead}</span>;
  // a word in place of a figure stands where the figure would, at the figure's size (re-check F4: "לא מושווה" sat lower and smaller)
  const note = (words: string) => (
    <span className="flex flex-col leading-tight">
      <span className="text-sm text-muted-foreground">
        {head}
        {words}
      </span>
    </span>
  );
  // F-92 (d): an index of unstated kind, or a gross one the fund is not fairly measured against on this list: no gap stands beside the others
  if (state === "unstated" || state === "gross-apart") return note(c.kinds.gapUnstated);
  const g = gapOf(rec, list);
  const val = gapValue(rec, list, today);
  // "no full year" is what an Israeli fund's annual report says; a foreign or typed fund's years were never read, which says nothing about its age
  if (!g || !val) return note(rec.domicile === "IL" && !isCustomFund(rec) ? c.kinds.gapNone : c.kinds.gapNotCollected);
  return (
    <span className="flex flex-col leading-tight">
      <span className="font-semibold">
        {head}
        <Num value={val} display={`\u2066${signedPct(g.pct, 2)}\u2069`} />
      </span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.kinds.gapYears(g.years, rec.tracking_record?.years[0]?.year)}</span>
    </span>
  );
}

/** The exposure profiles in the list's fund names, (4D) and the like, each in plain words, with the term that opens its glossary line (ETF-12). */
function ProfileNote({ names }: { names: string[] }) {
  const w = c.pair.profile;
  const codes = [...new Set(names.flatMap((n) => [...n.matchAll(/\((\d[0A-F])\)/g)].map((m) => m[1]!)))].filter((x) => w.equity[x[0]!] && w.currency[x[1]!]).sort();
  if (codes.length === 0) return null;
  return (
    <span>
      {w.lead} <Term id="פרופיל חשיפה">{w.term}</Term>. {codes.map((x) => w.code(x, `${w.equity[x[0]!]} ${w.currency[x[1]!]}`)).join(". ")}.
    </span>
  );
}

/** The picked fund's name and number, its fees, and its kind and manager: the fund card's three lines above the list. */
function FundName({ fund }: { fund: FundWay }) {
  return (
    <span className="flex items-baseline gap-2 flex-wrap">
      <span className={cx("text-lg font-bold", isCustomFund(fund.rec) ? "text-entered [overflow-wrap:anywhere]" : "md:whitespace-nowrap")}>
        <MixedName>{fund.name}</MixedName>
      </span>
      <ProductIdLink id={fund.number} href={mayaHrefOf(fund)} label={brands.funds.mayaLink(fund.number)} />
    </span>
  );
}
function FundFees({ fund, bundle }: { fund: FundWay; bundle: WorkbenchBundle }) {
  return (
    <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
      {c.pair.colFees}: <Fees rec={fund.rec} inline priced={pricedVariable(fund.rec, gapListFor(bundle, fund.rec), bundle.today)} />
      {/* a foreign fund's "אין" and "לא נאסף" in place of a fee: said in a "?" beside them (wording.md: a note beside what it qualifies) */}
      {fund.rec.domicile !== "IL" && !isCustomFund(fund.rec) && <HelpMark about={c.pair.colFees} text={c.funds.feeWordsNote} />}
      {fund.rec.distribution && (
        <span>
          {c.pair.colYield}: <Num value={ownBy(fund.rec.distribution.yield as SiteValue, fund.rec.manager)} size="inline" />
        </span>
      )}
    </span>
  );
}
function FundKind({ fund }: { fund: FundWay }) {
  return (
    <span className="flex flex-wrap gap-1.5 items-center">
      <OptionTag option={fund.option} />
      {fund.rec.manager && <span className="text-xs text-muted-foreground">{c.funds.manager}: <MixedName>{fund.rec.manager}</MixedName></span>}
    </span>
  );
}

export function FundColumn({ view, bundle, plan, today, pick, chosen = true, onPick, moved = null, filter, onFilter }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; today: string; pick: Pick; /** The person picked this pair; else it is the page's own, and the list never calls its fund their choice. */ chosen?: boolean; onPick: OnPick; /** The tap before changed the account too. */ moved?: Moved | null; filter: string | null; onFilter: (id: string | null) => void }) {
  const funds = allFunds(view);
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44)
  const heldKey = `${view.index.id}:${funds.length}`;
  const held = useHeldHeight<HTMLDivElement>(heldKey);
  // every fund and house the header can name, laid out unseen, so a long one moves nothing above the list
  const longest = useMemo(
    () => ({
      names: funds.map((f) => <FundName key={f.rec.id} fund={f} />),
      fees: funds.map((f) => <FundFees key={f.rec.id} fund={f} bundle={bundle} />),
      kinds: funds.map((f) => <FundKind key={f.rec.id} fund={f} />),
      houses: view.providers.map((p) => <span key={p.id} className="text-sm flex flex-wrap items-center gap-1.5">{c.pair.fundsCond} <Tag>{p.short}</Tag></span>),
    }),
    [heldKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const kinds = hasKinds(view) && !!bundle.dollarRange;
  const range = bundle.dollarRange;
  const pickRec = funds.find((f) => f.rec.id === pick.fund)?.rec;
  const mine: Kind = pickRec ? kindOf(pickRec) : "unhedged";
  // a row of the other kind: its difference from the pick runs over the dollar's range (F-94), from the dollar's fall to its rise; each
  // difference is the row's pair less the pick's at the same end of P-02's range, the two figures its sheet opens
  const cross = useMemo(() => {
    const out = new Map<string, { atLo: number; atHi: number; lo: SiteValue; hi: SiteValue }>();
    if (!kinds || !range || !pickRec) return out;
    const bound = { lo: dollarBound(bundle, "lo"), hi: dollarBound(bundle, "hi") };
    const at = (f: { id: string; name: string }, end: "lo" | "hi") => pairValueFigure({ bundle, index: view.index, plan, fundId: f.id, providerId: pick.house, fxChange: range[end], about: f.name, dollarChange: bound[end] });
    const pickName = funds.find((f) => f.rec.id === pick.fund)?.name ?? pick.fund;
    const pLo = at({ id: pick.fund, name: pickName }, "lo"), pHi = at({ id: pick.fund, name: pickName }, "hi");
    if (!pLo || !pHi) return out;
    const pickKey = c.pair.input(`${chosen ? c.pair.chosen : c.pair.marked}, ${pickName}`, c.pair.colLeft);
    const gap = (v: SiteValue, name: string, p: SiteValue) => differenceOf([c.pair.input(name, c.pair.colLeft), v], [pickKey, p], "F-94", { today, about: c.pair.colDiff, round: Math.round });
    for (const f of funds) {
      if (kindOf(f.rec) === mine || !priced(f.byHouse[pick.house])) continue;
      const lo = at({ id: f.rec.id, name: f.name }, "lo"), hi = at({ id: f.rec.id, name: f.name }, "hi");
      if (lo && hi) out.set(f.rec.id, { atLo: (lo.value as number) - (pLo.value as number), atHi: (hi.value as number) - (pHi.value as number), lo: gap(lo, f.name, pLo), hi: gap(hi, f.name, pHi) });
    }
    return out;
  }, [kinds, range, bundle, view, plan, pick.fund, pick.house, mine, chosen, today]); // eslint-disable-line react-hooks/exhaustive-deps -- `funds` is the view's
  const fund = funds.find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  // the page's own pick inside a tie of the tiles (F-80, P-01) is one of the tied, not the site's winner (pass 5 readers: "3 pairs are
  // tied", then "בחירת האתר" on one of them); the number of pairs the tiles count
  const tieBest = bestFor(view, pick);
  const tiedFunds = chosen ? [] : tieFunds(view, tieBest, tieShareOf(bundle));
  const tieN = chosen ? 0 : tieFundCount(view, tieBest, tieShareOf(bundle));
  const markedTie = tieN > 1 && inTieSet(view, tieBest, pick, tieShareOf(bundle)) ? tieN : 0;
  // the other tied funds' rows say so too, under their figure, so the rows marked are the funds counted (independent check of pass 5)
  const tiedHere = (fundId: string) => markedTie > 0 && fundId !== pick.fund && tiedFunds.includes(fundId);
  // F-92: each fund's list and cell state over every fund on the index (not the filter's rows, so a filter moves nothing)
  const gapLists = new Map(funds.map((f) => [f.rec.id, gapListFor(bundle, f.rec)]));
  const gapStates = funds.map((f) => gapStateOf(f.rec, gapLists.get(f.rec.id)!));
  const gapKind = gapKindOf(gapStates);
  // what the gap column says, and the words that stand in place of a figure: its head's "?" (a sentence under the list said it, design.md)
  const gapHelp = gapNoteOf(funds.map((f) => f.rec), gapStates);
  if (!fund || !house) return null;
  const selAt = fund.byHouse[pick.house];
  const allLabelsBy = new Map(funds.map((f) => [f.rec.id, labelsOf(view, f, bundle)]));
  // D60: a label true of every fund of a group shows once, in the group's head (the kinds' groups), or in one line over a list with no
  // groups, and leaves the rows; over every fund on the index, not the filter's rows, so a filter moves nothing
  const groupOf = (f: FundWay) => (kinds ? kindOf(f.rec) : "all");
  const groupShared = new Map<string, Label[]>();
  for (const g of new Set(funds.map(groupOf))) groupShared.set(g, sharedLabels(funds.filter((f) => groupOf(f) === g).map((f) => allLabelsBy.get(f.rec.id)!)));
  const labelsBy = new Map(funds.map((f) => [f.rec.id, allLabelsBy.get(f.rec.id)!.filter((l) => !groupShared.get(groupOf(f))!.some((x) => x.id === l.id))]));
  const listShared = kinds ? [] : (groupShared.get("all") ?? []);
  const rowsAt = (houseId: string) => funds.map((f) => ({ f, at: f.byHouse[houseId], labels: labelsBy.get(f.rec.id)! }));
  const rows = rowsAt(pick.house);
  // the labels that split the list: some funds have them, some do not
  // each label counts funds, not rows: the same fund in Tel Aviv and abroad is one (pass 7: iShares counted twice in "מחזיקה את המניות 2")
  const fundKey = (r: (typeof rows)[number]) => r.f.rec.identifiers?.isin ?? r.f.rec.id;
  const carriersOf = new Map<string, { label: Label; funds: Set<string> }>();
  for (const r of rows) for (const l of allLabelsBy.get(r.f.rec.id)!) {
    const at = carriersOf.get(l.id) ?? { label: l, funds: new Set<string>() };
    at.funds.add(fundKey(r));
    carriersOf.set(l.id, at);
  }
  const counts = new Map([...carriersOf].map(([id, x]) => [id, { label: x.label, count: x.funds.size }]));
  const fundTotal = new Set(rows.map(fundKey)).size;
  // a label that is exactly one group says what the group's head says, so it leaves the filter too (D60); by membership, so a group of one
  // fund counts (pass 5 S3: the hedged group's one fund kept its "מנוטרלת מט״ח 1" in the filter, its labels being its row's, not shared)
  const carriers = (id: string) => funds.filter((f) => allLabelsBy.get(f.rec.id)!.some((l) => l.id === id));
  const isOneGroup = (id: string) => kinds && [...groupShared.keys()].some((g) => {
    const members = funds.filter((f) => groupOf(f) === g), has = carriers(id);
    return has.length === members.length && has.every((f) => groupOf(f) === g);
  });
  // only what the fund is (its type, how it tracks, its currency, what it pays out, where it is held); the tax and paperwork labels are read, not filtered on
  const options = [...counts.values()].filter((x) => x.count > 0 && x.count < fundTotal && FILTER_FAMILIES.has(x.label.family) && !isOneGroup(x.label.id));
  const active = filter && options.some((x) => x.label.id === filter) ? filter : null;
  const order = (r: (typeof rows)[number]) => (priced(r.at) ? (r.at.open ? 1 : 0) : 2);
  const kindRank = (r: (typeof rows)[number]) => (kinds && kindOf(r.f.rec) === "hedged" ? 1 : 0);
  // the list at an account: the filter's rows (the pick always among them), by kind, then priced first, then what each leaves
  const sortedAt = (list: typeof rows) =>
    list.filter((r) => !active || allLabelsBy.get(r.f.rec.id)!.some((l) => l.id === active) || r.f.rec.id === pick.fund).sort((a, b) => kindRank(a) - kindRank(b) || order(a) - order(b) || (priced(b.at) ? b.at.valueN : 0) - (priced(a.at) ? a.at.valueN : 0));
  const shown = sortedAt(rows);
  // every order the list takes, one per account a pick can bring, so a phone's fold holds the tallest rows of any (it held the rows of
  // the order the page opened in, and the first pick after a link moved what lies below by 233 px)
  const opensGroup = (list: typeof rows, i: number) => kinds && (i === 0 || kindOf(list[i - 1]!.f.rec) !== kindOf(list[i]!.f.rec));
  const orders: FoldOrder[] = view.providers.map((p) => {
    const list = sortedAt(rowsAt(p.id));
    return {
      keys: list.map((r) => r.f.rec.id),
      headings: new Set(list.filter((_, i) => opensGroup(list, i)).map((r) => r.f.rec.id)),
      choosable: new Set(list.filter((r) => priced(r.at)).map((r) => r.f.rec.id)),
      keep: new Set(list.filter((r) => isCustomFund(r.f.rec)).map((r) => r.f.rec.id)),
    };
  });
  const cur = view.index.exposure?.currency ?? "USD";
  const names = view.index.exposure?.other_currencies === true ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  // a fund listed in Tel Aviv and abroad is a row each, and each of its rows names the other (independent check of pass 5)
  const twinOf = (f: FundWay) => {
    const isin = f.rec.identifiers?.isin;
    return isin ? (funds.find((x) => x !== f && x.rec.identifiers?.isin === isin) ?? null) : null;
  };
  const colDiff = chosen ? c.pair.colDiff : c.pair.colDiffMarked;
  const diff = (n: number, name: string, value: SiteValue, sel: SiteValue) => nis(n, "F-65", colDiff, today, { [c.pair.input(name, c.pair.colLeft)]: value, [c.pair.input(`${chosen ? c.pair.chosen : c.pair.marked}, ${fund.name}`, c.pair.colLeft)]: sel });
  // what a row's last cell can say at any account, laid out unseen in it: the row keeps one height whichever account is picked (a
  // pick sorted taller rows into a phone's folded list, and every section below moved)
  const longestHouse = view.providers.map((p) => p.short).sort((a, b) => b.length - a.length)[0] ?? "";
  const sampleGap = nis(LONGEST_AMOUNT, "F-65", c.pair.colDiff, today);
  const rightCases = (f: FundWay) => [
    <span key="c" className="text-sm">{c.pair.chosen}</span>,
    <span key="m" className="text-sm">{c.pair.marked}</span>,
    <span key="t" className="text-sm">{c.pair.markedTie(TIE_MOST)}</span>,
    <AlsoChanged key="a" stack className="text-xs" what={c.pair.movedHouse(longestHouse)} back={c.pair.moveBackTo(longestHouse)} onBack={() => undefined} />,
    <span key="d" className="font-semibold"><Num value={sampleGap} display={plus} /></span>,
    <span key="dt" className="flex flex-col items-end">
      <span className="font-semibold"><Num value={sampleGap} display={plus} /></span>
      <span className="text-xs text-muted-foreground">{c.pair.markedTie(TIE_MOST)}</span>
    </span>,
    ...(kinds && range
      ? [
          <span key="x" className="flex flex-col items-end gap-0.5 text-sm">
            <span className="block font-semibold">
              <span className="block whitespace-nowrap">{c.kinds.between} <Num value={sampleGap} display={plus} /></span>
              <span className="block whitespace-nowrap">{c.kinds.and}<Num value={sampleGap} display={plus} /></span>
            </span>
            <span className="text-xs text-muted-foreground text-end">{c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}</span>
          </span>,
        ]
      : []),
    ...(Object.values(f.byHouse).some((a) => !priced(a))
      ? [
          <span key="n" className="flex flex-col items-end text-xs">
            {c.pair.noPriceAt.missing(longestHouse)}
            <span className="text-end">{c.pair.pickMoves(longestHouse)}</span>
          </span>,
        ]
      : []),
  ];
  const pickRows: PickRow[] = shown.map((r, i) => {
    const at = r.at;
    const isSel = r.f.rec.id === pick.fund;
    const k = kindOf(r.f.rec);
    const heading = opensGroup(shown, i) ? (
      <span className="flex flex-wrap items-center gap-1.5">
        <Swatch shape="box" className={k === "hedged" ? "bg-chart-kind-hedged" : "bg-chart-kind-unhedged"} />
        {/* no count: the rows are in view (founder, 2026-11-08: "remove the fund count"); the chips are what every fund of the group shares */}
        {names[k]}
        {(groupShared.get(k) ?? []).length > 0 && <> · {c.kinds.allOf}</>}
        {(groupShared.get(k) ?? []).map((l) => (
          <LabelChip key={l.id} label={l} />
        ))}
      </span>
    ) : undefined;
    const x = cross.get(r.f.rec.id);
    const shortOf = (id: string) => providerName(view, id)?.short ?? id;
    const right = isSel ? (
      moved?.half === "house" && moved.back ? (
        // the tap on this fund moved the account: said on the row tapped, with the way back
        <AlsoChanged stack className="text-xs" what={c.pair.movedHouse(shortOf(pick.house))} back={c.pair.moveBackTo(shortOf(moved.prev.house))} onBack={backFrom(moved, r.f.rec.id)} />
      ) : (
        <span className="text-sm text-muted-foreground">{chosen ? c.pair.chosen : markedTie ? c.pair.markedTie(markedTie) : c.pair.marked}</span>
      )
    ) : x && range ? (
      <span className="flex flex-col items-end gap-0.5 text-sm">
        {/* a line per figure, never wrapped: a plan typed past the sliders' ends gave an eight-digit figure a third line */}
        <span className={cx("block font-semibold", figureFit(Math.max(Math.abs(x.atLo), Math.abs(x.atHi))))}>
          <ShortRow when={shortRow(x.atLo, x.atHi)}>
            <span className="block whitespace-nowrap">{c.kinds.between} <Num animate value={x.lo} display={plus} /></span>
            <span className="block whitespace-nowrap">{c.kinds.and}<Num animate value={x.hi} display={plus} /></span>
          </ShortRow>
        </span>
        <span className="text-xs text-muted-foreground text-end">{c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}</span>
      </span>
    ) : priced(at) && priced(selAt) ? (
      // a size down as the digits grow, as the account list's figure: a plan of a thousand billion ran 4 px past the list at 390 px
      <span className="flex flex-col items-end">
        <span className={cx("font-semibold", figureFit(at.valueN - selAt.valueN))}>
          <Num animate value={diff(at.valueN - selAt.valueN, r.f.name, at.value, selAt.value)} display={plus} />
        </span>
        {tiedHere(r.f.rec.id) && <span className="text-xs text-muted-foreground">{c.pair.markedTie(markedTie)}</span>}
      </span>
    ) : (
      <span className="flex flex-col items-end text-xs text-muted-foreground">
        {noPriceLine(bundle, pick.house, r.f, shortOf(pick.house))}
        {/* said before the tap: picking it moves the account to the house where it leaves the most */}
        {!r.f.reason && r.f.best && r.f.best.providerId !== pick.house && <span className="text-end">{c.pair.pickMoves(shortOf(r.f.best.providerId))}</span>}
      </span>
    );
    // a fund priced nowhere says why on its row, the same at every house; the reasons that depend on the house are under the list, once each (2026-10-31)
    const why = !r.at && r.f.reason ? reasonText(r.f.reason, optionClass[r.f.option]) : null;
    const mineTyped = isCustomFund(r.f.rec);
    return {
      key: r.f.rec.id,
      // the fold counts funds: the same fund in Tel Aviv and abroad is a row each and one fund (pass 7)
      countAs: r.f.rec.identifiers?.isin ?? r.f.rec.id,
      ...(mineTyped ? { keep: true } : {}),
      ...(heading ? { heading } : {}),
      selected: isSel,
      muted: !priced(at),
      onSelect: () => {
        if (!why) pickHalf(view, pick, { fund: r.f.rec.id }, onPick);
      },
      cells: (
        <>
          <span className="flex flex-col gap-1.5 min-w-0">
            {/* the name wraps inside its own column and the identifier moves to the next line whole: a long name run unwrapped across the
                columns, under the note a pick brings to the row's end (19 px over "החשבון עבר ל…" at 1440) */}
            <span className={cx("leading-snug", mineTyped && "[overflow-wrap:anywhere]")}>
              <span className={cx("font-semibold", mineTyped && "text-entered")}>
                <MixedName>{r.f.name}</MixedName>
              </span>{" "}
              <span className="inline-block ms-1" onClick={(e) => e.stopPropagation()}>
                <ProductIdLink id={r.f.number} href={mayaHrefOf(r.f)} label={brands.funds.mayaLink(r.f.number)} />
              </span>
            </span>
            <span className="label-strip flex md:flex-wrap gap-1.5 max-md:pb-0.5" onClick={(e) => e.stopPropagation()}>
              {r.labels.map((l) => (
                <LabelChip key={l.id} label={l} />
              ))}
            </span>
            {/* why the row stands below the ranked ones, on a line of its own so a phone's scrolling label strip never hides it (pass 7: the
                reason was only in a legend elsewhere); held on every row of a fund that rests on an open rule at some house, unseen where it
                does not here: a pick that moved the tag in or out grew the row and moved every section below */}
            {openSomewhere(r.f) && (
              <span className={cx("flex", priced(at) && at.open ? undefined : "invisible")}>
                <Tag wrap tone="blocked" icon={<IconLock size={14} />}>
                  {c.pair.openRow}
                </Tag>
              </span>
            )}
            {why && <span className="text-xs text-muted-foreground">{why}</span>}
            {twinOf(r.f) && <span className="text-xs text-muted-foreground">{c.pair.sameFundAs(twinOf(r.f)!.number, twinOf(r.f)!.option === "abroad")}</span>}
            {mineTyped && <FundTerms id={r.f.rec.id} />}
          </span>
          {/* on a phone the gap goes under the fund's name and the difference stays at the row's end; with no compared gap on the list
              the column is left out and the note says so once */}
          {gapKind && (
            <span className="self-center max-md:row-start-2 max-md:col-start-2">
              <GapCell rec={r.f.rec} today={today} list={gapLists.get(r.f.rec.id)!} />
            </span>
          )}
          <LongestCase className="text-end self-center max-md:row-start-1 max-md:col-start-3 *:flex *:flex-col *:items-end" cases={rightCases(r.f)}>
            {right}
          </LongestCase>
        </>
      ),
    };
  });
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{c.pair.fundSlot}</span>
        <LongestCase cases={longest.names}><FundName fund={fund} /></LongestCase>
        <LongestCase cases={longest.fees}><FundFees fund={fund} bundle={bundle} /></LongestCase>
        <LongestCase cases={longest.kinds}><FundKind fund={fund} /></LongestCase>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold">{c.pair.funds(view.index.name)}</h3>
          <LongestCase cases={longest.houses}>
            <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
              {c.pair.fundsCond} <Tag>{house.short}</Tag>
            </span>
          </LongestCase>
          <span className="text-sm text-muted-foreground">{c.pair.fundsHint}</span>
          {listShared.length > 0 && (
            <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
              {c.pair.fundsShared}
              {listShared.map((l) => (
                <LabelChip key={l.id} label={l} />
              ))}
            </span>
          )}
        </div>
        <LabelFilter lead={c.pair.filter} allLabel={c.pair.clearFilter} value={active} onChange={onFilter} options={options} />
      </div>
      <PickList
        label={c.pair.listLabelFunds}
        columns={gapKind ? "minmax(0,1fr) 6rem 10.5rem" : "minmax(0,1fr) 10.5rem"}
        // a fixed width on a phone too: each row is its own grid, and an "auto" column as wide as its own figure wrapped the fund's name
        // differently on every row and at every plan
        phoneColumns="minmax(0,1fr) 8.5rem"
        phoneLimit={6}
        more={c.pair.moreFunds}
        head={
          <>
            {/* what the gap says, its words in place of a figure ("לא מושווה", "אין שנה מלאה") in its head's "?" (design.md: tables); on a phone,
                where the gap sits under each fund's name with no column of its own, the "?" stands beside the fund head */}
            <span>
              {c.pair.colFund}
              {gapKind && (
                <span className="md:hidden">
                  {" · "}
                  <LeadTail lead={c.kinds.gapPhoneHead.trim()}>
                    <HelpMark about={c.kinds.gapPhoneHead.trim()} text={gapHelp} />
                  </LeadTail>
                </span>
              )}
            </span>
            {/* the kind of index every compared gap is measured against, once (re-check F1, F5) */}
            {gapKind && (
              <span className="max-md:hidden">
                <LeadTail lead={gapKind === "mixed" ? c.kinds.colGap : c.kinds.gapHead[gapKind]}>
                  <HelpMark about={gapKind === "mixed" ? c.kinds.colGap : c.kinds.gapHead[gapKind]} text={gapHelp} />
                </LeadTail>
              </span>
            )}
            {/* one height for both heads: before a pick the selected row is the page's own, never "the choice" */}
            <LongestCase className="text-end" cases={[<span key="c">{c.pair.colDiff} ?</span>, <span key="m">{c.pair.colDiffMarked} ?</span>]}>
              <span>
                <LeadTail lead={colDiff}>
                  <HelpMark about={colDiff} text={c.funds.diffHelp(kinds, !!gapKind)} />
                </LeadTail>
              </span>
            </LongestCase>
          </>
        }
        rows={pickRows}
        orders={orders}
        holdKey={view.index.id}
      />
      <div className="px-5 py-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <AddEntryButton kind="fund" />
        {active && <span>{c.pair.shown(new Set(shown.map(fundKey)).size, fundTotal)}</span>}
        {kinds && <span>{c.funds.kindsNote}</span>}
        {/* with no gap column there is no head to hold its "?": the list says why there is none (design.md: say what the site can't answer) */}
        {!gapKind && <span>{gapHelp}</span>}
      </div>
    </Card>
  );
}

