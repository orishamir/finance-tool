// The toolbox for the case open in place (method §10.6, `toolbox`), or for several of the open fee's cases at once (`casesToolbox`): on a
// computer the column "העמלה שבחרתם", the fee's name as its head and the parts to add in groups by kind, and at its end filling the fee
// from a price list; on a phone the same in the short sheet pinned to the foot of the screen. A case's toolbox names it in its first line;
// a slim fee's has none. A card adds, but "חינם", which makes a price free. A tap on one goes to the page (`onCard`): on the open case, a card with one place goes there at
// once and one with several is held, the toolbox's line then saying what is being added with its "ביטול" (`held`), until a tap on its
// landing copy in the block picks the place (places.ts); on several cases at once it does what `casesTool` says. At its place a card does
// what `toolStep` says, which the page carries out (`applyTool`) and draws ahead as the card's landing copy: a thing to change by asks its
// question in the fee's block (`AskThing`), and a tap on one the fee changes by already stops it, as its bin in the band does; the line
// "+ התאריך" asks, at the foot of its side's prices, the month a price changes from; a part that needs its figure, month or fee first asks for
// it there (`onPending`); a charge goes on a price that charges nothing, its figure blank and focused, and "חינם" on a price that charges
// something, in place of its charge and its parts, kept for the undo as the bin of the charge keeps it (`onCharge`); any other part goes on
// the price at once. A card off there is greyed, its group saying why. A card dragged onto a place does the same there.
import type { ReactNode, RefObject } from "react";
import { feeDeal as copy } from "../../copy";
import { cardThing, type Toolbox as ToolboxView, type ToolPart as ToolPartView } from "../../lib/fee-deal/toolbox";
import { setFeeName } from "../../lib/fee-deal/edits/deal";
import { isFormPart, isPending, setPart, type FormPart, type PartId, type PendingPart } from "../../lib/fee-deal/offers/parts";
import { partAt, waitAt, type Place } from "../../lib/fee-deal/places";
import { openCase, type PendingAt } from "../../lib/fee-deal/panel";
import type { DealRead } from "../../lib/fee-deal/deal-read";
import { NAME_MAX, pricedOf, type Fee, type Side } from "../../lib/fee-deal/model";
import { capacity } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { termKey } from "../../lib/fee-page-data";
import { IconCalendar, IconClose, IconPencil } from "../icons";
import { Button, Card, HelpMark, MenuPicker, Section, Swatch, Tag, TextField, Toolbox, cx, useStickyColumn, type ToolGroup, type ToolKind } from "../kit";
import { useProvenanceData } from "../provenance";
import { UndoLine } from "./undo-line";
import { caseText } from "./fee-cases";
import type { Landed } from "./open-case";
import { FeeName, feeColour, feeName } from "./words";

const p = copy.panel;

/** The kit's kind of each of the view's groups: what the price changes by takes the band's colour. */
const KIND: Record<ToolboxView["groups"][number]["group"], ToolKind> = { charge: "charge", off: "off", bound: "bound", by: "when", rule: "rule" };

/**
 * A part's card in words, a figure it asks for said by its sign where its words would not: "% לכל פעולה", "הנחה % מהמחיר", "החזר ₪"; a
 * minimum's and a maximum's sum come with the choice of its currency, so they say no sign (founder, 2026-11-20).
 */
export function partLabel(part: ToolPartView): string {
  const w = part.words;
  const bound = part.id === "min" || part.id === "max";
  const sign = bound ? "" : part.box === "pct" ? "%" : typeof part.box === "object" ? part.box.sign : "";
  return [w.lead?.trim(), sign, w.tail?.trim()].filter(Boolean).join(" ");
}

/**
 * Why the cards of a group that cannot be added cannot, under it: one sentence where they share one reason, else each reason after the
 * names of its cards ("מינימום, מקסימום: …"), one to a line.
 */
function offWhy(g: ToolboxView["groups"][number]): ReactNode {
  const off = [...g.parts.flatMap((x) => (x.off ? [{ label: partLabel(x), why: x.off }] : [])), ...g.lines.flatMap((l) => (l.off ? [{ label: l.words, why: l.off }] : []))];
  const whys = [...new Set(off.map((x) => x.why))];
  if (whys.length < 2) return whys[0];
  return whys.map((w) => (
    <span key={w} className="block">
      {off.filter((x) => x.why === w).map((x) => x.label).join(", ")}
      {copy.cases.offOf}
      {w}
    </span>
  ));
}

/** The view's groups as the kit's: each part's card in words, its lines (the month the price changes from, with the calendar's mark), and why a card that cannot be added cannot. */
function kitGroups(view: ToolboxView): ToolGroup[] {
  return view.groups.map((g) => {
    const why = offWhy(g);
    return {
      id: g.group,
      kind: KIND[g.group]!,
      name: g.head,
      // a thing the fee changes by already is taken away by a tap, as its bin in the band does
      parts: g.parts.map((x) => ({ id: x.id, label: partLabel(x), used: x.used, off: !!x.off, ...(x.row ? { row: copy.cases.byRows[x.row] } : {}), ...(x.used && x.kind === "by" && x.words.lead ? { removeLabel: copy.cases.thingMenu.stop.replace("{thing}", x.words.lead) } : {}) })),
      ...(g.lines.length ? { lines: g.lines.map((l) => ({ id: l.id, label: l.words, icon: <IconCalendar size={16} />, ...(l.off ? { off: true } : {}) })) } : {}),
      ...(why ? { offWhy: why } : {}),
    };
  });
}

/** What a toolbox card does at its place: a thing to change by asks its question, a part that asks first asks there, a charge goes through the page. */
export interface ToolHands {
  onAsk: (kind: ByKind) => void;
  onPending: (part: PendingPart, place: Place) => void;
  /**
   * A form of the price put on through the page: a charge on a price that charges nothing, the focus then in its blank figure; "חינם" on a
   * price that charges something, kept for the undo, whose line says so.
   */
  onCharge: (part: FormPart, place: Place) => void;
  /** A part that goes on at once: the fee with it, and the part and the price it went on, which take the focus. */
  onPart: (next: Fee, at: { part: PartId; side: Side; k: number }) => void;
}

/**
 * What a toolbox card (`item`, its id) does at place `place` of case `caseId` of `fee` (null for a slim fee), as a step the page carries
 * out (`applyTool`) or draws ahead as its landing copy: a thing to change by asks its question (`ask`); a part that needs its figure,
 * month or fee asks for it there (`pending`); a charge goes on the price through the page (`charge`); any other part goes on at once
 * (`part`: the fee with it, and the part and the price it went on).
 */
type ToolStep =
  | { k: "ask"; kind: ByKind }
  | { k: "pending"; part: PendingPart; place: Place }
  | { k: "charge"; part: FormPart; place: Place }
  | { k: "part"; fee: Fee; at: { part: PartId; side: Side; k: number } };

function toolStep(item: string, fee: Fee, caseId: string | null, place: Place): ToolStep {
  const thing = cardThing(item);
  if (thing) return { k: "ask", kind: thing };
  const id = item as PartId;
  if (isPending(id)) return { k: "pending", part: id, place };
  if (isFormPart(id)) return { k: "charge", part: id, place };
  const at = place.on === "price" ? { side: place.side, k: place.k } : { side: "buy" as const, k: 0 };
  return { k: "part", fee: setPart(fee, id, true, partAt(place, caseId)), at: { part: id, ...at } };
}

/**
 * What card `item`'s tap at place `place` of case `caseId` of `fee` would leave there (`toolStep`, carried out on nothing), for its landing
 * copy: the fee then and its open case then (`openCase`, read with `read`), a part that asks then asking at its place, a charge as the
 * page would put it on (`formAfter`: the page's own change of form), any other part with the part waiting now (`pending`) still waiting
 * where it still can; null where the card changes no price there (a thing to change by asks its question).
 */
export function landingOf(read: DealRead, fee: Fee, caseId: string | null, item: string, place: Place, pending: PendingAt | null, formAfter: (part: FormPart, at: { side: Side; k: number }) => Fee | null): Landed | null {
  const on = caseId ?? undefined;
  const s = toolStep(item, fee, caseId, place);
  const landed = (next: Fee | null, waiting: PendingAt | null): Landed | null => (next ? { fee: next, open: openCase(read, next, on, waiting) } : null);
  if (s.k === "pending") return landed(fee, waitAt(pricedOf(fee, on), s.part, s.place));
  if (s.k === "charge") return s.place.on === "price" ? landed(formAfter(s.part, { side: s.place.side, k: s.place.k }), pending) : null;
  if (s.k === "part") return s.fee === fee ? null : landed(s.fee, pending);
  return null;
}

/** What a toolbox card does at its place, by tap or drop alike (`toolStep`), carried out through the page's hands. */
export function applyTool(item: string, fee: Fee, caseId: string | null, place: Place, hands: ToolHands): void {
  const s = toolStep(item, fee, caseId, place);
  if (s.k === "ask") return hands.onAsk(s.kind);
  if (s.k === "pending") return hands.onPending(s.part, s.place);
  if (s.k === "charge") return hands.onCharge(s.part, s.place);
  hands.onPart(s.fee, s.at);
}

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/** The page's undo line of the fee just filled from a price list, in the foot where the fill was chosen. */
export interface FillUndoLine {
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
}

/**
 * The toolbox for the open case of `fee`, or for several of its cases at once: the column on a computer (`sheet` false), the pinned short
 * sheet on a phone. `view` is the toolbox's view (`toolbox`, `casesToolbox`); `product` the deal's product, whose sense of the fee's name
 * "מה זה" opens; `fill` the price lists that can fill it; `line` the undo line of a fill just made; `folded`, whether the phone's sheet is
 * folded to its groups' names, which the page holds (`onFold`); `held`, the card held while the person picks its place, and its line.
 * `onCard` hands a tapped card to the page; `onLetGo` lets the held card go ("ביטול"); `onStopBy` stops the price changing by a thing it
 * changes by; `onClose` un-chooses the fee.
 */
export function ToolboxColumn({
  view,
  fee,
  house,
  sheet,
  product,
  fill,
  line,
  folded,
  onFold,
  held,
  onCard,
  onLetGo,
  onFee,
  onStopBy,
  onClose,
}: {
  view: ToolboxView;
  fee: Fee;
  /** The house of another price list than the deal's the fee was copied from (`DealRead.copied`), said after its name. */
  house?: string;
  sheet: boolean;
  product: string | null;
  fill: PanelFill | null;
  line: FillUndoLine | null;
  folded: boolean;
  onFold: (folded: boolean) => void;
  /** The card held, by its id, and the line that says so (places.ts `holdWords`); null where none is. */
  held: { card: string; words: string } | null;
  /** A card tapped (its id): the page adds it at its one place, holds it, or does what `casesTool` says. */
  onCard: (item: string) => void;
  /** The held card let go, nothing changed ("ביטול"). */
  onLetGo: () => void;
  /** The fee changed in the toolbox itself (a fee of the person's own renamed). */
  onFee: (f: Fee) => void;
  /** A thing the fee changes by tapped again: the page stops it, kept for the undo. */
  onStopBy: (kind: ByKind) => void;
  onClose: () => void;
}) {
  const terms = useProvenanceData()?.terms;
  const onAdd = (_group: string, part: string) => onCard(part);
  const onRemove = (_group: string, part: string) => {
    const thing = cardThing(part);
    if (thing) onStopBy(thing);
  };
  // what it adds to: a case's values after "להוסיף למקרה:", several cases' "להוסיף לכל המקרים" or a row's; nothing for a slim fee
  const addTo = view.addTo ? { lead: view.addTo.lead.trim(), ...(view.addTo.when ? { target: caseText(view.addTo.when) } : {}) } : null;
  const hold = held ? { part: held.card, words: held.words, onCancel: onLetGo } : null;
  // filling the fee from a price list, or the undo line of a fill just made; nothing, and no line above it, where neither stands
  const foot = line || (fill && fill.houses.length > 0) ? (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      {line ? (
        <UndoLine key="undo:fill" as="div" onUndo={line.onUndo} onHold={line.onHold} take={line.take} refocusOnUndo refocus={() => document.querySelector<HTMLElement>("[data-fill-picker] button")}>
          {line.words}
        </UndoLine>
      ) : (
        fill &&
        fill.houses.length > 0 && (
          <span data-fill-picker="" className="contents">
            <MenuPicker name={p.fill} items={fill.houses.map((h) => ({ id: h.id, label: h.name }))} value={null} placeholder={p.fill} onSelect={fill.onFill} />
          </span>
        )
      )}
    </div>
  ) : null;
  const box = <Toolbox key={fee.id} addTo={addTo} held={hold} groups={kitGroups(view)} onAdd={onAdd} onRemove={onRemove} foot={foot} sheet={sheet} docked={sheet} {...(sheet ? { folded, onFold, onClose } : {})} />;
  if (sheet) return box;
  // the site's own explanation of the fee: its glossary card by the fee's name, in the deal's product's sense where the glossary gives
  // that product one of its own
  const term = fee.kind === "own" ? null : feeName(fee.kind);
  const owned = term && product ? termKey(term, product) : null;
  const explained = owned && terms?.[owned] ? owned : term && terms?.[term] ? term : null;
  const side = capacity(fee.kind).oneSide;
  return (
    <Section
      title={p.title}
      level="kick"
      heading="h2"
      gap="tight"
      action={
        <Button variant="icon" size="sm" aria-label={p.close} title={p.close} onClick={onClose} className="-my-2">
          <IconClose size={18} />
        </Button>
      }
    >
      {/* clear of the head's close button by the 6 px its tap area reaches under its face, so the two areas never meet */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5">
        {fee.kind === "own" ? (
          // a fee of the person's own: its heading is its name, typed in place (an empty name reads as the page names such a fee)
          <>
            <h3 className="sr-only">{feeName(fee.kind, fee.name)}</h3>
            <span className="flex min-w-0 flex-[1_1_14rem] items-center gap-2">
              <Swatch shape="box" className={cx("shrink-0", feeColour(fee.kind).bg)} />
              <TextField inline grow labelHidden label={p.ownName} value={fee.name ?? ""} placeholder={feeName("own")} maxLength={NAME_MAX} icon={<IconPencil size={16} />} onChange={(v) => onFee(setFeeName(fee, v))} />
            </span>
          </>
        ) : (
          <h3 className="text-lg font-semibold">
            <FeeName fee={{ fee: fee.id, kind: fee.kind, ...(house ? { house } : {}) }} />
          </h3>
        )}
        {side && <Tag tone="outline">{p.oneSide[side]}</Tag>}
        {explained && term && <HelpMark term={explained} about={term} words={p.whatIs} className="ms-auto" />}
      </div>
      {box}
    </Section>
  );
}

/**
 * The toolbox's card on a computer wide enough for a column of its own (`cardRef`, which the page brings into view and focuses in):
 * beside the fees, sticking under the header as they scroll by (in the indices page's popup, under the popup's head and tiles), scrolling
 * inside itself where it is taller than the room under them (`useStickyColumn`), and kept clear by the site's "back to the top" button (`data-keep-clear`). Narrower, the toolbox is the
 * sheet at the foot of the screen. Escape closes it (`onClose`).
 */
export function ToolboxCard({ cardRef, onClose, children }: { cardRef: RefObject<HTMLDivElement | null>; onClose: () => void; children: ReactNode }) {
  useStickyColumn(cardRef, true);
  return (
    <div
      ref={cardRef}
      data-keep-clear=""
      className="come-in col-start-2 row-start-1 sticky top-20 rounded-lg scrollbar-none"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <Card edge="accent" className="flex flex-col gap-4">
        {children}
      </Card>
    </div>
  );
}
