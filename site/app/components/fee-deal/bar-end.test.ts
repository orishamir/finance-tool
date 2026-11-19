// The bar's end and the template picker: how a saved deal is listed, what a price list says it leaves out, and the note of a deal a template
// filled, on the site's data read on 11.2026.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { feeDeal, houseAverage, leftOut as leftOutWords } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { newDeal } from "../../lib/fee-deal/model";
import { dealFromTemplate, templateOf, templateSource } from "../../lib/fee-deal/templates";
import { dealLabel, dealMeta } from "./bar-end";
import { leavesText, leftParts, TemplateNote } from "./picker";

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
    // Psagot's whole list fills the deal but its conversion priced per dollar, the spread on its other conversion, and makam's redemption
    expect(leavesText(templateOf(probe, "house:psagot", data, TODAY)!.left)).toBe("3 שורות לא נכנסות");
    expect(leavesText([])).toBeUndefined();
  });
  it("says on one line what its record says the price leaves out and how many lines it left out, each line in the sheet by name under why", () => {
    const deal = dealFromTemplate(probe, "house:leumi", data, TODAY)!;
    expect(templateSource(deal.template!.id)).toBe("house");
    const t = templateOf(deal, deal.template!.id, data, TODAY)!;
    const parts = leftParts(t.left);
    const note = text(createElement(TemplateNote, { template: deal.template!, left: t.left, leftOut: t.leftOut ?? null }));
    // the caveats' line (D106), then the count of the lines left out; the template's name is the strip's step, not the note's
    expect(note).toContain(leftOutWords.lead);
    expect(note).toContain(` · ${feeDeal.filled.count.house(parts.length)}`);
    expect(note).not.toContain(deal.template!.name);
    // what the house charged on average, its own words on the same line (F-122)
    const withAverages = text(createElement(TemplateNote, { template: deal.template!, left: t.left, leftOut: t.leftOut ?? null, averages: t.averages! }));
    expect(withAverages).toContain(` · ${feeDeal.filled.count.house(parts.length)} · ${houseAverage.tap}`);
    expect(parts.some((p) => p.group === feeDeal.filled.why["set-aside"])).toBe(true);
    // the standing order's line by its own name
    expect(parts.some((p) => p.text.includes("הוראת קבע"))).toBe(true);
  });
  it("says a track's deposit fee is none by rule where the product's fee regulation has none", () => {
    const deal = dealFromTemplate(newDeal("keren-hishtalmut"), "track:154", data, TODAY)!;
    expect(templateSource(deal.template!.id)).toBe("track");
    expect(deal.fees.map((f) => f.kind)).toEqual(["balance"]);
    const left = templateOf(deal, deal.template!.id, data, TODAY)!.left;
    const note = text(createElement(TemplateNote, { template: deal.template!, left }));
    expect(note).toBe(`${leftOutWords.lead} ${feeDeal.filled.count.track(1)}`);
    expect(leftParts(left)).toEqual([{ text: feeDeal.filled.why["none-by-rule"] }]);
  });
});
