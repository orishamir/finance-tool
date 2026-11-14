// One fee's block in the fees' column (method §10.6, `builder`'s `block`): a fee whose price changes by nothing is one slim line, its parts
// after its name, a later price's after the month the first ends; a fee whose price changes holds its cases laid out by its shape
// (fee-cases.tsx), the tracks that are not the person's folded into one line. The fee or case open shows its slots, its parts with their
// boxes (`OpenParts`) and the actions on the case; while a fee is open, its bin stands beside its name, and the things of its head open
// their values. Each thing of the head has a bin beside it, the fee open or not. The question of a thing being added stands in the open
// fee's block, above its cases or its price. On a computer a part dragged from the toolbox drops on a slim fee or a case of the open fee,
// and a thing to change by on the open fee's block (`ToolDrop`).
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { BuilderRow } from "../../lib/fee-deal/rows";
import type { OpenCase as OpenCaseView } from "../../lib/fee-deal/panel";
import { cardThing } from "../../lib/fee-deal/toolbox";
import { type Side } from "../../lib/fee-deal/model";
import { hasCases, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { keeps, type ChargedForm } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { DropZone, FeeBlock, SlimFee, When } from "../kit";
import { AskThing } from "./ask-thing";
import { FeeCases, RestPart, RowStanding } from "./fee-cases";
import { OpenParts } from "./open-case";
import { type PendingHands } from "./part-edit";
import { UnreadWords, feeColour, feeName } from "./words";

const b = copy.builder;

/** What the page holds for the case open in place, and what a fee's block does with it. */
export interface OpenHere {
  /** The open fee's id, and its open case (null for a slim fee). */
  fee: string | null;
  case: string | null;
  /** The open case as the panel builds it (`panel(...).open`). */
  view: OpenCaseView | null;
  /** The slot whose menu is open: its thing's place among the fee's things. */
  menu: number | null;
  /** The thing of the band's head whose menu is open: its place among the fee's things. */
  thing: number | null;
}

/** What a fee's block hands to the page: a fee or a case opened, a slot or a thing tapped, a case or a later price taken away, a part asked. */
export interface BlockActions {
  /** A fee or a case opened in place, and how: by the pointer, or the keyboard (its first box then takes the focus). */
  onOpen: (feeId: string, caseId: string | null, by: "pointer" | "keyboard") => void;
  /** A slot of the open case tapped, at the pill it opens from; again, its menu closes. */
  onSlot: (t: number, at: HTMLElement) => void;
  /** A thing of the open fee's band head tapped, at its pill; again, its menu closes. */
  onThing: (t: number, at: HTMLElement) => void;
  onRemoveCase: (feeId: string, caseId: string) => void;
  /** The open fee's bin: the fee taken away, kept for the undo. */
  onRemoveFee: (feeId: string) => void;
  /** A thing's bin in a fee's band head: the price stops changing by it, kept for the undo. */
  onRemoveBy: (feeId: string, t: number) => void;
  /** Where a part or a thing dragged from the toolbox drops. */
  drop: ToolDrop;
  onHoldOn: (feeId: string, side: Side, k: number, caseId: string | undefined, after: ChargedForm) => void;
  /** A part the toolbox added that asks for what it needs: given or dropped, and whether its box takes the focus (`PendingHands`). */
  pendingHands: PendingHands;
  /** The question closed: the thing added, or not. */
  onAskDone: (added: boolean) => void;
}

/**
 * A toolbox card dropped in the fees' column (its id, `ToolPart.id`): whether the open fee's case `caseId` (null for a slim fee, or the fee
 * as a whole) takes it, and what its tap does there.
 */
export interface ToolDrop {
  accepts: (feeId: string, caseId: string | null, item: string) => boolean;
  onDrop: (feeId: string, caseId: string | null, item: string) => void;
}

/** A thing to change by among the toolbox's cards (`cardThing`): it drops on the fee's block; a part drops on a slim fee or a case. */
const isThing = (item: string): boolean => cardThing(item) !== null;

/** The facts a slim line says at its end: that its price is not given yet or not read, its next change, where it is charged, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (row.banned || !row.priced) notes.push(<UnreadWords key="unread" banned={row.banned} noCurrency={row.noCurrency} unmatched={row.unmatched} />);
  if (row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.priced && row.stages[0]!.price.form === "action" && keeps(fee.kind, "action", "min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
      {notes.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/**
 * One fee's block (`row`, its view; none for a fee whose prices are out of order): its slim line or its band, the case open in place with
 * its parts and `formLine` (the undo line of its price put in another form) under them, and the question `ask` of a thing being added.
 * `unfolded`: whether its folded tracks are open (the column holds it, `onUnfold`).
 */
export function FeeBlockView({
  fee,
  row,
  deal,
  open,
  ask,
  unfolded,
  formLine,
  actions,
  onUnfold,
  onFee,
}: {
  fee: Fee;
  row: BuilderRow | undefined;
  deal: FeeDeal;
  open: OpenHere;
  ask: ByKind | null;
  unfolded: boolean;
  formLine: ReactNode;
  actions: BlockActions;
  onUnfold: (on: boolean) => void;
  onFee: (f: Fee) => void;
}) {
  const { onOpen, onRemoveFee, onHoldOn, pendingHands, onAskDone, drop } = actions;
  const name = feeName(fee.kind, fee.name);
  const isOpen = open.fee === fee.id;
  // the question of a thing being added, in place: above the fee's cases, or above its price where it has none
  const question = isOpen && ask ? <AskThing key={`${fee.id}:${ask}`} fee={fee} kind={ask} onFee={onFee} onDone={onAskDone} /> : null;
  const dot = feeColour(fee.kind).bg;
  const openParts = (spoken: string) =>
    open.view && (
      <>
        <OpenParts fee={fee} open={open.view} deal={deal} name={spoken} onFee={onFee} onHoldOn={(side, k, caseId, after) => onHoldOn(fee.id, side, k, caseId, after)} pendingHands={pendingHands} />
        {formLine}
      </>
    );
  const remove = isOpen ? { label: copy.panel.remove, onRemove: () => onRemoveFee(fee.id) } : undefined;
  // a case of the band takes a part; the slim fee takes a part or a thing; the band's block takes a thing, for the whole fee
  const caseZone = (caseId: string, key: string, el: ReactNode) => (
    <DropZone key={key} accepts={(it) => !isThing(it) && drop.accepts(fee.id, caseId, it)} onDrop={(it) => drop.onDrop(fee.id, caseId, it)}>
      {el}
    </DropZone>
  );

  if (!row) return <p className="text-sm text-muted-foreground">{b.unread}</p>;
  if (row.block.kind === "slim")
    return (
      <div className="flex flex-col gap-1.5">
        <DropZone accepts={(it) => drop.accepts(fee.id, null, it)} onDrop={(it) => drop.onDrop(fee.id, null, it)}>
          <SlimFee dot={dot} name={<>{name}</>} label={b.open(name)} open={isOpen} remove={remove} onOpen={() => onOpen(fee.id, null, "pointer")}>
            {question}
            {isOpen ? openParts(name) : row.block.parts.map((p) => <RestPart key={p.id} part={p} />)}
            {!isOpen && <RowStanding fee={row.fee} priced={row.priced} standing={row.standingNow} />}
          </SlimFee>
        </DropZone>
        {!isOpen && <RowNotes row={row} fee={fee} />}
      </div>
    );
  const band = row.block;
  if (!hasCases(fee)) return null;
  return (
    <DropZone accepts={(it) => isThing(it) && drop.accepts(fee.id, open.case, it)} onDrop={(it) => drop.onDrop(fee.id, open.case, it)}>
      <FeeBlock dot={dot} name={name} remove={remove}>
        {question}
        <FeeCases fee={fee} band={band} open={open} name={name} unfolded={unfolded} onUnfold={onUnfold} onFee={onFee} actions={actions} caseZone={caseZone} openParts={(spoken) => openParts(spoken)} />
      </FeeBlock>
    </DropZone>
  );
}
