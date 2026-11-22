// S50, a tie (F-80, P-01): one securities account at two commissions, a quarter apart, ends within the tie threshold of the other.
// The wrapper record is a minimal, schema-valid test record; no file under data/instruments/ is read.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ValueObject, WrapperRecord } from "@finance-tool/schema";
import type { P05Input } from "../../src/index.ts";
import { isTie, relativeGap, runInputs, runPlanned, tieThreshold } from "../../src/index.ts";
import { context, golden } from "./harness.ts";
import { r2Expected as x } from "./expected.ts";

const ctx = context();
const parametersDir = new URL("../../../../data/parameters/", import.meta.url);
const parameters = readdirSync(parametersDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, parametersDir), "utf8")) as Record<string, unknown>);

const vo = (value: number | string | boolean, unit: ValueObject["unit"], state: ValueObject["state"] = "sourced"): ValueObject => ({
  value,
  unit,
  source: { url: "docs/data-schema.md#33", title: "test record", publisher: "test", strength: state === "entered" ? "entered" : "primary" },
  checked: "2026-10-23",
  effective_from: "2026-01-01",
  effective_to: null,
  update_rule: state === "entered" ? "founder" : "fixed in regulation",
  state,
});

/** A test record in the shape of data-schema §3.3. */
const brokerage: WrapperRecord = {
  id: "brokerage-account",
  names: { he: ["שם"], statement: [], app: [] },
  regulator: vo("CMA", "text"),
  fee_bases_allowed: ["deposit", "balance"],
  fee_caps: {},
  ceiling: null,
  deposit_side_tax: { formula: "F-33", rule_ids: [] },
  tax_during: { formula: "F-20", rule_ids: [] },
  tax_at_exit: { formula: "F-40", rule_ids: [], blocked_by: [], labels: [] },
  lawful_exit: { kind: "trading_day" },
  switch_is_tax_event: vo(false, "boolean"),
  transfer_routes: [],
  eligibility: { rule_ids: [], text: "anyone" },
  protection: { rule_ids: [], text: "held in trust" },
  dimensions: {},
  tier: 1,
  open_questions: [],
  checked: "2026-10-23",
};

// the fund and tariff of S14
const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s14Tariff = { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } };
const entered = (value: number, unit: ValueObject["unit"]) => vo(value, unit, "entered");
const plan: Partial<Record<P05Input, ValueObject>> = {
  amount_now: entered(10_000, "nis"),
  monthly_deposit: entered(2_000, "nis_per_month"),
  horizon_years: entered(5, "years"),
  "A-01": entered(6, "pct_per_year"),
  "A-02": entered(2.5, "pct_per_year"),
};
/** The account's real value at the horizon at one commission on buys and sells. */
const real = (commission: number) =>
  runPlanned(runInputs(brokerage, parameters, { fund: s14Fund, tariff: { ...s14Tariff, buy: { rate: commission, min: 25 }, sell: { rate: commission, min: 25 } } }, { entered: plan }), ctx).real;

describe("S50 tie (F-80, P-01)", () => {
  it("declares a tie when the gap is under the threshold", () => {
    const a = real(0.003);
    const a2 = real(0.0025);
    const g = golden("S50");
    g.value("bank A2", a2, x.s50.bankA2);
    g.value("bank A", a, x.s50.bankA);
    g.done();
    expect(a2).toBeGreaterThan(a);
    expect(relativeGap(a2, a) * 100).toBeCloseTo(x.s50.gapPct, 2);
    expect(isTie(a2, a, tieThreshold(parameters))).toBe(true);
    // At a threshold below the gap it is no tie; the threshold itself is not a tie (strict).
    expect(isTie(a2, a, 0.0001)).toBe(false);
    expect(isTie(100, 99.5, 0.005)).toBe(false);
  });
});
