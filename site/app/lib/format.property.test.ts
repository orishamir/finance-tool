// One number, one rounding (method §13): the number a shekel amount reads as on the page (`amountShown`) is the number `formatValue` writes,
// so a difference worked out from the shown amounts agrees with them as written, and a whole amount shows no agorot.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { amountShown, fmt, formatValue } from "./format";

const states = [undefined, "sourced", "computed", "entered"] as const;
const units = ["nis", "nis_per_month", "nis_per_trade", "nis_per_transfer"] as const;
// amounts with agorot and a third decimal, where half an agora rounds: 2,321.825, 9.995, −0.005
const amount = fc.integer({ min: -10_000_000, max: 10_000_000 }).map((n) => n / 1000);

describe("amountShown is the number formatValue writes", () => {
  it("writes the same text for the amount and for the number it reads as", () => {
    fc.assert(
      fc.property(amount, fc.constantFrom(...states), fc.constantFrom(...units), fc.boolean(), (v, state, unit, parameter) => {
        const shown = amountShown(v, unit, state, parameter);
        expect(formatValue(shown, unit, state, parameter)).toBe(formatValue(v, unit, state, parameter));
      }),
    );
  });

  it("agrees with the formatter where its half-agora rounding differs from rounding the binary value", () => {
    // 2,321.825 is written "2,321.83 ₪"; Math.round(232182.5) on the binary value gave 2,321.82
    expect(fmt.nis(2321.825)).toBe("2,321.83 ₪");
    expect(amountShown(2321.825, "nis", "sourced")).toBe(2321.83);
    // 9.995 rounds to whole shekels: "10 ₪", never "10.00 ₪", and reads as 10
    expect(fmt.nis(9.995)).toBe("10 ₪");
    expect(amountShown(9.995, "nis", "computed")).toBe(10);
    expect(amountShown(-1234.4, "nis", "computed")).toBe(-1234);
    // a value that rounds to zero is 0, with no minus
    expect(Object.is(amountShown(-0.004, "nis", "computed"), 0)).toBe(true);
  });

  it("returns any other unit as it is", () => {
    expect(amountShown(2.345, "pct_per_year", "computed")).toBe(2.345);
  });
});
