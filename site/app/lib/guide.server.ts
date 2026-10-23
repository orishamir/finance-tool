// Builds the data of one guide page at build time (design-spec 2): the wrapper record, its rule figures,
// the engine bundle and its first run on P-05, the checklist marks, the terms and the companies that offer it.
import type { P05Input } from "@finance-tool/engine";
import type { RuleRecord, ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import { loadChecklistRows, loadCma, loadFees, loadParameters, loadRules, loadTerms, loadWrappers, today, type ChecklistRow, type TermRow } from "./data.server";
import { runTimeline, type Bundle, type Timeline } from "./engine";
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
  termsById: Record<string, TermRow>;
  checklist: ChecklistRow[];
  dimensionNames: Record<string, string>;
  /** Marks from the record (regenerated from its rule_ids) and from the rules the first run read. */
  marks: Record<string, string>;
  companies: { id: string; name: string }[];
  related: { href: string; label: string }[];
  today: string;
}

/** The rules a run may read, found by running the engine over the profiles that change its path. */
function rulesTouched(bundle: Bundle): Set<string> {
  const ids = new Set<string>();
  for (const age of [null, 65]) {
    const t = runTimeline(bundle, { entered: {}, age });
    if (t.kind === "ok") t.rules.forEach((r) => ids.add(r.id));
  }
  return ids;
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

  // ---- the engine bundle: list fees from data/fees/ (method §2.4; the illustrative run uses S47's list fees)
  let bundle: Bundle | null = null;
  const snapshots = loadFees().filter((f) => f.lines.some((l) => l.applies_to.includes(id) && l.level === "list"));
  if (snapshots.length > 1) throw new Error(`${id}: ${snapshots.length} fee snapshots cover it; the guide timeline needs one (choose it in a site parameter)`);
  const family = familyOf(record.id);
  if (snapshots.length === 1 && family === "provident") {
    const snap = snapshots[0]!;
    const line = (base: string) => snap.lines.find((l) => l.applies_to.includes(id) && l.level === "list" && l.base === base);
    const balance = line("balance");
    const deposit = line("deposit");
    const direct = line("direct_expenses");
    if (balance && deposit) {
      const feeValues: Record<string, SiteValue> = { balance: { ...balance.rate }, deposit: { ...deposit.rate } };
      if (direct) feeValues.direct = { ...direct.rate };
      const pct = (v: ValueObject) => (v.value as number) / 100;
      const terms = { fees: { deposit: pct(deposit.rate), balance: pct(balance.rate), direct: direct ? pct(direct.rate) : 0 } };
      const draft: Bundle = { record, p05, terms, feeValues, rules: Object.values(allRules), runDate: t };
      const touched = rulesTouched(draft);
      bundle = { ...draft, rules: Object.values(allRules).filter((r) => touched.has(r.id)) };
    }
  }
  const initial = bundle ? runTimeline(bundle, { entered: {}, age: null }) : null;

  // ---- rules the page cites: the record's, the run's, the content's
  const cited = collectRuleIds(record);
  extraRuleIds.forEach((r) => cited.add(r));
  bundle?.rules.forEach((r) => cited.add(r.id));
  const rules: Record<string, RuleRecord> = {};
  for (const rid of cited) if (allRules[rid]) rules[rid] = allRules[rid]!;

  // ---- checklist marks: the record's (validated against its rule_ids) plus the rules the run read
  const marks: Record<string, string> = { ...record.dimensions };
  if (initial?.kind === "ok") for (const r of initial.rules) for (const d of allRules[r.id]?.dimensions ?? []) if (!(d in marks)) marks[d] = "covered";

  const checklist = loadChecklistRows();
  const dimensionNames = Object.fromEntries(checklist.map((r) => [r.id, r.name]));
  const all = loadTerms();
  const onPage = (row: TermRow) => row.where.includes(`guide:${id}`);
  const terms = all.filter(onPage);
  // A word can carry another sense in another product; the page's own sense wins, then the strongest.
  const termsById: Record<string, TermRow> = {};
  for (const row of [...all].sort((a, b) => Number(onPage(b)) - Number(onPage(a)))) if (!termsById[row.he]) termsById[row.he] = row;
  const lede = termsById[record.names.he[0]!]?.explanation ?? null;
  for (const key of Object.keys(termsById)) if (!onPage(termsById[key]!) && !extraTermIds.includes(key)) delete termsById[key];

  const cma = loadCma();
  const seen = new Map<string, string>();
  for (const track of cma.tracks) if (track.wrapperId === id) seen.set(track.companyId, track.companyName);
  const collator = new Intl.Collator("he");
  const companies = [...seen.entries()].map(([cid, name]) => ({ id: cid, name })).sort((a, b) => collator.compare(a.name, b.name));

  const wrappers = loadWrappers();
  const related = record.transfer_routes
    .map((r) => r.to)
    .filter((to, i, a) => to !== id && a.indexOf(to) === i)
    .map((to) => wrappers.find((w) => w.id === to))
    .filter((w): w is WrapperRecord => !!w)
    .map((w) => ({ href: `/guide/${w.id}`, label: w.names.he[0]! }));

  return { record, name: record.names.he[0]!, lede, bundle, initial, rules, terms, termsById, checklist, dimensionNames, marks, companies, related, today: t };
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
