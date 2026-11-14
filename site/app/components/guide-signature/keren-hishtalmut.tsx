// Study fund (D29, D50): the money's story. A strip of twelve years, and under it the year picked, step by step: what the
// person deposited, what the employer added (a self-employed person: the tax back), what the return added after fees, what tax took, what is left.
// An employee's fund stands alone, since no other place receives the employer's money (B2); a self-employed person's stands beside the same outlay
// in a securities account, which is a choice they really have. Every figure is an engine run on the person's own values (F-96).
import { useMemo, useState } from "react";
import { trackPath } from "../../lib/site-paths";
import { guideSignature as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { fact } from "../../lib/guide-signature";
import { earlySettlement, type EarlySettlement } from "@finance-tool/engine";
import { studyRange, studyStanding, studyYears, taxedAfterLock, type Employment, type StudyStanding, type StudyStoryCase } from "../../lib/guide-signature-g2";
import { p05Number, p05Range, p05Value, type Bundle } from "../../lib/engine";
import { useInputs } from "../../lib/inputs";
import { asField, computed, differenceOf, type SiteValue } from "../../lib/value";
import { aboveZeroCheck, DotLine, gershayim, InputSlot, LongestCase, MixedName, NumberField, PercentField, PileBar, PileYears, SegmentedControl, Sentence, StatRow, StatTile, TextLink, clamp, cx, percentCheck, type PileBarPart } from "../kit";
import { Num, ReadingTag, RulesLine, Term } from "../provenance";
import { text } from "./g2-parts";
import { figure, Gap, inputSite, notFeeFlag, rulesOfBundle, SigAmountField, termInputs, useSigInputs, typed, type VisualProps } from "./kit";

const YEARS = 12;
const story = copy.hishtalmut.story;

export function KerenHishtalmutVisual(props: VisualProps) {
  const base = props.data.bundles["keren-hishtalmut"];
  if (!base) return <Gap id="bundle" from="g2" />;
  return <Inner {...props} base={base} />;
}

/**
 * A part's amount with the sign its part carries, whatever the sign of the number: what is added "+54,000 ₪", what is taken "−13,970 ₪",
 * the person's own deposits none (`sign` 1, -1 or 0). On a phone-wide chart the shekel sign has no room.
 */
const partText = (sign: 1 | -1 | 0, compact: boolean) => (v: number) => {
  const n = Math.abs(v);
  if (sign === 0) return compact ? fmt.number(Math.round(n)) : fmt.nisWhole(n);
  return compact ? fmt.signedNumber(sign * n, 0) : fmt.signedNisWhole(sign * n);
};

function Inner({ data, today, base }: VisualProps & { base: Bundle }) {
  const inputs = useSigInputs(base);
  const { state, setEmployment } = useInputs();
  // the page's own values and the site's example, never the saved goal
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
  const shownYear = fmt.years(year);

  const ownMonthly = isEmployee ? (income * ownShare) / 100 : inputs.monthly;
  const employerMonthly = isEmployee ? (income * employerShare) / 100 : 0;
  const plan = useMemo<StudyStoryCase>(() => ({ employment, income, ownMonthly, employerMonthly, returnPct, feePct: feePick }), [employment, income, ownMonthly, employerMonthly, returnPct, feePick]);
  const years = useMemo(() => studyYears(data, plan, YEARS), [data, plan]);
  const range = useMemo(() => studyRange(data, plan, year), [data, plan, year]);
  const slices = useMemo(() => years.map((y) => y.slice), [years]);
  const standing = useMemo(() => studyStanding(data, plan, years), [data, plan, years]);
  const picked = years[year - 1]!;
  const early = useMemo(() => (isEmployee ? earlySettlement(picked.runs) : null), [isEmployee, picked]);
  const slice = picked.slice;
  const overLimit = taxedAfterLock(years, lock);

  // ---- value objects
  // a field's default, like what the reader types in it, is a plain number
  const returnIn: SiteValue = returnPick !== null ? typed(returnPick, "pct_per_year", today, story.fields.ret) : asField(p05Value(base.p05, "A-01"));
  const incomeIn: SiteValue = incomePick !== null ? typed(income, "nis", today, copy.hishtalmut.incomeAbout) : asField(figure(income, "nis", "F-67", { [copy.hishtalmut.incomeAnnual]: p05Value(base.p05, "annual_income") }, today, copy.hishtalmut.incomeAbout));
  const pctIn = (pick: number | null, shared: SiteValue | undefined, value: number, about: string): SiteValue => (pick === null && shared ? shared : typed(value, "pct", today, about));
  const monthlyIn = inputSite(base, "monthly_deposit", inputs.monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  const incomeEntry = { [copy.hishtalmut.income[employment]!]: incomeIn };
  const ownShareEntry = { [story.fields.own]: pctIn(ownPick, ownPct, ownShare, story.fields.own) };
  const employerShareEntry = { [story.fields.employer]: pctIn(employerPick, employerPct, employerShare, story.fields.employer) };
  const monthlyEntry = { [copy.common.inputNames.monthly]: monthlyIn };
  const inflationEntry: Record<string, SiteValue> = inflationPct ? { [copy.common.inputNames.inflation]: inflationPct } : {};
  const deposits: Record<string, SiteValue> = { ...incomeEntry, ...(isEmployee ? { ...ownShareEntry, ...employerShareEntry } : monthlyEntry) };
  const yearEntry = { [story.yearName]: typed(year, "years", today, story.yearName) };
  // the run's inputs before the year it stops at: the deposits, the return, inflation and the balance fee
  const runIn: Record<string, SiteValue> = {
    ...deposits,
    [copy.common.inputNames.ret]: returnIn,
    ...inflationEntry,
    ...(feePick !== null ? { [story.fields.fee]: typed(feePick, "pct_per_year", today, story.fields.fee) } : trackFee ? { [copy.hishtalmut.inputNames.trackFee]: trackFee } : {}),
  };
  const common: Record<string, SiteValue> = { ...runIn, ...yearEntry };
  // the same runs stopped at the end of the lock (TXH-09), or a year before it: the year is the rule's, not the one picked
  const lockIn: Record<string, SiteValue> = { ...runIn, ...(lockYears ? { [copy.hishtalmut.inputNames.lockYears]: lockYears } : {}) };
  // what was paid in, each deposit in today's money (F-106, A-04): the monthly deposit, twelve times a year, with no return and no fee in
  // it; a self-employed person's tax back is the deduction on that deposit, at the income (reliefToday, F-96)
  const ownIn: Record<string, SiteValue> = { ...(isEmployee ? { ...incomeEntry, ...ownShareEntry } : monthlyEntry), ...yearEntry };
  const extraIn: Record<string, SiteValue> = { ...incomeEntry, ...(isEmployee ? employerShareEntry : monthlyEntry), ...yearEntry };
  // the tax paid from the salary on the employer's money above the limit: the limit stays while the salary follows prices (F-96)
  const salaryTaxIn: Record<string, SiteValue> = { ...incomeEntry, ...(isEmployee ? employerShareEntry : {}), ...inflationEntry, ...yearEntry };
  const rules = rulesOfBundle(base);
  const nis = (value: number, about: string, inputs: Record<string, SiteValue> = common) => figure(value, "nis", "F-96", inputs, today, about, rules);
  const paidValue = (value: number, about: string, inputs: Record<string, SiteValue>) => figure(value, "nis", "F-106", inputs, today, about, rules);
  // what a run qualifies travels with what comes out of it: the deposits are plain, the tax leaves the fee flags behind
  const ranValue = (value: number, about: string, isTax: boolean, formula = "F-96", inputs = common) => {
    const flags = [...new Set(picked.runs.flatMap((r) => r.flags.map((f) => f.code)))].filter(isTax ? notFeeFlag : () => true);
    return computed(value, "nis", formula, inputs, { today, about, rules, flags, labels: picked.runs.flatMap((r) => r.labels.map((l) => ({ code: l.code, ruleId: l.ruleId }))) });
  };
  // the year picked as one bar: what went in, the return before fees, and what a loss, the fees and the tax took (F-96)
  const partValue = (part: PileBarPart): SiteValue | null => {
    if (!slice) return null;
    // whole shekels that add up: the return before fees takes up the rounding, so what is shown in the bar sums to what is left (method.md F-96)
    const r = Math.round;
    const fees = r(slice.fees);
    const salary = r(slice.taxFromSalary);
    const taxAtExit = r(slice.tax) - salary;
    const before = r(slice.net) + fees + salary + taxAtExit - r(slice.own) - r(slice.extra);
    const value = { own: r(slice.own), extra: r(slice.extra), gain: before, loss: -before, fees, salary, tax: taxAtExit }[part];
    const about = { own: story.about.own, extra: isEmployee ? story.about.extra : story.about.extraSelf, gain: story.about.gain, loss: story.about.gain, fees: story.about.fee, salary: story.about.taxSalary, tax: slice.taxFromSalary > 1 ? story.about.taxWithdrawal : story.about.tax }[part];
    if (part === "own" || (part === "extra" && isEmployee)) return paidValue(value, about, part === "own" ? ownIn : extraIn);
    if (part === "extra") return nis(value, about, extraIn);
    if (part === "salary") return ranValue(value, about, true, "F-96", salaryTaxIn);
    return ranValue(value, about, part === "tax");
  };
  const SIGN: Record<PileBarPart, 1 | -1 | 0> = { own: 0, extra: 1, gain: 1, loss: -1, fees: -1, salary: -1, tax: -1 };
  const partNumber = (part: PileBarPart, compact: boolean) => {
    const v = partValue(part);
    return v && <Num value={v} display={partText(SIGN[part], compact)} />;
  };
  const leftValue = slice ? ranValue(slice.net, story.about.left, false) : null;
  const ownValue = slice ? paidValue(slice.own, story.about.own, ownIn) : null;
  // what the multiple is of: the person's deposits, and an employee's employer's too, so the employer's money is not counted as growth
  const paidShown = slice && ownValue ? (isEmployee ? { n: slice.own + slice.extra, name: story.inputs.paid, value: paidValue(slice.own + slice.extra, story.about.paid, { ...ownIn, ...extraIn }) } : { n: slice.own, name: story.bar.own, value: ownValue }) : null;

  // the choice the drawing is for: the year picked against the lock year (or, from the lock on, against the year before it)
  const yearAt = (y: number) => (y >= 1 && y <= YEARS ? (years[y - 1]?.slice ?? null) : null);
  const compareYear = year < lock ? lock : lock - 1 >= 1 ? lock - 1 : null;
  const lockSlice = yearAt(lock);
  const beforeLock = yearAt(lock - 1);
  // what waiting for the lock's end adds and saves, each its own figure: what is left above what was paid in at the lock year less the same
  // at the year picked, since the deposits of the years between are paid either way (after an early withdrawal they go on into the fund),
  // and the income tax the wait saves (F-96)
  const lockNet = lockSlice ? nis(lockSlice.net, story.about.lockNet, lockIn) : null;
  const paidIn = (s: NonNullable<typeof slice>) => s.own + s.extra;
  const waitWords =
    slice && lockSlice && lockNet && leftValue && year < lock
      ? {
          more: nis(lockSlice.net - paidIn(lockSlice) - (slice.net - paidIn(slice)), story.about.waitMore, {
            [story.inputs.lockNet]: lockNet,
            [story.inputs.lockPaid]: nis(paidIn(lockSlice), story.about.lockPaid, lockIn),
            [story.inputs.left]: leftValue,
            [story.inputs.paid]: nis(paidIn(slice), story.about.paid),
          }),
          saved: differenceOf([story.inputs.tax, ranValue(slice.tax, story.about.tax, true)], [story.inputs.lockTax, nis(lockSlice.tax, story.about.lockTax, lockIn)], "F-96", { today, about: story.about.taxSaved }),
          at: lockNet,
        }
      : null;
  // what waiting adds can be below zero, when the return over the years waited is below rising prices and the fees: then it is "less"
  const waitGains = !!waitWords && Number(waitWords.more.value) >= 0;
  const head = story.head;
  const lockYearsWords = <bdi>{fmt.years(lock)}</bdi>;
  const secondCard = !slice
    ? null
    : year < lock
      ? waitWords && (
          <StatTile label={<>{head.wait} {lockYearsWords}</>} size="figure" note={<span className={waitGains ? "text-gain" : undefined}>{waitGains ? head.more.before : head.more.less} <Num value={waitWords.more} display={(v) => fmt.nisWhole(Math.abs(Number(v)))} />{head.more.middle} <Num value={waitWords.saved} display={fmt.nisWhole} />{head.more.after}</span>}>
            <Num value={waitWords.at} display={fmt.nisWhole} />
          </StatTile>
        )
      : slice.tax < 1
        ? (
            <StatTile label={<>{head.taxAt} <bdi>{shownYear}</bdi></>} size="figure" note={beforeLock && beforeLock.tax >= 1 && <span>{head.wasBefore.before} <bdi>{fmt.years(lock - 1)}</bdi> {head.wasBefore.after} <Num value={nis(beforeLock.tax, story.about.taxBefore, lockIn)} display={fmt.nisWhole} />.</span>}>
              <Num value={ranValue(slice.tax, story.about.tax, true)} display={fmt.nisWhole} />
            </StatTile>
          )
        : (
            <StatTile label={<>{head.taxAt} <bdi>{shownYear}</bdi></>} size="figure" note={<span>{head.taxStays.before} {lockYearsWords}{head.taxStays.after}</span>}>
              <Num value={ranValue(slice.tax, story.about.tax, true)} display={fmt.nisWhole} />
            </StatTile>
          );
  const stripNote = waitWords && (
    <>
      <div>
        {story.note.wait} <bdi>{fmt.years(lock - year)}</bdi>: <span className={cx("font-semibold", waitGains && "text-gain")}><Num value={waitWords.more} display={(v) => fmt.nisWhole(Math.abs(Number(v)))} /></span> {waitGains ? story.note.more : story.note.less}
      </div>
      <div>
        <Num value={waitWords.saved} display={fmt.nisWhole} /> {story.note.saved}
      </div>
    </>
  );

  const brokerCount = fact(data, "brokerCount");
  const trackName = text(data, "trackName");
  const trackNumber = text(data, "trackNumber");
  const trackCompany = text(data, "trackCompany");
  const fundName = text(data, "fundName");
  const fundNumber = text(data, "fundNumber");
  const brokerName = text(data, "brokerName");

  const feeHint = trackName && (
    <>
      {story.hints.fee.before} <Term id="דמי ניהול">{story.hints.fee.fee}</Term> {story.hints.fee.middle} ״{trackCompany ? <TextLink to={trackPath(trackCompany, trackNumber)}><MixedName>{trackName}</MixedName></TextLink> : <MixedName>{trackName}</MixedName>}״ ({story.hints.fee.number} <bdi dir="ltr">{trackNumber}</bdi>){story.hints.fee.after}
    </>
  );
  // ---- the reader's own values, not the rule: that is in the guide's text above
  const lockWords = lockYears && <Num value={lockYears} display={fmt.years(lock)} />;
  // F-97 stands the deposits against the limit: an employee's share of the salary up to the ceiling (TXH-02, which counts only above it),
  // a self-employed person's yearly benefited amount (TXH-08); the year a deposit crosses it also rests on inflation, since the deposits
  // rise with prices and the ceiling does not
  const capEntry: Record<string, SiteValue> = cap ? { [copy.hishtalmut.inputNames.cap]: cap } : {};
  const limitEntry: Record<string, SiteValue> = isEmployee ? (cap && income > Number(cap.value) ? capEntry : {}) : selfBenefited ? { [copy.hishtalmut.inputNames.selfBenefited]: selfBenefited } : {};
  const standingIn: Record<string, SiteValue> = { ...deposits, ...limitEntry };
  const crossIn: Record<string, SiteValue> = { ...deposits, ...(isEmployee ? capEntry : limitEntry), ...inflationEntry };
  const standingNum = (value: number, about: string, unit: SiteValue["unit"] = "nis", inputs = standingIn) => figure(value, unit, "F-97", inputs, today, about, rules);
  const capWords = cap && <Num value={cap} display={fmt.nisWhole} />;
  const inflationWords = inflationPct && <Num value={inflationPct} />;
  const standingLine = (st: StudyStanding, taxed: boolean, employee: boolean) => {
    const words = copy.hishtalmut.story.standing;
    const whole = (value: number, about: string) => <Num value={standingNum(value, about)} display={fmt.nisWhole(value)} />;
    const [own = 0, employer = 0] = st.over.map(Math.round);
    const over = own + employer;
    const per = st.per === "year" ? "year" : "month";
    if (over >= 1)
      return (
        <Sentence size="sm">
          {whole(over, employee ? story.about.over : story.about.overSelf)} {words.over[per]}{" "}
          {employee && own >= 1 && employer >= 1 ? (
            <>
              {words.over.lead}: {whole(own, story.about.overOwn)} {words.over.own}
              {whole(employer, story.about.overEmployer)} {words.over.employer}
            </>
          ) : employee ? (
            own >= 1 ? words.over.leadOwn : words.over.leadEmployer
          ) : (
            `${words.over.lead}.`
          )}{" "}
          {taxed ? (
            <>
              {words.over.why} {lockWords}.
            </>
          ) : (
            <>
              <Term prefix={words.over.noTax.prefix} id="תשואה">{words.over.noTax.term}</Term> {words.over.noTax.after} {lockWords}
              {words.over.noTaxWhy}
            </>
          )}
          {st.grows && (
            <>
              {" "}
              {words.over.grows} {capWords} {words.over.growsAfter}
            </>
          )}
        </Sentence>
      );
    if (st.firstOverYear !== null) {
      const yearWords = <Num value={standingNum(st.firstOverYear, story.about.crossYear, "years", crossIn)} display={String(st.firstOverYear)} />;
      return (
        <Sentence size="sm">
          {words.crossing.today}{" "}
          {employee ? (
            <>
              {words.crossing.employee} {capWords} {words.crossing.employeeRise} {inflationWords} {words.crossing.employeeThen}
              {yearWords}
            </>
          ) : (
            <>
              {words.crossing.self}
              {selfBenefited && <Num value={selfBenefited} display={fmt.nisWhole} />} {words.crossing.selfRise} {inflationWords} {words.crossing.selfThen}
              {yearWords}
            </>
          )}{" "}
          {words.crossing.part}
          {taxed ? words.crossing.taxed : "."}
          {employee && ` ${words.crossing.ifNot}`}
        </Sentence>
      );
    }
    const [ownRoom = 0, employerRoom = 0] = st.room.map(Math.round);
    if (ownRoom < 1 && employerRoom < 1) return null; // all of it is exempt at the limit: the strip says so already
    const about = employee ? story.about.room : story.about.roomSelf;
    return (
      <Sentence size="sm">
        {ownRoom >= 1 ? (
          <>
            {words.room.you} {whole(ownRoom, about)} {words.room[per]}
            {employerRoom >= 1 && (
              <>
                {" "}
                {words.room.andEmployer} {whole(employerRoom, about)}
              </>
            )}
          </>
        ) : (
          <>
            {words.room.employer} {whole(employerRoom, about)} {words.room[per]}
          </>
        )}
        , {words.room.exempt}
      </Sentence>
    );
  };
  const settlementInputs = { ...common, ...(withheld ? { [story.early.rate]: withheld } : {}) };
  const earlyLine = (e: EarlySettlement) => {
    const money = (value: number, about: string, prefix?: string) => <Num value={ranValue(value, about, true, "F-98", settlementInputs)} display={fmt.nisWhole} {...(prefix ? { prefix } : {})} />;
    // the usual case, conclusion first: the columns count the refund, so say what is left without it (guidelines/wording.md, sentences 1 and 3)
    if (e.back >= 1)
      return (
        <Sentence size="sm">
          {story.early.noClaim} {money(e.first, story.about.first)}
          {story.early.because} {money(e.withheld, story.about.withheld)} {story.early.toTax} {money(e.back, story.about.back, story.early.and)} {story.early.onlyIf}
        </Sentence>
      );
    return (
      <Sentence size="sm">
        {story.early.before} <bdi>{shownYear}</bdi>
        {story.early.first} {money(e.first, story.about.first)}
        {story.early.withheld} {money(e.withheld, story.about.withheld)}{" "}
        {e.owed >= 1 ? (
          <>
            {story.early.owedBefore} {money(e.owed, story.about.owed)}
            {story.early.owed}
          </>
        ) : (
          story.early.stop
        )}
      </Sentence>
    );
  };
  const notes = (n: { employee: boolean; st: StudyStanding | null; e: EarlySettlement | null; taxed: boolean }) => (
    <div className="flex flex-col gap-5">
      {((n.st && standingLine(n.st, n.taxed, n.employee)) || n.e) && (
        <div className="flex flex-col gap-1.5 text-sm max-w-measure">
          {n.st && standingLine(n.st, n.taxed, n.employee)}
          {n.e && earlyLine(n.e)}
          {/* F-47 taxes the whole nominal gain, its linkage part too: for an employee that part is the site's reading (TXH-13) */}
          {n.e && (
            <Sentence size="sm">
              {story.early.linkage} <ReadingTag />
            </Sentence>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground max-w-measure">
        <DotLine
          items={[
            story.assume.site,
            <>
              {n.employee ? story.assume.employee : story.assume.self}
              {inflationPct && <Num value={inflationPct} />}
              {story.assume.like}
              <Term id="אינפלציה">{story.assume.term}</Term>
            </>,
            story.assume.today,
          ]}
        />
        {!n.employee && fundName && brokerCount && (
          <p>
            {story.held.account} ״<bdi>{fundName}</bdi>״ (<bdi dir="ltr">{fundNumber}</bdi>) {story.held.tariff} <bdi>{gershayim(brokerName)}</bdi>, {story.held.pick} <Num value={brokerCount} /> {story.held.collected}
          </p>
        )}
      </div>
      <RulesLine ids={data.ruleIds} />
    </div>
  );
  // the notes follow one another and only the card keeps its size: its room is the longest notes of either kind of work, so what is under the card stays where it is
  const longest = (employee: boolean, over: StudyStanding["over"], firstOverYear: number | null): StudyStanding => ({ over, room: over.map(() => 0), per: employee ? "month" : "year", firstOverYear, grows: employee });
  // the height the notes hold while the year is dragged: only the employment shown, so an employee's card keeps no room for a self-employed line
  const notesCases = [isEmployee].flatMap((employee) =>
    [longest(employee, employee ? [99_999, 99_999] : [99_999], 1), longest(employee, employee ? [0, 0] : [0], 12)].map((st) =>
      notes({ employee, st, e: employee ? { withheld: 9_999_999, back: 9_999_999, owed: 0, first: 9_999_999 } : null, taxed: true }),
    ),
  );

  const lockText = lockWords;
  const account = range.account;
  // a self-employed person's same outlay in a securities account: that run's own plan and the tariff and fund it ran on (brokerage-account, the best tariff)
  const accountBundle = data.bundles["brokerage-account"];
  const accountIn: Record<string, SiteValue> = { ...incomeEntry, ...monthlyEntry, [copy.common.inputNames.ret]: returnIn, ...inflationEntry, ...yearEntry, ...(accountBundle ? termInputs(accountBundle) : {}) };
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
          <NumberField label={copy.hishtalmut.income[employment]!} unit="nis" value={income} start={p05Number(base.p05, "annual_income") / 12} isEntered={incomePick !== null} validate={aboveZeroCheck} onCommit={setIncomePick} onReset={() => setIncomePick(null)} disabled={!inputs.ready} />
        </div>
        {isEmployee ? (
          <>
            <PercentField unit="pct" label={story.fields.own} value={ownShare} start={Number(ownPct?.value ?? 0)} isEntered={ownPick !== null} onCommit={setOwnPick} onReset={() => setOwnPick(null)} disabled={!inputs.ready} />
            <PercentField unit="pct" label={story.fields.employer} value={employerShare} start={Number(employerPct?.value ?? 0)} isEntered={employerPick !== null} onCommit={setEmployerPick} onReset={() => setEmployerPick(null)} disabled={!inputs.ready} />
          </>
        ) : (
          <SigAmountField inputs={inputs} field="monthly" label={copy.g2.plan.monthly} />
        )}
        <PercentField label={story.fields.ret} value={returnPct} start={p05Number(base.p05, "A-01")} isEntered={returnPick !== null} validate={percentCheck(p05Range(base.p05, "sliders", "A-01") ?? { min: 0, max: 20 })} onCommit={setReturnPick} onReset={() => setReturnPick(null)} disabled={!inputs.ready} />
        <PercentField label={story.fields.fee} {...(feePick === null && feeHint ? { hint: feeHint } : {})} value={feeShown} start={Number(trackFee?.value ?? 0)} isEntered={feePick !== null} validate={percentCheck({ min: 0, max: Number(feeCap?.value ?? 100) })} onCommit={setFeePick} onReset={() => setFeePick(null)} disabled={!inputs.ready} />
      </div>

      <div className="flex flex-col gap-3">
        {slice && leftValue && ownValue && paidShown && (
          <StatRow cols={2}>
            <StatTile label={<>{head.at} <InputSlot><bdi>{shownYear}</bdi></InputSlot></>} size="figure" note={<span>{head.times.before} <Num value={figure(slice.net / paidShown.n, "count", "F-96", { [story.bar.left]: leftValue, [paidShown.name]: paidShown.value }, today, story.about.times)} display={(v) => fmt.number(Math.round(Number(v) * 10) / 10)} /> {isEmployee ? head.times.afterBoth : head.times.after} (<Num value={paidShown.value} display={fmt.nisWhole} />)</span>}>
              <Num value={leftValue} display={fmt.nisWhole} />
            </StatTile>
            {secondCard}
          </StatRow>
        )}
        <PileYears
          years={slices}
          year={year}
          onYear={setYearPick}
          lockYear={lock}
          compare={compareYear}
          axis={story.yearName}
          valueAxis={story.chartLine}
          {...(stripNote ? { note: stripNote } : {})}
          amount={(net, isPicked) => (isPicked ? fmt.number(Math.round(net / 100) / 10) : fmt.number(Math.round(net / 1000)))}
          before={
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[1px] bg-chart-pile-tax" />
              <span>
                {story.strip.before} {lockText}
                {story.strip.taxed}
              </span>
            </span>
          }
          after={<span className="text-muted-foreground">{story.strip.from}{lockText}{overLimit ? story.strip.exemptUnderLimit : story.strip.exempt}</span>}
          label={story.strip.aria}
          valueText={shownYear}
        />
        <p className="text-xs text-muted-foreground">{copy.common.drag}</p>
        <PileBar
          slice={slice && { ...slice, fees: Math.round(slice.fees), tax: Math.round(slice.tax), taxFromSalary: Math.round(slice.taxFromSalary) }}
          names={{ own: story.bar.own, extra: isEmployee ? story.bar.employer : story.bar.refund, gain: story.bar.gain, loss: story.bar.loss, fees: story.bar.fees, salary: story.bar.salary, tax: slice && slice.taxFromSalary > 1 ? story.bar.taxWithdrawal : story.bar.tax }}
          number={partNumber}
          left={{ words: story.bar.left, number: leftValue && <Num value={leftValue} display={fmt.nisWhole} /> }}
          {...(!isEmployee ? { other: { net: account?.net ?? null, words: <>{story.bar.account.before} <Term prefix={story.bar.account.prefix} id="חשבון ניירות ערך">{story.bar.account.term}</Term>{story.bar.account.after}</>, number: account && <Num value={nis(account.net, story.about.account, accountIn)} display={fmt.nisWhole} /> } } : {})}
          gap={gapWords}
          label={story.aria}
        />
      </div>

      <LongestCase cases={notesCases}>
        {notes({
          employee: isEmployee,
          st: standing,
          // whole shekels, so what enters plus what returns is exactly the column
          e: early && early.withheld >= 1 ? { ...early, first: slice ? Math.round(slice.net) - Math.round(early.back) + Math.round(early.owed) : early.first } : null,
          taxed: overLimit,
        })}
      </LongestCase>
    </div>
  );
}
