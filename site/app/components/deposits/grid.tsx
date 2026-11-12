// The deposits page's grid (D92), folded under the list: the banks by the eight terms of the standard table. A cell is the highest rate of
// the chosen kind, among the bank's offers of the term that are unlinked and open to every customer, that the chosen amount opens (method
// F-108), with "ועוד n" for the bank's other offers of the term; a cell with none says why. Shaded by rate on one scale from no interest to
// the highest rate of the kind, so every rate has a shade of its own; the highest cell of each column is framed and says so. Each cell is
// one button: it picks its term and brings the bank's rows of the list into view, where each rate opens its source. On a phone, two halves
// of four terms each.
import { useMemo } from "react";
import { depositBrowser as t } from "../../copy";
import { TERMS, cellOf, columnBest, scaleTop, sheetNames, type DbCell, type DbData, type DbOffer, type RateKind, type TermId } from "../../lib/deposit-browser";
import { fmt } from "../../lib/format";
import { FoldGroup, HelpMark, MixedName, cx } from "../kit";

/** The shade's strength for a rate on the scale `0..top`: never so faint a low rate disappears into the card. */
const strength = (rate: number, top: number) => 0.14 + 0.76 * Math.min(1, Math.max(0, rate / top));
/** Over a shade this strong the figure is dark, else light (charts.md: white or near-black, whichever reads). */
const DARK_TEXT_FROM = 0.58;

function Cell({ cell, kind, top, best, bankName, canGo, onGo }: { cell: DbCell; kind: RateKind; top: number; best: boolean; bankName: string; canGo: boolean; onGo: () => void }) {
  const frame = cx("relative w-full min-h-12 rounded-md flex flex-col items-center justify-center text-center px-0.5 py-1", best && "ring-2 ring-foreground ring-inset");
  const rate = cell.rate ? Number(cell.rate.value) : null;
  const words = rate === null ? (cell.gap === "none" ? t.grid.gap.none : cell.gap === "otherKind" ? t.grid.gap.otherKind[kind] : cell.gap === "notAtAmount" ? t.grid.gap.notAtAmount : t.grid.gap.otherOffers) : null;
  const a = rate !== null ? strength(rate, top) : 0;
  const dark = a >= DARK_TEXT_FROM;
  const body = (
    <>
      {rate !== null && <span data-mark aria-hidden="true" className="absolute inset-0 rounded-md bg-chart-value" style={{ opacity: a }} />}
      {rate !== null ? (
        <span className={cx("relative z-[1] text-sm font-semibold tabular-nums", dark ? "text-background" : "text-foreground")}>
          <bdi dir="ltr">{`${fmt.number(rate)}%`}</bdi>
        </span>
      ) : (
        <span className="relative text-xs text-muted-foreground leading-tight">{words}</span>
      )}
      {rate !== null && cell.more > 0 && (
        <span className={cx("relative text-xs leading-tight", dark ? "text-background" : "text-muted-foreground")}>
          {t.grid.more} {cell.more}
        </span>
      )}
    </>
  );
  if (!canGo) return <div className={cx(frame, rate === null && "border border-dashed border-border")}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onGo}
      aria-label={`${t.grid.goTo.before}${bankName}${t.grid.goTo.middle}${t.terms[cell.term]}${t.grid.goTo.after}${rate !== null ? `, ${fmt.number(rate)}%` : `, ${words}`}${best ? `, ${t.grid.best}` : ""}`}
      className={cx(frame, "cursor-pointer hover:brightness-125", rate === null && "border border-dashed border-border hover:bg-accent")}
    >
      {body}
    </button>
  );
}

function Block({ terms, rows, kind, top, best, onCell, hasRows, className }: { terms: readonly TermId[]; rows: { bank: string; name: string; cells: DbCell[] }[]; kind: RateKind; top: number; best: Record<string, string | null>; onCell: (bank: string, t: TermId) => void; hasRows: (bank: string, t: TermId) => boolean; className?: string }) {
  // the bank's column has a fixed width: one that may grow (minmax) takes its most before the terms get any, and at 320 px left a term 40 px
  // (chart-check); on a phone's half it is as wide as the longest short name, a two-word one wrapping
  const cols = { gridTemplateColumns: `${terms.length > 4 ? "7rem" : "4.25rem"} repeat(${terms.length}, minmax(0, 1fr))` };
  return (
    <div className={cx("grid gap-1 max-md:gap-0.5", className)} style={cols} role="table">
      <div role="row" className="contents">
        <span role="columnheader" className="text-xs text-muted-foreground self-end pb-2">
          {t.grid.bank}
        </span>
        {terms.map((x) => (
          <span role="columnheader" key={x} className="text-sm text-center text-muted-foreground self-end pb-2 leading-tight">
            {t.terms[x]}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div role="row" key={r.bank} className="contents">
          <span role="rowheader" className="text-sm font-medium self-center leading-tight">
            <MixedName>{r.name}</MixedName>
          </span>
          {r.cells
            .filter((c) => terms.includes(c.term))
            .map((c) => (
              <span role="cell" key={c.term} className="flex">
                <Cell cell={c} kind={kind} top={top} best={best[c.term] === r.bank} bankName={r.name} canGo={hasRows(r.bank, c.term)} onGo={() => onCell(r.bank, c.term)} />
              </span>
            ))}
        </div>
      ))}
    </div>
  );
}

export function DepositGrid({ data, kind, amount, onCell }: { data: DbData; kind: RateKind; amount: number | null; onCell: (bank: string, t: TermId) => void }) {
  const names = useMemo(() => sheetNames(data), [data]);
  const rows = useMemo(
    () => data.banks.map((b) => ({ bank: b.id, name: b.name, cells: TERMS.map((x) => cellOf(data, b.id, x, kind, amount ?? 0, (o: DbOffer) => names.get(o.id) ?? o.name)) })),
    [data, kind, amount, names],
  );
  const { top } = useMemo(() => scaleTop(data, kind), [data, kind]);
  const best = Object.fromEntries(TERMS.map((x, i) => [x, columnBest(rows.map((r) => r.cells[i]!))?.bank ?? null]));
  // a cell scrolls only where the list has the bank's rows of the term in this kind that the amount opens
  const hasRows = (bank: string, x: TermId) => amount !== null && data.offers.some((o) => o.bank === bank && o.term === x && o.kind === kind);
  const halves = [TERMS.slice(0, 4), TERMS.slice(4)] as const;
  const props = { rows, kind, top, best, onCell, hasRows };
  if (amount === null) return null;
  return (
    <FoldGroup
      variant="section"
      title={
        <>
          {t.grid.title[kind]}
          <bdi dir="ltr" className="tabular-nums">{fmt.nisWhole(amount)}</bdi>
        </>
      }
    >
      <section className="flex flex-col gap-3 pt-2" data-keep-clear>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground max-w-measure inline-flex items-start gap-1">
            <span>{t.grid.line}</span>
            <HelpMark about={t.grid.helpAbout} text={t.grid.helpText} />
          </p>
          <Scale top={top} />
        </div>
        <div data-chart className="flex flex-col gap-4">
          <Block {...props} terms={TERMS} className="hidden md:grid" />
          {halves.map((h, i) => (
            <div key={i} className="md:hidden flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t.grid.phoneHalves[i]}</span>
              <Block {...props} terms={h} />
            </div>
          ))}
        </div>
      </section>
    </FoldGroup>
  );
}

/** The scale under the title: the shade from no interest to the highest rate of the kind, with its two ends. */
function Scale({ top }: { top: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label={t.grid.scale.aria}>
      <span className="tabular-nums">0%</span>
      <span className="relative h-3 w-32 rounded-sm overflow-hidden bg-card" aria-hidden="true">
        <span className="absolute inset-0 bg-gradient-to-l from-chart-value/15 to-chart-value" />
      </span>
      <span className="tabular-nums whitespace-nowrap">{`${fmt.number(top)}%`}</span>
      <span>{t.grid.scale.lead}</span>
    </div>
  );
}
