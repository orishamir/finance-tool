import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { formulaNames, guide, provenance, rule } from "../copy";
import { IdRef, ProvenanceProvider } from "./provenance";

describe("an open question's chip (D49, 2026-11-02)", () => {
  const render = (id: string) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, today: "2026-11-02" } } as never, createElement(IdRef, { id }))));
  it("says a word, not the code", () => {
    const html = render("GOV OQ8");
    expect(html).toContain(provenance.idRef.questionChip);
    expect(html).not.toContain("OQ8");
  });
  // D48: a rule's chip says "חוקים וכללים · 1" and opens its card; the code stays in the card
  it("a rule's chip says the words of D48, not the code", () => {
    const html = render("TXS-05");
    expect(html).toContain(rule.set);
    expect(html).not.toContain("TXS-05");
  });
  it("a formula's chip says its name, not the code", () => {
    const html = render("F-92");
    expect(html).toContain(formulaNames["F-92"]!);
    expect(html).not.toContain("F-92");
  });
  it("a titled rule's chip says the rule's title", () => {
    const html = renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: { "TXS-05": { id: "TXS-05", title_he: "מס על רווח הון", title: "x" } }, today: "2026-11-02" } } as never, createElement(IdRef, { id: "TXS-05", titled: true }))));
    expect(html).toContain("מס על רווח הון");
    expect(html).not.toContain("TXS-05");
  });
  it("the guide's own section titles name real sections", () => {
    const ids = guide.sections.map((s) => s.id as string);
    for (const titles of Object.values(guide.sectionTitles)) for (const id of Object.keys(titles)) expect(ids).toContain(id);
  });
});
