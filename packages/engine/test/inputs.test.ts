// From a wrapper record (data-schema §3.3) and P-05 (data/parameters/) to a run's inputs: docs/method.md §2.4.
import { readdirSync, readFileSync } from "node:fs";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { isSecurityId, type ValueObject, type ProductId, type ProductRecord, type WrapperRecord } from "@finance-tool/schema";
import {
  NotEvaluatedError,
  RecordInputError,
  runDeposit,
  runInputs,
  runPlanned,
  runProvident,
  runSecurities,
  timeline,
  type InstrumentTerms,
} from "../src/index.ts";
import { context, golden } from "./golden/harness.ts";

const ctx = context();
const parametersDir = new URL("../../../data/parameters/", import.meta.url);
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

/** A test product: a security's id also gets what a security record carries (D6, amended 2026-10-26). */
const asProduct = (r: Omit<WrapperRecord, "id"> & { id: ProductId }): ProductRecord =>
  (isSecurityId(r.id) ? { ...r, held_as: "security", held_in: { wrapper_ids: ["brokerage-account"], rule_ids: [], text: "held in a securities account" } } : r) as ProductRecord;

/** A test record in the shape of data-schema §3.3; no file under data/instruments/wrappers/ exists yet. */
function wrapper(id: ProductId, during: string, exit: string): ProductRecord {
  return asProduct({
    id,
    names: { he: ["שם"], statement: [], app: [] },
    regulator: vo("CMA", "text"),
    fee_bases_allowed: ["deposit", "balance"],
    fee_caps: { balance: vo(1.05, "pct_per_year") },
    ceiling: null,
    deposit_side_tax: { formula: "F-33", rule_ids: [] },
    tax_during: { formula: during, rule_ids: [] },
    tax_at_exit: { formula: exit, rule_ids: [], blocked_by: [], labels: [] },
    lawful_exit: { kind: "any_time" },
    switch_is_tax_event: vo(false, "boolean"),
    transfer_routes: [],
    eligibility: { rule_ids: [], text: "anyone" },
    protection: { rule_ids: [], text: "held in trust" },
    dimensions: {},
    tier: 1,
    open_questions: [],
    checked: "2026-10-23",
  });
}

const records = {
  kgl: wrapper("kupat-gemel-lehashkaa", "F-27", "F-44"),
  hishtalmut: wrapper("keren-hishtalmut", "F-27", "F-46"),
  deposit: wrapper("bank-deposit", "F-21", "F-41"),
  current: wrapper("current-account", "F-26", "F-41"),
  mmf: wrapper("money-market-fund-daily", "F-23", "F-40"),
  brokerage: wrapper("brokerage-account", "F-20", "F-40"),
  ira: wrapper("ira-hishtalmut", "F-51", "F-46"),
  renewable: wrapper("money-market-fund-renewable", "F-23", "F-40"),
  makam: wrapper("makam", "F-24", "F-40"),
  bond: wrapper("government-bond", "F-25", "F-40"),
};

// The S47 terms: list fees from S01, S11, S14 and S20 (scenarios.md).
const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s14Tariff = {
  buy: { rate: 0.003, min: 25 },
  sell: { rate: 0.003, min: 25 },
  custody: { rate: 0.0015, min: 15, everyMonths: 3 },
};
const terms = {
  kgl: { fees: { deposit: 0, balance: 0.008, direct: 0.001 } },
  deposit: { deposit: { termMonths: 1, linkage: "unlinked" as const } },
  mmf: { fund: { kind: "money-market-daily" as const, drag: { management: 0.0016, trustee: 0.0002 } }, tariff: {} },
  etf: { fund: s14Fund, tariff: s14Tariff },
} satisfies Record<string, InstrumentTerms>;

/** P-05 with its inputs replaced, as data/parameters/illustrative-scenario.json would hold them. */
function withP05(values: Partial<Record<string, number>>, extra: Record<string, ValueObject> = {}) {
  return parameters.map((p) => {
    if (p.method_id !== "P-05") return p;
    // The optional income is left out unless a test passes it in `extra`.
    const { annual_income: _income, ...inputs } = { ...(p.inputs as Record<string, ValueObject>) };
    for (const [k, v] of Object.entries(values)) inputs[k] = { ...inputs[k]!, value: v! };
    return { ...p, inputs: { ...inputs, ...extra } };
  });
}

const fails = (f: () => unknown, message: RegExp) => {
  expect(f).toThrow(RecordInputError);
  expect(f).toThrow(message);
};

describe("a record's values reach the engine unchanged", () => {
  const pct = fc.double({ min: -5, max: 15, noNaN: true });
  const p05 = fc.record({
    amount_now: fc.double({ min: 0, max: 1e7, noNaN: true }),
    monthly_deposit: fc.double({ min: 0, max: 1e5, noNaN: true }),
    horizon_years: fc.integer({ min: 1, max: 40 }),
    "A-01": pct,
    "A-02": pct,
    cash_rate: pct,
  });

  it("P-05 goes to the goal and the market, converted only from percent and years", () => {
    fc.assert(
      fc.property(p05, (v) => {
        const goal = { amountNow: v.amount_now, monthly: v.monthly_deposit, months: 12 * v.horizon_years };
        const params = withP05(v);
        const kgl = runInputs(records.kgl, params, terms.kgl);
        expect(kgl).toEqual({
          run: "runProvident",
          input: {
            wrapper: "kupat-gemel-lehashkaa",
            goal,
            market: { grossReturn: v["A-01"] / 100, inflation: v["A-02"] / 100 },
            fees: terms.kgl.fees,
            profile: {},
          },
        });
        // cash_rate stands in for each cash-like product's own rate (P-05 notes).
        const deposit = runInputs(records.deposit, params, terms.deposit);
        expect(deposit.input).toEqual({
          goal,
          market: { inflation: v["A-02"] / 100 },
          deposit: { kind: "deposit", rate: v.cash_rate / 100, ...terms.deposit.deposit },
          profile: {},
        });
        expect(runInputs(records.mmf, params, terms.mmf).input).toMatchObject({
          market: { grossReturn: v.cash_rate / 100, inflation: v["A-02"] / 100 },
          fund: terms.mmf.fund,
        });
        expect(runInputs(records.brokerage, params, terms.etf).input).toMatchObject({
          market: { grossReturn: v["A-01"] / 100 },
          fund: terms.etf.fund,
          tariff: terms.etf.tariff,
        });
        expect(runInputs(records.makam, params, { tariff: {} }).input).toMatchObject({ makam: { yield: v.cash_rate / 100 } });
        const bond = { linkage: "unlinked" as const, couponEveryMonths: 12 };
        expect(runInputs(records.bond, params, { bond, tariff: {} }).input).toMatchObject({
          bond: { coupon: v.cash_rate / 100, ...bond },
        });
      }),
      { numRuns: 50 },
    );
  });

  it("a value the person entered replaces its P-05 counterpart (F-67)", () => {
    const plan = runInputs(records.kgl, parameters, terms.kgl, {
      entered: { "A-01": vo(7.5, "pct_per_year", "entered"), horizon_years: vo(3, "years", "entered") },
      profile: { ageAtStart: 58, otherIncome: 60_000 },
    });
    expect(plan.input).toMatchObject({
      goal: { months: 36, amountNow: 10_000 },
      market: { grossReturn: 0.075, inflation: 0.02 },
      profile: { ageAtStart: 58, otherIncome: 60_000 },
    });
  });

  it("P-05's annual income is the run's income unless the caller's profile has one, and an entered income replaces it", () => {
    expect((parameters.find((p) => p.method_id === "P-05")!.inputs as Record<string, ValueObject>).annual_income!.value).toBe(144_000);
    const byDefault = runInputs(records.kgl, parameters, terms.kgl, { scenarioIncome: true });
    expect(byDefault.input).toMatchObject({ profile: { annualIncome: 144_000 } });
    // Without the option (a comparison) no income is invented for the person.
    expect((runInputs(records.kgl, parameters, terms.kgl).input as { profile: object }).profile).not.toHaveProperty("annualIncome");
    const own = runInputs(records.kgl, parameters, terms.kgl, { scenarioIncome: true, profile: { annualIncome: 90_000 } });
    expect(own.input).toMatchObject({ profile: { annualIncome: 90_000 } });
    const entered = runInputs(records.kgl, parameters, terms.kgl, { scenarioIncome: true, entered: { annual_income: vo(200_000, "nis", "entered") } });
    expect(entered.input).toMatchObject({ profile: { annualIncome: 200_000 } });
    fails(() => runInputs(records.kgl, parameters, terms.kgl, { entered: { annual_income: vo(200_000, "pct_per_year", "entered") } }), /annual_income.*nis/);
  });

  it("a P-05 without annual_income still builds a deposit run, with no income in the profile", () => {
    const six = withP05({});
    const plan = runInputs(records.deposit, six, terms.deposit, { scenarioIncome: true });
    expect(plan.input).toMatchObject({ profile: {} });
    expect((plan.input as { profile: object }).profile).not.toHaveProperty("annualIncome");
  });

  it("the instrument terms are passed as given, and the study fund's A-12 with them", () => {
    const hishtalmut = { employment: "employee" as const, monthlySalary: 12_000, clockStartMonth: 0 };
    const fees = { deposit: 0, balance: 0.006, direct: 0.0011, discount: { months: 24, listRate: 0.0105 } };
    const plan = runInputs(records.hishtalmut, parameters, { fees, hishtalmut });
    expect(plan.input).toMatchObject({ wrapper: "keren-hishtalmut", fees, hishtalmut });
    const current = runInputs(records.current, parameters, { deposit: { termMonths: 1, linkage: "unlinked" } });
    expect(current.input).toMatchObject({ deposit: { kind: "current-account", rate: 0.0325 } });
  });
});

describe("a missing or unexpected field fails loudly", () => {
  const { tax_at_exit: _, ...noExit } = records.kgl;

  it("in the wrapper record", () => {
    fails(() => runInputs(noExit, parameters, terms.kgl), /tax_at_exit/);
    fails(() => runInputs({ ...records.kgl, balance_fee: vo(0.8, "pct_per_year") }, parameters, terms.kgl), /balance_fee/);
    fails(() => runInputs({ ...records.kgl, names: { ...records.kgl.names, en: ["x"] } }, parameters, terms.kgl), /names/);
    fails(() => runInputs({ ...records.kgl, id: "kupat-gemel" }, parameters, terms.kgl), /id/);
  });

  it("in a formula the record names that the engine does not compute yet", () => {
    const later = { ...records.kgl, deposit_side_tax: { formula: "F-18", rule_ids: [] } };
    fails(() => runInputs(later, parameters, terms.kgl), /F-18.*R4/);
    fails(() => runInputs({ ...records.kgl, tax_at_exit: { ...records.kgl.tax_at_exit, formula: "F-99" } }, parameters, terms.kgl), /F-99/);
  });

  it("for a wrapper with no run in this release", () => {
    fails(() => runInputs(wrapper("pension-comprehensive", "F-27", "F-49"), parameters, terms.kgl), /pension-comprehensive/);
    fails(() => runInputs(wrapper("child-savings-bank", "F-27", "F-50"), parameters, terms.kgl), /child-savings-bank.*F-54/);
    fails(() => runInputs(wrapper("ira-provident", "F-27", "F-27"), parameters, terms.kgl), /ira-provident/);
  });

  it("for a run the method cannot evaluate yet: monthly deposits into a renewable fund (G-30)", () => {
    const renewable = { fund: { kind: "money-market-renewable" as const, fixedDatesEveryMonths: 3 }, tariff: {} };
    expect(() => runInputs(records.renewable, parameters, renewable)).toThrow(NotEvaluatedError);
    expect(() => runInputs(records.renewable, parameters, renewable)).toThrow(/G-30/);
    const once = runInputs(records.renewable, parameters, renewable, { entered: { monthly_deposit: vo(0, "nis_per_month", "entered") } });
    expect(once.input).toMatchObject({ market: { grossReturn: 0.0325 }, goal: { monthly: 0 } });
  });

  it("in P-05", () => {
    fails(() => runInputs(records.kgl, parameters.filter((p) => p.method_id !== "P-05"), terms.kgl), /P-05/);
    const without = parameters.map((p) => {
      if (p.method_id !== "P-05") return p;
      const { "A-02": _, ...inputs } = p.inputs as Record<string, ValueObject>;
      return { ...p, inputs };
    });
    fails(() => runInputs(records.kgl, without, terms.kgl), /A-02/);
    fails(() => runInputs(records.kgl, withP05({}, { "A-03": vo(1, "pct_per_year") }), terms.kgl), /A-03/);
    fails(() => runInputs(records.kgl, withP05({ "A-01": "5" as unknown as number }), terms.kgl), /A-01/);
    const wrongUnit = parameters.map((p) =>
      p.method_id !== "P-05" ? p : { ...p, inputs: { ...(p.inputs as object), horizon_years: vo(120, "months") } },
    );
    fails(() => runInputs(records.kgl, wrongUnit, terms.kgl), /horizon_years.*years/);
  });

  it("in an entered value", () => {
    fails(() => runInputs(records.kgl, parameters, terms.kgl, { entered: { "A-01": vo(7, "pct_per_year") } }), /A-01.*entered/);
    fails(() => runInputs(records.kgl, parameters, terms.kgl, { entered: { "A-09": vo(7, "pct_per_year", "entered") } as never }), /A-09/);
  });

  it("in the instrument terms", () => {
    fails(() => runInputs(records.kgl, parameters, {}), /fees/);
    fails(() => runInputs(records.kgl, parameters, { ...terms.kgl, tariff: {} }), /tariff/);
    fails(() => runInputs(records.hishtalmut, parameters, terms.kgl), /hishtalmut/);
    fails(() => runInputs(records.deposit, parameters, terms.mmf), /fund/);
    fails(() => runInputs(records.mmf, parameters, terms.etf), /israeli-fund/);
    fails(() => runInputs(records.brokerage, parameters, terms.mmf), /money-market-daily/);
    fails(() => runInputs(records.ira, parameters, terms.etf), /ira/);
    // A field inside a term that would override a P-05 value.
    fails(() => runInputs(records.deposit, parameters, { deposit: { ...terms.deposit.deposit, rate: 0.05 } as never }), /deposit\.rate/);
    fails(() => runInputs(records.bond, parameters, { bond: { linkage: "cpi", couponEveryMonths: 12, coupon: 0.02 } as never, tariff: {} }), /bond\.coupon/);
    // makam reads a custody line since 2026-10-26 (F-14: charged at a non-bank member, BRK-17); an FX line it never reads
    fails(() => runInputs(records.makam, parameters, { tariff: { fx: 0.001 } }), /tariff\.fx/);
  });
});

describe("a golden scenario rebuilt from equivalent records gives the golden result", () => {
  it("S47 illustrative timeline, from the P-05 file", () => {
    const goal = { amountNow: 10_000, monthly: 500, months: 120 };
    const built = timeline({
      // S47 runs the deposit at its own 3.5% (golden literal); P-05's cash rate is the Bank of Israel's since 2026-10-26: entered here to match.
      deposit: () =>
        runPlanned(runInputs(records.deposit, parameters, terms.deposit, { entered: { cash_rate: vo(3.5, "pct_per_year", "entered") } }), ctx),
      // S47 runs the daily fund at S11's 3.25%, not P-05's 3.5% cash rate: entered here to match.
      mmf: () =>
        runPlanned(runInputs(records.mmf, parameters, terms.mmf, { entered: { cash_rate: vo(3.25, "pct_per_year", "entered") } }), ctx),
      etf: () => runPlanned(runInputs(records.brokerage, parameters, terms.etf), ctx),
      kgl: () => runPlanned(runInputs(records.kgl, parameters, terms.kgl), ctx),
    });

    // The same runs as golden.test.ts S47, with its literal inputs.
    expect(built.deposit.run).toEqual(
      runDeposit({ goal, market: { inflation: 0.02 }, deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" }, profile: {} }, ctx),
    );
    expect(built.mmf.run).toEqual(
      runSecurities({ goal, market: { grossReturn: 0.0325, inflation: 0.02 }, ...terms.mmf, profile: {} }, ctx),
    );
    expect(built.etf.run).toEqual(
      runSecurities({ goal, market: { grossReturn: 0.05, inflation: 0.02 }, fund: s14Fund, tariff: s14Tariff, profile: {} }, ctx),
    );
    expect(built.kgl.run).toEqual(
      runProvident(
        { wrapper: "kupat-gemel-lehashkaa", goal, market: { grossReturn: 0.05, inflation: 0.02 }, fees: terms.kgl.fees, profile: {} },
        ctx,
      ),
    );

    const g = golden("S47");
    g.value("deposit exit", built.deposit.exitReal, 74_044.07);
    g.value("MMF exit", built.mmf.exitReal, 73_339.31);
    g.value("ETF exit", built.etf.exitReal, 70_220.43);
    g.value("KGL exit", built.kgl.exitReal, 76_594.44);
    g.value("KGL year 10", built.kgl.years[9]!.real, 78_792.58);
    g.done();
  });

  it("S33 IRA hishtalmut with brokerage inside, with the scenario's values entered", () => {
    const e = (value: number, unit: ValueObject["unit"]) => vo(value, unit, "entered");
    const goal = { amountNow: 250_000, monthly: 0, months: 60 };
    const tariff = { buy: { rate: 0.001, min: 15 }, sell: { rate: 0.001, min: 15 }, custody: { rate: 0.0005, everyMonths: 3 } };
    const ira = { managerFee: 0.003, clockStartMonth: -72 };
    const plan = runInputs(
      records.ira,
      parameters,
      { fund: s14Fund, tariff, ira },
      {
        entered: {
          amount_now: e(250_000, "nis"),
          monthly_deposit: e(0, "nis_per_month"),
          horizon_years: e(5, "years"),
          "A-01": e(6, "pct_per_year"),
          "A-02": e(2.5, "pct_per_year"),
        },
      },
    );
    const r = runPlanned(plan, ctx);
    expect(r).toEqual(
      runSecurities(
        { goal, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff, wrapper: { kind: "ira-hishtalmut", ...ira }, profile: {} },
        ctx,
      ),
    );
    const g = golden("S33");
    g.value("real", r.real, 272_096.32);
    g.value("nominal", r.nominal, 307_852.01);
    g.value("IRA manager", r.fees.manager, 4_178.85);
    g.done();
  });

  it("S20 kupat gemel lehashkaa, list fees, with the scenario's values entered", () => {
    const e = (value: number, unit: ValueObject["unit"]) => vo(value, unit, "entered");
    const plan = runInputs(records.kgl, parameters, terms.kgl, {
      entered: {
        amount_now: e(20_000, "nis"),
        monthly_deposit: e(2_000, "nis_per_month"),
        horizon_years: e(5, "years"),
        "A-01": e(6, "pct_per_year"),
        "A-02": e(2.5, "pct_per_year"),
      },
    });
    const r = runPlanned(plan, ctx);
    const g = golden("S20");
    g.value("real", r.real, 148_018.98);
    g.value("nominal", r.nominal, 167_469.89);
    g.value("tax at exit", r.taxAtExit, 3_024.25);
    g.done();
  });
});
