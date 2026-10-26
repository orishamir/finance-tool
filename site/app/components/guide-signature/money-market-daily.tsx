// Daily money-market fund (D29): how fast can I get my money, and what does it pay? A ladder of four cash products from the fastest to
// the slowest way back, each with its yearly rate and where the rate comes from (the rate most of the collected banks publish, the
// range across the collected banks, F-86, or the site's assumption, D20), this product highlighted. One control: when the money is needed; the rows
// that bring it back in time stay lit. Each row's rate is a dot on one percent axis shared by all four rows (the deposit's range a
// segment between two dots), this product teal and the others grey: until 2026-10-26 each row had a bar measured against the highest
// rate, so the fund's bar was always full like a progress bar, the 0% current account was a stray dot, and gold meant nothing here.
import { useState } from "react";
import { scaleLinear } from "d3-scale";
import { Link } from "react-router";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { bestWithin, ladderRows, speedOrder, type LadderRow, type Speed } from "../../lib/guide-signature";
import { Num, RulesLine } from "../provenance";
import { cx, SegmentedControl, Sentence, Tag } from "../kit";
import type { SiteValue } from "../../lib/value";
import type { VisualProps } from "./kit";

export function MoneyMarketDailyVisual({ data }: VisualProps) {
  const rows = ladderRows(data);
  const [need, setNeed] = useState<Speed>("trading-day");
  const best = bestWithin(rows, need);
  const maxRate = Math.max(1e-9, ...rows.map((r) => Number(r.rate.value) || 0));
  const axis = scaleLinear().domain([0, maxRate]).nice(4);
  const ticks = axis.ticks(4);
  const at = (v: SiteValue) => axis(Number(v.value) || 0) * 100;
  const reach = speedOrder.indexOf(need);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="field-label" id="sig-ladder-need">
          {copy.ladder.need}
        </span>
        <SegmentedControl<Speed> labelledBy="sig-ladder-need" options={speedOrder.map((s) => ({ value: s, label: copy.ladder.speeds[s]! }))} value={need} onChange={setNeed} />
      </div>

      <div className="flex flex-col gap-2">
        {/* the shared axis, inset like the strips inside the rows (the row's padding and border) */}
        <div className="relative h-5 mx-3 border-x border-transparent text-sm text-chart-text tabular-nums" aria-hidden="true">
          {ticks.map((t, i) => (
            <span key={t} className="absolute top-0" style={i === 0 ? { insetInlineStart: 0 } : i === ticks.length - 1 ? { insetInlineEnd: 0 } : { insetInlineStart: `${axis(t) * 100}%`, translate: "50%" /* centred: the page is right to left */ }}>
              <bdi>{fmt.pct(t)}</bdi>
            </span>
          ))}
        </div>
        <ol className="flex flex-col gap-2" aria-label={copy.ladder.chart.aria}>
          {rows.map((r) => {
            const mine = r.id === data.id;
            const lit = speedOrder.indexOf(r.speed) <= reach;
            return (
              <li key={r.id} className={cx("rounded-md border p-3 flex flex-col gap-2 transition-opacity duration-[var(--duration-fast)]", mine ? "border-primary bg-card" : "border-border bg-card", !lit && "opacity-50")}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-medium">
                    <RowName row={r} />
                    {mine && <Tag tone="positive" className="ms-2">{copy.ladder.thisOne}</Tag>}
                  </span>
                  {/* wraps: on a phone the range "1.55% עד 2.25%" beside its tag ran 18 px out of the row (2026-10-26) */}
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Tag tone={r.kind === "assumption" ? "parameter" : "neutral"}>{copy.ladder.kinds[r.kind]}</Tag>
                    <span className="font-semibold text-lg whitespace-nowrap">
                      {r.range ? (
                        <>
                          <Num value={r.range.lo} /> {copy.ladder.range.to} <Num value={r.rate} />
                        </>
                      ) : (
                        <Num value={r.rate} />
                      )}
                    </span>
                  </span>
                </div>
                <div className="relative h-4" aria-hidden="true">
                  {ticks.map((t) => (
                    <div key={t} className={cx("absolute inset-y-0 w-px", t === 0 ? "bg-chart-axis" : "bg-chart-grid")} style={{ insetInlineStart: `${axis(t) * 100}%` }} />
                  ))}
                  {/* a range: a segment from the lowest rate to the highest, a dot at each end */}
                  {r.range && <div className={cx("absolute top-1/2 h-1 -translate-y-1/2 rounded-full", mine ? "bg-chart-value" : "bg-chart-marker")} style={{ insetInlineStart: `${at(r.range.lo)}%`, width: `${at(r.rate) - at(r.range.lo)}%` }} />}
                  {[...(r.range ? [r.range.lo] : []), r.rate].map((v, i) => (
                    <div key={i} className={cx("absolute top-1/2 size-3 -translate-y-1/2 rounded-full ring-2 ring-card", mine ? "bg-chart-value" : "bg-chart-marker")} style={{ insetInlineStart: `calc(${at(v)}% - 6px)` }} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{copy.ladder.speeds[r.speed]}</span>
                  <span>{copy.ladder.wait[r.speed]}</span>
                </div>
                {r.range && (
                  <Sentence size="sm" tone="muted">
                    <Num value={r.range.count} prefix={copy.ladder.range.before} /> {copy.ladder.range.after}{" "}
                    <Link to={`/guide/bank-deposit#${copy.ladder.range.anchorId}`} className="text-link hover:underline">
                      {copy.ladder.range.link}
                    </Link>
                  </Sentence>
                )}
                {r.banks && (
                  <Sentence size="sm" tone="muted">
                    <Num value={r.banks.count} /> {copy.ladder.common.of} <Num value={r.banks.of} /> {copy.ladder.common.after}
                  </Sentence>
                )}
                {r.top && (
                  // the best a bank pays, with its conditions: a few banks pay up to this, on a small balance only
                  <Sentence size="sm" tone="muted">
                    {copy.ladder.top.before} <Num value={r.top.rate} /> (<bdi>{r.top.name}</bdi>),{" "}
                    {r.top.ceiling ? (
                      <>
                        {copy.ladder.top.conditions} <Num value={r.top.ceiling} display={fmt.nisWhole(Number(r.top.ceiling.value))} /> {copy.ladder.top.only}.
                      </>
                    ) : (
                      <>{copy.ladder.top.conditionsNoCeiling}.</>
                    )}
                  </Sentence>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {best && (
        <Sentence measure>
          {copy.ladder.best.before} <span className="font-medium"><RowName row={best} /></span>, {best.range && <>{copy.ladder.range.upTo} </>}<Num value={best.rate} /> {copy.ladder.best.middle}.
        </Sentence>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.ladder.foot}
      </p>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}

/** A row's product, with the bank's name when its rate is one bank's own published figure (D30, D31): never a bank's rate as the product's. */
function RowName({ row }: { row: LadderRow }) {
  const name = copy.ladder.rows[row.id] ?? row.id;
  return row.rate.own ? (
    <>
      {name} {copy.ladder.ofBank} <bdi>{row.rate.own}</bdi>
    </>
  ) : (
    <>{name}</>
  );
}
