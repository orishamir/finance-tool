// The browser build drops a module of ours that nothing uses an export of, unless side-effect-modules.ts lists it: a module that ran
// code at load (added names to copy.ts, listened to an event) and was imported only for that would vanish from the pages silently.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parseAst } from "vite";
import { describe, expect, it } from "vitest";
import { hasSideEffects, SIDE_EFFECT_MODULES } from "./side-effect-modules";

const repo = join(import.meta.dirname, "../../..");
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const modules = ["site/app", "packages/engine/src", "packages/schema/src"]
  .flatMap((d) => walk(join(repo, d)))
  .filter((f) => /\.tsx?$/.test(f) && !/\.(test|server)\.tsx?$|\.d\.ts$/.test(f))
  .map((f) => relative(repo, f));

/** A top-level statement that runs code when the module loads. Declarations, imports and exports only declare. */
type Node = { type: string; declaration?: Node | null };
const runsCode = (s: Node): boolean => {
  if (s.type === "ImportDeclaration" || s.type === "ExportAllDeclaration") return false;
  if (s.type === "ExportNamedDeclaration" || s.type === "ExportDefaultDeclaration") return false;
  return !/Declaration$/.test(s.type) && s.type !== "TSModuleDeclaration" && s.type !== "EmptyStatement";
};

describe("modules that run code at load", () => {
  it("are all listed, and every listed one exists", () => {
    const found = modules.filter((m) => {
      const ast = parseAst(readFileSync(join(repo, m), "utf8"), { lang: m.endsWith("x") ? "tsx" : "ts" }) as unknown as { body: Node[] };
      return ast.body.some(runsCode);
    });
    expect(found.sort()).toEqual([...SIDE_EFFECT_MODULES].sort());
  });

  it("are kept by the build; the rest of ours is not, and a package's module always is", () => {
    expect(hasSideEffects("/x/finance-tool/site/app/lib/fees.ts")).toBe(true);
    expect(hasSideEffects("/x/finance-tool/site/app/root.tsx?__react-router-build-client-route")).toBe(true);
    expect(hasSideEffects("/x/finance-tool/site/app/components/kit/index.ts")).toBe(false);
    expect(hasSideEffects("/x/finance-tool/packages/schema/src/index.ts")).toBe(false);
    expect(hasSideEffects("/x/finance-tool/site/app/app.css")).toBe(true);
    expect(hasSideEffects("/x/finance-tool/node_modules/react/index.js")).toBe(true);
  });
});
