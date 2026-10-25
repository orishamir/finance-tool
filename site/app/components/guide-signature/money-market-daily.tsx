// Daily money-market fund (D29): how fast can I get my money, and what does it pay? A ladder of four cash products from the fastest to
// the slowest way back, each with its yearly rate and where the rate comes from (a bank's published table, or the site's assumption,
// D20), this product highlighted. One control: when the money is needed; the rows that bring it back in time stay lit.
import { useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { bestWithin, ladderRows, speedOrder, type Speed } from "../../lib/guide-signature";
import { Num, RulesLine } from "../provenance";
import { SegmentedControl, Tag, cx } from "../ui";
import { Gap, type VisualProps } from "./kit";

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
                {r.ceiling && (
                  <span>
                    {copy.ladder.ceiling.before} <Num value={r.ceiling} />
                    {copy.ladder.ceiling.after}
                  </span>
                )}
                {r.term && (
                  <span>
                    {copy.ladder.term} <Num value={r.term} display={fmt.months(Number(r.term.value))} />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {best && (
        <p className="max-w-measure">
          {copy.ladder.best.before} <span className="font-medium">{copy.ladder.rows[best.id]}</span>, <Num value={best.rate} /> {copy.ladder.best.middle}.
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-measure">
        {copy.ladder.foot} {copy.common.onlyLeumi}
      </p>
      <Gap id="mmfPayoutDays" />
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
