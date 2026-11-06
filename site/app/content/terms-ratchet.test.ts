// Ratchets of the glossary (issue 205, 2026-11-06): a financial term the site names has a row in data/terms, the rows the
// glossary generator writes (docs/glossary.md, "Where the rows come from"). Two checks, both listing today's leftovers by name
// so the lists only shrink (the pattern of components/kit/ratchets.test.ts):
//  1. every term id the site opens (`<Term id>`, `<HelpMark term>`, a page's `termIds`) is the Hebrew name of a row;
//  2. no guide or exposure page names, outside a `<Term>`, a term the rule base defines that has no row.
// The second check reads its vocabulary from the "Terms" tables of the rule base (.claude/skills/il-finance/references), keeping
// only phrases of two words or more and abbreviations (a word with ״): single words there are mostly everyday Hebrew (חדש,
// תקופה, נכסים) and matched on every page. So it misses a one-word term and any term the rule base has no Terms row for.
// To clear a leftover, add the term's row (research/glossary/terms, then the generator) or mark it on the page with <Term>, then
// remove its line here. A phrase the vocabulary picks up that is not a financial term goes in NOT_A_TERM with its reason.
// Because the vocabulary is the rule base's, a rule-base commit can turn this test red without touching the site: a new Terms row
// whose phrase a guide page already uses, or a NOT_A_TERM phrase taken out of the Terms tables. The failure message names the
// term, the rule-base file it came from, the page, and the fixes (`ratchetReport` below).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { brands } from "../copy";
import { HELP_TERMS } from "../lib/track-browser";

const app = fileURLToPath(new URL("../", import.meta.url));
const repo = fileURLToPath(new URL("../../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const rel = (f: string) => relative(app, f).split("\\").join("/");
const read = (f: string) => readFileSync(f, "utf8");
/** Source without block comments and whole-line `//` comments. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
/** Gershayim, geresh and maqaf as the ASCII marks, so ״ and " spell one term. */
const norm = (s: string) => s.replace(/[״”“]/g, '"').replace(/[׳’]/g, "'").replace(/־/g, "-").trim();
const entities = (s: string) => s.replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, "&");
/** The string literals in a piece of source, unescaped. */
const literals = (s: string) => [...s.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g)].map((m) => (m[1] ?? m[2]!).replace(/\\(.)/g, "$1"));

const rows = readdirSync(join(repo, "data/terms"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(read(join(repo, "data/terms", f))) as { he: string; variants: string[] });
const names = new Set(rows.map((r) => r.he));
const spelled = new Set(rows.flatMap((r) => [r.he, ...r.variants]).map(norm));

const sources = walk(app).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));

/** Term ids in one file: literal ids are returned, an id given as an expression is returned as `{expression}`. */
const termIdsIn = (src: string): string[] => {
  const out: string[] = [];
  for (const m of src.matchAll(/<(?:Term|HelpMark)\b[^>]*?\b(?:id|term)=(?:"([^"]*)"|\{([^}]*)\})/g)) {
    if (m[1] !== undefined) out.push(entities(m[1]));
    else if (/^\s*(\[[\s\S]*\]|"[^"]*"|'[^']*')\s*$/.test(m[2]!)) out.push(...literals(m[2]!));
    else out.push(`{${m[2]!.trim()}}`);
  }
  for (const m of src.matchAll(/termIds:\s*\[([^\]]*)\]/g)) out.push(...literals(m[1]!));
  return out;
};
/** Ids given as expressions that this test resolves itself. A new expression fails until it is added here. */
const BY_EXPRESSION: Record<string, readonly string[]> = {
  "{fees.feeTerms}": brands.funds.feeTerms,
  "{HELP_TERMS.fee}": [HELP_TERMS.fee],
  "{HELP_TERMS.exposure}": [HELP_TERMS.exposure],
  "{HELP_TERMS.assets}": [HELP_TERMS.assets],
};
// Today's leftovers (2026-11-06): ids that open no row. None.
const UNRESOLVED: Record<string, readonly string[]> = {};

describe("every term id the site opens has a row", () => {
  const found = sources.map((f) => [rel(f), termIdsIn(code(read(f)))] as const).filter(([, ids]) => ids.length);
  it("each literal id is a row's Hebrew name", () => {
    const bad = Object.fromEntries(
      found.map(([f, ids]) => [f, [...new Set(ids.filter((i) => !i.startsWith("{") && !names.has(i)))].sort()] as const).filter(([, ids]) => ids.length),
    );
    expect(bad).toEqual(UNRESOLVED);
  });
  it("each id given as an expression is one this test resolves, and it resolves", () => {
    const exprs = [...new Set(found.flatMap(([, ids]) => ids.filter((i) => i.startsWith("{"))))].sort();
    expect(exprs).toEqual(Object.keys(BY_EXPRESSION).sort());
    expect(Object.values(BY_EXPRESSION).flat().filter((i) => !names.has(i))).toEqual([]);
  });
  it("the scanner sees every form", () => {
    expect(termIdsIn(`<Term id="חש&quot;ב">x</Term> <Term prefix="ה" id={["א", 'ב']}>y</Term> <HelpMark term={x.y} />`)).toEqual(['חש"ב', "א", "ב", "{x.y}"]);
    expect(termIdsIn(`termIds: ['מק"מ', "אג\\"ח"],`)).toEqual(['מק"מ', 'אג"ח']);
  });
});

// ---------------------------------------------------------------- named on a page, no row

/** The rule base's "Terms" tables: the Hebrew of each first cell, split on `/`, `;`, `,` and " or ", brackets removed. */
const ruleBaseTerms = (): Map<string, string> => {
  const dir = join(repo, ".claude/skills/il-finance/references");
  const out = new Map<string, string>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md")).sort()) {
    const s = read(join(dir, f));
    const head = /^## Terms.*$/m.exec(s);
    if (!head) continue;
    const body = s.slice(head.index + head[0].length).split(/^## /m)[0]!;
    for (const line of body.split("\n")) {
      if (!line.startsWith("|") || /^\|\s*:?-/.test(line)) continue;
      for (const raw of line.split("|")[1]!.split(/\s*[/;,]\s*|\s+or\s+/)) {
        const t = norm(raw.replace(/\(.*?\)/g, "").replace(/^[\s"'*`]+|[\s"'*`]+$/g, ""));
        if (/^[א-ת"'\- ]+$/.test(t) && (t.includes(" ") || t.includes('"')) && !out.has(t)) out.set(t, f);
      }
    }
  }
  return out;
};
const HE = "א-ת";
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The phrase as a whole word, with up to three of the one-letter prefixes (ו ה ב ל מ ש כ). */
const named = (phrase: string) => new RegExp(`(?<![${HE}])[והבלמשכ]{0,3}${esc(phrase)}(?![${HE}])`, "g");

/** What a page says outside its <Term> marks and its termIds, with every spelling of a row blanked, longest first. */
const unmarkedText = (src: string, rowSpellings: Iterable<string>): string => {
  let s = norm(entities(code(src).replace(/<Term\b[^>]*\/>|<Term\b[^>]*>[\s\S]*?<\/Term>/g, " ¤ ").replace(/termIds:\s*\[[^\]]*\]/g, " ")));
  for (const k of [...rowSpellings].filter((x) => x.length >= 3).sort((a, b) => b.length - a.length)) s = s.replace(named(k), " ¤ ");
  return s;
};
/** Rule-base phrases on each page that have no row, page by page. */
const unexplained = (pages: Record<string, string>, vocabulary: Iterable<string>, rowSpellings: Set<string>): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  const vocab = [...vocabulary].filter((v) => !rowSpellings.has(v));
  for (const [page, src] of Object.entries(pages)) {
    const text = unmarkedText(src, rowSpellings);
    const hits = vocab.filter((v) => named(v).test(text)).sort();
    if (hits.length) out[page] = hits;
  }
  return out;
};

/** What changed against today's leftovers, in words a rule-base author or a builder can act on; empty when nothing did. */
const ratchetReport = (got: Record<string, readonly string[]>, want: Record<string, readonly string[]>, vocabulary: Map<string, string>): string => {
  const lines: string[] = [];
  for (const page of [...new Set([...Object.keys(got), ...Object.keys(want)])].sort()) {
    const now = new Set(got[page] ?? []);
    const before = new Set(want[page] ?? []);
    for (const t of [...now].filter((x) => !before.has(x)).sort())
      lines.push(
        `- The page ${page} (site/app/content/${page}.tsx) names "${t}", a term from the Terms table of ` +
          `.claude/skills/il-finance/references/${vocabulary.get(t) ?? "?"}, and it has no glossary row and no <Term> mark there. ` +
          `If a rule-base change added this phrase, the page did not change; fix it one of these ways: add the term's row in ` +
          `research/glossary/terms/ and regenerate (docs/glossary.md, "Where the rows come from"), or add it as a variant of the row ` +
          `it belongs to; mark it on the page with <Term>; or, if it is not a financial term a reader needs explained, add it to ` +
          `NOT_A_TERM in this file with the reason.`,
      );
    for (const t of [...before].filter((x) => !now.has(x)).sort())
      lines.push(`- The page ${page} no longer names "${t}" without a row: remove it from NAMED_WITHOUT_ROW in this file (the list only shrinks).`);
  }
  return lines.length ? `The glossary ratchet changed:\n${lines.join("\n")}` : "";
};

/** Phrases the vocabulary holds that are not financial terms a reader needs explained, each with its reason. */
const NOT_A_TERM: Record<string, string> = {
  "הודעה מראש": "everyday words: notice given in advance",
  "ימי עסקים": "everyday words: business days",
  "חשבון חדש": "everyday words: a new account",
  "הפקדה חודשית": "everyday words: a monthly deposit, read from its two words",
  "שם מסלול": "everyday words: a track's name",
  "למטבע חוץ": "the phrase מטבע חוץ with the prefix ל, counted under מטבע חוץ",
  "חוק השקעות משותפות בנאמנות": "the name of a law, cited as a source, not a term",
  "רשימת מסלולי ההשקעה": "the name of a regulator's document, cited as a source, not a term",
};

// Today's leftovers (2026-11-06): page -> rule-base terms it names with no row and no <Term>. Each is a row to write (or, where a
// row exists under another form, a variant to add), or a mark to put on the page.
const NAMED_WITHOUT_ROW: Record<string, readonly string[]> = {
  "exposure/general-track": ["ברירת מחדל", "רשות שוק ההון"],
  "exposure/index-sp500": ["בניהול אישי", "קרן פנסיה", "תשואה כוללת ברוטו"],
  "exposure/index-ta125": ["בניהול אישי", "יחידת המסחר", "רשות שוק ההון", "תשואה כוללת ברוטו"],
  "exposure/shekel-cash": ["בניהול אישי", "רשות שוק ההון"],
  "guide/bank-deposit": ["תיאום מס"],
  "guide/brokerage-account": ["איגרת חוב", "מטבע חוץ"],
  "guide/child-savings-provident": ["מסלול ברירת המחדל"],
  "guide/government-bond": ["איגרת חוב", "בניהול אישי", 'ח"ץ', "מטבע חוץ", "רשות שוק ההון"],
  "guide/ira-hishtalmut": ["בניהול אישי", "מטבע חוץ", "ניירות ערך סחירים", "רשות שוק ההון"],
  "guide/ira-provident": ["בניהול אישי", "כספים הוניים", "מטבע חוץ", "ניירות ערך סחירים", "קרן פנסיה", "רשות שוק ההון"],
  "guide/keren-hishtalmut": ["צו הרחבה", "קרן פנסיה"],
  "guide/kupat-gemel-lehashkaa": ["הכנסות אחרות"],
  "guide/limited-bond-fund": ["איגרת חוב", "תקופת קיום הקרן"],
  "guide/makam": ["בניהול אישי"],
  "guide/money-market-fund-daily": ["בעלי היחידות"],
  "guide/money-market-fund-renewable": ["בעלי היחידות"],
  "guide/mutual-funds": ["בעלי היחידות", "מחיר קנייה", "קרן סגורה"],
  "guide/open-tax": ["קרן פנסיה"],
  "guide/pension-comprehensive": ["קרן פנסיה"],
  "guide/pension-general": ["קרן פנסיה"],
  "guide/provident-for-annuity": ["קרן פנסיה"],
  "guide/savings-plan": ["תיאום מס"],
};

describe("no guide or exposure page names a rule-base term that has no row", () => {
  const vocabulary = ruleBaseTerms();
  const pages = Object.fromEntries(
    sources.filter((f) => /^content\/(guide|exposure)\/[^/]+\.tsx$/.test(rel(f))).map((f) => [rel(f).slice("content/".length, -".tsx".length), read(f)]),
  );
  it("the vocabulary is read from the rule base", () => {
    expect(vocabulary.size).toBeGreaterThan(300);
    expect(Object.keys(pages).length).toBeGreaterThan(20);
  });
  it("matches today's leftovers, so the list only shrinks", () => {
    const vocab = [...vocabulary.keys()].filter((v) => !(v in NOT_A_TERM));
    const got = unexplained(pages, vocab, spelled);
    expect(ratchetReport(got, NAMED_WITHOUT_ROW, vocabulary)).toBe("");
    expect(got).toEqual(NAMED_WITHOUT_ROW);
  });
  it("each NOT_A_TERM phrase is still in the vocabulary and has no row", () => {
    const stale = Object.keys(NOT_A_TERM).filter((t) => !vocabulary.has(t) || spelled.has(t));
    const why = stale.map((t) =>
      spelled.has(t)
        ? `- "${t}" now has a glossary row: remove it from NOT_A_TERM in this file.`
        : `- "${t}" is no longer in any Terms table of .claude/skills/il-finance/references (a rule-base change removed or reworded it): remove it from NOT_A_TERM in this file.`,
    );
    expect(stale, `NOT_A_TERM holds phrases it no longer needs:\n${why.join("\n")}`).toEqual([]);
  });
  it("the failure message names the term, its rule-base file, the page and the fixes", () => {
    const msg = ratchetReport({ "guide/x": ["צו הרחבה"] }, { "guide/y": ["קרן פנסיה"] }, new Map([["צו הרחבה", "keren-hishtalmut.md"]]));
    expect(msg).toContain('The page guide/x (site/app/content/guide/x.tsx) names "צו הרחבה"');
    expect(msg).toContain(".claude/skills/il-finance/references/keren-hishtalmut.md");
    expect(msg).toContain("NOT_A_TERM");
    expect(msg).toContain("research/glossary/terms/");
    expect(msg).toContain('The page guide/y no longer names "קרן פנסיה" without a row: remove it from NAMED_WITHOUT_ROW');
    expect(ratchetReport({ p: ["a"] }, { p: ["a"] }, new Map())).toBe("");
  });
  it("the scanner sees a term with a prefix, and not one inside a <Term> or a longer row", () => {
    const rowsHere = new Set(["קרן פנסיה מקיפה"]);
    const vocab = ["קרן פנסיה", "צו הרחבה"];
    expect(unexplained({ p: `<p>ובצו הרחבה</p>` }, vocab, rowsHere)).toEqual({ p: ["צו הרחבה"] });
    expect(unexplained({ p: `<Term id="x">צו הרחבה</Term> בקרן פנסיה מקיפה` }, vocab, rowsHere)).toEqual({});
    expect(unexplained({ p: `במצו הרחבהx` }, vocab, rowsHere)).toEqual({ p: ["צו הרחבה"] });
    expect(unexplained({ p: `אצו הרחבה` }, vocab, rowsHere)).toEqual({});
  });
});
