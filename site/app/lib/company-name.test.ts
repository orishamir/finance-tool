// A company's name in the lists: the legal suffix goes, the rest stays.
import { describe, expect, it } from "vitest";
import { withoutLtd } from "./company-name";

describe("withoutLtd", () => {
  it("drops the suffix at the end, or before a closing bracket", () => {
    expect(withoutLtd('בנק הפועלים בע"מ')).toBe("בנק הפועלים");
    expect(withoutLtd("אילון קופות גמל בע״מ")).toBe("אילון קופות גמל");
    expect(withoutLtd('פסגות ניירות ערך בע"מ (פסגות טרייד)')).toBe("פסגות ניירות ערך (פסגות טרייד)");
  });
  it("leaves a name without it, and never leaves a name empty", () => {
    expect(withoutLtd("Interactive Brokers")).toBe("Interactive Brokers");
    expect(withoutLtd('בע"מ')).toBe('בע"מ');
  });
});
