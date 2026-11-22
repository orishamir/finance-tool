// The list fees the provident managers publish, as the guide pages price them (guide.server.ts): each manager's latest list, a list line
// as the run takes it (a discount, an offer), the manager the example runs on when several lists cover a wrapper, and the wrapper's fee
// terms. Server-only.
import type { FeesSnapshot, ParameterRecord, RuleRecord, ValueObject } from "@finance-tool/schema";
import type { InstrumentTerms } from "@finance-tool/engine";
import { loadCmaFees } from "./data.server";
import { regulatorAverageFees } from "./instruments.server";
import { latestOf, latestSnapshots } from "./providers.server";
import { shortName } from "./providers";
import { ownBy, ruleFigure, type SiteValue } from "./value";

type FeeLine = FeesSnapshot["lines"][number];

/** A provident wrapper's collected list fees (F-105): the latest snapshot of each manager whose list prints both a balance and a deposit fee for it. */
export function providentLists(id: string, snapshots: FeesSnapshot[]): { snap: FeesSnapshot; balance: ValueObject; deposit: ValueObject; lines: { balance: FeeLine; deposit: FeeLine } }[] {
  const latest = latestSnapshots(snapshots.filter((s) => s.lines.some((l) => l.applies_to.includes(id) && l.level === "list")));
  const out: { snap: FeesSnapshot; balance: ValueObject; deposit: ValueObject; lines: { balance: FeeLine; deposit: FeeLine } }[] = [];
  for (const snap of latest) {
    const line = (base: string) => snap.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base && typeof l.rate.value === "number");
    const balance = line("balance");
    const deposit = line("deposit");
    if (balance && deposit) out.push({ snap, balance: balance.rate, deposit: deposit.rate, lines: { balance, deposit } });
  }
  return out.sort((a, b) => a.snap.id.localeCompare(b.snap.id));
}

/** PF-13's minimum discount period in months, from the rule record (A-19). */
export function minDiscountMonths(allRules: Record<string, RuleRecord>): number {
  const f = allRules["PF-13"]?.figures?.min_discount_years;
  const years = f && "value" in f ? f.value : undefined;
  if (typeof years !== "number") throw new Error("PF-13 has no min_discount_years figure");
  return 12 * years;
}

/**
 * One list line as the run prices it (A-19, read with D56 and PF-13), rates in percent: the printed `rate` for `months` months, then `after`.
 * A rate below `reverts_to` is a discount that lasts the printed period, no shorter than PF-13's minimum; an offer (`offer_he`, a rate
 * conditional on a document that is not published) is priced at `reverts_to` from the start; a line with no `reverts_to` is one rate.
 */
export function pricedLine(l: FeeLine, minMonths: number): { rate: number; after: number; months: number; discounted: boolean; offer: boolean } {
  const printed = l.rate.value as number;
  const to = typeof l.reverts_to?.value === "number" ? l.reverts_to.value : null;
  const offer = l.offer_he !== undefined && to !== null;
  if (offer) return { rate: to, after: to, months: 0, discounted: false, offer };
  if (to === null || to <= printed) return { rate: printed, after: printed, months: 0, discounted: false, offer };
  const printedMonths = typeof l.discount_months?.value === "number" ? l.discount_months.value : 0;
  return { rate: printed, after: to, months: Math.max(printedMonths, minMonths), discounted: true, offer };
}

/**
 * The manager a provident wrapper's example runs on when more than one list is collected (F-80): the one P-05 names, else the
 * one whose fees, as `pricedLine` prices them, are the lowest on both bases in every month, which leaves any plan the most (direct expenses
 * are left out: no collected list prints a rate for them). Managers whose
 * prices are the same in every month tie: the example runs on the first by id and `tied` names them all. When no list is the lowest on
 * both, none is chosen: which leaves more then depends on the plan, and the page says it has no run rather than pick one manager as the
 * general case.
 */
export function providentPick(
  id: string,
  snapshots: FeesSnapshot[],
  spec: { tariff?: string } | undefined,
  allRules: Record<string, RuleRecord>,
): { id: string; count: number; tied?: string[] } | null {
  const lists = providentLists(id, snapshots);
  if (lists.length === 0) return null;
  const named = spec?.tariff ? lists.find((l) => l.snap.id === spec.tariff) : undefined;
  if (named) return { id: named.snap.id, count: lists.length };
  const min = minDiscountMonths(allRules);
  const priced = lists.map((l) => ({ id: l.snap.id, b: pricedLine(l.lines.balance, min), d: pricedLine(l.lines.deposit, min) }));
  const at = (p: ReturnType<typeof pricedLine>, m: number) => (m <= p.months ? p.rate : p.after);
  // the prices are steps: comparing at month 1 and the month after each discount ends compares them in every month
  const months = [...new Set([1, ...priced.flatMap((p) => [p.b.months + 1, p.d.months + 1])])];
  const noHigher = (a: (typeof priced)[number], b: (typeof priced)[number]) => months.every((m) => at(a.b, m) <= at(b.b, m) && at(a.d, m) <= at(b.d, m));
  const best = priced.filter((a) => priced.every((b) => noHigher(a, b)));
  if (best.length === 0) return null;
  return { id: best[0]!.id, count: lists.length, ...(best.length > 1 ? { tied: best.map((b) => b.id) } : {}) };
}

/**
 * The provident-family fees the guide page builds (guide.server.ts): the provider's list fee lines when they cover the wrapper (when several
 * managers' lists do, the one `providentPick` chooses, named in `pick`); for a fee the list does not give (a study fund, a general pension
 * fund, a provident fund for annuity: no company publishes a list price) the regulator's average actually charged on the `track` P-05's entry
 * names (method 2.4), labelled as an average. The pension and study-fund terms that come from the person (employment, salary, insurance) are
 * added by the page that runs them (guide.server.ts, guide-signature-g2.ts). A list rate below the most the bylaws allow runs as a discount that reverts to that most after
 * PF-13's period (A-19, F-16); the terms block shows both rates and the period.
 */
export function providentTerms(
  id: string,
  snapshots: FeesSnapshot[],
  spec: NonNullable<ParameterRecord["instruments"]>[string] | undefined,
  allRules: Record<string, RuleRecord>,
  today: string,
): { terms?: InstrumentTerms; feeValues: Record<string, SiteValue>; missing: string[]; pick?: { id: string; count: number; tied?: string[] } } {
  const covering = [...new Set(snapshots.filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list")).map((f) => f.id))];
  const pick = covering.length > 1 ? providentPick(id, snapshots, spec as { tariff?: string } | undefined, allRules) : null;
  if (covering.length > 1 && !pick) return { feeValues: {}, missing: [`${id}: ${covering.length} managers' list fees cover it and none is the lowest on both bases; F-80 picks none`] };
  const who = pick?.id ?? covering[0];
  const snap = who ? latestOf(who, snapshots.filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list"))) : undefined;
  const line = (base: string) => snap?.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base);
  const balance = line("balance");
  const deposit = line("deposit");
  const direct = line("direct_expenses");
  const pct = (v: ValueObject) => (v.value as number) / 100;
  // D31: a list fee is that company's own; the guide's terms block names the company whose list the example reads
  const own = (v: ValueObject): SiteValue => (snap ? ownBy({ ...v } as SiteValue, shortName(snap.id, snap.provider.name_he)) : ({ ...v } as SiteValue));
  if (balance && deposit) {
    const min = minDiscountMonths(allRules);
    const pb = pricedLine(balance, min);
    const pd = pricedLine(deposit, min);
    // an offer runs at the rate its binding documents allow (D56); a discount at its printed rate, then the most the bylaws allow
    const shown = (l: FeeLine) => own(l.offer_he !== undefined && l.reverts_to ? l.reverts_to : l.rate);
    const feeValues: Record<string, SiteValue> = { balance: shown(balance), deposit: shown(deposit) };
    feeValues[pb.discounted ? "discountBalance" : "listBalance"] = feeValues.balance!;
    feeValues[pd.discounted ? "discountDeposit" : "listDeposit"] = feeValues.deposit!;
    if (pb.discounted) feeValues.afterBalance = own(balance.reverts_to!);
    if (pd.discounted) feeValues.afterDeposit = own(deposit.reverts_to!);
    // the period the terms block shows: a printed one longer than PF-13's minimum is the company's own; otherwise the minimum, from the rule
    // one period for both lines: the data check fails a balance and a deposit discount of one wrapper that print different periods (validate.ts, checkDiscountLines)
    const longer = ([[pb, balance], [pd, deposit]] as const).find(([p, l]) => p.discounted && p.months > min && l.discount_months);
    if (longer) feeValues.discountMonths = own(longer[1].discount_months!);
    else if (pb.discounted || pd.discounted) {
      const years = ruleFigure(allRules["PF-13"]!, "min_discount_years", today);
      if (years) feeValues.discountYears = years;
    }
    if (direct) feeValues.direct = own(direct.rate);
    // an unprinted period is PF-13's minimum (A-19), not a shorter one extended, so the run gets the period itself
    const discountOf = (p: ReturnType<typeof pricedLine>, l: FeeLine) => (p.discounted ? { months: typeof l.discount_months?.value === "number" ? l.discount_months.value : p.months, listRate: p.after / 100 } : undefined);
    const discount = discountOf(pb, balance);
    const depositDiscount = discountOf(pd, deposit);
    return {
      terms: { fees: { deposit: pd.rate / 100, balance: pb.rate / 100, direct: direct ? pct(direct.rate) : 0, ...(discount ? { discount } : {}), ...(depositDiscount ? { depositDiscount } : {}) } },
      feeValues,
      missing: [],
      ...(pick ? { pick } : {}),
    };
  }
  const reg = regulatorAverageFees(id, spec, loadCmaFees(), allRules, today, { balance: !!balance, deposit: !!deposit });
  if (!reg) return { feeValues: {}, missing: [snap ? `${id}: ${snap.id} has no list ${balance ? "deposit" : "balance"} line for it and P-05 names no track` : `${id}: no list-fee snapshot in data/fees/ covers it and P-05 names no track`] };
  if ("missing" in reg) return { feeValues: {}, missing: reg.missing };
  const feeValues: Record<string, SiteValue> = { ...reg.feeValues };
  if (balance) feeValues.balance = own(balance.rate);
  if (deposit) feeValues.deposit = own(deposit.rate);
  if (direct) feeValues.direct = own(direct.rate);
  return {
    terms: { fees: { balance: balance ? pct(balance.rate) : reg.fees.balance, deposit: deposit ? pct(deposit.rate) : reg.fees.deposit, direct: direct ? pct(direct.rate) : 0 } },
    feeValues,
    missing: [],
  };
}
