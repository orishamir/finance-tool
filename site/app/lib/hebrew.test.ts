import { describe, expect, it } from "vitest";
import { hebrewCount, hebrewPrefix } from "./hebrew";

describe("hebrewPrefix", () => {
  it("puts a maqaf before a Latin letter or a digit", () => {
    expect(hebrewPrefix("מ", "Meitav")).toBe("מ־Meitav");
    expect(hebrewPrefix("ל", "10 שנים")).toBe("ל־10 שנים");
  });
  it("joins a Hebrew name directly", () => {
    expect(hebrewPrefix("ל", "מיטב")).toBe("למיטב");
    expect(hebrewPrefix("מ", "")).toBe("מ");
  });
});

describe("hebrewCount", () => {
  const forms = { one: "יום אחד", two: "יומיים", other: (n: string) => `${n} ימים` };
  it("uses the dual and the plural", () => {
    expect(hebrewCount(1, forms)).toEqual({ text: "יום אחד", numberInside: true });
    expect(hebrewCount(2, forms)).toEqual({ text: "יומיים", numberInside: true });
    expect(hebrewCount(5, forms)).toEqual({ text: "5 ימים", numberInside: false });
  });
});
