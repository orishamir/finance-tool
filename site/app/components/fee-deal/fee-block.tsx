// One fee's block in the fees' column (method §10.6, `builder`'s `block`): a fee whose price changes by nothing is one slim line, its parts
// after its name, a later price's after the month the first ends; a fee whose price changes holds its cases laid out by its shape
// (fee-cases.tsx), every case shown. The fee or case open shows its slots, its parts with their
// boxes (`OpenParts`) and the actions on the case; while a fee is open, its bin stands beside its name, and the things of its head open
// their values. Each thing of the head has a bin beside it, the fee open or not. The question of a thing being added stands in the open
// fee's block, above its cases or its price. On a computer a part dragged from the toolbox drops on a slim fee or a case of the open fee,
// and a thing to change by on the open fee's block, or on one case's head, which splits that case alone (`ToolDrop`). A thing lifted by
// its grip drops on the places that take it (lifted.ts, `LiftHands`): every case, cell and head of the fee is one.
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { BuilderRow } from "../../lib/fee-deal/rows";
import type { OpenCase as OpenCaseView } from "../../lib/fee-deal/panel";
import { cardThing } from "../../lib/fee-deal/toolbox";
import { type Side } from "../../lib/fee-deal/model";
import { hasCases, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { keeps } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { DropZone, FeeBlock, Grip, SlimFee, type DropHow } from "../kit";
import { liftId, liftedOf, type Lifted, type LiftTarget } from "../../lib/fee-deal/lifted";
import { AskThing } from "./ask-thing";
import { FeeCases, RestPart, RowStanding } from "./fee-cases";
import { OpenParts, type PartGrip } from "./open-case";
import { EditHere } from "./edit-here";
import { ROW_OF } from "../../lib/fee-deal/part-rows";
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
  /** A change of a price with time taken away at its divider (change `k`, between price `k` and the next), kept for the undo. */
  onRemoveChange: (feeId: string, side: Side, k: number, caseId: string | undefined) => void;
  /** The person is in price `k` of the open case's prices over time (its parts took the focus or a press): the toolbox adds to it. */
  onEditPrice: (feeId: string, caseId: string | undefined, k: number) => void;
  /** A part the toolbox added that asks for what it needs: given or dropped, and whether its box takes the focus (`PendingHands`). */
  pendingHands: PendingHands;
  /** The question closed: the thing added, or not. */
  onAskDone: (added: boolean) => void;
  /** What a thing lifted by its grip does where it drops, and in the bin. */
  lift: LiftHands;
}

/** What the page does with a thing lifted by its grip (lifted.ts): where it drops, why a place does not take it, the bin, a knob's stretch. */
export interface LiftHands {
  takes: (l: Lifted, on: LiftTarget) => boolean;
  /** Why `on` does not take `l`, under the pointer (another fee whose kind does not take a part); null where it does, or says nothing. */
  why: (l: Lifted, on: LiftTarget) => string | null;
  onDrop: (l: Lifted, on: LiftTarget, how: DropHow) => void;
  binTakes: (l: Lifted) => boolean;
  onBin: (l: Lifted) => void;
  /** Whether the bin under fee `feeId` takes a carried item: a thing lifted from that fee that can be taken away. */
  binTakesItem: (feeId: string, item: string) => boolean;
  onBinItem: (item: string) => void;
  /** A knob's stretch: the fee after it, kept for the undo where it took a price (`words`, its line). */
  onStretch: (next: Fee, words: string | null) => void;
  /** The bin stands at the foot of the screen. */
  phone: boolean;
}

/** The thing to change by whose question stands in the open fee's block, and the case it splits alone; null where none is asked. */
export type AskOf = { kind: ByKind; split?: string } | null;

/** A drop zone around `el` for places `on` of one fee: the first that takes a carried thing gets it; a case also takes toolbox cards. */
export type ZoneOf = (on: LiftTarget[], key: string, el: ReactNode) => ReactNode;

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

/** The facts a slim line says at its end, in its card on a line of their own: that its price is not given yet or not read, its next change, where it is charged, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (row.banned || !row.priced) notes.push(<UnreadWords key="unread" banned={row.banned} noCurrency={row.noCurrency} notPrinted={row.notPrinted} unmatched={row.unmatched} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.priced && row.stages[0]!.price.form === "action" && keeps(fee.kind, "action", "min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="flex basis-full flex-col items-start gap-1 pb-1 text-sm text-muted-foreground">
      {notes.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/**
 * One fee's block (`row`, its view; none for a fee whose prices are out of order): its slim line or its band, the case open in place with
 * its parts and `formLine` (the undo line of its price put in another form) under them, and the question `ask` of a thing being added.
 */
export function FeeBlockView({
  fee,
  row,
  deal,
  open,
  ask,
  formLine,
  actions,
  onFee,
  onSplit,
  grip,
}: {
  fee: Fee;
  row: BuilderRow | undefined;
  deal: FeeDeal;
  open: OpenHere;
  ask: AskOf;
  formLine: ReactNode;
  actions: BlockActions;
  onFee: (f: Fee) => void;
  /** The fee with one case split by a thing (the question's answer), the deal kept read for the same situation (`keepPicks`). */
  onSplit: (f: Fee) => void;
  /** The fee's grip, which moves it within its group. */
  grip?: ReactNode;
}) {
  const { onOpen, onRemoveFee, onRemoveChange, onEditPrice, pendingHands, onAskDone, drop } = actions;
  const name = feeName(fee.kind, fee.name);
  const isOpen = open.fee === fee.id;
  // the question of a thing being added, in place: above the fee's cases, or above its price where it has none
  const question = isOpen && ask ? <AskThing key={`${fee.id}:${ask.kind}:${ask.split ?? ""}`} fee={fee} kind={ask.kind} {...(ask.split ? { split: ask.split } : {})} onFee={ask.split ? onSplit : onFee} onDone={onAskDone} /> : null;
  const dot = feeColour(fee.kind).bg;
  const openParts = (spoken: string) =>
    open.view && (
      <>
        <OpenParts fee={fee} open={open.view} deal={deal} name={spoken} onFee={onFee} onRemoveChange={(side, k, caseId) => onRemoveChange(fee.id, side, k, caseId)} onEditing={(k, caseId) => onEditPrice(fee.id, caseId, k)} pendingHands={pendingHands} grip={partGrip} />
        {formLine}
      </>
    );
  const remove = isOpen ? { label: copy.panel.remove, onRemove: () => onRemoveFee(fee.id) } : undefined;
  // a part of the open case's first price lifts onto another case or fee, or into the bin (its row's content: lifted.ts)
  const partGrip: PartGrip = (part, side, k) => {
    if (side !== "buy" || k !== 0) return null;
    const l: Lifted = { k: "part", fee: fee.id, case: open.case, row: ROW_OF[part] };
    const off = lift.binTakes(l);
    return <Grip item={liftId(l)} label={`${copy.cases.lifted.grip.part}${copy.cases.rowHeads[l.row] ?? ""}`} actions={off ? [{ label: copy.cases.lifted.menu.remove, danger: true, onPick: () => lift.onBin(l) }] : []} {...(off ? { onRemove: () => lift.onBin(l) } : {})} />;
  };
  // a case of the band takes a part, and a thing to change by, which splits it alone; the slim fee takes a part or a thing; the band's
  // block takes a thing, for the whole fee. Every place takes the things lifted by a grip it takes (`LiftHands.takes`).
  const lift = actions.lift;
  const zone: ZoneOf = (on, key, el) => {
    const card = on.find((t): t is Extract<LiftTarget, { k: "case" }> => t.k === "case");
    const first = (l: Lifted) => on.find((t) => lift.takes(l, t));
    return (
      <DropZone
        key={key}
        accepts={(it) => {
          const l = liftedOf(it);
          if (l) return !!first(l);
          return !!card && card.case !== null && drop.accepts(fee.id, card.case, it);
        }}
        onDrop={(it, how) => {
          const l = liftedOf(it);
          const t = l && first(l);
          if (l && t) lift.onDrop(l, t, how);
          else if (!l && card) drop.onDrop(fee.id, card.case, it);
        }}
        why={(it) => {
          const l = liftedOf(it);
          return l ? (on.map((t) => lift.why(l, t)).find((w) => w) ?? null) : null;
        }}
      >
        {el}
      </DropZone>
    );
  };
  const slimTarget: LiftTarget = { k: "case", fee: fee.id, case: null };

  if (!row) return <p className="text-sm text-muted-foreground">{b.unread}</p>;
  if (row.block.kind === "slim")
    return (
      <div className="flex flex-col gap-1.5">
        <DropZone
          accepts={(it) => {
            const l = liftedOf(it);
            return l ? lift.takes(l, slimTarget) : drop.accepts(fee.id, null, it);
          }}
          onDrop={(it, how) => {
            const l = liftedOf(it);
            if (l) lift.onDrop(l, slimTarget, how);
            else drop.onDrop(fee.id, null, it);
          }}
          why={(it) => {
            const l = liftedOf(it);
            return l ? lift.why(l, slimTarget) : null;
          }}
        >
          <SlimFee dot={dot} name={<>{name}</>} label={b.open(name)} open={isOpen} remove={remove} grip={grip} onOpen={() => onOpen(fee.id, null, "pointer")}>
            {question}
            {isOpen ? openParts(name) : <EditHere.Provider value={{ fee, cases: null, onFee }}>{row.block.parts.map((p) => <RestPart key={`${p.stage ?? 0}:${p.id}`} part={p} />)}</EditHere.Provider>}
            {!isOpen && <RowStanding fee={row.fee} priced={row.priced} standing={row.standingNow} />}
            {/* the line's notes stand in its card, under its prices, never between two cards */}
            {!isOpen && <RowNotes row={row} fee={fee} />}
          </SlimFee>
        </DropZone>
      </div>
    );
  const band = row.block;
  if (!hasCases(fee)) return null;
  return (
    <DropZone accepts={(it) => isThing(it) && drop.accepts(fee.id, open.case, it)} onDrop={(it) => drop.onDrop(fee.id, open.case, it)}>
      <FeeBlock dot={dot} name={name} remove={remove} grip={grip}>
        {question}
        <FeeCases fee={fee} band={band} open={open} name={name} onFee={onFee} actions={actions} zone={zone} openParts={(spoken) => openParts(spoken)} />
      </FeeBlock>
    </DropZone>
  );
}
