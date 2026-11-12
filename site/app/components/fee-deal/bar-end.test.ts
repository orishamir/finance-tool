// The bar's end and the template picker: how a saved deal is listed, what a price list says it leaves out, and the note of a deal a template
// filled, on the site's data read on 11.2026.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { newDeal } from "../../lib/fee-deal/model";
import { dealFromTemplate, HELD_UNSAID, templateOf, templateSource } from "../../lib/fee-deal/templates";
import { dealLabel } from "./bar-end";
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
});

describe("what a template leaves out", () => {
  const probe = { ...newDeal("brokerage-account"), held: HELD_UNSAID };
  it("counts a price list's lines in the picker, and says where it has none for what the deal holds", () => {
    expect(leavesText(templateOf(probe, "house:leumi", data, TODAY)!.left)).toBe("שתי שורות לא נכנסות");
    expect(leavesText(templateOf(probe, "house:psagot", data, TODAY)!.left)).toBeUndefined();
    expect(leavesText([{ why: "no-holding" }])).toBe(feeDeal.picker.noHolding);
  });
  it("names the template a new deal was filled from and lists what it left out, by why", () => {
    const deal = dealFromTemplate(probe, "house:leumi", data, TODAY)!;
    expect(templateSource(deal.template!.id)).toBe("house");
    const note = text(createElement(TemplateNote, { template: deal.template!, left: templateOf(deal, deal.template!.id, data, TODAY)!.left }));
    expect(note).toContain(`${feeDeal.filled.from.house}${deal.template!.name}`);
    expect(note).toContain(feeDeal.filled.why["share-cap"]);
    expect(note).toContain(feeDeal.filled.why["set-aside"]);
    expect(note).toContain("שורה אחת");
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
