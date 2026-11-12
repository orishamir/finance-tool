// The graph card of a guide page (design-spec 2, "מה זה"): headline, real/nominal switch, legend, chart,
// assumption chips (phone), readout, table, rules used; the values sheet (phone) or panel (PC) beside it.
import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { paidInAsEntered, type P05Input } from "@finance-tool/engine";
import { buttons, computedInputs as ci, guide as copy, guideBlocks, provenance as provCopy, system, values as valuesCopy } from "../../copy";
import { p05Number, p05Range, p05Value, runTimeline, type Bundle, type Timeline as TimelineData, type TimelineResult, type YearPoint } from "../../lib/engine";
import { fmt, nisShown } from "../../lib/format";
import { useInputs, type Employment } from "../../lib/inputs";
import { useOwnRates } from "../../lib/own-rate";
import { useValueMode, type ValueMode as Mode } from "../../lib/mode-store";
import { p05Units, asField, computed, entered as enteredValue, feeLabel, feeYear, ruleFigure, weaker, type SiteValue, type Strength } from "../../lib/value";
import { lumpSumEntered } from "../../lib/guide-signature";
import { TimelineChart, type ChartPoint, type Marker } from "../chart/TimelineChart";
import { IconReset } from "../icons";
import { Num, RuleRef, RulesLine, StateTag } from "../provenance";
import { Sheet } from "../Sheet";
import { Button, Callout, Card, ChartLegend, FoldGroup, MixedName, ChartReadout, ChartTable, useChartPick, InputSlot, LongestCase, NumberField, RangeField, SegmentedControl, Swatch, nonNegativeCheck, percentCheck, yearsCheck } from "../kit";

export interface TimelineProps {
  bundle: Bundle;
  /** The run computed at build on P-05, so the graph is drawn before any script runs. */
  initial: TimelineData;
  wrapperName: string;
  /** The rule and figure that set the age a marker is drawn at (TXG-04 "age" for the 60+ rules). */
  ageMarker?: { ruleId: string; figure: string } | null;
  /** When the money becomes free (flows 6.5): the lock-up's years, or the age of an `at_age` exit (drawn once an age is entered). */
  lock?: { years: SiteValue | null; age: SiteValue | null } | null;
  /** The page has a part that changes with employment (the study fund's deposit tax); elsewhere the switch changed nothing. */
  employment?: boolean;
  /**
   * A cash-like page (guide-page sweep): the run rests on a rate, not on A-01, so the field reads "ריבית בשנה" and edits the rate the run
   * uses, kept on this device per page (the own-rates store, goal id "guide"). A rate the person enters applies to the whole balance (F-26, no ceiling).
   */
  cash?: { id: string; published: boolean; /** The run starts from the rate most of the collected banks publish (F-85): how many print it, out of how many (the current account). */ common?: { count: SiteValue; of: SiteValue } | null } | null;
  /**
   * The run is one amount put in today, with no monthly deposit (`lumpSumIds`): the monthly field, its chip and its words are left out,
   * a monthly deposit entered on another page does not reach this run, and `note` says where money paid in every month goes instead.
   */
  lumpSum?: { note: ReactNode } | null;
}

export function Timeline({ bundle: pageBundle, initial, wrapperName, ageMarker, lock, employment = false, cash = null, lumpSum = null }: TimelineProps) {
  const { state, ready, resetAll: resetInputs } = useInputs();
  const [ownRates, setOwnRate] = useOwnRates("guide");
  const ownRate = cash ? ownRates[cash.id] : undefined;
  // the published balance ceiling belongs to the published rate: a rate the person enters applies to the whole balance (F-26)
  const bundle = useMemo<Bundle>(() => {
    if (ownRate === undefined || pageBundle.terms.deposit?.balanceCeiling === undefined) return pageBundle;
    const { balanceCeiling: _ceiling, ...deposit } = pageBundle.terms.deposit;
    const { balanceCeiling: _value, ...feeValues } = pageBundle.feeValues;
    return { ...pageBundle, terms: { ...pageBundle.terms, deposit }, feeValues };
  }, [pageBundle, ownRate]);
  const runEntered = useMemo(() => {
    const entered = lumpSum ? { ...state.entered, ...lumpSumEntered } : state.entered;
    if (!cash) return entered;
    const { "A-01": _return, cash_rate: _rate, ...rest } = entered;
    return ownRate === undefined ? rest : { ...rest, cash_rate: ownRate };
  }, [cash, lumpSum, state.entered, ownRate]);
  const resetAll = () => {
    resetInputs();
    if (cash) setOwnRate(cash.id, undefined);
  };
  const enteredOf = (key: P05Input) => (key === "cash_rate" ? ownRate : state.entered[key]);
  const returnKey: P05Input = cash ? "cash_rate" : "A-01";
  const returnLabel = cash ? ci.cashRate : ci.grossReturn;
  const [mode, setMode] = useValueMode();
  const [hover, setHover] = useState<number | null>(null);
  const legendPick = useChartPick();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusField, setFocusField] = useState<P05Input | "all">("all");
  const headlineRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const today = bundle.runDate;

  const timeline = useMemo<TimelineData>(() => (ready ? runTimeline(bundle, { entered: runEntered, age: state.age }) : initial), [bundle, initial, ready, runEntered, state.age]);

  // ---- value objects for every figure on the card
  const inputValue = (key: P05Input): SiteValue => {
    // a field's value, its default or what the reader typed: a plain number wherever it shows; its reset is the field's
    const own = enteredOf(key);
    if (own === undefined) return asField({ ...p05Value(bundle.p05, key), about: labelOf(key) });
    return asField(enteredValue(own, p05Units[key], today, labelOf(key)));
  };
  const horizonYears = state.entered.horizon_years ?? p05Number(bundle.p05, "horizon_years");
  const returnEntered = cash ? ownRate !== undefined : timeline.kind === "ok" && timeline.enteredReturn;
  const rulesUsed = (t: TimelineResult) =>
    t.rules.map((r) => ({ id: r.id, strength: r.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, r.strength) }));
  const feeRule = (id: string, figure: string) => {
    const r = bundle.rules.find((x) => x.id === id);
    return r ? ruleFigure(r, figure, today) : null;
  };

  const values = useMemo(() => {
    if (timeline.kind !== "ok") return null;
    const inputs: Record<string, SiteValue> = {
      [ci.amountNow]: inputValue("amount_now"),
      ...(lumpSum ? {} : { [ci.monthly]: inputValue("monthly_deposit") }),
      [ci.years]: inputValue("horizon_years"),
      [returnLabel]: inputValue(returnKey),
      [ci.inflation]: inputValue("A-02"),
    };
    const feeInputs: Record<string, SiteValue> = {};
    // a provident list names its fees by their own labels below (in the discount period and after it), so they are not listed twice
    if (bundle.feeValues.balance && !bundle.feeValues.listBalance && !bundle.feeValues.discountBalance) feeInputs[ci.balanceFee] = bundle.feeValues.balance;
    if (bundle.feeValues.deposit && !bundle.feeValues.listDeposit && !bundle.feeValues.discountDeposit) feeInputs[ci.depositFee] = bundle.feeValues.deposit;
    for (const [key, label] of Object.entries(guideBlocks.terms.labels)) if (bundle.feeValues[key] && typeof bundle.feeValues[key]!.value === "number") feeInputs[feeLabel(termLabel(bundle, key, label), feeYear(bundle.feeValues[key]!))] = bundle.feeValues[key]!;
    const rules = rulesUsed(timeline);
    const taxRate = feeRule("TXK-07", "rate");
    const yearValues = (p: YearPoint, m: Mode) => {
      const div = m === "real" ? p.index : 1;
      const yearText = p.year === 0 ? copy.readout.today : `${copy.readout.year} ${p.year}`;
      // what was paid in: in nominal shekels each deposit rises with the inflation (A-04, F-05); in today's money each is deflated at its
      // own month (F-06), which gives back the deposit as entered, so that figure reads no inflation: F-106's sum in each year the run took
      // every deposit as entered, else (a ceiling took part of one, and the ceiling is in shekels of its year) the run's own sum, F-06,
      // which rests on the inflation too
      const paid: Record<string, SiteValue> = { [ci.amountNow]: inputs[ci.amountNow]!, ...(lumpSum ? {} : { [ci.monthly]: inputs[ci.monthly]! }), [ci.years]: enteredValue(p.year, "years", today) };
      const asEntered = paidInAsEntered(Number(paid[ci.amountNow]!.value), lumpSum ? 0 : Number(paid[ci.monthly]!.value), p.year);
      const whole = Math.abs(p.paidInReal - asEntered) < 0.5;
      const contributions = m === "real" ? computed(p.paidInReal, "nis", whole ? "F-106" : "F-06", whole ? paid : { ...paid, [ci.inflation]: inputs[ci.inflation]! }, { today, about: `${ci.about.contributions} ${p.year}` }) : computed(p.paidIn, "nis", "F-05", { ...paid, [ci.inflation]: inputs[ci.inflation]! }, { today, about: `${ci.about.contributions} ${p.year}` });
      // the fees by type over the years are a series of the run (F-67): a balance fee is a share of a balance the whole plan grows
      const fees = computed(m === "real" ? p.feesReal : p.fees, "nis", "F-67", { ...inputs, ...feeInputs }, { today, rules: rules.filter((r) => r.id.startsWith("PF-") || r.id.startsWith("KGL-1")), flags: timeline.flags.filter((f) => f === "G-14" || f === "PF-13"), about: `${ci.about.fees} ${p.year}` });
      const gross = computed(p.grossBalance / div, "nis", "F-08", { ...inputs, ...feeInputs }, { today, rules, about: `${ci.grossBalance}, ${copy.readout.year} ${p.year}` });
      const realGainInputs: Record<string, SiteValue> = { [ci.grossBalance]: gross, [ci.paidIn]: contributions };
      // the real gain by the record's own exit formula (F-44 the provident fund for investing, F-46 the study fund, F-50 child savings);
      // a security's is F-09's per-lot rule, which F-40 taxes
      const realGainFormula = bundle.record.tax_at_exit.formula === "F-40" ? "F-09" : bundle.record.tax_at_exit.formula;
      const realGain = p.detail.realGain !== undefined ? computed(p.detail.realGain / (m === "real" ? p.index : 1), "nis", realGainFormula, realGainInputs, { today, about: `${ci.about.realGain} ${p.year}` }) : null;
      const taxInputs: Record<string, SiteValue> = {};
      if (realGain) taxInputs[ci.realGain] = realGain;
      if (taxRate) taxInputs[ci.taxRate] = taxRate;
      // a cash-like page taxes the interest as it is paid (F-21, F-24, F-26): the tax rests on the amount, the deposits, the years and the
      // rate, and on the inflation only for a CPI-linked deposit, whose real interest is taxed
      if (cash && Object.keys(taxInputs).length === 0) {
        Object.assign(taxInputs, { [ci.amountNow]: inputs[ci.amountNow]!, ...(lumpSum ? {} : { [ci.monthly]: inputs[ci.monthly]! }), [ci.years]: inputs[ci.years]!, [returnLabel]: inputs[returnLabel]! });
        if (bundle.terms.deposit?.linkage === "cpi") taxInputs[ci.inflation] = inputs[ci.inflation]!;
      }
      const tax = computed(m === "real" ? p.taxReal : p.taxDuring + p.taxAtExit, "nis", bundle.record.tax_at_exit.formula, taxInputs, { today, rules: rules.filter((r) => r.id.startsWith("TX")), flags: timeline.flags.filter((f) => f !== "G-14" && f !== "PF-13"), about: `${ci.about.tax} ${p.year}` });
      const net = computed(m === "real" ? p.real : p.nominal, "nis", "F-67", { ...inputs, [ci.fees]: fees, [ci.taxAtExit]: tax }, { today, rules, flags: timeline.flags, about: p.year === horizonYears ? ci.about.headline : `${ci.about.net} ${p.year}` });
      return { yearText, contributions, fees, tax, net };
    };
    return { inputs, yearValues };
  }, [timeline, state.entered, ownRate, mode, bundle, today, horizonYears, lumpSum]);

  const points = useMemo<ChartPoint[]>(() => {
    if (timeline.kind !== "ok") return [];
    const amountNow = state.entered.amount_now ?? p05Number(bundle.p05, "amount_now");
    return [{ year: 0, net: amountNow, tax: 0, fees: 0, contributions: amountNow }, ...timeline.years.map((p) => ({ year: p.year, net: (mode === "real" ? p.real : p.nominal), tax: mode === "real" ? p.taxReal : p.taxDuring + p.taxAtExit, fees: mode === "real" ? p.feesReal : p.fees, contributions: mode === "real" ? p.paidInReal : p.paidIn }))];
  }, [timeline, mode, state.entered.amount_now, bundle.p05]);

  // a part the run does not have (no fee on a current account, no tax when nothing is earned) is not drawn, listed
  // or named in the sentence; it comes back when an input makes it real (a rate entered on the current account brings the tax)
  const hasFees = points.some((p) => p.fees > 0.005);
  const hasTax = points.some((p) => p.tax > 0.005);
  // the table keeps a column it has shown, so a slider at zero does not take the column away and move the others (design-system 2.5a)
  const tableFees = useRef(false);
  const tableTax = useRef(false);
  tableFees.current ||= hasFees;
  tableTax.current ||= hasTax;
  const afterWhat = hasFees && hasTax ? copy.headline.afterBoth : hasTax ? copy.headline.afterTax : hasFees ? copy.headline.afterFees : null;
  const modeWords = mode === "real" ? copy.headline.real : copy.headline.nominal;
  const tail = afterWhat ? `${afterWhat}, ${modeWords}` : modeWords;

  const readoutYear = hover ?? horizonYears;
  const readoutPoint = timeline.kind === "ok" ? (readoutYear === 0 ? null : timeline.years.find((p) => p.year === readoutYear) ?? timeline.years[timeline.years.length - 1]!) : null;
  const readout = values && readoutPoint ? values.yearValues(readoutPoint, mode) : null;
  const headline = values && timeline.kind === "ok" ? values.yearValues(timeline.years[timeline.years.length - 1]!, mode).net : null;

  // an unlinked deposit's interest is taxed at its 15% at any age: TXG-04's brackets from 60 reach only a maximum rate (TXG-04, TXI-03),
  // and a CPI-linked deposit's 25% is one (the ledger's F-42 path); so the age changes no figure there, and neither its field nor its marker shows
  const ageReachesRun = !(bundle.terms.deposit && bundle.terms.deposit.linkage !== "cpi") || !!lock?.age;
  const markers: Marker[] = [];
  if (ageMarker && ageReachesRun && state.age !== null && timeline.kind === "ok") {
    const fig = feeRule(ageMarker.ruleId, ageMarker.figure);
    if (fig && typeof fig.value === "number") {
      const year = fig.value - state.age;
      if (year > 0 && year <= timeline.horizon) markers.push({ year, label: <>{copy.markers.age} <Num value={fig} /></> });
    }
  }

  if (lock && timeline.kind === "ok") {
    let year: number | null = null;
    if (lock.years && typeof lock.years.value === "number") year = lock.years.value;
    else if (lock.age && typeof lock.age.value === "number" && state.age !== null) year = lock.age.value - state.age;
    if (year !== null && year > 0 && year <= timeline.horizon && !markers.some((m) => m.year === year && m.label === copy.markers.free)) markers.push({ year, label: copy.markers.free });
  }

  const openSheet = (field: P05Input | "all") => {
    setFocusField(field);
    headlineRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setSheetOpen(true);
  };
  // a number the reader sets, in the example sentence: plain, at its own width; the fields beside the graph (on a phone, the chips under
  // it) are where it changes
  const slot = (_field: P05Input, value: ReactNode) => <InputSlot>{value}</InputSlot>;
  // a monthly deposit entered on another page is not part of a lump-sum run, so it alone does not bring the reset button
  const anyEntered = Object.keys(state.entered).some((k) => !(lumpSum && k === "monthly_deposit")) || ownRate !== undefined;
  const horizonValue = inputValue("horizon_years");
  // the age changes a run only through a rule that turns on it (the tax at 60, TXG-04; a lock-up to an age): with no tax and no such
  // lock it changes nothing, so the field is left out unless an age is already entered
  const ageMatters = ageReachesRun && (hasTax || !!lock?.age || state.age !== null);
  const panel = <ValuesPanel bundle={bundle} focusField={focusField} employment={employment} showAge={ageMatters} cash={cash} lumpSum={!!lumpSum} ownRate={ownRate} setOwnRate={(n) => cash && setOwnRate(cash.id, n ?? undefined)} />;

  const tableCard =
    timeline.kind === "ok" && values ? (
      <Card pad="none" className="px-4 py-2 md:px-6">
        <ChartTable
          compact
          regionLabel={copy.graphTitle}
          rowHead={copy.table.year}
          columns={[
            { id: "contributions", head: copy.table.contributions },
            ...(tableFees.current ? [{ id: "fees", head: copy.table.fees }] : []),
            ...(tableTax.current ? [{ id: "tax", head: copy.table.tax }] : []),
            { id: "net", head: copy.table.net },
          ]}
          rows={timeline.years.map((p) => {
            const v = values!.yearValues(p, mode);
            return {
              key: p.year,
              head: p.year,
              cells: [<Num key="c" value={v.contributions} size="cell" />, ...(tableFees.current ? [<Num key="f" value={v.fees} size="cell" />] : []), ...(tableTax.current ? [<Num key="t" value={v.tax} size="cell" />] : []), <Num key="n" value={v.net} size="cell" />],
            };
          })}
        />
      </Card>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
    <div className="flex flex-col lg:flex-row-reverse lg:items-start gap-6">
      <Card className="flex-1 min-w-0 flex flex-col gap-4" aria-labelledby={titleId}>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2.5 min-w-0">
            <h3 id={titleId} className="text-lg font-semibold">
              {copy.graphTitle}
            </h3>
            <span className="text-sm text-muted-foreground max-w-measure">
              {/* it says it is an example and names the inputs, so it does not read as a promise */}
              {values ? (
                <>
                  {/* each number the reader sets is a fixed-width blank, so the line does not jump as it changes */}
                  {copy.headlineExample.lead} {slot("amount_now", <Num value={values.inputs[ci.amountNow]!} />)}
                  {lumpSum ? (
                    <>, {cash ? copy.headlineExample.lumpCash : copy.headlineExample.lump}</>
                  ) : (
                    <>
                      {" "}
                      {copy.headlineExample.plus} {slot("monthly_deposit", <Num value={values.inputs[ci.monthly]!} />)} {cash ? copy.headlineExample.perMonthCash : copy.headlineExample.perMonth}
                    </>
                  )}{" "}
                  {slot(returnKey, <Num value={values.inputs[returnLabel]!} />)} {copy.headlineExample.perYear} {slot("horizon_years", <Num value={horizonValue} display={fmt.years(horizonYears)} />)}, {tail}
                </>
              ) : (
                <>
                  {copy.headline.before} {slot("horizon_years", <Num value={horizonValue} display={fmt.years(horizonYears)} />)}, {tail}
                </>
              )}
            </span>
            {lumpSum?.note ? <span className="text-sm text-muted-foreground max-w-measure">{lumpSum.note}</span> : null}
            <div className="flex items-center gap-3 flex-wrap">
              {headline ? (
                <span className="figure" ref={headlineRef} style={{ scrollMarginTop: "124px" }}>
                  <Num value={headline} size="figure" animate />
                </span>
              ) : timeline.kind === "ok" ? (
                <span className="figure text-muted-foreground">{system.loading}</span>
              ) : null}
              {headline && <StateTag state="computed" />}
            </div>
          </div>
          <SegmentedControl label={copy.modeLabel} options={[{ value: "real", label: copy.modes.real }, { value: "nominal", label: copy.modes.nominal }]} value={mode} onChange={setMode} className="lg:w-auto lg:min-w-[260px] max-w-full" />
        </div>

        {/* a figure in future shekels read as ignoring inflation; each mode names the other's figure and why deposits exceed what was typed */}
        {values && timeline.kind === "ok" ? (
          <p className="text-sm text-muted-foreground max-w-measure min-h-[6rem] lg:min-h-[3lh]">
            {copy.modeNote[mode].before} <Num value={values.yearValues(timeline.years[timeline.years.length - 1]!, mode === "real" ? "nominal" : "real").net} /> {copy.modeNote[mode].after}
            {!lumpSum && (state.entered.monthly_deposit ?? p05Number(bundle.p05, "monthly_deposit")) > 0 ? ` ${copy.modeNote.deposits}` : ""}
          </p>
        ) : null}

        {timeline.kind === "ok" ? (
          <>
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto flex gap-2 pb-1 scrollbar-none">
              {(["amount_now", ...(lumpSum ? [] : ["monthly_deposit"]), "horizon_years", returnKey, "A-02"] as P05Input[]).map((key) => {
                const own = enteredOf(key);
                const n = own ?? p05Number(bundle.p05, key);
                const text = key === "horizon_years" ? fmt.years(n) : key.startsWith("A-") || key === "cash_rate" ? fmt.pct(n) : nisShown(n, own !== undefined ? "entered" : undefined, own === undefined);
                return (
                  // what the reader typed looks the same as the default
                  <button key={key} type="button" onClick={() => openSheet(key)} className="a-chip">
                    <span className="text-muted-foreground">{(copy.chips as Record<string, string>)[key]}</span>
                    <bdi dir="ltr" className="font-medium">{text}</bdi>
                  </button>
                );
              })}
              <button type="button" onClick={() => openSheet("all")} className="a-chip">
                {copy.chips.all}
              </button>
            </div>

            <ChartLegend
              pick={legendPick}
              items={[
                { id: "net", swatch: <Swatch shape="box" className="bg-chart-value" />, label: copy.legend.net },
                // no swatch for an area that is not drawn (no tax in this run)
                ...(hasTax ? [{ id: "tax", swatch: <Swatch shape="box" className="bg-chart-tax" />, label: copy.legend.tax }] : []),
                ...(hasFees ? [{ id: "fees", swatch: <Swatch shape="box" className="bg-chart-fee" />, label: copy.legend.fees }] : []),
                { id: "contributions", swatch: <Swatch className="bg-chart-contributions" />, label: copy.legend.contributions },
              ]}
            />

            <TimelineChart points={points} hover={hover} onHover={setHover} highlight={legendPick.active} markers={markers} enteredReturn={returnEntered} ariaLabel={`${copy.graphAria.before} ${fmt.years(horizonYears)}. ${copy.graphAria.after}`} />
            {returnEntered && <p className="text-xs text-entered">{cash ? copy.enteredRateCaption : copy.enteredReturnCaption}</p>}

            {readout && (
              <ChartReadout
                title={readout.yearText}
                rows={[
                  { id: "net", label: copy.legend.net, value: <Num value={readout.net} animate /> },
                  ...(hasTax ? [{ id: "tax", label: copy.legend.tax, value: <Num value={readout.tax} animate /> }] : []),
                  ...(hasFees ? [{ id: "fees", label: copy.legend.fees, value: <Num value={readout.fees} animate /> }] : []),
                  { id: "contributions", label: copy.legend.contributions, value: <Num value={readout.contributions} animate /> },
                ]}
              />
            )}

            <RulesLine ids={timeline.rules.map((r) => r.id)} />
          </>
        ) : timeline.kind === "blocked" ? (
          <Callout tone="blocked">
            {copy.blockedBand} <RuleRef id={timeline.ruleId} />
          </Callout>
        ) : timeline.kind === "figure-not-updated" ? (
          <Callout tone="caution">
            {copy.figureNotUpdated.before} <RuleRef id={timeline.ruleId} /> ({timeline.figure}). {copy.figureNotUpdated.after}
          </Callout>
        ) : (
          <div className="flex flex-col gap-1">
            <Callout tone="caution">{(timeline as { messageHe?: string }).messageHe || system.calcFailed}</Callout>
            <Button variant="quiet" className="self-start -ms-2 text-sm" onClick={resetAll}>
              <IconReset size={16} /> {buttons.resetEntered}
            </Button>
          </div>
        )}
      </Card>

      <Card as="aside" pad="aside" className="hidden lg:block w-[300px] shrink-0" aria-label={valuesCopy.title}>
        <h3 className="text-lg font-semibold mb-4">{valuesCopy.title}</h3>
        {panel}
        <TermsList bundle={bundle} />
        {/* its room stays until something is entered: the panel is taller than the graph beside it, so a new button moved the page below */}
        <LongestCase cases={[<ResetAll key="reset" onReset={resetAll} />]}>{anyEntered && <ResetAll onReset={resetAll} />}</LongestCase>
      </Card>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} pc="center" height={78} labelledBy={`${titleId}-v`} className="lg:hidden">
        <h2 id={`${titleId}-v`} className="text-lg font-semibold mb-3">
          {valuesCopy.title}
        </h2>
        {sheetOpen && panel}
        {sheetOpen && <TermsList bundle={bundle} />}
        {anyEntered && <ResetAll onReset={resetAll} />}
      </Sheet>
    </div>
    {tableCard}
    </div>
  );
}

function ResetAll({ onReset }: { onReset: () => void }) {
  return (
    <Button variant="quiet" className="mt-3 -ms-2 text-sm" onClick={onReset}>
      <IconReset size={16} /> {buttons.resetAll}
    </Button>
  );
}

/** A product-term row's label: a deposit's term is "תקופת הפיקדון", since "תקופה" on the same card is the years the chart runs. */
function termLabel(bundle: Bundle, key: string, label: string): string {
  return key === "term" && bundle.terms.deposit ? guideBlocks.terms.depositTerm : label;
}

function labelOf(key: P05Input): string {
  return (valuesCopy.fields as Record<string, string>)[key] ?? key;
}

/** The product terms the run read (flows 6.5): each a provenance number, in the order of the label table; not editable. */
function TermsList({ bundle }: { bundle: Bundle }) {
  const tiedCopy = guideBlocks.terms.pick.tied;
  const managerTied = guideBlocks.terms.pick.managerTied;
  const rows = Object.entries(guideBlocks.terms.labels).filter(([key]) => bundle.feeValues[key]);
  const employment = bundle.feeValues.employment;
  if (rows.length === 0 && !employment) return null;
  const show = (key: string, v: SiteValue) => {
    if (key === "linkage") return guideBlocks.terms.linkage[String(v.value)] ?? undefined;
    if (v.unit === "months" && typeof v.value === "number") return fmt.months(v.value);
    // "שנתיים", never "2 שנים" (copy.md 1): the figure carries its own word, so no unit word follows it
    if (v.unit === "years" && typeof v.value === "number") return fmt.years(v.value);
    return undefined;
  };
  // D31: the company whose terms the example runs on is named here, so its figures are its own
  const owners = [...new Set(Object.values(bundle.feeValues).map((v) => v.own).filter((n): n is string => !!n))];
  // years and months print their own word through fmt ("12 חודשים"), so no unit word follows them
  const unitWord = (v: SiteValue) => (v.unit === "years" || v.unit === "months" ? "" : ((provCopy.unit as Record<string, string>)[v.unit] ?? ""));
  // folded: open, the provident fund's terms made the PC aside about 1,770 px beside a 970 px chart card,
  // and the page about 1,000 px longer; a block that replaces nothing starts folded (former ground rule 1)
  return (
    <FoldGroup title={guideBlocks.terms.title} level={4} className="border-t border-border pt-2 mt-1">
      <div className="flex flex-col gap-2 pb-1">
        <p className="text-xs text-muted-foreground">{guideBlocks.terms.line}</p>
        {owners.length > 0 && (
          <p className="text-sm">
            {bundle.pick?.kind === "manager" ? guideBlocks.terms.whoseManager : bundle.terms.deposit && !bundle.terms.tariff ? guideBlocks.terms.whoseDeposit : guideBlocks.terms.whose} <bdi className="font-medium">{owners.join(" · ")}</bdi>.
          </p>
        )}
        {bundle.pick && (
          <p className="text-sm">
            {bundle.pick.tied && bundle.pick.kind === "manager" ? (
              <>
                {managerTied.before} <Num value={bundle.pick.count} /> {managerTied.middle}{" "}
                {bundle.pick.tied.names.map((name, i) => (
                  <span key={name}>
                    {i > 0 && <> {managerTied.and}</>}
                    <MixedName>{name}</MixedName>{" "}
                  </span>
                ))}
                {managerTied.after} <MixedName>{bundle.pick.tied.names[0]!}</MixedName>. {managerTied.end}
              </>
            ) : bundle.pick.tied ? (
              <>
                {tiedCopy.before} <Num value={bundle.pick.count} /> {tiedCopy.middle}{" "}
                {bundle.pick.tied.names.map((name, i) => (
                  <span key={name}>
                    {i > 0 && <> {tiedCopy.and}</>}
                    <MixedName>{name}</MixedName>{" "}
                  </span>
                ))}
                {/* a manager tie has no threshold figure: the comma goes with the figure, so no ", ," is left */}
                {tiedCopy.tie}
                {bundle.pick.tied.theta && (
                  <>
                    , <Num value={bundle.pick.tied.theta} />
                  </>
                )}
                , {tiedCopy.after} <MixedName>{bundle.pick.tied.names[0]!}</MixedName>. {tiedCopy.end}
              </>
            ) : (
              <>
                {guideBlocks.terms.pick[bundle.pick.kind].before} <Num value={bundle.pick.count} /> {guideBlocks.terms.pick[bundle.pick.kind].after}
              </>
            )}
          </p>
        )}
        {/* D83: the discount's period is the regulator's minimum or the company's own longer one, and it can end earlier (PF-14) */}
        {(bundle.feeValues.discountYears || bundle.feeValues.discountMonths) && (
          <p className="text-sm">{bundle.feeValues.discountMonths ? guideBlocks.terms.pick.discountOwn : guideBlocks.terms.pick.discount}</p>
        )}
        <dl className="readout">
          {rows.map(([key, label]) => {
            const v = bundle.feeValues[key]!;
            return (
              <div key={key} className="readout-row">
                <dt>{feeLabel(termLabel(bundle, key, label), feeYear(v))}</dt>
                <dd>
                  <Num value={v} display={show(key, v)} /> {unitWord(v)}
                </dd>
              </div>
            );
          })}
          {employment && (
            <div className="readout-row">
              <dt>{valuesCopy.fields.employment}</dt>
              <dd>
                <Num value={employment} display={(valuesCopy.employment as Record<string, string>)[String(employment.value)]} />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </FoldGroup>
  );
}

/** The fields, in the order of design-spec 4; used both in the phone sheet and the PC panel. */
function ValuesPanel({ bundle, focusField, employment, showAge, cash, lumpSum, ownRate, setOwnRate }: { bundle: Bundle; focusField: P05Input | "all"; employment: boolean; showAge: boolean; cash: TimelineProps["cash"]; lumpSum: boolean; ownRate: number | undefined; setOwnRate: (n: number | null) => void }) {
  const { state, ready, setEntered, setAge, setEmployment } = useInputs();
  const p05 = bundle.p05;
  const monthly = p05Range(p05, "sliders", "monthly_deposit");
  const years = p05Range(p05, "sliders", "horizon_years");
  const ageRange = p05Range(p05, "ranges", "age");
  const pctRange = p05Range(p05, "ranges", "pct");
  const current = (key: P05Input) => (key === "cash_rate" ? ownRate : state.entered[key]) ?? p05Number(p05, key);
  const isEntered = (key: P05Input) => (key === "cash_rate" ? ownRate !== undefined : state.entered[key] !== undefined);
  const cashBase = p05Value(p05, "cash_rate");
  const commit = (key: P05Input) => (n: number) => setEntered(key, n === p05Number(p05, key) ? null : n);
  // the kit's checks have none for an age: a whole number, then the range in the years' sentence with the age's words
  const ageCheck = (n: number) => {
    if (!Number.isInteger(n)) return valuesCopy.errors.nan;
    if (ageRange && (n < ageRange.min || n > ageRange.max)) return `${valuesCopy.errors.age[0]} ${fmt.number(ageRange.min)} ${valuesCopy.errors.age[1]}${fmt.number(ageRange.max)}.`;
    return null;
  };
  const pctCheck = percentCheck(pctRange ?? undefined);
  const publishedFrom = cashBase.update_rule === "founder" ? null : cashBase.effective_from;
  const common = cash?.common;
  const hints = cash ? (
    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground -mt-2">
      {common ? (
        <span>
          {valuesCopy.hints.cashCommon.before} <Num value={cashBase} />, <Num value={common.count} prefix={valuesCopy.hints.cashCommon.prefix} /> {valuesCopy.hints.cashCommon.of} <Num value={common.of} /> {valuesCopy.hints.cashCommon.after}
        </span>
      ) : (
        <span>{publishedFrom ? `${valuesCopy.hints.cashPublished} ${valuesCopy.hints.asOf}${fmt.date(publishedFrom)}.` : valuesCopy.hints.cashAssumption}</span>
      )}
      <span>{valuesCopy.returnNoteCash}</span>
      <span>{valuesCopy.hints.inflation}</span>
    </div>
  ) : (
    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground -mt-2">
      <span>{valuesCopy.hints.return}</span>
      <span>{valuesCopy.returnNote}</span>
      <span>{valuesCopy.hints.inflation}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-4 lg:gap-[18px]">
      <div data-field="amount_now" className="contents">
        <NumberField label={valuesCopy.fields.amount_now} unit="nis" value={current("amount_now")} start={p05Number(p05, "amount_now")} isEntered={isEntered("amount_now")} validate={nonNegativeCheck} onCommit={commit("amount_now")} onReset={() => setEntered("amount_now", null)} disabled={!ready} autoFocus={focusField === "amount_now"} />
      </div>
      {!lumpSum && (
      <div data-field="monthly_deposit" className="contents">
        <RangeField label={valuesCopy.fields.monthly_deposit} unit="nis_per_month" value={current("monthly_deposit")} start={p05Number(p05, "monthly_deposit")} isEntered={isEntered("monthly_deposit")} validate={nonNegativeCheck} onCommit={commit("monthly_deposit")} onReset={() => setEntered("monthly_deposit", null)} min={monthly?.min ?? 0} max={monthly?.max ?? 10000} step={monthly?.step ?? 100} disabled={!ready} autoFocus={focusField === "monthly_deposit"} />
      </div>
      )}
      <div data-field="horizon_years" className="contents">
        <RangeField label={valuesCopy.fields.horizon_years} unit="years" value={current("horizon_years")} start={p05Number(p05, "horizon_years")} isEntered={isEntered("horizon_years")} validate={yearsCheck(years ?? { min: 1, max: 40 })} onCommit={commit("horizon_years")} onReset={() => setEntered("horizon_years", null)} min={years?.min ?? 1} max={years?.max ?? 40} step={years?.step ?? 1} inputMode="numeric" disabled={!ready} autoFocus={focusField === "horizon_years"} />
      </div>
      <div className="field-row grid grid-cols-2 gap-3">
        {cash ? (
          <div data-field="cash_rate" className="contents"><NumberField label={valuesCopy.fields.cash_rate} unit="pct_per_year" value={current("cash_rate")} start={p05Number(p05, "cash_rate")} isEntered={isEntered("cash_rate")} validate={pctCheck} onCommit={(n) => setOwnRate(n === p05Number(p05, "cash_rate") ? null : n)} onReset={() => setOwnRate(null)} disabled={!ready} autoFocus={focusField === "cash_rate"} /></div>
        ) : (
          <div data-field="A-01" className="contents"><NumberField label={valuesCopy.fields["A-01"]} unit="pct_per_year" value={current("A-01")} start={p05Number(p05, "A-01")} isEntered={isEntered("A-01")} validate={pctCheck} onCommit={commit("A-01")} onReset={() => setEntered("A-01", null)} disabled={!ready} autoFocus={focusField === "A-01"} /></div>
        )}
        <NumberField label={valuesCopy.fields["A-02"]} unit="pct_per_year" value={current("A-02")} start={p05Number(p05, "A-02")} isEntered={isEntered("A-02")} validate={pctCheck} onCommit={commit("A-02")} onReset={() => setEntered("A-02", null)} disabled={!ready} autoFocus={focusField === "A-02"} />
      </div>
      {hints}
      {employment && (
      <div className="field">
        <span className="field-label" id="emp-label">
          {valuesCopy.fields.employment} <span className="text-muted-foreground font-normal">{valuesCopy.optional}</span>
        </span>
        <SegmentedControl<Employment> labelledBy="emp-label" options={[{ value: "employee", label: valuesCopy.employment.employee }, { value: "self-employed", label: valuesCopy.employment["self-employed"] }]} value={state.employment} onChange={(v) => setEmployment(state.employment === v ? null : v)} />
        <span className="text-xs text-muted-foreground">{valuesCopy.hints.employment}</span>
      </div>
      )}
      {showAge && <NumberField label={<>{valuesCopy.fields.age} <span className="text-muted-foreground font-normal">{valuesCopy.optional}</span></>} unit="years" value={state.age} isEntered={state.age !== null} validate={ageCheck} onCommit={(n) => setAge(n)} onReset={() => setAge(null)} hint={valuesCopy.hints.age} placeholder={valuesCopy.agePlaceholder} inputMode="numeric" optional disabled={!ready} />}
    </div>
  );
}
