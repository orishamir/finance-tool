// The fee page's top (method §10.6): the head, the bar of the deal, and its three columns: the builder, the chosen fee's panel and the deal
// at a glance. The deal is kept on this device and saved as it changes. It opens from the address (a deal in `?d=`, a kind in `?wrapper=`,
// a track in `?track=`), else the deal last worked on, else an empty deal with the kinds to choose from. "Today" is the device's day, read
// after the page loads: the pre-rendered page shows the head and the words that it is loading, never a deal of another day.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { builder, panel as panelOf } from "../../lib/fee-deal/builder";
import { glance } from "../../lib/fee-deal/glance";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress } from "../../lib/fee-deal/link";
import { newDeal, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { dealStore, savedWith } from "../../lib/fee-deal/store";
import { templateOptions } from "../../lib/fee-deal/templates";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { Callout, Card, PageHead, Section } from "../kit";
import { DealBar } from "./bar";
import { BuilderColumn } from "./builder";
import { addFee, removeFee, updateFee } from "./edit";
import { GlanceColumn, READING_ID } from "./glance";
import { PanelColumn } from "./panel";
import { feeName } from "./words";

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
  const opened = useRef<{ deal: FeeDeal; fromAddress: boolean } | null>(null);
  if (!opened.current) {
    const fromAddress = dealOfAddress(search, data, today);
    opened.current = { deal: fromAddress ?? saved[0] ?? newDeal(null), fromAddress: fromAddress !== null };
  }
  const [deal, setDeal] = useState<FeeDeal>(opened.current.deal);
  const [chosen, setChosen] = useState<string | null>(deal.fees[0]?.id ?? null);

  // a deal the address opened is saved at once and the address cleared, so a reload opens the deal as it is now, not the link again
  useEffect(() => {
    if (!opened.current?.fromAddress) return;
    dealStore.update((ds) => savedWith(ds, opened.current!.deal, today));
    navigate({ search: "" }, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (next: FeeDeal) => {
    setDeal(next);
    dealStore.update((ds) => savedWith(ds, next, today));
  };
  const onFee = (f: Fee) => change(updateFee(deal, f.id, () => f));
  const onAdd = (kind: FeeKindId) => {
    const { deal: next, fee } = addFee(deal, kind);
    change(next);
    setChosen(fee.id);
  };
  const onRemove = (feeId: string) => {
    const at = deal.fees.findIndex((f) => f.id === feeId);
    const next = removeFee(deal, feeId);
    change(next);
    setChosen(next.fees[Math.min(at, next.fees.length - 1)]?.id ?? null);
  };

  const kind = kindById(data.kinds, deal.kind);
  const views = useMemo(
    () => ({ glance: glance(deal, data.kinds, today), builder: builder(deal, data.kinds, today), panel: chosen ? panelOf(deal, chosen, data.kinds, today) : null }),
    [deal, chosen, data.kinds, today],
  );
  const hasTracks = useMemo(() => templateOptions(deal.kind, data).some((o) => o.source === "track"), [deal.kind, data]);
  // a product that saves charges its fees from what has built up: a share of what is held reads so
  const saves = !!kind?.bases.includes("balance");
  const nameOf = (feeId: string) => {
    const f = deal.fees.find((x) => x.id === feeId);
    return f ? feeName(f.kind, f.name) : feeId;
  };
  const chosenFee = deal.fees.find((f) => f.id === chosen) ?? null;

  return (
    <>
      <DealBar deal={deal} kind={kind} writable={writable} onDeal={change} />
      {/* a phone stacks the builder, the panel and the glance; a computer sets the glance at the start (the right), the panel at the end */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_minmax(0,28rem)]">
        <Card className="flex flex-col gap-4 xl:col-start-2 xl:row-start-1">
          <BuilderColumn deal={deal} view={views.builder} kinds={data.kinds} chosen={chosen} hasTracks={hasTracks} onDeal={change} onChoose={setChosen} onAdd={onAdd} />
        </Card>
        {deal.kind && (
          <Card edge={chosenFee ? "accent" : undefined} className="flex flex-col gap-4 xl:col-start-3 xl:row-start-1">
            <PanelColumn panel={views.panel} fee={chosenFee} onFee={onFee} onRemove={onRemove} />
          </Card>
        )}
        <Card className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-1">
          <GlanceColumn glance={views.glance} kind={kind} saved={saves} empty={deal.fees.length === 0} names={nameOf} />
        </Card>
      </div>
      <Section id={READING_ID} title={copy.reading}>
        {null}
      </Section>
    </>
  );
}
