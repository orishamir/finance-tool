// The securities account in the comparison, over the indices (2026-10-25, D27 and D28, spec research/specs/2026-10-25-invest-page/spec.md section 5).
// D27: the site never recommends an index, so the account names none until the person chooses one. Before a choice the card shows the
// range of what the plan leaves over the known indices, each through its cheapest way (`rangeOverKnownIndices`), and the ranking places the
// account by the lowest of them (the conservative reading, D10; provisional, the founder has been told). After a choice the account runs on
// that index's cheapest way (`cheapestWay`): the broker's tariff and the fund's own costs. Pure functions; the fund costs come from the
// compare bundle (`indexFunds`), the ways from the invest page's computation (`invest.ts`), so the two pages agree for the same plan.
import { buildTariff as engineTariff, type WorkbenchInput } from "@finance-tool/engine";
import type { FeesSnapshot } from "@finance-tool/schema";
import { representativeFeeValue, type CompareBundle, type RunGoal, type WrapperEntry } from "./compare";
import { feeInputs } from "./fees";
import { fxRunInput } from "./fx";
import { cheapestWay, indexById, knownIndices, rangeOverKnownIndices, scoped, type CheapestWay, type IndexRef } from "./invest";
import { BROKERAGE as BROKERAGE_ID, instrumentClassOf, type WorkbenchBundle, type WorkbenchInputs } from "./providers";
import { ownBy } from "./value";

/** The run the invest page makes for the same goal: the same plan, so the account's way here is the way there (`routes/invest.tsx`). */
export function planOfGoal(bundle: CompareBundle, g: RunGoal, state: Parameters<typeof feeInputs>[2]): WorkbenchInputs {
  const fi = feeInputs(bundle, g, state);
  return {
    amountNow: Math.max(0, fi.g.amountNow - fi.g.available),
    monthly: fi.g.monthly,
    years: fi.g.horizonYears,
    grossReturn: (fi.g.returnPct ?? 0) / 100,
    inflation: (fi.values.inflation.value as number) / 100,
    age: fi.g.age,
    income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
    values: fi.values,
    fromGoal: fi.fromGoal,
    returnFromParameter: fi.returnFromParameter,
  };
}

/** What the account stands for in this comparison. */
export type IndexReading =
  /** No index chosen (D27): the lowest and the highest of the plan over the known indices; the ranking uses `low`. */
  | { kind: "range"; low: CheapestWay; high: CheapestWay; perIndex: CheapestWay[] }
  /** The person chose an index: its cheapest way, or null when no way could be priced for the plan. */
  | { kind: "chosen"; index: IndexRef; way: CheapestWay | null };

/** Reads the account over the indices; null when the invest data cannot be read or no way is priced (the account then keeps P-05's fund and says no index). */
export function readIndex(wb: WorkbenchBundle, plan: WorkbenchInputs, chosenId: string | undefined): IndexReading | null {
  const chosen = chosenId ? indexById(wb, chosenId) : null;
  if (chosen) return { kind: "chosen", index: chosen, way: cheapestWay(wb, chosen, plan) };
  if (knownIndices(wb).length === 0) return null;
  const range = rangeOverKnownIndices(wb, plan);
  return range ? { kind: "range", low: range.low, high: range.high, perIndex: range.perIndex } : null;
}

const FX_BAND: Record<string, string> = { "interactive-brokers": "המרה אוטומטית" };
const TARIFF_KEYS = ["tradeRate", "tradeMin", "tradeMax", "custodyRate", "custodyMin", "custodyMax", "fxRate", "monthlyFee"] as const;
const isFundKey = (k: string) => k.startsWith("fund") || k === "ninetyPercentTest";

/**
 * The bundle with the brokerage account running on one way: that fund (its kind and costs, from the bundle's `indexFunds`) and that
 * broker's tariff read for the fund's own instrument class (F-63, "No line, no price"). The way's value on the invest page and this run
 * are the same run, so they agree (checked in `compare-index.test.ts`). `via` says whether the way is the person's index or the lowest
 * over the known indices. Returns null when the way cannot be run here (a fund in another currency, a tariff with no trade line): the
 * bundle then stays as it is.
 */
export function applyIndexWay(bundle: CompareBundle, wb: WorkbenchBundle, way: CheapestWay, via: "range" | "chosen"): CompareBundle | null {
  const w = bundle.wrappers.find((x) => x.id === BROKERAGE_ID);
  const ft = bundle.indexFunds?.[way.fundRecordId];
  const rec = wb.funds.find((f) => f.id === way.fundRecordId);
  const snap = wb.snapshots.find((s) => s.id === way.providerId);
  if (!w?.terms || !ft || !rec || !snap) return null;
  const cls = instrumentClassOf(rec, wb.exposures.find((e) => e.id === rec.exposure_id));
  const scopedSnap = scoped(snap);
  let built: ReturnType<typeof engineTariff>;
  try {
    built = engineTariff({ instrumentClass: cls, wrapper: BROKERAGE_ID, channel: "direct", ...(wb.fx ? { fx: fxRunInput(wb.fx) } : {}) } as WorkbenchInput, { snapshot: scopedSnap, level: "list", ...(FX_BAND[snap.id] ? { band: [FX_BAND[snap.id]!] } : {}) }, scopedSnap);
  } catch {
    return null;
  }
  if (built.noLine.includes("trade") || !built.tariff.buy) return null;
  const feeValues: WrapperEntry["feeValues"] = Object.fromEntries(Object.entries(w.feeValues).filter(([k]) => !isFundKey(k) && !(TARIFF_KEYS as readonly string[]).includes(k)));
  Object.assign(feeValues, ft.feeValues);
  const lines: FeesSnapshot["lines"] = scopedSnap.lines;
  for (const id of built.linesUsed) {
    const l = lines.find((x) => x.id === id);
    if (!l) continue;
    const bound = (v: typeof l.min) => (v && typeof v.value === "number" ? { ...v } : undefined);
    const lo = bound(l.min), hi = bound(l.max);
    if (l.base === "trade") {
      feeValues.tradeRate = { ...l.rate };
      if (lo) feeValues.tradeMin = lo;
      if (hi) feeValues.tradeMax = hi;
    } else if (l.base === "custody") {
      feeValues.custodyRate = { ...l.rate };
      if (lo) feeValues.custodyMin = lo;
      if (hi) feeValues.custodyMax = hi;
    } else if (l.base === "fixed_period" && built.tariff.monthlyFee !== undefined) {
      feeValues.monthlyFee = l.rate.unit === "nis_per_month" ? { ...l.rate } : { ...l.rate, value: built.tariff.monthlyFee, unit: "nis_per_month", state: "computed" };
    }
  }
  // D31: the card names this provider and fund, so the tariff lines are the provider's own figures
  for (const k of TARIFF_KEYS) if (feeValues[k]) feeValues[k] = ownBy(feeValues[k]!, snap.provider.name_he);
  const terms = { ...w.terms, fund: ft.fund, tariff: built.tariff as NonNullable<typeof w.terms.tariff> };
  const next: WrapperEntry = { ...w, terms, feeValues };
  const fee = representativeFeeValue(next, bundle.runDate);
  const { classMinFee: _drop, chosen: _chosen, compared: _compared, ...rep } = w.representative ?? { name: w.name };
  next.representative = { ...rep, name: way.fundName, provider: way.providerName, providerId: way.providerId, channel: "direct", pickedBy: "site", viaIndex: via, ...(fee ? { fee } : {}) };
  return { ...bundle, wrappers: bundle.wrappers.map((x) => (x.id === w.id ? next : x)) };
}

/** The reading of the account for a goal, and the bundle with its way applied (the lowest over the indices before a choice, the index's own after). */
export function applyIndex(bundle: CompareBundle, wb: WorkbenchBundle, plan: WorkbenchInputs, g: RunGoal): { bundle: CompareBundle; reading: IndexReading | null; ranked: CheapestWay | null } {
  if (g.returnPct === null) return { bundle, reading: null, ranked: null };
  const reading = readIndex(wb, plan, g.ownIndices?.[BROKERAGE_ID]);
  if (!reading) return { bundle, reading: null, ranked: null };
  // the ways to try, in the order the ranking reads them: the chosen index's own; else the lowest over the indices, then the next lowest the comparison can run
  const tries: { way: CheapestWay; via: "range" | "chosen" }[] = reading.kind === "chosen" ? (reading.way ? [{ way: reading.way, via: "chosen" }] : []) : reading.perIndex.map((way) => ({ way, via: "range" as const }));
  for (const t of tries) {
    const b = applyIndexWay(bundle, wb, t.way, t.via);
    if (b) return { bundle: b, reading, ranked: t.way };
  }
  return { bundle, reading, ranked: null };
}
