// A native <dialog>: a bottom sheet below lg (grab handle, overlay, slides up), and at lg either a card
// beside its anchor (provenance, rule and term cards) or a centred dialog (design-system 3.9, spec 3). One is shown at a time: a sheet
// opened from inside another takes its place, with a back arrow to it; the focus goes back to what opened a sheet when it closes
// (sheet-stack.ts). It is a modal dialog, so Escape on a computer and the phone's Back reach it as the browser's close request, with no
// history entry of its own; its owner's state follows the dialog's own close. A page the router opens from inside it (a link, a search)
// leaves it closed. Its first thing to act on, marked `data-autofocus`, takes the focus as it opens.
import { createContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLocation } from "react-router";
import { site } from "../copy";
import { IconArrowBack, IconChevronDown, IconClose } from "./icons";
import { Button, cx } from "./ui";
import { cssMs } from "./kit/chart-glide-math";
import { MQ, useIsoLayoutEffect, useMedia } from "../lib/hooks";
import { FailureNotice } from "./failure-notice";
import { closeUnder, coversOther, dropSheet, isCovered, pushSheet, watchSheets, type StackedSheet } from "./sheet-stack";

/**
 * What a page says around its figures (provenance.tsx): that the page is about one company, whose own figures carry no "לפי החברה"
 * (`OwnCompanyPage`), which holds in every sheet opened on it, since each figure is judged by the document it rests on; and that a notice
 * above already says the figures are old (`StaleSaid`), which no sheet inherits, since a sheet's figures stand without that notice.
 */
export const OwnCompanyCtx = createContext(false);
export const StaleSaidCtx = createContext(false);

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Element the sheet opened from: on PC the card sits beside it; focus returns to it on close where nothing had the focus as it opened (a tap on a phone gives none). */
  anchor?: HTMLElement | null;
  pc?: "popover" | "center";
  /** As a share of the screen height on a phone. */
  height?: 70 | 78 | 80 | 100;
  /** How much of a computer's window a popover card may take: `roomy`, wider and taller than a `card`, for a figure's calculation. */
  size?: "card" | "roomy";
  labelledBy?: string;
  describedBy?: string;
  onBack?: () => void;
  /**
   * What the sheet shows, where one open sheet shows one thing after another (the provenance sheet's drill-in and back, a list whose pick
   * opens what was picked in its place): a new value starts at the top too (a figure opened from inside a sheet opened at the scroll of the
   * one before, its head hidden), and where the focus was in what went, it goes to the new view's `data-autofocus`, else to the sheet's
   * first control.
   */
  view?: string | number;
  /** Where the focus goes as the sheet closes when what opened it has left the page meanwhile (a row deleted from inside the sheet). */
  focusAfter?: () => HTMLElement | null;
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


/** The share of the window's height a popover card may take, by its size. */
const POPOVER_SHARE: Record<NonNullable<SheetProps["size"]>, number> = { card: 0.6, roomy: 0.85 };

export function Sheet({ open, onClose, anchor, pc = "popover", height = 70, size = "card", labelledBy, describedBy, onBack, view, focusAfter, children, className }: SheetProps) {
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
  // this sheet in the stack of open sheets while it is open: hidden while another covers it, and a back arrow while it covers one
  const stacked = useRef<StackedSheet | null>(null);
  // the latest `onClose` and `open`, for the stack and the dialog's events, which come after a render has been drawn
  const onCloseNow = useRef(onClose);
  const openNow = useRef(open);
  const focusAfterNow = useRef(focusAfter);
  useIsoLayoutEffect(() => {
    onCloseNow.current = onClose;
    openNow.current = open;
    focusAfterNow.current = focusAfter;
  });
  // the sheet closes its dialog itself (once it has left, or while another covers it): the close event that follows is its own
  const ownClose = useRef(false);
  // a close request the page may not refuse (no press since the last one): its cancel is answered, and the close that follows is the same request
  const closeFollows = useRef(false);
  const covered = useSyncExternalStore(watchSheets, () => isCovered(stacked.current), () => false);
  const covers = useSyncExternalStore(watchSheets, () => coversOther(stacked.current), () => false);
  // the body's scroll while another sheet covers this one: a hidden dialog may lose it, and the focus coming back may move it
  const coveredAt = useRef(0);
  const { pathname } = useLocation();
  const openedOn = useRef<string | null>(null);

  // the sheet's closing is over (played out, or cut short by the browser closing its dialog): it leaves the stack, and the sheet it covered
  // comes back
  function left() {
    if (closing.current) window.clearTimeout(closing.current);
    closing.current = null;
    ref.current?.removeAttribute("data-closing");
    const s = stacked.current;
    stacked.current = null;
    if (s) dropSheet(s);
    leftSheet((n) => n + 1);
  }

  useIsoLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      // every opening starts at the top: the body kept the last sheet's scroll, and a second sheet opened at the first one's end; a new view
      // in an open sheet takes the focus where what had it went with the view before
      if ((!wasOpen.current || lastView.current !== view) && body.current) body.current.scrollTop = 0;
      if (wasOpen.current && lastView.current !== view && dialog.open && !dialog.contains(document.activeElement)) {
        (dialog.querySelector<HTMLElement>("[data-autofocus]") ?? dialog.querySelector<HTMLElement>(".sheet-body button, .sheet-body a[href], .sheet-body input"))?.focus({ preventScroll: true });
      }
      if (closing.current) {
        window.clearTimeout(closing.current);
        closing.current = null;
        dialog.removeAttribute("data-closing");
      }
      if (!stacked.current) {
        const active = document.activeElement;
        stacked.current = {
          dialog,
          close: () => onCloseNow.current(),
          opener: active instanceof HTMLElement && active !== document.body ? active : (anchor ?? null),
          focusAfter: () => focusAfterNow.current?.() ?? null,
          onCover: () => {
            coveredAt.current = body.current?.scrollTop ?? 0;
            ownClose.current = true;
          },
          onUncover: () => {
            if (body.current) body.current.scrollTop = coveredAt.current;
          },
        };
        pushSheet(stacked.current);
      }
      if (!covered && !dialog.open) {
        dialog.showModal();
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }
      place(dialog, anchor ?? null, pc, wide, POPOVER_SHARE[size]);
    } else if (stacked.current) {
      const s = stacked.current;
      if (!dialog.open) {
        // hidden under another sheet, or closed by the browser: it leaves at once
        stacked.current = null;
        dropSheet(s);
      } else if (!closing.current) {
        dialog.setAttribute("data-closing", "");
        const ms = cssMs(getComputedStyle(document.documentElement).getPropertyValue("--duration-base"));
        closing.current = window.setTimeout(() => {
          if (dialog.open) {
            ownClose.current = true;
            dialog.close();
          }
          left();
        }, ms);
      }
    }
    wasOpen.current = open;
    lastView.current = view;
  }, [open, anchor, pc, view, wide, covered, size]);

  // a sheet that leaves the page while open leaves the stack too
  useEffect(
    () => () => {
      if (closing.current) window.clearTimeout(closing.current);
      closing.current = null;
      if (stacked.current) dropSheet(stacked.current);
      stacked.current = null;
    },
    [],
  );

  // a page the router opens while the sheet is open (a link in it, a search's Enter) has the sheet closed
  useEffect(() => {
    if (!open) {
      openedOn.current = null;
      return;
    }
    if (openedOn.current === null) openedOn.current = pathname;
    else if (openedOn.current !== pathname) onCloseNow.current();
  }, [open, pathname]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => ref.current && place(ref.current, anchor ?? null, pc, wide, POPOVER_SHARE[size]);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, anchor, pc, wide, size]);

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
  // its own way back (a drill-in's), else, over another sheet, back to that one
  const back = onBack ?? (covers ? onClose : undefined);

  return (
    <dialog
      ref={ref}
      className={cx("sheet", className)}
      data-pc={pc}
      data-size={size}
      style={{ "--sheet-height": `${height}vh` } as React.CSSProperties}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // a sheet opened from inside this one (a card from a deal's popup) is its child in React's tree, though drawn apart: its cancel and
      // close events reach these handlers too, and are its own, not this sheet's
      onCancel={(e) => {
        if (e.target !== e.currentTarget) return;
        // the close request (Escape, the phone's Back) plays the sheet's closing; one that comes while it is leaving is for the sheet under it
        e.preventDefault();
        closeFollows.current = !e.cancelable;
        if (openNow.current) onClose();
        else if (stacked.current) closeUnder(stacked.current);
      }}
      onClose={(e) => {
        if (e.target !== e.currentTarget) return;
        if (closeFollows.current && closing.current) {
          // the browser closed the leaving sheet itself, after a close request the page could not refuse: nothing of it shows, so it
          // leaves at once and the sheet under it comes back now, not when its closing would have played out
          closeFollows.current = false;
          left();
          return;
        }
        if (ownClose.current || closeFollows.current) {
          ownClose.current = false;
          closeFollows.current = false;
          return;
        }
        // the browser closed it without a cancel it lets the page refuse (a close request with no press since the last): the owner follows
        if (openNow.current) onClose();
        else if (stacked.current) closeUnder(stacked.current);
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
      {/* what a carry inside the sheet scrolls near its top or foot (kit/lift.tsx, `scrollerOf`) */}
      <div className="sheet-body" data-carry-scroll="" ref={body}>
        {/* floats in the top corner beside the first line, and stays there while the body scrolls (it had a row
            of its own above the content) */}
        <div className="sheet-head" data-back={back ? "" : undefined}>
          {back ? (
            <Button variant="icon" size="sm" onClick={back} aria-label={site.back} className="bg-popover/90">
              <IconArrowBack size={20} />
            </Button>
          ) : (
            <span />
          )}
          <Button variant="icon" size="sm" onClick={onClose} aria-label={site.close} className="bg-popover/90">
            <IconClose size={20} />
          </Button>
        </div>
        <StaleSaidCtx.Provider value={false}>{open || !ref.current?.open ? children : kept.current}</StaleSaidCtx.Provider>
      </div>
      {open && !covered && <FailureNotice where="sheet" />}
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
 * it does not fit there and the room above is larger. The card's max-height is capped to that room, which starts under the site's header,
 * and to `share` of the window's height: the card never covers the header nor its anchor. Where neither side has room for a few lines (a
 * window only a few hundred pixels tall), the page first scrolls the anchor up to just under the header, so the card opens below it. */
function place(dialog: HTMLDialogElement, anchor: HTMLElement | null, pc: "popover" | "center", isPc: boolean, share: number) {
  dialog.style.top = "";
  dialog.style.left = "";
  dialog.style.maxHeight = "";
  if (!isPc || pc !== "popover" || !anchor) return;
  const w = dialog.offsetWidth;
  const natural = dialog.offsetHeight;
  const gap = 8;
  const fewLines = 120;
  const ceiling = Math.max(0, document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom ?? 0);
  // an anchor with no box (inside a sheet this card covers, which has closed as a dialog under it): the card stands in the window's middle
  if (!anchor.getClientRects().length) {
    const h = Math.min(natural, window.innerHeight * share);
    dialog.style.maxHeight = `${window.innerHeight * share}px`;
    dialog.style.top = `${Math.max(ceiling + gap, (window.innerHeight - h) / 2)}px`;
    dialog.style.left = `${Math.max(gap, (window.innerWidth - w) / 2)}px`;
    return;
  }
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
  dialog.style.maxHeight = `${Math.min(room, window.innerHeight * share)}px`;
  let left = r.right - w;
  left = Math.max(gap, Math.min(left, window.innerWidth - w - gap));
  const top = below ? r.bottom + gap : r.top - gap - Math.min(h, window.innerHeight * share);
  dialog.style.top = `${Math.max(ceiling + gap, top)}px`;
  dialog.style.left = `${left}px`;
}
