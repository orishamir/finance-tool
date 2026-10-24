// The switching-cost view of the playbook page (flow 31 step 5): which of F-66's forms the pair gets, computed in the browser
// from the bundles the workbench pages already use. One computation for both places the page draws the card.
import { useEffect, useMemo, useState } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import { loadBundle } from "../../lib/bundle";
import { runGoalOf, type CompareBundle } from "../../lib/compare";
import { feeInputs } from "../../lib/fees";
import { hasMeaning, useGoals } from "../../lib/goal";
import { useInputs } from "../../lib/inputs";
import { brokerageCost, isProvident, providentCost, transferFeeOf, type PlaybookQuery, type Side } from "../../lib/playbook";
import { BROKERAGE, loadWorkbenchBundle, type WorkbenchBundle, type WorkbenchInputs } from "../../lib/providers";
import { useFundAssumptions } from "../../lib/variants";
import type { SiteValue } from "../../lib/value";
import type { CostView } from "./cost";

const norm = (s: string) => s.replace(/["״'׳]/g, "").replace(/\s+/g, " ").trim();

/** Two sides are the same company when the ids or the names agree. */
export const sameCompany = (a: Side | null, b: Side | null): boolean => !!a && !!b && (a.id === b.id || norm(a.name) === norm(b.name));

export function useCostView(args: { wrapperId: string; rules: Record<string, RuleRecord>; today: string; query: PlaybookQuery; from: Side | null; to: Side | null; ready: boolean }): { view: CostView | null; wb: WorkbenchBundle | null } {
  const { wrapperId, rules, today, query, from, to, ready } = args;
  const brokerage = wrapperId === BROKERAGE;
  const funds = brokerage && !!query.fundFrom && !!query.fundTo;
  const providers = brokerage && !!from && !!to && !sameCompany(from, to);
  const inKind = providers && (!funds || query.fundFrom === query.fundTo);
  const needBundles = brokerage && ready && (funds || inKind);

  const [wb, setWb] = useState<WorkbenchBundle | null>(null);
  const [compare, setCompare] = useState<CompareBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!needBundles) return;
    Promise.all([loadBundle(), loadWorkbenchBundle()])
      .then(([b, w]) => {
        setCompare(b);
        setWb(w);
      })
      .catch(() => setFailed(true));
  }, [needBundles]);

  const { current, resolved, status } = useGoals();
  const released = useInputs();
  const goalG = current && resolved && hasMeaning(resolved) ? runGoalOf(current, resolved) : null;
  const fi = useMemo(() => (compare ? feeInputs(compare, goalG, released.state) : null), [compare, JSON.stringify(goalG), released.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const inputs: WorkbenchInputs | null = useMemo(
    () =>
      fi
        ? {
            amountNow: Math.max(0, fi.g.amountNow - fi.g.available),
            monthly: fi.g.monthly,
            years: fi.g.horizonYears,
            grossReturn: (fi.g.returnPct ?? 0) / 100,
            inflation: (fi.values.inflation.value as number) / 100,
            age: fi.g.age,
            income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
            values: fi.values,
            fromGoal: fi.fromGoal,
            returnFromParameter: fi.returnFromParameter,
          }
        : null,
    [fi],
  );
  const expA = wb && query.fundFrom ? (wb.funds.find((f) => f.id === query.fundFrom)?.exposure_id ?? null) : null;
  const expB = wb && query.fundTo ? (wb.funds.find((f) => f.id === query.fundTo)?.exposure_id ?? null) : null;
  const assumptionsA = useFundAssumptions(expA);
  const assumptionsB = useFundAssumptions(expB);

  const view = useMemo((): CostView | null => {
    if (!ready) return null;
    if (isProvident(wrapperId)) {
      if (!from || !to) return null;
      const fromWrapper = from.kind === "holding" ? from.wrapperId : wrapperId;
      if (!fromWrapper || !isProvident(fromWrapper)) return null;
      try {
        return { kind: "engine", cost: providentCost({ wrapperId, fromWrapper, sameCompany: sameCompany(from, to), share: query.share, rules: Object.values(rules), today }) };
      } catch {
        return { kind: "error", code: "engine" };
      }
    }
    if (!brokerage) return null;
    if (!funds && !inKind) return null;
    if (failed) return { kind: "error", code: "engine" };
    if (!wb || !compare || status === "loading") return { kind: "loading" };
    if (inKind && from && to) {
      const fee: SiteValue | null = (() => {
        const v = transferFeeOf(wb, from.id);
        return v ? ({ ...v } as SiteValue) : null;
      })();
      return { kind: "in-kind", fee, secondaryRules: [] };
    }
    if (!inputs) return { kind: "loading" };
    const r = brokerageCost({ wb, fundFrom: query.fundFrom!, fundTo: query.fundTo!, providerId: from?.id ?? null, inputs, assumptionsFrom: assumptionsA.value, assumptionsTo: assumptionsB.value });
    return r.kind === "ok" ? { kind: "brokerage", r } : { kind: "error", code: r.code };
  }, [ready, from, to, wrapperId, brokerage, funds, inKind, failed, wb, compare, status, inputs, query.fundFrom, query.fundTo, query.share, rules, today, assumptionsA.value, assumptionsB.value]);

  return { view, wb };
}
