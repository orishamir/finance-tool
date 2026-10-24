// A row's reason in words (copy 9.2): the engine's codes for an exposure, the site's own for a row that cannot run
// yet, and the wrapper-mode reasons (a lock, a blocked exit) through the same text as release 2.
import type { ReactNode } from "react";
import { r2, r5 } from "../../copy";
import { fmt } from "../../lib/format";
import type { ExposureRowView, RowReason } from "../../lib/exposure-mode";
import type { ReasonView } from "../../lib/compare";
import { ReasonText } from "../compare/reasons";
import type { ResultCtx } from "../compare/ctx";
import { IconExternal } from "../icons";
import { Tpl } from "./tpl";
import type { ExpCtx } from "./ctx";

/** The release 2 reason component takes a wrapper-mode page context; it reads only the names, the run date, the value factory and a field opener. */
export function asResultCtx(ctx: ExpCtx): ResultCtx {
  return { bundle: ctx.bundle, view: { names: ctx.names, ranked: [] } as unknown as ResultCtx["view"], g: ctx.g, mk: ctx.mk, mode: ctx.mode, openField: () => {} };
}

export function ExposureReason({ row, ctx }: { row: ExposureRowView; ctx: ExpCtx }): ReactNode {
  const c = r5.exposure.coverageReasons;
  const one = (r: RowReason, i: number): ReactNode => {
    switch (r.code) {
      case "p08-gov":
        return <span key={i} className="block">{r5.exposure.p08.gov}</span>;
      case "no-fund":
        return <span key={i} className="block">{c.noFund}</span>;
      case "no-terms":
        return <span key={i} className="block">{c.noTerms}</span>;
      case "no-wrapper":
        return <span key={i} className="block">{c.noWrapper}</span>;
      case "engine": {
        const e = r.reason;
        if (e.code === "loss-filter" && row.exclusion)
          return (
            <span key={i} className="block">
              <Tpl t={c.excluded.replace(/ D11$/, "")} vars={{ worst: <bdi dir="ltr" className="text-entered">{fmt.pct(row.exclusion.worst)}</bdi>, accepted: <bdi dir="ltr" className="text-entered">{fmt.pct(row.exclusion.accepted)}</bdi> }} />
            </span>
          );
        if (e.code === "no-sourced-series")
          return (
            <span key={i} className="block">
              {c.noSeries.replace(/ D20$/, "")}
              {ctx.bundle.cashLink && (
                <>
                  {" "}
                  <a href={ctx.bundle.cashLink.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline">
                    {r5.exposure.fields.noSeriesLink}
                    <IconExternal size={16} />
                  </a>
                </>
              )}
            </span>
          );
        if (e.code === "wrapper-cannot-hold") return <span key={i} className="block"><Tpl t={c.cannotHold} vars={{ wrapper: <bdi>{ctx.names[e.detail ?? ""] ?? e.detail}</bdi> }} /></span>;
        if (e.code === "missing-input" && /grossReturn/.test(e.detail ?? "")) return <span key={i} className="block">{c.noReturn}</span>;
        if (e.code === "missing-input" && e.detail === "wrapper") return <span key={i} className="block">{c.noWrapper}</span>;
        const view: ReasonView = { ...e };
        return (
          <span key={i} className="block">
            {row.kind === "listed-not-ranked" && row.holding.name ? <Tpl t={r5.exposure.listedThrough} vars={{ wrapper: <bdi>{row.holding.name}</bdi>, reason: <ReasonText r={view} id={row.holding.wrapperId ?? row.id} ctx={asResultCtx(ctx)} routed={row.candidate.routed} /> }} /> : <ReasonText r={view} id={row.holding.wrapperId ?? row.id} ctx={asResultCtx(ctx)} routed={row.candidate.routed} />}
          </span>
        );
      }
    }
  };
  return <>{row.reasons.map(one)}</>;
}

/** The coverage list's plain-text reason (one string, for the engine's counts to match). */
export function reasonKey(r: RowReason): string {
  return r.code === "engine" ? r.reason.code : r.code;
}

export { r2 };
