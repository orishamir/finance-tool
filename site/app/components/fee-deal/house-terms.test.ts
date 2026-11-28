// A house's terms (`HouseTerms`) as a company page's first view gets them (`houseTermsData`): the house cut to what its terms draw and the
// rules their figures cite, with nothing else of the fee page's data. Drawn on that cut, every house's terms read as they do on the whole
// of the fee page's data, so the cut leaves out nothing they draw.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { feesData, houseTermsData } from "../../lib/fees.server";
import { houseDeal } from "../../lib/deal-account/house-deal";
import { termsEditorData, type FeesData, type TermsHouse } from "../../lib/fee-page-data";
import type { FeeDeal } from "../../lib/fee-deal/model";
import { html } from "../invest/render-fixtures";
import { HouseTerms } from "./house-terms";

const TODAY = "2026-11-25";
const all = feesData();
const NONE_HELD = { rules: new Set<string>(), pointed: new Set<string>() };

/** The terms drawn by the editor on `editor`. The rules they cite are read only when a figure's sheet opens, not on the server. */
const draw = (editor: FeesData, first: FeeDeal, house: TermsHouse): string => html(createElement(HouseTerms, { data: editor, today: TODAY, first, house }));

describe("a house's terms on the data a company page's first view gets", () => {
  it("draw as on the fee page's whole data, at every house whose list fills a deal", () => {
    let drawn = 0;
    for (const template of all.houses) {
      const cut = houseTermsData(template.id, TODAY, NONE_HELD);
      expect(cut === null).toBe(houseDeal(`house:${template.id}`, all, TODAY) === null);
      if (!cut) continue;
      expect(draw(termsEditorData(cut.data), cut.deal, cut.house)).toBe(draw(all, cut.deal, template));
      drawn++;
    }
    expect(drawn).toBeGreaterThan(5);
  });
  it("carry no rule the house's deal, lines and distribution fee do not cite, and none the page holds already", () => {
    const meitav = houseTermsData("meitav-trade", TODAY, NONE_HELD);
    const ids = meitav?.data.rules.map((r) => r.id) ?? [];
    // Meitav Trade's lines cite no rule, since no rule sets a member's own prices; its averages cite the exchange's calculator, and no
    // distribution fee's rule stands, since its list prints none
    expect(ids).toEqual(["BRK-33"]);
    const held = houseTermsData("meitav-trade", TODAY, { rules: new Set(ids), pointed: new Set(meitav?.data.pointed?.map((r) => r.id)) });
    expect(held?.data.rules).toEqual([]);
    expect(held?.data.pointed).toEqual([]);
    // a bank's list prints a distribution fee, whose "?" opens MF-24 and MF-26
    expect(houseTermsData("leumi", TODAY, NONE_HELD)?.data.rules.map((r) => r.id)).toEqual(expect.arrayContaining(["MF-24", "MF-26"]));
  });
});
