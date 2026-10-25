// The engine bundle of a cash-like or securities-family guide page, shared by the page's own timeline (guide.server.ts) and by
// the signature visuals (guide-signature.server.ts), which run other wrappers' bundles beside their own. Server-only.
//
// 2026-10-25 (guide-page sweep, finding 2 and 3): a deposit-family wrapper runs on the published rate of the deposit-terms record
// P-05 names (A-21, A-25), not on P-05's `cash_rate`; the current account also carries its balance ceiling (F-26, BANK-09).
import type { Bundle } from "./engine";
import { p05Range, runTimeline } from "./engine";
import type { DepositTerms, ParameterRecord, RuleRecord, ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import { buildInstrumentTerms, loadDepositTerms, loadFunds } from "./instruments.server";
import { loadFees } from "./data.server";
import type { SiteValue } from "./value";

export type NoGraph =
  | { kind: "missing"; parts: string[] }
  | { kind: "pending"; formulas: string[] }
  | { kind: "stops"; code: string | null }
  | { kind: "none" };

/** The part of the data a missing-input line (instruments.server.ts) is about, in the words of copy noGraph. */
export function missingParts(messages: string[]): string[] {
  const parts: string[] = [];
  const add = (p: string) => parts.includes(p) || parts.push(p);
  for (const m of messages) {
    if (/deposit/i.test(m) && !/fees/i.test(m)) add("deposit");
    else if (/ira_fees/.test(m)) add("ira");
    else if (/employment/.test(m)) add("employment");
    else if (/series_rule|GOV rule|data\/rules/.test(m)) add("series");
    else if (/tariff|fees/i.test(m)) add("tariff");
    else if (/fund/i.test(m)) add("fund");
    else add("other");
  }
  return parts;
}

/** The rules a run may read, found by running the engine over the profiles that change its path. */
export function rulesTouched(bundle: Bundle): Set<string> {
  const ids = new Set<string>();
  // A large entered deposit takes the paths a small one does not (a study fund's deposit above the benefited
  // share reads TXH-11; a gemel lehashkaa's above its ceiling reads its routing rules): probe the slider's top too.
  const top = p05Range(bundle.p05, "sliders", "monthly_deposit")?.max;
  const deposits: (number | undefined)[] = top === undefined ? [undefined] : [undefined, top];
  for (const age of [null, 65]) {
    for (const monthly_deposit of deposits) {
      const t = runTimeline(bundle, { entered: monthly_deposit === undefined ? {} : { monthly_deposit }, age });
      if (t.kind === "ok") t.rules.forEach((r) => ids.add(r.id));
    }
  }
  return ids;
}

/** A deposit record P-05 names for a wrapper: its published rate, ceiling and the record itself. */
export interface PublishedDeposit {
  record: DepositTerms;
  rate: SiteValue;
  /** The balance that earns the rate, for a current account only (`amount_range.max`, BANK-09). */
  ceiling?: SiteValue;
}

/** The deposit record P-05's `instruments` names for the wrapper, with its rate as a value object; null when there is none or the rate is not a number. */
export function publishedDeposit(wrapperId: string, spec: { deposit_terms?: string } | undefined, deposits: DepositTerms[]): PublishedDeposit | null {
  if (!spec?.deposit_terms) return null;
  const record = deposits.find((d) => d.id === spec.deposit_terms && d.wrapper_id === wrapperId);
  const rate = record?.rate_offered;
  if (!record || !rate || typeof rate.value !== "number" || rate.unit !== "pct_per_year") return null;
  const max = record.amount_range?.max;
  const ceiling = wrapperId === "current-account" && max && max.unit === "nis" && typeof max.value === "number" ? ({ ...max } as SiteValue) : undefined;
  return { record, rate: { ...rate } as SiteValue, ...(ceiling ? { ceiling } : {}) };
}

/** P-05 with a published rate in place of `cash_rate` (the engine reads that input for every cash-like run). */
export function withPublishedRate(p05: ParameterRecord, rate: ValueObject): ParameterRecord {
  const inputs = (p05 as unknown as { inputs: Record<string, unknown> }).inputs;
  return { ...p05, inputs: { ...inputs, cash_rate: rate } } as unknown as ParameterRecord;
}

export function familyOf(id: WrapperId): "provident" | "deposit" | "securities" | "makam" | "bond" | null {
  const map: Partial<Record<WrapperId, "provident" | "deposit" | "securities" | "makam" | "bond">> = {
    "kupat-gemel-lehashkaa": "provident",
    "keren-hishtalmut": "provident",
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
  return map[id] ?? null;
}

export type InstrumentFamily = "deposit" | "securities" | "makam" | "bond";

/**
 * The bundle of one non-provident wrapper's run on P-05, or why there is none. The probe run is the page's first one (no entered
 * values); the rules the run may read are kept, so the browser can run it again for any entered value.
 */
export function buildInstrumentBundle(
  record: WrapperRecord,
  family: InstrumentFamily,
  p05: ParameterRecord,
  allRules: Record<string, RuleRecord>,
  t: string,
): { bundle: Bundle | null; noGraph: NoGraph | null; published: PublishedDeposit | null } {
  const spec = p05.instruments?.[record.id];
  const deposits = loadDepositTerms();
  const built = buildInstrumentTerms(record.id, family, spec, { fees: loadFees(), funds: loadFunds(), deposits, rules: allRules, today: t });
  if ("missing" in built) {
    for (const m of built.missing) console.log(`[guide] ${record.id}: no timeline: ${m}`);
    return { bundle: null, noGraph: { kind: "missing", parts: missingParts(built.missing) }, published: null };
  }
  const published = family === "deposit" ? publishedDeposit(record.id, spec, deposits) : null;
  const runP05 = published ? withPublishedRate(p05, published.rate) : p05;
  const terms = published?.ceiling && built.terms.deposit ? { ...built.terms, deposit: { ...built.terms.deposit, balanceCeiling: published.ceiling.value as number } } : built.terms;
  const feeValues = { ...built.feeValues, ...(published?.ceiling ? { balanceCeiling: published.ceiling } : {}) };
  const draft: Bundle = { record, p05: runP05, terms, feeValues, rules: Object.values(allRules), runDate: t };
  const probe = runTimeline(draft, { entered: {}, age: null });
  if (probe.kind === "failed") {
    console.log(`[guide] ${record.id}: no timeline: the run stops (${probe.message})`);
    return { bundle: null, noGraph: { kind: "stops", code: /G-\d+|OQ\d+/.exec(probe.message)?.[0] ?? null }, published };
  }
  const touched = rulesTouched(draft);
  return { bundle: { ...draft, rules: Object.values(allRules).filter((r) => touched.has(r.id)) }, noGraph: null, published };
}
