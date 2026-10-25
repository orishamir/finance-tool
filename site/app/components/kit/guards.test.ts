// Guards of the kit (2026-10-25, after two layout bugs in a day): the fold, the sentence and the gallery cannot silently come back.
//  1. no <details> outside the kit: a fold is the kit's Disclosure, which keeps its label and chevron in React;
//  2. no `group-open:` anywhere: the CSS variant matches any open ancestor, so a closed fold inside an open one read as open;
//  3. a <p>, or a <span> with words of its own, that holds a <Num> is flowed text: never a flex or grid container, whose children
//     (each piece of text, each number) become separate items and lines (the fees page's "שווה … ב־8 שנים." sentence);
//  4. the gallery at /kit stays out of the menu and the search.
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
