// Screen 7: the idle-cash screen (design-spec 9, flow 11): two numbers, and what leaving the money in the current
// account costs a month against each liquid option (method F-60, S41). The engine runs here, on the bundle fetched once.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { idle as copy, r2, site } from "../copy";
import { BoiLine, CostRows, IdleCoverage, idleCtx } from "../components/compare/idle";
import { Num } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { NumberField } from "../components/timeline/fields";
import { Button, Callout, Card, Disclosure } from "../components/ui";
import { loadBundle } from "../lib/bundle";
import type { CompareBundle } from "../lib/compare";
import { GoalsProvider, isBlank, useGoals, type Presets } from "../lib/goal";
import { buildIdle } from "../lib/idle";

export async function loader() {
  const { goalFormData } = await import("../lib/compare.server");
  return goalFormData();
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function IdleCashPage() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  const [bundle, setBundle] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadBundle().then(setBundle).catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries((bundle?.rules ?? Object.values(data.rules)).map((r) => [r.id, r as RuleRecord]));
    return { rules, terms: {}, dimensions: Object.fromEntries((bundle?.checklist ?? []).map((c) => [c.id, c.name])), today: data.today };
  }, [bundle, data.rules, data.today]);
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="other" data={provenance}>
        <Screen bundle={bundle} failed={failed} />
      </PageShell>
    </GoalsProvider>
  );
}

const positive = (n: number) => (n <= 0 ? copy.errBalance : null);
const nonNegative = (n: number) => (n < 0 ? "הסכום לא יכול להיות שלילי." : null);

function Screen({ bundle, failed }: { bundle: CompareBundle | null; failed: boolean }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [keep, setKeep] = useState<number | null>(null);
  const [offer, setOffer] = useState<number | null>(null);
  const navigate = useNavigate();
  const { status, current, update, add } = useGoals();
  const outcome = useMemo(() => (bundle ? buildIdle(bundle, balance, keep, offer) : null), [bundle, balance, keep, offer]);
  const ctx = useMemo(() => (bundle && outcome?.kind === "ok" ? idleCtx(bundle, outcome) : null), [bundle, outcome]);
  const over = balance !== null && keep !== null && keep > balance;

  // The full comparison starts from the liquid-reserve preset with the two amounts (flow 11, step 4). A goal already on the
  // device is kept: a new one is started unless the current one is still empty.
  const toFull = () => {
    if (status === "loading") return;
    if (current && !isBlank(current)) add();
    update((g) => ({
      ...g,
      preset: "liquid-reserve",
      ...(balance !== null ? { amountNow: { value: balance, entered: true } } : {}),
      ...(keep !== null ? { available: { value: keep, entered: true } } : {}),
    }));
    navigate("/goal");
  };

  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8 max-w-page">
      <Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
      </header>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr] lg:gap-x-12 lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <NumberField label={copy.fields.balance} unit="nis" value={balance} isEntered={balance !== null} validate={positive} onCommit={setBalance} onReset={() => setBalance(null)} optional inputMode="decimal" />
            <NumberField
              label={copy.fields.keep}
              unit="nis"
              value={keep}
              isEntered={keep !== null}
              validate={(n) => (n < 0 ? nonNegative(n) : balance !== null && n > balance ? copy.errKeep : null)}
              onCommit={setKeep}
              onReset={() => setKeep(null)}
              optional
              inputMode="decimal"
            />
          </Card>
          <Disclosure label={<span className="font-medium">{copy.optional}</span>} defaultOpen className="bg-card border border-border rounded-lg px-4 md:px-6 py-1">
            <div className="pb-4">
              <NumberField label={copy.offer} unit="pct_per_year" value={offer} isEntered={offer !== null} validate={(n) => (n < 0 ? nonNegative(n) : n > 100 ? "הזינו אחוז עד 100." : null)} onCommit={setOffer} onReset={() => setOffer(null)} hint={copy.offerHint} optional inputMode="decimal" />
            </div>
          </Disclosure>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          {failed ? (
            <Callout tone="caution">{copy.failed}</Callout>
          ) : !bundle || !outcome ? (
            <p className="text-muted-foreground">{copy.loading}</p>
          ) : (
            <Result outcome={outcome} bundle={bundle} ctx={ctx} over={over} onFull={toFull} />
          )}
        </div>
      </div>
    </div>
  );
}

function Result({ outcome, bundle, ctx, over, onFull }: { outcome: ReturnType<typeof buildIdle>; bundle: CompareBundle; ctx: ReturnType<typeof idleCtx> | null; over: boolean; onFull: () => void }) {
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
            <p className="text-lg flex flex-wrap items-baseline gap-x-2">
              <span>
                {copy.headlineBefore} <Num value={view.amount} /> {copy.headlineMid}
              </span>
              <Num value={view.headline} size="figure" animate />
              <span>{copy.headlineAfter}</span>
            </p>
            <p className="text-sm text-muted-foreground">{copy.headlineLabel}</p>
          </div>
        ) : (
          <p className="text-lg max-w-measure">{copy.noCost}</p>
        )}
        <h2 className="sr-only">{copy.rowsHeading}</h2>
        {ctx && <CostRows view={view} ctx={ctx} />}
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          {view.baseline && Number(view.baseline.rate.value) > 0 ? (
            <span>
              {copy.baselineBefore} <Num value={view.baseline.rate} />
              {copy.baselineAfter}
            </span>
          ) : (
            copy.baselineNone
          )}
        </p>
      </Card>
      <BoiLine bundle={bundle} />
      {ctx && <IdleCoverage view={view} ctx={ctx} />}
      <div>
        <Button variant="primary" onClick={onFull} className="w-full md:w-auto">
          {copy.fullLink}
        </Button>
      </div>
    </>
  );
}


