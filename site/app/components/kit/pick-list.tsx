// A list to choose one row from (the index page's two lists beside the ruler, and a custom index's account list): every row is a radio,
// the chosen one marked; the rows' cells are the caller's, on a grid the caller names, and a head row can name the columns.
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MQ } from "../../lib/hooks";
import { useFlip } from "./chart-glide";
import { cx } from "./cx";
import { foldShown, heldFoldHeight, type FoldOrder } from "./pick-list-hold";

export interface PickRow {
  key: string;
  selected: boolean;
  onSelect: () => void;
  /** The row's cells, laid out on the list's `columns`. */
  cells: ReactNode;
  /** A row that cannot be chosen as it is is still a row, muted (it is never left out). */
  muted?: boolean;
  /** A row nothing can choose (a fund no account prices): shown, but no button; a tap and a key do nothing, and it says so. */
  disabled?: boolean;
  /** A group's heading, shown above this row (the index page's two kinds of fund); not a row, never chosen. */
  heading?: ReactNode;
  /** Never folded on a phone (the person's own row, D44). */
  keep?: boolean;
  /** What the fold's button counts the row as, when two rows are one thing (the same fund in Tel Aviv and abroad): rows with one value count once. */
  countAs?: string;
}

/**
 * `columns`: the grid template after the radio (for example `"minmax(0,1fr) auto"`); `phoneColumns` the template below `md`, where
 * a cell may move to a second line (`max-md:row-start-2`). `head`: the column names, on the same grid. `phoneLimit`: on a phone, the
 * rows after the first N fold behind a button (`more` words it), the chosen row always shown; nothing is filtered out. The fold shows
 * the same rows whichever is chosen (a chosen row further down takes the last place, and a group's heading row is always shown), and it
 * holds the height of the tallest rows that can stand in it: a pick that sorts other rows into the fold moves nothing below the list.
 * `orders`: every order the rows can take (the funds sorted at each account), so the fold holds the tallest rows of any of them, whichever
 * the page opened in; without it, the tallest N rows of the list.
 */
/**
 * A figure that must fit a fixed width, a size down as its digits grow, so a plan typed past the sliders' ends never cuts its leading
 * digits. `list`: a list's fixed last column (7.5rem on a computer holds "999,999,999 ₪", 6.5rem on a phone "99,999,999 ₪"), a
 * size down past eight digits on a phone, past nine digits on a computer, and again past twelve on both; a phone shows a billion or more
 * in its short form ("2.30 מיליארד ₪").
 * `tile`: a 24 px figure in one of two tiles side by side on a phone, a size down past seven digits, nine and eleven; the tile holds the
 * 24 px line's height (`min-h-[1.875rem]` on a phone), so a smaller figure moves nothing.
 */
export const figureFit = (v: number, kind: "list" | "tile" = "list") => {
  const a = Math.abs(v);
  if (kind === "tile") return a >= 1e11 ? "max-md:text-base" : a >= 1e9 ? "max-md:text-lg" : a >= 1e7 ? "max-md:text-xl" : "";
  // on a phone a billion or more reads in its short form (`Num`), which a size down holds at any plan
  // a thousand billion and more is 12 px on a phone too: its short form has two decimals now ("2,542.21 מיליארד ₪"), and at 14 px it ran
  // 4 px past the fund list's 8.5rem column
  return a >= 1e12 ? "text-xs" : a >= 1e9 ? "text-sm" : a >= 1e8 ? "max-md:text-sm" : "";
};

/** A click on a control inside a row (a figure's sheet, a link, a label) is that control's, not a pick. */
const inControl = (target: EventTarget, row: HTMLElement) => {
  // a fold under a row (a house's group prices): its line opens it and a tap on what it shows is reading, not a pick
  const hit = (target as Element).closest?.("a, button, input, select, textarea, summary, details, [role=button], [role=link]");
  return !!hit && hit !== row && row.contains(hit);
};

// A pick made outside the list (a name in a "not priced" line under it) that brings a row into the list: that row takes the place on the
// screen of what was tapped. One pending hold for the page; the list that has the row takes it.
let pending: Hold | null = null;

/**
 * A tapped row is held where it was for a moment, over every render in it, not only the first: a pick renders more than once (a note
 * on the row before the address changes, the sorted lists after it), and the first render used the hold up while the rows moved on the
 * next (a row that moved the other half landed 1,400 px off screen). The person's own scroll ends the hold.
 */
const HOLD_MS = 1200;
interface Hold { key: string; top: number; until: number }
const holdOf = (key: string, el: HTMLElement): Hold => ({ key, top: el.getBoundingClientRect().top, until: performance.now() + HOLD_MS });

/** Call before a pick made outside the list (or by a control inside a row): the list row `key` will appear where `el` is now. */
export function holdOnPick(key: string, el: HTMLElement) {
  pending = holdOf(key, el);
}

/**
 * `look`: `tinted` (the chosen row tinted, with a bar at its start) or `line` (one-line rows of a list set beside a ruler,
 * `StretchChart`: no radio, rows 32 px apart with a fine pointer and at least 44 px on touch and below 1280 px, the chosen row tinted and
 * outlined in `tone`'s colour, its cells saying in words that it is the chosen one, a group's heading a quiet line of the caller's own).
 * `anchor`: the name the list's rows are found by (`data-anchor`, `StretchChart`'s anchors).
 */
export function PickList({ label, columns, phoneColumns, head, rows, phoneLimit, more, orders, look = "tinted", tone = "primary", anchor: anchorName }: { anchor?: string; label: string; columns: string; phoneColumns?: string; head?: ReactNode; rows: PickRow[]; phoneLimit?: number; more?: (hidden: number) => string; orders?: FoldOrder[]; look?: "tinted" | "line"; /** `line`: the chosen row's colour, the role of what the list chooses (`account`, `fund`). */ tone?: "primary" | "account" | "fund" }) {
  const [open, setOpen] = useState(false);
  // a pick re-prices what is above the list: keep the tapped row where it
  // was on the screen, wherever the list now puts it
  const anchor = useRef<Hold | null>(null);
  // when the order changes the rows slide to their new places, and the tapped row is the one that stands still
  // only a hold still running: a stale one made the row picked seconds before jump to its new place while the others slid (a bank marked as the person's own re-sorted the account list)
  const live = (h: Hold | null) => (h && performance.now() <= h.until ? h.key : undefined);
  const root = useFlip<HTMLDivElement>(rows.map((r) => r.key).join(), () => live(anchor.current) ?? live(pending));
  // the person's own scroll ends a hold: a render after it must not take the page back (a key is not watched: Enter on a row starts one)
  useEffect(() => {
    const end = () => {
      anchor.current = null;
      pending = null;
    };
    const opts = { passive: true } as const;
    window.addEventListener("wheel", end, opts);
    window.addEventListener("touchmove", end, opts);
    return () => {
      window.removeEventListener("wheel", end);
      window.removeEventListener("touchmove", end);
    };
  }, []);
  useLayoutEffect(() => {
    const now = performance.now();
    if (anchor.current && now > anchor.current.until) anchor.current = null;
    if (pending && now > pending.until) pending = null;
    const outside = pending && rows.some((r) => r.key === pending!.key) ? pending : null;
    const a = anchor.current ?? outside;
    if (!a || !root.current) return;
    const list = root.current;
    const hold = () => {
      const el = [...list.querySelectorAll<HTMLElement>("[data-pick-key]")].find((x) => x.dataset.pickKey === a.key);
      const moved = el ? el.getBoundingClientRect().top - a.top : 0;
      if (Math.abs(moved) > 1) window.scrollBy({ top: moved, behavior: "instant" });
    };
    hold();
    // once more after the browser's own layout pass (its scroll anchoring can move the page again)
    requestAnimationFrame(hold);
  });
  const choose = (r: PickRow, el: HTMLElement) => {
    if (r.disabled) return;
    anchor.current = holdOf(r.key, el);
    r.onSelect();
  };
  const grid = { "--pick-cols": columns, "--pick-cols-phone": phoneColumns ?? columns } as CSSProperties;
  const line = look === "line";
  const cellsClass = cx("grid gap-x-3 items-center", line ? "gap-y-0.5" : "gap-y-1");
  const rowClass = cx(
    "text-start focus-visible:outline-2 focus-visible:outline-ring",
    // a line row of 32 px with a fine pointer, 44 px on touch and below 1280 px
    line ? "rounded-lg px-2.5 py-1 min-h-8 pointer-coarse:min-h-target max-xl:min-h-target" : "px-4 py-2.5 min-h-target border-b border-border last:border-b-0",
  );
  const radio = (r: PickRow) => (line ? null : <span aria-hidden="true" className={cx("size-4 rounded-full border-[1.5px] self-start mt-1", r.selected ? "border-[5px] border-primary" : "border-input")} />);
  const gridClass = line ? "grid-cols-[var(--pick-cols-phone)] md:grid-cols-[var(--pick-cols)]" : "grid-cols-[1.25rem_var(--pick-cols-phone)] md:grid-cols-[1.25rem_var(--pick-cols)]";
  const chosenLine = { primary: "bg-primary/10 ring-[1.5px] ring-inset ring-primary hover:bg-primary/10", account: "bg-chart-by-account/15 ring-[1.5px] ring-inset ring-chart-by-account hover:bg-chart-by-account/15", fund: "bg-chart-by-fund/15 ring-[1.5px] ring-inset ring-chart-by-fund hover:bg-chart-by-fund/15" }[tone];
  const folds = !open && phoneLimit !== undefined && rows.length > phoneLimit + 1;
  // the rows the fold shows: the first N, the chosen one among them (further down, it takes the last place, so the count never changes);
  // a row that opens a group stays, so a group's heading is never hidden behind the fold, and the person's own rows stay
  const shownInFold = folds ? foldShown(rows.map((r) => ({ heading: !!r.heading, keep: !!r.keep, selected: r.selected })), phoneLimit!) : new Set<number>();
  const folded = (i: number) => folds && !shownInFold.has(i);
  // what the button counts: the things behind the fold, each once, and none already shown above it ("עוד 15 קרנות" counted rows, the
  // same fund in Tel Aviv and abroad twice)
  const unit = (r: PickRow) => r.countAs ?? r.key;
  const above = new Set(rows.filter((_, i) => !folded(i)).map(unit));
  const hiddenRows = rows.filter((_, i) => folded(i)).length;
  const hidden = new Set(rows.filter((r, i) => folded(i) && !above.has(unit(r))).map(unit)).size || hiddenRows;
  // the folded rows are laid out unseen, out of the flow, and measured (a row's height depends on its words at this width): the fold holds
  // the height of its tallest rows
  useLayoutEffect(() => {
    const list = root.current;
    if (!list) return;
    const fit = () => {
      list.style.minHeight = "";
      const h = (el: Element) => el.getBoundingClientRect().height;
      const rowEls = [...list.querySelectorAll<HTMLElement>(":scope > [data-pick-key]")];
      const inFlow = rowEls.filter((el) => el.dataset.folded === undefined || window.matchMedia(MQ.md).matches);
      const now = inFlow.reduce((a, el) => a + h(el), 0);
      let most = now;
      if (folds && !window.matchMedia(MQ.md).matches) {
        // a row's height, folded rows included (laid out unseen): the fold holds the tallest rows it can show
        const byKey = new Map(rowEls.map((el) => [el.dataset.pickKey!, h(el)]));
        const height = (k: string) => byKey.get(k) ?? 0;
        // without the orders, the tallest N of the list's other rows, beside the person's own (always shown)
        const free = rows.filter((r) => !r.keep).map((r) => r.key).sort((a, b) => height(b) - height(a));
        const keepNow = rows.filter((r) => r.keep).reduce((a, r) => a + height(r.key), 0);
        most = Math.max(most, orders?.length ? heldFoldHeight(orders, phoneLimit!, height) : heldFoldHeight([{ keys: free, headings: new Set(), choosable: new Set() }], phoneLimit!, height) + keepNow);
      }
      const held = most - now > 0.5 ? h(list) + most - now : 0;
      if (held > 0) list.style.minHeight = `${held}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  });
  return (
    <div ref={root} role="radiogroup" aria-label={label} data-anchor={anchorName} className="relative flex flex-col [overflow-anchor:none]">
      {head && (
        <div className={cx("grid gap-x-3 items-end pb-1.5 text-xs text-muted-foreground", line ? "px-2.5" : "px-4 border-b border-border", gridClass)} style={grid}>
          {!line && <span />}
          {head}
        </div>
      )}
      {rows.map((r, i) => (
        // a div, not a button: a row holds controls of its own (a fund's number to Maya, a figure's sheet), and a click on one is not a pick
        <Fragment key={r.key}>
        {r.heading && <div className={cx(line ? "px-2.5 pt-3 pb-1 text-xs" : "px-4 py-2 bg-popover border-b border-border text-sm font-semibold", folded(i) && "max-md:hidden")}>{r.heading}</div>}
        <div
          role="radio"
          aria-checked={r.selected}
          {...(r.disabled ? { "aria-disabled": true } : {})}
          data-pick-key={r.key}
          data-flip={r.key}
          {...(folded(i) ? { "data-folded": "" } : {})}
          {...(r.keep ? { "data-keep": "" } : {})}
          tabIndex={r.selected ? 0 : -1}
          onClick={(e) => {
            if (!inControl(e.target, e.currentTarget)) choose(r, e.currentTarget);
          }}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && e.target === e.currentTarget) {
              e.preventDefault();
              choose(r, e.currentTarget);
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              // the next row, past a group's heading
              let next = (e.key === "ArrowDown" ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling) as HTMLElement | null;
              while (next && next.getAttribute("role") !== "radio" && !next.matches("button")) next = (e.key === "ArrowDown" ? next.nextElementSibling : next.previousElementSibling) as HTMLElement | null;
              if (next?.getAttribute("role") === "radio") next.focus();
            }
          }}
          className={cx(
            rowClass,
            // a row that can be chosen shows it on a computer: the pointer, and a light on hover
            !r.disabled && "cursor-pointer hover:bg-muted/60",
            cellsClass,
            gridClass,
            // a folded row is laid out unseen and out of the flow, so its height can be read (the fold holds its tallest rows)
            folded(i) && "max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:invisible",
            r.selected && (line ? chosenLine : "bg-primary/10 shadow-[inset_-3px_0_0_var(--primary)] hover:bg-primary/10"),
            r.muted && !r.selected && "text-muted-foreground",
          )}
          style={grid}
        >
          {radio(r)}
          {r.cells}
        </div>
        </Fragment>
      ))}
      {hiddenRows > 0 && more && (
        <button type="button" onClick={() => setOpen(true)} className="md:hidden text-link text-sm font-medium min-h-target px-4 text-start hover:underline">
          {more(hidden)}
        </button>
      )}
    </div>
  );
}
