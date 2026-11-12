// Where each rule is used (8dd1f013:research/knowledge/2026-10-24-synthesis.md §3.4): the pages of the site that cite it, whether the
// calculation engine reads it, which data collections reference it, and a score that orders rules inside a group.
// Computed once per build from the source files themselves (a quoted id in content/, routes/, components/, a few lib/ files),
// so a page that starts citing a rule shows up here with no table to maintain.
import { existsSync, readdirSync, statSync } from "node:fs";
import { DEAL_PATH, dealPagePath, guidePath } from "./site-paths";
import { join, relative, sep } from "node:path";
import type { RuleRecord } from "@finance-tool/schema";
import { feeDeal, guideIndex, invest, limitedBondFund, mutualFunds, r3transfer, trackBrowser, companies as companiesCopy } from "../copy";
import { exposureHref, loadExposures } from "./instruments.server";
import { loadRules, loadProducts, pointedRecords, root } from "./data.server";
import { fileProducts, commonRulesFile, shelfOf, tier2RuleFiles, type ShelfId } from "./rule-shelves";
import { readTextCached } from "./read-cache.server";

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

/** The pages a rule can be used on: the address and the label of each. */
function pageTable(): Record<string, RuleUsePage> {
  const t: Record<string, RuleUsePage> = {
    deal: { href: DEAL_PATH, label: feeDeal.title },
    transfer: { href: "/transfer", label: r3transfer.title },
    companies: { href: "/companies", label: companiesCopy.title },
    guide: { href: "/guide", label: guideIndex.title },
    // the securities run the house-ranking page made is the index page's now
    indices: { href: "/indices", label: invest.nav },
    tracks: { href: "/tracks", label: trackBrowser.title },
  };
  return t;
}

/**
 * routes/<name>.tsx → a key of `pageTable`; a route not listed (home, rules, documents, search, parameters …) is not a use. `shared`
 * (here and below) is code several pages share, such as the comparison code of the indices and exposure pages: it counts towards a
 * rule's score but names no page.
 */
const routeKey: Record<string, string> = {
  deal: "deal",
  "deal-data": "deal",
  "compare-bundle": "shared",
  invest: "indices",
  tracks: "tracks",
  "indices-bundle": "indices",
  transfer: "transfer",
  companies: "companies",
  company: "companies",
  track: "companies",
};

/** components/<dir>/ → the page that renders it. */
const componentKey: Record<string, string> = {
  compare: "shared",
  "fee-deal": "deal",
  tracks: "tracks",
  invest: "indices",
  transfer: "transfer",
  decoder: "companies",
};

/** lib/<file> → page, by file-name prefix (the pages' own logic lives there: the track tables …). */
const libPrefixes: [string, string][] = [
  ["compare", "shared"],
  ["goal", "shared"],
  ["holdings", "shared"],
  ["track-browser", "tracks"],
  ["track-names", "tracks"],
  ["track-labels", "tracks"],
  ["track-exposure", "tracks"],
  ["providers", "indices"],
  ["invest", "indices"],
];

/** lib/<dir>/ → the page whose logic it holds. */
const libFolderKey: Record<string, string> = {
  "fee-deal": "deal",
};

interface Scan {
  uses: Record<string, RuleUse>;
}

let cache: Scan | null = null;

function build(): Scan {
  const rules = loadRules();
  const known = new Set(Object.keys(rules));
  const table = pageTable();
  const appDir = join(root, "site", "app");
  const wrappers = loadProducts();
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
    let key: string | undefined;
    if (rel[0] === "content" && rel[1] === "guide") {
      if (base === "index" || base === "types") continue;
      page = { href: guidePath(base), label: base === "limited-bond-fund" ? limitedBondFund.title : base === "mutual-funds" ? mutualFunds.title : (wrapperName.get(base) ?? base) };
    } else if (rel[0] === "content" && rel[1] === "exposure") {
      const e = loadExposures().find((x) => x.id === base);
      page = { href: exposureHref(base), label: e?.names?.he?.[0] ?? base };
    } else if (rel[0] === "routes") {
      key = routeKey[base];
    } else if (rel[0] === "components" && rel.length > 2) {
      key = componentKey[rel[1]!];
    } else if (rel[0] === "lib" && rel.length > 2) {
      key = libFolderKey[rel[1]!];
    } else if (rel[0] === "lib") {
      key = libPrefixes.find(([p]) => base.startsWith(p))?.[1];
    }
    if (key) page = table[key] ?? null;
    if (!page && !key) continue;
    const found = idsIn(readTextCached(file), quoted, known);
    for (const id of found) {
      if (page) addPage(id, page);
      bump(siteFiles, id);
    }
  }

  // the engine
  for (const file of walk(join(root, "packages", "engine", "src"), /\.ts$/)) {
    for (const id of idsIn(readTextCached(file), bare, known)) bump(engineFiles, id);
  }

  // data collections (not the rules themselves, the regulator's bulk files or the pinned list)
  const dataDir = join(root, "data");
  const skip = new Set(["rules", "cma", "catalog", "sources"]);
  for (const file of walk(dataDir, /\.json$/)) {
    const parts = relative(dataDir, file).split(sep);
    if (skip.has(parts[0]!) || parts[parts.length - 1] === "pinned-rules.json") continue;
    const name = parts[0] === "instruments" || parts[0] === "terms" ? parts.slice(0, parts.length > 2 ? 2 : 1).join("/") : parts[0]!;
    const found = idsIn(readTextCached(file), quoted, known);
    for (const id of found) {
      const m = collections.get(id) ?? new Map<string, number>();
      bump(m, name);
      collections.set(id, m);
      if (name === "instruments/wrappers" || name === "instruments/securities") {
        const wid = parts[parts.length - 1]!.replace(/\.json$/, "");
        addPage(id, { href: guidePath(wid), label: wrapperName.get(wid) ?? wid });
      }
    }
  }

  // the fee page states each fee's legal cap with the rules the cap cites, for every product record that lists a fee base (method §10.6, F-113)
  const capKinds = new Map<string, Set<string>>();
  for (const w of wrappers.filter((x) => x.fee_bases_allowed.length > 0))
    for (const id of Object.values(w.fee_caps ?? {}).flatMap((c) => c?.rule_ids ?? [])) if (known.has(id)) capKinds.set(id, (capKinds.get(id) ?? new Set()).add(w.id));
  for (const id of capKinds.keys()) addPage(id, table.deal!);
  // a cap of one product opens the page on a new deal of that product; any other rule opens the page as it is
  const feePage = (id: string): RuleUsePage => {
    const kinds = [...(capKinds.get(id) ?? [])];
    return { href: kinds.length === 1 ? dealPagePath({ wrapper: kinds[0]! }) : table.deal!.href, label: table.deal!.label };
  };

  const uses: Record<string, RuleUse> = {};
  for (const r of Object.values(rules)) {
    const cols = Object.fromEntries(collections.get(r.id) ?? []);
    const colRefs = Object.values(cols).reduce((a, b) => a + b, 0);
    uses[r.id] = {
      pages: [...(pages.get(r.id)?.values() ?? [])].map((pg) => (pg.href === table.deal!.href ? feePage(r.id) : pg)).sort((a, b) => a.href.localeCompare(b.href)),
      engine: (engineFiles.get(r.id) ?? 0) > 0,
      collections: cols,
      score: scoreOf(r, engineFiles.get(r.id) ?? 0, siteFiles.get(r.id) ?? 0, colRefs),
    };
  }
  return { uses };
}

/** 3 × engine files + site files + collection references + 2 with a figure + 1 for a tier-1 topic + 1 for a primary source + 1 likely to change. */
export function scoreOf(rule: Pick<RuleRecord, "figures" | "il_finance_file" | "strength" | "likely_to_change">, engineFiles: number, siteFiles: number, collectionRefs: number): number {
  return (
    3 * engineFiles +
    siteFiles +
    collectionRefs +
    (rule.figures && Object.keys(rule.figures).length > 0 ? 2 : 0) +
    (tier2RuleFiles.has(rule.il_finance_file) ? 0 : 1) +
    (rule.strength === "primary" ? 1 : 0) +
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
  for (const w of loadProducts()) {
    const text = readTextCached(join(root, "data/instruments", "held_in" in w ? "securities" : "wrappers", `${w.id}.json`));
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
  // the rules page lists general rules only (D30); a company's term a card points at (an example) still travels below, so its chip opens
  const mine = Object.values(all).filter((r) => r.scope === "general" && shelfOf(r) === shelf);
  const rules: Record<string, RuleRecord> = Object.fromEntries(mine.map((r) => [r.id, r]));
  // a rule a card points at (derived_from, examples) may live on another shelf: its record travels too, so the chip opens it
  Object.assign(rules, pointedRecords(rules, all));
  return { rules, ruleUses: loadRuleUses(Object.keys(rules)) };
}

/** Every company's term, for the file a claim's results read: the same shape as a shelf's. */
export function companyTermsBundle() {
  const all = loadRules();
  const rules: Record<string, RuleRecord> = Object.fromEntries(Object.values(all).filter((r) => r.scope !== "general").map((r) => [r.id, r]));
  Object.assign(rules, pointedRecords(rules, all));
  return { rules, ruleUses: loadRuleUses(Object.keys(rules)) };
}
