// The focus pane's line under a bank's deposits or savings plans: the dates of the bank's records of the product, one where they agree,
// else the oldest and the newest.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { companyFocus as w } from "../../copy";
import type { FocusProduct } from "../../lib/company-focus";
import { ProvenanceProvider } from "../provenance";
import { ProductLine } from "./focus";

const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-23" };
const line = (asOf: FocusProduct["asOf"]) =>
  renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ProductLine, { p: { id: "bank-deposit", count: 3, asOf, href: "/x" } as FocusProduct, figures: undefined }) } as never)))
    // the text alone, without its markup and isolates
    .replace(/<[^>]+>/g, "")
    .replace(/[⁦-⁩‎‏]/g, "");

describe("the focus pane's date line", () => {
  it("says one date where every record of the product is of one day", () => {
    const out = line({ from: "2026-11-08", to: "2026-11-08" });
    expect(out).toContain(`${w.asOf.one}08.11.2026`);
    expect(out).not.toContain(w.asOf.to.trim());
  });
  it("says the oldest and the newest where the records are of several days", () => {
    const out = line({ from: "2026-10-23", to: "2026-11-14" });
    expect(out).toContain(`${w.asOf.from}23.10.2026`);
    expect(out).toContain(`${w.asOf.to}14.11.2026`);
  });
});
