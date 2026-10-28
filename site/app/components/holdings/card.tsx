// The holding card (design-system 7.5, flow 23): the track as the data writes it, the regulator's facts as sourced
// values, the balance and fees as the person entered them with the references under each fee, the fit mark against
// the saved goal, F-61's fee line and the link to the fee page. A card, not a table: each holding carries four kinds
// of information in four states (D7) and a table would flatten them.
import { useState } from "react";
import { Link } from "react-router";
import { fit as fitCopy, r3holdings as copy } from "../../copy";
import { feeYear, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { isChild, liquidityOf, type HoldingView, type HoldingsCtx, type Liquidity } from "../../lib/holdings";
import { playbookQueryString, playbookWrappers } from "../../lib/playbook";
import { IconAlert, IconClock, IconLock } from "../icons";
import { IconDash, IconHelp, IconOk } from "../compare/icons";
import { LeadTail, Num, RuleRef } from "../provenance";
import { Button, Card, cx, Disclosure, KeyValue, Sentence, Tag } from "../kit";
import { ImportedTag } from "../transfer/imported-tag";
import { IconDown, IconUp } from "../compare/icons";
import { OpenQuestion, YearsNum, sourcedText } from "./shared";
import { FeeNum } from "../decoder/fees";

const about = (v: SiteValue, text: string): SiteValue => ({ ...v, about: text });

export function HoldingCard({ view, ctx, index, count, onEdit, onDelete, onMove }: { view: HoldingView; ctx: HoldingsCtx; index: number; count: number; onEdit: () => void; onDelete: () => void; onMove: (delta: -1 | 1) => void }) {
  const h = view.holding;
  const [confirm, setConfirm] = useState(false);
  const child = isChild(h.wrapperId);
  const name = h.track?.name ?? h.typedName ?? h.company.name;
  const unmatched = !child && !view.track;
  const record = copy.recordLabels;
  const liq = liquidityOf(h, ctx.rules, ctx.today);
  return (
    <Card as="article" className="flex flex-col gap-4" aria-labelledby={`hc-${h.id}`}>
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h3 id={`hc-${h.id}`} className="text-lg font-semibold min-w-0 [overflow-wrap:anywhere]">
            <bdi>{name}</bdi>
          </h3>
          <span className="flex flex-wrap items-center gap-1.5">
            {h.importedAt && <ImportedTag date={h.importedAt} />}
            {unmatched && <Tag tone="caution" icon={<IconAlert size={14} />}>{copy.unmatchedTag}</Tag>}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          <bdi>{view.companyName}</bdi>
          {h.track && (
            <>
              {" · "}
              {copy.cardFundLine} <bdi dir="ltr" className="num-id">{h.track.fundId}</bdi>
            </>
          )}
          {h.child && <> · {copy.childRouteOptions[h.child.route]}</>}
        </p>
        {liq && <LiquidityLine liq={liq} />}
      </header>

      <Disclosure label={<span className="font-medium">{copy.detailsOpen}</span>} defaultOpen className="md:[&>summary]:hidden" summaryClassName="md:hidden">
        <div className="grid gap-5 md:grid-cols-2 md:gap-8 pt-1">
          <div className="flex flex-col gap-3 min-w-0">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {view.cma?.classification && (
                <>
                  <dt className="text-muted-foreground">{record.classification}</dt>
                  <dd>
                    <Num value={sourcedText(view.cma.classification, view.cma.period, record.classification)} />
                  </dd>
                </>
              )}
              {view.cma && (
                <>
                  <dt className="text-muted-foreground">{copy.cardDates.authority}</dt>
                  <dd>
                    <Num value={about(view.cma.period, copy.cardDates.authority)} />
                  </dd>
                </>
              )}
              {typeof h.statementDate?.value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(h.statementDate.value) && (
                <>
                  <dt className="text-muted-foreground">{copy.cardDates.statement}</dt>
                  <dd>
                    <Num value={about(h.statementDate as SiteValue, copy.cardDates.statement)} display={fmt.date(h.statementDate.value)} />
                  </dd>
                </>
              )}
            </dl>
            <dl className="flex flex-col gap-3">
              <KeyValue label={record.balance} size="base"><Num value={about(h.balance as SiteValue, record.balance)} /></KeyValue>
              {!child && h.feeBalance && (
                <div className="flex flex-col gap-1">
                  <KeyValue label={record.feeBalance} size="base"><Num value={about(h.feeBalance as SiteValue, record.feeBalance)} /></KeyValue>
                  {fromAverage(h.feeBalance, view) && <p className="text-sm text-muted-foreground">{copy.feePrefill.cardNote}</p>}
                  <FeeRefs view={view} kind="balance" skipAverage={fromAverage(h.feeBalance, view)} />
                  <CapLines view={view} kind="balance" />
                </div>
              )}
              {!child && h.feeDeposit && (
                <div className="flex flex-col gap-1">
                  <KeyValue label={record.feeDeposit} size="base"><Num value={about(h.feeDeposit as SiteValue, record.feeDeposit)} /></KeyValue>
                  {fromAverage(h.feeDeposit, view) && <p className="text-sm text-muted-foreground">{copy.feePrefill.cardNote}</p>}
                  <FeeRefs view={view} kind="deposit" skipAverage={fromAverage(h.feeDeposit, view)} />
                  <CapLines view={view} kind="deposit" />
                </div>
              )}
              {!child && h.directExpenses && <KeyValue label={record.directExpenses} size="base"><Num value={about(h.directExpenses as SiteValue, record.directExpenses)} /></KeyValue>}
            </dl>
            {unmatched && <p className="text-sm text-muted-foreground max-w-measure">{copy.unmatchedLine}</p>}
          </div>

          <div className="flex flex-col gap-3 min-w-0">
            {!child && <StaleLine view={view} />}
            {child ? <ChildLines view={view} /> : <FeeLine view={view} ctx={ctx} />}
          </div>
        </div>
      </Disclosure>

      {liq?.kind === "liquid" && <DecisionBlock view={view} ctx={ctx} />}

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-2 -mb-2">
        {confirm ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm">{copy.deleteConfirm}</span>
            <Button variant="destructive" onClick={onDelete}>
              {copy.deleteYes}
            </Button>
            <Button variant="quiet" onClick={() => setConfirm(false)}>
              {copy.deleteNo}
            </Button>
          </span>
        ) : (
          <>
            <Button variant="quiet" onClick={onEdit}>
              {copy.actions.edit}
            </Button>
            <Button variant="quiet" onClick={() => setConfirm(true)}>
              {copy.actions.delete}
            </Button>
            {count > 1 && (
              <span className="ms-auto flex items-center">
                <Button variant="icon" aria-label={copy.actions.up} disabled={index === 0} onClick={() => onMove(-1)} className="disabled:opacity-40">
                  <IconUp size={18} />
                </Button>
                <Button variant="icon" aria-label={copy.actions.down} disabled={index === count - 1} onClick={() => onMove(1)} className="disabled:opacity-40">
                  <IconDown size={18} />
                </Button>
              </span>
            )}
          </>
        )}
      </footer>
    </Card>
  );
}

/** Review fix 2026-10-24: the stored fee is the regulator's average for the track (a prefill, state sourced), not a figure the person gave or read from their statement. */
function fromAverage(fee: { state?: string } | undefined, view: HoldingView): boolean {
  return fee?.state === "sourced" && !!view.cma;
}

/** Under each fee, its two references: the track's own average (sourced) and the class mean and median (computed, F-68). */
function FeeRefs({ view, kind, skipAverage = false }: { view: HoldingView; kind: "balance" | "deposit"; skipAverage?: boolean }) {
  const cma = view.cma;
  if (!cma) return null;
  const avg = kind === "balance" ? cma.avgBalance : cma.avgDeposit;
  const year = feeYear(avg);
  const ref = view.reference;
  const r = copy.classRef;
  return (
    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
      {skipAverage ? null : avg.value === null ? (
        <p>
          {copy.trackAvgNone} <bdi dir="ltr">{year ?? fmt.period(String(cma.period.value))}</bdi>.
        </p>
      ) : (
        <p>
          {copy.trackAvg} <FeeNum value={avg} />
          {year && (
            <>
              {" "}
              {copy.trackAvgYear} <bdi dir="ltr">{year}</bdi>
            </>
          )}{" "}
          {cma.perFund && <Tag tone="neutral">{copy.perFund}</Tag>}
        </p>
      )}
      {ref && (kind === "balance" ? ref.count : ref.countDeposit).value !== 0 ? (
        <p>
          {r.before} <bdi>{ref.classification}</bdi>: <Num value={kind === "balance" ? ref.meanBalance : ref.meanDeposit} />{" "}
          <span className="whitespace-nowrap">
            {r.mid} <Num value={kind === "balance" ? ref.medianBalance : ref.medianDeposit} />
          </span>
          {(kind === "balance" ? ref.count : ref.countDeposit).value === 1 ? (
            r.afterOne
          ) : (
            <>
              {r.after}
              <Num value={kind === "balance" ? ref.count : ref.countDeposit} display={fmt.number((kind === "balance" ? ref.count : ref.countDeposit).value as number)} /> {r.tracks}
            </>
          )}
        </p>
      ) : (
        <p>{copy.noClassification}</p>
      )}
    </div>
  );
}

function CapLines({ view, kind }: { view: HoldingView; kind: "balance" | "deposit" }) {
  const w = view.capWarnings.find((c) => c.feeType === kind);
  if (!w) return null;
  return (
    <div className="text-sm text-caution-foreground flex items-start gap-1.5">
      <IconAlert size={16} className="text-caution shrink-0 mt-1" />
      <Sentence as="span">
        {copy.capAbove} <Num value={w.cap} /> <RuleRef id={w.ruleId} />
      </Sentence>
    </div>
  );
}

/** The track's data is older than the latest report: a clock and the period it is from. */
function StaleLine({ view }: { view: HoldingView }) {
  if (!view.cma?.stale) return null;
  return (
    <p className="text-sm text-caution-foreground flex items-center gap-2">
      <IconClock size={16} className="text-caution shrink-0" />
      <span>
        {copy.staleLine} <bdi dir="ltr">{fmt.period(String(view.cma.period.value))}</bdi>.
      </span>
    </p>
  );
}

/** "העמלות יעלו {סכום} ב־{שנים}, בכסף של היום." with the pre-tax tag, and the link to the fee page. */
function FeeLine({ view, ctx }: { view: HoldingView; ctx: HoldingsCtx }) {
  const f = view.fees;
  const id = view.holding.id;
  const wrapperId = view.holding.wrapperId;
  return (
    <div className="flex flex-col gap-1.5">
      {f.kind === "ok" ? (
        <>
          <p>
            {copy.feeLine.before} <Num value={f.cost.total} size="figure" className="!text-2xl" /> <LeadTail lead={copy.feeLine.mid}>
              <YearsNum value={f.cost.horizonYears} />
            </LeadTail>
            {copy.feeLine.after}
          </p>
          {f.cost.atAverage && (
            <p>
              {copy.avgSaving.before} <Num value={f.cost.atAverage} prefix={copy.avgSaving.approx} />{" "}
              <LeadTail lead={copy.avgSaving.mid}>
                <YearsNum value={f.cost.horizonYears} />
              </LeadTail>
              {copy.avgSaving.after}
            </p>
          )}
          {f.cost.preTax && (
            <p className="flex flex-wrap items-center gap-x-2">
              <span className="text-sm text-muted-foreground">{copy.preTax.split(":")[0]}:</span>
              {f.cost.preTax.blockedBy === "PF-36" ? <RuleRef id="PF-36" /> : <OpenQuestion code={f.cost.preTax.blockedBy} />}
            </p>
          )}
          {f.cost.depositsLeftOut && <p className="text-sm text-muted-foreground">{copy.depositsLeftOut}</p>}
          {f.cost.returnFromParameter && <p className="text-sm text-muted-foreground">{copy.returnFromParameter}</p>}
        </>
      ) : f.kind === "no-goal" ? (
        <p>{copy.feeLineNoGoal}</p>
      ) : f.kind === "needs-pf36" ? (
        <p className="text-sm flex flex-wrap items-center gap-x-1.5">
          <IconLock size={16} className="text-blocked shrink-0" />
          <span>{copy.feeNeedsPf36}</span>
          <RuleRef id="PF-36" />
        </p>
      ) : f.kind === "needs-first-deposit" ? (
        <p className="text-sm text-muted-foreground">{copy.feeNeedsFirstDeposit}</p>
      ) : f.kind === "unsupported" ? (
        <p className="text-sm text-muted-foreground">{copy.feeNotComputed}</p>
      ) : (
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{f.messageHe}</span>
          {f.code && (ctx.rules[f.code] ? <RuleRef id={f.code} /> : <Tag tone="neutral"><bdi dir="ltr">{f.code}</bdi></Tag>)}
        </p>
      )}
      <Link to={`/fees?holding=${encodeURIComponent(id)}`} className="text-link min-h-target inline-flex items-center self-start hover:underline">
        {copy.feeLinkLabel}
      </Link>
      {playbookWrappers.includes(wrapperId) && (
        <Link to={`/switch/${wrapperId}${playbookQueryString({ from: id, to: null, fundFrom: null, fundTo: null, share: null })}`} className="text-link min-h-target inline-flex items-center self-start hover:underline">
          {copy.switchLink}
        </Link>
      )}
    </div>
  );
}

function ChildLines({ view }: { view: HoldingView }) {
  const h = view.holding;
  return h.child?.route === "bank" ? <p className="text-sm text-muted-foreground">{copy.consolidation.bankChild}</p> : null;
}

// ---------------------------------------------------------------- scenario fix 2026-10-24: a study fund's liquidity

/** "נזיל מ־{date}" or "עוד לא נזיל: נזיל מ־{date}", from the first deposit or the checkbox, with TXH-09's chip. */
function LiquidityLine({ liq }: { liq: Liquidity }) {
  const c = copy.liquidity;
  if (liq.kind === "no-rule") return null;
  if (liq.kind === "unknown") return <p className="text-sm text-muted-foreground max-w-measure">{c.unknown}</p>;
  const notYet = liq.kind === "not-yet";
  return (
    <div className={cx("text-sm flex items-start gap-1.5", notYet ? "text-caution-foreground" : "text-positive")}>
      {notYet ? <IconClock size={16} className="shrink-0 mt-1" /> : <IconOk size={16} className="shrink-0 mt-1" />}
      <Sentence as="span">
        {liq.from ? (
          <>
            {notYet ? c.notYet : c.from}
            <Num value={liq.from} />
            {c.about}
          </>
        ) : (
          <>
            {c.overBefore}
            <YearsNum value={liq.lock} />
            {c.overAfter}
          </>
        )}{" "}
        <RuleRef id="TXH-09" />
      </Sentence>
    </div>
  );
}

/** One row of the block: its sentence from the rule base with the chips, or the open question when a rule is missing or open. */
function DecisionRow({ label, text, ids, ctx, children }: { label: string; text: string; ids: string[]; ctx: HoldingsCtx; children?: React.ReactNode }) {
  const bad = ids.find((id) => !ctx.rules[id] || ctx.rules[id]!.strength === "open");
  return (
    <li className="flex flex-col gap-1 border-t border-border pt-2 first:border-t-0 first:pt-0">
      <span className="font-medium">{label}</span>
      {bad ? (
        <p className="text-sm">
          <OpenQuestion code={bad} />
        </p>
      ) : (
        <p className="text-sm max-w-measure">
          {text} {ids.map((id) => <RuleRef key={id} id={id} />)}
        </p>
      )}
      {children}
    </li>
  );
}

/**
 * "הקרן נזילה: מה אפשר לעשות": the four things a person with a liquid study fund can do, one sentence each from the rule
 * base, then the fee against the average and the two links. Nothing here computes a number.
 */
function DecisionBlock({ view, ctx }: { view: HoldingView; ctx: HoldingsCtx }) {
  const d = copy.decision;
  const h = view.holding;
  return (
    <section aria-labelledby={`dec-${h.id}`} className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 md:p-4">
      <h4 id={`dec-${h.id}`} className="text-lg font-semibold">
        {d.heading}
      </h4>
      <ul className="flex flex-col gap-2">
        <DecisionRow label={d.stay.label} text={d.stay.text} ids={["TXH-18"]} ctx={ctx} />
        <DecisionRow label={d.switchTrack.label} text={d.switchTrack.text} ids={["TXH-17", "PF-23", "SW-15"]} ctx={ctx} />
        <DecisionRow label={d.move.label} text={d.move.text} ids={["PF-18", "SW-39"]} ctx={ctx}>
          <Link to={`/switch/${h.wrapperId}${playbookQueryString({ from: h.id, to: null, fundFrom: null, fundTo: null, share: null })}`} className="text-link min-h-target inline-flex items-center self-start hover:underline">
            {d.move.link}
          </Link>
        </DecisionRow>
        <DecisionRow label={d.withdraw.label} text={d.withdraw.text} ids={["TXH-09", "TXH-10", "TXH-11"]} ctx={ctx} />
      </ul>
      {view.cma && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{d.fee}</p>
          {h.feeBalance && (
            <Sentence size="sm">
              {record.feeBalance} <Num value={about(h.feeBalance as SiteValue, record.feeBalance)} />
            </Sentence>
          )}
          <FeeRefs view={view} kind="balance" />
        </div>
      )}
      <div className="flex flex-wrap gap-x-4">
        <Link to={`/fees?holding=${encodeURIComponent(h.id)}`} className="text-link min-h-target inline-flex items-center hover:underline">
          {copy.feeLinkLabel}
        </Link>
        <Link to="/goal/compare?mode=exposure" className="text-link min-h-target inline-flex items-center hover:underline">
          {d.exposureLink}
        </Link>
      </div>
    </section>
  );
}

const record = copy.recordLabels;
