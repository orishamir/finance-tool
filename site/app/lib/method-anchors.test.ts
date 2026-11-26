// A formula that docs/method.md writes in words opens its full definition at the heading it stands under: the anchor GitHub gives that heading.
import { describe, expect, it } from "vitest";
import { loadFormulaAnchors, loadFormulaTex } from "./data.server";
import { loader } from "../routes/method-anchors";

describe("method.md anchors", () => {
  const anchors = loadFormulaAnchors();
  it("names the section an entry or an assumption stands under as GitHub writes its anchor", () => {
    expect(anchors["A-08"]).toBe("22-assumptions");
    expect(anchors["F-84"]).toBe("3-time-money-and-the-deflator");
  });
  it("the file the sheets fetch holds every formula with no line of math, and only those", async () => {
    const tex = loadFormulaTex();
    const served = (await (await loader()).json()) as Record<string, string>;
    expect(Object.keys(served).length).toBeGreaterThan(50);
    for (const [id, a] of Object.entries(anchors)) expect(served[id], id).toBe(tex[id]?.length ? undefined : a);
  });
});
