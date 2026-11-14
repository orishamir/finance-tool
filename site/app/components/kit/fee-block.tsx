// A fee in the builder (design-system 11, "Cases and parts"): its colour dot and name, then its price. A fee whose price does not change is
// one slim line, its parts after its name (`SlimFee`), which opens in place as a case does; a fee whose price changes holds one band
// (`FeeBlock`). Each fee keeps its own dot colour; no block takes it. An open fee's bin stands beside its name; a closed one may carry
// small actions in its top end corner (`corner`: its bin and its duplicate), straddling its top edge so they cover nothing, drawn only
// while a fine pointer is over the card (app.css, `data-fee-corner`).
import type { ReactNode } from "react";
import { dealCases as copy } from "../../copy";
import { PickCard } from "./choice";
import { cx } from "./cx";
import { RemoveButton } from "./remove-button";
import { Tag } from "./tag";

/** The fee's dot and name. `dot` is its colour role as a class (`bg-fee-trade`). */
function FeeName({ dot, name }: { dot: string; name: ReactNode }) {
  return (
    <span className="inline-flex min-h-target items-center gap-2">
      <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", dot)} />
      <span className="font-semibold">{name}</span>
    </span>
  );
}

/** What a fee's bin (`RemoveButton`) says and does: it takes the fee away. */
export interface FeeRemove {
  label: string;
  onRemove: () => void;
}

/** A closed card's corner actions: knobs on its top edge at its end, over nothing of it. */
function Corner({ children }: { children: ReactNode }) {
  return (
    <span data-fee-corner="" className="absolute -top-2.5 end-3 z-20 flex items-center gap-2">
      {children}
    </span>
  );
}

/** A fee whose price changes: its dot and name (and the bin `remove`, where given), then its band (`ConditionBand`) as `children`; carried by its head. */
export function FeeBlock({ dot, name, remove, open, grip, corner, children }: { dot: string; name: ReactNode; remove?: FeeRemove | undefined; /** The fee is open: on touch its grips are drawn. */ open?: boolean; /** A grip before its name that lifts the fee (lift.tsx); its head is what is carried. */ grip?: ReactNode; /** Closed: the knobs in its corner (its bin, its duplicate). */ corner?: ReactNode; children: ReactNode }) {
  return (
    <div data-open-fee={open ? "" : undefined} className="relative flex flex-col gap-2 rounded-lg border border-border bg-card px-4 pt-1 pb-4">
      {!open && corner && <Corner>{corner}</Corner>}
      <span data-fee-head="" data-lift-head="" className="flex flex-wrap items-center gap-2">
        {grip}
        <FeeName dot={dot} name={name} />
        {remove && <RemoveButton {...remove} />}
      </span>
      {children}
    </div>
  );
}

/**
 * A fee with one price, on one line: its dot, its name, then its parts (`PartChip`s), wrapping under the name where the line is short. The
 * whole line is one button that opens the fee (`label` is its spoken name); a figure in it keeps its own tap. `open`: the fee is open in
 * place, as an open case is: the outline in the action colour, "נבחר" at the end of the name's line, and its parts in edit (`PartEdit`s,
 * the `children` then) stacked under it, with `actions` after them, and the bin `remove` beside its name.
 */
export function SlimFee({ dot, name, label, onOpen, open, remove, actions, grip, corner, children }: { dot: string; name: ReactNode; label: string; onOpen: () => void; open?: boolean; remove?: FeeRemove | undefined; actions?: ReactNode; /** A grip before its name that lifts the fee (lift.tsx). */ grip?: ReactNode; /** Closed: the knobs in its corner (its bin, its duplicate). */ corner?: ReactNode; children: ReactNode }) {
  return (
    <PickCard label={label} onPick={onOpen} chosen={open} className={cx("bg-card px-4", open ? "flex flex-col gap-2 pt-1 pb-3" : "flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1")}>
      {open ? (
        <div data-open-fee="" className="contents">
          <span data-fee-head="" data-lift-head="" className="flex flex-wrap items-center gap-2">
            {grip}
            <FeeName dot={dot} name={name} />
            {remove && <RemoveButton {...remove} />}
            <Tag tone="primary" className="ms-auto">
              {copy.chosen}
            </Tag>
          </span>
          <div className="flex flex-col gap-2" data-figures data-case-parts="">
            {children}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-x-5">{actions}</div>}
        </div>
      ) : (
        <>
          {corner && <Corner>{corner}</Corner>}
          {grip}
          <FeeName dot={dot} name={name} />
          {children}
        </>
      )}
    </PickCard>
  );
}
