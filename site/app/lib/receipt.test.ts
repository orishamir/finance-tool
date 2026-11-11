import { describe, expect, it } from "vitest";
import { buildIndicesBundle } from "./providers.server";
import { allPricedPairs } from "./receipt-fixtures";
import { receiptAmounts, sharesOf, takenWords } from "./receipt";
import { accountWhole } from "./invest";

const bundle = buildIndicesBundle();

describe("the receipt's lines add up as a reader adds them", () => {
  for (const [index, years, monthly] of [["index-sp500", 10, 500], ["index-ta125", 25, 0], ["index-msci-world", 1, 2000]] as const) {
    it(`${index}, ${years} years, ${monthly} a month: paid in + added − tax − account − fund = left, at every account`, () => {
      const pcs = allPricedPairs(bundle, index, { years, monthly });
      expect(pcs.length).toBeGreaterThan(5);
      for (const pc of pcs) {
        const r = receiptAmounts(pc);
        const where = `${pc.providerId} ${pc.fundId}`;
        expect(r.paidIn + r.added - r.tax - r.account - r.fund, where).toBe(r.left);
        expect(r.accountLines.reduce((a, x) => a + x, 0) + r.remainder, where).toBe(r.account);
        // the account's figure is the account list's, and every figure is its own rounding within a shekel
        expect(r.account, where).toBe(accountWhole(pc));
        expect(r.left, where).toBe(Math.round(pc.left.value as number));
        expect(Math.abs(r.tax - (pc.tax.value as number)), where).toBeLessThan(2);
        expect(Math.abs(r.fund - (pc.fund.value as number)), where).toBeLessThan(2);
        expect(r.gain, where).toBe(r.left - r.paidIn);
        expect(r.lost, where).toBe(r.tax + r.account + r.fund);
      }
    });
  }
});

describe("shares of a bar add up to 100", () => {
  it("largest remainder, nothing for a part at or under zero", () => {
    expect(sharesOf([5703, 1057, 116])).toEqual([83, 15, 2]);
    expect(sharesOf([1, 1, 1]).reduce((a, x) => a + x, 0)).toBe(100);
    expect(sharesOf([10, -3, 0])).toEqual([100, 0, 0]);
    expect(sharesOf([0, 0])).toEqual([0, 0]);
  });
});

describe("a cost line's amount reads as what it did to the money", () => {
  it("taken: a true minus; under zero (given back): a plus, never a cost; zero: no sign", () => {
    const bare = (x: string) => x.replace(/[\u2066\u2069]/g, "");
    expect(bare(takenWords(1057))).toBe("−1,057 ₪");
    expect(bare(takenWords(-3))).toBe("+3 ₪");
    expect(bare(takenWords(0))).toBe("0 ₪");
    // isolated, so the sign keeps its side inside Hebrew
    expect(takenWords(-3).startsWith("\u2066")).toBe(true);
  });
});
