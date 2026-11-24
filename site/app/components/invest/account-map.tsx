// "מתי חשבון אחר זול יותר?" under the lists of the index page: which account costs least with the receipt's fund at each mix of today's
// amount and monthly deposit (F-131), the plan's years, return and inflation held; where two are within the site's tie threshold (P-01) they
// are about the same, and a switch is where another becomes clearly cheaper. The map is worked out in the page's worker once the plan has
// rested (lib/account-map.ts); a point the reader reads is priced here, at that point, as the lists price the fund (`fundWayAt`), once per
// point. Everything the panel reads is the fund and plan the map shown was worked out for, so a map still shown while the next is worked out
// never reads another fund. Its words cover every case: one account cheapest everywhere, the plan clearly in one account's area or in the
// band, a switch one way or both, up or down, a plan with nothing in it, and a fund no account is ranked with.
import { Fragment, memo, useMemo, type ReactNode } from "react";
import { invest as c } from "../../copy";
import type { AccountMap, MapField, MapStretch, MapSwitch } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { fundWayAt, planInputs, providersOfInvest, tieShareOf, WHOLE_PLAN, type InvestView, type WayPrice } from "../../lib/invest";
import { rankByValue } from "../../lib/rank";
import { useAccountMapRun, type Asked } from "../../lib/invest-run";
import type { MapAnswer } from "../../lib/invest-work";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rankedAt } from "../../lib/stretch";
import { asParameter, carriedBy, computed, differenceOf, entered, type SiteValue } from "../../lib/value";
import { isTie } from "@finance-tool/engine";
import { Num } from "../provenance";
import { edgeStretches, MixedName, PanelHead, RegionMap, regionSwatch, regionTones, regionWash, Swatch, type RegionArea, type RegionGrid, type RegionGuide, type RegionPoint, type RegionReading, type RegionTone, type TabCard } from "../kit";
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

/** The words of the map's case: the card's answer and line, and the panel's headline, each a list of words and figures. */
export interface MapWords<F> {
  answer: (string | F)[];
  note: (string | F)[];
  head: (string | F)[];
}

/** Where another account is clearly cheaper along one of the plan's lines: past a switch, or only in a stretch of it (F-131). */
type LineChange = { kind: "switch"; s: MapSwitch } | { kind: "stretch"; s: MapStretch };
/** Which figure of a change is written: a switch's, or a stretch's two ends. */
export type ChangeFigure = "switch" | "from" | "till" | "floor";

/**
 * What the map says, for every case (F-131): `name` gives an account's short name, `fig` writes a switch's or a stretch's figure (plain
 * words on the card, a figure that opens its sheet in the panel), `house` is the receipt's account and `theta` the tie threshold as the
 * card says it ("0.5%"). The words speak of the plan's own lines, as the search reads them at its samples, and of the map away from them
 * only to name an account clearly cheaper elsewhere on it where nothing changes along the lines (`elsewhere`).
 */
export function mapWords<F>(map: AccountMap, house: string, name: (id: string) => string, fig: (s: MapSwitch, axis: "amount" | "monthly", which: ChangeFigure) => F, theta: string): MapWords<F> {
  const lead = map.plan.lead;
  if (lead.kind === "empty") return { answer: [m.empty], note: [m.emptyNote], head: [m.headEmpty] };
  const changeOn = (axis: "amount" | "monthly"): LineChange | null => {
    const sw = map.switches[axis];
    const st = map.stretches[axis];
    return sw ? { kind: "switch", s: sw } : st ? { kind: "stretch", s: st } : null;
  };
  const sa = changeOn("amount");
  const sm = changeOn("monthly");
  // "מעל כ־108 אלף ₪", "מתחת לכ־2,400 ₪ בחודש", "בין כ־30 אלף ₪ לכ־70 אלף ₪": a switch's side and its figure, or a stretch's two ends;
  // a month's with its unit
  const at = (c: LineChange, axis: "amount" | "monthly", today: boolean): (string | F)[] => {
    const unit = axis === "monthly" ? ` ${m.perMonth}` : today ? ` ${m.today}` : "";
    // a switch down reads as the range the search checked it over, from its lowest amount up to its point ("בין כ־5,000 ₪ לכ־60 אלף ₪")
    const down = (s: MapSwitch, start: string) => [start, fig({ at: map.floor[axis], dir: "down", to: s.to }, axis, "floor"), m.betweenTo, fig(s, axis, "switch")];
    const sw = (s: MapSwitch) => (s.dir === "up" ? [m.above, fig(s, axis, "switch")] : down(s, m.between));
    if (c.kind === "switch") return [...sw(c.s), unit];
    const { lo, hi, dir, to, then: past } = c.s;
    const range = [m.between, fig({ at: lo, dir, to }, axis, "from"), m.betweenTo, fig({ at: hi, dir, to }, axis, "till")];
    if (!past) return [...range, unit];
    // the switch after the stretch: by the same account, in one run ("… ומעל כ־150 אלף ₪ היום"); by another, named after the stretch
    // ("…, וג׳ מעל כ־40 אלף ₪"), a month's with its unit
    if (past.to === to) return [...range, " ", ...(past.dir === "up" ? [m.thenAbove, fig(past, axis, "switch")] : down(past, m.thenBetween)), unit];
    return [...range, unit, m.thenOther(name(past.to)), ...sw(past), axis === "monthly" ? ` ${m.perMonth}` : ""];
  };
  const first = sa ?? sm;
  const firstAxis = sa ? "amount" : "monthly";
  const second = sa && sm ? sm : null;
  // the second change: the same account ("או מעל כ־2,300 ₪ בחודש"), or another in words of its own ("וואן זירו זול יותר בבירור מעל …")
  const then = (c: LineChange, to: string, where: "card" | "head"): (string | F)[] => (c.s.to === to ? [where === "card" ? `${m.or} ` : `, ${m.or} `] : [where === "card" ? `${name(c.s.to)} ` : `. ${m.cheaperFrom(name(c.s.to))} `]);
  // the bits of `map.asked` of some accounts: a node whose `missing` holds one of them has no ranked price for it there (F-80)
  const bitsOf = (ids: readonly string[]) => ids.reduce((b, id) => b | (map.asked.indexOf(id) >= 0 && map.asked.indexOf(id) < 31 ? 1 << map.asked.indexOf(id) : 0), 0);
  const lacks = (f: MapField, n: number, bits: number) => ((f.missing?.[n] ?? 0) & bits) !== 0;
  // with no change along the plan's lines, the accounts the map still shows clearly first over a share of it the eye can find (the plan's
  // own first aside, where it is θ ahead at the plan): a hundredth of the areas' nodes (ELSEWHERE_SEEN), or a run the bottom edge names (a
  // tenth of it, `edgeStretches`). The words never say nothing changes where the map draws another's clear area, and never name one
  // that is clear at a lone node. A node where an account of the plan's (its first, or its tied accounts) has no ranked price does not
  // count: there it is not compared, so not beaten (F-80)
  const plans = bitsOf(lead.kind === "clear" ? [lead.first] : lead.kind === "near" ? lead.tied : []);
  const elsewhere = (mine: readonly string[]): string[] => {
    const count = new Map<number, number>();
    map.field.first.forEach((k, n) => k >= 0 && (map.field.ahead[n] ?? 0) >= 1 && !lacks(map.field, n, plans) && count.set(k, (count.get(k) ?? 0) + 1));
    const seen = new Set([...count].filter(([, c]) => c >= ELSEWHERE_SEEN * map.field.first.length).map(([k]) => k));
    const edge = { ...map.edge, ahead: map.edge.ahead.map((a, n) => (lacks(map.edge, n, plans) ? 0 : a)) };
    for (const r of edgeStretches(edge)) seen.add(r.area);
    return map.accounts.filter((id, k) => seen.has(k) && !mine.includes(id));
  };
  // one account cheapest in every combination: only where every account of the map's is priced at every node
  const whole = () => {
    const bits = bitsOf(map.asked);
    return [map.field, map.edge].every((f) => f.first.every((_, n) => !lacks(f, n, bits)));
  };
  const switchesHead = (f: LineChange): (string | F)[] => [m.cheaperFrom(name(f.s.to)), " ", ...at(f, firstAxis, true), ...(second ? [...then(second, f.s.to, "head"), ...at(second, "monthly", true)] : []), "."];

  if (lead.kind === "near") {
    const names = lead.tied.map(name);
    const start = m.headNear(names);
    if (!first) {
      const away = elsewhere([]);
      if (away.length) return { answer: [m.near(names)], note: [m.elsewhere(away.map(name))], head: [start, " ", m.elsewhere(away.map(name)), "."] };
      return { answer: [m.near(names)], note: [m.nearStays(names.length)], head: [start, " ", m.headNearStays(names.length)] };
    }
    return { answer: [m.near(names)], note: [m.cheaperFrom(name(first.s.to)), " ", ...at(first, firstAxis, false)], head: [start, " ", ...switchesHead(first)] };
  }

  const w = name(lead.first);
  const mine = lead.first === house;
  const start = mine ? m.headCheapest(w) : m.headCheaper(w, name(house));
  const other = { answer: [m.already(w)], note: [m.insteadOf(name(house))] };
  if (!first) {
    if (map.accounts.length === 1 && whole()) return mine ? { answer: [m.noOther], note: [m.cheapestAll(w)], head: [start, " ", m.headAll] } : { ...other, head: [start, " ", m.headAll] };
    const away = elsewhere([lead.first]);
    if (away.length) {
      const head = [start, " ", m.elsewhere(away.map(name)), "."];
      return mine ? { answer: [away.map(name)[0] ?? "", ", ", m.elsewhereShort], note: [m.clearlyNote(theta)], head } : { ...other, head };
    }
    return mine ? { answer: [m.stays(w)], note: [m.staysNote], head: [start, " ", m.headStays] } : { ...other, head: [start, " ", m.headStays] };
  }
  const head = [start, " ", ...switchesHead(first)];
  if (!mine) return { ...other, head };
  return {
    answer: [name(first.s.to), ", ", ...at(first, firstAxis, false)],
    note: second ? [...then(second, first.s.to, "card"), ...at(second, "monthly", false), ". ", m.clearlyNote(theta)] : [m.clearlyNote(theta)],
    head,
  };
}

/** The least share of the map's areas an account clearly first elsewhere covers for the words to name it: as a band shows in the legend. */
const ELSEWHERE_SEEN = 0.01;

/** P-01 as the card says it, and as a figure that opens its source. */
const thetaText = (bundle: IndicesBundle) => fmt.pct(tieShareOf(bundle) * 100);
const thetaValue = (bundle: IndicesBundle): SiteValue | null => {
  const v = bundle.p01.value;
  return v ? asParameter(bundle.p01, v) : null;
};

/** The card of the map, in plain words (a card is a tab, and a tab holds no control); where there is no map, why. */
export function mapCard(answer: MapAnswer, view: InvestView, bundle: IndicesBundle, house: string, held: boolean): TabCard {
  if (answer.kind === "unranked") return { key: "map", question: m.question, answer: m.unranked, note: m.unrankedWhy[answer.why], held };
  const words = mapWords(answer.map, house, (id) => shortOf(view, id), (s) => fmt.nisRough(s.at), thetaText(bundle));
  return { key: "map", question: m.question, answer: words.answer.join(""), note: words.note.join(""), held };
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

/**
 * A switch, a stretch's end or an equal point as a figure: F-131 at the point of the plan's line where it is, resting on the plan and on the
 * runs there of the plan's accounts (the tied set, on a plan in the band) and of the account it names, with what they carry. The point's
 * own coordinate is F-131's, never the reader's entry.
 */
export function mapPointValue(view: InvestView, on: Asked<"map">, map: AccountMap, s: MapSwitch, axis: "amount" | "monthly", about: string): SiteValue {
  const { plan } = on.ask;
  const today = on.bundle.today;
  const unit = axis === "amount" ? "nis" : "nis_per_month";
  const lead = map.plan.lead;
  const mine = lead.kind === "clear" ? [lead.first] : lead.kind === "near" ? lead.tied : [];
  const houses = [...new Set([...mine, s.to])];
  const located = computed(s.at, unit, "F-131", planInputs(plan, WHOLE_PLAN), { today, about });
  const at: WorkbenchInputs = axis === "amount" ? { ...plan, amountNow: s.at, values: { ...plan.values, amount: located } } : { ...plan, monthly: s.at, values: { ...plan.values, monthly: located } };
  const ways = rankedWays(on, at, houses);
  const runs = ways.map((w) => w.value);
  const inputs = { ...planInputs(plan, WHOLE_PLAN), ...Object.fromEntries(ways.map((w) => [m.leftAbout(shortOf(view, w.providerId)), w.value])) };
  return computed(Math.round(s.at), unit, "F-131", inputs, { today, about, ...carriedBy(runs) });
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
 * The panel of the map. Memoised, as are the words and guides it hands the map: the section around it renders on every move of a plan's
 * slider (the receipt's live figures), while the map, its words and the figures each switch prices change only with a new map; a guide
 * that changed would make the map place its words again, a search over the plot.
 */
export const AccountMapPanel = memo(function AccountMapPanel({ view, bundle, house, map, on }: { view: InvestView; bundle: IndicesBundle; house: string; map: AccountMap; on: Asked<"map"> }) {
  const { plan, fund } = on.ask;
  const fundName = allFunds(view).find((f) => f.rec.id === fund)?.name ?? fund;
  const thetaFig = thetaValue(bundle);
  const thetaNode = thetaFig ? <Num value={thetaFig} display={thetaText(bundle)} /> : thetaText(bundle);

  // the map's accounts in the houses' order: the order the colours go by
  const { areas, toneOf, field, edge } = useMemo(() => mapAreas(view, map, providersOfInvest(on.bundle).map((s) => s.id).filter((id) => map.accounts.includes(id))), [view, map, on]);

  const { head, guides, mark, edgeLabel } = useMemo(() => {
    // each figure priced once, though the card's words and a guide both write it
    const priced = new Map<string, SiteValue>();
    const pointValue = (s: MapSwitch, axis: "amount" | "monthly", about: string) => {
      const k = `${axis}|${s.at}|${about}`;
      const had = priced.get(k);
      if (had) return had;
      const v = mapPointValue(view, on, map, s, axis, about);
      priced.set(k, v);
      return v;
    };
    const about = { switch: m.switchAbout, from: m.switchAbout, till: m.tillAbout, floor: m.floorAbout };
    const figure = (s: MapSwitch, axis: "amount" | "monthly", which: ChangeFigure) => <Num value={pointValue(s, axis, about[which])} display={fmt.nisRough(s.at)} />;
    const words = mapWords<ReactNode>(map, house, (id) => shortOf(view, id), figure, thetaText(bundle));
    // a guide along each axis: to the switch, else to a stretch, each on the axis, else to where the two are equal, else to the axis's end with no words
    const guides = (["amount", "monthly"] as const).map((axis): RegionGuide => {
    const along = axis === "amount" ? ("x" as const) : ("y" as const);
    const end = axis === "amount" ? map.max.amount : map.max.monthly;
    const unit = axis === "monthly" ? ` ${m.perMonth}` : "";
    const s = map.switches[axis];
    // a switch up by its point; one down by the range the search checked it over, from its lowest amount
    if (s && s.dir === "up") return { axis: along, at: s.at, label: { text: `${m.about}${fmt.nisRough(s.at)}${unit}`, node: <>{m.about}{figure(s, axis, "switch")}{unit}</> } };
    if (s) {
      const low = { at: map.floor[axis], dir: s.dir, to: s.to };
      return { axis: along, at: s.at, label: { text: `${m.between}${fmt.nisRough(low.at)}${m.betweenTo}${fmt.nisRough(s.at)}${unit}`, node: <>{m.between}{figure(low, axis, "floor")}{m.betweenTo}{figure(s, axis, "switch")}{unit}</> } };
    }
    // a stretch where another is clearly cheaper: the guide to its end nearer the plan, its words both ends
    const st = map.stretches[axis];
    if (st && Math.min(st.lo, st.hi) <= end) {
      const [lo, hi] = [{ at: st.lo, dir: st.dir, to: st.to }, { at: st.hi, dir: st.dir, to: st.to }];
      return { axis: along, at: st.dir === "up" ? st.lo : st.hi, label: { text: `${m.between}${fmt.nisRough(st.lo)}${m.betweenTo}${fmt.nisRough(st.hi)}${unit}`, node: <>{m.between}{figure(lo, axis, "from")}{m.betweenTo}{figure(hi, axis, "till")}{unit}</> } };
    }
    const e = map.equal[axis];
    if (e && e.at <= end) return { axis: along, at: e.at, label: { text: `${m.equalAt}${fmt.nisRough(e.at)}${unit}`, node: <>{m.equalAt}<Num value={pointValue(e, axis, m.equalAbout)} display={fmt.nisRough(e.at)} />{unit}</> } };
    return { axis: along, at: end };
    });
    return {
      // the headline's words and figures, each its own child
      head: words.head.map((x, k) => <Fragment key={k}>{x}</Fragment>),
      guides,
      mark: { at: [map.plan.amount, map.plan.monthly] as const, label: { text: m.plan } },
      edgeLabel: (id: string | null) => ({ text: id === null ? m.noDepositSame : m.noDeposit(shortOf(view, id)) }),
    };
  }, [view, bundle, house, map, on]);

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
            {m.what(plan.years)}
            {thetaNode}. {m.equalLine}
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
