// The deal's editor (method §10.6), one for every host: the fee page hosts it under its bar with the reading under it, and the indices page
// hosts it in a popup read on the plan. It holds the deal on screen and its views: its document (use-deal-document.ts), the fee open in
// place (use-open-case.ts), the template picker (use-template-picker.ts), and the deal read once for every view, of which the columns, the
// toolbox, the menus and the reading are drawn; the host lays out the pieces it returns. One fee is open at a time, and one case of it: a
// tap on a slim fee or a case's row opens it in place, a tap on its slot, or on a thing of its band's head, opens that one's menu, which the
// editor holds. The toolbox stands in a column of its own where the host gives the editor the room (`TOOLBOX_COLUMN_PX`), and anywhere
// narrower in a short sheet pinned to the foot of the screen, the host keeping room under its end for it; the sheet comes folded to its
// groups' names with a deal, and unfolds when a fee or a case is opened. The columns and the reading are one thing: a fee under the pointer
// or the focus in one is marked in the others, and a fee's name in the reading opens it (`FeeLinks`). A toolbox card adds ("חינם" alone
// replaces a price's charge and its parts, places.ts): tapped, it goes to its one place in the open case, or with several places it is held, each place drawing the card's landing copy where its tap
// would put it (the open case as that tap would leave it, `toolStep`), until one is tapped or the hold ends (Escape, "ביטול", the card
// again, a tap anywhere else), the focus then back on the card (places.ts). On a computer a card dragged from the toolbox onto one of its
// places, or onto another case where it has one place, does there what its tap does, each place that takes it showing the same copy
// (`ToolDrop`, `PlaceHands`). A change that loses something (a fee taken away, a fee filled from a price list, a price, a case or a thing
// taken away, a saved deal deleted) leaves one undo line where it happened (lib/fee-deal/undo.ts), which takes the focus as it appears and
// lives through edits elsewhere until it is undone, a newer such change replaces it, another deal opens, the part it would put back into
// changes, or ten seconds pass while neither the focus nor the pointer is on it. Each fee carries a switch in its card's corner: a fee
// switched off (lib/fee-deal/off.ts) is left out of the reading and of what it says is left out, read on the deal as it is counted
// (`counted`), while the columns draw it dimmed, still open to edit, and everything that writes the deal sees the whole deal.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { dealCases } from "../../copy";
import { builder } from "../../lib/fee-deal/rows";
import { panel as panelOf } from "../../lib/fee-deal/panel";
import { cardOf, casesTool, casesToolbox, targetCases, toolbox as toolboxOf, type CasesTarget, type Toolbox } from "../../lib/fee-deal/toolbox";
import { slotEdit, thingMenu, usualBy } from "../../lib/fee-deal/things";
import { addOfferedFee, duplicateFee, setPick, updateFee } from "../../lib/fee-deal/edits/deal";
import { hasCases, pricedOf, type Fee, type FeeDeal, type Side } from "../../lib/fee-deal/model";
import { pickKind, type ByKind } from "../../lib/fee-deal/offers/conditions";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import { dropTakes, holdWords, letGoStep, samePlace, tapStep, waitAt, type HoldStep, type Place } from "../../lib/fee-deal/places";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { leftOut } from "../../lib/fee-deal/left-out";
import { pickLine, type PickThing, type ReadingInput } from "../../lib/fee-deal/reading";
import { countedDeal, feesOff, isFeeOff } from "../../lib/fee-deal/off";
import { accountCapOf } from "../../lib/fee-deal/charts";
import { kindById } from "../../lib/fee-deal/kinds";
import { productOffered } from "../../lib/fee-deal/offers/offer";
import { feeRoom } from "../../lib/fee-deal/limits";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { dealStore, savedWith } from "../../lib/fee-deal/store";
import { copyHouseFee, dataBar, feeAlone, feePriceLists, houseName, housesToCopy, templateSource } from "../../lib/fee-deal/templates";
import { addByKept, fillFeeKept, liftKept, removeByKept, removeChangeKept, removeCaseKept, removeFeeKept, setKindKept } from "../../lib/fee-deal/undo";
import { binTakes, liftDrop, liftedOf, liftRemove, liftTakes, liftWhy } from "../../lib/fee-deal/lifted";
import { cardThing } from "../../lib/fee-deal/toolbox";
import type { FeesData } from "../../lib/fee-page-data";
import { MQ, useMedia, useWiderThan } from "../../lib/hooks";
import { feeDeal as copy } from "../../copy";
import { ThingMenu, ValueMenuSheet, holdFloors, type ReadPick } from "../kit";
import { FeesColumn, Palette, SetupStrip, feeGroup, paletteItems, shownFeeOrder } from "./builder";
import { DealColumns, PaletteColumn } from "./deal-columns";
import { useSaid } from "./deal-notices";
import { UNDO_MS } from "./use-undo";
import { partPlaceId } from "./figures";
import { SlotMenu, WhenText, whenText } from "./open-case";
import { TemplatePicker } from "./picker";
import { ToolboxCard, ToolboxColumn, applyTool, landingOf, partLabel, type ToolHands } from "./toolbox";
import { useLetGo } from "./use-let-go";
import type { NoneRead } from "./left-out";
import type { FeeSlot, LiftHands, ToolDrop } from "./fee-block";
import type { Landed, PlaceHands } from "./open-case";
import { useUnitPrice } from "./use-unit-price";
import { refusalWords, useDealDocument } from "./use-deal-document";
import { useOpenCase } from "./use-open-case";
import { useTemplatePicker } from "./use-template-picker";

/**
 * How wide the editor must be for the toolbox to have a column of its own (28rem) beside the fees, which take the rest: 75rem, the fee
 * page's column on a window of 80rem with a scrollbar beside it. Narrower, it is a short sheet at the foot of the screen.
 */
export const TOOLBOX_COLUMN_PX = 75 * 16;
const PHONE = "(max-width: 47.99rem)";

/** The reading's picks as the band's choices (`ReadForBand`): each thing, its values in words, its pick, and `onPick` (the editor's) to set it. */
export const pickItems = (things: readonly PickThing[], onPick: (by: string, is: string) => void): ReadPick[] =>
  things.map((t) => ({ name: t.words, items: t.options.map((o) => ({ id: o.is, label: whenText(o.words) })), value: t.chosen, onSelect: (is: string) => onPick(t.by, is) }));

/** What the editor opens on and keeps: the page's data, the device's day and saved deals, whether it can save, and the deal first shown. */
export interface EditorInput {
  data: FeesData;
  today: string;
  saved: readonly FeeDeal[];
  writable: boolean;
  first: FeeDeal;
  /** Another deal came on screen: what the host keeps of the deal before it goes. */
  onShown?: () => void;
  /** Whether the host draws /deal's reading, which the editor then gives what it is read from (`ReadingInput`); a host that reads the deal otherwise leaves it out. */
  withReading?: boolean;
  /** What the host adds to each fee, its head and its cases' marks (`FeeSlot`, `FeesColumn.headOf`). */
  feeHead?: (fee: Fee) => FeeSlot | undefined;
  /** The fees stand with no heading of their own, where the host's head says what they are (`FeesColumn.untitled`). */
  untitled?: boolean;
  /** Whether the deal on screen is the one /deal reopens (`useDealDocument`'s `remember`); a host outside /deal sets it off. */
  remember?: boolean;
}

/** The editor's pieces and hands, for its host to lay out (`useDealEditor`). */
export type DealEditor = ReturnType<typeof useDealEditor>;

export function useDealEditor({ data, today, saved, writable, first, onShown, withReading = true, feeHead, untitled = false, remember = true }: EditorInput) {
  // another deal on screen (a saved one, a new one, one a template filled, or one an undo brought back): what belonged to the deal before
  // goes, and a new deal is saved once it is worth saving
  const doc = useDealDocument({ first, saved, today, data, onShown: () => afterShow(), remember });
  const { deal, chosen, change, kept } = doc;
  // the toolbox has a column of its own where its host gives the editor the room (`TOOLBOX_COLUMN`), whatever the window
  const columnsRef = useRef<HTMLDivElement>(null);
  const windowWide = useMedia(MQ.xl);
  const panelColumn = useWiderThan(columnsRef, TOOLBOX_COLUMN_PX, () => windowWide);
  const phone = useMedia(PHONE);
  // the toolbox is a short sheet at the foot of the screen wherever it has no column of its own (a phone, a tablet, a narrow window), so
  // opening a fee never pushes the fees under it down
  const sheeted = !panelColumn;
  // the deal is read once for every view; choosing another fee builds only its panel again
  const read = useMemo(() => readDealFor(deal, data.kinds, today, (id) => houseName(id, data)), [deal, data, today]);
  // the deal as it is counted, without the fees switched off, read for the reading; the same read where no fee is off
  const off = feesOff.use();
  const counted = useMemo(() => countedDeal(deal, off), [deal, off]);
  const countedRead = useMemo(() => (counted === deal ? read : readDealFor(counted, data.kinds, today, (id) => houseName(id, data))), [counted, deal, read, data, today]);
  const oc = useOpenCase({ deal, read, chosen, setChosen: doc.setChosen, phone: sheeted, panelColumn });
  const { caseId } = oc;
  const chosenFee = oc.fee;
  const { said, setSaid } = useSaid();

  const afterShow = () => {
    oc.reset();
    setSaid(null);
    onShown?.();
  };
  // a refusal stands for as long as an undo line would, or until the next change
  const { refusal, setRefusal } = doc;
  useEffect(() => {
    if (!refusal) return;
    const t = window.setTimeout(() => setRefusal(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [refusal, setRefusal]);
  const open = doc.show;
  const onUndo = doc.onUndo;
  const picker = useTemplatePicker({
    deal,
    data,
    today,
    onTrack: (next) => {
      change(next);
      if (!next.fees.some((f) => f.id === chosen)) doc.setChosen(next.fees[0]?.id ?? null);
    },
    onNew: (next, id) => {
      dealStore.update((ds) => savedWith(ds, next, today));
      open(next);
      setSaid(copy.end.opened[templateSource(id)](next.template?.name ?? "") + (writable ? copy.end.kept : ""));
    },
  });

  const onFee = (f: Fee) => change(updateFee(deal, f.id, () => f));
  // a part a tap or a drop put on at once takes the focus where it now stands, as the card it came from is checked and takes none
  const onPart = (fee: Fee): ToolHands["onPart"] => (next, at) => {
    if (next === fee) return;
    onFee(next);
    doc.setFocus({ fee: fee.id, on: "part", part: partPlaceId(at.side, at.k, at.part) });
  };
  const onAdd = (kind: FeeKindId) => {
    const added = addOfferedFee(deal, kindById(data.kinds, deal.kind), kind);
    if (!added) return setRefusal({ feeId: null, words: refusalWords("fees") });
    const { deal: next, fee } = added;
    change(next);
    doc.setChosen(fee.id);
    oc.sheet.unfold();
    doc.setFocus({ fee: fee.id, on: "box" });
  };
  // the open fee's bin, beside its name: the fee's undo line takes its place, in the block's room for a moment before it closes up to the
  // line, and stands where the block stood on the screen whichever fee opens in its stead, the one under it on the page or, after the
  // last, the one above (`UndoLine.standAt`), so a second press of a double-click lands on the line, never in the fee that opened
  const onRemoveFee = (feeId: string) => kept(removeFeeKept(deal, feeId, chosen, shownFeeOrder(deal.fees, (f) => feeGroup(read, f, saves))));
  // another kind of product: the fees it does not have leave the deal, kept for the undo where any of them held something
  const onKind = (id: ProductId) => {
    const to = kindById(data.kinds, id);
    if (to) kept(setKindKept(deal, to, dataBar(id, data, today), chosen));
  };
  const onRemoveChange = (feeId: string, side: Side, k: number, caseId: string | undefined) => kept(removeChangeKept(deal, feeId, side, k, chosen, caseId));
  // a charge the toolbox puts on a price that charges nothing, or the bin of a price's charge ("free"), on price `k` on `side`; a part
  // waiting for what it asks waits on, unless the change leaves it no place (`useOpenCase`, `pendingStands`)
  const onCharge = (feeId: string, part: PartId, caseId: string | null, at: { side: Side; k: number }) => void doc.changeForm(feeId, part, caseId, at);
  const onRemoveCase = (feeId: string, caseId: string) => {
    oc.menus.closeSlot();
    kept(removeCaseKept(deal, feeId, caseId, chosen));
  };
  // the price stops changing by a thing: the cases that then differ in nothing merge, kept for the undo, whose line says what merged. The
  // menu it is chosen in closes first: while it is open the page behind it takes no focus, and on closing it gives the focus back to its
  // chip, so the change is made once it has closed, and the undo line then takes the focus from the chip it takes away
  const onRemoveBy = (feeId: string, t: number) => {
    const r = removeByKept(deal, feeId, t, chosen);
    const menuOpen = document.querySelector("dialog[open]");
    oc.menus.closeThing();
    oc.menus.closeSlot();
    if (menuOpen) menuOpen.addEventListener("close", () => kept(r), { once: true });
    else kept(r);
  };
  // a thing added from the toolbox: a list or a track splits the fee at once into its usual values, kept for the undo, whose line says
  // what it split into, and its heads rename them; a range or a condition of the person's own asks first, as does a split of one case
  const onAddBy = (feeId: string, kind: ByKind) => {
    const n = usualBy(kind);
    const r = n ? addByKept(deal, feeId, n, chosen) : null;
    if (r) kept(r);
    else oc.ask.onAsk(kind);
  };
  // a thing the fee changes by, tapped again in the toolbox: as its chip's menu stops it
  const onStopBy = (feeId: string, kind: ByKind) => {
    const fee = deal.fees.find((f) => f.id === feeId);
    const t = fee && hasCases(fee) ? fee.by.findIndex((x) => pickKind(x.kind) === pickKind(kind)) : -1;
    if (t >= 0) onRemoveBy(feeId, t);
  };
  // a fee duplicated from its card's corner or its grip's menu stands right after it, chosen and focused on its card; a kind that stands
  // alone (`feeAlone`: the method does not say how two such fees meet one cap, F-113) is not duplicated
  const onDuplicate = (fee: Fee) =>
    feeAlone(deal, fee.kind, data)
      ? null
      : () => {
          const r = duplicateFee(deal, fee.id);
          if (!r) return setRefusal({ feeId: null, words: refusalWords("fees") });
          change(r.deal);
          doc.setChosen(r.feeId);
          doc.setFocus({ fee: r.feeId, on: "card" });
        };
  const onDelete = doc.remove;
  // a pick of the reading, refused past the picks a deal may keep (limits.ts)
  const onPick = (by: string, is: string) => {
    const next = setPick(deal, by, is);
    if (next === deal) return setRefusal({ feeId: null, words: refusalWords("picks") });
    change(next);
  };

  const kind = kindById(data.kinds, deal.kind);
  // a fee the product may not charge by rule is never offered
  const bar = useMemo(() => dataBar(deal.kind, data, today), [deal.kind, data, today]);
  // the products the picker offers: each with a fee it is offered, the fees its data bars left out
  const offeredKinds = useMemo(() => data.kinds.filter((k) => productOffered(k, dataBar(k.id, data, today))), [data, today]);
  const { unitPrice, onUnitPrice } = useUnitPrice(read, deal.id);
  // the reading and the panel for a deal with a fee, with the fees the reading leaves out: one with none shows neither
  // BANK-35's cap on a current account, which the reading flags a year of holding above (F-102)
  const cap = useMemo(() => accountCapOf(data.rules), [data.rules]);
  // the reading is of the deal as it is counted; its picks are of the whole deal, so a fee switched off leaves the picks as they stand
  const views = useMemo(() => (read.deal.fees.length > 0 ? { left: leftOut(countedRead), reading: withReading ? ({ read: countedRead, unitPrice, cap, picks: pickLine(read) } satisfies ReadingInput) : null } : null), [read, countedRead, unitPrice, withReading, cap]);
  const builderView = useMemo(() => builder(read, bar, chosen ? { fee: chosen, case: caseId } : null), [read, bar, chosen, caseId]);
  const pending = oc.pending.here;
  const panel = useMemo(() => (chosen ? panelOf(read, chosen, caseId ?? undefined, pending) : null), [read, chosen, caseId, pending]);
  // while a carried thing is over a place, the fees' column draws the deal as a drop there would leave it (lifted.ts); the reading below,
  // the toolbox and the saved deal stay as they are until it is let go
  const [preview, setPreview] = useState<FeeDeal | null>(null);
  const previewRead = useMemo(() => (preview ? readDealFor(preview, data.kinds, today) : null), [preview, data.kinds, today]);
  const shownBuilder = useMemo(() => (previewRead ? builder(previewRead, bar, chosen ? { fee: chosen, case: caseId } : null) : builderView), [previewRead, builderView, bar, chosen, caseId]);
  const shownOpen = useMemo(() => (previewRead && chosen ? (panelOf(previewRead, chosen, caseId ?? undefined, pending)?.open ?? null) : (panel?.open ?? null)), [previewRead, chosen, caseId, pending, panel]);
  // the several cases of the open fee the toolbox adds to at once, while the fee still has some of them; else it adds to the open case
  const several = oc.cases.target && targetCases(read, oc.cases.target) ? oc.cases.target : null;
  const tools = useMemo(() => (!chosen ? null : several ? casesToolbox(read, several) : toolboxOf(read, chosen, caseId ?? undefined)), [read, chosen, several, caseId]);
  // the toolbox of a case of the open fee (`at` null: a slim fee, or the open case): the one drawn where it is the open case's
  const toolsFor = (feeId: string, at: string | null): Toolbox | null => (feeId !== chosen ? null : !several && (at === null || at === caseId) ? tools : toolboxOf(read, feeId, at ?? undefined));
  // a toolbox card at a place of case `on` of fee `fee` (null: a slim fee): what its tap does there (`applyTool`)
  const applyAt = (item: string, fee: Fee, on: string | null, place: Place) =>
    applyTool(item, fee, on, place, {
      onAsk: (kind) => onAddBy(fee.id, kind),
      onPending: (part, at) => oc.pending.set({ fee: fee.id, case: on, ...waitAt(pricedOf(fee, on ?? undefined), part, at) }),
      onCharge: (part, at) => at.on === "price" && onCharge(fee.id, part, on, { side: at.side, k: at.k }),
      onPart: onPart(fee),
    });
  /**
   * A card tapped, or dropped, with the toolbox on several cases of a fee (`target`), each an edit of its own, one step of the undo: a
   * thing to change by asks its question, for the whole fee; a part that asks for something asks it once where those cases stand; any
   * other part goes into them (`casesTool`). Nothing where the card is had or off there.
   */
  const onCasesCard = (target: CasesTarget, item: string) => {
    const t = casesTool(read, target, item);
    if (!t) return;
    if (t.k === "thing") return onAddBy(target.fee, t.kind);
    if (t.k === "ask") return oc.cases.setAsk(t.ask);
    onFee(t.fee);
  };
  // a toolbox card on several cases of the open fee: each place asks once per card while the deal stands (every place asks while a card is
  // carried); a thing to change by is the fee block's, which takes it for the whole fee
  const onCases = useMemo(() => new Map<string, boolean>(), [read]);
  const casesTake = (target: CasesTarget, item: string): boolean => {
    if (target.fee !== chosen || cardThing(item)) return false;
    const key = `${target.fee}|${target.row ?? ""}|${target.cases.join()}|${item}`;
    if (!onCases.has(key)) onCases.set(key, casesTool(read, target, item) !== null);
    return onCases.get(key)!;
  };
  // the places of a card on case `at` of the open fee (places.ts)
  const placesOf = (feeId: string, at: string | null, item: string): readonly Place[] => {
    const t = toolsFor(feeId, at);
    return (t && cardOf(t, item)?.places) ?? [];
  };
  // a card held while the person picks one of its places, on the open case; it goes on the place picked, or is let go, the focus back on it
  const held = oc.hold.here;
  const heldCard = held && tools ? cardOf(tools, held.card) : null;
  const heldPlaces = heldCard?.places ?? [];
  // the held card's words: a line's own words while it is held, a part's card's words
  const heldWords = heldCard ? (heldCard.k === "line" ? heldCard.held : partLabel(heldCard)) : "";
  const holdLine = holdWords(heldWords, heldPlaces);
  // while a card is held, the open case's prices keep their height at rest, as while one is carried (`holdFloors`), held before its
  // landing copies are drawn and let go once the hold has ended
  const floors = useRef<(() => void) | null>(null);
  const holding = !!held;
  useLayoutEffect(() => {
    if (!holding) return;
    return () => {
      floors.current?.();
      floors.current = null;
    };
  }, [holding]);
  // a step of the hold (places.ts `HoldStep`): the card held next, card `item` added at its place, and the focus on the earliest place's
  // landing copy, so Enter adds there and Tab goes round the others (use-let-go.ts), or back on the card
  const holdStep = (step: HoldStep | null, item?: string) => {
    if (!step) return;
    if (step.held && !floors.current) floors.current = holdFloors();
    oc.hold.set(step.held);
    if (step.add && item && chosenFee) applyAt(item, chosenFee, caseId, step.add);
    const f = step.focus;
    if (f) requestAnimationFrame(() => document.querySelector<HTMLElement>(f.on === "plus" ? "button[data-add-here]" : `[data-part="${CSS.escape(f.card)}"]`)?.focus({ preventScroll: true }));
  };
  const letGo = (refocus = true) => holdStep(letGoStep(held, refocus));
  useLetGo(!!held && holdLine !== null, letGo);
  const onTap = (item: string) => {
    if (!chosenFee) return;
    if (several) return onCasesCard(several, item);
    holdStep(tapStep(held, { fee: chosenFee.id, case: caseId, card: item }, placesOf(chosenFee.id, caseId, item)), item);
  };
  // what card `item`'s tap at place `place` of the open case would leave there, for its landing copy (`landingOf`), a charge as
  // `changeForm` would put it on (`formAfter`)
  const lands = (item: string, place: Place): Landed | null =>
    chosenFee && !several ? landingOf(read, chosenFee, caseId, item, place, pending, (part, at) => doc.formAfter(chosenFee.id, part, caseId, at)) : null;
  const places: PlaceHands = {
    held: holdLine !== null && held ? { card: held.card, words: heldWords, places: heldPlaces } : null,
    onPlace: (place) => {
      if (!held || !chosenFee) return;
      oc.hold.set(null);
      applyAt(held.card, chosenFee, caseId, place);
    },
    takes: (item, place) => placesOf(chosen ?? "", several ? null : caseId, item).some((p) => samePlace(p, place)),
    onDrop: (item, place) => {
      if (!chosenFee) return;
      oc.hold.set(null);
      applyAt(item, chosenFee, caseId, place);
    },
    lands,
  };
  // a toolbox card dropped on the open fee (`caseId` null: a slim fee, or the fee as a whole) or one of its cases: a thing to change by
  // where that case's toolbox offers it; a part where it has one place in that case, and on the open case one that is no single price's
  // (a price takes its own drop, where its landing copy shows); dropped on another case than the open one, or while the toolbox adds to several cases, that
  // case opens first
  const drop: ToolDrop = {
    acceptsCases: casesTake,
    onDropCases: (target, item) => {
      if (!casesTake(target, item)) return;
      oc.onOpenCases(target);
      onCasesCard(target, item);
    },
    accepts: (feeId, at, item) => {
      if (cardThing(item)) return !!toolsFor(feeId, at)?.groups.some((g) => g.parts.some((x) => x.id === item && !x.used && !x.off));
      return dropTakes(placesOf(feeId, at, item), !several && (at === null || at === caseId));
    },
    onDrop: (feeId, at, item) => {
      const fee = deal.fees.find((f) => f.id === feeId);
      if (!fee) return;
      // a thing to change by dropped on one case's head or cell splits that case alone
      const thing = cardThing(item);
      if (thing && at !== null && hasCases(fee)) return oc.ask.onAsk(thing, at);
      const on = at ?? caseId;
      const ps = thing ? [{ on: "fee" as const }] : placesOf(feeId, on, item);
      if (ps.length !== 1) return;
      if (on !== caseId || several) oc.onOpenCase(feeId, on, "pointer");
      oc.hold.set(null);
      applyAt(item, fee, on, ps[0]!);
    },
  };
  // a thing lifted by its grip (lifted.ts): dropped on a place, or in a fee's bin, kept for the undo where it took something
  const liftHands: LiftHands = {
    takes: (l, on) => liftTakes(deal, l, on),
    why: (l, on) => liftWhy(deal, l, on),
    onDrop: (l, on, how) => {
      const r = liftDrop(deal, l, on, { copy: how.copy });
      if (r) kept(liftKept(deal, r, chosen));
    },
    binTakes: (l) => binTakes(deal, l),
    onBin: (l) => {
      const r = liftRemove(deal, l);
      if (r) kept(liftKept(deal, r, chosen));
    },
    binTakesItem: (feeId, it) => {
      const l = liftedOf(it);
      return !!l && l.fee === feeId && binTakes(deal, l);
    },
    onBinItem: (it) => {
      const l = liftedOf(it);
      const r = l && liftRemove(deal, l);
      if (r) kept(liftKept(deal, r, chosen));
    },
    onStretch: (next, words) => kept(liftKept(deal, { deal: updateFee(deal, next.id, () => next), ...(words ? { kept: { feeId: next.id, words } } : {}) }, chosen)),
    // the drop shown as a copy: a part moved keeps its own place, the gap, until it lands, so nothing above or under it moves while it
    // is carried (founder, 2026-11-17)
    preview: (x) => setPreview(x ? (liftDrop(deal, x.l, x.on, { copy: true })?.deal ?? null) : null),
    onResult: (make) => {
      const r = make(deal);
      if (r) kept(liftKept(deal, r, chosen));
    },
    phone,
  };
  const menu = oc.menus.slot;
  const thingOpen = oc.menus.thing;
  const slot = menu && menu.fee === chosen && menu.case === caseId ? slotEdit(read, menu.fee, menu.case, menu.t) : null;
  const thingView = thingOpen ? thingMenu(read, thingOpen.fee, thingOpen.t) : null;
  // a product that saves charges its fees from what has built up: a share of what is held reads so
  const saves = !!kind?.bases.includes("balance");
  const priceLists = useMemo(() => (chosenFee && chosenFee.kind !== "own" ? feePriceLists(deal, chosenFee.kind, data) : []), [chosenFee, deal, data]);
  const { shown, words } = doc.undo;
  const lines = doc.undo.lines;
  // why the reading reads no fee, where it reads none: the deal has no fee with a price, or every fee that has one is switched off
  const none: NoneRead | null = countedRead.fees.length > 0 ? null : read.fees.length > 0 ? "off" : "unpriced";
  // each fee's head: the host's (`feeHead`), and the fee's switch in its corner
  const headOf = (fee: Fee): FeeSlot => ({ ...feeHead?.(fee), counted: { on: !isFeeOff(off, deal.id, fee.id), onChange: (on) => feesOff.set(deal, fee.id, !on) } });
  // the toolbox for the open case: in a column of its own where the window has the room, sticking under the header as the fees scroll by;
  // anywhere narrower a short sheet pinned to the foot of the screen
  const toolboxView =
    views && panel && tools && chosenFee ? (
      <ToolboxColumn
        key={chosenFee.id}
        view={tools}
        fee={chosenFee}
        {...(read.copied[chosenFee.id] ? { house: read.copied[chosenFee.id] } : {})}
        sheet={sheeted}
        product={deal.kind}
        fill={priceLists.length > 0 ? { houses: priceLists, onFill: (h) => kept(fillFeeKept(deal, chosenFee.id, h, data, chosen)) } : null}
        line={lines.fill}
        folded={oc.sheet.folded}
        onFold={oc.sheet.setFolded}
        held={held && holdLine !== null ? { card: held.card, words: holdLine } : null}
        onCard={onTap}
        onLetGo={letGo}
        onFee={onFee}
        onStopBy={(kind) => onStopBy(chosenFee.id, kind)}
        onClose={oc.onClosePanel}
      />
    ) : null;
  const panelView =
    toolboxView && !sheeted ? (
      <ToolboxCard cardRef={oc.panel.card} onClose={oc.onClosePanel}>
        {toolboxView}
      </ToolboxCard>
    ) : null;
  // the fees the deal can still take: in the toolbox's column while no fee is open there, else after the fees (on a computer, while a
  // fee is open, the quiet add line)
  const palette = useMemo(() => paletteItems(builderView, read, kind, saves), [builderView, read, kind, saves]);
  // a fee copied from another house's price list: in place of the deal's fee of its kind (kept for the undo), or beside it; it opens
  const copyHands = useMemo(() => housesToCopy(deal, data), [deal, data]);
  const copyFee = copyHands.length
    ? {
        houses: copyHands,
        has: (k: FeeKindId) => deal.fees.some((f) => f.kind === k),
        // a kind the law caps stands once: the method does not say how two such fees meet one cap (F-113)
        alone: (k: FeeKindId) => (feeAlone(deal, k, data) ? dealCases.copyFee.capped : null),
        onCopy: (house: string, k: FeeKindId, how: "beside" | "replace") => {
          const have = deal.fees.find((f) => f.kind === k);
          if (how === "replace" && have) {
            kept(fillFeeKept(deal, have.id, house, data, chosen));
            doc.setChosen(have.id);
            doc.setFocus({ fee: have.id, on: "card" });
            return;
          }
          if (!feeRoom(deal)) return setRefusal({ feeId: null, words: refusalWords("fees") });
          const r = copyHouseFee(deal, house, k, "beside", data);
          if (!r) return;
          change(r.deal);
          doc.setChosen(r.feeId);
          // the fee added beside takes the focus on its card, brought into view
          doc.setFocus({ fee: r.feeId, on: "card" });
        },
      }
    : null;
  const adding = panelColumn ? (panelView ? ("line" as const) : null) : { palette, copy: copyFee };
  const paletteColumn = panelColumn && !panelView && kind && palette.length > 0 ? (
    <PaletteColumn>
      <Palette items={palette} onAdd={onAdd} copy={copyFee} />
    </PaletteColumn>
  ) : null;
  const setupStrip = <SetupStrip deal={deal} kinds={data.kinds} offered={offeredKinds} onPickTrack={picker.onPickTrack} onTemplates={picker.onTemplates} filled={picker.filled} kindLine={lines.kind} onKind={onKind} />;
  const feesColumn = kind && (
    <FeesColumn
      deal={preview ?? deal}
      view={shownBuilder}
      groupOf={(fee: Fee) => feeGroup(read, fee, saves)}
      open={{ fee: chosen, case: several ? null : caseId, view: several ? null : shownOpen, menu: slot && menu ? menu.t : null, thing: thingView && thingOpen ? { fee: thingOpen.fee, t: thingOpen.t } : null, several: several ? { target: several, ask: oc.cases.ask } : null }}
      line={lines.fee}
      caseLine={lines.case}
      focus={doc.focus}
      onFocused={() => doc.setFocus(null)}
      onDeal={change}
      onAdd={onAdd}
      actions={{
        onOpen: oc.onOpenCase,
        onSlot: oc.menus.onSlot,
        onThing: oc.menus.onThing,
        onRemoveCase,
        onRemoveFee,
        drop,
        onRemoveChange,
        onRemoveCharge: (feeId, caseId, side, k) => onCharge(feeId, "free", caseId ?? null, { side, k }),
        places,
        pendingHands: { onDone: () => oc.pending.set(null), fresh: oc.pending.fresh, onShown: oc.pending.onShown },
        onAskDone: oc.ask.onAskDone,
        lift: liftHands,
        cases: { onOpen: oc.onOpenCases, onAsk: oc.cases.setAsk },
      }}
      refusal={refusal}
      ask={oc.ask.asking && oc.ask.asking.fee === chosen ? { kind: oc.ask.asking.kind, ...(oc.ask.asking.split ? { split: oc.ask.asking.split } : {}) } : null}
      adding={adding}
      onDuplicate={onDuplicate}
      headOf={headOf}
      untitled={untitled}
    />
  );
  return {
    doc,
    deal,
    read,
    kind,
    saves,
    none,
    /** The deal read as it is counted, without the fees switched off. */
    countedRead,
    views,
    unitPrice,
    onUnitPrice,
    said,
    setSaid,
    refusal,
    undo: { shown, words, lines },
    onUndo,
    onPick,
    open,
    onDelete,
    oc,
    /** The template picker, a sheet over the host. */
    picker: <TemplatePicker open={picker.anchor !== null} onClose={picker.onClose} anchor={picker.anchor} options={picker.options} left={picker.left} newDeal={picker.newDeal} product={kind?.name ?? null} onPick={picker.onPick} />,
    pickerHands: picker,
    /** The columns: what the deal is about over its fees (the host's own `setup`, /deal's strip or none), and the toolbox in a column of its own where the host gives the room. */
    columns: (setup: ReactNode | null) => <DealColumns hostRef={columnsRef} setup={setup} fees={feesColumn} toolbox={panelColumn ? (panelView ?? paletteColumn) : null} />,
    setupStrip,
    /** The slot's and the band thing's menus, beside their chip on a computer, a sheet on a phone. */
    menus: (
      <>
        <ValueMenuSheet open={!!slot} onClose={oc.menus.closeSlot} anchor={slot ? menu!.at : null} label={slot?.title ?? ""}>
          {slot && menu && chosenFee && <SlotMenu key={`${menu.fee}:${menu.case}:${menu.t}`} edit={slot} fee={chosenFee} caseId={menu.case} t={menu.t} top={panel?.open.slots[menu.t]?.words.figure ?? null} onFee={onFee} />}
        </ValueMenuSheet>
        <ValueMenuSheet open={!!thingView} onClose={oc.menus.closeThing} anchor={thingView ? thingOpen!.at : null} label={thingView?.name ?? ""}>
          {thingView && thingOpen && <ThingMenu title={thingView.title} values={thingView.values.map((w) => ({ text: <WhenText words={w} />, any: w.any }))} stop={thingView.stop} onStop={() => onRemoveBy(thingOpen.fee, thingOpen.t)} after={thingView.after} />}
        </ValueMenuSheet>
      </>
    ),
    /** The toolbox where it has no column, pinned to the foot of the screen; the host keeps its room at its end. */
    footSheet: sheeted ? toolboxView : null,
  };
}
