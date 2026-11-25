// A company's securities account, as its page draws it on the server. Its fees are the house's latest price list as its terms, read-only,
// as the indices page shows them, with nothing of a plan: each fee the deal holds with its figures, "עד" before a spread the list prints as
// a ceiling, a bank's distribution fee with who pays it, and each open question beside the price it concerns. A house whose list fills no
// deal keeps the price list's table. What can be bought at a house: the state's word opens the rule the record names for it (D105), and
// the word for a doubt is the indices page's ("לא ברור"), not "unknown".
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { brokeragePart, buildInstitution, institutionIds } from "../../../lib/institutions.server";
import { houseTermsData } from "../../../lib/fees.server";
import { latestSnapshots } from "../../../lib/providers.server";
import { loadBrands } from "../../../lib/brands.server";
import { startsDeal } from "../../../lib/providers";
import { feeNameOf } from "../../../lib/fee-deal/part-words";
import { feeDeal, help, invest, provenance as provenanceWords, r4catalogue } from "../../../copy";
import { ProvenanceProvider } from "../../provenance";
import { shown } from "../../invest/render-fixtures";
import { BrokerageGroupCard } from "./brokerage-card";
import { accountOf, type InstitutionKind, type TariffCardData } from "./types";
import type { RuleRecord } from "@finance-tool/schema";

const TODAY = "2026-11-25";
const w = invest.dealAccount;
const card = r4catalogue.card;

/** A house's brokerage part as its page's loader gives it: a brand's broker, else the bank's or broker's own page. */
function partOf(id: string): { kind: InstitutionKind; tariff: TariffCardData; rules: Record<string, RuleRecord> } {
  const brand = brokeragePart(id);
  if (brand) return brand;
  const page = buildInstitution(id);
  if (!page?.tariff) throw new Error(`no brokerage part at ${id}`);
  return { kind: page.kind, tariff: page.tariff, rules: page.rules };
}

/** Nothing the page holds already: the terms carry every rule they cite. */
const NONE_HELD = { rules: new Set<string>(), pointed: new Set<string>() };

/** The part as the server draws it, with the house's terms where its latest list fills a deal, less the rules the page holds already. */
const render = (id: string) => {
  const part = partOf(id);
  const terms = houseTermsData(id, TODAY, { rules: new Set(Object.keys(part.rules)), pointed: new Set() });
  const data = { rules: part.rules, terms: {}, dimensions: {}, today: TODAY };
  const { tariff, fees } = accountOf(part.tariff, terms);
  const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BrokerageGroupCard, { id, tariff, fees, kind: part.kind }) })));
  return { part, terms, out, text: shown(out) };
};

describe("a company's brokerage fees, as the house's terms", () => {
  it("are in the server's HTML: each fee the deal its latest list fills holds, by its name, and none of the price list's table", () => {
    const { terms, text } = render("meitav-trade");
    expect(terms).not.toBeNull();
    expect(terms!.deal.fees.length).toBeGreaterThan(0);
    for (const f of terms!.deal.fees) expect(text).toContain(feeNameOf(f.kind, f.name));
    expect(text).toContain(card.linesTitle);
    expect(text).not.toContain(card.cols.covers);
  });
  it("say \"עד\" before a spread the list prints as a ceiling: Meitav Trade's 0.8%, IBI's 0.7% and 0.5%", () => {
    const upTo = feeDeal.cases.parts.ceiling.trim();
    expect(render("meitav-trade").text).toMatch(new RegExp(`${upTo}\\s*0\\.8%`));
    const ibi = render("ibi").text;
    expect(ibi).toMatch(new RegExp(`${upTo}\\s*0\\.7%`));
    expect(ibi).toMatch(new RegExp(`${upTo}\\s*0\\.5%`));
  });
  it("draw a bank's distribution fee with its \"?\" and the rules it opens, that the bank may charge it, and each type of fund's price", () => {
    const d = card.distribution;
    const { terms, out, text } = render("leumi");
    expect(text).toContain(d.name);
    expect(out).toContain(`aria-label="${help.markLabel.replace("{about}", d.name)}"`);
    expect(text).toContain(d.chargeable);
    expect(text).toMatch(/קרן מסוג 1\s*0\.2%\s*בשנה/);
    // the "?"'s sheet opens MF-24 and MF-26, from the page's rules or the terms' own
    const { part } = render("leumi");
    const ids = [...Object.keys(part.rules), ...(terms?.data.rules.map((r) => r.id) ?? [])];
    expect(ids).toEqual(expect.arrayContaining(["MF-24", "MF-26"]));
    // a broker's list prints none
    expect(render("meitav-trade").text).not.toContain(d.name);
  });
  it("set each open question beside the price it concerns: Interactive Israel's trade in Europe (BRK-OQ25)", () => {
    const { terms, out } = render("interactive-israel");
    const trade = terms!.deal.fees.find((f) => f.kind === "trade")!;
    expect(JSON.stringify(trade)).toContain("BRK-OQ25");
    expect(out).toMatch(new RegExp(`0\\.15%(?:(?!<li)[\\s\\S])*?aria-label="${provenanceWords.idRef.question}"`));
  });
  it("carry nothing of a plan: no tile, no plan line, no figure or chip of a plan, no sentence on why a plan charges nothing, no button to enter terms", () => {
    for (const id of ["meitav-trade", "leumi", "interactive-israel", "ibi"]) {
      const { out, text } = render(id);
      expect(text).not.toContain(w.tiles.place);
      expect(text).not.toContain(w.tiles.leftNote);
      expect(text).not.toContain(w.plan("", "", 1, "", "", "").slice(0, 12));
      expect(out).not.toContain(`>${w.onPlan}<`);
      expect(text).not.toContain(w.offPlan);
      for (const why of Object.values(w.off)) expect(text).not.toContain(why);
      expect(out).not.toMatch(new RegExp(`<button[^>]*>[^<]*${w.fromHouse("").slice(0, 12)}`));
    }
  });
});

describe("the brokerage pages whose list fills no deal", () => {
  it("are those whose snapshot starts no deal, and only those keep the price list's table: Pepper, which stands under Leumi (D43)", () => {
    const snaps = new Map(latestSnapshots().map((s) => [s.id, s]));
    const pages = [...institutionIds(), ...loadBrands().flatMap((b) => (b.brokerId ? [b.brokerId] : []))].filter((id) => snaps.get(id) && !snaps.get(id)!.missing && (buildInstitution(id)?.tariff || brokeragePart(id)));
    const keep = [...new Set(pages)].filter((id) => !houseTermsData(id, TODAY, NONE_HELD));
    expect(keep).toEqual([...new Set(pages)].filter((id) => !startsDeal(snaps.get(id)!)));
    expect(keep).toContain("pepper");
    const { terms, text } = render("pepper");
    expect(terms).toBeNull();
    expect(text).toContain(card.cols.covers);
  });
  it("Pepper's trade line prints its 4 ₪ up to 30,000 ₪ with a link to page 11, not the rate's page 13", () => {
    const { part, out } = render("pepper");
    const tase = part.tariff.lines.find((l) => l.id === "pepper-buy-sell-tase")!;
    expect(tase.where?.page).toBe(13);
    expect(tase.flat!.where?.page).toBe(11);
    expect(out).toContain(card.flatUpTo.trade);
    expect(out).toContain(`>${card.page(11)}<`);
  });
});

describe("the can-buy rows on a company's card", () => {
  it("Interactive Brokers' \"no\" on Tel Aviv opens its rule, which the page holds", () => {
    const { part, out } = render("interactive-brokers");
    const no = part.tariff.availability.filter((a) => a.state === "no");
    expect(no.length).toBeGreaterThan(0);
    for (const a of no) expect(a.rules).toEqual(["BRK-64"]);
    expect(Object.keys(part.rules)).toContain("BRK-64");
    expect(out).toMatch(new RegExp(`class="ruled"[^>]*>${card.canBuy.state.no}<`));
  });
  it("a row whose record names no rule keeps its plain word; a doubt reads \"לא ברור\"", () => {
    const { part, out } = render("psagot");
    const doubt = part.tariff.availability.find((a) => a.state === "unknown")!;
    expect(doubt).toBeTruthy();
    expect(doubt.rules).toBeUndefined();
    expect(out).toContain(`>${card.canBuy.state.unknown}<`);
    expect(card.canBuy.state.unknown).toBe("לא ברור");
  });
});
