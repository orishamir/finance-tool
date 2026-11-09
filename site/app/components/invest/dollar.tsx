// "Hedged or not: what happened" (F-95; option A of 8dd1f013:research/specs/2026-10-31-hedged): what the dollar did each year
// and what each kind of fund did in the same years, from the funds' own reports, and one sentence on the plan. No forecast, no ranking.
import { useMemo } from "react";
import { comparedYears, kindRecord, stretchRange, yearlyChanges, type GapYear, type Spread, type Stretch } from "@finance-tool/engine";
import { invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import { monthEndRate, type FxHistory } from "../../lib/fx";
import { gapListFor, kindMoney, kindOf, planInputs, reportFigure, reportsInShekels, type InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { computed, differenceOf, ownBy, sumOf, type SiteValue } from "../../lib/value";
import { Num, RuleRef } from "../provenance";
import { MixedName, Card, ChartLegend, FixedTable, LongestCase, PairBars, SourceLine, StatRow, StatTile, Swatch, Tpl, YearBars, gershayim, useChartPick, useHeldHeight } from "../kit";
import { allFunds, kindPairs, LONGEST_AMOUNT, LONGEST_YEARS, type Pick } from "./pair";
import { providerName } from "./sections";
import { sourceHref } from "../../lib/sources";

const one = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Isolated for a Hebrew sentence: "−18.5%" with its sign, or "18.5%" for a word that already says up or down. */
const signed = (x: number) => `⁦${x > 0 ? "+" : x < 0 ? "−" : ""}${one.format(Math.abs(x))}%⁩`;
const bare = (x: number) => `⁦${one.format(Math.abs(x))}%⁩`;
const points = (x: number) => `⁦${x > 0 ? "+" : x < 0 ? "−" : ""}${one.format(Math.abs(x))}⁩`;
const barLabel = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`;

export function DollarSection({ view, bundle, plan, pick }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick }) {
  const today = bundle.today;
  const funds = allFunds(view);
  const history = bundle.fxHistory;
  const years = useMemo(() => yearlyChanges(history?.points ?? []), [history]);
  // F-95 compares shekel returns: a foreign fund's yearly figures are in its own currency and stay out (reportsInShekels)
  const reporting = useMemo(() => funds.filter((f) => reportsInShekels(f.rec)), [funds]);
  // the gaps (a return less its index) only over the years F-92 (d) compares; the returns over every year of the reports
  const rec = useMemo(
    () => kindRecord(reporting.map((f) => ({ hedged: kindOf(f.rec) === "hedged", years: f.rec.tracking_record!.years as readonly GapYear[], compared: comparedYears(f.rec.tracking_record, gapListFor(bundle, f.rec)) !== null })), years),
    [reporting, years, bundle],
  );
  const pairs = kindPairs(view, pick);
  const money = useMemo(
    () => (pairs ? kindMoney({ bundle, index: view.index, plan, unhedged: { fundId: pairs.unhedged.fund, providerId: pairs.unhedged.house }, hedged: { fundId: pairs.hedged.fund, providerId: pairs.hedged.house } }) : null),
    [bundle, view.index, plan, pairs?.unhedged.fund, pairs?.unhedged.house, pairs?.hedged.fund, pairs?.hedged.house],
  );
  const h = Math.round(plan.years);
  const stretch = history ? stretchRange(history.points, h) : null;
  // a ratchet behind the cases: a pair's real words can still wrap a line longer than every case
  const held = useHeldHeight<HTMLDivElement>(view.index.id);
  const legendPick = useChartPick();
  // with no compared year of a kind there is no gap to say, and the section's second tile would have no figure
  if (!rec || !pairs || !history || !rec.gaps.unhedged || !rec.gaps.hedged) return null;
  const gaps = { unhedged: rec.gaps.unhedged, hedged: rec.gaps.hedged };

  const hedgedFunds = reporting.filter((f) => kindOf(f.rec) === "hedged" && f.rec.tracking_record!.years.some((y) => rec.years.some((r) => r.year === y.year)));
  // the sentence beside the gap range counts only the reports the range rests on, those F-92 (d) compares, and names their years
  const gapFunds = hedgedFunds.filter((f) => comparedYears(f.rec.tracking_record, gapListFor(bundle, f.rec)) !== null);
  const gapYears = [...new Set(gapFunds.flatMap((f) => f.rec.tracking_record!.years.map((y) => y.year)).filter((y) => rec.years.some((r) => r.year === y)))].sort((a, b) => a - b);
  const single = gapFunds.length === 1 ? gapFunds[0]! : null;
  const first = gapYears[0] ?? rec.years[0]!.year, last = gapYears[gapYears.length - 1] ?? rec.years[rec.years.length - 1]!.year;
  const lo = Math.min(...years.map((y) => y.pct)), hi = Math.max(...years.map((y) => y.pct));
  const loYear = years.find((y) => y.pct === lo)!.year, hiYear = years.find((y) => y.pct === hi)!.year;
  const from = years[0]?.year ?? 0, to = years[years.length - 1]?.year ?? 0;
  const many = view.index.exposure?.other_currencies === true;

  // a figure in the table: computed over each named fund's report for the year (the fund's own document, D31); `every`: the years
  // together compound only the funds that have every one of them (F-95, kindRecord), so only those are listed
  const inputsOf = (kind: "unhedged" | "hedged", ys: readonly number[], every = false) => {
    const out: Record<string, SiteValue> = {};
    for (const f of reporting) {
      const t = f.rec.tracking_record!;
      if (kindOf(f.rec) !== kind || (every && !ys.every((y) => t.years.some((x) => x.year === y)))) continue;
      for (const y of t.years) if (ys.includes(y.year)) out[c.dollar.inputFund(f.name, y.year)] = reportFigure(f.rec, y.fund_pct, t.page);
    }
    return out;
  };
  // the index in a year is the hedged funds' tracking asset as the first hedged report of that year prints it (kindRecord)
  const indexInputs = (year: number): Record<string, SiteValue> => {
    const f = reporting.find((x) => kindOf(x.rec) === "hedged" && x.rec.tracking_record!.years.some((y) => y.year === year));
    const t = f?.rec.tracking_record;
    const y = t?.years.find((x) => x.year === year);
    return f && t && y ? { [c.kinds.gapInputBenchmark(t.benchmark.name, year)]: reportFigure(f.rec, y.tracking_pct, t.page) } : {};
  };
  const fig = (x: number, about: string, formula: string, inputs: Record<string, SiteValue>) => computed(Math.round(x * 100) / 100, "pct", formula, inputs, { today, about });
  const num = (x: number, about: string, formula: string, inputs: Record<string, SiteValue>) => <Num value={fig(x, about, formula, inputs)} display={signed(x)} />;
  // a change of the dollar (F-93) is computed from shekels per dollar at two month ends, each from the ECB's two end-of-month rates (F-84)
  const rateInput = (p: FxHistory["points"][number]): [string, SiteValue] => {
    const label = c.dollar.inputRate(fmt.period(p.date.slice(0, 7)));
    return [label, monthEndRate(history, p, today, label)];
  };
  const december = (year: number) => history.points.find((p) => p.date.startsWith(`${year}-12`));
  const yearInputs = (year: number): Record<string, SiteValue> => {
    const a = december(year - 1), b = december(year);
    return a && b ? Object.fromEntries([rateInput(a), rateInput(b)]) : {};
  };
  const dollarOf = (year: number, pct: number) => fig(pct, c.dollar.inputDollar(year), "F-93", yearInputs(year));
  const stretchInputs = (s: Stretch<FxHistory["points"][number]>): Record<string, SiteValue> => ({ ...Object.fromEntries([rateInput(s.start), rateInput(s.end)]), ...planInputs(plan, ["years"]) });
  // each year's dollar and index; the years together compound them (F-95), so their sheet lists each year's
  const yearFigs = new Map(rec.years.map((y) => [y.year, { dollar: dollarOf(y.year, y.dollar), index: fig(y.index, c.dollar.colIndex, "F-95", indexInputs(y.year)) }]));
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
  const rowOf = (key: string, head: string, ys: readonly number[], d: SiteValue, index: SiteValue, dn: number, xn: number, u: Spread, he: Spread, uNote: string, strong = false) => {
    const lowGap = he.low - u.high, highGap = he.high - u.low;
    const every = ys.length > 1;
    return {
      key,
      head,
      strong,
      cells: [
        <Num key="d" value={d} display={signed(dn)} />,
        <Num key="i" value={index} display={signed(xn)} />,
        range(u, c.dollar.colUnhedged, inputsOf("unhedged", ys, every), uNote),
        range(he, c.dollar.colHedged, inputsOf("hedged", ys, every), he.count > 1 ? c.kinds.groupCount(he.count) : undefined),
        range({ low: lowGap, high: highGap, count: 0 }, c.dollar.colGap, { ...inputsOf("hedged", ys, every), ...inputsOf("unhedged", ys, every) }),
      ],
    };
  };
  const allYears = rec.years.map((y) => y.year);
  const hedgedName = hedgedFunds.length === 1 ? c.dollar.legendHedgedOne(hedgedFunds[0]!.name) : c.dollar.legendHedgedMany(hedgedFunds.length);
  const rows = rec.years.map((y) => rowOf(String(y.year), String(y.year), [y.year], yearFigs.get(y.year)!.dollar, yearFigs.get(y.year)!.index, y.dollar, y.index, y.unhedged, y.hedged, c.kinds.groupCount(y.unhedged.count)));
  if (rec.together) {
    const each = (k: "dollar" | "index", name: (year: number) => string) => Object.fromEntries(allYears.map((year) => [name(year), yearFigs.get(year)![k]]));
    const t = rec.together;
    rows.push(rowOf("together", c.dollar.together(rec.years.length), allYears, fig(t.dollar, c.dollar.colDollar, "F-95", each("dollar", c.dollar.inputDollar)), fig(t.index, c.dollar.colIndex, "F-95", each("index", c.dollar.inputIndex)), t.dollar, t.index, t.unhedged, t.hedged, c.dollar.togetherFunds(t.unhedged.count, rec.years.length), true));
  }

  // a figure in a sentence whose words say up or down: no sign, and its sheet (each one opens, as in the table)
  const word = (x: number, about: string, inputs: Record<string, SiteValue>) => <Num value={fig(x, about, "F-95", inputs)} display={bare(x)} />;
  const hedgedPhrase = (s: Spread, up: boolean, year: number) => {
    const ins = inputsOf("hedged", [year]);
    return s.low === s.high ? (
      <Tpl t={up ? c.dollar.oneRose : c.dollar.oneFell} vars={{ x: word(s.low, c.dollar.colHedged, ins) }} />
    ) : (
      <Tpl t={up ? c.dollar.manyRose : c.dollar.manyFell} vars={{ a: word(up ? s.low : s.high, c.dollar.colHedged, ins), b: word(up ? s.high : s.low, c.dollar.colHedged, ins) }} />
    );
  };
  // the year the index fell as the dollar rose, or rose as it fell: each figure the table's own for that year
  const yearStory = (y: NonNullable<typeof rec.fell>, t: string, up: boolean) => {
    const f = yearFigs.get(y.year)!;
    const u = inputsOf("unhedged", [y.year]);
    return (
      <Tpl
        t={t}
        vars={{
          index: <Num value={f.index} display={bare(y.index)} />,
          dollar: <Num value={f.dollar} display={bare(y.dollar)} />,
          a: word(up ? y.unhedged.low : y.unhedged.high, c.dollar.colUnhedged, u),
          b: word(up ? y.unhedged.high : y.unhedged.low, c.dollar.colUnhedged, u),
          hedged: hedgedPhrase(y.hedged, up, y.year),
        }}
      />
    );
  };
  // a gap is a fund's return less its index's, each from that fund's report: both are its inputs (F-95)
  const gapInputs = (kind: "unhedged" | "hedged") => {
    const out: Record<string, SiteValue> = {};
    for (const f of reporting) {
      const t = f.rec.tracking_record!;
      if (kindOf(f.rec) !== kind || comparedYears(t, gapListFor(bundle, f.rec)) === null) continue;
      for (const y of t.years) {
        if (!rec.years.some((r) => r.year === y.year)) continue;
        out[c.dollar.inputFund(f.name, y.year)] = reportFigure(f.rec, y.fund_pct, t.page);
        out[c.dollar.inputFundIndex(f.name, y.year)] = reportFigure(f.rec, y.tracking_pct, t.page);
      }
    }
    return out;
  };
  // the one hedged fund's listed fees together (F-10), each from the fund's own documents
  const feesOf = (f: (typeof gapFunds)[number]) => {
    const w = c.pair.fundInputs;
    const own = (v: unknown) => (v && typeof (v as SiteValue).value === "number" ? ownBy(v as SiteValue, f.rec.manager) : null);
    const each: [string, SiteValue | null][] = [
      [w.fixed, own(f.rec.fees.fixed_management)],
      [w.variable, own(f.rec.fees.variable_management)],
      [w.trustee, own(f.rec.fees.trustee)],
    ];
    const parts = Object.fromEntries(each.filter((e): e is [string, SiteValue] => e[1] !== null));
    return sumOf(parts, "F-10", { today, about: c.dollar.feesAbout });
  };
  const fell = rec.fell, rose = rec.rose;
  // each year's middle of each kind, as the bars draw them; the chart's title counts the years the hedged bar is the taller
  const fundBars = rec.years.map((y) => ({ year: y.year, a: (y.unhedged.low + y.unhedged.high) / 2, b: (y.hedged.low + y.hedged.high) / 2 }));
  const houseOf = (id: string) => {
    const info = providerName(view, id);
    return info?.custom ? `${info.short} (${c.customEntries.enteredWord})` : (info?.short ?? id);
  };
  const nameOf = (p: Pick) => c.dollar.pairName(funds.find((f) => f.rec.id === p.fund)?.name ?? p.fund, houseOf(p.house));
  const round100 = (n: number) => Math.round(n / 100) * 100;
  const uMore = money ? money.unhedged - money.hedged : 0;
  // the sentence's figures are worked out from the two pairs' values left, each with what its run reads (F-95)
  const pairInputs = (m: NonNullable<typeof money>) => ({ u: [c.pair.input(nameOf(pairs.unhedged), c.pair.colLeft), m.figures.unhedged] as const, h: [c.pair.input(nameOf(pairs.hedged), c.pair.colLeft), m.figures.hedged] as const });
  const worthV = (m: NonNullable<typeof money>, n: number) => {
    const { u, h } = pairInputs(m);
    return computed(Math.round(round100(n)), "nis", "F-95", { [u[0]]: u[1], [h[0]]: h[1] }, { today, about: c.dollar.pointAbout });
  };
  const moreV = (m: NonNullable<typeof money>) => {
    const { u, h } = pairInputs(m);
    return differenceOf(uMore >= 0 ? u : h, uMore >= 0 ? h : u, "F-95", { today, about: c.dollar.moreAbout, round: Math.round });
  };
  // the cases: every fund of the index in each of the two places, beside the longest pair in the other, at the longest account name, with
  // both kinds' words; a name's length in letters does not say how it wraps, so each name is laid out, not only the longest
  const longestOf = (xs: string[]) => xs.reduce((a, b) => (b.length > a.length ? b : a), "");
  const longestHouse = longestOf(view.providers.map((p) => houseOf(p.id)));
  const longestPair = c.dollar.pairName(longestOf(funds.map((f) => f.name)), longestHouse);
  // laid out unseen, for the line's longest case only
  const sampleNum = <Num value={computed(LONGEST_AMOUNT, "nis", "F-95", {}, { today, about: c.dollar.pointAbout })} />;
  const planCase = (a: string, b: string, k1: string, k2: string, key: string) => (
    <p key={key}>
      <strong className="font-semibold">{c.dollar.planLead}</strong> {c.dollar.planPoint(LONGEST_YEARS)} {sampleNum} {c.dollar.to} {sampleNum}
      {c.dollar.planReal} {c.dollar.planSteady} <MixedName>{a}</MixedName> {k1} {c.dollar.leaves} {sampleNum} {c.dollar.moreThan(b)}<MixedName>{b}</MixedName> {k2}.
    </p>
  );
  const planCases = funds.flatMap((f, i) => {
    const mine = c.dollar.pairName(f.name, longestHouse);
    return [planCase(mine, longestPair, c.dollar.kindNoHedge, c.dollar.kindHedge, `a${i}`), planCase(longestPair, mine, c.dollar.kindHedge, c.dollar.kindNoHedge, `b${i}`)];
  });

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
              {c.dollar.cancelsNote(from, to)}{" "}
              {stretch ? (
                <Tpl t={c.dollar.cancelsStretch(h)} vars={{ lo: num(stretch.low, c.dollar.stretchAbout(h), "F-93", stretchInputs(stretch.lowAt)), hi: num(stretch.high, c.dollar.stretchAbout(h), "F-93", stretchInputs(stretch.highAt)) }} />
              ) : (
                c.dollar.cancelsNoStretch(h)
              )}
            </span>
          }
        >
          <Num value={dollarOf(loYear, lo)} display={signed(lo)} /> <span className="text-base font-medium">{c.dollar.to}</span> <Num value={dollarOf(hiYear, hi)} display={signed(hi)} />
        </StatTile>
        <StatTile
          label={c.dollar.costsLabel}
          note={
            <span>
              {single ? <Tpl t={c.dollar.costsOne(gershayim(single.name), first, last)} vars={{ fee: <Num value={feesOf(single)} /> }} /> : c.dollar.costsMany(gapFunds.length, first, last)}{" "}
              <Tpl
                t={c.dollar.costsUnhedged}
                vars={{
                  lo: <Num value={fig(gaps.unhedged.low, c.dollar.unhedgedGapAbout, "F-95", gapInputs("unhedged"))} display={points(gaps.unhedged.low)} />,
                  hi: <Num value={fig(gaps.unhedged.high, c.dollar.unhedgedGapAbout, "F-95", gapInputs("unhedged"))} display={points(gaps.unhedged.high)} />,
                }}
              />
            </span>
          }
        >
          {/* the shortfall, how far below its index: the gap with its sign turned, as the label words it */}
          <Num value={fig(-gaps.hedged.high, c.dollar.shortfallAbout, "F-95", gapInputs("hedged"))} display={`⁦${one.format(-gaps.hedged.high)}⁩`} /> <span className="text-base font-medium">{c.dollar.to}</span>{" "}
          <Num value={fig(-gaps.hedged.low, c.dollar.shortfallAbout, "F-95", gapInputs("hedged"))} display={`⁦${one.format(-gaps.hedged.low)}⁩`} /> {c.dollar.pointsAYear}
        </StatTile>
        <StatTile
          label={c.dollar.notCancelsLabel}
          note={
            <>
              {fell ? yearStory(fell, c.dollar.fell(fell.year), false) : <span>{c.dollar.noFall}</span>}
              {rose && yearStory(rose, (fell ? c.dollar.roseOpposite : c.dollar.roseAlone)(rose.year), true)}
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
          <h3 className="font-semibold">{c.dollar.yearsTitle(years.filter((y) => y.pct < 0).length, years.length)}</h3>
          <p className="text-xs text-muted-foreground">{c.dollar.yearsNote}</p>
          <YearBars label={c.dollar.yearsLabel} tickStep={10} format={barLabel} items={years.map((y) => ({ year: y.year, value: y.pct }))} bright={allYears} />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="font-semibold">{c.dollar.fundsTitle(fundBars.filter((b) => b.b > b.a).length, fundBars.length, hedgedFunds.length > 1, fundBars[0]?.year ?? 0)}</h3>
          <p className="text-xs text-muted-foreground">{c.dollar.fundsNote}</p>
          <ChartLegend
            pick={legendPick}
            items={[
              { id: "u", swatch: <Swatch shape="box" className="bg-chart-kind-unhedged" />, label: c.dollar.legendUnhedged },
              { id: "h", swatch: <Swatch shape="box" className="bg-chart-kind-hedged" />, label: <MixedName>{hedgedName}</MixedName> },
            ]}
          />
          <PairBars label={c.dollar.fundsLabel} format={barLabel} fillA="fill-chart-kind-unhedged" fillB="fill-chart-kind-hedged" nameA={c.dollar.legendUnhedged} nameB={hedgedName} highlight={legendPick.active === "u" ? "a" : legendPick.active === "h" ? "b" : null} items={fundBars} />
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
      {/* held at its longest case (a ratchet held it only after the fact, and a longer pair's name grew it by a few pixels the first
          time): the longest names of an account and a fund on this index in both places, the longest years and figures */}
      <div ref={held}>
      <LongestCase cases={planCases}>
        {money && (
          <p>
            <strong className="font-semibold">{c.dollar.planLead}</strong> {c.dollar.planPoint(h)} <Num value={worthV(money, money.worth.low)} /> {c.dollar.to} <Num value={worthV(money, money.worth.high)} />
            {c.dollar.planReal} {c.dollar.planSteady} <MixedName>{uMore >= 0 ? nameOf(pairs.unhedged) : nameOf(pairs.hedged)}</MixedName> {uMore >= 0 ? c.dollar.kindNoHedge : c.dollar.kindHedge} {c.dollar.leaves} <Num value={moreV(money)} /> {c.dollar.moreThan(uMore >= 0 ? nameOf(pairs.hedged) : nameOf(pairs.unhedged))}<MixedName>{uMore >= 0 ? nameOf(pairs.hedged) : nameOf(pairs.unhedged)}</MixedName> {uMore >= 0 ? c.dollar.kindHedge : c.dollar.kindNoHedge}.
          </p>
        )}
      </LongestCase>
      </div>
      {/* held with the tax sentence: with nothing left to tax (amount and deposit 0) it goes, and what follows moved 45 px */}
      <LongestCase className="text-sm text-muted-foreground" cases={[<p key="t">{c.dollar.small(rec.years.length, hedgedFunds.length)} {c.dollar.taxLead} {"⁦100%⁩"} {c.dollar.taxTail} {c.dollar.noSource}</p>]}>
        <p>
          {c.dollar.small(rec.years.length, hedgedFunds.length)} {money?.taxShare && (
            <>
              {c.dollar.taxLead} <Num value={money.taxShare} /> {c.dollar.taxTail}{" "}
            </>
          )}
          {c.dollar.noSource}
        </p>
      </LongestCase>
      <SourceLine
        lead={
          <>
            {c.dollar.sources}{" "}
            <a href={sourceHref({ url: history.sourceUrl })} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
              {history.attribution} ↗
            </a>
          </>
        }
        items={[]}
      />
      <p>
        <strong className="font-semibold">{c.dollar.bottomLead}</strong> {c.dollar.bottomLine} <RuleRef id="ETF-75" titled />
      </p>
    </Card>
  );
}
