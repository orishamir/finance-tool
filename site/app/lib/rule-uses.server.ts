// Where each rule is used (research/knowledge/2026-10-24-synthesis.md §3.4): the pages of the site that cite it, whether the
// calculation engine reads it, which data collections reference it, and a score that orders rules inside a group.
// Computed once per build from the source files themselves (a quoted id in content/, routes/, components/, a few lib/ files),
// so a page that starts citing a rule shows up here with no table to maintain.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { RuleRecord } from "@finance-tool/schema";
import { guideIndex, idle, r2, r3fees, r3holdings, r3transfer, r3workbench, r4playbook, r4workbench, companies as companiesCopy } from "../copy";
import { loadExposures } from "./instruments.server";
import { loadRules, loadWrappers, root } from "./data.server";
import { fileProducts, commonRulesFile, shelfOf, tier2RuleFiles, type ShelfId } from "./rule-shelves";
import { playbookWrapperIds } from "./playbook.server";
import { providerWrapperIds } from "./providers.server";
import { workbenchWrapperIds } from "./workbench.server";

export interface RuleUsePage {
  href: string;
  label: string;
}

export interface RuleUse {
  pages: RuleUsePage[];
  engine: boolean;
  /** Collection name → number of records that cite the rule (wrappers also appear in `pages` as their guide page). */
  collections: Record<string, number>;
  score: number;
}

/** The shape the rule card takes (`RuleUses` in provenance.tsx). */
export type RuleUsesSlim = Record<string, { pages: RuleUsePage[]; engine: boolean }>;

const empty: RuleUse = { pages: [], engine: false, collections: {}, score: 0 };

/** Rule-base files of the products the site does not cover yet (tier 2): they do not get the tier-1 point. */
const tier2Files = new Set([
  "tax-insurance-and-amendment-190.md",
  "tax-tier2-other.md",
  "savings-policies-and-executive-insurance.md",
  "corporate-bonds.md",
  "fx-and-structured-deposits.md",
  "managed-and-robo-portfolios.md",
  "reits-and-gold-funds.md",
]);

const quoted = /["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g;
const bare = /\b([A-Z][A-Z0-9]*-[A-Z0-9]+)\b/g;

function walk(dir: string, ext: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (ext.test(name)) out.push(p);
  }
  return out;
}

function idsIn(text: string, re: RegExp, known: Set<string>): Set<string> {
  const found = new Set<string>();
  for (const m of text.matchAll(re)) if (known.has(m[1]!)) found.add(m[1]!);
  return found;
}

const trimColon = (s: string) => s.replace(/[:\s]+$/, "");

/** Pages that take a wrapper or exposure in the address: one stable example address, the label without the subject. */
function pageTable(): Record<string, RuleUsePage> {
  const wb = workbenchWrapperIds()[0];
  const pw = providerWrapperIds()[0];
  const sw = playbookWrapperIds()[0];
  const fx = loadExposures()[0]?.id;
  const t: Record<string, RuleUsePage> = {
    idle: { href: "/idle-cash", label: idle.title },
    fees: { href: "/fees", label: r3fees.title },
    holdings: { href: "/holdings", label: r3holdings.title },
    compare: { href: "/goal/compare", label: r2.result.title },
    goal: { href: "/goal", label: r2.form.title },
    transfer: { href: "/transfer", label: r3transfer.title },
    companies: { href: "/companies", label: companiesCopy.title },
    guide: { href: "/guide", label: guideIndex.title },
  };
  if (sw) t.switch = { href: `/switch/${sw}`, label: trimColon(r4playbook.title.before) };
  if (pw) t.providers = { href: `/workbench/providers/${pw}`, label: trimColon(r4workbench.providers.title.before) };
  if (wb) {
    const name = loadWrappers().find((w) => w.id === wb)?.names.he[0] ?? "";
    t.tracks = { href: `/workbench/tracks/${wb}`, label: `${r3workbench.title.before}${name}${r3workbench.title.after}` };
  }
  if (fx) t.funds = { href: `/workbench/funds/${fx}`, label: trimColon(r4workbench.funds.title.before) };
  return t;
}

/** routes/<name>.tsx → a key of `pageTable`; a route not listed (home, rules, documents, search, parameters …) is not a use. */
const routeKey: Record<string, string> = {
  "idle-cash": "idle",
  fees: "fees",
  "fees-data": "fees",
  holdings: "holdings",
  "holdings-bundle": "holdings",
  "goal-compare": "compare",
  "compare-bundle": "compare",
  goal: "goal",
  switch: "switch",
  "workbench-providers": "providers",
  "workbench-tracks": "tracks",
  "workbench-funds": "funds",
  "workbench-bundle": "providers",
  transfer: "transfer",
  companies: "companies",
  company: "companies",
  track: "companies",
};

/** components/<dir>/ → the page that renders it. */
const componentKey: Record<string, string> = {
  compare: "compare",
  fees: "fees",
  holdings: "holdings",
  playbook: "switch",
  workbench: "providers",
  "exposure-mode": "compare",
  revisit: "compare",
  transfer: "transfer",
  decoder: "companies",
  idle: "idle",
};

/** lib/<file> → page, by file-name prefix (the pages' own logic lives there: playbook step lists, the fee tables …). */
const libPrefixes: [string, string][] = [
  ["compare", "compare"],
  ["exposure-mode", "compare"],
  ["revisit", "compare"],
  ["goal", "compare"],
  ["holdings", "holdings"],
  ["idle", "idle"],
  ["fees", "fees"],
  ["playbook", "switch"],
  ["workbench", "providers"],
  ["providers", "providers"],
  ["variants", "funds"],
];

interface Scan {
  uses: Record<string, RuleUse>;
}

let cache: Scan | null = null;

function build(): Scan {
  const rules = loadRules();
  const known = new Set(Object.keys(rules));
  const table = pageTable();
  const appDir = join(root, "site", "app");
  const wrappers = loadWrappers();
  const wrapperName = new Map<string, string>(wrappers.map((w) => [w.id, w.names.he[0] ?? w.id]));

  const pages = new Map<string, Map<string, RuleUsePage>>();
  const siteFiles = new Map<string, number>();
  const engineFiles = new Map<string, number>();
  const collections = new Map<string, Map<string, number>>();
  const addPage = (id: string, page: RuleUsePage) => {
    const m = pages.get(id) ?? new Map<string, RuleUsePage>();
    m.set(page.href, page);
    pages.set(id, m);
  };
  const bump = (m: Map<string, number>, id: string) => m.set(id, (m.get(id) ?? 0) + 1);

  // site files
  const sources = [
    ...walk(join(appDir, "content"), /\.tsx?$/),
    ...walk(join(appDir, "routes"), /\.tsx?$/),
    ...walk(join(appDir, "components"), /\.tsx?$/),
    ...walk(join(appDir, "lib"), /\.ts$/).filter((f) => !/\.test\.ts$/.test(f) && !/rule-(uses|shelves)/.test(f)),
  ];
  for (const file of sources) {
    const rel = relative(appDir, file).split(sep);
    const base = rel[rel.length - 1]!.replace(/\.tsx?$/, "").replace(/\.server$/, "");
    let page: RuleUsePage | null = null;
    if (rel[0] === "content" && rel[1] === "guide") {
      if (base === "index" || base === "types") continue;
      page = { href: `/guide/${base}`, label: wrapperName.get(base) ?? base };
    } else if (rel[0] === "content" && rel[1] === "exposure") {
      const e = loadExposures().find((x) => x.id === base);
      page = { href: `/exposure/${base}`, label: e?.names?.he?.[0] ?? base };
    } else if (rel[0] === "routes") {
      const k = routeKey[base];
      page = k ? table[k] ?? null : null;
    } else if (rel[0] === "components" && rel.length > 2) {
      const k = componentKey[rel[1]!];
      page = k ? table[k] ?? null : null;
    } else if (rel[0] === "lib") {
      const k = libPrefixes.find(([p]) => base.startsWith(p))?.[1];
      page = k ? table[k] ?? null : null;
    }
    if (!page) continue;
    const found = idsIn(readFileSync(file, "utf8"), quoted, known);
    for (const id of found) {
      addPage(id, page);
      bump(siteFiles, id);
    }
  }

  // the engine
  for (const file of walk(join(root, "packages", "engine", "src"), /\.ts$/)) {
    for (const id of idsIn(readFileSync(file, "utf8"), bare, known)) bump(engineFiles, id);
  }

  // data collections (not the rules themselves, the regulator's bulk files or the pinned list)
  const dataDir = join(root, "data");
  const skip = new Set(["rules", "cma", "catalog", "sources"]);
  for (const file of walk(dataDir, /\.json$/)) {
    const parts = relative(dataDir, file).split(sep);
    if (skip.has(parts[0]!) || parts[parts.length - 1] === "pinned-rules.json") continue;
    const name = parts[0] === "instruments" || parts[0] === "terms" ? parts.slice(0, parts.length > 2 ? 2 : 1).join("/") : parts[0]!;
    const found = idsIn(readFileSync(file, "utf8"), quoted, known);
    for (const id of found) {
      const m = collections.get(id) ?? new Map<string, number>();
      bump(m, name);
      collections.set(id, m);
      if (name === "instruments/wrappers") {
        const wid = parts[parts.length - 1]!.replace(/\.json$/, "");
        addPage(id, { href: `/guide/${wid}`, label: wrapperName.get(wid) ?? wid });
      }
    }
  }

  const uses: Record<string, RuleUse> = {};
  for (const r of Object.values(rules)) {
    const cols = Object.fromEntries(collections.get(r.id) ?? []);
    const colRefs = Object.values(cols).reduce((a, b) => a + b, 0);
    uses[r.id] = {
      pages: [...(pages.get(r.id)?.values() ?? [])].sort((a, b) => a.href.localeCompare(b.href)),
      engine: (engineFiles.get(r.id) ?? 0) > 0,
      collections: cols,
      score: scoreOf(r, engineFiles.get(r.id) ?? 0, siteFiles.get(r.id) ?? 0, colRefs),
    };
  }
  return { uses };
}

/** 3 × engine files + site files + collection references + 2 with a figure + 1 for a tier-1 topic + 1 for a primary or mirror source + 1 likely to change. */
export function scoreOf(rule: Pick<RuleRecord, "figures" | "il_finance_file" | "strength" | "likely_to_change">, engineFiles: number, siteFiles: number, collectionRefs: number): number {
  return (
    3 * engineFiles +
    siteFiles +
    collectionRefs +
    (rule.figures && Object.keys(rule.figures).length > 0 ? 2 : 0) +
    (tier2Files.has(rule.il_finance_file) ? 0 : 1) +
    (rule.strength === "primary" || rule.strength === "primary-mirror" ? 1 : 0) +
    (rule.likely_to_change === "yes" ? 1 : 0)
  );
}

function scan(): Scan {
  cache ??= build();
  return cache;
}

/** The uses of one rule; an unknown id has none. */
export function ruleUseOf(id: string): RuleUse {
  return scan().uses[id] ?? empty;
}

/** Uses of every rule, or of the ids given, in the form the rule card reads. */
export function loadRuleUses(ids?: Iterable<string>): RuleUsesSlim {
  const all = scan().uses;
  const out: RuleUsesSlim = {};
  for (const id of ids ?? Object.keys(all)) {
    const u = all[id];
    if (u) out[id] = { pages: u.pages, engine: u.engine };
  }
  return out;
}

/** The score of every rule (orders rules inside a group and picks teasers; never the pinned list). */
export function ruleScores(): Record<string, number> {
  return Object.fromEntries(Object.entries(scan().uses).map(([id, u]) => [id, u.score]));
}

// ---- the rules page (one page with filters): which products a rule belongs under, and the per-shelf data files

let productsCache: Record<string, string[]> | null = null;

/** Rule id → product ids: the wrappers whose record cites the rule, the wrapper behind the rule's file, "common" and "tier2". */
export function ruleProducts(): Record<string, string[]> {
  if (productsCache) return productsCache;
  const all = loadRules();
  const known = new Set(Object.keys(all));
  const out: Record<string, string[]> = {};
  const add = (id: string, p: string) => {
    const list = (out[id] ??= []);
    if (!list.includes(p)) list.push(p);
  };
  for (const w of loadWrappers()) {
    const text = readFileSync(join(root, "data/instruments/wrappers", `${w.id}.json`), "utf8");
    for (const m of text.matchAll(/"([A-Z][A-Z0-9]*-[A-Z0-9]+)"/g)) if (known.has(m[1]!)) add(m[1]!, w.id);
  }
  for (const r of Object.values(all)) {
    for (const w of fileProducts[r.il_finance_file] ?? []) add(r.id, w);
    if (r.il_finance_file === commonRulesFile) add(r.id, "common");
    if (tier2RuleFiles.has(r.il_finance_file)) add(r.id, "tier2");
  }
  return (productsCache = out);
}

/** One shelf's data file (`/rules-data/<shelf>.json`): the full records of its rules, plus the records they derive from, and where each is used. */
export function shelfBundle(shelf: ShelfId) {
  const all = loadRules();
  const mine = Object.values(all).filter((r) => shelfOf(r) === shelf);
  const rules: Record<string, RuleRecord> = Object.fromEntries(mine.map((r) => [r.id, r]));
  // a rule a card points at (derived_from) may live on another shelf: its record travels too, so the chip opens it
  for (const r of mine) for (const d of (r as { derived_from?: string[] }).derived_from ?? []) if (all[d] && !rules[d]) rules[d] = all[d]!;
  return { rules, ruleUses: loadRuleUses(Object.keys(rules)) };
}
