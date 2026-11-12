// What can be bought at a house: the state's word opens the rule the record names for it (D105), and the word for a doubt is the
// indices page's ("לא ברור"), not "unknown".
// A fee line with a flat price for a small order or conversion prints it as its row's second line, with its own link to where it stands.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { brokeragePart, buildInstitution } from "../../../lib/institutions.server";
import { r4catalogue } from "../../../copy";
import { ProvenanceProvider } from "../../provenance";
import { BrokerageGroupCard } from "./brokerage-card";

const render = (id: string) => {
  const part = brokeragePart(id)!;
  const data = { rules: part.rules, terms: {}, dimensions: {}, today: "2026-11-12" };
  return { part, out: renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BrokerageGroupCard, { id, tariff: part.tariff, kind: part.kind }) }))) };
};

describe("the can-buy rows on a company's card", () => {
  it("Interactive Brokers' \"no\" on Tel Aviv opens its rule, which the page holds", () => {
    const { part, out } = render("interactive-brokers");
    const no = part.tariff.availability.filter((a) => a.state === "no");
    expect(no.length).toBeGreaterThan(0);
    for (const a of no) expect(a.rules).toEqual(["BRK-64"]);
    expect(Object.keys(part.rules)).toContain("BRK-64");
    expect(out).toMatch(new RegExp(`class="term"[^>]*>${r4catalogue.card.canBuy.state.no}<`));
  });
  it("a row whose record names no rule keeps its plain word; a doubt reads \"לא ברור\"", () => {
    const { part, out } = render("psagot");
    const doubt = part.tariff.availability.find((a) => a.state === "unknown")!;
    expect(doubt).toBeTruthy();
    expect(doubt.rules).toBeUndefined();
    expect(out).toContain(`>${r4catalogue.card.canBuy.state.unknown}<`);
    expect(r4catalogue.card.canBuy.state.unknown).toBe("לא ברור");
  });
});

describe("a fee line with a flat price for a small order or conversion", () => {
  const renderBank = (id: string) => {
    const page = buildInstitution(id)!;
    const data = { rules: page.rules, terms: {}, dimensions: {}, today: "2026-11-12" };
    return { page, out: renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BrokerageGroupCard, { id, tariff: page.tariff, kind: page.kind }) }))) };
  };
  it("Hapoalim's conversion prints its flat price beside the percent, with its own link to where it stands", () => {
    const { page, out } = renderBank("hapoalim");
    const direct = page.tariff!.lines.find((l) => l.id === "hapoalim-fx-conversion-direct")!;
    expect(direct.flat).toMatchObject({ amount: expect.objectContaining({ value: 3.3, unit: "usd" }), upTo: expect.objectContaining({ value: 99, unit: "usd" }) });
    expect(direct.flat!.where).toMatchObject({ url: expect.stringContaining("single_small_51026.xls"), tariff: true });
    // the row's second line: its price across the price and bound columns, then its own place's link
    const row = out.match(/<tr[^>]*>(?:(?!<\/tr>)[\s\S])*?colspan="3"(?:(?!<\/tr>)[\s\S])*?<\/tr>/i);
    expect(row).toBeTruthy();
    expect(row![0]).toContain(r4catalogue.card.flatUpTo.fx);
    expect(row![0]).toContain(direct.flat!.where!.url.replace(/&/g, "&amp;"));
    expect(row![0]).toContain("3.30");
    // the sum it holds up to is whole, as the price list prints it
    expect(row![0]).toMatch(/>99 \$</);
  });
  it("Pepper's trade line prints its 4 ₪ up to 30,000 ₪ with a link to page 11, not the rate's page 13", () => {
    const { page, out } = renderBank("pepper");
    const tase = page.tariff!.lines.find((l) => l.id === "pepper-buy-sell-tase")!;
    expect(tase.where?.page).toBe(13);
    expect(tase.flat!.where?.page).toBe(11);
    expect(out).toContain(r4catalogue.card.flatUpTo.trade);
    expect(out).toContain(`>${r4catalogue.card.page(11)}<`);
  });
  it("a line with no flat price keeps one line", () => {
    const { page } = renderBank("hapoalim");
    expect(page.tariff!.lines.filter((l) => l.flat).map((l) => l.id).sort()).toEqual(["hapoalim-fx-conversion-branch", "hapoalim-fx-conversion-direct"]);
  });
});
