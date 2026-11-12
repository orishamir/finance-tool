// Screen 1: the product guide page (design-spec 2).
import type { ReactNode } from "react";
import { guidePath, rulesPath, trackBrowserPath } from "../lib/site-paths";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/guide";
import { formulaNames, guideBlocks as blocks, guide as copy, guideIndex, pagePreview, scopeWords } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { ExposureLinks, FeeTable, GuideSection, InstitutionChips, RelatedProducts, RuleRows, GuideFrame, GuideHeader, TaxSteps, useCurrentSection, type FeeRow, type GlanceItem, type RuleRowItem, type TaxStep } from "../components/guide/sections";
import { IdRef, Num, NumberLegend, ReadingTag, RulesLine, StrengthLabel, VariesByCompany } from "../components/provenance";
import { PageShell } from "../components/shell";
import { WorthKnowing, worthRows } from "../components/guide/worth-knowing";
import { Timeline } from "../components/timeline/Timeline";
import { hasSignatureVisual, SignatureFrame, signatureTitle } from "../components/guide-signature";
import { accountWorthRow } from "../components/guide-signature/current-account";
import { cashLikeIds, lumpSumIds } from "../lib/guide-signature";
import { gershayim, Sentence, TextLink } from "../components/kit";
import { fmt } from "../lib/format";
import { trackProductIds } from "../lib/track-browser";
import { omitsSection, sectionTitle, withdrawalRules } from "../lib/guide-nav";
import { useInputs } from "../lib/inputs";
import { exitRateLines, exitStepMark, type ExitRate } from "../lib/exit-step";
import { guideContent } from "../content/guide";
import { anyDoubt, anyWeak, ruleFigure, type SiteValue } from "../lib/value";
import { generalOnly, isGeneral } from "../lib/scope";

const providentIds = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident", "ira-provident", "ira-hishtalmut"];
const isProvidentFamily = (id: string) => providentIds.includes(id);

export async function loader({ params }: Route.LoaderArgs) {
  const { buildGuidePage } = await import("../lib/guide.server");
  const content = guideContent[params.id];
  const data = buildGuidePage(params.id, content ? [...(content.switchRules ?? [])] : [], content ? [...content.termIds] : [], content?.relatedIds);
  if (!data) throw new Response("Not found", { status: 404 });
  // the pinned facts of this wrapper (P-09 guide_blocks); their rules join the page's provenance data
  const { loadPinnedRules, loadProducts, loadRules, pointedWithFlagSlots } = await import("../lib/data.server");
  const worthIds = loadPinnedRules().guide_blocks?.[params.id] ?? [];
  const allRules = loadRules();
  const rules = { ...data.rules };
  for (const id of [...worthIds, ...withdrawalRules(params.id)]) if (!rules[id] && allRules[id]) rules[id] = allRules[id]!;
  // the records the cards point at, the pinned facts' too, and those the run flags' words read travel beside the page's own rules (only
  // chips, cards and the flags read them)
  // the fee page takes a deal of every product whose record lists a fee base (method §10.6)
  const feePage = loadProducts().some((p) => p.id === params.id && p.fee_bases_allowed.length > 0);
  return { ...data, rules, pointed: pointedWithFlagSlots(rules, allRules), worthIds, feePage };
}

export function meta({ loaderData: data, location }: Route.MetaArgs) {
  const name = data?.name ? gershayim(data.name) : guideIndex.title;
  return pageMeta({ title: name, description: data?.lede ?? pagePreview.guide(name), location });
}

export default function GuidePage() {
  const data = useLoaderData<typeof loader>();
  const { record, rules, today } = data;
  const content = guideContent[record.id];
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const { state: inputsState } = useInputs();
  const title = (id: string) => sectionTitle(record.id, id);
  const omitted = (id: string) => omitsSection(record.id, id);
  const figure = (ruleId: string, name: string): SiteValue | null => (rules[ruleId] ? ruleFigure(rules[ruleId]!, name, today) : null);
  // a guide is a product context (D30): every list of rules on it holds general rules only; a company's own term is on its page
  const gen = (ids: readonly string[]) => generalOnly(ids, rules);
  const strengthOfRules = (ids: readonly string[]) => (ids.map((id) => rules[id]?.strength).some((s) => s === "institution") ? "institution" : ids.map((id) => rules[id]?.strength).some((s) => s === "secondary") ? "secondary" : null);
  const weakTag = (ids: readonly string[]) => {
    const s = strengthOfRules(ids);
    return s ? <StrengthLabel strength={s} /> : undefined;
  };

  const cp = { figure, breakTerms: data.breakTerms };

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
  // the rules the record's sentence cites join the fact's own, so its detail is read in their cards
  const exitTextRules = exit.kind === "any_time" ? [] : data.exitTextRules.filter((id) => isGeneral(rules[id]));
  const exitItem = (): RuleRowItem => {
    const v = exitValue();
    return {
      id: "withdraw",
      label: lockUp ? blocks.exit.labelFree : blocks.exit.labelWithdraw,
      value: v.value,
      rules: [...new Set([...v.rules, ...exitTextRules])],
    };
  };
  const inout: RuleRowItem[] = [];
  if (lockUp && !content?.omitFreeRow) inout.push(exitItem());
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
          {blocks.ceiling.taxYear} <bdi dir="ltr">{amount.tax_year}</bdi>
        </span>
      ) : undefined,
    });
  }
  if (!lockUp) inout.push(exitItem());
  if (exit.payout_business_days) {
    const days = exit.payout_business_days as SiteValue;
    // D30: a payout time that is one company's own (its rule is that company's record) is shown named, never as the product's
    const dayRule = days.rule_ids?.[0] ? (rules[days.rule_ids[0]] as { strength?: string; sources?: { url: string; publisher_he?: string }[] } | undefined) : undefined;
    const onlyAt = days.source.strength === "institution" && dayRule?.strength === "institution" ? dayRule.sources?.find((s) => s.url === days.source.url)?.publisher_he : undefined;
    inout.push({
      id: "days",
      label: blocks.exit.labelDays,
      value: (
        <>
          {blocks.exit.upTo} <Num value={days} /> {blocks.exit.businessDays}
        </>
      ),
      rules: days.rule_ids ?? [],
      lead: onlyAt ? <span>{blocks.exit.onlyAt.before} {onlyAt}{blocks.exit.onlyAt.after}</span> : undefined,
    });
  }
  // the same three rows on every guide they apply to
  if (withdrawalRules(record.id).includes("PF-46")) inout.push({ id: "days-count", label: blocks.withdrawal.daysCount.label, value: blocks.withdrawal.daysCount.value, rules: ["PF-46"] });
  const messageCeiling = withdrawalRules(record.id).includes("PF-45") ? figure("PF-45", "digital_message_ceiling") : null;
  if (messageCeiling) inout.push({ id: "unlawful", label: blocks.withdrawal.unlawful.label, value: <>{blocks.withdrawal.unlawful.before} <Num value={messageCeiling} display={fmt.nisWhole(Number(messageCeiling.value))} />{blocks.withdrawal.unlawful.after}</>, rules: ["PF-45"] });
  const lowOne = withdrawalRules(record.id).includes("TXP-18") ? figure("TXP-18", "low_income_one") : null;
  const lowDouble = lowOne ? figure("TXP-18", "low_income_double") : null;
  if (lowOne && lowDouble) inout.push({ id: "low-income", label: blocks.withdrawal.lowIncome.label, value: <>{blocks.withdrawal.lowIncome.before} <Num value={lowOne} /> {blocks.withdrawal.lowIncome.one} <Num value={lowDouble} /> {blocks.withdrawal.lowIncome.after}</>, rules: ["TXP-18"] });
  if (content?.switchLine && record.switch_is_tax_event.value === false) {
    inout.push({ id: "switch", label: blocks.exit.labelSwitch, value: typeof content.switchLine === "function" ? content.switchLine(cp) : content.switchLine, rules: [...(record.switch_is_tax_event.rule_ids ?? []), ...(content.switchRules ?? []).filter((r) => !(record.switch_is_tax_event.rule_ids ?? []).includes(r))] });
  }
  inout.push(...(content?.inoutRows?.(cp) ?? []));

  for (const it of inout) it.rules = gen(it.rules);
  // where each company sets a fee, the record's company_terms name the companies' own terms under the checklist dimension of that fee
  const feeDimension: Record<string, string> = { balance: "fee-management-balance", deposit: "fee-deposit", trade: "fee-trade", custody: "fee-custody", fx: "fee-fx", fixed_period: "fee-account", exit: "fee-exit" };
  const feeVaries = (base: string) => {
    const ids = record.company_terms?.[feeDimension[base] ?? ""] ?? [];
    return ids.length > 0 ? <VariesByCompany ids={ids} lead={scopeWords.variesExamples} size="xs" /> : undefined;
  };

  // ---- what each company sets for itself (D30): the fee table says it for its own fees; the rest, with the general rules on the same property, sit under "who offers it" (D49)
  const companyTerms = (): RuleRowItem[] =>
    Object.entries(record.company_terms ?? {})
      .filter(([dim, ids]) => ids.length > 0 && !content?.omitCompanyTerms?.includes(dim) && !(!omitted("cost") && fees.some((f) => feeDimension[f.id] === dim)))
      .map(([dim, ids]) => ({ id: dim, label: copy.companyTermTitles[record.id]?.[dim] ?? data.dimensionNames[dim] ?? feeCopy[Object.keys(feeDimension).find((b) => feeDimension[b] === dim) ?? ""]?.name ?? dim, value: <VariesByCompany ids={ids} lead={scopeWords.variesExamples} size="xs" />, rules: Object.values(rules).filter((r) => isGeneral(r) && r.dimensions.includes(dim)).map((r) => r.id) }));

  // F-105: on a provident guide with several managers' lists collected, each fee says how many write only the cap (under the cap), and the
  // note under the table says once, for both fees, the lowest rates the others write, what kind they are and how long a discount lasts
  // (the same paragraph under each fee read as copy-pasted; D83)
  // the same count on both fees is said once, in the note (the line under each fee read as repeated)
  const sameCount = !!data.listRange?.balance && !!data.listRange?.deposit && data.listRange.balance.atCap.value === data.listRange.deposit.atCap.value && data.listRange.balance.managers.value === data.listRange.deposit.managers.value;
  const listRangeLine = (base: string): ReactNode => {
    const r = data.listRange?.[base as "balance" | "deposit"];
    if (!r || sameCount) return undefined;
    return (
      <>
        {copy.listRange.before} <Num value={r.atCap} /> {copy.listRange.of} <Num value={r.managers} /> {copy.listRange.managers}
      </>
    );
  };
  const listRangeNote = (): ReactNode => {
    const n = copy.listRange.note;
    const both = data.listRange?.balance;
    const lows = (["balance", "deposit"] as const).flatMap((base) => {
      const r = data.listRange?.[base];
      return r && r.atCap.value !== r.managers.value ? [{ base, r }] : [];
    });
    const discount = lows.find((l) => l.r.lowKind === "discount")?.r.discountYears;
    // one kind for every low is said once, at the end; different kinds each after its own rate
    const oneKind = lows.every((l) => l.r.lowKind === lows[0]?.r.lowKind) ? n.kind[lows[0]?.r.lowKind ?? "plain"] : null;
    return (
      <>
        {copy.feeNoteParts.caps}{" "}
        {sameCount && both && (
          <>
            {n.atCapBoth.before} <Num value={both.atCap} /> {n.atCapBoth.of} <Num value={both.managers} /> {n.atCapBoth.after}{" "}
          </>
        )}
        {n.agreement}
        {lows.length > 0 && (
          <>
            {" "}
            {n.others}{" "}
            {lows.map(({ base, r }, i) => (
              <span key={base}>
                {i > 0 && " "}
                <Num value={r.low} prefix={i > 0 ? n.and : undefined} /> {n[base]}
                {oneKind === null && n.kind[r.lowKind] ? ` ${n.kind[r.lowKind]}` : ""}
              </span>
            ))}
            {oneKind ? `, ${oneKind}.` : "."}
            {discount && (
              <>
                {" "}
                {n.discountFor} <Num value={discount} display={typeof discount.value === "number" ? fmt.years(discount.value) : undefined} /> {n.discountFrom}{" "}
                {n.lumpSum.before} <IdRef id="PF OQ18" end={n.lumpSum.after} /> {n.discountEnd}
              </>
            )}
          </>
        )}{" "}
        {copy.feeNoteParts.companyPage}
      </>
    );
  };

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
      // the note under the table says how long a discount lasts and when it can end earlier (D83): its rules sit on the fee's row
      rules: gen([...(cap?.rule_ids ?? []), ...(data.listRange?.[base as "balance" | "deposit"]?.lowKind === "discount" ? ["PF-13", "PF-14"] : [])]),
      varies: feeVaries(base),
      range: listRangeLine(base),
    });
  }
  if (record.fee_bases_allowed.includes("direct_expenses")) fees.push({ id: "direct", name: blocks.fees.direct_expenses.name, base: blocks.fees.direct_expenses.base, cap: blocks.fees.direct_expenses.cap, rules: ["PF-10"] });
  // "no exit fee" is the law's (PF-01); the payout-time rule no longer lends it its rules or its strength tag
  if (provident && !record.fee_bases_allowed.includes("exit")) fees.push({ id: "exit", name: blocks.fees.exit.name, base: blocks.fees.exit.base, cap: blocks.fees.exit.cap, rules: ["PF-01"], tag: weakTag(["PF-01"]) });


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
  // a formula with no sentence of its own shows its Hebrew name, the code after it
  const formulaHeadline = (formula: string): ReactNode => (
    <>
      {formulaNames[formula] ?? formulaNames._other} <bdi dir="ltr" className="text-xs text-muted-foreground">{formula}</bdi>
    </>
  );
  const plainStep = (id: string, when: string, step: { formula: string; rule_ids: string[] }): TaxStep => ({
    id,
    when,
    headline: stepCopy(step.formula)?.headline ?? formulaHeadline(step.formula),
    // a line that says moving is not taxed shows only where the record knows it (child savings' bank route does not, TXK OQ1)
    text: pendingLine(step.formula) ?? (record.switch_is_tax_event?.value !== false ? stepCopy(step.formula)?.textSwitchOpen : undefined) ?? stepCopy(step.formula)?.text ?? "",
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
  const exitFigure = exitFormula === "F-44" ? figure("TXK-06", "rate") : exitFormula === "F-46" ? figure("TXH-09", "lock_years") : null;
  // the step's mark: a cited rule's own strength, or a rate the step shows whose source is weaker than its rule; else a rate that is
  // the site's reading (the child-savings bank route's rates are the Ordinance's, but no official text says they reach it, TXK-29)
  const exitMark = exitStepMark(strengthOfRules(record.tax_at_exit.rule_ids), rateLines);
  // the study fund's deposit row depends on employment: an employee's own deposit has no deduction (TXH-04) and the
  // employer's within the limits is not income at deposit (TXH-01, TXH-03); the self-employed deduct up to a ceiling (TXH-05)
  const hd = copy.hishtalmutDeposit;
  const deductionPct = figure("TXH-05", "deduction_pct");
  const deductionCeiling = figure("TXH-05", "income_ceiling");
  const selfText = (
    <>
      {hd.selfEmployed.before} {deductionPct ? <Num value={deductionPct} /> : null} {hd.selfEmployed.middle} {deductionCeiling ? <Num value={deductionCeiling} display={fmt.nisWhole(Number(deductionCeiling.value))} /> : null} {hd.selfEmployed.after}
    </>
  );
  const hishtalmutDeposit = (employment: "employee" | "self-employed" | null): TaxStep => {
    const own = { id: "deposit", when: copy.taxSteps.deposit };
    if (employment === "employee") return { ...own, headline: hd.employee.headline, text: hd.employee.text, rules: ["TXH-04", "TXH-01", "TXH-03"] };
    if (employment === "self-employed") return { ...own, headline: hd.selfEmployed.headline, text: selfText, rules: ["TXH-05"] };
    return {
      ...own,
      headline: hd.unknown.headline,
      text: (
        <span className="flex flex-col gap-1">
          <span>
            {hd.unknown.employee} {hd.employeeShort}
          </span>
          <span>
            {hd.unknown.selfEmployed} {selfText}
          </span>
        </span>
      ),
      rules: ["TXH-04", "TXH-01", "TXH-03", "TXH-05"],
    };
  };
  const byEmployment = record.id === "keren-hishtalmut" && record.deposit_side_tax.formula === "F-33" && ["TXH-04", "TXH-01", "TXH-03", "TXH-05"].every((r) => rules[r]);
  const steps: TaxStep[] = [
    byEmployment ? hishtalmutDeposit(inputsState.employment) : plainStep("deposit", copy.taxSteps.deposit, record.deposit_side_tax),
    // the list above already says moving between tracks is not taxed (F-27's line), so a page that asks does not repeat it here
    content?.omitSwitchInTax && record.tax_during.formula === "F-27" && record.switch_is_tax_event?.value === false && data.pendingFormulas["F-27"] === undefined
      ? { ...plainStep("during", copy.taxSteps.during, record.tax_during), text: "" }
      : plainStep("during", copy.taxSteps.during, record.tax_during),
    {
      id: "exit",
      when: copy.taxSteps.exit,
      headline:
        exitStepCopy && exitFigure && "before" in exitStepCopy ? (
          <>
            {exitStepCopy.before} <Num value={exitFigure} /> {exitStepCopy.after}
          </>
        ) : (
          exitStepCopy?.headline ?? formulaHeadline(exitFormula)
        ),
      text: pendingLine(exitFormula) ?? exitStepCopy?.text ?? "",
      tag: exitMark === "reading" ? <ReadingTag /> : exitMark ? <StrengthLabel strength={exitMark} /> : undefined,
      alt:
        rateLines.length > 0 ? (
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
  for (const st of steps) st.rules = gen(st.rules);

  const regulatorName = blocks.regulatorNames[String(record.regulator.value)] ?? String(record.regulator.value);
  const provenance = { rules, pointed: data.pointed, terms: data.termsById, dimensions: data.dimensionNames, today, rulesOf: { name: data.name, href: rulesPath({ product: record.id }) } }; // the rules page's product filter: the old `#<file>` anchor stopped existing when groups became `<shelf>-<file>`
  const signature = hasSignatureVisual(record.id, data.signature) ? data.signature : null;
  // the current account starts from the rate most of the collected banks publish (F-85), and says how many do
  const common = record.id === "current-account" && signature?.facts.commonCount && signature.facts.bankCount ? { count: signature.facts.commonCount, of: signature.facts.bankCount } : null;
  const cash = cashLikeIds.includes(record.id) ? { id: record.id, published: !!data.bundle?.feeValues.balanceCeiling || ["bank-deposit", "savings-plan", "current-account"].includes(record.id), common } : null;
  // a fact the site computes from the collected records, listed with the pinned rules
  const worthFacts = signature && record.id === "current-account" ? [accountWorthRow(signature)].filter((r) => r !== null) : [];
  const timelineNode =
    data.bundle && data.initial ? (
      <Timeline bundle={data.bundle} initial={data.initial} wrapperName={data.name} ageMarker={{ ruleId: "TXG-04", figure: "age" }} lock={{ years: (record.lawful_exit.years as SiteValue | undefined) ?? null, age: record.lawful_exit.kind === "at_age" ? ((record.lawful_exit.age as SiteValue | undefined) ?? null) : null }} employment={byEmployment} cash={cash} lumpSum={lumpSumIds.includes(record.id) ? { note: content?.lumpNote ?? null } : null} />
    ) : null;

  // the header's card: when the money is free, the deposit ceiling, the tax on the way out and the first fee, each as its section states it
  const glance: GlanceItem[] = [];
  if (!omitted("inout")) for (const id of ["withdraw", "ceiling"]) for (const it of inout.filter((x) => x.id === id)) glance.push({ id, label: it.label, value: it.value });
  const exitStep = steps.find((x) => x.id === "exit");
  if (!omitted("tax") && exitStep) glance.push({ id: "tax", label: <>{title("tax")}, {exitStep.when}</>, value: exitStep.headline });
  if (!omitted("cost") && fees[0]) glance.push({ id: "cost", label: fees[0].name, value: fees[0].cap });

  const links = (
    <>
      <RelatedProducts items={data.related} />
      <RelatedProducts items={data.securities} label={copy.securitiesRow} />
      <ExposureLinks items={data.exposures} />
    </>
  );

  return (
    <PageShell current="guide" data={provenance}>
      <GuideFrame
        foot={<NumberLegend term institution={anyWeak([...Object.values(data.bundle?.feeValues ?? {}), ...Object.values(signature?.facts ?? {}), ...(signature?.banks ?? []).flatMap((b) => [b.rate, b.ceiling])])} doubt={anyDoubt((signature?.banks ?? []).map((b) => b.rate))} />}
        sections={copy.sections.filter((x) => !omitted(x.id) && ((x.id as string) !== "worth" || worthRows(data.worthIds, rules, today).length > 0 || worthFacts.length > 0) && ((x.id as string) !== "different" || !!signature)).map((x) => ({ ...x, title: title(x.id) }))} current={current}>
        <GuideHeader title={gershayim(data.name)} lede={data.lede && gershayim(data.lede)} glance={glance}>
          {data.heldIn && (
            <div className="flex flex-col gap-1 max-w-measure">
              <Sentence
                tone="muted"
                t={copy.heldIn}
                vars={{
                  account: (
                    <TextLink to={guidePath(data.heldIn.id)}>
                      {data.heldIn.name}
                    </TextLink>
                  ),
                }}
              />
              <RulesLine ids={gen(data.heldIn.ruleIds)} />
            </div>
          )}
        </GuideHeader>

        <GuideSection id="what" title={title("what")}>
          {content?.what(cp)}
          {/* D29: a page with a visual folds the timeline under it; without one it stays here */}
          {!signature && timelineNode && <div data-wide>{timelineNode}</div>}
          {omitted("use") && links}
        </GuideSection>

        {/* who it is for sits directly under what it is */}
        {!omitted("use") && (
          <GuideSection id="use" title={title("use")}>
            {content?.use?.(cp)}
            {links}
          </GuideSection>
        )}

        {signature && (
          <GuideSection id="different" title={copy.sectionTitles[record.id]?.different ?? signatureTitle(record.id)}>
            <SignatureFrame id={record.id} data={signature} today={today} timeline={timelineNode} />
          </GuideSection>
        )}

        <WorthKnowing rows={worthRows(data.worthIds, rules, today)} facts={worthFacts} />

        {!omitted("who") && (
          <GuideSection id="who" title={title("who")}>
            {content?.who?.(cp) ?? (
              <p className="max-w-measure">
                {regulatorName}. {copy.whoLine}
              </p>
            )}
            {companyTerms().length > 0 && <RuleRows items={companyTerms()} />}
            <InstitutionChips companies={data.companies} open={content?.companiesOpen} allHref="/companies" tracks={trackProductIds.includes(record.id) ? { href: trackBrowserPath(record.id), name: data.name } : undefined} />
          </GuideSection>
        )}

        {!omitted("inout") && (
          <GuideSection id="inout" title={title("inout")}>
            <RuleRows items={inout} />
          </GuideSection>
        )}

        {!omitted("cost") && (
          <GuideSection id="cost" title={title("cost")}>
            <FeeTable
              fees={fees}
              feePage={data.feePage}
              note={
                data.feeRange ? (
                  <>
                    {copy.feeRange.caps}<Num value={data.feeRange.tracks} /> {copy.feeRange.tracks} <Num value={data.feeRange.low} /> {copy.feeRange.to} <Num value={data.feeRange.high} /> {copy.feeRange.reported}
                  </>
                ) : data.listRange ? (
                  listRangeNote()
                ) : provident ? (
                  copy.feeNote
                ) : (
                  copy.feeNoteOther
                )
              }
            />
          </GuideSection>
        )}

        {!omitted("tax") && (
          <GuideSection id="tax" title={title("tax")}>
            <TaxSteps steps={steps} />
            {content?.afterTax?.(cp)}
          </GuideSection>
        )}

        <GuideSection id="risk" title={title("risk")}>
          {content?.risks(cp) ?? (
            <>
              <p className="max-w-measure">
                <bdi dir="ltr">{record.protection.text}</bdi>
              </p>
              <RulesLine ids={gen(record.protection.rule_ids)} />
            </>
          )}
        </GuideSection>

      </GuideFrame>
    </PageShell>
  );
}


