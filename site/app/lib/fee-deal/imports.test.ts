// The fee page's modules import each other without a cycle at run time: a module in a cycle can read an export of another before that
// module has run, depending on which loads first. Imports of types alone are left out, since they are gone at run time.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = import.meta.dirname;
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const modules = walk(ROOT).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));

/** The modules of the folder a module imports at run time. */
function runtimeImports(file: string): string[] {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/^import (?!type )[^;]*? from "(\.[^"]+)";/gm)]
    .map((m) => join(dirname(file), m[1]!))
    .map((p) => [`${p}.ts`, `${p}.tsx`].find(existsSync))
    .filter((p): p is string => !!p && p.startsWith(ROOT));
}

describe("the fee page's modules", () => {
  it("import each other with no cycle at run time", () => {
    const graph = new Map(modules.map((m) => [m, runtimeImports(m)]));
    const cycles: string[] = [];
    const done = new Set<string>();
    const visit = (m: string, path: string[]) => {
      if (path.includes(m)) return void cycles.push([...path.slice(path.indexOf(m)), m].map((x) => relative(ROOT, x)).join(" → "));
      if (done.has(m)) return;
      for (const n of graph.get(m) ?? []) visit(n, [...path, m]);
      done.add(m);
    };
    for (const m of modules) visit(m, []);
    expect(cycles).toEqual([]);
  });
});
