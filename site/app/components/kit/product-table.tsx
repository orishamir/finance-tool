// A list of products of one kind (design-system 11 "Lists of products"): one table on a desktop, one row per
// product on a phone, never a stack of cards. The company page's tracks, a brand's funds and the track browser are built on it. A group
// of rows can carry a caution banner (tracks that share a name) or a heading (a company, a kind of money: the track browser).
// A column head can sort the table (`SortHead`), and the head row can stay under the site's header while a long list scrolls. With
// `foldable`, a heading's strip folds its group's rows; a
// link in the strip (the company's page) still opens. The cells and the phone rows are the caller's; the shell, the banner, the heading
// and the widths are here. `RowArrow` is the arrow at the end of a row that opens a page of the site. The body and the phone card are the
// lists `useFlip` slides when the rows are sorted or filtered again.
import { Fragment, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { brands, invest, kit, trackBrowser } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { IconAlert, IconChevronDown, IconDrillIn, IconExternal } from "../icons";
import { LeadTail, Num, RulesLine, Term } from "../provenance";
import { Card } from "./card";
import { HelpMark } from "./help-mark";
import { cx } from "./cx";
import { TableCols } from "./table-cols";

export interface ProductColumn {
  id: string;
  head: ReactNode;
  /** As wide as its longest real content, in rem (a number, a link, figures), and not wrapping; the columns without it share the rest. */
  width?: number;
  headClassName?: string;
  cellClassName?: string;
  /** The column's sort state, when its head sorts the table (a `SortHead` inside `head`): sets `aria-sort` on the head's cell. */
  sort?: "ascending" | "descending" | "none";
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
  /**
   * One product sold on several terms under one name (a bank's deposit with and without exit points): one line for each, under one name.
   * The columns named in `columns` take a cell on every line (`rows`, in order); every other column keeps the row's own cell, once,
   * spanning the lines. The phone row is the caller's and shows the lines its own way.
   */
  lines?: { columns: string[]; rows: { key: string; cells: ReactNode[] }[] };
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

const WIDE = "(min-width: 48rem)";
const subscribe = (onChange: () => void) => {
  const m = window.matchMedia(WIDE);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
};

/**
 * Which of the two layouts the screen shows. Both are in the pre-rendered page (the page cannot know the width), and in the browser's
 * first render, so hydration matches; from then on only the one the screen shows is built: a list of 180 rows drawn twice was half of
 * the time a click took.
 */
function usePlace(): "phone" | "table" | null {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(WIDE).matches ? "table" : "phone"),
    () => null,
  );
}

/** Whether the table fits the width of its card: then nothing scrolls sideways, and a sticky head can stick to the page (a scrolling card would hold it). */
function useFitsWidth(on: boolean, place: "phone" | "table" | null) {
  const card = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);
  useLayoutEffect(() => {
    const el = card.current;
    if (!on || !el) return;
    const measure = () => {
      const table = el.querySelector("table");
      setFits(!!table && table.offsetWidth <= el.clientWidth + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [on, place]);
  return { card, fits: on && fits };
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

export function ProductTable({ columns, groups, foot, stickyHead, foldable }: { columns: ProductColumn[]; groups: ProductGroup[]; foot?: (place: "phone" | "table") => ReactNode; /** The head row stays under the site's header while the page scrolls (a long list). It sticks while the table fits its card; a table that scrolls sideways scrolls its head with it. */ stickyHead?: boolean; /** A heading's strip folds its group's rows; every group starts open. */ foldable?: boolean }) {
  const bannerId = useId();
  const place = usePlace();
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  const foldOf = (g: ProductGroup) => (!foldable ? undefined : g.fold ? { open: g.fold.open, toggle: g.fold.onToggle } : { open: !closed.has(g.key), toggle: () => setClosed((c) => { const n = new Set(c); if (!n.delete(g.key)) n.add(g.key); return n; }) });
  const { card, fits } = useFitsWidth(!!stickyHead, place);
  // the columns that share the rest keep a readable width: under that the table scrolls inside its card (a narrow tablet)
  const minRem = columns.reduce((sum, c) => sum + (c.width ?? MIN_SHARED_REM), 0);
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
        <table className={cx("tbl tbl-rows", fits && "tbl-sticky")} style={{ minWidth: `${minRem}rem` }}>
          <TableCols widths={columns.map((c) => (c.width ? `${c.width}rem` : "auto"))} />
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.id} scope="col" aria-sort={c.sort} className={c.headClassName}>
                  {c.head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-flip-list>
            {groups.flatMap((g) => {
              const fold = g.heading ? foldOf(g) : undefined;
              const shut = fold?.open === false;
              return [
              ...(g.heading
                ? [
                    <tr key={`${g.key}-heading`} className={cx("grp-row", fold && "grp-foldable")} onClick={fold && stripPress(fold.toggle)}>
                      <th colSpan={columns.length} scope="rowgroup">
                        <HeadingParts heading={g.heading} fold={fold} />
                      </th>
                    </tr>,
                  ]
                : []),
              ...(g.banner && !shut
                ? [
                    <tr key={`${g.key}-banner`} className="dup-row">
                      <td colSpan={columns.length} className="!pb-1 !border-b-0 border-s-[3px] border-s-caution">
                        <span className="dup-banner !p-0">
                          <IconAlert size={16} className="text-caution shrink-0" />
                          {g.banner}
                        </span>
                      </td>
                    </tr>,
                  ]
                : []),
              ...(shut ? [] : g.rows).flatMap((r) => {
                const cellClass = (i: number) => cx(i === 0 && g.banner ? "border-s-[3px] border-s-caution" : null, columns[i]?.width ? "whitespace-nowrap" : null, columns[i]?.cellClassName);
                const rowClass = cx(g.banner ? "dup-row" : null, r.lit && "row-lit");
                const lines = r.lines && r.lines.rows.length > 1 ? r.lines : null;
                if (!lines)
                  return [
                    <tr key={r.key} data-row-of={r.rowOf} className={rowClass}>
                      {r.cells.map((cell, i) => (
                        <td key={columns[i]?.id ?? i} className={cellClass(i)}>
                          {cell}
                        </td>
                      ))}
                    </tr>,
                  ];
                // a line's cells sit close to the next line's, with no rule between them: the rule is under the whole row
                const last = lines.rows.length - 1;
                return lines.rows.map((line, k) => (
                  <tr key={`${r.key}-${line.key}`} data-row-of={r.rowOf} className={rowClass}>
                    {columns.map((c, i) => {
                      const j = lines.columns.indexOf(c.id);
                      if (j < 0)
                        return k === 0 ? (
                          // the table's last row has no rule under it; a cell that spans the lines ends there too
                          <td key={c.id} rowSpan={lines.rows.length} className={cx(cellClass(i), lastRow === r && "!border-b-0")}>
                            {r.cells[i]}
                          </td>
                        ) : null;
                      return (
                        <td key={c.id} className={cx(cellClass(i), k < last && "!border-b-0 !pb-1", k > 0 && "!pt-1")}>
                          {line.cells[j]}
                        </td>
                      );
                    })}
                  </tr>
                ));
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

/** The arrow at the end of a row that opens a page of the site, in the link's colour ("appear like a link to the
 *  site"). An arrow that opens a sheet on the same page is the button's own, not this. */
export function RowArrow({ className }: { className?: string }) {
  return <IconDrillIn className={cx("text-link shrink-0", className)} />;
}

/** One product on a phone: a row of the list card. `stacked` when lines (fees, figures, labels) sit under the name. */
export function ProductPhoneRow({ stacked, className, children, rowOf, lit }: { stacked?: boolean; className?: string; children: ReactNode; /** As `ProductRow.rowOf`. */ rowOf?: string; /** As `ProductRow.lit`. */ lit?: boolean }) {
  return <div data-row-of={rowOf} className={cx("track", stacked && "!flex-col !items-stretch !gap-1", lit && "row-lit", className)}>{children}</div>;
}

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
