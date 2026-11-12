// The chosen fee's panel on the site's data read on 11.2026: its block "מול החוק" is the fee's row of the reading's law card, read from the
// reading's month on, so a price that has passed is neither its bar nor its tag.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { panel } from "../../lib/fee-deal/builder";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { PanelColumn } from "./panel";

const data = feesData();
const TODAY = "2026-11-12";

/** A provident fund whose fee on the savings was 2% a year, above the cap, until 01.2026, and is 0.6% since. */
const passedAbove = (): FeeDeal => ({
  id: "deal-p",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [{ id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(2), per: 12, every: 12 }, until: "2026-01" }, { price: { form: "held", rate: typed(0.6), per: 12, every: 12 } }] }],
});

const draw = (deal: FeeDeal, feeId: string) => {
  const reading = readingOf(deal, data.kinds, TODAY, data.fx);
  const props = {
    panel: panel(deal, feeId, data.kinds, TODAY),
    fee: deal.fees.find((f) => f.id === feeId) ?? null,
    law: reading.law.find((r) => r.fee === feeId) ?? null,
    first: reading.from,
    saved: true,
    onFee: () => {},
    onRemove: () => {},
  };
  const provenance = { rules: {}, terms: {}, dimensions: {}, today: TODAY };
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: provenance, children: createElement(PanelColumn, props) })));
  return html.replace(/<[^>]+>/g, "").replace(/[⁦-⁩‎‏]/g, "");
};

describe("the panel's block against the cap", () => {
  it("tags and words the price of today, not a price that has passed", () => {
    const text = draw(passedAbove(), "fee-balance");
    expect(text).toContain(feeDeal.panel.law);
    expect(text).toContain(feeDeal.standing.tag.below);
    expect(text).not.toContain(feeDeal.standing.tag.above);
    expect(text).not.toContain(feeDeal.standing.above);
  });
});
