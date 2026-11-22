import { describe, expect, it } from "vitest";
import { buildIndicesBundle } from "./providers.server";
import { allPricedPairs } from "./receipt-fixtures";
import { receiptAmounts, sharesOf, takenWords } from "./receipt";

const bundle = buildIndicesBundle();

// a figure's own rounding, worked here apart from the receipt's (wording.md, "Numbers and punctuation"): the step it is shown to, agorot
// under 10 ₪, hundreds from 1,000 ₪ where it rests on an assumed return, whole shekels otherwise
const stepOf = (x: number, assumed: boolean) => (Math.abs(x) < 10 ? 0.01 : assumed && Math.abs(x) >= 1000 ? 100 : 1);
const cents = (x: number) => Math.round(x * 100) || 0;

describe("the receipt's lines keep their own rounding and add up as a reader adds them (method.md F-91)", () => {
  for (const [assumed, label] of [[false, "a return that is no assumption"], [true, "an assumed return"]] as const) {
    for (const [index, years, monthly, returnPct] of [["index-sp500", 10, 500, 7], ["index-ta125", 25, 0, 7], ["index-msci-world", 1, 2000, 7], ["index-sp500", 10, 500, -5], ["index-sp500", 1, 0, 7]] as const) {
      it(`${label}: ${index}, ${years} years, ${monthly} a month at ${returnPct}%`, () => {
        const pcs = allPricedPairs(bundle, index, { years, monthly, returnPct, assumed, ...(years === 1 && monthly === 0 ? { amountNow: 1000 } : {}) });
        expect(pcs.length).toBeGreaterThan(5);
        for (const pc of pcs) {
          const r = receiptAmounts(pc);
          const where = `${pc.providerId} ${pc.fundId}`;
          // every line but the ones that take what the rounding leaves: within half its own step of its value, of the same sign, and never 0
          // where the value shows as more than nothing
          const lines: [string, number, number, boolean][] = [
            ["paid in", r.paidIn, pc.paidIn.value as number, false],
            ["left", r.left, pc.left.value as number, assumed],
            ["tax", r.tax, pc.tax.value as number, assumed],
            ["fund", r.fund, pc.fund.value as number, assumed],
            ["account", r.account, pc.accountFees, assumed],
            ["waiting", r.waiting, pc.waitingN, assumed],
            ...(pc.dealLines ?? pc.account).map((l, i): [string, number, number, boolean] => [`line ${i}`, r.accountLines[i] ?? NaN, l.cost.value as number, assumed]),
          ];
          for (const [name, shown, value, onReturn] of lines) {
            const at = `${where} ${name} ${value}`;
            expect(Math.abs(shown - value), at).toBeLessThanOrEqual(stepOf(value, onReturn) / 2 + 1e-9);
            if (shown !== 0) expect(Math.sign(shown), at).toBe(Math.sign(value));
            if (Math.abs(value) >= 0.005) expect(shown, at).not.toBe(0);
          }
          // the sums, exact as written (to the agora)
          expect(cents(r.paidIn + r.added - r.tax - r.account - r.fund - r.waiting), where).toBe(cents(r.left));
          expect(cents(r.accountLines.reduce((a, x) => a + x, 0) + r.remainder), where).toBe(cents(r.account));
          expect(cents(r.gain), where).toBe(cents(r.left - r.paidIn));
          expect(cents(r.lost), where).toBe(cents(r.tax + r.account + r.fund));
        }
      });
    }
  }
});

describe("in whole units the receipt writes the fees charged as fees and the waiting cash on its own line (F-91, F-109)", () => {
  // the S&P 500 page's plan, 10,000 ₪ now and 500 ₪ a month for 10 years, at a fall and at a rise
  for (const returnPct of [-5, 7]) {
    it(`at ${returnPct}% a year: the account's fees are its lines and a small remainder, the waiting cash ${returnPct < 0 ? "a gain" : "a cost"} apart`, () => {
      const pcs = allPricedPairs(bundle, "index-sp500", { years: 10, monthly: 500, returnPct }).filter((pc) => pc.units);
      expect(pcs.length).toBeGreaterThan(10);
      for (const pc of pcs) {
        const where = `${pc.providerId} ${pc.fundId}`;
        const r = receiptAmounts(pc);
        const lines = pc.account.reduce((a, l) => a + (l.cost.value as number), 0);
        // the fees charged: every line carried, and a remainder that is their interplay, not the waiting cash
        expect(lines, where).toBeGreaterThan(0);
        expect(Math.abs(pc.interaction), where).toBeLessThan(0.15 * lines);
        expect(r.account, where).toBeGreaterThan(0);
        expect(pc.accountFees + pc.waitingN, where).toBeCloseTo(pc.accountCost, 9);
        // the waiting cash missed the fund's move: a rise is a cost, a fall a gain
        if (Math.abs(pc.waitingN) >= 1) expect(Math.sign(pc.waitingN), where).toBe(Math.sign(returnPct));
        // what went on the way is what the tax, the fees and the fund took
        expect(r.lost, where).toBe(r.tax + r.account + r.fund);
      }
    });
  }
  it("Interactive Brokers with the Irish S&P 500 fund at −5%: the account charges what its lines carried, and the waiting cash's gain stays out of it", () => {
    const pc = allPricedPairs(bundle, "index-sp500", { years: 10, monthly: 500, returnPct: -5 }).find((x) => x.providerId === "interactive-brokers" && x.fundId === "ie00b5bmr087");
    // the pair is in whole units while the house's record says nothing of selling that listing by amount (F-109); a record that does moves the case
    expect(pc?.units, "the pair is no longer bought in whole units: pick another").toBeTruthy();
    const r = receiptAmounts(pc!);
    const lines = pc!.account.reduce((a, l) => a + (l.cost.value as number), 0);
    expect(r.account).toBe(Math.round(lines + pc!.interaction));
    expect(Math.abs(pc!.interaction)).toBeLessThan(1);
    expect(r.waiting).toBeLessThan(0);
    // the account's whole part (F-91) is the fees and the waiting cash together, below the fees by the waiting cash's gain
    expect(Math.abs(Math.round(pc!.accountCost) - (r.account + r.waiting))).toBeLessThanOrEqual(1);
    expect(pc!.accountCost).toBeLessThan(r.account);
  });
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
