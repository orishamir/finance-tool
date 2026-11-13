// A fee in the builder (design-system 11, "Cases and parts"): its colour dot and name, then its price. A fee whose price does not change is
// one slim line, its parts after its name (`SlimFee`), which opens in place as a case does; a fee whose price changes holds one band
// (`FeeBlock`). Each fee keeps its own dot colour; no block takes it.
import type { ReactNode } from "react";
import { dealCases as copy } from "../../copy";
import { PickCard } from "./choice";
import { cx } from "./cx";
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

/** A fee whose price changes: its dot and name, then its band (`ConditionBand`) as `children`. */
export function FeeBlock({ dot, name, children }: { dot: string; name: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 pt-1 pb-4">
      <FeeName dot={dot} name={name} />
      {children}
    </div>
  );
}

/**
 * A fee with one price, on one line: its dot, its name, then its parts (`PartChip`s), wrapping under the name where the line is short. The
 * whole line is one button that opens the fee (`label` is its spoken name); a figure in it keeps its own tap. `open`: the fee is open in
 * place, as an open case is: the outline in the action colour, "נבחר" at the end of the name's line, and its parts in edit (`PartEdit`s,
 * the `children` then) stacked under it, with `actions` after them.
 */
export function SlimFee({ dot, name, label, onOpen, open, actions, children }: { dot: string; name: ReactNode; label: string; onOpen: () => void; open?: boolean; actions?: ReactNode; children: ReactNode }) {
  return (
    <PickCard label={label} onPick={onOpen} chosen={open} className={cx("bg-card px-4", open ? "flex flex-col gap-2 pt-1 pb-3" : "flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1")}>
      {open ? (
        <>
          <span className="flex flex-wrap items-center gap-2">
            <FeeName dot={dot} name={name} />
            <Tag tone="primary" className="ms-auto">
              {copy.chosen}
            </Tag>
          </span>
          <div className="flex flex-col gap-2" data-figures>
            {children}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-x-5">{actions}</div>}
        </>
      ) : (
        <>
          <FeeName dot={dot} name={name} />
          {children}
        </>
      )}
    </PickCard>
  );
}
