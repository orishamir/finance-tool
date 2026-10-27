// The fund-variant page in the browser and at build (flows 30, 33; design-spec 16.2 and 18): every fund the site knows
// for an exposure, through the engine's F-65, and the view the page draws from it. No fee or rule figure is written
// here: fund fees come from `data/funds/`, the tariff from a snapshot, the return and the exchange rate from the person.
// Pure: no storage, no fetch (the assumption store is at the end).
import {
  buildTariff,
  coverageLine,
  fundVariants,
  memberKindOf,
  outcomeOrder,
  rankCandidates,
  RecordInputError,
  tieThreshold,
  type Candidate,
  type FundVariants,
  type RunContext,
  type VariantRow,
  type VariantSource,
} from "@finance-tool/engine";
import type { ExposureRecord, FundRecord, ValueObject } from "@finance-tool/schema";
import { deviceStore } from "./device-store";
import { BROKERAGE, a28Value, instrumentClassOf, parameterValue, ruleContext, staleTariff, type FundAssumptions, type WorkbenchBundle, type WorkbenchInputs } from "./providers";
import { nisPer } from "./fx";
import { computed, ownBy, weaker, type SiteValue, type Strength } from "./value";

/**
 * The page's inputs with the exposure's own entered return (D9, `goal.exposures[id].return`) in place of the goal's return,
 * so the chip, the figures and the ranking all use the number the person typed for this exposure. Without one: unchanged.
 */
export function withExposureReturn(inputs: WorkbenchInputs, own: ValueObject | undefined): WorkbenchInputs {
  if (!own || typeof own.value !== "number") return inputs;
  return {
    ...inputs,
    grossReturn: own.value / 100,
    values: { ...inputs.values, returnV: own as SiteValue },
    returnFromParameter: false,
  };
}

// ---------------------------------------------------------------- the address

export type SortKey = "rank" | "fee" | "name";

export interface VariantQuery {
  provider: string | null;
  orders: number | null;
}

export function parseVariantQuery(search: string): VariantQuery {
  const q = new URLSearchParams(search);
  const orders = q.get("orders");
  const n = orders !== null && /^\d+$/.test(orders) ? Number(orders) : null;
  return { provider: q.get("provider") || null, orders: n !== null && n >= 1 && n <= 30 ? n : null };
}

export function variantQueryString(q: VariantQuery): string {
  const p = new URLSearchParams();
  if (q.provider) p.set("provider", q.provider);
  if (q.orders !== null) p.set("orders", String(q.orders));
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------- the view

export type VariantKind = "ranked" | "listed" | "not-evaluated";
export type FeeKey = "fixed_management" | "trustee" | "variable_management" | "tracking_difference_12m" | "median_spread";
export const feeKeys: FeeKey[] = ["fixed_management", "trustee", "variable_management", "tracking_difference_12m", "median_spread"];

/** The engine's reason as the page words it: a code the copy table maps, with the text's arguments. */
export type VariantReason =
  | { code: "no-record" }
  | { code: "field-missing"; field: string }
  | { code: "g18"; openQuestion: string }
  | { code: "taxable-israeli" }
  | { code: "yield-missing"; fixable: true }
  | { code: "no-rate"; currency: string }
  | { code: "withholding"; country: string }
  | { code: "money-market" }
  | { code: "other-currency"; fund: string; exposure: string }
  | { code: "exit-blocked"; ruleId: string }
  | { code: "other"; detail: string };

export interface FundVariantRowView {
  id: string;
  name: string;
  manager: string | null;
  source: VariantSource;
  notInLatestList: boolean;
  recordId?: string;
  /** The number as printed (the `maya:` or `tase:` prefix stripped; a record without a TASE number shows its id). */
  number: string;
  kind: VariantKind;
  rank?: number;
  tiedWith: string[];
  tags: { domicile: string | null; policy: "accumulating" | "distributing" | "not-collected" };
  trading: { currency: string; onTaseInNis: boolean; abroad: boolean } | null;
  fees: Record<FeeKey, SiteValue | null> | null;
  /** Fee fields the record leaves empty that the engine takes as zero (A-07 to A-11). */
  takenAsZero: FeeKey[];
  value?: SiteValue;
  /** The exposure's own return (D9) is not entered: the figure waits. */
  waitsForReturn: boolean;
  reason?: VariantReason;
  /** Rule ids of the labels that put the secondary mark on the row's figures (TXF-11 under G-18). */
  secondary: string[];
  detail?: { fund: SiteValue; spread: SiteValue; provider: SiteValue; taxDuring: SiteValue; taxExit: SiteValue };
  ruleIds: string[];
  /** Fund-record id of a fund that has one, for the workbench link. */
  providersHref: string;
  checkHref: string;
  /** Another record shares this row's ISIN (two records for one paper, 3.7). */
  duplicateOf?: string;
}

export interface VariantProvider {
  id: string;
  name: string;
  fromP05: boolean;
  /** The provider asked for had no usable tariff; P-05's runs instead. */
  fellBack: boolean;
}

export interface FundVariantsView {
  exposure: ExposureRecord;
  lists: { israeli: SiteValue | null; tase: SiteValue | null };
  rows: FundVariantRowView[];
  /** The count of foreign-domiciled records traded abroad (G-29), a computed value. */
  held: SiteValue;
  coverage: { considered: number; ranked: number; listed: number; notEvaluated: number; invariantOk: boolean };
  provider: VariantProvider;
  theta: SiteValue;
  currency: string;
  cashLike: boolean;
  /** No entered return: figures and ranks wait (D9). */
  waitsForReturn: boolean;
  ruleIds: string[];
  /** A foreign fund is in the set: the W-8BEN and exchange-rate fields apply. */
  needsFx: boolean;
  hasDistributing: boolean;
  /** Fund records of the exposure that distribute, for the yield fields. */
  distributing: { recordId: string; name: string }[];
  /** Foreign currencies the funds are bought in abroad, each with the start rate the run used: the ECB cross rate (D26, never typed); null when the ECB has none. */
  startRates: { code: string; rate: SiteValue | null }[];
  ordersN: number;
  orders: SiteValue;
}

export type VariantResult = { kind: "ok"; view: FundVariantsView } | { kind: "error"; code: "no-exposure" | "no-tariff" | "engine"; detail?: string };

const isIls = (c: string) => c === "NIS" || c === "ILS";

/** The tariff every variant runs on (flow 30 step 2): the chosen provider's list lines for the class of the exposure's funds, else P-05's. */
function tariffFor(bundle: WorkbenchBundle, wanted: string | null, instrumentClass: string, exposureCurrency: string, ordersN: number): { tariff: Parameters<typeof fundVariants>[0]["run"]["tariff"]; provider: VariantProvider; memberKind: ReturnType<typeof memberKindOf> } | null {
  const p05Tariff = ((bundle.p05.instruments ?? {})[BROKERAGE] ?? {}).tariff;
  const candidates: { id: string; fromP05: boolean; fellBack: boolean }[] = [];
  if (wanted) candidates.push({ id: wanted, fromP05: wanted === p05Tariff, fellBack: false });
  if (p05Tariff && p05Tariff !== wanted) candidates.push({ id: p05Tariff, fromP05: true, fellBack: wanted !== null });
  for (const c of candidates) {
    const s = bundle.snapshots.find((x) => x.id === c.id && (x.provider.class === "bank" || x.provider.class === "broker" || x.provider.class === "foreign_broker"));
    if (!s || s.missing) continue;
    const input = {
      goal: { amountNow: 0, monthly: 0, months: 12 },
      market: { grossReturn: 0, inflation: 0 },
      fund: { kind: "israeli-fund" as const },
      profile: {},
      instrumentClass,
      channel: "direct",
      theta: 0,
      behaviour: { ordersPerMonth: ordersN },
      providers: [],
    };
    // the FX line is read with the exposure's currency so a bound set in dollars is checked against it; no line if that fails
    const attempt = (currency: string | null) => buildTariff({ ...input, ...(currency ? { currency: { code: currency, startRate: 1 } } : {}) }, { snapshot: s, level: "list" }, s).tariff;
    // F-14 (2026-10-26): bank or not, so a money-market unit pays custody only where the banks' ban does not reach (BRK-17, BRK-52)
    const memberKind = memberKindOf(s.provider.class);
    try {
      const t = isIls(exposureCurrency) ? attempt(null) : attempt(exposureCurrency);
      const { currency: _drop, ...rest } = t;
      void _drop;
      return { tariff: rest, provider: { id: s.id, name: s.provider.name_he, fromP05: c.fromP05, fellBack: c.fellBack }, memberKind };
    } catch (e) {
      if (!(e instanceof RecordInputError)) throw e;
      try {
        const { currency: _drop, ...rest } = attempt(null);
        void _drop;
        return { tariff: rest, provider: { id: s.id, name: s.provider.name_he, fromP05: c.fromP05, fellBack: c.fellBack }, memberKind };
      } catch (e2) {
        if (!(e2 instanceof RecordInputError)) throw e2;
      }
    }
  }
  return null;
}

function reasonOf(row: VariantRow): VariantReason | undefined {
  const r = row.reasons[0];
  if (!r) return undefined;
  const d = r.detail ?? "";
  if (r.code === "missing-record") {
    const field = /^details not collected: (.+)$/.exec(d)?.[1];
    return field ? { code: "field-missing", field } : { code: "no-record" };
  }
  if (r.code === "missing-input") {
    if (/^distributions\./.test(d)) return { code: "yield-missing", fixable: true };
    const ccy = /^fxStartRates\.(\w+)/.exec(d)?.[1];
    if (ccy) return { code: "no-rate", currency: ccy };
  }
  if (r.code === "no-run") {
    if (/taxable Israeli fund/.test(d)) return { code: "taxable-israeli" };
    const w = /^foreign withholding for domicile (\w+) is not set/.exec(d);
    if (w) return { code: "withholding", country: w[1]! };
    const c = /^a (\w+) fund on a (\w+) exposure has no run/.exec(d);
    if (c) return { code: "other-currency", fund: c[1]!, exposure: c[2]! };
  }
  if (r.code === "gap" && /money-market/.test(d)) return { code: "money-market" };
  if (r.gapIds.includes("G-18")) return { code: "g18", openQuestion: "TXF OQ1" };
  if (r.code === "exit-blocked" && r.ruleIds[0]) return { code: "exit-blocked", ruleId: r.ruleIds[0] };
  return { code: "other", detail: d || r.code };
}

const feeValue = (rec: FundRecord, key: FeeKey): SiteValue | null => {
  const v = rec.fees[key];
  // D31: the fund manager's own fee, shown on that fund's row
  return v && v.value !== null ? ownBy(v as SiteValue, rec.manager) : null;
};

interface VariantArgs {
  bundle: WorkbenchBundle;
  exposureId: string;
  query: VariantQuery;
  inputs: WorkbenchInputs;
  assumptions: FundAssumptions;
  /** The exposure's page, when it is a security's page (D6 as amended 2026-10-27); else `/exposure/{id}`. */
  exposureHref?: string;
}

/** Foreign currencies the funds are bought in abroad (their start rate is the ECB cross rate). */
function foreignCurrencies(mine: FundRecord[]): string[] {
  return [...new Set(mine.filter((f) => f.domicile !== "IL" || !isIls(f.currency)).filter((f) => !isIls(f.currency) && (f.trading_currency_on_tase === null || !isIls(f.trading_currency_on_tase))).map((f) => f.currency))];
}

export function buildFundVariants(a: VariantArgs): VariantResult {
  const { bundle, exposureId, query, inputs, assumptions, exposureHref } = a;
  const today = bundle.today;
  const exposure = bundle.exposures.find((e) => e.id === exposureId);
  if (!exposure) return { kind: "error", code: "no-exposure" };
  const mine = bundle.funds.filter((f) => f.exposure_id === exposure.id);
  // Each fund is priced with its own instrument class (2026-10-25): a tracking fund on the mutual-fund lines, an ETF and a TASE-traded
  // foreign fund on the exchange-traded lines, a fund bought abroad on the foreign-securities lines. A list row with no record has no run.
  const classOf = new Map(mine.map((f) => [f.id, instrumentClassOf(f, exposure)] as const));
  const classes = [...new Set(classOf.values())];
  if (classes.length === 0) classes.push("etf_units");
  const ordersN = query.orders ?? 1;
  const tariffs = new Map<string, NonNullable<ReturnType<typeof tariffFor>>>();
  for (const cls of classes) {
    const t = tariffFor(bundle, query.provider, cls, exposure.currency, ordersN);
    if (!t) return { kind: "error", code: "no-tariff" };
    tariffs.set(cls, t);
  }
  const tariff = tariffs.get(classes[0]!)!;

  const dist: Record<string, { yield: number; perYear: number }> = {};
  for (const [id, d] of Object.entries(assumptions.distributions ?? {})) dist[id] = { yield: d.yield / 100, perYear: d.perYear };
  const theta = tieThreshold([bundle.p01]);
  const startRates = foreignCurrencies(mine).map((code) => ({ code, rate: bundle.fx ? nisPer(bundle.fx, code, today) : null }));
  const startRateNumbers: Record<string, number> = {};
  for (const r of startRates) if (r.rate && typeof r.rate.value === "number") startRateNumbers[r.code] = r.rate.value;
  const xFor = (t: typeof tariff) => ({
    record: exposure,
    run: {
      goal: { amountNow: inputs.amountNow, monthly: inputs.monthly, months: 12 * inputs.years },
      grossReturn: inputs.grossReturn,
      inflation: inputs.inflation,
      ...(assumptions.fxChange !== undefined ? { fxChange: assumptions.fxChange / 100 } : {}),
      tariff: t.tariff,
      memberKind: t.memberKind,
      profile: { ...(inputs.age !== null ? { ageAtStart: inputs.age } : {}), ...(inputs.income !== null && inputs.income > 0 ? { annualIncome: inputs.income } : {}) },
      ...(assumptions.w8ben !== undefined ? { w8ben: assumptions.w8ben } : {}),
      fxStartRates: startRateNumbers,
      distributions: dist,
      ordersPerMonth: ordersN,
    },
    theta,
  });
  let fv: FundVariants;
  try {
    const ctx = ruleContext(bundle) as RunContext;
    const runs = classes.map((cls) => ({ cls, fv: fundVariants(xFor(tariffs.get(cls)!), bundle.fundLists, bundle.funds, ctx) }));
    // a record's row comes from the run of its own class; a row with no record (a list row) from the first run
    const rows = runs.flatMap(({ cls, fv: r }, i) => r.rows.filter((row) => (row.recordId ? classOf.get(row.recordId) === cls : i === 0)));
    const first = runs[0]!.fv;
    const asCandidates: Candidate[] = rows.map((r) => ({ id: r.id, name: r.name, tier: 1, kind: r.kind, reasons: r.reasons, ...(r.plan ? { plan: r.plan } : {}), ...(r.run ? { run: r.run } : {}) }));
    const ranking = rankCandidates(asCandidates, { theta, ctx });
    for (const e of ranking.entries) rows.find((r) => r.id === e.id)!.rank = e.rank;
    const coverage = coverageLine(
      [
        ...rows.map((r) => ({ id: r.id, name: r.name, kind: r.kind, reasons: r.reasons })),
        { id: first.group.id, name: "foreign-domiciled funds traded abroad, not held one by one", kind: "not-evaluated" as const, reasons: [{ code: "gap" as const, ruleIds: [], gapIds: [first.group.gapId], detail: `not held one by one; ${first.group.held} held` }] },
      ],
      outcomeOrder,
      ["ranked"],
    );
    fv = { ...first, rows, ranking, coverage };
  } catch (e) {
    return { kind: "error", code: "engine", detail: e instanceof Error ? e.message : String(e) };
  }

  const waits = inputs.returnFromParameter;
  const rulesOf = (run: NonNullable<VariantRow["run"]>) => run.rules.map((u) => ({ id: u.id, strength: u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength) }));
  const inputMap: Record<string, SiteValue> = { סכום: inputs.values.amount, "הפקדה חודשית": inputs.values.monthly, שנים: inputs.values.years, תשואה: inputs.values.returnV, אינפלציה: inputs.values.inflation };
  const figure = (n: number, about: string, run: NonNullable<VariantRow["run"]>): SiteValue => computed(n, "nis", "F-65", inputMap, { today, rules: rulesOf(run), flags: run.flags.map((f) => f.code), about });

  const tied = new Set(fv.ranking.tieSet.length > 1 ? fv.ranking.tieSet : []);
  const byIsin = new Map<string, string[]>();
  for (const r of bundle.funds) if (r.identifiers.isin) byIsin.set(r.identifiers.isin, [...(byIsin.get(r.identifiers.isin) ?? []), r.id]);

  const rows: FundVariantRowView[] = fv.rows.map((row) => {
    const rec = row.recordId ? bundle.funds.find((f) => f.id === row.recordId) : undefined;
    const kind: VariantKind = row.kind === "ranked" ? "ranked" : row.kind === "listed-not-ranked" ? "listed" : "not-evaluated";
    const run = row.run;
    const number = rec?.identifiers.tase_number ?? (row.id.includes(":") ? row.id.slice(row.id.indexOf(":") + 1) : row.id);
    const fees = rec ? (Object.fromEntries(feeKeys.map((k) => [k, feeValue(rec, k)])) as Record<FeeKey, SiteValue | null>) : null;
    const secondary = row.labels.filter((l) => l.code === "secondary-source").map((l) => l.ruleId);
    const sameIsin = rec?.identifiers.isin ? byIsin.get(rec.identifiers.isin)!.filter((id) => id !== rec.id) : [];
    const detail =
      run && !waits
        ? {
            fund: figure(run.fees.fund, "עלויות הקרן", run),
            spread: figure(run.fees.spread, "מרווח הקנייה והמכירה", run),
            provider: figure(run.fees.trade + run.fees.custody + run.fees.fx + run.fees.fixed, "עמלות הספק", run),
            taxDuring: figure(run.taxDuring, "מס במהלך התקופה", run),
            taxExit: figure(run.taxAtExit, "מס ביציאה", run),
          }
        : undefined;
    return {
      id: row.id,
      name: row.name,
      manager: row.manager,
      source: row.source,
      notInLatestList: !!row.notInLatestList && fv.lists.israeli !== null,
      ...(row.recordId ? { recordId: row.recordId } : {}),
      number,
      kind,
      ...(row.rank !== undefined && !waits ? { rank: tied.has(row.id) ? 1 : row.rank } : {}),
      tiedWith: tied.has(row.id) ? [...tied].filter((t) => t !== row.id) : [],
      tags: { domicile: rec?.domicile ?? null, policy: rec ? (rec.distribution_policy ?? "not-collected") : "not-collected" },
      trading: rec ? { currency: isIls(rec.currency) ? "ILS" : rec.currency, onTaseInNis: rec.trading_currency_on_tase !== null && isIls(rec.trading_currency_on_tase), abroad: rec.domicile !== "IL" && rec.trading_currency_on_tase === null } : null,
      fees,
      takenAsZero: row.notCollected.filter((k): k is FeeKey => feeKeys.includes(k as FeeKey)),
      ...(run && !waits ? { value: figure(run.real, "מה שנשאר במועד המטרה, בכסף של היום", run) } : {}),
      waitsForReturn: waits && kind !== "not-evaluated",
      ...(reasonOf(row) && !(waits && kind !== "not-evaluated" && !secondary.length) ? { reason: reasonOf(row)! } : {}),
      secondary,
      ...(detail ? { detail } : {}),
      ruleIds: run ? run.rules.map((r) => r.id) : [],
      providersHref: rec ? `/workbench/providers/${BROKERAGE}?fund=${encodeURIComponent(rec.id)}` : `/workbench/providers/${BROKERAGE}`,
      checkHref: exposureHref ?? `/exposure/${exposure.id}`,
      ...(sameIsin.length > 0 ? { duplicateOf: sameIsin[0]! } : {}),
    };
  });

  const counts = { ranked: rows.filter((r) => r.kind === "ranked").length, listed: rows.filter((r) => r.kind === "listed").length, notEvaluated: rows.filter((r) => r.kind === "not-evaluated").length };
  const listValue = (snapshot: string | null, which: "israeli" | "tase"): SiteValue | null => {
    if (!snapshot) return null;
    const file = bundle.fundLists.find((l) => l.list === (which === "israeli" ? "maya-mutual-funds" : "tase-foreign-funds") && l.snapshot === snapshot)!;
    return {
      value: snapshot,
      unit: "text",
      source: file.source,
      checked: file.checked,
      effective_from: snapshot,
      effective_to: null,
      update_rule: "market",
      state: "sourced",
      stale: staleTariff(snapshot, today) ? { since: snapshot, cadence: "monthly" as const } : null,
      notes: "",
    };
  };
  const ruleIds = new Set<string>(["TXF-11", "TXF-13", "TXS-22", "CAT-34", "ETF-32", "TXF-12", "TXF-08"]);
  rows.forEach((r) => r.ruleIds.forEach((id) => ruleIds.add(id)));
  const view: FundVariantsView = {
    exposure,
    lists: { israeli: listValue(fv.lists.israeli, "israeli"), tase: listValue(fv.lists.tase, "tase") },
    rows,
    held: computed(fv.group.held, "count", "F-65", {}, { today, about: "קרנות זרות הנסחרות בחו״ל שהאתר מחזיק רשומה שלהן", flags: ["G-29"] }),
    coverage: { considered: fv.coverage.considered, ranked: counts.ranked, listed: counts.listed, notEvaluated: counts.notEvaluated, invariantOk: fv.coverage.invariant.ok },
    provider: tariff.provider,
    theta: parameterValue(bundle.p01, (bundle.p01 as unknown as { value: ValueObject }).value),
    currency: exposure.currency,
    cashLike: exposure.cash_like,
    waitsForReturn: waits,
    ruleIds: [...ruleIds].filter((id) => bundle.rules.some((r) => r.id === id)),
    needsFx: mine.some((f) => f.domicile !== "IL" || !isIls(f.currency)),
    hasDistributing: mine.some((f) => f.distribution_policy === "distributing"),
    distributing: mine.filter((f) => f.distribution_policy === "distributing").map((f) => ({ recordId: f.id, name: f.names.he[0] ?? f.names.en[0] ?? f.id })),
    startRates,
    ordersN,
    orders: query.orders !== null ? ({ ...a28Value(query.orders, "פעולות בחודש", today), state: "entered", update_rule: "founder" } as SiteValue) : a28Value(1, "פעולות בחודש", today),
  };
  return { kind: "ok", view };
}

// ---------------------------------------------------------------- sorting and filtering

export function matchesVariant(r: FundVariantRowView, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  return r.name.toLowerCase().includes(t) || (r.manager ?? "").toLowerCase().includes(t) || r.number.toLowerCase().includes(t);
}

const collator = new Intl.Collator("he");

/** Inside a group: by the ranking (the engine's order), by the management fee (a fee not collected last) or by name. */
export function sortVariants(rows: FundVariantRowView[], sort: SortKey): FundVariantRowView[] {
  const fee = (r: FundVariantRowView) => (r.fees?.fixed_management && typeof r.fees.fixed_management.value === "number" ? r.fees.fixed_management.value : null);
  const out = [...rows];
  if (sort === "name") return out.sort((a, b) => collator.compare(a.name, b.name));
  if (sort === "fee")
    return out.sort((a, b) => {
      const x = fee(a);
      const y = fee(b);
      if (x === null && y === null) return collator.compare(a.name, b.name);
      if (x === null) return 1;
      if (y === null) return -1;
      return x - y || collator.compare(a.name, b.name);
    });
  return out.sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9));
}

// ---------------------------------------------------------------- the assumptions the person entered, per exposure

export const VARIANTS_KEY = "mekor.v2.variants";

/** TODO(state v3): `StateV3.variantAssumptions` (design-spec 16.5); this key is read by nothing else. */
function parseAssumptions(raw: unknown): Record<string, FundAssumptions> {
  const rec = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  if (!rec(raw) || raw.version !== 1 || !rec(raw.byExposure)) return {};
  const out: Record<string, FundAssumptions> = {};
  for (const [id, v] of Object.entries(raw.byExposure)) {
    if (!rec(v)) continue;
    const a: FundAssumptions = {};
    const fx = num(v.fxChange);
    if (fx !== undefined) a.fxChange = fx;
    if (typeof v.w8ben === "boolean") a.w8ben = v.w8ben;
    if (rec(v.distributions)) {
      const m: Record<string, { yield: number; perYear: number }> = {};
      for (const [f, d] of Object.entries(v.distributions)) if (rec(d) && num(d.yield) !== undefined && num(d.perYear) !== undefined && [1, 2, 3, 4, 6, 12].includes(d.perYear as number)) m[f] = { yield: d.yield as number, perYear: d.perYear as number };
      if (Object.keys(m).length) a.distributions = m;
    }
    out[id] = a;
  }
  return out;
}

const store = deviceStore<Record<string, FundAssumptions>>(VARIANTS_KEY, {}, parseAssumptions, (v) => ({ version: 1, byExposure: v }));

export const DISTRIBUTION_PAYMENTS = [1, 2, 4, 12] as const;

/** The assumptions for one exposure (shared by the fund page and the provider workbench), and the functions that change them. */
export function useFundAssumptions(exposureId: string | null) {
  const snap = store.use();
  const value: FundAssumptions = (exposureId && snap.value[exposureId]) || {};
  const patch = (fn: (a: FundAssumptions) => FundAssumptions) => {
    if (!exposureId) return;
    store.update((all) => ({ ...all, [exposureId]: fn(all[exposureId] ?? {}) }));
  };
  return { value, ready: snap.ready, writable: snap.writable, patch, reset: () => exposureId && store.update((all) => { const n = { ...all }; delete n[exposureId]; return n; }) };
}

export const resetVariantsStore = () => store.reset();
export type { FundAssumptions };
