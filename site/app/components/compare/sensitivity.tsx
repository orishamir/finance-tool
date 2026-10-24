// "What would change the answer" (design-system 6.6, flow 14): one row per assumption in P-02, rows that flip
// first. A flipping row opens the assumptions with the flipping value as a suggestion; the bounds are shown,
// never edited here.
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ValueObject } from "@finance-tool/schema";
import { numbers, r2, site } from "../../copy";
import { asParameter, parameterOf, type SensitivityRowView, type SensitivityView } from "../../lib/compare";
import type { FieldKey } from "../../lib/goal";
import { Num } from "../provenance";
import { Tag, cx } from "../ui";
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

/** The sentence of a row that flips: "מתהפך אם … תעבור מ־… ל־…: אז … ראשונה." (also the headline's second line, A3). */
export function FlipSentence({ row, ctx }: { row: SensitivityRowView; ctx: ResultCtx }) {
  const flip = row.flip;
  if (!flip) return null;
  const top = flip.topAfter.split("|")[0] ?? "";
  return (
    <>
      {flip.breaksTie ? r2.result.sensBreaks : r2.result.sensFlip} {row.label} {r2.result.sensCross}
      {show(ctx, row, flip.from, row.label)}
      {r2.result.sensTo}
      {show(ctx, row, flip.to, row.label)}
      {r2.result.sensThen} <bdi>{ctx.view.names[top] ?? top}</bdi> {r2.result.sensFirst}
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
    const loNode = b && row.unit === "fraction" ? <Num value={asParameter(parameterOf(ctx.bundle, "P-02"), b.lo)} /> : show(ctx, row, lo, row.label);
    const hiNode = b && row.unit === "fraction" ? <Num value={asParameter(parameterOf(ctx.bundle, "P-02"), b.hi)} /> : show(ctx, row, hi, row.label);
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

export function SensitivityPanel({ view, ctx, onOpen }: { view: SensitivityView | null; ctx: ResultCtx; onOpen: (field: FieldKey, suggested: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {view === null ? (
        <p className="text-sm text-muted-foreground">{r2.result.sensRunning}</p>
      ) : (
        <ul className="bg-card border border-border rounded-lg overflow-hidden">
          {view.rows.map((r) => (
            <SensitivityRowItem key={r.key} row={r} ctx={ctx} onOpen={onOpen} />
          ))}
        </ul>
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
