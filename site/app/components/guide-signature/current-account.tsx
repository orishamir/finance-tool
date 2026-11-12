// Current account (D29): what money costs while it sits there. The page leads with the answer most people live with: the bank pays
// nothing, so the balance loses value at the pace of inflation (the rate most of the collected banks publish, F-85). Two lines in
// today's money, the account and a daily money-market fund, the gap between them filled, bracketed and named. The few banks that do
// pay a small rate, with conditions and on a small balance, are a folded table (spec section 7). Figures come from engine runs of the two bundles (guide-signature.ts `currentAccountModel`).
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { guideSignature as copy, values as valuesCopy, kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { p05Value } from "../../lib/engine";
import { accountAxis, accountFact, bankYearlyMax, currentAccountModel, fact, payingBanks, silentBanks, type SignatureData } from "../../lib/guide-signature";
import { differenceOf, type SiteValue } from "../../lib/value";
import type { WorthFactRow } from "../guide/worth-knowing";
import { AxisLabels, ChartLegend, ChartTip, cx, Disclosure, HelpMark, PrintedText, InputSlot, NumberField, pickDim, RangeField, Sentence, Stat, StatRow, Swatch, TableCols, Tag, tickFade, useChartPick, useFadingTicks, useGlidingNumbers, useGlidingRows, useWidth, useYearZoom, YearLabels, ZoomBar, ZoomBrush, ticksOn, When, yearTicksIn } from "../kit";
import { Num, RuleRef, RulesLine, Term } from "../provenance";
import { CommonRateLine, Gap, figure, inputSite, rulesOfBundle, termInputs, typed, useSigInputs, yearsRange, type VisualProps } from "./kit";

const HEIGHT = 250;
const TOP = 20;
const BOTTOM = 26;
const LEFT = 58;
const ROW_KEYS = ["account", "fund"] as const;

type AccountPoint = { year: number; account: number; fund: number };
const FOLD_ID = copy.account.fold.anchorId;

/** A ceiling is a round amount of shekels: "10,000 ₪", not "10,000.00 ₪". */
const wholeNis = (v: SiteValue) => fmt.nisWhole(Number(v.value));

/** "a, b and c" in Hebrew. */
const joinHe = (parts: string[]): string => (parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} ו${parts[parts.length - 1]}`);

/** Opens the folded table (the "worth knowing" link points at it) and lets the anchor scroll there. */
function openFold() {
  const el = document.getElementById(FOLD_ID);
  if (el instanceof HTMLDetailsElement) el.open = true;
}

export function CurrentAccountVisual({ data, today }: VisualProps) {
  const account = data.bundles["current-account"]!;
  const fundBundle = data.bundles["money-market-fund-daily"]!;
  const inputs = useSigInputs(account);
  const cash = fact(data, "cashRate")!;
  const commonRate = fact(data, "commonRate");
  const commonCount = fact(data, "commonCount");
  const bankCount = fact(data, "bankCount");
  const tax = fact(data, "taxRate");
  const years = Math.max(1, Math.round(inputs.years));
  const model = useMemo(() => currentAccountModel(data, { balance: inputs.amount, years, bankId: null }), [data, inputs.amount, years]);
  const yr = yearsRange(account);
  const foldRef = useRef<HTMLDetailsElement>(null);

  // a link to the table from elsewhere (#current-account-banks) opens it, also when the page loads on that hash
  useEffect(() => {
    const open = () => {
      if (window.location.hash === `#${FOLD_ID}` && foldRef.current) foldRef.current.open = true;
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const base = (key: "amount_now" | "horizon_years", n: number, src: "amount" | "years") => inputSite(account, key, n, inputs.source[src], today, key === "amount_now" ? copy.common.inputNames.balance : copy.common.inputNames.years);
  const balanceValue = base("amount_now", inputs.amount, "amount");
  const yearsValue = base("horizon_years", years, "years");
  const inflation = p05Value(account.p05, "A-02");
  // both lines are in today's money (A-02), the fund's after its own fee lines; `years` is the run's length: the chart's point at a year
  // is that year's own run (runTimeline), so its sheet names the year hovered, not the horizon
  const accountIn = (yearsIn: SiteValue) => ({ [copy.common.inputNames.balance]: balanceValue, [copy.common.inputNames.years]: yearsIn, ...(model ? { [copy.account.inputs.common]: model.rate, ...(model.ceiling ? { [copy.account.inputs.ceiling]: model.ceiling } : {}) } : {}), [copy.common.inputNames.inflation]: inflation });
  const fundIn = (yearsIn: SiteValue) => ({ [copy.common.inputNames.balance]: balanceValue, [copy.common.inputNames.years]: yearsIn, [copy.common.inputNames.assumption]: cash, [copy.common.inputNames.inflation]: inflation, ...termInputs(fundBundle) });
  const yearIn = (year: number) => typed(year, "years", today, copy.common.inputNames.years);
  const values = model
    ? {
        account: figure(model.end.account, "nis", "F-67", accountIn(yearsValue), today, copy.account.about.account, rulesOfBundle(account)),
        fund: figure(model.end.fund, "nis", "F-67", fundIn(yearsValue), today, copy.account.about.fund, rulesOfBundle(fundBundle)),
      }
    : null;
  const cost = values ? differenceOf([copy.account.figures.fund, values.fund], [copy.account.figures.account, values.account], "F-67", { today, about: copy.account.about.cost }) : null;
  const change = values ? differenceOf([copy.account.figures.account, values.account], [copy.account.balance, balanceValue], "F-67", { today, about: copy.account.about.change, round: Math.abs }) : null;
  const direction = model ? (model.end.change < -0.5 ? copy.account.headline.less : model.end.change > 0.5 ? copy.account.headline.more : null) : null;

  const paying = payingBanks(data);
  const silent = silentBanks(data);
  const noOffer = silent.filter((b) => b.noOffer);
  const printedZero = silent.filter((b) => !b.noOffer);
  const everyBank = [...paying, ...silent];
  const commonIsZero = commonRate ? Number(commonRate.value) === 0 : false;
  const f = copy.account.fold;
  // the rate's head opens where the rates come from (it was a sentence above the table)
  const rateHelp = <HelpMark term={["בנק ישראל"]} about={f.columns.rate} lead={f.rateHelp} className="ms-1" />;
  const maxHead = (
    <>
      {f.columns.max.before} <Num value={balanceValue} />
      {f.columns.max.after}
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      {model && values && change ? (
        <div className="flex flex-col gap-2 max-w-measure">
          <p className="text-lg lg:text-xl font-medium">
            {copy.account.headline.lead} <InputSlot><Num value={yearsValue} display={fmt.years(years)} /></InputSlot>, <InputSlot><Num value={balanceValue} /></InputSlot>{" "}
            {copy.account.headline.inAccount}{" "}
            <Num value={values.account} /> {copy.account.headline.today} {direction ? <><Num value={change} /> {direction}</> : copy.account.headline.same}.
          </p>
          {commonIsZero && <p>{copy.account.mostPayNothing}</p>}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.account.balance}
          unit="nis"
          value={inputs.amount}
          start={inputs.p05.amount}
          isEntered={inputs.source.amount === "guide"}
          validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
          onCommit={inputs.setAmount}
          onReset={() => inputs.setAmount(null)}
          disabled={!inputs.ready}
        />
        <RangeField
          label={copy.common.years}
          unit="years"
          value={years}
          start={inputs.p05.years}
          isEntered={inputs.source.years === "guide"}
          validate={(n) => (n < yr.min || n > yr.max || !Number.isInteger(n) ? `${valuesCopy.errors.years[0]} ${fmt.number(yr.min)} ${valuesCopy.errors.years[1]}${fmt.number(yr.max)}.` : null)}
          onCommit={inputs.setYears}
          onReset={() => inputs.setYears(null)}
          min={yr.min}
          max={yr.max}
          step={yr.step ?? 1}
          inputMode="numeric"
          disabled={!inputs.ready}
        />
      </div>

      {model ? (
        <>
          <AccountChart
            points={model.points}
            start={model.start}
            amount={inputs.amount}
            years={years}
            cost={cost}
            accountFigure={(v, year) => figure(v, "nis", "F-67", accountIn(yearIn(year)), today, copy.account.about.account)}
            fundFigure={(v, year) => figure(v, "nis", "F-67", fundIn(yearIn(year)), today, copy.account.about.fund)}
          />
          <p className="text-xs text-muted-foreground">{copy.account.axisNote}</p>
          <StatRow cols={3}>
            <Stat label={`${copy.account.figures.account} ${copy.account.after} ${fmt.years(years)}`} tone="net">
              {values && <Num value={values.account} size="inline" />}
            </Stat>
            <Stat label={<Term prefix="ב" id="קרנות כספיות יומיות">{copy.account.figures.fundTerm}</Term>} tone="alt">
              {values && <Num value={values.fund} />}
            </Stat>
            <Stat label={copy.account.figures.cost}>{cost && <Num value={cost} />}</Stat>
          </StatRow>
          <Sentence size="xs" tone="muted" measure>
            {copy.account.todayMoney.before} <Num value={inflation} /> {copy.account.todayMoney.after}
          </Sentence>
        </>
      ) : null}

      <Sentence size="sm" tone="muted" measure>
        {copy.common.fundAssumption.lead} <Term id="תשואה">{copy.common.fundAssumption.term}</Term> {copy.common.fundAssumption.before} <Num value={cash} /> {copy.common.fundAssumption.after}
      </Sentence>

      {everyBank.length > 0 ? (
        <Disclosure detailsRef={foldRef} id={FOLD_ID} className="rounded-md border border-border anchor-target" spread summaryClassName="px-4 py-2" labelClassName="font-medium" label={f.title}>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* each column says what it holds in its head: the last one with the balance the person entered, the rate with a "?" for where the
                rates come from; no sentence around the table explains a column (guidelines/design.md "Tables"). The tax
                and the bank's ceiling open from each figure. */}
            {!tax && <Gap id="rule:TXI-03" />}
            {/* how many banks pay nothing, said with the banks themselves, not under the headline */}
            {commonRate && commonCount && bankCount && (
              <Sentence size="sm" tone="muted">
                <CommonRateLine rate={commonRate} count={commonCount} of={bankCount} />
              </Sentence>
            )}

            <table className="w-full table-fixed text-sm border-collapse tabular-nums max-md:block max-md:[&>colgroup]:hidden">
              <TableCols widths={["8rem", "8rem", "auto", "9rem"]} />
              <thead className="hidden md:table-header-group">
                <tr className="text-muted-foreground text-start">
                  <th scope="col" className="font-medium text-start pb-2 pe-4">{f.columns.bank}</th>
                  <th scope="col" className="font-medium text-start pb-2 pe-4 whitespace-nowrap">{f.columns.rate}{rateHelp}</th>
                  <th scope="col" className="font-medium text-start pb-2 pe-4">{f.columns.who}</th>
                  <th scope="col" className="font-medium text-start pb-2">{maxHead}</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {paying.map((b, row) => {
                  const yearly = tax ? figure(bankYearlyMax(b, inputs.amount, Number(tax.value)), "nis", "F-26", { [copy.account.inputs.rate]: b.rate, ...(b.ceiling ? { [copy.account.inputs.ceiling]: b.ceiling } : {}), [copy.account.balance]: balanceValue, [copy.account.inputs.tax]: tax }, today, copy.account.about.maxYear, rulesOfBundle(account)) : null;
                  return (
                    <tr key={b.id} className={cx("flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 md:table-row")}>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top flex-1 min-w-32">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium"><bdi>{b.name}</bdi></span>
                          {b.until && (
                            <Tag tone="neutral">
                              <When iso={b.until} lead={`${f.until} `} />
                            </Tag>
                          )}
                        </div>
                      </td>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top font-semibold">
                        <span className="md:hidden text-xs font-normal text-muted-foreground">{f.columns.rate}{row === 0 && rateHelp}: </span>
                        <Num value={b.rate} />
                      </td>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top basis-full text-muted-foreground">
                        {b.conditions && <PrintedText text={b.conditions} />}
                      </td>
                      <td className="md:table-cell md:py-3 md:align-top basis-full">
                        <span className="md:hidden text-xs text-muted-foreground">{maxHead}: </span>
                        {yearly ? <Num value={yearly} /> : null}
                      </td>
                    </tr>
                  );
                })}
                {silent.length > 0 && (
                  <tr className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 md:table-row">
                    <td className="md:table-cell md:py-3 md:pe-4 md:align-top flex-1 min-w-32 font-medium">{f.silent.title}</td>
                    <td colSpan={2} className="md:table-cell md:py-3 md:pe-4 md:align-top basis-full text-muted-foreground">
                      <div className="flex flex-col gap-2">
                        {noOffer.length > 0 && (
                          <p>
                            {joinHe(noOffer.map((b) => b.name))} {noOffer.length === 1 ? f.silent.sentence.one : f.silent.sentence.many} {f.silent.sentence.rest} {f.silent.sentence.quote} <RuleRef id="BANK-09" />
                          </p>
                        )}
                        {printedZero.map((b) => (
                          <p key={b.id}>
                            <bdi>{b.name}</bdi> {f.silent.printedZero.mid} <Num value={b.rate} />
                            {f.silent.printedZero.end}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="md:table-cell md:py-3 md:align-top basis-full">
                      <span className="md:hidden text-xs text-muted-foreground">{maxHead}: </span>
                      {f.silent.nothing}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Disclosure>
      ) : (
        <Gap id="accountBanks" />
      )}
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}

/**
 * "Worth knowing": how many of the collected banks pay interest on a current-account balance, on what terms, and
 * the most. Computed from the published records, not a rule; every figure goes through `Num`, and a link opens the folded table.
 */
function AccountWorthFact({ data }: { data: SignatureData }) {
  const f = accountFact(data);
  if (!f) return null;
  const w = copy.account.worth;
  const one = Number(f.paying.value) === 1;
  const form = one ? "one" : "many";
  return (
    <p>
      <Num value={f.paying} display={one ? w.oneWord : undefined} /> {w[form].mid} <Num value={f.of} /> {w[form].after}
      {f.allConditional && f.ceiling ? (
        <>
          {w.conditionalCapped[form]} <Num value={f.ceiling} display={wholeNis(f.ceiling)} /> {w.conditionalCapped.only}
        </>
      ) : f.allConditional ? (
        w.conditional[form]
      ) : f.ceiling ? (
        <>
          {w.capped[form]} <Num value={f.ceiling} display={wholeNis(f.ceiling)} /> {w.capped.only}
        </>
      ) : null}
      ; {w.best} <Num value={f.top.rate} />, {w.at} <bdi>{f.top.name}</bdi>.{" "}
      <a href={`#${FOLD_ID}`} onClick={openFold} className="text-link hover:underline">
        {w.link}
      </a>
    </p>
  );
}

/** The "worth knowing" row of this page, or null when the records say nothing to count. */
export function accountWorthRow(data: SignatureData): WorthFactRow | null {
  if (!accountFact(data)) return null;
  return { kind: "fact", id: "current-account-banks", content: <AccountWorthFact data={data} /> };
}

/**
 * The account and the fund over the years, on their own, so a frame of the chart's glide draws the chart and not the whole visual. The value
 * axis's two ends and the amount's dashed line glide with the lines; the words at the lines' ends follow them.
 */
function AccountChart({ points, start, amount, years, cost, accountFigure, fundFigure }: { points: AccountPoint[]; start: number; amount: number; years: number; cost: SiteValue | null; accountFigure: (v: number, year: number) => SiteValue; fundFigure: (v: number, year: number) => SiteValue }) {
  const [box, width] = useWidth();
  const plotW = width - 8;
  const [hover, setHover] = useState<number | null>(null);
  const legendPick = useChartPick();
  const zoom = useYearZoom({ last: years, plotLeft: LEFT, plotWidth: plotW - LEFT, onHover: setHover });
  const clip = useId().replace(/:/g, "");
  const pts = useGlidingRows(points, ROW_KEYS);
  const axis = accountAxis([amount, ...points.filter((p) => zoom.seen(p.year)).flatMap((p) => [p.account, p.fund])]);
  const yGoal = scaleLinear().domain([axis.lo, axis.hi]).nice(4);
  const [lo, hi, startNow] = useGlidingNumbers([yGoal.domain()[0]!, yGoal.domain()[1]!, start]) as [number, number, number];
  // the value labels sit in a gutter at the left edge; the lines start right of it, so a label never lies on the start of a line
  const x = scaleLinear().domain(zoom.domain).range([LEFT, plotW]);
  const y = scaleLinear().domain([lo, hi]).range([HEIGHT - BOTTOM, TOP]);
  const ticks = ticksOn(useFadingTicks(yGoal.ticks(4)), y, y.range());
  const yearTicks = useFadingTicks(yearTicksIn(zoom.settled[0], zoom.settled[1]));
  const acct = line<AccountPoint>().x((d) => x(d.year)).y((d) => y(d.account));
  const fnd = line<AccountPoint>().x((d) => x(d.year)).y((d) => y(d.fund));
  const gap = area<AccountPoint>().x((d) => x(d.year)).y0((d) => y(d.account)).y1((d) => y(d.fund));
  // the last year in view: zoomed in, the lines' names stand there, beside their ends
  const last = [...pts].reverse().find((p) => p.year <= zoom.settled[1]);
  const read = hover === null ? null : pts.find((p) => p.year === hover);
  return (
    <>
      <ChartLegend
        pick={legendPick}
        items={[
          { id: "account", swatch: <Swatch className="bg-chart-net" />, label: copy.account.chart.account },
          { id: "fund", swatch: <Swatch className="bg-chart-alt" />, label: copy.account.chart.fund },
          { id: "baseline", swatch: <Swatch shape="rule" className="border-chart-baseline" />, label: copy.account.chart.baseline },
          { id: "cost", swatch: <Swatch shape="box" className="bg-chart-alt/25" />, label: copy.account.chart.cost },
        ]}
      />
      <div className="flex flex-col gap-1">
        <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
          <svg ref={zoom.svgRef} {...zoom.handlers} width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.account.chart.aria} className="block select-none touch-pan-y">
            <defs>
              <clipPath id={clip}>
                <rect x={LEFT} y={0} width={Math.max(0, plotW - LEFT)} height={HEIGHT} />
              </clipPath>
            </defs>
            {ticks.map((t) => (
              <line key={t.value} x1={0} x2={plotW} y1={y(t.value)} y2={y(t.value)} className={cx("stroke-chart-grid", tickFade(t))} strokeWidth="1" />
            ))}
            <line x1={0} x2={plotW} y1={HEIGHT - BOTTOM} y2={HEIGHT - BOTTOM} className="stroke-chart-axis" strokeWidth="1" />
            <path d={gap(pts) ?? ""} clipPath={`url(#${clip})`} className={cx("fill-chart-alt", pickDim(legendPick.active, "cost"))} fillOpacity="0.22" />
            <line x1={0} x2={plotW} y1={y(startNow)} y2={y(startNow)} className={cx("stroke-chart-baseline", pickDim(legendPick.active, "baseline"))} strokeWidth="1.5" strokeDasharray="5 4" />
            <g clipPath={`url(#${clip})`}>
              <path d={fnd(pts) ?? ""} fill="none" className={cx("stroke-chart-alt", pickDim(legendPick.active, "fund"))} strokeWidth="2.5" strokeLinejoin="round" />
              <path d={acct(pts) ?? ""} fill="none" className={cx("stroke-chart-net", pickDim(legendPick.active, "account"))} strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            {/* after the lines and the dashed start, with the card-colour halo: the start line ran through "50 אלף ₪" */}
            <AxisLabels ticks={ticks} y={y} />
            {last && !zoom.view && Math.abs(y(last.fund) - y(last.account)) > 12 && (
              // the gap as a difference: a bracket between the two ends, its number beside it (D29 rule 6)
              <path d={`M ${plotW - 8} ${y(last.fund)} h 4 V ${y(last.account)} h -4`} fill="none" className="stroke-chart-text" strokeWidth="1.5" />
            )}
            <YearLabels ticks={yearTicks} x={x} y={HEIGHT - 8} left={LEFT} right={plotW} word={(t) => (t === 0 ? copy.account.today : String(t))} />
            {read && (
              <g>
                <line x1={x(read.year)} x2={x(read.year)} y1={TOP} y2={HEIGHT - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
                <circle cx={x(read.year)} cy={y(read.fund)} r="4" className="stroke-card fill-chart-alt" strokeWidth="2" />
                <circle cx={x(read.year)} cy={y(read.account)} r="4" className="stroke-card fill-chart-net" strokeWidth="2" />
              </g>
            )}
            <ZoomBrush brush={zoom.brush} left={LEFT} top={TOP} bottom={HEIGHT - BOTTOM} />
          </svg>
          {/* the words over the plot let a tap through to the year under them (a tap on them read nothing); the cost's figure
              opens its source from the figures above the chart */}
          {last && (
            <>
              <span className="pointer-events-none absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: Math.max(0, y(last.fund) - 22) }}>
                {copy.account.chart.fund}
              </span>
              <span className="pointer-events-none absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: y(last.account) + 6 }}>
                {copy.account.chart.account}
              </span>
              {cost && !zoom.view && (
                <span className="pointer-events-none absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ right: 26, top: Math.min(HEIGHT - BOTTOM - 24, Math.max(TOP, (y(last.fund) + y(last.account)) / 2 - 10)) }}>
                  {copy.account.chart.cost} <Num value={cost} animate />
                </span>
              )}
            </>
          )}
          {read && !zoom.brush && (
            <ChartTip x={x(read.year)} top={TOP} width={width}>
              <span className="block font-medium">{read.year === 0 ? copy.account.today : <>{kitCopy.chart.yearWord} <bdi dir="ltr">{read.year}</bdi></>}</span>
              <span className="block">
                {copy.account.chart.account}: <Num value={accountFigure(read.account, read.year)} />
              </span>
              <span className="block">
                {copy.account.chart.fund}: <Num value={fundFigure(read.fund, read.year)} />
              </span>
            </ChartTip>
          )}
        </div>
        <ZoomBar zoom={zoom} yearWord={(t) => (t === 0 ? copy.account.today : String(t))} />
      </div>
    </>
  );
}
