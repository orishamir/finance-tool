// The index page's pair result (the receipt and the fees panel) rendered on the collected data at the sliders' ends and between, with any
// fund picked, on every index (render-pair-bars.test.ts renders it on MSCI ACWI, where the page fell over).
import { describe, expect, it } from "vitest";
import { knownIndices } from "../../lib/invest";
import { bundle, unrenderedAtSliders } from "./render-fixtures";

describe("the receipt and the fees panel render at the sliders' ends and between, with any fund picked, on every index", () => {
  it.each(knownIndices(bundle).map((index) => [index.id, index] as const))("%s: every fund, five plans", (_, index) => {
    expect(unrenderedAtSliders(index)).toEqual([]);
  });
});
