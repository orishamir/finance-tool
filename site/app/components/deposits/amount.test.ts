// The deposits page's amount in the address, read by the amount field's own rules: what the field would refuse typed is said wrong, never
// read as the start amount in silence.
import { describe, expect, it } from "vitest";
import { amountFromAddress } from "./browser";

const data = { start: 10_000, amountMax: 1_000_000_000 };
const read = (param: string | null) => amountFromAddress(param, data);

describe("the deposits page's amount in the address", () => {
  it("is the start amount when the address has none, and no amount for an empty field", () => {
    expect(read(null)).toEqual({ kind: "number", n: 10_000 });
    expect(read("none")).toEqual({ kind: "empty" });
  });
  it("reads a whole amount as the field does, separators included", () => {
    expect(read("250000")).toEqual({ kind: "number", n: 250_000 });
    expect(read("1,000")).toEqual({ kind: "number", n: 1_000 });
  });
  for (const bad of ["abc", "-5000", "0", "2.5", "1e9", "1.000", "99999999999999999999", "1000000001"])
    it(`says "${bad}" is wrong rather than show another amount`, () => expect(read(bad).kind).toBe("wrong"));
});
