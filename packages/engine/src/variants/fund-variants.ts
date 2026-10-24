// F-65 Fund variants: for one exposure, every fund that tracks it (the latest Israeli fund list, TASE's latest
// foreign-fund list, and the foreign-domiciled funds held in `data/funds/`), each run through F-08 with the
// fund's own drag, currency, distribution policy and domicile rules. Ranked by F-80; coverage by F-83.
// No I/O: the lists and fund records arrive as data.
import { fundRecord, type ExposureRecord, type FundListFile, type FundRecord, type ValueObject } from "@finance-tool/schema";
import { coverageLine } from "../compare/coverage.ts";
import { reasonFromError } from "../compare/candidates.ts";
import { rankCandidates, type Ranking } from "../compare/ranking.ts";
import { outcomeOrder, type Candidate, type CoverageLine, type OutcomeKind, type Reason } from "../compare/types.ts";
import type { Goal } from "../formulas/time.ts";
import type { Profile } from "../ledgers/common.ts";
import { runSecurities, type Fund, type SecuritiesInput } from "../ledgers/securities.ts";
import { RecordInputError } from "../resolver.ts";
import type { Label, RunContext, RunResult } from "../result.ts";
import type { RunPlan } from "../inputs.ts";

/** How a list row is matched to the exposure beyond what the fund records say (documented in `matchRow`). */
export interface VariantMatching {
  /** Exposure codes the Israeli list prints (for example "4D") that stand for this exposure. */
  exposureCodes?: string[];
  /** Reference-asset texts that stand for this exposure. */
  referenceAssets?: string[];
}

export interface VariantExposure {
  record: ExposureRecord;
  matching?: VariantMatching;
  /** What every variant's run shares: the goal, A-01 and A-02 (and A-03), and the person's own account. */
  run: {
    goal: Goal;
    /** A-01 in the exposure's own currency, a fraction. */
    grossReturn: number;
    inflation: number;
    /** A-03: the exchange-rate change of a foreign currency against the shekel. */
    fxChange?: number;
    /** The provider's tariff, the same for every variant. */
    tariff: SecuritiesInput["tariff"];
    broker?: SecuritiesInput["broker"];
    profile: Profile;
    /** W-8BEN on file (TXF-13), the person's own fact. */
    w8ben?: boolean;
    /** NIS per unit of a foreign currency at the start (BoI series `data/series/fx`), by ISO code; needed for a fund bought in that currency. */
    fxStartRates?: Record<string, number>;
    /** A-10 distribution yield and payments a year per fund record id, entered or from the fund's documents; the fund record has no yield field. */
    distributions?: Record<string, { yield: number; perYear: number }>;
    ordersPerMonth?: number;
  };
  /** P-01 as a fraction. */
  theta: number;
}

export type VariantSource = "maya-mutual-funds" | "tase-foreign-funds" | "data-funds";

export interface VariantRow {
  /** `maya:<fund number>`, `tase:<security number>` or `fund:<record id>`. */
  id: string;
  name: string;
  manager: string | null;
  source: VariantSource;
  kind: OutcomeKind;
  reasons: Reason[];
  /** The `data/funds/` record's id, when there is one. */
  recordId?: string;
  /** A record of an Israeli fund that the latest list no longer prints (listed so it is not lost). */
  notInLatestList?: boolean;
  /** Fee fields the record leaves empty, taken as 0 by A-07 to A-11's defaults, so the page can say they were not collected. */
  notCollected: string[];
  plan?: RunPlan;
  run?: RunResult;
  labels: Label[];
  rank?: number;
}

export interface VariantGroupLine {
  id: "group:foreign-traded-abroad";
  gapId: "G-29";
  /** Foreign-domiciled funds in `data/funds/` for this exposure, compared one by one. */
  held: number;
}

export interface FundVariants {
  formula: "F-65";
  exposureId: string;
  /** The snapshot of each list used; null when the caller gave none, so the page does not claim it was read. */
  lists: { israeli: string | null; tase: string | null };
  rows: VariantRow[];
  group: VariantGroupLine;
  ranking: Ranking;
  coverage: CoverageLine<OutcomeKind>;
}

type Row = FundListFile["funds"][number];

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
const isIls = (c: string) => c === "NIS" || c === "ILS";

function latest(lists: readonly FundListFile[], id: FundListFile["list"]): FundListFile | undefined {
  let best: FundListFile | undefined;
  for (const l of lists) if (l.list === id && (!best || l.snapshot >= best.snapshot)) best = l;
  return best;
}

function fraction(vo: ValueObject | null | undefined, unit: ValueObject["unit"], what: string): number | undefined {
  if (!vo || vo.value === null) return undefined;
  if (vo.unit !== unit) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected ${unit}`);
  if (typeof vo.value !== "number") throw new RecordInputError(`${what}: value ${JSON.stringify(vo.value)} is not a number`);
  return vo.value / 100;
}

/**
 * The record that belongs to a list row: its TASE number or id is the row's fund number, or both print the same ISIN.
 */
function recordOf(row: Row, records: readonly FundRecord[]): FundRecord | undefined {
  return records.find((r) => r.identifiers.tase_number === row.fund_number || r.id === row.fund_number || (row.isin !== null && r.identifiers.isin === row.isin));
}

/**
 * The matching rule, kept simple. A row with a `data/funds/` record matches when the record's `exposure_id` is this
 * exposure (the record is the more specific evidence, so it also overrides a code that happens to match). A row
 * without a record matches when its `exposure_code` is one of the codes of this exposure's records or the caller's
 * `matching.exposureCodes`, or when its `reference_asset` equals (ignoring case and spacing) one of the exposure's
 * names or the caller's `matching.referenceAssets`.
 */
function matchRow(row: Row, record: FundRecord | undefined, exposure: VariantExposure, codes: Set<string>, refs: Set<string>): boolean {
  if (record) return record.exposure_id === exposure.record.id;
  if (row.exposure_code !== null && codes.has(row.exposure_code)) return true;
  return row.reference_asset != null && refs.has(norm(row.reference_asset));
}

/** The fund the engine runs for a record, and the fee fields the record leaves empty (exported 2026-10-24 so the provider workbench builds its fund the same way). */
export function fundOf(rec: FundRecord, kind: Fund["kind"], dist: { yield: number; perYear: number } | undefined, w8ben: boolean | undefined) {
  const notCollected: string[] = [];
  const f = rec.fees;
  const get = (key: keyof FundRecord["fees"], unit: ValueObject["unit"]) => {
    const v = fraction(f[key], unit, `fund ${rec.id} fees.${key}`);
    if (v === undefined) notCollected.push(key);
    return v;
  };
  const management = get("fixed_management", "pct_per_year");
  const trustee = get("trustee", "pct_per_year");
  const variable = get("variable_management", "pct_per_year");
  const tracking = get("tracking_difference_12m", "pct_per_year");
  const spread = get("median_spread", "pct_of_trade");
  const withholding = get("fund_level_withholding_drag", "pct_per_year");
  const drag: NonNullable<Fund["drag"]> = {};
  if (management !== undefined) drag.management = management;
  if (trustee !== undefined) drag.trustee = trustee;
  if (variable !== undefined) drag.variable = variable;
  if (tracking !== undefined) drag.tracking = tracking;
  if (withholding !== undefined) drag.foreignWithholding = withholding;
  const fund: Fund = { kind, drag };
  // A-08: half of the published median bid-ask spread.
  if (spread !== undefined) fund.halfSpread = spread / 2;
  if (dist) fund.distribution = dist;
  const domicile = rec.domicile === "US" ? "us" : rec.domicile === "IE" ? "ireland" : undefined;
  if (domicile) fund.domicile = domicile;
  if (w8ben !== undefined) fund.w8ben = w8ben;
  if (kind === "tase-foreign-fund" && rec.tax_status.tase_foreign_fund_90pct_test?.value === true) fund.ninetyPercentTest = true;
  return { fund, notCollected, hasManagement: management !== undefined };
}

interface Cand {
  id: string;
  name: string;
  manager: string | null;
  source: VariantSource;
  record?: FundRecord;
  notInLatestList?: boolean;
}

function evaluate(c: Cand, exposure: VariantExposure, ctx: RunContext): VariantRow {
  const base = { id: c.id, name: c.name, manager: c.manager, source: c.source, notCollected: [] as string[], labels: [] as Label[], ...(c.record ? { recordId: c.record.id } : {}), ...(c.notInLatestList ? { notInLatestList: true as const } : {}) };
  const notEvaluated = (...reasons: Reason[]): VariantRow => ({ ...base, kind: "not-evaluated", reasons });
  const rec = c.record;
  // F-65: no record, no run.
  if (!rec) return notEvaluated({ code: "missing-record", ruleIds: [], gapIds: [], detail: "details not collected" });

  const x = exposure.run;
  // A money-market fund's kind (daily, renewable, taxable: F-23) is not a field of the fund record.
  if (exposure.record.cash_like) return notEvaluated({ code: "gap", ruleIds: [], gapIds: [], detail: "a money-market fund's kind (F-23) is not in its fund record" });

  const israeli = rec.domicile === "IL";
  const kind: Fund["kind"] = c.source === "tase-foreign-funds" || (!israeli && rec.trading_currency_on_tase !== null) ? "tase-foreign-fund" : israeli ? "israeli-fund" : "foreign-fund";
  if (israeli && rec.tax_status.il_fund_tax_track !== "exempt") {
    return notEvaluated(
      rec.tax_status.il_fund_tax_track === null
        ? { code: "missing-record", ruleIds: [], gapIds: [], detail: "details not collected: tax_status.il_fund_tax_track" }
        : { code: "no-run", ruleIds: [], gapIds: [], detail: "a taxable Israeli fund other than a money-market fund has no run yet" },
    );
  }
  const policy = rec.distribution_policy;
  if (policy === null) return notEvaluated({ code: "missing-record", ruleIds: [], gapIds: [], detail: "details not collected: distribution_policy" });
  const dist = x.distributions?.[rec.id];
  if (policy === "distributing" && !dist) return notEvaluated({ code: "missing-input", ruleIds: [], gapIds: [], detail: `distributions.${rec.id}: the distribution yield (A-10) is not in the fund record` });
  if (policy === "distributing" && !israeli && rec.domicile !== "US" && rec.domicile !== "IE") {
    return notEvaluated({ code: "no-run", ruleIds: [], gapIds: [], detail: `foreign withholding for domicile ${rec.domicile} is not set` });
  }

  const built = fundOf(rec, kind, policy === "distributing" ? dist : undefined, x.w8ben);
  if (!built.hasManagement) return { ...base, notCollected: built.notCollected, kind: "not-evaluated", reasons: [{ code: "missing-record", ruleIds: [], gapIds: [], detail: "details not collected: fees.fixed_management" }] };

  // F-04: a fund in a foreign currency earns A-01 in that currency with A-03 on top; a shekel fund on a foreign exposure earns the same in shekels.
  const exposureCurrency = exposure.record.currency;
  const fundCurrency = isIls(rec.currency) ? "ILS" : rec.currency;
  const f = x.fxChange ?? 0;
  const market: SecuritiesInput["market"] = { grossReturn: x.grossReturn, inflation: x.inflation };
  const tariff = { ...x.tariff };
  if (fundCurrency === "ILS") {
    if (!isIls(exposureCurrency)) market.grossReturn = (1 + x.grossReturn) * (1 + f) - 1;
  } else {
    if (fundCurrency !== exposureCurrency) return { ...base, notCollected: built.notCollected, kind: "not-evaluated", reasons: [{ code: "no-run", ruleIds: [], gapIds: [], detail: `a ${fundCurrency} fund on a ${exposureCurrency} exposure has no run` }] };
    market.returnIn = "instrument";
    market.fxChange = f;
    // Bought in shekels on TASE: no conversion, so no FX line; bought abroad in the fund's currency: converted (F-13).
    const quote = rec.trading_currency_on_tase;
    if (quote === null || !isIls(quote)) {
      const rate = x.fxStartRates?.[fundCurrency];
      if (rate === undefined) return { ...base, notCollected: built.notCollected, kind: "not-evaluated", reasons: [{ code: "missing-input", ruleIds: [], gapIds: [], detail: `fxStartRates.${fundCurrency}` }] };
      tariff.currency = { code: fundCurrency, startRate: rate };
    }
  }
  const input: SecuritiesInput = { goal: x.goal, market, fund: built.fund, tariff, profile: x.profile };
  if (x.broker) input.broker = x.broker;
  if (x.ordersPerMonth !== undefined) input.ordersPerMonth = x.ordersPerMonth;
  const plan: RunPlan = { run: "runSecurities", input };
  let run: RunResult;
  try {
    run = runSecurities(input, ctx);
  } catch (e) {
    const reason = reasonFromError(e);
    if (!reason) throw e;
    return { ...base, notCollected: built.notCollected, kind: "not-evaluated", reasons: [reason] };
  }
  const reasons: Reason[] = [];
  if (run.outcome.code === "listed-not-ranked") {
    // G-18: an accumulating foreign fund, computed under the secondary reading of TXF-11, listed and not ranked.
    reasons.push(run.outcome.reason.startsWith("G-") ? { code: "gap", ruleIds: [], gapIds: [run.outcome.reason] } : { code: "exit-blocked", ruleIds: [run.outcome.reason], gapIds: [] });
  }
  return { ...base, notCollected: built.notCollected, kind: reasons.length > 0 ? "listed-not-ranked" : "ranked", reasons, plan, run, labels: run.labels };
}

/**
 * F-65 Fund variants. Candidates: every row of the latest Israeli fund list (CAT-34) and of TASE's latest
 * foreign-fund list (ETF-32) that matches the exposure (`matchRow`), and every foreign-domiciled fund in `funds` for
 * the exposure that no list row stands for (traded abroad); a record of an Israeli fund the list no longer prints is
 * kept as a candidate too. Each candidate with a record runs F-08 with its own drag (A-06 to A-11), currency (F-04),
 * distribution policy (F-20) and domicile rules (F-40, F-41); an accumulating foreign fund is computed under the
 * secondary reading of TXF-11 (labelled) and listed, not ranked (G-18). A candidate without a record is "not evaluated:
 * details not collected". Foreign-domiciled funds traded abroad that are not in `funds` are one group line (G-29).
 * The rest are ranked by real value with ties by F-80, and the coverage line (F-83) accounts for each candidate once.
 */
export function fundVariants(exposure: VariantExposure, lists: readonly FundListFile[], funds: readonly unknown[], ctx: RunContext): FundVariants {
  const records = funds.map((f, i) => {
    const r = fundRecord.safeParse(f);
    if (!r.success) throw new RecordInputError(`fund record ${i}: ${r.error.issues.map((x) => `${x.path.join(".") || "(top)"}: ${x.message}`).join("; ")}`);
    return r.data;
  });
  const mine = records.filter((r) => r.exposure_id === exposure.record.id);
  const codes = new Set([...(exposure.matching?.exposureCodes ?? []), ...mine.map((r) => r.exposure_code).filter((c): c is string => typeof c === "string")]);
  const refs = new Set([...exposure.record.names.he, ...exposure.record.names.en, ...(exposure.matching?.referenceAssets ?? [])].map(norm));

  const israeli = latest(lists, "maya-mutual-funds");
  const tase = latest(lists, "tase-foreign-funds");
  const cands: Cand[] = [];
  const stood = new Set<string>();
  for (const [file, prefix, source] of [
    [israeli, "maya", "maya-mutual-funds"],
    [tase, "tase", "tase-foreign-funds"],
  ] as const) {
    for (const row of file?.funds ?? []) {
      const record = recordOf(row, records);
      if (record) stood.add(record.id);
      if (!matchRow(row, record, exposure, codes, refs)) continue;
      cands.push({ id: `${prefix}:${row.fund_number}`, name: row.names.he[0]!, manager: row.manager, source, ...(record ? { record } : {}) });
    }
  }
  for (const r of mine) {
    if (stood.has(r.id)) continue;
    cands.push({ id: `fund:${r.id}`, name: r.names.he[0] ?? r.names.en[0] ?? r.id, manager: r.manager, source: "data-funds", record: r, ...(r.domicile === "IL" ? { notInLatestList: true } : {}) });
  }

  const rows = cands.map((c) => evaluate(c, exposure, ctx));
  const asCandidates: Candidate[] = rows.map((r) => ({ id: r.id, name: r.name, tier: 1, kind: r.kind, reasons: r.reasons, ...(r.plan ? { plan: r.plan } : {}), ...(r.run ? { run: r.run } : {}) }));
  const ranking = rankCandidates(asCandidates, { theta: exposure.theta, ctx });
  for (const e of ranking.entries) rows.find((r) => r.id === e.id)!.rank = e.rank;

  const group: VariantGroupLine = { id: "group:foreign-traded-abroad", gapId: "G-29", held: mine.filter((r) => r.domicile !== "IL" && r.trading_currency_on_tase === null).length };
  // G-29 counts only foreign-domiciled funds traded abroad; a foreign fund traded on TASE is a candidate row of its own (review 2026-10-24).
  const coverage = coverageLine(
    [
      ...rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind, reasons: r.reasons })),
      { id: group.id, name: "foreign-domiciled funds traded abroad, not held one by one", kind: "not-evaluated" as const, reasons: [{ code: "gap" as const, ruleIds: [], gapIds: [group.gapId], detail: `not held one by one; ${group.held} held` }] },
    ],
    outcomeOrder,
    ["ranked"],
  );
  return {
    formula: "F-65",
    exposureId: exposure.record.id,
    lists: { israeli: israeli?.snapshot ?? null, tase: tase?.snapshot ?? null },
    rows,
    group,
    ranking,
    coverage,
  };
}
