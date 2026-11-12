// The parameters page shows only what a live page reads. Each parameter it shows names its pages (lib/parameter-pages.ts); this
// fails when such a page is no longer a route in routes.ts, when the code a route loads no longer reads the parameter, or when the
// page shows a parameter the map does not name. "Reads" is looked for in the route's own code, every site module it imports, and
// the pre-rendered .json routes the route itself fetches (a page's `bundleLinks`), comments left out: a lookup of the
// parameter's record by its id (`method_id === "P-05"`, `find("P-01")`, `parameterOf(bundle, "P-02")`), or a call of the
// loader of its file. It is a check on the code's shape: a route that loads a reader it never calls still passes (the comparison
// bundle carries P-04 and P-07 to pages that use neither), and a page that stops loading the reader fails.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parametersPage } from "../copy";
import { parameterPageRoutes, parameterPages } from "./parameter-pages";
import { loader } from "../routes/parameters";

const app = resolve(__dirname, "..");
const routesSrc = readFileSync(join(app, "routes.ts"), "utf8");
/** Every route in routes.ts: its pattern ("" for the index) and its module. */
const routes: { pattern: string; file: string }[] = [
  ...[...routesSrc.matchAll(/\bindex\("([^"]+)"\)/g)].map((m) => ({ pattern: "", file: m[1]! })),
  ...[...routesSrc.matchAll(/\broute\("([^"]+)",\s*"([^"]+)"\)/g)].map((m) => ({ pattern: m[1]!, file: m[2]! })),
];

/** The route a link's address opens: a pattern's `:x?` segment may be left out, a `:x` segment takes any one segment. */
function routeOf(href: string): string | null {
  const parts = href.replace(/^\//, "").split("/").filter(Boolean);
  for (const r of routes) {
    if (r.pattern === "*") continue;
    const segs = r.pattern.split("/").filter(Boolean);
    const need = segs.filter((s) => !s.endsWith("?"));
    if (parts.length < need.length || parts.length > segs.length) continue;
    if (segs.every((s, i) => (s.startsWith(":") ? s.endsWith("?") || parts[i] !== undefined : parts[i] === s))) return r.file;
  }
  return null;
}

const read = (f: string) => readFileSync(f, "utf8");
/** The source without its comments (a block comment, a whole-line one, and one after code with a space before it). */
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/\s.*$/gm, "");

function resolveModule(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec);
  for (const f of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) if (existsSync(f) && !readdirSafe(f)) return f;
  return null;
}
const readdirSafe = (f: string) => {
  try {
    readdirSync(f);
    return true;
  } catch {
    return false;
  }
};

/** The .json routes without a parameter (`compare-bundle.json`), by name, to their module: a page that fetches one reads what it serves. */
const jsonRoutes = new Map(routes.filter((r) => /^[\w-]+\.json$/.test(r.pattern)).map((r) => [r.pattern, join(app, r.file)]));

/**
 * A route module, every site module it imports (static or `import()`), and the .json routes the route module itself names, comments
 * left out. Only the route's own .json: the header's search fetches the search index, whose code reaches nearly every reader.
 */
function closure(entry: string): Map<string, string> {
  const seen = new Map<string, string>();
  const todo = [entry];
  while (todo.length) {
    const f = todo.pop()!;
    if (seen.has(f)) continue;
    const src = code(read(f));
    seen.set(f, src);
    for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']+)["']/g)) {
      const r = resolveModule(f, m[1]!);
      if (r) todo.push(r);
    }
    if (f === entry)
      for (const m of src.matchAll(/["'`/}]([\w-]+\.json)["'`]/g)) {
        const r = jsonRoutes.get(m[1]!);
        if (r) todo.push(r);
      }
  }
  return seen;
}

/** What shows that code reads a parameter: a lookup of its record by id, or a call (not the definition) of its file's loader, checked below. */
const readers: Record<string, RegExp> = {
  "P-09": /(?<!function )\bloadPinnedRules\(/,
  "P-10": /(?<!function )\bloadHomeGuideDoor\(/,
};
const readerOf = (id: string) => readers[id] ?? new RegExp(`(?:method_id\\s*===\\s*|\\bfind\\(\\s*|\\bparameterOf\\([^()]*?,\\s*)["']${id}["']`);

describe("the parameters page shows only what a live page reads", () => {
  const shown = Object.keys(parameterPages);

  it("finds the routes and follows a page into its modules and the .json it fetches", () => {
    expect(routes.length).toBeGreaterThan(10);
    expect(routeOf("/")).toBe("routes/home.tsx");
    expect(routeOf("/indices")).toBe("routes/invest.tsx");
    expect(routeOf("/guide")).toBe("routes/guide-index.tsx");
    expect(routeOf("/no-such-page")).toBe(null);
    const fees = [...closure(join(app, "routes/fees.tsx")).keys()].map((f) => f.slice(app.length + 1));
    expect(fees).toEqual(expect.arrayContaining(["routes/fees-data.ts", "lib/fees.server.ts"]));
  });

  it("names, for every parameter it shows, a parameter file in data/parameters/", () => {
    const dir = resolve(app, "../../data/parameters");
    const ids = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => (JSON.parse(read(join(dir, f))) as { method_id: string }).method_id);
    expect(shown.filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("links every page to a route the site has, and reads each parameter in that route's code", () => {
    const bad: string[] = [];
    for (const [key, page] of Object.entries(parameterPageRoutes)) {
      if (page.href !== null && !routeOf(page.href)) bad.push(`${key}: ${page.href} is no route in routes.ts`);
      if (!routes.some((r) => r.pattern === page.route)) bad.push(`${key}: the reading route "${page.route}" is not in routes.ts`);
    }
    for (const id of shown)
      for (const key of parameterPages[id]!) {
        const r = routes.find((x) => x.pattern === parameterPageRoutes[key].route);
        if (!r) continue;
        const found = [...closure(join(app, r.file)).values()].some((src) => readerOf(id).test(src));
        if (!found) bad.push(`${id}: ${r.file} (${key}) does not read it`);
      }
    expect(bad).toEqual([]);
  });

  it("each named loader reads its parameter's file", () => {
    const src = read(join(app, "lib/data.server.ts"));
    const body = (fn: string) => src.slice(src.indexOf(`export function ${fn}(`), src.indexOf("\n}\n", src.indexOf(`export function ${fn}(`)));
    expect(body("loadPinnedRules")).toContain("data/parameters/pinned-rules.json");
    expect(body("loadHomeGuideDoor")).toContain("data/parameters/home-guide-door.json");
  });

  it("shows exactly the parameters the map names, and the search lists the same ones", async () => {
    const data = (await loader()) as { parameters: { methodId: string }[] };
    expect(data.parameters.map((p) => p.methodId)).toEqual([...shown].sort());
    expect(Object.keys(parametersPage.names).sort()).toEqual([...shown].sort());
  });

  it("says no internal code on the page", async () => {
    const data = (await loader()) as { parameters: { name: string; why: string; kinds: string[]; values: { label: string }[]; pages: { name: string }[] }[] };
    const code = /\b[A-Z]{1,4}\d?-\d{2,3}\b|\bOQ ?\d/;
    const texts = [parametersPage.title, parametersPage.lede, ...data.parameters.flatMap((p) => [p.name, p.why, ...p.kinds, ...p.values.map((v) => v.label), ...p.pages.map((x) => x.name)])];
    expect(texts.filter((t) => code.test(t))).toEqual([]);
    expect(data.parameters.flatMap((p) => p.values.filter((v) => !v.label).map(() => p.name))).toEqual([]);
  });

  it("names no page the site no longer has in a line it shows", async () => {
    const data = (await loader()) as { parameters: { why: string; values: { label: string }[] }[] };
    const gone = /עמוד השאלות|עמוד ההשוואה|בהשוואה לפי חשיפה|טופס המטרה|השוואה למטרה/;
    expect(data.parameters.flatMap((p) => [p.why, ...p.values.map((v) => v.label)]).filter((t) => gone.test(t))).toEqual([]);
  });
});
