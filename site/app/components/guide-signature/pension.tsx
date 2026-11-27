// Pensions (D29): where does each shekel of the deposit come from, and what does it buy? One visual for the comprehensive pension, the
// general pension and the provident fund for annuity. A salaried person's monthly deposit at the legal minimum rates (PEN-03) split into
// what the person pays, what the employer pays and the severance component, the tax credit that returns part of the person's own part
// (F-31, or F-32 for a beneficiary member), what the fund takes from each deposit (its fee, and for the pensions an insurance cost the
// person enters, A-17), and what the deposits grow to (the engine's pension ledger). The pension itself needs conversion factors the site
// does not hold (PEN OQ7, G-03): "not computed yet", never a number. There is no nearest alternative: it is required for salaried people.
// A general fund receives only the deposit above the comprehensive fund's monthly ceiling (PEN-10, PEN-08): its page splits the deposit
// at the ceiling, and where nothing is above it, says so instead of a balance (method F-67, "The general fund"). The assumptions line
// says what the balance assumes: deposits flat in shekels, and no insurance until it is entered.
import { useMemo, useState } from "react";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { pensionModel } from "../../lib/guide-signature-g2";
import { p05Number, p05Value, type Bundle } from "../../lib/engine";
import { useInputs } from "../../lib/inputs";
import { asField, computed, type SiteValue } from "../../lib/value";
import { amountCheck, Callout, DotLine, NumberField, PercentField, Sentence, Stat, StatRow, MixedName } from "../kit";
import { IdRef, Num, Ruled, Term } from "../provenance";
import { figure, Gap, inputSite, SigYearsField, termInputs, useSigInputs, yearsRange, typed, type VisualProps } from "./kit";
import { mergedRules } from "@finance-tool/engine";
import { rulesOfRun, withoutSalaryTax } from "../../lib/run-rules";

export function PensionVisual(props: VisualProps) {
  const bundle = props.data.bundles[props.data.id];
  if (!bundle) return <Gap id="bundle" from="g2" />;
  return <Inner {...props} bundle={bundle} />;
}

function Inner({ data, today, bundle }: VisualProps & { bundle: Bundle }) {
  const id = data.id;
  const inputs = useSigInputs(bundle);
  const { state } = useInputs();
  // the page's own values and the site's example, never the saved goal
  const employment = state.employment ?? "employee";
  const [salaryPick, setSalaryPick] = useState<number | null>(null);
  const p05Salary = p05Number(bundle.p05, "annual_income") / 12;
  const salary = salaryPick ?? p05Salary;
  const salarySource = salaryPick !== null ? "guide" : "p05";
  // the general fund's page: no balance, insurance or fee of its own while nothing of the deposit reaches it
  const generalOnly = id === "pension-general";
  const hasInsurance = id !== "provident-for-annuity" && !generalOnly;
  const [insurancePick, setInsurancePick] = useState<number | null>(null);
  const insurancePct = insurancePick;
  const yr = yearsRange(bundle);
  const years = Math.min(yr.max, Math.max(yr.min, Math.round(inputs.years)));
  const model = useMemo(() => pensionModel(data, id, { salary, years, insurancePct }), [data, id, salary, years, insurancePct]);

  if (employment === "self-employed") {
    return (
      <div className="flex flex-col gap-3">
        <Callout tone="info">
          {copy.pension.selfEmployed.before} <Ruled id={["TXP-05", "TXP-06", "TXP-02", "TXP-04"]}>{copy.pension.selfEmployed.stated}</Ruled>
          {copy.pension.selfEmployed.after}
        </Callout>
      </div>
    );
  }
  if (!model) return <Gap id="bundle" from="g2" />;

  // ---- value objects
  // the salary field's default, like what the reader types in it, is a plain number
  const salaryIn: SiteValue = salarySource === "p05" ? asField(figure(salary, "nis", "F-67", { [copy.pension.salaryAnnual]: p05Value(bundle.p05, "annual_income") }, today, copy.pension.salaryAbout)) : typed(salary, "nis", today, copy.pension.salaryAbout);
  const yearsIn = inputSite(bundle, "horizon_years", years, inputs.source.years, today, copy.common.inputNames.years);
  const insuranceIn: SiteValue | null = insurancePct !== null ? typed(insurancePct, "pct", today, copy.pension.insuranceAbout) : null;
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
  const ceiling = fact(data, "comprehensiveCeiling");
  // each part of the deposit is its own legal rate on min(salary, average wage) (F-67, PEN-03, PEN-04): its sheet names that rate, not the other two
  // the average wage takes part only where the salary is above it (PEN-04)
  const wageIn: Record<string, SiteValue> = { [copy.pension.salary]: salaryIn, ...(avgWage && salary > Number(avgWage.value) ? { [copy.pension.inputNames.avgWage]: avgWage } : {}) };
  const youIn: Record<string, SiteValue> = { ...wageIn, ...(employeePct ? { [copy.pension.inputNames.employee]: employeePct } : {}) };
  const employerIn: Record<string, SiteValue> = { ...wageIn, ...(employerPct ? { [copy.pension.inputNames.employer]: employerPct } : {}) };
  const severanceIn: Record<string, SiteValue> = { ...wageIn, ...(severancePct ? { [copy.pension.inputNames.severance]: severancePct } : {}) };
  const base: Record<string, SiteValue> = { ...youIn, ...employerIn, ...severanceIn };
  // the relief is F-31's credit or F-32, and which one is the threshold's to say (TXP-03): both read it
  const reliefIn: Record<string, SiteValue> = { ...base, ...(creditPct ? { [copy.pension.inputNames.credit]: creditPct } : {}), ...(threshold ? { [copy.pension.inputNames.threshold]: threshold } : {}) };
  // the balance is the pension ledger's run on the bundle's fees (both the balance and the deposit fee, termInputs), the years, the return
  // and inflation; the insurance is the run's only for a pension fund (a provident fund for annuity has none, A-17)
  const balanceIn: Record<string, SiteValue> = {
    ...base,
    ...(hasInsurance ? { [copy.pension.insuranceAbout]: insuranceIn ?? typed(0, "pct", today) } : {}),
    [copy.common.inputNames.years]: yearsIn,
    ...(returnPct ? { [copy.common.inputNames.ret]: returnPct } : {}),
    ...(inflationPct ? { [copy.common.inputNames.inflation]: inflationPct } : {}),
    ...termInputs(bundle),
  };
  // each figure lists the rules that changed its part (method §13): a deposit the minimum rates (PEN-03), and the average wage only where
  // it caps the salary (PEN-04); the relief and what the deposit costs after it the relief's rules; the balance everything its runs changed
  // but the salary's tax on the employer's money above its limit, which the salary pays and the balance is before
  const depositRules = rulesOfRun(model.used, ["deposit"]);
  const reliefRules = rulesOfRun(model.used, ["relief"]);
  const m = (value: number, about: string, inputs: Record<string, SiteValue>) => figure(value, "nis", "F-67", inputs, today, about, depositRules);
  // the relief carries its open readings: the credit capped at the year's tax (TXP OQ20) and that tax, and any deduction, at the brackets
  // without credit points (G-23)
  const reliefFigure = (value: number, about: string) => computed(value, "nis", model.relief.formula, reliefIn, { today, about, rules: reliefRules, flags: model.relief.flags, labels: model.relief.labels });
  const v = {
    you: m(model.you, copy.pension.about.you, youIn),
    employer: m(model.employer, copy.pension.about.employer, employerIn),
    severance: m(model.severance, copy.pension.about.severance, severanceIn),
    total: m(model.total, copy.pension.about.total, base),
    relief: reliefFigure(model.relief.monthly, copy.pension.about.relief),
    net: reliefFigure(model.netYou, copy.pension.about.net),
    depositFee: depositFee ? figure((Number(depositFee.value) / 100) * model.total, "nis", "F-11", { ...base, [copy.pension.inputNames.depositFee]: depositFee }, today, copy.pension.about.depositFee) : null,
    insurance: model.insuranceMonthly !== null && insuranceIn ? figure(model.insuranceMonthly, "nis", "F-53", { ...base, [copy.pension.insuranceAbout]: insuranceIn }, today, copy.pension.about.insurance) : null,
    // the balance carries its runs' flags and labels, each flag with its line (copy.ts `flags`)
    balance: model.balance ? computed(model.balance.real, "nis", "F-67", balanceIn, { today, about: copy.pension.about.balance, rules: rulesOfRun(withoutSalaryTax(mergedRules([{ rules: model.used }, { rules: model.balance.rules }])), "all"), flags: model.balance.flags, labels: model.balance.labels }) : null,
    toGeneral: model.general && ceiling ? figure(model.general.toGeneral, "nis", "F-67", { ...base, [copy.pension.general.below.term]: ceiling }, today, copy.pension.general.toGeneral, depositRules) : null,
  };
  const share = (n: number) => `${(n / model.total) * 100}%`;
  const parts = [
    { key: "you", label: copy.pension.parts.you, value: v.you, bar: "bg-chart-value", n: model.you },
    { key: "employer", label: copy.pension.parts.employer, value: v.employer, bar: "bg-chart-alt", n: model.employer },
    { key: "severance", label: copy.pension.parts.severance, value: v.severance, bar: "bg-chart-fee-4", n: model.severance },
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-measure">
        {copy.pension.lead.before} <Ruled prefix={copy.pension.lead.prefix} id="PEN-67">{copy.pension.lead.stated}</Ruled>
        {copy.pension.lead.after}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.pension.salary}
          unit="nis"
          value={salary}
          start={p05Salary}
          isEntered={salaryPick !== null}
          validate={amountCheck(inputs.p05.amountMax, { aboveZero: true })}
          onCommit={(n) => setSalaryPick(n)}
          onReset={() => setSalaryPick(null)}
          disabled={!inputs.ready}
          optional
        />
        {hasInsurance && (
          <PercentField
            label={copy.pension.insurance}
            unit="pct"
            value={insurancePct}
            isEntered={insurancePick !== null}
            onCommit={(n) => setInsurancePick(n)}
            onReset={() => setInsurancePick(null)}
            disabled={!inputs.ready}
            optional
            hint={copy.pension.insuranceHint}
          />
        )}
        {!model.general && <SigYearsField inputs={inputs} bundle={bundle} value={years} />}
      </div>

      {/* an HTML chart: the chart check (site/scripts/chart-check) finds it by data-chart, and reads the bar's start and parts */}
      <div className="flex flex-col gap-2" data-chart="split-bar">
        <p className="text-sm font-medium">
          {copy.pension.monthLead} <Num value={v.total} />
        </p>
        <div className="flex gap-0.5 text-sm" aria-hidden="false">
          {parts.map((p) => (
            <div key={p.key} className="min-w-0 flex flex-col gap-0.5 transition-[width] duration-(--duration-chart)" style={{ width: share(p.n) }}>
              {/* a term keeps to one line elsewhere; here it may wrap, as the other labels do: at 320 px the severance label ran 17 px past its
                  part's column and the chart's edge */}
              <span className="text-xs text-muted-foreground leading-tight [&_.term]:whitespace-normal">{p.key === "severance" ? <Term id="מרכיב הפיצויים">{p.label}</Term> : p.label}</span>
              <span className="font-semibold">
                <Num value={p.value} />
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 h-3.5" role="img" aria-label={copy.pension.chart.aria} data-zero="">
          {parts.map((p) => (
            <div key={p.key} className={`${p.bar} first:rounded-s-sm last:rounded-e-sm transition-[width] duration-(--duration-chart)`} style={{ width: share(p.n) }} data-mark="part" />
          ))}
        </div>
        <div className="flex flex-col">
          <div className="h-3 border-x-2 border-b-2 border-foreground/60 rounded-b-sm transition-[width] duration-(--duration-chart)" style={{ width: share(model.you) }} />
          <span className="block text-sm text-muted-foreground mt-0.5">
            {copy.pension.returns.before} <Num value={v.relief} /> {copy.pension.returns.after} {copy.pension.returns.when.before} <Ruled id="TXP-34">{copy.pension.returns.when.stated}</Ruled>{copy.pension.returns.when.after} {copy.pension.returns.notice} <IdRef id="TXP OQ6" end="." /> {copy.pension.returns.otherwise.before} <Ruled id="TXP-02">{copy.pension.returns.otherwise.stated}</Ruled>.
          </span>
        </div>
      </div>

      {model.general && ceiling && (
        <Sentence measure>
          {model.general.toGeneral > 0 && v.toGeneral ? (
            <>
              {copy.pension.general.split.before} <Num value={ceiling} /> {copy.pension.general.split.middle} <Ruled id="PEN-10">{copy.pension.general.split.moves}</Ruled> <Num value={v.toGeneral} /> {copy.pension.general.split.after}
            </>
          ) : (
            <>
              {copy.pension.general.below.before}<Term id="תקרת הפקדה">{copy.pension.general.below.term}</Term> {copy.pension.general.below.middle} <Num value={ceiling} /> {copy.pension.general.below.after} <Ruled id="PEN-10">{copy.pension.general.below.moves}</Ruled>
              {copy.pension.general.below.end}
            </>
          )}
        </Sentence>
      )}

      <StatRow cols={2}>
        <Stat label={copy.pension.figures.net}>
          <Num value={v.net} />
        </Stat>
        {hasInsurance && (
          <Stat label={copy.pension.figures.insurance}>{v.insurance ? <Num value={v.insurance} /> : <span className="text-base font-normal text-muted-foreground">{copy.pension.insuranceNeeded}</span>}</Stat>
        )}
        {v.depositFee && !model.general && (
          <Stat label={copy.pension.figures.depositFee}>
            <Num value={v.depositFee} />
          </Stat>
        )}
        {!model.general && (
          <Stat label={`${copy.pension.figures.balance} ${fmt.years(years)}`} tone="value">
            {v.balance ? <Num value={v.balance} /> : <span className="text-base font-normal text-muted-foreground">{copy.pension.balanceGap[model.balanceGap ?? "no-run"]}</span>}
          </Stat>
        )}
      </StatRow>
      <Gap id="annuityFactors" from="g2" />

      <div className="flex flex-col gap-2 text-sm max-w-measure">
        {employeePct && employerPct && severancePct && avgWage && (
          <p>
            {copy.pension.ratesLine.before} <Ruled id={["PEN-01", "PEN-03"]}>{copy.pension.ratesLine.stated}</Ruled>
            {copy.pension.ratesLine.colon} <Num value={employeePct} /> {copy.pension.ratesLine.middle} <Num value={employerPct} /> {copy.pension.ratesLine.severance} <Num value={severancePct} /> {copy.pension.ratesLine.wage} <Num value={avgWage} /> {copy.pension.ratesLine.after}
          </p>
        )}
        {creditPct && (
          <p>
            {copy.pension.creditLine.before} <Term id="זיכוי ממס">{copy.pension.creditLine.term}</Term> {copy.pension.creditLine.middle} <Num value={creditPct} /> {copy.pension.creditLine.after} <Ruled id={["TXP-02", "TXP-04"]}>{copy.pension.creditLine.capped}</Ruled> {copy.pension.creditLine.end}
            {model.relief.beneficiary && threshold ? (
              <>
                {" "}
                {copy.pension.beneficiary.before} <Term id="עמית מוטב">{copy.pension.beneficiary.term}</Term>: {copy.pension.beneficiary.middle} <Num value={threshold} /> {copy.pension.beneficiary.after}
              </>
            ) : null}
          </p>
        )}
        {hasInsurance ? (
          <p className="text-muted-foreground">
            {copy.pension.insuranceNote.before} <Ruled id="PEN-15">{copy.pension.insuranceNote.stated}</Ruled>
            {copy.pension.insuranceNote.after}
          </p>
        ) : !generalOnly && (
          <p className="text-muted-foreground">
            {copy.pension.noInsurance.before} <Ruled id="PEN-35">{copy.pension.noInsurance.stated}</Ruled>
            {copy.pension.noInsurance.after}
          </p>
        )}
        {trackName && trackFee ? (
          <Sentence tone="muted">
            {copy.pension.feesLine.before} ״<MixedName>{String(trackName.value)}</MixedName>״: <Num value={trackFee} /> {copy.pension.feesLine.balance}
            {depositFee ? (
              <>
                {" "}
                {copy.pension.feesLine.deposit} <Num value={depositFee} /> {copy.pension.feesLine.ofDeposit}
              </>
            ) : null}
            .{hasInsurance ? ` ${copy.pension.feesLine.after}` : ""}
          </Sentence>
        ) : (
          <Gap id="pensionTrack" from="g2" />
        )}
        {hasInsurance && earlyAge && (
          <Sentence tone="muted">
            <Term id="קצבת זקנה">{copy.pension.none.pension}</Term> <Term prefix="מ" id="קרן פנסיה">{copy.pension.none.fund}</Term> {copy.pension.none.after} <Num value={earlyAge} display={String(earlyAge.value)} />.
          </Sentence>
        )}
        {model.balance && (
          <DotLine
            items={[
              copy.hishtalmut.assumption.site,
              returnPct && (
                <>
                  <Term id="תשואה">{copy.hishtalmut.assumption.ret}</Term> <Num value={returnPct} /> {copy.hishtalmut.assumption.perYear}
                </>
              ),
              inflationPct && (
                <>
                  <Term id="אינפלציה">{copy.hishtalmut.assumption.inflation}</Term> <Num value={inflationPct} /> {copy.hishtalmut.assumption.perYear}
                </>
              ),
              copy.pension.assume.flat,
              copy.pension.assume.grossRises,
              hasInsurance && insurancePct === null && copy.pension.assume.noInsurance,
              copy.pension.todayMoney,
            ]}
          />
        )}
      </div>
    </div>
  );
}
