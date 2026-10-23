// Screen 1: the product guide page (design-spec 2).
import type { ReactNode } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/guide";
import { guideBlocks as blocks, guide as copy, guideIndex, site } from "../copy";
import { DimensionChecklist, FeeTable, GuideSection, InstitutionChips, KeyValueList, RelatedProducts, SectionIndex, TaxSteps, TermTable, useCurrentSection, type ChecklistRowView, type FeeRow, type KeyValueItem, type TaxStep } from "../components/guide/sections";
import { Num, NumberLegend, RuleRef, RulesLine, StrengthLabel } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Timeline } from "../components/timeline/Timeline";
import { SavedGoalStrip } from "../components/compare/strip";
import { Callout, Disclosure, Tag } from "../components/ui";
import { GoalsProvider, type Presets } from "../lib/goal";
import { fmt } from "../lib/format";
import { guideContent } from "../content/guide";
import type { SiteValue } from "../lib/value";

const providentIds = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident", "ira-provident", "ira-hishtalmut"];
const isProvidentFamily = (id: string) => providentIds.includes(id);

interface ExitRate {
  rule: string;
  figure: string;
  copyKey: string;
}

/**
 * The rate each exit formula shows, as groups of candidates: from each group the first one the record's
 * `tax_at_exit.rule_ids` cites is shown, and a candidate whose rule the page does not carry is skipped.
 */
function exitRateLines(formula: string): ExitRate[][] {
  const r = (rule: string, figure: string, copyKey: string): ExitRate => ({ rule, figure, copyKey });
  switch (formula) {
    case "F-41":
      return [
        [r("TXI-03", "rate", "unlinkedInterest"), r("TXI-08", "withholding_rate_unlinked", "unlinkedInterest")],
        [r("TXI-02", "rate", "linkedInterestCeiling"), r("TXI-08", "withholding_rate_linked", "linkedInterest")],
      ];
    case "F-40":
      return [
        [r("TXS-09", "rate", "realBasis"), r("TXS-13", "rate", "realBasis"), r("TXS-01", "rate", "realBasis"), r("TXI-14", "rate", "realLinkedBond")],
        [r("TXI-12", "rate", "nominalBasis"), r("TXS-03", "rate", "nominalBasis"), r("TXI-11", "rate", "nominalBasis")],
      ];
    case "F-46":
    case "F-47":
      return [[r("TXH-11", "rate", "hishtalmutExcess")]];
    case "F-50":
      return [[r("TXK-23", "provident_rate", "childProvident")], [r("TXK-23", "bank_linked_rate", "childBankLinked")], [r("TXK-23", "bank_unlinked_rate", "childBankUnlinked")]];
    default:
      return [];
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const { buildGuidePage } = await import("../lib/guide.server");
  const content = guideContent[params.id];
  const data = buildGuidePage(params.id, content ? [...content.switchRules] : [], content ? [...content.termIds] : []);
  if (!data) throw new Response("Not found", { status: 404 });
  const { goalContext } = await import("../lib/compare.server");
  return { ...data, goal: goalContext() };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${data?.name ?? guideIndex.title} · ${site.name}` }];
}

export default function GuidePage() {
  const data = useLoaderData<typeof loader>();
  const { record, rules, today } = data;
  const content = guideContent[record.id];
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const figure = (ruleId: string, name: string): SiteValue | null => {
    const r = rules[ruleId];
    if (!r) return null;
    const f = r.figures?.[name];
    if (!f || Array.isArray(f)) return null;
    const v = "by_tax_year" in f ? f.by_tax_year[today.slice(0, 4)] ?? Object.values(f.by_tax_year).at(-1) : f;
    return v ? { ...v, rule_ids: v.rule_ids ?? [ruleId] } : null;
  };
  const strengthOfRules = (ids: readonly string[]) => (ids.map((id) => rules[id]?.strength).some((s) => s === "institution") ? "institution" : ids.map((id) => rules[id]?.strength).some((s) => s === "secondary") ? "secondary" : null);
  const weakTag = (ids: readonly string[]) => {
    const s = strengthOfRules(ids);
    return s ? <StrengthLabel strength={s} /> : undefined;
  };

  // ---- money in and out
  const exit = record.lawful_exit;
  const exitCopy = blocks.exit as Record<string, string | { before: string; after: string }>;
  const lockUp = exit.kind === "after_years" || exit.kind === "at_age" || exit.kind === "at_child_age";
  const exitRules = (...vs: (SiteValue | undefined)[]) => [...new Set(vs.flatMap((v) => v?.rule_ids ?? []))];
  const exitValue = (): { value: ReactNode; rules: string[] } => {
    const years = exit.years as SiteValue | undefined;
    const age = exit.age as SiteValue | undefined;
    const term = exit.term_months as SiteValue | undefined;
    const days = exit.payout_business_days as SiteValue | undefined;
    switch (exit.kind) {
      case "any_time":
        return { value: blocks.exit.anyTime, rules: days?.rule_ids ?? [] };
      case "trading_day":
        return { value: exitCopy.tradingDay as string, rules: exitRules(days) };
      case "at_maturity":
        return term
          ? { value: <>{(exitCopy.atMaturityTerm as { before: string }).before} <Num value={term} display={fmt.months(term.value as number)} /></>, rules: exitRules(term) }
          : { value: exitCopy.atMaturity as string, rules: [] };
      case "after_years":
        return years ? { value: <>{(exitCopy.afterYears as { before: string }).before} <Num value={years} display={fmt.years(years.value as number)} /></>, rules: exitRules(years) } : { value: exitCopy.otherKind as string, rules: [] };
      case "at_age":
        return age ? { value: <>{(exitCopy.atAge as { before: string }).before} <Num value={age} /></>, rules: exitRules(age) } : { value: exitCopy.otherKind as string, rules: [] };
      case "at_child_age":
        return age ? { value: <>{(exitCopy.atChildAge as { before: string }).before} <Num value={age} /></>, rules: exitRules(age) } : { value: exitCopy.otherKind as string, rules: [] };
      default:
        return { value: exitCopy.otherKind as string, rules: [] };
    }
  };
  const exitItem = (): KeyValueItem => {
    const v = exitValue();
    return {
      id: "withdraw",
      label: lockUp ? blocks.exit.labelFree : blocks.exit.labelWithdraw,
      value: v.value,
      rules: v.rules,
      // the record's own wording, in the language it is written in; a kind the page already says in words needs no more
      line: exit.text && exit.kind !== "any_time" ? (
        <Disclosure label={<span className="text-sm text-link">{exitCopy.textNote as string}</span>} summaryClassName="min-h-9 justify-start gap-1 [&>svg]:size-4">
          <bdi dir="ltr" className="text-sm block pb-2">
            {exit.text}
          </bdi>
        </Disclosure>
      ) : undefined,
    };
  };
  const inout: KeyValueItem[] = [];
  if (lockUp) inout.push(exitItem());
  if (record.ceiling) {
    const amount = record.ceiling.amount as SiteValue;
    inout.push({
      id: "ceiling",
      label: record.ceiling.per.includes("total") ? blocks.ceiling.labelTotal : blocks.exit.labelCeiling,
      value: (
        <>
          <Num value={amount} /> {blocks.ceiling.per[record.ceiling.per] ?? <bdi dir="ltr">{record.ceiling.per}</bdi>}
        </>
      ),
      rules: amount.rule_ids ?? [],
      lead: amount.tax_year ? (
        <span>
          {blocks.ceiling.taxYear} <bdi dir="ltr">{amount.tax_year}</bdi> ·
        </span>
      ) : undefined,
    });
  }
  if (!lockUp) inout.push(exitItem());
  if (exit.payout_business_days) {
    const days = exit.payout_business_days as SiteValue;
    inout.push({
      id: "days",
      label: blocks.exit.labelDays,
      value: (
        <>
          {blocks.exit.upTo} <Num value={days} /> {blocks.exit.businessDays}
        </>
      ),
      rules: days.rule_ids ?? [],
    });
  }
  if (content && record.switch_is_tax_event.value === false) {
    inout.push({ id: "switch", label: blocks.exit.labelSwitch, value: content.switchLine, rules: [...(record.switch_is_tax_event.rule_ids ?? []), ...content.switchRules.filter((r) => !(record.switch_is_tax_event.rule_ids ?? []).includes(r))] });
  }

  // ---- fees: every base the record allows, in a fixed order; the cap is the record's figure, else the provider's own tariff
  const provident = isProvidentFamily(record.id);
  const feeCopy = blocks.fees as Record<string, any>;
  const fees: FeeRow[] = [];
  const feeOrder = ["balance", "deposit", "variable_management", "trustee", "trade", "spread", "custody", "fx", "fixed_period", "distribution_handling", "creation_redemption", "load", "redemption_deduction", "transfer_out", "insurance_premium", "exit"];
  for (const base of feeOrder) {
    const cap = record.fee_caps[base as keyof typeof record.fee_caps] as SiteValue | undefined;
    if (!(record.fee_bases_allowed as string[]).includes(base)) continue;
    const c = feeCopy[base];
    if (!c) continue;
    fees.push({
      id: base,
      name: c.name,
      base: c.base,
      cap: cap && cap.value === null ? (
        <Num value={cap} display={feeCopy.noCap} />
      ) : cap && cap.value === 0 ? (
        <Num value={cap} display={feeCopy.zeroCap} />
      ) : cap ? (
        <>
          {feeCopy.upTo} <Num value={cap} /> {c.after ?? feeCopy.unitAfter[cap.unit] ?? ""}
        </>
      ) : (
        feeCopy.tariffSet
      ),
      rules: cap?.rule_ids ?? [],
    });
  }
  if (record.fee_bases_allowed.includes("direct_expenses")) fees.push({ id: "direct", name: blocks.fees.direct_expenses.name, base: blocks.fees.direct_expenses.base, cap: blocks.fees.direct_expenses.cap, rules: ["PF-10"] });
  if (provident && !record.fee_bases_allowed.includes("exit")) fees.push({ id: "exit", name: blocks.fees.exit.name, base: blocks.fees.exit.base, cap: blocks.fees.exit.cap, rules: ["PF-01", ...(record.lawful_exit.payout_business_days?.rule_ids ?? [])], tag: weakTag(record.lawful_exit.payout_business_days?.rule_ids ?? []) });

  // ---- tax steps
  const stepCopy = (formula: string) => blocks.taxSteps[formula];
  const pendingLine = (formula: string): ReactNode =>
    data.pendingFormulas[formula] !== undefined ? (
      <>
        {blocks.notComputed.text}
        {data.pendingFormulas[formula] && (
          <>
            {" · "}
            {blocks.notComputed.releaseBefore} <bdi dir="ltr">{data.pendingFormulas[formula]}</bdi>
          </>
        )}
      </>
    ) : null;
  const plainStep = (id: string, when: string, step: { formula: string; rule_ids: string[] }): TaxStep => ({
    id,
    when,
    headline: stepCopy(step.formula)?.headline ?? step.formula,
    text: pendingLine(step.formula) ?? stepCopy(step.formula)?.text ?? "",
    rules: step.rule_ids,
  });
  // the exit formula's rates: only a rate the record itself cites, never another rule's number
  const citedExit = new Set(record.tax_at_exit.rule_ids);
  const rateLines = exitRateLines(record.tax_at_exit.formula)
    .map((group) => group.find((c) => citedExit.has(c.rule) && figure(c.rule, c.figure)))
    .filter((c): c is ExitRate => !!c)
    .map((c) => ({ ...c, value: figure(c.rule, c.figure)! }));
  const exitStepCopy = stepCopy(record.tax_at_exit.formula);
  const exitFormula = record.tax_at_exit.formula;
  const exitRate = exitFormula === "F-44" ? figure("TXK-06", "rate") : null;
  const altRate = exitFormula === "F-44" ? figure("TXK-06", "nominal_rate") : null;
  const exitWeak = strengthOfRules(record.tax_at_exit.rule_ids);
  const steps: TaxStep[] = [
    plainStep("deposit", copy.taxSteps.deposit, record.deposit_side_tax),
    plainStep("during", copy.taxSteps.during, record.tax_during),
    {
      id: "exit",
      when: copy.taxSteps.exit,
      headline:
        exitStepCopy && exitRate && "before" in exitStepCopy ? (
          <>
            {exitStepCopy.before} <Num value={exitRate} /> {exitStepCopy.after}
          </>
        ) : (
          exitStepCopy?.headline ?? exitFormula
        ),
      text: pendingLine(exitFormula) ?? exitStepCopy?.text ?? "",
      tag: exitWeak ? (exitStepCopy?.baseTag ? <Tag tone="caution">{exitStepCopy.baseTag}</Tag> : <StrengthLabel strength={exitWeak} />) : undefined,
      alt:
        exitStepCopy && altRate && "altBefore" in exitStepCopy ? (
          <>
            {exitStepCopy.altBefore} <Num value={altRate} /> {exitStepCopy.altAfter}
          </>
        ) : rateLines.length > 0 ? (
          <span className="flex flex-col gap-0.5">
            {rateLines.map((r) => {
              const c = (blocks.exitRates as Record<string, { before: string; after: string }>)[r.copyKey]!;
              return (
                <span key={r.rule + r.figure}>
                  {c.before} <Num value={r.value} /> {c.after}
                </span>
              );
            })}
          </span>
        ) : undefined,
      rules: record.tax_at_exit.rule_ids,
    },
  ];

  // ---- checklist
  const checklist: ChecklistRowView[] = data.checklist.map((row) => {
    const mark = data.marks[row.id];
    const carrying = Object.values(rules).filter((r) => r.dimensions.includes(row.id)).map((r) => r.id);
    const allWeak = carrying.length > 0 && carrying.every((id) => rules[id]!.strength === "institution" || rules[id]!.strength === "secondary");
    return {
      id: row.id,
      name: row.name,
      explanation: row.explanation,
      mark: mark === "covered" ? "covered" : mark?.startsWith("blocked:") ? "blocked" : "na",
      code: mark?.startsWith("blocked:") ? mark.slice("blocked:".length) : undefined,
      rules: carrying,
      weak: allWeak ? (carrying.some((id) => rules[id]!.strength === "secondary") ? "secondary" : "institution") : null,
    };
  });

  const regulatorName = blocks.regulatorNames[String(record.regulator.value)] ?? String(record.regulator.value);
  const provenance = { rules, terms: data.termsById, dimensions: data.dimensionNames, today, rulesOf: { name: data.name, href: `/rules#${Object.values(rules)[0]?.il_finance_file.replace(/\.md$/, "") ?? ""}` } };
  const cp = { figure };

  return (
    <GoalsProvider presets={data.goal.presets as Presets}>
    <PageShell current="guide" data={provenance}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={copy.sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-section">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/guide", label: guideIndex.title }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">{data.name}</h1>
            {data.lede && <p className="text-lg text-muted-foreground max-w-measure">{data.lede}</p>}
            <SavedGoalStrip variant="compact" presets={data.goal.presets as Presets} meta={data.goal.meta} today={today} />
            <NumberLegend />
          </header>

          <GuideSection id="what" title={copy.sections[0].title}>
            {content?.what(cp)}
            {data.bundle && data.initial ? (
              <Timeline bundle={data.bundle} initial={data.initial} wrapperName={data.name} ageMarker={{ ruleId: "TXG-04", figure: "age" }} lock={{ years: (record.lawful_exit.years as SiteValue | undefined) ?? null, age: record.lawful_exit.kind === "at_age" ? ((record.lawful_exit.age as SiteValue | undefined) ?? null) : null }} />
            ) : (
              <NoGraphCallout data={data} />
            )}
          </GuideSection>

          <GuideSection id="who" title={copy.sections[1].title}>
            {content?.who(cp) ?? (
              <p className="max-w-measure">
                {regulatorName}. {copy.whoLine}
              </p>
            )}
            <InstitutionChips companies={data.companies} allHref="/companies" />
          </GuideSection>

          <GuideSection id="inout" title={copy.sections[2].title}>
            <KeyValueList items={inout} />
          </GuideSection>

          <GuideSection id="cost" title={copy.sections[3].title}>
            <FeeTable fees={fees} note={provident ? copy.feeNote : copy.feeNoteOther} />
          </GuideSection>

          <GuideSection id="tax" title={copy.sections[4].title}>
            <TaxSteps steps={steps} />
            {content?.afterTax?.(cp)}
          </GuideSection>

          <div className="lg:grid lg:grid-cols-2 lg:gap-12 flex flex-col gap-section">
            <GuideSection id="risk" title={copy.sections[5].title}>
              {content?.risks(cp) ?? (
                <>
                  <p className="max-w-measure">
                    <bdi dir="ltr">{record.protection.text}</bdi>
                  </p>
                  <RulesLine ids={record.protection.rule_ids} />
                </>
              )}
            </GuideSection>
            <GuideSection id="use" title={copy.sections[6].title}>
              {content?.use(cp)}
              <RelatedProducts items={data.related} />
            </GuideSection>
          </div>

          <GuideSection id="check" title={copy.sections[7].title}>
            <DimensionChecklist rows={checklist} />
          </GuideSection>

          <GuideSection id="terms" title={copy.sections[8].title}>
            <p className="text-sm text-muted-foreground">{copy.termsLine}</p>
            <TermTable terms={data.terms.filter((x) => x.wrapperIds.length < data.wrapperCount)} />
            {data.terms.some((x) => x.wrapperIds.length >= data.wrapperCount) && (
              <Disclosure label={<span className="font-medium">{copy.generalTermsLabel}</span>} className="flex flex-col gap-2" summaryClassName="min-h-12">
                <p className="text-sm text-muted-foreground">{copy.generalTermsLine}</p>
                <TermTable terms={data.terms.filter((x) => x.wrapperIds.length >= data.wrapperCount)} />
              </Disclosure>
            )}
          </GuideSection>
        </div>
      </div>
    </PageShell>
    </GoalsProvider>
  );
}

export { Link };

/** In place of the graph card when the run cannot happen: a pending formula with its release, or the data not yet collected. */
function NoGraphCallout({ data }: { data: ReturnType<typeof useLoaderData<typeof loader>> }) {
  const n = data.noGraph;
  const c = blocks.noGraph;
  if (!n) return null;
  if (n.kind === "pending") {
    return (
      <Callout tone="caution" className="max-w-measure">
        {n.formulas.map((f) => (
          <span key={f} className="block">
            {blocks.taxSteps[f]?.headline ?? f}: {blocks.notComputed.text}
            {data.pendingFormulas[f] && (
              <>
                {" · "}
                {blocks.notComputed.releaseBefore} <bdi dir="ltr">{data.pendingFormulas[f]}</bdi>
              </>
            )}
          </span>
        ))}
      </Callout>
    );
  }
  if (n.kind === "missing") {
    const parts = n.parts.map((p) => (c.parts as Record<string, string>)[p] ?? c.parts.other);
    return (
      <Callout tone="caution" className="max-w-measure">
        {c.missingBefore}
        {[...new Set(parts)].join(" ול")} {c.missingAfter}
      </Callout>
    );
  }
  return (
    <Callout tone="caution" className="max-w-measure">
      {c.unknownCause}
      {n.kind === "stops" && n.code && (
        <>
          {" "}
          <bdi dir="ltr">{n.code}</bdi>
        </>
      )}
    </Callout>
  );
}
