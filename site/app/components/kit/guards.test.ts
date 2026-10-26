// Guards of the kit (2026-10-25, after two layout bugs in a day): the fold, the sentence and the gallery cannot silently come back.
//  1. no <details> outside the kit: a fold is the kit's Disclosure, which keeps its label and chevron in React;
//  2. no `group-open:` anywhere: the CSS variant matches any open ancestor, so a closed fold inside an open one read as open;
//  3. a <p>, or a <span> with words of its own, that holds a <Num> is flowed text: never a flex or grid container, whose children
//     (each piece of text, each number) become separate items and lines (the fees page's "שווה … ב־8 שנים." sentence);
//  4. the gallery at /kit stays out of the menu and the search;
//  5. a question data/open-questions.json has as closed is not named as open (2026-10-26);
//  6. "אחר" in a row of choices is the kit's OtherChip (ChoiceChips `other`), never an ordinary chip (2026-10-26).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { classTokens, directChildren, findElements, isLayoutToken } from "../../lib/jsx-scan";

const root = fileURLToPath(new URL("../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(root).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.ts$/.test(f));
const rel = (f: string) => relative(root, f).split("\\").join("/");
const read = (f: string) => readFileSync(f, "utf8");
/** Source without block comments and whole-line `//` comments, so a rule named in a comment is not a use of it. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Files that may still hold a plain <details>: the kit itself, and the source sheet in provenance.tsx (owned by another builder on 2026-10-25; move its two footnote folds to `<Disclosure plain>` when that file is next opened, then delete this line). */
const DETAILS_ALLOWED = new Set(["components/provenance.tsx"]);

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

// 2026-10-26: one chip for every id (IdRef in provenance.tsx). A formula, parameter or open-question id is never plain text.
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

// 2026-10-26: a question the rule base has closed is never named as open. data/open-questions.json holds each question's status
// (generated from the rule base's markdown); no source of the site may name a closed one, in an IdRef, in a string that IdText
// turns into chips, or typed bare in JSX text. The not-covered page reads its closures from the rule base at build time, so it
// names no code in its source and needs no exception. The scanner does not pair quotes: a gershayim in Hebrew text (עו"ש, אג"ח)
// broke the first version's string pairing and hid the IdRef that followed it (review, 2026-10-26).
describe("no closed open question is named as open", () => {
  const questions = JSON.parse(readFileSync(join(root, "../../data/open-questions.json"), "utf8")) as { id: string; status: string }[];
  const closed = new Set(questions.filter((q) => q.status === "closed").map((q) => q.id));
  const scanned = files.filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));
  /** Source without comments: block and JSX comments, and `//` comments (a `//` after a colon or a quote, as in a URL, stays). */
  const uncommented = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\\w])\/\/[^\n]*/g, "$1");
  /** The ids of `<IdRef … id="…">`, and of `id={"…"}`, `id={'…'}` or `` id={`…`} ``. */
  const idRefIds = (src: string): string[] =>
    [...uncommented(src).matchAll(/<IdRef\b[^>]*?\bid=(?:"([^"]*)"|\{\s*(["'`])(.*?)\2\s*\})/g)].map((m) => m[1] ?? m[3] ?? "");
  const codesIn = (text: string): string[] => [...text.matchAll(/\b([A-Z][A-Z0-9]*)[ -]OQ ?(\d+)\b/g)].map((m) => `${m[1]} OQ${m[2]}`);
  /** Every code a source names: its IdRef ids, and any `<PREFIX> OQ<n>` or `<PREFIX>-OQ<n>` outside comments (JSX text, strings, keys). */
  const named = (src: string): string[] => [...new Set([...idRefIds(src).flatMap(codesIn), ...codesIn(uncommented(src))])];
  it("the data file is there and has closed questions, and the scan reaches the files", () => {
    expect(closed.size).toBeGreaterThan(0);
    expect(scanned.map(rel)).toEqual(expect.arrayContaining(["copy.ts", "lib/playbook.ts", "content/guide/pension-comprehensive.tsx", "routes/not-covered.tsx"]));
  });
  it("names none in any source of the site", () => {
    const bad: string[] = [];
    for (const f of scanned) for (const c of named(read(f))) if (closed.has(c)) bad.push(`${rel(f)}: ${c}`);
    expect(bad).toEqual([]);
  });
  it("sees an IdRef after a gershayim, id={…}, a bare code in JSX text and a key, and skips comments", () => {
    const src = [
      `// TXK OQ12 was closed`,
      `const a = <p>הפטור על ריבית בעו"ש לא ידוע. שאלה פתוחה: <IdRef id="TXI OQ11" />, ובבית השקעות שהוא חש"ב: <IdRef id="REG OQ9" />, <IdRef id={"REG OQ10"} /></p>;`,
      `const b = <p>אג"ח: עוד לא ידוע, שאלה פתוחה GOV OQ6.</p>; const c = { "SW-OQ6": "x" };`,
      `const url = "https://x.org/a"; // PEN OQ8`,
      `const d = <p>{/* MF OQ4 in a JSX comment */}טקסט</p>;`,
    ].join("\n");
    expect(idRefIds(src)).toEqual(["TXI OQ11", "REG OQ9", "REG OQ10"]);
    expect(named(src)).toEqual(["TXI OQ11", "REG OQ9", "REG OQ10", "GOV OQ6", "SW OQ6"]);
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
