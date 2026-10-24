// The coverage line and list (design-system 6.3, flow 13): how many options were considered, and every one that
// was not ranked with its reason. Counts in the sentence equal the rows in the list (the engine asserts it).
import { Link } from "react-router";
import { r2 } from "../../copy";
import { countForm, type CoverageRow } from "../../lib/compare";
import { IconChevronDown } from "../icons";
import { Num } from "../provenance";
import { cx } from "../ui";
import type { ResultCtx } from "./ctx";
import { OutcomeTag } from "./rows";
import { ReasonLines } from "./reasons";

const order: CoverageRow["kind"][] = ["not-eligible", "excluded", "not-evaluated", "listed-not-ranked", "ranked"];

export function CoverageList({ rows, ctx }: { rows: CoverageRow[]; ctx: ResultCtx }) {
  return (
    <div className="flex flex-col gap-5">
      {order.map((kind) => {
        const list = rows.filter((r) => r.kind === kind);
        if (list.length === 0) return null;
        const body = (
          <ul className="flex flex-col">
            {list.map((row) => (
              <li key={row.id} className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0">
                <span className="flex items-center gap-2 flex-wrap">
                  {row.href ? (
                    <Link to={row.href} className="font-medium text-link hover:underline">
                      {row.name}
                    </Link>
                  ) : (
                    <Link to="/not-covered" className="font-medium text-link hover:underline">
                      <bdi>{row.name}</bdi>
                    </Link>
                  )}
                  <OutcomeTag kind={row.kind} blocked={row.reasons.some((r) => r.code === "exit-blocked")} fixableByPerson={row.reasons.some((r) => r.fixableBy === "person")} />
                </span>
                {row.kind !== "ranked" && (
                  <span className="text-sm text-muted-foreground">
                    <ReasonLines row={row} ctx={ctx} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        );
        return (
          <section key={kind} className="flex flex-col gap-1">
            {kind === "ranked" ? (
              <details className="group">
                <summary className="flex items-center gap-2 min-h-target cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h4 className="font-medium">
                    {r2.result.coverageGroups[kind]} <span className="text-muted-foreground font-normal">({list.length})</span>
                  </h4>
                  <IconChevronDown className="text-muted-foreground transition-transform duration-[var(--duration-fast)] group-open:rotate-180" />
                </summary>
                {body}
              </details>
            ) : (
              <>
                <h4 className="font-medium flex items-center gap-2">
                  {r2.result.coverageGroups[kind]} <span className="text-muted-foreground font-normal">({list.length})</span>
                </h4>
                {body}
              </>
            )}
          </section>
        );
      })}
      <p className="text-sm text-muted-foreground">{r2.result.coverageLast}</p>
    </div>
  );
}

/** A count in its own plural form (A91): "אחת דורגה", "שתיים דורגו", "5 דורגו". */
export function CountPhrase({ n, forms, about, mk }: { n: number; forms: { one: string; other: string }; about: string; mk: ResultCtx["mk"] }) {
  const f = countForm(n, forms, r2.result.counts.numerals as { one: string; two: string });
  return (
    <>
      <Num value={mk.count(n, about)} {...(f.numeral ? { display: f.numeral } : { animate: true })} /> {f.word}
    </>
  );
}

/** One sentence with the five counts, and the list behind a disclosure; open at once when nothing was ranked. */
export function CoverageLine({ ctx, open }: { ctx: ResultCtx; open?: boolean }) {
  const { view, mk } = ctx;
  const cov = view.evaluated.coverage;
  const n = (k: CoverageRow["kind"]) => <CountPhrase n={cov.counts[k]} forms={r2.result.counts[k] as { one: string; other: string }} about={r2.outcomesPlural[k]!} mk={mk} />;
  return (
    <details className="group bg-card border border-border rounded-lg p-4 md:p-6" open={open} key={String(open)}>
      <summary className="flex items-start cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-1">
          <span>
            {r2.result.coverageBefore} <Num value={mk.count(cov.considered, r2.result.coverageBefore)} animate /> {r2.result.coverageMid} {n("ranked")}, {n("listed-not-ranked")}, {n("not-eligible")}, {n("excluded")}, {n("not-evaluated")}.
          </span>
          <span className="text-sm text-link flex items-center gap-1 min-h-9">
            <span className="group-open:hidden">{r2.result.coverageOpen}</span>
            <span className="hidden group-open:inline">{r2.result.coverageClose}</span>
            <IconChevronDown size={16} className={cx("transition-transform duration-[var(--duration-fast)] group-open:rotate-180")} />
          </span>
        </span>
      </summary>
      <div className="mt-4 border-t border-border pt-4">
        <CoverageList rows={view.coverageRows} ctx={ctx} />
      </div>
    </details>
  );
}
