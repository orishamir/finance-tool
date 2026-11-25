// A spread a house's list prints as a ceiling ("מרווח המרה עד 0.8% משער ההמרה", Meitav Trade, method F-13), open in the editor: its part
// says "עד" once, before the figure's box, as the closed price says it before the figure.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { panel } from "../../lib/fee-deal/panel";
import { newDeal, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { PartLine, type PartPlace } from "./part-edit";

const TODAY = "2026-11-25";
const data = feesData();
const BOX = "[box]";

/** The words of the open part of fee `s`'s first price that `id` names, its figure's box drawn as BOX. */
function openPart(deal: FeeDeal, id: string): string {
  const fee = deal.fees[0];
  const part = fee && panel(readDealFor(deal, data.kinds, TODAY), fee.id)?.open.buy[0]?.parts.find((p) => p.id === id);
  const price = fee && "stages" in fee ? fee.stages?.[0]?.price : undefined;
  if (!fee || !part || !price) throw new Error(`no open ${id} part on the deal's first fee`);
  // only what the part's words and box read: the box stands in as a marker
  const at = { fee, side: "buy", k: 0, stages: "stages" in fee ? fee.stages : [], price, deal, label: (f: string) => f, edit: () => undefined, onFee: () => undefined, box: () => BOX, chooser: null } as unknown as PartPlace;
  return renderToStaticMarkup(createElement(PartLine, { part, at, onRemove: undefined })).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("a ceiling's figure open in the editor", () => {
  const upTo = feeDeal.cases.parts.ceiling.trim();
  it("says \"עד\" once, before its box: Meitav Trade's spread", () => {
    const spread = data.houses.find((h) => h.id === "meitav-trade")?.fees.find((f) => f.kind === "fx_spread");
    expect(spread).toBeDefined();
    const words = openPart({ ...newDeal("brokerage-account"), fees: [{ ...spread, id: "s" } as Fee] }, "share");
    expect(words.startsWith(`${upTo} ${BOX}`)).toBe(true);
    expect(words.split(upTo).length - 1).toBe(1);
  });
  it("says none before a figure that is what is charged: Meitav Trade's conversion fee", () => {
    const fx = data.houses.find((h) => h.id === "meitav-trade")?.fees.find((f) => f.kind === "fx");
    expect(fx).toBeDefined();
    const words = openPart({ ...newDeal("brokerage-account"), fees: [{ ...fx, id: "s" } as Fee] }, "share");
    expect(words).toContain(BOX);
    expect(words).not.toContain(upTo);
  });
});
