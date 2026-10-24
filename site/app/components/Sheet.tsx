// A native <dialog>: a bottom sheet below lg (grab handle, overlay, slides up), and at lg either a card
// beside its anchor (provenance, rule and term cards) or a centred dialog (design-system 3.9, spec 3).
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { site } from "../copy";
import { IconArrowBack, IconClose } from "./icons";
import { Button, cx } from "./ui";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Element the sheet opened from: on PC the card sits beside it; focus returns to it on close. */
  anchor?: HTMLElement | null;
  pc?: "popover" | "center";
  /** As a share of the screen height on a phone. */
  height?: 70 | 78 | 80 | 100;
  labelledBy?: string;
  describedBy?: string;
  onBack?: () => void;
  children: ReactNode;
  className?: string;
}

let locks = 0;
function lockScroll() {
  if (locks++ === 0) document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--locks === 0) document.documentElement.style.overflow = "";
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Sheet({ open, onClose, anchor, pc = "popover", height = 70, labelledBy, describedBy, onBack, children, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (closing.current) {
        window.clearTimeout(closing.current);
        closing.current = null;
        dialog.removeAttribute("data-closing");
      }
      if (!dialog.open) dialog.showModal();
      place(dialog, anchor ?? null, pc);
    } else if (dialog.open && !closing.current) {
      dialog.setAttribute("data-closing", "");
      const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--duration-base")) || 0;
      closing.current = window.setTimeout(() => {
        dialog.removeAttribute("data-closing");
        dialog.close();
        closing.current = null;
      }, ms);
    }
  }, [open, anchor, pc]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => ref.current && place(ref.current, anchor ?? null, pc);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, anchor, pc]);

  // The page behind an open sheet does not scroll (audit 2026-10-24, A99); a count, since sheets can stack.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  // Swipe down on the handle closes the sheet.
  const startY = useRef<number | null>(null);

  return (
    <dialog
      ref={ref}
      className={cx("sheet", className)}
      data-pc={pc}
      style={{ "--sheet-height": `${height}vh` } as React.CSSProperties}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="sheet-handle lg:hidden"
        onPointerDown={(e) => (startY.current = e.clientY)}
        onPointerUp={(e) => {
          if (startY.current !== null && e.clientY - startY.current > 60) onClose();
          startY.current = null;
        }}
      >
        <span />
      </div>
      <div className="sheet-body">
        <div className="sheet-head">
          {onBack ? (
            <Button variant="icon" onClick={onBack} aria-label={site.back} className="-ms-2.5">
              <IconArrowBack />
            </Button>
          ) : (
            <span />
          )}
          <Button variant="icon" onClick={onClose} aria-label={site.close} className="-me-2.5">
            <IconClose />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

/** On PC, puts a popover card beside its anchor (right edges aligned), on the side with more room: below it, unless
 * it does not fit there and the room above is larger. The card's max-height is capped to that room. */
function place(dialog: HTMLDialogElement, anchor: HTMLElement | null, pc: "popover" | "center") {
  const isPc = window.matchMedia("(min-width: 64rem)").matches;
  dialog.style.top = "";
  dialog.style.left = "";
  dialog.style.maxHeight = "";
  if (!isPc || pc !== "popover" || !anchor) return;
  const r = anchor.getBoundingClientRect();
  const w = dialog.offsetWidth;
  const natural = dialog.offsetHeight;
  const gap = 8;
  const roomBelow = window.innerHeight - r.bottom - gap * 2;
  const roomAbove = r.top - gap * 2;
  const below = natural <= roomBelow || roomBelow >= roomAbove;
  const room = Math.max(120, below ? roomBelow : roomAbove);
  const h = Math.min(natural, room);
  dialog.style.maxHeight = `${Math.min(room, window.innerHeight * 0.6)}px`;
  let left = r.right - w;
  left = Math.max(gap, Math.min(left, window.innerWidth - w - gap));
  const top = below ? r.bottom + gap : r.top - gap - Math.min(h, window.innerHeight * 0.6);
  dialog.style.top = `${Math.max(gap, top)}px`;
  dialog.style.left = `${left}px`;
}
