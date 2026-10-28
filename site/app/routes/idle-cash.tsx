// Screen 7: the idle-cash screen (design-spec 9, flow 11): two numbers, and what leaving the money in the current
// account costs a month against each liquid option (method F-60, S41). The engine runs here, on the bundle fetched once.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { idle as copy, r2, site } from "../copy";
import { BoiLine, CostRows, IdleCoverage, idleCtx, MaterialityLine, SmallSumLine, VerdictBlock } from "../components/compare/idle";
import { LeadTail, Num, NumberLegend } from "../components/provenance";
import { RawWatch } from "../components/holdings/fields";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card, ChoiceChips, cx, Disclosure, NumberField, Sentence } from "../components/kit";
import { loadBundle } from "../lib/bundle";
import { fmt, parseNumber } from "../lib/format";
import type { CompareBundle } from "../lib/compare";
import { buildIdle, maxTermMonths, negotiateThreshold } from "../lib/idle";
import { anyWeak, ruleFigure, type SiteValue } from "../lib/value";
import { bundleLinks } from "../lib/bundle";
import { recordsById } from "../lib/scope";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("compare-bundle.json");

/** The rules the verdict block quotes (tax in words, liquidity, small sums): their chips and their rate figures. */
const quoted = ["TXI-03", "TXI-07", "TXS-12", "TXS-07", "MF-34", "BANK-06", "MF-15", "MF-26", "BANK-18"];

export async function loader() {
  const { goalFormData } = await import("../lib/compare.server");
  const { loadParameters, loadRules, pointedRecords } = await import("../lib/data.server");
  const all = loadRules();
  const data = goalFormData();
  const p03 = loadParameters().find((p) => (p as { method_id?: string }).method_id === "P-03") ?? null;
  const rules = Object.fromEntries(quoted.filter((id) => all[id]).map((id) => [id, all[id]!]));
  return { ...data, p03, rules, pointed: pointedRecords(rules, all) };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function IdleCashPage() {
  const data = useLoaderData<typeof loader>();
  const [bundle, setBundle] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadBundle().then(setBundle).catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries([...Object.values(data.rules), ...(bundle?.rules ?? [])].map((r) => [r.id, r as RuleRecord]));
    return { rules, pointed: { ...(data.pointed as Record<string, RuleRecord>), ...recordsById(bundle?.pointed) }, terms: {}, dimensions: Object.fromEntries((bundle?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [bundle, data.rules, data.today]);
  return (
    <PageShell current="other" data={provenance}>
      <Screen bundle={bundle} failed={failed} rules={data.rules as Record<string, RuleRecord>} today={data.today} p03={data.p03} />
    </PageShell>
  );
}

const positive = (n: number) => (n <= 0 ? copy.errBalance : null);
const nonNegative = (n: number) => (n < 0 ? "הסכום לא יכול להיות שלילי." : null);
/** The offer is a percent a year: a value under 0.1 is most likely a fraction ("0.04" for 4%), so it asks instead of reading it as 0.04%. */
const validateOffer = (n: number): ReactNode | null =>
  n < 0 ? nonNegative(n) : n > 100 ? "הזינו אחוז עד 100." : n > 0 && n < 0.1 ? (
    <>
      {copy.offerUnit.before}
      <bdi dir="ltr">{fmt.number(Number((n * 100).toFixed(4)))}</bdi>
      {copy.offerUnit.after}
    </>
  ) : null;

type TermKey = "1" | "3" | "12" | "other";
const termIds: TermKey[] = ["1", "3", "12"];
const validateMonths = (n: number) => (!Number.isInteger(n) || n < 1 || n > maxTermMonths ? copy.term.errMonths : null);

function Screen({ bundle, failed, rules, today, p03 }: { bundle: CompareBundle | null; failed: boolean; rules: Record<string, RuleRecord>; today: string; p03: unknown }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [keep, setKeep] = useState<number | null>(null);
  const [offer, setOffer] = useState<number | null>(null);
  const [termKey, setTermKey] = useState<TermKey | null>(null);
  const [otherMonths, setOtherMonths] = useState<number | null>(null);
  // the home page's "כרית ביטחון" opens this screen with the sum typed there (?balance=15000), read once; it is entered, like any typed value
  const [params] = useSearchParams();
  useEffect(() => {
    const n = parseNumber(params.get("balance") ?? "");
    if (n > 0) setBalance(n);
    // review fix 2026-10-24: the goal page's next-step line passes the sum it keeps available (?keep=), so both pages show the same figure
    const k = parseNumber(params.get("keep") ?? "");
    if (n > 0 && k >= 0 && k <= n) setKeep(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // audit A61: what is typed in a field that refused it ("abc", "0.04" for a percent) is not in the state, so the page
  // watches the typed text and hides the result while any field is invalid
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const watch = (key: string, validate: (n: number) => ReactNode | null) => (t: string) =>
    setBad((b) => {
      const v = t.trim() !== "" && (Number.isNaN(parseNumber(t)) || validate(parseNumber(t)) !== null);
      return !!b[key] === v ? b : { ...b, [key]: v };
    });
  const anyBad = Object.values(bad).some(Boolean);
  const validateKeep = (n: number) => (n < 0 ? nonNegative(n) : balance !== null && n > balance ? copy.errKeep : null);
  const termMonths = termKey === null ? null : termKey === "other" ? otherMonths : Number(termKey);
  const outcome = useMemo(() => (bundle ? buildIdle(bundle, balance, keep, offer, termMonths, negotiateThreshold(p03)) : null), [bundle, balance, keep, offer, termMonths, p03]);
  const depositRate = useMemo(() => (rules["TXI-03"] ? ruleFigure(rules["TXI-03"], "rate", today) : null), [rules, today]);
  const fundRate = useMemo(() => (rules["TXS-12"] ? ruleFigure(rules["TXS-12"], "rate", today) : null), [rules, today]);
  const ctx = useMemo(() => (bundle && outcome?.kind === "ok" ? idleCtx(bundle, outcome) : null), [bundle, outcome]);
  // Until a result exists the page is one centred column; the two columns start with the result.
  const resultShown = !failed && !!outcome && (outcome.kind === "ok" || outcome.kind === "all-kept" || outcome.kind === "no-baseline");
  const over = balance !== null && keep !== null && keep > balance;


  return (
    <div className={cx("flex flex-col gap-6 pt-2 lg:pt-8 mx-auto w-full", resultShown ? "max-w-page" : "max-w-3xl")}>
      <Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        <NumberLegend institution={outcome?.kind === "ok" ? anyWeak([outcome.headline, outcome.yearly, outcome.baseline?.rate, ...outcome.rows.flatMap((r) => [r.rate, r.cost])]) : false} />
      </header>
      <div className={cx("flex flex-col gap-6", resultShown && "lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-x-12 lg:items-start")}>
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <RawWatch onRaw={watch("balance", positive)}>
              <NumberField label={copy.fields.balance} unit="nis" value={balance} isEntered={balance !== null} validate={positive} onCommit={setBalance} onReset={() => setBalance(null)} optional inputMode="decimal" />
            </RawWatch>
            <RawWatch onRaw={watch("keep", validateKeep)}>
              <NumberField label={copy.fields.keep} unit="nis" value={keep} isEntered={keep !== null} validate={validateKeep} onCommit={setKeep} onReset={() => setKeep(null)} optional inputMode="decimal" />
            </RawWatch>
          </Card>
          <Disclosure label={<span className="font-medium">{copy.optional}</span>} defaultOpen className="bg-card border border-border rounded-lg px-4 md:px-6 py-1">
            <div className="pb-4 flex flex-col gap-3">
              <RawWatch onRaw={watch("offer", validateOffer)}>
                <NumberField label={copy.offer} unit="pct_per_year" value={offer} isEntered={offer !== null} validate={validateOffer} onCommit={setOffer} onReset={() => setOffer(null)} hint={copy.offerHint} placeholder="3.2" optional inputMode="decimal" />
              </RawWatch>
              <div className="flex flex-col gap-2">
                <span className="field-label">{copy.term.label}</span>
                <ChoiceChips ids={termIds} labels={copy.term.options} value={termKey} onChange={(id) => setTermKey((k) => (k === id ? null : id))} ariaLabel={copy.term.label} wrap other={{ label: copy.term.options.other!, open: termKey === "other", onToggle: () => setTermKey((k) => (k === "other" ? null : "other")) }} />
                {termKey === "other" && (
                  <RawWatch onRaw={watch("months", validateMonths)}>
                    <NumberField label={copy.term.otherLabel} unit="months" value={otherMonths} isEntered={otherMonths !== null} validate={validateMonths} onCommit={setOtherMonths} onReset={() => setOtherMonths(null)} optional inputMode="numeric" />
                  </RawWatch>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-measure">{copy.haveDeposit}</p>
            </div>
          </Disclosure>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          {failed ? (
            <Callout tone="caution">{copy.failed}</Callout>
          ) : !bundle || !outcome ? (
            <p className="text-muted-foreground">{copy.loading}</p>
          ) : anyBad ? (
            <Callout tone="caution">{copy.invalid}</Callout>
          ) : (
            <Result outcome={outcome} bundle={bundle} ctx={ctx} over={over} offerGiven={offer !== null} termGiven={termMonths !== null} depositRate={depositRate} fundRate={fundRate} />
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultProps {
  outcome: ReturnType<typeof buildIdle>;
  bundle: CompareBundle;
  ctx: ReturnType<typeof idleCtx> | null;
  over: boolean;
  offerGiven: boolean;
  termGiven: boolean;
  depositRate: SiteValue | null;
  fundRate: SiteValue | null;
}

function Result({ outcome, bundle, ctx, over, offerGiven, termGiven, depositRate, fundRate }: ResultProps) {
  if (outcome.kind === "error") return <Callout tone="caution">{copy.failed}</Callout>;
  if (outcome.kind === "no-baseline") return <Callout tone="caution">{copy.noBaseline}</Callout>;
  if (outcome.kind === "need-more")
    return (
      <Card className="flex flex-col gap-2">
        <p className="text-lg">{over ? copy.errKeep : copy.fill}</p>
      </Card>
    );
  if (outcome.kind === "all-kept") return <Callout tone="info">{copy.allKept}</Callout>;
  const view = outcome;
  return (
    <>
      <Card className="flex flex-col gap-4">
        {view.headline ? (
          <div className="flex flex-col gap-1">
            <Sentence t={copy.headlineSplit} vars={{ amount: <Num value={view.amount} /> }} />
            <Sentence size="lg" t={copy.headlineCost} vars={{ cost: <Num value={view.headline} size="figure" animate /> }} />
            {view.yearly && (
              <Sentence size="lg">
                <LeadTail lead={copy.soWhat.before}>
                  <Num value={view.yearly} />
                </LeadTail>
                {copy.soWhat.after}
              </Sentence>
            )}
            <p className="text-sm text-muted-foreground">{copy.headlineLabel}</p>
            {view.materiality && !view.verdict && <MaterialityLine m={view.materiality} />}
          </div>
        ) : (
          <p className="text-lg max-w-measure">{copy.noCost}</p>
        )}
        <h2 className="sr-only">{copy.rowsHeading}</h2>
        {ctx && <CostRows view={view} ctx={ctx} />}
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          {view.baseline && Number(view.baseline.rate.value) > 0 ? (
            <span>
              {view.baseline.rate.own ? (
                <>
                  {copy.baselineOwner.before} <bdi>{view.baseline.rate.own}</bdi> {copy.baselineOwner.after}
                </>
              ) : view.baseline.rate.source.title === "F-85" ? (
                copy.baselineCommon
              ) : (
                copy.baselineBefore
              )}{" "}
              <Num value={view.baseline.rate} />
              {copy.baselineAfter}
            </span>
          ) : (
            copy.baselineNone
          )}
        </p>
      </Card>
      {view.verdict ? <VerdictBlock verdict={view.verdict} depositRate={depositRate} fundRate={fundRate} /> : offerGiven && !termGiven ? <Callout tone="info">{copy.term.ask}</Callout> : null}
      {view.smallSum && <SmallSumLine />}
      <BoiLine bundle={bundle} />
      {ctx && <IdleCoverage view={view} ctx={ctx} />}
    </>
  );
}


