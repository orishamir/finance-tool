// An exposure page's product card says what its open questions leave out (D105): the pension products are blocked by conversion factors
// not collected (PEN OQ7, PEN OQ19), and how a pension is taxed is known (TXP-14 to TXP-17), so their tag never says the tax is unclear.
import { describe, expect, it } from "vitest";
import { exposurePage } from "../copy";
import { blockGroups, buildExposurePage } from "./guide.server";

describe("an exposure page's blocked tag", () => {
  it("sorts the blockers by what they leave open", () => {
    expect(blockGroups(["PEN-OQ7", "PEN-OQ19"])).toEqual([{ kind: "annuity", ids: ["PEN-OQ7", "PEN-OQ19"] }]);
    expect(blockGroups(["TXK-OQ3"])).toEqual([{ kind: "tax", ids: ["TXK-OQ3"] }]);
    expect(blockGroups(["PEN-OQ7", "X-OQ1"]).map((g) => g.kind)).toEqual(["annuity", "other"]);
  });
  it("no pension product on an exposure page is called unclear in tax", () => {
    const page = buildExposurePage("sp500") ?? buildExposurePage("index-sp500");
    expect(page).toBeTruthy();
    const blocked = page!.holders.filter((h) => h.blockedBy.length > 0);
    expect(blocked.length).toBeGreaterThan(0);
    for (const h of blocked) {
      expect(h.blocks.map((g) => g.kind), h.id).not.toContain("tax");
      expect(h.blocks.flatMap((g) => g.ids).sort(), h.id).toEqual([...h.blockedBy].sort());
    }
    expect(exposurePage.openBlock.annuity).toContain("מקדמי ההמרה");
  });
});
