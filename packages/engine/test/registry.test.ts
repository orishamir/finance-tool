import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formulas, pending } from "../src/index.ts";

const method = readFileSync(new URL("../../../docs/method.md", import.meta.url), "utf8");
const defined = new Set([...method.matchAll(/\*\*(F-\d{2})\b/g)].map((m) => m[1]!));

describe("formula registry", () => {
  it("implements only formulas defined in docs/method.md", () => {
    for (const id of Object.keys(formulas)) expect(defined, id).toContain(id);
  });

  it("names each implementation in its doc comment", () => {
    const dir = new URL("../src/", import.meta.url);
    const sources = readdirSync(dir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => readFileSync(new URL(f, dir), "utf8"))
      .join("\n");
    for (const id of Object.keys(formulas)) expect(sources).toContain(`* ${id} `);
  });

  it("covers every formula in docs/method.md, implemented or pending with its release", () => {
    for (const id of defined) expect(id in formulas || id in pending, id).toBe(true);
    for (const id of Object.keys(pending)) expect(id in formulas, `${id} is both implemented and pending`).toBe(false);
  });
});
