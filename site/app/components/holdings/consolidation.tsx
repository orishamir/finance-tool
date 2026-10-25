// The consolidation card and the child-savings card (design-system 7.6, flow 24). The consolidation card says what the
// transfer rules allow and what the fees would save; it recommends nothing ("listed, not ranked", B3). The
// child-savings card shows the blocked default check (CS OQ10) and what the rule base does know.
import { Link } from "react-router";
import { r3holdings as copy, r4playbook as playbookCopy } from "../../copy";
import { playbookQueryString, playbookWrappers } from "../../lib/playbook";
import { fmt } from "../../lib/format";
import type { ConsolidationGroup, Fit, HoldingView } from "../../lib/holdings";
import { IconBan, IconDash, IconDashed, IconHelp, IconOk } from "../compare/icons";
import { IconLock } from "../icons";
import { LeadTail, Num, RuleRef } from "../provenance";
import { Callout, Card, cx, Disclosure, Sentence, Tag } from "../kit";
import { OpenQuestion, RuleBullet, RuleText, YearsNum, type RuleMap } from "./shared";
import { fit as fitCopy } from "../../copy";

const c = copy.consolidation;

function Outcome({ group }: { group: ConsolidationGroup }) {
  const o = group.outcome;
  if (o === "allowed" || o === "allowed-separate-account")
    return (
      <h3 className="flex items-center gap-2 text-lg font-medium text-positive">
        <IconOk size={20} />
        <span className="text-foreground">{o === "allowed" ? c.outcomes.allowed : c.separate}</span>
      </h3>
    );
  if (o === "not-allowed")
    return (
      <h3 className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
        <IconBan size={20} />
        <span className="text-foreground">{c.outcomes.notAllowed}</span>
      </h3>
    );
  if (o === "blocked")
    return (
      <h3 className="flex items-center gap-2 text-lg font-medium text-blocked">
        <IconLock size={20} />
        <span className="text-foreground">{c.outcomes.blocked}</span>
      </h3>
    );
  return (
    <h3 className="flex items-center gap-2 text-lg font-medium text-caution">
      <IconDashed size={20} />
      <span className="text-foreground">{c.outcomes.notSourced}</span>
    </h3>
  );
}

function TargetMark({ fit }: { fit: Fit }) {
  const t = c.targetMark;
  const word = fit === "fits" ? t.fits : fit === "no-fit" ? t.noFit : null;
  const Icon = fit === "fits" ? IconOk : fit === "no-fit" ? IconDash : IconHelp;
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-sm", fit === "fits" ? "text-positive" : "text-muted-foreground")}>
      <Icon size={16} />
      {word ? (
        <span className="text-foreground">
          {t.before} {word} {t.after}
        </span>
      ) : (
        <span>{fit === "no-rule" ? fitCopy.marks["no-rule"] : fit === "no-goal" ? t.noGoal : t.noTrack}</span>
      )}
    </span>
  );
}

export function ConsolidationCard({ group, views, rules }: { group: ConsolidationGroup; views: HoldingView[]; rules: RuleMap }) {
  const byId = new Map(views.map((v) => [v.holding.id, v]));
  const target = group.target ? byId.get(group.target.holdingId) : undefined;
  const route = group.route;
  const conditionIds = [...new Set(group.conditionRules)];
  const [first, ...rest] = conditionIds;
  return (
    <Card as="article" className="flex flex-col gap-3" aria-label={group.wrapperName}>
      <Outcome group={group} />
      <p className="text-sm text-muted-foreground">
        <bdi>{group.holdingIds.map((id) => byId.get(id)?.companyName).filter(Boolean).join(" · ")}</bdi>
      </p>

      {group.sameManager ? (
        <p className="text-sm">{c.sameManager}</p>
      ) : (
        <>
          {route && route.ruleIds.length > 0 && (
            <p className="text-sm flex flex-wrap items-center gap-x-1.5">
              <span>
                {group.wrapperName} {c.route.mid}
                {group.wrapperName}
                {c.route.after}
              </span>
              {route.ruleIds.slice(0, 3).map((id) => (
                <RuleRef key={id} id={id} />
              ))}
            </p>
          )}

          {group.outcome === "allowed-separate-account" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm">{c.separateLine}</p>
              <RuleText id="SW-39" rules={rules} />
            </div>
          )}

          {group.notYet && (
            <div className="text-sm flex items-start gap-1.5">
              <IconLock size={16} className="text-muted-foreground shrink-0 mt-1" />
              <Sentence as="span">
                {c.notYet.before} <Num value={group.notYet.liquidFrom} /> {c.notYet.after}
                {group.notYet.ruleIds.map((id) => (
                  <span key={id}> <RuleRef id={id} /></span>
                ))}
              </Sentence>
            </div>
          )}

          {group.missingFirstDeposit && <p className="text-sm text-caution-foreground">{c.missingFirstDeposit}</p>}

          {conditionIds.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{c.conditions}</span>
              <ul className="list-disc ps-5 flex flex-col gap-1">
                {first && rules[first]?.text_he && (
                  <li className="text-sm">
                    {rules[first]!.text_he} <RuleRef id={first} />
                  </li>
                )}
                {(rules[first ?? ""]?.text_he ? rest : conditionIds).map((id) => (
                  <RuleBullet key={id} id={id} rules={rules} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {group.worth && target && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <p>
            {c.worth.before}
            <bdi>{target.holding.track?.name ?? target.companyName}</bdi> {c.worth.after} <Num value={group.worth} size="figure" className="!text-2xl" /> <LeadTail lead={c.worth.mid}>
              <YearsNum value={group.worth.computed_from!.inputs["שנים"] as never} />
            </LeadTail>
            {c.worth.end}
          </p>
          {group.target && <TargetMark fit={group.target.fit} />}
        </div>
      )}
      {group.noSaving && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <p className="text-sm">{c.noSaving}</p>
          {group.target && <TargetMark fit={group.target.fit} />}
        </div>
      )}
      {group.worthUnavailable && !group.sameManager && <p className="text-sm text-muted-foreground border-t border-border pt-3">{c.worthUnavailable[group.worthUnavailable]}</p>}

      {!group.sameManager && group.outcome !== "not-sourced" && (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">{c.costHeading}</span>
          <ul className="list-disc ps-5 flex flex-col gap-1">
            {group.costRules.filter((id) => rules[id]).map((id) => (
              <RuleBullet key={id} id={id} rules={rules} />
            ))}
          </ul>
        </div>
      )}
      {playbookWrappers.includes(group.wrapperId) && (
        <Link to={`/switch/${group.wrapperId}${playbookQueryString({ from: group.holdingIds.find((id) => id !== group.target?.holdingId) ?? group.holdingIds[0] ?? null, to: group.target?.holdingId ?? null, fundFrom: null, fundTo: null, share: null })}`} className="text-link min-h-target inline-flex items-center self-start hover:underline">
          {playbookCopy.links.playbook}
        </Link>
      )}
    </Card>
  );
}

/** Different wrapper types are never offered for consolidation: one line says why (PF-17 lists the routes by type). */
export function DifferentTypesLine({ workbenchHref }: { workbenchHref: string }) {
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
      <span>{c.differentTypes}</span>
      <RuleRef id="PF-17" />
      <Link to={workbenchHref} className="text-link min-h-target inline-flex items-center hover:underline">
        {c.differentTypesLink}
      </Link>
    </p>
  );
}

/** The child-savings card: the default check is blocked (CS OQ10); under it what the rule base does know. */
export function ChildSavingsCard({ rules, bankHoldings }: { rules: RuleMap; bankHoldings: number }) {
  const ch = copy.child;
  const known = ["CS-07", "CS-26", "CS-20", "CS-21", "CS-18"];
  return (
    <Card className="flex flex-col gap-3">
      <Callout tone="blocked">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ch.blocked}</span>
          <OpenQuestion code={ch.blockedCode} />
        </span>
      </Callout>
      {bankHoldings > 0 && (
        <p className="text-sm flex flex-wrap items-center gap-x-1.5">
          <span>{c.bankChild}</span>
          <RuleRef id="CS-12" />
        </p>
      )}
      <h4 className="text-base font-semibold">{ch.known}</h4>
      <div className="flex flex-col gap-2.5">
        {known.map((id) => (
          <RuleText key={id} id={id} rules={rules} />
        ))}
        {bankHoldings > 0 && rules["CS-12"] && <RuleText id="CS-12" rules={rules} />}
      </div>
    </Card>
  );
}

void Tag;
void Disclosure;
