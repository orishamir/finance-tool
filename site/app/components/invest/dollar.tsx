// "Hedged or not: what happened" (F-95; founder 2026-10-31, option A of research/specs/2026-10-31-hedged): what the dollar did each year
// and what each kind of fund did in the same years, from the funds' own reports, and one sentence on the plan. No forecast, no ranking.
import { useMemo } from "react";
import { kindRecord, stretchRange, yearlyChanges, type GapYear, type Spread } from "@finance-tool/engine";
import { invest as c } from "../../copy";
import { inputMap, kindMoney, kindOf, sumFeesPct, type InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, ownBy, type SiteValue } from "../../lib/value";
import { Num, RuleRef } from "../provenance";
import { Card, ChartLegend, FixedTable, PairBars, SourceLine, StatRow, StatTile, Swatch, YearBars, useHeldHeight } from "../kit";
import { allFunds, kindPairs, type Pick } from "./pair";
import { providerName } from "./sections";

const one = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Isolated for a Hebrew sentence: "−18.5%" with its sign, or "18.5%" for a word that already says up or down. */
const signed = (x: number) => `⁦${x > 0 ? "+" : x < 0 ? "−" : ""}${one.format(Math.abs(x))}%⁩`;
const bare = (x: number) => `⁦${one.format(Math.abs(x))}%⁩`;
const points = (x: number) => `⁦${x > 0 ? "+" : x < 0 ? "−" : ""}${one.format(Math.abs(x))}⁩`;
const barLabel = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`;

export function DollarSection({ view, bundle, plan, pick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; pick: Pick }) {
  const today = bundle.today;
  const funds = allFunds(view);
  const history = bundle.fxHistory;
  const years = useMemo(() => yearlyChanges(history?.points ?? []), [history]);
  const reporting = useMemo(() => funds.filter((f) => f.rec.tracking_record && f.rec.tracking_record.years.length > 0), [funds]);
  const rec = useMemo(() => kindRecord(reporting.map((f) => ({ hedged: kindOf(f.rec) === "hedged", years: f.rec.tracking_record!.years as readonly GapYear[] })), years), [reporting, years]);
  const pairs = kindPairs(view, pick);
  const money = useMemo(
    () => (pairs ? kindMoney({ bundle, index: view.index, plan, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house } }) : null),
    [bundle, view.index, plan, pairs?.unhedged.fund, pairs?.unhedged.house, pairs?.hedged.fund, pairs?.hedged.house],
  );
  const h = Math.round(plan.years);
  const stretch = history ? stretchRange(history.points, h) : null;
  const held = useHeldHeight<HTMLParagraphElement>(view.index.id);
  if (!rec || !pairs || !history) return null;

  const hedgedFunds = reporting.filter((f) => kindOf(f.rec) === "hedged" && f.rec.tracking_record!.years.some((y) => rec.years.some((r) => r.year === y.year)));
  const single = hedgedFunds.length === 1 ? hedgedFunds[0]! : null;
  const first = rec.years[0]!.year, last = rec.years[rec.years.length - 1]!.year;
  const lo = Math.min(...years.map((y) => y.pct)), hi = Math.max(...years.map((y) => y.pct));
  const from = years[0]?.year ?? 0, to = years[years.length - 1]?.year ?? 0;
  const many = view.index.exposure?.other_currencies === true;

  // a figure in the table: computed over each named fund's report for the year (the fund's own document, D31)
  const inputsOf = (kind: "unhedged" | "hedged", ys: readonly number[]) => {
    const out: Record<string, SiteValue> = {};
    for (const f of reporting) {
      const td = f.rec.fees.tracking_difference_12m;
      if (kindOf(f.rec) !== kind || !td) continue;
      for (const y of f.rec.tracking_record!.years) if (ys.includes(y.year)) out[c.dollar.inputFund(f.name, y.year)] = ownBy({ ...(td as SiteValue), value: y.fund_pct, unit: "pct", notes: undefined } as SiteValue, f.rec.manager);
    }
    return out;
  };
  const num = (x: number, about: string, formula = "F-95", inputs: Record<string, SiteValue> = {}) => <Num value={computed(Math.round(x * 100) / 100, "pct", formula, inputs, { today, about })} display={signed(x)} />;
  const range = (s: Spread, about: string, inputs: Record<string, SiteValue>, note?: string) => (
    <>
      {num(s.low, about, "F-95", inputs)}
      {s.low !== s.high && (
        <>
          {" "}
          <span className="text-xs text-muted-foreground">{c.dollar.to}</span> {num(s.high, about, "F-95", inputs)}
        </>
      )}
      {note && <span className="block text-xs font-normal text-muted-foreground">{note}</span>}
    </>
  );
  const rowOf = (key: string, head: string, ys: readonly number[], d: number, index: number, u: Spread, he: Spread, uNote: string, strong = false) => {
    const lowGap = he.low - u.high, highGap = he.high - u.low;
    return {
      key,
      head,
      strong,
      cells: [
        num(d, c.dollar.colDollar, "F-93"),
        num(index, c.dollar.colIndex),
        range(u, c.dollar.colUnhedged, inputsOf("unhedged", ys), uNote),
        range(he, c.dollar.colHedged, inputsOf("hedged", ys), he.count > 1 ? c.kinds.groupCount(he.count) : undefined),
        range({ low: lowGap, high: highGap, count: 0 }, c.dollar.colGap, { ...inputsOf("hedged", ys), ...inputsOf("unhedged", ys) }),
      ],
    };
  };
  const allYears = rec.years.map((y) => y.year);
  const rows = rec.years.map((y) => rowOf(String(y.year), String(y.year), [y.year], y.dollar, y.index, y.unhedged, y.hedged, c.kinds.groupCount(y.unhedged.count)));
  if (rec.together) rows.push(rowOf("together", c.dollar.together(rec.years.length), allYears, rec.together.dollar, rec.together.index, rec.together.unhedged, rec.together.hedged, c.dollar.togetherFunds(rec.together.unhedged.count, rec.years.length), true));

  const hedgedPhrase = (s: Spread, up: boolean) => (s.low === s.high ? (up ? c.dollar.oneRose(bare(s.low)) : c.dollar.oneFell(bare(s.low))) : up ? c.dollar.manyRose(bare(s.low), bare(s.high)) : c.dollar.manyFell(bare(s.high), bare(s.low)));
  const fell = rec.fell, rose = rec.rose;
  const houseOf = (id: string) => {
    const info = providerName(view, id);
    return info?.custom ? `${info.short} (${c.customEntries.enteredWord})` : (info?.short ?? id);
  };
  const nameOf = (p: Pick) => c.dollar.pairName(funds.find((f) => f.rec.id === p.fund)?.name ?? p.fund, houseOf(p.house));
  const moneyInputs = inputMap(plan);
  const nisV = (n: number, about: string) => computed(Math.round(n), "nis", "F-95", moneyInputs, { today, about });
  const round100 = (n: number) => Math.round(n / 100) * 100;
  const uMore = money ? money.unhedged - money.hedged : 0;

  return (
    <Card pad="roomy" className="flex flex-col gap-5" id="invest-dollar">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{c.dollar.title}</h2>
        <p>
          {c.dollar.lead} {many ? c.kinds.hedgedMany : ""}
        </p>
      </div>
      <StatRow cols="tiles">
        <StatTile
          label={c.dollar.cancelsLabel}
          note={
            // one height for every plan: on a phone the tiles stand one under another (nothing moves when a number changes)
            <span className="max-lg:min-h-[4lh]">
              {c.dollar.cancelsNote(from, to)} {stretch ? c.dollar.cancelsStretch(h, signed(stretch.low), signed(stretch.high)) : c.dollar.cancelsNoStretch(h)}
            </span>
          }
        >
          {num(lo, c.dollar.colDollar, "F-93")} <span className="text-base font-medium">{c.dollar.to}</span> {num(hi, c.dollar.colDollar, "F-93")}
        </StatTile>
        <StatTile
          label={c.dollar.costsLabel}
          note={
            <span>
              {single ? c.dollar.costsOne(single.name, first, last, `\u2066${sumFeesPct(single.rec).toFixed(2)}%\u2069`) : c.dollar.costsMany(hedgedFunds.length, first, last)} {c.dollar.costsUnhedged(points(rec.gaps.unhedged.low), points(rec.gaps.unhedged.high))}
            </span>
          }
        >
          {`⁦${one.format(-rec.gaps.hedged.high)}⁩`} <span className="text-base font-medium">{c.dollar.to}</span> {`⁦${one.format(-rec.gaps.hedged.low)}⁩`} {c.dollar.pointsAYear}
        </StatTile>
        <StatTile
          label={c.dollar.notCancelsLabel}
          note={
            <>
              {fell ? <span>{c.dollar.fell(fell.year, bare(fell.index), bare(fell.dollar), bare(fell.unhedged.high), bare(fell.unhedged.low), hedgedPhrase(fell.hedged, false))}</span> : <span>{c.dollar.noFall}</span>}
              {rose && <span>{(fell ? c.dollar.roseOpposite : c.dollar.roseAlone)(rose.year, bare(rose.index), bare(rose.dollar), bare(rose.unhedged.low), bare(rose.unhedged.high), hedgedPhrase(rose.hedged, true))}</span>}
            </>
          }
        >
          {fell ? (
            <>
              {num(fell.hedged.low, c.dollar.colHedged, "F-95", inputsOf("hedged", [fell.year]))} {c.dollar.inYear(fell.year)}
            </>
          ) : (
            c.dollar.noFallShort
          )}
        </StatTile>
      </StatRow>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="font-semibold">{c.dollar.yearsTitle}</h3>
          <p className="text-xs text-muted-foreground">{c.dollar.yearsNote(years.filter((y) => y.pct < 0).length, years.length)}</p>
          <YearBars label={c.dollar.yearsLabel} tickStep={10} format={barLabel} items={years.map((y) => ({ year: y.year, value: y.pct }))} bright={allYears} />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="font-semibold">{c.dollar.fundsTitle}</h3>
          <p className="text-xs text-muted-foreground">{c.dollar.fundsNote}</p>
          <ChartLegend
            items={[
              { id: "u", swatch: <Swatch shape="box" className="bg-chart-kind-unhedged" />, label: c.dollar.legendUnhedged },
              { id: "h", swatch: <Swatch shape="box" className="bg-chart-kind-hedged" />, label: <bdi>{single ? c.dollar.legendHedgedOne(single.name) : c.dollar.legendHedgedMany(hedgedFunds.length)}</bdi> },
            ]}
          />
          <PairBars label={c.dollar.fundsLabel} tickStep={20} format={barLabel} fillA="fill-chart-kind-unhedged" fillB="fill-chart-kind-hedged" items={rec.years.map((y) => ({ year: y.year, a: (y.unhedged.low + y.unhedged.high) / 2, b: (y.hedged.low + y.hedged.high) / 2 }))} />
        </div>
      </div>
      <FixedTable
        rowHead={c.dollar.colYear}
        columns={[
          { id: "dollar", head: c.dollar.colDollar },
          { id: "index", head: c.dollar.colIndex, hideOnPhone: true },
          { id: "unhedged", head: c.dollar.colUnhedged },
          { id: "hedged", head: c.dollar.colHedged },
          { id: "gap", head: c.dollar.colGap },
        ]}
        rows={rows}
      />
      {money && (
        <p ref={held} className="min-h-[3lh] max-md:min-h-[11lh]">
          <strong className="font-semibold">{c.dollar.planLead}</strong> {c.dollar.planPoint(h)} <Num value={nisV(round100(money.worth.low), c.dollar.pointAbout)} /> {c.dollar.to} <Num value={nisV(round100(money.worth.high), c.dollar.pointAbout)} />
          {c.dollar.planReal} {c.dollar.planSteady} <bdi>{uMore >= 0 ? nameOf(pairs.unhedged) : nameOf(pairs.hedged)}</bdi> {uMore >= 0 ? c.dollar.kindNoHedge : c.dollar.kindHedge} {c.dollar.leaves} <Num value={nisV(Math.abs(uMore), c.dollar.moreAbout)} /> {c.dollar.moreThan}<bdi>{uMore >= 0 ? nameOf(pairs.hedged) : nameOf(pairs.unhedged)}</bdi> {uMore >= 0 ? c.dollar.kindHedge : c.dollar.kindNoHedge}.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {c.dollar.small(rec.years.length, hedgedFunds.length)} {money?.taxShare != null && <>{c.dollar.taxLead} {`⁦${Math.round(money.taxShare * 100)}%⁩`} {c.dollar.taxTail} </>}
        {c.dollar.noSource}
      </p>
      <SourceLine
        lead={
          <>
            {c.dollar.sources}{" "}
            <a href={history.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
              {history.attribution} ↗
            </a>
          </>
        }
        items={[]}
      />
      <p>
        <strong className="font-semibold">{c.dollar.bottomLead}</strong> {c.dollar.bottomLine} <RuleRef id="ETF-75" />
      </p>
    </Card>
  );
}
