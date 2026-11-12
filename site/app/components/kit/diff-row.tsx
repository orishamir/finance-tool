// A row of single changes (the indices page's stairs): what changes, what is left after it, and a bar from "as it is now"
// that goes right and green for more money left, left and red for less, with the difference in words and figures ("עוד 4,875 ₪",
// "פחות 1,524 ₪", "אותו סכום"). One unit for all the rows on screen; a longer bar is cut with a mark and its figure gives the full size.
// Tapping a row takes it, so the row is a box with a button stretched over it and its figures above the button: a figure opens its own
// sheet, the rest of the row takes the step (a button cannot hold a figure, which is a button).
import type { ReactNode } from "react";
import { cx } from "./cx";

/** Columns on a computer and on a phone: the same on every row, so a figure with another digit moves nothing (nothing moves when a number
 *  changes). On a phone the difference's word stands over its figure (`DiffFigure`), so its column holds "15,288 ₪" and more: side by side
 *  in 6rem, "פחות 15,288 ₪" ran past the card at 320 px (2026-11-12). The name and the bar share what is left, so the name keeps room for
 *  its value under it ("82,574 ₪") and the bar's head its two words. */
const COLS = "grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_5rem] md:grid-cols-[minmax(0,1.5fr)_5.5rem_minmax(0,1fr)_8rem]";

/** Where the bar's end lies: a share of the half width, at most the whole half; `cut` when the real size is longer. */
export function barShare(d: number, unit: number): { share: number; cut: boolean } {
  const raw = (Math.abs(d) / Math.max(unit, 1)) * 100;
  return { share: Math.min(raw, 100), cut: raw > 100 };
}

/** The bar of a row: its middle line is "as it is now"; money more goes right in green, money less goes left in red; an open rule is hollow. */
export function DiffBar({ d, unit, open }: { d: number; unit: number; open?: boolean }) {
  const zero = Math.round(d) === 0;
  const { share, cut } = barShare(d, unit);
  const up = d > 0;
  const tone = up ? "bg-gain" : "bg-loss";
  const ring = up ? "border-gain" : "border-loss";
  return (
    <span aria-hidden="true" className="relative block flex-1 self-stretch min-h-[14px] [direction:ltr]">
      <i className="absolute inset-y-0 left-1/2 w-[1.5px] -ml-[0.75px] bg-chart-marker" />
      {!zero && <i className={cx("absolute top-[calc(50%-6px)] h-3 min-w-[2px] rounded-[3px] box-border", up ? "left-1/2" : "right-1/2", open ? cx("border-[1.5px] bg-transparent", ring) : tone)} style={{ width: `${share / 2}%` }} />}
      {!zero && cut && <i className={cx("absolute top-[calc(50%-8px)] h-4 w-[3px] bg-card -skew-x-[20deg]", up ? "right-[5px]" : "left-[5px]")} />}
    </span>
  );
}

/** The bar column's heading: "less money" to the left of the middle line, "more money" to the right. "money" drops on a phone. */
function BarHead({ less, more, money }: { less: string; more: string; money: string }) {
  return (
    <span className="relative block h-5 [direction:ltr] text-[13px]">
      <i className="absolute inset-y-0 left-1/2 w-[1.5px] -ml-[0.75px] bg-chart-marker" />
      <span className="absolute top-0 right-1/2 pr-1.5 whitespace-nowrap [direction:rtl]">
        {less}
        <span className="max-md:hidden"> {money}</span>
      </span>
      <span className="absolute top-0 left-1/2 pl-1.5 whitespace-nowrap [direction:rtl]">
        {more}
        <span className="max-md:hidden"> {money}</span>
      </span>
    </span>
  );
}

export function DiffHead({ name, left, versus, less, more, money }: { name: string; left: string; versus: string; less: string; more: string; money: string }) {
  return (
    <div className={cx("grid items-center gap-x-2.5 min-h-[26px] px-1.5 text-[13px] text-muted-foreground", COLS)}>
      <span>{name}</span>
      <span className="max-md:hidden text-end">{left}</span>
      <BarHead less={less} more={more} money={money} />
      <span className="max-md:col-start-3">{versus}</span>
    </div>
  );
}

/** "עוד 4,875 ₪", "פחות 1,524 ₪" or "אותו סכום": the figure (a `Num` of the size, no sign) after a word of fixed width; on a phone the
 *  word stands over the figure, in the row's two lines. */
export function DiffFigure({ d, words, figure }: { d: number; words: { more: string; fewer: string; same: string }; figure: ReactNode }) {
  if (Math.round(d) === 0) return <span className="text-muted-foreground">{words.same}</span>;
  return (
    <span className={cx("flex items-baseline gap-1.5 whitespace-nowrap tabular-nums font-medium max-md:flex-col max-md:items-start max-md:gap-0", d < 0 && "text-muted-foreground font-normal")}>
      <span className="w-9 flex-none max-md:w-auto max-md:text-xs">{d < 0 ? words.fewer : words.more}</span>
      {/* a size down on a phone from six digits, so a typed plan's larger differences stay in the column */}
      <span className={cx(Math.abs(d) >= 1e5 && "max-md:text-xs")}>{figure}</span>
    </span>
  );
}

export interface DiffRowProps {
  /** The name of what it changes to, whole; the caller adds a lock, a chip or a fund's name under it as `sub`. */
  name: ReactNode;
  sub?: ReactNode;
  /** The value left after the change (a `Num`). */
  left: ReactNode;
  d: number;
  unit: number;
  open: boolean;
  /** The difference in words and figures (`DiffFigure`). */
  diff: ReactNode;
  /** The first row that leaves less than now: a thicker line above it, where the gains end. */
  turn?: boolean;
  /** What the stretched button says. */
  label: string;
  onTake: () => void;
  /** The small mark of the kind of change, on the row's own line (the lane's swatch and word, when one list holds the three lanes). */
  kind?: ReactNode;
}

export function DiffRow({ name, sub, left, d, unit, open, diff, turn, label, onTake, kind }: DiffRowProps) {
  return (
    <div className={cx("group relative grid items-center gap-x-2.5 min-h-[44px] md:min-h-9 px-1.5 py-0.5 text-sm hover:bg-accent", turn ? "border-t-2 border-chart-axis" : "border-t border-border", COLS)}>
      <button type="button" aria-label={label} onClick={onTake} className="absolute inset-0 w-full cursor-pointer rounded-none" />
      <span className="pointer-events-none relative z-10 flex min-w-0 flex-col max-md:col-start-1 max-md:row-start-1 [&_.num]:pointer-events-auto">
        {kind}
        <span className="font-medium [overflow-wrap:anywhere]">{name}</span>
        {sub}
      </span>
      <span className={cx("pointer-events-none relative z-10 text-end whitespace-nowrap tabular-nums [&_.num]:pointer-events-auto max-md:col-start-1 max-md:row-start-2 max-md:text-start max-md:text-xs max-md:text-muted-foreground", d < 0 && "md:text-muted-foreground")}>{left}</span>
      <span className="pointer-events-none relative z-10 self-stretch flex max-md:col-start-2 max-md:row-start-1 max-md:row-span-2">
        <DiffBar d={d} unit={unit} open={open} />
      </span>
      <span className="pointer-events-none relative z-10 text-sm max-md:col-start-3 max-md:row-start-1 max-md:row-span-2 [&_.num]:pointer-events-auto">{diff}</span>
    </div>
  );
}

/** The grey lines under a list: the choices with no price, grouped by why. `why` may be a tappable word (a `Term`) that opens the reasons. */
export function GreyLine({ why, children }: { why: ReactNode; children: ReactNode }) {
  return (
    <p className="border-t border-border px-1.5 py-1.5 text-xs leading-normal text-muted-foreground">
      {/* a tappable reason wraps like the words around it: a term keeps itself on one line elsewhere, and a reason that names a fund
          ("⁨אי.בי.אי. סל (4D) MSCI AC World⁩ לא נמכרת שם") made the whole list wider than a 320 px screen (2026-11-12) */}
      <b className="font-medium [&_.term]:whitespace-normal">{why}:</b> {children}
    </p>
  );
}
