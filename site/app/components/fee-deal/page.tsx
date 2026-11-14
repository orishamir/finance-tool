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
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import { builder } from "../../lib/fee-deal/rows";
import { panel as panelOf } from "../../lib/fee-deal/panel";
import { toolbox as toolboxOf } from "../../lib/fee-deal/toolbox";
import { slotEdit, thingMenu } from "../../lib/fee-deal/things";
import { addOfferedFee, setPick, updateFee } from "../../lib/fee-deal/edits/deal";
import { newDeal, type Fee, type FeeDeal, type Side } from "../../lib/fee-deal/model";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import type { ChargedForm } from "../../lib/fee-deal/offers/capacity";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { glance } from "../../lib/fee-deal/glance";
import { readingOf } from "../../lib/fee-deal/reading";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { dealStore, savedWith } from "../../lib/fee-deal/store";
import { dataBar, feePriceLists, templateSource } from "../../lib/fee-deal/templates";
import { fillFeeKept, holdOnKept, removeByKept, removeCaseKept, removeFeeKept, setKindKept, type DealUndo } from "../../lib/fee-deal/undo";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { useMedia } from "../../lib/hooks";
import { Callout, PageHead, ReadForBand, Section, ThingMenu, ValueMenuSheet } from "../kit";
import { DealBar } from "./bar";
import { BarEnd, useCopyLink } from "./bar-end";
import { FeesColumn, SetupColumn, feeGroup } from "./builder";
import { DealColumns } from "./deal-columns";
import { DealNotices, useSaid } from "./deal-notices";
import { FeeLinksProvider } from "./links";
import { UndoLine } from "./undo-line";
import { GlanceCard, READING_ID } from "./glance";
import { SlotMenu, WhenText, whenText } from "./open-case";
import { TemplatePicker } from "./picker";
import { ToolboxCard, ToolboxColumn } from "./toolbox";
import { ReadingCards } from "./reading";
import { useUnitPrice } from "./use-unit-price";
import { useDealDocument, useOpenedDeal, type AddressDeal } from "./use-deal-document";
import { useOpenCase } from "./use-open-case";
import { useTemplatePicker } from "./use-template-picker";
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
  const doc = useDealDocument({ first, saved, today, data });
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

  // another deal on screen: a saved one, a new one or one a template filled; a new deal is saved once it is worth saving
  const afterShow = () => {
    oc.reset();
    setSaid(null);
    link.closeBlocked();
  };
  const open = (next: FeeDeal) => {
    doc.show(next);
    afterShow();
  };
  const onUndo = () => {
    if (doc.onUndo()) afterShow();
  };
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
  const onAdd = (kind: FeeKindId) => {
    const { deal: next, fee } = addOfferedFee(deal, kindById(data.kinds, deal.kind), kind);
    change(next);
    doc.setChosen(fee.id);
    oc.unfold();
    doc.setFocus({ fee: fee.id, on: "box" });
  };
  const onRemoveInPanel = (feeId: string) => {
    kept(removeFeeKept(deal, feeId, chosen));
    oc.rest();
  };
  // another kind of product: the fees it does not have leave the deal, kept for the undo where any of them held something
  const onKind = (id: ProductId) => {
    const to = kindById(data.kinds, id);
    if (to) kept(setKindKept(deal, to, dataBar(id, data, today), chosen));
  };
  const onHoldOn = (feeId: string, side: Side, k: number, caseId: string | undefined, after: ChargedForm) => kept(holdOnKept(deal, feeId, side, k, chosen, caseId, after));
  const onForm = (feeId: string, part: PartId, caseId: string | null) => {
    if (doc.changeForm(feeId, part, caseId)) oc.setPending(null);
  };
  const onRemoveCase = (feeId: string, caseId: string) => {
    oc.closeMenu();
    kept(removeCaseKept(deal, feeId, caseId, chosen));
  };
  // the price stops changing by a thing: the cases that then differ in nothing merge, kept for the undo, whose line says what merged. The
  // menu it is chosen in closes first: while it is open the page behind it takes no focus, and on closing it gives the focus back to its
  // pill, so the change is made once it has closed, and the undo line then takes the focus from the pill it takes away
  const onRemoveBy = (feeId: string, t: number) => {
    const r = removeByKept(deal, feeId, t, chosen);
    const menuOpen = document.querySelector("dialog[open]");
    oc.closeThing();
    oc.closeMenu();
    if (menuOpen) menuOpen.addEventListener("close", () => kept(r), { once: true });
    else kept(r);
  };
  const onDelete = (id: string) => {
    if (doc.remove(id)) afterShow();
  };

  const kind = kindById(data.kinds, deal.kind);
  // a fee the product may not charge by rule is never offered
  const bar = useMemo(() => dataBar(deal.kind, data, today), [deal.kind, data, today]);
  const { unitPrice, onUnitPrice } = useUnitPrice(read, deal.id);
  // the glance and the panel for a deal with a fee, the reading for one with a fee read: one with none shows neither
  const summary = useMemo(() => (read.deal.fees.length > 0 ? glance(read) : null), [read]);
  const views = useMemo(() => (summary ? { glance: summary, reading: readingOf(read, data.fx, unitPrice) } : null), [summary, read, data.fx, unitPrice]);
  const builderView = useMemo(() => builder(read, bar, chosen ? { fee: chosen, case: caseId } : null), [read, bar, chosen, caseId]);
  const panel = useMemo(() => (chosen ? panelOf(read, chosen, caseId ?? undefined) : null), [read, chosen, caseId]);
  const tools = useMemo(() => (chosen ? toolboxOf(read, chosen, caseId ?? undefined) : null), [read, chosen, caseId]);
  const menu = oc.menu;
  const thingOpen = oc.thingOpen;
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
  const lines = doc.undo.lines(onUndo);
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
        folded={oc.sheetFolded}
        onFold={oc.setSheetFolded}
        onAsk={oc.onAsk}
        onFee={onFee}
        onForm={(part) => onForm(chosenFee.id, part, caseId)}
        onPending={(part) => oc.setPending({ fee: chosenFee.id, case: caseId, part })}
        onRemove={onRemoveInPanel}
        onClose={oc.onClosePanel}
      />
    ) : null;
  const panelView =
    toolboxView && !phone ? (
      <ToolboxCard cardRef={oc.panelCard} column={panelColumn} rest={oc.panelRest} onClose={oc.onClosePanel}>
        {toolboxView}
      </ToolboxCard>
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
        setup={<SetupColumn deal={deal} view={builderView} kinds={data.kinds} onPickTrack={picker.onPickTrack} onTemplates={picker.onTemplates} filled={picker.filled} kindLine={lines.kind} onDeal={change} onKind={onKind} />}
        fees={
          kind && (
            <FeesColumn
              deal={deal}
              view={builderView}
              groupOf={(fee: Fee) => feeGroup(read, fee, saves)}
              open={{ fee: chosen, case: caseId, view: panel?.open ?? null, pending: oc.pendingHere, menu: slot && menu ? menu.t : null, thing: thingView && thingOpen ? thingOpen.t : null }}
              toolbox={panelColumn || phone ? null : panelView}
              line={lines.fee}
              caseLine={lines.case}
              focus={doc.focus}
              onFocused={() => doc.setFocus(null)}
              onDeal={change}
              onAdd={onAdd}
              actions={{
                onOpen: oc.onOpenCase,
                onSlot: oc.onSlot,
                onThing: oc.onThing,
                onRemoveCase,
                onHoldOn,
                onPendingDone: () => oc.setPending(null),
                onAskDone: oc.onAskDone,
              }}
              ask={oc.asking && oc.asking.fee === chosen ? oc.asking.kind : null}
            />
          )
        }
        toolbox={panelColumn ? panelView : null}
      />
      {/* the open slot's menu: beside its pill on a computer, a sheet on a phone */}
      <ValueMenuSheet open={!!slot} onClose={oc.closeMenu} anchor={slot ? menu!.at : null} label={slot?.title ?? ""}>
        {slot && menu && chosenFee && <SlotMenu key={`${menu.fee}:${menu.case}:${menu.t}`} edit={slot} fee={chosenFee} caseId={menu.case} t={menu.t} top={panel?.open.slots[menu.t]?.words.figure ?? null} onFee={onFee} />}
      </ValueMenuSheet>
      {/* a thing of the open fee's band head: its values in the cases, and the action that stops the price changing by it */}
      <ValueMenuSheet open={!!thingView} onClose={oc.closeThing} anchor={thingView ? thingOpen!.at : null} label={thingView?.name ?? ""}>
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
