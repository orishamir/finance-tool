// The fee open in place on the fee page (method §10.6) and everything that belongs to it: the case open (its first where none is named, or
// where the one named is gone), the slot whose menu is open, the thing of its band's head whose menu is open, a part the toolbox added that
// asks for its figure, month or fee, a toolbox card held while the person picks where it goes (places.ts), the question of a thing being
// added (ask-thing.tsx), whether a phone's toolbox sheet is folded, the fee marked in every column, and where the focus and the view go
// when a fee or a case opens. Each of these belongs to the fee and case it was opened on. In place of one case, the toolbox may add to several of the fee's cases at once (`CasesTarget`: every case, or a grid
// row's), with what a part it added asks of them all (`CasesAsk`); opening one case brings it back to that case.
import { useEffect, useRef, useState } from "react";
import { hasCases, type FeeDeal } from "../../lib/fee-deal/model";
import type { CasesTarget } from "../../lib/fee-deal/toolbox";
import type { CasesAsk } from "../../lib/fee-deal/every-case";
import { heldOn, type Held } from "../../lib/fee-deal/places";
import type { DealRead } from "../../lib/fee-deal/deal-read";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { useAskThing } from "./ask-thing";
import { bringIntoView } from "./in-view";
import type { FeeLinks } from "./links";
import { pendingAfter, pendingFresh, pendingStands, type Pending } from "./part-edit";

/** A fee's card in the fees' column, by its id. */
const feeCard = (feeId: string) => document.querySelector(`li[data-fee="${CSS.escape(feeId)}"]`);

/**
 * The open fee's state for the deal on screen (`deal`, read once as `read`), with `chosen` the fee open (`setChosen`, which the deal's
 * document holds, since its changes and its undo choose a fee too). `phone`: the toolbox is a sheet at the foot of the screen;
 * `panelColumn`: it has a column of its own.
 */
export function useOpenCase({ deal, read, chosen, setChosen, phone, panelColumn }: { deal: FeeDeal; read: DealRead; chosen: string | null; setChosen: (id: string | null) => void; phone: boolean; panelColumn: boolean }) {
  const [caseOpen, setCaseOpen] = useState<{ fee: string; case: string } | null>(null);
  // the toolbox adding to several of a fee's cases at once, and what a part it added asks of them all
  const [several, setSeveral] = useState<CasesTarget | null>(null);
  const [casesAsk, setCasesAsk] = useState<CasesAsk | null>(null);
  const [menu, setMenu] = useState<{ fee: string; case: string; t: number; at: HTMLElement } | null>(null);
  const [thingOpen, setThingOpen] = useState<{ fee: string; t: number; at: HTMLElement } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  // a toolbox card held while the person picks one of its places: it belongs to the fee and case it was tapped for
  const [held, setHeld] = useState<Held | null>(null);
  // the part asking for what it needs whose box has had the focus: drawn again (left waiting while the fee changed by something, or its
  // card tapped or dropped again, which keeps it as it is: `pendingAfter`), it takes it no more
  const pendingShown = useRef<Pending | null>(null);
  // a change that leaves the part asking no place (its side's prices changed, its side or its price gone, a price that can no longer hold
  // it) drops it, so it never asks on another price, nor comes back with an undo; any other change leaves it asking
  useEffect(() => {
    if (pending && !pendingStands(deal, pending)) setPending(null);
  }, [deal, pending]);
  // whether a phone's toolbox sheet is folded to its groups' names: folded as the page loads, so nothing covers it, and unfolded when a
  // fee or a case is opened, or at its handle
  const [sheetFolded, setSheetFolded] = useState(true);
  // a thing to change by asks its question in place, in the open fee's block
  const { asking, onAsk, onAskDone, drop: dropAsk } = useAskThing(chosen, phone, setSheetFolded);
  // the fee under the pointer or the focus in any column, which the others mark
  const [marked, setMarked] = useState<string | null>(null);
  const panelCard = useRef<HTMLDivElement>(null);
  // a fee chosen from the keyboard, or from the reading or what it leaves out: its panel's first field, or its card and panel, once drawn
  const after = useRef<{ fee: string; how: "panel" | "view" } | null>(null);
  useIsoLayoutEffect(() => {
    const a = after.current;
    if (!a || a.fee !== chosen) return;
    after.current = null;
    if (a.how === "panel") panelCard.current?.querySelector<HTMLElement>("input, select, [role=radio], button[aria-pressed]")?.focus();
    else {
      bringIntoView(feeCard(a.fee));
      if (!panelColumn) bringIntoView(panelCard.current);
    }
  }, [chosen]);
  // a case opened in place is brought into view once drawn: under the header, and above a phone's sheet, which unfolds with it; opened by a
  // press on a table's cell or head, never so far that the cell pressed leaves the view
  const [caseShown, setCaseShown] = useState(0);
  const pressed = useRef<Element | null>(null);
  useEffect(() => {
    const press = (e: PointerEvent) => (pressed.current = (e.target as Element | null)?.closest("[role=gridcell], [data-case-head]") ?? null);
    document.addEventListener("pointerdown", press, true);
    return () => document.removeEventListener("pointerdown", press, true);
  }, []);
  useEffect(() => {
    if (!caseShown) return;
    // after the frame, where the sheet has unfolded and the case has its height
    const f = requestAnimationFrame(() => bringIntoView(document.querySelector("[data-open-case]"), pressed.current?.isConnected ? pressed.current : null));
    return () => cancelAnimationFrame(f);
  }, [caseShown]);

  const fee = deal.fees.find((f) => f.id === chosen) ?? null;
  // the case open: the one named while its fee has it, else the fee's first
  const caseId = fee && hasCases(fee) ? (caseOpen?.fee === fee.id && fee.cases.some((c) => c.id === caseOpen.case) ? caseOpen.case : fee.cases[0]!.id) : null;

  // a fee or one of its cases opened in place; from the keyboard, its first box takes the focus once drawn
  const onOpenCase = (feeId: string, caseId: string | null, by: "pointer" | "keyboard") => {
    if (by === "keyboard") {
      after.current = { fee: feeId, how: "panel" };
      pressed.current = null;
    }
    if (caseId) setCaseShown((n) => n + 1);
    setChosen(feeId);
    setCaseOpen(caseId ? { fee: feeId, case: caseId } : null);
    setSeveral(null);
    setCasesAsk(null);
    setSheetFolded(false);
    setMenu(null);
    if (thingOpen && thingOpen.fee !== feeId) setThingOpen(null);
    if (pending && (pending.fee !== feeId || pending.case !== caseId)) setPending(null);
    if (held && (held.fee !== feeId || held.case !== caseId)) setHeld(null);
    if (asking && asking.fee !== feeId) dropAsk();
  };
  // the toolbox opened on several of a fee's cases at once: the fee open, no case of it open, a phone's sheet unfolded
  const onOpenCases = (target: CasesTarget) => {
    const same = several && several.fee === target.fee && several.row === target.row;
    setChosen(target.fee);
    setSeveral(target);
    if (!same) setCasesAsk(null);
    setSheetFolded(false);
    setMenu(null);
    setPending(null);
    setHeld(null);
    if (thingOpen && thingOpen.fee !== target.fee) setThingOpen(null);
    if (asking && asking.fee !== target.fee) dropAsk();
  };
  // the toolbox closed: no fee open, and the focus back on the fee it was for
  const onClosePanel = () => {
    const was = chosen;
    setChosen(null);
    setSeveral(null);
    setCasesAsk(null);
    setMenu(null);
    setThingOpen(null);
    setPending(null);
    setHeld(null);
    dropAsk();
    if (was) requestAnimationFrame(() => document.querySelector<HTMLElement>(`li[data-fee="${CSS.escape(was)}"] :is([data-pick-card], input)`)?.focus());
  };
  // a fee the reading names by the id it reads it under (a step of a fee read across sizes, `fee-x-s1`) is the deal's fee it is of
  const dealFeeOf = (id: string): string => (deal.fees.some((f) => f.id === id) ? id : (read.fees.find((x) => x.id === id)?.read?.of ?? id));
  const links: FeeLinks = {
    marked,
    mark: (id) => setMarked(id === null ? null : dealFeeOf(id)),
    open: (given) => {
      const feeId = dealFeeOf(given);
      setCaseOpen(null);
      setSeveral(null);
      setCasesAsk(null);
      setMenu(null);
      after.current = { fee: feeId, how: "view" };
      setChosen(feeId);
      if (feeId === chosen) {
        after.current = null;
        bringIntoView(feeCard(feeId));
        if (!panelColumn) bringIntoView(panelCard.current);
      }
    },
    openCase: (feeId, caseId) => (caseId ? onOpenCase(feeId, caseId, "keyboard") : links.open(feeId)),
    toLaw: (feeId) => {
      const row = document.querySelector<HTMLElement>(`[data-law-row="${CSS.escape(feeId)}"]`);
      if (!row) return;
      bringIntoView(row);
      row.focus({ preventScroll: true });
    },
  };
  return {
    /** The fee open, and its case open (null for a slim fee). */
    fee,
    caseId,
    links,
    onOpenCase,
    onOpenCases,
    onClosePanel,
    /**
     * The several cases of the open fee the toolbox adds to at once, in place of its open case (null where it adds to one case), and what a
     * part it added still asks of them all (`ask`, `setAsk`: null once given or dropped).
     */
    cases: {
      target: several && several.fee === chosen ? several : null,
      ask: several && several.fee === chosen ? casesAsk : null,
      setAsk: setCasesAsk,
    },
    /** Another deal on screen: the sheet folded, no thing's menu open. */
    reset: () => {
      setSheetFolded(true);
      setThingOpen(null);
      setHeld(null);
    },
    /** The menus of the open case's slot and of a thing of its band's head, each with the chip it opened from. */
    menus: {
      slot: menu,
      thing: thingOpen,
      /** A slot of the open case tapped, at its chip; again, its menu closes. */
      onSlot: (t: number, at: HTMLElement) => setMenu((m) => (m && m.t === t && m.fee === chosen && m.case === caseId ? null : chosen && caseId ? { fee: chosen, case: caseId, t, at } : null)),
      /** A thing of a fee's band head tapped, at its chip, the fee open or not; again, its menu closes. */
      onThing: (feeId: string, t: number, at: HTMLElement) => setThingOpen((m) => (m && m.t === t && m.fee === feeId ? null : { fee: feeId, t, at })),
      closeSlot: () => setMenu(null),
      closeThing: () => setThingOpen(null),
    },
    /** A part the toolbox added that asks for what it needs, on the case open (`here`, where it stands); null when given or dropped. */
    pending: {
      here: pending && pending.fee === chosen && pending.case === caseId ? pending : null,
      set: (next: Pending | null) => setPending((now) => pendingAfter(now, next)),
      /** Whether the part asking is drawn for the first time, so its box takes the focus; `onShown` once it is. */
      fresh: () => pendingFresh(pending, pendingShown.current),
      onShown: () => {
        pendingShown.current = pending;
      },
    },
    /** The toolbox card held on the case open (`here`), and the hold set or ended (`set`). */
    hold: { here: several && several.fee === chosen ? null : heldOn(held, chosen, caseId), set: setHeld },
    /** The question of a thing being added, in the open fee's block. */
    ask: { asking, onAsk, onAskDone },
    /** Whether a phone's toolbox sheet is folded; `unfold` for a fee just added. */
    sheet: { folded: sheetFolded, setFolded: setSheetFolded, unfold: () => setSheetFolded(false) },
    /** The toolbox's card. */
    panel: { card: panelCard },
  };
}
