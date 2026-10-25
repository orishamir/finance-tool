// Section 2 of the index page: the funds on the index at the chosen house: rank, name, type tag, the fund's fees under full names, labels, and the value left at that house.
// Filters on currency hedging, "what do the labels mean", the tracking-difference note, and the empty state for an index with no
// fund records (a request text for the founder, as flow 10).
import { useState } from "react";
import { invest as c } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import type { HouseEntry, HouseRow, InvestView } from "../../lib/invest";
import { fundLabels, matchesHedge, type HedgeFilter } from "../../lib/labels";
import { IconCopy, IconExternal, IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, Card, KeyValue, RankBadge, Section, SegmentedControl, SelectField, Tag } from "../kit";
import { LabelRow, LabelsLegend, OptionTag, reasonText } from "./parts";
import type { SiteValue } from "../../lib/value";

const feeOf = (rec: FundRecord, key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
  const v = rec.fees[key];
  return v && v.value !== null ? (v as SiteValue) : null;
};

function FeeValue({ value }: { value: SiteValue | null }) {
  return value ? <Num value={value} /> : <span className="text-muted-foreground">{c.funds.notCollected}</span>;
}

export function FundsSection({ view, houseId, onHouse, mayaHref }: { view: InvestView; houseId: string | null; onHouse: (id: string) => void; mayaHref: string | null }) {
  const [hedge, setHedge] = useState<HedgeFilter>("all");
  const house = view.houses.find((h) => h.provider.id === houseId) ?? null;
  const noRecords = view.index.exposure === null || view.fundCount === 0;
  const pickable = view.houses.filter((h) => h.best || h.generic).map((h) => ({ id: h.provider.id, name: h.provider.short }));
  return (
    <Section id="invest-funds-section" level="card" title={house ? c.funds.heading(house.provider.short) : c.funds.pick}>
      {pickable.length > 1 && <SelectField label={c.funds.house} value={houseId} options={pickable} onChange={(id) => id && onHouse(id)} />}
      {!house ? null : noRecords ? (
        <EmptyFunds view={view} mayaHref={mayaHref} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <SegmentedControl<HedgeFilter>
              label={c.funds.filterLabel}
              value={hedge}
              onChange={setHedge}
              className="max-w-lg"
              options={[
                { value: "all", label: c.funds.filterAll },
                { value: "unhedged", label: c.funds.filterUnhedged },
                { value: "hedged", label: c.funds.filterHedged },
              ]}
            />
          </div>
          <LabelsLegend />
          <FundList view={view} house={house} hedge={hedge} />
          <p className="text-sm text-muted-foreground">{c.funds.trackingNote}</p>
        </>
      )}
    </Section>
  );
}

function FundList({ view, house, hedge }: { view: InvestView; house: HouseRow; hedge: HedgeFilter }) {
  const filtered = house.entries.filter((e) => matchesHedge(e.fund.rec, hedge));
  if (house.entries.length === 0) return <p className="text-muted-foreground">{c.funds.noOption}</p>;
  if (filtered.length === 0) return <p className="text-muted-foreground">{c.funds.noMatch}</p>;
  let rank = 0;
  return (
    <ol className="flex flex-col gap-3">
      {filtered.map((e) => {
        const ranked = !!e.price && !e.price.open;
        if (ranked) rank += 1;
        return <FundRow key={e.fund.rec.id} view={view} house={house} entry={e} rank={ranked ? rank : null} />;
      })}
    </ol>
  );
}

function FundRow({ view, house, entry: e, rank }: { view: InvestView; house: HouseRow; entry: HouseEntry; rank: number | null }) {
  const f = e.fund;
  const labels = fundLabels(f.rec, view.index, f.option);
  // Maya's page of the fund exists for an Israeli ETF and an Israeli tracking fund (the address pattern of the fund records' sources)
  const kind = f.option === "il-etf" ? "etfs" : f.option === "il-tracking" ? "mutual-funds" : null;
  const mayaHref = kind && f.rec.identifiers.tase_number ? `https://maya.tase.co.il/he/funds/${kind}/${f.rec.identifiers.tase_number}` : null;
  return (
    <Card as="li" pad="tight" className="flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <RankBadge rank={rank} label={rank ? `${c.funds.rank} ${rank}` : undefined} />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="font-semibold leading-snug">
            <bdi>{f.name}</bdi>
          </h3>
          <span className="text-sm text-muted-foreground">
            {c.funds.manager}: <bdi>{f.rec.manager}</bdi>
          </span>
          <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span>
              {c.funds.number} <bdi dir="ltr" className="font-mono">{f.number}</bdi>
            </span>
            {mayaHref && (
              <a href={mayaHref} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1">
                {c.funds.mayaPage} <IconExternal size={14} />
              </a>
            )}
          </span>
          <span>
            <OptionTag option={f.option} />
          </span>
        </div>
        <div className="flex flex-col items-end text-end shrink-0">
          {e.price ? (
            <>
              <span className="text-lg font-semibold">
                <Num value={e.price.value} />
              </span>
              <span className="text-xs text-muted-foreground">{c.funds.value(house.provider.short)}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground max-w-48 text-end">{e.reason ? reasonText(e.reason, "") : c.funds.cannot}</span>
          )}
        </div>
      </div>
      <dl className="flex flex-col gap-0.5 max-w-sm">
        <KeyValue label={c.funds.fixed}>
          <FeeValue value={feeOf(f.rec, "fixed_management")} />
        </KeyValue>
        <KeyValue label={c.funds.variable}>
          <FeeValue value={feeOf(f.rec, "variable_management")} />
        </KeyValue>
        <KeyValue label={c.funds.trustee}>
          <FeeValue value={feeOf(f.rec, "trustee")} />
        </KeyValue>
      </dl>
      <div className="flex flex-wrap items-center gap-1.5">
        <LabelRow labels={labels} />
        {f.currencyMismatch && <Tag tone="caution">{c.funds.mismatchTag}</Tag>}
        {e.price?.open && (
          <Tag tone="blocked" icon={<IconLock size={14} />}>
            {c.options.open}
          </Tag>
        )}
      </div>
    </Card>
  );
}

function EmptyFunds({ view, mayaHref }: { view: InvestView; mayaHref: string | null }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.funds.requestText(view.index.name));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="bg-card border border-dashed border-border rounded-lg p-5 flex flex-col gap-3 max-w-measure">
      <h3 className="font-semibold">{c.funds.emptyHeading}</h3>
      <p className="text-muted-foreground">{c.funds.emptyBody}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {mayaHref && (
          <a href={mayaHref} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-target">
            {c.funds.maya} <IconExternal size={14} />
          </a>
        )}
        <Button variant="secondary" onClick={copy}>
          <IconCopy size={16} />
          {copied ? c.funds.copied : c.funds.request}
        </Button>
      </div>
    </div>
  );
}
