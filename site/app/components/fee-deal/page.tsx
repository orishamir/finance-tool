// The fee page's top (method §10.6): the head, the bar of the deal, and its three columns: the builder, the chosen fee's panel and the deal
// at a glance. The deal is kept on this device and saved as it changes. It opens from the address (a deal in `?d=`, a kind in `?wrapper=`,
// a track in `?track=`), else the deal last worked on, else an empty deal with the kinds to choose from. "Today" is the device's day, read
// after the page loads: the pre-rendered page shows the head and the words that it is loading, never a deal of another day. The bar's end
// opens another saved deal or a new one, copies the deal's link, and opens the template picker; a template opens a new deal beside this one.
// The builder's track step opens the same picker, and the track it picks is set on the deal on screen (`pickTrack`). A deal with no fee
// shows the bar and the builder alone, as wide as the page's prose; the glance, the panel and the reading come with its first fee. A fee
// taken away leaves a line in its place that puts it back, until the deal changes again, another deal opens, or ten seconds pass.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { builder, panel as panelOf } from "../../lib/fee-deal/builder";
import { addFee, removeKept, undoRemoval, updateFee, type Removal } from "../../lib/fee-deal/edit";
import { glance } from "../../lib/fee-deal/glance";
import { readingOf } from "../../lib/fee-deal/reading";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { newDeal, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/parts";
import { dealStore, savedWith, without } from "../../lib/fee-deal/store";
import { dealFromTemplate, feePriceLists, fillFee, HELD_UNSAID, pickTrack, templateOf, templateOptions, templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { Callout, Card, PageHead, Section } from "../kit";
import { DealBar } from "./bar";
import { BarEnd, useCopyLink } from "./bar-end";
import { BuilderColumn } from "./builder";
import { GlanceColumn, READING_ID } from "./glance";
import { PanelColumn } from "./panel";
import { TemplatePicker } from "./picker";
import { ReadingCards } from "./reading";
import { feeName } from "./words";

/** How long the line that puts a removed fee back stays, in milliseconds. */
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
  // the deal is opened once, when the page has what it needs: later changes to the address (the page clears it) do not reopen it
  const opened = useRef<{ deal: FeeDeal; fromAddress: boolean; given: boolean } | null>(null);
  if (!opened.current) {
    const fromAddress = dealOfAddress(search, data, today);
    opened.current = { deal: fromAddress?.deal ?? saved[0] ?? newDeal(null), fromAddress: fromAddress !== null, given: !!fromAddress?.given };
  }
  const [deal, setDeal] = useState<FeeDeal>(opened.current.deal);
  const [chosen, setChosen] = useState<string | null>(deal.fees[0]?.id ?? null);
  const [said, setSaid] = useState<string | null>(null);
  // the template picker, open at the button it was opened from; `pickFrom` says which, and outlives the sheet's closing: the bar's (a pick
  // opens a new deal) or the builder's track step (a pick sets the track on this deal)
  const [picker, setPicker] = useState<HTMLElement | null>(null);
  const [pickFrom, setPickFrom] = useState<"bar" | "track">("bar");
  const openPicker = (from: "bar" | "track") => (anchor: HTMLElement) => {
    setPickFrom(from);
    setPicker(anchor);
  };
  const link = useCopyLink();
  // the fee last taken away, while it can be put back; the card to give the focus to once it is
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [focusFee, setFocusFee] = useState<string | null>(null);
  useEffect(() => {
    if (!removal) return;
    const t = window.setTimeout(() => setRemoval(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [removal]);

  // a deal the address gave is saved at once, and the address is cleared, so a reload opens the deal as it is now, not the link again; the
  // empty deal a broken or unknown address opens is saved only at its first change, as a new deal is
  useEffect(() => {
    if (!opened.current?.fromAddress) return;
    if (opened.current.given) dealStore.update((ds) => savedWith(ds, opened.current!.deal, today));
    navigate({ search: "" }, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keep = (next: FeeDeal) => {
    setDeal(next);
    dealStore.update((ds) => savedWith(ds, next, today));
  };
  // any change to the deal ends the undo of a removal
  const change = (next: FeeDeal) => {
    keep(next);
    setRemoval(null);
  };
  const onFee = (f: Fee) => change(updateFee(deal, f.id, () => f));
  const onAdd = (kind: FeeKindId) => {
    const { deal: next, fee } = addFee(deal, kind);
    change(next);
    setChosen(fee.id);
  };
  const onRemove = (feeId: string) => {
    const r = removeKept(deal, feeId, chosen);
    if (!r) return;
    keep(r.deal);
    setChosen(r.chosen);
    setRemoval(r.removal);
  };
  const onUndo = () => {
    if (!removal) return;
    const back = undoRemoval(deal, removal, chosen);
    setRemoval(null);
    if (!back) return;
    keep(back.deal);
    setChosen(back.chosen);
    setFocusFee(removal.fee.id);
  };
  const onFill = (feeId: string, house: string) => {
    const next = fillFee(deal, feeId, house, data);
    if (next) change(next);
  };

  // another deal on screen: a saved one, a new one or one a template filled; a new deal is saved at its first change
  const open = (next: FeeDeal) => {
    setDeal(next);
    setChosen(next.fees[0]?.id ?? null);
    setSaid(null);
    setRemoval(null);
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
  // deleting the deal on screen opens the next saved deal, or a new one
  const onDelete = (id: string) => {
    const rest = without(saved, id);
    dealStore.update((ds) => without(ds, id));
    if (id === deal.id) open(rest[0] ?? newDeal(null));
  };
  const options = useMemo(() => templateOptions(deal.kind, data), [deal.kind, data]);
  const onPick = (id: string) => {
    setPicker(null);
    if (pickFrom === "track") {
      const next = pickTrack(deal, id, data, today);
      if (!next) return;
      change(next);
      if (!next.fees.some((f) => f.id === chosen)) setChosen(next.fees[0]?.id ?? null);
      setSaid(null);
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
  const views = useMemo(() => ({ glance: glance(read), builder: builder(read), reading: readingOf(read, data.fx) }), [read, data.fx]);
  const panel = useMemo(() => (chosen ? panelOf(read, chosen) : null), [read, chosen]);
  const reading = views.reading;
  const hasTracks = options.some((o) => o.source === "track");
  // a product that saves charges its fees from what has built up: a share of what is held reads so
  const saves = !!kind?.bases.includes("balance");
  const nameOf = (feeId: string) => {
    const f = deal.fees.find((x) => x.id === feeId);
    return f ? feeName(f.kind, f.name) : feeId;
  };
  const chosenFee = deal.fees.find((f) => f.id === chosen) ?? null;
  const priceLists = useMemo(() => (chosenFee && chosenFee.kind !== "own" ? feePriceLists(deal, chosenFee.kind, data) : []), [chosenFee, deal, data]);
  // the removal on screen: only on the deal it left, so another deal never shows it
  const removed = removal && removal.after === deal ? removal : null;
  // the columns are laid out while the deal has a fee, or while the last one taken away can be put back
  const columns = deal.fees.length > 0 || !!removed;

  return (
    <>
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
          />
        }
      />
      {/* what the bar's end just did, for a screen reader: a template opened a new deal, the link was copied */}
      <p role="status" className="sr-only">
        {said ?? (removed ? `${copy.builder.removed}${feeName(removed.fee.kind, removed.fee.name)}.` : link.copied ? copy.end.copied : "")}
      </p>
      {(said || link.blocked) && (
        <div className="flex flex-col gap-1.5 text-sm">
          {said && <p>{said}</p>}
          {link.blocked && (
            <>
              <p className="text-muted-foreground">{copy.end.copyBlocked}</p>
              <textarea readOnly dir="ltr" rows={2} aria-label={copy.end.linkField} value={link.blocked} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-card p-3 font-mono text-base select-all" />
            </>
          )}
        </div>
      )}
      <TemplatePicker open={picker !== null} onClose={() => setPicker(null)} anchor={picker} options={options} left={pickerLeft} newDeal={pickFrom === "bar"} product={kind?.name ?? null} onPick={onPick} />
      {/* a phone stacks the builder, the panel and the glance; a computer sets the glance at the start (the right), the panel at the end. The
          builder is the first child whatever the deal holds, so the first fee lays the columns out around it without drawing it again: the
          focus and the scroll stay where they were. */}
      <div className={columns ? "grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_minmax(0,28rem)]" : "grid max-w-measure grid-cols-1"}>
        <Card className={columns ? "flex flex-col gap-4 xl:col-start-2 xl:row-start-1" : "flex flex-col gap-4"}>
          <BuilderColumn
            deal={deal}
            view={views.builder}
            kinds={data.kinds}
            chosen={chosen}
            onPickTrack={hasTracks ? openPicker("track") : null}
            left={left}
            removed={removed ? { at: removed.at, fee: removed.fee, onUndo } : null}
            focusFee={focusFee}
            onFocused={() => setFocusFee(null)}
            onDeal={change}
            onChoose={setChosen}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </Card>
        {panel && chosenFee && (
          <Card edge="accent" className="flex flex-col gap-4 xl:col-start-3 xl:row-start-1">
            <PanelColumn
              panel={panel}
              fee={chosenFee}
              law={reading.law.find((r) => r.fee === chosen) ?? null}
              first={reading.from}
              saved={saves}
              fill={priceLists.length > 0 ? { houses: priceLists, onFill: (h) => onFill(chosenFee.id, h) } : null}
              onFee={onFee}
              onRemove={onRemove}
            />
          </Card>
        )}
        {deal.fees.length > 0 && (
          <Card className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-1">
            <GlanceColumn glance={views.glance} law={reading.law} saved={saves} names={nameOf} />
          </Card>
        )}
      </div>
      {deal.fees.length > 0 && (
        <Section id={READING_ID} title={copy.reading}>
          <ReadingCards reading={reading} saved={saves} fx={data.fx} />
        </Section>
      )}
    </>
  );
}
