// The deposits page's data (D92): every bank-deposit record, the latest of each id, as offers the page lists and the grid picks from
// (F-108); P-11's amounts and P-05's amount to start at. Server-only. Each rate and amount is the record's own value object.
import type { DepositTerms, ValueObject } from "@finance-tool/schema";
import { depositLabels, depositName, doubtFor, exitPointsOf, restatesDoubt, shownRate } from "./deposit-kind";
import { labelRules } from "./label-rests";
import { termOf, type DbBank, type DbData, type DbOffer } from "./deposit-browser";
import { loadParameters, loadRules, today } from "./data.server";
import { p05AmountMax, p05Number } from "./engine";
import { site } from "./institutions.server";
import { loadDepositTerms } from "./instruments.server";
import { shortName } from "./providers";
import { mostlyHebrew } from "./source-label";
import { asParameter, type SiteValue } from "./value";

/**
 * A record's figure as the page shows it: the bank's own, with the record's English working note left in the data (the sheet shows only a
 * Hebrew one), and a Hebrew note that says again what the record's doubt says left out too, since the doubt is shown (`restatesDoubt`).
 */
function shown(v: ValueObject, t: string, d: DepositTerms, owner: string): SiteValue {
  const s = site(v, t, d.snapshot, owner);
  return mostlyHebrew(s.notes) && !restatesDoubt(s.notes, d.doubt_he) ? s : { ...s, notes: "" };
}

/** The record's doubt as the value it is about carries it (`doubtFor`): on the rate where `doubt_on` is absent, on the amounts where it names them. */
const doubted = (v: SiteValue, d: DepositTerms, on: "rate" | "amount_range"): SiteValue => ({ ...v, ...doubtFor(d, on) });

/** One record as the page's offer; null for a term the standard table does not have. */
export function offerOf(d: DepositTerms, t: string, known: ReadonlySet<string>): DbOffer | null {
  const term = termOf(d.term_months as { value: unknown; unit: string });
  if (!term) return null;
  const owner = shortName(d.bank, d.bank);
  // a doubt travels with the number it is about: its sheet says it, and the figure carries the caution mark
  const max = d.amount_range.max ? doubted(shown(d.amount_range.max, t, d, owner), d, "amount_range") : null;
  const min = shown(d.amount_range.min, t, d, owner);
  return {
    id: d.id,
    bank: d.bank,
    term,
    name: depositName(d),
    kind: d.rate_type,
    linkage: d.linkage,
    limited: (d.variant ?? []).some((v) => v === "closed_system" || v === "new_customers"),
    labels: depositLabels(d.variant, known, { url: d.rate_offered.source.url, title: d.rate_offered.source.title }),
    rate_offered: doubted(shown(shownRate(d), t, d, owner), d, "rate"),
    anchor: d.anchor ?? null,
    spread: d.spread ? shown(d.spread, t, d, owner) : null,
    amount_range: {
      min: max ? min : doubted(min, d, "amount_range"),
      max,
      ...(d.amount_range.min_edge ? { min_edge: d.amount_range.min_edge } : {}),
      ...(d.amount_range.max_edge ? { max_edge: d.amount_range.max_edge } : {}),
    },
    ...(d.doubt_he && d.doubt_on && d.doubt_on !== "amount_range" ? { doubt: { on: d.doubt_on, text: d.doubt_he } } : {}),
    ...(d.conditions_he ? { conditions: d.conditions_he } : {}),
    breakTerm: d.break.allowed ? d.break.penalty : "not_allowed",
    ...(d.term_days && typeof d.term_days.value === "number" ? { termDays: d.term_days.value } : {}),
    ...(d.interest_calc
      ? {
          calc: {
            ...(d.interest_calc.effective_annual ? { effectiveAnnual: shown(d.interest_calc.effective_annual, t, d, owner) } : {}),
            ...(d.interest_calc.effective_decimals ? { effectiveDecimals: shown(d.interest_calc.effective_decimals, t, d, owner) } : {}),
            ...(d.interest_calc.periods_per_year ? { periodsPerYear: shown(d.interest_calc.periods_per_year, t, d, owner) } : {}),
          },
        }
      : {}),
    ...((d.variant ?? []).includes("interest_during_term") ? { paidOut: true } : {}),
    exits: exitPointsOf(d.exit_points),
  };
}

export function buildDepositBrowser(): DbData {
  const t = today();
  const known = new Set(Object.keys(loadRules()));
  const records = loadDepositTerms().filter((d) => d.wrapper_id === "bank-deposit");
  const offers = records.map((d) => offerOf(d, t, known)).filter((o): o is DbOffer => o !== null);
  const ids = [...new Set(offers.map((o) => o.bank))];
  const banks: DbBank[] = ids
    .map((id) => ({ id, name: shortName(id, id) }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
  const parameters = loadParameters();
  const p11 = parameters.find((p) => p.method_id === "P-11");
  const p05 = parameters.find((p) => p.method_id === "P-05");
  if (!p11 || !p05) throw new Error("data/parameters: the deposits page needs P-11 (its amounts) and P-05 (the amount it starts at)");
  const steps = (p11 as unknown as { steps: ValueObject[] }).steps;
  return { today: t, banks, offers, amounts: steps.map((v) => asParameter(p11, v)), start: p05Number(p05, "amount_now"), amountMax: p05AmountMax(p05) };
}

/** The rules the page's sheets cite: the deposits' kinds and the standard table. */
export function depositBrowserRuleIds(data: DbData): string[] {
  return [...new Set(["BANK-13", "BANK-14", "BANK-21", "BANK-50", ...data.offers.flatMap((o) => o.labels.flatMap(labelRules))])];
}
