// One figure of a fee's price, typed where it stands in the case open in place.
import { useRef, type ReactNode } from "react";
import { feeDeal as copy, values as valuesCopy } from "../../copy";
import { editPrice } from "../../lib/fee-deal/edits/stage";
import { setFigure, figureOf, withFigure } from "../../lib/fee-deal/edits/price";
import { type Side } from "../../lib/fee-deal/model";
import type { Figure } from "../../lib/fee-deal/offers/figures";
import { pricesOn, SUM_MAX, type Fee, type Num } from "../../lib/fee-deal/model";
import type { CitedPlace } from "../../lib/sources";
import type { SiteValue } from "../../lib/value";
import { FigureField, percentCheck } from "../kit";

/** A sum above the largest a deal keeps is refused as it is typed: reading the deal back would drop it (model.ts). */
const amountCheck = (n: number): string | null => (n < 0 ? valuesCopy.errors.negative : n > SUM_MAX ? copy.panel.tooLarge : null);
const rateCheck = percentCheck();

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

/** The id of a part's box, or of the part itself (`partPlaceId`), in a fee, which the page gives the focus to (a fee just added, a part just added). */
export const partFieldId = (feeId: string, part: string) => `part-${feeId}-${part}`;

/** A part's place in a fee's open case: the side and the price it stands on, and the part. Its boxes add their figure to it. */
export const partPlaceId = (side: Side, k: number, part: string) => `${side}${k}-${part}`;

/** A field's sign as its box draws it: a percent, or a currency's sign. */
export const signText = (sign: "pct" | string): string => (sign === "pct" ? "%" : sign);

/**
 * The figure `figure` of price `k` on `side` of a fee's case (`caseId`; a slim fee's own price where none), in its box (`value`, null while
 * not given). A bound or a percent maximum (`optional`) may be emptied, which takes it away; not given, it is an empty box with a dash.
 * Any other figure not given is an empty dashed box with its unit; emptying a given one makes it so again. `unit` replaces the sign in the
 * box (a choice of currency). The arrows step a percent by a hundredth, a sum per unit by a thousandth and any other sum by one. The box
 * accepts its unit's sign typed with the number, and Escape puts the figure back as it stood when the box took the focus, its source with
 * it. Its state is the figure's (entered, or sourced from a template, where a press on it says where it is from); what it commits becomes
 * the person's.
 */
export function PriceFigure({
  fee,
  side,
  k,
  caseId,
  figure,
  value,
  sign,
  unit,
  label,
  words,
  optional,
  id,
  onFee,
  onRevert,
}: {
  fee: Fee;
  side: Side;
  k: number;
  caseId?: string;
  figure: Figure;
  value: SiteValue | null;
  sign: "pct" | string;
  unit?: ReactNode;
  /** The spoken name: the fee and the figure. */
  label: string;
  words?: ReactNode;
  optional?: boolean;
  id?: string;
  onFee: (fee: Fee) => void;
  /** What Esc does in place of putting this price's figure back as it stood when the box took the focus (a figure edited for several cases). */
  onRevert?: () => void;
}) {
  // the figure as it stood when the box took the focus
  const atFocus = useRef<Num | undefined>(undefined);
  const price = () => pricesOn(fee, side, caseId)[k]!.price;
  const set = (n: number | null) => onFee(editPrice(fee, side, k, (p) => withFigure(p, figure, n), caseId));
  const pct = sign === "pct";
  return (
    <FigureField
      value={value}
      label={label}
      from={figureFrom(value)}
      unit={unit ?? signText(sign)}
      sign={signText(sign)}
      onFocus={() => (atFocus.current = figureOf(price(), figure))}
      onRevert={onRevert ?? (() => onFee(editPrice(fee, side, k, (p) => setFigure(p, figure, atFocus.current), caseId)))}
      words={words}
      tight
      {...(optional ? { placeholder: copy.panel.empty } : {})}
      onCommit={(n) => set(n)}
      onClear={() => set(null)}
      step={pct ? 0.01 : figure === "amount" && price().form === "perUnit" ? 0.001 : 1}
      {...(id ? { id } : {})}
      validate={pct ? rateCheck : amountCheck}
    />
  );
}
