// One fee's block in the fees' column (method §10.6, `builder`'s `block`): a fee whose price changes by nothing is one slim line, its parts
// after its name, a later price's after the month the first ends; a fee whose price changes holds its cases laid out by its shape
// (fee-cases.tsx), every case shown. The fee or case open shows its slots, its parts with their
// boxes (`OpenParts`) and the actions on the case; while a fee is open, its bin stands beside its name. Each thing of the head opens its
// menu, the fee open or not: its values, and the action that stops the price changing by it. The question of a thing being added stands in the open
// fee's block, above its cases or its price. On a computer a part dragged from the toolbox drops on a place of the open case that can
// take it (a price, shown by its round "+", `PlaceHands`), or on another case where it has one place there; a thing to change by on the
// open fee's block, or on one case's head, which splits that case alone (`ToolDrop`); a part dropped on the parts said once for every
// case, or on a grid row's head, does what its tap does with the toolbox on those cases (`CasesTarget`). A thing lifted by its grip drops
// on the places that take it (lifted.ts, `LiftHands`): every case, cell and head of the fee is one.
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { BuilderRow } from "../../lib/fee-deal/rows";
import type { OpenCase as OpenCaseView } from "../../lib/fee-deal/panel";
import { cardThing, type CasesTarget } from "../../lib/fee-deal/toolbox";
import type { CasesAsk } from "../../lib/fee-deal/every-case";
import { type Side } from "../../lib/fee-deal/model";
import { hasCases, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { keeps } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { DropZone, FeeBlock, Grip, SlimFee, type DropHow, type SortOf } from "../kit";
import { liftId, liftedOf, type Lifted, type LiftResult, type LiftTarget } from "../../lib/fee-deal/lifted";
import { AskThing } from "./ask-thing";
import { FeeCases, RestPart, RowStanding } from "./fee-cases";
import { OpenParts, type PartGrip, type PlaceHands } from "./open-case";
import { EditHere } from "./edit-here";
import { ROW_OF } from "../../lib/fee-deal/part-rows";
import type { Note } from "../../lib/fee-deal/core";
import { type PendingHands } from "./part-edit";
import { FEE_MARK, UnpricedNote, UnreadWords, feeColour, feeName } from "./words";
import { WHOLE } from "../../lib/fee-deal/layout";

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
  /** The thing of a band's head whose menu is open, the fee open or not: its fee, and its place among the fee's things. */
  thing: { fee: string; t: number } | null;
  /**
   * The several cases of the open fee the toolbox adds to at once, in place of an open case (`case` and `view` then null), each drawn
   * as open; and what a part it added still asks of them all, asked once in their place (`ask`).
   */
  several: { target: CasesTarget; ask: CasesAsk | null } | null;
}

/** What a fee's block hands to the page: a fee or a case opened, a slot or a thing tapped, a case or a later price taken away, a part asked. */
export interface BlockActions {
  /** A fee or a case opened in place, and how: by the pointer, or the keyboard (its first box then takes the focus). */
  onOpen: (feeId: string, caseId: string | null, by: "pointer" | "keyboard") => void;
  /** A slot of the open case tapped, at the chip it opens from; again, its menu closes. */
  onSlot: (t: number, at: HTMLElement) => void;
  /** A thing of a fee's band head tapped, at its chip, the fee open or not; again, its menu closes. */
  onThing: (feeId: string, t: number, at: HTMLElement) => void;
  onRemoveCase: (feeId: string, caseId: string) => void;
  /** The open fee's bin: the fee taken away, kept for the undo. */
  onRemoveFee: (feeId: string) => void;
  /** Where a part or a thing dragged from the toolbox drops. */
  drop: ToolDrop;
  /** A change of a price with time taken away at its divider (change `k`, between price `k` and the next), kept for the undo. */
  onRemoveChange: (feeId: string, side: Side, k: number, caseId: string | undefined) => void;
  /** A price's charge taken away by its bin (price `k` on `side`): the price free, kept for the undo. */
  onRemoveCharge: (feeId: string, caseId: string | undefined, side: Side, k: number) => void;
  /** Where the open case's places take toolbox cards: the card held, and a card carried. */
  places: PlaceHands;
  /** A part the toolbox added that asks for what it needs: given or dropped, and whether its box takes the focus (`PendingHands`). */
  pendingHands: PendingHands;
  /** The question closed: the thing added, or not. */
  onAskDone: (added: boolean) => void;
  /** What a thing lifted by its grip does where it drops, and in the bin. */
  lift: LiftHands;
  /** The toolbox opened on several of a fee's cases at once (`onOpen`), and what a part it added asks of them, set or, given or dropped, cleared (`onAsk`). */
  cases: { onOpen: (target: CasesTarget) => void; onAsk: (ask: CasesAsk | null) => void };
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
  /** What a drop of `l` on `on` would do, drawn on the page while the thing is over it; null: the deal as it is again. */
  preview: (drop: { l: Lifted; on: LiftTarget; how: DropHow } | null) => void;
  /** A change made of the deal as it is (a paste, the cells chosen taken away), kept for the undo where it took something (`kept`, its line). */
  onResult: (make: (deal: FeeDeal) => LiftResult | null) => void;
  /** The bin stands at the foot of the screen. */
  phone: boolean;
}

/** The thing to change by whose question stands in the open fee's block, and the case it splits alone; null where none is asked. */
export type AskOf = { kind: ByKind; split?: string } | null;

/**
 * A drop zone around `el` for places `on` of one fee: the first that takes a carried thing gets it, and shows what it would do while the
 * thing is over it; a case also takes toolbox cards, and so does a head over several cases the toolbox can add to at once (`cases`, a
 * grid's row). `sort`: the place is a member of a sortable list (a table's columns, a grid's rows).
 */
export type ZoneOf = (on: LiftTarget[], key: string, el: ReactNode, sort?: SortOf, cases?: CasesTarget) => ReactNode;

/**
 * A toolbox card dropped in the fees' column (its id, `ToolPart.id`): whether the open fee's case `caseId` (null for a slim fee, or the fee
 * as a whole) takes it, and what its tap does there. A card that goes on a price of the open case drops on that price (`PlaceHands`).
 */
export interface ToolDrop {
  accepts: (feeId: string, caseId: string | null, item: string) => boolean;
  onDrop: (feeId: string, caseId: string | null, item: string) => void;
  /**
   * The same on several cases of the open fee (the parts said once for every case, a grid row's head): it takes a part its tap would add
   * there with the toolbox on those cases (toolbox.ts `casesTool`), and its drop opens the toolbox on them and does what the tap does.
   */
  acceptsCases: (target: CasesTarget, item: string) => boolean;
  onDropCases: (target: CasesTarget, item: string) => void;
}

/**
 * A head that covers the open case, its part applied to all its cases from the part's menu: its words ("להחיל על כל השורה") and its place
 * (lifted.ts's `cases` target).
 */
export interface HeadApply {
  label: string;
  on: LiftTarget;
}

/** A thing to change by among the toolbox's cards (`cardThing`): it drops on the fee's block; a part drops on a slim fee or a case. */
const isThing = (item: string): boolean => cardThing(item) !== null;

/**
 * The facts a slim line says at its end, in its card on a line of their own: that its price is not given yet (`UnpricedNote`, whose link
 * `onOpen` opens the price) or not read, its next change, where it is charged, its bounds.
 */
function RowNotes({ row, fee, onOpen }: { row: BuilderRow; fee: Fee; onOpen: () => void }) {
  const notes: ReactNode[] = [];
  if (row.unpriced) notes.push(<UnpricedNote key="unread" fee={fee} unpriced={row.unpriced} onOpen={onOpen} />);
  else if (row.banned || !row.priced) notes.push(<UnreadWords key="unread" banned={row.banned} noCurrency={row.noCurrency} notPrinted={row.notPrinted} unmatched={row.unmatched} />);
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
 * its parts and `formLine` (the undo line of its price made free by its charge's bin) under them, and the question `ask` of a thing being added.
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
  corner,
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
  /** Closed, the knobs in its card's corner (its bin, its duplicate). */
  corner?: ReactNode;
}) {
  const { onOpen, onRemoveFee, onRemoveChange, onRemoveCharge, pendingHands, onAskDone, drop } = actions;
  const name = feeName(fee.kind, fee.name, row?.house);
  const isOpen = open.fee === fee.id;
  // the question of a thing being added, in place: above the fee's cases, or above its price where it has none
  const question = isOpen && ask ? <AskThing key={`${fee.id}:${ask.kind}:${ask.split ?? ""}`} fee={fee} kind={ask.kind} {...(ask.split ? { split: ask.split } : {})} onFee={ask.split ? onSplit : onFee} onDone={onAskDone} /> : null;
  const dot = feeColour(fee.kind, row?.house).bg;
  const openParts = (spoken: string, heads: readonly HeadApply[] = []) =>
    open.view && (
      <>
        <OpenParts fee={fee} open={open.view} deal={deal} name={spoken} onFee={onFee} onRemoveChange={(side, k, caseId) => onRemoveChange(fee.id, side, k, caseId)} onRemoveCharge={(side, k, caseId) => onRemoveCharge(fee.id, caseId, side, k)} places={actions.places} pendingHands={pendingHands} grip={partGrip(heads)} />
        {formLine}
      </>
    );
  const remove = isOpen ? { label: copy.panel.remove, onRemove: () => onRemoveFee(fee.id) } : undefined;
  // a part of the open case's first price lifts onto another case or fee, onto a head (every case of it), or into the bin (its row's
  // content, a note alone: lifted.ts); its menu applies it to each head over the open case that takes it (`heads`), as a drop there does
  const partGrip = (heads: readonly HeadApply[]): PartGrip => (part, side, k) => {
    if (side !== "buy" || k !== 0) return null;
    const row = ROW_OF[part];
    const l: Lifted = { k: "part", fee: fee.id, case: open.case, row, ...(row === "notes" ? { note: part as Note } : {}) };
    const off = lift.binTakes(l);
    const wide = heads.filter((h) => lift.takes(l, h.on)).map((h) => ({ label: h.label, onPick: () => lift.onDrop(l, h.on, { copy: false }) }));
    return <Grip item={liftId(l)} label={`${copy.cases.lifted.grip.part}${copy.cases.rowHeads[l.row] ?? ""}`} actions={[...wide, ...(off ? [{ label: copy.cases.lifted.menu.remove, danger: true, onPick: () => lift.onBin(l) }] : [])]} {...(off ? { onRemove: () => lift.onBin(l) } : {})} />;
  };
  // a case of the band takes a part, and a thing to change by, which splits it alone; the slim fee takes a part or a thing; the band's
  // block takes a thing, for the whole fee. Every place takes the things lifted by a grip it takes (`LiftHands.takes`).
  const lift = actions.lift;
  const zone: ZoneOf = (on, key, el, sort, cases) => {
    const card = on.find((t): t is Extract<LiftTarget, { k: "case" }> => t.k === "case");
    // the cell a thing was lifted from takes nothing of it: its case under it would take a line over several cases as a drop on that case
    const own = (l: Lifted) => l.k === "cell" && on[0]?.k === "cell" && on[0].fee === l.fee && on[0].row === l.row && on[0].cases.join() === l.cases.join();
    // a part or a cell's part line lands only where it is dropped, in a case's own cell: a head or the band, which would put it in every
    // case under it, takes neither while carried (the grip's menu applies a part to a row or a column instead); a toolbox card a grid row's
    // head takes adds only what then stands in every case of the row alike (`cases`)
    const partLike = (l: Lifted) => l.k === "part" || (l.k === "cell" && l.row !== WHOLE);
    const first = (l: Lifted) => (own(l) ? undefined : on.find((t) => !(t.k === "cases" && partLike(l)) && lift.takes(l, t)));
    // a toolbox card: a case's cell takes it, and a head over several cases the toolbox can add to at once
    const toolTakes = (it: string) => (!!card && card.case !== null && drop.accepts(fee.id, card.case, it)) || (!!cases && drop.acceptsCases(cases, it));
    // a member of its list only for the heads its first place takes (a row among the rows); anything else, a part or a cell (a case alone
    // in its row moves its row onto the head it drops on), drops on it as a plain place
    const sortFor = sort && ((it: string) => {
      const l = liftedOf(it);
      return l && l.k !== "cell" && lift.takes(l, on[0]!) ? sort : null;
    });
    return (
      <DropZone
        key={key}
        {...(sortFor ? { sort: sortFor } : {})}
        onPreview={(it, how) => {
          const l = it === null ? null : liftedOf(it);
          const t = l && first(l);
          lift.preview(l && t ? { l, on: t, how } : null);
        }}
        accepts={(it) => {
          const l = liftedOf(it);
          if (l) return !!first(l);
          return toolTakes(it);
        }}
        onDrop={(it, how) => {
          const l = liftedOf(it);
          const t = l && first(l);
          if (l && t) lift.onDrop(l, t, how);
          else if (!l && card) drop.onDrop(fee.id, card.case, it);
          else if (!l && cases) drop.onDropCases(cases, it);
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
          onPreview={(it, how) => {
            const l = it === null ? null : liftedOf(it);
            lift.preview(l && lift.takes(l, slimTarget) ? { l, on: slimTarget, how } : null);
          }}
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
          <SlimFee dot={dot} mark={FEE_MARK[fee.kind]} name={<>{name}</>} label={b.open(name)} open={isOpen} remove={remove} grip={grip} corner={corner} onOpen={() => onOpen(fee.id, null, "pointer")}>
            {question}
            {isOpen ? (
              openParts(name)
            ) : (
              <EditHere.Provider value={{ fee, cases: null, onFee }}>
                {row.block.parts.map((p) => (
                  <RestPart key={`${p.stage ?? 0}:${p.id}`} part={p} />
                ))}
              </EditHere.Provider>
            )}
            {!isOpen && <RowStanding fee={row.fee} priced={row.priced} standing={row.standingNow} />}
            {/* the line's notes stand in its card, under its prices, never between two cards */}
            {!isOpen && <RowNotes row={row} fee={fee} onOpen={() => onOpen(fee.id, null, "pointer")} />}
          </SlimFee>
        </DropZone>
      </div>
    );
  const band = row.block;
  const unpriced = row.unpriced;
  if (!hasCases(fee)) return null;
  return (
    <DropZone accepts={(it) => isThing(it) && drop.accepts(fee.id, open.case, it)} onDrop={(it) => drop.onDrop(fee.id, open.case, it)}>
      <FeeCases fee={fee} band={band} open={open} name={name} deal={deal} onFee={onFee} actions={actions} zone={zone} openParts={(spoken, heads) => openParts(spoken, heads)}>
        {(cases) => (
          <FeeBlock dot={dot} mark={FEE_MARK[fee.kind]} name={name} remove={remove} open={isOpen} grip={grip} corner={corner}>
            {/* a price not given: under the name's line, naming the cases missing it, its link opening the first */}
            {unpriced && <UnpricedNote fee={fee} unpriced={unpriced} onOpen={() => onOpen(fee.id, unpriced.cases[0] ?? null, "pointer")} />}
            {question}
            {cases}
          </FeeBlock>
        )}
      </FeeCases>
    </DropZone>
  );
}
