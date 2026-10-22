// Keeps the code schema and docs/data-schema.md from drifting apart (docs/architecture.md 3.1).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { unit, valueObject } from "../src/index.ts";

const doc = readFileSync(new URL("../../../docs/data-schema.md", import.meta.url), "utf8");

describe("docs/data-schema.md agrees with the code", () => {
  it("lists the same value-object fields", () => {
    const section = doc.slice(doc.indexOf("Field rules:"), doc.indexOf("**Strength vocabulary**"));
    const documented = new Set([...section.matchAll(/^\| `([a-z_]+)(?:\.[a-z]+)?` \|/gm)].map((m) => m[1]));
    const inCode = new Set(Object.keys(valueObject.shape));
    // computed_from is described inside the `state` row, not in its own row.
    inCode.delete("computed_from");
    expect([...documented].sort()).toEqual([...inCode].sort());
  });

  it("lists the same units", () => {
    const line = doc.split("\n").find((l) => l.startsWith("Units:"))!;
    const documented = [...line.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
    expect(documented.sort()).toEqual([...unit.options].sort());
  });
});
