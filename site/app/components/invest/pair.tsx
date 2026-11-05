// The index page as two linked lists (founder, 2026-10-27; spec research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account
// and a fund. The account list prices every account with the chosen fund, the fund list prices every fund at the chosen account;
// neither list leaves anything out (a row that cannot be priced stays, with its reason). Above them, the result: what is put in, what
// is left, and what it costs, split by who takes it: the person's pair and the cheapest one above each other, or, on the cheapest pair,
// the next one beside it (one shape, so a pick never resizes the block).
import { mayaFundHref } from "../../lib/sources";
import { useMemo, useState, type ReactNode } from "react";
import { isTie, type FeeLine } from "@finance-tool/engine";
import { brands, groupPrices, invest as c } from "../../copy";
import { isCustomFund } from "../../lib/custom-entries";
import { brokeragePagePath, doubtOf, firstCount, placesOf, tieShareOf, gapOf, indexSeenBy, inputMap, hasKinds, kindOf, opensOn, pairCosts, pairValue, type FundWay, type InvestView, type Kind, type PairCosts, type Reason, type WayPrice } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { brokerLabels, fundLabels, optionLabels, type Label } from "../../lib/labels";
import { computed, ownBy, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { MixedName, Button, Card, ChartLegend, CostStack, FeeWordsNote, LabelChip, LabelFilter, LabelRow, LongestCase, PickList, ProductIdLink, Sentence, Stat, StatRow, Swatch, Tag, cx, GroupPriceFold, useChartPick, type ChartPick, useHeldHeight, type CostPart, type GroupChoice, type PickRow } from "../kit";
import { groupNameOf, isGroupPrice, isGroupProvider, pickableGroups } from "../../lib/group-pick";
import { optionClass, OptionTag, reasonText } from "./parts";
import { ProviderLink, providerName } from "./sections";
import { Fees } from "./funds";
import { AddEntryButton, BrokerTerms, FundTerms } from "./custom-entries";
import { OwnAccountButton } from "./own-account";
import { StateTag } from "../provenance";

export interface Pick {
  house: string;
  fund: string;
  /** A group of the house picked in its fold (`group:<n>`): the pair is priced at that group's prices, beside the ranking (D43). */
  group?: string;
}

export const lineClass: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };
export const lineOf = (line: FeeLine) => (line in lineClass ? line : "other");
/** A legend names every account line whichever row or pair is shown, in one order, so its items keep their places from one pick to the next.
 * An index in shekels has no conversion line to name. */
export const legendLines = (israeli: boolean, used: readonly string[]) => [...Object.keys(lineClass).filter((l) => l !== "fx" || !israeli), ...(used.includes("other") ? ["other"] : [])];
/** A computed shekel figure of this page, whole shekels (the totals and gaps the bars and lists show). */
export const nis = (n: number, formula: string, about: string, today: string, inputs: Record<string, SiteValue> = {}): SiteValue => computed(Math.round(n), "nis", formula, inputs, { today, about });
/** A gain shown with its plus sign, isolated so it reads "+2,621 ₪" inside Hebrew. */
const plus = (n: number) => (n > 0 ? `\u2066+${fmt.nisWhole(n)}\u2069` : undefined);
const priced = (x: WayPrice | { reason: Reason } | undefined): x is WayPrice => !!x && "valueN" in x;

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

/** A house's way that leaves the most: a ranked one first, else one on an open rule, which is shown and not ranked. Its row names it when the picked fund has no price there. */
function otherWay(view: InvestView, house: string): { fund: FundWay; at: WayPrice } | null {
  const ways = allFunds(view).flatMap((f) => { const at = f.byHouse[house]; return priced(at) && !isGroupPrice(at) ? [{ fund: f, at }] : []; });
  return ways.sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN)[0] ?? null;
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
  /** The pair before the tap, to go back to. */
  prev: Pick;
  /** The pair the tap made. */
  at: Pick;
  /** The half that changed without being tapped. */
  half: "house" | "fund";
}
export type OnPick = (p: Pick, moved?: Moved) => void;
/** Pick one half; when the other half has to change with it, say which. */
export function pickHalf(view: InvestView, cur: Pick, change: Partial<Pick>, onPick: OnPick) {
  const next = repick(view, cur, change);
  const half = change.house ? (next.fund !== cur.fund ? "fund" : null) : next.house !== cur.house ? "house" : null;
  onPick(next, half ? { prev: { house: cur.house, fund: cur.fund }, at: next, half } : undefined);
}
/** "ל" before a Hebrew name, "ל־" before a Latin one. */
const toName = (name: string) => `${/^[A-Za-z]/.test(name) ? "ל־" : "ל"}${name}`;

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

function partsOf(pc: PairCosts, from: string): CostPart[] {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const account = pc.account.map((l) => ({ id: l.line, legendId: lineOf(l.line), name: c.pair.lines[lineOf(l.line)] ?? c.pair.lines.other, value: n(l.cost), className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", inside: true as const, source: from }));
  // the account's remainder no single line explains is part of what it takes, so the bar holds the whole cost (F-91)
  return [...account, { id: "remainder", name: c.pair.remainder, about: c.pair.remainderAbout, value: pc.interaction, className: "bg-chart-cost-other", inside: true as const, source: c.pair.sourceComputed }, { id: "fund", name: c.pair.fundLine, value: n(pc.fund), className: "bg-chart-cost-fund", inside: true as const, source: c.pair.sourceFund }, { id: "tax", name: c.pair.taxLine, value: n(pc.tax), className: "bg-chart-tax", inside: true as const, source: c.pair.sourceTax }];
}
/** Whole shekels that add up to `target` (by default the rounded sum; largest remainder): a sentence of parts never disagrees with its total. */
export function wholeParts(xs: number[], target = Math.round(xs.reduce((a, x) => a + x, 0))): number[] {
  const out = xs.map((x) => Math.floor(x));
  const order = xs.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r);
  let left = target - out.reduce((a, x) => a + x, 0);
  for (let k = 0; left > 0; k++, left--) out[order[k % xs.length]!.i]! += 1;
  for (let k = order.length - 1; left < 0; k--, left++) out[order[((k % xs.length) + xs.length) % xs.length]!.i]! -= 1;
  return out;
}
const totalOf = (parts: CostPart[]) => parts.reduce((a, p) => a + p.value, 0);

function CostLegend({ lines, pick }: { lines: string[]; pick: ChartPick<string> }) {
  const groupHead = (text: string) => ({ id: `g-${text}`, label: <span className="text-foreground font-medium">{text}</span> });
  return (
    <ChartLegend
      pick={pick}
      items={[
        groupHead(c.pair.who.account),
        ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: c.pair.lines[l] ?? c.pair.lines.other })),
        { id: "remainder", swatch: <Swatch shape="box" className="bg-chart-cost-other" />, label: c.pair.remainder },
        groupHead(c.pair.who.fund),
        { id: "fund", swatch: <Swatch shape="box" className="bg-chart-cost-fund" />, label: c.pair.fundLine },
        groupHead(c.pair.who.state),
        { id: "tax", swatch: <Swatch shape="box" className="bg-chart-tax" />, label: c.pair.taxLine },
      ]}
    />
  );
}

function CostBar({ who, fund, sub, pc, scale, you, entered, today, highlight }: { who: string; /** The fund's name: two bars of one house differ by the fund, and say so (2026-11-05). */ fund: string; sub: string; pc: PairCosts; scale: number; highlight: string | null; you?: boolean; /** The person typed this account (D44). */ entered?: boolean; today: string }) {
  const parts = partsOf(pc, entered ? c.pair.sourceEntered : c.pair.sourceList(who));
  // shown as the rounded base less the rounded value left: two bars then differ by exactly what the two "left" figures differ by
  const total = Math.round(pc.base) - Math.round(pc.left.value as number);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[15rem_minmax(0,1fr)_6rem] items-center gap-x-3 gap-y-1.5">
      {/* three lines on every bar, whichever pair: whose pair it is, the account, the fund */}
      <span className="flex flex-col min-w-0 leading-tight">
        <span className="text-xs text-muted-foreground">
          {sub}
          {entered && ` · ${c.customEntries.enteredWord}`}
        </span>
        <span className={cx("truncate font-semibold", (you || entered) && "text-entered")}>{who}</span>
        <span className="truncate text-xs text-muted-foreground">
          <MixedName>{fund}</MixedName>
        </span>
      </span>
      <div className="min-w-0 max-md:col-span-2 max-md:row-start-2">
        <CostStack parts={parts} scale={scale} highlight={highlight} label={`${who}: ${fmt.nisWhole(total)}`} />
      </div>
      <span className="text-end font-semibold">
        <Num value={nis(total, "F-91", who, today, { [c.pair.input(who, c.pair.colLeft)]: pc.left })} />
      </span>
    </div>
  );
}

/** The pair beside the best one when the person is on it: the next that leaves the most, over every ranked fund at every house of the same kind (hedged or not) as the best one. */
function runnerUp(view: InvestView, best: Pick): Pick | null {
  const bestRec = allFunds(view).find((f) => f.rec.id === best.fund)?.rec;
  const pairs = allFunds(view)
    .filter((f) => !bestRec || opensOn(f.rec) === opensOn(bestRec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open && !isGroupPrice(at) && !(house === best.house && f.rec.id === best.fund) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])));
  const top = pairs.sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : null;
}

/** What a priced pair leaves (its ranked figure), or null. */
const valueOfPair = (view: InvestView, p: Pick): number | null => {
  const at = allFunds(view).find((f) => f.rec.id === p.fund)?.byHouse[p.house];
  return priced(at) ? at.valueN : null;
};
/**
 * The best pair is crowned only when the next one is outside the site's tie threshold (P-01, F-80; 2026-11-05: a pair 43 ₪ ahead,
 * 0.05%, took the star). Within it the two share the top, and no star is drawn.
 */
export function crowned(view: InvestView, best: Pick | null, theta: number): boolean {
  if (!best) return false;
  const next = runnerUp(view, best);
  const a = valueOfPair(view, best);
  const b = next ? valueOfPair(view, next) : null;
  return a !== null && (b === null || !isTie(a, b, theta));
}

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
  const steady = (fund: string) => !view.index.israeli && <span className="text-xs text-muted-foreground min-h-[1lh] max-md:min-h-[2lh]">{onSteadyDollar(fund) ? (view.index.custom ? c.pair.steadyIndexCurrency : c.pair.steadyDollar) : ""}</span>;
  const years = plan.years;
  const months = 12 * plan.years;
  const lines = legendLines(!!view.index.israeli, [...pc.account, ...(pcOther?.account ?? [])].map((l) => lineOf(l.line)));
  // a gap names its two inputs by whose they are, as the figure's sheet lists them
  const gap = (a: SiteValue, aName: string, b: SiteValue, bName: string, about: string) => nis((a.value as number) - (b.value as number), "F-65", about, bundle.today, { [aName]: a, [bName]: b });
  // the two pairs within the site's tie threshold share the top: no star, and the card says why (P-01, F-80)
  const tied = !!pcOther && isTie(pc.left.value as number, pcOther.left.value as number, tieShareOf(bundle));
  const otherRole = onBest ? c.pair.next : c.pair.cheapest;
  // the first pair's name: the person's pick, or, before any pick, the page's own pair, which is the cheapest when there is one
  // within the tie threshold the first pair is not "the cheapest": it is the first of two
  const mineRole = chosen ? c.pair.yours : onBest ? (tied ? c.pair.firstPair : c.pair.cheapest) : c.pair.openTop;
  const vsMine = chosen ? c.pair.vsYours : tied ? c.pair.vsFirst : c.pair.vsCheapest;
  const parts = partsOf(pc, "");
  const scale = Math.max(totalOf(parts), pcOther ? totalOf(partsOf(pcOther, "")) : 0);
  const sumAccount = (x: PairCosts) => x.account.reduce((a, l) => a + (l.cost.value as number), 0) + x.interaction;
  // the three parts of the gap, rounded so they add up to the gap between the two shown values left (F-91: the costs add up to it exactly)
  const shownLeft = (x: PairCosts) => Math.round(x.left.value as number);
  const gapParts = pcOther ? wholeParts([sumAccount(pc) - sumAccount(pcOther), (pc.fund.value as number) - (pcOther.fund.value as number), (pc.tax.value as number) - (pcOther.tax.value as number)], shownLeft(pcOther) - shownLeft(pc)) : null;
  const leftGap = pcOther ? (pc.left.value as number) - (pcOther.left.value as number) : 0;
  const gapNum = (n: number, about: string, a: SiteValue, b: SiteValue) =>
    n === 0 ? (
      c.pair.gapNone
    ) : (
      <>
        <Num value={nis(Math.abs(n), "F-91", about, bundle.today, { [c.pair.input(mineRole, about)]: a, [c.pair.input(otherRole, about)]: b })} /> {n > 0 ? c.pair.gapMore : c.pair.gapLess}
      </>
    );
  const nameOf = (p: Pick) => providerName(view, p.house)?.short ?? p.house;
  const fundOf = (p: Pick) => allFunds(view).find((f) => f.rec.id === p.fund)?.name ?? p.fund;
  // each tile names its pair on one line of its own: the account and the fund (2026-11-05: the tiles named neither)
  const pairLine = (p: Pick) => (
    <span className="text-sm text-muted-foreground md:truncate max-md:line-clamp-2 max-md:min-h-[2lh]">
      <MixedName>{nameOf(p)}</MixedName> · <MixedName>{fundOf(p)}</MixedName>
    </span>
  );
  const otherTitle = onBest ? c.pair.next : tied ? c.pair.cheapest : c.pair.cheapestStar;
  const moreIfOther = pcOther ? gap(pcOther.left, c.pair.input(otherRole, c.pair.colLeft), pc.left, c.pair.input(mineRole, c.pair.colLeft), c.pair.moreIfCheapest) : null;
  return (
    <Card pad="roomy" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-stretch md:gap-x-6">
        {/* one width for the longest case: another digit in the months or the amount moved the two cards beside it */}
        <div className="flex flex-col gap-0.5 md:w-72 md:shrink-0">
          <span className="text-sm text-muted-foreground">{c.pair.paidIn}</span>
          <span className="text-2xl md:text-3xl font-bold leading-tight">
            <Num animate value={pc.paidIn} />
          </span>
          <span className="text-xs text-muted-foreground">{c.pair.paidInNote(months)}</span>
        </div>
        <span aria-hidden="true" className="hidden md:inline text-2xl text-muted-foreground self-center">
          ←
        </span>
        <div className="grid grid-cols-2 gap-3 md:contents">
          {/* the person's colour only on the person's pick (blue is for what they entered or chose) */}
          <div className={cx("md:flex-1 md:min-w-64 min-w-0 rounded-lg border p-3 flex flex-col gap-0.5", chosen ? "border-entered bg-entered/10" : "border-primary")}>
            <span className="text-sm text-muted-foreground max-md:min-h-[2lh]">
              {chosen ? (
                <>
                  {c.pair.yours}
                  {onBest && <span className="text-primary font-medium"> · {tied ? c.pair.tieWithNext : c.pair.cheapestTag}</span>}
                </>
              ) : onBest ? (
                <span className="text-primary font-medium">{tied ? c.pair.tieTop : c.pair.cheapestStar}</span>
              ) : (
                c.pair.openTop
              )}
            </span>
            {pairLine(pick)}
            <span className="text-2xl md:text-3xl font-bold leading-tight">
              <Num animate value={pc.left} />
            </span>
            <span className="text-xs text-muted-foreground">
              {c.pair.left(years)}, {c.pair.leftNote}
            </span>
            {steady(pick.fund)}
          </div>
          {pcOther && other && (
            <div className="md:flex-1 md:min-w-64 min-w-0 rounded-lg border border-border p-3 flex flex-col gap-1">
              <span className="text-sm text-muted-foreground max-md:min-h-[2lh]">{otherTitle}</span>
              {pairLine(other)}
              <span className={cx("text-2xl md:text-3xl font-bold leading-tight", !onBest && "text-primary")}>
                <Num animate value={pcOther.left} />
              </span>
              {/* the button on a line of its own: beside the figure, another digit moved it from under the finger */}
              <span className="flex flex-col items-start gap-1 text-sm">
                {/* two lines held for the tie's words, so a tie that comes or goes with a slider moves nothing */}
                <span className="min-h-[2lh]">
                  {onBest ? (
                    <>
                      <Num animate value={gap(pcOther.left, c.pair.input(otherRole, c.pair.colLeft), pc.left, c.pair.input(mineRole, c.pair.colLeft), vsMine)} /> {vsMine}
                    </>
                  ) : (
                    <>
                      <Num animate value={moreIfOther!} display={plus} /> {c.pair.moreIfCheapest}
                    </>
                  )}
                  {tied && <span className="block text-xs text-muted-foreground">{c.pair.tieWhy}</span>}
                </span>
                <Button variant="quiet" onClick={() => onPick(other)}>
                  {c.pair.pickCheapest}
                </Button>
              </span>
              {steady(other.fund)}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{c.pair.costTitleBoth(years)}</h3>
        <CostBar who={nameOf(pick)} fund={fundOf(pick)} sub={mineRole} pc={pc} scale={scale} you={chosen} entered={providerName(view, pick.house)?.custom} today={bundle.today} highlight={legendPick.active} />
        {pcOther && other && <CostBar highlight={legendPick.active} who={nameOf(other)} fund={fundOf(other)} sub={onBest ? c.pair.next : c.pair.cheapest} pc={pcOther} scale={scale} entered={providerName(view, other.house)?.custom} today={bundle.today} />}
        <CostLegend lines={lines} pick={legendPick} />
        {pcOther && (
          // three columns of one width: in a sentence, a number with another digit pushed everything after it (nothing moves when a number changes)
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-sm text-muted-foreground">{chosen ? c.pair.gapLead : tied ? c.pair.gapLeadFirst : c.pair.gapLeadCheapest}</p>
            <StatRow cols={3}>
              <Stat label={c.pair.gapPart.account}>{gapNum(gapParts![0]!, c.pair.gapPart.account, nis(sumAccount(pc), "F-91", c.pair.gapPart.account, bundle.today), nis(sumAccount(pcOther), "F-91", c.pair.gapPart.account, bundle.today))}</Stat>
              <Stat label={c.pair.gapPart.fund}>{gapNum(gapParts![1]!, c.pair.gapPart.fund, pc.fund, pcOther.fund)}</Stat>
              {/* more tax with more left: the gain explains it; with a different tax treatment the signs part, and nothing is said. The line keeps its room either way */}
              <Stat label={c.pair.gapPart.tax} note={<span className="block min-h-[1lh]">{gapParts![2]! !== 0 && Math.sign(gapParts![2]!) === Math.sign(leftGap) && (gapParts![2]! > 0 ? c.pair.taxBecauseMore : c.pair.taxBecauseLess)}</span>}>
                {gapNum(gapParts![2]!, c.pair.gapPart.tax, pc.tax, pcOther.tax)}
              </Stat>
            </StatRow>
          </div>
        )}
      </div>
    </Card>
  );
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
            <a href={snapshot.tariff.url} target="_blank" rel="noopener noreferrer" title={snapshot.tariff.title} className="text-link hover:underline">
              {c.pair.tariff} ↗
            </a>
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
/** The most years a plan's sliders give, for a sentence's unseen longest case. */
export const LONGEST_YEARS = 40;

export function AccountColumn({ view, bundle, years, pick, onPick, moved = null, group = null }: { view: InvestView; bundle: WorkbenchBundle; years: number; pick: Pick; onPick: OnPick; /** The tap before changed the fund too. */ moved?: Moved | null; /** The house's group picked in its fold: `pick.house` is then the held account priced at it, and this its house. */ group?: { house: string; key: string; name: string } | null }) {
  const legendPick = useChartPick();
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44)
  // the houses of the list: a picked group's held account stands beside its house, never as a row of its own (D43)
  const providers = view.providers.filter((p) => !isGroupProvider(p));
  const heldKey = `${view.index.id}:${providers.length}`;
  // a house's group prices open and close at the person's tap: the held height starts over, so a closed fold leaves no hole; an address
  // that names a group opens its house's fold, so the picked radio is in view
  const [openGroups, setOpenGroups] = useState<string[]>(() => (group ? [group.house] : []));
  const onGroup = (id: string, open: boolean) => setOpenGroups((xs) => (open ? (xs.includes(id) ? xs : [...xs, id]) : xs.filter((x) => x !== id)));
  const held = useHeldHeight<HTMLDivElement>(`${heldKey}:${openGroups.join()}`);
  // every house and every fund the header can name, laid out unseen, so a long one moves nothing above the list (issue 160)
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
      funds: allFunds(view).map((f) => <span key={f.rec.id} className="text-sm flex items-center gap-1.5 max-md:flex-col max-md:items-start md:flex-wrap">{c.pair.accountsCond} <Tag><MixedName>{f.name}</MixedName></Tag></span>),
    };
  }, [heldKey, bundle.snapshots]); // eslint-disable-line react-hooks/exhaustive-deps
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const baseHouse = group?.house ?? pick.house;
  const house = providerName(view, baseHouse);
  if (!fund || !house) return null;
  const best = bestFor(view, pick);
  const theta = tieShareOf(bundle);
  const crown = crowned(view, best, theta);
  // the groups each house offers that change this fund's figure and end after a printed number of months (lib/group-pick)
  const choiceOf = (id: string): GroupChoice | undefined => {
    const can = pickableGroups(bundle.snapshots.find((s) => s.id === id), fund.option);
    if (can.size === 0) return undefined;
    return { can: (k) => can.has(k), selected: group?.house === id ? group.key : null, onChoose: (k) => pickHalf(view, pick, { house: id }, (p, m) => onPick({ ...p, group: k }, m)) };
  };
  // counted over every fund of the index, so the sentence stays as it is when another fund is picked; a count over the collected houses
  const local = providers.filter((p) => !p.foreign && !p.custom);
  const standingCount = local.filter((p) => allFunds(view).some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.standing; })).length;
  const rows = providers.map((p) => ({ p, at: fund.byHouse[p.id] }));
  const ok = rows.filter((r): r is { p: typeof r.p; at: WayPrice } => priced(r.at)).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN);
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
  const snapshot = bundle.snapshots.find((s) => s.id === baseHouse);
  const at = fund.byHouse[pick.house];
  const pickRows: PickRow[] = ok.map((r, i) => {
    const parts: CostPart[] = [...r.at.lines.map((l) => ({ id: l.line, legendId: lineOf(l.line), name: c.pair.lines[lineOf(l.line)] ?? c.pair.lines.other, value: l.cost, className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", source: r.p.custom ? c.pair.sourceEntered : c.pair.sourceList(r.p.short) })), { id: "remainder", name: c.pair.remainder, about: c.pair.remainderAbout, value: r.at.interaction, className: "bg-chart-cost-other", source: c.pair.sourceComputed }];
    const isYours = r.p.id === view.yourBroker;
    // shown on the row whether or not it is picked, so a pick never adds or removes a line (founder, 2026-10-27)
    const isBest = crown && best?.house === r.p.id && best.fund === pick.fund;
    const place = placeOf.get(r.p.id);
    const tiedTop = sharedTop && place === 1;
    return {
      key: r.p.id,
      selected: r.p.id === baseHouse,
      onSelect: () => pickHalf(view, pick, { house: r.p.id }, onPick),
      cells: (
        <>
          <span className="text-sm text-muted-foreground tabular-nums text-center">{r.at.open ? "—" : place}</span>
          <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", (isYours || r.p.custom) && "text-entered")}>
            {r.p.short}
            {/* one line reserved on every row, so a re-sort never changes a row's height (2026-10-31) */}
            <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal text-muted-foreground">
              {isYours && <span>{c.pair.yoursTag}</span>}
              {isBest && <span className="font-medium text-primary">{c.pair.cheapestTag}</span>}
              {tiedTop && <span className="font-medium text-primary">{c.pair.tieTag}</span>}
              {/* the tap on this account changed the fund too: said on the row tapped, with the way back (a 44 px target in the line's height) */}
              {r.p.id === baseHouse && moved?.half === "fund" && (
                <span className="text-foreground">
                  {c.pair.movedFund}{" "}
                  <button type="button" onClick={() => onPick(moved.prev)} className="text-link underline underline-offset-[3px] hover:no-underline min-h-target -my-3 px-1">
                    {c.pair.moveBack}
                  </button>
                </span>
              )}
              {r.at.standing && <span>{c.pair.standingTag}</span>}
            </span>
          </span>
          {/* a narrow list (a phone, or this panel beside the funds on a computer) gives the bar a line of its own under the name, so it is wide enough to compare (2026-11-04) */}
          <span className="flex items-center gap-2 min-w-0 @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
            <CostStack size="sm" parts={parts} scale={scale} highlight={legendPick.active} label={`${r.p.short}: ${fmt.nisWhole(r.at.accountCost)}`} />
            {/* one width on every row, for the longest amount: a longer figure would shorten its own bar, and the bars share one scale */}
            <span className="w-[4.75rem] shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              <Num animate value={nis(r.at.accountCost, "F-63", `${r.p.short}: ${c.pair.colChargesShort}`, bundle.today)} />
            </span>
          </span>
          <span className="col-end-[-1] text-end font-semibold">
            <Num animate value={r.at.value} />
          </span>
          <GroupLine id={r.p.id} house={r.p.short} snapshots={bundle.snapshots} open={openGroups.includes(r.p.id)} onOpen={onGroup} choice={choiceOf(r.p.id)} />
          {r.p.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={r.p.id} /></span>}
        </>
      ),
    };
  });
  const greyRows: PickRow[] = missing.map((r) => {
    const na = noWay(r);
    const other = otherWay(view, r.p.id);
    return {
      key: r.p.id,
      selected: r.p.id === baseHouse,
      muted: true,
      // a house with no way on this index has nothing to show as a pair: its row stays, with the reason
      onSelect: () => {
        if (other) pickHalf(view, pick, { house: r.p.id }, onPick);
      },
      cells: (
        <>
          <span className="text-sm tabular-nums text-center">—</span>
          <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", r.p.custom && "text-entered")}>
            {r.p.short}
            <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal">{r.p.id === view.yourBroker && <span>{c.pair.yoursTag}</span>}</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 text-xs @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
            <Tag tone={na ? undefined : "caution"}>{na ? c.pair.notPossible : c.pair.noData}</Tag>
            {na && !r.p.custom && (
              <a href={na.source.url} target="_blank" rel="noopener noreferrer" title={na.note ?? na.source.title} className="text-link hover:underline">
                {c.pair.notPossibleSource} ↗
              </a>
            )}
          </span>
          <span className="col-end-[-1] text-end font-semibold">—</span>
          {/* the reason takes the row's width, like the group line: in the charges column it stood one word to a line (2026-10-31) */}
          <span className="col-start-2 col-end-[-1] flex flex-col gap-0.5 text-xs leading-snug">
            {na && r.p.custom && <span>{c.customEntries.notSold}</span>}
            {!na && <span>{doubtOf(bundle.snapshots.find((s) => s.id === r.p.id), fund.option) ?? bundle.snapshots.find((s) => s.id === r.p.id)?.missing_reason_he ?? (r.at && "reason" in r.at ? reasonText(r.at.reason, optionClass[fund.option]) : c.funds.cannot)}</span>}
            {other && (
              <span>
                {c.pair.elsewhere} <MixedName>{other.fund.name}</MixedName>, {c.pair.elsewhereLeft} <Num value={other.at.value} />
                {other.at.open && ` (${c.pair.elsewhereOpen})`}
              </span>
            )}
          </span>
          <GroupLine id={r.p.id} house={r.p.short} snapshots={bundle.snapshots} open={openGroups.includes(r.p.id)} onOpen={onGroup} choice={choiceOf(r.p.id)} />
          {r.p.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={r.p.id} /></span>}
        </>
      ),
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
                  {c.pair.colCharges(years)}: <Num animate value={nis(at.accountCost, "F-63", c.pair.colCharges(years), bundle.today)} />
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
        <span className="text-xs text-muted-foreground min-h-[1lh] max-md:min-h-[2lh]">{standingCount > 0 && c.pair.standingNote(standingCount, local.length)}</span>
        <span className="text-xs text-muted-foreground">{c.pair.whichPrice}</span>
      </div>
      <div className="@container">
      <PickList
        label={c.pair.listLabelAccounts}
        columns="1.5rem 9.5rem minmax(0,1fr) 6.5rem"
        phoneColumns="1.25rem minmax(0,1fr) auto"
        head={
          <>
            <span>#</span>
            <span>{c.pair.colAccount}</span>
            <span className="max-md:hidden @max-2xl:invisible">{c.pair.colChargesShort}</span>
            <span className="text-end">{c.pair.colLeft}</span>
          </>
        }
        rows={[...pickRows, ...greyRows]}
      />
      </div>
      <div className="px-5 py-3 flex flex-col gap-3">
        <AddEntryButton kind="broker" />
        <ChartLegend
          pick={legendPick}
          items={[
            ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: c.pair.lines[l] ?? c.pair.lines.other })),
            { id: "remainder", swatch: <Swatch shape="box" className="bg-chart-cost-other" />, label: c.pair.remainder },
            ...(ok.some((r) => r.at.accountCost > scale) ? [{ id: "broken", label: c.pair.broken }] : []),
          ]}
        />
      </div>
    </Card>
  );
}


// ---------------------------------------------------------------- the fund column

const FILTER_FAMILIES = new Set<Label["family"]>(["trade", "follow", "currency", "payout", "held"]);

const mayaHrefOf = (f: FundWay) => {
  // Maya's page of the fund exists for a fund listed in Israel
  return !isCustomFund(f.rec) && (f.option === "il-etf" || f.option === "il-tracking") && f.rec.identifiers.tase_number ? mayaFundHref(f.rec.identifiers.tase_number) : null;
};

/** The fund's labels: how it trades (the type, from its option; a foreign fund, where it is listed, since the same fund can have a row for each), then what the record says about it. */
const labelsOf = (view: InvestView, f: FundWay, bundle: WorkbenchBundle): Label[] => [f.option === "tase-foreign" ? optionLabels(f.option)[0]! : optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!, ...fundLabels(f.rec, indexSeenBy(view.index, f.rec, bundle), f.option)];

/** F-92 (a) in a row: the gap with its sign, and the years it rests on. */
export function GapCell({ rec, today }: { rec: FundWay["rec"]; today: string }) {
  const g = gapOf(rec);
  const td = rec.fees.tracking_difference_12m;
  // "no full year" is what an Israeli fund's annual report says; a foreign or typed fund's years were never read, which says nothing about its age
  if (!g || !rec.tracking_record || !td) return <span className="text-xs text-muted-foreground">{rec.domicile === "IL" && !isCustomFund(rec) ? c.kinds.gapNone : c.kinds.gapNotCollected}</span>;
  // the inputs are the report's own figures for each year, from the same document as the fund's tracking note (D31: the fund's own report)
  const inputs: Record<string, SiteValue> = {};
  for (const y of rec.tracking_record.years) {
    inputs[c.kinds.gapInputFund(y.year)] = ownBy({ ...(td as SiteValue), value: y.fund_pct, unit: "pct", notes: undefined } as SiteValue, rec.manager);
    inputs[c.kinds.gapInputIndex(y.year)] = ownBy({ ...(td as SiteValue), value: y.tracking_pct, unit: "pct", notes: undefined } as SiteValue, rec.manager);
  }
  const val = computed(Math.round(g.pct * 100) / 100, "pct_per_year", "F-92", inputs, { today, about: c.kinds.colGap });
  return (
    <span className="flex flex-col leading-tight">
      <span className="font-semibold">
        <Num value={val} display={`\u2066${signedPct(g.pct, 2)}\u2069`} />
      </span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.kinds.gapYears(g.years)}</span>
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
function FundFees({ fund }: { fund: FundWay }) {
  return (
    <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
      {c.pair.colFees}: <Fees rec={fund.rec} inline />
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

export function FundColumn({ view, bundle, plan, today, pick, onPick, moved = null, filter, onFilter }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; today: string; pick: Pick; onPick: OnPick; /** The tap before changed the account too. */ moved?: Moved | null; filter: string | null; onFilter: (id: string | null) => void }) {
  const funds = allFunds(view);
  // a row added or removed starts the held height over, so a removed row leaves no hole (D44)
  const heldKey = `${view.index.id}:${funds.length}`;
  const held = useHeldHeight<HTMLDivElement>(heldKey);
  // every fund and house the header can name, laid out unseen, so a long one moves nothing above the list (issue 160)
  const longest = useMemo(
    () => ({
      names: funds.map((f) => <FundName key={f.rec.id} fund={f} />),
      fees: funds.map((f) => <FundFees key={f.rec.id} fund={f} />),
      kinds: funds.map((f) => <FundKind key={f.rec.id} fund={f} />),
      houses: view.providers.map((p) => <span key={p.id} className="text-sm flex flex-wrap items-center gap-1.5">{c.pair.fundsCond} <Tag>{p.short}</Tag></span>),
    }),
    [heldKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const kinds = hasKinds(view) && !!bundle.dollarRange;
  const range = bundle.dollarRange;
  const pickRec = funds.find((f) => f.rec.id === pick.fund)?.rec;
  const mine: Kind = pickRec ? kindOf(pickRec) : "unhedged";
  // a row of the other kind: its difference from the pick runs over the dollar's range (F-94), from the dollar's fall to its rise
  const cross = useMemo(() => {
    const out = new Map<string, { atLo: number; atHi: number }>();
    if (!kinds || !range || !pickRec) return out;
    const at = (fundId: string, fx: number) => pairValue({ bundle, index: view.index, plan, fundId, providerId: pick.house, fxChange: fx });
    const pLo = at(pick.fund, range.lo), pHi = at(pick.fund, range.hi);
    if (pLo === null || pHi === null) return out;
    for (const f of funds) {
      if (kindOf(f.rec) === mine || !priced(f.byHouse[pick.house])) continue;
      const lo = at(f.rec.id, range.lo), hi = at(f.rec.id, range.hi);
      if (lo !== null && hi !== null) out.set(f.rec.id, { atLo: lo - pLo, atHi: hi - pHi });
    }
    return out;
  }, [kinds, range, bundle, view, plan, pick.fund, pick.house, mine]);
  const fund = funds.find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  if (!fund || !house) return null;
  const selAt = fund.byHouse[pick.house];
  const rows = funds.map((f) => ({ f, at: f.byHouse[pick.house], labels: labelsOf(view, f, bundle) }));
  // the labels that split the list: some funds have them, some do not
  const counts = new Map<string, { label: Label; count: number }>();
  for (const r of rows) for (const l of r.labels) counts.set(l.id, { label: l, count: (counts.get(l.id)?.count ?? 0) + 1 });
  // only what the fund is (its type, how it tracks, its currency, what it pays out, where it is held); the tax and paperwork labels are read, not filtered on
  const options = [...counts.values()].filter((x) => x.count > 0 && x.count < rows.length && FILTER_FAMILIES.has(x.label.family));
  const active = filter && counts.has(filter) ? filter : null;
  const shown = rows.filter((r) => !active || r.labels.some((l) => l.id === active) || r.f.rec.id === pick.fund);
  const order = (r: (typeof rows)[number]) => (priced(r.at) ? (r.at.open ? 1 : 0) : 2);
  const kindRank = (r: (typeof rows)[number]) => (kinds && kindOf(r.f.rec) === "hedged" ? 1 : 0);
  shown.sort((a, b) => kindRank(a) - kindRank(b) || order(a) - order(b) || (priced(b.at) ? b.at.valueN : 0) - (priced(a.at) ? a.at.valueN : 0));
  const cur = view.index.exposure?.currency ?? "USD";
  const names = view.index.exposure?.other_currencies === true ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  const kindCount = { unhedged: shown.filter((r) => kindOf(r.f.rec) === "unhedged").length, hedged: shown.filter((r) => kindOf(r.f.rec) === "hedged").length };
  const diff = (n: number, name: string, value: SiteValue, sel: SiteValue) => nis(n, "F-65", c.pair.colDiff, today, { [c.pair.input(name, c.pair.colLeft)]: value, [c.pair.input(`${c.pair.chosen}, ${fund.name}`, c.pair.colLeft)]: sel });
  const houseWhys = [...new Set(shown.flatMap((r) => (r.at && !priced(r.at) && "reason" in r.at ? [reasonText(r.at.reason, optionClass[r.f.option])] : [])))];
  const pickRows: PickRow[] = shown.map((r, i) => {
    const at = r.at;
    const isSel = r.f.rec.id === pick.fund;
    const k = kindOf(r.f.rec);
    const heading = kinds && (i === 0 || kindOf(shown[i - 1]!.f.rec) !== k) ? (
      <span className="flex items-center gap-1.5">
        <Swatch shape="box" className={k === "hedged" ? "bg-chart-kind-hedged" : "bg-chart-kind-unhedged"} />
        {names[k]} · {c.kinds.groupCount(kindCount[k])}
      </span>
    ) : undefined;
    const x = cross.get(r.f.rec.id);
    const shortOf = (id: string) => providerName(view, id)?.short ?? id;
    const right = isSel ? (
      moved?.half === "house" ? (
        // the tap on this fund moved the account: said on the row tapped, with the way back
        <span className="flex flex-col items-end text-xs">
          <span className="text-foreground">{c.pair.movedHouse(toName(shortOf(pick.house)))}</span>
          <button type="button" onClick={() => onPick(moved.prev)} className="text-link underline underline-offset-[3px] hover:no-underline min-h-target -my-2.5 px-1">
            {c.pair.moveBackTo(toName(shortOf(moved.prev.house)))}
          </button>
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{c.pair.chosen}</span>
      )
    ) : x && range ? (
      <span className="flex flex-col items-end gap-0.5 text-sm">
        <span className="block font-semibold min-h-[2lh]">
          {c.kinds.between} <Num animate value={nis(x.atLo, "F-94", c.pair.colDiff, today)} display={plus} /> {c.kinds.and}
          <Num animate value={nis(x.atHi, "F-94", c.pair.colDiff, today)} display={plus} />
        </span>
        <span className="text-xs text-muted-foreground text-end">{c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}</span>
      </span>
    ) : priced(at) && priced(selAt) ? (
      <span className="font-semibold">
        <Num animate value={diff(at.valueN - selAt.valueN, r.f.name, at.value, selAt.value)} display={plus} />
      </span>
    ) : (
      <span className="flex flex-col items-end text-xs text-muted-foreground">
        {c.pair.noPriceHere}
        {/* said before the tap: picking it moves the account to the house where it leaves the most */}
        {!r.f.reason && r.f.best && r.f.best.providerId !== pick.house && <span className="text-end">{c.pair.pickMoves(toName(shortOf(r.f.best.providerId)))}</span>}
      </span>
    );
    // a fund priced nowhere says why on its row, the same at every house; the reasons that depend on the house are under the list, once each (2026-10-31)
    const why = !r.at && r.f.reason ? reasonText(r.f.reason, optionClass[r.f.option]) : null;
    const mineTyped = isCustomFund(r.f.rec);
    return {
      key: r.f.rec.id,
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
            <span className={cx("leading-snug", mineTyped ? "[overflow-wrap:anywhere]" : "md:whitespace-nowrap")}>
              <span className={cx("font-semibold", mineTyped && "text-entered")}>
                <MixedName>{r.f.name}</MixedName>
              </span>{" "}
              <span className="inline-block ms-1" onClick={(e) => e.stopPropagation()}>
                <ProductIdLink id={r.f.number} href={mayaHrefOf(r.f)} label={brands.funds.mayaLink(r.f.number)} />
              </span>
            </span>
            <span className="flex md:flex-wrap gap-1.5 max-md:overflow-x-auto max-md:pb-0.5" onClick={(e) => e.stopPropagation()}>
              {r.labels.map((l) => (
                <LabelChip key={l.id} label={l} />
              ))}
              {priced(at) && at.open && (
                <Tag tone="blocked" icon={<IconLock size={14} />}>
                  {c.options.open}
                </Tag>
              )}
            </span>
            {why && <span className="text-xs text-muted-foreground">{why}</span>}
            {mineTyped && <FundTerms id={r.f.rec.id} />}
          </span>
          {/* on a phone the gap goes under the fund's name and the difference stays at the row's end */}
          <span className="self-center max-md:row-start-2 max-md:col-start-2">
            <GapCell rec={r.f.rec} today={today} />
          </span>
          <span className="text-end self-center max-md:row-start-1 max-md:col-start-3">{right}</span>
        </>
      ),
    };
  });
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{c.pair.fundSlot}</span>
        <LongestCase cases={longest.names}><FundName fund={fund} /></LongestCase>
        <LongestCase cases={longest.fees}><FundFees fund={fund} /></LongestCase>
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
        </div>
        <LabelFilter lead={c.pair.filter} allLabel={c.pair.clearFilter} value={active} onChange={onFilter} options={options} />
      </div>
      <PickList
        label={c.pair.listLabelFunds}
        columns="minmax(0,1fr) 5.5rem 10.5rem"
        phoneColumns="minmax(0,1fr) auto"
        phoneLimit={6}
        more={c.pair.moreFunds}
        head={
          <>
            <span>{c.pair.colFund}</span>
            <span className="max-md:hidden">{c.kinds.colGap}</span>
            <span className="text-end">{c.pair.colDiff}</span>
          </>
        }
        rows={pickRows}
      />
      <div className="px-5 py-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <AddEntryButton kind="fund" />
        {houseWhys.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{c.pair.noPriceWhy(house.short)}</span>
            {houseWhys.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        )}
        {active && <span>{c.pair.shown(shown.length, rows.length)}</span>}
        {kinds && <span>{c.funds.kindsNote}</span>}
        <span>{c.funds.gapNote}</span>
        {!view.index.israeli && <FeeWordsNote />}
      </div>
    </Card>
  );
}

