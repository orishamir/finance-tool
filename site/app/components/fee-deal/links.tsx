// The fee page's columns as one thing (method §10.6 reads one deal, and each column shows it another way): a fee under the pointer or the
// focus in the glance marks its card in the builder, and a card marks the fee's lines in the glance; pressing a fee's name in the glance or
// in the reading chooses it and brings its card and panel into view; a fee's standing tag on its card or in the glance brings its row of
// the reading's law card into view. Each column reads the page's `FeeLinks` from here.
import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import type { FeeRef, StandingView } from "../../lib/fee-deal/parts";
import type { LawRow } from "../../lib/fee-deal/reading";
import { cx } from "../kit";
import { feeDeal as copy } from "../../copy";
import { FeeName, StandingTag } from "./words";

export interface FeeLinks {
  /** The fee under the pointer or the focus somewhere on the page, or null. */
  marked: string | null;
  mark: (feeId: string | null) => void;
  /** Chooses a fee and brings its card and panel into view. */
  open: (feeId: string) => void;
  /** Brings the fee's row of the law card into view, the focus on it. */
  toLaw: (feeId: string) => void;
}

const FeeLinksCtx = createContext<FeeLinks | null>(null);

export function FeeLinksProvider({ value, children }: { value: FeeLinks; children: ReactNode }) {
  return <FeeLinksCtx.Provider value={value}>{children}</FeeLinksCtx.Provider>;
}

/**
 * What a fee's line or card takes to mark and be marked: the handlers that mark it while the pointer is over it or the focus in it, and
 * whether it is marked now. Outside the page (a test drawing one column), nothing.
 */
export function useFeeMark(feeId: string): { marked: boolean; handlers: Pick<HTMLAttributes<HTMLElement>, "onPointerEnter" | "onPointerLeave" | "onFocus" | "onBlur"> } {
  const links = useContext(FeeLinksCtx);
  if (!links) return { marked: false, handlers: {} };
  return {
    marked: links.marked === feeId,
    handlers: {
      onPointerEnter: () => links.mark(feeId),
      onPointerLeave: () => links.mark(null),
      onFocus: () => links.mark(feeId),
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) links.mark(null);
      },
    },
  };
}

/** The look of a line another column marks: the quiet fill of a row under the pointer, as a card under it is drawn. */
export const markedLine = (marked: boolean) => cx("-mx-1.5 rounded-md px-1.5 transition-colors duration-[var(--duration-fast)]", marked && "bg-accent/60");

/**
 * A press on a fee's line chooses the fee, as its name does, except a press on another control in it (a figure's sheet): the line is the
 * pointer's target, the name the keyboard's.
 */
export function useLineOpen(feeId: string): ((e: { target: EventTarget }) => void) | undefined {
  const links = useContext(FeeLinksCtx);
  if (!links) return undefined;
  return (e) => {
    // the name's own button opens it itself; a figure's opens its sheet
    if (!(e.target as HTMLElement).closest("button, a, input, select")) links.open(feeId);
  };
}

/**
 * A fee's name that chooses the fee (its swatch and name, as `FeeName` draws them), on the page; plain words outside it. `before` and
 * `after` are held to the name as `FeeName` holds them.
 */
export function FeeOpen({ fee, className, before, after }: { fee: FeeRef; className?: string; before?: string; after?: string }) {
  const links = useContext(FeeLinksCtx);
  if (!links) return <FeeName fee={fee} className={className} before={before} after={after} />;
  return (
    <button type="button" data-fee-open="" onClick={() => links.open(fee.of ?? fee.fee)} className="inline-flex min-w-0 rounded-sm text-start hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
      <FeeName fee={fee} className={className} before={before} after={after} />
    </button>
  );
}

/**
 * A fee's standing tag (`StandingTag`) that brings the fee's row of the law card into view, on the page; the plain tag outside it, or
 * where nothing is judged. `fee`: the fee's id.
 */
export function LawTag({ fee, standing }: { fee: string; standing: StandingView }) {
  const links = useContext(FeeLinksCtx);
  const tag = <StandingTag standing={standing} />;
  if (!links || !standing.standing.judged) return tag;
  return (
    <button
      type="button"
      data-lift=""
      data-law-tag=""
      onClick={(e) => {
        e.stopPropagation();
        links.toLaw(fee);
      }}
      className="tap-area inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-ring"
    >
      {tag}
      <span className="sr-only">{copy.standing.toLaw}</span>
    </button>
  );
}

/** The tag of a fee's law row, as `CapBlock` draws it: of its standing now. */
export function LawRowTag({ row }: { row: LawRow }) {
  return row.now ? <LawTag fee={row.fee} standing={row.now} /> : null;
}
