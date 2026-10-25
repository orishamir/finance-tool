// A fee row (design-system 7.2, design-spec 11.3): name, rate, cost, verdict, the three quiet lines, the reduction
// field and the negotiation text.
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r3fees } from "../../copy";
import { reducible, reductionWorth, type Analysis, type LineView, type SubjectView } from "../../lib/fees";
import { formatValue, fmt, nearThreshold } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { entered as enteredValue } from "../../lib/value";
import { IconCopy } from "../icons";
import { LeadTail, Num, RuleRef, StateTag } from "../provenance";
import { NumberField } from "../timeline/fields";
import { Button, Callout, Disclosure, Tag, cx } from "../ui";
import { CapLine, ReadingMark, ReferenceLine, VerdictTag } from "./parts";

function periodWord(months: number): string {
  return months === 1 ? r3fees.periods.month : months === 3 ? r3fees.periods.quarter : months === 12 ? r3fees.periods.year : fmt.months(months);
}

function baseWords(l: LineView, an: Analysis): string {
  const b = r3fees.base;
  if (l.line === "custody") {
    const p = an.plan;
    const every = p.run === "runSecurities" ? p.input.tariff.custody?.everyMonths : p.run === "runMakam" || p.run === "runBond" ? (p.input.tariff as { custody?: { everyMonths: number } }).custody?.everyMonths : undefined;
    return `${b.custodyBefore}${periodWord(every ?? 12)}${b.custodyAfter}`;
  }
  return b[l.line] ?? "";
}

// ---------------------------------------------------------------- reduction field

function ReductionField({ line, an, years, value, onChange }: { line: LineView; an: Analysis; years: number; value: number | null; onChange: (n: number | null) => void }) {
  const isEntered = value !== null;
  const shown = value ?? line.suggestion;
  const worth = useMemo(() => (shown === null ? null : reductionWorth(an, line.line, shown)), [an, line.line, shown]);
  const rate = line.rateFraction !== undefined ? line.rateFraction * 100 : null;
  const notReduction = shown !== null && rate !== null && shown >= rate - 1e-9;
  // while the typed value fails its check the result under the field is greyed and says so, not the last valid one (A61)
  const [invalid, setInvalid] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {/* the visible label; the field's own is for screen readers, so it is said once (A63) */}
        <span className="text-sm font-medium" aria-hidden="true">
          {r3fees.reduction.label}
        </span>
        <div className="w-36 shrink-0">
          <NumberField
            compact
            label={r3fees.reduction.label}
            unit="pct"
            value={shown}
            isEntered={isEntered}
            validate={(n) => {
              const err = n < 0 ? r3fees.reduction.belowZero : n > 100 ? r3fees.reduction.aboveHundred : null;
              setInvalid(err !== null);
              return err;
            }}
            onCommit={(n) => {
              setInvalid(false);
              onChange(n);
            }}
            onReset={() => {
              setInvalid(false);
              onChange(null);
            }}
          />
        </div>
        {!isEntered && line.suggestion !== null && <Tag tone="parameter">{r3fees.reduction.suggestion}</Tag>}
        {isEntered && line.suggestion !== null && (
          <Button variant="quiet" className="text-sm min-h-target" onClick={() => onChange(null)}>
            {r3fees.reduction.suggestion}
          </Button>
        )}
      </div>
      {shown !== null && (
        <p className={cx("text-base font-medium flex flex-col gap-0.5", invalid && "opacity-40")} aria-live="polite">
          {notReduction || !worth ? (
            <span className="text-muted-foreground font-normal">{r3fees.reduction.notReduction}</span>
          ) : (
            // one inline sentence: as direct children of the flex column, each piece took its own line (founder's screenshot, 2026-10-25)
            <span>
              {r3fees.reduction.worthBefore}
              <Num value={worth} animate /> <LeadTail lead="ב־">{fmt.years(years)}</LeadTail>
              {r3fees.reduction.worthAfter}
            </span>
          )}
          {!notReduction && worth && <span className="text-sm font-normal text-muted-foreground">{r3fees.reduction.noRanking}</span>}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- negotiation

type Seg = { t: string } | { n: SiteValue; text?: string };

const plainText = (segs: Seg[]) => segs.map((s) => ("t" in s ? s.t : s.text ?? formatValue(s.n.value, s.n.unit))).join("");
const Segs = ({ segs }: { segs: Seg[] }) => (
  <>
    {segs.map((s, i) => ("t" in s ? <span key={i}>{s.t}</span> : <Num key={i} value={s.n} display={s.text} />))}
  </>
);

function NegotiationCard({ line, an, subject, toPct, rules }: { line: LineView; an: Analysis; subject: SubjectView; toPct: number | null; rules: Map<string, RuleRecord> }) {
  // a holding is an account of the person's; a wrapper or a track page is not, so the script asks for an offer (A94)
  const hasAccount = subject.kind === "holding";
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);
  const cma = line.reference.cma!;
  const n = r3fees.negotiation;
  const to = toPct ?? (cma.mean.value as number);
  const toV = enteredValue(to, "pct", an.ctx.runDate, "העמלה שביקשתם");
  const cls = cma.specialization ? `${cma.classification} · ${cma.specialization}` : cma.classification;
  const dataset = n.datasets[cma.dataset] ?? cma.dataset;
  const segs: Seg[] = [
    { t: `${n.p1[0]}${n.from[line.line] ?? n.from.balance}${(hasAccount ? n.p1 : n.p1Offer)[1]}${subject.productName}${n.p1[2]}` },
    ...(line.rate ? ([{ n: line.rate }] as Seg[]) : []),
    { t: `${n.p1[3]}${dataset} של ${n.authority}${n.p2[0]}${cma.year?.value ?? ""}${n.p2[1]}${cls}${n.p2[2]}` },
    { n: cma.mean },
    { t: n.p2[3] },
    { n: cma.median },
    { t: n.p2[4] },
    { n: cma.count },
    { t: hasAccount ? n.p2[5] : n.p2Offer },
    { n: toV },
    { t: hasAccount ? n.p2[6] : n.offerEnd },
  ];
  const own: Seg[] | null = line.reference.ownAverage ? [{ t: n.own[0] }, { n: line.reference.ownAverage }, { t: n.own[1] }] : null;
  const source = `${n.source[0]}${dataset}${n.source[1]}${n.authority}${n.source[2]}${fmt.period(cma.period)}${n.source[3]}`;
  const text = plainText(segs) + (own ? ` ${plainText(own)}` : "");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${source}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallback(true);
    }
  };
  const ruleLine = (id: string) => {
    const r = rules.get(id);
    return (
      <p key={id} className="text-sm flex flex-col gap-1">
        {r ? <span>{(r as { text_he?: string }).text_he ?? r.title}</span> : <span className="text-muted-foreground">{r3fees.review.ruleMissing}</span>}
        <span className="flex items-center gap-2">{r ? <RuleRef id={id} /> : <bdi dir="ltr" className="text-xs text-muted-foreground">{id}</bdi>}</span>
      </p>
    );
  };
  return (
    <div className="flex flex-col gap-3 max-w-measure">
      <div className="bg-secondary rounded-md p-4 flex flex-col gap-2 select-all">
        <p>
          <Segs segs={segs} />
          {own && (
            <>
              {" "}
              <Segs segs={own} />
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{source}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={copy}>
          <IconCopy size={16} /> {copied ? n.copied : n.copy}
        </Button>
        {fallback && <textarea readOnly dir="rtl" className="w-full bg-input rounded-md p-2 text-sm" rows={4} value={`${text}\n${source}`} onFocus={(e) => e.currentTarget.select()} />}
      </div>
      {ruleLine("PF-13")}
      {ruleLine("PF-16")}
      <p className="text-xs text-muted-foreground">{n.last}</p>
    </div>
  );
}

// ---------------------------------------------------------------- the row

export function FeeRow({ line, an, subject, years, thresholds, reduction, onReduce, rules, notReported, soften, compareHref }: { line: LineView; an: Analysis; subject: SubjectView; years: number; thresholds: Analysis["thresholds"]; reduction: number | null; onReduce: (n: number | null) => void; rules: Map<string, RuleRecord>; notReported?: boolean; soften?: boolean; compareHref?: string }) {
  void notReported;
  const toPct = reduction ?? line.suggestion;
  return (
    <li data-flip={line.line} className="bg-card border border-border rounded-lg p-4 md:p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-lg font-semibold">{r3fees.names[line.line]}</h3>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
            {line.rate && <Num value={line.rate} />}
            <span>{baseWords(line, an)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xl font-semibold">
            <Num value={line.cost} animate exact={typeof line.cost.value === "number" && nearThreshold(line.cost.value, [thresholds.negotiate, thresholds.avoid].map((t) => Number(t.value)))} />
          </span>
          <ReadingMark value={line.cost} />
          <span className="text-xs text-muted-foreground">
            <LeadTail lead={r3fees.costIn}>{fmt.years(years)}</LeadTail>
          </span>
        </div>
      </div>
      <VerdictTag line={line} thresholds={thresholds} soften={soften} compareHref={compareHref} />
      <div className="flex flex-col gap-2">
        <ReferenceLine reference={line.reference} />
        <CapLine cap={line.cap} />
        {line.verdict === "avoid" && line.removedBy.length > 0 && (
          <p className="text-sm">
            {r3fees.removedBy}
            {line.removedBy.map((o, i) => (
              <span key={o.id}>
                {i > 0 && ", "}
                <Link to={`/guide/${o.id}`} className="text-link hover:underline">
                  <bdi>{o.name}</bdi>
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </div>
      {reducible(line.line) && line.rateFraction !== undefined && <ReductionField line={line} an={an} years={years} value={reduction} onChange={onReduce} />}
      {line.reference.cma && (line.line === "balance" || line.line === "deposit") && toPct !== null && (
        <Disclosure label={r3fees.negotiation.disclosure} summaryClassName="text-base font-medium">
          <div className="pt-2">
            <NegotiationCard line={line} an={an} subject={subject} toPct={reduction} rules={rules} />
          </div>
        </Disclosure>
      )}
    </li>
  );
}

export function NotReportedRow({ name }: { name: string }) {
  return (
    <li className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3 text-muted-foreground">
      <span className="font-medium">{name}</span>
      <span className="flex items-center gap-2">
        <StateTag state="sourced" />
        {r3fees.notReported}
      </span>
    </li>
  );
}

export { Callout, cx };
