// A figure of a closed fee, or of a table's cell, edited where it is read (method §10.6): a tap turns it into the open case's own box for
// that figure (`PriceFigure`), so its unit, its rules and its source are the same, and a figure a template filled becomes the person's once
// changed. A cell that covers several cases, or a line said once for several, edits them all alike, so they stay one.
import { createContext, useContext, useRef } from "react";
import { feeDeal as copy } from "../../copy";
import type { SlimPart } from "../../lib/fee-deal/case-words";
import { figuresBack, figureToAll } from "../../lib/fee-deal/edits/cells";
import { hasCases, type Fee } from "../../lib/fee-deal/model";
import { SPOKEN } from "../../lib/fee-deal/part-words";
import type { SiteValue } from "../../lib/value";
import { EditInPlace } from "../kit";
import { PriceFigure } from "./figures";
import { Fig } from "./words";

/** Where the figures drawn inside are edited: their fee, the cases they stand for (null: a fee whose price changes by nothing), and the edit. */
export interface EditPlace {
  fee: Fee;
  cases: readonly string[] | null;
  onFee: (f: Fee) => void;
}
export const EditHere = createContext<EditPlace | null>(null);

/** Figure `n` of a part at rest (`value`): edited in place where the page says where (`EditHere`) and the part has that figure's field. */
export function PartFig({ part, n, value }: { part: SlimPart; n: number; value: SiteValue }) {
  const at = useContext(EditHere);
  // the fee as the field opened: Esc puts each case's figure back as it stood then, its source with it
  const was = useRef<Fee | null>(null);
  const f = part.fields?.[n];
  if (!at || !f || (hasCases(at.fee) && !at.cases?.length)) return <Fig value={value} />;
  const k = part.stage ?? 0;
  const caseId = at.cases?.[0];
  const others = at.cases?.slice(1) ?? [];
  // the figure as the box left it in the first case, set in each other case's own price: the cases a cell or a line joins are alike in
  // that part alone, so nothing else of theirs changes
  const onFee = (next: Fee) => at.onFee(figureToAll(next, caseId, others, k, f.figure));
  const onRevert = () => was.current && at.onFee(figuresBack(at.fee, was.current, at.cases, k, f.figure));
  return (
    <EditInPlace
      label={`${copy.cases.lifted.edit}${SPOKEN[f.figure]}`}
      onOpen={() => (was.current = at.fee)}
      field={() => <PriceFigure fee={at.fee} side="buy" k={k} {...(caseId ? { caseId } : {})} figure={f.figure} value={f.value} sign={f.sign} label={SPOKEN[f.figure]} onFee={onFee} onRevert={onRevert} />}
    >
      <Fig value={value} />
    </EditInPlace>
  );
}
