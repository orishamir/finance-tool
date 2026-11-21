// The index page's pair result (the receipt and the fees panel) rendered on the collected data (part of render.test.ts, which says why it is
// split), on the index where the page fell over; render-pair-bars.pages.deep.test.ts renders it on every index.
import { describe, expect, it } from "vitest";
import { knownIndices } from "../../lib/invest";
import { bundle, unrenderedAtSliders } from "./render-fixtures";

describe("the receipt and the fees panel render at the sliders' ends and between, with any fund picked (pass 7: the page fell over on MSCI ACWI)", () => {
  it("index-msci-acwi: every fund, five plans", () => {
    const index = knownIndices(bundle).find((x) => x.id === "index-msci-acwi");
    expect(index).toBeDefined();
    expect(unrenderedAtSliders(index!)).toEqual([]);
  });
});
