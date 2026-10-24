// F-83 reasons in words (copy 6.2): the engine returns a code with rule and gap IDs; the words come first
// and the code after. A reason the person can fix links to the field; a reason the site must fix names what is open.
import { Link } from "react-router";
import { ownTermsCopy, r2, scnCompare } from "../../copy";
import type { CoverageRow, ListedOption, ReasonView } from "../../lib/compare";
import { addMonths, equityFit, fitDropOf, openConstraintCode } from "../../lib/compare";
import { Tpl } from "../exposure-mode/tpl";
import type { FieldKey } from "../../lib/goal";
import { Num, RuleRef } from "../provenance";
import type { ResultCtx } from "./ctx";

const profileFields: FieldKey[] = ["age", "salary", "employment"];

function Code({ ids }: { ids: readonly string[] }) {
  if (ids.length === 0) return null;
  return (
    <>
      {" "}
      {ids.map((id) => (
        <bdi key={id} dir="ltr" className="text-xs slashed-zero ms-1">
          {id}
        </bdi>
      ))}
    </>
  );
}

function Rules({ ids }: { ids: readonly string[] }) {
  if (ids.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 ms-1.5 align-middle">
      {ids.map((id) => (
        <RuleRef key={id} id={id} />
      ))}
    </span>
  );
}

/** One reason as a line of words with its codes after; `row` carries the routed sum and the names. */
export function ReasonText({ r, id, ctx, routed }: { r: ReasonView; id: string; ctx: ResultCtx; routed?: number }) {
  const c = r2.result.reasons;
  const names = ctx.view.names;
  const field = r.field ? (
    profileFields.includes(r.field) ? (
      <Link to="/goal" className="text-link hover:underline">
        {r.field === "age" ? c.enterAge : r.field === "salary" ? c.enterSalary : c.enterEmployment}
      </Link>
    ) : (
      <button type="button" className="text-link hover:underline" onClick={() => ctx.openField(r.field!)}>
        {r.field === "return" ? c.enterReturn : r.field === "insurance" ? c.enterInsurance : c.enterSalary}
      </button>
    )
  ) : null;
  switch (r.code) {
    case "not-own-money":
      return (
        <>
          {c.notOwnMoney}
          <Rules ids={r.ruleIds} />
        </>
      );
    case "not-withdrawable-any-time":
      return (
        <>
          {c.excludedBefore} <span className="text-entered">{r2.result.constraintAnytime}</span>
          <Rules ids={r.ruleIds} />
        </>
      );
    case "missing-input":
      if (field) return <>{r2.outcomes["not-evaluated"]}: {field}</>;
      return <>{id === "savings-plan" ? c.savingsPlan : c.noTerms}</>;
    case "missing-record":
      return <>{c.noTerms}</>;
    case "tier-2":
      return (
        <>
          {c.tier2}: <bdi dir="ltr" className="text-xs">{r.detail}</bdi>
          <Code ids={r.gapIds} />
        </>
      );
    case "no-run":
      return <>{c.noRun}</>;
    case "gap":
      return (
        <>
          {r.gapIds.includes("G-30") ? c.renewable : c.gap}
          <Code ids={r.gapIds} />
        </>
      );
    case "rule-missing":
      return (
        <>
          {c.ruleMissing}
          <Rules ids={r.ruleIds} />
        </>
      );
    case "rule-open": {
      if (fitDropOf(r) !== null) {
        const cap = equityFit(ctx.bundle)?.maxFall;
        return <Tpl t={scnCompare.fitDrop} vars={{ drop: cap ? <Num value={cap} /> : `${fitDropOf(r)}%` }} />;
      }
      const code = openConstraintCode(r);
      if (code)
        return (
          <>
            {ownTermsCopy.openMinimum} <bdi dir="ltr" className="text-xs slashed-zero">{code}</bdi>
          </>
        );
      return (
        <>
          {c.ruleOpen}
          <Rules ids={r.ruleIds} />
        </>
      );
    }
    case "figure-not-updated":
      return (
        <>
          {c.figureNotUpdated}
          <Rules ids={r.ruleIds} />
        </>
      );
    case "idle-cash-not-run":
      return <>{c.noRun}</>;
    case "employee-study-fund":
      // a product-decision id (D15) is not shown after the words (hebrew-editor request, 2026-10-24)
      return <>{r2.result.listedEmployee}</>;
    case "ceiling-partial": {
      // A11: what the ceiling is and what stays outside it, in words that say what happened to this goal's money
      const ceiling = ctx.bundle.wrappers.find((w) => w.id === id)?.record.ceiling?.amount;
      return (
        <>
          {r2.result.listedCeilingBefore} {ceiling ? <Num value={ceiling as never} /> : null} {r2.result.listedCeilingMid} {routed !== undefined ? <Num value={ctx.mk.nis(routed, "F-05", r2.result.listedCeilingBefore)} /> : null} {r2.result.listedCeilingAfter}
          <Rules ids={r.ruleIds} />
        </>
      );
    }
    case "locked-until":
    case "locked-to-age": {
      const date = r.untilMonth !== undefined ? addMonths(ctx.bundle.runDate, r.untilMonth) : null;
      return (
        <>
          {r2.result.listedLocked} {date ? <Num value={ctx.mk.date(date, r2.lockedUntil)} /> : null}
          {r2.result.listedLockedAfter}
          <Rules ids={r.ruleIds} />
        </>
      );
    }
    case "exit-blocked":
      return (
        <>
          {r2.result.listedBlockedBefore}
          <Code ids={[...r.gapIds]} />
          <Rules ids={r.ruleIds.filter((x) => !/OQ/.test(x))} />
          {r.ruleIds.filter((x) => /OQ/.test(x)).map((x) => (
            <bdi key={x} dir="ltr" className="text-xs ms-1">
              {x.replace("-OQ", " OQ")}
            </bdi>
          ))}
        </>
      );
    case "held-as-underlying":
      return (
        <>
          {r2.result.listedHeldBefore} <bdi>{names[r.detail ?? ""] ?? r.detail}</bdi>
          {r2.result.listedHeldAfter}
          <Rules ids={r.ruleIds} />
        </>
      );
  }
}

/** The reasons of a coverage row or a listed option, one line each. */
export function ReasonLines({ row, ctx }: { row: CoverageRow | ListedOption; ctx: ResultCtx }) {
  const routed = (row as ListedOption).candidate?.routed ?? ctx.view.evaluated.candidates.find((c) => c.id === row.id)?.routed;
  return (
    <>
      {row.reasons.map((r, i) => (
        <span key={i} className="block">
          <ReasonText r={r} id={row.id} ctx={ctx} routed={routed} />
        </span>
      ))}
    </>
  );
}
