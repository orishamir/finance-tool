// The idle-cash screen's run (flow 11, method F-60, S41): the engine's `idleCash` over the bundle's candidate set.
// The deposit row rests on the bank's own published rate (A-21 note, D20), the current account's published rate is
// the baseline (A-25), the money-market fund and makam rows on P-05's cash rate as a site parameter. The person's
// own offer is a one-month deposit (A-26), so it runs on a one-month term, a second call of the same function.
import { idleCash, type CandidateInput, type IdleCash, type IdleKind, type RunContext } from "@finance-tool/engine";
import { asParameter, cashRateOf, openConstraintOf, parameterOf, type CompareBundle } from "./compare";
import { computed, entered as enteredValue, ownBy, type SiteValue } from "./value";
import type { ValueObject } from "@finance-tool/schema";
import type { Reason } from "@finance-tool/engine";

export type IdleRowId = "bank-deposit:average" | "bank-deposit:own-offer" | "money-market-fund-daily" | "makam";
export type IdleLabel = "published" | "entered" | "parameter";

export interface IdleRowView {
  id: IdleRowId;
  label: IdleLabel;
  /** The rate the row rests on, as the source holds it. */
  rate: SiteValue;
  cost: SiteValue;
  monthlyCost: number;
  notes: string[];
}

export interface IdleFailedRow {
  id: string;
  reasons: Reason[];
}

export interface IdleCoverageRow {
  id: string;
  name: string;
  tier: 1 | 2;
  kind: IdleKind;
  reasons: Reason[];
  href?: string;
}

/**
 * The one-year verdict on a bank's offer (F-60, 2026-10-24): the offer and the daily money-market fund, each as a one-year
 * run after tax, the gap between them and P-03's negotiate threshold read over that year.
 */
export interface IdleVerdict {
  /** The offer's term in months, as the person gave it. */
  termMonths: number;
  offerRate: SiteValue;
  offerAfterTax: SiteValue;
  fundRate: SiteValue;
  fundAfterTax: SiteValue;
  /** The size of the difference between the two, after tax, a year; `better` says whose side it is. */
  gap: SiteValue;
  better: "offer" | "fund" | "even";
  threshold: SiteValue;
  /** The gap's size reaches the threshold: worth checking. */
  worth: boolean;
}

/** The judgement on a yearly figure against P-03's negotiate threshold (audit scenarios 7 and 8). */
export interface IdleMateriality {
  amount: SiteValue;
  threshold: SiteValue;
  worth: boolean;
}

export interface IdleView {
  kind: "ok";
  amount: SiteValue;
  rows: IdleRowView[];
  /** Cash options the run could not do (a rule open, a missing input), with the reason. */
  failed: IdleFailedRow[];
  baseline: { rate: SiteValue } | null;
  headline: SiteValue | null;
  /** The headline's monthly cost over twelve months (audit A20): the same figure, per year. */
  yearly: SiteValue | null;
  /** Set when the offer and its term are both given. */
  verdict: IdleVerdict | null;
  /** The yearly figure the page judges against P-03: the verdict's gap, else the headline's yearly cost. */
  materiality: IdleMateriality | null;
  /** The whole sum's yearly cost of staying in the current account is under P-03's negotiate threshold: a small sum (audit scenario 8). */
  smallSum: boolean;
  coverage: IdleCash["coverage"];
  coverageRows: IdleCoverageRow[];
  names: Record<string, string>;
}

/** P-03's negotiate threshold (a year of cost, in shekels) as a site parameter, from the parameter record the loader hands the page. */
export function negotiateThreshold(p03: unknown): SiteValue | null {
  const p = p03 as { negotiate_nis?: ValueObject } | null | undefined;
  return p?.negotiate_nis ? asParameter(p03 as never, p.negotiate_nis) : null;
}

export type IdleOutcome = IdleView | { kind: "all-kept" } | { kind: "need-more" } | { kind: "no-baseline" } | { kind: "error"; message: string };

const rowOrder: IdleRowId[] = ["bank-deposit:average", "bank-deposit:own-offer", "money-market-fund-daily", "makam"];
const cashOptions = new Set(["bank-deposit", "money-market-fund-daily", "makam"]);

function inputs(bundle: CompareBundle, depositMonths: number | false): CandidateInput[] {
  const param = cashRateOf(bundle);
  return bundle.wrappers.map((w): CandidateInput => {
    let terms = w.terms;
    if (depositMonths !== false && w.id === "bank-deposit" && terms?.deposit) terms = { ...terms, deposit: { ...terms.deposit, termMonths: depositMonths } };
    // review fix 2026-10-24: F-60 does not read the `minimum` dimension; an option whose minimum or eligibility rule is open (makam, GOV OQ7) gets no rate, so it has no row, and `buildIdle` gives it the open-constraint reason
    const rate = openConstraintOf(w.record) ? undefined : w.cashRate ?? (w.id === "makam" || w.id === "money-market-fund-daily" ? param : undefined);
    return { record: w.record, ...(terms ? { terms } : {}), ...(rate ? { cashRate: rate as ValueObject } : {}) };
  });
}

/** The longest term the page takes for "other" (months): a deposit run over one year reads a longer term as matured at the year's end. */
export const maxTermMonths = 60;

export function buildIdle(bundle: CompareBundle, balance: number | null, keep: number | null, offerPct: number | null, termMonths: number | null = null, threshold: SiteValue | null = null): IdleOutcome {
  if (balance === null || keep === null) return { kind: "need-more" };
  if (!(balance > 0) || keep < 0 || keep > balance) return { kind: "need-more" };
  if (keep === balance) return { kind: "all-kept" };
  const today = bundle.runDate;
  const ctx: RunContext = { rules: bundle.rules, runDate: bundle.runDate };
  const byId = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const current = byId.get("current-account");
  if (!current?.cashRate) return { kind: "no-baseline" };
  const p05 = parameterOf(bundle, "P-05") as unknown as { inputs: Record<string, ValueObject> };
  const inflationPct = p05.inputs["A-02"]!.value as number;
  const bankRate = byId.get("bank-deposit")?.cashRate;
  const base = { balance, mustStayAvailable: keep, inflationPct, parameters: bundle.parameters, tier2: bundle.tier2 };
  try {
    const main = idleCash({ ...base, wrappers: inputs(bundle, false), ...(bankRate ? { bankAverage: bankRate as ValueObject } : {}) }, ctx);
    for (const c of main.candidates) {
      const open = c.tier === 1 && c.kind === "not-evaluated" ? openConstraintOf(byId.get(c.id)?.record ?? { dimensions: {} }) : null;
      if (open) c.reasons = [open];
    }
    const rowsById = new Map<string, IdleCash["rows"][number]>(main.rows.map((r) => [r.id, r]));
    let offerOnTerm: IdleCash["rows"][number] | null = null;
    if (offerPct !== null) {
      const offer = idleCash({ ...base, wrappers: inputs(bundle, 1), ...(bankRate ? { bankAverage: bankRate as ValueObject } : {}), ownOffer: enteredValue(offerPct, "pct_per_year", today) as ValueObject }, ctx);
      const r = offer.rows.find((x) => x.id === "bank-deposit:own-offer");
      if (r) rowsById.set(r.id, r);
      // the offer on its own term, for the one-year verdict: a second run of the same function, the deposit rolled over at the same rate
      if (r && termMonths !== null && termMonths >= 1 && termMonths <= maxTermMonths) {
        offerOnTerm = termMonths === 1 ? r : idleCash({ ...base, wrappers: inputs(bundle, termMonths), ...(bankRate ? { bankAverage: bankRate as ValueObject } : {}), ownOffer: enteredValue(offerPct, "pct_per_year", today) as ValueObject }, ctx).rows.find((x) => x.id === "bank-deposit:own-offer") ?? null;
      }
    }
    const amount: SiteValue = computed(main.amount, "nis", "F-60", { balance: enteredValue(balance, "nis", today), keep: enteredValue(keep, "nis", today) }, { today, about: "הסכום שנבדק: היתרה פחות מה שחייב להישאר זמין" });
    const rows: IdleRowView[] = [];
    for (const id of rowOrder) {
      const r = rowsById.get(id);
      if (!r) continue;
      const label: IdleLabel = id === "bank-deposit:average" ? "published" : id === "bank-deposit:own-offer" ? "entered" : "parameter";
      // D31: the bank's published rate on the bank's own row; the row names the bank (the engine's copy of the value may drop the mark)
      const owner = id === "bank-deposit:average" ? (bankRate as SiteValue | undefined)?.own : undefined;
      const rate = owner ? ownBy(r.rate as SiteValue, owner) : (r.rate as SiteValue);
      const baseline = current.cashRate!.own ? ownBy(main.baseline.rate as SiteValue, current.cashRate!.own) : (main.baseline.rate as SiteValue);
      const cost = computed(r.monthlyCost, "nis", "F-60", { amount: enteredValue(main.amount, "nis", today), rate, baseline }, { today, about: id, rules: r.run.rules.map((u) => ({ id: u.id, strength: u.strength as SiteValue["source"]["strength"] })), flags: r.run.flags.map((f) => f.code) });
      rows.push({ id, label, rate, cost, monthlyCost: r.monthlyCost, notes: r.notes });
    }
    const failed: IdleFailedRow[] = main.candidates.filter((c) => c.tier === 1 && cashOptions.has(c.id) && c.kind === "not-evaluated").map((c) => ({ id: c.id, reasons: c.reasons }));
    const top = rows.length > 0 ? rows.reduce((a, b) => (b.monthlyCost > a.monthlyCost ? b : a)) : null;
    const headline = top && top.monthlyCost > 0 ? top.cost : null;
    const yearly = headline ? computed(top!.monthlyCost * 12, "nis", "F-60", { "העלות החודשית": headline }, { today, about: "בקירוב: העלות החודשית כפול שנים עשר, בלי ריבית על ריבית ובלי תמחור מחדש של הפיקדון לחודש אחד" }) : null;
    const fundRow = rowsById.get("money-market-fund-daily");
    let verdict: IdleVerdict | null = null;
    if (offerOnTerm && fundRow && termMonths !== null && threshold) {
      const after = (row: IdleCash["rows"][number], label: string) =>
        computed(row.run.nominal - main.amount, "nis", "F-60", { הסכום: amount, הריבית: row.rate as SiteValue }, { today, about: label, rules: row.run.rules.map((u) => ({ id: u.id, strength: u.strength as SiteValue["source"]["strength"] })), flags: row.run.flags.map((f) => f.code) });
      const offerAfterTax = after(offerOnTerm, "הרווח אחרי מס בשנה אחת מההצעה שהזנתם");
      const fundAfterTax = after(fundRow, "הרווח אחרי מס בשנה אחת מהקרן הכספית");
      const diff = (offerOnTerm.run.nominal - main.amount) - (fundRow.run.nominal - main.amount);
      const gap = computed(Math.abs(diff), "nis", "F-60", { "אחרי מס, ההצעה": offerAfterTax, "אחרי מס, הקרן": fundAfterTax }, { today, about: "ההפרש בשנה, אחרי מס, בין ההצעה לקרן הכספית (בערך מוחלט; בצד של מי הכסף נאמר בשורה)" });
      const even = Math.abs(diff) < 0.5;
      verdict = { termMonths, offerRate: offerOnTerm.rate as SiteValue, offerAfterTax, fundRate: fundRow.rate as SiteValue, fundAfterTax, gap, better: even ? "even" : diff > 0 ? "offer" : "fund", threshold, worth: Math.abs(diff) >= (threshold.value as number) };
    }
    const materiality: IdleMateriality | null = !threshold ? null : verdict ? { amount: verdict.gap, threshold, worth: verdict.worth } : yearly ? { amount: yearly, threshold, worth: (yearly.value as number) >= (threshold.value as number) } : null;
    const smallSum = !!threshold && !!yearly && (yearly.value as number) < (threshold.value as number);
    const names: Record<string, string> = {};
    for (const w of bundle.wrappers) names[w.id] = w.name;
    for (const t of bundle.tier2) names[t.id] = t.name;
    const coverageRows: IdleCoverageRow[] = main.candidates.map((c) => ({ id: c.id, name: names[c.id] ?? c.name ?? c.id, tier: c.tier, kind: c.kind, reasons: c.reasons, ...(c.tier === 1 ? { href: `/guide/${c.id}` } : {}) }));
    return { kind: "ok", amount, rows, failed, baseline: { rate: current.cashRate.own ? ownBy(main.baseline.rate as SiteValue, current.cashRate.own) : (main.baseline.rate as SiteValue) }, headline, yearly, verdict, materiality, smallSum, coverage: main.coverage, coverageRows, names };
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
