import { describe, expect, it } from "vitest";
import { buildIndicesBundle } from "./providers.server";
import { allPricedPairs } from "./receipt-fixtures";
import { receiptAmounts, receiptChain, takenWords } from "./receipt";
import type { PairCosts } from "./invest";
import type { SiteValue } from "./value";

const bundle = buildIndicesBundle();

describe("the receipt's lines add up as a reader adds them", () => {
  for (const [index, years, monthly] of [["index-sp500", 10, 500], ["index-ta125", 25, 0], ["index-msci-world", 1, 2000]] as const) {
    it(`${index}, ${years} years, ${monthly} a month: paid in + added − tax − account − fund = left, at every account`, () => {
      const pcs = allPricedPairs(bundle, index, { years, monthly });
      expect(pcs.length).toBeGreaterThan(5);
      for (const pc of pcs) {
        const r = receiptAmounts(pc);
        const where = `${pc.providerId} ${pc.fundId}`;
        expect(r.paidIn + r.added - r.tax - r.account - r.fund - r.waiting, where).toBe(r.left);
        expect(r.accountLines.reduce((a, x) => a + x, 0) + r.remainder, where).toBe(r.account);
        // the account's figure is its fees, the waiting cash beside them; every figure is its own rounding within a shekel
        expect(r.account, where).toBe(Math.round(pc.accountFees));
        expect(r.waiting, where).toBe(Math.round(pc.waitingN));
        expect(r.left, where).toBe(Math.round(pc.left.value as number));
        expect(Math.abs(r.tax - (pc.tax.value as number)), where).toBeLessThan(2);
        expect(Math.abs(r.fund - (pc.fund.value as number)), where).toBeLessThan(2);
        expect(r.gain, where).toBe(r.left - r.paidIn);
      }
    });
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
        // the fees charged: every line carried, and a remainder that is their interplay, not the waiting cash. The remainder is measured
        // against the account's whole part before tax (its lines, the remainder and the waiting cash, F-91): bought every few months (F-133),
        // a house's trade line shrinks while its remainder, custody on the money the other fees took, does not, so against the lines alone
        // the share rises though the remainder itself is smaller (Excellence, whose largest line is its monthly fee)
        expect(lines, where).toBeGreaterThan(0);
        expect(Math.abs(pc.interaction), where).toBeLessThan(0.15 * (lines + pc.interaction + pc.waitingN));
        expect(r.account, where).toBeGreaterThan(0);
        expect(pc.accountFees + pc.waitingN, where).toBeCloseTo(pc.accountCost, 9);
        // the waiting cash missed the fund's move: a rise is a cost, a fall a gain
        if (Math.abs(pc.waitingN) >= 1) expect(Math.sign(pc.waitingN), where).toBe(Math.sign(returnPct));
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

describe("the receipt as written: the shekels of the horizon down to the value before tax, then the inflation, then the tax in today's money (F-129, F-130)", () => {
  for (const [index, years, monthly, returnPct] of [["index-sp500", 10, 500, 7], ["index-sp500", 10, 500, -5], ["index-ta125", 25, 0, 7], ["index-msci-world", 1, 2000, 7]] as const) {
    it(`${index}, ${years} years, ${monthly} a month, at ${returnPct}%: paid in + added − account − fund − waiting − inflation − tax = left, at every account`, () => {
      const pcs = allPricedPairs(bundle, index, { years, monthly, returnPct });
      expect(pcs.length).toBeGreaterThan(5);
      for (const pc of pcs) {
        const where = `${pc.providerId} ${pc.fundId}`;
        const ch = receiptChain(pc);
        const n = ch.nominal;
        const real = receiptAmounts(pc);
        const I = pc.index.value as number;
        // the chain adds up in whole shekels to the same figure the receipt in today's money ends on
        expect(n.paidIn + n.added - n.account - n.fund - n.waiting, where).toBe(ch.beforeTax);
        expect(ch.beforeTax - ch.inflation - ch.tax, where).toBe(ch.left);
        expect(ch.left, where).toBe(real.left);
        expect(ch.left, where).toBe(Math.round(pc.left.value as number));
        // the deposits are as paid (F-05), every cost line before the inflation is F-91's figure times I_T, each within a shekel
        expect(n.paidIn, where).toBe(Math.round(pc.paidInNominal.value as number));
        expect(n.account, where).toBe(Math.round(pc.accountFees * I));
        expect(Math.abs(n.fund - (pc.fund.value as number) * I), where).toBeLessThan(2);
        // the tax is in today's money, after the inflation: F-91's state, not the state times I_T
        expect(ch.tax, where).toBe(real.tax);
        expect(Math.abs(ch.tax - (pc.tax.value as number)), where).toBeLessThan(2);
        // on the collected data, the inflation stays within a few shekels of B^real × (I_T − 1): each whole figure is its own rounding
        const beforeTaxToday = (pc.left.value as number) + (pc.tax.value as number);
        expect(Math.abs(ch.inflation - beforeTaxToday * (I - 1)), where).toBeLessThan(3);
      }
    });
  }
});

describe("a zero tax takes no rounding", () => {
  it("the shekel the whole figures leave goes to the fund, never a +1 ₪ or −1 ₪ on a tax of zero", () => {
    const n = (value: number) => ({ value }) as SiteValue;
    // the whole figures leave 102 ₪ for the fund and the tax, the fund being 100.4 ₪ and the tax 0, and on the other side 99 ₪
    // the engine's tax on a gain of zero is float dust around 0, never exactly 0
    for (const [left, fund, dust] of [[898.4, 100.4, 0], [901.4, 100.4, 0], [898.4, 100.4, 1e-11], [901.4, 100.4, -1e-11]] as const) {
      const pc = { paidIn: n(500), base: 1000.4, left: n(left), accountFees: 0, waitingN: 0, account: [], dealLines: undefined, interaction: 0, fund: n(fund), tax: n(dust) } as unknown as PairCosts;
      const r = receiptAmounts(pc);
      expect(r.tax).toBe(0);
      expect(r.fund).toBe(Math.round(1000.4) - Math.round(left));
    }
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
