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

/**
 * The figure `figure` of stage `k` of a fee's prices on `side`, in its box. A bound (`min`, `max`) may be emptied, which takes it away; a
 * bound not given is an empty dashed box only where `optional` asks for one.
 */
export function PriceFigure({ fee, side, k, view, figure, label, words, optional, onFee }: {
  fee: Fee;
  side: Side;
  k: number;
  view: PriceView;
  figure: Figure;
  /** The spoken name: the fee and the figure. */
  label: string;
  words?: ReactNode;
  optional?: boolean;
  onFee: (fee: Fee) => void;
}) {
  const value = view.figures[figure] ?? null;
  if (!value && !optional) return null;
  const bound = figure === "min" || figure === "max";
  const set = (n: number | null) => onFee(editPrice(fee, side, k, (p) => withFigure(p, figure, n)));
  return (
    <FigureField
      value={value}
      label={label}
      unit={signOf(view, figure)}
      words={words}
      onCommit={(n) => set(n)}
      {...(bound ? { onClear: () => set(null) } : {})}
      validate={figure === "rate" ? rateCheck : amountCheck}
    />
  );
}
