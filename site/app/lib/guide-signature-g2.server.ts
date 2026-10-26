// Builds the data of the second wave of "what makes it different" visuals at build time (D29): the study fund, the provident fund for
// investing and the pensions. Server-only. Each builder is called from `builders` in guide-signature.server.ts with that file's context.
// Nothing here types a rate or a date: a figure is a record's value object, a rule's figure or a P-05 parameter, and a missing one
// becomes a `gap` (shown as "עוד לא חושב" with its reason).
import type { CatalogEntry, DepositTerms, ExposureRecord, FundRecord, ParameterRecord, RuleRecord, ValueObject, ProductRecord } from "@finance-tool/schema";
import { loadCma, loadCmaFees, loadFees } from "./data.server";
import type { Bundle } from "./engine";
import { p05Number, p05Value } from "./engine";
import type { SignatureData } from "./guide-signature";
import { buildInstrumentBundle } from "./guide-signature-bundle.server";
import { hishtalmutTerms, pensionModel, rulesRead, runWith, sideOf, type Employment } from "./guide-signature-g2";
import { loadCatalog, loadExposures, regulatorAverageFees } from "./instruments.server";
import { cmaFeeValue, computed, ownBy, ruleFigure, type SiteValue } from "./value";

/** What the builders of guide-signature.server.ts pass in (structurally the same as its private `Ctx`). */
export interface G2Ctx {
  p05: ParameterRecord;
  allRules: Record<string, RuleRecord>;
  wrappers: ProductRecord[];
  deposits: DepositTerms[];
  funds: FundRecord[];
  t: string;
  own: Bundle | null;
  id: string;
}

const emptyData = (id: string): SignatureData => ({ id, bundles: {}, facts: {}, gaps: [], ruleIds: [] });
const figureOf = (c: G2Ctx, rule: string, name: string): SiteValue | undefined => {
  const r = c.allRules[rule];
  return r ? (ruleFigure(r, name, c.t) ?? undefined) : undefined;
};
const withRules = (d: SignatureData, ...ids: string[]): SignatureData => ({ ...d, ruleIds: [...new Set([...d.ruleIds, ...ids])] });

/** Rule figures a visual shows by name: each one is the rule record's own value object, or a gap that names the rule. */
function addFigures(d: SignatureData, c: G2Ctx, list: [name: string, rule: string, figure: string][]) {
  for (const [name, rule, figure] of list) {
    const v = figureOf(c, rule, figure);
    if (v) d.facts[name] = v;
    else d.gaps.push(`rule:${rule}`);
  }
}

/** A text (a name) with the source of the record it came from. */
function textFact(value: string, from: { source: ValueObject["source"]; checked: string }, notes: string): SiteValue {
  return { value, unit: "text", source: from.source, checked: from.checked, effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced", notes };
}

// ---------------------------------------------------------------- the same index in another container

const norm = (s: string) => s.toLowerCase().replace(/[\s\-_.״"'׳,]/g, "");
/** The distinctive part of an index's names ("s&p500"): the names without the words that only say it is an index. */
function indexKeys(e: ExposureRecord): string[] {
  const names = [...e.names.he, ...e.names.en].map((n) => norm(n.replace(/עוקב|מדד/g, "")));
  return [...new Set(names.filter((n) => n.length >= 4))];
}
const namesIndex = (names: string[], keys: string[]) => names.some((n) => keys.some((k) => norm(n).includes(k)));

interface IndexTrack {
  id: number;
  name: string;
  company: string;
  fee: SiteValue | null;
  deposit: SiteValue | null;
}

/** The regulator's tracks of one product type that follow the index, with the fees they report. */
function indexTracks(c: G2Ctx, wrapperId: string, exposure: ExposureRecord): IndexTrack[] {
  const keys = indexKeys(exposure);
  const fees = loadCmaFees();
  return loadCma()
    .tracks.filter((t) => t.wrapperId === wrapperId && namesIndex([t.name], keys))
    .map((t) => {
      const f = fees.get(t.fundId);
      const fee = f && typeof f.balance.value === "number" ? cmaFeeValue(f.balance, c.t) : null;
      const deposit = f && typeof f.deposit.value === "number" ? cmaFeeValue(f.deposit, c.t) : null;
      return { id: t.fundId, name: t.name, company: t.companyName, fee, deposit };
    });
}

/**
 * The track of the same index at the manager the page's run uses: the catalogue entry of that product whose names the index's names
 * match (data/catalog/ maps an institution-facing name to the regulator's track). `institution` is the catalogue's id of the manager;
 * `kupa` the regulator's fund number the entry belongs to, when P-05 names one.
 */
function sameIndexTrack(wrapperId: string, exposure: ExposureRecord, match: { kupa?: number; institution?: string }): { entry: CatalogEntry; trackId: number } | null {
  const keys = indexKeys(exposure);
  const entry = loadCatalog()
    .filter((e) => e.maps_to.wrapper_id === wrapperId && e.maps_to.track_ids.length > 0 && namesIndex(e.names.he, keys))
    .filter((e) => (match.kupa !== undefined ? e.maps_to.cma_fund_id === match.kupa : e.institution === match.institution))
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  return entry ? { entry, trackId: entry.maps_to.track_ids[0]! } : null;
}

/** What the brokerage account holds in P-05: its fund and that fund's exposure. */
function brokerageHolding(c: G2Ctx): { fund: FundRecord; exposure: ExposureRecord } | null {
  const spec = c.p05.instruments?.["brokerage-account"];
  const fund = spec?.fund !== undefined ? c.funds.find((f) => f.id === String(spec.fund)) : undefined;
  const exposure = fund ? loadExposures().find((e) => e.id === fund.exposure_id) : undefined;
  return fund && exposure ? { fund, exposure } : null;
}

/** The facts both containers' visuals show about the index and the two holdings: names, numbers and the range of fees across managers. */
function addHoldings(d: SignatureData, c: G2Ctx, holding: { fund: FundRecord; exposure: ExposureRecord }, track: IndexTrack | null, wrapperId: string) {
  const { fund, exposure } = holding;
  const src = fund.fees.trustee?.source ?? fund.fees.fixed_management?.source;
  d.facts.indexName = textFact(exposure.names.he[0] ?? exposure.id, { source: { url: `data/instruments/exposures/${exposure.id}.json`, title: "רשומת החשיפה במאגר האתר", publisher: "האתר", strength: "primary" }, checked: exposure.checked }, "שם המדד כפי שהוא ברשומת החשיפה");
  // D31: the fund's fees are its manager's own figures, shown beside the fund's name
  if (src) d.facts.fundName = ownBy(textFact(fund.names.he[0] ?? fund.id, { source: src, checked: fund.snapshot }, `הקרן של חשבון ניירות ערך בפרמטרים של האתר (מספר ${fund.id})`), fund.manager);
  d.facts.fundNumber = ownBy(textFact(fund.id, { source: src ?? { url: `data/funds/${fund.id}`, title: "רשומת הקרן", publisher: "האתר", strength: "primary" }, checked: fund.snapshot }, "מספר הנייר בבורסה"), fund.manager);
  if (fund.fees.trustee && typeof fund.fees.trustee.value === "number") d.facts.fundTrustee = ownBy(fund.fees.trustee as SiteValue, fund.manager);
  if (fund.fees.fixed_management && typeof fund.fees.fixed_management.value === "number") d.facts.fundManagement = ownBy(fund.fees.fixed_management as SiteValue, fund.manager);
  if (track) {
    const from = track.fee ?? undefined;
    if (from) {
      d.facts.trackName = textFact(track.name, { source: from.source, checked: from.checked }, `שם המסלול ברשות שוק ההון (מסלול ${track.id}, ${track.company})`);
      d.facts.trackNumber = textFact(String(track.id), { source: from.source, checked: from.checked }, "מספר המסלול ברשות שוק ההון");
      d.facts.trackFee = track.fee!;
    }
  }
  // rule 3: what depends on the manager is a range across the managers whose tracks follow the index
  const all = indexTracks(c, wrapperId, exposure).filter((t) => t.fee !== null);
  if (all.length >= 2) {
    const sorted = [...all].sort((a, b) => (a.fee!.value as number) - (b.fee!.value as number));
    d.facts.rangeMin = sorted[0]!.fee!;
    d.facts.rangeMax = sorted[sorted.length - 1]!.fee!;
    d.facts.rangeCount = computed(all.length, "count", "F-64", {}, { today: c.t, about: "כמה מסלולים על המדד הזה דיווחה הרשות בתקופה האחרונה, עם דמי ניהול" });
    d.facts.rangeMinName = textFact(sorted[0]!.name, { source: sorted[0]!.fee!.source, checked: c.t }, sorted[0]!.company);
    d.facts.rangeMaxName = textFact(sorted[sorted.length - 1]!.name, { source: sorted[sorted.length - 1]!.fee!.source, checked: c.t }, sorted[sorted.length - 1]!.company);
  }
}

/** The ledger bundle of a provident-family wrapper on the index track's fees; the terms are filled in by the visual (employment, A-12). */
function trackBundle(c: G2Ctx, wrapperId: string, track: IndexTrack): { bundle: Bundle | null; gap?: string } {
  const record = c.wrappers.find((w) => w.id === wrapperId);
  if (!record) return { bundle: null, gap: `bundle:${wrapperId}` };
  const reg = regulatorAverageFees(wrapperId, { track: track.id } as never, loadCmaFees(), c.allRules, c.t);
  if (!reg || "missing" in reg) return { bundle: null, gap: `fees:${wrapperId}` };
  return { bundle: { record, p05: c.p05, terms: { fees: reg.fees }, feeValues: reg.feeValues, rules: [], runDate: c.t } };
}

/** The bundle with the rules its runs may read, found by running the variants the visual can ask for (a bigger amount, an age of 65, a high salary). */
function widen(bundle: Bundle, c: G2Ctx, variants: ((b: Bundle) => ReturnType<typeof runWith>)[]): Bundle {
  const rules = rulesRead(bundle, c.allRules, variants);
  const known = new Set(rules.map((r) => r.id));
  for (const r of bundle.rules) if (!known.has(r.id) && c.allRules[r.id]) rules.push(c.allRules[r.id]!);
  return { ...bundle, rules };
}

/** The generic variants of an amount, a monthly deposit and a horizon, for a bundle that takes the default terms. */
const plainVariants = (months: number[]) =>
  [10_000, 5_000_000].flatMap((amount_now) =>
    [0, 500, 10_000].flatMap((monthly_deposit) => [undefined, 65].flatMap((age) => months.map((m) => (b: Bundle) => runWith(b, { amount_now, monthly_deposit }, m, { profile: age === undefined ? {} : { ageAtStart: age } })))),
  );

const brokerVariants = plainVariants([12, 72, 144, 480]);

function brokerageBundle(c: G2Ctx): Bundle | null {
  const record = c.wrappers.find((w) => w.id === "brokerage-account");
  if (!record) return null;
  const b = buildInstrumentBundle(record, "securities", c.p05, c.allRules, c.t).bundle;
  return b ? widen(b, c, brokerVariants) : null;
}

/**
 * Rule 3: what a brokerage account costs depends on the bank or broker. The page's bundle is P-05's provider; this adds the two collected
 * providers at the ends of the range on the same fund and the example plan (P-05's amount, monthly deposit and horizon): the one that leaves
 * the person the most and the one that leaves the least, so the visual can show how far the difference moves with the choice.
 */
function addBrokerRange(d: SignatureData, c: G2Ctx) {
  const record = c.wrappers.find((w) => w.id === "brokerage-account");
  if (!record) return;
  const months = 12 * p05Number(c.p05, "horizon_years");
  const plan = { amount_now: p05Number(c.p05, "amount_now"), monthly_deposit: p05Number(c.p05, "monthly_deposit") };
  const rows: { id: string; name: string; gain: number; bundle: Bundle; source: ValueObject["source"]; checked: string }[] = [];
  const seen = new Set<string>();
  for (const f of loadFees()) {
    if (seen.has(f.id) || f.missing) continue;
    seen.add(f.id);
    const spec = { ...c.p05.instruments?.["brokerage-account"], tariff: f.id };
    const p = { ...c.p05, instruments: { ...c.p05.instruments, "brokerage-account": spec } } as ParameterRecord;
    const bundle = buildInstrumentBundle(record, "securities", p, c.allRules, c.t).bundle;
    const run = bundle ? runWith(bundle, plan, months) : null;
    if (!bundle || !run || run.outcome.code !== "eligible") continue;
    const latest = loadFees().filter((x) => x.id === f.id).sort((a, b) => a.snapshot.localeCompare(b.snapshot)).at(-1)!;
    rows.push({ id: f.id, name: latest.provider.name_he, gain: sideOf(run, plan.amount_now).gain, bundle, source: { url: latest.tariff.url, title: latest.tariff.title, publisher: latest.provider.name_he, strength: "institution" }, checked: latest.snapshot });
  }
  if (rows.length < 3) return;
  rows.sort((a, b) => a.gain - b.gain);
  const [worst, best] = [rows[0]!, rows[rows.length - 1]!];
  d.bundles["brokerage-worst"] = widen(worst.bundle, c, brokerVariants);
  d.bundles["brokerage-best"] = widen(best.bundle, c, brokerVariants);
  d.facts.brokerWorstName = ownBy(textFact(worst.name, worst, "בית ההשקעות שהחשבון בו משאיר הכי מעט בתוכנית לדוגמה של האתר"), worst.name);
  d.facts.brokerBestName = ownBy(textFact(best.name, best, "בית ההשקעות שהחשבון בו משאיר הכי הרבה בתוכנית לדוגמה של האתר"), best.name);
  d.facts.brokerCount = computed(rows.length, "count", "F-63", {}, { today: c.t, about: "כמה בנקים ובתי השקעות שהתעריפון שלהם נאסף ושהאתר מחשב בשבילם את החשבון" });
  const own = loadFees().filter((x) => x.id === c.p05.instruments?.["brokerage-account"]?.tariff).sort((a, b) => a.snapshot.localeCompare(b.snapshot)).at(-1);
  if (own) d.facts.brokerName = ownBy(textFact(own.provider.name_he, { source: { url: own.tariff.url, title: own.tariff.title, publisher: own.provider.name_he, strength: "institution" }, checked: own.snapshot }, "בית ההשקעות שהפרמטרים של האתר מניחים לחשבון ניירות ערך"), own.provider.name_he);
}

/**
 * The brokerage side is priced at the collected tariff that leaves the example plan the most, the goal comparison's pick (F-80), named as
 * such; P-05's bank tariff (Leumi) made the account look far dearer than a reader who shops for a broker would pay (lead, 2026-10-25).
 */
function useBestBroker(d: SignatureData) {
  const best = d.bundles["brokerage-best"];
  if (!best) return;
  d.bundles["brokerage-account"] = best;
  if (d.facts.brokerBestName) d.facts.brokerName = d.facts.brokerBestName;
}

// ---------------------------------------------------------------- study fund

export function buildStudyFund(c: G2Ctx): SignatureData {
  const d = emptyData(c.id);
  const holding = brokerageHolding(c);
  const broker = brokerageBundle(c);
  if (broker) d.bundles["brokerage-account"] = broker;
  else d.gaps.push("bundle:brokerage-account");
  addBrokerRange(d, c);
  useBestBroker(d);
  const spec = c.p05.instruments?.[c.id];
  const pick = holding && spec?.track !== undefined ? sameIndexTrack(c.id, holding.exposure, { kupa: spec.track }) : null;
  const track = holding && pick ? (indexTracks(c, c.id, holding.exposure).find((t) => t.id === pick.trackId) ?? null) : null;
  if (!holding) d.gaps.push("holding:brokerage");
  else if (!track || !track.fee) d.gaps.push("indexTrack");
  if (holding) addHoldings(d, c, holding, track, c.id);
  if (track) {
    const { bundle, gap } = trackBundle(c, c.id, track);
    if (bundle) {
      const variants = ([ "employee", "self-employed" ] as Employment[]).flatMap((employment) =>
        [8_000, 12_000, 40_000].flatMap((income) =>
          [false, true].flatMap((early) =>
            [10_000, 5_000_000].flatMap((amount_now) =>
              [0, 500, 10_000].map((monthly_deposit) => (b: Bundle) =>
                runWith(b, { amount_now, monthly_deposit }, early ? 36 : 144, { terms: hishtalmutTerms(b, { employment, income, early }), profile: { annualIncome: 12 * income } }),
              ),
            ),
          ),
        ),
      );
      d.bundles[c.id] = widen(bundle, c, variants);
    } else if (gap) d.gaps.push(gap);
  }
  addFigures(d, c, [
    ["lockYears", "TXH-09", "lock_years"],
    ["lockYearsShort", "TXH-10", "lock_years"],
    ["employerPct", "TXH-01", "employer_exempt_pct"],
    ["determiningCap", "TXH-02", "determining_salary_cap"],
    ["ownPct", "TXH-08", "own_benefited_pct"],
    ["selfBenefited", "TXH-08", "self_employed_benefited"],
    ["deductionPct", "TXH-05", "deduction_pct"],
    ["deductionCeiling", "TXH-05", "income_ceiling"],
    ["taxRate", "TXH-11", "rate"],
    ["brokerTaxRate", "TXS-09", "rate"],
    ["earlyWithholding", "TXH-15", "withholding_early"],
    ["firstBracket", "TXG-03", "first_rate"],
  ]);
  d.facts.returnPct = p05Value(c.p05, "A-01");
  d.facts.inflationPct = p05Value(c.p05, "A-02");
  d.facts.incomeP05 = p05Value(c.p05, "annual_income");
  // TXH-07 (a self-employed person's early withdrawal) has no rule record, so the engine cannot price it
  d.gaps.push("selfEmployedEarly");
  return withRules(d, "TXH-01", "TXH-02", "TXH-03", "TXH-04", "TXH-05", "TXH-08", "TXH-09", "TXH-10", "TXH-11", "TXH-13", "TXH-15", "TXS-09", "TXG-03", "PF-06");
}

// ---------------------------------------------------------------- provident fund for investing

export function buildProvident(c: G2Ctx): SignatureData {
  const d = emptyData(c.id);
  const holding = brokerageHolding(c);
  const broker = brokerageBundle(c);
  if (broker) d.bundles["brokerage-account"] = broker;
  else d.gaps.push("bundle:brokerage-account");
  addBrokerRange(d, c);
  useBestBroker(d);
  // the page's run is on the manager whose list fee it uses; the same manager's track on the index is the holding
  const provider = loadFees().find((f) => f.lines.some((l) => l.applies_to.includes(c.id) && l.level === "list"))?.id;
  const pick = holding && provider ? sameIndexTrack(c.id, holding.exposure, { institution: provider }) : null;
  const track = holding && pick ? (indexTracks(c, c.id, holding.exposure).find((t) => t.id === pick.trackId) ?? null) : null;
  if (!holding) d.gaps.push("holding:brokerage");
  else if (!track || !track.fee) d.gaps.push("indexTrack");
  if (holding) addHoldings(d, c, holding, track, c.id);
  if (track) {
    const { bundle, gap } = trackBundle(c, c.id, track);
    if (bundle) d.bundles[c.id] = widen(bundle, c, plainVariants([12, 120, 240, 480]));
    else if (gap) d.gaps.push(gap);
  }
  addFigures(d, c, [
    ["earlyAge", "TXK-10", "early_retirement_age"],
    ["exemptAge", "TXK-09", "age"],
    ["taxRate", "TXK-07", "rate"],
    ["taxRateLaw", "TXK-06", "rate"],
    ["nominalRate", "TXK-06", "nominal_rate"],
    ["ceiling", "KGL-03", "ceiling"],
    ["brokerTaxRate", "TXS-09", "rate"],
  ]);
  d.facts.returnPct = p05Value(c.p05, "A-01");
  d.facts.inflationPct = p05Value(c.p05, "A-02");
  // 2026-10-26: from 60 the lump sum's tax depends on the other income in the exit year (F-44 with F-42); the run takes P-05's
  d.facts.incomeP05 = p05Value(c.p05, "annual_income");
  // TXK-OQ4 / PEN-OQ7: the annuity's size needs conversion factors the site does not hold
  d.gaps.push("annuityFactors");
  return withRules(d, "KGL-02", "KGL-03", "KGL-08", "TXK-01", "TXK-03", "TXK-04", "TXK-05", "TXK-06", "TXK-07", "TXK-08", "TXK-09", "TXK-10", "TXK-11", "TXK-12", "TXS-09");
}

// ---------------------------------------------------------------- the pensions

export function buildPension(c: G2Ctx): SignatureData {
  const d = emptyData(c.id);
  const record = c.wrappers.find((w) => w.id === c.id);
  const spec = c.p05.instruments?.[c.id];
  if (!record) {
    d.gaps.push(`bundle:${c.id}`);
    return d;
  }
  // the fees come from the track P-05 names (the regulator's averages, a pension fund's for the fund as a whole, CAT-39); no track, no balance
  let terms: Bundle["terms"] = {};
  let feeValues: Bundle["feeValues"] = {};
  const reg = spec ? regulatorAverageFees(c.id, spec, loadCmaFees(), c.allRules, c.t) : null;
  if (reg && "fees" in reg) {
    terms = { fees: reg.fees };
    feeValues = reg.feeValues;
    const track = loadCma().tracks.find((t) => t.fundId === spec?.track);
    if (track && reg.feeValues.regBalance) d.facts.trackName = textFact(track.name, { source: reg.feeValues.regBalance.source, checked: reg.feeValues.regBalance.checked }, `שם המסלול ברשות שוק ההון (מסלול ${track.fundId}, ${track.companyName})`);
    if (reg.feeValues.regBalance) d.facts.trackFee = reg.feeValues.regBalance;
    if (reg.feeValues.regDeposit) d.facts.trackDepositFee = reg.feeValues.regDeposit;
  } else d.gaps.push(spec ? `fees:${c.id}` : "pensionTrack");
  const base: Bundle = { record, p05: c.p05, terms, feeValues, rules: Object.values(c.allRules), runDate: c.t };
  // the rules the visual reads: the forward relief and the pension ledger, for a low, a middle and a high salary and for the fund's insurance
  const probe: SignatureData = { ...d, bundles: { [c.id]: base } };
  const ids = new Set<string>();
  for (const salary of [4_000, 8_000, 12_000, 30_000, 60_000]) for (const insurancePct of [null, 0.5]) for (const years of [1, 10, 40]) pensionModel(probe, c.id, { salary, insurancePct, years })?.rules.forEach((r) => ids.add(r));
  ids.add("PF-13");
  d.bundles[c.id] = { ...base, rules: Object.values(c.allRules).filter((r) => ids.has(r.id)) };
  addFigures(d, c, [
    ["avgWage", "PEN-04", "average_wage"],
    ["employeePct", "PEN-03", "employee_pct"],
    ["employerPct", "PEN-03", "employer_pct"],
    ["severancePct", "PEN-03", "severance_pct"],
    ["creditPct", "TXP-01", "credit_pct"],
    ["threshold", "TXP-03", "threshold"],
    ["earlyAge", "PEN-26", "early_retirement_age"],
    ["retirementAge", "PEN-26", "retirement_age_men"],
    ["exemptAge", "TXK-09", "age"],
  ]);
  d.facts.returnPct = p05Value(c.p05, "A-01");
  d.facts.inflationPct = p05Value(c.p05, "A-02");
  d.facts.incomeP05 = p05Value(c.p05, "annual_income");
  // G-03 / PEN-OQ7: the pension a balance buys needs conversion factors; G-12: the insurance cost is entered by the person
  d.gaps.push("annuityFactors");
  if (c.id !== "provident-for-annuity") d.gaps.push("insuranceTables");
  return withRules(d, "PEN-03", "PEN-04", "PEN-26", "TXP-01", "TXP-02", "TXP-03", "TXP-04", "TXP-10", "PEN-15", c.id === "provident-for-annuity" ? "PEN-35" : "PEN-08");
}
