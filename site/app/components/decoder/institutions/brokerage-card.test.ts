// What can be bought at a house: the state's word opens the rule the record names for it (D105), and the word for a doubt is the
// indices page's ("לא ברור"), not "unknown".
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { brokeragePart } from "../../../lib/institutions.server";
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
