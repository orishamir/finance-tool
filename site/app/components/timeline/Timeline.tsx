// The graph card of a guide page (design-spec 2, "מה זה"): headline, real/nominal switch, legend, chart,
// assumption chips (phone), readout, table, rules used; the values sheet (phone) or panel (PC) beside it.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { P05Input } from "@finance-tool/engine";
import { buttons, computedInputs as ci, guide as copy, guideBlocks, provenance as provCopy, system, values as valuesCopy } from "../../copy";
import { p05Number, p05Range, p05Value, p05Units, runTimeline, type Bundle, type Timeline as TimelineData, type TimelineResult, type YearPoint } from "../../lib/engine";
import { fmt } from "../../lib/format";
import { useInputs, type Employment } from "../../lib/inputs";
import { useOwnRates } from "../../lib/own-rate";
import { useValueMode, type ValueMode as Mode } from "../../lib/mode-store";
import { computed, entered as enteredValue, feeLabel, feeYear, ruleFigure, weaker, type SiteValue, type Strength } from "../../lib/value";
import { scrollCueStyle, TimelineChart, type ChartPoint, type Marker } from "../chart/TimelineChart";
import { IconPencil, IconReset } from "../icons";
import { Num, RuleRef, RulesLine, StateTag } from "../provenance";
import { Sheet } from "../Sheet";
import { Button, Callout, cx, Disclosure, SegmentedControl } from "../ui";
import { NumberField, ParameterLine, SliderField } from "./fields";

export interface TimelineProps {
  bundle: Bundle;
  /** The run computed at build on P-05, so the graph is drawn before any script runs. */
  initial: TimelineData;
  wrapperName: string;
  /** The rule and figure that set the age a marker is drawn at (TXG-04 "age" for the 60+ rules). */
  ageMarker?: { ruleId: string; figure: string } | null;
  /** When the money becomes free (flows 6.5): the lock-up's years, or the age of an `at_age` exit (drawn once an age is entered). */
  lock?: { years: SiteValue | null; age: SiteValue | null } | null;
  /** The page has a part that changes with employment (the study fund's deposit tax); elsewhere the switch changed nothing (2026-10-25). */
  employment?: boolean;
  /**
   * A cash-like page (2026-10-25, guide-page sweep): the run rests on a rate, not on A-01, so the field reads "ריבית בשנה" and edits the rate the run
   * uses, kept on this device per page (the own-rates store, goal id "guide"). A rate the person enters applies to the whole balance (F-26, no ceiling).
   * `feesIndependent`: the account's fees do not depend on the balance, so the fee row says that instead of printing 0.
   */
  cash?: { id: string; published: boolean; feesIndependent?: boolean } | null;
}

export function Timeline({ bundle: pageBundle, initial, wrapperName, ageMarker, lock, employment = false, cash = null }: TimelineProps) {
  const { state, ready, setEntered, setAge, setEmployment, resetAll: resetInputs } = useInputs();
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
    if (!cash) return state.entered;
    const { "A-01": _return, cash_rate: _rate, ...rest } = state.entered;
    return ownRate === undefined ? rest : { ...rest, cash_rate: ownRate };
  }, [cash, state.entered, ownRate]);
  const resetAll = () => {
    resetInputs();
    if (cash) setOwnRate(cash.id, undefined);
  };
  const enteredOf = (key: P05Input) => (key === "cash_rate" ? ownRate : state.entered[key]);
  const returnKey: P05Input = cash ? "cash_rate" : "A-01";
  const returnLabel = cash ? ci.cashRate : ci.grossReturn;
  const [mode, setMode] = useValueMode();
  const [hover, setHover] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusField, setFocusField] = useState<P05Input | "all">("all");
  const headlineRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();
  const today = bundle.runDate;

  const timeline = useMemo<TimelineData>(() => (ready ? runTimeline(bundle, { entered: runEntered, age: state.age }) : initial), [bundle, initial, ready, runEntered, state.age]);

  // ---- value objects for every figure on the card
  const inputValue = (key: P05Input): SiteValue => {
    const base = p05Value(bundle.p05, key);
    const own = enteredOf(key);
    if (own === undefined) return { ...base, about: labelOf(key) };
    // the cash rate is kept in the own-rates store; its reset is the field's, not the sheet's
    return { ...enteredValue(own, p05Units[key], today, labelOf(key)), replaces: base, ...(key === "cash_rate" ? {} : { resetKey: key }) };
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
      [ci.monthly]: inputValue("monthly_deposit"),
      [ci.years]: inputValue("horizon_years"),
      [returnLabel]: inputValue(returnKey),
      [ci.inflation]: inputValue("A-02"),
    };
    const feeInputs: Record<string, SiteValue> = {};
    if (bundle.feeValues.balance) feeInputs[ci.balanceFee] = bundle.feeValues.balance;
    if (bundle.feeValues.deposit) feeInputs[ci.depositFee] = bundle.feeValues.deposit;
    for (const [key, label] of Object.entries(guideBlocks.terms.labels)) if (bundle.feeValues[key] && typeof bundle.feeValues[key]!.value === "number") feeInputs[feeLabel(label, feeYear(bundle.feeValues[key]!))] = bundle.feeValues[key]!;
    const rules = rulesUsed(timeline);
    const taxRate = feeRule("TXK-07", "rate");
    const yearValues = (p: YearPoint, m: Mode) => {
      const div = m === "real" ? p.index : 1;
      const yearText = p.year === 0 ? copy.readout.today : `${copy.readout.year} ${p.year}`;
      const contributions = computed(m === "real" ? p.paidInReal : p.paidIn, "nis", "F-05", { [ci.amountNow]: inputs[ci.amountNow]!, [ci.monthly]: inputs[ci.monthly]!, [ci.inflation]: inputs[ci.inflation]! }, { today, about: `${ci.about.contributions} ${p.year}` });
      const fees = computed(p.fees / div, "nis", "F-15", { ...feeInputs, [returnLabel]: inputs[returnLabel]!, [ci.years]: inputs[ci.years]! }, { today, rules: rules.filter((r) => r.id.startsWith("PF-") || r.id.startsWith("KGL-1")), flags: timeline.flags.filter((f) => f === "G-14" || f === "PF-13"), about: `${ci.about.fees} ${p.year}` });
      const gross = computed(p.grossBalance / div, "nis", "F-08", { ...inputs, ...feeInputs }, { today, rules, about: `${ci.grossBalance}, ${copy.readout.year} ${p.year}` });
      const realGainInputs: Record<string, SiteValue> = { [ci.grossBalance]: gross, [ci.paidIn]: contributions };
      const realGain = p.detail.realGain !== undefined ? computed(p.detail.realGain / (m === "real" ? p.index : 1), "nis", "F-44", realGainInputs, { today, about: `${ci.about.realGain} ${p.year}` }) : null;
      const taxInputs: Record<string, SiteValue> = {};
      if (realGain) taxInputs[ci.realGain] = realGain;
      if (taxRate) taxInputs[ci.taxRate] = taxRate;
      const tax = computed((p.taxDuring + p.taxAtExit) / div, "nis", bundle.record.tax_at_exit.formula, taxInputs, { today, rules: rules.filter((r) => r.id.startsWith("TX")), flags: timeline.flags.filter((f) => f !== "G-14" && f !== "PF-13"), about: `${ci.about.tax} ${p.year}` });
      const net = computed(m === "real" ? p.real : p.nominal, "nis", "F-67", { ...inputs, [ci.fees]: fees, [ci.taxAtExit]: tax }, { today, rules, flags: timeline.flags, about: p.year === horizonYears ? ci.about.headline : `${ci.about.net} ${p.year}` });
      return { yearText, contributions, fees, tax, net };
    };
    return { inputs, yearValues };
  }, [timeline, state.entered, ownRate, mode, bundle, today, horizonYears]);

  const points = useMemo<ChartPoint[]>(() => {
    if (timeline.kind !== "ok") return [];
    const amountNow = state.entered.amount_now ?? p05Number(bundle.p05, "amount_now");
    const div = (p: YearPoint) => (mode === "real" ? p.index : 1);
    return [{ year: 0, net: amountNow, tax: 0, fees: 0, contributions: amountNow }, ...timeline.years.map((p) => ({ year: p.year, net: (mode === "real" ? p.real : p.nominal), tax: (p.taxDuring + p.taxAtExit) / div(p), fees: p.fees / div(p), contributions: mode === "real" ? p.paidInReal : p.paidIn }))];
  }, [timeline, mode, state.entered.amount_now, bundle.p05]);

  const readoutYear = hover ?? horizonYears;
  const readoutPoint = timeline.kind === "ok" ? (readoutYear === 0 ? null : timeline.years.find((p) => p.year === readoutYear) ?? timeline.years[timeline.years.length - 1]!) : null;
  const readout = values && readoutPoint ? values.yearValues(readoutPoint, mode) : null;
  const headline = values && timeline.kind === "ok" ? values.yearValues(timeline.years[timeline.years.length - 1]!, mode).net : null;

  const markers: Marker[] = [];
  if (ageMarker && state.age !== null && timeline.kind === "ok") {
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
  const anyEntered = Object.keys(state.entered).length > 0 || ownRate !== undefined;
  const horizonValue = inputValue("horizon_years");
  const panel = <ValuesPanel bundle={bundle} focusField={focusField} employment={employment} cash={cash} ownRate={ownRate} setOwnRate={(n) => cash && setOwnRate(cash.id, n ?? undefined)} />;

  const tableCard =
    timeline.kind === "ok" && values ? (
      <div className="bg-card border border-border rounded-lg px-4 py-2 md:px-6">
      <Disclosure label={buttons.showTable} openLabel={buttons.hideTable} summaryClassName="text-sm">
        <div className="overflow-x-auto mt-2" style={scrollCueStyle} tabIndex={0} role="region" aria-label={copy.graphTitle}>
          <table className="tbl text-sm [&_td]:px-2 [&_th]:px-2 [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead>
              <tr>
                <th scope="col">{copy.table.year}</th>
                <th scope="col">{copy.table.contributions}</th>
                <th scope="col">{copy.table.fees}</th>
                <th scope="col">{copy.table.tax}</th>
                <th scope="col">{copy.table.net}</th>
              </tr>
            </thead>
            <tbody>
              {timeline.years.map((p) => {
                const v = values!.yearValues(p, mode);
                return (
                  <tr key={p.year}>
                    <th scope="row"><bdi dir="ltr">{p.year}</bdi></th>
                    <td><Num value={v.contributions} size="cell" /></td>
                    <td>{cash?.feesIndependent ? <span className="text-sm">{copy.feesIndependentShort}</span> : <Num value={v.fees} size="cell" />}</td>
                    <td><Num value={v.tax} size="cell" /></td>
                    <td><Num value={v.net} size="cell" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Disclosure>
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
    <div className="flex flex-col lg:flex-row-reverse lg:items-start gap-6">
      <div className="flex-1 min-w-0 bg-card border border-border rounded-lg p-4 md:p-6 flex flex-col gap-4" aria-labelledby={titleId}>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2.5 min-w-0">
            <h3 id={titleId} className="text-lg font-semibold">
              {copy.graphTitle}
            </h3>
            <span className="text-sm text-muted-foreground">
              {/* audit A45: it says it is an example and names the inputs, so it does not read as a promise */}
              {values ? (
                <>
                  {copy.headlineExample.lead} <Num value={values.inputs[ci.amountNow]!} /> {copy.headlineExample.plus} <Num value={values.inputs[ci.monthly]!} /> {cash ? copy.headlineExample.perMonthCash : copy.headlineExample.perMonth} <Num value={values.inputs[returnLabel]!} /> {copy.headlineExample.perYear} <Num value={horizonValue} display={fmt.years(horizonYears)} />, {mode === "real" ? copy.headline.after : copy.headline.afterNominal}
                </>
              ) : (
                <>
                  {copy.headline.before} <Num value={horizonValue} display={fmt.years(horizonYears)} />, {mode === "real" ? copy.headline.after : copy.headline.afterNominal}
                </>
              )}
            </span>
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

        {timeline.kind === "ok" ? (
          <>
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto flex gap-2 pb-1 scrollbar-none">
              {(["amount_now", "monthly_deposit", "horizon_years", returnKey, "A-02"] as P05Input[]).map((key) => {
                const own = enteredOf(key);
                const n = own ?? p05Number(bundle.p05, key);
                const text = key === "horizon_years" ? fmt.years(n) : key.startsWith("A-") || key === "cash_rate" ? fmt.pct(n) : fmt.nis(n);
                return (
                  <button key={key} type="button" onClick={() => openSheet(key)} className={cx("a-chip", own !== undefined && "a-chip-entered")}>
                    <span className="text-muted-foreground">{(copy.chips as Record<string, string>)[key]}</span>
                    {own !== undefined && <IconPencil size={14} className="text-entered" />}
                    <bdi dir="ltr" className={cx("font-medium", own !== undefined && "text-entered")}>{text}</bdi>
                  </button>
                );
              })}
              <button type="button" onClick={() => openSheet("all")} className="a-chip">
                {copy.chips.all}
              </button>
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="מקרא">
              <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-value" /> {copy.legend.net}</li>
              {/* audit A79: no swatch for an area that is not drawn (no tax in this run) */}
              {points.some((p) => p.tax > 0) && <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-tax" /> {copy.legend.tax}</li>}
              {!cash?.feesIndependent && <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-chart-fee" /> {copy.legend.fees}</li>}
              <li className="flex items-center gap-1.5"><span className="w-3.5 h-[3px] rounded-sm bg-chart-contributions" /> {copy.legend.contributions}</li>
            </ul>

            <TimelineChart points={points} hover={hover} onHover={setHover} markers={markers} enteredReturn={returnEntered} ariaLabel={`${copy.graphAria.before} ${fmt.years(horizonYears)}. ${copy.graphAria.after}`} />
            {returnEntered && <p className="text-xs text-entered">{cash ? copy.enteredRateCaption : copy.enteredReturnCaption}</p>}

            {readout && (
              <dl className="readout" aria-live="polite">
                <div className="readout-row readout-head">
                  <dt>{readout.yearText}</dt>
                  <dd />
                </div>
                <div className="readout-row"><dt>{copy.legend.net}</dt><dd><Num value={readout.net} animate /></dd></div>
                <div className="readout-row"><dt>{copy.legend.tax}</dt><dd><Num value={readout.tax} animate /></dd></div>
                <div className="readout-row"><dt>{copy.legend.fees}</dt><dd>{cash?.feesIndependent ? <span className="text-sm">{copy.feesIndependent}</span> : <Num value={readout.fees} animate />}</dd></div>
                <div className="readout-row"><dt>{copy.legend.contributions}</dt><dd><Num value={readout.contributions} animate /></dd></div>
              </dl>
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
      </div>

      <aside className="hidden lg:block w-[300px] shrink-0 bg-card border border-border rounded-lg p-5" aria-label={valuesCopy.title}>
        <h3 className="text-lg font-semibold mb-4">{valuesCopy.title}</h3>
        {panel}
        <TermsList bundle={bundle} />
        {anyEntered && <ResetAll onReset={resetAll} />}
      </aside>

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

function labelOf(key: P05Input): string {
  return (valuesCopy.fields as Record<string, string>)[key] ?? key;
}

/** The product terms the run read (flows 6.5): each a provenance number, in the order of the label table; not editable. */
function TermsList({ bundle }: { bundle: Bundle }) {
  const rows = Object.entries(guideBlocks.terms.labels).filter(([key]) => bundle.feeValues[key]);
  const employment = bundle.feeValues.employment;
  if (rows.length === 0 && !employment) return null;
  const show = (key: string, v: SiteValue) => {
    if (key === "linkage") return guideBlocks.terms.linkage[String(v.value)] ?? undefined;
    if (v.unit === "months" && typeof v.value === "number") return fmt.months(v.value);
    return undefined;
  };
  const unitWord = (v: SiteValue) => (provCopy.unit as Record<string, string>)[v.unit] ?? "";
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 mt-1">
      <h4 className="font-medium">{guideBlocks.terms.title}</h4>
      <p className="text-xs text-muted-foreground">{guideBlocks.terms.line}</p>
      <dl className="readout">
        {rows.map(([key, label]) => {
          const v = bundle.feeValues[key]!;
          return (
            <div key={key} className="readout-row">
              <dt>{feeLabel(label, feeYear(v))}</dt>
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
  );
}

/** The fields, in the order of design-spec 4; used both in the phone sheet and the PC panel. */
function ValuesPanel({ bundle, focusField, employment, cash, ownRate, setOwnRate }: { bundle: Bundle; focusField: P05Input | "all"; employment: boolean; cash: TimelineProps["cash"]; ownRate: number | undefined; setOwnRate: (n: number | null) => void }) {
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
  const nonNegative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const between = (r: { min: number; max: number } | null, msg: readonly [string, string], whole = false) => (n: number) => {
    if (whole && !Number.isInteger(n)) return valuesCopy.errors.nan;
    if (r && (n < r.min || n > r.max)) return `${msg[0]} ${fmt.number(r.min)} ${msg[1]}${fmt.number(r.max)}.`;
    return null;
  };
  const publishedFrom = cashBase.update_rule === "founder" ? null : cashBase.effective_from;
  const hints = cash ? (
    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground -mt-2">
      <span>{publishedFrom ? `${valuesCopy.hints.cashPublished} ${valuesCopy.hints.asOf}${fmt.date(publishedFrom)}.` : valuesCopy.hints.cashAssumption}</span>
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
      <ParameterLine />
      <NumberField label={valuesCopy.fields.amount_now} unit="nis" value={current("amount_now")} isEntered={isEntered("amount_now")} validate={nonNegative} onCommit={commit("amount_now")} onReset={() => setEntered("amount_now", null)} disabled={!ready} autoFocus={focusField === "amount_now"} />
      <SliderField label={valuesCopy.fields.monthly_deposit} unit="nis_per_month" value={current("monthly_deposit")} isEntered={isEntered("monthly_deposit")} validate={nonNegative} onCommit={commit("monthly_deposit")} onReset={() => setEntered("monthly_deposit", null)} min={monthly?.min ?? 0} max={monthly?.max ?? 10000} step={monthly?.step ?? 100} disabled={!ready} autoFocus={focusField === "monthly_deposit"} />
      <SliderField label={valuesCopy.fields.horizon_years} unit="years" value={current("horizon_years")} isEntered={isEntered("horizon_years")} validate={between(years, valuesCopy.errors.years, true)} onCommit={commit("horizon_years")} onReset={() => setEntered("horizon_years", null)} min={years?.min ?? 1} max={years?.max ?? 40} step={years?.step ?? 1} inputMode="numeric" disabled={!ready} autoFocus={focusField === "horizon_years"} />
      <div className="field-row grid grid-cols-2 gap-3">
        {cash ? (
          <NumberField label={valuesCopy.fields.cash_rate} unit="pct_per_year" value={current("cash_rate")} isEntered={isEntered("cash_rate")} validate={between(pctRange, valuesCopy.errors.pct)} onCommit={(n) => setOwnRate(n === p05Number(p05, "cash_rate") ? null : n)} onReset={() => setOwnRate(null)} disabled={!ready} autoFocus={focusField === "cash_rate"} />
        ) : (
          <NumberField label={valuesCopy.fields["A-01"]} unit="pct_per_year" value={current("A-01")} isEntered={isEntered("A-01")} validate={between(pctRange, valuesCopy.errors.pct)} onCommit={commit("A-01")} onReset={() => setEntered("A-01", null)} disabled={!ready} autoFocus={focusField === "A-01"} />
        )}
        <NumberField label={valuesCopy.fields["A-02"]} unit="pct_per_year" value={current("A-02")} isEntered={isEntered("A-02")} validate={between(pctRange, valuesCopy.errors.pct)} onCommit={commit("A-02")} onReset={() => setEntered("A-02", null)} disabled={!ready} autoFocus={focusField === "A-02"} />
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
      <NumberField label={<>{valuesCopy.fields.age} <span className="text-muted-foreground font-normal">{valuesCopy.optional}</span></>} unit="years" value={state.age} isEntered={state.age !== null} validate={between(ageRange, valuesCopy.errors.age, true)} onCommit={(n) => setAge(n)} onReset={() => setAge(null)} hint={valuesCopy.hints.age} placeholder={valuesCopy.agePlaceholder} inputMode="numeric" optional disabled={!ready} />
    </div>
  );
}
