// The idle-cash screen's run (flow 11, method F-60, S41): the engine's `idleCash` over the bundle's candidate set.
// The deposit row rests on the bank's own published rate (A-21 note, D20), the current account's published rate is
// the baseline (A-25), the money-market fund and makam rows on P-05's cash rate as a site parameter. The person's
// own offer is a one-month deposit (A-26), so it runs on a one-month term, a second call of the same function.
import { idleCash, type CandidateInput, type IdleCash, type IdleKind, type RunContext } from "@finance-tool/engine";
import { cashRateOf, parameterOf, type CompareBundle } from "./compare";
import { computed, entered as enteredValue, type SiteValue } from "./value";
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
  coverage: IdleCash["coverage"];
  coverageRows: IdleCoverageRow[];
  names: Record<string, string>;
}

export type IdleOutcome = IdleView | { kind: "all-kept" } | { kind: "need-more" } | { kind: "no-baseline" } | { kind: "error"; message: string };

const rowOrder: IdleRowId[] = ["bank-deposit:average", "bank-deposit:own-offer", "money-market-fund-daily", "makam"];
const cashOptions = new Set(["bank-deposit", "money-market-fund-daily", "makam"]);

function inputs(bundle: CompareBundle, oneMonthDeposit: boolean): CandidateInput[] {
  const param = cashRateOf(bundle);
  return bundle.wrappers.map((w): CandidateInput => {
    let terms = w.terms;
    if (oneMonthDeposit && w.id === "bank-deposit" && terms?.deposit) terms = { ...terms, deposit: { ...terms.deposit, termMonths: 1 } };
    const rate = w.cashRate ?? (w.id === "makam" || w.id === "money-market-fund-daily" ? param : undefined);
    return { record: w.record, ...(terms ? { terms } : {}), ...(rate ? { cashRate: rate as ValueObject } : {}) };
  });
}

export function buildIdle(bundle: CompareBundle, balance: number | null, keep: number | null, offerPct: number | null): IdleOutcome {
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
    const rowsById = new Map<string, IdleCash["rows"][number]>(main.rows.map((r) => [r.id, r]));
    if (offerPct !== null) {
      const offer = idleCash({ ...base, wrappers: inputs(bundle, true), ...(bankRate ? { bankAverage: bankRate as ValueObject } : {}), ownOffer: enteredValue(offerPct, "pct_per_year", today) as ValueObject }, ctx);
      const r = offer.rows.find((x) => x.id === "bank-deposit:own-offer");
      if (r) rowsById.set(r.id, r);
    }
    const amount: SiteValue = computed(main.amount, "nis", "F-60", { balance: enteredValue(balance, "nis", today), keep: enteredValue(keep, "nis", today) }, { today, about: "הסכום שנבדק: היתרה פחות מה שחייב להישאר זמין" });
    const rows: IdleRowView[] = [];
    for (const id of rowOrder) {
      const r = rowsById.get(id);
      if (!r) continue;
      const label: IdleLabel = id === "bank-deposit:average" ? "published" : id === "bank-deposit:own-offer" ? "entered" : "parameter";
      const cost = computed(r.monthlyCost, "nis", "F-60", { amount: enteredValue(main.amount, "nis", today), rate: r.rate as SiteValue, baseline: main.baseline.rate as SiteValue }, { today, about: id, rules: r.run.rules.map((u) => ({ id: u.id, strength: u.strength as SiteValue["source"]["strength"] })), flags: r.run.flags.map((f) => f.code) });
      rows.push({ id, label, rate: r.rate as SiteValue, cost, monthlyCost: r.monthlyCost, notes: r.notes });
    }
    const failed: IdleFailedRow[] = main.candidates.filter((c) => c.tier === 1 && cashOptions.has(c.id) && c.kind === "not-evaluated").map((c) => ({ id: c.id, reasons: c.reasons }));
    const top = rows.length > 0 ? rows.reduce((a, b) => (b.monthlyCost > a.monthlyCost ? b : a)) : null;
    const headline = top && top.monthlyCost > 0 ? top.cost : null;
    const yearly = headline ? computed(top!.monthlyCost * 12, "nis", "F-60", { "העלות החודשית": headline }, { today, about: "בקירוב: העלות החודשית כפול שנים עשר, בלי ריבית על ריבית ובלי תמחור מחדש של הפיקדון לחודש אחד" }) : null;
    const names: Record<string, string> = {};
    for (const w of bundle.wrappers) names[w.id] = w.name;
    for (const t of bundle.tier2) names[t.id] = t.name;
    const coverageRows: IdleCoverageRow[] = main.candidates.map((c) => ({ id: c.id, name: names[c.id] ?? c.name ?? c.id, tier: c.tier, kind: c.kind, reasons: c.reasons, ...(c.tier === 1 ? { href: `/guide/${c.id}` } : {}) }));
    return { kind: "ok", amount, rows, failed, baseline: { rate: main.baseline.rate as SiteValue }, headline, yearly, coverage: main.coverage, coverageRows, names };
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
