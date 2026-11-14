// One fee's block in the fees' column (method §10.6, `builder`'s `block`): a fee whose price changes by nothing is one slim line, its parts
// after its name; a fee whose price changes holds one band, a row per case, the tracks that are not the person's folded into one line,
// each case's standing against the cap after its parts. The fee or case open in place shows its slots, its parts with their boxes
// (`OpenParts`) and the actions on the case; while a fee is open, the things of its band's head open their values. The question of a thing
// being added stands in the open fee's block, above its cases or its price.
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { BuilderRow, CaseRow as CaseRowView, OpenCase as OpenCaseView, SlimPart, WhenWords } from "../../lib/fee-deal/builder";
import { addCase, copyCase, type Side } from "../../lib/fee-deal/edit";
import { hasCases, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import type { StandingView } from "../../lib/fee-deal/parts";
import { keeps } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { fmt } from "../../lib/format";
import { CaseFold, CaseRow, CaseSlot, ConditionBand, FeeBlock, OpenCase, PartChip, SlimFee, When, monthText, type CaseWord } from "../kit";
import { Num } from "../provenance";
import { AskThing } from "./ask-thing";
import { LawTag } from "./links";
import { OpenParts, WhenText, numText } from "./open-case";
import { PART_MARK, type PendingPart } from "./part-edit";
import { BannedWords, Fig, feeColour, feeName } from "./words";

const b = copy.builder;

/** What the page holds for the case open in place, and what a fee's block does with it. */
export interface OpenHere {
  /** The open fee's id, and its open case (null for a slim fee). */
  fee: string | null;
  case: string | null;
  /** The open case as the panel builds it (`panel(...).open`). */
  view: OpenCaseView | null;
  /** A part the toolbox added that asks for its figure, month or fee in the open case. */
  pending: PendingPart | null;
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
  onHoldOn: (feeId: string, side: Side, k: number, caseId?: string) => void;
  onPendingDone: () => void;
  /** The question closed: the thing added, or not. */
  onAskDone: (added: boolean) => void;
}

/** A case's value for each thing in plain words, joined, for its spoken name and the toolbox's line ("בחו״ל, בארה״ב · מסלול 1"). */
export const caseText = (when: readonly WhenWords[]): string => when.map((w) => (w.figure ? `${w.lead ?? ""}${numText(w.figure)}` : (w.text ?? ""))).join(copy.cases.sep);

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
  if (row.banned) notes.push(<BannedWords key="banned" rules={row.banned} />);
  else if (!row.priced) notes.push(row.noCurrency ? copy.cases.noCurrency : row.unmatched ? copy.cases.unmatched : b.facts.noPrice);
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
  const { onOpen, onSlot, onThing, onRemoveCase, onHoldOn, onPendingDone, onAskDone } = actions;
  const name = feeName(fee.kind, fee.name);
  const isOpen = open.fee === fee.id;
  // the question of a thing being added, in place: above the fee's cases, or above its price where it has none
  const question = isOpen && ask ? <AskThing key={`${fee.id}:${ask}`} fee={fee} kind={ask} onFee={onFee} onDone={onAskDone} /> : null;
  const dot = feeColour(fee.kind).bg;
  const openParts = (spoken: string) =>
    open.view && (
      <>
        <OpenParts fee={fee} open={open.view} deal={deal} name={spoken} pending={open.pending} onFee={onFee} onHoldOn={(side, k, caseId) => onHoldOn(fee.id, side, k, caseId)} onPendingDone={onPendingDone} />
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

  if (!row) return <p className="text-sm text-muted-foreground">{b.unread}</p>;
  if (row.block.kind === "slim")
    return (
      <div className="flex flex-col gap-1.5">
        <SlimFee dot={dot} name={<>{name}</>} label={b.open(name)} open={isOpen} onOpen={() => onOpen(fee.id, null, "pointer")}>
          {question}
          {isOpen ? openParts(name) : row.block.parts.map((p) => <RestPart key={p.id} part={p} />)}
          {!isOpen && <RowStanding fee={row.fee} priced={row.priced} standing={row.standingNow} />}
        </SlimFee>
        {!isOpen && <RowNotes row={row} fee={fee} />}
      </div>
    );
  const band = row.block;
  if (!hasCases(fee)) return null;
  const things = band.things.map((t) => ({ id: String(t.thing), name: t.words }));
  const byId = new Map([...band.rows, ...(band.folded?.rows ?? [])].map((r) => [r.case, r]));
  const folded = new Set(band.folded?.rows.map((r) => r.case));
  const caseRow = (r: CaseRowView) => {
    if (r.open && open.view) {
      const ov = open.view;
      return (
        <OpenCase
          key={r.case}
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
        </OpenCase>
      );
    }
    return (
      <CaseRow key={r.case} when={caseWords(r.when, r.mine, band.things)} label={`${copy.cases.openCase}${caseText(r.when)}`} onOpen={() => onOpen(fee.id, r.case, "pointer")}>
        {r.parts.map((p) => (
          <RestPart key={p.id} part={p} />
        ))}
        <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
      </CaseRow>
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
    <FeeBlock dot={dot} name={name}>
      {question}
      <ConditionBand things={things} {...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {})} addCase={{ onAdd: addOne }}>
        {items}
      </ConditionBand>
    </FeeBlock>
  );
}
