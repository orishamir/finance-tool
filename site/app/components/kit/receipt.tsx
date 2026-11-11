// A receipt (the index page's): a sheet of paper with a torn bottom edge, lines of a name and an amount joined by a dotted leader, a line's
// parts indented under it behind a thin edge in its colour, and rules between the blocks: a double one before the total, a dashed one
// before what follows from it. The amounts and their marks are the caller's; the receipt lays them out so they read down one edge. Its
// ticket is the same lines laid across a wide column in three parts, and its stub the same paper torn at the top, pinned to the screen's
// foot while the receipt is out of sight above.
import { useEffect, useState, type ReactNode, type Ref, type RefObject } from "react";
import { IconChevronUp } from "../icons";
import { cx } from "./cx";

export function ReceiptPaper({ children, className, label }: { children: ReactNode; className?: string; /** The paper's spoken name, for a region. */ label?: string }) {
  return (
    // the shadow sits on a wrapper: the torn edge's mask would clip the paper's own
    <div className={cx("drop-shadow-md", className)}>
      <section aria-label={label} className="receipt-edge flex flex-col gap-3 rounded-t-lg bg-popover px-5 pt-5 text-popover-foreground">
        {children}
      </section>
    </div>
  );
}

/**
 * The dotted line from a name to its amount: in a flex row aligned on the baseline (`items-baseline`), its bottom edge sits on the text's
 * baseline.
 */
export function Leader() {
  return <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-muted-foreground/50" />;
}

/**
 * One line: a colour mark (`swatch`, a `bg-` class) when the line is a part of a bar under it, the name, a dotted leader, the amount.
 * `sub`: under the line, quieter (a rate in words). `parts`: the line's own lines, indented behind an edge in `edge`'s colour (an account's
 * fees with their amounts, a fund's with their rates).
 */
export function ReceiptLine({ label, value, swatch, sub, parts, edge, size = "base", strong = false }: {
  label: ReactNode;
  value: ReactNode;
  swatch?: string;
  sub?: ReactNode;
  parts?: ReactNode;
  /** The indented parts' edge colour, a `border-` class. */
  edge?: string;
  /** `base` (16 px) for a line of the receipt, `sm` (14 px) for a part of one. */
  size?: "base" | "sm";
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className={cx("flex items-baseline gap-2", size === "sm" ? "text-sm" : "text-base", strong && "font-semibold")}>
        {swatch && <span aria-hidden="true" className={cx("inline-block size-2.5 shrink-0 self-center rounded-[2px]", swatch)} />}
        <span className="min-w-0">{label}</span>
        <Leader />
        <span className="shrink-0 tabular-nums whitespace-nowrap">{value}</span>
      </div>
      {sub && <div className={cx("text-xs text-muted-foreground", swatch && "ps-[1.125rem]")}>{sub}</div>}
      {parts && <div className={cx("ms-1 mt-1 flex flex-col gap-2 border-s-2 ps-3", edge ?? "border-border")}>{parts}</div>}
    </div>
  );
}

export function ReceiptRule({ kind }: { kind: "double" | "dashed" }) {
  return <hr aria-hidden="true" className={cx("border-0", kind === "double" ? "h-[5px] border-y border-muted-foreground/60" : "border-t border-dashed border-muted-foreground/50")} />;
}

/** One of the ticket's two side parts: a small label with the part's colour (`swatch`, a `bg-` class), the name large, then its lines. */
export function TicketPart({ label, swatch, name, children }: { label: ReactNode; swatch: string; name: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <span aria-hidden="true" className={cx("inline-block size-2.5 shrink-0 rounded-[3px]", swatch)} />
        {label}
      </span>
      <span className="mb-2.5 text-2xl font-semibold leading-snug [overflow-wrap:anywhere]">{name}</span>
      <div className="flex flex-col gap-2.5 text-sm">{children}</div>
    </div>
  );
}

/**
 * The receipt as a ticket across a wide column (the index page from 1280 px, above the two lists): a line on top (`top`, its two ends),
 * three parts side by side, the middle one (`middle`, 40% of the width) between two dashed edges and the two sides (`start`, `end`) as wide
 * as what is left, then a row of three cells under a dashed rule (`foot`, in the same columns). Round notches bite the ticket's top and
 * bottom edges where the middle part's edges meet them. The popover surface, flat; the lines, amounts and marks are the caller's.
 */
export function ReceiptTicket({ label, top, start, middle, end, foot, ref }: { label?: string; top: ReactNode; start: ReactNode; middle: ReactNode; end: ReactNode; foot: [ReactNode, ReactNode, ReactNode]; ref?: Ref<HTMLElement> }) {
  const notch = "absolute size-[22px] rounded-full bg-background";
  return (
    <section ref={ref} aria-label={label} className="relative grid grid-cols-[minmax(0,1fr)_40%_minmax(0,1fr)] grid-rows-[auto_auto_auto] rounded-2xl bg-popover text-popover-foreground">
      <div className="col-span-3 flex items-baseline justify-between gap-3 px-6 pt-4 pb-2 text-xs text-muted-foreground">{top}</div>
      <div className="min-w-0 px-6 pt-2.5 pb-6">{start}</div>
      <div className="flex min-w-0 flex-col gap-3 border-x-[1.5px] border-dashed border-muted-foreground/35 px-7 pt-2.5 pb-6">{middle}</div>
      <div className="min-w-0 px-6 pt-2.5 pb-6">{end}</div>
      <div className="col-span-3 grid grid-cols-subgrid border-t-[1.5px] border-dashed border-muted-foreground/35">
        <div className="min-w-0 px-6 pt-3.5 pb-4">{foot[0]}</div>
        <div className="min-w-0 px-7 pt-3.5 pb-4">{foot[1]}</div>
        <div className="min-w-0 px-6 pt-3.5 pb-4">{foot[2]}</div>
      </div>
      <div aria-hidden="true" className="pointer-events-none relative col-start-2 row-start-1 row-end-[-1]">
        <span className={cx(notch, "-top-[11px] -start-[11px]")} />
        <span className={cx(notch, "-top-[11px] -end-[11px]")} />
        <span className={cx(notch, "-bottom-[11px] -start-[11px]")} />
        <span className={cx(notch, "-bottom-[11px] -end-[11px]")} />
      </div>
    </section>
  );
}

/**
 * Raises what floats at the screen's foot (the shell's "back to the top") above the stub while the stub shows, so the two never overlap:
 * the stub's height (5rem and the phone's safe area) and 0.75rem of air.
 */
export const clearOfReceiptStub = "[body:has([data-receipt-stub=shown])_&]:bottom-[calc(5.75rem+env(safe-area-inset-bottom))]";

/** Where the receipt is: wholly above the screen while `area` (the part of the page the receipt belongs to) still reaches its foot. */
function useOutOfSightAbove(target: RefObject<HTMLElement | null>, area: RefObject<HTMLElement | null>, on: boolean): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const t = target.current?.getBoundingClientRect();
      const a = area.current?.getBoundingClientRect();
      setShown(!!t && !!a && t.height > 0 && t.bottom < 0 && a.bottom > window.innerHeight);
    };
    const later = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    // the area grows or shrinks without a scroll (a fold opens, a list re-sorts)
    const ro = area.current ? new ResizeObserver(later) : null;
    if (area.current) ro!.observe(area.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", later);
      window.removeEventListener("resize", later);
      ro?.disconnect();
    };
  }, [target, area, on]);
  return on && shown;
}

/**
 * The receipt's stub: the receipt's paper, torn at the top, pinned to the foot of the screen with a shadow above it, for a page whose
 * receipt stands above a long list (the index page below 1280 px). Small, what the receipt is of (`names`); then its total's name
 * (`label`) and the total as the receipt shows it (`figure`, plain text: the whole stub is one button), and `go`, the way to it. A tap
 * scrolls to the receipt (`target`, focusable with `tabIndex={-1}`) and puts the focus there. It shows only while the receipt is wholly
 * above the screen and `area`, the part of the page it belongs to, still reaches the screen's foot, so it never covers what follows
 * (the page's footer); hidden, it is inert: not focusable, and a tap goes through it. `inline`: drawn in its place and always shown (the
 * gallery).
 */
export function ReceiptStub({ names, label, figure, go, target, area, inline = false }: { names: ReactNode; label: ReactNode; figure: ReactNode; go: string; target: RefObject<HTMLElement | null>; area: RefObject<HTMLElement | null>; inline?: boolean }) {
  const away = useOutOfSightAbove(target, area, !inline);
  const shown = inline || away;
  const onClick = () => {
    const el = target.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: still ? "instant" : "smooth" });
    el.focus({ preventScroll: true });
  };
  return (
    <div
      data-receipt-stub={shown ? "shown" : "hidden"}
      inert={!shown}
      className={cx(
        "drop-shadow-up",
        inline ? "relative" : "fixed inset-x-0 bottom-0 z-[var(--z-sticky)] transition-[translate,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        !inline && !shown && "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="receipt-edge-top flex h-[calc(5rem+env(safe-area-inset-bottom))] w-full items-center justify-between gap-3 bg-popover px-gutter pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-start text-popover-foreground focus-visible:outline-2 focus-visible:outline-offset-[-10px] focus-visible:outline-ring"
      >
        <span className="flex min-w-0 flex-col leading-snug">
          <span className="truncate text-xs text-muted-foreground">{names}</span>
          <span className="text-base font-semibold">{label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="text-2xl font-semibold text-primary tabular-nums whitespace-nowrap">{figure}</span>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            {go}
            <IconChevronUp size={14} />
          </span>
        </span>
      </button>
    </div>
  );
}
