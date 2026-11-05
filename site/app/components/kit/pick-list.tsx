// A list to choose one row from (founder, 2026-10-27, the index page's two linked lists): every row is a radio, the chosen one is
// tinted with a bar at its start; the rows' cells are the caller's, on a grid the caller names, and a head row can name the columns.
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useFlip } from "./chart-glide";
import { cx } from "./cx";
import { Unseen } from "./longest-case";

export interface PickRow {
  key: string;
  selected: boolean;
  onSelect: () => void;
  /** The row's cells, laid out on the list's `columns`. */
  cells: ReactNode;
  /** A row that cannot be chosen as it is is still a row, muted (it is never left out). */
  muted?: boolean;
  /** A group's heading, shown above this row (2026-10-29, the index page's two kinds of fund); not a row, never chosen. */
  heading?: ReactNode;
  /** Never folded on a phone (the person's own row, D44). */
  keep?: boolean;
  /**
   * The cells the row takes in the list's other states (`states`), by key: a house priced or not, with each reason it can give. Laid out
   * unseen and out of the flow, to be measured; `caseKey` is the one the row shows now.
   */
  cases?: { key: string; cells: ReactNode }[];
  caseKey?: string;
  /** On a phone, false when the row can never stand among the fold's shown rows (it sorts last at every choice and cannot be chosen). */
  canShow?: boolean;
}

/**
 * `columns`: the grid template after the radio (for example `"minmax(0,1fr) auto"`); `phoneColumns` the template below `md`, where
 * a cell may move to a second line (`max-md:row-start-2`). `head`: the column names, on the same grid. `phoneLimit`: on a phone, the
 * rows after the first N fold behind a button (`more` words it), the chosen row always shown; nothing is filtered out. The fold shows
 * the same number of rows whichever is chosen (a chosen row further down takes the last place), and it holds the height of the tallest
 * rows that can stand in it: a pick that sorts other rows into the fold moves nothing below the list (#190).
 * `states`: the list's other states (another fund picked in a linked list), each the case key of every row; the list holds the height of
 * its tallest state, so a pick that turns rows grey with their reasons moves nothing below it (#190: up to 433 px on a phone).
 */
/**
 * A figure that must fit a fixed width, a size down as its digits grow, so a plan typed past the sliders' ends never cuts its leading
 * digits (#190). `list`: a list's fixed last column (7.5rem on a computer holds "999,999,999 ₪", 6.5rem on a phone "99,999,999 ₪"), a
 * size down past eight digits on a phone, past nine digits everywhere, and again past twelve.
 * `tile`: a 24 px figure in one of two tiles side by side on a phone, a size down past seven digits, nine and eleven; the tile holds the
 * 24 px line's height (`min-h-[1.875rem]` on a phone), so a smaller figure moves nothing.
 */
export const figureFit = (v: number, kind: "list" | "tile" = "list") => {
  const a = Math.abs(v);
  if (kind === "tile") return a >= 1e11 ? "max-md:text-base" : a >= 1e9 ? "max-md:text-lg" : a >= 1e7 ? "max-md:text-xl" : "";
  return a >= 1e12 ? "text-xs" : a >= 1e9 ? "text-sm max-md:text-xs" : a >= 1e8 ? "max-md:text-sm" : "";
};

/** A click on a control inside a row (a figure's sheet, a link, a label) is that control's, not a pick (founder, 2026-10-27). */
const inControl = (target: EventTarget, row: HTMLElement) => {
  // a fold under a row (a house's group prices, 2026-11-04): its line opens it and a tap on what it shows is reading, not a pick
  const hit = (target as Element).closest?.("a, button, input, select, textarea, summary, details, [role=button], [role=link]");
  return !!hit && hit !== row && row.contains(hit);
};

// A pick made outside the list (a name in a "not priced" line under it) that brings a row into the list: that row takes the place on the
// screen of what was tapped. One pending hold for the page; the list that has the row takes it.
let pending: Hold | null = null;

/**
 * A tapped row is held where it was for a moment, over every render in it, not only the first: a pick renders more than once (a note
 * on the row before the address changes, the sorted lists after it), and the first render used the hold up while the rows moved on the
 * next (#190: a row that moved the other half landed 1,400 px off screen). The person's own scroll ends the hold.
 */
const HOLD_MS = 1200;
interface Hold { key: string; top: number; until: number }
const holdOf = (key: string, el: HTMLElement): Hold => ({ key, top: el.getBoundingClientRect().top, until: performance.now() + HOLD_MS });

/** Call before a pick made outside the list (or by a control inside a row): the list row `key` will appear where `el` is now. */
export function holdOnPick(key: string, el: HTMLElement) {
  pending = holdOf(key, el);
}

export function PickList({ label, columns, phoneColumns, head, rows, phoneLimit, more, states }: { label: string; columns: string; phoneColumns?: string; head?: ReactNode; rows: PickRow[]; phoneLimit?: number; more?: (hidden: number) => string; states?: Record<string, string>[] }) {
  const [open, setOpen] = useState(false);
  // a pick re-prices what is above the list (founder, 2026-10-27: "the whole page jumps up and down"): keep the tapped row where it
  // was on the screen, wherever the list now puts it
  const anchor = useRef<Hold | null>(null);
  // when the order changes the rows slide to their new places, and the tapped row is the one that stands still
  const root = useFlip<HTMLDivElement>(rows.map((r) => r.key).join(), () => anchor.current?.key ?? pending?.key);
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
    anchor.current = holdOf(r.key, el);
    r.onSelect();
  };
  const grid = { "--pick-cols": columns, "--pick-cols-phone": phoneColumns ?? columns } as CSSProperties;
  const cellsClass = "grid gap-x-3 gap-y-1 items-center";
  const rowClass = "text-start px-4 py-2.5 border-b border-border last:border-b-0 min-h-target cursor-pointer hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring";
  const radio = (r: PickRow) => <span aria-hidden="true" className={cx("size-4 rounded-full border-[1.5px] self-start mt-1", r.selected ? "border-[5px] border-primary" : "border-input")} />;
  const gridClass = "grid-cols-[1.25rem_var(--pick-cols-phone)] md:grid-cols-[1.25rem_var(--pick-cols)]";
  const folds = !open && phoneLimit !== undefined && rows.length > phoneLimit + 1;
  // the rows the fold shows: the first N, the chosen one among them (further down, it takes the last place, so the count never changes);
  // a row that opens a group stays, so a group's heading is never hidden behind the fold, and the person's own rows stay
  const shownInFold = new Set<number>();
  if (folds) {
    const sel = rows.findIndex((r) => r.selected);
    const counted = (r: PickRow) => !r.keep && !(r.heading && !r.selected);
    let left = phoneLimit!;
    rows.forEach((r, i) => {
      if (r.keep || r.selected) {
        shownInFold.add(i);
        if (counted(r)) left--;
        return;
      }
      const reserve = sel > i && counted(rows[sel]!) ? 1 : 0;
      if (left - reserve > 0) {
        shownInFold.add(i);
        left--;
      } else if (r.heading) shownInFold.add(i);
    });
  }
  const folded = (i: number) => folds && !shownInFold.has(i);
  const hidden = rows.filter((_, i) => folded(i)).length;
  // the folded rows and the rows' other states are laid out unseen, out of the flow, and measured (a row's height depends on its words at
  // this width): the list holds the height of its tallest state, and the fold the height of its tallest rows
  useLayoutEffect(() => {
    const list = root.current;
    if (!list) return;
    const fit = () => {
      list.style.minHeight = "";
      const h = (el: Element) => el.getBoundingClientRect().height;
      const rowEls = [...list.querySelectorAll<HTMLElement>(":scope > [data-pick-key]")];
      const inFlow = rowEls.filter((el) => el.dataset.folded === undefined || window.matchMedia("(min-width: 48rem)").matches);
      const now = inFlow.reduce((a, el) => a + h(el), 0);
      let most = now;
      if (folds && !window.matchMedia("(min-width: 48rem)").matches) {
        const free = rowEls.filter((el) => el.dataset.keep === undefined);
        const shown = free.filter((el) => el.dataset.folded === undefined);
        const can = free.filter((el) => el.dataset.cannot === undefined || el.dataset.folded === undefined);
        const tallest = can.map(h).sort((a, b) => b - a).slice(0, shown.length).reduce((a, x) => a + x, 0);
        most = Math.max(most, now - shown.reduce((a, el) => a + h(el), 0) + tallest);
      }
      if (states?.length) {
        const caseH = new Map<string, number>();
        for (const el of list.querySelectorAll<HTMLElement>(":scope > [data-case-of]")) caseH.set(`${el.dataset.caseOf}\u0000${el.dataset.case}`, h(el));
        for (const st of states) {
          let t = 0;
          for (const el of inFlow) {
            const k = el.dataset.pickKey!;
            const want = st[k];
            t += want === undefined || want === el.dataset.caseKey ? h(el) : caseH.get(`${k}\u0000${want}`) ?? h(el);
          }
          most = Math.max(most, t);
        }
      }
      if (most - now > 0.5) list.style.minHeight = `${h(list) + most - now}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  });
  return (
    <div ref={root} role="radiogroup" aria-label={label} className="relative flex flex-col [overflow-anchor:none]">
      {head && (
        <div className={cx("grid gap-x-3 items-end px-4 pb-1.5 text-xs text-muted-foreground border-b border-border", gridClass)} style={grid}>
          <span />
          {head}
        </div>
      )}
      {rows.map((r, i) => (
        // a div, not a button: a row holds controls of its own (a fund's number to Maya, a figure's sheet), and a click on one is not a pick
        <Fragment key={r.key}>
        {r.heading && <div className={cx("px-4 py-2 bg-popover border-b border-border text-sm font-semibold", folded(i) && "max-md:hidden")}>{r.heading}</div>}
        {/* the row's other states, unseen and out of the flow: measured, never shown; before the row, so the last row is the list's last child */}
        {r.cases?.map((x) => (
          <div key={x.key} aria-hidden="true" data-case-of={r.key} data-case={x.key} className={cx(rowClass, cellsClass, gridClass, "absolute inset-x-0 top-0 invisible pointer-events-none")} style={grid}>
            <Unseen>
              {radio(r)}
              {x.cells}
            </Unseen>
          </div>
        ))}
        <div
          role="radio"
          aria-checked={r.selected}
          data-pick-key={r.key}
          data-flip={r.key}
          {...(folded(i) ? { "data-folded": "" } : {})}
          {...(r.keep ? { "data-keep": "" } : {})}
          {...(r.canShow === false ? { "data-cannot": "" } : {})}
          {...(r.caseKey !== undefined ? { "data-case-key": r.caseKey } : {})}
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
            cellsClass,
            gridClass,
            // a folded row is laid out unseen and out of the flow, so its height can be read (the fold holds its tallest rows)
            folded(i) && "max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:invisible",
            r.selected && "bg-primary/10 shadow-[inset_-3px_0_0_var(--primary)] hover:bg-primary/10",
            r.muted && !r.selected && "text-muted-foreground",
          )}
          style={grid}
        >
          {radio(r)}
          {r.cells}
        </div>
        </Fragment>
      ))}
      {hidden > 0 && more && (
        <button type="button" onClick={() => setOpen(true)} className="md:hidden text-link text-sm font-medium min-h-target px-4 text-start hover:underline">
          {more(hidden)}
        </button>
      )}
    </div>
  );
}
