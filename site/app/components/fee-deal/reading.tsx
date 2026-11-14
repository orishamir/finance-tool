// The section "קוראים את העסקה" under the columns (method §10.6, `readingOf`): the deal at a glance (glance.tsx) beside the points where the
// deal changes behaviour (F-112), the deal period after period (F-110), the two curves of F-112 where the library draws them, and what the
// law says of each fee with a cap line (F-113). The headlines and the choices are worked out in lib/fee-deal/reading-heads.ts; this file words and draws them.
import { useState, type ReactNode } from "react";
import type { DealSide } from "@finance-tool/engine";
import { feeDeal as copy, values as valuesCopy } from "../../copy";
import type { FxSnapshot } from "../../lib/fx";
import type { SiteValue } from "../../lib/value";
import { countPhrase, fmt, formatValue, joinLead } from "../../lib/format";
import type { MonthKey } from "../../lib/fee-deal/model";
import type { MarkView, StandingView } from "../../lib/fee-deal/parts";
import { UNIT_PRICE_KEY, type Curve, type LawRow, type PeriodCard, type PeriodRow, type Reading, type StatedPart, type Statement } from "../../lib/fee-deal/reading";
import { curveChoices, curveGroups, curveHead, firstChoice, lawHead, periodsHead, spansOf, withConversion, type CurveGroup, type CurveHead, type PeriodsHead, type Span } from "../../lib/fee-deal/reading-heads";
import { AmountChart, Card, ChoiceChips, NumberField, PanelHead, SegmentedControl, Swatch, Tag, TypedPlain, When, cx, fill } from "../kit";
import { Num, RulesChip } from "../provenance";
import { FeeOpen } from "./links";
import { CapRules, Fig, LawBlock, MeetSentence, PriceWords, StandingTag, custodyName, feeColour, feeName, refName, sumDisplay, upToDisplay } from "./words";
import { sumUnit } from "../../lib/fee-deal/values";

const w = copy.read;

const sideWord = (side: DealSide) => (side === "all" ? "" : ` ${copy.sides[side]}`);
const nounOf = (action: string | undefined) => copy.marks.noun[action ?? "none"] ?? copy.marks.noun.none!;
/** A period's first month in words with its lead ("ממרץ 2027"), as a plain string for a control's option. */
const fromText = (m: MonthKey) => `${joinLead(w.periods.from, fmt.period(m))}${fmt.period(m)}`;

// ---------------------------------------------------------------- the periods

/** A price that holds only on one side, and how it changed at the period's start, before it. */
function RowPrice({ row, saved, later }: { row: PeriodRow; saved: boolean; later: boolean }) {
  const lead = (change: string | undefined) => (later && change ? w.periods.change[change] : "");
  if (row.sale)
    return (
      <span>
        {copy.sides.buy} {lead(row.change)}
        <PriceWords price={row.price} kind={row.kind} saved={saved} />; {copy.sides.sell} {lead(row.sale.change)}
        <PriceWords price={row.sale.price} kind={row.kind} saved={saved} />
      </span>
    );
  return (
    <span>
      {lead(row.change)}
      <PriceWords price={row.price} kind={row.kind} saved={saved} />
    </span>
  );
}

/** A price's tag in a period: only where it is at or above the cap, which the period says beside it; below the cap is the law card's to say. */
function CapTag({ standing }: { standing: StandingView }) {
  const s = standing.standing;
  return s.judged && (s.standing === "at" || s.standing === "above") ? <StandingTag standing={standing} /> : null;
}

function PeriodView({ period, first, saved }: { period: PeriodCard; first: boolean; saved: boolean }) {
  const p = w.periods;
  return (
    <Card as="li" pad="tight" edge={period.current ? "accent" : undefined} className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h4 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          {period.current ? p.today : <When iso={period.from} lead={p.from} />}
          {period.current && <Tag tone="primary">{p.here}</Tag>}
        </h4>
        <p className="text-sm text-muted-foreground">
          {period.to ? <When iso={period.to} lead={p.until} /> : p.noEnd}
          {period.left ? (
            <>
              {p.sep}
              <Num value={period.left} prefix={p.left} display={fmt.months} />
            </>
          ) : (
            period.to &&
            period.length && (
              <>
                {p.sep}
                <Num value={period.length} display={fmt.months} />
              </>
            )
          )}
        </p>
      </div>
      <ul className="flex flex-col gap-1">
        {period.rows.map((r) => {
          const changed = !first && (!!r.change || !!r.sale?.change);
          const quiet = !changed && (!first || (r.price.form === "free" && (!r.sale || r.sale.price.form === "free")));
          return (
            <li key={r.fee} className={cx("-mx-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-md px-2 py-1 text-sm", changed && "bg-muted font-medium", quiet && "text-muted-foreground")}>
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <FeeOpen fee={r} />
                <CapTag standing={r.standing} />
                {r.sale && <CapTag standing={r.sale.standing} />}
              </span>
              <span className="text-end">
                <RowPrice row={r} saved={saved} later={!first} />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function PeriodsHeadline({ head }: { head: PeriodsHead }) {
  const p = w.periods;
  switch (head.kind) {
    case "one": {
      const c = head.change;
      return (
        <>
          <When iso={c.at} lead={p.from} /> {fill(p.one[c.change]!, { name: refName(c.fee) })}
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
  }
}

function PeriodsCard({ reading, saved }: { reading: Reading; saved: boolean }) {
  const head = periodsHead(reading.periods);
  const n = reading.periods.length;
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={w.periods.kicker}>{head && <PeriodsHeadline head={head} />}</PanelHead>
      <ol className={cx("grid items-start gap-4 md:grid-cols-2", n >= 3 && "xl:grid-cols-3")}>
        {reading.periods.map((p, k) => (
          <PeriodView key={p.from} period={p} first={k === 0} saved={saved} />
        ))}
      </ol>
    </Card>
  );
}

// ---------------------------------------------------------------- the curves

/** The stretches a statement or a curve holds in ("ממרץ 2028", "עד מרץ 2027", "ממרץ 2027 עד מרץ 2028"). */
function Spans({ spans }: { spans: Span[] }) {
  const s = w.points;
  return (
    <>
      {spans.map((x, k) => {
        const before = k === 0 ? "" : s.spanSep;
        return (
          <span key={k}>
            {x.from && <When iso={x.from} lead={`${before}${s.from}`} />}
            {x.to && <When iso={x.to} lead={x.from ? s.untilAfter : `${before}${s.until}`} />}
          </span>
        );
      })}
    </>
  );
}

/**
 * A curve's headline. `above` and `of`: the words around the rate above a minimum (by the action's noun, or what is held), said where the
 * curve has the rate of its whole group (F-111).
 */
function CurveHeadline({ head, noun, above, of }: { head: CurveHead; noun: string; above: string; of: string }) {
  const h = w.curves.head;
  if (head.kind === "min" && head.rate)
    return (
      <>
        {fill((head.mark.on === "held" ? h.minHeld : h.min).before, { noun })}
        <Fig value={head.mark.amount} />
        {h.minRate.lead}
        {above}
        {h.minRate.cost}
        <Num value={head.rate} /> {of}
      </>
    );
  switch (head.kind) {
    case "min":
    case "max": {
      const words = head.mark.on === "held" ? (head.kind === "min" ? h.minHeld : h.maxHeld) : head.kind === "min" ? h.min : h.max;
      return (
        <>
          {fill(words.before, { noun })}
          <Fig value={head.mark.amount} />
          {words.after}
        </>
      );
    }
    case "min-max":
      return (
        <>
          {h.minMax.before}
          <Fig value={head.min.amount} />
          {h.minMax.middle}
          <Fig value={head.max.amount} />
          {h.minMax.after}
        </>
      );
    case "meet": {
      // one fee that is a sum per period is named, the words agreeing with its name; several, or one of the person's own, are "the sums"
      // where another share of what is held may cost more below that value, the sums are said to be larger than custody, no more (F-112)
      const mark = head.mark;
      const one = mark.fees.length === 1 ? copy.nameForms[mark.fees[0]!.kind] : undefined;
      const named = one?.the ? one : undefined;
      return (
        <>
          {h.meet.before}
          <Fig value={mark.amount} />
          {named ? ` ${named.the}` : h.meet.sums}
          {mark.largest ? (named ? h.meetOne[named.g] : h.meet.largest) : `${copy.larger[named?.g ?? "mp"]}${custodyName(mark.against)}`}
        </>
      );
    }
    case "marks":
      return <>{countPhrase(head.n, h.marks)}</>;
  }
}

/**
 * A mark's label on the curve: its sum as the headline says it, in the bound's currency (the curve's place is that sum in shekels, F-84),
 * or its count of units for a price per unit's bound ("200 יחידות").
 */
export const markLabel = (mark: MarkView): string => {
  const v = mark.amount;
  if ((mark.kind === "min" || mark.kind === "max") && mark.units) return countPhrase(v.value as number, copy.marks.units);
  if (mark.kind === "flat") return upToDisplay(v)(v.value as number) ?? formatValue(v.value as number, v.unit, v.state);
  return sumDisplay(v)?.(v.value as number) ?? formatValue(v.value as number, v.unit, v.state);
};

/** The line beside a curve with a bound in another currency: the rate of F-84 it enters the curve at, and its day. */
function RateLine({ currency, rate, fx }: { currency: string; rate: Curve["rates"][number]["rate"]; fx: FxSnapshot | null }) {
  const r = w.curves.rate;
  return (
    <p className="text-sm text-muted-foreground">
      {r.before(copy.panel.currencies[currency] ?? currency)}
      <Num value={rate} />
      {r.per[currency] ?? ""}
      {fx ? <When iso={fx.date} lead={r.date} /> : null}.
    </p>
  );
}

/**
 * The unit's price a curve of a price per unit needs (F-112), a chart's field: a plain number that starts empty, in the currency the reading
 * asks it in; beside it, why the chart needs it. Until it is given the curve is not drawn.
 */
function UnitPriceField({ unit, fee, value, onChange }: { unit: NonNullable<Reading["unitPrice"]>; fee: string; value: number | null; onChange: (n: number | null) => void }) {
  const c = w.curves;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span aria-hidden="true" className="text-sm">
        {c.unitPrice}
      </span>
      <NumberField
        compact
        fit
        agorot
        optional
        start={null}
        label={c.unitPrice}
        unit={sumUnit(unit.currency)}
        value={value}
        isEntered={value !== null}
        validate={(n) => (n > 0 ? null : valuesCopy.errors.positive)}
        onCommit={onChange}
        onReset={() => onChange(null)}
      />
      <span className="text-sm text-muted-foreground">{fill(c.unitWhy, { name: fee })}</span>
    </div>
  );
}

function CurveCard({ group, reading, saved, fx, unitPrice, onUnitPrice }: { group: CurveGroup; reading: Reading; saved: boolean; fx: FxSnapshot | null; unitPrice: number | null; onUnitPrice: (n: number | null) => void }) {
  const c = w.curves;
  // the trade's curve of a price per unit: drawn once the unit's price is given, waiting for it until then
  const perUnit = group.undrawn.find((u) => u.why === "unit-price") ?? null;
  const unitFee = perUnit || group.curves.some((x) => UNIT_PRICE_KEY in x.inputs) ? unitFeeOf(reading, group) : null;
  const choices = curveChoices(group, reading.periods);
  const current = reading.periods.find((p) => p.current)?.from ?? null;
  const [picked, setPicked] = useState<MonthKey | null>(null);
  const chosen = choices.some((x) => x.from === picked) ? picked : firstChoice(choices, current);
  const curve = choices.find((x) => x.from === chosen)?.curve ?? null;
  const distinct = new Set(choices.map((x) => x.curve)).size;
  const key = group.on === "held" ? (saved ? "heldSaved" : "held") : group.side !== "all" && c.kicker[`${group.action}:${group.side}`] ? `${group.action}:${group.side}` : (group.action ?? "");
  const kicker = c.kicker[key] ?? c.kicker[group.action ?? ""] ?? "";
  const noun = nounOf(group.action);
  const xKey = group.on === "held" ? (saved ? "heldSaved" : "held") : (group.action ?? "trade");
  const optionLabel = (from: MonthKey) => (reading.periods.find((p) => p.from === from)?.current ? w.periods.today : fromText(from));
  // a choice of period where the curve is not one for every period of the deal: several curves, or one that holds only in some periods.
  // F-112 draws a curve only where a mark falls on it, so only the periods with a curve are choices; one such period is no choice, and the
  // card's small line names it instead.
  const whole = curve !== null && distinct === 1 && spansOf(curve.periods, reading.periods).length === 0;
  const choice =
    !whole && chosen ? (
      choices.length === 1 ? (
        <span className="text-sm text-muted-foreground">{optionLabel(chosen)}</span>
      ) : choices.length <= 4 ? (
        <SegmentedControl fit label={c.choose} options={choices.map((x) => ({ value: x.from, label: optionLabel(x.from) }))} value={chosen} onChange={setPicked} />
      ) : (
        <ChoiceChips line bleed="" ids={choices.map((x) => x.from)} labels={Object.fromEntries(choices.map((x) => [x.from, optionLabel(x.from)]))} value={chosen} ariaLabel={c.choose} onChange={setPicked} />
      )
    ) : null;
  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <PanelHead kicker={kicker} end={choice}>
        {curve && <CurveHeadline head={curveHead(curve)} noun={noun} above={c.head.minRate.above[group.on === "held" ? "held" : (group.action ?? "none")] ?? ""} of={copy.glance.of[group.on === "held" ? (saved ? "heldSaved" : "held") : `action:${group.action ?? "none"}`] ?? ""} />}
      </PanelHead>
      {reading.unitPrice && unitFee && <UnitPriceField unit={reading.unitPrice} fee={unitFee} value={unitPrice} onChange={onUnitPrice} />}
      {curve && (
        <AmountChart
          amounts={curve.amounts}
          bands={curve.series.map((s) => ({ id: s.fee.fee, label: refName(s.fee), fill: feeColour(s.fee.kind).fill, stroke: feeColour(s.fee.kind).stroke, swatch: feeColour(s.fee.kind).bg, values: s.costs }))}
          marks={[...new Set(curve.at)].map((at) => ({ id: String(at), at, label: markLabel(curve.marks[curve.at.indexOf(at)]!) }))}
          xTitle={c.x[xKey] ?? ""}
          tip={(a) => (group.on === "held" ? c.tipHeld(fmt.nisWhole(a)) : c.tipAction(noun, fmt.nisWhole(a)))}
          total={c.total}
        />
      )}
      {curve && withConversion(curve) && (
        <p className="text-sm text-muted-foreground">
          {c.conversion}
          {curve.side === "all" && ` ${c.sameSale}`}
        </p>
      )}
      {curve?.rates.map((r) => <RateLine key={r.currency} currency={r.currency} rate={r.rate} fx={fx} />)}
      {group.undrawn
        .filter((u) => u.why === "rate")
        .map((u) => (
          <p key={u.currency} className="text-sm text-muted-foreground">
            {c.undrawn(copy.panel.currencies[u.currency] ?? u.currency)}
          </p>
        ))}
    </Card>
  );
}

/** The name of the fee on a curve that is priced per unit, from the reading's first period with it; null where none is. */
function unitFeeOf(reading: Reading, group: CurveGroup): string | null {
  for (const p of reading.periods)
    for (const r of p.rows) {
      const price = group.side === "sell" ? (r.sale?.price ?? r.price) : r.price;
      if (price.form === "perUnit") return refName(r);
    }
  return null;
}

// ---------------------------------------------------------------- the points

const swatchOf = (s: Statement) => (s.kind === "mark" ? (s.mark.kind === "meet" ? s.mark.fees[0]!.kind : s.mark.fee.kind) : s.fee.kind);

/** A mark's sum: a count of units for a price per unit's bound ("200 יחידות"), else a sum in its currency. */
function MarkAmount({ mark, value }: { mark: MarkView; value: SiteValue }) {
  if ((mark.kind === "min" || mark.kind === "max") && mark.units) return <Num value={value} display={(n) => countPhrase(n, copy.marks.units)} />;
  return <Fig value={value} />;
}

/**
 * A part of a price and the stretch of the amount it decides (F-112): "{the part} של {name}, {its figure}, קובע בכל {noun} עד {amount}.",
 * from where it starts where that is above nothing, above the maximum's sum, and for a price per unit's bounds a count of units ("של עד
 * 200 יחידות"). The noun is the fee's own action: a conversion's mark is said on each conversion.
 */
function MarkSentence({ mark }: { mark: MarkView }) {
  const p = w.points;
  if (mark.kind === "meet") return <MeetSentence mark={mark} />;
  // a step's top (F-115), and where a sum per action's percent maximum gives way to the sum: where the fee's price changes, by the fee's
  // own name; the steps on either side are named by their stretch
  if (mark.kind === "edge" || (mark.kind === "cap" && mark.sum))
    return (
      <>
        {copy.cases.step.edge.before}
        <Fig value={mark.amount} />
        {fill(copy.cases.step.edge.mid, { name: feeName(mark.fee.kind, mark.fee.name) })}
      </>
    );
  if (mark.on === "held") {
    const words = mark.kind === "min" ? p.minHeld : p.maxHeld;
    return (
      <>
        {fill(words.before, { name: refName(mark.fee) })}
        <Fig value={mark.bound} />
        {words.middle}
        <Fig value={mark.amount} />
        {words.after}
      </>
    );
  }
  const noun = copy.marks.feeNoun[mark.fee.kind] ?? copy.marks.noun.none!;
  const of = copy.price.of[mark.fee.kind] ?? copy.price.of.default;
  const units = mark.kind !== "cap" && mark.kind !== "flat" && !!mark.units;
  let stretch: ReactNode;
  // a bound in units past the sum where the percent maximum or the flat price stops holds only above that sum: both are said
  if (units && mark.kind === "min" && mark.from)
    stretch = (
      <>
        {p.unitsFrom.above}
        <Fig value={mark.from} />
        {p.unitsFrom.upTo}
        <MarkAmount mark={mark} value={mark.amount} />
      </>
    );
  else if (units) stretch = <>{mark.kind === "max" ? p.unitsAbove : p.unitsUpTo}<MarkAmount mark={mark} value={mark.amount} /></>;
  else if (mark.kind === "max") stretch = <>{p.above}<Fig value={mark.amount} /></>;
  else {
    const to = mark.kind === "flat" ? <Num value={mark.amount} display={upToDisplay(mark.amount)} /> : <Fig value={mark.amount} />;
    const from = mark.kind !== "flat" ? mark.from : undefined;
    stretch = from ? (
      <>
        <Fig value={from} prefix={p.from} />
        {p.untilAfter}
        {to}
      </>
    ) : (
      <>
        {p.upTo}
        {to}
      </>
    );
  }
  return (
    <>
      {fill(p.part[mark.kind]!, { name: refName(mark.fee), side: sideWord(mark.side) })}
      {mark.kind === "cap" ? (
        <>
          <Num value={mark.bound} /> {of}
        </>
      ) : (
        <Fig value={mark.bound} />
      )}
      {fill(p.decides, { noun })}
      {stretch}
      {p.end}
    </>
  );
}

/**
 * A sum per unit with a minimum and no maximum: above the minimum's count of units the fee grows with the units, up to its percent
 * maximum where it has one ("מעל 200 יחידות העמלה גדלה עם מספר היחידות, ולא עוברת 1% מהפעולה"); null for any other price, which the
 * general words say.
 */
function noMaxUnits(statement: Extract<Statement, { kind: "no-max" }>, reading: Reading): ReactNode {
  const p = w.points.noMaxUnits;
  const row = reading.periods.find((x) => x.from === statement.periods[0])?.rows.find((r) => r.fee === statement.fee.fee);
  const price = statement.side === "sell" ? (row?.sale?.price ?? row?.price) : row?.price;
  if (price?.form !== "perUnit") return null;
  const min = reading.statements.find(
    (s): s is Extract<Statement, { kind: "mark" }> => s.kind === "mark" && s.mark.kind === "min" && s.mark.units === true && s.mark.fee.fee === statement.fee.fee && s.mark.side === statement.side,
  )?.mark;
  if (!min || min.kind !== "min") return null;
  return (
    <>
      {fill(p.before, { name: refName(statement.fee), side: sideWord(statement.side) })}
      <MarkAmount mark={min} value={min.amount} />
      {p.grows}
      {price.figures.cap && (
        <>
          {p.cap}
          <Num value={price.figures.cap} /> {copy.price.of[statement.fee.kind] ?? copy.price.of.default}
        </>
      )}
      {p.end}
    </>
  );
}

function StatementLine({ statement, reading }: { statement: Statement; reading: Reading }) {
  const p = w.points;
  const spans = spansOf(statement.periods, reading.periods);
  let body: ReactNode;
  if (statement.kind === "mark") body = <MarkSentence mark={statement.mark} />;
  else if (statement.kind === "no-max") body = noMaxUnits(statement, reading) ?? fill(p.noMax, { name: refName(statement.fee), side: sideWord(statement.side) });
  else {
    const row = reading.periods.find((x) => x.from === statement.periods[0])?.rows.find((r) => r.fee === statement.fee.fee);
    const price = row?.price;
    if (!price?.figures.rate || !price.per) return null;
    body = (
      <>
        {fill(p.every.before, { name: refName(statement.fee) })}
        <Num value={price.figures.rate} /> {copy.price.per[price.per]}, {copy.price.charged[statement.every]}
        {price.per > statement.every ? fill(p.every.part, { k: price.per / statement.every }) : "."}
      </>
    );
  }
  return (
    <li className="grid grid-cols-[0.75rem_minmax(0,1fr)] items-baseline gap-3 text-sm leading-relaxed">
      <Swatch shape="box" className={cx("translate-y-px", feeColour(swatchOf(statement)).bg)} />
      <p>
        {spans.length > 0 && (
          <>
            <Spans spans={spans} />
            {p.spanEnd}
          </>
        )}
        {body}
      </p>
    </li>
  );
}

/**
 * A part of a price the reading states without computing (method §10.6, "What the page states and does not compute"), on the fee it is printed with: "{fee}: נוספת עמלה של צד שלישי בלי סכום
 * בתעריפון, ולכן הפעולה עולה יותר ממה שמוצג."
 */
function StatedLine({ part }: { part: StatedPart }) {
  const x = part.words;
  return (
    <li className="grid grid-cols-[0.75rem_minmax(0,1fr)] items-baseline gap-3 text-sm leading-relaxed">
      <Swatch shape="box" className={cx("translate-y-px", feeColour(part.fee.kind).bg)} />
      <p>
        {/* the fee's name in words, as every point says it: the line's own swatch is its one dot */}
        {refName(part.fee)}
        {copy.price.sep}
        {x.lead}
        {x.figure && <Fig value={x.figure} />}
        {x.tail}
        {part.rules && (
          <>
            {" "}
            <RulesChip ids={part.rules} />
          </>
        )}
      </p>
    </li>
  );
}

/** Where the deal changes behaviour (F-112), then what the reading states of a price without computing it (method §10.6, "What the page states and does not compute"). */
function PointsCard({ reading }: { reading: Reading }) {
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={w.points.kicker}>{w.points.title}</PanelHead>
      <ul className="flex flex-col gap-2.5">
        {reading.statements.map((s, k) => (
          <StatementLine key={k} statement={s} reading={reading} />
        ))}
        {reading.stated.map((s) => (
          <StatedLine key={`${s.fee.fee}:${s.part}`} part={s} />
        ))}
      </ul>
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
  }
}

function LawRowView({ row, saved, first }: { row: LawRow; saved: boolean; first: MonthKey }) {
  if (row.cap.state === "absent") return null;
  // a fee the law sets no cap for, or bans here, is one line: its name, and the words, which open the rules
  if (row.cap.state === "none" || row.cap.state === "banned")
    return (
      <li data-law-row={row.fee} tabIndex={-1} className="anchor-target flex flex-wrap items-center gap-x-3 rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
        <FeeOpen fee={row} className="font-medium" />
        <CapRules cap={row.cap} fee={refName(row)} />
      </li>
    );
  return (
    <li data-law-row={row.fee} tabIndex={-1} className="anchor-target flex flex-col gap-2 py-2 first:pt-0 last:pb-0 rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
      <LawBlock row={row} saved={saved} first={first} name={<FeeOpen fee={row} className="font-medium" />} />
    </li>
  );
}

function LawCard({ reading, saved }: { reading: Reading; saved: boolean }) {
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={w.law.kicker}>
        <LawHeadline rows={reading.law} />
      </PanelHead>
      {/* one-line rows a short list, about 35 px apart; a fee with a cap is a block with room around it */}
      <ul className="flex flex-col gap-2">
        {reading.law.map((r) => (
          <LawRowView key={r.fee} row={r} saved={saved} first={reading.from} />
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------- the section

/**
 * The reading's cards, in the order they are read: the summary (`glance`, the deal at a glance) beside the points where the deal changes
 * behaviour, then the deal period after period, the curves, and the law. No row leaves half of it empty where another card can fill it:
 * the summary or the points alone take the law card beside them, else one curve does. `saved`: the deal's product saves, so a share of
 * what is held reads "what has built up". `read`: whether any fee of the deal is read; where none is, the summary stands alone.
 */
export function ReadingCards({ reading, saved, fx, glance, read = true, unitPrice = null, onUnitPrice = () => {} }: {
  reading: Reading;
  saved: boolean;
  fx: FxSnapshot | null;
  glance?: ReactNode;
  read?: boolean;
  /** The unit's price typed beside a curve of a price per unit (`readingOf`'s), and what typing it does. */
  unitPrice?: number | null;
  onUnitPrice?: (n: number | null) => void;
}) {
  const groups = read ? curveGroups(reading) : [];
  const points = read && reading.statements.length + reading.stated.length > 0 ? <PointsCard reading={reading} /> : null;
  const law = read && reading.law.length > 0 ? <LawCard reading={reading} saved={saved} /> : null;
  const first = [glance, points].filter(Boolean);
  // the law card fills the first row where it holds one card, else the curves' row where it holds one curve, else it stands alone
  const lawFirst = first.length === 1 && !!law;
  const lawCurve = !lawFirst && groups.length === 1 && !!law;
  return (
    <TypedPlain className="flex flex-col gap-4">
      {first.length > 0 && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {glance && <Card className="flex flex-col gap-4">{glance}</Card>}
          {points}
          {lawFirst && law}
        </div>
      )}
      {read && reading.periods.length >= 2 && <PeriodsCard reading={reading} saved={saved} />}
      {groups.length > 0 && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <CurveCard key={g.key} group={g} reading={reading} saved={saved} fx={fx} unitPrice={unitPrice} onUnitPrice={onUnitPrice} />
          ))}
          {lawCurve && law}
        </div>
      )}
      {!lawFirst && !lawCurve && law}
    </TypedPlain>
  );
}
