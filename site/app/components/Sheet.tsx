// A native <dialog>: a bottom sheet below lg (grab handle, overlay, slides up), and at lg either a card
// beside its anchor (provenance, rule and term cards) or a centred dialog (design-system 3.9, spec 3).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "../copy";
import { IconArrowBack, IconChevronDown, IconClose } from "./icons";
import { Button, cx } from "./ui";
import { cssMs } from "./kit/chart-glide-math";
import { MQ, useIsoLayoutEffect, useMedia } from "../lib/hooks";

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
  /**
   * What the sheet shows, where one open sheet shows one thing after another (the provenance sheet's drill-in and back): a new value starts
   * at the top too (a figure opened from inside a sheet opened at the scroll of the one before, its head hidden).
   */
  view?: string | number;
  children: ReactNode;
  className?: string;
}

/**
 * More of the body lies below what the sheet shows (a gap sheet's third year sat under the edge with nothing
 * saying more followed). A pixel's slack for a fractional scroll position.
 */
export const moreBelow = (el: { scrollHeight: number; scrollTop: number; clientHeight: number }) => el.scrollHeight - el.scrollTop - el.clientHeight > 1;

/** The few parts of an element and of the window the sign reads; a test hands in its own. */
export interface MoreEnv {
  ResizeObserver?: { new (cb: () => void): { observe(el: Element): void; disconnect(): void } };
  MutationObserver?: { new (cb: () => void): { observe(el: Node, o: { childList: boolean; subtree: boolean }): void; disconnect(): void } };
}
type Body = { scrollHeight: number; scrollTop: number; clientHeight: number; children: ArrayLike<Element>; addEventListener(t: "scroll", f: () => void, o?: { passive: boolean }): void; removeEventListener(t: "scroll", f: () => void): void };

/**
 * Keeps the sign that more lies below up to date for as long as the sheet is open: on its scroll, on a change of its size or of any block
 * in it (a fold opening inside the sheet; the sign was measured after renders only), and on blocks added or removed. Returns the
 * cleanup.
 */
export function watchMoreBelow(body: Body, set: (more: boolean) => void, env: MoreEnv = globalThis as MoreEnv): () => void {
  const check = () => set(moreBelow(body));
  body.addEventListener("scroll", check, { passive: true });
  const sizes = env.ResizeObserver ? new env.ResizeObserver(check) : null;
  const observe = () => {
    if (!sizes) return;
    sizes.observe(body as unknown as Element);
    for (const c of Array.from(body.children)) sizes.observe(c);
  };
  observe();
  const blocks = env.MutationObserver ? new env.MutationObserver(() => (observe(), check())) : null;
  blocks?.observe(body as unknown as Node, { childList: true, subtree: true });
  check();
  return () => {
    body.removeEventListener("scroll", check);
    sizes?.disconnect();
    blocks?.disconnect();
  };
}

let locks = 0;
function lockScroll() {
  if (locks++ === 0) document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--locks === 0) document.documentElement.style.overflow = "";
}


export function Sheet({ open, onClose, anchor, pc = "popover", height = 70, labelledBy, describedBy, onBack, view, children, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef<number | null>(null);
  // Many sheets drop their content when they close: what was in it stays until the sheet has finished leaving.
  const kept = useRef(children);
  if (open) kept.current = children;
  const [, leftSheet] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const lastView = useRef(view);
  // a card beside its anchor or a centred dialog from `lg`, a bottom sheet below it
  const wide = useMedia(MQ.lg);

  useIsoLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      // every opening starts at the top: the body kept the last sheet's scroll, and a second sheet opened at the first one's end
      if ((!wasOpen.current || lastView.current !== view) && body.current) body.current.scrollTop = 0;
      if (closing.current) {
        window.clearTimeout(closing.current);
        closing.current = null;
        dialog.removeAttribute("data-closing");
      }
      if (!dialog.open) dialog.showModal();
      place(dialog, anchor ?? null, pc, wide);
    } else if (dialog.open && !closing.current) {
      dialog.setAttribute("data-closing", "");
      const ms = cssMs(getComputedStyle(document.documentElement).getPropertyValue("--duration-base"));
      closing.current = window.setTimeout(() => {
        dialog.removeAttribute("data-closing");
        dialog.close();
        closing.current = null;
        leftSheet((n) => n + 1);
      }, ms);
    }
    wasOpen.current = open;
    lastView.current = view;
  }, [open, anchor, pc, view, wide]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => ref.current && place(ref.current, anchor ?? null, pc, wide);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, anchor, pc, wide]);

  // The page behind an open sheet does not scroll; a count, since sheets can stack.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  // the sign at the bottom edge while more of the body is below it: on scroll, on any change of the body's size or of a block in it, and
  // after every render (the content may have changed)
  const [more, setMore] = useState(false);
  useEffect(() => {
    if (!open || !body.current) return;
    return watchMoreBelow(body.current, setMore);
  }, [open]);
  useEffect(() => {
    if (open && body.current) setMore(moreBelow(body.current));
  });

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
      <div className="sheet-body" ref={body}>
        {/* floats in the top corner beside the first line, and stays there while the body scrolls (it had a row
            of its own above the content) */}
        <div className="sheet-head" data-back={onBack ? "" : undefined}>
          {onBack ? (
            <Button variant="icon" size="sm" onClick={onBack} aria-label={site.back} className="bg-popover/90">
              <IconArrowBack size={20} />
            </Button>
          ) : (
            <span />
          )}
          <Button variant="icon" size="sm" onClick={onClose} aria-label={site.close} className="bg-popover/90">
            <IconClose size={20} />
          </Button>
        </div>
        {open || !ref.current?.open ? children : kept.current}
      </div>
      {/* a strip of its own under the scrolling body, always there at one height: never covers a line, never moves one, empty at the end */}
      <div className="sheet-more" data-more={more ? "" : undefined} aria-hidden="true">
        {/* words with the arrow: a fade alone read as the sheet cut off in a still shot */}
        <span className="sheet-more-cue">
          {site.moreBelow}
          <IconChevronDown size={16} />
        </span>
      </div>
    </dialog>
  );
}

/** On PC (`isPc`, the `lg` width), puts a popover card beside its anchor (right edges aligned), on the side with more room: below it, unless
 * it does not fit there and the room above is larger. The card's max-height is capped to that room, which starts under the site's header:
 * the card never covers the header nor its anchor. Where neither side has room for a few lines (a window only a few hundred pixels tall),
 * the page first scrolls the anchor up to just under the header, so the card opens below it. */
function place(dialog: HTMLDialogElement, anchor: HTMLElement | null, pc: "popover" | "center", isPc: boolean) {
  dialog.style.top = "";
  dialog.style.left = "";
  dialog.style.maxHeight = "";
  if (!isPc || pc !== "popover" || !anchor) return;
  const w = dialog.offsetWidth;
  const natural = dialog.offsetHeight;
  const gap = 8;
  const fewLines = 120;
  const ceiling = Math.max(0, document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom ?? 0);
  let r = anchor.getBoundingClientRect();
  if (Math.max(window.innerHeight - r.bottom, r.top - ceiling) - gap * 2 < fewLines) {
    window.scrollBy({ top: r.top - ceiling - gap, behavior: "instant" });
    r = anchor.getBoundingClientRect();
  }
  const roomBelow = window.innerHeight - r.bottom - gap * 2;
  const roomAbove = r.top - ceiling - gap * 2;
  const below = natural <= roomBelow || roomBelow >= roomAbove;
  const room = Math.max(0, below ? roomBelow : roomAbove);
  const h = Math.min(natural, room);
  dialog.style.maxHeight = `${Math.min(room, window.innerHeight * 0.6)}px`;
  let left = r.right - w;
  left = Math.max(gap, Math.min(left, window.innerWidth - w - gap));
  const top = below ? r.bottom + gap : r.top - gap - Math.min(h, window.innerHeight * 0.6);
  dialog.style.top = `${Math.max(ceiling + gap, top)}px`;
  dialog.style.left = `${left}px`;
}
