// The switching-cost line (design-system 8.6): four forms with their rule chips (the brokerage sentence, the provident
// "costs nothing", the in-kind sentence, the refusals) and the lock for an open or missing rule.
import type { SwitchingCost } from "@finance-tool/engine";
import { r4playbook as c } from "../../copy";
import { fmt } from "../../lib/format";
import type { BrokerageCostResult } from "../../lib/playbook";
import type { SiteValue } from "../../lib/value";
import { hebrewPrefix } from "../../lib/hebrew";
import { OpenQuestionChip } from "./step";
import { IconLock } from "../icons";
import { IconOk } from "../compare/icons";
import { Num, RuleRef, StrengthLabel } from "../provenance";
import { Callout, Card, Sentence, Tag } from "../kit";

export type CostView =
  | { kind: "loading" }
  | { kind: "brokerage"; r: Extract<BrokerageCostResult, { kind: "ok" }> }
  | { kind: "error"; code: string }
  | { kind: "engine"; cost: SwitchingCost }
  | { kind: "in-kind"; fee: SiteValue | null; secondaryRules: string[] };

const C = c.cost;

function Rules({ ids }: { ids: readonly string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      {ids.map((id) => (
        <RuleRef key={id} id={id} />
      ))}
    </span>
  );
}

function Locked({ id }: { id: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <Tag tone="blocked" icon={<IconLock size={14} />}>
        {C.open}
      </Tag>
      <RuleRef id={id} />
    </p>
  );
}

function Brokerage({ r }: { r: Extract<BrokerageCostResult, { kind: "ok" }> }) {
  const n = r.cost.value as number;
  const saves = n < 0;
  const cost = saves ? c.cost.brokerageSaves : C.brokerage;
  return (
    <>
      <p className="text-lg font-medium">
        {C.brokerage.before.slice(0, -1)}
        <bdi>{hebrewPrefix(C.brokerage.before.slice(-1), r.from.name)}</bdi>
        {" "}
        <bdi>{hebrewPrefix(C.brokerage.mid.trim(), r.to.name)}</bdi>
        {saves ? c.cost.brokerageSaves.after : C.brokerage.after}
        <Num value={r.cost} display={fmt.nis(Math.abs(n))} />
        {saves ? c.cost.brokerageSaves.tax : C.brokerage.tax}
        <Num value={r.taxAtSwitch} />
        {cost.end}
      </p>
      <Sentence size="sm" tone="muted">
        {C.brokerageDetail.before}
        <Num value={r.realNoSwitch} />
        {C.brokerageDetail.mid}
        <Num value={r.realWithSwitch} />
        {C.brokerageDetail.after}
        <Num value={r.netProceeds} />
        {C.brokerageDetail.end}
      </Sentence>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {r.secondary && <Tag tone="caution">{C.secondary}</Tag>}
        <Rules ids={r.cost.rule_ids ?? []} />
      </div>
    </>
  );
}

function Engine({ cost }: { cost: SwitchingCost }) {
  if (cost.kind === "provident") {
    return (
      <>
        <p className="flex items-center gap-2 text-lg font-medium">
          <IconOk size={20} className="text-positive shrink-0" />
          <span>{C.provident}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Rules ids={cost.ruleIds} />
          {cost.labels.some((l) => l.code === "secondary-source") && <StrengthLabel strength="secondary" />}
        </div>
        <ul className="list-disc ps-5 flex flex-col gap-1 text-sm">
          <li>
            {C.providentLines[0]} <RuleRef id="PF-14" /> <RuleRef id="SW-15" />
          </li>
          <li>
            {C.providentLines[1]} <StrengthLabel strength="institution" />
          </li>
        </ul>
      </>
    );
  }
  if (cost.kind === "not-allowed") {
    return (
      <>
        <p className="text-lg font-medium">{C.hishtalmutPartial}</p>
        <Rules ids={cost.ruleIds} />
      </>
    );
  }
  if (cost.kind === "not-evaluated" && cost.code === "different-kind") {
    return (
      <>
        <p className="text-lg font-medium">{C.differentKinds}</p>
        <Rules ids={cost.ruleIds} />
      </>
    );
  }
  if (cost.kind === "not-evaluated") return <Locked id={cost.ruleIds[0] ?? ""} />;
  return null;
}

function InKind({ fee }: { fee: SiteValue | null }) {
  return (
    <>
      <p className="text-lg font-medium">{C.inKind}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <RuleRef id="SW-36" />
        <StrengthLabel strength="institution" />
        <OpenQuestionChip code="SW OQ11" />
      </div>
      <Sentence size="sm">
        {C.transferFee.amount}
        {fee ? <Num value={fee} /> : C.transferFee.none} <RuleRef id="SW-33" /> <RuleRef id="SW-34" />
      </Sentence>
    </>
  );
}

export function SwitchingCostLine({ view, className, children }: { view: CostView; className?: string; children?: React.ReactNode }) {
  return (
    <Card as="section" className={className ?? "flex flex-col gap-2.5"} aria-label={C.heading}>
      {view.kind === "loading" && <p className="text-sm text-muted-foreground">{C.loading}</p>}
      {view.kind === "brokerage" && <Brokerage r={view.r} />}
      {view.kind === "error" && <Callout tone="info">{C.notEvaluated} {C.reasons[view.code] ?? C.reasons.engine}</Callout>}
      {view.kind === "engine" && <Engine cost={view.cost} />}
      {view.kind === "in-kind" && <InKind fee={view.fee} />}
      {children}
    </Card>
  );
}
