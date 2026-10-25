// Builds the data of one guide page at build time (design-spec 2): the wrapper record, its rule figures,
// the engine bundle and its first run on P-05, the checklist marks, the terms and the companies that offer it.
import { pending as pendingFormulaReleases, type P05Input } from "@finance-tool/engine";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { wrapperId as wrapperIdEnum, type ExposureRecord, type RuleRecord, type ValueObject, type WrapperId, type WrapperRecord } from "@finance-tool/schema";
import { buildHishtalmutTerms, loadExposures, regulatorAverageFees } from "./instruments.server";
import { loadChecklistRows, loadCma, loadCmaFees, loadFees, loadParameters, loadRules, loadTerms, loadWrappers, root, today, type ChecklistRow, type TermRow } from "./data.server";
import { runTimeline, type Bundle, type Timeline } from "./engine";
import { buildInstrumentBundle, familyOf, missingParts, rulesTouched, type NoGraph } from "./guide-signature-bundle.server";
import { buildSignatureData } from "./guide-signature.server";
import type { SignatureData } from "./guide-signature";
import { isClosedAudience } from "./guide-nav";
import { playbookWrappers } from "./playbook";
import { ruleFigure, weaker, type SiteValue, type Strength } from "./value";

export interface GuidePageData {
  record: WrapperRecord;
  name: string;
  lede: string | null;
  bundle: Bundle | null;
  initial: Timeline | null;
  /** Rule records the page cites anywhere, for the rule cards. */
  rules: Record<string, RuleRecord>;
  terms: TermRow[];
  /** How many wrappers the site knows: a term that names this many is shared by every product (the guide shows it under "מונחים כלליים"). */
  wrapperCount: number;
  termsById: Record<string, TermRow>;
  checklist: ChecklistRow[];
  dimensionNames: Record<string, string>;
  /** Marks from the record (regenerated from its rule_ids) and from the rules the first run read. */
  marks: Record<string, string>;
  /** `closed`: every track the company has under this product is for a sector's or a plant's workers (CMA target population, CAT-10), so it is not open to anyone (audit A86). */
  companies: { id: string; name: string; closed: boolean }[];
  /** The exposures whose record lists this wrapper among those that can hold them (audit A43). */
  exposures: { id: string; name: string }[];
  /** Whether the switching playbook (/switch/<wrapper>) has steps for this wrapper (audit A14). */
  hasPlaybook: boolean;
  /** Rule ids the record's exit sentence cites that have a Hebrew text, in the order the sentence names them (audit A22). */
  exitTextRules: string[];
  /** The data of this page's "what makes it different" visual (D29), or null when the wrapper has none and its timeline stays open. */
  signature: SignatureData | null;
  /** Why there is no graph, when there is none (copy: guideBlocks.noGraph). */
  noGraph: NoGraph | null;
  /** The record's formulas the engine does not compute yet, with the release number that brings each. */
  pendingFormulas: Record<string, string>;
  related: { href: string; label: string }[];
  today: string;
}

export type { NoGraph };

/** Every rule id a prose module names, found in its source (a name is kept only when a rule record has that id). */
function scanRuleIds(relPath: string, allRules: Record<string, RuleRecord>): string[] {
  let src = "";
  try {
    src = readFileSync(join(root, relPath), "utf8");
  } catch {
    return [];
  }
  const found = new Set<string>();
  for (const m of src.matchAll(/\b[A-Z0-9]{2,6}-[A-Z0-9]{1,5}\b/g)) if (allRules[m[0]]) found.add(m[0]);
  // "TXI OQ3" is written with a space in prose; the record id has a hyphen
  for (const m of src.matchAll(/\b([A-Z0-9]{2,6}) OQ(\d{1,3})\b/g)) if (allRules[`${m[1]}-OQ${m[2]}`]) found.add(`${m[1]}-OQ${m[2]}`);
  return [...found];
}

function collectRuleIds(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectRuleIds(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "rule_ids" && Array.isArray(v)) v.forEach((id) => typeof id === "string" && out.add(id));
      else collectRuleIds(v, out);
    }
  }
  return out;
}

export function buildGuidePage(id: string, extraRuleIds: string[] = [], extraTermIds: string[] = []): GuidePageData | null {
  const record = loadWrappers().find((w) => w.id === id);
  if (!record) return null;
  const allRules = loadRules();
  const parameters = loadParameters();
  const p05 = parameters.find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  const t = today();

  // ---- the engine bundle: provident from the provider's list fees (method §2.4; the illustrative run uses S47's list
  // fees); every other family from the instrument records P-05's `instruments` map names (method §2.4 "Instrument terms")
  let bundle: Bundle | null = null;
  let noGraph: NoGraph | null = null;
  const family = familyOf(record.id);
  const recordFormulas = [record.deposit_side_tax.formula, record.tax_during.formula, record.tax_at_exit.formula];
  const pendingFormulas: Record<string, string> = {};
  for (const f of recordFormulas) if (pendingFormulaReleases[f]) pendingFormulas[f] = /^R(\d+)/.exec(pendingFormulaReleases[f]!)?.[1] ?? "";
  if (family === "provident") {
    const snapshots = loadFees().filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list"));
    if (snapshots.length > 1) throw new Error(`${id}: ${snapshots.length} fee snapshots cover it; the guide timeline needs one (choose it in a site parameter)`);
    // The fees of the run: the provider's list fees, or, when none covers the wrapper and P-05 names a `track`, the
    // regulator's average actually charged on that track (method §2.4; labelled as an average, not a list price).
    let fees: { deposit: number; balance: number; direct: number } | null = null;
    let feeValues: Record<string, SiteValue> = {};
    let missing: string[] = [];
    const snap = snapshots[0];
    const line = (base: string) => snap?.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base);
    const balance = line("balance");
    const deposit = line("deposit");
    const direct = line("direct_expenses");
    const pct = (v: ValueObject) => (v.value as number) / 100;
    if (balance && deposit) {
      feeValues = { balance: { ...balance.rate }, deposit: { ...deposit.rate } };
      if (direct) feeValues.direct = { ...direct.rate };
      fees = { deposit: pct(deposit.rate), balance: pct(balance.rate), direct: direct ? pct(direct.rate) : 0 };
    } else {
      // a fee the list does not give comes from the regulator's average on the named track (labelled as such)
      const reg = regulatorAverageFees(id, p05.instruments?.[id], loadCmaFees(), allRules, t, { balance: !!balance, deposit: !!deposit });
      if (reg && "missing" in reg) missing = reg.missing;
      else if (reg) {
        feeValues = { ...reg.feeValues };
        if (balance) feeValues.balance = { ...balance.rate };
        if (deposit) feeValues.deposit = { ...deposit.rate };
        if (direct) feeValues.direct = { ...direct.rate };
        fees = { balance: balance ? pct(balance.rate) : reg.fees.balance, deposit: deposit ? pct(deposit.rate) : reg.fees.deposit, direct: direct ? pct(direct.rate) : 0 };
      } else {
        console.log(`[guide] ${id}: no timeline: ${snap ? `${snap.id} has no list ${balance ? "deposit" : "balance"} line for it` : "no list-fee snapshot in data/fees/ covers it"} and P-05 names no track`);
        noGraph = { kind: "missing", parts: ["tariff"] };
      }
    }
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
          noGraph = { kind: "stops", code: /G-\d+|OQ\d+/.exec(probe.message)?.[0] ?? null };
        } else {
          const touched = rulesTouched(draft);
          bundle = { ...draft, rules: Object.values(allRules).filter((r) => touched.has(r.id)) };
        }
      }
    }
    if (missing.length > 0) {
      for (const m of missing) console.log(`[guide] ${id}: no timeline: ${m}`);
      noGraph = { kind: "missing", parts: missingParts(missing) };
    }
  } else if (family) {
    const r = buildInstrumentBundle(record, family, p05, allRules, t);
    bundle = r.bundle;
    noGraph = r.noGraph;
  } else console.log(`[guide] ${id}: no timeline: no run for this wrapper`);
  if (!bundle) {
    // a formula the engine does not compute yet is the reason that names the release; missing data comes next
    if (Object.keys(pendingFormulas).length > 0) noGraph = { kind: "pending", formulas: Object.keys(pendingFormulas) };
    else if (!noGraph) noGraph = { kind: "none" };
  }
  const signature = buildSignatureData(id, bundle);
  const initial = bundle ? runTimeline(bundle, { entered: {}, age: null }) : null;
  if (initial?.kind === "failed") console.log(`[guide] ${id}: the first run stops (${initial.message})`);

  // ---- rules the page cites: the record's, the run's, the content's
  const cited = collectRuleIds(record);
  // the rules the exit sentence names: their Hebrew texts stand in for its English wording (audit A22)
  const exitTextRules = [...new Set(record.lawful_exit.text?.match(/\b[A-Z0-9]{2,6}-[A-Z0-9]{1,5}\b/g) ?? [])].filter((r) => !!allRules[r]?.text_he);
  exitTextRules.forEach((r) => cited.add(r));
  extraRuleIds.forEach((r) => cited.add(r));
  // rules the prose module cites (<RulesLine>, <RuleRef>, figure(...)): found in its source so the cards are not empty
  scanRuleIds(`site/app/content/guide/${id}.tsx`, allRules).forEach((r) => cited.add(r));
  bundle?.rules.forEach((r) => cited.add(r.id));
  // the rules the visual cites and the ones the other wrappers' runs it shows read (their number sheets list them)
  signature?.ruleIds.forEach((r) => cited.add(r));
  for (const b of Object.values(signature?.bundles ?? {})) b.rules.forEach((r) => cited.add(r.id));
  const rules: Record<string, RuleRecord> = {};
  for (const rid of cited) if (allRules[rid]) rules[rid] = allRules[rid]!;

  // ---- checklist marks: the record's (validated against its rule_ids) plus the rules the run read
  const marks: Record<string, string> = { ...record.dimensions };
  if (initial?.kind === "ok") for (const r of initial.rules) for (const d of allRules[r.id]?.dimensions ?? []) if (!(d in marks)) marks[d] = "covered";

  const checklist = loadChecklistRows();
  const dimensionNames = Object.fromEntries(checklist.map((r) => [r.id, r.name]));
  const all = loadTerms();
  const onPage = (row: TermRow) => row.wrapperIds.includes(id);
  const terms = all.filter(onPage);
  // A word can carry another sense in another product; the page's own sense wins, then the strongest.
  const termsById: Record<string, TermRow> = {};
  for (const row of [...all].sort((a, b) => Number(onPage(b)) - Number(onPage(a)))) if (!termsById[row.he]) termsById[row.he] = row;
  const lede = termsById[record.names.he[0]!]?.explanation ?? null;
  for (const key of Object.keys(termsById)) if (!onPage(termsById[key]!) && !extraTermIds.includes(key)) delete termsById[key];

  const cma = loadCma();
  const seen = new Map<string, { name: string; populations: string[] }>();
  for (const track of cma.tracks) {
    if (track.wrapperId !== id) continue;
    const c = seen.get(track.companyId) ?? { name: track.companyName, populations: [] };
    c.populations.push(track.targetPopulation);
    seen.set(track.companyId, c);
  }
  const collator = new Intl.Collator("he");
  const companies = [...seen.entries()].map(([cid, c]) => ({ id: cid, name: c.name, closed: isClosedAudience(c.populations) })).sort((a, b) => collator.compare(a.name, b.name));
  const exposures = loadExposures()
    .filter((e) => (e.wrapper_ids ?? []).includes(record.id))
    .map((e) => ({ id: e.id, name: e.names.he[0] ?? e.id }));

  const wrappers = loadWrappers();
  const related = record.transfer_routes
    .map((r) => r.to)
    .filter((to, i, a) => to !== id && a.indexOf(to) === i)
    .map((to) => wrappers.find((w) => w.id === to))
    .filter((w): w is WrapperRecord => !!w)
    .map((w) => ({ href: `/guide/${w.id}`, label: w.names.he[0]! }));

  return { record, name: record.names.he[0]!, lede, bundle, initial, rules, terms, wrapperCount: wrapperIdEnum.options.length, termsById, checklist, dimensionNames, marks, companies, exposures, hasPlaybook: playbookWrappers.includes(record.id), exitTextRules, signature, noGraph, pendingFormulas, related, today: t };
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

export interface ExposurePageData {
  record: ExposureRecord;
  name: string;
  lede: string | null;
  rules: Record<string, RuleRecord>;
  terms: TermRow[];
  termsById: Record<string, TermRow>;
  /**
   * Wrappers that can hold this exposure. `blockedBy` are the wrapper's own exit-tax blockers (its record's
   * `tax_at_exit.blocked_by`): only these make the card say the tax is unclear (audit A85). `openQuestions` are the open
   * questions the wrapper and the exposure both carry and the wrapper does not list as exit-tax blockers: some are tax questions that
   * do not block the run (TXI-OQ2, TXI-OQ14, TXI-OQ3), others are not tax questions (BANK-OQ8, MF-OQ4), so the card shows them in a neutral tag.
   */
  holders: { id: string; name: string; blockedBy: string[]; openQuestions: string[] }[];
  checklist: (ChecklistRow & { mark: "covered" | "na"; rules: string[] })[];
  dimensionNames: Record<string, string>;
  today: string;
}

export function buildExposurePage(id: string, extraTermIds: string[] = []): ExposurePageData | null {
  const record = loadExposures().find((e) => e.id === id);
  if (!record) return null;
  const allRules = loadRules();
  const wrappers = loadWrappers();
  const t = today();

  const cited = new Set<string>([...(record.rule_ids ?? []), ...(record.open_questions ?? [])]);
  scanRuleIds(`site/app/content/exposure/${id}.tsx`, allRules).forEach((r) => cited.add(r));
  const holders = (record.wrapper_ids ?? [])
    .map((wid) => wrappers.find((w) => w.id === wid))
    .filter((w): w is WrapperRecord => !!w)
    .map((w) => {
      const blockedBy = [...new Set(w.tax_at_exit.blocked_by)];
      const openQuestions = (record.open_questions ?? []).filter((q) => w.open_questions.includes(q) && !blockedBy.includes(q));
      [...blockedBy, ...openQuestions].forEach((q) => cited.add(q));
      return { id: w.id, name: w.names.he[0]!, blockedBy, openQuestions };
    });
  const rules: Record<string, RuleRecord> = {};
  for (const rid of cited) if (allRules[rid]) rules[rid] = allRules[rid]!;

  // marks: `covered` when a rule the exposure cites carries the dimension; the rest stays unmarked
  const own = (record.rule_ids ?? []).map((r) => allRules[r]).filter((r): r is RuleRecord => !!r);
  const checklist = loadChecklistRows().map((row) => {
    const carrying = own.filter((r) => r.dimensions.includes(row.id)).map((r) => r.id);
    return { ...row, mark: carrying.length > 0 ? ("covered" as const) : ("na" as const), rules: carrying };
  });

  const all = loadTerms();
  const onPage = (row: TermRow) => row.exposureIds.includes(id);
  const terms = all.filter(onPage);
  const termsById: Record<string, TermRow> = {};
  for (const row of [...all].sort((a, b) => Number(onPage(b)) - Number(onPage(a)))) if (!termsById[row.he]) termsById[row.he] = row;
  for (const key of Object.keys(termsById)) if (!onPage(termsById[key]!) && !extraTermIds.includes(key)) delete termsById[key];
  const name = record.names.he[0] ?? record.id;
  // the exposure record's own one-line description, else the glossary line (F: one_line_he)
  const lede = record.one_line_he ?? termsById[name]?.explanation ?? all.find((r) => r.he === name)?.explanation ?? null;
  return { record, name, lede, rules, terms, termsById, holders, checklist, dimensionNames: Object.fromEntries(checklist.map((r) => [r.id, r.name])), today: t };
}
