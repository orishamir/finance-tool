// The value sheet names every input of a deal's reading, however many fees of one kind the deal holds (values.ts, `inputKey`).
import { describe, expect, it } from "vitest";
import { inputName } from "../provenance-sheets";
import { typed, type Fee } from "../../lib/fee-deal/model";
import { inputKey } from "../../lib/fee-deal/values";
import { feeName } from "./words";

describe("a deal's input names", () => {
  it("names the fifth custody fee of a deal, its bounds and its yearly figure, by the fee's name and its number", () => {
    const fees: Fee[] = Array.from({ length: 5 }, (_, k) => ({ id: `fee-${k}`, kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] }));
    const name = feeName("custody");
    expect(inputName(inputKey(fees, 0))).toBe(`${name} 1`);
    expect(inputName(inputKey(fees, 4))).toBe(`${name} 5`);
    expect(inputName(inputKey(fees, 4, "min"))).toBe(`${name} 5: המינימום`);
    expect(inputName(inputKey(fees, 4, "yearly"))).toBe(`${name} 5, בשנה`);
    expect(inputName(inputKey(fees.slice(0, 1), 0, "max"))).toBe(`${name}: המקסימום`);
  });
  it("leaves a key that is no deal's as written", () => {
    expect(inputName("rate 1")).toBe("rate 1");
    expect(inputName("deal:nothing 2")).toBe("deal:nothing 2");
  });
});
