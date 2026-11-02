import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { guide, provenance } from "../copy";
import { IdRef, ProvenanceProvider } from "./provenance";

describe("an open question's chip (D49, 2026-11-02)", () => {
  const render = (id: string) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, today: "2026-11-02" } } as never, createElement(IdRef, { id }))));
  it("says a word, not the code", () => {
    const html = render("GOV OQ8");
    expect(html).toContain(provenance.idRef.questionChip);
    expect(html).not.toContain("OQ8");
  });
  it("keeps a rule's code", () => expect(render("TXS-05")).toContain("TXS-05"));
  it("the guide's own section titles name real sections", () => {
    const ids = guide.sections.map((s) => s.id as string);
    for (const titles of Object.values(guide.sectionTitles)) for (const id of Object.keys(titles)) expect(ids).toContain(id);
  });
});
