// The fee page's top (method §10.6): the head, the bar of the deal, and its three columns: the builder, the chosen fee's panel and the deal
// at a glance. The deal is kept on this device, saved as it changes from its first fee or a typed name. It opens from the address (a deal
// in `?d=`, the saved one where the link's deal is one already; a kind in `?wrapper=`, a track in `?track=`), else the deal last worked
// on, else an empty deal with the kinds to choose from. "Today" is the device's day, read after the page loads: the pre-rendered page
// shows the head and the words that it is loading, never a deal of another day. The bar's end opens another saved deal or a new one,
// copies the deal's link, and opens the template picker; a template opens a new deal beside this one. The builder's track step opens the
// same picker, and the track it picks is set on the deal on screen (`pickTrack`). A deal with no fee shows the bar and the builder alone,
// the builder in the column it keeps once the deal has fees, so the first fee moves nothing; the glance and the panel come with it, and
// the reading once a fee has its price. The columns are one thing: a fee under the pointer or the focus in one is marked in the other, and
// a fee's name in the glance or the reading chooses it (`FeeLinks`). A change that loses something (a fee taken away, a fee filled from a
// price list, a stage taken away, a saved deal deleted) leaves one undo line where it happened (lib/fee-deal/undo.ts), which lives through
// other edits until it is undone, a newer such change replaces it, another deal opens, what it would put back has no place left, or ten
// seconds pass while neither the focus nor the pointer is on it.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { builder, panel as panelOf } from "../../lib/fee-deal/builder";
import { addFee, updateFee, type Side } from "../../lib/fee-deal/edit";
import { glance } from "../../lib/fee-deal/glance";
import { readingOf } from "../../lib/fee-deal/reading";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { newDeal, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/parts";
import { dealStore, savedTwin, savedWith, worthSaving } from "../../lib/fee-deal/store";
import { dealFromTemplate, feePriceLists, HELD_UNSAID, houseName, pickTrack, templateOf, templateOptions, templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import { deleteDealKept, fillFeeKept, removeFeeKept, removeStageKept, standing, undo, undoDelete, type DealUndo, type Undo, type Undoable } from "../../lib/fee-deal/undo";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { Button, Callout, Card, PageHead, Section } from "../kit";
import { DealBar } from "./bar";
import { BarEnd, dealLabel, useCopyLink } from "./bar-end";
import { BuilderColumn, bringIntoView, type FeeFocus, type FeeUndoLine } from "./builder";
import { FeeLinksProvider, type FeeLinks } from "./links";
import { UndoLine } from "./undo-line";
import { GlanceColumn, READING_ID } from "./glance";
import { PanelColumn, type PanelUndoLine } from "./panel";
import { TemplatePicker } from "./picker";
import { ReadingCards } from "./reading";
import { feeName } from "./words";

/** How long the undo line stays while neither the focus nor the pointer is on it, in milliseconds. */
const UNDO_MS = 10_000;

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
  return (
    <div className="flex flex-col gap-6">
      <Head />
      {failed ? <Callout tone="caution">{copy.failed}</Callout> : data && today && store.ready ? <Deal data={data} today={today} saved={store.value} writable={store.writable} /> : <p className="text-muted-foreground">{copy.loading}</p>}
    </div>
  );
}

function Deal({ data, today, saved, writable }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean }) {
  const { search } = useLocation();
  const navigate = useNavigate();
  // the deal is opened once, when the page has what it needs: later changes to the address (the page clears it) do not reopen it. A link
  // whose deal is a saved one already opens the saved one.
  const opened = useRef<{ deal: FeeDeal; fromAddress: boolean; given: boolean } | null>(null);
  if (!opened.current) {
    const fromAddress = dealOfAddress(search, data, today);
    const twin = fromAddress?.given ? savedTwin(fromAddress.deal, saved) : undefined;
    opened.current = { deal: twin ?? fromAddress?.deal ?? saved[0] ?? newDeal(null), fromAddress: fromAddress !== null, given: !!fromAddress?.given && !twin };
  }
  const [deal, setDeal] = useState<FeeDeal>(opened.current.deal);
  const [chosen, setChosen] = useState<string | null>(deal.fees[0]?.id ?? null);
  // what the bar's end just did (a template opened a new deal), said for as long as an undo line stays, or until it is closed
  const [said, setSaid] = useState<string | null>(null);
  useEffect(() => {
    if (!said) return;
    const t = window.setTimeout(() => setSaid(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [said]);
  // the template picker, open at the button it was opened from; `pickFrom` says which, and outlives the sheet's closing: the bar's (a pick
  // opens a new deal) or the builder's track step (a pick sets the track on this deal)
  const [picker, setPicker] = useState<HTMLElement | null>(null);
  const [pickFrom, setPickFrom] = useState<"bar" | "track">("bar");
  const openPicker = (from: "bar" | "track") => (anchor: HTMLElement) => {
    setPickFrom(from);
    setPicker(anchor);
  };
  const link = useCopyLink();
  // the last change that lost something, while it can be undone; whether the focus or the pointer is on its line; what takes the focus
  // once drawn (a card put back, a fee just added)
  const [undoing, setUndoing] = useState<Undo | DealUndo | null>(null);
  const [holding, setHolding] = useState(false);
  const [focus, setFocus] = useState<FeeFocus | null>(null);
  // the fee under the pointer or the focus in any column, which the others mark
  const [marked, setMarked] = useState<string | null>(null);
  // the line's time left: it runs while the line is not held, and stops, keeping what is left, while it is
  const clock = useRef<{ u: Undo | DealUndo | null; left: number }>({ u: null, left: UNDO_MS });
  useEffect(() => {
    if (!undoing || holding) return;
    if (clock.current.u !== undoing) clock.current = { u: undoing, left: UNDO_MS };
    const start = Date.now();
    const t = window.setTimeout(() => setUndoing(null), clock.current.left);
    return () => {
      window.clearTimeout(t);
      clock.current.left -= Date.now() - start;
    };
  }, [undoing, holding]);
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
      bringIntoView(panelCard.current);
    }
  }, [chosen]);

  // a deal the address gave is saved at once, and the address is cleared, so a reload opens the deal as it is now, not the link again; the
  // empty deal a broken or unknown address opens is saved only once it is worth saving, as a new deal is
  useEffect(() => {
    if (!opened.current?.fromAddress) return;
    if (opened.current.given) dealStore.update((ds) => savedWith(ds, opened.current!.deal, today));
    navigate({ search: "" }, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keep = (next: FeeDeal) => {
    setDeal(next);
    if (worthSaving(next, saved)) dealStore.update((ds) => savedWith(ds, next, today));
  };
  // a change to the deal; an undo line stays through it, and goes by itself where what it would put back has no place left
  const change = (next: FeeDeal) => {
    keep(next);
    if (undoing && "dealId" in undoing && !standing(undoing, next)) setUndoing(null);
  };
  // a change that keeps what it took for the undo, in place of any undo before it
  const kept = (r: Undoable | null) => {
    if (!r) return;
    keep(r.deal);
    setChosen(r.chosen);
    setUndoing(r.undo);
  };
  const onFee = (f: Fee) => change(updateFee(deal, f.id, () => f));
  const onAdd = (kind: FeeKindId) => {
    const { deal: next, fee } = addFee(deal, kind);
    change(next);
    setChosen(fee.id);
    setFocus({ fee: fee.id, on: "box" });
  };
  const onRemove = (feeId: string) => kept(removeFeeKept(deal, feeId, chosen));
  const onRemoveInPanel = (feeId: string) => {
    onRemove(feeId);
    setPanelRest(true);
  };
  const onFill = (feeId: string, house: string) => kept(fillFeeKept(deal, feeId, house, data, chosen));
  const onRemoveStage = (feeId: string, side: Side, k: number) => kept(removeStageKept(deal, feeId, side, k, chosen));
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
  const onChoose = (feeId: string, by: "pointer" | "keyboard" | "field") => {
    if (by === "keyboard") after.current = { fee: feeId, how: "panel" };
    setChosen(feeId);
  };
  // the panel closed: no fee chosen, and the focus back on the card it was for
  const onClosePanel = () => {
    const was = chosen;
    setChosen(null);
    if (was) requestAnimationFrame(() => document.querySelector<HTMLElement>(`li[data-fee="${CSS.escape(was)}"] [data-pick-card]`)?.focus());
  };
  const links: FeeLinks = {
    marked,
    mark: setMarked,
    open: (feeId) => {
      after.current = { fee: feeId, how: "view" };
      setChosen(feeId);
      if (feeId === chosen) {
        after.current = null;
        bringIntoView(document.querySelector(`li[data-fee="${CSS.escape(feeId)}"]`));
        bringIntoView(panelCard.current);
      }
    },
  };

  // another deal on screen: a saved one, a new one or one a template filled; a new deal is saved once it is worth saving
  const open = (next: FeeDeal) => {
    setDeal(next);
    setChosen(next.fees[0]?.id ?? null);
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
    setUndoing(r.undo);
  };
  const options = useMemo(() => templateOptions(deal.kind, data), [deal.kind, data]);
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
    const probe: FeeDeal = { ...newDeal(deal.kind), held: deal.held ?? HELD_UNSAID };
    for (const o of options) if (o.source === "house") m.set(o.id, templateOf(probe, o.id, data, today)?.left ?? []);
    return m;
  }, [picker, options, deal.kind, deal.held, data, today]);
  // what the template left out, only where it filled the deal's fees: a track set on a deal whose fees it kept left nothing out of them
  const left = useMemo(() => (deal.template && !deal.template.feesKept ? (templateOf(deal, deal.template.id, data, today)?.left ?? null) : null), [deal, data, today]);

  const kind = kindById(data.kinds, deal.kind);
  // the deal is read once for every view; choosing another fee builds only its panel again
  const read = useMemo(() => readDealFor(deal, data.kinds, today), [deal, data.kinds, today]);
  // the glance and the panel for a deal with a fee, the reading for one with a fee read: one with none shows neither
  const builderView = useMemo(() => builder(read), [read]);
  const views = useMemo(() => (read.deal.fees.length > 0 ? { glance: glance(read), reading: readingOf(read, data.fx) } : null), [read, data.fx]);
  const panel = useMemo(() => (chosen ? panelOf(read, chosen) : null), [read, chosen]);
  const hasTracks = options.some((o) => o.source === "track");
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
  const undoWords = (u: Undo | DealUndo): string => {
    if (!("dealId" in u)) return `${copy.end.deleted}${dealLabel(u.deal, kindById(data.kinds, u.deal.kind)?.name ?? null)}.`;
    if (u.what.kind === "stage") return copy.panel.stageRemoved;
    if (u.what.kind === "fill") return `${copy.builder.filled(houseName(u.what.house, data) ?? "")}.`;
    const id = u.what.feeId;
    const f = "fee" in u.took ? u.took.fee : deal.fees.find((x) => x.id === id);
    return `${copy.builder.removed}${f ? feeName(f.kind, f.name) : ""}.`;
  };
  const words = shown ? undoWords(shown) : null;
  const feeLine: FeeUndoLine | null = shown && words && "dealId" in shown && shown.what.kind === "remove" ? { what: shown.what, words, onUndo, onHold: setHolding } : null;
  // a stage's and a fill's lines stand in the panel, while the panel shows their fee
  const panelLine: PanelUndoLine | null =
    shown && words && "dealId" in shown && (shown.what.kind === "stage" || shown.what.kind === "fill") && shown.what.feeId === chosen
      ? shown.what.kind === "stage"
        ? { kind: "stage", side: shown.what.side, k: shown.what.k, words, onUndo, onHold: setHolding }
        : { kind: "fill", words, onUndo, onHold: setHolding }
      : null;
  const dealLine = shown && words && !("dealId" in shown) ? words : null;
  const readSome = read.fees.length > 0;

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
            onCopy={() => void link.copyLink(deal)}
            onOpen={onOpen}
            onNew={() => open(newDeal(null))}
            onRename={onRename}
            onDelete={onDelete}
            onTemplates={options.length > 0 ? openPicker("bar") : null}
            templateWords={hasTracks ? copy.picker.track.title : copy.end.template}
          />
        }
      />
      {/* for a screen reader: what the undo line says, else what the bar's end just did (a template opened a new deal, the link was copied) */}
      <p role="status" className="sr-only">
        {words ?? said ?? (link.copied ? copy.end.copied : "")}
      </p>
      {dealLine && (
        <UndoLine key={`undo:deal:${(shown as DealUndo).deal.id}`} as="div" onUndo={onUndo} onHold={setHolding} refocus={() => document.querySelector<HTMLElement>("[aria-controls$='-list']")}>
          {dealLine}
        </UndoLine>
      )}
      {(said || link.blocked) && (
        <div className="come-in flex flex-col gap-1.5 text-sm">
          {said && (
            <p className="flex flex-wrap items-center gap-x-3">
              <span>{said}</span>
              <Button variant="quiet" size="sm" flush onClick={() => setSaid(null)}>
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
      <TemplatePicker open={picker !== null} onClose={() => setPicker(null)} anchor={picker} options={options} left={pickerLeft} newDeal={pickFrom === "bar"} product={kind?.name ?? null} onPick={onPick} />
      {/* where the builder column can be at least about 480 px wide, three columns: the glance at the start (the right), the builder, the
          panel at the end; narrower, two: the glance, and the builder with the panel under it. They stand in the page in that order, so
          the Tab key reads them as the eye does. Each has its own place in the grid whatever the deal holds, so the first fee sets the
          other columns around the builder and moves nothing: the builder, the focus and the scroll stay where they were. A phone stacks
          the builder, the panel and the glance, in that order (`order`), so the glance coming with the first fee moves nothing above it. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 min-[90rem]:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_minmax(0,28rem)]">
        {views && (
          <Card className="order-3 flex flex-col gap-4 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 min-[90rem]:row-span-1">
            <GlanceColumn glance={views.glance} law={views.reading.law} saved={saves} names={nameOf} empty={!readSome} />
          </Card>
        )}
        <Card className="order-1 flex flex-col gap-4 lg:order-none lg:col-start-2 lg:row-start-1">
          <BuilderColumn
            deal={deal}
            view={builderView}
            kinds={data.kinds}
            chosen={chosen}
            onPickTrack={hasTracks ? openPicker("track") : null}
            left={left}
            line={feeLine}
            focus={focus}
            onFocused={() => setFocus(null)}
            onDeal={change}
            onChoose={onChoose}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </Card>
        {views && panel && chosenFee && (
          <div
            ref={panelCard}
            className="come-in order-2 lg:order-none lg:col-start-2 lg:row-start-2 min-[90rem]:col-start-3 min-[90rem]:row-start-1 min-[90rem]:sticky min-[90rem]:top-20 min-[90rem]:max-h-[calc(100vh-6rem)] min-[90rem]:overflow-y-auto min-[90rem]:rounded-lg"
            {...(panelRest ? { inert: true } : {})}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !e.defaultPrevented) {
                e.preventDefault();
                onClosePanel();
              }
            }}
          >
            <Card edge="accent" className="flex flex-col gap-4">
              <PanelColumn
                key={chosenFee.id}
                panel={panel}
                fee={chosenFee}
                product={deal.kind}
                law={views.reading.law.find((r) => r.fee === chosen) ?? null}
                first={views.reading.from}
                saved={saves}
                fill={priceLists.length > 0 ? { houses: priceLists, onFill: (h) => onFill(chosenFee.id, h) } : null}
                line={panelLine}
                onFee={onFee}
                onRemove={onRemoveInPanel}
                onRemoveStage={(side, k) => onRemoveStage(chosenFee.id, side, k)}
                onClose={onClosePanel}
              />
            </Card>
          </div>
        )}
      </div>
      {views && readSome && (
        <Section id={READING_ID} title={copy.reading}>
          {/* the chart's chosen period belongs to the deal it was chosen on: another deal starts from its own */}
          <ReadingCards key={deal.id} reading={views.reading} saved={saves} fx={data.fx} />
        </Section>
      )}
    </FeeLinksProvider>
  );
}
