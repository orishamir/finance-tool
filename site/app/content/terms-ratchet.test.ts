// Ratchets of the glossary: a financial term the site names has a row in data/terms, the rows the
// glossary generator writes (docs/glossary.md, "Where the rows come from"). Two checks, both listing today's leftovers by name
// so the lists only shrink (the pattern of components/kit/ratchets.test.ts):
//  1. every term id the site opens (`<Term id>`, `<HelpMark term>`, a page's `termIds`) is the Hebrew name of a row;
//  2. no page names, outside a `<Term>`, a financial term that has no row: every file under site/app/content and every
//     `export const` block of site/app/copy.ts (glossary sweep; before it, guide and exposure pages only).
// The second check reads its vocabulary from the "Terms" tables of the rule base (.claude/skills/il-finance/references), keeping
// only phrases of two words or more and abbreviations (a word with ״): single words there are mostly everyday Hebrew (חדש,
// תקופה, נכסים) and matched on every page. SITE_VOCABULARY adds the financial terms the site uses that the rule base has no
// Terms row for, one-word terms among them, and FORMS names the inflected forms (plural, construct, with ה) of a row, which
// count as that row without becoming a "נקרא גם" name on its card.
// To clear a leftover, add the term's row (research/glossary/terms, then the generator) or mark it on the page with <Term>, then
// remove its line here. A phrase the vocabulary picks up that is not a financial term goes in NOT_A_TERM with its reason.
// Because the vocabulary is the rule base's, a rule-base commit can turn this test red without touching the site: a new Terms row
// whose phrase a guide page already uses, or a NOT_A_TERM phrase taken out of the Terms tables. The failure message names the
// term, the rule-base file it came from, the page, and the fixes (`ratchetReport` below).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { brands, guideSignature } from "../copy";
import { HELP_TERMS } from "../lib/track-browser";
import { HELP_TERMS as DEPOSIT_TERMS, KIND_TERMS } from "../lib/deposit-browser";
import { FEE_KIND_IDS } from "../lib/fee-deal/shapes";
import { feeName } from "../components/fee-deal/words";

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
  .map((f) => JSON.parse(read(join(repo, "data/terms", f))) as { he: string; variants: string[]; wrapper_ids?: string[]; exposure_ids?: string[] });
const names = new Set(rows.map((r) => r.he));
const spelled = new Set(rows.flatMap((r) => [r.he, ...r.variants]).map(norm));

const sources = walk(app).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));

/** Term ids in one file: literal ids are returned, an id given as an expression is returned as `{expression}`; in a list, each item
 *  the same way (`[HELP_TERMS.rate, "ריבית"]` gives `{HELP_TERMS.rate}` and its literal). */
const termIdsIn = (src: string): string[] => {
  const out: string[] = [];
  for (const m of src.matchAll(/<(?:Term|HelpMark)\b[^>]*?\b(?:id|term)=(?:"([^"]*)"|\{([^}]*)\})/g)) {
    if (m[1] !== undefined) out.push(entities(m[1]));
    else if (/^\s*("[^"]*"|'[^']*')\s*$/.test(m[2]!)) out.push(...literals(m[2]!));
    else if (/^\s*\[[\s\S]*\]\s*$/.test(m[2]!)) {
      for (const item of m[2]!.trim().slice(1, -1).matchAll(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|([^,"'\s][^,"']*)/g)) out.push(item[1] !== undefined ? literals(item[1])[0]! : `{${item[2]!.trim()}}`);
    } else out.push(`{${m[2]!.trim()}}`);
  }
  for (const m of src.matchAll(/termIds\s*[:=]\s*\[([^\]]*)\]/g)) out.push(...literals(m[1]!));
  return out;
};
/** Ids given as expressions that this test resolves itself. A new expression fails until it is added here. */
const BY_EXPRESSION: Record<string, readonly string[]> = {
  "{fees.feeTerms}": brands.funds.feeTerms,
  "{HELP_TERMS.fee}": [HELP_TERMS.fee],
  // a fee head's "?" (components/tracks/list.tsx, feeMarkTerms): the averages, and each fee's card where it names the product
  "{fullFeeTerms}": [HELP_TERMS.fee, HELP_TERMS.depositFee, HELP_TERMS.savingsCard, HELP_TERMS.depositCard],
  // a company page's fee head (feeHead): the same, and on the savings fee's the direct expenses the column leaves out
  "{terms.length === 1 ? terms[0] : terms}": [HELP_TERMS.fee, HELP_TERMS.depositFee, HELP_TERMS.savingsCard, HELP_TERMS.depositCard, HELP_TERMS.direct],
  "{HELP_TERMS.exposure}": [HELP_TERMS.exposure],
  "{HELP_TERMS.assets}": [HELP_TERMS.assets],
  "{HELP_TERMS.rate}": [DEPOSIT_TERMS.rate],
  // a bank's deposits table's rate head (components/company/bank-views.tsx, RateHead)
  "{DEPOSIT_TERMS.rate}": [DEPOSIT_TERMS.rate],
  "{HELP_TERMS.exits}": [DEPOSIT_TERMS.exits],
  "{HELP_TERMS.break}": [DEPOSIT_TERMS.break],
  "{HELP_TERMS.linked}": [DEPOSIT_TERMS.linked],
  "{KIND_TERMS}": KIND_TERMS,
  // the fee panel's "מה זה" opens a fee's name only where the page's data holds its card (fees.server.ts), and the gallery shows custody's
  "{explained}": FEE_KIND_IDS.map((k) => feeName(k)).filter((n) => names.has(n)),
  "{custodyName}": [feeName("custody")],
};
// Today's leftovers: ids that open no row. None.
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
    // an expression inside a list is one to resolve, never skipped
    expect(termIdsIn(`<HelpMark term={[DEPOSIT_TERMS.rate]} /> <HelpMark term={[X.y, "א, ב"]} />`)).toEqual(["{DEPOSIT_TERMS.rate}", "{X.y}", "א, ב"]);
  });
  it("an expression that names no row fails", () => {
    const resolve = (e: string) => BY_EXPRESSION[e] ?? [`no mapping for ${e}`];
    const missing = (ids: readonly string[]) => ids.filter((i) => !names.has(i));
    expect(missing(resolve("{DEPOSIT_TERMS.rate}"))).toEqual([]);
    expect(missing(resolve("{terms.length === 1 ? terms[0] : terms}"))).toEqual([]);
    expect(missing(["מונח שאין לו שורה"])).toEqual(["מונח שאין לו שורה"]);
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
/**
 * The phrase as a whole word, with up to four of the one-letter prefixes (ו ה ב ל מ ש כ). Four, not three:
 * וכשהעמלה is ו, כש and ה before עמלה, and the scan read past it.
 */
const named = (phrase: string) => new RegExp(`(?<![${HE}])[והבלמשכ]{0,4}${esc(phrase)}(?![${HE}])`, "g");

/** What a page says outside its <Term> marks and its termIds, with every spelling of a row blanked, longest first. */
const unmarkedText = (src: string, rowSpellings: Iterable<string>): string => {
  let s = norm(entities(code(src).replace(/<Term\b[^>]*\/>|<Term\b[^>]*>[\s\S]*?<\/Term>/g, " ¤ ").replace(/termIds\s*[:=]\s*\[[^\]]*\]/g, " ")));
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
        `- The page ${page} (${fileOf(page)}) names "${t}", ` +
          (vocabulary.get(t) === "SITE_VOCABULARY"
            ? `a financial term from SITE_VOCABULARY in this file, `
            : `a term from the Terms table of .claude/skills/il-finance/references/${vocabulary.get(t) ?? "?"}, `) +
          `and it has no glossary row and no <Term> mark there. ` +
          `If a rule-base change added this phrase, the page did not change; fix it one of these ways: add the term's row in ` +
          `research/glossary/terms/ and regenerate (docs/glossary.md, "Where the rows come from"), or add it as a variant of the row ` +
          `it belongs to (an inflected form goes in FORMS instead); mark it on the page with <Term>; or, if it is not a financial ` +
          `term a reader needs explained, add it to NOT_A_TERM in this file with the reason.`,
      );
    for (const t of [...before].filter((x) => !now.has(x)).sort())
      lines.push(`- The page ${page} no longer names "${t}" without a row: remove it from NAMED_WITHOUT_ROW in this file (the list only shrinks).`);
  }
  return lines.length ? `The glossary ratchet changed:\n${lines.join("\n")}` : "";
};

/**
 * Financial terms the site uses that no Terms table of the rule base lists (glossary sweep, from a count over the
 * built pages). Those with a row pass; those without are the leftovers below, each a row to write once an official text
 * defines it (docs/glossary.md section 4 keeps the ones no official text defines yet).
 */
const SITE_VOCABULARY: readonly string[] = [
  "קופת גמל", "קרן פנסיה", "נייר ערך", "איגרת חוב", "בורסה", "מטבע חוץ", "תלוש שכר", "צד נגדי מרכזי", "מחיר קנייה", "קרן סגורה",
  "תיאום מס", "בעלי היחידות", "קרן נאמנות", "פיקדון", "חברה מנהלת", "גוף מוסדי", "מסלול השקעה", "קרן כספית", "קרן סל",
  "בנק ישראל", "רשות המסים", "הביטוח הלאומי", "תשואה", "תשואה שנתית ממוצעת", "אינפלציה", "הצמדה", "תקנון", "שאירים", "ברוקר",
  "בית השקעות", "צו הרחבה", "כספים הוניים", "לעקל", "עיקול", "מס רווח הון", "יועץ השקעות", "שער חליפין", "מנפיק", "צמוד מדד",
];
/** Inflected forms of a row's name (plural, construct, with the article inside), which count as that row on a page. */
const FORMS: Record<string, string> = {
  "קופות גמל": "קופת גמל",
  "קופות הגמל": "קופת גמל",
  "קרנות פנסיה": "קרן פנסיה",
  "קרנות הפנסיה": "קרן פנסיה",
  "ניירות ערך": "נייר ערך",
  "ניירות הערך": "נייר ערך",
  "איגרות חוב": "איגרת חוב",
  "איגרות החוב": "איגרת חוב",
  "מחיר הקנייה": "מחיר קנייה",
  "קרנות סגורות": "קרן סגורה",
  "קרנות נאמנות": "קרן נאמנות",
  "קרנות הנאמנות": "קרן נאמנות",
  "פיקדונות": "פיקדון",
  "מניה": "מניות",
  "יחידות": "יחידה",
  "מנהל הקרן": "מנהל קרן",
  "מנהלי קרנות": "מנהל קרן",
  "חברה המנהלת": "חברה מנהלת",
  "חברות מנהלות": "חברה מנהלת",
  "חברות המנהלות": "חברה מנהלת",
  "גופים מוסדיים": "גוף מוסדי",
  "שכר המבוטח": "שכר מבוטח",
  "עובר ושב": "חשבון עובר ושב",
  "עמיתים": "עמית",
  "נכס המעקב": "נכס מעקב",
  "מקדמי המרה": "מקדם המרה",
  "מקדם ההמרה": "מקדם המרה",
  "מקדמי ההמרה": "מקדם המרה",
  "עמלות הפצה": "עמלת הפצה",
  "מסלולי ההשקעה": "מסלול השקעה",
  "התשואה הצפויה": "תשואה צפויה",
  "עמלות הקנייה והמכירה": "עמלת קנייה ומכירה",
  "ניהול אישי": "קופת גמל בניהול אישי",
  "קרנות כספיות": "קרן כספית",
  "קרנות סל": "קרן סל",
  "תלושי שכר": "תלוש שכר",
  "תלוש השכר": "תלוש שכר",
  "מסלול ברירת המחדל": "מסלול ברירת מחדל",
};

/** Phrases the vocabulary holds that are not financial terms a reader needs explained, each with its reason. */
const NOT_A_TERM: Record<string, string> = {
  "הודעה מראש": "everyday words: notice given in advance",
  "ימי עסקים": "everyday words: business days",
  "חשבון חדש": "everyday words: a new account",
  "הפקדה חודשית": "everyday words: a monthly deposit, read from its two words",
  "שם מסלול": "everyday words: a track's name",
  "שם קרן": "everyday words: a fund's name",
  "חוק השקעות משותפות בנאמנות": "the name of a law, cited as a source, not a term",
  "רשימת מסלולי ההשקעה": "the name of a regulator's document, cited as a source, not a term",
  "ברירת מחדל": "everyday words: a default; where a page means the default track it marks the row מסלול ברירת מחדל",
  "אין אפשרות שבירה": "everyday words: a deposit that cannot be broken; the row is שבירת פיקדון",
  "מועד קבוע": "everyday words: a fixed date",
  "הכנסות אחרות": "everyday words: other income, read from its two words",
  "מסלול א": "one bank's own name for a track, shown as a name",
  "מסלול ב": "one bank's own name for a track, shown as a name",
  "יחידת המסחר": "explained where it stands: the sentence says the trading unit is one unit",
  'ח"ץ': "the name of a non-tradable government bond series, shown as a name beside who holds it",
};

// Today's leftovers: page -> financial terms it names with no row and no <Term>. Each is a row to write once an official text
// defines it (or, where a row exists under another form, a variant or a FORMS entry to add), or a mark to put on the page.
// Names and everyday words are set aside in NOT_A_TERM.
// כספים הוניים is one company's split of provident money (the rule base, IRA-07): no official text defines it yet.
const NAMED_WITHOUT_ROW: Record<string, readonly string[]> = {
  "guide/ira-provident": ["כספים הוניים"],
};

/** The pages scanned: each file under content/ by its path (`guide/x`), and each `export const` block of copy.ts (`copy:name`). */
const sitePages = (): Record<string, string> => {
  const out: Record<string, string> = Object.fromEntries(
    sources.filter((f) => rel(f).startsWith("content/")).map((f) => [rel(f).slice("content/".length).replace(/\.tsx?$/, ""), read(f)]),
  );
  const copy = read(join(app, "copy.ts"));
  const heads = [...copy.matchAll(/^export const (\w+)/gm)];
  heads.forEach((m, i) => (out[`copy:${m[1]}`] = copy.slice(m.index, heads[i + 1]?.index ?? copy.length)));
  return out;
};
const fileOf = (page: string) => (page.startsWith("copy:") ? `site/app/copy.ts, export const ${page.slice(5)}` : `site/app/content/${page}.tsx`);

describe("no page names a financial term that has no row", () => {
  const vocabulary = ruleBaseTerms();
  for (const t of SITE_VOCABULARY) if (!vocabulary.has(norm(t))) vocabulary.set(norm(t), "SITE_VOCABULARY");
  const pages = sitePages();
  const rowSpellings = new Set([...spelled, ...Object.keys(FORMS).map(norm)]);
  it("the vocabulary is read from the rule base and SITE_VOCABULARY, and every page is scanned", () => {
    expect(vocabulary.size).toBeGreaterThan(300);
    expect(Object.keys(pages).filter((p) => p.startsWith("guide/")).length).toBeGreaterThan(20);
    expect(Object.keys(pages).filter((p) => p.startsWith("copy:")).length).toBeGreaterThan(40);
  });
  it("each FORMS entry names a row, and is not itself a row's name", () => {
    expect(Object.entries(FORMS).filter(([form, row]) => !names.has(row) || spelled.has(norm(form)))).toEqual([]);
  });
  it("matches today's leftovers, so the list only shrinks", () => {
    const vocab = [...vocabulary.keys()].filter((v) => !(v in NOT_A_TERM));
    const got = unexplained(pages, vocab, rowSpellings);
    expect(ratchetReport(got, NAMED_WITHOUT_ROW, vocabulary)).toBe("");
    expect(got).toEqual(NAMED_WITHOUT_ROW);
  });
  it("each NOT_A_TERM phrase is still in the vocabulary and has no row", () => {
    const stale = Object.keys(NOT_A_TERM).filter((t) => !vocabulary.has(t) || rowSpellings.has(t));
    const why = stale.map((t) =>
      rowSpellings.has(t)
        ? `- "${t}" now has a glossary row: remove it from NOT_A_TERM in this file.`
        : `- "${t}" is no longer in any Terms table of .claude/skills/il-finance/references (a rule-base change removed or reworded it): remove it from NOT_A_TERM in this file.`,
    );
    expect(stale, `NOT_A_TERM holds phrases it no longer needs:\n${why.join("\n")}`).toEqual([]);
  });
  it("the failure message names the term, its rule-base file, the page and the fixes", () => {
    const msg = ratchetReport({ "guide/x": ["צו הרחבה"] }, { "guide/y": ["קרן פנסיה"] }, new Map([["צו הרחבה", "keren-hishtalmut.md"]]));
    expect(msg).toContain('The page guide/x (site/app/content/guide/x.tsx) names "צו הרחבה"');
    expect(ratchetReport({ "copy:brands": ["תשואה"] }, {}, new Map([["תשואה", "SITE_VOCABULARY"]]))).toContain("(site/app/copy.ts, export const brands) names \"תשואה\", a financial term from SITE_VOCABULARY");
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

// ---------------------------------------------------------------- the first use on a page is marked

// on the securities account's page קרנות סל, קרנות מחקות, מק״מ and איגרות חוב
// ממשלתיות had rows but no mark where the page first names them, and on the government bond's page the mark of איגרת חוב sat on a later
// use. The rule (docs/copy.md 1, "Financial terms"; docs/design-system.md 11, "Term") is written: the first time a glossary term appears on
// a page it opens its card, and later uses are plain. This check holds every guide and exposure page to it.
// What counts: the page's prose in the order the page shows it (a guide's what, use, who, money in and out, tax, risks; an exposure
// page's card, what, holdNote, risks; a page of its own layout in file order); a row's name, its FORMS, and a variant that is a phrase or an
// abbreviation (a one-word variant such as חיסכון or כללי is everyday Hebrew far more often than the row). A <Term> of the row is a mark,
// and so is a <Link> whose words are the row's (it leads to the row's own page). A string the reader sees (a callout's title, a table's
// head or cell, a row's value, words in quotes inside the prose) counts like any other text: every such prop takes a ReactNode, so the
// mark goes there. Only strings that name things are left out (id, key, prefix, className, figure and rule ids, imports). The lede under
// a page's title is the page's own one-line definition (copy.ts or the term's row) and carries no marks. Strings are read too (a
// callout's title, a table cell, a track's name in quotes), and so are the words before a company list (`<VariesByCompany lead>`,
// text that takes a ReactNode). The four AMBIGUOUS rows are left to the page's hand, so a check by eye is still owed there: מכירה in its tax
// sense sat unmarked on four pages.

/** The page's own subject: its title is the row, and the page explains it at length, so it does not open its own card. */
const OWN_SUBJECT: Record<string, readonly string[]> = {
  "guide/bank-deposit": ["פיקדון"],
  "guide/brokerage-account": ["חשבון ניירות ערך"],
  "guide/current-account": ["חשבון עובר ושב"],
  "guide/government-bond": ["איגרות חוב ממשלתיות"],
  "guide/ira-hishtalmut": ["קרן השתלמות בניהול אישי"],
  "guide/ira-provident": ["קופת גמל בניהול אישי"],
  "guide/keren-hishtalmut": ["קרן השתלמות"],
  "guide/kupat-gemel-lehashkaa": ["קופת גמל להשקעה"],
  "guide/makam": ['מק"מ'],
  "guide/money-market-fund-daily": ["קרן כספית"],
  "guide/money-market-fund-renewable": ["קרן כספית מתחדשת"],
  "guide/mutual-funds": ["קרן נאמנות"],
  "guide/pension-comprehensive": ["קרן חדשה מקיפה"],
  "guide/provident-for-annuity": ["תגמולים ואישית לפיצויים"],
  "guide/savings-plan": ["תוכנית חיסכון"],
  "exposure/general-track": ["מסלול כללי"],
  "exposure/index-sp500": ["S&P 500"],
};
/**
 * Rows whose name is also an everyday word with another sense: no scan tells which is meant, so the page marks the row by hand where it
 * means the row. Each with the reason.
 */
const AMBIGUOUS: Record<string, string> = {
  "מניות": "the row is a track named מניות; on most pages the word means shares",
  "ניכוי": "the row is a deduction from taxable income; the word also means withholding and 'minus' (בניכוי האינפלציה)",
  "מדד": "the row is the price index a tax computation uses; the word also means a stock index (קרן על מדד)",
  "מכירה": "the row is a sale for tax; the word also means a market's selling price and the selling half of a trading fee",
};
/** Phrases on a page where a row's spelling carries another sense, blanked before the scan, each checked to be on its page. */
const OTHER_SENSE: Record<string, readonly string[]> = {
  "guide/mutual-funds": ["הקרן מחקה מדד" /* "the fund tracks an index": a verb, not the row */, "מחיר קנייה ומחיר מכירה" /* a market maker's quotes */],
  "guide/money-market-fund-renewable": ["המרווח בין מועדים" /* the interval between dates, not a rate's spread */],
  "guide/money-market-fund-daily": ["מהר הכסף" /* "how fast the money" (comes back), in the visual's caption, not the service הר הכסף */],
  "exposure/index-sp500": ["תשואה כוללת נטו" /* the name of one version of the index, beside its gross twin */],
  "guide/makam": ["גודל היחידה" /* a trading unit */, "מחיר הקנייה" /* the price paid for a makam (the page and its visual's chart) */, "מדמי ניהול הפיקדון" /* part of a custody fee's name */],
};
/**
 * A row's plural in construct counts as the row without a FORMS line: קרנות חוץ on three pages and עמלות
 * קנייה ומכירה on one were first uses no scan saw, because only the forms FORMS names were matched.
 */
const PLURAL_HEADS: readonly (readonly [string, string])[] = [["קרן ", "קרנות "], ["קופת ", "קופות "], ["איגרת ", "איגרות "], ["חשבון ", "חשבונות "], ["פיקדון ", "פיקדונות "], ["עמלת ", "עמלות "], ["תעודת ", "תעודות "], ["מסלול ", "מסלולי "], ["נייר ", "ניירות "]];
/** A content file that is a piece of other pages, not a page. */
const FRAGMENTS = ["guide/open-tax"];
// Today's leftovers: page -> rows whose first use there is unmarked. The content files had none after the sweep; these
// are the visuals' (components/guide-signature), found when the scan began to read them the same day: each is a row the visual names
// before the page's mark (or with no mark on the page), to be marked in the visual (copy split into before/term/after, as in
// pension.tsx), or a false hit to put in OTHER_SENSE. A figure's input names are sheet text and skipped. The one left is the column
// name "אותו כסף בחשבון ניירות ערך", split across two copy strings (names, fine).
const FIRST_USE_UNMARKED: Record<string, readonly string[]> = {
};

const blankOut = (m: string) => m.replace(/[^\n]/g, " ");
/** Comments blanked in place, so every offset is the source's. */
const codeInPlace = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, blankOut).replace(/^\s*\/\/.*$/gm, blankOut);
// an exposure page's card (`glance`) stands beside its title, before every section
const SECTION_ORDER = ["glance", "what", "use", "holdNote", "who", "switchLine", "inoutRows", "afterTax", "risks"];
interface Use {
  at: number;
  row: string;
  marked: boolean;
  /** The place on the page: the section's place in the page's order times 1e7, plus the offset. */
  rank: number;
}
/** Every use of a row on a page, marked or not, in the order the page shows them. */
const usesOf = (src: string, rowOf: ReadonlyMap<string, string>, otherSense: readonly string[] = []): Use[] => {
  let s = codeInPlace(src).replace(/termIds\s*[:=]\s*\[[^\]]*\]/g, blankOut);
  const keys = [...s.matchAll(/^ {2}(\w+):/gm)];
  const spans: [number, number][] = [];
  if (keys.length) {
    const part = Object.fromEntries(keys.map((m, i) => [m[1]!, [m.index!, keys[i + 1]?.index ?? s.length] as [number, number]]));
    for (const k of [...SECTION_ORDER.filter((k) => k in part), ...Object.keys(part).filter((k) => !SECTION_ORDER.includes(k))]) spans.push(part[k]!);
  } else spans.push([0, s.length]);
  const rank = (at: number) => spans.findIndex(([a, b]) => at >= a && at < b) * 1e7 + at;
  const uses: Omit<Use, "rank">[] = [];
  s = s.replace(/<Term\b[^>]*?(?:\/>|>[\s\S]*?<\/Term>)/g, (m, at: number) => {
    for (const id of termIdsIn(m)) uses.push({ at, row: id, marked: true });
    return blankOut(m);
  });
  // a "?" opens its terms' cards, with its own words over them (the banks table's rate head): the words are a marked use
  s = s.replace(/<HelpMark\b[^>]*?\/>/g, (m, at: number) => {
    for (const id of termIdsIn(m)) uses.push({ at, row: id, marked: true });
    return blankOut(m);
  });
  s = s.replace(/<Link\b[^>]*>([^<{]*)<\/Link>/g, (m, inner: string, at: number) => {
    const t = norm(entities(inner));
    const row = rowOf.get(t) ?? rowOf.get(t.replace(/^[והבלמשכ]{1,4}/, ""));
    if (row) uses.push({ at, row, marked: true });
    return blankOut(m);
  });
  // `norm` without its trim, so every offset stays the source's
  const normInPlace = (t: string) => t.replace(/[״”“]/g, '"').replace(/[׳’]/g, "'").replace(/־/g, "-");
  // a string a reader sees (a title, a table head or cell, a row's value) is text; only the strings that name things are blanked
  s = normInPlace(
    s
      .replace(/\b(?:id|prefix|key|name|to|href|className|tone|src|alt)=(?:"[^"\n]*"|\{[^}\n]*\})/g, blankOut)
      .replace(/\b(?:id|key|to|href|tone|kind|icon|className)\s*:\s*"[^"\n]*"/g, blankOut)
      .replace(/\b(?:figure|rule|n)\(\s*"[^"\n]*"(?:\s*,\s*"[^"\n]*")*\s*\)/g, blankOut)
      .replace(/^import\b.*$/gm, blankOut)
      .replace(/`[^`]*`/g, blankOut),
  );
  for (const o of otherSense) s = s.split(normInPlace(o)).join(blankOut(o));
  for (const sp of [...rowOf.keys()].filter((x) => x.length >= 3).sort((a, b) => b.length - a.length))
    s = s.replace(named(sp), (m, at: number) => (uses.push({ at, row: rowOf.get(sp)!, marked: false }), " ".repeat(m.length)));
  return uses.map((u) => ({ ...u, rank: rank(u.at) })).sort((a, b) => a.rank - b.rank);
};
/** Where a page's visual ends its sections' order: under "use", or under "what" when the page has no "use" (routes/guide.tsx). */
const visualCut = (src: string): number => {
  const s = codeInPlace(src);
  const keys = [...s.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]!);
  const order = [...SECTION_ORDER.filter((k) => keys.includes(k)), ...keys.filter((k) => !SECTION_ORDER.includes(k))];
  const after = order.indexOf(keys.includes("use") ? "use" : "what");
  return (after + 1) * 1e7;
};
/** Every use of a row on a guide page, its visual's included where the page shows it. */
const pageUses = (src: string, visual: string | undefined, rowOf: ReadonlyMap<string, string>, otherSense: readonly string[] = []): Use[] => {
  const main = usesOf(src, rowOf, otherSense);
  if (!visual) return main;
  const cut = visualCut(src);
  return [...main.filter((u) => u.rank < cut), ...usesOf(visual, rowOf, otherSense), ...main.filter((u) => u.rank >= cut)];
};

// on the government bond's page עמלה was first met in the visual's note ("לפני עמלה
// ומס") while its mark sat lower, in "who"; the scan read only the page's content file. A guide's visual (components/guide-signature)
// sits under its "use" section, and its words are copy.ts strings, so the scan reads the visual's source with each `copy.x.y` replaced
// by that string's words (an object's strings joined; an index such as copy.pages[id] is left blank).
const SIGNATURE_DIR = join(app, "components/guide-signature");
/** The page -> its visual's source file, read from the registry in components/guide-signature/index.tsx. */
const signatureFiles = (): Record<string, string> => {
  const idx = read(join(SIGNATURE_DIR, "index.tsx"));
  const fileOf = Object.fromEntries([...idx.matchAll(/import \{ (\w+Visual) \} from "\.\/([\w-]+)"/g)].map((m) => [m[1]!, m[2]!]));
  return Object.fromEntries(
    [...idx.matchAll(/^\s+"?([\w-]+)"?: (\w+Visual),$/gm)].filter((m) => fileOf[m[2]!]).map((m) => [`guide/${m[1]}`, join(SIGNATURE_DIR, `${fileOf[m[2]!]}.tsx`)]),
  );
};
/** The words of a path into the guideSignature copy: a string, or an object's strings joined; nothing for a path it cannot follow. */
const copyWords = (path: string): string => {
  let v: unknown = guideSignature;
  for (const k of path.split(".").filter(Boolean)) {
    if (typeof v === "string") break; // a string's method (copy.x.replace) reads as the string
    v = v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined;
  }
  const leaves = (x: unknown): string[] => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(leaves) : []);
  return leaves(v).join(" · ").replace(/[{}\n]/g, " ");
};
/**
 * A visual's source as the reader meets it: every `copy.x.y` replaced by its words, and a local that names a block of the copy
 * (`const story = copy.hishtalmut.story`) read where each of its strings is used, not where it is declared.
 */
const visualText = (file: string): string => {
  let src = codeInPlace(read(file));
  const aliases = [...src.matchAll(/\bconst (\w+) = copy((?:\.[\w$]+)+);/g)].map((m) => [m[1]!, m[2]!] as const);
  for (const [name, path] of aliases) {
    src = src.replace(new RegExp(`\\bconst ${name} = copy${esc(path)};`), " ");
    src = src.replace(new RegExp(`(?<![\\w.$])${name}((?:\\.[\\w$]+)+)`, "g"), (_m, rest: string) => `copy${path}${rest}`);
  }
  // the names of a figure's inputs (`{ [copy.x.y]: value }`) and an entered value's `about` (its fourth argument) are its sheet too
  // (17 of the 31 leftovers were input names such as "האינפלציה שהאתר מניח")
  src = src.replace(/\[\s*(?:copy(?:\.[\w$]+)+|`[^`]*`)\s*\]\s*:/g, blankOut);
  // and so are the names of a gap's two figures (`differenceOf([copy.x.y, a], [copy.x.y, b], …)`, lib/value.ts)
  src = src.replace(/(differenceOf\(\s*\[)(\s*copy(?:\.[\w$]+)+)([^\]]*\]\s*,\s*\[)(\s*copy(?:\.[\w$]+)+)/g, (_m, a: string, n1: string, b: string, n2: string) => a + blankOut(n1) + b + blankOut(n2));
  // (the visuals' own entered value, a field's)
  src = src.replace(/(\b(?:enteredValue|typed)\([^()]*?,[^()]*?,[^()]*?,\s*)copy(?:\.[\w$]+)+(?=\s*\))/g, (_m, head: string) => head + " ");
  // an `about` text is a figure's sheet, opened by a tap, not the page's text where the figure is declared
  return src.replace(/\bcopy((?:\.[\w$]+)+)(\[)?/g, (_m, p: string, index?: string) => (index || /\.about\b/.test(p) ? " " : ` ${copyWords(p)} `));
};
/** The rows whose first use on the page is not marked. */
const firstUnmarked = (src: string, rowOf: ReadonlyMap<string, string>, skip: readonly string[] = [], otherSense: readonly string[] = [], visual?: string): string[] => {
  const first = new Map<string, boolean>();
  for (const u of pageUses(src, visual, rowOf, otherSense)) if (!first.has(u.row)) first.set(u.row, u.marked);
  return [...first].filter(([row, marked]) => !marked && !skip.includes(row)).map(([row]) => row).sort();
};

describe("the first use of a term on a page opens its card", () => {
  const rowOf = new Map<string, string>();
  for (const r of rows) rowOf.set(norm(r.he), r.he);
  for (const r of rows) for (const v of r.variants) if (!rowOf.has(norm(v)) && /[ "]/.test(norm(v))) rowOf.set(norm(v), r.he);
  for (const [form, row] of Object.entries(FORMS)) if (!rowOf.has(norm(form))) rowOf.set(norm(form), row);
  for (const r of rows) for (const [one, many] of PLURAL_HEADS) if (r.he.startsWith(one)) { const f = norm(many + r.he.slice(one.length)); if (!rowOf.has(f)) rowOf.set(f, r.he); }
  const pages = Object.entries(sitePages()).filter(([p]) => /^(guide|exposure)\//.test(p) && !FRAGMENTS.includes(p) && p !== "guide/index" && p !== "exposure/index" && p !== "guide/types");
  const visuals = Object.fromEntries(Object.entries(signatureFiles()).map(([p, f]) => [p, visualText(f)]));
  it("every guide and exposure page is read, and every guide's visual", () => {
    expect(pages.length).toBeGreaterThan(20);
    expect(Object.keys(visuals).length).toBeGreaterThan(7);
    expect(Object.keys(visuals).filter((p) => !pages.some(([q]) => q === p))).toEqual([]);
    expect(visuals["guide/government-bond"]).toContain(guideSignature.bond.note.before);
  });
  it("matches today's leftovers, so the list only shrinks", () => {
    const got = Object.fromEntries(
      pages.map(([p, src]) => [p, firstUnmarked(src, rowOf, [...(OWN_SUBJECT[p] ?? []), ...Object.keys(AMBIGUOUS)], OTHER_SENSE[p] ?? [], visuals[p])] as const).filter(([, b]) => b.length),
    );
    expect(got, "a row's first use on these pages has no <Term>: mark that use (and move a later mark of the row there), or, if the spelling has another sense there, add the phrase to OTHER_SENSE").toEqual(FIRST_USE_UNMARKED);
  });
  it("each OWN_SUBJECT, AMBIGUOUS and OTHER_SENSE entry still applies", () => {
    expect(Object.values(OWN_SUBJECT).flat().filter((r) => !names.has(r))).toEqual([]);
    expect(Object.keys(AMBIGUOUS).filter((r) => !names.has(r))).toEqual([]);
    const src = Object.fromEntries(pages);
    expect(Object.entries(OTHER_SENSE).flatMap(([p, os]) => os.filter((o) => !norm(`${src[p] ?? ""} ${visuals[p] ?? ""}`).includes(norm(o))).map((o) => `${p}: ${o}`))).toEqual([]);
  });
  it("every row a page marks ships with it, its visual's marks included: in its termIds, or a row of its product (lib/guide.server.ts)", () => {
    const files = signatureFiles();
    const bad = pages.flatMap(([p, src]) => {
      const id = p.slice(p.indexOf("/") + 1);
      const own = rows.filter((r) => (p.startsWith("guide/") ? r.wrapper_ids : r.exposure_ids)?.includes(id)).map((r) => r.he);
      const listed = new Set([...termIdsIn(code(src).replace(/<(?:Term|HelpMark)\b[^>]*>/g, "")), ...own]);
      const visual = files[p] ? code(read(files[p]!)) : "";
      const marked = new Set(termIdsIn(`${code(src).replace(/termIds\s*[:=]\s*\[[^\]]*\]/g, "")} ${visual}`).filter((i) => !i.startsWith("{")));
      return [...marked].filter((i) => !listed.has(i)).map((i) => `${p}: ${i}`);
    });
    expect(bad).toEqual([]);
  });
  it("the scanner reads the page's order, marks, links and strings", () => {
    const r = new Map([["קרן סל", "קרן סל"], ["קרנות סל", "קרן סל"], ["בורסה", "בורסה"], ['מק"מ', 'מק"מ']]);
    expect(firstUnmarked(`<p>קרנות סל ו<Term id="קרן סל">קרן סל</Term></p>`, r)).toEqual(["קרן סל"]);
    expect(firstUnmarked(`<p><Term id="קרן סל">קרנות סל</Term> וקרן סל</p>`, r)).toEqual([]);
    expect(firstUnmarked(`<p><Link to="/x">קרן סל</Link>, מק״מ</p>`, r)).toEqual(['מק"מ']);
    // a title, a head or a cell is text the reader sees; an id or a key is not
    expect(firstUnmarked(`<Callout title="קרן סל">x</Callout> cells: ["בבורסה"]`, r)).toEqual(["בורסה", "קרן סל"]);
    expect(firstUnmarked(`<Num id="קרן סל" /> { key: "בורסה", head: <Term id="בורסה">בורסה</Term> }`, r)).toEqual([]);
    // a guide's risks come after its what, whatever the file's order
    expect(firstUnmarked(`  risks: () => <p>בבורסה</p>,\n  what: () => <p><Term prefix="ב" id="בורסה">בורסה</Term></p>,\n`, r)).toEqual([]);
    expect(firstUnmarked(`<p>הקרן סל עוקבת</p>`, r, [], ["הקרן סל עוקבת"])).toEqual([]);
    // up to four prefix letters: ו, כש and ה
    expect(firstUnmarked(`<p>וכשהבורסה סגורה, <Term id="בורסה">בורסה</Term></p>`, r)).toEqual(["בורסה"]);
    // a visual sits under "use" and before "who"
    const page = `  what: () => <p>x</p>,\n  who: () => <p><Term id="בורסה">בורסה</Term></p>,\n  use: () => <p>y</p>,\n`;
    expect(firstUnmarked(page, r, [], [], `<p>בבורסה</p>`)).toEqual(["בורסה"]);
    expect(firstUnmarked(page, r, [], [], `<p><Term prefix="ב" id="בורסה">בורסה</Term></p>`)).toEqual([]);
  });
});
