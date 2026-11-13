// One figure of a fee's price, typed where it stands: the same box in a builder row and in the panel, so a figure reads and edits alike in
// both. Its state is the figure's (entered, or sourced from a template with its source a tap away); what it commits becomes the person's.
import type { ReactNode } from "react";
import { feeDeal as copy, values as valuesCopy } from "../../copy";
import { editPrice, withFigure, type Figure, type Side } from "../../lib/fee-deal/edit";
import { SUM_MAX, type Fee } from "../../lib/fee-deal/model";
import type { PriceView } from "../../lib/fee-deal/parts";
import { FigureField, percentCheck } from "../kit";

/** A sum above the largest a deal keeps is refused as it is typed: reading the deal back would drop it (model.ts). */
const amountCheck = (n: number): string | null => (n < 0 ? valuesCopy.errors.negative : n > SUM_MAX ? copy.panel.tooLarge : null);
const rateCheck = percentCheck();

/** The sign of a figure's unit in its box: a rate's percent, a bound's currency, a sum's shekel. */
function signOf(view: PriceView, figure: Figure): string {
  if (figure === "rate") return "%";
  if ((figure === "min" || figure === "max") && view.form === "action") return copy.panel.signs[view.currency ?? "ILS"] ?? "";
  return copy.panel.signs.ILS!;
}

/** The id of the field of a price's rate or sum, which the page gives the focus to (a fee just added, a later price just added). */
export const mainFieldId = (feeId: string, side: Side, k: number, where: "row" | "panel") => `${where}-${feeId}-${side}-${k}`;

/**
 * The figure `figure` of stage `k` of a fee's prices on `side`, in its box. A bound (`min`, `max`) may be emptied, which takes it away; a
 * bound not given is an empty dashed box with a dash in it only where `optional` asks for one. A rate or a sum not given yet
 * (`view.blank`) is an empty dashed box with its unit; emptying a given one makes it so again. `unit` replaces the sign in the box (a
 * bound's currency as a choice); `inside` draws `words` in the box. The arrows step a rate by a hundredth of a percent and a sum by one.
 */
export function PriceFigure({ fee, side, k, view, figure, label, words, inside, tight, unit, optional, id, onFee }: {
  fee: Fee;
  side: Side;
  k: number;
  view: PriceView;
  figure: Figure;
  /** The spoken name: the fee and the figure. */
  label: string;
  words?: ReactNode;
  inside?: boolean;
  tight?: boolean;
  unit?: ReactNode;
  optional?: boolean;
  id?: string;
  onFee: (fee: Fee) => void;
}) {
  const value = view.figures[figure] ?? null;
  const bound = figure === "min" || figure === "max";
  if (!value && !optional && !(view.blank && !bound)) return null;
  const set = (n: number | null) => onFee(editPrice(fee, side, k, (p) => withFigure(p, figure, n)));
  return (
    <FigureField
      value={value}
      label={label}
      unit={unit ?? signOf(view, figure)}
      words={words}
      inside={inside}
      tight={tight}
      {...(optional ? { placeholder: copy.panel.empty } : {})}
      onCommit={(n) => set(n)}
      onClear={() => set(null)}
      step={figure === "rate" ? 0.01 : 1}
      {...(id ? { id } : {})}
      validate={figure === "rate" ? rateCheck : amountCheck}
    />
  );
}
