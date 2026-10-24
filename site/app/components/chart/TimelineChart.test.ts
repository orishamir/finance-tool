import { describe, expect, it } from "vitest";
import { fmt } from "../../lib/format";
import { niceYearTicks } from "./TimelineChart";

describe("niceYearTicks", () => {
  const cases: [number, number[]][] = [
    [3, [0, 1, 2, 3]],
    [7, [0, 2, 4, 6]],
    [10, [0, 2, 4, 6, 8, 10]],
    [12, [0, 2, 4, 6, 8, 10, 12]],
    [25, [0, 5, 10, 15, 20, 25]],
    [40, [0, 10, 20, 30, 40]],
  ];
  for (const [h, want] of cases) it(`horizon ${h}`, () => expect(niceYearTicks(h)).toEqual(want));

  it("uses only steps of 1, 2, 5 or 10 years, from 0, for every horizon 1 to 40", () => {
    for (let h = 1; h <= 40; h++) {
      const t = niceYearTicks(h);
      expect(t[0]).toBe(0);
      expect(t.length).toBeGreaterThanOrEqual(2);
      expect(t.length).toBeLessThanOrEqual(8);
      const step = t[1]! - t[0]!;
      expect([1, 2, 5, 10]).toContain(step);
      t.forEach((v, i) => expect(v).toBe(i * step));
      expect(t[t.length - 1]!).toBeLessThanOrEqual(h);
    }
  });
});

describe("value-axis label (audit A62)", () => {
  // visual left-to-right order inside a left-to-right isolate: the unit first, then the word, then the digits
  const strip = (s: string) => s.replace(/[⁦⁩]/g, "");
  it("spells thousands and millions as unit, word, number", () => {
    expect(strip(fmt.compactNisAxis(100000))).toBe("₪ אלף 100");
    expect(strip(fmt.compactNisAxis(1500000))).toBe("₪ מיליון 1.5");
    expect(strip(fmt.compactNisAxis(500))).toBe("₪ 500");
  });
  it("is wrapped in one isolate, so no engine reorders it", () => {
    const s = fmt.compactNisAxis(20000);
    expect(s.startsWith("⁦")).toBe(true);
    expect(s.endsWith("⁩")).toBe(true);
  });
  it("the running-text form keeps the logical order", () => {
    expect(fmt.compactNis(200000)).toBe("200 אלף ₪");
  });
});
