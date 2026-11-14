// The fee page (method §10.6): the head, the bar of the deal, the columns for entering it (a card with what the deal is about as a line over
// its fees, and the toolbox for the case open in place), and under them the reading, which opens with the picks it is read for and the deal at a glance. The deal is kept
// on this device, saved as it changes from its first fee or a typed name. It opens from the address (a deal in `#d=`, or in `?d=` as links
// were written before, the saved one where the link's deal is one already; a kind in `?wrapper=`, a track in `?track=`), else the deal
// last worked on, else an empty deal with the kinds to choose from. "Today" is the device's day, read after the page loads: the
// pre-rendered page shows the head and the words that it is loading, never a deal of another day. The bar's end opens another saved deal
// or a new one, and copies the deal's link. The line's "לבחור תבנית" opens the template picker, where a price list opens a new deal
// beside this one; its track's button opens the tracks, and the track picked is set on the deal on screen (`pickTrack`). A deal with no
// kind shows its kinds to choose from alone, a deal with a kind the line over its fees, in the card's one place, so the first fee moves
// nothing; the toolbox comes with a fee open, and the reading with the first fee. One fee is open at a time, and one case of it: a tap on
// a slim fee or a case's row opens it in place, a tap on its slot, or on a thing of its band's head, opens that one's menu, which the page holds. The toolbox stands in a
// column of its own where the window has the room, under its fee in a middling window, and on a phone in a short sheet pinned to the
// foot of the screen, the page keeping room under its end for it; the sheet comes folded to its groups' names with a deal, and unfolds
// when a fee or a case is opened. The columns and the reading are one thing: a fee under the pointer or
// the focus in one is marked in the others, and a fee's name in the summary or the reading opens it (`FeeLinks`). On a computer a card
// dragged from the toolbox onto the open fee, or one of its cases, does there what its tap does (`ToolDrop`). A change that loses
// something (a fee taken away, a fee filled from a price list, a price, a case or a thing taken away, a saved deal deleted) leaves one
// undo line where it happened (lib/fee-deal/undo.ts), which takes the focus as it appears and lives through edits elsewhere until it is
// undone, a newer such change replaces it, another deal opens, the part it would put back into changes, or ten seconds pass while neither
// the focus nor the pointer is on it.
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import type { ProductId } from "@finance-tool/schema";
import { dealCases, feeDeal as copy } from "../../copy";
import { builder } from "../../lib/fee-deal/rows";
import { panel as panelOf } from "../../lib/fee-deal/panel";
import { toolbox as toolboxOf } from "../../lib/fee-deal/toolbox";
import { slotEdit, thingMenu } from "../../lib/fee-deal/things";
import { addOfferedFee, setPick, updateFee } from "../../lib/fee-deal/edits/deal";
import { hasCases, newDeal, pricedOf, toolPrice, type Fee, type FeeDeal, type Side } from "../../lib/fee-deal/model";
import { pickKind, type ByKind } from "../../lib/fee-deal/offers/conditions";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { glance } from "../../lib/fee-deal/glance";
import { readingOf } from "../../lib/fee-deal/reading";
import { kindById } from "../../lib/fee-deal/kinds";
import { productOffered } from "../../lib/fee-deal/offers/offer";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { dealStore, savedWith } from "../../lib/fee-deal/store";
import { copyHouseFee, dataBar, feeAlone, feePriceLists, housesToCopy, templateSource } from "../../lib/fee-deal/templates";
import { fillFeeKept, liftKept, removeByKept, removeChangeKept, removeCaseKept, removeFeeKept, setKindKept, type DealUndo } from "../../lib/fee-deal/undo";
import { binTakes, liftDrop, liftedOf, liftRemove, liftTakes, liftWhy } from "../../lib/fee-deal/lifted";
import { cardThing } from "../../lib/fee-deal/toolbox";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { useMedia } from "../../lib/hooks";
import { Callout, Card, PageHead, ReadForBand, Section, ThingMenu, ValueMenuSheet } from "../kit";
import { DealBar } from "./bar";
import { BarEnd, useCopyLink } from "./bar-end";
import { FeesColumn, Palette, SetupStrip, feeGroup, paletteItems } from "./builder";
import { DealColumns } from "./deal-columns";
import { DealNotices, useSaid } from "./deal-notices";
import { FeeLinksProvider } from "./links";
import { partPlaceId } from "./figures";
import { UndoLine } from "./undo-line";
import { GlanceCard, READING_ID } from "./glance";
import { SlotMenu, WhenText, whenText } from "./open-case";
import { TemplatePicker } from "./picker";
import { ToolboxCard, ToolboxColumn, applyTool, type ToolHands } from "./toolbox";
import type { LiftHands, ToolDrop } from "./fee-block";
import { ReadingCards } from "./reading";
import { useUnitPrice } from "./use-unit-price";
import { useDealDocument, useOpenedDeal, type AddressDeal } from "./use-deal-document";
import { useOpenCase } from "./use-open-case";
import { useTemplatePicker } from "./use-template-picker";
import { feeName } from "./words";

/**
 * Where the window is wide enough for the toolbox to have a column of its own (28rem), beside the fees, which take the rest; narrower, it
 * stands under its fee, and on a phone it is a short sheet at the foot of the screen.
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
  const [address, setAddress] = useState<AddressDeal | undefined>(undefined);
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

/**
 * The deal on screen and its views: its document (use-deal-document.ts), the fee open in place (use-open-case.ts), the template picker
 * (use-template-picker.ts), and the deal read once for every view, of which the columns, the toolbox, the menus and the reading are drawn.
 */
function Deal({ data, today, saved, writable, address }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; address: AddressDeal }) {
  const first = useOpenedDeal(address, saved, today);
  // another deal on screen (a saved one, a new one, one a template filled, or one an undo brought back): what belonged to the deal before
  // goes, and a new deal is saved once it is worth saving
  const doc = useDealDocument({ first, saved, today, data, onShown: () => afterShow() });
  const { deal, chosen, change, kept } = doc;
  const panelColumn = useMedia(PANEL_COLUMN);
  const phone = useMedia(PHONE);
  // the deal is read once for every view; choosing another fee builds only its panel again
  const read = useMemo(() => readDealFor(deal, data.kinds, today), [deal, data.kinds, today]);
  const oc = useOpenCase({ deal, read, chosen, setChosen: doc.setChosen, phone, panelColumn });
  const { caseId } = oc;
  const chosenFee = oc.fee;
  const { said, setSaid } = useSaid();
  const link = useCopyLink(deal);

  const afterShow = () => {
    oc.reset();
    setSaid(null);
    link.closeBlocked();
  };
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
    const { deal: next, fee } = addOfferedFee(deal, kindById(data.kinds, deal.kind), kind);
    change(next);
    doc.setChosen(fee.id);
    oc.sheet.unfold();
    doc.setFocus({ fee: fee.id, on: "box" });
  };
  // the open fee's bin, beside its name: the fee's undo line takes its place, as tall as its block was, and stands where the block stood on
  // the screen whichever fee opens in its stead, the next or, after the last, the one above (`UndoLine.standAt`), so a second press of a
  // double-click lands on the line, never in the fee that opened
  const onRemoveFee = (feeId: string) => kept(removeFeeKept(deal, feeId, chosen));
  // another kind of product: the fees it does not have leave the deal, kept for the undo where any of them held something
  const onKind = (id: ProductId) => {
    const to = kindById(data.kinds, id);
    if (to) kept(setKindKept(deal, to, dataBar(id, data, today), chosen));
  };
  const onRemoveChange = (feeId: string, side: Side, k: number, caseId: string | undefined) => kept(removeChangeKept(deal, feeId, side, k, chosen, caseId));
  // the price of the open case the person is in, where the case has several over time: the toolbox adds to it, the panel's question asks
  // on it, a form changes it; it belongs to the fee and case it was set in, and any other open goes back to the last price
  const [editing, setEditing] = useState<{ fee: string; case: string | null; k: number } | null>(null);
  const editingK = editing && editing.fee === chosen && editing.case === caseId ? editing.k : undefined;
  const onForm = (feeId: string, part: PartId, caseId: string | null) => {
    if (doc.changeForm(feeId, part, caseId, feeId === chosen && caseId === oc.caseId ? editingK : undefined)) oc.pending.set(null);
  };
  const onRemoveCase = (feeId: string, caseId: string) => {
    oc.menus.closeSlot();
    kept(removeCaseKept(deal, feeId, caseId, chosen));
  };
  // the price stops changing by a thing: the cases that then differ in nothing merge, kept for the undo, whose line says what merged. The
  // menu it is chosen in closes first: while it is open the page behind it takes no focus, and on closing it gives the focus back to its
  // pill, so the change is made once it has closed, and the undo line then takes the focus from the pill it takes away
  const onRemoveBy = (feeId: string, t: number) => {
    const r = removeByKept(deal, feeId, t, chosen);
    const menuOpen = document.querySelector("dialog[open]");
    oc.menus.closeThing();
    oc.menus.closeSlot();
    if (menuOpen) menuOpen.addEventListener("close", () => kept(r), { once: true });
    else kept(r);
  };
  // a thing the fee changes by, tapped again in the toolbox: as its bin in the band
  const onStopBy = (feeId: string, kind: ByKind) => {
    const fee = deal.fees.find((f) => f.id === feeId);
    const t = fee && hasCases(fee) ? fee.by.findIndex((x) => pickKind(x.kind) === pickKind(kind)) : -1;
    if (t >= 0) onRemoveBy(feeId, t);
  };
  const onDelete = doc.remove;

  const kind = kindById(data.kinds, deal.kind);
  // a fee the product may not charge by rule is never offered
  const bar = useMemo(() => dataBar(deal.kind, data, today), [deal.kind, data, today]);
  // the products the picker offers: each with a fee it is offered, the fees its data bars left out
  const offeredKinds = useMemo(() => data.kinds.filter((k) => productOffered(k, dataBar(k.id, data, today))), [data, today]);
  const { unitPrice, onUnitPrice } = useUnitPrice(read, deal.id);
  // the glance and the panel for a deal with a fee, the reading for one with a fee read: one with none shows neither
  const summary = useMemo(() => (read.deal.fees.length > 0 ? glance(read) : null), [read]);
  const views = useMemo(() => (summary ? { glance: summary, reading: readingOf(read, data.fx, unitPrice) } : null), [summary, read, data.fx, unitPrice]);
  const builderView = useMemo(() => builder(read, bar, chosen ? { fee: chosen, case: caseId } : null), [read, bar, chosen, caseId]);
  const pending = oc.pending.here;
  const panel = useMemo(() => (chosen ? panelOf(read, chosen, caseId ?? undefined, pending, editingK) : null), [read, chosen, caseId, pending, editingK]);
  const tools = useMemo(() => (chosen ? toolboxOf(read, chosen, caseId ?? undefined, editingK) : null), [read, chosen, caseId, editingK]);
  // a toolbox card dropped on the open fee (`caseId` null: a slim fee, or the fee as a whole) or one of its cases takes it where that case's
  // own toolbox offers it and the case has it not yet; dropped on another case than the open one, that case opens first
  const toolsFor = (feeId: string, at: string | null) => (feeId !== chosen ? null : at === null || at === caseId ? tools : toolboxOf(read, feeId, at));
  const drop: ToolDrop = {
    accepts: (feeId, at, item) => !!toolsFor(feeId, at)?.groups.some((g) => g.parts.some((x) => x.id === item && !x.used && !x.off)),
    onDrop: (feeId, at, item) => {
      const fee = deal.fees.find((f) => f.id === feeId);
      if (!fee) return;
      // a thing to change by dropped on one case's head or cell splits that case alone
      const thing = cardThing(item);
      if (thing && at !== null && hasCases(fee)) return oc.ask.onAsk(thing, at);
      const on = at ?? caseId;
      if (on !== caseId) oc.onOpenCase(feeId, on, "pointer");
      applyTool(item, fee, on, toolPrice(pricedOf(fee, on ?? undefined), on === caseId ? editingK : undefined), {
        onAsk: oc.ask.onAsk,
        onPending: (part) => oc.pending.set({ fee: feeId, case: on, part }),
        onForm: (part) => onForm(feeId, part, on),
        onPart: onPart(fee),
      });
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
    phone,
  };
  const menu = oc.menus.slot;
  const thingOpen = oc.menus.thing;
  const slot = menu && menu.fee === chosen && menu.case === caseId ? slotEdit(read, menu.fee, menu.case, menu.t) : null;
  const thingView = thingOpen && thingOpen.fee === chosen ? thingMenu(read, thingOpen.fee, thingOpen.t) : null;
  // a product that saves charges its fees from what has built up: a share of what is held reads so
  const saves = !!kind?.bases.includes("balance");
  const nameOf = (feeId: string) => {
    const f = deal.fees.find((x) => x.id === feeId);
    return f ? feeName(f.kind, f.name) : feeId;
  };
  const priceLists = useMemo(() => (chosenFee && chosenFee.kind !== "own" ? feePriceLists(deal, chosenFee.kind, data) : []), [chosenFee, deal, data]);
  const { shown, words } = doc.undo;
  const lines = doc.undo.lines;
  const readSome = read.fees.length > 0;
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
        fill={priceLists.length > 0 ? { houses: priceLists, onFill: (h) => kept(fillFeeKept(deal, chosenFee.id, h, data, chosen)) } : null}
        line={lines.fill}
        folded={oc.sheet.folded}
        onFold={oc.sheet.setFolded}
        onAsk={oc.ask.onAsk}
        onFee={onFee}
        onPart={onPart(chosenFee)}
        onForm={(part) => onForm(chosenFee.id, part, caseId)}
        onPending={(part) => oc.pending.set({ fee: chosenFee.id, case: caseId, part })}
        onStopBy={(kind) => onStopBy(chosenFee.id, kind)}
        onClose={oc.onClosePanel}
      />
    ) : null;
  const panelView =
    toolboxView && !phone ? (
      <ToolboxCard cardRef={oc.panel.card} column={panelColumn} onClose={oc.onClosePanel}>
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
            return;
          }
          const r = copyHouseFee(deal, house, k, "beside", data);
          if (!r) return;
          change(r.deal);
          doc.setChosen(r.feeId);
        },
      }
    : null;
  const adding = panelColumn ? (panelView ? ("line" as const) : null) : { palette, copy: copyFee };
  const paletteColumn = panelColumn && !panelView && kind && palette.length > 0 ? (
    <Card className="min-[80rem]:sticky min-[80rem]:top-20">
      <Palette items={palette} onAdd={onAdd} copy={copyFee} />
    </Card>
  ) : null;
  // the reading's picks: one for each thing the deal's fees change by that it picks, each changed on the deal (its link carries them)
  const picks = views?.reading.picks;

  return (
    <FeeLinksProvider value={oc.links}>
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
            onOpen={(id) => {
              const d = saved.find((x) => x.id === id);
              if (d) open(d);
            }}
            onNew={() => open(newDeal(null))}
            onRename={doc.rename}
            onDelete={onDelete}
          />
        }
      />
      {/* for a screen reader: what the undo line says, else what the page just did (a price list opened a new deal, the link was copied);
          where the browser would not copy the link, the link to copy by hand */}
      <DealNotices
        status={words ?? said ?? (link.copied ? copy.end.copied : "")}
        undoLine={
          lines.deal && (
            <UndoLine key={`undo:deal:${(shown as DealUndo).deal.id}`} as="div" onUndo={onUndo} onHold={doc.undo.setHolding} take={doc.undo.take(shown!)} refocusOnUndo refocus={dealsMenuOrName}>
              {lines.deal}
            </UndoLine>
          )
        }
        said={said}
        blocked={link.blocked}
        onDismiss={() => setSaid(null)}
      />
      <TemplatePicker open={picker.anchor !== null} onClose={picker.onClose} anchor={picker.anchor} options={picker.options} left={picker.left} newDeal={picker.newDeal} product={kind?.name ?? null} onPick={picker.onPick} />
      <DealColumns
        setup={<SetupStrip deal={deal} kinds={data.kinds} offered={offeredKinds} onPickTrack={picker.onPickTrack} onTemplates={picker.onTemplates} filled={picker.filled} kindLine={lines.kind} onKind={onKind} />}
        fees={
          kind && (
            <FeesColumn
              deal={deal}
              view={builderView}
              groupOf={(fee: Fee) => feeGroup(read, fee, saves)}
              open={{ fee: chosen, case: caseId, view: panel?.open ?? null, menu: slot && menu ? menu.t : null, thing: thingView && thingOpen ? thingOpen.t : null }}
              toolbox={panelColumn || phone ? null : panelView}
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
                onRemoveBy,
                drop,
                onRemoveChange,
                onEditPrice: (feeId, caseId, k) => setEditing({ fee: feeId, case: caseId ?? null, k }),
                pendingHands: { onDone: () => oc.pending.set(null), fresh: oc.pending.fresh, onShown: oc.pending.onShown },
                onAskDone: oc.ask.onAskDone,
                lift: liftHands,
              }}
              ask={oc.ask.asking && oc.ask.asking.fee === chosen ? { kind: oc.ask.asking.kind, ...(oc.ask.asking.split ? { split: oc.ask.asking.split } : {}) } : null}
              adding={adding}
            />
          )
        }
        toolbox={panelColumn ? (panelView ?? paletteColumn) : null}
      />
      {/* the open slot's menu: beside its pill on a computer, a sheet on a phone */}
      <ValueMenuSheet open={!!slot} onClose={oc.menus.closeSlot} anchor={slot ? menu!.at : null} label={slot?.title ?? ""}>
        {slot && menu && chosenFee && <SlotMenu key={`${menu.fee}:${menu.case}:${menu.t}`} edit={slot} fee={chosenFee} caseId={menu.case} t={menu.t} top={panel?.open.slots[menu.t]?.words.figure ?? null} onFee={onFee} />}
      </ValueMenuSheet>
      {/* a thing of the open fee's band head: its values in the cases, and the action that stops the price changing by it */}
      <ValueMenuSheet open={!!thingView} onClose={oc.menus.closeThing} anchor={thingView ? thingOpen!.at : null} label={thingView?.name ?? ""}>
        {thingView && thingOpen && <ThingMenu title={thingView.title} values={thingView.values.map((w) => ({ text: <WhenText words={w} />, any: w.any }))} stop={thingView.stop} onStop={() => onRemoveBy(thingOpen.fee, thingOpen.t)} after={thingView.after} />}
      </ValueMenuSheet>
      {views && (
        <Section id={READING_ID} title={copy.reading}>
          {picks && (
            <div className="mb-4">
              <ReadForBand
                lead={picks.title}
                note={picks.line}
                picks={picks.things.map((t) => ({ name: t.words, items: t.options.map((o) => ({ id: o.is, label: whenText(o.words) })), value: t.chosen, onSelect: (is: string) => change(setPick(deal, t.by, is)) }))}
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
