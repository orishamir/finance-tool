// Section 2 of the index page: the funds on the index at the chosen house, as the product table: rank, the fund with its type tag
// and labels, the number as the link to Maya, its three fees, and the value left at that house.
// Filters on currency hedging, "what do the labels mean", the tracking-difference note, and the empty state for an index with no
// fund records (a request text for the founder, as flow 10).
import { useState } from "react";
import { brands, invest as c } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import type { HouseEntry, HouseRow, InvestView } from "../../lib/invest";
import { fundLabels, matchesHedge, type HedgeFilter } from "../../lib/labels";
import { IconCopy, IconExternal, IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, LabelChip, ProductFigures, ProductIdLink, ProductPhoneRow, ProductTable, RankBadge, Section, SegmentedControl, SelectField, Tag, type ProductColumn, type ProductRow } from "../kit";
import { LabelsLegend, OptionTag, reasonText } from "./parts";
import { ownBy, type SiteValue } from "../../lib/value";

const b = brands.funds;

const feeOf = (rec: FundRecord, key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
  const v = rec.fees[key];
  // D31: the fund manager's own fee, shown on that fund's row
  return v && v.value !== null ? ownBy(v as SiteValue, rec.manager) : null;
};

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
  const rows = filtered.map((e) => {
    const ranked = !!e.price && !e.price.open;
    if (ranked) rank += 1;
    return fundRow(view, e, ranked ? rank : null, house);
  });
  // the product table (founder, 2026-10-27; design-system 11 "Lists of products"): rank, the fund with its labels, the number as the
  // link to Maya, the three fees, and what is left at the chosen house, which the list is ranked by
  const columns: ProductColumn[] = [
    { id: "rank", head: <span className="sr-only">{c.funds.rank}</span>, fit: true },
    { id: "name", head: b.columns.name },
    { id: "number", head: b.columns.number, fit: true },
    { id: "fees", head: b.columns.fees, fit: true },
    { id: "value", head: c.funds.value(house.provider.short), fit: true },
  ];
  return <ProductTable columns={columns} groups={rows.map((r) => ({ key: r.key, rows: [r] }))} />;
}

/** The three fees, each with its word; one not collected says so. */
function Fees({ rec, inline }: { rec: FundRecord; inline?: boolean }) {
  const items = (["fixed_management", "variable_management", "trustee"] as const).map((key, i) => {
    const v = feeOf(rec, key);
    const word = [b.feeWords.fixed, b.feeWords.variable, b.feeWords.trustee][i]!;
    return { id: key, word, figure: v ? <Num value={v} size={inline ? "inline" : "cell"} /> : <span className="text-sm text-muted-foreground">{c.funds.notCollected}</span> };
  });
  return <ProductFigures items={items} inline={inline} />;
}

function fundRow(view: InvestView, e: HouseEntry, rank: number | null, house: HouseRow): ProductRow {
  const f = e.fund;
  const labels = fundLabels(f.rec, view.index, f.option);
  // Maya's page of the fund exists for an Israeli ETF and an Israeli tracking fund (the address pattern of the fund records' sources)
  const kind = f.option === "il-etf" ? "etfs" : f.option === "il-tracking" ? "mutual-funds" : null;
  const mayaHref = kind && f.rec.identifiers.tase_number ? `https://maya.tase.co.il/he/funds/${kind}/${f.rec.identifiers.tase_number}` : null;
  const badge = <RankBadge rank={rank} label={rank ? `${c.funds.rank} ${rank}` : undefined} />;
  const name = (
    <span className="font-semibold leading-snug">
      <bdi>{f.name}</bdi>
    </span>
  );
  const manager = (
    <span className="text-sm text-muted-foreground">
      {c.funds.manager}: <bdi>{f.rec.manager}</bdi>
    </span>
  );
  // the type tag first (funds of both types share this list), then what differs between the funds, then the flags
  const tags = (
    <span className="flex flex-wrap items-center gap-1.5">
      <OptionTag option={f.option} />
      {labels.map((l) => (
        <LabelChip key={l.id} label={l} />
      ))}
      {f.currencyMismatch && <Tag tone="caution">{c.funds.mismatchTag}</Tag>}
      {e.price?.open && (
        <Tag tone="blocked" icon={<IconLock size={14} />}>
          {c.options.open}
        </Tag>
      )}
    </span>
  );
  const number = <ProductIdLink id={f.number} href={mayaHref} label={b.mayaLink(f.number)} />;
  const value = e.price ? (
    <span className="text-lg font-semibold">
      <Num value={e.price.value} />
    </span>
  ) : (
    <span className="block whitespace-normal text-sm text-muted-foreground max-w-48">{e.reason ? reasonText(e.reason, "") : c.funds.cannot}</span>
  );
  return {
    key: f.rec.id,
    cells: [
      badge,
      <span className="flex flex-col items-start gap-1">
        {name}
        {manager}
        <span className="pt-0.5">{tags}</span>
      </span>,
      number,
      <Fees rec={f.rec} />,
      value,
    ],
    phone: (
      <ProductPhoneRow stacked>
        <span className="flex items-start gap-3">
          {badge}
          <span className="flex-1 min-w-0 flex flex-col gap-0.5">
            {name}
            {manager}
          </span>
          <span className="flex flex-col items-end text-end shrink-0">
            {value}
            {e.price && <span className="text-xs text-muted-foreground">{c.funds.value(house.provider.short)}</span>}
          </span>
        </span>
        <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
          {b.numberWord} {number}
        </span>
        {tags}
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          {b.phoneFees} <Fees rec={f.rec} inline />
        </span>
      </ProductPhoneRow>
    ),
  };
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
