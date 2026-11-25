// The editor's columns for entering the deal (method §10.6), in their reading order, so the Tab key reads them as the eye does: a card with
// what the deal is about where the host shows one (all of it, in full, while the deal has no kind), its fees' cards under it, and, where the
// editor's host gives it the room, the chosen fee's toolbox in a column of its own (28rem), the card taking the rest; narrower, the toolbox
// stands under its fee in the card, and a phone stacks them. The columns follow the editor's own width (a container), never the window's,
// so the fee page and a popup lay them out alike for the room each has. Each has its own place in the grid whatever the deal holds, so the
// first fee, and the toolbox coming with it, move nothing. A figure the person typed shows in the entered ink, with no highlight behind it.
import { useRef, type ReactNode, type RefObject } from "react";
import { Card, cx, useReadOnly, useStickyColumn } from "../kit";

/**
 * The toolbox's column sticks under the header as the fees scroll by, where it has a column (the editor's width, `TOOLBOX_COLUMN_PX`): 5rem
 * under the top, or under what a host keeps at its top (`--toolbox-top`, the indices page's popup's head and tiles), until
 * `useStickyColumn` places it.
 */
export const TOOLBOX_STICKY = "@min-[75rem]/deal:sticky @min-[75rem]/deal:top-(--toolbox-top,5rem)";

/**
 * The fees the deal can still take, in the toolbox's column while no fee is open there: it sticks and scrolls inside itself as the open
 * fee's toolbox does (`useStickyColumn`), so its top stays under what the page or the popup keeps at its top however far the fees scroll.
 */
export function PaletteColumn({ children }: { children: ReactNode }) {
  const column = useRef<HTMLElement>(null);
  useStickyColumn(column, true);
  return (
    <Card ref={column} className={cx(TOOLBOX_STICKY, "scrollbar-none")}>
      {children}
    </Card>
  );
}

/** The columns: `setup` (what the deal is about; none where the host shows none), `fees` (none while the deal has no kind), and `toolbox` in its own column (none where it has no room). */
export function DealColumns({ hostRef, setup, fees, toolbox }: { hostRef?: RefObject<HTMLDivElement | null>; setup: ReactNode | null; fees: ReactNode | null; toolbox: ReactNode | null }) {
  // read-only (the kit's `ReadOnly`) there is never a toolbox: the fees take the whole width
  const still = useReadOnly();
  return (
    <div ref={hostRef} className="@container/deal">
      <div className={cx("grid grid-cols-1 items-start gap-4", !still && "@min-[75rem]/deal:grid-cols-[minmax(0,1fr)_28rem]")}>
        <div className="flex flex-col gap-6 @min-[75rem]/deal:col-start-1 @min-[75rem]/deal:row-start-1">
          {/* once the deal has a kind (it has fees), what it is about is a strip of two lines, in a low card */}
          {setup && <Card pad={fees ? "strip" : "default"}>{setup}</Card>}
          {/* the fees' cards stand on the page, not in a card of the same surface; while something is carried they keep their height
              (`data-carry-hold`, kit/lift.tsx): what a drop would leave draws inside */}
          {fees && <div data-carry-hold="">{fees}</div>}
        </div>
        {toolbox}
      </div>
    </div>
  );
}
