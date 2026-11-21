// A fee in the builder (design-system 11, "Cases and parts"): its mark (an emoji on a faint tile of its colour) and name, under a thin
// stripe of its colour along the card's top, then its price. A fee whose price does not change is
// one slim line, its parts after its name (`SlimFee`), which opens in place as a case does; a fee whose price changes holds its cases
// under its name's line (`FeeBlock`): the parts every case holds alike, then the cases' band. Each fee keeps its own dot colour; no block takes it. An open fee's bin stands beside its name; a closed one may carry
// small actions in its top end corner (`corner`: its bin and its duplicate), straddling its top edge so they cover nothing, drawn only
// while a fine pointer is over the card (app.css, `data-fee-corner`).
import type { ReactNode } from "react";
import { dealCases as copy } from "../../copy";
import { IconCheck } from "../icons";
import { PickCard } from "./choice";
import { cx } from "./cx";
import { RemoveButton } from "./remove-button";
import { Tag } from "./tag";

/**
 * The fee's mark and name: its emoji on a faint tile of its colour, or its dot where it has none. `dot` is its colour role as a class
 * (`bg-fee-trade`). `end`: a host's words stand at the end of the name's line (`FeeHeadSlot.end`): the name's first line is the box's
 * baseline, which the words beside it take (`self-baseline`), so they stand at the end of its first line where the name wraps.
 */
function FeeName({ dot, mark, name, end }: { dot: string; mark?: string | undefined; name: ReactNode; end?: boolean }) {
  return (
    <span className={cx("min-h-target min-w-0 gap-2", end ? "inline-grid grid-cols-[auto_minmax(0,1fr)] content-center items-center self-baseline" : "inline-flex items-center")}>
      {mark ? (
        <span aria-hidden className="relative grid size-7.5 shrink-0 place-items-center rounded-lg text-base leading-none">
          <span className={cx("absolute inset-0 rounded-lg opacity-25", dot)} />
          <span className="relative">{mark}</span>
        </span>
      ) : (
        <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", dot)} />
      )}
      <span className={cx("text-lg font-semibold", end && "self-baseline")}>{name}</span>
    </span>
  );
}

/** What a fee's bin (`RemoveButton`) says and does: it takes the fee away. */
export interface FeeRemove {
  label: string;
  onRemove: () => void;
}

/**
 * The thin stripe of the fee's colour along its card's top edge, bending down its rounded corners as a top border does: the card's shape
 * in the fee's colour, masked to its 3 px top border.
 */
const Stripe = ({ dot }: { dot: string }) => (
  <span
    aria-hidden
    className={cx(
      "fee-stripe pointer-events-none absolute -inset-px rounded-lg border-t-[3px] border-transparent",
      dot,
    )}
  />
);

/** A closed card's corner actions: knobs on its top edge at its end, over nothing of it. */
function Corner({ children }: { children: ReactNode }) {
  return (
    <span data-fee-corner="" className="absolute -top-2.5 inset-e-3 z-20 flex items-center gap-2">
      {children}
    </span>
  );
}

/**
 * A fee whose price changes: its dot and name (and the bin `remove`, where given) on its own line; then, as `children`, the parts every
 * case holds alike (`EveryCaseParts`) and its cases in their band (`ConditionBand`, its head saying what the price changes by over a
 * `CaseTable`, a `CaseGrid` or the cases read as rows); carried by its name.
 */
export function FeeBlock({ dot, mark, name, remove, open, grip, corner, head, children }: { dot: string; /** Its emoji, beside its name. */ mark?: string | undefined; name: ReactNode; remove?: FeeRemove | undefined; /** The fee is open: on touch its grips are drawn. */ open?: boolean; /** A grip before its name that lifts the fee (lift.tsx); its head is what is carried. */ grip?: ReactNode; /** Closed: the knobs in its corner (its bin, its duplicate). */ corner?: ReactNode; head?: FeeHeadSlot | undefined; children: ReactNode }) {
  return (
    <div data-open-fee={open ? "" : undefined} className="relative flex flex-col gap-2 rounded-lg border border-border bg-card px-4 pt-1 pb-4">
      <Stripe dot={dot} />
      {!open && corner && <Corner>{corner}</Corner>}
      <span data-fee-head="" data-lift-head="" className={cx("flex items-center gap-2", head?.end ? "flex-nowrap" : "flex-wrap")}>
        {grip}
        <FeeName dot={dot} mark={mark} name={name} end={!!head?.end} />
        {remove && <RemoveButton {...remove} />}
        {head?.end && <span className="ms-auto shrink-0 self-baseline">{head.end}</span>}
      </span>
      {head?.under && <div className="-mt-1 text-sm text-muted-foreground">{head.under}</div>}
      {children}
      {head?.foot}
    </div>
  );
}

/**
 * What a host adds to a fee's card (the indices page's popup; /deal adds nothing): `end`, at the end of the name's first line at every
 * width, the name wrapping beside it (what the fee costs on a plan, or a chip saying the plan never charges it); `under`, quiet lines under it
 * (why, or what the house's customers paid); and `foot`, a line after its cases (a case the page needs that the fee lacks). A fee with one
 * price and a head has its parts on a line of their own under these.
 */
export interface FeeHeadSlot {
  end?: ReactNode;
  under?: ReactNode;
  foot?: ReactNode;
}

/**
 * A fee with one price, on one line: its dot, its name, then its parts (`PartChip`s), wrapping under the name where the line is short. The
 * whole line is one button that opens the fee (`label` is its spoken name); a figure in it keeps its own tap. `open`: the fee is open in
 * place, as an open case is: the outline in the action colour, "נבחר" at the end of the name's line, and its parts in edit (`PartEdit`s,
 * the `children` then) stacked under it, with `actions` after them, and the bin `remove` beside its name.
 */
export function SlimFee({ dot, mark, name, label, onOpen, open, remove, actions, grip, corner, head, children }: { dot: string; /** Its emoji, beside its name. */ mark?: string | undefined; name: ReactNode; label: string; onOpen: () => void; open?: boolean; remove?: FeeRemove | undefined; actions?: ReactNode; /** A grip before its name that lifts the fee (lift.tsx). */ grip?: ReactNode; /** Closed: the knobs in its corner (its bin, its duplicate). */ corner?: ReactNode; head?: FeeHeadSlot | undefined; children: ReactNode }) {
  return (
    <PickCard label={label} onPick={onOpen} chosen={open} className={cx("bg-card px-4", open ? "flex flex-col gap-2 pt-1 pb-3" : "flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1")}>
      {/* open, the outline in the action colour frames it; a stripe of the fee's colour over it would cut its corners */}
      {!open && <Stripe dot={dot} />}
      {open ? (
        <div data-open-fee="" className="contents">
          <span data-fee-head="" data-lift-head="" className="flex flex-wrap items-center gap-2">
            {grip}
            <FeeName dot={dot} mark={mark} name={name} end={!!head?.end} />
            {remove && <RemoveButton {...remove} />}
            {head?.end && <span className="ms-auto self-baseline">{head.end}</span>}
            <Tag tone="primary" icon={<IconCheck size={14} className="shrink-0" />} className={head?.end ? undefined : "ms-auto"}>
              {copy.chosen}
            </Tag>
          </span>
          {head?.under && <div className="-mt-1 text-sm text-muted-foreground">{head.under}</div>}
          <div className="flex flex-col gap-2" data-figures data-case-parts="">
            {children}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-x-5">{actions}</div>}
          {head?.foot}
        </div>
      ) : (
        <>
          {corner && <Corner>{corner}</Corner>}
          {grip}
          {head?.end ? (
            <span className="flex min-w-0 flex-1 items-center gap-x-3">
              <FeeName dot={dot} mark={mark} name={name} end />
              <span className="ms-auto shrink-0 self-baseline">{head.end}</span>
            </span>
          ) : (
            <FeeName dot={dot} mark={mark} name={name} />
          )}
          {head?.under && <div className="basis-full -mt-1 text-sm text-muted-foreground">{head.under}</div>}
          {head?.end || head?.under ? <div className="flex basis-full flex-wrap items-center gap-x-3 gap-y-1.5">{children}</div> : children}
          {head?.foot && <div className="basis-full">{head.foot}</div>}
        </>
      )}
    </PickCard>
  );
}
