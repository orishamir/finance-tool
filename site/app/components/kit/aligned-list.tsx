// A list of a thing's fields, one line each, whose labels share one narrow column and whose boxes start at one edge after it, so the eye
// runs down the labels and down the boxes (the fee page's panel: how much, the minimum, how long the price holds). A line across both
// columns, from the labels' edge, carries what belongs to no one label: a later price's head, a note, an action.
import type { ReactNode } from "react";
import { cx } from "./cx";

/** The list: its lines (`AlignedRow`, `AlignedAcross`) as its children, in order. */
export function AlignedList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2", className)}>{children}</div>;
}

/**
 * One line: its label in the narrow column, its boxes and their caption from the shared edge after it, wrapping onto more lines where the
 * column is narrow. `top`: the label stands by the first line of boxes, not the middle of them (boxes that wrap on a phone).
 */
export function AlignedRow({ label, top, children }: { label: ReactNode; top?: boolean; children: ReactNode }) {
  return (
    <>
      <span className={cx("text-sm text-muted-foreground", top && "flex min-h-target items-center self-start")}>{label}</span>
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">{children}</span>
    </>
  );
}

/** A line across both columns, from the labels' edge. */
export function AlignedAcross({ children }: { children: ReactNode }) {
  return <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1">{children}</div>;
}

/** A caption beside a line's boxes (what a figure is per, a note), in the muted ink. */
export function AlignedCaption({ children }: { children: ReactNode }) {
  return <span className="text-sm text-muted-foreground">{children}</span>;
}
