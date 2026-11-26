// A flag's words with a "{ID:figure.from}" slot: the month the figure takes effect, and, where the figure gives none, "היום", so the
// sentence BANK-35's flag opens with ("מ{…from}") reads right either way.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { flags, provenance } from "../copy";
import { ProvenanceProvider } from "./provenance";
import { SlottedText } from "./provenance-sheets";

const bank35 = JSON.parse(readFileSync(new URL("../../../data/rules/bank-35.json", import.meta.url), "utf8")) as RuleRecord;
const words = flags["BANK-35"];
if (!words) throw new Error("BANK-35's flag has words");
const text = (rule: RuleRecord) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: { "BANK-35": rule }, today: "2026-11-22" } } as never, createElement(SlottedText, { text: words, source: { rules: { "BANK-35": rule }, today: "2026-11-22" } })))).replace(/<[^>]+>/g, "");

describe("BANK-35's flag opens with the month its cap takes effect", () => {
  it("names the month where the figure gives one, and reads from now where it gives none", () => {
    expect(text(bank35).startsWith("מ")).toBe(true);
    expect(text(bank35)).not.toContain("—");
    const undated = structuredClone(bank35);
    const f = undated.figures?.account_fee_up_to_2_actions;
    if (!f || Array.isArray(f) || !("effective_from" in f)) throw new Error("the cap's figure");
    f.effective_from = null;
    expect(text(undated).startsWith(`מ${provenance.fromNoDate} `)).toBe(true);
  });
});
