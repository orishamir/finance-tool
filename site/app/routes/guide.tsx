// Screen 1: the product guide page (design-spec 2).
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/guide";
import { guideBlocks as blocks, guide as copy, guideIndex, site } from "../copy";
import { DimensionChecklist, FeeTable, GuideSection, InstitutionChips, KeyValueList, RelatedProducts, SectionIndex, TaxSteps, TermTable, useCurrentSection, type ChecklistRowView, type FeeRow, type KeyValueItem, type TaxStep } from "../components/guide/sections";
import { Num, NumberLegend, RulesLine, StrengthLabel } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Timeline } from "../components/timeline/Timeline";
import { Tag } from "../components/ui";
import { guideContent } from "../content/guide";
import type { SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  const { buildGuidePage } = await import("../lib/guide.server");
  const content = guideContent[params.id];
  const data = buildGuidePage(params.id, content ? [...content.switchRules] : [], content ? [...content.termIds] : []);
  if (!data) throw new Response("Not found", { status: 404 });
  return data;
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
  const inout: KeyValueItem[] = [];
  if (record.ceiling) {
    const amount = record.ceiling.amount as SiteValue;
    inout.push({
      id: "ceiling",
      label: blocks.exit.labelCeiling,
      value: (
        <>
          <Num value={amount} /> {blocks.ceiling.perYearAll}
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
  if (record.lawful_exit.kind === "any_time") {
    inout.push({ id: "withdraw", label: blocks.exit.labelWithdraw, value: blocks.exit.anyTime, rules: record.lawful_exit.payout_business_days?.rule_ids ?? [] });
  }
  if (record.lawful_exit.payout_business_days) {
    const days = record.lawful_exit.payout_business_days as SiteValue;
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

  // ---- fees
  const fees: FeeRow[] = [];
  for (const base of ["balance", "deposit"] as const) {
    const cap = record.fee_caps[base] as SiteValue | undefined;
    if (!cap) continue;
    const c = blocks.fees[base];
    fees.push({
      id: base,
      name: c.name,
      base: c.base,
      cap: (
        <>
          {blocks.fees.upTo} <Num value={cap} /> {c.after}
        </>
      ),
      rules: cap.rule_ids ?? [],
    });
  }
  if (record.fee_bases_allowed.includes("direct_expenses")) fees.push({ id: "direct", name: blocks.fees.direct_expenses.name, base: blocks.fees.direct_expenses.base, cap: blocks.fees.direct_expenses.cap, rules: ["PF-10"] });
  if (!record.fee_bases_allowed.includes("exit")) fees.push({ id: "exit", name: blocks.fees.exit.name, base: blocks.fees.exit.base, cap: blocks.fees.exit.cap, rules: ["PF-01", ...(record.lawful_exit.payout_business_days?.rule_ids ?? [])], tag: weakTag(record.lawful_exit.payout_business_days?.rule_ids ?? []) });

  // ---- tax steps
  const stepCopy = (formula: string) => blocks.taxSteps[formula];
  const exitRate = figure("TXK-06", "rate");
  const altRate = figure("TXK-06", "nominal_rate");
  const exitCopy = stepCopy(record.tax_at_exit.formula);
  const steps: TaxStep[] = [
    { id: "deposit", when: copy.taxSteps.deposit, headline: stepCopy(record.deposit_side_tax.formula)?.headline ?? record.deposit_side_tax.formula, text: stepCopy(record.deposit_side_tax.formula)?.text ?? "", rules: record.deposit_side_tax.rule_ids },
    { id: "during", when: copy.taxSteps.during, headline: stepCopy(record.tax_during.formula)?.headline ?? record.tax_during.formula, text: stepCopy(record.tax_during.formula)?.text ?? "", rules: record.tax_during.rule_ids },
    {
      id: "exit",
      when: copy.taxSteps.exit,
      headline: exitCopy && exitRate ? (
        <>
          {exitCopy.before} <Num value={exitRate} /> {exitCopy.after}
        </>
      ) : (
        record.tax_at_exit.formula
      ),
      text: exitCopy?.text ?? "",
      tag: strengthOfRules(record.tax_at_exit.rule_ids) ? <Tag tone="caution">{exitCopy?.baseTag ?? ""}</Tag> : undefined,
      alt:
        exitCopy && altRate ? (
          <>
            {exitCopy.altBefore} <Num value={altRate} /> {exitCopy.altAfter}
          </>
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
  const provenance = { rules, terms: data.termsById, dimensions: data.dimensionNames, today, rulesOf: { name: data.name, href: `/rules#${Object.values(rules)[0]?.il_finance_file ?? ""}` } };
  const cp = { figure };

  return (
    <PageShell current="guide" data={provenance}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={copy.sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-section">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/guide", label: guideIndex.title }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">{data.name}</h1>
            {data.lede && <p className="text-lg text-muted-foreground max-w-measure">{data.lede}</p>}
            <NumberLegend />
          </header>

          <GuideSection id="what" title={copy.sections[0].title}>
            {content?.what(cp)}
            {data.bundle && data.initial && <Timeline bundle={data.bundle} initial={data.initial} wrapperName={data.name} ageMarker={{ ruleId: "TXG-04", figure: "age" }} />}
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
            <FeeTable fees={fees} note={copy.feeNote} />
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
            <TermTable terms={data.terms} />
          </GuideSection>
        </div>
      </div>
    </PageShell>
  );
}

export { Link };
