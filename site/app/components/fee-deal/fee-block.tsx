// One fee's block in the fees' column (method §10.6, `builder`'s `block`): a fee whose price changes by nothing is one slim line, its parts
// after its name; a fee whose price changes holds one band, a row per case, the tracks that are not the person's folded into one line,
// each case's standing against the cap after its parts. The fee or case open in place shows its slots, its parts with their boxes
// (`OpenParts`) and the actions on the case; while a fee is open, its bin stands beside its name, and the things of its band's head open
// their values, each with a bin beside it. The question of a thing being added stands in the open fee's block, above its cases or its
// price. On a computer a part dragged from the toolbox drops on a slim fee or a case of the open fee, and a thing to change by on the open
// fee's block (`ToolDrop`).
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { BuilderRow, CaseRow as CaseRowView } from "../../lib/fee-deal/rows";
import type { OpenCase as OpenCaseView } from "../../lib/fee-deal/panel";
import { cardThing } from "../../lib/fee-deal/toolbox";
import type { SlimPart, WhenWords } from "../../lib/fee-deal/case-words";
import { addCase, copyCase } from "../../lib/fee-deal/edits/case";
import { type Side } from "../../lib/fee-deal/model";
import { hasCases, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import type { StandingView } from "../../lib/fee-deal/deal-read";
import { keeps, type ChargedForm } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { fmt } from "../../lib/format";
import { CaseFold, CaseRow, CaseSlot, ConditionBand, DropZone, FeeBlock, OpenCase, PartChip, SlimFee, When, monthText, type CaseWord } from "../kit";
import { Num } from "../provenance";
import { AskThing } from "./ask-thing";
import { LawTag } from "./links";
import { OpenParts, WhenText, whenText } from "./open-case";
import { PART_MARK, type PendingHands } from "./part-edit";
import { Fig, UnreadWords, feeColour, feeName } from "./words";

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
  /** A thing's bin in the open fee's band head: the price stops changing by it, kept for the undo. */
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

/** A case's value for each thing in plain words, joined, for its spoken name and the toolbox's line ("בחו״ל, בארה״ב · מסלול 1"). */
export const caseText = (when: readonly WhenWords[]): string => when.map(whenText).join(copy.cases.sep);

/** A case's value for each thing as a band row says it: the person's track marked "שלכם", a range's step with the range's icon. */
const caseWords = (when: readonly WhenWords[], mine: boolean, things: readonly { kind: string }[]): CaseWord[] =>
  when.map((w) => ({ text: <WhenText words={w} />, ...(w.any ? { any: true } : {}), ...(w.figure ? { range: true } : {}), ...(mine && things[w.thing]?.kind === "track" ? { mine: true } : {}) }));

/**
 * A price's standing against the cap now, after its parts (a slim fee's, or a case's in the band): the share of the cap or the standing's
 * tag; a later price's standing is said with that price, and the row's next change is in its notes. A tag leads to the fee's row of the
 * law card; a share opens its calculation. Nothing for a price not given yet.
 */
function RowStanding({ fee, priced, standing }: { fee: string; priced: boolean; standing: StandingView }) {
  if (!priced) return null;
  const now = standing.standing;
  if (now.judged && now.standing === "below" && standing.share)
    return (
      <span className="text-sm text-muted-foreground">
        <Num value={standing.share} display={fmt.share} />
        {copy.standing.shareShort}
      </span>
    );
  if (now.judged) return <LawTag fee={fee} standing={standing} />;
  return null;
}

/** A part at rest, in a slim line or a case's row: its icon and first word, its figure in its own state, and the words after it. */
function RestPart({ part }: { part: SlimPart }) {
  const w = part.words;
  const tail = [w.tail, w.quiet].filter(Boolean).join("").trim();
  return (
    <PartChip kind={part.kind} mark={PART_MARK[part.id]} lead={w.lead?.trim()} figure={w.figure ? <Fig value={w.figure} /> : undefined} words={tail || undefined}>
      {w.mid && <span className="text-muted-foreground">{w.mid.trim()}</span>}
      {w.second && <Fig value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
    </PartChip>
  );
}

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
  const { onOpen, onSlot, onThing, onRemoveCase, onRemoveFee, onRemoveBy, onHoldOn, pendingHands, onAskDone, drop } = actions;
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
  // "+ עוד מקרה" copies the open case, else the last, and opens the copy; a case's copy opens right after it
  const addOne = () => {
    const next = addCase(fee, isOpen ? (open.case ?? undefined) : undefined);
    if (!hasCases(next)) return;
    onFee(next);
    onOpen(fee.id, next.cases.at(-1)!.id, "pointer");
  };
  const copyOpen = (caseId: string) => {
    const next = copyCase(fee, caseId);
    if (!hasCases(next)) return;
    onFee(next);
    onOpen(fee.id, next.cases[next.cases.findIndex((c) => c.id === caseId) + 1]!.id, "pointer");
  };

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
  const things = band.things.map((t) => ({ id: String(t.thing), name: t.words, removeLabel: copy.cases.thingMenu.stop.replace("{thing}", t.words) }));
  const byId = new Map([...band.rows, ...(band.folded?.rows ?? [])].map((r) => [r.case, r]));
  const folded = new Set(band.folded?.rows.map((r) => r.case));
  const caseRow = (r: CaseRowView) => {
    if (r.open && open.view) {
      const ov = open.view;
      return caseZone(
        r.case,
        r.case,
        <OpenCase
          slots={ov.slots.map((sl) => (
            <CaseSlot key={sl.thing} range={!!sl.words.figure} open={open.menu === sl.thing} onOpen={(at) => onSlot(sl.thing, at)}>
              <WhenText words={sl.words} />
            </CaseSlot>
          ))}
          mine={ov.slots.some((sl) => sl.mine)}
          {...(ov.canCopy ? { onCopy: () => copyOpen(r.case) } : {})}
          {...(ov.canRemove ? { onRemove: () => onRemoveCase(fee.id, r.case) } : {})}
        >
          {openParts(`${name}, ${caseText(r.when)}`)}
        </OpenCase>,
      );
    }
    return caseZone(
      r.case,
      r.case,
      <CaseRow when={caseWords(r.when, r.mine, band.things)} label={`${copy.cases.openCase}${caseText(r.when)}`} onOpen={() => onOpen(fee.id, r.case, "pointer")}>
        {r.parts.map((p) => (
          <RestPart key={p.id} part={p} />
        ))}
        <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
      </CaseRow>,
    );
  };
  // the band's rows in the fee's order of cases, the folded ones as one line where the first of them stands
  const items: ReactNode[] = [];
  let foldPlaced = false;
  for (const c of fee.cases) {
    if (!folded.has(c.id)) {
      const r = byId.get(c.id);
      if (r) items.push(caseRow(r));
      continue;
    }
    if (foldPlaced) continue;
    foldPlaced = true;
    items.push(
      <CaseFold key="fold" label={band.folded!.words} open={unfolded} onToggle={() => onUnfold(!unfolded)}>
        {band.folded!.rows.map(caseRow)}
      </CaseFold>,
    );
  }
  return (
    <DropZone accepts={(it) => isThing(it) && drop.accepts(fee.id, open.case, it)} onDrop={(it) => drop.onDrop(fee.id, open.case, it)}>
      <FeeBlock dot={dot} name={name} remove={remove}>
        {question}
        <ConditionBand
          things={things}
          {...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing), onRemoveThing: (id: string) => onRemoveBy(fee.id, Number(id)) } : {})}
          addCase={{ onAdd: addOne }}
        >
          {items}
        </ConditionBand>
      </FeeBlock>
    </DropZone>
  );
}
