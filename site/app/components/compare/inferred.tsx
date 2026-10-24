// The inferred employment default (A3, lib/compare.ts runGoalOf): shown wherever it changes a study-fund or pension figure.
import { Link } from "react-router";
import { r2 } from "../../copy";

const EMPLOYMENT_WRAPPERS = new Set(["keren-hishtalmut", "ira-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"]);

/** Whether the wrapper is a study fund or a pension wrapper, the ones whose figures follow the employment type. */
export const employmentMatters = (wrapperId: string | null | undefined): boolean => !!wrapperId && EMPLOYMENT_WRAPPERS.has(wrapperId);

export function EmploymentInferredNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2" data-employment-inferred>
      <span>{r2.result.employmentInferred}</span>
      <Link to="/goal" className="text-link min-h-9 inline-flex items-center hover:underline">
        {r2.result.employmentInferredChange}
      </Link>
    </p>
  );
}
