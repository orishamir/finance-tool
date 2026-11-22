// The rates entered on the guide pages: the store reads a bare number as a rate and keeps an object's other fields, and the export file
// carries the store.
import { describe, expect, it } from "vitest";
import { parseOwnRates, termsOfGoal } from "./own-rate";
import { readSideFile } from "./side-stores";

describe("own terms store shape", () => {
  it("reads the old numbers as rates and keeps rate, fee and provider side by side; a malformed value or id is dropped", () => {
    const stored = parseOwnRates({ g1: { "bank-deposit": 3.5, "brokerage-account": { fee: 0.1, provider: "psagot" }, x: { rate: 2, fee: 1 }, bad: { fee: 400 }, b: { provider: "../x" } } });
    expect(stored.g1).toEqual({ "bank-deposit": 3.5, "brokerage-account": { fee: 0.1, provider: "psagot" }, x: { rate: 2, fee: 1 } });
    expect(termsOfGoal(stored.g1)).toEqual({ "bank-deposit": { rate: 3.5 }, "brokerage-account": { fee: 0.1, provider: "psagot" }, x: { rate: 2, fee: 1 } });
  });
  it("travels in the export file, and a file without it still reads", () => {
    const { side, problems } = readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {}, ownRates: { g1: { "bank-deposit": { rate: 3, provider: "psagot" } } } });
    expect(problems).toEqual([]);
    expect(side?.ownRates.g1?.["bank-deposit"]).toEqual({ rate: 3, provider: "psagot" });
    expect(readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {} }).side?.ownRates).toEqual({});
  });
});
