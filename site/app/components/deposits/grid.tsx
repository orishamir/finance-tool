// The deposits page's grid (D92): the banks by the eight terms of the standard table. A cell is the highest rate of the chosen kind, among the
// bank's offers of the term that are unlinked and open to every customer, that the chosen amount opens (method F-108), with "ועוד n" for the
// bank's other offers of the term; a cell with none says why. Shaded by rate on one scale (charts.md), one colour at a strength that follows
// the rate. A column's head picks its term; a cell picks its term and scrolls to the bank's rows in the list. On a phone, two halves of four
// terms each. No panel of its own: the list holds the offers.
import { useMemo } from "react";
import { depositBrowser as t } from "../../copy";
import { TERMS, cellOf, scaleTop, sheetNames, type DbCell, type DbData, type DbOffer, type RateKind, type TermId } from "../../lib/deposit-browser";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { HelpMark, MixedName, cx } from "../kit";

/** The shade's strength for a rate on the scale `0..top`: never so faint a low rate disappears into the card. */
const strength = (rate: number, top: number) => 0.14 + 0.76 * Math.min(1, Math.max(0, rate / top));
/** Over a shade this strong the figure is dark, else light (charts.md: white or near-black, whichever reads). */
const DARK_TEXT_FROM = 0.58;

function Cell({ cell, kind, top, chosen, bankName, canGo, onGo }: { cell: DbCell; kind: RateKind; top: number; chosen: boolean; bankName: string; canGo: boolean; onGo: () => void }) {
  const go = canGo ? (
    <button type="button" onClick={onGo} aria-label={`${t.grid.goTo.before}${bankName}${t.grid.goTo.middle}${t.terms[cell.term]}${t.grid.goTo.after}`} className="absolute inset-0 rounded-md hover:ring-1 hover:ring-foreground/40" />
  ) : null;
  const frame = cx("relative min-h-12 rounded-md flex flex-col items-center justify-center text-center px-0.5 py-1", chosen && "ring-2 ring-primary");
  if (!cell.rate || !cell.pick) {
    const words = cell.gap === "none" ? t.grid.gap.none : cell.gap === "otherKind" ? t.grid.gap.otherKind[kind] : cell.gap === "notAtAmount" ? t.grid.gap.notAtAmount : t.grid.gap.otherOffers;
    return (
      <div className={cx(frame, "border border-dashed border-border")}>
        {go}
        <span className="relative pointer-events-none text-xs text-muted-foreground leading-tight">{words}</span>
      </div>
    );
  }
  const a = strength(Number(cell.rate.value), top);
  const dark = a >= DARK_TEXT_FROM;
  return (
    <div className={frame}>
      <span data-mark aria-hidden="true" className="absolute inset-0 rounded-md bg-chart-value" style={{ opacity: a }} />
      {go}
      <span className={cx("relative z-[1] text-sm font-semibold", dark ? "text-background" : "text-foreground")}>
        <Num value={cell.rate} />
      </span>
      {cell.more > 0 && (
        <span className={cx("relative pointer-events-none text-xs leading-tight", dark ? "text-background" : "text-muted-foreground")}>
          {t.grid.more} {cell.more}
        </span>
      )}
    </div>
  );
}

function Block({ terms, rows, kind, top, term, onTerm, onCell, hasRows, className }: { terms: readonly TermId[]; rows: { bank: string; name: string; cells: DbCell[] }[]; kind: RateKind; top: number; term: TermId | null; onTerm: (t: TermId) => void; onCell: (bank: string, t: TermId) => void; hasRows: (bank: string, t: TermId) => boolean; className?: string }) {
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
          <span role="columnheader" key={x} className="flex">
            <button
              type="button"
              aria-pressed={term === x}
              onClick={() => onTerm(x)}
              className={cx("w-full min-h-target rounded-md text-sm px-0.5 leading-tight transition-colors duration-[var(--duration-base)]", term === x ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary text-secondary-foreground hover:bg-accent")}
            >
              {t.terms[x]}
            </button>
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
              <span role="cell" key={c.term}>
                <Cell cell={c} kind={kind} top={top} chosen={term === c.term} bankName={r.name} canGo={hasRows(r.bank, c.term)} onGo={() => onCell(r.bank, c.term)} />
              </span>
            ))}
        </div>
      ))}
    </div>
  );
}

export function DepositGrid({ data, kind, amount, amountText, term, onTerm, onCell }: { data: DbData; kind: RateKind; amount: number; amountText: string; term: TermId | null; onTerm: (t: TermId) => void; onCell: (bank: string, t: TermId) => void }) {
  const names = useMemo(() => sheetNames(data), [data]);
  const rows = useMemo(
    () => data.banks.map((b) => ({ bank: b.id, name: b.name, cells: TERMS.map((x) => cellOf(data, b.id, x, kind, amount, (o: DbOffer) => names.get(o.id) ?? o.name)) })),
    [data, kind, amount, names],
  );
  const { top, above } = useMemo(() => scaleTop(data, kind), [data, kind]);
  // a cell scrolls only where the list has the bank's rows of the term in this kind (opened or folded)
  const hasRows = (bank: string, x: TermId) => data.offers.some((o) => o.bank === bank && o.term === x && o.kind === kind);
  const halves = [TERMS.slice(0, 4), TERMS.slice(4)] as const;
  const props = { rows, kind, top, term, onTerm, onCell, hasRows };
  return (
    <section aria-labelledby="deposit-grid-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="deposit-grid-title" className="text-lg font-semibold inline-flex items-start gap-1">
          <span>
            {t.grid.title[kind]}
            <bdi dir="ltr" className="tabular-nums">
              {amountText}
            </bdi>
          </span>
          <HelpMark about={t.grid.helpAbout} text={t.grid.helpText} />
        </h2>
        <p className="text-sm text-muted-foreground max-w-measure">{t.grid.line}</p>
        <Scale top={top} above={above} />
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
  );
}

/** The scale under the title: the shade from no interest to the top, with its two ends; "ומעלה" when higher rates shade as the top. */
function Scale({ top, above }: { top: number; above: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-label={t.grid.scale.aria}>
      <span className="tabular-nums">0%</span>
      <span className="relative h-3 w-32 rounded-sm overflow-hidden bg-card" aria-hidden="true">
        <span className="absolute inset-0 bg-gradient-to-l from-chart-value/15 to-chart-value" />
      </span>
      <span className="whitespace-nowrap">
        <span className="tabular-nums">{`${fmt.number(top)}%`}</span>
        {above && ` ${t.grid.scale.andUp}`}
      </span>
      <span>{t.grid.scale.lead}</span>
    </div>
  );
}
