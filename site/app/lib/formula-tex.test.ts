// A formula's sheet shows the math docs/method.md writes for it, with the Hebrew key to its symbols from copy.ts (founder, 2026-11-08).
// The two live in different files, so this keeps them in step: every formula written as math has a key, every key a formula, every
// symbol the key explains is in the formula, a formula of several lines names each, and KaTeX reads every line without an error.
import katex from "katex";
import { describe, expect, it } from "vitest";
import { formulaKeys, formulaNames } from "../copy";
import { loadFormulaTex } from "./data.server";

const tex = loadFormulaTex();

describe("the formulas method.md writes as math", () => {
  it("are some, and each is a formula the site names", () => {
    expect(Object.keys(tex).length).toBeGreaterThan(0);
    for (const id of Object.keys(tex)) expect(formulaNames[id], id).toBeTruthy();
  });
  it("each has a key in copy.ts, and each key a formula", () => {
    expect(Object.keys(formulaKeys).sort()).toEqual(Object.keys(tex).sort());
  });
  it("every symbol a key explains is in its formula", () => {
    for (const [id, key] of Object.entries(formulaKeys)) {
      const all = (tex[id] ?? []).join(" ");
      for (const [symbol] of key.symbols) expect(all, `${id} ${symbol}`).toContain(symbol);
    }
  });
  it("an entry of several formulas names each, one name a line", () => {
    for (const [id, lines] of Object.entries(tex)) {
      if (lines.length > 1) expect(formulaKeys[id]?.lines?.length, id).toBe(lines.length);
      else expect(formulaKeys[id]?.lines, id).toBeUndefined();
    }
  });
  it("KaTeX reads every line and every symbol", () => {
    for (const [id, lines] of Object.entries(tex)) {
      for (const line of [...lines, ...(formulaKeys[id]?.symbols.map(([s]) => s) ?? [])]) expect(() => katex.renderToString(line, { throwOnError: true }), `${id}: ${line}`).not.toThrow();
    }
  });
});
