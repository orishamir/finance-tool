// Pensions (D29): where does each shekel of the deposit come from, and what does it buy? One visual for the comprehensive pension, the
// general pension and the provident fund for annuity. A salaried person's monthly deposit at the legal minimum rates (PEN-03) split into
// what the person pays, what the employer pays and the severance component, the tax credit that returns part of the person's own part
// (F-31, or F-32 for a beneficiary member), what the fund takes from each deposit (its fee, and for the pensions an insurance cost the
// person enters, A-17), and what the deposits grow to (the engine's pension ledger). The pension itself needs conversion factors the site
// does not hold (PEN OQ7, G-03): "not computed yet", never a number. There is no nearest alternative: it is required for salaried people.
import { useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { pensionModel } from "../../lib/guide-signature-g2";
import { p05Number, p05Value, type Bundle } from "../../lib/engine";
import { useGoals } from "../../lib/goal";
import { useInputs } from "../../lib/inputs";
import { entered as enteredValue, type SiteValue } from "../../lib/value";
import { Callout, NumberField, RangeField, Sentence, Stat, StatRow } from "../kit";
import { Num, RulesLine, Term } from "../provenance";
import { G2Gap } from "./g2-parts";
import { figure, inputSite, rulesOfBundle, useSigInputs, yearsRange, type VisualProps } from "./kit";

export function PensionVisual(props: VisualProps) {
  const bundle = props.data.bundles[props.data.id];
  if (!bundle) return <G2Gap id="bundle" />;
  return <Inner {...props} bundle={bundle} />;
}

function Inner({ data, today, bundle }: VisualProps & { bundle: Bundle }) {
  const id = data.id;
  const inputs = useSigInputs(bundle);
  const { state } = useInputs();
  const { current } = useGoals();
  const employment = state.employment ?? current?.profile.employment ?? "employee";
  const [salaryPick, setSalaryPick] = useState<number | null>(null);
  const goalSalary = current?.profile.salary && current.profile.salary > 0 ? current.profile.salary : null;
  const p05Salary = p05Number(bundle.p05, "annual_income") / 12;
  const salary = salaryPick ?? goalSalary ?? p05Salary;
  const salarySource = salaryPick !== null ? "guide" : goalSalary !== null ? "goal" : "p05";
  const hasInsurance = id !== "provident-for-annuity";
  const [insurancePick, setInsurancePick] = useState<number | null>(null);
  const goalInsurance = hasInsurance && typeof current?.assumptions.insurance === "number" ? current.assumptions.insurance : null;
  const insurancePct = insurancePick ?? goalInsurance;
  const insuranceSource = insurancePick !== null ? "guide" : goalInsurance !== null ? "goal" : null;
  const yr = yearsRange(bundle);
  const years = Math.min(yr.max, Math.max(yr.min, Math.round(inputs.years)));
  const model = useMemo(() => pensionModel(data, id, { salary, years, insurancePct }), [data, id, salary, years, insurancePct]);

  if (employment === "self-employed") {
    return (
      <div className="flex flex-col gap-3">
        <Callout tone="info">{copy.pension.selfEmployed}</Callout>
        <RulesLine ids={["TXP-05", "TXP-06", "PEN-03"]} />
      </div>
    );
  }
  if (!model) return <G2Gap id="bundle" />;

  // ---- value objects
  const salaryIn: SiteValue = salarySource === "p05" ? figure(salary, "nis", "F-67", { [copy.pension.salaryAnnual]: p05Value(bundle.p05, "annual_income") }, today, copy.pension.salaryAbout) : enteredValue(salary, "nis", today, copy.pension.salaryAbout);
  const yearsIn = inputSite(bundle, "horizon_years", years, inputs.source.years, today, copy.common.inputNames.years);
  const insuranceIn: SiteValue | null = insurancePct !== null ? enteredValue(insurancePct, "pct", today, copy.pension.insuranceAbout) : null;
  const avgWage = fact(data, "avgWage");
  const employeePct = fact(data, "employeePct");
  const employerPct = fact(data, "employerPct");
  const severancePct = fact(data, "severancePct");
  const creditPct = fact(data, "creditPct");
  const threshold = fact(data, "threshold");
  const trackFee = fact(data, "trackFee");
  const depositFee = fact(data, "trackDepositFee");
  const trackName = fact(data, "trackName");
  const returnPct = fact(data, "returnPct");
  const inflationPct = fact(data, "inflationPct");
  const earlyAge = fact(data, "earlyAge");
  const rates: Record<string, SiteValue> = {
    ...(avgWage ? { [copy.pension.inputNames.avgWage]: avgWage } : {}),
    ...(employeePct ? { [copy.pension.inputNames.employee]: employeePct } : {}),
    ...(employerPct ? { [copy.pension.inputNames.employer]: employerPct } : {}),
    ...(severancePct ? { [copy.pension.inputNames.severance]: severancePct } : {}),
  };
  const base: Record<string, SiteValue> = { [copy.pension.salary]: salaryIn, ...rates };
  const rules = rulesOfBundle(bundle);
  const m = (value: number, about: string, extra: Record<string, SiteValue> = {}) => figure(value, "nis", "F-31", { ...base, ...extra }, today, about, rules);
  const v = {
    you: m(model.you, copy.pension.about.you),
    employer: m(model.employer, copy.pension.about.employer),
    severance: m(model.severance, copy.pension.about.severance),
    total: m(model.total, copy.pension.about.total),
    relief: figure(model.relief.monthly, "nis", model.relief.formula, { ...base, ...(creditPct ? { [copy.pension.inputNames.credit]: creditPct } : {}) }, today, copy.pension.about.relief, rules),
    net: figure(model.netYou, "nis", model.relief.formula, { ...base, ...(creditPct ? { [copy.pension.inputNames.credit]: creditPct } : {}) }, today, copy.pension.about.net, rules),
    depositFee: depositFee ? figure((Number(depositFee.value) / 100) * model.total, "nis", "F-11", { ...base, [copy.pension.inputNames.depositFee]: depositFee }, today, copy.pension.about.depositFee) : null,
    insurance: model.insuranceMonthly !== null && insuranceIn ? figure(model.insuranceMonthly, "nis", "F-53", { ...base, [copy.pension.insuranceAbout]: insuranceIn }, today, copy.pension.about.insurance) : null,
    balance: model.balance ? figure(model.balance.real, "nis", "F-67", { ...base, [copy.pension.insuranceAbout]: insuranceIn ?? enteredValue(0, "pct", today), [copy.common.inputNames.years]: yearsIn, ...(returnPct ? { [copy.hishtalmut.inputNames.ret]: returnPct } : {}), ...(inflationPct ? { [copy.hishtalmut.inputNames.inflation]: inflationPct } : {}), ...(trackFee ? { [copy.hishtalmut.inputNames.trackFee]: trackFee } : {}) }, today, copy.pension.about.balance, rules) : null,
  };
  const share = (n: number) => `${(n / model.total) * 100}%`;
  const parts = [
    { key: "you", label: copy.pension.parts.you, value: v.you, bar: "bg-chart-value", n: model.you },
    { key: "employer", label: copy.pension.parts.employer, value: v.employer, bar: "bg-chart-alt", n: model.employer },
    { key: "severance", label: copy.pension.parts.severance, value: v.severance, bar: "bg-chart-fee-4", n: model.severance },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-measure">{copy.pension.lead}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.pension.salary}
          unit="nis"
          value={salary}
          isEntered={salaryPick !== null}
          validate={(n) => (n <= 0 ? valuesCopy.errors.negative : null)}
          onCommit={(n) => setSalaryPick(n)}
          onReset={() => setSalaryPick(null)}
          disabled={!inputs.ready}
          optional
        />
        {hasInsurance && (
          <NumberField
            label={copy.pension.insurance}
            unit="pct"
            value={insurancePct}
            isEntered={insurancePick !== null}
            validate={(n) => (n < 0 || n > 100 ? valuesCopy.errors.negative : null)}
            onCommit={(n) => setInsurancePick(n)}
            onReset={() => setInsurancePick(null)}
            disabled={!inputs.ready}
            optional
            hint={copy.pension.insuranceHint}
          />
        )}
        <RangeField
          label={copy.common.years}
          unit="years"
          value={years}
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
      <p className="text-xs text-muted-foreground -mt-3">
        {copy.pension.salarySource} {copy.common.source[salarySource]}. {copy.pension.yearsSource} {copy.common.source[inputs.source.years]}.
        {insuranceSource ? ` ${copy.pension.insuranceSource} ${copy.common.source[insuranceSource]}.` : ""}
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          {copy.pension.monthLead} <Num value={v.total} />
        </p>
        <div className="flex gap-0.5 text-sm" aria-hidden="false">
          {parts.map((p) => (
            <div key={p.key} className="min-w-0 flex flex-col gap-0.5" style={{ width: share(p.n) }}>
              <span className="text-xs text-muted-foreground leading-tight">{p.key === "severance" ? <Term id="מרכיב הפיצויים">{p.label}</Term> : p.label}</span>
              <span className="font-semibold">
                <Num value={p.value} />
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 h-3.5" role="img" aria-label={copy.pension.chart.aria}>
          {parts.map((p) => (
            <div key={p.key} className={`${p.bar} first:rounded-s-sm last:rounded-e-sm`} style={{ width: share(p.n) }} />
          ))}
        </div>
        <div className="flex flex-col">
          <div className="h-3 border-x-2 border-b-2 border-foreground/60 rounded-b-sm" style={{ width: share(model.you) }} />
          <span className="block text-sm text-muted-foreground mt-0.5">
            {copy.pension.returns.before} <Num value={v.relief} /> {copy.pension.returns.after}
          </span>
        </div>
      </div>

      <StatRow cols={2}>
        <Stat label={copy.pension.figures.net}>
          <Num value={v.net} />
        </Stat>
        {hasInsurance && (
          <Stat label={copy.pension.figures.insurance}>{v.insurance ? <Num value={v.insurance} /> : <span className="text-base font-normal text-muted-foreground">{copy.pension.insuranceNeeded}</span>}</Stat>
        )}
        {v.depositFee && (
          <Stat label={copy.pension.figures.depositFee}>
            <Num value={v.depositFee} />
          </Stat>
        )}
        <Stat label={`${copy.pension.figures.balance} ${fmt.years(years)}`} tone="value">
          {v.balance ? <Num value={v.balance} /> : <span className="text-base font-normal text-muted-foreground">{copy.pension.balanceGap[model.balanceGap ?? "no-run"]}</span>}
        </Stat>
      </StatRow>
      <G2Gap id="annuityFactors" />

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        {employeePct && employerPct && severancePct && avgWage && (
          <p>
            {copy.pension.ratesLine.before} <Num value={employeePct} /> {copy.pension.ratesLine.middle} <Num value={employerPct} /> {copy.pension.ratesLine.severance} <Num value={severancePct} /> {copy.pension.ratesLine.wage} <Num value={avgWage} /> {copy.pension.ratesLine.after}
          </p>
        )}
        {creditPct && (
          <p>
            {copy.pension.creditLine.before} <Term id="זיכוי ממס">{copy.pension.creditLine.term}</Term> {copy.pension.creditLine.middle} <Num value={creditPct} /> {copy.pension.creditLine.after}
            {model.relief.beneficiary && threshold ? (
              <>
                {" "}
                {copy.pension.beneficiary.before} <Term id="עמית מוטב">{copy.pension.beneficiary.term}</Term>: {copy.pension.beneficiary.middle} <Num value={threshold} /> {copy.pension.beneficiary.after}
              </>
            ) : null}
          </p>
        )}
        {hasInsurance ? <p className="text-muted-foreground">{copy.pension.insuranceNote}</p> : <p className="text-muted-foreground">{copy.pension.noInsurance}</p>}
        {trackName && trackFee ? (
          <Sentence tone="muted">
            {copy.pension.feesLine.before} ״<bdi>{String(trackName.value)}</bdi>״: <Num value={trackFee} /> {copy.pension.feesLine.balance}
            {depositFee ? (
              <>
                {" "}
                {copy.pension.feesLine.deposit} <Num value={depositFee} /> {copy.pension.feesLine.ofDeposit}
              </>
            ) : null}
            .{hasInsurance ? ` ${copy.pension.feesLine.after}` : ""}
          </Sentence>
        ) : (
          <G2Gap id="pensionTrack" />
        )}
        {hasInsurance && earlyAge && (
          <Sentence tone="muted">
            {copy.pension.none.before} <Num value={earlyAge} display={String(earlyAge.value)} />.
          </Sentence>
        )}
        <Sentence tone="muted">
          {copy.hishtalmut.assumption.before} {returnPct && <Num value={returnPct} />} {copy.hishtalmut.assumption.middle} {inflationPct && <Num value={inflationPct} />} {copy.hishtalmut.assumption.after} {copy.pension.todayMoney}
        </Sentence>
      </div>
      <RulesLine ids={[...data.ruleIds, ...model.rules.filter((r) => /^(PEN|TXP)-/.test(r))].filter((r, i, a) => a.indexOf(r) === i)} />
    </div>
  );
}
