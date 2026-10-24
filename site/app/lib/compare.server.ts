// The data the browser needs for every comparison (flows 12 to 16), built once at build time and served as
// /compare-bundle.json: the wrapper records, their instrument terms (the same ones the guide pages use), the
// parameters, the rule records any run may read, the tier-2 list and the checklist rows. Server-only.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DepositTerms, FeesSnapshot, ParameterRecord, RuleRecord, ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import type { InstrumentTerms } from "@finance-tool/engine";
import { loadChecklistRows, loadCmaFees, loadFees, loadNotCovered, loadParameters, loadRules, loadWrappers, root, today } from "./data.server";
import { buildInstrumentTerms, loadDepositTerms, loadExposures, loadFunds, regulatorAverageFees } from "./instruments.server";
import { evaluate, type BundleDataFile, type CompareBundle, type ExposureEntry, type Family, type HoldingTerms, type RunGoal, type Tier2Row, type WrapperEntry } from "./compare";
import type { FitTableData } from "./fit";
import type { SiteValue } from "./value";

const familyById: Partial<Record<WrapperId, Family>> = {
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

/** The nine tier-2 instruments (product D2) with the glossary row that names each; the open questions are method G-24's. */
export const tier2Table: { id: string; he: string; questions: string[]; display: string }[] = [
  { id: "savings-policies", he: "פוליסת חיסכון", questions: ["TXA OQ1", "TXA OQ3"], display: "TXA OQ1, TXA OQ3" },
  { id: "executive-insurance", he: "ביטוח מנהלים", questions: ["TXA OQ6"], display: "TXA OQ6" },
  { id: "structured-deposits", he: "פיקדון מובנה", questions: ["TX2 OQ5"], display: "TX2 OQ5" },
  { id: "corporate-bonds", he: 'אג"ח קונצרניות', questions: ["TX2 OQ6"], display: "TX2 OQ6" },
  { id: "managed-portfolios", he: "ניהול תיקי השקעות", questions: ["TX2 OQ12", "MF-28"], display: "TX2 OQ12, MF-28" },
  { id: "foreign-currency-deposits", he: "פיקדון במטבע חוץ", questions: ["TX2 OQ1", "TX2 OQ2"], display: "TX2 OQ1, TX2 OQ2" },
  { id: "reits", he: "קרן להשקעות במקרקעין", questions: ["TX2 OQ8"], display: "TX2 OQ8" },
  { id: "gold-via-funds", he: "השקעה בזהב דרך קרנות סל", questions: ["TX2 OQ10"], display: "TX2 OQ10" },
  { id: "amendment-190-deposits", he: "תיקון 190", questions: ["TXA OQ9"], display: "TXA OQ9" },
];

function tier2List(): Tier2Row[] {
  const rows = new Map(loadNotCovered().map((r) => [r.he, r]));
  const g24 = readFileSync(join(root, "docs/method.md"), "utf8").split("\n").find((l) => l.startsWith("| G-24 |")) ?? "";
  return tier2Table.map((t) => {
    if (!rows.has(t.he)) throw new Error(`compare bundle: docs/glossary.md section 3 has no row "${t.he}" for tier-2 instrument ${t.id}`);
    for (const q of t.questions) if (!g24.includes(q)) throw new Error(`compare bundle: method G-24 does not name ${q} (tier-2 instrument ${t.id})`);
    return { id: t.id, name: t.he, openQuestion: t.display };
  });
}

/**
 * The provident-family fees the guide page builds (guide.server.ts), without throwing on a second snapshot: the
 * provider's list fee lines when they cover the wrapper; for a fee the list does not give (a study fund, a general
 * pension fund, a provident fund for annuity: no company publishes a list price) the regulator's average actually
 * charged on the `track` P-05's entry names (method 2.4), labelled as an average. The pension and study-fund terms
 * that come from the person (employment, salary, insurance) are added when a run is built (compare.ts).
 */
function providentTerms(
  id: string,
  snapshots: FeesSnapshot[],
  spec: NonNullable<ParameterRecord["instruments"]>[string] | undefined,
  allRules: Record<string, RuleRecord>,
  today: string,
): { terms?: InstrumentTerms; feeValues: Record<string, SiteValue>; missing: string[] } {
  const covering = snapshots.filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list"));
  if (covering.length > 1) return { feeValues: {}, missing: [`${id}: ${covering.length} fee snapshots cover it; one must be chosen in a site parameter`] };
  const snap = covering[0];
  const line = (base: string) => snap?.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base);
  const balance = line("balance");
  const deposit = line("deposit");
  const direct = line("direct_expenses");
  const pct = (v: ValueObject) => (v.value as number) / 100;
  if (balance && deposit) {
    const feeValues: Record<string, SiteValue> = { balance: { ...balance.rate }, deposit: { ...deposit.rate } };
    if (direct) feeValues.direct = { ...direct.rate };
    return { terms: { fees: { deposit: pct(deposit.rate), balance: pct(balance.rate), direct: direct ? pct(direct.rate) : 0 } }, feeValues, missing: [] };
  }
  const reg = regulatorAverageFees(id, spec, loadCmaFees(), allRules, today, { balance: !!balance, deposit: !!deposit });
  if (!reg) return { feeValues: {}, missing: [snap ? `${id}: ${snap.id} has no list ${balance ? "deposit" : "balance"} line for it and P-05 names no track` : `${id}: no list-fee snapshot in data/fees/ covers it and P-05 names no track`] };
  if ("missing" in reg) return { feeValues: {}, missing: reg.missing };
  const feeValues: Record<string, SiteValue> = { ...reg.feeValues };
  if (balance) feeValues.balance = { ...balance.rate };
  if (deposit) feeValues.deposit = { ...deposit.rate };
  if (direct) feeValues.direct = { ...direct.rate };
  return {
    terms: { fees: { balance: balance ? pct(balance.rate) : reg.fees.balance, deposit: deposit ? pct(deposit.rate) : reg.fees.deposit, direct: direct ? pct(direct.rate) : 0 } },
    feeValues,
    missing: [],
  };
}

function collectRuleIds(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectRuleIds(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "rule_ids" && Array.isArray(v)) v.forEach((id) => typeof id === "string" && out.add(id));
      else collectRuleIds(v, out);
    }
  }
  return out;
}

/** BANK-22's Bank of Israel page, read from the il-finance reference the rule record was written from (the record holds no link). */
function cashLink(): CompareBundle["cashLink"] {
  const file = join(root, ".claude/skills/il-finance/references/bank-current-account-deposits.md");
  if (!existsSync(file)) return null;
  const text = readFileSync(file, "utf8");
  const start = text.indexOf("### BANK-22");
  if (start < 0) return null;
  const end = text.indexOf("\n### ", start + 5);
  const section = text.slice(start, end < 0 ? undefined : end);
  const m = /\[(EDGE dataflow INTEREST_DASH)\]\((https?:\/\/[^)\s]+)\)/.exec(section);
  return m ? { href: m[2]!, title: "בנק ישראל, ריביות בפועל בפיקדונות (INTEREST_DASH)", ruleId: "BANK-22" } : null;
}

/** Profiles that change which rules a run reads: age (the 60 rules), employment, income, horizon, return, constraints. */
function probeGoals(): RunGoal[] {
  const out: RunGoal[] = [];
  const base: RunGoal = { horizonYears: 10, amountNow: 50_000, monthly: 2_000, available: 0, anytime: false, returnPct: 6, inflationPct: null, age: 22, employment: "employee", salary: 12_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
  for (const age of [22, 45, 65]) for (const employment of ["employee", "self-employed"] as const) for (const horizonYears of [1, 3, 7, 20, 40]) for (const salary of [12_000, 60_000]) out.push({ ...base, age, employment, horizonYears, salary });
  for (const returnPct of [null, 0, 12]) out.push({ ...base, returnPct });
  for (const anytime of [true, false]) for (const available of [0, 20_000]) out.push({ ...base, anytime, available, horizonYears: 4 });
  out.push({ ...base, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null }, { ...base, pensionEmployee: null, pensionEmployer: null, insurancePct: null }, { ...base, amountNow: 0 }, { ...base, monthly: 0, amountNow: 400_000 }, { ...base, monthly: 9_000, amountNow: 900_000, salary: 40_000, age: 62, horizonYears: 12 });
  return out;
}

/**
 * A deposit-family wrapper's own published rate (A-21, A-25; D20): the `rate_offered` of the deposit-terms record P-05
 * names, as the record holds it (a value object, state sourced, strength institution), so the run rests on the bank's
 * Directive 447 table and the row can say when it was published (`effective_from`).
 */
function depositRate(wrapperId: string, family: string, spec: { deposit_terms?: string } | undefined, deposits: DepositTerms[]): SiteValue | null {
  if (family !== "deposit" || !spec?.deposit_terms) return null;
  const rec = deposits.find((d) => d.id === spec.deposit_terms && d.wrapper_id === wrapperId);
  const rate = rec?.rate_offered;
  if (!rate || typeof rate.value !== "number" || rate.unit !== "pct_per_year") return null;
  return { ...rate };
}

/** Wrappers whose fund (and so whose terms) depend on the exposure they hold: the fund collected for the exposure (`exposure_id`) gives the terms. */
const fundHoldingWrappers: WrapperId[] = ["brokerage-account", "money-market-fund-daily", "money-market-fund-renewable"];

/**
 * Release 5, exposure mode: every exposure record, and for each exposure the terms of a securities wrapper that holds
 * it through the fund collected for it (P-05's tariff for that wrapper, the fund's own costs). An exposure with no
 * fund record has no entry: the row reads "not evaluated: details not collected", never another instrument's terms.
 */
function exposureData(wrappers: WrapperEntry[], p05: ParameterRecord, sources: Parameters<typeof buildInstrumentTerms>[3]): { exposures: ExposureEntry[]; exposureTerms: Record<string, Record<string, HoldingTerms>> } {
  const records = loadExposures();
  const funds = loadFunds();
  const exposureTerms: Record<string, Record<string, HoldingTerms>> = {};
  const exposures = records.map((record): ExposureEntry => {
    const forExposure = funds.filter((f) => (f as { exposure_id?: string }).exposure_id === record.id);
    for (const wid of fundHoldingWrappers) {
      if (!record.wrapper_ids?.includes(wid)) continue;
      const own = p05.instruments?.[wid];
      const fund = forExposure.find((f) => f.id === own?.fund) ?? forExposure[0];
      if (!fund) continue;
      const built = buildInstrumentTerms(wid, "securities", { ...(own ?? {}), fund: fund.id }, sources);
      if ("missing" in built) {
        console.log(`[compare] ${record.id} in ${wid} via fund ${fund.id}: no terms: ${built.missing.join("; ")}`);
        continue;
      }
      (exposureTerms[record.id] ??= {})[wid] = { fundId: fund.id, terms: built.terms, feeValues: built.feeValues };
    }
    return { record, name: record.names.he[0] ?? record.id, oneLine: record.one_line_he ?? null, guideHref: `/exposure/${record.id}`, variantsHref: forExposure.length > 0 ? `/workbench/funds/${record.id}` : null };
  });
  void wrappers;
  return { exposures, exposureTerms };
}

/** The latest `checked` date anywhere in a record: what a refresh of the file changes (F-82 compares it). */
function latestChecked(node: unknown, best: string | null = null): string | null {
  if (Array.isArray(node)) return node.reduce<string | null>((b, n) => latestChecked(n, b), best);
  if (node && typeof node === "object") {
    let b = best;
    for (const [k, v] of Object.entries(node)) {
      if (k === "checked" && typeof v === "string" && (!b || v > b)) b = v;
      else b = latestChecked(v, b);
    }
    return b;
  }
  return best;
}

/** The records a comparison reads, with the date each was last checked, for the saved comparison's versions. */
function dataFileVersions(): BundleDataFile[] {
  const out: BundleDataFile[] = [];
  const dirs: { dir: string; feeds: (rec: Record<string, unknown>) => string[] }[] = [
    { dir: "data/instruments/wrappers", feeds: (r) => [String(r.id)] },
    { dir: "data/instruments/exposures", feeds: (r) => [String(r.id)] },
    { dir: "data/terms/deposits", feeds: (r) => (typeof r.wrapper_id === "string" ? [r.wrapper_id] : []) },
    { dir: "data/funds", feeds: (r) => [String(r.exposure_id ?? ""), ...fundHoldingWrappers].filter(Boolean) },
    { dir: "data/fees", feeds: () => [] },
  ];
  for (const { dir, feeds } of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs).filter((n) => n.endsWith(".json")).sort()) {
      const rec = JSON.parse(readFileSync(join(abs, f), "utf8")) as Record<string, unknown>;
      out.push({ path: `${dir}/${f}`, checked: latestChecked(rec) ?? (typeof rec.snapshot === "string" ? rec.snapshot : null), for: feeds(rec) });
    }
  }
  return out;
}

export function buildCompareBundle(): CompareBundle {
  const t = today();
  const allRules = loadRules();
  const parameters = loadParameters().filter((p) => ["P-01", "P-02", "P-05", "P-07", "P-08"].includes((p as { method_id?: string }).method_id ?? "")) as ParameterRecord[];
  const p05 = parameters.find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  for (const m of ["P-01", "P-02", "P-07", "P-08"]) if (!parameters.some((p) => p.method_id === m)) throw new Error(`data/parameters/ holds no ${m} record`);

  const fees = loadFees();
  const sources = { fees, funds: loadFunds(), deposits: loadDepositTerms(), rules: allRules, today: t };
  const wrappers: WrapperEntry[] = loadWrappers().map((record: WrapperRecord): WrapperEntry => {
    const family = familyById[record.id] ?? null;
    const base = { id: record.id, name: record.names.he[0]!, family, record, feeValues: {} as Record<string, SiteValue>, missing: [] as string[] };
    if (family === "provident" || family === "pension") {
      const r = providentTerms(record.id, fees, p05.instruments?.[record.id], allRules, t);
      return { ...base, ...(r.terms ? { terms: r.terms } : {}), feeValues: r.feeValues, missing: r.missing };
    }
    if (family === null) return { ...base, missing: [`${record.id}: no instrument terms are built for it`] };
    const built = buildInstrumentTerms(record.id, family, p05.instruments?.[record.id], sources);
    const rate = depositRate(record.id, family, p05.instruments?.[record.id], sources.deposits);
    if ("missing" in built) return { ...base, missing: built.missing };
    return { ...base, terms: built.terms, feeValues: built.feeValues, ...(rate ? { cashRate: rate } : {}) };
  });
  for (const w of wrappers) for (const m of w.missing) console.log(`[compare] ${w.id}: no terms: ${m}`);

  const tier2 = tier2List();
  const checklist = loadChecklistRows();
  const { exposures, exposureTerms } = exposureData(wrappers, p05, sources);
  const dataFiles = dataFileVersions();

  // ---- the rules a run may read: found by running the comparison over the profiles above with every rule at hand,
  // plus every rule the wrapper records cite (reasons and chips link to them) and the two the screens quote.
  const draft: CompareBundle = { runDate: t, wrappers, parameters, tier2, rules: Object.values(allRules), checklist, cashLink: cashLink(), exposures, exposureTerms, dataFiles, site: { version: `r5-${t}`, data: `bundle-${t}` } };
  const needed = new Set<string>(["PEN-36", "BANK-22"]);
  for (const w of wrappers) collectRuleIds(w.record).forEach((id) => needed.add(id));
  for (const w of wrappers) for (const f of Object.values(w.feeValues)) (f.rule_ids ?? []).forEach((id) => needed.add(id));
  for (const e of exposures) (e.record.rule_ids ?? []).forEach((id) => needed.add(id));
  for (const byWrapper of Object.values(exposureTerms)) for (const h of Object.values(byWrapper)) for (const f of Object.values(h.feeValues)) (f.rule_ids ?? []).forEach((id) => needed.add(id));
  let runs = 0;
  for (const g of probeGoals()) {
    try {
      const ev = evaluate(draft, g);
      runs += 1;
      for (const c of ev.candidates) {
        c.run?.rules.forEach((r) => needed.add(r.id));
        c.reasons.forEach((r) => r.ruleIds.forEach((id) => needed.add(id)));
      }
      ev.set.keptAvailable?.run?.rules.forEach((r) => needed.add(r.id));
    } catch (e) {
      console.log(`[compare] probe stopped: ${e instanceof Error ? e.message : e}`);
    }
  }
  const rules: RuleRecord[] = Object.values(allRules).filter((r) => needed.has(r.id));
  const missingRules = [...needed].filter((id) => !allRules[id] && !/OQ/.test(id));
  if (missingRules.length > 0) console.log(`[compare] cited but not in data/rules/: ${missingRules.join(", ")}`);
  const bundle: CompareBundle = { ...draft, rules };
  console.log(`[compare] bundle: ${wrappers.length} wrappers, ${wrappers.filter((w) => w.terms).length} with terms, ${rules.length} of ${Object.keys(allRules).length} rules, ${runs} probe runs, ${(JSON.stringify(bundle).length / 1024).toFixed(0)} KB`);
  return bundle;
}

let cached: CompareBundle | null = null;
export function compareBundle(): CompareBundle {
  return (cached ??= buildCompareBundle());
}

/** What the goal form and the comparison read besides the bundle: the presets (P-07), the ranges, P-05's inflation, PEN-36's text. */
export function goalFormData() {
  const t = today();
  const parameters = loadParameters();
  const p07 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-07") as unknown as {
    presets: Record<string, unknown>;
    ranges: Record<string, { min: ValueObject; max: ValueObject; step?: ValueObject }>;
    rationale: string;
    rationale_he?: string;
    signed_off_on: string | null;
  };
  const p05 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-05") as unknown as {
    inputs: Record<string, ValueObject>;
    ranges: Record<string, { min: ValueObject; max: ValueObject }>;
    sliders: Record<string, { min: ValueObject; max: ValueObject; step?: ValueObject }>;
  };
  if (!p07 || !p05) throw new Error("data/parameters/ holds no P-07 or P-05 record");
  const range = (r: { min: ValueObject; max: ValueObject; step?: ValueObject }) => ({ min: r.min.value as number, max: r.max.value as number, step: (r.step?.value as number | undefined) ?? 1 });
  const rules = loadRules();
  const pen36 = rules["PEN-36"] ?? null;
  return {
    today: t,
    presets: p07.presets,
    meta: { rationale: p07.rationale, rationaleHe: p07.rationale_he ?? null, signedOffOn: p07.signed_off_on },
    form: {
      horizon: range(p07.ranges.horizon_years!),
      monthly: range(p05.sliders.monthly_deposit!),
      age: { min: p05.ranges.age!.min.value as number, max: p05.ranges.age!.max.value as number },
      pct: { min: p05.ranges.pct!.min.value as number, max: p05.ranges.pct!.max.value as number },
      inflationStart: p05.inputs["A-02"]!.value as number,
      minMonth: t.slice(0, 7),
      payslipText: (pen36 as { text_he?: string } | null)?.text_he ?? null,
    },
    rules: pen36 ? { "PEN-36": pen36 } : {},
  };
}

let contextCache: { today: string; presets: Record<string, unknown>; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null } } | null = null;

/** What a page needs to mount the saved-goal strip: the presets (P-07, to read a goal's preset-filled numbers) and their sign-off. */
export function goalContext() {
  if (!contextCache) {
    const d = goalFormData();
    contextCache = { today: d.today, presets: d.presets, meta: d.meta };
  }
  return contextCache;
}

/**
 * P-04, the classification-to-horizon fit table (`data/parameters/classification-fit.json`): the horizon half only.
 * The loss-filter column (`max_fall_pct`) ships from release 5 (D11) and is applied on the site (lib/fit.ts). Each bound is the record's
 * value object with the site-parameter marker, so the mark's rule line can show it through the provenance component.
 */
export function fitTable(): FitTableData {
  const rec = loadParameters().find((p) => (p as { method_id?: string }).method_id === "P-04") as unknown as
    | { table: { classification: string; horizon_min_years: ValueObject; horizon_max_years: ValueObject; max_fall_pct?: ValueObject }[]; rationale: string; rationale_he?: string; signed_off_on: string | null }
    | undefined;
  if (!rec) throw new Error("data/parameters/ holds no P-04 record");
  const param = (v: ValueObject): SiteValue => ({ ...v, parameter: { rationale: rec.rationale, rationaleHe: rec.rationale_he ?? null, signedOffOn: rec.signed_off_on ?? null, provisional: (v.notes ?? "").startsWith("provisional") } });
  return {
    rows: rec.table.map((r) => ({
      classification: r.classification,
      minYears: param(r.horizon_min_years),
      maxYears: typeof r.horizon_max_years.value === "number" ? param(r.horizon_max_years) : null,
      maxFallPct: r.max_fall_pct && typeof r.max_fall_pct.value === "number" ? param(r.max_fall_pct) : null,
    })),
  };
}
