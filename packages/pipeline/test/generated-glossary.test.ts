// The glossary's generated files must be what `npm run gen:terms` writes from their sources: research/glossary/terms/
// (the rows), data/rules/*.json (each dimension's rule_ids) and docs/glossary.md's hand-written parts. The three generators
// run here into a temporary folder, and every generated file is compared with the committed one. A difference means a
// source or a rule record changed without regenerating, or a generated file was edited by hand: fix the source, run
// `npm run gen:terms`, and commit what it writes.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const scripts = join(root, "packages/pipeline/scripts");
let out = "";

const jsonFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), "glossary-"));
  mkdirSync(join(out, "docs"));
  copyFileSync(join(root, "docs/glossary.md"), join(out, "docs/glossary.md"));
  execFileSync("python3", [join(scripts, "merge_terms.py")], { cwd: root, stdio: "pipe" });
  execFileSync("python3", [join(scripts, "gen_glossary.py"), join(out, "docs/glossary.md")], { cwd: root, stdio: "pipe" });
  execFileSync(join(root, "node_modules/.bin/tsx"), [join(scripts, "gen-terms.ts")], {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, GLOSSARY_OUT: out },
  });
}, 120_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

describe("the glossary's generated files match their sources", () => {
  it("docs/glossary.md", () => {
    expect(readFileSync(join(out, "docs/glossary.md"), "utf8")).toBe(readFileSync(join(root, "docs/glossary.md"), "utf8"));
  });

  for (const dir of ["data/terms", "data/dimensions"]) {
    it(`${dir}: the same files`, () => {
      expect(jsonFiles(join(root, dir))).toEqual(jsonFiles(join(out, dir)));
    });

    it(`${dir}: each file as generated`, () => {
      const differ = jsonFiles(join(out, dir)).filter(
        (f) => readFileSync(join(out, dir, f), "utf8") !== readFileSync(join(root, dir, f), "utf8"),
      );
      expect(differ).toEqual([]);
    });
  }
});
