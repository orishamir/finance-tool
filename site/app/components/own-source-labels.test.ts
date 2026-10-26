// D31 on a rule card's source lines (review, 2026-10-26): a company's own document on its own term drops "לפי החברה", and only that.
// A press article or a forum post keeps "מקור משני", a copy of an official text keeps "עותק" (D7), even on a company's term.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { sourceBlock } from "../copy";
import { ProvenanceProvider, RuleCard, SourceBlock } from "./provenance";

const src = (strength: "primary" | "primary-mirror" | "institution" | "secondary", url: string) => ({ url, title: `מסמך ${strength}`, publisher: "x", strength, checked: "2026-10-25", ...(strength === "primary-mirror" ? { mirror_host: "other" as const } : {}) });
const sources = [src("institution", "https://example.org/own.pdf"), src("secondary", "https://example.org/press"), src("primary-mirror", "https://example.org/copy.pdf")];
const render = (el: ReturnType<typeof createElement>, data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-26" }) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: el })));
const weak = sourceBlock.weak;

describe("the source lines of a company's own term", () => {
  it("own drops the company label only", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true, own: true }));
    expect(html).not.toContain(weak.institution);
    expect(html).toContain(weak.secondary);
    expect(html).toContain(weak["primary-mirror"]);
  });
  it("without own, every weak label shows", () => {
    const html = render(createElement(SourceBlock, { source: sources, today: "2026-10-26", inline: true }));
    for (const s of ["institution", "secondary", "primary-mirror"]) expect(html).toContain(weak[s]);
  });
  it("IRA-28's card (a regulator's announcement and press articles about two companies) keeps 'מקור משני' and names no company document", () => {
    const root = new URL("../../../", import.meta.url);
    const ira28 = JSON.parse(readFileSync(new URL("data/rules/ira-28.json", root), "utf8")) as RuleRecord;
    const data = { rules: { "IRA-28": ira28 }, terms: {}, dimensions: {}, today: "2026-10-26", ownDocs: {} };
    const html = render(createElement(RuleCard, { id: "IRA-28", data, inline: true }), data);
    expect(html).toContain(weak.secondary);
    expect(html).not.toContain("נמצא במסמכים של");
    expect(html).toContain("המקורות כאן אינם מסמכים של סלייס וגלובלנט");
  });
});
