// The workbench coverage line (design-spec 11.3, flow 25 step 5): every track accounted for once, with its outcome.
// The workbench ranks nothing, so the outcomes are: fits, does not fit, no rule, not eligible (CAT-10), not
// evaluated (no saved goal; no classification in the data). Counts are computed (F-64) and equal the rows.
import { Link } from "react-router";
import { r2, r3workbench as copy } from "../../copy";
import { computed } from "../../lib/value";
import { coverageOrder, type CoverageKey, type WbData, type WorkbenchRow } from "../../lib/workbench";
import { IconChevronDown } from "../icons";
import { Num } from "../provenance";
import { cx } from "../ui";

export function WorkbenchCoverage({ data, views, ready }: { data: WbData; views: WorkbenchRow[]; ready: boolean }) {
  const counts = Object.fromEntries(coverageOrder.map((k) => [k, views.filter((v) => v.key === k).length])) as Record<CoverageKey, number>;
  const total = coverageOrder.reduce((s, k) => s + counts[k], 0);
  if (import.meta.env.DEV && (total !== views.length || data.engine.considered !== views.length)) console.error("workbench coverage: counts do not equal rows", counts, views.length, data.engine);
  const count = (n: number, about: string) => computed(n, "count", "F-64", {}, { today: data.today, about });
  const n = (k: CoverageKey) =>
    ready ? (
      <Num value={count(counts[k], copy.coverage[k] ?? k)} />
    ) : (
      <span className="inline-block w-6 h-4 align-middle rounded bg-muted animate-pulse" aria-hidden="true" />
    );
  // the sentence names five outcomes (copy 7.3); the sixth appears when some track has no classification in the data
  const sentence: CoverageKey[] = ["fits", "no-fit", "no-rule", "ineligible", "no-goal"];
  if (!ready || counts["no-class"] > 0) sentence.push("no-class");
  return (
    <details className="group bg-card border border-border rounded-lg p-4 md:p-6">
      <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-1">
          <span>
            {copy.coverage.before}
            <Num value={count(views.length, copy.coverage.before ?? "")} />
            {copy.coverage.mid}
            <Num value={count(data.companies.length, copy.coverage.companies ?? "")} />
            {copy.coverage.companies}
            {sentence.map((k, i) => (
              <span key={k}>
                {n(k)} {copy.coverage[k]}
                {i < sentence.length - 1 ? ", " : "."}
              </span>
            ))}
          </span>
          <span className="text-sm text-link flex items-center gap-1 min-h-9">
            <span className="group-open:hidden">{r2.result.coverageOpen}</span>
            <span className="hidden group-open:inline">{r2.result.coverageClose}</span>
            <IconChevronDown size={16} className={cx("transition-transform duration-[var(--duration-fast)] group-open:rotate-180")} />
          </span>
        </span>
      </summary>
      <div className="mt-4 border-t border-border pt-4 flex flex-col gap-1">
        {coverageOrder.map((k) => {
          const list = views.filter((v) => v.key === k);
          if (list.length === 0) return null;
          return (
            <details key={k} className="group/g">
              <summary className="flex items-center gap-2 min-h-target cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-medium">
                  {copy.coverage[k]} <span className="text-muted-foreground font-normal">(<bdi dir="ltr">{list.length}</bdi>)</span>
                </h3>
                <IconChevronDown className="text-muted-foreground transition-transform duration-[var(--duration-fast)] group-open/g:rotate-180" />
              </summary>
              <ul className="flex flex-col">
                {list.map((v) => (
                  <li key={v.row.f} className="flex flex-col gap-0.5 py-2.5 border-b border-border last:border-b-0">
                    <span className="flex items-center gap-2 flex-wrap">
                      <Link to={v.track.href} className="font-medium text-link hover:underline">
                        <bdi>{v.row.n}</bdi>
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        <bdi>{v.company.name}</bdi>
                      </span>
                    </span>
                    <span className="text-sm text-muted-foreground">{v.reason?.text ?? copy.outcomeWords[v.key]}</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </details>
  );
}
