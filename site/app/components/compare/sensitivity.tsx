// "What would change the answer" (design-system 6.6, flow 14): one row per assumption in P-02, rows that flip
// first. A flipping row opens the assumptions with the flipping value as a suggestion; the bounds are shown,
// never edited here.
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ValueObject } from "@finance-tool/schema";
import { numbers, ownTermsCopy, r2, scnCompare, site } from "../../copy";
import { asParameter, parameterOf, type SensitivityRowView, type SensitivityView } from "../../lib/compare";
import type { FieldKey } from "../../lib/goal";
import { Num } from "../provenance";
import { Tpl } from "../exposure-mode/tpl";
import { Card, cx, Tag } from "../kit";
import type { ResultCtx } from "./ctx";

function bounds(ctx: ResultCtx, key: string): { lo: ValueObject; hi: ValueObject } | null {
  const p02 = parameterOf(ctx.bundle, "P-02") as unknown as { bounds: Record<string, { lo: ValueObject; hi: ValueObject }> };
  return p02.bounds[key.startsWith("fee:") ? "fee_rates" : key] ?? null;
}

/** A value on the assumption's own scale, as a number with its state: a rate, a count of years or a multiple of a fee. */
function show(ctx: ResultCtx, row: SensitivityRowView, v: number, about: string) {
  const { mk } = ctx;
  if (row.unit === "fraction") return <Num value={mk.plain(v * 100, "pct_per_year", "F-81", about)} />;
  if (row.unit === "years") return <Num value={mk.plain(v, "years", "F-81", about)} display={`${Number(v.toFixed(2))} ${"שנים"}`} />;
  return <Num value={mk.plain(v, "count", "F-81", about)} display={`${r2.result.times} ${Number(v.toFixed(2))}`} />;
}

/** The options that lead before any move: the tie at the top, or the one leader. */
export function baseLeaders(ctx: ResultCtx): Set<string> {
  const { view } = ctx;
  return new Set(view.topTie.length > 1 ? view.topTie : view.ranked[0] ? [view.ranked[0].id] : []);
}

/**
 * The names a flip puts first (scenario fix 2026-10-24): never the option that already leads. A move that only breaks a tie names
 * the members left; a move that makes a sole leader share first place names the newcomers, with "שקולה לראשונה".
 */
export function flipTargets(topAfter: string, base: ReadonlySet<string>): { ids: string[]; alongside: boolean } {
  const after = topAfter.split("|").filter(Boolean);
  const entrants = after.filter((id) => !base.has(id));
  if (entrants.length === 0) return { ids: after, alongside: false };
  return { ids: entrants, alongside: after.some((id) => base.has(id)) };
}

/** The sentence of a row that flips: "מתהפך אם … תעבור מ־… ל־…: אז … ראשונה." (also the headline's second line, A3). A fee row says it in fee terms (D4, 2026-10-24). */
export function FlipSentence({ row, ctx }: { row: SensitivityRowView; ctx: ResultCtx }) {
  const flip = row.flip;
  if (!flip) return null;
  const { ids, alongside } = flipTargets(flip.topAfter, baseLeaders(ctx));
  const names = ids.map((id) => ctx.view.names[id] ?? id);
  const then = (
    <>
      {r2.result.sensThen} <bdi>{names.join(", ")}</bdi> {flip.breaksTie ? r2.result.sensFirstAlone : alongside ? scnCompare.flipAlongside : r2.result.sensFirst}
    </>
  );
  // 2026-10-24 (Doron's case): a move that only breaks a tie says so ("התיקו נשבר אם … ראשונה לבדה"), and a fee row names the option and its fee
  const lead = flip.breaksTie ? r2.result.sensBreaks : r2.result.sensFlip;
  if (row.fee && typeof row.fee.flipAtPct === "number") {
    const x = <Num value={ctx.mk.plain(row.fee.flipAtPct, "pct_per_year", "F-81", row.label)} />;
    const name = <bdi>{ctx.view.names[row.fee.wrapperId] ?? row.fee.wrapperId}</bdi>;
    return (
      <>
        {lead} <Tpl t={ownTermsCopy.feeFlip[row.fee.kind][flip.side === "lo" ? "below" : "above"]} vars={{ name, x }} />
        {then}
      </>
    );
  }
  return (
    <>
      {lead} {row.label} {r2.result.sensCross}
      {show(ctx, row, flip.from, row.label)}
      {r2.result.sensTo}
      {show(ctx, row, flip.to, row.label)}
      {then}
    </>
  );
}

function SensitivityRowItem({ row, ctx, onOpen }: { row: SensitivityRowView; ctx: ResultCtx; onOpen: (field: FieldKey, suggested: number) => void }) {
  const { view, mk } = ctx;
  const b = bounds(ctx, row.key);
  const flip = row.flip;
  let text: ReactNode;
  if (flip) {
    text = <FlipSentence row={row} ctx={ctx} />;
  } else {
    const lo = row.unit === "years" || !b ? row.lo : row.lo;
    const hi = row.hi;
    const feePct = (v: number) => <Num value={mk.plain(v, "pct_per_year", "F-81", row.label)} />;
    const loNode = row.fee ? feePct(row.fee.loPct) : b && row.unit === "fraction" ? <Num value={asParameter(parameterOf(ctx.bundle, "P-02"), b.lo)} /> : show(ctx, row, lo, row.label);
    const hiNode = row.fee ? feePct(row.fee.hiPct) : b && row.unit === "fraction" ? <Num value={asParameter(parameterOf(ctx.bundle, "P-02"), b.hi)} /> : show(ctx, row, hi, row.label);
    text = (
      <>
        {r2.result.sensNoFlip} {loNode}
        {r2.result.sensUntil}
        {hiNode}
      </>
    );
  }
  void mk;
  const current = row.unit === "fraction" ? mk.plain(row.current * 100, "pct_per_year", "F-81", row.label) : null;
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
    const suggested = row.field === "horizonYears" ? (flip.side === "hi" ? Math.ceil(flip.to) : Math.floor(flip.to)) : flip.to * 100;
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

/** Rows that flip stay first. With a horizon the person did not give ("לא יודעים"), the horizon row leads the rest (home question card 2026-10-24). */
function orderRows(rows: SensitivityRowView[], horizonDefaulted: boolean): SensitivityRowView[] {
  if (!horizonDefaulted) return rows;
  const rank = (r: SensitivityRowView) => (r.flip ? 0 : r.key === "horizon" ? 1 : 2);
  return rows.map((r, i) => ({ r, i })).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i).map((x) => x.r);
}

export function SensitivityPanel({ view, ctx, onOpen }: { view: SensitivityView | null; ctx: ResultCtx; onOpen: (field: FieldKey, suggested: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {view === null ? (
        <p className="text-sm text-muted-foreground">{r2.result.sensRunning}</p>
      ) : (
        <Card as="ul" pad="none" className="overflow-hidden">
          {orderRows(view.rows, ctx.g.fromPreset.horizon).map((r) => (
            <SensitivityRowItem key={r.key} row={r} ctx={ctx} onOpen={onOpen} />
          ))}
        </Card>
      )}
      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
        <span>{r2.result.sensFooter}</span>
        <Tag tone="parameter">{numbers.parameter}</Tag>
        <Link to="/parameters" className="text-link hover:underline">
          {site.menuItems[3].label}
        </Link>
      </p>
    </div>
  );
}
