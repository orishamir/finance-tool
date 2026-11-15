// The proofs' Hebrew words (content/proofs.ts) and their entries in docs/method.md section 14 live in two files, so this keeps them in
// step: every id with words has a `**M-nn ` entry and every entry has words; every proof a content file cites has words; an `M-nn` id
// is a proof's, not a rule's; and its chip and sheet say what the brief of each piece says.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { provenance as copy } from "../copy";
import { IdRef, ProofsChip, ProvenanceProvider, idKind } from "../components/provenance";
import { SheetContent } from "../components/provenance-sheets";
import { proofs } from "./proofs";

const here = fileURLToPath(new URL("./", import.meta.url));
const repo = fileURLToPath(new URL("../../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
/** Source without block comments and whole-line `//` comments. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const method = readFileSync(join(repo, "docs/method.md"), "utf8");
const entries = [...method.matchAll(/^\*\*(M-\d{2,3}) /gm)].map((m) => m[1]!);
const ids = Object.keys(proofs);

describe("the proofs' words and method.md", () => {
  it("method.md has entries, and each has words here", () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter((id) => !ids.includes(id))).toEqual([]);
  });
  it("every id here is an entry of method.md", () => {
    expect(ids.filter((id) => !entries.includes(id))).toEqual([]);
  });
  it("each has a title, a statement and at least one assumption", () => {
    for (const [id, p] of Object.entries(proofs)) {
      expect(p.title, id).toBeTruthy();
      expect(p.holds, id).toBeTruthy();
      expect(p.when.length, id).toBeGreaterThan(0);
    }
  });
});

describe("the proofs the content files cite", () => {
  const files = walk(here).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && relative(here, f) !== "proofs.ts");
  const cited = files.flatMap((f) => [...code(readFileSync(f, "utf8")).matchAll(/(?<![A-Za-z0-9-])M-\d+(?![0-9])/g)].map((m) => ({ file: relative(here, f), id: m[0] })));
  it("each has words in content/proofs.ts", () => {
    expect(cited.filter((c) => !ids.includes(c.id)).map((c) => `${c.file}: ${c.id}`)).toEqual([]);
  });
  it("the scan finds a cited id", () => {
    expect([...code(`<ProofsChip ids={["M-03"]} />\n  // M-99, a whole-line comment\n/* M-98 */`).matchAll(/(?<![A-Za-z0-9-])M-\d+(?![0-9])/g)].map((m) => m[0])).toEqual(["M-03"]);
  });
});

describe("a proof as a kind of source", () => {
  const draw = (el: unknown, props: object) =>
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-15" } } as never, createElement(el as (p: object) => null, props))));
  it("an M-nn id is a proof, not a rule", () => {
    expect(idKind("M-01")).toBe("proof");
    expect(idKind("TXI-03")).toBe("rule");
  });
  it("its chip says a word, never the code: one proof, then several", () => {
    const one = draw(IdRef, { id: "M-01" });
    expect(one).toContain(copy.proofChip.one);
    expect(one).not.toContain("M-01");
    const line = draw(ProofsChip, { ids: ["M-01", "M-04"] });
    expect(line).toContain(copy.proofChip.many);
    expect(line).not.toMatch(/M-0\d/);
  });
  it("a proof's sheet has its title and code, its assumptions, what it leaves out and the link to the proof", () => {
    const html = draw(SheetContent, { item: { kind: "proof", id: "M-01" }, data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-15" }, headId: "h", descId: "d" });
    expect(html).toContain(proofs["M-01"].title);
    expect(html).toContain("M-01");
    expect(html).toContain(copy.proofSheet.when);
    for (const w of proofs["M-01"].when) expect(html).toContain(w);
    expect(html).toContain(copy.proofSheet.notCovered);
    expect(html).toContain("https://github.com/orishamir/finance-tool/blob/main/docs/method.md#14-what-the-math-proves-about-bonds");
    expect(html).toContain(copy.proofSheet.full);
    expect(draw(SheetContent, { item: { kind: "proof", id: "M-02" }, data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-15" }, headId: "h", descId: "d" })).not.toContain(copy.proofSheet.notCovered);
  });
  it("several proofs' sheet lists their titles", () => {
    const html = draw(SheetContent, { item: { kind: "proofs", ids: ["M-01", "M-04"] }, data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-15" }, headId: "h", descId: "d" });
    expect(html).toContain(proofs["M-01"].title);
    expect(html).toContain(proofs["M-04"].title);
  });
});

describe("the anchor of method.md section 14", () => {
  it("is GitHub's slug of its heading", () => {
    const heading = /^## (14\. .*)$/m.exec(method)?.[1] ?? "";
    // GitHub's slug: lower case, punctuation other than "-" and "_" dropped, each space a "-"
    const slug = heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/ /g, "-");
    expect(slug).toBe("14-what-the-math-proves-about-bonds");
  });
});
