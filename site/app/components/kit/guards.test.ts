// Guards of the kit (after two layout bugs in a day): the fold, the sentence and the gallery cannot silently come back.
//  1. no <details> outside the kit: a fold is the kit's Disclosure, which keeps its label and chevron in React;
//  2. no `group-open:` anywhere: the CSS variant matches any open ancestor, so a closed fold inside an open one read as open;
//  3. a <p>, or a <span> with words of its own, that holds a <Num> is flowed text: never a flex or grid container, whose children
//     (each piece of text, each number) become separate items and lines (the fees page's "שווה … ב־8 שנים." sentence);
//  4. the gallery at /kit stays out of the menu and the search;
//  5. every open question the site names is in data/open-questions.json: an answered one is deleted from the rule base;
//  6. "אחר" in a row of choices is the kit's OtherChip (ChoiceChips `other`), never an ordinary chip;
//  7. every <table> is fixed with a width per column (design-system 2.5a);
//  8. a year chart's pointer is the kit's useYearZoom: a chart that clears its reading when the pointer lifts lost the year on a phone;
//  9. a chart's motion is the kit's glide: a chart with a loop of its own restarted from its last rest on every step of a slider;
// 11. the arrow at the end of a row that opens a page is the kit's RowArrow, in the link's colour, never a grey one.
// 12. a rule chip in a list of rules says the rule's title beside its id.
// 13. Hebrew is never addressed to one gender (copy.md 1 and 10.2).
// 14. a figure's sheet never prints a record's raw English value ("none", "unlinked_15"): a word value heads its sheet with the word it
//     was shown as, and every such value in the data reads in Hebrew without one.
// 15. a record's printed conditions or doubt go through the kit's PrintedText or DoubtNote, which isolate their figures (the
//     bank-deposit visual printed `conditions` raw).
// 16. a figure the engine labels "reading" is the site's reading, never a secondary source: no file that reads the "reading" label
//     renders StrengthLabel strength="secondary"; it renders ReadingTag (the fees page showed a reading as "מקור משני").
//     A file that picks "secondary-source" labels out of a run for display picks "reading" too (the goal comparison
//     dropped readings). A figure's sheet shows ReadingTag for a value with the label, and every figure that carries a run's flags
//     carries its labels, checked per figure (leftover files by name; a file with one figure carrying
//     them can hide another that drops them).
// 17. a price list's date line is the kit's TariffDate, and no copy string says only that a date is missing ("ללא תאריך פרסום" on three rows, where the documents date each part or print nothing).
// 18. a fee cap the site names is the fee regulations' ("התקרה שבתקנות"), never "שבחוק" (copy.md 3; a repeat).
// 19. a figure's and a term's tap area is at least 44 px, and its own box sits above every other figure's area.
//     No rule at any depth (inside @layer, @media, @supports or a nested rule) turns the area off (content, display or pointer-events
//     none, visibility hidden or collapse) or shrinks, moves or re-stacks it, but on .num-static and .num-sample, figures that are not
//     buttons (the scan read top-level rules only and never looked for an area turned off).
// 20. a sentence that ends on a chip holds its full stop, comma, colon or semicolon in the chip's `end`, drawn close to the frame, and a
//     chip in text takes no brackets: "פרטים ." and "( פרטים )." read as stray marks.
//     The scan reads the mark after the chip across spaces and lines and in a string ({"."}), and props with any braces; a chip in JS
//     (a ternary's branch, an array, a call, after return) is left alone ("<IdRef/> ." and {"."} got through).
// 21. a date in a page's text is the kit's When (a repeat of copy.md 10): a month
//     a document prints alone is said in words in the text's direction, never padded with an invented "-01" or isolated left to right,
//     and the words before a date go in its `lead`, where a maqaf lead writes its letter on a month ("מנובמבר 2025"). A figure's own
//     lead (NumAfter, LeadTail with `text`) does the same before a figure said in words ("בשנה").
// 22. a control is at least 44 px tall at every width (guidelines/design.md; "הנחות נוספות" and "לתעריפון (PDF)" were 36 px, and
//     thirty other buttons, links and fold summaries with them): no `min-h-9` or `!h-9` on an unprefixed class; a control is `min-h-target`.
//     Any fixed height under 44 px on a control fails, not only 36 px, unless `min-h-target` or the kit's `tap-area` brings its tap area to
//     44 (a `<button className="h-8">` passed); leftovers by name, a list that only shrinks.
// 23. a link to a cited source is built by sourceHref, never from a raw address (open at the quoted words).
// 24. a key never shows a made-up figure (the number key's "123 ממקור 123 מחושב" read as a placeholder left
//     in the page): no `num-sample` element holds digits; a key draws each style on its own word, after a lead that says what it keys.
// 25. a FilterChip is an on-or-off filter: one comparing a value in `on` is one of several values, which is ChoiceChips with counts.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { numbers } from "../../copy";
import { formatValue, joinLead } from "../../lib/format";
import { buildInstitution, institutionIds } from "../../lib/institutions.server";
import type { SiteValue } from "../../lib/value";
import { LeadTail, Num, ProvenanceProvider, valueItem } from "../provenance";
import { ValueSheet } from "../provenance-sheets";
import { When } from "./when";
import { classTokens, directChildren, findElements, isLayoutToken } from "../../lib/jsx-scan";

const root = fileURLToPath(new URL("../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(root).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.ts$/.test(f));
const rel = (f: string) => relative(root, f).split("\\").join("/");
const read = (f: string) => readFileSync(f, "utf8");
/** Source without block comments and whole-line `//` comments, so a rule named in a comment is not a use of it. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Files that may still hold a plain <details>: the kit itself, and the source sheet in provenance-sheets.tsx (owned by another builder on; move its two footnote folds to `<Disclosure plain>` when that file is next opened, then delete this line). */
const DETAILS_ALLOWED = new Set(["components/provenance-sheets.tsx"]);

describe("no fold outside the kit", () => {
  const found = files.filter((f) => /\.tsx$/.test(f) && !rel(f).startsWith("components/kit/") && /<details[\s>]/.test(code(read(f)))).map(rel);
  it("uses the kit's Disclosure, not <details>", () => {
    expect(found.filter((f) => !DETAILS_ALLOWED.has(f))).toEqual([]);
  });
  it("the allowance is still needed", () => {
    for (const f of DETAILS_ALLOWED) expect(found, `${f} no longer has a <details>: remove it from DETAILS_ALLOWED`).toContain(f);
  });
});

describe("no group-open variant", () => {
  it("is not used in any source or stylesheet", () => {
    const hits = files.filter((f) => /group-open[:/]/.test(code(read(f)))).map(rel);
    expect(hits).toEqual([]);
  });
});

describe("a sentence with numbers is flowed text", () => {
  it("no <p> or <span> that holds a Num is a flex or grid container", () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => x.endsWith(".tsx"))) {
      const src = code(read(f));
      for (const el of findElements(src, ["p", "span"])) {
        const layout = classTokens(el.open).filter(isLayoutToken);
        if (!layout.length) continue;
        const c = directChildren(el.inner);
        // a paragraph is text whatever else it holds; a span only when it has words of its own beside the number
        if (c.nums > 0 && (el.tag === "p" || c.text > 0)) bad.push(`${rel(f)}:${el.line} <${el.tag} class="${layout.join(" ")}"> holds ${c.nums} Num: make it a <Sentence>, or a <div> that holds the sentence`);
      }
    }
    expect(bad).toEqual([]);
  });
  it("the scanner sees the broken pattern", () => {
    const broken = `<p className="flex flex-col gap-0.5">{a} <Num value={v} /> {b}</p>`;
    const el = findElements(broken, ["p"])[0]!;
    expect(classTokens(el.open).some(isLayoutToken)).toBe(true);
    expect(directChildren(el.inner).nums).toBe(1);
    const fine = `<p className="text-sm">{a} <Num value={v} /> {b}</p>`;
    expect(classTokens(findElements(fine, ["p"])[0]!.open).some(isLayoutToken)).toBe(false);
    const nested = `<p className="flex"><span>{a} <Num value={v} /></span></p>`;
    expect(directChildren(findElements(nested, ["p"])[0]!.inner).nums).toBe(0);
  });
});

describe("the gallery is not on the site's surface", () => {
  const mentions = files.filter((f) => /["'`]\/kit["'`/]/.test(code(read(f)))).map(rel);
  it("is named only by its path list and by itself (its route is registered as kit in routes.ts)", () => {
    expect(mentions.sort()).toEqual(["components/kit/gallery.tsx", "lib/paths.server.ts"]);
  });
  it("its route is noindex", () => {
    expect(read(join(root, "routes/kit.tsx"))).toContain('name: "robots", content: "noindex"');
  });
});

// one chip for every id (IdRef in provenance.tsx). A formula, parameter or open-question id is never plain text.
describe("ids go through IdRef", () => {
  it("no rule-chip-static anywhere", () => {
    expect(files.filter((f) => /rule-chip-static/.test(code(read(f)))).map(rel)).toEqual([]);
  });
  it("no local OQ component in the content files", () => {
    expect(files.filter((f) => rel(f).startsWith("content/") && /const OQ\s*=/.test(code(read(f)))).map(rel)).toEqual([]);
  });
  it("no <bdi> holds a bare formula, parameter or open-question id outside provenance.tsx", () => {
    const idLike = /\bF-\d\d|\bP-\d\d|OQ\d/;
    const bare = /<bdi\b[^>]*>(?:([^<{]*)|\{["'`]([^"'`]*)["'`]\})<\/bdi>/g;
    const bad: string[] = [];
    for (const f of files.filter((x) => x.endsWith(".tsx") && rel(x) !== "components/provenance.tsx")) {
      for (const m of code(read(f)).matchAll(bare)) if (idLike.test(m[1] ?? m[2] ?? "")) bad.push(`${rel(f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });
  it("the scan sees the broken pattern", () => {
    const bare = /<bdi\b[^>]*>(?:([^<{]*)|\{["'`]([^"'`]*)["'`]\})<\/bdi>/g;
    expect([...`<bdi dir="ltr">P-03</bdi>`.matchAll(bare)].length).toBe(1);
    expect([...`<bdi dir="ltr">{"BANK OQ12"}</bdi>`.matchAll(bare)].length).toBe(1);
  });
});

// Every question the site names is a question of the rule base. data/open-questions.json lists them
// (generated from the rule base's markdown), and an answered question is deleted from the markdown once its answer is in a rule,
// so a source that names one the file lacks points at nothing: in an IdRef, in a string that IdText turns into
// chips, typed bare in JSX text, or in a comment. The scanner does not pair quotes: a gershayim in Hebrew text (עו"ש, אג"ח) broke
// the first version's string pairing and hid the IdRef that followed it.
describe("every open question the site names exists", () => {
  const questions = JSON.parse(readFileSync(join(root, "../../data/open-questions.json"), "utf8")) as { id: string }[];
  const ids = new Set(questions.map((q) => q.id));
  const scanned = files.filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));
  /** The ids of `<IdRef … id="…">`, and of `id={"…"}`, `id={'…'}` or `` id={`…`} ``. */
  const idRefIds = (src: string): string[] =>
    [...src.matchAll(/<IdRef\b[^>]*?\bid=(?:"([^"]*)"|\{\s*(["'`])(.*?)\2\s*\})/g)].map((m) => m[1] ?? m[3] ?? "");
  const codesIn = (text: string): string[] => [...text.matchAll(/\b([A-Z][A-Z0-9]*)[ -]OQ ?(\d+)\b/g)].map((m) => `${m[1]} OQ${m[2]}`);
  /** Every code a source names: its IdRef ids, and any `<PREFIX> OQ<n>` or `<PREFIX>-OQ<n>` (JSX text, strings, keys, comments). */
  const named = (src: string): string[] => [...new Set([...idRefIds(src).flatMap(codesIn), ...codesIn(src)])];
  it("the data file is there, and the scan reaches the files", () => {
    expect(ids.size).toBeGreaterThan(0);
    expect(scanned.map(rel)).toEqual(expect.arrayContaining(["copy.ts", "content/guide/pension-comprehensive.tsx", "routes/not-covered.tsx"]));
  });
  it("names none the rule base does not have", () => {
    const bad: string[] = [];
    for (const f of scanned) for (const c of named(read(f))) if (!ids.has(c)) bad.push(`${rel(f)}: ${c}`);
    expect(bad).toEqual([]);
  });
  it("sees an IdRef after a gershayim, id={…}, a bare code in JSX text, a key and a comment", () => {
    const src = [
      `// TXK OQ3 is open`,
      `const a = <p>הפטור על ריבית בעו"ש לא ידוע. שאלה פתוחה: <IdRef id="TXI OQ11" />, ובבית השקעות שהוא חש"ב: <IdRef id="REG OQ9" />, <IdRef id={"REG OQ10"} /></p>;`,
      `const b = <p>אג"ח: עוד לא ידוע, שאלה פתוחה GOV OQ6.</p>; const c = { "SW-OQ4": "x" };`,
      `const url = "https://x.org/a"; // PEN OQ7`,
      `const d = <p>{/* MF OQ1 in a JSX comment */}טקסט</p>;`,
    ].join("\n");
    expect(idRefIds(src)).toEqual(["TXI OQ11", "REG OQ9", "REG OQ10"]);
    expect(named(src)).toEqual(["TXI OQ11", "REG OQ9", "REG OQ10", "TXK OQ3", "GOV OQ6", "SW OQ4", "PEN OQ7", "MF OQ1"]);
  });
});

/** The id lists a ChoiceChips row is given, inline or by a `const` in the same file. */
const choiceIds = (src: string): string[] =>
  [...src.matchAll(/<ChoiceChips\b[^>]*?\bids=\{([^}]+)\}/g)].map((m) => {
    const expr = m[1]!.trim();
    if (!/^\w+$/.test(expr)) return expr;
    return new RegExp(`const ${expr}\\b[^=]*=\\s*(\\[[^\\]]*\\])`).exec(src)?.[1] ?? expr;
  });

describe("\"אחר\" is the kit's OtherChip", () => {
  it("no ChoiceChips row lists an \"other\" id among its choices", () => {
    const bad = files.filter((f) => f.endsWith(".tsx") && !rel(f).startsWith("components/kit/")).flatMap((f) => choiceIds(code(read(f))).filter((ids) => /["']other["']/.test(ids)).map((ids) => `${rel(f)}: ${ids}: pass "אחר" as \`other\` instead`));
    expect(bad).toEqual([]);
  });
  it("the scanner sees the broken pattern", () => {
    expect(choiceIds(`const termIds: K[] = ["1", "other"];\n<ChoiceChips ids={termIds} wrap />`)).toEqual([`["1", "other"]`]);
    expect(choiceIds(`<ChoiceChips ids={["a", "other"]} />`)).toEqual([`["a", "other"]`]);
  });
});

// design-system 2.5a: nothing moves when a number changes, so a table's columns do not follow its content.
describe("every table has fixed columns", () => {
  const unfixed = (src: string): string[] =>
    findElements(src, ["table"]).flatMap((el) => {
      const fixed = classTokens(el.open).some((t) => t === "tbl" || t === "table-fixed");
      return fixed && /<TableCols\b/.test(el.inner) ? [] : [`line ${el.line}: ${fixed ? "no TableCols" : "neither .tbl nor table-fixed"}`];
    });
  it("each <table> is .tbl or table-fixed, with a TableCols", () => {
    const bad = files.filter((f) => f.endsWith(".tsx")).flatMap((f) => unfixed(code(read(f))).map((m) => `${rel(f)} ${m}`));
    expect(bad).toEqual([]);
  });
  it(".tbl is fixed in the stylesheet", () => {
    expect(/\.tbl \{[^}]*table-layout: fixed/.test(read(join(root, "app.css")))).toBe(true);
  });
  it("the scanner sees the broken pattern", () => {
    expect(unfixed(`<table className="tbl"><thead /></table>`)).toHaveLength(1);
    expect(unfixed(`<table className="w-full"><TableCols widths={[]} /></table>`)).toHaveLength(1);
    expect(unfixed(`<table className="w-full table-fixed"><TableCols widths={[]} /></table>`)).toEqual([]);
  });
});

describe("a year chart's pointer is the kit's", () => {
  it("no chart clears its reading when the pointer lifts", () => {
    const hits = files.filter((f) => /\.tsx$/.test(f) && !rel(f).startsWith("components/kit/") && /onPointerUp=\{\(\) => onHover\(null\)\}/.test(code(read(f)))).map(rel);
    expect(hits).toEqual([]);
  });
});

describe("a chart's motion is the kit's", () => {
  it("no chart has an animation loop of its own", () => {
    const charts = /^components\/(chart|compare|fees|workbench\/providers|guide-signature|invest|timeline)\//;
    const hits = files.filter((f) => /\.tsx$/.test(f) && charts.test(rel(f)) && /<svg[\s>]/.test(code(read(f))) && /requestAnimationFrame/.test(code(read(f)))).map(rel);
    expect(hits).toEqual([]);
  });
  it("a chart measures its box and a list slides its rows with the kit's piece", () => {
    const hits = files.filter((f) => /\.tsx$/.test(f) && !/^components\/(kit\/|shell)/.test(rel(f)) && /new ResizeObserver|\.animate\(\[/.test(code(read(f))));
    expect(hits).toEqual([]);
  });
});

// 10. the stairs and the rows of single changes: a gain is green and a loss red through the roles, never a literal colour, and a
//     row is a stretched button with its figures above it, never a button that holds a figure (a figure is itself a button).
describe("the stairs and the difference rows", () => {
  const stairs = code(read(join(root, "components/kit/stairs-chart.tsx")));
  const diff = code(read(join(root, "components/kit/diff-row.tsx")));
  it("use roles, no literal colour or palette step", () => {
    for (const src of [stairs, diff]) expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b|oklch\(|palette-|rgb\(/);
  });
  it("draw a gain with the gain role and a loss with the loss role, so the two signs never share a colour", () => {
    expect(diff).toMatch(/bg-gain/);
    expect(diff).toMatch(/bg-loss/);
    expect(stairs).toMatch(/fill-loss/);
  });
  it("a tap row holds no Num inside its button", () => {
    expect(diff).not.toMatch(/<button[^>]*>[^<]*<Num/);
  });
});

// 19. Reading a stylesheet's rules at any depth, and the rules that reach a figure's or a term's tap area.
/** Every style rule of a stylesheet, at any depth: inside `@layer`, `@media`, `@supports` and the like (`at` holds the at-rules around it,
 *  outermost first) and inside a nested rule (its selector resolved against the parent's). `body` is the rule's own declarations. */
function cssRules(css: string): { sel: string; body: string; at: string[] }[] {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: { sel: string; body: string; at: string[] }[] = [];
  const stack: { prelude: string; sel: string | null; body: string }[] = [];
  let buf = "";
  let q: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (q) {
      buf += c;
      if (c === "\\") buf += s[++i] ?? "";
      else if (c === q) q = null;
    } else if (c === '"' || c === "'") {
      q = c;
      buf += c;
    } else if (c === "{") {
      const prelude = buf.trim().replace(/\s+/g, " ");
      const parent = [...stack].reverse().find((f) => f.sel !== null)?.sel ?? null;
      const sel = prelude.startsWith("@") ? null : parent === null ? prelude : nestSelector(parent, prelude);
      stack.push({ prelude, sel, body: "" });
      buf = "";
    } else if (c === ";") {
      if (stack.length) stack[stack.length - 1]!.body += `${buf};`;
      buf = "";
    } else if (c === "}") {
      const top = stack.pop();
      if (top) top.body += buf;
      buf = "";
      if (top && top.sel !== null) out.push({ sel: top.sel, body: top.body.trim(), at: stack.filter((f) => f.prelude.startsWith("@")).map((f) => f.prelude) });
    } else buf += c;
  }
  return out;
}
/** A selector list split at its own commas, not those inside `:is(…)`, `:not(…)` or `[…]`. */
function selectorParts(sel: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of sel) {
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (c === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
const nestSelector = (parent: string, child: string): string =>
  selectorParts(parent)
    .flatMap((p) => selectorParts(child).map((c) => (c.includes("&") ? c.replace(/&/g, p) : `${p} ${c}`)))
    .join(", ");
/** The declarations of a rule's body, property names in lower case and values without `!important`. */
const declarations = (body: string): [string, string][] =>
  body
    .split(";")
    .map((d) => d.split(/:(.*)/s))
    .filter((d) => d.length > 1)
    .map(([p, v]) => [p!.trim().toLowerCase(), v!.replace(/!\s*important/i, "").trim().toLowerCase()]);
/** The last compound of a selector (after its last combinator outside brackets), with its `:not(…)` parts removed. */
function lastCompound(part: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < part.length; i++) {
    const c = part[i]!;
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) start = i + 1;
  }
  let compound = part.slice(start);
  for (let k = compound.indexOf(":not("); k >= 0; k = compound.indexOf(":not(")) {
    let d = 0;
    let j = k + 4;
    for (; j < compound.length; j++) {
      if (compound[j] === "(") d++;
      else if (compound[j] === ")" && --d === 0) break;
    }
    compound = compound.slice(0, k) + compound.slice(j + 1);
  }
  return compound;
}
/** Figures that are deliberately not buttons: the legend's samples and a sheet's head figure (provenance.tsx). Their area is off on purpose. */
const AREA_OFF_ALLOWED = [".num-static", ".num-sample"];
/** Whether a selector part reaches a figure's or a term's tap area (::after) or own box (::before): its last compound carries the pseudo-element
 *  and a `.num…` or `.term…` class, or nothing but the pseudo-element (which reaches every element). `allowed` when it is one of the
 *  named figures that are not buttons. */
function areaTarget(part: string): "no" | "allowed" | "yes" {
  const compound = lastCompound(part);
  if (!/::?(?:after|before)\b/.test(compound)) return "no";
  const universal = /^\*?::?(?:after|before)$/.test(compound);
  if (!universal && !/\.(?:num|term)(?:-[\w-]+)?(?![\w-])/.test(compound)) return "no";
  return AREA_OFF_ALLOWED.some((c) => new RegExp(`\\${c}(?![\\w-])`).test(compound)) ? "allowed" : "yes";
}
/** The declarations that turn a tap area off: no box at all, no box drawn, or a box that lets the click through. */
const areaOff = (body: string): string[] =>
  declarations(body)
    .filter(([p, v]) => (p === "content" && v === "none") || (p === "display" && v === "none") || (p === "pointer-events" && v === "none") || (p === "visibility" && /^(hidden|collapse)$/.test(v)))
    .map(([p, v]) => `${p}: ${v}`);
/** The declarations that shrink, move or re-stack an area or own box. */
const areaMoved = (body: string): string[] =>
  declarations(body)
    .filter(([p]) => /^(inset(-block|-inline)?(-start|-end)?|height|max-height|top|bottom|translate|transform|z-index)$/.test(p))
    .map(([p, v]) => `${p}: ${v}`);
/** Every rule, at any depth, that turns off, shrinks, moves or re-stacks a figure's or a term's area or own box, except the two rules that
 *  draw them (`skip`) and the named figures that are not buttons. */
function areaFlaws(rules: { sel: string; body: string; at: string[] }[], skip: unknown[] = []): string[] {
  const out: string[] = [];
  for (const r of rules) {
    if (skip.includes(r) || r.at.some((a) => /^@(-\w+-)?keyframes\b/.test(a))) continue;
    const parts = selectorParts(r.sel).filter((p) => areaTarget(p) === "yes");
    if (!parts.length) continue;
    const off = areaOff(r.body);
    const moved = areaMoved(r.body);
    const where = [...r.at, parts.join(", ")].join(" { ");
    if (off.length) out.push(`${where} turns the tap area off (${off.join("; ")})`);
    if (moved.length) out.push(`${where} shrinks, moves or re-stacks the tap area (${moved.join("; ")})`);
  }
  return out;
}

describe("the shared stylesheet", () => {
  it("every enabled button and summary shows the hand (audit A99): nothing was pasted into that selector", () => {
    const css = readFileSync(join(root, "app.css"), "utf8");
    expect(css).toMatch(/button:not\(:disabled\),\s*\[role="button"\]:not\(\[aria-disabled="true"\]\),\s*summary \{\s*cursor: pointer;/);
  });
  // 19. A figure's and a term's tap area (guidelines/design.md). Lone, it reaches 11 px above and below and never less than 44 px (an
  //     area that grew only sideways took 44 px from about 1,200 lone figures on a phone). In running text its own box sits
  //     above every other figure's area, so the figure on the next line never takes its click ("0.7%"
  //     opened the "5 שנים" sheet of the figure under it).
  it("a figure's and a term's tap area is at least 44 px tall, and its own box sits above every other figure's area", () => {
    const rules = cssRules(readFileSync(join(root, "app.css"), "utf8"));
    // the two rules that draw them hold whatever the screen size: inside a layer, never inside a @media or @supports
    const one = (sel: string) => rules.find((r) => r.sel === sel && r.at.every((a) => a.startsWith("@layer")));
    const areaRule = one(".num::after, .term::after");
    const area = areaRule?.body ?? "";
    expect(area, "the area").toMatch(/height:\s*max\(calc\(100% \+ 22px\),\s*44px\);/);
    expect(area).toMatch(/top:\s*50%;/);
    expect(area).toMatch(/translate:\s*0 -50%;/);
    expect(area).toMatch(/z-index:\s*0;/);
    const ownRule = one(".num::before, .term::before");
    const own = ownRule?.body ?? "";
    expect(own, "the own box").toMatch(/inset:\s*0;/);
    // at 2: above the figures' areas (0) and the areas of the controls that stand alone (1, a rule chip, a value pencil, tap-area)
    expect(own).toMatch(/z-index:\s*2;/);
    // no other rule, at any depth of any stylesheet, turns off, shrinks, moves or re-stacks a figure's or a term's area or own box
    const all = files.filter((f) => f.endsWith(".css")).flatMap((f) => (rel(f) === "app.css" ? rules : cssRules(read(f))));
    expect(areaFlaws(all, [areaRule, ownRule])).toEqual([]);
  });
  it("the scan sees the area turned off or moved inside @media, @supports and nested rules, and leaves the figures that are not buttons", () => {
    const flaws = (css: string) => areaFlaws(cssRules(css));
    // each of these the old scan missed: it read top-level rules only and looked for size and position, not for an area turned off
    for (const broken of [
      `@media (max-width: 400px) { .num::after { pointer-events: none } }`,
      `.num::after { content: none; }`,
      `.term::before { display: none }`,
      `.num-sourced::after { visibility: hidden }`,
      `.prose .term::after { visibility: collapse !important }`,
      `@supports (translate: 0) { .num::after, .rule-chip::after { display: none; } }`,
      `@layer components { .x { color: red } @media (hover: hover) { .num::after { height: 20px } } }`,
      `@layer components { @media (min-width: 64rem) { .term::before { z-index: 0 } } }`,
      `.prose { .num::after { content: none } }`,
      `.num { &::after { pointer-events: none } }`,
      `.num:not(.num-static)::after { pointer-events: none }`,
      `::after { content: none }`,
    ])
      expect(flaws(broken), broken).toHaveLength(1);
    expect(flaws(`@media (max-width: 400px) { .num::after { pointer-events: none } }`)[0]).toBe("@media (max-width: 400px) { .num::after turns the tap area off (pointer-events: none)");
    for (const fine of [
      `.num-static::after, .num-sample::after, .num-static::before, .num-sample::before { content: none; }`,
      `@media (max-width: 400px) { .num-sample::after { display: none } }`,
      `.num-static.num-sourced::before { pointer-events: none }`,
      `.number::after, .rule-chip::after, .num > svg::after { content: none }`,
      `.num::after { content: ""; position: absolute }`,
      `*, ::before, ::after { border-color: var(--border) }`,
      `@keyframes k { from { visibility: hidden } }`,
    ])
      expect(flaws(fine), fine).toEqual([]);
    // the two rules that draw the area are found inside their layer and left out by name
    const rules = cssRules(`@layer components { .num::after, .term::after { height: 44px } .num::before, .term::before { z-index: 1 } }`);
    expect(rules.map((r) => [r.sel, r.at])).toEqual([[".num::after, .term::after", ["@layer components"]], [".num::before, .term::before", ["@layer components"]]]);
    expect(areaFlaws(rules, rules)).toEqual([]);
  });
});

// 20. The chips in a source that a sentence's mark follows outside their end, or that stand in brackets.
/** The chips that hold a sentence's last mark in their `end` (provenance.tsx's ChipEnd). */
const CHIPS = ["IdRef", "RuleRef"];
const HEBREW = /[א-ת׳״]/;
/** Whether the chip that starts at `start` stands in JS (a ternary's branch, an array, a call, an object's value, after `return`, `&&`
 *  or `=>`) rather than in JSX text. Before a "(", "," or ":" the chip is in text only where a Hebrew word precedes the mark ("ראו: <IdRef/>",
 *  "( <IdRef/>"); a "(" also after a quote, a tag's end or a `{…}`. */
function chipInJs(src: string, start: number): boolean {
  const before = src.slice(0, start).trimEnd();
  if (/(?:\?|&&|\|\||\?\?|=>|=|\[|\{|\breturn)$/.test(before)) return true;
  const mark = before.slice(-1);
  if (!"(,:".includes(mark) || !mark) return false;
  const prev = before.slice(0, -1).replace(/[ \t]+$/, "").slice(-1);
  if (HEBREW.test(prev)) return false;
  if (mark === "(" && (prev === '"' || prev === "}" || (prev === ">" && !before.slice(0, -1).trimEnd().endsWith("=>")))) return false;
  return true;
}
/** Every chip in a source that is followed by a sentence's mark outside its `end`, or stands in brackets: `<IdRef … />.`, `<IdRef … /> .`,
 *  a mark at the start of the next line, `{"."}`, a comma at a line's end, `( <IdRef … /> )`. A chip's props may hold any braces. */
function chipFlaws(src: string): string[] {
  // comments blanked, not removed, so a flaw's line is its line in the file
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  const s = src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/^[ \t]*\/\/.*$/gm, blank);
  const out: string[] = [];
  for (const el of findElements(s, CHIPS)) {
    let end = el.start + el.open.length;
    if (!el.open.endsWith("/>")) end = s.indexOf(`</${el.tag}>`, end) + el.tag.length + 3;
    const after = s.slice(end);
    const next = after.trimStart();
    const inJs = chipInJs(s, el.start);
    const open = el.open.replace(/\s+/g, " ");
    const what = `${open.length > 70 ? `${open.slice(0, 69)}…` : open}${after.slice(0, after.length - next.length + 6).replace(/\s+/g, " ")}`.trimEnd();
    const at = `:${el.line} ${what}`;
    const literal = /^\{\s*(["'`])\s*([.,;:)])/.exec(next);
    if (/^\.(?!\.)/.test(next)) out.push(`${at}: the full stop goes in the chip's end (end=".")`);
    else if (literal) out.push(literal[2] === ")" ? `${at}: a chip in text takes no brackets` : `${at}: the mark goes in the chip's end (end="${literal[2]}"), not in a string after it`);
    else if (!inJs && /^[,;:]/.test(next)) out.push(`${at}: the mark goes in the chip's end (end="${next[0]}")`);
    else if (!inJs && /^\)/.test(next)) out.push(`${at}: a chip in text takes no brackets`);
    if (!inJs && /\(\s*$/.test(s.slice(0, el.start))) out.push(`${at}: a chip in text takes no brackets`);
    else if (/\{\s*(["'`])[^"'`]*\(\s*\1\s*\}\s*$/.test(s.slice(0, el.start))) out.push(`${at}: a chip in text takes no brackets`);
  }
  return out;
}

describe("a chip at the end of a sentence (20)", () => {
  it("holds its punctuation in the chip's end and takes no brackets", () => {
    const found = files.filter((f) => f.endsWith(".tsx") && !rel(f).endsWith("components/provenance.tsx")).flatMap((f) => chipFlaws(read(f)).map((x) => `${rel(f)}${x}`));
    expect(found).toEqual([]);
  });
  it("the scan sees each broken pattern, with any braces in the props, and leaves a chip in JS", () => {
    // each of these the old scan missed: it read a mark right after the chip only, on the same line, and props one brace deep
    for (const broken of [
      `<p>ראו <IdRef id="A-03" /> .</p>`,
      `<p>\n  ראו <IdRef id="A-03" />\n  .\n</p>`,
      `<p>ראו <IdRef id="A-03" />{"."}</p>`,
      `<p>ראו <RuleRef id="A-03" />{" ."}</p>`,
      `<p>\n  ראו <IdRef id="A-03" />,\n  <Num value={v} /> ועוד\n</p>`,
      `<p>ראו <IdRef id="A-03" />;\n  ועוד</p>`,
      `<p>ראו <RuleRef id={r.id} titled={pick({ short: { he: true } })} />.</p>`,
      `<p>ראו <RuleRef id={r.id} titled={a ? \`\${b}}\` : c} />.</p>`,
      `<p>ראו {"("}<IdRef id="A-03" /></p>`,
    ])
      expect(chipFlaws(broken), broken).toHaveLength(1);
    // and what it saw before stays seen
    expect(chipFlaws(`<p>ראו <RuleRef id={x.id} titled={a ? b : c} />.</p>`)).toHaveLength(1);
    expect(chipFlaws(`<p>שאלה פתוחה <IdRef id="SW OQ4" />, ועוד</p>`)).toHaveLength(1);
    expect(chipFlaws(`<p>ראו (<IdRef id="A-03" />).</p>`)).toHaveLength(2);
    expect(chipFlaws(`<p>ראו "( <IdRef id="A-03" /> )"</p>`)).toHaveLength(2);
    expect(chipFlaws(`<p>\n  ראו <IdRef id="A-03" />{"."}\n</p>`)[0]).toBe(`:2 <IdRef id="A-03" />{"."}: the mark goes in the chip's end (end="."), not in a string after it`);
    for (const fine of [
      `<p>ראו <IdRef id="A-03" end="." /></p>`,
      `<p>ראו <RuleRef id={r.id} titled={a ? b : c} end="," /> ועוד</p>`,
      `<span>{cond ? <IdRef id="A" /> : null}</span>`,
      `<span>{a ? <IdRef id="A" /> : <IdRef id="B" />}</span>`,
      `const v = { label: <RuleRef id="B" />, x: 1 };`,
      `const list = [<IdRef id="A" />, <IdRef id="B" />];`,
      `function f() { return <IdRef id="A" />; }`,
      `items.push(<IdRef id="A" />);`,
      `ids.map((id) => (\n  <IdRef key={id} id={id} />\n));`,
      `<p>שאלה פתוחה: <IdRef id="SW OQ4" /> ועוד <IdRef id="SW OQ9" /></p>`,
      `<p>ראו <IdRef id="A-03" />{" "}<Num value={v} /></p>`,
      `<p>ראו <IdRef id="A-03" />…</p>`,
      `// <IdRef id="A-03" />.`,
    ])
      expect(chipFlaws(fine), fine).toEqual([]);
  });
});

describe("the arrow that opens a page", () => {
  /** The source sheet's row arrow, and a rule's title row (`RuleTitleRow`), open a sheet on the same page, not a page: they stay grey. */
  const GREY_ALLOWED = new Set(["components/provenance-sheets.tsx", "components/provenance.tsx"]);
  it("is the kit's RowArrow, not a grey IconDrillIn", () => {
    const hits = files.filter((f) => /\.tsx$/.test(f) && !rel(f).startsWith("components/kit/") && !GREY_ALLOWED.has(rel(f)) && /<IconDrillIn[^>]*text-muted-foreground/.test(code(read(f))));
    expect(hits.map(rel)).toEqual([]);
  });
});

describe("a list of products sorted or filtered again", () => {
  it("slides its rows with useFlip, never fades as a whole with useSoftSwap", () => {
    const hits = files.filter((f) => /\.tsx$/.test(f) && !rel(f).startsWith("components/kit/") && /\b(ProductTable|TrackList)\b/.test(code(read(f))) && /\buseSoftSwap\b/.test(code(read(f))));
    expect(hits.map(rel)).toEqual([]);
  });
});

describe("the page frame", () => {
  // some pages used the room of a large screen and others did not. PageShell sets one frame for every page; a page
  // never narrows its whole content to the old 72rem frame again (prose keeps max-w-measure, a form may keep its own field widths).
  it("is the shell's alone: no page sets max-w-page or a wide prop", () => {
    const hits = files.filter((f) => /\.tsx$/.test(f) && (/\bmax-w-page\b/.test(code(read(f))) || /<PageShell[^>]*\bwide\b/.test(code(read(f)))));
    expect(hits.map(rel)).toEqual([]);
  });
});

// 12. a rule id never stands alone: a chip in a list of rules (a sheet's "חוק או כלל", "נגזר מ") has no words beside it, so it
//     carries the rule's own title (`titled`). A chip after a sentence that states the rule is its citation and stays short.
describe("a rule chip in a list of rules", () => {
  it("says the rule's title beside its id", () => {
    const bare = files
      .filter((f) => /\.tsx$/.test(f))
      .flatMap((f) => [...code(read(f)).matchAll(/\.map\(\(?\w+\)? => \(?\s*<RuleRef\b[^>]*\/>/g)].filter((m) => !/\btitled\b/.test(m[0])).map((m) => `${rel(f)}: ${m[0].replace(/\s+/g, " ")}`));
    expect(bare).toEqual([]);
  });
});

// 13. Hebrew addressed to one gender (copy.md 1 and 10.2; on wording addressed to one reader): the site speaks in
//     the plural or impersonally. A scan of the copy, the guide and exposure prose and the Hebrew fields of the records for the words
//     that can only address one person ("אתה", "שלך", "לך", "עליך", "אליך", "ממך", "הזן"). Words that also have a third-person sense
//     ("בחר": the site chose; "תוכל": she will be able) are left to the Hebrew editor.
describe("Hebrew is never addressed to one gender", () => {
  const ONE_READER = /(?<![֐-׿])(אתה|שלך|לך|עליך|אליך|ממך|הזן)(?![֐-׿])/g;
  const uncommented = (src: string): string => src.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\\w])\/\/[^\n]*/g, "$1");
  const hebrewFields = (o: unknown, key = ""): string[] =>
    typeof o === "string" ? (key.endsWith("_he") ? [o] : []) : Array.isArray(o) ? o.flatMap((v) => hebrewFields(v, key)) : o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => hebrewFields(v, k)) : [];
  it("no source or record of what a reader sees uses one", () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => rel(x) === "copy.ts" || (rel(x).startsWith("content/") && /\.tsx?$/.test(x)))) for (const m of uncommented(read(f)).matchAll(ONE_READER)) bad.push(`${rel(f)}: ${m[0]}`);
    const data = join(root, "../../data");
    for (const f of walk(data).filter((x) => x.endsWith(".json"))) {
      let rec: unknown;
      try {
        rec = JSON.parse(read(f));
      } catch {
        continue;
      }
      for (const m of hebrewFields(rec).join("\n").matchAll(ONE_READER)) bad.push(`${relative(data, f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });
  it("the scan sees the broken pattern and not a longer word", () => {
    expect("הזן את הסכום שלך".match(ONE_READER)).toEqual(["הזן", "שלך"]);
    expect("הזינו את הסכום שלכם; הולך ומשתלם".match(ONE_READER)).toBeNull();
  });
});

// 18. A fee cap the site names (1.05% and 4% in a provident fund, 0.5% and 6% in a pension fund, 2% in a study fund, the lost-contact
//     cap) is set in the fee regulations of 2012 (PF-02 to PF-08), so it is "התקרה שבתקנות", never "התקרה שבחוק" or "התקרה בחוק"
//     (copy.md 3). Written in copy.md before the provident-fund-for-investing guide said "שבחוק" four times: a repeat, so a scan. "אין תקרה בחוק" (no cap at all) and "תקרה בחוק" without the article are
//     not a cap's name and stay.
describe("a fee cap is the regulations'", () => {
  const LAW_CAP = /התקר(?:ה|ות)\s+ש?בחוק/g;
  const uncommented = (src: string): string => src.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\\w])\/\/[^\n]*/g, "$1");
  it("no copy, guide prose or Hebrew field of a record calls a fee cap the law's", () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => rel(x) === "copy.ts" || (rel(x).startsWith("content/") && /\.tsx?$/.test(x)))) for (const m of uncommented(read(f)).matchAll(LAW_CAP)) bad.push(`${rel(f)}: ${m[0]}`);
    const data = join(root, "../../data");
    for (const f of walk(data).filter((x) => x.endsWith(".json"))) for (const m of read(f).matchAll(LAW_CAP)) bad.push(`${relative(data, f)}: ${m[0]}`);
    expect(bad).toEqual([]);
  });
  it("the scan sees the broken pattern and leaves the other uses", () => {
    expect("אלה התקרות שבחוק. התקרה בחוק: 2%. עד התקרה שבחוק".match(LAW_CAP)).toHaveLength(3);
    expect("אין תקרה בחוק; ותקרה כשיש תקרה בחוק; התקרה שבתקנות".match(LAW_CAP)).toBeNull();
  });
});

describe("a reading is the site's reading, not a secondary source", () => {
  const READS_READING = /code\s*===\s*["']reading["']|hasReading\(|\.reading\b/;
  const SECONDARY_LABEL = /<StrengthLabel\s+strength=["']secondary["']/;
  const offenders = (sources: { name: string; text: string }[]) => sources.filter((s) => READS_READING.test(s.text) && SECONDARY_LABEL.test(s.text)).map((s) => s.name);
  it("no file that reads the reading label shows StrengthLabel strength=\"secondary\"", () => {
    expect(offenders(files.filter((f) => f.endsWith(".tsx")).map((f) => ({ name: rel(f), text: read(f) })))).toEqual([]);
  });
  it("the files that read it use ReadingTag", () => {
    const readers = files.filter((f) => f.endsWith(".tsx") && /===\s*["']reading["']|hasReading\(|\.readingRules\b/.test(read(f)));
    expect(readers.length).toBeGreaterThan(2);
    for (const f of readers) expect(read(f), rel(f)).toMatch(/ReadingTag/);
  });
  // the goal comparison collected only "secondary-source" labels, so a run resting on a reading showed no
  // mark there while the fees page showed one. Any file that picks the secondary-source labels out of a run for display picks the
  // reading labels too.
  const PICKS_SECONDARY = /code\s*===\s*["']secondary-source["']/;
  const PICKS_READING = /code\s*===\s*["']reading["']/;
  const drops = (sources: { name: string; text: string }[]) => sources.filter((s) => PICKS_SECONDARY.test(s.text) && !PICKS_READING.test(s.text)).map((s) => s.name);
  it("every file that picks secondary-source labels for display picks the reading labels too", () => {
    expect(drops(files.filter((f) => /\.tsx?$/.test(f)).map((f) => ({ name: rel(f), text: read(f) })))).toEqual([]);
  });
  it("the scan sees a file that drops readings", () => {
    expect(drops([{ name: "a.ts", text: 'run.labels.filter((l) => l.code === "secondary-source")' }])).toEqual(["a.ts"]);
    expect(drops([{ name: "b.ts", text: 'labels.filter((l) => l.code === "secondary-source"); labels.filter((l) => l.code === "reading")' }])).toEqual([]);
  });
  it("the scan sees the broken pattern", () => {
    expect(offenders([{ name: "x.tsx", text: 'hasReading(v) ? <StrengthLabel strength="secondary" /> : null' }])).toEqual(["x.tsx"]);
    expect(offenders([{ name: "y.tsx", text: "hasReading(v) ? <ReadingTag /> : null" }])).toEqual([]);
  });
  // the guide visuals and the holdings page put the run's reading label on a figure and nothing showed it.
  // The figure's sheet shows ReadingTag for any value that carries the label, so a label carried is a label seen.
  it("a figure's sheet shows the reading tag when the value carries the reading label", () => {
    const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-07" };
    const v = { value: 1200, unit: "nis", state: "computed", source: { url: "", title: "" }, checked: "2026-11-07", effective_from: null, effective_to: null, update_rule: "computed", formula: "F-44", inputs: {}, labels: [{ code: "reading", ruleId: "TXK-07" }] } as unknown as SiteValue;
    const sheet = (value: SiteValue) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ValueSheet, { value, exact: false, data, headId: "h", descId: "d" }) })));
    expect(sheet(v)).toContain(numbers.reading);
    expect(sheet({ ...v, labels: [] } as SiteValue)).not.toContain(numbers.reading);
  });
  // A file that carries a run's flags into a figure carries its labels too, or the reading never reaches the sheet. Leftovers by name;
  // the list only shrinks. The timeline gathers flags over every year's run into one set; its labels would need the same per year.
  const CARRIES_FLAGS = /flags:\s*(?:\[\.\.\.new Set\()?[\w.?]*\bflags\b/;
  const CARRIES_LABELS = /labels:\s*[\w.?]*\blabels\b/;
  const LABEL_LEFTOVERS = ["components/timeline/Timeline.tsx"];
  /** The object literal around position `i`: from the nearest unmatched "{" before it to the "}" that closes it. Per figure, not per file. */
  const enclosing = (text: string, i: number): string => {
    let a = i;
    for (let depth = 0; a > 0; a--) {
      if (text[a] === "}") depth++;
      else if (text[a] === "{" && depth-- === 0) break;
    }
    let b = i;
    for (let depth = 0; b < text.length; b++) {
      if (text[b] === "{") depth++;
      else if (text[b] === "}" && depth-- === 0) break;
    }
    return text.slice(a, b + 1);
  };
  /** Each figure, as `file:line`, whose options carry a run's flags and not its labels. */
  const dropsLabels = (sources: { name: string; text: string }[]) =>
    sources.flatMap((s) =>
      [...s.text.matchAll(new RegExp(CARRIES_FLAGS.source, "g"))].filter((m) => !CARRIES_LABELS.test(enclosing(s.text, m.index))).map((m) => `${s.name}:${s.text.slice(0, m.index).split("\n").length}`),
    );
  const fileOf = (hit: string) => hit.replace(/:\d+$/, "");
  it("every figure that carries a run's flags carries its labels too (leftover files by name, a list that only shrinks)", () => {
    const now = dropsLabels(files.filter((f) => /\.tsx?$/.test(f)).map((f) => ({ name: rel(f), text: read(f) })));
    expect(now.filter((h) => !LABEL_LEFTOVERS.includes(fileOf(h)))).toEqual([]);
    expect(LABEL_LEFTOVERS.filter((f) => !now.some((h) => fileOf(h) === f))).toEqual([]);
  });
  it("the scan sees a figure that drops the labels, also beside one that carries them in the same file", () => {
    expect(dropsLabels([{ name: "a.ts", text: "computed(v, \"nis\", \"F-60\", {}, { today, flags: r.run.flags.map((f) => f.code) })" }])).toEqual(["a.ts:1"]);
    expect(dropsLabels([{ name: "b.ts", text: "computed(v, \"nis\", \"F-60\", {}, { today, flags: run.flags, labels: run.labels })" }])).toEqual([]);
    const two = "const x = computed(v, \"nis\", \"F-60\", {}, { today, flags: run.flags, labels: run.labels });\nconst y = computed(w, \"nis\", \"F-61\", {}, { today, flags: other.flags });";
    expect(dropsLabels([{ name: "c.ts", text: two }])).toEqual(["c.ts:2"]);
  });
});

describe("a figure's sheet never prints a record's raw English value", () => {
  // the linkage and tax sheets on every deposit card headed with "none", "unlinked_15", "linked_25",
  // because the card's word reached the sheet only for an empty value
  const word = (value: string | boolean | null): SiteValue => ({ value, unit: "text", state: "sourced", source: { url: "https://www.gov.il/", title: "מקור" }, checked: "2026-11-07", effective_from: null, effective_to: null, update_rule: "provider-set" }) as unknown as SiteValue;
  const rawToken = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

  it("a value that is not a number opens its sheet with the word it was shown as; a number keeps its digits", () => {
    for (const v of ["unlinked_15", true, null] as const) expect(valueItem(word(v), "לא צמוד", false)).toMatchObject({ display: "לא צמוד" });
    const n = { ...word(null), value: 2.5, unit: "pct" } as unknown as SiteValue;
    expect(valueItem(n, "2.5%", true)).not.toHaveProperty("display");
  });

  it("the sheet heads with that word, not the record's value", () => {
    const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-07" };
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ValueSheet, { value: word("unlinked_15"), exact: false, display: "ריבית לא צמודה", data, headId: "h", descId: "d" }) })));
    expect(html).toContain("ריבית לא צמודה");
    expect(html).not.toContain("unlinked_15");
  });

  it("every word value the data and the company pages hold reads in Hebrew even with no word of its own", () => {
    const raw = new Map<string, string>();
    const seen = new Set<unknown>();
    const scan = (o: unknown, where: string): void => {
      if (!o || typeof o !== "object" || seen.has(o)) return;
      seen.add(o);
      const v = o as Record<string, unknown>;
      if ("value" in v && "unit" in v && typeof v.value === "string" && rawToken.test(v.value) && rawToken.test(formatValue(v.value, String(v.unit)))) raw.set(v.value, where);
      for (const x of Object.values(v)) scan(x, where);
    };
    const dataRoot = fileURLToPath(new URL("../../../../data/", import.meta.url));
    for (const f of walk(dataRoot).filter((x) => x.endsWith(".json"))) scan(JSON.parse(read(f)), relative(dataRoot, f));
    for (const id of institutionIds()) scan(buildInstitution(id), `/companies/${id}`);
    // a raw value gets its Hebrew word in numbers.enums (copy.ts)
    expect([...raw].map(([v, where]) => `${v} (${where})`)).toEqual([]);
    expect(rawToken.test("unlinked_15") && rawToken.test("none") && !rawToken.test(numbers.enums.unlinked_15!)).toBe(true);
  });
});

describe("a record's printed words go through PrintedText", () => {
  // PrintedText keeps a bank's "10,000 ₪" in its order inside Hebrew, so `conditions` or `doubt` rendered as a bare expression fails
  const BARE = /(^|[^=\w])\{\s*(\w+)((?:\??\.\w+)*)\??\.(conditions|doubt)\s*\}/g;
  /** The names a file gives to the copy (`import { x as copy } from "../copy"`, `const c = copy.part`): their `conditions` is a heading, not a record's words. */
  const copyNames = (src: string): Set<string> => {
    const names = new Set<string>();
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"(?:\.\.?\/)+copy"/g)) for (const part of m[1]!.split(",")) names.add(part.trim().split(/\s+as\s+/).at(-1)!);
    for (let grew = true; grew; ) {
      grew = false;
      for (const m of src.matchAll(/const\s+(\w+)\s*=\s*(\w+)\b/g)) if (names.has(m[2]!) && !names.has(m[1]!)) names.add(m[1]!), (grew = true);
    }
    return names;
  };
  it("no feature file renders a record's conditions or doubt as a bare expression", () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => x.endsWith(".tsx") && !rel(x).startsWith("components/kit/"))) {
      const src = code(read(f));
      const copies = copyNames(src);
      for (const m of src.matchAll(BARE)) if (!copies.has(m[2]!)) bad.push(`${rel(f)}: {${m[2]}${m[3]}.${m[4]}}`);
    }
    expect(bad).toEqual([]);
  });
  it("the scan sees a bare record field and not a heading from the copy or a prop", () => {
    expect([..."<>; {ends.top.conditions}</>".matchAll(BARE)].length).toBe(1);
    expect([..."<PrintedText text={b.conditions} />".matchAll(BARE)].length).toBe(0);
    expect(copyNames('import { r3transfer as copy } from "../../copy";\nconst c = copy.consolidation;')).toEqual(new Set(["copy", "c"]));
  });
});

describe("a link to a cited source goes through sourceHref", () => {
  // Psagot's price list opened at its top, not at the quoted words: every link to a source is built by
  // sourceHref (lib/sources.ts), which opens a PDF at its page and a web page at the quoted words; a raw address in an href skips both
  const RAW = [
    /href=\{\s*[\w.?!]*(?:\.url|\b\w*[uU]rl)\s*(?:\}|\?\?|\|\|)/g, // href={doc.url}, href={history.sourceUrl}, href={doc.url ?? ""}
    /\bhref:\s*(?:[\w.?!]*\.url|\w*[uU]rl|m\[\d\]!?)\s*[,}]/g, // { href: s.tariff.url }, { href: m[2]! }
    /#page=|:~:text=/g, // a page or a text fragment built by hand
  ];
  const hits = (src: string) => RAW.flatMap((re) => [...src.matchAll(re)].map((m) => m[0]));
  it("no file builds a link to a source from a raw address", () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => /\.tsx?$/.test(x) && rel(x) !== "lib/sources.ts")) for (const h of hits(code(read(f)))) bad.push(`${rel(f)}: ${h}`);
    expect(bad).toEqual([]);
  });
  it("the scan sees a raw address and not the function", () => {
    expect(hits('<a href={na.source.url}>, <a href={history.sourceUrl}>, { href: s.tariff.url, title }, { href: m[2]! }, `${url}#page=${n}`, <a href={src.url ?? "#"}>')).toHaveLength(6);
    expect(hits("<a href={sourceHref(na.source)}>, { href: sourceHref({ url: m[2]! }) }, <a href={href}>")).toEqual([]);
  });
});

describe("a price list's date line says what the document prints", () => {
  // three rows of the companies list read "ללא תאריך פרסום" in a warning colour, though their price lists date each
  // part or print no date at all; four pages each wrote their own line. Now the date reaches the screen only through the kit's TariffDate.
  it("every file that reads a price list's published date writes it with TariffDate", () => {
    const bad = files
      .filter((f) => rel(f) !== "lib/tariff-date.ts" && !rel(f).startsWith("components/kit/"))
      .filter((f) => /\btariff\??\.published\b/.test(code(read(f))) && !/\bTariffDate\b/.test(code(read(f))))
      .map(rel);
    expect(bad).toEqual([]);
  });
  it("no string of the copy says only that a date is missing", () => {
    // the kit's own "בלי תאריך מודפס" is followed by the day the site checked; any other such line is a bare warning
    const copySrc = read(join(root, "copy.ts")).replace(/tariffDate:\s*\{[\s\S]*?\n {2}\},/, "");
    expect(copySrc.match(/"[^"]*(?<![\u0590-\u05ff])(?:ללא|אין|בלי) תאריך[^"]*"/g) ?? []).toEqual([]);
  });
});

describe("a date in a page's text is the kit's When", () => {
  const tsx = files.filter((f) => /\.tsx$/.test(f) && !rel(f).startsWith("components/kit/"));
  const BDI_DATE = /<bdi[^>]*>\s*\{[^}]*\bfmt\.(?:date|period)\(/g;
  const PADDED = /\$\{[^}]*\}-01`/g;
  const LEAD_OUTSIDE = /\{[\w.[\]`$ ]+\}\s*<When\b/g;
  // a maqaf written straight before a month said in words: "מ־{fmt.period(d)}" printed "מ־נובמבר 2025", the symptom itself
  const MAQAF_MONTH = /־(?:\s|\$|\{)*fmt\.period\(/g;
  it("no page isolates a formatted date by hand, pads a month with a first day, or writes the words before a date outside its lead", () => {
    const bad = files
      .filter((f) => /\.tsx?$/.test(f) && !rel(f).startsWith("components/kit/"))
      .flatMap((f) => {
        const c = code(read(f));
        const hits = [...(/\.tsx$/.test(f) ? c.match(BDI_DATE) ?? [] : []), ...(c.match(PADDED) ?? []), ...(/\.tsx$/.test(f) ? c.match(LEAD_OUTSIDE) ?? [] : []), ...(c.match(MAQAF_MONTH) ?? [])];
        return hits.map((h) => `${rel(f)}: ${h}`);
      });
    expect(bad).toEqual([]);
    expect(tsx.length).toBeGreaterThan(0);
  });
  it("the scan sees the broken patterns and not When itself", () => {
    expect('<bdi dir="ltr">{fmt.date(x)}</bdi>'.match(BDI_DATE)).toHaveLength(1);
    expect("<bdi>{fmt.period(String(p))}</bdi>".match(BDI_DATE)).toHaveLength(1);
    expect("fmt.date(`${since}-01`)".match(PADDED)).toHaveLength(1);
    expect("{copy.lead} <When iso={d} />".match(LEAD_OUTSIDE)).toHaveLength(1);
    expect('<When iso={d} lead={copy.lead} />'.match(LEAD_OUTSIDE)).toBeNull();
    expect('{" "}\n<When iso={d} />'.match(LEAD_OUTSIDE)).toBeNull();
    expect('<span>מ־{fmt.period(d)}</span>'.match(MAQAF_MONTH)).toHaveLength(1);
    expect("`תעריפון מ־${fmt.period(d)}`".match(MAQAF_MONTH)).toHaveLength(1);
    expect('<span>מ־{fmt.date(d)}</span>'.match(MAQAF_MONTH)).toBeNull();
  });
  it("a maqaf lead writes its letter on a month or a year said in words, and keeps the maqaf before digits", () => {
    expect(joinLead("תעריפון מ־", "נובמבר 2025")).toBe("תעריפון מ");
    expect(joinLead("ב־", "שנה")).toBe("ב");
    expect(joinLead("ב־", "10 שנים")).toBe("ב־");
    expect(joinLead("ממוצע ", "נובמבר 2025")).toBe("ממוצע ");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = (n: (props: any) => ReturnType<typeof When>, p: Record<string, unknown>) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(n as never, p as never))).replace(/<[^>]+>/g, "");
    expect(html(When, { iso: "2025-11", lead: "תעריפון מ־" })).toBe("תעריפון מנובמבר 2025");
    expect(html(When, { iso: "2025-11-02", lead: "תעריפון מ־" })).toBe("תעריפון מ־02.11.2025");
    expect(html(LeadTail, { lead: "ב־", text: "שנה", children: "שנה" })).toBe("בשנה");
    const month: SiteValue = { state: "sourced", value: "2025-11", unit: "text", source: { url: "https://example.com", title: "t", checked: "2026-11-01" } } as unknown as SiteValue;
    expect(html(Num, { value: month, prefix: "מ־" })).toContain("מנובמבר 2025");
  });
});

/** Guard 22: each control whose unprefixed classes set a height under 44 px and nothing brings its tap area to 44 (`tag token`). */
function shortControls(src: string): string[] {
  const out: string[] = [];
  const px = (t: string): number | null => {
    const m = t.replace(/^!/, "").match(/^(?:min-h|h|size)-(?:(\d+(?:\.\d+)?)|\[(\d+)px\])$/);
    if (!m) return null;
    return m[1] !== undefined ? Number(m[1]) * 4 : Number(m[2]);
  };
  for (const el of findElements(src, ["button", "a", "Link", "NavLink", "summary", "input", "select", "textarea", "Button"])) {
    // a check box or a radio is tapped through the label around it, which carries the target (the hit check measures it)
    if (el.tag === "input" && /type=["'](?:checkbox|radio)["']/.test(el.open)) continue;
    const all = classTokens(el.open);
    const tokens = all.filter((t) => !t.includes(":"));
    const reaches = tokens.some((t) => t === "tap-area" || t === "min-h-target" || ((t.startsWith("min-h-") || t.startsWith("!min-h-")) && (px(t) ?? 0) >= 44));
    if (!reaches) {
      for (const t of tokens) {
        const v = px(t);
        if (v !== null && v < 44) out.push(`${el.tag} ${t}`);
      }
    }
    // a wider screen's own height may draw a control shorter (`lg:min-h-0`), and then its tap area is the kit's at that width too
    // (the breadcrumb's link was 24 px at 1280): any `tap-area` on the element covers it
    if (!all.some((t) => t === "tap-area" || t.endsWith(":tap-area"))) {
      for (const t of all.filter((x) => x.includes(":") && !x.startsWith("max-") && !/^(?:after|before|hover|focus|group|peer|aria|data)/.test(x))) {
        const bare = t.slice(t.lastIndexOf(":") + 1);
        const v = bare.replace(/^!/, "") === "min-h-0" ? 0 : px(bare);
        if (v !== null && v < 44 && /^!?(?:min-h|h|size)-/.test(bare)) out.push(`${el.tag} ${t}`);
      }
    }
  }
  return out;
}

const SHORT_CONTROL_LEFTOVERS: Record<string, number> = {};

describe("a control is at least 44 px tall", () => {
  const SHORT = /(?<![\w:-])(?:min-h-9|!h-9|min-h-\[36px\]|!h-\[36px\])(?![\w-])/g;
  it("no class sets a 36 px height without a breakpoint (min-h-target is 44 px)", () => {
    const bad = files.filter((f) => /\.tsx$/.test(f)).flatMap((f) => (code(read(f)).match(SHORT) ?? []).map((h) => `${rel(f)}: ${h}`));
    expect(bad).toEqual([]);
  });
  it("the scan sees a short control and leaves a wider screen's own height", () => {
    expect('className="text-sm min-h-9"'.match(SHORT)).toHaveLength(1);
    expect('className="!h-9 px-3"'.match(SHORT)).toHaveLength(1);
    expect('className="min-h-[44px] md:min-h-9"'.match(SHORT)).toBeNull();
    expect('className="min-h-target"'.match(SHORT)).toBeNull();
  });
  // Any fixed height under 44 px on a control, not only 36 px (a `<button className="h-8">` passed): a button, a link,
  // a fold's summary or a field whose unprefixed classes set `h-`, `min-h-` or `size-` under 44 px and nothing that brings its tap area to
  // 44 (min-h-target or a larger min-h, or the kit's `tap-area`). Today's leftovers are listed by name; the list only shrinks. The rendered
  // check of what a finger hits, pseudo-element areas included, is tools/hit-check.mjs.
  const LEFTOVERS: Record<string, number> = SHORT_CONTROL_LEFTOVERS;
  it("no control sets a fixed height under 44 px without a tap area that reaches it (leftovers listed by name)", () => {
    const found: Record<string, number> = {};
    for (const f of files.filter((x) => /\.tsx$/.test(x))) {
      const n = shortControls(code(read(f))).length;
      if (n > 0) found[rel(f)] = n;
    }
    expect(found).toEqual(LEFTOVERS);
  });
  it("the scan sees any short height on a control, at any width, and leaves one with a tap area or a larger min-height", () => {
    expect(shortControls('<button className="h-8 px-2">x</button>')).toHaveLength(1);
    expect(shortControls('<Link to="/" className="size-6">x</Link>')).toHaveLength(1);
    expect(shortControls('<summary className="min-h-[40px]">x</summary>')).toHaveLength(1);
    expect(shortControls('<input className="h-10" />')).toHaveLength(1);
    expect(shortControls('<button className="h-8 tap-area">x</button>')).toHaveLength(0);
    expect(shortControls('<button className="h-8 min-h-target">x</button>')).toHaveLength(0);
    expect(shortControls('<a className="min-h-target lg:min-h-0">x</a>')).toHaveLength(1);
    expect(shortControls('<a className="min-h-target lg:min-h-0 lg:tap-area">x</a>')).toHaveLength(0);
    expect(shortControls('<button className="max-md:min-h-target md:tap-area">x</button>')).toHaveLength(0);
    expect(shortControls('<button className="h-11">x</button>')).toHaveLength(0);
    expect(shortControls('<span className="h-5">x</span>')).toHaveLength(0);
  });
});

// 24. A key's sample is a word in its style, never a made-up figure.
const SAMPLE_WITH_DIGITS = /className="[^"]*\bnum-sample\b[^"]*"[^>]*>\s*[^<{]*\d/g;
describe("a key never shows a made-up figure (24)", () => {
  it("no num-sample element holds digits", () => {
    const hits = files.filter((f) => f.endsWith(".tsx")).flatMap((f) => (code(read(f)).match(SAMPLE_WITH_DIGITS) ?? []).map((m) => `${rel(f)}: ${m}`));
    expect(hits).toEqual([]);
  });
  it("the scanner sees the broken pattern", () => {
    expect('<span className="num num-sourced num-sample" aria-hidden="true">123</span>'.match(SAMPLE_WITH_DIGITS)).toHaveLength(1);
    expect('<span className="num num-sourced num-sample whitespace-nowrap">\n  {numbers.legend.sourced}</span>'.match(SAMPLE_WITH_DIGITS)).toBeNull();
  });
});

// 25. A choice control is picked by what the choice does (docs/design-system.md 11, "Which choice control"). The one mismatch a scan can
//     name: a FilterChip whose `on` compares a value (`on={term === x}`) is one of several values that turn each other off, which is
//     ChoiceChips with counts; a FilterChip is a filter that is on or off on its own (the deposits page, a company's page and the rules
//     page's kinds of company drew one-of-N rows of FilterChips). The rest of the rule (a narrowing drawn as tabs, a calculation's question
//     drawn as chips) depends on what the page does with the value, which a scan cannot read: it is the doc's and the review's.
const ONE_OF_N_FILTER = /<FilterChip\b[^>]*\bon=\{[^}]*[!=]==?[^}]*\}/g;
describe("a FilterChip is an on-or-off filter, never one of several values (25)", () => {
  it("no FilterChip outside the kit compares a value in `on`", () => {
    const hits = files.filter((f) => f.endsWith(".tsx") && !rel(f).startsWith("components/kit/")).flatMap((f) => (code(read(f)).match(ONE_OF_N_FILTER) ?? []).map((m) => `${rel(f)}: ${m.slice(0, 90)} (ChoiceChips with counts)`));
    expect(hits).toEqual([]);
  });
  it("the scanner sees the broken pattern and leaves an on-or-off filter", () => {
    expect('<FilterChip key={x} on={term === x} count={3} onClick={() => setTerm(x)}>'.match(ONE_OF_N_FILTER)).toHaveLength(1);
    expect('<FilterChip\n  on={group == g}\n  onClick={f}>'.match(ONE_OF_N_FILTER)).toHaveLength(1);
    expect('<FilterChip on={filters.changing} count={n} onClick={() => setFilters({ changing: !filters.changing })}>'.match(ONE_OF_N_FILTER)).toBeNull();
  });
});
