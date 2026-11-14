// A figure of a closed fee, or of a table's cell, edited where it is read (method §10.6): a tap turns it into the open case's own box for
// that figure (`PriceFigure`), so its unit, its rules and its source are the same, and a figure a template filled becomes the person's once
// changed. A cell that covers several cases, or a line said once for several, edits them all alike, so they stay one; where a later price
// says only what it changes (a fee's cases laid out, `carry`), the figure is carried on to the later prices that held it alike.
import { createContext, useContext, useRef } from "react";
import { feeDeal as copy } from "../../copy";
import type { SlimPart } from "../../lib/fee-deal/case-words";
import { figureOnward, figuresBack, figureToAll } from "../../lib/fee-deal/edits/cells";
import { hasCases, type Fee } from "../../lib/fee-deal/model";
import { SPOKEN } from "../../lib/fee-deal/part-words";
import type { Figure } from "../../lib/fee-deal/offers/figures";
import type { SiteValue } from "../../lib/value";
import { EditInPlace } from "../kit";
import { FromEach, PriceFigure } from "./figures";
import { Fig } from "./words";

/**
 * Where the figures drawn inside are edited: their fee, the cases they stand for (null: a fee whose price changes by nothing), and the
 * edit; `carry`, the later prices there say only what they change (`laterChanges`), so an edit goes on to those that held the part alike.
 */
export interface EditPlace {
  fee: Fee;
  cases: readonly string[] | null;
  onFee: (f: Fee) => void;
  carry?: boolean;
  /** Each case named by what tells it apart from the others here, for a figure they hold from different places (`FromEach`). */
  named?: (caseId: string) => string;
}
export const EditHere = createContext<EditPlace | null>(null);

/** The figures a price may be without, as the open case's boxes take them (part-edit.tsx): a bound, a percent maximum, a third party's bound. */
const OPTIONAL: ReadonlySet<Figure> = new Set<Figure>(["min", "max", "cap", "thirdMin", "thirdMax"]);

/**
 * Figure `n` of a part at rest (`value`): edited in place where the page says where (`EditHere`) and the part has that figure's field. A
 * figure the cases of its cell hold from different places (`SlimPart.froms`) wears the mark of each state they hold it in, the source's
 * line under it and, where a case holds it as the person's, the entered ink (`num-mixed`); its box's note names where each case's is from.
 */
export function PartFig({ part, n, value }: { part: SlimPart; n: number; value: SiteValue }) {
  const at = useContext(EditHere);
  // the fee as the field opened: Esc puts each case's figure back as it stood then, its source with it
  const was = useRef<Fee | null>(null);
  const f = part.fields?.[n];
  const froms = part.froms?.[n] ?? null;
  const mixed = !!froms && value.state === "sourced" && froms.some((x) => x.value.state === "entered");
  const rest = <Fig value={value} {...(mixed ? { className: "num-mixed" } : {})} />;
  if (!at || !f || (hasCases(at.fee) && !at.cases?.length)) return rest;
  const k = part.stage ?? 0;
  const caseId = at.cases?.[0];
  const others = at.cases?.slice(1) ?? [];
  // the figure as the box left it in the first case, set in each other case's own price: the cases a cell or a line joins are alike in
  // that part alone, so nothing else of theirs changes
  const onFee = (next: Fee) => {
    const all = figureToAll(next, caseId, others, k, f.figure);
    at.onFee(at.carry ? figureOnward(all, at.fee, at.cases, k, part.id, f.figure) : all);
  };
  const onRevert = () => was.current && at.onFee(figuresBack(at.fee, was.current, at.cases, k, f.figure));
  return (
    <EditInPlace
      label={`${copy.cases.lifted.edit}${SPOKEN[f.figure]}`}
      onOpen={() => (was.current = at.fee)}
      field={() => <PriceFigure fee={at.fee} side="buy" k={k} {...(caseId ? { caseId } : {})} figure={f.figure} value={f.value} sign={f.sign} label={SPOKEN[f.figure]} optional={OPTIONAL.has(f.figure)} {...(froms && at.named ? { from: <FromEach froms={froms} named={at.named} /> } : {})} onFee={onFee} onRevert={onRevert} />}
    >
      {rest}
    </EditInPlace>
  );
}
