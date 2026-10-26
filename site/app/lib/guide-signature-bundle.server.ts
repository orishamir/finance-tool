// The engine bundle of a cash-like or securities-family guide page, shared by the page's own timeline (guide.server.ts) and by
// the signature visuals (guide-signature.server.ts), which run other wrappers' bundles beside their own. Server-only.
//
// 2026-10-25 (guide-page sweep, finding 2 and 3): a deposit-family wrapper runs on the published rate of the deposit-terms record
// P-05 names (A-21, A-25), not on P-05's `cash_rate`; the current account also carries its balance ceiling (F-26, BANK-09).
//
// 2026-10-25 (current-account page, G3): the current account's illustrative run starts from the rate most of the collected banks
// publish (F-85), not from one bank's rate; `commonAccountRate` makes that value and the page's counts from the bank records.
//
// 2026-10-26 (founder: a general page names no single bank's rate): the one-year deposit on the money-market ladder is the range
// across the collected banks (F-86); `oneYearDepositRecords` and `depositRange` make it, and the bank-deposit page lists each bank.
import { mostCommonRate, rateRange } from "@finance-tool/engine";
import type { Bundle } from "./engine";
import { p05Range, runTimeline } from "./engine";
import type { DepositTerms, ParameterRecord, RuleRecord, ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import type { AccountBank } from "./guide-signature";
import { buildInstrumentTerms, loadDepositTerms, loadFunds } from "./instruments.server";
import { loadFees } from "./data.server";
import { shortName } from "./providers";
import { computed, ownBy, type SiteValue, type Strength } from "./value";
import { publisherHe } from "./publisher-he.server";

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

/** One current-account record per bank: the latest by snapshot. */
export function currentAccountRecords(deposits: DepositTerms[]): DepositTerms[] {
  const latest = new Map<string, DepositTerms>();
  for (const d of deposits) {
    if (d.wrapper_id !== "current-account") continue;
    const prev = latest.get(d.bank);
    if (!prev || d.snapshot > prev.snapshot) latest.set(d.bank, d);
  }
  return [...latest.values()].sort((a, b) => (a.bank < b.bank ? -1 : 1));
}

/** One record per bank of a one-year deposit at a fixed rate with no linkage (F-86): the latest by snapshot. */
export function oneYearDepositRecords(deposits: DepositTerms[]): DepositTerms[] {
  const latest = new Map<string, DepositTerms>();
  for (const d of deposits) {
    if (d.wrapper_id !== "bank-deposit" || d.rate_type !== "fixed" || d.linkage !== "none" || d.term_months.value !== 12) continue;
    const prev = latest.get(d.bank);
    if (!prev || d.snapshot > prev.snapshot) latest.set(d.bank, d);
  }
  return [...latest.values()].sort((a, b) => (a.bank < b.bank ? -1 : 1));
}

/** The records as the page reads them: the printed rate and ceiling as sourced figures, with the record's own Hebrew text. A record whose rate is not a number is left out. */
export function accountBanks(records: DepositTerms[]): AccountBank[] {
  const banks: AccountBank[] = [];
  for (const r of records) {
    if (typeof r.rate_offered.value !== "number" || r.rate_offered.unit !== "pct_per_year") continue;
    const max = r.amount_range.max;
    // a doubt travels with the number: its sheet says it (the record's English notes stay in the data)
    // D31: each rate and ceiling is the bank's own, shown on the line that names the bank
    const name = shortName(r.bank, r.bank);
    const rate = ownBy({ ...r.rate_offered, ...(r.doubt_he ? { notes: r.doubt_he } : {}) } as SiteValue, name);
    banks.push({
      id: r.id,
      bank: r.bank,
      name,
      rate,
      ceiling: max && max.unit === "nis" && typeof max.value === "number" ? ownBy({ ...max } as SiteValue, name) : null,
      conditions: r.conditions_he ?? null,
      doubt: r.doubt_he ?? null,
      until: r.rate_offered.effective_to,
      // the record's notes quote the sentence a bank prints when it offers no interest ("לא מוצעת ריבית על יתרת זכות")
      noOffer: /לא מוצעת ריבית/.test(r.rate_offered.notes ?? ""),
    });
  }
  return banks;
}

/** The rate most banks pay (F-85) as a computed value over the banks' printed rates, with the counts the page says beside it. */
export interface CommonAccountRate {
  rate: SiteValue;
  /** Banks that print exactly that rate, banks collected, banks that print a rate above 0. */
  count: SiteValue;
  of: SiteValue;
  paying: SiteValue;
  /** The balance that earns that rate when it is above 0 and every bank that prints it prints a ceiling: the largest of them. Null otherwise (a rate of 0 pays on no balance). */
  ceiling: SiteValue | null;
}

export function commonAccountRate(banks: AccountBank[], rules: Record<string, RuleRecord>, today: string): CommonAccountRate | null {
  const result = mostCommonRate(banks.map((b) => Number(b.rate.value)));
  if (!result) return null;
  const inputs = Object.fromEntries(banks.map((b) => [b.name, b.rate]));
  const bank09 = rules["BANK-09"];
  const ruleRefs = bank09 ? [{ id: "BANK-09", strength: bank09.strength as Strength }] : [];
  const make = (value: number, unit: SiteValue["unit"], about: string) => computed(value, unit, "F-85", inputs, { today, rules: ruleRefs, about });
  const same = banks.filter((b) => Math.abs(Number(b.rate.value) - result.rate) < 1e-9);
  const ceilings = same.map((b) => b.ceiling);
  const ceiling =
    result.rate > 0 && ceilings.every((c) => c !== null)
      ? ceilings.reduce<SiteValue | null>((best, c) => (best === null || (c!.value as number) > (best.value as number) ? c : best), null)
      : null;
  return {
    rate: make(result.rate, "pct_per_year", "הריבית שרוב הבנקים שנאספו מפרסמים על יתרה בעו״ש"),
    count: make(result.count, "count", "כמה בנקים מפרסמים את הריבית הזאת"),
    of: make(result.of, "count", "כמה בנקים נאספו"),
    paying: make(result.paying, "count", "כמה בנקים מפרסמים ריבית מעל 0"),
    ceiling,
  };
}

/** The range of a one-year deposit's rate across the banks (F-86) as computed values over the banks' printed rates. */
export interface DepositRange {
  lo: SiteValue;
  hi: SiteValue;
  count: SiteValue;
}

export function depositRange(banks: AccountBank[], today: string): DepositRange | null {
  const result = rateRange(banks.map((b) => Number(b.rate.value)));
  if (!result) return null;
  const inputs = Object.fromEntries(banks.map((b) => [b.name, b.rate]));
  const make = (value: number, unit: SiteValue["unit"], about: string) => computed(value, unit, "F-86", inputs, { today, about });
  return {
    lo: make(result.lo, "pct_per_year", "הריבית הנמוכה ביותר על פיקדון לשנה בריבית קבועה בבנקים שנאספו"),
    hi: make(result.hi, "pct_per_year", "הריבית הגבוהה ביותר על פיקדון לשנה בריבית קבועה בבנקים שנאספו"),
    count: make(result.count, "count", "כמה בנקים נאספו"),
  };
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
  // the current account starts from the rate most banks pay (F-85, 2026-10-25), not from the one bank P-05 names
  const common = record.id === "current-account" ? commonAccountRate(accountBanks(currentAccountRecords(deposits)), allRules, t) : null;
  // D31: the guide page's terms block names the company each figure belongs to, so the figure is that company's own: the fund's figures
  // its manager's, the tariff's lines its provider's, the deposit's terms its bank's (the source's host would name Maya for a fund report)
  const fundRec = spec?.fund ? loadFunds().find((f) => f.id === spec.fund) : undefined;
  const tariffSnap = spec?.tariff ? loadFees().filter((f) => f.id === spec.tariff).sort((a, b) => b.snapshot.localeCompare(a.snapshot))[0] : undefined;
  const depositRec = spec?.deposit_terms ? deposits.find((d) => d.id === spec.deposit_terms) : undefined;
  const ownerOf = (key: string, v: SiteValue): string =>
    fundRec && (key.startsWith("fund") || key === "ninetyPercentTest") ? shortName("", fundRec.manager) : tariffSnap && !depositRec ? shortName(tariffSnap.id, tariffSnap.provider.name_he) : depositRec ? shortName(depositRec.bank, depositRec.bank) : publisherHe(v);
  const ownOf = (v: SiteValue, key = ""): SiteValue => (v.state === "sourced" ? ownBy(v, ownerOf(key, v)) : v);
  const rate = common ? common.rate : published?.rate ? ownOf(published.rate, "rate") : undefined;
  const ceiling = common ? common.ceiling : published?.ceiling;
  const runP05 = rate ? withPublishedRate(p05, rate) : p05;
  const terms = ceiling && built.terms.deposit ? { ...built.terms, deposit: { ...built.terms.deposit, balanceCeiling: ceiling.value as number } } : built.terms;
  const feeValues = Object.fromEntries(Object.entries({ ...built.feeValues, ...(ceiling ? { balanceCeiling: ceiling } : {}) }).map(([k, v]) => [k, ownOf(v, k)]));
  const draft: Bundle = { record, p05: runP05, terms, feeValues, rules: Object.values(allRules), runDate: t };
  const probe = runTimeline(draft, { entered: {}, age: null });
  if (probe.kind === "failed") {
    console.log(`[guide] ${record.id}: no timeline: the run stops (${probe.message})`);
    return { bundle: null, noGraph: { kind: "stops", code: /G-\d+|OQ\d+/.exec(probe.message)?.[0] ?? null }, published };
  }
  const touched = rulesTouched(draft);
  return { bundle: { ...draft, rules: Object.values(allRules).filter((r) => touched.has(r.id)) }, noGraph: null, published };
}
