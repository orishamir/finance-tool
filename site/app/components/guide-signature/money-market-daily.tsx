// Daily money-market fund (D29): how fast can I get my money, and what does it pay? A ladder of four cash products from the fastest to
// the slowest way back, each with its yearly rate and where the rate comes from (a bank's published table, the rate most of the
// collected banks publish, or the site's assumption, D20), this product highlighted. One control: when the money is needed; the rows
// that bring it back in time stay lit.
import { useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { bestWithin, ladderRows, speedOrder, type Speed } from "../../lib/guide-signature";
import { Num, RulesLine } from "../provenance";
import { cx, SegmentedControl, Sentence, Tag } from "../kit";
import type { VisualProps } from "./kit";

export function MoneyMarketDailyVisual({ data }: VisualProps) {
  const rows = ladderRows(data);
  const [need, setNeed] = useState<Speed>("trading-day");
  const best = bestWithin(rows, need);
  const maxRate = Math.max(1e-9, ...rows.map((r) => Number(r.rate.value) || 0));
  const reach = speedOrder.indexOf(need);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="field-label" id="sig-ladder-need">
          {copy.ladder.need}
        </span>
        <SegmentedControl<Speed> labelledBy="sig-ladder-need" options={speedOrder.map((s) => ({ value: s, label: copy.ladder.speeds[s]! }))} value={need} onChange={setNeed} />
      </div>

      <ol className="flex flex-col gap-2" aria-label={copy.ladder.chart.aria}>
        {rows.map((r) => {
          const mine = r.id === data.id;
          const lit = speedOrder.indexOf(r.speed) <= reach;
          return (
            <li key={r.id} className={cx("rounded-md border p-3 flex flex-col gap-2 transition-opacity duration-[var(--duration-fast)]", mine ? "border-primary bg-card" : "border-border bg-card", !lit && "opacity-50")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">
                  {copy.ladder.rows[r.id] ?? r.id}
                  {mine && <Tag tone="positive" className="ms-2">{copy.ladder.thisOne}</Tag>}
                </span>
                <span className="flex items-center gap-2">
                  <Tag tone={r.kind === "assumption" ? "parameter" : "neutral"}>{copy.ladder.kinds[r.kind]}</Tag>
                  <span className="font-semibold text-lg">
                    <Num value={r.rate} />
                  </span>
                </span>
              </div>
              <div className="h-3 rounded-sm bg-muted overflow-hidden" aria-hidden="true">
                <div className={cx("h-full rounded-sm", mine ? "bg-chart-value" : "bg-chart-alt")} style={{ width: `${Math.max(1, ((Number(r.rate.value) || 0) / maxRate) * 100)}%` }} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{copy.ladder.speeds[r.speed]}</span>
                <span>{copy.ladder.wait[r.speed]}</span>
                {r.term && (
                  <span>
                    {copy.ladder.term} <Num value={r.term} display={fmt.months(Number(r.term.value))} />
                  </span>
                )}
              </div>
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

      {best && (
        <Sentence measure>
          {copy.ladder.best.before} <span className="font-medium">{copy.ladder.rows[best.id]}</span>, <Num value={best.rate} /> {copy.ladder.best.middle}.
        </Sentence>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.ladder.foot} {copy.ladder.depositFoot}
      </p>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
