// "What would change the conclusion" on the fee page (design-spec 12, flow 20 step 9): F-81 over the verdicts and
// the largest fee. One row per assumption; rows that flip first.
import { Link } from "react-router";
import type { ParameterRecord, ValueObject } from "@finance-tool/schema";
import { numbers, r3fees, site } from "../../copy";
import { asParameter, parameterOf, type CompareBundle } from "../../lib/compare";
import type { Analysis, FeeSensRow, FeeSensitivity, LineView } from "../../lib/fees";
import { fmt, joinLead, readerRound } from "../../lib/format";
import type { FieldKey } from "../../lib/goal";
import { Num } from "../provenance";
import { Card, cx, Tag } from "../kit";
import type { SiteValue } from "../../lib/value";

type Bounds = Record<string, { lo: ValueObject; hi: ValueObject }>;

/** A flip point to show: the value and the side it lies on, rounded as `readerRound` says; null for a bound, which is round already. */
type Shown = { side: "lo" | "hi" } | null;

/** A maqaf lead before a value: a holding period said in words ("שנה", "שנתיים") takes the letter on the word, "משנה" (copy.md 10.4). */
const leadFor = (row: FeeSensRow, written: string, v: number, at: Shown) => (row.unit === "years" ? joinLead(written, fmt.years(at ? shownAt(row, v, at, "years") : Number(v.toFixed(2)))) : written);

/** A rounded flip point held inside the range the search tested (finance review, 2026-11-07: a 0.364% point read "0.3%", below P-02's half of 0.7%). */
const within = (row: FeeSensRow, r: number, side: "lo" | "hi") => (side === "lo" ? Math.max(r, row.lo) : Math.min(r, row.hi));
const shownAt = (row: FeeSensRow, v: number, at: { side: "lo" | "hi" }, unit: "years" | "pct") =>
  unit === "years" ? within(row, readerRound(v, at.side, "years"), at.side) : within(row, readerRound(v * 100, at.side, "pct") / 100, at.side) * 100;

/**
 * The value an assumption has now, the one F-81 moves from: the page's field itself, entered or the site's parameter (the return A-01, the
 * inflation A-02, the years), never a figure computed over the plan. Null for a fee's multiple, which is the comparison's own.
 */
function inputNow(an: Analysis, row: FeeSensRow): SiteValue | null {
  const g = an.mk.goal;
  return row.key === "A-01" ? g.returnV : row.key === "A-02" ? g.inflation : row.key === "horizon" ? g.years : null;
}

/** A value on the assumption's scale; `now` is the input itself when the value is the assumption's present one (`inputNow`). */
function value(an: Analysis, row: FeeSensRow, v: number, at: Shown = null, now: SiteValue | null = null) {
  const s = r3fees.sens;
  if (row.unit === "fraction") return <Num value={now ?? an.mk.plain(v * 100, "pct_per_year", "F-81", row.label)} {...(at ? { display: fmt.pct(Number(shownAt(row, v, at, "pct").toFixed(4))) } : {})} />;
  if (row.unit === "years") return <Num value={now ?? an.mk.plain(v, "years", "F-81", row.label)} display={fmt.years(at ? shownAt(row, v, at, "years") : Number(v.toFixed(2)))} />;
  // a fee axis moves a multiple of the rate: show the rate that multiple makes, held at the legal cap as the run holds it (PF-02)
  const capped = (x: number) => (row.capPct !== undefined ? Math.min(x, row.capPct) : x);
  // a flip point rounds the rate the row is named for, and the other period's rate follows the same multiple (the multiple rounded, not each rate)
  const named = row.ratePct === 0 ? row.afterPct : row.ratePct;
  const m = at && named !== undefined && named > 0 ? within(row, readerRound(capped(v * named), at.side, "fee") / named, at.side) : null;
  const pctNum = (base: number) => <Num value={an.mk.plain(capped(v * base), "pct", "F-81", row.label)} {...(m !== null ? { display: fmt.pct(Number(capped(m * base).toFixed(2))) } : {})} />;
  const pct = row.ratePct !== undefined ? capped(v * row.ratePct) : v;
  const rate = row.ratePct !== undefined ? pctNum(row.ratePct) : <Num value={an.mk.plain(pct, "pct", "F-81", row.label)} />;
  // a discounted fee moves in both of its periods (A-19): the multiple of the rate after the discount is said beside it
  if (row.afterPct === undefined) return rate;
  const after = pctNum(row.afterPct);
  // 0% during the discount: the row is named for the rate after it, and shows that rate alone
  if (row.ratePct === 0) return after;
  return (
    <>
      {rate}
      {s.afterOpen}
      {after}
      {s.afterClose}
    </>
  );
}

function Row({ row, an, onOpen, p02, wordOf }: { row: FeeSensRow; an: Analysis; onOpen: (f: FieldKey, suggested: number) => void; p02: { param: ParameterRecord; bounds: Bounds }; wordOf: (l: LineView) => string }) {
  const s = r3fees.sens;
  const flip = row.flip;
  let text: React.ReactNode;
  // the row's heading names what moves; the sentence says where it lands and what then changes, with no verb that must agree with the
  // heading's noun ("דמי ניהול … תעבור" was wrong, 2026-11-07): "ב־0.42% במקום 0.7%, המסקנה על דמי ניהול מחיסכון עוברת מ״…״ ל״…״"
  if (flip && flip.kind === "verdict") {
    text = (
      <>
        {leadFor(row, s.flipVerdict[0], flip.to, flip)}
        {value(an, row, flip.to, flip)}
        {s.flipVerdict[1]}
        {value(an, row, flip.from, null, inputNow(an, row))}
        {s.flipVerdict[2]}
        <bdi>{r3fees.names[flip.line!]}</bdi>
        {s.flipVerdict[3]}
        {wordOf(an.lines.find((l) => l.line === flip.line)!)}
        {s.flipVerdict[4]}
        {r3fees.verdict[flip.newVerdict!]}
        {s.flipVerdict[5]}
      </>
    );
  } else if (flip) {
    text = (
      <>
        {leadFor(row, s.flipLargest[0], flip.to, flip)}
        {value(an, row, flip.to, flip)}
        {s.flipLargest[1]}
        {value(an, row, flip.from, null, inputNow(an, row))}
        {s.flipLargest[2]}
        <bdi>{r3fees.names[flip.newLargest!]}</bdi>.
      </>
    );
  } else {
    const b = row.key.startsWith("fee:") ? p02.bounds.fee_rates : p02.bounds[row.key === "horizon" ? "horizon" : row.key];
    const node = (side: "lo" | "hi") =>
      row.unit === "fraction" && b ? <Num value={asParameter(p02.param, b[side])} /> : row.unit === "years" ? <Num value={an.mk.plain(row[side], "years", "F-81", row.label)} display={fmt.years(Number(row[side].toFixed(2)))} /> : value(an, row, row[side]);
    text = (
      <>
        {s.noFlip}
        {node("lo")}
        {s.until}
        {node("hi")}
      </>
    );
  }
  const current = row.unit === "fraction" ? inputNow(an, row) : null;
  const inner = (
    <div className="flex flex-col gap-1 w-full text-start">
      <span className="flex items-center gap-2 flex-wrap">
        <span className="font-medium">{row.label}</span>
        {current && <Num value={current} />}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  );
  const cls = cx("min-h-14 px-4 py-3 flex items-center border-b border-border last:border-b-0", flip && "bg-computed-subtle");
  if (flip && row.field) {
    // the field takes a value past the point, as the row's is: a holding period in whole years (the field's step), a rate as the row shows it
    const suggested = row.field === "horizonYears" ? (flip.side === "hi" ? Math.ceil(flip.to) : Math.floor(flip.to)) : Number(shownAt(row, flip.to, flip, "pct").toFixed(4));
    return (
      <li className={cls}>
        {/* a div, not a button: the row holds number buttons (provenance), and a button inside a button is invalid HTML (audit 2026-10-24 (sweep)) */}
        <div
          role="button"
          tabIndex={0}
          className="w-full text-start cursor-pointer"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button, a")) return;
            onOpen(row.field!, suggested);
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
              e.preventDefault();
              onOpen(row.field!, suggested);
            }
          }}
        >
          {inner}
        </div>
      </li>
    );
  }
  return <li className={cls}>{inner}</li>;
}

export function FeeSensitivityPanel({ view, an, bundle, onOpen, wordOf }: { view: FeeSensitivity | null; an: Analysis; bundle: CompareBundle; onOpen: (f: FieldKey, suggested: number) => void; /** the badge word each card shows now */ wordOf: (l: LineView) => string }) {
  const param = parameterOf(bundle, "P-02");
  const p02 = { param, bounds: (param as unknown as { bounds: Bounds }).bounds };
  return (
    <div className="flex flex-col gap-3">
      {view === null ? (
        <p className="text-sm text-muted-foreground">{r3fees.review.sensRunning}</p>
      ) : (
        <Card as="ul" pad="none" className="overflow-hidden">
          {view.rows.map((r) => (
            <Row key={r.key} row={r} an={an} onOpen={onOpen} p02={p02} wordOf={wordOf} />
          ))}
        </Card>
      )}
      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
        <span>{r3fees.review.sensFooter}</span>
        <Tag tone="parameter">{numbers.parameter}</Tag>
        <Link to="/parameters" className="text-link hover:underline tap-area">
          {site.menuItems[3].label}
        </Link>
      </p>
    </div>
  );
}
