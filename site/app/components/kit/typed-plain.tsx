// Figures the person typed, read as plain words in a block that sums up what they typed in boxes elsewhere on the screen (the fee page's
// glance and its reading): the boxes carry the blue of an entered figure, so the block beside them leaves it out and stays quiet.
import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * Inside it an entered figure (`Num` in the `entered` state) has no blue ink or highlight: it reads as the words around it, and still opens
 * its sheet on a tap, which says the person entered it. A computed figure keeps its dotted line and a sourced one its solid line. `as`: a
 * `div` (the default) or a `span` inside a line.
 */
export function TypedPlain({ children, as = "div", className }: { children: ReactNode; as?: "div" | "span"; className?: string }) {
  const As = as;
  return <As className={cx("nums-typed-plain", className)}>{children}</As>;
}
