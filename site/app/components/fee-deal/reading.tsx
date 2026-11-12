// The section "קוראים את העסקה" under the columns (method §10.6, `readingOf`): the deal period after period (F-110), the two curves of
// F-112 where the library draws them, the points where the deal changes behaviour (F-112), and what the law says of each fee with a cap
// line (F-113). The headlines and the choices are worked out in reading-heads.ts; this file words and draws them.
import { useState, type ReactNode } from "react";
import type { DealSide } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import type { FxSnapshot } from "../../lib/fx";
import { countPhrase, fmt, joinLead } from "../../lib/format";
import type { MonthKey } from "../../lib/fee-deal/model";
import type { MarkView, StandingView } from "../../lib/fee-deal/parts";
import type { Curve, LawRow, PeriodCard, PeriodRow, Reading, Statement } from "../../lib/fee-deal/reading";
import { AmountChart, Card, ChoiceChips, PanelHead, SegmentedControl, Swatch, Tag, When, cx } from "../kit";
import { Num, RulesLine } from "../provenance";
import { curveChoices, curveGroups, curveHead, firstChoice, lawHead, periodsHead, spansOf, withConversion, type CurveGroup, type CurveHead, type PeriodsHead, type Span } from "./reading-heads";
import { CapCaveat, CapFigure, FeeCapBar, FeeName, PriceWords, StandingTag, StandingWords, feeColour, refName } from "./words";

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
                <FeeName fee={r} />
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
          <When iso={c.at} lead={p.from} /> {p.one[c.change]!.replace("{name}", refName(c.fee))}
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

/** The stretches a statement or a curve holds in, after `lead` ("ממרץ 2028", "עד מרץ 2027", "ממרץ 2027 עד מרץ 2028"). */
function Spans({ spans, lead = "" }: { spans: Span[]; lead?: string }) {
  const s = w.points;
  return (
    <>
      {spans.map((x, k) => {
        const before = `${k === 0 ? lead : s.spanSep}`;
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

function CurveHeadline({ head, noun }: { head: CurveHead; noun: string }) {
  const h = w.curves.head;
  const fill = (t: string) => t.replace("{noun}", noun);
  switch (head.kind) {
    case "min":
    case "max": {
      const words = head.mark.on === "held" ? (head.kind === "min" ? h.minHeld : h.maxHeld) : head.kind === "min" ? h.min : h.max;
      return (
        <>
          {fill(words.before)}
          <Num value={head.mark.amount} />
          {words.after}
        </>
      );
    }
    case "min-max":
      return (
        <>
          {h.minMax.before}
          <Num value={head.min.amount} />
          {h.minMax.middle}
          <Num value={head.max.amount} />
          {h.minMax.after}
        </>
      );
    case "meet":
      return (
        <>
          {h.meet.before}
          <Num value={head.mark.amount} />
          {h.meet.after}
        </>
      );
    case "marks":
      return <>{countPhrase(head.n, h.marks)}</>;
  }
}

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

function CurveCard({ group, reading, saved, fx }: { group: CurveGroup; reading: Reading; saved: boolean; fx: FxSnapshot | null }) {
  const c = w.curves;
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
  // one curve that holds only in some periods says which; several, a choice of period
  const spans = curve && distinct === 1 ? spansOf(curve.periods, reading.periods) : [];
  const choice =
    distinct > 1 && chosen ? (
      choices.length <= 4 ? (
        <SegmentedControl fit label={c.choose} options={choices.map((x) => ({ value: x.from, label: optionLabel(x.from) }))} value={chosen} onChange={setPicked} />
      ) : (
        <ChoiceChips line bleed="" ids={choices.map((x) => x.from)} labels={Object.fromEntries(choices.map((x) => [x.from, optionLabel(x.from)]))} value={chosen} ariaLabel={c.choose} onChange={setPicked} />
      )
    ) : null;
  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelHead
          kicker={
            <>
              {kicker}
              {spans.length > 0 && <Spans spans={spans} lead={w.periods.sep} />}
            </>
          }
        >
          {curve && <CurveHeadline head={curveHead(curve)} noun={noun} />}
        </PanelHead>
        {choice}
      </div>
      {curve && (
        <AmountChart
          amounts={curve.amounts}
          bands={curve.series.map((s) => ({ id: s.fee.fee, label: refName(s.fee), fill: feeColour(s.fee.kind).fill, stroke: feeColour(s.fee.kind).stroke, swatch: feeColour(s.fee.kind).bg, values: s.costs }))}
          marks={[...new Set(curve.at)].map((at) => ({ id: String(at), at, label: fmt.nisWhole(at) }))}
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
      {group.undrawn.map((u) => (
        <p key={u.currency} className="text-sm text-muted-foreground">
          {c.undrawn(copy.panel.currencies[u.currency] ?? u.currency)}
        </p>
      ))}
    </Card>
  );
}

// ---------------------------------------------------------------- the points

const swatchOf = (s: Statement) => (s.kind === "mark" ? (s.mark.kind === "meet" ? s.mark.fees[0]!.kind : s.mark.fee.kind) : s.fee.kind);

function MarkSentence({ mark }: { mark: MarkView }) {
  const p = w.points;
  if (mark.kind === "meet") {
    const m = copy.marks.meet;
    return (
      <>
        {m.before}
        <Num value={mark.sum} />
        {m.sum}
        <Num value={mark.rate} />
        {m.rate}
        <Num value={mark.amount} />
        {m.after}
      </>
    );
  }
  const words = mark.on === "held" ? (mark.kind === "min" ? p.minHeld : p.maxHeld) : mark.kind === "min" ? p.minAction : p.maxAction;
  // a mark names its fee, not its action: the bound is said on "each action" of that fee
  const noun = copy.marks.noun.none!;
  return (
    <>
      {words.before.replace("{name}", refName(mark.fee)).replace("{side}", sideWord(mark.side))}
      <Num value={mark.bound} />
      {words.middle.replace("{noun}", noun)}
      <Num value={mark.amount} />
      {words.after}
    </>
  );
}

function StatementLine({ statement, reading }: { statement: Statement; reading: Reading }) {
  const p = w.points;
  const spans = spansOf(statement.periods, reading.periods);
  let body: ReactNode;
  if (statement.kind === "mark") body = <MarkSentence mark={statement.mark} />;
  else if (statement.kind === "no-max") body = p.noMax.replace("{name}", refName(statement.fee)).replace("{side}", sideWord(statement.side));
  else {
    const row = reading.periods.find((x) => x.from === statement.periods[0])?.rows.find((r) => r.fee === statement.fee.fee);
    const price = row?.price;
    if (!price?.figures.rate || !price.per) return null;
    body = (
      <>
        {p.every.before.replace("{name}", refName(statement.fee))}
        <Num value={price.figures.rate} /> {copy.price.per[price.per]}, {copy.price.charged[statement.every]}
        {price.per > statement.every ? p.every.part.replace("{k}", String(price.per / statement.every)) : "."}
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

function PointsCard({ reading }: { reading: Reading }) {
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={w.points.kicker}>{w.points.title}</PanelHead>
      <ul className="flex flex-col gap-2.5">
        {reading.statements.map((s, k) => (
          <StatementLine key={k} statement={s} reading={reading} />
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
    case "no-cap":
      return <>{head.n === 1 ? l.noCap.one : l.noCap.several}</>;
    case "not-judged":
      return <>{l.notJudged}</>;
  }
}

function LawRowView({ row, saved, first }: { row: LawRow; saved: boolean; first: MonthKey }) {
  const cap = row.cap;
  if (cap.state === "absent") return null;
  if (cap.state === "none")
    return (
      <li className="flex flex-col gap-1">
        <FeeName fee={row} className="font-medium" />
        <RulesLine
          ids={cap.ruleIds}
          lead={
            <span>
              {copy.standing.tag.none}
              <CapCaveat caveat={cap.caveat} />
            </span>
          }
        />
      </li>
    );
  const judged = row.prices.filter((x) => x.standing.standing.judged);
  const now = judged[0];
  const later = judged.find((x) => x !== now && JSON.stringify(x.standing.standing) !== JSON.stringify(now?.standing.standing));
  const many = (side: DealSide) => row.prices.filter((x) => x.side === side).length > 1;
  return (
    <li className="flex flex-col gap-2">
      <span className="flex flex-wrap items-center gap-2">
        <FeeName fee={row} className="font-medium" />
        {later ? <StandingTag standing={later.standing} from={later.from} /> : now && <StandingTag standing={now.standing} />}
      </span>
      {now && <FeeCapBar kind={row.kind} now={now.standing} {...(later ? { later: later.standing } : {})} cap={cap.value} />}
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {row.prices.map((x, k) => {
          const side = x.side === "all" ? "" : `${copy.sides[x.side]} `;
          const lead = !many(x.side) ? side : x.from === first ? `${side}${copy.standing.now}` : null;
          return (
            <li key={k}>
              {lead === null ? <When iso={x.from} lead={`${side}${w.law.from}`} /> : lead}
              {lead === null && " "}
              <PriceWords price={x.price} kind={row.kind} saved={saved} />
              <StandingWords standing={x.standing} {...(cap.binds ? { binds: cap.binds } : {})} />
            </li>
          );
        })}
      </ul>
      <RulesLine
        ids={cap.ruleIds}
        lead={
          <span>
            {copy.standing.capLine}
            <CapFigure value={cap.value} />
            <CapCaveat caveat={cap.caveat} />
          </span>
        }
      />
    </li>
  );
}

function LawCard({ reading, saved }: { reading: Reading; saved: boolean }) {
  return (
    <Card className="flex flex-col gap-4">
      <PanelHead kicker={w.law.kicker}>
        <LawHeadline rows={reading.law} />
      </PanelHead>
      <ul className="flex flex-col gap-4">
        {reading.law.map((r) => (
          <LawRowView key={r.fee} row={r} saved={saved} first={reading.from} />
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------- the section

/** The reading's cards. `saved`: the deal's product saves, so a share of what is held reads "what has built up". */
export function ReadingCards({ reading, saved, fx }: { reading: Reading; saved: boolean; fx: FxSnapshot | null }) {
  const groups = curveGroups(reading);
  const points = reading.statements.length > 0;
  const law = reading.law.length > 0;
  return (
    <div className="flex flex-col gap-4">
      {reading.periods.length >= 2 && <PeriodsCard reading={reading} saved={saved} />}
      {groups.length > 0 && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <CurveCard key={g.key} group={g} reading={reading} saved={saved} fx={fx} />
          ))}
        </div>
      )}
      {(points || law) && (
        <div className={cx("grid items-start gap-4", points && law && "lg:grid-cols-2")}>
          {points && <PointsCard reading={reading} />}
          {law && <LawCard reading={reading} saved={saved} />}
        </div>
      )}
    </div>
  );
}
