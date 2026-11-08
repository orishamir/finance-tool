// Generates data/terms/*.json (one per merged glossary row) and data/dimensions/*.json (one per checklist row)
// from research/glossary/terms/*.json and docs/glossary.md section 2. Re-runnable: it deletes and rewrites both
// folders (but never data/terms/deposits/). Last of the three glossary generators: `npm run gen:terms` runs merge_terms.py,
// gen_glossary.py (which writes docs/glossary.md, whose section 2 this reads), then this.
//
// Every run also refreshes each dimension's `rule_ids`: they are the ids of the data/rules/*.json records that list the
// dimension in their `dimensions`, so a rule record added or changed since the last run shows up in data/dimensions/ even
// when the glossary did not change. Commit that part as its own change. Never hand-edit a dimension's rule_ids; change the
// rule record's `dimensions` (and the rule base's Dimensions line) and run this again.
//
// A research row that carries an `id` keeps it, so a record's file name does not change when another row with the same name
// is added or removed; a new row gets the id below. The row's `source.publisher` and `seen_by` are written as they are.
//
// Mapping of the research `where` values:
//  - `guide:<page>[:tax|:protection|:regulator]` is read as `guide:<page>`. A page name that is a wrapper id stays;
//    older page names map to wrapper ids (PAGE_WRAPPERS below). `guide:index-sp500`, `guide:index-ta125` and
//    `guide:government-bonds-and-makam` also give `exposure_ids` (PAGE_EXPOSURES).
//  - `guide:*` (any suffix) means every page: all wrapper ids from the schema enum. `guide:<product id>` (a wrapper or a
//    security) gives that product's page; `exposure:<id>` gives an exposure page (`exposure_ids`).
//  - form-106, form-867, tax-return, tax-form -> tax-form; bank, manager-site, nii-site, institution-table,
//    bank-rate-table -> provider-site; pension-net -> pensia-net; prospectus, tariff, fund-name, and the places already
//    in the schema enum stay as they are.
//  - comparison, decoder, decoder:company, decoder:track, tier2-page, notice, tax-authority-table are site-internal and dropped.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dimensionId, termWhere, wrapperId, productIds, termRecord, dimensionRecord } from "@finance-tool/schema";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TODAY = "2026-10-23";

interface Research {
  id?: string;
  kind?: string;
  seen_by?: string;
  term_he: string;
  variants_he?: string[];
  explain_he?: string | null;
  rule_ids?: string[];
  source?: { title?: string; url?: string; checked?: string; strength?: string; publisher?: string } | null;
  where?: string[];
}
type Strength = "primary" | "institution" | "secondary";
interface Merged {
  id?: string;
  seenBy?: string;
  topic: string;
  he: string;
  meaning: string;
  variants: string[];
  ruleIds: string[];
  source: { url: string; title: string; strength: Strength; checked: string; publisher?: string } | null;
  where: string[];
}
const rank: Record<string, number> = { primary: 0, institution: 1, secondary: 2 };
const rankOf = (m: { source: { strength: string } | null }) => rank[m.source?.strength ?? "secondary"] ?? 4;

// ------------------------------------------------------------------ terms: merge as loadTerms() did
const termsDir = join(root, "research/glossary/terms");
const merged = new Map<string, Merged>();
for (const f of readdirSync(termsDir).filter((x) => x.endsWith(".json")).sort()) {
  const topic = f.replace(/\.json$/, "");
  for (const r of JSON.parse(readFileSync(join(termsDir, f), "utf8")) as Research[]) {
    if (r.kind === "dimension" || !r.explain_he) continue;
    const he = r.term_he.trim();
    const s = r.source;
    const src = s?.url && s.title && s.checked ? { url: s.url, title: s.title, strength: (s.strength ?? "secondary") as Strength, checked: s.checked, ...(s.publisher ? { publisher: s.publisher } : {}) } : null;
    const row: Merged = { ...(r.id ? { id: r.id } : {}), ...(r.seen_by ? { seenBy: r.seen_by } : {}), topic, he, meaning: r.explain_he.trim(), variants: (r.variants_he ?? []).filter((v) => v && v !== he), ruleIds: r.rule_ids ?? [], source: src, where: r.where ?? [] };
    const key = `${topic}|${he}`;
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, row);
      continue;
    }
    const keep = rankOf(prev) <= rankOf(row) ? prev : row;
    const other = keep === prev ? row : prev;
    keep.variants = [...new Set([...keep.variants, ...other.variants])];
    keep.ruleIds = [...new Set([...keep.ruleIds, ...other.ruleIds])];
    keep.where = [...new Set([...keep.where, ...other.where])];
    keep.id ??= other.id;
    merged.set(key, keep);
  }
}

// ------------------------------------------------------------------ ids
const letters: Record<string, string> = {
  א: "a", ב: "b", ג: "g", ד: "d", ה: "h", ו: "v", ז: "z", ח: "ch", ט: "t", י: "y", כ: "k", ך: "k", ל: "l", מ: "m", ם: "m",
  נ: "n", ן: "n", ס: "s", ע: "a", פ: "p", ף: "p", צ: "tz", ץ: "tz", ק: "k", ר: "r", ש: "sh", ת: "t",
};
function slug(he: string): string {
  let out = "";
  for (const ch of he.normalize("NFC").replace(/[֑-ׇ]/g, "")) {
    if (/["'׳״’“”]/.test(ch)) continue;
    if (letters[ch]) out += letters[ch];
    else if (/[a-zA-Z0-9]/.test(ch)) out += ch.toLowerCase();
    else out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}
const hash4 = (topic: string, he: string) => createHash("sha256").update(`${topic}|${he}`).digest("hex").slice(0, 4);

const rows = [...merged.values()];
const bySlug = new Map<string, Merged[]>();
for (const r of rows) bySlug.set(slug(r.he), [...(bySlug.get(slug(r.he)) ?? []), r]);
const idOf = new Map<Merged, string>();
let topicSuffixed = 0;
let hashed = 0;
for (const [s, group] of bySlug) {
  const distinct = new Set(group.map((g) => g.he));
  for (const g of group) {
    if (g.id) {
      idOf.set(g, g.id);
      continue;
    }
    let id = s;
    if (distinct.size > 1 || !s) {
      id = [s, hash4(g.topic, g.he)].filter(Boolean).join("-");
      hashed++;
    } else if (group.length > 1) {
      id = `${s}-${g.topic[0]}`;
      topicSuffixed++;
    }
    idOf.set(g, id);
  }
}
const seenIds = new Set<string>();
for (const id of idOf.values()) {
  if (seenIds.has(id)) throw new Error(`duplicate term id ${id}`);
  seenIds.add(id);
}

// ------------------------------------------------------------------ publisher
const hostPublisher: [RegExp, string][] = [
  [/(^|\.)boi\.org\.il$/, "Bank of Israel"],
  [/(^|\.)isa\.gov\.il$/, "Israel Securities Authority"],
  [/(^|\.)tase\.co\.il$/, "Tel Aviv Stock Exchange"],
  [/(^|\.)nevo\.co\.il$/, "Nevo legal database"],
  [/(^|\.)knesset\.gov\.il$/, "Knesset"],
  [/(^|\.)taxes\.gov\.il$/, "Israel Tax Authority"],
  [/(^|\.)btl\.gov\.il$/, "National Insurance Institute"],
];
function publisherOf(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return hostPublisher.find(([re]) => re.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ write terms
const termsOut = join(root, "data/terms");
const dimsOut = join(root, "data/dimensions");
mkdirSync(termsOut, { recursive: true });
for (const f of readdirSync(termsOut)) if (f.endsWith(".json")) rmSync(join(termsOut, f));
rmSync(dimsOut, { recursive: true, force: true });
mkdirSync(dimsOut, { recursive: true });

const PAGE_WRAPPERS: Record<string, string[]> = {
  "bank-current-account-deposits": ["current-account", "bank-deposit", "savings-plan"],
  "money-market-fund": ["money-market-fund-daily", "money-market-fund-renewable"],
  "mutual-fund": ["brokerage-account"],
  "etfs-and-index-funds": ["brokerage-account"],
  "child-savings": ["child-savings-provident", "child-savings-bank"],
  "ira-self-directed": ["ira-hishtalmut", "ira-provident"],
  "pension-and-gemel-lekitzba": ["pension-comprehensive", "pension-general", "provident-for-annuity"],
  "government-bonds-and-makam": ["makam", "government-bond"],
};
const PAGE_EXPOSURES: Record<string, string[]> = {
  "index-sp500": ["index-sp500"],
  "index-ta125": ["index-ta125"],
  "government-bonds-and-makam": ["makam", "government-bond-unlinked", "government-bond-cpi"],
};
const WHERE_MAP: Record<string, string> = {
  "form-106": "tax-form", "form-867": "tax-form", "tax-return": "tax-form", "tax-form": "tax-form",
  bank: "provider-site", "manager-site": "provider-site", "nii-site": "provider-site", "institution-table": "provider-site", "bank-rate-table": "provider-site",
  "pension-net": "pensia-net",
};
const places = new Set<string>(termWhere.options);
const wrappers = new Set<string>(productIds);
const droppedWhere = new Map<string, number>();
const droppedGuide = new Map<string, number>();
let noPublisher = 0;
let publisherSeeTitle = 0;
let noSource = 0;
const publisherCounts = new Map<string, number>();
const count = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
const perWrapper = new Map<string, number>();
const stableJson = (o: unknown) => JSON.stringify(o, null, 2) + "\n";

for (const r of rows) {
  const where: string[] = [];
  const wrapper_ids: string[] = [];
  const exposure_ids: string[] = [];
  for (const w of r.where) {
    if (w.startsWith("exposure:")) exposure_ids.push(w.slice(9));
    else if (w.startsWith("guide:")) {
      const page = w.slice(6).replace(/:(tax|protection|regulator)$/, "");
      const ws = page === "*" ? [...wrapperId.options] : wrappers.has(page) ? [page] : (PAGE_WRAPPERS[page] ?? []);
      const es = PAGE_EXPOSURES[page] ?? [];
      wrapper_ids.push(...ws);
      exposure_ids.push(...es);
      if (!ws.length && !es.length) count(droppedGuide, w);
    } else if (places.has(w)) where.push(w);
    else if (WHERE_MAP[w]) where.push(WHERE_MAP[w]!);
    else count(droppedWhere, w);
  }
  if (!r.source) {
    noSource++;
    continue;
  }
  noPublisher++;
  let publisher = r.source.publisher ?? publisherOf(r.source.url);
  if (!publisher) {
    publisher = "see title";
    publisherSeeTitle++;
  }
  count(publisherCounts, publisher);
  const rec = {
    id: idOf.get(r)!,
    he: r.he,
    en: null,
    meaning: r.meaning,
    where: [...new Set(where)].sort(),
    wrapper_ids: [...new Set(wrapper_ids)].sort(),
    ...(exposure_ids.length ? { exposure_ids: [...new Set(exposure_ids)].sort() } : {}),
    variants: r.variants,
    rule_ids: [...new Set(r.ruleIds)].sort(),
    source: { url: r.source.url, title: r.source.title, publisher, strength: r.source.strength, checked: r.source.checked },
    ...(r.seenBy ? { seen_by: r.seenBy } : {}),
  };
  termRecord.parse(rec);
  for (const w of rec.wrapper_ids) count(perWrapper, w);
  writeFileSync(join(termsOut, `${rec.id}.json`), stableJson(rec));
}

// ------------------------------------------------------------------ dimensions
const doc = readFileSync(join(root, "docs/glossary.md"), "utf8");
const section = doc.slice(doc.indexOf("## 2. The checklist"), doc.indexOf("## 3. Not covered yet"));
const dimRows = [...section.matchAll(/^\| `([a-z-]+)` \| \*\*(.+?)\*\* \| (.+?) \|$/gm)].map((m) => ({ id: m[1]!, he: m[2]!, one: m[3]!.trim() }));
const rulesDir = join(root, "data/rules");
const rules = existsSync(rulesDir)
  ? readdirSync(rulesDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as { id: string; dimensions?: string[] })
  : [];
for (const d of dimRows) {
  const rec = {
    id: d.id,
    he: d.he,
    one_line: d.one,
    source: { url: "docs/product.md#33-dimension-checklist-or-what-you-are-not-considering", title: "product.md 3.3 and glossary.md section 2", publisher: "project", strength: "primary", checked: TODAY },
    rule_ids: rules.filter((r) => r.dimensions?.includes(d.id)).map((r) => r.id).sort(),
  };
  dimensionRecord.parse(rec);
  writeFileSync(join(dimsOut, `${d.id}.json`), stableJson(rec));
}
const missingDims = dimensionId.options.filter((o) => !dimRows.some((d) => d.id === o));

// ------------------------------------------------------------------ summary
const fmt = (m: Map<string, number>) => [...m].sort().map(([k, v]) => `${k} x${v}`).join(", ") || "none";
console.log(`merged rows: ${rows.length}; terms written: ${rows.length - noSource}; skipped (no source): ${noSource}`);
console.log(`dimensions written: ${dimRows.length} (schema enum ids missing from glossary: ${missingDims.join(", ") || "none"})`);
console.log(`ids: ${topicSuffixed} with topic suffix, ${hashed} with hash suffix`);
console.log(`dropped where values: ${fmt(droppedWhere)}`);
console.log(`dropped guide: entries (not a wrapper id): ${fmt(droppedGuide)}`);
console.log(`sources without publisher (all): ${noPublisher}; inferred from host: ${noPublisher - publisherSeeTitle}; "see title": ${publisherSeeTitle}`);
console.log(`terms per wrapper id: ${fmt(perWrapper)}`);
console.log(`publishers: ${fmt(publisherCounts)}`);
