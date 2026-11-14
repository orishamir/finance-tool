// What every list dropped from a button shares (`MenuPicker`'s list, `InlineSelect`'s): the panel's look, a row's look, which side of the
// button the list opens on and how much room it has there, and the press outside that closes it.
import { useEffect, type RefObject } from "react";

/** The panel: the popover's surface with the quiet edge, rounded as a card, 4 px around its rows. */
export const DROP_PANEL = "flex w-max max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 text-base font-normal leading-normal text-popover-foreground shadow-md";

/** A row: 44 px tall, its words from the start. How it is lit is the list's: under the pointer, or where the keys put the light. */
export const DROP_ROW = "flex flex-1 min-w-0 items-center gap-2 min-h-target rounded-md px-3 text-start";

/** Room under and over the button, 8 px kept from each edge. */
const EDGE = 8;
/** The least height a list that scrolls inside is given, so a few rows always show. */
const LEAST = 120;

/**
 * Which side of the button a list of height `h` opens on, between `top` and `bottom` (the window's, cut by any box around the button that
 * clips), and the height it is held to: under the button where it fits, over it where it fits there and not under, else on the larger side
 * with its own scroll (`room`, at least `LEAST`); `room` is null where the whole list fits.
 */
export function dropRoom(button: { top: number; bottom: number }, h: number, top: number, bottom: number): { up: boolean; room: number | null } {
  const below = bottom - button.bottom - EDGE;
  const above = button.top - top - EDGE;
  const up = below < h && above > below;
  const side = up ? above : below;
  return { up, room: h > side ? Math.max(side, LEAST) : null };
}

/** While `open`, a press outside every element of `inside` calls `onAway`; the focus stays where the press put it. */
export function usePressAway(open: boolean, inside: readonly RefObject<HTMLElement | null>[], onAway: () => void) {
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!inside.some((r) => r.current?.contains(e.target as Node))) onAway();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}
