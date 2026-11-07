// A figure the engine labels "reading" rests on the site's own reading of official texts, not on a press article or a forum
// post: its mark says "קריאה של האתר", never "מקור משני" (2026-11-07; the guides' exit step already did).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { numbers, strength } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { ReadingMark } from "./parts";

const value = (labels: SiteValue["labels"]): SiteValue =>
  ({ value: 1000, unit: "nis", state: "computed", source: { url: "", title: "", publisher: "", strength: "primary", checked: "2026-11-07" }, labels }) as unknown as SiteValue;

describe("ReadingMark", () => {
  it("marks a reading as the site's reading, not a secondary source", () => {
    const html = renderToStaticMarkup(createElement(ReadingMark, { value: value([{ code: "reading", ruleId: "TXK-07" }]) }));
    expect(html).toContain(numbers.reading);
    expect(html).not.toContain(strength.secondary.label);
  });
  it("shows nothing without the label", () => {
    expect(renderToStaticMarkup(createElement(ReadingMark, { value: value([]) }))).toBe("");
  });
});
