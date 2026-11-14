// The fee open in place on the fee page (method §10.6) and everything that belongs to it: the case open (its first where none is named, or
// where the one named is gone), the slot whose menu is open, the thing of its band's head whose menu is open, a part the toolbox added that
// asks for its figure, month or fee, the question of a thing being added (ask-thing.tsx), whether a phone's toolbox sheet is folded, the
// fee marked in every column, and where the focus and the view go when a fee or a case opens. Each of these belongs to the fee and case
// it was opened on.
import { useEffect, useRef, useState } from "react";
import { hasCases, type FeeDeal } from "../../lib/fee-deal/model";
import type { DealRead } from "../../lib/fee-deal/deal-read";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { useAskThing } from "./ask-thing";
import { bringIntoView } from "./in-view";
import type { FeeLinks } from "./links";
import type { Pending } from "./part-edit";

/** A fee's card in the fees' column, by its id. */
const feeCard = (feeId: string) => document.querySelector(`li[data-fee="${CSS.escape(feeId)}"]`);

/**
 * The open fee's state for the deal on screen (`deal`, read once as `read`), with `chosen` the fee open (`setChosen`, which the deal's
 * document holds, since its changes and its undo choose a fee too). `phone`: the toolbox is a sheet at the foot of the screen;
 * `panelColumn`: it has a column of its own.
 */
export function useOpenCase({ deal, read, chosen, setChosen, phone, panelColumn }: { deal: FeeDeal; read: DealRead; chosen: string | null; setChosen: (id: string | null) => void; phone: boolean; panelColumn: boolean }) {
  const [caseOpen, setCaseOpen] = useState<{ fee: string; case: string } | null>(null);
  const [menu, setMenu] = useState<{ fee: string; case: string; t: number; at: HTMLElement } | null>(null);
  const [thingOpen, setThingOpen] = useState<{ fee: string; t: number; at: HTMLElement } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  // whether a phone's toolbox sheet is folded to its groups' names: folded as the page loads, so nothing covers it, and unfolded when a
  // fee or a case is opened, or at its handle
  const [sheetFolded, setSheetFolded] = useState(true);
  // a thing to change by asks its question in place, in the open fee's block
  const { asking, onAsk, onAskDone, drop: dropAsk } = useAskThing(chosen, phone, setSheetFolded);
  // the fee under the pointer or the focus in any column, which the others mark
  const [marked, setMarked] = useState<string | null>(null);
  // for half a second after a fee is taken away, the panel takes no press: the next fee's panel may stand where the pointer is
  const [panelRest, setPanelRest] = useState(false);
  useEffect(() => {
    if (!panelRest) return;
    const t = window.setTimeout(() => setPanelRest(false), 500);
    return () => window.clearTimeout(t);
  }, [panelRest]);
  const panelCard = useRef<HTMLDivElement>(null);
  // a fee chosen from the keyboard, or from the glance or the reading: its panel's first field, or its card and panel, once drawn
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
  // a case opened in place is brought into view once drawn: under the header, and above a phone's sheet, which unfolds with it
  const [caseShown, setCaseShown] = useState(0);
  useEffect(() => {
    if (!caseShown) return;
    // after the frame, where the sheet has unfolded and the case has its height
    const f = requestAnimationFrame(() => bringIntoView(document.querySelector("[data-open-case]")));
    return () => cancelAnimationFrame(f);
  }, [caseShown]);

  const fee = deal.fees.find((f) => f.id === chosen) ?? null;
  // the case open: the one named while its fee has it, else the fee's first
  const caseId = fee && hasCases(fee) ? (caseOpen?.fee === fee.id && fee.cases.some((c) => c.id === caseOpen.case) ? caseOpen.case : fee.cases[0]!.id) : null;

  // a fee or one of its cases opened in place; from the keyboard, its first box takes the focus once drawn
  const onOpenCase = (feeId: string, caseId: string | null, by: "pointer" | "keyboard") => {
    if (by === "keyboard") after.current = { fee: feeId, how: "panel" };
    if (caseId) setCaseShown((n) => n + 1);
    setChosen(feeId);
    setCaseOpen(caseId ? { fee: feeId, case: caseId } : null);
    setSheetFolded(false);
    setMenu(null);
    if (thingOpen && thingOpen.fee !== feeId) setThingOpen(null);
    if (pending && (pending.fee !== feeId || pending.case !== caseId)) setPending(null);
    if (asking && asking.fee !== feeId) dropAsk();
  };
  // the toolbox closed: no fee open, and the focus back on the fee it was for
  const onClosePanel = () => {
    const was = chosen;
    setChosen(null);
    setMenu(null);
    setThingOpen(null);
    setPending(null);
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
      setMenu(null);
      after.current = { fee: feeId, how: "view" };
      setChosen(feeId);
      if (feeId === chosen) {
        after.current = null;
        bringIntoView(feeCard(feeId));
        if (!panelColumn) bringIntoView(panelCard.current);
      }
    },
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
    onClosePanel,
    /** Another deal on screen: the sheet folded, no thing's menu open. */
    reset: () => {
      setSheetFolded(true);
      setThingOpen(null);
    },
    /** The menus of the open case's slot and of a thing of its band's head, each with the pill it opened from. */
    menus: {
      slot: menu,
      thing: thingOpen,
      /** A slot of the open case tapped, at its pill; again, its menu closes. */
      onSlot: (t: number, at: HTMLElement) => setMenu((m) => (m && m.t === t && m.fee === chosen && m.case === caseId ? null : chosen && caseId ? { fee: chosen, case: caseId, t, at } : null)),
      /** A thing of the open fee's band head tapped, at its pill; again, its menu closes. */
      onThing: (t: number, at: HTMLElement) => setThingOpen((m) => (m && m.t === t && m.fee === chosen ? null : chosen ? { fee: chosen, t, at } : null)),
      closeSlot: () => setMenu(null),
      closeThing: () => setThingOpen(null),
    },
    /** A part the toolbox added that asks for what it needs, on the case open (`here`, where it stands); null when given or dropped. */
    pending: {
      here: pending && pending.fee === chosen && pending.case === caseId ? pending.part : null,
      set: setPending,
    },
    /** The question of a thing being added, in the open fee's block. */
    ask: { asking, onAsk, onAskDone },
    /** Whether a phone's toolbox sheet is folded; `unfold` for a fee just added. */
    sheet: { folded: sheetFolded, setFolded: setSheetFolded, unfold: () => setSheetFolded(false) },
    /** The toolbox's card, and whether it rests for half a second after a fee is taken away (`toRest`). */
    panel: { card: panelCard, rest: panelRest, toRest: () => setPanelRest(true) },
  };
}
