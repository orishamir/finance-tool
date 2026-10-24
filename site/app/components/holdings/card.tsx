// The holding card (design-system 7.5, flow 23): the track as the data writes it, the regulator's facts as sourced
// values, the balance and fees as the person entered them with the references under each fee, the fit mark against
// the saved goal, F-61's fee line and the link to the fee page. A card, not a table: each holding carries four kinds
// of information in four states (D7) and a table would flatten them.
import { useState } from "react";
import { Link } from "react-router";
import { fit as fitCopy, r3holdings as copy } from "../../copy";
import { feeYear, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { isChild, type HoldingView, type HoldingsCtx } from "../../lib/holdings";
import { IconAlert, IconClock, IconLock } from "../icons";
import { IconDash, IconHelp, IconOk } from "../compare/icons";
import { Num, RuleRef } from "../provenance";
import { Button, Card, Disclosure, Tag, cx } from "../ui";
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
      </header>

      <Disclosure label={<span className="font-medium">{copy.detailsOpen}</span>} defaultOpen className="md:[&>summary]:hidden" summaryClassName="md:hidden">
        <div className="grid gap-5 md:grid-cols-2 md:gap-8 pt-1">
          <div className="flex flex-col gap-3 min-w-0">
            {view.cma && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">{record.classification}</dt>
                <dd>{view.cma.classification ? <Num value={sourcedText(view.cma.classification, view.cma.period, record.classification)} /> : <span className="text-muted-foreground">{copy.noClassification.split(",")[0]}</span>}</dd>
                <dt className="text-muted-foreground">{record.period}</dt>
                <dd>
                  <Num value={about(view.cma.period, record.period)} />
                </dd>
              </dl>
            )}
            <dl className="flex flex-col gap-3">
              <Fact label={record.balance} value={about(h.balance as SiteValue, record.balance)} />
              {!child && h.feeBalance && (
                <div className="flex flex-col gap-1">
                  <Fact label={record.feeBalance} value={about(h.feeBalance as SiteValue, record.feeBalance)} />
                  <FeeRefs view={view} kind="balance" />
                  <CapLines view={view} kind="balance" />
                </div>
              )}
              {!child && h.feeDeposit && (
                <div className="flex flex-col gap-1">
                  <Fact label={record.feeDeposit} value={about(h.feeDeposit as SiteValue, record.feeDeposit)} />
                  <FeeRefs view={view} kind="deposit" />
                  <CapLines view={view} kind="deposit" />
                </div>
              )}
              {!child && h.directExpenses && <Fact label={record.directExpenses} value={about(h.directExpenses as SiteValue, record.directExpenses)} />}
            </dl>
            {unmatched && <p className="text-sm text-muted-foreground max-w-measure">{copy.unmatchedLine}</p>}
          </div>

          <div className="flex flex-col gap-3 min-w-0">
            {!child && <FitLine view={view} ctx={ctx} />}
            {child ? <ChildLines view={view} /> : <FeeLine view={view} />}
          </div>
        </div>
      </Disclosure>

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-2 -mb-2">
        {confirm ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm">{copy.deleteConfirm}</span>
            <Button variant="quiet" className="text-destructive" onClick={onDelete}>
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

function Fact({ label, value }: { label: string; value: SiteValue }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-base">
        <Num value={value} />
      </dd>
    </div>
  );
}

/** Under each fee, its two references: the track's own average (sourced) and the class mean and median (computed, F-68). */
function FeeRefs({ view, kind }: { view: HoldingView; kind: "balance" | "deposit" }) {
  const cma = view.cma;
  if (!cma) return null;
  const avg = kind === "balance" ? cma.avgBalance : cma.avgDeposit;
  const year = feeYear(avg);
  const ref = view.reference;
  const r = copy.classRef;
  return (
    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
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
      {ref && (kind === "balance" ? ref.count : ref.countDeposit).value !== 0 ? (
        <p>
          {r.before} <bdi>{ref.classification}</bdi>: <Num value={kind === "balance" ? ref.meanBalance : ref.meanDeposit} /> {r.mid}{" "}
          <Num value={kind === "balance" ? ref.medianBalance : ref.medianDeposit} />
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
    <p className="text-sm text-caution-foreground flex flex-wrap items-center gap-x-1.5">
      <IconAlert size={16} className="text-caution shrink-0" />
      <span>{copy.capAbove}</span>
      <Num value={w.cap} />
      <RuleRef id={w.ruleId} />
    </p>
  );
}

/** The fit mark as on a track page (design-spec 10): icon and word, never red; the goal line; a stale clock. */
function FitLine({ view, ctx }: { view: HoldingView; ctx: HoldingsCtx }) {
  const m = view.fit;
  if (m === "no-goal") {
    return (
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-muted-foreground">
          <IconHelp size={20} />
          <span className="font-medium">{copy.fitNoGoal}</span>
        </p>
        <Link to="/goal" className="text-link min-h-target inline-flex items-center self-start hover:underline">
          {copy.fitNoGoalLink}
        </Link>
      </div>
    );
  }
  if (m === "no-track") {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <IconHelp size={20} />
        <span>{copy.fitNoTrack}</span>
      </p>
    );
  }
  const Icon = m === "fits" ? IconOk : m === "no-fit" ? IconDash : IconHelp;
  const rule = view.fitRule;
  return (
    <div className="flex flex-col gap-1.5">
      <p className={cx("flex items-center gap-2", m === "fits" ? "text-positive" : "text-muted-foreground")}>
        <Icon size={20} />
        <span className="text-lg font-medium">{fitCopy.marks[m]}</span>
        {view.cma?.stale && <IconClock size={16} className="text-caution" />}
      </p>
      {ctx.goal && (
        <p className="text-sm">
          {copy.fitGoalLine}
          <bdi>{ctx.goal.name}</bdi>
          {copy.fitGoalMid}
          {fmt.years(ctx.goal.years)}.
        </p>
      )}
      {rule?.minYears && (
        <p className="text-sm text-muted-foreground">
          {copy.fitRuleBefore}
          <bdi>{rule.classification}</bdi>
          {copy.fitRuleAfter} <YearsNum value={rule.minYears} />
        </p>
      )}
      {view.cma?.stale && (
        <p className="text-sm text-caution-foreground">
          {copy.staleLine} <bdi dir="ltr">{fmt.period(String(view.cma.period.value))}</bdi>.
        </p>
      )}
    </div>
  );
}

/** "העמלות יעלו {סכום} ב־{שנים}, בכסף של היום." with the pre-tax tag, and the link to the fee page. */
function FeeLine({ view }: { view: HoldingView }) {
  const f = view.fees;
  const id = view.holding.id;
  return (
    <div className="flex flex-col gap-1.5">
      {f.kind === "ok" ? (
        <>
          <p>
            {copy.feeLine.before} <Num value={f.cost.total} size="figure" className="!text-2xl" /> {copy.feeLine.mid}
            <YearsNum value={f.cost.horizonYears} />
            {copy.feeLine.after}
          </p>
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
        <>
          <p>{copy.feeLineNoGoal}</p>
          <Link to="/goal" className="text-link min-h-target inline-flex items-center self-start hover:underline">
            {copy.fitNoGoalLink}
          </Link>
        </>
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
        <p className="text-sm text-muted-foreground">{copy.feeFailed}</p>
      )}
      <Link to={`/fees?holding=${encodeURIComponent(id)}`} className="text-link min-h-target inline-flex items-center self-start hover:underline">
        {copy.feeLinkLabel}
      </Link>
    </div>
  );
}

function ChildLines({ view }: { view: HoldingView }) {
  const h = view.holding;
  return h.child?.route === "bank" ? <p className="text-sm text-muted-foreground">{copy.consolidation.bankChild}</p> : null;
}
