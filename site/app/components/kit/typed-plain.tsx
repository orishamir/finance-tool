// Figures the person typed, read as plain words in a block that sums up what they typed in boxes elsewhere on the screen (the fee page's
// glance and its reading): the boxes carry the blue of an entered figure, so the block beside them leaves it out and stays quiet.
import type { ReactNode } from "react";
import { TypedPlainCtx } from "../provenance";
import { cx } from "./cx";

/**
 * Inside it an entered figure (`Num` in the `entered` state) is plain words: no blue ink or highlight, no sheet and no stop of the Tab key,
 * since its sheet would only say the person typed it, in the box beside the block. A computed figure keeps its dotted line and a sourced
 * one its solid line, each still opening its sheet. `as`: a `div` (the default) or a `span` inside a line.
 */
export function TypedPlain({ children, as = "div", className }: { children: ReactNode; as?: "div" | "span"; className?: string }) {
  const As = as;
  return (
    <TypedPlainCtx.Provider value={true}>
      <As className={cx("nums-typed-plain", className)}>{children}</As>
    </TypedPlainCtx.Provider>
  );
}
