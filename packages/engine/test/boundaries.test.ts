// The engine imports only the schema, does no I/O, reads no clock or locale, draws no chance and sets no timer (guidelines/code.md,
// "Modules"): it is a pure function of its inputs, so the site can run it anywhere, a test can pin its results, and a run never
// depends on the day or the machine.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));

/** The words after which a `/` starts a regex literal though they look like a name: an expression can follow each of them. */
const BEFORE_EXPRESSION = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"]);

/**
 * Whether a `/` after this code starts a regex literal rather than dividing: it does unless the code so far ends an expression (a name
 * that is not one of the words above, a number, a closing bracket, quote or backtick, or a postfix `++` or `--`). A `)` or `}` that ends
 * a statement head or a block, before a regex (`if (x) /re/.test(y)`), is read as division, so that regex is read as code: a quote or a
 * `//` in it then hides the code after it to the end of its line, and a backtick or a `/*` hides the code up to the next one that closes
 * it. The engine writes no regex in that place.
 */
function regexMayStart(before: string): boolean {
  const t = before.trimEnd();
  const last = t.at(-1);
  if (last === undefined) return true;
  if (t.endsWith("++") || t.endsWith("--")) return false;
  if (/[\w$]/.test(last)) return BEFORE_EXPRESSION.has(/[\w$]+$/.exec(t)?.[0] ?? "");
  return !/[)\]}"'`]/.test(last);
}

/**
 * The source with its comments blanked, so a word in a comment is not read as code; with `strings` false, the text of its strings,
 * template literals and regex literals is blanked too, their delimiters kept (a template's `${…}` stays code), so a word in a sentence
 * or a pattern is not read as code either. Comments, strings, templates and regex literals are each read as what they are, so a quote
 * or a `//` inside one hides no code after it.
 */
function codeOf(src: string, strings: boolean): string {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  const text = (s: string) => (strings ? s : blank(s));
  let out = "";
  let i = 0;

  /** Code up to the end of the source, or, inside a template's `${`, up to its own closing brace (left unread). */
  const code = (inTemplate: boolean) => {
    let depth = 0;
    while (i < src.length) {
      const c = src[i] ?? "";
      const next = src[i + 1];
      if (c === "/" && (next === "/" || next === "*")) {
        const close = next === "/" ? src.indexOf("\n", i) : src.indexOf("*/", i + 2);
        const stop = close < 0 ? src.length : next === "/" ? close : close + 2;
        out += blank(src.slice(i, stop));
        i = stop;
      } else if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < src.length && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
        out += c + text(src.slice(i + 1, j)) + (src[j] === c ? c : "");
        i = src[j] === c ? j + 1 : j;
      } else if (c === "`") {
        template();
      } else if (c === "/" && regexMayStart(out)) {
        regex();
      } else {
        if (inTemplate && c === "{") depth += 1;
        else if (inTemplate && c === "}" && depth-- === 0) return;
        out += c;
        i += 1;
      }
    }
  };

  /** A template literal from its opening backtick: its text, then each `${…}` read as code. */
  const template = () => {
    out += "`";
    i += 1;
    let start = i;
    while (i < src.length && src[i] !== "`") {
      if (src[i] === "\\") i += 2;
      else if (src[i] === "$" && src[i + 1] === "{") {
        out += `${text(src.slice(start, i))}\${`;
        i += 2;
        code(true);
        out += src[i] ?? "";
        i += 1;
        start = i;
      } else i += 1;
    }
    out += text(src.slice(start, i)) + (src[i] ?? "");
    i += 1;
  };

  /** A regex literal from its opening slash, to the slash that closes it outside a character class, and its flags. */
  const regex = () => {
    let j = i + 1;
    let inClass = false;
    for (; j < src.length && src[j] !== "\n"; j += 1) {
      if (src[j] === "\\") j += 1;
      else if (src[j] === "[") inClass = true;
      else if (src[j] === "]") inClass = false;
      else if (src[j] === "/" && !inClass) break;
    }
    if (src[j] !== "/") {
      // no closing slash on the line: not a regex literal after all, so the slash is read as code
      out += "/";
      i += 1;
      return;
    }
    const flags = /^[a-z]*/.exec(src.slice(j + 1))?.[0] ?? "";
    out += `/${text(src.slice(i + 1, j))}/${flags}`;
    i = j + 1 + flags.length;
  };

  code(false);
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

/**
 * The globals that reach outside the run (files, the network, storage, the page, the process, the console, the global object under any
 * of its names, through which any of them can be reached by name) or read the clock or the machine's locale, whether reached by a dot or
 * by brackets. A locale is explicit when the first argument names one; none, `undefined` or `[]` leaves it to the machine, and so does
 * reaching an `Intl` constructor other than by calling it, or by brackets (the key is blanked with the string that holds it).
 */
const OUTSIDE: [string, RegExp][] = [
  ["the clock", /\bDate\.now\b|\bnew\s+Date\b(?:\s*\(\s*\)|(?!\s*\())|(?<![\w.]|new\s+)Date\s*\(|\bperformance\s*[.[]|\bTemporal\s*\.\s*Now\b/],
  ["the network", /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|\bnavigator\s*[.[]/],
  ["storage", /\b(localStorage|sessionStorage|indexedDB|caches)\b/],
  ["the page", /\b(window|document)\s*[.[]/],
  ["the process", /\bprocess\s*[.[]|\bDeno\b|\bBun\b/],
  ["the console", /\bconsole\s*[.[]/],
  ["the global object", /\bglobalThis\b|(?<![\w$.])(?:self|global)\s*[.[]/],
  ["the machine's locale", /\b(?:toLocale\w*|Intl\s*\.\s*\w+)\b(?!\s*\(\s*(?![\s)]|undefined\b|void\b|\[\s*\]))|\bIntl\s*\[/],
];

/** The globals that make a run differ from one to the next: chance (`Math` reached by brackets may be its `random`), and code run later on a timer. */
const UNREPEATABLE: [string, RegExp][] = [
  ["draws chance", /\bMath\s*(?:\.\s*random\b|\[)|\bcrypto\s*[.[]/],
  ["runs on a timer", /\b(?:setTimeout|setInterval|setImmediate|requestAnimationFrame|requestIdleCallback)\b/],
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
  for (const [what, re] of UNREPEATABLE) {
    const m = re.exec(code);
    if (m) out.push(`${what}: ${m[0]}`);
  }
  return out;
}

describe("the engine's boundary", () => {
  const files = walk(SRC);

  it("covers the engine's source", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("imports only the schema, does no I/O, reads no clock or locale, draws no chance and sets no timer", () => {
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
      ["const today = new Date;", "reads the clock: new Date"],
      ["const t = Date.now();", "reads the clock: Date.now"],
      ["const s = Date();", "reads the clock: Date("],
      ["const at = `${Date.now()}`;", "reads the clock: Date.now"],
      ["const t = performance.now();", "reads the clock: performance."],
      ["const r = await fetch(url);", "reads the network: fetch("],
      ['const v = localStorage.getItem("k");', "reads storage: localStorage"],
      ["const w = window.innerWidth;", "reads the page: window."],
      ["const e = process.env.X;", "reads the process: process."],
      ['console.log("x");', "reads the console: console."],
      ['const f = globalThis["fetch"];', "reads the global object: globalThis"],
      ["const g = globalThis.structuredClone;", "reads the global object: globalThis"],
      ["const r = Math.random();", "draws chance: Math.random"],
      ["const id = crypto.randomUUID();", "draws chance: crypto."],
      ["setTimeout(run, 0);", "runs on a timer: setTimeout"],
      ["const h = setInterval(run, 10);", "runs on a timer: setInterval"],
      ["const s = n.toLocaleString();", "reads the machine's locale: toLocaleString"],
      ["const s = d.toLocaleDateString(undefined, { month: 'long' });", "reads the machine's locale: toLocaleDateString"],
      ["const f = new Intl.NumberFormat();", "reads the machine's locale: Intl.NumberFormat"],
      ["const f = new Intl.NumberFormat([], { style: 'percent' });", "reads the machine's locale: Intl.NumberFormat"],
      ["const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;", "reads the machine's locale: Intl.DateTimeFormat"],
      ["const F = Intl.Collator;", "reads the machine's locale: Intl.Collator"],
      ["const s = n.toLocaleString( );", "reads the machine's locale: toLocaleString"],
      ["const f = new Intl.NumberFormat( undefined, {});", "reads the machine's locale: Intl.NumberFormat"],
      ["const f = new Intl.NumberFormat(\n);", "reads the machine's locale: Intl.NumberFormat"],
      ['const f = new Intl["NumberFormat"]("he-IL");', "reads the machine's locale: Intl["],
      // the same globals reached through brackets, and the global object under its other names
      ['console["log"]("x");', "reads the console: console["],
      ['const t = performance["now"]();', "reads the clock: performance["],
      ['const l = navigator["language"];', "reads the network: navigator["],
      ['const r = Math["random"]();', "draws chance: Math["],
      ["const f = self.fetch;", "reads the global object: self."],
      ['const f = global["fetch"];', "reads the global object: global["],
      // a "/" after a postfix ++ or -- divides
      ["const r = i++ / 2; s.split('/'); fetch(u);", "reads the network: fetch("],
      ["const r = i-- / 2; s.split('/'); fetch(u);", "reads the network: fetch("],
      // a regex literal is read as one: a quote or a "//" in it starts no string or comment that would hide the code after it
      ['const q = /"/; const r = await fetch(url);', "reads the network: fetch("],
      ["const q = /'/g, t = Date.now();", "reads the clock: Date.now"],
      ["const q = /\\/\\//; console.log(q);", "reads the console: console."],
      ["const q = /[/\"]/; console.log(q);", "reads the console: console."],
      ["if (ok) return /`/.test(s) ? fetch(u) : 0;", "reads the network: fetch("],
      // a template's expression is read as code to its own closing brace, past a brace in a string inside it
      ['const t = `${ok ? "}" : "`"}`; console.log(t);', "reads the console: console."],
    ];
    expect(planted.map(([line]) => [line, breaches(at, line)])).toEqual(planted.map(([line, expected]) => [line, [expected]]));
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
      "const d = new Date(Date.UTC(2026, 0, 1));",
      'const s = n.toLocaleString("he-IL");',
      "const f = new Intl.NumberFormat(LOCALE, { style: 'percent' });",
      "const re = /console.log|Date.now|fetch(?=[(])/g;",
      "const half = total / 2 / count;",
      'const s = "Math.random, setTimeout and globalThis in a sentence";',
      'const s = n.toLocaleString( "he-IL" );',
      "const f = new Intl.NumberFormat(\n  LOCALE,\n);",
      "const m = Math.max(a, b); const p = item.self.x;",
    ];
    expect(fine.map((line) => [line, breaches(at, line)])).toEqual(fine.map((line) => [line, []]));
  });
});
