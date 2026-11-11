// Ratchets of the kit. Each
// pattern the kit owns is counted outside the kit, per file. Today's leftovers are listed by name below; a new use anywhere fails,
// and a file that drops below its number fails too, until its line is lowered or removed, so the lists only shrink. To clear a
// leftover, move it to the kit piece named in the test, then lower its number here. Kit round 2 (8dd1f013:research/specs/2026-10-25-ui-kit/
// round-2.md) adds the pieces that empty the input list.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const rel = (f: string) => relative(root, f).split("\\").join("/");
const files = walk(root).filter((f) => f.endsWith(".tsx") && !rel(f).startsWith("components/kit/"));
/** Source without block comments and whole-line `//` comments. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const classStrings = (s: string) => [...s.matchAll(/className=(?:\{cx\()?["'`]([^"'`]*)["'`]/g)].map((m) => m[1]!);

// Today's leftovers, per file.
const PILL: Record<string, number> = {
    "components/guide/sections.tsx": 4,
    "components/timeline/Timeline.tsx": 2,
  };
const CARD: Record<string, number> = {
  };
const INPUT: Record<string, number> = {
    "components/decoder/tracks.tsx": 1,
    "components/invest/title.tsx": 1,
    "components/search.tsx": 2,
    "components/transfer/panel.tsx": 1,
    "routes/companies.tsx": 1,
  };
const SELECT: Record<string, number> = {
  };
const STATGRID: Record<string, number> = {
  };
/** A fold whose label is a heading, built by hand from Disclosure (`as="h2"` and the like): FoldGroup has the heading and its count. */
const HEADINGFOLD: Record<string, number> = {
  };
const OLDUI: Record<string, number> = {
    "components/Sheet.tsx": 1,
    "components/provenance.tsx": 1,
    "components/provenance-sheets.tsx": 1,
  };

const patterns: Record<string, { kit: string; count: (s: string) => number; allowed: Record<string, number> }> = {
  pill: {
    kit: "ChipList or ChoiceChips (the pill classes sec-chip and a-chip belong to them)",
    count: (s) => (s.match(/\b(sec-chip|a-chip)\b/g) ?? []).length,
    allowed: PILL,
  },
  card: {
    kit: "Card (a hand-written bg-card border rounded-lg surface)",
    count: (s) => classStrings(s).filter((c) => /\bbg-card\b/.test(c) && /\bborder\b/.test(c) && /\brounded-(lg|xl)\b/.test(c)).length,
    allowed: CARD,
  },
  input: {
    kit: "NumberField, RangeField or PercentField (a raw <input> or <select>; text and select fields come in kit round 2)",
    count: (s) => [...s.matchAll(/<input\b[^>]*>/g)].filter((m) => !/type="(checkbox|radio|range|hidden)"/.test(m[0])).length + (s.match(/<select\b/g) ?? []).length,
    allowed: INPUT,
  },
  select: {
    kit: "SelectField (a raw <select>)",
    count: (s) => (s.match(/<select\b/g) ?? []).length,
    allowed: SELECT,
  },
  statGrid: {
    kit: "StatRow or KeyValueList (a <dl> laid out as a grid)",
    count: (s) => (s.match(/<dl\b[^>]*className="[^"]*\bgrid\b/g) ?? []).length,
    allowed: STATGRID,
  },
  headingFold: {
    kit: "FoldGroup (variant=\"section\" for a topic of cards, with its count; open and onOpenChange when the page opens it): a Disclosure with as=\"h2\", \"h3\" or \"h4\"",
    count: (s) => [...s.matchAll(/<Disclosure\b[^>]*?\bas="h[2-4]"/g)].length,
    allowed: HEADINGFOLD,
  },
  oldUi: {
    kit: "components/kit (ui.tsx is a legacy re-export)",
    count: (s) => (s.match(/from\s+["'](?:\.\.?\/)+(?:components\/)?ui["']/g) ?? []).length,
    allowed: OLDUI,
  },
};

// The rules behind a fact are one chip with a count, never a row or a column of codes. Left: the lists
// inside a figure's sheet, already one tap from the reading, and the open questions of a held product, whose codes are what the reader is told.
patterns["a row of rule chips"] = {
  count: (s) => (s.match(/\.map\(\([^)]*\)\s*=>\s*\(?\s*(?:<span key=\{\w+\}>\s*)?<RuleRef\b/g) ?? []).length,
  kit: "RulesLine or RulesChip (provenance.tsx)",
  allowed: { "components/provenance-sheets.tsx": 4, "routes/exposure.tsx": 2 },
};

// a name in a plain <bdi> takes its direction from its first letter, so a Hebrew name that starts with Latin
// letters ("MTF סל (4D) S&P 500") was laid out left to right and read backwards. Names go through MixedName; the indices page is done.
patterns["a name in a plain bdi"] = {
  count: (s) => (s.match(/<bdi>\{[^}]*([nN]ame|manager)[^}]*\}<\/bdi>/g) ?? []).length,
  kit: "MixedName (a name that may mix Hebrew and Latin)",
  allowed: {
    "components/decoder/company-terms.tsx": 1,
    "components/decoder/institutions/brokerage-card.tsx": 1,
    "components/fees/FeeDragChart.tsx": 3,
    "components/fees/parts.tsx": 1,
    "components/fees/sensitivity.tsx": 2,
    "components/guide-signature/current-account.tsx": 3,
    "components/guide-signature/keren-hishtalmut.tsx": 2,
    "components/guide-signature/makam.tsx": 1,
    "components/guide-signature/pension.tsx": 1,
    "components/guide/sections.tsx": 1,
    "components/tracks/list.tsx": 2,
    "routes/company.tsx": 1,
    "routes/track.tsx": 2,
  },
};

// a text action is the kit's Button `quiet`, and a choice that changed something else, with the way back, is the
// kit's AlsoChanged; never a <button> styled by hand as an underlined link. Today's leftovers: other pages', and the stairs' link
// on the indices page.
patterns["a button styled by hand as a link"] = {
  count: (s) => (s.match(/<button\b[^>]*className="[^"]*\btext-link\b[^"]*\bunderline\b/g) ?? []).length,
  kit: "Button variant=quiet, or AlsoChanged for a change with its way back",
  allowed: {
    "components/invest/stairs.tsx": 1,
    "components/search-results.tsx": 2,
    "root.tsx": 1,
    "routes/not-found.tsx": 1,
  },
};

for (const [name, p] of Object.entries(patterns)) {
  describe(`ratchet: ${name}`, () => {
    const now: Record<string, number> = {};
    for (const f of files) {
      const n = p.count(code(readFileSync(f, "utf8")));
      if (n) now[rel(f)] = n;
    }
    it(`no new use outside the kit: use ${p.kit}`, () => {
      const over = Object.entries(now).filter(([f, n]) => n > (p.allowed[f] ?? 0)).map(([f, n]) => `${f}: ${n} (allowed ${p.allowed[f] ?? 0})`);
      expect(over).toEqual([]);
    });
    it("the list only shrinks: lower a number once its file has fewer", () => {
      const stale = Object.entries(p.allowed).filter(([f, n]) => (now[f] ?? 0) < n).map(([f, n]) => `${f}: allowed ${n}, now ${now[f] ?? 0}`);
      expect(stale).toEqual([]);
    });
  });
}

describe("no field painted in the edge colour", () => {
  // --input is the edge token (borders); a field's background is --card (.field-box). The index page's account select and a
  // textarea on the fees page rendered light grey with bg-input.
  it("bg-input is not used", () => {
    const hits = walk(root).filter((f) => f.endsWith(".tsx") && /\bbg-input\b/.test(code(readFileSync(f, "utf8")))).map(rel);
    expect(hits).toEqual([]);
  });
});

// Colour inside a chart (guidelines/charts.md; design-system section 12): two lines of one chart never look alike. The roles each
// chart draws together, pair by pair, by the palette validator's own method (lib/palette-check.ts): under 15 ΔE to normal vision,
// or under 6 to a colour-blind reader (the validator's floor, legal only with words on the marks), a pair fails. Today's pairs below
// the line are listed by name; a new chart or a new role adds its roles to CHART_ROLES, and the list of leftovers only shrinks.
// The step labels of how soon money is back (access-*) are left out: an order told by a word and an icon, not a chart's identities.
import { cssVars, deltaE, resolveOklch } from "../../lib/palette-check";

const CHART_ROLES: Record<string, string[]> = {
  "the timeline (3.4)": ["chart-value", "chart-fee", "chart-tax-1", "chart-tax-2", "chart-contributions"],
  "the fee-drag chart (7.3)": ["chart-fee-1", "chart-fee-2", "chart-fee-3", "chart-fee-4", "chart-fee-total"],
  ChangeChart: ["chart-lever-1", "chart-lever-2", "chart-lever-3", "chart-lever-4"],
  "the receipt's lines and closing bar (indices page)": ["chart-by-account", "chart-by-fund", "chart-tax"],
  CostStack: ["chart-cost-trade", "chart-cost-custody", "chart-cost-fixed", "chart-cost-fx", "chart-cost-other", "chart-cost-fund", "chart-tax"],
  PileBar: ["chart-pile-own", "chart-pile-extra", "chart-pile-gain", "chart-pile-fee", "chart-pile-salary-tax", "chart-pile-tax", "chart-pile-loss", "chart-pile-left"],
  StairsChart: ["chart-stairs-start", "chart-stairs-account", "chart-stairs-kind", "chart-stairs-fund", "gain", "loss"],
  "the comparison and exposure charts (6.5, 9.3)": ["chart-option-1", "chart-option-2", "chart-option-3", "chart-baseline"],
  ShareRings: ["chart-stocks", "chart-currency"],
  "the indices page's two kinds of fund": ["chart-kind-unhedged", "chart-kind-hedged"],
  "a guide page's visual (10)": ["chart-value", "chart-alt"],
  "the pension deposit bar (10)": ["chart-value", "chart-alt", "chart-fee-4"],
  LabelChip: ["label-held", "label-trade", "label-follow", "label-currency", "label-tax", "label-payout"],
};
/** Today's pairs below the line, as "chart: role / role". */
const TOO_ALIKE = new Set([
  "the timeline (3.4): chart-value / chart-tax-2",
  "the timeline (3.4): chart-tax-1 / chart-contributions",
  "PileBar: chart-pile-own / chart-pile-gain",
  "PileBar: chart-pile-own / chart-pile-tax",
  "PileBar: chart-pile-gain / chart-pile-tax",
  "StairsChart: chart-stairs-start / loss",
  "StairsChart: chart-stairs-account / gain",
  "the comparison and exposure charts (6.5, 9.3): chart-option-1 / chart-baseline",
  "the comparison and exposure charts (6.5, 9.3): chart-option-2 / chart-baseline",
  "the pension deposit bar (10): chart-value / chart-fee-4",
  "LabelChip: label-held / label-trade",
  "LabelChip: label-held / label-payout",
  "LabelChip: label-trade / label-payout",
  "LabelChip: label-follow / label-tax",
]);
const tooAlike = (vars: Record<string, string>, charts: Record<string, string[]>): string[] =>
  Object.entries(charts).flatMap(([chart, roles]) =>
    roles.flatMap((a, i) =>
      roles.slice(i + 1).flatMap((b) => {
        const x = resolveOklch(vars, a);
        const y = resolveOklch(vars, b);
        if (!x || !y) return [`${chart}: ${!x ? a : b} is not an oklch role`];
        const d = deltaE(x, y);
        return d.normal < 15 || d.colourBlind < 6 ? [`${chart}: ${a} / ${b}`] : [];
      }),
    ),
  );

describe("ratchet: colours inside a chart", () => {
  const vars = cssVars(readFileSync(join(root, "theme.css"), "utf8"));
  const now = tooAlike(vars, CHART_ROLES);
  it("no new pair of a chart's colours too alike to tell apart", () => {
    expect(now.filter((p) => !TOO_ALIKE.has(p))).toEqual([]);
  });
  it("the list only shrinks: remove a pair once it is apart", () => {
    expect([...TOO_ALIKE].filter((p) => !now.includes(p))).toEqual([]);
  });
  it("sees a planted pair: two oranges, and two colours a colour-blind reader cannot tell apart", () => {
    const planted = { "palette-a": "oklch(0.64 0.174 48)", "palette-b": "oklch(0.64 0.2 27)", "role-a": "var(--palette-a)", "role-b": "var(--palette-b)" };
    expect(tooAlike(planted, { planted: ["role-a", "role-b"] })).toEqual(["planted: role-a / role-b"]);
    expect(deltaE([0.64, 0.174, 48], [0.64, 0.2, 27]).normal).toBeLessThan(15);
  });
});

// Process words in what a reader sees (guidelines/wording.md; copy.md 1, "Words that add something"): no decision id (D22), no Claude, no audit and no talk of the
// researcher's reading in the reader's text of the copy, the guide and exposure prose, or a record's Hebrew fields. A decision id as a
// key of a map, and English working notes (never shown), are not reader text. Today's leftovers are the rule records below.
const PROCESS = /(?<![A-Za-z0-9-])D\d{1,3}(?![\d-])(?!["']?\s*:)|\bClaude\b|\baudit\b|קריאת החוקר|קריאה שלנו/g;
const PROCESS_LEFT: Record<string, number> = {
  "data/rules/etf-17.json": 1,
  "data/rules/mf-18.json": 2,
  "data/rules/mf-55.json": 1,
  "data/rules/pf-01.json": 1,
  "data/rules/txf-16.json": 1,
  "data/rules/txf-20.json": 1,
  "data/rules/txs-22.json": 1,
};
/** Source without comments: block and JSX comments, and `//` comments (a `//` after a colon or a quote, as in a URL, stays). */
const uncommented = (src: string): string => src.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\\w])\/\/[^\n]*/g, "$1");
/** Every string under a key ending in `_he`, the fields a record shows the reader. */
const hebrewFields = (o: unknown, key = ""): string[] =>
  typeof o === "string" ? (key.endsWith("_he") ? [o] : []) : Array.isArray(o) ? o.flatMap((v) => hebrewFields(v, key)) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => hebrewFields(v, k)) : [];
const repo = join(root, "../../");
const readerSources = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const f of [join(root, "copy.ts"), ...walk(join(root, "content")).filter((x) => /\.tsx?$/.test(x) && !/\.test\.tsx?$/.test(x))]) out[`site/app/${rel(f)}`] = uncommented(readFileSync(f, "utf8"));
  for (const f of walk(join(repo, "data")).filter((x) => x.endsWith(".json"))) {
    try {
      const text = hebrewFields(JSON.parse(readFileSync(f, "utf8"))).join("\n");
      if (text) out[relative(repo, f).split("\\").join("/")] = text;
    } catch {
      // a file that is not one JSON document is not a record
    }
  }
  return out;
};

describe("ratchet: process words in what a reader sees", () => {
  const now: Record<string, number> = {};
  for (const [f, text] of Object.entries(readerSources())) {
    const n = (text.match(PROCESS) ?? []).length;
    if (n) now[f] = n;
  }
  it("none new: say it in the reader's words, or leave it out", () => {
    expect(Object.entries(now).filter(([f, n]) => n > (PROCESS_LEFT[f] ?? 0)).map(([f, n]) => `${f}: ${n}`)).toEqual([]);
  });
  it("the list only shrinks", () => {
    expect(Object.entries(PROCESS_LEFT).filter(([f, n]) => (now[f] ?? 0) < n).map(([f, n]) => `${f}: allowed ${n}, now ${now[f] ?? 0}`)).toEqual([]);
  });
  it("sees a planted id, a name and the researcher's reading, and skips a key and a comment", () => {
    const planted = uncommented(`a: "כך החלטנו (D22).", b: "לפי Claude", c: "לפי קריאת החוקר", "D20": "x", // D31 in a comment`);
    expect(planted.match(PROCESS)).toEqual(["D22", "Claude", "קריאת החוקר"]);
  });
});

// Words the terminology table replaced (copy.md 10.3, a coined or wrong name where the official or
// everyday one exists). The table's "לא" column is read from the doc itself, so a row added there is checked at once. Left out are
// the words its notes allow in another sense: "מחירון" (the person's own word), "תעריף", "פתוח" and "נעילה" (ordinary words outside
// their one use), "מההפקדות", "מצבירה", "מהצבירה" (allowed in running text and in a quote of a statement), "טרם".
const IN_ANOTHER_SENSE = new Set(["מחירון", "תעריף", "פתוח", "נעילה", "מההפקדות", "מצבירה", "מהצבירה", "טרם"]);
const REPLACED_LEFT: Record<string, number> = {};
const replacedWords = (md: string): string[] => {
  const table = md.split("### 10.3")[1]?.split("### 10.4")[0] ?? "";
  const rows = table.split("\n").filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l)).slice(1);
  return [...new Set(rows.flatMap((r) => [...(r.split("|")[3] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]!)))].filter((w) => !IN_ANOTHER_SENSE.has(w));
};
const HEB = "\\u0590-\\u05FF";
const countWord = (text: string, w: string) => (text.match(new RegExp(`(?<![${HEB}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![${HEB}])`, "g")) ?? []).length;

describe("ratchet: a word the terminology table replaced", () => {
  const words = replacedWords(readFileSync(join(repo, "docs/copy.md"), "utf8"));
  const now: Record<string, number> = {};
  for (const [f, text] of Object.entries(readerSources()).filter(([f]) => f.startsWith("site/"))) {
    const n = words.reduce((sum, w) => sum + countWord(text, w), 0);
    if (n) now[f] = n;
  }
  it("reads the table", () => {
    expect(words).toEqual(expect.arrayContaining(["דמי נאמן", "הוזן על ידך", "סוג העסקה", "דשבורד"]));
  });
  it("none new: use the table's word", () => {
    expect(Object.entries(now).filter(([f, n]) => n > (REPLACED_LEFT[f] ?? 0)).map(([f, n]) => `${f}: ${n}`)).toEqual([]);
  });
  it("the list only shrinks", () => {
    expect(Object.entries(REPLACED_LEFT).filter(([f, n]) => (now[f] ?? 0) < n).map(([f, n]) => `${f}: allowed ${n}, now ${now[f] ?? 0}`)).toEqual([]);
  });
  it("sees a planted word, and not the right one inside a longer word", () => {
    expect(countWord("בחרו את סוג העסקה", "סוג העסקה")).toBe(1);
    expect(countWord("בחרו את סוג ההעסקה", "סוג העסקה")).toBe(0);
  });
});

// WIN WIN's tax names TXI OQ19, whose sheet opened only the general lines,
// because the question had no Hebrew title. Every open question a value in data/ names (in its source title or notes, which is
// where the sheet finds it) has `title_he` in data/open-questions.json (an answered question is deleted, so one the file
// lacks fails here as well as in the data check). A value whose source is `open` names its
// question on the page today, so it has no leftovers; the others are listed by name, and the list only shrinks.
const QUESTION_NO_HEBREW = ["BANK OQ2", "BRK OQ13", "CAT OQ22", "CAT OQ4", "CS OQ7", "FXD OQ2", "INS OQ16", "REG OQ12", "TXF OQ10", "TXF OQ19", "TXS OQ17"];

describe("an open question a value names has Hebrew lines", () => {
  const dataRoot = fileURLToPath(new URL("../../../../data/", import.meta.url));
  const questions = new Map((JSON.parse(readFileSync(join(dataRoot, "open-questions.json"), "utf8")) as { id: string; title_he?: string }[]).map((q) => [q.id, q]));
  const named = new Map<string, boolean>(); // id → named by a value whose source is open
  const scan = (o: unknown): void => {
    if (Array.isArray(o)) return o.forEach(scan);
    if (!o || typeof o !== "object") return;
    const v = o as { value?: unknown; source?: { title?: string; strength?: string }; notes?: string };
    if ("value" in v && v.source && typeof v.source === "object") {
      for (const m of `${v.source.title ?? ""} ${v.notes ?? ""}`.matchAll(/\b([A-Z][A-Z0-9]*)[ -]OQ(\d+)\b/g)) {
        const id = `${m[1]} OQ${m[2]}`;
        named.set(id, (named.get(id) ?? false) || v.source.strength === "open");
      }
    }
    Object.values(o).forEach(scan);
  };
  for (const f of walk(dataRoot).filter((x) => x.endsWith(".json") && !x.endsWith("open-questions.json"))) scan(JSON.parse(readFileSync(f, "utf8")));
  const lacking = [...named.keys()].filter((id) => !questions.get(id)?.title_he).sort();

  it("every question an open value names has a Hebrew title", () => {
    expect(lacking.filter((id) => named.get(id))).toEqual([]);
  });
  it("no new question without one, and the leftovers only shrink", () => {
    expect(lacking.filter((id) => !QUESTION_NO_HEBREW.includes(id))).toEqual([]);
    expect(QUESTION_NO_HEBREW.filter((id) => !lacking.includes(id)), "has its Hebrew title or is no longer named: remove it from QUESTION_NO_HEBREW").toEqual([]);
  });
});

describe("ratchet: a formula the site shows has words beside its id", () => {
  // a value sheet read "נוסחה: חישוב של האתר F-92", the id with no words. Every formula id the site's
  // source passes has a Hebrew name in `formulaNames`, which the sheet shows beside the id's chip. Today's leftovers, by id; the list only shrinks.
  const LEFTOVERS = ["F-31", "F-32", "F-45", "F-48", "F-49", "F-52", "F-53", "F-54", "F-86", "F-97", "F-98"];
  const src = walk(root).filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));
  const copySrc = readFileSync(join(root, "copy.ts"), "utf8");
  const block = copySrc.slice(copySrc.indexOf("export const formulaNames"), copySrc.indexOf("_other:", copySrc.indexOf("export const formulaNames")));
  const named = new Set([...block.matchAll(/^\s*"?(F-\d+)"?\s*:/gm)].map((m) => m[1]!));
  const unnamed = [...new Set(src.flatMap((f) => [...code(readFileSync(f, "utf8")).matchAll(/"(F-\d+)"/g)].map((m) => m[1]!)))].filter((id) => !named.has(id));
  it("none new: give the formula a name in formulaNames", () => {
    expect(unnamed.filter((id) => !LEFTOVERS.includes(id)).sort()).toEqual([]);
  });
  it("the list only shrinks", () => {
    expect(LEFTOVERS.filter((id) => !unnamed.includes(id))).toEqual([]);
  });
  it("the index pages' formulas are named", () => {
    for (const id of ["F-65", "F-91", "F-92", "F-93", "F-94", "F-95"]) expect(named.has(id), id).toBe(true);
  });
});
