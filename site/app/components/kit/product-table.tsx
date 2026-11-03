// A list of products of one kind (founder, 2026-10-27, design-system 11 "Lists of products"): one table on a desktop, one row per
// product on a phone, never a stack of cards. The company page's tracks, a brand's funds and the track browser are built on it. A group
// of rows can carry a caution banner (tracks that share a name) or a heading (a company, a kind of money: 2026-11-03, the track browser).
// A column head can sort the table (`SortHead`), and the head row can stay under the site's header while a long list scrolls. With
// `foldable`, a heading's strip folds its group's rows (founder, 2026-11-03: "make the company name strip clickable for collapsible"); a
// link in the strip (the company's page) still opens. The cells and the phone rows are the caller's; the shell, the banner, the heading
// and the widths are here. `RowArrow` is the arrow at the end of a row that opens a page of the site. The body and the phone card are the
// lists `useFlip` slides when the rows are sorted or filtered again.
import { Fragment, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { brands, invest, kit, trackBrowser } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { IconAlert, IconChevronDown, IconDrillIn, IconExternal } from "../icons";
import { Num, RulesLine, Term } from "../provenance";
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
}

export interface ProductGroup {
  key: string;
  rows: ProductRow[];
  /** A caution line over rows that belong together, with the alert icon (tracks that share a name). */
  banner?: ReactNode;
  /** A heading over the group's rows, on the table's width and on a phone: its title (a company, a kind), then a line of figures. */
  heading?: { title: ReactNode; line?: ReactNode };
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
 * the time a click took (2026-11-03).
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

/** The strip's own press: a link or a button inside it keeps its own. */
const stripPress = (toggle: () => void) => (e: React.MouseEvent) => {
  if (!(e.target as HTMLElement).closest("a, button")) toggle();
};

export function ProductTable({ columns, groups, foot, stickyHead, foldable }: { columns: ProductColumn[]; groups: ProductGroup[]; foot?: (place: "phone" | "table") => ReactNode; /** The head row stays under the site's header while the page scrolls (a long list). It sticks while the table fits its card; a table that scrolls sideways scrolls its head with it. */ stickyHead?: boolean; /** A heading's strip folds its group's rows; every group starts open. */ foldable?: boolean }) {
  const bannerId = useId();
  const place = usePlace();
  const [closed, setClosed] = useState<ReadonlySet<string>>(() => new Set());
  const foldOf = (key: string) => (foldable ? { open: !closed.has(key), toggle: () => setClosed((c) => { const n = new Set(c); if (!n.delete(key)) n.add(key); return n; }) } : undefined);
  const { card, fits } = useFitsWidth(!!stickyHead, place);
  // the columns that share the rest keep a readable width: under that the table scrolls inside its card (a narrow tablet)
  const minRem = columns.reduce((sum, c) => sum + (c.width ?? MIN_SHARED_REM), 0);
  return (
    <>
      {place !== "table" && (
      <Card pad="none" data-flip-list className="md:hidden overflow-hidden flex flex-col">
        {groups.map((g) => {
          const fold = g.heading ? foldOf(g.key) : undefined;
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
              const fold = g.heading ? foldOf(g.key) : undefined;
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
              ...(shut ? [] : g.rows).map((r) => (
                <tr key={r.key} className={cx(g.banner ? "dup-row" : null)}>
                  {r.cells.map((cell, i) => (
                    <td key={columns[i]?.id ?? i} className={cx(i === 0 && g.banner ? "border-s-[3px] border-s-caution" : null, columns[i]?.width ? "whitespace-nowrap" : null, columns[i]?.cellClassName)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              )),
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

/** The arrow at the end of a row that opens a page of the site, in the link's colour (founder, 2026-11-03: "appear like a link to the
 *  site"). An arrow that opens a sheet on the same page is the button's own, not this. */
export function RowArrow({ className }: { className?: string }) {
  return <IconDrillIn className={cx("text-link shrink-0", className)} />;
}

/** One product on a phone: a row of the list card. `stacked` when lines (fees, figures, labels) sit under the name. */
export function ProductPhoneRow({ stacked, className, children }: { stacked?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx("track", stacked && "!flex-col !items-stretch !gap-1", className)}>{children}</div>;
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

/** The head of a fund list's three fees, with the "?" that opens the three terms on one sheet (founder, 2026-11-03). */
export function FundFeesHead() {
  return (
    <span>
      {fees.columns.fees}
      {/* inline, so the mark follows the head's last word when the head wraps */}
      <HelpMark term={fees.feeTerms} about={fees.columns.fees} lead={fees.feeHelpLead} className="ms-1" />
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

/** A product's identifier as the link to its official page elsewhere (a fund's number to Maya): the number, then the external icon. Without an address, the number alone. `label` is the link's spoken name, saying where it leads. The touch area is 44 px high while the line keeps its own height (2026-11-03: it sits inside a line of a phone's row). */
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
