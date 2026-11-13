// One figure of a fee's price, typed where it stands: the same box in a builder row and in the panel, so a figure reads and edits alike in
// both. Its state is the figure's (entered, or sourced from a template, where a press on it says where it is from); what it commits becomes
// the person's.
import { useRef, type ReactNode } from "react";
import { feeDeal as copy, values as valuesCopy } from "../../copy";
import { editPrice, figureBack, figureOf, withFigure, type Figure, type Side } from "../../lib/fee-deal/edit";
import { pricesOn, SUM_MAX, type Fee, type Num } from "../../lib/fee-deal/model";
import type { PriceView } from "../../lib/fee-deal/parts";
import type { CitedPlace } from "../../lib/sources";
import type { SiteValue } from "../../lib/value";
import { FigureField, percentCheck } from "../kit";

/** A sum above the largest a deal keeps is refused as it is typed: reading the deal back would drop it (model.ts). */
const amountCheck = (n: number): string | null => (n < 0 ? valuesCopy.errors.negative : n > SUM_MAX ? copy.panel.tooLarge : null);
const rateCheck = percentCheck();

/**
 * The sign of a figure's unit in its box: a rate's and a percent maximum's percent; any sum in the price's currency (a share of an
 * action's bounds and flat price, a sum per unit with its bounds, a sum per action), else the shekel.
 */
function signOf(view: PriceView, figure: Figure): string {
  if (figure === "rate" || figure === "cap") return "%";
  return copy.panel.signs[view.currency ?? "ILS"] ?? "";
}

/** The regulator's data a track's figures are from (data/cma): its datasets on the government's data site. */
const CMA_DATA = /^https:\/\/data\.gov\.il\/(he\/)?datasets?\/cma\//;

/**
 * Where a sourced figure of a deal is from, for the note its box opens: a house's price list by the house's name (the figure's `own`,
 * which a house's template sets), with the document's page where the source names one; the regulator's data for a track's figure; else
 * nothing, and the note holds the source's link alone.
 */
export function figureFrom(value: SiteValue | null): ReactNode {
  if (value?.state !== "sourced") return undefined;
  const f = copy.figureFrom;
  if (value.own) {
    const page = (value.source as CitedPlace).page;
    return (
      <>
        {f.list}
        {value.own}
        {page ? (
          <>
            {f.page}
            <bdi dir="ltr">{page}</bdi>
          </>
        ) : null}
        .
      </>
    );
  }
  return CMA_DATA.test(value.source.url) ? f.cma : undefined;
}

/** The id of the field of a price's rate or sum, which the page gives the focus to (a fee just added, a later price just added). */
export const mainFieldId = (feeId: string, side: Side, k: number, where: "row" | "panel") => `${where}-${feeId}-${side}-${k}`;

/**
 * The figure `figure` of stage `k` of a fee's prices on `side`, in its box. A bound (`min`, `max`) or a percent maximum (`cap`) may be
 * emptied, which takes it away; one not given is an empty dashed box with a dash in it only where `optional` asks for one. A rate or a sum
 * not given yet (`view.blank`), and a flat price's figure not given yet (`blank`), is an empty dashed box with its unit; emptying a given
 * one makes it so again. `unit` replaces the sign in the box (a
 * bound's currency as a choice); `inside` draws `words` in the box. The arrows step a rate by a hundredth of a percent, a sum per unit by a
 * thousandth and any other sum by one.
 * The box accepts its unit's sign typed with the number, and Escape puts the figure back as it stood when the box took the focus, its
 * source with it.
 */
export function PriceFigure({ fee, side, k, view, figure, label, words, inside, tight, unit, optional, blank, id, onFee }: {
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
  /** A figure the price must have that is not given yet (a flat price's two): its empty box is drawn, with no dash. */
  blank?: boolean;
  id?: string;
  onFee: (fee: Fee) => void;
}) {
  const value = view.figures[figure] ?? null;
  // the figure as it stood when the box took the focus
  const atFocus = useRef<Num | undefined>(undefined);
  if (!value && !optional && !blank && !(view.blank && (figure === "rate" || figure === "amount"))) return null;
  const set = (n: number | null) => onFee(editPrice(fee, side, k, (p) => withFigure(p, figure, n)));
  return (
    <FigureField
      value={value}
      label={label}
      from={figureFrom(value)}
      unit={unit ?? signOf(view, figure)}
      sign={signOf(view, figure)}
      onFocus={() => (atFocus.current = figureOf(pricesOn(fee, side)[k]!.price, figure))}
      onRevert={() => onFee(editPrice(fee, side, k, (p) => figureBack(p, figure, atFocus.current)))}
      words={words}
      inside={inside}
      tight={tight}
      {...(optional ? { placeholder: copy.panel.empty } : {})}
      onCommit={(n) => set(n)}
      onClear={() => set(null)}
      step={figure === "rate" || figure === "cap" ? 0.01 : figure === "amount" && view.form === "perUnit" ? 0.001 : 1}
      {...(id ? { id } : {})}
      validate={figure === "rate" || figure === "cap" ? rateCheck : amountCheck}
    />
  );
}
