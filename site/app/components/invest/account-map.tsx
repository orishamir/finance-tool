// "מתי חשבון אחר זול יותר?" under the lists of the index page: which account costs least with the receipt's fund at each mix of today's
// amount and monthly deposit (F-131), the plan's years, return and inflation held; where two are within the site's tie threshold (P-01) they
// are about the same, and a switch is where another becomes clearly cheaper. The map is worked out in the page's worker once the plan has
// rested (lib/account-map.ts); a point the reader reads is priced here, at that point, as the lists price the fund (`fundWayAt`), once per
// point. Everything the panel reads is the fund and plan the map shown was worked out for, so a map still shown while the next is worked out
// never reads another fund. Its words cover every case: one account cheapest everywhere, the plan clearly in one account's area or in the
// band, a switch one way or both, up or down, a plan with nothing in it, and a fund no account is ranked with.
import { memo, useMemo } from "react";
import { invest as c } from "../../copy";
import type { AccountMap, MapField } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { fundWayAt, providersOfInvest, tieShareOf, type InvestView, type WayPrice } from "../../lib/invest";
import { rankByValue } from "../../lib/rank";
import { useAccountMapRun, type Asked } from "../../lib/invest-run";
import type { MapAnswer } from "../../lib/invest-work";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rankedAt } from "../../lib/stretch";
import { asParameter, carriedBy, differenceOf, entered, type SiteValue } from "../../lib/value";
import { isTie } from "@finance-tool/engine";
import { Num } from "../provenance";
import { HeldMark, HelpMark, MixedName, PanelHead, RegionMap, regionSwatch, regionTones, regionWash, Swatch, type RegionArea, type RegionGrid, type RegionGuide, type RegionPoint, type RegionReading, type RegionTone, type TabCard } from "../kit";
import { providerName } from "./sections";
import { allFunds, type Pick } from "./pair";

const m = c.before.map;

/** The map on the pair's fund, worked out in the page's worker on the plan as it last rested. */
export function useAccountMap({ view, bundle, plan, pick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick | null }) {
  const index = view.index;
  const fund = pick?.fund;
  const asked = useMemo(() => (fund ? { bundle, ask: { index, plan, fund } } : null), [bundle, index, plan, fund]);
  return useAccountMapRun(asked);
}

/** The words of the map's case: the card's answer and line, and the panel's headline. */
export interface MapWords {
  answer: string;
  note: string;
  head: string;
}

/**
 * What the map says, for every case (F-131): `name` gives an account's short name, `house` is the receipt's account. The headline says only
 * which account leaves the most at the plan (or the accounts about the same there), and asks about plans like it, which the map answers;
 * the card names the accounts first somewhere on the map. Where another account becomes clearly cheaper is said on the plan's guides,
 * each on its own line from the plan, never in a sentence that could read as true at another plan.
 */
export function mapWords(map: AccountMap, house: string, name: (id: string) => string): MapWords {
  const lead = map.plan.lead;
  if (lead.kind === "empty") return { answer: m.empty, note: m.emptyNote, head: m.headEmpty };
  const atPlan = lead.kind === "near" ? m.near(lead.tied.map(name)) : lead.first === house ? m.cheapest(name(lead.first)) : m.cheaper(name(lead.first), name(house));
  // the accounts first somewhere on the map, in the map's order (the plan's first, then by area)
  const firsts = new Set([...map.field.first, ...map.edge.first].filter((k) => k >= 0));
  const named = map.accounts.filter((_, k) => firsts.has(k)).map(name);
  // one account first everywhere, every account the map prices having a price at every node (F-80): it is cheapest on the whole map
  const priced = [map.field, map.edge].every((f) => (f.missing ?? []).every((b) => b === 0));
  const answer = named.length === 1 && priced ? m.wholeMap(named[0] ?? "") : m.orList(named.length ? named : [name(lead.kind === "near" ? (lead.tied[0] ?? "") : lead.first)]);
  return { answer, note: m.atPlanNote(atPlan), head: `${m.atPlanHead(atPlan)} ${m.similar}` };
}

/** P-01 as the card says it, and as a figure that opens its source. */
const thetaText = (bundle: IndicesBundle) => fmt.pct(tieShareOf(bundle) * 100);
const thetaValue = (bundle: IndicesBundle): SiteValue | null => {
  const v = bundle.p01.value;
  return v ? asParameter(bundle.p01, v) : null;
};

/** The card of the map, in plain words (a card is a tab, and a tab holds no control); where there is no map, why. */
export function mapCard(answer: MapAnswer, view: InvestView, bundle: IndicesBundle, house: string, held: boolean): TabCard {
  if (answer.kind === "unranked") return { key: "map", question: m.question, answer: m.unranked, note: m.unrankedWhy[answer.why], held };
  const words = mapWords(answer.map, house, (id) => shortOf(view, id));
  return { key: "map", question: m.question, answer: words.answer, note: words.note, held };
}

const shortOf = (view: InvestView, id: string) => (id === OTHERS ? m.others : (providerName(view, id)?.short ?? id));

/** The id the areas past the fifth are gathered under ("אחרות", charts.md: at most six colours, and here four pastels and a grey). */
const OTHERS = "others";

/** The plan at a point of the map: its amount and deposit as the reader pointed at them, the rest as the plan has them. */
function planAt(plan: WorkbenchInputs, p: RegionPoint, today: string): WorkbenchInputs {
  return { ...plan, amountNow: p[0], monthly: p[1], values: { ...plan.values, amount: entered(p[0], "nis", today, m.pointAbout), monthly: entered(p[1], "nis_per_month", today, m.pointAbout) } };
}

/** The accounts at a point as the map ranks them (`rankByValue`, the houses' order for a tie), on the data, index and fund the map was
 *  worked out for: their prices, most left first. */
function rankedWays(on: Asked<"map">, plan: WorkbenchInputs, houses?: readonly string[]): WayPrice[] {
  const { bundle } = on;
  const way = fundWayAt({ bundle, index: on.ask.index, plan, fundId: on.ask.fund, ...(houses ? { houses } : {}) });
  const ways = providersOfInvest(bundle).flatMap((s) => {
    const w = way?.byHouse[s.id];
    return rankedAt(w) ? [w] : [];
  });
  return rankByValue(ways, (w) => w.valueN);
}

/** A grid of the map's accounts as the map's areas: each index through `areaOf`, a second in the same area as its first not shown. */
function gridOf(f: MapField, areaOf: (k: number) => number): RegionGrid {
  const first = f.first.map((k) => (k < 0 ? -1 : areaOf(k)));
  return { cols: f.cols, rows: f.rows, first, second: f.second.map((k, n) => (k < 0 || areaOf(k) === first[n] ? -1 : areaOf(k))), ahead: f.ahead };
}

/**
 * The map's areas, in the map's order (the plan's first first). Each account's colour is set by the houses' order among the accounts on
 * the map, never by its rank at the plan, so it does not move as a slider does while the same accounts show: the first four of `order`
 * (the map's accounts, in the houses' order) each their own, the rest the grey, under its own name where one such account shows and
 * gathered under "אחרות" where more do. With each account's tone,
 * and the field and the edge as the areas' grids.
 */
export function mapAreas(view: InvestView, map: AccountMap, order: readonly string[]): { areas: RegionArea[]; toneOf: (id: string) => RegionTone; field: RegionGrid & { from: number }; edge: RegionGrid } {
  const palette = regionTones(4);
  const fixed = (id: string): RegionTone => {
    const k = order.indexOf(id);
    return (k >= 0 ? palette[k] : undefined) ?? "other";
  };
  const grey = map.accounts.filter((id) => fixed(id) === "other");
  const gather = grey.length > 1;
  const ids = [...map.accounts.filter((id) => !gather || fixed(id) !== "other"), ...(gather ? [OTHERS] : [])];
  const areas: RegionArea[] = ids.map((id) => ({ id, name: shortOf(view, id), tone: id === OTHERS ? "other" : fixed(id) }));
  const areaOf = (k: number) => {
    const id = map.accounts[k] ?? "";
    const at = ids.indexOf(gather && fixed(id) === "other" ? OTHERS : id);
    return at;
  };
  const toneOf = (id: string): RegionTone => fixed(id);
  return { areas, toneOf, field: { ...gridOf(map.field, areaOf), from: map.bottom }, edge: gridOf(map.edge, areaOf) };
}

/**
 * The reading of a point (the plan's where it is null): the account that leaves the most there and what it leaves, the next and how much
 * less (both F-65, in today's money), on the fund and plan the map was worked out for; each point priced once, as the pointer comes back.
 */
function readerOf(view: InvestView, bundle: IndicesBundle, on: Asked<"map">, toneOf: (id: string) => RegionTone): (p: RegionPoint | null) => RegionReading {
  const today = bundle.today;
  const { plan } = on.ask;
  const theta = tieShareOf(bundle);
  const thetaFig = thetaValue(bundle);
  const swatch = (id: string) => <Swatch shape="box" className={regionSwatch(toneOf(id))} />;
  const kept = new Map<string, RegionReading>();
  return (p) => {
    const k = p ? `${p[0]}|${p[1]}` : "plan";
    const had = kept.get(k);
    if (had) return had;
    const at = p ? planAt(plan, p, today) : plan;
    const pointHead = p ? m.pointHead(fmt.nisWhole(p[0]), fmt.nisWhole(p[1])) : `${m.planHead} ${m.pointHead(fmt.nisWhole(plan.amountNow), fmt.nisWhole(plan.monthly))}`;
    const nothing = at.amountNow === 0 && at.monthly === 0;
    const [w, r] = nothing ? [] : rankedWays(on, at);
    let got: RegionReading;
    if (!w) got = { head: pointHead, rows: [{ id: "none", label: nothing ? m.none : m.unrankedHere, value: null }] };
    else {
      const same = !!r && isTie(w.valueN, r.valueN, theta);
      const head = same ? (
        <>
          {pointHead}
          <span className="font-normal text-muted-foreground">
            {" · "}
            {m.sameNote}
            {thetaFig ? <Num value={thetaFig} display={thetaText(bundle)} /> : thetaText(bundle)}
          </span>
        </>
      ) : (
        pointHead
      );
      const wName = shortOf(view, w.providerId);
      const rows: RegionReading["rows"] = [{ id: w.providerId, swatch: swatch(w.providerId), label: wName, value: <>{m.leaves} <Num value={{ ...w.value, about: m.leftAbout(wName) }} display={fmt.nisWhole(Math.round(w.valueN))} /></>, ...(same ? {} : { wash: regionWash(toneOf(w.providerId)) }) }];
      if (r) {
        const gap = differenceOf([wName, w.value], [shortOf(view, r.providerId), r.value], "F-65", { today, about: m.gapAbout(wName), round: Math.round, ...carriedBy([w.value, r.value]) });
        rows.push({ id: r.providerId, swatch: swatch(r.providerId), label: shortOf(view, r.providerId), value: typeof gap.value === "number" ? <>{m.leaves} <Num value={gap} display={fmt.nisWhole(gap.value)} /> {m.less}</> : null });
      } else rows.push({ id: "only", label: m.onlyOne, value: null });
      got = { head, rows };
    }
    kept.set(k, got);
    return got;
  };
}

/** The panel before the first map comes: its question, and the room the map will take, so nothing under it moves when it comes. */
export function MapWaitingPanel() {
  return (
    <div className="flex min-h-[38rem] flex-col gap-4">
      <PanelHead kicker={m.question} />
    </div>
  );
}

/** The panel where there is no map: why. */
export function NoMapPanel({ why }: { why: "open-rule" | "unpriced" }) {
  return <PanelHead kicker={m.question} sub={<p className="text-sm text-muted-foreground">{m.unrankedWhy[why]}.</p>}>{m.unranked}</PanelHead>;
}

/**
 * A dashed line along each axis from the plan, with no words: to the switch, else to a stretch's end nearer the plan, each within the axis,
 * else to where the two are equal, else to the axis's end. A change past the axis's end, too far from the plan to be shown (F-131), is not
 * drawn to. It carries no figure: one would hold along that line only, while the map's areas and the reading at a point hold at every point.
 */
export function mapGuides(map: AccountMap): RegionGuide[] {
  return (["amount", "monthly"] as const).map((axis): RegionGuide => {
    const along = axis === "amount" ? ("x" as const) : ("y" as const);
    const end = map.max[axis];
    const s = map.switches[axis];
    if (s && s.at <= end) return { axis: along, at: s.at };
    const st = map.stretches[axis];
    if (st && Math.min(st.lo, st.hi) <= end) return { axis: along, at: st.dir === "up" ? st.lo : st.hi };
    const e = map.equal[axis];
    if (e && e.at <= end) return { axis: along, at: e.at };
    return { axis: along, at: end };
  });
}

/**
 * The panel of the map. Memoised, as are the words and guides it hands the map: the section around it renders on every move of a plan's
 * slider (the receipt's live figures), while the map, its words and the figures each switch prices change only with a new map; a guide
 * that changed would make the map place its words again, a search over the plot.
 */
export const AccountMapPanel = memo(function AccountMapPanel({ view, bundle, house, map, on }: { view: InvestView; bundle: IndicesBundle; house: string; map: AccountMap; on: Asked<"map"> }) {
  const { plan, fund } = on.ask;
  const fundName = allFunds(view).find((f) => f.rec.id === fund)?.name ?? fund;

  // the map's accounts in the houses' order: the order the colours go by
  const { areas, toneOf, field, edge } = useMemo(() => mapAreas(view, map, providersOfInvest(on.bundle).map((s) => s.id).filter((id) => map.accounts.includes(id))), [view, map, on]);

  const { head, guides, mark, edgeLabel } = useMemo(() => {
    const words = mapWords(map, house, (id) => shortOf(view, id));
    const guides = mapGuides(map);
    return {
      head: words.head,
      guides,
      mark: { at: [map.plan.amount, map.plan.monthly] as const, label: { text: m.plan } },
      edgeLabel: (id: string | null) => ({ text: id === null ? m.noDepositSame : m.noDeposit(shortOf(view, id)) }),
    };
  }, [view, house, map]);

  const reading = useMemo(() => readerOf(view, bundle, on, toneOf), [view, bundle, on, toneOf]);

  return (
    <div className="flex flex-col gap-4">
      <PanelHead
        kicker={
          <>
            {m.kicker} <MixedName>{fundName}</MixedName>
          </>
        }
        sub={
          <p className="text-sm text-muted-foreground">
            <HeldMark words={m.what(plan.years)} mark={<HelpMark about={m.howTo.about} text={m.howTo.text(thetaText(bundle))} />} />
          </p>
        }
      >
        {head}
      </PanelHead>
      {/* a new map is another chart: a point kept on the old one goes with it */}
      <RegionMap
        key={`${fund}|${map.plan.amount}|${map.plan.monthly}|${map.max.amount}|${map.max.monthly}`}
        max={{ x: map.max.amount, y: map.max.monthly }}
        areas={areas}
        field={field}
        edge={edge}
        edgeLabel={edgeLabel}
        bandLabel={{ text: m.same, pair: m.samePair }}
        mark={mark}
        guides={guides}
        xTitle={m.xTitle}
        yTitle={m.yTitle}
        xTick={(v) => (v === 0 ? "0" : fmt.compactAxis(v))}
        yTick={(v) => (v === 0 ? "0" : fmt.compactAxis(v))}
        snap={{ x: snapOf(map.max.amount), y: snapOf(map.max.monthly) }}
        reading={reading}
      />
    </div>
  );
});

/** The step a read point is rounded to: a power of ten about a fiftieth of the axis (1,000 ₪ on 200,000, 10 ₪ on 4,000). */
const snapOf = (max: number) => 10 ** Math.floor(Math.log10(max / 50));
