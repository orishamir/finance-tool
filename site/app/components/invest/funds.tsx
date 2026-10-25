// (ג) The funds of the chosen option: rank, name, the fund's fees, labels, and the value left at the option's cheapest broker.
// Filters on currency hedging, "what do the labels mean", the tracking-difference note, and the empty state for an index with no
// fund records (a request text for the founder, as flow 10).
import { useState } from "react";
import { invest as c } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import type { FundWay, InvestView, OptionView } from "../../lib/invest";
import { fundLabels, matchesHedge, type HedgeFilter } from "../../lib/labels";
import { IconCopy, IconExternal, IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, SegmentedControl, Tag, cx } from "../ui";
import { LabelRow, LabelsLegend, reasonText } from "./parts";
import { providerName } from "./sections";
import type { SiteValue } from "../../lib/value";

const feeOf = (rec: FundRecord, key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
  const v = rec.fees[key];
  return v && v.value !== null ? (v as SiteValue) : null;
};

function Fee({ label, value }: { label: string; value: SiteValue | null }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-muted-foreground">{label}</span>
      {value ? <Num value={value} /> : <span className="text-muted-foreground">{c.funds.notCollected}</span>}
    </span>
  );
}

export function FundsSection({ view, optionId, mayaHref }: { view: InvestView; optionId: OptionView["id"] | null; mayaHref: string | null }) {
  const [hedge, setHedge] = useState<HedgeFilter>("all");
  const option = view.options.find((o) => o.id === optionId && o.exists) ?? null;
  const noRecords = view.index.exposure === null || view.fundCount === 0;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="invest-funds">
      <h2 id="invest-funds" className="text-lg font-semibold">
        {c.funds.heading}
        {option && <span className="font-normal text-muted-foreground"> · {c.options.titles[option.id]}</span>}
      </h2>
      {!option ? (
        <p className="text-muted-foreground">{c.funds.pick}</p>
      ) : noRecords ? (
        <EmptyFunds view={view} mayaHref={mayaHref} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <SegmentedControl<HedgeFilter>
              label={c.funds.heading}
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
          <FundList view={view} option={option} hedge={hedge} />
          <p className="text-sm text-muted-foreground">{c.funds.trackingNote}</p>
        </>
      )}
    </section>
  );
}

function FundList({ view, option, hedge }: { view: InvestView; option: OptionView; hedge: HedgeFilter }) {
  const filtered = option.funds.filter((f) => matchesHedge(f.rec, hedge));
  if (option.funds.length === 0) return <p className="text-muted-foreground">{c.funds.noOption}</p>;
  if (filtered.length === 0) return <p className="text-muted-foreground">{c.funds.noMatch}</p>;
  let rank = 0;
  return (
    <ol className="flex flex-col gap-3">
      {filtered.map((f) => {
        const ranked = !!f.best && !f.best.open;
        if (ranked) rank += 1;
        return <FundRow key={f.rec.id} view={view} fund={f} rank={ranked ? rank : null} />;
      })}
    </ol>
  );
}

function FundRow({ view, fund: f, rank }: { view: InvestView; fund: FundWay; rank: number | null }) {
  const bp = f.best ? providerName(view, f.best.providerId) : undefined;
  const yp = view.yourBroker ? providerName(view, view.yourBroker) : undefined;
  const mine = f.atYours && "value" in f.atYours && f.atYours.providerId !== f.best?.providerId ? f.atYours : null;
  const labels = fundLabels(f.rec, view.index, f.option);
  return (
    <li className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold mt-0.5", rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={rank ? `${c.funds.rank} ${rank}` : undefined}>
          {rank ?? "—"}
        </span>
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-semibold leading-snug">
            <bdi>{f.name}</bdi>
          </h3>
          <span className="text-sm text-muted-foreground">
            {c.funds.number} <bdi dir="ltr" className="font-mono">{f.number}</bdi>
          </span>
        </div>
        <div className="flex flex-col items-end text-end shrink-0">
          {f.best ? (
            <>
              <span className="text-lg font-semibold">
                <Num value={f.best.value} />
              </span>
              {bp && <span className="text-xs text-muted-foreground">{c.funds.value(bp.short)}</span>}
            </>
          ) : (
            <span className="text-sm text-muted-foreground max-w-48 text-end">{f.reason ? reasonText(f.reason, "") : c.funds.cannot}</span>
          )}
        </div>
      </div>
      <p className="text-sm flex flex-wrap gap-x-4 gap-y-1">
        <Fee label={c.funds.fixed} value={feeOf(f.rec, "fixed_management")} />
        <Fee label={c.funds.variable} value={feeOf(f.rec, "variable_management")} />
        <Fee label={c.funds.trustee} value={feeOf(f.rec, "trustee")} />
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <LabelRow labels={labels} />
        {f.currencyMismatch && <Tag tone="caution">{c.funds.mismatchTag}</Tag>}
        {f.best?.open && (
          <Tag tone="blocked" icon={<IconLock size={14} />}>
            {c.options.open}
          </Tag>
        )}
      </div>
      {mine && yp && (
        <p className="text-sm flex flex-wrap items-baseline gap-x-2 text-muted-foreground">
          <span>{c.funds.yours(yp.short)}:</span>
          <Num value={(mine as { value: SiteValue }).value} />
        </p>
      )}
    </li>
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
