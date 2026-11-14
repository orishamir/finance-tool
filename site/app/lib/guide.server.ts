// Builds the data of one guide page at build time (design-spec 2): the wrapper record, its rule figures,
// the engine bundle and its first run on P-05, the terms and the companies that offer it.
import { breakCount, listFeeRange, oneYearDeposits, pending as pendingFormulaReleases, type P05Input } from "@finance-tool/engine";
import { exposurePath, guidePath } from "./site-paths";
import { join } from "node:path";
import { companyTermRule, isSecurity, type DepositTerms, type ExposureRecord, type RuleRecord, type ProductRecord } from "@finance-tool/schema";
import { buildHishtalmutTerms, exposureFolds, loadExposures } from "./instruments.server";
import { minDiscountMonths, pricedLine, providentLists, providentTerms } from "./compare.server";
import { shortName } from "./providers";
import { guideBlocks, guideSignature, r4catalogue, signatureFacts } from "../copy";
import { collectRuleIds, loadChecklistRows, loadCma, loadCmaFees, loadFees, loadParameters, loadRules, loadTerms, loadProducts, pointedRecords, root, today, type TermRow } from "./data.server";
import { runTimeline, type Bundle, type Timeline } from "./engine";
import { guideInstrumentBundle, familyOf, rulesTouched } from "./guide-signature-bundle.server";
import { breakFact, breakInput, buildSignatureData } from "./guide-signature.server";
import { loadDepositTerms } from "./instruments.server";
import { loadInstitutionRegistry } from "./institutions.server";
import { depositName, exitNameWords, exitPointsOf, exitWords } from "./deposit-kind";
import { lumpSumEntered, lumpSumIds, type BreakTerms, type SignatureData } from "./guide-signature";
import { cmaFeeValue, computed, ownBy, ruleFigure, staleCma, weaker, type SiteValue, type Strength } from "./value";
import { readTextCached } from "./read-cache.server";
import { heCollator } from "./format";

export interface GuidePageData {
  record: ProductRecord;
  name: string;
  lede: string | null;
  bundle: Bundle | null;
  initial: Timeline | null;
  /** Rule records the page cites anywhere, for the rule cards. */
  rules: Record<string, RuleRecord>;
  /** The records those cards point at that the page does not cite (`pointedRecords`): only chips and cards read them. */
  pointed: Record<string, RuleRecord>;
  termsById: Record<string, TermRow>;
  dimensionNames: Record<string, string>;
  companies: { id: string; name: string }[];
  /** The exposures whose record lists this wrapper among those that can hold them, each with its page (D6). */
  exposures: { id: string; name: string; href: string }[];
  /** Rule ids the record's exit sentence cites that have a Hebrew text, in the order the sentence names them. */
  exitTextRules: string[];
  /** The data of this page's "what makes it different" visual (D29), or null when the wrapper has none and its timeline stays open. */
  signature: SignatureData | null;
  /** The record's formulas the engine does not compute yet, with the release number that brings each. */
  pendingFormulas: Record<string, string>;
  related: { href: string; label: string }[];
  /** What the regulator reports is charged on the tracks (F-64), on a guide whose cap alone would read as the price. Null elsewhere. */
  feeRange: { low: SiteValue; high: SiteValue; tracks: SiteValue } | null;
  /** What the collected deposits say about breaking them (F-104), on the bank-deposit guide. Null elsewhere. */
  breakTerms: BreakTerms | null;
  /**
   * The managers' list fees for each base, over every collected manager (F-105), on a provident wrapper with more than one list collected:
   * the lowest and the highest, how many managers, and how many of them print the legal cap. Null elsewhere.
   */
  listRange: Partial<Record<"balance" | "deposit", ListRange>> | null;
  /**
   * A security's wrapper (D6): the first of its record's `held_in`, the account its run and its page sit in, with
   * the rules that say it is held there. Null for a wrapper.
   */
  heldIn: { id: string; name: string; ruleIds: string[] } | null;
  /** On a wrapper's page, the securities whose record names it in `held_in` (D6), each with its own page. */
  securities: { href: string; label: string }[];
  today: string;
}

export interface ListRange {
  low: SiteValue;
  managers: SiteValue;
  /** How many of them print the legal cap of the record's `fee_caps` for this base. */
  atCap: SiteValue;
  /**
   * What the lowest printed rate is, as the run prices it (A-19, D83, D56): a discount for PF-13's period at one manager at least, an offer
   * (conditional on a document not published) at every manager that prints it, or a plain rate that holds for the whole run at one at
   * least. The page says "during the discount" only for a discount.
   */
  lowKind: "discount" | "offer" | "plain";
  /** The shortest a discount may last (PF-13), said under the table when a lowest rate is a discount. */
  discountYears?: SiteValue;
}

/**
 * F-105: a provident wrapper's list fees over every collected manager, for each base, so the page never shows one company's list as the
 * product's price (former ground rule 2). Each figure is computed over the managers' own figures, which its sheet lists.
 */
function managersFeeRange(record: ProductRecord, t: string): GuidePageData["listRange"] {
  const lists = providentLists(record.id, loadFees());
  if (lists.length < 2) return null;
  const out: NonNullable<GuidePageData["listRange"]> = {};
  const allRules = loadRules();
  const pf13 = allRules["PF-13"];
  const discountYears = pf13 ? ruleFigure(pf13, "min_discount_years", t) : null;
  const minMonths = minDiscountMonths(allRules);
  const about = guideBlocks.listRange.about;
  for (const base of ["balance", "deposit"] as const) {
    const cap = record.fee_caps[base] as SiteValue | undefined;
    const inputs = Object.fromEntries(lists.map((l) => [shortName(l.snap.id, l.snap.provider.name_he), ownBy({ ...l[base] } as SiteValue, shortName(l.snap.id, l.snap.provider.name_he))]));
    const range = listFeeRange(lists.map((l) => l[base].value as number), typeof cap?.value === "number" ? cap.value : null);
    if (!range) continue;
    const unit = lists[0]![base].unit;
    // the lowest rate's kind among the managers that print it: a plain rate at any of them is plain; else a discount at any is a discount
    const kinds = lists.filter((l) => l[base].value === range.lo).map((l) => pricedLine(l.lines[base], minMonths));
    const lowKind = kinds.some((k) => !k.discounted && !k.offer) ? "plain" : kinds.some((k) => k.discounted) ? "discount" : "offer";
    out[base] = {
      lowKind,
      low: computed(range.lo, unit, "F-105", inputs, { today: t, about: about.low }),
      managers: computed(range.count, "count", "F-105", inputs, { today: t, about: about.managers }),
      atCap: computed(range.atCap, "count", "F-105", { ...inputs, ...(cap ? { [about.capInput]: cap } : {}) }, { today: t, about: about.atCap }),
      ...(discountYears ? { discountYears } : {}),
    };
  }
  return out;
}

/** A deposit's exit-point column as an input of F-104's count: the bank's own term about its own product (D31), in words. */
function exitInput(r: DepositTerms, name: string): SiteValue {
  const value = exitWords(exitPointsOf(r.exit_points));
  // the record's source and date, but not the break column's rules, and its conditions only on a deposit with exits, where they say how the
  // money comes out at them (Hapoalim Sprint, Mizrahi-Tefahot 287); on one with none they are about something else, such as where it is
  // opened (Discount 0122's "אין" carried "פותחים רק בסניף או בטלבנק")
  const when = r.exit_points.exists ? r.conditions_he ?? "" : "";
  return ownBy({ ...breakFact(r), value, rule_ids: [], notes: when }, name);
}

/**
 * The sheet's name of each deposit: the bank, the deposit's name in its table, and, where the name repeats at the bank, its code or else
 * its kind (rate, linkage, exit points), so that every deposit counted stands on its own line (six of Discount's one-year rows
 * share "פקדון לשנה", three of Hapoalim's "פיקדון לשנה").
 */
export function depositSheetNames(records: DepositTerms[]): Map<string, string> {
  const words = r4catalogue.depositKind;
  const base = (r: DepositTerms) => `${shortName(r.bank, r.bank)} · ${depositName(r)}`;
  const count = new Map<string, number>();
  for (const r of records) count.set(base(r), (count.get(base(r)) ?? 0) + 1);
  const out = new Map<string, string>();
  const used = new Set<string>();
  for (const r of records) {
    let key = base(r);
    if ((count.get(key) ?? 0) > 1) {
      const code = /-(\d{3,4})$/.exec(r.id)?.[1];
      const exits = r.exit_points.exists ? exitNameWords(exitPointsOf(r.exit_points)) : null;
      const kind = [words[r.rate_type], r.linkage === "none" ? null : words[r.linkage], exits].filter(Boolean).join(", ");
      key = `${key} · ${code ?? kind}`;
    }
    // a name still taken gets a number, replacing the last one tried ("x (3)", never "x (2) (3)")
    const stem = key;
    for (let n = 2; used.has(key); n++) key = `${stem} (${n})`;
    used.add(key);
    out.set(r.id, key);
  }
  return out;
}

/** F-104 over every collected one-year deposit record, counted over the banks; null when none was collected. */
export function depositBreakTerms(t: string): BreakTerms | null {
  const all = loadDepositTerms();
  const result = breakCount(all);
  if (!result) return null;
  // the records F-104 counted, each on a sheet line
  const records = oneYearDeposits(all);
  // each deposit's own column, on a line of its own named by its bank, its name in the bank's table and, where that repeats, its code
  const sheet = depositSheetNames(records);
  const inputsOf = (list: typeof records, input: (r: DepositTerms, name: string) => SiteValue) =>
    Object.fromEntries(list.map((r) => [sheet.get(r.id)!, input(r, shortName(r.bank, r.bank))]));
  const breaks = inputsOf(records, breakInput);
  const about = guideSignature.deposit.breakAbout;
  const make = (value: number, words: string, inputs = breaks) => computed(value, "count", "F-104", inputs, { today: t, about: words });
  // the bank's full name (not "דיסקונט", which also reads as Mercantile Discount)
  const registry = new Map(loadInstitutionRegistry().map((i) => [i.id, i.name_he]));
  const nameOf = (id: string) => registry.get(id) ?? shortName(id, id);
  return {
    deposits: make(result.deposits, about.deposits),
    banks: make(result.banks, about.banks),
    lockedBanks: make(result.lockedBanks, about.lockedBanks),
    // the banks none of whose deposits can be broken (the break column) that have a deposit with exit points (the exit column): both columns,
    // each deposit's exits on a line of its own beside its break term
    lockedBanksWithExits: make(result.lockedBanksWithExits, about.lockedBanksWithExits, { ...breaks, ...Object.fromEntries(records.map((r) => [`${sheet.get(r.id)!} · ${guideSignature.deposit.exitsInput}`, exitInput(r, shortName(r.bank, r.bank))])) }),
    breakable: result.breakable.map((b) => {
      const mine = records.filter((r) => r.bank === b.bank);
      const own = inputsOf(mine, breakInput);
      const rules = [...new Set(mine.flatMap((r) => r.break.rule_ids))];
      return { id: b.bank, name: nameOf(b.bank), deposits: make(b.deposits, about.bankDeposits, own), withPenalty: make(b.withPenalty, about.withPenalty, own), free: make(b.free, about.free, own), rules };
    }),
  };
}

/** Every rule id a prose module names, found in its source (a name is kept only when a rule record has that id). */
function scanRuleIds(relPath: string, allRules: Record<string, RuleRecord>): string[] {
  let src = "";
  try {
    src = readTextCached(join(root, relPath));
  } catch {
    return [];
  }
  const found = new Set<string>();
  for (const m of src.matchAll(/\b[A-Z0-9]{2,6}-[A-Z0-9]{1,5}\b/g)) if (allRules[m[0]]) found.add(m[0]);
  // "TXI OQ3" is written with a space in prose; the record id has a hyphen
  for (const m of src.matchAll(/\b([A-Z0-9]{2,6}) OQ(\d{1,3})\b/g)) if (allRules[`${m[1]}-OQ${m[2]}`]) found.add(`${m[1]}-OQ${m[2]}`);
  return [...found];
}


/** The lowest and highest fee the regulator reports on the wrapper's tracks, without self-directed tracks, which have a guide of their own (F-64). */
function reportedFeeRange(id: string, t: string): GuidePageData["feeRange"] {
  const fees = loadCmaFees();
  const reported = loadCma()
    .tracks.filter((x) => x.wrapperId === id && !x.selfDirected)
    .flatMap((x) => {
      const f = fees.get(x.fundId)?.balance;
      return f && typeof f.value === "number" ? [cmaFeeValue(f, t)] : [];
    })
    .sort((a, b) => (a.value as number) - (b.value as number));
  if (reported.length < 2) return null;
  // the count rests on the regulator's monthly file the fees come from: its month, with the file's link and the day it was read
  const cma = loadCma();
  const file = cma.files.find((f) => f.source.url === reported[0]!.source.url);
  const report: SiteValue = file ? { ...cma.periodValue, value: file.period, source: file.source, checked: file.checked, effective_from: null, stale: staleCma(file.period, t) } : cma.periodValue;
  return { low: reported[0]!, high: reported.at(-1)!, tracks: computed(reported.length, "count", "F-64", { [signatureFacts.cmaFile]: report }, { today: t, about: signatureFacts.trackCount }) };
}

export function buildGuidePage(id: string, extraRuleIds: string[] = [], extraTermIds: string[] = [], relatedIds?: readonly string[]): GuidePageData | null {
  const record = loadProducts().find((w) => w.id === id);
  if (!record) return null;
  const allRules = loadRules();
  const parameters = loadParameters();
  const p05 = parameters.find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  const t = today();

  // ---- the engine bundle: provident from the provider's list fees (method §2.4; the illustrative run uses S47's list
  // fees); every other family from the instrument records P-05's `instruments` map names (method §2.4 "Instrument terms")
  let bundle: Bundle | null = null;
  const family = familyOf(record.id);
  const recordFormulas = [record.deposit_side_tax.formula, record.tax_during.formula, record.tax_at_exit.formula];
  const pendingFormulas: Record<string, string> = {};
  for (const f of recordFormulas) if (pendingFormulaReleases[f]) pendingFormulas[f] = /^R(\d+)/.exec(pendingFormulaReleases[f]!)?.[1] ?? "";
  if (family === "provident") {
    // The fees of the run: the provider's list fees, or, when none covers the wrapper and P-05 names a `track`, the regulator's average
    // actually charged on that track (method §2.4). The comparison's own function, so a list fee carries its company (D31) here too.
    const r = providentTerms(id, loadFees(), p05.instruments?.[id], allRules, t);
    const feeValues: Record<string, SiteValue> = { ...r.feeValues };
    let missing: string[] = [...r.missing];
    const fees = r.terms?.fees ?? null;
    if (fees) {
      const terms: Bundle["terms"] = { fees };
      if (id === "keren-hishtalmut") {
        const h = buildHishtalmutTerms(id, p05.instruments?.[id], p05);
        if ("missing" in h) missing = h.missing;
        else {
          terms.hishtalmut = h.hishtalmut;
          Object.assign(feeValues, h.feeValues);
        }
      }
      if (missing.length === 0) {
        const draft: Bundle = { record, p05, terms, feeValues, rules: Object.values(allRules), runDate: t };
        const probe = runTimeline(draft, { entered: {}, age: null });
        if (probe.kind === "failed") {
          console.log(`[guide] ${id}: no timeline: the run stops (${probe.message})`);
        } else {
          const touched = rulesTouched(draft);
          // F-80: with several managers' lists collected the terms block names the pick and how many were compared
          const lists = r.pick ? providentLists(id, loadFees()) : [];
          const inputs = Object.fromEntries(lists.map((l) => [shortName(l.snap.id, l.snap.provider.name_he), ownBy({ ...l.balance } as SiteValue, shortName(l.snap.id, l.snap.provider.name_he))]));
          const nameOf = (pid: string) => { const l = lists.find((x) => x.snap.id === pid); return l ? shortName(l.snap.id, l.snap.provider.name_he) : pid; };
          const tied = r.pick?.tied ? { names: r.pick.tied.map(nameOf) } : undefined;
          const pick = r.pick ? { kind: "manager" as const, id: r.pick.id, count: computed(r.pick.count, "count", "F-80", inputs, { today: t, about: guideBlocks.terms.pick.managerCount }), ...(tied ? { tied } : {}) } : undefined;
          bundle = { ...draft, rules: Object.values(allRules).filter((r) => touched.has(r.id)), ...(pick ? { pick } : {}) };
        }
      }
    }
    for (const m of missing) console.log(`[guide] ${id}: no timeline: ${m}`);
  } else if (family) {
    const r = guideInstrumentBundle(record, family, p05, allRules, t);
    bundle = r.bundle;
  } else console.log(`[guide] ${id}: no timeline: no run for this wrapper`);
  const signature = buildSignatureData(id, bundle);
  const initial = bundle ? runTimeline(bundle, { entered: lumpSumIds.includes(id) ? { ...lumpSumEntered } : {}, age: null }) : null;
  if (initial?.kind === "failed") console.log(`[guide] ${id}: the first run stops (${initial.message})`);

  // ---- rules the page cites: the record's, the run's, the content's
  const cited = collectRuleIds(record);
  // the rules the exit sentence names: their Hebrew texts stand in for its English wording
  const exitTextRules = [...new Set(record.lawful_exit.text?.match(/\b[A-Z0-9]{2,6}-[A-Z0-9]{1,5}\b/g) ?? [])].filter((r) => !!allRules[r]?.text_he);
  exitTextRules.forEach((r) => cited.add(r));
  extraRuleIds.forEach((r) => cited.add(r));
  // the companies' own terms the record names where a property is each company's (D30): their records give the guide's "תלוי בחברה" links
  for (const refs of Object.values(record.company_terms ?? {})) refs.forEach((r) => cited.add(companyTermRule(r)));
  // rules the prose module cites (<RulesLine>, <RuleRef>, figure(...)): found in its source so the cards are not empty
  scanRuleIds(`site/app/content/guide/${id}.tsx`, allRules).forEach((r) => cited.add(r));
  bundle?.rules.forEach((r) => cited.add(r.id));
  // the rules the visual cites and the ones the other wrappers' runs it shows read (their number sheets list them)
  signature?.ruleIds.forEach((r) => cited.add(r));
  for (const b of Object.values(signature?.bundles ?? {})) b.rules.forEach((r) => cited.add(r.id));
  // the managers' range under the fee table (F-105): a lowest rate that is a discount says its period and when it can end earlier (D83)
  const listRange = family === "provident" ? managersFeeRange(record, t) : null;
  if (Object.values(listRange ?? {}).some((r) => r.lowKind === "discount")) ["PF-13", "PF-14"].forEach((r) => cited.add(r));
  const rules: Record<string, RuleRecord> = {};
  for (const rid of cited) if (allRules[rid]) rules[rid] = allRules[rid]!;

  const dimensionNames = Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name]));
  const all = loadTerms();
  const onPage = (row: TermRow) => row.wrapperIds.includes(id);
  // A word can carry another sense in another product; the page's own sense wins, then the strongest.
  const termsById: Record<string, TermRow> = {};
  for (const row of [...all].sort((a, b) => Number(onPage(b)) - Number(onPage(a)))) if (!termsById[row.he]) termsById[row.he] = row;
  const lede = termsById[record.names.he[0]!]?.explanation ?? null;
  for (const key of Object.keys(termsById)) if (!onPage(termsById[key]!) && !extraTermIds.includes(key)) delete termsById[key];

  const cma = loadCma();
  const seen = new Map<string, string>();
  // a self-directed fund is its own product (IRA-03): it names its company on the self-directed guide, not on its regulator type's
  for (const track of cma.tracks) if ((track.selfDirected ?? track.wrapperId) === id && !seen.has(track.companyId)) seen.set(track.companyId, track.companyName);
  const companies = [...seen.entries()].map(([cid, name]) => ({ id: cid, name })).sort((a, b) => heCollator.compare(a.name, b.name));
  const folds = exposureFolds();
  const exposuresHeld = loadExposures()
    .filter((e) => (e.wrapper_ids ?? []).includes(record.id))
    .map((e) => ({ id: e.id, name: e.names.he[0] ?? e.id, href: folds[e.id] ? guidePath(folds[e.id]!) : exposurePath(e.id) }));

  const wrappers = loadProducts();
  const related = (relatedIds ?? record.transfer_routes.map((r) => r.to))
    .filter((to, i, a) => to !== id && a.indexOf(to) === i)
    .map((to) => wrappers.find((w) => w.id === to))
    .filter((w): w is ProductRecord => !!w)
    .map((w) => ({ href: guidePath(w.id), label: w.names.he[0]! }));
  const account = isSecurity(record) ? wrappers.find((w) => w.id === record.held_in.wrapper_ids[0]) : undefined;
  const heldIn = isSecurity(record) && account ? { id: account.id, name: account.names.he[0]!, ruleIds: record.held_in.rule_ids } : null;
  const securities = wrappers.filter((w) => isSecurity(w) && w.held_in.wrapper_ids.includes(record.id as never)).map((w) => ({ href: guidePath(w.id), label: w.names.he[0]! }));
  // an exposure that is this page, or a security the row above already links, is not linked twice
  const exposures = exposuresHeld.filter((e) => e.href !== guidePath(record.id) && !securities.some((x) => x.href === e.href));

  // what members paid on average, by track (F-64): on the study fund and the provident fund for investing, beside the documents' rates
  const feeRange = id === "keren-hishtalmut" || id === "kupat-gemel-lehashkaa" ? reportedFeeRange(id, t) : null;
  const breakTerms = id === "bank-deposit" ? depositBreakTerms(t) : null;
  // the break rules of each bank the prose links to (its records' own), so each link opens
  for (const r of breakTerms?.breakable.flatMap((b) => b.rules) ?? []) if (allRules[r]) rules[r] = allRules[r]!;

  return { record, name: record.names.he[0]!, lede, bundle, initial, rules, pointed: pointedRecords(rules, allRules), heldIn, securities, termsById, dimensionNames, companies, exposures, exitTextRules, signature, pendingFormulas, related, feeRange, listRange, breakTerms, today: t };
}

export { familyOf };

/** The weakest strength among the cited rules that carry a dimension, and those rules' IDs. */
export function dimensionSupport(dim: string, rules: Record<string, RuleRecord>): { weak: Strength | null; rules: string[] } {
  const carrying = Object.values(rules).filter((r) => r.dimensions.includes(dim));
  let best: Strength | null = null;
  for (const r of carrying) {
    const s: Strength = r.strength;
    if (best === null) best = s;
    else best = weaker(best, s) === best ? best : best; // keep the weakest? no: show the tag only when every carrying rule is weak
  }
  const allWeak = carrying.length > 0 && carrying.every((r) => r.strength === "institution" || r.strength === "secondary");
  return { weak: allWeak ? (carrying.some((r) => r.strength === "secondary") ? "secondary" : "institution") : null, rules: carrying.map((r) => r.id) };
}

export function figureOf(rules: Record<string, RuleRecord>, today: string) {
  return (ruleId: string, name: string): SiteValue | null => {
    const r = rules[ruleId];
    return r ? ruleFigure(r, name, today) : null;
  };
}

export type { P05Input };

// ---------------------------------------------------------------- exposure pages (flows 6.6)

export interface BlockGroup { kind: "tax" | "annuity" | "other"; ids: string[] }

/** A product's exit blockers by what they leave open, so the tag says it: a tax question (TX…), the annuity's conversion factors
 *  (PEN OQ7, PEN OQ19), or anything else not computed yet. */
export function blockGroups(ids: readonly string[]): BlockGroup[] {
  const kindOf = (q: string) => (/^TX/.test(q) ? "tax" : /^PEN[ -]OQ(7|19)$/.test(q) ? "annuity" : "other");
  return (["annuity", "tax", "other"] as const).map((kind) => ({ kind, ids: ids.filter((q) => kindOf(q) === kind) })).filter((g) => g.ids.length > 0);
}

export interface ExposurePageData {
  record: ExposureRecord;
  name: string;
  lede: string | null;
  rules: Record<string, RuleRecord>;
  /** The records those cards point at that the page does not cite (`pointedRecords`): only chips and cards read them. */
  pointed: Record<string, RuleRecord>;
  termsById: Record<string, TermRow>;
  /**
   * Wrappers that can hold this exposure. `blockedBy` are the wrapper's own exit-tax blockers (its record's
   * `tax_at_exit.blocked_by`): only these make the card say the tax is unclear. `openQuestions` are the open
   * questions the wrapper and the exposure both carry and the wrapper does not list as exit-tax blockers: some are tax questions that
   * do not block the run (TXI-OQ14, TXI-OQ3), others are not tax questions (BANK-OQ8), so the card shows them in a neutral tag.
   */
  holders: { id: string; name: string; blockedBy: string[]; /** `blockedBy` by what it leaves open, for the tag (`blockGroups`). */ blocks: BlockGroup[]; openQuestions: string[] }[];
  dimensionNames: Record<string, string>;
  today: string;
}

export function buildExposurePage(id: string, extraTermIds: string[] = []): ExposurePageData | null {
  const record = loadExposures().find((e) => e.id === id);
  if (!record) return null;
  const allRules = loadRules();
  const wrappers = loadProducts();
  const t = today();

  const cited = new Set<string>([...(record.rule_ids ?? []), ...(record.open_questions ?? [])]);
  scanRuleIds(`site/app/content/exposure/${id}.tsx`, allRules).forEach((r) => cited.add(r));
  const holders = (record.wrapper_ids ?? [])
    .map((wid) => wrappers.find((w) => w.id === wid))
    .filter((w): w is ProductRecord => !!w)
    .map((w) => {
      const blockedBy = [...new Set(w.tax_at_exit.blocked_by)];
      const openQuestions = (record.open_questions ?? []).filter((q) => w.open_questions.includes(q) && !blockedBy.includes(q));
      [...blockedBy, ...openQuestions].forEach((q) => cited.add(q));
      return { id: w.id, name: w.names.he[0]!, blockedBy, blocks: blockGroups(blockedBy), openQuestions };
    });
  const rules: Record<string, RuleRecord> = {};
  for (const rid of cited) if (allRules[rid]) rules[rid] = allRules[rid]!;

  const all = loadTerms();
  const onPage = (row: TermRow) => row.exposureIds.includes(id);
  const termsById: Record<string, TermRow> = {};
  for (const row of [...all].sort((a, b) => Number(onPage(b)) - Number(onPage(a)))) if (!termsById[row.he]) termsById[row.he] = row;
  for (const key of Object.keys(termsById)) if (!onPage(termsById[key]!) && !extraTermIds.includes(key)) delete termsById[key];
  const name = record.names.he[0] ?? record.id;
  // the exposure record's own one-line description, else the glossary line (F: one_line_he)
  const lede = record.one_line_he ?? termsById[name]?.explanation ?? all.find((r) => r.he === name)?.explanation ?? null;
  return { record, name, lede, rules, pointed: pointedRecords(rules, allRules), termsById, holders, dimensionNames: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: t };
}
