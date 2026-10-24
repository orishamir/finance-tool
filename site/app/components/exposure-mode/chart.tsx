// The exposure chart (design-spec 21.4, design-system 9.3): the comparison chart of release 2 with at most four
// lines (the top three beyond the reference, and the cash-like reference), a chip row to swap which are drawn, every
// line on an entered return dashed with the pencil, and the caption that is always there.
import { useMemo, useState } from "react";
import { r2, r5 } from "../../copy";
import type { SeriesLine } from "../../lib/compare";
import { defaultSelection, seriesFor, type ExposureResultView } from "../../lib/exposure-mode";
import { ChartLegend, ChartReadout, ChartTable, ComparisonChart } from "../compare/chart";
import type { ResultCtx } from "../compare/ctx";
import { SegmentedControl, cx } from "../ui";
import { IconPencil } from "../icons";
import { Tpl } from "./tpl";
import type { ExpCtx, Mode } from "./ctx";
import { asResultCtx } from "./reason";

const toLine = (l: ReturnType<typeof seriesFor>[number]): SeriesLine => ({ id: l.id, name: l.name, role: l.role, points: l.points, enteredReturn: l.entered, tiedWith: l.tiedWith });

/** A fifth choice replaces the oldest non-reference one; the reference can be switched off (design-spec 21.4). */
export function toggleSeries(sel: readonly string[], id: string, referenceId: string | null): string[] {
  if (sel.includes(id)) return sel.filter((x) => x !== id);
  if (id === referenceId) return [...sel, id];
  const options = sel.filter((x) => x !== referenceId);
  const keep = options.length >= 3 ? sel.filter((x) => x !== options[0]) : [...sel];
  return [...keep, id];
}

export function ExposureChartCard({ ctx, view, mode, onMode }: { ctx: ExpCtx; view: ExposureResultView; mode: Mode; onMode: (m: Mode) => void }) {
  const { g } = ctx;
  const defaults = useMemo(() => defaultSelection(view), [view]);
  const [picked, setPicked] = useState<string[] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  // a selection survives a change of inputs while its exposures are still ranked; otherwise the default returns
  const rankedIds = new Set(view.ranked.map((r) => r.id));
  const sel = picked && picked.every((id) => rankedIds.has(id)) && picked.length > 0 ? picked : defaults;
  const drawn = useMemo(() => seriesFor(view, g, sel).map(toLine), [view, g, sel.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => seriesFor(view, g, view.ranked.map((r) => r.id)).map(toLine), [view, g]);
  // the table holds every ranked exposure, in rank order (design-spec 21.4)
  const tableLines = all;
  const fake = asResultCtx(ctx) as ResultCtx;
  const hidden = view.ranked.length - drawn.length;
  if (view.ranked.length === 0) return <p className="text-muted-foreground">{r5.exposure.chart.empty}</p>;
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl label={r2.result.realNominal} options={[{ value: "real", label: r2.result.modes.real }, { value: "nominal", label: r2.result.modes.nominal }]} value={mode} onChange={onMode} />
      <div role="group" aria-label={r5.exposure.chart.chipsAria} className="flex flex-wrap gap-2 items-center">
        {view.ranked.map((r) => {
          const on = sel.includes(r.id);
          return (
            <button key={r.id} type="button" aria-pressed={on} onClick={() => setPicked(toggleSeries(sel, r.id, view.referenceId))} className={cx("sec-chip border border-border inline-flex items-center gap-1", on ? "sec-chip-on" : "bg-card hover:bg-accent")}>
              {r.grossReturn?.state === "entered" && <IconPencil size={14} />}
              <bdi>{r.id === view.referenceId ? r5.exposure.chart.reference : r.entry.name}</bdi>
            </button>
          );
        })}
        {hidden > 0 && <span className="text-xs text-muted-foreground"><Tpl t={r5.exposure.chart.more} vars={{ n: hidden }} /></span>}
      </div>
      <p className="text-xs text-muted-foreground -mt-2">{r5.exposure.chart.limit}</p>
      <ChartLegend lines={drawn} />
      <ComparisonChart lines={drawn} mode={mode} horizon={g.horizonYears} ctx={fake} hover={hover} onHover={setHover} />
      <p className="text-xs text-entered">{r5.exposure.chart.caption}</p>
      <ChartReadout lines={drawn} mode={mode} year={hover ?? g.horizonYears} ctx={fake} />
      <ChartTable lines={tableLines} mode={mode} ctx={fake} />
    </div>
  );
}
