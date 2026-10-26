// Current account (D29): what money costs while it sits there. The page leads with the answer most people live with: the bank pays
// nothing, so the balance loses value at the pace of inflation (the rate most of the collected banks publish, F-85). Two lines in
// today's money, the account and a daily money-market fund, the gap between them filled, bracketed and named. The few banks that do
// pay a small rate, with conditions and on a small balance, are a folded table with a picker that redraws the account line at a
// bank's own rate (spec section 7). Figures come from engine runs of the two bundles (guide-signature.ts `currentAccountModel`).
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { p05Value } from "../../lib/engine";
import { accountAxis, accountFact, bankYearlyMax, currentAccountModel, fact, payingBanks, silentBanks, type SignatureData } from "../../lib/guide-signature";
import type { SiteValue } from "../../lib/value";
import { AxisLabels, niceYearTicks } from "../chart/TimelineChart";
import { IconAlert } from "../icons";
import type { WorthFactRow } from "../guide/worth-knowing";
import { ChartLegend, cx, Disclosure, InputSlot, NumberField, RangeField, Sentence, Stat, StatRow, Swatch, Tag, useWidth } from "../kit";
import { Num, RuleRef, RulesLine } from "../provenance";
import { CommonRateLine, Gap, SourceLine, figure, inputSite, rulesOfBundle, useSigInputs, yearsRange, type VisualProps } from "./kit";

const HEIGHT = 250;
const TOP = 20;
const BOTTOM = 26;
const LEFT = 58;
const FOLD_ID = copy.account.fold.anchorId;

/** A ceiling is a round amount of shekels: "10,000 ₪", not "10,000.00 ₪". */
const wholeNis = (v: SiteValue) => fmt.nisWhole(Number(v.value));

const NUMBER = /\d+(?:[.,]\d+)*(?:\s?(?:₪|%))?/g;

/**
 * Hebrew prose that carries figures (the record's own text: "3,000 ₪", "31.03.2026", "2%"): each figure is isolated left to right, so the
 * shekel sign and the digits keep one order beside Hebrew words, as in a `Num`. The figures stay the bank's printed ones, not site figures.
 */
function Isolated({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(NUMBER)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <bdi key={m.index} dir="ltr" className="whitespace-nowrap">
        {m[0]}
      </bdi>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

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
  const [bankId, setBankId] = useState<string | null>(null);
  const cash = fact(data, "cashRate")!;
  const commonRate = fact(data, "commonRate");
  const commonCount = fact(data, "commonCount");
  const bankCount = fact(data, "bankCount");
  const tax = fact(data, "taxRate");
  const years = Math.max(1, Math.round(inputs.years));
  const model = useMemo(() => currentAccountModel(data, { balance: inputs.amount, years, bankId }), [data, inputs.amount, years, bankId]);
  const [box, width] = useWidth();
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

  const pts = model?.points ?? [];
  const plotW = width - 8;
  const axis = accountAxis([inputs.amount, ...pts.flatMap((p) => [p.account, p.fund])]);
  // the value labels sit in a gutter at the left edge; the lines start right of it, so a label never lies on the start of a line
  const x = scaleLinear().domain([0, years]).range([LEFT, plotW]);
  const y = scaleLinear().domain([axis.lo, axis.hi]).nice(4).range([HEIGHT - BOTTOM, TOP]);
  const ticks = y.ticks(4);
  const acct = line<{ year: number; account: number }>().x((d) => x(d.year)).y((d) => y(d.account));
  const fnd = line<{ year: number; fund: number }>().x((d) => x(d.year)).y((d) => y(d.fund));
  const gap = area<{ year: number; account: number; fund: number }>().x((d) => x(d.year)).y0((d) => y(d.account)).y1((d) => y(d.fund));
  const last = pts[pts.length - 1];

  const base = (key: "amount_now" | "horizon_years", n: number, src: "amount" | "years") => inputSite(account, key, n, inputs.source[src], today, key === "amount_now" ? copy.common.inputNames.balance : copy.common.inputNames.years);
  const balanceValue = base("amount_now", inputs.amount, "amount");
  const yearsValue = base("horizon_years", years, "years");
  const inputValues = { [copy.common.inputNames.balance]: balanceValue, [copy.common.inputNames.years]: yearsValue };
  const bank = model?.bank ?? null;
  const rateName = bank ? copy.account.inputs.rate : copy.account.inputs.common;
  const runInputs = model ? { ...inputValues, [rateName]: model.rate, ...(model.ceiling ? { [copy.account.inputs.ceiling]: model.ceiling } : {}) } : inputValues;
  const fundInputs = { ...inputValues, [copy.common.inputNames.assumption]: cash };
  const values = model
    ? {
        account: figure(model.end.account, "nis", "F-67", runInputs, today, copy.account.about.account, rulesOfBundle(account)),
        fund: figure(model.end.fund, "nis", "F-67", fundInputs, today, copy.account.about.fund, rulesOfBundle(fundBundle)),
      }
    : null;
  const cost = values && model ? figure(model.end.cost, "nis", "F-67", { [copy.account.figures.fund]: values.fund, [copy.account.figures.account]: values.account }, today, copy.account.about.cost) : null;
  const change = values && model ? figure(Math.abs(model.end.change), "nis", "F-67", { [copy.account.figures.account]: values.account, [copy.account.balance]: balanceValue }, today, copy.account.about.change) : null;
  const direction = model ? (model.end.change < -0.5 ? copy.account.headline.less : model.end.change > 0.5 ? copy.account.headline.more : null) : null;
  const inflation = p05Value(account.p05, "A-02");

  const paying = payingBanks(data);
  const silent = silentBanks(data);
  const noOffer = silent.filter((b) => b.noOffer);
  const printedZero = silent.filter((b) => !b.noOffer);
  const everyBank = [...paying, ...silent];
  const commonIsZero = commonRate ? Number(commonRate.value) === 0 : false;
  const f = copy.account.fold;

  return (
    <div className="flex flex-col gap-5">
      {model && values && change ? (
        <div className="flex flex-col gap-2 max-w-measure">
          <p className="text-lg lg:text-xl font-medium">
            {copy.account.headline.lead} <InputSlot chars={10}><Num value={yearsValue} display={fmt.years(years)} /></InputSlot>, <InputSlot chars={12}><Num value={balanceValue} /></InputSlot>{" "}
            {bank ? (
              <>
                {copy.account.headline.inBank} <bdi>{bank.name}</bdi> {copy.account.headline.worth}
              </>
            ) : (
              copy.account.headline.inAccount
            )}{" "}
            <Num value={values.account} /> {copy.account.headline.today} {direction ? <><Num value={change} /> {direction}</> : copy.account.headline.same}.
          </p>
          {!bank && commonIsZero && <p>{copy.account.mostPayNothing}</p>}
          {!bank && commonRate && commonCount && bankCount && (
            <Sentence tone="muted">
              <CommonRateLine rate={commonRate} count={commonCount} of={bankCount} />
            </Sentence>
          )}
          {bank && (
            <div role="status" className="flex flex-col gap-1.5 text-sm">
              <p>
                {Number(bank.rate.value) > 0 && model.ceiling ? (
                  <>
                    {copy.account.picked.pays.before} <bdi>{bank.name}</bdi>
                    {copy.account.picked.pays.mid} <Num value={bank.rate} /> {copy.account.picked.pays.cap} <Num value={model.ceiling} display={wholeNis(model.ceiling)} />, {copy.account.picked.pays.after}
                  </>
                ) : Number(bank.rate.value) > 0 ? (
                  <>
                    {copy.account.picked.pays.before} <bdi>{bank.name}</bdi>
                    {copy.account.picked.pays.mid} <Num value={bank.rate} />, {copy.account.picked.pays.after}
                  </>
                ) : (
                  <>
                    {copy.account.picked.none.before} <bdi>{bank.name}</bdi>
                    {copy.account.picked.none.mid} <Num value={bank.rate} />.
                  </>
                )}{" "}
                <button type="button" onClick={() => setBankId(null)} className="text-link hover:underline min-h-9">
                  {copy.account.picked.clear}
                </button>
              </p>
              {bank.doubt && <Doubt text={bank.doubt} />}
            </div>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={copy.account.balance}
          unit="nis"
          value={inputs.amount}
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
      <SourceLine sources={[inputs.source.amount, inputs.source.years]} />

      {model ? (
        <>
          <ChartLegend
            items={[
              { id: "account", swatch: <Swatch className="bg-chart-net" />, label: copy.account.chart.account },
              { id: "fund", swatch: <Swatch className="bg-chart-alt" />, label: copy.account.chart.fund },
              { id: "baseline", swatch: <Swatch shape="rule" className="border-chart-baseline" />, label: copy.account.chart.baseline },
              { id: "cost", swatch: <Swatch shape="box" className="bg-chart-alt/25" />, label: copy.account.chart.cost },
            ]}
          />
          <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
            <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={copy.account.chart.aria} className="block select-none">
              {ticks.map((t) => (
                <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} className="stroke-chart-grid" strokeWidth="1" />
              ))}
              <line x1={0} x2={plotW} y1={HEIGHT - BOTTOM} y2={HEIGHT - BOTTOM} className="stroke-chart-axis" strokeWidth="1" />
              <path d={gap(pts) ?? ""} className="fill-chart-alt" fillOpacity="0.22" />
              <line x1={0} x2={plotW} y1={y(model.start)} y2={y(model.start)} className="stroke-chart-baseline" strokeWidth="1.5" strokeDasharray="5 4" />
              <path d={fnd(pts) ?? ""} fill="none" className="stroke-chart-alt" strokeWidth="2.5" strokeLinejoin="round" />
              <path d={acct(pts) ?? ""} fill="none" className="stroke-chart-net" strokeWidth="2.5" strokeLinejoin="round" />
              {/* after the lines and the dashed start, with the card-colour halo: the start line ran through "50 אלף ₪" (2026-10-26) */}
              <AxisLabels ticks={ticks} y={y} />
              {last && Math.abs(y(last.fund) - y(last.account)) > 12 && (
                // the gap as a difference: a bracket between the two ends, its number beside it (D29 rule 6)
                <path d={`M ${plotW - 8} ${y(last.fund)} h 4 V ${y(last.account)} h -4`} fill="none" className="stroke-chart-text" strokeWidth="1.5" />
              )}
              {niceYearTicks(years).map((t) => (
                <text key={t} x={x(t)} y={HEIGHT - 8} textAnchor={t === 0 ? "start" : t === years ? "end" : "middle"} className="text-xs fill-chart-text" data-scale>
                  {t === 0 ? copy.account.today : t}
                </text>
              ))}
            </svg>
            {last && (
              <>
                <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: Math.max(0, y(last.fund) - 22) }}>
                  {copy.account.chart.fund}
                </span>
                <span className="absolute text-xs text-chart-text whitespace-nowrap" dir="rtl" style={{ right: 12, top: y(last.account) + 6 }}>
                  {copy.account.chart.account}
                </span>
                {cost && (
                  <span className="absolute text-xs bg-card/85 rounded-sm px-1.5 py-0.5 whitespace-nowrap" dir="rtl" style={{ right: 26, top: Math.min(HEIGHT - BOTTOM - 24, Math.max(TOP, (y(last.fund) + y(last.account)) / 2 - 10)) }}>
                    {copy.account.chart.cost} <Num value={cost} />
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{copy.account.axisNote}</p>
          <StatRow cols={3}>
            <Stat label={`${copy.account.figures.account} ${copy.account.after} ${fmt.years(years)}`} tone="net">
              {values && <Num value={values.account} size="inline" />}
            </Stat>
            <Stat label={copy.account.figures.fund} tone="alt">
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
        {copy.common.fundAssumption.before} <Num value={cash} /> {copy.common.fundAssumption.after}
      </Sentence>

      {everyBank.length > 0 ? (
        <Disclosure detailsRef={foldRef} id={FOLD_ID} className="rounded-md border border-border scroll-mt-24" spread summaryClassName="px-4 py-2" labelClassName="font-medium" label={f.title}>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <p className="text-sm text-muted-foreground max-w-measure">{f.lead}</p>

            <div className="flex flex-col gap-1.5">
              <span className="field-label" id="sig-account-bank">
                {f.picker.label}
              </span>
              <div role="group" aria-labelledby="sig-account-bank" className="flex flex-wrap gap-2">
                {everyBank.map((b) => (
                  <button key={b.id} type="button" aria-pressed={bankId === b.id} onClick={() => setBankId(bankId === b.id ? null : b.id)} className={cx("sec-chip", bankId === b.id && "sec-chip-on")}>
                    <bdi>{b.name}</bdi>
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground max-w-measure">{f.picker.hint}</span>
            </div>

            {tax ? (
              <Sentence size="sm" tone="muted" measure>
                {f.maxNote.before} <Num value={balanceValue} />
                {f.maxNote.middle} <Num value={tax} />
                {f.maxNote.after}
              </Sentence>
            ) : (
              <Gap id="rule:TXI-03" />
            )}

            <table className="w-full text-sm border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="text-muted-foreground text-start">
                  <th scope="col" className="font-medium text-start pb-2 pe-4 w-28">{f.columns.bank}</th>
                  <th scope="col" className="font-medium text-start pb-2 pe-4 w-24">{f.columns.rate}</th>
                  <th scope="col" className="font-medium text-start pb-2 pe-4">{f.columns.who}</th>
                  <th scope="col" className="font-medium text-start pb-2 w-36">{f.columns.max}</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {paying.map((b) => {
                  const yearly = tax ? figure(bankYearlyMax(b, inputs.amount, Number(tax.value)), "nis", "F-26", { [copy.account.inputs.rate]: b.rate, ...(b.ceiling ? { [copy.account.inputs.ceiling]: b.ceiling } : {}), [copy.account.balance]: balanceValue, [copy.account.inputs.tax]: tax }, today, copy.account.about.maxYear, rulesOfBundle(account)) : null;
                  return (
                    <tr key={b.id} className={cx("flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 md:table-row", bankId === b.id && "bg-accent/40")}>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top flex-1 min-w-32">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium"><bdi>{b.name}</bdi></span>
                          {b.until && (
                            <Tag tone="neutral">
                              {f.until} <bdi dir="ltr">{fmt.date(b.until)}</bdi>
                            </Tag>
                          )}
                          {b.doubt && (
                            <Tag tone="caution" icon={<IconAlert size={14} />}>
                              {f.doubtTag}
                            </Tag>
                          )}
                        </div>
                      </td>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top font-semibold">
                        <span className="md:hidden text-xs font-normal text-muted-foreground">{f.columns.rate}: </span>
                        <Num value={b.rate} />
                      </td>
                      <td className="md:table-cell md:py-3 md:pe-4 md:align-top basis-full text-muted-foreground">
                        {b.conditions && <Isolated text={b.conditions} />}
                        {b.doubt && <Doubt text={b.doubt} className="mt-1.5" />}
                      </td>
                      <td className="md:table-cell md:py-3 md:align-top basis-full">
                        <span className="md:hidden text-xs text-muted-foreground">{f.columns.max}: </span>
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
                          <div key={b.id} className="flex flex-col gap-1.5">
                            <p>
                              <bdi>{b.name}</bdi>{" "}
                              {b.doubt && (
                                <Tag tone="caution" icon={<IconAlert size={14} />}>
                                  {f.doubtTag}
                                </Tag>
                              )}{" "}
                              {f.silent.printedZero.mid} <Num value={b.rate} />
                              {f.silent.printedZero.end}
                            </p>
                            {b.doubt && <Doubt text={b.doubt} />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="md:table-cell md:py-3 md:align-top basis-full">
                      <span className="md:hidden text-xs text-muted-foreground">{f.columns.max}: </span>
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

/** An open doubt about a record, with the caution mark: the sentence the record carries (`doubt_he`). */
function Doubt({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cx("flex items-start gap-1.5 text-caution-foreground", className)}>
      <IconAlert size={14} className="text-caution shrink-0 mt-1" aria-hidden="true" />
      <span>
        <Isolated text={text} />
      </span>
    </span>
  );
}

/**
 * "Worth knowing" (the founder, 2026-10-25): how many of the collected banks pay interest on a current-account balance, on what terms, and
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
