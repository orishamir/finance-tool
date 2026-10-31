// The index page as two linked lists (founder, 2026-10-27; spec research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account
// and a fund. The account list prices every account with the chosen fund, the fund list prices every fund at the chosen account;
// neither list leaves anything out (a row that cannot be priced stays, with its reason). Above them, the result: what is put in, what
// is left, and what it costs, split by who takes it: the person's pair and the cheapest one above each other, or, on the cheapest pair,
// the next one beside it (one shape, so a pick never resizes the block).
import { mayaFundHref } from "../../lib/sources";
import { useMemo } from "react";
import type { FeeLine } from "@finance-tool/engine";
import { brands, invest as c } from "../../copy";
import { doubtOf, gapOf, inputMap, hasKinds, kindOf, kindScenarios, opensOn, pairCosts, pairValue, type FundWay, type InvestView, type Kind, type KindScenarios, type PairCosts, type Reason, type WayPrice } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { brokerLabels, fundLabels, optionLabels, type Label } from "../../lib/labels";
import { computed, ownBy, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, Card, ChartLegend, CostStack, LabelChip, LabelFilter, LabelRow, PickList, ProductIdLink, Sentence, Swatch, Tag, cx, type CostPart, type PickRow } from "../kit";
import { optionClass, OptionTag, reasonText } from "./parts";
import { ProviderLink, providerName } from "./sections";
import { Fees } from "./funds";

export interface Pick {
  house: string;
  fund: string;
}

const lineClass: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };
const lineOf = (line: FeeLine) => (line in lineClass ? line : "other");
/** A computed shekel figure of this page, whole shekels (the totals and gaps the bars and lists show). */
const nis = (n: number, formula: string, about: string, today: string, inputs: Record<string, SiteValue> = {}): SiteValue => computed(Math.round(n), "nis", formula, inputs, { today, about });
/** A gain shown with its plus sign, isolated so it reads "+2,621 ₪" inside Hebrew. */
const plus = (v: SiteValue) => (typeof v.value === "number" && v.value > 0 ? `\u2066+${fmt.nisWhole(v.value)}\u2069` : undefined);
const priced = (x: WayPrice | { reason: Reason } | undefined): x is WayPrice => !!x && "valueN" in x;

/** Every fund on the index, of every option that exists for it. */
export const allFunds = (view: InvestView): FundWay[] => view.options.filter((o) => o.exists).flatMap((o) => o.funds);

/** The default pick: the cheapest complete way. */
export const pickOfHeadline = (view: InvestView): Pick | null => (view.headline ? { house: view.headline.providerId, fund: view.headline.fund.rec.id } : null);

/**
 * The cheapest pair to set beside the person's: the headline, unless they picked a currency-hedged fund, which is compared with the best
 * hedged pair (2026-10-28): the page opens on unhedged funds only, and "the cheapest" must never leave less than the pick beside it.
 */
export function bestFor(view: InvestView, pick: Pick): Pick | null {
  const rec = allFunds(view).find((f) => f.rec.id === pick.fund)?.rec;
  if (!rec || opensOn(rec)) return pickOfHeadline(view);
  const top = allFunds(view)
    .filter((f) => !opensOn(f.rec))
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
    .sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : pickOfHeadline(view);
}

/** The other half when one half changes: keep it when it still prices, else the one that leaves the most with the new half. */
export function repick(view: InvestView, cur: Pick, change: Partial<Pick>): Pick {
  const funds = allFunds(view);
  if (change.house) {
    const keep = funds.find((f) => f.rec.id === cur.fund);
    if (keep && priced(keep.byHouse[change.house])) return { house: change.house, fund: cur.fund };
    const best = funds.map((f) => ({ f, at: f.byHouse[change.house!] })).filter((x) => priced(x.at) && !x.at.open).sort((a, b) => (b.at as WayPrice).valueN - (a.at as WayPrice).valueN)[0];
    return { house: change.house, fund: best?.f.rec.id ?? cur.fund };
  }
  if (change.fund) {
    const f = funds.find((x) => x.rec.id === change.fund);
    if (f && priced(f.byHouse[cur.house])) return { house: cur.house, fund: change.fund };
    return { house: f?.best?.providerId ?? cur.house, fund: change.fund };
  }
  return cur;
}

/** The best pair of one kind (hedged or not) over every ranked fund at every house; null when the kind has none priced. */
export function bestOfKind(view: InvestView, kind: Kind): Pick | null {
  const top = allFunds(view)
    .filter((f) => kindOf(f.rec) === kind)
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open ? [{ house, fund: f.rec.id, v: at.valueN }] : [])))
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

function partsOf(pc: PairCosts): CostPart[] {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const whole = (x: number) => Math.round(x).toLocaleString("he-IL");
  const account = pc.account.map((l) => ({ id: l.line, value: n(l.cost), className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", inside: whole(n(l.cost)) }));
  // the account's remainder no single line explains is part of what it takes, so the bar holds the whole cost (F-91)
  return [...account, { id: "remainder", value: pc.interaction, className: "bg-chart-cost-other", inside: whole(pc.interaction) }, { id: "fund", value: n(pc.fund), className: "bg-chart-cost-fund", inside: whole(n(pc.fund)) }, { id: "tax", value: n(pc.tax), className: "bg-chart-tax", inside: whole(n(pc.tax)) }];
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

function CostLegend({ lines }: { lines: string[] }) {
  const groupHead = (text: string) => ({ id: `g-${text}`, label: <span className="text-foreground font-medium">{text}</span> });
  return (
    <ChartLegend
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

function CostBar({ who, sub, pc, scale, you, today }: { who: string; sub: string; pc: PairCosts; scale: number; you?: boolean; today: string }) {
  const parts = partsOf(pc);
  // shown as the rounded base less the rounded value left: two bars then differ by exactly what the two "left" figures differ by
  const total = Math.round(pc.base) - Math.round(pc.left.value as number);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[10rem_minmax(0,1fr)_6rem] items-center gap-x-3 gap-y-1.5">
      <span className={cx("flex flex-col min-w-0 leading-tight font-semibold", you && "text-entered")}>
        <span className="truncate" title={who}>
          {who}
        </span>
        <span className="text-xs font-normal text-muted-foreground">{sub}</span>
      </span>
      <div className="min-w-0 max-md:col-span-2 max-md:row-start-2">
        <CostStack parts={parts} scale={scale} label={`${who}: ${fmt.nisWhole(total)}`} />
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
    .flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => (priced(at) && !at.open && !(house === best.house && f.rec.id === best.fund) ? [{ house, fund: f.rec.id, v: at.valueN }] : [])));
  const top = pairs.sort((a, b) => b.v - a.v)[0];
  return top ? { house: top.house, fund: top.fund } : null;
}

/**
 * The result's two kinds (F-94, founder 2026-10-29, option A): the pair of each kind side by side, the unhedged one as a range over the
 * dollar's yearly change (P-02's bounds for A-03) with the steady-dollar figure marked, the hedged one as one figure with its band; then
 * where the two meet. Nothing here rests on one guess about the dollar.
 */
function KindCards({ view, bundle, plan, pick, onPick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; pick: Pick; onPick: (p: Pick) => void }) {
  // `plan` is the settled plan: these figures run about 15 pricings and wait until the slider rests (ground rule 5)
  const range = bundle.dollarRange!;
  const pairs = kindPairs(view, pick);
  const sc: KindScenarios | null = useMemo(
    () => (pairs ? kindScenarios({ bundle, index: view.index, plan, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house }, lo: range.lo, hi: range.hi, points: "ends" }) : null),
    [bundle, view.index, plan, pairs?.unhedged.fund, pairs?.unhedged.house, pairs?.hedged.fund, pairs?.hedged.house, range.lo, range.hi],
  );
  if (!pairs || !sc) return null;
  const today = bundle.today;
  const years = plan.years;
  const funds = allFunds(view);
  const cur = view.index.exposure?.currency ?? "USD";
  const many = view.index.exposure?.other_currencies === true;
  const names = many ? c.kinds.nameMany(c.currencies[cur] ?? cur) : c.kinds.name;
  const mine = kindOf(funds.find((f) => f.rec.id === pick.fund)!.rec);
  const v = (n: number, about: string) => nis(n, "F-94", about, today, inputMap(plan));
  const lo = sc.unhedged[0]!, mid = sc.unhedged.find((x) => x.fx === 0)!, hi = sc.unhedged[sc.unhedged.length - 1]!;
  const markAt = ((0 - sc.lo) / (sc.hi - sc.lo)) * 100;
  const fundName = (p: Pick) => funds.find((f) => f.rec.id === p.fund)?.name ?? p.fund;
  const house = (p: Pick) => providerName(view, p.house)?.short ?? p.house;
  const card = (k: Kind) => {
    const p = pairs[k];
    const isPick = k === mine;
    const best = bestOfKind(view, k);
    const isBest = !!best && best.fund === p.fund && best.house === p.house;
    const bestLeft = !isBest && best ? (funds.find((f) => f.rec.id === best.fund)?.byHouse[best.house] as WayPrice | undefined) : undefined;
    const pLeft = funds.find((f) => f.rec.id === p.fund)?.byHouse[p.house];
    return (
      <div key={k} className={cx("md:flex-1 md:min-w-72 rounded-lg border p-3 flex flex-col gap-1", isPick ? "border-entered bg-entered/10" : "border-border")}>
        <span className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
          <Swatch shape="box" className={k === "hedged" ? "bg-chart-kind-hedged" : "bg-chart-kind-unhedged"} />
          <span className="font-medium text-foreground">{names[k]}</span>
          {isPick && <span>· {c.kinds.yours}</span>}
          {isBest && <span className="text-primary font-medium">· {c.kinds.cheapest}</span>}
        </span>
        <span className="text-sm font-semibold leading-snug">
          <bdi>{fundName(p)}</bdi> · {house(p)}
        </span>
        {k === "unhedged" ? (
          <>
            <span className="text-2xl md:text-3xl font-bold leading-tight md:whitespace-nowrap min-h-[2lh] md:min-h-0">
              <Num value={v(lo.value, c.kinds.rangeAbout(isoPct(sc.lo)))} /> <span className="text-lg font-semibold">{c.kinds.upTo}</span> <Num value={v(hi.value, c.kinds.rangeAbout(isoPct(sc.hi)))} />
            </span>
            <span className="text-xs text-muted-foreground min-h-[3lh] md:min-h-[2lh]">{c.kinds.unhedgedSub(years, `${Math.abs(sc.lo)}%`, `${sc.hi}%`)}</span>
            <div className="relative h-2.5 rounded-full bg-chart-kind-unhedged/35 mt-2 mb-6" dir="ltr" aria-hidden="true">
              <span className="absolute -top-1.5 w-[3px] h-5 rounded bg-foreground" style={{ left: `calc(${markAt}% - 1.5px)` }} />
              {/* the bar is the dollar axis, left to right: its fall at the left end, its rise at the right */}
              <span className="absolute top-4 left-0 text-[11px] text-muted-foreground whitespace-nowrap" dir="rtl">{c.kinds.falls(isoPct(sc.lo))}</span>
              <span className="absolute top-4 right-0 text-[11px] text-muted-foreground whitespace-nowrap" dir="rtl">{c.kinds.falls(isoPct(sc.hi))}</span>
            </div>
            <span className="text-sm">
              {c.kinds.steady}: <Num value={v(mid.value, c.kinds.steady)} />
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl md:text-3xl font-bold leading-tight">
              <Num value={v(sc.hedged.value, names.hedged)} />
            </span>
            <span className="text-xs text-muted-foreground min-h-[3lh] md:min-h-[2lh]">
              {c.kinds.hedgedSub(years)} {many ? c.kinds.hedgedMany : ""}
            </span>
            <span className="text-sm min-h-[3lh] md:min-h-[2lh]">
              {sc.hedged.band ? (
                <>
                  {c.kinds.band} {c.kinds.between} <Num value={v(sc.hedged.band.low, c.kinds.bandAbout)} /> {c.kinds.and}
                  <Num value={v(sc.hedged.band.high, c.kinds.bandAbout)} />
                </>
              ) : null}
            </span>
          </>
        )}
        <span className="flex flex-wrap items-center gap-x-3 text-sm min-h-target">
          {!isPick ? (
            <Button variant="quiet" onClick={() => onPick(p)}>
              {c.pair.pickCheapest}
            </Button>
          ) : bestLeft && best && priced(pLeft) ? (
            <>
              <span>
                <Num value={v(bestLeft.valueN - pLeft.valueN, c.kinds.moreInCheapest)} display={plus(v(bestLeft.valueN - pLeft.valueN, c.kinds.moreInCheapest))} /> {c.kinds.moreInCheapest}
              </span>
              <Button variant="quiet" onClick={() => onPick(best)}>
                {c.pair.pickCheapest}
              </Button>
            </>
          ) : null}
        </span>
      </div>
    );
  };
  const x = sc.crossing;
  const pctV = (n: number) => computed(Math.round(Math.abs(n) * 100) / 100, "pct_per_year", "F-94", { [names.unhedged]: v(mid.value, c.kinds.steady), [names.hedged]: v(sc.hedged.value, names.hedged) }, { today, about: c.kinds.crossingAbout });
  const better0 = sc.hedged.value > mid.value ? names.hedged : names.unhedged;
  return (
    <div className="flex flex-col gap-3 md:flex-1">
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        {card("unhedged")}
        {card("hedged")}
      </div>
      <p className="text-base min-h-[3lh] md:min-h-[2lh]">
        {x === null ? (
          c.kinds.verdictNever(better0)
        ) : (
          <>
            {(x < 0 ? c.kinds.verdictDown(years) : c.kinds.verdictUp(years)).lead}
            <Num value={pctV(x)} />
            {(x < 0 ? c.kinds.verdictDown(years) : c.kinds.verdictUp(years)).tail}
          </>
        )}{" "}
        <a href="#invest-dollar" className="text-link hover:underline">
          {c.kinds.seeAll} ↓
        </a>
      </p>
    </div>
  );
}

export function PairResult({ view, bundle, plan, settled, pick, onPick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; settled?: WorkbenchInputs; pick: Pick; onPick: (p: Pick) => void }) {
  const best = bestFor(view, pick);
  const onBest = !!best && best.house === pick.house && best.fund === pick.fund;
  // the block keeps one shape whichever pair is picked (founder, 2026-10-27: "the page is still jumping when changing from the winning
  // combination"): the person's pair beside the cheapest, or, on the cheapest, beside the next one
  const other = onBest ? runnerUp(view, pick) : best;
  const pc = useMemo(() => pairCosts({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house }), [bundle, view.index, plan, pick.fund, pick.house]);
  const pcOther = useMemo(() => (other ? pairCosts({ bundle, index: view.index, plan, fundId: other.fund, providerId: other.house }) : null), [bundle, view.index, plan, other?.fund, other?.house]);
  if (!pc) return null;
  // an index on a foreign currency with funds of both kinds shows each kind across the dollar (F-94, 2026-10-29)
  const kinds = hasKinds(view) && !!bundle.dollarRange;
  const years = plan.years;
  const months = 12 * plan.years;
  // the legend names every account line whichever pair is shown, so it keeps its size from one pick to the next
  const lines = [...Object.keys(lineClass), ...([...pc.account, ...(pcOther?.account ?? [])].some((l) => lineOf(l.line) === "other") ? ["other"] : [])];
  // a gap names its two inputs by whose they are, as the figure's sheet lists them
  const gap = (a: SiteValue, aName: string, b: SiteValue, bName: string, about: string) => nis((a.value as number) - (b.value as number), "F-65", about, bundle.today, { [aName]: a, [bName]: b });
  const otherRole = onBest ? c.pair.next : c.pair.cheapest;
  const parts = partsOf(pc);
  const scale = Math.max(totalOf(parts), pcOther ? totalOf(partsOf(pcOther)) : 0);
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
        <Num value={nis(Math.abs(n), "F-91", about, bundle.today, { [c.pair.input(c.pair.yours, about)]: a, [c.pair.input(otherRole, about)]: b })} /> {n > 0 ? c.pair.gapMore : c.pair.gapLess}
      </>
    );
  const nameOf = (p: Pick) => providerName(view, p.house)?.short ?? p.house;
  const otherTitle = onBest ? c.pair.next : c.pair.cheapestStar;
  const moreIfOther = pcOther ? gap(pcOther.left, c.pair.input(otherRole, c.pair.colLeft), pc.left, c.pair.input(c.pair.yours, c.pair.colLeft), c.pair.moreIfCheapest) : null;
  return (
    <Card pad="roomy" className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-stretch md:gap-x-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{c.pair.paidIn}</span>
          <span className="text-2xl md:text-3xl font-bold leading-tight">
            <Num value={pc.paidIn} />
          </span>
          <span className="text-xs text-muted-foreground">{c.pair.paidInNote(months)}</span>
        </div>
        <span aria-hidden="true" className="hidden md:inline text-2xl text-muted-foreground self-center">
          ←
        </span>
        {kinds ? (
          <KindCards view={view} bundle={bundle} plan={settled ?? plan} pick={pick} onPick={onPick} />
        ) : (
        <div className="grid grid-cols-2 gap-3 md:contents">
          <div className="md:flex-1 md:min-w-64 rounded-lg border border-entered bg-entered/10 p-3 flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground max-md:min-h-[2lh]">
              {c.pair.yours}
              {onBest && <span className="text-primary font-medium"> · {c.pair.cheapestTag}</span>}
            </span>
            <span className="text-2xl md:text-3xl font-bold leading-tight">
              <Num value={pc.left} />
            </span>
            <span className="text-xs text-muted-foreground">
              {c.pair.left(years)}, {c.pair.leftNote}
            </span>
          </div>
          {pcOther && other && (
            <div className="md:flex-1 md:min-w-64 rounded-lg border border-border p-3 flex flex-col gap-1">
              <span className="text-sm text-muted-foreground max-md:min-h-[2lh]">{otherTitle}</span>
              <span className={cx("text-2xl md:text-3xl font-bold leading-tight", !onBest && "text-primary")}>
                <Num value={pcOther.left} />
              </span>
              <span className="flex flex-wrap items-center gap-x-3 text-sm">
                <span>
                  {onBest ? (
                    <>
                      <Num value={gap(pcOther.left, c.pair.input(otherRole, c.pair.colLeft), pc.left, c.pair.input(c.pair.yours, c.pair.colLeft), c.pair.vsYours)} /> {c.pair.vsYours}
                    </>
                  ) : (
                    <>
                      <Num value={moreIfOther!} display={plus(moreIfOther!)} /> {c.pair.moreIfCheapest}
                    </>
                  )}
                </span>
                <Button variant="quiet" onClick={() => onPick(other)}>
                  {c.pair.pickCheapest}
                </Button>
              </span>
            </div>
          )}
        </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{c.pair.costTitleBoth(years)}</h3>
        <CostBar who={nameOf(pick)} sub={c.pair.yours} pc={pc} scale={scale} you today={bundle.today} />
        {pcOther && other && <CostBar who={nameOf(other)} sub={onBest ? c.pair.next : c.pair.cheapest} pc={pcOther} scale={scale} today={bundle.today} />}
        <CostLegend lines={lines} />
        {pcOther && (
          <Sentence size="sm" tone="muted">
            {c.pair.gapLead} {c.pair.gapPart.account} {gapNum(gapParts![0]!, c.pair.gapPart.account, nis(sumAccount(pc), "F-91", c.pair.gapPart.account, bundle.today), nis(sumAccount(pcOther), "F-91", c.pair.gapPart.account, bundle.today))}
            {" · "}
            {c.pair.gapPart.fund} {gapNum(gapParts![1]!, c.pair.gapPart.fund, pc.fund, pcOther.fund)}
            {" · "}
            {c.pair.gapPart.tax} {gapNum(gapParts![2]!, c.pair.gapPart.tax, pc.tax, pcOther.tax)}
            {/* more tax with more left: the gain explains it; with a different tax treatment the signs part, and nothing is said */}
            {gapParts![2]! !== 0 && Math.sign(gapParts![2]!) === Math.sign(leftGap) && <>, {gapParts![2]! > 0 ? c.pair.taxBecauseMore : c.pair.taxBecauseLess}</>}
          </Sentence>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- the account column

/** The bars' scale: the costs of the main group, so one or two far larger accounts do not flatten the rest (they get a break mark). */
function barScale(costs: number[]): number {
  if (costs.length === 0) return 0;
  const sorted = [...costs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  const inGroup = sorted.filter((x) => x <= 2.5 * Math.max(median, 1));
  return Math.max(...inGroup);
}

export function AccountColumn({ view, bundle, years, pick, onPick }: { view: InvestView; bundle: WorkbenchBundle; years: number; pick: Pick; onPick: (p: Pick) => void }) {
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  if (!fund || !house) return null;
  const best = bestFor(view, pick);
  // counted over every fund of the index, so the sentence stays as it is when another fund is picked
  const local = view.providers.filter((p) => !p.foreign);
  const standingCount = local.filter((p) => allFunds(view).some((f) => { const a = f.byHouse[p.id]; return priced(a) && a.standing; })).length;
  const rows = view.providers.map((p) => ({ p, at: fund.byHouse[p.id] }));
  const ok = rows.filter((r): r is { p: typeof r.p; at: WayPrice } => priced(r.at)).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN);
  const noWay = (r: (typeof rows)[number]) => (r.at && "availability" in r.at && r.at.availability ? r.at.availability : null);
  // every house keeps a row: what cannot be priced is grey, "no data" first and "not possible there" last (founder, 2026-10-31)
  const missing = rows.filter((r) => !priced(r.at)).sort((a, b) => Number(!!noWay(a)) - Number(!!noWay(b)) || a.p.short.localeCompare(b.p.short, "he"));
  const scale = barScale(ok.map((r) => r.at.accountCost));
  const lines = [...new Set(ok.flatMap((r) => r.at.lines.map((l) => lineOf(l.line))))];
  const snapshot = bundle.snapshots.find((s) => s.id === pick.house);
  const at = fund.byHouse[pick.house];
  const pickRows: PickRow[] = ok.map((r, i) => {
    const parts: CostPart[] = [...r.at.lines.map((l) => ({ id: l.line, value: l.cost, className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other" })), { id: "remainder", value: r.at.interaction, className: "bg-chart-cost-other" }];
    const isYours = r.p.id === view.yourBroker;
    // shown on the row whether or not it is picked, so a pick never adds or removes a line (founder, 2026-10-27)
    const isBest = best?.house === r.p.id && best.fund === pick.fund;
    return {
      key: r.p.id,
      selected: r.p.id === pick.house,
      onSelect: () => onPick(repick(view, pick, { house: r.p.id })),
      cells: (
        <>
          <span className="text-sm text-muted-foreground tabular-nums text-center">{r.at.open ? "—" : i + 1}</span>
          <span className={cx("flex flex-col min-w-0 leading-tight font-semibold", isYours && "text-entered")}>
            {r.p.short}
            {/* one line reserved on every row, so a re-sort never changes a row's height (2026-10-31) */}
            <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal text-muted-foreground">
              {isYours && <span>{c.pair.yoursTag}</span>}
              {isBest && <span className="font-medium text-primary">{c.pair.cheapestTag}</span>}
              {r.at.standing && <span>{c.pair.standingTag}</span>}
            </span>
          </span>
          <span className="flex items-center gap-2 min-w-0 max-md:row-start-2 max-md:col-start-3 max-md:col-span-2">
            <CostStack size="sm" parts={parts} scale={scale} label={`${r.p.short}: ${fmt.nisWhole(r.at.accountCost)}`} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <Num value={nis(r.at.accountCost, "F-63", `${r.p.short}: ${c.pair.colChargesShort}`, bundle.today)} />
            </span>
          </span>
          <span className="text-end font-semibold">
            <Num value={r.at.value} />
          </span>
        </>
      ),
    };
  });
  const greyRows: PickRow[] = missing.map((r) => {
    const na = noWay(r);
    return {
      key: r.p.id,
      selected: r.p.id === pick.house,
      muted: true,
      onSelect: () => onPick(repick(view, pick, { house: r.p.id })),
      cells: (
        <>
          <span className="text-sm tabular-nums text-center">—</span>
          <span className="flex flex-col min-w-0 leading-tight font-semibold">
            {r.p.short}
            <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal">{r.p.id === view.yourBroker && <span>{c.pair.yoursTag}</span>}</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 text-xs max-md:row-start-2 max-md:col-start-3 max-md:col-span-2">
            <Tag tone={na ? undefined : "caution"}>{na ? c.pair.notPossible : c.pair.noData}</Tag>
            {na ? (
              <a href={na.source.url} target="_blank" rel="noopener noreferrer" title={na.note ?? na.source.title} className="text-link hover:underline">
                {c.pair.notPossibleSource} ↗
              </a>
            ) : (
              <span>{doubtOf(bundle.snapshots.find((s) => s.id === r.p.id), fund.option) ?? bundle.snapshots.find((s) => s.id === r.p.id)?.missing_reason_he ?? (r.at && "reason" in r.at ? reasonText(r.at.reason, optionClass[fund.option]) : c.funds.cannot)}</span>
            )}
          </span>
          <span className="text-end font-semibold">—</span>
        </>
      ),
    };
  });
  return (
    <Card pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{c.pair.accountSlot}</span>
        {/* two lines on a phone: the longest legal name's, so the card keeps its height when the cheapest house changes (2026-10-31) */}
        <span className="text-xl font-bold max-md:min-h-14.5">
          <ProviderLink p={house} />
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm max-md:min-h-12.25">
          {priced(at) && (
            <span className="text-muted-foreground">
              {c.pair.colCharges(years)}: <Num value={nis(at.accountCost, "F-63", c.pair.colCharges(years), bundle.today)} />
            </span>
          )}
          <LabelRow labels={brokerLabels(house, false)} />
          {snapshot && (
            <a href={snapshot.tariff.url} target="_blank" rel="noopener noreferrer" title={snapshot.tariff.title} className="text-link hover:underline">
              {c.pair.tariff} ↗
            </a>
          )}
        </span>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-0.5">
        <h3 className="font-semibold">{c.pair.accounts}</h3>
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
          {c.pair.accountsCond} <Tag><bdi>{fund.name}</bdi></Tag> · {c.pair.accountsHint}
        </span>
        {standingCount > 0 && <span className="text-xs text-muted-foreground">{c.pair.standingNote(standingCount, local.length)}</span>}
        <span className="text-xs text-muted-foreground">{c.pair.whichPrice}</span>
      </div>
      <PickList
        label={c.pair.listLabelAccounts}
        columns="1.5rem 9.5rem minmax(0,1fr) 6.5rem"
        phoneColumns="1.25rem minmax(0,1fr) auto"
        head={
          <>
            <span>#</span>
            <span>{c.pair.colAccount}</span>
            <span className="max-md:hidden">{c.pair.colChargesShort}</span>
            <span className="text-end">{c.pair.colLeft}</span>
          </>
        }
        rows={[...pickRows, ...greyRows]}
      />
      <div className="px-5 py-3 flex flex-col gap-3">
        <ChartLegend
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
  return (f.option === "il-etf" || f.option === "il-tracking") && f.rec.identifiers.tase_number ? mayaFundHref(f.rec.identifiers.tase_number) : null;
};

/** The fund's labels: how it trades (the type, from its option), then what the record says about it. */
const labelsOf = (view: InvestView, f: FundWay): Label[] => [optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!, ...fundLabels(f.rec, view.index, f.option)];

/** F-92 (a) in a row: the gap with its sign, and the years it rests on. */
function GapCell({ rec, today }: { rec: FundWay["rec"]; today: string }) {
  const g = gapOf(rec);
  const td = rec.fees.tracking_difference_12m;
  if (!g || !rec.tracking_record || !td) return <span className="text-xs text-muted-foreground">{c.kinds.gapNone}</span>;
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

export function FundColumn({ view, bundle, plan, today, pick, onPick, filter, onFilter }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; today: string; pick: Pick; onPick: (p: Pick) => void; filter: string | null; onFilter: (id: string | null) => void }) {
  const funds = allFunds(view);
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
  const rows = funds.map((f) => ({ f, at: f.byHouse[pick.house], labels: labelsOf(view, f) }));
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
    const right = isSel ? (
      <span className="text-sm text-muted-foreground">{c.pair.chosen}</span>
    ) : x && range ? (
      <span className="flex flex-col items-end gap-0.5 text-sm">
        <span className="font-semibold">
          {c.kinds.between} <Num value={nis(x.atLo, "F-94", c.pair.colDiff, today)} display={plus(nis(x.atLo, "F-94", c.pair.colDiff, today))} /> {c.kinds.and}
          <Num value={nis(x.atHi, "F-94", c.pair.colDiff, today)} display={plus(nis(x.atHi, "F-94", c.pair.colDiff, today))} />
        </span>
        <span className="text-xs text-muted-foreground text-end">{c.kinds.crossWhy(`${Math.abs(range.lo)}%`, `${range.hi}%`)}</span>
      </span>
    ) : priced(at) && priced(selAt) ? (
      <span className="font-semibold">
        <Num value={diff(at.valueN - selAt.valueN, r.f.name, at.value, selAt.value)} display={plus(diff(at.valueN - selAt.valueN, r.f.name, at.value, selAt.value))} />
      </span>
    ) : (
      <span className="text-muted-foreground" aria-hidden="true">
        —
      </span>
    );
    // why a fund has no price here: a line of the row at its full width, not squeezed into the difference column (founder, 2026-10-28)
    const why = priced(at) ? null : at && "reason" in at ? reasonText(at.reason, optionClass[r.f.option]) : r.f.reason ? reasonText(r.f.reason, optionClass[r.f.option]) : c.funds.cannot;
    return {
      key: r.f.rec.id,
      ...(heading ? { heading } : {}),
      selected: isSel,
      muted: !priced(at),
      onSelect: () => onPick(repick(view, pick, { fund: r.f.rec.id })),
      cells: (
        <>
          <span className="flex flex-col gap-1.5 min-w-0">
            <span className="leading-snug md:whitespace-nowrap">
              <span className="font-semibold">
                <bdi>{r.f.name}</bdi>
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
    <Card pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{c.pair.fundSlot}</span>
        <span className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold md:whitespace-nowrap">
            <bdi>{fund.name}</bdi>
          </span>
          <ProductIdLink id={fund.number} href={mayaHrefOf(fund)} label={brands.funds.mayaLink(fund.number)} />
        </span>
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          {c.pair.colFees}: <Fees rec={fund.rec} inline />
        </span>
        <span className="flex flex-wrap gap-1.5 items-center">
          <OptionTag option={fund.option} />
          {fund.rec.manager && <span className="text-xs text-muted-foreground">{c.funds.manager}: <bdi>{fund.rec.manager}</bdi></span>}
        </span>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold">{c.pair.funds(view.index.name)}</h3>
          <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
            {c.pair.fundsCond} <Tag>{house.short}</Tag> · {c.pair.fundsHint}
          </span>
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
        {active && <span>{c.pair.shown(shown.length, rows.length)}</span>}
        {kinds && <span>{c.funds.kindsNote}</span>}
        <span>{c.funds.gapNote}</span>
      </div>
    </Card>
  );
}

