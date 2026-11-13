// The line a change that lost something leaves where it happened (a fee taken away, a fee filled from a price list, a stage taken away):
// what happened, and "ביטול", which puts the deal back as it was (lib/fee-deal/undo.ts). It takes the focus when it appears for the change
// just made (`take`), brought into view, not when it is drawn again for one made before (a panel opened again on its fee). Its time to
// go stops while the focus is in it or the pointer is over it (`onHold`); when it goes while it holds the focus, the focus moves to what
// took its place (`refocus`), never to the page's body.
import { useRef, type ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { Button, Card, cx } from "../kit";
import { bringIntoView } from "./in-view";

export function UndoLine({ children, onUndo, onHold, take, refocus, refocusOnUndo, height, as = "li", className }: {
  /** What happened, in words. */
  children: ReactNode;
  onUndo: () => void;
  /** Whether the focus is in the line or the pointer over it. */
  onHold: (held: boolean) => void;
  /** Asked once when the line appears: whether its change was just made, so the line takes the focus. */
  take: () => boolean;
  /** Where the focus goes when the line goes while it holds it. */
  refocus: () => HTMLElement | null | undefined;
  /** The focus goes to `refocus` after "ביטול" too (the page gives it nowhere else). */
  refocusOnUndo?: boolean;
  /** The height of what the line stands in for (a card taken away), so nothing under it moves until it goes. */
  height?: number;
  as?: "li" | "div";
  className?: string;
}) {
  const line = useRef<HTMLElement>(null);
  const focus = useRef(false);
  const pointer = useRef(false);
  const undone = useRef(false);
  const latest = useRef({ onHold, refocus, refocusOnUndo });
  latest.current = { onHold, refocus, refocusOnUndo };
  const report = () => latest.current.onHold(focus.current || pointer.current);
  // a layout effect: its cleanup runs before the line leaves the page, while the focus is still in it
  useIsoLayoutEffect(() => {
    const el = line.current;
    // the line just made takes the focus where the reader can see it, above a phone's pinned sheet too
    if (take()) {
      el?.querySelector("button")?.focus({ preventScroll: true });
      bringIntoView(el);
    }
    return () => {
      const l = latest.current;
      const held = !!el && el.contains(document.activeElement);
      l.onHold(false);
      if (held && (!undone.current || l.refocusOnUndo)) requestAnimationFrame(() => l.refocus()?.focus({ preventScroll: true }));
    };
  }, []);
  return (
    <Card
      ref={line}
      as={as}
      pad="tight"
      className={cx("flex flex-wrap items-center gap-x-3 gap-y-1 border-dashed", className)}
      style={height ? { minHeight: height } : undefined}
      onFocus={() => {
        focus.current = true;
        report();
      }}
      onBlur={(e) => {
        if (line.current?.contains(e.relatedTarget as Node | null)) return;
        focus.current = false;
        report();
      }}
      onPointerEnter={() => {
        pointer.current = true;
        report();
      }}
      onPointerLeave={() => {
        pointer.current = false;
        report();
      }}
    >
      <span className="text-sm text-muted-foreground">{children}</span>
      <Button
        variant="quiet"
        flush
        wide
        onClick={() => {
          undone.current = true;
          onUndo();
        }}
      >
        {copy.builder.undo}
      </Button>
    </Card>
  );
}
