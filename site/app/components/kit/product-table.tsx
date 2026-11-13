// A list of products of one kind (design-system 11 "Lists of products"): one table on a desktop, one row per
// product on a phone, never a stack of cards. The company page's tracks, a brand's funds and the track browser are built on it. A group
// of rows can carry a caution banner (tracks that share a name) or a heading (a company, a kind of money: the track browser).
// A column head can sort the table (`SortHead`), and the head row can stay under the site's header while a long list scrolls. With
// `foldable`, a heading's strip folds its group's rows; a
// link in the strip (the company's page) still opens. The cells and the phone rows are the caller's; the shell, the banner, the heading
// and the widths are here. `RowArrow` is the arrow at the end of a row that opens a page of the site. The body and the phone card are the
// lists `useFlip` slides when the rows are sorted or filtered again.
import { Fragment, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { brands, invest, kit, trackBrowser } from "../../copy";
import { MQ, useMedia } from "../../lib/hooks";
import type { SiteValue } from "../../lib/value";
import { IconAlert, IconChevronDown, IconDrillIn, IconExternal } from "../icons";
import { LeadTail, Num, RulesLine, Term } from "../provenance";
import { Card } from "./card";
import { HelpMark } from "./help-mark";
import { cx } from "./cx";
import { TableCols } from "./table-cols";
import { cssMs } from "./chart-glide-math";

export interface ProductColumn {
  id: string;
  head: ReactNode;
  /** As wide as its longest real content, in rem (a number, a link, figures), and not wrapping; the columns without it share the rest. */
  width?: number;
  /** A column without a `width`: the least it keeps, in rem, before the table scrolls sideways in its card (11 unless said). */
  least?: number;
  /** A column with a `width` whose cells may wrap onto a second line (words, such as a deposit's exit points or a range of fees). */
  wrap?: boolean;
  /** 4 px at the sides of its head and cells, for a narrow column that holds only an arrow or an icon. */
  tight?: boolean;
  headClassName?: string;
  cellClassName?: string;
  /** The column's sort state, when its head sorts the table (a `SortHead` inside `head`): sets `aria-sort` on the head's cell. */
  sort?: "ascending" | "descending" | "none";
  /** Dimmed in place, head and cells, while a choice elsewhere on the page sets it aside (an amount the reader does not deposit): it never moves. */
  dim?: boolean;
  /** A caption over this column and the ones after it that carry the same `band` string ("ריבית בשנה, לפי סכום ההפקדה"): a row above the heads. */
  band?: string;
  /** What the caption shows in place of its `band` words, where it holds a figure that opens its source or a "?" beside its words; read
   *  from the run's first column. The `band` string still tells the runs apart. */
  bandHead?: ReactNode;
  /**
   * One head over this column and the neighbours with the same `key`, in the head under the caption row, with each column's own `head`
   * under it (the past yield over its years: "תשואת עבר" over "3 שנים" and "5 שנים"); the other heads take both lines. `spoken` comes before
   * each column's own head for a screen reader, so its header reads whole ("תשואת עבר, 3 שנים").
   */
  over?: { key: string; head: ReactNode; spoken: string };
}

export interface ProductRow {
  key: string;
  /** One cell per column, in the columns' order. */
  cells: ReactNode[];
  /** The phone's row: a `ProductPhoneRow`. */
  phone: ReactNode;
  /** What the row belongs to (a bank), as `data-row-of` on the table's row, so a page can find and scroll to its rows; the phone row is the caller's and carries its own. */
  rowOf?: string;
  /** The row lights for a moment (`row-lit`): the rows a press elsewhere on the page scrolled to. */
  lit?: boolean;
  /** The reader's own (a bank they marked): a tinted row with an accent bar at its start (`row-mine`); the phone row carries its own. */
  mine?: boolean;
  /**
   * One product sold on several terms under one name (a bank's deposit with and without exit points): one line for each, under one name.
   * The columns named in `columns` take a cell on every line (`rows`, in order); every other column keeps the row's own cell, once,
   * spanning the lines. The phone row is the caller's and shows the lines its own way. A line's cell can take the room of the cells after it
   * (`spans`, one number per cell: how many of the line's columns it covers, 1 where left out); the cells it covers are not drawn.
   */
  lines?: { columns: string[]; rows: { key: string; cells: ReactNode[]; spans?: number[] }[] };
  /**
   * What else there is to say about the product, folded under its row and closed until the reader opens it: a narrow column at the row's end
   * holds the button. `marks` are small icons on the button for what should not hide silently (a note of the company's, a doubt); `label`
   * is the button's spoken name. The phone row is the caller's (`RowFoldButton`).
   */
  detail?: { body: ReactNode; marks?: FoldMark[]; label: string };
}

/** A small icon on a row's fold button, with what it stands for. */
export interface FoldMark {
  key: string;
  icon: ReactNode;
  label: string;
}

export interface ProductGroup {
  key: string;
  rows: ProductRow[];
  /** A caution line over rows that belong together, with the alert icon (tracks that share a name). */
  banner?: ReactNode;
  /** A heading over the group's rows, on the table's width and on a phone: its title (a company, a kind), then a line of figures. */
  heading?: { title: ReactNode; line?: ReactNode };
  /** The page holds the group's fold (with `foldable`): a group that starts closed, or that the page opens itself (the offers an amount does not open, folded at a list's end). */
  fold?: { open: boolean; onToggle: () => void };
}

const MIN_SHARED_REM = 11;
const DETAIL = "__detail";

/** A dimmed column fades rather than jumps. */
const DIM = "transition-opacity duration-[var(--duration-base)]";

/** The head's caption row: each run of neighbouring columns with one `band` under one cell, the others under empty cells. The first column
 *  stands alone, so its cell can stay in place while the table scrolls sideways. */
function bandRuns(columns: readonly ProductColumn[]): { key: string; band: string | null; head: ReactNode; span: number }[] {
  const out: { key: string; band: string | null; head: ReactNode; span: number }[] = [];
  columns.forEach((c, i) => {
    const band = c.band ?? null;
    const last = out.at(-1);
    if (last && last.band === band && (i !== 1 || band !== null)) last.span += 1;
    else out.push({ key: c.id, band, head: c.bandHead ?? band, span: 1 });
  });
  return out;
}

/** The heads' first row: a column alone, or a run of neighbouring columns under one `over` head. */
function overRuns(columns: readonly ProductColumn[]): { key: string; first: number; span: number; over: ProductColumn["over"] }[] {
  const out: { key: string; first: number; span: number; over: ProductColumn["over"] }[] = [];
  columns.forEach((c, i) => {
    const last = out.at(-1);
    if (c.over && last?.over?.key === c.over.key) last.span += 1;
    else out.push({ key: c.id, first: i, span: 1, over: c.over });
  });
  return out;
}

/**
 * Which of the two layouts the screen shows. Both are in the pre-rendered page (the page cannot know the width), and in the browser's
 * first render, so hydration matches; from then on only the one the screen shows is built: a list of 180 rows drawn twice was half of
 * the time a click took.
 */
function usePlace(): "phone" | "table" | null {
  const wide = useMedia(MQ.md, null);
  return wide === null ? null : wide ? "table" : "phone";
}

/** Whether the table fits the width of its card: then nothing scrolls sideways, a sticky head can stick to the page (a scrolling card would
 *  hold it), and the card clips nothing above or below it (a "?" in the head keeps its 44 px over the card's edge). Otherwise the card marks
 *  itself `data-scrolled` while it is scrolled from its start, when the first column lies over the others (`tbl-pin`), and keeps that
 *  column's width as its scroll padding, so a link or button that takes focus further along a row scrolls out from under it. */
function useFitsWidth(place: "phone" | "table" | null) {
  const card = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const measure = () => {
      const table = el.querySelector("table");
      const fit = !!table && table.offsetWidth <= el.clientWidth + 1;
      setFits(fit);
      const head = table?.rows[0]?.cells[0];
      el.style.scrollPaddingInlineStart = !fit && head?.colSpan === 1 ? `${head.offsetWidth}px` : "";
    };
    const scrolled = () => el.toggleAttribute("data-scrolled", Math.abs(el.scrollLeft) > 0);
    measure();
    scrolled();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", scrolled);
    };
  }, [place]);
  return { card, fits };
}

/** A heading's strip, folding its group when `fold` is given: a press anywhere on it but a link toggles; the chevron is its button. */
function HeadingParts({ heading, fold }: { heading: NonNullable<ProductGroup["heading"]>; fold?: { open: boolean; toggle: () => void } }) {
  return (
    <>
      <span className="grp-title">{heading.title}</span>
      {heading.line && <span className="grp-line">{heading.line}</span>}
      {fold && (
        <button
          type="button"
          aria-expanded={fold.open}
          aria-label={kit.groupFold}
          onClick={(e) => {
            e.stopPropagation();
            fold.toggle();
          }}
          className="grp-fold"
        >
          <IconChevronDown size={18} className={cx("transition-transform duration-[var(--duration-fold)] ease-standard", fold.open && "rotate-180")} />
        </button>
      )}
    </>
  );
}

/** The strip's own press: a link or a button inside it (a term that opens its card) keeps its own. */
const stripPress = (toggle: () => void) => (e: React.MouseEvent) => {
  if (!(e.target as HTMLElement).closest("a, button, [role=button]")) toggle();
};

export function ProductTable({ columns, groups, foot, stickyHead, foldable, dense }: { columns: ProductColumn[]; groups: ProductGroup[]; foot?: (place: "phone" | "table") => ReactNode; /** The head row stays under the site's header while the page scrolls (a long list). It sticks while the table fits its card; a table that scrolls sideways scrolls its head with it. */ stickyHead?: boolean; /** A heading's strip folds its group's rows; every group starts open. */ foldable?: boolean; /** A dense table of many narrow columns (a company page's tracks, beside its side list): 8 px at each side of a cell between columns instead of 12; the table's two outer edges keep 12, so a figure or a "?" there keeps its 44 px inside the card. A column's `width` counts its cells' padding: 1 rem between columns, 1.25 at an edge. */ dense?: boolean }) {
  const bannerId = useId();
  const place = usePlace();
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  const foldOf = (g: ProductGroup) => (!foldable ? undefined : g.fold ? { open: g.fold.open, toggle: g.fold.onToggle } : { open: !closed.has(g.key), toggle: () => setClosed((c) => { const n = new Set(c); if (!n.delete(g.key)) n.add(g.key); return n; }) });
  const { card, fits } = useFitsWidth(place);
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  const flip = (key: string) => setOpened((o) => { const n = new Set(o); if (!n.delete(key)) n.add(key); return n; });
  // the rows' fold buttons: a column at the end, as wide as the most marks a button holds
  const marksMost = Math.max(-1, ...groups.flatMap((g) => g.rows.map((r) => (r.detail ? (r.detail.marks?.length ?? 0) : -1))));
  // the button: a 44 px target, wider with two marks (16 px each and their gaps, beside the 18 px chevron); a tight column's 4 px on each side
  if (marksMost >= 0) columns = [...columns, { id: DETAIL, head: <span className="sr-only">{kit.rowDetail}</span>, width: (Math.max(44, 18 + 20 * marksMost) + 8) / 16, tight: true }];
  // the columns that share the rest keep a readable width: under that the table scrolls inside its card (a narrow tablet)
  const minRem = columns.reduce((sum, c) => sum + (c.width ?? c.least ?? MIN_SHARED_REM), 0);
  const banded = columns.some((c) => c.band);
  const overs = columns.some((c) => c.over) ? overRuns(columns) : null;
  // the first column's cells: while the table scrolls sideways in its card, they stay at its start edge on the card's surface
  const first = (i: number) => (i === 0 ? "tbl-first" : null);
  // a dense table's cells at its outer edges keep the full padding on their outer side: the first column's, the last's, and a row's one cell
  const lastAt = columns.length - 1;
  const end = (i: number, span = 1) => (i + span - 1 === lastAt ? "tbl-end" : null);
  // the table's last row, if a row ends it (not a heading or a folded group)
  let lastRow: ProductRow | null = null;
  for (const g of [...groups].reverse()) {
    const open = !(g.heading && foldOf(g)?.open === false);
    if (open && g.rows.length) lastRow = g.rows.at(-1)!;
    if (g.heading || (open && g.rows.length)) break;
  }
  return (
    <>
      {place !== "table" && (
      <Card pad="none" data-flip-list className="md:hidden overflow-hidden flex flex-col">
        {groups.map((g) => {
          const fold = g.heading ? foldOf(g) : undefined;
          const rows = fold?.open === false ? [] : g.rows.map((r) => <Fragment key={r.key}>{r.phone}</Fragment>);
          const heading = g.heading && (
            <div className={cx("grp-phone", fold && "grp-foldable")} onClick={fold && stripPress(fold.toggle)}>
              <HeadingParts heading={g.heading} fold={fold} />
            </div>
          );
          return g.banner ? (
            <div key={g.key} role="group" aria-labelledby={`${bannerId}-${g.key}`} className="dup">
              {heading}
              <div id={`${bannerId}-${g.key}`} className="dup-banner">
                <IconAlert size={16} className="text-caution shrink-0" />
                {g.banner}
              </div>
              {rows}
            </div>
          ) : (
            <Fragment key={g.key}>
              {heading}
              {rows}
            </Fragment>
          );
        })}
        {foot?.("phone")}
      </Card>
      )}
      {place !== "phone" && (
      <Card ref={card} pad="none" className={cx("relative hidden md:block", fits ? "overflow-x-clip" : "overflow-x-auto overflow-y-hidden")}>
        {/* with a caption row or a head over several columns the whole head sticks, so its rows stay one block (tbl-banded); a table that
            scrolls sideways keeps its first column in place (tbl-pin) */}
        <table className={cx("tbl tbl-rows", dense && "tbl-dense", fits && stickyHead && "tbl-sticky", (banded || overs) && "tbl-banded", !fits && "tbl-pin")} style={{ minWidth: `${minRem}rem` }}>
          <TableCols widths={columns.map((c) => (c.width ? `${c.width}rem` : "auto"))} />
          <thead>
            {banded && (
              <tr className="tbl-band">
                {bandRuns(columns).map((run, i, runs) => (
                  <th key={run.key} scope={run.band ? "colgroup" : undefined} colSpan={run.span} className={cx(run.band ? "!pt-3 !pb-0 !border-b-0 text-xs font-normal text-muted-foreground" : "!p-0 !border-b-0", run.span === 1 ? first(i) : i === 0 && "tbl-start", i === runs.length - 1 && "tbl-end")}>
                    {/* a rule under the caption over its columns, so it reads as theirs, with the heads' own 10 px under it ("decrease the
                        forehead on the table"): 12 px over the caption and 16 px from its line to a head's words under it are the least
                        that lets a figure or a "?" in the caption keep its 44 px inside the card's rounded edge and clear of the head's
                        sort button, whose area starts 4 px over its words */}
                    {run.band && <span className="block pb-1.5 border-b border-border">{run.head}</span>}
                  </th>
                ))}
              </tr>
            )}
            {overs ? (
              <>
                {/* a head over several columns stands on the first line, their own heads under it on the second; every other head takes both */}
                <tr>
                  {overs.map((run) => {
                    const c = columns[run.first]!;
                    return run.over ? (
                      <th key={run.key} scope="colgroup" colSpan={run.span} className={cx("tbl-over", DIM, c.dim && "opacity-45", end(run.first, run.span))}>
                        {run.over.head}
                      </th>
                    ) : (
                      <th key={run.key} rowSpan={2} scope="col" aria-sort={c.sort} className={cx(c.tight && "px-1", c.headClassName, DIM, c.dim && "opacity-45", first(run.first), end(run.first))}>
                        {c.head}
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  {columns.map((c, i) =>
                    c.over ? (
                      <th key={c.id} scope="col" aria-sort={c.sort} className={cx("tbl-under", c.tight && "px-1", c.headClassName, DIM, c.dim && "opacity-45", end(i))}>
                        <span className="sr-only">{`${c.over.spoken}, `}</span>
                        {c.head}
                      </th>
                    ) : null,
                  )}
                </tr>
              </>
            ) : (
              <tr>
                {columns.map((c, i) => (
                  <th key={c.id} scope="col" aria-sort={c.sort} className={cx(c.tight && "px-1", c.headClassName, DIM, c.dim && "opacity-45", first(i), end(i))}>
                    {c.head}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody data-flip-list>
            {groups.flatMap((g) => {
              const fold = g.heading ? foldOf(g) : undefined;
              const shut = fold?.open === false;
              return [
              ...(g.heading
                ? [
                    <tr key={`${g.key}-heading`} className={cx("grp-row", fold && "grp-foldable")} onClick={fold && stripPress(fold.toggle)}>
                      <th colSpan={columns.length} scope="rowgroup" className="tbl-start tbl-end">
                        <HeadingParts heading={g.heading} fold={fold} />
                      </th>
                    </tr>,
                  ]
                : []),
              ...(g.banner && !shut
                ? [
                    <tr key={`${g.key}-banner`} className="dup-row">
                      <td colSpan={columns.length} className="tbl-start tbl-end !pb-1 !border-b-0 border-s-[3px] border-s-caution">
                        <span className="dup-banner !p-0">
                          <IconAlert size={16} className="text-caution shrink-0" />
                          {g.banner}
                        </span>
                      </td>
                    </tr>,
                  ]
                : []),
              ...(shut ? [] : g.rows).flatMap((r) => {
                const open = !!r.detail && opened.has(r.key);
                const cellClass = (i: number, span = 1) => cx(first(i), end(i, span), i === 0 && g.banner ? "border-s-[3px] border-s-caution" : null, columns[i]?.width && !columns[i]?.wrap ? "whitespace-nowrap" : null, columns[i]?.tight && "px-1", columns[i]?.cellClassName, DIM, columns[i]?.dim && "opacity-45", open && "!border-b-0");
                const rowClass = cx(g.banner ? "dup-row" : null, r.lit && "row-lit", r.mine && "row-mine");
                const lines = r.lines && r.lines.rows.length > 1 ? r.lines : null;
                const detailId = `${bannerId}-d-${r.key}`;
                const cells = marksMost >= 0 ? [...r.cells, r.detail ? <RowFoldButton open={open} onToggle={() => flip(r.key)} marks={r.detail.marks} label={r.detail.label} controls={detailId} /> : null] : r.cells;
                const detailRow = open
                  ? [
                      <tr key={`${r.key}-detail`} id={detailId} className="row-detail">
                        <td colSpan={columns.length} className="tbl-start tbl-end">{r.detail!.body}</td>
                      </tr>,
                    ]
                  : [];
                if (!lines)
                  return [
                    <tr key={r.key} data-row-of={r.rowOf} className={rowClass}>
                      {cells.map((cell, i) => (
                        <td key={columns[i]?.id ?? i} className={cellClass(i)}>
                          {cell}
                        </td>
                      ))}
                    </tr>,
                    ...detailRow,
                  ];
                // a line's cells sit close to the next line's, with no rule between them: the rule is under the whole row
                const last = lines.rows.length - 1;
                return [
                  ...lines.rows.map((line, k) => {
                    // the line's columns a cell before them covers (`spans`)
                    const covered = new Set<string>();
                    line.spans?.forEach((n, j) => {
                      const at = columns.findIndex((c) => c.id === lines.columns[j]);
                      for (let d = 1; d < n && at >= 0; d++) if (columns[at + d]) covered.add(columns[at + d]!.id);
                    });
                    return (
                    <tr key={`${r.key}-${line.key}`} data-row-of={r.rowOf} className={rowClass}>
                      {columns.map((c, i) => {
                        const j = lines.columns.indexOf(c.id);
                        if (j >= 0 && covered.has(c.id)) return null;
                        const span = j >= 0 ? (line.spans?.[j] ?? 1) : 1;
                        if (j < 0)
                          return k === 0 ? (
                            // the table's last row has no rule under it; a cell that spans the lines ends there too
                            <td key={c.id} rowSpan={lines.rows.length} className={cx(cellClass(i), lastRow === r && !open && "!border-b-0")}>
                              {cells[i]}
                            </td>
                          ) : null;
                        return (
                          <td key={c.id} colSpan={span > 1 ? span : undefined} className={cx(cellClass(i, span), k < last && "!border-b-0 !pb-1", k > 0 && "!pt-1")}>
                            {line.cells[j]}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  }),
                  ...detailRow,
                ];
              }),
              ];
            })}
          </tbody>
        </table>
        {foot?.("table")}
      </Card>
      )}
    </>
  );
}

/**
 * The button that folds a product's details open under its row (`ProductRow.detail`), and on a phone under the row's figures: a chevron,
 * after the row's marks (a note of the company's, a doubt), each an icon with its name for a screen reader and on hover.
 */
export function RowFoldButton({ open, onToggle, marks, label, controls, className }: { open: boolean; onToggle: () => void; marks?: FoldMark[]; label: string; controls?: string; className?: string }) {
  const named = marks && marks.length > 0 ? `${label} (${marks.map((m) => m.label).join(", ")})` : label;
  return (
    <button type="button" data-row-fold="" aria-expanded={open} aria-controls={controls} aria-label={named} title={named} onClick={onToggle} className={cx("inline-flex items-center justify-center gap-1 min-h-target min-w-target -my-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer", className)}>
      {marks?.map((m) => (
        <span key={m.key} aria-hidden="true" className="inline-flex">
          {m.icon}
        </span>
      ))}
      <IconChevronDown size={18} aria-hidden="true" className={cx("transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
    </button>
  );
}

/** The arrow at the end of a row that opens a page of the site, in the link's colour ("appear like a link to the
 *  site"). An arrow that opens a sheet on the same page is the button's own, not this. */
export function RowArrow({ className }: { className?: string }) {
  return <IconDrillIn className={cx("text-link shrink-0", className)} />;
}

/**
 * One product on a phone: a row of the list card. `stacked` when lines (fees, figures, labels) sit under the name, 4 px apart; `roomy` sets
 * them 8 px apart, for a row whose lines are a block of their own each (a deposit's name, then its rates at each amount).
 */
export function ProductPhoneRow({ stacked, roomy, className, children, rowOf, lit, mine }: { stacked?: boolean; roomy?: boolean; className?: string; children: ReactNode; /** As `ProductRow.rowOf`. */ rowOf?: string; /** As `ProductRow.lit`. */ lit?: boolean; /** As `ProductRow.mine`. */ mine?: boolean }) {
  return <div data-row-of={rowOf} className={cx("track", stacked && "!flex-col !items-stretch", stacked && (roomy ? "!gap-2" : "!gap-1"), lit && "row-lit", mine && "row-mine", className)}>{children}</div>;
}

/** The fold token in ms: 0 for a reader who asked for less motion, and on the server. */
const foldMs = () => (typeof window === "undefined" ? 0 : cssMs(getComputedStyle(document.documentElement).getPropertyValue("--duration-fold")));
const FOLD_EASE = "cubic-bezier(0.2, 0, 0, 1)";

/**
 * One product on a phone that opens in place, in a long list (the track browser's tracks under a company): closed, one line, its name and
 * one figure with its word, the whole line a button with a chevron at its end; the figure lies above the button and keeps its own tap (its
 * source). Open, the rest of the row (`children`: every line a `ProductPhoneRow` would show) grows under the line, so what is below it moves
 * gently and nothing above it moves; it folds back the same way. Starts closed. `label` is the button's spoken name (the product's name).
 */
export function ProductPhoneFold({ name, figure, label, children }: { name: ReactNode; /** At the line's end: a figure and its word. */ figure?: ReactNode; label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  const closing = useRef<Animation | null>(null);
  // opening grows the part from nothing
  useLayoutEffect(() => {
    const el = body.current;
    const ms = foldMs();
    if (!open || !el || !ms || !el.animate) return;
    el.animate([{ height: "0px", opacity: 0, overflow: "clip" }, { height: `${el.scrollHeight}px`, opacity: 1, overflow: "clip" }], { duration: ms, easing: FOLD_EASE });
  }, [open]);
  const toggle = () => {
    // tapped again while it folds: it stays open
    if (closing.current) {
      closing.current.cancel();
      closing.current = null;
      return;
    }
    const el = body.current;
    const ms = foldMs();
    if (!open || !el || !ms || !el.animate) return setOpen(!open);
    const shut = el.animate([{ height: `${el.offsetHeight}px`, opacity: 1, overflow: "clip" }, { height: "0px", opacity: 0, overflow: "clip" }], { duration: ms, easing: FOLD_EASE, fill: "forwards" });
    closing.current = shut;
    shut.onfinish = () => {
      closing.current = null;
      setOpen(false);
    };
  };
  return (
    <div className="track !flex-col !items-stretch !gap-0 !py-0">
      <div className={cx("relative flex items-center gap-3 min-h-14 py-2", LIFT)}>
        <span className="flex-1 min-w-0 font-medium">{name}</span>
        {figure && <span className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap">{figure}</span>}
        <IconChevronDown size={18} aria-hidden="true" className={cx("shrink-0 text-muted-foreground transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
        <button type="button" data-fold-line="" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={label} onClick={toggle} className="absolute -inset-x-4 inset-y-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2" />
      </div>
      {open && (
        <div ref={body} id={id} className="flex flex-col gap-1 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

/** Links and buttons inside a row whose whole line is a stretched button lie above that button and keep their own tap. */
const LIFT = "[&_:is(a,button,[role=button]):not([data-fold-line])]:relative [&_:is(a,button,[role=button]):not([data-fold-line])]:z-10";

/** Figures each followed by its word ("0.35% קבועים", "0.62% מהחיסכון"): one under the other in a table cell, in one line on a phone. */
export function ProductFigures({ items, inline }: { items: { id: string; figure: ReactNode; word: ReactNode }[]; inline?: boolean }) {
  return (
    <span className={inline ? "contents" : "flex flex-col gap-1"}>
      {items.map((it) => (
        <span key={it.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {it.figure}
          <span className="text-sm text-muted-foreground">{it.word}</span>
        </span>
      ))}
    </span>
  );
}

/** A fee among a product's figures: its number, "אין" for a fee the product does not have, "לא נאסף" for one whose number was not collected. */
export function FeeFigure({ value, absent, inline }: { value: SiteValue | null; absent?: boolean; inline?: boolean }) {
  if (value) return <Num value={value} size={inline ? "inline" : "cell"} />;
  return <span className="text-sm text-muted-foreground">{absent ? invest.funds.noSuchFee : invest.funds.notCollected}</span>;
}

const fees = brands.funds;

/** The head of a fund list's three fees, with the "?" that opens the three terms on one sheet. */
export function FundFeesHead() {
  // the mark never stands alone on a line: it is held to the head's last word (a "?" alone under the head)
  const head = fees.columns.fees;
  return (
    <span className="block text-balance">
      <LeadTail lead={head}>
        <HelpMark term={fees.feeTerms} about={head} lead={fees.feeHelpLead} className="ms-1" />
      </LeadTail>
    </span>
  );
}

/** The same sheet on a phone, whose rows have no column heads: one line over the list, as the tracks page's. */
export function FundFeesPhoneHelp() {
  return (
    <p className="md:hidden text-sm text-muted-foreground">
      {trackBrowser.help.phoneLead}{" "}
      <Term id={fees.feeTerms} name={fees.columns.fees} lead={fees.feeHelpLead}>
        {fees.columns.fees}
      </Term>
    </p>
  );
}

/** What "אין" and "לא נאסף" say, under a list of funds that may hold a foreign fund, with the rules behind it. */
export function FeeWordsNote({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <span className="text-sm text-muted-foreground">{invest.funds.feeWordsNote}</span>
      <RulesLine ids={["ETF-71", "ETF-14", "MF-20"]} />
    </div>
  );
}

/** A product's identifier as the link to its official page elsewhere (a fund's number to Maya): the number, then the external icon. Without an address, the number alone. `label` is the link's spoken name, saying where it leads. The touch area is 44 px high while the line keeps its own height (it sits inside a line of a phone's row). */
export function ProductIdLink({ id, href, label }: { id: string; href: string | null; label: string }) {
  const n = (
    <bdi dir="ltr" className="num-id">
      {id}
    </bdi>
  );
  if (!href) return n;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-link hover:underline inline-flex items-center gap-1 whitespace-nowrap min-h-target -my-2.5">
      {n}
      <IconExternal size={14} />
    </a>
  );
}
