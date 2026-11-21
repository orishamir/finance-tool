// The engine imports only the schema, does no I/O and reads no clock (guidelines/code.md, "Modules"): it is a pure function of its
// inputs, so the site can run it anywhere, a test can pin its results, and a run never depends on the day or the machine.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));

/**
 * The source with its comments blanked, so a word in a comment is not read as code; with `strings` false, the text of its strings and
 * template literals is blanked too (a template's `${…}` stays code), so a word in a sentence is not read as code either.
 */
function codeOf(src: string, strings: boolean): string {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i] ?? "";
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end < 0 ? src.length : end + 2;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let text = c;
      while (j < src.length && src[j] !== c) {
        if (c === "`" && src[j] === "$" && src[j + 1] === "{") {
          // a template's expression is code: kept as it is up to its closing brace
          let depth = 0;
          let k = j + 1;
          for (; k < src.length; k += 1) {
            if (src[k] === "{") depth += 1;
            else if (src[k] === "}" && --depth === 0) break;
          }
          out += strings ? text : c + blank(text.slice(1));
          out += src.slice(j, k + 1);
          text = "";
          j = k + 1;
          continue;
        }
        const step = src[j] === "\\" ? 2 : 1;
        text += src.slice(j, j + step);
        j += step;
      }
      text += src[j] ?? "";
      out += strings ? text : blank(text);
      i = j + 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

/** The modules a source file imports or re-exports, with whether the import is of types only. */
function importsOf(code: string): { spec: string; typeOnly: boolean }[] {
  const found: { spec: string; typeOnly: boolean }[] = [];
  for (const m of code.matchAll(/\b(import|export)\s+(type\s+)?[^"'`;]*?\bfrom\s*["']([^"']+)["']/g)) found.push({ spec: m[3] ?? "", typeOnly: !!m[2] });
  for (const m of code.matchAll(/\bimport\s*["']([^"']+)["']/g)) found.push({ spec: m[1] ?? "", typeOnly: false });
  for (const m of code.matchAll(/\b(?:import|require)\s*\(\s*["'`]([^"'`]+)["'`]/g)) found.push({ spec: m[1] ?? "", typeOnly: false });
  for (const m of code.matchAll(/\b(?:import|require)\s*\(\s*[^"'`\s)]/g)) found.push({ spec: `a computed module (${m[0]})`, typeOnly: false });
  return found;
}

/** What a file may import: a module of its own package's source, the schema package, and zod's types (the schema's `z.infer`). */
function importAllowed(file: string, spec: string, typeOnly: boolean): boolean {
  if (spec.startsWith(".")) return !relative(SRC, resolve(dirname(file), spec)).startsWith("..");
  return spec === "@finance-tool/schema" || (spec === "zod" && typeOnly);
}

/** The globals that reach outside the run (files, the network, storage, the page, the process, the console) or read the clock. */
const OUTSIDE: [string, RegExp][] = [
  ["the clock", /\bDate\.now\b|\bnew\s+Date\s*\(\s*\)|(?<![\w.]|new\s+)Date\s*\(|\bperformance\s*\.|\bTemporal\s*\.\s*Now\b/],
  ["the network", /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|\bnavigator\s*\./],
  ["storage", /\b(localStorage|sessionStorage|indexedDB|caches)\b/],
  ["the page", /\b(window|document)\s*[.[]/],
  ["the process", /\bprocess\s*[.[]|\bDeno\b|\bBun\b/],
  ["the console", /\bconsole\s*\./],
];

/** Each way a file's code breaks the engine's boundary, in words. */
function breaches(file: string, src: string): string[] {
  const out = importsOf(codeOf(src, true))
    .filter((i) => !importAllowed(file, i.spec, i.typeOnly))
    .map((i) => `imports ${i.spec}${i.typeOnly ? " (types)" : ""}`);
  const code = codeOf(src, false);
  for (const [what, re] of OUTSIDE) {
    const m = re.exec(code);
    if (m) out.push(`reads ${what}: ${m[0]}`);
  }
  return out;
}

describe("the engine's boundary", () => {
  const files = walk(SRC);

  it("covers the engine's source", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("imports only the schema, does no I/O and reads no clock", () => {
    const found = files.flatMap((f) => breaches(f, readFileSync(f, "utf8")).map((b) => `${relative(SRC, f)} ${b}`));
    expect(found).toEqual([]);
  });

  it("catches each kind of breach planted in a file", () => {
    const at = join(SRC, "formulas", "planted.ts");
    const planted: [string, string][] = [
      ['import { fmt } from "../../../../site/app/lib/format";', "imports ../../../../site/app/lib/format"],
      ['import { fmt } from "~/lib/format";', "imports ~/lib/format"],
      ['import { readFileSync } from "node:fs";', "imports node:fs"],
      ['export { x } from "fs";', "imports fs"],
      ['const m = await import("node:fs");', "imports node:fs"],
      ['import { z } from "zod";', "imports zod"],
      ["const today = new Date();", "reads the clock: new Date()"],
      ["const t = Date.now();", "reads the clock: Date.now"],
      ["const s = Date();", "reads the clock: Date("],
      ["const at = `${Date.now()}`;", "reads the clock: Date.now"],
      ["const t = performance.now();", "reads the clock: performance."],
      ["const r = await fetch(url);", "reads the network: fetch("],
      ['const v = localStorage.getItem("k");', "reads storage: localStorage"],
      ["const w = window.innerWidth;", "reads the page: window."],
      ["const e = process.env.X;", "reads the process: process."],
      ['console.log("x");', "reads the console: console."],
    ];
    for (const [line, expected] of planted) expect(breaches(at, line)).toEqual([expected]);
  });

  it("lets through what the engine may do", () => {
    const at = join(SRC, "formulas", "planted.ts");
    const fine = [
      'import { valueObject, type ValueObject } from "@finance-tool/schema";',
      'import type { z } from "zod";',
      'import { monthOfDate } from "./time.ts";',
      'import { runSecurities } from "../ledgers/securities.ts";',
      "const d = new Date(`${date}T00:00:00Z`);",
      "// a comment that names Date.now() and fetch(url) and node:fs",
      "/* window.document, console.log */",
      'const s = "the console. reads nothing";',
      "const updated = row.updatedDate(x);",
    ];
    for (const line of fine) expect(breaches(at, line)).toEqual([]);
  });
});
