// From a wrapper record (data-schema §3.3) and the illustrative scenario P-05 (data/parameters/) to the
// inputs of one run: docs/method.md §2.4. Every value is passed through as it is, converted only from
// percent to a fraction and from years to months. Anything missing or unexpected stops here with the
// field named; a run the method cannot evaluate yet stops here with its gap (F-83 "not evaluated").
import { parameterRecord, valueObject, wrapperRecord, type ValueObject, type WrapperId, type WrapperRecord } from "@finance-tool/schema";
import type { z } from "zod";
import type { BondInput } from "./ledgers/bond.ts";
import type { Profile } from "./ledgers/common.ts";
import type { DepositInput } from "./ledgers/deposit.ts";
import type { MakamInput } from "./ledgers/makam.ts";
import type { PensionInput } from "./ledgers/pension.ts";
import type { ProvidentInput } from "./ledgers/provident.ts";
import { NotEvaluatedError, type Fund, type SecuritiesInput } from "./ledgers/securities.ts";
import { formulas, pending, runs } from "./registry.ts";
import { RecordInputError } from "./resolver.ts";
import type { RunContext, RunResult } from "./result.ts";

export { RecordInputError };

/** P-05 inputs (data-schema §3.2) and the unit each must carry. */
const p05Units = {
  amount_now: "nis",
  monthly_deposit: "nis_per_month",
  horizon_years: "years",
  "A-01": "pct_per_year",
  "A-02": "pct_per_year",
  cash_rate: "pct_per_year",
  annual_income: "nis",
} as const satisfies Record<string, ValueObject["unit"]>;

export type P05Input = keyof typeof p05Units;

/** The only P-05 input a record may leave out: it is read by runs that need an income (TXH-05), not by every run. */
const p05Optional: readonly P05Input[] = ["annual_income"];

/**
 * What the run needs that neither the wrapper record nor P-05 holds: the provider's fees and the
 * instrument's own terms, as the ledger takes them (rates as fractions). They come from `data/fees/`,
 * `data/funds/` and `data/terms/`, or are entered by the person.
 */
export interface InstrumentTerms {
  /** Provident family: F-11 deposit fee, F-15 balance fee, A-18 direct expenses, A-19 discount. */
  fees?: ProvidentInput["fees"];
  /** Keren hishtalmut: A-12 employment, salary and the start of the 6-year clock. */
  hishtalmut?: ProvidentInput["hishtalmut"];
  /** Pension and provident fund for annuity: A-12 employment, income, existing deposits, employer rates. */
  pension?: PensionInput["pension"];
  /** Pension: A-17 insurance cost as a share of each deposit, entered by the person (F-53, G-12). Not for a provident fund for annuity (PEN-35). */
  insurance?: PensionInput["insurance"];
  /** Deposits and current accounts: A-15 term and A-16 linkage. */
  deposit?: Pick<DepositInput["deposit"], "termMonths" | "linkage">;
  /** Funds: the fund's kind and drag (A-06 to A-11). */
  fund?: Fund;
  /** Tariff lines (F-12 to F-17). */
  tariff?: SecuritiesInput["tariff"];
  broker?: SecuritiesInput["broker"];
  /** A-03 and the currency the return is quoted in. */
  currency?: Pick<SecuritiesInput["market"], "returnIn" | "fxChange">;
  /** IRA hishtalmut (F-51): the manager's balance fee and the start of the 6-year clock. */
  ira?: Omit<NonNullable<SecuritiesInput["wrapper"]>, "kind">;
  makam?: Omit<MakamInput["makam"], "yield">;
  bond?: Omit<BondInput["bond"], "coupon">;
}

export interface RunInputOptions {
  /** Values the person entered, each replacing its P-05 counterpart (F-67). */
  entered?: Partial<Record<P05Input, ValueObject>>;
  /** A-12 to A-14, as entered. */
  profile?: Profile;
  /** Take P-05's illustrative `annual_income` as the profile's income when the profile has none. Only the guide page's illustrative run sets it; a comparison never invents an income for the person. */
  scenarioIncome?: boolean;
}

export type RunPlan =
  | { run: "runProvident"; input: ProvidentInput }
  | { run: "runPension"; input: PensionInput }
  | { run: "runDeposit"; input: DepositInput }
  | { run: "runSecurities"; input: SecuritiesInput }
  | { run: "runMakam"; input: MakamInput }
  | { run: "runBond"; input: BondInput };

type Family = "provident" | "pension" | "deposit" | "securities" | "makam" | "bond";

/** The run each wrapper uses, and the instrument terms it takes (required, then optional). */
const runOf: Partial<Record<WrapperId, Family>> = {
  "kupat-gemel-lehashkaa": "provident",
  "keren-hishtalmut": "provident",
  "pension-comprehensive": "pension",
  "pension-general": "pension",
  "provident-for-annuity": "pension",
  "bank-deposit": "deposit",
  "savings-plan": "deposit",
  "current-account": "deposit",
  "money-market-fund-daily": "securities",
  "money-market-fund-renewable": "securities",
  "brokerage-account": "securities",
  "ira-hishtalmut": "securities",
  makam: "makam",
  "government-bond": "bond",
};

const notRun: Partial<Record<WrapperId, string>> = {
  "child-savings-provident": "runs on the NII amounts (F-54), not on P-05",
  "child-savings-bank": "runs on the NII amounts (F-54), not on P-05",
  "ira-provident": "exit F-48 and F-49 are blocked (G-03, G-06)",
};

const termKeys: Record<Family, { required: (keyof InstrumentTerms)[]; optional: (keyof InstrumentTerms)[] }> = {
  provident: { required: ["fees"], optional: [] },
  pension: { required: ["fees", "pension"], optional: ["insurance"] },
  deposit: { required: ["deposit"], optional: [] },
  securities: { required: ["fund", "tariff"], optional: ["broker", "currency"] },
  makam: { required: ["tariff"], optional: ["makam"] },
  bond: { required: ["bond", "tariff"], optional: [] },
};

/** Fields of each nested term; any other field (a rate, a yield) would override P-05, so it is an error. */
const nestedKeys: Partial<Record<keyof InstrumentTerms, string[]>> = {
  fees: ["deposit", "balance", "direct", "discount"],
  hishtalmut: ["employment", "monthlySalary", "clockStartMonth", "earlyWithdrawal", "employerRate"],
  pension: ["employment", "monthlySalary", "annualIncome", "existingEmployeeRate", "employer"],
  insurance: ["rate"],
  deposit: ["termMonths", "linkage"],
  currency: ["returnIn", "fxChange"],
  ira: ["managerFee", "clockStartMonth"],
  makam: ["termMonths"],
  bond: ["linkage", "couponEveryMonths", "exitPriceChange"],
};

/** Tariff lines each run reads; a line the run would ignore is an error, not a silent drop. */
const tariffKeys: Partial<Record<Family, string[]>> = { makam: ["buy", "sell"], bond: ["buy", "sell", "custody"] };

/**
 * Fund kinds a wrapper can hold. The engine runs a taxable money-market fund with a daily fund's liquidity
 * (no fixed dates, F-23), so it sits under the daily wrapper; whether each fund TXS-24 names is a daily or a
 * renewable fund is not in the rule base, and its fund record must say.
 */
const fundsHeldAsSecurities: Fund["kind"][] = ["israeli-fund", "tase-foreign-fund", "foreign-fund"];
const fundKinds: Partial<Record<WrapperId, Fund["kind"][]>> = {
  "money-market-fund-daily": ["money-market-daily", "money-market-taxable"],
  "money-market-fund-renewable": ["money-market-renewable"],
  "brokerage-account": fundsHeldAsSecurities,
  "ira-hishtalmut": fundsHeldAsSecurities,
};

/** Instrument terms a wrapper needs beyond its run's own. */
const extraTerms: Partial<Record<WrapperId, keyof InstrumentTerms>> = { "keren-hishtalmut": "hishtalmut", "ira-hishtalmut": "ira" };

const depositKind = {
  "bank-deposit": "deposit",
  "savings-plan": "savings-plan",
  "current-account": "current-account",
} as const;

/**
 * Builds the inputs of the run for one wrapper. `record` and `parameters` are as read from
 * `data/instruments/wrappers/` and `data/parameters/`; they are checked here, so the caller need not.
 */
export function runInputs(
  record: unknown,
  parameters: readonly unknown[],
  instrument: InstrumentTerms,
  options: RunInputOptions = {},
): RunPlan {
  const w = parse(wrapperRecord, record, `wrapper record`);
  checkFormulas(w);
  const family = runOf[w.id];
  if (!family) throw new RecordInputError(`${w.id} has no run yet: ${notRun[w.id]}`);
  checkTerms(w.id, family, instrument);

  const p05 = scenario(parameters, options.entered ?? {});
  const months = 12 * p05.horizon_years;
  if (!Number.isInteger(months)) throw new RecordInputError(`P-05 horizon_years: ${p05.horizon_years} years is not a whole number of months`);
  const goal = { amountNow: p05.amount_now, monthly: p05.monthly_deposit, months };
  const inflation = p05["A-02"] / 100;
  // P-05's cash rate is the default for a cash-like product; a comparison replaces it per candidate with the
  // product's sourced or entered rate (A-20 to A-25, `withCashRate`).
  const cashRate = p05.cash_rate / 100;
  // P-05's income is a default for the illustrative run only: the caller's own income (the person's entered income) wins.
  const profile: Profile = { ...(options.profile ?? {}) };
  if (options.scenarioIncome && profile.annualIncome === undefined && p05.annual_income !== undefined) profile.annualIncome = p05.annual_income;
  const t = instrument;

  switch (family) {
    case "provident": {
      const input: ProvidentInput = {
        wrapper: w.id as ProvidentInput["wrapper"],
        goal,
        market: { grossReturn: p05["A-01"] / 100, inflation },
        fees: t.fees!,
        profile,
      };
      if (t.hishtalmut) input.hishtalmut = t.hishtalmut;
      return { run: "runProvident", input };
    }
    case "pension": {
      // The pension's net outlay is P-05's monthly deposit (F-30 finds the gross deposit); A-17 is entered.
      const input: PensionInput = {
        wrapper: w.id as PensionInput["wrapper"],
        goal,
        market: { grossReturn: p05["A-01"] / 100, inflation },
        fees: t.fees!,
        insurance: t.insurance ?? { rate: 0 },
        pension: t.pension!,
        profile,
      };
      return { run: "runPension", input };
    }
    case "deposit": {
      const kind = depositKind[w.id as keyof typeof depositKind];
      return { run: "runDeposit", input: { goal, market: { inflation }, deposit: { kind, rate: cashRate, ...t.deposit! }, profile } };
    }
    case "securities": {
      // F-23 G-30: which series a monthly deposit into a renewable fund buys is not set.
      if (t.fund!.kind === "money-market-renewable" && goal.monthly > 0) throw new NotEvaluatedError("G-30");
      const grossReturn = fundsHeldAsSecurities.includes(t.fund!.kind) ? p05["A-01"] / 100 : cashRate;
      const input: SecuritiesInput = { goal, market: { grossReturn, inflation, ...t.currency }, fund: t.fund!, tariff: t.tariff!, profile };
      if (t.broker) input.broker = t.broker;
      if (t.ira) input.wrapper = { kind: "ira-hishtalmut", ...t.ira };
      return { run: "runSecurities", input };
    }
    case "makam":
      return { run: "runMakam", input: { goal, market: { inflation }, makam: { yield: cashRate, ...t.makam }, tariff: t.tariff!, profile } };
    case "bond":
      return { run: "runBond", input: { goal, market: { inflation }, bond: { coupon: cashRate, ...t.bond! }, tariff: t.tariff!, profile } };
  }
}

/** Runs a plan from `runInputs` with the ledger it names. */
export function runPlanned(plan: RunPlan, ctx: RunContext): RunResult {
  switch (plan.run) {
    case "runProvident":
      return runs.runProvident(plan.input, ctx);
    case "runPension":
      return runs.runPension(plan.input, ctx);
    case "runDeposit":
      return runs.runDeposit(plan.input, ctx);
    case "runSecurities":
      return runs.runSecurities(plan.input, ctx);
    case "runMakam":
      return runs.runMakam(plan.input, ctx);
    case "runBond":
      return runs.runBond(plan.input, ctx);
  }
}

function parse<T extends z.ZodType>(schema: T, value: unknown, what: string): z.infer<T> {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `${i.path.join(".") || "(top)"}: ${i.message}`);
  throw new RecordInputError(`${what}: ${issues.join("; ")}`);
}

/** Each formula the record names must be one the engine computes; a pending one stops with its release. */
function checkFormulas(w: WrapperRecord) {
  for (const [field, id] of [
    ["deposit_side_tax", w.deposit_side_tax.formula],
    ["tax_during", w.tax_during.formula],
    ["tax_at_exit", w.tax_at_exit.formula],
  ] as const) {
    if (id in formulas) continue;
    const later = pending[id];
    throw new RecordInputError(
      later ? `${w.id} ${field}: ${id} is not computed yet (${later})` : `${w.id} ${field}: ${id} is not a formula of the engine`,
    );
  }
}

function checkTerms(id: WrapperId, family: Family, t: InstrumentTerms) {
  const { required, optional } = termKeys[family];
  const extra = extraTerms[id];
  const needed = extra ? [...required, extra] : required;
  const allowed = new Set<string>([...needed, ...optional]);
  for (const key of Object.keys(t) as (keyof InstrumentTerms)[]) {
    if (!allowed.has(key)) throw new RecordInputError(`instrument.${key} is not an input of the ${family} run for ${id}`);
    const fields = nestedKeys[key];
    for (const field of fields && t[key] ? Object.keys(t[key]) : []) {
      if (!fields!.includes(field)) throw new RecordInputError(`instrument.${key}.${field} is not a field of ${key}`);
    }
  }
  for (const key of needed) {
    if (t[key] === undefined) throw new RecordInputError(`instrument.${key} is missing: the ${family} run for ${id} needs it`);
  }
  const lines = tariffKeys[family];
  for (const key of lines ? Object.keys(t.tariff!) : []) {
    if (!lines!.includes(key)) throw new RecordInputError(`instrument.tariff.${key} is not read by the ${family} run for ${id}`);
  }
  // A-17: a pension fund needs the insurance cost, entered; a provident fund for annuity has none (PEN-35).
  if (family === "pension") {
    if (id === "provident-for-annuity" && t.insurance) throw new RecordInputError(`instrument.insurance is not an input for ${id}: it has no pooled insurance (PEN-35)`);
    if (id !== "provident-for-annuity" && !t.insurance) throw new RecordInputError(`instrument.insurance is missing: ${id} needs the insurance cost A-17 (entered by the person, G-12)`);
  }
  const kinds = fundKinds[id];
  if (kinds && !kinds.includes(t.fund!.kind)) throw new RecordInputError(`instrument.fund.kind "${t.fund!.kind}" is not a fund of ${id}`);
}

/** P-05's seven inputs (the seventh optional) as numbers in their units, each replaced by the person's entered value when there is one. */
function scenario(parameters: readonly unknown[], entered: Partial<Record<string, ValueObject>>): Record<Exclude<P05Input, "annual_income">, number> & { annual_income?: number } {
  const found = parameters.filter((p) => (p as { method_id?: unknown })?.method_id === "P-05");
  if (found.length !== 1) throw new RecordInputError(`data/parameters/ holds ${found.length} records for P-05; the run needs exactly one`);
  const p = parse(parameterRecord, found[0], "P-05");
  const inputs = (p as { inputs?: unknown }).inputs;
  if (typeof inputs !== "object" || inputs === null) throw new RecordInputError("P-05 inputs is missing");

  const keys = Object.keys(p05Units) as P05Input[];
  for (const key of Object.keys(inputs)) {
    if (!(key in p05Units)) throw new RecordInputError(`P-05 inputs.${key} is not a P-05 input (${keys.join(", ")})`);
  }
  for (const key of Object.keys(entered)) {
    if (!(key in p05Units)) throw new RecordInputError(`entered ${key} has no P-05 counterpart to replace`);
  }

  const out = {} as Record<P05Input, number>;
  for (const key of keys) {
    const own = entered[key];
    const where = own ? `entered ${key}` : `P-05 inputs.${key}`;
    const raw = own ?? (inputs as Record<string, unknown>)[key];
    if (raw === undefined && p05Optional.includes(key)) continue;
    if (raw === undefined) throw new RecordInputError(`${where} is missing`);
    const v = parse(valueObject, raw, where);
    if (own && v.state !== "entered") throw new RecordInputError(`${where}: a value the person entered has state "entered", not "${v.state}"`);
    if (v.unit !== p05Units[key]) throw new RecordInputError(`${where}: unit is ${v.unit}, expected ${p05Units[key]}`);
    if (typeof v.value !== "number" || !Number.isFinite(v.value)) throw new RecordInputError(`${where}: value ${JSON.stringify(v.value)} is not a number`);
    out[key] = v.value;
  }
  return out;
}
