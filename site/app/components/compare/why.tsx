// "X is best because Y" (design-system 6.4, flow 14): the headline built from the deciding formula's pattern,
// the sheet that sets the top two side by side, and the detail of one option.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { r2 } from "../../copy";
import { asParameter, parameterOf, type Breakdown, type ListedOption, type RankedOption } from "../../lib/compare";
import { fmt } from "../../lib/format";
import { relativeGap } from "@finance-tool/engine";
import { IconAlert, IconCheck } from "../icons";
import { Num, RulesLine } from "../provenance";
import { Callout, Tag, cx } from "../ui";
import type { ResultCtx } from "./ctx";

const NameLink = ({ id, name }: { id: string; name: string }) => (
  <Link to={`/guide/${id}`} className="text-link font-medium hover:underline">
    {name}
  </Link>
);

/** A list of names as Hebrew reads it: "א, ב ו־ג". */
function joinNames(items: ReactNode[]): ReactNode {
  return items.map((n, i) => (
    <Fragment key={i}>
      {i > 0 && (i === items.length - 1 ? " ו" : ", ")}
      {n}
    </Fragment>
  ));
}

export function thetaValue(ctx: ResultCtx) {
  const p = parameterOf(ctx.bundle, "P-01");
  return asParameter(p, (p as unknown as { value: import("@finance-tool/schema").ValueObject }).value);
}

/** The sentence under the h1, by what the ranking found. */
export function WhyHeadline({ ctx, onWhy }: { ctx: ResultCtx; onWhy: (el: HTMLElement) => void }) {
  const { view, mk, g } = ctx;
  const { ranked, headline } = view;
  const top = ranked[0];
  const second = ranked[1];
  const theta = thetaValue(ctx);
  let body: ReactNode = null;
  let showWhy = true;
  switch (headline) {
    case "excludes-all":
    case "nothing-ranked":
      return null;
    case "only-baseline": {
      const reasons = view.coverageRows.filter((r) => r.kind !== "ranked" && r.tier === 1).slice(0, 1);
      body = (
        <>
          {r2.result.onlyBaseline}{" "}
          {reasons.map((r) => (
            <span key={r.id}>
              {r.name}: {r.reasons[0] ? r2.outcomes[r.kind] : null}
            </span>
          ))}
        </>
      );
      showWhy = false;
      break;
    }
    case "single":
      body = (
        <>
          <NameLink id={top!.id} name={top!.name} /> {r2.result.headlineSingle}
        </>
      );
      showWhy = false;
      break;
    case "all-tied": {
      const gap = relativeGap(top!.real, ranked[ranked.length - 1]!.real);
      void gap;
      body = (
        <>
          {r2.result.allTied} <Num value={theta} />.
        </>
      );
      break;
    }
    case "tie": {
      const tied = ranked.filter((o) => view.topTie.includes(o.id));
      const gap = relativeGap(tied[0]!.real, tied[tied.length - 1]!.real) * 100;
      body = (
        <>
          {joinNames(tied.map((o) => <NameLink key={o.id} id={o.id} name={o.name} />))} {r2.result.tieMid} <Num value={mk.pct(gap, "F-80", r2.result.tieMid, {})} />
          {r2.result.tieThen} <Num value={theta} />.
        </>
      );
      break;
    }
    case "winner": {
      const deciding = view.topTwo?.deciding;
      const f = deciding?.formula ?? null;
      const favours = f !== null && deciding!.gaps[f] > 0;
      let reason: ReactNode = null;
      if (f && favours && second) {
        const d = deciding!;
        const years = mk.goal.horizon;
        if (f === "fee-drag") {
          reason = (
            <>
              {r2.result.reasonFee} <Num value={mk.nis(d.top.feeDrag, "F-61", r2.deciding["fee-drag"]!, top!)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(d.second.feeDrag, "F-61", r2.deciding["fee-drag"]!, second)} /> {r2.result.reasonFeeIn}
              <Num value={years} display={fmt.years(g.horizonYears)} />
            </>
          );
        } else if (f === "tax-at-exit") {
          reason = (
            <>
              {r2.result.reasonTax} <Num value={mk.nis(d.top.taxAtExit, "F-40", r2.deciding["tax-at-exit"]!, top!)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(d.second.taxAtExit, "F-40", r2.deciding["tax-at-exit"]!, second)} />
            </>
          );
        } else if (f === "deposit-side-relief") {
          reason = (
            <>
              {r2.result.reasonRelief} <Num value={mk.nis(-d.top.depositSideRelief, "F-30", r2.deciding["deposit-side-relief"]!, top!)} /> {r2.result.reasonFeeVs} <Num value={mk.nis(-d.second.depositSideRelief, "F-30", r2.deciding["deposit-side-relief"]!, second)} />
            </>
          );
        }
      }
      body = reason ? (
        <>
          <NameLink id={top!.id} name={top!.name} /> {r2.result.headlineAfter} {reason}.
        </>
      ) : (
        <>
          <NameLink id={top!.id} name={top!.name} /> {r2.result.headlineBare}
        </>
      );
      break;
    }
  }
  const secondary = headline === "winner" && top!.secondaryRules.length > 0;
  return (
    <div className="flex flex-col gap-2 max-w-measure" key={headline + (top?.id ?? "")}>
      <p className="text-lg">
        {body}
        {secondary && (
          <>
            {" "}
            <Tag tone="caution" icon={<IconAlert size={14} />}>
              {r2.result.secondarySource}
            </Tag>
          </>
        )}
      </p>
      {showWhy && ranked.length > 1 && (
        <button type="button" onClick={(e) => onWhy(e.currentTarget)} className="text-link min-h-target self-start px-2 -ms-2 rounded-md hover:underline">
          {r2.result.why}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- breakdown rows

type Row = { key: keyof Breakdown; label: string; formula: string; deciding: boolean };

function rowsFor(ctx: ResultCtx, deciding: string | null | undefined, a: RankedOption): Row[] {
  const w = ctx.bundle.wrappers.find((x) => x.id === a.id)!;
  return [
    { key: "relief", label: r2.result.whyRows.relief, formula: "F-30", deciding: deciding === "deposit-side-relief" },
    { key: "fees", label: r2.result.whyRows.fees, formula: "F-61", deciding: deciding === "fee-drag" },
    { key: "taxDuring", label: r2.result.whyRows.taxDuring, formula: w.record.tax_during.formula, deciding: deciding === "tax-at-exit" },
    { key: "taxExit", label: r2.result.whyRows.taxExit, formula: w.record.tax_at_exit.formula, deciding: deciding === "tax-at-exit" },
    { key: "lockUp", label: r2.result.whyRows.lockUp, formula: "B3", deciding: deciding === "lock-up" },
    { key: "result", label: r2.result.whyRows.result, formula: "F-06", deciding: false },
  ];
}

/** The dimensions the rules of one option carry and the other's do not (the "what differed" rows). */
function differing(ctx: ResultCtx, a: RankedOption, b: RankedOption): string[] {
  const dims = (o: RankedOption) => new Set(o.usedRules.flatMap((u) => u.dimensions));
  const da = dims(a);
  const db = dims(b);
  const names = new Map(ctx.bundle.checklist.map((r) => [r.id, r.name]));
  return [...new Set([...da, ...db])].filter((d) => da.has(d) !== db.has(d)).map((d) => names.get(d) ?? d);
}

export function WhySheetBody({ ctx, headId }: { ctx: ResultCtx; headId: string }) {
  const { view, mk } = ctx;
  const tied = view.topTie.length > 1;
  const a = view.ranked[0]!;
  const b = view.ranked[1]!;
  const deciding = tied ? null : view.topTwo?.deciding.formula;
  const rowsA = rowsFor(ctx, deciding, a);
  const rowsB = rowsFor(ctx, deciding, b);
  const diff = differing(ctx, a, b);
  const rules = [...new Set([...a.usedRules, ...b.usedRules].map((u) => u.id))];
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        {r2.result.whyTitle} <bdi>{a.name}</bdi> {r2.result.whyBefore} <bdi>{b.name}</bdi>
      </h2>
      <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_auto] gap-x-4 text-sm items-baseline">
        <span />
        <span className="font-medium text-end"><bdi>{a.name}</bdi></span>
        <span className="font-medium text-end"><bdi>{b.name}</bdi></span>
        {rowsA.map((r, i) => (
          <Fragment key={r.key}>
            <span className={cx("py-2 border-b border-border flex items-center gap-2", r.deciding && "bg-computed-subtle -mx-2 px-2 rounded-s-md")}>
              {r.label}
              {r.deciding && <Tag tone="computed">{r2.result.whyDeciding}</Tag>}
            </span>
            <span className={cx("py-2 border-b border-border text-end", r.deciding && "bg-computed-subtle")}>
              <Num value={mk.nis(a.breakdown[r.key], r.formula, r.label, a)} />
            </span>
            <span className={cx("py-2 border-b border-border text-end", r.deciding && "bg-computed-subtle -me-2 pe-2 rounded-e-md")}>
              <Num value={mk.nis(b.breakdown[rowsB[i]!.key], rowsB[i]!.formula, r.label, b)} />
            </span>
          </Fragment>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">{r2.result.whyDiffers}</h3>
        {diff.length === 0 ? (
          <p className="text-sm text-muted-foreground">{r2.result.whyNone}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {diff.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <IconCheck size={16} className="text-positive" />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
      <RulesLine ids={rules} />
    </div>
  );
}

/** The decomposition of one option (F-61 style): what each part took, the rules, the dimensions its rules carry. */
export function DetailSheetBody({ ctx, option, headId }: { ctx: ResultCtx; option: RankedOption | ListedOption; headId: string }) {
  const { mk } = ctx;
  const ranked = "run" in option;
  const breakdown = option.breakdown;
  const run = ranked ? (option as RankedOption).run : (option as ListedOption).candidate.run;
  const w = ctx.bundle.wrappers.find((x) => x.id === option.id)!;
  const rows: Row[] = [
    { key: "relief", label: r2.result.whyRows.relief, formula: "F-30", deciding: false },
    { key: "fees", label: r2.result.whyRows.fees, formula: "F-61", deciding: false },
    { key: "taxDuring", label: r2.result.whyRows.taxDuring, formula: w.record.tax_during.formula, deciding: false },
    { key: "taxExit", label: r2.result.whyRows.taxExit, formula: w.record.tax_at_exit.formula, deciding: false },
    { key: "lockUp", label: r2.result.whyRows.lockUp, formula: "B3", deciding: false },
    { key: "result", label: r2.result.whyRows.result, formula: "F-06", deciding: false },
  ];
  const rules = (ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules).map((u) => u.id);
  const dims = new Set((ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules).flatMap((u) => u.dimensions));
  const names = ctx.bundle.checklist.filter((r) => dims.has(r.id));
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        <bdi>{option.name}</bdi>
      </h2>
      {breakdown && run ? (
        <dl className="readout">
          {rows.map((r) => (
            <div key={r.key} className="readout-row">
              <dt>{r.label}</dt>
              <dd>
                <Num value={mk.nis(breakdown[r.key], r.formula, r.label, { usedRules: ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules, flags: run.flags })} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {names.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {names.map((d) => (
            <li key={d.id} className="flex items-center gap-2">
              <IconCheck size={16} className="text-positive" />
              {d.name}
            </li>
          ))}
        </ul>
      )}
      <RulesLine ids={rules} />
      {!ranked && (option as ListedOption).blockedBy.length > 0 && <Callout tone="blocked">{r2.result.listedBlockedBefore} {(option as ListedOption).blockedBy.join(", ")}</Callout>}
    </div>
  );
}
