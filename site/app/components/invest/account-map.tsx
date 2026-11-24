// "מתי חשבון אחר זול יותר?" under the lists of the index page: which account costs least with the receipt's fund at each mix of today's
// amount and monthly deposit (F-131), the plan's years, return and inflation held. The map is worked out in the page's worker once the plan
// has rested (lib/account-map.ts); a point the reader reads is priced here, at that point, as the lists price it (`fundWayAt`), so its
// figures are the list's own. Its words cover every case: one account cheapest everywhere, no switch along either of the plan's lines, a
// switch only one way, a switch below the plan, and the receipt's account not the cheapest at the plan.
import { useMemo, type ReactNode } from "react";
import { invest as c } from "../../copy";
import type { AccountMap, MapSwitch } from "../../lib/account-map";
import { fmt } from "../../lib/format";
import { fundWayAt, planInputs, WHOLE_PLAN, type InvestView, type WayPrice } from "../../lib/invest";
import { useAccountMapRun } from "../../lib/invest-run";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { rankedAt } from "../../lib/stretch";
import { computed, differenceOf, entered, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { ChartReadout, MixedName, PanelHead, RegionMap, regionSwatch, regionTones, Swatch, type RegionArea, type RegionPoint, type RegionTile, type RegionTone, type TabCard } from "../kit";
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

/**
 * What the map says, for every case (F-131): `name` gives an account's short name, `fig` writes a switch's figure (plain words on the card,
 * a figure that opens its sheet in the panel), and `house` is the receipt's account.
 */
export function mapWords<F>(map: AccountMap, house: string, name: (id: string) => string, fig: (s: MapSwitch, axis: "amount" | "monthly") => F): MapWords<F> {
  const w = name(map.plan.winner);
  const { amount: sa, monthly: sm } = map.switches;
  const start = map.plan.winner === house ? m.headCheapest(w) : m.headCheaper(w, name(house));
  // "מעל כ־108 אלף ₪", "מתחת לכ־2,400 ₪ בחודש": a switch's side, its figure and, a month's, its unit
  const at = (s: MapSwitch, axis: "amount" | "monthly", today: boolean): (string | F)[] => [s.dir === "up" ? m.above : m.below, fig(s, axis), axis === "monthly" ? ` ${m.perMonth}` : today ? ` ${m.today}` : ""];
  if (map.winners.length === 1) {
    return map.plan.winner === house
      ? { answer: [m.noOther], note: [m.cheapestAll(w)], head: [start, " ", m.headAll] }
      : { answer: [m.already(w)], note: [m.insteadOf(name(house))], head: [start, " ", m.headAll] };
  }
  const first = sa ?? sm;
  if (!first) {
    return map.plan.winner === house ? { answer: [m.stays(w)], note: [m.staysNote], head: [start, " ", m.headStays] } : { answer: [m.already(w)], note: [m.insteadOf(name(house))], head: [start, " ", m.headStays] };
  }
  const firstAxis = sa ? "amount" : "monthly";
  const second = sa && sm ? sm : null;
  const allUp = [sa, sm].every((s) => !s || s.dir === "up");
  // the second switch: the same account ("או מעל כ־2,400 ₪ בחודש"), or another in words of its own ("וואן זירו זול יותר מעל …")
  const then = (s: MapSwitch, where: "card" | "head"): (string | F)[] => (s.to === first.to ? [where === "card" ? `${m.or} ` : `, ${m.or} `] : [where === "card" ? `${name(s.to)} ` : `. ${m.cheaperFrom(name(s.to))} `]);
  const head: (string | F)[] = [start, " ", m.cheaperFrom(name(first.to)), " ", ...at(first, firstAxis, true), ...(second ? [...then(second, "head"), ...at(second, "monthly", true)] : []), "."];
  const tail = allUp ? m.upTo(w) : m.atPlan(w);
  if (map.plan.winner !== house) return { answer: [m.already(w)], note: [m.insteadOf(name(house))], head };
  return {
    answer: [name(first.to), ", ", ...at(first, firstAxis, false)],
    note: second ? [...then(second, "card"), ...at(second, "monthly", false), ". ", tail] : [tail],
    head,
  };
}

/** The card of the map, in plain words (a card is a tab, and a tab holds no control). */
export function mapCard(map: AccountMap, view: InvestView, house: string, held: boolean): TabCard {
  const words = mapWords(map, house, (id) => shortOf(view, id), (s) => fmt.nisRough(s.at));
  return { key: "map", question: m.question, answer: words.answer.join(""), note: words.note.join(""), held };
}

const shortOf = (view: InvestView, id: string) => (id === OTHERS ? m.others : (providerName(view, id)?.short ?? id));

/** The id the areas past the fourth are gathered under ("אחרות", charts.md: at most six colours, and here four pastels). */
const OTHERS = "others";

/** The plan at a point of the map: its amount and deposit as the reader pointed at them, the rest as the plan has them. */
function planAt(plan: WorkbenchInputs, p: RegionPoint, today: string): WorkbenchInputs {
  return { ...plan, amountNow: p[0], monthly: p[1], values: { ...plan.values, amount: entered(p[0], "nis", today, m.pointAbout), monthly: entered(p[1], "nis_per_month", today, m.pointAbout) } };
}

/** The accounts at a point as the lists rank them: the one that costs least and the next, with their figures. */
function firstTwoAt(view: InvestView, bundle: IndicesBundle, plan: WorkbenchInputs, fund: string): WayPrice[] {
  const way = fundWayAt({ bundle, index: view.index, plan, fundId: fund });
  const ranked = Object.values(way?.byHouse ?? {}).filter(rankedAt);
  return ranked.sort((a, b) => b.valueN - a.valueN || shortOf(view, a.providerId).localeCompare(shortOf(view, b.providerId), "he")).slice(0, 2);
}

export function AccountMapPanel({ view, bundle, plan, pick, map }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; map: AccountMap }) {
  const today = bundle.today;
  const fundName = allFunds(view).find((f) => f.rec.id === pick.fund)?.name ?? pick.fund;
  // the first four winners each their own colour, the plan's first; the rest gathered in a grey
  const gathered = (id: string) => (map.winners.indexOf(id) >= 4 && map.winners.length > 5 ? OTHERS : id);
  const ids = [...new Set(map.winners.map(gathered))];
  const tones = regionTones(ids.length);
  const areas: RegionArea[] = ids.map((id, k) => ({ id, name: shortOf(view, id), tone: id === OTHERS ? "other" : (tones[k] ?? "other") }));
  const toneOf = new Map<string, RegionTone>(areas.map((a) => [a.id, a.tone]));
  const tiles: RegionTile[] = map.tiles.map((t) => ({ id: gathered(t.id), poly: t.poly }));
  const edge = map.edge.map((e) => ({ ...e, id: gathered(e.id) }));

  // a switch as a figure: what F-131 reads is the plan and the two accounts' figures there
  const inputs = planInputs(plan, WHOLE_PLAN);
  const switchValue = (s: MapSwitch, axis: "amount" | "monthly"): SiteValue => computed(Math.round(s.at), axis === "amount" ? "nis" : "nis_per_month", "F-131", inputs, { today, about: m.switchAbout });
  const figure = (s: MapSwitch, axis: "amount" | "monthly") => <Num value={switchValue(s, axis)} display={fmt.nisRough(s.at)} />;
  const words = mapWords<ReactNode>(map, pick.house, (id) => shortOf(view, id), figure);
  const guides = (["amount", "monthly"] as const).flatMap((axis) => {
    const s = map.switches[axis];
    if (!s) return [];
    const unit = axis === "monthly" ? ` ${m.perMonth}` : "";
    return [{ axis: axis === "amount" ? ("x" as const) : ("y" as const), at: s.at, label: { text: `${m.about}${fmt.nisRough(s.at)}${unit}`, node: <>{m.about}{figure(s, axis)}{unit}</> } }];
  });

  const swatch = (id: string) => <Swatch shape="box" className={regionSwatch(toneOf.get(gathered(id)) ?? "other")} />;
  // a reading: the point's two cheapest accounts, the first's fees and how much more the second costs
  const reading = (p: RegionPoint | null): { head: ReactNode; rows: Row[] } => {
    const at = p ? planAt(plan, p, today) : plan;
    const head = p ? m.pointHead(fmt.nisWhole(p[0]), fmt.nisWhole(p[1])) : `${m.planHead} ${m.pointHead(fmt.nisWhole(plan.amountNow), fmt.nisWhole(plan.monthly))}`;
    if (at.amountNow === 0 && at.monthly === 0) return { head, rows: [{ id: "none", label: m.none, value: null }] };
    const [w, r] = firstTwoAt(view, bundle, at, pick.fund);
    if (!w) return { head, rows: [] };
    const rows: Row[] = [{ id: w.providerId, swatch: swatch(w.providerId), label: `${shortOf(view, w.providerId)} ${m.cheapest}`, value: <>{m.fees} <Num value={w.cost} display={fmt.nisWhole(Math.round(w.accountCost))} /></> }];
    if (r) {
      const gap = differenceOf([shortOf(view, w.providerId), w.value], [shortOf(view, r.providerId), r.value], "F-131", { today, about: m.gapAbout(shortOf(view, w.providerId)), round: Math.round });
      rows.push({ id: r.providerId, swatch: swatch(r.providerId), label: shortOf(view, r.providerId), value: <><Num value={gap} display={fmt.nisWhole(gap.value as number)} /> {m.more}</> });
    } else rows.push({ id: "only", label: m.onlyOne, value: null });
    return { head, rows };
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelHead
        kicker={
          <>
            {m.kicker} <MixedName>{fundName}</MixedName>
          </>
        }
        sub={<p className="text-sm text-muted-foreground">{m.what(fmt.years(plan.years))}</p>}
      >
        {words.head}
      </PanelHead>
      {/* a new map is another chart: a point kept on the old one goes with it */}
      <RegionMap
        key={`${pick.fund}|${map.plan.amount}|${map.plan.monthly}|${map.max.amount}|${map.max.monthly}`}
        max={{ x: map.max.amount, y: map.max.monthly }}
        areas={areas}
        tiles={tiles}
        borders={map.borders}
        edge={edge}
        edgeLabel={(id) => ({ text: m.noDeposit(shortOf(view, id)) })}
        mark={{ at: [map.plan.amount, map.plan.monthly], label: { text: m.plan } }}
        guides={guides}
        xTitle={m.xTitle}
        yTitle={m.yTitle}
        xTick={(v) => (v === 0 ? "0" : fmt.compactAxis(v))}
        yTick={(v) => fmt.number(v)}
        snap={{ x: snapOf(map.max.amount), y: snapOf(map.max.monthly) }}
        renderTip={(p) => {
          const r = reading(p);
          return (
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{r.head}</span>
              {r.rows.map((row) => (
                <span key={row.id} className="flex items-center gap-1.5">
                  {row.swatch}
                  <span>{row.label}</span>
                  {row.value && <span>· {row.value}</span>}
                </span>
              ))}
            </span>
          );
        }}
        renderBelow={(p) => {
          const r = reading(p);
          return <ChartReadout title={r.head} rows={r.rows.map((row) => ({ id: row.id, swatch: row.swatch, label: row.label, value: row.value }))} />;
        }}
      />
    </div>
  );
}

/** A row of a reading: an account with its colour and its figure, or a line of words. */
type Row = { id: string; swatch?: ReactNode; label: ReactNode; value: ReactNode };

/** The step a read point is rounded to: a power of ten about a fiftieth of the axis (1,000 ₪ on 200,000, 10 ₪ on 4,000). */
const snapOf = (max: number) => 10 ** Math.floor(Math.log10(max / 50));
