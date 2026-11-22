// The section "קוראים את העסקה" under the columns (method §10.6, `readingOf`), top to bottom: what each action costs by its size (a tab
// per action the deal prices: the share of the action on a log amount axis with the zones where a part decides, the deal's own marks, the
// reader's point and the reading at it, and a lane per fee), what a year of holding costs by the amount held (a tab per period: the fees'
// layers, the crossover, the drops, the reader's amount under the pointer and the range they set), and side by side, what changes and when
// (F-110, F-126, F-127) and what the law says of each fee with a cap line (F-113). The views are worked out in lib/fee-deal/charts.ts and
// the headlines' choices in lib/fee-deal/reading-heads.ts; this file words and draws them.
import { useMemo, useState, type ReactNode } from "react";
import { feeDeal as copy, values as valuesCopy } from "../../copy";
import type { FxSnapshot } from "../../lib/fx";
import type { SiteValue } from "../../lib/value";
import { countPhrase, fmt, formatValue, joinLead } from "../../lib/format";
import type { MonthKey } from "../../lib/fee-deal/model";
import type { FeeRef } from "../../lib/fee-deal/deal-read";
import type { LawRow, PeriodCard, PeriodRow, Reading, StatedPart } from "../../lib/fee-deal/reading";
import { roundAmount, settleRange, type ActionReading, type ActionTab, type ActionView, type AmountRange, type ChartFee, type CurvePoint, type HeldReading, type HeldView, type Lane, type LanePart, type OneView, type TimelinePeriod, type UndrawnView, type UnpricedView } from "../../lib/fee-deal/charts";
import { lawHead, periodsHead, type PeriodsHead } from "../../lib/fee-deal/reading-heads";
import { AmountLanes, Card, EmptyState, HelpMark, NumberField, PanelHead, PERIOD_WIDE, PeriodTrack, periodColumns, RangeFields, SegmentedControl, ShareBar, ShareChart, ShareStack, Swatch, Tag, TypedPlain, When, cx, fill, shareAt, shareTicks, type AmountLane, type AmountLanePart, type ShareMark } from "../kit";
import { Num, Ruled } from "../provenance";
import { leftByPanel, type LeftOut } from "../../lib/fee-deal/left-out";
import { FeeOpen, useFeeLinks } from "./links";
import { LeftOutList, LeftOutNotes } from "./left-out";
import { CapRules, Fig, LawBlock, PriceWords, feeColour, feeName, formOf, refName, sumDisplay } from "./words";
import { sumUnit } from "../../lib/fee-deal/values";
import { assertNever } from "@finance-tool/schema";

const w = copy.read;

/** A figure as a plain string, as `Fig` shows it: for a chart's words, which are drawn, not read as values. */
const textOf = (v: SiteValue): string => sumDisplay(v)?.(v.value as number) ?? formatValue(v.value as number, v.unit, v.state);
/** A word of an action's tab, by the tab's key where it has its own ("trade:sell"), else by its action. */
const tabWord = (table: Record<string, string>, tab: { key: string; action: string }) => table[tab.key] ?? table[tab.action] ?? "";
/** A period's first month in words with its lead ("מינואר 2027"), as a plain string for a control's option. */
const fromText = (m: MonthKey) => `${joinLead(w.periods.from, fmt.period(m))}${fmt.period(m)}`;
const colourOf = (f: ChartFee) => feeColour(f.ref.kind, f.ref.house);
/** A list in words: "א, ב ו־ג", with the words before the last item given. */
function joined(items: ReactNode[], sep: string, and: string): ReactNode {
  return items.map((x, k) => (
    <span key={k}>
      {k === 0 ? "" : k === items.length - 1 ? and : sep}
      {x}
    </span>
  ));
}

/** A curve's samples (F-123's shares, 0.0077 for 0.77%) as the chart draws them, in percent. */
const asPercents = (points: readonly CurvePoint[]): CurvePoint[] => points.map((p) => ({ at: p.at, share: p.share * 100, ...(p.layers ? { layers: p.layers.map((v) => v * 100) } : {}) }));

/** The middle of a stretch on a log axis, held inside the axis: where a tap on a lane's part puts the reader's amount. */
function middleOf(p: { from: number; to: number | null }, range: AmountRange): number {
  const lo = Math.max(p.from, range.lo);
  const hi = p.to === null ? range.hi : Math.min(p.to, range.hi);
  return Math.max(range.lo, Math.min(range.hi, roundAmount(Math.sqrt(lo * hi))));
}


/**
 * A figure after its lead in a sentence: the lead's last word held to the figure ("מ־15,600 $") and the words before it free to break. A
 * lead of several words inside the figure's one no-wrap span would hold a whole headline on one line, past a phone's width.
 */
const splitLead = (lead: string): [string, string] => {
  const i = lead.trimEnd().lastIndexOf(" ");
  return i < 0 ? ["", lead] : [lead.slice(0, i + 1), lead.slice(i + 1)];
};
function FigAfter({ lead, ...rest }: { lead: string } & Omit<Parameters<typeof Fig>[0], "prefix">) {
  const [free, held] = splitLead(lead);
  return (
    <>
      {free}
      <Fig {...rest} prefix={held} />
    </>
  );
}
function NumAfter({ lead, ...rest }: { lead: string } & Omit<Parameters<typeof Num>[0], "prefix">) {
  const [free, held] = splitLead(lead);
  return (
    <>
      {free}
      <Num {...rest} prefix={held} />
    </>
  );
}

// ---------------------------------------------------------------- the lanes

/**
 * A part's words on its lane: its kind's lead and its figure ("מינימום 39 $", "0.199% ברבעון"), and on a maximum on each security what it
 * is on, before its period as the fee's card says it ("מקסימום 3,700 ₪ לכל נייר ערך ברבעון"); on a phone, without its period.
 */
function partWords(p: LanePart, phone: boolean): string {
  const lead = w.action.lane[p.part] ?? "";
  if (p.part === "free" || !p.figure) return lead.trim();
  const each = p.perSecurity ? copy.cases.parts.perSecurity.each : "";
  const per = p.per && !phone ? ` ${copy.price.per[p.per] ?? ""}` : "";
  return `${lead}${textOf(p.figure)}${each}${per}`;
}

/**
 * A fee's lane for the kit: its parts in words, or its price on one quiet line (what a share of what is held is of left to its group's
 * name); on a phone the period its parts are per joins its name ("… · ברבעון"). A maximum on each security puts a "?" after the name: the
 * chart charges it on one security (F-14).
 */
function laneOf(l: Lane, saved: boolean): AmountLane {
  const pers = new Set((l.parts ?? []).map((p) => p.per));
  const per = pers.size === 1 ? [...pers][0] : undefined;
  return {
    id: l.fee.ref.fee,
    name: refName(l.fee.ref),
    swatch: colourOf(l.fee).bg,
    edge: colourOf(l.fee).border,
    parts: l.parts?.map((p, k): AmountLanePart => ({ id: String(k), from: p.from, to: p.to, label: partWords(p, false), short: partWords(p, true) })) ?? null,
    ...(l.price ? { price: <PriceWords price={l.price} kind={l.fee.ref.kind} saved={saved} ofSaid /> } : {}),
    ...(per ? { per: `${w.action.lanePer}${copy.price.per[per] ?? ""}` } : {}),
    ...(l.group ? { group: l.group } : {}),
    ...(l.parts?.some((p) => p.perSecurity) ? { help: <HelpMark about={copy.panel.parts.perSecurity} text={w.held.perSecurity} /> } : {}),
  };
}

// ---------------------------------------------------------------- around a chart

/** The line beside a chart with a sum in another currency: the rate of F-84 it enters the chart at, and its day. */
function RateLine({ currency, rate, fx }: { currency: string; rate: SiteValue; fx: FxSnapshot | null }) {
  const r = w.chart.rate;
  return (
    <p>
      {r.before(copy.panel.currencies[currency] ?? currency)}
      <Num value={rate} />
      {r.per[currency] ?? ""}
      {fx ? <When iso={fx.date} lead={r.date} /> : null}.
    </p>
  );
}

/**
 * The unit's price a chart of a price per unit needs (F-112), a chart's field: a plain number that starts empty, in the currency the reading
 * asks it in; beside it, why the chart needs it. Until it is given the chart is not drawn.
 */
function UnitPriceField({ unit, fee, value, onChange }: { unit: NonNullable<Reading["unitPrice"]>; fee: string; value: number | null; onChange: (n: number | null) => void }) {
  const c = w.chart;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span aria-hidden="true" className="text-sm">
        {c.unitPrice}
      </span>
      <NumberField compact fit agorot optional start={null} label={c.unitPrice} unit={sumUnit(unit.currency)} value={value} isEntered={value !== null} validate={(n) => (n > 0 ? null : valuesCopy.errors.positive)} onCommit={onChange} onReset={() => onChange(null)} />
      <span className="text-sm text-muted-foreground">{fill(c.unitWhy, { name: fee })}</span>
    </div>
  );
}

/**
 * A part of a price the reading states without computing (method §10.6, "What the page states and does not compute"), on the fee it is
 * printed with; one that makes the action cost more than the chart shows is marked as a warning.
 */
function StatedLine({ part }: { part: StatedPart }) {
  const x = part.words;
  return (
    <li className="flex items-baseline gap-2">
      {part.understates ? <span className="text-caution" aria-hidden="true">▲</span> : <Swatch shape="box" className={cx("translate-y-px", feeColour(part.fee.kind, part.fee.house).bg)} />}
      <p>
        {refName(part.fee)}
        {copy.price.sep}
        {x.lead}
        {x.stated && <Ruled id={part.rules ?? []}>{x.stated}</Ruled>}
        {x.figure && <Fig value={x.figure} />}
        {x.tail}
      </p>
    </li>
  );
}

const dealFee = (f: FeeRef) => f.of ?? f.fee;
const sameWords = (a: StatedPart, b: StatedPart) => dealFee(a.fee) === dealFee(b.fee) && a.part === b.part && (a.words.figure?.value ?? null) === (b.words.figure?.value ?? null);
/**
 * The stated parts under a chart: those of its fees, less an offset fee's (its period's sub and the timeline say it), each said once where
 * a size's steps print the same words on each step, then under the deal fee's own name.
 */
function statedOf(parts: readonly StatedPart[], fees: readonly ChartFee[], offsets: readonly { fee: FeeRef }[] = []): StatedPart[] {
  const mine = parts.filter((s) => fees.some((f) => f.ref.fee === dealFee(s.fee)) && !offsets.some((o) => o.fee.fee === dealFee(s.fee)));
  return mine.filter((s, k) => mine.findIndex((t) => sameWords(s, t)) === k).map((s) => (s.fee.step && mine.filter((t) => dealFee(t.fee) === dealFee(s.fee) && t.part === s.part).every((t) => sameWords(s, t)) ? { ...s, fee: { ...s.fee, step: undefined } as FeeRef } : s));
}

/** Where nothing in a chart varies, its headline: one number in its place (charts.md), or that nothing is charged. */
function OneHeadline({ one, noun, held }: { one: OneView; noun: string; held: boolean }) {
  const words = held ? w.held.one : w.action.one;
  if (!one.one) return <>{one.prices.length === 0 ? w.held.free : held ? w.held.kicker : noun}</>;
  return (
    <>
      <Fig value={one.one.value} />
      {fill(words[one.one.of], { noun })}
    </>
  );
}

/** Each fee's price under a one-number panel. */
function OnePrices({ one, saved }: { one: OneView; saved: boolean }) {
  if (one.prices.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
      {one.prices.map((p) => (
        <li key={p.fee.ref.fee}>
          <FeeOpen fee={p.fee.ref} after={copy.price.sep} /> <PriceWords price={p.price} kind={p.fee.ref.kind} saved={saved} />
        </li>
      ))}
    </ul>
  );
}

function Undrawn({ view }: { view: UndrawnView }) {
  return view.why === "rate" ? <p className="text-sm text-muted-foreground">{w.chart.undrawn(copy.panel.currencies[view.currency] ?? view.currency)}</p> : null;
}

/**
 * An action whose every fee is left out for a price not given, in place of its chart (`UnpricedView`): that it is not worked out yet, what
 * each fee's price is missing and where, and the button that opens the first fee's case missing it, as the fee's own note does.
 */
function UnpricedBody({ view, tab }: { view: UnpricedView; tab: ActionTab }) {
  const links = useFeeLinks();
  const u = copy.unpriced;
  const first = view.fees[0]!;
  const lines = view.fees.map(({ fee, unpriced }) => {
    const name = refName(fee);
    return u.feeLine(`${joinLead(u.feeIn, name)}${name}`, u.missing[unpriced.missing]!, unpriced.where);
  });
  return (
    <EmptyState inPanel title={u.tab(tabWord(w.action.tabs, tab), !!w.action.male[tab.action])} action={{ label: u.enter[first.unpriced.missing], onClick: () => links?.openCase(first.fee.fee, first.unpriced.cases[0] ?? null) }}>
      {lines.join(" ")}
    </EmptyState>
  );
}

/** What a panel leaves out but the fees its unpriced view already names (`UnpricedView`), which say it there. */
const leftBut = (left: LeftOut | undefined, view: UnpricedView): LeftOut | undefined =>
  left && { ...left, unpriced: left.unpriced.filter((f) => !view.fees.some((x) => x.fee.fee === f.fee)) };

/** The choice of period where a chart differs by period: "היום" for the one today is in, the others by their first month. */
function PeriodChoice({ periods, reading, value, onChange }: { periods: MonthKey[]; reading: Reading; value: number; onChange: (k: number) => void }) {
  const label = (m: MonthKey) => (reading.periods.find((p) => p.from === m)?.current ? w.held.today : fromText(m));
  return <SegmentedControl fit="always" label={w.held.periodsName} options={periods.map((m, k) => ({ value: String(k), label: label(m) }))} value={String(value)} onChange={(v) => onChange(Number(v))} />;
}

// ---------------------------------------------------------------- what an action costs

function ActionHeadline({ view, tab }: { view: ActionView; tab: ActionTab }) {
  const h = view.head;
  const a = w.action;
  if (h.kind === "below") {
    // an action at the axis's start: below `below` every action costs more than the rate, and this one the most on the chart
    const small = view.readAt(view.range.lo);
    return (
      <>
        {tabWord(a.noun, tab)}
        {a.of}
        <Num value={small.amount} display={fmt.nisWhole} />
        {a.below.costs}
        <Fig value={small.total} />
        {a.below.which}
        <Num value={small.share} />
        {a.male[tab.action] ? a.below.of.m : a.below.of.f}
        <FigAfter value={h.below} lead={a.below.only} />
        <NumAfter value={h.rate} lead={a.below.falls} display={fmt.pctPrinted} />
      </>
    );
  }
  if (h.kind === "max")
    return (
      <>
        <FigAfter value={h.at} lead={a.max.before} />
        {a.max.after}
      </>
    );
  return <>{countPhrase(h.n, a.marks)}</>;
}

/** The sub of an action's headline: the fees its rate adds up from, where several; a maximum; and the sale. */
function ActionSub({ view, tab }: { view: ActionView; tab: ActionTab }) {
  const h = view.head;
  const a = w.action;
  const sale = tab.action === "trade" && tab.side === "all" ? a.sameSale : "";
  if (h.kind !== "below" || (h.adds.length < 2 && !h.max)) return sale ? <p className="text-muted-foreground">{sale}</p> : null;
  return (
    <p className="text-muted-foreground">
      {h.adds.length > 1 && (
        <>
          <NumAfter value={h.rate} lead={a.above.lead} display={fmt.pctPrinted} />
          {a.above.are}
          {h.adds.map((x, k) => (
            <span key={x.fee.ref.fee}>
              {k > 0 && a.above.and}
              {refName(x.fee.ref)} <Fig value={x.rate} />
            </span>
          ))}
          {a.above.end}
        </>
      )}
      {h.max && (
        <>
          {h.adds.length > 1 && " "}
          <FigAfter value={h.max.at} lead={a.maxAt.lead} />
          {view.lanes.length === 1 ? (
            <>
              {a.maxAt.stops}
              <Fig value={h.max.figure} />
              {a.maxAt.falls}
            </>
          ) : (
            <>
              {a.maxAt.of}
              {refName(h.max.fee.ref)}
              {a.maxAt.feeStops}
              <Fig value={h.max.figure} />
            </>
          )}
          {a.maxAt.end}
        </>
      )}
      {sale && ` ${sale}`}
    </p>
  );
}

/** Why a fee's part costs what it does at the reader's amount: "המינימום, 39 $, קובע: 0.25% היו 47 ₪", or a rate's share. */
function WhyLine({ part, lane, share }: { part: ActionReading["parts"][number]; lane: Lane | undefined; share: string }) {
  const a = w.action;
  const p = part.part;
  if (!p) return null;
  if (p.part === "free") return <>{copy.price.free}</>;
  if (p.part === "rate") return p.figure ? <><Fig value={p.figure} /> {share}</> : null;
  const rate = lane?.parts?.find((x) => x.part === "rate")?.figure;
  // what the part adds to its rate alone, or saves off it, where both are known and differ
  if (rate && part.rateAlone && part.apart && (part.apart.value as number) > 0)
    return (
      <>
        {a.part[p.part]}
        <FigAfter value={part.apart} lead={(part.cost.value as number) > (part.rateAlone.value as number) ? a.why.adds : a.why.saves} />
        {a.why.alone}
        <Fig value={rate} />
        <FigAfter value={part.rateAlone} lead={a.why.would} />
        {a.why.end}
      </>
    );
  return (
    <>
      {a.part[p.part]}
      {p.figure && (
        <>
          {a.why.sep}
          <Fig value={p.figure} />
        </>
      )}
      {a.why.decides}
    </>
  );
}

/** The parts of a reading at the reader's amount, largest first, as the bar runs. */
const largestFirst = (parts: ActionReading["parts"]) => [...parts].sort((p, q) => (q.cost.value as number) - (p.cost.value as number));

/**
 * The reading at the reader's amount, beside the chart: the amount, the total and its share, the parts as a bar and as rows (largest
 * first), and the notes. A fee set apart (`strong`) is bold here as in the lanes; the others stay as they are.
 */
function ActionCard({ read, view, tab, strong, onStrong, notes }: { read: ActionReading; view: ActionView; tab: ActionTab; strong: string | null; onStrong: (id: string | null) => void; notes: ReactNode }) {
  const a = w.action;
  const share = tabWord(a.share, tab);
  const total = read.total.value as number;
  const parts = largestFirst(read.parts);
  return (
    <Card pad="aside" className="flex min-w-0 flex-col gap-3 bg-muted/40 text-sm">
      <p className="text-muted-foreground">
        {tabWord(a.noun, tab)}
        {a.of}
        <Num value={read.amount} display={fmt.nisWhole} className="font-semibold text-entered" />
        {read.inCurrency && (
          <>
            {" ("}
            <Fig value={read.inCurrency} />
            {")"}
          </>
        )}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <Fig value={read.total} className="text-3xl font-bold" />
        <span>
          <Num value={read.share} className="font-semibold" /> {share}
        </span>
      </p>
      {parts.length > 1 && total > 0 && (
        <ShareBar bare label={a.bar} parts={parts.map((p) => ({ id: p.fee.ref.fee, name: refName(p.fee.ref), share: Math.round(((p.cost.value as number) / total) * 100), className: colourOf(p.fee).bg, words: textOf(p.cost) }))} />
      )}
      <ul className="flex flex-col gap-2.5">
        {parts.map((p) => {
          const id = p.fee.ref.fee;
          return (
            <li key={id} onPointerEnter={(e) => e.pointerType === "mouse" && onStrong(id)} onPointerLeave={(e) => e.pointerType === "mouse" && onStrong(null)} className="flex flex-col gap-0.5">
              <span className={cx("flex items-center justify-between gap-3", strong === id && "font-semibold")}>
                <FeeOpen fee={p.fee.ref} />
                {/* a figure that stands alone at its row's end: its tap area in the layer of a control (app.css), over the figures of the line under it */}
                <Fig value={p.cost} className="font-semibold after:z-[1]" />
              </span>
              {/* the figures of the line under a fee's name take their tap areas in the layer of a control (app.css), so they reach their
                  44 px over the empty foot of the name's own target above them */}
              <span className="ps-5 text-xs text-muted-foreground [&_.num]:after:z-[1]">
                <WhyLine part={p} lane={view.lanes.find((l) => l.fee.ref.fee === id)} share={share} />
              </span>
            </li>
          );
        })}
      </ul>
      {notes}
    </Card>
  );
}

/** The reading at the point on one line, over the chart where the card stands under it (below 1024 px): "קנייה של 18,650 ₪ (5,714 $): 144 ₪, 0.77% מהקנייה". */
function ActionLine({ read, tab }: { read: ActionReading; tab: ActionTab }) {
  const a = w.action;
  return (
    <p className="text-muted-foreground lg:hidden">
      {tabWord(a.noun, tab)}
      {a.of}
      <Num value={read.amount} display={fmt.nisWhole} className="font-semibold text-entered" />
      {read.inCurrency && (
        <>
          {" ("}
          <Fig value={read.inCurrency} />
          {")"}
        </>
      )}
      {a.line.sep}
      <Fig value={read.total} className="font-semibold text-foreground" />
      {a.line.and}
      <Num value={read.share} /> {tabWord(a.share, tab)}
    </p>
  );
}

function ActionChart({ view, tab, stated, fx, left }: { view: ActionView; tab: ActionTab; stated: StatedPart[]; fx: FxSnapshot | null; left: LeftOut | undefined }) {
  const [held, setAt] = useState(view.start);
  const [strong, setStrong] = useState<string | null>(null);
  const range = view.range;
  // an edit to the deal can narrow the axis under a point the reader left: the point stays inside it
  const at = Math.max(range.lo, Math.min(range.hi, held));
  const points = useMemo(() => asPercents(view.sample(range, 480)), [view, range]);
  const read = view.readAt(at);
  // the value axis reaches six times the share at the deal's first mark, so the stretch where a percent decides is not a flat line on the floor
  // (where the first mark ends a free stretch its share is nothing, and the axis takes the curve's highest)
  const most = Math.max(...points.map((p) => p.share)) * 1.06;
  const first = shareAt(points, view.start);
  const top = first > 0 ? Math.min(most, first * 6) : most;
  const yTop = shareTicks(top).at(-1) ?? top;
  const over = points[0] && points[0].share > yTop ? w.action.over(fmt.pct(points[0].share >= 10 ? Math.round(points[0].share * 10) / 10 : points[0].share), fmt.nisWhole(range.lo)) : undefined;
  const share = read.share.value as number;
  const marks: ShareMark[] = view.marks.filter((m) => Math.abs(Math.log(m.at / at)) > 0.01).map((m, k) => ({ id: String(k), at: m.at, label: textOf(m.label) }));
  const move = (a: number) => setAt(Math.max(range.lo, Math.min(range.hi, roundAmount(a))));
  const notes = (
    <ul className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
      {statedOf(stated, view.fees).map((s) => (
        <StatedLine key={`${s.fee.fee}:${s.part}`} part={s} />
      ))}
      {view.rates.map((r) => (
        <li key={r.currency}>
          <RateLine currency={r.currency} rate={r.rate} fx={fx} />
        </li>
      ))}
      <LeftOutNotes left={left} />
    </ul>
  );
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <ActionLine read={read} tab={tab} />
        <ShareStack range={range} at={at} entered>
          <ShareChart
            range={range}
            points={points}
            top={top}
            {...(over ? { over } : {})}
            zones={view.zones.map((z) => ({ from: z.from, to: z.to, label: w.action.zones[z.kind] ?? "" }))}
            marks={marks}
            point={{ at, tag: `${fmt.nisWhole(at)} · ${fmt.pct(share)}` }}
            onPoint={move}
            spoken={w.action.point}
            xTitle={tabWord(w.action.x, tab)}
          />
          <AmountLanes title={view.lanes.length > 1 ? w.action.lanesEach : w.action.lanes} range={range} lanes={view.lanes.map((l) => laneOf(l, false))} at={at} entered strong={strong} onLane={setStrong} onPart={(_, p) => setAt(middleOf(p, range))} />
        </ShareStack>
      </div>
      <ActionCard read={read} view={view} tab={tab} strong={strong} onStrong={setStrong} notes={notes} />
    </div>
  );
}

/** The name of the fee on a tab that is priced per unit, from the reading's first period with one; null where none is. */
function unitFeeOf(reading: Reading, tab: ActionTab): string | null {
  for (const p of reading.periods)
    for (const r of p.rows) {
      const price = tab.side === "sell" ? (r.sale?.price ?? r.price) : r.price;
      if (price.form === "perUnit") return refName(r);
    }
  return null;
}

/** The fees a panel leaves out, under a view that draws no chart (one number, or none). */
function LeftNotes({ left }: { left: LeftOut | undefined }) {
  return left ? (
    <ul className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground empty:hidden">
      <LeftOutNotes left={left} />
    </ul>
  ) : null;
}

function ActionPanel({ reading, fx, saved, unitPrice, onUnitPrice, left }: { reading: Reading; fx: FxSnapshot | null; saved: boolean; unitPrice: number | null; onUnitPrice: (n: number | null) => void; left: Record<string, LeftOut> }) {
  const tabs = reading.panels.actions;
  const [key, setKey] = useState(tabs[0]!.key);
  const [k, setK] = useState(0);
  const tab = tabs.find((t) => t.key === key) ?? tabs[0]!;
  const view = tab.views[Math.min(k, tab.views.length - 1)]!;
  const periods = tab.views.map((v) => ("chart" in v ? v.chart.periods : "one" in v ? v.one.periods : "undrawn" in v ? v.undrawn.periods : v.unpriced.periods)[0]!);
  const unitFee = reading.unitPrice && tab.action === "trade" && !("unpriced" in view) ? unitFeeOf(reading, tab) : null;
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead
        kicker={w.action.kicker}
        sub={"chart" in view ? <ActionSub view={view.chart} tab={tab} /> : null}
        end={
          tabs.length > 1 ? (
            <SegmentedControl
              fit="always"
              label={w.action.tabsName}
              options={tabs.map((t) => ({ value: t.key, label: w.action.tabs[t.key] ?? t.key }))}
              value={tab.key}
              onChange={(v) => {
                setKey(v);
                setK(0);
              }}
            />
          ) : undefined
        }
      >
        {"chart" in view ? <ActionHeadline view={view.chart} tab={tab} /> : "one" in view ? <OneHeadline one={view.one} noun={tabWord(w.action.noun, tab)} held={false} /> : "unpriced" in view ? null : w.action.tabs[tab.key]}
      </PanelHead>
      {tab.views.length > 1 && <PeriodChoice periods={periods} reading={reading} value={k} onChange={setK} />}
      {reading.unitPrice && unitFee && <UnitPriceField unit={reading.unitPrice} fee={unitFee} value={unitPrice} onChange={onUnitPrice} />}
      {"chart" in view ? (
        <ActionChart key={`${tab.key}:${k}`} view={view.chart} tab={tab} stated={reading.panels.stated[tab.key] ?? []} fx={fx} left={left[tab.key]} />
      ) : "one" in view ? (
        <OnePrices one={view.one} saved={saved} />
      ) : "unpriced" in view ? (
        <UnpricedBody view={view.unpriced} tab={tab} />
      ) : (
        <Undrawn view={view.undrawn} />
      )}
      {!("chart" in view) && <LeftNotes left={"unpriced" in view ? leftBut(left[tab.key], view.unpriced) : left[tab.key]} />}
    </Card>
  );
}

// ---------------------------------------------------------------- what holding costs

function HeldHeadline({ view, later, from }: { view: HeldView; later: boolean; from: MonthKey }) {
  const h = view.head;
  const c = w.held.cross;
  if (h.kind === "marks") return <>{countPhrase(h.n, w.action.marks)}</>;
  return (
    <>
      {later && (
        <>
          <When iso={from} lead={w.periods.from} />
          {c.month}
        </>
      )}
      <FigAfter value={h.at} lead={c.lead} />
      {c.after}
    </>
  );
}

/** The sub: in a later period, what changed in it and the offsets it shows a year without; else how the share falls, and its bands. */
function HeldSub({ view, saved }: { view: HeldView; saved: boolean }) {
  const b = w.held.bands;
  if (view.changes.length > 0)
    return (
      <p className="text-muted-foreground">
        {view.changes.map((row) => (
          <span key={row.fee}>
            {refName(row)}
            {row.change === "starts" ? (
              <>
                {", "}
                <PriceWords price={row.price} kind={row.kind} saved={saved} />
                {w.held.joins[formOf(row)]}
              </>
            ) : (
              <>
                {copy.price.sep}
                {w.periods.change[row.change ?? "changes"]}
                <PriceWords price={row.price} kind={row.kind} saved={saved} />
                {". "}
              </>
            )}
          </span>
        ))}
        {view.offsets.map((o) => (
          <span key={o.fee.fee}>
            {w.held.offset.lead}
            {feeName(o.against)}
            {w.held.offset.month}
            {(o.action && w.action.noun[o.action]) || w.action.noun.none}
            {w.held.offset.end}
          </span>
        ))}
      </p>
    );
  return (
    <p className="text-muted-foreground">
      {view.falls && (saved ? w.held.fallsSaved : w.held.falls)}
      {view.cross !== null && view.head.kind === "cross" && view.bands.length > 0 && (
        <>
          <FigAfter value={view.head.at} lead={b.lead} />
          {b.decides}
          {joined(
            view.bands.map((band, k) => (
              <>
                <Fig value={band.rate} />
                {k === 0 && b.perYear}
                {band.to ? <FigAfter value={band.to} lead={b.upTo} /> : view.bands.length > 1 ? b.above : ""}
              </>
            )),
            b.sep,
            b.and,
          )}
          {view.bands.length > 1 && b.whole}
          {b.end}
        </>
      )}
    </p>
  );
}

/** A year at the reader's amount: the sum and its share, then each layer with its subtotal and its fees, the one set apart bolder. */
function HeldBox({ read, strong, saved }: { read: HeldReading; strong: string | null; saved: boolean }) {
  const x = w.held.box;
  return (
    <div className="flex min-w-48 flex-col gap-1 text-xs">
      <p className="font-semibold">
        <NumAfter value={read.amount} lead={x.head} display={fmt.nisWhole} />
      </p>
      <p className="text-muted-foreground">
        <Fig value={read.total} className="font-semibold text-foreground" />
        {x.sep}
        <Num value={read.share} />
        {saved ? x.shareSaved : x.share}
      </p>
      {read.groups.map((g) => (
        <div key={g.layer} className="flex flex-col gap-0.5 pt-1">
          <p className="flex justify-between gap-4 font-semibold">
            <span>{w.held.groups[g.layer]}</span>
            <Fig value={g.total} />
          </p>
          {g.rows.map((r) => (
            <p key={r.fee.ref.fee} className={cx("flex justify-between gap-4", strong === r.fee.ref.fee ? "font-semibold text-foreground" : "text-muted-foreground")}>
              <span className="flex items-center gap-1.5">
                <Swatch shape="box" className={colourOf(r.fee).bg} />
                {refName(r.fee.ref)}
              </span>
              <Fig value={r.cost} />
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

const sameRange = (a: AmountRange, b: AmountRange) => Math.abs(a.lo - b.lo) < 1e-6 * a.lo && Math.abs(a.hi - b.hi) < 1e-6 * a.hi;

function HeldChart({ view, stated, saved, left }: { view: HeldView; stated: StatedPart[]; saved: boolean; left: LeftOut | undefined }) {
  // the reader's own range, or none: then the view's, which follows an edit to the deal
  const [own, setRange] = useState<AmountRange | null>(null);
  const range = own ?? view.range;
  const [point, setAt] = useState<number | null>(null);
  const at = point !== null && point >= range.lo && point <= range.hi ? point : null;
  const [boxed, setBoxed] = useState(true);
  const [strong, setStrong] = useState<string | null>(null);
  const moved = own !== null && !sameRange(own, view.range);
  const points = useMemo(() => asPercents(view.sample(range, 480)), [view, range]);
  // the layers bottom up as the lanes stand: the shares, then the fixed sums
  const order = view.lanes.map((l) => view.fees.findIndex((f) => f.ref.fee === l.fee.ref.fee));
  const layered = points.map((p) => ({ at: p.at, share: p.share, layers: order.map((i) => p.layers?.[i] ?? 0) }));
  const top = Math.max(...points.map((p) => p.share)) * 1.06;
  const drop = (m: number) => view.drops.find((d) => Math.abs(d.at - m) < 1e-6 * d.at);
  const marks: ShareMark[] = view.marks.map((m, k) => {
    const d = drop(m.at);
    return {
      id: String(k),
      at: m.at,
      label: textOf(m.label),
      ...(m.kind === "cross" ? { sub: w.held.crossMark } : {}),
      ...(d ? { note: [w.held.drop.lead, `${textOf(d.over.value)}${w.held.drop.costs}${textOf(d.over.cost)}${w.held.drop.year}${textOf(d.under.value)}${w.held.drop.costs}${textOf(d.under.cost)}`] } : {}),
    };
  });
  const setFrom = (lo: number, hi: number) => setRange(settleRange(lo, hi, view.range));
  const r = w.held.range;
  const notes = statedOf(stated, view.fees, view.offsets);
  return (
    <div className="flex flex-col gap-4">
      <RangeFields lo={range.lo} hi={range.hi} moved={moved} onRange={setFrom} onReset={() => setRange(null)} words={r} />
      <ShareStack range={range} at={at}>
        <ShareChart
          range={range}
          points={layered}
          top={top}
          layers={view.lanes.map((l) => ({ id: l.fee.ref.fee, fill: colourOf(l.fee).fill, edge: colourOf(l.fee).stroke, group: l.group ?? "share" }))}
          groups={(["share", "fixed"] as const).map((g) => ({ id: g, label: w.held.groups[g]! }))}
          strong={strong}
          onStrong={setStrong}
          marks={marks}
          onRead={setAt}
          readAt={at}
          onBoxed={setBoxed}
          snap={roundAmount}
          tip={(a) => <HeldBox read={view.readAt(a)} strong={strong} saved={saved} />}
          onRange={setFrom}
          xTitle={saved ? w.held.xSaved : w.held.x}
          xShort={saved ? w.held.xShortSaved : w.held.xShort}
          height={300}
          narrowHeight={220}
        />
        <AmountLanes
          title={w.held.lanes}
          range={range}
          lanes={view.lanes.map((l) => laneOf(l, saved))}
          groups={[
            { id: "share", label: saved ? w.held.laneGroups.shareSaved! : w.held.laneGroups.share! },
            { id: "fixed", label: w.held.laneGroups.fixed! },
          ]}
          at={at}
          strong={strong}
          back
          onLane={setStrong}
          onPart={(_, p) => setAt(middleOf(p, range))}
        />
      </ShareStack>
      {/* where the box of values has no room beside the pointer (a phone), it stands after the lanes, before the notes */}
      {at !== null && !boxed && (
        <Card pad="tight" className="bg-muted/40">
          <HeldBox read={view.readAt(at)} strong={strong} saved={saved} />
        </Card>
      )}
      <ul className="grid gap-x-8 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground empty:hidden md:grid-cols-2">
        {notes.map((s) => (
          <StatedLine key={`${s.fee.fee}:${s.part}`} part={s} />
        ))}
        <LeftOutNotes left={left} />
      </ul>
    </div>
  );
}

function HeldPanel({ reading, saved, left }: { reading: Reading; saved: boolean; left: LeftOut | undefined }) {
  const views = reading.panels.held;
  const [chosen, setK] = useState(0);
  // an edit can join the periods under the one chosen: the last one left stands
  const k = Math.min(chosen, views.length - 1);
  const view = views[k]!;
  const periods = views.map((v) => ("chart" in v ? v.chart.periods : "one" in v ? v.one.periods : v.undrawn.periods)[0]!);
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={saved ? w.held.kickerSaved : w.held.kicker} sub={"chart" in view ? <HeldSub view={view.chart} saved={saved} /> : null} end={views.length > 1 ? <PeriodChoice periods={periods} reading={reading} value={k} onChange={setK} /> : undefined}>
        {"chart" in view ? <HeldHeadline view={view.chart} later={k > 0} from={periods[k]!} /> : "one" in view ? <OneHeadline one={view.one} noun="" held /> : saved ? w.held.kickerSaved : w.held.kicker}
      </PanelHead>
      {"chart" in view ? (
        <HeldChart key={k} view={view.chart} stated={reading.panels.stated.held ?? []} saved={saved} left={left} />
      ) : "one" in view ? (
        <OnePrices one={view.one} saved={saved} />
      ) : (
        <Undrawn view={view.undrawn} />
      )}
      {!("chart" in view) && <LeftNotes left={left} />}
    </Card>
  );
}

// ---------------------------------------------------------------- what changes and when

function PeriodsHeadline({ head }: { head: PeriodsHead }) {
  const p = w.periods;
  switch (head.kind) {
    case "one": {
      const c = head.change;
      return (
        <>
          <When iso={c.at} lead={p.at} /> {fill(p.one[c.change]!, { name: refName(c.fee) })}
          {c.change === "rises" && c.cap ? p.toCap[c.cap] : ""}
        </>
      );
    }
    case "starts":
      return <>{countPhrase(head.n, p.starts)}</>;
    case "one-month":
      return (
        <>
          <When iso={head.at} lead={p.oneMonth.lead} />
          {p.oneMonth.verb}
          {countPhrase(head.n, p.oneMonth.count)}
          {p.oneMonth.after}
        </>
      );
    case "months": {
      const m = p.months;
      if (head.months.length > 3)
        return (
          <>
            {m.lead}
            {countPhrase(head.n, m.count)}
            <When iso={head.months[0]!} lead={m.first} />
          </>
        );
      return (
        <>
          {head.months.map((at, k) => (
            <When key={at} iso={at} lead={k === 0 ? `${m.lead}${m.at}` : k === head.months.length - 1 ? ` ${m.and}` : `${m.sep}${m.at}`} />
          ))}
        </>
      );
    }
    default:
      return assertNever(head);
  }
}

/** A period's title and its end: "היום · אתם כאן" and "עד ינואר 2027, עוד חודשיים", or its first month ("מינואר 2027") and "בלי סוף". */
function StopHead({ period }: { period: PeriodCard }) {
  const p = w.periods;
  return (
    <div className="flex flex-col gap-0.5">
      <h4 className="flex flex-wrap items-center gap-2 font-semibold">
        {period.current ? p.today : <When iso={period.from} lead={p.from} />}
        {period.current && <Tag tone="primary">{p.here}</Tag>}
        {!period.current && !period.to && <Tag tone="neutral">{w.timeline.noEnd}</Tag>}
      </h4>
      {period.to && (
        <p className="text-sm text-muted-foreground">
          <When iso={period.to} lead={p.until} />
          {period.left ? <NumAfter value={period.left} lead={`, ${p.left}`} display={fmt.months} /> : period.length ? <NumAfter value={period.length} lead=", " display={fmt.months} /> : null}
        </p>
      )}
    </div>
  );
}

/**
 * A price that changed at a period's start: "{fee}: חינם ← 20 ₪ בחודש", the old price struck through and the new one underlined, and the
 * action that covers it where it is offset (F-127).
 */
function ChangeRow({ row, before, covers, saved }: { row: PeriodRow; before: PeriodRow | undefined; covers: TimelinePeriod["covers"]; saved: boolean }) {
  const t = w.timeline;
  return (
    <li className="flex flex-col gap-1">
      <p className="flex flex-wrap items-center gap-x-1">
        <FeeOpen fee={row} after={copy.price.sep} className="font-medium" />
        {before && (
          <span className="text-muted-foreground">
            <s>
              <PriceWords price={before.price} kind={before.kind} saved={saved} discount />
            </s>
            {t.arrow}
          </span>
        )}
        <span className="font-semibold underline decoration-1 underline-offset-[6px]">
          <PriceWords price={row.price} kind={row.kind} saved={saved} discount />
        </span>
      </p>
      {covers
        .filter((c) => c.fee.fee === row.fee)
        .map((c, k) => {
          const g = t.covers[formOf(row)]!;
          const noun = t.coverNoun[`${c.action}:${c.side}`] ?? t.coverNoun[`${c.action}:all`] ?? "";
          return (
            <p key={k} className="text-muted-foreground">
              {g.offsets.trim()} {feeName(c.against)}
              {g.own}
              {t.theirs[copy.nameForms[c.against]?.g ?? "m"]}
              {c.from === "any" ? (
                <>
                  {t.any}
                  {noun}
                  {g.any}
                </>
              ) : (
                <>
                  {noun}
                  {t.coverOf}
                  <Fig value={c.from} />
                  {g.from}
                </>
              )}
            </p>
          );
        })}
    </li>
  );
}

/** The prices that changed at a period's start, against the period before it (none for the first). */
const changedRows = (stop: TimelinePeriod, before: TimelinePeriod | undefined) => (before ? stop.card.rows.filter((r) => r.change || r.sale?.change) : []);

/** A period's column: under 768 px its own stop on the line (`track`) over it, as the columns stand one under the other there. */
function TimelineStop({ stop, before, saved, track }: { stop: TimelinePeriod; before: TimelinePeriod | undefined; saved: boolean; track: ReactNode }) {
  const t = w.timeline;
  const changed = changedRows(stop, before);
  const idle = stop.idle;
  return (
    <li className="flex min-w-0 flex-col gap-2 text-sm md:pe-6">
      <div className="md:hidden">{track}</div>
      <StopHead period={stop.card} />
      {changed.length > 0 && (
        <ul className="flex flex-col gap-2 rounded-md bg-muted/50 px-3 py-2">
          {changed.map((r) => (
            <ChangeRow key={r.fee} row={r} before={before?.card.rows.find((x) => x.fee === r.fee)} covers={stop.covers} saved={saved} />
          ))}
        </ul>
      )}
      {(idle || stop.rest) && (
        <p className="text-pretty">
          {idle && (
            <>
              <FigAfter value={idle.total} lead={t.idle.lead} className="font-semibold" />
              {!before && idle.parts.length > 1 ? (
                <>
                  {t.idle.parts}
                  {joined(
                    idle.parts.map((x) => (
                      <>
                        {refName(x.fee)} <Fig value={x.amount} />
                      </>
                    )),
                    t.idle.sep,
                    t.idle.and,
                  )}
                </>
              ) : null}
              {t.idle.end}
            </>
          )}
          {stop.rest && ` ${t.rest}`}
        </p>
      )}
    </li>
  );
}

function TimelineCard({ reading, saved }: { reading: Reading; saved: boolean }) {
  const head = periodsHead(reading.periods);
  const stops = reading.timeline;
  const current = Math.max(0, stops.findIndex((s) => s.card.current));
  // a period that holds a change takes a wide column, one with its words alone a narrow one
  const weights = stops.map((s, k) => (changedRows(s, stops[k - 1]).length > 0 ? PERIOD_WIDE : 1));
  // the rules a month with nothing in it is stated beside (F-126, a bank's), said once under the periods
  const bank = stops.find((s) => s.idle && s.idle.bank.length > 0)?.idle?.bank ?? [];
  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <PanelHead kicker={w.timeline.kicker}>{head && <PeriodsHeadline head={head} />}</PanelHead>
      <div className="hidden md:block">
        <PeriodTrack weights={weights} current={current} />
      </div>
      {/* the columns stand edge to edge, as the track's do, each keeping its room at its end, so each stop stands at its column's start */}
      <ol className="flex flex-col gap-4 md:grid md:gap-0" style={{ gridTemplateColumns: periodColumns(weights) }}>
        {stops.map((s, k) => (
          <TimelineStop key={s.card.from} stop={s} before={k > 0 ? stops[k - 1] : undefined} saved={saved} track={<PeriodTrack weights={[1]} current={k === current ? 0 : -1} />} />
        ))}
      </ol>
      {bank.length > 0 && (
        <p className="text-xs text-muted-foreground text-pretty">
          {w.timeline.bank.lead}
          <Ruled id={bank}>{w.timeline.bank.stated}</Ruled>
          {w.timeline.bank.tail}
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- the law

function LawHeadline({ rows }: { rows: readonly LawRow[] }) {
  const head = lawHead(rows);
  const l = w.law;
  if (!head) return null;
  switch (head.kind) {
    case "above":
    case "at":
      return <>{countPhrase(head.n, l[head.kind])}</>;
    case "below":
      return <>{l.below}</>;
    case "banned":
      return <>{head.n === 1 ? l.banned.one : l.banned.several}</>;
    case "no-cap":
      return <>{head.n === 1 ? l.noCap.one : l.noCap.several}</>;
    case "not-judged":
      return <>{l.notJudged}</>;
    default:
      return assertNever(head);
  }
}

/**
 * The law card: each fee with a cap as its block, a fee banned here or with a caveat on its line, and the fees the law sets no cap for
 * by name under one heading, each name opening the source of that claim.
 */
function LawCard({ reading, saved }: { reading: Reading; saved: boolean }) {
  const rows = reading.law.filter((r) => r.cap.state !== "absent");
  const plain = (r: LawRow) => r.cap.state === "none" && !r.cap.caveat;
  // a fee read across sizes has a row a step; the law sets no cap for it once
  const none = rows.filter(plain).filter((r, k, all) => all.findIndex((x) => dealFee(x) === dealFee(r)) === k);
  const named = rows.filter((r) => !plain(r));
  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <PanelHead kicker={w.law.kicker}>
        <LawHeadline rows={reading.law} />
      </PanelHead>
      {named.length > 0 && (
        <ul className="flex flex-col gap-3">
          {named.map((r) =>
            r.cap.state === "value" ? (
              <li key={r.fee} data-law-row={r.fee} tabIndex={-1} className="anchor-target flex flex-col gap-2 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-ring">
                <LawBlock row={r} saved={saved} first={reading.from} name={(inLine) => <FeeOpen fee={r} className="font-semibold" inLine={inLine} />} />
              </li>
            ) : (
              <li key={r.fee} data-law-row={r.fee} tabIndex={-1} className="anchor-target flex flex-wrap items-center gap-x-3 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-ring">
                <FeeOpen fee={r} className="font-medium" />
                <CapRules cap={r.cap} fee={refName(r)} />
              </li>
            ),
          )}
        </ul>
      )}
      {none.length > 0 && (
        <div className={cx("flex flex-col gap-2", named.length > 0 && "border-t border-border pt-3")}>
          <h4 className="text-sm font-semibold">{copy.standing.tag.none}</h4>
          {/* on a touch screen the names' lines stand 44 px apart, so each name takes its whole tap area */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm pointer-coarse:gap-y-6">
            {none.map((r) => (
              <li key={dealFee(r)} data-law-row={r.fee} tabIndex={-1} className="anchor-target inline-flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                <Swatch shape="box" className={feeColour(r.kind, r.house).bg} />
                {r.cap.state === "none" && <Num value={r.cap.value} display={refName({ ...r, step: undefined } as FeeRef)} name={copy.standing.noCapRules(refName(r))} />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- the section

/**
 * The reading's cards, in the order they are read: what each action costs, what holding costs, and at the foot what changes and when
 * beside what the law says (the timeline at the start, three fifths of the row; the law alone takes the row where nothing changes).
 * `left`: the fees the reading leaves out, each said as a note in the panel its fee stands on (`leftByPanel`, with the deal's `foreign`),
 * so none drops out unseen; where no panel stands, as a plain list. `saved`: the deal's product saves, so a share of what is held reads
 * "what has built up". `read`: whether any fee of the deal is read; where none is, only that list stands.
 */
export function ReadingCards({ reading, saved, fx, left, foreign = false, read = true, unitPrice = null, onUnitPrice = () => {} }: {
  reading: Reading;
  saved: boolean;
  fx: FxSnapshot | null;
  left?: LeftOut;
  foreign?: boolean;
  read?: boolean;
  /** The unit's price typed beside a chart of a price per unit (`readingOf`'s), and what typing it does. */
  unitPrice?: number | null;
  onUnitPrice?: (n: number | null) => void;
}) {
  const timeline = read && reading.timeline.length >= 2;
  const law = read && reading.law.some((r) => r.cap.state !== "absent");
  const panels = read ? reading.panels : { actions: [], held: [] };
  const placed = left ? leftByPanel(left, { foreign }, panels) : null;
  return (
    <TypedPlain className="nums-wide flex flex-col gap-4">
      {left && placed && <LeftOutList left={placed.rest} empty={!read} />}
      {read && reading.panels.actions.length > 0 && <ActionPanel reading={reading} fx={fx} saved={saved} unitPrice={unitPrice} onUnitPrice={onUnitPrice} left={placed?.byPanel ?? {}} />}
      {read && reading.panels.held.length > 0 && <HeldPanel reading={reading} saved={saved} left={placed?.byPanel.held} />}
      {(timeline || law) && (
        <div className={cx("grid items-start gap-4", timeline && law && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]")}>
          {timeline && <TimelineCard reading={reading} saved={saved} />}
          {law && <LawCard reading={reading} saved={saved} />}
        </div>
      )}
    </TypedPlain>
  );
}
