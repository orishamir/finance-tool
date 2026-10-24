// The fund-variant view on the collected data (flows 30, 33): the records, no fund list, the outcomes with their reasons.
import { describe, expect, it } from "vitest";
import { buildFundVariants, matchesVariant, parseVariantQuery, sortVariants, variantQueryString } from "./variants";
import { buildWorkbenchBundle } from "./providers.server";
import type { FundAssumptions, WorkbenchInputs } from "./providers";
import { entered } from "./value";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const inputs = (returnFromParameter = false): WorkbenchInputs => ({
  amountNow: 10_000,
  monthly: 500,
  years: 10,
  grossReturn: 0.05,
  inflation: 0.02,
  age: null,
  income: null,
  values: { amount: entered(10_000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(5, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: false,
  returnFromParameter,
});
const build = (exposureId: string, over: { returnFromParameter?: boolean; assumptions?: FundAssumptions; provider?: string | null } = {}) =>
  buildFundVariants({ bundle, exposureId, query: { provider: over.provider ?? null, orders: null }, inputs: inputs(over.returnFromParameter), assumptions: over.assumptions ?? {} });

describe("fund-variant view", () => {
  it("renders with no fund list: the records only, no count for a list it did not read", () => {
    const r = build("index-sp500");
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(bundle.fundLists).toHaveLength(0);
    expect(r.view.lists).toEqual({ israeli: null, tase: null });
    const records = bundle.funds.filter((f) => f.exposure_id === "index-sp500");
    expect(r.view.rows).toHaveLength(records.length);
    expect(r.view.coverage.considered).toBe(records.length + 1); // the G-29 group line is counted by the engine's invariant
    expect(r.view.coverage.invariantOk).toBe(true);
  });

  it("ranks the IBI S&P 500 ETF (an Israeli exempt fund, shekels) with a computed figure and the security number", () => {
    const r = build("index-sp500");
    if (r.kind !== "ok") throw new Error("not ok");
    const ibi = r.view.rows.find((x) => x.recordId === "1148162")!;
    expect(ibi.kind).toBe("ranked");
    expect(ibi.rank).toBe(1);
    expect(ibi.number).toBe("1148162");
    expect(ibi.value?.state).toBe("computed");
    expect(ibi.tags).toEqual({ domicile: "IL", policy: "accumulating" });
    expect(ibi.trading).toMatchObject({ onTaseInNis: true, abroad: false });
    expect(ibi.fees?.fixed_management?.value).toBe(0.8);
    expect(ibi.fees?.tracking_difference_12m).toBeNull();
    expect(ibi.takenAsZero).toContain("tracking_difference_12m");
    expect(r.view.held.value).toBe(0);
  });

  it("waits for the person's return (D9): no figure and no rank until one is entered", () => {
    const r = build("index-sp500", { returnFromParameter: true });
    if (r.kind !== "ok") throw new Error("not ok");
    expect(r.view.waitsForReturn).toBe(true);
    for (const row of r.view.rows) {
      expect(row.value).toBeUndefined();
      expect(row.rank).toBeUndefined();
    }
  });

  it("names a money-market exposure's funds as not evaluated with the F-23 reason", () => {
    const r = build("shekel-cash");
    if (r.kind !== "ok") throw new Error("not ok");
    expect(r.view.cashLike).toBe(true);
    expect(r.view.rows.length).toBeGreaterThan(0);
    for (const row of r.view.rows) {
      expect(row.kind).toBe("not-evaluated");
      expect(row.reason).toEqual({ code: "money-market" });
    }
  });

  it("uses P-05's provider when none is chosen, and falls back to it when the chosen one has no tariff", () => {
    const base = build("index-sp500");
    const missing = bundle.snapshots.find((s) => s.missing && (s.provider.class === "bank" || s.provider.class === "broker"))!;
    const fb = build("index-sp500", { provider: missing.id });
    if (base.kind !== "ok" || fb.kind !== "ok") throw new Error("not ok");
    expect(base.view.provider.fromP05).toBe(true);
    expect(fb.view.provider).toMatchObject({ id: base.view.provider.id, fromP05: true, fellBack: true });
  });

  it("answers an unknown exposure with an error", () => {
    expect(build("nothing")).toMatchObject({ kind: "error", code: "no-exposure" });
  });

  it("sorts inside a group and filters by name, manager or number", () => {
    const r = build("shekel-cash");
    if (r.kind !== "ok") throw new Error("not ok");
    const byFee = sortVariants(r.view.rows, "fee");
    expect(byFee[0]!.fees?.fixed_management?.value).toBeDefined();
    expect(r.view.rows.filter((x) => matchesVariant(x, "5138763")).map((x) => x.number)).toEqual(["5138763"]);
    expect(matchesVariant(r.view.rows[0]!, "")).toBe(true);
  });

  it("round-trips the address", () => {
    expect(parseVariantQuery(variantQueryString({ provider: "leumi", orders: 3 }))).toEqual({ provider: "leumi", orders: 3 });
  });
});
