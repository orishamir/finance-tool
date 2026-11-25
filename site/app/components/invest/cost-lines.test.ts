import { describe, expect, it } from "vitest";
import { legendLines } from "./cost-lines";

describe("the account lines a cost legend names", () => {
  it("names each line any bar draws, in the bars' order, and none that no bar draws", () => {
    // custody costs nothing on every bar, and the conversion is under half a shekel, a whole 0 on the bar
    const lines = [
      { line: "fixed" as const, cost: 120 },
      { line: "trade" as const, cost: 40 },
      { line: "custody" as const, cost: 0 },
      { line: "fx" as const, cost: 0.3 },
      { line: "trade" as const, cost: 55 },
    ];
    expect(legendLines(lines)).toEqual(["trade", "fixed"]);
  });

  it("names a bank's current account under the account fee's item, once, and a line with no colour of its own as \"other\"", () => {
    expect(legendLines([{ line: "account", cost: 300 }, { line: "fixed", cost: 20 }])).toEqual(["fixed"]);
    expect(legendLines([{ line: "deposit", cost: 9 }])).toEqual(["other"]);
  });
});
