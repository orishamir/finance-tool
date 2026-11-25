import { describe, expect, it } from "vitest";
import { agorotOfShekels, shekelsOfAgorot } from "./agorot";

describe("shekels and agorot", () => {
  it("turns a price in shekels a dollar into the agorot it was written as, with no floating-point noise", () => {
    expect(0.07 * 100).not.toBe(7);
    expect(agorotOfShekels(0.07)).toBe(7);
    expect(agorotOfShekels(0.035)).toBe(3.5);
    expect(agorotOfShekels(0.015)).toBe(1.5);
    expect(agorotOfShekels(0)).toBe(0);
  });

  it("turns agorot back into the shekels they are, and the two ways undo each other", () => {
    expect(shekelsOfAgorot(1.5)).toBe(0.015);
    expect(1.1 / 100).not.toBe(0.011);
    expect(shekelsOfAgorot(1.1)).toBe(0.011);
    expect(shekelsOfAgorot(7)).toBe(0.07);
    for (const nis of [0.015, 0.0125, 0.07, 0.1, 1.23]) expect(shekelsOfAgorot(agorotOfShekels(nis))).toBe(nis);
  });
});
