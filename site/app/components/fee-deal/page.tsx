// The fee page (method §10.6): the head, the bar of the deal, three columns for entering it (what the deal is, its fees, the toolbox for
// the case open in place), and under them the reading, which opens with the picks it is read for and the deal at a glance. The deal is kept
// on this device, saved as it changes from its first fee or a typed name. It opens from the address (a deal in `#d=`, or in `?d=` as links
// were written before, the saved one where the link's deal is one already; a kind in `?wrapper=`, a track in `?track=`), else the deal
// last worked on, else an empty deal with the kinds to choose from. "Today" is the device's day, read after the page loads: the
// pre-rendered page shows the head and the words that it is loading, never a deal of another day. The bar's end opens another saved deal
// or a new one, and copies the deal's link. The first column's price list step opens the template picker, where a price list opens a new
// deal beside this one; its track step opens the tracks, and the track picked is set on the deal on screen (`pickTrack`). A deal with no
// kind shows the first column alone, a deal with a kind its fees' column beside it, each in the place it keeps, so the first fee moves
// nothing; the toolbox comes with a fee open, and the reading with the first fee. One fee is open at a time, and one case of it: a tap on
// a slim fee or a case's row opens it in place, a tap on its slot, or on a thing of its band's head, opens that one's menu, which the page holds. The toolbox stands in a
// column of its own where the window has the room, under its fee in a middling window, and on a phone in a short sheet pinned to the
// foot of the screen, the page keeping room under its end for it; the sheet comes folded to its groups' names with a deal, and unfolds
// when a fee or a case is opened. The columns and the reading are one thing: a fee under the pointer or
// the focus in one is marked in the others, and a fee's name in the summary or the reading opens it (`FeeLinks`). A change that loses
// something (a fee taken away, a fee filled from a price list, a price, a case or a thing taken away, a saved deal deleted) leaves one
// undo line where it happened (lib/fee-deal/undo.ts), which takes the focus as it appears and lives through edits elsewhere until it is
// undone, a newer such change replaces it, another deal opens, the part it would put back into changes, or ten seconds pass while neither
// the focus nor the pointer is on it.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import { builder, panel as panelOf, slotEdit, thingMenu, toolbox as toolboxOf } from "../../lib/fee-deal/builder";
import { addFee, setPick, updateFee } from "../../lib/fee-deal/edits/deal";
import { type Side } from "../../lib/fee-deal/model";
import { offerFor } from "../../lib/fee-deal/offers/offer";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import { glance } from "../../lib/fee-deal/glance";
import { readingOf } from "../../lib/fee-deal/reading";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { hasCases, newDeal, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { dealStore, savedIfWorth, savedTwin, savedWith, worthSaving } from "../../lib/fee-deal/store";
import { dataBar, dealFromTemplate, feePriceLists, pickTrack, templateOf, templateOptions, templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import { changeFormKept, deleteDealKept, fillFeeKept, holdOnKept, removeByKept, removeCaseKept, removeFeeKept, setKindKept, standing, undo, undoDelete, undoWords as feeUndoWords, type DealUndo, type KindUndo, type MaybeUndoable, type Undo } from "../../lib/fee-deal/undo";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { useIsoLayoutEffect, useMedia } from "../../lib/hooks";
import { Button, Callout, Card, PageHead, ReadForBand, Section, ThingMenu, ValueMenuSheet } from "../kit";
import { DealBar } from "./bar";
import { BarEnd, dealLabel, useCopyLink } from "./bar-end";
import { FeesColumn, SetupColumn, bringIntoView, feeGroup, type FeeFocus } from "./builder";
import { undoLines, useUndo, UNDO_MS, type AnyUndo } from "./use-undo";
import { useUnitPrice } from "./use-unit-price";
import { FeeLinksProvider, type FeeLinks } from "./links";
import { UndoLine } from "./undo-line";
import { GlanceCard, READING_ID } from "./glance";
import { SlotMenu, WhenText, numText } from "./open-case";
import type { Pending } from "./part-edit";
import { TemplatePicker } from "./picker";
import { ToolboxCard, ToolboxColumn } from "./toolbox";
import type { ChargedForm } from "../../lib/fee-deal/offers/capacity";
import { useAskThing } from "./ask-thing";
import { ReadingCards } from "./reading";
import { feeName } from "./words";

/**
 * Where the window is wide enough for the toolbox to have a column of its own, beside the fees' column (the fees' the wider, 1.25 to 1);
 * narrower, it stands under its fee, and on a phone it is a short sheet at the foot of the screen.
 */
const PANEL_COLUMN = "(min-width: 80rem)";
const PHONE = "(max-width: 47.99rem)";


/**
 * Where the focus goes from a saved deal's undo line, after "ביטול" or when it goes: the saved deals' menu, else (no deal saved, so no
 * menu) the deal's name in the bar.
 */
const dealsMenuOrName = () => document.querySelector<HTMLElement>("[data-deals-menu] button") ?? document.querySelector<HTMLElement>("[data-deal-bar] input");

/** The device's day, YYYY-MM-DD, on its own calendar. */
function deviceToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Head() {
  return <PageHead title={copy.title} lede={copy.lede} crumb={<Breadcrumb parent={{ href: "/", label: "" }} current={copy.crumb} />} />;
}

/** The page: the head at once; the bar and the columns once the data and the device's deals are read. */
export function FeeDealPage({ data, failed }: { data: FeesData | null; failed: boolean }) {
  const store = dealStore.use();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(deviceToday()), []);
  // the deal the address names, read once the page has what it needs (a deal in the fragment is opened by the browser's own decompression,
  // which takes a moment): `undefined` while it is read
  const { search, hash } = useLocation();
  const [address, setAddress] = useState<{ deal: FeeDeal; given: boolean } | null | undefined>(undefined);
  useEffect(() => {
    if (!data || !today || address !== undefined) return;
    let on = true;
    void dealOfAddress(search, hash, data, today).then((a) => on && setAddress(a));
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, today]);
  return (
    <div className="flex flex-col gap-6">
      <Head />
      {failed ? (
        <Callout tone="caution">{copy.failed}</Callout>
      ) : data && today && store.ready && address !== undefined ? (
        <Deal data={data} today={today} saved={store.value} writable={store.writable} address={address} />
      ) : (
        <p className="text-muted-foreground">{copy.loading}</p>
      )}
    </div>
  );
}

function Deal({ data, today, saved, writable, address }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; address: { deal: FeeDeal; given: boolean } | null }) {
  const navigate = useNavigate();
  // the deal is opened once, when the page has what it needs: later changes to the address (the page clears it) do not reopen it. A link
  // whose deal is a saved one already opens the saved one.
  const opened = useRef<{ deal: FeeDeal; fromAddress: boolean; given: boolean } | null>(null);
  if (!opened.current) {
    const twin = address?.given ? savedTwin(address.deal, saved) : undefined;
    opened.current = { deal: twin ?? address?.deal ?? saved[0] ?? newDeal(null), fromAddress: address !== null, given: !!address?.given && !twin };
  }
  const [deal, setDeal] = useState<FeeDeal>(opened.current.deal);
  const [chosen, setChosen] = useState<string | null>(deal.fees[0]?.id ?? null);
  // the case open in place in the open fee (its first where none is named, or where the one named is gone), the slot whose menu is open,
  // a part the toolbox added that asks for its figure, month or fee in the case, and the thing whose values the toolbox asks; each belongs
  // to the fee and case it was opened on
  const [caseOpen, setCaseOpen] = useState<{ fee: string; case: string } | null>(null);
  const [menu, setMenu] = useState<{ fee: string; case: string; t: number; at: HTMLElement } | null>(null);
  const [thingOpen, setThingOpen] = useState<{ fee: string; t: number; at: HTMLElement } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  // whether a phone's toolbox sheet is folded to its groups' names: folded as the page loads, so nothing covers it, and unfolded when a
  // fee or a case is opened, or at its handle
  const [sheetFolded, setSheetFolded] = useState(true);
  const panelColumn = useMedia(PANEL_COLUMN);
  const phone = useMedia(PHONE);
  // a thing to change by asks its question in place, in the open fee's block
  const { asking, onAsk, onAskDone, drop: dropAsk } = useAskThing(chosen, phone, setSheetFolded);
  // what the bar's end just did (a template opened a new deal), said for as long as an undo line stays, or until it is closed
  const [said, setSaid] = useState<string | null>(null);
  useEffect(() => {
    if (!said) return;
    const t = window.setTimeout(() => setSaid(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [said]);
  // the template picker, open at the button it was opened from; `pickFrom` says which, and outlives the sheet's closing: the price list
  // step's (a pick opens a new deal) or the track step's (a pick sets the track on this deal)
  const [picker, setPicker] = useState<HTMLElement | null>(null);
  const [pickFrom, setPickFrom] = useState<"new" | "track">("new");
  const openPicker = (from: "new" | "track") => (anchor: HTMLElement) => {
    setPickFrom(from);
    setPicker(anchor);
  };
  const link = useCopyLink(deal);
  // the last change that lost something, while it can be undone (use-undo.ts)
  const { undoing, setUndoing, made, take, setHolding } = useUndo();
  const [focus, setFocus] = useState<FeeFocus | null>(null);
  // the fee under the pointer or the focus in any column, which the others mark
  const [marked, setMarked] = useState<string | null>(null);
  // for half a second after a fee is taken away from the panel, the panel takes no press: the next fee's panel stands where the pointer is
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
      bringIntoView(document.querySelector(`li[data-fee="${CSS.escape(a.fee)}"]`));
      if (!panelColumn) bringIntoView(panelCard.current);
    }
  }, [chosen]);

  // a deal the address gave is saved at once where it is worth saving, as a typed deal is (a kind alone waits for its first fee or name),
  // and the address is cleared, so a reload opens the deal as it is now, not the link again; the empty deal a broken or unknown address
  // opens is a new deal like any other
  useEffect(() => {
    if (!opened.current?.fromAddress) return;
    const given = opened.current.given ? opened.current.deal : null;
    if (given) dealStore.update((ds) => savedIfWorth(ds, given, today) ?? ds);
    navigate({ search: "", hash: "" }, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keep = (next: FeeDeal) => {
    setDeal(next);
    if (worthSaving(next, saved)) dealStore.update((ds) => savedWith(ds, next, today));
  };
  // a change to the deal; an undo line stays through it, and goes by itself where the change touched the part it would put back into
  const change = (next: FeeDeal) => {
    keep(next);
    if (undoing && "dealId" in undoing && !standing(undoing, next)) setUndoing(null);
  };
  // a change that keeps what it took for the undo, in place of any undo before it; one that took nothing the person gave is a plain change
  const kept = (r: (Omit<MaybeUndoable, "undo"> & { undo: Undo | KindUndo | null }) | null) => {
    if (!r) return;
    if (!r.undo) return change(r.deal);
    keep(r.deal);
    setChosen(r.chosen);
    made(r.undo);
  };
  const onFee = (f: Fee) => change(updateFee(deal, f.id, () => f));
  const onAdd = (kind: FeeKindId) => {
    const { deal: next, fee } = addFee(deal, kind, offerFor(kindById(data.kinds, deal.kind), kind).usual ?? undefined);
    change(next);
    setChosen(fee.id);
    setSheetFolded(false);
    setFocus({ fee: fee.id, on: "box" });
  };
  const onRemove = (feeId: string) => kept(removeFeeKept(deal, feeId, chosen));
  const onRemoveInPanel = (feeId: string) => {
    onRemove(feeId);
    setPanelRest(true);
  };
  // another kind of product: the fees it does not have leave the deal, kept for the undo where any of them held something
  const onKind = (id: ProductId) => {
    const to = kindById(data.kinds, id);
    if (to) kept(setKindKept(deal, to, dataBar(id, data, today), chosen));
  };
  const onFill = (feeId: string, house: string) => kept(fillFeeKept(deal, feeId, house, data, chosen));
  const onHoldOn = (feeId: string, side: Side, k: number, caseId: string | undefined, after: ChargedForm) => kept(holdOnKept(deal, feeId, side, k, chosen, caseId, after));
  // a form of the price from the toolbox: what carries over carries, and the price it replaces is kept for the undo, whose line stands
  // under the fee's block without taking the focus; the focus goes to the new price's box, so typing goes on there
  const onForm = (feeId: string, part: PartId, caseId: string | null) => {
    const r = changeFormKept(deal, feeId, part, chosen, caseId ?? undefined);
    if (!r) return;
    if (r.undo) {
      keep(r.deal);
      setUndoing(r.undo);
    } else change(r.deal);
    setPending(null);
    setFocus({ fee: feeId, on: "box" });
  };
  const onRemoveCase = (feeId: string, caseId: string) => {
    setMenu(null);
    kept(removeCaseKept(deal, feeId, caseId, chosen));
  };
  // the price stops changing by a thing: the cases that then differ in nothing merge, kept for the undo, whose line says what merged. The
  // menu it is chosen in closes first: while it is open the page behind it takes no focus, and on closing it gives the focus back to its
  // pill, so the change is made once it has closed, and the undo line then takes the focus from the pill it takes away
  const onRemoveBy = (feeId: string, t: number) => {
    const r = removeByKept(deal, feeId, t, chosen);
    const menuOpen = document.querySelector("dialog[open]");
    setThingOpen(null);
    setMenu(null);
    if (menuOpen) menuOpen.addEventListener("close", () => kept(r), { once: true });
    else kept(r);
  };
  // the fee put back takes the focus on its card; a fill's and a stage's lines hand it on themselves
  const onUndo = () => {
    if (!undoing) return;
    const u = undoing;
    setUndoing(null);
    if (!("dealId" in u)) {
      const back = undoDelete(saved, u);
      if (!back) return;
      dealStore.update(() => back);
      if (u.shown) open(u.deal);
      return;
    }
    const back = undo(deal, u, chosen);
    if (!back) return;
    keep(back.deal);
    setChosen(back.chosen);
    if (u.what.kind === "remove") setFocus({ fee: u.what.feeId, on: "card" });
  };
  // a case opened in place is brought into view once drawn: under the header, and above a phone's sheet, which unfolds with it
  const [caseShown, setCaseShown] = useState(0);
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
        bringIntoView(document.querySelector(`li[data-fee="${CSS.escape(feeId)}"]`));
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

  // another deal on screen: a saved one, a new one or one a template filled; a new deal is saved once it is worth saving
  const open = (next: FeeDeal) => {
    setDeal(next);
    setChosen(next.fees[0]?.id ?? null);
    setSheetFolded(true);
    setThingOpen(null);
    setSaid(null);
    setUndoing(null);
    link.closeBlocked();
  };
  const onOpen = (id: string) => {
    const d = saved.find((x) => x.id === id);
    if (d) open(d);
  };
  const onRename = (id: string, name: string) => {
    if (id === deal.id) return change({ ...deal, name });
    const d = saved.find((x) => x.id === id);
    if (d) dealStore.update((ds) => ds.map((x) => (x.id === id ? { ...d, name } : x)));
  };
  // deleting a saved deal asks nothing and can be undone; the deal on screen deleted opens the next saved deal, or a new one
  const onDelete = (id: string) => {
    const r = deleteDealKept(saved, id, deal.id);
    if (!r) return;
    dealStore.update(() => r.deals);
    if (r.undo.shown) open(r.deals[0] ?? newDeal(null));
    made(r.undo);
  };
  // each house's plans are its ways to buy what the deal holds
  const options = useMemo(() => templateOptions(deal.kind, data, today), [deal.kind, data, today]);
  const onPick = (id: string) => {
    setPicker(null);
    if (pickFrom === "track") {
      const next = pickTrack(deal, id, data, today);
      if (!next) return;
      change(next);
      if (!next.fees.some((f) => f.id === chosen)) setChosen(next.fees[0]?.id ?? null);
      return;
    }
    const next = dealFromTemplate(deal, id, data, today);
    if (!next) return;
    dealStore.update((ds) => savedWith(ds, next, today));
    open(next);
    const name = next.template?.name ?? "";
    setSaid(copy.end.opened[templateSource(id)](name) + (writable ? copy.end.kept : ""));
  };
  // what each price list leaves out of a deal of this kind and holding, for the picker; a track's the new deal says
  const pickerLeft = useMemo(() => {
    const m = new Map<string, LeftOut[]>();
    if (!picker) return m;
    const probe: FeeDeal = newDeal(deal.kind);
    for (const o of options) if (o.source === "house") m.set(o.id, templateOf(probe, o.id, data, today)?.left ?? []);
    return m;
  }, [picker, options, deal.kind, data, today]);
  // what the template left out, and what a house's record says its price leaves out (D106), only where it filled the deal's fees: a track
  // set on a deal whose fees it kept left nothing out of them
  const filled = useMemo(() => {
    const t = deal.template && !deal.template.feesKept ? templateOf(deal, deal.template.id, data, today) : null;
    return t ? { left: t.left, leftOut: t.leftOut ?? null } : null;
  }, [deal, data, today]);

  const kind = kindById(data.kinds, deal.kind);
  // the deal is read once for every view; choosing another fee builds only its panel again
  const read = useMemo(() => readDealFor(deal, data.kinds, today), [deal, data.kinds, today]);
  // the glance and the panel for a deal with a fee, the reading for one with a fee read: one with none shows neither
  // a fee the product may not charge by rule is never offered
  const bar = useMemo(() => dataBar(deal.kind, data, today), [deal.kind, data, today]);
  const { unitPrice, onUnitPrice } = useUnitPrice(read, deal.id);
  const summary = useMemo(() => (read.deal.fees.length > 0 ? glance(read) : null), [read]);
  const views = useMemo(() => (summary ? { glance: summary, reading: readingOf(read, data.fx, unitPrice) } : null), [summary, read, data.fx, unitPrice]);
  const chosenFeeNow = deal.fees.find((f) => f.id === chosen) ?? null;
  // the case open: the one named while its fee has it, else the fee's first
  const caseId = chosenFeeNow && hasCases(chosenFeeNow) ? (caseOpen?.fee === chosenFeeNow.id && chosenFeeNow.cases.some((c) => c.id === caseOpen.case) ? caseOpen.case : chosenFeeNow.cases[0]!.id) : null;
  const builderView = useMemo(() => builder(read, bar, chosen ? { fee: chosen, case: caseId } : null), [read, bar, chosen, caseId]);
  useEffect(() => {
    if (!caseShown) return;
    // after the frame, where the sheet has unfolded and the case has its height
    const f = requestAnimationFrame(() => bringIntoView(document.querySelector("[data-open-case]")));
    return () => cancelAnimationFrame(f);
  }, [caseShown]);
  const panel = useMemo(() => (chosen ? panelOf(read, chosen, caseId ?? undefined) : null), [read, chosen, caseId]);
  const tools = useMemo(() => (chosen ? toolboxOf(read, chosen, caseId ?? undefined) : null), [read, chosen, caseId]);
  const slot = menu && menu.fee === chosen && menu.case === caseId ? slotEdit(read, menu.fee, menu.case, menu.t) : null;
  const thingView = thingOpen && thingOpen.fee === chosen ? thingMenu(read, thingOpen.fee, thingOpen.t) : null;
  const hasTracks = options.some((o) => o.source === "track");
  const hasHouses = options.some((o) => o.source === "house");
  // a product that saves charges its fees from what has built up: a share of what is held reads so
  const saves = !!kind?.bases.includes("balance");
  const nameOf = (feeId: string) => {
    const f = deal.fees.find((x) => x.id === feeId);
    return f ? feeName(f.kind, f.name) : feeId;
  };
  const chosenFee = deal.fees.find((f) => f.id === chosen) ?? null;
  const priceLists = useMemo(() => (chosenFee && chosenFee.kind !== "own" ? feePriceLists(deal, chosenFee.kind, data) : []), [chosenFee, deal, data]);
  // the undo on screen: a deal's change only while what it took has a place on the deal on screen; its words, which the live region says too
  const shown = undoing && ("dealId" in undoing ? standing(undoing, deal) : true) ? undoing : null;
  const undoWords = (u: AnyUndo): string => {
    if (!("dealId" in u)) return `${copy.end.deleted}${dealLabel(u.deal, kindById(data.kinds, u.deal.kind)?.name ?? null)}.`;
    return feeUndoWords(u, (f) => feeName(f.kind, f.name), data);
  };
  const words = shown ? undoWords(shown) : null;
  const lines = undoLines(shown, words, chosen, { onUndo, onHold: setHolding, take });
  const readSome = read.fees.length > 0;
  const groupOf = (fee: Fee) => feeGroup(read, fee, saves);
  // the toolbox for the open case: in a column of its own where the window has the room, sticking under the header as the fees scroll by;
  // on a phone a short sheet pinned to the foot of the screen; else right under its fee
  const toolboxView =
    views && panel && tools && chosenFee ? (
      <ToolboxColumn
        key={chosenFee.id}
        view={tools}
        fee={chosenFee}
        caseId={caseId}
        sheet={phone}
        product={deal.kind}
        fill={priceLists.length > 0 ? { houses: priceLists, onFill: (h) => onFill(chosenFee.id, h) } : null}
        line={lines.fill}
        folded={sheetFolded}
        onFold={setSheetFolded}
        onAsk={onAsk}
        onFee={onFee}
        onForm={(part) => onForm(chosenFee.id, part, caseId)}
        onPending={(part) => setPending({ fee: chosenFee.id, case: caseId, part })}
        onRemove={onRemoveInPanel}
        onClose={onClosePanel}
      />
    ) : null;
  const panelView =
    toolboxView && !phone ? (
      <ToolboxCard cardRef={panelCard} column={panelColumn} rest={panelRest} onClose={onClosePanel}>
        {toolboxView}
      </ToolboxCard>
    ) : null;
  // the reading's picks: one for each thing the deal's fees change by that it picks, each changed on the deal (its link carries them)
  const picks = views?.reading.picks;
  const pickWords = (w: Parameters<typeof WhenText>[0]["words"]) => (w.figure ? `${w.lead ?? ""}${numText(w.figure)}` : (w.text ?? ""));

  return (
    <FeeLinksProvider value={links}>
      <DealBar
        deal={deal}
        kind={kind}
        writable={writable}
        onDeal={change}
        end={
          <BarEnd
            deal={deal}
            saved={saved}
            kindName={(d) => kindById(data.kinds, d.kind)?.name ?? null}
            copied={link.copied}
            onCopy={() => void link.copyLink()}
            onOpen={onOpen}
            onNew={() => open(newDeal(null))}
            onRename={onRename}
            onDelete={onDelete}
          />
        }
      />
      {/* for a screen reader: what the undo line says, else what the page just did (a price list opened a new deal, the link was copied) */}
      <p role="status" className="sr-only">
        {words ?? said ?? (link.copied ? copy.end.copied : "")}
      </p>
      {lines.deal && (
        <UndoLine key={`undo:deal:${(shown as DealUndo).deal.id}`} as="div" onUndo={onUndo} onHold={setHolding} take={take(shown!)} refocusOnUndo refocus={dealsMenuOrName}>
          {lines.deal}
        </UndoLine>
      )}
      {(said || link.blocked) && (
        <div className="come-in flex flex-col gap-1.5 text-sm">
          {said && (
            <p className="flex flex-wrap items-center gap-x-3">
              <span>{said}</span>
              <Button variant="quiet" size="sm" flush wide onClick={() => setSaid(null)}>
                {copy.end.dismiss}
              </Button>
            </p>
          )}
          {link.blocked && (
            <>
              <p className="text-muted-foreground">{copy.end.copyBlocked}</p>
              <textarea readOnly dir="ltr" rows={2} aria-label={copy.end.linkField} value={link.blocked} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-card p-3 font-mono text-base select-all" />
            </>
          )}
        </div>
      )}
      <TemplatePicker open={picker !== null} onClose={() => setPicker(null)} anchor={picker} options={options} left={pickerLeft} newDeal={pickFrom === "new"} product={kind?.name ?? null} onPick={onPick} />
      {/* the columns for entering the deal, in the page in their reading order, so the Tab key reads them as the eye does: what the deal
          is (21rem), its fees, and where the window has the room the chosen fee's panel, the two sharing the rest 1.25 to 1; narrower, the panel
          stands under its card in the fees' column, and a phone stacks the two columns. Each column has its own place in the grid
          whatever the deal holds, so the first fee, and the panel coming with it, move nothing. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] min-[80rem]:grid-cols-[minmax(0,21rem)_minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <SetupColumn
            deal={deal}
            view={builderView}
            kinds={data.kinds}
            onPickTrack={hasTracks ? openPicker("track") : null}
            onTemplates={hasHouses ? openPicker("new") : null}
            filled={filled}
            kindLine={lines.kind}
            onDeal={change}
            onKind={onKind}
          />
        </Card>
        {kind && (
          <Card className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
            <FeesColumn
              deal={deal}
              view={builderView}
              groupOf={groupOf}
              open={{ fee: chosen, case: caseId, view: panel?.open ?? null, pending: pending && pending.fee === chosen && pending.case === caseId ? pending.part : null, menu: slot && menu ? menu.t : null, thing: thingView && thingOpen ? thingOpen.t : null }}
              toolbox={panelColumn || phone ? null : panelView}
              line={lines.fee}
              caseLine={lines.case}
              focus={focus}
              onFocused={() => setFocus(null)}
              onDeal={change}
              onAdd={onAdd}
              actions={{
                onOpen: onOpenCase,
                onSlot: (t, at) => setMenu((m) => (m && m.t === t && m.fee === chosen && m.case === caseId ? null : chosen && caseId ? { fee: chosen, case: caseId, t, at } : null)),
                onThing: (t, at) => setThingOpen((m) => (m && m.t === t && m.fee === chosen ? null : chosen ? { fee: chosen, t, at } : null)),
                onRemoveCase,
                onHoldOn,
                onPendingDone: () => setPending(null),
                onAskDone,
              }}
              ask={asking && asking.fee === chosen ? asking.kind : null}
            />
          </Card>
        )}
        {panelColumn && panelView}
      </div>
      {/* the open slot's menu: beside its pill on a computer, a sheet on a phone */}
      <ValueMenuSheet open={!!slot} onClose={() => setMenu(null)} anchor={slot ? menu!.at : null} label={slot?.title ?? ""}>
        {slot && menu && chosenFeeNow && <SlotMenu key={`${menu.fee}:${menu.case}:${menu.t}`} edit={slot} fee={chosenFeeNow} caseId={menu.case} t={menu.t} top={panel?.open.slots[menu.t]?.words.figure ?? null} onFee={onFee} />}
      </ValueMenuSheet>
      {/* a thing of the open fee's band head: its values in the cases, and the action that stops the price changing by it */}
      <ValueMenuSheet open={!!thingView} onClose={() => setThingOpen(null)} anchor={thingView ? thingOpen!.at : null} label={thingView?.name ?? ""}>
        {thingView && thingOpen && <ThingMenu title={thingView.title} values={thingView.values.map((w) => ({ text: <WhenText words={w} />, any: w.any }))} stop={thingView.stop} onStop={() => onRemoveBy(thingOpen.fee, thingOpen.t)} after={thingView.after} />}
      </ValueMenuSheet>
      {views && (
        <Section id={READING_ID} title={copy.reading}>
          {picks && (
            <div className="mb-4">
              <ReadForBand
                lead={picks.title}
                note={picks.line}
                picks={picks.things.map((t) => ({ name: t.words, items: t.options.map((o) => ({ id: o.is, label: pickWords(o.words) })), value: t.chosen, onSelect: (is: string) => change(setPick(deal, t.by, is)) }))}
              />
            </div>
          )}
          {/* the chart's chosen period belongs to the deal it was chosen on: another deal starts from its own */}
          <ReadingCards
            key={deal.id}
            reading={views.reading}
            saved={saves}
            fx={data.fx}
            read={readSome}
            unitPrice={unitPrice}
            onUnitPrice={onUnitPrice}
            glance={<GlanceCard glance={views.glance} law={views.reading.law} saved={saves} names={nameOf} empty={!readSome} />}
          />
        </Section>
      )}
      {/* a phone's toolbox, pinned to the foot of the screen, keeps its room at the end of the document */}
      {phone && toolboxView}
    </FeeLinksProvider>
  );
}
