// Study fund (D29, founder 2026-11-02, D50): the money's story. A strip of twelve years, and under it the year picked, step by step: what the
// person deposited, what the employer added (a self-employed person: the tax back), what the return added after fees, what tax took, what is left.
// An employee's fund stands alone, since no other place receives the employer's money (B2); a self-employed person's stands beside the same outlay
// in a securities account, which is a choice they really have. Every figure is an engine run on the person's own values (F-96).
import { useMemo, useState } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { studyRange, studyYears, type Employment, type StudyStoryCase } from "../../lib/guide-signature-g2";
import { p05Number, p05Range, p05Value, type Bundle } from "../../lib/engine";
import { useInputs } from "../../lib/inputs";
import { computed, entered as enteredValue, type SiteValue } from "../../lib/value";
import { InputSlot, LongestCase, NumberField, PercentField, PileStory, PileYears, SegmentedControl, Sentence, clamp, percentCheck, pileFirstRow, type PileStep } from "../kit";
import { Num, RulesLine } from "../provenance";
import { G2Gap, text } from "./g2-parts";
import { figure, inputSite, notFeeFlag, rulesOfBundle, useSigInputs, type VisualProps } from "./kit";

const YEARS = 12;
const story = copy.hishtalmut.story;

export function KerenHishtalmutVisual(props: VisualProps) {
  const base = props.data.bundles["keren-hishtalmut"];
  if (!base) return <G2Gap id="bundle" />;
  return <Inner {...props} base={base} />;
}

/** "+54,000 ₪" and "−13,970 ₪"; on a phone-wide chart the shekel sign has no room. */
const signed = (plus: string, compact: boolean) => (v: number) => {
  const n = Math.round(Math.abs(v));
  return `${n === 0 ? "" : plus}${fmt.number(n)}${compact ? "" : " ₪"}`;
};

function Inner({ data, today, base }: VisualProps & { base: Bundle }) {
  const inputs = useSigInputs(base);
  const { state, setEmployment } = useInputs();
  // the page's own values and the site's example, never the saved goal (founder, 2026-10-28)
  const employment: Employment = state.employment ?? "employee";
  const isEmployee = employment === "employee";

  const lockYears = fact(data, "lockYears");
  const lock = Number(lockYears?.value ?? 6);
  const employerPct = fact(data, "employerPct");
  const ownPct = fact(data, "ownPct");
  const cap = fact(data, "determiningCap");
  const selfBenefited = fact(data, "selfBenefited");
  const inflationPct = fact(data, "inflationPct");
  const trackFee = fact(data, "trackFee");
  const withheld = fact(data, "earlyWithholding");

  const [incomePick, setIncomePick] = useState<number | null>(null);
  const [ownPick, setOwnPick] = useState<number | null>(null);
  const [employerPick, setEmployerPick] = useState<number | null>(null);
  const [returnPick, setReturnPick] = useState<number | null>(null);
  const [feePick, setFeePick] = useState<number | null>(null);
  const [yearPick, setYearPick] = useState<number | null>(null);

  const income = incomePick ?? p05Number(base.p05, "annual_income") / 12;
  const ownShare = ownPick ?? Number(ownPct?.value ?? 0);
  const employerShare = employerPick ?? Number(employerPct?.value ?? 0);
  const returnPct = returnPick ?? p05Number(base.p05, "A-01");
  const feeShown = feePick ?? Number(trackFee?.value ?? 0);
  const feeCap = fact(data, "feeCap");
  const year = clamp(yearPick ?? lock - 1, 1, YEARS);

  const ownMonthly = isEmployee ? (income * ownShare) / 100 : inputs.monthly;
  const employerMonthly = isEmployee ? (income * employerShare) / 100 : 0;
  const plan = useMemo<StudyStoryCase>(() => ({ employment, income, ownMonthly, employerMonthly, returnPct, feePct: feePick }), [employment, income, ownMonthly, employerMonthly, returnPct, feePick]);
  const years = useMemo(() => studyYears(data, plan, YEARS), [data, plan]);
  const range = useMemo(() => studyRange(data, plan, year), [data, plan, year]);
  const slices = useMemo(() => years.map((y) => y.slice), [years]);
  const picked = years[year - 1]!;
  const slice = picked.slice;
  const overLimit = years.some((y, i) => i + 1 >= lock && (y.slice?.tax ?? 0) > 1);

  // ---- value objects
  const returnIn: SiteValue = returnPick !== null ? enteredValue(returnPick, "pct_per_year", today, story.fields.ret) : p05Value(base.p05, "A-01");
  const incomeIn: SiteValue = incomePick !== null ? enteredValue(income, "nis", today, copy.hishtalmut.incomeAbout) : figure(income, "nis", "F-67", { [copy.hishtalmut.incomeAnnual]: p05Value(base.p05, "annual_income") }, today, copy.hishtalmut.incomeAbout);
  const pctIn = (pick: number | null, shared: SiteValue | undefined, value: number, about: string): SiteValue => (pick === null && shared ? shared : enteredValue(value, "pct", today, about));
  const monthlyIn = inputSite(base, "monthly_deposit", inputs.monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const common: Record<string, SiteValue> = {
    [copy.hishtalmut.income[employment]!]: incomeIn,
    ...(isEmployee ? { [story.fields.own]: pctIn(ownPick, ownPct, ownShare, story.fields.own), [story.fields.employer]: pctIn(employerPick, employerPct, employerShare, story.fields.employer) } : { [copy.common.inputNames.monthly]: monthlyIn }),
    [copy.hishtalmut.inputNames.ret]: returnIn,
    ...(inflationPct ? { [copy.hishtalmut.inputNames.inflation]: inflationPct } : {}),
    ...(feePick !== null ? { [story.fields.fee]: enteredValue(feePick, "pct_per_year", today, story.fields.fee) } : trackFee ? { [copy.hishtalmut.inputNames.trackFee]: trackFee } : {}),
    [story.yearName]: enteredValue(year, "years", today, story.yearName),
  };
  const rules = rulesOfBundle(base);
  const nis = (value: number, about: string) => figure(value, "nis", "F-96", common, today, about, rules);
  // what a run qualifies travels with what comes out of it: the deposits are plain, the tax leaves the fee flags behind
  const ranValue = (value: number, about: string, isTax: boolean) => {
    const flags = [...new Set(picked.runs.flatMap((r) => r.flags.map((f) => f.code)))].filter(isTax ? notFeeFlag : () => true);
    return computed(value, "nis", "F-96", common, { today, about, rules, flags, labels: picked.runs.flatMap((r) => r.labels.map((l) => ({ code: l.code, ruleId: l.ruleId }))) });
  };
  const stepValue = (step: PileStep): SiteValue | null => {
    if (!slice) return null;
    const value = { own: slice.own, extra: slice.extra, gain: slice.gain, tax: slice.tax, left: slice.net }[step];
    const about = step === "extra" && !isEmployee ? story.about.extraSelf : story.about[step];
    if (step === "own" || step === "extra") return nis(value, about);
    return ranValue(value, about, step === "tax");
  };
  const taxPart = (word: string, value: number, about: string) => ({ word, number: (compact: boolean) => <Num value={ranValue(value, about, true)} display={signed("", compact)} /> });
  const PLUS: Record<PileStep, string> = { own: "", extra: "+", gain: slice && slice.gain < 0 ? "−" : "+", tax: "−", left: "" };
  const stepNumber = (step: PileStep, compact: boolean) => {
    const v = stepValue(step);
    return v && <Num value={v} display={signed(PLUS[step], compact)} />;
  };

  const big: SiteValue = { ...monthlyIn, value: 9_999_999 };
  const rangeMin = fact(data, "rangeMin");
  const rangeMax = fact(data, "rangeMax");
  const rangeCount = fact(data, "rangeCount");
  const brokerCount = fact(data, "brokerCount");
  const trackName = text(data, "trackName");
  const trackNumber = text(data, "trackNumber");
  const fundName = text(data, "fundName");
  const fundNumber = text(data, "fundNumber");
  const brokerName = text(data, "brokerName");

  const subLine = (own: SiteValue, employer: SiteValue) => (
    <Sentence size="sm">
      {story.sub.lead} <Num value={own} /> {isEmployee ? story.sub.fromYou : story.sub.afterRefund}
      {isEmployee && (
        <>
          {" "}
          <Num value={employer} /> {story.sub.fromEmployer}
        </>
      )}
    </Sentence>
  );
  const fundRange = (low: SiteValue, high: SiteValue) =>
    rangeCount &&
    rangeMin &&
    rangeMax && (
      <>
        {story.range.among} <Num value={rangeCount} /> {story.range.tracks} <Num value={low} /> {story.range.atFee} <Num value={rangeMax} /> {story.range.to} <Num value={high} /> {story.range.atFee} <Num value={rangeMin} />.
      </>
    );
  const accountRange = (low: SiteValue, high: SiteValue) =>
    brokerCount && (
      <>
        {story.range.inAccount} <Num value={brokerCount} /> {story.range.tariffs} <Num value={low} /> {story.range.to} <Num value={high} />.
      </>
    );
  const rangeLine = (fund: { low: SiteValue; high: SiteValue } | null, account: { low: SiteValue; high: SiteValue } | null) => (
    <Sentence size="sm">
      {fund && fundRange(fund.low, fund.high)}
      {fund && account && " "}
      {account && accountRange(account.low, account.high)}
    </Sentence>
  );
  const limitLine = (
    <Sentence size="sm">
      {isEmployee && ownPct && employerPct && cap ? (
        <>
          {story.over.employee.before} <Num value={ownPct} /> {story.over.employee.own}
          <Num value={employerPct} /> {story.over.employee.employer} <Num value={cap} display={(n) => `${fmt.number(n)} ₪`} /> {story.over.employee.after}
        </>
      ) : (
        selfBenefited && (
          <>
            {story.over.self.before} <Num value={selfBenefited} display={(n) => `${fmt.number(n)} ₪`} /> {story.over.self.after}
          </>
        )
      )}
    </Sentence>
  );

  const trackLine = (typed: boolean) => (
    <p>
      {story.held.track} ״<bdi>{trackName}</bdi>״ (<bdi dir="ltr">{trackNumber}</bdi>), {copy.hishtalmut.trackFee} {trackFee && <Num value={trackFee} />} {copy.hishtalmut.perYearAvg}
      {typed && ` ${story.held.feeEntered}`}
    </p>
  );
  const sharesLine = <p>{isEmployee ? story.held.shares : null}</p>;

  const shownYear = fmt.years(year);
  const lockText = lockYears && <Num value={lockYears} display={fmt.years(lock)} />;
  const account = range.account;
  const accountOther = !isEmployee
    ? {
        to: account?.net ?? null,
        names: story.names.account,
        fine: story.names.accountFine,
        number: (compact: boolean) => account && <Num value={nis(account.net, story.about.account)} display={signed("", compact)} />,
      }
    : undefined;
  const gapWords = picked.gap === "self-employed-early" ? (
    <p>
      {story.selfGap.before} {lockText}
      {story.selfGap.after}
    </p>
  ) : picked.gap === "blocked" ? (
    copy.hishtalmut.gaps.blocked
  ) : (
    copy.common.gapFallback
  );

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl<Employment>
        label={copy.hishtalmut.employmentLabel}
        options={[
          { value: "employee", label: story.employment.employee },
          { value: "self-employed", label: story.employment.self },
        ]}
        value={employment}
        onChange={(e) => setEmployment(e)}
      />
      {/* the first field takes a phone's whole row, so five fields and four take the same rows */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 lg:col-span-1">
          <NumberField label={copy.hishtalmut.income[employment]!} unit="nis" value={income} isEntered={incomePick !== null} validate={(n) => (n <= 0 ? valuesCopy.errors.negative : null)} onCommit={setIncomePick} onReset={() => setIncomePick(null)} disabled={!inputs.ready} />
        </div>
        {isEmployee ? (
          <>
            <PercentField unit="pct" label={story.fields.own} value={ownShare} isEntered={ownPick !== null} onCommit={setOwnPick} onReset={() => setOwnPick(null)} disabled={!inputs.ready} />
            <PercentField unit="pct" label={story.fields.employer} value={employerShare} isEntered={employerPick !== null} onCommit={setEmployerPick} onReset={() => setEmployerPick(null)} disabled={!inputs.ready} />
          </>
        ) : (
          <NumberField label={copy.g2.plan.monthly} unit="nis" value={inputs.monthly} isEntered={inputs.source.monthly === "guide"} validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)} onCommit={inputs.setMonthly} onReset={() => inputs.setMonthly(null)} disabled={!inputs.ready} />
        )}
        <PercentField label={story.fields.ret} value={returnPct} isEntered={returnPick !== null} validate={percentCheck(p05Range(base.p05, "sliders", "A-01") ?? { min: 0, max: 20 })} onCommit={setReturnPick} onReset={() => setReturnPick(null)} disabled={!inputs.ready} />
        <PercentField label={story.fields.fee} value={feeShown} isEntered={feePick !== null} validate={percentCheck({ min: 0, max: Number(feeCap?.value ?? 100) })} onCommit={setFeePick} onReset={() => setFeePick(null)} disabled={!inputs.ready} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">
          {story.title} <InputSlot chars={7}><bdi>{shownYear}</bdi></InputSlot>
        </h3>
        <PileYears
          years={slices}
          year={year}
          onYear={setYearPick}
          lockYear={lock}
          before={<span className="text-chart-pile-tax">{story.strip.before} {lockText}{story.strip.taxed}</span>}
          after={<span className="text-muted-foreground">{story.strip.from}{lockText}{overLimit ? story.strip.exemptUnderLimit : story.strip.exempt}</span>}
          label={story.strip.aria}
          valueText={shownYear}
        />
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
        <LongestCase cases={[subLine(big, big)]}>{subLine(isEmployee ? nis(ownMonthly, story.about.ownMonthly) : monthlyIn, nis(employerMonthly, story.about.employerMonthly))}</LongestCase>
        <PileStory
          slice={slice}
          names={{ own: story.names.own, extra: isEmployee ? story.names.employer : story.names.refund, gain: slice && slice.gain < 0 ? story.names.loss : story.names.gain, tax: story.names.tax, left: story.names.left }}
          fine={{ gain: story.names.gainFine }}
          number={stepNumber}
          firstRow={pileFirstRow(slices)}
          {...(isEmployee && slice ? { taxParts: { salary: taxPart(story.names.taxSalary, slice.taxFromSalary, story.about.taxSalary), withdrawal: taxPart(story.names.taxWithdrawal, slice.tax - slice.taxFromSalary, story.about.taxWithdrawal) } } : {})}
          {...(accountOther ? { other: accountOther } : {})}
          gap={gapWords}
          label={story.aria}
        />
      </div>

      <div className="flex flex-col gap-1.5 text-sm max-w-measure">
        <LongestCase cases={[rangeLine({ low: big, high: big }, isEmployee ? null : { low: big, high: big })]}>
          {rangeLine(range.fund ? { low: nis(range.fund.low, story.about.rangeFund), high: nis(range.fund.high, story.about.rangeFund) } : null, account?.range ? { low: nis(account.range.low, story.about.rangeAccount), high: nis(account.range.high, story.about.rangeAccount) } : null)}
        </LongestCase>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground max-w-measure">
        <p>{story.stretch}</p>
        {trackName && (
          <LongestCase cases={[trackLine(true)]}>{trackLine(feePick !== null)}</LongestCase>
        )}
        {!isEmployee && fundName && brokerCount && (
          <p>
            {story.held.account} ״<bdi>{fundName}</bdi>״ (<bdi dir="ltr">{fundNumber}</bdi>) {story.held.tariff} <bdi>{brokerName}</bdi>, {story.held.pick} <Num value={brokerCount} /> {story.held.collected}
          </p>
        )}
        {/* a return the person typed is theirs, not the site's assumption */}
        {returnPick !== null ? (
          <p>
            {story.held.retEntered.before} <Num value={returnIn} /> {story.held.retEntered.middle} {inflationPct && <Num value={inflationPct} />} {story.held.retEntered.after} {copy.common.todayMoney}
          </p>
        ) : (
          <p>
            {story.held.ret} <Num value={returnIn} /> {story.held.inflation} {inflationPct && <Num value={inflationPct} />} {copy.hishtalmut.assumption.after} {copy.common.todayMoney}
          </p>
        )}
        <p>{isEmployee ? story.held.follows.employee : story.held.follows.self}</p>
        {isEmployee && withheld && (
          <p>
            {story.held.early.before} <Num value={withheld} /> {story.held.early.after}
          </p>
        )}
        {/* a deposit above a limit takes the place of the line about the limits, in the room of the longer one, so nothing moves */}
        <LongestCase cases={[limitLine, sharesLine]}>{overLimit ? limitLine : sharesLine}</LongestCase>
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}
