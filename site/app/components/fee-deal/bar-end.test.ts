// The bar's end and the template picker: how a saved deal is listed, what a price list says it leaves out, and the note of a deal a template
// filled, on the site's data read on 11.2026.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { feeDeal, leftOut as leftOutWords } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { newDeal } from "../../lib/fee-deal/model";
import { dealFromTemplate, templateOf, templateSource } from "../../lib/fee-deal/templates";
import { dealLabel, dealMeta } from "./bar-end";
import { leavesText, TemplateNote } from "./picker";

const data = feesData();
const TODAY = "2026-11-12";
const text = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el).replace(/<[^>]+>/g, "").replace(/&quot;/g, "\"");

describe("a saved deal in the list", () => {
  it("is listed by its name, else its template's, else the kind's placeholder", () => {
    const d = newDeal("brokerage-account");
    expect(dealLabel({ ...d, name: "  החשבון בלאומי " }, "חשבון ניירות ערך")).toBe("החשבון בלאומי");
    expect(dealLabel({ ...d, template: { id: "house:leumi", name: "לאומי" } }, "חשבון ניירות ערך")).toBe("לאומי");
    expect(dealLabel(d, "חשבון ניירות ערך")).toBe(feeDeal.bar.namePlaceholder("חשבון ניירות ערך"));
    expect(dealLabel(newDeal(null), null)).toBe(feeDeal.bar.namePlaceholder(null));
  });
  it("says under its name its product and the day it was saved, so two rows of one name are told apart", () => {
    const d = { ...newDeal("brokerage-account"), saved: "2026-11-13" };
    expect(dealMeta(d, "חשבון ניירות ערך")).toBe(`חשבון ניירות ערך · ${feeDeal.end.savedOn}13.11.2026`);
    expect(dealMeta(newDeal(null), null)).toBe(feeDeal.bar.namePlaceholder(null));
  });
});

describe("what a template leaves out", () => {
  const probe = newDeal("brokerage-account");
  it("counts a price list's lines in the picker", () => {
    // Psagot's whole list fills the deal but its conversion priced per dollar and its redemption's plan
    expect(leavesText(templateOf(probe, "house:psagot", data, TODAY)!.left)).toBe("שתי שורות לא נכנסות");
    expect(leavesText([])).toBeUndefined();
  });
  it("names the template a new deal was filled from, what its record says the price leaves out, and each line it left out by name under why", () => {
    const deal = dealFromTemplate(probe, "house:leumi", data, TODAY)!;
    expect(templateSource(deal.template!.id)).toBe("house");
    const t = templateOf(deal, deal.template!.id, data, TODAY)!;
    const note = text(createElement(TemplateNote, { template: deal.template!, left: t.left, leftOut: t.leftOut ?? null }));
    expect(note).toContain(`${feeDeal.filled.from.house}${deal.template!.name}`);
    expect(note).toContain(feeDeal.filled.why["set-aside"]);
    // the standing order's line by its own name, and the caveats' line (D106)
    expect(note).toContain("הוראת קבע");
    expect(note).toContain(leftOutWords.lead);
  });
  it("says a track's deposit fee is none by rule where the product's fee regulation has none", () => {
    const deal = dealFromTemplate(newDeal("keren-hishtalmut"), "track:154", data, TODAY)!;
    expect(templateSource(deal.template!.id)).toBe("track");
    expect(deal.fees.map((f) => f.kind)).toEqual(["balance"]);
    const note = text(createElement(TemplateNote, { template: deal.template!, left: templateOf(deal, deal.template!.id, data, TODAY)!.left }));
    expect(note).toContain(feeDeal.filled.from.track);
    expect(note).toContain(feeDeal.filled.why["none-by-rule"]);
  });
});
